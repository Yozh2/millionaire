import { createCampaignsForGame, defineGameConfig } from '@engine/utils';
import {
  DefeatIncineratorIcon,
  NeuralCampaignIcon,
  NnrCoinIcon,
  PerceptronCampaignIcon,
  ResearchCampaignIcon,
  RetreatCubeIcon,
  VictoryCakeIcon,
} from './icons';
import { strings } from './strings';

export const nnrConfig = defineGameConfig({
  id: 'nnr',

  fontFamily: '"Univers", "Arial", sans-serif',

  campaigns: createCampaignsForGame({
    gameId: 'nnr',
    campaignStrings: strings.campaigns,
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

  endIcons: {
    victory: VictoryCakeIcon,
    defeat: DefeatIncineratorIcon,
    retreat: RetreatCubeIcon,
  },

  headerSlideshow: {
    transitionDuration: 1600,
    displayDuration: 12000,
    opacity: 0.9,
    campaignImageOrder: 'alphabetical',
  },
});

export default nnrConfig;
