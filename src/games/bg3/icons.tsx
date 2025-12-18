/**
 * BG3 Game Icons
 *
 * Icons loaded from /public/games/bg3/icons/
 * These components wrap SVG files for use in React.
 */

import type { DrawCoinFunction } from '@engine/types';
import { gameIconsFile } from '@public';

// ============================================
// Custom Coin Drawing - Simple gold coin
// ============================================

export const drawGoldCoin: DrawCoinFunction = (ctx, size, colorIndex) => {
  const colors = ['#fbbf24', '#fcd34d', '#f59e0b'];
  const strokeColors = ['#b45309', '#d97706', '#92400e'];
  const radius = size / 2;

  // Simple gold circle
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = colors[colorIndex % colors.length];
  ctx.fill();
  ctx.strokeStyle = strokeColors[colorIndex % strokeColors.length];
  ctx.lineWidth = 1.5;
  ctx.stroke();
};

/** Trophy icon for victory screen */
export const TrophyIcon = () => (
  <img
    src={gameIconsFile('bg3', 'trophy.svg')}
    alt="Trophy"
    className="w-24 h-24 mx-auto animate-bounce"
  />
);

/** Money/coin icon for took money screen - stack of fantasy gold coins */
export const MoneyIcon = () => (
  <img
    src={gameIconsFile('bg3', 'money.svg')}
    alt="Gold Coins"
    className="w-24 h-24 mx-auto"
  />
);

/** Critical fail - D20 dice showing 1 */
export const CriticalFailIcon = () => (
  <img
    src={gameIconsFile('bg3', 'critical-fail.svg')}
    alt="Critical Fail"
    className="w-20 h-20 mx-auto"
  />
);

/** Small coin icon for inline use - fantasy gold with G */
export const CoinIcon = () => (
  <img
    src={gameIconsFile('bg3', 'coin.svg')}
    alt="Coin"
    className="w-5 h-5 inline mr-1"
  />
);

/** Scroll icon for hints */
export const ScrollIcon = () => (
  <span className="inline-block">📜</span>
);

/** Tavern icon for ask audience */
export const TavernIcon = () => (
  <span className="inline-block">🍺</span>
);

/** Star icon for difficulty */
export const StarIcon = () => (
  <span className="text-yellow-500">★</span>
);
