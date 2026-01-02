import { useEffect, useRef, useState, type CSSProperties } from 'react';

export interface LoadingTheme {
  bgColor?: string;
  glowColor?: string;
  bgPanelFrom?: string;
  bgHeaderVia?: string;
}

interface ViewportSize {
  width: number;
  height: number;
}

export interface RingMetrics {
  ringSize: number;
  ringStroke: number;
  ringRadius: number;
  progressDasharray: string;
  glintVisible: boolean;
  glintStyle: CSSProperties;
  glowSize: number;
  shellSize: number;
  coreSize: number;
  logoSize: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const toRgba = (hex: string, alpha: number): string | null => {
  const clean = hex.trim();
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(clean)) return null;
  const full =
    clean.length === 4
      ? `#${clean[1]}${clean[1]}${clean[2]}${clean[2]}${clean[3]}${clean[3]}`
      : clean;
  const r = Number.parseInt(full.slice(1, 3), 16);
  const g = Number.parseInt(full.slice(3, 5), 16);
  const b = Number.parseInt(full.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const createEmojiLogo = (emoji: string): string => {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
    `<text y=".9em" font-size="90">${emoji}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

/**
 * Keep the loading ring smooth by easing toward the target progress.
 */
export const useSmoothedProgress = (progress?: number) => {
  const isIndeterminate = !Number.isFinite(progress);
  const targetProgress = isIndeterminate ? 0 : clamp(progress ?? 0, 0, 100);

  const [displayProgress, setDisplayProgress] = useState(targetProgress);
  const displayProgressRef = useRef(targetProgress);
  const targetProgressRef = useRef(targetProgress);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (isIndeterminate) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    if (targetProgress < 5 && displayProgressRef.current > 95) {
      displayProgressRef.current = targetProgress;
      setDisplayProgress(targetProgress);
    }

    targetProgressRef.current = targetProgress;

    if (rafRef.current !== null) return;

    const tick = () => {
      const current = displayProgressRef.current;
      const target = targetProgressRef.current;
      const delta = target - current;

      if (Math.abs(delta) < 0.1) {
        displayProgressRef.current = target;
        setDisplayProgress(target);
        rafRef.current = null;
        return;
      }

      const next = current + delta * 0.12;
      displayProgressRef.current = next;
      setDisplayProgress(next);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isIndeterminate, targetProgress]);

  return { isIndeterminate, displayProgress };
};

/**
 * Track the current viewport size to keep the ring responsive.
 */
export const useViewportSize = (): ViewportSize => {
  const [viewport, setViewport] = useState<ViewportSize>(() => ({
    width: typeof window === 'undefined' ? 1024 : window.innerWidth,
    height: typeof window === 'undefined' ? 768 : window.innerHeight,
  }));

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
};

export const buildBackgroundGradient = (base: string) => {
  const center = toRgba(base, 0.28) ?? base;
  const mid = toRgba(base, 0.14) ?? base;
  return `radial-gradient(circle at center, ${center} 0%, ${mid} 38%, rgba(0,0,0,0.92) 74%, #000 100%)`;
};

const getRingSizing = (
  displayProgress: number,
  isIndeterminate: boolean,
  viewport: ViewportSize
) => {
  const minViewport = Math.max(280, Math.min(viewport.width, viewport.height));
  const isTightLayout = minViewport < 720;
  const maxRingSize = isTightLayout
    ? Math.max(220, minViewport * 0.88)
    : Math.min(360, minViewport * 0.6);
  const minRingSize = clamp(Math.round(maxRingSize * 0.4), 120, 180);
  const sizeProgress = isIndeterminate ? 0 : displayProgress / 100;
  const ringSize = minRingSize + (maxRingSize - minRingSize) * sizeProgress;
  const ringStroke = clamp(Math.round(ringSize * 0.068), 8, 26);
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const normalizedProgress = isIndeterminate
    ? 24
    : Math.min(100, displayProgress * 1.05);
  const progressLength = ringCircumference * (normalizedProgress / 100);

  return {
    ringSize,
    ringStroke,
    ringRadius,
    ringCircumference,
    progressLength,
  };
};

const getGlintMetrics = (
  ringCircumference: number,
  progressLength: number,
  ringStroke: number
) => {
  const glintDotLength = Math.max(2, ringStroke * 0.55);
  const glintBaseLength = ringCircumference * 0.12;
  const glintLength = Math.min(
    glintBaseLength,
    Math.max(progressLength * 0.35, ringStroke * 1.2)
  );
  const glintDotLengthClamped = Math.min(glintDotLength, progressLength);
  const glintLengthClamped = Math.min(glintLength, progressLength * 0.85);
  const glintLengthFinal = Math.max(glintLengthClamped, glintDotLengthClamped);
  const glintTravel = Math.max(progressLength - glintLengthFinal, 0);
  const glintDotTravel = Math.max(progressLength - glintDotLengthClamped, 0);

  return {
    glintVisible: glintLengthFinal > ringStroke * 0.6,
    glintStyle: {
      '--glint-from': '0',
      '--glint-to': `${-glintTravel}`,
      '--glint-early': `${-Math.max(glintTravel * 0.3, 0)}`,
      '--glint-dot-to': `${-glintDotTravel}`,
      '--glint-dot-dash': `${glintDotLengthClamped} ${
        ringCircumference - glintDotLengthClamped
      }`,
      '--glint-dash': `${glintLengthFinal} ${
        ringCircumference - glintLengthFinal
      }`,
    } as CSSProperties,
  };
};

/**
 * Derive ring sizing and glint animation values from progress and viewport.
 */
export const getRingMetrics = (
  displayProgress: number,
  isIndeterminate: boolean,
  viewport: ViewportSize
): RingMetrics => {
  const sizing = getRingSizing(displayProgress, isIndeterminate, viewport);
  const glint = getGlintMetrics(
    sizing.ringCircumference,
    sizing.progressLength,
    sizing.ringStroke
  );
  const progressDasharray = `${sizing.progressLength} ${
    sizing.ringCircumference - sizing.progressLength
  }`;
  const glowSize = sizing.ringSize + clamp(sizing.ringSize * 0.28, 28, 70);
  const shellSize = sizing.ringSize * 0.75;
  const coreSize = sizing.ringSize * 0.55;
  const logoSize = Math.max(32, coreSize * 0.5);

  return {
    ringSize: sizing.ringSize,
    ringStroke: sizing.ringStroke,
    ringRadius: sizing.ringRadius,
    progressDasharray,
    glintVisible: glint.glintVisible,
    glintStyle: glint.glintStyle,
    glowSize,
    shellSize,
    coreSize,
    logoSize,
  };
};
