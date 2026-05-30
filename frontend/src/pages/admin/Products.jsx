import { useCallback, useEffect, useState } from 'react';
import { api, apiForm } from '../../api/client';
import { PRODUCT_CATEGORIES } from '../../constants';
import {
  Alert,
  Btn,
  Card,
  Field,
  Input,
  Modal,
  PageHeader,
  Select,
  Textarea,
  formatMoney,
  TableWrap,
} from '../../components/admin/ui';

const emptyForm = () => ({
  code: '',
  name: '',
  category: PRODUCT_CATEGORIES[0],
  subcategory: '',
  sellingPrice: '',
  costPrice: '',
  stockQuantity: '0',
  description: '',
  isNewArrival: false,
  isBestSeller: false,
  lowStockThreshold: '5',
  archive: false,
});

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api('/products')
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setImageFiles([]);
    setError('');
    setModalOpen(true);
  }

  function openEdit(product) {
    setEditing(product);
    setForm({
      code: product.code,
      name: product.name,
      category: product.category,
      subcategory: product.subcategory || '',
      sellingPrice: String(product.sellingPrice),
      costPrice: String(product.costPrice),
      stockQuantity: String(product.stockQuantity),
      description: product.description || '',
      isNewArrival: product.isNewArrival,
      isBestSeller: product.isBestSeller,
      lowStockThreshold: String(product.lowStockThreshold ?? 5),
      archive: product.status === 'ARCHIVED',
    });
    setImageFiles([]);
    setError('');
    setModalOpen(true);
  }

  async function saveProduct(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const body = {
        code: form.code.trim(),
        name: form.name.trim(),
        category: form.category,
        subcategory: form.subcategory || null,
        sellingPrice: Number(form.sellingPrice),
        costPrice: Number(form.costPrice),
        stockQuantity: Number(form.stockQuantity),
        description: form.description,
        isNewArrival: form.isNewArrival,
        isBestSeller: form.isBestSeller,
        lowStockThreshold: Number(form.lowStockThreshold) || 5,
      };
      if (form.archive) body.status = 'ARCHIVED';

      let product;
      if (editing) {
        product = await api(`/products/${editing.id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
      } else {
        product = await api('/products', { method: 'POST', body: JSON.stringify(body) });
      }

      if (imageFiles.length) {
        const fd = new FormData();
        imageFiles.forEach((f) => fd.append('images', f));
        await apiForm(`/products/${product.id}/images`, fd);
      }

      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function uploadMoreImages() {
    if (!editing || !imageFiles.length) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      imageFiles.forEach((f) => fd.append('images', f));
      const updated = await apiForm(`/products/${editing.id}/images`, fd);
      setEditing(updated);
      setImageFiles([]);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function deleteImage(imageId) {
    if (!editing || !confirm('Remove this image?')) return;
    try {
      await api(`/products/${editing.id}/images/${imageId}`, { method: 'DELETE' });
      const refreshed = await api(`/products/${editing.id}`);
      setEditing(refreshed);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const imageCount = editing?.images?.length ?? 0;
  const canAddImages = editing && imageCount < 5;

  return (
    <div>
      <PageHeader title="Products">
        <Btn onClick={openCreate}>+ Add Product</Btn>
      </PageHeader>

      {error && !modalOpen && <Alert type="error">{error}</Alert>}

      <Card className="p-0 sm:p-0 overflow-hidden">
        {loading ? (
          <p className="p-4 text-stone-500">Loading...</p>
        ) : (
          <TableWrap>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-stone-50 text-left">
                <th className="p-2 w-14" />
                <th className="p-2">Code</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b hover:bg-stone-50">
                  <td className="p-2">
                    {p.images?.[0]?.url ? (
                      <img
                        src={p.images[0].url}
                        alt=""
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <span className="w-10 h-10 bg-stone-200 rounded block" />
                    )}
                  </td>
                  <td className="p-2 font-mono text-xs">{p.code}</td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{formatMoney(p.sellingPrice)}</td>
                  <td>{p.stockQuantity}</td>
                  <td>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        p.status === 'ARCHIVED'
                          ? 'bg-stone-200'
                          : p.computedStatus === 'OUT_OF_STOCK'
                            ? 'bg-red-100 text-red-800'
                            : p.computedStatus === 'LOW_STOCK'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {p.computedStatus || p.status}
                    </span>
                  </td>
                  <td className="p-2">
                    <Btn variant="secondary" onClick={() => openEdit(p)}>
                      Edit
                    </Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </TableWrap>
        )}
        {!loading && products.length === 0 && (
          <p className="p-4 text-stone-500">No products yet. Add your first product.</p>
        )}
      </Card>

      <Modal
        open={modalOpen}
        title={editing ? `Edit — ${editing.code}` : 'New Product'}
        onClose={() => setModalOpen(false)}
        wide
      >
        <form onSubmit={saveProduct} className="space-y-4">
          {error && <Alert type="error">{error}</Alert>}

          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Product code *">
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="SAR001"
                required
                disabled={!!editing}
              />
            </Field>
            <Field label="Name *">
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </Field>
            <Field label="Category *">
              <Select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Subcategory">
              <Input
                value={form.subcategory}
                onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
              />
            </Field>
            <Field label="Selling price (₹) *">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.sellingPrice}
                onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                required
              />
            </Field>
            <Field label="Cost price (₹) *">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.costPrice}
                onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                required
              />
            </Field>
            <Field label="Stock quantity">
              <Input
                type="number"
                min="0"
                value={form.stockQuantity}
                onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
              />
            </Field>
            <Field label="Low stock alert below">
              <Input
                type="number"
                min="1"
                value={form.lowStockThreshold}
                onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Description">
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>

          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isNewArrival}
                onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })}
              />
              New arrival
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isBestSeller}
                onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })}
              />
              Best seller
            </label>
            {editing && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.archive}
                  onChange={(e) => setForm({ ...form, archive: e.target.checked })}
                />
                Archived
              </label>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium text-maroon-800 mb-2">
              Images ({imageCount}/5) — JPG, PNG, WEBP
            </h3>
            {editing && (
              <div className="flex flex-wrap gap-2 mb-3">
                {editing.images?.map((img) => (
                  <div key={img.id} className="relative group">
                    <img src={img.url} alt="" className="w-20 h-20 object-cover rounded border" />
                    <button
                      type="button"
                      onClick={() => deleteImage(img.id)}
                      className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {(canAddImages || !editing) && (
              <>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                  className="text-sm w-full"
                />
                <p className="text-xs text-stone-500 mt-1">
                  {!editing
                    ? 'Images upload after you save the product (max 5 total).'
                    : `Select up to ${5 - imageCount} more image(s).`}
                </p>
                {editing && imageFiles.length > 0 && (
                  <Btn
                    type="button"
                    className="mt-2"
                    onClick={uploadMoreImages}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload selected images'}
                  </Btn>
                )}
              </>
            )}
            {editing && imageCount >= 5 && (
              <p className="text-xs text-amber-700">Maximum 5 images reached.</p>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Btn type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Btn>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-maroon-700 text-white rounded-lg text-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : editing ? 'Update product' : 'Create product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
