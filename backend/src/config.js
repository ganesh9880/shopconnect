import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.join(__dirname, '..');

// Always load backend/.env (not project root) when cwd differs
dotenv.config({ path: path.join(backendRoot, '.env') });

function env(name) {
  const value = process.env[name];
  return typeof value === 'string' ? value.trim() : '';
}

/** Allow local / LAN dev origins (any port: 5173, 5175, etc.) */
export function isAllowedDevOrigin(origin) {
  if (!origin) return true;
  return /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3})(:\d+)?$/i.test(
    origin,
  );
}

function parseCorsOrigins() {
  const list = [];
  const frontend = env('FRONTEND_URL');
  if (frontend) list.push(frontend);
  if (process.env.CORS_ORIGINS) {
    list.push(
      ...process.env.CORS_ORIGINS.split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    );
  }
  if (env('NODE_ENV') !== 'production') {
    list.push(
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5175',
      'http://127.0.0.1:5175',
    );
  }
  return [...new Set(list)];
}

export const config = {
  port: Number(process.env.PORT) || 3001,
  nodeEnv: env('NODE_ENV') || 'development',
  jwtSecret: env('JWT_SECRET') || 'dev-secret-change-in-production',
  jwtAdminExpires: env('JWT_ADMIN_EXPIRES') || '8h',
  customerSessionDays: Number(process.env.CUSTOMER_SESSION_DAYS) || 365,
  frontendUrl: (env('FRONTEND_URL') || 'http://localhost:5173').replace(/\/$/, ''),
  corsOrigins: parseCorsOrigins(),
  shopWhatsapp: env('SHOP_WHATSAPP'),
  shopUpiId: env('SHOP_UPI_ID'),
  shopName: env('SHOP_NAME') || 'Sri Lakshmi Vastralayam',
  cloudinary: {
    cloudName: env('CLOUDINARY_CLOUD_NAME'),
    apiKey: env('CLOUDINARY_API_KEY'),
    apiSecret: env('CLOUDINARY_API_SECRET'),
    folder: env('CLOUDINARY_FOLDER') || 'vastralayam',
  },
};

export function cloudinaryConfigStatus() {
  return {
    cloudName: Boolean(config.cloudinary.cloudName),
    apiKey: Boolean(config.cloudinary.apiKey),
    apiSecret: Boolean(config.cloudinary.apiSecret),
    enabled:
      Boolean(config.cloudinary.cloudName) &&
      Boolean(config.cloudinary.apiKey) &&
      Boolean(config.cloudinary.apiSecret),
    envFile: path.join(backendRoot, '.env'),
  };
}
