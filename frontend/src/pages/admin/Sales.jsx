import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import {
  Btn,
  Card,
  Field,
  Input,
  PageHeader,
  Select,
  formatMoney,
} from '../../components/admin/ui';

const emptyLine = () => ({
  productId: '',
  quantity: '1',
  unitPrice: '',
  discount: '0',
});

export default function AdminSales() {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [lines, setLines] = useState([emptyLine()]);
  const [saleDiscount, setSaleDiscount] = useState('0');
  const [error, setError] = useState('');

  function load() {
    api('/sales').then(setSales).catch(console.error);
  }

  useEffect(() => {
    load();
    api('/customers').then(setCustomers);
    api('/products').then(setProducts);
  }, []);

  function setLine(i, patch) {
    setLines((prev) => prev.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }

  function onProductPick(i, productId) {
    const product = products.find((p) => p.id === productId);
    setLine(i, {
      productId,
      unitPrice: product ? String(product.sellingPrice) : '',
    });
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine()]);
  }

  function removeLine(i) {
    setLines((prev) => prev.filter((_, idx) => idx !== i));
  }

  const lineTotal = lines.reduce((sum, row) => {
    const q = Number(row.quantity) || 0;
    const p = Number(row.unitPrice) || 0;
    const d = Number(row.discount) || 0;
    return sum + q * p - d;
  }, 0);
  const grandTotal = lineTotal - (Number(saleDiscount) || 0);

  async function submitSale(e) {
    e.preventDefault();
    setError('');
    try {
      const items = lines
        .filter((l) => l.productId)
        .map((l) => ({
          productId: l.productId,
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
          discount: Number(l.discount) || 0,
        }));
      if (!customerId || !items.length) {
        setError('Select customer and at least one product');
        return;
      }
      await api('/sales', {
        method: 'POST',
        body: JSON.stringify({
          customerId,
          items,
          discount: Number(saleDiscount) || 0,
        }),
      });
      setShowForm(false);
      setLines([emptyLine()]);
      setCustomerId('');
      setSaleDiscount('0');
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader title="Sales">
        <Btn onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Record sale'}
        </Btn>
      </PageHeader>

      {showForm && (
        <Card className="p-4 mb-6">
          <form onSubmit={submitSale} className="space-y-4">
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Field label="Customer">
              <Select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
              >
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.customerCode} — {c.name}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="space-y-3">
              <p className="text-sm font-medium text-stone-700">Line items</p>
              {lines.map((row, i) => (
                <div key={i} className="grid md:grid-cols-5 gap-2 items-end">
                  <Field label={i === 0 ? 'Product' : ''}>
                    <Select
                      value={row.productId}
                      onChange={(e) => onProductPick(i, e.target.value)}
                      required
                    >
                      <option value="">Product</option>
                      {products
                        .filter((p) => p.status !== 'ARCHIVED')
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.code} — {p.name} (stock: {p.stockQuantity})
                          </option>
                        ))}
                    </Select>
                  </Field>
                  <Field label={i === 0 ? 'Qty' : ''}>
                    <Input
                      type="number"
                      min="1"
                      value={row.quantity}
                      onChange={(e) => setLine(i, { quantity: e.target.value })}
                    />
                  </Field>
                  <Field label={i === 0 ? 'Price' : ''}>
                    <Input
                      type="number"
                      value={row.unitPrice}
                      onChange={(e) => setLine(i, { unitPrice: e.target.value })}
                    />
                  </Field>
                  <Field label={i === 0 ? 'Discount' : ''}>
                    <Input
                      type="number"
                      value={row.discount}
                      onChange={(e) => setLine(i, { discount: e.target.value })}
                    />
                  </Field>
                  <Btn type="button" variant="danger" onClick={() => removeLine(i)}>
                    Remove
                  </Btn>
                </div>
              ))}
              <Btn type="button" variant="secondary" onClick={addLine}>
                + Add line
              </Btn>
            </div>

            <Field label="Sale discount (₹)">
              <Input
                type="number"
                value={saleDiscount}
                onChange={(e) => setSaleDiscount(e.target.value)}
                className="max-w-xs"
              />
            </Field>
            <p className="text-lg font-semibold text-maroon-800">
              Total: {formatMoney(grandTotal)}
            </p>
            <p className="text-xs text-stone-500">
              Saves sale, reduces stock, and adds ledger debit automatically.
            </p>
            <button type="submit" className="px-4 py-2 bg-maroon-700 text-white rounded-lg text-sm">
              Save sale
            </button>
          </form>
        </Card>
      )}

      <Card className="divide-y">
        {sales.map((s) => (
          <div key={s.id} className="p-4 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">
                {s.customer?.name} ({s.customer?.customerCode})
              </span>
              <span className="font-semibold text-maroon-700">{formatMoney(s.total)}</span>
            </div>
            <p className="text-stone-500 text-xs mt-1">
              {new Date(s.saleDate).toLocaleString('en-IN')}
              {s.discount > 0 && ` · Discount ${formatMoney(s.discount)}`}
            </p>
            <ul className="mt-2 text-xs text-stone-600">
              {s.items?.map((item) => (
                <li key={item.id}>
                  {item.product?.code} × {item.quantity} @ {formatMoney(item.unitPrice)}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {sales.length === 0 && <p className="p-4 text-stone-500">No sales recorded yet.</p>}
      </Card>
    </div>
  );
}
