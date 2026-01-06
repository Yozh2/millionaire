// Path resolvers and helpers

// Base URL helpers
export const getBasePath = (): string => {
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? base : `${base}/`;
};

export const stripLeadingSlash = (value: string): string =>
  value.startsWith('/') ? value.slice(1) : value;

export const stripTrailingSlash = (value: string): string =>
  value.replace(/\/+$/, '');

export const withBasePath = (relativePath: string): string => {
  return `${getBasePath()}${stripLeadingSlash(relativePath)}`;
};

// Public asset helpers
export const publicFile = (relativePath: string): string =>
  withBasePath(stripLeadingSlash(relativePath));

export const publicDir = (relativeDir: string): string =>
  stripTrailingSlash(withBasePath(stripLeadingSlash(relativeDir)));

export type GamePublicDir =
  | 'icons'
  | 'images'
  | 'sounds'
  | 'music'
  | 'voices'
  | 'favicon';

// Game asset helpers
export const gameDir = (gameId: string, dir: GamePublicDir): string =>
  publicDir(`games/${gameId}/${dir}`);

export const gameFile = (gameId: string, dir: GamePublicDir, filename: string): string =>
  `${gameDir(gameId, dir)}/${stripLeadingSlash(filename)}`;

export const gameIconsDir = (gameId: string): string =>
  gameDir(gameId, 'icons');

export const gameIconsFile = (gameId: string, filename: string): string =>
  gameFile(gameId, 'icons', filename);

export const gameFaviconDir = (gameId: string): string =>
  gameDir(gameId, 'favicon');

export const gameFaviconFile = (gameId: string, filename: string): string =>
  gameFile(gameId, 'favicon', filename);

export const resolveGameFavicon = (
  gameId: string,
  favicon?: string | null
): string | undefined => {
  if (!favicon) return undefined;

  if (
    favicon.startsWith('data:') ||
    favicon.startsWith('http://') ||
    favicon.startsWith('https://')
  ) {
    return favicon;
  }

  if (favicon.includes('/')) {
    return withBasePath(favicon);
  }

  return gameFaviconFile(gameId, favicon);
};

export const gameImagesDir = (gameId: string): string =>
  gameDir(gameId, 'images');

export const gameImagesFile = (gameId: string, filename: string): string =>
  gameFile(gameId, 'images', filename);

// Asset path helpers
export type AssetType = 'sounds' | 'music' | 'voices';

export const getAssetPaths = (
  type: AssetType,
  filename: string,
  gameId: string
): { specific: string; fallback: string } => {
  const basePath = getBasePath();
  return {
    specific: `${basePath}games/${gameId}/${type}/${stripLeadingSlash(filename)}`,
    fallback: `${basePath}games/shared/${type}/${stripLeadingSlash(filename)}`,
  };
};

export async function imageExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (!response.ok) return false;

    const contentType = response.headers.get('Content-Type') || '';
    return contentType.startsWith('image/');
  } catch {
    return false;
  }
}

export async function fileExistsNotHtml(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (!response.ok) return false;

    const contentType = (response.headers.get('Content-Type') || '').toLowerCase();
    return !contentType.startsWith('text/html');
  } catch {
    return false;
  }
}

// File existence with a HEAD + ranged GET fallback
export async function checkFileExists(url: string): Promise<boolean> {
  if (await fileExistsNotHtml(url)) return true;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Range: 'bytes=0-0' },
    });

    if (!(response.ok || response.status === 206)) return false;

    const contentType = (response.headers.get('Content-Type') || '').toLowerCase();
    return !contentType.startsWith('text/html');
  } catch {
    return false;
  }
}

// Lookup helpers for base paths + filenames
export async function findFile(
  basePaths: string[],
  filename: string,
  exists: (url: string) => Promise<boolean>
): Promise<string | null> {
  for (const basePath of basePaths) {
    const url = `${basePath}/${filename}`;
    if (await exists(url)) return url;
  }
  return null;
}

export const GAME_CONFIG_MODULES = import.meta.glob('/src/games/*/config.ts') as Record<
  string,
  () => Promise<{ default: unknown }>
>;

export const GAME_REGISTRY_MODULES = import.meta.glob('/src/games/*/registry.ts', {
  eager: true,
}) as Record<string, { registry: unknown }>;

export const extractGameIdFromPath = (path: string): string | null => {
  const match = path.match(/\/games\/([^/]+)\/(config|registry)\.ts$/);
  return match?.[1] ?? null;
};
