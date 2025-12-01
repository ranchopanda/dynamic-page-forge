import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Helper to generate slug
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Get all published blog posts (public) - respects scheduled date
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, tag, featured, limit = '10', page = '1' } = req.query;
    const now = new Date();
    
    const where: any = { 
      isPublished: true,
      OR: [
        { scheduledAt: null },
        { scheduledAt: { lte: now } }
      ]
    };
    if (category) where.category = category;
    if (featured === 'true') where.isFeatured = true;
    if (tag) where.tags = { contains: tag as string };

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
    });

    const total = await prisma.blogPost.count({ where });

    res.json({
      posts,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// Get single blog post by slug (public)
router.get('/post/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const post = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!post || !post.isPublished) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Increment views
    await prisma.blogPost.update({
      where: { slug },
      data: { views: { increment: 1 } },
    });

    res.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

// Get categories (public)
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { isPublished: true },
      select: { category: true },
    });

    const categories = [...new Set(posts.map(p => p.category))];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// ============ ADMIN ROUTES ============

// Get all posts (admin - includes drafts)
router.get('/admin/all', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Create blog post (admin)
router.post('/admin', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { title, excerpt, content, coverImage, category, tags, isPublished, isFeatured, metaTitle, metaDescription, keywords } = req.body;

    if (!title || !excerpt || !content) {
      return res.status(400).json({ error: 'Title, excerpt, and content are required' });
    }

    let slug = generateSlug(title);
    
    // Check if slug exists
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        category: category || 'General',
        tags: JSON.stringify(tags || []),
        isPublished: isPublished || false,
        isFeatured: isFeatured || false,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        keywords,
      },
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

// Update blog post (admin)
router.put('/admin/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, excerpt, content, coverImage, category, tags, isPublished, isFeatured, metaTitle, metaDescription, keywords } = req.body;

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title,
        excerpt,
        content,
        coverImage,
        category,
        tags: tags ? JSON.stringify(tags) : undefined,
        isPublished,
        isFeatured,
        metaTitle,
        metaDescription,
        keywords,
      },
    });

    res.json(post);
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

// Delete blog post (admin)
router.delete('/admin/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.blogPost.delete({ where: { id } });
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

export default router;
