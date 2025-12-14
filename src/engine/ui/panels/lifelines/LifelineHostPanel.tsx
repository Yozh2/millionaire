import type { LifelineHostResult } from '../../../types';

interface LifelineHostPanelProps {
  icon: string;
  result: LifelineHostResult;
}

export function LifelineHostPanel({ icon, result }: LifelineHostPanelProps) {
  const letter = ['A', 'B', 'C', 'D'][result.suggestedDisplayIndex] ?? '?';
  const confidenceText =
    result.confidence === 'confident' ? 'Уверенно' : 'Не уверен';

  return (
    <div className="flex items-start gap-3">
      <div className="text-4xl leading-none mt-0.5">{icon}</div>
      <div className="space-y-1">
        <div className="text-xs uppercase tracking-wide text-stone-400">
          {confidenceText}
        </div>
        <div className="text-sm text-stone-200">
          Думаю, правильный ответ: <span className="font-bold">[{letter}]</span>
        </div>
        <div className="text-sm text-stone-300 italic truncate max-w-[520px]">
          {result.answerText}
        </div>
      </div>
    </div>
  );
}

export default LifelineHostPanel;

