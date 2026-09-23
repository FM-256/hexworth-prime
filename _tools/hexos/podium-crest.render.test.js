#!/usr/bin/env node
'use strict';
/**
 * podium-crest.render.test.js
 *
 * @catalog what   Renders the REAL podium top-three markup in a browser and proves a long team name
 *                 truncates inside its box instead of overflowing into the neighbouring place
 * @catalog run    NODE_PATH=$(pwd)/functions/node_modules node _tools/hexos/podium-crest.render.test.js
 * @catalog status TOOL
 *
 * WHY IT EXISTS. The crest change shipped for review with no browser rendering at all, and Chris
 * BLOCKED it by doing what I had not: he rendered it and measured a team name overflowing its 200px
 * box by ~73px and bleeding into the neighbouring place. The cause is a CSS rule that silently
 * stopped applying: `text-overflow: ellipsis` affects a container's OWN inline content, not an
 * overflowing child, so wrapping the name in a span inside a new `display:flex` container turned the
 * pre-existing ellipsis rule into dead code. Nothing threw, nothing logged, and the unit suite stayed
 * 11/0, because none of that is measurable without layout.
 *
 * It is viewport-independent, which is why "it looked fine on my screen" would have been worthless:
 * `.podium-place` is `max-width: 200px`, so the box is the same width on a phone and a 4K monitor.
 *
 * WHAT IT ASSERTS, and the first version of this file got it wrong. I asserted
 * scrollWidth === clientWidth on the name span, which is not "the text fits" for a TRUNCATING
 * element: a clipped element always has scrollWidth > clientWidth, because scrollWidth is the full
 * content width. That assertion failed against the correct fix, which is a test bug, not a defect.
 *
 * The property that matters is CONTAINMENT plus a real clip:
 *   - the span's right edge never passes the place box's right edge (nothing bleeds into the
 *     neighbouring place, which is the actual regression Chris measured), AND
 *   - the clip is genuinely doing the containing: computed overflow is hidden and text-overflow is
 *     ellipsis, and truncation is engaged (scrollWidth > clientWidth) for a name long enough to need
 *     it. Without that second half, a span that merely happened to fit would pass and the CSS could
 *     regress unnoticed.
 *   - a SHORT name must NOT be truncated, so scrollWidth === clientWidth there. That is the control
 *     which stops the long-name assertions passing for the wrong reason.
 * Two worst cases: a long MULTI-word name, and a long SINGLE-word name that cannot wrap at a space.
 * Plus that the crest is never squashed, since flex would happily shrink it.
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const PAGE = process.env.PODIUM_PATH
    || path.join(__dirname, '..', '..', '_app', 'arena', 'tournament-podium.html');
const src = fs.readFileSync(PAGE, 'utf8');

/* Brace-matched, like the unit suite: rendering a reimplementation would prove nothing. */
function grab(name) {
    const at = src.indexOf('function ' + name + '(');
    if (at === -1) throw new Error(name + ' not found in ' + PAGE);
    let i = src.indexOf('{', at), depth = 0;
    for (; i < src.length; i++) {
        if (src[i] === '{') depth++;
        else if (src[i] === '}') { depth--; if (depth === 0) { i++; break; } }
    }
    return src.slice(at, i);
}
const styleBlock = (src.match(/<style>([\s\S]*?)<\/style>/) || [, ''])[1];
if (styleBlock.length < 500) throw new Error('style block not found; the page structure changed');

const NAMES = {
    multiword: 'Advanced Persistent Threat Division Seven',
    singleword: 'Supercalifragilisticexpialidocious',
    short: 'Red Cell',
};

let pass = 0, fail = 0;
const chk = (n, ok, d) => { console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' :: ' + d : ''}`); ok ? pass++ : fail++; };

(async () => {
    console.log('\n== podium crest layout (rendered, not reasoned) ==');
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });

    for (const [w, label] of [[375, 'phone 375px'], [1280, 'desktop 1280px']]) {
        const page = await browser.newPage();
        await page.setViewport({ width: w, height: 760 });
        await page.setContent('<style>' + styleBlock + '</style><div class="podium-top3" id="top3"></div>');
        await page.addScriptTag({ content: grab('safeColor') + '\n' + grab('teamInitials') + '\n' + grab('teamCrest') });

        const measured = await page.evaluate((names) => {
            const out = {};
            const box = document.getElementById('top3');
            const teams = [
                { name: names.multiword, color: '#ef4444', score: 500 },
                { name: names.singleword, color: '#3b82f6', score: 400 },
                { name: names.short, color: '#22c55e', score: 300 },
            ];
            /* The real emitted markup for a place, matching renderPodiumPlace. */
            box.innerHTML = teams.map((t, i) => {
                const place = i + 1;
                const cls = place === 1 ? 'podium-1st' : place === 2 ? 'podium-2nd' : 'podium-3rd';
                return '<div class="podium-place ' + cls + '"><div class="podium-place-box">'
                    + '<div class="podium-place-rank">#' + place + '</div>'
                    + '<div class="podium-place-name">' + teamCrest(t, place === 1 ? 26 : 22)
                    + '<span>' + t.name + '</span></div>'
                    + '<div class="podium-place-score">' + t.score + ' pts</div>'
                    + '</div><div class="podium-pedestal"></div></div>';
            }).join('');

            out.rows = [...document.querySelectorAll('.podium-place-name')].map((el, i) => {
                const span = el.querySelector('span');
                const crest = el.querySelector('svg.team-crest');
                const placeBox = el.closest('.podium-place');
                const cs = getComputedStyle(span);
                return {
                    idx: i,
                    truncating: span.scrollWidth > span.clientWidth,
                    clipped: cs.overflow === 'hidden' && cs.textOverflow === 'ellipsis',
                    scrollW: span.scrollWidth,
                    clientW: span.clientWidth,
                    crestW: crest ? Math.round(crest.getBoundingClientRect().width) : 0,
                    spanRight: Math.round(span.getBoundingClientRect().right),
                    boxRight: Math.round(placeBox.getBoundingClientRect().right),
                };
            });
            return out;
        }, NAMES);

        for (const r of measured.rows) {
            const which = ['multi-word', 'single-word', 'short'][r.idx];
            const isLong = r.idx < 2;
            /* THE REGRESSION ASSERTION. Pre-fix, a long name's span pushed past the place box and
             * overlapped its neighbour. This is the line that fails on the unfixed page. */
            chk(`${label}: ${which} name stays inside its place box`, r.spanRight <= r.boxRight + 1,
                `spanRight=${r.spanRight} boxRight=${r.boxRight}`);
            if (isLong) {
                chk(`${label}: ${which} name is clipped with an ellipsis`, r.clipped,
                    r.clipped ? '' : 'overflow/text-overflow not applied to the span');
                chk(`${label}: ${which} truncation is actually engaged`, r.truncating,
                    `scrollWidth=${r.scrollW} clientWidth=${r.clientW}`);
            } else {
                /* CONTROL: a name that fits must not be truncated, so the two assertions above
                 * cannot be passing merely because everything is clipped. */
                chk(`${label}: ${which} name is NOT truncated (control)`, !r.truncating,
                    `scrollWidth=${r.scrollW} clientWidth=${r.clientW}`);
            }
        }
        /* The crest must not be shrunk to nothing to make room for the text. */
        const crests = measured.rows.map(r => r.crestW);
        chk(`${label}: crests keep their size (flex-shrink:0)`, crests.every(c => c >= 20),
            'widths ' + crests.join(','));
        await page.close();
    }

    await browser.close();
    console.log(`\n  ${pass} passed, ${fail} failed\n`);
    if (fail) console.log('  A name that overflows bleeds into the neighbouring place. Students see it.');
    process.exitCode = fail === 0 ? 0 : 1;
})().catch(e => { console.error('SUITE FAILED:', e.message); process.exit(1); });
