// services/exchange.test.ts
import { exchanges, fetchInterval, Exchange, Orderbook } from '../config/exchanges';

describe('Exchange Configuration', () => {
  describe('Binance', () => {
    const binance = exchanges.find(e => e.name === 'Binance')!;

    test('has correct configuration', () => {
      expect(binance).toEqual({
        name: 'Binance',
        type: 'websocket',
        url: 'wss://stream.binance.com:9443/ws/btcusdt@depth',
        extractOrderbook: expect.any(Function)
      });
    });

    describe('extractOrderbook', () => {
      it('correctly extracts bids and asks', () => {
        const testData = {
          b: [['100', '1'], ['99', '2']],
          a: [['101', '1'], ['102', '3']]
        };
        const expected: Orderbook = {
          bids: testData.b,
          asks: testData.a
        };
        expect(binance.extractOrderbook(testData)).toEqual(expected);
      });
    });
  });

  describe('Kraken', () => {
    const kraken = exchanges.find(e => e.name === 'Kraken')!;

    test('has correct configuration', () => {
      expect(kraken).toEqual({
        name: 'Kraken',
        type: 'rest',
        url: 'https://api.kraken.com/0/public/Depth?pair=XBTUSDT',
        extractOrderbook: expect.any(Function)
      });
    });

    describe('extractOrderbook', () => {
      it('correctly extracts bids and asks when XBTUSDT exists', () => {
        const testData = {
          result: {
            XBTUSDT: {
              bids: [['300', '1', 123]],
              asks: [['301', '2', 456]]
            }
          }
        };
        const expected: Orderbook = {
          bids: testData.result.XBTUSDT.bids,
          asks: testData.result.XBTUSDT.asks
        };
        expect(kraken.extractOrderbook(testData)).toEqual(expected);
      });

      it('returns null when XBTUSDT is missing', () => {
        const testData = { result: {} };
        expect(kraken.extractOrderbook(testData)).toBeNull();
      });

      it('returns null for invalid data structure', () => {
        expect(kraken.extractOrderbook(null)).toBeNull();
        expect(kraken.extractOrderbook(undefined)).toBeNull();
        expect(kraken.extractOrderbook({})).toBeNull();
      });
    });
  });

  describe('Huobi', () => {
    const huobi = exchanges.find(e => e.name === 'Huobi')!;

    test('has correct configuration', () => {
      expect(huobi).toEqual({
        name: 'Huobi',
        type: 'rest',
        url: 'https://api.huobi.pro/market/depth?symbol=btcusdt&type=step0',
        extractOrderbook: expect.any(Function)
      });
    });

    describe('extractOrderbook', () => {
      it('correctly extracts bids and asks when tick exists', () => {
        const testData = {
          tick: {
            bids: [['400', '1']],
            asks: [['401', '2']]
          }
        };
        const expected: Orderbook = {
          bids: testData.tick.bids,
          asks: testData.tick.asks
        };
        expect(huobi.extractOrderbook(testData)).toEqual(expected);
      });

      it('returns null when tick is missing', () => {
        const testData = {};
        expect(huobi.extractOrderbook(testData)).toBeNull();
      });

      it('returns null for invalid data structure', () => {
        expect(huobi.extractOrderbook(null)).toBeNull();
        expect(huobi.extractOrderbook(undefined)).toBeNull();
        expect(huobi.extractOrderbook({ invalid: 'data' })).toBeNull();
      });
    });
  });

  test('fetchInterval is configured correctly', () => {
    expect(fetchInterval).toBe(5000);
  });
});