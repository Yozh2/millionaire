/**
 * Engine Constants
 *
 * Centralized configuration values and magic numbers.
 * Import these instead of hardcoding values.
 */

// ============================================
// Question Generator
// ============================================

/** Maximum questions to select from each difficulty tier */
export const MAX_QUESTIONS_PER_TIER = 5;

/** Difficulty tiers in order */
export const DIFFICULTY_TIERS = ['easy', 'medium', 'hard'] as const;

// ============================================
// Header Slideshow Defaults
// ============================================

/** Default transition duration in milliseconds */
export const DEFAULT_SLIDESHOW_TRANSITION_MS = 1500;

/** Default display duration per image in milliseconds */
export const DEFAULT_SLIDESHOW_DISPLAY_MS = 4000;

/** Default slideshow overlay opacity */
export const DEFAULT_SLIDESHOW_OPACITY = 0.4;

// ============================================
// Audio
// ============================================

/** Default music volume (0-1) */
export const DEFAULT_MUSIC_VOLUME = 0.3;

/** Default sound effects volume (0-1) */
export const DEFAULT_SOUND_VOLUME = 1.0;

/** Default voice volume (0-1) */
export const DEFAULT_VOICE_VOLUME = 1.0;

// ============================================
// Animation
// ============================================

/** Duration for answer reveal animation in ms */
export const ANSWER_REVEAL_DURATION_MS = 2000;

/** Duration for particle effects in ms */
export const PARTICLE_EFFECT_DURATION_MS = 3000;

// ============================================
// LocalStorage Keys
// ============================================

/** Key for persisted sound preference */
export const STORAGE_KEY_SOUND_ENABLED = 'millionaire_sound_enabled';

// ============================================
// Typography
// ============================================

/** Non-breaking space character (U+00A0). Handy for preventing unwanted wraps in UI strings. */
export const nbsp = '\u00A0';

/** Alias for `nbsp` (U+00A0). */
export const NBSP = nbsp;
