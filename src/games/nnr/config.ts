import { createCampaignsFromGlobs, defineGameConfig } from '@engine/utils';
import {
  NeuralCampaignIcon,
  NnrCoinIcon,
  PerceptronCampaignIcon,
  ResearchCampaignIcon,
} from './icons';
import { strings } from './strings';

const themeModules = import.meta.glob('./campaigns/*/theme.ts', {
  eager: true,
});
const questionModules = import.meta.glob('./campaigns/*/questions.ts', {
  eager: true,
});

export const nnrConfig = defineGameConfig({
  id: 'nnr',

  fontFamily: '"Univers", "Arial", sans-serif',

  defaultCampaignId: 'nn',

  campaigns: createCampaignsFromGlobs({
    gameId: 'nnr',
    campaignStrings: strings.campaigns,
    themeModules,
    questionModules,
    iconsById: {
      perceptron: PerceptronCampaignIcon,
      nn: NeuralCampaignIcon,
      research: ResearchCampaignIcon,
    },
  }),

  strings,

  lifelines: {
    fifty: { icon: '⚡️' },
    phone: { icon: '🧠' },
    audience: { icon: '🛰️' },
    double: { icon: '🚀' },
  },

  actions: {
    retreat: { icon: '💾' },
  },

  prizes: {
    maxPrize: 1000000,
    guaranteedFractions: [1 / 3, 2 / 3, 1],
  },

  icons: {
    coin: NnrCoinIcon,
  },

  headerSlideshow: {
    transitionDuration: 1600,
    displayDuration: 12000,
    opacity: 0.9,
    campaignImageOrder: 'alphabetical',
  },
});

export default nnrConfig;
