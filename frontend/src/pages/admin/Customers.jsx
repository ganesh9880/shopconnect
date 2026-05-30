import { useEffect, useState } from 'react';
import { api } from '../../api/client';
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
  Tabs,
  formatMoney,
  TableWrap,
} from '../../components/admin/ui';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [tab, setTab] = useState('list');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    preferredCategory: '',
    notes: '',
    openingBalance: '',
  });
  const [editForm, setEditForm] = useState({});
  const [importJson, setImportJson] = useState('');
  const [activation, setActivation] = useState(null);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);

  function load() {
    api('/customers').then(setCustomers).catch((e) => setError(e.message));
  }

  useEffect(() => {
    load();
  }, []);

  async function loadDetail(id) {
    setSelected(id);
    const data = await api(`/customers/${id}`);
    setDetail(data);
    setEditForm({
      name: data.customer.name,
      phone: data.customer.phone,
      address: data.customer.address || '',
      preferredCategory: data.customer.preferredCategory || '',
      notes: data.customer.notes || '',
    });
    setTab('detail');
  }

  async function createCustomer(e) {
    e.preventDefault();
    setError('');
    try {
      const created = await api('/customers', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          address: form.address,
          preferredCategory: form.preferredCategory || undefined,
          notes: form.notes || undefined,
          openingBalance: Number(form.openingBalance) || 0,
        }),
      });
      setActivation(created);
      setForm({
        name: '',
        phone: '',
        address: '',
        preferredCategory: '',
        notes: '',
        openingBalance: '',
      });
      setModal(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateCustomer(e) {
    e.preventDefault();
    if (!selected) return;
    try {
      await api(`/customers/${selected}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      loadDetail(selected);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function regenerateActivation() {
    if (!selected || !confirm('Reset activation? Customer must activate again.')) return;
    try {
      const data = await api(`/customers/${selected}/regenerate-activation`, { method: 'POST' });
      setActivation(data);
      loadDetail(selected);
    } catch (err) {
      alert(err.message);
    }
  }

  async function runImport() {
    setError('');
    try {
      const rows = JSON.parse(importJson);
      const result = await api('/customers/import', {
        method: 'POST',
        body: JSON.stringify({ customers: rows }),
      });
      alert(`Imported ${result.imported} customers`);
      setImportJson('');
      setTab('list');
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader title="Customers">
        <Btn onClick={() => setModal(true)}>+ Add Customer</Btn>
      </PageHeader>

      <Tabs
        tabs={[
          ['list', 'All customers'],
          ['add', 'Quick add'],
          ['import', 'Bulk import'],
          ...(selected ? [['detail', 'Customer detail']] : []),
        ]}
        active={tab}
        onChange={setTab}
      />

      {activation && (
        <Alert type="success">
          <p className="font-medium">
            {activation.name} ({activation.customerCode})
          </p>
          <p className="break-all mt-1">Link: {activation.activationLink}</p>
          <p>Code: {activation.activationCode}</p>
        </Alert>
      )}

      {error && <Alert type="error">{error}</Alert>}

      {tab === 'list' && (
        <Card className="overflow-hidden">
          <TableWrap>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-stone-50 text-left">
                <th className="p-2">Code</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Outstanding</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b hover:bg-stone-50">
                  <td className="p-2">{c.customerCode}</td>
                  <td>{c.name}</td>
                  <td>{c.phone}</td>
                  <td>{formatMoney(c.outstandingBalance)}</td>
                  <td>{c.isActivated ? 'Active' : 'Pending'}</td>
                  <td className="p-2">
                    <Btn variant="secondary" onClick={() => loadDetail(c.id)}>
                      View
                    </Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </TableWrap>
        </Card>
      )}

      {tab === 'add' && (
        <Card className="p-4 max-w-xl">
          <form onSubmit={createCustomer} className="grid gap-3">
            <Field label="Name *">
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </Field>
            <Field label="Phone *">
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </Field>
            <Field label="Address">
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </Field>
            <Field label="Opening balance (₹)">
              <Input
                type="number"
                value={form.openingBalance}
                onChange={(e) => setForm({ ...form, openingBalance: e.target.value })}
              />
            </Field>
            <button type="submit" className="py-2 bg-maroon-700 text-white rounded-lg text-sm">
              Add customer
            </button>
          </form>
        </Card>
      )}

      {tab === 'import' && (
        <Card className="p-4 max-w-2xl">
          <p className="text-sm text-stone-600 mb-2">
            Paste JSON array. Example:{' '}
            <code className="text-xs bg-stone-100 p-1 rounded">
              [{`{"name":"Lakshmi","phone":"9876543210","outstandingBalance":500}`}]
            </code>
          </p>
          <Textarea
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            rows={8}
            placeholder='[{"name":"...","phone":"...","address":"...","outstandingBalance":0}]'
          />
          <Btn className="mt-3" onClick={runImport}>
            Import customers
          </Btn>
        </Card>
      )}

      {tab === 'detail' && detail && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="p-4">
            <h2 className="font-semibold text-maroon-800 mb-3">
              {detail.customer.name} ({detail.customer.customerCode})
            </h2>
            <dl className="text-sm grid grid-cols-2 gap-2 mb-4">
              <dt className="text-stone-500">Outstanding</dt>
              <dd className="font-semibold">{formatMoney(detail.customer.outstandingBalance)}</dd>
              <dt className="text-stone-500">Total purchases</dt>
              <dd>{formatMoney(detail.totalPurchases)}</dd>
              <dt className="text-stone-500">Last purchase</dt>
              <dd>
                {detail.lastPurchaseDate
                  ? new Date(detail.lastPurchaseDate).toLocaleDateString('en-IN')
                  : '—'}
              </dd>
              <dt className="text-stone-500">Status</dt>
              <dd>{detail.customer.isActivated ? 'Activated' : 'Pending activation'}</dd>
            </dl>
            <Btn variant="secondary" onClick={regenerateActivation}>
              Regenerate activation link
            </Btn>
            <form onSubmit={updateCustomer} className="mt-4 space-y-3 border-t pt-4">
              <Field label="Name">
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </Field>
              <Field label="Phone">
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </Field>
              <Field label="Address">
                <Input
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                />
              </Field>
              <Field label="Preferred category">
                <Select
                  value={editForm.preferredCategory}
                  onChange={(e) =>
                    setEditForm({ ...editForm, preferredCategory: e.target.value })
                  }
                >
                  <option value="">—</option>
                  {PRODUCT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Notes">
                <Textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                />
              </Field>
              <Btn type="submit">Save profile</Btn>
            </form>
          </Card>
          <Card className="p-4">
            <h3 className="font-medium mb-2">Recent sales</h3>
            <ul className="text-sm space-y-2 max-h-48 overflow-auto">
              {detail.sales?.map((s) => (
                <li key={s.id} className="flex justify-between border-b pb-1">
                  <span>{new Date(s.saleDate).toLocaleDateString('en-IN')}</span>
                  <span>{formatMoney(s.total)}</span>
                </li>
              ))}
            </ul>
            <h3 className="font-medium mt-4 mb-2">Payments</h3>
            <ul className="text-sm space-y-1">
              {detail.payments?.slice(0, 5).map((p) => (
                <li key={p.id}>
                  {formatMoney(p.amount)} — {p.status}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      <Modal open={modal} title="Add customer" onClose={() => setModal(false)}>
        <form onSubmit={createCustomer} className="space-y-3">
          <Field label="Name">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </Field>
          <Field label="Phone">
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </Field>
          <Field label="Opening balance">
            <Input
              type="number"
              value={form.openingBalance}
              onChange={(e) => setForm({ ...form, openingBalance: e.target.value })}
            />
          </Field>
          <button type="submit" className="w-full py-2 bg-maroon-700 text-white rounded-lg">
            Create
          </button>
        </form>
      </Modal>
    </div>
  );
}
