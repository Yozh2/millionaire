import React from 'react';
import { Panel } from '../../components/panel';
import { VolumeButton } from '../../components/buttons';
import { HeaderSlideshow } from './HeaderSlideshow';
import type {
  GameConfig,
  QuestionDifficulty,
  SlideshowScreen,
  ThemeColors,
} from '@engine/types';

interface HeaderPanelProps {
  config: GameConfig;
  theme: ThemeColors;
  slideshowScreen: SlideshowScreen;
  campaignId?: string;
  difficulty?: QuestionDifficulty;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Shared header shell with slideshow background and soft oval shadow behind text.
 * Used by start, game, and end screens to keep layout consistent.
 */
export const HeaderPanel: React.FC<HeaderPanelProps> = ({
  config,
  theme,
  slideshowScreen,
  campaignId,
  difficulty,
  isMusicPlaying,
  onToggleMusic,
  children,
  className = '',
}) => {
  const isLightTheme = !!theme.isLight;
  const titleTextClass = theme.textTitle ?? theme.textPrimary;
  const enableBlur = config.headerSlideshow?.enableBlur ?? false;

  const defaultTitleShadow = isLightTheme
    ? `0 4px 18px rgba(15, 23, 42, 0.20), 0 0 26px ${theme.glowColor}55`
    : `0 4px 18px rgba(0,0,0,0.8), 0 0 32px rgba(0,0,0,0.7), 0 0 30px ${theme.glowColor}`;

  const titleShadow = theme.headerTextShadow ?? defaultTitleShadow;

  const defaultBackdrop = isLightTheme
    ? 'radial-gradient(ellipse at center, rgba(255,255,255,0.85) 20%, rgba(255,255,255,0.35) 55%, rgba(255,255,255,0) 78%)'
    : 'radial-gradient(ellipse at center, rgba(0,0,0,0.5) 25%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0) 75%)';

  const backdrop = theme.headerTextBackdrop ?? defaultBackdrop;

  return (
    <Panel
      className={`mb-4 p-1 animate-slide-in stagger-1 relative overflow-hidden min-h-[200px] ${className}`}
      variant="headless"
    >
      {config.headerSlideshow && (
        <HeaderSlideshow
          config={config.headerSlideshow}
          gameId={config.id}
          campaignId={campaignId}
          screen={slideshowScreen}
          difficulty={difficulty}
        />
      )}

      <div className="p-4 relative z-10 h-full flex flex-col justify-center">
        <VolumeButton
          onClick={onToggleMusic}
          title={isMusicPlaying ? config.strings.musicOn : config.strings.musicOff}
        >
          {isMusicPlaying ? '🔊' : '🔇'}
        </VolumeButton>

        <div className="relative max-w-5xl mx-auto text-center flex items-center justify-center min-h-[180px]">
          <div
            className="pointer-events-none absolute inset-x-6 top-2 h-32"
            style={{
              background: backdrop,
              filter: enableBlur ? 'blur(18px)' : 'none',
              opacity: isLightTheme ? 0.9 : 0.95,
            }}
            aria-hidden="true"
          />
          <div className="relative z-10 space-y-1">
            <h1
              className={`text-2xl md:text-3xl font-bold tracking-wider transition-colors duration-500 ${titleTextClass}`}
              style={{
                textShadow: titleShadow,
              }}
            >
              {config.title}
            </h1>
            <h2
              className={`text-lg tracking-wide transition-colors duration-500 ${titleTextClass}`}
              style={{
                lineHeight: '1.5',
                fontStyle: 'italic',
                textShadow: titleShadow,
              }}
            >
              {config.subtitle}
            </h2>
            {children && <div className="pt-2">{children}</div>}
          </div>
        </div>
      </div>
    </Panel>
  );
};

export default HeaderPanel;
