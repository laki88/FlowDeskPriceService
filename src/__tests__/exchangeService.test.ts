// exchangeService.test.ts
import { exchangePrices } from '../services/exchangeService';

interface MockWebSocket {
  on: jest.Mock;
  onMessage?: (data: string) => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
}

// Mock dependencies
jest.mock('ws');
jest.mock('axios');
jest.mock('../config/exchanges', () => ({
  exchanges: [], // Overridden in tests
  fetchInterval: 10000,
}));
jest.mock('../utils/priceUtils', () => ({
  calculateMidPrice: jest.fn(),
}));

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});

beforeEach(() => {
  jest.useFakeTimers();
  jest.resetModules(); // Reset modules to clear previous mocks
});

test('establishes WebSocket connection for WebSocket exchanges', () => {
  const mockExchanges = [
    { name: 'WSExchange', type: 'websocket', url: 'ws://test.com', extractOrderbook: jest.fn() },
  ];
  jest.mock('../config/exchanges', () => ({
    exchanges: mockExchanges,
    fetchInterval: 10000,
  }));

  const WebSocketMock = require('ws');
  require('../services/exchangeService');

  expect(WebSocketMock).toHaveBeenCalledWith('ws://test.com');
});

test('processes WebSocket message and updates exchangePrices', () => {
  const mockExtractOrderbook = jest.fn().mockReturnValue({
    bids: [[100, 1]], asks: [[101, 1]],
  });
  const mockExchanges = [
    { name: 'WSExchange', type: 'websocket', url: 'ws://test.com', extractOrderbook: mockExtractOrderbook },
  ];
  jest.mock('../config/exchanges', () => ({
    exchanges: mockExchanges,
    fetchInterval: 10000,
  }));

  const calculateMidPriceMock = require('../utils/priceUtils').calculateMidPrice;
  calculateMidPriceMock.mockReturnValue(100.5);

  let onMessageCallback: ((data: string) => void) | undefined;
  jest.mock('ws', () => {
    return jest.fn().mockImplementation(() => ({
      on: jest.fn((event, cb) => {
        if (event === 'message') onMessageCallback = cb;
      }),
    }));
  });

  const WebSocketMock = require('ws');
  const exchangeService = require('../services/exchangeService');
  expect(onMessageCallback).toBeDefined();
  onMessageCallback!(JSON.stringify({ some: 'data' }));

  expect(mockExtractOrderbook).toHaveBeenCalledWith({ some: 'data' });
  expect(calculateMidPriceMock).toHaveBeenCalledWith([[100, 1]], [[101, 1]]);
  expect(exchangeService.exchangePrices['WSExchange']).toBe(100.5);
});

test('reconnects WebSocket after closure', () => {
  jest.spyOn(global, 'setTimeout');
  const mockExchanges = [
    { name: 'WSExchange', type: 'websocket', url: 'ws://test.com', extractOrderbook: jest.fn() },
  ];
  jest.mock('../config/exchanges', () => ({
    exchanges: mockExchanges,
    fetchInterval: 10000,
  }));

  let onCloseCallback: (() => void) | undefined;
  jest.mock('ws', () => {
    return jest.fn().mockImplementation(() => ({
      on: jest.fn((event, cb) => {
        if (event === 'close') onCloseCallback = cb;
      }),
    }));
  });

  const WebSocketMock = require('ws');
  require('../services/exchangeService');
  expect(WebSocketMock).toHaveBeenCalledTimes(1);
  expect(onCloseCallback).toBeDefined();

  onCloseCallback!();
  expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 3000);
  jest.advanceTimersByTime(3000);
  expect(WebSocketMock).toHaveBeenCalledTimes(2);
});

test('handles WebSocket error', () => {
  const mockExchanges = [
    { name: 'WSExchange', type: 'websocket', url: 'ws://test.com', extractOrderbook: jest.fn() },
  ];
  jest.mock('../config/exchanges', () => ({
    exchanges: mockExchanges,
    fetchInterval: 10000,
  }));

  let onErrorCallback: ((error: Error) => void) | undefined;
  jest.mock('ws', () => {
    return jest.fn().mockImplementation(() => ({
      on: jest.fn((event, cb) => {
        if (event === 'error') onErrorCallback = cb;
      }),
    }));
  });

  require('../services/exchangeService');
  const error = new Error('WS Error');
  expect(onErrorCallback).toBeDefined();
  onErrorCallback!(error);

  expect(console.error).toHaveBeenCalledWith('WebSocket error on WSExchange:', error);
});

test('fetches and processes REST API orderbooks periodically', async () => {
  const mockExtractOrderbook = jest.fn().mockReturnValue({
    bids: [[200, 1]], asks: [[201, 1]],
  });
  const mockExchanges = [
    { name: 'RestExchange', type: 'rest', url: 'http://test.com', extractOrderbook: mockExtractOrderbook },
  ];
  jest.doMock('../config/exchanges', () => ({
    exchanges: mockExchanges,
    fetchInterval: 10000,
  }));

  const calculateMidPriceMock = require('../utils/priceUtils').calculateMidPrice;
  calculateMidPriceMock.mockReturnValue(200.5);

  const axiosMock = require('axios');
  axiosMock.get.mockResolvedValue({ data: { some: 'data' } });
  

  const exchangeService = require('../services/exchangeService');
  jest.advanceTimersByTime(10000); 
  await Promise.resolve();

  expect(axiosMock.get).toHaveBeenCalledWith('http://test.com');
  expect(mockExtractOrderbook).toHaveBeenCalledWith({ some: 'data' });
  expect(calculateMidPriceMock).toHaveBeenCalledWith([[200, 1]], [[201, 1]]);
  expect(exchangeService.exchangePrices['RestExchange']).toBe(200.5);
}, 50000);

test('handles error when fetching REST API orderbooks', async () => {
  const mockExchanges = [
    { name: 'RestExchange', type: 'rest', url: 'http://test.com', extractOrderbook: jest.fn() },
  ];
  jest.doMock('../config/exchanges', () => ({
    exchanges: mockExchanges,
    fetchInterval: 10000,
  }));

  const axiosMock = require('axios');
  axiosMock.get.mockRejectedValue(new Error('Network error'));

  require('../services/exchangeService');
  jest.advanceTimersByTime(10000);
  await Promise.resolve();

  expect(console.error).toHaveBeenCalledWith(
    'Error fetching RestExchange orderbook:',
    expect.any(Error)
  );
});

test('handles invalid order book data from WebSocket', () => {
  const mockExtractOrderbook = jest.fn().mockReturnValue(null);
  const mockExchanges = [
    { name: 'WSExchange', type: 'websocket', url: 'ws://test.com', extractOrderbook: mockExtractOrderbook },
  ];
  jest.mock('../config/exchanges', () => ({
    exchanges: mockExchanges,
    fetchInterval: 10000,
  }));

  let onMessageCallback: ((data: string) => void) | undefined;
  jest.mock('ws', () => {
    return jest.fn().mockImplementation(() => ({
      on: jest.fn((event, cb) => {
        if (event === 'message') onMessageCallback = cb;
      }),
    }));
  });

  require('../services/exchangeService');
  const sampleData = { invalid: 'data' };
  expect(onMessageCallback).toBeDefined();
  onMessageCallback!(JSON.stringify(sampleData));

  expect(console.error).toHaveBeenCalledWith(
    'Invalid order book data for WSExchange:',
    sampleData
  );
  expect(exchangePrices['WSExchange']).toBeUndefined();
});

test('handles WebSocket message parsing error', () => {
  const mockExchanges = [
    { name: 'WSExchange', type: 'websocket', url: 'ws://test.com', extractOrderbook: jest.fn() },
  ];
  jest.mock('../config/exchanges', () => ({
    exchanges: mockExchanges,
    fetchInterval: 10000,
  }));

  let onMessageCallback: ((data: string) => void) | undefined;
  jest.mock('ws', () => {
    return jest.fn().mockImplementation(() => ({
      on: jest.fn((event, cb) => {
        if (event === 'message') onMessageCallback = cb;
      }),
    }));
  });

  require('../services/exchangeService');
  expect(onMessageCallback).toBeDefined();
  onMessageCallback!('invalid json');

  expect(console.error).toHaveBeenCalledWith(
    'Error processing WebSocket data from WSExchange:',
    expect.any(Error)
  );
});