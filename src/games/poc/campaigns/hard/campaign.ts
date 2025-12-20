import {
  baseCenteredIconClass,
  getCampaignIconSizeClass,
  type Campaign,
  type CampaignIconProps,
} from '@engine/types';
import { jsx } from 'react/jsx-runtime';
import { campaignStrings } from '../../strings';
import { questions } from './questions';
import { theme } from './theme';

const HardIcon = ({ className, size }: CampaignIconProps) =>
  jsx('div', {
    className: `${baseCenteredIconClass} text-4xl leading-none ${className ?? getCampaignIconSizeClass(size)}`,
    'aria-label': campaignStrings.hard.iconAriaLabel,
    children: '🏆',
  });

export const hardCampaign: Campaign = {
  id: 'hard',
  name: campaignStrings.hard.name,
  label: campaignStrings.hard.label,
  icon: HardIcon,
  theme,
  questions,
};
