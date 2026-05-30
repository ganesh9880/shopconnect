import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { productImagesUpload } from '../middleware/upload.js';
import { storeImage } from '../services/imageService.js';
import { deleteByUrl } from '../services/cloudinaryService.js';
import { resolveMediaUrl } from '../utils/mediaUrl.js';
import { computeProductStatus, syncProductStatus } from '../utils/productStatus.js';

const router = Router();

function productWithUrls(_req, product) {
  return {
    ...product,
    images: product.images?.map((img) => ({
      ...img,
      url: resolveMediaUrl(img.path),
    })),
    computedStatus: computeProductStatus(product),
  };
}

router.get('/public', async (req, res) => {
  try {
    const { search, category, newArrivals, bestSellers } = req.query;
    const where = { status: { not: 'ARCHIVED' } };
    if (category) where.category = category;
    if (newArrivals === 'true') where.isNewArrival = true;
    if (bestSellers === 'true') where.isBestSeller = true;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    const products = await prisma.product.findMany({
      where,
      include: { images: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products.map((p) => productWithUrls(req, p)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/public/:code', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { code: req.params.code },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!product || product.status === 'ARCHIVED') {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(productWithUrls(req, product));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(productWithUrls(req, product));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', requireAdmin, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { images: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products.map((p) => productWithUrls(req, p)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const {
      code,
      name,
      category,
      subcategory,
      sellingPrice,
      costPrice,
      stockQuantity,
      description,
      isNewArrival,
      isBestSeller,
      lowStockThreshold,
    } = req.body;
    const product = await prisma.product.create({
      data: {
        code,
        name,
        category,
        subcategory,
        sellingPrice: Number(sellingPrice),
        costPrice: Number(costPrice),
        stockQuantity: Number(stockQuantity) || 0,
        description,
        isNewArrival: Boolean(isNewArrival),
        isBestSeller: Boolean(isBestSeller),
        lowStockThreshold: Number(lowStockThreshold) || 5,
      },
    });
    await syncProductStatus(prisma, product.id);
    const updated = await prisma.product.findUnique({
      where: { id: product.id },
      include: { images: true },
    });
    res.status(201).json(productWithUrls(req, updated));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PRODUCT_FIELDS = [
  'code',
  'name',
  'category',
  'subcategory',
  'sellingPrice',
  'costPrice',
  'stockQuantity',
  'description',
  'isNewArrival',
  'isBestSeller',
  'lowStockThreshold',
  'status',
];

function pickProductData(body) {
  const data = {};
  for (const key of PRODUCT_FIELDS) {
    if (body[key] === undefined) continue;
    if (key === 'sellingPrice' || key === 'costPrice') data[key] = Number(body[key]);
    else if (key === 'stockQuantity' || key === 'lowStockThreshold') data[key] = Number(body[key]);
    else if (key === 'isNewArrival' || key === 'isBestSeller') data[key] = Boolean(body[key]);
    else data[key] = body[key];
  }
  if (data.status && data.status !== 'ARCHIVED') delete data.status;
  return data;
}

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const data = pickProductData(req.body);
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });
    if (product.status !== 'ARCHIVED') await syncProductStatus(prisma, product.id);
    const updated = await prisma.product.findUnique({
      where: { id: product.id },
      include: { images: true },
    });
    res.json(productWithUrls(req, updated));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post(
  '/:id/images',
  requireAdmin,
  productImagesUpload.array('images', 5),
  async (req, res) => {
    try {
      const product = await prisma.product.findUnique({
        where: { id: req.params.id },
        include: { images: true },
      });
      if (!product) return res.status(404).json({ error: 'Product not found' });
      if (product.images.length + (req.files?.length || 0) > 5) {
        return res.status(400).json({ error: 'Maximum 5 images per product' });
      }
      for (let i = 0; i < (req.files?.length || 0); i++) {
        const file = req.files[i];
        const url = await storeImage(file, 'products');
        await prisma.productImage.create({
          data: {
            productId: product.id,
            path: url,
            sortOrder: product.images.length + i,
          },
        });
      }
      const updated = await prisma.product.findUnique({
        where: { id: product.id },
        include: { images: { orderBy: { sortOrder: 'asc' } } },
      });
      res.status(201).json(productWithUrls(req, updated));
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
);

router.delete('/:id/images/:imageId', requireAdmin, async (req, res) => {
  try {
    const image = await prisma.productImage.findFirst({
      where: { id: req.params.imageId, productId: req.params.id },
    });
    if (!image) return res.status(404).json({ error: 'Image not found' });
    await deleteByUrl(image.path);
    await prisma.productImage.delete({ where: { id: image.id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
