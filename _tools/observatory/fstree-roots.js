// Build filesystem-derived course trees for Observatory roots whose hub renders content
// dynamically (data-path-href launcher pattern), so the static link-crawler in tree-mapper.js
// yields an empty tree. Emits the SAME node shape the crawler produces
// ({path, title, status, linkType, linkText, children}) so seed_catalog.py consumes it
// unchanged, and merges each root's manifest entry. Content-page rule mirrors the telemetry
// injector: skip index hubs, underscore/instructor dirs, .bak, and meta-refresh redirect stubs.
const fs = require('fs'), path = require('path');
const APP = path.resolve('_app');
const OUT = path.join(APP, 'data', 'course-trees');

// Roots the crawler cannot follow (dynamic hubs). Either walk a single `root`, or (for
// launcher courses whose content is filename-prefixed across sibling dirs) collect from
// `dirs` filtered by `match`. `hub` is the Observatory card root, so the seeder maps the
// tree to the card (FEH additionally needs SECONDARY_ROOTS to own the content paths).
const SPECS = [
    { root: 'projects', hub: 'projects/index.html', file: 'projects.json', title: 'Projects' },
    { root: 'dark-arts/vault/bug-hunting', hub: 'dark-arts/vault/bug-hunting/index.html', file: 'dark-arts--vault--bug-hunting.json', title: 'Bug Hunting' },
    { dirs: ['houses/dark-arts/presentations', 'houses/dark-arts/labs', 'houses/dark-arts/quizzes'], match: /dark-arts-feh-/,
      hub: 'houses/dark-arts/feh/index.html', file: 'dark-arts--feh.json', title: 'Foundations of Ethical Hacking' }
];

// Collect every .html under a dir, skipping dev/non-student dirs.
function walk(dir, out) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (e.name.startsWith('_') || e.name === 'node_modules' || e.name === 'instructor') continue;
            walk(full, out);
        } else if (e.isFile() && e.name.endsWith('.html')) out.push(full);
    }
}

// Read a file once; return { title, isRedirect }.
function meta(f) {
    let html = '';
    try { html = fs.readFileSync(f, 'utf8'); } catch (e) { return { title: path.basename(f), isRedirect: false }; }
    const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    return {
        title: m ? m[1].trim().slice(0, 120) : path.basename(f),
        isRedirect: /http-equiv\s*=\s*["']?refresh/i.test(html)
    };
}

const mpath = path.join(OUT, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(mpath, 'utf8'));
const byHub = new Map(manifest.hubs.map(h => [h.hub, h]));

// For each dynamic root: enumerate content pages into href nodes and write the tree + entry.
for (const s of SPECS) {
    // Collect candidate files: either walk one root dir, or collect from several dirs and
    // keep only filenames matching s.match (launcher courses like FEH whose content is
    // filename-prefixed across sibling dirs).
    const files = [];
    if (s.dirs) {
        for (const d of s.dirs) {
            const found = []; walk(path.join(APP, d), found);
            for (const f of found) { if (s.match.test(path.basename(f))) files.push(f); }
        }
    } else {
        walk(path.join(APP, s.root), files);
    }
    const children = [];
    for (const f of files) {
        if (path.basename(f) === 'index.html' || f.includes('.bak')) continue;
        const info = meta(f);
        if (info.isRedirect) continue;
        const rel = path.relative(APP, f).replace(/\\/g, '/');
        children.push({ path: rel, title: info.title, status: 'ok', depth: 1, linkType: 'href', linkText: info.title, children: [] });
    }
    // Prepend the course-home node (the hub index) as a real href node so the seeder
    // classifies it as the course home and emits an overview chunk with the content
    // inventory. Without this, launcher courses have no "what is in course X?" chunk
    // (the crawler's own course-home linkType is skipped as navigation).
    let homeTitle = s.title;
    try { const hm = meta(path.join(APP, s.hub)); if (hm.title) homeTitle = hm.title; } catch (e) { /* keep s.title */ }
    children.unshift({ path: s.hub, title: homeTitle, status: 'ok', depth: 1, linkType: 'href', linkText: homeTitle, children: [] });
    const stats = { totalNodes: children.length + 1, ok: children.length + 1, broken: 0, visited: 1 };
    const tree = { hub: s.hub, title: s.title, generated: new Date().toISOString(), stats,
        tree: { path: s.hub, title: s.title, status: 'ok', depth: 0, linkType: 'course-home', children } };
    fs.writeFileSync(path.join(OUT, s.file), JSON.stringify(tree, null, 2));
    byHub.set(s.hub, { hub: s.hub, title: s.title, stats, file: s.file });
    console.log('  fs-tree ' + (s.root || s.hub) + ' -> ' + s.file + '  (' + children.length + ' content nodes)');
}

// Persist the merged manifest.
manifest.hubs = Array.from(byHub.values());
manifest.generated = new Date().toISOString();
fs.writeFileSync(mpath, JSON.stringify(manifest, null, 2));
console.log('  manifest hubs now: ' + manifest.hubs.length);
