import { useOutletContext } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { NewArrivals, Newsletter } from '../components/sections';
import { Collections } from '../components/Collections';
import { Seo } from '../components/Seo';
import type { PublicOutletContext } from '../layouts/PublicLayout';

export function Home() {
  const { openAuth } = useOutletContext<PublicOutletContext>();
  return (
    <>
      <Seo canonical="/" />
      <Hero />
      <Collections />
      <NewArrivals onRequireAuth={openAuth} />
      <Newsletter />
    </>
  );
}
