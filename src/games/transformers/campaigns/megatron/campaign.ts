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

const MegatronIcon = ({ className, size }: CampaignIconProps) =>
  jsx('img', {
    src: gameIconsFile('transformers', 'Megatron.png'),
    alt: transformersCampaignStrings.megatron.iconAlt,
    className: `${baseImgIconClass} ${className ?? getCampaignIconSizeClass(size)}`,
  });

export const megatronCampaign: Campaign = {
  id: 'megatron',
  name: transformersCampaignStrings.megatron.name,
  label: transformersCampaignStrings.megatron.label,
  icon: MegatronIcon,
  theme,
  questions,
  musicTrack: 'Megatron.ogg',
  selectSound: 'CampaignMegatron.ogg',
};
