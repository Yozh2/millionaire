/**
 * Type definitions for the quiz game.
 */

/** Difficulty modes corresponding to character origins */
export type DifficultyMode = 'hero' | 'mindFlayer' | 'darkUrge';

/** Represents a single quiz question */
export interface Question {
  /** The question text displayed to the player */
  question: string;
  /** Array of 4 possible answers */
  answers: string[];
  /** Index of the correct answer (0-3) */
  correct: number;
  /** Difficulty rating (1-5 stars) */
  difficulty: number;
}

/** Hint from "Phone a Friend" lifeline */
export interface PhoneHint {
  type: 'phone';
  /** Name of the companion giving advice */
  name: string;
  /** The companion's answer suggestion */
  text: string;
}

/** Hint from "Ask the Audience" lifeline */
export interface AudienceHint {
  type: 'audience';
  /** Percentage votes for each answer [A, B, C, D] */
  percentages: number[];
}

/** Union type for all hint types */
export type Hint = PhoneHint | AudienceHint | null;

/** Possible game states */
export type GameState = 'start' | 'playing' | 'won' | 'lost' | 'took_money';
