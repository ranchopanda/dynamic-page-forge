import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Get site settings (public - for frontend)
router.get('/', async (_req: Request, res: Response) => {
  try {
    let settings = await (prisma as any).siteSettings.findUnique({
      where: { id: 'settings' },
    });

    // Create default settings if not exists
    if (!settings) {
      settings = await (prisma as any).siteSettings.create({
        data: {
          id: 'settings',
          siteName: 'Mehendi Design',
          tagline: 'AI-Powered Custom Mehendi Design Generator',
          ownerName: 'Himanshi',
          email: 'himanshiparashar44@gmail.com',
          phone: '+91 7011489500',
          whatsapp: '+91 7011489500',
          address: 'Greater Noida, Uttar Pradesh',
          pricePerHand: 100,
          availableDays: 'Sunday, Monday',
        },
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update site settings (admin only)
router.put('/', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    const {
      siteName,
      tagline,
      ownerName,
      email,
      phone,
      whatsapp,
      address,
      pricePerHand,
      availableDays,
      instagram,
      facebook,
      pinterest,
      twitter,
      aboutText,
      seoKeywords,
      googleAnalytics,
    } = req.body;

    const settings = await (prisma as any).siteSettings.upsert({
      where: { id: 'settings' },
      update: {
        siteName,
        tagline,
        ownerName,
        email,
        phone,
        whatsapp,
        address,
        pricePerHand,
        availableDays,
        instagram,
        facebook,
        pinterest,
        twitter,
        aboutText,
        seoKeywords,
        googleAnalytics,
      },
      create: {
        id: 'settings',
        siteName: siteName || 'Mehendi Design',
        tagline: tagline || 'AI-Powered Custom Mehendi Design Generator',
        ownerName: ownerName || 'Himanshi',
        email: email || 'himanshiparashar44@gmail.com',
        phone: phone || '+91 7011489500',
        whatsapp: whatsapp || '+91 7011489500',
        address: address || 'Greater Noida, Uttar Pradesh',
        pricePerHand: pricePerHand || 100,
        availableDays: availableDays || 'Sunday, Monday',
        instagram,
        facebook,
        pinterest,
        twitter,
        aboutText,
        seoKeywords: seoKeywords || 'mehendi design, henna artist Greater Noida',
        googleAnalytics,
      },
    });

    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
