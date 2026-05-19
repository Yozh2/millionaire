/**
 * PoC Game Configuration
 *
 * Minimal PoC game for testing the engine.
 * Uses oscillator sounds only, no external assets.
 */

import { createCampaignsFromGlobs, defineGameConfig } from '@engine/utils';
import {
  DefeatIcon,
  EasyCampaignIcon,
  HardCampaignIcon,
  RetreatIcon,
  VictoryIcon,
} from './icons';
import { strings } from './strings';

const themeModules = import.meta.glob('./campaigns/*/theme.ts', {
  eager: true,
});
const questionModules = import.meta.glob('./campaigns/*/questions.ts', {
  eager: true,
});

export const pocConfig = defineGameConfig({
  id: 'poc',

  campaigns: createCampaignsFromGlobs({
    gameId: 'poc',
    campaignStrings: strings.campaigns,
    themeModules,
    questionModules,
    iconsById: {
      easy: EasyCampaignIcon,
      hard: HardCampaignIcon,
    },
  }),

  strings,

  lifelines: {
    fifty: { icon: '⚡️' },
    phone: { icon: '📱' },
    audience: { icon: '📊' },
    host: { icon: '🎭' },
    switch: { icon: '🔁' },
    double: { icon: '🎯' },
  },

  actions: {
    retreat: { icon: '💰' },
  },

  prizes: {
    maxPrize: 1000000,
    guaranteedFractions: [1 / 3, 2 / 3, 1],
  },

  endIcons: {
    victory: VictoryIcon,
    defeat: DefeatIcon,
    retreat: RetreatIcon,
  },
});

export default pocConfig;
