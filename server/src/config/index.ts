import dotenv from 'dotenv';
dotenv.config();

// Validate critical environment variables in production
const validateConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'fallback-secret-change-me') {
      throw new Error('CRITICAL: JWT_SECRET must be set in production environment!');
    }
    if (process.env.JWT_SECRET.length < 32) {
      throw new Error('CRITICAL: JWT_SECRET must be at least 32 characters long!');
    }
  }
};

validateConfig();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  jwt: {
    secret: process.env.JWT_SECRET || (process.env.NODE_ENV === 'development' 
      ? 'dev-only-secret-do-not-use-in-production-32chars' 
      : (() => { throw new Error('JWT_SECRET required in production'); })()),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  // Cookie settings for httpOnly tokens
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  },
  
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'Mehendi Design <noreply@mehendidesign.com>',
  },
  
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
  },
  
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || '',
    bucket: process.env.AWS_S3_BUCKET || '',
  },
};
