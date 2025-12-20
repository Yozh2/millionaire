import type { GameDomainState } from './types';
import { gameReducer } from './reducer';

function makeState(overrides: Partial<GameDomainState> = {}): GameDomainState {
  const base: GameDomainState = {
    phase: 'start',
    selectedCampaignId: null,
    questions: [],
    prizeLadder: { values: [], guaranteed: [] },
    currentQuestionIndex: 0,
    selectedAnswerDisplayIndex: null,
    shuffledAnswers: [0, 1, 2, 3],
    eliminatedAnswerDisplayIndices: [],
    lifelineAvailability: {
      fifty: true,
      phone: true,
      audience: true,
      host: false,
      switch: false,
      double: false,
    },
    lifelineResult: null,
    doubleDipArmed: false,
    doubleDipStrikeUsed: false,
    wonPrize: '0',
  };

  return { ...base, ...overrides };
}

describe('gameReducer (core flow)', () => {
  it('START_GAME moves to play and resets transient fields', () => {
    const start = makeState({
      phase: 'start',
      selectedCampaignId: 'old',
      questions: [{ question: 'Q', answers: ['A', 'B', 'C', 'D'], correct: 0 }],
      prizeLadder: { values: ['100'], guaranteed: [0] },
      currentQuestionIndex: 3,
      selectedAnswerDisplayIndex: 2,
      eliminatedAnswerDisplayIndices: [1, 3],
      lifelineAvailability: {
        fifty: false,
        phone: false,
        audience: false,
        host: true,
        switch: true,
        double: true,
      },
      lifelineResult: { type: 'switch' },
      doubleDipArmed: true,
      doubleDipStrikeUsed: true,
      wonPrize: '999',
    });

    const next = gameReducer(start, {
      type: 'START_GAME',
      campaignId: 'new',
      session: {
        questions: [
          { question: 'Q1', answers: ['A', 'B', 'C', 'D'], correct: 0 },
          { question: 'Q2', answers: ['A', 'B', 'C', 'D'], correct: 1 },
        ],
        prizeLadder: { values: ['100', '200'], guaranteed: [0] },
        shuffledAnswers: [2, 0, 1, 3],
      },
      lifelineAvailability: {
        fifty: true,
        phone: true,
        audience: true,
        host: false,
        switch: false,
        double: false,
      },
    });

    expect(next.phase).toBe('play');
    expect(next.selectedCampaignId).toBe('new');
    expect(next.currentQuestionIndex).toBe(0);
    expect(next.selectedAnswerDisplayIndex).toBeNull();
    expect(next.eliminatedAnswerDisplayIndices).toEqual([]);
    expect(next.lifelineResult).toBeNull();
    expect(next.doubleDipArmed).toBe(false);
    expect(next.doubleDipStrikeUsed).toBe(false);
    expect(next.wonPrize).toBe('0');
  });

  it('RETREAT moves to retreat and uses previous prize', () => {
    const playing = makeState({
      phase: 'play',
      currentQuestionIndex: 2,
      prizeLadder: { values: ['100', '200', '300'], guaranteed: [] },
    });

    const next = gameReducer(playing, { type: 'RETREAT' });
    expect(next.phase).toBe('retreat');
    expect(next.wonPrize).toBe('200');
  });
});
