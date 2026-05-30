import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export async function compressProductImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.webp') return filePath;

  const outPath = filePath.replace(/\.(jpe?g|png)$/i, '.webp');
  await sharp(filePath)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(outPath);

  if (outPath !== filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  return outPath;
}
