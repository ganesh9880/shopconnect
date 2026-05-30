import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { createSale } from '../services/saleService.js';

const router = Router();

router.get('/', requireAdmin, async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: { saleDate: 'desc' },
      include: {
        customer: { select: { id: true, name: true, customerCode: true } },
        items: { include: { product: true } },
      },
    });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { customerId, items, discount, saleDate } = req.body;
    const sale = await createSale({ customerId, items, discount, saleDate });
    res.status(201).json(sale);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
