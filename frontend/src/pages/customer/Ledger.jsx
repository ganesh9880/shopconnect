import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function CustomerLedger() {
  const [ledger, setLedger] = useState(null);

  useEffect(() => {
    api('/ledger/my').then(setLedger).catch(console.error);
  }, []);

  if (!ledger) return <p>Loading...</p>;

  return (
    <div className="bg-white rounded-xl p-5 shadow">
      <h1 className="font-display text-2xl text-maroon-800 mb-4">My Ledger</h1>
      <div className="grid grid-cols-2 gap-4 text-sm mb-6">
        <div>
          <p className="text-stone-500">Opening</p>
          <p className="font-semibold">₹{ledger.openingBalance.toLocaleString('en-IN')}</p>
        </div>
        <div>
          <p className="text-stone-500">Outstanding</p>
          <p className="font-semibold text-maroon-700">
            ₹{ledger.currentOutstanding.toLocaleString('en-IN')}
          </p>
        </div>
        <div>
          <p className="text-stone-500">Total Debits</p>
          <p>₹{ledger.totalDebits.toLocaleString('en-IN')}</p>
        </div>
        <div>
          <p className="text-stone-500">Total Credits</p>
          <p>₹{ledger.totalCredits.toLocaleString('en-IN')}</p>
        </div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-stone-500">
            <th className="py-2">Date</th>
            <th>Description</th>
            <th>Debit</th>
            <th>Credit</th>
          </tr>
        </thead>
        <tbody>
          {ledger.entries.map((e) => (
            <tr key={e.id} className="border-b border-stone-100">
              <td className="py-2">{new Date(e.entryDate).toLocaleDateString('en-IN')}</td>
              <td>{e.description}</td>
              <td>{e.debit ? `₹${e.debit}` : '—'}</td>
              <td>{e.credit ? `₹${e.credit}` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
