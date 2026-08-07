import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        affiliatePanel: resolve(__dirname, 'painel-afiliados.html')
      }
    }
  }
});
