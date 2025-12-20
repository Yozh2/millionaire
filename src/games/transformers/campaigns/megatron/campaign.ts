import type { Campaign } from '@engine/types';
import { campaignStrings } from '../../strings';
import { questions } from './questions';
import { theme } from './theme';

export const megatronCampaign: Campaign = {
  id: 'megatron',
  name: campaignStrings.megatron.name,
  label: campaignStrings.megatron.label,
  theme,
  questions,
};
