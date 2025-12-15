import { useEffect, useMemo, useState } from 'react';
import type {
  HeaderSlideshowConfig,
  QuestionDifficulty,
  SlideshowScreen,
} from '../../../types';

/** Manifest structure matching generate-image-manifest.js output */
interface ImageManifest {
  images?: string[];
  start?: { images?: string[] };
  play?: {
    images?: string[];
    easy?: { images?: string[] };
    medium?: { images?: string[] };
    hard?: { images?: string[] };
  };
  end?: {
    images?: string[];
    won?: { images?: string[] };
    took?: { images?: string[] };
    lost?: { images?: string[] };
  };
  campaigns?: Record<string, ImageManifest>;
}

/** Cache for loaded manifests */
const manifestCache: Record<string, ImageManifest | null> = {};

async function loadManifest(basePath: string): Promise<ImageManifest | null> {
  const cacheKey = basePath;
  if (cacheKey in manifestCache) return manifestCache[cacheKey];

  try {
    const response = await fetch(`${basePath}/manifest.json`);
    if (!response.ok) {
      manifestCache[cacheKey] = null;
      return null;
    }
    const data = (await response.json()) as ImageManifest;
    manifestCache[cacheKey] = data;
    return data;
  } catch {
    manifestCache[cacheKey] = null;
    return null;
  }
}

interface ManifestResult {
  images: string[];
  subfolder: string;
}

function getImagesFromManifest(
  manifest: ImageManifest | null,
  screen: SlideshowScreen,
  difficulty?: QuestionDifficulty
): ManifestResult {
  if (!manifest) return { images: [], subfolder: '' };

  const getStartFallback = (): ManifestResult => ({
    images: manifest.start?.images || [],
    subfolder: 'start',
  });

  switch (screen) {
    case 'start':
      return {
        images: manifest.start?.images || [],
        subfolder: 'start',
      };

    case 'play': {
      if (difficulty && manifest.play?.[difficulty]?.images?.length) {
        return {
          images: manifest.play[difficulty].images!,
          subfolder: `play/${difficulty}`,
        };
      }
      if (manifest.play?.images?.length) {
        return {
          images: manifest.play.images,
          subfolder: 'play',
        };
      }
      return getStartFallback();
    }

    case 'won':
      if (manifest.end?.won?.images?.length) {
        return { images: manifest.end.won.images, subfolder: 'end/won' };
      }
      if (manifest.end?.images?.length) {
        return { images: manifest.end.images, subfolder: 'end' };
      }
      return getStartFallback();

    case 'took':
      if (manifest.end?.took?.images?.length) {
        return { images: manifest.end.took.images, subfolder: 'end/took' };
      }
      if (manifest.end?.images?.length) {
        return { images: manifest.end.images, subfolder: 'end' };
      }
      return getStartFallback();

    case 'lost':
      if (manifest.end?.lost?.images?.length) {
        return { images: manifest.end.lost.images, subfolder: 'end/lost' };
      }
      if (manifest.end?.images?.length) {
        return { images: manifest.end.images, subfolder: 'end' };
      }
      return getStartFallback();

    default:
      return { images: [], subfolder: '' };
  }
}

export interface UseHeaderImagesResult {
  enabled: boolean;
  transitionDuration: number;
  displayDuration: number;
  opacity: number;
  isLoading: boolean;
  images: string[];
  basePath: string;
  subfolder: string;
}

export function useHeaderImages(
  slideshowConfig: HeaderSlideshowConfig | undefined,
  {
    gameId,
    campaignId,
    screen,
    difficulty,
  }: {
    gameId: string;
    campaignId?: string;
    screen: SlideshowScreen;
    difficulty?: QuestionDifficulty;
  }
): UseHeaderImagesResult {
  const enabled = slideshowConfig?.enabled ?? true;
  const transitionDuration = slideshowConfig?.transitionDuration ?? 1500;
  const displayDuration = slideshowConfig?.displayDuration ?? 4000;
  const opacity = slideshowConfig?.opacity ?? 1;

  const [images, setImages] = useState<string[]>([]);
  const [basePath, setBasePath] = useState<string>('');
  const [subfolder, setSubfolder] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const fallbackPaths = useMemo(() => {
    const paths: Array<{ path: string; campaignPath?: string }> = [];
    const base = import.meta.env.BASE_URL;
    const isEndScreen = ['won', 'took', 'lost'].includes(screen);

    if (campaignId) {
      paths.push({
        path: `${base}games/${gameId}/images`,
        campaignPath: `campaigns/${campaignId}`,
      });
    }

    if (isEndScreen) {
      paths.push({ path: `${base}games/${gameId}/images` });
    }

    paths.push({ path: `${base}images` });
    return paths;
  }, [campaignId, gameId, screen]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function resolveImages() {
      for (const { path, campaignPath } of fallbackPaths) {
        if (cancelled) return;

        const manifest = await loadManifest(path);
        if (!manifest) continue;

        let resolvedImages: string[] = [];
        let resolvedSubfolder = '';
        let resolvedBasePath = path;

        if (campaignPath && campaignId && manifest.campaigns) {
          const campaignManifest = manifest.campaigns[campaignId];
          const result = getImagesFromManifest(
            campaignManifest,
            screen,
            difficulty
          );
          resolvedImages = result.images;
          resolvedSubfolder = result.subfolder;
          if (resolvedImages.length > 0) {
            resolvedBasePath = `${path}/${campaignPath}`;
          }
        }

        if (resolvedImages.length === 0) {
          const result = getImagesFromManifest(manifest, screen, difficulty);
          resolvedImages = result.images;
          resolvedSubfolder = result.subfolder;
        }

        if (resolvedImages.length > 0) {
          if (!cancelled) {
            setImages(resolvedImages);
            setBasePath(resolvedBasePath);
            setSubfolder(resolvedSubfolder);
            setIsLoading(false);
          }
          return;
        }
      }

      if (!cancelled) {
        setImages([]);
        setIsLoading(false);
      }
    }

    setIsLoading(true);
    void resolveImages();

    return () => {
      cancelled = true;
    };
  }, [campaignId, difficulty, enabled, fallbackPaths, screen]);

  return {
    enabled,
    transitionDuration,
    displayDuration,
    opacity,
    isLoading,
    images,
    basePath,
    subfolder,
  };
}

export default useHeaderImages;

