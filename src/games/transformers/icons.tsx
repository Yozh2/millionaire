/**
 * Transformers Game Icons
 *
 * Icons loaded from /public/games/transformers/icons/
 * Campaign faction icons.
 */

const ICONS_PATH = `${import.meta.env.BASE_URL}games/transformers/icons`;

/**
 * Autocracy campaign icon
 */
export const AutocracyIcon = () => (
  <div className="w-16 h-16 mx-auto flex items-center justify-center">
    <img
      src={`${ICONS_PATH}/Autocracy.png`}
      alt="Autocracy"
      className="w-14 h-14"
    />
  </div>
);

/**
 * Megatron campaign icon
 */
export const MegatronIcon = () => (
  <div className="w-16 h-16 mx-auto flex items-center justify-center">
    <img
      src={`${ICONS_PATH}/Megatron.png`}
      alt="Megatron"
      className="w-14 h-14"
    />
  </div>
);

/**
 * Skybound campaign icon
 */
export const SkyboundIcon = () => (
  <div className="w-16 h-16 mx-auto flex items-center justify-center">
    <img
      src={`${ICONS_PATH}/Skybound.png`}
      alt="Skybound"
      className="w-14 h-14"
    />
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
 * Take money icon - Energon cube (larger size for end screen)
 */
export const EnergonIcon = () => (
  <div className="h-40 mx-auto flex items-center justify-center">
    <img
      src={`${ICONS_PATH}/Energon.png`}
      alt="Energon"
      className="h-40 w-auto"
    />
  </div>
);

/**
 * Defeat icon - Broken Spark (extinguished spark)
 */
export const BrokenSparkIcon = () => (
  <div className="w-24 h-24 mx-auto flex items-center justify-center">
    <img
      src={`${ICONS_PATH}/BrokenSpark.png`}
      alt="Broken Spark"
      className="w-20 h-20"
    />
  </div>
);

/**
 * Small energon crystal icon for prize display (replaces coin)
 */
export const EnergonCoinIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    className="inline-block"
    style={{ filter: 'drop-shadow(0 0 3px #00BFFF)' }}
  >
    {/* Crystal shape */}
    <polygon
      points="12,2 20,10 12,22 4,10"
      fill="url(#energonGradient)"
      stroke="#87CEEB"
      strokeWidth="1"
    />
    {/* Inner highlight */}
    <polygon
      points="12,5 16,10 12,18 8,10"
      fill="url(#energonHighlight)"
      opacity="0.6"
    />
    {/* Gradients */}
    <defs>
      <linearGradient id="energonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00BFFF" />
        <stop offset="50%" stopColor="#FF69B4" />
        <stop offset="100%" stopColor="#DA70D6" />
      </linearGradient>
      <linearGradient id="energonHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#87CEEB" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);
