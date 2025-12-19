import type { ComponentType } from 'react';
import type { ThemeColors } from '@engine/types';

interface LifelinePhonePanelProps {
  theme: ThemeColors;
  icon: ComponentType;
  senderLabel: string;
  name: string;
  text: string;
}

export function LifelinePhonePanel({
  theme,
  icon: Icon,
  senderLabel,
  name,
  text,
}: LifelinePhonePanelProps) {
  return (
    <div>
      <p className={`${theme.textAccent} text-xs mb-1 italic`}>
        <Icon /> {senderLabel} {name}
      </p>
      <p className={`${theme.textAccent} italic`}>{text}</p>
    </div>
  );
}

export default LifelinePhonePanel;
