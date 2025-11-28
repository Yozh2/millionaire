/**
 * BG3 Game Icons
 * SVG icons themed for Baldur's Gate 3 aesthetic.
 */

/** Mind Flayer (Illithid) icon - represents the tadpole storyline */
export const MindFlayerIcon = () => (
  <svg viewBox="0 0 64 64" className="w-16 h-16 mx-auto">
    <ellipse cx="32" cy="26" rx="16" ry="20" fill="#7c3aed" />
    <ellipse cx="26" cy="22" rx="4" ry="6" fill="#000" />
    <ellipse cx="38" cy="22" rx="4" ry="6" fill="#000" />
    <path
      d="M24 42c0 2 2 4 4 6M32 42c0 3 0 6 0 8M40 42c0 2-2 4-4 6M28 42c0 2 0 5 0 7"
      stroke="#5b21b6"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

/** Dark Urge icon - represents the Bhaalspawn origin */
export const DarkUrgeIcon = () => (
  <svg viewBox="0 0 64 64" className="w-16 h-16 mx-auto">
    <ellipse cx="32" cy="30" rx="18" ry="22" fill="#450a0a" />
    <ellipse cx="32" cy="28" rx="14" ry="18" fill="#7f1d1d" />
    <circle cx="26" cy="26" r="4" fill="#dc2626" />
    <circle cx="38" cy="26" r="4" fill="#dc2626" />
    <circle cx="26" cy="26" r="2" fill="#000" />
    <circle cx="38" cy="26" r="2" fill="#000" />
    <path
      d="M26 36c2 3 4 4 6 4s4-1 6-4"
      stroke="#450a0a"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M20 20c-2-4-4-6-6-6M44 20c2-4 4-6 6-6M32 10c0-4 0-6 0-8"
      stroke="#7f1d1d"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M28 44l-4 8M36 44l4 8"
      stroke="#450a0a"
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

/** Sword icon - represents the Hero origin */
export const SwordIcon = () => (
  <svg viewBox="0 0 64 64" className="w-16 h-16 mx-auto">
    <path
      d="M32 8 L36 12 L36 40 L32 44 L28 40 L28 12 Z"
      fill="#3b82f6"
      stroke="#1e40af"
      strokeWidth="1"
    />
    <path
      d="M24 40 L40 40 L40 46 L24 46 Z"
      fill="#78716c"
      stroke="#57534e"
      strokeWidth="1"
    />
    <path
      d="M30 46 L34 46 L34 56 L30 56 Z"
      fill="#92400e"
      stroke="#78350f"
      strokeWidth="1"
    />
    <ellipse cx="32" cy="12" rx="2" ry="3" fill="#60a5fa" />
  </svg>
);

/** Trophy icon for victory screen */
export const TrophyIcon = () => (
  <svg viewBox="0 0 64 64" className="w-24 h-24 mx-auto animate-bounce">
    <path
      d="M16 12 L48 12 L46 32 C46 40 40 44 32 44 C24 44 18 40 18 32 Z"
      fill="#fbbf24"
      stroke="#d97706"
      strokeWidth="2"
    />
    <path
      d="M16 12 C8 12 6 20 10 26 C12 28 16 28 18 26"
      fill="#fbbf24"
      stroke="#d97706"
      strokeWidth="2"
    />
    <path
      d="M48 12 C56 12 58 20 54 26 C52 28 48 28 46 26"
      fill="#fbbf24"
      stroke="#d97706"
      strokeWidth="2"
    />
    <rect x="28" y="44" width="8" height="8" fill="#d97706" />
    <rect x="24" y="52" width="16" height="4" fill="#92400e" rx="1" />
    <text x="32" y="32" textAnchor="middle" fill="#92400e" fontSize="12" fontWeight="bold">
      ★
    </text>
  </svg>
);

/** Money/coin icon for took money screen - stack of fantasy gold coins */
export const MoneyIcon = () => (
  <svg viewBox="0 0 64 64" className="w-24 h-24 mx-auto">
    {/* Bottom coins in stack */}
    <ellipse cx="32" cy="40" rx="22" ry="10" fill="#b45309" />
    <ellipse cx="32" cy="38" rx="22" ry="10" fill="#d97706" />
    <ellipse cx="32" cy="34" rx="22" ry="10" fill="#b45309" />
    <ellipse cx="32" cy="32" rx="22" ry="10" fill="#fbbf24" />
    {/* Top coin */}
    <ellipse cx="32" cy="28" rx="22" ry="10" fill="#b45309" />
    <ellipse cx="32" cy="26" rx="22" ry="10" fill="#fbbf24" />
    <ellipse cx="32" cy="26" rx="17" ry="7" fill="#f59e0b" />
    {/* Stylized G letter */}
    <text
      x="32" y="30"
      textAnchor="middle"
      fill="#78350f"
      fontSize="14"
      fontWeight="bold"
      fontFamily="Georgia, serif"
      style={{ fontStyle: 'italic' }}
    >
      G
    </text>
    {/* Coin shine */}
    <ellipse cx="40" cy="22" rx="5" ry="2" fill="#fde68a" opacity="0.5" />
  </svg>
);

/** Critical fail - D20 dice showing 1 */
export const CriticalFailIcon = () => (
  <svg viewBox="0 0 64 64" className="w-20 h-20 mx-auto">
    {/* Hexagonal die shape */}
    <polygon
      points="32,4 56,18 56,46 32,60 8,46 8,18"
      fill="#1a1a2e"
      stroke="#dc2626"
      strokeWidth="2"
    />
    {/* Inner hexagon for depth */}
    <polygon
      points="32,12 48,22 48,42 32,52 16,42 16,22"
      fill="#2d2d44"
      stroke="#991b1b"
      strokeWidth="1"
    />
    {/* Crosslines from vertices to center */}
    <line x1="32" y1="4" x2="32" y2="32" stroke="#991b1b" strokeWidth="1" />
    <line x1="56" y1="18" x2="32" y2="32" stroke="#991b1b" strokeWidth="1" />
    <line x1="56" y1="46" x2="32" y2="32" stroke="#991b1b" strokeWidth="1" />
    <line x1="32" y1="60" x2="32" y2="32" stroke="#991b1b" strokeWidth="1" />
    <line x1="8" y1="46" x2="32" y2="32" stroke="#991b1b" strokeWidth="1" />
    <line x1="8" y1="18" x2="32" y2="32" stroke="#991b1b" strokeWidth="1" />
    {/* Center circle behind number */}
    <circle cx="32" cy="32" r="12" fill="#1a1a2e" />
    {/* The number 1 - critical fail */}
    <text
      x="32"
      y="40"
      textAnchor="middle"
      fontSize="24"
      fontWeight="bold"
      fill="#ef4444"
      style={{ textShadow: '0 0 10px #ef4444' }}
    >
      1
    </text>
    {/* Outer glow effect */}
    <polygon
      points="32,4 56,18 56,46 32,60 8,46 8,18"
      fill="none"
      stroke="#ef4444"
      strokeWidth="1"
      opacity="0.5"
    />
  </svg>
);

/** Small coin icon for inline use - fantasy gold with G */
export const CoinIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 inline mr-1">
    {/* Coin base */}
    <circle cx="12" cy="12" r="10" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="7" fill="#f59e0b" />
    {/* Stylized G */}
    <text
      x="12" y="16"
      textAnchor="middle"
      fill="#78350f"
      fontSize="11"
      fontWeight="bold"
      fontFamily="Georgia, serif"
    >
      G
    </text>
    {/* Shine */}
    <ellipse cx="15" cy="8" rx="2" ry="1" fill="#fde68a" opacity="0.6" />
  </svg>
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
