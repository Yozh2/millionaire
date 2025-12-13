import type { ReactNode, MouseEvent } from 'react';
import { BaseButton } from './BaseButton';

interface AnswerButtonProps {
  children: ReactNode;
  disabled?: boolean;
  className: string;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

export function AnswerButton({
  children,
  disabled,
  className,
  onClick,
}: AnswerButtonProps) {
  return (
    <BaseButton
      disabled={disabled}
      onClick={onClick}
      className={`glare answer-btn ${className}`}
      style={{ borderStyle: 'ridge' }}
    >
      {children}
    </BaseButton>
  );
}

export default AnswerButton;

