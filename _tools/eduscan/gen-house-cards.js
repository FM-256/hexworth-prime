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
 * All house paths are inline static arrays (verified: nothing builds them at runtime), so a static parse is
 * complete. Entries vary: most are {id,name,cert,href?}; some houses (e.g. dark-arts) use `paths` for other
 * things (game gates: {id,number,name,hint}). We extract whatever id/name/cert/href are present and stay
 * honest about anything we could not parse (a per-house parse-warning), rather than silently dropping it.
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

// Extract the text INSIDE the first `paths: [ ... ]` array via bracket-depth scan (robust to newlines and
// to `[`/`]` that may appear inside entry strings, since we only balance the outermost array brackets).
function extractPathsBlock(html) {
    const m = html.match(/paths\s*:\s*\[/);
    if (!m) return null;
    let i = m.index + m[0].length - 1; // index of the opening '['
    const start = i;
    let depth = 0;
    for (; i < html.length; i++) {
        const c = html[i];
        if (c === '[') depth++;
        else if (c === ']') { depth--; if (depth === 0) return html.slice(start + 1, i); }
    }
    return null; // unbalanced
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

// Extract one house's cards. Returns { cards:[{id,name,cert,href}], warnings:[] }.
function extractHouse(houseId) {
    const f = path.join(ROOT, '_app/houses', houseId, 'index.html');
    if (!fs.existsSync(f)) return { cards: [], warnings: ['no index.html'] };
    const block = extractPathsBlock(fs.readFileSync(f, 'utf8'));
    if (block === null) return { cards: [], warnings: ['no paths: [ ... ] array found'] };
    // Entries are flat object literals; the icon field is an <img> string with no braces, so a
    // non-nested {...} match captures each entry whole.
    const entries = block.match(/\{[^{}]*\}/g) || [];
    const cards = [];
    entries.forEach((e) => {
        const id = field(e, 'id');
        if (!id) return;
        cards.push({ id: id, name: field(e, 'name'), cert: field(e, 'cert'), href: field(e, 'href') });
    });
    // Honesty check: every `id:` in the block should have become a card. If not, the format is off and
    // we are under-counting; surface it rather than pretend the enumeration is complete.
    const rawIds = (block.match(/(^|[\s,{])id\s*:/g) || []).length;
    const warnings = [];
    if (rawIds !== cards.length) warnings.push('parsed ' + cards.length + ' of ' + rawIds + ' id: entries (paths format anomaly; enumeration may be incomplete)');
    return { cards: cards, warnings: warnings };
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
