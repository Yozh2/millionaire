/**
 * PoC Game Icons
 *
 * Simple emoji-based icons for testing the engine.
 */

import {
  baseCenteredIconClass,
  getCampaignIconSizeClass,
  type CampaignIconProps,
} from '@engine/types';
import { strings } from './strings';

/**
 * Treasure icon for victory
 */
export const VictoryIcon = () => (
  <div className="w-64 h-64 mx-auto flex items-center justify-center text-[10rem] leading-none">
    🏆
  </div>
);

/**
 * Defeat icon for defeat
 */
export const DefeatIcon = () => (
  <div className="w-64 h-64 mx-auto flex items-center justify-center text-[10rem] leading-none">
    ❌
  </div>
);

/**
 * Retreat icon for retreating
 */
export const RetreatIcon = () => (
  <div className="w-64 h-64 mx-auto flex items-center justify-center text-[10rem] leading-none">
    💰
  </div>
);

export const EasyCampaignIcon = ({ className, size }: CampaignIconProps) => (
  <div
    className={`${baseCenteredIconClass} text-4xl leading-none ${className ?? getCampaignIconSizeClass(size)}`}
    aria-label={strings.campaigns.easy.iconAriaLabel}
  >
    💎
  </div>
);

export const HardCampaignIcon = ({ className, size }: CampaignIconProps) => (
  <div
    className={`${baseCenteredIconClass} text-4xl leading-none ${className ?? getCampaignIconSizeClass(size)}`}
    aria-label={strings.campaigns.hard.iconAriaLabel}
  >
    🏆
  </div>
);
