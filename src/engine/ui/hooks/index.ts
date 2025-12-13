/**
 * Engine UI hooks barrel export
 */

export { useGameState, type UseGameStateReturn } from './useGameState';
export { useAudio, type UseAudioReturn } from './useAudio';
export { useEffects } from './useEffects';
export {
  useFavicon,
  useGameIcon,
  resolveGameIcon,
  resolveSharedIcon,
} from './useFavicon';
export {
  useAssetPreloader,
  useBackgroundPreload,
  useEnsureAssetsLoaded,
  type PreloadState,
  type UseAssetPreloaderOptions,
} from './useAssetPreloader';
