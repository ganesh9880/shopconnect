import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config.js';

let configured = false;

export function isCloudinaryEnabled() {
  return Boolean(
    config.cloudinary.cloudName &&
      config.cloudinary.apiKey &&
      config.cloudinary.apiSecret,
  );
}

function ensureConfigured() {
  if (!isCloudinaryEnabled()) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
    );
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
      secure: true,
    });
    configured = true;
  }
}

/**
 * Upload image buffer to Cloudinary.
 * @param {Buffer} buffer
 * @param {'products'|'payments'|'shop'} folder
 * @returns {Promise<string>} secure_url
 */
export function uploadImageBuffer(buffer, folder) {
  ensureConfigured();
  const folderPath = `${config.cloudinary.folder}/${folder}`;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folderPath,
        resource_type: 'image',
        transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto:good' }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}

/** Best-effort delete when removing product images (optional). */
export async function deleteByUrl(url) {
  if (!url || !isCloudinaryEnabled()) return;
  try {
    ensureConfigured();
    const publicId = extractPublicId(url);
    if (publicId) await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn('Cloudinary delete skipped:', err.message);
  }
}

function extractPublicId(url) {
  try {
    const u = new URL(url);
    if (!u.hostname.includes('cloudinary.com')) return null;
    const parts = u.pathname.split('/');
    const uploadIdx = parts.indexOf('upload');
    if (uploadIdx === -1) return null;
    let rest = parts.slice(uploadIdx + 1);
    if (rest[0]?.startsWith('v')) rest = rest.slice(1);
    const last = rest.pop();
    if (!last) return null;
    const base = last.replace(/\.[a-zA-Z0-9]+$/, '');
    return [...rest, base].join('/');
  } catch {
    return null;
  }
}
