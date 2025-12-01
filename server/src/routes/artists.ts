import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// Helper to parse JSON arrays stored as strings
const parseJsonArray = (str: string): string[] => {
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
};

// Get all artists
router.get('/', async (req: Request, res: Response) => {
  const { available } = req.query;

  const where: any = {};
  if (available === 'true') {
    where.available = true;
  }

  const artists = await prisma.artistProfile.findMany({
    where,
    orderBy: { rating: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  // Parse JSON arrays
  const parsed = artists.map(a => ({
    ...a,
    specialties: parseJsonArray(a.specialties),
    portfolio: parseJsonArray(a.portfolio),
  }));

  res.json(parsed);
});

// Get artist by ID
router.get('/:id', async (req: Request, res: Response) => {
  const artist = await prisma.artistProfile.findUnique({
    where: { id: req.params.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          createdAt: true,
        },
      },
    },
  });

  if (!artist) {
    throw new AppError('Artist not found', 404);
  }

  // Get reviews
  const reviews = await prisma.review.findMany({
    where: { artistId: req.params.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      user: { select: { name: true, avatar: true } },
    },
  });

  // Parse JSON arrays and add reviews
  const parsed = {
    ...artist,
    specialties: parseJsonArray(artist.specialties),
    portfolio: parseJsonArray(artist.portfolio),
    reviews: reviews.map(r => ({
      ...r,
      images: parseJsonArray(r.images),
    })),
  };

  res.json(parsed);
});

// Create/update artist profile
router.post('/profile', authenticate, async (req: Request, res: Response) => {
  const { bio, specialties, experience, portfolio } = req.body;

  const existing = await prisma.artistProfile.findUnique({
    where: { userId: req.user!.userId },
  });

  if (existing) {
    const updated = await prisma.artistProfile.update({
      where: { userId: req.user!.userId },
      data: {
        ...(bio && { bio }),
        ...(specialties && { specialties: JSON.stringify(specialties) }),
        ...(experience && { experience }),
        ...(portfolio && { portfolio: JSON.stringify(portfolio) }),
      },
    });
    res.json({
      ...updated,
      specialties: parseJsonArray(updated.specialties),
      portfolio: parseJsonArray(updated.portfolio),
    });
  } else {
    // Update user role to ARTIST
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { role: 'ARTIST' },
    });

    const profile = await prisma.artistProfile.create({
      data: {
        userId: req.user!.userId,
        bio,
        specialties: JSON.stringify(specialties || []),
        experience: experience || 0,
        portfolio: JSON.stringify(portfolio || []),
      },
    });
    res.status(201).json({
      ...profile,
      specialties: parseJsonArray(profile.specialties),
      portfolio: parseJsonArray(profile.portfolio),
    });
  }
});

// Toggle availability
router.patch('/availability', authenticate, requireRole('ARTIST'), async (req: Request, res: Response) => {
  const { available } = req.body;

  const profile = await prisma.artistProfile.update({
    where: { userId: req.user!.userId },
    data: { available },
  });

  res.json(profile);
});

// Submit review for artist
router.post('/:id/review', authenticate, async (req: Request, res: Response) => {
  const { rating, comment, images } = req.body;

  if (rating < 1 || rating > 5) {
    throw new AppError('Rating must be between 1 and 5', 400);
  }

  const artistProfile = await prisma.artistProfile.findUnique({
    where: { id: req.params.id },
  });

  if (!artistProfile) {
    throw new AppError('Artist not found', 404);
  }

  const review = await prisma.review.upsert({
    where: {
      userId_artistId: {
        userId: req.user!.userId,
        artistId: req.params.id,
      },
    },
    update: {
      rating,
      comment,
      images: JSON.stringify(images || []),
    },
    create: {
      userId: req.user!.userId,
      artistId: req.params.id,
      rating,
      comment,
      images: JSON.stringify(images || []),
    },
  });

  // Update artist rating
  const stats = await prisma.review.aggregate({
    where: { artistId: req.params.id },
    _avg: { rating: true },
    _count: true,
  });

  await prisma.artistProfile.update({
    where: { id: req.params.id },
    data: {
      rating: stats._avg.rating || 0,
      reviewCount: stats._count,
    },
  });

  res.json({
    ...review,
    images: parseJsonArray(review.images),
  });
});

export default router;
