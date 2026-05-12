import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

// Fail fast if critical secrets are missing
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Refusing to start.');
  process.exit(1);
}
if (!process.env.CORS_ORIGIN) {
  console.warn('WARNING: CORS_ORIGIN is not set — defaulting to http://localhost:5173. Set this in production.');
}

import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admins.routes.js';
import categoryRoutes from './routes/categories.routes.js';
import productRoutes from './routes/products.routes.js';
import favoriteRoutes from './routes/favorites.routes.js';
import sitemapRoutes from './routes/sitemap.routes.js';
import uploadRoutes from './routes/uploads.routes.js';
import userRoutes from './routes/users.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import { errorHandler } from './middleware/error.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();

// Security headers with explicit CSP
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'ajax.googleapis.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
      fontSrc: ["'self'", 'fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https://images.unsplash.com', 'https:'],
      connectSrc: ["'self'"],
      workerSrc: ["'self'", 'blob:'],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  },
}));

// CORS — must specify origin explicitly when credentials: true
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(o => o.trim());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// Global rate limiter — 200 req / 15 min / IP (covers all routes)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});
app.use(globalLimiter);

app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/', sitemapRoutes);

app.use(errorHandler);

const port = process.env.PORT || 4000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
  });
}

export default app;
