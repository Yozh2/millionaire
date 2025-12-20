/**
 * Transformers Game Configuration
 *
 * Quiz game based on The Transformers comics:
 * - Megatron: Origin (Мегатрон — Восхождение)
 * - Autocracy (Автократия)
 * - Skybound (Земля)
 */

import type { GameConfig } from '@engine/types';
import { createDefaultAudioConfig } from '@engine/audio/defaultAudio';
import { autocracyCampaign } from './campaigns/autocracy/campaign';
import { megatronCampaign } from './campaigns/megatron/campaign';
import { skyboundCampaign } from './campaigns/skybound/campaign';
import {
  transformersActionNames,
  transformersCompanions,
  transformersCurrency,
  transformersLifelineNames,
  transformersStrings,
  transformersSubtitle,
  transformersTitle,
} from './strings';

export const transformersConfig: GameConfig = {
  id: 'transformers',

  emoji: '🤖',
  fontFamily: '"Neuropol X Rg", "Roboto", "Helvetica Neue", sans-serif',

  title: transformersTitle,
  subtitle: transformersSubtitle,

  registry: {
    registryVisible: true,
    order: 30,
    gameTitle: 'TRANSFORMERS',
    available: true,
  },

  campaigns: [megatronCampaign, autocracyCampaign, skyboundCampaign],

  companions: transformersCompanions,
  strings: transformersStrings,

  lifelines: {
    fifty: { name: transformersLifelineNames.fifty, icon: '⚡', enabled: true },
    phone: { name: transformersLifelineNames.phone, icon: '📡', enabled: true },
    audience: {
      name: transformersLifelineNames.audience,
      icon: '🤖',
      enabled: true,
    },
    double: { name: transformersLifelineNames.double, icon: '🛰️', enabled: true },
  },

  actions: {
    takeMoney: {
      name: transformersActionNames.takeMoney,
      icon: '⚡️',
      enabled: true,
    },
  },

  prizes: {
    maxPrize: 1000000,
    currency: transformersCurrency,
    guaranteedFractions: [1 / 3, 2 / 3, 1],
  },

  audio: createDefaultAudioConfig({
    musicVolume: 0.3,
    soundVolume: 1.0,
    voiceVolume: 1.0,
  }),

  enableLostSparks: true,
  lostSparkColors: ['#00BFFF', '#87CEEB', '#00CED1', '#1E90FF'],
};

export default transformersConfig;
