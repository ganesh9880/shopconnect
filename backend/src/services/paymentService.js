import { prisma } from '../db.js';
import { addLedgerEntry } from './ledgerService.js';

export async function approvePaymentRequest(requestId) {
  const request = await prisma.paymentRequest.findUnique({
    where: { id: requestId },
    include: { customer: true },
  });
  if (!request) throw new Error('Payment request not found');
  if (request.status !== 'PENDING') throw new Error('Request already processed');

  await addLedgerEntry(request.customerId, {
    debit: 0,
    credit: request.amount,
    description: `Payment approved${request.transactionRef ? ` — Ref: ${request.transactionRef}` : ''}`,
  });

  return prisma.paymentRequest.update({
    where: { id: requestId },
    data: { status: 'APPROVED', reviewedAt: new Date() },
    include: { customer: true },
  });
}

export async function rejectPaymentRequest(requestId, rejectionReason) {
  const request = await prisma.paymentRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new Error('Payment request not found');
  if (request.status !== 'PENDING') throw new Error('Request already processed');

  return prisma.paymentRequest.update({
    where: { id: requestId },
    data: {
      status: 'REJECTED',
      rejectionReason: rejectionReason || null,
      reviewedAt: new Date(),
    },
    include: { customer: true },
  });
}
