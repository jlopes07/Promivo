import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from '../utils/logger.js';

/**
 * Authentication Middleware (requireAuth)
 * 1. Verifies Bearer ID Token using Firebase Admin SDK.
 * 2. Fetches user document from Firestore 'users/{uid}'.
 * 3. Validates document exists and active === true.
 * 4. Attaches req.user and req.userProfile.
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Token de autenticação não fornecido ou inválido.' }
      });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);

    // Fetch user doc from Firestore
    const db = getFirestore();
    const userDocRef = db.collection('users').doc(decodedToken.uid);
    const userSnapshot = await userDocRef.get();

    if (!userSnapshot.exists) {
      logger.warn(`Tentativa de acesso com usuário sem documento no Firestore: ${decodedToken.email}`);
      return res.status(403).json({
        success: false,
        error: { code: 'USER_DOC_NOT_FOUND', message: 'Cadastro de usuário não localizado no sistema.' }
      });
    }

    const userProfile = userSnapshot.data();

    // Check active status
    if (userProfile.active === false) {
      logger.warn(`Tentativa de acesso com conta desativada: ${decodedToken.email}`);
      return res.status(403).json({
        success: false,
        error: { code: 'USER_INACTIVE', message: 'Sua conta está desativada. Entre em contato com o suporte.' }
      });
    }

    req.user = decodedToken;
    req.userProfile = { uid: decodedToken.uid, ...userProfile };

    next();
  } catch (error) {
    logger.error(`[requireAuth Error] ${error.message}`);
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Sessão expirada ou inválida. Por favor, faça login novamente.' }
    });
  }
}
