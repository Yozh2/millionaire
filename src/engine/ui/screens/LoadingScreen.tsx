/**
 * Loading Screen Component
 *
 * Displays a loading progress bar while assets are being preloaded.
 * Styled to match the game's visual theme.
 */

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { publicFile } from '@public';

import type { ThemeColors } from '@engine/types';

/** Props for LoadingScreen component */
export interface LoadingScreenProps {
  /** Current progress (0-100). Leave undefined for indeterminate loading. */
  progress?: number;
  /** Loading title text */
  title?: string;
  /** Optional subtitle/hint text */
  subtitle?: string;
  /** Theme colors (optional, uses default dark theme if not provided) */
  theme?: Partial<ThemeColors>;
  /** Logo image URL (optional) */
  logoUrl?: string;
  /** Logo emoji fallback (optional) */
  logoEmoji?: string;
  /** Whether to show the progress percentage */
  showPercentage?: boolean;
  /** Callback when loading animation completes after reaching 100% */
  onComplete?: () => void;
}

/** Default dark theme for loading screen */
const defaultLoadingTheme: Partial<ThemeColors> = {
  textPrimary: 'text-amber-100',
  textSecondary: 'text-amber-200/70',
  bgPanel: 'bg-slate-900/80',
  border: 'border-amber-500/30',
};

const DEFAULT_LOGO_URL = publicFile('icons/favicon.svg');
const DEFAULT_LOGO_EMOJI = '🎯';
const NOISE_DATA_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E";

const clampProgress = (value: number) => Math.min(100, Math.max(0, value));
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const createEmojiLogo = (emoji: string): string => {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
    `<text y=".9em" font-size="90">${emoji}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

/**
 * Loading screen with animated progress ring.
 */
export function LoadingScreen({
  progress,
  title,
  subtitle,
  theme = defaultLoadingTheme,
  logoUrl,
  logoEmoji,
  showPercentage = false,
  onComplete,
}: LoadingScreenProps) {
  const isIndeterminate =
    typeof progress !== 'number' ||
    Number.isNaN(progress) ||
    !Number.isFinite(progress);
  const targetProgress = isIndeterminate ? 0 : clampProgress(progress);

  // Smooth progress animation with easing to avoid jitter
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

  // Call onComplete when we reach 100% and animation settles
  useEffect(() => {
    if (!isIndeterminate && displayProgress >= 100 && onComplete) {
      const timer = setTimeout(onComplete, 300);
      return () => clearTimeout(timer);
    }
  }, [displayProgress, isIndeterminate, onComplete]);

  const t = { ...defaultLoadingTheme, ...theme };
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
  const fallbackEmoji = logoEmoji ?? DEFAULT_LOGO_EMOJI;
  const resolvedLogoUrl =
    logoUrl ?? (logoEmoji ? createEmojiLogo(logoEmoji) : DEFAULT_LOGO_URL);
  const [logoFailed, setLogoFailed] = useState(false);
  const logoSrc = logoFailed
    ? createEmojiLogo(fallbackEmoji)
    : resolvedLogoUrl;
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
  const normalizedProgress = isIndeterminate ? 24 : displayProgress;
  const progressLength = ringCircumference * (normalizedProgress / 100);
  const progressDasharray = `${progressLength} ${ringCircumference - progressLength}`;
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
    '--glint-dash': `${glintLengthFinal} ${ringCircumference - glintLengthFinal}`,
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
        background:
          theme?.bgGradient ??
          'radial-gradient(ellipse at center, #111827 0%, #0f172a 32%, #0c1524 58%, #09111b 78%, #070b14 100%)',
      }}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.08] mix-blend-soft-light"
        style={{
          backgroundImage: `url("${NOISE_DATA_URL}")`,
          backgroundSize: '120px 120px',
        }}
      />

      {/* Content container */}
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
            className="absolute rounded-full bg-slate-950/80 border border-white/10 flex items-center justify-center"
            style={{
              width: `${shellSize}px`,
              height: `${shellSize}px`,
              boxShadow: 'inset 0 0 26px rgba(0,0,0,0.6)',
            }}
          >
            <div
              className="rounded-full bg-slate-900/50 border border-white/10 flex items-center justify-center"
              style={{
                width: `${coreSize}px`,
                height: `${coreSize}px`,
                boxShadow: '0 18px 32px rgba(0,0,0,0.45)',
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
                fetchPriority="high"
                onError={() => setLogoFailed(true)}
              />
            </div>
          </div>
        </div>

        {(title || subtitle || (showPercentage && !isIndeterminate)) && (
          <div className="flex flex-col items-center gap-2">
            {title && (
              <h1 className={`text-2xl font-semibold tracking-wide text-center ${t.textPrimary}`}>
                {title}
              </h1>
            )}
            {subtitle && (
              <p className={`text-sm ${t.textSecondary} text-center max-w-md`}>
                {subtitle}
              </p>
            )}
            {showPercentage && !isIndeterminate && (
              <div className={`text-sm ${t.textSecondary}`}>
                {Math.round(displayProgress)}%
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes loading-ring-rotate {
          to { transform: rotate(360deg); }
        }

        @keyframes spin-reverse {
          to { transform: rotate(-360deg); }
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

/**
 * Minimal inline loading indicator for smaller contexts.
 */
export function LoadingIndicator({
  text = 'Загрузка',
  className = '',
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: '0.6s',
            }}
          />
        ))}
      </div>
      <span>{text}</span>
    </div>
  );
}
