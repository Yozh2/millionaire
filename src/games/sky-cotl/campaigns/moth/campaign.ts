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

const MothIcon = ({ className, size }: CampaignIconProps) =>
  jsx('div', {
    className: `${baseCenteredIconClass} ${className ?? getCampaignIconSizeClass(size)}`,
    'aria-label': campaignStrings.moth.iconAlt,
    children: jsxs('svg', {
      viewBox: '0 0 56 56',
      className: 'w-full h-full',
      role: 'img',
      'aria-hidden': true,
      style: { filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.35))' },
      children: [
        // Wings
        jsx('path', {
          d: 'M28 24c-6.8 0-12.8 4.8-15.8 12.2 5.5-1.4 9.8-1 13.2 1.2 1.1.7 2 1.6 2.6 2.6V24z',
          fill: 'rgba(255, 255, 255, 0.85)',
          stroke: 'rgba(148, 163, 184, 0.65)',
          strokeWidth: '1.5',
        }),
        jsx('path', {
          d: 'M28 24c6.8 0 12.8 4.8 15.8 12.2-5.5-1.4-9.8-1-13.2 1.2-1.1.7-2 1.6-2.6 2.6V24z',
          fill: 'rgba(255, 255, 255, 0.85)',
          stroke: 'rgba(148, 163, 184, 0.65)',
          strokeWidth: '1.5',
        }),
        // Body
        jsx('path', {
          d: 'M28 18c2.2 0 4 1.8 4 4v18c0 2.2-1.8 4-4 4s-4-1.8-4-4V22c0-2.2 1.8-4 4-4z',
          fill: 'rgba(251, 191, 36, 0.25)',
          stroke: 'rgba(251, 191, 36, 0.75)',
          strokeWidth: '1.5',
        }),
        // Antennae
        jsx('path', {
          d: 'M26 16c-2-2.2-3.5-3-5.8-3.6M30 16c2-2.2 3.5-3 5.8-3.6',
          fill: 'none',
          stroke: 'rgba(148, 163, 184, 0.75)',
          strokeWidth: '1.5',
          strokeLinecap: 'round',
        }),
      ],
    }),
  });

export const mothCampaign: Campaign = {
  id: 'moth',
  name: campaignStrings.moth.name,
  label: campaignStrings.moth.label,
  icon: MothIcon,
  theme,
  questions,
};
