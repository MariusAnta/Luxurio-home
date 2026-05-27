import { useEffect, useRef, useState } from 'react';
import { Navigate, useOutletContext } from 'react-router-dom';
import { api, Product } from '../lib/api';
import { ProductCard } from '../components/ProductCard';
import { useUserAuth } from '../lib/userAuth';
import { Seo } from '../components/Seo';
import type { PublicOutletContext } from '../layouts/PublicLayout';

export function Favorites() {
  const { user, loading } = useUserAuth();
  const { openAuth } = useOutletContext<PublicOutletContext>();
  const [items, setItems] = useState<Product[] | null>(null);

  useEffect(() => {
    if (!user) return;
    api.get<Product[]>('/favorites').then((r) => setItems(r.data));
  }, [user]);

  const openAuthRef = useRef(openAuth);
  openAuthRef.current = openAuth;

  useEffect(() => {
    if (!loading && !user) openAuthRef.current();
  }, [loading, user]);

  if (loading) return <main className="pd-state">Loading…</main>;
  if (!user) return <Navigate to="/" replace />;

  return (
    <main className="page-main">
      <Seo title="Your Favorites" noindex />
      <p className="t-eyebrow shop-eyebrow">Saved For You</p>
      <h1 className="shop-title">Your Favorites</h1>
      {items === null ? (
        <p style={{ color: 'var(--fg3)' }}>Loading…</p>
      ) : items.length === 0 ? (
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--fg2)' }}>
          No favorites yet — tap the heart on any piece to save it here.
        </p>
      ) : (
        <div className="prod-grid">
          {items.map((p) => <ProductCard key={p.id} product={p} onRequireAuth={openAuth} />)}
        </div>
      )}
    </main>
  );
}
