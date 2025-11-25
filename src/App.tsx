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

import { useState, useEffect } from 'react';
import {
  TrophyIcon,
  MoneyIcon,
  SkullIcon,
  MindFlayerIcon,
  DarkUrgeIcon,
  SwordIcon,
  CoinIcon,
  ScrollIcon,
  TavernIcon,
  StarIcon,
} from './components/icons';
import { Panel, PanelHeader } from './components/ui';
import { questions, prizes, guaranteedPrizes, companionNames } from './data';
import { Question, Hint, GameState } from './types';

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

  /** Prize amount won */
  const [wonPrize, setWonPrize] = useState('0');

  /** Background music state */
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // ============================================
  // Effects
  // ============================================

  /** Sort questions by difficulty on mount */
  useEffect(() => {
    const sorted = [...questions].sort((a, b) => a.difficulty - b.difficulty);
    setSortedQuestions(sorted);
  }, []);

  // ============================================
  // Audio Controls
  // ============================================

  /** Toggle background music on/off */
  const toggleMusic = () => {
    const audio = document.getElementById('bg-music') as HTMLAudioElement | null;
    if (!audio) return;

    if (isMusicPlaying) {
      audio.pause();
      setIsMusicPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsMusicPlaying(true))
        .catch((err: Error) => console.log('Music play failed:', err));
    }
  };

  // ============================================
  // Game Logic
  // ============================================

  /** Start a new game, reset all state */
  const startGame = () => {
    // Try to start music on game start (requires user interaction)
    const audio = document.getElementById('bg-music') as HTMLAudioElement | null;
    if (audio && !isMusicPlaying) {
      audio
        .play()
        .then(() => setIsMusicPlaying(true))
        .catch((err: Error) => console.log('Music play failed:', err));
    }

    // Reset game state
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

  /** Handle answer selection */
  const handleAnswerClick = (index: number) => {
    if (selectedAnswer !== null || eliminatedAnswers.includes(index)) return;

    setSelectedAnswer(index);
    setShowHint(null);

    // Delay to show correct/incorrect animation
    setTimeout(() => {
      const correct = sortedQuestions[currentQuestion].correct;

      if (index === correct) {
        // Correct answer
        if (currentQuestion === 14) {
          // Won the game!
          setWonPrize(prizes[14]);
          setGameState('won');
        } else {
          // Move to next question
          setCurrentQuestion((prev) => prev + 1);
          setSelectedAnswer(null);
          setEliminatedAnswers([]);
        }
      } else {
        // Wrong answer - game over
        const lastGuaranteed = guaranteedPrizes
          .filter((p) => p < currentQuestion)
          .pop();
        setWonPrize(lastGuaranteed !== undefined ? prizes[lastGuaranteed] : '0');
        setGameState('lost');
      }
    }, 2000);
  };

  /** Take current winnings and leave */
  const takeTheMoney = () => {
    if (currentQuestion === 0) return;
    setWonPrize(prizes[currentQuestion - 1]);
    setGameState('took_money');
  };

  // ============================================
  // Lifelines
  // ============================================

  /** 50:50 - Eliminate two wrong answers */
  const useFiftyFifty = () => {
    if (!fiftyFifty || selectedAnswer !== null) return;

    setFiftyFifty(false);
    const correct = sortedQuestions[currentQuestion].correct;
    const wrong = [0, 1, 2, 3].filter((i) => i !== correct);
    const toEliminate = wrong.sort(() => Math.random() - 0.5).slice(0, 2);
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

    // Default state - fantasy amber style
    return (
      base +
      'bg-gradient-to-b from-amber-950 via-stone-900 to-neutral-950 ' +
      'text-amber-200 border-amber-800 ' +
      'hover:border-amber-600 hover:from-amber-900 hover:to-stone-900 ' +
      'hover:text-amber-100 hover:shadow-lg hover:shadow-amber-900/50'
    );
  };

  // ============================================
  // Render
  // ============================================

  // Wait for questions to load
  if (sortedQuestions.length === 0) return null;

  return (
    <div
      className="min-h-screen p-4"
      style={{
        background:
          'radial-gradient(ellipse at center, #1a0f0a 0%, #0d0604 50%, #000 100%)',
        fontFamily: 'Georgia, serif',
      }}
    >
      {/* Background Music */}
      <audio id="bg-music" loop preload="auto">
        <source src="https://files.catbox.moe/cnhb0v.mp3" type="audio/mpeg" />
      </audio>

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
              className="text-2xl md:text-3xl font-bold text-amber-400 tracking-wider mb-1"
              style={{
                textShadow:
                  '0 0 15px #fbbf24, 0 0 30px #d97706, 2px 2px 4px #000',
                fontFamily: 'Georgia, serif',
              }}
            >
              КТО ХОЧЕТ СТАТЬ МИЛЛИОНЕРОМ
            </h1>
            <h2
              className="text-lg text-amber-600 tracking-wide"
              style={{
                lineHeight: '1.5',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'italic',
              }}
            >
              [ BALDUR'S GATE 3 EDITION ]
            </h2>

            {/* Theme Icons */}
            <div className="flex justify-center gap-6 mt-3">
              <div className="flex items-center gap-1">
                <SwordIcon />
                <span className="text-blue-400 text-xs font-serif">ГЕРОЙ</span>
              </div>
              <div className="flex items-center gap-1">
                <MindFlayerIcon />
                <span className="text-purple-400 text-xs font-serif">
                  ИЛЛИТИД
                </span>
              </div>
              <div className="flex items-center gap-1">
                <DarkUrgeIcon />
                <span className="text-red-400 text-xs font-serif">СОБЛАЗН</span>
              </div>
            </div>
          </div>
        </Panel>

        {/* Start Screen */}
        {gameState === 'start' && (
          <Panel className="p-1">
            <PanelHeader>✦ СВИТОК КВЕСТА ✦</PanelHeader>
            <div className="text-center py-12 px-4">
              <SwordIcon />
              <p className="text-amber-200 text-base mb-8 max-w-md mx-auto leading-relaxed mt-4 font-serif">
                Искатель приключений! Перед тобой испытание на знание Забытых
                Королевств. 15 вопросов, 3 магические подсказки, 3,000,000
                золотых на кону.
              </p>
              <button
                onClick={startGame}
                className="px-8 py-3 bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900 text-amber-50 font-bold text-lg tracking-wide border-4 border-amber-600 hover:from-amber-600 hover:via-amber-700 hover:to-amber-800 transition-all transform hover:scale-105 font-serif"
                style={{
                  boxShadow:
                    '0 0 25px rgba(217, 119, 6, 0.5), inset 0 1px 0 rgba(251, 191, 36, 0.3)',
                  borderStyle: 'ridge',
                  textShadow: '0 2px 4px rgba(0,0,0,0.8)',
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
                    <span className="text-amber-700 text-xs font-serif">
                      Прогресс: {currentQuestion + 1}/15
                    </span>
                    <span className="text-amber-400 font-bold flex items-center font-serif">
                      <CoinIcon />
                      {prizes[currentQuestion]}
                    </span>
                  </div>
                  <p className="text-amber-100 text-base leading-relaxed font-serif">
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
                      <span className="text-amber-400 mr-2 font-bold">
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
                        <p className="text-amber-600 text-xs mb-1 font-serif">
                          <ScrollIcon /> Отправитель: {showHint.name}
                        </p>
                        <p className="text-amber-200 italic font-serif">
                          "{showHint.text}"
                        </p>
                      </div>
                    )}
                    {showHint.type === 'audience' && (
                      <div>
                        <p className="text-amber-600 text-xs mb-2 font-serif">
                          <TavernIcon /> Мнение таверны:
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {showHint.percentages.map((p, i) => (
                            <div key={i} className="text-center">
                              <div
                                className="h-16 bg-black border-2 border-amber-900 relative overflow-hidden"
                                style={{ borderStyle: 'inset' }}
                              >
                                <div
                                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-700 to-amber-500 transition-all duration-500"
                                  style={{ height: `${p}%` }}
                                />
                              </div>
                              <span className="text-xs text-amber-400 font-serif">
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
                        ? 'bg-gradient-to-b from-purple-700 to-purple-900 border-purple-500 text-purple-100 hover:from-purple-600'
                        : 'bg-stone-950 border-stone-800 text-stone-600 cursor-not-allowed'
                    }`}
                    style={{
                      borderStyle: 'ridge',
                      boxShadow:
                        askAudience && selectedAnswer === null
                          ? '0 0 15px rgba(168, 85, 247, 0.4)'
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
                  .map((prize, index) => {
                    const isGuaranteed = guaranteedPrizes.includes(index);
                    const isCurrent = index === currentQuestion;
                    const isPassed = index < currentQuestion;

                    return (
                      <div
                        key={index}
                        className={`text-xs px-2 py-1 flex justify-between items-center font-serif transition-all border-l-4 ${
                          isCurrent
                            ? 'bg-amber-900/60 text-amber-200 border-amber-400 shadow-lg'
                            : isPassed
                              ? 'bg-amber-950/40 text-amber-700 border-amber-800'
                              : isGuaranteed
                                ? 'bg-yellow-950/40 text-yellow-600 border-yellow-700'
                                : 'text-stone-600 border-stone-800'
                        }`}
                        style={
                          isCurrent
                            ? {
                                boxShadow: '0 0 15px rgba(251, 191, 36, 0.4)',
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
              {gameState === 'lost' && <SkullIcon />}

              <h2
                className={`text-2xl font-bold mt-4 mb-4 tracking-wide font-serif ${
                  gameState === 'won'
                    ? 'text-yellow-400'
                    : gameState === 'took_money'
                      ? 'text-amber-400'
                      : 'text-red-400'
                }`}
                style={{
                  textShadow:
                    gameState === 'won'
                      ? '0 0 25px #facc15, 0 2px 8px #000'
                      : gameState === 'took_money'
                        ? '0 0 25px #fbbf24, 0 2px 8px #000'
                        : '0 0 25px #ef4444, 0 2px 8px #000',
                }}
              >
                {gameState === 'won' && '⚔ ЛЕГЕНДАРНЫЙ ГЕРОЙ ⚔'}
                {gameState === 'took_money' && '✨ МУДРЫЙ ВЫБОР ✨'}
                {gameState === 'lost' && '💀 КРИТИЧЕСКИЙ ПРОВАЛ 💀'}
              </h2>

              <p className="text-amber-200 text-lg mb-2 font-serif">
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
                <p className="text-amber-600 mb-6 text-sm font-serif italic">
                  Правильный ответ:{' '}
                  {
                    sortedQuestions[currentQuestion].answers[
                      sortedQuestions[currentQuestion].correct
                    ]
                  }
                </p>
              )}

              <button
                onClick={startGame}
                className="px-8 py-3 bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900 text-amber-50 font-bold tracking-wide border-4 border-amber-600 hover:from-amber-600 hover:via-amber-700 hover:to-amber-800 transition-all transform hover:scale-105 font-serif"
                style={{
                  boxShadow:
                    '0 0 25px rgba(217, 119, 6, 0.5), inset 0 1px 0 rgba(251, 191, 36, 0.3)',
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
        <div className="text-center mt-4 text-orange-600 text-xs tracking-wide font-serif italic">
          ✦ By Mystra's Grace ✦ For the Realms ✦ Gather Your Party ✦
        </div>
      </div>
    </div>
  );
}
