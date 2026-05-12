import { useOutletContext } from 'react-router-dom';
import { Hero, Marquee } from '../components/Hero';
import { Editorial, NewArrivals, Services, Newsletter, Featured } from '../components/sections';
import { Collections } from '../components/Collections';
import { Seo } from '../components/Seo';
import type { PublicOutletContext } from '../layouts/PublicLayout';

export function Home() {
  const { openAuth } = useOutletContext<PublicOutletContext>();
  return (
    <>
      <Seo canonical="/" />
      <Hero />
      <Marquee />
      <Collections />
      <Featured />
      <Editorial />
      <NewArrivals onRequireAuth={openAuth} />
      <Services />
      <Newsletter />
    </>
  );
}
