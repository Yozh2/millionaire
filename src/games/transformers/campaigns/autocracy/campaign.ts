import type { Campaign } from '../../../../engine/types';
import { AutocracyIcon } from '../../icons';
import { theme } from './theme';

export const autocracyCampaign: Campaign = {
  id: 'autocracy',
  name: 'АВТОКРАТИЯ',
  label: 'Орион Пакс',
  icon: AutocracyIcon,
  theme,
  musicTrack: 'Autocracy.ogg',
  selectSound: 'CampaignAutocracy.ogg',
};

