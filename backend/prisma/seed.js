import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

if (!process.env.DATABASE_URL?.trim()) {
  console.error(
    'DATABASE_URL is missing. Set it in backend/.env or run: $env:DATABASE_URL="your-neon-url"',
  );
  process.exit(1);
}

const prisma = new PrismaClient();

const CATEGORIES = [
  'Sarees',
  'Dress Materials',
  'Nighties',
  'Leggings',
  'Kids Wear',
  'Seasonal Collections',
];

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.adminUser.upsert({
    where: { username: 'owner' },
    update: {},
    create: { username: 'owner', passwordHash, role: 'SHOP_OWNER' },
  });
  await prisma.adminUser.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: { username: 'superadmin', passwordHash, role: 'SUPER_ADMIN' },
  });

  await prisma.shopConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      shopName: 'Sri Lakshmi Vastralayam',
      tagline: 'Where Trust Meets Tradition',
      whatsapp: '',
      upiId: 'father@upi',
    },
  });

  const sampleProducts = [
    {
      code: 'SAR001',
      name: 'Kanjivaram Silk Saree',
      category: 'Sarees',
      sellingPrice: 4500,
      costPrice: 3200,
      stockQuantity: 12,
      isNewArrival: true,
      isBestSeller: true,
    },
    {
      code: 'DM001',
      name: 'Cotton Dress Material',
      category: 'Dress Materials',
      sellingPrice: 850,
      costPrice: 550,
      stockQuantity: 25,
      isBestSeller: true,
    },
    {
      code: 'NG001',
      name: 'Printed Nightie',
      category: 'Nighties',
      sellingPrice: 450,
      costPrice: 280,
      stockQuantity: 3,
    },
  ];

  for (const p of sampleProducts) {
    await prisma.product.upsert({
      where: { code: p.code },
      update: {},
      create: {
        ...p,
        description: `${p.name} — premium quality from Sri Lakshmi Vastralayam.`,
        status: p.stockQuantity <= 5 ? 'LOW_STOCK' : 'AVAILABLE',
      },
    });
  }

  console.log('Seed complete.');
  console.log('Admin login: owner / admin123');
  console.log('Categories:', CATEGORIES.join(', '));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
