import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, Product } from '../lib/api';

export function Hero() {
  const [loaded, setLoaded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [imgKey, setImgKey] = useState(0);
  const pausedRef = useRef(false);
  const { t } = useTranslation();

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
    api.get('/products', { params: { featured: true, limit: 10 } })
      .then((r) => setProducts(r.data.items ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (products.length <= 1) return;
    const id = setInterval(() => {
      if (!pausedRef.current) {
        setActiveIdx((i) => (i + 1) % products.length);
        setImgKey((k) => k + 1);
      }
    }, 5000);
    return () => clearInterval(id);
  }, [products.length]);

  function goTo(i: number) {
    if (i === activeIdx) return;
    setActiveIdx(i);
    setImgKey((k) => k + 1);
  }

  const product = products[activeIdx] ?? null;
  const heroImg = product?.images[0]?.url;
  const cls = (base: string) => `${base}${loaded ? ' in' : ''}`;

  return (
    <section
      className="hero"
      data-screen-label="Hero"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      {/* Left: text column */}
      <div className="hero-text">
        <div>
          <p className={cls('t-eyebrow hero-season')} style={{ marginBottom: 'var(--sp-9)' }}>
            {t('hero.season')}
          </p>
          <h1 className={cls('hero-title hero-title-wrap')}>
            {t('hero.titleLine1')}<br />
            <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>{t('hero.titleArt')}</em><br />
            {t('hero.titleLine2')}<br />
            {t('hero.titleLine3')}
          </h1>
        </div>

        <div className={cls('hero-bottom')}>
          <div className="gold-rule" style={{ marginBottom: 'var(--sp-5)' }} />
          <p className="hero-tagline">{t('hero.tagline')}</p>
          <div className="hero-cta-row">
            <a href="#collections" className="hero-cta-link">
              {t('hero.exploreCollections')}
              <svg width="20" height="8" viewBox="0 0 20 8" fill="none">
                <line x1="0" y1="4" x2="17" y2="4" stroke="currentColor" strokeWidth="1" />
                <polyline points="14,1 17,4 14,7" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
            </a>
            <span className="hero-established">{t('hero.established')}</span>
          </div>
        </div>
      </div>

      {/* Right: image column */}
      <div className="hero-img">
        {heroImg ? (
          <img
            key={imgKey}
            src={heroImg}
            alt={product?.name ?? 'Featured piece'}
            className="cover-abs"
            style={{ animation: 'heroImgIn 1.6s var(--ease-luxe) forwards' }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: '#f0ece4' }} />
        )}

        <div className="hero-year-tag">LUXURIO HOME — 2026</div>

        {product && (
          <div key={`name-${imgKey}`} className="hero-badge" style={{ animation: 'heroTextIn 1s 0.5s var(--ease-luxe) both' }}>
            <p className="t-eyebrow-s" style={{ marginBottom: 'var(--sp-1)' }}>{t('featured.eyebrow')}</p>
            <p className="hero-badge-name">{product.name}</p>
          </div>
        )}

        {products.length > 1 && (
          <div className="hero-dots">
            {products.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
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

      {/* Scroll indicator */}
      <div className={cls('hero-scroll')}>
        <span className="t-eyebrow-s">{t('hero.scroll')}</span>
        <div className="hero-scroll-line" />
      </div>
    </section>
  );
}

export function Marquee() {
  const { t } = useTranslation();
  const items = [
    t('marquee.delivery'),
    t('marquee.bespoke'),
    t('marquee.cities'),
    t('marquee.returns'),
    t('marquee.handcrafted'),
  ];
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
