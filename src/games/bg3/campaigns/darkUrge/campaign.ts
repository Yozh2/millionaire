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

const DarkUrgeIcon = ({ className, size }: CampaignIconProps) =>
  jsx('img', {
    src: gameIconsFile('bg3', 'dark-urge.png'),
    alt: bg3CampaignStrings.darkUrge.iconAlt,
    className: `${baseImgIconClass} ${className ?? getCampaignIconSizeClass(size)}`,
  });

export const darkUrgeCampaign: Campaign = {
  id: 'darkUrge',
  name: bg3CampaignStrings.darkUrge.name,
  label: bg3CampaignStrings.darkUrge.label,
  icon: DarkUrgeIcon,
  theme,
  questions,
  musicTrack: 'DarkUrge.ogg',
  selectSound: 'CampaignDarkUrge.ogg',
};
