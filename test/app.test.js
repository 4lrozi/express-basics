// tests/app.test.js
const request = require('supertest');

// Import your Express app (you may need to export it from index.js)
const app = require('../index');  

describe('GET /health', () => {
  it('should respond with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
  });
});
