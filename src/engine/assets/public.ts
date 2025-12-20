import { withBasePath } from './paths';

const stripLeadingSlash = (s: string): string => (s.startsWith('/') ? s.slice(1) : s);
const stripTrailingSlash = (s: string): string => s.replace(/\/+$/, '');

/**
 * Public file URL (served from Vite `/public`) with correct `base`.
 * Accepts both `games/x.png` and `/games/x.png`.
 */
export const publicFile = (relativePath: string): string =>
  withBasePath(stripLeadingSlash(relativePath));

/**
 * Public directory URL (no trailing slash) with correct `base`.
 * Accepts both `games/x` and `/games/x/`.
 */
export const publicDir = (relativeDir: string): string =>
  stripTrailingSlash(withBasePath(stripLeadingSlash(relativeDir)));

export type GamePublicDir =
  | 'icons'
  | 'images'
  | 'sounds'
  | 'music'
  | 'voices'
  | 'favicon';

export const gameDir = (gameId: string, dir: GamePublicDir): string =>
  publicDir(`games/${gameId}/${dir}`);

export const gameFile = (gameId: string, dir: GamePublicDir, filename: string): string =>
  `${gameDir(gameId, dir)}/${stripLeadingSlash(filename)}`;

export const gameIconsDir = (gameId: string): string => gameDir(gameId, 'icons');
export const gameIconsFile = (gameId: string, filename: string): string =>
  gameFile(gameId, 'icons', filename);

export const gameFaviconDir = (gameId: string): string => gameDir(gameId, 'favicon');
export const gameFaviconFile = (gameId: string, filename: string): string =>
  gameFile(gameId, 'favicon', filename);

export const gameImagesDir = (gameId: string): string => gameDir(gameId, 'images');
export const gameImagesFile = (gameId: string, filename: string): string =>
  gameFile(gameId, 'images', filename);
