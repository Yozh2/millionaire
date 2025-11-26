/**
 * Sound effects utility for the BG3 Millionaire quiz game.
 * Uses Web Audio API to generate fantasy-themed sound effects.
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

/**
 * Initialize the Web Audio API context.
 * Must be called after a user interaction (browser requirement).
 * Returns null if Web Audio API is not supported.
 */
const getAudioContext = (): AudioContext | null => {
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
 * Button click sound - short, crisp click.
 */
export const playButtonClick = (): void => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.value = 600;
  oscillator.type = 'square';

  const now = ctx.currentTime;
  gainNode.gain.setValueAtTime(0.2, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

  oscillator.start(now);
  oscillator.stop(now + 0.08);
};

/**
 * Answer button click - slightly lower, more resonant.
 */
export const playAnswerClick = (): void => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.value = 440;
  oscillator.type = 'triangle';

  const now = ctx.currentTime;
  gainNode.gain.setValueAtTime(0.25, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

  oscillator.start(now);
  oscillator.stop(now + 0.15);
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
 * Defeat sound - dramatic descending tones with dice critical fail feel.
 */
export const playDefeat = (): void => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  // Create a low rumbling base
  const oscillator1 = ctx.createOscillator();
  const gainNode1 = ctx.createGain();
  oscillator1.connect(gainNode1);
  gainNode1.connect(ctx.destination);
  
  oscillator1.frequency.value = 80;
  oscillator1.type = 'sawtooth';
  
  const now = ctx.currentTime;
  gainNode1.gain.setValueAtTime(0.2, now);
  gainNode1.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
  
  oscillator1.start(now);
  oscillator1.stop(now + 0.8);
  
  // Descending tone for dramatic effect
  const descending: ToneConfig[] = [
    { frequency: 392, duration: 0.2, type: 'square', volume: 0.2 }, // G4
    { frequency: 311.13, duration: 0.2, type: 'square', volume: 0.2 }, // Eb4
    { frequency: 233.08, duration: 0.3, type: 'square', volume: 0.25 }, // Bb3
    { frequency: 146.83, duration: 0.5, type: 'sawtooth', volume: 0.25 }, // D3
  ];
  playSequence(descending, 0.15);
};

/**
 * 50:50 lifeline sound - magical zap/elimination effect.
 * Uses Web Audio API scheduling for both zaps.
 */
export const playFiftyFifty = (): void => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  const now = ctx.currentTime;
  
  // First zap effect with frequency sweep
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(1200, now);
  oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.3);
  
  gainNode.gain.setValueAtTime(0.2, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
  
  oscillator.start(now);
  oscillator.stop(now + 0.35);
  
  // Second zap using Web Audio API scheduling (delayed by 0.15s)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  
  osc2.type = 'sawtooth';
  const secondZapTime = now + 0.15;
  osc2.frequency.setValueAtTime(1000, secondZapTime);
  osc2.frequency.exponentialRampToValueAtTime(150, secondZapTime + 0.25);
  
  gain2.gain.setValueAtTime(0, now);
  gain2.gain.setValueAtTime(0.15, secondZapTime);
  gain2.gain.exponentialRampToValueAtTime(0.01, secondZapTime + 0.25);
  
  osc2.start(secondZapTime);
  osc2.stop(secondZapTime + 0.3);
};

/**
 * Scroll/Message sound - paper unrolling effect.
 */
export const playScrollUnfold = (): void => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  // Soft rustling effect using noise-like tones
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.type = 'triangle';
  
  const now = ctx.currentTime;
  // Ascending pitch to simulate unrolling
  oscillator.frequency.setValueAtTime(200, now);
  oscillator.frequency.linearRampToValueAtTime(800, now + 0.2);
  oscillator.frequency.linearRampToValueAtTime(600, now + 0.4);
  
  gainNode.gain.setValueAtTime(0.15, now);
  gainNode.gain.linearRampToValueAtTime(0.2, now + 0.15);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
  
  oscillator.start(now);
  oscillator.stop(now + 0.45);
  
  // Add magical shimmer
  const shimmer = ctx.createOscillator();
  const shimmerGain = ctx.createGain();
  shimmer.connect(shimmerGain);
  shimmerGain.connect(ctx.destination);
  
  shimmer.type = 'sine';
  shimmer.frequency.value = 1200;
  
  shimmerGain.gain.setValueAtTime(0, now);
  shimmerGain.gain.linearRampToValueAtTime(0.1, now + 0.2);
  shimmerGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
  
  shimmer.start(now);
  shimmer.stop(now + 0.5);
};

/**
 * Tavern/Audience sound - crowd murmur and cheer effect.
 * Uses Web Audio API scheduling for all oscillators.
 */
export const playTavernCheer = (): void => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  const now = ctx.currentTime;
  
  // Create multiple overlapping tones to simulate crowd using scheduled timing
  const frequencies = [300, 350, 400, 450, 500];
  
  frequencies.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'triangle';
    const startTime = now + index * 0.05;
    
    osc.frequency.setValueAtTime(freq, startTime);
    osc.frequency.linearRampToValueAtTime(freq * 1.1, startTime + 0.2);
    osc.frequency.linearRampToValueAtTime(freq * 0.9, startTime + 0.4);
    
    // Schedule gain envelope
    gain.gain.setValueAtTime(0, now);
    gain.gain.setValueAtTime(0.1, startTime);
    gain.gain.linearRampToValueAtTime(0.15, startTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
    
    osc.start(startTime);
    osc.stop(startTime + 0.55);
  });
  
  // Add a "mug slam" effect using scheduled timing
  const thump = ctx.createOscillator();
  const thumpGain = ctx.createGain();
  thump.connect(thumpGain);
  thumpGain.connect(ctx.destination);
  
  thump.type = 'sine';
  const thumpTime = now + 0.3;
  thump.frequency.setValueAtTime(100, thumpTime);
  thump.frequency.exponentialRampToValueAtTime(50, thumpTime + 0.15);
  
  thumpGain.gain.setValueAtTime(0, now);
  thumpGain.gain.setValueAtTime(0.25, thumpTime);
  thumpGain.gain.exponentialRampToValueAtTime(0.01, thumpTime + 0.2);
  
  thump.start(thumpTime);
  thump.stop(thumpTime + 0.25);
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
 * Mode selection sound - magical confirmation.
 */
export const playModeSelect = (): void => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  const now = ctx.currentTime;
  
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(400, now);
  osc1.frequency.linearRampToValueAtTime(600, now + 0.15);
  
  gain1.gain.setValueAtTime(0.2, now);
  gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
  
  osc1.start(now);
  osc1.stop(now + 0.25);
  
  // Add shimmer using Web Audio API scheduling
  const shimmer = ctx.createOscillator();
  const shimmerGain = ctx.createGain();
  shimmer.connect(shimmerGain);
  shimmerGain.connect(ctx.destination);
  
  shimmer.type = 'sine';
  shimmer.frequency.value = 1000;
  
  const shimmerStart = now + 0.05;
  shimmerGain.gain.setValueAtTime(0, now);
  shimmerGain.gain.setValueAtTime(0.1, shimmerStart);
  shimmerGain.gain.exponentialRampToValueAtTime(0.01, shimmerStart + 0.2);
  
  shimmer.start(shimmerStart);
  shimmer.stop(shimmerStart + 0.25);
};

/**
 * Game start sound - epic horn effect.
 */
export const playGameStart = (): void => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  const now = ctx.currentTime;
  
  // Main horn tone
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.linearRampToValueAtTime(330, now + 0.3);
  
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
  gain.gain.linearRampToValueAtTime(0.15, now + 0.4);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
  
  osc.start(now);
  osc.stop(now + 0.65);
  
  // Supporting harmony
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(330, now);
  osc2.frequency.linearRampToValueAtTime(440, now + 0.3);
  
  gain2.gain.setValueAtTime(0, now);
  gain2.gain.linearRampToValueAtTime(0.15, now + 0.1);
  gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
  
  osc2.start(now);
  osc2.stop(now + 0.55);
};
