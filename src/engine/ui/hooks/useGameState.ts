import { useCallback, useEffect, useMemo, useReducer } from 'react';
import type { Campaign, Companion, GameConfig, GameState, Hint, LifelineResult, PrizeLadder, Question } from '../../types';
import { logger } from '../../services';
import {
  createGameSession,
  createInitialGameDomainState,
  gameReducer,
  generateAudiencePercentages,
  getFiftyFiftyEliminations,
  getPhoneSuggestion,
  resolveAnswer,
  selectCurrentDifficulty,
  selectCurrentPrize,
  selectCurrentQuestionData,
  selectTotalQuestions,
} from '../../game';
import { shuffleArray } from '../../game/utils/shuffleArray';
import { ANSWER_REVEAL_DURATION_MS } from '../../constants';

export interface GameStateData {
  /** Current game state */
  gameState: GameState;

  /** Currently selected campaign (null if not selected) */
  selectedCampaign: Campaign | null;

  /** Current question index (0-based) */
  currentQuestion: number;

  /** Total number of questions in current game */
  totalQuestions: number;

  /** Selected answer display index (null if not selected) */
  selectedAnswer: number | null;

  /** Current questions for selected mode */
  questions: Question[];

  /** Current prize ladder (calculated based on question count) */
  prizeLadder: PrizeLadder;

  /** Shuffled answer indices for current question */
  shuffledAnswers: number[];

  /** Answers eliminated by 50:50 */
  eliminatedAnswers: number[];

  /** Current hint being displayed (legacy name) */
  hint: Hint;

  /** Current lifeline result overlay (preferred name) */
  lifelineResult: LifelineResult;

  /** Lifeline availability (legacy keys) */
  lifelines: {
    fiftyFifty: boolean;
    phoneAFriend: boolean;
    askAudience: boolean;
  };

  /** Lifeline availability (preferred ids) */
  lifelineAvailability: {
    fifty: boolean;
    phone: boolean;
    audience: boolean;
    host: boolean;
    switch: boolean;
    double: boolean;
  };

  /** Prize won (as string) */
  wonPrize: string;

  /** Current question data (convenience getter) */
  currentQuestionData: Question | null;

  /** Current prize value (for current question) */
  currentPrize: string;

  /** Current question difficulty (1-3) */
  currentDifficulty: number;

  /** Theme for current campaign */
  currentTheme: GameConfig['campaigns'][0]['theme'] | null;
}

export interface GameStateActions {
  /** Select a campaign */
  selectCampaign: (campaign: Campaign) => void;

  /** Start the game */
  startGame: () => void;

  /** Instantly mark the game as won (dev/debug helper) */
  forceWin: (prizeOverride?: string) => void;

  /** Return to start screen */
  newGame: () => void;

  /** Handle answer click */
  handleAnswer: (
    displayIndex: number
  ) => Promise<'correct' | 'wrong' | 'won' | 'retry' | 'ignored'>;

  /** Take current winnings and leave (legacy name) */
  takeTheMoney: () => void;

  /** Take current winnings and leave (preferred name) */
  takeMoney: () => void;

  /** Use 50:50 lifeline (legacy name) */
  useFiftyFifty: () => void;

  /** Use 50:50 lifeline (preferred name) */
  useLifelineFifty: () => void;

  /** Use Phone a Friend lifeline - returns companion for voice playback (legacy name) */
  usePhoneAFriend: () => Companion | null;

  /** Use Phone-a-Friend lifeline (preferred name) */
  useLifelinePhone: () => Companion | null;

  /** Use Ask the Audience lifeline (legacy name) */
  useAskAudience: () => void;

  /** Use Ask-the-Audience lifeline (preferred name) */
  useLifelineAudience: () => void;

  /** Use Ask-the-Host lifeline (preferred name) */
  useLifelineHost: () => void;

  /** Use Switch-the-Question lifeline (preferred name) */
  useLifelineSwitch: () => void;

  /** Use Double Dip lifeline (preferred name) */
  useLifelineDouble: () => void;

  /** Clear current hint (legacy name) */
  clearHint: () => void;

  /** Clear current lifeline result overlay (preferred name) */
  clearLifelineResult: () => void;
}

export interface UseGameStateReturn extends GameStateData, GameStateActions {}

export const useGameState = (config: GameConfig): UseGameStateReturn => {
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    () => createInitialGameDomainState()
  );

  const campaignsById = useMemo(() => {
    const map = new Map<string, Campaign>();
    for (const campaign of config.campaigns) map.set(campaign.id, campaign);
    return map;
  }, [config.campaigns]);

  const selectedCampaign = useMemo(() => {
    if (!state.selectedCampaignId) return null;
    return campaignsById.get(state.selectedCampaignId) ?? null;
  }, [campaignsById, state.selectedCampaignId]);

  const totalQuestions = useMemo(() => selectTotalQuestions(state), [state]);
  const currentQuestionData = useMemo(
    () => selectCurrentQuestionData(state),
    [state]
  );
  const currentPrize = useMemo(() => selectCurrentPrize(state), [state]);
  const currentDifficulty = useMemo(
    () => selectCurrentDifficulty(state),
    [state]
  );

  const currentTheme = useMemo(
    () => selectedCampaign?.theme ?? null,
    [selectedCampaign]
  );

  const lifelineAvailability = useMemo(
    () => state.lifelineAvailability,
    [state.lifelineAvailability]
  );

  const lifelines = useMemo(
    () => ({
      fiftyFifty: lifelineAvailability.fifty,
      phoneAFriend: lifelineAvailability.phone,
      askAudience: lifelineAvailability.audience,
    }),
    [lifelineAvailability]
  );

  const selectCampaign = useCallback(
    (campaign: Campaign) => {
      const session = createGameSession(config, campaign.id);
      if (!session) {
        logger.gameState.warn(`No question pool found for campaign: ${campaign.id}`);
      }

      dispatch({ type: 'SELECT_CAMPAIGN', campaignId: campaign.id, session });
    },
    [config]
  );

  useEffect(() => {
    if (config.campaigns.length !== 1) return;
    if (state.phase !== 'start') return;
    if (state.selectedCampaignId) return;
    selectCampaign(config.campaigns[0]);
  }, [config.campaigns, selectCampaign, state.phase, state.selectedCampaignId]);

  const startGame = useCallback(() => {
    if (!state.selectedCampaignId) return;

    const session = createGameSession(config, state.selectedCampaignId);
    if (!session) {
      logger.gameState.warn(
        `No question pool found for campaign: ${state.selectedCampaignId}`
      );
    }

    dispatch({
      type: 'START_GAME',
      campaignId: state.selectedCampaignId,
      session,
      lifelineAvailability: {
        fifty: (config.lifelines.fifty?.enabled ?? config.lifelines.fiftyFifty.enabled) ?? true,
        phone: (config.lifelines.phone?.enabled ?? config.lifelines.phoneAFriend.enabled) ?? true,
        audience: (config.lifelines.audience?.enabled ?? config.lifelines.askAudience.enabled) ?? true,
        host: config.lifelines.host?.enabled ?? false,
        switch: config.lifelines.switch?.enabled ?? false,
        double: config.lifelines.double?.enabled ?? false,
      },
    });
  }, [config, state.selectedCampaignId]);

  const forceWin = useCallback(
    (prizeOverride?: string) => {
      const finalPrize =
        prizeOverride ??
        state.prizeLadder.values[state.prizeLadder.values.length - 1] ??
        state.prizeLadder.values[state.currentQuestionIndex] ??
        '0';

      dispatch({ type: 'FORCE_WIN', prize: finalPrize });
    },
    [state.currentQuestionIndex, state.prizeLadder.values]
  );

  const newGame = useCallback(() => {
    dispatch({ type: 'NEW_GAME' });
  }, []);

  const handleAnswer = useCallback(
    async (
      displayIndex: number
    ): Promise<'correct' | 'wrong' | 'won' | 'retry' | 'ignored'> => {
      if (state.selectedAnswerDisplayIndex !== null) return 'ignored';
      if (state.eliminatedAnswerDisplayIndices.includes(displayIndex)) return 'ignored';

      dispatch({ type: 'ANSWER_SELECTED', displayIndex });

      return new Promise((resolve) => {
        setTimeout(() => {
          const { outcome, wonPrize } = resolveAnswer(state, displayIndex);

          if (outcome === 'correct') {
            dispatch({
              type: 'ANSWER_RESOLVED',
              outcome,
              wonPrize,
              nextQuestionIndex: state.currentQuestionIndex + 1,
              nextShuffledAnswers: shuffleArray([0, 1, 2, 3]),
            });
          } else {
            dispatch({ type: 'ANSWER_RESOLVED', outcome, wonPrize });
          }

          resolve(outcome);
        }, ANSWER_REVEAL_DURATION_MS);
      });
    },
    [state]
  );

  const takeTheMoney = useCallback(() => {
    dispatch({ type: 'TAKE_MONEY' });
  }, []);

  const useFiftyFifty = useCallback(() => {
    if (!state.lifelineAvailability.fifty) return;
    if (state.selectedAnswerDisplayIndex !== null) return;
    const question = selectCurrentQuestionData(state);
    if (!question) return;

    dispatch({
      type: 'APPLY_LIFELINE_FIFTY',
      eliminated: getFiftyFiftyEliminations({
        correctOriginalIndex: question.correct,
        shuffledAnswers: state.shuffledAnswers,
      }),
    });
  }, [state]);

  const usePhoneAFriend = useCallback((): Companion | null => {
    if (!state.lifelineAvailability.phone) return null;
    if (state.selectedAnswerDisplayIndex !== null) return null;
    const question = selectCurrentQuestionData(state);
    if (!question) return null;
    if (config.companions.length === 0) return null;

    const suggestion = getPhoneSuggestion({
      correctOriginalIndex: question.correct,
    });

    const companion =
      config.companions[Math.floor(Math.random() * config.companions.length)];
    const answerText = question.answers[suggestion.suggestedOriginalIndex];

    const phrases = suggestion.isConfident
      ? config.strings.companionPhrases.confident
      : config.strings.companionPhrases.uncertain;
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];

    dispatch({
      type: 'APPLY_LIFELINE_PHONE',
      result: {
        type: 'phone',
        name: companion.name,
        text: phrase.replace('{answer}', answerText),
      },
    });

    return companion;
  }, [config, state]);

  const useAskAudience = useCallback(() => {
    if (!state.lifelineAvailability.audience) return;
    if (state.selectedAnswerDisplayIndex !== null) return;
    const question = selectCurrentQuestionData(state);
    if (!question) return;

    const correctDisplayIndex = state.shuffledAnswers.indexOf(question.correct);
    const percentages = generateAudiencePercentages({
      correctDisplayIndex,
      eliminatedDisplayIndices: state.eliminatedAnswerDisplayIndices,
    });

    dispatch({
      type: 'APPLY_LIFELINE_AUDIENCE',
      result: { type: 'audience', percentages },
    });
  }, [state]);

  const useLifelineHost = useCallback(() => {
    if (!state.lifelineAvailability.host) return;
    if (state.selectedAnswerDisplayIndex !== null) return;
    const question = selectCurrentQuestionData(state);
    if (!question) return;

    const rng = Math.random;
    const correctDisplayIndex = state.shuffledAnswers.indexOf(question.correct);
    const isConfident = rng() > 0.22;

    const available = [0, 1, 2, 3].filter(
      (i) => !state.eliminatedAnswerDisplayIndices.includes(i)
    );
    const wrongChoices = available.filter((i) => i !== correctDisplayIndex);
    const suggestedDisplayIndex =
      isConfident || wrongChoices.length === 0
        ? correctDisplayIndex
        : wrongChoices[Math.floor(rng() * wrongChoices.length)]!;

    const originalIndex = state.shuffledAnswers[suggestedDisplayIndex] ?? question.correct;
    const answerText = question.answers[originalIndex] ?? '';

    dispatch({
      type: 'APPLY_LIFELINE_HOST',
      result: {
        type: 'host',
        suggestedDisplayIndex,
        answerText,
        confidence: isConfident ? 'confident' : 'uncertain',
      },
    });
  }, [state]);

  const useLifelineSwitch = useCallback(() => {
    if (!state.lifelineAvailability.switch) return;
    if (state.selectedAnswerDisplayIndex !== null) return;
    if (state.questions.length < 2) return;
    if (state.currentQuestionIndex >= state.questions.length - 1) return;

    const rng = Math.random;
    const remainingIndices = [];
    for (let i = state.currentQuestionIndex + 1; i < state.questions.length; i += 1) {
      remainingIndices.push(i);
    }
    if (remainingIndices.length === 0) return;

    const swapWithIndex =
      remainingIndices[Math.floor(rng() * remainingIndices.length)]!;

    dispatch({
      type: 'APPLY_LIFELINE_SWITCH',
      swapWithIndex,
      nextShuffledAnswers: shuffleArray([0, 1, 2, 3], rng),
      result: { type: 'switch' },
    });
  }, [state]);

  const useLifelineDouble = useCallback(() => {
    if (!state.lifelineAvailability.double) return;
    if (state.selectedAnswerDisplayIndex !== null) return;

    dispatch({ type: 'APPLY_LIFELINE_DOUBLE', result: { type: 'double', stage: 'armed' } });
  }, [state]);

  const clearHint = useCallback(() => {
    dispatch({ type: 'CLEAR_LIFELINE_RESULT' });
  }, []);

  const takeMoney = takeTheMoney;
  const clearLifelineResult = clearHint;
  const useLifelineFifty = useFiftyFifty;
  const useLifelinePhone = usePhoneAFriend;
  const useLifelineAudience = useAskAudience;

  return {
    gameState: state.phase,
    selectedCampaign,
    currentQuestion: state.currentQuestionIndex,
    totalQuestions,
    selectedAnswer: state.selectedAnswerDisplayIndex,
    questions: state.questions,
    prizeLadder: state.prizeLadder,
    shuffledAnswers: state.shuffledAnswers,
    eliminatedAnswers: state.eliminatedAnswerDisplayIndices,
    hint: state.lifelineResult,
    lifelineResult: state.lifelineResult,
    lifelines,
    lifelineAvailability,
    wonPrize: state.wonPrize,
    currentQuestionData,
    currentPrize,
    currentDifficulty,
    currentTheme,

    selectCampaign,
    startGame,
    forceWin,
    newGame,
    handleAnswer,
    takeTheMoney,
    takeMoney,
    useFiftyFifty,
    useLifelineFifty,
    usePhoneAFriend,
    useLifelinePhone,
    useAskAudience,
    useLifelineAudience,
    useLifelineHost,
    useLifelineSwitch,
    useLifelineDouble,
    clearHint,
    clearLifelineResult,
  };
};
