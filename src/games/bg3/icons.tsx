/**
 * BG3 Game Icons
 *
 * Icons loaded from /public/games/bg3/icons/
 * These components wrap SVG files for use in React.
 */

import type { CampaignIconProps } from '../../engine/types';

const ICONS_PATH = `${import.meta.env.BASE_URL}games/bg3/icons`;

/** Mind Flayer (Illithid) icon - represents the tadpole storyline */
export const MindFlayerIcon = ({ className }: CampaignIconProps) => (
  <img
    src={`${ICONS_PATH}/mind-flayer.png`}
    alt="Mind Flayer"
    className={`mx-auto object-contain ${className ?? 'w-24 h-24'}`}
  />
);

/** Dark Urge icon - represents the Bhaalspawn origin */
export const DarkUrgeIcon = ({ className }: CampaignIconProps) => (
  <img
    src={`${ICONS_PATH}/dark-urge.png`}
    alt="Dark Urge"
    className={`mx-auto object-contain ${className ?? 'w-24 h-24'}`}
  />
);

/** Hero icon - represents the Hero origin */
export const HeroIcon = ({ className }: CampaignIconProps) => (
  <img
    src={`${ICONS_PATH}/heroes.png`}
    alt="Hero"
    className={`mx-auto object-contain ${className ?? 'w-24 h-24'}`}
  />
);

/** Trophy icon for victory screen */
export const TrophyIcon = () => (
  <img
    src={`${ICONS_PATH}/trophy.svg`}
    alt="Trophy"
    className="w-24 h-24 mx-auto animate-bounce"
  />
);

/** Money/coin icon for took money screen - stack of fantasy gold coins */
export const MoneyIcon = () => (
  <img
    src={`${ICONS_PATH}/money.svg`}
    alt="Gold Coins"
    className="w-24 h-24 mx-auto"
  />
);

/** Critical fail - D20 dice showing 1 */
export const CriticalFailIcon = () => (
  <img
    src={`${ICONS_PATH}/critical-fail.svg`}
    alt="Critical Fail"
    className="w-20 h-20 mx-auto"
  />
);

/** Small coin icon for inline use - fantasy gold with G */
export const CoinIcon = () => (
  <img
    src={`${ICONS_PATH}/coin.svg`}
    alt="Coin"
    className="w-5 h-5 inline mr-1"
  />
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
