import type { GameDomainState } from './types';
import type { AnswerOutcome } from './actions';
import { selectGuaranteedPrizeOnLoss, selectCurrentPrize, selectTotalQuestions } from './selectors';

export interface ResolveAnswerResult {
  outcome: AnswerOutcome;
  wonPrize: string;
}

export const resolveAnswer = (state: GameDomainState, displayIndex: number): ResolveAnswerResult => {
  const question = state.questions[state.currentQuestionIndex];
  if (!question) return { outcome: 'wrong', wonPrize: '0' };

  const originalIndex = state.shuffledAnswers[displayIndex];
  const correctOriginalIndex = question.correct;

  const totalQuestions = selectTotalQuestions(state);

  if (originalIndex !== correctOriginalIndex) {
    return { outcome: 'wrong', wonPrize: selectGuaranteedPrizeOnLoss(state) };
  }

  if (state.currentQuestionIndex === totalQuestions - 1) {
    return { outcome: 'won', wonPrize: selectCurrentPrize(state) };
  }

  return { outcome: 'correct', wonPrize: state.wonPrize };
};

