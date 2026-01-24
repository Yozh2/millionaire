import type { GameConfig } from '@engine/types';
import { createDefaultAudioConfig } from '@engine/audio/defaultAudio';
import { createCampaignsFromGlobs } from '@engine/utils';
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

type CampaignId = keyof typeof strings.campaigns;

export const campaignIDs = ['perceptron', 'nn', 'research'] as const satisfies
  readonly CampaignId[];

const campaignIcons = {
  perceptron: PerceptronCampaignIcon,
  nn: NeuralCampaignIcon,
  research: ResearchCampaignIcon,
} as const;

const campaigns = createCampaignsFromGlobs({
  gameId: 'nnr',
  campaignIDs,
  campaignStrings: strings.campaigns,
  iconsById: campaignIcons,
  themeModules: import.meta.glob('./campaigns/*/theme.ts', { eager: true }),
  questionModules: import.meta.glob('./campaigns/*/questions.ts', { eager: true }),
});

export const nnrConfig: GameConfig = {
  id: 'nnr',

  fontFamily: '"Univers", "Arial", sans-serif',

  title: strings.headerTitle,
  subtitle: strings.headerSubtitle,

  campaigns,

  companions: strings.companions,
  strings,

  lifelines: {
    fifty: { name: strings.lifelines.fifty, icon: '⚡️', enabled: true },
    phone: { name: strings.lifelines.phone, icon: '🧠', enabled: true },
    audience: { name: strings.lifelines.audience, icon: '🛰️', enabled: true },
    double: { name: strings.lifelines.double, icon: '🚀', enabled: true },
  },

  actions: {
    retreat: { name: strings.retreat, icon: '💾', enabled: true },
  },

  prizes: {
    maxPrize: 1000000,
    currency: strings.currency,
    guaranteedFractions: [1 / 3, 2 / 3, 1],
  },

  audio: createDefaultAudioConfig({
    musicVolume: 0.25,
    soundVolume: 0.9,
    voiceVolume: 1.0,
  }),

  icons: {
    coin: NnrCoinIcon,
  },

  endIcons: {
    victory: VictoryCakeIcon,
    defeat: DefeatIncineratorIcon,
    retreat: RetreatCubeIcon,
  },

  headerSlideshow: {
    enabled: true,
    transitionDuration: 1600,
    displayDuration: 12000,
    opacity: 0.9,
    campaignImageOrder: 'alphabetical',
  },
};

export default nnrConfig;
