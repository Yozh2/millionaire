import type { GameDomainState } from './types';
import { selectCurrentDifficulty, selectCurrentPrize, selectGuaranteedPrizeOnLoss, selectTotalQuestions } from './selectors';

function makeState(overrides: Partial<GameDomainState> = {}): GameDomainState {
  const base: GameDomainState = {
    phase: 'play',
    selectedCampaignId: 'x',
    questions: [
      { question: 'Q1', answers: ['A', 'B', 'C', 'D'], correct: 0 },
      { question: 'Q2', answers: ['A', 'B', 'C', 'D'], correct: 1 },
      { question: 'Q3', answers: ['A', 'B', 'C', 'D'], correct: 2 },
    ],
    prizeLadder: { values: ['100', '200', '300'], guaranteed: [0, 1] },
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

describe('state selectors (v0)', () => {
  it('selectTotalQuestions counts questions', () => {
    expect(selectTotalQuestions(makeState())).toBe(3);
    expect(selectTotalQuestions(makeState({ questions: [] }))).toBe(0);
  });

  it('selectCurrentPrize reads from ladder', () => {
    expect(selectCurrentPrize(makeState({ currentQuestionIndex: 0 }))).toBe('100');
    expect(selectCurrentPrize(makeState({ currentQuestionIndex: 2 }))).toBe('300');
    expect(selectCurrentPrize(makeState({ currentQuestionIndex: 10 }))).toBe('0');
  });

  it('selectGuaranteedPrizeOnLoss returns previous guaranteed prize', () => {
    expect(selectGuaranteedPrizeOnLoss(makeState({ currentQuestionIndex: 0 }))).toBe('0');
    expect(selectGuaranteedPrizeOnLoss(makeState({ currentQuestionIndex: 1 }))).toBe('100');
    expect(selectGuaranteedPrizeOnLoss(makeState({ currentQuestionIndex: 2 }))).toBe('200');
  });

  it('selectCurrentDifficulty stays within 1..3', () => {
    expect(selectCurrentDifficulty(makeState({ currentQuestionIndex: 0, questions: new Array(15).fill(makeState().questions[0]!) }))).toBeGreaterThanOrEqual(1);
    expect(selectCurrentDifficulty(makeState({ currentQuestionIndex: 0, questions: new Array(15).fill(makeState().questions[0]!) }))).toBeLessThanOrEqual(3);
  });
});
