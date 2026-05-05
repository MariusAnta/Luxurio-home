import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireSuperAdmin } from '../middleware/auth.js';

const router = Router();

const adminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).optional(),
  role: z.enum(['ADMIN', 'SUPER_ADMIN']).default('ADMIN'),
});

router.get('/', requireSuperAdmin, async (_req, res, next) => {
  try {
    const admins = await prisma.admin.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(admins);
  } catch (e) { next(e); }
});

router.post('/', requireSuperAdmin, async (req, res, next) => {
  try {
    const data = adminSchema.parse(req.body);
    const exists = await prisma.admin.findUnique({ where: { email: data.email } });
    if (exists) return res.status(409).json({ error: 'Email already in use' });
    const hash = await bcrypt.hash(data.password, 10);
    const created = await prisma.admin.create({
      data: { ...data, password: hash },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    res.status(201).json(created);
  } catch (e) { next(e); }
});

router.delete('/:id', requireSuperAdmin, async (req, res, next) => {
  try {
    if (req.params.id === req.admin.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    await prisma.admin.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) { next(e); }
});

export default router;
