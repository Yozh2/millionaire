import { createCampaignsForGame, defineGameConfig } from '@engine/utils';
import { strings } from './strings';

export const axisConfig = defineGameConfig({
  id: 'axis',

  fontFamily: 'Georgia, "Times New Roman", serif',

  campaigns: createCampaignsForGame({
    gameId: 'axis',
    campaignStrings: strings.campaigns,
  }),

  strings,

  lifelines: {
    fifty: { icon: '⚡️' },
    phone: { icon: '📜' },
    audience: { icon: '🐱' },
    double: { icon: '✨' },
  },

  actions: {
    retreat: { icon: '💰' },
  },

  prizes: {
    maxPrize: 1000000,
    guaranteedFractions: [1 / 3, 2 / 3, 1],
  },

  headerSlideshow: {
    campaignImageOrder: 'alphabetical',
  },
});

export default axisConfig;
