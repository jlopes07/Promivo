import { BaseMarketplaceAdapter } from './BaseMarketplaceAdapter.js';
import { StandardProduct } from '../models/StandardProduct.js';

export class MagaluAdapter extends BaseMarketplaceAdapter {
  constructor() { super('Magalu'); }
  async searchProducts(query) {
    return [new StandardProduct({ id: `MGL-${Date.now()}`, marketplace: 'Magalu', title: `Magalu - ${query}`, price: 150.00 }).toJSON()];
  }
  async searchByCategory(category) { return []; }
  async getProductDetails(productId) { return new StandardProduct({ id: productId, marketplace: 'Magalu' }).toJSON(); }
}
