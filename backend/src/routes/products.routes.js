import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

const imageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  order: z.number().int().optional(),
});

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  designer: z.string().optional().nullable(),
  description: z.string().default(''),
  price: z.number().nonnegative(),
  discountPrice: z.number().nonnegative().optional().nullable(),
  stock: z.number().int().nonnegative().default(0),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  material: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  dimensions: z.string().optional().nullable(),
  weightKg: z.number().optional().nullable(),
  modelUrl: z.string().url().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  images: z.array(imageSchema).optional(),
});

// Public list with filters & pagination
router.get('/', async (req, res, next) => {
  try {
    const { category, featured, q, page = '1', limit = '20' } = req.query;
    const where = { published: true };
    if (category) where.category = { slug: String(category) };
    if (featured === 'true') where.featured = true;
    if (q) where.name = { contains: String(q), mode: 'insensitive' };

    const take = Math.min(parseInt(limit, 10) || 20, 100);
    const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where, take, skip,
        include: { images: { orderBy: { order: 'asc' } }, category: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);
    res.json({ items, total, page: Number(page), limit: take });
  } catch (e) { next(e); }
});

// Admin: list ALL
router.get('/admin/all', requireAdmin, async (_req, res, next) => {
  try {
    const items = await prisma.product.findMany({
      include: { images: { orderBy: { order: 'asc' } }, category: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (e) { next(e); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({
      where: { slug: req.params.slug, published: true },
      include: { images: { orderBy: { order: 'asc' } }, category: true },
    });
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (e) { next(e); }
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const data = productSchema.parse(req.body);
    const { images, ...rest } = data;
    const created = await prisma.product.create({
      data: {
        ...rest,
        images: images?.length
          ? { create: images.map((img, i) => ({ ...img, order: img.order ?? i })) }
          : undefined,
      },
      include: { images: true, category: true },
    });
    res.status(201).json(created);
  } catch (e) { next(e); }
});

router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const data = productSchema.partial().parse(req.body);
    const { images, ...rest } = data;
    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(images
          ? { images: { deleteMany: {}, create: images.map((img, i) => ({ ...img, order: img.order ?? i })) } }
          : {}),
      },
      include: { images: true, category: true },
    });
    res.json(updated);
  } catch (e) { next(e); }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) { next(e); }
});

export default router;
