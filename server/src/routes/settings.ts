import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get site settings (public - for frontend)
router.get('/', async (req: Request, res: Response) => {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'settings' },
    });

    // Create default settings if not exists
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: 'settings',
          siteName: 'Mehndi Design',
          tagline: 'AI-Powered Custom Mehndi Design Generator',
          ownerName: 'Himanshi',
          email: 'himanshiparashar44@gmail.com',
          phone: '+91 7011489500',
          whatsapp: '+91 7011489500',
          address: 'Greater Noida, Uttar Pradesh',
          pricePerHand: 100,
          availableDays: 'Sunday, Monday',
          seoKeywords: 'mehndi design, henna artist Greater Noida, bridal mehndi, AI mehndi generator, mehndi artist Noida, wedding mehndi, festive henna',
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
router.put('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
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

    const settings = await prisma.siteSettings.upsert({
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
        siteName: siteName || 'Mehndi Design',
        tagline: tagline || 'AI-Powered Custom Mehndi Design Generator',
        ownerName: ownerName || 'Himanshi',
        email: email || 'himanshiparashar44@gmail.com',
        phone: phone || '+91 7011489500',
        whatsapp: whatsapp || '+91 7011489500',
        address: address || 'Greater Noida, Uttar Pradesh',
        pricePerHand: pricePerHand || 100,
        availableDays: availableDays || 'Sunday, Monday',
        seoKeywords: seoKeywords || 'mehndi design, henna artist Greater Noida',
      },
    });

    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
