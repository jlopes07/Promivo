/**
 * Frontend API Service
 * Consumes EXCLUSIVELY Promivo's own REST API (/api/*).
 * The browser NEVER makes direct calls to external marketplace URLs.
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
        console.warn('Erro ao obter token do usuário:', err);
      }
    }

    return headers;
  }

  static async get(endpoint, params = {}) {
    const url = new URL(`${window.location.origin}${BASE_API_URL}${endpoint}`);
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    const headers = await this.getHeaders();
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Falha na comunicação com a API Promivo');
    }

    return response.json();
  }

  static async post(endpoint, data = {}) {
    const url = `${window.location.origin}${BASE_API_URL}${endpoint}`;
    const headers = await this.getHeaders();

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Falha ao enviar dados para a API Promivo');
    }

    return response.json();
  }

  static async put(endpoint, data = {}) {
    const url = `${window.location.origin}${BASE_API_URL}${endpoint}`;
    const headers = await this.getHeaders();

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Falha ao atualizar dados via API');
    }

    return response.json();
  }

  static async delete(endpoint) {
    const url = `${window.location.origin}${BASE_API_URL}${endpoint}`;
    const headers = await this.getHeaders();

    const response = await fetch(url, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Falha ao excluir dados via API');
    }

    return response.json();
  }

  /**
   * Search marketplace products through Promivo API
   */
  static async searchMarketplace(query, marketplace = 'mercadolivre') {
    return this.get('/search', { q: query, marketplace });
  }

  /**
   * Get marketplace product details by ID through Promivo API
   */
  static async getMarketplaceProductDetails(productId, marketplace = 'mercadolivre') {
    return this.get(`/product/${productId}`, { marketplace });
  }

  /**
   * Fetch internal offers from Promivo API
   */
  static async getOffers(category = 'all', search = '', limit = 50) {
    return this.get('/offers', { category, q: search, limit });
  }

  /**
   * Fetch categories from Promivo API
   */
  static async getCategories() {
    return this.get('/categories');
  }
}
