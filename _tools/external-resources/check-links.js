#!/usr/bin/env node
/**
 * check-links.js — is every external link on the "Free extra practice" card still alive?
 *
 * @catalog what    Reads the link table from _app/components/ExternalResources.js (SEED Labs + CLARK)
 * @catalog what    and fetches every URL; a link must fail twice (30 s apart) to count. No browser.
 * @catalog run     node _tools/external-resources/check-links.js
 * @catalog status  GATE (weekly: .github/workflows/external-links.yml)
 *
 * Exit 0 when all links answer 200, 1 when any is dead (the failures are printed, one per line,
 * as "DEAD <status> <url> (<label>)"), 2 if the component cannot be read. No dependencies:
 * Node 18+ fetch. Links are the component's own table, so a link added there is checked here.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '../../_app/components/ExternalResources.js');

/* The component's link table, evaluated in a stub window (the card itself is not rendered). */
function linkTable() {
    const src = fs.readFileSync(SRC, 'utf8');
    const win = {};
    const doc = { currentScript: null, querySelector: () => null, readyState: 'complete', getElementById: () => null };
    Function('window', 'document', src)(win, doc);
    const er = win.ExternalResources;
    if (!er || !er.LAB || !er.SEED || !er.CLARK_BROWSE) { throw new Error('ExternalResources link table not found'); }
    /* only links some hub actually shows, plus the CLARK browse page */
    const used = new Set(Object.values(er.HUBS).flatMap((h) => h.labs));
    const links = [...used].filter((k) => er.LAB[k]).map((k) => ({ url: er.SEED + er.LAB[k][1], label: 'SEED Lab: ' + er.LAB[k][0] }));
    links.push({ url: er.CLARK_BROWSE, label: 'CLARK browse' });
    return links;
}

/* One GET; resolves to the status code, or 0 on a network error or timeout. */
async function status(url) {
    try {
        const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'Hexworth link check (weekly)' } });
        return r.status;
    } catch (e) { return 0; }
}

(async () => {
    let links;
    try { links = linkTable(); } catch (e) { console.error('cannot read the link table: ' + e.message); process.exit(2); }
    const firstPass = [];
    for (const l of links) { const s = await status(l.url); if (s !== 200) { firstPass.push(Object.assign({ s }, l)); } }
    /* a link must fail twice, 30 s apart, so one slow answer does not page anyone */
    const dead = [];
    if (firstPass.length) {
        await new Promise((r) => setTimeout(r, 30000));
        for (const l of firstPass) { const s = await status(l.url); if (s !== 200) { dead.push(Object.assign({}, l, { s })); } }
    }
    dead.forEach((d) => console.log('DEAD ' + (d.s || 'no-answer') + ' ' + d.url + ' (' + d.label + ')'));
    console.log('external links: ' + links.length + ' checked, ' + dead.length + ' dead');
    process.exit(dead.length ? 1 : 0);
})();
