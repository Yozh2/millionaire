import { createCampaignsFromGlobs, defineGameConfig } from '@engine/utils';
import { strings } from './strings';

const themeModules = import.meta.glob('./campaigns/*/theme.ts', {
  eager: true,
});
const questionModules = import.meta.glob('./campaigns/*/questions.ts', {
  eager: true,
});

export const bg3Config = defineGameConfig({
  id: 'bg3',

  fontFamily: 'Georgia, "Times New Roman", serif',

  campaigns: createCampaignsFromGlobs({
    gameId: 'bg3',
    campaignStrings: strings.campaigns,
    themeModules,
    questionModules,
  }),

  strings,

  lifelines: {
    fifty: { icon: '⚡️' },
    phone: { icon: '📜' },
    audience: { icon: '👁️' },
    double: { icon: '🎲' },
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

export default bg3Config;
