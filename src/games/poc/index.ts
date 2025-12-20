/**
 * PoC Game - Proof of Concept
 *
 * Minimal game for testing the engine.
 */

export { pocConfig, pocConfig as default } from './config';
export {
  VictoryIcon as VictoryIcon,
  DefeatIcon,
  RetreatIcon,
} from './icons';
export { campaignStrings, strings } from './strings';
export { easyCampaign } from './campaigns/easy/campaign';
export { hardCampaign } from './campaigns/hard/campaign';
