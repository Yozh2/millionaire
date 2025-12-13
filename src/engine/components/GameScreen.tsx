/**
 * GameScreen - Main gameplay screen with question, answers, lifelines
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { GameConfig, ThemeColors, QuestionDifficulty, EffectsAPI, LifelineResult } from '../types';
import { UseGameStateReturn } from '../hooks/useGameState';
import { UseAudioReturn } from '../hooks/useAudio';
import { HeaderPanel } from './HeaderPanel';
import {
  DefaultCoinIcon,
  DefaultPhoneHintIcon,
} from './DefaultIcons';
import { AnswersPanel } from './panels/AnswersPanel';
import { LifelinesPanel } from './panels/LifelinesPanel';
import { LifelineResultPanel } from './panels/LifelineResultPanel';
import { PrizeLadderPanel } from './panels/PrizeLadderPanel';
import { QuestionPanel } from './panels/QuestionPanel';

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

  const questionNumber = currentQuestion + 1;
  const formattedQuestionNumber = String(questionNumber).padStart(2, '0');
  const questionHeaderText = config.strings.questionHeader.replace(
    '{n}',
    `\u00A0${formattedQuestionNumber}`
  );

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
          <QuestionPanel
            headerText={questionHeaderText}
            prizeText={prizes[currentQuestion]}
            questionText={questionData.question}
            CoinIcon={CoinIcon}
            theme={theme}
          />

          <AnswersPanel
            answers={questionData.answers}
            correctAnswerIndex={questionData.correct}
            shuffledAnswers={shuffledAnswers}
            eliminatedAnswers={eliminatedAnswers}
            selectedAnswer={selectedAnswer}
            theme={theme}
            answerIndexRefs={answerIndexRefs}
            onAnswerClick={handleAnswerWithSound}
          />

          <LifelinesPanel
            selectedAnswer={selectedAnswer}
            lifelineAvailability={lifelineAvailability}
            lifelineConfigFifty={lifelineConfigFifty}
            lifelineConfigPhone={lifelineConfigPhone}
            lifelineConfigAudience={lifelineConfigAudience}
            onFifty={handleFiftyFiftyWithSound}
            onPhone={handlePhoneAFriendWithSound}
            onAudience={handleAskAudienceWithSound}
          />

          <LifelineResultPanel
            displayed={displayedLifelineResult}
            exiting={lifelineResultExiting}
            config={config}
            theme={theme}
            PhoneLifelineIcon={PhoneLifelineIcon}
          />

        </div>

        {/* Prize Ladder */}
        <PrizeLadderPanel
          prizesHeader={config.strings.prizesHeader}
          prizes={prizes}
          guaranteedPrizes={guaranteedPrizes}
          currentQuestion={currentQuestion}
          totalQuestions={totalQuestions}
          theme={theme}
          takeMoneyConfig={config.lifelines.takeMoney}
          takeMoneyDisabled={currentQuestion === 0 || selectedAnswer !== null}
          onTakeMoney={handleTakeMoneyWithSound}
        />
      </div>
    </div>
  );
}

export default GameScreen;
