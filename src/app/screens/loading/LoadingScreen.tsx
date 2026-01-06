/**
 * App-level loading screen.
 * Keeps dependencies minimal and avoids engine imports.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import type { BaseTheme } from '@app/types';
import {
  buildBackgroundGradient,
  createEmojiLogo,
  getRingMetrics,
  toRgba,
  useSmoothedProgress,
  useViewportSize,
  type RingMetrics,
} from './loadingScreenLogic';

import '@app/styles/LoadingScreen.css';

export interface LoadingScreenProps {
  /** Current progress (0-100). Leave undefined for indeterminate loading. */
  progress?: number;
  /** Optional extra class names for the root container. */
  className?: string;
  /** Legacy loading background override (prefer BaseTheme). */
  loadingBgColor?: string;
  /** Base theme hints (optional). */
  theme?: BaseTheme;
  /** Logo image URL (optional) */
  logoUrl?: string;
  /** Logo emoji fallback (optional) */
  logoEmoji?: string;
}

const DEFAULT_LOGO_EMOJI = '🎯';
const RING_TRACK_COLOR = 'rgba(255, 255, 255, 0.12)';

const DEFAULT_LOGO_URL = createEmojiLogo(DEFAULT_LOGO_EMOJI);

interface LoadingRingProps {
  ring: RingMetrics;
  accentColor: string;
  logoSrc: string;
  onLogoError: () => void;
  glintRef: RefObject<SVGCircleElement>;
}

/**
 * Pure visual ring renderer. All sizing and animation values come from props.
 */
const LoadingRing = ({
  ring,
  accentColor,
  logoSrc,
  onLogoError,
  glintRef,
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
          className="loading-screen__glint loading-screen__glint--manual"
          ref={glintRef}
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
  className,
  loadingBgColor,
  theme,
  logoUrl,
  logoEmoji,
}: LoadingScreenProps) {
  const { isIndeterminate, displayProgress } = useSmoothedProgress(progress);
  const viewport = useViewportSize();
  const glintRef = useRef<SVGCircleElement | null>(null);

  const accentColor = theme?.glow ?? '#f59e0b';
  const accentGlow =
    toRgba(accentColor, 0.4) ?? 'rgba(245, 158, 11, 0.4)';
  const accentGlowSoft =
    toRgba(accentColor, 0.35) ?? 'rgba(245, 158, 11, 0.35)';
  const accentGlowStrong =
    toRgba(accentColor, 0.6) ?? 'rgba(245, 158, 11, 0.6)';
  const bgFrom = theme?.bgFrom ?? loadingBgColor ?? '#0b0f14';
  const bgVia = theme?.bgVia ?? toRgba(bgFrom, 0.35) ?? bgFrom;
  const bgTo = theme?.bgTo ?? '#000';
  const plateauHighlight = toRgba(bgFrom, 0.9) ?? bgFrom;
  const plateauMid = toRgba(bgFrom, 0.75) ?? bgFrom;
  const plateauDeep = toRgba(bgFrom, 0.65) ?? bgFrom;
  const backgroundGradient = buildBackgroundGradient({
    from: bgFrom,
    via: bgVia,
    to: bgTo,
  });
  const fallbackEmoji = logoEmoji ?? DEFAULT_LOGO_EMOJI;
  const resolvedLogoUrl =
    logoUrl ?? (logoEmoji ? createEmojiLogo(logoEmoji) : DEFAULT_LOGO_URL);
  const [logoFailed, setLogoFailed] = useState(false);
  const logoSrc = logoFailed ? createEmojiLogo(fallbackEmoji) : resolvedLogoUrl;
  const ring = getRingMetrics(displayProgress, isIndeterminate, viewport);
  const glintMetricsRef = useRef({
    ringCircumference: ring.ringCircumference,
    progressLength: ring.progressLength,
    glintDotLength: ring.glintDotLength,
    glintLength: ring.glintLength,
    visible: ring.glintVisible,
  });

  useEffect(() => {
    setLogoFailed(false);
  }, [resolvedLogoUrl]);

  useEffect(() => {
    glintMetricsRef.current = {
      ringCircumference: ring.ringCircumference,
      progressLength: ring.progressLength,
      glintDotLength: ring.glintDotLength,
      glintLength: ring.glintLength,
      visible: ring.glintVisible,
    };
  }, [
    ring.glintDotLength,
    ring.glintLength,
    ring.glintVisible,
    ring.progressLength,
    ring.ringCircumference,
  ]);

  useEffect(() => {
    const glintEl = glintRef.current;
    if (!glintEl || !ring.glintVisible) return;

    let rafId = 0;
    const start = performance.now();
    const cycleMs = 3400;

    const tick = (now: number) => {
      const { ringCircumference, progressLength, glintDotLength, glintLength } =
        glintMetricsRef.current;
      const dotLen = Math.min(
        progressLength,
        Math.max(glintDotLength * 0.45, 1.2)
      );
      const dashLen = Math.min(glintLength, progressLength);
      const dotHoldLen = Math.max(dotLen * 3, dashLen * 0.2, 0.001) * 1.5;
      const growthLen = Math.max(dashLen - dotLen, 0);
      const travelLen = Math.max(progressLength - dashLen, 0);
      const totalLen = travelLen + growthLen * 2 + dotHoldLen * 2;

      if (!Number.isFinite(totalLen) || totalLen <= 0) {
        const gap = Math.max(ringCircumference - dotLen, 0);
        glintEl.style.strokeDasharray = `${dotLen} ${gap}`;
        glintEl.style.strokeDashoffset = '0';
        glintEl.style.opacity = '0';
        rafId = requestAnimationFrame(tick);
        return;
      }

      const elapsed = (now - start) % cycleMs;
      const distance = (elapsed / cycleMs) * totalLen;

      let length = dotLen;
      let offset = 0;
      let opacity = 1;

      if (distance < dotHoldLen) {
        length = dotLen;
        offset = 0;
        opacity = distance / dotHoldLen;
      } else if (distance < dotHoldLen + growthLen) {
        const grow = distance - dotHoldLen;
        length = dotLen + grow;
        offset = 0;
      } else if (distance < dotHoldLen + growthLen + travelLen) {
        const travel = distance - (dotHoldLen + growthLen);
        length = dashLen;
        offset = -travel;
      } else if (distance < dotHoldLen + growthLen + travelLen + growthLen) {
        const shrink = distance - (dotHoldLen + growthLen + travelLen);
        length = dashLen - shrink;
        offset = -(progressLength - length);
      } else {
        const fade = distance - (dotHoldLen + growthLen + travelLen + growthLen);
        length = dotLen;
        offset = -(progressLength - dotLen);
        opacity = Math.max(1 - fade / dotHoldLen, 0);
      }

      const gap = Math.max(ringCircumference - length, 0);
      const alpha = Math.min(Math.max(opacity, 0), 1) * 0.95;

      glintEl.style.strokeDasharray = `${length} ${gap}`;
      glintEl.style.strokeDashoffset = `${offset}`;
      glintEl.style.opacity = alpha.toFixed(3);

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [ring.glintVisible]);

  return (
    <div
      className={['engine loading-screen', className].filter(Boolean).join(' ')}
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
          glintRef={glintRef}
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
