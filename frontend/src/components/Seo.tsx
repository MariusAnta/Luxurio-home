import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Luxurio Home';
export const SITE_URL: string =
  (import.meta.env.VITE_SITE_URL as string | undefined) || 'https://luxuriohome.com';

export const DEFAULT_DESCRIPTION =
  'Luxurio Home — made-to-order luxury furniture crafted by independent European workshops. Milan-founded, design-led, built to last.';

const DEFAULT_OG_IMAGE = `${SITE_URL}/og-cover.jpg`;

export interface SeoProps {
  /** Page title — shown as "{title} | Luxurio Home" */
  title?: string;
  description?: string;
  /** Path relative to site root, e.g. "/shop" */
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'product';
  noindex?: boolean;
  /** Optional breadcrumb trail appended after "Home". Each item needs a name + path. */
  breadcrumbs?: Array<{ name: string; path: string }>;
}

export function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  noindex = false,
  breadcrumbs,
}: SeoProps) {
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} — Luxury Furniture, Made to Order`;
  const url = canonical ? `${SITE_URL}${canonical}` : SITE_URL;

  const breadcrumbLd = breadcrumbs?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          ...breadcrumbs.map((b, i) => ({
            '@type': 'ListItem',
            position: i + 2,
            name: b.name,
            item: `${SITE_URL}${b.path}`,
          })),
        ],
      }
    : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Breadcrumb JSON-LD */}
      {breadcrumbLd && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbLd)}
        </script>
      )}
    </Helmet>
  );
}
