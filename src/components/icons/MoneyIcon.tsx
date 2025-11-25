/**
 * Money icon displayed when player takes the money and leaves.
 * Stack of golden coins.
 */
export const MoneyIcon = () => (
  <svg viewBox="0 0 64 64" className="w-24 h-24 mx-auto">
    {/* Bottom coin */}
    <ellipse cx="32" cy="48" rx="22" ry="8" fill="#b8860b" />
    <ellipse cx="32" cy="46" rx="22" ry="8" fill="#daa520" />
    <ellipse cx="32" cy="44" rx="20" ry="6" fill="#ffd700" />
    {/* Middle coin */}
    <ellipse cx="32" cy="36" rx="20" ry="7" fill="#b8860b" />
    <ellipse cx="32" cy="34" rx="20" ry="7" fill="#daa520" />
    <ellipse cx="32" cy="32" rx="18" ry="5" fill="#ffd700" />
    {/* Top coin */}
    <ellipse cx="32" cy="24" rx="18" ry="6" fill="#b8860b" />
    <ellipse cx="32" cy="22" rx="18" ry="6" fill="#daa520" />
    <ellipse cx="32" cy="20" rx="16" ry="5" fill="#ffd700" />
    {/* G symbol on top coin */}
    <text
      x="32"
      y="24"
      textAnchor="middle"
      fontSize="12"
      fontWeight="bold"
      fill="#b8860b"
    >
      G
    </text>
  </svg>
);
