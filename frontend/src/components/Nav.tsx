import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();

  function handleLogoClick(e: React.MouseEvent) {
    close();
    if (location.pathname === '/') {
      e.preventDefault();
      document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
    }
  }
  const { dark, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoverCat, setHoverCat] = useState<Category | null>(null);
  // displayedCat is NOT cleared when going back, so the subs panel keeps its
  // content visible while the slide-out animation plays.
  const [displayedCat, setDisplayedCat] = useState<Category | null>(null);
  const [cats, setCats] = useState<Category[]>([]);

  useEffect(() => {
    api.get<Category[]>('/categories').then((r) => setCats(r.data));
  }, []);

  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const close = () => { setMenuOpen(false); setHoverCat(null); setDisplayedCat(null); };
  const openSub = (cat: Category) => { setDisplayedCat(cat); setHoverCat(cat); };
  const closeSub = () => { setHoverCat(null); };
  const rootCats = cats.filter((c) => !c.parentId);
  const childrenOf = (id: string) => cats.filter((c) => c.parentId === id);
  const displayedSubs = displayedCat ? childrenOf(displayedCat.id) : [];

  return (
    <>
      <header
        className={`nav${(scrolled || !isHome || hovering) ? ' scrolled' : ''}`}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <div className="nav-left">
          <button type="button" className="nav-menu-btn" onClick={() => setMenuOpen(true)} aria-label="Menu" title="Menu">
            <svg width="22" height="10" viewBox="0 0 22 10" fill="none" stroke="currentColor" strokeWidth="1">
              <line x1="0" y1="1" x2="22" y2="1" />
              <line x1="0" y1="9" x2="22" y2="9" />
            </svg>
          </button>
        </div>

        <Link to="/" className="nav-wordmark" onClick={handleLogoClick} aria-label="Luxurio Home">
          <img src="/grayscale_transparent_nobuffer.png" alt="Luxurio Home" className="nav-wordmark-img" />
        </Link>

        <div className="nav-right">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link nav-icon-btn"
            aria-label="Instagram"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4.5"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
          </a>
          {user ? (
            <>
              <Link to="/favorites" className="nav-link nav-favs" aria-label={t('nav.favorites')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {favorites.size > 0 && <span className="nav-favs-count">{favorites.size}</span>}
              </Link>
              <button
                type="button"
                onClick={() => { logout(); navigate('/'); }}
                className="nav-link nav-icon-btn"
                aria-label={t('nav.logout')}
                title={`${user.name?.split(' ')[0] || user.email.split('@')[0]} — ${t('nav.logout')}`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onAuthOpen}
              className="nav-link nav-icon-btn"
              aria-label={t('nav.signIn')}
              title={t('nav.signIn')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
          )}
          <LanguageSwitcher />
          <button
            type="button"
            onClick={toggle}
            className="nav-link nav-icon-btn"
            aria-label="Toggle theme"
          >
            {dark ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Backdrop */}
      <div className={`menu-backdrop${menuOpen ? ' open' : ''}`} onClick={close} />

      {/* Full-screen menu overlay */}
      <div className={`menu-overlay${menuOpen ? ' open' : ''}${hoverCat ? ' has-sub' : ''}`}>
        <div className="menu-overlay-bar">
          <button type="button" className="menu-close-btn" onClick={close} aria-label="Close">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
              <line x1="1" y1="1" x2="11" y2="11" />
              <line x1="11" y1="1" x2="1" y2="11" />
            </svg>
            <span>Close</span>
          </button>
          <div className="menu-overlay-bar-right">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={toggle}
              className="nav-link nav-icon-btn"
              aria-label="Toggle theme"
            >
              {dark ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <div className="menu-overlay-body">
          {/* Left: parent categories */}
          <nav className="menu-cats-col" aria-label="Collections">
            <Link
              to="/shop"
              className="menu-cat-all"
              onClick={close}
            >
              All Collections
            </Link>
            {rootCats.map((cat) => {
              const hasKids = childrenOf(cat.id).length > 0;
              if (!hasKids) {
                return (
                  <Link
                    key={cat.id}
                    to={`/shop?category=${cat.slug}`}
                    className="menu-cat-item menu-cat-item--leaf"
                    onClick={close}
                  >
                    {cat.name}
                  </Link>
                );
              }
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`menu-cat-item${hoverCat?.id === cat.id ? ' active' : ''}`}
                  onClick={() => openSub(cat)}
                >
                  <span>{cat.name}</span>
                  <svg className="menu-cat-arrow" width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
                    <polyline points="1.5,1 6.5,6 1.5,11" />
                  </svg>
                </button>
              );
            })}
            <div className="menu-cats-divider" />


            {/* Utility links */}
            <div className="menu-util-links">
              {user ? (
                <>
                  <Link to="/favorites" className="menu-util-link" onClick={close}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    Favorites{favorites.size > 0 ? ` · ${favorites.size}` : ''}
                  </Link>
                  <button type="button" className="menu-util-link" onClick={() => { logout(); navigate('/'); close(); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                    {user.name?.split(' ')[0] || user.email.split('@')[0]} · {t('nav.logout')}
                  </button>
                </>
              ) : (
                <button type="button" className="menu-util-link" onClick={() => { onAuthOpen(); close(); }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  {t('nav.signIn')}
                </button>
              )}
            </div>
          </nav>

          {/* Right: subcategories for active parent */}
          <div className="menu-subs-col">
            {displayedCat && (
              <div className="menu-subs-inner" key={displayedCat.id}>
                <button type="button" className="menu-subs-back" onClick={closeSub}>
                  <svg width="7" height="12" viewBox="0 0 7 12" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
                    <polyline points="6,1 1,6 6,11" />
                  </svg>
                  Back
                </button>
                <p className="menu-subs-heading">{displayedCat.name}</p>
                <Link
                  to={`/shop?category=${displayedCat.slug}`}
                  className="menu-sub-link menu-sub-link--all"
                  onClick={close}
                >
                  View all {displayedCat.name}
                </Link>
                {displayedSubs.map((sub) => (
                  <Link
                    key={sub.id}
                    to={`/shop?category=${sub.slug}`}
                    className="menu-sub-link"
                    onClick={close}
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
