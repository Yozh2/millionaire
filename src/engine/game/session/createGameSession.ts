import type { GameConfig, PrizeLadder, Question } from '../../types';
import { selectQuestionsFromPool } from '../questions';
import { calculatePrizeLadder } from '../prizes';
import { shuffleArray } from '../utils/shuffleArray';

export interface GameSession {
  questions: Question[];
  prizeLadder: PrizeLadder;
  shuffledAnswers: number[];
}

export const createGameSession = (
  config: GameConfig,
  campaignId: string,
  rng: () => number = Math.random
): GameSession | null => {
  const pool = config.questionPools[campaignId];
  if (!pool) return null;

  const questions = selectQuestionsFromPool(pool, rng);
  const prizeLadder = calculatePrizeLadder(questions.length, config.prizes);
  const shuffledAnswers = shuffleArray([0, 1, 2, 3], rng);

  return { questions, prizeLadder, shuffledAnswers };
};

