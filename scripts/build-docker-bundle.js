#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { parseBuildBundleArgs } from './build-target.js';
import { buildDockerImage } from './docker-image.js';

const { gameIds, base, outDir, slug } = parseBuildBundleArgs();
const gamesArg = gameIds.join(',');
const tag = `millionaire-bundle-${slug}:local`;

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

run('node', [
  'scripts/build-bundle.js',
  '--games',
  gamesArg,
  '--base',
  base,
  '--out',
  outDir,
]);
buildDockerImage({ distDir: outDir, tag });

console.log(`[docker:bundle] Built ${tag} from ${outDir}`);
