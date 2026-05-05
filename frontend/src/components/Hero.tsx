import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, Product } from '../lib/api';

export function Hero() {
  const [loaded, setLoaded] = useState(false);
  const [featured, setFeatured] = useState<Product | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
    api.get('/products', { params: { featured: true, limit: 1 } })
      .then((r) => setFeatured(r.data.items[0] ?? null))
      .catch(() => {});
  }, []);

  const heroImg = featured?.images[0]?.url;

  return (
    <section data-screen-label="Hero" style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', position: 'relative' }}>
      <div style={{ padding: '140px 56px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid rgba(240,237,230,0.05)' }}>
        <div>
          <p style={{ fontSize: 9, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 48, opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(16px)', transition: 'opacity 1s 0.2s, transform 1s 0.2s' }}>
            {t('hero.season')}
          </p>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(72px, 8vw, 130px)', lineHeight: 0.88, letterSpacing: '-0.02em', opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(48px)', transition: 'opacity 1.4s 0.4s cubic-bezier(.19,1,.22,1), transform 1.4s 0.4s cubic-bezier(.19,1,.22,1)' }}>
            {t('hero.titleLine1')}<br /><em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>{t('hero.titleArt')}</em><br />{t('hero.titleLine2')}<br />{t('hero.titleLine3')}
          </h1>
        </div>
        <div style={{ opacity: loaded ? 1 : 0, transition: 'opacity 1.2s 1s' }}>
          <div style={{ width: 40, height: 1, background: 'var(--gold2)', marginBottom: 20 }} />
          <p style={{ fontSize: 13, lineHeight: 1.85, color: 'var(--fg2)', maxWidth: 340, letterSpacing: '0.03em', marginBottom: 40 }}>
            {t('hero.tagline')}
          </p>
          <div style={{ display: 'flex', gap: 48, alignItems: 'center' }}>
            <a href="#collections" style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', borderBottom: '1px solid rgba(240,237,230,0.2)', paddingBottom: 4, transition: 'border-color 0.3s' }}>
              {t('hero.exploreCollections')}
              <svg width="20" height="8" viewBox="0 0 20 8" fill="none">
                <line x1="0" y1="4" x2="17" y2="4" stroke="currentColor" strokeWidth="1" />
                <polyline points="14,1 17,4 14,7" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
            </a>
            <span style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg3)' }}>{t('hero.established')}</span>
          </div>
        </div>
      </div>
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {heroImg ? (
          <img src={heroImg} alt="Featured piece" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: '#1e1b17' }} />
        )}
        <div style={{ position: 'absolute', top: 80, right: 32, writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: 9, letterSpacing: '0.3em', color: 'var(--fg3)' }}>LUXURIO HOME — 2026</div>
        <div style={{ position: 'absolute', bottom: 40, left: 32, fontSize: 9, letterSpacing: '0.3em', color: 'var(--fg3)' }}>001 / 048</div>
      </div>
      <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: loaded ? 0.4 : 0, transition: 'opacity 1s 1.5s' }}>
        <span style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--fg3)' }}>{t('hero.scroll')}</span>
        <div style={{ width: 1, height: 32, background: 'linear-gradient(to bottom, var(--fg3), transparent)' }} />
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
    <div style={{ borderTop: '1px solid rgba(240,237,230,0.06)', borderBottom: '1px solid rgba(240,237,230,0.06)', height: 42, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 64, whiteSpace: 'nowrap', animation: 'marquee 26s linear infinite' }}>
        {rep.map((txt, i) => (
          <span key={i} style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--fg3)' }}>
            {txt} <span style={{ opacity: 0.3, marginLeft: 32 }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
