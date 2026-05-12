import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api, Category } from '../lib/api';
import { useReveal } from './primitives';

const bgs = ['#f0ece4', '#ede8df', '#eae5db', '#e8e3d8', '#ece7de', '#eae6dc'];

export function Collections() {
  const [cats, setCats] = useState<Category[]>([]);
  const { t } = useTranslation();
  useReveal();

  useEffect(() => {
    api.get<Category[]>('/categories').then((r) => setCats(r.data));
  }, []);

  return (
    <section id="collections" data-screen-label="Collections" style={{ padding: '120px 0 0' }}>
      <div style={{ padding: '0 56px 64px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }} className="reveal">
        <div>
          <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 16 }}>{t('collections.eyebrow')}</p>
          <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(40px, 4vw, 72px)', letterSpacing: '-0.01em' }}>{t('collections.title')}</h2>
        </div>
        <Link to="/shop" style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg3)', borderBottom: '1px solid rgba(26,23,20,0.15)', paddingBottom: 3 }}>{t('collections.viewAll')}</Link>
      </div>
      <div className="col-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: '360px 260px', gap: 2 }}>
        {cats.slice(0, 6).map((c, i) => (
          <CollCard key={c.id} c={c} bg={bgs[i % bgs.length]} big={i === 0} />
        ))}
      </div>
    </section>
  );
}

function CollCard({ c, bg, big }: { c: Category; bg: string; big: boolean }) {
  const [hov, setHov] = useState(false);
  const { t } = useTranslation();
  return (
    <Link
      to={`/shop?category=${c.slug}`}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', gridRow: big ? 'span 2' : 'span 1', display: 'block', background: bg }}
    >
      {c.coverImage ? (
        <img
          src={c.coverImage}
          alt={c.name}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: hov ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.8s cubic-bezier(.19,1,.22,1)' }}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: bg, transform: hov ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.8s cubic-bezier(.19,1,.22,1)' }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: hov ? 'linear-gradient(to top, rgba(26,23,20,0.65), rgba(26,23,20,0.08))' : 'linear-gradient(to top, rgba(26,23,20,0.45), transparent 60%)', transition: 'background 0.6s' }} />
      <div style={{ position: 'absolute', inset: 0, padding: '28px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

        <div>
          <p style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 8, opacity: hov ? 1 : 0, transform: hov ? 'none' : 'translateY(8px)', transition: 'opacity 0.4s, transform 0.4s' }}>
            {t('collections.pieces', { count: c.productCount ?? 0 })}
          </p>
          <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: big ? 44 : 28, color: 'var(--fg)' }}>{c.name}</h3>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 24, right: 24, opacity: hov ? 1 : 0, transform: hov ? 'none' : 'translate(-8px, 8px)', transition: 'opacity 0.4s, transform 0.5s' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(26,23,20,0.6)" strokeWidth="1">
          <line x1="5" y1="19" x2="19" y2="5" />
          <polyline points="9,5 19,5 19,15" />
        </svg>
      </div>
    </Link>
  );
}
