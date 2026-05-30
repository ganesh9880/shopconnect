import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Card, PageHeader, TableWrap, formatMoney } from '../../components/admin/ui';

export default function AdminInventory() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api('/inventory/summary').then(setData).catch(console.error);
  }, []);

  if (!data) return <p className="text-stone-500">Loading...</p>;

  return (
    <div>
      <PageHeader title="Inventory" />
      <p className="mb-6 text-lg">
        Total stock value: <strong>{formatMoney(data.inventoryValue)}</strong>
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card className="p-4 border-amber-200 bg-amber-50">
          <h2 className="font-semibold text-amber-900 mb-2">
            Low stock ({data.alerts.lowStock.length})
          </h2>
          <ul className="text-sm space-y-1 max-h-60 overflow-auto">
            {data.alerts.lowStock.map((p) => (
              <li key={p.id}>
                {p.code} — {p.name}: <strong>{p.stockQuantity}</strong> left
              </li>
            ))}
            {data.alerts.lowStock.length === 0 && (
              <li className="text-stone-500">None</li>
            )}
          </ul>
        </Card>
        <Card className="p-4 border-red-200 bg-red-50">
          <h2 className="font-semibold text-red-900 mb-2">
            Out of stock ({data.alerts.outOfStock.length})
          </h2>
          <ul className="text-sm space-y-1 max-h-60 overflow-auto">
            {data.alerts.outOfStock.map((p) => (
              <li key={p.id}>
                {p.code} — {p.name}
              </li>
            ))}
            {data.alerts.outOfStock.length === 0 && (
              <li className="text-stone-500">None</li>
            )}
          </ul>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <TableWrap>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-stone-50 text-left">
              <th className="p-2">Code</th>
              <th>Name</th>
              <th>Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.stockSummary.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="p-2 font-mono text-xs">{p.code}</td>
                <td>{p.name}</td>
                <td>{p.stockQuantity}</td>
                <td>{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </TableWrap>
      </Card>
    </div>
  );
}
