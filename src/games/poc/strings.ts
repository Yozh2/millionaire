import type { GameStringsNamespace } from '@engine/types';

export const strings = {
  // Common layout
  headerTitle: 'КТО ХОЧЕТ СТАТЬ МИЛЛИОНЕРОМ',
  headerSubtitle: 'ТЕСТ ДВИЖКА',
  footer: '★ Тестовый движок викторины ★',

  // Audio controls
  musicOn: 'Выкл. музыку',
  musicOff: 'Вкл. музыку',

  // Campaign selection screen
  introText: 'Проверь свои знания! Ответь на вопросы, чтобы выиграть главный приз.',
  selectPath: 'ВЫБЕРИТЕ СЛОЖНОСТЬ',
  startButton: 'НАЧАТЬ ИГРУ',

  // Campaign cards
  campaigns: {
    easy: { name: 'ЛЕГКО', label: 'Новичок', iconAriaLabel: 'Easy' },
    hard: { name: 'СЛОЖНО', label: 'Эксперт', iconAriaLabel: 'Hard' },
  },

  // Game screen: main panels
  questionHeader: '#{n}',
  prizesHeader: 'ПРИЗЫ',

  // Game screen: lifelines and actions
  lifelines: {
    fifty: '50:50',
    phone: 'Звонок',
    audience: 'Зал',
    host: 'Ведущий',
    switch: 'Замена',
    double: 'Ошибиться',
  },
  retreat: 'Забрать',

  // Game screen: lifeline panels
  lifelinePhoneHeader: 'СОВЕТ ДРУГА',
  lifelineAudienceHeader: 'ОПРОС ЗАЛА',
  lifelineSenderLabel: 'От:',
  lifelineAudienceLabel: 'Зал считает:',

  // Game screen: companions names
  companions: [
    { id: 'alexey', name: 'Алексей' },
    { id: 'maria', name: 'Мария' },
    { id: 'sergey', name: 'Сергей' },
  ],

  // Game screen: companion phrases
  companionPhrases: {
    confident: ['Я уверен, что это "{answer}"', 'Точно "{answer}"'],
    uncertain: ['Может быть "{answer}"?', 'Думаю, это "{answer}"'],
  },

  // End screen: Common
  newGameButton: 'ИГРАТЬ СНОВА',
  currency: '$',

  // End screen: victory
  victoryTitle: '🎉 ПОБЕДА!',
  victoryText: 'Поздравляем! Вы выиграли главный приз!',
  victoryHeader: 'ПОБЕДА',

  // End screen: defeat
  defeatTitle: '❌ ИГРА ОКОНЧЕНА',
  defeatText: 'Неправильный ответ!',
  defeatHeader: 'ПОРАЖЕНИЕ',
  correctAnswerLabel: 'Правильный ответ:',

  // End screen: retreat
  retreatTitle: '💰 ДЕНЬГИ ЗАБРАНЫ',
  retreatText: 'Умный выбор!',
  retreatHeader: 'ПРИЗ ПОЛУЧЕН',
} as const satisfies GameStringsNamespace;
