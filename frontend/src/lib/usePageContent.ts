/**
 * usePageContent — fetches /settings/content once per app session (cached in module scope)
 * and returns the merged content object.
 *
 * Falls back to hardcoded defaults if the API returns nothing.
 */
import { useEffect, useState } from 'react';
import { api } from './api';

export interface PageContent {
  hero: {
    season: string;
    titleLine1: string;
    titleArt: string;
    titleLine2: string;
    titleLine3: string;
    tagline: string;
    established: string;
  };
  newArrivals: {
    eyebrow: string;
    title: string;
  };
  collections: {
    eyebrow: string;
    title: string;
    viewAll: string;
  };
  shop: {
    eyebrow: string;
    title: string;
  };
  newsletter: {
    eyebrow: string;
    title: string;
    body: string;
  };
  trade: {
    eyebrow: string;
    title: string;
    body: string;
    ctaLabel: string;
    ctaEmail: string;
  };
  footer: {
    tagline: string;
    contactAddressLine1: string;
    contactAddressLine2: string;
    contactEmail: string;
    newsletterLabel: string;
    copyText: string;
    localeLabel: string;
  };
  images: {
    heroVideoUrl: string;
    heroImg: string;
    heroImages: string[];
    storyHeroImg: string;
    storyWorkshopImg: string;
  };
  story: {
    heroEyebrow: string;
    heroTitle1: string;
    heroTitleArt: string;
    heroTitle2: string;
    heroBody: string;
    manifestoQuote: string;
    manifestoAttr: string;
    workshopEyebrow: string;
    workshopTitle1: string;
    workshopTitleArt: string;
    workshopBody: string;
    ctaTitle: string;
  };
}

export const CONTENT_DEFAULTS: PageContent = {
  hero: {
    season: 'S/S 2026 — Collection N° 001',
    titleLine1: 'The',
    titleArt: 'Art',
    titleLine2: 'of',
    titleLine3: 'Stillness.',
    tagline: 'Furniture conceived for spaces that refuse to shout. Handmade in Italy. Built to last decades.',
    established: 'Est. 2012 · Milan',
  },
  newArrivals: {
    eyebrow: 'Just Arrived',
    title: 'New This Season',
  },
  collections: {
    eyebrow: 'Curated Rooms',
    title: 'Our Collections',
    viewAll: 'View All',
  },
  shop: {
    eyebrow: 'The Collection',
    title: 'Shop All',
  },
  newsletter: {
    eyebrow: 'Stay in Touch',
    title: 'The Luxurio Home Letter',
    body: 'New arrivals, stories, and private events — once a month.',
  },
  trade: {
    eyebrow: 'For Design Professionals',
    title: 'Partner With Luxurio Home',
    body: 'We collaborate with interior designers, architects and hospitality projects worldwide. Our trade programme offers exclusive access to the full collection, bespoke commission services and dedicated account support.',
    ctaLabel: 'Get in Touch',
    ctaEmail: 'info@luxuriohome.com',
  },
  footer: {
    tagline: 'Fine furnishings for spaces of lasting significance. Handcrafted in Europe since 2012.',
    contactAddressLine1: 'Via della Spiga 12',
    contactAddressLine2: '20121 Milan, Italy',
    contactEmail: 'info@luxuriohome.com',
    newsletterLabel: 'Subscribe to our newsletter',
    copyText: '© Luxurio Home {year} — Milan',
    localeLabel: 'Italy / English',
  },
  images: {
    heroVideoUrl: '/hero-video.mp4',
    heroImg: '',
    heroImages: [],
    storyHeroImg: '',
    storyWorkshopImg: '',
  },
  story: {
    heroEyebrow: 'Our Story',
    heroTitle1: 'Fourteen years of',
    heroTitleArt: 'stillness',
    heroTitle2: 'over noise.',
    heroBody: 'Luxurio Home was founded in Milan in 2012 by two architects who believed furniture should outlast fashion — not chase it. Today, we work with a small circle of European workshops to make pieces that are conceived slowly, made by hand, and built to be lived with for decades.',
    manifestoQuote: 'We do not believe in seasons. We believe in pieces that earn their place — in a room, in a life, in a story being written over years, not weeks.',
    manifestoAttr: '— The Luxurio Home Manifesto',
    workshopEyebrow: 'The hands behind the work',
    workshopTitle1: 'Ten workshops.',
    workshopTitleArt: 'One standard.',
    workshopBody: 'Every Luxurio Home piece is made by one of ten independent workshops in Italy, Portugal, and Denmark — family-run ateliers we have visited and worked with for years. We name each maker on every product page, because anonymity has no place in craft.',
    ctaTitle: 'Discover the pieces that carry our story.',
  },
};

// Module-level cache so we only fetch once per page load
let cached: PageContent | null = null;
let promise: Promise<PageContent> | null = null;

export function mergeDeep(base: PageContent, over: Record<string, unknown>): PageContent {
  const result = JSON.parse(JSON.stringify(base)) as PageContent;
  for (const section of Object.keys(over) as Array<keyof PageContent>) {
    if (over[section] && typeof over[section] === 'object' && result[section]) {
      Object.assign(result[section], over[section]);
    }
  }
  return result;
}

export function clearContentCache() {
  cached = null;
  promise = null;
}

function fetchContent(): Promise<PageContent> {
  if (promise) return promise;
  promise = api.get<{ value: Record<string, unknown> | null }>('/settings/content')
    .then(({ data }) => {
      const merged = data.value ? mergeDeep(CONTENT_DEFAULTS, data.value) : CONTENT_DEFAULTS;
      cached = merged;
      return merged;
    })
    .catch(() => {
      cached = CONTENT_DEFAULTS;
      return CONTENT_DEFAULTS;
    });
  return promise;
}

export function usePageContent(): PageContent {
  const [content, setContent] = useState<PageContent>(cached ?? CONTENT_DEFAULTS);

  useEffect(() => {
    if (cached) { setContent(cached); return; }
    fetchContent().then(setContent);
  }, []);

  return content;
}
