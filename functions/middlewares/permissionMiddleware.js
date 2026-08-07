import { PermissionService } from '../permissions/permissionService.js';
import { ROLES } from '../permissions/roles.js';

/**
 * Middleware factory enforcing specific granular permission via PermissionService.hasPermission
 */
export function requirePermission(requiredPermission) {
  return (req, res, next) => {
    if (!req.userProfile) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Requer autenticação.' } });
    }

    const hasAccess = PermissionService.hasPermission(req.userProfile, requiredPermission);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: `Acesso negado: Você não possui a permissão necessária (${requiredPermission}).` }
      });
    }

    next();
  };
}

/**
 * Role-based middleware helper
 */
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.userProfile) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Requer autenticação.' } });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!roles.includes(req.userProfile.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Seu perfil de acesso não tem permissão para executar esta ação.' }
      });
    }

    next();
  };
}

export const requireOwner = requireRole([ROLES.OWNER]);
export const requireAdmin = requireRole([ROLES.OWNER, ROLES.ADMIN]);
export const requireManager = requireRole([ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER]);
export const requireAffiliate = requireRole([ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.AFFILIATE]);
