import type { Campaign } from '@engine/types';
import { bg3CampaignStrings } from '../../strings';
import { questions } from './questions';
import { theme } from './theme';

export const mindflayerCampaign: Campaign = {
  id: 'mindflayer',
  name: bg3CampaignStrings.mindflayer.name,
  label: bg3CampaignStrings.mindflayer.label,
  theme,
  questions,
};
