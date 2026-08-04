#!/usr/bin/env node
/*
 * probe-overflow.js -- measure per-slide vertical overflow in a deck.
 *
 * WHY THIS EXISTS
 *   Chris measured 36-99px of overflow across the CSE companion deck's eight visual
 *   slides at 1024x600 and 1024x768 on 2026-08-03, and because .slide-text was centred
 *   the overflow painted UPWARD over the heading. The fix (safe center + a short-viewport
 *   media block) was verified by hand. Any later change to a slide's visual can silently
 *   reintroduce it, and no EduScan rule covers vertical overflow -- so it gets measured,
 *   not reasoned about. Aspect-ratio arithmetic is not a measurement.
 *
 * WHAT IT MEASURES
 *   For every .slide: scrollHeight vs clientHeight on the slide itself and on both
 *   panels (.slide-text, .slide-visual). Any positive delta is content the projector
 *   will cut off or the panel will scroll -- and a scroll is the thing we are avoiding.
 *
 * USAGE
 *   _tools/qa/serve.sh &                       # deck must be served, not file://
 *   node _tools/qa/probe-overflow.js <url> [--slide N]
 *
 * EXIT
 *   0 = no overflow at any tested viewport. 1 = overflow found (details on stdout).
 */
const puppeteer = require('puppeteer');

// The three Chris tested. 1024x600 is the netbook/short-window worst case, 1024x768 the
// classroom projector, 1280x720 the typical laptop.
const VIEWPORTS = [
    { w: 1024, h: 600 },
    { w: 1024, h: 768 },
    { w: 1280, h: 720 },
];

async function main() {
    const url = process.argv[2];
    if (!url) {
        console.error('usage: node probe-overflow.js <url> [--slide N]');
        process.exit(2);
    }
    const onlyIdx = process.argv.indexOf('--slide');
    const only = onlyIdx > -1 ? parseInt(process.argv[onlyIdx + 1], 10) : null;

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    let failed = false;

    for (const vp of VIEWPORTS) {
        const page = await browser.newPage();
        await page.setViewport({ width: vp.w, height: vp.h });

        // Gated decks run AccessGuard, which does not merely hide <body> -- it REPLACES
        // the content when it fails closed. Trying to un-hide it after load measures an
        // empty document and reports a clean pass, which is how the first run of this
        // probe "passed" on 0 slides. Block the guard instead: this probe measures
        // layout geometry, not the gate, and the gate has its own tests.
        await page.setRequestInterception(true);
        page.on('request', req => {
            if (/AccessGuard\.js/.test(req.url())) return req.abort();
            req.continue();
        });
        await page.goto(url, { waitUntil: 'networkidle0' });

        // Slides are a deck-wide carousel: only the current one is displayed. Show them
        // all so every slide gets measured in one pass.
        await page.evaluate(() => {
            document.body.style.visibility = 'visible';
            document.querySelectorAll('.slide').forEach(s => {
                s.style.display = 'flex';
                s.style.position = 'static';
            });
        });

        // A probe that finds nothing must fail loudly, never report "clean".
        const slideCount = await page.evaluate(() => document.querySelectorAll('.slide').length);
        if (slideCount === 0) {
            console.error(`FATAL ${vp.w}x${vp.h}: 0 slides found -- page did not render. ` +
                          `Not a pass. Check the URL and that the server is up.`);
            await browser.close();
            process.exit(2);
        }

        const rows = await page.evaluate(() => {
            const out = [];
            document.querySelectorAll('.slide').forEach((slide, i) => {
                const probe = (el) => el
                    ? Math.max(0, el.scrollHeight - el.clientHeight)
                    : 0;
                const h2 = slide.querySelector('h2');
                out.push({
                    i: i + 1,
                    title: h2 ? h2.textContent.trim().slice(0, 46) : '(divider)',
                    slide: probe(slide),
                    text: probe(slide.querySelector('.slide-text')),
                    visual: probe(slide.querySelector('.slide-visual')),
                    // natural vs rendered height of any generated image in the panel
                    imgH: (() => {
                        const im = slide.querySelector('.viz img');
                        return im ? Math.round(im.getBoundingClientRect().height) : null;
                    })(),
                });
            });
            return out;
        });

        const bad = rows.filter(r => (!only || r.i === only) &&
                                     (r.slide > 0 || r.text > 0 || r.visual > 0));
        console.log(`\n=== ${vp.w}x${vp.h} ===`);
        if (!bad.length) {
            console.log(`  clean -- 0px overflow across ${rows.length} slides measured`);
        } else {
            failed = true;
            for (const r of bad) {
                console.log(`  slide ${String(r.i).padStart(2)}  ${r.title}`);
                console.log(`      slide +${r.slide}px   text +${r.text}px   visual +${r.visual}px`);
            }
        }
        if (only) {
            const r = rows.find(x => x.i === only);
            if (r) console.log(`  [slide ${only}] rendered image height: ${r.imgH ?? 'n/a'}px`);
        }
        await page.close();
    }

    await browser.close();
    process.exit(failed ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(2); });
