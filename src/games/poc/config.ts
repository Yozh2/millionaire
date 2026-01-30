/**
 * PoC Game Configuration
 *
 * Minimal PoC game for testing the engine.
 * Uses oscillator sounds only, no external assets.
 */

import { createCampaignsForGame, defineGameConfig } from '@engine/utils';
import {
  DefeatIcon,
  EasyCampaignIcon,
  HardCampaignIcon,
  RetreatIcon,
  VictoryIcon,
} from './icons';
import { strings } from './strings';

export const pocConfig = defineGameConfig({
  id: 'poc',

  campaigns: createCampaignsForGame({
    gameId: 'poc',
    campaignStrings: strings.campaigns,
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
