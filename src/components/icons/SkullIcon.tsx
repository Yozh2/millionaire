/**
 * Skull icon displayed when player loses the game.
 * Represents game over / critical failure.
 */
export const SkullIcon = () => (
  <svg viewBox="0 0 64 64" className="w-24 h-24 mx-auto">
    <ellipse cx="32" cy="28" rx="20" ry="22" fill="#e8e8e8" />
    <ellipse cx="24" cy="26" rx="6" ry="8" fill="#1a1a1a" />
    <ellipse cx="40" cy="26" rx="6" ry="8" fill="#1a1a1a" />
    <path d="M26 42h12v4H26z" fill="#1a1a1a" />
    <path
      d="M24 50h4v8h-4zM28 50h4v6h-4zM32 50h4v6h-4zM36 50h4v8h-4z"
      fill="#e8e8e8"
    />
  </svg>
);
