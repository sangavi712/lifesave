import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import donorRoutes from './routes/donorRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { securityHeaders } from './middleware/securityMiddleware.js';
import pool from './config/db.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Security Headers
app.use(securityHeaders);

// Enable CORS
app.use(cors({
  origin: '*', // For development. For production, specify your frontend domain.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse incoming JSON with payload size limit
app.use(express.json({ limit: '10mb' }));

// API Landing Page / Documentation
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Blood Bank Management System REST API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (Protected)'
      },
      donors: {
        list: 'GET /api/donors (Protected, Query: blood_group, city, search, page, limit)',
        create: 'POST /api/donors (Protected)',
        get: 'GET /api/donors/:id (Protected)',
        update: 'PUT /api/donors/:id (Protected)',
        delete: 'DELETE /api/donors/:id (Protected)'
      },
      requests: {
        list: 'GET /api/requests (Protected, Query: blood_group, status, page, limit)',
        create: 'POST /api/requests (Protected)',
        updateStatus: 'PUT /api/requests/:id/status (Admin Only)',
        delete: 'DELETE /api/requests/:id (Protected)'
      },
      inventory: {
        list: 'GET /api/inventory (Protected)',
        update: 'PUT /api/inventory (Admin Only)'
      },
      dashboard: {
        stats: 'GET /api/dashboard/stats (Protected)'
      }
    }
  });
});

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Fallback Middlewares
app.use(notFound);
app.use(errorHandler);

// Start Server & Test database connection pool
const startServer = async () => {
  try {
    // Attempt database query test
    await pool.query('SELECT NOW()');
    console.log('PostgreSQL database query verified successfully.');
    
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (err) {
    console.error('Database connection test failed. Server cannot start.', err.message);
    process.exit(1);
  }
};

startServer();
