import type { Campaign } from '../../../../engine/types';
import { MindFlayerIcon } from '../../icons';
import { mindFlayerTheme } from './theme';

export const mindFlayerCampaign: Campaign = {
  id: 'mindFlayer',
  name: 'ИЛЛИТИД',
  label: 'Сложно',
  icon: MindFlayerIcon,
  theme: mindFlayerTheme,
  musicTrack: 'MindFlayer.ogg',
  selectSound: 'CampaignMindFlayer.ogg',
};

