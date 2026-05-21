#!/usr/bin/env node
'use strict';

/**
 * Functional smoke for PIS-M2 "The Vault Breach" (Midterm Part 2).
 *
 * Walks all 11 command handlers in Node directly (no browser), with stubs
 * for `term` and `engine`. Verifies:
 *   - The full happy path completes (Phase 1 → 2 → 3 → 4)
 *   - All 4 flags fire with the declared values
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
const configPath = path.resolve(__dirname, '../../../_app/houses/shield/infosec/labs/pis-m2-vault-breach/config.js');

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
        // Look up the flag value from the config so we capture exactly what
        // the lab declares — same data the student would see.
        const flag = cfg.flags.find(f => f.id === id);
        awardedFlags.push({ id, value: flag ? flag.value : null });
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
check('Flag 1 value matches declared',
    awardedFlags.find(f => f.id === 'flag1')?.value === cfg.flags[0].value,
    awardedFlags.find(f => f.id === 'flag1')?.value || '(no flag awarded)');

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
check('Flag 2 value matches declared',
    awardedFlags.find(f => f.id === 'flag2')?.value === cfg.flags[1].value);

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
check('All 4 awarded flag VALUES are unique',
    new Set(awardedFlags.map(f => f.value)).size === 4);
check('All 4 awarded flag VALUES match config.flags exactly',
    cfg.flags.every(f => awardedFlags.some(a => a.id === f.id && a.value === f.value)));

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
// Report
// ============================================================

const passed = checks.filter(c => c.ok).length;
const failed = checks.filter(c => !c.ok).length;
console.log('────── PIS-M2 FUNCTIONAL SMOKE ──────\n');
checks.forEach(c => console.log(`  ${c.ok ? '✓' : '✗'} ${c.label}${c.detail ? ' — ' + c.detail : ''}`));
console.log(`\nCheckpoints: ${passed} PASS / ${failed} FAIL`);

if (failed === 0) {
    console.log('\n✓ PASS — lab is fully completable end-to-end.');
    console.log(`  Awarded flag values:`);
    awardedFlags.forEach(f => console.log(`    ${f.id}: ${f.value}`));
    process.exit(0);
} else {
    console.log('\n✗ FAIL');
    process.exit(1);
}
