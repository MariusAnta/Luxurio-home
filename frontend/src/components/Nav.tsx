import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserAuth } from '../lib/userAuth';
import { LanguageSwitcher } from './LanguageSwitcher';
import { api, Category } from '../lib/api';
import { useTheme } from '../lib/useTheme';

interface NavProps { onAuthOpen: () => void; }

export function Nav({ onAuthOpen }: NavProps) {
  const { user, favorites, logout } = useUserAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openCollections() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setCollectionsOpen(true);
  }
  function scheduleCloseCollections() {
    closeTimer.current = setTimeout(() => setCollectionsOpen(false), 200);
  }
  const [mobileCollOpen, setMobileCollOpen] = useState(false);
  const [openParentId, setOpenParentId] = useState<string | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const close = () => { setMenuOpen(false); setMobileCollOpen(false); setOpenParentId(null); };

  useEffect(() => {
    api.get<Category[]>('/categories').then((r) => setCats(r.data));
  }, []);

  const rootCats = cats.filter((c) => !c.parentId);
  const childrenOf = (id: string) => cats.filter((c) => c.parentId === id);

  return (
    <>
      <nav className="nav">
        {/* LEFT: logo + nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-9)' }}>
          <Link to="/" onClick={close} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <img
              src="/fulllogo_transparent_nobuffer.png"
              alt="Luxurio Home"
              className="nav-logo"
            />
          </Link>
          <div className="nav-links" style={{ display: 'flex', gap: 'var(--sp-8)' }}>
            {/* Collections with mega-dropdown */}
            <div
              className="nav-collections-wrap"
              onMouseEnter={openCollections}
              onMouseLeave={scheduleCloseCollections}
            >
              <Link to="/shop" className="nav-link nav-collections-trigger">
                {t('nav.collections')}
                <span className="nav-caret" style={{ opacity: collectionsOpen ? 0.9 : 0.45 }}>▾</span>
              </Link>
              {collectionsOpen && rootCats.length > 0 && (
                <div className="nav-collections-dropdown" onMouseEnter={openCollections} onMouseLeave={scheduleCloseCollections}>
                  {rootCats.map((parent) => {
                    const kids = childrenOf(parent.id);
                    return (
                      <div key={parent.id} className="nav-col">
                        <Link
                          to={`/shop?category=${parent.slug}`}
                          className="nav-col-title"
                          onClick={() => setCollectionsOpen(false)}
                        >
                          {parent.name}
                        </Link>
                        {kids.map((kid) => (
                          <Link
                            key={kid.id}
                            to={`/shop?category=${kid.slug}`}
                            className="nav-col-child"
                            onClick={() => setCollectionsOpen(false)}
                          >
                            {kid.name}
                          </Link>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <Link to="/shop?featured=true" className="nav-link">{t('nav.featured')}</Link>
            <Link to="/our-story" className="nav-link">Atelier</Link>
          </div>
        </div>

        {/* RIGHT: auth + language + hamburger */}
        <div style={{ display: 'flex', gap: 'var(--sp-7)', alignItems: 'center' }}>
          <div className="nav-links" style={{ display: 'flex', gap: 'var(--sp-7)', alignItems: 'center' }}>
            {user ? (
              <>
                <Link to="/favorites" className="nav-link" style={{ position: 'relative' }}>
                  {t('nav.favorites')}
                  {favorites.size > 0 && (
                    <span style={{ marginLeft: 'var(--sp-2)', color: 'var(--gold)', fontSize: 'var(--text-xs)' }}>({favorites.size})</span>
                  )}
                </Link>
                <span className="nav-link">{user.name || user.email.split('@')[0]}</span>
                <button type="button" onClick={() => { logout(); navigate('/'); }} className="nav-link">{t('nav.logout')}</button>
              </>
            ) : (
              <button type="button" onClick={onAuthOpen} className="nav-link">{t('nav.signIn')}</button>
            )}
            <LanguageSwitcher />
            <button
              type="button"
              onClick={toggle}
              className="nav-link"
              aria-label="Toggle theme"
              style={{ display: 'flex', alignItems: 'center', padding: 0, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {dark ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="nav-link"
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4.5"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </a>
          </div>

          {/* Hamburger button — visible on mobile only */}
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span style={{ transform: menuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
            <span style={{ opacity: menuOpen ? 0 : 1 }} />
            <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
          </button>
        </div>
      </nav>

      {/* Mobile full-screen menu */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {/* Collections accordion */}
        <div>
          <button
            type="button"
            className="m-link"
            onClick={() => setMobileCollOpen((o) => !o)}
            style={{ display: 'flex', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
          >
            {t('nav.collections')}
            <span style={{ opacity: 0.45, fontSize: 16 }}>{mobileCollOpen ? '−' : '+'}</span>
          </button>
          {mobileCollOpen && (
            <div className="mobile-collections">
              <Link to="/shop" onClick={close} className="mobile-cat-all">All Collections</Link>
              {rootCats.map((parent) => {
                const kids = childrenOf(parent.id);
                const isOpen = openParentId === parent.id;
                return (
                  <div key={parent.id}>
                    <button
                      type="button"
                      className="mobile-cat-parent mobile-cat-parent-btn"
                      onClick={() => setOpenParentId(isOpen ? null : parent.id)}
                    >
                      {parent.name}
                      {kids.length > 0 && (
                        <span className="mobile-cat-caret" style={{ opacity: isOpen ? 0.9 : 0.45 }}>{isOpen ? '−' : '+'}</span>
                      )}
                    </button>
                    {isOpen && (
                      <div className="mobile-cat-children">
                        <Link to={`/shop?category=${parent.slug}`} onClick={close} className="mobile-cat-child mobile-cat-viewall">
                          View all {parent.name}
                        </Link>
                        {kids.map((kid) => (
                          <Link key={kid.id} to={`/shop?category=${kid.slug}`} onClick={close} className="mobile-cat-child">
                            {kid.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <Link to="/shop?featured=true" onClick={close}>{t('nav.featured')}</Link>
        <Link to="/our-story" onClick={close}>Atelier</Link>
        {user ? (
          <>
            <Link to="/favorites" onClick={close}>
              {t('nav.favorites')}{favorites.size > 0 ? ` (${favorites.size})` : ''}
            </Link>
            <button type="button" onClick={() => { logout(); navigate('/'); close(); }} className="nav-link">{t('nav.logout')}</button>
          </>
        ) : (
          <button type="button" onClick={() => { onAuthOpen(); close(); }} className="nav-link">{t('nav.signIn')}</button>
        )}
        <div style={{ padding: 'var(--sp-6) 0', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
          <LanguageSwitcher />
          <button
            type="button"
            onClick={toggle}
            className="nav-link"
            aria-label="Toggle theme"
            style={{ display: 'flex', alignItems: 'center', padding: 0, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {dark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
