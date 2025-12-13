/**
 * GameScreen - Main gameplay screen with question, answers, lifelines
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { GameConfig, ThemeColors, QuestionDifficulty, EffectsAPI, LifelineResult } from '../types';
import { UseGameStateReturn } from '../hooks/useGameState';
import { UseAudioReturn } from '../hooks/useAudio';
import { Panel, PanelHeader } from './ui';
import { HeaderPanel } from './HeaderPanel';
import {
  DefaultCoinIcon,
  DefaultPhoneHintIcon,
} from './DefaultIcons';

interface GameScreenProps {
  config: GameConfig;
  gameState: UseGameStateReturn;
  audio: UseAudioReturn;
  theme: ThemeColors;
  effects?: EffectsAPI;
}

export function GameScreen({
  config,
  gameState,
  audio,
  theme,
  effects,
}: GameScreenProps) {
  const {
    currentQuestion,
    totalQuestions,
    questions,
    prizeLadder,
    shuffledAnswers,
    eliminatedAnswers,
    selectedAnswer,
    lifelineResult,
    lifelineAvailability,
    handleAnswer,
    useLifelineFifty: activateLifelineFifty,
    useLifelinePhone: activateLifelinePhone,
    useLifelineAudience: activateLifelineAudience,
    takeMoney: takeMoneyAction,
  } = gameState;

  const questionData = questions[currentQuestion];
  const prizes = prizeLadder.values;
  const guaranteedPrizes = prizeLadder.guaranteed;

  // Calculate difficulty level for slideshow
  const difficultyLevel: QuestionDifficulty = useMemo(() => {
    const progress = currentQuestion / totalQuestions;
    if (progress < 1 / 3) return 'easy';
    if (progress < 2 / 3) return 'medium';
    return 'hard';
  }, [currentQuestion, totalQuestions]);

  // Refs for answer index labels (A, B, C, D) to get their positions for effects
  const answerIndexRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Get icons from config or use defaults
  const CoinIcon = config.icons?.coin || DefaultCoinIcon;
  const PhoneLifelineIcon =
    config.icons?.lifelinePhone || config.icons?.phoneHint || DefaultPhoneHintIcon;

  const lifelineConfigFifty = config.lifelines.fifty ?? config.lifelines.fiftyFifty;
  const lifelineConfigPhone = config.lifelines.phone ?? config.lifelines.phoneAFriend;
  const lifelineConfigAudience = config.lifelines.audience ?? config.lifelines.askAudience;

  const getButtonCenterOrigin = (target: HTMLElement): { x: number; y: number } => {
    const rect = target.getBoundingClientRect();
    const effectsCanvas = document.getElementById('effects-canvas');
    const reference = effectsCanvas?.getBoundingClientRect();

    const baseWidth = reference?.width || window.innerWidth || 1;
    const baseHeight = reference?.height || window.innerHeight || 1;
    const offsetX = reference?.left || 0;
    const offsetY = reference?.top || 0;

    return {
      x: Math.min(
        1,
        Math.max(0, (rect.left + rect.width / 2 - offsetX) / baseWidth)
      ),
      y: Math.min(
        1,
        Math.max(0, (rect.top + rect.height / 2 - offsetY) / baseHeight)
      ),
    };
  };

  const triggerLifelinePulse = (target: HTMLElement, color: string) => {
    effects?.triggerPulse(getButtonCenterOrigin(target), color);
  };

  // Wrapped handlers with sound effects (called on click/mouseup)
  const handleAnswerWithSound = async (
    displayIndex: number,
    _e: React.MouseEvent
  ) => {
    audio.playSoundEffect('answerButton');

    // Wait for the reveal animation (2 sec) then play result sound
    const result = await handleAnswer(displayIndex);
    if (result === 'correct') {
      audio.playSoundEffect('correct');
    } else if (result === 'won') {
      // Player won! Play victory sound and music
      audio.playSoundEffect('victory');
      audio.playVictory();
    } else if (result === 'wrong') {
      audio.playSoundEffect('defeat');
      audio.playGameOver();
    }
  };

  const handleFiftyFiftyWithSound = (e: React.MouseEvent<HTMLButtonElement>) => {
    audio.playSoundEffect('lifelineFifty');
    triggerLifelinePulse(e.currentTarget, '#f97316');
    activateLifelineFifty();
  };

  const handlePhoneAFriendWithSound = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const companion = activateLifelinePhone();
    if (companion) {
      triggerLifelinePulse(e.currentTarget, '#3b82f6');
      // Try to play companion voice file first
      let voicePlayed = false;
      if (companion.voiceFile) {
        voicePlayed = await audio.playCompanionVoice(companion.voiceFile);
      }
      // Fall back to oscillator call sound if no voice file found
      if (!voicePlayed) {
        audio.playSoundEffect('lifelinePhone');
      }
    }
  };

  const handleAskAudienceWithSound = (e: React.MouseEvent<HTMLButtonElement>) => {
    audio.playSoundEffect('lifelineAudience');
    triggerLifelinePulse(e.currentTarget, '#14b8a6');
    activateLifelineAudience();
  };

  const handleTakeMoneyWithSound = (_e: React.MouseEvent<HTMLButtonElement>) => {
    audio.playSoundEffect('takeMoneyButton');
    audio.playTakeMoney();
    // Coins are now triggered from EndScreen at trophy icon position
    takeMoneyAction();
  };

  /** Get dynamic styling for answer buttons */
  const getAnswerStyle = (displayIndex: number): string => {
    const base =
      'relative px-4 py-3 text-left transition-all duration-300 ' +
      'cursor-pointer text-sm border-4 ';

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
      const correct = questionData.correct;

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

  const questionNumber = currentQuestion + 1;
  const formattedQuestionNumber = String(questionNumber).padStart(2, '0');
  const questionHeaderText = config.strings.questionHeader.replace(
    '{n}',
    `\u00A0${formattedQuestionNumber}`
  );

  const headerTextClass = theme.textHeader ?? theme.textSecondary;

  const lifelineBase =
    'shine-button lifeline-btn px-3 py-2 text-sm border-3 h-12 w-full min-w-[132px] ' +
    'flex items-center justify-center gap-2';

  // Animate lifeline result panel in/out so it doesn't pop abruptly
  const LIFELINE_RESULT_EXIT_MS = 140;
  const [displayedLifelineResult, setDisplayedLifelineResult] =
    useState<LifelineResult>(lifelineResult);
  const [lifelineResultExiting, setLifelineResultExiting] = useState(false);
  const lifelineResultsEqual = (a: LifelineResult, b: LifelineResult) => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    if (a.type !== b.type) return false;
    if (a.type === 'phone' && b.type === 'phone') {
      return a.name === b.name && a.text === b.text;
    }
    if (a.type === 'audience' && b.type === 'audience') {
      return (
        a.percentages.length === b.percentages.length &&
        a.percentages.every((value, idx) => value === b.percentages[idx])
      );
    }
    return false;
  };

  useEffect(() => {
    if (lifelineResultsEqual(lifelineResult, displayedLifelineResult)) {
      setLifelineResultExiting(false);
      return;
    }

    if (!displayedLifelineResult) {
      if (lifelineResult) {
        setDisplayedLifelineResult(lifelineResult);
      }
      setLifelineResultExiting(false);
      return;
    }

    setLifelineResultExiting(true);
    const timeout = setTimeout(() => {
      setDisplayedLifelineResult(lifelineResult);
      setLifelineResultExiting(false);
    }, LIFELINE_RESULT_EXIT_MS);

    return () => clearTimeout(timeout);
  }, [lifelineResult, displayedLifelineResult]);

  return (
    <div className="screen-transition">
      {/* Header */}
      <HeaderPanel
        config={config}
        theme={theme}
        slideshowScreen="play"
        campaignId={gameState.selectedCampaign?.id}
        difficulty={difficultyLevel}
        isMusicPlaying={audio.isMusicPlaying}
        onToggleMusic={audio.toggleMusic}
      />

      {/* Game Area */}
      <div className="grid md:grid-cols-4 gap-3 animate-slide-in stagger-2">
        <div className="md:col-span-3 space-y-3">
          {/* Question Panel */}
          <Panel className="p-1">
            <PanelHeader align="between">
              <span className="flex items-baseline gap-2 font-semibold uppercase tracking-wide">
                {questionHeaderText}
              </span>
              <span
                className={`${headerTextClass} font-bold flex items-center gap-1`}
              >
                <CoinIcon />
                {prizes[currentQuestion]}
              </span>
            </PanelHeader>
            <div className="p-4">
              <p
                className={`${theme.textAccent} text-base leading-relaxed`}
              >
                {questionData.question}
              </p>
            </div>
          </Panel>

          {/* Answer Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {shuffledAnswers.map((originalIndex, displayIndex) => (
              <button
                key={displayIndex}
                onClick={(e) => handleAnswerWithSound(displayIndex, e)}
                disabled={
                  selectedAnswer !== null ||
                  eliminatedAnswers.includes(displayIndex)
                }
                className={`shine-button answer-btn ${getAnswerStyle(displayIndex)}`}
                style={{ borderStyle: 'ridge' }}
              >
                <span
                  ref={(el) => { answerIndexRefs.current[displayIndex] = el; }}
                  className={`${theme.textPrimary} mr-2 font-bold`}
                >
                  [{['A', 'B', 'C', 'D'][displayIndex]}]
                </span>
                {questionData.answers[originalIndex]}
              </button>
            ))}
          </div>

          {/* Lifelines Panel */}
          <Panel className="p-1 mt-1 animate-slide-in stagger-3">
            <div
              className="grid gap-2 p-3 justify-center w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            >
              <button
                onClick={handleFiftyFiftyWithSound}
                disabled={!lifelineAvailability.fifty || selectedAnswer !== null}
                className={`${lifelineBase} ${
                  lifelineAvailability.fifty && selectedAnswer === null
                    ? 'bg-gradient-to-b from-orange-700 to-orange-900 border-orange-500 text-orange-100'
                    : 'bg-stone-950 border-stone-800 text-stone-600 cursor-not-allowed'
                }`}
                style={{
                  borderStyle: 'ridge',
                  ['--lifeline-glow' as string]: 'rgba(249, 115, 22, 0.5)',
                  boxShadow:
                    lifelineAvailability.fifty && selectedAnswer === null
                      ? '0 0 15px rgba(249, 115, 22, 0.4)'
                      : 'none',
                }}
              >
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-6 h-6 flex items-center justify-center">
                    {lifelineConfigFifty.icon}
                  </span>
                  <span className="text-left">{lifelineConfigFifty.name}</span>
                </span>
              </button>
              <button
                onClick={handlePhoneAFriendWithSound}
                disabled={!lifelineAvailability.phone || selectedAnswer !== null}
                className={`${lifelineBase} ${
                  lifelineAvailability.phone && selectedAnswer === null
                    ? 'bg-gradient-to-b from-blue-700 to-blue-900 border-blue-500 text-blue-100'
                    : 'bg-stone-950 border-stone-800 text-stone-600 cursor-not-allowed'
                }`}
                style={{
                  borderStyle: 'ridge',
                  ['--lifeline-glow' as string]: 'rgba(59, 130, 246, 0.5)',
                  boxShadow:
                    lifelineAvailability.phone && selectedAnswer === null
                      ? '0 0 15px rgba(59, 130, 246, 0.4)'
                      : 'none',
                }}
              >
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-6 h-6 flex items-center justify-center">
                    {lifelineConfigPhone.icon}
                  </span>
                  <span className="text-left">{lifelineConfigPhone.name}</span>
                </span>
              </button>
              <button
                onClick={handleAskAudienceWithSound}
                disabled={!lifelineAvailability.audience || selectedAnswer !== null}
                className={`${lifelineBase} ${
                  lifelineAvailability.audience && selectedAnswer === null
                    ? 'bg-gradient-to-b from-teal-700 to-teal-900 border-teal-500 text-teal-100'
                    : 'bg-stone-950 border-stone-800 text-stone-600 cursor-not-allowed'
                }`}
                style={{
                  borderStyle: 'ridge',
                  ['--lifeline-glow' as string]: 'rgba(20, 184, 166, 0.5)',
                  boxShadow:
                    lifelineAvailability.audience && selectedAnswer === null
                      ? '0 0 15px rgba(20, 184, 166, 0.4)'
                      : 'none',
                }}
              >
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-6 h-6 flex items-center justify-center">
                    {lifelineConfigAudience.icon}
                  </span>
                  <span className="text-left">{lifelineConfigAudience.name}</span>
                </span>
              </button>
              <button
                onClick={handleTakeMoneyWithSound}
                disabled={currentQuestion === 0 || selectedAnswer !== null}
                className={`${lifelineBase} ${
                  currentQuestion > 0 && selectedAnswer === null
                    ? 'bg-gradient-to-b from-yellow-700 to-yellow-900 border-yellow-600 text-yellow-100'
                    : 'bg-stone-950 border-stone-800 text-stone-600 cursor-not-allowed'
                }`}
                style={{
                  borderStyle: 'ridge',
                  ['--lifeline-glow' as string]: 'rgba(234, 179, 8, 0.5)',
                  boxShadow:
                    currentQuestion > 0 && selectedAnswer === null
                      ? '0 0 15px rgba(234, 179, 8, 0.4)'
                      : 'none',
                }}
              >
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-6 h-6 flex items-center justify-center">
                    {config.lifelines.takeMoney.icon}
                  </span>
                  <span className="text-left">{config.lifelines.takeMoney.name}</span>
                </span>
              </button>
            </div>
          </Panel>

          {/* Lifeline Result Display */}
          {displayedLifelineResult && (
            <Panel
              className={`p-1 mt-1 ${
                lifelineResultExiting
                  ? 'animate-dust-out'
                  : 'animate-slide-in stagger-4'
              }`}
            >
              <PanelHeader>
                {displayedLifelineResult.type === 'phone'
                  ? (config.strings.lifelinePhoneHeader ??
                    config.strings.hintPhoneHeader)
                  : (config.strings.lifelineAudienceHeader ??
                    config.strings.hintAudienceHeader)}
              </PanelHeader>
              <div className="p-3">
                {displayedLifelineResult.type === 'phone' && (
                  <div>
                    <p className="text-amber-400 text-xs mb-1 italic">
                      <PhoneLifelineIcon />{' '}
                      {(config.strings.lifelineSenderLabel ??
                        config.strings.hintSenderLabel)}{' '}
                      {displayedLifelineResult.name}
                    </p>
                    <p className="text-amber-300 italic">
                      {displayedLifelineResult.text}
                    </p>
                  </div>
                )}
                {displayedLifelineResult.type === 'audience' && (
                  <div>
                    <div className="grid grid-cols-4 gap-2">
                      {displayedLifelineResult.percentages.map((p, i) => (
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
                          <span
                            className={`text-xs ${theme.textPrimary}`}
                          >
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

        </div>

        {/* Prize Ladder */}
        <Panel className="p-1 h-fit">
          <PanelHeader>{config.strings.prizesHeader}</PanelHeader>
          <div className="p-2 space-y-1">
            {[...prizes].reverse().map((prize: string, reverseIndex: number) => {
              // Convert reverse index to actual question index
              const index = totalQuestions - 1 - reverseIndex;
              const questionNumber = index + 1;
              const isGuaranteed = guaranteedPrizes.includes(index);
              const isCurrent = index === currentQuestion;
              const isPassed = index < currentQuestion;
              // Calculate difficulty based on position (1/3, 2/3, 3/3)
              const fraction = index / totalQuestions;
              const difficultyLevel =
                fraction < 1 / 3 ? 1 : fraction < 2 / 3 ? 2 : 3;

              return (
                <div
                  key={index}
                  className={`text-xs px-2 py-1 relative transition-all border-l-4 prize-row ${
                    isCurrent
                      ? `${theme.bgPrizeCurrent} ${theme.textSecondary} ${theme.borderLight} shadow-lg prize-row-current`
                      : isPassed
                        ? `${theme.bgPrizePassed} ${theme.textMuted} ${theme.border}`
                        : isGuaranteed
                          ? 'bg-yellow-950/40 text-yellow-600 border-yellow-700'
                          : 'text-stone-300 border-stone-700'
                  }`}
                  data-active={isCurrent ? 'true' : 'false'}
                  data-passed={isPassed ? 'true' : 'false'}
                  style={
                    isCurrent
                      ? {
                          boxShadow: `0 0 15px ${theme.glow}`,
                          borderStyle: 'solid',
                        }
                      : { borderStyle: 'solid' }
                  }
                >
                  <span className="prize-number font-mono">
                    {String(questionNumber).padStart(2, '0')}
                  </span>
                  <span className="prize-value font-mono">
                    {prize}
                  </span>
                  <span className="prize-stars">
                    {isGuaranteed && (
                      <span
                        className="text-yellow-500"
                        title={`${difficultyLevel}★`}
                      >
                        {'★'.repeat(difficultyLevel)}
                      </span>
                    ) || <span className="opacity-0">★★★</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default GameScreen;
