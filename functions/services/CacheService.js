import NodeCache from 'node-cache';
import { config } from '../config/environment.js';
import { logger } from '../utils/logger.js';

class InMemoryCacheDriver {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: config.cache.ttlSeconds,
      checkperiod: config.cache.checkPeriodSeconds
    });
  }

  get(key) {
    const val = this.cache.get(key);
    if (val !== undefined) {
      logger.info(`[Cache HIT] Key: ${key}`);
      return val;
    }
    logger.info(`[Cache MISS] Key: ${key}`);
    return null;
  }

  set(key, value, ttlSeconds) {
    if (ttlSeconds) {
      this.cache.set(key, value, ttlSeconds);
    } else {
      this.cache.set(key, value);
    }
  }

  del(key) {
    this.cache.del(key);
  }

  flush() {
    this.cache.flushAll();
  }
}

/**
 * CacheService interface wrapper.
 * Can easily be swapped with RedisCacheDriver in the future without changing application code.
 */
class CacheService {
  constructor(driver = new InMemoryCacheDriver()) {
    this.driver = driver;
  }

  get(key) {
    return this.driver.get(key);
  }

  set(key, value, ttlSeconds) {
    this.driver.set(key, value, ttlSeconds);
  }

  del(key) {
    this.driver.del(key);
  }

  flush() {
    this.driver.flush();
  }
}

export const cacheService = new CacheService();
