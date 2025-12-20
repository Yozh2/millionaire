import type { Campaign } from '@engine/types';
import { transformersCampaignStrings } from '../../strings';
import { questions } from './questions';
import { theme } from './theme';

export const skyboundCampaign: Campaign = {
  id: 'skybound',
  name: transformersCampaignStrings.skybound.name,
  label: transformersCampaignStrings.skybound.label,
  theme,
  questions,
};
