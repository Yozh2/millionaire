/**
 * EffectsSandbox - Demo page for all available visual effects
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useEffects } from '../engine/hooks/useEffects';
import { ParticleCanvas } from '../engine/components/ParticleCanvas';

// Demo type for canvas effect cards
type DemoId =
  | 'lightning' | 'fire' | 'smoke' | 'stars'
  | 'vortex' | 'trail' | 'wave' | 'snow'
  | 'rainbow' | 'shatter' | 'focus' | 'orb';

interface CanvasDemoCardProps {
  title: string;
  description: string;
  demoId: DemoId;
}

/**
 * Interactive card showing a Canvas API effect demo
 */
function CanvasDemoCard({ title, description, demoId }: CanvasDemoCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = 0;
    }
    setIsPlaying(false);
  }, []);

  const startAnimation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsPlaying(true);
    const startTime = Date.now();
    const duration = 3000; // 3 seconds

    // Effect-specific drawing functions
    const drawEffects: Record<DemoId, (progress: number) => void> = {
      // Lightning effect
      lightning: (_progress) => {
        ctx.fillStyle = 'rgba(10, 10, 30, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (Math.random() > 0.7) {
          ctx.strokeStyle = `rgba(180, 200, 255, ${0.8 + Math.random() * 0.2})`;
          ctx.lineWidth = 2 + Math.random() * 3;
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#88aaff';

          let x = canvas.width / 2;
          let y = 0;
          ctx.beginPath();
          ctx.moveTo(x, y);

          while (y < canvas.height) {
            x += (Math.random() - 0.5) * 40;
            y += 10 + Math.random() * 20;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      },

      // Fire effect
      fire: (progress) => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const particles = 8;
        for (let i = 0; i < particles; i++) {
          const x = canvas.width / 2 + (Math.random() - 0.5) * 40;
          const y = canvas.height - Math.random() * 60 * (1 + progress);
          const size = 5 + Math.random() * 15;
          const hue = 20 + Math.random() * 30;

          const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
          gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, 0.9)`);
          gradient.addColorStop(0.5, `hsla(${hue - 10}, 100%, 50%, 0.5)`);
          gradient.addColorStop(1, 'transparent');

          ctx.fillStyle = gradient;
          ctx.fillRect(x - size, y - size, size * 2, size * 2);
        }
      },

      // Smoke effect
      smoke: (progress) => {
        ctx.fillStyle = 'rgba(20, 20, 30, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 5; i++) {
          const x = canvas.width / 2 + Math.sin(progress * 5 + i) * 30;
          const y = canvas.height - (progress * canvas.height * 0.8) - i * 20;
          const size = 20 + i * 10 + progress * 30;

          const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
          gradient.addColorStop(0, `rgba(150, 150, 160, ${0.3 - progress * 0.2})`);
          gradient.addColorStop(1, 'transparent');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      },

      // Stars twinkle effect
      stars: (progress) => {
        ctx.fillStyle = 'rgba(5, 5, 20, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 20; i++) {
          const x = (i * 37) % canvas.width;
          const y = (i * 53) % canvas.height;
          const twinkle = Math.sin(progress * 10 + i * 2) * 0.5 + 0.5;
          const size = 1 + twinkle * 3;

          ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.8 + 0.2})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();

          // Star rays
          if (twinkle > 0.7) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${(twinkle - 0.7) * 2})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x - size * 2, y);
            ctx.lineTo(x + size * 2, y);
            ctx.moveTo(x, y - size * 2);
            ctx.lineTo(x, y + size * 2);
            ctx.stroke();
          }
        }
      },

      // Vortex/spiral effect
      vortex: (progress) => {
        ctx.fillStyle = 'rgba(10, 5, 20, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        for (let i = 0; i < 50; i++) {
          const angle = (i / 50) * Math.PI * 6 + progress * Math.PI * 4;
          const radius = i * 2 + 5;
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius;
          const hue = (i * 7 + progress * 360) % 360;

          ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.8)`;
          ctx.beginPath();
          ctx.arc(x, y, 2 + i * 0.05, 0, Math.PI * 2);
          ctx.fill();
        }
      },

      // Trail / motion blur effect
      trail: (progress) => {
        ctx.fillStyle = 'rgba(10, 10, 20, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const x = canvas.width * (0.2 + progress * 0.6);
        const y = canvas.height / 2 + Math.sin(progress * Math.PI * 4) * 30;

        // Trail
        for (let i = 10; i > 0; i--) {
          const trailX = x - i * 8;
          const alpha = (10 - i) / 10 * 0.5;
          ctx.fillStyle = `rgba(255, 150, 50, ${alpha})`;
          ctx.beginPath();
          ctx.arc(trailX, y, 8 - i * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Main object
        ctx.fillStyle = '#ffaa00';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff6600';
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      },

      // Wave / ripple effect
      wave: (progress) => {
        ctx.fillStyle = 'rgba(10, 20, 40, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        for (let i = 0; i < 4; i++) {
          const radius = progress * 80 + i * 25;
          const alpha = Math.max(0, 1 - radius / 120);

          ctx.strokeStyle = `rgba(100, 180, 255, ${alpha})`;
          ctx.lineWidth = 3 - i * 0.5;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      },

      // Snow effect
      snow: (progress) => {
        ctx.fillStyle = 'rgba(10, 15, 30, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 30; i++) {
          const seed = i * 123.456;
          const x = ((seed + progress * 50) % canvas.width);
          const y = ((i * 47 + progress * canvas.height * 2) % (canvas.height + 20)) - 10;
          const size = 2 + (i % 4);
          const wobble = Math.sin(progress * 5 + i) * 5;

          ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + (i % 5) * 0.1})`;
          ctx.beginPath();
          ctx.arc(x + wobble, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      },

      // Rainbow gradient flow
      rainbow: (progress) => {
        const gradient = ctx.createLinearGradient(
          0, 0,
          canvas.width, canvas.height
        );

        const offset = progress * 360;
        for (let i = 0; i <= 6; i++) {
          const hue = (i * 60 + offset) % 360;
          gradient.addColorStop(i / 6, `hsl(${hue}, 80%, 50%)`);
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      },

      // Shatter effect
      shatter: (progress) => {
        ctx.fillStyle = 'rgba(5, 5, 15, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const shards = 12;

        for (let i = 0; i < shards; i++) {
          const angle = (i / shards) * Math.PI * 2;
          const distance = progress * 60;
          const x = cx + Math.cos(angle) * distance;
          const y = cy + Math.sin(angle) * distance + progress * progress * 30;
          const rotation = progress * 3 + i;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(rotation);

          ctx.fillStyle = `rgba(150, 200, 255, ${1 - progress * 0.8})`;
          ctx.beginPath();
          ctx.moveTo(0, -8);
          ctx.lineTo(6, 4);
          ctx.lineTo(-6, 4);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        }
      },

      // Focus ring effect
      focus: (progress) => {
        ctx.fillStyle = 'rgba(10, 10, 20, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        for (let i = 0; i < 3; i++) {
          const baseRadius = 60 - i * 15;
          const radius = baseRadius - progress * baseRadius * 0.8;
          const alpha = progress;

          ctx.strokeStyle = `rgba(255, 200, 50, ${alpha})`;
          ctx.lineWidth = 3 - i;
          ctx.beginPath();
          ctx.arc(cx, cy, Math.max(5, radius), 0, Math.PI * 2);
          ctx.stroke();
        }

        // Center point
        if (progress > 0.7) {
          ctx.fillStyle = `rgba(255, 220, 100, ${(progress - 0.7) * 3})`;
          ctx.beginPath();
          ctx.arc(cx, cy, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      },

      // Magic orb effect
      orb: (progress) => {
        ctx.fillStyle = 'rgba(5, 0, 15, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const baseRadius = 35;

        // Outer glow
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 1.5);
        gradient.addColorStop(0, `rgba(180, 100, 255, 0.8)`);
        gradient.addColorStop(0.5, `rgba(100, 50, 200, 0.4)`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Inner energy
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 + progress * Math.PI * 2;
          const wobble = Math.sin(progress * 10 + i) * 5;
          const x = cx + Math.cos(angle) * (15 + wobble);
          const y = cy + Math.sin(angle) * (15 + wobble);

          ctx.fillStyle = `rgba(255, 200, 255, ${0.5 + Math.sin(progress * 8 + i) * 0.3})`;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      },
    };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      drawEffects[demoId](progress);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
        // Clear canvas after effect ends
        setTimeout(() => {
          ctx.fillStyle = 'rgba(20, 20, 30, 1)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }, 500);
      }
    };

    // Clear and start
    ctx.fillStyle = 'rgba(20, 20, 30, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animate();
  }, [demoId]);

  useEffect(() => {
    return () => stopAnimation();
  }, [stopAnimation]);

  return (
    <div
      className={`
        relative p-4 rounded-lg border-2 cursor-pointer transition-all
        ${isPlaying
          ? 'border-purple-400 bg-purple-900/30'
          : 'border-gray-600 bg-gray-800/50 hover:border-purple-500 hover:bg-gray-800'
        }
      `}
      onClick={() => !isPlaying && startAnimation()}
    >
      <canvas
        ref={canvasRef}
        width={200}
        height={120}
        className="w-full h-28 rounded bg-gray-900 mb-3"
      />
      <h4 className="text-lg font-bold text-white mb-1">{title}</h4>
      <p className="text-sm text-gray-400">{description}</p>
      {isPlaying && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-purple-500 rounded text-xs text-white">
          Playing...
        </div>
      )}
    </div>
  );
}

export function EffectsSandboxPage() {
  const effects = useEffects();
  const [lastEffect, setLastEffect] = useState<string>('');

  const triggerEffect = (
    name: string,
    fn: () => void
  ) => {
    setLastEffect(name);
    fn();
  };

  return (
    <div
      className="min-h-screen p-8 relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
      }}
    >
      {/* Particle Canvas Layer */}
      <ParticleCanvas
        effect={effects.effectState.effect}
        origin={effects.effectState.origin}
        primaryColor={effects.effectState.primaryColor}
        secondaryColor={effects.effectState.secondaryColor}
        intensity={effects.effectState.intensity}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        <h1 className="text-4xl font-bold text-center mb-2 text-white">
          🎨 Effects Sandbox
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Нажми на кнопку, чтобы увидеть эффект
        </p>

        {/* Last triggered effect */}
        {lastEffect && (
          <div className="text-center mb-6 text-lg text-yellow-400">
            Последний эффект: <strong>{lastEffect}</strong>
          </div>
        )}

        {/* Canvas Effects Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-amber-400 mb-4 border-b border-amber-400/30 pb-2">
            🎆 Canvas Particle Effects
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Confetti */}
            <button
              onClick={(e) => triggerEffect('Confetti', () =>
                effects.triggerConfetti({
                  x: e.clientX / window.innerWidth,
                  y: e.clientY / window.innerHeight,
                })
              )}
              className="effect-demo-btn bg-gradient-to-b from-pink-500 to-pink-700"
            >
              🎉 Confetti
              <span className="block text-xs mt-1 opacity-70">Победа / Деньги</span>
            </button>

            {/* Sparks */}
            <button
              onClick={(e) => triggerEffect('Sparks', () =>
                effects.triggerSparks({
                  x: e.clientX / window.innerWidth,
                  y: e.clientY / window.innerHeight,
                })
              )}
              className="effect-demo-btn bg-gradient-to-b from-yellow-500 to-orange-600"
            >
              ✨ Sparks
              <span className="block text-xs mt-1 opacity-70">Правильный ответ</span>
            </button>

            {/* Pulse */}
            <button
              onClick={(e) => triggerEffect('Pulse', () =>
                effects.triggerPulse({
                  x: e.clientX / window.innerWidth,
                  y: e.clientY / window.innerHeight,
                }, '#4ECDC4')
              )}
              className="effect-demo-btn bg-gradient-to-b from-teal-500 to-teal-700"
            >
              🔮 Pulse
              <span className="block text-xs mt-1 opacity-70">Подсказки</span>
            </button>

            {/* Fireworks */}
            <button
              onClick={() => triggerEffect('Fireworks', () =>
                effects.triggerFireworks()
              )}
              className="effect-demo-btn bg-gradient-to-b from-purple-500 to-purple-700"
            >
              🎇 Fireworks
              <span className="block text-xs mt-1 opacity-70">Полная победа</span>
            </button>
          </div>
        </section>

        {/* CSS Button Effects Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-amber-400 mb-4 border-b border-amber-400/30 pb-2">
            🖱️ CSS Button Effects
          </h2>

          <div className="space-y-6">
            {/* Answer Button Style */}
            <div>
              <h3 className="text-lg text-gray-300 mb-3">Answer Button (hover + press)</h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="shine-button answer-btn px-4 py-3 bg-gradient-to-b from-stone-700 to-stone-900 text-amber-100 border-4 border-stone-600 text-left">
                  <span className="text-amber-400 mr-2 font-bold">[A]</span>
                  Наведи и нажми
                </button>
                <button className="shine-button answer-btn px-4 py-3 bg-gradient-to-b from-green-700 to-green-900 text-green-100 border-4 border-green-500 text-left">
                  <span className="text-green-300 mr-2 font-bold">[B]</span>
                  Правильный ответ
                </button>
              </div>
            </div>

            {/* Action Button Style */}
            <div>
              <h3 className="text-lg text-gray-300 mb-3">Action Button (3D press)</h3>
              <div className="flex gap-4 flex-wrap">
                <button
                  className="shine-button action-btn px-8 py-3 bg-gradient-to-b from-amber-600 to-amber-800 text-white font-bold border-4 border-amber-500"
                  style={{
                    ['--btn-glow' as string]: 'rgba(255, 180, 0, 0.5)',
                    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.3), 0 0 25px rgba(255, 180, 0, 0.3)',
                    borderStyle: 'ridge',
                  }}
                >
                  🎮 Начать игру
                </button>
                <button
                  className="shine-button action-btn px-8 py-3 bg-gradient-to-b from-blue-600 to-blue-800 text-white font-bold border-4 border-blue-500"
                  style={{
                    ['--btn-glow' as string]: 'rgba(0, 150, 255, 0.5)',
                    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.3), 0 0 25px rgba(0, 150, 255, 0.3)',
                    borderStyle: 'ridge',
                  }}
                >
                  🔄 Новая игра
                </button>
                <button
                  className="shine-button action-btn px-8 py-3 bg-gradient-to-b from-red-600 to-red-800 text-white font-bold border-4 border-red-500"
                  style={{
                    ['--btn-glow' as string]: 'rgba(255, 50, 50, 0.5)',
                    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.3), 0 0 25px rgba(255, 50, 50, 0.3)',
                    borderStyle: 'ridge',
                  }}
                >
                  💀 Dark Mode
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Color Variations */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-amber-400 mb-4 border-b border-amber-400/30 pb-2">
            🎨 Pulse Color Variations
          </h2>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { name: 'Gold', color: '#FFD700' },
              { name: 'Teal', color: '#4ECDC4' },
              { name: 'Purple', color: '#BB8FCE' },
              { name: 'Red', color: '#FF6B6B' },
              { name: 'Blue', color: '#45B7D1' },
              { name: 'Green', color: '#96CEB4' },
            ].map(({ name, color }) => (
              <button
                key={name}
                onClick={(e) => triggerEffect(`Pulse (${name})`, () =>
                  effects.triggerPulse({
                    x: e.clientX / window.innerWidth,
                    y: e.clientY / window.innerHeight,
                  }, color)
                )}
                className="px-4 py-3 rounded-lg font-bold text-white transition-transform hover:scale-105"
                style={{ backgroundColor: color }}
              >
                {name}
              </button>
            ))}
          </div>
        </section>

        {/* Intensity Test */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-amber-400 mb-4 border-b border-amber-400/30 pb-2">
            💪 Effect Intensity
          </h2>
          <p className="text-gray-400 mb-4 text-sm">
            Разная интенсивность конфетти (количество частиц)
          </p>

          <div className="flex gap-4 flex-wrap">
            {[0.5, 1, 1.5, 2].map((intensity) => (
              <button
                key={intensity}
                onClick={() => {
                  setLastEffect(`Confetti x${intensity}`);
                  // Manually trigger with custom intensity
                  effects.effectState.intensity = intensity;
                  effects.triggerConfetti({ x: 0.5, y: 0.5 });
                }}
                className="px-6 py-3 bg-gradient-to-b from-pink-500 to-pink-700 text-white font-bold rounded-lg hover:scale-105 transition-transform"
              >
                x{intensity}
              </button>
            ))}
          </div>
        </section>

        {/* Additional Canvas API Effects - Ideas */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-purple-400 mb-4 border-b border-purple-400/30 pb-2">
            🔮 Дополнительные Canvas API эффекты (идеи)
          </h2>
          <p className="text-gray-400 mb-6 text-sm">
            Ниже показаны дополнительные эффекты, которые можно реализовать с помощью Canvas API.
            Нажимай на карточки, чтобы увидеть демо-анимации.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CanvasDemoCard
              title="⚡ Lightning / Electric Arc"
              description="Молнии и электрические дуги между точками"
              demoId="lightning"
            />
            <CanvasDemoCard
              title="🔥 Fire / Flame"
              description="Эффект огня с частицами и градиентами"
              demoId="fire"
            />
            <CanvasDemoCard
              title="💨 Smoke / Fog"
              description="Мягкий дым или туман с размытием"
              demoId="smoke"
            />
            <CanvasDemoCard
              title="✨ Stars / Twinkle"
              description="Мерцающие звёзды с переливами"
              demoId="stars"
            />
            <CanvasDemoCard
              title="🌀 Vortex / Spiral"
              description="Воронка или спираль частиц"
              demoId="vortex"
            />
            <CanvasDemoCard
              title="💫 Trail / Motion Blur"
              description="След за объектом с размытием движения"
              demoId="trail"
            />
            <CanvasDemoCard
              title="🌊 Wave / Ripple"
              description="Волны на воде с интерференцией"
              demoId="wave"
            />
            <CanvasDemoCard
              title="❄️ Snow / Particles"
              description="Падающий снег с вращением"
              demoId="snow"
            />
            <CanvasDemoCard
              title="🌈 Rainbow / Gradient Flow"
              description="Перетекающие радужные градиенты"
              demoId="rainbow"
            />
            <CanvasDemoCard
              title="💎 Crystal / Shatter"
              description="Разбивающийся кристалл на осколки"
              demoId="shatter"
            />
            <CanvasDemoCard
              title="🎯 Focus Ring"
              description="Фокусирующиеся концентрические кольца"
              demoId="focus"
            />
            <CanvasDemoCard
              title="🔮 Magic Orb"
              description="Магическая сфера с внутренней энергией"
              demoId="orb"
            />
          </div>
        </section>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <a
            href="/millionaire/"
            className="text-amber-400 hover:text-amber-300 underline"
          >
            ← Вернуться к играм
          </a>
        </div>
      </div>

      {/* Demo button styles */}
      <style>{`
        .effect-demo-btn {
          padding: 1rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: bold;
          color: white;
          border: none;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }
        .effect-demo-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .effect-demo-btn:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
}

export default EffectsSandboxPage;
