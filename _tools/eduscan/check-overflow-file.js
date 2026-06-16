/**
 * Single-file slide overflow checker (1280x720).
 *
 * Loads ONE HTML deck via file://, activates each .slide in turn, and reports
 * any slide whose .slide-content scrollHeight exceeds its clientHeight (the
 * same signal OVERFLOW-001b uses). Built for per-deck verification of the WSA
 * acronym-expansion sweep, but works on any .slide/.slide-content deck.
 *
 * Usage: node check-overflow-file.js <absolute-or-repo-relative-path-to.html>
 * Exit 0 = clean, exit 1 = overflow found (prints offending slides + px over).
 */

const path = require('path');
const fs = require('fs');
const BrowserPool = require('./validators/functional/browser');

(async () => {
    // Resolve the target file (accepts absolute or repo-relative) and bail early if missing.
    const arg = process.argv[2];
    if (!arg) { console.error('Usage: node check-overflow-file.js <file.html>'); process.exit(2); }
    const ROOT = path.join(__dirname, '../..');
    const abs = path.isAbsolute(arg) ? arg : path.join(ROOT, arg);
    if (!fs.existsSync(abs)) { console.error(`Not found: ${abs}`); process.exit(2); }

    // Single headless page at the validator's canonical viewport.
    const pool = new BrowserPool({ verbose: false, concurrency: 1 });
    await pool.launch();
    const { page } = await pool.getPage();
    let overflows = [];
    try {
        await page.setViewport({ width: 1280, height: 720 });
        // Seed the localStorage the deck reads on boot so it renders its normal layout.
        await page.evaluateOnNewDocument(() => {
            try { localStorage.setItem('hexworth_house', 'web'); } catch (_) {}
            try { localStorage.setItem('hexworth_sorted', 'true'); } catch (_) {}
        });
        await page.goto(`file://${abs}`, { waitUntil: 'domcontentloaded', timeout: 8000 });
        await new Promise(r => setTimeout(r, 500)); // let fonts/animations settle before measuring

        // Walk every slide: only the .active slide is laid out, so we deactivate all,
        // activate one, force a reflow, then compare content scroll vs client height.
        overflows = await page.evaluate(() => {
            const slides = Array.from(document.querySelectorAll('.slide'));
            const out = [];
            slides.forEach((slide, idx) => {
                slides.forEach(s => s.classList.remove('active'));
                slide.classList.add('active');
                void slide.offsetHeight; // force synchronous layout
                const content = slide.querySelector('.slide-content') || slide;
                const over = content.scrollHeight - content.clientHeight;
                // >2px over is a real overflow (2px tolerance matches the validator).
                if (over > 2) {
                    const title = (slide.querySelector('h1,h2,.slide-sub,.slide-title') || {}).textContent || '';
                    out.push({ idx, over, title: title.trim().slice(0, 60) });
                }
            });
            return out;
        });
    } finally {
        // Always release the page and tear the pool down, even on error.
        await pool.releasePage(page);
        await pool.shutdown();
    }

    // Report: clean exits 0; any overflow lists the offending slides and exits 1.
    const rel = path.relative(ROOT, abs);
    if (overflows.length === 0) {
        console.log(`CLEAN — no slide overflow at 1280x720: ${rel}`);
        process.exit(0);
    } else {
        console.log(`OVERFLOW (${overflows.length}) at 1280x720: ${rel}`);
        overflows.forEach(o => console.log(`  slide #${o.idx} +${o.over}px  "${o.title}"`));
        process.exit(1);
    }
})().catch(e => { console.error(e); process.exit(2); });
