export { gameReducer } from './reducer';
export { createInitialGameDomainState, type GameDomainState } from './types';
export { resolveAnswer } from './resolveAnswer';
export type { GameAction, AnswerOutcome } from './actions';
export {
  selectCurrentQuestionData,
  selectCurrentPrize,
  selectCurrentDifficulty,
  selectTotalQuestions,
} from './selectors';

