import type { Campaign } from '@engine/types';
import { skyCotlCampaignStrings } from '../../strings';
import { questions } from './questions';
import { theme } from './theme';

export const skykidCampaign: Campaign = {
  id: 'skykid',
  name: skyCotlCampaignStrings.skykid.name,
  label: skyCotlCampaignStrings.skykid.label,
  theme,
  questions,
};
