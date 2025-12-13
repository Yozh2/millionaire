import type { Campaign } from '../../../../engine/types';
import { DarkUrgeIcon } from '../../icons';
import { darkUrgeTheme } from './theme';

export const darkUrgeCampaign: Campaign = {
  id: 'darkUrge',
  name: 'СОБЛАЗН',
  label: 'Доблесть',
  icon: DarkUrgeIcon,
  theme: darkUrgeTheme,
  musicTrack: 'DarkUrge.ogg',
  selectSound: 'CampaignDarkUrge.ogg',
};

