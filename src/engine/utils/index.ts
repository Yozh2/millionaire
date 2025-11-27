/**
 * Engine utilities barrel export
 */

export {
  getBasePath,
  getAssetPaths,
  checkFileExists,
  resolveAssetPath,
  preloadAudioFile,
  preloadAssets,
  type AssetType,
  type AssetResolution,
} from './assetLoader';

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
  type PlayResult,
} from './audioPlayer';
