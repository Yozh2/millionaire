/**
 * Transformers Game Configuration
 *
 * Quiz game based on The Transformers comics:
 * - Megatron: Origin (Мегатрон — Восхождение)
 * - Autocracy (Автократия)
 * - Skybound (Земля)
 */

import { GameConfig, Campaign, DrawCoinFunction } from '../../engine/types';
import { decepticonTheme, autobotTheme, skyboundTheme } from './themes';
import {
  megatronQuestionPool,
  autocracyQuestionPool,
  skyboundQuestionPool,
} from './questions';
import {
  DecepticonIcon,
  AutobotIcon,
  SkyboundIcon,
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

const skyboundCampaign: Campaign = {
  id: 'skybound',
  name: 'SKYBOUND',
  label: 'Земля',
  icon: SkyboundIcon,
  theme: skyboundTheme,
  musicTrack: 'Skybound.ogg',
  selectSound: 'SkyboundSelect.ogg',
};

// ============================================
// Main Config
// ============================================

export const transformersConfig: GameConfig = {
  id: 'transformers',

  title: 'КТО ХОЧЕТ СТАТЬ МИЛЛИОНЕРОМ',
  subtitle: 'THE TRANSFORMERS EDITION',

  campaigns: [megatronCampaign, autocracyCampaign, skyboundCampaign],

  questionPools: {
    megatron: megatronQuestionPool,
    autocracy: autocracyQuestionPool,
    skybound: skyboundQuestionPool,
  },

  companions: [
    { id: 'soundwave', name: 'Саундвейв' },
    { id: 'starscream', name: 'Старскрим' },
    { id: 'shockwave', name: 'Шоквейв' },
    { id: 'ratchet', name: 'Рэтчет' },
    { id: 'jazz', name: 'Джаз' },
  ],

  strings: {
    headerTitle: '⚡ ТРАНСФОРМЕРЫ ⚡',

    introText:
      'Проверь свои знания о вселенной Трансформеров! Ответь на вопросы и заполучи весь энергон!',
    selectPath: 'ВЫБЕРИ КОМИКС',
    startButton: 'ПОКАТИЛИ',

    questionHeader: 'ВОПРОС #{n}',
    difficultyLabel: 'СЛОЖНОСТЬ',
    progressLabel: 'Прогресс',

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

    wonTitle: '⚡ ПОБЕДА! ⚡',
    wonText: 'Ты достоин нести Матрицу Лидерства!',
    wonHeader: 'ТРИУМФ',

    lostTitle: '💥 ПОРАЖЕНИЕ! 💥',
    lostText: 'Твоя искра погасла...',
    lostHeader: 'УНИЧТОЖЕН',
    correctAnswerLabel: 'Правильный ответ:',

    tookMoneyTitle: '🔮 ЭНЕРГОН СОБРАН 🔮',
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
};

export default transformersConfig;
