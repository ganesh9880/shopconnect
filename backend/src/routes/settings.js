import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { upiQrUpload } from '../middleware/upload.js';
import { storeImage } from '../services/imageService.js';
import { resolveMediaUrl } from '../utils/mediaUrl.js';

const router = Router();

function shopResponse(shop) {
  return {
    ...shop,
    upiQrUrl: resolveMediaUrl(shop?.upiQrPath),
  };
}

router.get('/', requireAdmin, async (_req, res) => {
  try {
    const shop = await prisma.shopConfig.findUnique({ where: { id: 'default' } });
    res.json(shopResponse(shop));
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
      data.upiQrPath = await storeImage(req.file, 'shop');
    }
    const shop = await prisma.shopConfig.upsert({
      where: { id: 'default' },
      update: data,
      create: { id: 'default', ...data },
    });
    res.json(shopResponse(shop));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
