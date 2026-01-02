import { calculatePrizeLadder } from './calculatePrizeLadder';
import { getGuaranteedPrize } from './getGuaranteedPrize';

describe('prizes', () => {
  describe('calculatePrizeLadder', () => {
    it('returns empty ladder for non-positive question count', () => {
      expect(
        calculatePrizeLadder(0, { maxPrize: 1000, currency: '$', guaranteedFractions: [] })
      ).toEqual({ values: [], guaranteed: [] });
    });

    it('is strictly increasing and ends at maxPrize', () => {
      const maxPrize = 1_000_000;
      const ladder = calculatePrizeLadder(15, {
        maxPrize,
        currency: '$',
        guaranteedFractions: [1 / 3, 2 / 3, 1],
      });

      expect(ladder.values.length).toBe(15);
      expect(ladder.values[14]).toBe('1 000 000');

      const nums = ladder.values.map((v) => Number(v.replace(/\s/g, '')));
      for (let i = 1; i < nums.length; i += 1) {
        expect(nums[i]).toBeGreaterThan(nums[i - 1]);
      }
    });

    it('deduplicates and sorts guaranteed indices', () => {
      const ladder = calculatePrizeLadder(15, {
        maxPrize: 1_000_000,
        currency: '$',
        guaranteedFractions: [1 / 3, 1 / 3, 2 / 3, 1],
      });

      expect(ladder.guaranteed).toEqual([4, 9, 14]);
    });
  });

  describe('getGuaranteedPrize', () => {
    it('returns 0 before first guaranteed', () => {
      const ladder = { values: ['100', '200', '300'], guaranteed: [1] };
      expect(getGuaranteedPrize(0, ladder)).toBe('0');
      expect(getGuaranteedPrize(1, ladder)).toBe('0');
    });

    it('returns the highest passed guaranteed prize', () => {
      const ladder = { values: ['100', '200', '300', '400'], guaranteed: [1, 3] };
      expect(getGuaranteedPrize(2, ladder)).toBe('200');
      expect(getGuaranteedPrize(4, ladder)).toBe('400');
    });
  });
});

