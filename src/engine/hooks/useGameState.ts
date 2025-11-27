/**
 * useGameState Hook
 * 
 * Manages all game state and logic for the quiz game.
 * Independent of UI - can be used with any rendering layer.
 */

import { useState, useCallback, useMemo } from 'react';
import {
  GameConfig,
  GameState,
  Question,
  Hint,
  GameMode,
} from '../types';

// ============================================
// Types
// ============================================

export interface GameStateData {
  /** Current game state */
  gameState: GameState;

  /** Currently selected mode (null if not selected) */
  selectedMode: GameMode | null;

  /** Current question index (0-14) */
  currentQuestion: number;

  /** Selected answer display index (null if not selected) */
  selectedAnswer: number | null;

  /** Current questions for selected mode */
  questions: Question[];

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

  /** Current prize value */
  currentPrize: string;

  /** Theme for current mode */
  currentTheme: GameConfig['modes'][0]['theme'] | null;
}

export interface GameStateActions {
  /** Select a game mode */
  selectMode: (mode: GameMode) => void;

  /** Start the game */
  startGame: () => void;

  /** Return to start screen */
  newGame: () => void;

  /** Handle answer click */
  handleAnswer: (displayIndex: number) => Promise<'correct' | 'wrong' | 'ignored'>;

  /** Take current winnings and leave */
  takeTheMoney: () => void;

  /** Use 50:50 lifeline */
  useFiftyFifty: () => void;

  /** Use Phone a Friend lifeline */
  usePhoneAFriend: () => void;

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

/** Shuffle questions within difficulty groups */
const shuffleQuestionsByDifficulty = (questions: Question[]): Question[] => {
  const grouped: Record<number, Question[]> = {};

  questions.forEach((q) => {
    if (!grouped[q.difficulty]) grouped[q.difficulty] = [];
    grouped[q.difficulty].push(q);
  });

  const sortedDifficulties = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b);

  return sortedDifficulties.flatMap((difficulty) =>
    shuffleArray(grouped[difficulty])
  );
};

// ============================================
// Hook
// ============================================

export const useGameState = (config: GameConfig): UseGameStateReturn => {
  // Core state
  const [gameState, setGameState] = useState<GameState>('start');
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [shuffledAnswers, setShuffledAnswers] = useState<number[]>([0, 1, 2, 3]);
  const [eliminatedAnswers, setEliminatedAnswers] = useState<number[]>([]);
  const [hint, setHint] = useState<Hint>(null);
  const [wonPrize, setWonPrize] = useState('0');

  // Lifelines
  const [fiftyFifty, setFiftyFifty] = useState(true);
  const [phoneAFriend, setPhoneAFriend] = useState(true);
  const [askAudience, setAskAudience] = useState(true);

  // Derived state
  const currentQuestionData = useMemo(
    () => (questions.length > 0 ? questions[currentQuestion] : null),
    [questions, currentQuestion]
  );

  const currentPrize = useMemo(
    () => config.prizes.values[currentQuestion] || '0',
    [config.prizes.values, currentQuestion]
  );

  const currentTheme = useMemo(
    () => selectedMode?.theme || null,
    [selectedMode]
  );

  const lifelines = useMemo(
    () => ({ fiftyFifty, phoneAFriend, askAudience }),
    [fiftyFifty, phoneAFriend, askAudience]
  );

  // Shuffle answers for current question
  const shuffleCurrentAnswers = useCallback(() => {
    setShuffledAnswers(shuffleArray([0, 1, 2, 3]));
  }, []);

  // Initialize questions for a mode
  const initializeQuestions = useCallback(
    (mode: GameMode) => {
      const modeQuestions = config.questions[mode.id] || [];
      const shuffled = shuffleQuestionsByDifficulty(modeQuestions);
      setQuestions(shuffled);
      shuffleCurrentAnswers();
    },
    [config.questions, shuffleCurrentAnswers]
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

  const selectMode = useCallback(
    (mode: GameMode) => {
      setSelectedMode(mode);
      initializeQuestions(mode);
    },
    [initializeQuestions]
  );

  const startGame = useCallback(() => {
    if (!selectedMode) return;

    resetState();
    initializeQuestions(selectedMode);
    setGameState('playing');
  }, [selectedMode, resetState, initializeQuestions]);

  const newGame = useCallback(() => {
    setGameState('start');
    setSelectedMode(null);
    resetState();
    setQuestions([]);
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
            if (currentQuestion === config.prizes.values.length - 1) {
              // Won the game!
              setWonPrize(config.prizes.values[currentQuestion]);
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
            // Wrong answer
            const lastGuaranteed = config.prizes.guaranteed
              .filter((p) => p < currentQuestion)
              .pop();
            setWonPrize(
              lastGuaranteed !== undefined
                ? config.prizes.values[lastGuaranteed]
                : '0'
            );
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
      config.prizes,
      shuffleCurrentAnswers,
    ]
  );

  const takeTheMoney = useCallback(() => {
    if (currentQuestion === 0) return;
    setWonPrize(config.prizes.values[currentQuestion - 1]);
    setGameState('took_money');
  }, [currentQuestion, config.prizes.values]);

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

  const usePhoneAFriend = useCallback(() => {
    if (!phoneAFriend || selectedAnswer !== null || !currentQuestionData) return;
    if (config.companions.length === 0) return;

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
    selectedMode,
    currentQuestion,
    selectedAnswer,
    questions,
    shuffledAnswers,
    eliminatedAnswers,
    hint,
    lifelines,
    wonPrize,
    currentQuestionData,
    currentPrize,
    currentTheme,

    // Actions
    selectMode,
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
