import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// Validation schemas
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

// Get all active styles
router.get('/', async (_req: Request, res: Response) => {
  const styles = await prisma.hennaStyle.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  res.json(styles);
});

// Get style by ID
router.get('/:id', async (req: Request, res: Response) => {
  const style = await prisma.hennaStyle.findUnique({
    where: { id: req.params.id },
  });

  if (!style) {
    throw new AppError('Style not found', 404);
  }

  res.json(style);
});

// Create style (admin only)
router.post('/', authenticate, requireRole('ADMIN'), validate(createStyleSchema), async (req: Request, res: Response) => {
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
    },
  });

  res.status(201).json(style);
});

// Update style (admin only)
router.patch('/:id', authenticate, requireRole('ADMIN'), validate(updateStyleSchema), async (req: Request, res: Response) => {
  const { name, description, imageUrl, promptModifier, category, complexity, coverage, isActive } = req.body;

  const style = await prisma.hennaStyle.update({
    where: { id: req.params.id },
    data: {
      ...(name && { name }),
      ...(description && { description }),
      ...(imageUrl && { imageUrl }),
      ...(promptModifier && { promptModifier }),
      ...(category && { category }),
      ...(complexity && { complexity }),
      ...(coverage && { coverage }),
      ...(typeof isActive === 'boolean' && { isActive }),
    },
  });

  res.json(style);
});

// Delete style (admin only)
router.delete('/:id', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  await prisma.hennaStyle.delete({ where: { id: req.params.id } });
  res.json({ message: 'Style deleted' });
});

export default router;
