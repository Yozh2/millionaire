/**
 * MillionaireGame - Main game component for the quiz engine
 *
 * This is the central orchestrator component that:
 * - Accepts a GameConfig to customize the game
 * - Manages game flow between screens (start, playing, end)
 * - Provides theme context to child components
 * - Handles audio integration
 */

import { useEffect, useCallback } from 'react';
import { ThemeProvider } from '../context';
import { GameConfig, ThemeColors, Campaign } from '../types';
import { useGameState, useAudio } from '../hooks';
import { StartScreen } from './StartScreen';
import { GameScreen } from './GameScreen';
import { EndScreen } from './EndScreen';

interface MillionaireGameProps {
  /** Game configuration - defines modes, questions, themes, etc. */
  config: GameConfig;
}

/**
 * Main game component that renders the appropriate screen
 * based on current game state.
 */
export function MillionaireGame({ config }: MillionaireGameProps) {
  const gameState = useGameState(config);
  const audio = useAudio(config);

  // Preload audio on mount
  useEffect(() => {
    // Audio preloading is handled by the useAudio hook
  }, []);

  // Get current theme based on selected campaign
  const currentCampaign = gameState.selectedCampaign;
  const theme: ThemeColors = currentCampaign?.theme || config.campaigns[0].theme;

  // Get background style based on mode
  const getBackgroundStyle = () => {
    if (!theme.bgGradient) {
      // Default fantasy background
      return 'radial-gradient(ellipse at center, #1a0f0a 0%, #0d0604 50%, #000 100%)';
    }
    return theme.bgGradient;
  };

  // Wrapper for selectCampaign with sound
  const handleSelectCampaign = useCallback((campaign: Campaign) => {
    // Play campaign-specific select sound if defined, otherwise generic click
    if (campaign.selectSound) {
      audio.playSoundFile(campaign.selectSound);
    } else {
      audio.playSoundEffect('click');
    }
    gameState.selectCampaign(campaign);
  }, [audio, gameState]);

  // Wrapper for startGame with sound and music switch
  const handleStartGame = useCallback(() => {
    if (!gameState.selectedCampaign) return;

    audio.playSoundEffect('start');
    audio.playCampaignMusic(gameState.selectedCampaign);
    gameState.startGame();
  }, [audio, gameState]);

  // Wrapper for newGame with sound and music switch
  const handleNewGame = useCallback(() => {
    audio.playSoundEffect('restart');
    audio.playMainMenu();
    gameState.newGame();
  }, [audio, gameState]);

  return (
    <ThemeProvider theme={theme}>
      <div
        className="min-h-screen p-4 transition-all duration-500"
        style={{
          background: getBackgroundStyle(),
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Background Music */}
        <audio
          id="bg-music"
          loop
          preload="none"
          src={audio.currentTrack}
        />

        <div className="max-w-4xl mx-auto">
          {/* Start Screen */}
          {gameState.gameState === 'start' && (
            <StartScreen
              config={config}
              selectedCampaign={gameState.selectedCampaign}
              onSelectCampaign={handleSelectCampaign}
              onStartGame={handleStartGame}
              isMusicPlaying={audio.isMusicPlaying}
              onToggleMusic={audio.toggleMusic}
              theme={theme}
            />
          )}

          {/* Game Screen */}
          {gameState.gameState === 'playing' && gameState.questions.length > 0 && (
            <GameScreen
              config={config}
              gameState={gameState}
              audio={audio}
              theme={theme}
            />
          )}

          {/* End Screen */}
          {(gameState.gameState === 'won' ||
            gameState.gameState === 'lost' ||
            gameState.gameState === 'took_money') && (
            <EndScreen
              config={config}
              gameState={gameState}
              onNewGame={handleNewGame}
              isMusicPlaying={audio.isMusicPlaying}
              onToggleMusic={audio.toggleMusic}
              theme={theme}
            />
          )}

          {/* Footer */}
          <div className="text-center mt-4 text-xs tracking-wide font-serif italic text-amber-400/70">
            {config.strings.footer}
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default MillionaireGame;
