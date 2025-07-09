const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./database.js');
const userRoutes = require('./routes/users.js');

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (origin && (origin.includes('.vercel.app') || origin.includes('localhost') || origin === process.env.FRONTEND_URL)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

let dbInitialized = false;
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      await initializeDatabase();
      dbInitialized = true;
    } catch (error) {
      return res.status(500).json({ error: 'Database initialization failed', message: error.message });
    }
  }
  next();
});

app.use('/', userRoutes);
module.exports = app; 