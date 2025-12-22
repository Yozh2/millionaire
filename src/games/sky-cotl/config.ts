import type { GameConfig } from '@engine/types';
import { createDefaultAudioConfig } from '@engine/audio/defaultAudio';
import { createCampaignsFromGlobs } from '@engine/utils';
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

type CampaignId = keyof typeof strings.campaigns;

export const campaignIDs = ['moth', 'skykid', 'ikeman'] as const satisfies
  readonly CampaignId[];

const campaignIcons = {
  moth: MothCampaignIcon,
  ikeman: IkemanCampaignIcon,
} as const;

const campaigns = createCampaignsFromGlobs({
  gameId: 'sky-cotl',
  campaignIDs,
  campaignStrings: strings.campaigns,
  iconsById: campaignIcons,
  themeModules: import.meta.glob('./campaigns/*/theme.ts', { eager: true }),
  questionModules: import.meta.glob('./campaigns/*/questions.ts', { eager: true }),
});

export const skyCotlConfig: GameConfig = {
  id: 'sky-cotl',

  emoji: '☁️',

  title: strings.headerTitle,
  subtitle: strings.headerSubtitle,

  registry: {
    registryVisible: true,
    order: 40,
    gameTitle: 'SKY',
    available: true,
  },

  campaigns,

  companions: strings.companions,
  strings,

  lifelines: {
    fifty: { name: strings.lifelines.fifty, icon: '✨', enabled: true },
    phone: { name: strings.lifelines.phone, icon: '💭', enabled: true },
    audience: { name: strings.lifelines.audience, icon: '📊', enabled: true },
    double: { name: strings.lifelines.double, icon: '📲', enabled: true },
  },

  actions: {
    retreat: { name: strings.retreat, icon: '🕯️', enabled: true },
  },

  prizes: {
    maxPrize: 1000000,
    currency: strings.currency,
    guaranteedFractions: [1 / 3, 2 / 3, 1],
  },

  audio: createDefaultAudioConfig({
    musicVolume: 0.2,
    soundVolume: 1.0,
    voiceVolume: 1.0,
  }),

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
    enabled: true,
    campaignImageOrder: 'alphabetical',
  },

  systemStrings: {
    loadingGameTitle: 'Loading {title}…',
    loadingGameSubtitle: 'Preparing your journey',
    loadingCampaignTitle: 'Preparing campaign…',
    soundConsentTitle: 'Sound',
    soundConsentMessage: 'This game is best experienced with headphones.\nEnable sound?',
    soundConsentEnableLabel: 'With sound',
    soundConsentDisableLabel: 'Without sound',
  },
};

export default skyCotlConfig;
