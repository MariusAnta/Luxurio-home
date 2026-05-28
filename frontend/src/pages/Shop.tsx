import { useEffect, useState } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import { api, Product, Category } from '../lib/api';
import { ProductCard } from '../components/ProductCard';
import { Seo } from '../components/Seo';
import { usePageContent } from '../lib/usePageContent';
import type { PublicOutletContext } from '../layouts/PublicLayout';

const PAGE_SIZE = 24;

export function Shop() {
  const { openAuth } = useOutletContext<PublicOutletContext>();
  const c = usePageContent();
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const category = params.get('category') || '';
  const featured = params.get('featured') === 'true';
  const q = params.get('q') || '';

  useEffect(() => { api.get<Category[]>('/categories').then((r) => setCats(r.data)); }, []);

  // Reset and fetch first page whenever filters change
  useEffect(() => {
    setLoading(true);
    setItems([]);
    setCursor(null);
    const query: Record<string, string> = { limit: String(PAGE_SIZE) };
    if (category) query.category = category;
    if (featured) query.featured = 'true';
    if (q) query.q = q;
    api.get('/products', { params: query })
      .then((r) => {
        setItems(r.data.items ?? []);
        setCursor(r.data.nextCursor ?? null);
        setHasMore(r.data.hasMore ?? false);
      })
      .finally(() => setLoading(false));
  }, [category, featured, q]);

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    const query: Record<string, string> = { limit: String(PAGE_SIZE), cursor };
    if (category) query.category = category;
    if (featured) query.featured = 'true';
    if (q) query.q = q;
    try {
      const r = await api.get('/products', { params: query });
      setItems((prev) => [...prev, ...(r.data.items ?? [])]);
      setCursor(r.data.nextCursor ?? null);
      setHasMore(r.data.hasMore ?? false);
    } finally {
      setLoadingMore(false);
    }
  }

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  }

  const rootCats = cats.filter((c) => !c.parentId);
  const childrenOf = (id: string) => cats.filter((c) => c.parentId === id);

  // Which parent is "active" — either directly selected, or is the parent of selected child
  const selectedCat = cats.find((c) => c.slug === category);
  const activeParent = selectedCat
    ? (selectedCat.parentId ? cats.find((c) => c.id === selectedCat.parentId) : selectedCat)
    : null;
  const activeParentChildren = activeParent ? childrenOf(activeParent.id) : [];

  return (
    <main className="page-main">
      <Seo
        title={category ? (cats.find((c) => c.slug === category)?.name ?? 'Shop') : featured ? 'Featured Pieces' : 'Shop All Furniture'}
        description="Browse the Luxurio Home collection — made-to-order luxury furniture by independent European craftspeople. Filter by category or search by name."
        canonical={`/shop${category ? `?category=${category}` : ''}`}
        breadcrumbs={[{ name: 'Shop', path: '/shop' }]}
      />
      <p className="t-eyebrow shop-eyebrow">{c.shop.eyebrow}</p>
      <h1 className="shop-title">
        {category ? cats.find((cat) => cat.slug === category)?.name || c.shop.title : featured ? 'Featured Pieces' : c.shop.title}
      </h1>

      {/* Row 1: All + parent categories + search */}
      <div className="shop-filters">
        <button onClick={() => setParam('category', '')} className={`chip${!category ? ' active' : ''}`}>All</button>
        {rootCats.map((parent) => (
          <button
            key={parent.id}
            onClick={() => setParam('category', parent.slug)}
            className={`chip${activeParent?.id === parent.id ? ' active' : ''}`}
          >
            {parent.name}
          </button>
        ))}
        <input
          type="search"
          placeholder="Search…"
          defaultValue={q}
          onKeyDown={(e) => { if (e.key === 'Enter') setParam('q', (e.target as HTMLInputElement).value); }}
          className="shop-search"
        />
      </div>

      {/* Row 2: children of selected parent (contextual) */}
      {activeParentChildren.length > 0 && (
        <div className="shop-filters shop-filters-sub">
          <button
            onClick={() => setParam('category', activeParent!.slug)}
            className={`chip chip-sub${category === activeParent!.slug ? ' active' : ''}`}
          >
            All
          </button>
          {activeParentChildren.map((kid) => (
            <button
              key={kid.id}
              onClick={() => setParam('category', kid.slug)}
              className={`chip chip-sub${category === kid.slug ? ' active' : ''}`}
            >
              {kid.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--fg3)' }}>Loading…</p>
      ) : items.length === 0 ? (
        <p style={{ color: 'var(--fg3)' }}>No pieces found.</p>
      ) : (
        <>
          <div className="prod-grid">
            {items.map((p) => <ProductCard key={p.id} product={p} onRequireAuth={openAuth} />)}
          </div>
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: 'var(--sp-10)' }}>
              <button className="btn" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
