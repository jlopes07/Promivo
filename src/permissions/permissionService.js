import { ROLE_PERMISSIONS } from './roles.js';

export class PermissionService {
  /**
   * Centralized permission check. Never compare role == 'admin' directly!
   */
  static hasPermission(user, requiredPermission) {
    if (!user || user.active === false) return false;

    // Check custom explicit permissions
    if (Array.isArray(user.permissions) && user.permissions.includes(requiredPermission)) {
      return true;
    }

    // Check role default permissions
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(requiredPermission);
  }
}
