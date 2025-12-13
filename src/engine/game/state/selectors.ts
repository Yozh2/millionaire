import type { GameDomainState } from './types';
import { getGuaranteedPrize, getQuestionDifficulty } from '..';

export const selectTotalQuestions = (state: GameDomainState): number =>
  state.questions.length;

export const selectCurrentQuestionData = (state: GameDomainState) =>
  state.questions.length > 0 ? state.questions[state.currentQuestionIndex] : null;

export const selectCurrentPrize = (state: GameDomainState): string =>
  state.prizeLadder.values[state.currentQuestionIndex] ?? '0';

export const selectCurrentDifficulty = (state: GameDomainState): number =>
  getQuestionDifficulty(state.currentQuestionIndex, state.questions.length);

export const selectGuaranteedPrizeOnLoss = (state: GameDomainState): string =>
  getGuaranteedPrize(state.currentQuestionIndex, state.prizeLadder);

