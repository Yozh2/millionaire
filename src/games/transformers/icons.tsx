/**
 * Transformers Game Icons
 *
 * Icons loaded from /public/games/transformers/icons/
 * Autobot and Decepticon faction icons.
 */

const ICONS_PATH = `${import.meta.env.BASE_URL}games/transformers/icons`;

/**
 * Autobot faction icon
 */
export const AutobotIcon = () => (
  <div className="w-16 h-16 mx-auto flex items-center justify-center">
    <img
      src={`${ICONS_PATH}/autobot.svg`}
      alt="Autobot"
      className="w-14 h-14"
    />
  </div>
);

/**
 * Decepticon faction icon
 */
export const DecepticonIcon = () => (
  <div className="w-16 h-16 mx-auto flex items-center justify-center">
    <img
      src={`${ICONS_PATH}/decepticon.svg`}
      alt="Decepticon"
      className="w-14 h-14"
    />
  </div>
);

/**
 * Skybound icon - Combined faction symbol (modern era)
 */
export const SkyboundIcon = () => (
  <div className="w-16 h-16 mx-auto flex items-center justify-center">
    <img
      src={`${ICONS_PATH}/skybound.svg`}
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
 * Take money icon - Energon cube
 */
export const EnergonIcon = () => (
  <div className="w-24 h-24 mx-auto flex items-center justify-center text-6xl">
    🔮
  </div>
);
