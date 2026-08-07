import { Router } from 'express';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { requirePermission } from '../middlewares/permissionMiddleware.js';
import { PERMISSIONS } from '../permissions/permissions.js';
import { AdminUserController } from '../controllers/AdminUserController.js';
import { LogController } from '../controllers/LogController.js';

export const adminRouter = Router();

// Protect ALL admin routes with requireAuth middleware
adminRouter.use(requireAuth);

// User Management Routes
adminRouter.get('/users', requirePermission(PERMISSIONS.USERS_READ), AdminUserController.list);
adminRouter.post('/users', requirePermission(PERMISSIONS.USERS_CREATE), AdminUserController.create);
adminRouter.put('/users/:id', requirePermission(PERMISSIONS.USERS_UPDATE), AdminUserController.update);
adminRouter.put('/users/:id/activate', requirePermission(PERMISSIONS.USERS_ACTIVATE), AdminUserController.activate);
adminRouter.put('/users/:id/deactivate', requirePermission(PERMISSIONS.USERS_ACTIVATE), AdminUserController.deactivate);
adminRouter.put('/users/:id/reset-password', requirePermission(PERMISSIONS.USERS_RESET_PASSWORD), AdminUserController.resetPassword);
adminRouter.put('/users/:id/role', requirePermission(PERMISSIONS.USERS_MANAGE_ROLES), AdminUserController.update);
adminRouter.delete('/users/:id', requirePermission(PERMISSIONS.USERS_DELETE), AdminUserController.delete);

// Audit Logs Route
adminRouter.get('/logs', requirePermission(PERMISSIONS.LOGS_VIEW), LogController.list);
