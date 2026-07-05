// Idempotent injector: add the single self-sufficient Observatory telemetry tag to every
// content page under one or more course roots. Because ObservatoryTelemetry.js now
// self-loads FirebaseAuth, ONE tag is all a page needs. The tag is placed as the LAST
// script before </body> so any statically-included FirebaseAuth.js always precedes it
// (avoids the "auth tag not yet executed at init" ordering trap).
//
// Usage:
//   node _tools/observatory/inject-telemetry.js --dry-run <root> [<root> ...]
//   node _tools/observatory/inject-telemetry.js <root> [<root> ...]
// Roots are relative to _app (e.g. houses/web/network-plus) or absolute.
// Skips: index.html hubs, _source/ _archive/ _backup/ copies, .bak files, and pages that
// already include the tag. Reports every bucket; never silently drops a page.
const fs = require('fs'), path = require('path');
const APP = path.resolve('_app');
const TAG = '    <script src="/components/ObservatoryTelemetry.js"></script>';
const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const roots = args.filter(a => a !== '--dry-run');
if (!roots.length) { console.error('need at least one course root'); process.exit(2); }

// Recursively collect *.html under a directory. Skips non-served/dev dirs (anything
// starting with "_" e.g. _source/_archive/_backup/_compare), node_modules, and instructor/
// materials (not student research content). Content that lives in index.html (chapters,
// modules, labs like chapters/chNN/index.html) IS collected - only true hubs are filtered
// out below by isContentPage.
function walk(dir, out) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
    for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (e.name.startsWith('_') || e.name === 'node_modules' || e.name === 'instructor') continue;
            walk(full, out);
        } else if (e.isFile() && e.name.endsWith('.html')) {
            out.push(full);
        }
    }
}

// A page is trackable student content unless it is a non-served copy. index.html is NOT
// excluded here: across the Observatory, chapters/modules/labs live in index.html files,
// and skipping them would under-track real content. Course-root and category hub index.html
// pages are also included (they only ever emit a harmless page_view; content_complete never
// fires there), which is an intentional superset of "content" to guarantee full coverage.
function isContentPage(file) {
    if (file.includes('.bak')) return false;
    return true;
}

const summary = [];
let totInject = 0, totAlready = 0, totNoBody = 0, totSkipIndex = 0;

for (const r of roots) {
    const root = path.isAbsolute(r) ? r : path.join(APP, r);
    const files = []; walk(root, files);
    let inject = 0, already = 0, nobody = 0, skipped = 0;
    const noBodyList = [];
    for (const f of files) {
        if (!isContentPage(f)) { skipped++; continue; }
        let html = fs.readFileSync(f, 'utf8');
        if (html.includes('ObservatoryTelemetry.js')) { already++; continue; }
        // Insert before the LAST </body> (case-insensitive), so it is the final script.
        const m = html.match(/<\/body>/gi);
        if (!m) { nobody++; noBodyList.push(path.relative(APP, f)); continue; }
        const idx = html.toLowerCase().lastIndexOf('</body>');
        html = html.slice(0, idx) + TAG + '\n' + html.slice(idx);
        if (!DRY) fs.writeFileSync(f, html);
        inject++;
    }
    summary.push({ root: r, htmlFiles: files.length, contentPages: files.length - skipped, inject, already, nobody, noBodyList });
    totInject += inject; totAlready += already; totNoBody += nobody; totSkipIndex += skipped;
}

console.log((DRY ? '[DRY RUN] ' : '[APPLIED] ') + 'Observatory telemetry injection\n');
for (const s of summary) {
    console.log('  ' + s.root);
    console.log('    html files: ' + s.htmlFiles + '  content pages: ' + s.contentPages
        + '  -> inject: ' + s.inject + '  already: ' + s.already + '  no-</body>: ' + s.nobody);
    if (s.noBodyList.length) s.noBodyList.slice(0, 8).forEach(p => console.log('      NO BODY: ' + p));
}
console.log('\n  TOTAL inject: ' + totInject + '  already: ' + totAlready + '  no-body(skipped): ' + totNoBody + '  index/copies skipped: ' + totSkipIndex);
if (DRY) console.log('  (dry run - no files written)');
