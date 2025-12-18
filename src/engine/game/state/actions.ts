import type {
  LifelineAudienceResult,
  LifelineDoubleResult,
  LifelineHostResult,
  LifelinePhoneResult,
  LifelineSwitchResult,
} from '@engine/types';
import type { GameSession } from '../session';
import type { LifelineAvailabilityState } from './types';

export type AnswerOutcome = 'correct' | 'wrong' | 'won' | 'retry';

export type GameAction =
  | { type: 'SELECT_CAMPAIGN'; campaignId: string; session: GameSession | null }
  | {
      type: 'START_GAME';
      campaignId: string;
      session: GameSession | null;
      lifelineAvailability: LifelineAvailabilityState;
    }
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
  | { type: 'APPLY_LIFELINE_AUDIENCE'; result: LifelineAudienceResult }
  | { type: 'APPLY_LIFELINE_HOST'; result: LifelineHostResult }
  | {
      type: 'APPLY_LIFELINE_SWITCH';
      swapWithIndex: number;
      nextShuffledAnswers: number[];
      result: LifelineSwitchResult;
    }
  | { type: 'APPLY_LIFELINE_DOUBLE'; result: LifelineDoubleResult };
