#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { parseBuildGameArgs } from './build-target.js';
import { buildDockerImage } from './docker-image.js';

const { gameId, base, outDir } = parseBuildGameArgs();
const tag = `millionaire-game-${gameId}:local`;

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
  'scripts/build-game.js',
  '--game',
  gameId,
  '--base',
  base,
  '--out',
  outDir,
]);
buildDockerImage({ distDir: outDir, tag });

console.log(`[docker:game] Built ${tag} from ${outDir}`);
