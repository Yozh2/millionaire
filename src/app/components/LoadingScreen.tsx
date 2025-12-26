/**
 * App-level loading screen.
 * Keeps dependencies minimal and avoids engine imports.
 */

import { useEffect, useRef, useState, type CSSProperties } from 'react';

export interface LoadingTheme {
  glowColor?: string;
  bgPanelFrom?: string;
  bgHeaderVia?: string;
}

export interface LoadingScreenProps {
  /** Current progress (0-100). Leave undefined for indeterminate loading. */
  progress?: number;
  /** Optional loading screen center tint (used for radial loading background). */
  loadingBgColor?: string;
  /** Theme hints (optional). */
  theme?: LoadingTheme;
  /** Logo image URL (optional) */
  logoUrl?: string;
  /** Logo emoji fallback (optional) */
  logoEmoji?: string;
}

const DEFAULT_LOGO_EMOJI = '🎯';
const NOISE_DATA_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E";

const getBasePath = () => {
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? base : `${base}/`;
};

const DEFAULT_LOGO_URL = `${getBasePath()}icons/favicon.svg`;

const clampProgress = (value: number) => Math.min(100, Math.max(0, value));
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
const toRgba = (hex: string, alpha: number): string | null => {
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

const createEmojiLogo = (emoji: string): string => {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
    `<text y=".9em" font-size="90">${emoji}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export function LoadingScreen({
  progress,
  loadingBgColor,
  theme,
  logoUrl,
  logoEmoji,
}: LoadingScreenProps) {
  const isIndeterminate =
    typeof progress !== 'number' ||
    Number.isNaN(progress) ||
    !Number.isFinite(progress);
  const targetProgress = isIndeterminate ? 0 : clampProgress(progress);

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

  const accentColor = theme?.glowColor ?? '#f59e0b';
  const accentGlow = accentColor.startsWith('#')
    ? `${accentColor}66`
    : 'rgba(245, 158, 11, 0.4)';
  const accentGlowSoft = accentColor.startsWith('#')
    ? `${accentColor}55`
    : 'rgba(245, 158, 11, 0.35)';
  const accentGlowStrong = accentColor.startsWith('#')
    ? `${accentColor}99`
    : 'rgba(245, 158, 11, 0.6)';
  const ringTrackColor = 'rgba(255, 255, 255, 0.12)';
  const plateauBase =
    loadingBgColor ?? theme?.bgPanelFrom ?? theme?.bgHeaderVia ?? '#0b0f14';
  const plateauHighlight = toRgba(plateauBase, 0.9) ?? plateauBase;
  const plateauMid = toRgba(plateauBase, 0.75) ?? plateauBase;
  const plateauDeep = toRgba(plateauBase, 0.65) ?? plateauBase;
  const fallbackEmoji = logoEmoji ?? DEFAULT_LOGO_EMOJI;
  const resolvedLogoUrl =
    logoUrl ?? (logoEmoji ? createEmojiLogo(logoEmoji) : DEFAULT_LOGO_URL);
  const [logoFailed, setLogoFailed] = useState(false);
  const logoSrc = logoFailed ? createEmojiLogo(fallbackEmoji) : resolvedLogoUrl;
  const [viewport, setViewport] = useState(() => ({
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
  const progressDasharray = `${progressLength} ${
    ringCircumference - progressLength
  }`;
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
  const glintVisible = glintLengthFinal > ringStroke * 0.6;
  const glintStyle = {
    '--glint-from': '0',
    '--glint-to': `${-glintTravel}`,
    '--glint-dot-to': `${-glintDotTravel}`,
    '--glint-dot-dash': `${glintDotLengthClamped} ${
      ringCircumference - glintDotLengthClamped
    }`,
    '--glint-dash': `${glintLengthFinal} ${
      ringCircumference - glintLengthFinal
    }`,
  } as CSSProperties;
  const glowSize = ringSize + clamp(ringSize * 0.28, 28, 70);
  const shellSize = ringSize * 0.75;
  const coreSize = ringSize * 0.55;
  const logoSize = Math.max(32, coreSize * 0.5);

  useEffect(() => {
    setLogoFailed(false);
  }, [resolvedLogoUrl]);

  return (
    <div
      className="engine fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: (() => {
          const base =
            loadingBgColor ??
            theme?.bgPanelFrom ??
            theme?.bgHeaderVia ??
            '#0b0f14';
          const center = toRgba(base, 0.28) ?? base;
          const mid = toRgba(base, 0.14) ?? base;
          return `radial-gradient(circle at center, ${center} 0%, ${mid} 38%, rgba(0,0,0,0.92) 74%, #000 100%)`;
        })(),
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.08] mix-blend-soft-light"
        style={{
          backgroundImage: `url("${NOISE_DATA_URL}")`,
          backgroundSize: '120px 120px',
        }}
      />

      <div className="relative flex flex-col items-center gap-4 px-8">
        <div
          className="relative flex items-center justify-center"
          style={{
            width: `${ringSize}px`,
            height: `${ringSize}px`,
          }}
        >
          <div
            className="absolute rounded-full blur-2xl opacity-70"
            style={{
              width: `${glowSize}px`,
              height: `${glowSize}px`,
              background: `radial-gradient(circle, ${accentGlowSoft} 0%, transparent 70%)`,
            }}
          />
          <svg
            className="absolute"
            width={ringSize}
            height={ringSize}
            viewBox={`0 0 ${ringSize} ${ringSize}`}
            style={{
              filter: `drop-shadow(0 0 18px ${accentGlow})`,
              animation: 'loading-ring-rotate 32s linear infinite',
            }}
          >
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringRadius}
              stroke={ringTrackColor}
              strokeWidth={ringStroke}
              fill="none"
            />
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringRadius}
              stroke={accentColor}
              strokeWidth={ringStroke}
              strokeLinecap="round"
              strokeDasharray={progressDasharray}
              fill="none"
              transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
            />
            {glintVisible && (
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={ringRadius}
                stroke="rgba(255, 255, 255, 0.9)"
                strokeWidth={Math.max(2, Math.round(ringStroke * 0.55))}
                strokeLinecap="round"
                strokeDasharray="var(--glint-dot-dash)"
                fill="none"
                transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                style={{
                  ...glintStyle,
                  animation: 'loading-ring-glint 3.4s linear infinite',
                }}
              />
            )}
          </svg>
          <div
            className="absolute rounded-full flex items-center justify-center"
            style={{
              width: `${shellSize}px`,
              height: `${shellSize}px`,
              background: `radial-gradient(circle at 30% 30%, ${plateauHighlight} 0%, ${plateauMid} 55%, ${plateauDeep} 100%)`,
              boxShadow: `0 0 24px ${accentGlowSoft}, inset 0 0 18px ${accentGlowSoft}`,
            }}
          >
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: `${coreSize}px`,
                height: `${coreSize}px`,
                background: `radial-gradient(circle at 35% 35%, ${plateauHighlight} 0%, ${plateauMid} 60%, ${plateauDeep} 100%)`,
                boxShadow: `0 14px 26px ${accentGlowSoft}`,
              }}
            >
              <img
                src={logoSrc}
                alt="Loading"
                className="object-contain rounded-full"
                style={{
                  width: `${logoSize}px`,
                  height: `${logoSize}px`,
                  animation: 'spin 1.5s linear infinite',
                  filter: `drop-shadow(0 0 8px ${accentGlowStrong})`,
                }}
                loading="eager"
                decoding="async"
                fetchpriority="high"
                onError={() => setLogoFailed(true)}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loading-ring-rotate {
          to { transform: rotate(360deg); }
        }

        @keyframes loading-ring-glint {
          0% {
            stroke-dasharray: var(--glint-dot-dash);
            stroke-dashoffset: var(--glint-from);
            opacity: 0;
          }
          8% { opacity: 0.9; }
          30% {
            stroke-dasharray: var(--glint-dash);
            stroke-dashoffset: var(--glint-early);
          }
          72% {
            stroke-dasharray: var(--glint-dash);
            stroke-dashoffset: var(--glint-to);
            opacity: 0.9;
          }
          84% {
            stroke-dasharray: var(--glint-dot-dash);
            stroke-dashoffset: var(--glint-dot-to);
          }
          100% {
            stroke-dasharray: var(--glint-dot-dash);
            stroke-dashoffset: var(--glint-dot-to);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
