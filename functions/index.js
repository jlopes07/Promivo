import { onRequest } from 'firebase-functions/v2/https';
import app from './app.js';

// Export Cloud Function 'api' (for GCP if ever deployed)
export const api = onRequest({
  region: 'us-central1',
  maxInstances: 10,
  cors: true
}, app);
