import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import database initialization
import { initializeDatabase } from './database.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import roleRoutes from './routes/roles.js';
import branchRoutes from './routes/branches.js';
import invoiceRoutes from './routes/invoices.js';
import marketRoutes from './routes/market.js';
import hrRoutes from './routes/hr.js';
import notificationRoutes from './routes/notifications.js';
import dashboardRoutes from './routes/dashboard.js';

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
export default async function handler(req, res) {
  // Initialize database on first request
  await initDB();
  
  // Handle the request using Express app
  return app(req, res);
} 