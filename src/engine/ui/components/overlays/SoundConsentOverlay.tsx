import { useMemo } from 'react';
import type { MouseEvent } from 'react';

import type { GameConfig } from '../../../types';
import { Panel } from '../panel';
import { LifelineButton } from '../buttons';

function HeadphonesIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      width="56"
      height="56"
      aria-hidden="true"
      focusable="false"
      style={{ filter: 'drop-shadow(0 0 18px rgba(0,0,0,0.45))' }}
    >
      <defs>
        <linearGradient id="hc_g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="1" stopColor="rgba(255,255,255,0.55)" />
        </linearGradient>
      </defs>
      <path
        d="M12 34c0-11 9-20 20-20s20 9 20 20"
        fill="none"
        stroke="url(#hc_g)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M12 34v13c0 3 2 5 5 5h3c3 0 5-2 5-5V40c0-3-2-5-5-5h-3c-3 0-5 2-5 5z"
        fill="url(#hc_g)"
        opacity="0.9"
      />
      <path
        d="M52 34v13c0 3-2 5-5 5h-3c-3 0-5-2-5-5V40c0-3 2-5 5-5h3c3 0 5 2 5 5z"
        fill="url(#hc_g)"
        opacity="0.9"
      />
    </svg>
  );
}

function VolumeOnIcon() {
  return <span aria-hidden="true">🔊</span>;
}

function VolumeOffIcon() {
  return <span aria-hidden="true">🔇</span>;
}

export interface SoundConsentOverlayProps {
  config: GameConfig;
  onEnableSound: () => void;
  onDisableSound: () => void;
}

export function SoundConsentOverlay({
  config,
  onEnableSound,
  onDisableSound,
}: SoundConsentOverlayProps) {
  const copy = useMemo(() => {
    const defaults = {
      title: 'Звук в игре',
      message:
        'Эта игра лучше всего ощущается в наушниках.\nВключить звук?',
      withSound: 'Со звуком',
      withoutSound: 'Без звука',
    };

    const strings = config.systemStrings;
    return {
      title: strings?.soundConsentTitle ?? defaults.title,
      message: strings?.soundConsentMessage ?? defaults.message,
      withSound: strings?.soundConsentEnableLabel ?? defaults.withSound,
      withoutSound: strings?.soundConsentDisableLabel ?? defaults.withoutSound,
    };
  }, [config.systemStrings]);

  const handleEnable = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onEnableSound();
  };

  const handleDisable = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onDisableSound();
  };

  return (
    <div
      className="absolute inset-0 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={copy.title}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />

      <div className="relative w-full max-w-lg px-4">
        <Panel className="p-6 md:p-7" variant="headless">
          <div className="flex flex-col items-center text-center gap-4">
            <HeadphonesIcon />

            <div className="space-y-2">
              <div className="text-xl font-bold tracking-wide text-amber-100">
                {copy.title}
              </div>
              <div className="text-amber-100/90 leading-relaxed whitespace-pre-line">
                {copy.message}
              </div>
            </div>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <LifelineButton
                icon={<VolumeOnIcon />}
                label={copy.withSound}
                className="w-full py-3"
                glow="rgba(80, 200, 255, 0.55)"
                boxShadow="0 0 18px rgba(80, 200, 255, 0.22)"
                onClick={handleEnable}
              />
              <LifelineButton
                icon={<VolumeOffIcon />}
                label={copy.withoutSound}
                className="w-full py-3"
                glow="rgba(255, 160, 80, 0.45)"
                boxShadow="0 0 18px rgba(255, 160, 80, 0.18)"
                onClick={handleDisable}
              />
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default SoundConsentOverlay;

