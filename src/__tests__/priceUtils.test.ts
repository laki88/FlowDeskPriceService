// services/priceUtils.test.ts
import { calculateMidPrice } from '../utils/priceUtils';

describe('calculateMidPrice', () => {
  describe('invalid inputs', () => {
    it('returns null when bids is not an array', () => {
      expect(calculateMidPrice('not an array' as any, [[1]])).toBeNull();
    });

    it('returns null when asks is not an array', () => {
      expect(calculateMidPrice([[1]], 'not an array' as any)).toBeNull();
    });

    it('returns null when bids is empty', () => {
      expect(calculateMidPrice([], [[1]])).toBeNull();
    });

    it('returns null when asks is empty', () => {
      expect(calculateMidPrice([[1]], [])).toBeNull();
    });
  });

  describe('invalid bid/ask prices', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('returns null and logs error if bestBid is NaN', () => {
      const bids = [['invalid']];
      const asks = [['100']];
      const result = calculateMidPrice(bids, asks);
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid bid or ask price:',
        { bestBid: NaN, bestAsk: 100 }
      );
    });

    it('returns null and logs error if bestAsk is NaN', () => {
      const bids = [['200']];
      const asks = [['invalid']];
      const result = calculateMidPrice(bids, asks);
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid bid or ask price:',
        { bestBid: 200, bestAsk: NaN }
      );
    });
  });

  describe('valid inputs', () => {
    it('calculates mid price correctly with integer values', () => {
      const bids = [['200', '1']];
      const asks = [['300', '1']];
      expect(calculateMidPrice(bids, asks)).toBe(250);
    });

    it('calculates mid price correctly with float values', () => {
      const bids = [['150.5', '2']];
      const asks = [['200.75', '3']];
      expect(calculateMidPrice(bids, asks)).toBe(175.625);
    });

    it('uses the first elements of bids and asks', () => {
      const bids = [['100', '1'], ['200', '2']];
      const asks = [['300', '1'], ['400', '2']];
      expect(calculateMidPrice(bids, asks)).toBe(200); // (100 + 300) / 2
    });

    it('handles zero bid and ask prices', () => {
      const bids = [['0']];
      const asks = [['0']];
      expect(calculateMidPrice(bids, asks)).toBe(0);
    });
  });
});