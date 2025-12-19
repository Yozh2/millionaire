import type { LifelineHostResult } from '@engine/types';
import type { ThemeColors } from '@engine/types';

interface LifelineHostPanelProps {
  theme: ThemeColors;
  icon: string;
  result: LifelineHostResult;
}

export function LifelineHostPanel({ theme, icon, result }: LifelineHostPanelProps) {
  const letter = ['A', 'B', 'C', 'D'][result.suggestedDisplayIndex] ?? '?';
  const confidenceText =
    result.confidence === 'confident' ? 'Уверенно' : 'Не уверен';

  return (
    <div className="flex items-start gap-3">
      <div className="text-4xl leading-none mt-0.5">{icon}</div>
      <div className="space-y-1">
        <div className={`text-xs uppercase tracking-wide ${theme.textAccent}`}>
          {confidenceText}
        </div>
        <div className={`text-sm ${theme.textAccent}`}>
          Думаю, правильный ответ: <span className="font-bold">[{letter}]</span>
        </div>
        <div className={`text-sm ${theme.textAccent} italic truncate max-w-[520px]`}>
          {result.answerText}
        </div>
      </div>
    </div>
  );
}

export default LifelineHostPanel;
