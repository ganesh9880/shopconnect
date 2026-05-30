import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

export default function CustomerDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api('/customers/dashboard/me').then(setData).catch(console.error);
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <section className="theme-card-elevated p-5">
        <h1 className="theme-heading text-2xl">Welcome, {data.welcome}</h1>
        <div className="theme-divider max-w-[80px] my-3" />
        <p className="text-3xl font-bold text-maroon-700">
          ₹{data.outstandingBalance.toLocaleString('en-IN')}
        </p>
        <p className="text-sm text-stone-600">Outstanding balance</p>
        <Link to="/customer/pay" className="theme-btn-primary inline-block mt-4 text-sm">
          Make Payment
        </Link>
      </section>

      <section className="theme-card p-5">
        <h2 className="theme-heading text-lg mb-3">Recent Purchases</h2>
        {data.recentPurchases?.length ? (
          <ul className="text-sm space-y-2">
            {data.recentPurchases.map((s) => (
              <li key={s.id} className="flex justify-between border-b pb-2">
                <span>{new Date(s.saleDate).toLocaleDateString('en-IN')}</span>
                <span>₹{s.total.toLocaleString('en-IN')}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-stone-500 text-sm">No purchases yet.</p>
        )}
      </section>

      <section className="theme-card p-5">
        <h2 className="theme-heading text-lg mb-3">New Arrivals</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {data.newArrivals?.map((p) => (
            <Link key={p.id} to={`/catalog/${p.code}`} className="text-maroon-700 underline">
              {p.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
