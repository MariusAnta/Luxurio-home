import { useEffect, useRef, useState } from 'react';
import { Navigate, useOutletContext } from 'react-router-dom';
import { api, Product } from '../lib/api';
import { ProductCard } from '../components/ProductCard';
import { useUserAuth } from '../lib/userAuth';
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

  if (loading) return <main style={{ padding: '160px 56px', color: 'var(--fg3)' }}>Loading…</main>;
  if (!user) return <Navigate to="/" replace />;

  return (
    <main style={{ padding: '120px 56px 80px' }}>
      <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 16 }}>Saved For You</p>
      <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(40px, 5vw, 80px)', marginBottom: 40 }}>Your Favorites</h1>
      {items === null ? (
        <p style={{ color: 'var(--fg3)' }}>Loading…</p>
      ) : items.length === 0 ? (
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--fg2)' }}>
          No favorites yet — tap the heart on any piece to save it here.
        </p>
      ) : (
        <div className="prod-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {items.map((p) => <ProductCard key={p.id} product={p} onRequireAuth={openAuth} />)}
        </div>
      )}
    </main>
  );
}
