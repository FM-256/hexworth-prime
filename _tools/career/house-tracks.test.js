#!/usr/bin/env node
/**
 * house-tracks.test.js
 *
 * @catalog what    Drives HouseTracks.js in a real browser on all 13 careers.html pages and
 * @catalog what    asserts the links mount, are visible, are keyboard-reachable, and resolve
 * @catalog what    to files that exist. Also asserts the honest-omission case (House of the Key).
 * @catalog run     node _tools/career/house-tracks.test.js
 * @catalog status  TOOL
 *
 * WHY A BROWSER AND NOT A GREP
 * ----------------------------
 * The component self-mounts from JS and derives its house from window.location.pathname. A grep
 * proves the script tag is present; it cannot prove a single link rendered, that the href is
 * right for that house, or that the section is not sitting behind display:none. This platform
 * has been bitten by exactly that gap before, so the assertions here are on the painted result.
 *
 * NON-VACUITY: run against a checkout without the script tags and every RENDER assertion must
 * fail. If this suite passes on pre-change pages it is testing nothing.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const REPO = path.resolve(__dirname, '../..');
// HOUSE_TRACKS_APP lets the non-vacuity A/B point this same suite at a pre-change tree (a git
// worktree at HEAD). Without an override it tests the working tree.
const APP = process.env.HOUSE_TRACKS_APP
    ? path.resolve(process.env.HOUSE_TRACKS_APP)
    : path.join(REPO, '_app');
const PORT = Number(process.env.HOUSE_TRACKS_PORT || 8913);

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
    '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' };

let pass = 0, fail = 0;
function chk(name, cond, detail) {
    if (cond) { pass++; console.log(`  ok    ${name}`); }
    else { fail++; console.log(`  FAIL  ${name}${detail ? '  <- ' + detail : ''}`); }
}

function serve() {
    return new Promise(resolve => {
        const srv = http.createServer((req, res) => {
            let p = decodeURIComponent(req.url.split('?')[0]);
            if (p.endsWith('/')) p += 'index.html';
            const file = path.join(APP, p);
            if (!file.startsWith(APP) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
                res.writeHead(404); return res.end('nope');
            }
            res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
            res.end(fs.readFileSync(file));
        });
        srv.listen(PORT, '127.0.0.1', () => resolve(srv));
    });
}

/** The component's own data, read from the generated file, is the expectation. */
function expected() {
    const src = fs.readFileSync(path.join(APP, 'components/HouseTracks.js'), 'utf8');
    const body = src.slice(src.indexOf('var TRACKS = {'), src.indexOf('/** /houses/'));
    const map = {};
    const houseRe = /"([a-z-]+)":\s*\[([^\]]*)\]/g;
    let m;
    while ((m = houseRe.exec(body))) {
        map[m[1]] = [...m[2].matchAll(/url:\s*"([^"]+)"/g)].map(x => x[1]);
    }
    return map;
}

(async () => {
    const srv = await serve();
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    try {
        const TRACKS = expected();
        chk('generated component parsed and is non-empty', Object.keys(TRACKS).length >= 10,
            `houses=${Object.keys(TRACKS).length}`);

        const pages = [...fs.readdirSync(path.join(APP, 'houses'))
            .filter(h => fs.existsSync(path.join(APP, 'houses', h, 'careers.html')))
            .map(h => ({ house: h, url: `/houses/${h}/careers.html` })),
            { house: 'signal', url: '/signal/careers.html' }];

        chk('found all 13 careers pages', pages.length === 13, `got ${pages.length}`);

        let mounted = 0, omitted = 0;
        const rendered = {};   // house -> hrefs actually painted on the page
        for (const { house, url } of pages) {
            const page = await browser.newPage();
            const errs = [];
            page.on('pageerror', e => errs.push(e.message));
            await page.goto(`http://127.0.0.1:${PORT}${url}`, { waitUntil: 'networkidle0' });

            const got = await page.evaluate(() => {
                const sec = document.getElementById('house-tracks');
                if (!sec) return null;
                const links = [...sec.querySelectorAll('a.house-tracks-link')];
                const first = links[0];
                let focusable = false;
                if (first) { first.focus(); focusable = document.activeElement === first; }
                // Geometry is not visibility: check the computed paint too.
                const paint = links.map(a => {
                    const cs = getComputedStyle(a);
                    const r = a.getBoundingClientRect();
                    return r.height > 0 && r.width > 0 && cs.visibility !== 'hidden' &&
                        cs.display !== 'none' && parseFloat(cs.opacity) > 0.05;
                });
                return {
                    hrefs: links.map(a => new URL(a.href).pathname),
                    texts: links.map(a => a.textContent.trim()),
                    allPainted: paint.every(Boolean),
                    focusable,
                    sectionCount: document.querySelectorAll('#house-tracks').length,
                };
            });

            chk(`${house}: no page errors`, errs.length === 0, errs[0]);

            if (!TRACKS[house]) {
                chk(`${house}: correctly renders NOTHING (no tracks qualify)`, got === null,
                    got ? `rendered ${got.hrefs.length} links anyway` : '');
                if (got === null) omitted++;
            } else {
                chk(`${house}: section mounted`, got !== null);
                if (got) {
                    mounted++;
                    rendered[house] = got.hrefs;
                    chk(`${house}: hrefs match generated data`,
                        JSON.stringify(got.hrefs) === JSON.stringify(TRACKS[house]),
                        `got ${JSON.stringify(got.hrefs)}`);
                    chk(`${house}: every link actually painted`, got.allPainted);
                    chk(`${house}: first link keyboard-focusable`, got.focusable);
                    chk(`${house}: mounted exactly once`, got.sectionCount === 1, `n=${got.sectionCount}`);
                    chk(`${house}: no empty link text`, got.texts.every(t => t.length > 1));
                }
            }
            await page.close();
        }

        chk('houses that mounted', mounted === Object.keys(TRACKS).length, `${mounted}`);
        chk('House of the Key omitted rather than faked', omitted === 1, `omitted=${omitted}`);

        // The link target must exist on disk, or we shipped a 404 into permanent navigation.
        let missing = [];
        for (const [house, urls] of Object.entries(TRACKS)) {
            for (const u of urls) {
                const f = path.join(APP, u.replace(/^\//, ''), 'index.html');
                if (!fs.existsSync(f)) missing.push(`${house} -> ${u}`);
            }
        }
        chk('every track URL resolves to a real index.html', missing.length === 0, missing.join(', '));

        // ── career-paths.html ────────────────────────────────────────────────
        // Different consumer, different failure mode. This page renders every house at once and
        // reads window.HouseTracks instead of self-mounting. Its cards are click-to-toggle divs
        // with no tabindex and no keydown handler, so the assertion that matters is that the
        // links are visible WITHOUT any click: anything inside .roadmap-panel is unreachable
        // without a mouse.
        {
            const page = await browser.newPage();
            const errs = [];
            page.on('pageerror', e => errs.push(e.message));
            await page.goto(`http://127.0.0.1:${PORT}/career/career-paths.html`, { waitUntil: 'networkidle0' });

            const cp = await page.evaluate(() => {
                const cards = [...document.querySelectorAll('.house-card')];
                const byHouse = {};
                cards.forEach(c => {
                    const name = c.querySelector('.house-card-name').textContent.trim();
                    const links = [...c.querySelectorAll('.track-links a')];
                    byHouse[name] = {
                        hrefs: links.map(a => new URL(a.href).pathname),
                        n: links.length,
                        // Visible with NO click; the panel is still closed at this point.
                        // length>0 is load-bearing: [].every() is true, so without it this
                        // assertion passes on a page that renders no links at all.
                        visible: links.length > 0 && links.every(a => a.getBoundingClientRect().height > 0),
                        // Same trap inverted: [].some() is false, so require links to exist.
                        outsidePanel: links.length > 0 && links.every(a => !a.closest('.roadmap-panel')),
                    };
                });
                return { cards: cards.length, byHouse, hasGlobal: !!window.HouseTracks };
            });

            chk('career-paths: no page errors', errs.length === 0, errs[0]);
            chk('career-paths: window.HouseTracks exposed', cp.hasGlobal);
            chk('career-paths: renders its 10 house cards', cp.cards === 10, `got ${cp.cards}`);

            const da = cp.byHouse['Dark Arts'] || {};
            chk('career-paths: Dark Arts card links Bug Hunting',
                (da.hrefs || []).includes('/dark-arts/vault/bug-hunting/'), JSON.stringify(da.hrefs));
            chk('career-paths: Dark Arts card actually rendered links', da.n > 0, `n=${da.n}`);
            chk('career-paths: links visible WITHOUT clicking the card', da.visible === true);
            chk('career-paths: links are NOT inside the mouse-only roadmap panel',
                da.outsidePanel === true);
            chk('career-paths: Key card shows no fabricated links',
                ((cp.byHouse['Key'] || {}).hrefs || []).length === 0);

            let mismatched = [];
            for (const [name, got] of Object.entries(cp.byHouse)) {
                const id = { 'Shield': 'shield', 'Dark Arts': 'dark-arts', 'Eye': 'eye', 'Cloud': 'cloud',
                    'Forge': 'forge', 'Web': 'web', 'Code': 'code', 'Key': 'key', 'Script': 'script', 'AI': 'ai' }[name];
                const want = TRACKS[id] || [];
                if (JSON.stringify(got.hrefs) !== JSON.stringify(want)) mismatched.push(name);
            }
            chk('career-paths: every card matches the generated map (no private copy)',
                mismatched.length === 0, mismatched.join(', '));

            // Clicking a course link must navigate, not collapse the card.
            const toggled = await page.evaluate(() => {
                const card = [...document.querySelectorAll('.house-card')]
                    .find(c => c.querySelector('.track-links a'));
                const a = card.querySelector('.track-links a');
                a.addEventListener('click', ev => ev.preventDefault(), { once: true });
                a.click();
                return card.querySelector('.roadmap-panel').classList.contains('open');
            });
            chk('career-paths: clicking a course link does not toggle the card', toggled === false);
            await page.close();
        }

        // The specific gap this work exists to close. Assert on what the PAGE rendered, not on
        // the data file -- reading TRACKS here would pass even with zero pages wired, which is
        // exactly the vacuous check the A/B run exposed.
        const da = rendered['dark-arts'] || [];
        chk('Dark Arts careers PAGE renders a link to Bug Hunting',
            da.includes('/dark-arts/vault/bug-hunting/'), `rendered: ${JSON.stringify(da)}`);
        chk('Dark Arts careers PAGE renders a link to EHE',
            da.includes('/dark-arts/vault/ehe/'), `rendered: ${JSON.stringify(da)}`);

    } finally {
        await browser.close();
        srv.close();
    }

    console.log(`\n${pass} passed, ${fail} failed`);
    process.exitCode = fail ? 1 : 0;
})();
