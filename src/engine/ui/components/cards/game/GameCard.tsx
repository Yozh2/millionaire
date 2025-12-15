import type { CSSProperties } from 'react';
import { useGameIcon } from '../../../hooks/useFavicon';

export interface GameCardProps {
  gameId: string;
  title: string;
  subtitle: string;
  description: string;
  fallbackEmoji: string;
  gradientClass: string;
  borderColorClass: string;
  available: boolean;
  className?: string;
}

export function GameCard({
  gameId,
  title,
  subtitle,
  description,
  fallbackEmoji,
  gradientClass,
  borderColorClass,
  available,
  className = '',
}: GameCardProps) {
  const { iconUrl, isEmoji, emoji } = useGameIcon(gameId, fallbackEmoji);

  const glowByBorder: CSSProperties = {
    ['--game-glow' as string]: 'rgba(255, 255, 255, 0.22)',
  };

  return (
    <div
      data-testid="game-card"
      data-available={available ? 'true' : 'false'}
      className={[
        'game-card relative overflow-hidden rounded-xl border-4 p-6',
        borderColorClass,
        `bg-gradient-to-b ${gradientClass}`,
        available ? 'cursor-pointer' : 'opacity-55 cursor-not-allowed',
        className,
      ].join(' ')}
      style={glowByBorder}
    >
      <div
        aria-hidden="true"
        className="game-card-glass absolute inset-0 bg-gradient-to-b from-white/12 via-transparent to-black/40"
      />
      <div
        aria-hidden="true"
        className="game-card-glass absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"
      />
      <div
        aria-hidden="true"
        className="game-card-glare absolute"
      />
      <div
        aria-hidden="true"
        className="game-card-frame absolute inset-2 border border-white/10"
      />

      {!available && (
        <div className="absolute top-4 right-4 bg-black/55 text-white/80 px-3 py-1 rounded-full text-xs">
          Скоро
        </div>
      )}

      <div className="relative h-full flex flex-col justify-between gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <div aria-hidden="true" className="game-card-icon-glow" />
            {isEmoji || !iconUrl ? (
              <span className="text-5xl leading-none">{emoji}</span>
            ) : (
              <img
                src={iconUrl}
                alt={`${gameId} icon`}
                className="w-12 h-12 object-contain"
              />
            )}
          </div>
        </div>

        <div className="relative">
          <h2 className="text-xl font-extrabold tracking-wide text-white drop-shadow-sm">
            {title}
          </h2>
          <p className="text-sm text-white/75 mt-1">{subtitle}</p>
          <p className="text-sm text-white/70 mt-4 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default GameCard;

