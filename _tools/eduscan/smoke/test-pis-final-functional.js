#!/usr/bin/env node
'use strict';

/**
 * @catalog what    Functional smoke for PIS-FINAL "Patient Zero": walks all 7 phases in Node and fails if an answer returns to the client config
 * @catalog run     node _tools/eduscan/smoke/test-pis-final-functional.js [--config <path to a config.js copy>]
 * @catalog status  TOOL
 *
 * Functional smoke for PIS-FINAL "Patient Zero" (Eclipse-tier final practical).
 *
 * Walks all 7 phases in Node directly (no browser), invoking terminal commands
 * and webApp form handlers via the config's public surface. Verifies:
 *   - The full happy path completes (Phase 1 to Phase 7)
 *   - config.js carries NO flag values (BOX-011, 2026-11-02): the answers live only in
 *     functions/box_flags.json / flag_registry. The test FAILS if any registry value appears
 *     in config.js flags[] (value, label, description), the box description, the hints, an
 *     answer-named key such as synthesis_flag, or (for the values that are never evidence:
 *     flag1 with brackets, flag2, flag4, flag6, flag7) anywhere in config.js or index.html
 *   - The scenario still YIELDS each registry value, derived from the evidence the student
 *     reads (Message-ID header, cert SAN, SIEM, Rapid7 scan id, SHA256 synthesis)
 *   - Phase 2 hash analyzer returns Cobalt Strike + Follina for the real attachment, BENIGN for the decoy
 *   - Phase 3 openssl s_client then x509 returns the SAN list with the C2 domain
 *   - Phase 4 threat intel returns EMBERWOLF as the match, IP geo shows NL edge + RU enrichment
 *   - Phase 5 SIEM marks Patient Zero's foreign-IP logins UNEXPLAINED
 *   - Phase 6 composite gate fires only when patch + scan + mail filter are all correct;
 *     the reveal shows Flag 6 built from the scan id and does NOT print Flag 7
 *   - The `phase` command shows no answer before it is earned
 *   - Phase 7 SHA256 synthesis over the six registry values equals the registry flag7
 *
 * No values are printed: the output names flags by id only.
 * No files are written: the config is evaluated in a vm sandbox.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '../../..');
const BOX_ID = 'pis-final-patient-zero';
const argIdx = process.argv.indexOf('--config');
const configPath = argIdx > -1
    ? path.resolve(process.argv[argIdx + 1])
    : path.join(ROOT, '_app/houses/shield/infosec/labs', BOX_ID, 'config.js');
const indexPath = path.join(path.dirname(configPath), 'index.html');

// Registry answers (single source of truth). Never printed.
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, 'functions/box_flags.json'), 'utf8'))[BOX_ID];
if (!registry || !registry.flags) { console.error(`No box_flags.json entry for ${BOX_ID}`); process.exit(2); }
const R = registry.flags;
const IDS = ['flag1', 'flag2', 'flag3', 'flag4', 'flag5', 'flag6', 'flag7'];

// Load the config in a sandbox (no temp file).
const raw = fs.readFileSync(configPath, 'utf8');
const indexRaw = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf8') : '';
const sandbox = { console };
vm.createContext(sandbox);
vm.runInContext(`${raw}\n;globalThis.__cfg = PISFinalConfig;`, sandbox, { filename: configPath });
const cfg = sandbox.__cfg;

// Mock engine: the BoxEngine surface the form handlers and commands consume.
const scoreEvents = [];
const flagsFound = [];
const mockEngine = {
    config: cfg,
    state: { flagsFound, score: cfg.scoring.base },
    addScore(delta, reason) {
        scoreEvents.push({ delta, reason });
        this.state.score = Math.max(cfg.scoring.minScore, this.state.score + delta);
    },
    awardFlag(id) { if (!flagsFound.includes(id)) flagsFound.push(id); },
    resolveFlagTokens(html) { return html; },
    _logEvent() {}
};
const mockTerm = { fs: cfg.filesystem || {} };

const checks = [];
function check(label, ok, detail = '') { checks.push({ label, ok: !!ok, detail }); }

function term(cmdName, argsStr = '', engine = mockEngine) {
    const handler = cfg.commands[cmdName];
    if (!handler) return `Unknown command: ${cmdName}`;
    const args = argsStr.trim() === '' ? [] : argsStr.split(/\s+/);
    return handler(args, mockTerm, engine);
}
function strip(html) {
    return String(html).replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
}
const lc = s => String(s).toLowerCase();
const has = (hay, needle) => lc(hay).includes(lc(needle).trim());
const sha16 = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16).toUpperCase();

// ============================================================
// Phase 0: config sanity + BOX-011 (no answers in the client)
// ============================================================

check('Config is Eclipse difficulty', cfg.difficulty === 'Eclipse');
check('Config base score is 1500', cfg.scoring.base === 1500);
check('Config maxScore is 750', cfg.scoring.maxScore === 750);
check('Config minScore floor is 0', cfg.scoring.minScore === 0);
check('Config has 7 flags, ids flag1..flag7 in order',
    cfg.flags.length === 7 && cfg.flags.every((f, i) => f.id === IDS[i]));
check('Config has 7 hints', cfg.hints.length === 7);
check('Registry has 7 values for flag1..flag7', IDS.every(id => typeof R[id] === 'string' && R[id].length > 0));
check('Registry entry keeps deliveryDisabled (no page-load pre-fetch of answers)', registry.deliveryDisabled === true);

check('BOX-011: no flags[] element carries a value',
    cfg.flags.every(f => !('value' in f)),
    cfg.flags.filter(f => 'value' in f).map(f => f.id).join(','));

// Any registry value inside any field of any flags[] element (label, description, value...).
const flagsText = JSON.stringify(cfg.flags);
const inFlags = IDS.filter(id => has(flagsText, R[id]));
check('BOX-011: no registry value appears anywhere in config.js flags[] (labels, descriptions)',
    inFlags.length === 0, inFlags.length ? `found: ${inFlags.join(',')}` : '');

const inHints = IDS.filter(id => has(JSON.stringify(cfg.hints), R[id]));
check('BOX-011: no registry value appears in the hints', inHints.length === 0, inHints.join(','));

const inDesc = IDS.filter(id => has(`${cfg.description}\n${JSON.stringify(cfg.lore || {})}`, R[id]));
check('BOX-011: no registry value appears in the box description or briefing lore', inDesc.length === 0, inDesc.join(','));

check('BOX-011: no synthesis_flag (answer-named key) in _db', !('synthesis_flag' in (cfg._db || {})));

// Values that are never evidence (the scenario shows their parts, not the submitted string)
// must not appear anywhere in the shipped source.
const neverEvidence = ['flag1', 'flag2', 'flag4', 'flag6', 'flag7'];
const inSource = neverEvidence.filter(id => has(raw, R[id]) || has(indexRaw, R[id]));
check('BOX-011: flag1/2/4/6/7 registry values appear nowhere in config.js or index.html',
    inSource.length === 0, inSource.length ? `found: ${inSource.join(',')}` : '');

// Phase 1 asks the student to tell the phish from the decoys by reading headers. The inbox
// once carried a "training overlay" verdict on every message, inline "<- mismatch" notes and
// lab-only IR notes naming msg/4; none of them may come back, rendered or in source.
const verdictRe = /training overlay|active phish|phishing decoy|IR Note|mismatches From domain|does NOT match From domain|Analysis block|\bdecoy\b/i;
// Render a webApp page the way the Browser would: message panes through _outlookHtml, the rest
// through html (string or function). A page that throws renders as '' and is reported below.
const renderErrors = [];
function renderPage(route) {
    const pg = cfg.webApp.pages[route];
    try {
        if (typeof pg._outlookHtml === 'function') return pg._outlookHtml();
        return typeof pg.html === 'function' ? pg.html.call(pg) : String(pg.html || '');
    } catch (e) { renderErrors.push(route); return ''; }
}
const allRoutes = Object.keys(cfg.webApp.pages);
const msgRoutes = allRoutes.filter(r => /^\/msg\/\d+$/.test(r));
// A GAME OVER page is shown only after a student clicks a decoy's link, so naming that
// message as a decoy there is the consequence, not a giveaway; it may not cite a verdict panel.
const rendered = Object.fromEntries(allRoutes.map(r => [r, strip(renderPage(r).replace(/></g, '> <'))]));
const gameOver = allRoutes.filter(r => /GAME OVER/.test(rendered[r]));
const verdictPages = allRoutes.filter(r => !gameOver.includes(r) && verdictRe.test(rendered[r]));
check('Phase 1: no rendered page (inbox, messages, portals, tools) names a phish or decoy',
    msgRoutes.length === 13 && verdictPages.length === 0 && renderErrors.length === 0,
    `${allRoutes.length} routes, ${msgRoutes.length} messages; verdict on: ${verdictPages.join(',')}; render errors: ${renderErrors.join(',')}`);
const gameOverCites = gameOver.filter(r => /Analysis block|analysis blocks|training overlay|msg\/4|the (active |real )?phish is/i.test(rendered[r]));
check('Phase 1: GAME OVER pages do not cite a verdict panel or name the real phish', gameOver.length >= 3 && gameOverCites.length === 0,
    `${gameOver.length} GAME OVER pages; citing: ${gameOverCites.join(',')}`);
// Query handlers render pages the route scan never reaches (they need input). Feed each one a
// query that matches nothing and scan what a student sees.
const noMatch = {
    'cve search': cfg._handleCveSearch('zz-no-such-term', mockEngine),
    'whois': cfg._handleWhois('no-such-domain.example', mockEngine),
    'hash lookup': cfg._handleHashLookup('0'.repeat(64), mockEngine),
    'threat intel': cfg._handleThreatIntel('zz-no-such-term', mockEngine),
    'ip geo': cfg._handleIpGeo('192.0.2.77', mockEngine),
    'siem dns': cfg._handleSiem('dns', 'zz-no-such-term', mockEngine),
    'siem auth': cfg._handleSiem('auth', 'zz-no-such-term', mockEngine)
};
const noMatchLeaks = Object.keys(noMatch).filter(k => /msg\/4|CORRECTED\.docx/i.test(strip(noMatch[k])) || verdictRe.test(strip(noMatch[k])));
check('Phase 1: no-match tool output does not name the phish, its attachment or a verdict', noMatchLeaks.length === 0, noMatchLeaks.join(','));
// The phish's own infrastructure and the later answers may be FOUND in evidence (operator accepted the
// log-to-mail pivot, 2026-11-02), but the tools may not hand them out: briefing samples, input
// placeholders, one-click prefills and no-match suggestions must stay generic.
const handout = [R.flag3, (R.flag5 || '').toLowerCase(), 'crimson-dawn-finance.net', 'nakamura-suppliers-corp.com', '185.220.101.45', 'CVE-2022-30190', 'Cobalt Strike', 'Follina'];
const surfaces = {
    'briefing toolkit': (cfg.lore && cfg.lore.toolkit || []).map(t => `${t.sample || ''} ${t.purpose || ''}`).join('\n'),
    'input placeholders': (raw.match(/placeholder="[^"]*"/g) || []).join('\n'),
    'one-click prefills': (raw.match(/\.value\s*=\s*(&quot;|['"])[^'"&]*(&quot;|['"])/g) || []).join('\n'),
    'no-match output': Object.values(noMatch).map(strip).join('\n')
};
const handed = Object.keys(surfaces).filter(k => handout.some(t => t && has(surfaces[k], t)));
check('Tools do not hand out IOCs or answers (briefing, placeholders, prefills, no-match hints)', handed.length === 0, handed.join(','));

// THE SWEEP. Every surface a student can open before typing an IOC: every browser route, every
// terminal command with no argument and with junk arguments, and the briefing. IOCs and answers may
// appear only on EVIDENCE routes, where finding them is the work: the mail itself and its download,
// the Slack thread and CVE pages that open only by ID. (The password page is NOT evidence: it is
// also a one-click new-tab tile.) The simulated filesystem (incident brief, pcap, logs) is evidence
// by operator decision 2026-11-02 (log-to-mail pivot, BUG-295) and is not swept.
const EVIDENCE_ROUTES = [/^\/inbox$/, /^\/msg\/\d+$/, /^\/downloads\//, /^\/archives\//, /^\/cve\/CVE-/];
const sweepTokens = [R.flag3, R.flag5, 'WS-DOKAFOR-01', 'crimson-dawn-finance.net', 'nakamura-suppliers-corp.com',
    '185.220.101.45', 'CVE-2022-30190', 'Cobalt Strike', 'Follina', 'MSDT', 'msg/4', 'CORRECTED.docx', 'EMBERWOLF'];
const sweep = {};
allRoutes.filter(r => !EVIDENCE_ROUTES.some(re => re.test(r))).forEach(r => { sweep['route ' + r] = rendered[r]; });
Object.keys(cfg.commands || {}).forEach(name => {
    [[], ['zz-bogus'], ['s_client', '-connect', 'zz.example:443'], ['zz.example']].forEach(a => {
        let o = '';
        try { o = String(cfg.commands[name](a, mockTerm, Object.assign({}, mockEngine, { state: { flagsFound: [], score: cfg.scoring.base } })) || ''); }
        catch (e) { o = ''; }
        sweep[`cmd ${name} ${a.join(' ')}`.trim()] = o;
    });
});
sweep['briefing lore'] = JSON.stringify(cfg.lore || {});
sweep['lab start (terminal welcome, boot, desktop)'] = JSON.stringify({ t: cfg.terminal || {}, b: cfg.boot || {}, d: cfg.desktop || {} });
const swept = Object.keys(sweep).filter(k => sweepTokens.some(t => t && has(strip(sweep[k]), t)));
// `phase` after each flag: it may show what was earned, never a later phase's answer or IOC.
const laterPhaseTokens = [
    ['msg/4', 'crimson-dawn-finance.net', 'nakamura-suppliers-corp.com'],                  // phase 1
    ['CORRECTED.docx', 'CVE-2022-30190', 'Cobalt Strike', 'Follina', 'MSDT'],              // phase 2
    [R.flag3],                                                                              // phase 3
    ['EMBERWOLF', '185.220.101.45'],                                                        // phase 4
    [R.flag5, 'WS-DOKAFOR-01']                                                              // phase 5
];
const phaseLeaks = [];
for (let k = 0; k <= 6; k++) {
    const found = IDS.slice(0, k);
    const out = strip(String(cfg.commands.phase([], mockTerm, Object.assign({}, mockEngine, { state: { flagsFound: found, score: cfg.scoring.base } })) || ''));
    laterPhaseTokens.forEach((toks, i) => { if (i >= k) toks.forEach(t => { if (t && has(out, t)) phaseLeaks.push(`after ${k} flags: phase ${i + 1} token`); }); });
}
check('Sweep: `phase` never shows a later phase\'s answer or IOC, at any flag state', phaseLeaks.length === 0, phaseLeaks.join('; '));
check('Sweep: no IOC or answer on any non-evidence route, terminal command output or the briefing',
    swept.length === 0 && Object.keys(sweep).length > 40, `${Object.keys(sweep).length} surfaces; leaking: ${swept.join(' | ')}`);

// The phish's attachment name and route must not reach the student before Phase 1: briefing
// toolkit samples, command usage/errors and the phase checklist.
const msg4Tell = /msg\/4|CORRECTED\.docx/i;
const preWork = {
    'briefing toolkit': (cfg.lore && cfg.lore.toolkit || []).map(t => `${t.sample || ''} ${t.purpose || ''}`).join('\n'),
    'sha256sum (no args)': term('sha256sum', ''),
    'sha256sum (missing file)': term('sha256sum', '/home/ir-lead/downloads/nope.docx'),
    'file (no args)': term('file', ''),
    'phase (no flags)': term('phase', '', Object.assign({}, mockEngine, { state: { flagsFound: [], score: cfg.scoring.base } }))
};
const preLeaks = Object.keys(preWork).filter(k => msg4Tell.test(String(preWork[k])) || verdictRe.test(String(preWork[k])));
check('Phase 1: briefing, command help/errors and phase checklist do not name the phish or its attachment',
    preLeaks.length === 0 && String(preWork['briefing toolkit']).length > 0, preLeaks.join(','));
const overlaySrc = ['training overlay', 'IR Note', 'mc-analysis', 'analysis: {', 'mc-phish-link'].filter(t => raw.toLowerCase().includes(t.toLowerCase()));
check('Phase 1: no verdict overlay or IR note in config.js source', overlaySrc.length === 0, overlaySrc.join(','));

// ============================================================
// Phase 1: the Message-ID the student reads is the flag1 value
// ============================================================

const msg4 = cfg.webApp.pages['/msg/4']._outlookHtml();
const msgIdMatch = strip(msg4).match(/Message-ID:\s*(<[^>]+>)/);
check('Phase 1: msg/4 header shows a Message-ID', !!msgIdMatch);
check('Phase 1: msg/4 Message-ID (with angle brackets) equals registry flag1',
    msgIdMatch && msgIdMatch[1] === R.flag1);
// The tell is in the raw headers themselves (no annotation points at it any more). Tags become
// spaces so adjacent header rows cannot run together.
const msg4Text = strip(msg4.replace(/</g, ' <'));
const hdr = name => (msg4Text.match(new RegExp(name + ':\\s*(\\S+)')) || [])[1];
const missingHdr = ['From', 'Reply-To', 'Message-ID', 'Authentication-Results', 'X-Originating-IP'].filter(h => !hdr(h));
check('Phase 1: msg/4 shows every header Phase 1 is solved from', missingHdr.length === 0, missingHdr.join(','));
const msg4From = ((hdr('From') || '').split('@')[1] || '').toLowerCase();
const msg4Reply = ((hdr('Reply-To') || '').split('@')[1] || '').toLowerCase();
const msg4IdHost = ((msgIdMatch && (msgIdMatch[1].match(/@([^>]+)>/) || [])[1]) || '').toLowerCase();
check('Phase 1: msg/4 Message-ID host and Reply-To domain both differ from the From domain (header tells)',
    !!msg4From && !!msg4IdHost && !!msg4Reply && msg4From !== msg4IdHost && msg4From !== msg4Reply,
    `from=${msg4From ? 'set' : 'missing'} idHost=${msg4IdHost ? 'set' : 'missing'} replyTo=${msg4Reply ? 'set' : 'missing'}`);

// ============================================================
// Phase 2: Hash Analyzer (registry flag2 = FAMILY:CVE)
// ============================================================

const [fam, cveId] = R.flag2.split(':');
let r = cfg._handleHashLookup(cfg._db.hash_db['Nakamura-Q1-2026-CORRECTED.docx'], mockEngine);
check('Phase 2: hash analyzer returns MALICIOUS for the real attachment', /MALICIOUS/i.test(strip(r)));
check('Phase 2: analyzer family normalizes to the registry family (spaces to underscores)',
    has(strip(r).replace(/ /g, '_'), fam));
check('Phase 2: analyzer names the registry CVE', has(r, cveId) && /Follina/i.test(r));
check('Phase 2: analyzer result carries the flag-format note', /flag-format note/i.test(r));

r = cfg._handleHashLookup(cfg._db.hash_db['budget-Q1-final.xlsx'], mockEngine);
check('Phase 2: hash analyzer returns BENIGN for the decoy attachment',
    /BENIGN/i.test(r) || (/\bClean\b/.test(strip(r)) && /\b0\s*\/\s*68\b/.test(strip(r))));
check('Phase 2: the decoy attachment is not associated with the real malware family',
    !/cobalt strike|emberwolf|follina|CVE-2022-30190/i.test(strip(r)));

// ============================================================
// Phase 3: DNS + PKI (registry flag3 = C2 domain from the cert SAN)
// ============================================================

r = term('dig', 'crimson-dawn-finance.net');
check('Phase 3: dig lookalike resolves to the Cloudflare edge', /104\.21\.45\.122/.test(r));
r = term('dig', '');
check('Phase 3: dig usage no longer lists the C2 domain', !has(r, R.flag3));

cfg._db._sclient_target = null;
r = term('openssl', 'x509 -noout -text');
check('Phase 3: x509 without a prior s_client does NOT reveal the SAN list',
    !/Subject Alternative/i.test(r) || /unable to load certificate|No certificate data/i.test(r));

r = term('openssl', 's_client -connect crimson-dawn.net:443 -showcerts');
check('Phase 3: s_client on the LEGIT domain does not prime the attacker cert',
    cfg._db._sclient_target !== 'crimson-dawn.net' || !/SAN LIST EXTRACTED/.test(r));

r = term('openssl', 's_client -connect crimson-dawn-finance.net:443 -showcerts');
check('Phase 3: s_client on the lookalike primes x509 state', cfg._db._sclient_target === 'crimson-dawn-finance.net');
r = term('openssl', 'x509 -noout -text');
const sanLine = (r.match(/DNS:[^\n]+/) || [''])[0];
const sans = sanLine.split(',').map(s => s.trim().replace(/^DNS:/, ''));
check('Phase 3: cert SAN list contains the registry C2 domain', sans.includes(R.flag3));
check('Phase 3: exactly one SAN entry is a <word>-c2 dynamic-DNS name, and it is flag3',
    sans.filter(s => /-c2\./.test(s)).length === 1 && sans.find(s => /-c2\./.test(s)) === R.flag3);
r = term('dig', R.flag3);
check('Phase 3: dig on the C2 domain resolves to the attacker IP', /185\.220\.101\.45/.test(r));
r = term('whois', 'crimson-dawn-finance.net');
check('Phase 3: whois shows the recent registration', /2026-05/.test(r));

// ============================================================
// Phase 4: Attribution (registry flag4 = ACTOR:CC)
// ============================================================

const [actor, cc] = R.flag4.split(':');
r = cfg._handleThreatIntel(R.flag3, mockEngine);
check('Phase 4: threat intel on the C2 domain returns the registry actor as 4/4', has(r, actor) && /4\/4/.test(r));
check('Phase 4: threat intel shows decoys CRIMSONTIDE and BLACKHELIX', /CRIMSONTIDE/.test(r) && /BLACKHELIX/.test(r));
r = cfg._handleIpGeo('185.220.101.45', mockEngine);
check('Phase 4: IP geo shows the NL edge (decoy surface)', /Amsterdam|Netherlands|\bNL\b/i.test(r));
check('Phase 4: IP geo actor-origin enrichment names the registry country code',
    /HexIntel|actor.{0,10}origin|enrichment/i.test(r) && new RegExp(`\\b${cc}\\b`).test(r));
r = cfg._handleIpGeo('10.0.4.18', mockEngine);
check('Phase 4: IP geo no longer labels the internal workstation "Patient Zero"', !/Patient Zero/i.test(r));

// ============================================================
// Phase 5: SIEM (registry flag5 = Patient Zero username)
// ============================================================

r = cfg._handleSiem('dns', 'crimson-dawn-finance.net', mockEngine);
check('Phase 5: DNS filter on the lookalike returns flag5 user + r.chen + s.patel',
    has(r, R.flag5) && /r\.chen/.test(r) && /s\.patel/.test(r));
r = cfg._handleSiem('dns', R.flag3, mockEngine);
check('Phase 5: DNS filter on the C2 domain returns ONLY the flag5 user',
    has(r, R.flag5) && !/r\.chen/.test(r) && !/s\.patel/.test(r));
r = cfg._handleSiem('auth', R.flag5, mockEngine);
check('Phase 5: auth log marks the flag5 user\'s foreign IP UNEXPLAINED', /UNEXPLAINED/.test(r) && has(r, R.flag5));
r = cfg._handleSiem('auth', 's.patel', mockEngine);
check('Phase 5: auth log marks s.patel EXPLAINED with HR ticket + London provenance',
    /EXPLAINED/.test(r) && /TR-2026-0418/.test(r) && /London|prior.{0,5}session/i.test(r));
check('Phase 5: the old username does not survive anywhere in config.js', !/\be\.morales\b|EMORALES|Elena Morales/i.test(raw));

// ============================================================
// Phase 6: Containment + Remediation (registry flag6 = REMED-OK-<scan id>)
// ============================================================

const scanIdWant = R.flag6.replace(/^REMED-OK-/, '');
check('Registry flag6 has the REMED-OK-<scan id> shape', /^REMED-OK-[A-Z0-9]{6}$/.test(R.flag6));

// Remediation targets the Patient Zero workstation, so both tools stay closed until Flag 5 is accepted.
const wsName = 'WS-DOKAFOR-01';
const preLock = {
    'patch page': cfg._renderPatchDashboard(mockEngine),
    'rapid7 page': cfg._renderInsightVM(mockEngine),
    'patch action': cfg._handlePatchAction({ action: 'apply_patch', cve: 'CVE-2022-30190' }, mockEngine),
    'rapid7 scan': cfg._handleInsightVMScan({ action: 'scan' }, mockEngine)
};
const lockLeaks = Object.keys(preLock).filter(k => has(strip(preLock[k]), wsName) || has(strip(preLock[k]), R.flag5) || !/submit Flag 5/i.test(strip(preLock[k])));
check('Phase 6: patch and Rapid7 tools are locked and name no host before Flag 5', lockLeaks.length === 0, lockLeaks.join(','));
check('Phase 6: a locked patch action applies nothing', cfg._db.patch_state.applied.length === 0);
mockEngine.state.flagsFound.push('flag5');   // Phase 5 done: the server accepted Flag 5

let s0 = mockEngine.state.score;
cfg._handlePatchAction({ action: 'apply_patch', cve: 'CVE-2024-21412' }, mockEngine);
check('Phase 6: wrong CVE apply costs -40', mockEngine.state.score === s0 - 40, `score ${s0} -> ${mockEngine.state.score}`);
r = cfg._handleInsightVMScan({ action: 'run_scan' }, mockEngine);
check('Phase 6: scan with the wrong patch is not clean', cfg._db.rapid7_scan_state.result !== 'clean');
check('Phase 6: a not-clean scan shows no scan id', !has(r, scanIdWant));
s0 = mockEngine.state.score;
cfg._handlePatchAction({ action: 'undo_patch', cve: 'CVE-2024-21412' }, mockEngine);
check('Phase 6: Undo removes the wrong CVE at no cost',
    !cfg._db.patch_state.applied.includes('CVE-2024-21412') && mockEngine.state.score === s0);

r = cfg._handlePatchAction({ action: 'apply_patch', cve: cveId }, mockEngine);
check('Phase 6: correct CVE (registry flag2 CVE) applies', cfg._db.patch_state.applied.includes(cveId));
check('Phase 6: patch success banner does not announce the scan id before the scan', !has(r, scanIdWant));

r = cfg._handleInsightVMScan({ action: 'run_scan' }, mockEngine);
check('Phase 6: scan after the correct patch is CLEAN', cfg._db.rapid7_scan_state.result === 'clean');
check('Phase 6: Rapid7 scan id equals the registry flag6 suffix', cfg._db.rapid7_scan_state.scan_id === scanIdWant);
check('Phase 6: CLEAN scan card shows the scan id', has(r, scanIdWant));

cfg._handlePatchAction({ action: 'apply_patch', cve: 'CVE-2024-21412' }, mockEngine);
cfg._handleInsightVMScan({ action: 'run_scan' }, mockEngine);
check('Phase 6: wrong + correct CVE co-applied makes the scan NOT clean', cfg._db.rapid7_scan_state.result !== 'clean');
cfg._handlePatchAction({ action: 'undo_patch', cve: 'CVE-2024-21412' }, mockEngine);
cfg._handleInsightVMScan({ action: 'run_scan' }, mockEngine);

check('Phase 6: no reveal before the mail filter', cfg._phase6CompleteReveal() === '');
cfg._handleMailFilter({ action: 'add_filter', filter_type: 'source_tld', filter_value: '*.net' }, mockEngine);
check('Phase 6: overly broad TLD filter is REJECTED', !cfg._db.mail_filter_state.active);
cfg._handleMailFilter({ action: 'add_filter', filter_type: 'sender_domain', filter_value: 'nakamura-supplies.com' }, mockEngine);
check('Phase 6: filter on the LEGIT vendor domain is REJECTED', !cfg._db.mail_filter_state.active);
r = cfg._handleMailFilter({ action: 'add_filter', filter_type: 'sender_domain', filter_value: 'crimson-dawn-finance.net' }, mockEngine);
check('Phase 6: filter on the lookalike domain is ACCEPTED', cfg._db.mail_filter_state.active === true);

const reveal = cfg._phase6CompleteReveal();
check('Phase 6: completion reveal shows the registry flag6 (built from the scan id)', has(strip(reveal), R.flag6));
check('Phase 6: completion reveal does NOT print flag7', !has(reveal, R.flag7));
check('Phase 6: mail-filter response carries the reveal', has(strip(r), R.flag6));
const dash = cfg._renderPatchDashboardBody();
check('Phase 6: patch dashboard composite block shows flag6 and not flag7',
    has(strip(dash), R.flag6) && !has(dash, R.flag7));

// ============================================================
// `phase` command: nothing answered before it is earned
// ============================================================

const freshEngine = { config: cfg, state: { flagsFound: [] } };
r = term('phase', '', freshEngine);
const leakedByPhase = IDS.filter(id => has(r, R[id]));
check('phase (no flags yet): output contains no registry value', leakedByPhase.length === 0, leakedByPhase.join(','));
check('phase (no flags yet): output does not name the exploited CVE or the scan id', !has(r, cveId) && !has(r, scanIdWant));
r = term('phase', '', { config: cfg, state: { flagsFound: IDS.slice(0, 6) } });
check('phase (flags 1-6): shows the synthesis command, not the answer', /sha256sum/.test(r) && !has(r, R.flag7));

// ============================================================
// Phase 7: synthesis
// ============================================================

const synth = sha16(IDS.slice(0, 6).map(id => R[id]).join('|'));
check('Phase 7: SHA256(flag1|...|flag6) first 16 hex uppercase equals registry flag7', synth === R.flag7);
const viaBox = cfg._sha256Hex(IDS.slice(0, 6).map(id => R[id]).join('|')).slice(0, 16).toUpperCase();
check('Phase 7: the box\'s own SHA-256 (terminal sha256sum) gives the same value', viaBox === R.flag7);
check('Phase 7: one wrong input changes the hash',
    sha16([R.flag1, 'WRONG', R.flag3, R.flag4, R.flag5, R.flag6].join('|')) !== R.flag7);

// ============================================================
// State reset + score floor + hint labels
// ============================================================

cfg.resetState();
check('resetState() clears Phase 6 + s_client state',
    cfg._db.patch_state.applied.length === 0 && cfg._db.mail_filter_state.active === false &&
    cfg._db.rapid7_scan_state.scan_id === null && cfg._db._sclient_target === null);

const burn = { state: { score: cfg.scoring.base }, addScore(d) { this.state.score = Math.max(cfg.scoring.minScore, this.state.score + d); } };
for (let i = 0; i < 50; i++) burn.addScore(-100);
check('Score floor clamps at 0', burn.state.score === 0);

const want = [1, 3, 4, 2, 4, 3, 4];
check('Hint help levels are 1,3,4,2,4,3,4', cfg.hints.every((h, i) => h.helpLevel === want[i]),
    cfg.hints.map(h => h.helpLevel).join(','));

// ============================================================
// Report (flag ids only, never values)
// ============================================================

const passed = checks.filter(c => c.ok).length;
const failed = checks.filter(c => !c.ok).length;
console.log('PIS-FINAL FUNCTIONAL SMOKE (Patient Zero, Eclipse)\n');
console.log(`  config: ${path.relative(ROOT, configPath)}`);
checks.forEach(c => console.log(`  ${c.ok ? 'PASS' : 'FAIL'} ${c.label}${c.detail ? ' [' + c.detail + ']' : ''}`));
console.log(`\nCheckpoints: ${passed} PASS / ${failed} FAIL`);
if (failed === 0) {
    console.log('\nPASS: lab is completable end to end; the scenario yields all 7 registry values; no answer ships in the client.');
    process.exit(0);
}
console.log('\nFAIL');
process.exit(1);
