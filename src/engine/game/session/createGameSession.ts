import type { GameConfig, PrizeLadder, Question } from '@engine/types';
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
  const campaign = config.campaigns.find((c) => c.id === campaignId);
  if (!campaign) return null;

  const questions = selectQuestionsFromPool(campaign.questions, rng);
  const prizeLadder = calculatePrizeLadder(questions.length, config.prizes);
  const shuffledAnswers = shuffleArray([0, 1, 2, 3], rng);

  return { questions, prizeLadder, shuffledAnswers };
};
