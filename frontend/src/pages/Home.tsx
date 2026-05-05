import { useOutletContext } from 'react-router-dom';
import { Hero, Marquee } from '../components/Hero';
import { Editorial, NewArrivals, Services, Newsletter, Featured } from '../components/sections';
import { Collections } from '../components/Collections';
import type { PublicOutletContext } from '../layouts/PublicLayout';

export function Home() {
  const { openAuth } = useOutletContext<PublicOutletContext>();
  return (
    <>
      <Hero />
      <Marquee />
      <Collections />
      <Featured onRequireAuth={openAuth} />
      <Editorial />
      <NewArrivals onRequireAuth={openAuth} />
      <Services />
      <Newsletter />
    </>
  );
}
