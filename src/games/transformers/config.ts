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
import { drawEnergonCrystal, EnergonCoinIcon } from './icons';
import { strings } from './strings';

export const transformersConfig: GameConfig = {
  id: 'transformers',

  emoji: '🤖',
  fontFamily: '"Neuropol X Rg", "Roboto", "Helvetica Neue", sans-serif',

  title: strings.headerTitle,
  subtitle: strings.headerSubtitle,

  registry: {
    registryVisible: true,
    order: 30,
    gameTitle: 'TRANSFORMERS',
    available: true,
  },

  campaigns: [megatronCampaign, autocracyCampaign, skyboundCampaign],

  companions: strings.companions,
  strings,

  lifelines: {
    fifty: { name: strings.lifelines.fifty, icon: '⚡', enabled: true },
    phone: { name: strings.lifelines.phone, icon: '📡', enabled: true },
    audience: {
      name: strings.lifelines.audience,
      icon: '🤖',
      enabled: true,
    },
    double: { name: strings.lifelines.double, icon: '🛰️', enabled: true },
  },

  actions: {
    retreat: {
      name: strings.retreat,
      icon: '⚡️',
      enabled: true,
    },
  },

  prizes: {
    maxPrize: 1000000,
    currency: strings.currency,
    guaranteedFractions: [1 / 3, 2 / 3, 1],
  },

  audio: createDefaultAudioConfig({
    musicVolume: 0.3,
    soundVolume: 1.0,
    voiceVolume: 1.0,
  }),

  icons: {
    coin: EnergonCoinIcon,
  },
  drawCoinParticle: drawEnergonCrystal,

  enableLostSparks: true,
  lostSparkColors: ['#00BFFF', '#87CEEB', '#00CED1', '#1E90FF'],
};

export default transformersConfig;
