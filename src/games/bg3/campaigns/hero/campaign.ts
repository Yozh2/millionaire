import type { Campaign } from '@engine/types';
import { bg3CampaignStrings } from '../../strings';
import { questions } from './questions';
import { theme } from './theme';

export const heroCampaign: Campaign = {
  id: 'hero',
  name: bg3CampaignStrings.hero.name,
  label: bg3CampaignStrings.hero.label,
  theme,
  questions,
};
