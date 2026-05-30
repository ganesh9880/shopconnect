import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { prisma } from '../db.js';

function sessionTokenFromRequest(req) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  const jwtToken = header.slice(7);
  const payload = jwt.verify(jwtToken, config.jwtSecret);
  return payload.sessionToken;
}

export async function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const jwtToken = header.slice(7);
    const payload = jwt.verify(jwtToken, config.jwtSecret);
    if (payload.type !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const sessionToken = payload.sessionToken;
    if (!sessionToken) {
      return res.status(401).json({ error: 'Invalid session' });
    }
    const session = await prisma.session.findFirst({
      where: { token: sessionToken, type: 'ADMIN', expiresAt: { gt: new Date() } },
      include: { adminUser: true },
    });
    if (!session?.adminUser) {
      return res.status(401).json({ error: 'Session expired' });
    }
    req.admin = session.adminUser;
    req.sessionToken = sessionToken;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export async function requireCustomer(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const sessionToken = sessionTokenFromRequest(req);
    const session = await prisma.session.findFirst({
      where: { token: sessionToken, type: 'CUSTOMER', expiresAt: { gt: new Date() } },
      include: { customer: true },
    });
    if (!session?.customer?.isActivated) {
      return res.status(401).json({ error: 'Session expired' });
    }
    req.customer = session.customer;
    req.sessionToken = sessionToken;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function optionalCustomer(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();
  let sessionToken;
  try {
    sessionToken = sessionTokenFromRequest(req);
  } catch {
    return next();
  }
  prisma.session
    .findFirst({
      where: { token: sessionToken, type: 'CUSTOMER', expiresAt: { gt: new Date() } },
      include: { customer: true },
    })
    .then((session) => {
      if (session?.customer?.isActivated) req.customer = session.customer;
      next();
    })
    .catch(() => next());
}
