import type { MouseEvent } from 'react';
import type { LifelineConfig } from '../../types';
import { LifelineButton } from '../components/buttons';
import { Panel } from '../components/panel';

interface LifelinesPanelProps {
  selectedAnswer: number | null;
  lifelineAvailability: {
    fifty: boolean;
    phone: boolean;
    audience: boolean;
  };
  lifelineConfigFifty: LifelineConfig;
  lifelineConfigPhone: LifelineConfig;
  lifelineConfigAudience: LifelineConfig;
  onFifty: (e: MouseEvent<HTMLButtonElement>) => void;
  onPhone: (e: MouseEvent<HTMLButtonElement>) => void;
  onAudience: (e: MouseEvent<HTMLButtonElement>) => void;
}

export function LifelinesPanel({
  selectedAnswer,
  lifelineAvailability,
  lifelineConfigFifty,
  lifelineConfigPhone,
  lifelineConfigAudience,
  onFifty,
  onPhone,
  onAudience,
}: LifelinesPanelProps) {
  const lifelineBase =
    'px-3 py-2 text-sm border-3 h-12 w-full min-w-[132px] flex items-center justify-center gap-2';

  return (
    <Panel className="p-1 mt-1 animate-slide-in stagger-3">
      <div className="grid gap-2 p-3 justify-center w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <LifelineButton
          onClick={onFifty}
          disabled={!lifelineAvailability.fifty || selectedAnswer !== null}
          className={`${lifelineBase} ${
            lifelineAvailability.fifty && selectedAnswer === null
              ? 'bg-gradient-to-b from-orange-700 to-orange-900 border-orange-500 text-orange-100'
              : 'bg-stone-950 border-stone-800 text-stone-600 cursor-not-allowed'
          }`}
          glow="rgba(249, 115, 22, 0.5)"
          boxShadow={
            lifelineAvailability.fifty && selectedAnswer === null
              ? '0 0 15px rgba(249, 115, 22, 0.4)'
              : 'none'
          }
          icon={lifelineConfigFifty.icon}
          label={lifelineConfigFifty.name}
        />

        <LifelineButton
          onClick={onPhone}
          disabled={!lifelineAvailability.phone || selectedAnswer !== null}
          className={`${lifelineBase} ${
            lifelineAvailability.phone && selectedAnswer === null
              ? 'bg-gradient-to-b from-blue-700 to-blue-900 border-blue-500 text-blue-100'
              : 'bg-stone-950 border-stone-800 text-stone-600 cursor-not-allowed'
          }`}
          glow="rgba(59, 130, 246, 0.5)"
          boxShadow={
            lifelineAvailability.phone && selectedAnswer === null
              ? '0 0 15px rgba(59, 130, 246, 0.4)'
              : 'none'
          }
          icon={lifelineConfigPhone.icon}
          label={lifelineConfigPhone.name}
        />

        <LifelineButton
          onClick={onAudience}
          disabled={!lifelineAvailability.audience || selectedAnswer !== null}
          className={`${lifelineBase} ${
            lifelineAvailability.audience && selectedAnswer === null
              ? 'bg-gradient-to-b from-teal-700 to-teal-900 border-teal-500 text-teal-100'
              : 'bg-stone-950 border-stone-800 text-stone-600 cursor-not-allowed'
          }`}
          glow="rgba(20, 184, 166, 0.5)"
          boxShadow={
            lifelineAvailability.audience && selectedAnswer === null
              ? '0 0 15px rgba(20, 184, 166, 0.4)'
              : 'none'
          }
          icon={lifelineConfigAudience.icon}
          label={lifelineConfigAudience.name}
        />
      </div>
    </Panel>
  );
}

export default LifelinesPanel;
