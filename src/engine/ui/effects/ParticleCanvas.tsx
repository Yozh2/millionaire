/* eslint-disable react-refresh/only-export-components */
/**
 * Canvas-based particle animation system for visual effects.
 * Supports confetti, sparks, pulse, fireworks, and coins effects.
 */

import { useEffect, useRef, useCallback } from 'react';
import type { DrawCoinFunction } from '@engine/types';

// ============================================================================
// Types
// ============================================================================

export type EffectType = 'confetti' | 'sparks' | 'pulse' | 'fireworks' | 'coins' | 'lostSparks';

// Re-export DrawCoinFunction for convenience
export type { DrawCoinFunction };

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
  maxLife: number;
  type: 'rect' | 'circle' | 'star' | 'coin';
}

interface PulseWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  lineWidth: number;
}

interface ParticleCanvasProps {
  /** Effect type to trigger */
  effect: EffectType | null;
  /** Primary color for particles (CSS color string) */
  primaryColor?: string;
  /** Secondary color for particles */
  secondaryColor?: string;
  /** Origin point for effect (normalized 0-1, defaults to center) */
  origin?: { x: number; y: number };
  /** Callback when effect completes */
  onComplete?: () => void;
  /** Duration multiplier (1 = default) */
  intensity?: number;
  /** Custom coin drawing function for 'coins' effect */
  drawCoin?: DrawCoinFunction;
  /** Custom colors for lostSparks effect */
  lostSparkColors?: string[];
}

// ============================================================================
// Color utilities
// ============================================================================

const CONFETTI_COLORS = [
  '#FFD700', // Gold
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Light gold
  '#BB8FCE', // Purple
];

const SPARK_COLORS = [
  '#FFD700',
  '#FFA500',
  '#FFFF00',
  '#FFFFFF',
];

// ============================================================================
// Particle generation
// ============================================================================

const createConfettiParticle = (
  canvasWidth: number,
  canvasHeight: number,
  originX: number,
  originY: number
): Particle => {
  const angle = Math.random() * Math.PI * 2;
  const speed = 8 + Math.random() * 12;

  return {
    x: originX * canvasWidth,
    y: originY * canvasHeight,
    vx: Math.cos(angle) * speed * (0.5 + Math.random()),
    vy: Math.sin(angle) * speed - 10 - Math.random() * 5,
    size: 8 + Math.random() * 8,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    alpha: 1,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.3,
    life: 0,
    maxLife: 150 + Math.random() * 100,
    type: Math.random() > 0.5 ? 'rect' : 'circle',
  };
};

const createSparkParticle = (
  canvasWidth: number,
  canvasHeight: number,
  originX: number,
  originY: number
): Particle => {
  const angle = Math.random() * Math.PI * 2;
  const speed = 3 + Math.random() * 6;

  return {
    x: originX * canvasWidth,
    y: originY * canvasHeight,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size: 2 + Math.random() * 4,
    color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
    alpha: 1,
    rotation: 0,
    rotationSpeed: 0,
    life: 0,
    maxLife: 40 + Math.random() * 30,
    type: 'circle',
  };
};

const createFireworkParticle = (
  canvasWidth: number,
  canvasHeight: number,
  originX: number,
  originY: number,
  baseColor: string
): Particle => {
  const angle = Math.random() * Math.PI * 2;
  const speed = 2 + Math.random() * 8;

  return {
    x: originX * canvasWidth,
    y: originY * canvasHeight,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size: 3 + Math.random() * 3,
    color: baseColor,
    alpha: 1,
    rotation: 0,
    rotationSpeed: 0,
    life: 0,
    maxLife: 60 + Math.random() * 40,
    type: 'circle',
  };
};

const createCoinParticle = (
  canvasWidth: number,
  canvasHeight: number,
  originX: number,
  originY: number
): Particle => {
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8; // Mostly upward
  const speed = 6 + Math.random() * 8; // Moderate initial speed

  return {
    x: originX * canvasWidth,
    y: originY * canvasHeight,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 8, // Stronger upward boost
    size: 18 + Math.random() * 10,
    color: String(Math.floor(Math.random() * 3)),
    alpha: 1,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.3,
    life: 0,
    maxLife: 50 + Math.random() * 20, // Short life for fast animation
    type: 'coin',
  };
};

/**
 * Creates a tiny spark particle for defeat screen effect.
 * These are small, fast-moving sparks that scatter from the broken icon.
 */
const createLostSparkParticle = (
  canvasWidth: number,
  canvasHeight: number,
  originX: number,
  originY: number,
  colors: string[]
): Particle => {
  const angle = Math.random() * Math.PI * 2; // All directions
  const speed = 2 + Math.random() * 5; // Moderate speed, slower than coins

  return {
    x: originX * canvasWidth,
    y: originY * canvasHeight,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 2, // Slight upward bias
    size: 2 + Math.random() * 3, // Very small sparks
    color: colors[Math.floor(Math.random() * colors.length)],
    alpha: 1,
    rotation: 0,
    rotationSpeed: 0,
    life: 0,
    maxLife: 40 + Math.random() * 30, // Short life
    type: 'circle',
  };
};

// ============================================================================
// Drawing utilities
// ============================================================================

/**
 * Default simple coin drawing - just a gold circle, no text for performance.
 */
export const drawDefaultCoin: DrawCoinFunction = (ctx, size, colorIndex) => {
  const colors = ['#FFD700', '#FFA500', '#FFEC8B'];
  const radius = size / 2;

  // Simple filled circle
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = colors[colorIndex % colors.length];
  ctx.fill();

  // Simple border
  ctx.strokeStyle = '#B8860B';
  ctx.lineWidth = 1.5;
  ctx.stroke();
};

const drawParticle = (
  ctx: CanvasRenderingContext2D,
  particle: Particle,
  coinDrawFn: DrawCoinFunction = drawDefaultCoin
): void => {
  ctx.save();
  ctx.globalAlpha = particle.alpha;
  ctx.fillStyle = particle.color;
  ctx.translate(particle.x, particle.y);
  ctx.rotate(particle.rotation);

  switch (particle.type) {
    case 'rect':
      ctx.fillRect(
        -particle.size / 2,
        -particle.size / 4,
        particle.size,
        particle.size / 2
      );
      break;
    case 'circle':
      ctx.beginPath();
      ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'star':
      drawStar(ctx, 0, 0, 5, particle.size / 2, particle.size / 4);
      ctx.fill();
      break;
    case 'coin':
      coinDrawFn(ctx, particle.size, parseInt(particle.color) || 0);
      break;
  }

  ctx.restore();
};

const drawStar = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
): void => {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);

  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(
      cx + Math.cos(rot) * outerRadius,
      cy + Math.sin(rot) * outerRadius
    );
    rot += step;
    ctx.lineTo(
      cx + Math.cos(rot) * innerRadius,
      cy + Math.sin(rot) * innerRadius
    );
    rot += step;
  }

  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
};

const drawPulseWave = (
  ctx: CanvasRenderingContext2D,
  wave: PulseWave
): void => {
  ctx.save();
  ctx.globalAlpha = wave.alpha;
  ctx.strokeStyle = wave.color;
  ctx.lineWidth = wave.lineWidth;
  ctx.beginPath();
  ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
};

// ============================================================================
// Component
// ============================================================================

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({
  effect,
  primaryColor = '#FFD700',
  secondaryColor = '#FF6B6B',
  origin = { x: 0.5, y: 0.5 },
  onComplete,
  intensity = 1,
  drawCoin = drawDefaultCoin,
  lostSparkColors,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const wavesRef = useRef<PulseWave[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastEffectRef = useRef<EffectType | null>(null);

  // Spawn particles based on effect type
  const spawnEffect = useCallback(
    (effectType: EffectType) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const maxVisibleRadius = Math.min(width, height);

      switch (effectType) {
        case 'confetti':
          // Spawn confetti burst (reduced for performance)
          for (let i = 0; i < Math.floor(40 * intensity); i++) {
            particlesRef.current.push(
              createConfettiParticle(width, height, origin.x, origin.y)
            );
          }
          break;

        case 'coins':
          // Spawn coin burst (5-10 coins per burst)
          const coinCount = 5 + Math.floor(Math.random() * 6); // 5-10 coins
          for (let i = 0; i < coinCount; i++) {
            particlesRef.current.push(
              createCoinParticle(width, height, origin.x, origin.y)
            );
          }
          break;

        case 'sparks':
          // Spawn spark burst
          for (let i = 0; i < Math.floor(15 * intensity); i++) {
            particlesRef.current.push(
              createSparkParticle(width, height, origin.x, origin.y)
            );
          }
          break;

        case 'lostSparks': {
          // Spawn tiny spark particles for defeat screen (5-10 per burst)
          const sparkCount = 5 + Math.floor(Math.random() * 6);
          const colors = lostSparkColors || SPARK_COLORS;
          for (let i = 0; i < sparkCount; i++) {
            particlesRef.current.push(
              createLostSparkParticle(width, height, origin.x, origin.y, colors)
            );
          }
          break;
        }

        case 'pulse':
          // Create expanding pulse wave
          wavesRef.current.push({
            x: origin.x * width,
            y: origin.y * height,
            radius: 10,
            maxRadius: maxVisibleRadius * 0.5,
            alpha: 0.8,
            color: primaryColor,
            lineWidth: 4,
          });
          // Second wave with delay effect
          setTimeout(() => {
            wavesRef.current.push({
              x: origin.x * width,
              y: origin.y * height,
              radius: 10,
              maxRadius: maxVisibleRadius * 0.4,
              alpha: 0.6,
              color: secondaryColor,
              lineWidth: 2,
            });
          }, 100);
          break;

        case 'fireworks':
          // Multiple firework bursts
          const colors = [primaryColor, secondaryColor, '#FFD700', '#4ECDC4'];
          const burstCount = Math.floor(3 * intensity);

          for (let b = 0; b < burstCount; b++) {
            const burstX = 0.2 + Math.random() * 0.6;
            const burstY = 0.2 + Math.random() * 0.4;
            const burstColor = colors[b % colors.length];

            setTimeout(() => {
              for (let i = 0; i < 40; i++) {
                particlesRef.current.push(
                  createFireworkParticle(width, height, burstX, burstY, burstColor)
                );
              }
              // Add pulse at burst point
              wavesRef.current.push({
                x: burstX * width,
                y: burstY * height,
                radius: 5,
                maxRadius: 100,
                alpha: 0.5,
                color: burstColor,
                lineWidth: 2,
              });
            }, b * 300);
          }
          break;
      }
    },
    [origin, primaryColor, secondaryColor, intensity, lostSparkColors]
  );

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Update and draw particles
    particlesRef.current = particlesRef.current.filter((particle) => {
      particle.life++;

      // Physics
      particle.x += particle.vx;
      particle.y += particle.vy;
      // Reduced gravity for coins, normal for other particles
      particle.vy += particle.type === 'coin' ? 0.25 : 0.6;
      particle.vx *= 0.99; // Air resistance
      particle.rotation += particle.rotationSpeed;

      // Fade out
      const lifeRatio = particle.life / particle.maxLife;
      particle.alpha = Math.max(0, 1 - lifeRatio * lifeRatio);

      // Draw if still visible
      if (particle.alpha > 0.01) {
        drawParticle(ctx, particle, drawCoin);
        return true;
      }
      return false;
    });

    // Update and draw pulse waves
    wavesRef.current = wavesRef.current.filter((wave) => {
      wave.radius += 8;
      wave.alpha *= 0.96;
      wave.lineWidth *= 0.98;

      if (wave.alpha > 0.01 && wave.radius < wave.maxRadius) {
        drawPulseWave(ctx, wave);
        return true;
      }
      return false;
    });

    // Continue animation if there are active elements
    if (particlesRef.current.length > 0 || wavesRef.current.length > 0) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      animationRef.current = null;
      onComplete?.();
    }
  }, [onComplete, drawCoin]);

  // Handle effect changes
  useEffect(() => {
    if (effect && effect !== lastEffectRef.current) {
      lastEffectRef.current = effect;
      spawnEffect(effect);

      if (!animationRef.current) {
        animationRef.current = requestAnimationFrame(animate);
      }
    }

    // Reset when effect becomes null
    if (!effect) {
      lastEffectRef.current = null;
    }
  }, [effect, spawnEffect, animate]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);

      const ctx = canvas.getContext('2d');
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="effects-canvas"
      className="absolute inset-0 pointer-events-none z-50"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default ParticleCanvas;
