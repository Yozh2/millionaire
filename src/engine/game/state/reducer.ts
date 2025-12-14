import type { GameDomainState } from './types';
import { createInitialGameDomainState } from './types';
import type { GameAction } from './actions';
import { canDispatchInPhase } from './machine';

export const gameReducer = (
  state: GameDomainState,
  action: GameAction
): GameDomainState => {
  if (!canDispatchInPhase(state.phase, action.type) && action.type !== 'NEW_GAME') {
    return state;
  }

  switch (action.type) {
    case 'SELECT_CAMPAIGN': {
      return {
        ...state,
        selectedCampaignId: action.campaignId,
        questions: action.session?.questions ?? [],
        prizeLadder: action.session?.prizeLadder ?? { values: [], guaranteed: [] },
        shuffledAnswers: action.session?.shuffledAnswers ?? [0, 1, 2, 3],
      };
    }

    case 'START_GAME': {
      return {
        ...state,
        phase: 'playing',
        selectedCampaignId: action.campaignId,
        questions: action.session?.questions ?? [],
        prizeLadder: action.session?.prizeLadder ?? { values: [], guaranteed: [] },
        shuffledAnswers: action.session?.shuffledAnswers ?? [0, 1, 2, 3],
        currentQuestionIndex: 0,
        selectedAnswerDisplayIndex: null,
        eliminatedAnswerDisplayIndices: [],
        lifelineAvailability: action.lifelineAvailability,
        lifelineResult: null,
        doubleDipArmed: false,
        doubleDipStrikeUsed: false,
        wonPrize: '0',
      };
    }

    case 'NEW_GAME': {
      return createInitialGameDomainState();
    }

    case 'FORCE_WIN': {
      return {
        ...state,
        phase: 'won',
        selectedAnswerDisplayIndex: null,
        eliminatedAnswerDisplayIndices: [],
        lifelineResult: null,
        wonPrize: action.prize,
      };
    }

    case 'ANSWER_SELECTED': {
      if (state.phase !== 'playing') return state;
      if (state.selectedAnswerDisplayIndex !== null) return state;
      if (state.eliminatedAnswerDisplayIndices.includes(action.displayIndex)) return state;

      return {
        ...state,
        selectedAnswerDisplayIndex: action.displayIndex,
        lifelineResult: null,
      };
    }

    case 'ANSWER_RESOLVED': {
      if (state.phase !== 'playing') return state;
      if (state.selectedAnswerDisplayIndex === null) return state;

      if (action.outcome === 'retry') {
        if (!state.doubleDipArmed) return state;
        if (state.doubleDipStrikeUsed) return state;

        const eliminated = state.eliminatedAnswerDisplayIndices.includes(
          state.selectedAnswerDisplayIndex
        )
          ? state.eliminatedAnswerDisplayIndices
          : [...state.eliminatedAnswerDisplayIndices, state.selectedAnswerDisplayIndex];

        return {
          ...state,
          selectedAnswerDisplayIndex: null,
          eliminatedAnswerDisplayIndices: eliminated,
          doubleDipStrikeUsed: true,
          lifelineResult: { type: 'double', stage: 'strike' },
        };
      }

      if (action.outcome === 'correct') {
        return {
          ...state,
          currentQuestionIndex: action.nextQuestionIndex ?? state.currentQuestionIndex,
          selectedAnswerDisplayIndex: null,
          eliminatedAnswerDisplayIndices: [],
          shuffledAnswers: action.nextShuffledAnswers ?? state.shuffledAnswers,
          doubleDipArmed: false,
          doubleDipStrikeUsed: false,
        };
      }

      return {
        ...state,
        phase: action.outcome === 'won' ? 'won' : 'lost',
        wonPrize: action.wonPrize,
        doubleDipArmed: false,
        doubleDipStrikeUsed: false,
      };
    }

    case 'TAKE_MONEY': {
      if (state.phase !== 'playing') return state;
      if (state.currentQuestionIndex === 0) return state;

      return {
        ...state,
        phase: 'took_money',
        wonPrize: state.prizeLadder.values[state.currentQuestionIndex - 1] ?? '0',
        doubleDipArmed: false,
        doubleDipStrikeUsed: false,
      };
    }

    case 'CLEAR_LIFELINE_RESULT': {
      return { ...state, lifelineResult: null };
    }

    case 'APPLY_LIFELINE_FIFTY': {
      if (!state.lifelineAvailability.fifty) return state;
      if (state.phase !== 'playing') return state;
      if (state.selectedAnswerDisplayIndex !== null) return state;

      return {
        ...state,
        lifelineAvailability: { ...state.lifelineAvailability, fifty: false },
        eliminatedAnswerDisplayIndices: action.eliminated,
      };
    }

    case 'APPLY_LIFELINE_PHONE': {
      if (!state.lifelineAvailability.phone) return state;
      if (state.phase !== 'playing') return state;
      if (state.selectedAnswerDisplayIndex !== null) return state;

      return {
        ...state,
        lifelineAvailability: { ...state.lifelineAvailability, phone: false },
        lifelineResult: action.result,
      };
    }

    case 'APPLY_LIFELINE_AUDIENCE': {
      if (!state.lifelineAvailability.audience) return state;
      if (state.phase !== 'playing') return state;
      if (state.selectedAnswerDisplayIndex !== null) return state;

      return {
        ...state,
        lifelineAvailability: { ...state.lifelineAvailability, audience: false },
        lifelineResult: action.result,
      };
    }

    case 'APPLY_LIFELINE_HOST': {
      if (!state.lifelineAvailability.host) return state;
      if (state.phase !== 'playing') return state;
      if (state.selectedAnswerDisplayIndex !== null) return state;

      return {
        ...state,
        lifelineAvailability: { ...state.lifelineAvailability, host: false },
        lifelineResult: action.result,
      };
    }

    case 'APPLY_LIFELINE_SWITCH': {
      if (!state.lifelineAvailability.switch) return state;
      if (state.phase !== 'playing') return state;
      if (state.selectedAnswerDisplayIndex !== null) return state;
      if (action.swapWithIndex === state.currentQuestionIndex) return state;
      if (action.swapWithIndex < 0 || action.swapWithIndex >= state.questions.length) {
        return state;
      }

      const questions = [...state.questions];
      const tmp = questions[state.currentQuestionIndex];
      questions[state.currentQuestionIndex] = questions[action.swapWithIndex]!;
      questions[action.swapWithIndex] = tmp!;

      return {
        ...state,
        questions,
        shuffledAnswers: action.nextShuffledAnswers,
        eliminatedAnswerDisplayIndices: [],
        lifelineAvailability: { ...state.lifelineAvailability, switch: false },
        lifelineResult: action.result,
        doubleDipArmed: false,
        doubleDipStrikeUsed: false,
      };
    }

    case 'APPLY_LIFELINE_DOUBLE': {
      if (!state.lifelineAvailability.double) return state;
      if (state.phase !== 'playing') return state;
      if (state.selectedAnswerDisplayIndex !== null) return state;

      return {
        ...state,
        lifelineAvailability: { ...state.lifelineAvailability, double: false },
        lifelineResult: action.result,
        doubleDipArmed: true,
        doubleDipStrikeUsed: false,
      };
    }

    default:
      return state;
  }
};
