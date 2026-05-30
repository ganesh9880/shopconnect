import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api('/dashboard').then(setStats).catch(console.error);
  }, []);

  if (!stats) return <p>Loading...</p>;

  const cards = [
    ['Total Customers', stats.totalCustomers],
    ['Total Products', stats.totalProducts],
    ['Monthly Sales', `₹${(stats.monthlySales || 0).toLocaleString('en-IN')}`],
    ['Outstanding', `₹${(stats.totalOutstanding || 0).toLocaleString('en-IN')}`],
    ['Pending Payments', stats.pendingPaymentRequests],
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-maroon-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map(([label, value]) => (
          <div key={label} className="bg-white p-4 rounded-lg shadow border">
            <p className="text-sm text-stone-500">{label}</p>
            <p className="text-2xl font-bold text-maroon-700">{value}</p>
          </div>
        ))}
      </div>
      {stats.lowStockProducts?.length > 0 && (
        <section className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Low Stock</h2>
          <ul className="text-sm space-y-1">
            {stats.lowStockProducts.map((p) => (
              <li key={p.id}>
                {p.code} — {p.name} ({p.stockQuantity} left)
              </li>
            ))}
          </ul>
          <Link to="/admin/inventory" className="text-sm text-maroon-700 underline mt-2 inline-block">
            View inventory
          </Link>
        </section>
      )}
    </div>
  );
}
