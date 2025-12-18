import {
  baseImgIconClass,
  getCampaignIconSizeClass,
  type Campaign,
  type CampaignIconProps,
} from '@engine/types';
import { jsx } from 'react/jsx-runtime';
import { gameIconsFile } from '@public';
import { transformersCampaignStrings } from '../../strings';
import { questions } from './questions';
import { theme } from './theme';

const SkyboundIcon = ({ className, size }: CampaignIconProps) =>
  jsx('img', {
    src: gameIconsFile('transformers', 'Skybound.png'),
    alt: transformersCampaignStrings.skybound.iconAlt,
    className: `${baseImgIconClass} ${className ?? getCampaignIconSizeClass(size)}`,
  });

export const skyboundCampaign: Campaign = {
  id: 'skybound',
  name: transformersCampaignStrings.skybound.name,
  label: transformersCampaignStrings.skybound.label,
  icon: SkyboundIcon,
  theme,
  questions,
  musicTrack: 'SkyBound.ogg',
  selectSound: 'CampaignSkybound.ogg',
};
