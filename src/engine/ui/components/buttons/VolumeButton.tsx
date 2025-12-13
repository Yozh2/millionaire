import type { ReactNode } from 'react';
import { BaseButton } from './BaseButton';

interface VolumeButtonProps {
  title: string;
  onClick: () => void;
  children: ReactNode;
}

export function VolumeButton({ title, onClick, children }: VolumeButtonProps) {
  return (
    <BaseButton
      onClick={onClick}
      className="absolute top-3 right-3 text-2xl hover:scale-110 transition-transform"
      title={title}
      style={{ filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.6))' }}
    >
      {children}
    </BaseButton>
  );
}

export default VolumeButton;

