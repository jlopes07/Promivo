import { Router } from 'express';
import { SearchController } from '../controllers/SearchController.js';
import { ProductController } from '../controllers/ProductController.js';
import { CategoryController } from '../controllers/CategoryController.js';
import { OfferController } from '../controllers/OfferController.js';
import { adminRouter } from './adminRouter.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { requirePermission } from '../middlewares/permissionMiddleware.js';
import { PERMISSIONS } from '../permissions/permissions.js';

export const apiRouter = Router();

// Mount Admin Router
apiRouter.use('/admin', adminRouter);

// Public Marketplace & Content Search Endpoints
apiRouter.get('/search', SearchController.search);
apiRouter.get('/product/:id', ProductController.getById);
apiRouter.get('/categories', CategoryController.list);

// Promivo Public Offers Endpoints
apiRouter.get('/offers', OfferController.list);
apiRouter.get('/offers/latest', OfferController.latest);
apiRouter.get('/offers/highlights', OfferController.highlights);

// Protected Offers Operations (Requires Auth & Permission)
apiRouter.post('/offers', requireAuth, requirePermission(PERMISSIONS.OFFERS_CREATE), OfferController.create);
apiRouter.put('/offers/:id', requireAuth, requirePermission(PERMISSIONS.OFFERS_UPDATE_ALL), OfferController.update);
apiRouter.delete('/offers/:id', requireAuth, requirePermission(PERMISSIONS.OFFERS_DELETE_ALL), OfferController.remove);
