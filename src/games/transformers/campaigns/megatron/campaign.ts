import type { Campaign } from '@engine/types';
import { transformersCampaignStrings } from '../../strings';
import { questions } from './questions';
import { theme } from './theme';

export const megatronCampaign: Campaign = {
  id: 'megatron',
  name: transformersCampaignStrings.megatron.name,
  label: transformersCampaignStrings.megatron.label,
  theme,
  questions,
};
