import type { QuestionPool } from '../../../../engine/types';

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

