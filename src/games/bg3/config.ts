import type { GameConfig } from '@engine/types';
import { createDefaultAudioConfig } from '@engine/audio/defaultAudio';
import { createCampaignsFromGlobs } from '@engine/utils';
import { lifelinePhoneIcon, lifelineAudienceIcon } from './icons';
import { strings } from './strings';

type CampaignId = keyof typeof strings.campaigns;

export const campaignIDs = [
  'hero',
  'mindflayer',
  'darkurge',
] as const satisfies
  readonly CampaignId[];

const campaigns = createCampaignsFromGlobs({
  gameId: 'bg3',
  campaignIDs,
  campaignStrings: strings.campaigns,
  themeModules: import.meta.glob('./campaigns/*/theme.ts', { eager: true }),
  questionModules: import.meta.glob('./campaigns/*/questions.ts', { eager: true }),
});

export const bg3Config: GameConfig = {
  id: 'bg3',

  fontFamily: 'Georgia, "Times New Roman", serif',

  title: strings.headerTitle,
  subtitle: strings.headerSubtitle,

  campaigns,

  companions: strings.companions,
  strings,

  lifelines: {
    fifty: { name: strings.lifelines.fifty, icon: '⚡️', enabled: true },
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
    lifelinePhone: lifelinePhoneIcon,
    lifelineAudience: lifelineAudienceIcon,
  },

  headerSlideshow: {
    enabled: true,
    transitionDuration: 1500,
    displayDuration: 15000,
    opacity: 1,
    campaignImageOrder: 'alphabetical',
  },
};

export default bg3Config;
