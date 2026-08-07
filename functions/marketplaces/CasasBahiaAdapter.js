import { BaseMarketplaceAdapter } from './BaseMarketplaceAdapter.js';
import { StandardProduct } from '../models/StandardProduct.js';

export class CasasBahiaAdapter extends BaseMarketplaceAdapter {
  constructor() { super('CasasBahia'); }
  async searchProducts(query) {
    return [new StandardProduct({ id: `CB-${Date.now()}`, marketplace: 'CasasBahia', title: `Casas Bahia - ${query}`, price: 299.00 }).toJSON()];
  }
  async searchByCategory(category) { return []; }
  async getProductDetails(productId) { return new StandardProduct({ id: productId, marketplace: 'CasasBahia' }).toJSON(); }
}
