import type { LifelineDoubleResult } from '@engine/types';
import type { ThemeColors } from '@engine/types';

interface LifelineDoublePanelProps {
  theme: ThemeColors;
  icon: string;
  result: LifelineDoubleResult;
  text: string;
}

export function LifelineDoublePanel({ theme, icon, text }: LifelineDoublePanelProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-4xl leading-none">{icon}</div>
      <div className={`text-sm ${theme.textAccent}`}>{text}</div>
    </div>
  );
}

export default LifelineDoublePanel;
