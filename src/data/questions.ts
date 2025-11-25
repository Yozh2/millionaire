import { Question } from '../types';

/**
 * Quiz questions about Baldur's Gate 3 and Forgotten Realms lore.
 * Questions are sorted by difficulty during gameplay.
 *
 * Difficulty scale:
 * 1 - Easy (common knowledge for BG3 players)
 * 2-3 - Medium (requires some gameplay experience)
 * 4-5 - Hard (deep lore knowledge required)
 */
export const questions: Question[] = [
  {
    question:
      'Какая раса известна своей связью с Астральным Планом и способностью к псионике?',
    answers: ['Люди', 'Гитьянки', 'Дроу', 'Полуэльфы'],
    correct: 1,
    difficulty: 1,
  },
  {
    question:
      'Как зовут вампира-спутника, который может присоединиться к вашей группе?',
    answers: ['Гейл', 'Астарион', 'Уилл', 'Халсин'],
    correct: 1,
    difficulty: 1,
  },
  {
    question:
      'Какая богиня является покровительницей магии в Забытых Королевствах?',
    answers: ['Селунэ', 'Шар', 'Мистра', 'Сьюн'],
    correct: 2,
    difficulty: 2,
  },
  {
    question: 'Кто является лидером культа Абсолюта в начале игры?',
    answers: ['Кетерик Торм', 'Орин Красная', 'Энвер Гортэш', 'Все трое'],
    correct: 3,
    difficulty: 2,
  },
  {
    question: 'Какое существо паразитирует в голове главного героя?',
    answers: [
      'Интеллект пожиратель',
      'Личинка свежевателя разума',
      'Иллитид',
      'Церебральный паразит',
    ],
    correct: 1,
    difficulty: 3,
  },
  {
    question:
      'Как называется город, где происходит большая часть событий третьего акта?',
    answers: ['Невервинтер', 'Врата Балдура', 'Уотердип', 'Атката'],
    correct: 1,
    difficulty: 3,
  },
  {
    question:
      'Какой металл используется для создания оружия против свежевателей разума?',
    answers: ['Адамантин', 'Митрил', 'Серебро', 'Холодное железо'],
    correct: 0,
    difficulty: 1,
  },
  {
    question: 'Кто является богиней тьмы и потери, сестрой Селунэ?',
    answers: ['Ллос', 'Тиамат', 'Шар', 'Талона'],
    correct: 2,
    difficulty: 4,
  },
  {
    question: 'Как называется способность, позволяющая видеть в темноте?',
    answers: [
      'Ночное видение',
      'Тёмное зрение',
      'Сумеречное зрение',
      'Теневое зрение',
    ],
    correct: 1,
    difficulty: 2,
  },
  {
    question: 'Какой артефакт необходим для уничтожения Абсолюта?',
    answers: [
      'Нетерильские камни',
      'Корона Карсуса',
      'Око Бхаала',
      'Сфера Аннигиляции',
    ],
    correct: 0,
    difficulty: 4,
  },
  {
    question:
      'Как называется древняя магическая империя, создавшая Корону Карсуса?',
    answers: ['Калимшан', 'Нетерил', 'Миф Драннор', 'Кормир'],
    correct: 1,
    difficulty: 3,
  },
  {
    question: 'Какое проклятие несёт Шэдоухарт в начале игры?',
    answers: ['Вампиризм', 'Проклятие оборотня', 'Рана Шар', 'Метка дьявола'],
    correct: 2,
    difficulty: 5,
  },
  {
    question: 'Кто из этих персонажей НЕ может стать романтическим партнёром?',
    answers: ['Карлах', 'Минтара', 'Джахейра', 'Минск'],
    correct: 3,
    difficulty: 2,
  },
  {
    question:
      'Как называется демоническая сущность, с которой заключил пакт Уилл?',
    answers: ['Мефистофель', 'Зариэль', 'Мизора', 'Аскодей'],
    correct: 2,
    difficulty: 4,
  },
  {
    question: 'Какой титул носит герцог Равенгард в Вратах Балдура?',
    answers: ['Великий герцог', 'Верховный маршал', 'Лорд-командующий', 'Регент'],
    correct: 0,
    difficulty: 5,
  },
];

/**
 * Prize ladder in gold pieces.
 * 15 levels from 500 to 3,000,000.
 */
export const prizes: string[] = [
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
];

/**
 * Indices of guaranteed prize levels (safety nets).
 * If player loses after reaching these, they keep this prize.
 * Levels: 5 (5,000), 10 (100,000), 15 (3,000,000)
 */
export const guaranteedPrizes: number[] = [4, 9, 14];

/**
 * Companion names for "Phone a Friend" lifeline.
 * These are party members from BG3.
 */
export const companionNames: string[] = [
  'Астарион',
  'Гейл',
  'Шэдоухарт',
  'Лаэзель',
  'Халсин',
];
