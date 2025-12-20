import type { Campaign } from '@engine/types';
import { transformersCampaignStrings } from '../../strings';
import { questions } from './questions';
import { theme } from './theme';

export const autocracyCampaign: Campaign = {
  id: 'autocracy',
  name: transformersCampaignStrings.autocracy.name,
  label: transformersCampaignStrings.autocracy.label,
  theme,
  questions,
};
