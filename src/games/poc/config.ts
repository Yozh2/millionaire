/**
 * PoC Game Configuration
 *
 * Minimal PoC game for testing the engine.
 * Uses oscillator sounds only, no external assets.
 */

import type { GameConfig } from '../../engine/types';
import { easyCampaign } from './campaigns/easy/campaign';
import { hardCampaign } from './campaigns/hard/campaign';
import { easyQuestionPool } from './campaigns/easy/questions';
import { hardQuestionPool } from './campaigns/hard/questions';
import { TrophyIcon, FailIcon, MoneyIcon } from './icons';

// ============================================
// Main Config
// ============================================

export const pocConfig: GameConfig = {
  id: 'poc',

  title: 'КТО ХОЧЕТ СТАТЬ МИЛЛИОНЕРОМ',
  subtitle: 'ТЕСТ ДВИЖКА',

  emoji: '⚙️',

  campaigns: [easyCampaign, hardCampaign],

  questionPools: {
    easy: easyQuestionPool,
    hard: hardQuestionPool,
  },

  companions: [
    { id: 'alexey', name: 'Алексей' },
    { id: 'maria', name: 'Мария' },
    { id: 'sergey', name: 'Сергей' },
  ],

  strings: {
    introText:
      'Проверь свои знания! Ответь на вопросы, чтобы выиграть главный приз.',
    selectPath: 'ВЫБЕРИТЕ СЛОЖНОСТЬ',
    startButton: 'НАЧАТЬ ИГРУ',

    questionHeader: '#{n}',

    lifelinesHeader: 'ПОДСКАЗКИ',
    prizesHeader: 'ПРИЗЫ',

    hintPhoneHeader: 'СОВЕТ ДРУГА',
    hintAudienceHeader: 'ОПРОС ЗАЛА',
    hintSenderLabel: 'От:',
    hintAudienceLabel: 'Зал считает:',

    companionPhrases: {
      confident: ['Я уверен, что это "{answer}"', 'Точно "{answer}"'],
      uncertain: ['Может быть "{answer}"?', 'Думаю, это "{answer}"'],
    },

    wonTitle: '🎉 ПОБЕДА!',
    wonText: 'Поздравляем! Вы выиграли главный приз!',
    wonHeader: 'ПОБЕДА',

    lostTitle: '❌ ИГРА ОКОНЧЕНА',
    lostText: 'Неправильный ответ!',
    lostHeader: 'ПОРАЖЕНИЕ',
    correctAnswerLabel: 'Правильный ответ:',

    tookMoneyTitle: '💰 ДЕНЬГИ ЗАБРАНЫ',
    tookMoneyText: 'Умный выбор!',
    tookMoneyHeader: 'ПРИЗ ПОЛУЧЕН',

    newGameButton: 'ИГРАТЬ СНОВА',

    footer: '★ Тестовый движок викторины ★',

    musicOn: 'Выкл. музыку',
    musicOff: 'Вкл. музыку',
  },

  lifelines: {
    fiftyFifty: { name: '50:50', icon: '⚡', enabled: true },
    phoneAFriend: { name: 'Звонок', icon: '📞', enabled: true },
    askAudience: { name: 'Зал', icon: '📊', enabled: true },
    host: { name: 'Ведущий', icon: '🎭', enabled: true },
    switch: { name: 'Замена', icon: '🔁', enabled: true },
    double: { name: 'Ошибиться', icon: '🎯', enabled: true },
    takeMoney: { name: 'Забрать', icon: '💰', enabled: true },
  },

  prizes: {
    maxPrize: 1000000,
    currency: '$',
    guaranteedFractions: [1 / 3, 2 / 3, 1],
  },

  audio: {
    musicVolume: 0.2,
    soundVolume: 1.0,
    voiceVolume: 1.0,
    // No music/sound files - uses oscillator fallbacks only
    sounds: {},
  },

  endIcons: {
    won: TrophyIcon,
    lost: FailIcon,
    tookMoney: MoneyIcon,
  },
};

export default pocConfig;
