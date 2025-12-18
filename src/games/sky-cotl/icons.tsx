/**
 * Sky: Children of the Light - Icons
 *
 * No external assets yet: simple, hand-drawn SVG/emoji icons.
 */

import type { DrawCoinFunction } from '@engine/types';

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

export const WingedLightTrophyIcon = () => (
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

export const StarIcon = () => (
  <span className="inline-block text-yellow-400" aria-hidden="true">
    ✦
  </span>
);
