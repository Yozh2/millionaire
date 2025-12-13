import type { Campaign } from '../../../../engine/types';
import { SkyboundIcon } from '../../icons';
import { theme } from './theme';

export const skyboundCampaign: Campaign = {
  id: 'skybound',
  name: 'SKYBOUND',
  label: 'Земля',
  icon: SkyboundIcon,
  theme,
  musicTrack: 'SkyBound.ogg',
  selectSound: 'CampaignSkybound.ogg',
};

