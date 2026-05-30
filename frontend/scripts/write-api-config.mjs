import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const apiUrl = (process.env.VITE_API_URL || '').trim().replace(/\/$/, '');

writeFileSync(
  path.join(root, 'public', 'config.json'),
  JSON.stringify({ apiUrl }, null, 2),
  'utf8',
);

if (!apiUrl && process.env.NODE_ENV === 'production') {
  console.warn(
    '[build] VITE_API_URL is empty — set it on Render Static Site env, then redeploy.',
  );
} else {
  console.log('[build] API URL for frontend:', apiUrl || '(dev proxy /api)');
}
