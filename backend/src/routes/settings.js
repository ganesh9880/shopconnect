import { Router } from 'express';
import path from 'path';
import { prisma } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { upiQrUpload } from '../middleware/upload.js';

const router = Router();

router.get('/', requireAdmin, async (_req, res) => {
  try {
    const shop = await prisma.shopConfig.findUnique({ where: { id: 'default' } });
    res.json(shop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', requireAdmin, upiQrUpload.single('upiQr'), async (req, res) => {
  try {
    const { shopName, tagline, whatsapp, upiId } = req.body;
    const data = {};
    if (shopName != null) data.shopName = shopName;
    if (tagline != null) data.tagline = tagline;
    if (whatsapp != null) data.whatsapp = whatsapp;
    if (upiId != null) data.upiId = upiId;
    if (req.file) {
      data.upiQrPath = path.join('shop', path.basename(req.file.path)).replace(/\\/g, '/');
    }
    const shop = await prisma.shopConfig.upsert({
      where: { id: 'default' },
      update: data,
      create: { id: 'default', ...data },
    });
    res.json({
      ...shop,
      upiQrUrl: shop.upiQrPath ? `/uploads/${shop.upiQrPath}` : null,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
