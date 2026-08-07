import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error(`[Error Handler] ${req.method} ${req.url}: ${err.message}`, {
    stack: err.stack,
    ip: req.ip
  });

  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.isPublic ? err.message : 'Ocorreu um erro interno no servidor. Por favor, tente novamente.'
    }
  });
}
