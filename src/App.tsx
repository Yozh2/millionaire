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
  playCoins,
  playCorrect,
  playWrong,
  playModeSelect,
  playGameStart,
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
    `${import.meta.env.BASE_URL}sounds/MainMenu.mp3`
  );

  // ============================================
  // Effects
  // ============================================

  /** Sort questions by difficulty when mode is selected */
  useEffect(() => {
    if (selectedMode) {
      const questions = getQuestionsForMode(selectedMode);
      const sorted = [...questions].sort((a, b) => a.difficulty - b.difficulty);
      setSortedQuestions(sorted);
    }
  }, [selectedMode]);

  /** Switch soundtrack based on game state and selected mode */
  useEffect(() => {
    const basePath = import.meta.env.BASE_URL;
    let newTrack: string;

    if (gameState === 'start') {
      // Main menu - always play MainMenu until game starts
      newTrack = `${basePath}sounds/MainMenu.mp3`;
    } else if (gameState === 'playing' && selectedMode) {
      // Game started - play character theme
      const trackMap: Record<DifficultyMode, string> = {
        hero: `${basePath}sounds/Hero.mp3`,
        illithid: `${basePath}sounds/Illithid.mp3`,
        darkUrge: `${basePath}sounds/DarkUrge.mp3`,
      };
      newTrack = trackMap[selectedMode];
    } else if (selectedMode) {
      // Game over screens - keep character theme
      const trackMap: Record<DifficultyMode, string> = {
        hero: `${basePath}sounds/Hero.mp3`,
        illithid: `${basePath}sounds/Illithid.mp3`,
        darkUrge: `${basePath}sounds/DarkUrge.mp3`,
      };
      newTrack = trackMap[selectedMode];
    } else {
      newTrack = `${basePath}sounds/MainMenu.mp3`;
    }

    if (newTrack !== currentTrack) {
      setCurrentTrack(newTrack);
      const audio = document.getElementById('bg-music') as HTMLAudioElement;
      if (audio) {
        audio.src = newTrack;
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
    } else {
      audio
        .play()
        .then(() => {
          setIsMusicPlaying(true);
          setMusicEverEnabled(true);
          musicEverEnabledRef.current = true;
          setUserDisabledMusic(false);
          userDisabledMusicRef.current = false;
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
      hero: `${basePath}sounds/Hero.mp3`,
      illithid: `${basePath}sounds/Illithid.mp3`,
      darkUrge: `${basePath}sounds/DarkUrge.mp3`,
    };
    switchTrack(trackMap[selectedMode]);

    // Reset game state
    const questions = getQuestionsForMode(selectedMode);
    const sorted = [...questions].sort((a, b) => a.difficulty - b.difficulty);
    setSortedQuestions(sorted);
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
    // Switch to main menu music
    const basePath = import.meta.env.BASE_URL;
    switchTrack(`${basePath}sounds/MainMenu.mp3`);

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
  const handleAnswerClick = (index: number) => {
    if (selectedAnswer !== null || eliminatedAnswers.includes(index)) return;

    // Play answer click sound
    playAnswerClick();

    setSelectedAnswer(index);
    setShowHint(null);

    // Delay to show correct/incorrect animation
    setTimeout(() => {
      const correct = sortedQuestions[currentQuestion].correct;

      if (index === correct) {
        // Correct answer - play correct sound
        playCorrect();
        if (currentQuestion === 14) {
          // Won the game! Play victory fanfare
          setTimeout(() => playVictory(), 500);
          setWonPrize(prizes[14]);
          setGameState('won');
        } else {
          // Move to next question
          setCurrentQuestion((prev) => prev + 1);
          setSelectedAnswer(null);
          setEliminatedAnswers([]);
        }
      } else {
        // Wrong answer - play defeat sound
        playWrong();
        setTimeout(() => playDefeat(), 300);
        const lastGuaranteed = guaranteedPrizes
          .filter((p: number) => p < currentQuestion)
          .pop();
        setWonPrize(lastGuaranteed !== undefined ? prizes[lastGuaranteed] : '0');
        setGameState('lost');
      }
    }, 2000);
  };

  /** Take current winnings and leave */
  const takeTheMoney = () => {
    if (currentQuestion === 0) return;
    playCoins();
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
    const wrong = [0, 1, 2, 3].filter((i) => i !== correct);
    const toEliminate = wrong.sort(() => Math.random() - 0.5).slice(0, 2);
    setEliminatedAnswers(toEliminate);
  };

  /** Phone a Friend - Get advice from a companion */
  const usePhoneAFriend = () => {
    if (!phoneAFriend || selectedAnswer !== null) return;

    // Play scroll unfold sound
    playScrollUnfold();

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

    // Generate realistic-looking percentages
    const percentages = [0, 0, 0, 0];
    percentages[correct] = 40 + Math.floor(Math.random() * 35);

    let remaining = 100 - percentages[correct];
    const otherAnswers = [0, 1, 2, 3].filter(
      (i) => i !== correct && !eliminatedAnswers.includes(i)
    );

    otherAnswers.forEach((i, idx, arr) => {
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
  const getAnswerStyle = (index: number): string => {
    const base =
      'relative px-4 py-3 text-left transition-all duration-300 ' +
      'cursor-pointer text-sm font-serif border-4 ';

    // Eliminated by 50:50
    if (eliminatedAnswers.includes(index)) {
      return (
        base +
        'opacity-30 cursor-not-allowed bg-stone-950 text-stone-700 border-stone-900'
      );
    }

    // After answer selected
    if (selectedAnswer !== null) {
      const correct = sortedQuestions[currentQuestion].correct;

      if (index === correct) {
        // Correct answer - green glow
        return (
          base +
          'bg-gradient-to-br from-emerald-800 to-emerald-950 ' +
          'text-emerald-200 border-emerald-500 shadow-xl animate-pulse'
        );
      }

      if (index === selectedAnswer && selectedAnswer !== correct) {
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
        {/* Background Music */}
        <audio id="bg-music" loop preload="auto" src={currentTrack} />

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
                    onClick={() => { setSelectedMode('hero'); playModeSelect(); }}
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
                    onClick={() => { setSelectedMode('illithid'); playModeSelect(); }}
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
                    onClick={() => { setSelectedMode('darkUrge'); playModeSelect(); }}
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
                <PanelHeader>
                  ✦ ВОПРОС #{currentQuestion + 1} ✦ СЛОЖНОСТЬ:{' '}
                  {'★'.repeat(sortedQuestions[currentQuestion].difficulty)}
                  {'☆'.repeat(5 - sortedQuestions[currentQuestion].difficulty)}
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
                {sortedQuestions[currentQuestion].answers.map(
                  (answer, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerClick(index)}
                      disabled={
                        selectedAnswer !== null ||
                        eliminatedAnswers.includes(index)
                      }
                      className={getAnswerStyle(index)}
                      style={{ borderStyle: 'ridge' }}
                    >
                      <span className={`${theme.textPrimary} mr-2 font-bold`}>
                        [{['A', 'B', 'C', 'D'][index]}]
                      </span>
                      {answer}
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
                {prizes
                  .map((prize: string, index: number) => {
                    const isGuaranteed = guaranteedPrizes.includes(index);
                    const isCurrent = index === currentQuestion;
                    const isPassed = index < currentQuestion;

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
                                : 'text-stone-600 border-stone-800'
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
                        <span>{String(15 - index).padStart(2, '0')}</span>
                        <span>{prize}</span>
                        {isGuaranteed && <StarIcon />}
                      </div>
                    );
                  })
                  .reverse()}
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
