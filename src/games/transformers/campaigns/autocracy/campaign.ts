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

const AutocracyIcon = ({ className, size }: CampaignIconProps) =>
  jsx('img', {
    src: gameIconsFile('transformers', 'Autocracy.png'),
    alt: transformersCampaignStrings.autocracy.iconAlt,
    className: `${baseImgIconClass} ${className ?? getCampaignIconSizeClass(size)}`,
  });

export const autocracyCampaign: Campaign = {
  id: 'autocracy',
  name: transformersCampaignStrings.autocracy.name,
  label: transformersCampaignStrings.autocracy.label,
  icon: AutocracyIcon,
  theme,
  questions,
  musicTrack: 'Autocracy.ogg',
  selectSound: 'CampaignAutocracy.ogg',
};
