import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, Product, formatPrice } from '../../lib/api';

export function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState(0);

  useEffect(() => {
    Promise.all([api.get<Product[]>('/products/admin/all'), api.get('/categories')])
      .then(([p, c]) => { setProducts(p.data); setCategories(c.data.length); })
      .catch(() => {});
  }, []);

  const published = products.filter(p => p.published).length;
  const draft = products.filter(p => !p.published).length;
  const featured = products.filter(p => p.featured).length;
  const lowStock = products.filter(p => p.stock <= 5).length;
  const recent = products.slice(0, 5); // already sorted by createdAt desc from API

  return (
    <>
      <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 12 }}>Overview</p>
      <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 48, marginBottom: 40 }}>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48 }}>
        <Stat label="Total Products" value={products.length} />
        <Stat label="Published" value={published} accent="#7ec87e" />
        <Stat label="Drafts" value={draft} accent="var(--fg3)" />
        <Stat label="Featured" value={featured} accent="var(--gold)" />
        <Stat label="Low Stock (≤5)" value={lowStock} accent={lowStock > 0 ? '#e08080' : undefined} />
        <Stat label="Categories" value={categories} />
      </div>

      {recent.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg3)' }}>Recent Products</p>
            <Link to="/admin/products" style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)' }}>View All →</Link>
          </div>
          <table>
            <thead>
              <tr><th></th><th>Name</th><th>Price</th><th>Stock</th><th>Status</th></tr>
            </thead>
            <tbody>
              {recent.map(p => (
                <tr key={p.id}>
                  <td style={{ width: 48 }}>
                    {p.images[0] && <img src={p.images[0].url} alt="" style={{ width: 40, height: 40, objectFit: 'cover' }} />}
                  </td>
                  <td>
                    {p.name}
                    {p.designer && <div style={{ color: 'var(--fg3)', fontSize: 11 }}>{p.designer}</div>}
                  </td>
                  <td style={{ color: 'var(--gold)' }}>{formatPrice(p.price)}</td>
                  <td style={{ color: p.stock <= 5 ? '#e08080' : 'inherit' }}>{p.stock}</td>
                  <td>
                    <span style={{
                      padding: '3px 8px', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase',
                      background: p.published ? 'rgba(100,180,100,0.12)' : 'rgba(240,237,230,0.06)',
                      color: p.published ? '#7ec87e' : 'var(--fg3)',
                    }}>{p.published ? 'Live' : 'Draft'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid rgba(240,237,230,0.06)',
      padding: '24px 28px',
    }}>
      <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 10 }}>{label}</p>
      <p style={{ fontFamily: 'var(--serif)', fontSize: 48, fontWeight: 300, color: accent || 'inherit' }}>{value}</p>
    </div>
  );
}
