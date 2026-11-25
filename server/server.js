const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Ensure DB connection on serverless cold starts
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/waste', require('./routes/waste'));
app.use('/api/feedback', require('./routes/feedback'));

// Root endpoint test
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Smart Canteen API is running',
    version: '1.0.0',
    endpoints: [
      '/api/auth',
      '/api/menu',
      '/api/orders',
      '/api/inventory',
      '/api/waste',
      '/api/feedback'
    ]
  });
});

// Error handling fallback
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[Server] Smart Canteen backend listening on http://localhost:${PORT}`);
  });
}

module.exports = app;

