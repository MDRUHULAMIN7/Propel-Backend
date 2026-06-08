import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import router from './app/routes/index.js';
import globalErrorHandler from './app/errors/globalErrorHandler.js';
import AppError from './app/errors/AppError.js';
import config from './app/config/index.js';

const app: Application = express();

// ── Security ──────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: [
      config.clientUrl, 
      'http://localhost:3000', 
      'https://propel-frontend-phi.vercel.app',
      'https://propel-frontend-phi.vercel.app/'
    ],
    credentials: true,
  }),
);

// ── Rate Limiting ─────────────────────────────────────────────────
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: config.nodeEnv === 'development' ? 10000 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later' },
  }),
);

// ── Body Parser ───────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// ── Health Check ──────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Taskora API is running',
    environment: config.nodeEnv,
  });
});

// ── API Routes ────────────────────────────────────────────────────
app.use('/api/v1', router);

// ── 404 Handler ───────────────────────────────────────────────────
app.all('*', (req, _res, next) => {
  next(new AppError(`Route '${req.originalUrl}' not found`, 404));
});

// ── Global Error Handler (MUST be last) ───────────────────────────
app.use(globalErrorHandler);

export default app;
