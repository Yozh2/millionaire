import type { Campaign } from '../../../../engine/types';
import { HeroIcon } from '../../icons';
import { heroTheme } from './theme';

export const heroCampaign: Campaign = {
  id: 'hero',
  name: 'ГЕРОЙ',
  label: 'Легко',
  icon: HeroIcon,
  theme: heroTheme,
  musicTrack: 'Hero.ogg',
  selectSound: 'CampaignHero.ogg',
};

