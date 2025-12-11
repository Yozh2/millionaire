/**
 * EndScreen - Game over screens (won, lost, took money)
 */

import { useEffect, useRef, useCallback, useMemo } from 'react';
import type { PointerEvent } from 'react';
import { GameConfig, ThemeColors, SlideshowScreen, EffectsAPI } from '../types';
import { UseGameStateReturn } from '../hooks/useGameState';
import { Panel, PanelHeader } from './ui';
import { HeaderPanel } from './HeaderPanel';
import {
  DefaultCoinIcon,
  DefaultTrophyIcon,
  DefaultFailIcon,
  DefaultMoneyIcon,
} from './DefaultIcons';

interface EndScreenProps {
  config: GameConfig;
  gameState: UseGameStateReturn;
  onNewGame: () => void;
  onBigButtonPress: (e?: PointerEvent<Element>) => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  theme: ThemeColors;
  effects?: EffectsAPI;
}

export function EndScreen({
  config,
  gameState,
  onNewGame,
  onBigButtonPress,
  isMusicPlaying,
  onToggleMusic,
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

  // Get icons from config or use defaults
  const CoinIcon = config.icons?.coin || DefaultCoinIcon;

  // Get the correct icon component
  const getIcon = () => {
    if (config.endIcons) {
      if (state === 'won' && config.endIcons.won) {
        const WonIcon = config.endIcons.won;
        return <WonIcon />;
      }
      if (state === 'lost' && config.endIcons.lost) {
        const LostIcon = config.endIcons.lost;
        return <LostIcon />;
      }
      if (state === 'took_money' && config.endIcons.tookMoney) {
        const TookMoneyIcon = config.endIcons.tookMoney;
        return <TookMoneyIcon />;
      }
    }

    // Default icons
    if (state === 'won') return <DefaultTrophyIcon />;
    if (state === 'lost') return <DefaultFailIcon />;
    return <DefaultMoneyIcon />;
  };

  const getTitle = () => {
    if (state === 'won') return config.strings.wonTitle;
    if (state === 'lost') return config.strings.lostTitle;
    return config.strings.tookMoneyTitle;
  };

  const getText = () => {
    if (state === 'won') return config.strings.wonText;
    if (state === 'lost') return config.strings.lostText;
    return config.strings.tookMoneyText;
  };

  const getHeader = () => {
    if (state === 'won') return config.strings.wonHeader;
    if (state === 'lost') return config.strings.lostHeader;
    return config.strings.tookMoneyHeader;
  };

  const getTitleColor = () => {
    if (state === 'won') return 'text-yellow-400';
    if (state === 'lost') return 'text-red-400';
    return theme.textPrimary;
  };

  const getTextShadow = () => {
    if (state === 'won') return '0 0 25px #facc15, 0 2px 8px #000';
    if (state === 'lost') return '0 0 25px #ef4444, 0 2px 8px #000';
    return `0 0 25px ${theme.glowColor}, 0 2px 8px #000`;
  };

  // Determine screen animation class based on state
  const screenClass = state === 'won' ? 'screen-victory' :
                      state === 'lost' ? 'screen-defeat' :
                      'screen-transition-dramatic';

  // Map game state to slideshow screen type
  const slideshowScreen: SlideshowScreen = useMemo(() => {
    if (state === 'won') return 'won';
    if (state === 'lost') return 'lost';
    return 'took';
  }, [state]);

  return (
    <div className={screenClass}>
      {/* Header */}
      <HeaderPanel
        config={config}
        theme={theme}
        slideshowScreen={slideshowScreen}
        campaignId={gameState.selectedCampaign?.id}
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={onToggleMusic}
      />

      {/* End Screen Panel */}
      <Panel className="p-1 animate-slide-in stagger-2">
        <PanelHeader>{getHeader()}</PanelHeader>
        <div className="text-center py-12 px-4">
          <div ref={iconRef} className="animate-pop-in stagger-3">
            {getIcon()}
          </div>

          <h2
            className={`text-2xl font-bold mt-4 mb-4 tracking-wide animate-slide-in stagger-4 ${getTitleColor()}`}
            style={{ textShadow: getTextShadow() }}
          >
            {getTitle()}
          </h2>

          <p className={`${theme.textSecondary} text-lg mb-2`}>
            {getText()}
          </p>

          <div className="flex items-center justify-center gap-2 text-xl text-yellow-300 font-bold mb-6 animate-prize stagger-5">
            {CoinIcon && <CoinIcon />}
            <span>
              {wonPrize} {config.prizes.currency}
            </span>
          </div>

          {/* New Game Button */}
          <div className="animate-pop-in stagger-6">
          <button
            onClick={onNewGame}
            onPointerDown={(e) => onBigButtonPress(e)}
            className={`action-btn px-8 py-3 bg-gradient-to-b ${theme.bgButton} text-white font-bold text-lg tracking-wide border-4 ${theme.borderLight}`}
            style={{
              ['--btn-glow' as string]: theme.glow,
              boxShadow: `0 5px 20px rgba(0, 0, 0, 0.3), 0 0 25px ${theme.glow}`,
              borderStyle: 'ridge',
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
              }}
            >
              {config.strings.newGameButton}
            </button>
          </div>
        </div>
      </Panel>
    </div>
  );
}

export default EndScreen;
