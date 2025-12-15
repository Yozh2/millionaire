import type { PointerEvent, ReactNode } from 'react';
import type { ThemeColors } from '../../../types';
import { BaseButton } from './BaseButton';

interface ActionButtonProps {
  children: ReactNode;
  theme: ThemeColors;
  disabled?: boolean;
  className?: string;
  onClick: () => void;
  onPointerDown?: (e: PointerEvent<HTMLButtonElement>) => void;
}

export function ActionButton({
  children,
  theme,
  disabled,
  className = '',
  onClick,
  onPointerDown,
}: ActionButtonProps) {
  return (
    <BaseButton
      disabled={disabled}
      onClick={onClick}
      onPointerDown={onPointerDown}
      className={`glare action-btn px-8 py-3 font-bold text-lg tracking-wide border-4 ${className}`}
      style={{
        ['--btn-glow' as string]: theme.glow,
        touchAction: 'manipulation',
        boxShadow: disabled
          ? 'none'
          : `0 5px 20px rgba(0, 0, 0, 0.3), 0 0 25px ${theme.glow}`,
        borderStyle: 'ridge',
        textShadow: disabled ? 'none' : '0 2px 4px rgba(0,0,0,0.8)',
      }}
    >
      {children}
    </BaseButton>
  );
}

export default ActionButton;
