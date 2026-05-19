#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { parseBuildGameArgs } from './build-target.js';

const { gameId, base, outDir } = parseBuildGameArgs();
const publicDir = join('.build', `public-game-${gameId}`);

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: false,
    ...options,
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

run('npm', ['test']);
run('node', ['scripts/stage-public-assets.js', '--game', gameId]);
run('node', [
  'scripts/generate-image-manifest.js',
  '--game',
  gameId,
  '--public-dir',
  publicDir,
]);
run('node', [
  'scripts/generate-asset-manifest.js',
  '--game',
  gameId,
  '--public-dir',
  publicDir,
]);
run('npx', ['vite', 'build'], {
  env: {
    ...process.env,
    MILLIONAIRE_BUILD_TARGET: 'game',
    MILLIONAIRE_GAME_ID: gameId,
    MILLIONAIRE_BASE: base,
    MILLIONAIRE_OUT_DIR: outDir,
    MILLIONAIRE_PUBLIC_DIR: publicDir,
  },
});
run('node', ['scripts/prepare-dist.js', '--dist', outDir]);
run('node', [
  'scripts/assert-game-dist.js',
  '--dist',
  outDir,
  '--game',
  gameId,
]);
