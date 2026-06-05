/**
 * Per-module slide-by-slide screenshot extractor for WSA visual QC.
 *
 * Usage:
 *   node _tools/scratch/wsa-screenshot-module.js <module-folder>
 *
 * Example:
 *   node _tools/scratch/wsa-screenshot-module.js m10-group-policy
 *
 * Output: /tmp/wsa-sweep/<module>/S01.png, S02.png, ... (zero-padded)
 *
 * Viewport: 1280×720 per _docs/research/wsa-redesign-validator-viewport.md
 *           (the established standard from the design-choices log).
 *
 * The script activates each slide in turn (deactivates all .slide, then adds
 * .active to slide N), waits for any animations to settle, then captures a
 * fixed-viewport screenshot (not fullPage — we want to see what a student
 * actually sees in the slide frame).
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const mod = process.argv[2];
if (!mod) {
    console.log('usage: node wsa-screenshot-module.js <m10-group-policy>');
    process.exit(1);
}

const FILE_URL = 'file:///home/eq/ai-content/hexworth-prime/_app/houses/cloud/modules/wsa/' + mod + '/cloud-presentation.module.html';
const OUT_DIR  = '/tmp/wsa-sweep/' + mod;

(async () => {
    fs.mkdirSync(OUT_DIR, { recursive: true });

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // Seed the AccessGuard.require('sorted') / house-locked checks so the
    // presentation actually renders (otherwise we'd see the access guard).
    await page.evaluateOnNewDocument(() => {
        try {
            localStorage.setItem('hexworth_house', 'cloud');
            localStorage.setItem('hexworth_sorted', 'true');
        } catch (_) { /* ignore */ }
    });

    await page.goto(FILE_URL, { waitUntil: 'networkidle0', timeout: 10000 });
    await new Promise(r => setTimeout(r, 1000));

    const count = await page.evaluate(() => document.querySelectorAll('.slide').length);
    console.log('Module ' + mod + ': ' + count + ' slides → screenshots in ' + OUT_DIR);

    for (let i = 0; i < count; i++) {
        const slideMeta = await page.evaluate((idx) => {
            const slides = document.querySelectorAll('.slide');
            slides.forEach(s => s.classList.remove('active'));
            slides[idx].classList.add('active');
            // Some WSA modules use display:none on inactive slides — give
            // the browser a tick to lay out the now-active one.
            const slide = slides[idx];
            const h = slide.querySelector('h1,h2');
            return {
                title: h ? (h.textContent || '').trim().slice(0, 80) : '(no title)',
                clientH: slide.clientHeight,
                scrollH: slide.scrollHeight,
            };
        }, i);

        // Allow async style recompute + any CSS transitions to finish.
        await new Promise(r => setTimeout(r, 250));

        const num = String(i + 1).padStart(2, '0');
        const out = path.join(OUT_DIR, `S${num}.png`);
        await page.screenshot({ path: out, fullPage: false });

        const overflow = slideMeta.scrollH > slideMeta.clientH ? ' [OVERFLOW ' + (slideMeta.scrollH - slideMeta.clientH) + 'px]' : '';
        console.log(`  S${num} (h=${slideMeta.clientH}/${slideMeta.scrollH}${overflow}) ${slideMeta.title}`);
    }

    await browser.close();
    console.log('\nDone. Review with: ls -la ' + OUT_DIR);
})();
