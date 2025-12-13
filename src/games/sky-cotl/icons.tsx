/**
 * Sky: Children of the Light - Icons
 *
 * No external assets yet: simple, hand-drawn SVG/emoji icons.
 */

const baseIconClass = 'w-16 h-16 mx-auto flex items-center justify-center';

export const SkyJourneyIcon = () => (
  <div className={baseIconClass} aria-label="Sky Journey">
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      role="img"
      aria-hidden="true"
      style={{ filter: 'drop-shadow(0 0 10px rgba(56,189,248,0.55))' }}
    >
      {/* Cloud */}
      <path
        d="M18 34c-4.4 0-8-3.2-8-7.2 0-3.6 2.8-6.6 6.6-7.1C18.1 15.4 21.8 13 26 13c5.1 0 9.3 3.5 10.4 8.3 4.6.2 8.3 3.6 8.3 7.9 0 4.4-4.1 8-9.1 8H18z"
        fill="rgba(255,255,255,0.92)"
        stroke="rgba(56,189,248,0.65)"
        strokeWidth="1.5"
      />
      {/* Little cape/child */}
      <path
        d="M28 21c2.3 0 4.2 1.9 4.2 4.2 0 1.6-1 3.1-2.4 3.8l6.5 10.2c-2.6 1.9-5.6 3-8.3 3s-5.7-1.1-8.3-3l6.5-10.2c-1.4-.7-2.4-2.2-2.4-3.8 0-2.3 1.9-4.2 4.2-4.2z"
        fill="rgba(34,197,94,0.22)"
        stroke="rgba(34,197,94,0.65)"
        strokeWidth="1.5"
      />
      {/* Star */}
      <path
        d="M44 14l1.5 3.4L49 19l-3.5 1.6L44 24l-1.5-3.4L39 19l3.5-1.6L44 14z"
        fill="rgba(250,204,21,0.95)"
      />
    </svg>
  </div>
);

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

