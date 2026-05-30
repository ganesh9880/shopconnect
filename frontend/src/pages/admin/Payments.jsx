import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { PAYMENT_STATUSES } from '../../constants';
import {
  Btn,
  Card,
  PageHeader,
  Select,
  Tabs,
  formatMoney,
} from '../../components/admin/ui';

export default function AdminPayments() {
  const [tab, setTab] = useState('pending');
  const [filter, setFilter] = useState('');
  const [requests, setRequests] = useState([]);

  function load() {
    if (tab === 'pending') {
      api('/payments/pending').then(setRequests);
    } else {
      const qs = filter ? `?status=${filter}` : '';
      api(`/payments${qs}`).then(setRequests);
    }
  }

  useEffect(() => {
    load();
  }, [tab, filter]);

  async function approve(id) {
    await api(`/payments/${id}/approve`, { method: 'POST' });
    load();
  }

  async function reject(id) {
    const reason = prompt('Rejection reason (optional)');
    await api(`/payments/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason: reason }),
    });
    load();
  }

  return (
    <div>
      <PageHeader title="Payment requests" />

      <Tabs
        tabs={[
          ['pending', 'Pending'],
          ['all', 'All requests'],
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'all' && (
        <div className="mb-4">
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-xs"
          >
            <option value="">All statuses</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="space-y-4">
        {requests.map((r) => (
          <Card key={r.id} className="p-4 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <p className="font-medium">{r.customer?.name || 'Customer'}</p>
              <p className="text-sm text-stone-500">{r.customer?.customerCode}</p>
              <p className="text-lg text-maroon-700 mt-1">{formatMoney(r.amount)}</p>
              <p className="text-xs text-stone-500">
                {new Date(r.createdAt).toLocaleString('en-IN')}
                {r.transactionRef && ` · Ref: ${r.transactionRef}`}
              </p>
              <span
                className={`inline-block mt-2 text-xs px-2 py-0.5 rounded ${
                  r.status === 'APPROVED'
                    ? 'bg-green-100 text-green-800'
                    : r.status === 'REJECTED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                }`}
              >
                {r.status}
              </span>
              {r.rejectionReason && (
                <p className="text-xs text-red-600 mt-1">{r.rejectionReason}</p>
              )}
            </div>
            {(r.screenshotUrl || r.screenshotPath) && (
              <img
                src={r.screenshotUrl || r.screenshotPath}
                alt="Payment proof"
                className="w-36 h-36 object-cover rounded border"
              />
            )}
            {r.status === 'PENDING' && (
              <div className="flex flex-col gap-2">
                <Btn onClick={() => approve(r.id)}>Approve</Btn>
                <Btn variant="danger" onClick={() => reject(r.id)}>
                  Reject
                </Btn>
              </div>
            )}
          </Card>
        ))}
        {requests.length === 0 && (
          <p className="text-stone-500">No payment requests in this view.</p>
        )}
      </div>
    </div>
  );
}
