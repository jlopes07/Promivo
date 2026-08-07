import { initializeApp, getApps, cert } from 'firebase-admin/app';
import express from 'express';
import { corsMiddleware } from './middlewares/corsMiddleware.js';
import { rateLimiter } from './middlewares/rateLimiter.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { apiRouter } from './routes/apiRouter.js';

// Safe Initialization of Firebase Admin SDK
if (getApps().length === 0) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && rawPrivateKey) {
    const privateKey = rawPrivateKey.replace(/\\n/g, '\n');
    
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey
      })
    });
  } else {
    throw new Error(
      'Configuração do Firebase Admin ausente. As variáveis de ambiente FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY precisam ser configuradas.'
    );
  }
}

const app = express();

// Global Middlewares
app.use(corsMiddleware);
app.use(express.json());
app.use(rateLimiter);

// Path Normalizer Middleware for Vercel Rewrites
// Ensures req.url always contains /api prefix for Express routing consistency
app.use((req, res, next) => {
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? '' : '/') + req.url;
  }
  next();
});

// Healthcheck Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Promivo API (Vercel)', timestamp: new Date().toISOString() });
});

// Mount API Router under /api
app.use('/api', apiRouter);

// Fallback 404 Route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Rota ${req.originalUrl} não encontrada.` }
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
