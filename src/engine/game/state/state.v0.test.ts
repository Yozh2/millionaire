import { canDispatchInPhase } from './machine';
import type { GameAction } from './actions';

describe('game state machine (v0)', () => {
  it('allows only safe actions in non-play phases', () => {
    const playingOnly: GameAction['type'][] = [
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
    ];

    for (const actionType of playingOnly) {
      expect(canDispatchInPhase('start', actionType)).toBe(false);
      expect(canDispatchInPhase('victory', actionType)).toBe(false);
      expect(canDispatchInPhase('defeat', actionType)).toBe(false);
      expect(canDispatchInPhase('retreat', actionType)).toBe(false);
    }
  });

  it('always allows NEW_GAME', () => {
    expect(canDispatchInPhase('start', 'NEW_GAME')).toBe(true);
    expect(canDispatchInPhase('play', 'NEW_GAME')).toBe(true);
    expect(canDispatchInPhase('victory', 'NEW_GAME')).toBe(true);
    expect(canDispatchInPhase('defeat', 'NEW_GAME')).toBe(true);
    expect(canDispatchInPhase('retreat', 'NEW_GAME')).toBe(true);
  });
});
