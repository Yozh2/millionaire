/**
 * Loading Screen Component
 *
 * Displays a loading progress bar while assets are being preloaded.
 * Styled to match the game's visual theme.
 */

import { useEffect, useState } from 'react';

import type { ThemeColors } from '@engine/types';

/** Props for LoadingScreen component */
export interface LoadingScreenProps {
  /** Current progress (0-100) */
  progress: number;
  /** Loading title text */
  title?: string;
  /** Optional subtitle/hint text */
  subtitle?: string;
  /** Theme colors (optional, uses default dark theme if not provided) */
  theme?: Partial<ThemeColors>;
  /** Logo image URL (optional) */
  logoUrl?: string;
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

/**
 * Loading screen with animated progress bar.
 */
export function LoadingScreen({
  progress,
  title = 'Загрузка...',
  subtitle,
  theme = defaultLoadingTheme,
  logoUrl,
  showPercentage = true,
  onComplete,
}: LoadingScreenProps) {
  // Smooth progress animation
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    // Animate to target progress
    const timer = setTimeout(() => {
      setDisplayProgress(progress);
    }, 50);

    return () => clearTimeout(timer);
  }, [progress]);

  // Call onComplete when we reach 100% and animation settles
  useEffect(() => {
    if (displayProgress >= 100 && onComplete) {
      const timer = setTimeout(onComplete, 300);
      return () => clearTimeout(timer);
    }
  }, [displayProgress, onComplete]);

  const t = { ...defaultLoadingTheme, ...theme };

  return (
    <div className="engine fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Content container */}
      <div className="relative flex flex-col items-center gap-8 px-8">
        {/* Logo */}
        {logoUrl && (
          <div className="animate-pulse">
            <img
              src={logoUrl}
              alt="Loading"
              className="h-24 w-auto object-contain drop-shadow-2xl"
            />
          </div>
        )}

        {/* Title */}
        <h1 className={`text-2xl font-bold ${t.textPrimary}`}>
          {title}
        </h1>

        {/* Progress bar container */}
        <div className="w-80 sm:w-96">
          {/* Progress bar background */}
          <div
            className={`
              h-3 rounded-full overflow-hidden
              ${t.bgPanel} ${t.border} border
              shadow-inner
            `}
          >
            {/* Progress bar fill */}
            <div
              className="h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden"
              style={{
                width: `${displayProgress}%`,
                background: 'linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)',
              }}
            >
              {/* Shimmer effect */}
              <div
                className="absolute inset-0 animate-shimmer"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  backgroundSize: '200% 100%',
                }}
              />
            </div>
          </div>

          {/* Progress percentage */}
          {showPercentage && (
            <div className={`mt-2 text-center text-sm ${t.textSecondary}`}>
              {Math.round(displayProgress)}%
            </div>
          )}
        </div>

        {/* Subtitle/hint */}
        {subtitle && (
          <p className={`text-sm ${t.textSecondary} text-center max-w-md`}>
            {subtitle}
          </p>
        )}

        {/* Loading dots animation */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: '0.6s',
              }}
            />
          ))}
        </div>
      </div>

      {/* Add shimmer animation keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
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
