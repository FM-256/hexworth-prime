// Surgically (re)crawl the 6 Observatory course roots that the 2026-03-29 crawl missed, so
// Dr. Hex's catalog seeder covers all 16 courses. Writes one tree JSON per root and merges a
// manifest entry for each, leaving the other 207 trees untouched (no churn). Two of the six
// (projects, bug-hunting) live outside houses/, which is why discoverHubs never found them.
const path = require('path'), fs = require('fs');
const TreeMapper = require(path.resolve('_tools/eduscan/validators/tree-mapper'));
const mapper = new TreeMapper({ rootPath: path.resolve('_app'), verbose: false });
const OUT = path.resolve('_app/data/course-trees');

// Hub entry points (relative to _app), one per stale Observatory root.
const ROOTS = [
    'houses/code/python-for-it/index.html',
    'houses/divergent/ethics-it/index.html',
    'houses/shield/infosec/index.html',
    'projects/index.html',
    'dark-arts/vault/bug-hunting/index.html',
    'houses/matrix/adv-linux/index.html'
];

const mpath = path.join(OUT, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(mpath, 'utf8'));
const byHub = new Map(manifest.hubs.map(h => [h.hub, h]));   // dedup/replace by hub path

// Crawl each stale root, write its tree JSON, and stage a manifest entry (add or replace
// by hub path) so an existing entry is never duplicated.
for (const r of ROOTS) {
    const res = mapper.buildTree(r);
    if (res.error) { console.log('  ERR  ' + r + ' :: ' + res.error); continue; }
    const fp = mapper.writeJSON(res, OUT);
    const file = path.basename(fp);
    byHub.set(res.hub, { hub: res.hub, title: res.title, stats: res.stats, file });
    console.log('  crawled ' + r + ' -> ' + file + '  (' + (res.stats ? res.stats.totalNodes : '?') + ' nodes, ' + (res.stats ? res.stats.broken : '?') + ' broken)');
}

// Write the merged manifest back (207 existing + the newly crawled roots).
manifest.hubs = Array.from(byHub.values());
manifest.generated = new Date().toISOString();
fs.writeFileSync(mpath, JSON.stringify(manifest, null, 2));
console.log('  manifest hubs now: ' + manifest.hubs.length);
