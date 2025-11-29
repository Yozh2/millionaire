/**
 * GameScreen - Main gameplay screen with question, answers, lifelines
 */

import { GameConfig, ThemeColors } from '../types';
import { UseGameStateReturn } from '../hooks/useGameState';
import { UseAudioReturn } from '../hooks/useAudio';
import { Panel, PanelHeader } from '../../components/ui';

// Default emoji-based icons
const DefaultCoinIcon = () => <span className="mr-1">🪙</span>;
const DefaultPhoneHintIcon = () => <span className="inline-block">📞</span>;
const DefaultAudienceHintIcon = () => <span className="inline-block">📊</span>;

interface GameScreenProps {
  config: GameConfig;
  gameState: UseGameStateReturn;
  audio: UseAudioReturn;
  theme: ThemeColors;
}

export function GameScreen({
  config,
  gameState,
  audio,
  theme,
}: GameScreenProps) {
  const {
    currentQuestion,
    questions,
    shuffledAnswers,
    eliminatedAnswers,
    selectedAnswer,
    hint,
    lifelines,
    handleAnswer,
    useFiftyFifty,
    usePhoneAFriend,
    useAskAudience,
    takeTheMoney,
  } = gameState;

  const questionData = questions[currentQuestion];
  const prizes = config.prizes.values;
  const guaranteedPrizes = config.prizes.guaranteed;

  // Get icons from config or use defaults
  const CoinIcon = config.icons?.coin || DefaultCoinIcon;
  const PhoneHintIcon = config.icons?.phoneHint || DefaultPhoneHintIcon;
  const AudienceHintIcon = config.icons?.audienceHint || DefaultAudienceHintIcon;

  // Wrapped handlers with sound effects
  const handleAnswerWithSound = async (displayIndex: number) => {
    audio.playSoundEffect('click');
    const result = await handleAnswer(displayIndex);
    if (result === 'correct') {
      // Play correct/next sound (oscillator if not defined in config)
      audio.playSoundEffect('correct');
    } else if (result === 'wrong') {
      audio.playSoundEffect('defeat');
      audio.playGameOver();
    }
  };

  const handleFiftyFiftyWithSound = () => {
    audio.playSoundEffect('hint');
    useFiftyFifty();
  };

  const handlePhoneAFriendWithSound = () => {
    const companion = usePhoneAFriend();
    if (companion) {
      // Play call sound first, then companion voice
      audio.playSoundEffect('call');
      // Small delay before voice to let the call sound start
      setTimeout(() => {
        if (companion.voiceFile) {
          audio.playCompanionVoice(companion.voiceFile);
        }
      }, 300);
    }
  };

  const handleAskAudienceWithSound = () => {
    audio.playSoundEffect('vote');
    useAskAudience();
  };

  const handleTakeMoneyWithSound = () => {
    audio.playSoundEffect('money');
    takeTheMoney();
  };

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

  return (
    <>
      {/* Header */}
      <Panel className="mb-4 p-1">
        <PanelHeader>{config.strings.headerTitle}</PanelHeader>
        <div className="p-4 text-center">
          {/* Music Toggle */}
          <div className="flex justify-end mb-2">
            <button
              onClick={audio.toggleMusic}
              className="text-2xl hover:scale-110 transition-transform"
              title={
                audio.isMusicPlaying
                  ? config.strings.musicOn
                  : config.strings.musicOff
              }
            >
              {audio.isMusicPlaying ? '🔊' : '🔇'}
            </button>
          </div>

          {/* Title */}
          <h1
            className={`text-2xl md:text-3xl font-bold tracking-wider mb-1 transition-colors duration-500 ${theme.textPrimary}`}
            style={{
              textShadow: `0 0 15px ${theme.glowColor}, 0 0 30px ${theme.glowSecondary}, 2px 2px 4px #000`,
              fontFamily: 'Georgia, serif',
            }}
          >
            {config.title}
          </h1>
          <h2
            className={`text-lg tracking-wide transition-colors duration-500 ${theme.textPrimary}`}
            style={{
              lineHeight: '1.5',
              fontFamily: 'Arial, sans-serif',
              fontStyle: 'italic',
            }}
          >
            {config.subtitle}
          </h2>

          {/* Campaign Icons */}
          {gameState.selectedCampaign && (
            <div className="flex justify-center gap-4 md:gap-6 mt-3 flex-wrap">
              {config.campaigns.map((campaign) => {
                const CampaignIcon = campaign.icon;
                const isActive = campaign.id === gameState.selectedCampaign?.id;
                return (
                  <div
                    key={campaign.id}
                    className={`flex items-center gap-1 transition-opacity ${
                      isActive ? 'opacity-100' : 'opacity-30'
                    }`}
                  >
                    <CampaignIcon />
                    <span
                      className="text-xs font-serif"
                      style={{ color: campaign.theme.glowColor }}
                    >
                      {campaign.name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Panel>

      {/* Game Area */}
      <div className="grid md:grid-cols-4 gap-3">
        <div className="md:col-span-3 space-y-3">
          {/* Question Panel */}
          <Panel className="p-1">
            <PanelHeader align="between">
              <span>
                {config.strings.questionHeader.replace(
                  '{n}',
                  String(currentQuestion + 1)
                )}
              </span>
              <span>
                {config.strings.difficultyLabel}:{' '}
                {'★'.repeat(questionData.difficulty)}
                {'☆'.repeat(3 - questionData.difficulty)}
              </span>
            </PanelHeader>
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-amber-400 text-xs font-serif italic">
                  {config.strings.progressLabel}: {currentQuestion + 1}/
                  {prizes.length}
                </span>
                <span
                  className={`${theme.textPrimary} font-bold flex items-center font-serif`}
                >
                  <CoinIcon />
                  {prizes[currentQuestion]}
                </span>
              </div>
              <p
                className={`${theme.textAccent} text-base leading-relaxed font-serif`}
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
                onClick={() => handleAnswerWithSound(displayIndex)}
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
                {questionData.answers[originalIndex]}
              </button>
            ))}
          </div>

          {/* Hint Display */}
          {hint && (
            <Panel className="p-1">
              <PanelHeader>
                {hint.type === 'phone'
                  ? config.strings.hintPhoneHeader
                  : config.strings.hintAudienceHeader}
              </PanelHeader>
              <div className="p-3">
                {hint.type === 'phone' && (
                  <div>
                    <p className="text-amber-400 text-xs mb-1 font-serif italic">
                      <PhoneHintIcon /> {config.strings.hintSenderLabel}{' '}
                      {hint.name}
                    </p>
                    <p className="text-amber-300 italic font-serif">
                      "{hint.text}"
                    </p>
                  </div>
                )}
                {hint.type === 'audience' && (
                  <div>
                    <p className="text-amber-400 text-xs mb-2 font-serif italic">
                      <AudienceHintIcon /> {config.strings.hintAudienceLabel}
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {hint.percentages.map((p, i) => (
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
                            className={`text-xs ${theme.textPrimary} font-serif`}
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

          {/* Lifelines Panel */}
          <Panel className="p-1">
            <PanelHeader>{config.strings.lifelinesHeader}</PanelHeader>
            <div className="flex flex-wrap gap-2 p-3 justify-center">
              <button
                onClick={handleFiftyFiftyWithSound}
                disabled={!lifelines.fiftyFifty || selectedAnswer !== null}
                className={`px-4 py-2 text-sm transition-all border-3 font-serif ${
                  lifelines.fiftyFifty && selectedAnswer === null
                    ? 'bg-gradient-to-b from-orange-700 to-orange-900 border-orange-500 text-orange-100 hover:from-orange-600'
                    : 'bg-stone-950 border-stone-800 text-stone-600 cursor-not-allowed'
                }`}
                style={{
                  borderStyle: 'ridge',
                  boxShadow:
                    lifelines.fiftyFifty && selectedAnswer === null
                      ? '0 0 15px rgba(249, 115, 22, 0.4)'
                      : 'none',
                }}
              >
                {config.lifelines.fiftyFifty.icon} {config.lifelines.fiftyFifty.name}
              </button>
              <button
                onClick={handlePhoneAFriendWithSound}
                disabled={!lifelines.phoneAFriend || selectedAnswer !== null}
                className={`px-4 py-2 text-sm transition-all border-3 font-serif ${
                  lifelines.phoneAFriend && selectedAnswer === null
                    ? 'bg-gradient-to-b from-blue-700 to-blue-900 border-blue-500 text-blue-100 hover:from-blue-600'
                    : 'bg-stone-950 border-stone-800 text-stone-600 cursor-not-allowed'
                }`}
                style={{
                  borderStyle: 'ridge',
                  boxShadow:
                    lifelines.phoneAFriend && selectedAnswer === null
                      ? '0 0 15px rgba(59, 130, 246, 0.4)'
                      : 'none',
                }}
              >
                {config.lifelines.phoneAFriend.icon}{' '}
                {config.lifelines.phoneAFriend.name}
              </button>
              <button
                onClick={handleAskAudienceWithSound}
                disabled={!lifelines.askAudience || selectedAnswer !== null}
                className={`px-4 py-2 text-sm transition-all border-3 font-serif ${
                  lifelines.askAudience && selectedAnswer === null
                    ? 'bg-gradient-to-b from-teal-700 to-teal-900 border-teal-500 text-teal-100 hover:from-teal-600'
                    : 'bg-stone-950 border-stone-800 text-stone-600 cursor-not-allowed'
                }`}
                style={{
                  borderStyle: 'ridge',
                  boxShadow:
                    lifelines.askAudience && selectedAnswer === null
                      ? '0 0 15px rgba(20, 184, 166, 0.4)'
                      : 'none',
                }}
              >
                {config.lifelines.askAudience.icon}{' '}
                {config.lifelines.askAudience.name}
              </button>
              <button
                onClick={handleTakeMoneyWithSound}
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
                {config.lifelines.takeMoney.icon}{' '}
                {config.lifelines.takeMoney.name}
              </button>
            </div>
          </Panel>
        </div>

        {/* Prize Ladder */}
        <Panel className="p-1 h-fit">
          <PanelHeader>{config.strings.prizesHeader}</PanelHeader>
          <div className="p-2 space-y-1">
            {[...prizes].reverse().map((prize: string, reverseIndex: number) => {
              // Convert reverse index to actual question index
              const index = prizes.length - 1 - reverseIndex;
              const questionNumber = index + 1;
              const isGuaranteed = guaranteedPrizes.includes(index);
              const isCurrent = index === currentQuestion;
              const isPassed = index < currentQuestion;
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
                      <span
                        className="text-yellow-500"
                        title={`${config.strings.difficultyLabel} ${difficultyLevel}★`}
                      >
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
    </>
  );
}

export default GameScreen;
