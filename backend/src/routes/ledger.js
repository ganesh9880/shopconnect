import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAdmin, requireCustomer } from '../middleware/auth.js';
import { addLedgerEntry, getLedgerSummary } from '../services/ledgerService.js';

const router = Router();

router.get('/outstanding', requireAdmin, async (_req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      where: { outstandingBalance: { gt: 0 } },
      orderBy: { outstandingBalance: 'desc' },
    });
    const entries = await prisma.ledgerEntry.findMany({
      where: { credit: { gt: 0 } },
      orderBy: { entryDate: 'desc' },
    });
    const lastCreditByCustomer = {};
    for (const e of entries) {
      if (!lastCreditByCustomer[e.customerId]) {
        lastCreditByCustomer[e.customerId] = e.entryDate;
      }
    }
    const now = Date.now();
    const report = customers.map((c) => {
      const lastActivity = lastCreditByCustomer[c.id] || c.createdAt;
      const dueDays = Math.floor((now - new Date(lastActivity).getTime()) / 86400000);
      return {
        customerId: c.id,
        customerCode: c.customerCode,
        customerName: c.name,
        phone: c.phone,
        outstandingAmount: c.outstandingBalance,
        dueDays,
      };
    });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/customer/:customerId', requireAdmin, async (req, res) => {
  try {
    const summary = await getLedgerSummary(req.params.customerId);
    res.json(summary);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/my', requireCustomer, async (req, res) => {
  try {
    const summary = await getLedgerSummary(req.customer.id);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { customerId, debit, credit, description, entryDate } = req.body;
    const entry = await addLedgerEntry(customerId, {
      debit: Number(debit) || 0,
      credit: Number(credit) || 0,
      description,
      entryDate,
    });
    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
