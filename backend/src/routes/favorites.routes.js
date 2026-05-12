import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireUser } from '../middleware/auth.js';

const router = Router();

router.get('/', requireUser, async (req, res, next) => {
  try {
    const favs = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: {
        product: { include: { images: { orderBy: { order: 'asc' } }, category: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(favs.map((f) => f.product));
  } catch (e) { next(e); }
});

// Just the IDs — used by the frontend to render heart state
router.get('/ids', requireUser, async (req, res, next) => {
  try {
    const favs = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      select: { productId: true },
    });
    res.json(favs.map((f) => f.productId));
  } catch (e) { next(e); }
});

router.post('/:productId', requireUser, async (req, res, next) => {
  try {
    await prisma.favorite.upsert({
      where: { userId_productId: { userId: req.user.id, productId: req.params.productId } },
      update: {},
      create: { userId: req.user.id, productId: req.params.productId },
    });
    res.status(201).json({ ok: true });
  } catch (e) { next(e); }
});

router.delete('/:productId', requireUser, async (req, res, next) => {
  try {
    await prisma.favorite.deleteMany({
      where: { userId: req.user.id, productId: req.params.productId },
    });
    res.status(204).end();
  } catch (e) { next(e); }
});

export default router;
