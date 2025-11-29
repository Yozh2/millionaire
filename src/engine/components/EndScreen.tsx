/**
 * EndScreen - Game over screens (won, lost, took money)
 */

import { GameConfig, ThemeColors } from '../types';
import { UseGameStateReturn } from '../hooks/useGameState';
import { Panel, PanelHeader } from '../../components/ui';

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
}

export function EndScreen({
  config,
  gameState,
  onNewGame,
  isMusicPlaying,
  onToggleMusic,
  theme,
}: EndScreenProps) {
  const { gameState: state, wonPrize, currentQuestion, questions } = gameState;

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

  return (
    <>
      {/* Header */}
      <Panel className="mb-4 p-1">
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
      <Panel className="p-1">
        <PanelHeader>{getHeader()}</PanelHeader>
        <div className="text-center py-12 px-4">
          {getIcon()}

          <h2
            className={`text-2xl font-bold mt-4 mb-4 tracking-wide font-serif ${getTitleColor()}`}
            style={{ textShadow: getTextShadow() }}
          >
            {getTitle()}
          </h2>

          <p className={`${theme.textSecondary} text-lg mb-2 font-serif`}>
            {getText()}
          </p>

          <div className="flex items-center justify-center gap-2 text-xl text-yellow-300 font-bold mb-6 font-serif">
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

          <button
            onClick={onNewGame}
            className={`px-8 py-3 bg-gradient-to-b ${theme.bgButton} text-white font-bold tracking-wide border-4 ${theme.borderLight} ${theme.bgButtonHover} transition-all transform hover:scale-105 font-serif`}
            style={{
              boxShadow: `0 0 25px ${theme.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
              borderStyle: 'ridge',
              textShadow: '0 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            {config.strings.newGameButton}
          </button>
        </div>
      </Panel>
    </>
  );
}

export default EndScreen;
