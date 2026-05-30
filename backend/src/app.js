import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { config, cloudinaryConfigStatus, frontendDistPath, isAllowedDevOrigin } from './config.js';
import { isCloudinaryEnabled } from './services/cloudinaryService.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import customerRoutes from './routes/customers.js';
import ledgerRoutes from './routes/ledger.js';
import salesRoutes from './routes/sales.js';
import paymentRoutes from './routes/payments.js';
import dashboardRoutes from './routes/dashboard.js';
import inventoryRoutes from './routes/inventory.js';
import settingsRoutes from './routes/settings.js';

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        config.corsOrigins.includes(origin) ||
        (config.nodeEnv !== 'production' && isAllowedDevOrigin(origin))
      ) {
        return callback(null, true);
      }
      console.warn('CORS blocked origin:', origin);
      return callback(null, false);
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  const cloudinary = cloudinaryConfigStatus();
  res.json({
    ok: true,
    shop: config.shopName,
    env: config.nodeEnv,
    frontendUrl: config.frontendUrl,
    corsOrigins: config.corsOrigins,
    storage: 'cloudinary',
    cloudinary: {
      ...cloudinary,
      ready: isCloudinaryEnabled(),
    },
  });
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

function sendSpaIndex(res) {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
}

/** Activation links must open the React app, not API JSON or host 404 */
app.get('/activate/:token', (req, res, next) => {
  if (config.serveFrontend && fs.existsSync(frontendDistPath)) {
    return sendSpaIndex(res);
  }
  const base = config.frontendUrl?.replace(/\/$/, '');
  if (base && !base.includes('localhost')) {
    return res.redirect(302, `${base}/activate/${req.params.token}`);
  }
  next();
});

if (config.serveFrontend && fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath, { index: false }));
  app.get(/^(?!\/api).*/, (_req, res) => {
    sendSpaIndex(res);
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

export default app;
