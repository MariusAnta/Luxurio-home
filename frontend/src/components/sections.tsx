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
  const [nlEmail, setNlEmail] = useState('');
  const [nlDone, setNlDone] = useState(false);

  const socials = [
    {
      label: 'Instagram',
      href: 'https://instagram.com',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.428 1.808-2.428.853 0 1.267.641 1.267 1.408 0 .858-.546 2.142-.828 3.33-.236.995.498 1.806 1.476 1.806 1.77 0 3.13-1.866 3.13-4.56 0-2.383-1.713-4.048-4.158-4.048-2.832 0-4.494 2.124-4.494 4.32 0 .855.33 1.771.741 2.27a.3.3 0 0 1 .069.285c-.076.312-.243.995-.276 1.134-.044.183-.145.222-.334.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.966-.527-2.292-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
        </svg>
      ),
    },
    {
      label: 'TikTok',
      href: 'https://tiktok.com',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
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

      {/* ── Newsletter + Socials row ── */}
      <div className="foot-top-row">
        <div className="foot-nl-wrap">
          <p className="foot-nl-label">Subscribe to our newsletter</p>
          {nlDone ? (
            <p className="foot-nl-thanks">Thank you for subscribing.</p>
          ) : (
            <form
              className="foot-nl-form"
              onSubmit={e => { e.preventDefault(); if (nlEmail) setNlDone(true); }}
            >
              <input
                type="email"
                className="foot-nl-input"
                placeholder="Your e-mail address"
                value={nlEmail}
                onChange={e => setNlEmail(e.target.value)}
              />
              <button type="submit" className="foot-nl-btn">Subscribe</button>
            </form>
          )}
        </div>
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

      <div className="foot-divider" />

      {/* ── 4-column link grid ── */}
      <div className="foot-cols">

        {/* Explore */}
        <div>
          <p className="foot-col-head">Explore</p>
          {[
            { label: 'Shop All Pieces', to: '/shop' },
            { label: 'Featured Collection', to: '/shop?featured=true' },
            { label: 'New Arrivals', to: '/shop?sort=newest' },
            { label: 'Our Story', to: '/our-story' },
            { label: 'Trade Programme', to: '/our-story' },
          ].map((item) => (
            <Link key={item.label} to={item.to} className="foot-nav-link">
              {item.label}
            </Link>
          ))}
        </div>

        {/* Client Care */}
        <div>
          <p className="foot-col-head">Client Care</p>
          {[
            { label: 'Contact Us', to: '/our-story' },
            { label: 'FAQ', to: '/our-story' },
            { label: 'Shipping & Delivery', to: '/our-story' },
            { label: 'Returns', to: '/our-story' },
          ].map((item) => (
            <Link key={item.label} to={item.to} className="foot-nav-link">
              {item.label}
            </Link>
          ))}
          <p className="foot-col-head" style={{ marginTop: 'var(--sp-7)' }}>Contact</p>
          <p className="foot-contact">
            Via della Spiga 12<br />
            20121 Milan, Italy
          </p>
          <a href="mailto:hello@luxurio.home" className="foot-email">
            hello@luxurio.home
          </a>
        </div>

        {/* Company */}
        <div>
          <p className="foot-col-head">Company</p>
          {[
            { label: 'Our Story', to: '/our-story' },
            { label: 'Sustainability', to: '/our-story' },
            { label: 'Press', to: '/our-story' },
            { label: 'Work With Us', to: '/our-story' },
          ].map((item) => (
            <Link key={item.label} to={item.to} className="foot-nav-link">
              {item.label}
            </Link>
          ))}
        </div>

        {/* Legal */}
        <div>
          <p className="foot-col-head">Legal</p>
          {[
            { label: 'Privacy Policy', to: '/privacy' },
            { label: 'Cookie Policy', to: '/cookies' },
            { label: 'Terms & Conditions', to: '/terms' },
          ].map((item) => (
            <Link key={item.label} to={item.to} className="foot-nav-link">
              {item.label}
            </Link>
          ))}
        </div>

      </div>

      <div className="foot-divider" />

      {/* ── Bottom bar ── */}
      <div className="foot-bottom">
        <p className="foot-copy">© Luxurio Home {new Date().getFullYear()} — Milan</p>
        <p className="foot-copy" style={{ opacity: 0.5 }}>Italy&nbsp;/&nbsp;English</p>
      </div>

    </footer>
    </>
  );
}
