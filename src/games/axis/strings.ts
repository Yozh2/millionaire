import type { GameStringsNamespace } from '@engine/types';

export const strings = {
  // Common layout
  headerTitle: 'КТО ХОЧЕТ СТАТЬ МИЛЛИОНЕРОМ',
  headerSubtitle: 'Мир Поднебесья',
  footer: '✦ Мир Поднебесья ✦',

  // Audio controls
  musicOn: 'Вкл. звук',
  musicOff: 'Выкл. звук',

  // Campaign selection screen
  introText:
    '{Путник!}\n' +
    '{Перед тобой испытание} {на знание} {вселенной Поднебесья}.\n' +
    '{15 вопросов}, подсказки, {миллион на кону}',
  selectPath: '✦ ВЫБЕРИ ПУТЬ ✦',
  startButton: 'В ПРИКЛЮЧЕНИЕ',

  // Campaign cards
  campaigns: {
    yona: { name: 'ПУТЬ ЁНЫ', label: 'Акмурийка', iconAlt: 'Yona' },
    travelers: { name: 'СТРАННИКИ', label: 'Команда', iconAlt: 'Travelers' },
    world: { name: 'ПОДНЕБЕСЬЕ', label: 'Мироустройство', iconAlt: 'World' },
  },

  // Game screen: main panels
  prizeladderHeader: '✦ НАГРАДА ✦',
  currency: 'зм',

  // Game screen: lifelines and actions
  lifelines: {
    fifty: '50:50',
    phone: 'Послание',
    audience: 'Кошкомоли',
    double: 'Вдохновение',
  },
  retreat: 'Забрать',

  // Game screen: lifeline panels
  lifelinePhoneHeader: '✦ СВИТОК ОТ ДОБРОЖЕЛАТЕЛЯ ✦',
  lifelineAudienceHeader: '✦ ЗНАК КОШКОМОЛЕЙ ✦',
  lifelineSenderLabel: 'Послание:',
  lifelineAudienceLabel: 'Мнение пути:',

  // Game screen: companion names
  companions: [
    { id: 'aran', name: 'Аран' },
    { id: 'antey', name: 'Антей' },
    { id: 'yuilun', name: 'Юйлун' },
    { id: 'yoli', name: 'Ёли' },
  ],

  // Game screen: companion phrases
  companionPhrases: {
    confident: [
      'Это точно "{answer}"',
      'Спорить нечего — "{answer}"',
      'Я бы поставил на "{answer}"',
      'Вижу это ясно: "{answer}"',
      'Мои заметки сходятся на "{answer}"',
    ],
    uncertain: [
      'Возможно, что это "{answer}"',
      'Склоняюсь к "{answer}", но не уверен',
      'Если довериться интуиции — "{answer}"',
      'Похоже на "{answer}"',
      'Сердце говорит "{answer}"',
    ],
  },

  // End screen: victory
  victoryHeader: 'ПУТНИК ОСИ',
  victoryText: 'Ты прошёл все испытания и добрался до вершины Оси.',

  // End screen: defeat
  defeatHeader: 'КРИТИЧЕСКИЙ ПРОВАЛ',
  defeatText: 'Путь был труден, и ты не смог дойти до цели.',

  // End screen: retreat
  retreatHeader: 'МУДРЫЙ ОТХОД',
  retreatText: 'Иногда лучше свернуть с тропы вовремя.',

  // End screen: Common
  newGameButton: 'В ЛАГЕРЬ',

} as const satisfies GameStringsNamespace;
