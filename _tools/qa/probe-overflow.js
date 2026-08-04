#!/usr/bin/env node
/*
 * probe-overflow.js -- measure per-slide vertical overflow in a deck.
 *
 * WHY THIS EXISTS
 *   Chris measured 36-99px of overflow across the CSE companion deck's visual slides
 *   at 1024x600 and 1024x768 on 2026-08-03; because .slide-text was centred, the
 *   overflow painted UPWARD over the heading. No EduScan rule covers vertical
 *   overflow, so it gets measured rather than reasoned about.
 *
 * HOW IT MEASURES -- and why the obvious approach is WRONG
 *   Decks lay slides out as `position: absolute; inset: 0` inside an
 *   `overflow: hidden` flex container, showing one at a time via `.active`.
 *   The tempting shortcut is to force every slide to `display:flex; position:static`
 *   so all N can be measured in a single pass. DO NOT DO THAT. `position: static`
 *   removes the very constraint that pins each slide's height to the viewport, which
 *   inflates the measured vertical budget and makes genuinely overflowing slides
 *   report clean. The first version of this file did exactly that and passed a deck
 *   whose ch4 slide was clipping its caption at two of three viewports.
 *
 *   Instead we drive the deck's OWN navigation -- window.show(i), the same function
 *   the Next button calls -- one slide at a time, and measure the slide while it is
 *   genuinely active and genuinely constrained.
 *
 * USAGE
 *   _tools/qa/serve.sh 8137 &
 *   node _tools/qa/probe-overflow.js <url> [--slide N]
 *
 * EXIT
 *   0 = no overflow anywhere. 1 = overflow found. 2 = probe could not measure.
 */
const puppeteer = require('puppeteer');

const VIEWPORTS = [
    { w: 1024, h: 600 },   // short window / netbook worst case
    { w: 1024, h: 768 },   // classroom projector
    { w: 1280, h: 720 },   // typical laptop
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

        // A gated deck's AccessGuard REPLACES the body when it fails closed, so
        // un-hiding after load measures an empty document and reports a false clean.
        // Block the guard -- this probe measures layout, not the gate.
        await page.setRequestInterception(true);
        page.on('request', r => /AccessGuard\.js/.test(r.url()) ? r.abort() : r.continue());
        await page.goto(url, { waitUntil: 'networkidle0' });

        const count = await page.evaluate(() => document.querySelectorAll('.slide').length);
        if (count === 0) {
            console.error(`FATAL ${vp.w}x${vp.h}: 0 slides found -- page did not render. ` +
                          `Not a pass.`);
            await browser.close();
            process.exit(2);
        }
        const hasShow = await page.evaluate(() => typeof window.show === 'function');
        if (!hasShow) {
            console.error(`FATAL ${vp.w}x${vp.h}: deck exposes no window.show(i); ` +
                          `cannot drive native navigation. Refusing to fake it.`);
            await browser.close();
            process.exit(2);
        }

        const bad = [];
        for (let i = 0; i < count; i++) {
            if (only && i + 1 !== only) continue;
            await page.evaluate(n => window.show(n), i);
            // let the fade settle and any image reflow land
            await new Promise(r => setTimeout(r, 90));

            const row = await page.evaluate(() => {
                const slide = document.querySelector('.slide.active');
                if (!slide) return null;
                const over = el => el ? Math.max(0, el.scrollHeight - el.clientHeight) : 0;
                const h2 = slide.querySelector('h2');
                const img = slide.querySelector('.viz img, .ov-stage img');
                const vis = slide.querySelector('.slide-visual');
                // Does the visual's content actually fit inside the panel box?
                let clipped = 0;
                if (img && vis) {
                    const ib = img.getBoundingClientRect(), vb = vis.getBoundingClientRect();
                    clipped = Math.round(Math.max(0, vb.top - ib.top) + Math.max(0, ib.bottom - vb.bottom));
                }
                return {
                    title: h2 ? h2.textContent.trim().slice(0, 44) : '(divider)',
                    slide: over(slide),
                    text: over(slide.querySelector('.slide-text')),
                    visual: over(vis),
                    clipped,
                };
            });
            if (!row) continue;
            if (row.slide || row.text || row.visual || row.clipped) {
                bad.push({ i: i + 1, ...row });
            }
        }

        console.log(`\n=== ${vp.w}x${vp.h} ===`);
        if (!bad.length) {
            console.log(`  clean -- 0px overflow across ${count} slides, measured natively`);
        } else {
            failed = true;
            for (const r of bad) {
                console.log(`  slide ${String(r.i).padStart(2)}  ${r.title}`);
                console.log(`      slide +${r.slide}px  text +${r.text}px  ` +
                            `visual +${r.visual}px  image clipped ${r.clipped}px`);
            }
        }
        await page.close();
    }

    await browser.close();
    process.exit(failed ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(2); });
