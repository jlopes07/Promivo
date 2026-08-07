import { BaseMarketplaceAdapter } from './BaseMarketplaceAdapter.js';
import { StandardProduct } from '../models/StandardProduct.js';

export class AliExpressAdapter extends BaseMarketplaceAdapter {
  constructor() {
    super('AliExpress');
  }

  async searchProducts(query, options = {}) {
    return [
      new StandardProduct({
        id: `ALI-${Date.now()}`,
        marketplace: 'AliExpress',
        title: `AliExpress - ${query}`,
        description: 'Integração AliExpress Affiliate API pronta.',
        price: 79.90,
        url: 'https://best.aliexpress.com'
      }).toJSON()
    ];
  }

  async searchByCategory(category) { return []; }
  async getProductDetails(productId) {
    return new StandardProduct({ id: productId, marketplace: 'AliExpress' }).toJSON();
  }
}
