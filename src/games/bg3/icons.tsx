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

/** Money/coin icon for took money screen */
export const MoneyIcon = () => (
  <svg viewBox="0 0 64 64" className="w-24 h-24 mx-auto">
    <ellipse cx="32" cy="36" rx="20" ry="12" fill="#d97706" />
    <ellipse cx="32" cy="32" rx="20" ry="12" fill="#fbbf24" />
    <ellipse cx="32" cy="28" rx="20" ry="12" fill="#d97706" />
    <ellipse cx="32" cy="24" rx="20" ry="12" fill="#fbbf24" />
    <text x="32" y="30" textAnchor="middle" fill="#92400e" fontSize="14" fontWeight="bold">
      $
    </text>
  </svg>
);

/** Critical fail / skull icon for defeat screen */
export const CriticalFailIcon = () => (
  <svg viewBox="0 0 64 64" className="w-24 h-24 mx-auto">
    <ellipse cx="32" cy="28" rx="18" ry="20" fill="#dc2626" />
    <ellipse cx="32" cy="26" rx="16" ry="18" fill="#1f1f1f" />
    <ellipse cx="25" cy="24" rx="5" ry="6" fill="#dc2626" />
    <ellipse cx="39" cy="24" rx="5" ry="6" fill="#dc2626" />
    <path d="M26 38 L32 34 L38 38" stroke="#dc2626" strokeWidth="2" fill="none" />
    <path d="M28 42 L32 38 L36 42" stroke="#dc2626" strokeWidth="2" fill="none" />
    <rect x="30" y="48" width="4" height="8" fill="#1f1f1f" />
  </svg>
);

/** Small coin icon for inline use */
export const CoinIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 inline mr-1">
    <circle cx="12" cy="12" r="10" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
    <text x="12" y="16" textAnchor="middle" fill="#92400e" fontSize="10" fontWeight="bold">
      $
    </text>
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
