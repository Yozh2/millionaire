import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  base: '/millionaire/',
  appType: 'spa',
  resolve: {
    alias: {
      '@engine': fileURLToPath(new URL('./src/engine', import.meta.url)),
      '@games': fileURLToPath(new URL('./src/games', import.meta.url)),
      '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
      '@public': fileURLToPath(new URL('./src/public/index.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    globals: true,
    coverage: {
      provider: 'c8',
    },
  },
});
