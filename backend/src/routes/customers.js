import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../db.js';
import { requireAdmin, requireCustomer } from '../middleware/auth.js';
import { nextCustomerCode } from '../utils/customerCode.js';
import { getLedgerSummary } from '../services/ledgerService.js';
import { addLedgerEntry } from '../services/ledgerService.js';
import { config } from '../config.js';

const router = Router();

function activationPayload(customer) {
  const base = config.frontendUrl;
  return {
    activationLink: customer.activationToken
      ? `${base}/activate/${customer.activationToken}`
      : null,
    activationCode: customer.activationCode,
  };
}

router.get('/', requireAdmin, async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({ orderBy: { customerCode: 'asc' } });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, phone, address, preferredCategory, notes, openingBalance } = req.body;
    const customerCode = await nextCustomerCode(prisma);
    const activationToken = uuidv4();
    const activationCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    const balance = Number(openingBalance) || 0;

    const customer = await prisma.customer.create({
      data: {
        customerCode,
        name,
        phone,
        address,
        preferredCategory,
        notes,
        openingBalance: balance,
        outstandingBalance: 0,
        activationToken,
        activationCode,
      },
    });

    if (balance > 0) {
      await addLedgerEntry(customer.id, {
        debit: balance,
        credit: 0,
        description: 'Opening balance (migration)',
      });
    }

    res.status(201).json({ ...customer, ...activationPayload(customer) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/import', requireAdmin, async (req, res) => {
  try {
    const { customers: rows } = req.body;
    if (!Array.isArray(rows)) return res.status(400).json({ error: 'customers array required' });

    const created = [];
    for (const row of rows) {
      const customerCode = row.customerCode || (await nextCustomerCode(prisma));
      const activationToken = uuidv4();
      const activationCode = Math.random().toString(36).slice(2, 8).toUpperCase();
      const balance = Number(row.outstandingBalance ?? row.openingBalance) || 0;

      const customer = await prisma.customer.create({
        data: {
          customerCode,
          name: row.name,
          phone: row.phone,
          address: row.address,
          openingBalance: balance,
          outstandingBalance: 0,
          activationToken,
          activationCode,
        },
      });

      if (balance > 0) {
        await addLedgerEntry(customer.id, {
          debit: balance,
          credit: 0,
          description: 'Opening balance (import)',
        });
      }
      created.push({ ...customer, ...activationPayload(customer) });
    }
    res.status(201).json({ imported: created.length, customers: created });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/dashboard/me', requireCustomer, async (req, res) => {
  try {
    const customer = req.customer;
    const [sales, payments, newArrivals, ledger] = await Promise.all([
      prisma.sale.findMany({
        where: { customerId: customer.id },
        orderBy: { saleDate: 'desc' },
        take: 10,
        include: { items: { include: { product: true } } },
      }),
      prisma.paymentRequest.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.product.findMany({
        where: { isNewArrival: true, status: { not: 'ARCHIVED' } },
        take: 8,
        include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
      }),
      getLedgerSummary(customer.id),
    ]);

    res.json({
      welcome: customer.name,
      outstandingBalance: customer.outstandingBalance,
      recentPurchases: sales.slice(0, 5),
      purchaseHistory: sales,
      paymentHistory: payments,
      newArrivals,
      ledgerSummary: {
        openingBalance: ledger.openingBalance,
        totalDebits: ledger.totalDebits,
        totalCredits: ledger.totalCredits,
        currentOutstanding: ledger.currentOutstanding,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({ where: { id: req.params.id } });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const [sales, payments, ledger] = await Promise.all([
      prisma.sale.findMany({
        where: { customerId: customer.id },
        orderBy: { saleDate: 'desc' },
        take: 20,
        include: { items: { include: { product: true } } },
      }),
      prisma.paymentRequest.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: 'desc' },
      }),
      getLedgerSummary(customer.id),
    ]);

    const totalPurchases = sales.reduce((s, sale) => s + sale.total, 0);

    res.json({
      customer,
      ...activationPayload(customer),
      totalPurchases,
      lastPurchaseDate: customer.lastPurchaseAt,
      sales,
      payments,
      ledger,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, phone, address, preferredCategory, notes } = req.body;
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: { name, phone, address, preferredCategory, notes },
    });
    res.json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/regenerate-activation', requireAdmin, async (req, res) => {
  try {
    const activationToken = uuidv4();
    const activationCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: { activationToken, activationCode, isActivated: false, pinHash: null },
    });
    res.json({ ...customer, ...activationPayload(customer) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
