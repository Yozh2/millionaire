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

import { useEffect, useMemo, useRef, useState } from 'react';
import type { HeaderSlideshowConfig, QuestionDifficulty, SlideshowScreen } from '@engine/types';
import { shuffleArray } from '../../../game/utils/shuffleArray';
import { useHeaderImages } from './useHeaderImages';

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
  const { enabled, transitionDuration, displayDuration, opacity, isLoading, images, basePath, subfolder } =
    useHeaderImages(config, { gameId, campaignId, screen, difficulty });

  const imageOrder = config.imageOrder ?? 'alphabetical';
  const orderedImages = useMemo(() => {
    if (images.length === 0) return images;
    if (imageOrder === 'random') return shuffleArray(images);
    return [...images].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [imageOrder, images]);

  // Slideshow state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const currentIndexRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const transitionTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    isTransitioningRef.current = isTransitioning;
  }, [isTransitioning]);

  // Reset when images change
  useEffect(() => {
    if (orderedImages.length === 0) return;
    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    setCurrentIndex(0);
    setNextIndex(null);
    setIsTransitioning(false);
  }, [orderedImages]);

  // Slideshow timer
  useEffect(() => {
    if (orderedImages.length <= 1) return;

    const cycleImage = () => {
      if (isTransitioningRef.current) return;

      const next = (currentIndexRef.current + 1) % orderedImages.length;
      setNextIndex(next);
      setIsTransitioning(true);

      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }

      transitionTimeoutRef.current = window.setTimeout(() => {
        setCurrentIndex(next);
        setNextIndex(null);
        setIsTransitioning(false);
      }, transitionDuration);
    };

    const intervalId = window.setInterval(cycleImage, displayDuration);
    return () => {
      window.clearInterval(intervalId);
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
    };
  }, [displayDuration, orderedImages.length, transitionDuration]);

  // Don't render if loading, disabled, or no images
  if (isLoading || !enabled || orderedImages.length === 0) return null;

  // Build full image paths using resolved subfolder
  const getFullPath = (filename: string) => {
    if (!subfolder) return `${basePath}/${filename}`;
    return `${basePath}/${subfolder}/${filename}`;
  };

  const currentImagePath = getFullPath(orderedImages[currentIndex]);
  const nextImagePath =
    nextIndex !== null ? getFullPath(orderedImages[nextIndex]) : null;

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

      {/* Oval vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.18) 55%, rgba(0,0,0,0.5) 95%, rgba(0,0,0,0.6) 110%)',
          mixBlendMode: 'multiply',
        }}
      />
    </div>
  );
};

export default HeaderSlideshow;
