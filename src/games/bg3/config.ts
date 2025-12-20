/**
 * Baldur's Gate 3 - Game Configuration
 */

import type { GameConfig } from '@engine/types';
import { createDefaultAudioConfig } from '@engine/audio/defaultAudio';
import { darkurgeCampaign } from './campaigns/darkUrge/campaign';
import { heroCampaign } from './campaigns/hero/campaign';
import { mindflayerCampaign } from './campaigns/mindFlayer/campaign';
import { ScrollIcon, TavernIcon } from './icons';
import { strings } from './strings';

export const bg3Config: GameConfig = {
  id: 'bg3',

  emoji: '⚔️',
  fontFamily: 'Georgia, "Times New Roman", serif',

  title: strings.headerTitle,
  subtitle: strings.headerSubtitle,

  registry: {
    registryVisible: true,
    order: 20,
    gameTitle: "BALDUR'S GATE III",
    available: true,
  },

  campaigns: [heroCampaign, mindflayerCampaign, darkurgeCampaign],

  companions: strings.companions,
  strings,

  lifelines: {
    fifty: { name: strings.lifelines.fifty, icon: '⚡', enabled: true },
    phone: { name: strings.lifelines.phone, icon: '📜', enabled: true },
    audience: { name: strings.lifelines.audience, icon: '🍺', enabled: true },
    double: { name: strings.lifelines.double, icon: '🎲', enabled: true },
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

  icons: {
    lifelinePhone: ScrollIcon,
    lifelineAudience: TavernIcon,
  },

  headerSlideshow: {
    enabled: true,
    transitionDuration: 1500,
    displayDuration: 15000,
    opacity: 1,
  },
};

export default bg3Config;
