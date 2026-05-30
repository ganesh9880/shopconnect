import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import customerRoutes from './routes/customers.js';
import ledgerRoutes from './routes/ledger.js';
import salesRoutes from './routes/sales.js';
import paymentRoutes from './routes/payments.js';
import dashboardRoutes from './routes/dashboard.js';
import inventoryRoutes from './routes/inventory.js';
import settingsRoutes from './routes/settings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
const frontendDist = path.join(__dirname, '../../frontend/dist');

const app = express();

if (!isProd) {
  app.use(cors({ origin: true, credentials: true }));
} else {
  app.use(cors({ origin: false }));
}

app.use(express.json());
app.use('/uploads', express.static(config.uploadDir));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, shop: config.shopName, env: isProd ? 'production' : 'development' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/settings', settingsRoutes);

if (isProd) {
  app.use(express.static(frontendDist, { maxAge: '1d', index: false }));
  app.get(/^(?!\/api|\/uploads).*/, (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

export default app;
