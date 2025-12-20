import type { Campaign } from '@engine/types';
import { campaignStrings } from '../../strings';
import { questions } from './questions';
import { theme } from './theme';

export const darkurgeCampaign: Campaign = {
  id: 'darkurge',
  name: campaignStrings.darkurge.name,
  label: campaignStrings.darkurge.label,
  theme,
  questions,
};
