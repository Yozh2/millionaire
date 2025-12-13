import type { LifelineAudienceResult, LifelinePhoneResult } from '../../types';
import type { GameSession } from '../session';

export type AnswerOutcome = 'correct' | 'wrong' | 'won';

export type GameAction =
  | { type: 'SELECT_CAMPAIGN'; campaignId: string; session: GameSession | null }
  | { type: 'START_GAME'; campaignId: string; session: GameSession | null }
  | { type: 'NEW_GAME' }
  | { type: 'FORCE_WIN'; prize: string }
  | { type: 'ANSWER_SELECTED'; displayIndex: number }
  | {
      type: 'ANSWER_RESOLVED';
      outcome: AnswerOutcome;
      wonPrize: string;
      nextQuestionIndex?: number;
      nextShuffledAnswers?: number[];
    }
  | { type: 'TAKE_MONEY' }
  | { type: 'CLEAR_LIFELINE_RESULT' }
  | { type: 'APPLY_LIFELINE_FIFTY'; eliminated: number[] }
  | { type: 'APPLY_LIFELINE_PHONE'; result: LifelinePhoneResult }
  | { type: 'APPLY_LIFELINE_AUDIENCE'; result: LifelineAudienceResult };

