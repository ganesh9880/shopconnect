import fs from 'fs';
import app from './app.js';
import { config } from './config.js';

if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

app.listen(config.port, () => {
  console.log(`Sri Lakshmi Vastralayam API running on http://localhost:${config.port}`);
});
