import { useEffect, useMemo, useRef, useState } from 'react';
import { useGameCardFsm } from './useGameCardFsm';

const FALLBACK_FAVICONS = ['favicon.png', 'favicon.svg', 'favicon.ico'] as const;
const FALLBACK_GAME_FAVICONS = [
  'favicon-96x96.png',
  'favicon.png',
  'favicon.svg',
  'favicon.ico',
] as const;

const withBasePath = (relativePath: string): string => {
  const base = import.meta.env.BASE_URL || '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  const clean = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  return `${prefix}${clean}`;
};

const gameIconsFile = (gameId: string, filename: string): string =>
  withBasePath(`games/${gameId}/icons/${filename}`);

const gameFaviconFile = (gameId: string, filename: string): string =>
  withBasePath(`games/${gameId}/favicon/${filename}`);

export interface GameCardProps {
  gameId: string;
  gameTitle: string;
  fallbackEmoji: string;
  available: boolean;
  onSelect?: () => void;
  ariaLabel?: string;
  className?: string;
}

export function GameCard({
  gameId,
  gameTitle,
  fallbackEmoji,
  available,
  onSelect,
  ariaLabel,
  className = '',
}: GameCardProps) {
  const emoji = fallbackEmoji || '🎯';
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const fsm = useGameCardFsm({ ref: buttonRef, interactive: available });

  const sources = useMemo(
    () => [
      gameIconsFile(gameId, 'game-card.webp'),
      ...FALLBACK_GAME_FAVICONS.map((name) => gameFaviconFile(gameId, name)),
      ...FALLBACK_FAVICONS.map((name) => gameIconsFile(gameId, name)),
    ],
    [gameId]
  );

  const [srcIndex, setSrcIndex] = useState(0);
  useEffect(() => setSrcIndex(0), [gameId]);

  const imageSrc = srcIndex < sources.length ? sources[srcIndex] : null;
  const isGameCardArt = srcIndex === 0 && !!imageSrc;
  const [isImageReady, setIsImageReady] = useState(false);

  useEffect(() => {
    setIsImageReady(false);
  }, [imageSrc]);

  return (
    <button
      type="button"
      ref={buttonRef}
      data-testid="game-card"
      data-available={available ? 'true' : 'false'}
      data-card-state={fsm.state}
      {...fsm.eventHandlers}
      className={[
        'game-card relative bg-transparent',
        'w-[176px] sm:w-[196px] md:w-[216px]',
        'flex flex-col items-stretch gap-3',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
        available ? 'cursor-pointer' : 'opacity-55 cursor-not-allowed',
        className,
      ].join(' ')}
      aria-label={ariaLabel}
      disabled={!available}
      onClick={() => {
        if (!available) return;
        onSelect?.();
      }}
    >
      <div className="game-card-face relative overflow-hidden rounded-xl border-4 w-full aspect-[2/3]">
        <div aria-hidden="true" className="absolute inset-0">
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-white/10 via-black/20 to-black/60">
            <span className="text-6xl leading-none drop-shadow-sm">{emoji}</span>
          </div>
          {imageSrc && (
            <img
              src={imageSrc}
              alt=""
              className={[
                'absolute inset-0 w-full h-full transition-opacity duration-300',
                isGameCardArt ? 'object-cover' : 'object-contain p-10',
                isImageReady ? 'opacity-100' : 'opacity-0',
              ].join(' ')}
              loading="lazy"
              draggable={false}
              onLoad={() => setIsImageReady(true)}
              onError={() => {
                setIsImageReady(false);
                setSrcIndex((i) => i + 1);
              }}
            />
          )}
        </div>

        <div
          aria-hidden="true"
          className="game-card-glass absolute inset-0 bg-gradient-to-b from-white/8 via-transparent to-black/60"
        />
        <div
          aria-hidden="true"
          className="game-card-glass absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-transparent"
        />
        <div aria-hidden="true" className="game-card-glare absolute" />
        <div
          aria-hidden="true"
          className="game-card-frame absolute inset-2 border border-white/10"
        />

        {!available && (
          <div className="absolute top-4 right-4 bg-black/55 text-white/80 px-3 py-1 rounded-full text-xs">
            Скоро
          </div>
        )}
      </div>

      <div className="relative w-full px-1">
        <span className="game-card-title block text-sm font-extrabold tracking-wide text-white drop-shadow-sm text-center truncate">
          {gameTitle}
        </span>
      </div>
    </button>
  );
}

export default GameCard;
