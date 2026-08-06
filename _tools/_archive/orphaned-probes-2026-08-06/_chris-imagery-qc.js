const puppeteer = require('puppeteer');
const fs = require('fs');

const SHOTDIR = '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/aaa65191-9601-4464-aadc-9ae84cdea571/scratchpad/shots';

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, isMobile: false },
  mobile: { width: 390, height: 844, isMobile: true, hasTouch: true },
};

const PAGES = [
  { name: 'home', url: 'https://hexworth.com/' },
  { name: 'about', url: 'https://hexworth.com/about.html' },
  { name: 'faq', url: 'https://hexworth.com/faq.html' },
  { name: 'product-info', url: 'https://hexworth.com/product-info.html' },
];

async function analyzePage(page, pageName, vpName, results) {
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => pageErrors.push(String(e.message || e)));

  await page.goto(PAGES.find(p=>p.name===pageName).url, { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r => setTimeout(r, 2500)); // let animations/reveal settle

  const finalUrl = page.url();

  // image inventory: broken images (naturalWidth 0 but complete), sizes
  const images = await page.evaluate(() => {
    return Array.from(document.images).map(img => {
      const r = img.getBoundingClientRect();
      return {
        src: img.currentSrc || img.src,
        alt: img.alt,
        cls: img.className,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete,
        rectW: Math.round(r.width),
        rectH: Math.round(r.height),
        visible: r.width > 0 && r.height > 0 && getComputedStyle(img).display !== 'none' && getComputedStyle(img).visibility !== 'hidden',
        top: Math.round(r.top),
        left: Math.round(r.left),
      };
    });
  });

  // horizontal overflow check
  const overflow = await page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    return { docWidth, scrollWidth, overflowPx: scrollWidth - docWidth };
  });

  // nav-brand / favicon check (home only)
  let navBrand = null;
  let favicon = null;
  if (pageName === 'home') {
    navBrand = await page.evaluate(() => {
      const el = document.querySelector('.nav-brand img, .nav-brand svg, .nav-brand');
      if (!el) return null;
      const img = document.querySelector('.nav-brand img');
      const rect = (img||el).getBoundingClientRect();
      return {
        tag: (img||el).tagName,
        src: img ? (img.currentSrc || img.src) : null,
        naturalWidth: img ? img.naturalWidth : null,
        naturalHeight: img ? img.naturalHeight : null,
        rectW: Math.round(rect.width), rectH: Math.round(rect.height),
        outerHTML: el.outerHTML.slice(0,300),
      };
    });
    favicon = await page.evaluate(() => {
      const link = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
      return link ? { href: link.href, type: link.type } : null;
    });
  }

  // CTA cards visibility check (home only) - look for cartridge/CTA card elements
  let ctaCards = null;
  if (pageName === 'home') {
    ctaCards = await page.evaluate(() => {
      const candidates = Array.from(document.querySelectorAll('[class*="cta"], [class*="cartridge"], .card, [class*="card"]'));
      return candidates.slice(0, 20).map(el => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
          cls: el.className,
          opacity: cs.opacity,
          visibility: cs.visibility,
          display: cs.display,
          rectW: Math.round(r.width), rectH: Math.round(r.height),
          top: Math.round(r.top),
        };
      });
    });
  }

  // hero art check (home only)
  let heroImgs = null;
  if (pageName === 'home') {
    heroImgs = images.filter(i => /hero-(student|instructor|teams)/.test(i.src));
  }

  // section emblem check (about/faq)
  let emblems = null;
  if (pageName === 'about' || pageName === 'faq') {
    emblems = images.filter(i => /sections\/(about|faq)-/.test(i.src));
  }

  // product-info badge check
  let badges = null;
  if (pageName === 'product-info') {
    badges = images.filter(i => i.cls && /badge|achievement|feature/.test(i.cls) || /badge|achievement/.test(i.src));
    if (!badges || badges.length === 0) badges = images; // fallback capture all, will inspect manually
  }

  // Flux Capacitor button check
  const fluxBtn = await page.evaluate(() => {
    const el = document.querySelector('[class*="flux"], #flux-capacitor, [id*="flux"]');
    if (!el) return null;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    // also check any child img/svg
    const img = el.querySelector('img, svg');
    return {
      outerHTMLSnippet: el.outerHTML.slice(0, 500),
      boxShadow: cs.boxShadow,
      filter: cs.filter,
      backgroundColor: cs.backgroundColor,
      borderColor: cs.borderColor,
      color: cs.color,
      rectW: Math.round(r.width), rectH: Math.round(r.height),
      visible: r.width > 0 && r.height > 0,
    };
  });

  const screenshotPath = `${SHOTDIR}/${pageName}-${vpName}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });

  let fluxShot = null;
  if (fluxBtn && fluxBtn.visible) {
    const el = await page.$('[class*="flux"], #flux-capacitor, [id*="flux"]');
    if (el) {
      fluxShot = `${SHOTDIR}/${pageName}-${vpName}-flux.png`;
      try { await el.screenshot({ path: fluxShot }); } catch(e) {}
    }
  }

  results.push({
    page: pageName, viewport: vpName, finalUrl,
    consoleErrors, pageErrors,
    images, overflow, navBrand, favicon, ctaCards, heroImgs, emblems, badges, fluxBtn,
    screenshotPath, fluxShot,
  });
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const results = [];
  for (const vpName of Object.keys(VIEWPORTS)) {
    for (const pg of PAGES) {
      const page = await browser.newPage();
      await page.setViewport(VIEWPORTS[vpName]);
      try {
        await analyzePage(page, pg.name, vpName, results);
      } catch (e) {
        results.push({ page: pg.name, viewport: vpName, error: String(e.message || e) });
      }
      await page.close();
    }
  }
  await browser.close();
  fs.writeFileSync(`${SHOTDIR}/../results.json`, JSON.stringify(results, null, 2));
  console.log('DONE');
})();
