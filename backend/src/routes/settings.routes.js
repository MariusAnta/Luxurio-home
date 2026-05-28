import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

const ALLOWED_KEYS = ['marquee', 'content', 'new_season'];

// Public: get a setting by key
router.get('/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    if (!ALLOWED_KEYS.includes(key)) return res.status(404).json({ error: 'Not found' });
    const row = await prisma.siteSettings.findUnique({ where: { key } });
    if (!row) return res.json({ key, value: null });
    res.json({ key, value: JSON.parse(row.value) });
  } catch (e) { next(e); }
});

// Admin: upsert a setting by key
router.put('/:key', requireAdmin, async (req, res, next) => {
  try {
    const { key } = req.params;
    if (!ALLOWED_KEYS.includes(key)) return res.status(404).json({ error: 'Not found' });
    const { value } = z.object({ value: z.unknown() }).parse(req.body);
    const row = await prisma.siteSettings.upsert({
      where: { key },
      update: { value: JSON.stringify(value) },
      create: { key, value: JSON.stringify(value) },
    });
    res.json({ key, value: JSON.parse(row.value) });
  } catch (e) { next(e); }
});

export default router;
