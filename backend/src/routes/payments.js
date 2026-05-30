import { Router } from 'express';
import { prisma } from '../db.js';
import { config } from '../config.js';
import { requireAdmin, requireCustomer } from '../middleware/auth.js';
import { paymentScreenshotUpload } from '../middleware/upload.js';
import { storeImage } from '../services/imageService.js';
import { resolveMediaUrl } from '../utils/mediaUrl.js';
import {
  approvePaymentRequest,
  rejectPaymentRequest,
} from '../services/paymentService.js';
import { normalizeWhatsAppNumber, whatsAppMeUrl } from '../utils/whatsapp.js';

const router = Router();

function enrichPayment(request) {
  return {
    ...request,
    screenshotUrl: resolveMediaUrl(request.screenshotPath),
  };
}

router.get('/shop-info', async (_req, res) => {
  try {
    const shop = await prisma.shopConfig.findUnique({ where: { id: 'default' } });
    res.json({
      shopName: shop?.shopName || config.shopName,
      upiId: shop?.upiId || config.shopUpiId,
      upiQrUrl: resolveMediaUrl(shop?.upiQrPath),
      whatsapp: shop?.whatsapp || config.shopWhatsapp || '',
      whatsappConfigured: Boolean(
        normalizeWhatsAppNumber(shop?.whatsapp || config.shopWhatsapp),
      ),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my', requireCustomer, async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({ where: { id: req.customer.id } });
    const requests = await prisma.paymentRequest.findMany({
      where: { customerId: req.customer.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({
      outstandingAmount: customer.outstandingBalance,
      requests: requests.map(enrichPayment),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post(
  '/submit',
  requireCustomer,
  paymentScreenshotUpload.single('screenshot'),
  async (req, res) => {
    try {
      const { amount, transactionRef } = req.body;
      let screenshotPath = null;
      if (req.file) {
        screenshotPath = await storeImage(req.file, 'payments');
      }

      const request = await prisma.paymentRequest.create({
        data: {
          customerId: req.customer.id,
          amount: Number(amount),
          transactionRef: transactionRef || null,
          screenshotPath,
        },
      });

      const shop = await prisma.shopConfig.findUnique({ where: { id: 'default' } });
      const shopPhone = shop?.whatsapp || config.shopWhatsapp;
      const whatsappUrl = whatsAppMeUrl(
        shopPhone,
        `Payment Proof Submitted\nCustomer: ${req.customer.name}\nID: ${req.customer.customerCode}\nAmount: ₹${amount}`,
      );

      res.status(201).json({
        request: enrichPayment(request),
        whatsappNotificationUrl: whatsappUrl,
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
);

router.get('/pending', requireAdmin, async (_req, res) => {
  try {
    const requests = await prisma.paymentRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, customerCode: true, phone: true } },
      },
    });
    res.json(requests.map(enrichPayment));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};
    const requests = await prisma.paymentRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { customer: true },
    });
    res.json(requests.map(enrichPayment));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/approve', requireAdmin, async (req, res) => {
  try {
    const updated = await approvePaymentRequest(req.params.id);
    res.json(enrichPayment(updated));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/reject', requireAdmin, async (req, res) => {
  try {
    const updated = await rejectPaymentRequest(req.params.id, req.body.rejectionReason);
    res.json(enrichPayment(updated));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
