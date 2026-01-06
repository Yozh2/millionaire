import { shuffleArray } from '@engine/game/utils/shuffleArray';

export interface FiftyFiftyInput {
  correctOriginalIndex: number;
  shuffledAnswers: readonly number[];
  rng?: () => number;
}

export const getFiftyFiftyEliminations = ({
  correctOriginalIndex,
  shuffledAnswers,
  rng,
}: FiftyFiftyInput): number[] => {
  const wrongDisplayIndices = [0, 1, 2, 3]
    .filter((displayIdx) => shuffledAnswers[displayIdx] !== correctOriginalIndex);

  return shuffleArray(wrongDisplayIndices, rng).slice(0, 2);
};

