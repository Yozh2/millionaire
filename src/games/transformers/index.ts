/**
 * Transformers Game - IDW Comics Edition
 *
 * Quiz about Transformers IDW comics:
 * - Megatron: Origin
 * - Autocracy
 */

export { transformersConfig, transformersConfig as default } from './config';
export {
  MatrixIcon,
  BrokenSparkIcon,
  EnergonIcon,
  EnergonCoinIcon,
  drawEnergonCrystal,
} from './icons';
export {
  transformersTitle,
  transformersSubtitle,
  transformersStrings,
  transformersCompanions,
  transformersCurrency,
  transformersLifelineNames,
  transformersActionNames,
  transformersCampaignStrings,
} from './strings';
export { megatronCampaign } from './campaigns/megatron/campaign';
export { autocracyCampaign } from './campaigns/autocracy/campaign';
export { skyboundCampaign } from './campaigns/skybound/campaign';
