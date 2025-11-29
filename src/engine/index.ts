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
  ThemeColors,
  Campaign,
  Companion,
  LifelineConfig,
  LifelinesConfig,
  PrizesConfig,
  SoundEffects,
  AudioConfig,
  GameStrings,
  GameState,
  PhoneHint,
  AudienceHint,
  Hint,
  GameConfig,
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
} from './utils/audioPlayer';

// Components (to be added)
// export { MillionaireGame } from './components/MillionaireGame';
export {
  MillionaireGame,
  StartScreen,
  GameScreen,
  EndScreen,
} from './components';

// Context
export { ThemeProvider, useTheme, defaultTheme } from './context';
