import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { upload, getFileUrl } from '../lib/upload.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

const createDesignSchema = z.object({
  body: z.object({
    styleId: z.string().uuid().optional(),
    generatedImageUrl: z.string(),
    outfitContext: z.string().optional(),
    handAnalysis: z.any().optional(),
    isPublic: z.boolean().optional(),
  }),
});

// Get all public designs (gallery)
router.get('/gallery', optionalAuth, async (req: Request, res: Response) => {
  const { page = '1', limit = '20', style, sort = 'recent' } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const where: any = { isPublic: true };
  if (style) {
    where.styleId = style;
  }

  const orderBy: any = sort === 'popular' 
    ? { likes: 'desc' } 
    : { createdAt: 'desc' };

  const [designs, total] = await Promise.all([
    prisma.design.findMany({
      where,
      orderBy,
      skip,
      take: parseInt(limit as string),
      include: {
        style: { select: { name: true, category: true } },
        user: { select: { name: true, avatar: true } },
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

// Get user's designs
router.get('/my', authenticate, async (req: Request, res: Response) => {
  const designs = await prisma.design.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
    include: {
      style: { select: { name: true, category: true } },
    },
  });

  res.json(designs);
});

// Get single design
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  const design = await prisma.design.findUnique({
    where: { id: req.params.id },
    include: {
      style: true,
      user: { select: { id: true, name: true, avatar: true } },
    },
  });

  if (!design) {
    throw new AppError('Design not found', 404);
  }

  // Check access
  if (!design.isPublic && design.userId !== req.user?.userId) {
    throw new AppError('Access denied', 403);
  }

  res.json(design);
});

// Upload hand image
router.post('/upload-hand', authenticate, upload.single('image'), async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('No image uploaded', 400);
  }

  const imageUrl = getFileUrl(req.file.filename);
  res.json({ imageUrl });
});

// Create design
router.post('/', authenticate, validate(createDesignSchema), async (req: Request, res: Response) => {
  const { styleId, generatedImageUrl, outfitContext, handAnalysis, isPublic } = req.body;
  const handImageUrl = req.body.handImageUrl || '';

  const design = await prisma.design.create({
    data: {
      userId: req.user!.userId,
      styleId,
      handImageUrl,
      generatedImageUrl,
      outfitContext,
      handAnalysis: handAnalysis ? JSON.stringify(handAnalysis) : null,
      isPublic: isPublic || false,
    },
    include: {
      style: { select: { name: true, category: true } },
    },
  });

  res.status(201).json({
    ...design,
    handAnalysis: design.handAnalysis ? JSON.parse(design.handAnalysis) : null,
  });
});

// Update design
router.patch('/:id', authenticate, async (req: Request, res: Response) => {
  const design = await prisma.design.findUnique({
    where: { id: req.params.id },
  });

  if (!design) {
    throw new AppError('Design not found', 404);
  }

  if (design.userId !== req.user!.userId) {
    throw new AppError('Access denied', 403);
  }

  const { isPublic, outfitContext } = req.body;

  const updated = await prisma.design.update({
    where: { id: req.params.id },
    data: {
      ...(typeof isPublic === 'boolean' && { isPublic }),
      ...(outfitContext && { outfitContext }),
    },
    include: {
      style: { select: { name: true, category: true } },
    },
  });

  res.json(updated);
});

// Like design
router.post('/:id/like', authenticate, async (req: Request, res: Response) => {
  const design = await prisma.design.update({
    where: { id: req.params.id },
    data: { likes: { increment: 1 } },
  });

  res.json({ likes: design.likes });
});

// Delete design
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  const design = await prisma.design.findUnique({
    where: { id: req.params.id },
  });

  if (!design) {
    throw new AppError('Design not found', 404);
  }

  if (design.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
    throw new AppError('Access denied', 403);
  }

  await prisma.design.delete({ where: { id: req.params.id } });

  res.json({ message: 'Design deleted' });
});

// Submit feedback for a design
router.post('/:id/feedback', authenticate, async (req: Request, res: Response) => {
  const { rating, feedback } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    throw new AppError('Rating must be between 1 and 5', 400);
  }

  const design = await prisma.design.findUnique({
    where: { id: req.params.id },
  });

  if (!design) {
    throw new AppError('Design not found', 404);
  }

  // Only the owner can submit feedback
  if (design.userId !== req.user!.userId) {
    throw new AppError('You can only submit feedback for your own designs', 403);
  }

  const updated = await prisma.design.update({
    where: { id: req.params.id },
    data: {
      userRating: rating,
      userFeedback: feedback || null,
      feedbackAt: new Date(),
    },
  });

  res.json({
    message: 'Feedback submitted successfully',
    design: updated,
  });
});

// Get approved designs that can be used as templates (public endpoint)
router.get('/templates/approved', optionalAuth, async (_req: Request, res: Response) => {
  try {
    const templates = await prisma.design.findMany({
      where: {
        reviewStatus: 'APPROVED',
        canBeTemplate: true,
      },
      orderBy: [
        { userRating: 'desc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        generatedImageUrl: true,
        userRating: true,
        style: { select: { id: true, name: true, category: true } },
        user: { select: { name: true } },
        createdAt: true,
      },
    });

    res.json(templates);
  } catch (error) {
    console.error('Error fetching approved templates:', error);
    // Return empty array instead of error to prevent frontend crashes
    res.json([]);
  }
});

export default router;
