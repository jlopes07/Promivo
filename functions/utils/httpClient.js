import { logger } from './logger.js';

export async function fetchWithRetry(url, options = {}, retries = 2, delayMs = 300) {
  const timeoutMs = options.timeout || 8000;

  // Format URL query params if provided
  let fullUrl = url;
  if (options.params && Object.keys(options.params).length > 0) {
    const parsedUrl = new URL(url);
    Object.keys(options.params).forEach(k => {
      if (options.params[k] !== undefined && options.params[k] !== null) {
        parsedUrl.searchParams.append(k, options.params[k]);
      }
    });
    fullUrl = parsedUrl.toString();
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(fullUrl, {
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          ...(options.headers || {})
        },
        body: options.data ? JSON.stringify(options.data) : undefined,
        signal: controller.signal
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`Status ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      const isLastAttempt = attempt === retries;
      logger.warn(`Erro em requisição HTTP (Tentativa ${attempt + 1}/${retries + 1}): ${fullUrl}`, {
        errorMessage: error.message
      });

      if (isLastAttempt) {
        throw new Error(`Falha ao conectar com serviço externo (${error.message})`);
      }

      await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }
}
