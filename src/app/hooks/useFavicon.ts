/**
 * Favicon Management Hook and Utilities
 *
 * Dynamically updates favicon and apple-touch-icon based on game context.
 *
 * Priority for game pages (highest to lowest):
 * 1. Game-specific favicons: /games/{gameId}/favicon/
 * 2. Game's emoji from registry
 * 3. Default engine emoji: 🎯
 *
 * Priority for GameSelector page:
 * 1. Default engine emoji: 🎯
 */

import { useEffect, useState, useRef } from 'react';
import { fileExistsNotHtml, findFile, gameDir, imageExists } from '@app/utils/paths';
import { createEmojiFavicon, DEFAULT_ENGINE_EMOJI } from '@app/utils/emojiFavicon';

/**
 * Supported favicon filenames in order of preference.
 */
const FAVICON_NAMES = ['favicon.svg', 'favicon-96x96.png', 'favicon.png', 'favicon.ico'];

/** Apple touch icon filename */
const APPLE_TOUCH_ICON_NAME = 'apple-touch-icon.png';

/** Web app manifest filename */
const WEB_MANIFEST_NAME = 'site.webmanifest';

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

type HeadTagSpec =
  | { tagName: 'link'; attrs: Record<string, string> }
  | { tagName: 'meta'; attrs: Record<string, string> };

let currentHeadSignature: string | null = null;
const gameIconCache = new Map<string, string>();

const buildGameIconCacheKey = (gameId: string, gameEmoji?: string) =>
  `${gameId}|${gameEmoji ?? ''}`;

const getCachedGameIcon = (gameId: string, gameEmoji?: string) =>
  gameIconCache.get(buildGameIconCacheKey(gameId, gameEmoji));

const setCachedGameIcon = (
  gameId: string,
  gameEmoji: string | undefined,
  url: string
) => {
  gameIconCache.set(buildGameIconCacheKey(gameId, gameEmoji), url);
};

/**
 * Remove existing favicon-related head tags (both static and previously injected).
 */
function clearFaviconHeadTags(): void {
  const selectors = [
    'link[rel="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="apple-touch-icon"]',
    'link[rel="manifest"]',
    'meta[name="apple-mobile-web-app-title"]',
  ];
  document.querySelectorAll(selectors.join(', ')).forEach((el) => el.remove());
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
    console.debug('[favicon]', ...args);
  }
};

function withCacheBust(url: string, cacheBust: string): string {
  if (url.startsWith('data:')) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}v=${cacheBust}`;
}

function headSignature(tags: HeadTagSpec[]): string {
  return JSON.stringify(tags);
}

function applyHeadTags(tags: HeadTagSpec[]): void {
  const signature = headSignature(tags);
  if (signature === currentHeadSignature) {
    logDebug('head tags unchanged');
    return;
  }

  clearFaviconHeadTags();

  const cacheBust = String(Date.now());

  for (const tag of tags) {
    const el = document.createElement(tag.tagName);

    for (const [key, value] of Object.entries(tag.attrs)) {
      if (tag.tagName === 'link' && key === 'href') {
        const rel = tag.attrs.rel;
        const shouldBust =
          rel === 'icon' ||
          rel === 'shortcut icon' ||
          rel === 'apple-touch-icon';
        (el as HTMLLinkElement).href = shouldBust
          ? withCacheBust(value, cacheBust)
          : value;
      } else {
        el.setAttribute(key, value);
      }
    }

    document.head.appendChild(el);
  }

  currentHeadSignature = signature;
}

function iconTypeFromUrl(url: string): { type?: string; sizes?: string } {
  const lower = url.toLowerCase();
  if (lower.endsWith('.svg')) {
    return { type: 'image/svg+xml', sizes: 'any' };
  }
  if (lower.endsWith('.png')) {
    return { type: 'image/png' };
  }
  if (lower.endsWith('.ico')) {
    return { type: 'image/x-icon' };
  }
  return {};
}

async function resolveHeadFaviconTags(
  gameId: string | null,
  gameEmoji?: string
): Promise<HeadTagSpec[]> {
  const searchBases: string[] = [];
  if (gameId) {
    // Optional, per-game favicon folder (highest priority)
    searchBases.push(gameDir(gameId, 'favicon'));
  }
  const [iconSvg, iconPng96, iconPngLegacy, iconIco] = await Promise.all([
    findFile(searchBases, 'favicon.svg', imageExists),
    findFile(searchBases, 'favicon-96x96.png', imageExists),
    findFile(searchBases, 'favicon.png', imageExists),
    findFile(searchBases, 'favicon.ico', imageExists),
  ]);

  // If we have no file-based favicon at all, fall back to emoji cascade.
  const hasAnyFileIcon = Boolean(iconSvg || iconPng96 || iconPngLegacy || iconIco);
  if (!hasAnyFileIcon) {
    const fallbackEmoji = gameId ? gameEmoji : undefined;
    const emoji = fallbackEmoji || DEFAULT_ENGINE_EMOJI;
    return [
      {
        tagName: 'link',
        attrs: {
          rel: 'icon',
          type: 'image/svg+xml',
          href: createEmojiFavicon(emoji),
          sizes: 'any',
        },
      },
    ];
  }

  const tags: HeadTagSpec[] = [];

  if (iconPng96) {
    tags.push({
      tagName: 'link',
      attrs: {
        rel: 'icon',
        type: 'image/png',
        href: iconPng96,
        sizes: '96x96',
      },
    });
  } else if (iconPngLegacy) {
    tags.push({
      tagName: 'link',
      attrs: {
        rel: 'icon',
        type: 'image/png',
        href: iconPngLegacy,
        sizes: '32x32',
      },
    });
  }

  if (iconSvg) {
    tags.push({
      tagName: 'link',
      attrs: { rel: 'icon', type: 'image/svg+xml', href: iconSvg },
    });
  }

  if (iconIco) {
    tags.push({
      tagName: 'link',
      attrs: { rel: 'shortcut icon', href: iconIco },
    });
  }

  // Apple-touch-icon + Apple title (optional)
  const appleTouchIconUrl = await findAppleTouchIcon(searchBases);
  if (appleTouchIconUrl) {
    tags.push({
      tagName: 'link',
      attrs: {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: appleTouchIconUrl,
      },
    });
  }

  if (gameId) {
    tags.push({
      tagName: 'meta',
      attrs: {
        name: 'apple-mobile-web-app-title',
        content: `M ${gameId.toUpperCase()}`,
      },
    });
  }

  // Manifest (optional; game-specific folder only)
  if (gameId) {
    const manifestUrl = await findFile(
      [gameDir(gameId, 'favicon')],
      WEB_MANIFEST_NAME,
      fileExistsNotHtml
    );
    if (manifestUrl) {
      tags.push({
        tagName: 'link',
        attrs: { rel: 'manifest', href: manifestUrl },
      });
    }
  }

  return tags;
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
  const cached = getCachedGameIcon(gameId, gameEmoji);
  if (cached) {
    logDebug('game icon cache hit', cached);
    return cached;
  }

  const gameFaviconBase = gameDir(gameId, 'favicon');

  // 1) Try game-specific icons (favicon folder)
  const gameIcon = await findFavicon([gameFaviconBase]);
  if (gameIcon) {
    logDebug('game icon found', gameIcon);
    setCachedGameIcon(gameId, gameEmoji, gameIcon);
    return gameIcon;
  }

  // 2) Try game emoji from registry
  if (gameEmoji) {
    logDebug('fallback to game emoji', gameEmoji);
    const emojiUrl = createEmojiFavicon(gameEmoji);
    setCachedGameIcon(gameId, gameEmoji, emojiUrl);
    return emojiUrl;
  }

  // 3) Final fallback to default emoji
  logDebug('fallback to default emoji', DEFAULT_ENGINE_EMOJI);
  const defaultEmojiUrl = createEmojiFavicon(DEFAULT_ENGINE_EMOJI);
  setCachedGameIcon(gameId, gameEmoji, defaultEmojiUrl);
  return defaultEmojiUrl;
}

/**
 * Resolve shared/engine icon URL.
 *
 * @returns URL to favicon (file or data URI)
 */
export async function resolveSharedIcon(): Promise<string> {
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

      const tags = await resolveHeadFaviconTags(gameId, gameEmoji);

      if (runId !== updateCounter.current) {
        logDebug('favicon update skipped (stale)', { gameId, runId });
        return;
      }

      applyHeadTags(tags);
    };

    updateIcons();
  }, [gameId, gameEmoji]);
}

/**
 * Apply a known favicon URL immediately (skips async probing).
 */
export function useImmediateFavicon(
  iconUrl?: string | null,
  enabled = true
): void {
  useEffect(() => {
    if (!enabled || !iconUrl) return;

    const { type, sizes } = iconTypeFromUrl(iconUrl);
    const attrs: Record<string, string> = {
      rel: 'icon',
      href: iconUrl,
    };
    if (type) attrs.type = type;
    if (sizes) attrs.sizes = sizes;

    applyHeadTags([{ tagName: 'link', attrs }]);
  }, [iconUrl, enabled]);
}

/**
 * Hook to get resolved game icon URL for display in UI.
 *
 * @param gameId - Game identifier
 * @param gameEmoji - Optional fallback emoji from game config
 * @param preferredIconUrl - Optional known icon URL to skip probing
 * @returns Object with iconUrl (null if emoji), isEmoji flag, and emoji string
 */
export function useGameIcon(
  gameId: string,
  gameEmoji?: string,
  preferredIconUrl?: string | null
): { iconUrl: string | null; isEmoji: boolean; emoji: string } {
  const emoji = gameEmoji || DEFAULT_ENGINE_EMOJI;
  const cachedIcon = getCachedGameIcon(gameId, gameEmoji) ?? null;
  const initialIcon = preferredIconUrl ?? cachedIcon;
  const initialIsEmoji = !initialIcon || initialIcon.startsWith('data:');

  const [iconUrl, setIconUrl] = useState<string | null>(
    initialIsEmoji ? null : initialIcon
  );
  const [isEmoji, setIsEmoji] = useState(initialIsEmoji);

  useEffect(() => {
    const nextIcon = preferredIconUrl ?? getCachedGameIcon(gameId, gameEmoji) ?? null;
    const nextIsEmoji = !nextIcon || nextIcon.startsWith('data:');
    setIsEmoji(nextIsEmoji);
    setIconUrl(nextIsEmoji ? null : nextIcon);
  }, [gameId, gameEmoji, preferredIconUrl]);

  useEffect(() => {
    const loadIcon = async () => {
      if (preferredIconUrl) {
        const isDataUri = preferredIconUrl.startsWith('data:');
        setIsEmoji(isDataUri);
        setIconUrl(isDataUri ? null : preferredIconUrl);
        return;
      }

      const url = await resolveGameIcon(gameId, gameEmoji);
      const isDataUri = url.startsWith('data:');
      setIsEmoji(isDataUri);
      // Only set URL if it's a real image, not a data URI
      setIconUrl(isDataUri ? null : url);
    };

    loadIcon();
  }, [gameId, gameEmoji, preferredIconUrl]);

  return { iconUrl, isEmoji, emoji };
}
