import { copyFileSync, existsSync } from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/** Render/static hosts: serve SPA for deep links like /activate/:token */
function spa404Fallback() {
  return {
    name: 'spa-404-fallback',
    closeBundle() {
      const dist = path.resolve('dist');
      const index = path.join(dist, 'index.html');
      const notFound = path.join(dist, '404.html');
      if (existsSync(index)) copyFileSync(index, notFound);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), spa404Fallback()],
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
