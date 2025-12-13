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
export { useGameState, type UseGameStateReturn } from './hooks/useGameState';
export { useAudio, type UseAudioReturn } from './hooks/useAudio';

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
} from './utils/questionGenerator';

// Components (to be added)
// export { MillionaireGame } from './components/MillionaireGame';
export {
  MillionaireGame,
  StartScreen,
  GameScreen,
  EndScreen,
} from './components';

// Particle utils (for custom coin drawing)
export { drawDefaultCoin } from './components/ParticleCanvas';

// Context
export { ThemeProvider, useTheme, defaultTheme } from './context';

// Hooks
export {
  useFavicon,
  useGameIcon,
  resolveGameIcon,
  resolveSharedIcon,
  useAssetPreloader,
  useBackgroundPreload,
  useEnsureAssetsLoaded,
  type PreloadState,
} from './hooks';

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
