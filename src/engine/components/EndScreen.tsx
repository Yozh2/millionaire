/**
 * EndScreen - Game over screens (won, lost, took money)
 */

import { useEffect } from 'react';
import { GameConfig, ThemeColors } from '../types';
import { UseGameStateReturn } from '../hooks/useGameState';
import { Panel, PanelHeader } from '../../components/ui';

// Type for effects hook return
interface EffectsAPI {
  triggerConfetti: (origin?: { x: number; y: number }) => void;
  triggerCoins: (origin?: { x: number; y: number }) => void;
  triggerSparks: (origin?: { x: number; y: number }) => void;
  triggerPulse: (origin?: { x: number; y: number }, color?: string) => void;
  triggerFireworks: () => void;
}

// Default emoji-based icons
const DefaultTrophyIcon = () => (
  <div className="w-24 h-24 mx-auto flex items-center justify-center text-6xl animate-bounce">
    🏆
  </div>
);
const DefaultFailIcon = () => (
  <div className="w-24 h-24 mx-auto flex items-center justify-center text-6xl">
    ❌
  </div>
);
const DefaultMoneyIcon = () => (
  <div className="w-24 h-24 mx-auto flex items-center justify-center text-6xl">
    💰
  </div>
);
const DefaultCoinIcon = () => <span className="mr-1">🪙</span>;

interface EndScreenProps {
  config: GameConfig;
  gameState: UseGameStateReturn;
  onNewGame: () => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  theme: ThemeColors;
  effects?: EffectsAPI;
}

export function EndScreen({
  config,
  gameState,
  onNewGame,
  isMusicPlaying,
  onToggleMusic,
  theme,
  effects,
}: EndScreenProps) {
  const { gameState: state, wonPrize, currentQuestion, questions } = gameState;

  // Trigger celebration effects on mount
  useEffect(() => {
    if (state === 'won') {
      // Big win - coins rain!
      effects?.triggerCoins({ x: 0.5, y: 0.3 });
    } else if (state === 'took_money' && wonPrize > 0) {
      // Took money with prize - coins
      effects?.triggerCoins({ x: 0.5, y: 0.5 });
    }
  }, [state, wonPrize, effects]);

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

  return (
    <div className={screenClass}>
      {/* Header */}
      <Panel className="mb-4 p-1 animate-slide-in stagger-1">
        <PanelHeader>{config.strings.headerTitle}</PanelHeader>
        <div className="p-4 text-center">
          {/* Music Toggle */}
          <div className="flex justify-end mb-2">
            <button
              onClick={onToggleMusic}
              className="text-2xl hover:scale-110 transition-transform"
              title={isMusicPlaying ? config.strings.musicOn : config.strings.musicOff}
            >
              {isMusicPlaying ? '🔊' : '🔇'}
            </button>
          </div>

          {/* Title */}
          <h1
            className={`text-2xl md:text-3xl font-bold tracking-wider mb-1 transition-colors duration-500 ${theme.textPrimary}`}
            style={{
              textShadow: `0 0 15px ${theme.glowColor}, 0 0 30px ${theme.glowSecondary}, 2px 2px 4px #000`,
              fontFamily: 'Georgia, serif',
            }}
          >
            {config.title}
          </h1>
          <h2
            className={`text-lg tracking-wide transition-colors duration-500 ${theme.textPrimary}`}
            style={{
              lineHeight: '1.5',
              fontFamily: 'Arial, sans-serif',
              fontStyle: 'italic',
            }}
          >
            {config.subtitle}
          </h2>
        </div>
      </Panel>

      {/* End Screen Panel */}
      <Panel className="p-1 animate-slide-in stagger-2">
        <PanelHeader>{getHeader()}</PanelHeader>
        <div className="text-center py-12 px-4">
          <div className="animate-pop-in stagger-3">
            {getIcon()}
          </div>

          <h2
            className={`text-2xl font-bold mt-4 mb-4 tracking-wide font-serif animate-slide-in stagger-4 ${getTitleColor()}`}
            style={{ textShadow: getTextShadow() }}
          >
            {getTitle()}
          </h2>

          <p className={`${theme.textSecondary} text-lg mb-2 font-serif`}>
            {getText()}
          </p>

          <div className="flex items-center justify-center gap-2 text-xl text-yellow-300 font-bold mb-6 font-serif animate-prize stagger-5">
            {CoinIcon && <CoinIcon />}
            <span>
              {config.strings.prizeLabel} {wonPrize} {config.prizes.currency}
            </span>
          </div>

          {state === 'lost' && questions[currentQuestion] && (
            <p className="text-amber-400 mb-6 text-sm font-serif italic">
              {config.strings.correctAnswerLabel}{' '}
              {questions[currentQuestion].answers[questions[currentQuestion].correct]}
            </p>
          )}

          {/* New Game Button */}
          <div className="animate-pop-in stagger-6">
            <button
              onClick={onNewGame}
              className={`action-btn px-8 py-3 bg-gradient-to-b ${theme.bgButton} text-white font-bold text-lg tracking-wide border-4 ${theme.borderLight} font-serif`}
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
