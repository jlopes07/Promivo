import { config } from '../config/environment.js';
import { logger } from '../utils/logger.js';

const requestCounts = new Map();

// Reset IP counts periodically
setInterval(() => {
  requestCounts.clear();
}, config.rateLimit.windowMs);

export function rateLimiter(req, res, next) {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const currentCount = requestCounts.get(clientIp) || 0;

  if (currentCount >= config.rateLimit.maxRequests) {
    logger.warn(`Rate limit excedido para o IP: ${clientIp}`);
    return res.status(429).json({
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Muitas requisições enviadas em um curto período. Por favor, aguarde um momento.'
      }
    });
  }

  requestCounts.set(clientIp, currentCount + 1);
  next();
}
