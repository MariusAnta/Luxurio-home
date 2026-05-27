import React, { useEffect, useState } from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import { api, Product, formatPrice, formatPriceExVat } from '../lib/api';
import { ImgOrPlaceholder } from '../components/primitives';
import { useUserAuth } from '../lib/userAuth';
import { Seo } from '../components/Seo';
import { ProductLd } from '../components/JsonLd';
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

// ─── Structured materials block ─────────────────────────────────────────────
function MaterialsBlock({ raw }: { raw?: string | null }) {
  if (!raw) return null;
  let entries: { name: string; desc: string }[] = [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) entries = parsed;
  } catch { return null; }
  if (entries.length === 0) return null;
  return (
    <div className="pd-desc-structured" style={{ marginTop: 'var(--sp-6)' }}>
      <p className="pd-desc-section-label">Materials</p>
      <div className="pd-mat-list">
        {entries.map((e, i) => (
          <div key={i} className="pd-mat-row">
            <span className="pd-mat-heading" style={{ fontStyle: 'italic' }}>{e.name}</span>
            <span className="pd-mat-body">{e.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function ProductDetail() {
  const { slug } = useParams();
  const { openAuth } = useOutletContext<PublicOutletContext>();
  const { user, favorites, toggleFavorite } = useUserAuth();
  const [p, setP] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [view3d, setView3d] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  useEffect(() => {
    if (!slug) return;
    setNotFound(false);
    api.get(`/products/${slug}`)
      .then((r) => { setP(r.data); setActiveImg(0); setView3d(false); })
      .catch(() => setNotFound(true));
  }, [slug]);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (!p) return;
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') setLightbox(i => i !== null ? (i + 1) % p.images.length : null);
      if (e.key === 'ArrowLeft') setLightbox(i => i !== null ? (i - 1 + p.images.length) % p.images.length : null);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [lightbox, p]);

  // Inject model-viewer script only when this page mounts and product has a 3D model
  useEffect(() => {
    if (!p?.modelUrl) return;
    if (document.querySelector('script[data-model-viewer]')) return;
    const s = document.createElement('script');
    s.type = 'module';
    s.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js';
    s.setAttribute('data-model-viewer', '');
    document.head.appendChild(s);
  }, [p?.modelUrl]);

  if (notFound) return <main className="pd-state">Product not found.</main>;
  if (!p) return <main className="pd-state">Loading…</main>;

  const isFav = favorites.has(p.id);
  const hasDiscount = p.discountPrice && Number(p.discountPrice) < Number(p.price);

  async function onHeart() {
    if (!p) return;
    if (!user) return openAuth();
    await toggleFavorite(p.id);
  }

  return (
    <main className="detail-grid">
      <Seo
        title={p.name}
        description={p.description
          ? p.description.slice(0, 155)
          : `${p.name} by ${p.designer ?? 'Luxurio Home'} — made-to-order luxury furniture.`}
        canonical={`/product/${p.slug}`}
        ogType="product"
        ogImage={p.images[0]?.url}
        breadcrumbs={[
          { name: 'Shop', path: '/shop' },
          ...(p.category ? [{ name: p.category.name, path: `/shop?category=${p.category.slug}` }] : []),
          { name: p.name, path: `/product/${p.slug}` },
        ]}
      />
      <ProductLd p={p} />
      <div>
        {/* 3D / Photo toggle */}
        {p.modelUrl && (
          <div className="pd-view-toggle">
            {(['Photos', '3D View'] as const).map((label) => {
              const active = label === '3D View' ? view3d : !view3d;
              return (
                <button key={label} onClick={() => setView3d(label === '3D View')}
                  className={`pd-view-btn${active ? ' active' : ''}`}>
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {view3d && p.modelUrl ? (
          <div className="aspect-port" style={{ marginBottom: 'var(--sp-4)', background: 'var(--bg2)' }}>
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
          <div style={{ position: 'relative', marginBottom: 'var(--sp-4)', cursor: 'zoom-in' }} onClick={() => setLightbox(activeImg)}>
            <ImgOrPlaceholder
              id={`pdmain${p.id}`}
              url={p.images[activeImg]?.url || p.images[0]?.url}
              alt={p.name}
              className="pd-main-img"
              style={{ paddingBottom: '125%' }}
            />
            {p.images.length > 1 && (
              <span className="pd-img-count">{p.images.length} photos</span>
            )}
          </div>
        )}

        {!view3d && p.images.length > 1 && (
          <div className="pd-thumbs" style={{ gridTemplateColumns: `repeat(${Math.min(p.images.length, 5)}, 1fr)` }}>
            {p.images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveImg(i)}
                className="pd-thumb-btn"
                style={{ border: i === activeImg ? '1px solid var(--gold)' : '1px solid transparent' }}
              >
                <img src={img.url} alt="" loading="lazy" decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightbox !== null && (
        <div className="lb-overlay" onClick={() => setLightbox(null)} role="dialog" aria-modal="true" aria-label="Photo gallery">
          <button className="lb-close" onClick={() => setLightbox(null)} aria-label="Close gallery">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <div className="lb-counter">{lightbox + 1} / {p.images.length}</div>

          {p.images.length > 1 && (
            <button className="lb-arrow lb-arrow-prev" aria-label="Previous"
              onClick={e => { e.stopPropagation(); setLightbox((lightbox - 1 + p.images.length) % p.images.length); }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          )}

          <div className="lb-img-wrap" onClick={e => e.stopPropagation()}>
            <img
              key={lightbox}
              src={p.images[lightbox]?.url}
              alt={`${p.name} — photo ${lightbox + 1}`}
              className="lb-img"
            />
          </div>

          {p.images.length > 1 && (
            <button className="lb-arrow lb-arrow-next" aria-label="Next"
              onClick={e => { e.stopPropagation(); setLightbox((lightbox + 1) % p.images.length); }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          )}

          {p.images.length > 1 && (
            <div className="lb-thumbs" onClick={e => e.stopPropagation()}>
              {p.images.map((img, i) => (
                <button key={img.id} className={`lb-thumb${i === lightbox ? ' active' : ''}`}
                  onClick={() => setLightbox(i)}>
                  <img src={img.url} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Right panel ── */}
      <div className="pd-info">

        {/* Meta row: category + stock */}
        <div className="pd-meta">
          <div className="pd-breadcrumb">
            <Link to="/shop" className="pd-breadcrumb-link">Shop</Link>
            {p.category && (
              <>
                <span className="pd-breadcrumb-sep">/</span>
                <Link to={`/shop?category=${p.category.slug}`} className="pd-breadcrumb-link">{p.category.name}</Link>
              </>
            )}
          </div>
          <span className={`pd-stock-badge ${p.stock === 0 ? 'out' : p.stock <= 3 ? 'low' : 'in'}`}>
            {p.stock === 0 ? 'Out of stock' : p.stock <= 3 ? `Only ${p.stock} left` : `${p.stock} in stock`}
          </span>
        </div>

        {/* Title + designer */}
        <h1 className="pd-title">{p.name}</h1>
        {p.designer && <p className="pd-designer">By {p.designer}</p>}

        {/* Price */}
        <div className="pd-prices">
          {hasDiscount ? (
            <>
              <span className="pd-strike">{formatPrice(p.price)}</span>
              <span className="pd-price">{formatPrice(p.discountPrice!)}</span>
              <span className="pd-pct">−{Math.round((1 - Number(p.discountPrice) / Number(p.price)) * 100)}%</span>
            </>
          ) : (
            <span className="pd-price">{formatPrice(p.price)}</span>
          )}
        </div>
        <p className="pd-excl-vat">{formatPriceExVat(hasDiscount ? p.discountPrice! : p.price)} excl. PVM</p>

        <div className="pd-divider" />

        {/* Description */}
        {p.description && <p className="pd-desc">{p.description}</p>}

        {/* Materials */}
        <MaterialsBlock raw={p.material} />

        {/* Specs */}
        {(p.color || p.dimensions || p.weightKg || p.assembled !== undefined) && (
          <div className="pd-specs-block">
            <p className="pd-section-label">Specifications</p>
            <dl className="pd-specs">
              {p.color && (
                <>
                  <dt className="pd-spec-dt">Colour</dt>
                  <dd className="pd-spec-dd">{p.color.split(',').map(s => s.trim()).filter(Boolean).join(', ')}</dd>
                </>
              )}
              {p.dimensions && (() => {
                try {
                  const dims: { name: string; value: string }[] = JSON.parse(p.dimensions!);
                  if (Array.isArray(dims) && dims.length > 0) return dims.map((d, i) => (
                    <React.Fragment key={i}>
                      <dt className="pd-spec-dt">{d.name || 'Dimensions'}</dt>
                      <dd className="pd-spec-dd">{d.value}</dd>
                    </React.Fragment>
                  ));
                } catch { /* legacy */ }
                return (
                  <React.Fragment>
                    <dt className="pd-spec-dt">Dimensions</dt>
                    <dd className="pd-spec-dd">{p.dimensions}</dd>
                  </React.Fragment>
                );
              })()}
              {p.weightKg != null && (
                <>
                  <dt className="pd-spec-dt">Weight</dt>
                  <dd className="pd-spec-dd">{p.weightKg} kg</dd>
                </>
              )}
              <dt className="pd-spec-dt">Assembly</dt>
              <dd className="pd-spec-dd">{p.assembled ? 'Pre-assembled' : 'Requires assembly'}</dd>
            </dl>
          </div>
        )}

        <div className="pd-divider" />

        {/* Actions */}
        <div className="pd-actions">
          <a
            href={`mailto:hello@luxurio.home?subject=${encodeURIComponent(`Quote Request: ${p.name}`)}&body=${encodeURIComponent(`Hi,\n\nI would like to request a quote for: ${p.name}\n\nProduct link: ${window.location.href}`)}`}
            className="btn pd-quote-btn"
          >
            Request a Quote
          </a>
          <button
            onClick={onHeart}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            className="pd-fav"
            style={{ color: isFav ? 'var(--gold)' : 'var(--fg)' }}
          >
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
