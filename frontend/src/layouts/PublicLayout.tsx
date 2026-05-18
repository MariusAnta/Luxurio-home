import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Nav } from '../components/Nav';
import { Footer } from '../components/sections';
import { AuthModal } from '../components/AuthModal';
import { useReveal } from '../components/primitives';
import { GlobalJsonLd } from '../components/JsonLd';
import { CookieBanner } from '../components/CookieBanner';
import { api } from '../lib/api';
import i18n from '../i18n';

export interface PublicOutletContext {
  openAuth: () => void;
}

/** Fetches admin-edited content from the DB and deep-merges it into i18n,
 *  so every existing t() call automatically uses the live text. */
function useContentLoader() {
  useEffect(() => {
    api.get<{ value: Record<string, unknown> | null }>('/settings/content')
      .then(({ data }) => {
        if (data.value && typeof data.value === 'object') {
          i18n.addResourceBundle('en', 'translation', data.value, true, true);
          i18n.addResourceBundle('lt', 'translation', data.value, true, true);
          i18n.addResourceBundle('ru', 'translation', data.value, true, true);
        }
      })
      .catch(() => {/* silently use defaults */});
  }, []);
}

export function PublicLayout() {
  useReveal();
  useContentLoader();
  const [authOpen, setAuthOpen] = useState(false);
  return (
    <>
      <GlobalJsonLd />
      <Nav onAuthOpen={() => setAuthOpen(true)} />
      <Outlet context={{ openAuth: () => setAuthOpen(true) } satisfies PublicOutletContext} />
      <Footer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <CookieBanner />
    </>
  );
}
