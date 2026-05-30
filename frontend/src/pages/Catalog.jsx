import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  'Sarees',
  'Dress Materials',
  'Nighties',
  'Leggings',
  'Kids Wear',
  'Seasonal Collections',
];

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const search = params.get('q') || '';
  const category = params.get('category') || '';
  const filter = params.get('filter') || '';

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (search) qs.set('search', search);
    if (category) qs.set('category', category);
    if (filter === 'new') qs.set('newArrivals', 'true');
    if (filter === 'best') qs.set('bestSellers', 'true');
    api(`/products/public?${qs}`)
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, category, filter]);

  return (
    <div>
      <h1 className="theme-heading-lg mb-2">Product Catalog</h1>
      <div className="theme-divider max-w-[140px] mb-6" />
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
        <input
          type="search"
          placeholder="Search products..."
          defaultValue={search}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const p = new URLSearchParams(params);
              if (e.target.value) p.set('q', e.target.value);
              else p.delete('q');
              setParams(p);
            }
          }}
          className="border rounded-lg px-3 py-3 flex-1 w-full min-h-[48px] touch-manipulation"
        />
        <select
          value={category}
          onChange={(e) => {
            const p = new URLSearchParams(params);
            if (e.target.value) p.set('category', e.target.value);
            else p.delete('category');
            setParams(p);
          }}
          className="border rounded-lg px-3 py-3 w-full sm:w-auto min-h-[48px] touch-manipulation"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            const p = new URLSearchParams(params);
            p.set('filter', 'new');
            p.delete('category');
            setParams(p);
          }}
          className="flex-1 sm:flex-none px-3 py-3 min-h-[48px] text-sm border rounded-lg touch-manipulation"
        >
          New Arrivals
        </button>
        <button
          type="button"
          onClick={() => {
            const p = new URLSearchParams(params);
            p.set('filter', 'best');
            setParams(p);
          }}
          className="flex-1 sm:flex-none px-3 py-3 min-h-[48px] text-sm border rounded-lg touch-manipulation"
        >
          Best Sellers
        </button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
      {!loading && products.length === 0 && (
        <p className="text-stone-500">No products found.</p>
      )}
    </div>
  );
}
