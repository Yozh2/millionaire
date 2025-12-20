import type { Campaign } from '@engine/types';
import { campaignStrings } from '../../strings';
import { questions } from './questions';
import { theme } from './theme';

export const autocracyCampaign: Campaign = {
  id: 'autocracy',
  name: campaignStrings.autocracy.name,
  label: campaignStrings.autocracy.label,
  theme,
  questions,
};
