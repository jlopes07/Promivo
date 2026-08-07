import { BaseMarketplaceAdapter } from './BaseMarketplaceAdapter.js';
import { StandardProduct } from '../models/StandardProduct.js';

export class AmazonAdapter extends BaseMarketplaceAdapter {
  constructor() {
    super('Amazon');
  }

  async searchProducts(query, options = {}) {
    // Stub ready for Amazon PA API 5.0 integration
    return [
      new StandardProduct({
        id: `AMZ-${Date.now()}`,
        marketplace: 'Amazon',
        title: `Amazon - ${query}`,
        description: 'Integração Amazon PA API 5.0 pronta para chaves de API.',
        category: 'Eletrônicos',
        price: 199.90,
        oldPrice: 299.90,
        url: 'https://www.amazon.com.br',
        affiliateUrl: 'https://www.amazon.com.br'
      }).toJSON()
    ];
  }

  async searchByCategory(category) {
    return [];
  }

  async getProductDetails(productId) {
    return new StandardProduct({
      id: productId,
      marketplace: 'Amazon',
      title: 'Produto Amazon',
      price: 100.00
    }).toJSON();
  }
}
