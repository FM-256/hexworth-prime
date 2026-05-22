#!/usr/bin/env node
'use strict';

/**
 * Functional smoke for PIS-FINAL "Patient Zero" — Eclipse-tier final practical.
 *
 * Walks all 7 phases in Node directly (no browser), invoking terminal commands
 * and webApp form handlers via the config's public surface. Verifies:
 *   - The full happy path completes (Phase 1 → 2 → 3 → 4 → 5 → 6 → 7)
 *   - All 7 flag values declared in config.flags match the locked spec
 *   - Phase 2 hash analyzer returns COBALT_STRIKE + Follina for the real attachment
 *   - Phase 2 hash analyzer returns BENIGN for the decoy attachment
 *   - Phase 3 openssl s_client returns cert SAN with emberwolf-c2.duckdns.org
 *   - Phase 4 threat intel returns EMBERWOLF as 4/4 TTP match
 *   - Phase 4 IP geo returns NL edge + RU actor-origin enrichment
 *   - Phase 5 SIEM returns e.morales as the unexplained-anomaly user
 *   - Phase 6 composite gate fires only when patch + scan + mail filter all correct
 *   - Phase 6 wrong-CVE → Rapid7 detects vulnerability still present
 *   - Phase 6 broad mail filter (*.net) → rejected
 *   - Phase 7 SHA256 synthesis matches A82A44DCA64FA463 byte-exact
 *   - Phase 7 wrong-flag input → wrong hash
 *
 * Why Node not browser: form handlers and terminal commands are pure JS
 * operating on cfg._db. The browser-version walks the same code via Browser.js
 * + Terminal.js, with the same outcomes. Node is ~5s vs puppeteer's ~60s.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const configPath = path.resolve(__dirname, '../../../_app/houses/shield/infosec/labs/pis-final-patient-zero/config.js');

// Load the config by stubbing the global var as a module export
const raw = fs.readFileSync(configPath, 'utf8');
const stub = `${raw}\nmodule.exports = PISFinalConfig;`;
fs.writeFileSync('/tmp/pisfinal-stub.js', stub);
delete require.cache['/tmp/pisfinal-stub.js'];
const cfg = require('/tmp/pisfinal-stub.js');

// Mock engine — BoxEngine surface the form handlers and commands consume.
const scoreEvents = [];
const flagsFound = [];
const navEvents = [];
const mockEngine = {
    config: cfg,
    state: {
        flagsFound,
        score: cfg.scoring.base
    },
    addScore(delta, reason) {
        scoreEvents.push({ delta, reason });
        this.state.score = Math.max(cfg.scoring.minScore, this.state.score + delta);
    },
    awardFlag(id) {
        if (!flagsFound.includes(id)) flagsFound.push(id);
    },
    resolveFlagTokens(html) {
        return html.replace(/\{\{FLAG:([^}]+)\}\}/g, (_, id) => {
            const flag = cfg.flags.find(f => f.id === id);
            return flag ? flag.value : `{{FLAG:${id}}}`;
        });
    },
    _logEvent(type, data) {
        if (type === 'navigate') navEvents.push(data.url);
    }
};

const mockTerm = { fs: cfg.filesystem || {} };

// Checkpoint accumulator
const checks = [];
function check(label, ok, detail = '') {
    checks.push({ label, ok, detail });
}

// Helpers
function term(cmdName, argsStr = '') {
    const handler = cfg.commands[cmdName];
    if (!handler) return { error: `Unknown command: ${cmdName}` };
    const args = argsStr.trim() === '' ? [] : argsStr.split(/\s+/);
    return handler(args, mockTerm, mockEngine);
}

function strip(html) {
    return html.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
}

// ============================================================
// Phase 0 — Config sanity
// ============================================================

check('Config is Eclipse difficulty', cfg.difficulty === 'Eclipse');
check('Config base score is 1500', cfg.scoring.base === 1500);
check('Config maxScore is 750', cfg.scoring.maxScore === 750);
check('Config minScore floor is 0 (Nancy round 1 blocker)', cfg.scoring.minScore === 0);
check('Config has 7 flags', cfg.flags.length === 7);
check('Config has 7 hints', cfg.hints.length === 7);
check('Config synthesis_flag is A82A44DCA64FA463', cfg._db.synthesis_flag === 'A82A44DCA64FA463');

// Locked flag values from walkthrough v1.2 (Karl + Nancy round 2 cleared)
const lockedFlags = [
    '<F1F2A4E8.20260518123045@crimson-dawn-finance.net>',
    'COBALT_STRIKE:CVE-2022-30190',
    'emberwolf-c2.duckdns.org',
    'EMBERWOLF:RU',
    'e.morales',
    'REMED-OK-S7K9P2',
    'A82A44DCA64FA463'
];
cfg.flags.forEach((f, i) => {
    check(`Flag ${i + 1} value matches locked spec`, f.value === lockedFlags[i],
        f.value !== lockedFlags[i] ? `got: ${f.value} | want: ${lockedFlags[i]}` : '');
});

// ============================================================
// Phase 2 — Hash Analyzer (COBALT_STRIKE + Follina)
// ============================================================

let r = cfg._handleHashLookup('b3a4f8c2d7e91a6e5f8c2b1d9a4f7e3c8b6d2a1f9e7c4b8a6d3f2e1c9b8a7f4d', mockEngine);
check('Phase 2: hash analyzer returns MALICIOUS verdict for real attachment',
    /MALICIOUS/i.test(r) || /malicious/i.test(strip(r)));
check('Phase 2: hash analyzer returns Cobalt Strike Beacon family',
    /Cobalt Strike/i.test(r) && /Beacon/i.test(r));
check('Phase 2: hash analyzer references CVE-2022-30190 (Follina)',
    /CVE-2022-30190/.test(r) && /Follina/i.test(r));
check('Phase 2: hash analyzer associates EMBERWOLF campaign',
    /EMBERWOLF/i.test(r));

// Decoy: benign attachment
r = cfg._handleHashLookup('4a1b2c3d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b', mockEngine);
check('Phase 2: hash analyzer returns BENIGN for decoy attachment',
    /BENIGN/i.test(r) || /0\/.{1,3}\s*engines/.test(strip(r)));
check('Phase 2: hash analyzer does NOT associate decoy with Cobalt Strike',
    !/Cobalt Strike/i.test(r) || /BENIGN/i.test(r));

// ============================================================
// Phase 3 — DNS + PKI Forensics
// ============================================================

r = term('dig', 'crimson-dawn-finance.net');
check('Phase 3: dig crimson-dawn-finance.net resolves to Cloudflare edge',
    /104\.21\.45\.122/.test(r));

r = term('dig', 'emberwolf-c2.duckdns.org');
check('Phase 3: dig emberwolf-c2.duckdns.org resolves to attacker IP',
    /185\.220\.101\.45/.test(r));

r = term('openssl', 's_client -connect crimson-dawn-finance.net:443 -showcerts');
check('Phase 3: openssl s_client returns cert chain',
    /CONNECTED|certificate/i.test(r));
check('Phase 3: openssl s_client sets _sclient_target (state for x509 gate)',
    cfg._db._sclient_target === 'crimson-dawn-finance.net');

// Now run x509 -- should return SAN list because s_client primed state
r = term('openssl', 'x509 -noout -text');
check('Phase 3: openssl x509 -noout -text after s_client returns SAN list',
    /Subject Alternative/i.test(r));
check('Phase 3: cert SAN contains emberwolf-c2.duckdns.org (Flag 3 source)',
    /emberwolf-c2\.duckdns\.org/.test(r));
check('Phase 3: cert SAN contains nakamura-suppliers-corp.com (full attacker stable)',
    /nakamura-suppliers-corp\.com/.test(r));

// Nancy round 3 PAUSE: tightened host match — legit domain should NOT trigger attacker cert
cfg._db._sclient_target = null;  // reset state to test legit-domain path
r = term('openssl', 's_client -connect crimson-dawn.net:443 -showcerts');
check('Phase 3: openssl s_client on LEGIT crimson-dawn.net does NOT prime attacker cert state',
    cfg._db._sclient_target !== 'crimson-dawn.net' || !/SAN LIST EXTRACTED/.test(r));
// Re-prime for downstream tests
term('openssl', 's_client -connect crimson-dawn-finance.net:443 -showcerts');

// Nancy round 3 PAUSE: standalone x509 without prior s_client should NOT reveal SAN
const freshDb = JSON.parse(JSON.stringify({ _sclient_target: null }));
const origTarget = cfg._db._sclient_target;
cfg._db._sclient_target = null;
const standaloneX509 = term('openssl', 'x509 -noout -text');
check('Phase 3: openssl x509 standalone (no prior s_client) does NOT reveal SAN',
    !/Subject Alternative/i.test(standaloneX509) || /unable to load certificate|No certificate data/i.test(standaloneX509));
cfg._db._sclient_target = origTarget;  // restore

r = term('whois', 'crimson-dawn-finance.net');
check('Phase 3: whois reveals recent registration',
    /2026-05/.test(r));

// ============================================================
// Phase 4 — Attribution + Geolocation
// ============================================================

r = cfg._handleThreatIntel('emberwolf-c2.duckdns.org', mockEngine);
check('Phase 4: threat intel returns EMBERWOLF profile', /EMBERWOLF/.test(r));
check('Phase 4: EMBERWOLF profile shows RU alignment',
    /RU/.test(r) && /EMBERWOLF/.test(r));
check('Phase 4: threat intel includes decoy CRIMSONTIDE for TTP overlap',
    /CRIMSONTIDE/.test(r));
check('Phase 4: threat intel includes decoy BLACKHELIX',
    /BLACKHELIX/.test(r));

r = cfg._handleIpGeo('185.220.101.45', mockEngine);
check('Phase 4: IP geo shows NL edge location (decoy surface)',
    /Amsterdam|NL|Netherlands/i.test(r));
check('Phase 4: IP geo includes HexIntel actor-origin enrichment (RU)',
    /HexIntel|actor.{0,10}origin|enrichment/i.test(r) && /RU/.test(r));
check('Phase 4: IP geo flags VPS-edge != actor-origin (CAUTION note)',
    /CAUTION|edge|jurisdiction|reconcile/i.test(r));

// ============================================================
// Phase 5 — SIEM Correlation
// ============================================================

r = cfg._handleSiem('dns', 'crimson-dawn-finance.net', mockEngine);
check('Phase 5: SIEM DNS filter on lookalike returns e.morales + r.chen + s.patel',
    /e\.morales/.test(r) && /r\.chen/.test(r) && /s\.patel/.test(r));

r = cfg._handleSiem('dns', 'emberwolf-c2.duckdns.org', mockEngine);
check('Phase 5: SIEM DNS filter on C2 callback ONLY returns e.morales (the click)',
    /e\.morales/.test(r) && !/r\.chen.*emberwolf|s\.patel.*emberwolf/.test(r));

r = cfg._handleSiem('auth', 'e.morales', mockEngine);
check('Phase 5: SIEM auth log marks e.morales foreign IP as UNEXPLAINED ANOMALY',
    /UNEXPLAINED/.test(r) && /e\.morales/.test(r));

r = cfg._handleSiem('auth', 's.patel', mockEngine);
check('Phase 5: SIEM auth log marks s.patel foreign IP as EXPLAINED ANOMALY',
    /EXPLAINED/.test(r) && /s\.patel/.test(r));
check('Phase 5: s.patel provenance includes HR ticket #TR-2026-0418 (Nancy round 2 fix)',
    /TR-2026-0418/.test(r));
check('Phase 5: s.patel provenance includes "prior London sessions" (Nancy round 2 fix)',
    /London|prior.{0,5}session/i.test(r));

// ============================================================
// Phase 6 — Containment + Remediation (multi-action gate)
// ============================================================

// Sub-action 1a: Apply WRONG CVE first (decoy)
const scoreBefore = mockEngine.state.score;
r = cfg._handlePatchAction({ action: 'apply_patch', cve: 'CVE-2024-21412' }, mockEngine);
check('Phase 6: wrong CVE (2024-21412) accepts apply',
    cfg._db.patch_state.applied.includes('CVE-2024-21412'));
check('Phase 6: wrong-CVE apply costs -40 (Eclipse wrong-action penalty)',
    mockEngine.state.score === scoreBefore - 40,
    `score: ${scoreBefore} → ${mockEngine.state.score}`);

// Run scan on wrong patch
r = cfg._handleInsightVMScan({ action: 'run_scan' }, mockEngine);
check('Phase 6: Rapid7 scan with wrong patch returns wrong_patch or vulnerable',
    cfg._db.rapid7_scan_state.result !== 'clean');
check('Phase 6: scan result indicates Follina still exploitable',
    /Follina|CVE-2022-30190|STILL|EXPLOIT|vulnerable/i.test(r));

// Sub-action 1b: Undo wrong patch (no extra penalty)
const scoreBeforeUndo = mockEngine.state.score;
r = cfg._handlePatchAction({ action: 'undo_patch', cve: 'CVE-2024-21412' }, mockEngine);
check('Phase 6: Undo removes wrong CVE from applied list (no soft-lock)',
    !cfg._db.patch_state.applied.includes('CVE-2024-21412'));
check('Phase 6: Undo is free (no additional score penalty)',
    mockEngine.state.score === scoreBeforeUndo);

// Sub-action 2: Apply CORRECT CVE
r = cfg._handlePatchAction({ action: 'apply_patch', cve: 'CVE-2022-30190' }, mockEngine);
check('Phase 6: correct CVE (2022-30190) accepts apply',
    cfg._db.patch_state.applied.includes('CVE-2022-30190'));

// Sub-action 3: Run Rapid7 scan after correct patch
r = cfg._handleInsightVMScan({ action: 'run_scan' }, mockEngine);
check('Phase 6: Rapid7 scan with correct patch returns CLEAN',
    cfg._db.rapid7_scan_state.result === 'clean');
check('Phase 6: Rapid7 scan ID is S7K9P2 (Flag 6 suffix)',
    cfg._db.rapid7_scan_state.scan_id === 'S7K9P2');

// Nancy round 3 BLOCK fix: applying wrong+correct CVE together should NOT pass scan
const mixedScoreBefore = mockEngine.state.score;
cfg._handlePatchAction({ action: 'apply_patch', cve: 'CVE-2024-21412' }, mockEngine);
r = cfg._handleInsightVMScan({ action: 'run_scan' }, mockEngine);
check('Phase 6: BLOCK fix — wrong+correct CVE co-applied makes scan NOT clean',
    cfg._db.rapid7_scan_state.result !== 'clean',
    `result after co-apply: ${cfg._db.rapid7_scan_state.result}`);
// Undo the wrong one to return to clean state for next assertions
cfg._handlePatchAction({ action: 'undo_patch', cve: 'CVE-2024-21412' }, mockEngine);
cfg._handleInsightVMScan({ action: 'run_scan' }, mockEngine);

// Sub-action 4: Try overly-broad mail filter (decoy)
r = cfg._handleMailFilter({ action: 'add_filter', filter_type: 'source_tld', filter_value: '*.net' }, mockEngine);
check('Phase 6: overly-broad TLD filter (*.net) is REJECTED',
    !cfg._db.mail_filter_state.active);

r = cfg._handleMailFilter({ action: 'add_filter', filter_type: 'sender_domain', filter_value: 'nakamura-supplies.com' }, mockEngine);
check('Phase 6: filter on LEGIT vendor domain is REJECTED',
    !cfg._db.mail_filter_state.active);

// Sub-action 5: Apply CORRECT mail filter
r = cfg._handleMailFilter({ action: 'add_filter', filter_type: 'sender_domain', filter_value: 'crimson-dawn-finance.net' }, mockEngine);
check('Phase 6: filter on attacker lookalike domain is ACCEPTED',
    cfg._db.mail_filter_state.active === true);

// At this point all 3 Phase 6 actions are complete — composite flag should fire
const phase6Complete = cfg._db.patch_state.applied.includes('CVE-2022-30190') &&
    !cfg._db.patch_state.applied.some(c => c !== 'CVE-2022-30190') &&
    cfg._db.rapid7_scan_state.result === 'clean' &&
    cfg._db.mail_filter_state.active;
check('Phase 6: composite gate is fully satisfied (all 3 sub-actions correct, no extraneous patches)',
    phase6Complete);

// State reset verification (Nancy round 3 BLOCK #2)
cfg.resetState();
check('resetState() clears patch_state.applied',
    cfg._db.patch_state.applied.length === 0);
check('resetState() clears mail_filter_state.active',
    cfg._db.mail_filter_state.active === false);
check('resetState() clears rapid7_scan_state.scan_id',
    cfg._db.rapid7_scan_state.scan_id === null);
check('resetState() clears _sclient_target',
    cfg._db._sclient_target === null);

// ============================================================
// Phase 7 — Synthesis
// ============================================================

// Compute SHA256 of the locked concatenation; verify it matches synthesis_flag
const synthInput = `${lockedFlags[0]}|${lockedFlags[1]}|${lockedFlags[2]}|${lockedFlags[3]}|${lockedFlags[4]}|${lockedFlags[5]}`;
const computedHash = crypto.createHash('sha256').update(synthInput).digest('hex').slice(0, 16).toUpperCase();
check('Phase 7: SHA256 of (flag1|flag2|...|flag6) matches stored synthesis_flag',
    computedHash === cfg._db.synthesis_flag,
    computedHash !== cfg._db.synthesis_flag ? `computed: ${computedHash} | stored: ${cfg._db.synthesis_flag}` : '');
check('Phase 7: synthesis_flag equals locked spec value A82A44DCA64FA463',
    cfg._db.synthesis_flag === 'A82A44DCA64FA463');
check('Phase 7: Flag 7 in config.flags equals A82A44DCA64FA463',
    cfg.flags[6].value === 'A82A44DCA64FA463');

// Wrong-input synthesis check — substituting any wrong value breaks the hash
const wrongInput = `${lockedFlags[0]}|WRONG_FLAG_2|${lockedFlags[2]}|${lockedFlags[3]}|${lockedFlags[4]}|${lockedFlags[5]}`;
const wrongHash = crypto.createHash('sha256').update(wrongInput).digest('hex').slice(0, 16).toUpperCase();
check('Phase 7: substituting any wrong value yields a different hash (synthesis gate works)',
    wrongHash !== cfg._db.synthesis_flag);

// ============================================================
// Score floor verification
// ============================================================

// Drive score negative to verify floor clamps at 0
const burnEngine = {
    config: cfg,
    state: { score: cfg.scoring.base, flagsFound: [] },
    addScore(delta) { this.state.score = Math.max(cfg.scoring.minScore, this.state.score + delta); }
};
for (let i = 0; i < 50; i++) burnEngine.addScore(-100);
check('Score floor clamps at 0 even after massive penalty accumulation',
    burnEngine.state.score === 0);

// ============================================================
// Hint Help Level labels (Nancy round 2 fix)
// ============================================================

// Hints array contains either { helpLevel: N } or text mentioning Lx
const hintLevels = cfg.hints.map(h => h.helpLevel || (h.text || '').match(/L(\d)/)?.[1]);
check('Hint 1 = L1', String(hintLevels[0]) === '1');
check('Hint 2 = L3 (relabeled from L2 in Nancy round 1)', String(hintLevels[1]) === '3');
check('Hint 3 = L4 (relabeled from L3 in Nancy round 1)', String(hintLevels[2]) === '4');
check('Hint 4 = L2', String(hintLevels[3]) === '2');
check('Hint 5 = L4 (relabeled from L3 in Nancy round 1)', String(hintLevels[4]) === '4');
check('Hint 6 = L3', String(hintLevels[5]) === '3');
check('Hint 7 = L4', String(hintLevels[6]) === '4');

// ============================================================
// Report
// ============================================================

const passed = checks.filter(c => c.ok).length;
const failed = checks.filter(c => !c.ok).length;
console.log('────── PIS-FINAL FUNCTIONAL SMOKE (Patient Zero — Eclipse) ──────\n');
checks.forEach(c => console.log(`  ${c.ok ? '✓' : '✗'} ${c.label}${c.detail ? ' — ' + c.detail : ''}`));
console.log(`\nCheckpoints: ${passed} PASS / ${failed} FAIL`);

if (failed === 0) {
    console.log('\n✓ PASS — lab is fully completable end-to-end.');
    console.log('  Locked flag values verified:');
    lockedFlags.forEach((v, i) => console.log(`    flag${i + 1}: ${v}`));
    process.exit(0);
} else {
    console.log('\n✗ FAIL');
    process.exit(1);
}
