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
import { FailIcon, MoneyIcon, TrophyIcon } from './icons';
import {
  pocActionNames,
  pocCompanions,
  pocCurrency,
  pocLifelineNames,
  pocStrings,
  pocSubtitle,
  pocTitle,
} from './strings';

export const pocConfig: GameConfig = {
  id: 'poc',

  emoji: '⚙️',

  title: pocTitle,
  subtitle: pocSubtitle,

  registry: {
    registryVisible: true,
    order: 10,
    card: {
      title: 'PROOF OF CONCEPT',
      subtitle: 'Тестовая игра',
      description: 'Минимальная демонстрация движка без внешних ассетов',
      emoji: '⚙️',
      gradient: 'from-slate-700 via-slate-600 to-slate-800',
      borderColor: 'border-slate-500',
      available: true,
    },
  },

  campaigns: [easyCampaign, hardCampaign],

  companions: pocCompanions,
  strings: pocStrings,

  lifelines: {
    fifty: { name: pocLifelineNames.fifty, icon: '⚡', enabled: true },
    phone: { name: pocLifelineNames.phone, icon: '📞', enabled: true },
    audience: { name: pocLifelineNames.audience, icon: '📊', enabled: true },
    host: { name: pocLifelineNames.host, icon: '🎭', enabled: true },
    switch: { name: pocLifelineNames.switch, icon: '🔁', enabled: true },
    double: { name: pocLifelineNames.double, icon: '🎯', enabled: true },
  },

  actions: {
    takeMoney: { name: pocActionNames.takeMoney, icon: '💰', enabled: true },
  },

  prizes: {
    maxPrize: 1000000,
    currency: pocCurrency,
    guaranteedFractions: [1 / 3, 2 / 3, 1],
  },

  audio: createDefaultAudioConfig({
    musicVolume: 0.2,
    soundVolume: 1.0,
    voiceVolume: 1.0,
  }),

  endIcons: {
    won: TrophyIcon,
    lost: FailIcon,
    tookMoney: MoneyIcon,
  },
};

export default pocConfig;
