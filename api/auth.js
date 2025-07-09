const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./database.js');
const authRoutes = require('./routes/auth.js');

const app = express();

// Configure CORS for production
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (origin && (
      origin.includes('.vercel.app') || 
      origin.includes('localhost') ||
      origin === process.env.FRONTEND_URL
    )) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize database on first request
let dbInitialized = false;
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      console.log('🔄 Initializing database...');
      await initializeDatabase();
      dbInitialized = true;
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
      return res.status(500).json({ 
        error: 'Database initialization failed',
        message: error.message 
      });
    }
  }
  next();
});

// Auth routes
app.use('/', authRoutes);

module.exports = app; 