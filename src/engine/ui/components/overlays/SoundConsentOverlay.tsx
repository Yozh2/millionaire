import { useMemo } from 'react';
import type { MouseEvent } from 'react';

import type { GameConfig } from '@engine/types';
import { Panel, PanelHeader } from '../panel';
import { LifelineButton } from '../buttons';
import { useTheme } from '../../theme';
import { DefaultHeadphonesIcon } from '../../icons/DefaultIcons';

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
            <HeadphonesIcon />

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
