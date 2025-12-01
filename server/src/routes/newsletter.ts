import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { validate } from '../middleware/validate.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

const subscribeSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
  }),
});

// Subscribe to newsletter
router.post('/subscribe', validate(subscribeSchema), async (req: Request, res: Response) => {
  const { email } = req.body;

  await prisma.newsletter.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  res.json({ message: 'Successfully subscribed to newsletter' });
});

// Unsubscribe
router.delete('/unsubscribe', validate(subscribeSchema), async (req: Request, res: Response) => {
  const { email } = req.body;

  await prisma.newsletter.delete({ where: { email } }).catch(() => {});

  res.json({ message: 'Successfully unsubscribed' });
});

// Get all subscribers (admin only)
router.get('/subscribers', authenticate, requireRole('ADMIN'), async (_req: Request, res: Response) => {
  const subscribers = await prisma.newsletter.findMany({
    orderBy: { createdAt: 'desc' },
  });

  res.json(subscribers);
});

export default router;
