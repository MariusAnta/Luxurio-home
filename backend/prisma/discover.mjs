import puppeteer from 'puppeteer';

const NAV = new Set(['','furniture','all-products','sofas','lounge-chairs','armchairs','dining-chairs','stools','tables','coffee-tables','dressing-tables','beds','nightstands','benches','chest-and-drawers','entrance-cabinets','showcases','carpets']);
const CAT_PAGES = ['sofas','lounge-chairs','armchairs','dining-chairs','stools','tables','coffee-tables','dressing-tables','beds','nightstands','benches','chest-and-drawers','entrance-cabinets','showcases','carpets'];

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-dev-shm-usage'] });
const page = await browser.newPage();
await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36');

const productLinks = new Set();

for (const cat of CAT_PAGES) {
  await page.goto('https://luxuriohome.com/' + cat, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  try {
    await page.evaluate(async () => {
      for (let i = 0; i < 20; i++) { window.scrollBy(0, 500); await new Promise(r => setTimeout(r, 200)); }
    });
  } catch(e) { /* page may have redirected */ }
  await new Promise(r => setTimeout(r, 1000));
  const links = await page.evaluate(() =>
    [...new Set(Array.from(document.querySelectorAll('a[href]')).map(a => a.href))]
      .filter(h => h.includes('luxuriohome.com'))
  );
  links.forEach(l => {
    const path = l.replace('https://luxuriohome.com/', '');
    if (!NAV.has(path) && !l.startsWith('mailto') && path && !path.includes('/')) {
      productLinks.add(l);
    }
  });
  console.log(cat + ': total product URLs so far = ' + productLinks.size);
}

console.log('\n=== All product URLs ===');
[...productLinks].forEach(l => console.log(l));

// Scrape first product page to see its structure
if (productLinks.size > 0) {
  const first = [...productLinks][0];
  console.log('\n=== Inspecting: ' + first + ' ===');
  await page.goto(first, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  const data = await page.evaluate(() => {
    const h1 = document.querySelector('h1')?.textContent?.trim();
    const imgs = [...document.querySelectorAll('img')].map(i => i.src).filter(s => s && !s.startsWith('data:')).slice(0, 5);
    const price = document.body.innerText.match(/[\d\s]+\s*€|€\s*[\d\s]+/)?.[0];
    const breadcrumbs = [...document.querySelectorAll('[class*="breadcrumb"] a, nav a')].map(a => ({text: a.textContent.trim(), href: a.href}));
    const desc = document.querySelector('[class*="description"], [class*="desc"], main p')?.textContent?.trim()?.slice(0, 300);
    return { h1, imgs, price, breadcrumbs, desc, title: document.title, url: location.href };
  });
  console.log(JSON.stringify(data, null, 2));
}

await browser.close();
