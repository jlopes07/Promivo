import { BaseMarketplaceAdapter } from './BaseMarketplaceAdapter.js';
import { StandardProduct } from '../models/StandardProduct.js';
import { CategoryMapperService } from '../services/CategoryMapperService.js';
import { fetchWithRetry } from '../utils/httpClient.js';
import { config } from '../config/environment.js';

export class MercadoLivreAdapter extends BaseMarketplaceAdapter {
  constructor() {
    super('MercadoLivre');
    this.baseUrl = config.marketplaces.mercadolivre.baseUrl;
    this.siteId = config.marketplaces.mercadolivre.siteId;
  }

  async searchProducts(query, options = {}) {
    const limit = options.limit || 20;
    const url = `${this.baseUrl}/sites/${this.siteId}/search`;

    const data = await fetchWithRetry(url, {
      params: {
        q: query,
        limit
      }
    });

    const results = data.results || [];
    return results.map(item => this.normalizeItem(item));
  }

  async searchByCategory(categoryNameOrId, options = {}) {
    const limit = options.limit || 20;
    const url = `${this.baseUrl}/sites/${this.siteId}/search`;

    const data = await fetchWithRetry(url, {
      params: {
        category: categoryNameOrId,
        limit
      }
    });

    const results = data.results || [];
    return results.map(item => this.normalizeItem(item));
  }

  async getProductDetails(productId) {
    const url = `${this.baseUrl}/items/${productId}`;
    const itemData = await fetchWithRetry(url);

    // Optionally fetch description
    let description = '';
    try {
      const descData = await fetchWithRetry(`${this.baseUrl}/items/${productId}/description`);
      description = descData.plain_text || descData.text || '';
    } catch (e) {
      // Description is optional
    }

    return this.normalizeItem(itemData, description);
  }

  /**
   * Converts Mercado Livre API JSON response to StandardProduct
   */
  normalizeItem(item, fullDescription = '') {
    const highResImg = item.pictures && item.pictures.length > 0 
      ? item.pictures[0].secure_url || item.pictures[0].url 
      : (item.thumbnail ? item.thumbnail.replace('-I.jpg', '-O.jpg') : '');

    const images = item.pictures && item.pictures.length > 0
      ? item.pictures.map(p => p.secure_url || p.url)
      : [highResImg];

    // Extract Brand from attributes if available
    let brand = '';
    if (item.attributes && Array.isArray(item.attributes)) {
      const brandAttr = item.attributes.find(a => a.id === 'BRAND');
      if (brandAttr) brand = brandAttr.value_name;
    }

    const categoryMapped = CategoryMapperService.mapToInternalCategory(
      item.category_id || '', 
      'mercadolivre'
    );

    return new StandardProduct({
      id: item.id,
      marketplace: 'MercadoLivre',
      title: item.title,
      description: fullDescription || item.subtitle || '',
      brand,
      category: categoryMapped,
      price: item.price,
      oldPrice: item.original_price || item.base_price || null,
      currency: item.currency_id || 'BRL',
      images,
      seller: item.seller?.nickname || item.seller_address?.city?.name || 'Mercado Livre Seller',
      condition: item.condition || 'new',
      available: item.available_quantity > 0 || item.status === 'active',
      url: item.permalink,
      affiliateUrl: item.permalink,
      createdAt: item.stop_time || new Date().toISOString()
    }).toJSON();
  }
}
