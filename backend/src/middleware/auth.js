import jwt from 'jsonwebtoken';

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function verify(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export function requireAdmin(req, res, next) {
  const decoded = verify(req);
  if (!decoded || decoded.type !== 'admin') {
    return res.status(401).json({ error: 'Admin authentication required' });
  }
  req.admin = decoded;
  next();
}

export function requireSuperAdmin(req, res, next) {
  const decoded = verify(req);
  if (!decoded || decoded.type !== 'admin' || decoded.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Super admin only' });
  }
  req.admin = decoded;
  next();
}

export function requireUser(req, res, next) {
  const decoded = verify(req);
  if (!decoded || decoded.type !== 'user') {
    return res.status(401).json({ error: 'Login required' });
  }
  req.user = decoded;
  next();
}

export function optionalUser(req, _res, next) {
  const decoded = verify(req);
  if (decoded && decoded.type === 'user') req.user = decoded;
  next();
}
