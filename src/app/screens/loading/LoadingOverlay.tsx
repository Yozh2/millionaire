import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { LoadingScreen } from './LoadingScreen';
import { useLoading } from './LoadingOrchestrator';

const FADE_TO_BLACK_MS = 140;
const FADE_OUT_MS = 180;
const FADE_BG_LIGHT = '#ffffff';
const FADE_BG_DARK = '#0b0f14';

type OverlayState = 'hidden' | 'visible' | 'blackout' | 'reveal';

export function LoadingOverlay() {
  const { active, progress, appearance } = useLoading();
  const [state, setState] = useState<OverlayState>(active ? 'visible' : 'hidden');

  useEffect(() => {
    if (active) {
      setState('visible');
      return;
    }

    if (state === 'visible') {
      setState('blackout');
    }
  }, [active, state]);

  useEffect(() => {
    if (state !== 'blackout') return;

    const timeout = window.setTimeout(() => setState('reveal'), FADE_TO_BLACK_MS);
    return () => window.clearTimeout(timeout);
  }, [state]);

  useEffect(() => {
    if (state !== 'reveal') return;

    const timeout = window.setTimeout(() => setState('hidden'), FADE_OUT_MS);
    return () => window.clearTimeout(timeout);
  }, [state]);

  const exitColor = useMemo(() => {
    const mode = appearance.mode ?? (appearance.theme?.isLight ? 'light' : 'dark');
    return mode === 'light' ? FADE_BG_LIGHT : FADE_BG_DARK;
  }, [appearance.mode, appearance.theme?.isLight]);

  if (state === 'hidden') return null;

  return (
    <div
      className="loading-overlay"
      data-state={state}
      style={{ '--loading-exit-bg': exitColor } as CSSProperties}
    >
      <div className="loading-overlay__fade" />
      <LoadingScreen
        progress={progress}
        loadingBgColor={appearance.loadingBgColor}
        theme={appearance.theme}
        logoUrl={appearance.logoUrl}
        logoEmoji={appearance.logoEmoji}
      />
    </div>
  );
}

export default LoadingOverlay;
