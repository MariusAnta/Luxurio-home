import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-dev-shm-usage'] });
const page = await browser.newPage();
await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36');

await page.goto('https://luxuriohome.com/locus', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 6000));
// Wait for h1 to appear
try { await page.waitForSelector('h1', { timeout: 10000 }); } catch(e) {}
await new Promise(r => setTimeout(r, 2000));

const data = await page.evaluate(() => {
  // Dump all text nodes with their selectors to understand the structure
  const body = document.body.innerText;
  const priceMatch = body.match(/€\s*[\d,. ]+|[\d,. ]+\s*€/g);

  // All imgs with src
  const imgs = [...document.querySelectorAll('img')]
    .map(i => ({ src: i.src, alt: i.alt, cls: i.className }))
    .filter(i => i.src && !i.src.startsWith('data:'));

  // All paragraphs
  const paras = [...document.querySelectorAll('p')].map(p => p.textContent.trim()).filter(t => t.length > 5);

  // All elements with price-like content
  const priceEls = [...document.querySelectorAll('*')].filter(el =>
    el.children.length === 0 && /€\s*[\d,.]+/.test(el.textContent)
  ).map(el => ({ tag: el.tagName, cls: el.className, text: el.textContent.trim() })).slice(0, 10);

  return { priceMatch, imgs: imgs.slice(0, 8), paras: paras.slice(0, 10), priceEls };
});

console.log('=== Price matches ===', JSON.stringify(data.priceMatch));
console.log('\n=== Price elements ===', JSON.stringify(data.priceEls, null, 2));
console.log('\n=== Paragraphs ===', JSON.stringify(data.paras, null, 2));
console.log('\n=== Images ===', JSON.stringify(data.imgs, null, 2));

await browser.close();
