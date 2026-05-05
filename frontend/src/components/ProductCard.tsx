import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product, formatPrice } from '../lib/api';
import { ImgOrPlaceholder } from './primitives';
import { useUserAuth } from '../lib/userAuth';

interface Props {
  product: Product;
  bg?: string;
  onRequireAuth: () => void;
}

export function ProductCard({ product, bg = '#1a1714', onRequireAuth }: Props) {
  const [hov, setHov] = useState(false);
  const { user, favorites, toggleFavorite } = useUserAuth();
  const isFav = favorites.has(product.id);
  const hasDiscount = product.discountPrice != null && Number(product.discountPrice) < Number(product.price);

  async function onHeart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return onRequireAuth();
    try { await toggleFavorite(product.id); } catch { /* */ }
  }

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ cursor: 'pointer' }}>
      <Link to={`/product/${product.slug}`} style={{ display: 'block' }}>
        <div style={{ position: 'relative', overflow: 'hidden', marginBottom: 20 }}>
          <ImgOrPlaceholder
            id={`pr${product.id}`}
            url={product.images[0]?.url}
            alt={product.name}
            bg={bg}
            style={{
              paddingBottom: '125%',
              transform: hov ? 'scale(1.04)' : 'scale(1)',
              transition: 'transform 0.7s cubic-bezier(.19,1,.22,1)',
            }}
          />
          {/* Luxurio brand mark */}
          <img
            src="/fulllogo_transparent_nobuffer.png"
            alt=""
            aria-hidden="true"
            style={{
              position: 'absolute', bottom: 10, left: 10,
              height: 22, filter: 'invert(1)', opacity: 0.35,
              objectFit: 'contain', pointerEvents: 'none',
            }}
          />
          {hasDiscount && (
            <div style={{
              position: 'absolute', top: 12, left: 12,
              background: 'var(--gold)', color: 'var(--bg)',
              padding: '6px 12px', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
            }}>Sale</div>
          )}
          <button
            onClick={onHeart}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            style={{
              position: 'absolute', top: 12, right: 12,
              background: 'rgba(14,13,11,0.7)', border: 'none',
              width: 36, height: 36, borderRadius: '50%',
              display: 'grid', placeItems: 'center', cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'background 0.2s',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24"
              fill={isFav ? 'var(--gold)' : 'none'}
              stroke={isFav ? 'var(--gold)' : 'var(--fg)'}
              strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </button>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'rgba(14,13,11,0.9)', padding: '12px',
            textAlign: 'center', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
            opacity: hov ? 1 : 0, transform: hov ? 'none' : 'translateY(100%)',
            transition: 'opacity 0.3s, transform 0.4s cubic-bezier(.19,1,.22,1)',
          }}>Quick View</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 400, marginBottom: 4 }}>{product.name}</p>
            {product.designer && (
              <p style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--fg3)' }}>{product.designer}</p>
            )}
          </div>
          <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
            {hasDiscount ? (
              <>
                <p style={{ fontSize: 11, color: 'var(--fg3)', textDecoration: 'line-through' }}>
                  {formatPrice(product.price)}
                </p>
                <p style={{ fontSize: 12, color: 'var(--gold)' }}>
                  {formatPrice(product.discountPrice!)}
                </p>
              </>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--fg2)' }}>{formatPrice(product.price)}</p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
