/**
 * Resolve stored media reference to a public URL.
 * Production: full Cloudinary HTTPS URL in DB.
 * Legacy dev: relative path under /uploads/
 */
export function resolveMediaUrl(stored) {
  if (!stored) return null;
  const value = String(stored).replace(/\\/g, '/');
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  if (value.startsWith('/')) return value;
  return `/uploads/${value}`;
}
