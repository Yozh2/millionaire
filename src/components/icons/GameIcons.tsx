/**
 * Collection of game-related icons used throughout the UI.
 * Themed to match Baldur's Gate 3 fantasy aesthetic.
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

/** Sword icon - represents the hero/adventurer */
export const SwordIcon = () => (
  <svg viewBox="0 0 64 64" className="w-16 h-16 mx-auto">
    {/* Blade */}
    <path d="M28 4h8l2 36h-12z" fill="#94a3b8" />
    <path d="M30 6h4v32h-4z" fill="#cbd5e1" />
    {/* Crossguard */}
    <rect x="18" y="40" width="28" height="5" rx="2" fill="#8b4513" />
    <rect x="20" y="41" width="24" height="3" rx="1" fill="#a0522d" />
    {/* Grip */}
    <rect x="28" y="45" width="8" height="12" fill="#654321" />
    <rect x="29" y="47" width="2" height="8" fill="#8b4513" />
    <rect x="33" y="47" width="2" height="8" fill="#8b4513" />
    {/* Pommel */}
    <circle cx="32" cy="60" r="4" fill="#b8860b" />
    <circle cx="32" cy="60" r="2" fill="#daa520" />
  </svg>
);

/** Gold coin icon - used for displaying prize amounts */
export const CoinIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 inline-block mr-1">
    <circle
      cx="12"
      cy="12"
      r="10"
      fill="#fbbf24"
      stroke="#d97706"
      strokeWidth="1.5"
    />
    <circle
      cx="12"
      cy="12"
      r="7"
      fill="#fcd34d"
      stroke="#f59e0b"
      strokeWidth="1"
    />
    <text
      x="12"
      y="16"
      textAnchor="middle"
      fontSize="10"
      fontWeight="bold"
      fill="#92400e"
    >
      G
    </text>
  </svg>
);

/** Scroll icon - used for "Phone a Friend" lifeline messages */
export const ScrollIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 inline-block mr-1">
    <path
      d="M6 2h12c1 0 2 1 2 2v16c0 1-1 2-2 2H6c-1 0-2-1-2-2V4c0-1 1-2 2-2z"
      fill="#f5deb3"
      stroke="#8b7355"
      strokeWidth="1.5"
    />
    <path
      d="M8 6h8M8 10h8M8 14h6"
      stroke="#6b5d4f"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M18 2c.5 0 1 .3 1 .8v2.4c0 .5-.5.8-1 .8M6 2c-.5 0-1 .3-1 .8v2.4c0 .5.5.8 1 .8"
      fill="#d4a574"
    />
  </svg>
);

/** Tavern icon - used for "Ask the Audience" lifeline */
export const TavernIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 inline-block mr-1">
    <path
      d="M8 8c0-2 1-3 2-3h4c1 0 2 1 2 3v8h-8V8z"
      fill="#8b4513"
      stroke="#654321"
      strokeWidth="1"
    />
    <ellipse cx="12" cy="8" rx="4" ry="2" fill="#d4a574" />
    <path d="M10 11h4v5h-4z" fill="#c19a6b" />
    <circle cx="12" cy="13" r="1.5" fill="#fbbf24" />
    <path
      d="M15 17h2l.5 3h-3l.5-3zM9 17H7l-.5 3h3l-.5-3z"
      fill="#654321"
    />
  </svg>
);

/** Star icon - marks guaranteed prize levels */
export const StarIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 inline-block">
    <path
      d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"
      fill="#f4d03f"
    />
  </svg>
);

/** D20 dice showing critical fail (1) - used for game over screen */
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
