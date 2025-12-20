import type { Companion, GameStrings } from '@engine/types';

export const pocTitle = 'КТО ХОЧЕТ СТАТЬ МИЛЛИОНЕРОМ';
export const pocSubtitle = 'ТЕСТ ДВИЖКА';

export const pocCampaignStrings = {
  easy: { name: 'ЛЕГКО', label: 'Новичок', iconAriaLabel: 'Easy' },
  hard: { name: 'СЛОЖНО', label: 'Эксперт', iconAriaLabel: 'Hard' },
} as const;

export const pocCompanions: Companion[] = [
  { id: 'alexey', name: 'Алексей' },
  { id: 'maria', name: 'Мария' },
  { id: 'sergey', name: 'Сергей' },
];

export const pocStrings: GameStrings = {
  introText: 'Проверь свои знания! Ответь на вопросы, чтобы выиграть главный приз.',
  selectPath: 'ВЫБЕРИТЕ СЛОЖНОСТЬ',
  startButton: 'НАЧАТЬ ИГРУ',

  questionHeader: '#{n}',

  prizesHeader: 'ПРИЗЫ',

  lifelinePhoneHeader: 'СОВЕТ ДРУГА',
  lifelineAudienceHeader: 'ОПРОС ЗАЛА',
  lifelineSenderLabel: 'От:',
  lifelineAudienceLabel: 'Зал считает:',

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
};

export const pocLifelineNames = {
  fifty: '50:50',
  phone: 'Звонок',
  audience: 'Зал',
  host: 'Ведущий',
  switch: 'Замена',
  double: 'Ошибиться',
} as const;

export const pocActionNames = {
  takeMoney: 'Забрать',
} as const;

export const pocCurrency = '$';
