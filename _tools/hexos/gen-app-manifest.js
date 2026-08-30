#!/usr/bin/env node
/**
 * gen-app-manifest.js  —  HEXOS-0
 *
 * @catalog what    Generates _app/data/hex-apps.json: the one authoritative record of everything
 * @catalog what    launchable on Hexworth. Both the `run` CLI and the icon grid read this and
 * @catalog what    nothing else. Also reports launchable surfaces that are NOT registered.
 * @catalog run     node _tools/hexos/gen-app-manifest.js [--check] [--unregistered]
 * @catalog status  GATE
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
// Known-unregistered surfaces at the time the gate was wired. The gate blocks anything NOT in this
// list, so it starts protecting immediately instead of waiting on a triage backlog. THIS LIST
// SHOULD ONLY EVER SHRINK; adding to it is how a gate quietly stops gating.
const BASELINE = path.join(REPO, '_tools/hexos/unregistered-baseline.json');

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
    { id: 'hub',          name: 'The Hub',          entry: '/houses/hub/index.html', house: null,     category: 'platform', verb: 'open' },
    { id: 'workshop',     name: 'The Workshop',     entry: '/workshop/index.html',  house: null,      category: 'platform', verb: 'open' },
    { id: 'oasis',        name: 'The Oasis',        entry: '/oasis/index.html',     house: null,      category: 'platform', verb: 'open' },
    { id: 'rig',          name: 'The Rig',          entry: '/rig/index.html',       house: null,      category: 'platform', verb: 'open' },
    { id: 'hive',         name: 'The Hive',         entry: '/hive/index.html',      house: null,      category: 'platform', verb: 'open' },
    { id: 'dispatch',     name: 'Dispatch',         entry: '/dispatch/index.html',  house: null,      category: 'platform', verb: 'open' },
    { id: 'tenant',       name: 'Tenant Console',   entry: '/tenant/index.html',    house: null,      category: 'platform', verb: 'open' },
    { id: 'operator',     name: 'Operator Console', entry: '/operator/index.html',  house: null,      category: 'platform', verb: 'open' },
    { id: 'announcements', name: 'Announcements',   entry: '/announcements/index.html', house: null,  category: 'platform', verb: 'open' },
    { id: 'dojo',         name: 'The Dojo',         entry: '/dark-arts/vault/dojo/index.html', house: 'dark-arts', category: 'track', verb: 'open' },
    { id: 'cve-evaluator', name: 'CVE Evaluation',  entry: '/dark-arts/vault/cve-evaluator/index.html', house: 'dark-arts', category: 'track', verb: 'open' },
];

/**
 * Container slugs, used ONLY as a tiebreaker. The scan no longer relies on a glob list.
 *
 * SCAN_GLOBS was a hand-kept pair of globs plus exclusions: the same hand-maintained-list disease
 * this tool exists to cure, split across two variables. It was one level deep, missed 16+ real
 * surfaces (workshop, oasis, rig, the whole arctic/districts system), and flagged alias stubs while
 * missing the real hub at the same name. Replaced with a full sweep plus classification by EVIDENCE.
 */
const CONTAINER_SLUGS = new Set(['modules', 'labs', 'quizzes', 'reviews', 'presentations', 'tools',
    'applets', 'gates', 'certs', 'instructor', 'exams', 'simulators', 'solutions', 'handouts',
    'speaker-notes', 'assets', 'data', 'components', 'config', 'vendor', '_lib', '_archive',
    'sections', 'chapters', 'weeks', 'backups', '_backups']);

/** Every index.html under _app, so nothing is out of scope by construction. */
function allIndexPages() {
    const out = [];
    (function walk(dir) {
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
            if (e.name.startsWith('.') || e.name === 'node_modules') continue;
            const full = path.join(dir, e.name);
            if (e.isDirectory()) walk(full);
            else if (e.name === 'index.html') out.push('/' + path.relative(APP, full).split(path.sep).join('/'));
        }
    })(APP);
    return out.sort();
}

/**
 * Classify by what a page DOES, not where it sits or what its directory is called.
 * Returns { kind, why } so every exclusion is auditable instead of a silent allow-list.
 */
function classify(rel) {
    const f = path.join(APP, rel.replace(/^\//, ''));
    let src;
    try { src = fs.readFileSync(f, 'utf8'); } catch (e) { return { kind: 'unreadable', why: 'could not read' }; }
    const lines = src.split('\n').length;
    const bare = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');

    // An alias redirects at LOAD. Detected by behaviour AND size, never by name: a 1000-line hub
    // with a location.href inside a click handler is not a stub, and an earlier version of this
    // check mislabelled dark-arts and web exactly that way by testing redirect before renderer.
    const topRedirect = /http-equiv=["']refresh/i.test(bare)
        || /<script>[^<]{0,600}?location\.(replace|href)\s*[=(]/i.test(bare.replace(/\n/g, ' '));
    if (lines < 120 && topRedirect) return { kind: 'alias', why: 'redirects at load, ' + lines + ' lines' };

    if (/HouseRenderer\.init/.test(bare)) return { kind: 'app', why: 'HouseRenderer' };
    if (/CertPathRenderer\.init/.test(bare)) return { kind: 'app', why: 'CertPathRenderer' };

    // CTF boxes are content inside the Arena app, the way modules are content inside a course.
    // Registering 16 of them as top-level apps would make `run` ambiguous and the grid unusable.
    if (/^\/arena\/boxes\//.test(rel)) return { kind: 'container', why: 'Arena box content' };
    if (rel === '/index.html') return { kind: 'container', why: 'site root, not an app' };

    const parts = rel.split('/').filter(Boolean);
    const slug = parts[parts.length - 2] || '';
    const guarded = /AccessGuard\.require\(/.test(bare);
    // Substance beats slug: dark-arts/vault/dojo is 2274 gated lines and was excluded purely
    // because the word "dojo" sounded like a section.
    if (guarded && lines >= 150) return { kind: 'app', why: 'guarded standalone, ' + lines + ' lines' };
    if (CONTAINER_SLUGS.has(slug)) return { kind: 'container', why: 'container slug "' + slug + '"' };
    if (lines < 60) return { kind: 'container', why: lines + ' lines, no guard, no renderer' };
    return { kind: 'app', why: lines + ' lines' + (guarded ? ', guarded' : '') };
}

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
    // Derived hubs: any page whose own code calls HouseRenderer/CertPathRenderer is a hub by
    // construction. Deriving beats hand-listing, but ONLY for the renderer-backed cases: Nancy
    // showed houses/hub calls neither, so it stays an explicit PLATFORM_APPS entry rather than
    // being silently dropped by a rule that only understands two renderers.
    for (const rel of allIndexPages()) {
        if (seen.has(rel)) continue;
        const c = classify(rel);
        if (c.kind !== 'app' || !/Renderer$/.test(c.why)) continue;
        const parts = rel.split('/').filter(Boolean);
        const id = parts[parts.length - 2];
        seen.set(rel, {
            id: id, name: id.replace(/(^|-)(\w)/g, (m, a, b) => (a ? ' ' : '') + b.toUpperCase()),
            house: parts[0] === 'houses' ? id : null,
            category: c.why === 'HouseRenderer' ? 'house' : 'cert-prep',
            entry: rel, verb: 'open', clientGuard: permissionFor(rel),
            status: 'available', source: 'derived:' + c.why,
        });
    }

    for (const p of PLATFORM_APPS) {
        if (seen.has(p.entry)) { notes.push(`${p.id}: already in HubRegistry, PLATFORM_APPS entry is redundant`); continue; }
        seen.set(p.entry, { ...p, clientGuard: permissionFor(p.entry), status: 'available', source: 'PLATFORM_APPS' });
    }

    const apps = [...seen.values()].sort((a, b) => a.id.localeCompare(b.id));
    return { apps, notes };
}

/**
 * Launchable pages no manifest entry points at. The omission detector, now over a full sweep.
 * Also returns the excluded set with reasons, so a clean run can be audited rather than trusted.
 */
function unregistered(apps) {
    const known = new Set(apps.map(a => a.entry));
    const missing = [], excluded = [];
    for (const rel of allIndexPages()) {
        if (known.has(rel)) continue;
        const c = classify(rel);
        if (c.kind === 'app') missing.push({ rel: rel, why: c.why });
        else excluded.push({ rel: rel, kind: c.kind, why: c.why });
    }
    return { missing: missing, excluded: excluded };
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
        const res = unregistered(apps);
        const swept = allIndexPages().length;
        console.log(`swept ${swept} index.html pages; manifest has ${apps.length} apps`);
        console.log(`excluded ${res.excluded.length} (alias or container), by evidence not by glob`);
        if (process.argv.includes('--show-excluded')) {
            res.excluded.forEach(e => console.log(`    [${e.kind}] ${e.rel}  (${e.why})`));
        }
        let base = [];
        if (fs.existsSync(BASELINE)) base = JSON.parse(fs.readFileSync(BASELINE, 'utf8')).known || [];
        const baseSet = new Set(base);
        const fresh = res.missing.filter(m => !baseSet.has(m.rel));
        const healed = base.filter(b => !res.missing.some(m => m.rel === b));

        if (process.argv.includes('--write-baseline')) {
            fs.writeFileSync(BASELINE, JSON.stringify({
                note: 'Known-unregistered launchable surfaces. Only ever shrink this list.',
                written: 'by gen-app-manifest.js --write-baseline',
                count: res.missing.length, known: res.missing.map(m => m.rel),
            }, null, 2) + '\n');
            console.log(`baseline written: ${res.missing.length} known-unregistered`);
            return;
        }

        console.log(`known-unregistered baseline: ${base.length}`);
        if (healed.length) console.log(`  ${healed.length} baseline entrie(s) now registered; shrink the baseline`);
        if (!fresh.length) { console.log('no NEW unregistered launchable surfaces'); return; }
        console.log(`\n${fresh.length} NEW LAUNCHABLE SURFACE(S) NOT IN THE MANIFEST:`);
        fresh.forEach(m => console.log(`  ${m.rel}  (${m.why})`));
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
