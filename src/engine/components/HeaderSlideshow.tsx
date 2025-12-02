/**
 * HeaderSlideshow - Animated background slideshow for game screens.
 *
 * Shows themed images with smooth cross-fade transitions and
 * additive blend mode (screen) for a dramatic glowing effect.
 *
 * Images are loaded from manifest.json with cascading fallback:
 * 1. Game + Campaign specific
 * 2. Game fallback
 * 3. Engine fallback
 *
 * See README.md for full directory structure documentation.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type {
  HeaderSlideshowConfig,
  SlideshowScreen,
  QuestionDifficulty,
} from '../types';

interface HeaderSlideshowProps {
  /** Slideshow configuration */
  config: HeaderSlideshowConfig;
  /** Game ID for asset path resolution */
  gameId: string;
  /** Current campaign ID (optional) */
  campaignId?: string;
  /** Current screen type */
  screen: SlideshowScreen;
  /** Difficulty level for 'play' screen */
  difficulty?: QuestionDifficulty;
}

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

/**
 * Load manifest.json from a path.
 */
async function loadManifest(basePath: string): Promise<ImageManifest | null> {
  const cacheKey = basePath;
  if (cacheKey in manifestCache) {
    return manifestCache[cacheKey];
  }

  try {
    const response = await fetch(`${basePath}/manifest.json`);
    if (!response.ok) {
      manifestCache[cacheKey] = null;
      return null;
    }
    const data = await response.json();
    manifestCache[cacheKey] = data;
    return data;
  } catch {
    manifestCache[cacheKey] = null;
    return null;
  }
}

/**
 * Extract images from manifest based on screen and difficulty.
 */
function getImagesFromManifest(
  manifest: ImageManifest | null,
  screen: SlideshowScreen,
  difficulty?: QuestionDifficulty
): string[] {
  if (!manifest) return [];

  switch (screen) {
    case 'start':
      return manifest.start?.images || [];

    case 'play':
      if (difficulty && manifest.play?.[difficulty]?.images) {
        return manifest.play[difficulty].images!;
      }
      return manifest.play?.images || [];

    case 'won':
      return manifest.end?.won?.images || [];

    case 'took':
      return manifest.end?.took?.images || [];

    case 'lost':
      return manifest.end?.lost?.images || [];

    default:
      return [];
  }
}

/**
 * HeaderSlideshow component displays a background slideshow
 * with cross-fade transitions and additive blend mode.
 */
export const HeaderSlideshow: React.FC<HeaderSlideshowProps> = ({
  config,
  gameId,
  campaignId,
  screen,
  difficulty,
}) => {
  const {
    enabled = true,
    transitionDuration = 1500,
    displayDuration = 4000,
    opacity = 0.4,
  } = config;

  // State for resolved images
  const [images, setImages] = useState<string[]>([]);
  const [basePath, setBasePath] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Build fallback paths based on screen type
  const fallbackPaths = useMemo(() => {
    const paths: Array<{ path: string; campaignPath?: string }> = [];

    // For end screens (won, took, lost), we have 3-level fallback
    const isEndScreen = ['won', 'took', 'lost'].includes(screen);

    if (campaignId) {
      // 1. Game + Campaign specific
      paths.push({
        path: `/games/${gameId}/images`,
        campaignPath: `campaigns/${campaignId}`,
      });
    }

    if (isEndScreen) {
      // 2. Game fallback (for end screens)
      paths.push({ path: `/games/${gameId}/images` });
    }

    // 3. Engine fallback
    paths.push({ path: '/images' });

    return paths;
  }, [gameId, campaignId, screen]);

  // Load images with fallback
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

        // Try campaign-specific first
        let resolvedImages: string[] = [];
        let resolvedBasePath = path;

        if (campaignPath && manifest.campaigns) {
          const campaignManifest = manifest.campaigns[campaignId!];
          resolvedImages = getImagesFromManifest(
            campaignManifest,
            screen,
            difficulty
          );
          if (resolvedImages.length > 0) {
            resolvedBasePath = `${path}/${campaignPath}`;
          }
        }

        // Fall back to root level of this manifest
        if (resolvedImages.length === 0) {
          resolvedImages = getImagesFromManifest(manifest, screen, difficulty);
        }

        if (resolvedImages.length > 0) {
          if (!cancelled) {
            setImages(resolvedImages);
            setBasePath(resolvedBasePath);
            setIsLoading(false);
          }
          return;
        }
      }

      // No images found
      if (!cancelled) {
        setImages([]);
        setIsLoading(false);
      }
    }

    setIsLoading(true);
    resolveImages();

    return () => {
      cancelled = true;
    };
  }, [enabled, fallbackPaths, campaignId, screen, difficulty]);

  // Slideshow state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const lastIndexRef = useRef<number>(-1);

  // Pick a random image index, avoiding the last one
  const pickRandomIndex = useCallback(() => {
    if (images.length <= 1) return 0;

    let newIndex: number;
    do {
      newIndex = Math.floor(Math.random() * images.length);
    } while (newIndex === lastIndexRef.current && images.length > 1);

    lastIndexRef.current = newIndex;
    return newIndex;
  }, [images.length]);

  // Reset when images change
  useEffect(() => {
    if (images.length === 0) return;
    const initialIndex = pickRandomIndex();
    setCurrentIndex(initialIndex);
    setNextIndex(null);
    setIsTransitioning(false);
  }, [images, pickRandomIndex]);

  // Slideshow timer
  useEffect(() => {
    if (images.length <= 1) return;

    const cycleImage = () => {
      const next = pickRandomIndex();
      setNextIndex(next);
      setIsTransitioning(true);

      setTimeout(() => {
        setCurrentIndex(next);
        setNextIndex(null);
        setIsTransitioning(false);
      }, transitionDuration);
    };

    const intervalId = setInterval(cycleImage, displayDuration);
    return () => clearInterval(intervalId);
  }, [images.length, displayDuration, transitionDuration, pickRandomIndex]);

  // Don't render if loading, disabled, or no images
  if (isLoading || !enabled || images.length === 0) return null;

  // Build full image paths
  const getFullPath = (filename: string) => {
    // Determine subfolder based on screen
    let subfolder = '';
    if (screen === 'start') {
      subfolder = 'start';
    } else if (screen === 'play') {
      subfolder = difficulty ? `play/${difficulty}` : 'play';
    } else {
      subfolder = `end/${screen}`;
    }
    return `${basePath}/${subfolder}/${filename}`;
  };

  const currentImagePath = getFullPath(images[currentIndex]);
  const nextImagePath =
    nextIndex !== null ? getFullPath(images[nextIndex]) : null;

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {/* Current image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${currentImagePath})`,
          opacity: isTransitioning ? 0 : opacity,
          transition: `opacity ${transitionDuration}ms ease-in-out`,
          mixBlendMode: 'screen',
          filter: 'saturate(1.2) brightness(1.1)',
        }}
      />

      {/* Next image (fades in during transition) */}
      {nextImagePath && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${nextImagePath})`,
            opacity: isTransitioning ? opacity : 0,
            transition: `opacity ${transitionDuration}ms ease-in-out`,
            mixBlendMode: 'screen',
            filter: 'saturate(1.2) brightness(1.1)',
          }}
        />
      )}

      {/* Gradient overlay for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)',
        }}
      />
    </div>
  );
};

export default HeaderSlideshow;
