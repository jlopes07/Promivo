import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { ROLES, ROLE_PERMISSIONS } from '../permissions/roles.js';
import { AuditLogger } from '../services/AuditLogger.js';

export class AdminUserController {
  /**
   * List all users
   */
  static async list(req, res, next) {
    try {
      const db = getFirestore();
      const snapshot = await db.collection('users').get();
      const users = [];
      snapshot.forEach(doc => users.push({ id: doc.id, ...doc.data() }));

      return res.json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new user via Firebase Admin SDK
   */
  static async create(req, res, next) {
    try {
      const { email, password, name, role = ROLES.AFFILIATE, customPermissions = [] } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ success: false, error: { message: 'E-mail, senha e nome são obrigatórios.' } });
      }

      // Check owner protection: Only Owner can create another Owner
      if (role === ROLES.OWNER && req.userProfile.role !== ROLES.OWNER) {
        return res.status(403).json({
          success: false,
          error: { message: 'Apenas o Proprietário (Owner) pode atribuir o perfil Owner.' }
        });
      }

      // 1. Create user in Firebase Authentication
      const userRecord = await getAuth().createUser({
        email,
        password,
        displayName: name,
        emailVerified: true
      });

      // Default permissions from role + custom
      const initialPermissions = Array.from(new Set([
        ...(ROLE_PERMISSIONS[role] || []),
        ...(Array.isArray(customPermissions) ? customPermissions : [])
      ]));

      // 2. Create user document in Firestore 'users/{uid}'
      const db = getFirestore();
      const userDoc = {
        uid: userRecord.uid,
        name,
        email,
        role,
        permissions: initialPermissions,
        active: true,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        lastLogin: null
      };

      await db.collection('users').doc(userRecord.uid).set(userDoc);

      // 3. Log Audit Record
      await AuditLogger.log(req, {
        action: 'USER_CREATE',
        targetId: userRecord.uid,
        targetEmail: email,
        details: { role, permissions: initialPermissions }
      });

      return res.status(201).json({
        success: true,
        data: userDoc
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update User Profile & Permissions
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, role, permissions, active } = req.body;
      const db = getFirestore();

      const targetDocRef = db.collection('users').doc(id);
      const targetSnapshot = await targetDocRef.get();

      if (!targetSnapshot.exists) {
        return res.status(404).json({ success: false, error: { message: 'Usuário não encontrado.' } });
      }

      const targetData = targetSnapshot.data();

      // Owner Protection: No non-Owner can modify an Owner account
      if (targetData.role === ROLES.OWNER && req.userProfile.role !== ROLES.OWNER) {
        return res.status(403).json({
          success: false,
          error: { message: 'Operação negada: Apenas um Owner pode alterar dados de outro Owner.' }
        });
      }

      // Prevent non-Owner from promoting any user to Owner
      if (role === ROLES.OWNER && req.userProfile.role !== ROLES.OWNER) {
        return res.status(403).json({
          success: false,
          error: { message: 'Operação negada: Você não possui autorização para promover usuários a Owner.' }
        });
      }

      const updates = {
        updatedAt: FieldValue.serverTimestamp()
      };

      if (name !== undefined) updates.name = name;
      if (role !== undefined) updates.role = role;
      if (permissions !== undefined && Array.isArray(permissions)) updates.permissions = permissions;
      if (active !== undefined && typeof active === 'boolean') updates.active = active;

      await targetDocRef.update(updates);

      // Update Display Name in Auth if name changed
      if (name) {
        await getAuth().updateUser(id, { displayName: name }).catch(() => {});
      }

      await AuditLogger.log(req, {
        action: 'USER_UPDATE',
        targetId: id,
        targetEmail: targetData.email,
        details: updates
      });

      return res.json({
        success: true,
        message: 'Usuário atualizado com sucesso.'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Activate User
   */
  static async activate(req, res, next) {
    try {
      const { id } = req.params;
      const db = getFirestore();

      await db.collection('users').doc(id).update({
        active: true,
        updatedAt: FieldValue.serverTimestamp()
      });

      await AuditLogger.log(req, { action: 'USER_ACTIVATE', targetId: id });
      return res.json({ success: true, message: 'Usuário ativado com sucesso.' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deactivate User
   */
  static async deactivate(req, res, next) {
    try {
      const { id } = req.params;
      const db = getFirestore();

      const targetDoc = await db.collection('users').doc(id).get();
      if (targetDoc.exists && targetDoc.data().role === ROLES.OWNER) {
        return res.status(403).json({ success: false, error: { message: 'Não é possível desativar um usuário Owner.' } });
      }

      await db.collection('users').doc(id).update({
        active: false,
        updatedAt: FieldValue.serverTimestamp()
      });

      await AuditLogger.log(req, { action: 'USER_DEACTIVATE', targetId: id });
      return res.json({ success: true, message: 'Usuário desativado com sucesso.' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset Password
   */
  static async resetPassword(req, res, next) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ success: false, error: { message: 'A nova senha deve possuir pelo menos 6 caracteres.' } });
      }

      await getAuth().updateUser(id, { password: newPassword });

      await AuditLogger.log(req, { action: 'USER_RESET_PASSWORD', targetId: id });
      return res.json({ success: true, message: 'Senha redefinida com sucesso.' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete User
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const db = getFirestore();

      const targetDoc = await db.collection('users').doc(id).get();
      if (targetDoc.exists && targetDoc.data().role === ROLES.OWNER) {
        return res.status(403).json({ success: false, error: { message: 'Não é possível excluir um usuário Owner.' } });
      }

      // Delete from Auth
      await getAuth().deleteUser(id).catch(() => {});
      // Delete from Firestore
      await db.collection('users').doc(id).delete();

      await AuditLogger.log(req, { action: 'USER_DELETE', targetId: id });
      return res.json({ success: true, message: 'Usuário excluído permanentemente.' });
    } catch (error) {
      next(error);
    }
  }
}
