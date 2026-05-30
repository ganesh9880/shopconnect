import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

export const config = {
  port: Number(process.env.PORT) || 3001,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtAdminExpires: process.env.JWT_ADMIN_EXPIRES || '8h',
  customerSessionDays: Number(process.env.CUSTOMER_SESSION_DAYS) || 365,
  uploadDir: path.resolve(rootDir, process.env.UPLOAD_DIR || 'uploads'),
  shopWhatsapp: process.env.SHOP_WHATSAPP || '',
  shopUpiId: process.env.SHOP_UPI_ID || '',
  shopName: process.env.SHOP_NAME || 'Sri Lakshmi Vastralayam',
};
