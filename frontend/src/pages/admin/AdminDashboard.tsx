import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, Product, Category, formatPrice } from '../../lib/api';

export function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);

  useEffect(() => {
    Promise.all([api.get<Product[]>('/products/admin/all'), api.get<Category[]>('/categories')])
      .then(([p, c]) => { setProducts(p.data); setCats(c.data); })
      .catch(() => {});
  }, []);

  const published = products.filter(p => p.published).length;
  const draft = products.filter(p => !p.published).length;
  const featured = products.filter(p => p.featured).length;
  const lowStock = products.filter(p => p.stock <= 5).length;
  const recent = products.slice(0, 5);

  const parentCats = cats.filter(c => !c.parentId).length;
  const subCats = cats.filter(c => !!c.parentId).length;

  return (
    <>
      <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 12 }}>Overview</p>
      <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 48, marginBottom: 40 }}>Dashboard</h1>

      <div className="admin-stats-grid">
        <Stat label="Total Products" value={products.length} />
        <Stat label="Published" value={published} accent="#7ec87e" />
        <Stat label="Drafts" value={draft} accent="var(--fg3)" />
        <Stat label="Featured" value={featured} accent="var(--gold)" />
        <Stat label="Low Stock (≤5)" value={lowStock} accent={lowStock > 0 ? '#e08080' : undefined} />
        <Stat label="Collections" value={parentCats} />
        <Stat label="Subcategories" value={subCats} accent="var(--fg2)" />
      </div>

      {recent.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg3)' }}>Recent Products</p>
            <Link to="/admin/products" style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)' }}>View All →</Link>
          </div>
          <div className="table-wrap">
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
                  <td style={{ color: p.stock <= 5 ? '#b05050' : 'inherit' }}>{p.stock}</td>
                  <td>
                    <span style={{
                      padding: '3px 8px', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase',
                      background: p.published ? 'rgba(60,140,60,0.1)' : 'rgba(26,23,20,0.06)',
                      color: p.published ? '#2e7d2e' : 'var(--fg3)',
                    }}>{p.published ? 'Live' : 'Draft'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid rgba(26,23,20,0.07)',
      padding: '24px 28px',
    }}>
      <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 10 }}>{label}</p>
      <p style={{ fontFamily: 'var(--serif)', fontSize: 48, fontWeight: 300, color: accent || 'inherit' }}>{value}</p>
    </div>
  );
}
