/**
 * PoC Game Configuration
 *
 * Minimal PoC game for testing the engine.
 * Uses oscillator sounds only, no external assets.
 */

import type { GameConfig } from '@engine/types';
import { createDefaultAudioConfig } from '@engine/audio/defaultAudio';
import { createCampaignsFromGlobs } from '@engine/utils';
import {
  DefeatIcon,
  EasyCampaignIcon,
  HardCampaignIcon,
  RetreatIcon,
  VictoryIcon,
} from './icons';
import { strings } from './strings';

type CampaignId = keyof typeof strings.campaigns;

export const campaignIDs = ['easy', 'hard'] as const satisfies readonly CampaignId[];

const campaignIcons = {
  easy: EasyCampaignIcon,
  hard: HardCampaignIcon,
} as const;

const campaigns = createCampaignsFromGlobs({
  gameId: 'poc',
  campaignIDs,
  campaignStrings: strings.campaigns,
  iconsById: campaignIcons,
  themeModules: import.meta.glob('./campaigns/*/theme.ts', { eager: true }),
  questionModules: import.meta.glob('./campaigns/*/questions.ts', { eager: true }),
});

export const pocConfig: GameConfig = {
  id: 'poc',

  emoji: '⚙️',

  title: strings.headerTitle,
  subtitle: strings.headerSubtitle,

  registry: {
    registryVisible: true,
    order: 10,
    gameTitle: 'PROOF OF CONCEPT',
    available: true,
  },

  campaigns,

  companions: strings.companions,
  strings,

  lifelines: {
    fifty: { name: strings.lifelines.fifty, icon: '⚡️', enabled: true },
    phone: { name: strings.lifelines.phone, icon: '📱', enabled: true },
    audience: { name: strings.lifelines.audience, icon: '📊', enabled: true },
    host: { name: strings.lifelines.host, icon: '🎭', enabled: true },
    switch: { name: strings.lifelines.switch, icon: '🔁', enabled: true },
    double: { name: strings.lifelines.double, icon: '🎯', enabled: true },
  },

  actions: {
    retreat: { name: strings.retreat, icon: '💰', enabled: true },
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
    victory: VictoryIcon,
    defeat: DefeatIcon,
    retreat: RetreatIcon,
  },

  headerSlideshow: {
    campaignImageOrder: 'random',
  },
};

export default pocConfig;
