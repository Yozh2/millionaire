import type { PrizeLadder } from '../../types';

export const getGuaranteedPrize = (
  currentQuestion: number,
  ladder: PrizeLadder
): string => {
  const passedGuaranteed = ladder.guaranteed.filter((idx) => idx < currentQuestion);

  if (passedGuaranteed.length === 0) {
    return '0';
  }

  const highestGuaranteedIdx = Math.max(...passedGuaranteed);
  return ladder.values[highestGuaranteedIdx];
};

