import type { Campaign } from '@engine/types';
import { campaignStrings } from '../../strings';
import { questions } from './questions';
import { theme } from './theme';

export const skyboundCampaign: Campaign = {
  id: 'skybound',
  name: campaignStrings.skybound.name,
  label: campaignStrings.skybound.label,
  theme,
  questions,
};
