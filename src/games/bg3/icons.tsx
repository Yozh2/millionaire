import type { DrawCoinFunction } from '@engine/types';
import { gameIconsFile } from '@public';

// ============================================
// Custom Coin Drawing - BG3-style gold (sprite, with vector fallback)
// ============================================

const GOLD_PARTICLE_FILENAMES = ['gold1.webp', 'gold2.webp', 'gold3.webp'] as const;
const GOLD_PARTICLE_SRCS = GOLD_PARTICLE_FILENAMES.map((filename) =>
  gameIconsFile('bg3', filename)
);

const goldParticleImages: Array<HTMLImageElement | null> = Array.from(
  { length: GOLD_PARTICLE_SRCS.length },
  () => null
);
const goldParticleReady = Array.from({ length: GOLD_PARTICLE_SRCS.length }, () => false);

const ensureGoldParticleImage = (index: number): HTMLImageElement | null => {
  const idx = index % GOLD_PARTICLE_SRCS.length;
  const existing = goldParticleImages[idx];
  if (existing || typeof Image === 'undefined') return existing;

  const img = new Image();
  img.decoding = 'async';
  img.src = GOLD_PARTICLE_SRCS[idx]!;
  img.onload = () => {
    goldParticleReady[idx] = true;
  };
  img.onerror = () => {
    goldParticleReady[idx] = false;
  };

  goldParticleImages[idx] = img;
  return img;
};

const drawVectorGoldFallback: DrawCoinFunction = (ctx, size, colorIndex) => {
  const fills = [
    ['#FFF7CC', '#FFD369', '#F4B01A', '#B86B0A'],
    ['#FFFBEB', '#FCD34D', '#F59E0B', '#92400E'],
    ['#FDE68A', '#FBBF24', '#EAB308', '#A16207'],
  ] as const;

  const palette = fills[colorIndex % fills.length]!;
  const w = size * 1.05;
  const h = size * 0.72;
  const inset = w * 0.32; // hourglass pinch

  // 6-point "hourglass" ingot silhouette
  const p0 = { x: -w / 2, y: -h / 2 };
  const p1 = { x: w / 2, y: -h / 2 };
  const p2 = { x: inset / 2, y: 0 };
  const p3 = { x: w / 2, y: h / 2 };
  const p4 = { x: -w / 2, y: h / 2 };
  const p5 = { x: -inset / 2, y: 0 };

  const drawPoly = (scale: number) => {
    const s = scale;
    const a0 = { x: p0.x * s, y: p0.y * s };
    const a1 = { x: p1.x * s, y: p1.y * s };
    const a2 = { x: p2.x * s, y: p2.y * s };
    const a3 = { x: p3.x * s, y: p3.y * s };
    const a4 = { x: p4.x * s, y: p4.y * s };
    const a5 = { x: p5.x * s, y: p5.y * s };

    ctx.beginPath();
    ctx.moveTo(a0.x, a0.y);
    ctx.lineTo(a1.x, a1.y);
    ctx.lineTo(a2.x, a2.y);
    ctx.lineTo(a3.x, a3.y);
    ctx.lineTo(a4.x, a4.y);
    ctx.lineTo(a5.x, a5.y);
    ctx.closePath();
  };

  const fillGradient = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  fillGradient.addColorStop(0, palette[0]);
  fillGradient.addColorStop(0.22, palette[1]);
  fillGradient.addColorStop(0.68, palette[2]);
  fillGradient.addColorStop(1, palette[3]);

  // Outer glow
  ctx.save();
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.9);
  glow.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
  glow.addColorStop(0.45, 'rgba(255, 214, 120, 0.16)');
  glow.addColorStop(1, 'rgba(255, 214, 120, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Base shape
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  drawPoly(1);
  ctx.fillStyle = fillGradient;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.lineWidth = Math.max(1, size * 0.08);
  ctx.stroke();
  ctx.restore();

  // Inset facet
  ctx.save();
  drawPoly(0.78);
  const insetGradient = ctx.createLinearGradient(-w / 3, -h / 3, w / 3, h / 3);
  insetGradient.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
  insetGradient.addColorStop(0.45, 'rgba(255, 255, 255, 0.10)');
  insetGradient.addColorStop(1, 'rgba(0, 0, 0, 0.18)');
  ctx.fillStyle = insetGradient;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = Math.max(1, size * 0.03);
  ctx.stroke();
  ctx.restore();

  // Sparkle
  ctx.save();
  ctx.translate(-w * 0.18, -h * 0.32);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = Math.max(1, size * 0.04);
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
  ctx.shadowBlur = size * 0.18;
  const l = size * 0.14;
  ctx.beginPath();
  ctx.moveTo(-l, 0);
  ctx.lineTo(l, 0);
  ctx.moveTo(0, -l);
  ctx.lineTo(0, l);
  ctx.stroke();
  ctx.restore();
};

export const drawGoldCoin: DrawCoinFunction = (ctx, size, colorIndex) => {
  const idx = Math.abs(colorIndex) % GOLD_PARTICLE_SRCS.length;
  const img = ensureGoldParticleImage(idx);
  if (img && goldParticleReady[idx] && img.naturalWidth > 0) {
    const drawSize = size * 1.2;
    const prevSmoothing = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
    ctx.imageSmoothingEnabled = prevSmoothing;
    return;
  }

  drawVectorGoldFallback(ctx, size, idx);
};

/** Huge treasure icon for victory screen */
export const TrophyIcon = () => (
  <img
    src={gameIconsFile('bg3', 'gold3.webp')}
    alt="Huge Treasure"
    className="w-25 h-25 mx-auto"
  />
);

/** Money/coin icon for took money screen - a small pile of gold */
export const MoneyIcon = () => (
  <img
    src={gameIconsFile('bg3', 'gold2.webp')}
    alt="Small Treasure"
    className="w-25 h-25 mx-auto"
  />
);

/** Critical fail - D20 dice showing 1 */
export const CriticalFailIcon = () => (
  <img
    src={gameIconsFile('bg3', 'lost.webp')}
    alt="Critical Fail"
    className="w-25 h-25 mx-auto"
  />
);

/** Small coin icon for inline use - fantasy gold with G */
export const CoinIcon = () => (
  <img
    src={gameIconsFile('bg3', 'gold1.webp')}
    alt="Gold Coin"
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
