#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { parseBuildGameArgs } from './build-target.js';

const readArg = (args, name) => {
  const index = args.indexOf(name);
  if (index === -1) return null;
  const value = args[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`Missing value for ${name}`);
  }
  return value;
};

const hasFlag = (args, name) => args.includes(name);

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

const args = process.argv.slice(2);
const { gameId } = parseBuildGameArgs(args);
const shouldSkipBuild = hasFlag(args, '--skip-build');
const distPath = readArg(args, '--dist') ?? join('.build', 'desktop', gameId);
const outputPath =
  readArg(args, '--out') ?? join('.build', 'desktop-packages', gameId);
const electronCachePath = join('.build', 'electron-cache');
const electronBuilderCachePath = join('.build', 'electron-builder-cache');
const platform = readArg(args, '--platform') ?? process.platform;
const arch = readArg(args, '--arch') ?? process.arch;
const productName = `Millionaire ${gameId.toUpperCase()}`;

const platformArgs = {
  darwin: ['--mac', 'zip'],
  win32: ['--win', 'portable'],
  linux: ['--linux', 'AppImage'],
};

const builderArgs = platformArgs[platform];
if (!builderArgs) {
  console.error(`Unsupported desktop package platform: ${platform}`);
  process.exit(1);
}

const archArgs = {
  arm64: ['--arm64'],
  x64: ['--x64'],
};

const builderArchArgs = archArgs[arch];
if (!builderArchArgs) {
  console.error(`Unsupported desktop package arch: ${arch}`);
  process.exit(1);
}

if (!shouldSkipBuild) {
  run('node', ['scripts/build-game.js', '--game', gameId, '--out', distPath]);
}

run(
  'npx',
  [
    'electron-builder',
    ...builderArgs,
    ...builderArchArgs,
    '--config',
    'electron-builder.config.cjs',
  ],
  {
    env: {
      ...process.env,
      CSC_IDENTITY_AUTO_DISCOVERY: 'false',
      MILLIONAIRE_DESKTOP_GAME_ID: gameId,
      MILLIONAIRE_DESKTOP_PRODUCT_NAME: productName,
      MILLIONAIRE_DESKTOP_DIST: distPath,
      MILLIONAIRE_DESKTOP_OUTPUT: outputPath,
      ELECTRON_CACHE: electronCachePath,
      ELECTRON_BUILDER_CACHE: electronBuilderCachePath,
    },
  },
);
