import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api, Product, formatPrice } from '../lib/api';
import { ImgOrPlaceholder, useReveal } from './primitives';
import { ProductCard } from './ProductCard';

interface SectionProps { onRequireAuth: () => void; }

export function Featured({ onRequireAuth: _onRequireAuth }: SectionProps) {
  const [tab, setTab] = useState<'details' | 'materials' | 'shipping'>('details');
  const [product, setProduct] = useState<Product | null>(null);
  const { t } = useTranslation();
  useReveal();

  useEffect(() => {
    api.get('/products', { params: { featured: true, limit: 1 } })
      .then((r) => setProduct(r.data.items[0] ?? null));
  }, []);

  if (!product) return null;

  const hasDiscount = product.discountPrice && Number(product.discountPrice) < Number(product.price);

  return (
    <section data-screen-label="Featured Product" style={{ padding: '140px 56px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 96, alignItems: 'center' }}>
      <div className="reveal" style={{ position: 'relative' }}>
        <div style={{ position: 'relative', paddingBottom: '125%', overflow: 'hidden' }}>
          <ImgOrPlaceholder id="feat" url={product.images[0]?.url} alt={product.name} bg="#1c1916" style={{ position: 'absolute', inset: 0 }} />
        </div>
        <div style={{ position: 'absolute', top: -16, right: -16, background: 'var(--gold)', color: 'var(--bg)', padding: '10px 18px', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          {hasDiscount ? t('featured.onSale') : t('featured.newSeason')}
        </div>
      </div>
      <div className="reveal">
        <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 16 }}>{t('featured.eyebrow')}</p>
        <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(32px, 3.5vw, 60px)', lineHeight: 1, marginBottom: 8 }}>{product.name}</h2>
        {product.designer && (
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--fg2)', marginBottom: 28 }}>
            {t('featured.designedBy', { designer: product.designer })}
          </p>
        )}
        <p style={{ fontSize: 13, letterSpacing: '0.08em', color: 'var(--gold)', marginBottom: 36 }}>
          {hasDiscount ? (
            <>
              <span style={{ color: 'var(--fg3)', textDecoration: 'line-through', marginRight: 12 }}>
                {formatPrice(product.price)}
              </span>
              {t('featured.from', { price: formatPrice(product.discountPrice!) })}
            </>
          ) : (
            <>{t('featured.from', { price: formatPrice(product.price) })}</>
          )}
        </p>
        <div style={{ borderTop: '1px solid rgba(240,237,230,0.08)', marginBottom: 24 }}>
          <div style={{ display: 'flex' }}>
            {(['details', 'materials', 'shipping'] as const).map((tk) => (
              <button key={tk} onClick={() => setTab(tk)} style={{
                background: 'none', border: 'none',
                borderBottom: tab === tk ? '1px solid var(--fg)' : '1px solid transparent',
                padding: '14px 24px 12px',
                fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase',
                cursor: 'pointer', color: tab === tk ? 'var(--fg)' : 'var(--fg3)',
                transition: 'color 0.3s', marginTop: -1,
              }}>{t(`featured.tab${tk.charAt(0).toUpperCase() + tk.slice(1)}`)}</button>
            ))}
          </div>
        </div>
        {tab === 'details' && <p style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.8, color: 'var(--fg2)', maxWidth: 420 }}>{product.description}</p>}
        {tab === 'materials' && <p style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.8, color: 'var(--fg2)', maxWidth: 420 }}>
          {product.material || t('featured.materialsFallback')}{product.dimensions ? ` · ${product.dimensions}` : ''}
        </p>}
        {tab === 'shipping' && <p style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.8, color: 'var(--fg2)', maxWidth: 420 }}>
          {t('featured.shippingNote')}
        </p>}
        <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
          <Link to={`/product/${product.slug}`} style={{ flex: 1 }}>
            <button className="btn" style={{ width: '100%' }}>{t('featured.viewPiece')}</button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Editorial() {
  const { t } = useTranslation();
  return (
    <section data-screen-label="Editorial" style={{ background: 'var(--bg2)', padding: '120px 56px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', borderTop: '1px solid rgba(240,237,230,0.05)' }}>
      <div className="reveal">
        <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 28 }}>{t('editorial.eyebrow')}</p>
        <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(36px, 3.5vw, 64px)', lineHeight: 1.05, marginBottom: 32 }}>
          {t('editorial.titleLine1')}<br />{t('editorial.titleLine2')}<br /><em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>{t('editorial.titleAccent')}</em>
        </h2>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.85, color: 'var(--fg2)', maxWidth: 440, marginBottom: 40 }}>
          {t('editorial.body')}
        </p>
      </div>
      <div className="reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        {[
          'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=700',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=700',
          'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=700',
          'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=700',
        ].map((src, i) => (
          <img key={i} src={src} alt="" style={{ width: '100%', paddingBottom: '0', aspectRatio: '1/1.3', objectFit: 'cover', display: 'block' }} />
        ))}
      </div>
    </section>
  );
}

export function NewArrivals({ onRequireAuth }: SectionProps) {
  const [items, setItems] = useState<Product[]>([]);
  const { t } = useTranslation();
  useReveal();

  useEffect(() => {
    api.get('/products', { params: { limit: 4 } })
      .then((r) => setItems(r.data.items));
  }, []);

  return (
    <section data-screen-label="Products" style={{ padding: '100px 56px' }}>
      <div className="reveal" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 56 }}>
        <div>
          <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 12 }}>{t('newArrivals.eyebrow')}</p>
          <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(28px, 3vw, 48px)' }}>{t('newArrivals.title')}</h2>
        </div>
        <Link to="/shop" style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg3)', borderBottom: '1px solid rgba(240,237,230,0.15)', paddingBottom: 3 }}>{t('newArrivals.viewAll')}</Link>
      </div>
      <div className="prod-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
        {items.map((p) => <ProductCard key={p.id} product={p} onRequireAuth={onRequireAuth} />)}
      </div>
    </section>
  );
}

export function Services() {
  const { t } = useTranslation();
  return (
    <section data-screen-label="Services" style={{ background: 'var(--bg3)', padding: '120px 56px', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 80, alignItems: 'center', borderTop: '1px solid rgba(240,237,230,0.05)' }}>
      <div className="reveal" style={{ position: 'relative', paddingBottom: '65%' }}>
        <img
          src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200"
          alt="Interior consultation"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div className="reveal">
        <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 20 }}>{t('services.eyebrow')}</p>
        <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(28px, 3vw, 52px)', lineHeight: 1.1, marginBottom: 24 }}>
          {t('services.titleLine1')}<br /><em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>{t('services.titleAccent')}</em>
        </h2>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.85, color: 'var(--fg2)', marginBottom: 36 }}>
          {t('services.body')}
        </p>
        {[t('services.step1'), t('services.step2'), t('services.step3'), t('services.step4')].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
            <div style={{ width: 20, height: 1, background: 'var(--gold2)', flexShrink: 0 }} />
            <span style={{ fontSize: 12, letterSpacing: '0.06em', color: 'var(--fg2)' }}>{s}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const { t } = useTranslation();
  return (
    <section data-screen-label="Newsletter" style={{ padding: '120px 56px', textAlign: 'center', borderTop: '1px solid rgba(240,237,230,0.06)' }}>
      <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 20 }}>{t('newsletter.eyebrow')}</p>
      <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(32px, 3.5vw, 56px)', marginBottom: 12 }}>{t('newsletter.title')}</h2>
      <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--fg2)', marginBottom: 48 }}>
        {t('newsletter.body')}
      </p>
      {!done ? (
        <form onSubmit={(e) => { e.preventDefault(); if (email) setDone(true); }} style={{ display: 'flex', maxWidth: 480, margin: '0 auto' }}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('newsletter.placeholder')}
            style={{ flex: 1, padding: '16px 24px', border: '1px solid rgba(240,237,230,0.12)', borderRight: 'none', background: 'transparent', outline: 'none', fontSize: 13 }}
            required
          />
          <button type="submit" style={{ padding: '16px 28px', background: 'var(--fg)', color: 'var(--bg)', border: 'none', cursor: 'pointer', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            {t('newsletter.subscribe')}
          </button>
        </form>
      ) : (
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 20, color: 'var(--fg2)' }}>{t('newsletter.thanks')}</p>
      )}
    </section>
  );
}

export function Footer() {
  const { t } = useTranslation();

  const socials = [
    {
      label: 'Instagram',
      href: 'https://instagram.com',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <circle cx="12" cy="12" r="4.5"/>
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
        </svg>
      ),
    },
    {
      label: 'Pinterest',
      href: 'https://pinterest.com',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.18-.76 1.23-5.22 1.23-5.22s-.31-.63-.31-1.56c0-1.46.85-2.55 1.9-2.55.9 0 1.33.67 1.33 1.48 0 .9-.58 2.25-.87 3.5-.25 1.04.52 1.89 1.54 1.89 1.85 0 3.27-1.95 3.27-4.77 0-2.49-1.79-4.23-4.35-4.23-2.96 0-4.7 2.22-4.7 4.51 0 .89.34 1.85.77 2.37.08.1.09.19.07.29l-.29 1.17c-.05.19-.16.23-.37.14-1.39-.65-2.26-2.68-2.26-4.32 0-3.51 2.55-6.74 7.35-6.74 3.86 0 6.86 2.75 6.86 6.42 0 3.83-2.41 6.91-5.76 6.91-1.13 0-2.18-.59-2.54-1.28l-.69 2.58c-.25.97-.93 2.18-1.38 2.92.04.01.09.02.13.03"/>
        </svg>
      ),
    },
    {
      label: 'LinkedIn',
      href: 'https://linkedin.com',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="2" width="20" height="20" rx="3"/>
          <line x1="8" y1="11" x2="8" y2="16"/>
          <line x1="8" y1="8" x2="8" y2="8.5" strokeWidth="2"/>
          <path d="M12 11v5M12 14a2 2 0 014 0v2"/>
        </svg>
      ),
    },
  ];

  return (
    <footer style={{ background: '#080706', color: 'var(--fg)', padding: '80px 56px 40px', borderTop: '1px solid rgba(240,237,230,0.05)' }}>
      {/* Main row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: 64, marginBottom: 72 }}>

        {/* Brand */}
        <div>
          <img
            src="/fulllogo_transparent.png"
            alt="Luxurio Home"
            style={{ height: 60, filter: 'invert(1)', objectFit: 'contain', marginBottom: 20 }}
          />
          <p style={{ fontFamily: 'var(--serif)', fontSize: 15, lineHeight: 1.8, color: 'var(--fg3)', maxWidth: 300, marginBottom: 32 }}>
            {t('footer.tagline')}
          </p>
          {/* Social icons */}
          <div style={{ display: 'flex', gap: 18 }}>
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                style={{ color: 'var(--fg3)', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--fg)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--fg3)')}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Navigate */}
        <div>
          <p style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 24 }}>Navigate</p>
          {[
            { label: 'Shop All Pieces', to: '/shop' },
            { label: 'Featured Collection', to: '/shop?featured=true' },
            { label: 'New Arrivals', to: '/shop?sort=newest' },
            { label: 'Sale', to: '/shop?sale=true' },
            { label: 'Our Story', to: '/our-story' },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              style={{ display: 'block', fontSize: 13, color: 'rgba(240,237,230,0.45)', marginBottom: 14, letterSpacing: '0.03em', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(240,237,230,0.8)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(240,237,230,0.45)')}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Contact */}
        <div>
          <p style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 24 }}>Contact</p>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'rgba(240,237,230,0.45)', lineHeight: 1.9 }}>
            Via della Spiga 12<br />
            20121 Milan, Italy<br />
            <a
              href="mailto:hello@luxurio.home"
              style={{ color: 'rgba(240,237,230,0.45)', borderBottom: '1px solid rgba(240,237,230,0.15)', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(240,237,230,0.8)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(240,237,230,0.45)')}
            >
              hello@luxurio.home
            </a>
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(240,237,230,0.06)', paddingTop: 28 }}>
        <p style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--fg3)' }}>{t('footer.rights')}</p>
      </div>
    </footer>
  );
}
