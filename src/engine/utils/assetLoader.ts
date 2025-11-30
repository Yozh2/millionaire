/**
 * Asset loader with fallback support.
 *
 * Loading priority:
 * 1. Game-specific: /games/{gameId}/sounds/Click.ogg
 * 2. Shared fallback: /games/shared/sounds/Click.ogg
 * 3. Oscillator (sounds only)
 * 4. Silent (music/voices)
 */

/** Get base path for assets */
export const getBasePath = (): string => {
  return import.meta.env.BASE_URL || '/';
};

/** Asset types */
export type AssetType = 'sounds' | 'music' | 'voices';

/** Result of asset resolution */
export interface AssetResolution {
  path: string | null;
  source: 'specific' | 'fallback' | 'none';
}

/**
 * Build paths for an asset with fallback
 */
export const getAssetPaths = (
  type: AssetType,
  filename: string,
  gameId: string
): { specific: string; fallback: string } => {
  const basePath = getBasePath();
  return {
    specific: `${basePath}games/${gameId}/${type}/${filename}`,
    fallback: `${basePath}games/shared/${type}/${filename}`,
  };
};

/**
 * Check if a file exists (via HEAD request)
 * Returns true if file exists, false otherwise
 */
export const checkFileExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Resolve asset path with fallback
 * Checks specific path first, then fallback
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

  // Try fallback path
  if (await checkFileExists(paths.fallback)) {
    return { path: paths.fallback, source: 'fallback' };
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
 * Preload multiple audio files with fallback resolution
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
        console.warn(`Failed to preload ${type}/${filename}:`, err);
      }
    }
  });

  await Promise.allSettled(loadPromises);
};
