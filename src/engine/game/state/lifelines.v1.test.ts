import type { GameDomainState } from './types';
import type { Question } from '@engine/types';
import { gameReducer } from './reducer';
import { resolveAnswer } from './resolveAnswer';
import { getHostSuggestion } from '../lifelines/host';
import { pickSwitchQuestionIndex } from '../lifelines/switch';

function makeQuestion(correct: number): Question {
  return {
    question: 'Q?',
    answers: ['A', 'B', 'C', 'D'],
    correct,
  };
}

function makePlayState(overrides: Partial<GameDomainState> = {}): GameDomainState {
  const base: GameDomainState = {
    phase: 'play',
    selectedCampaignId: 'x',
    questions: [makeQuestion(0), makeQuestion(1), makeQuestion(2)],
    prizeLadder: { values: ['100', '200', '300'], guaranteed: [] },
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

function sequenceRng(values: number[]): () => number {
  let i = 0;
  return () => values[Math.min(i++, values.length - 1)] ?? 0;
}

describe('lifelines v1 (host/switch/double)', () => {
  describe('getHostSuggestion', () => {
    it('returns correct suggestion when confident', () => {
      const rng = sequenceRng([0.1]);
      const result = getHostSuggestion({
        correctDisplayIndex: 2,
        eliminatedDisplayIndices: [],
        rng,
        confidentChance: 0.78,
      });

      expect(result).toEqual({
        suggestedDisplayIndex: 2,
        confidence: 'confident',
      });
    });

    it('returns a wrong available choice when uncertain', () => {
      const rng = sequenceRng([0.99, 0.0]);
      const result = getHostSuggestion({
        correctDisplayIndex: 1,
        eliminatedDisplayIndices: [0, 2],
        rng,
        confidentChance: 0.78,
      });

      // Wrong choices available: [3]
      expect(result).toEqual({
        suggestedDisplayIndex: 3,
        confidence: 'uncertain',
      });
    });
  });

  describe('pickSwitchQuestionIndex', () => {
    it('returns null when there are no remaining questions', () => {
      expect(
        pickSwitchQuestionIndex({ currentQuestionIndex: 2, totalQuestions: 3, rng: () => 0 })
      ).toBeNull();
    });

    it('picks an index strictly after current', () => {
      expect(
        pickSwitchQuestionIndex({ currentQuestionIndex: 1, totalQuestions: 4, rng: () => 0 })
      ).toBe(2);
      expect(
        pickSwitchQuestionIndex({ currentQuestionIndex: 1, totalQuestions: 4, rng: () => 0.99 })
      ).toBe(3);
    });
  });

  describe('resolveAnswer', () => {
    it('returns retry on wrong answer when Double Dip is armed and strike not used', () => {
      const state = makePlayState({
        wonPrize: '500',
        doubleDipArmed: true,
        doubleDipStrikeUsed: false,
        currentQuestionIndex: 0,
        questions: [makeQuestion(0)],
        shuffledAnswers: [0, 1, 2, 3],
      });

      const result = resolveAnswer(state, 2);
      expect(result).toEqual({ outcome: 'retry', wonPrize: '500' });
    });
  });

  describe('gameReducer', () => {
    it('arms Double Dip and then consumes strike on first mistake', () => {
      const state0 = makePlayState({
        lifelineAvailability: {
          ...makePlayState().lifelineAvailability,
          double: true,
        },
      });

      const state1 = gameReducer(state0, {
        type: 'APPLY_LIFELINE_DOUBLE',
        result: { type: 'double', stage: 'armed' },
      });

      expect(state1.doubleDipArmed).toBe(true);
      expect(state1.doubleDipStrikeUsed).toBe(false);
      expect(state1.lifelineAvailability.double).toBe(false);
      expect(state1.lifelineResult).toEqual({ type: 'double', stage: 'armed' });

      const state2 = gameReducer(state1, { type: 'ANSWER_SELECTED', displayIndex: 2 });
      expect(state2.selectedAnswerDisplayIndex).toBe(2);

      const state3 = gameReducer(state2, { type: 'ANSWER_RESOLVED', outcome: 'retry', wonPrize: '0' });
      expect(state3.selectedAnswerDisplayIndex).toBeNull();
      expect(state3.eliminatedAnswerDisplayIndices).toContain(2);
      expect(state3.doubleDipArmed).toBe(true);
      expect(state3.doubleDipStrikeUsed).toBe(true);
      expect(state3.lifelineResult).toEqual({ type: 'double', stage: 'strike' });

      // eliminated answer can't be selected again
      const state4 = gameReducer(state3, { type: 'ANSWER_SELECTED', displayIndex: 2 });
      expect(state4.selectedAnswerDisplayIndex).toBeNull();
    });

    it('applies Switch-the-Question by swapping with a future question and clears volatile state', () => {
      const questions = [makeQuestion(0), makeQuestion(1), makeQuestion(2)];
      const state0 = makePlayState({
        questions,
        currentQuestionIndex: 0,
        eliminatedAnswerDisplayIndices: [1, 3],
        doubleDipArmed: true,
        doubleDipStrikeUsed: true,
        lifelineAvailability: {
          ...makePlayState().lifelineAvailability,
          switch: true,
        },
      });

      const state1 = gameReducer(state0, {
        type: 'APPLY_LIFELINE_SWITCH',
        swapWithIndex: 2,
        nextShuffledAnswers: [3, 2, 1, 0],
        result: { type: 'switch' },
      });

      expect(state1.lifelineAvailability.switch).toBe(false);
      expect(state1.questions[0]).toEqual(questions[2]);
      expect(state1.questions[2]).toEqual(questions[0]);
      expect(state1.eliminatedAnswerDisplayIndices).toEqual([]);
      expect(state1.shuffledAnswers).toEqual([3, 2, 1, 0]);
      expect(state1.lifelineResult).toEqual({ type: 'switch' });
      expect(state1.doubleDipArmed).toBe(false);
      expect(state1.doubleDipStrikeUsed).toBe(false);
    });

    it('applies Ask-the-Host by disabling it and setting lifelineResult', () => {
      const state0 = makePlayState({
        lifelineAvailability: {
          ...makePlayState().lifelineAvailability,
          host: true,
        },
      });

      const state1 = gameReducer(state0, {
        type: 'APPLY_LIFELINE_HOST',
        result: {
          type: 'host',
          suggestedDisplayIndex: 0,
          answerText: 'A',
          confidence: 'confident',
        },
      });

      expect(state1.lifelineAvailability.host).toBe(false);
      expect(state1.lifelineResult).toEqual({
        type: 'host',
        suggestedDisplayIndex: 0,
        answerText: 'A',
        confidence: 'confident',
      });
    });
  });
});
