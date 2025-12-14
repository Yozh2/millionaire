import type { MouseEvent, ReactNode } from 'react';
import { BaseButton } from './BaseButton';

interface LifelineButtonProps {
  icon: ReactNode;
  label?: string;
  disabled?: boolean;
  className: string;
  glow: string;
  boxShadow: string;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  title?: string;
  ariaLabel?: string;
}

export function LifelineButton({
  icon,
  label,
  disabled,
  className,
  glow,
  boxShadow,
  onClick,
  title,
  ariaLabel,
}: LifelineButtonProps) {
  const hasLabel = !!label;
  return (
    <BaseButton
      disabled={disabled}
      onClick={onClick}
      title={title}
      aria-label={ariaLabel ?? title}
      className={`glare lifeline-btn ${className}`}
      style={{
        borderStyle: 'ridge',
        ['--lifeline-glow' as string]: glow,
        boxShadow,
      }}
    >
      {hasLabel ? (
        <span className="flex items-center gap-2 justify-center">
          <span className="w-6 h-6 flex items-center justify-center">{icon}</span>
          <span className="text-left">{label}</span>
        </span>
      ) : (
        <span className="flex items-center justify-center">
          <span className="w-7 h-7 flex items-center justify-center text-2xl">
            {icon}
          </span>
        </span>
      )}
    </BaseButton>
  );
}

export default LifelineButton;
