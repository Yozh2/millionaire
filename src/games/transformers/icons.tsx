/**
 * Transformers Game Icons
 *
 * Icons loaded from /public/games/transformers/icons/
 */

import type { DrawCoinFunction } from '@engine/types';
import { gameIconsFile } from '@public';

// ============================================
// Custom Energon Crystal Drawing - simple pink/blue crystal
// ============================================

export const drawEnergonCrystal: DrawCoinFunction = (ctx, size, colorIndex) => {
  const colors = ['#FF69B4', '#00BFFF', '#DA70D6']; // Pink, Blue, Orchid
  const glowColors = ['#FFB6C1', '#87CEEB', '#DDA0DD'];

  const halfSize = size / 2;

  // Simple diamond/crystal shape
  ctx.beginPath();
  ctx.moveTo(0, -halfSize); // Top
  ctx.lineTo(halfSize * 0.6, 0); // Right
  ctx.lineTo(0, halfSize); // Bottom
  ctx.lineTo(-halfSize * 0.6, 0); // Left
  ctx.closePath();

  ctx.fillStyle = colors[colorIndex % colors.length];
  ctx.fill();
  ctx.strokeStyle = glowColors[colorIndex % glowColors.length];
  ctx.lineWidth = 1.5;
  ctx.stroke();
};

/**
 * Victory icon - Matrix of Leadership
 */
export const MatrixIcon = () => (
  <div className="w-28 h-28 mx-auto flex items-center justify-center">
    <img
      src={gameIconsFile('transformers', 'MatrixTrophyShine.png')}
      alt="Matrix of Leadership"
      className="h-28 w-auto animate-pulse"
    />
  </div>
);

/**
 * Defeat icon - Destroyed
 */
export const DestroyedIcon = () => (
  <div className="w-24 h-24 mx-auto flex items-center justify-center text-6xl">
    💥
  </div>
);

/**
 * Take money icon - Energon cube (larger size for end screen)
 */
export const EnergonIcon = () => (
  <div className="h-40 mx-auto flex items-center justify-center">
    <img
      src={gameIconsFile('transformers', 'Energon.png')}
      alt="Energon"
      className="h-40 w-auto"
    />
  </div>
);

/**
 * Defeat icon - Broken Spark (extinguished spark)
 */
export const BrokenSparkIcon = () => (
  <div className="w-24 h-24 mx-auto flex items-center justify-center">
    <img
      src={gameIconsFile('transformers', 'BrokenSpark.png')}
      alt="Broken Spark"
      className="w-20 h-20"
    />
  </div>
);

/**
 * Small energon crystal icon for prize display (replaces coin)
 */
export const EnergonCoinIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    className="inline-block"
    style={{ filter: 'drop-shadow(0 0 3px #00BFFF)' }}
  >
    {/* Crystal shape */}
    <polygon
      points="12,2 20,10 12,22 4,10"
      fill="url(#energonGradient)"
      stroke="#87CEEB"
      strokeWidth="1"
    />
    {/* Inner highlight */}
    <polygon
      points="12,5 16,10 12,18 8,10"
      fill="url(#energonHighlight)"
      opacity="0.6"
    />
    {/* Gradients */}
    <defs>
      <linearGradient id="energonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00BFFF" />
        <stop offset="50%" stopColor="#FF69B4" />
        <stop offset="100%" stopColor="#DA70D6" />
      </linearGradient>
      <linearGradient id="energonHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#87CEEB" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);
