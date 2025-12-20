/**
 * Transformers - Icons and particle drawing.
 *
 * Keep `coin.webp` in `/public/games/transformers/icons/` for experiments, but by
 * default we render Energon as custom canvas/SVG crystals.
 */

import type { DrawCoinFunction } from '@engine/types';
import { useId } from 'react';

// ============================================
// Custom Energon Crystal Drawing (coins particles)
// ============================================

export const drawEnergonCrystal: DrawCoinFunction = (ctx, size, colorIndex) => {
  const colors = ['#FF69B4', '#00BFFF', '#DA70D6']; // Pink, Blue, Orchid
  const glowColors = ['#FFB6C1', '#87CEEB', '#DDA0DD'];

  const halfSize = size / 2;

  ctx.beginPath();
  ctx.moveTo(0, -halfSize); // Top
  ctx.lineTo(halfSize * 0.6, 0); // Right
  ctx.lineTo(0, halfSize); // Bottom
  ctx.lineTo(-halfSize * 0.6, 0); // Left
  ctx.closePath();

  ctx.fillStyle = colors[colorIndex % colors.length]!;
  ctx.fill();
  ctx.strokeStyle = glowColors[colorIndex % glowColors.length]!;
  ctx.lineWidth = 1.5;
  ctx.stroke();
};

// ============================================
// Inline "coin" icon (Energon crystal)
// ============================================

export const EnergonCoinIcon = () => {
  const rawId = useId();
  const safeId = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  const gradientId = `energonGradient-${safeId}`;
  const highlightId = `energonHighlight-${safeId}`;

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      className="inline-block"
      style={{ filter: 'drop-shadow(0 0 3px #00BFFF)' }}
      aria-hidden="true"
    >
      <polygon
        points="12,2 20,10 12,22 4,10"
        fill={`url(#${gradientId})`}
        stroke="#87CEEB"
        strokeWidth="1"
      />
      <polygon
        points="12,5 16,10 12,18 8,10"
        fill={`url(#${highlightId})`}
        opacity="0.6"
      />
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00BFFF" />
          <stop offset="50%" stopColor="#FF69B4" />
          <stop offset="100%" stopColor="#DA70D6" />
        </linearGradient>
        <linearGradient id={highlightId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#87CEEB" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
};
