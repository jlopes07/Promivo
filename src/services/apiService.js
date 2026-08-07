/**
 * Frontend API Service
 * Consumes Promivo REST API (/api/*) with automatic URL resolution
 * and client-side fallback for static deployments (Vercel, Netlify).
 */
import { auth } from '../firebase/config.js';

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export class ApiService {
  static async getHeaders() {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    if (auth.currentUser) {
      try {
        const idToken = await auth.currentUser.getIdToken();
        headers['Authorization'] = `Bearer ${idToken}`;
      } catch (err) {
        // Silent token retrieval catch
      }
    }

    return headers;
  }

  static buildUrl(endpoint, params = {}) {
    let url;
    if (BASE_API_URL.startsWith('http://') || BASE_API_URL.startsWith('https://')) {
      const cleanBase = BASE_API_URL.replace(/\/$/, '');
      url = new URL(`${cleanBase}${endpoint}`);
    } else {
      url = new URL(`${window.location.origin}${BASE_API_URL}${endpoint}`);
    }

    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    return url.toString();
  }

  static async get(endpoint, params = {}) {
    const urlString = this.buildUrl(endpoint, params);
    const headers = await this.getHeaders();
    
    const response = await fetch(urlString, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}: Página ou recurso não encontrado`);
    }

    return response.json();
  }

  static async post(endpoint, data = {}) {
    const urlString = this.buildUrl(endpoint);
    const headers = await this.getHeaders();

    const response = await fetch(urlString, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}: Erro no envio de dados`);
    }

    return response.json();
  }

  static async put(endpoint, data = {}) {
    const urlString = this.buildUrl(endpoint);
    const headers = await this.getHeaders();

    const response = await fetch(urlString, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}: Erro na atualização`);
    }

    return response.json();
  }

  static async delete(endpoint) {
    const urlString = this.buildUrl(endpoint);
    const headers = await this.getHeaders();

    const response = await fetch(urlString, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}: Erro na exclusão`);
    }

    return response.json();
  }

  /**
   * Search marketplace products through Promivo API with direct ML fallback
   */
  static async searchMarketplace(query, marketplace = 'mercadolivre') {
    try {
      return await this.get('/search', { q: query, marketplace });
    } catch (err) {
      console.warn('API /search em nuvem não respondeu, utilizando fallback direto Mercado Livre:', err.message);
      return this.searchMercadoLivreDirect(query);
    }
  }

  /**
   * Client-side fallback to Mercado Livre Public API when running static host without Cloud Functions endpoint
   */
  static async searchMercadoLivreDirect(query) {
    try {
      const res = await fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}&limit=10`);
      if (!res.ok) return { success: false, data: [] };
      const json = await res.json();
      const items = (json.results || []).map(item => ({
        id: item.id,
        marketplace: 'MercadoLivre',
        title: item.title,
        description: item.subtitle || '',
        brand: '',
        category: 'Geral',
        price: item.price,
        oldPrice: item.original_price || item.base_price || 0,
        discount: item.original_price ? Math.round(((item.original_price - item.price) / item.original_price) * 100) : 0,
        currency: item.currency_id || 'BRL',
        images: [item.thumbnail ? item.thumbnail.replace('-I.jpg', '-O.jpg') : ''],
        seller: item.seller?.nickname || 'Mercado Livre Seller',
        condition: item.condition || 'new',
        available: true,
        url: item.permalink,
        affiliateUrl: item.permalink,
        createdAt: new Date().toISOString()
      }));
      return { success: true, count: items.length, data: items };
    } catch (err) {
      return { success: false, data: [] };
    }
  }

  static async getMarketplaceProductDetails(productId, marketplace = 'mercadolivre') {
    try {
      return await this.get(`/product/${productId}`, { marketplace });
    } catch (err) {
      return { success: false, data: null };
    }
  }

  static async getOffers(category = 'all', search = '', limit = 50) {
    return this.get('/offers', { category, q: search, limit });
  }

  static async getCategories() {
    return this.get('/categories');
  }
}
