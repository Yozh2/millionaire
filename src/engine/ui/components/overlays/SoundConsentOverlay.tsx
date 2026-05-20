import { useMemo } from 'react';
import type { MouseEvent } from 'react';

import type { GameConfig } from '@engine/types';
import { Panel, PanelHeader } from '@engine/ui/components/panel';
import { LifelineButton } from '@engine/ui/components/buttons';
import { useTheme } from '@engine/ui/theme';
import { DefaultHeadphonesIcon } from '@engine/ui/icons/DefaultIcons';

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
  const HeadphonesIcon = config.icons?.headphones ?? DefaultHeadphonesIcon;

  const copy = useMemo(() => {
    const defaults = {
      title: 'Звук в игре',
      message: 'Эта игра лучше всего ощущается в наушниках.\nВключить звук?',
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
    'border-3 min-h-14 w-full flex items-center justify-center bg-gradient-to-b ' +
    'ring-1 ring-white/15 shadow-lg text-sm sm:text-base font-bold';
  const enableButtonClass = `${buttonBase} ${theme.textLifeline} ${theme.borderLight} ${theme.bgButton}`;
  const disableButtonClass =
    `${buttonBase} text-slate-100 border-slate-500 ` +
    'from-slate-700/95 via-slate-900/95 to-black';

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
            <HeadphonesIcon />

            <div
              className={`leading-relaxed whitespace-pre-line ${theme.textSecondary}`}
            >
              {copy.message}
            </div>

            <div className="w-full grid grid-cols-2 gap-3 pt-1">
              <LifelineButton
                icon={<VolumeOnIcon />}
                label={copy.withSound}
                ariaLabel={copy.withSound}
                title={copy.withSound}
                disabled={isClosing}
                className={enableButtonClass}
                glow={theme.glow}
                boxShadow={`0 10px 24px rgba(0, 0, 0, 0.38), 0 0 18px ${theme.glow}`}
                onClick={handleEnable}
              />
              <LifelineButton
                icon={<VolumeOffIcon />}
                label={copy.withoutSound}
                ariaLabel={copy.withoutSound}
                title={copy.withoutSound}
                disabled={isClosing}
                className={disableButtonClass}
                glow={theme.glowSecondary ?? theme.glow}
                boxShadow="0 10px 24px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255,255,255,0.12)"
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
