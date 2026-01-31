/**
 * Подбирает картинку для карточки игры с каскадом фолбеков.
 * Сначала пытается game-card.webp, затем фавиконки игры и общие иконки.
 */
import { useEffect, useMemo, useState } from 'react';
import { gameFaviconFile, gameIconsFile, loadAssetManifest } from '@app/utils/paths';

const FALLBACK_FAVICONS = ['favicon.png', 'favicon.svg', 'favicon.ico'] as const;
const FALLBACK_GAME_FAVICONS = [
  'favicon.svg',
  'favicon-96x96.png',
  'favicon.png',
  'favicon.ico',
] as const;

const buildGameCardSources = (
  gameId: string,
  includeGameCard: boolean
): string[] => [
  ...(includeGameCard ? [gameIconsFile(gameId, 'game-card.webp')] : []),
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
  const [manifestGame, setManifestGame] = useState<null | { cardAssets?: { gameCard?: string | null } } | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    loadAssetManifest()
      .then((manifest) => {
        if (cancelled) return;
        const game = manifest?.games?.[gameId];
        setManifestGame(game ?? null);
      })
      .catch(() => {
        if (!cancelled) setManifestGame(null);
      });
    return () => {
      cancelled = true;
    };
  }, [gameId]);

  const includeGameCard = !!manifestGame?.cardAssets?.gameCard;
  const sources = useMemo(() => {
    if (manifestGame === null) return [];
    return buildGameCardSources(gameId, includeGameCard);
  }, [gameId, includeGameCard, manifestGame]);
  const [srcIndex, setSrcIndex] = useState(0);

  useEffect(() => setSrcIndex(0), [gameId, sources.length]);

  const imageSrc = srcIndex < sources.length ? sources[srcIndex] : null;
  const isGameCardArt = includeGameCard && srcIndex === 0 && !!imageSrc;
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
