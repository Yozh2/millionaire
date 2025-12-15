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
    host?: boolean;
    switch?: boolean;
    double?: boolean;
  };
  lifelineConfigFifty: LifelineConfig;
  lifelineConfigPhone: LifelineConfig;
  lifelineConfigAudience: LifelineConfig;
  lifelineConfigHost?: LifelineConfig;
  lifelineConfigSwitch?: LifelineConfig;
  lifelineConfigDouble?: LifelineConfig;
  onFifty: (e: MouseEvent<HTMLButtonElement>) => void;
  onPhone: (e: MouseEvent<HTMLButtonElement>) => void;
  onAudience: (e: MouseEvent<HTMLButtonElement>) => void;
  onHost?: (e: MouseEvent<HTMLButtonElement>) => void;
  onSwitch?: (e: MouseEvent<HTMLButtonElement>) => void;
  onDouble?: (e: MouseEvent<HTMLButtonElement>) => void;
}

export function LifelinesPanel({
  selectedAnswer,
  lifelineAvailability,
  lifelineConfigFifty,
  lifelineConfigPhone,
  lifelineConfigAudience,
  lifelineConfigHost,
  lifelineConfigSwitch,
  lifelineConfigDouble,
  onFifty,
  onPhone,
  onAudience,
  onHost,
  onSwitch,
  onDouble,
}: LifelinesPanelProps) {
  const lifelineBase =
    'px-3 py-2 text-sm border-3 h-12 w-full min-w-[132px] flex items-center justify-center gap-2';

  const isLifelineEnabled = (
    config: LifelineConfig | undefined,
    availability: boolean | undefined
  ) => !!config?.enabled && !!availability;

  const canUse =
    selectedAnswer === null;

  const optionalButtonsCount =
    (lifelineConfigHost?.enabled && onHost ? 1 : 0) +
    (lifelineConfigSwitch?.enabled && onSwitch ? 1 : 0) +
    (lifelineConfigDouble?.enabled && onDouble ? 1 : 0);

  const shownButtonsCount = 3 + optionalButtonsCount;
  const gridColsLg = shownButtonsCount === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3';

  return (
    <Panel className="p-1 mt-1 animate-slide-in stagger-3">
      <div className={`grid gap-2 p-3 justify-center w-full grid-cols-1 sm:grid-cols-2 ${gridColsLg}`}>
        <LifelineButton
          onClick={onFifty}
          disabled={!lifelineAvailability.fifty || !canUse}
          className={`${lifelineBase} ${
            lifelineAvailability.fifty && canUse
              ? 'bg-gradient-to-b from-orange-700 to-orange-900 border-orange-500 text-orange-100'
              : 'bg-stone-950 border-stone-800 text-stone-600 cursor-not-allowed'
          }`}
          glow="rgba(249, 115, 22, 0.5)"
          boxShadow={
            lifelineAvailability.fifty && canUse
              ? '0 0 15px rgba(249, 115, 22, 0.4)'
              : 'none'
          }
          icon={lifelineConfigFifty.icon}
          label={lifelineConfigFifty.name}
        />

        <LifelineButton
          onClick={onPhone}
          disabled={!lifelineAvailability.phone || !canUse}
          className={`${lifelineBase} ${
            lifelineAvailability.phone && canUse
              ? 'bg-gradient-to-b from-blue-700 to-blue-900 border-blue-500 text-blue-100'
              : 'bg-stone-950 border-stone-800 text-stone-600 cursor-not-allowed'
          }`}
          glow="rgba(59, 130, 246, 0.5)"
          boxShadow={
            lifelineAvailability.phone && canUse
              ? '0 0 15px rgba(59, 130, 246, 0.4)'
              : 'none'
          }
          icon={lifelineConfigPhone.icon}
          label={lifelineConfigPhone.name}
        />

        <LifelineButton
          onClick={onAudience}
          disabled={!lifelineAvailability.audience || !canUse}
          className={`${lifelineBase} ${
            lifelineAvailability.audience && canUse
              ? 'bg-gradient-to-b from-teal-700 to-teal-900 border-teal-500 text-teal-100'
              : 'bg-stone-950 border-stone-800 text-stone-600 cursor-not-allowed'
          }`}
          glow="rgba(20, 184, 166, 0.5)"
          boxShadow={
            lifelineAvailability.audience && canUse
              ? '0 0 15px rgba(20, 184, 166, 0.4)'
              : 'none'
          }
          icon={lifelineConfigAudience.icon}
          label={lifelineConfigAudience.name}
        />

        {lifelineConfigHost?.enabled && onHost && (
          <LifelineButton
            onClick={onHost}
            disabled={!isLifelineEnabled(lifelineConfigHost, lifelineAvailability.host) || !canUse}
            className={`${lifelineBase} ${
              isLifelineEnabled(lifelineConfigHost, lifelineAvailability.host) && canUse
                ? 'bg-gradient-to-b from-purple-700 to-purple-950 border-purple-500 text-purple-100'
                : 'bg-stone-950 border-stone-800 text-stone-600 cursor-not-allowed'
            }`}
            glow="rgba(168, 85, 247, 0.5)"
            boxShadow={
              isLifelineEnabled(lifelineConfigHost, lifelineAvailability.host) && canUse
                ? '0 0 15px rgba(168, 85, 247, 0.4)'
                : 'none'
            }
            icon={lifelineConfigHost.icon}
            label={lifelineConfigHost.name}
          />
        )}

        {lifelineConfigSwitch?.enabled && onSwitch && (
          <LifelineButton
            onClick={onSwitch}
            disabled={!isLifelineEnabled(lifelineConfigSwitch, lifelineAvailability.switch) || !canUse}
            className={`${lifelineBase} ${
              isLifelineEnabled(lifelineConfigSwitch, lifelineAvailability.switch) && canUse
                ? 'bg-gradient-to-b from-fuchsia-700 to-fuchsia-950 border-fuchsia-500 text-fuchsia-100'
                : 'bg-stone-950 border-stone-800 text-stone-600 cursor-not-allowed'
            }`}
            glow="rgba(217, 70, 239, 0.5)"
            boxShadow={
              isLifelineEnabled(lifelineConfigSwitch, lifelineAvailability.switch) && canUse
                ? '0 0 15px rgba(217, 70, 239, 0.4)'
                : 'none'
            }
            icon={lifelineConfigSwitch.icon}
            label={lifelineConfigSwitch.name}
          />
        )}

        {lifelineConfigDouble?.enabled && onDouble && (
          <LifelineButton
            onClick={onDouble}
            disabled={!isLifelineEnabled(lifelineConfigDouble, lifelineAvailability.double) || !canUse}
            className={`${lifelineBase} ${
              isLifelineEnabled(lifelineConfigDouble, lifelineAvailability.double) && canUse
                ? 'bg-gradient-to-b from-rose-700 to-rose-950 border-rose-500 text-rose-100'
                : 'bg-stone-950 border-stone-800 text-stone-600 cursor-not-allowed'
            }`}
            glow="rgba(244, 63, 94, 0.5)"
            boxShadow={
              isLifelineEnabled(lifelineConfigDouble, lifelineAvailability.double) && canUse
                ? '0 0 15px rgba(244, 63, 94, 0.4)'
                : 'none'
            }
            icon={lifelineConfigDouble.icon}
            label={lifelineConfigDouble.name}
          />
        )}
      </div>
    </Panel>
  );
}

export default LifelinesPanel;
