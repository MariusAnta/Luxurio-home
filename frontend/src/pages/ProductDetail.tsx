import { useEffect, useState } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
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

// ─── Description parser ───────────────────────────────────────────────────────
function parseProductDescription(raw: string) {
  if (!raw?.includes('MATERIALS')) return null;
  const dimIdx = raw.indexOf('DIMENSIONS');
  // Prepend '.' so the first section also matches the same split pattern
  const materialsText = '.' + raw.slice(raw.indexOf('MATERIALS') + 9, dimIdx > -1 ? dimIdx : undefined);
  const dimText = dimIdx > -1 ? raw.slice(dimIdx + 10) : '';

  // Split on: period + Title-Case-heading + uppercase lookahead (start of body sentence)
  const headingRe = /\.([A-Z][a-z]+(?:\s*\/\s*[A-Z][a-z]+)*(?:\s+[A-Z][a-z]+){0,2})(?=[A-Z])/;
  const parts = materialsText.split(headingRe);
  // parts = ['', heading1, body1, heading2, body2, ...]

  const sections: { heading: string; body: string }[] = [];
  for (let i = 1; i + 1 < parts.length; i += 2) {
    const heading = parts[i].trim();
    let body = parts[i + 1]
      .replace(/Note:[\s\S]*?(?=\.|$)/g, '') // strip Note: clauses
      .replace(/\.\s*$/, '')
      .trim();
    if (heading && body.length > 15) sections.push({ heading, body });
  }

  // Parse dimensions lines (each starts with • or newline)
  const dims = dimText
    .split(/[•\n]/)
    .map(d => d.trim())
    .filter(d => d.length > 2 && !/^(Assembly|Fully|Mattress size)/i.test(d));

  const assembly = /Assembly required|Fully assembled/i.exec(raw)?.[0] ?? null;

  return { sections, dims, assembly };
}

function DescriptionBlock({ text }: { text: string }) {
  const parsed = parseProductDescription(text);

  if (!parsed || parsed.sections.length === 0) {
    // Plain text fallback (old mock products)
    return <p className="pd-desc">{text}</p>;
  }

  const { sections, dims, assembly } = parsed;

  return (
    <div className="pd-desc-structured">
      <p className="pd-desc-section-label">Materials</p>
      <div className="pd-mat-list">
        {sections.map((s, i) => (
          <div key={i} className="pd-mat-row">
            <span className="pd-mat-heading">{s.heading}</span>
            <span className="pd-mat-body">{s.body}</span>
          </div>
        ))}
      </div>

      {dims.length > 0 && (
        <>
          <p className="pd-desc-section-label" style={{ marginTop: 'var(--sp-7)' }}>Dimensions</p>
          <ul className="pd-dim-list">
            {dims.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </>
      )}

      {assembly && (
        <p className="pd-assembly-note">{assembly}</p>
      )}
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

  useEffect(() => {
    if (!slug) return;
    setNotFound(false);
    api.get(`/products/${slug}`)
      .then((r) => { setP(r.data); setActiveImg(0); setView3d(false); })
      .catch(() => setNotFound(true));
  }, [slug]);

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
          <div className="aspect-port" style={{ marginBottom: 'var(--sp-4)' }}>
            <ImgOrPlaceholder
              id={`pdmain${p.id}`}
              url={p.images[activeImg]?.url || p.images[0]?.url}
              alt={p.name}
              style={{ position: 'absolute', inset: 0 }}
            />
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
      <div>
        {p.category && <p className="pd-cat">{p.category.name}</p>}
        <h1 className="pd-title">{p.name}</h1>
        {p.designer && <p className="pd-designer">Designed by {p.designer}</p>}
        <div className="pd-prices">
          {hasDiscount ? (
            <>
              <span className="pd-strike">{formatPrice(p.price)}</span>
              <span className="pd-price">{formatPrice(p.discountPrice!)}</span>
              <span className="pd-pct">-{Math.round((1 - Number(p.discountPrice) / Number(p.price)) * 100)}%</span>
            </>
          ) : (
            <span className="pd-price">{formatPrice(p.price)}</span>
          )}
        </div>
        <p className="pd-excl-vat">{formatPriceExVat(hasDiscount ? p.discountPrice! : p.price)} excl. PVM</p>
        <DescriptionBlock text={p.description ?? ''} />

        <dl className="pd-specs">
          {p.material && (<><dt className="pd-spec-dt">Material</dt><dd className="pd-spec-dd">{p.material}</dd></>)}
          {p.color && (<><dt className="pd-spec-dt">Color</dt><dd className="pd-spec-dd">{p.color}</dd></>)}
          {p.dimensions && (<><dt className="pd-spec-dt">Dimensions</dt><dd className="pd-spec-dd">{p.dimensions}</dd></>)}
          {p.weightKg && (<><dt className="pd-spec-dt">Weight</dt><dd className="pd-spec-dd">{p.weightKg} kg</dd></>)}
          <dt className="pd-spec-dt">Assembly</dt><dd className="pd-spec-dd">{p.assembled ? 'Pre-assembled' : 'Requires assembly'}</dd>
        </dl>

        <div className="pd-actions">
          <button className="btn" style={{ flex: 1 }}>Request a Quote</button>
          <button onClick={onHeart}
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
