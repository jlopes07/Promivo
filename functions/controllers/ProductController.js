import { marketplaceService } from '../services/MarketplaceService.js';

export class ProductController {
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const marketplace = req.query.marketplace || 'mercadolivre';

      if (!id) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_ID', message: 'ID do produto é obrigatório.' }
        });
      }

      const product = await marketplaceService.getProductDetails(id, marketplace);

      return res.json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }
}
