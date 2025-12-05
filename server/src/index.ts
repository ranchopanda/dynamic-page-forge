import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/auth.js';
import designRoutes from './routes/designs.js';
import styleRoutes from './routes/styles.js';
import bookingRoutes from './routes/bookings.js';
import artistRoutes from './routes/artists.js';
import newsletterRoutes from './routes/newsletter.js';
import adminRoutes from './routes/admin.js';
import blogRoutes from './routes/blog.js';
import settingsRoutes from './routes/settings.js';
import aiRoutes from './routes/ai.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy for Vercel/production (needed for secure cookies and HTTPS detection)
app.set('trust proxy', 1);

// CORS configuration - Allow all origins for Vercel deployment
app.use(cors({
  origin: true, // Allow all origins (Vercel handles this via vercel.json)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
}));

// Handle preflight requests explicitly
app.options('*', cors());

// HTTPS enforcement in production (after CORS to allow preflight)
app.use((req, res, next) => {
  // Skip redirect for OPTIONS (preflight) requests
  if (req.method === 'OPTIONS') {
    return next();
  }
  
  if (config.nodeEnv === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

// Security middleware - Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://generativelanguage.googleapis.com", "https://aistudiocdn.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting - General API limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Very strict limiter for password reset
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: { error: 'Too many password reset attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting to all API routes
app.use('/api', generalLimiter);

// Body parsing with reasonable limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '..', config.upload.dir)));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes with specific rate limiters
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/change-password', passwordResetLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/styles', styleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/ai', aiRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server (only in non-serverless environment)
if (process.env.VERCEL !== '1') {
  app.listen(config.port, () => {
    console.log(`🚀 Server running on http://localhost:${config.port}`);
    console.log(`📝 Environment: ${config.nodeEnv}`);
  });
}

export default app;
