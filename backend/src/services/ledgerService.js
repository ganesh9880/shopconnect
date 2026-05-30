import { prisma } from '../db.js';

export async function addLedgerEntry(customerId, { debit = 0, credit = 0, description, entryDate }) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw new Error('Customer not found');

  const entry = await prisma.ledgerEntry.create({
    data: {
      customerId,
      debit,
      credit,
      description,
      entryDate: entryDate ? new Date(entryDate) : new Date(),
    },
  });

  const newOutstanding = customer.outstandingBalance + debit - credit;
  await prisma.customer.update({
    where: { id: customerId },
    data: { outstandingBalance: Math.max(0, newOutstanding) },
  });

  return entry;
}

export async function getLedgerSummary(customerId) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw new Error('Customer not found');

  const entries = await prisma.ledgerEntry.findMany({
    where: { customerId },
    orderBy: { entryDate: 'asc' },
  });

  const totalDebits = entries.reduce((s, e) => s + e.debit, 0);
  const totalCredits = entries.reduce((s, e) => s + e.credit, 0);

  return {
    openingBalance: customer.openingBalance,
    totalDebits,
    totalCredits,
    currentOutstanding: customer.outstandingBalance,
    entries,
  };
}
