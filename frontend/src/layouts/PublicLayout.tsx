import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Nav } from '../components/Nav';
import { Footer } from '../components/sections';
import { AuthModal } from '../components/AuthModal';
import { useReveal } from '../components/primitives';

export interface PublicOutletContext {
  openAuth: () => void;
}

export function PublicLayout() {
  useReveal();
  const [authOpen, setAuthOpen] = useState(false);
  return (
    <>
      <Nav onAuthOpen={() => setAuthOpen(true)} />
      <Outlet context={{ openAuth: () => setAuthOpen(true) } satisfies PublicOutletContext} />
      <Footer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
