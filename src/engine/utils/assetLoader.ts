/**
 * Asset loader for game assets.
 *
 * Loading priority:
 * 1. Game-specific: /games/{gameId}/sounds/Click.m4a
 * 2. Oscillator (sounds only)
 * 3. Silent (music/voices)
 */

import { logger } from '@engine/services/logger';
import { checkFileExists, getAssetPaths } from '@app/utils/paths';
import type { AssetType } from '@app/utils/paths';

export { getBasePath, getAssetPaths, checkFileExists } from '@app/utils/paths';
export type { AssetType } from '@app/utils/paths';

/** Result of asset resolution */
export interface AssetResolution {
  path: string | null;
  source: 'specific' | 'none';
}

/**
 * Resolve asset path
 * Checks specific path only
 */
export const resolveAssetPath = async (
  type: AssetType,
  filename: string,
  gameId: string
): Promise<AssetResolution> => {
  const paths = getAssetPaths(type, filename, gameId);

  // Try specific path first
  if (await checkFileExists(paths.specific)) {
    return { path: paths.specific, source: 'specific' };
  }

  // No file found
  return { path: null, source: 'none' };
};

/**
 * Preload an audio file into cache
 */
export const preloadAudioFile = (url: string): Promise<HTMLAudioElement> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.preload = 'auto';

    audio.addEventListener('canplaythrough', () => resolve(audio), {
      once: true,
    });
    audio.addEventListener('error', () => reject(new Error(`Failed to load: ${url}`)), {
      once: true,
    });

    audio.src = url;
    audio.load();
  });
};

/**
 * Preload multiple audio files
 */
export const preloadAssets = async (
  type: AssetType,
  filenames: string[],
  gameId: string,
  cache: Map<string, HTMLAudioElement>
): Promise<void> => {
  const loadPromises = filenames.map(async (filename) => {
    const resolution = await resolveAssetPath(type, filename, gameId);

    if (resolution.path) {
      try {
        const audio = await preloadAudioFile(resolution.path);
        cache.set(filename, audio);
      } catch (err) {
        logger.assetLoader.warn(`Failed to preload ${type}/${filename}`, { error: err });
      }
    }
  });

  await Promise.allSettled(loadPromises);
};
