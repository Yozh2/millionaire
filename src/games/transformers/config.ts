/**
 * Transformers Game Configuration
 *
 * Quiz game based on IDW Transformers comics:
 * - Megatron: Origin (Мегатрон — Восхождение)
 * - Autocracy (Автократия)
 */

import { GameConfig, Campaign, DrawCoinFunction } from '../../engine/types';
import { decepticonTheme, autobotTheme } from './themes';
import { megatronQuestionPool, autocracyQuestionPool } from './questions';
import {
  DecepticonIcon,
  AutobotIcon,
  MatrixIcon,
  DestroyedIcon,
  EnergonIcon,
} from './icons';

// ============================================
// Custom Energon Crystal Drawing - simple pink/blue crystal
// ============================================

const drawEnergonCrystal: DrawCoinFunction = (ctx, size, colorIndex) => {
  const colors = ['#FF69B4', '#00BFFF', '#DA70D6']; // Pink, Blue, Orchid
  const glowColors = ['#FFB6C1', '#87CEEB', '#DDA0DD'];

  const halfSize = size / 2;

  // Simple diamond/crystal shape
  ctx.beginPath();
  ctx.moveTo(0, -halfSize);           // Top
  ctx.lineTo(halfSize * 0.6, 0);      // Right
  ctx.lineTo(0, halfSize);            // Bottom
  ctx.lineTo(-halfSize * 0.6, 0);     // Left
  ctx.closePath();

  ctx.fillStyle = colors[colorIndex % colors.length];
  ctx.fill();
  ctx.strokeStyle = glowColors[colorIndex % glowColors.length];
  ctx.lineWidth = 1.5;
  ctx.stroke();
};

// ============================================
// Campaigns
// ============================================

const megatronCampaign: Campaign = {
  id: 'megatron',
  name: 'МЕГАТРОН',
  label: 'Восхождение',
  icon: DecepticonIcon,
  theme: decepticonTheme,
  musicTrack: 'Decepticon.ogg',
  selectSound: 'DecepticonSelect.ogg',
};

const autocracyCampaign: Campaign = {
  id: 'autocracy',
  name: 'АВТОКРАТИЯ',
  label: 'Орион Пакс',
  icon: AutobotIcon,
  theme: autobotTheme,
  musicTrack: 'Autobot.ogg',
  selectSound: 'AutobotSelect.ogg',
};

// ============================================
// Main Config
// ============================================

export const transformersConfig: GameConfig = {
  id: 'transformers',

  title: 'ТРАНСФОРМЕРЫ',
  subtitle: 'IDW COMICS EDITION',

  campaigns: [megatronCampaign, autocracyCampaign],

  questionPools: {
    megatron: megatronQuestionPool,
    autocracy: autocracyQuestionPool,
  },

  companions: [
    { id: 'soundwave', name: 'Саундвейв (связист)' },
    { id: 'starscream', name: 'Старскрим (лётчик)' },
    { id: 'shockwave', name: 'Шоквейв (учёный)' },
    { id: 'ratchet', name: 'Рэтчет (медик)' },
    { id: 'jazz', name: 'Джаз (разведчик)' },
  ],

  strings: {
    headerTitle: '⚡ ТРАНСФОРМЕРЫ ⚡',

    introText:
      'Проверь свои знания о вселенной Трансформеров! Ответь на вопросы по комиксам IDW.',
    selectPath: 'ВЫБЕРИ ФРАКЦИЮ',
    startButton: '▶ НАЧАТЬ ИГРУ',

    questionHeader: 'ВОПРОС #{n}',
    difficultyLabel: 'СЛОЖНОСТЬ:',
    progressLabel: 'Прогресс:',

    lifelinesHeader: 'ПОДСКАЗКИ',
    prizesHeader: 'ЭНЕРГОН',

    hintPhoneHeader: 'СВЯЗЬ С БАЗОЙ',
    hintAudienceHeader: 'СОВЕТ ОТРЯДА',
    hintSenderLabel: 'Сообщение от:',
    hintAudienceLabel: 'Отряд считает:',

    companionPhrases: {
      confident: [
        'Мои сенсоры показывают — это "{answer}"',
        'Логический анализ указывает на "{answer}"',
        'Без сомнений, ответ: "{answer}"',
      ],
      uncertain: [
        'Возможно, это "{answer}"...',
        'Мои данные неполны, но думаю "{answer}"',
        'Предполагаю "{answer}", но не уверен',
      ],
    },

    wonTitle: '⚡ ПОБЕДА!',
    wonText: 'Ты достоин нести Матрицу Лидерства!',
    wonHeader: 'ТРИУМФ',

    lostTitle: '💥 ПОРАЖЕНИЕ',
    lostText: 'Твоя искра погасла...',
    lostHeader: 'УНИЧТОЖЕН',
    correctAnswerLabel: 'Правильный ответ:',

    tookMoneyTitle: '🔮 ЭНЕРГОН СОБРАН',
    tookMoneyText: 'Мудрое решение — сохранить ресурсы!',
    tookMoneyHeader: 'ОТСТУПЛЕНИЕ',

    prizeLabel: 'ЭНЕРГОН:',
    newGameButton: '▶ ТРАНСФОРМАЦИЯ',

    footer: '⚡ Till All Are One ⚡',

    musicOn: 'Выкл. музыку',
    musicOff: 'Вкл. музыку',
  },

  lifelines: {
    fiftyFifty: { name: '50:50', icon: '⚡', enabled: true },
    phoneAFriend: { name: 'База', icon: '📡', enabled: true },
    askAudience: { name: 'Отряд', icon: '🤖', enabled: true },
    takeMoney: { name: 'Забрать', icon: '🔮', enabled: true },
  },

  prizes: {
    maxPrize: 1000000,
    currency: 'энергона',
    guaranteedFractions: [1 / 3, 2 / 3, 1],
  },

  audio: {
    musicVolume: 0.3,
    soundVolume: 1.0,
    voiceVolume: 1.0,
    mainMenuTrack: 'MainMenu.ogg',
    gameOverTrack: 'GameOver.ogg',
    sounds: {
      click: 'Click.ogg',
      correct: 'Correct.ogg',
      money: 'Money.ogg',
      defeat: 'Defeat.ogg',
    },
  },

  endIcons: {
    won: MatrixIcon,
    lost: DestroyedIcon,
    tookMoney: EnergonIcon,
  },

  // Energon crystals instead of coins
  drawCoinParticle: drawEnergonCrystal,

  // Page metadata for browser favicon and iOS home screen icon
  meta: {
    favicon: '/games/transformers/favicon.svg',
    appleTouchIcon: '/games/transformers/apple-touch-icon.svg',
    themeColor: '#9333ea', // Purple/energon theme
  },
};

export default transformersConfig;
