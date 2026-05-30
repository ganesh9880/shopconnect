import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config.js';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function storage(subfolder) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = path.join(config.uploadDir, subfolder);
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, name);
    },
  });
}

const imageFilter = (_req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Only JPG, PNG, and WEBP images are allowed'));
};

export const productImagesUpload = multer({
  storage: storage('products'),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: imageFilter,
});

export const paymentScreenshotUpload = multer({
  storage: storage('payments'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
});

export const upiQrUpload = multer({
  storage: storage('shop'),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFilter,
});
