/**
 * useGameState Hook
 *
 * Manages all game state and logic for the quiz game.
 * Independent of UI - can be used with any rendering layer.
 *
 * Supports dynamic question selection from pools and
 * automatic prize ladder calculation.
 */

import { useState, useCallback, useMemo } from 'react';
import {
  GameConfig,
  GameState,
  Question,
  Hint,
  Campaign,
  Companion,
  PrizeLadder,
} from '../types';
import {
  selectQuestionsFromPool,
  calculatePrizeLadder,
  getGuaranteedPrize,
  getQuestionDifficulty,
} from '../utils/questionGenerator';

// ============================================
// Types
// ============================================

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

  /** Current hint being displayed */
  hint: Hint;

  /** Lifeline availability */
  lifelines: {
    fiftyFifty: boolean;
    phoneAFriend: boolean;
    askAudience: boolean;
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

  /** Return to start screen */
  newGame: () => void;

  /** Handle answer click */
  handleAnswer: (
    displayIndex: number
  ) => Promise<'correct' | 'wrong' | 'ignored'>;

  /** Take current winnings and leave */
  takeTheMoney: () => void;

  /** Use 50:50 lifeline */
  useFiftyFifty: () => void;

  /** Use Phone a Friend lifeline - returns companion for voice playback */
  usePhoneAFriend: () => Companion | null;

  /** Use Ask the Audience lifeline */
  useAskAudience: () => void;

  /** Clear current hint */
  clearHint: () => void;
}

export interface UseGameStateReturn extends GameStateData, GameStateActions {}

// ============================================
// Utilities
// ============================================

/** Fisher-Yates shuffle */
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ============================================
// Hook
// ============================================

export const useGameState = (config: GameConfig): UseGameStateReturn => {
  // Core state
  const [gameState, setGameState] = useState<GameState>('start');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [prizeLadder, setPrizeLadder] = useState<PrizeLadder>({
    values: [],
    guaranteed: [],
  });
  const [shuffledAnswers, setShuffledAnswers] = useState<number[]>([
    0, 1, 2, 3,
  ]);
  const [eliminatedAnswers, setEliminatedAnswers] = useState<number[]>([]);
  const [hint, setHint] = useState<Hint>(null);
  const [wonPrize, setWonPrize] = useState('0');

  // Lifelines
  const [fiftyFifty, setFiftyFifty] = useState(true);
  const [phoneAFriend, setPhoneAFriend] = useState(true);
  const [askAudience, setAskAudience] = useState(true);

  // Derived state
  const totalQuestions = questions.length;

  const currentQuestionData = useMemo(
    () => (questions.length > 0 ? questions[currentQuestion] : null),
    [questions, currentQuestion]
  );

  const currentPrize = useMemo(
    () => prizeLadder.values[currentQuestion] || '0',
    [prizeLadder.values, currentQuestion]
  );

  const currentDifficulty = useMemo(
    () => getQuestionDifficulty(currentQuestion, totalQuestions),
    [currentQuestion, totalQuestions]
  );

  const currentTheme = useMemo(
    () => selectedCampaign?.theme || null,
    [selectedCampaign]
  );

  const lifelines = useMemo(
    () => ({ fiftyFifty, phoneAFriend, askAudience }),
    [fiftyFifty, phoneAFriend, askAudience]
  );

  // Shuffle answers for current question
  const shuffleCurrentAnswers = useCallback(() => {
    setShuffledAnswers(shuffleArray([0, 1, 2, 3]));
  }, []);

  // Initialize questions and prize ladder for a campaign
  const initializeGame = useCallback(
    (campaign: Campaign) => {
      const pool = config.questionPools[campaign.id];
      if (!pool) {
        console.warn(`No question pool found for campaign: ${campaign.id}`);
        setQuestions([]);
        setPrizeLadder({ values: [], guaranteed: [] });
        return;
      }

      // Select random questions from pool
      const selectedQuestions = selectQuestionsFromPool(pool);
      setQuestions(selectedQuestions);

      // Calculate prize ladder based on question count
      const ladder = calculatePrizeLadder(
        selectedQuestions.length,
        config.prizes
      );
      setPrizeLadder(ladder);

      shuffleCurrentAnswers();
    },
    [config.questionPools, config.prizes, shuffleCurrentAnswers]
  );

  // Reset all state
  const resetState = useCallback(() => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setEliminatedAnswers([]);
    setHint(null);
    setWonPrize('0');
    setFiftyFifty(true);
    setPhoneAFriend(true);
    setAskAudience(true);
  }, []);

  // ============================================
  // Actions
  // ============================================

  const selectCampaign = useCallback(
    (campaign: Campaign) => {
      setSelectedCampaign(campaign);
      initializeGame(campaign);
    },
    [initializeGame]
  );

  const startGame = useCallback(() => {
    if (!selectedCampaign) return;

    resetState();
    initializeGame(selectedCampaign);
    setGameState('playing');
  }, [selectedCampaign, resetState, initializeGame]);

  const newGame = useCallback(() => {
    setGameState('start');
    setSelectedCampaign(null);
    resetState();
    setQuestions([]);
    setPrizeLadder({ values: [], guaranteed: [] });
  }, [resetState]);

  const handleAnswer = useCallback(
    async (displayIndex: number): Promise<'correct' | 'wrong' | 'ignored'> => {
      // Ignore if already answered or eliminated
      if (selectedAnswer !== null || eliminatedAnswers.includes(displayIndex)) {
        return 'ignored';
      }

      const originalIndex = shuffledAnswers[displayIndex];
      setSelectedAnswer(displayIndex);
      setHint(null);

      // Return result for sound handling (actual state change happens after delay)
      return new Promise((resolve) => {
        setTimeout(() => {
          const correct = questions[currentQuestion].correct;

          if (originalIndex === correct) {
            // Correct answer
            if (currentQuestion === totalQuestions - 1) {
              // Won the game!
              setWonPrize(prizeLadder.values[currentQuestion]);
              setGameState('won');
            } else {
              // Move to next question
              setCurrentQuestion((prev) => prev + 1);
              setSelectedAnswer(null);
              setEliminatedAnswers([]);
              shuffleCurrentAnswers();
            }
            resolve('correct');
          } else {
            // Wrong answer - get guaranteed prize
            const guaranteedPrize = getGuaranteedPrize(
              currentQuestion,
              prizeLadder
            );
            setWonPrize(guaranteedPrize);
            setGameState('lost');
            resolve('wrong');
          }
        }, 2000);
      });
    },
    [
      selectedAnswer,
      eliminatedAnswers,
      shuffledAnswers,
      questions,
      currentQuestion,
      totalQuestions,
      prizeLadder,
      shuffleCurrentAnswers,
    ]
  );

  const takeTheMoney = useCallback(() => {
    if (currentQuestion === 0) return;
    setWonPrize(prizeLadder.values[currentQuestion - 1]);
    setGameState('took_money');
  }, [currentQuestion, prizeLadder.values]);

  const useFiftyFifty = useCallback(() => {
    if (!fiftyFifty || selectedAnswer !== null || !currentQuestionData) return;

    setFiftyFifty(false);
    const correct = currentQuestionData.correct;

    // Find display indices of wrong answers
    const wrongDisplayIndices = shuffledAnswers
      .map((originalIdx, displayIdx) => ({ originalIdx, displayIdx }))
      .filter(({ originalIdx }) => originalIdx !== correct)
      .map(({ displayIdx }) => displayIdx);

    // Randomly pick 2 wrong answers to eliminate
    const toEliminate = shuffleArray(wrongDisplayIndices).slice(0, 2);
    setEliminatedAnswers(toEliminate);
  }, [fiftyFifty, selectedAnswer, currentQuestionData, shuffledAnswers]);

  const usePhoneAFriend = useCallback((): Companion | null => {
    if (!phoneAFriend || selectedAnswer !== null || !currentQuestionData) return null;
    if (config.companions.length === 0) return null;

    setPhoneAFriend(false);
    const correct = currentQuestionData.correct;

    // 80% chance of correct advice
    const isConfident = Math.random() > 0.2;
    const suggestedAnswer = isConfident
      ? correct
      : [0, 1, 2, 3].filter((i) => i !== correct)[Math.floor(Math.random() * 3)];

    const companion =
      config.companions[Math.floor(Math.random() * config.companions.length)];
    const answerText = currentQuestionData.answers[suggestedAnswer];

    // Pick a phrase
    const phrases = isConfident
      ? config.strings.companionPhrases.confident
      : config.strings.companionPhrases.uncertain;
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];

    setHint({
      type: 'phone',
      name: companion.name,
      text: phrase.replace('{answer}', answerText),
    });

    return companion;
  }, [phoneAFriend, selectedAnswer, currentQuestionData, config]);

  const useAskAudience = useCallback(() => {
    if (!askAudience || selectedAnswer !== null || !currentQuestionData) return;

    setAskAudience(false);
    const correct = currentQuestionData.correct;

    // Find display index of correct answer
    const correctDisplayIndex = shuffledAnswers.indexOf(correct);

    // Generate realistic-looking percentages
    const percentages = [0, 0, 0, 0];
    percentages[correctDisplayIndex] = 40 + Math.floor(Math.random() * 35);

    let remaining = 100 - percentages[correctDisplayIndex];
    const otherDisplayIndices = [0, 1, 2, 3].filter(
      (i) => i !== correctDisplayIndex && !eliminatedAnswers.includes(i)
    );

    otherDisplayIndices.forEach((i, idx, arr) => {
      if (idx === arr.length - 1) {
        percentages[i] = remaining;
      } else {
        const val = Math.floor(Math.random() * remaining * 0.6);
        percentages[i] = val;
        remaining -= val;
      }
    });

    setHint({ type: 'audience', percentages });
  }, [askAudience, selectedAnswer, currentQuestionData, shuffledAnswers, eliminatedAnswers]);

  const clearHint = useCallback(() => {
    setHint(null);
  }, []);

  // ============================================
  // Return
  // ============================================

  return {
    // State
    gameState,
    selectedCampaign,
    currentQuestion,
    totalQuestions,
    selectedAnswer,
    questions,
    prizeLadder,
    shuffledAnswers,
    eliminatedAnswers,
    hint,
    lifelines,
    wonPrize,
    currentQuestionData,
    currentPrize,
    currentDifficulty,
    currentTheme,

    // Actions
    selectCampaign,
    startGame,
    newGame,
    handleAnswer,
    takeTheMoney,
    useFiftyFifty,
    usePhoneAFriend,
    useAskAudience,
    clearHint,
  };
};

export default useGameState;
