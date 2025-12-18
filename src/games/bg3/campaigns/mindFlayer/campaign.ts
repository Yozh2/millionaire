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

const MindFlayerIcon = ({ className, size }: CampaignIconProps) =>
  jsx('img', {
    src: gameIconsFile('bg3', 'mind-flayer.png'),
    alt: bg3CampaignStrings.mindFlayer.iconAlt,
    className: `${baseImgIconClass} ${className ?? getCampaignIconSizeClass(size)}`,
  });

export const mindFlayerCampaign: Campaign = {
  id: 'mindFlayer',
  name: bg3CampaignStrings.mindFlayer.name,
  label: bg3CampaignStrings.mindFlayer.label,
  icon: MindFlayerIcon,
  theme,
  questions,
  musicTrack: 'MindFlayer.ogg',
  selectSound: 'CampaignMindFlayer.ogg',
};
