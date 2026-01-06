/**
 * Game selector hook for card list state and navigation.
 */
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSelectorEntries, type GameRegistryEntry } from './gameRegistry';
import { useFavicon } from '@app/hooks/useFavicon';
import { useLoading } from '@app/screens/loading/LoadingOrchestrator';

export const useGameSelectorScreen = () => {
  const navigate = useNavigate();
  const { setAppearance } = useLoading();
  useFavicon(null);

  const games = getSelectorEntries();

  useEffect(() => {
    setAppearance({
      theme: undefined,
      logoUrl: undefined,
      logoEmoji: undefined,
    });
  }, [setAppearance]);

  const handleSelect = useCallback(
    (entry: GameRegistryEntry) => {
      if (!entry.available) return;
      navigate(entry.routePath);
    },
    [navigate]
  );

  return { games, handleSelect };
};
