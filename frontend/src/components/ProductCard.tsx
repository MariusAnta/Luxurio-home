import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Product, formatPrice, resolveUrl } from '../lib/api';
import { ImgOrPlaceholder } from './primitives';
import { useUserAuth } from '../lib/userAuth';

interface Props {
  product: Product;
  bg?: string;
  onRequireAuth: () => void;
}

export function ProductCard({ product, bg = '#f0ece4', onRequireAuth }: Props) {
  const { user, favorites, toggleFavorite } = useUserAuth();
  const isFav = favorites.has(product.id);
  const [lightbox, setLightbox] = useState<number | null>(null);

  // Resolve display price — when variants exist show lowest effective price
  const variants = product.variants ?? [];
  const hasVariants = variants.length > 0;
  const hasDiscount = !hasVariants && product.discountPrice != null && Number(product.discountPrice) < Number(product.price);
  const minPrice = hasVariants
    ? Math.min(...variants.map(v => (v.discountPrice != null && v.discountPrice < v.price ? v.discountPrice : v.price)))
    : null;

  const imgs = product.images;
  const total = imgs.length;

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight' && total > 1) setLightbox(i => i !== null ? (i + 1) % total : null);
      if (e.key === 'ArrowLeft' && total > 1) setLightbox(i => i !== null ? (i - 1 + total) % total : null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, total]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightbox === null) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = orig; };
  }, [lightbox]);

  async function onHeart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return onRequireAuth();
    try { await toggleFavorite(product.id); } catch { /* */ }
  }

  return (
    <div>
      {/* ── Image — click opens lightbox ── */}
      <div
        className="pc-thumb"
        role="button"
        tabIndex={0}
        aria-label={`View photos of ${product.name}`}
        onClick={() => setLightbox(0)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLightbox(0); } }}
        style={{ cursor: 'zoom-in' }}
      >
        <ImgOrPlaceholder
          id={`pr${product.id}`}
          url={product.images[0]?.url}
          alt={product.name}
          bg={bg}
          className="pc-thumb-img"
          style={{ paddingBottom: '125%' }}
        />
        <img
          src="/fulllogo_transparent_nobuffer.png"
          alt=""
          aria-hidden="true"
          className="pc-brand"
        />
        {hasDiscount && <div className="pc-sale">Sale</div>}
        <button
          onClick={onHeart}
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          className="pc-heart"
        >
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill={isFav ? 'var(--gold)' : 'none'}
            stroke={isFav ? 'var(--gold)' : 'var(--fg)'}
            strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>
        <div className="pc-quick">View Photos</div>
        {total > 1 && <div className="pc-img-count">{total}</div>}
      </div>

      {/* ── Name / price — click navigates to product ── */}
      <Link to={`/product/${product.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
        <div className="pc-meta">
          <div style={{ minWidth: 0, width: '100%', textAlign: 'center' }}>
            <p className="pc-name">{product.name}</p>
            {product.designer && <p className="pc-designer">{product.designer}</p>}
            {hasVariants && minPrice != null && (
              <p className="pc-from-price">nuo {formatPrice(minPrice)}</p>
            )}
          </div>
        </div>
      </Link>

      {/* ── Lightbox ── */}
      {lightbox !== null && (
        <div className="lb-overlay" onClick={() => setLightbox(null)} role="dialog" aria-modal="true" aria-label={`${product.name} photo gallery`}>
          {/* Top bar */}
          <div className="lb-topbar" onClick={e => e.stopPropagation()}>
            <span className="lb-topbar-name">{product.name}</span>
            <Link
              to={`/product/${product.slug}`}
              className="lb-view-product"
              onClick={() => setLightbox(null)}
            >
              View Product →
            </Link>
          </div>

          <button className="lb-close" onClick={() => setLightbox(null)} aria-label="Close gallery">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {total > 1 && (
            <button className="lb-arrow lb-arrow-prev" aria-label="Previous"
              onClick={e => { e.stopPropagation(); setLightbox((lightbox - 1 + total) % total); }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          )}

          <div className="lb-img-wrap" onClick={e => e.stopPropagation()}>
            <img
              key={lightbox}
              src={resolveUrl(imgs[lightbox]?.url ?? '')}
              alt={`${product.name} — photo ${lightbox + 1}`}
              className="lb-img"
            />
          </div>

          {total > 1 && (
            <button className="lb-arrow lb-arrow-next" aria-label="Next"
              onClick={e => { e.stopPropagation(); setLightbox((lightbox + 1) % total); }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          )}

          {total > 1 && (
            <div className="lb-thumbs" onClick={e => e.stopPropagation()}>
              {imgs.map((img, i) => (
                <button key={img.id} className={`lb-thumb${i === lightbox ? ' active' : ''}`}
                  onClick={() => setLightbox(i)}>
                  <img src={resolveUrl(img.url)} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
