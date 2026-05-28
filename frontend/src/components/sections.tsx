import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api, Product } from '../lib/api';
import { useReveal } from './primitives';
import { ProductCard } from './ProductCard';
import { usePageContent } from '../lib/usePageContent';

interface SectionProps { onRequireAuth: () => void; }

export function NewArrivals({ onRequireAuth }: SectionProps) {
  const [items, setItems] = useState<Product[]>([]);
  const { t } = useTranslation();
  const c = usePageContent();
  useReveal();

  useEffect(() => {
    api.get('/settings/new_season').then(r => {
      const ids: string[] = Array.isArray(r.data.value) ? r.data.value.filter(Boolean) : [];
      if (ids.length) {
        api.get('/products', { params: { ids: ids.join(',') } })
          .then(r2 => setItems(r2.data.items));
      } else {
        api.get('/products', { params: { limit: 4 } })
          .then(r2 => setItems(r2.data.items));
      }
    }).catch(() => {
      api.get('/products', { params: { limit: 4 } })
        .then(r => setItems(r.data.items));
    });
  }, []);

  return (
    <section className="s-arrivals" data-screen-label="Products">
      <div className="reveal arrivals-header">
        <div>
          <p className="t-eyebrow arrivals-eyebrow">{c.newArrivals.eyebrow}</p>
          <h2 className="arrivals-h2">{c.newArrivals.title}</h2>
        </div>
        <Link to="/shop" className="arrivals-viewall">{t('newArrivals.viewAll')}</Link>
      </div>
      <div className="prod-grid">
        {items.map((p) => <ProductCard key={p.id} product={p} onRequireAuth={onRequireAuth} />)}
      </div>
    </section>
  );
}

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const { t } = useTranslation();
  const c = usePageContent();
  return (
    <section className="s-newsletter" data-screen-label="Newsletter">
      <p className="t-eyebrow" style={{ marginBottom: 'var(--sp-5)' }}>{c.newsletter.eyebrow}</p>
      <h2 className="newsletter-h2">{c.newsletter.title}</h2>
      <p className="newsletter-sub">{c.newsletter.body}</p>
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

interface FooterProps {
  onWorkWithUsOpen: () => void;
}

export function Footer({ onWorkWithUsOpen }: FooterProps) {
  const [nlEmail, setNlEmail] = useState('');
  const [nlDone, setNlDone] = useState(false);
  const [partnerOpen, setPartnerOpen] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerSurname, setPartnerSurname] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerMessage, setPartnerMessage] = useState('');
  const c = usePageContent();

  useEffect(() => {
    if (!partnerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPartnerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [partnerOpen]);

  const submitPartnerForm = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent('Partnership enquiry - Luxurio Home');
    const body = encodeURIComponent(
      [
        `Name: ${partnerName}`,
        `Surname: ${partnerSurname}`,
        `Email: ${partnerEmail}`,
        '',
        'Message:',
        partnerMessage,
      ].join('\n')
    );
    window.location.href = `mailto:info@luxuriohome.com?subject=${subject}&body=${body}`;
    setPartnerOpen(false);
    setPartnerName('');
    setPartnerSurname('');
    setPartnerEmail('');
    setPartnerMessage('');
  };

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
  ];

  const copyText = c.footer.copyText.replace('{year}', String(new Date().getFullYear()));

  return (
    <>
    <section className="s-trade">
      <p className="t-eyebrow trade-eyebrow">{c.trade.eyebrow}</p>
      <h2 className="trade-h2">{c.trade.title}</h2>
      <p className="trade-body">{c.trade.body}</p>
      <button type="button" className="btn trade-cta" onClick={() => setPartnerOpen(true)}>{c.trade.ctaLabel}</button>
    </section>

    {partnerOpen && (
      <div className="modal-backdrop" onClick={() => setPartnerOpen(false)}>
        <div className="modal partner-modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setPartnerOpen(false)} aria-label="Close">x</button>
          <h2>Partner with Luxurio Home</h2>
          <p className="partner-modal-sub">Leave your details and message, and we will prepare the email for info@luxuriohome.com.</p>
          <form className="partner-form" onSubmit={submitPartnerForm}>
            <div className="partner-form-row">
              <input
                type="text"
                className="partner-input"
                placeholder="Name"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                required
              />
              <input
                type="text"
                className="partner-input"
                placeholder="Surname"
                value={partnerSurname}
                onChange={(e) => setPartnerSurname(e.target.value)}
                required
              />
            </div>
            <input
              type="email"
              className="partner-input"
              placeholder="E-mail address"
              value={partnerEmail}
              onChange={(e) => setPartnerEmail(e.target.value)}
              required
            />
            <textarea
              className="partner-textarea"
              placeholder="Your message"
              value={partnerMessage}
              onChange={(e) => setPartnerMessage(e.target.value)}
              rows={6}
              required
            />
            <button type="submit" className="btn trade-cta partner-submit">Send email</button>
          </form>
        </div>
      </div>
    )}

    <footer className="site-footer">

      {/* ── Newsletter + Socials row ── */}
      <div className="foot-top-row">
        <div className="foot-nl-wrap">
          <p className="foot-nl-label">{c.footer.newsletterLabel}</p>
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
            { label: 'New Arrivals', to: '/shop?sort=newest' },
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
            {c.footer.contactAddressLine1}<br />
            {c.footer.contactAddressLine2}
          </p>
          <a href={`mailto:${c.footer.contactEmail}`} className="foot-email">
            {c.footer.contactEmail}
          </a>
          {c.footer.contactPhone && (
            <a href={`tel:${c.footer.contactPhone.replace(/\s/g, '')}`} className="foot-email" style={{ display: 'block', marginTop: 8 }}>
              {c.footer.contactPhone}
            </a>
          )}
        </div>

        {/* Company */}
        <div>
          <p className="foot-col-head">Company</p>
          <Link to="/shop" className="foot-nav-link">Our Collections</Link>
          <button type="button" className="foot-nav-link foot-nav-link-btn" onClick={onWorkWithUsOpen}>Work With Us</button>
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
        <p className="foot-copy">{copyText}</p>
        <p className="foot-copy" style={{ opacity: 0.5 }}>{c.footer.localeLabel}</p>
      </div>

    </footer>
    </>
  );
}
