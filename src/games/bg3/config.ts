/**
 * Baldur's Gate 3 - Game Configuration
 */

import type { GameConfig } from '@engine/types';
import { createDefaultAudioConfig } from '@engine/audio/defaultAudio';
import { darkurgeCampaign } from './campaigns/darkUrge/campaign';
import { heroCampaign } from './campaigns/hero/campaign';
import { mindflayerCampaign } from './campaigns/mindFlayer/campaign';
import { ScrollIcon, TavernIcon } from './icons';
import {
  bg3ActionNames,
  bg3Companions,
  bg3Currency,
  bg3LifelineNames,
  bg3Strings,
  bg3Subtitle,
  bg3Title,
} from './strings';

export const bg3Config: GameConfig = {
  id: 'bg3',

  emoji: '⚔️',
  fontFamily: 'Georgia, "Times New Roman", serif',

  title: bg3Title,
  subtitle: bg3Subtitle,

  registry: {
    registryVisible: true,
    order: 20,
    gameTitle: "BALDUR'S GATE III",
    available: true,
  },

  campaigns: [heroCampaign, mindflayerCampaign, darkurgeCampaign],

  companions: bg3Companions,
  strings: bg3Strings,

  lifelines: {
    fifty: { name: bg3LifelineNames.fifty, icon: '⚡', enabled: true },
    phone: { name: bg3LifelineNames.phone, icon: '📜', enabled: true },
    audience: { name: bg3LifelineNames.audience, icon: '🍺', enabled: true },
    double: { name: bg3LifelineNames.double, icon: '🎲', enabled: true },
  },

  actions: {
    takeMoney: { name: bg3ActionNames.takeMoney, icon: '💰', enabled: true },
  },

  prizes: {
    maxPrize: 1000000,
    currency: bg3Currency,
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
