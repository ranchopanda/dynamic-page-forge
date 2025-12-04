import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../lib/jwt.js';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.token;

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.token;

  if (token) {
    try {
      const payload = verifyToken(token);
      req.user = payload;
    } catch {
      // Token invalid, continue without user
    }
  }
  next();
};

export const requireRole = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // SECURITY: Verify role from database, not just from token
    // This prevents role manipulation via localStorage/token tampering
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { role: true },
      });
      
      await prisma.$disconnect();
      
      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }
      
      if (!roles.includes(user.role)) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }
      
      // Update req.user with verified role
      req.user.role = user.role;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
};
