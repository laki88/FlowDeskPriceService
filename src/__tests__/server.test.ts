import request from 'supertest';
import { app } from '../server';

describe('Express Server', () => {
  it("should respond with 'Hello, TypeScript with Express!' on GET /", async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello, TypeScript with Express!');
  });

  it('should return 404 for an unknown route', async () => {
    const response = await request(app).get('/unknown-route');
    expect(response.status).toBe(404);
  });

  describe('/global-price-index route', () => {
    it('should handle requests to /global-price-index', async () => {
      const response = await request(app).get('/global-price-index');
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });
  });
});
