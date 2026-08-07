import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import express from 'express';
import { corsMiddleware } from './middlewares/corsMiddleware.js';
import { rateLimiter } from './middlewares/rateLimiter.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { apiRouter } from './routes/apiRouter.js';

// Initialize Firebase Admin SDK
initializeApp();

const app = express();

// Global Middlewares
app.use(corsMiddleware);
app.use(express.json());
app.use(rateLimiter);

// Mount API Router under both /api and / to handle all rewrite configurations
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Root Healthcheck Endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Promivo API', timestamp: new Date().toISOString() });
});

// Fallback 404 Route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Rota ${req.originalUrl} não encontrada.` }
  });
});

// Global Error Handler
app.use(errorHandler);

// Export Cloud Function 'api'
export const api = onRequest({
  region: 'us-central1',
  maxInstances: 10,
  cors: true
}, app);
