/**
 * Audio player with fallback support.
 *
 * Loading priority for sounds:
 * 1. Game-specific file: /games/{gameId}/sounds/{filename}
 * 2. Shared fallback file: /games/shared/sounds/{filename}
 * 3. Oscillator-generated sound
 *
 * For music/voices:
 * 1. Game-specific file: /games/{gameId}/music/{filename}
 * 2. Shared fallback file: /games/shared/music/{filename}
 * 3. Silent (no playback)
 */

import { getAssetPaths, checkFileExists } from './assetLoader';
import { logger } from '../services/logger';

// ============================================
// Types
// ============================================

type OscillatorType = 'sine' | 'square' | 'sawtooth' | 'triangle';

interface ToneConfig {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
  attack?: number;
  decay?: number;
  startOffset?: number;
}

interface OscillatorSoundConfig {
  tones: ToneConfig[];
  delayBetween?: number;
}

export type PlayResult = 'file' | 'oscillator' | 'none';

// ============================================
// State
// ============================================

let audioContext: AudioContext | null = null;
let audioSupported = true;
// Sound is disabled by default until user enables music
let soundEnabled = false;

// Cache for preloaded audio elements (for music/voice - HTMLAudioElement)
const audioCache: Map<string, HTMLAudioElement> = new Map();

// Cache for decoded AudioBuffers (for sound effects - Web Audio API)
const audioBufferCache: Map<string, AudioBuffer> = new Map();

// Raw preloaded audio data so playback can avoid refetching
const preloadedAudioData: Map<string, ArrayBuffer> = new Map();

// Blob URLs created from preloaded buffers (for HTMLAudioElement fallback)
const preloadedBlobUrls: Map<string, string> = new Map();

// Pending decode promises to avoid duplicate decoding
const pendingDecodes: Map<string, Promise<AudioBuffer | null>> = new Map();

// Current game ID for asset resolution
let currentGameId: string = '';

// ============================================
// Helpers
// ============================================

const normalizeAudioPath = (path: string): string => {
  try {
    return new URL(path, window.location.href).href;
  } catch {
    return path;
  }
};

const getMimeTypeForPath = (path: string): string => {
  if (/\.mp3$/i.test(path)) return 'audio/mpeg';
  if (/\.wav$/i.test(path)) return 'audio/wav';
  if (/\.m4a$/i.test(path)) return 'audio/mp4';
  return 'audio/ogg';
};

const getOrCreateBlobUrl = (key: string, buffer: ArrayBuffer): string => {
  const existing = preloadedBlobUrls.get(key);
  if (existing) return existing;

  const blob = new Blob([buffer], { type: getMimeTypeForPath(key) });
  const url = URL.createObjectURL(blob);
  preloadedBlobUrls.set(key, url);
  return url;
};

// ============================================
// Configuration
// ============================================

/**
 * Set the current game ID for asset path resolution
 */
export const setGameId = (gameId: string): void => {
  currentGameId = gameId;
};

/**
 * Enable or disable all sounds
 */
export const setSoundEnabled = (enabled: boolean): void => {
  soundEnabled = enabled;
};

/**
 * Check if sound is currently enabled
 */
export const isSoundEnabled = (): boolean => {
  return soundEnabled;
};

/**
 * Get or create AudioContext (for external use)
 */
export const getOrCreateAudioContext = (): AudioContext | null => {
  return getAudioContext();
};

/**
 * Pre-decode an ArrayBuffer into AudioBuffer and cache it.
 * Call this during asset loading for instant playback later.
 */
export const preDecodeAudio = async (
  path: string,
  arrayBuffer: ArrayBuffer
): Promise<boolean> => {
  const key = normalizeAudioPath(path);
  preloadedAudioData.set(key, arrayBuffer.slice(0));

  // Check if already cached
  if (audioBufferCache.has(key)) {
    return true;
  }

  // Need AudioContext for decoding - create it if needed
  // Note: This may fail on iOS before user interaction, which is OK
  // The buffer will be decoded on first play instead
  const ctx = getAudioContext();
  if (!ctx) {
    return false;
  }

  try {
    const buffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
    audioBufferCache.set(key, buffer);
    return true;
  } catch {
    return false;
  }
};

/**
 * Register a preloaded audio buffer without decoding it.
 * This lets playback reuse the already-downloaded data instead of refetching.
 */
export const registerPreloadedAudioBuffer = (
  path: string,
  arrayBuffer: ArrayBuffer
): void => {
  const key = normalizeAudioPath(path);
  preloadedAudioData.set(key, arrayBuffer.slice(0));
};

/**
 * Get a reusable blob URL for a preloaded audio buffer (if available).
 */
export const getPreloadedAudioSrc = (path: string): string | null => {
  const key = normalizeAudioPath(path);
  const buffer = preloadedAudioData.get(key);
  if (!buffer) return null;
  return getOrCreateBlobUrl(key, buffer);
};

/**
 * Check if an audio buffer is pre-decoded and ready for instant playback.
 */
export const isAudioDecoded = (path: string): boolean => {
  return audioBufferCache.has(normalizeAudioPath(path));
};

/**
 * "Warm up" AudioContext by playing a silent buffer.
 * Call this on first user interaction for iOS.
 * This unlocks the AudioContext and reduces latency for subsequent sounds.
 */
export const warmUpAudioContext = (): void => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume if suspended (iOS requirement)
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  // Play a very short silent buffer to fully unlock audio
  const silentBuffer = ctx.createBuffer(1, 1, ctx.sampleRate);
  const source = ctx.createBufferSource();
  source.buffer = silentBuffer;
  source.connect(ctx.destination);
  source.start(0);
};

// ============================================
// Oscillator Sound Definitions
// ============================================

/**
 * Fallback oscillator sounds for when files are missing
 */
const OSCILLATOR_SOUNDS: Record<string, OscillatorSoundConfig> = {
  // Answer button click - short blip
  answerButton: {
    tones: [{ frequency: 800, duration: 0.08, type: 'sine', volume: 0.2 }],
  },

  // Big button press - epic horn for start/restart
  bigButton: {
    tones: [
      { frequency: 294, duration: 0.2, type: 'sawtooth', volume: 0.2 },
      { frequency: 392, duration: 0.2, type: 'sawtooth', volume: 0.25 },
      { frequency: 523, duration: 0.3, type: 'sawtooth', volume: 0.3 },
    ],
    delayBetween: 0.15,
  },

  // 50:50 lifeline - reduce answers magical zap
  hintReduceButton: {
    tones: [
      { frequency: 1200, duration: 0.05, type: 'square', volume: 0.15 },
      { frequency: 800, duration: 0.05, type: 'square', volume: 0.15 },
      { frequency: 1000, duration: 0.1, type: 'sine', volume: 0.2 },
    ],
    delayBetween: 0.04,
  },

  // Phone a friend lifeline
  hintCallButton: {
    tones: [
      { frequency: 600, duration: 0.1, type: 'sine', volume: 0.2 },
      { frequency: 800, duration: 0.1, type: 'sine', volume: 0.2 },
      { frequency: 1000, duration: 0.15, type: 'sine', volume: 0.25 },
    ],
    delayBetween: 0.08,
  },

  // Ask the audience lifeline
  hintVoteButton: {
    tones: [
      { frequency: 300, duration: 0.1, type: 'triangle', volume: 0.2 },
      { frequency: 400, duration: 0.1, type: 'triangle', volume: 0.2 },
      { frequency: 500, duration: 0.15, type: 'triangle', volume: 0.25 },
    ],
    delayBetween: 0.06,
  },

  // Take money lifeline - coin sounds
  hintTakeMoneyButton: {
    tones: [
      { frequency: 523, duration: 0.12, type: 'triangle', volume: 0.25 },
      { frequency: 659, duration: 0.12, type: 'triangle', volume: 0.25 },
      { frequency: 784, duration: 0.12, type: 'triangle', volume: 0.25 },
      { frequency: 1047, duration: 0.3, type: 'triangle', volume: 0.3 },
    ],
    delayBetween: 0.1,
  },

  // Victory - epic fanfare for winning the game
  victory: {
    tones: [
      // Triumphant brass-like fanfare (C major chord arpeggio)
      { frequency: 523, duration: 0.2, type: 'sawtooth', volume: 0.25 },
      { frequency: 659, duration: 0.2, type: 'sawtooth', volume: 0.28 },
      { frequency: 784, duration: 0.2, type: 'sawtooth', volume: 0.3 },
      { frequency: 1047, duration: 0.25, type: 'sawtooth', volume: 0.32 },
      // Final triumphant chord (sustained)
      { frequency: 1047, duration: 0.5, type: 'triangle', volume: 0.35 },
    ],
    delayBetween: 0.15,
  },

  // Defeat - dramatic descending
  defeat: {
    tones: [
      { frequency: 400, duration: 0.2, type: 'sawtooth', volume: 0.3 },
      { frequency: 300, duration: 0.2, type: 'sawtooth', volume: 0.3 },
      { frequency: 200, duration: 0.4, type: 'sawtooth', volume: 0.35 },
    ],
    delayBetween: 0.15,
  },

  // Correct answer - ascending happy tones (proceed to next question)
  correct: {
    tones: [
      { frequency: 523, duration: 0.12, type: 'triangle', volume: 0.25 },
      { frequency: 659, duration: 0.12, type: 'triangle', volume: 0.25 },
      { frequency: 784, duration: 0.2, type: 'triangle', volume: 0.3 },
    ],
    delayBetween: 0.1,
  },

  // Mode select - selection confirmation
  modeSelect: {
    tones: [
      { frequency: 600, duration: 0.08, type: 'triangle', volume: 0.2 },
      { frequency: 900, duration: 0.12, type: 'triangle', volume: 0.25 },
    ],
    delayBetween: 0.06,
  },
};

export type OscillatorSoundKey = keyof typeof OSCILLATOR_SOUNDS;

// ============================================
// Web Audio API
// ============================================

/**
 * Get or create AudioContext
 */
const getAudioContext = (): AudioContext | null => {
  if (!soundEnabled || !audioSupported) return null;

  if (!audioContext) {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioContextClass) {
        audioSupported = false;
        logger.audioPlayer.warn('Web Audio API is not supported');
        return null;
      }

      audioContext = new AudioContextClass();
    } catch (error) {
      audioSupported = false;
      logger.audioPlayer.warn('Failed to create AudioContext', { error });
      return null;
    }
  }

  // Resume AudioContext if suspended (iOS requirement)
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {
      // Ignore resume errors - will retry on next interaction
    });
  }

  return audioContext;
};

/**
 * Ensure AudioContext is ready (call on user interaction for iOS)
 */
export const ensureAudioContext = (): void => {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
};

/**
 * Decode audio data and cache the AudioBuffer
 */
const decodeAndCacheAudio = async (
  path: string,
  arrayBuffer: ArrayBuffer
): Promise<AudioBuffer | null> => {
  const key = normalizeAudioPath(path);
  preloadedAudioData.set(key, arrayBuffer.slice(0));

  const ctx = getAudioContext();
  if (!ctx) return null;

  // Check if already cached
  const cached = audioBufferCache.get(key);
  if (cached) return cached;

  // Check if already decoding
  const pending = pendingDecodes.get(key);
  if (pending) return pending;

  // Start decoding
  const decodePromise = (async () => {
    try {
      // Clone buffer since decodeAudioData consumes it
      const buffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
      audioBufferCache.set(key, buffer);
      return buffer;
    } catch (err) {
      logger.audioPlayer.warn(`Failed to decode audio: ${key}`, { error: err });
      return null;
    } finally {
      pendingDecodes.delete(key);
    }
  })();

  pendingDecodes.set(key, decodePromise);
  return decodePromise;
};

/**
 * Play an AudioBuffer with Web Audio API (low latency)
 */
const playAudioBuffer = (
  buffer: AudioBuffer,
  volume: number = 1.0
): void => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const source = ctx.createBufferSource();
  const gainNode = ctx.createGain();

  source.buffer = buffer;
  source.connect(gainNode);
  gainNode.connect(ctx.destination);
  gainNode.gain.value = volume;

  source.start(0);
};

/**
 * Play a single tone with envelope
 */
const playTone = ({
  frequency,
  duration,
  type = 'sine',
  volume = 0.3,
  attack = 0.01,
  decay = 0.1,
  startOffset = 0,
}: ToneConfig): void => {
  // Double-check sound is enabled (safety check)
  if (!soundEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = type;

  const startTime = ctx.currentTime + startOffset;
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(volume, startTime + attack);
  gainNode.gain.linearRampToValueAtTime(
    volume * 0.7,
    startTime + attack + duration * 0.5
  );
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration + decay);
};

/**
 * Play a sequence of tones
 */
const playOscillatorSound = (config: OscillatorSoundConfig): void => {
  // Double-check sound is enabled (safety check)
  if (!soundEnabled) return;

  const { tones, delayBetween = 0.1 } = config;
  tones.forEach((tone, index) => {
    playTone({ ...tone, startOffset: index * delayBetween });
  });
};

const playHtmlAudio = async (
  key: string,
  src: string,
  volume: number
): Promise<boolean> => {
  let audio = audioCache.get(key);
  if (!audio) {
    audio = new Audio();
    audio.preload = 'auto';
    audioCache.set(key, audio);
  }

  if (audio.src !== src) {
    audio.src = src;
  }

  const clone = audio.cloneNode() as HTMLAudioElement;
  clone.volume = volume;

  try {
    await clone.play();
    return true;
  } catch (err) {
    logger.audioPlayer.warn(`Failed to play ${src}`, { error: err });
    return false;
  }
};

// ============================================
// File Playback
// ============================================

/**
 * Try to play a sound using Web Audio API (low latency)
 * Falls back to HTMLAudioElement if buffer not available
 */
const tryPlayFile = async (
  path: string,
  volume: number
): Promise<boolean> => {
  const key = normalizeAudioPath(path);

  // Check AudioBuffer cache first (fastest path)
  const cachedBuffer = audioBufferCache.get(key);
  if (cachedBuffer) {
    playAudioBuffer(cachedBuffer, volume);
    return true;
  }

  // Use preloaded data if available to avoid network round-trips
  const preloadedBuffer = preloadedAudioData.get(key);
  if (preloadedBuffer) {
    const audioBuffer = await decodeAndCacheAudio(key, preloadedBuffer);
    if (audioBuffer) {
      playAudioBuffer(audioBuffer, volume);
      return true;
    }

    const blobUrl = getOrCreateBlobUrl(key, preloadedBuffer);
    return playHtmlAudio(key, blobUrl, volume);
  }

  // Check if file exists
  const exists = await checkFileExists(key);
  if (!exists) return false;

  // Try to load and decode for Web Audio API
  try {
    const response = await fetch(key);
    if (!response.ok) return false;

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await decodeAndCacheAudio(key, arrayBuffer);

    if (audioBuffer) {
      playAudioBuffer(audioBuffer, volume);
      return true;
    }

    const blobUrl = getOrCreateBlobUrl(key, arrayBuffer);
    return playHtmlAudio(key, blobUrl, volume);
  } catch (err) {
    logger.audioPlayer.warn(`Failed to load audio: ${key}`, { error: err });
  }

  return false;
};

// ============================================
// Public API
// ============================================

/**
 * Map sound type names to oscillator keys
 */
const SOUND_TYPE_MAP: Record<string, string> = {
  // Button sounds
  AnswerClick: 'answerButton',
  BigButtonPress: 'bigButton',
  // Hint button sounds
  HintReduce: 'hintReduceButton',
  HintCall: 'hintCallButton',
  HintVote: 'hintVoteButton',
  HintTakeMoney: 'hintTakeMoneyButton',
  // Game event sounds
  Victory: 'victory',
  Fail: 'defeat',
  Correct: 'correct',
  Next: 'correct',
};

/**
 * Extract sound type from filename for oscillator fallback
 */
const getSoundTypeFromFilename = (filename: string): string | null => {
  // Remove extension
  const name = filename.replace(/\.(mp3|ogg|wav)$/i, '');

  // Check direct mapping
  if (SOUND_TYPE_MAP[name]) {
    return SOUND_TYPE_MAP[name];
  }

  // Check if it starts with "Selected" (mode select sound)
  if (name.startsWith('Selected')) {
    return 'modeSelect';
  }

  return null;
};

/**
 * Play a sound effect with fallback chain:
 * 1. Game-specific file
 * 2. Base fallback file
 * 3. Oscillator sound
 */
export const playSound = async (
  filename: string,
  volume: number = 1.0
): Promise<PlayResult> => {
  if (!soundEnabled) return 'none';

  const paths = getAssetPaths('sounds', filename, currentGameId);

  // 1. Try game-specific path
  if (await tryPlayFile(paths.specific, volume)) {
    return 'file';
  }

  // 2. Try fallback path
  if (await tryPlayFile(paths.fallback, volume)) {
    return 'file';
  }

  // 3. Try oscillator fallback
  const soundType = getSoundTypeFromFilename(filename);
  if (soundType && OSCILLATOR_SOUNDS[soundType]) {
    playOscillatorSound(OSCILLATOR_SOUNDS[soundType]);
    return 'oscillator';
  }

  logger.audioPlayer.warn(`No sound available for: ${filename}`);
  return 'none';
};

/**
 * Play a sound by logical name (uses oscillator config key)
 */
export const playSoundByType = (
  type: keyof typeof OSCILLATOR_SOUNDS
): void => {
  if (!soundEnabled) return;

  const config = OSCILLATOR_SOUNDS[type];
  if (config) {
    playOscillatorSound(config);
  }
};

/**
 * Play music track (no oscillator fallback)
 */
export const playMusic = async (
  filename: string,
  audioElement: HTMLAudioElement,
  volume: number = 0.2
): Promise<boolean> => {
  const paths = getAssetPaths('music', filename, currentGameId);

  // Try game-specific path first
  const specificExists = await checkFileExists(paths.specific);
  if (specificExists) {
    audioElement.src = paths.specific;
    audioElement.volume = volume;
    try {
      await audioElement.play();
      return true;
    } catch {
      return false;
    }
  }

  // Try fallback path
  const fallbackExists = await checkFileExists(paths.fallback);
  if (fallbackExists) {
    audioElement.src = paths.fallback;
    audioElement.volume = volume;
    try {
      await audioElement.play();
      return true;
    } catch {
      return false;
    }
  }

  return false;
};

/**
 * Play voice line (no oscillator fallback)
 */
export const playVoice = async (
  filename: string,
  volume: number = 1.0
): Promise<boolean> => {
  if (!soundEnabled) return false;

  const paths = getAssetPaths('voices', filename, currentGameId);

  // Try game-specific path
  if (await tryPlayFile(paths.specific, volume)) {
    return true;
  }

  // Try fallback path
  if (await tryPlayFile(paths.fallback, volume)) {
    return true;
  }

  return false;
};

/**
 * Preload and decode sound files for a game (optimized for low latency)
 */
export const preloadSounds = async (
  filenames: string[],
  gameId: string
): Promise<void> => {
  // Ensure AudioContext exists for decoding
  getAudioContext();

  for (const filename of filenames) {
    const paths = getAssetPaths('sounds', filename, gameId);

    // Try to preload specific first, then fallback
    for (const path of [paths.specific, paths.fallback]) {
      try {
        const exists = await checkFileExists(path);
        if (exists) {
          // Fetch and decode for Web Audio API
          const response = await fetch(path);
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            await decodeAndCacheAudio(path, arrayBuffer);
          }
          break;
        }
      } catch {
        // Continue to next path
      }
    }
  }
};

/**
 * Clear audio cache
 */
export const clearAudioCache = (): void => {
  audioCache.clear();
  audioBufferCache.clear();
  preloadedAudioData.clear();
  preloadedBlobUrls.forEach((url) => URL.revokeObjectURL(url));
  preloadedBlobUrls.clear();
  pendingDecodes.clear();
};
