import type { Campaign } from '@engine/types';
import { campaignStrings } from '../../strings';
import { questions } from './questions';
import { theme } from './theme';

export const mindflayerCampaign: Campaign = {
  id: 'mindflayer',
  name: campaignStrings.mindflayer.name,
  label: campaignStrings.mindflayer.label,
  theme,
  questions,
};
