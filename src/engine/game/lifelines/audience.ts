export interface AudienceInput {
  correctDisplayIndex: number;
  eliminatedDisplayIndices?: readonly number[];
  rng?: () => number;
}

export const generateAudiencePercentages = ({
  correctDisplayIndex,
  eliminatedDisplayIndices = [],
  rng = Math.random,
}: AudienceInput): number[] => {
  const percentages = [0, 0, 0, 0];

  const correctPercent = 40 + Math.floor(rng() * 35);
  percentages[correctDisplayIndex] = correctPercent;

  let remaining = 100 - correctPercent;
  const otherDisplayIndices = [0, 1, 2, 3].filter(
    (i) => i !== correctDisplayIndex && !eliminatedDisplayIndices.includes(i)
  );

  otherDisplayIndices.forEach((i, idx, arr) => {
    if (idx === arr.length - 1) {
      percentages[i] = remaining;
    } else {
      const val = Math.floor(rng() * remaining * 0.6);
      percentages[i] = val;
      remaining -= val;
    }
  });

  return percentages;
};

