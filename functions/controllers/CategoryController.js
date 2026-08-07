import { INTERNAL_CATEGORIES } from '../services/CategoryMapperService.js';

export class CategoryController {
  static async list(req, res, next) {
    try {
      return res.json({
        success: true,
        count: INTERNAL_CATEGORIES.length,
        data: INTERNAL_CATEGORIES.map(name => ({
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-')
        }))
      });
    } catch (error) {
      next(error);
    }
  }
}
