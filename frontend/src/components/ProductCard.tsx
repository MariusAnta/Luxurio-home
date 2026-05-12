import { Link } from 'react-router-dom';
import { Product, formatPrice, formatPriceExVat } from '../lib/api';
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
  const hasDiscount = product.discountPrice != null && Number(product.discountPrice) < Number(product.price);

  async function onHeart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return onRequireAuth();
    try { await toggleFavorite(product.id); } catch { /* */ }
  }

  return (
    <div>
      <Link to={`/product/${product.slug}`} style={{ display: 'block' }}>
        <div className="pc-thumb">
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
          <div className="pc-quick">Quick View</div>
        </div>
        <div className="pc-meta">
          <div style={{ minWidth: 0 }}>
            <p className="pc-name">{product.name}</p>
            {product.designer && <p className="pc-designer">{product.designer}</p>}
          </div>
          <div className="pc-prices">
            {hasDiscount ? (
              <>
                <p className="pc-strike">{formatPrice(product.price)}</p>
                <p className="pc-price">{formatPrice(product.discountPrice!)}</p>
              </>
            ) : (
              <p className="pc-price-reg">{formatPrice(product.price)}</p>
            )}
          </div>
          <p className="pc-excl-vat">{formatPriceExVat(hasDiscount ? product.discountPrice! : product.price)} excl. PVM</p>
        </div>
      </Link>
    </div>
  );
}
