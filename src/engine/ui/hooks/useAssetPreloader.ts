/**
 * React hook for preloading game assets with progress tracking.
 *
 * Usage:
 *   const { isLoading, progress, error } = useAssetPreloader('level0');
 *   const { isLoading, progress } = useAssetPreloader('level1', 'bg3');
 *   const { isLoading, progress } = useAssetPreloader('level1_1', 'bg3', 'hero');
 */

import { useCallback, useEffect, useState } from 'react';

import { assetLoader, LoadLevel } from '../../services';

/** State returned by the useAssetPreloader hook */
export interface PreloadState {
  /** Whether assets are currently loading */
  isLoading: boolean;
  /** Loading progress (0-100) */
  progress: number;
  /** Number of assets loaded */
  loaded: number;
  /** Total number of assets to load */
  total: number;
  /** Error if loading failed */
  error: Error | null;
  /** Whether loading is complete */
  isComplete: boolean;
}

/** Options for the useAssetPreloader hook */
export interface UseAssetPreloaderOptions {
  /** Whether to start loading immediately (default: true) */
  autoLoad?: boolean;
  /** Callback when loading completes */
  onComplete?: () => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

/**
 * Hook to preload assets for a specific loading level.
 *
 * @param level - The loading level (level0, level1, level1_1, level2)
 * @param gameId - Game ID (required for level1+)
 * @param campaignId - Campaign ID (required for level1_1+)
 * @param options - Additional options
 */
export function useAssetPreloader(
  level: LoadLevel,
  gameId?: string,
  campaignId?: string,
  options: UseAssetPreloaderOptions = {}
): PreloadState & { reload: () => void } {
  const { autoLoad = true, onComplete, onError } = options;

  const [state, setState] = useState<PreloadState>({
    isLoading: false,
    progress: 0,
    loaded: 0,
    total: 0,
    error: null,
    isComplete: false,
  });

  const load = useCallback(async () => {
    // Check if already loaded
    if (assetLoader.isLevelLoaded(level, gameId, campaignId)) {
      setState({
        isLoading: false,
        progress: 100,
        loaded: 1,
        total: 1,
        error: null,
        isComplete: true,
      });
      onComplete?.();
      return;
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      progress: 0,
      error: null,
      isComplete: false,
    }));

    try {
      // First, get total count
      const assets = await assetLoader.getAssetsForLevel(
        level,
        gameId,
        campaignId
      );

      if (assets.length === 0) {
        setState({
          isLoading: false,
          progress: 100,
          loaded: 0,
          total: 0,
          error: null,
          isComplete: true,
        });
        onComplete?.();
        return;
      }

      setState((prev) => ({
        ...prev,
        total: assets.length,
      }));

      // Load with progress
      await assetLoader.loadLevel(level, gameId, campaignId, {
        onProgress: (loaded, total) => {
          const progress = total > 0 ? Math.round((loaded / total) * 100) : 0;
          setState((prev) => ({
            ...prev,
            loaded,
            total,
            progress,
          }));
        },
      });

      setState((prev) => ({
        ...prev,
        isLoading: false,
        progress: 100,
        isComplete: true,
      }));

      onComplete?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err,
      }));

      onError?.(err);
    }
  }, [level, gameId, campaignId, onComplete, onError]);

  // Auto-load on mount or when dependencies change
  useEffect(() => {
    if (autoLoad) {
      load();
    }
  }, [autoLoad, load]);

  return {
    ...state,
    reload: load,
  };
}

/**
 * Hook to trigger background preloading without blocking UI.
 * Does not track progress - use for "fire and forget" preloading.
 *
 * @param level - The loading level
 * @param gameId - Game ID
 * @param campaignId - Campaign ID
 */
export function useBackgroundPreload(
  level: LoadLevel,
  gameId?: string,
  campaignId?: string
): void {
  useEffect(() => {
    // Skip if dependencies are missing for the level
    if (level === 'level1' && !gameId) return;
    if ((level === 'level1_1' || level === 'level2') && (!gameId || !campaignId)) {
      return;
    }

    assetLoader.preloadInBackground(level, gameId, campaignId);
  }, [level, gameId, campaignId]);
}

/**
 * Hook to ensure assets are loaded before proceeding.
 * Returns a function that waits for loading to complete.
 *
 * Usage:
 *   const ensureLoaded = useEnsureAssetsLoaded('level1_1', 'bg3', 'hero');
 *   const handleStart = async () => {
 *     await ensureLoaded();
 *     startGame();
 *   };
 */
export function useEnsureAssetsLoaded(
  level: LoadLevel,
  gameId?: string,
  campaignId?: string
): () => Promise<void> {
  const ensure = useCallback(async () => {
    if (assetLoader.isLevelLoaded(level, gameId, campaignId)) {
      return;
    }

    await assetLoader.loadLevel(level, gameId, campaignId);
  }, [level, gameId, campaignId]);

  return ensure;
}
