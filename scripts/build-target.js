import { join } from 'node:path';
import { readdirSync, existsSync, statSync } from 'node:fs';

const GAME_ID_PATTERN = /^[a-z0-9-]+$/;
const ALL_GAMES = 'all';

const readArg = (args, name) => {
  const index = args.indexOf(name);
  if (index === -1) return null;
  const value = args[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`Missing value for ${name}`);
  }
  return value;
};

const validateGameId = (gameId) => {
  if (!gameId || !GAME_ID_PATTERN.test(gameId)) {
    throw new Error(`Invalid game id: ${gameId ?? '<empty>'}`);
  }
  return gameId;
};

export const listSourceGameIds = () => {
  const gamesDir = join(process.cwd(), 'src', 'games');
  if (!existsSync(gamesDir)) return [];

  return readdirSync(gamesDir)
    .filter((entry) => {
      const gameDir = join(gamesDir, entry);
      return (
        statSync(gameDir).isDirectory() &&
        existsSync(join(gameDir, 'manifest.ts')) &&
        existsSync(join(gameDir, 'index.ts'))
      );
    })
    .sort();
};

export const parseGameIds = (value, { allowAll = true } = {}) => {
  if (!value || value === ALL_GAMES) {
    if (!allowAll) {
      throw new Error('Game list cannot be empty or "all" here');
    }
    return listSourceGameIds();
  }

  const gameIds = value
    .split(',')
    .map((gameId) => gameId.trim())
    .filter(Boolean)
    .map(validateGameId);

  if (gameIds.length === 0) {
    throw new Error('Game list cannot be empty');
  }

  return [...new Set(gameIds)].sort();
};

export const parseBuildGameArgs = (args = process.argv.slice(2)) => {
  const gameId = validateGameId(readArg(args, '--game'));
  const base = readArg(args, '--base') ?? './';
  const outDir = readArg(args, '--out') ?? join('dist', 'games', gameId);

  return { gameId, base, outDir };
};

export const parseBuildBundleArgs = (args = process.argv.slice(2)) => {
  const gameIds = parseGameIds(readArg(args, '--games') ?? ALL_GAMES);
  const slug = gameIds.join('-') || ALL_GAMES;
  const base = readArg(args, '--base') ?? './';
  const outDir = readArg(args, '--out') ?? join('dist', 'bundles', slug);

  return { gameIds, base, outDir, slug };
};

export const getBuildTarget = (env = process.env) => {
  const kind = env.MILLIONAIRE_BUILD_TARGET ?? 'hub';

  if (kind === 'hub') {
    return {
      kind,
      gameId: null,
      base: env.MILLIONAIRE_BASE ?? '/millionaire/',
      outDir: env.MILLIONAIRE_OUT_DIR ?? 'dist',
      publicDir: 'public',
    };
  }

  if (kind === 'game') {
    const gameId = validateGameId(env.MILLIONAIRE_GAME_ID);
    return {
      kind,
      gameId,
      base: env.MILLIONAIRE_BASE ?? './',
      outDir: env.MILLIONAIRE_OUT_DIR ?? join('dist', 'games', gameId),
      publicDir:
        env.MILLIONAIRE_PUBLIC_DIR ?? join('.build', `public-game-${gameId}`),
    };
  }

  if (kind === 'bundle') {
    const gameIds = parseGameIds(env.MILLIONAIRE_GAME_IDS ?? ALL_GAMES);
    const slug = gameIds.join('-') || ALL_GAMES;
    return {
      kind,
      gameId: null,
      gameIds,
      base: env.MILLIONAIRE_BASE ?? './',
      outDir: env.MILLIONAIRE_OUT_DIR ?? join('dist', 'bundles', slug),
      publicDir:
        env.MILLIONAIRE_PUBLIC_DIR ?? join('.build', `public-bundle-${slug}`),
    };
  }

  throw new Error(`Unsupported build target: ${kind}`);
};
