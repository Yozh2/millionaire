/**
 * Подбирает картинку для карточки игры с каскадом фолбеков.
 * Сначала пытается game-card.webp, затем фавиконки игры и общие иконки.
 */
import { useEffect, useMemo, useState } from 'react';
import { loadAssetManifest, withBasePath } from '@engine/utils/paths';

type ManifestGameCardAssets = {
  gameCard?: string | null;
  favicon?: string | null;
};

const normalizeAssetSource = (source?: string | null): string | null => {
  if (!source) return null;
  if (
    source.startsWith('data:') ||
    source.startsWith('http://') ||
    source.startsWith('https://')
  ) {
    return source;
  }
  return withBasePath(source);
};

const buildGameCardSources = (cardAssets?: ManifestGameCardAssets): string[] =>
  [cardAssets?.gameCard, cardAssets?.favicon]
    .map(normalizeAssetSource)
    .filter((source): source is string => !!source);

export interface UseGameCardImageResult {
  imageSrc: string | null;
  isGameCardArt: boolean;
  isImageReady: boolean;
  onImageLoad: () => void;
  onImageError: () => void;
}

export const useGameCardImage = (gameId: string): UseGameCardImageResult => {
  const [manifestGame, setManifestGame] = useState<
    null | { cardAssets?: ManifestGameCardAssets } | undefined
  >(undefined);

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
    if (!manifestGame) return [];
    return buildGameCardSources(manifestGame.cardAssets);
  }, [manifestGame]);
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
