#!/usr/bin/env node
'use strict';

/**
 * Functional smoke for PIS-M2 "The Vault Breach" (Midterm Part 2).
 *
 * Walks all 11 command handlers in Node directly (no browser), with stubs
 * for `term` and `engine`. Verifies:
 *   - The full happy path completes (Phase 1 → 2 → 3 → 4)
 *   - All 4 flags fire, each exactly once, by id
 *   - config.js carries NO flag values (BOX-011): the values live only in
 *     functions/box_flags.json / flag_registry, never in client code
 *   - Gating blocks Phase 2/3/4 when prior flags missing
 *   - T1486 gating-bypass fix holds (T1486 does NOT count toward sub-task)
 *   - Tightened path matching rejects substring-style invalid paths
 *
 * Why Node not browser: the command handlers are pure JS that operate on
 * cfg._state. The browser-version of this would walk the same code paths
 * via Terminal.js, with all the same outcomes. Node version is ~5s vs
 * puppeteer's ~30s and is far less brittle.
 */

const fs = require('fs');
const path = require('path');
// PIS_M2_CONFIG overrides the path so the reload cases can be run against an older copy
// (e.g. `git show HEAD:<path> > /tmp/x.js; PIS_M2_CONFIG=/tmp/x.js node <this>`) to prove they fail there.
const configPath = process.env.PIS_M2_CONFIG
    ? path.resolve(process.env.PIS_M2_CONFIG)
    : path.resolve(__dirname, '../../../_app/houses/shield/infosec/labs/pis-m2-vault-breach/config.js');

// Load the config by stubbing the global var
const raw = fs.readFileSync(configPath, 'utf8');
const stub = `${raw}\nmodule.exports = PISM2Config;`;
fs.writeFileSync('/tmp/pism2-stub.js', stub);
delete require.cache['/tmp/pism2-stub.js'];
const cfg = require('/tmp/pism2-stub.js');

// Build a mock engine + term context that the handlers expect.
const awardedFlags = [];
const mockEngine = {
    config: cfg,
    awardFlag(id) {
        // Record the id only. Flags are auto-awarded and carry no value in the client
        // (BOX-011, 2026-10-31): the engine never reads one, so neither does this mock.
        awardedFlags.push({ id });
    }
};

// term.fs is used by openssl handlers to add encrypted/decrypted files into
// the simulated filesystem after each successful op. Mirror the structure.
const mockTerm = {
    fs: cfg.filesystem
};

// Helper: invoke a command by name
function run(cmdName, argsStr = '') {
    const handler = cfg.commands[cmdName];
    if (!handler) return { error: `Unknown command: ${cmdName}` };
    const args = argsStr.trim() === '' ? [] : argsStr.split(/\s+/);
    const output = handler(args, mockTerm, mockEngine);
    return { output };
}

// Checkpoint accumulator
const checks = [];
function check(label, ok, detail = '') {
    checks.push({ label, ok, detail });
}

// ============================================================
// Walk the happy path
// ============================================================

// --- Phase 1 ---
let r = run('malware-classify', 'SPX-7720');
check('Phase 1.1 malware-classify SPX-7720 returns ROOTKIT classification',
    /ROOTKIT/.test(r.output) && cfg._state.phase1.malwareClassified === true,
    /ROOTKIT/.test(r.output) ? '' : r.output.slice(0, 80));

r = run('social-eng-classify', '/home/analyst/phishing-email.eml');
check('Phase 1.2 social-eng-classify returns SPEAR-PHISHING',
    /SPEAR-PHISHING/.test(r.output) && cfg._state.phase1.socialEngClassified === true);

r = run('cve-search', 'sql injection');
check('Phase 1.3 cve-search "sql injection" identifies CWE-89',
    cfg._state.phase1.cveIdentified === 'CWE-89' && /\('SQL Injection'\)/.test(r.output),
    /\('SQL Injection'\)/.test(r.output) ? '' : 'CWE-89 formal name suffix missing');

// Map 3 ATT&CK techniques
run('mitre-lookup', 'T1566');
run('mitre-lookup', 'T1190');
run('mitre-lookup', 'T1078');
check('Phase 1.4 three valid ATT&CK techniques counted',
    cfg._state.phase1.attackTechniques.length === 3 &&
    cfg._state.phase1.attackTechniques.includes('T1566') &&
    cfg._state.phase1.attackTechniques.includes('T1190') &&
    cfg._state.phase1.attackTechniques.includes('T1078'));

// T1486 gating-bypass-fix verification
r = run('mitre-lookup', 'T1486');
check('Phase 1.4 T1486 hits not-found fallback (gating fix)',
    /Technique not found/.test(r.output));
check('Phase 1.4 T1486 does NOT increment attackTechniques count',
    cfg._state.phase1.attackTechniques.length === 3,
    `count after T1486 attempt: ${cfg._state.phase1.attackTechniques.length}`);

// Run `phase` to award Flag 1
r = run('phase');
check('Phase 1 complete — Flag 1 awarded',
    cfg._flag1Awarded === true && awardedFlags.some(f => f.id === 'flag1'));
check('Flag 1 awarded exactly once',
    awardedFlags.filter(f => f.id === 'flag1').length === 1,
    `awarded ${awardedFlags.filter(f => f.id === 'flag1').length} time(s)`);

// --- Phase 2 ---

// Test gating: Phase 2 cmds should refuse before Flag 1... but Flag 1 is
// now awarded, so test gating in a SEPARATE config fresh-load scenario.
// For the happy path, just continue.

r = run('audit-app-code', '/app/intake.py');
check('Phase 2.1 audit-app-code accepts canonical path',
    cfg._state.phase2.sqliVectorFound === true &&
    /CWE-89/.test(r.output));

// Test tightened path-match (N2 fix): substring path should now fail
const savedSqli = cfg._state.phase2.sqliVectorFound;
cfg._state.phase2.sqliVectorFound = false;  // temporary reset for the negative test
r = run('audit-app-code', '/tmp/fake/intake.py.backup');
check('Phase 2.1 audit-app-code REJECTS substring path (N2 fix)',
    !cfg._state.phase2.sqliVectorFound && /not in scope/.test(r.output));
cfg._state.phase2.sqliVectorFound = savedSqli;  // restore

r = run('audit-device', 'ws-04');
check('Phase 2.2 audit-device returns CS-12 9-criteria audit',
    cfg._state.phase2.deviceAudited === true &&
    /0 of 9 criteria/i.test(r.output));

r = run('phase');
check('Phase 2 complete — Flag 2 awarded',
    cfg._flag2Awarded === true && awardedFlags.some(f => f.id === 'flag2'));
check('Flag 2 awarded exactly once',
    awardedFlags.filter(f => f.id === 'flag2').length === 1);

// --- Phase 3 ---
r = run('openssl', 'enc -aes-256-cbc -in /vault/breach-evidence.dat -out /vault/breach-evidence.dat.enc -pass file:/vault/keys/vault-aes-key.bin');
check('Phase 3.1 openssl AES-256 encrypt succeeds',
    cfg._state.phase3.evidenceEncrypted === true &&
    /Encrypting:.*breach-evidence/.test(r.output));

r = run('openssl', 'rsautl -decrypt -inkey /vault/keys/vault-rsa-private.pem -in /vault/intercepted-c2.enc -out /vault/intercepted-c2.dec');
check('Phase 3.2 openssl RSA decrypt succeeds',
    cfg._state.phase3.c2Decrypted === true &&
    /Decryption successful/.test(r.output));

r = run('sha256sum', '-c /vault/manifest-hashes.txt');
check('Phase 3.3 sha256sum -c verifies integrity',
    cfg._state.phase3.integrityVerified === true &&
    /CONFIDENTIALITY breach/i.test(r.output));

r = run('phase');
check('Phase 3 complete — Flag 3 awarded',
    cfg._flag3Awarded === true && awardedFlags.some(f => f.id === 'flag3'));

// --- Phase 4 ---
r = run('file-report');
check('Phase 4 file-report awards Flag 4',
    cfg._flag4Awarded === true && awardedFlags.some(f => f.id === 'flag4') &&
    /INCIDENT RESPONSE REPORT/.test(r.output));

// --- Final tally ---
check('All 4 flags awarded',
    cfg._flag1Awarded && cfg._flag2Awarded && cfg._flag3Awarded && cfg._flag4Awarded);
check('All 4 awarded flag IDs are unique and are the declared ids',
    new Set(awardedFlags.map(f => f.id)).size === 4 &&
    cfg.flags.every(f => awardedFlags.some(a => a.id === f.id)));
check('config.js carries no flag values (BOX-011)',
    cfg.flags.every(f => !('value' in f)),
    cfg.flags.filter(f => 'value' in f).map(f => f.id).join(',') || '');

// ============================================================
// Gating negative tests — fresh config load to reset state
// ============================================================

delete require.cache['/tmp/pism2-stub.js'];
const freshCfg = require('/tmp/pism2-stub.js');
const freshEngine = { config: freshCfg, awardFlag: () => {} };
const freshTerm = { fs: freshCfg.filesystem };

function freshRun(cmd, argsStr = '') {
    const args = argsStr.trim() === '' ? [] : argsStr.split(/\s+/);
    return freshCfg.commands[cmd](args, freshTerm, freshEngine);
}

let blocked;
blocked = freshRun('audit-app-code', '/app/intake.py');
check('GATING: Phase 2 blocked before Flag 1',
    /Phase 2 blocked/.test(blocked));

blocked = freshRun('openssl', 'enc -aes-256-cbc');
check('GATING: Phase 3 blocked before Flag 2',
    /Phase 3 blocked/.test(blocked));

blocked = freshRun('file-report');
check('GATING: file-report blocked before Flag 1',
    /Flag 1 .Triage. not yet earned/.test(blocked));

// Also test that file-report blocks with Flag 1 but not 2/3
freshCfg._flag1Awarded = true;
blocked = freshRun('file-report');
check('GATING: file-report blocks at Flag 2 stage when only Flag 1 done',
    /Flag 2 .Investigation. not yet earned/.test(blocked));

freshCfg._flag2Awarded = true;
blocked = freshRun('file-report');
check('GATING: file-report blocks at Flag 3 stage when only Flags 1+2 done',
    /Flag 3 .Cryptographic Containment. not yet earned/.test(blocked));

// ============================================================
// Reload cases (2026-11-02). QC: earn Flag 1, reload, and `audit-app-code` answered
// "Phase 2 blocked" while Flag 1 showed earned. BoxEngine persists engine.state, not the
// config object, so these cases drive an engine that behaves like BoxEngine's own
// load() / save() / awardFlag() (BoxEngine.js load ~:478, save ~:490, awardFlag ~:1907):
// state is JSON in a fake localStorage, and a "reload" is a FRESH evaluation of config.js
// plus a fresh engine that loads that JSON back.
// ============================================================

function loadFreshConfig() {
    delete require.cache['/tmp/pism2-stub.js'];
    return require('/tmp/pism2-stub.js');
}

function bootEngine(storage) {
    const c = loadFreshConfig();
    const defaults = () => ({ score: 1000, flagsFound: [], hintsUsed: [], events: [], booted: true });
    const eng = {
        config: c,
        state: storage.data ? { ...defaults(), ...JSON.parse(storage.data) } : defaults(),
        awarded: [],
        save() { storage.data = JSON.stringify(this.state); },
        awardFlag(id) {
            if (this.state.flagsFound.includes(id)) return;
            this.state.flagsFound.push(id);
            this.awarded.push(id);
            this.save();
        }
    };
    const t = { fs: c.filesystem };
    const exec = (cmd, argsStr = '') => c.commands[cmd](argsStr.trim() === '' ? [] : argsStr.split(/\s+/), t, eng);
    return { c, eng, exec };
}

function earnPhase1(exec) {
    exec('malware-classify', 'SPX-7720');
    exec('social-eng-classify', '/home/analyst/phishing-email.eml');
    exec('cve-search', 'sql injection');
    exec('mitre-lookup', 'T1566');
    exec('mitre-lookup', 'T1190');
    exec('mitre-lookup', 'T1078');
    return exec('phase');
}

// R1: earn Flag 1, reload, Phase 2 must open.
{
    const storage = { data: null };
    let b = bootEngine(storage);
    earnPhase1(b.exec);
    check('RELOAD setup: Flag 1 earned before the reload',
        b.eng.state.flagsFound.includes('flag1'));
    b = bootEngine(storage);                       // reload
    const out = b.exec('audit-app-code', '/app/intake.py');
    check('RELOAD: Phase 2 command is NOT blocked after Flag 1 + reload',
        !/Phase 2 blocked/.test(out) && /CWE-89/.test(out),
        out.split('\n')[0]);
    const ph = b.exec('phase');
    check('RELOAD: Phase 1 sub-tasks still show done after reload (progress persisted)',
        /Phase 1 .. Triage & Attribution: COMPLETE/.test(ph) && /ATT&CK techniques mapped: 3 \/ 3/.test(ph),
        (ph.match(/Phase 1[^\n]*/) || [''])[0]);
    check('RELOAD: Flag 1 is not awarded a second time after reload',
        b.eng.awarded.filter(id => id === 'flag1').length === 0);

    // Keep reloading at every phase boundary; the lab must still finish.
    b.exec('audit-device', 'ws-04');
    b = bootEngine(storage);                       // reload mid-Phase 2 (both sub-tasks done, no phase run yet)
    b.exec('phase');
    check('RELOAD: Phase 2 sub-progress survives a reload and Flag 2 fires',
        b.eng.state.flagsFound.includes('flag2'));
    b = bootEngine(storage);
    const enc = b.exec('openssl', 'enc -aes-256-cbc -pbkdf2 -in /vault/breach-evidence.dat -out /vault/breach-evidence.dat.enc -pass file:/vault/keys/vault-aes-key.bin');
    check('RELOAD: Phase 3 command is NOT blocked after Flag 2 + reload',
        !/Phase 3 blocked/.test(enc), enc.split('\n')[0]);
    b.exec('openssl', 'rsautl -decrypt -inkey /vault/keys/vault-rsa-private.pem -in /vault/intercepted-c2.enc -out /vault/intercepted-c2.dec');
    b.exec('sha256sum', '-c /vault/manifest-hashes.txt');
    b.exec('phase');
    b = bootEngine(storage);
    const rep = b.exec('file-report');
    check('RELOAD: file-report runs after Flags 1-3 + reload and awards Flag 4',
        /INCIDENT RESPONSE REPORT/.test(rep) && b.eng.state.flagsFound.includes('flag4'),
        rep.split('\n')[0]);
    check('RELOAD: all 4 flags held once each after a run with four reloads',
        ['flag1', 'flag2', 'flag3', 'flag4'].every(f => b.eng.state.flagsFound.filter(x => x === f).length === 1));
}

// R2: partial Phase 1 progress survives a reload (one sub-task, reload, finish the rest).
{
    const storage = { data: null };
    let b = bootEngine(storage);
    b.exec('malware-classify', 'SPX-7720');
    b = bootEngine(storage);
    b.exec('social-eng-classify', '/home/analyst/phishing-email.eml');
    b.exec('cve-search', 'sql injection');
    b.exec('mitre-lookup', 'T1566');
    b.exec('mitre-lookup', 'T1190');
    b.exec('mitre-lookup', 'T1078');
    b.exec('phase');
    check('RELOAD: a Phase 1 sub-task done before a reload still counts (Flag 1 fires)',
        b.eng.state.flagsFound.includes('flag1'));
}

// R3: a save written before the reload fix (flags earned, no _pisProgress) opens Phase 2.
{
    const storage = { data: JSON.stringify({ flagsFound: ['flag1'], score: 1250, booted: true }) };
    const b = bootEngine(storage);
    const out = b.exec('audit-app-code', '/app/intake.py');
    check('RELOAD (pre-fix save): Flag 1 earned with no saved progress, Phase 2 is open',
        !/Phase 2 blocked/.test(out), out.split('\n')[0]);
}

// N1-N3: the gate itself must still hold.
{
    const fresh = bootEngine({ data: null });
    const out = fresh.exec('audit-app-code', '/app/intake.py');
    check('NEGATIVE: fresh state, Phase 2 still blocked',
        /Phase 2 blocked/.test(out) && !fresh.c._state.phase2.sqliVectorFound);

    const storage = { data: null };
    let b = bootEngine(storage);
    b.exec('malware-classify', 'SPX-7720');
    b.exec('social-eng-classify', '/home/analyst/phishing-email.eml');
    b = bootEngine(storage);                       // reload with Phase 1 only partly done
    const out2 = b.exec('audit-app-code', '/app/intake.py');
    check('NEGATIVE: Phase 1 partly done + reload, Phase 2 still blocked',
        /Phase 2 blocked/.test(out2));
    const out3 = b.exec('openssl', 'enc -aes-256-cbc');
    check('NEGATIVE: Phase 1 partly done + reload, Phase 3 still blocked',
        /Phase 3 blocked/.test(out3));
    const storage4 = { data: JSON.stringify({ flagsFound: ['flag1'], booted: true }) };
    const b4 = bootEngine(storage4);
    check('NEGATIVE: Flag 1 only (pre-fix save), file-report still blocked at Flag 2',
        /Flag 2 .Investigation. not yet earned/.test(b4.exec('file-report')));
}

// ============================================================
// Report
// ============================================================

const passed = checks.filter(c => c.ok).length;
const failed = checks.filter(c => !c.ok).length;
console.log('────── PIS-M2 FUNCTIONAL SMOKE ──────\n');
checks.forEach(c => console.log(`  ${c.ok ? '✓' : '✗'} ${c.label}${c.detail ? ' — ' + c.detail : ''}`));
console.log(`\nCheckpoints: ${passed} PASS / ${failed} FAIL`);

if (failed === 0) {
    console.log('\n✓ PASS — lab is fully completable end-to-end.');
    console.log(`  Awarded flags: ${awardedFlags.map(f => f.id).join(', ')}`);
    process.exit(0);
} else {
    console.log('\n✗ FAIL');
    process.exit(1);
}
