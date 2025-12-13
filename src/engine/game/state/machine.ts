import type { GameState } from '../../types';
import type { GameAction } from './actions';

const allowed: Record<GameState, ReadonlySet<GameAction['type']>> = {
  start: new Set(['SELECT_CAMPAIGN', 'START_GAME', 'NEW_GAME']),
  playing: new Set([
    'ANSWER_SELECTED',
    'ANSWER_RESOLVED',
    'TAKE_MONEY',
    'CLEAR_LIFELINE_RESULT',
    'APPLY_LIFELINE_FIFTY',
    'APPLY_LIFELINE_PHONE',
    'APPLY_LIFELINE_AUDIENCE',
    'FORCE_WIN',
    'NEW_GAME',
  ]),
  won: new Set(['NEW_GAME']),
  lost: new Set(['NEW_GAME']),
  took_money: new Set(['NEW_GAME']),
};

export const canDispatchInPhase = (
  phase: GameState,
  actionType: GameAction['type']
): boolean => allowed[phase].has(actionType);

