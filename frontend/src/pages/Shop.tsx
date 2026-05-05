import { useEffect, useState } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import { api, Product, Category } from '../lib/api';
import { ProductCard } from '../components/ProductCard';
import type { PublicOutletContext } from '../layouts/PublicLayout';

export function Shop() {
  const { openAuth } = useOutletContext<PublicOutletContext>();
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const category = params.get('category') || '';
  const featured = params.get('featured') === 'true';
  const q = params.get('q') || '';

  useEffect(() => { api.get<Category[]>('/categories').then((r) => setCats(r.data)); }, []);

  useEffect(() => {
    setLoading(true);
    const query: Record<string, string> = { limit: '60' };
    if (category) query.category = category;
    if (featured) query.featured = 'true';
    if (q) query.q = q;
    api.get('/products', { params: query })
      .then((r) => setItems(r.data.items))
      .finally(() => setLoading(false));
  }, [category, featured, q]);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  }

  return (
    <main style={{ padding: '120px 56px 80px' }}>
      <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 16 }}>The Collection</p>
      <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(40px, 5vw, 80px)', marginBottom: 40 }}>
        {category ? cats.find((c) => c.slug === category)?.name || 'Shop' : featured ? 'Featured Pieces' : 'Shop All'}
      </h1>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40, alignItems: 'center' }}>
        <button onClick={() => setParam('category', '')} style={chip(!category)}>All</button>
        {cats.map((c) => (
          <button key={c.id} onClick={() => setParam('category', c.slug)} style={chip(category === c.slug)}>
            {c.name}
          </button>
        ))}
        <input
          type="search"
          placeholder="Search…"
          defaultValue={q}
          onKeyDown={(e) => { if (e.key === 'Enter') setParam('q', (e.target as HTMLInputElement).value); }}
          style={{
            marginLeft: 'auto', padding: '10px 14px',
            background: 'transparent', color: 'var(--fg)',
            border: '1px solid rgba(240,237,230,0.12)',
            outline: 'none', fontSize: 12, minWidth: 200,
          }}
        />
      </div>

      {loading ? (
        <p style={{ color: 'var(--fg3)' }}>Loading…</p>
      ) : items.length === 0 ? (
        <p style={{ color: 'var(--fg3)' }}>No pieces found.</p>
      ) : (
        <div className="prod-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {items.map((p) => <ProductCard key={p.id} product={p} onRequireAuth={openAuth} />)}
        </div>
      )}
    </main>
  );
}

function chip(active: boolean): React.CSSProperties {
  return {
    padding: '8px 16px', cursor: 'pointer',
    background: active ? 'var(--fg)' : 'transparent',
    color: active ? 'var(--bg)' : 'var(--fg2)',
    border: '1px solid ' + (active ? 'var(--fg)' : 'rgba(240,237,230,0.12)'),
    fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
    transition: 'all 0.2s',
  };
}
