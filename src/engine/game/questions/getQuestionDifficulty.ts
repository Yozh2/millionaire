export const getQuestionDifficulty = (
  questionIndex: number,
  totalQuestions: number
): number => {
  if (totalQuestions <= 0) return 1;

  const fraction = questionIndex / totalQuestions;

  if (fraction < 1 / 3) return 1;
  if (fraction < 2 / 3) return 2;
  return 3;
};

