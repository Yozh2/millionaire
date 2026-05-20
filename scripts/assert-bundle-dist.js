#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseBuildBundleArgs } from './build-target.js';

const readArg = (name) => {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
};

const { gameIds } = parseBuildBundleArgs();
const expectedGameIds = gameIds.sort();
const dist =
  readArg('--dist') ?? join('dist', 'bundles', expectedGameIds.join('-'));
const root = process.cwd();
const distPath = join(root, dist);
const failures = [];

const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const walk = (dir) => {
  if (!existsSync(dir)) return [];
  const files = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) files.push(...walk(path));
    else files.push(path);
  }
  return files;
};

const dsStoreFiles = walk(distPath).filter((file) =>
  file.endsWith('.DS_Store'),
);

const sameList = (actual, expected) =>
  actual.length === expected.length &&
  actual.every((id, index) => id === expected[index]);

assert(existsSync(join(distPath, 'index.html')), 'index.html missing');
assert(
  existsSync(join(distPath, 'asset-manifest.json')),
  'asset-manifest.json missing',
);

const gamesDir = join(distPath, 'games');
if (existsSync(gamesDir)) {
  const gameDirs = readdirSync(gamesDir)
    .filter((name) => name !== 'shared')
    .filter((name) => statSync(join(gamesDir, name)).isDirectory())
    .sort();
  assert(
    sameList(gameDirs, expectedGameIds),
    `unexpected game asset dirs: ${gameDirs.join(', ')}`,
  );
}

if (existsSync(join(distPath, 'asset-manifest.json'))) {
  const manifest = JSON.parse(
    readFileSync(join(distPath, 'asset-manifest.json'), 'utf8'),
  );
  const manifestGames = Object.keys(manifest.games ?? {}).sort();
  assert(
    sameList(manifestGames, expectedGameIds),
    `unexpected manifest games: ${manifestGames.join(', ')}`,
  );
}

const jsFiles = walk(join(distPath, 'assets')).filter((file) =>
  file.endsWith('.js'),
);
for (const file of jsFiles) {
  const source = readFileSync(file, 'utf8');
  const gamePathMatches = [...source.matchAll(/\/src\/games\/([^/]+)\//g)].map(
    (match) => match[1],
  );
  const unexpected = [...new Set(gamePathMatches)].filter(
    (id) => !expectedGameIds.includes(id),
  );
  assert(
    unexpected.length === 0,
    `${file} references other games: ${unexpected.join(', ')}`,
  );
}

assert(
  dsStoreFiles.length === 0,
  `.DS_Store files found in dist: ${dsStoreFiles.join(', ')}`,
);

if (failures.length > 0) {
  console.error('Bundle dist assertion failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Bundle dist assertion passed for ${expectedGameIds.join(', ')}.`);
