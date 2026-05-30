import app from './app.js';
import { config, cloudinaryConfigStatus } from './config.js';

app.listen(config.port, '0.0.0.0', () => {
  const c = cloudinaryConfigStatus();
  console.log(`Sri Lakshmi Vastralayam API on port ${config.port} (${config.nodeEnv})`);
  console.log('[CORS] allowed origins:', config.corsOrigins.join(', ') || '(none)');
  if (!process.env.FRONTEND_URL?.trim()) {
    console.warn('[CORS] FRONTEND_URL is not set — browser calls from your static site will be blocked');
  }
  if (!c.enabled) {
    console.warn(
      '[Cloudinary] NOT configured — add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to backend/.env',
    );
  } else {
    console.log('[Cloudinary] OK —', config.cloudinary.cloudName);
  }
});
