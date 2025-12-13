import type { MouseEvent, ReactNode } from 'react';
import { BaseButton } from './BaseButton';

interface LifelineButtonProps {
  icon: ReactNode;
  label: string;
  disabled?: boolean;
  className: string;
  glow: string;
  boxShadow: string;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

export function LifelineButton({
  icon,
  label,
  disabled,
  className,
  glow,
  boxShadow,
  onClick,
}: LifelineButtonProps) {
  return (
    <BaseButton
      disabled={disabled}
      onClick={onClick}
      className={`glare lifeline-btn ${className}`}
      style={{
        borderStyle: 'ridge',
        ['--lifeline-glow' as string]: glow,
        boxShadow,
      }}
    >
      <span className="flex items-center gap-2 justify-center">
        <span className="w-6 h-6 flex items-center justify-center">{icon}</span>
        <span className="text-left">{label}</span>
      </span>
    </BaseButton>
  );
}

export default LifelineButton;

