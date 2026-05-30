import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAdmin, async (_req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      totalCustomers,
      totalProducts,
      monthlySales,
      outstandingAgg,
      lowStock,
      pendingPayments,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.product.count({ where: { status: { not: 'ARCHIVED' } } }),
      prisma.sale.aggregate({
        _sum: { total: true },
        where: { saleDate: { gte: startOfMonth } },
      }),
      prisma.customer.aggregate({ _sum: { outstandingBalance: true } }),
      prisma.product.findMany({
        where: { status: 'LOW_STOCK' },
        take: 10,
      }),
      prisma.paymentRequest.count({ where: { status: 'PENDING' } }),
    ]);

    res.json({
      totalCustomers,
      totalProducts,
      monthlySales: monthlySales._sum.total || 0,
      totalOutstanding: outstandingAgg._sum.outstandingBalance || 0,
      lowStockProducts: lowStock,
      pendingPaymentRequests: pendingPayments,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
