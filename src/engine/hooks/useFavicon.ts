/**
 * Favicon Management Hook and Utilities
 *
 * Dynamically updates favicon and apple-touch-icon based on game context.
 *
 * Priority for game pages (highest to lowest):
 * 1. Game-specific icons: /games/{gameId}/icons/
 * 2. Shared fallback icons: /icons/
 * 3. Game's emoji from config
 * 4. Default engine emoji: 🎯
 *
 * Priority for GameSelector page:
 * 1. Shared icons: /icons/
 * 2. Default engine emoji: 🎯
 */

import { useEffect, useState } from 'react';

/** Default engine emoji favicon */
const DEFAULT_ENGINE_EMOJI = '🎯';

/**
 * Supported favicon filenames in order of preference.
 * Safari prefers larger icons, so we try bigger sizes first.
 */
const FAVICON_NAMES = [
  'favicon.png',
  'favicon.svg',
  'favicon.ico',
];

/** Apple touch icon filename */
const APPLE_TOUCH_ICON_NAME = 'apple-touch-icon.png';

/**
 * Create emoji favicon as data URI.
 */
function createEmojiFavicon(emoji: string): string {
  return (
    "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' " +
    `viewBox='0 0 100 100'><text y='.9em' font-size='90'>${emoji}</text></svg>`
  );
}

/**
 * Check if an image exists at the given URL.
 */
async function imageExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (!response.ok) return false;

    // Check Content-Type to avoid SPA fallback (Vite returns HTML for missing files)
    const contentType = response.headers.get('Content-Type') || '';
    return contentType.startsWith('image/');
  } catch {
    return false;
  }
}

/**
 * Get base URL for assets.
 */
function getBaseUrl(): string {
  return import.meta.env.BASE_URL;
}

/**
 * Find the first existing favicon from a list of base paths.
 */
async function findFavicon(basePaths: string[]): Promise<string | null> {
  for (const basePath of basePaths) {
    for (const name of FAVICON_NAMES) {
      const url = `${basePath}/${name}`;
      if (await imageExists(url)) {
        return url;
      }
    }
  }
  return null;
}

/**
 * Find the first existing apple-touch-icon from a list of paths.
 */
async function findAppleTouchIcon(
  basePaths: string[]
): Promise<string | null> {
  for (const basePath of basePaths) {
    const url = `${basePath}/${APPLE_TOUCH_ICON_NAME}`;
    if (await imageExists(url)) {
      return url;
    }
  }
  return null;
}

/**
 * Update or create a link element in the document head.
 * Forces browser to update by removing and recreating the element.
 */
function updateLinkElement(
  rel: string,
  href: string,
  type?: string,
  sizes?: string
): void {
  // Remove existing link to force browser refresh (Safari workaround)
  const existingLinks = document.querySelectorAll(
    `link[rel="${rel}"], link[rel="shortcut icon"]`
  );
  existingLinks.forEach((link) => link.remove());

  // Add cache-busting for non-data URIs (Safari fix)
  const finalHref = href.startsWith('data:')
    ? href
    : `${href}?v=${Date.now()}`;

  // Create new link element
  const link = document.createElement('link');
  link.rel = rel;
  link.href = finalHref;
  if (type) {
    link.type = type;
  }
  if (sizes) {
    link.setAttribute('sizes', sizes);
  }
  document.head.appendChild(link);
}

/**
 * Get MIME type for favicon based on extension.
 */
function getFaviconType(url: string): string {
  if (url.endsWith('.svg')) return 'image/svg+xml';
  if (url.endsWith('.png')) return 'image/png';
  if (url.endsWith('.ico')) return 'image/x-icon';
  return 'image/png';
}

/**
 * Resolve game icon URL with fallback cascade.
 *
 * @param gameId - Game identifier
 * @param gameEmoji - Optional emoji from game config
 * @returns URL to favicon (file or data URI)
 */
export async function resolveGameIcon(
  gameId: string,
  gameEmoji?: string
): Promise<string> {
  const baseUrl = getBaseUrl();
  const gameIconBase = `${baseUrl}games/${gameId}/icons`;
  const sharedIconBase = `${baseUrl}icons`;

  // Fast-path: try known svg locations without HEAD probing to avoid 404 spam
  const directGameSvg = `${gameIconBase}/favicon.svg`;
  const directSharedSvg = `${sharedIconBase}/favicon.svg`;

  if (await imageExists(directGameSvg)) {
    return directGameSvg;
  }
  if (await imageExists(directSharedSvg)) {
    return directSharedSvg;
  }

  // Slow-path: probe other formats if ever added
  const faviconUrl = await findFavicon([gameIconBase, sharedIconBase]);
  if (faviconUrl) {
    return faviconUrl;
  }

  // Fallback to emoji (game emoji first, then default)
  const emoji = gameEmoji || DEFAULT_ENGINE_EMOJI;
  return createEmojiFavicon(emoji);
}

/**
 * Resolve shared/engine icon URL.
 *
 * @returns URL to favicon (file or data URI)
 */
export async function resolveSharedIcon(): Promise<string> {
  const baseUrl = getBaseUrl();
  // Use known shared svg directly; skip probing to prevent 404 noise/flicker
  return `${baseUrl}icons/favicon.svg`;
}

/**
 * Hook to manage favicon for game pages.
 *
 * @param gameId - Game identifier for game-specific icons
 * @param gameEmoji - Optional fallback emoji from game config
 */
export function useFavicon(
  gameId: string | null,
  gameEmoji?: string
): void {
  useEffect(() => {
    const updateIcons = async () => {
      const baseUrl = getBaseUrl();
      let faviconUrl: string;

      if (gameId) {
        // Game page: game icons → shared icons → game emoji → default emoji
        faviconUrl = await resolveGameIcon(gameId, gameEmoji);
      } else {
        // Selector page: shared icons → default emoji
        faviconUrl = await resolveSharedIcon();
      }

      // Set favicon with proper size attribute for Safari
      const isDataUri = faviconUrl.startsWith('data:');
      const faviconType = isDataUri
        ? 'image/svg+xml'
        : getFaviconType(faviconUrl);

      // Determine size from filename or default
      let sizes: string | undefined;
      if (faviconUrl.includes('256')) {
        sizes = '256x256';
      } else if (faviconUrl.includes('128')) {
        sizes = '128x128';
      } else if (faviconUrl.endsWith('.svg') || isDataUri) {
        sizes = 'any';
      } else {
        sizes = '32x32';
      }

      updateLinkElement('icon', faviconUrl, faviconType, sizes);

      // Set apple-touch-icon (only if file exists)
      const searchPaths: string[] = [];
      if (gameId) {
        searchPaths.push(`${baseUrl}games/${gameId}/icons`);
      }
      searchPaths.push(`${baseUrl}icons`);

      const appleTouchIconUrl = await findAppleTouchIcon(searchPaths);
      if (appleTouchIconUrl) {
        updateLinkElement('apple-touch-icon', appleTouchIconUrl);
      }
    };

    updateIcons();
  }, [gameId, gameEmoji]);
}

/**
 * Hook to get resolved game icon URL for display in UI.
 *
 * @param gameId - Game identifier
 * @param gameEmoji - Optional fallback emoji from game config
 * @returns Object with iconUrl (null if emoji), isEmoji flag, and emoji string
 */
export function useGameIcon(
  gameId: string,
  gameEmoji?: string
): { iconUrl: string | null; isEmoji: boolean; emoji: string } {
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [isEmoji, setIsEmoji] = useState(true);
  const emoji = gameEmoji || DEFAULT_ENGINE_EMOJI;

  useEffect(() => {
    const loadIcon = async () => {
      const url = await resolveGameIcon(gameId, gameEmoji);
      const isDataUri = url.startsWith('data:');
      setIsEmoji(isDataUri);
      // Only set URL if it's a real image, not a data URI
      setIconUrl(isDataUri ? null : url);
    };

    loadIcon();
  }, [gameId, gameEmoji]);

  return { iconUrl, isEmoji, emoji };
}
