import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/summary', requireAdmin, async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { status: { not: 'ARCHIVED' } },
    });
    const stockSummary = products.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      stockQuantity: p.stockQuantity,
      status: p.status,
    }));
    const inventoryValue = products.reduce(
      (sum, p) => sum + p.costPrice * p.stockQuantity,
      0,
    );
    const alerts = {
      lowStock: products.filter((p) => p.status === 'LOW_STOCK'),
      outOfStock: products.filter((p) => p.status === 'OUT_OF_STOCK'),
    };
    res.json({ stockSummary, inventoryValue, alerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
