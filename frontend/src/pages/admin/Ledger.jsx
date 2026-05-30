import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import {
  Btn,
  Card,
  Field,
  Input,
  PageHeader,
  Select,
  Tabs,
  formatMoney,
  TableWrap,
} from '../../components/admin/ui';

export default function AdminLedger() {
  const [tab, setTab] = useState('outstanding');
  const [report, setReport] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [ledger, setLedger] = useState(null);
  const [entry, setEntry] = useState({
    customerId: '',
    debit: '',
    credit: '',
    description: '',
    entryDate: '',
  });
  const [viewCustomerId, setViewCustomerId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api('/ledger/outstanding').then(setReport);
    api('/customers').then(setCustomers);
  }, []);

  async function loadCustomerLedger(id) {
    setViewCustomerId(id);
    const data = await api(`/ledger/customer/${id}`);
    setLedger(data);
    setTab('view');
  }

  async function addEntry(e) {
    e.preventDefault();
    setError('');
    try {
      await api('/ledger', {
        method: 'POST',
        body: JSON.stringify({
          customerId: entry.customerId,
          debit: Number(entry.debit) || 0,
          credit: Number(entry.credit) || 0,
          description: entry.description,
          entryDate: entry.entryDate || undefined,
        }),
      });
      setEntry({ customerId: '', debit: '', credit: '', description: '', entryDate: '' });
      api('/ledger/outstanding').then(setReport);
      if (viewCustomerId) loadCustomerLedger(viewCustomerId);
      alert('Ledger entry added');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader title="Ledger" />

      <Tabs
        tabs={[
          ['outstanding', 'Outstanding report'],
          ['entry', 'Manual entry'],
          ['view', 'Customer ledger'],
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'outstanding' && (
        <Card className="overflow-hidden">
          <TableWrap>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-stone-50 text-left">
                <th className="p-2">Customer</th>
                <th>Phone</th>
                <th>Outstanding</th>
                <th>Due days</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {report.map((r) => (
                <tr key={r.customerId} className="border-b">
                  <td className="p-2">
                    {r.customerName} ({r.customerCode})
                  </td>
                  <td>{r.phone}</td>
                  <td>{formatMoney(r.outstandingAmount)}</td>
                  <td>{r.dueDays}</td>
                  <td className="p-2">
                    <Btn variant="secondary" onClick={() => loadCustomerLedger(r.customerId)}>
                      Ledger
                    </Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </TableWrap>
        </Card>
      )}

      {tab === 'entry' && (
        <Card className="p-4 max-w-md">
          <form onSubmit={addEntry} className="space-y-3">
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Field label="Customer">
              <Select
                value={entry.customerId}
                onChange={(e) => setEntry({ ...entry, customerId: e.target.value })}
                required
              >
                <option value="">Select</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.customerCode} — {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Debit (₹) — increases due">
              <Input
                type="number"
                value={entry.debit}
                onChange={(e) => setEntry({ ...entry, debit: e.target.value })}
              />
            </Field>
            <Field label="Credit (₹) — payment / reduction">
              <Input
                type="number"
                value={entry.credit}
                onChange={(e) => setEntry({ ...entry, credit: e.target.value })}
              />
            </Field>
            <Field label="Description">
              <Input
                value={entry.description}
                onChange={(e) => setEntry({ ...entry, description: e.target.value })}
                required
              />
            </Field>
            <Field label="Date (optional)">
              <Input
                type="date"
                value={entry.entryDate}
                onChange={(e) => setEntry({ ...entry, entryDate: e.target.value })}
              />
            </Field>
            <button type="submit" className="w-full py-2 bg-maroon-700 text-white rounded-lg text-sm">
              Add entry
            </button>
          </form>
        </Card>
      )}

      {tab === 'view' && (
        <div>
          <Field label="Select customer">
            <Select
              value={viewCustomerId}
              onChange={(e) => loadCustomerLedger(e.target.value)}
              className="max-w-md mb-4"
            >
              <option value="">Choose customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.customerCode} — {c.name}
                </option>
              ))}
            </Select>
          </Field>
          {ledger && (
            <Card className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                <div>
                  <p className="text-stone-500">Opening</p>
                  <p className="font-medium">{formatMoney(ledger.openingBalance)}</p>
                </div>
                <div>
                  <p className="text-stone-500">Debits</p>
                  <p>{formatMoney(ledger.totalDebits)}</p>
                </div>
                <div>
                  <p className="text-stone-500">Credits</p>
                  <p>{formatMoney(ledger.totalCredits)}</p>
                </div>
                <div>
                  <p className="text-stone-500">Outstanding</p>
                  <p className="font-semibold text-maroon-700">
                    {formatMoney(ledger.currentOutstanding)}
                  </p>
                </div>
              </div>
              <TableWrap>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2">Date</th>
                    <th>Description</th>
                    <th>Debit</th>
                    <th>Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.entries.map((e) => (
                    <tr key={e.id} className="border-b">
                      <td className="py-2">
                        {new Date(e.entryDate).toLocaleDateString('en-IN')}
                      </td>
                      <td>{e.description}</td>
                      <td>{e.debit ? formatMoney(e.debit) : '—'}</td>
                      <td>{e.credit ? formatMoney(e.credit) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </TableWrap>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
