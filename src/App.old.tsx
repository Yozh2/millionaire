/**
 * BG3 Millionaire - Quiz Game
 *
 * A "Who Wants to Be a Millionaire" style quiz game themed around
 * Baldur's Gate 3 and Forgotten Realms lore.
 *
 * Features:
 * - 15 questions sorted by difficulty
 * - 3 lifelines (50:50, Phone a Friend, Ask the Audience)
 * - Fantasy-themed UI with BG3 aesthetics
 * - Background music toggle
 * - Guaranteed prize safety nets
 *
 * @author Yozh2
 * @see https://github.com/Yozh2/bg3-millionaire
 */

import { useState, useEffect, useRef } from 'react';
import {
  TrophyIcon,
  MoneyIcon,
  MindFlayerIcon,
  DarkUrgeIcon,
  SwordIcon,
  CoinIcon,
  ScrollIcon,
  TavernIcon,
  StarIcon,
  CriticalFailIcon,
} from './components/icons';
import { Panel, PanelHeader } from './components/ui';
import { ThemeProvider, getThemeColors } from './context';
import { getQuestionsForMode, prizes, guaranteedPrizes, companionNames } from './data';
import { Question, Hint, GameState, DifficultyMode } from './types';
import {
  playAnswerClick,
  playVictory,
  playDefeat,
  playFiftyFifty,
  playScrollUnfold,
  playTavernCheer,
  playCorrect,
  playModeSelect,
  playGameStart,
  playNewStart,
  playTakeMoney,
  setSoundEnabled,
  preloadAudio,
} from './utils';

/**
 * Main game component.
 * Manages game state, lifelines, and UI rendering.
 */
export default function BG3Millionaire() {
  // ============================================
  // State
  // ============================================

  /** Current question index (0-14) */
  const [currentQuestion, setCurrentQuestion] = useState(0);

  /** Selected answer index, null if not selected */
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  /** Current game state */
  const [gameState, setGameState] = useState<GameState>('start');

  /** Lifeline availability */
  const [fiftyFifty, setFiftyFifty] = useState(true);
  const [phoneAFriend, setPhoneAFriend] = useState(true);
  const [askAudience, setAskAudience] = useState(true);

  /** Answers eliminated by 50:50 lifeline */
  const [eliminatedAnswers, setEliminatedAnswers] = useState<number[]>([]);

  /** Shuffled answer indices for current question (maps display index to original index) */
  const [shuffledAnswers, setShuffledAnswers] = useState<number[]>([0, 1, 2, 3]);

  /** Current hint being displayed */
  const [showHint, setShowHint] = useState<Hint>(null);

  /** Questions sorted by difficulty */
  const [sortedQuestions, setSortedQuestions] = useState<Question[]>([]);

  /** Selected difficulty mode (null when not yet selected) */
  const [selectedMode, setSelectedMode] = useState<DifficultyMode | null>(null);

  /** Prize amount won */
  const [wonPrize, setWonPrize] = useState('0');

  /** Background music state */
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  /** Track if user ever enabled music (for auto-play on track switch) */
  const [musicEverEnabled, setMusicEverEnabled] = useState(false);
  const musicEverEnabledRef = useRef(false);

  /** Track if user manually disabled music (don't auto-play if true) */
  const [userDisabledMusic, setUserDisabledMusic] = useState(false);
  const userDisabledMusicRef = useRef(false);

  /** Current soundtrack based on game state and mode */
  const [currentTrack, setCurrentTrack] = useState<string>(
    `${import.meta.env.BASE_URL}music/MainMenu.ogg`
  );

  // ============================================
  // Effects
  // ============================================

  /** Preload sound effects and voice lines on mount */
  useEffect(() => {
    preloadAudio();
  }, []);

  /** Fisher-Yates shuffle algorithm */
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  /** Shuffle answers for current question */
  const shuffleCurrentAnswers = () => {
    setShuffledAnswers(shuffleArray([0, 1, 2, 3]));
  };

  /** Shuffle questions within difficulty groups and set them */
  const shuffleAndSetQuestions = (mode: DifficultyMode) => {
    const questions = getQuestionsForMode(mode);

    // Group questions by difficulty (1, 2, 3 = easy, medium, hard)
    const grouped: Record<number, Question[]> = {};
    questions.forEach((q: Question) => {
      if (!grouped[q.difficulty]) grouped[q.difficulty] = [];
      grouped[q.difficulty].push(q);
    });

    // Shuffle within each group and flatten, sorted by difficulty
    const sortedDifficulties = Object.keys(grouped).map(Number).sort((a, b) => a - b);
    const shuffledQuestions: Question[] = sortedDifficulties.flatMap(
      difficulty => shuffleArray(grouped[difficulty])
    );

    setSortedQuestions(shuffledQuestions);
    shuffleCurrentAnswers(); // Shuffle answers for first question
  };

  /** Initialize questions when mode is selected */
  useEffect(() => {
    if (selectedMode) {
      shuffleAndSetQuestions(selectedMode);
    }
  }, [selectedMode]);  /** Switch soundtrack based on game state and selected mode */
  useEffect(() => {
    const basePath = import.meta.env.BASE_URL;
    let newTrack: string;

    if (gameState === 'start') {
      // Main menu - always play MainMenu until game starts
      newTrack = `${basePath}music/MainMenu.ogg`;
    } else if (gameState === 'playing' && selectedMode) {
      // Game started - play character theme
      const trackMap: Record<DifficultyMode, string> = {
        hero: `${basePath}music/Hero.ogg`,
        illithid: `${basePath}music/Illithid.ogg`,
        darkUrge: `${basePath}music/DarkUrge.ogg`,
      };
      newTrack = trackMap[selectedMode];
    } else if (gameState === 'lost') {
      // Game lost - GameOver track will be started manually after CriticalFailure
      // Don't auto-switch here, the handleAnswer logic manages this
      return;
    } else if (selectedMode) {
      // Game over screens (won, took_money) - keep character theme
      const trackMap: Record<DifficultyMode, string> = {
        hero: `${basePath}music/Hero.ogg`,
        illithid: `${basePath}music/Illithid.ogg`,
        darkUrge: `${basePath}music/DarkUrge.ogg`,
      };
      newTrack = trackMap[selectedMode];
    } else {
      newTrack = `${basePath}music/MainMenu.ogg`;
    }

    if (newTrack !== currentTrack) {
      setCurrentTrack(newTrack);
      const audio = document.getElementById('bg-music') as HTMLAudioElement;
      if (audio) {
        audio.src = newTrack;
        // Set volume for all music tracks (20%)
        audio.volume = 0.01;
        audio.load();
        // Auto-play if music was ever enabled and not manually disabled
        if (musicEverEnabled && !userDisabledMusic) {
          audio.play()
            .then(() => setIsMusicPlaying(true))
            .catch((err) => console.log('Track switch failed:', err));
        }
      }
    }
  }, [gameState, selectedMode, currentTrack, musicEverEnabled, userDisabledMusic]);

  // ============================================
  // Color Theme based on selected mode
  // ============================================

  /** Get background gradient based on mode */
  const getBackgroundStyle = () => {
    if (!selectedMode || selectedMode === 'hero') {
      return 'radial-gradient(ellipse at center, #1a0f0a 0%, #0d0604 50%, #000 100%)';
    }
    if (selectedMode === 'illithid') {
      return 'radial-gradient(ellipse at center, #1a0a1f 0%, #0d0410 50%, #000 100%)';
    }
    // darkUrge
    return 'radial-gradient(ellipse at center, #1f0a0a 0%, #100404 50%, #000 100%)';
  };

  /** Theme colors from context */
  const theme = getThemeColors(selectedMode);

  // ============================================
  // Audio Controls
  // ============================================

  /** Volume level for background music (20% to let sounds/voices be heard clearly) */
  const MUSIC_VOLUME = 0.2;

  /** Helper to switch track and play if music is enabled */
  const switchTrack = (trackPath: string) => {
    const audio = document.getElementById('bg-music') as HTMLAudioElement | null;
    if (!audio) return;

    const currentFileName = audio.src.split('/').pop();
    const newFileName = trackPath.split('/').pop();
    const needsSwitch = currentFileName !== newFileName;

    const shouldPlay = musicEverEnabledRef.current && !userDisabledMusicRef.current;

    if (needsSwitch) {
      setCurrentTrack(trackPath);
      audio.src = trackPath;
      audio.volume = MUSIC_VOLUME;

      if (shouldPlay) {
        // Wait for track to be ready before playing
        const handleCanPlay = () => {
          audio.play()
            .then(() => setIsMusicPlaying(true))
            .catch((err) => console.log('Track play failed:', err));
          audio.removeEventListener('canplay', handleCanPlay);
        };
        audio.addEventListener('canplay', handleCanPlay);
        audio.load();
      } else {
        audio.load();
      }
    } else if (shouldPlay && audio.paused) {
      // Same track, just resume
      audio.play()
        .then(() => setIsMusicPlaying(true))
        .catch((err) => console.log('Track play failed:', err));
    }
  };

  /** Toggle background music on/off */
  const toggleMusic = () => {
    const audio = document.getElementById('bg-music') as HTMLAudioElement | null;
    if (!audio) return;

    if (isMusicPlaying) {
      audio.pause();
      setIsMusicPlaying(false);
      setUserDisabledMusic(true);
      userDisabledMusicRef.current = true;
      setSoundEnabled(false); // Sync UI sounds with music
    } else {
      // Set volume before playing
      audio.volume = MUSIC_VOLUME;
      audio
        .play()
        .then(() => {
          setIsMusicPlaying(true);
          setMusicEverEnabled(true);
          musicEverEnabledRef.current = true;
          setUserDisabledMusic(false);
          userDisabledMusicRef.current = false;
          setSoundEnabled(true); // Sync UI sounds with music
        })
        .catch((err: Error) => console.log('Music play failed:', err));
    }
  };

  // ============================================
  // Game Logic
  // ============================================

  /** Start a new game, reset all state */
  const startGame = () => {
    // Don't start if no mode selected
    if (!selectedMode) return;

    // Play game start sound effect
    playGameStart();

    // Switch to character theme
    const basePath = import.meta.env.BASE_URL;
    const trackMap: Record<DifficultyMode, string> = {
      hero: `${basePath}music/Hero.ogg`,
      illithid: `${basePath}music/Illithid.ogg`,
      darkUrge: `${basePath}music/DarkUrge.ogg`,
    };
    switchTrack(trackMap[selectedMode]);

    // Shuffle and set questions for this playthrough
    shuffleAndSetQuestions(selectedMode);

    // Reset game state
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setGameState('playing');
    setFiftyFifty(true);
    setPhoneAFriend(true);
    setAskAudience(true);
    setEliminatedAnswers([]);
    setShowHint(null);
    setWonPrize('0');
  };

  /** Return to start screen for new game with difficulty selection */
  const newGame = () => {
    // Play NewStart sound when returning from game over screen
    playNewStart();

    // Switch to main menu music
    const basePath = import.meta.env.BASE_URL;
    switchTrack(`${basePath}music/MainMenu.ogg`);

    setGameState('start');
    setSelectedMode(null);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setFiftyFifty(true);
    setPhoneAFriend(true);
    setAskAudience(true);
    setEliminatedAnswers([]);
    setShowHint(null);
    setWonPrize('0');
  };

  /** Handle answer selection */
  const handleAnswerClick = (displayIndex: number) => {
    if (selectedAnswer !== null || eliminatedAnswers.includes(displayIndex)) return;

    // Map display index to original answer index
    const originalIndex = shuffledAnswers[displayIndex];

    // Play answer click sound
    playAnswerClick();

    setSelectedAnswer(displayIndex);
    setShowHint(null);

    // Delay to show correct/incorrect animation
    setTimeout(() => {
      const correct = sortedQuestions[currentQuestion].correct;

      if (originalIndex === correct) {
        // Correct answer - play correct sound
        playCorrect();
        if (currentQuestion === 14) {
          // Won the game! Play victory fanfare
          setTimeout(() => playVictory(), 500);
          setWonPrize(prizes[14]);
          setGameState('won');
        } else {
          // Move to next question and shuffle answers
          setCurrentQuestion((prev) => prev + 1);
          setSelectedAnswer(null);
          setEliminatedAnswers([]);
          shuffleCurrentAnswers();
        }
      } else {
        // Wrong answer - play defeat sequence (CriticalFailure + GameOver)
        const lastGuaranteed = guaranteedPrizes
          .filter((p: number) => p < currentQuestion)
          .pop();
        setWonPrize(lastGuaranteed !== undefined ? prizes[lastGuaranteed] : '0');

        // Stop current music, play CriticalFailure, then start GameOver track
        setTimeout(async () => {
          const audio = document.getElementById('bg-music') as HTMLAudioElement;
          if (audio) {
            audio.pause();
          }

          // Play CriticalFailure and wait for it to finish
          await playDefeat();

          // Start GameOver soundtrack
          if (audio) {
            const basePath = import.meta.env.BASE_URL;
            const gameOverTrack = `${basePath}music/GameOver.ogg`;
            audio.src = gameOverTrack;
            audio.volume = 0.2; // Music volume
            setCurrentTrack(gameOverTrack);

            const shouldPlay =
              musicEverEnabledRef.current && !userDisabledMusicRef.current;
            if (shouldPlay) {
              // Wait for track to be ready before playing
              const handleCanPlay = () => {
                audio.play()
                  .then(() => setIsMusicPlaying(true))
                  .catch((err) => console.log('GameOver track failed:', err));
                audio.removeEventListener('canplay', handleCanPlay);
              };
              audio.addEventListener('canplay', handleCanPlay);
              audio.load();
            }
          }
        }, 300);

        setGameState('lost');
      }
    }, 2000);
  };

  /** Take current winnings and leave */
  const takeTheMoney = () => {
    if (currentQuestion === 0) return;
    playTakeMoney();
    setWonPrize(prizes[currentQuestion - 1]);
    setGameState('took_money');
  };

  // ============================================
  // Lifelines
  // ============================================

  /** 50:50 - Eliminate two wrong answers */
  const useFiftyFifty = () => {
    if (!fiftyFifty || selectedAnswer !== null) return;

    // Play 50:50 magical zap sound
    playFiftyFifty();

    setFiftyFifty(false);
    const correct = sortedQuestions[currentQuestion].correct;

    // Find display indices of wrong answers
    const wrongDisplayIndices = shuffledAnswers
      .map((originalIdx, displayIdx) => ({ originalIdx, displayIdx }))
      .filter(({ originalIdx }) => originalIdx !== correct)
      .map(({ displayIdx }) => displayIdx);

    // Randomly pick 2 wrong answers to eliminate
    const toEliminate = wrongDisplayIndices.sort(() => Math.random() - 0.5).slice(0, 2);
    setEliminatedAnswers(toEliminate);
  };

  /** Phone a Friend - Get advice from a companion */
  const usePhoneAFriend = () => {
    if (!phoneAFriend || selectedAnswer !== null) return;

    setPhoneAFriend(false);
    const correct = sortedQuestions[currentQuestion].correct;

    // 80% chance of correct advice
    const isConfident = Math.random() > 0.2;
    const suggestedAnswer = isConfident
      ? correct
      : [0, 1, 2, 3].filter((i) => i !== correct)[
          Math.floor(Math.random() * 3)
        ];

    const name = companionNames[Math.floor(Math.random() * companionNames.length)];
    const answerText = sortedQuestions[currentQuestion].answers[suggestedAnswer];

    // Play companion's voice if available
    playScrollUnfold(name);

    const phrases = [
      `Я ${isConfident ? 'уверен' : 'думаю'}, что это "${answerText}"`,
      `По-моему, правильный ответ — "${answerText}"`,
      `Рискну сказать "${answerText}"`,
    ];

    setShowHint({
      type: 'phone',
      name,
      text: phrases[Math.floor(Math.random() * phrases.length)],
    });
  };

  /** Ask the Audience - Show voting results */
  const useAskAudience = () => {
    if (!askAudience || selectedAnswer !== null) return;

    // Play tavern cheer sound
    playTavernCheer();

    setAskAudience(false);
    const correct = sortedQuestions[currentQuestion].correct;

    // Find display index of correct answer
    const correctDisplayIndex = shuffledAnswers.indexOf(correct);

    // Generate realistic-looking percentages based on DISPLAY indices
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

    setShowHint({ type: 'audience', percentages });
  };

  // ============================================
  // Styling
  // ============================================

  /** Get dynamic styling for answer buttons */
  const getAnswerStyle = (displayIndex: number): string => {
    const base =
      'relative px-4 py-3 text-left transition-all duration-300 ' +
      'cursor-pointer text-sm font-serif border-4 ';

    // Eliminated by 50:50
    if (eliminatedAnswers.includes(displayIndex)) {
      return (
        base +
        'opacity-30 cursor-not-allowed bg-stone-950 text-stone-700 border-stone-900'
      );
    }

    // Map display index to original answer index
    const originalIndex = shuffledAnswers[displayIndex];

    // After answer selected
    if (selectedAnswer !== null) {
      const correct = sortedQuestions[currentQuestion].correct;

      if (originalIndex === correct) {
        // Correct answer - green glow
        return (
          base +
          'bg-gradient-to-br from-emerald-800 to-emerald-950 ' +
          'text-emerald-200 border-emerald-500 shadow-xl animate-pulse'
        );
      }

      if (displayIndex === selectedAnswer && originalIndex !== correct) {
        // Wrong selected answer - red
        return (
          base +
          'bg-gradient-to-br from-red-900 to-red-950 ' +
          'text-red-300 border-red-600 shadow-lg'
        );
      }
    }

    // Default state - themed style
    return (
      base +
      `bg-gradient-to-b ${theme.bgAnswer} ` +
      `${theme.textSecondary} ${theme.border} ` +
      `${theme.borderHover} ${theme.bgAnswerHover} ` +
      `${theme.textAccent} hover:shadow-lg ${theme.shadowAnswer}`
    );
  };

  // ============================================
  // Render
  // ============================================

  // Wait for questions to load (only when mode is selected)
  if (gameState === 'playing' && sortedQuestions.length === 0) return null;

  return (
    <ThemeProvider mode={selectedMode}>
      <div
        className="min-h-screen p-4 transition-all duration-500"
        style={{
          background: getBackgroundStyle(),
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Background Music - preload=none for lazy loading */}
        <audio id="bg-music" loop preload="none" src={currentTrack} />

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <Panel className="mb-4 p-1">
            <PanelHeader>✦ ДРЕВНИЙ СВИТОК ✦ СРОЧНЫЙ КВЕСТ ✦</PanelHeader>
            <div className="p-4 text-center">
              {/* Music Toggle */}
              <div className="flex justify-end mb-2">
                <button
                  onClick={toggleMusic}
                  className="text-2xl hover:scale-110 transition-transform"
                title={isMusicPlaying ? 'Выключить музыку' : 'Включить музыку'}
              >
                {isMusicPlaying ? '🔊' : '🔇'}
              </button>
            </div>

            {/* Title */}
            <h1
              className={`text-2xl md:text-3xl font-bold tracking-wider mb-1 transition-colors duration-500 ${theme.textPrimary}`}
              style={{
                textShadow:
                  `0 0 15px ${theme.glowColor}, 0 0 30px ${theme.glowSecondary}, 2px 2px 4px #000`,
                fontFamily: 'Georgia, serif',
              }}
            >
              КТО ХОЧЕТ СТАТЬ МИЛЛИОНЕРОМ
            </h1>
            <h2
              className={`text-lg tracking-wide transition-colors duration-500 ${
                selectedMode === 'illithid' ? 'text-purple-600' :
                selectedMode === 'darkUrge' ? 'text-red-600' : 'text-amber-600'
              }`}
              style={{
                lineHeight: '1.5',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'italic',
              }}
            >
              BALDUR'S GATE 3 EDITION
            </h2>

            {/* Theme Icons - only show when mode is selected (not on start screen) */}
            {gameState !== 'start' && selectedMode && (
              <div className="flex justify-center gap-6 mt-3">
                <div
                  className={`flex items-center gap-1 transition-opacity ${
                    selectedMode === 'hero' ? 'opacity-100' : 'opacity-30'
                  }`}
                >
                  <SwordIcon />
                  <span className="text-blue-400 text-xs font-serif">ГЕРОЙ</span>
                </div>
                <div
                  className={`flex items-center gap-1 transition-opacity ${
                    selectedMode === 'illithid' ? 'opacity-100' : 'opacity-30'
                  }`}
                >
                  <MindFlayerIcon />
                  <span className="text-purple-400 text-xs font-serif">
                    ИЛЛИТИД
                  </span>
                </div>
                <div
                  className={`flex items-center gap-1 transition-opacity ${
                    selectedMode === 'darkUrge' ? 'opacity-100' : 'opacity-30'
                  }`}
                >
                  <DarkUrgeIcon />
                  <span className="text-red-400 text-xs font-serif">СОБЛАЗН</span>
                </div>
              </div>
            )}
          </div>
        </Panel>

        {/* Start Screen */}
        {gameState === 'start' && (
          <Panel className="p-1">
            <PanelHeader>✦ СВИТОК КВЕСТА ✦</PanelHeader>
            <div className="text-center py-8 px-4">
              <p className="text-amber-200 text-base mb-6 max-w-md mx-auto leading-relaxed font-serif">
                Искатель приключений! Перед тобой испытание на знание Забытых
                Королевств. 15 вопросов, 3 магические подсказки, 3,000,000
                золотых на кону.
              </p>

              {/* Difficulty Selection */}
              <div className="mb-8">
                <p className="text-amber-400 text-sm mb-4 font-serif tracking-wide">
                  ✦ ВЫБЕРИ ПУТЬ ✦
                </p>
                <div className="flex justify-center gap-4 md:gap-6">
                  {/* Hero Mode */}
                  <button
                    onClick={() => { setSelectedMode('hero'); playModeSelect('hero'); }}
                    className={`flex flex-col items-center gap-2 p-3 md:p-4 border-4 transition-all transform hover:scale-105 ${
                      selectedMode === 'hero'
                        ? 'border-blue-500 bg-blue-950/50'
                        : 'border-stone-700 bg-stone-950/50 hover:border-blue-700'
                    }`}
                    style={{
                      borderStyle: 'ridge',
                      boxShadow:
                        selectedMode === 'hero'
                          ? '0 0 25px rgba(59, 130, 246, 0.6), inset 0 0 15px rgba(59, 130, 246, 0.2)'
                          : 'none',
                    }}
                  >
                    <SwordIcon />
                    <span
                      className={`text-sm font-serif font-bold ${
                        selectedMode === 'hero'
                          ? 'text-blue-300'
                          : 'text-blue-500'
                      }`}
                    >
                      ГЕРОЙ
                    </span>
                    <span className="text-xs text-stone-500 font-serif">
                      Легко
                    </span>
                  </button>

                  {/* Illithid Mode */}
                  <button
                    onClick={() => { setSelectedMode('illithid'); playModeSelect('illithid'); }}
                    className={`flex flex-col items-center gap-2 p-3 md:p-4 border-4 transition-all transform hover:scale-105 ${
                      selectedMode === 'illithid'
                        ? 'border-purple-500 bg-purple-950/50'
                        : 'border-stone-700 bg-stone-950/50 hover:border-purple-700'
                    }`}
                    style={{
                      borderStyle: 'ridge',
                      boxShadow:
                        selectedMode === 'illithid'
                          ? '0 0 25px rgba(168, 85, 247, 0.6), inset 0 0 15px rgba(168, 85, 247, 0.2)'
                          : 'none',
                    }}
                  >
                    <MindFlayerIcon />
                    <span
                      className={`text-sm font-serif font-bold ${
                        selectedMode === 'illithid'
                          ? 'text-purple-300'
                          : 'text-purple-500'
                      }`}
                    >
                      ИЛЛИТИД
                    </span>
                    <span className="text-xs text-stone-500 font-serif">
                      Сложно
                    </span>
                  </button>

                  {/* Dark Urge Mode */}
                  <button
                    onClick={() => { setSelectedMode('darkUrge'); playModeSelect('darkUrge'); }}
                    className={`flex flex-col items-center gap-2 p-3 md:p-4 border-4 transition-all transform hover:scale-105 ${
                      selectedMode === 'darkUrge'
                        ? 'border-red-500 bg-red-950/50'
                        : 'border-stone-700 bg-stone-950/50 hover:border-red-700'
                    }`}
                    style={{
                      borderStyle: 'ridge',
                      boxShadow:
                        selectedMode === 'darkUrge'
                          ? '0 0 25px rgba(239, 68, 68, 0.6), inset 0 0 15px rgba(239, 68, 68, 0.2)'
                          : 'none',
                    }}
                  >
                    <DarkUrgeIcon />
                    <span
                      className={`text-sm font-serif font-bold ${
                        selectedMode === 'darkUrge'
                          ? 'text-red-300'
                          : 'text-red-500'
                      }`}
                    >
                      СОБЛАЗН
                    </span>
                    <span className="text-xs text-stone-500 font-serif">
                      Доблесть
                    </span>
                  </button>
                </div>
              </div>

              <button
                onClick={startGame}
                disabled={!selectedMode}
                className={`px-8 py-3 font-bold text-lg tracking-wide border-4 transition-all transform font-serif ${
                  selectedMode
                    ? `bg-gradient-to-b ${theme.bgButton} text-white ${theme.borderLight} ${theme.bgButtonHover} hover:scale-105`
                    : 'bg-gradient-to-b from-stone-700 via-stone-800 to-stone-900 text-stone-500 border-stone-600 cursor-not-allowed'
                }`}
                style={{
                  boxShadow: selectedMode
                    ? `0 0 25px ${theme.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
                    : 'none',
                  borderStyle: 'ridge',
                  textShadow: selectedMode ? '0 2px 4px rgba(0,0,0,0.8)' : 'none',
                }}
              >
                ⚔ НАЧАТЬ ПРИКЛЮЧЕНИЕ ⚔
              </button>
            </div>
          </Panel>
        )}

        {/* Game Screen */}
        {gameState === 'playing' && (
          <div className="grid md:grid-cols-4 gap-3">
            <div className="md:col-span-3 space-y-3">
              {/* Question Panel */}
              <Panel className="p-1">
                <PanelHeader align="between">
                  <span>✦ ВОПРОС #{currentQuestion + 1} ✦</span>
                  <span>
                    СЛОЖНОСТЬ:{' '}
                    {'★'.repeat(sortedQuestions[currentQuestion].difficulty)}
                    {'☆'.repeat(3 - sortedQuestions[currentQuestion].difficulty)}
                  </span>
                </PanelHeader>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-amber-400 text-xs font-serif italic">
                      Прогресс: {currentQuestion + 1}/15
                    </span>
                    <span className={`${theme.textPrimary} font-bold flex items-center font-serif`}>
                      <CoinIcon />
                      {prizes[currentQuestion]}
                    </span>
                  </div>
                  <p className={`${theme.textAccent} text-base leading-relaxed font-serif`}>
                    {sortedQuestions[currentQuestion].question}
                  </p>
                </div>
              </Panel>

              {/* Answer Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {shuffledAnswers.map((originalIndex, displayIndex) => (
                    <button
                      key={displayIndex}
                      onClick={() => handleAnswerClick(displayIndex)}
                      disabled={
                        selectedAnswer !== null ||
                        eliminatedAnswers.includes(displayIndex)
                      }
                      className={getAnswerStyle(displayIndex)}
                      style={{ borderStyle: 'ridge' }}
                    >
                      <span className={`${theme.textPrimary} mr-2 font-bold`}>
                        [{['A', 'B', 'C', 'D'][displayIndex]}]
                      </span>
                      {sortedQuestions[currentQuestion].answers[originalIndex]}
                    </button>
                  )
                )}
              </div>

              {/* Hint Display */}
              {showHint && (
                <Panel className="p-1">
                  <PanelHeader>
                    ✦{' '}
                    {showHint.type === 'phone'
                      ? 'МАГИЧЕСКОЕ ПОСЛАНИЕ'
                      : 'РЕЗУЛЬТАТЫ ГАДАНИЯ'}{' '}
                    ✦
                  </PanelHeader>
                  <div className="p-3">
                    {showHint.type === 'phone' && (
                      <div>
                        <p className="text-amber-400 text-xs mb-1 font-serif italic">
                          <ScrollIcon /> Отправитель: {showHint.name}
                        </p>
                        <p className="text-amber-300 italic font-serif">
                          "{showHint.text}"
                        </p>
                      </div>
                    )}
                    {showHint.type === 'audience' && (
                      <div>
                        <p className="text-amber-400 text-xs mb-2 font-serif italic">
                          <TavernIcon /> Мнение таверны:
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {showHint.percentages.map((p, i) => (
                            <div key={i} className="text-center">
                              <div
                                className={`h-16 bg-black border-2 ${theme.border} relative overflow-hidden`}
                                style={{ borderStyle: 'inset' }}
                              >
                                <div
                                  className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${theme.bgLifeline} transition-all duration-500`}
                                  style={{ height: `${p}%` }}
                                />
                              </div>
                              <span className={`text-xs ${theme.textPrimary} font-serif`}>
                                [{['A', 'B', 'C', 'D'][i]}] {p}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Panel>
              )}

              {/* Lifelines Panel */}
              <Panel className="p-1">
                <PanelHeader>✦ МАГИЧЕСКИЕ СПОСОБНОСТИ ✦</PanelHeader>
                <div className="flex flex-wrap gap-2 p-3 justify-center">
                  <button
                    onClick={useFiftyFifty}
                    disabled={!fiftyFifty || selectedAnswer !== null}
                    className={`px-4 py-2 text-sm transition-all border-3 font-serif ${
                      fiftyFifty && selectedAnswer === null
                        ? 'bg-gradient-to-b from-orange-700 to-orange-900 border-orange-500 text-orange-100 hover:from-orange-600'
                        : 'bg-stone-950 border-stone-800 text-stone-600 cursor-not-allowed'
                    }`}
                    style={{
                      borderStyle: 'ridge',
                      boxShadow:
                        fiftyFifty && selectedAnswer === null
                          ? '0 0 15px rgba(249, 115, 22, 0.4)'
                          : 'none',
                    }}
                  >
                    ⚡ 50:50
                  </button>
                  <button
                    onClick={usePhoneAFriend}
                    disabled={!phoneAFriend || selectedAnswer !== null}
                    className={`px-4 py-2 text-sm transition-all border-3 font-serif ${
                      phoneAFriend && selectedAnswer === null
                        ? 'bg-gradient-to-b from-blue-700 to-blue-900 border-blue-500 text-blue-100 hover:from-blue-600'
                        : 'bg-stone-950 border-stone-800 text-stone-600 cursor-not-allowed'
                    }`}
                    style={{
                      borderStyle: 'ridge',
                      boxShadow:
                        phoneAFriend && selectedAnswer === null
                          ? '0 0 15px rgba(59, 130, 246, 0.4)'
                          : 'none',
                    }}
                  >
                    📜 Послание
                  </button>
                  <button
                    onClick={useAskAudience}
                    disabled={!askAudience || selectedAnswer !== null}
                    className={`px-4 py-2 text-sm transition-all border-3 font-serif ${
                      askAudience && selectedAnswer === null
                        ? 'bg-gradient-to-b from-teal-700 to-teal-900 border-teal-500 text-teal-100 hover:from-teal-600'
                        : 'bg-stone-950 border-stone-800 text-stone-600 cursor-not-allowed'
                    }`}
                    style={{
                      borderStyle: 'ridge',
                      boxShadow:
                        askAudience && selectedAnswer === null
                          ? '0 0 15px rgba(20, 184, 166, 0.4)'
                          : 'none',
                    }}
                  >
                    🍺 Таверна
                  </button>
                  <button
                    onClick={takeTheMoney}
                    disabled={currentQuestion === 0 || selectedAnswer !== null}
                    className={`px-4 py-2 text-sm transition-all border-3 font-serif ${
                      currentQuestion > 0 && selectedAnswer === null
                        ? 'bg-gradient-to-b from-yellow-700 to-yellow-900 border-yellow-600 text-yellow-100 hover:from-yellow-600'
                        : 'bg-stone-950 border-stone-800 text-stone-600 cursor-not-allowed'
                    }`}
                    style={{
                      borderStyle: 'ridge',
                      boxShadow:
                        currentQuestion > 0 && selectedAnswer === null
                          ? '0 0 15px rgba(234, 179, 8, 0.4)'
                          : 'none',
                    }}
                  >
                    💰 Забрать
                  </button>
                </div>
              </Panel>
            </div>

            {/* Prize Ladder */}
            <Panel className="p-1 h-fit">
              <PanelHeader>✦ СПИСОК НАГРАД ✦</PanelHeader>
              <div className="p-2 space-y-1">
                {[...prizes].reverse().map((prize: string, reverseIndex: number) => {
                    // Convert reverse index to actual question index (0-14)
                    const index = 14 - reverseIndex;
                    const questionNumber = index + 1; // 1-15
                    const isGuaranteed = guaranteedPrizes.includes(index);
                    const isCurrent = index === currentQuestion;
                    const isPassed = index < currentQuestion;
                    // Show difficulty stars for milestone questions (5, 10, 15)
                    // Question 5 (index 4) = end of difficulty 1
                    // Question 10 (index 9) = end of difficulty 2
                    // Question 15 (index 14) = end of difficulty 3
                    const difficultyLevel = index < 5 ? 1 : index < 10 ? 2 : 3;

                    return (
                      <div
                        key={index}
                        className={`text-xs px-2 py-1 flex justify-between items-center font-serif transition-all border-l-4 ${
                          isCurrent
                            ? `${theme.bgPrizeCurrent} ${theme.textSecondary} ${theme.borderLight} shadow-lg`
                            : isPassed
                              ? `${theme.bgPrizePassed} ${theme.textMuted} ${theme.border}`
                              : isGuaranteed
                                ? 'bg-yellow-950/40 text-yellow-600 border-yellow-700'
                                : 'text-stone-300 border-stone-700'
                        }`}
                        style={
                          isCurrent
                            ? {
                                boxShadow: `0 0 15px ${theme.glow}`,
                                borderStyle: 'solid',
                              }
                            : { borderStyle: 'solid' }
                        }
                      >
                        <span>{String(questionNumber).padStart(2, '0')}</span>
                        <span className="flex-1 flex justify-center">
                          <span className="w-20 text-right">{prize}</span>
                        </span>
                        <span className="w-8 text-right">
                          {isGuaranteed && (
                            <span className="text-yellow-500" title={`Сложность ${difficultyLevel}★`}>
                              {'★'.repeat(difficultyLevel)}
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </Panel>
          </div>
        )}

        {/* End Game Screens */}
        {(gameState === 'won' ||
          gameState === 'lost' ||
          gameState === 'took_money') && (
          <Panel className="p-1">
            <PanelHeader>
              ✦{' '}
              {gameState === 'won'
                ? 'КВЕСТ ЗАВЕРШЁН'
                : gameState === 'took_money'
                  ? 'НАГРАДА ПОЛУЧЕНА'
                  : 'КВЕСТ ПРОВАЛЕН'}{' '}
              ✦
            </PanelHeader>
            <div className="text-center py-12 px-4">
              {gameState === 'won' && <TrophyIcon />}
              {gameState === 'took_money' && <MoneyIcon />}
              {gameState === 'lost' && <CriticalFailIcon />}

              <h2
                className={`text-2xl font-bold mt-4 mb-4 tracking-wide font-serif ${
                  gameState === 'won'
                    ? 'text-yellow-400'
                    : gameState === 'took_money'
                      ? theme.textPrimary
                      : 'text-red-400'
                }`}
                style={{
                  textShadow:
                    gameState === 'won'
                      ? '0 0 25px #facc15, 0 2px 8px #000'
                      : gameState === 'took_money'
                        ? `0 0 25px ${theme.glowColor}, 0 2px 8px #000`
                        : '0 0 25px #ef4444, 0 2px 8px #000',
                }}
              >
                {gameState === 'won' && '⚔ ЛЕГЕНДАРНЫЙ ГЕРОЙ ⚔'}
                {gameState === 'took_money' && '✨ МУДРЫЙ ВЫБОР ✨'}
                {gameState === 'lost' && '💀 КРИТИЧЕСКИЙ ПРОВАЛ 💀'}
              </h2>

              <p className={`${theme.textSecondary} text-lg mb-2 font-serif`}>
                {gameState === 'won' &&
                  'Вы завоевали величайшее сокровище Фаэруна!'}
                {gameState === 'took_money' &&
                  'Мудрое решение, искатель приключений.'}
                {gameState === 'lost' && 'Кость брошена. Неверный ответ.'}
              </p>

              <div className="flex items-center justify-center gap-2 text-xl text-yellow-300 font-bold mb-6 font-serif">
                <CoinIcon />
                <span>НАГРАДА: {wonPrize} ЗОЛОТЫХ</span>
              </div>

              {gameState === 'lost' && (
                <p className="text-amber-400 mb-6 text-sm font-serif italic">
                  Правильный ответ:{' '}
                  {
                    sortedQuestions[currentQuestion].answers[
                      sortedQuestions[currentQuestion].correct
                    ]
                  }
                </p>
              )}

              <button
                onClick={newGame}
                className={`px-8 py-3 bg-gradient-to-b ${theme.bgButton} text-white font-bold tracking-wide border-4 ${theme.borderLight} ${theme.bgButtonHover} transition-all transform hover:scale-105 font-serif`}
                style={{
                  boxShadow: `0 0 25px ${theme.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
                  borderStyle: 'ridge',
                  textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                }}
              >
                ⚔ НОВОЕ ПРИКЛЮЧЕНИЕ ⚔
              </button>
            </div>
          </Panel>
        )}

        {/* Footer */}
        <div className="text-center mt-4 text-xs tracking-wide font-serif italic text-amber-400/70">
          ✦ By Mystra's Grace ✦ For the Realms ✦ Gather Your Party ✦
        </div>
      </div>
    </div>
    </ThemeProvider>
  );
}
