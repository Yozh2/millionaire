/**
 * Baldur's Gate 3 Game Configuration
 * Export all BG3-specific modules
 */

export { bg3Config, default } from './config';
export {
  TrophyIcon,
  MoneyIcon,
  CriticalFailIcon,
  CoinIcon,
  ScrollIcon,
  TavernIcon,
  StarIcon,
  drawGoldCoin,
} from './icons';
export {
  bg3Title,
  bg3Subtitle,
  bg3Strings,
  bg3Companions,
  bg3Currency,
  bg3LifelineNames,
  bg3ActionNames,
  bg3CampaignStrings,
} from './strings';
export { heroCampaign } from './campaigns/hero/campaign';
export { mindFlayerCampaign } from './campaigns/mindFlayer/campaign';
export { darkUrgeCampaign } from './campaigns/darkUrge/campaign';
