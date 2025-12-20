import type { Campaign } from '@engine/types';
import { bg3CampaignStrings } from '../../strings';
import { questions } from './questions';
import { theme } from './theme';

export const darkurgeCampaign: Campaign = {
  id: 'darkurge',
  name: bg3CampaignStrings.darkurge.name,
  label: bg3CampaignStrings.darkurge.label,
  theme,
  questions,
};
