import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  number: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
});

router.get('/', async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ number: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { products: true } },
        products: {
          where: { published: true },
          orderBy: { createdAt: 'asc' },
          take: 1,
          include: { images: { orderBy: { order: 'asc' }, take: 1 } },
        },
      },
    });
    res.json(categories.map((c) => ({
      ...c,
      productCount: c._count.products,
      coverImage: c.products[0]?.images[0]?.url ?? null,
      products: undefined,
    })));
  } catch (e) { next(e); }
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const data = categorySchema.parse(req.body);
    const created = await prisma.category.create({ data });
    res.status(201).json(created);
  } catch (e) { next(e); }
});

router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const data = categorySchema.partial().parse(req.body);
    const updated = await prisma.category.update({ where: { id: req.params.id }, data });
    res.json(updated);
  } catch (e) { next(e); }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) { next(e); }
});

// Reorder: body = { ids: string[] } — ids in desired order (top-level only)
router.post('/reorder', requireAdmin, async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be an array' });
    await Promise.all(
      ids.map((id, i) =>
        prisma.category.update({
          where: { id },
          data: { number: String(i + 1).padStart(4, '0') },
        })
      )
    );
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
