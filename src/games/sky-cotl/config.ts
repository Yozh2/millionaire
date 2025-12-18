/**
 * Sky: Children of the Light - Game Configuration
 *
 * Single-campaign edition (for now).
 * All UI strings are in English (game exception).
 */

import type { GameConfig } from '@engine/types';
import { createDefaultAudioConfig } from '@engine/audio/defaultAudio';
import { skyJourneyCampaign } from './campaigns/journey/campaign';
import {
  CandleIcon,
  FallenStarIcon,
  SmallCandleCoinIcon,
  StarIcon,
  WingedLightTrophyIcon,
  drawCandleCoin,
} from './icons';
import {
  skyCotlActionNames,
  skyCotlCompanions,
  skyCotlCurrency,
  skyCotlLifelineNames,
  skyCotlStrings,
  skyCotlSubtitle,
  skyCotlTitle,
} from './strings';

export const skyCotlConfig: GameConfig = {
  id: 'sky-cotl',

  emoji: '☁️',

  title: skyCotlTitle,
  subtitle: skyCotlSubtitle,

  registry: {
    registryVisible: true,
    order: 40,
    card: {
      title: 'SKY',
      subtitle: 'Children of the Light Edition',
      description: 'A 15-question quiz about Sky: Children of the Light (English-only)',
      emoji: '☁️',
      gradient: 'from-sky-500 via-sky-400 to-emerald-500',
      borderColor: 'border-sky-300',
      available: true,
    },
  },

  campaigns: [skyJourneyCampaign],

  companions: skyCotlCompanions,
  strings: skyCotlStrings,

  lifelines: {
    fifty: { name: skyCotlLifelineNames.fifty, icon: '✨', enabled: true },
    phone: { name: skyCotlLifelineNames.phone, icon: '📞', enabled: true },
    audience: { name: skyCotlLifelineNames.audience, icon: '📊', enabled: true },
    double: { name: skyCotlLifelineNames.double, icon: '🪽', enabled: true },
  },

  actions: {
    takeMoney: { name: skyCotlActionNames.takeMoney, icon: '🕯️', enabled: true },
  },

  prizes: {
    maxPrize: 1000000,
    currency: skyCotlCurrency,
    guaranteedFractions: [1 / 3, 2 / 3, 1],
  },

  audio: createDefaultAudioConfig({
    musicVolume: 0.2,
    soundVolume: 1.0,
    voiceVolume: 1.0,
  }),

  endIcons: {
    won: WingedLightTrophyIcon,
    lost: FallenStarIcon,
    tookMoney: CandleIcon,
  },

  icons: {
    coin: SmallCandleCoinIcon,
    star: StarIcon,
  },

  drawCoinParticle: drawCandleCoin,

  headerSlideshow: {
    enabled: false,
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
};

export default skyCotlConfig;
