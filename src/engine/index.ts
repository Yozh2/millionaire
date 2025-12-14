/**
 * Quiz Game Engine
 *
 * A reusable "Who Wants to Be a Millionaire" style quiz game engine.
 * Configure with your own questions, themes, and assets.
 *
 * @example
 * ```tsx
 * import { MillionaireGame } from './engine';
 * import { myGameConfig } from './games/myGame';
 *
 * function App() {
 *   return <MillionaireGame config={myGameConfig} />;
 * }
 * ```
 */

import './ui/styles/engine.css';

// Types
export type {
  Question,
  QuestionPool,
  QuestionDifficulty,
  PrizeLadder,
  ThemeColors,
  Campaign,
  Companion,
  LifelineKind,
  ActionConfig,
  LifelineConfig,
  LifelinesConfig,
  PrizesConfig,
  SoundEffects,
  AudioConfig,
  GameStrings,
  GameState,
  RewardKind,
  LifelinePhoneResult,
  LifelineAudienceResult,
  LifelineResult,
  PhoneHint,
  AudienceHint,
  Hint,
  GameConfig,
  DrawCoinFunction,
  HeaderSlideshowConfig,
  SlideshowScreen,
  EffectOrigin,
  EffectsAPI,
} from './types';

// Hooks
export { useGameState, type UseGameStateReturn } from './ui/hooks/useGameState';
export { useAudio, type UseAudioReturn } from './ui/hooks/useAudio';

// Utils
export {
  getBasePath,
  getAssetPaths,
  checkFileExists,
  resolveAssetPath,
  type AssetType,
} from './utils/assetLoader';

export {
  setGameId,
  setSoundEnabled,
  isSoundEnabled,
  playSound,
  playSoundByType,
  playMusic,
  playVoice,
  preloadSounds,
  clearAudioCache,
  ensureAudioContext,
  preDecodeAudio,
  warmUpAudioContext,
  isAudioDecoded,
} from './utils/audioPlayer';

export {
  selectQuestionsFromPool,
  calculatePrizeLadder,
  getGuaranteedPrize,
  getQuestionDifficulty,
} from './game';

// UI entry + screens
export { MillionaireGame } from './ui/MillionaireGame';
export { StartScreen } from './ui/screens/StartScreen';
export { GameScreen } from './ui/screens/GameScreen';
export { EndScreen } from './ui/screens/EndScreen';
export {
  LoadingScreen,
  LoadingIndicator,
  type LoadingScreenProps,
} from './ui/screens/LoadingScreen';

// UI utils (for custom coin drawing)
export { ParticleCanvas, type EffectType, drawDefaultCoin } from './ui/effects/ParticleCanvas';

// Error boundary (app-level safety)
export { ErrorBoundary } from './ui/components/errors/ErrorBoundary';

// Default icon pack
export {
  DefaultCoinIcon,
  DefaultPhoneHintIcon,
  DefaultAudienceHintIcon,
  DefaultTrophyIcon,
  DefaultFailIcon,
  DefaultMoneyIcon,
} from './ui/icons/DefaultIcons';

// Context
export { ThemeProvider, useTheme, defaultTheme } from './ui/theme';

// Hooks
export {
  useFavicon,
  useGameIcon,
  resolveGameIcon,
  resolveSharedIcon,
  useEffects,
  useAssetPreloader,
  useBackgroundPreload,
  useEnsureAssetsLoaded,
  type PreloadState,
} from './ui/hooks';

// Services
export { assetLoader, type LoadLevel, type AssetManifest } from './services';

// Constants
export {
  MAX_QUESTIONS_PER_TIER,
  DIFFICULTY_TIERS,
  DEFAULT_SLIDESHOW_TRANSITION_MS,
  DEFAULT_SLIDESHOW_DISPLAY_MS,
  DEFAULT_SLIDESHOW_OPACITY,
  DEFAULT_MUSIC_VOLUME,
  DEFAULT_SOUND_VOLUME,
  DEFAULT_VOICE_VOLUME,
  ANSWER_REVEAL_DURATION_MS,
  PARTICLE_EFFECT_DURATION_MS,
  STORAGE_KEY_SOUND_ENABLED,
} from './constants';
