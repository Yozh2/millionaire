/**
 * PoC Game - Proof of Concept
 *
 * Minimal game for testing the engine.
 */

export { pocConfig, pocConfig as default } from './config';
export {
  TrophyIcon,
  FailIcon,
  MoneyIcon,
} from './icons';
export {
  pocTitle,
  pocSubtitle,
  pocStrings,
  pocCompanions,
  pocCurrency,
  pocLifelineNames,
  pocActionNames,
  pocCampaignStrings,
} from './strings';
export { easyCampaign } from './campaigns/easy/campaign';
export { hardCampaign } from './campaigns/hard/campaign';
