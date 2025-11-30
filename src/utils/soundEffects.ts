/**
 * Sound effects utility for the BG3 Millionaire quiz game.
 * Uses Web Audio API to generate fantasy-themed sound effects
 * and MP3 files for specific UI sounds.
 */

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

let audioContext: AudioContext | null = null;
let audioSupported = true;

// Global sound enabled state (controlled by the game)
let soundEnabled = false;

/**
 * Set global sound enabled state.
 * Call this when user toggles sound on/off.
 */
export const setSoundEnabled = (enabled: boolean): void => {
  soundEnabled = enabled;
};

/**
 * Get current sound enabled state.
 */
export const isSoundEnabled = (): boolean => {
  return soundEnabled;
};

// Cache for preloaded audio elements
const audioCache: Map<string, HTMLAudioElement> = new Map();

/**
 * Get the base path for assets
 */
const getBasePath = (): string => {
  return import.meta.env.BASE_URL || '/';
};

// List of sound files to preload
const SOUND_FILES = [
  'ClickStandard.mp3',
  'ClickStartAdventure.mp3',
  'CriticalFailure.mp3',
  'Friends.mp3',
  'NewStart.mp3',
  'PerceptionSuccess.mp3',
  'Rawr.mp3',
  'SelectedDarkUrge.mp3',
  'SelectedHero.mp3',
  'SelectedMindFlayer.mp3',
  'Victory.mp3',
];

// List of voice files to preload
const VOICE_FILES = [
  'Astarion.mp3',
  'Gale.mp3',
  'Karlach.mp3',
  'Shadowheart.mp3',
];

/**
 * Preload all sound and voice files for instant playback.
 * Call this on app initialization.
 */
export const preloadAudio = (): void => {
  const basePath = getBasePath();

  // Preload sounds
  SOUND_FILES.forEach((filename) => {
    const path = `${basePath}sounds/${filename}`;
    if (!audioCache.has(path)) {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = path;
      audioCache.set(path, audio);
    }
  });

  // Preload voices
  VOICE_FILES.forEach((filename) => {
    const path = `${basePath}voices/${filename}`;
    if (!audioCache.has(path)) {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = path;
      audioCache.set(path, audio);
    }
  });
};

/**
 * Play an MP3 sound file from sounds directory
 */
const playMp3 = (filename: string, volume = 1.0): void => {
  if (!soundEnabled) return;

  const path = `${getBasePath()}sounds/${filename}`;

  // Try to use cached audio element
  let audio = audioCache.get(path);

  if (!audio) {
    audio = new Audio(path);
    audioCache.set(path, audio);
  }

  // Clone the audio to allow overlapping plays
  const clone = audio.cloneNode() as HTMLAudioElement;
  clone.volume = volume;
  clone.play().catch((err) => console.log('Sound play failed:', err));
};

/**
 * Play an MP3 sound file from voices directory (companion voice lines)
 */
const playVoice = (filename: string, volume = 1.0): void => {
  if (!soundEnabled) return;

  const path = `${getBasePath()}voices/${filename}`;

  let audio = audioCache.get(path);

  if (!audio) {
    audio = new Audio(path);
    audioCache.set(path, audio);
  }

  const clone = audio.cloneNode() as HTMLAudioElement;
  clone.volume = volume;
  clone.play().catch((err) => console.log('Voice play failed:', err));
};

/**
 * Initialize the Web Audio API context.
 * Must be called after a user interaction (browser requirement).
 * Returns null if Web Audio API is not supported.
 */
const getAudioContext = (): AudioContext | null => {
  if (!soundEnabled) return null;
  if (!audioSupported) {
    return null;
  }

  if (!audioContext) {
    try {
      const AudioContextClass = window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextClass) {
        audioSupported = false;
        console.warn('Web Audio API is not supported in this browser');
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
 * Play a single tone with envelope using Web Audio API scheduling.
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
  gainNode.gain.linearRampToValueAtTime(volume * 0.7, startTime + attack + duration * 0.5);
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration + decay);
};

/**
 * Play multiple tones in sequence using Web Audio API scheduling.
 */
const playSequence = (tones: ToneConfig[], delayBetween = 0.1): void => {
  tones.forEach((tone, index) => {
    playTone({ ...tone, startOffset: index * delayBetween });
  });
};

/**
 * Button click sound - standard click for most buttons.
 * Uses ClickStandard.mp3
 */
export const playButtonClick = (): void => {
  playMp3('ClickStandard.mp3', 0.4);
};/**
 * Answer button click - standard click sound.
 * Uses ClickStandard.mp3
 */
export const playAnswerClick = (): void => {
  playMp3('ClickStandard.mp3', 0.4);
};

/**
 * Victory fanfare - triumphant ascending tones.
 */
export const playVictory = (): void => {
  const fanfare: ToneConfig[] = [
    { frequency: 523.25, duration: 0.15, type: 'triangle', volume: 0.3 }, // C5
    { frequency: 659.25, duration: 0.15, type: 'triangle', volume: 0.3 }, // E5
    { frequency: 783.99, duration: 0.15, type: 'triangle', volume: 0.3 }, // G5
    { frequency: 1046.50, duration: 0.4, type: 'triangle', volume: 0.35 }, // C6
  ];
  playSequence(fanfare, 0.12);
};

/**
 * Defeat sound - plays CriticalFailure.mp3 and returns Promise
 * that resolves when the sound finishes playing.
 * This allows the caller to chain the GameOver soundtrack after.
 */
export const playDefeat = (): Promise<void> => {
  return new Promise((resolve) => {
    if (!soundEnabled) {
      resolve();
      return;
    }

    const path = `${getBasePath()}sounds/CriticalFailure.mp3`;

    let audio = audioCache.get(path);
    if (!audio) {
      audio = new Audio(path);
      audioCache.set(path, audio);
    }

    const clone = audio.cloneNode() as HTMLAudioElement;
    clone.volume = 0.6;

    clone.onended = () => {
      resolve();
    };

    clone.onerror = () => {
      console.log('CriticalFailure sound play failed');
      resolve();
    };

    clone.play().catch((err) => {
      console.log('CriticalFailure play failed:', err);
      resolve();
    });
  });
};

/**
 * 50:50 lifeline sound - perception success effect.
 * Uses PerceptionSuccess.mp3
 */
export const playFiftyFifty = (): void => {
  playMp3('PerceptionSuccess.mp3', 0.5);
};

/**
 * Companion voice lines mapping.
 * Maps companion names to their voice file names.
 * Files are stored in public/games/{gameId}/voices/ directory.
 */
const companionVoiceMap: Record<string, string> = {
  'Астарион': 'Astarion.mp3',
  'Гейл': 'Gale.mp3',
  'Шэдоухарт': 'Shadowheart.mp3',
  'Карлах': 'Karlach.mp3',
  // Add more companions as voice files become available:
  // 'Лаэзель': 'Laezel.mp3',
  // 'Уилл': 'Wyll.mp3',
  // 'Минтара': 'Minthara.mp3',
  // 'Халсин': 'Halsin.mp3',
  // 'Джахейра': 'Jaheira.mp3',
  // 'Минск': 'Minsc.mp3',
};

/**
 * Scroll/Message sound - plays companion's voice if available.
 * Falls back to no sound if companion voice file is not available.
 * @param companionName - The name of the companion sending the message
 */
export const playScrollUnfold = (companionName?: string): void => {
  if (!companionName) return;

  const voiceFile = companionVoiceMap[companionName];
  if (voiceFile) {
    playVoice(voiceFile, 0.6);
  }
  // No sound if companion voice is not available yet
};

/**
 * Tavern/Audience sound - Friends spell effect.
 * Uses Friends.mp3
 */
export const playTavernCheer = (): void => {
  playMp3('Friends.mp3', 0.5);
};

/**
 * Take money/coins sound - jingling coins effect.
 * Uses Web Audio API scheduling for all coin sounds.
 */
export const playCoins = (): void => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Multiple short high-pitched tones for coin jingle with scheduled timing
  const coinFreqs = [2000, 2200, 1800, 2400, 2100, 1900, 2300];

  coinFreqs.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    // Add slight randomness to frequency for natural sound
    osc.frequency.value = freq + (index * 50);

    const startTime = now + index * 0.06;

    gain.gain.setValueAtTime(0, now);
    gain.gain.setValueAtTime(0.15, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

    osc.start(startTime);
    osc.stop(startTime + 0.12);
  });
};

/**
 * Correct answer sound - triumphant short ding.
 */
export const playCorrect = (): void => {
  const tones: ToneConfig[] = [
    { frequency: 523.25, duration: 0.1, type: 'sine', volume: 0.25 }, // C5
    { frequency: 783.99, duration: 0.2, type: 'sine', volume: 0.3 }, // G5
  ];
  playSequence(tones, 0.08);
};

/**
 * Wrong answer sound - low buzzer.
 */
export const playWrong = (): void => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.value = 120;
  oscillator.type = 'sawtooth';

  const now = ctx.currentTime;
  gainNode.gain.setValueAtTime(0.25, now);
  gainNode.gain.linearRampToValueAtTime(0.2, now + 0.2);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

  oscillator.start(now);
  oscillator.stop(now + 0.5);
};

/**
 * Mode selection sound - plays character-specific sound.
 * Uses Selected{Mode}.mp3 files
 */
export const playModeSelect = (mode?: string): void => {
  if (!mode) {
    playMp3('ClickStandard.mp3', 0.4);
    return;
  }

  const soundMap: Record<string, string> = {
    hero: 'SelectedHero.mp3',
    illithid: 'SelectedMindFlayer.mp3',
    darkUrge: 'SelectedDarkUrge.mp3',
  };

  const sound = soundMap[mode];
  if (sound) {
    playMp3(sound, 0.5);
  } else {
    playMp3('ClickStandard.mp3', 0.4);
  }
};

/**
 * Take money sound - victory fanfare.
 * Uses Victory.mp3
 */
export const playTakeMoney = (): void => {
  playMp3('Victory.mp3', 0.5);
};

/**
 * Game start sound - start adventure click.
 * Uses ClickStartAdventure.mp3
 */
export const playGameStart = (): void => {
  playMp3('ClickStartAdventure.mp3', 0.5);
};

/**
 * New start sound - plays after ClickStartAdventure when restarting game.
 * Uses NewStart.mp3
 */
export const playNewStart = (): void => {
  // Delay slightly to play after the click sound
  setTimeout(() => {
    playMp3('NewStart.mp3', 0.5);
  }, 200);
};
