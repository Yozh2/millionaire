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

const EasyIcon = ({ className, size }: CampaignIconProps) =>
  jsx('div', {
    className: `${baseCenteredIconClass} text-4xl leading-none ${className ?? getCampaignIconSizeClass(size)}`,
    'aria-label': campaignStrings.easy.iconAriaLabel,
    children: '💎',
  });

export const easyCampaign: Campaign = {
  id: 'easy',
  name: campaignStrings.easy.name,
  label: campaignStrings.easy.label,
  icon: EasyIcon,
  theme,
  questions,
};
