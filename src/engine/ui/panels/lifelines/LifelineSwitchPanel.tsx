import type { LifelineSwitchResult } from '@engine/types';
import type { ThemeColors } from '@engine/types';

interface LifelineSwitchPanelProps {
  theme: ThemeColors;
  icon: string;
  result: LifelineSwitchResult;
  text: string;
}

export function LifelineSwitchPanel({ theme, icon, text }: LifelineSwitchPanelProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-4xl leading-none">{icon}</div>
      <div className={`text-sm ${theme.textAccent}`}>{text}</div>
    </div>
  );
}

export default LifelineSwitchPanel;
