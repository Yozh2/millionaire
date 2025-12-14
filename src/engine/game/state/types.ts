import type { GameState, LifelineResult, PrizeLadder, Question } from '../../types';

export interface LifelineAvailabilityState {
  fifty: boolean;
  phone: boolean;
  audience: boolean;
  host: boolean;
  switch: boolean;
  double: boolean;
}

export interface GameDomainState {
  phase: GameState;
  selectedCampaignId: string | null;

  questions: Question[];
  prizeLadder: PrizeLadder;

  currentQuestionIndex: number;
  selectedAnswerDisplayIndex: number | null;
  shuffledAnswers: number[];
  eliminatedAnswerDisplayIndices: number[];

  lifelineAvailability: LifelineAvailabilityState;
  lifelineResult: LifelineResult;

  doubleDipArmed: boolean;
  doubleDipStrikeUsed: boolean;

  wonPrize: string;
}

export const createInitialGameDomainState = (): GameDomainState => ({
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
});
