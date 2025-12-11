/**
 * Baldur's Gate 3 - Game Configuration
 *
 * Complete configuration for the BG3 edition of the quiz game.
 */

import { GameConfig, Campaign, Companion, DrawCoinFunction } from '../../engine/types';
import { heroTheme, mindFlayerTheme, darkUrgeTheme } from './themes';
import {
  HeroIcon,
  MindFlayerIcon,
  DarkUrgeIcon,
  TrophyIcon,
  MoneyIcon,
  CriticalFailIcon,
  CoinIcon,
  ScrollIcon,
  TavernIcon,
} from './icons';
import {
  heroQuestionPool,
  mindFlayerQuestionPool,
  darkUrgeQuestionPool,
} from './questions';

// ============================================
// Custom Coin Drawing - Simple gold coin
// ============================================

const drawGoldCoin: DrawCoinFunction = (ctx, size, colorIndex) => {
  const colors = ['#fbbf24', '#fcd34d', '#f59e0b'];
  const strokeColors = ['#b45309', '#d97706', '#92400e'];
  const radius = size / 2;

  // Simple gold circle
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = colors[colorIndex % colors.length];
  ctx.fill();
  ctx.strokeStyle = strokeColors[colorIndex % strokeColors.length];
  ctx.lineWidth = 1.5;
  ctx.stroke();
};

// ============================================
// Campaigns
// ============================================

const heroCampaign: Campaign = {
  id: 'hero',
  name: 'ГЕРОЙ',
  label: 'Легко',
  icon: HeroIcon,
  theme: heroTheme,
  musicTrack: 'Hero.ogg',
  selectSound: 'CampaignHero.ogg',
};

const mindFlayerCampaign: Campaign = {
  id: 'mindFlayer',
  name: 'ИЛЛИТИД',
  label: 'Сложно',
  icon: MindFlayerIcon,
  theme: mindFlayerTheme,
  musicTrack: 'MindFlayer.ogg',
  selectSound: 'CampaignMindFlayer.ogg',
};

const darkUrgeCampaign: Campaign = {
  id: 'darkUrge',
  name: 'СОБЛАЗН',
  label: 'Доблесть',
  icon: DarkUrgeIcon,
  theme: darkUrgeTheme,
  musicTrack: 'DarkUrge.ogg',
  selectSound: 'CampaignDarkUrge.ogg',
};

// ============================================
// Companions
// ============================================

const companions: Companion[] = [
  { id: 'astarion', name: 'Астарион', voiceFile: 'Astarion.ogg' },
  { id: 'gale', name: 'Гейл', voiceFile: 'Gale.ogg' },
  { id: 'shadowheart', name: 'Шэдоухарт', voiceFile: 'Shadowheart.ogg' },
  { id: 'karlach', name: 'Карлах', voiceFile: 'Karlach.ogg' },
];

// ============================================
// Main Config
// ============================================

export const bg3Config: GameConfig = {
  id: 'bg3',

  title: 'КТО ХОЧЕТ СТАТЬ МИЛЛИОНЕРОМ',
  subtitle: "Baldur's Gate III Edition",

  emoji: '⚔️',

  // Georgia - классический шрифт для фэнтези-тематики
  fontFamily: 'Georgia, "Times New Roman", serif',

  campaigns: [heroCampaign, mindFlayerCampaign, darkUrgeCampaign],

  questionPools: {
    hero: heroQuestionPool,
    mindFlayer: mindFlayerQuestionPool,
    darkUrge: darkUrgeQuestionPool,
  },

  companions,

  strings: {
    // Start screen
    introText:
      'Искатель приключений! Перед тобой испытание на знание Забытых Королевств. ' +
      '15 вопросов, 3 магические подсказки, 3 000 000 золотых на кону.',
    selectPath: '✦ ВЫБЕРИ ПУТЬ ✦',
    startButton: 'В ПРИКЛЮЧЕНИЕ',

    // Game screen - Question panel
    questionHeader: '#{n}',

    // Game screen - Lifelines
    lifelinesHeader: '✦ МАГИЧЕСКИЕ СПОСОБНОСТИ ✦',

    // Game screen - Prize ladder
    prizesHeader: '✦ СОКРОВИЩЕ ✦',

    // Hints
    hintPhoneHeader: '✦ МАГИЧЕСКОЕ ПОСЛАНИЕ ✦',
    hintAudienceHeader: '✦ РЕЗУЛЬТАТЫ ГАДАНИЯ ✦',
    hintSenderLabel: 'Отправитель:',
    hintAudienceLabel: 'Мнение таверны:',

    // Companion phrases
    companionPhrases: {
      confident: [
        'Я уверен, что это "{answer}"',
        'По-моему, правильный ответ — "{answer}"',
        'Это точно "{answer}"',
        'Селюнский свет ведёт к "{answer}"',
        'Астарион уже поднимает бокал за "{answer}"',
        'Кости судьбы выпали на "{answer}"',
        'Даже Мысличный червь не спорит: "{answer}"',
        'Лаэ\'зель потребовала поставить на "{answer}"',
        'Гейл дал слово архимагов за "{answer}"',
        'Орфей подтвердил — "{answer}"',
        'Моя тьма сверхразума шепчет "{answer}"',
      ],
      uncertain: [
        'Думаю, что это "{answer}"',
        'Рискну сказать "{answer}"',
        'Возможно, это "{answer}"',
        'Гадаю на кости — может, "{answer}"',
        'Оракул в Урдене шепчет про "{answer}", но не уверен',
        'Иллитид в голове показывает "{answer}", хотя картинка расплывчата',
        'Жребий жреца лёг на "{answer}", но рука дрогнула',
        'Шепоты Абсолюта слышат "{answer}", но они редко правы',
        'Эндаревы карты склоняются к "{answer}"',
        'Если следовать интуиции Шэдоухарт, то "{answer}" — но без гарантий',
        'Побочный эффект тэдпола шепчет про "{answer}"',
      ],
    },

    // End screens
    wonTitle: '🏆 ЛЕГЕНДАРНЫЙ ГЕРОЙ 🏆',
    wonText: 'Вы завоевали величайшее сокровище Фаэруна!',
    wonHeader: 'КВЕСТ ЗАВЕРШЁН',

    lostTitle: '💀 КРИТИЧЕСКИЙ ПРОВАЛ 💀',
    lostText: 'Кость брошена. Неверный ответ.',
    lostHeader: 'КВЕСТ ПРОВАЛЕН',
    correctAnswerLabel: 'Правильный ответ:',

    tookMoneyTitle: '✨ МУДРЫЙ ВЫБОР ✨',
    tookMoneyText: 'Разумное решение, искатель приключений',
    tookMoneyHeader: 'НАГРАДА ПОЛУЧЕНА',

    newGameButton: 'В ЛАГЕРЬ',

    // Footer
    footer: "✦ By Mystra's Grace ✦",

    // Music toggle
    musicOn: 'Выключить музыку',
    musicOff: 'Включить музыку',
  },

  lifelines: {
    fiftyFifty: {
      name: '50:50',
      icon: '⚡',
      enabled: true,
    },
    phoneAFriend: {
      name: 'Послание',
      icon: '📜',
      enabled: true,
    },
    askAudience: {
      name: 'Таверна',
      icon: '🍺',
      enabled: true,
    },
    takeMoney: {
      name: 'Забрать',
      icon: '💰',
      enabled: true,
    },
  },

  prizes: {
    maxPrize: 1000000,
    currency: 'золотых',
    // Guaranteed at 1/3, 2/3, and final question
    guaranteedFractions: [1 / 3, 2 / 3, 1],
  },

  audio: {
    musicVolume: 0.2,
    soundVolume: 1.0,
    voiceVolume: 1.0,
    mainMenuTrack: 'MainMenu.ogg',
    gameOverTrack: 'GameOver.ogg',
    sounds: {
      answerButton: 'AnswerClick.ogg',
      bigButton: 'BigButtonPress.ogg',
      hintReduceButton: 'HintReduce.ogg',
      hintVoteButton: 'HintVote.ogg',
      hintTakeMoneyButton: 'HintTakeMoney.ogg',
      defeat: 'Fail.ogg',
    },
  },

  endIcons: {
    won: TrophyIcon,
    lost: CriticalFailIcon,
    tookMoney: MoneyIcon,
  },

  icons: {
    coin: CoinIcon,
    phoneHint: ScrollIcon,
    audienceHint: TavernIcon,
  },

  // Custom gold coin particles for win/take money effects
  drawCoinParticle: drawGoldCoin,

  // Header slideshow - images loaded from manifest.json
  headerSlideshow: {
    enabled: true,
    transitionDuration: 1500,
    displayDuration: 4000,
    opacity: 1,
  },
};

export default bg3Config;
