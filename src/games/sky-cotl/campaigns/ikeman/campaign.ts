import {
  baseCenteredIconClass,
  getCampaignIconSizeClass,
  type Campaign,
  type CampaignIconProps,
} from '@engine/types';
import { jsx, jsxs } from 'react/jsx-runtime';
import { campaignStrings } from '../../strings';
import { questions } from './questions';
import { theme } from './theme';

const IkemanIcon = ({ className, size }: CampaignIconProps) =>
  jsx('div', {
    className: `${baseCenteredIconClass} ${className ?? getCampaignIconSizeClass(size)}`,
    'aria-label': campaignStrings.ikeman.iconAlt,
    children: jsxs('svg', {
      viewBox: '0 0 56 56',
      className: 'w-full h-full',
      role: 'img',
      'aria-hidden': true,
      style: { filter: 'drop-shadow(0 0 12px rgba(244, 63, 94, 0.35))' },
      children: [
        // Crown
        jsx('path', {
          d: 'M14 24l6 6 8-10 8 10 6-6 2 18H12l2-18z',
          fill: 'rgba(244, 63, 94, 0.20)',
          stroke: 'rgba(244, 63, 94, 0.75)',
          strokeWidth: '1.5',
          strokeLinejoin: 'round',
        }),
        // Mask / face
        jsx('path', {
          d: 'M20 34c2.8-2.2 5.4-3.2 8-3.2s5.2 1 8 3.2c-.8 6.2-4 10-8 10s-7.2-3.8-8-10z',
          fill: 'rgba(255, 255, 255, 0.12)',
          stroke: 'rgba(255, 255, 255, 0.45)',
          strokeWidth: '1.5',
        }),
        // Eyes
        jsx('path', {
          d: 'M23.5 36.5h5M27.5 36.5h5',
          stroke: 'rgba(255, 255, 255, 0.65)',
          strokeWidth: '1.5',
          strokeLinecap: 'round',
        }),
      ],
    }),
  });

export const ikemanCampaign: Campaign = {
  id: 'ikeman',
  name: campaignStrings.ikeman.name,
  label: campaignStrings.ikeman.label,
  icon: IkemanIcon,
  theme,
  questions,
};
