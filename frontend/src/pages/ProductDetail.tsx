import { useEffect, useState } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { api, Product, formatPrice } from '../lib/api';
import { ImgOrPlaceholder } from '../components/primitives';
import { useUserAuth } from '../lib/userAuth';
import type { PublicOutletContext } from '../layouts/PublicLayout';

// model-viewer is a global web component loaded via <script> in index.html
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        src?: string; alt?: string; 'camera-controls'?: boolean; ar?: boolean;
        'auto-rotate'?: boolean; 'shadow-intensity'?: string; style?: React.CSSProperties;
      }, HTMLElement>;
    }
  }
}

export function ProductDetail() {
  const { slug } = useParams();
  const { openAuth } = useOutletContext<PublicOutletContext>();
  const { user, favorites, toggleFavorite } = useUserAuth();
  const [p, setP] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [view3d, setView3d] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setNotFound(false);
    api.get(`/products/${slug}`)
      .then((r) => { setP(r.data); setActiveImg(0); setView3d(false); })
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) return <main style={{ padding: '160px 56px', color: 'var(--fg3)' }}>Product not found.</main>;
  if (!p) return <main style={{ padding: '160px 56px', color: 'var(--fg3)' }}>Loading…</main>;

  const isFav = favorites.has(p.id);
  const hasDiscount = p.discountPrice && Number(p.discountPrice) < Number(p.price);

  async function onHeart() {
    if (!p) return;
    if (!user) return openAuth();
    await toggleFavorite(p.id);
  }

  return (
    <main style={{ padding: '120px 56px 80px', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 80 }}>
      <div>
        {/* 3D / Photo toggle */}
        {p.modelUrl && (
          <div style={{ display: 'flex', gap: 0, marginBottom: 12, border: '1px solid rgba(240,237,230,0.1)', width: 'fit-content' }}>
            {(['Photos', '3D View'] as const).map((label) => {
              const active = label === '3D View' ? view3d : !view3d;
              return (
                <button key={label} onClick={() => setView3d(label === '3D View')}
                  style={{
                    padding: '8px 20px', fontSize: 9, letterSpacing: '0.2em',
                    textTransform: 'uppercase', background: active ? 'var(--gold)' : 'none',
                    color: active ? 'var(--bg)' : 'var(--fg3)', border: 'none', cursor: 'pointer',
                  }}>
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {view3d && p.modelUrl ? (
          <div style={{ position: 'relative', paddingBottom: '125%', marginBottom: 16, background: 'var(--bg2)' }}>
            <model-viewer
              src={p.modelUrl}
              alt={p.name}
              camera-controls
              auto-rotate
              ar
              shadow-intensity="1"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            />
          </div>
        ) : (
          <div style={{ position: 'relative', paddingBottom: '125%', marginBottom: 16 }}>
            <ImgOrPlaceholder
              id={`pdmain${p.id}`}
              url={p.images[activeImg]?.url || p.images[0]?.url}
              alt={p.name}
              style={{ position: 'absolute', inset: 0 }}
            />
          </div>
        )}

        {!view3d && p.images.length > 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(p.images.length, 5)}, 1fr)`, gap: 8 }}>
            {p.images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveImg(i)}
                style={{
                  position: 'relative', paddingBottom: '100%',
                  border: i === activeImg ? '1px solid var(--gold)' : '1px solid transparent',
                  cursor: 'pointer', background: 'none', padding: 0,
                }}
              >
                <img src={img.url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        )}
      </div>
      <div>
        {p.category && (
          <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 16 }}>
            {p.category.name}
          </p>
        )}
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(36px, 4vw, 64px)', lineHeight: 1, marginBottom: 12 }}>
          {p.name}
        </h1>
        {p.designer && (
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--fg2)', marginBottom: 28, fontSize: 17 }}>
            Designed by {p.designer}
          </p>
        )}
        <div style={{ marginBottom: 32 }}>
          {hasDiscount ? (
            <>
              <span style={{ color: 'var(--fg3)', textDecoration: 'line-through', marginRight: 12, fontSize: 14 }}>
                {formatPrice(p.price)}
              </span>
              <span style={{ color: 'var(--gold)', fontSize: 18 }}>{formatPrice(p.discountPrice!)}</span>
              <span style={{
                marginLeft: 12, background: 'var(--gold)', color: 'var(--bg)',
                padding: '4px 10px', fontSize: 9, letterSpacing: '0.2em',
              }}>
                -{Math.round((1 - Number(p.discountPrice) / Number(p.price)) * 100)}%
              </span>
            </>
          ) : (
            <span style={{ color: 'var(--gold)', fontSize: 18 }}>{formatPrice(p.price)}</span>
          )}
        </div>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 17, lineHeight: 1.85, color: 'var(--fg2)', marginBottom: 36, maxWidth: 480 }}>
          {p.description}
        </p>

        <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 32, rowGap: 12, marginBottom: 40 }}>
          {p.material && (<><dt style={specLabel}>Material</dt><dd style={specVal}>{p.material}</dd></>)}
          {p.color && (<><dt style={specLabel}>Color</dt><dd style={specVal}>{p.color}</dd></>)}
          {p.dimensions && (<><dt style={specLabel}>Dimensions</dt><dd style={specVal}>{p.dimensions}</dd></>)}
          {p.weightKg && (<><dt style={specLabel}>Weight</dt><dd style={specVal}>{p.weightKg} kg</dd></>)}
        </dl>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn" style={{ flex: 1 }}>Request a Quote</button>
          <button onClick={onHeart}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            style={{
              padding: '14px 18px', background: 'none',
              border: '1px solid rgba(240,237,230,0.15)', cursor: 'pointer',
              color: isFav ? 'var(--gold)' : 'var(--fg)',
            }}>
            <svg width="18" height="18" viewBox="0 0 24 24"
              fill={isFav ? 'var(--gold)' : 'none'} stroke="currentColor" strokeWidth="1.2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </button>
        </div>
      </div>
    </main>
  );
}

const specLabel: React.CSSProperties = { fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--fg3)' };
const specVal: React.CSSProperties = { fontSize: 14, color: 'var(--fg2)' };
