/**
 * Quiz Game Engine
 *
 * A reusable "Who Wants to Be a Millionaire" style quiz game engine.
 * Configure with your own questions, themes, and assets.
 *
 * @example
 * ```tsx
 * import { MillionaireGame } from './engine';
 * import { bg3Config } from './games/bg3';
 *
 * function App() {
 *   return <MillionaireGame config={bg3Config} />;
 * }
 * ```
 */

// Types
export type {
  Question,
  ThemeColors,
  GameMode,
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

// Components (to be added)
// export { MillionaireGame } from './components/MillionaireGame';

// Hooks (to be added)
// export { useGameState } from './hooks/useGameState';
// export { useAudio } from './hooks/useAudio';
// export { useLifelines } from './hooks/useLifelines';

// Utils (to be added)
// export { playSound, playMusic, playVoice } from './utils/audioPlayer';
// export { getAssetPath } from './utils/assetLoader';
