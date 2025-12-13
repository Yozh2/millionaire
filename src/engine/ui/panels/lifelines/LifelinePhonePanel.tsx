import type { ComponentType } from 'react';

interface LifelinePhonePanelProps {
  icon: ComponentType;
  senderLabel: string;
  name: string;
  text: string;
}

export function LifelinePhonePanel({
  icon: Icon,
  senderLabel,
  name,
  text,
}: LifelinePhonePanelProps) {
  return (
    <div>
      <p className="text-amber-400 text-xs mb-1 italic">
        <Icon /> {senderLabel} {name}
      </p>
      <p className="text-amber-300 italic">{text}</p>
    </div>
  );
}

export default LifelinePhonePanel;
