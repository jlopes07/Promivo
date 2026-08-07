import { marketplaceService } from '../services/MarketplaceService.js';

export class SearchController {
  static async search(req, res, next) {
    try {
      const query = req.query.q || req.query.query;
      const marketplace = req.query.marketplace || 'mercadolivre';
      const category = req.query.category;
      const limit = parseInt(req.query.limit || '20', 10);

      if (!query && !category) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_PARAM',
            message: 'O parâmetro "q" (pesquisa) ou "category" é obrigatório.'
          }
        });
      }

      let products = [];
      if (query) {
        products = await marketplaceService.searchProducts(query, marketplace, { limit });
      } else {
        products = await marketplaceService.searchByCategory(category, marketplace, { limit });
      }

      return res.json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error) {
      next(error);
    }
  }
}
