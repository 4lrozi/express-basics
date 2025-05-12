// tests/users.test.js
const request = require('supertest');
const app = require('../index');
const pool = require('../db');

// Run migrations and seeds before all tests
beforeAll(async () => {
    await pool.query('DROP TABLE IF EXISTS users');
  
    await pool.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  
    await pool.query(`
      INSERT INTO users (name, email)
      VALUES ('Alice','alice@example.com'),
             ('Bob','bob@example.com');
    `);
  });
  

// Close DB connections after all tests
afterAll(async () => {
  await pool.end();
});

describe('Users API', () => {
  it('GET /api/users should return initial users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Alice', email: 'alice@example.com' }),
        expect.objectContaining({ name: 'Bob',   email: 'bob@example.com' })
      ])
    );
  });

  let newUserId;
  it('POST /api/users should create a new user', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Carol', email: 'carol@example.com' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toMatchObject({ name: 'Carol', email: 'carol@example.com' });
    newUserId = res.body.id;
  });

  it('PUT /api/users/:id should update that user', async () => {
    const res = await request(app)
      .put(`/api/users/${newUserId}`)
      .send({ name: 'Carolyn' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ id: newUserId, name: 'Carolyn' });
  });

  it('DELETE /api/users/:id should delete that user', async () => {
    const res = await request(app)
      .delete(`/api/users/${newUserId}`);
    expect(res.statusCode).toBe(204);
  });

  it('GET /api/users no longer includes deleted user', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(200);
    expect(res.body.find(u => u.id === newUserId)).toBeUndefined();
  });
});
