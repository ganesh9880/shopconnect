import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function CustomerPay() {
  const [shop, setShop] = useState(null);
  const [outstanding, setOutstanding] = useState(0);
  const [amount, setAmount] = useState('');
  const [ref, setRef] = useState('');
  const [file, setFile] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    api('/payments/shop-info').then(setShop);
    api('/payments/my').then((d) => {
      setOutstanding(d.outstandingAmount);
      setAmount(String(d.outstandingAmount || ''));
    });
  }, []);

  async function submit(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('amount', amount);
    if (ref) fd.append('transactionRef', ref);
    if (file) fd.append('screenshot', file);
    const token = localStorage.getItem('customerToken');
    const res = await fetch('/api/payments/submit', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) alert(data.error);
    else {
      setDone(true);
      if (data.whatsappNotificationUrl) window.open(data.whatsappNotificationUrl, '_blank');
    }
  }

  if (!shop) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl p-5 shadow text-center">
        <h1 className="font-display text-2xl text-maroon-800">Pay via UPI</h1>
        <p className="text-sm text-stone-500 mt-1">UPI ID: {shop.upiId}</p>
        <p className="text-xl font-bold text-maroon-700 mt-2">
          Outstanding: ₹{outstanding.toLocaleString('en-IN')}
        </p>
        {shop.upiQrUrl && (
          <img src={shop.upiQrUrl} alt="UPI QR" className="mx-auto mt-4 max-w-xs rounded" />
        )}
        <ol className="text-left text-sm mt-4 space-y-1 text-stone-600 list-decimal list-inside">
          <li>Scan QR and pay via your UPI app</li>
          <li>Click &quot;I Have Paid&quot; below and submit proof</li>
        </ol>
      </section>

      {!done ? (
        <form onSubmit={submit} className="bg-white rounded-xl p-5 shadow space-y-4">
          <h2 className="font-semibold">I Have Paid</h2>
          <input
            type="number"
            placeholder="Amount paid"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Transaction reference (optional)"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0])}
            className="w-full text-sm"
          />
          <button type="submit" className="w-full py-2 bg-maroon-700 text-white rounded-lg">
            Submit Payment Proof
          </button>
        </form>
      ) : (
        <p className="text-center text-green-700">
          Payment submitted. Awaiting shop verification.
        </p>
      )}
    </div>
  );
}
