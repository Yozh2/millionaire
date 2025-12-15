/**
 * Sky: Children of the Light - Game Configuration
 *
 * Single-campaign edition (for now).
 * All UI strings are in English (game exception).
 */

import type { DrawCoinFunction, GameConfig } from '../../engine/types';
import { skyJourneyCampaign } from './campaigns/journey/campaign';
import { skyJourneyQuestionPool } from './campaigns/journey/questions';
import {
  WingedLightTrophyIcon,
  FallenStarIcon,
  CandleIcon,
  SmallCandleCoinIcon,
  StarIcon,
} from './icons';
import { gameRegistry } from './registry';

const drawCandleCoin: DrawCoinFunction = (ctx, size, colorIndex) => {
  const waxColors = ['#ffffff', '#e2e8f0', '#f8fafc'];
  const flameColors = ['#fbbf24', '#f59e0b', '#fde047'];
  const strokeColors = ['#94a3b8', '#cbd5e1', '#64748b'];

  const s = size;
  const w = s * 0.28;
  const h = s * 0.55;
  const r = s * 0.08;

  // Candle body (rounded rect)
  const x = -w / 2;
  const y = h * 0.05;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();

  ctx.fillStyle = waxColors[colorIndex % waxColors.length];
  ctx.fill();
  ctx.strokeStyle = strokeColors[colorIndex % strokeColors.length];
  ctx.lineWidth = 1.25;
  ctx.stroke();

  // Flame (teardrop)
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.40);
  ctx.bezierCurveTo(s * 0.20, -s * 0.25, s * 0.18, -s * 0.02, 0, 0);
  ctx.bezierCurveTo(-s * 0.18, -s * 0.02, -s * 0.20, -s * 0.25, 0, -s * 0.40);
  ctx.closePath();

  ctx.fillStyle = flameColors[colorIndex % flameColors.length];
  ctx.fill();
};

export const skyCotlConfig: GameConfig = {
  id: 'sky-cotl',

  title: 'WHO WANTS TO BE A MILLIONAIRE',
  subtitle: 'Sky: Children of the Light Edition',

  emoji: '☁️',
  registry: gameRegistry,

  campaigns: [skyJourneyCampaign],

  questionPools: {
    journey: skyJourneyQuestionPool,
  },

  companions: [
    { id: 'guide', name: 'The Guide' },
    { id: 'traveler', name: 'Fellow Traveler' },
    { id: 'elder', name: 'An Elder' },
  ],

  strings: {
    // Start screen
    introText:
      'Welcome, Child of the Light. Answer 15 questions, use 3 lifelines, and collect a sky-high prize.',
    selectPath: 'CHOOSE YOUR JOURNEY',
    startButton: 'START',

    // Game screen - Question panel
    questionHeader: 'Question #{n}',

    // Game screen - Lifelines
    lifelinesHeader: 'LIFELINES',

    // Game screen - Prize ladder
    prizesHeader: 'PRIZE LADDER',

    // Lifelines
    lifelinePhoneHeader: 'CALL A FRIEND',
    lifelineAudienceHeader: 'ASK THE CROWD',
    lifelineSenderLabel: 'From:',
    lifelineAudienceLabel: 'The crowd says:',

    // Companion phrases
    companionPhrases: {
      confident: [
        'I’m sure it’s "{answer}".',
        'No doubt — "{answer}".',
        'Trust me: "{answer}".',
        'My light points to "{answer}".',
      ],
      uncertain: [
        'I think it might be "{answer}".',
        'Not certain… maybe "{answer}"?',
        'I’d guess "{answer}", but I’m not 100%.',
      ],
    },

    // End screens
    wonTitle: 'YOU DID IT!',
    wonText: 'Your light shines brightest. Congratulations!',
    wonHeader: 'VICTORY',

    lostTitle: 'GAME OVER',
    lostText: 'That was the wrong answer.',
    lostHeader: 'DEFEAT',
    correctAnswerLabel: 'Correct answer:',

    tookMoneyTitle: 'YOU TOOK THE CANDLES',
    tookMoneyText: 'A wise choice — safe and bright.',
    tookMoneyHeader: 'WALK AWAY',

    newGameButton: 'NEW GAME',

    // Footer
    footer: '☁️ Fly, explore, and share the light ☁️',

    // Music toggle
    musicOn: 'Turn music off',
    musicOff: 'Turn music on',
  },

  lifelines: {
    fifty: { name: '50:50', icon: '✨', enabled: true },
    phone: { name: 'Call', icon: '📞', enabled: true },
    audience: { name: 'Crowd', icon: '📊', enabled: true },
    double: { name: 'Second chance', icon: '🎯', enabled: true },
  },

  actions: {
    takeMoney: { name: 'Take', icon: '🕯️', enabled: true },
  },

  prizes: {
    maxPrize: 1000000,
    currency: 'candles',
    guaranteedFractions: [1 / 3, 2 / 3, 1],
  },

  audio: {
    musicVolume: 0.2,
    soundVolume: 1.0,
    voiceVolume: 1.0,
    // No external audio yet - oscillator fallbacks only
    sounds: {},
  },

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
