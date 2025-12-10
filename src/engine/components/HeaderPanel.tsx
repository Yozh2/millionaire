import React from 'react';
import { Panel } from './ui/Panel';
import { HeaderSlideshow } from './HeaderSlideshow';
import type {
  GameConfig,
  QuestionDifficulty,
  SlideshowScreen,
  ThemeColors,
} from '../types';

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
        <button
          onClick={onToggleMusic}
          className="absolute top-3 right-3 text-2xl hover:scale-110 transition-transform"
          title={isMusicPlaying ? config.strings.musicOn : config.strings.musicOff}
          style={{ filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.6))' }}
        >
          {isMusicPlaying ? '🔊' : '🔇'}
        </button>

        <div className="relative max-w-5xl mx-auto text-center flex items-center justify-center min-h-[180px]">
          <div
            className="pointer-events-none absolute inset-x-6 top-2 h-32"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(0,0,0,0.5) 25%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0) 75%)',
              filter: 'blur(18px)',
              opacity: 0.95,
            }}
            aria-hidden="true"
          />
          <div className="relative z-10 space-y-1">
            <h1
              className={`text-2xl md:text-3xl font-bold tracking-wider transition-colors duration-500 ${theme.textPrimary}`}
              style={{
                textShadow:
                  `0 4px 18px rgba(0,0,0,0.8), ` +
                  `0 0 32px rgba(0,0,0,0.7), ` +
                  `0 0 30px ${theme.glowColor}`,
              }}
            >
              {config.title}
            </h1>
            <h2
              className={`text-lg tracking-wide transition-colors duration-500 ${theme.textPrimary}`}
              style={{
                lineHeight: '1.5',
                fontStyle: 'italic',
                textShadow:
                  `0 4px 18px rgba(0,0,0,0.8), ` +
                  `0 0 32px rgba(0,0,0,0.7), ` +
                  `0 0 30px ${theme.glowColor}`,
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
