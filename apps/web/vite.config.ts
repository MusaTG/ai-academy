/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' : uygulama hem GitHub Pages alt yolunda (/<repo>/) hem kök dizinde hem de
// FastAPI tarafından sunulduğunda değişiklik gerektirmeden çalışır (HashRouter kullanılır).
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://127.0.0.1:8000' } },
  preview: { port: 4173, proxy: { '/api': 'http://127.0.0.1:8000' } },
  build: { chunkSizeWarningLimit: 900 },
  test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test-setup.ts'] },
});
