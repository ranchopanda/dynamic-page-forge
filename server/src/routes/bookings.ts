import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sendBookingConfirmation } from '../lib/email.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

const createBookingSchema = z.object({
  body: z.object({
    designId: z.string().uuid().optional(),
    consultationType: z.enum(['VIRTUAL', 'IN_PERSON', 'ON_SITE']),
    scheduledDate: z.string(),
    scheduledTime: z.string(),
    eventDate: z.string().optional(),
    message: z.string().optional(),
  }),
});

const generateConfirmationCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'HHS-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Get user's bookings
router.get('/my', authenticate, async (req: Request, res: Response) => {
  const bookings = await prisma.booking.findMany({
    where: { userId: req.user!.userId },
    orderBy: { scheduledDate: 'desc' },
    include: {
      design: {
        select: {
          id: true,
          generatedImageUrl: true,
          style: { select: { name: true } },
        },
      },
      artist: {
        select: {
          user: { select: { name: true, avatar: true } },
        },
      },
    },
  });

  res.json(bookings);
});

// Get single booking
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id },
    include: {
      design: {
        include: {
          style: true,
        },
      },
      artist: {
        include: {
          user: { select: { name: true, avatar: true, email: true } },
        },
      },
      user: { select: { name: true, email: true, phone: true } },
    },
  });

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  // Check access
  if (booking.userId !== req.user!.userId && req.user!.role !== 'ADMIN' && req.user!.role !== 'ARTIST') {
    throw new AppError('Access denied', 403);
  }

  res.json(booking);
});

// Create booking
router.post('/', authenticate, validate(createBookingSchema), async (req: Request, res: Response) => {
  const { designId, consultationType, scheduledDate, scheduledTime, eventDate, message } = req.body;

  // Verify design belongs to user if provided
  if (designId) {
    const design = await prisma.design.findUnique({ where: { id: designId } });
    if (!design || design.userId !== req.user!.userId) {
      throw new AppError('Design not found', 404);
    }
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const confirmationCode = generateConfirmationCode();

  const booking = await prisma.booking.create({
    data: {
      userId: req.user!.userId,
      designId,
      consultationType,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      eventDate: eventDate ? new Date(eventDate) : null,
      message,
      confirmationCode,
    },
    include: {
      design: {
        select: {
          generatedImageUrl: true,
          style: { select: { name: true } },
        },
      },
    },
  });

  // Send confirmation email
  sendBookingConfirmation(user.email, user.name, {
    confirmationCode: booking.confirmationCode,
    scheduledDate: booking.scheduledDate,
    scheduledTime: booking.scheduledTime,
    consultationType: booking.consultationType,
  }).catch(console.error);

  res.status(201).json(booking);
});

// Update booking status (admin/artist)
router.patch('/:id/status', authenticate, requireRole('ADMIN', 'ARTIST'), async (req: Request, res: Response) => {
  const { status, notes } = req.body;

  const booking = await prisma.booking.update({
    where: { id: req.params.id },
    data: {
      status,
      ...(notes && { notes }),
    },
  });

  res.json(booking);
});

// Cancel booking
router.post('/:id/cancel', authenticate, async (req: Request, res: Response) => {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id },
  });

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  if (booking.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
    throw new AppError('Access denied', 403);
  }

  if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
    throw new AppError('Cannot cancel this booking', 400);
  }

  const updated = await prisma.booking.update({
    where: { id: req.params.id },
    data: { status: 'CANCELLED' },
  });

  res.json(updated);
});

// Get all bookings (admin)
router.get('/', authenticate, requireRole('ADMIN', 'ARTIST'), async (req: Request, res: Response) => {
  const { status, page = '1', limit = '20' } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const where: any = {};
  if (status) {
    where.status = status;
  }

  // Artists only see their assigned bookings
  if (req.user!.role === 'ARTIST') {
    const artistProfile = await prisma.artistProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (artistProfile) {
      where.artistId = artistProfile.id;
    }
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { scheduledDate: 'asc' },
      skip,
      take: parseInt(limit as string),
      include: {
        user: { select: { name: true, email: true, phone: true } },
        design: { select: { generatedImageUrl: true, style: { select: { name: true } } } },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  res.json({
    bookings,
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total,
      pages: Math.ceil(total / parseInt(limit as string)),
    },
  });
});

export default router;
