const express = require('express');
const cors = require('cors');
const path = require('path');

// Import database initialization
const { initializeDatabase } = require('./database.js');

// Import routes
const authRoutes = require('./routes/auth.js');
const userRoutes = require('./routes/users.js');
const roleRoutes = require('./routes/roles.js');
const branchRoutes = require('./routes/branches.js');
const invoiceRoutes = require('./routes/invoices.js');
const marketRoutes = require('./routes/market.js');
const hrRoutes = require('./routes/hr.js');
const notificationRoutes = require('./routes/notifications.js');
const dashboardRoutes = require('./routes/dashboard.js');

const app = express();

// Configure CORS for production
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow Vercel domains
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

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

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

// API Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/roles', roleRoutes);
app.use('/branches', branchRoutes);
app.use('/invoices', invoiceRoutes);
app.use('/market', marketRoutes);
app.use('/hr', hrRoutes);
app.use('/notifications', notificationRoutes);
app.use('/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'AccountingPro API is running on Vercel',
    environment: process.env.NODE_ENV || 'production'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

module.exports = app; 