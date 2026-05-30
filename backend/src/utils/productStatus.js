export function computeProductStatus(product) {
  if (product.status === 'ARCHIVED') return 'ARCHIVED';
  if (product.stockQuantity <= 0) return 'OUT_OF_STOCK';
  if (product.stockQuantity <= product.lowStockThreshold) return 'LOW_STOCK';
  return 'AVAILABLE';
}

export async function syncProductStatus(db, productId) {
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return;
  const status = computeProductStatus(product);
  if (product.status !== status && product.status !== 'ARCHIVED') {
    await db.product.update({
      where: { id: productId },
      data: { status },
    });
  }
}
