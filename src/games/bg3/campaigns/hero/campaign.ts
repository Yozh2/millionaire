import {
  baseImgIconClass,
  getCampaignIconSizeClass,
  type Campaign,
  type CampaignIconProps,
} from '@engine/types';
import { jsx } from 'react/jsx-runtime';
import { gameIconsFile } from '@public';
import { bg3CampaignStrings } from '../../strings';
import { questions } from './questions';
import { theme } from './theme';

const HeroIcon = ({ className, size }: CampaignIconProps) =>
  jsx('img', {
    src: gameIconsFile('bg3', 'heroes.png'),
    alt: bg3CampaignStrings.hero.iconAlt,
    className: `${baseImgIconClass} ${className ?? getCampaignIconSizeClass(size)}`,
  });

export const heroCampaign: Campaign = {
  id: 'hero',
  name: bg3CampaignStrings.hero.name,
  label: bg3CampaignStrings.hero.label,
  icon: HeroIcon,
  theme,
  questions,
  musicTrack: 'Hero.ogg',
  selectSound: 'CampaignHero.ogg',
};
