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

import { useState, useEffect, useCallback, useRef } from 'react';
import type { HeaderSlideshowConfig, SlideshowScreen, QuestionDifficulty } from '../../../types';
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

  // Build full image paths using resolved subfolder
  const getFullPath = (filename: string) => {
    if (!subfolder) return `${basePath}/${filename}`;
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
