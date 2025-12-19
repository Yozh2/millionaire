import type { Companion, GameStrings } from '@engine/types';
import { applyNoBreakMarkupDeep } from '@engine/utils';

export const skyCotlTitle = 'WHO WANTS TO BE A MILLIONAIRE';
export const skyCotlSubtitle = 'Sky: Children of the Light Edition';

export const skyCotlCampaignStrings = {
  moth: { name: 'MOTH', label: 'Newcomer', iconAlt: 'Moth' },
  skykid: { name: 'SKYKID', label: 'Experienced', iconAlt: 'Skykid' },
  ikeman: { name: 'IKEMAN', label: 'Veteran', iconAlt: 'Ikeman' },
} as const;

export const skyCotlCompanions: Companion[] = [
  { id: 'guide', name: 'The Guide' },
  { id: 'traveler', name: 'Fellow Traveler' },
  { id: 'elder', name: 'An Elder' },
];

export const skyCotlStrings: GameStrings = applyNoBreakMarkupDeep({
  introText: '{Skykid, take the path}\n{Fifteen answers in soft light}\n{A million candles}',
  selectPath: 'CHOOSE YOUR PATH',
  startButton: 'FLY',

  questionHeader: '#{n}',

  lifelinesHeader: 'LIFELINES',
  prizesHeader: 'CANDLE RUN',

  lifelinePhoneHeader: 'ASK THE SPIRIT',
  lifelineAudienceHeader: 'ASK THE CHAT',
  lifelineSenderLabel: 'From:',
  lifelineAudienceLabel: 'The chat says:',

  lifelineSwitchText: 'Question replaced. Keep going.',
  lifelineDoubleArmedText: 'You can make one mistake — and answer again.',
  lifelineDoubleUsedText: 'First mistake accepted. Choose again.',

  companionPhrases: {
    confident: [
      'I’m sure it’s "{answer}".',
      'No doubt — "{answer}".',
      'Trust me: "{answer}".',
      'I bet my red candles on "{answer}".',
    ],
    uncertain: [
      'I think it might be "{answer}".',
      'Not certain… maybe "{answer}"?',
      'I’d guess "{answer}", but I’m not 100%.',
    ],
  },

  wonTitle: 'ASCENDED',
  wonText: 'You ascended to the Orbit!',
  wonHeader: 'ASCENDED',

  lostTitle: 'DIMMED LIGHT',
  lostText: 'Your light has dimmed.',
  lostHeader: 'DEFEAT',
  correctAnswerLabel: 'Correct answer:',

  tookMoneyTitle: 'YOU TOOK THE CANDLES',
  tookMoneyText: 'A wise choice — safe and bright.',
  tookMoneyHeader: 'WALK AWAY',

  newGameButton: 'HOME',

  footer: '☁️ Fly, explore, and share the light ☁️',

  musicOn: 'Turn music off',
  musicOff: 'Turn music on',
});

export const skyCotlLifelineNames = {
  fifty: '50:50',
  phone: 'Ask Spirit',
  audience: 'Ask Chat',
  double: 'Home Trick',
} as const;

export const skyCotlActionNames = {
  takeMoney: 'Home',
} as const;

export const skyCotlCurrency = 'candles';
