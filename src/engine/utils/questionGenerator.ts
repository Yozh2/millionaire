/**
 * Question Generator Utility
 *
 * Selects random questions from a pool and generates
 * dynamic prize ladder based on question count.
 */

import {
  Question,
  QuestionPool,
  PrizesConfig,
  PrizeLadder,
} from '../types';

// ============================================
// Constants
// ============================================

/** Maximum questions to select from each difficulty tier */
const MAX_QUESTIONS_PER_TIER = 5;

/** Difficulty tiers in order */
const DIFFICULTY_TIERS: (keyof QuestionPool)[] = ['easy', 'medium', 'hard'];

// ============================================
// Utilities
// ============================================

/** Fisher-Yates shuffle - returns a new shuffled array */
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Round a number to a "nice" value for prize display.
 * Rounds to nearest 100 for small numbers, nearest 1000/10000 for larger.
 */
const roundToNiceNumber = (value: number): number => {
  if (value <= 0) return 0;
  if (value < 1000) {
    // Round to nearest 100
    return Math.round(value / 100) * 100;
  } else if (value < 10000) {
    // Round to nearest 500
    return Math.round(value / 500) * 500;
  } else if (value < 100000) {
    // Round to nearest 1000
    return Math.round(value / 1000) * 1000;
  } else if (value < 1000000) {
    // Round to nearest 10000
    return Math.round(value / 10000) * 10000;
  } else {
    // Round to nearest 100000
    return Math.round(value / 100000) * 100000;
  }
};

/**
 * Format a number with thousand separators.
 * E.g., 1000000 -> "1 000 000"
 */
const formatPrize = (value: number): string => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

// ============================================
// Main Functions
// ============================================

/**
 * Select questions from a pool for a game session.
 *
 * Selects up to MAX_QUESTIONS_PER_TIER (5) questions from each
 * difficulty tier (easy, medium, hard) and combines them in order.
 *
 * @param pool - Question pool with easy/medium/hard arrays
 * @returns Array of selected questions, ordered by difficulty
 */
export const selectQuestionsFromPool = (pool: QuestionPool): Question[] => {
  const selectedQuestions: Question[] = [];

  for (const tier of DIFFICULTY_TIERS) {
    const tierQuestions = pool[tier] || [];
    const shuffled = shuffleArray(tierQuestions);
    const selected = shuffled.slice(0, MAX_QUESTIONS_PER_TIER);
    selectedQuestions.push(...selected);
  }

  return selectedQuestions;
};

/**
 * Calculate prize ladder for a given number of questions.
 *
 * Creates an exponential-ish scale from small prizes to maxPrize,
 * with guaranteed (safe) prizes at specified fractions.
 *
 * @param questionCount - Total number of questions
 * @param config - Prize configuration
 * @returns Prize ladder with values and guaranteed indices
 */
export const calculatePrizeLadder = (
  questionCount: number,
  config: PrizesConfig
): PrizeLadder => {
  if (questionCount <= 0) {
    return { values: [], guaranteed: [] };
  }

  const { maxPrize, guaranteedFractions } = config;

  // Generate prize values using exponential-like curve
  // Prize for question i: maxPrize * (i / n) ^ exponent
  // We use exponent ~2 for a steeper curve (harder questions = bigger rewards)
  const exponent = 2;
  const values: string[] = [];

  for (let i = 1; i <= questionCount; i++) {
    const fraction = i / questionCount;
    const rawValue = maxPrize * Math.pow(fraction, exponent);
    const roundedValue = roundToNiceNumber(rawValue);
    // Ensure minimum prize of 100 and last prize is maxPrize
    const finalValue = i === questionCount ? maxPrize : Math.max(100, roundedValue);
    values.push(formatPrize(finalValue));
  }

  // Calculate guaranteed prize indices from fractions
  const guaranteed: number[] = [];
  for (const fraction of guaranteedFractions) {
    // Convert fraction to 0-based index
    const index = Math.round(fraction * questionCount) - 1;
    if (index >= 0 && index < questionCount && !guaranteed.includes(index)) {
      guaranteed.push(index);
    }
  }

  // Sort guaranteed indices
  guaranteed.sort((a, b) => a - b);

  return { values, guaranteed };
};

/**
 * Get the guaranteed prize amount for a given question index.
 * Returns the highest guaranteed prize at or below the current question.
 *
 * @param currentQuestion - Current question index (0-based)
 * @param ladder - Prize ladder
 * @returns Guaranteed prize string or "0"
 */
export const getGuaranteedPrize = (
  currentQuestion: number,
  ladder: PrizeLadder
): string => {
  // Find the highest guaranteed index at or below current question
  const passedGuaranteed = ladder.guaranteed.filter(
    (idx) => idx < currentQuestion
  );

  if (passedGuaranteed.length === 0) {
    return '0';
  }

  const highestGuaranteedIdx = Math.max(...passedGuaranteed);
  return ladder.values[highestGuaranteedIdx];
};

/**
 * Get the difficulty level for a question based on its position.
 * Returns 1-3 based on which third of the game the question is in.
 *
 * @param questionIndex - 0-based question index
 * @param totalQuestions - Total number of questions
 * @returns Difficulty level 1, 2, or 3
 */
export const getQuestionDifficulty = (
  questionIndex: number,
  totalQuestions: number
): number => {
  if (totalQuestions <= 0) return 1;

  const fraction = questionIndex / totalQuestions;

  if (fraction < 1 / 3) return 1;
  if (fraction < 2 / 3) return 2;
  return 3;
};
