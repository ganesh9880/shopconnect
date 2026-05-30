import { uploadImageBuffer } from './cloudinaryService.js';

/** Upload product/payment/shop image; returns public URL stored in DB. */
export async function storeImage(file, folder) {
  if (!file?.buffer?.length) {
    throw new Error('No image data received');
  }
  return uploadImageBuffer(file.buffer, folder);
}
