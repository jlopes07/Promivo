/**
 * Centralized Granular Permissions Definition
 */
export const PERMISSIONS = {
  // Users Management
  USERS_READ: 'users:read',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_ACTIVATE: 'users:activate',
  USERS_RESET_PASSWORD: 'users:reset_password',
  USERS_MANAGE_ROLES: 'users:manage_roles',
  USERS_MANAGE_OWNER: 'users:manage_owner', // Exclusive to Owner

  // Offers Management
  OFFERS_READ: 'offers:read',
  OFFERS_CREATE: 'offers:create',
  OFFERS_UPDATE_OWN: 'offers:update_own',
  OFFERS_UPDATE_ALL: 'offers:update_all',
  OFFERS_DELETE_OWN: 'offers:delete_own',
  OFFERS_DELETE_ALL: 'offers:delete_all',
  OFFERS_FEATURE: 'offers:feature',
  OFFERS_APPROVE: 'offers:approve',

  // Categories & Products
  CATEGORIES_MANAGE: 'categories:manage',
  PRODUCTS_MANAGE: 'products:manage',

  // Settings & System
  SETTINGS_MANAGE: 'settings:manage',
  SETTINGS_CRITICAL: 'settings:critical',
  LOGS_VIEW: 'logs:view'
};
