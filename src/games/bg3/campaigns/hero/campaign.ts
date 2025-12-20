import type { Campaign } from '@engine/types';
import { campaignStrings } from '../../strings';
import { questions } from './questions';
import { theme } from './theme';

export const heroCampaign: Campaign = {
  id: 'hero',
  name: campaignStrings.hero.name,
  label: campaignStrings.hero.label,
  theme,
  questions,
};
