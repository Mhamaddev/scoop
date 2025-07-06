const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

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

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize database once
let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
};

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
    message: 'AccountingPro API is running on Vercel'
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

// Vercel serverless function handler
module.exports = async function handler(req, res) {
  // Initialize database on first request
  await initDB();
  
  // Handle the request using Express app
  return app(req, res);
}; 