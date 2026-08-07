import { MercadoLivreAdapter } from '../marketplaces/MercadoLivreAdapter.js';
import { AmazonAdapter } from '../marketplaces/AmazonAdapter.js';
import { ShopeeAdapter } from '../marketplaces/ShopeeAdapter.js';
import { AliExpressAdapter } from '../marketplaces/AliExpressAdapter.js';
import { MagaluAdapter } from '../marketplaces/MagaluAdapter.js';
import { KabumAdapter } from '../marketplaces/KabumAdapter.js';
import { CasasBahiaAdapter } from '../marketplaces/CasasBahiaAdapter.js';
import { cacheService } from './CacheService.js';
import { logger } from '../utils/logger.js';

export class MarketplaceService {
  constructor() {
    this.adapters = new Map();
    this.registerAdapter('mercadolivre', new MercadoLivreAdapter());
    this.registerAdapter('amazon', new AmazonAdapter());
    this.registerAdapter('shopee', new ShopeeAdapter());
    this.registerAdapter('aliexpress', new AliExpressAdapter());
    this.registerAdapter('magalu', new MagaluAdapter());
    this.registerAdapter('kabum', new KabumAdapter());
    this.registerAdapter('casasbahia', new CasasBahiaAdapter());
  }

  registerAdapter(name, adapter) {
    this.adapters.set(name.toLowerCase(), adapter);
  }

  getAdapter(name = 'mercadolivre') {
    const adapter = this.adapters.get(name.toLowerCase());
    if (!adapter) {
      logger.warn(`Marketplace '${name}' não encontrado. Utilizando MercadoLivre como padrão.`);
      return this.adapters.get('mercadolivre');
    }
    return adapter;
  }

  /**
   * Universal Product Search across single or all marketplaces with Cache
   */
  async searchProducts(query, marketplace = 'mercadolivre', options = {}) {
    const cacheKey = `search:${marketplace.toLowerCase()}:${query.toLowerCase().trim()}:${options.limit || 20}`;
    
    // Check Cache first
    const cachedResult = cacheService.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const adapter = this.getAdapter(marketplace);
    const products = await adapter.searchProducts(query, options);

    // Save to Cache
    cacheService.set(cacheKey, products);
    return products;
  }

  /**
   * Universal Product Details lookup with Cache
   */
  async getProductDetails(productId, marketplace = 'mercadolivre') {
    const cacheKey = `product:${marketplace.toLowerCase()}:${productId}`;

    // Check Cache
    const cachedResult = cacheService.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const adapter = this.getAdapter(marketplace);
    const product = await adapter.getProductDetails(productId);

    // Save to Cache
    cacheService.set(cacheKey, product);
    return product;
  }

  /**
   * Universal Category Search with Cache
   */
  async searchByCategory(category, marketplace = 'mercadolivre', options = {}) {
    const cacheKey = `cat:${marketplace.toLowerCase()}:${category.toLowerCase().trim()}`;
    
    const cachedResult = cacheService.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const adapter = this.getAdapter(marketplace);
    const products = await adapter.searchByCategory(category, options);

    cacheService.set(cacheKey, products);
    return products;
  }
}

export const marketplaceService = new MarketplaceService();
