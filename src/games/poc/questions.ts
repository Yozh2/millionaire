/**
 * PoC Game Questions
 *
 * Sample questions in Russian for testing the engine.
 * Organized by campaign with easy/medium/hard pools.
 */

import { QuestionPool } from '../../engine/types';

/**
 * Questions for "Easy" campaign - general knowledge
 */
export const easyQuestionPool: QuestionPool = {
  easy: [
    {
      question: 'Сколько будет 2 + 2?',
      answers: ['3', '4', '5', '6'],
      correct: 1,
    },
    {
      question: 'Какого цвета небо?',
      answers: ['Красное', 'Зелёное', 'Голубое', 'Жёлтое'],
      correct: 2,
    },
  ],
  medium: [
    {
      question: 'Что такое H2O?',
      answers: ['Соль', 'Сахар', 'Вода', 'Масло'],
      correct: 2,
    },
  ],
  hard: [
    {
      question: 'Кто написал "Мону Лизу"?',
      answers: ['Микеланджело', 'Да Винчи', 'Рафаэль', 'Донателло'],
      correct: 1,
    },
  ],
};

/**
 * Questions for "Hard" campaign - science and expert knowledge
 */
export const hardQuestionPool: QuestionPool = {
  easy: [
    {
      question: 'Чему равен квадратный корень из 144?',
      answers: ['10', '11', '12', '13'],
      correct: 2,
    },
    {
      question: 'Какой химический символ у натрия?',
      answers: ['S', 'So', 'Na', 'Sd'],
      correct: 2,
    },
    {
      question: 'Кто открыл закон всемирного тяготения?',
      answers: ['Эйнштейн', 'Ньютон', 'Галилей', 'Дарвин'],
      correct: 1,
    },
    {
      question: 'Какая река самая длинная?',
      answers: ['Амазонка', 'Нил', 'Янцзы', 'Миссисипи'],
      correct: 1,
    },
    {
      question: 'Сколько костей в теле человека?',
      answers: ['186', '196', '206', '216'],
      correct: 2,
    },
  ],
  medium: [
    {
      question: 'Чему равно число Авогадро?',
      answers: ['6,02×10²³', '3,14×10²³', '9,81×10²³', '2,99×10²³'],
      correct: 0,
    },
    {
      question: 'Кто написал роман "1984"?',
      answers: ['Хаксли', 'Оруэлл', 'Брэдбери', 'Азимов'],
      correct: 1,
    },
    {
      question: 'Какое самое твёрдое природное вещество?',
      answers: ['Титан', 'Алмаз', 'Графен', 'Вольфрам'],
      correct: 1,
    },
    {
      question: 'У какой планеты больше всего спутников?',
      answers: ['Юпитер', 'Сатурн', 'Уран', 'Нептун'],
      correct: 1,
    },
    {
      question: 'Каков период полураспада углерода-14?',
      answers: ['5,730 лет', '1,000 лет', '10,000 лет', '100 лет'],
      correct: 0,
    },
  ],
  hard: [
    {
      question: 'Чему равна постоянная Планка?',
      answers: ['6,626×10⁻³⁴', '3,14×10⁻³⁴', '9,109×10⁻³⁴', '1,602×10⁻³⁴'],
      correct: 0,
    },
    {
      question: 'Кто доказал Великую теорему Ферма?',
      answers: ['Эйлер', 'Гаусс', 'Уайлс', 'Риман'],
      correct: 2,
    },
    {
      question: 'Каков предел Чандрасекара?',
      answers: ['1,4 M☉', '2,0 M☉', '3,0 M☉', '0,5 M☉'],
      correct: 0,
    },
    {
      question: 'Какой фермент расплетает ДНК?',
      answers: ['Лигаза', 'Полимераза', 'Геликаза', 'Праймаза'],
      correct: 2,
    },
    {
      question: 'Что вызывает эффект Мпембы?',
      answers: ['Испарение', 'Конвекция', 'Неизвестно', 'Переохлаждение'],
      correct: 2,
    },
  ],
};
