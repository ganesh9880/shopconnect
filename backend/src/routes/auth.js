import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../db.js';
import { config } from '../config.js';
import { requireCustomer } from '../middleware/auth.js';

const router = Router();

function adminExpiresAt() {
  const match = /^(\d+)([hd])$/.exec(config.jwtAdminExpires);
  const ms = match
    ? match[2] === 'h'
      ? Number(match[1]) * 3600000
      : Number(match[1]) * 86400000
    : 8 * 3600000;
  return new Date(Date.now() + ms);
}

function customerExpiresAt() {
  return new Date(Date.now() + config.customerSessionDays * 86400000);
}

async function createSession({ type, adminUserId, customerId, deviceFingerprint }) {
  const token = uuidv4();
  const expiresAt = type === 'ADMIN' ? adminExpiresAt() : customerExpiresAt();
  await prisma.session.create({
    data: { token, type, adminUserId, customerId, deviceFingerprint, expiresAt },
  });
  const jwtToken = jwt.sign(
    { type, sessionToken: token, sub: adminUserId || customerId },
    config.jwtSecret,
    { expiresIn: type === 'ADMIN' ? config.jwtAdminExpires : `${config.customerSessionDays}d` },
  );
  return { token: jwtToken, sessionToken: token, expiresAt };
}

router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    const user = await prisma.adminUser.findUnique({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const session = await createSession({ type: 'ADMIN', adminUserId: user.id });
    res.json({
      token: session.token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/activate/:token', async (req, res) => {
  try {
    const customer = await prisma.customer.findFirst({
      where: { activationToken: req.params.token },
      select: {
        id: true,
        customerCode: true,
        name: true,
        phone: true,
        isActivated: true,
      },
    });
    if (!customer) return res.status(404).json({ error: 'Invalid activation link' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/activate/:token', async (req, res) => {
  try {
    const { pin, deviceFingerprint } = req.body;
    if (!pin || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({ error: 'PIN must be exactly 4 digits' });
    }
    const customer = await prisma.customer.findFirst({
      where: { activationToken: req.params.token },
    });
    if (!customer) return res.status(404).json({ error: 'Invalid activation link' });
    if (customer.isActivated) {
      return res.status(400).json({ error: 'Account already activated' });
    }
    const pinHash = await bcrypt.hash(pin, 10);
    await prisma.customer.update({
      where: { id: customer.id },
      data: { pinHash, isActivated: true, activationToken: null },
    });
    const session = await createSession({
      type: 'CUSTOMER',
      customerId: customer.id,
      deviceFingerprint,
    });
    res.json({
      token: session.token,
      customer: {
        id: customer.id,
        customerCode: customer.customerCode,
        name: customer.name,
        phone: customer.phone,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/customer/login', async (req, res) => {
  try {
    const { phone, pin, deviceFingerprint } = req.body;
    if (!phone || !pin) {
      return res.status(400).json({ error: 'Phone and PIN required' });
    }
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({ error: 'PIN must be exactly 4 digits' });
    }
    const customer = await prisma.customer.findUnique({ where: { phone } });
    if (!customer?.isActivated || !customer.pinHash) {
      return res.status(401).json({ error: 'Invalid phone or PIN' });
    }
    if (!(await bcrypt.compare(pin, customer.pinHash))) {
      return res.status(401).json({ error: 'Invalid phone or PIN' });
    }
    const session = await createSession({
      type: 'CUSTOMER',
      customerId: customer.id,
      deviceFingerprint,
    });
    res.json({
      token: session.token,
      customer: {
        id: customer.id,
        customerCode: customer.customerCode,
        name: customer.name,
        phone: customer.phone,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', requireCustomer, async (req, res) => {
  res.json({ customer: req.customer });
});

router.post('/logout', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      const payload = jwt.verify(header.slice(7), config.jwtSecret);
      if (payload.sessionToken) {
        await prisma.session.deleteMany({ where: { token: payload.sessionToken } });
      }
    }
    res.json({ ok: true });
  } catch {
    res.json({ ok: true });
  }
});

export default router;
