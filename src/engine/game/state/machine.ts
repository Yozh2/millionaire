import type { GameState } from '@engine/types';
import type { GameAction } from './actions';

const allowed: Record<GameState, ReadonlySet<GameAction['type']>> = {
  start: new Set(['SELECT_CAMPAIGN', 'START_GAME', 'NEW_GAME']),
  play: new Set([
    'ANSWER_SELECTED',
    'ANSWER_RESOLVED',
    'RETREAT',
    'CLEAR_LIFELINE_RESULT',
    'APPLY_LIFELINE_FIFTY',
    'APPLY_LIFELINE_PHONE',
    'APPLY_LIFELINE_AUDIENCE',
    'APPLY_LIFELINE_HOST',
    'APPLY_LIFELINE_SWITCH',
    'APPLY_LIFELINE_DOUBLE',
    'FORCE_WIN',
    'NEW_GAME',
  ]),
  victory: new Set(['NEW_GAME']),
  defeat: new Set(['NEW_GAME']),
  retreat: new Set(['NEW_GAME']),
};

export const canDispatchInPhase = (
  phase: GameState,
  actionType: GameAction['type']
): boolean => allowed[phase].has(actionType);
