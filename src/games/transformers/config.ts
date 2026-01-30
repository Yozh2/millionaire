/**
 * Transformers Game Configuration
 *
 * Based on The Transformers comics:
 * - Megatron: Origin
 * - Autocracy
 * - Skybound
 */

import { createCampaignsForGame, defineGameConfig } from '@engine/utils';
import { drawEnergonCrystal, EnergonCoinIcon } from './icons';
import { strings } from './strings';

export const transformersConfig = defineGameConfig({
  id: 'transformers',

  fontFamily: '"Neuropol X Rg", "Roboto", "Helvetica Neue", sans-serif',

  campaigns: createCampaignsForGame({
    gameId: 'transformers',
    campaignStrings: strings.campaigns,
  }),

  strings,

  lifelines: {
    fifty: { icon: '⚙️' },
    phone: { icon: '📡' },
    audience: { icon: '🤖' },
    double: { icon: '🛰️' },
  },

  actions: {
    retreat: { icon: '⚡️' },
  },

  prizes: {
    maxPrize: 1000000,
    guaranteedFractions: [1 / 3, 2 / 3, 1],
  },

  icons: {
    coin: EnergonCoinIcon,
  },
  drawCoinParticle: drawEnergonCrystal,

  headerSlideshow: {
    campaignImageOrder: 'alphabetical',
  },

  enableLostSparks: true,
  lostSparkColors: ['#00BFFF', '#87CEEB', '#00CED1', '#1E90FF'],
});

export default transformersConfig;
