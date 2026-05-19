#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseBuildGameArgs } from './build-target.js';

const readArg = (name) => {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
};

const gameId = readArg('--game') ?? parseBuildGameArgs().gameId;
const dist = readArg('--dist') ?? join('dist', 'games', gameId);
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

assert(existsSync(join(distPath, 'index.html')), 'index.html missing');
assert(
  existsSync(join(distPath, 'asset-manifest.json')),
  'asset-manifest.json missing',
);
assert(existsSync(join(distPath, 'games', gameId)), `games/${gameId} missing`);

const gamesDir = join(distPath, 'games');
if (existsSync(gamesDir)) {
  const gameDirs = readdirSync(gamesDir).filter((name) =>
    statSync(join(gamesDir, name)).isDirectory(),
  );
  assert(
    gameDirs.length === 1 && gameDirs[0] === gameId,
    `unexpected game asset dirs: ${gameDirs.join(', ')}`,
  );
}

if (existsSync(join(distPath, 'asset-manifest.json'))) {
  const manifest = JSON.parse(
    readFileSync(join(distPath, 'asset-manifest.json'), 'utf8'),
  );
  const manifestGames = Object.keys(manifest.games ?? {});
  assert(
    manifestGames.length === 1 && manifestGames[0] === gameId,
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
    (id) => id !== gameId,
  );
  assert(
    unexpected.length === 0,
    `${file} references other games: ${unexpected.join(', ')}`,
  );
}

if (failures.length > 0) {
  console.error('Game dist assertion failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Game dist assertion passed for ${gameId}.`);
