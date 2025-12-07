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

import { useEffect, useState, useRef } from 'react';

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

let currentFaviconHref: string | null = null;
let currentAppleHref: string | null = null;

/**
 * Update or create a link element in the document head.
 * Skips work if href is unchanged to avoid flicker and double-set (StrictMode).
 */
function updateLinkElement(
  rel: 'icon' | 'apple-touch-icon',
  href: string,
  type?: string,
  sizes?: string
): void {
  const prevHref = rel === 'icon' ? currentFaviconHref : currentAppleHref;
  if (prevHref === href) {
    logDebug(`${rel} unchanged`, href);
    return;
  }

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

  if (rel === 'icon') {
    currentFaviconHref = href;
  } else {
    currentAppleHref = href;
  }
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
 * Debug switch: enable verbose favicon logs by setting
 *   localStorage.faviconDebug = 'true'
 */
const isDebug = (): boolean =>
  import.meta.env.DEV ||
  (typeof localStorage !== 'undefined' &&
    localStorage.getItem('faviconDebug') === 'true');

const logDebug = (...args: unknown[]) => {
  if (isDebug()) {
    // eslint-disable-next-line no-console
    console.debug('[favicon]', ...args);
  }
};

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
  const gameBase = `${baseUrl}games/${gameId}/icons`;
  const sharedBase = `${baseUrl}icons`;

  // 1) Try game-specific icons (svg/png/ico)
  const gameIcon = await findFavicon([gameBase]);
  if (gameIcon) {
    logDebug('game icon found', gameIcon);
    return gameIcon;
  }

  // 2) Try game emoji from config
  if (gameEmoji) {
    logDebug('fallback to game emoji', gameEmoji);
    return createEmojiFavicon(gameEmoji);
  }

  // 3) Try shared icons
  const sharedIcon = await findFavicon([sharedBase]);
  if (sharedIcon) {
    logDebug('shared icon found', sharedIcon);
    return sharedIcon;
  }

  // 4) Final fallback to default emoji
  logDebug('fallback to default emoji', DEFAULT_ENGINE_EMOJI);
  return createEmojiFavicon(DEFAULT_ENGINE_EMOJI);
}

/**
 * Resolve shared/engine icon URL.
 *
 * @returns URL to favicon (file or data URI)
 */
export async function resolveSharedIcon(): Promise<string> {
  const baseUrl = getBaseUrl();
  const sharedBase = `${baseUrl}icons`;

  const sharedIcon = await findFavicon([sharedBase]);
  if (sharedIcon) {
    logDebug('shared icon found', sharedIcon);
    return sharedIcon;
  }

  logDebug('fallback to default emoji');
  return createEmojiFavicon(DEFAULT_ENGINE_EMOJI);
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
  const updateCounter = useRef(0);

  useEffect(() => {
    const updateIcons = async () => {
      const runId = ++updateCounter.current;

      const baseUrl = getBaseUrl();
      let faviconUrl: string;

      if (gameId) {
        // Game page: game icons → shared icons → game emoji → default emoji
        faviconUrl = await resolveGameIcon(gameId, gameEmoji);
      } else {
        // Selector page: shared icons → default emoji
        faviconUrl = await resolveSharedIcon();
      }

      // Bail out if a newer update started
      if (runId !== updateCounter.current) {
        logDebug('favicon update skipped (stale)', { gameId, runId });
        return;
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
      if (runId !== updateCounter.current) {
        logDebug('apple icon update skipped (stale)', { gameId, runId });
        return;
      }

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
