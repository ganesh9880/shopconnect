import { prisma } from '../db.js';
import { addLedgerEntry } from './ledgerService.js';
import { syncProductStatus } from '../utils/productStatus.js';

export async function createSale({ customerId, items, discount = 0, saleDate }) {
  if (!items?.length) throw new Error('At least one item is required');

  const sale = await prisma.$transaction(async (tx) => {
    let total = 0;
    const lineItems = [];

    for (const item of items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      if (product.stockQuantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      const unitPrice = item.unitPrice ?? product.sellingPrice;
      const lineDiscount = item.discount ?? 0;
      const lineTotal = unitPrice * item.quantity - lineDiscount;
      total += lineTotal;

      await tx.product.update({
        where: { id: product.id },
        data: { stockQuantity: product.stockQuantity - item.quantity },
      });

      lineItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice,
        discount: lineDiscount,
        lineTotal,
      });
    }

    total -= discount;

    const sale = await tx.sale.create({
      data: {
        customerId,
        total,
        discount,
        saleDate: saleDate ? new Date(saleDate) : new Date(),
        items: { create: lineItems },
      },
      include: { items: { include: { product: true } }, customer: true },
    });

    await tx.customer.update({
      where: { id: customerId },
      data: { lastPurchaseAt: sale.saleDate },
    });

    return sale;
  });

  await addLedgerEntry(customerId, {
    debit: sale.total,
    credit: 0,
    description: `Sale #${sale.id.slice(-6)}`,
    entryDate: sale.saleDate,
  });

  for (const li of sale.items) {
    await syncProductStatus(prisma, li.productId);
  }

  return sale;
}
