import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

const SITE_URL = (process.env.SITE_URL || 'https://luxuriohome.com').replace(/\/$/, '');

function esc(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry({ loc, lastmod, changefreq, priority }) {
  return [
    '  <url>',
    `    <loc>${esc(loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : '',
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
}

router.get('/sitemap.xml', async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });

    const staticEntries = [
      { loc: `${SITE_URL}/`, changefreq: 'weekly', priority: '1.0' },
      { loc: `${SITE_URL}/shop`, changefreq: 'daily', priority: '0.9' },
      { loc: `${SITE_URL}/our-story`, changefreq: 'monthly', priority: '0.7' },
    ];

    const productEntries = products.map((p) => ({
      loc: `${SITE_URL}/product/${p.slug}`,
      lastmod: p.updatedAt.toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.8',
    }));

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...productEntries].map(urlEntry).join('\n')}
</urlset>`;

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch {
    res.status(500).type('xml').send('<?xml version="1.0"?><error>Internal Server Error</error>');
  }
});

export default router;
