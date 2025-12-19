import {
  baseImgIconClass,
  getCampaignIconSizeClass,
  type Campaign,
  type CampaignIconProps,
} from '@engine/types';
import { jsx } from 'react/jsx-runtime';
import { gameIconsFile } from '@public';
import { skyCotlCampaignStrings } from '../../strings';
import { questions } from './questions';
import { theme } from './theme';

const SkykidIcon = ({ className, size }: CampaignIconProps) =>
  jsx('img', {
    src: gameIconsFile('sky-cotl', 'Skykid.png'),
    alt: skyCotlCampaignStrings.skykid.iconAlt,
    className: `${baseImgIconClass} ${className ?? getCampaignIconSizeClass(size)}`,
  });

export const skykidCampaign: Campaign = {
  id: 'skykid',
  name: skyCotlCampaignStrings.skykid.name,
  label: skyCotlCampaignStrings.skykid.label,
  icon: SkykidIcon,
  theme,
  questions,
};

