import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSelectorEntries, type GameRegistryEntry } from './gameRegistry';
import { withBasePath } from '../../utils/paths';
import { useImmediateFavicon } from '../../hooks/useFavicon';

export const useGameSelectorScreen = () => {
  const navigate = useNavigate();
  const sharedIcon = useMemo(() => withBasePath('icons/favicon.svg'), []);
  useImmediateFavicon(sharedIcon);

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
