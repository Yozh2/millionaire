/**
 * Baldur's Gate 3 - Game Configuration
 *
 * Complete configuration for the BG3 edition of the quiz game.
 */

import { GameConfig, Campaign, Companion } from '../../engine/types';
import { heroTheme, mindFlayerTheme, darkUrgeTheme } from './themes';
import {
  SwordIcon,
  MindFlayerIcon,
  DarkUrgeIcon,
  TrophyIcon,
  MoneyIcon,
  CriticalFailIcon,
  CoinIcon,
  ScrollIcon,
  TavernIcon,
} from './icons';
import { heroQuestions, mindFlayerQuestions, darkUrgeQuestions } from './questions';

// ============================================
// Campaigns
// ============================================

const heroCampaign: Campaign = {
  id: 'hero',
  name: 'ГЕРОЙ',
  label: 'Легко',
  icon: SwordIcon,
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
  { id: 'astarion', name: 'Астарион', voiceFile: 'Astarion.mp3' },
  { id: 'gale', name: 'Гейл', voiceFile: 'Gale.mp3' },
  { id: 'shadowheart', name: 'Шэдоухарт', voiceFile: 'Shadowheart.mp3' },
  { id: 'karlach', name: 'Карлах', voiceFile: 'Karlach.mp3' },
];

// ============================================
// Main Config
// ============================================

export const bg3Config: GameConfig = {
  id: 'bg3',

  title: 'КТО ХОЧЕТ СТАТЬ МИЛЛИОНЕРОМ',
  subtitle: "BALDUR'S GATE 3 EDITION",

  campaigns: [heroCampaign, mindFlayerCampaign, darkUrgeCampaign],

  questions: {
    hero: heroQuestions,
    mindFlayer: mindFlayerQuestions,
    darkUrge: darkUrgeQuestions,
  },

  companions,

  strings: {
    // Header
    headerTitle: '✦ ДРЕВНИЙ СВИТОК ✦ СРОЧНЫЙ КВЕСТ ✦',

    // Start screen
    introText:
      'Искатель приключений! Перед тобой испытание на знание Забытых Королевств. ' +
      '15 вопросов, 3 магические подсказки, 3,000,000 золотых на кону.',
    selectPath: '✦ ВЫБЕРИ ПУТЬ ✦',
    startButton: '⚔ НАЧАТЬ ПРИКЛЮЧЕНИЕ ⚔',

    // Game screen - Question panel
    questionHeader: '✦ ВОПРОС #{n} ✦',
    difficultyLabel: 'СЛОЖНОСТЬ:',
    progressLabel: 'Прогресс:',

    // Game screen - Lifelines
    lifelinesHeader: '✦ МАГИЧЕСКИЕ СПОСОБНОСТИ ✦',

    // Game screen - Prize ladder
    prizesHeader: '✦ СПИСОК НАГРАД ✦',

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
      ],
      uncertain: [
        'Думаю, что это "{answer}"',
        'Рискну сказать "{answer}"',
        'Возможно, это "{answer}"',
      ],
    },

    // End screens
    wonTitle: '⚔ ЛЕГЕНДАРНЫЙ ГЕРОЙ ⚔',
    wonText: 'Вы завоевали величайшее сокровище Фаэруна!',
    wonHeader: '✦ КВЕСТ ЗАВЕРШЁН ✦',

    lostTitle: '💀 КРИТИЧЕСКИЙ ПРОВАЛ 💀',
    lostText: 'Кость брошена. Неверный ответ.',
    lostHeader: '✦ КВЕСТ ПРОВАЛЕН ✦',
    correctAnswerLabel: 'Правильный ответ:',

    tookMoneyTitle: '✨ МУДРЫЙ ВЫБОР ✨',
    tookMoneyText: 'Мудрое решение, искатель приключений.',
    tookMoneyHeader: '✦ НАГРАДА ПОЛУЧЕНА ✦',

    prizeLabel: 'НАГРАДА:',
    newGameButton: '⚔ НОВОЕ ПРИКЛЮЧЕНИЕ ⚔',

    // Footer
    footer: "✦ By Mystra's Grace ✦ For the Realms ✦ Gather Your Party ✦",

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
    values: [
      '500',
      '1,000',
      '2,000',
      '3,000',
      '5,000',
      '10,000',
      '15,000',
      '25,000',
      '50,000',
      '100,000',
      '200,000',
      '400,000',
      '800,000',
      '1,500,000',
      '3,000,000',
    ],
    guaranteed: [4, 9, 14], // Questions 5, 10, 15
    currency: 'золотых',
  },

  audio: {
    musicVolume: 0.2,
    soundVolume: 1.0,
    voiceVolume: 1.0,
    mainMenuTrack: 'MainMenu.ogg',
    gameOverTrack: 'GameOver.ogg',
    sounds: {
      click: 'Click.ogg',
      start: 'Start.ogg',
      hint: 'Hint.ogg',
      vote: 'Vote.ogg',
      money: 'Money.ogg',
      restart: 'Restart.ogg',
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
};

export default bg3Config;
