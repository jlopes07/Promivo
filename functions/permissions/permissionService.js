import { ROLE_PERMISSIONS, ROLES } from './roles.js';

export class PermissionService {
  /**
   * Evaluates if a user has a specific permission.
   * Never compare role == 'admin' directly. Always call hasPermission!
   */
  static hasPermission(user, requiredPermission) {
    if (!user || user.active === false) return false;

    // Check custom permissions list stored in user document
    if (Array.isArray(user.permissions) && user.permissions.includes(requiredPermission)) {
      return true;
    }

    // Check role permissions list
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(requiredPermission);
  }

  /**
   * Gets all permissions for a user (combining role defaults + custom permissions)
   */
  static getUserPermissions(user) {
    if (!user || user.active === false) return [];
    const roleDefault = ROLE_PERMISSIONS[user.role] || [];
    const custom = Array.isArray(user.permissions) ? user.permissions : [];
    return Array.from(new Set([...roleDefault, ...custom]));
  }
}
