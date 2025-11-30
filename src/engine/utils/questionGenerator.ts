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

/**
 * Classic "Who Wants to Be a Millionaire" prize multipliers.
 * These are the fractions of maxPrize for each question position.
 * Based on the original 15-question format scaled to any count.
 *
 * Original pattern (for $1M max):
 * $100, $200, $300, $500, $1000 (easy tier - small steps)
 * $2K, $4K, $8K, $16K, $32K (medium tier - doubling)
 * $64K, $125K, $250K, $500K, $1M (hard tier - bigger jumps)
 */
const CLASSIC_MULTIPLIERS_15 = [
  0.0001,   // 100 / 1M
  0.0002,   // 200
  0.0003,   // 300
  0.0005,   // 500
  0.001,    // 1,000
  0.002,    // 2,000
  0.004,    // 4,000
  0.008,    // 8,000
  0.016,    // 16,000
  0.032,    // 32,000
  0.064,    // 64,000
  0.125,    // 125,000
  0.25,     // 250,000
  0.5,      // 500,000
  1.0,      // 1,000,000
];

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
 * Uses classic WWTBAM-style rounding to preferred values.
 */
const roundToNiceNumber = (value: number): number => {
  if (value <= 0) return 0;

  // Define "nice" numbers that look good in prize ladders
  const niceNumbers = [
    100, 200, 300, 400, 500, 600, 700, 800, 900,
    1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 7000, 8000, 9000,
    10000, 12000, 15000, 16000, 20000, 25000, 30000, 32000, 40000, 50000,
    60000, 64000, 75000, 80000, 100000, 125000, 150000, 200000, 250000,
    300000, 400000, 500000, 600000, 750000, 800000,
    1000000, 1500000, 2000000, 2500000, 3000000, 4000000, 5000000,
    10000000, 15000000, 20000000, 25000000, 50000000, 100000000,
  ];

  // Find the closest nice number
  let closest = niceNumbers[0];
  let minDiff = Math.abs(value - closest);

  for (const nice of niceNumbers) {
    const diff = Math.abs(value - nice);
    if (diff < minDiff) {
      minDiff = diff;
      closest = nice;
    }
  }

  return closest;
};

/**
 * Format a number with thousand separators (space).
 * E.g., 1000000 -> "1 000 000"
 */
const formatPrize = (value: number): string => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

/**
 * Interpolate multipliers for a given question count.
 * Maps n questions onto the classic 15-question pattern.
 */
const interpolateMultipliers = (questionCount: number): number[] => {
  if (questionCount <= 0) return [];
  if (questionCount === 15) return [...CLASSIC_MULTIPLIERS_15];

  const multipliers: number[] = [];

  for (let i = 0; i < questionCount; i++) {
    // Map question index to position in classic 15-question scale
    const classicPosition = (i / (questionCount - 1)) * 14;
    const lowerIdx = Math.floor(classicPosition);
    const upperIdx = Math.min(lowerIdx + 1, 14);
    const fraction = classicPosition - lowerIdx;

    // Linear interpolation between adjacent classic multipliers
    const lowerMult = CLASSIC_MULTIPLIERS_15[lowerIdx];
    const upperMult = CLASSIC_MULTIPLIERS_15[upperIdx];

    // Use geometric interpolation for smoother exponential feel
    const multiplier = lowerMult * Math.pow(upperMult / lowerMult, fraction);
    multipliers.push(multiplier);
  }

  return multipliers;
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
 * Creates a classic WWTBAM-style scale from small prizes to maxPrize,
 * with guaranteed (safe) prizes at specified fractions.
 * Uses interpolation of the original 15-question pattern.
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

  // Get interpolated multipliers based on classic pattern
  const multipliers = interpolateMultipliers(questionCount);
  const values: string[] = [];

  // Track previous value to ensure monotonic increase
  let previousValue = 0;

  for (let i = 0; i < questionCount; i++) {
    const rawValue = maxPrize * multipliers[i];
    let roundedValue = roundToNiceNumber(rawValue);

    // Ensure values are strictly increasing
    if (roundedValue <= previousValue) {
      // Find next nice number above previous
      roundedValue = previousValue + (previousValue < 1000 ? 100 :
                     previousValue < 10000 ? 500 :
                     previousValue < 100000 ? 1000 : 10000);
      roundedValue = roundToNiceNumber(roundedValue);
    }

    // Last prize is always exactly maxPrize
    const finalValue = i === questionCount - 1 ? maxPrize : roundedValue;
    values.push(formatPrize(finalValue));
    previousValue = finalValue;
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
