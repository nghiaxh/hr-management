import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { join } from 'path';
import { connect } from 'mongoose';
import http from 'http';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import authRoutes from './routes/auth.routes.js';
import employeesRoutes from './routes/employees.routes.js';
import departmentsRoutes from './routes/departments.routes.js';
import leavesRoutes from './routes/leaves.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import payrollRoutes from './routes/payroll.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import leaveBalanceRoutes from './routes/leave-balance.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-management';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

async function bootstrap() {
  if (!JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is required');
    process.exit(1);
  }

  const app = express();
  const server = http.createServer(app);

  app.set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.use(rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: { message: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  }));

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  await connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  app.use('/api/auth', authRoutes);
  app.use('/api/employees', employeesRoutes);
  app.use('/api/departments', departmentsRoutes);
  app.use('/api/leaves', leavesRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/payroll', payrollRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/leave-balance', leaveBalanceRoutes);
  app.use('/api/notifications', notificationsRoutes);

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

bootstrap().catch(err => {
  console.error('Failed to bootstrap server:', err);
  process.exit(1);
});
