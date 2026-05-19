import { createCampaignsFromGlobs, defineGameConfig } from '@engine/utils';
import {
  CandleIcon,
  FallenStarIcon,
  IkemanCampaignIcon,
  MothCampaignIcon,
  SmallCandleCoinIcon,
  WingedLightVictoryIcon,
  drawCandleCoin,
} from './icons';
import { strings } from './strings';

const themeModules = import.meta.glob('./campaigns/*/theme.ts', {
  eager: true,
});
const questionModules = import.meta.glob('./campaigns/*/questions.ts', {
  eager: true,
});

export const skyCotlConfig = defineGameConfig({
  id: 'sky-cotl',

  campaigns: createCampaignsFromGlobs({
    gameId: 'sky-cotl',
    campaignStrings: strings.campaigns,
    themeModules,
    questionModules,
    iconsById: {
      moth: MothCampaignIcon,
      ikeman: IkemanCampaignIcon,
    },
  }),

  strings,

  lifelines: {
    fifty: { icon: '✨' },
    phone: { icon: '💭' },
    audience: { icon: '📊' },
    double: { icon: '📲' },
  },

  actions: {
    retreat: { icon: '🕯️' },
  },

  prizes: {
    maxPrize: 1000000,
    guaranteedFractions: [1 / 3, 2 / 3, 1],
  },

  endIcons: {
    victory: WingedLightVictoryIcon,
    defeat: FallenStarIcon,
    retreat: CandleIcon,
  },

  icons: {
    coin: SmallCandleCoinIcon,
  },

  drawCoinParticle: drawCandleCoin,

  headerSlideshow: {
    campaignImageOrder: 'alphabetical',
  },

  systemStrings: {
    loadingGameTitle: 'Loading {title}…',
    loadingGameSubtitle: 'Preparing your journey',
    loadingCampaignTitle: 'Preparing campaign…',
    soundConsentTitle: 'Sound',
    soundConsentMessage:
      'This game is best experienced with headphones.\nEnable sound?',
    soundConsentEnableLabel: 'With sound',
    soundConsentDisableLabel: 'Without sound',
  },
});

export default skyCotlConfig;
