/**
 * Asset Loader Service
 *
 * Handles preloading and caching of game assets (images, audio).
 * Implements a multi-level loading strategy for optimal user experience.
 *
 * Usage:
 *   import { assetLoader } from '@/engine/services';
 *
 *   // Load assets for a level
 *   await assetLoader.loadLevel('level0', { onProgress: (l, t) => ... });
 *
 *   // Check if asset is cached
 *   if (assetLoader.isLoaded('/games/bg3/sounds/Click.ogg')) { ... }
 */

import type {
  AssetManifest,
  CampaignAssets,
  GameAssets,
  LoadLevel,
  ProgressCallback,
} from './types';
import { logger } from './logger';
import {
  preDecodeAudio,
  registerPreloadedAudioBuffer,
} from '../utils/audioPlayer';
import { getBasePath } from '../assets/paths';

const EMPTY_MANIFEST: AssetManifest = {
  version: '0.0.0',
  engine: { icons: [], images: [], sounds: [] },
  games: {},
};

/** Cached assets by URL */
interface AssetCache {
  images: Map<string, HTMLImageElement>;
  audio: Map<string, ArrayBuffer>;
}

/** Loading state tracking */
interface LoadingState {
  /** Promises for assets currently being loaded */
  pending: Map<string, Promise<void>>;
  /** Set of fully loaded asset URLs */
  loaded: Set<string>;
  /** Set of failed asset URLs */
  failed: Set<string>;
}

/** Options for loading operations */
export interface LoadOptions {
  /** Progress callback */
  onProgress?: ProgressCallback;
  /** Whether to continue on individual asset failures */
  continueOnError?: boolean;
}

/**
 * Asset Loader singleton class.
 * Manages preloading, caching, and retrieval of game assets.
 */
class AssetLoader {
  private manifest: AssetManifest | null = null;
  private manifestPromise: Promise<AssetManifest> | null = null;

  private cache: AssetCache = {
    images: new Map(),
    audio: new Map(),
  };

  private state: LoadingState = {
    pending: new Map(),
    loaded: new Set(),
    failed: new Set(),
  };

  /** Levels that have been fully loaded */
  private loadedLevels: Set<string> = new Set();

  // ============================================
  // Manifest Loading
  // ============================================

  /**
   * Load the asset manifest.
   * Cached after first load.
   */
  async loadManifest(): Promise<AssetManifest> {
    if (this.manifest) {
      return this.manifest;
    }

    if (this.manifestPromise) {
      return this.manifestPromise;
    }

    const manifestUrl = `${getBasePath()}asset-manifest.json`;

    this.manifestPromise = fetch(manifestUrl)
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as AssetManifest;
      })
      .catch(() => null)
      .then((data) => {
        if (!data) {
          this.manifest = EMPTY_MANIFEST;
          logger.assetLoader.warn('Asset manifest not found; continuing without preloading', {
            url: manifestUrl,
          });
          return this.manifest;
        }

        this.manifest = data;
        logger.assetLoader.info(
          `Manifest loaded: ${Object.keys(data.games).length} games`
        );
        return data;
      });

    return this.manifestPromise;
  }

  /**
   * Get list of available game IDs from manifest.
   */
  async getGameIds(): Promise<string[]> {
    const manifest = await this.loadManifest();
    return Object.keys(manifest.games);
  }

  /**
   * Get assets for a specific game.
   */
  async getGameAssets(gameId: string): Promise<GameAssets | null> {
    const manifest = await this.loadManifest();
    return manifest.games[gameId] || null;
  }

  // ============================================
  // Level-based Loading
  // ============================================

  /**
   * Find campaign in manifest with case-insensitive matching.
   * Returns the campaign data or null if not found.
   */
  private findCampaign(
    game: GameAssets,
    campaignId: string
  ): CampaignAssets | null {
    // Try exact match first
    if (game.campaigns[campaignId]) {
      return game.campaigns[campaignId];
    }

    // Try case-insensitive match
    const lowerCampaignId = campaignId.toLowerCase();
    for (const [id, campaign] of Object.entries(game.campaigns)) {
      if (id.toLowerCase() === lowerCampaignId) {
        return campaign;
      }
    }

    return null;
  }

  /**
   * Get assets for a specific loading level.
   */
  async getAssetsForLevel(
    level: LoadLevel,
    gameId?: string,
    campaignId?: string
  ): Promise<string[]> {
    const manifest = await this.loadManifest();
    const assets: string[] = [];

    switch (level) {
      case 'level0':
        // Engine assets
        assets.push(...manifest.engine.icons);
        assets.push(...manifest.engine.images);
        assets.push(...manifest.engine.sounds);

        // GameSelector card assets:
        // - prefer game-card (portrait) when present
        // - otherwise fallback to favicon
        for (const game of Object.values(manifest.games)) {
          if (game.cardAssets.gameCard) assets.push(game.cardAssets.gameCard);
          else if (game.cardAssets.favicon) assets.push(game.cardAssets.favicon);
        }
        break;

      case 'level1':
        if (!gameId) {
          logger.assetLoader.warn('level1 requires gameId');
          break;
        }

        const game = manifest.games[gameId];
        if (!game) {
          // Game not in manifest - may be a test/poc game without assets
          console.debug(`[AssetLoader] Game not in manifest: ${gameId}`);
          break;
        }

        // Game icons, sounds, main menu music
        assets.push(...game.level1.icons);
        assets.push(...game.level1.sounds);
        if (game.level1.mainMenuMusic) {
          assets.push(game.level1.mainMenuMusic);
        }

        // Start images (general + all campaigns)
        assets.push(...game.level1.startImages);
        for (const imgs of Object.values(game.level1.campaignStartImages)) {
          assets.push(...imgs);
        }
        break;

      case 'level1_1':
        if (!gameId || !campaignId) {
          logger.assetLoader.warn('level1_1 requires gameId and campaignId');
          break;
        }

        const gameFor11 = manifest.games[gameId];
        if (!gameFor11) break;

        const campaign = this.findCampaign(gameFor11, campaignId);
        if (!campaign) {
          // Not an error - campaign may not have specific assets
          console.debug(`[AssetLoader] No assets for campaign: ${campaignId}`);
          break;
        }

        // Campaign music
        if (campaign.level1_1.music) {
          assets.push(campaign.level1_1.music);
        }

        // Easy play images (campaign-specific or fallback)
        if (campaign.level1_1.playImages.easy.length > 0) {
          assets.push(...campaign.level1_1.playImages.easy);
        }

        // Voice lines for the game
        assets.push(...gameFor11.voices);
        break;

      case 'level2':
        if (!gameId || !campaignId) {
          logger.assetLoader.warn('level2 requires gameId and campaignId');
          break;
        }

        const gameFor2 = manifest.games[gameId];
        if (!gameFor2) break;

        const campaign2 = this.findCampaign(gameFor2, campaignId);

        // End game music
        if (gameFor2.level2.gameOverMusic) {
          assets.push(gameFor2.level2.gameOverMusic);
        }
        if (gameFor2.level2.victoryMusic) {
          assets.push(gameFor2.level2.victoryMusic);
        }
        if (gameFor2.level2.tookMoneyMusic) {
          assets.push(gameFor2.level2.tookMoneyMusic);
        }

        // Game-level end images (fallback)
        assets.push(...gameFor2.level2.endImages.won);
        assets.push(...gameFor2.level2.endImages.lost);
        assets.push(...gameFor2.level2.endImages.took);

        // Campaign-specific assets
        if (campaign2) {
          // Medium/hard play images
          assets.push(...campaign2.level2.playImages.medium);
          assets.push(...campaign2.level2.playImages.hard);

          // Campaign end images
          assets.push(...campaign2.level2.endImages.won);
          assets.push(...campaign2.level2.endImages.lost);
          assets.push(...campaign2.level2.endImages.took);
        }
        break;
    }

    // Filter out already loaded assets
    return assets.filter((url) => !this.state.loaded.has(url));
  }

  /**
   * Load all assets for a specific level.
   */
  async loadLevel(
    level: LoadLevel,
    gameId?: string,
    campaignId?: string,
    options: LoadOptions = {}
  ): Promise<void> {
    const levelKey = `${level}:${gameId || ''}:${campaignId || ''}`;

    // Skip if already loaded
    if (this.loadedLevels.has(levelKey)) {
      options.onProgress?.(1, 1);
      return;
    }

    const assets = await this.getAssetsForLevel(level, gameId, campaignId);

    if (assets.length === 0) {
      this.loadedLevels.add(levelKey);
      options.onProgress?.(1, 1);
      return;
    }

    await this.loadAssets(assets, options);
    this.loadedLevels.add(levelKey);
  }

  /**
   * Check if a level is fully loaded.
   */
  isLevelLoaded(
    level: LoadLevel,
    gameId?: string,
    campaignId?: string
  ): boolean {
    const levelKey = `${level}:${gameId || ''}:${campaignId || ''}`;
    return this.loadedLevels.has(levelKey);
  }

  // ============================================
  // Asset Loading
  // ============================================

  /**
   * Load a list of assets with progress tracking.
   */
  async loadAssets(urls: string[], options: LoadOptions = {}): Promise<void> {
    const { onProgress, continueOnError = true } = options;

    // Filter out already loaded
    const toLoad = urls.filter((url) => !this.state.loaded.has(url));

    if (toLoad.length === 0) {
      onProgress?.(1, 1);
      return;
    }

    let loaded = 0;
    const total = toLoad.length;

    const loadPromises = toLoad.map(async (url) => {
      try {
        await this.loadAsset(url);
        loaded++;
        onProgress?.(loaded, total);
      } catch (error) {
        logger.assetLoader.warn(`Failed to load: ${url}`, { error });
        this.state.failed.add(url);

        if (!continueOnError) {
          throw error;
        }

        loaded++;
        onProgress?.(loaded, total);
      }
    });

    await Promise.all(loadPromises);
  }

  /**
   * Load a single asset (image or audio).
   */
  async loadAsset(url: string): Promise<void> {
    // Already loaded
    if (this.state.loaded.has(url)) {
      return;
    }

    // Currently loading - wait for it
    const pending = this.state.pending.get(url);
    if (pending) {
      return pending;
    }

    // Determine asset type and load
    const fullUrl = this.resolveUrl(url);
    const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url);
    const isAudio = /\.(ogg|mp3|wav|m4a)$/i.test(url);

    let loadPromise: Promise<void>;

    if (isImage) {
      loadPromise = this.loadImage(fullUrl, url);
    } else if (isAudio) {
      loadPromise = this.loadAudio(fullUrl, url);
    } else {
      // Unknown type - just fetch it
      loadPromise = fetch(fullUrl)
        .then(() => {
          this.state.loaded.add(url);
        });
    }

    this.state.pending.set(url, loadPromise);

    try {
      await loadPromise;
    } finally {
      this.state.pending.delete(url);
    }
  }

  /**
   * Load an image asset.
   */
  private loadImage(fullUrl: string, cacheKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        this.cache.images.set(cacheKey, img);
        this.state.loaded.add(cacheKey);
        resolve();
      };

      img.onerror = () => {
        reject(new Error(`Failed to load image: ${fullUrl}`));
      };

      img.src = fullUrl;
    });
  }

  /**
   * Load an audio asset and pre-decode it for low-latency playback.
   */
  private loadAudio(fullUrl: string, cacheKey: string): Promise<void> {
    const isSoundEffect = cacheKey.includes('/sounds/');
    const isMusic = cacheKey.includes('/music/');

    // Music and voice lines can be very large. Keeping them as ArrayBuffer in JS memory
    // (and possibly decoding to AudioBuffer) can easily push Safari/Media processes into
    // hundreds of MB. For those, rely on HTMLAudioElement streaming on demand instead.
    if (!isSoundEffect) {
      // Preload music via HTMLAudioElement to reduce start latency, without storing ArrayBuffer in JS.
      if (isMusic) {
        return new Promise((resolve, reject) => {
          const audio = new Audio();
          audio.preload = 'auto';

          const onCanPlay = () => {
            this.state.loaded.add(cacheKey);
            resolve();
          };
          const onError = () => {
            reject(new Error(`Failed to preload audio: ${fullUrl}`));
          };

          audio.addEventListener('canplay', onCanPlay, { once: true });
          audio.addEventListener('error', onError, { once: true });
          audio.src = fullUrl;
          try {
            audio.load();
          } catch {
            // ignore
          }
        });
      }

      // Voices: don't preload in JS or via media element (can be many files).
      this.state.loaded.add(cacheKey);
      return Promise.resolve();
    }

    return fetch(fullUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.arrayBuffer();
      })
      .then(async (buffer) => {
        this.cache.audio.set(cacheKey, buffer);
        this.state.loaded.add(cacheKey);

        // Store with resolved URL so playback can reuse the preloaded data
        registerPreloadedAudioBuffer(fullUrl, buffer);

        // Pre-decode sound effects for instant playback
        // This is critical for low-latency audio on mobile
        await preDecodeAudio(fullUrl, buffer);
      });
  }

  // ============================================
  // Asset Retrieval
  // ============================================

  /**
   * Check if an asset is loaded.
   */
  isLoaded(url: string): boolean {
    return this.state.loaded.has(url);
  }

  /**
   * Get a cached image element.
   */
  getImage(url: string): HTMLImageElement | null {
    return this.cache.images.get(url) || null;
  }

  /**
   * Get a cached audio buffer.
   */
  getAudioBuffer(url: string): ArrayBuffer | null {
    return this.cache.audio.get(url) || null;
  }

  /**
   * Get full URL for an asset path.
   */
  resolveUrl(path: string): string {
    // Already absolute
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // Remove leading slash for joining
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${getBasePath()}${cleanPath}`;
  }

  // ============================================
  // Utilities
  // ============================================

  /**
   * Get loading statistics.
   */
  getStats(): {
    loaded: number;
    pending: number;
    failed: number;
    cachedImages: number;
    cachedAudio: number;
  } {
    return {
      loaded: this.state.loaded.size,
      pending: this.state.pending.size,
      failed: this.state.failed.size,
      cachedImages: this.cache.images.size,
      cachedAudio: this.cache.audio.size,
    };
  }

  /**
   * Clear all caches (useful for testing or memory management).
   */
  clearCache(): void {
    this.cache.images.clear();
    this.cache.audio.clear();
    this.state.loaded.clear();
    this.state.failed.clear();
    this.loadedLevels.clear();
  }

  /**
   * Preload assets for a game in the background.
   * Does not block or show progress.
   */
  preloadInBackground(
    level: LoadLevel,
    gameId?: string,
    campaignId?: string
  ): void {
    this.loadLevel(level, gameId, campaignId).catch((error) => {
      logger.assetLoader.warn('Background preload failed', { error });
    });
  }
}

/** Singleton instance */
export const assetLoader = new AssetLoader();
