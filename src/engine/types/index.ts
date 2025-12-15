/**
 * Core type definitions for the Quiz Game Engine.
 * These types define the contract for game configurations.
 */

import { ComponentType } from 'react';

export interface CampaignIconProps {
  className?: string;
}

/**
 * Custom coin drawing function for particle effects.
 * Called with canvas context, size, and color index.
 */
export type DrawCoinFunction = (
  ctx: CanvasRenderingContext2D,
  size: number,
  colorIndex: number
) => void;

// ============================================
// Question Types
// ============================================

/** Difficulty levels for questions */
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

/** Represents a single quiz question */
export interface Question {
  /** The question text displayed to the player */
  question: string;
  /** Array of 4 possible answers */
  answers: string[];
  /** Index of the correct answer (0-3) */
  correct: number;
}

/**
 * Pool of questions organized by difficulty.
 * Up to 5 questions from each difficulty will be selected randomly.
 */
export interface QuestionPool {
  /** Easy questions (first ~1/3 of the game) */
  easy: Question[];
  /** Medium questions (middle ~1/3 of the game) */
  medium: Question[];
  /** Hard questions (final ~1/3 of the game) */
  hard: Question[];
}

// ============================================
// Theme Types
// ============================================

/** Complete theme color configuration for a game mode */
export interface ThemeColors {
  // Primary color name (for reference)
  primary: string;

  /** Whether this theme targets light surfaces (used for shadow/backdrop defaults). */
  isLight?: boolean;

  // Background gradient for the entire screen
  bgGradient?: string;

  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textAccent: string;

  /** Optional text color for the big header title/subtitle (falls back to textPrimary). */
  textTitle?: string;
  /** Optional text color for PanelHeader (falls back to textSecondary). */
  textHeader?: string;

  // Border colors
  border: string;
  borderLight: string;
  borderHover: string;

  // Panel backgrounds
  bgPanel: string;
  bgPanelFrom: string;
  bgPanelVia: string;
  bgPanelTo: string;

  // Header
  bgHeader: string;
  bgHeaderVia: string;
  headerBorderColor: string;

  /** Optional text shadow for the big header title/subtitle (falls back to defaults). */
  headerTextShadow?: string;
  /** Optional backdrop gradient behind big header text (falls back to defaults). */
  headerTextBackdrop?: string;
  /** Optional text shadow for PanelHeader (falls back to defaults). */
  panelHeaderTextShadow?: string;

  // Buttons
  bgButton: string;
  bgButtonHover: string;

  // Answers
  bgAnswer: string;
  bgAnswerHover: string;
  shadowAnswer: string;

  // Lifelines
  bgLifeline: string;
  textLifeline: string;
  borderLifeline: string;

  // Prize ladder
  bgPrizeCurrent: string;
  bgPrizePassed: string;

  // Glow effects
  glow: string;
  glowColor: string;
  glowSecondary: string;

  // Border image
  borderImageColors: string;
}

// ============================================
// Campaign Types
// ============================================

/** A campaign/difficulty configuration */
export interface Campaign {
  /** Unique identifier for this campaign */
  id: string;

  /** Display name (e.g., 'ГЕРОЙ', 'АВТОБОТ') */
  name: string;

  /** Difficulty label (e.g., 'Легко', 'Сложно') */
  label: string;

  /** Icon component for this campaign */
  icon: ComponentType<CampaignIconProps>;

  /** Color theme for this campaign */
  theme: ThemeColors;

  /** Music track filename for this campaign (optional) */
  musicTrack?: string;

  /** Sound effect when selecting this campaign (optional) */
  selectSound?: string;
}

// ============================================
// Companion Types
// ============================================

/** A companion character for "Phone a Friend" lifeline */
export interface Companion {
  /** Unique identifier */
  id: string;

  /** Display name */
  name: string;

  /** Description (optional) */
  desc?: string;

  /** Meta-information (optional) */
  meta?: string;

  /** Voice file (optional) */
  voiceFile?: string;
}

// ============================================
// Lifeline Types
// ============================================

/** Standard lifeline identifiers (domain ids) */
export type LifelineKind =
  | 'fifty'
  | 'phone'
  | 'audience'
  | 'host'
  | 'switch'
  | 'double';

/** Configuration for a single lifeline */
export interface LifelineConfig {
  /** Display name */
  name: string;

  /** Icon (emoji or component) */
  icon: string;

  /** Whether this lifeline is enabled */
  enabled: boolean;
}

/** Configuration for a single non-lifeline action button (e.g. take money) */
export interface ActionConfig {
  /** Display name */
  name: string;

  /** Icon (emoji or component) */
  icon: string;

  /** Whether this action is enabled */
  enabled: boolean;
}

/** All lifelines configuration */
export interface LifelinesConfig {
  /**
   * v2 lifeline ids (preferred)
   */
  fifty: LifelineConfig;
  phone: LifelineConfig;
  audience: LifelineConfig;
  host?: LifelineConfig;
  switch?: LifelineConfig;
  double?: LifelineConfig;

  /**
   * v1 legacy lifeline keys
   * @deprecated use v2 ids (`fifty|phone|audience`)
   */
  fiftyFifty?: LifelineConfig;
  /** @deprecated use v2 ids (`fifty|phone|audience`) */
  phoneAFriend?: LifelineConfig;
  /** @deprecated use v2 ids (`fifty|phone|audience`) */
  askAudience?: LifelineConfig;

  /**
   * Take the Money (legacy placement)
   * @deprecated use `GameConfig.actions.takeMoney`
   */
  takeMoney?: ActionConfig;
}

// ============================================
// Prize Types
// ============================================

/** Prize configuration */
export interface PrizesConfig {
  /** Maximum prize value (e.g., 1000000 for "million") */
  maxPrize: number;

  /** Currency name (e.g., 'золотых', 'энергонов') */
  currency: string;

  /**
   * Guaranteed prize positions as fractions of total questions.
   * E.g., [1/3, 2/3, 1] means guaranteed at 1/3, 2/3, and final question.
   * These will be rounded to nearest question number.
   */
  guaranteedFractions: number[];
}

/** Runtime prize ladder (calculated based on actual question count) */
export interface PrizeLadder {
  /** Prize values for each question (index 0 = question 1) */
  values: string[];

  /** Indices of guaranteed/safe prizes (0-based) */
  guaranteed: number[];
}

// ============================================
// Audio Types
// ============================================

/** Sound effect mapping - logical name to filename */
export interface SoundEffects {
  /** Answer button click sound */
  answerButton?: string;
  /** Big button press (start game / restart) */
  bigButton?: string;

  /**
   * v2 lifeline SFX keys (preferred)
   * Note: during migration the engine also supports `hint*` keys as aliases.
   */
  lifelineFifty?: string;
  lifelinePhone?: string;
  lifelineAudience?: string;
  lifelineHost?: string;
  lifelineSwitch?: string;
  lifelineDouble?: string;

  /** Take money action button SFX (not a lifeline) */
  takeMoneyButton?: string;

  /**
   * v1 legacy keys
   * @deprecated use `lifeline*` / `takeMoneyButton`
   */
  hintReduceButton?: string;
  /** @deprecated use `lifeline*` / `takeMoneyButton` */
  hintCallButton?: string;
  /** @deprecated use `lifeline*` / `takeMoneyButton` */
  hintVoteButton?: string;
  /** @deprecated use `lifeline*` / `takeMoneyButton` */
  hintTakeMoneyButton?: string;

  /** Victory - winning the game sound (epic fanfare) */
  victory?: string;
  /** Defeat - wrong answer / game over sound */
  defeat?: string;
  /** Correct - correct answer, proceed to next question */
  correct?: string;
}

/** Audio configuration */
export interface AudioConfig {
  /** Background music volume (0-1) */
  musicVolume: number;

  /** Sound effects volume (0-1) */
  soundVolume: number;

  /** Voice lines volume (0-1) */
  voiceVolume: number;

  /** Main menu music track filename (optional) */
  mainMenuTrack?: string;

  /** Game over music track filename (optional) - fallback for all end states */
  gameOverTrack?: string;

  /** Victory music track filename (optional) - plays when player wins */
  victoryTrack?: string;

  /** Take money music track filename (optional) - plays when player takes money */
  takeMoneyTrack?: string;

  /** Sound effects mapping */
  sounds: SoundEffects;
}

// ============================================
// UI Strings Types
// ============================================

/** All UI text strings for localization */
export interface GameStrings {
  // Start screen
  introText: string;
  selectPath: string;
  startButton: string;

  // Game screen - Question panel
  /** Template for question numbering (use {n} placeholder) */
  questionHeader: string;

  // Game screen - Lifelines
  lifelinesHeader: string;

  // Game screen - Prize ladder
  prizesHeader: string;

  // Lifelines (preferred)
  lifelinePhoneHeader: string;
  lifelineAudienceHeader: string;
  lifelineSenderLabel: string;
  lifelineAudienceLabel: string;

  /**
   * v1 legacy hint strings
   * @deprecated use `lifeline*` fields
   */
  hintPhoneHeader?: string;
  /** @deprecated use `lifeline*` fields */
  hintAudienceHeader?: string;
  /** @deprecated use `lifeline*` fields */
  hintSenderLabel?: string;
  /** @deprecated use `lifeline*` fields */
  hintAudienceLabel?: string;

  // Companion phrases (with {answer} placeholder)
  companionPhrases: {
    confident: string[];
    uncertain: string[];
  };

  // End screens
  wonTitle: string;
  wonText: string;
  wonHeader: string;

  lostTitle: string;
  lostText: string;
  lostHeader: string;
  correctAnswerLabel: string;

  tookMoneyTitle: string;
  tookMoneyText: string;
  tookMoneyHeader: string;

  newGameButton: string;

  // Footer
  footer: string;

  // Music toggle
  musicOn: string;
  musicOff: string;
}

// ============================================
// Game State Types
// ============================================

/** Possible game states */
export type GameState = 'start' | 'playing' | 'won' | 'lost' | 'took_money';

/** Reward kind for end-of-game result */
export type RewardKind = 'trophy' | 'money' | 'defeat';

/** Lifeline result from "Phone-a-Friend" */
export interface LifelinePhoneResult {
  type: 'phone';
  name: string;
  text: string;
}

/** Lifeline result from "Ask-the-Audience" */
export interface LifelineAudienceResult {
  type: 'audience';
  percentages: number[];
}

/** Lifeline result from "Ask-the-Host" */
export interface LifelineHostResult {
  type: 'host';
  suggestedDisplayIndex: number;
  answerText: string;
  confidence: 'confident' | 'uncertain';
}

/** Lifeline result from "Switch-the-Question" */
export interface LifelineSwitchResult {
  type: 'switch';
}

/** Lifeline result from "Double Dip" */
export interface LifelineDoubleResult {
  type: 'double';
  stage: 'armed' | 'strike';
}

/** Union type for all lifeline result overlays */
export type LifelineResult =
  | LifelinePhoneResult
  | LifelineAudienceResult
  | LifelineHostResult
  | LifelineSwitchResult
  | LifelineDoubleResult
  | null;

/**
 * v1 legacy names (kept for compatibility during migration)
 * @deprecated use `Lifeline*` / `LifelineResult`
 */
export type PhoneHint = LifelinePhoneResult;
/** @deprecated use `Lifeline*` / `LifelineResult` */
export type AudienceHint = LifelineAudienceResult;
/** @deprecated use `Lifeline*` / `LifelineResult` */
export type Hint = LifelineResult;

// ============================================
// Header Slideshow Types
// ============================================

/** Screen context for slideshow image selection */
export type SlideshowScreen =
  | 'start'
  | 'play'
  | 'won'
  | 'took'
  | 'lost';

/**
 * Configuration for the header slideshow effect.
 * Images cross-fade with additive blend mode for dramatic effect.
 *
 * Images are loaded automatically from manifest.json based on:
 * - Game ID (e.g., 'bg3')
 * - Campaign ID (e.g., 'hero')
 * - Screen type ('start', 'play', 'won', 'took', 'lost')
 * - Difficulty ('easy', 'medium', 'hard') for 'play' screen
 *
 * See README.md for full directory structure and fallback order.
 */
export interface HeaderSlideshowConfig {
  /**
   * Enable slideshow. Default: true if config exists.
   */
  enabled?: boolean;
  /** Transition duration in ms (default: 1500) */
  transitionDuration?: number;
  /** Time each image is shown in ms (default: 4000) */
  displayDuration?: number;
  /** Opacity of the slideshow overlay (default: 1) */
  opacity?: number;
}

// ============================================
// Main Game Config
// ============================================

/**
 * Default font family for the engine.
 * Uses standard system fonts available on all platforms.
 */
export const DEFAULT_FONT_FAMILY = 'Arial, Helvetica, sans-serif';

/** Complete game configuration */
export interface GameConfig {
  /** Unique game identifier (used for asset paths) */
  id: string;

  /** Main title */
  title: string;

  /** Subtitle (edition name) */
  subtitle: string;

  /** Fallback emoji icon for the game (used when no favicon found) */
  emoji?: string;

  /**
   * Font family for the game UI (CSS font-family value).
   * Should include fallbacks.
   * Default: Roboto with system fallbacks.
   * @example '"Orbitron", "Roboto", sans-serif'
   */
  fontFamily?: string;

  /** Available campaigns/difficulties (2-N) */
  campaigns: Campaign[];

  /** Question pools grouped by campaign ID */
  questionPools: Record<string, QuestionPool>;

  /** Companions for "Phone a Friend" (can be empty) */
  companions: Companion[];

  /** UI text strings */
  strings: GameStrings;

  /** Lifelines configuration */
  lifelines: LifelinesConfig;

  /**
   * Non-lifeline action buttons (v1).
   * @example takeMoney button shown in PrizeLadderPanel.
   */
  actions?: {
    takeMoney: ActionConfig;
  };

  /** Prize configuration */
  prizes: PrizesConfig;

  /** Audio configuration */
  audio: AudioConfig;

  /**
   * End screen icons (optional, uses defaults if not provided)
   * Keys: 'won', 'lost', 'tookMoney'
   */
  endIcons?: {
    won?: ComponentType;
    lost?: ComponentType;
    tookMoney?: ComponentType;
  };

  /**
   * Icons used in game UI (optional, uses emoji defaults if not provided)
   */
  icons?: {
    /** Small coin icon for prize display */
    coin?: ComponentType;
    /** Icon for phone-a-friend lifeline */
    lifelinePhone?: ComponentType;
    /** Icon for ask-the-audience lifeline */
    lifelineAudience?: ComponentType;
    /** Star icon for difficulty rating */
    star?: ComponentType;
    /** Icon for the initial sound consent panel (headphones) */
    headphones?: ComponentType;

    /**
     * v1 legacy icon keys
     * @deprecated use `lifelinePhone` / `lifelineAudience`
     */
    phoneHint?: ComponentType;
    /** @deprecated use `lifelinePhone` / `lifelineAudience` */
    audienceHint?: ComponentType;
  };

  /**
   * Custom coin drawing function for particle effects (optional).
   * If not provided, uses default gold coin with "G" letter.
   * See drawDefaultCoin in ParticleCanvas for reference implementation.
   */
  drawCoinParticle?: DrawCoinFunction;

  /**
   * Custom colors for lost spark particles on defeat screen (optional).
   * Array of CSS color strings. If not provided, default spark colors are used.
   * Example: ['#FF6B6B', '#FF4444', '#CC0000']
   */
  lostSparkColors?: string[];

  /**
   * Enable lost spark particle effect on defeat screen (optional).
   * When true, tiny sparks will emanate from the defeat icon.
   * Default: false
   */
  enableLostSparks?: boolean;

  /**
   * Header slideshow configuration (optional).
   * Shows themed images in the header with additive blend mode.
   */
  headerSlideshow?: HeaderSlideshowConfig;

  /**
   * Optional engine-level UI strings that are not part of the main game localization.
   * Useful for per-game exceptions (e.g., English-only editions).
   */
  systemStrings?: {
    /** Loading title shown while preloading game assets. Use "{title}" placeholder. */
    loadingGameTitle?: string;
    /** Loading subtitle shown while preloading game assets. */
    loadingGameSubtitle?: string;
    /** Loading title shown while preloading campaign assets. */
    loadingCampaignTitle?: string;

    /** Title shown in the initial sound consent overlay. */
    soundConsentTitle?: string;
    /** Message shown in the initial sound consent overlay (may include newlines). */
    soundConsentMessage?: string;
    /** Button label for enabling sound. */
    soundConsentEnableLabel?: string;
    /** Button label for disabling sound. */
    soundConsentDisableLabel?: string;
  };
}

// ============================================
// Effects API Types
// ============================================

/** Coordinates for effect origin (normalized 0-1) */
export interface EffectOrigin {
  x: number;
  y: number;
}

/**
 * API for triggering particle effects.
 * Returned by useEffects hook.
 */
export interface EffectsAPI {
  /** Trigger confetti effect (for wins) */
  triggerConfetti: (origin?: EffectOrigin) => void;
  /** Trigger coins effect (for wins/taking money) */
  triggerCoins: (origin?: EffectOrigin) => void;
  /** Trigger sparks effect (for correct answers) */
  triggerSparks: (origin?: EffectOrigin) => void;
  /** Trigger lost sparks effect (for defeat screen) */
  triggerLostSparks: (origin?: EffectOrigin) => void;
  /** Trigger pulse effect (for hints) */
  triggerPulse: (origin?: EffectOrigin, color?: string) => void;
  /** Trigger fireworks effect (for big wins) */
  triggerFireworks: () => void;
}
