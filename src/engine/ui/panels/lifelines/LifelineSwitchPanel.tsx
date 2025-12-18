import type { LifelineSwitchResult } from '@engine/types';

interface LifelineSwitchPanelProps {
  icon: string;
  result: LifelineSwitchResult;
}

export function LifelineSwitchPanel({ icon }: LifelineSwitchPanelProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-4xl leading-none">{icon}</div>
      <div className="text-sm text-stone-200">
        Вопрос заменён. Продолжаем.
      </div>
    </div>
  );
}

export default LifelineSwitchPanel;
