import type { Campaign } from '@engine/types';
import { campaignStrings } from '../../strings';
import { questions } from './questions';
import { theme } from './theme';

export const skykidCampaign: Campaign = {
  id: 'skykid',
  name: campaignStrings.skykid.name,
  label: campaignStrings.skykid.label,
  theme,
  questions,
};
