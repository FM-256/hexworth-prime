#!/usr/bin/env node
// arcade-audit.mjs
//
// FUNCTIONAL / render health audit for the real arcade (the 95 interactive games
// listed in _app/games.html), for the admin console's "Arcade Fixes" cockpit.
//
// Unlike the review-games lint (which checks JSON data), arcade games are
// interactive HTML applets, so "does it work" can only be answered by actually
// loading each one in a headless browser and watching for: uncaught JS errors,
// failed asset requests (404/500), and whether it renders real content (DOM text
// or a sized canvas). All 95 games gate on AccessGuard, so we stub it (same
// technique as the review-engine smoke) to reach the game itself.
//
// Content-quality (is the game good / accurate / on-brand) is a separate, heavier
// layer assessed by an AI/Chris pass; this generator populates the FUNCTIONAL
// dimension and leaves a `contentQuality: "pending"` marker per game for it.
//
// Usage:  node _tools/arcade-fixes/arcade-audit.mjs [--limit N]
// Output: _app/arcade-health.json   (deployed snapshot the cockpit fetches)

import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(HERE, '../../_app');
const GAMES_HTML = path.join(APP, 'games.html');
const OUT = path.join(APP, 'arcade-health.json');
const CONCURRENCY = 4;
const PAGE_TIMEOUT = 20000;
const LIMIT = (() => { const i = process.argv.indexOf('--limit'); return i > -1 ? parseInt(process.argv[i + 1], 10) : Infinity; })();

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.gif': 'image/gif', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf' };

/** Parse the GAMES array out of games.html into {title,house,type,category,href} records. */
function parseCatalog() {
    const html = fs.readFileSync(GAMES_HTML, 'utf8');
    const m = html.match(/const GAMES\s*=\s*\[([\s\S]*?)\n\s*\];/);
    if (!m) throw new Error('could not find const GAMES in games.html');
    const games = [];
    for (const line of m[1].split('\n')) {
        const t = line.trim();
        if (!t.startsWith('{')) continue;
        const field = (k) => { const r = t.match(new RegExp(k + ':\\s*"([^"]*)"')); return r ? r[1] : ''; };
        const href = field('href');
        if (href) games.push({ title: field('title'), house: field('house'), type: field('type'), category: field('category'), icon: field('icon'), href });
    }
    return games;
}

/** Tiny static file server rooted at _app (serves the games + their assets). */
function startServer() {
    return new Promise((resolve) => {
        const srv = http.createServer((req, res) => {
            let p = decodeURIComponent(req.url.split('?')[0]);
            let fp = path.join(APP, p);
            if (fs.existsSync(fp) && fs.statSync(fp).isFile()) {
                res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
                fs.createReadStream(fp).pipe(res);
            } else {
                res.writeHead(404); res.end('not found');
            }
        });
        srv.listen(0, () => resolve(srv));
    });
}

/** Load one game headless and return its functional-health record.
 *  Never throws: a browser/page failure is captured as a jsError so one bad
 *  game cannot abort the whole pool. */
async function auditGame(browser, port, game) {
    const jsErrors = [];
    const consoleErrors = [];
    const failedAssets = [];
    let page = null, rendered = false, textLen = 0, hasCanvas = false, timedOut = false;
    const t0 = Date.now();
    try {
        page = await browser.newPage();
        page.on('pageerror', (e) => jsErrors.push(String(e.message).slice(0, 200)));
        page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(String(m.text()).slice(0, 200)); });
        page.on('requestfailed', (r) => { const u = r.url(); if (u.includes('localhost:' + port)) failedAssets.push(u.split('localhost:' + port)[1]); });
        page.on('response', (r) => { const s = r.status(); const u = r.url(); if (s >= 400 && u.includes('localhost:' + port)) failedAssets.push('[' + s + '] ' + u.split('localhost:' + port)[1]); });
        // Stub AccessGuard so the enrollment gate does not redirect us away from the game.
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (req.url().includes('AccessGuard')) req.respond({ status: 200, contentType: 'text/javascript', body: 'window.AccessGuard={require(){},check(){return true;},enforce(){}};' });
            else req.continue();
        });
        try {
            await page.goto('http://localhost:' + port + '/' + game.href, { waitUntil: 'networkidle2', timeout: PAGE_TIMEOUT });
            await new Promise((r) => setTimeout(r, 700)); // settle after network idle
            const probe = await page.evaluate(() => {
                const txt = (document.body ? document.body.innerText : '').trim().length;
                let canvasOk = false;
                document.querySelectorAll('canvas').forEach((c) => { if (c.width > 0 && c.height > 0) canvasOk = true; });
                return { txt, canvasOk };
            });
            textLen = probe.txt; hasCanvas = probe.canvasOk;
            rendered = textLen > 40 || hasCanvas;
        } catch (e) {
            timedOut = /timeout/i.test(e.message);
            jsErrors.push('LOAD: ' + String(e.message).slice(0, 160));
        }
    } catch (e) {
        // Catastrophic (newPage / interception setup failed) — record, do not crash the run.
        jsErrors.push('AUDIT: ' + String(e.message).slice(0, 160));
    } finally {
        if (page) { try { await page.close(); } catch (_) { /* page already gone */ } }
    }
    const ms = Date.now() - t0;
    // Dedupe noisy repeats.
    const uniq = (a) => [...new Set(a)];
    const rec = {
        jsErrors: uniq(jsErrors), consoleErrors: uniq(consoleErrors), failedAssets: uniq(failedAssets),
        rendered, textLen, hasCanvas, timedOut, ms,
        contentQuality: 'pending', // filled by the later AI/Chris content pass
    };
    // Severity: broken (error) if it errors, fails an asset, or renders nothing; degraded (warn) if only console errors.
    if (rec.jsErrors.length || rec.failedAssets.length || !rendered) rec.status = 'broken';
    else if (rec.consoleErrors.length) rec.status = 'degraded';
    else rec.status = 'ok';
    return rec;
}

/** Run the audit pool over all games with bounded concurrency. */
async function run() {
    let catalog = parseCatalog();
    if (Number.isFinite(LIMIT)) catalog = catalog.slice(0, LIMIT);
    const srv = await startServer();
    const port = srv.address().port;
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const results = new Array(catalog.length);
    let next = 0, done = 0;
    async function worker() {
        while (next < catalog.length) {
            const i = next++;
            const game = catalog[i];
            const health = await auditGame(browser, port, game);
            results[i] = { ...game, health };
            done++;
            if (done % 10 === 0 || done === catalog.length) process.stdout.write('  audited ' + done + '/' + catalog.length + '\n');
        }
    }
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, catalog.length) }, worker));
    await browser.close();
    srv.close();

    const clean = results.filter((g) => g && g.health);
    const summary = { total: clean.length, ok: 0, degraded: 0, broken: 0 };
    clean.forEach((g) => { summary[g.health.status]++; });
    const snapshot = {
        generated: 'arcade-audit.mjs',
        generatedAt: new Date().toISOString(),
        note: 'Functional/render health of the arcade games in games.html. contentQuality is pending a separate AI/Chris pass.',
        summary,
        games: clean,
    };
    fs.writeFileSync(OUT, JSON.stringify(snapshot, null, 2) + '\n');
    console.log('\narcade-health -> ' + path.relative(process.cwd(), OUT));
    console.log('  ' + summary.total + ' games: ' + summary.ok + ' ok / ' + summary.degraded + ' degraded / ' + summary.broken + ' broken');
}

run().catch((e) => { console.error(e); process.exit(1); });
