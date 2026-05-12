import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api, Product, formatPrice, formatPriceExVat } from '../lib/api';
import { ImgOrPlaceholder, useReveal } from './primitives';
import { ProductCard } from './ProductCard';

interface SectionProps { onRequireAuth: () => void; }

export function Featured() {
  const [tab, setTab] = useState<'details' | 'materials' | 'shipping'>('details');
  const [products, setProducts] = useState<Product[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const pausedRef = useRef(false);
  const { t } = useTranslation();
  useReveal();

  useEffect(() => {
    api.get('/products', { params: { featured: true, limit: 10 } })
      .then((r) => setProducts(r.data.items ?? []));
  }, []);

  useEffect(() => {
    if (products.length <= 1) return;
    const id = setInterval(() => {
      if (!pausedRef.current) {
        setActiveIdx((i) => (i + 1) % products.length);
        setAnimKey((k) => k + 1);
        setTab('details');
      }
    }, 5000);
    return () => clearInterval(id);
  }, [products.length]);

  function goTo(i: number) {
    if (i === activeIdx) return;
    setActiveIdx(i);
    setAnimKey((k) => k + 1);
    setTab('details');
  }

  const product = products[activeIdx] ?? null;
  if (!product) return null;

  const hasDiscount = product.discountPrice && Number(product.discountPrice) < Number(product.price);

  return (
    <section
      className="s-featured"
      data-screen-label="Featured Product"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      {/* Image column */}
      <div className="reveal" style={{ position: 'relative' }}>
        <div
          key={`img-${animKey}`}
          className="aspect-port"
          style={{ animation: animKey > 0 ? 'featImgIn 1.2s var(--ease-luxe) forwards' : undefined }}
        >
          <ImgOrPlaceholder id="feat" url={product.images[0]?.url} alt={product.name} bg="#f0ece4" style={{ position: 'absolute', inset: 0 }} />
        </div>
        {hasDiscount && (
          <div className="badge-gold badge-abs">{t('featured.onSale')}</div>
        )}
        {products.length > 1 && (
          <div className="feat-dots">
            {products.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to product ${i + 1}`}
                className="dot"
                style={{
                  width: i === activeIdx ? 28 : 6,
                  background: i === activeIdx ? 'var(--gold)' : 'rgba(26,23,20,0.2)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Text column */}
      <div className="reveal">
        <div
          key={`text-${animKey}`}
          style={{ animation: animKey > 0 ? 'featTextIn 1s var(--ease-luxe) forwards' : undefined }}
        >
          <p className="t-eyebrow feat-eyebrow">{t('featured.eyebrow')}</p>
          <h2 className="feat-h2">{product.name}</h2>
          {product.designer && (
            <p className="feat-designer">
              {t('featured.designedBy', { designer: product.designer })}
            </p>
          )}
          <p className="feat-price">
            {hasDiscount ? (
              <>
                <span style={{ color: 'var(--fg3)', textDecoration: 'line-through', marginRight: 'var(--sp-3)' }}>
                  {formatPrice(product.price)}
                </span>
                {t('featured.from', { price: formatPrice(product.discountPrice!) })}
              </>
            ) : (
              <>{t('featured.from', { price: formatPrice(product.price) })}</>
            )}
          </p>
          <p className="feat-excl-vat">{formatPriceExVat(hasDiscount ? product.discountPrice! : product.price)} excl. PVM</p>
          <div className="feat-tabs">
            {(['details', 'materials', 'shipping'] as const).map((tk) => (
              <button
                key={tk}
                onClick={() => setTab(tk)}
                className={`feat-tab${tab === tk ? ' active' : ''}`}
              >
                {t(`featured.tab${tk.charAt(0).toUpperCase() + tk.slice(1)}`)}
              </button>
            ))}
          </div>
          {tab === 'details' && <p className="feat-body">{product.description}</p>}
          {tab === 'materials' && (
            <p className="feat-body">
              {product.material || t('featured.materialsFallback')}
              {product.dimensions ? ` · ${product.dimensions}` : ''}
            </p>
          )}
          {tab === 'shipping' && <p className="feat-body">{t('featured.shippingNote')}</p>}
          <div className="feat-actions">
            <Link to={`/product/${product.slug}`} style={{ flex: 1 }}>
              <button className="btn" style={{ width: '100%' }}>{t('featured.viewPiece')}</button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Editorial() {
  const { t } = useTranslation();
  return (
    <section className="s-editorial" data-screen-label="Editorial">
      <div className="reveal">
        <p className="t-eyebrow" style={{ marginBottom: 'var(--sp-7)' }}>{t('editorial.eyebrow')}</p>
        <h2 className="editorial-h2">
          {t('editorial.titleLine1')}<br />
          {t('editorial.titleLine2')}<br />
          <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>{t('editorial.titleAccent')}</em>
        </h2>
        <p className="t-prose editorial-body">{t('editorial.body')}</p>
      </div>
      <div className="reveal editorial-grid">
        {[
          'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=700',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=700',
          'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=700',
          'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=700',
        ].map((src, i) => (
          <img key={i} src={src} alt="" style={{ width: '100%', aspectRatio: '1/1.3', objectFit: 'cover', display: 'block' }} />
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
    <section className="s-arrivals" data-screen-label="Products">
      <div className="reveal arrivals-header">
        <div>
          <p className="t-eyebrow arrivals-eyebrow">{t('newArrivals.eyebrow')}</p>
          <h2 className="arrivals-h2">{t('newArrivals.title')}</h2>
        </div>
        <Link to="/shop" className="arrivals-viewall">{t('newArrivals.viewAll')}</Link>
      </div>
      <div className="prod-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--sp-6)' }}>
        {items.map((p) => <ProductCard key={p.id} product={p} onRequireAuth={onRequireAuth} />)}
      </div>
    </section>
  );
}

export function Services() {
  const { t } = useTranslation();
  return (
    <section className="s-services" data-screen-label="Services">
      <div className="reveal services-img">
        <img
          src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200"
          alt="Interior consultation"
          className="cover-abs"
        />
      </div>
      <div className="reveal">
        <p className="t-eyebrow" style={{ marginBottom: 'var(--sp-5)' }}>{t('services.eyebrow')}</p>
        <h2 className="services-h2">
          {t('services.titleLine1')}<br />
          <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>{t('services.titleAccent')}</em>
        </h2>
        <p className="t-prose services-body">{t('services.body')}</p>
        {[t('services.step1'), t('services.step2'), t('services.step3'), t('services.step4')].map((s, i) => (
          <div key={i} className="services-step">
            <div className="services-step-rule" />
            <span className="services-step-text">{s}</span>
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
    <section className="s-newsletter" data-screen-label="Newsletter">
      <p className="t-eyebrow" style={{ marginBottom: 'var(--sp-5)' }}>{t('newsletter.eyebrow')}</p>
      <h2 className="newsletter-h2">{t('newsletter.title')}</h2>
      <p className="newsletter-sub">{t('newsletter.body')}</p>
      {!done ? (
        <form onSubmit={(e) => { e.preventDefault(); if (email) setDone(true); }} className="newsletter-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('newsletter.placeholder')}
            className="newsletter-input"
            required
          />
          <button type="submit" className="newsletter-btn">{t('newsletter.subscribe')}</button>
        </form>
      ) : (
        <p className="newsletter-thanks">{t('newsletter.thanks')}</p>
      )}
    </section>
  );
}

export function Marquee() {
  const { t } = useTranslation();
  const fallback = [
    t('marquee.delivery'),
    t('marquee.bespoke'),
    t('marquee.cities'),
    t('marquee.returns'),
    t('marquee.handcrafted'),
  ];
  const [items, setItems] = useState<string[]>(fallback);

  useEffect(() => {
    api.get<{ value: string[] | null }>('/settings/marquee')
      .then((r) => { if (r.data.value?.length) setItems(r.data.value); })
      .catch(() => {});
  }, []);

  const rep = [...items, ...items];
  return (
    <div className="s-marquee">
      <div className="marquee-track">
        {rep.map((txt, i) => (
          <span key={i} className="marquee-item">
            {txt} <span className="marquee-sep">·</span>
          </span>
        ))}
      </div>
    </div>
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
  ];

  return (
    <>
    <section className="s-trade">
      <div className="trade-inner">
        <div className="trade-text">
          <p className="t-eyebrow t-eyebrow--mb">For Design Professionals</p>
          <h2 className="trade-h2">Partner With Luxurio</h2>
          <p className="trade-body">
            We collaborate with interior designers, architects and hospitality projects worldwide.
            Our trade programme offers exclusive access to the full collection, bespoke commission
            services and dedicated account support.
          </p>
          <div className="trade-actions">
            <a href="mailto:hello@luxurio.home" className="btn">Get in Touch</a>
          </div>
        </div>
        <div className="trade-rule-col" aria-hidden="true">
          <span className="trade-vert-text">Est. 2024 · Milan</span>
        </div>
      </div>
    </section>
    <footer className="site-footer">
      <div className="foot-cols">
        {/* Brand */}
        <div>
          <img src="/fulllogo_transparent.png" alt="Luxurio Home" className="foot-logo" />
          <p className="foot-tagline">{t('footer.tagline')}</p>
          <div className="foot-socials">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="foot-social"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Navigate */}
        <div>
          <p className="foot-col-head">Navigate</p>
          {[
            { label: 'Shop All Pieces', to: '/shop' },
            { label: 'Featured Collection', to: '/shop?featured=true' },
            { label: 'New Arrivals', to: '/shop?sort=newest' },
            { label: 'Sale', to: '/shop?sale=true' },
            { label: 'Our Story', to: '/our-story' },
          ].map((item) => (
            <Link key={item.label} to={item.to} className="foot-nav-link">
              {item.label}
            </Link>
          ))}
        </div>

        {/* Contact */}
        <div>
          <p className="foot-col-head">Contact</p>
          <p className="foot-contact">
            Via della Spiga 12<br />
            20121 Milan, Italy<br />
            <a href="mailto:hello@luxurio.home" className="foot-email">
              hello@luxurio.home
            </a>
          </p>
        </div>
      </div>

      <div className="foot-bottom">
        <p className="foot-copy">{t('footer.rights')}</p>
      </div>
    </footer>
    </>
  );
}
