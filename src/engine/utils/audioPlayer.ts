/**
 * Audio player with fallback support.
 *
 * Loading priority for sounds:
 * 1. Game-specific file: /sounds/{gameId}/{filename}
 * 2. Base fallback file: /sounds/{filename}
 * 3. Oscillator-generated sound
 *
 * For music/voices:
 * 1. Game-specific file: /music/{gameId}/{filename}
 * 2. Base fallback file: /music/{filename}
 * 3. Silent (no playback)
 */

import {
  getBasePath,
  getAssetPaths,
  checkFileExists,
  AssetType,
} from './assetLoader';

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

// Cache for preloaded audio elements
const audioCache: Map<string, HTMLAudioElement> = new Map();

// Current game ID for asset resolution
let currentGameId: string = '';

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

// ============================================
// Oscillator Sound Definitions
// ============================================

/**
 * Fallback oscillator sounds for when files are missing
 */
const OSCILLATOR_SOUNDS: Record<string, OscillatorSoundConfig> = {
  // Click sound - short blip
  click: {
    tones: [{ frequency: 800, duration: 0.08, type: 'sine', volume: 0.2 }],
  },

  // Start - epic horn for campaign start
  start: {
    tones: [
      { frequency: 294, duration: 0.2, type: 'sawtooth', volume: 0.2 },
      { frequency: 392, duration: 0.2, type: 'sawtooth', volume: 0.25 },
      { frequency: 523, duration: 0.3, type: 'sawtooth', volume: 0.3 },
    ],
    delayBetween: 0.15,
  },

  // Hint - 50:50 lifeline magical zap
  hint: {
    tones: [
      { frequency: 1200, duration: 0.05, type: 'square', volume: 0.15 },
      { frequency: 800, duration: 0.05, type: 'square', volume: 0.15 },
      { frequency: 1000, duration: 0.1, type: 'sine', volume: 0.2 },
    ],
    delayBetween: 0.04,
  },

  // Call - phone a friend
  call: {
    tones: [
      { frequency: 600, duration: 0.1, type: 'sine', volume: 0.2 },
      { frequency: 800, duration: 0.1, type: 'sine', volume: 0.2 },
      { frequency: 1000, duration: 0.15, type: 'sine', volume: 0.25 },
    ],
    delayBetween: 0.08,
  },

  // Vote - ask the audience
  vote: {
    tones: [
      { frequency: 300, duration: 0.1, type: 'triangle', volume: 0.2 },
      { frequency: 400, duration: 0.1, type: 'triangle', volume: 0.2 },
      { frequency: 500, duration: 0.15, type: 'triangle', volume: 0.25 },
    ],
    delayBetween: 0.06,
  },

  // Money - victory / take money coin sounds
  money: {
    tones: [
      { frequency: 523, duration: 0.15, type: 'triangle', volume: 0.3 },
      { frequency: 659, duration: 0.15, type: 'triangle', volume: 0.3 },
      { frequency: 784, duration: 0.15, type: 'triangle', volume: 0.3 },
      { frequency: 1047, duration: 0.4, type: 'triangle', volume: 0.35 },
    ],
    delayBetween: 0.12,
  },

  // Restart - new game refresh sound
  restart: {
    tones: [
      { frequency: 800, duration: 0.1, type: 'sine', volume: 0.2 },
      { frequency: 600, duration: 0.1, type: 'sine', volume: 0.2 },
      { frequency: 800, duration: 0.15, type: 'sine', volume: 0.25 },
    ],
    delayBetween: 0.08,
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
        console.warn('Web Audio API is not supported');
        return null;
      }

      audioContext = new AudioContextClass();
    } catch (error) {
      audioSupported = false;
      console.warn('Failed to create AudioContext:', error);
      return null;
    }
  }

  return audioContext;
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
  const { tones, delayBetween = 0.1 } = config;
  tones.forEach((tone, index) => {
    playTone({ ...tone, startOffset: index * delayBetween });
  });
};

// ============================================
// File Playback
// ============================================

/**
 * Try to play an audio file, returns true if successful
 */
const tryPlayFile = async (
  path: string,
  volume: number
): Promise<boolean> => {
  // Check cache first
  let audio = audioCache.get(path);

  if (!audio) {
    // Try to load the file
    const exists = await checkFileExists(path);
    if (!exists) return false;

    audio = new Audio(path);
    audioCache.set(path, audio);
  }

  // Clone for overlapping plays
  const clone = audio.cloneNode() as HTMLAudioElement;
  clone.volume = volume;

  try {
    await clone.play();
    return true;
  } catch (err) {
    console.warn(`Failed to play ${path}:`, err);
    return false;
  }
};

// ============================================
// Public API
// ============================================

/**
 * Map sound type names to oscillator keys
 */
const SOUND_TYPE_MAP: Record<string, string> = {
  Click: 'click',
  Start: 'start',
  Hint: 'hint',
  Call: 'call',
  Vote: 'vote',
  Money: 'money',
  Restart: 'restart',
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

  console.warn(`No sound available for: ${filename}`);
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
 * Preload sound files for a game
 */
export const preloadSounds = async (
  filenames: string[],
  gameId: string
): Promise<void> => {
  const basePath = getBasePath();

  for (const filename of filenames) {
    const paths = getAssetPaths('sounds', filename, gameId);

    // Try to preload specific first, then fallback
    for (const path of [paths.specific, paths.fallback]) {
      try {
        const exists = await checkFileExists(path);
        if (exists) {
          const audio = new Audio();
          audio.preload = 'auto';
          audio.src = path;
          audioCache.set(path, audio);
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
};
