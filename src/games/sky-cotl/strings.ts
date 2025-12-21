import type { GameStringsNamespace } from '@engine/types';

export const strings = {
  // Common layout
  headerTitle: 'WHO WANTS TO BE A MILLIONAIRE',
  headerSubtitle: 'Sky: Children of the Light Edition',
  footer: '☁️ Fly, explore, and share the light ☁️',

  // Audio controls
  musicOn: 'Turn music off',
  musicOff: 'Turn music on',

  // Campaign selection screen
  introText: '{Skykid, take the path}\n{Fifteen answers in soft light}\n{A million candles}',
  selectPath: 'CHOOSE YOUR PATH',
  startButton: 'FLY',

  // Campaign cards
  campaigns: {
    moth: { name: 'MOTH', label: 'Newcomer', iconAlt: 'Moth' },
    skykid: { name: 'SKYKID', label: 'Experienced', iconAlt: 'Skykid' },
    ikeman: { name: 'IKEMAN', label: 'Veteran', iconAlt: 'Ikeman' },
  },

  // Game screen: main panels
  questionHeader: '#{n}',
  prizesHeader: 'CANDLE RUN',

  // Game screen: lifelines and actions
  lifelines: {
    fifty: '50:50',
    phone: 'Ask Spirit',
    audience: 'Ask Chat',
    double: 'Home Trick',
  },
  retreat: 'Home',

  // Game screen: lifeline panels
  lifelinePhoneHeader: 'ASK THE SPIRIT',
  lifelineAudienceHeader: 'ASK THE CHAT',
  lifelineSenderLabel: 'From:',
  lifelineAudienceLabel: 'The chat says:',

  // Game screen: optional lifeline results
  lifelineSwitchText: 'Question replaced. Keep going.',
  lifelineDoubleArmedText: 'You can make one mistake — and answer again.',
  lifelineDoubleUsedText: 'First mistake accepted. Choose again.',

  // Game screen: companion names
  companions: [
    { id: 'guide', name: 'The Guide' },
    { id: 'traveler', name: 'Fellow Traveler' },
    { id: 'elder', name: 'An Elder' },
  ],

  // Game screen: companion phrases
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

  // End screen: Common
  newGameButton: 'HOME',
  currency: 'candles',

  // End screen: victory
  victoryTitle: 'ASCENDED',
  victoryText: 'You ascended to the Orbit!',
  victoryHeader: 'ASCENDED',

  // End screen: defeat
  defeatTitle: 'DIMMED LIGHT',
  defeatText: 'Your light has dimmed.',
  defeatHeader: 'DEFEAT',
  correctAnswerLabel: 'Correct answer:',

  // End screen: retreat
  retreatTitle: 'YOU TOOK THE CANDLES',
  retreatText: 'A wise choice — safe and bright.',
  retreatHeader: 'WALK AWAY',
} as const satisfies GameStringsNamespace;
