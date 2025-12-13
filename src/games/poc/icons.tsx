/**
 * PoC Game Icons
 *
 * Simple emoji-based icons for testing the engine.
 */

import type { CampaignIconProps } from '../../engine/types';

/**
 * Classic mode icon (blue diamond)
 */
export const EasyIcon = ({ className }: CampaignIconProps) => (
  <div className={`mx-auto flex items-center justify-center text-4xl leading-none ${className ?? 'w-16 h-16'}`}>
    💎
  </div>
);

/**
 * Gold/Hard mode icon (gold bar)
 */
export const HardIcon = ({ className }: CampaignIconProps) => (
  <div className={`mx-auto flex items-center justify-center text-4xl leading-none ${className ?? 'w-16 h-16'}`}>
    🏆
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
