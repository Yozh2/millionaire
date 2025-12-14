import { useMemo } from 'react';
import type { MouseEvent } from 'react';

import type { GameConfig } from '../../../types';
import { Panel, PanelHeader } from '../panel';
import { LifelineButton } from '../buttons';
import { useTheme } from '../../theme';

function AirPodsProIcon() {
  return (
    <svg
      viewBox="0 0 96 64"
      width="68"
      height="52"
      aria-hidden="true"
      focusable="false"
      style={{ filter: 'drop-shadow(0 0 18px rgba(0,0,0,0.45))' }}
    >
      <defs>
        <linearGradient id="airpods_g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="1" stopColor="rgba(255,255,255,0.55)" />
        </linearGradient>
        <linearGradient id="airpods_hi" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="1" stopColor="rgba(255,255,255,0.2)" />
        </linearGradient>
      </defs>

      {/* Left earbud */}
      <path
        d="M23 15c0-6 5-11 11-11h2c6 0 11 5 11 11v12c0 7-6 13-13 13s-11-4-11-10V15z"
        fill="url(#airpods_g)"
        opacity="0.95"
      />
      <path
        d="M30 44V30c0-2 2-4 4-4h2c2 0 4 2 4 4v14c0 4-2 6-5 6s-5-2-5-6z"
        fill="url(#airpods_g)"
        opacity="0.92"
      />
      <path
        d="M28 16c0-4 3-7 7-7h2c4 0 7 3 7 7v6c0 4-3 7-7 7h-2c-4 0-7-3-7-7v-6z"
        fill="url(#airpods_hi)"
        opacity="0.35"
      />

      {/* Right earbud */}
      <path
        d="M73 15c0-6-5-11-11-11h-2c-6 0-11 5-11 11v12c0 7 6 13 13 13s11-4 11-10V15z"
        fill="url(#airpods_g)"
        opacity="0.95"
      />
      <path
        d="M66 44V30c0-2-2-4-4-4h-2c-2 0-4 2-4 4v14c0 4 2 6 5 6s5-2 5-6z"
        fill="url(#airpods_g)"
        opacity="0.92"
      />
      <path
        d="M68 16c0-4-3-7-7-7h-2c-4 0-7 3-7 7v6c0 4 3 7 7 7h2c4 0 7-3 7-7v-6z"
        fill="url(#airpods_hi)"
        opacity="0.35"
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
  isClosing?: boolean;
}

export function SoundConsentOverlay({
  config,
  onEnableSound,
  onDisableSound,
  isClosing = false,
}: SoundConsentOverlayProps) {
  const theme = useTheme();

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

  const buttonBase =
    'border-3 h-12 w-full flex items-center justify-center bg-gradient-to-b';

  return (
    <div
      className="absolute inset-0 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={copy.title}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />

      <div className="relative w-full max-w-lg px-4">
        <Panel
          className={`p-1 ${isClosing ? 'animate-dust-out' : 'animate-slide-in'}`}
        >
          <PanelHeader>{copy.title}</PanelHeader>

          <div className="p-5 md:p-6 flex flex-col items-center text-center gap-4">
            <AirPodsProIcon />

            <div
              className={`leading-relaxed whitespace-pre-line ${theme.textSecondary}`}
            >
              {copy.message}
            </div>

            <div className="w-full grid grid-cols-2 gap-3 pt-1">
              <LifelineButton
                icon={<VolumeOnIcon />}
                ariaLabel={copy.withSound}
                title={copy.withSound}
                disabled={isClosing}
                className={`${buttonBase} ${theme.textLifeline} ${theme.borderLifeline} ${theme.bgLifeline}`}
                glow={theme.glow}
                boxShadow={`0 0 15px ${theme.glow}`}
                onClick={handleEnable}
              />
              <LifelineButton
                icon={<VolumeOffIcon />}
                ariaLabel={copy.withoutSound}
                title={copy.withoutSound}
                disabled={isClosing}
                className={`${buttonBase} ${theme.textLifeline} ${theme.borderLifeline} ${theme.bgLifeline}`}
                glow={theme.glowSecondary ?? theme.glow}
                boxShadow={`0 0 12px ${theme.glowSecondary ?? theme.glow}55`}
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
