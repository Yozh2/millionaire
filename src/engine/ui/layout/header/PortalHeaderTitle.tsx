import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

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
  const textWrapRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const subtitleRef = useRef<HTMLHeadingElement | null>(null);
  const reduceMotion = prefersReducedMotion();
  const enableBlur = config.headerSlideshow?.enableBlur ?? false;
  const isLightTheme = !!theme.isLight;
  const titleTextClass = theme.textTitle ?? theme.textPrimary;

  const defaultTitleShadow = isLightTheme
    ? `0 2px 10px rgba(15, 23, 42, 0.75), 0 6px 18px rgba(15, 23, 42, 0.45), 0 0 18px ${theme.glowColor}99, 0 0 34px ${theme.glowColor}66`
    : `0 2px 12px rgba(0,0,0,0.9), 0 8px 22px rgba(0,0,0,0.6), 0 0 20px ${theme.glowColor}b3, 0 0 38px ${theme.glowColor}80`;

  const titleShadow = theme.headerTextShadow ?? defaultTitleShadow;

  const defaultBackdrop = isLightTheme
    ? 'radial-gradient(ellipse at center, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.28) 48%, rgba(15,23,42,0) 78%)'
    : 'radial-gradient(ellipse at center, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 52%, rgba(0,0,0,0) 78%)';

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

  useLayoutEffect(() => {
    const wrap = textWrapRef.current;
    const h1 = titleRef.current;
    const h2 = subtitleRef.current;
    if (!wrap || !h1 || !h2) return;

    let rafId: number | null = null;

    const fit = () => {
      if (rafId != null) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        rafId = null;

        // Reset first so clamp()/breakpoints remain the baseline.
        h1.style.fontSize = '';
        h2.style.fontSize = '';

        const available = wrap.clientWidth;
        if (available <= 0) return;

        const titleWidth = h1.scrollWidth;
        const subtitleWidth = h2.scrollWidth;
        const maxWidth = Math.max(titleWidth, subtitleWidth);
        if (maxWidth <= 0) return;

        if (maxWidth <= available) return;

        // Slight padding to avoid off-by-one clipping.
        const scale = Math.min(1, (available - 1) / maxWidth);
        if (scale >= 1) return;

        const h1Base = Number.parseFloat(window.getComputedStyle(h1).fontSize);
        const h2Base = Number.parseFloat(window.getComputedStyle(h2).fontSize);
        if (!Number.isFinite(h1Base) || !Number.isFinite(h2Base)) return;

        h1.style.fontSize = `${Math.max(10, h1Base * scale).toFixed(2)}px`;
        h2.style.fontSize = `${Math.max(9, h2Base * scale).toFixed(2)}px`;
      });
    };

    fit();

    const ro = new ResizeObserver(() => fit());
    ro.observe(wrap);

    let cancelled = false;
    const fonts = (document as any)?.fonts as FontFaceSet | undefined;
    if (fonts?.ready) {
      fonts.ready.then(() => {
        if (cancelled) return;
        fit();
      });
    }

    return () => {
      cancelled = true;
      ro.disconnect();
      if (rafId != null) window.cancelAnimationFrame(rafId);
    };
  }, [config.subtitle, config.title]);

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
        className={`relative overflow-visible w-[min(1120px,100%)] ${animationClass}`}
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
            className="portal-title__backplate absolute left-1/2 top-1/2 h-28 w-[min(920px,92vw)] -translate-x-1/2 -translate-y-1/2"
            style={{
              ['--portal-title-backdrop' as string]: backdrop,
              filter: enableBlur ? 'blur(26px)' : 'blur(18px)',
              opacity: isLightTheme ? 0.78 : 0.9,
            }}
            aria-hidden="true"
          />

          <div
            ref={textWrapRef}
            className="relative z-10 space-y-1 w-full max-w-[920px] overflow-hidden"
          >
            <h1
              ref={titleRef}
              className={`w-full max-w-full mx-auto text-[clamp(12px,4.8vw,30px)] font-bold tracking-[0.06em] sm:tracking-[0.12em] md:tracking-[0.18em] whitespace-nowrap overflow-hidden text-ellipsis transition-colors duration-500 ${titleTextClass}`}
              style={{ textShadow: titleShadow }}
            >
              {config.title}
            </h1>
            <h2
              ref={subtitleRef}
              className={`w-full max-w-full mx-auto text-[clamp(11px,3.6vw,18px)] tracking-wide whitespace-nowrap overflow-hidden text-ellipsis transition-colors duration-500 ${titleTextClass}`}
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
