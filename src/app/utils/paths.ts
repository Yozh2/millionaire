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
): { specific: string; fallback: string | null } => {
  const basePath = getBasePath();
  return {
    specific: `${basePath}games/${gameId}/${type}/${stripLeadingSlash(filename)}`,
    fallback: null,
  };
};

type ManifestCampaignAssets = {
  level1_1?: {
    music?: string | null;
    musicAlt?: string | null;
  };
};

type ManifestGameAssets = {
  level1?: {
    sounds?: string[];
    mainMenuMusic?: string | null;
  };
  level2?: {
    defeatMusic?: string | null;
    victoryMusic?: string | null;
    retreatMusic?: string | null;
  };
  voices?: string[];
  campaigns?: Record<string, ManifestCampaignAssets>;
};

type AssetManifest = {
  engine?: { sounds?: string[] };
  games?: Record<string, ManifestGameAssets>;
};

let manifestPromise: Promise<AssetManifest | null> | null = null;
let manifestCache: AssetManifest | null = null;
let audioIndexPromise: Promise<Set<string> | null> | null = null;
let audioIndexCache: Set<string> | null = null;

const getManifestUrl = (): string => `${getBasePath()}asset-manifest.json`;

export const loadAssetManifest = async (): Promise<AssetManifest | null> => {
  if (manifestCache) return manifestCache;
  if (!manifestPromise) {
    manifestPromise = fetch(getManifestUrl())
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as AssetManifest;
      })
      .catch(() => null);
  }

  const manifest = await manifestPromise;
  manifestCache = manifest;
  return manifest;
};

const addList = (set: Set<string>, list?: string[] | null): void => {
  if (!list) return;
  for (const item of list) {
    set.add(item);
  }
};

const addValue = (set: Set<string>, value?: string | null): void => {
  if (value) {
    set.add(value);
  }
};

const buildAudioIndex = (manifest: AssetManifest): Set<string> => {
  const index = new Set<string>();

  addList(index, manifest.engine?.sounds);

  for (const game of Object.values(manifest.games ?? {})) {
    addList(index, game.level1?.sounds);
    addValue(index, game.level1?.mainMenuMusic);
    addValue(index, game.level2?.defeatMusic);
    addValue(index, game.level2?.victoryMusic);
    addValue(index, game.level2?.retreatMusic);
    addList(index, game.voices);

    for (const campaign of Object.values(game.campaigns ?? {})) {
      addValue(index, campaign.level1_1?.music);
      addValue(index, campaign.level1_1?.musicAlt);
    }
  }

  return index;
};

const getAudioIndex = async (): Promise<Set<string> | null> => {
  if (audioIndexCache) return audioIndexCache;
  if (!audioIndexPromise) {
    audioIndexPromise = (async () => {
      const manifest = await loadAssetManifest();
      if (!manifest) return null;
      const index = buildAudioIndex(manifest);
      audioIndexCache = index;
      return index;
    })();
  }

  return audioIndexPromise;
};

const normalizeManifestPath = (url: string): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    const parsed = new URL(url, window.location.href);
    if (parsed.origin !== window.location.origin) return null;

    let pathname = parsed.pathname;
    const basePath = stripTrailingSlash(getBasePath());

    if (basePath && basePath !== '/' && pathname.startsWith(`${basePath}/`)) {
      pathname = pathname.slice(basePath.length);
    }

    return pathname.startsWith('/') ? pathname : `/${pathname}`;
  } catch {
    return null;
  }
};

const isAudioManifestPath = (path: string): boolean =>
  /\/games\/[^/]+\/(sounds|music|voices)\//i.test(path);

const checkManifestAudioAvailability = async (
  url: string
): Promise<boolean | null> => {
  const path = normalizeManifestPath(url);
  if (!path || !isAudioManifestPath(path)) return null;

  const index = await getAudioIndex();
  if (!index) return null;

  return index.has(path);
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
  const manifestAvailability = await checkManifestAudioAvailability(url);
  if (manifestAvailability !== null) {
    return manifestAvailability;
  }

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

export const extractGameIdFromPath = (path: string): string | null => {
  const match = path.match(/\/games\/([^/]+)\/(config|registry)\.ts$/);
  return match?.[1] ?? null;
};
