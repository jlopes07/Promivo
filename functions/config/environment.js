/**
 * Backend Centralized Configuration
 * All external endpoints and secrets are loaded from environment variables.
 */
export const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5001,
  
  // Cache Configuration
  cache: {
    ttlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '900', 10), // 15 min default
    checkPeriodSeconds: parseInt(process.env.CACHE_CHECK_PERIOD || '120', 10)
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
  },

  // External Marketplaces Base Endpoints
  marketplaces: {
    mercadolivre: {
      baseUrl: process.env.MERCADOLIVRE_API_URL || 'https://api.mercadolibre.com',
      siteId: process.env.MERCADOLIVRE_SITE_ID || 'MLB'
    },
    amazon: {
      baseUrl: process.env.AMAZON_API_URL || 'https://webservices.amazon.com.br/paapi5',
      partnerTag: process.env.AMAZON_PARTNER_TAG || ''
    },
    shopee: {
      baseUrl: process.env.SHOPEE_API_URL || 'https://partner.shopeesz.com/api/v2',
      appId: process.env.SHOPEE_APP_ID || ''
    },
    aliexpress: {
      baseUrl: process.env.ALIEXPRESS_API_URL || 'https://api-sg.aliexpress.com',
      appKey: process.env.ALIEXPRESS_APP_KEY || ''
    },
    magalu: {
      baseUrl: process.env.MAGALU_API_URL || 'https://api.magalu.com',
    },
    kabum: {
      baseUrl: process.env.KABUM_API_URL || 'https://api.kabum.com.br',
    },
    casasbahia: {
      baseUrl: process.env.CASASBAHIA_API_URL || 'https://api.casasbahia.com.br',
    }
  }
};
