export interface SwitchQuestionInput {
  currentQuestionIndex: number;
  totalQuestions: number;
  rng?: () => number;
}

export const pickSwitchQuestionIndex = ({
  currentQuestionIndex,
  totalQuestions,
  rng = Math.random,
}: SwitchQuestionInput): number | null => {
  const start = currentQuestionIndex + 1;
  if (start >= totalQuestions) return null;

  const count = totalQuestions - start;
  return start + Math.floor(rng() * count);
};

