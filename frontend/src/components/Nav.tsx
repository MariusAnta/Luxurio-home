import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserAuth } from '../lib/userAuth';
import { LanguageSwitcher } from './LanguageSwitcher';

interface NavProps { onAuthOpen: () => void; }

export function Nav({ onAuthOpen }: NavProps) {
  const { user, favorites, logout } = useUserAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const linkStyle: React.CSSProperties = {
    fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
    color: 'var(--fg3)', transition: 'color 0.2s', cursor: 'pointer',
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 72,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 56px',
      background: 'rgba(14,13,11,0.97)',
      borderBottom: '1px solid rgba(240,237,230,0.07)',
      backdropFilter: 'blur(12px)',
    }}>
      {/* LEFT: logo + nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <img
            src="/fulllogo_transparent_nobuffer.png"
            alt="Luxurio Home"
            style={{ height: 48, filter: 'invert(1)', objectFit: 'contain' }}
          />
        </Link>
        <div className="nav-links" style={{ display: 'flex', gap: 40 }}>
          <Link to="/shop" style={linkStyle}>{t('nav.collections')}</Link>
          <Link to="/shop?featured=true" style={linkStyle}>{t('nav.featured')}</Link>
          <Link to="/our-story" style={linkStyle}>Atelier</Link>
        </div>
      </div>

      {/* RIGHT: auth + language */}
      <div className="nav-links" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
        {user ? (
          <>
            <Link to="/favorites" style={{ ...linkStyle, position: 'relative' }}>
              {t('nav.favorites')}
              {favorites.size > 0 && (
                <span style={{ marginLeft: 8, color: 'var(--gold)', fontSize: 10 }}>({favorites.size})</span>
              )}
            </Link>
            <span style={linkStyle}>{user.name || user.email.split('@')[0]}</span>
            <a onClick={() => { logout(); navigate('/'); }} style={linkStyle}>{t('nav.logout')}</a>
          </>
        ) : (
          <a onClick={onAuthOpen} style={linkStyle}>{t('nav.signIn')}</a>
        )}
        <LanguageSwitcher />
      </div>
    </nav>
  );
}
