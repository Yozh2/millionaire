import { useEffect, useMemo, useState } from 'react';
import { withBasePath } from '../utils/paths';

const FALLBACK_FAVICONS = ['favicon.png', 'favicon.svg', 'favicon.ico'] as const;
const FALLBACK_GAME_FAVICONS = [
  'favicon-96x96.png',
  'favicon.png',
  'favicon.svg',
  'favicon.ico',
] as const;

const gameIconsFile = (gameId: string, filename: string): string =>
  withBasePath(`games/${gameId}/icons/${filename}`);

const gameFaviconFile = (gameId: string, filename: string): string =>
  withBasePath(`games/${gameId}/favicon/${filename}`);

const buildGameCardSources = (gameId: string): string[] => [
  gameIconsFile(gameId, 'game-card.webp'),
  ...FALLBACK_GAME_FAVICONS.map((name) => gameFaviconFile(gameId, name)),
  ...FALLBACK_FAVICONS.map((name) => gameIconsFile(gameId, name)),
];

export interface UseGameCardImageResult {
  imageSrc: string | null;
  isGameCardArt: boolean;
  isImageReady: boolean;
  onImageLoad: () => void;
  onImageError: () => void;
}

export const useGameCardImage = (gameId: string): UseGameCardImageResult => {
  const sources = useMemo(() => buildGameCardSources(gameId), [gameId]);
  const [srcIndex, setSrcIndex] = useState(0);

  useEffect(() => setSrcIndex(0), [gameId]);

  const imageSrc = srcIndex < sources.length ? sources[srcIndex] : null;
  const isGameCardArt = srcIndex === 0 && !!imageSrc;
  const [isImageReady, setIsImageReady] = useState(false);

  useEffect(() => {
    setIsImageReady(false);
  }, [imageSrc]);

  return {
    imageSrc,
    isGameCardArt,
    isImageReady,
    onImageLoad: () => setIsImageReady(true),
    onImageError: () => {
      setIsImageReady(false);
      setSrcIndex((index) => index + 1);
    },
  };
};
