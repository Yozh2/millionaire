/**
 * Game selector hook for card list state and navigation.
 */
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVisibleCatalogEntries, type GameCatalogEntry } from './gameCatalog';
import { useFavicon } from '@hub/hooks/useFavicon';
import { useLoading } from '@hub/screens/loading/LoadingOrchestrator';

export const useGameSelectorScreen = () => {
  const navigate = useNavigate();
  const { setAppearance } = useLoading();
  useFavicon(null);

  const games = getVisibleCatalogEntries();

  useEffect(() => {
    setAppearance({
      theme: undefined,
      logoUrl: undefined,
      logoEmoji: undefined,
    });
  }, [setAppearance]);

  const handleSelect = useCallback(
    (entry: GameCatalogEntry) => {
      if (!entry.available) return;
      navigate(entry.routePath);
    },
    [navigate],
  );

  return { games, handleSelect };
};
