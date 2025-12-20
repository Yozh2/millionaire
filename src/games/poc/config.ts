/**
 * PoC Game Configuration
 *
 * Minimal PoC game for testing the engine.
 * Uses oscillator sounds only, no external assets.
 */

import type { GameConfig } from '@engine/types';
import { createDefaultAudioConfig } from '@engine/audio/defaultAudio';
import { easyCampaign } from './campaigns/easy/campaign';
import { hardCampaign } from './campaigns/hard/campaign';
import { DefeatIcon, RetreatIcon, VictoryIcon } from './icons';
import { strings } from './strings';

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

  campaigns: [easyCampaign, hardCampaign],

  companions: strings.companions,
  strings,

  lifelines: {
    fifty: { name: strings.lifelines.fifty, icon: '⚡', enabled: true },
    phone: { name: strings.lifelines.phone, icon: '📞', enabled: true },
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
};

export default pocConfig;
