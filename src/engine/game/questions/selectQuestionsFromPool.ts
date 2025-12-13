import type { Question, QuestionPool } from '../../types';
import { MAX_QUESTIONS_PER_TIER, DIFFICULTY_TIERS } from '../../constants';
import { shuffleArray } from '../utils/shuffleArray';

export const selectQuestionsFromPool = (
  pool: QuestionPool,
  rng: () => number = Math.random
): Question[] => {
  const selectedQuestions: Question[] = [];

  for (const tier of DIFFICULTY_TIERS) {
    const tierQuestions = pool[tier] || [];
    const shuffled = shuffleArray(tierQuestions, rng);
    const selected = shuffled.slice(0, MAX_QUESTIONS_PER_TIER);
    selectedQuestions.push(...selected);
  }

  return selectedQuestions;
};
