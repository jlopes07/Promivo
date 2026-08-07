import { BaseMarketplaceAdapter } from './BaseMarketplaceAdapter.js';
import { StandardProduct } from '../models/StandardProduct.js';

export class KabumAdapter extends BaseMarketplaceAdapter {
  constructor() { super('Kabum'); }
  async searchProducts(query) {
    return [new StandardProduct({ id: `KBM-${Date.now()}`, marketplace: 'Kabum', title: `KaBuM! - ${query}`, price: 350.00 }).toJSON()];
  }
  async searchByCategory(category) { return []; }
  async getProductDetails(productId) { return new StandardProduct({ id: productId, marketplace: 'Kabum' }).toJSON(); }
}
