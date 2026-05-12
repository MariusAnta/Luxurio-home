import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/users — all registered customers (admin only)
router.get('/', requireAdmin, async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, createdAt: true,
        _count: { select: { favorites: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (e) { next(e); }
});

export default router;
