import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { prisma } from '../lib/prisma.js';
import { signToken, requireAdmin, requireUser } from '../middleware/auth.js';

const router = Router();

// 10 attempts per 15 minutes per IP on all login/register endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again later.' },
});

const credSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = credSchema.extend({
  name: z.string().min(1).optional(),
});

/* ── ADMIN ── */
router.post('/admin/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = credSchema.parse(req.body);
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken({ id: admin.id, email: admin.email, role: admin.role, type: 'admin' });
    res.json({
      token,
      admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
    });
  } catch (e) { next(e); }
});

router.get('/admin/me', requireAdmin, async (req, res) => {
  const admin = await prisma.admin.findUnique({
    where: { id: req.admin.id },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  res.json({ admin });
});

/* ── USER (customer) ── */
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hash, name },
      select: { id: true, email: true, name: true },
    });
    const token = signToken({ id: user.id, email: user.email, type: 'user' });
    res.status(201).json({ token, user });
  } catch (e) { next(e); }
});

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = credSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken({ id: user.id, email: user.email, type: 'user' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e) { next(e); }
});

router.get('/me', requireUser, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  res.json({ user });
});

export default router;
