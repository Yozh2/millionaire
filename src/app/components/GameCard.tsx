import { useRef } from 'react';
import { useGameCardFsm } from './useGameCardFsm';
import { useGameCardImage } from './useGameCardImage';

import '@app/styles/GameCard.css';

export interface GameCardProps {
  gameId: string;
  title: string;
  emoji: string;
  available: boolean;
  onSelect?: () => void;
  ariaLabel?: string;
  className?: string;
}

export function GameCard({
  gameId,
  title,
  emoji,
  available,
  onSelect,
  ariaLabel,
  className = '',
}: GameCardProps) {
  const fallbackEmoji = emoji || '🎯';
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const fsm = useGameCardFsm({ ref: buttonRef, interactive: available });
  const {
    imageSrc,
    isGameCardArt,
    isImageReady,
    onImageLoad,
    onImageError,
  } = useGameCardImage(gameId);

  return (
    <button
      type="button"
      ref={buttonRef}
      data-testid="game-card"
      data-available={available ? 'true' : 'false'}
      data-card-state={fsm.state}
      {...fsm.eventHandlers}
      className={['game-card', className].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
      disabled={!available}
      onClick={() => {
        if (!available) return;
        onSelect?.();
      }}
    >
      <div className="game-card-face">
        <div aria-hidden="true" className="game-card__overlay">
          <div className="game-card__placeholder">
            <span className="game-card__emoji">{fallbackEmoji}</span>
          </div>
          {imageSrc && (
            <img
              src={imageSrc}
              alt=""
              className="game-card__image"
              data-image-kind={isGameCardArt ? 'art' : 'icon'}
              data-ready={isImageReady ? 'true' : 'false'}
              loading="lazy"
              draggable={false}
              onLoad={onImageLoad}
              onError={onImageError}
            />
          )}
        </div>

        <div
          aria-hidden="true"
          className="game-card-glass game-card__glass--edge"
        />
        <div
          aria-hidden="true"
          className="game-card-glass game-card__glass--shine"
        />
        <div aria-hidden="true" className="game-card-glare" />
        <div aria-hidden="true" className="game-card-frame" />

        {!available && (
          <div className="game-card__badge">Скоро</div>
        )}
      </div>

      <div className="game-card__title-wrap">
        <span className="game-card-title">{title}</span>
      </div>
    </button>
  );
}

export default GameCard;
