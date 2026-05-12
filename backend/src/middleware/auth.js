import jwt from 'jsonwebtoken';

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

/** Read and verify a JWT for a specific role type ('admin' | 'user').
 *  Checks httpOnly cookie first, then falls back to Bearer header. */
function getDecoded(req, type) {
  const cookieName = type === 'admin' ? 'luxurio_admin_jwt' : 'luxurio_user_jwt';
  const cookieToken = req.cookies?.[cookieName];

  const header = req.headers.authorization || '';
  const bearerToken = header.startsWith('Bearer ') ? header.slice(7) : null;

  for (const token of [cookieToken, bearerToken]) {
    if (!token) continue;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.type === type) return decoded;
    } catch { /* invalid or expired — try next */ }
  }
  return null;
}

export function requireAdmin(req, res, next) {
  const decoded = getDecoded(req, 'admin');
  if (!decoded) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }
  req.admin = decoded;
  next();
}

export function requireSuperAdmin(req, res, next) {
  const decoded = getDecoded(req, 'admin');
  if (!decoded || decoded.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Super admin only' });
  }
  req.admin = decoded;
  next();
}

export function requireUser(req, res, next) {
  const decoded = getDecoded(req, 'user');
  if (!decoded) {
    return res.status(401).json({ error: 'Login required' });
  }
  req.user = decoded;
  next();
}

export function optionalUser(req, _res, next) {
  const decoded = getDecoded(req, 'user');
  if (decoded) req.user = decoded;
  next();
}
