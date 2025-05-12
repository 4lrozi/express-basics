// index.js
require('dotenv').config();
const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Hello world
app.get('/', (req, res) => {
  res.send('Hello, backend world!');
});

// Mount the users router on /api/users
const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);

// Error handling middleware (catch-all)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});

module.exports = app;