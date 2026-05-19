#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { parseBuildBundleArgs } from './build-target.js';

const { gameIds, base, outDir, slug } = parseBuildBundleArgs();
const publicDir = join('.build', `public-bundle-${slug}`);
const gamesArg = gameIds.join(',');

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
run('node', ['scripts/stage-public-assets.js', '--games', gamesArg]);
run('node', [
  'scripts/generate-image-manifest.js',
  '--games',
  gamesArg,
  '--public-dir',
  publicDir,
]);
run('node', [
  'scripts/generate-asset-manifest.js',
  '--games',
  gamesArg,
  '--public-dir',
  publicDir,
]);
run('npx', ['vite', 'build'], {
  env: {
    ...process.env,
    MILLIONAIRE_BUILD_TARGET: 'bundle',
    MILLIONAIRE_GAME_IDS: gamesArg,
    MILLIONAIRE_BASE: base,
    MILLIONAIRE_OUT_DIR: outDir,
    MILLIONAIRE_PUBLIC_DIR: publicDir,
  },
});
run('node', ['scripts/prepare-dist.js', '--dist', outDir]);
run('node', [
  'scripts/assert-bundle-dist.js',
  '--dist',
  outDir,
  '--games',
  gamesArg,
]);
