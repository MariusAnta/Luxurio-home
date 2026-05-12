/**
 * Luxurio Home — Scraper + Seeder v2
 * Run: PUPPETEER_CACHE_DIR=./backend/.puppeteer-cache node prisma/scrape-and-seed.js
 */

import puppeteer from 'puppeteer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE = 'https://luxuriohome.com';

const CATEGORY_DEFS = [
  { slug: 'sofas',             name: 'Sofas',             parent: 'Seating'  },
  { slug: 'lounge-chairs',     name: 'Lounge Chairs',     parent: 'Seating'  },
  { slug: 'armchairs',         name: 'Armchairs',         parent: 'Seating'  },
  { slug: 'dining-chairs',     name: 'Dining Chairs',     parent: 'Seating'  },
  { slug: 'stools',            name: 'Stools',            parent: 'Seating'  },
  { slug: 'tables',            name: 'Tables',            parent: 'Tables'   },
  { slug: 'coffee-tables',     name: 'Coffee Tables',     parent: 'Tables'   },
  { slug: 'dressing-tables',   name: 'Dressing Tables',   parent: 'Tables'   },
  { slug: 'beds',              name: 'Beds',              parent: 'Bedroom'  },
  { slug: 'nightstands',       name: 'Nightstands',       parent: 'Bedroom'  },
  { slug: 'benches',           name: 'Benches',           parent: 'Bedroom'  },
  { slug: 'chest-and-drawers', name: 'Chest & Drawers',   parent: 'Storage'  },
  { slug: 'entrance-cabinets', name: 'Entrance Cabinets', parent: 'Storage'  },
  { slug: 'showcases',         name: 'Showcases',         parent: 'Storage'  },
  { slug: 'carpets',           name: 'Carpets',           parent: 'Textiles' },
];

const NAV_SLUGS = new Set([
  '', 'furniture', 'all-products',
  ...CATEGORY_DEFS.map(c => c.slug),
]);

function slugify(str) {
  return str.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}
async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function collectProductsByCat(page) {
  console.log('\n📂 Collecting product URLs per category...');
  const productToCat = new Map();

  for (const cat of CATEGORY_DEFS) {
    try {
      await page.goto(BASE + '/' + cat.slug, { waitUntil: 'networkidle2', timeout: 30000 });
      await wait(3000);
      try {
        await page.evaluate(async () => {
          for (let i = 0; i < 20; i++) { window.scrollBy(0, 500); await new Promise(r => setTimeout(r, 200)); }
        });
        await wait(1000);
      } catch (e) {}

      const navArr = [...NAV_SLUGS];
      const links = await page.evaluate((navArr) => {
        return [...new Set(Array.from(document.querySelectorAll('a[href]')).map(a => a.href))]
          .filter(h => {
            if (!h.includes('luxuriohome.com')) return false;
            const path = h.replace('https://luxuriohome.com/', '');
            return path && !path.includes('/') && !navArr.includes(path) && !h.startsWith('mailto');
          });
      }, navArr);

      let added = 0;
      links.forEach(url => { if (!productToCat.has(url)) { productToCat.set(url, cat.slug); added++; } });
      console.log('   /' + cat.slug + ': ' + added + ' new products (total: ' + productToCat.size + ')');
    } catch (e) {
      console.log('   x /' + cat.slug + ' failed: ' + e.message);
    }
  }
  return productToCat;
}

async function scrapeProduct(page, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    try { await page.waitForSelector('h1', { timeout: 12000 }); } catch (e) {}
    try { await page.waitForSelector('.block-product__price', { timeout: 6000 }); } catch (e) {}
    await wait(1500);

    return await page.evaluate(() => {
      const name = document.querySelector('h1')?.textContent?.trim() || null;
      if (!name) return null;

      const priceText = document.querySelector('.block-product__price')?.textContent?.trim() || '';
      const priceMatch = priceText.match(/[\d,.]+/);
      const price = priceMatch ? parseFloat(priceMatch[0].replace(',', '.')) : 0;

      const imgs = [...new Set(
        Array.from(document.querySelectorAll('img.product-carousel__image'))
          .map(img => img.getAttribute('data-src') || img.getAttribute('src'))
          .filter(src => src && !src.startsWith('data:') && src.includes('cdn'))
      )].slice(0, 8);

      const paras = Array.from(document.querySelectorAll('p'))
        .map(p => p.textContent.trim())
        .filter(t => t.length > 50 && !/^[\u20AC$]/.test(t));
      const description = paras[0] || '';

      return { name, price, images: imgs, description: description.slice(0, 1200) };
    });
  } catch (e) {
    console.log('   x Failed ' + url + ': ' + e.message);
    return null;
  }
}

async function cleanDatabase() {
  console.log('\n🧹 Cleaning old bad data...');
  const badNames = ['Furniture','All products','Sofas','Lounge chairs','Armchairs','Dining chairs',
    'Stools','Tables','Coffee tables','Dressing tables','Beds','Nightstands','Benches',
    'Chest and drawers','Entrance cabinets','Showcases','Carpets','robotukas'];

  for (const name of badNames) {
    const prod = await prisma.product.findFirst({ where: { name } });
    if (prod) {
      await prisma.productImage.deleteMany({ where: { productId: prod.id } });
      await prisma.favorite.deleteMany({ where: { productId: prod.id } });
      await prisma.product.delete({ where: { id: prod.id } });
      console.log('   deleted "' + name + '"');
    }
  }

  const komodos = await prisma.category.findUnique({ where: { slug: 'komodos' } });
  if (komodos) {
    await prisma.product.deleteMany({ where: { categoryId: komodos.id } });
    await prisma.category.delete({ where: { id: komodos.id } });
    console.log('   deleted Komodos category');
  }

  // Delete old sub-categories that no longer match the new structure
  const oldSubs = ['pendants','floor-lamps','wall-lights','vessels','sculpture','throws','rugs','sideboards','shelving','dining-tables','side-tables','consoles'];
  for (const slug of oldSubs) {
    const cat = await prisma.category.findUnique({ where: { slug } });
    if (cat) {
      await prisma.product.updateMany({ where: { categoryId: cat.id }, data: { categoryId: null } });
      await prisma.category.delete({ where: { id: cat.id } });
      console.log('   deleted old category: ' + slug);
    }
  }
  console.log('   done');
}

async function upsertCategories() {
  console.log('\n📁 Upserting categories...');
  const catIdMap = new Map();

  const parents = [...new Set(CATEGORY_DEFS.map(c => c.parent))];
  for (const name of parents) {
    const slug = slugify(name);
    let cat = await prisma.category.findUnique({ where: { slug } });
    if (!cat) { cat = await prisma.category.create({ data: { name, slug } }); console.log('   + ' + name); }
    catIdMap.set(slug, cat.id);
  }

  for (const def of CATEGORY_DEFS) {
    let cat = await prisma.category.findUnique({ where: { slug: def.slug } });
    const parentId = catIdMap.get(slugify(def.parent)) || null;
    if (!cat) {
      cat = await prisma.category.create({ data: { name: def.name, slug: def.slug, parentId } });
      console.log('   + ' + def.name);
    } else {
      cat = await prisma.category.update({ where: { id: cat.id }, data: { name: def.name, parentId } });
    }
    catIdMap.set(def.slug, cat.id);
  }
  return catIdMap;
}

async function saveProducts(scrapedProducts, catIdMap) {
  console.log('\n💾 Saving products...');
  let created = 0, skipped = 0;

  for (const p of scrapedProducts) {
    const baseSlug = slugify(p.name);
    const existing = await prisma.product.findUnique({ where: { slug: baseSlug } });
    if (existing) { skipped++; continue; }

    const categoryId = catIdMap.get(p.catSlug) || null;
    await prisma.product.create({
      data: {
        name: p.name,
        slug: baseSlug,
        description: p.description || p.name + ' — premium furniture from Luxurio Home.',
        price: p.price,
        stock: 10,
        published: true,
        featured: false,
        categoryId,
        images: { create: p.images.map((url, i) => ({ url, order: i })) },
      },
    });
    console.log('   + ' + p.name + ' | E' + p.price + ' | ' + p.images.length + ' imgs | ' + p.catSlug);
    created++;
  }
  return { created, skipped };
}

async function main() {
  console.log('Luxurio Home Scraper v2 — ' + BASE);
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1440, height: 900 });

  try {
    const productToCat = await collectProductsByCat(page);

    console.log('\n🔄 Scraping ' + productToCat.size + ' product pages...');
    const scrapedProducts = [];
    const entries = [...productToCat.entries()];

    for (let i = 0; i < entries.length; i++) {
      const [url, catSlug] = entries[i];
      process.stdout.write('[' + (i+1) + '/' + entries.length + '] ' + url.replace(BASE,'') + ' ... ');
      const data = await scrapeProduct(page, url);
      if (data) { scrapedProducts.push({ ...data, catSlug }); console.log('OK ' + data.name); }
      else { console.log('SKIP'); }
      await wait(600);
    }

    console.log('\nScraped ' + scrapedProducts.length + ' / ' + entries.length + ' products');

    await cleanDatabase();
    const catIdMap = await upsertCategories();
    const { created, skipped } = await saveProducts(scrapedProducts, catIdMap);

    console.log('\nDone! Created: ' + created + ', Skipped: ' + skipped);
  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

main();
