import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// Validation schemas
const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.enum(['USER', 'ARTIST', 'ADMIN'], { 
      errorMap: () => ({ message: 'Role must be USER, ARTIST, or ADMIN' })
    }),
  }),
});

const createStyleSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    description: z.string().max(1000).optional(),
    imageUrl: z.string().url('Invalid image URL').optional(),
    promptModifier: z.string().max(500).optional(),
    category: z.string().max(50).optional(),
    complexity: z.enum(['SIMPLE', 'MEDIUM', 'COMPLEX']).optional(),
    coverage: z.enum(['MINIMAL', 'PARTIAL', 'FULL']).optional(),
  }),
});

const updateStyleSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(1000).optional(),
    imageUrl: z.string().url('Invalid image URL').optional(),
    promptModifier: z.string().max(500).optional(),
    category: z.string().max(50).optional(),
    complexity: z.enum(['SIMPLE', 'MEDIUM', 'COMPLEX']).optional(),
    coverage: z.enum(['MINIMAL', 'PARTIAL', 'FULL']).optional(),
    isActive: z.boolean().optional(),
  }),
});

const reviewDesignSchema = z.object({
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED'], {
      errorMap: () => ({ message: 'Status must be APPROVED or REJECTED' })
    }),
    notes: z.string().max(1000).optional(),
    canBeTemplate: z.boolean().optional(),
  }),
});

// Dashboard stats
router.get('/stats', authenticate, requireRole('ADMIN'), async (_req: Request, res: Response) => {
  const [
    totalUsers,
    totalDesigns,
    totalBookings,
    pendingBookings,
    totalArtists,
    recentBookings,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.design.count(),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.artistProfile.count(),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  // Bookings by status
  const bookingsByStatus = await prisma.booking.groupBy({
    by: ['status'],
    _count: true,
  });

  // Designs by style
  const designsByStyle = await prisma.design.groupBy({
    by: ['styleId'],
    _count: true,
    orderBy: { _count: { styleId: 'desc' } },
    take: 5,
  });

  // Get style names
  const styleIds = designsByStyle.map(d => d.styleId).filter(Boolean) as string[];
  const styles = await prisma.hennaStyle.findMany({
    where: { id: { in: styleIds } },
    select: { id: true, name: true },
  });

  const designsByStyleWithNames = designsByStyle.map(d => ({
    styleId: d.styleId,
    styleName: styles.find(s => s.id === d.styleId)?.name || 'Unknown',
    count: d._count,
  }));

  res.json({
    totalUsers,
    totalDesigns,
    totalBookings,
    pendingBookings,
    totalArtists,
    recentBookings,
    bookingsByStatus: bookingsByStatus.reduce((acc, b) => {
      acc[b.status] = b._count;
      return acc;
    }, {} as Record<string, number>),
    designsByStyle: designsByStyleWithNames,
  });
});

// Get all users
router.get('/users', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { page = '1', limit = '20', role } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const where: any = {};
  if (role) {
    where.role = role;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string),
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            designs: true,
            bookings: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    users,
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total,
      pages: Math.ceil(total / parseInt(limit as string)),
    },
  });
});

// Update user role
router.patch('/users/:id/role', authenticate, requireRole('ADMIN'), validate(updateUserRoleSchema), async (req: Request, res: Response) => {
  const { role } = req.body;

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  res.json(user);
});

// Get all styles (for management)
router.get('/styles', authenticate, requireRole('ADMIN'), async (_req: Request, res: Response) => {
  const styles = await prisma.hennaStyle.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { designs: true },
      },
    },
  });

  res.json(styles);
});

// Create new style
router.post('/styles', authenticate, requireRole('ADMIN'), validate(createStyleSchema), async (req: Request, res: Response) => {
  const { name, description, imageUrl, promptModifier, category, complexity, coverage } = req.body;

  const style = await prisma.hennaStyle.create({
    data: {
      name,
      description,
      imageUrl,
      promptModifier,
      category,
      complexity,
      coverage,
      isActive: true,
    },
  });

  res.json(style);
});

// Update style
router.patch('/styles/:id', authenticate, requireRole('ADMIN'), validate(updateStyleSchema), async (req: Request, res: Response) => {
  const { name, description, imageUrl, promptModifier, category, complexity, coverage, isActive } = req.body;

  const style = await prisma.hennaStyle.update({
    where: { id: req.params.id },
    data: {
      name,
      description,
      imageUrl,
      promptModifier,
      category,
      complexity,
      coverage,
      isActive,
    },
  });

  res.json(style);
});

// Delete style
router.delete('/styles/:id', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  await prisma.hennaStyle.delete({
    where: { id: req.params.id },
  });

  res.json({ message: 'Style deleted successfully' });
});

// Upload style image
router.post('/styles/upload', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  // This will be handled by multer middleware
  // For now, return a placeholder
  res.json({ imageUrl: req.body.imageUrl || 'https://placeholder.com/image.jpg' });
});

// ============ DESIGN REVIEW SYSTEM ============

// Get all designs for review
router.get('/designs', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { page = '1', limit = '20', status } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const where: any = {};
  if (status) {
    where.reviewStatus = status;
  }

  const [designs, total] = await Promise.all([
    prisma.design.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string),
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        style: { select: { id: true, name: true } },
      },
    }),
    prisma.design.count({ where }),
  ]);

  res.json({
    designs,
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total,
      pages: Math.ceil(total / parseInt(limit as string)),
    },
  });
});

// Get design review stats
router.get('/designs/stats', authenticate, requireRole('ADMIN'), async (_req: Request, res: Response) => {
  const [pending, approved, rejected, totalWithFeedback, avgRating] = await Promise.all([
    prisma.design.count({ where: { reviewStatus: 'PENDING' } }),
    prisma.design.count({ where: { reviewStatus: 'APPROVED' } }),
    prisma.design.count({ where: { reviewStatus: 'REJECTED' } }),
    prisma.design.count({ where: { userRating: { not: null } } }),
    prisma.design.aggregate({
      _avg: { userRating: true },
      where: { userRating: { not: null } },
    }),
  ]);

  // Get rating distribution
  const ratingDistribution = await prisma.design.groupBy({
    by: ['userRating'],
    _count: true,
    where: { userRating: { not: null } },
  });

  res.json({
    pending,
    approved,
    rejected,
    totalWithFeedback,
    avgRating: avgRating._avg.userRating || 0,
    ratingDistribution: ratingDistribution.reduce((acc, r) => {
      if (r.userRating) acc[r.userRating] = r._count;
      return acc;
    }, {} as Record<number, number>),
  });
});

// Review a design (approve/reject)
router.patch('/designs/:id/review', authenticate, requireRole('ADMIN'), validate(reviewDesignSchema), async (req: Request, res: Response) => {
  const { status, notes, canBeTemplate } = req.body;

  const design = await prisma.design.update({
    where: { id: req.params.id },
    data: {
      reviewStatus: status,
      reviewedAt: new Date(),
      reviewedBy: req.user?.userId,
      reviewNotes: notes,
      canBeTemplate: status === 'APPROVED' ? (canBeTemplate ?? false) : false,
      isPublic: status === 'APPROVED' ? true : false,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      style: { select: { id: true, name: true } },
    },
  });

  res.json(design);
});

// Get designs with feedback
router.get('/designs/feedback', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { page = '1', limit = '20', minRating, maxRating } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const where: any = {
    userRating: { not: null },
  };

  if (minRating) {
    where.userRating = { ...where.userRating, gte: parseInt(minRating as string) };
  }
  if (maxRating) {
    where.userRating = { ...where.userRating, lte: parseInt(maxRating as string) };
  }

  const [designs, total] = await Promise.all([
    prisma.design.findMany({
      where,
      orderBy: { feedbackAt: 'desc' },
      skip,
      take: parseInt(limit as string),
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        style: { select: { id: true, name: true } },
      },
    }),
    prisma.design.count({ where }),
  ]);

  res.json({
    designs,
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total,
      pages: Math.ceil(total / parseInt(limit as string)),
    },
  });
});

// Get approved designs that can be used as templates
router.get('/designs/templates', authenticate, requireRole('ADMIN'), async (_req: Request, res: Response) => {
  const templates = await prisma.design.findMany({
    where: {
      reviewStatus: 'APPROVED',
      canBeTemplate: true,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true } },
      style: { select: { id: true, name: true } },
    },
  });

  res.json(templates);
});

export default router;
