/**
 * PoC Game Icons
 *
 * Simple emoji-based icons for testing the engine.
 */

/**
 * Easy mode icon (green circle)
 */
export const EasyIcon = () => (
  <div className="w-16 h-16 mx-auto flex items-center justify-center text-4xl">
    🟢
  </div>
);

/**
 * Hard mode icon (red circle)
 */
export const HardIcon = () => (
  <div className="w-16 h-16 mx-auto flex items-center justify-center text-4xl">
    🔴
  </div>
);

/**
 * Trophy icon for winning
 */
export const TrophyIcon = () => (
  <div className="w-24 h-24 mx-auto flex items-center justify-center text-6xl animate-bounce">
    🏆
  </div>
);

/**
 * Fail icon for losing
 */
export const FailIcon = () => (
  <div className="w-24 h-24 mx-auto flex items-center justify-center text-6xl">
    ❌
  </div>
);

/**
 * Money icon for taking money
 */
export const MoneyIcon = () => (
  <div className="w-24 h-24 mx-auto flex items-center justify-center text-6xl">
    💰
  </div>
);
