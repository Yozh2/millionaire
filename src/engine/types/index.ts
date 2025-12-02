/**
 * Core type definitions for the Quiz Game Engine.
 * These types define the contract for game configurations.
 */

import { ComponentType } from 'react';

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

  // Background gradient for the entire screen
  bgGradient?: string;

  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textAccent: string;

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
  icon: ComponentType;

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

  /** Voice file for this companion (optional) */
  voiceFile?: string;
}

// ============================================
// Lifeline Types
// ============================================

/** Configuration for a single lifeline */
export interface LifelineConfig {
  /** Display name */
  name: string;

  /** Icon (emoji or component) */
  icon: string;

  /** Whether this lifeline is enabled */
  enabled: boolean;
}

/** All lifelines configuration */
export interface LifelinesConfig {
  /** 50:50 - removes two wrong answers */
  fiftyFifty: LifelineConfig;

  /** Phone a Friend - advice from a companion */
  phoneAFriend: LifelineConfig;

  /** Ask the Audience - voting percentages */
  askAudience: LifelineConfig;

  /** Take the Money - leave with current winnings */
  takeMoney: LifelineConfig;
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
  /** Click - default button click sound */
  click?: string;
  /** Start - campaign start button */
  start?: string;
  /** Hint - 50:50 lifeline sound */
  hint?: string;
  /** Call - phone a friend lifeline sound */
  call?: string;
  /** Vote - ask the audience lifeline sound */
  vote?: string;
  /** Money - victory or take money sound */
  money?: string;
  /** Restart - new game / return to menu sound */
  restart?: string;
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

  /** Game over music track filename (optional) */
  gameOverTrack?: string;

  /** Sound effects mapping */
  sounds: SoundEffects;
}

// ============================================
// UI Strings Types
// ============================================

/** All UI text strings for localization */
export interface GameStrings {
  // Header
  headerTitle: string;

  // Start screen
  introText: string;
  selectPath: string;
  startButton: string;

  // Game screen - Question panel
  questionHeader: string;
  difficultyLabel: string;
  progressLabel: string;

  // Game screen - Lifelines
  lifelinesHeader: string;

  // Game screen - Prize ladder
  prizesHeader: string;

  // Hints
  hintPhoneHeader: string;
  hintAudienceHeader: string;
  hintSenderLabel: string;
  hintAudienceLabel: string;

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

  prizeLabel: string;
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

/** Hint from "Phone a Friend" lifeline */
export interface PhoneHint {
  type: 'phone';
  name: string;
  text: string;
}

/** Hint from "Ask the Audience" lifeline */
export interface AudienceHint {
  type: 'audience';
  percentages: number[];
}

/** Union type for all hint types */
export type Hint = PhoneHint | AudienceHint | null;

// ============================================
// Main Game Config
// ============================================

/** Complete game configuration */
export interface GameConfig {
  /** Unique game identifier (used for asset paths) */
  id: string;

  /** Main title */
  title: string;

  /** Subtitle (edition name) */
  subtitle: string;

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
    /** Icon for phone a friend hint */
    phoneHint?: ComponentType;
    /** Icon for ask the audience hint */
    audienceHint?: ComponentType;
    /** Star icon for difficulty rating */
    star?: ComponentType;
  };

  /**
   * Custom coin drawing function for particle effects (optional).
   * If not provided, uses default gold coin with "G" letter.
   * See drawDefaultCoin in ParticleCanvas for reference implementation.
   */
  drawCoinParticle?: DrawCoinFunction;

  /**
   * Page metadata for dynamic favicon, apple-touch-icon, and theme color.
   * Each game can have its own unique icons for browser tabs and iOS home screen.
   */
  meta?: {
    /** Path to favicon (SVG or PNG), e.g., "/games/bg3/favicon.svg" */
    favicon?: string;
    /** Path to apple-touch-icon (180x180 PNG for iOS), e.g., "/games/bg3/apple-touch-icon.png" */
    appleTouchIcon?: string;
    /** Theme color for browser chrome, e.g., "#d97706" */
    themeColor?: string;
  };
}
