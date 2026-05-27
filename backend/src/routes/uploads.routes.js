import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads');

const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']);
const ALLOWED_MODEL_MIME = new Set(['model/gltf-binary', 'model/gltf+json', 'application/octet-stream']);
const ALLOWED_MODEL_EXT = new Set(['.glb', '.gltf']);
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_MODEL_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${randomUUID()}${ext}`);
  },
});

const uploadImage = multer({
  storage,
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_MIME.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, AVIF, and GIF images are allowed.'));
    }
  },
});

const uploadModel = multer({
  storage,
  limits: { fileSize: MAX_MODEL_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // Browsers often send application/octet-stream for .glb — also check extension
    if (ALLOWED_MODEL_MIME.has(file.mimetype) || ALLOWED_MODEL_EXT.has(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .glb and .gltf 3D model files are allowed.'));
    }
  },
});

// POST /api/uploads/image  (admin only)
router.post('/image', requireAdmin, uploadImage.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file received.' });
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

// POST /api/uploads/model  (admin only) — accepts .glb / .gltf
router.post('/model', requireAdmin, uploadModel.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file received.' });
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

// DELETE /api/uploads/file  (admin only) — removes a previously uploaded file
router.delete('/file', requireAdmin, async (req, res) => {
  const { url } = req.body ?? {};
  if (!url || typeof url !== 'string') return res.status(400).json({ error: 'url required' });
  // Only allow deleting files from our own uploads directory
  const after = url.split('/uploads/').pop();
  if (!after || after.includes('/') || after.includes('..') || after.includes('\\')) {
    return res.status(400).json({ error: 'Invalid filename' });
  }
  try {
    await fs.unlink(path.join(uploadsDir, after));
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: 'File not found' });
  }
});

export default router;
