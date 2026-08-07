import { BaseMarketplaceAdapter } from './BaseMarketplaceAdapter.js';
import { StandardProduct } from '../models/StandardProduct.js';

export class ShopeeAdapter extends BaseMarketplaceAdapter {
  constructor() {
    super('Shopee');
  }

  async searchProducts(query, options = {}) {
    return [
      new StandardProduct({
        id: `SHP-${Date.now()}`,
        marketplace: 'Shopee',
        title: `Shopee - ${query}`,
        description: 'Integração Shopee Open Platform pronta para chaves de API.',
        category: 'Geral',
        price: 49.90,
        oldPrice: 89.90,
        url: 'https://shopee.com.br',
        affiliateUrl: 'https://shopee.com.br'
      }).toJSON()
    ];
  }

  async searchByCategory(category) { return []; }
  async getProductDetails(productId) {
    return new StandardProduct({ id: productId, marketplace: 'Shopee' }).toJSON();
  }
}
