import {
  baseImgIconClass,
  getCampaignIconSizeClass,
  type CampaignIconProps,
} from '@engine/types';
import { gameIconsFile } from '@engine/utils/paths';
import { strings } from './strings';

const buildCampaignIcon =
  (filename: string, label: string) =>
  ({ className, size }: CampaignIconProps) => (
    <img
      src={gameIconsFile('nnr', `campaigns/${filename}`)}
      alt={label}
      loading="lazy"
      draggable={false}
      className={`${baseImgIconClass} ${className ?? getCampaignIconSizeClass(size)}`}
    />
  );

export const PerceptronCampaignIcon = buildCampaignIcon(
  'perceptron.svg',
  strings.campaigns.perceptron.iconAlt ?? strings.campaigns.perceptron.name,
);

export const NeuralCampaignIcon = buildCampaignIcon(
  'nn.svg',
  strings.campaigns.nn.iconAlt ?? strings.campaigns.nn.name,
);

export const ResearchCampaignIcon = buildCampaignIcon(
  'research.svg',
  strings.campaigns.research.iconAlt ?? strings.campaigns.research.name,
);

export const NnrCoinIcon = () => (
  <img
    src={gameIconsFile('nnr', 'coin.svg')}
    alt=""
    aria-hidden="true"
    className="inline-block w-4 h-4 mr-1 align-middle"
  />
);
