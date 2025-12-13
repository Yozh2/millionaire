import type { PrizeLadder, PrizesConfig } from '../../types';

const CLASSIC_MULTIPLIERS_15 = [
  0.0001, // 100 / 1M
  0.0002, // 200
  0.0003, // 300
  0.0005, // 500
  0.001, // 1,000
  0.002, // 2,000
  0.004, // 4,000
  0.008, // 8,000
  0.016, // 16,000
  0.032, // 32,000
  0.064, // 64,000
  0.125, // 125,000
  0.25, // 250,000
  0.5, // 500,000
  1.0, // 1,000,000
];

const roundToNiceNumber = (value: number): number => {
  if (value <= 0) return 0;

  const niceNumbers = [
    100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1500, 2000, 2500,
    3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 12000, 15000, 16000,
    20000, 25000, 30000, 32000, 40000, 50000, 60000, 64000, 75000, 80000,
    100000, 125000, 150000, 200000, 250000, 300000, 400000, 500000, 600000,
    750000, 800000, 1000000, 1500000, 2000000, 2500000, 3000000, 4000000,
    5000000, 10000000, 15000000, 20000000, 25000000, 50000000, 100000000,
  ];

  let closest = niceNumbers[0];
  let minDiff = Math.abs(value - closest);

  for (const nice of niceNumbers) {
    const diff = Math.abs(value - nice);
    if (diff < minDiff) {
      minDiff = diff;
      closest = nice;
    }
  }

  return closest;
};

const formatPrize = (value: number): string =>
  value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const interpolateMultipliers = (questionCount: number): number[] => {
  if (questionCount <= 0) return [];
  if (questionCount === 15) return [...CLASSIC_MULTIPLIERS_15];

  const multipliers: number[] = [];

  for (let i = 0; i < questionCount; i++) {
    const classicPosition = (i / (questionCount - 1)) * 14;
    const lowerIdx = Math.floor(classicPosition);
    const upperIdx = Math.min(lowerIdx + 1, 14);
    const fraction = classicPosition - lowerIdx;

    const lowerMult = CLASSIC_MULTIPLIERS_15[lowerIdx];
    const upperMult = CLASSIC_MULTIPLIERS_15[upperIdx];

    const multiplier = lowerMult * Math.pow(upperMult / lowerMult, fraction);
    multipliers.push(multiplier);
  }

  return multipliers;
};

export const calculatePrizeLadder = (
  questionCount: number,
  config: PrizesConfig
): PrizeLadder => {
  if (questionCount <= 0) {
    return { values: [], guaranteed: [] };
  }

  const { maxPrize, guaranteedFractions } = config;

  const multipliers = interpolateMultipliers(questionCount);
  const values: string[] = [];

  let previousValue = 0;

  for (let i = 0; i < questionCount; i++) {
    const rawValue = maxPrize * multipliers[i];
    let roundedValue = roundToNiceNumber(rawValue);

    if (roundedValue <= previousValue) {
      roundedValue =
        previousValue +
        (previousValue < 1000
          ? 100
          : previousValue < 10000
            ? 500
            : previousValue < 100000
              ? 1000
              : 10000);
      roundedValue = roundToNiceNumber(roundedValue);
    }

    const finalValue = i === questionCount - 1 ? maxPrize : roundedValue;
    values.push(formatPrize(finalValue));
    previousValue = finalValue;
  }

  const guaranteed: number[] = [];
  for (const fraction of guaranteedFractions) {
    const index = Math.round(fraction * questionCount) - 1;
    if (index >= 0 && index < questionCount && !guaranteed.includes(index)) {
      guaranteed.push(index);
    }
  }

  guaranteed.sort((a, b) => a - b);

  return { values, guaranteed };
};

