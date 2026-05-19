import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { getBuildTarget } from './scripts/build-target.js';
import { gameTargetPlugin } from './scripts/vite-game-target.js';

export default defineConfig(() => {
  const target = getBuildTarget();
  const defineValues = {
    ['__MILLIONAIRE_BUILD_TARGET__']: JSON.stringify(target.kind),
    ['__MILLIONAIRE_GAME_ID__']: JSON.stringify(target.gameId),
    ['__MILLIONAIRE_ROUTER_BASENAME__']: JSON.stringify(
      target.kind === 'hub' ? '/millionaire' : '/',
    ),
  };

  return {
    plugins: [react(), gameTargetPlugin(target)],
    base: target.base,
    appType: 'spa',
    publicDir: target.publicDir,
    build: {
      outDir: target.outDir,
      emptyOutDir: true,
    },
    define: defineValues,
    resolve: {
      alias: {
        '@engine': fileURLToPath(new URL('./src/engine', import.meta.url)),
        '@hub': fileURLToPath(new URL('./src/hub', import.meta.url)),
        '@hub/pages': fileURLToPath(
          new URL('./src/hub/pages', import.meta.url),
        ),
        '@public': fileURLToPath(new URL('./public', import.meta.url)),
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: './vitest.setup.ts',
      globals: true,
      coverage: {
        provider: 'v8',
      },
    },
  };
});
