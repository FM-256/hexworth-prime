// Render the media-kit print source to PDF (fixes the cut-off-between-pages defect).
// Outputs to a STAGING path by default so the live PDF is never overwritten unverified.
//   node _tools/media-kit/render-pdf.js            -> _tools/media-kit/hexworth-media-kit.pdf (staging)
//   node _tools/media-kit/render-pdf.js --prod     -> _app/assets/media/hexworth-media-kit.pdf (after archiving the old one)
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const src = 'file://' + path.resolve(__dirname, 'media-kit-print.html');
  const prod = process.argv.includes('--prod');
  const out = prod
    ? path.resolve(__dirname, '../../_app/assets/media/hexworth-media-kit.pdf')
    : path.resolve(__dirname, 'hexworth-media-kit.pdf');

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto(src, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: out,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: true,
  });
  await browser.close();
  console.log('rendered ->', out, '(' + Math.round(fs.statSync(out).size / 1024) + ' KB)');
})().catch(e => { console.error(e); process.exit(1); });
