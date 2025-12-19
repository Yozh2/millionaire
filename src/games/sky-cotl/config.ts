/**
 * Sky: Children of the Light - Game Configuration
 *
 * Three-path edition:
 * - Moth (newcomer)
 * - Skykid (experienced)
 * - Ikeman (veteran)
 */

import type { GameConfig } from '@engine/types';
import { createDefaultAudioConfig } from '@engine/audio/defaultAudio';
import { mothCampaign } from './campaigns/moth/campaign';
import { skykidCampaign } from './campaigns/skykid/campaign';
import { ikemanCampaign } from './campaigns/ikeman/campaign';
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
    gameTitle: 'SKY',
    available: true,
  },

  campaigns: [mothCampaign, skykidCampaign, ikemanCampaign],

  companions: skyCotlCompanions,
  strings: skyCotlStrings,

  lifelines: {
    fifty: { name: skyCotlLifelineNames.fifty, icon: '✨', enabled: true },
    phone: { name: skyCotlLifelineNames.phone, icon: '💭', enabled: true },
    audience: { name: skyCotlLifelineNames.audience, icon: '📊', enabled: true },
    double: { name: skyCotlLifelineNames.double, icon: '📲', enabled: true },
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
    enabled: true,
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
