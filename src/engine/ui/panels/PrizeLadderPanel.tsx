import type { MouseEvent } from 'react';
import type { ActionConfig, ThemeColors } from '@engine/types';
import { LifelineButton } from '../components/buttons';
import { Panel, PanelHeader } from '../components/panel';

interface PrizeLadderPanelProps {
  prizesHeader: string;
  prizes: string[];
  guaranteedPrizes: number[];
  currentQuestion: number;
  totalQuestions: number;
  theme: ThemeColors;
  takeMoneyConfig: ActionConfig;
  takeMoneyDisabled: boolean;
  onTakeMoney: (e: MouseEvent<HTMLButtonElement>) => void;
}

export function PrizeLadderPanel({
  prizesHeader,
  prizes,
  guaranteedPrizes,
  currentQuestion,
  totalQuestions,
  theme,
  takeMoneyConfig,
  takeMoneyDisabled,
  onTakeMoney,
}: PrizeLadderPanelProps) {
  const takeMoneyBase =
    'px-3 py-2 text-sm border-3 h-12 w-full flex items-center justify-center gap-2';

  const prizeTextCurrent = theme.prizeTextCurrent ?? theme.textSecondary;
  const prizeTextPassed = theme.prizeTextPassed ?? theme.textMuted;
  const prizeTextFuture = theme.prizeTextFuture ?? 'text-stone-300';
  const prizeBgGuaranteed = theme.prizeBgGuaranteed ?? 'bg-yellow-950/40';
  const prizeTextGuaranteed = theme.prizeTextGuaranteed ?? 'text-yellow-600';
  const prizeBorderGuaranteed = theme.prizeBorderGuaranteed ?? 'border-yellow-700';

  return (
    <Panel className="p-1 h-fit">
      <PanelHeader>{prizesHeader}</PanelHeader>
      <div className="p-2 space-y-1">
        {[...prizes].reverse().map((prize: string, reverseIndex: number) => {
          const index = totalQuestions - 1 - reverseIndex;
          const questionNumber = index + 1;
          const isGuaranteed = guaranteedPrizes.includes(index);
          const isCurrent = index === currentQuestion;
          const isPassed = index < currentQuestion;
          const fraction = index / totalQuestions;
          const difficultyLevel =
            fraction < 1 / 3 ? 1 : fraction < 2 / 3 ? 2 : 3;

          return (
            <div
              key={index}
              className={`text-xs px-2 py-1 relative transition-all border-l-4 prize-row ${
                isCurrent
                  ? `${theme.bgPrizeCurrent} ${prizeTextCurrent} ${theme.prizeBorderCurrent ?? theme.borderLight} shadow-lg prize-row-current`
                  : isPassed
                    ? `${theme.bgPrizePassed} ${prizeTextPassed} ${theme.prizeBorderPassed ?? theme.border}`
                    : isGuaranteed
                      ? `${prizeBgGuaranteed} ${prizeTextGuaranteed} ${prizeBorderGuaranteed}`
                      : `${prizeTextFuture} border-stone-700`
              }`}
              data-active={isCurrent ? 'true' : 'false'}
              data-passed={isPassed ? 'true' : 'false'}
              style={
                isCurrent
                  ? {
                      boxShadow: `0 0 15px ${theme.prizeGlowCurrent ?? theme.glow}`,
                      borderStyle: 'solid',
                    }
                  : { borderStyle: 'solid' }
              }
            >
              <span className="prize-number font-mono">
                {String(questionNumber).padStart(2, '0')}
              </span>
              <span className="prize-value font-mono">{prize}</span>
              <span className="prize-stars">
                {isGuaranteed && (
                  <span className="text-yellow-500" title={`${difficultyLevel}★`}>
                    {'★'.repeat(difficultyLevel)}
                  </span>
                )}
                {!isGuaranteed && <span className="opacity-0">★★★</span>}
              </span>
            </div>
          );
        })}
      </div>

      <div className="p-2 pt-1">
        <LifelineButton
          onClick={onTakeMoney}
          disabled={takeMoneyDisabled}
          className={`${takeMoneyBase} ${
            !takeMoneyDisabled
              ? 'bg-gradient-to-b from-yellow-700 to-yellow-900 border-yellow-600 text-yellow-100'
              : 'bg-stone-950 border-stone-800 text-stone-600 cursor-not-allowed'
          }`}
          glow="rgba(234, 179, 8, 0.5)"
          boxShadow={!takeMoneyDisabled ? '0 0 15px rgba(234, 179, 8, 0.4)' : 'none'}
          icon={takeMoneyConfig.icon}
          label={takeMoneyConfig.name}
        />
      </div>
    </Panel>
  );
}

export default PrizeLadderPanel;
