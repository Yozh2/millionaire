import type { Companion, GameStrings } from '@engine/types';

export const skyCotlTitle = 'WHO WANTS TO BE A MILLIONAIRE';
export const skyCotlSubtitle = 'Sky: Children of the Light Edition';

export const skyCotlCampaignStrings = {
  journey: {
    name: 'SKY JOURNEY',
    label: 'One campaign',
    iconAriaLabel: 'Sky Journey',
  },
} as const;

export const skyCotlCompanions: Companion[] = [
  { id: 'guide', name: 'The Guide' },
  { id: 'traveler', name: 'Fellow Traveler' },
  { id: 'elder', name: 'An Elder' },
];

export const skyCotlStrings: GameStrings = {
  introText:
    'Welcome, Child of the Light. Answer 15 questions, use 3 lifelines, and collect a sky-high prize.',
  selectPath: 'CHOOSE YOUR JOURNEY',
  startButton: 'FLY',

  questionHeader: 'Question #{n}',

  lifelinesHeader: 'LIFELINES',
  prizesHeader: 'PRIZE LADDER',

  lifelinePhoneHeader: 'ASK THE SPIRIT',
  lifelineAudienceHeader: 'ASK THE CHAT',
  lifelineSenderLabel: 'From:',
  lifelineAudienceLabel: 'The chat says:',

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
};

export const skyCotlLifelineNames = {
  fifty: '50:50',
  phone: 'Ask Spirit',
  audience: 'Ask Chat',
  double: 'Re-login',
} as const;

export const skyCotlActionNames = {
  takeMoney: 'Home',
} as const;

export const skyCotlCurrency = 'candles';
