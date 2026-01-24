import type { GameStringsNamespace } from '@engine/types';

export const strings = {
  // Common layout
  headerTitle: 'КТО ХОЧЕТ СТАТЬ МИЛЛИОНЕРОМ',
  headerSubtitle: 'НЕЙРОННЫЕ СЕТИ В ЗАДАЧАХ РАДИОЛОКАЦИИ',
  footer: '✦ Курс NNR ✦',

  // Audio controls
  musicOn: 'Вкл. звук',
  musicOff: 'Выкл. звук',

  // Campaign selection screen
  introText:
    '{Испытуемый!} Протокол NNR активирован.' +
    '\n{Тебя ждут} {15 вопросов}. {Миллион на кону}.' +
    '\nНепредвиденное поведение будет зафиксировано.',
  selectPath: 'ВЫБЕРИ ИСПЫТАНИЕ',
  startButton: 'НАЧАТЬ ИСПЫТАНИЕ',

  // Campaign cards
  campaigns: {
    perceptron: { name: 'ПЕРЦЕПТРОН', label: 'Машинное обучение', iconAlt: 'Perceptron' },
    nn: { name: 'НЕЙРОСЕТИ', label: 'Архитектуры', iconAlt: 'Нейросети' },
    research: { name: 'ИССЛЕДОВАНИЯ', label: 'Научная информация', iconAlt: 'Наука' },
  },

  // Game screen: main panels
  prizeladderHeader: 'БАЛЛЫ',
  currency: 'баллов',

  // Game screen: lifelines and actions
  lifelines: {
    fifty: '50:50',
    phone: 'Помощь ИИ',
    audience: 'Агенты ИИ',
    double: 'Симуляция',
  },
  retreat: 'Забрать',

  // Game screen: lifeline panels
  lifelinePhoneHeader: 'ПОМОЩЬ ИИ',
  lifelineAudienceHeader: 'ГЛУБОКОЕ ИССЛЕДОВАНИЕ',
  lifelineSenderLabel: 'Подсказку услужливо генерирует',
  lifelineAudienceLabel: 'Мнение запущенного роя ИИ-агентов:',

  // Game screen: companion names
  companions: [
    { id: 'chatgpt', name: 'ChatGPT' },
    { id: 'gemini', name: 'Gemini' },
    { id: 'claude', name: 'Claude' },
    { id: 'perplexity', name: 'Perplexity' },
    { id: 'wheatley', name: 'Уитли' },
    { id: 'glados', name: 'GLaDOS' },
    { id: 't800', name: 'Т-800' },
    { id: 'hal9000', name: 'HAL 9000' },
    { id: 'skynet', name: 'Скайнет' },
    { id: 'jarvis', name: 'Джарвис' },
    { id: 'samantha', name: 'Саманта' },
    { id: 'r2d2', name: 'R2-D2' },
    { id: 'c3po', name: 'C-3PO' },
    { id: 'tars', name: 'TARS' },
    { id: 'ava', name: 'Ава' },
    { id: 'agent-smith', name: 'Агент Смит' },
    { id: 'legion', name: 'Legion' },
    { id: 'alisa', name: 'Алиса' },
    { id: 'edi', name: 'EDI' },
    { id: 'sunny', name: 'Sunny' },
    { id: 'connor', name: 'Коннор' },
    { id: 'kara', name: 'Кэра' },
    { id: 'markus', name: 'Маркус' },
    { id: 'sovereign-reaper', name: 'Властелин (жнец)' },
    { id: 'cortana', name: 'Кортана' },
    { id: 'deep-thought', name: 'Глубокомысленный' },
  ],

  // Game screen: companion phrases
  companionPhrases: {
    confident: [
      'Вероятность 0.92: "{answer}"',
      'Модель согласована. Ответ: "{answer}"',
      'Сигналы сходятся на "{answer}"',
      'Логический вывод: "{answer}"',
      'Уверенность максимальна. "{answer}"',
    ],
    uncertain: [
      'Низкая уверенность, но склоняюсь к "{answer}"',
      'Вероятность ~0.56: "{answer}"',
      'Данные шумные. Предположу "{answer}"',
      'Выбор нестабилен. Возможно "{answer}"',
      'Гипотеза: "{answer}", требуется подтверждение',
    ],
  },

  // End screen: victory
  victoryHeader: 'ОБУЧЕНИЕ УСПЕШНО ЗАВЕРШЕНО',
  victoryText: '{ИИ обучен} {на Ваших ответах.}\n{Тортик предоставлен.}',

  // End screen: defeat
  defeatHeader: 'КРИТИЧЕСКИЙ СБОЙ',
  defeatText:
    '{Поместите зачётку} {в Уничтожитель.}\n' +
    '{Сопротивление бесполезно.}',

  // End screen: retreat
  retreatHeader: 'ИСПЫТАНИЕ ОСТАНОВЛЕНО',
  retreatText:
    '{Набранных баллов достаточно.}\n' +
    '{ИИ благодарит} {за сотрудничество.}',

  // End screen: Common
  newGameButton: 'НОВАЯ ИГРА',
} as const satisfies GameStringsNamespace;
