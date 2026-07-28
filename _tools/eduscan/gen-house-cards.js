#!/usr/bin/env node
/*
 * gen-house-cards.js: enumerate every house's inline `config.paths` cards.
 *
 * WHY: house pages (13 of them) each hand-maintain their own `config.paths` list, fed to the shared
 * HouseRenderer. That list is SEPARATE from HubRegistry (the catalog's source), and the two have drifted
 * (e.g. Observatory has 16 cards, only 9 sharing an id with the registry). The Hub Health dashboard could
 * not see this because it never read the house lists. This generator extracts them into a single manifest
 * so the dashboard + the deploy audit can reconcile house cards <-> registry and surface the drift.
 *
 * House paths come in two source shapes. Most are inline static arrays, so a static parse is complete.
 * Entries vary: most are {id,name,cert,href?}; some houses (e.g. dark-arts) use `paths` for other
 * things (game gates: {id,number,name,hint}). We extract whatever id/name/cert/href are present and stay
 * honest about anything we could not parse (a per-house parse-warning), rather than silently dropping it.
 * The second shape (north-star step 1, first used by ai) is a registry PROJECTION:
 *   paths: HubRegistry.byHouse('<house>').map(h => h.id)[.concat([ ...house-local object cards ])]
 * For that shape the registry half is resolved by calling byHouse() against the real HubRegistry module
 * (the same file the page loads), so the manifest reflects what the projection actually renders, and the
 * optional .concat([...]) array is parsed like a normal inline paths block.
 *
 * Output: _app/assets/data/house-cards.json  (fetched by the Hub Health panel; read by hub-registry-audit).
 * Run:    node _tools/eduscan/gen-house-cards.js
 * Reuse:  require() this module for { extract, HOUSES } without writing a file.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');

// The 13 houses that include the shared HouseRenderer.
const HOUSES = ['divergent', 'code', 'eye', 'forge', 'script', 'shield', 'cloud', 'matrix', 'web', 'ai', 'key', 'observatory', 'dark-arts'];

// Return the text INSIDE the array whose opening '[' sits at openIdx, via bracket-depth scan (robust
// to newlines and to `[`/`]` that may appear inside entry strings, since we only balance the outermost
// array brackets).
function scanArray(html, openIdx) {
    let depth = 0;
    for (let i = openIdx; i < html.length; i++) {
        const c = html[i];
        if (c === '[') depth++;
        else if (c === ']') { depth--; if (depth === 0) return html.slice(openIdx + 1, i); }
    }
    return null; // unbalanced
}

// Extract the text INSIDE the first `paths: [ ... ]` array.
function extractPathsBlock(html) {
    const m = html.match(/paths\s*:\s*\[/);
    if (!m) return null;
    return scanArray(html, m.index + m[0].length - 1);
}

// Read a quoted field value from a JS object-literal entry. Walks the string respecting backslash
// escapes (so an escaped quote does not truncate the value) and DECODES common escapes (\uXXXX, \n, \t,
// \r, \\, \', \") so the manifest stores the character the browser actually renders, not the raw source
// literal. The key must be preceded by a delimiter ([\s,{]) so 'id' does not match inside 'grid'/'data-id'.
function field(entry, key) {
    const m = entry.match(new RegExp("[\\s,{]" + key + "\\s*:\\s*(['\"])"));
    if (!m) return null;
    const q = m[1];
    let i = m.index + m[0].length, out = '';
    for (; i < entry.length; i++) {
        const c = entry[i];
        if (c === '\\') {
            const n = entry[i + 1];
            if (n === 'u') { out += String.fromCharCode(parseInt(entry.substr(i + 2, 4), 16) || 0); i += 5; }
            else if (n === 'n') { out += '\n'; i++; }
            else if (n === 't') { out += '\t'; i++; }
            else if (n === 'r') { out += '\r'; i++; }
            else { out += (n === undefined ? '' : n); i++; }   // \\ \' \" \/ etc -> literal next char
            continue;
        }
        if (c === q) return out;   // unescaped closing quote
        out += c;
    }
    return out; // unterminated (malformed source); return what we have
}

// Extract one house's cards. Returns { cards:[{id,name,cert,href,registryRef?}], warnings:[] }.
// A paths array can hold TWO entry shapes (Option B, stage 2+): object literals (house-local cards) and
// bare STRINGS (HubRegistry id references, whose data lives in the registry). Both must be enumerated, or
// the drift audit under-counts silently.
// Parse the inner text of a paths array into cards (both entry shapes) + honesty warnings.
function parseBlockCards(block) {
    // Strip line comments so quoted words inside a comment are not mistaken for string entries.
    const clean = block.replace(/\/\/[^\n]*/g, '');
    const cards = [];
    // Object entries: house-local cards. The icon field is an <img> string with no braces, so a
    // non-nested {...} match captures each entry whole.
    const objs = clean.match(/\{[^{}]*\}/g) || [];
    objs.forEach((e) => {
        const id = field(e, 'id');
        if (!id) return;
        cards.push({ id: id, name: field(e, 'name'), cert: field(e, 'cert'), href: field(e, 'href') });
    });
    // Bare-string entries = HubRegistry id references. Remove the objects first so their inner quoted
    // values are not captured; any remaining quoted id-like token is a top-level registry reference.
    const strEntries = clean.replace(/\{[^{}]*\}/g, '').match(/(['"])[a-z0-9][a-z0-9-]*\1/g) || [];
    strEntries.forEach((s) => cards.push({ id: s.slice(1, -1), name: null, cert: null, href: null, registryRef: true }));
    // Honesty check: every `id:` (one per object entry) should have become an object card. If not, an
    // object entry failed to parse and we are under-counting; surface it.
    const rawObjIds = (clean.match(/(^|[\s,{])id\s*:/g) || []).length;
    const objCards = cards.filter((c) => !c.registryRef).length;
    const warnings = [];
    if (rawObjIds !== objCards) warnings.push('parsed ' + objCards + ' of ' + rawObjIds + ' object entries (paths format anomaly; enumeration may be incomplete)');
    return { cards: cards, warnings: warnings };
}

function extractHouse(houseId) {
    const f = path.join(ROOT, '_app/houses', houseId, 'index.html');
    if (!fs.existsSync(f)) return { cards: [], warnings: ['no index.html'] };
    const html = fs.readFileSync(f, 'utf8');
    // Projection shape first (see header): resolve byHouse() against the real registry so the
    // manifest lists exactly the cards the page renders, then parse the optional concat array.
    const proj = html.match(/paths\s*:\s*HubRegistry\.byHouse\((['"])([a-z0-9-]+)\1\)\s*\.map\(\s*h\s*=>\s*h\.id\s*\)(\s*\.concat\(\s*\[)?/);
    if (proj) {
        const HubRegistry = require(path.join(ROOT, '_app/components/HubRegistry.js'));
        const cards = HubRegistry.byHouse(proj[2]).map((h) => ({ id: h.id, name: null, cert: null, href: null, registryRef: true, projected: true }));
        const warnings = [];
        if (proj[2] !== houseId) warnings.push("projection sources byHouse('" + proj[2] + "') on the " + houseId + ' page');
        if (proj[3]) {   // trailing .concat([ ...house-local object cards ])
            const inner = scanArray(html, proj.index + proj[0].length - 1);
            if (inner === null) warnings.push('unbalanced .concat([...]) array (house-local cards NOT enumerated)');
            else {
                const rest = parseBlockCards(inner);
                cards.push.apply(cards, rest.cards);
                warnings.push.apply(warnings, rest.warnings);
            }
        }
        return { cards: cards, warnings: warnings };
    }
    const block = extractPathsBlock(html);
    if (block === null) return { cards: [], warnings: ['no paths: [ ... ] array found'] };
    return parseBlockCards(block);
}

// Enumerate all houses. Returns { houses:{id:[cards]}, warnings:{id:[...]} }.
function extract() {
    const houses = {};
    const warnings = {};
    HOUSES.forEach((h) => {
        const r = extractHouse(h);
        houses[h] = r.cards;
        if (r.warnings.length) warnings[h] = r.warnings;
    });
    return { houses: houses, warnings: warnings };
}

module.exports = { extract: extract, extractHouse: extractHouse, HOUSES: HOUSES };

// CLI: write the manifest.
if (require.main === module) {
    const out = extract();
    const dir = path.join(ROOT, '_app/assets/data');
    fs.mkdirSync(dir, { recursive: true });
    const total = Object.keys(out.houses).reduce((n, h) => n + out.houses[h].length, 0);
    const payload = {
        note: 'Generated by _tools/eduscan/gen-house-cards.js. Enumerates each house index.html config.paths for the Hub Health drift audit. Do NOT hand-edit; re-run the generator.',
        houseCount: HOUSES.length,
        totalCards: total,
        houses: out.houses,
        warnings: out.warnings
    };
    fs.writeFileSync(path.join(dir, 'house-cards.json'), JSON.stringify(payload, null, 2) + '\n');
    const wc = Object.keys(out.warnings).length;
    console.log('house-cards.json: ' + total + ' cards across ' + HOUSES.length + ' houses' + (wc ? (': ' + wc + ' house(s) with parse warnings') : ': clean'));
    if (wc) Object.keys(out.warnings).forEach((h) => console.log('  WARN ' + h + ': ' + out.warnings[h].join('; ')));
}
