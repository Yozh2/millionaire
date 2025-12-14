import { canDispatchInPhase } from './machine';
import type { GameAction } from './actions';

describe('game state machine (v0)', () => {
  it('allows only safe actions in non-playing phases', () => {
    const playingOnly: GameAction['type'][] = [
      'ANSWER_SELECTED',
      'ANSWER_RESOLVED',
      'TAKE_MONEY',
      'CLEAR_LIFELINE_RESULT',
      'APPLY_LIFELINE_FIFTY',
      'APPLY_LIFELINE_PHONE',
      'APPLY_LIFELINE_AUDIENCE',
      'APPLY_LIFELINE_HOST',
      'APPLY_LIFELINE_SWITCH',
      'APPLY_LIFELINE_DOUBLE',
      'FORCE_WIN',
    ];

    for (const actionType of playingOnly) {
      expect(canDispatchInPhase('start', actionType)).toBe(false);
      expect(canDispatchInPhase('won', actionType)).toBe(false);
      expect(canDispatchInPhase('lost', actionType)).toBe(false);
      expect(canDispatchInPhase('took_money', actionType)).toBe(false);
    }
  });

  it('always allows NEW_GAME', () => {
    expect(canDispatchInPhase('start', 'NEW_GAME')).toBe(true);
    expect(canDispatchInPhase('playing', 'NEW_GAME')).toBe(true);
    expect(canDispatchInPhase('won', 'NEW_GAME')).toBe(true);
    expect(canDispatchInPhase('lost', 'NEW_GAME')).toBe(true);
    expect(canDispatchInPhase('took_money', 'NEW_GAME')).toBe(true);
  });
});

