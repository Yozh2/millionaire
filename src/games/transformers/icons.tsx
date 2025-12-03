/**
 * Transformers Game Icons
 *
 * Autobot and Decepticon faction icons.
 */

/**
 * Autobot faction icon
 */
export const AutobotIcon = () => (
  <div className="w-16 h-16 mx-auto flex items-center justify-center">
    <svg viewBox="0 0 100 100" className="w-14 h-14 fill-red-500">
      <path d="M50 5 L65 25 L95 25 L75 45 L85 75 L50 55 L15 75 L25 45 L5 25 L35 25 Z" />
      <circle cx="50" cy="40" r="8" className="fill-white" />
    </svg>
  </div>
);

/**
 * Decepticon faction icon
 */
export const DecepticonIcon = () => (
  <div className="w-16 h-16 mx-auto flex items-center justify-center">
    <svg viewBox="0 0 100 100" className="w-14 h-14 fill-purple-500">
      <path d="M50 5 L70 20 L90 15 L80 35 L95 50 L80 65 L90 85 L70 80 L50 95 L30 80 L10 85 L20 65 L5 50 L20 35 L10 15 L30 20 Z" />
      <path d="M50 25 L60 40 L50 55 L40 40 Z" className="fill-slate-900" />
    </svg>
  </div>
);

/**
 * Skybound icon - Combined faction symbol (modern era)
 */
export const SkyboundIcon = () => (
  <div className="w-16 h-16 mx-auto flex items-center justify-center">
    <svg viewBox="0 0 100 100" className="w-14 h-14">
      {/* Autobot base */}
      <path
        d="M50 10 L65 25 L90 25 L75 45 L85 70 L50 50 L15 70 L25 45 L10 25 L35 25 Z"
        className="fill-orange-500"
      />
      {/* Decepticon overlay */}
      <path
        d="M50 30 L60 40 L50 55 L40 40 Z"
        className="fill-teal-400"
      />
      {/* Earth glow */}
      <circle cx="50" cy="42" r="5" className="fill-white opacity-80" />
    </svg>
  </div>
);

/**
 * Victory icon - Matrix of Leadership
 */
export const MatrixIcon = () => (
  <div className="w-24 h-24 mx-auto flex items-center justify-center text-6xl animate-pulse">
    ✨
  </div>
);

/**
 * Defeat icon - Destroyed
 */
export const DestroyedIcon = () => (
  <div className="w-24 h-24 mx-auto flex items-center justify-center text-6xl">
    💥
  </div>
);

/**
 * Take money icon - Energon cube
 */
export const EnergonIcon = () => (
  <div className="w-24 h-24 mx-auto flex items-center justify-center text-6xl">
    🔮
  </div>
);
