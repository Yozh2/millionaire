/**
 * EndScreen - Game over screens (won, lost, took money)
 */

import { useEffect, useRef, useCallback } from 'react';
import type { PointerEvent } from 'react';
import { GameConfig, ThemeColors, EffectsAPI } from '../../types';
import { UseGameStateReturn } from '../hooks/useGameState';
import { ResultPanel, type ResultVariant } from '../panels/ResultPanel';

interface EndScreenProps {
  config: GameConfig;
  gameState: UseGameStateReturn;
  onNewGame: () => void;
  onActionButtonPress: (e?: PointerEvent<Element>) => void;
  theme: ThemeColors;
  effects?: EffectsAPI;
}

export function EndScreen({
  config,
  gameState,
  onNewGame,
  onActionButtonPress,
  theme,
  effects,
}: EndScreenProps) {
  const { gameState: state, wonPrize } = gameState;

  // Ref for the icon container to get its position for coin effects
  const iconRef = useRef<HTMLDivElement>(null);

  // Calculate icon center position as normalized coordinates (0-1) with random offset
  const getIconOrigin = useCallback(() => {
    // Small random offset (epsilon) to create variety in spawn positions
    const epsilon = 0.005; // ~0.5% of screen size
    const randomOffset = () => (Math.random() - 0.5) * 2 * epsilon;

    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      return {
        x: centerX / window.innerWidth + randomOffset(),
        y: centerY / window.innerHeight + randomOffset(),
      };
    }
    // Fallback if ref not available
    return { x: 0.5 + randomOffset(), y: 0.3 + randomOffset() };
  }, []);

  // Trigger celebration effects - continuous coin bursts from trophy icon position
  useEffect(() => {
    if (state === 'won' || (state === 'took_money' && Number(wonPrize) > 0)) {
      // Delay to ensure icon is rendered and positioned (0.5 sec for screen load)
      const startDelay = setTimeout(() => {
        // Initial burst from icon position
        effects?.triggerCoins(getIconOrigin());

        // Continue with random interval bursts until component unmounts
        const scheduleNextBurst = () => {
          const delay = 500 + Math.random() * 3200; // 0.5-4 sec interval
          return setTimeout(() => {
            effects?.triggerCoins(getIconOrigin());
            intervalRef = scheduleNextBurst();
          }, delay);
        };

        intervalRef = scheduleNextBurst();
      }, 500);

      let intervalRef: ReturnType<typeof setTimeout>;

      return () => {
        clearTimeout(startDelay);
        clearTimeout(intervalRef);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, wonPrize, getIconOrigin]); // effects intentionally omitted to prevent re-triggering

  // Trigger lost sparks effect - continuous tiny spark bursts from broken icon
  // Only enabled when config.enableLostSparks is true
  useEffect(() => {
    if (state === 'lost' && config.enableLostSparks) {
      // Delay to ensure icon is rendered and positioned (0.5 sec for screen load)
      const startDelay = setTimeout(() => {
        // Initial burst from icon position
        effects?.triggerLostSparks(getIconOrigin());

        // Continue with random interval bursts until component unmounts
        const scheduleNextBurst = () => {
          const delay = 400 + Math.random() * 2500; // 0.4-3 sec interval
          return setTimeout(() => {
            effects?.triggerLostSparks(getIconOrigin());
            intervalRef = scheduleNextBurst();
          }, delay);
        };

        intervalRef = scheduleNextBurst();
      }, 500);

      let intervalRef: ReturnType<typeof setTimeout>;

      return () => {
        clearTimeout(startDelay);
        clearTimeout(intervalRef);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, getIconOrigin]); // effects intentionally omitted to prevent re-triggering

  const variant: ResultVariant =
    state === 'won' ? 'won' : state === 'lost' ? 'lost' : 'took_money';

  return (
    <ResultPanel
      config={config}
      theme={theme}
      variant={variant}
      wonPrize={wonPrize}
      iconRef={iconRef}
      onNewGame={onNewGame}
      onActionButtonPress={onActionButtonPress}
    />
  );
}

export default EndScreen;
