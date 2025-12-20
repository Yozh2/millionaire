/**
 * MillionaireGame - Main game component for the quiz engine
 *
 * This is the central orchestrator component that:
 * - Accepts a GameConfig to customize the game
 * - Manages game flow between screens (start, play, end)
 * - Provides theme context to child components
 * - Handles audio integration
 * - Manages asset preloading across loading levels
 */

import { useEffect, useCallback, useMemo, useRef, useState } from 'react';
import type { PointerEvent } from 'react';

import { ThemeProvider } from './theme';
import {
  useGameState,
  useAudio,
  useEffects,
  useFavicon,
  useAssetPreloader,
} from './hooks';
import { assetLoader, logger } from '../services';
import { Campaign, DEFAULT_FONT_FAMILY, GameConfig, ThemeColors } from '@engine/types';
import { EndScreen } from './screens/EndScreen';
import { GameScreen } from './screens/GameScreen';
import { LoadingScreen } from './screens/LoadingScreen';
import { ParticleCanvas } from './effects/ParticleCanvas';
import { StartScreen } from './screens/StartScreen';
import { PortalHeader } from './layout/header/PortalHeader';
import { PortalHeaderTitle, type PortalHeaderTitlePhase } from './layout/header/PortalHeaderTitle';
import { SoundConsentOverlay } from './components/overlays/SoundConsentOverlay';
import { DEFAULT_PORTAL_HEADER_TUNER_VALUES } from '@engine/ui/components/sliders/portalHeaderTunerDefaults';
import { STORAGE_KEY_SOUND_ENABLED } from '../constants';
import { createCoinDrawFromConfig } from './effects/createCoinDrawFromConfig';
import { preprocessGameConfig } from '../utils/preprocessGameConfig';

interface MillionaireGameProps {
  /** Game configuration - defines modes, questions, themes, etc. */
  config: GameConfig;
}

/**
 * Main game component that renders the appropriate screen
 * based on current game state.
 */
export function MillionaireGame({ config: rawConfig }: MillionaireGameProps) {
  const config = useMemo(() => preprocessGameConfig(rawConfig), [rawConfig]);

  const gameState = useGameState(config);
  const audio = useAudio(config);
  const effects = useEffects();
  const coinDrawFn = useMemo(() => createCoinDrawFromConfig(config), [config]);

  // Set game-specific favicon with emoji fallback
  useFavicon(config.id, config.emoji);

  // Dev-only cheat command to jump straight to victory screen from browser console
  const { forceWin, prizeLadder, wonPrize } = gameState;
  const { playVictory } = audio;
  const { triggerCoins } = effects;

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const devWindow = window as typeof window & { sans?: () => string };

    devWindow.sans = () => {
      const prize =
        prizeLadder.values[prizeLadder.values.length - 1] ??
        wonPrize ??
        '0';

      forceWin(prize);
      playVictory();
      triggerCoins({ x: 0.5, y: 0.35 });
      return 'sans: instant victory triggered';
    };

    return () => {
      delete devWindow.sans;
    };
  }, [forceWin, playVictory, prizeLadder.values, triggerCoins, wonPrize]);

  // === Asset Preloading ===

  // Level 1: Load game assets (icons, sounds, start images)
  const level1Preload = useAssetPreloader('level1', config.id);

  // Track which campaign is being preloaded for level 1.1
  const [preloadingCampaign, setPreloadingCampaign] = useState<string | null>(
    null
  );
  const [level11Progress, setLevel11Progress] = useState(0);
  const [isWaitingForLevel11, setIsWaitingForLevel11] = useState(false);
  const soundConsentKey = useMemo(
    () => `engine:sound-consent-shown:${config.id}`,
    [config.id]
  );
  const [isSoundConsentDone, setIsSoundConsentDone] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(soundConsentKey) === 'true';
    } catch {
      return false;
    }
  });
  const [isSoundConsentClosing, setIsSoundConsentClosing] = useState(false);

  // Intro title lifecycle: show once when header portal first reveals (start),
  // then evaporate on first campaign selection; show again only after NEW_GAME.
  const [introTitlePhase, setIntroTitlePhase] = useState<PortalHeaderTitlePhase | null>(null);
  const [isIntroTitleDismissed, setIsIntroTitleDismissed] = useState(false);
  const introTitleTriggeredRef = useRef(false);

  useEffect(() => {
    try {
      setIsSoundConsentDone(sessionStorage.getItem(soundConsentKey) === 'true');
    } catch {
      setIsSoundConsentDone(false);
    }
    setIsSoundConsentClosing(false);
  }, [soundConsentKey]);

  // Preload campaign assets when campaign is selected (background)
  useEffect(() => {
    const campaignId = gameState.selectedCampaign?.id;
    if (!campaignId || preloadingCampaign === campaignId) return;

    setPreloadingCampaign(campaignId);
    setLevel11Progress(0);

    assetLoader
      .loadLevel('level1_1', config.id, campaignId, {
        onProgress: (loaded, total) => {
          const progress = total > 0 ? Math.round((loaded / total) * 100) : 100;
          setLevel11Progress(progress);
        },
      })
      .catch((err) => logger.millionaireGame.warn('Level 1.1 preload', { error: err }));
  }, [gameState.selectedCampaign?.id, config.id, preloadingCampaign]);

  // Start Level 2 background loading when game starts
  useEffect(() => {
    if (
      gameState.gameState === 'play' &&
      gameState.selectedCampaign
    ) {
      assetLoader.preloadInBackground(
        'level2',
        config.id,
        gameState.selectedCampaign.id
      );
    }
  }, [gameState.gameState, gameState.selectedCampaign, config.id]);

  // Get current theme based on selected campaign
  const currentCampaign = gameState.selectedCampaign;
  const theme: ThemeColors =
    currentCampaign?.theme || config.campaigns[0].theme;

  // Get background style based on mode
  const getBackgroundStyle = () => {
    if (!theme.bgGradient) {
      // Default fantasy background
      return 'radial-gradient(ellipse at center, #1a0f0a 0%, #0d0604 50%, #000 100%)';
    }
    return theme.bgGradient;
  };

  const loadingGameTitle =
    config.systemStrings?.loadingGameTitle?.replace('{title}', config.title) ??
    `Загрузка ${config.title}...`;
  const loadingGameSubtitle =
    config.systemStrings?.loadingGameSubtitle ?? 'Подготавливаем игру';
  const loadingCampaignTitle =
    config.systemStrings?.loadingCampaignTitle ?? 'Подготовка кампании...';

  // Wrapper for selectCampaign with sound (campaign select SFX only if user enabled sound)
  const handleSelectCampaign = useCallback((campaign: Campaign) => {
    if (!isIntroTitleDismissed) {
      setIsIntroTitleDismissed(true);
      setIntroTitlePhase((prev) => (prev && prev !== 'exit' ? 'exit' : prev));
    }

    // Play campaign-specific select sound if defined, otherwise generic click
    if (campaign.selectSound) {
      audio.playCampaignSelectSound(campaign.selectSound);
    } else {
      audio.playSoundEffect('answerButton');
    }
    gameState.selectCampaign(campaign);
  }, [audio, gameState, isIntroTitleDismissed]);

  // Sound on button press (mousedown/touchstart) - synced with button landing animation
  const handleActionButtonPress = useCallback(
    (e?: PointerEvent<Element>) => {
      // Only play for primary click/tap.
      // Safari may report `button !== 0` for touch pointers.
      if (e && e.button !== 0 && e.pointerType !== 'touch') return;

      // Safari (especially iOS) requires audio to start inside the user gesture handler.
      audio.playSoundEffect('actionButton');
    },
    [audio]
  );

  // Wrapper for startGame with music switch
  const handleStartGame = useCallback(async () => {
    if (!gameState.selectedCampaign) return;

    // Stop any lingering campaign select sound when starting the game
    audio.stopCampaignSelectSound();

    const campaignId = gameState.selectedCampaign.id;

    // Check if level 1.1 is loaded, if not show loading
    if (!assetLoader.isLevelLoaded('level1_1', config.id, campaignId)) {
      setIsWaitingForLevel11(true);

      try {
        await assetLoader.loadLevel('level1_1', config.id, campaignId, {
          onProgress: (loaded, total) => {
            const progress = total > 0
              ? Math.round((loaded / total) * 100)
              : 100;
            setLevel11Progress(progress);
          },
        });
      } catch (err) {
        logger.millionaireGame.warn('Level 1.1 load error', { error: err });
      }

      setIsWaitingForLevel11(false);
    }

    audio.playCampaignMusic(gameState.selectedCampaign);
    gameState.startGame();
  }, [audio, gameState, config.id]);

  // Wrapper for newGame with music switch
  const handleNewGame = useCallback(() => {
    audio.playMainMenu();
    introTitleTriggeredRef.current = false;
    setIsIntroTitleDismissed(false);
    setIntroTitlePhase(null);
    gameState.newGame();
  }, [audio, gameState]);

  const markSoundConsentDone = useCallback(() => {
    setIsSoundConsentDone(true);
    try {
      sessionStorage.setItem(soundConsentKey, 'true');
    } catch {
      // ignore storage errors
    }
  }, [soundConsentKey]);

  const handleEnableSound = useCallback(() => {
    if (!audio.isMusicPlaying) {
      audio.toggleMusic();
    }
    audio.playSoundEffect('answerButton');
    audio.playMainMenu();
    setIsSoundConsentClosing(true);
    window.setTimeout(() => {
      markSoundConsentDone();
      setIsSoundConsentClosing(false);
    }, 220);
  }, [audio, markSoundConsentDone]);

  const handleDisableSound = useCallback(() => {
    if (audio.isMusicPlaying) {
      audio.playSoundEffect('answerButton');
      audio.toggleMusic();
    } else {
      try {
        localStorage.setItem(STORAGE_KEY_SOUND_ENABLED, 'false');
      } catch {
        // ignore storage errors
      }
    }
    setIsSoundConsentClosing(true);
    window.setTimeout(() => {
      markSoundConsentDone();
      setIsSoundConsentClosing(false);
    }, 220);
  }, [audio, markSoundConsentDone]);

  const showHeader = !level1Preload.isLoading && !isWaitingForLevel11;
  const showSoundConsent =
    showHeader &&
    gameState.gameState === 'start' &&
    (!isSoundConsentDone || isSoundConsentClosing);
  const isHeaderActivated =
    showHeader && !showSoundConsent;
  const [panelsCeilingPx, setPanelsCeilingPx] = useState(() =>
    Math.round(DEFAULT_PORTAL_HEADER_TUNER_VALUES.panelsOverlap)
  );
  const [portalHeightPx, setPortalHeightPx] = useState(0);

  const effectivePanelsCeilingPx = useMemo(() => {
    if (!showHeader) return 0;

    const overlapRatio = 0.45;
    const minPanelsTopPx = 130;
    const maxOverlapByRatio = portalHeightPx
      ? Math.max(0, Math.round(portalHeightPx * overlapRatio))
      : 220;
    const maxOverlapByMinTop = portalHeightPx
      ? Math.max(0, portalHeightPx - minPanelsTopPx)
      : 220;
    const maxOverlapPx = Math.min(220, maxOverlapByRatio, maxOverlapByMinTop);

    return Math.max(panelsCeilingPx, -maxOverlapPx);
  }, [panelsCeilingPx, portalHeightPx, showHeader]);

  useEffect(() => {
    if (introTitleTriggeredRef.current) return;
    if (isIntroTitleDismissed) return;
    if (!isHeaderActivated) return;
    if (gameState.gameState !== 'start') return;
    if (gameState.selectedCampaign) return;

    introTitleTriggeredRef.current = true;
    setIntroTitlePhase('enter');
  }, [
    gameState.gameState,
    gameState.selectedCampaign,
    isHeaderActivated,
    isIntroTitleDismissed,
  ]);

  const slideshowScreen = useMemo(() => {
    return gameState.gameState;
  }, [gameState.gameState]);

  const difficultyLevel = useMemo(() => {
    if (gameState.gameState !== 'play') return undefined;
    const total = gameState.totalQuestions || 0;
    if (total <= 0) return undefined;

    const progress = gameState.currentQuestion / total;
    if (progress < 1 / 3) return 'easy';
    if (progress < 2 / 3) return 'medium';
    return 'hard';
  }, [gameState.currentQuestion, gameState.gameState, gameState.totalQuestions]);

  const screenWrapperClass =
    gameState.gameState === 'victory'
      ? 'screen-victory'
      : gameState.gameState === 'defeat'
        ? 'screen-defeat'
        : gameState.gameState === 'retreat'
          ? 'screen-transition-dramatic'
          : 'screen-transition';

  return (
    <ThemeProvider theme={theme}>
      <div
        className="engine min-h-screen p-4 transition-all duration-500 relative overflow-hidden flex flex-col"
        style={{
          background: getBackgroundStyle(),
          fontFamily: config.fontFamily || DEFAULT_FONT_FAMILY,
        }}
      >
        {/* Loading Screen for Level 1 */}
        {level1Preload.isLoading && (
          <LoadingScreen
            progress={level1Preload.progress}
            title={loadingGameTitle}
            subtitle={loadingGameSubtitle}
            theme={theme}
          />
        )}

        {/* Loading Screen for Level 1.1 (waiting for campaign assets) */}
        {isWaitingForLevel11 && !level1Preload.isLoading && (
          <LoadingScreen
            progress={level11Progress}
            title={loadingCampaignTitle}
            subtitle={gameState.selectedCampaign?.name}
            theme={theme}
          />
        )}
        {/* Particle Effects Layer */}
        <ParticleCanvas
          effect={effects.effectState.effect}
          origin={effects.effectState.origin}
          primaryColor={effects.effectState.primaryColor}
          secondaryColor={effects.effectState.secondaryColor}
          intensity={effects.effectState.intensity}
          drawCoin={coinDrawFn}
          lostSparkColors={config.lostSparkColors}
        />

        {showSoundConsent && (
          <SoundConsentOverlay
            config={config}
            onEnableSound={handleEnableSound}
            onDisableSound={handleDisableSound}
            isClosing={isSoundConsentClosing}
          />
        )}

        {/* Background Music */}
        <audio
          id="bg-music"
          loop
          preload="none"
        />

          <div className="w-full flex-1 flex flex-col">
            {showHeader && (
            <div className="relative overflow-visible z-0">
              {introTitlePhase && (
                <PortalHeaderTitle
                  config={config}
                  theme={theme}
                  phase={introTitlePhase}
                  onEntered={() =>
                    setIntroTitlePhase((prev) => (prev === 'enter' ? 'shown' : prev))
                  }
                  onExited={() => setIntroTitlePhase(null)}
                />
              )}

              <PortalHeader
                config={config}
                slideshowScreen={slideshowScreen}
                campaignId={gameState.selectedCampaign?.id}
                difficulty={difficultyLevel}
                isMusicPlaying={audio.isMusicPlaying}
                onToggleMusic={audio.toggleMusic}
                activated={isHeaderActivated}
                onPanelsCeilingChange={setPanelsCeilingPx}
                onPortalHeightChange={setPortalHeightPx}
              />
            </div>
          )}

          <div className="relative z-10 max-w-4xl mx-auto w-full flex-1 flex flex-col">
            <div
              key={gameState.gameState}
              className={screenWrapperClass}
              style={{
                marginTop: effectivePanelsCeilingPx,
              }}
            >
              {/* Start Screen */}
              {gameState.gameState === 'start' &&
                !level1Preload.isLoading &&
                !isWaitingForLevel11 && (
                <StartScreen
                  config={config}
                  selectedCampaign={gameState.selectedCampaign}
                  onSelectCampaign={handleSelectCampaign}
                  onStartGame={handleStartGame}
                  onActionButtonPress={handleActionButtonPress}
                  theme={theme}
                />
              )}

              {/* Game Screen */}
              {gameState.gameState === 'play' && gameState.questions.length > 0 && (
                <GameScreen
                  config={config}
                  gameState={gameState}
                  audio={audio}
                  theme={theme}
                  effects={effects}
                  onNewGame={handleNewGame}
                />
              )}

              {/* End Screen */}
              {(gameState.gameState === 'victory' ||
                gameState.gameState === 'defeat' ||
                gameState.gameState === 'retreat') && (
                <EndScreen
                  config={config}
                  gameState={gameState}
                  onNewGame={handleNewGame}
                  onActionButtonPress={handleActionButtonPress}
                  theme={theme}
                  effects={effects}
                />
              )}
            </div>

            {/* Footer */}
            <div className="text-center mt-4 text-xs tracking-wide italic text-amber-400/70">
              {config.strings.footer}
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default MillionaireGame;
