#!/usr/bin/env node
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { parseBuildBundleArgs, parseBuildGameArgs } from './build-target.js';

const target = process.argv.includes('--games')
  ? { kind: 'bundle', ...parseBuildBundleArgs() }
  : { kind: 'game', ...parseBuildGameArgs() };
const root = process.cwd();
const sourcePublic = join(root, 'public');
const targetPublic =
  target.kind === 'game'
    ? join(root, '.build', `public-game-${target.gameId}`)
    : join(root, '.build', `public-bundle-${target.slug}`);

const copyIfExists = (from, to) => {
  if (existsSync(from)) {
    cpSync(from, to, { recursive: true });
  }
};

const removeDsStoreFiles = (dir) => {
  if (!existsSync(dir)) {
    return;
  }

  for (const entry of readdirSync(dir)) {
    const entryPath = join(dir, entry);
    if (entry === '.DS_Store') {
      rmSync(entryPath, { force: true });
      continue;
    }

    if (statSync(entryPath).isDirectory()) {
      removeDsStoreFiles(entryPath);
    }
  }
};

rmSync(targetPublic, { recursive: true, force: true });
mkdirSync(join(targetPublic, 'games'), { recursive: true });

copyIfExists(join(sourcePublic, '404.html'), join(targetPublic, '404.html'));
copyIfExists(join(sourcePublic, 'fonts'), join(targetPublic, 'fonts'));

const gameIds = target.kind === 'game' ? [target.gameId] : target.gameIds;
for (const gameId of gameIds) {
  const gameTarget = join(targetPublic, 'games', gameId);
  mkdirSync(gameTarget, { recursive: true });
  copyIfExists(join(sourcePublic, 'games', gameId), gameTarget);
  writeFileSync(join(gameTarget, '.keep'), '');
}

copyIfExists(
  join(sourcePublic, 'games', 'shared'),
  join(targetPublic, 'games', 'shared'),
);

removeDsStoreFiles(targetPublic);

console.log(
  `[stage-public-assets] Staged ${gameIds.join(', ')} assets in ${targetPublic}`,
);
