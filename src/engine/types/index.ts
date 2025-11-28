/**
 * Core type definitions for the Quiz Game Engine.
 * These types define the contract for game configurations.
 */

import { ComponentType } from 'react';

// ============================================
// Question Types
// ============================================

/** Represents a single quiz question */
export interface Question {
  /** The question text displayed to the player */
  question: string;
  /** Array of 4 possible answers */
  answers: string[];
  /** Index of the correct answer (0-3) */
  correct: number;
  /** Difficulty rating (1-3 stars) */
  difficulty: number;
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

/** Prize ladder configuration */
export interface PrizesConfig {
  /** List of prize values (bottom to top, typically 15 items) */
  values: string[];

  /** Indices of guaranteed/safe prizes (0-based) */
  guaranteed: number[];

  /** Currency name (e.g., 'золотых', 'энергонов') */
  currency: string;
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

  /** Questions grouped by mode ID */
  questions: Record<string, Question[]>;

  /** Companions for "Phone a Friend" (can be empty) */
  companions: Companion[];

  /** UI text strings */
  strings: GameStrings;

  /** Lifelines configuration */
  lifelines: LifelinesConfig;

  /** Prize ladder configuration */
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
}
