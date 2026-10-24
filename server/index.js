import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectToDatabase, getDbStatus, isDbConnected } from './db.js';
import authRoutes from './routes/auth.routes.js';
import studentsRoutes from './routes/students.routes.js';
import classesRoutes from './routes/classes.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import assessmentsRoutes from './routes/assessments.routes.js';
import interventionsRoutes from './routes/interventions.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import healthRoutes from './routes/health.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Public health route (always responds regardless of DB connection state)
app.use('/api/health', healthRoutes);

// Non-blocking DB status check middleware for data routes
app.use('/api', (req, res, next) => {
  if (!isDbConnected()) {
    return res.status(503).json({
      error: 'MongoDB Atlas is not connected',
      message: 'MongoDB Atlas connection is required. Paste your MONGODB_URI in .env and restart server.',
      connected: false
    });
  }
  next();
});

// Authenticated/Data API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assessments', assessmentsRoutes);
app.use('/api/interventions', interventionsRoutes);
app.use('/api/settings', settingsRoutes);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'ClassPulse Early Academic Support API',
    database: getDbStatus(),
    docs: '/api/health'
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`\n======================================================`);
  console.log(`🚀 ClassPulse Backend running on http://localhost:${PORT}`);
  console.log(`📡 API Health Check: http://localhost:${PORT}/api/health`);
  console.log(`======================================================`);

  // Connect to MongoDB Atlas
  await connectToDatabase();
});
