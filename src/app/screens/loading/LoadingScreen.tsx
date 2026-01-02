/**
 * App-level loading screen.
 * Keeps dependencies minimal and avoids engine imports.
 */

import { useEffect, useState, type CSSProperties } from 'react';
import { getBasePath } from '../../utils/paths';
import {
  buildBackgroundGradient,
  createEmojiLogo,
  getRingMetrics,
  toRgba,
  useSmoothedProgress,
  useViewportSize,
  type LoadingTheme,
  type RingMetrics,
} from './loadingScreenLogic';

import '@app/styles/LoadingScreen.css';

export type { LoadingTheme } from './loadingScreenLogic';

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
const RING_TRACK_COLOR = 'rgba(255, 255, 255, 0.12)';

const DEFAULT_LOGO_URL = `${getBasePath()}icons/favicon.svg`;

interface LoadingRingProps {
  ring: RingMetrics;
  accentColor: string;
  logoSrc: string;
  onLogoError: () => void;
}

/**
 * Pure visual ring renderer. All sizing and animation values come from props.
 */
const LoadingRing = ({
  ring,
  accentColor,
  logoSrc,
  onLogoError,
}: LoadingRingProps) => (
  <div
    className="loading-screen__ring-wrap"
    style={{
      width: `${ring.ringSize}px`,
      height: `${ring.ringSize}px`,
    }}
  >
    <div
      className="loading-screen__glow"
      style={{
        width: `${ring.glowSize}px`,
        height: `${ring.glowSize}px`,
      }}
    />
    <svg
      className="loading-screen__ring"
      width={ring.ringSize}
      height={ring.ringSize}
      viewBox={`0 0 ${ring.ringSize} ${ring.ringSize}`}
    >
      <circle
        cx={ring.ringSize / 2}
        cy={ring.ringSize / 2}
        r={ring.ringRadius}
        stroke={RING_TRACK_COLOR}
        strokeWidth={ring.ringStroke}
        fill="none"
      />
      <circle
        cx={ring.ringSize / 2}
        cy={ring.ringSize / 2}
        r={ring.ringRadius}
        stroke={accentColor}
        strokeWidth={ring.ringStroke}
        strokeLinecap="round"
        strokeDasharray={ring.progressDasharray}
        fill="none"
        transform={`rotate(-90 ${ring.ringSize / 2} ${ring.ringSize / 2})`}
      />
      {ring.glintVisible && (
        <circle
          cx={ring.ringSize / 2}
          cy={ring.ringSize / 2}
          r={ring.ringRadius}
          stroke="rgba(255, 255, 255, 0.9)"
          strokeWidth={Math.max(2, Math.round(ring.ringStroke * 0.55))}
          strokeLinecap="round"
          strokeDasharray="var(--glint-dot-dash)"
          fill="none"
          transform={`rotate(-90 ${ring.ringSize / 2} ${ring.ringSize / 2})`}
          style={ring.glintStyle}
          className="loading-screen__glint"
        />
      )}
    </svg>
    <div
      className="loading-screen__shell"
      style={{
        width: `${ring.shellSize}px`,
        height: `${ring.shellSize}px`,
      }}
    >
      <div
        className="loading-screen__core"
        style={{
          width: `${ring.coreSize}px`,
          height: `${ring.coreSize}px`,
        }}
      >
        <img
          src={logoSrc}
          alt="Loading"
          className="loading-screen__logo"
          style={{
            width: `${ring.logoSize}px`,
            height: `${ring.logoSize}px`,
          }}
          loading="eager"
          decoding="async"
          fetchpriority="high"
          onError={onLogoError}
        />
      </div>
    </div>
  </div>
);

/**
 * Full-screen loading overlay with a responsive, animated progress ring.
 */
export function LoadingScreen({
  progress,
  loadingBgColor,
  theme,
  logoUrl,
  logoEmoji,
}: LoadingScreenProps) {
  const { isIndeterminate, displayProgress } = useSmoothedProgress(progress);
  const viewport = useViewportSize();

  const accentColor = theme?.glowColor ?? '#f59e0b';
  const accentGlow =
    toRgba(accentColor, 0.4) ?? 'rgba(245, 158, 11, 0.4)';
  const accentGlowSoft =
    toRgba(accentColor, 0.35) ?? 'rgba(245, 158, 11, 0.35)';
  const accentGlowStrong =
    toRgba(accentColor, 0.6) ?? 'rgba(245, 158, 11, 0.6)';
  const plateauBase =
    loadingBgColor ??
    theme?.bgColor ??
    theme?.bgPanelFrom ??
    theme?.bgHeaderVia ??
    '#0b0f14';
  const plateauHighlight = toRgba(plateauBase, 0.9) ?? plateauBase;
  const plateauMid = toRgba(plateauBase, 0.75) ?? plateauBase;
  const plateauDeep = toRgba(plateauBase, 0.65) ?? plateauBase;
  const backgroundGradient = buildBackgroundGradient(plateauBase);
  const fallbackEmoji = logoEmoji ?? DEFAULT_LOGO_EMOJI;
  const resolvedLogoUrl =
    logoUrl ?? (logoEmoji ? createEmojiLogo(logoEmoji) : DEFAULT_LOGO_URL);
  const [logoFailed, setLogoFailed] = useState(false);
  const logoSrc = logoFailed ? createEmojiLogo(fallbackEmoji) : resolvedLogoUrl;
  const ring = getRingMetrics(displayProgress, isIndeterminate, viewport);

  useEffect(() => {
    setLogoFailed(false);
  }, [resolvedLogoUrl]);

  return (
    <div
      className="engine loading-screen"
      style={
        {
          background: backgroundGradient,
          '--loading-accent-glow': accentGlow,
          '--loading-accent-glow-soft': accentGlowSoft,
          '--loading-accent-glow-strong': accentGlowStrong,
          '--loading-panel-highlight': plateauHighlight,
          '--loading-panel-mid': plateauMid,
          '--loading-panel-deep': plateauDeep,
        } as CSSProperties
      }
    >
      <div className="loading-screen__noise" />

      <div className="loading-screen__content">
        <LoadingRing
          ring={ring}
          accentColor={accentColor}
          logoSrc={logoSrc}
          onLogoError={() => setLogoFailed(true)}
        />
      </div>
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
    <div className={['loading-indicator', className].filter(Boolean).join(' ')}>
      <div className="loading-indicator__dots">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="loading-indicator__dot"
            style={
              {
                '--dot-delay': `${i * 0.15}s`,
                '--dot-duration': '0.6s',
              } as CSSProperties
            }
          />
        ))}
      </div>
      <span>{text}</span>
    </div>
  );
}
