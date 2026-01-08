import type { GameStringsNamespace } from '@engine/types';

export const strings = {
  // Common layout
  headerTitle: 'КТО ХОЧЕТ СТАТЬ МИЛЛИОНЕРОМ',
  headerSubtitle: 'Axis Edition',
  footer: '✦ Ось Поднебесья ✦',

  // Audio controls
  musicOn: 'Выключить музыку',
  musicOff: 'Включить музыку',

  // Campaign selection screen
  introText:
    '{Путник!}\nПеред тобой испытание {на знание} {Оси Поднебесья}.\n' +
    '{15 вопросов}, {подсказки}, {миллион на кону}',
  selectPath: '✦ ВЫБЕРИ ПУТЬ ✦',
  startButton: 'В ПУТЬ',

  // Campaign cards
  campaigns: {
    yona: { name: 'ПУТЬ ЁНЫ', label: 'История', iconAlt: 'Yona' },
    travelers: { name: 'СТРАННИКИ', label: 'Путешествие', iconAlt: 'Travelers' },
    world: { name: 'ПОДНЕБЕСЬЕ', label: 'Лор', iconAlt: 'World' },
  },

  // Game screen: main panels
  questionHeader: '#{n}',
  prizesHeader: '✦ НАГРАДА ✦',

  // Game screen: lifelines and actions
  lifelines: {
    fifty: '50:50',
    phone: 'Спутник',
    audience: 'Голос пути',
    double: 'Двойной шанс',
  },
  retreat: 'Забрать',

  // Game screen: lifeline panels
  lifelinePhoneHeader: '✦ СОВЕТ СПУТНИКА ✦',
  lifelineAudienceHeader: '✦ ГОЛОС ПУТИ ✦',
  lifelineSenderLabel: 'Спутник:',
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
      'Путь указывает на "{answer}"',
      'Ёли уже рычит: "{answer}"',
      'Чуйка ведёт к "{answer}"',
      'Вижу это ясно: "{answer}"',
      'Мои заметки сходятся на "{answer}"',
    ],
    uncertain: [
      'Думаю, что это "{answer}"',
      'Склоняюсь к "{answer}", но не уверен',
      'Возможно, "{answer}"',
      'Если довериться интуиции — "{answer}"',
      'Похоже на "{answer}", но могу ошибаться',
      'Скорее всего "{answer}"',
      'Сердце говорит "{answer}"',
      'Не клянусь, но скажу "{answer}"',
    ],
  },

  // End screen: Common
  newGameButton: 'Новый путь',
  currency: 'зм',

  // End screen: victory
  victoryText: 'Ты прошёл все испытания и добрался до вершины Оси.',
  victoryHeader: 'ПУТНИК ОСИ',

  // End screen: defeat
  defeatText: 'Неверный ответ. Путь обрывается.',
  defeatHeader: 'СЛОМАННЫЙ КРУГ',
  correctAnswerLabel: 'Правильный ответ:',

  // End screen: retreat
  retreatText: 'Иногда лучше свернуть с тропы вовремя.',
  retreatHeader: 'МУДРЫЙ ОТХОД',

} as const satisfies GameStringsNamespace;
