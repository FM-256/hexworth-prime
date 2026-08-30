#!/usr/bin/env node
/**
 * gen-app-manifest.js  —  HEXOS-0
 *
 * @catalog what    Generates _app/data/hex-apps.json: the one authoritative record of everything
 * @catalog what    launchable on Hexworth. Both the `run` CLI and the icon grid read this and
 * @catalog what    nothing else. Also reports launchable surfaces that are NOT registered.
 * @catalog run     node _tools/hexos/gen-app-manifest.js [--check] [--unregistered]
 * @catalog status  TOOL   (not yet wired into post-verify; GATE only once it is)
 *
 * WHY THIS EXISTS
 * ---------------
 * Hexworth has applications, documents, processes, a scheduler, permissions and per-user state.
 * What it lacked was a single list of what can be launched and a single way to launch it, so every
 * surface hand-wired its own launching. That is why things silently become unreachable:
 *   - Five Vault cards rendered cursor:pointer and did nothing, Bug Hunting and EHE among them.
 *   - A final exam students cannot reach from its own hub (taskboard #272).
 *   - 551 catalog entries with no inbound href (taskboard #277).
 * Same failure each time: something exists and nothing authoritative knows it exists.
 *
 * WHY NOT JUST USE HubRegistry
 * ----------------------------
 * HubRegistry is healthy (all 122 hubHrefs resolve on disk) but it is scoped to course HUBS. Eight
 * launchable surfaces sit outside it, including Bug Hunting, the CVE Evaluation track and the
 * Arena. The manifest is the superset. It is GENERATED from HubRegistry plus a small explicit
 * PLATFORM_APPS list, so HubRegistry stays the source for everything it already owns and this file
 * never becomes a second competing copy of it.
 *
 * THE DRIFT DEFENCE IS THE POINT
 *   --check          re-derives and fails if the committed manifest no longer matches its sources.
 *   --unregistered   scans for launchable index.html files absent from the manifest and fails.
 * The second is what would have caught Bug Hunting being invisible. A hand-kept list decays; a
 * hand-kept list with a discovery check that fails on omission does not.
 *
 * DERIVED, NOT DECLARED, AND DELIBERATELY NOT CALLED `permission`
 * `clientGuard` is read out of the target page's own AccessGuard.require(...) call rather than
 * asserted here, so it cannot disagree with what the page DECLARES. It is not access control:
 * AccessGuard is browser JS over static hosting, so an unauthenticated request receives the full
 * body regardless. See the note on permissionFor(). Real enforcement lives in firestore.rules.
 */

const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '../..');
const APP = path.join(REPO, '_app');
const OUT = path.join(APP, 'data/hex-apps.json');

/**
 * Launchable surfaces HubRegistry genuinely does not carry. Started at nine; five were duplicates
 * of real registry entries my broken regex could not see (bug-hunting, signal, ehe, wifi-arsenal,
 * vault). The list shrinking on contact with a correct parser is the point: every entry here is a
 * claim that the registry lacks something, and that claim should be hard to make.
 */
const PLATFORM_APPS = [
    { id: 'arena',        name: 'The Arena',        entry: '/arena/index.html',   house: 'dark-arts', category: 'platform', verb: 'open' },
    { id: 'career',       name: 'Career Launchpad', entry: '/career/index.html',  house: null,        category: 'platform', verb: 'open' },
    { id: 'games',        name: 'The Arcade',       entry: '/games.html',         house: null,        category: 'platform', verb: 'play' },
    { id: 'cve-evaluator', name: 'CVE Evaluation',  entry: '/dark-arts/vault/cve-evaluator/index.html', house: 'dark-arts', category: 'track', verb: 'open' },
];

/** Directories whose index.html is a launchable surface, for the unregistered scan. */
const SCAN_GLOBS = ['houses/*/index.html', 'dark-arts/vault/*/index.html', 'arena/index.html', 'signal/index.html'];

/** Slugs under a scanned directory that are containers, not launchable apps. */
// Slugs that are content CONTAINERS rather than launchable apps. Deliberately does NOT include
// 'dojo' or 'incubator': dark-arts/vault/dojo is a 2274-line gated standalone, and the incubators
// are 500-990 line pages. Both were excluded here on the strength of the directory NAME sounding
// like a section, which is the same eyeball-not-evidence mistake this tool exists to catch.
const NOT_APPS = new Set(['modules', 'labs', 'quizzes', 'reviews', 'presentations', 'tools',
    'applets', 'gates', 'certs', 'instructor', 'exams', 'simulators']);

function readHubRegistry() {
    // Execute the module and use its own API. A regex over the source silently dropped 22 of 144
    // entries (bug-hunting and signal among them), which then looked like registry gaps and got
    // hand-added to PLATFORM_APPS as duplicates. The tool built to stop "something exists and
    // nothing knows it" had committed exactly that. Never pattern-match a module you can execute.
    const vm = require('vm');
    const src = fs.readFileSync(path.join(APP, 'components/HubRegistry.js'), 'utf8');
    const ctx = { window: {}, module: { exports: {} }, console };
    vm.createContext(ctx);
    vm.runInContext(src, ctx);
    const R = ctx.module.exports || ctx.window.HubRegistry;
    if (!R || typeof R.all !== 'function') throw new Error('HubRegistry did not expose all()');
    return R.all().filter(h => h.id && h.hubHref).map(h => ({
        id: h.id, name: h.label, sublabel: h.sublabel, entry: h.hubHref,
        house: h.house || null, status: h.status, category: h.category || 'course',
        icon: h.icon, tenantAssignable: h.tenantAssignable,
    }));
}

/**
 * The CLIENT-SIDE guard a page declares, read from its own AccessGuard.require(...) call.
 *
 * NAMED clientGuard, NOT permission, because Mallory proved the difference matters. AccessGuard is
 * browser JavaScript over static Hosting: it hides the body with CSS and then redirects. A curl
 * never runs it, so the FULL body is served unauthenticated every time. She pulled the Vault's
 * complete 8-gate curriculum, module titles and hrefs included, with one unauthenticated request.
 *
 * Calling this field `permission` would have invited every consumer, and every reader, to treat it
 * as enforcement. It is a declaration. Real enforcement on this platform lives in firestore.rules,
 * which she confirmed by getting a 403 PERMISSION_DENIED on an unauthenticated Observatory read.
 */
function permissionFor(entry) {
    const f = path.join(APP, entry.replace(/^\//, ''));
    if (!fs.existsSync(f)) return null;
    let src = fs.readFileSync(f, 'utf8');
    // Strip comments first: houses/eye/index.html carries a CertPathRenderer.init string inside a
    // comment while actually calling HouseRenderer, and a naive scan believes the comment.
    src = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
    // BOTH quote styles. 17 files call require("...") and a single-quote-only regex reports them
    // as 'public', i.e. a gated page labelled open.
    const m = /AccessGuard\.require\(\s*['"]([^'"]+)['"]\s*(?:,\s*(\d+))?/.exec(src);
    if (!m) return 'public';
    return m[2] ? `${m[1]}:${m[2]}` : m[1];   // keep the gate LEVEL: require('gate', 1) -> "gate:1"
}

function build() {
    const seen = new Map();
    const notes = [];

    for (const h of readHubRegistry()) {
        seen.set(h.entry, {
            id: h.id, name: h.name, sublabel: h.sublabel || undefined, house: h.house,
            category: h.category, entry: h.entry, verb: 'open',
            clientGuard: permissionFor(h.entry), icon: h.icon || undefined,
            status: h.status || 'available', tenantAssignable: h.tenantAssignable,
            source: 'HubRegistry',
        });
    }
    for (const p of PLATFORM_APPS) {
        if (seen.has(p.entry)) { notes.push(`${p.id}: already in HubRegistry, PLATFORM_APPS entry is redundant`); continue; }
        seen.set(p.entry, { ...p, clientGuard: permissionFor(p.entry), status: 'available', source: 'PLATFORM_APPS' });
    }

    const apps = [...seen.values()].sort((a, b) => a.id.localeCompare(b.id));
    return { apps, notes };
}

/** Launchable index.html files that no manifest entry points at. This is the omission detector. */
function unregistered(apps) {
    const known = new Set(apps.map(a => a.entry));
    const found = [];
    const add = rel => { if (fs.existsSync(path.join(APP, rel)) && !known.has('/' + rel)) found.push('/' + rel); };
    for (const g of SCAN_GLOBS) {
        if (!g.includes('*')) { add(g); continue; }
        const [dir, , file] = g.split('/');
        const base = path.join(APP, g.split('/*')[0]);
        if (!fs.existsSync(base)) continue;
        for (const slug of fs.readdirSync(base)) {
            if (NOT_APPS.has(slug)) continue;
            const rel = path.join(g.split('/*')[0], slug, 'index.html');
            add(rel);
        }
    }
    return found;
}

function main() {
    const { apps, notes } = build();
    const dead = apps.filter(a => !fs.existsSync(path.join(APP, a.entry.replace(/^\//, ''))));
    const payload = JSON.stringify({
        generated: 'by _tools/hexos/gen-app-manifest.js, do not hand-edit',
        clientGuardIsNotEnforcement:
            'clientGuard is the AccessGuard.require() value a page DECLARES. AccessGuard is browser ' +
            'JS over static hosting: it hides the body with CSS then redirects, so an unauthenticated ' +
            'HTTP request still receives the full page. Do not treat this field as access control. ' +
            'Real enforcement lives in firestore.rules.',
        count: apps.length, apps,
    }, null, 2) + '\n';

    if (process.argv.includes('--unregistered')) {
        const miss = unregistered(apps);
        console.log(`manifest: ${apps.length} apps`);
        if (!miss.length) { console.log('no unregistered launchable surfaces'); return; }
        console.log(`\n${miss.length} LAUNCHABLE SURFACE(S) NOT IN THE MANIFEST:`);
        miss.forEach(m => console.log('  ' + m));
        console.log('\nAdd each to HubRegistry (if it is a course hub) or to PLATFORM_APPS.');
        process.exitCode = 1;
        return;
    }

    if (dead.length) {
        console.error(`DEAD ENTRIES: ${dead.length} app(s) point at a file that does not exist.`);
        dead.forEach(d => console.error(`  ${d.id} -> ${d.entry}`));
        process.exit(2);
    }

    if (process.argv.includes('--check')) {
        const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
        if (current !== payload) {
            console.error('DRIFT: _app/data/hex-apps.json no longer matches HubRegistry + PLATFORM_APPS.');
            console.error('Run: node _tools/hexos/gen-app-manifest.js');
            process.exit(1);
        }
        console.log(`OK: hex-apps.json matches its sources (${apps.length} apps).`);
        return;
    }

    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, payload);
    const byCat = apps.reduce((m, a) => (m[a.category] = (m[a.category] || 0) + 1, m), {});
    const byGuard = apps.reduce((m, a) => (m[a.clientGuard] = (m[a.clientGuard] || 0) + 1, m), {});
    console.log(`Wrote ${path.relative(REPO, OUT)}: ${apps.length} apps.`);
    console.log('  by category:  ' + Object.entries(byCat).map(([k, v]) => `${k}=${v}`).join('  '));
    console.log('  by clientGuard:' + Object.entries(byGuard).map(([k, v]) => ` ${k}=${v}`).join(' '));
    notes.forEach(n => console.log('  note: ' + n));
}

if (require.main === module) main();
module.exports = { build, unregistered, permissionFor, readHubRegistry, PLATFORM_APPS };
