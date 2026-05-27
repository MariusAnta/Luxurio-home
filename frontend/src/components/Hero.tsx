import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, Product, resolveUrl } from '../lib/api';
import { usePageContent } from '../lib/usePageContent';

type HeroSlide = { url: string; name?: string };

export function Hero() {
  const [loaded, setLoaded] = useState(false);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [imgKey, setImgKey] = useState(0);
  const pausedRef = useRef(false);
  const { t } = useTranslation();
  const c = usePageContent();

  const heroImages = c.images.heroImages ?? [];

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
  }, []);

  // Use custom hero images if configured, otherwise fall back to products
  useEffect(() => {
    if (heroImages.length > 0) {
      setSlides(heroImages.map((url) => ({ url })));
      setActiveIdx(0);
      return;
    }
    api.get('/products', { params: { limit: 10 } })
      .then((r) => {
        const all: Product[] = (r.data.items ?? []).filter((p: Product) => p.images.length > 0);
        setSlides(all.map((p) => ({ url: p.images[0].url, name: p.name })));
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroImages.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      if (!pausedRef.current) {
        setActiveIdx((i) => (i + 1) % slides.length);
        setImgKey((k) => k + 1);
      }
    }, 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  function goTo(i: number) {
    if (i === activeIdx) return;
    setActiveIdx(i);
    setImgKey((k) => k + 1);
  }

  const slide = slides[activeIdx] ?? null;
  const heroImg = slide?.url || c.images.heroImg;
  const cls = (base: string) => `${base}${loaded ? ' in' : ''}`;

  return (
    <section
      id="hero"
      className="hero"
      data-screen-label="Hero"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      {/* Full-bleed background — featured product image carousel */}
      <div className={cls('hero-bg')}>
        {heroImg ? (
          <img
            key={imgKey}
            src={resolveUrl(heroImg)}
            alt={slide?.name ?? 'Featured piece'}
            className="hero-bg-img"
            loading="eager"
          />
        ) : (
          <div className="hero-bg-fallback" />
        )}
        <div className="hero-bg-vignette" />
      </div>

      {/* Bottom row: title left + CTAs right */}
      <div className={cls('hero-overlay')}>
        <div className="hero-overlay-text">
          <p className="hero-season">{c.hero.season}</p>
          <h1 className="hero-title">
            {c.hero.titleLine1}<br />
            {c.hero.titleArt}<br />
            {c.hero.titleLine2}{c.hero.titleLine3 ? <><br />{c.hero.titleLine3}</> : null}
          </h1>

        </div>
        <div className="hero-overlay-ctas">
          <a href="#collections" className="hero-cta-link">{t('hero.exploreCollections')}</a>
          <span className="hero-cta-link hero-cta-link-soft">{c.hero.tagline}</span>
        </div>
      </div>

      {/* Right vertical pagination markers */}
      {slides.length > 1 && (
        <div className={cls('hero-markers')}>
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`hero-marker${i === activeIdx ? ' active' : ''}`}
            />
          ))}
        </div>
      )}

      {/* Year/brand vertical tag */}
      <div className="hero-year-tag">LUXURIO HOME — 2026</div>
    </section>
  );
}
