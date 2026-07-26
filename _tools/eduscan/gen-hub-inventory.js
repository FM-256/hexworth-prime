#!/usr/bin/env node
/*
 * gen-hub-inventory.js: derive the REAL hub/course-landing-page inventory from the pages themselves,
 * instead of the hand-curated 22-entry HubRegistry (which is the tenant-LICENSING catalog, not the
 * content universe). Reconciles that derived inventory against the named hub systems so the Hub Health
 * audit can report the truth: how many hubs actually exist, which are registered, and which are not.
 *
 * DETECTION (reliable, machine-readable signal): an `index.html` is a hub landing page if it drives a
 * hub RENDERER, one of:
 *   - CertPathRenderer.init(...) / CertPathRenderer.render(...)   (flat cert-hub stubs)
 *   - HouseRenderer + a `paths:` config                          (house landing pages)
 *   - <X>Engine.renderHub(...)                                    (engine-rendered hubs, e.g. Wireshark)
 *   - the dynamic hub renderer (_app/houses/hub/index.html, task #225)
 * This deliberately EXCLUDES modules (*.module.html), labs (*.lab.html), games, and CTF boxes, which are
 * content INSIDE a hub, not hubs. The fuzzy tail of plainly-rendered nested course pages (no standard
 * renderer) is NOT auto-detected here; it needs a separate heuristic pass and is reported as a known gap.
 *
 * Output: _app/assets/data/hub-inventory.json  (read by hub-registry-audit.js Part F, the deploy gate;
 *          surfacing it in the admin Hub Health panel is a tracked follow-up, not yet wired).
 * Run:    node _tools/eduscan/gen-hub-inventory.js
 * Reuse:  require() for { inventory, HUB_SIGNALS } without writing a file.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const APP = path.join(ROOT, '_app');

// Renderer signals that mark an index.html as a hub landing page.
const HUB_SIGNALS = [
    /CertPathRenderer\.(init|render)\s*\(/,
    /\b\w*Engine\.renderHub\s*\(/,
    /HouseRenderer\b[\s\S]{0,4000}?\bpaths\s*:/,   // a house page: includes HouseRenderer AND a paths config
    /HubRegistry\.(get|allWithDynamic)\b[\s\S]{0,2000}?renderHub/, // the dynamic hub renderer
];

// Normalize a served path / href to a comparable key (strip index.html, trailing slash, query/fragment,
// resolve . and ..). Identical logic to hub-registry-audit.js's normHref so the two agree.
function normHref(href, baseDir) {
    if (!href) return null;
    let h = String(href).trim();
    if (h.charAt(0) !== '/') h = '/' + path.posix.join(baseDir || '', h);
    h = h.split('#')[0].split('?')[0];
    const parts = h.split('/'), out = [];
    for (let i = 0; i < parts.length; i++) {
        const seg = parts[i];
        if (seg === '.') continue;
        if (seg === '..') { if (out.length > 1) out.pop(); continue; }
        out.push(seg);
    }
    return out.join('/').replace(/index\.html$/, '').replace(/\/+$/, '') || '/';
}

// Recursively list every index.html under _app.
function walkIndexes(dir, acc) {
    let ents;
    try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return acc; }
    for (const e of ents) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) walkIndexes(full, acc);
        else if (e.name === 'index.html') acc.push(full);
    }
    return acc;
}

function titleOf(html) {
    const m = html.match(/<title>([^<]*)<\/title>/i);
    return m ? m[1].trim() : '';
}

// Auto-assign an organization category from the page's title/path/renderer. This is the label the
// catalog filters on (cert-prep / course / platform-hub), so it extends everywhere the hub is shown.
function categoryOf(page) {
    const t = (page.title || '').toLowerCase();
    const p = page.path;
    // platform-hub: house landing pages + named experience hubs (containers, not a single course).
    if (/house of the|the warehouse|\bobservatory\b|the arctic|the arena|the oasis|dispatch|colosseum/.test(t)) return 'platform-hub';
    if (/^\/houses\/[a-z0-9-]+\/index\.html$/.test(p) && /house of|warehouse|divergent/.test(t)) return 'platform-hub';
    // cert-prep: vendor certification prep (cert codes / vendor names / CertPathRenderer-driven).
    if ((page.renderer || '').indexOf('CertPathRenderer') > -1) return 'cert-prep';
    if (/\b(a\+|network\+|security\+|cysa\+|casp\+|linux\+|server\+|cloud\+|pentest\+|data\+|cyberops)\b/.test(t) ||
        /\b(ccna|comptia|aws|azure|cisco|isc2|cloud practitioner)\b/.test(t) ||
        /\b(az-\d|clf-c|dva-c|n10-\d|sy0-\d|xk0-\d|cs0-\d|cas-\d|200-301|cv0-\d)\b/.test(t)) return 'cert-prep';
    // course: academic/college course codes (CIS/COP/CTS####).
    if (/\b(cis\d{3,4}|cop\d{3,4}|cts\d{3,4}c?)\b/i.test(page.title || '')) return 'course';
    return 'uncategorized';
}
function signalOf(html) {
    for (const rx of HUB_SIGNALS) if (rx.test(html)) return rx.source.slice(0, 24);
    return null;
}

// Build the derived inventory: every hub-renderer page, reconciled against the named systems.
function inventory() {
    // Named systems.
    const HubRegistry = require(path.join(APP, 'components/HubRegistry.js'));
    const regByPath = {};
    HubRegistry.all().forEach((h) => { const n = normHref(h.hubHref, ''); if (n) regByPath[n] = h; });
    let houseCards = { houses: {} };
    try { houseCards = JSON.parse(fs.readFileSync(path.join(APP, 'assets/data/house-cards.json'), 'utf8')); } catch (e) { /* optional */ }
    const houseCardPaths = {};
    Object.keys(houseCards.houses || {}).forEach((hid) => (houseCards.houses[hid] || []).forEach((c) => {
        if (c.href) { const n = normHref(c.href, 'houses/' + hid); if (n) houseCardPaths[n] = true; }
    }));

    // Scan pages for the hub-renderer signal.
    const pages = [];
    for (const file of walkIndexes(APP, [])) {
        const html = fs.readFileSync(file, 'utf8');
        const sig = signalOf(html);
        if (!sig) continue;
        const served = '/' + path.relative(APP, file).split(path.sep).join('/'); // /houses/.../index.html
        const key = normHref(served, '');
        pages.push({ key: key, path: served, title: titleOf(html), renderer: sig });
    }
    pages.sort((a, b) => a.key.localeCompare(b.key));

    // Reconcile each detected hub page against the systems.
    const seen = {};
    const items = pages.map((p) => {
        seen[p.key] = true;
        return {
            path: p.path, title: p.title, renderer: p.renderer, category: categoryOf(p),
            inRegistry: !!regByPath[p.key], registryId: regByPath[p.key] ? regByPath[p.key].id : null,
            inHouseCards: !!houseCardPaths[p.key]
        };
    });
    // Registry entries whose hubHref did NOT match a detected hub page (points elsewhere / not renderer-driven).
    const registryOffPage = HubRegistry.all()
        .filter((h) => !seen[normHref(h.hubHref, '')])
        .map((h) => ({ id: h.id, hubHref: h.hubHref }));

    const registered = items.filter((i) => i.inRegistry).length;
    const byCategory = {};
    items.forEach((i) => { byCategory[i.category] = (byCategory[i.category] || 0) + 1; });
    return {
        hubPages: items,
        counts: {
            hubPagesDetected: items.length,
            registered: registered,
            unregistered: items.length - registered,
            registrySize: HubRegistry.all().length,
            registryOffPage: registryOffPage.length,
            byCategory: byCategory
        },
        registryOffPage: registryOffPage
    };
}

module.exports = { inventory: inventory, normHref: normHref, HUB_SIGNALS: HUB_SIGNALS };

if (require.main === module) {
    const inv = inventory();
    const dir = path.join(APP, 'assets/data');
    fs.mkdirSync(dir, { recursive: true });
    const payload = {
        note: 'Generated by _tools/eduscan/gen-hub-inventory.js. Derived hub-landing-page inventory (hub-renderer signal) reconciled vs the named hub systems. Do NOT hand-edit; re-run the generator.',
        counts: inv.counts,
        hubPages: inv.hubPages,
        registryOffPage: inv.registryOffPage
    };
    fs.writeFileSync(path.join(dir, 'hub-inventory.json'), JSON.stringify(payload, null, 2) + '\n');
    const c = inv.counts;
    console.log('hub-inventory.json: ' + c.hubPagesDetected + ' hub-renderer pages detected | ' +
        c.registered + ' registered, ' + c.unregistered + ' UNREGISTERED | registry has ' + c.registrySize +
        ' (' + c.registryOffPage + ' point off-page)');
}
