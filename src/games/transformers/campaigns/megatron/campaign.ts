import type { Campaign } from '../../../../engine/types';
import { MegatronIcon } from '../../icons';
import { theme } from './theme';

export const megatronCampaign: Campaign = {
  id: 'megatron',
  name: 'МЕГАТРОН',
  label: 'Восхождение',
  icon: MegatronIcon,
  theme,
  musicTrack: 'Megatron.ogg',
  selectSound: 'CampaignMegatron.ogg',
};

