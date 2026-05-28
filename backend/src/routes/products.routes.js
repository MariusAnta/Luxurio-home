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
  assembled: z.boolean().optional(),
  categoryId: z.string().optional().nullable(),
  images: z.array(imageSchema).optional(),
});

// Public list with filters & pagination
// Supports two modes:
//   Cursor-based  (preferred): ?cursor=<lastProductId>&limit=20
//   Offset-based  (legacy):    ?page=1&limit=20
router.get('/', async (req, res, next) => {
  try {
    const { category, featured, q, page = '1', limit = '20', cursor, ids } = req.query;
    const where = { published: true };
    if (ids) {
      const idList = String(ids).split(',').map(s => s.trim()).filter(Boolean);
      const items = await prisma.product.findMany({
        where: { id: { in: idList } },
        include: { images: { orderBy: { order: 'asc' } }, category: true },
      });
      // preserve order from idList
      const ordered = idList.map(id => items.find(p => p.id === id)).filter(Boolean);
      return res.json({ items: ordered, total: ordered.length, page: 1, limit: ordered.length });
    }
    if (category) {
      const cat = await prisma.category.findUnique({
        where: { slug: String(category) },
        select: { id: true, children: { select: { id: true } } },
      });
      if (cat) {
        // Always include the parent's own products + all children
        const ids = [cat.id, ...cat.children.map((c) => c.id)];
        where.categoryId = { in: ids };
      }
    }
    if (featured === 'true') where.featured = true;
    if (q) where.name = { contains: String(q) }; // SQLite LIKE is case-insensitive for ASCII

    const take = Math.min(parseInt(limit, 10) || 20, 100);

    if (cursor) {
      // Cursor-based: fetch take+1 to detect whether a next page exists
      const raw = await prisma.product.findMany({
        where,
        take: take + 1,
        cursor: { id: String(cursor) },
        skip: 1, // skip the cursor item itself
        include: { images: { orderBy: { order: 'asc' } }, category: true },
        orderBy: { createdAt: 'desc' },
      });
      const hasMore = raw.length > take;
      const items = hasMore ? raw.slice(0, take) : raw;
      const nextCursor = hasMore ? items[items.length - 1].id : null;
      return res.json({ items, nextCursor, hasMore });
    }

    // Offset-based (backward-compatible)
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

router.post('/bulk-discount', requireAdmin, async (req, res, next) => {
  try {
    const { ids, discountPercent } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids required' });
    if (discountPercent === null || discountPercent === undefined) {
      // remove discount
      await prisma.$transaction(
        ids.map(id => prisma.product.update({ where: { id }, data: { discountPrice: null } }))
      );
    } else {
      const pct = Number(discountPercent);
      if (isNaN(pct) || pct < 0 || pct > 100) return res.status(400).json({ error: 'discountPercent must be 0-100' });
      const products = await prisma.product.findMany({ where: { id: { in: ids } }, select: { id: true, price: true } });
      await prisma.$transaction(
        products.map(p => prisma.product.update({
          where: { id: p.id },
          data: { discountPrice: Math.round(p.price * (1 - pct / 100) * 100) / 100 },
        }))
      );
    }
    res.json({ updated: ids.length });
  } catch (e) { next(e); }
});

export default router;
