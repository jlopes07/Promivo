import { StandardProduct } from '../models/StandardProduct.js';

/**
 * Base Marketplace Adapter Interface / Abstract Class
 * All marketplace adapters MUST extend this class and implement its standard interface methods.
 */
export class BaseMarketplaceAdapter {
  constructor(name = 'BaseMarketplace') {
    this.name = name;
  }

  /**
   * Search products by keyword query
   * @param {string} query
   * @param {object} options
   * @returns {Promise<StandardProduct[]>}
   */
  async searchProducts(query, options = {}) {
    throw new Error(`[Adapter Error] Method searchProducts not implemented in ${this.name}`);
  }

  /**
   * Search products by category
   * @param {string} categoryNameOrId
   * @param {object} options
   * @returns {Promise<StandardProduct[]>}
   */
  async searchByCategory(categoryNameOrId, options = {}) {
    throw new Error(`[Adapter Error] Method searchByCategory not implemented in ${this.name}`);
  }

  /**
   * Get product details by ID
   * @param {string} productId
   * @returns {Promise<StandardProduct>}
   */
  async getProductDetails(productId) {
    throw new Error(`[Adapter Error] Method getProductDetails not implemented in ${this.name}`);
  }
}
