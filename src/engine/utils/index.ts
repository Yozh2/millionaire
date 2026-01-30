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

export {
  selectQuestionsFromPool,
  calculatePrizeLadder,
  getGuaranteedPrize,
  getQuestionDifficulty,
} from './questionGenerator';

export { applyNoBreakMarkup, applyNoBreakMarkupDeep } from './noBreakMarkup';
export { preprocessGameConfig } from './preprocessGameConfig';
export { createCampaignsFromGlobs } from './createCampaignsFromGlobs';
export { createCampaignsForGame } from './createCampaignsForGame';
export { defineGameConfig } from './defineGameConfig';
