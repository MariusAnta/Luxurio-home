import { Helmet } from 'react-helmet-async';
import type { Product } from '../lib/api';
import { SITE_URL } from './Seo';

// ── Organization + WebSite (rendered once in the root layout) ───────────────
const ORG_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Luxurio Home',
  url: SITE_URL,
  logo: `${SITE_URL}/fulllogo_transparent.png`,
  description: 'Made-to-order luxury furniture crafted by independent European workshops.',
  foundingDate: '2012',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Milan',
    addressCountry: 'IT',
  },
};

const WEBSITE_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Luxurio Home',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

/** Render on every public page via PublicLayout */
export function GlobalJsonLd() {
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(ORG_LD)}</script>
      <script type="application/ld+json">{JSON.stringify(WEBSITE_LD)}</script>
    </Helmet>
  );
}

// ── Product schema.org/Product + Offer ──────────────────────────────────────
export function ProductLd({ p }: { p: Product }) {
  const price = p.discountPrice ?? p.price;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    ...(p.description ? { description: p.description } : {}),
    ...(p.images.length ? { image: p.images.map((i) => i.url) } : {}),
    brand: { '@type': 'Brand', name: 'Luxurio Home' },
    ...(p.designer
      ? { manufacturer: { '@type': 'Person', name: p.designer } }
      : {}),
    ...(p.material ? { material: p.material } : {}),
    ...(p.color ? { color: p.color } : {}),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: parseFloat(price),
      availability:
        p.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'Luxurio Home' },
      url: `${SITE_URL}/product/${p.slug}`,
    },
    url: `${SITE_URL}/product/${p.slug}`,
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(ld)}</script>
    </Helmet>
  );
}
