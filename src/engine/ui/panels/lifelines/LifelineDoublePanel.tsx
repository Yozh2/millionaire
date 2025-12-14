import type { LifelineDoubleResult } from '../../../types';

interface LifelineDoublePanelProps {
  icon: string;
  result: LifelineDoubleResult;
}

export function LifelineDoublePanel({ icon, result }: LifelineDoublePanelProps) {
  const text =
    result.stage === 'armed'
      ? 'Можно ошибиться один раз — и выбрать ответ повторно.'
      : 'Первый промах принят. Выбери ещё раз.';

  return (
    <div className="flex items-center gap-3">
      <div className="text-4xl leading-none">{icon}</div>
      <div className="text-sm text-stone-200">{text}</div>
    </div>
  );
}

export default LifelineDoublePanel;

