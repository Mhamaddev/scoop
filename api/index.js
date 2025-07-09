const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./database.js');

// Import all route handlers
const authRoutes = require('./routes/auth.js');
const branchRoutes = require('./routes/branches.js');
const dashboardRoutes = require('./routes/dashboard.js');
const userRoutes = require('./routes/users.js');
const roleRoutes = require('./routes/roles.js');
const invoiceRoutes = require('./routes/invoices.js');
const marketRoutes = require('./routes/market.js');
const hrRoutes = require('./routes/hr.js');
const notificationRoutes = require('./routes/notifications.js');

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

// Mount all routes with their respective prefixes
app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Default handler for any other /api routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

module.exports = app; 