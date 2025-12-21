/**
 * Sky: Children of the Light - Icons
 *
 * No external assets yet: simple, hand-drawn SVG/emoji icons.
 */

import {
  baseCenteredIconClass,
  getCampaignIconSizeClass,
  type CampaignIconProps,
  type DrawCoinFunction,
} from '@engine/types';
import { strings } from './strings';

// ============================================
// Custom Coin Drawing - Candle coin
// ============================================

export const drawCandleCoin: DrawCoinFunction = (ctx, size, colorIndex) => {
  const waxColors = ['#ffffff', '#e2e8f0', '#f8fafc'];
  const flameColors = ['#fbbf24', '#f59e0b', '#fde047'];
  const strokeColors = ['#94a3b8', '#cbd5e1', '#64748b'];

  const s = size;
  const w = s * 0.28;
  const h = s * 0.55;
  const r = s * 0.08;

  // Candle body (rounded rect)
  const x = -w / 2;
  const y = h * 0.05;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();

  ctx.fillStyle = waxColors[colorIndex % waxColors.length];
  ctx.fill();
  ctx.strokeStyle = strokeColors[colorIndex % strokeColors.length];
  ctx.lineWidth = 1.25;
  ctx.stroke();

  // Flame (teardrop)
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.4);
  ctx.bezierCurveTo(s * 0.2, -s * 0.25, s * 0.18, -s * 0.02, 0, 0);
  ctx.bezierCurveTo(-s * 0.18, -s * 0.02, -s * 0.2, -s * 0.25, 0, -s * 0.4);
  ctx.closePath();

  ctx.fillStyle = flameColors[colorIndex % flameColors.length];
  ctx.fill();
};

export const WingedLightVictoryIcon = () => (
  <div className="w-24 h-24 mx-auto flex items-center justify-center animate-bounce">
    <div
      className="text-6xl"
      style={{ textShadow: '0 0 20px rgba(56,189,248,0.6)' }}
      aria-label="Winged Light"
    >
      🪽
    </div>
  </div>
);

export const FallenStarIcon = () => (
  <div className="w-24 h-24 mx-auto flex items-center justify-center">
    <div
      className="text-6xl"
      style={{ textShadow: '0 0 18px rgba(239,68,68,0.55)' }}
      aria-label="Fallen Star"
    >
      🌑
    </div>
  </div>
);

export const CandleIcon = () => (
  <div className="w-24 h-24 mx-auto flex items-center justify-center">
    <div
      className="text-6xl"
      style={{ textShadow: '0 0 18px rgba(250,204,21,0.55)' }}
      aria-label="Candle"
    >
      🕯️
    </div>
  </div>
);

export const SmallCandleCoinIcon = () => (
  <span className="inline-block" aria-hidden="true">
    🕯️
  </span>
);

// ============================================
// Campaign icons (fallbacks when no .webp exists)
// ============================================

export const MothCampaignIcon = ({ className, size }: CampaignIconProps) => (
  <div
    className={`${baseCenteredIconClass} ${className ?? getCampaignIconSizeClass(size)}`}
    aria-label={strings.campaigns.moth.iconAlt}
  >
    <svg
      viewBox="0 0 56 56"
      className="w-full h-full"
      role="img"
      aria-hidden="true"
      style={{ filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.35))' }}
    >
      <path
        d="M28 24c-6.8 0-12.8 4.8-15.8 12.2 5.5-1.4 9.8-1 13.2 1.2 1.1.7 2 1.6 2.6 2.6V24z"
        fill="rgba(255, 255, 255, 0.85)"
        stroke="rgba(148, 163, 184, 0.65)"
        strokeWidth="1.5"
      />
      <path
        d="M28 24c6.8 0 12.8 4.8 15.8 12.2-5.5-1.4-9.8-1-13.2 1.2-1.1.7-2 1.6-2.6 2.6V24z"
        fill="rgba(255, 255, 255, 0.85)"
        stroke="rgba(148, 163, 184, 0.65)"
        strokeWidth="1.5"
      />
      <path
        d="M28 18c2.2 0 4 1.8 4 4v18c0 2.2-1.8 4-4 4s-4-1.8-4-4V22c0-2.2 1.8-4 4-4z"
        fill="rgba(251, 191, 36, 0.25)"
        stroke="rgba(251, 191, 36, 0.75)"
        strokeWidth="1.5"
      />
      <path
        d="M26 16c-2-2.2-3.5-3-5.8-3.6M30 16c2-2.2 3.5-3 5.8-3.6"
        fill="none"
        stroke="rgba(148, 163, 184, 0.75)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

export const IkemanCampaignIcon = ({ className, size }: CampaignIconProps) => (
  <div
    className={`${baseCenteredIconClass} ${className ?? getCampaignIconSizeClass(size)}`}
    aria-label={strings.campaigns.ikeman.iconAlt}
  >
    <svg
      viewBox="0 0 56 56"
      className="w-full h-full"
      role="img"
      aria-hidden="true"
      style={{ filter: 'drop-shadow(0 0 12px rgba(244, 63, 94, 0.35))' }}
    >
      <path
        d="M14 24l6 6 8-10 8 10 6-6 2 18H12l2-18z"
        fill="rgba(244, 63, 94, 0.20)"
        stroke="rgba(244, 63, 94, 0.75)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M20 34c2.8-2.2 5.4-3.2 8-3.2s5.2 1 8 3.2c-.8 6.2-4 10-8 10s-7.2-3.8-8-10z"
        fill="rgba(255, 255, 255, 0.12)"
        stroke="rgba(255, 255, 255, 0.45)"
        strokeWidth="1.5"
      />
      <path
        d="M23.5 36.5h5M27.5 36.5h5"
        stroke="rgba(255, 255, 255, 0.65)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  </div>
);
