import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api, Category } from '../lib/api';
import { useReveal } from './primitives';
import { usePageContent } from '../lib/usePageContent';

export function Collections() {
  const [cats, setCats] = useState<Category[]>([]);
  const c = usePageContent();
  useReveal();

  useEffect(() => {
    api.get<Category[]>('/categories').then((r) => setCats(r.data));
  }, []);

  // Show only root (top-level) categories on the homepage
  const rootCats = cats.filter((c) => !c.parentId);

  return (
    <section id="collections" data-screen-label="Collections" className="collections-section">
      <div className="collections-header reveal">
        <div>
          <p className="collections-eyebrow">{c.collections.eyebrow}</p>
          <h2 className="collections-title">{c.collections.title}</h2>
        </div>
        <Link to="/shop" className="collections-view-all">{c.collections.viewAll}</Link>
      </div>
      <div className="collections-grid">
        {rootCats.map((c) => (
          <CollCard key={c.id} c={c} />
        ))}
      </div>
    </section>
  );
}

function CollCard({ c }: { c: Category }) {
  const { t } = useTranslation();
  return (
    <Link to={`/shop?category=${c.slug}`} className="coll-card">
      <div className="coll-card-media">
        {c.coverImage ? (
          <img src={c.coverImage} alt={c.name} className="coll-card-img" />
        ) : (
          <div className="coll-card-placeholder" />
        )}
        <div className="coll-card-overlay" />
      </div>
      <div className="coll-card-body">
        <h3 className="coll-card-title">{c.name}</h3>
        <p className="coll-card-count">{t('collections.pieces', { count: c.productCount ?? 0 })}</p>
      </div>
    </Link>
  );
}
