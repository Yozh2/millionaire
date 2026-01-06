/**
 * Game selector hook for card list state and navigation.
 */
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSelectorEntries, type GameRegistryEntry } from './gameRegistry';
import { useFavicon } from '@app/hooks/useFavicon';

export const useGameSelectorScreen = () => {
  const navigate = useNavigate();
  useFavicon(null);

  const games = getSelectorEntries();

  const handleSelect = useCallback(
    (entry: GameRegistryEntry) => {
      if (!entry.available) return;
      navigate(entry.routePath);
    },
    [navigate]
  );

  return { games, handleSelect };
};
