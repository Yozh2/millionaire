import { useEffect, useMemo } from 'react';

import type { GameConfig, ThemeColors } from '@engine/types';

export type PortalHeaderTitlePhase = 'enter' | 'shown' | 'exit';

function prefersReducedMotion() {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  } catch {
    return false;
  }
}

interface PortalHeaderTitleProps {
  config: GameConfig;
  theme: ThemeColors;
  phase: PortalHeaderTitlePhase;
  onEntered?: () => void;
  onExited?: () => void;
  className?: string;
}

export function PortalHeaderTitle({
  config,
  theme,
  phase,
  onEntered,
  onExited,
  className = '',
}: PortalHeaderTitleProps) {
  const reduceMotion = prefersReducedMotion();
  const enableBlur = config.headerSlideshow?.enableBlur ?? false;
  const isLightTheme = !!theme.isLight;
  const titleTextClass = theme.textTitle ?? theme.textPrimary;

  const defaultTitleShadow = isLightTheme
    ? `0 4px 18px rgba(15, 23, 42, 0.20), 0 0 26px ${theme.glowColor}55`
    : `0 4px 18px rgba(0,0,0,0.8), 0 0 32px rgba(0,0,0,0.7), 0 0 30px ${theme.glowColor}`;

  const titleShadow = theme.headerTextShadow ?? defaultTitleShadow;

  const defaultBackdrop = isLightTheme
    ? 'radial-gradient(ellipse at center, rgba(255,255,255,0.82) 18%, rgba(255,255,255,0.34) 52%, rgba(255,255,255,0) 78%)'
    : 'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 20%, rgba(0,0,0,0.22) 50%, rgba(0,0,0,0) 78%)';

  const backdrop = theme.headerTextBackdrop ?? defaultBackdrop;

  const aura = useMemo(() => {
    const glow = theme.glowColor ?? '#60a5fa';
    return isLightTheme
      ? `radial-gradient(ellipse at center, ${glow}2a 0%, rgba(255,255,255,0.18) 45%, rgba(255,255,255,0) 72%)`
      : `radial-gradient(ellipse at center, ${glow}33 0%, rgba(0,0,0,0.12) 40%, rgba(0,0,0,0) 72%)`;
  }, [isLightTheme, theme.glowColor]);

  useEffect(() => {
    if (!reduceMotion) return;
    if (phase === 'enter') onEntered?.();
    if (phase === 'exit') onExited?.();
  }, [onEntered, onExited, phase, reduceMotion]);

  const animationClass =
    phase === 'enter'
      ? 'portal-title__motion--enter'
      : phase === 'exit'
        ? 'portal-title__motion--exit'
        : '';

  return (
    <div
      className={`portal-title absolute inset-0 z-[80] flex items-center justify-center px-4 overflow-visible ${className}`}
    >
      <div
        className={`relative overflow-visible w-[min(1120px,calc(100%+96px))] ${animationClass}`}
        onAnimationEnd={(e) => {
          if (reduceMotion) return;
          if (phase === 'enter' && e.animationName === 'portal-title-arrive') onEntered?.();
          if (phase === 'exit' && e.animationName === 'portal-title-evaporate') onExited?.();
        }}
      >
        <div className="relative max-w-5xl mx-auto text-center flex items-center justify-center min-h-[165px] md:min-h-[175px]">
          <div
            className="portal-title__aura absolute left-1/2 top-1/2 h-24 w-[min(920px,92vw)] -translate-x-1/2 -translate-y-1/2"
            style={{
              background: aura,
              opacity: isLightTheme ? 0.9 : 0.75,
              filter: enableBlur ? 'blur(18px)' : 'blur(14px)',
            }}
            aria-hidden="true"
          />

          <div
            className="absolute inset-x-6 top-1/2 h-32 -translate-y-1/2"
            style={{
              background: backdrop,
              filter: enableBlur ? 'blur(18px)' : 'none',
              opacity: isLightTheme ? 0.9 : 0.95,
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 space-y-1">
            <h1
              className={`text-2xl md:text-3xl font-bold tracking-[0.18em] transition-colors duration-500 ${titleTextClass}`}
              style={{ textShadow: titleShadow }}
            >
              {config.title}
            </h1>
            <h2
              className={`text-lg tracking-wide transition-colors duration-500 ${titleTextClass}`}
              style={{ lineHeight: '1.5', fontStyle: 'italic', textShadow: titleShadow }}
            >
              {config.subtitle}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PortalHeaderTitle;
