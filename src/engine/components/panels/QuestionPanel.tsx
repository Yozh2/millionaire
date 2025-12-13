import type { ComponentType } from 'react';
import type { ThemeColors } from '../../types';
import { Panel, PanelHeader } from '../ui';

interface QuestionPanelProps {
  headerText: string;
  prizeText: string;
  questionText: string;
  CoinIcon: ComponentType;
  theme: ThemeColors;
}

export function QuestionPanel({
  headerText,
  prizeText,
  questionText,
  CoinIcon,
  theme,
}: QuestionPanelProps) {
  const headerTextClass = theme.textHeader ?? theme.textSecondary;

  return (
    <Panel className="p-1">
      <PanelHeader align="between">
        <span className="flex items-baseline gap-2 font-semibold uppercase tracking-wide">
          {headerText}
        </span>
        <span className={`${headerTextClass} font-bold flex items-center gap-1`}>
          <CoinIcon />
          {prizeText}
        </span>
      </PanelHeader>
      <div className="p-4">
        <p className={`${theme.textAccent} text-base leading-relaxed`}>
          {questionText}
        </p>
      </div>
    </Panel>
  );
}

export default QuestionPanel;

