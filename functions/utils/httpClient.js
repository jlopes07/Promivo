import axios from 'axios';
import { logger } from './logger.js';

export async function fetchWithRetry(url, options = {}, retries = 2, delayMs = 300) {
  const timeout = options.timeout || 5000;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await axios({
        url,
        method: options.method || 'GET',
        headers: options.headers || {},
        params: options.params || {},
        data: options.data || null,
        timeout
      });

      return response.data;
    } catch (error) {
      const isLastAttempt = attempt === retries;
      logger.warn(`Erro em requisição HTTP (Tentativa ${attempt + 1}/${retries + 1}): ${url}`, {
        status: error.response?.status,
        errorMessage: error.message
      });

      if (isLastAttempt) {
        throw new Error(`Falha ao conectar com serviço externo (${error.message})`);
      }

      await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }
}
