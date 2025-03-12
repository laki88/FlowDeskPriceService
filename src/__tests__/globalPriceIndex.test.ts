// globalPriceIndex.test.ts
import request from 'supertest';
import express from 'express';
import { exchangePrices } from '../services/exchangeService';
const globalPriceIndexRouter = require("../routes/globalPriceIndex");

// Mock the exchangeService module
jest.mock('../services/exchangeService', () => ({
  exchangePrices: {},
}));

// Cast to any to allow dynamic assignment of properties in tests
const mockExchangePrices = exchangePrices as Record<string, number | null>;

describe('GET /global-price-index', () => {
  let app: express.Application;

  beforeEach(() => {
    // Clear all properties from mockExchangePrices before each test
    Object.keys(mockExchangePrices).forEach((key) => {
      delete mockExchangePrices[key];
    });
    // Setup Express app with the router
    app = express();
    app.use(globalPriceIndexRouter);
  });

  it('should calculate the global price index correctly with valid prices', async () => {
    // Assign valid prices
    mockExchangePrices['exchange1'] = 10;
    mockExchangePrices['exchange2'] = 20;

    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ globalPriceIndex: 15 });
  });

  it('should exclude null prices from the calculation', async () => {
    // Assign a mix of valid and null prices
    mockExchangePrices['exchange1'] = 10;
    mockExchangePrices['exchange2'] = null;

    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ globalPriceIndex: 10 });
  });

  it('should return null for the global price index when all prices are null', async () => {
    // Assign all null prices
    mockExchangePrices['exchange1'] = null;
    mockExchangePrices['exchange2'] = null;

    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    // NaN is converted to null in JSON
    expect(response.body).toEqual({ globalPriceIndex: null });
  });
});
