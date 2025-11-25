/**
 * Money icon displayed when player takes the money and leaves.
 * Green coin with dollar sign.
 */
export const MoneyIcon = () => (
  <svg viewBox="0 0 64 64" className="w-24 h-24 mx-auto">
    <circle
      cx="32"
      cy="32"
      r="28"
      fill="#2d5016"
      stroke="#4a7c23"
      strokeWidth="4"
    />
    <circle cx="32" cy="32" r="22" fill="#3d6b1c" />
    <text
      x="32"
      y="42"
      textAnchor="middle"
      fontSize="28"
      fontWeight="bold"
      fill="#8bc34a"
    >
      $
    </text>
  </svg>
);
