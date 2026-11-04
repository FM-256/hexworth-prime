#!/usr/bin/env node
/**
 * mdfinal-derive.test.js — R1 keyed derivation for the MD-100 final.
 *
 * @catalog what    Secret fail-closed, input separation, unbiased picks, and the v1-attacker
 * @catalog what    independence test (recover the visible stream, predict hidden picks) over 10,000 uids.
 * @catalog run     node _tools/mdfinal/mdfinal-derive.test.js
 * @catalog status  TOOL
 *
 * THE INDEPENDENCE TEST MODELS THE REAL ATTACK, NOT A PROXY. The attacker is handed the visible
 * stream's seed directly (the strongest version of Mallory's 60-second brute force) and predicts
 * each hidden pick as the stream's next value. If hidden picks came from that stream, the
 * prediction rate would be 100%; the bar is that it sits inside the binomial 99.9% interval of
 * chance (spec 13.2 item 3). Section 4 proves the test can fail by predicting from a stream the
 * picks DO come from.
 */
const kit = require('./mdfinal-test-kit.js');
const D = kit.req('mdfinal-derive.js');
const CORE = kit.req('mdfinal-core.js');
const t = kit.harness('mdfinal-derive');

/* ── 1. secret strength fails closed ── */
const refused = (s) => { try { D.deriveKey(s); return false; } catch (e) { return e.code === 'failed-precondition' && e.message === 'Exam seed secret is not configured.'; } };
t.check(refused(undefined), 'missing secret refused');
t.check(refused(''), 'empty secret refused');
t.check(refused(123456789012345678901234567890123), 'non-string refused');
t.check(refused('a'.repeat(31) + 'b'), '32 chars, 2 distinct refused');
t.check(refused('abcdef0123'), 'short refused');
t.check(refused('   ' + 'abcdefgh'.repeat(3) + '   '), '24 chars after trim refused');
t.check(refused('netfinal-dev-seed-not-for-exams'), 'netfinal placeholder refused');
t.check(refused('x'.repeat(10) + 'dev_seed' + 'abcdefghijklmnop'), 'DEV_SEED family refused');
t.check(refused('abcdefg' + 'abcdefg'.repeat(4)), '7 distinct refused');
t.check(!refused('abcdefgh' + 'abcdefgh'.repeat(3)), 'exactly 8 distinct, 32 chars accepted');
t.check(!refused(kit.TEST_SECRET), 'test secret accepted');
t.check(D.deriveKey(kit.TEST_SECRET + '\n').equals(D.deriveKey(kit.TEST_SECRET)), 'trailing newline trimmed consistently');
/* 1,000 random 32-char hex secrets (crypto) all pass: a randomly generated hex secret never trips the variety check */
const crypto = require('crypto');
let hexFail = 0;
for (let i = 0; i < 1000; i++) { if (refused(crypto.randomBytes(16).toString('hex'))) { hexFail++; } }
t.check(hexFail === 0, '1,000 random 32-hex secrets accepted (refused ' + hexFail + ')');
/* the engine path fails closed too */
let genRefused = false;
try { CORE.generate('u', 'md100-final-2026', {}); } catch (e) { genRefused = e.code === 'failed-precondition'; }
t.check(genRefused, 'generate() without a secret fails closed');
let keyRefused = false;
try { CORE.buildAnswerKey('u', 'md100-final-2026', { secret: 'netfinal-dev-seed-not-for-exams' }); } catch (e) { keyRefused = e.code === 'failed-precondition'; }
t.check(keyRefused, 'buildAnswerKey() with the placeholder fails closed');

/* boundary: 31 high-variety characters refused, 32 accepted (Mallory D1 len31 mutant) */
t.check(refused('Zq7#mP2v!Lx9@Rt4$Wn6%Ys8^Ku3&Hc'), '31 high-variety characters refused');
t.check(!refused('Zq7#mP2v!Lx9@Rt4$Wn6%Ys8^Ku3&Hc5'), '32 high-variety characters accepted');
/* no fallback to the environment (13.2 item 3) */
{
    const keep = {};
    for (const v of ['MDFINAL_SEED_SECRET', 'NETFINAL_SEED_SECRET', 'DEV_SEED_SECRET', 'SEED_SECRET']) { keep[v] = process.env[v]; process.env[v] = kit.ALT_SECRET; }
    t.check(refused(undefined) && refused(null) && refused(''), 'environment secrets never used as a fallback');
    let g = false; try { CORE.generate('u', 'md100-final-2026', {}); } catch (e) { g = true; }
    t.check(g, 'generate() ignores environment secrets');
    for (const v in keep) { if (keep[v] === undefined) delete process.env[v]; else process.env[v] = keep[v]; }
}
/* the secret and K never reach output, logs or the error object */
{
    const cap = [];
    const orig = { log: console.log, error: console.error, warn: console.warn, info: console.info, debug: console.debug,
        out: process.stdout.write, err: process.stderr.write };
    const grab = (...a) => { cap.push(a.map(String).join(' ')); return true; };
    console.log = console.error = console.warn = console.info = console.debug = grab;
    process.stdout.write = process.stderr.write = grab;
    let errs = [];
    try {
        D.deriveKey(kit.TEST_SECRET); CORE.generate('u', 'md100-final-2026', { secret: kit.TEST_SECRET });
        CORE.buildAnswerKey('u', 'md100-final-2026', { secret: kit.TEST_SECRET });
        for (const bad of ['short-secret-abcdefgh', 'Zq7#mP2v!Lx9@Rt4$Wn6%Ys8^Ku3&Hc', 'netfinal-dev-seed-not-for-exams']) {
            try { D.deriveKey(bad); } catch (e) { errs.push([bad, e]); }
        }
    } finally {
        Object.assign(console, { log: orig.log, error: orig.error, warn: orig.warn, info: orig.info, debug: orig.debug });
        process.stdout.write = orig.out; process.stderr.write = orig.err;
    }
    t.check(cap.length === 0, 'derivation and generation write nothing to the console (' + cap.length + ' writes)');
    t.check(errs.length === 3 && errs.every(([b, e]) => {
        const props = Object.getOwnPropertyNames(e).sort().join(',');
        return props === 'code,message,stack' && !String(e.stack).includes(b) && !JSON.stringify(e).includes(b);
    }), 'refusal errors carry only code/message/stack and never the secret');
    const Kh = D.deriveKey(kit.TEST_SECRET).toString('hex');
    const outs = JSON.stringify([CORE.generate('u', 'md100-final-2026', { secret: kit.TEST_SECRET }), CORE.buildAnswerKey('u', 'md100-final-2026', { secret: kit.TEST_SECRET })]);
    t.check(!outs.includes(Kh) && !outs.includes(kit.TEST_SECRET), 'K and the secret absent from generated state and key');
}
/* known answers: K, visibleSeed and visibleStream follow the spec formula exactly */
{
    const c2 = require('crypto');
    const Ks = c2.createHmac('sha256', kit.TEST_SECRET).update('hexworth/mdfinal/v1').digest();
    t.check(D.deriveKey(kit.TEST_SECRET).equals(Ks), 'K = HMAC(S, "hexworth/mdfinal/v1")');
    const vs = c2.createHmac('sha256', Ks).update(JSON.stringify(['u1', 'md100-final-2026', 'visible', 0])).digest('hex');
    t.check(D.visibleSeed(Ks, 'u1', 'md100-final-2026') === vs, 'visibleSeed = hex(H("visible", 0))');
    const a = D.visibleStream(Ks, 'u1', 'md100-final-2026', 'wo'), b = D.makeRng(vs + '/wo');
    let same = true; for (let i = 0; i < 50; i++) { if (a.float() !== b.float()) same = false; }
    t.check(same, 'visibleStream(wo) = makeRng(visibleSeed + "/wo")');
    const c = D.visibleStream(Ks, 'u1', 'md100-final-2026', 'd2');
    t.check(c.float() !== D.visibleStream(Ks, 'u1', 'md100-final-2026', 'wo').float(), 'sections are separate sub-streams');
    const hh = D.hiddenHex(Ks, 'u1', 'md100-final-2026', 'archive-hash#0', 64);
    t.check(hh === c2.createHmac('sha256', Ks).update(JSON.stringify(['u1', 'md100-final-2026', 'archive-hash#0', 0])).digest('hex'), 'hiddenHex follows H(label, i)');
}
/* every string of up to two printable characters is refused (no magic-input backdoor) */
{
    let acc = 0;
    if (!refused('')) acc++;
    for (let a = 32; a < 127; a++) {
        if (!refused(String.fromCharCode(a))) acc++;
        for (let b = 32; b < 127; b++) { if (!refused(String.fromCharCode(a, b))) acc++; }
    }
    t.check(acc === 0, 'all 9,121 strings of length 0-2 refused (' + acc + ' accepted)');
}
/* hiddenDigits (BitLocker recovery password, D4) follows the spec: digit i is hidden(label#i, 10) */
{
    const c2 = require('crypto');
    const Ks = D.deriveKey(kit.TEST_SECRET);
    const H = (lab, i) => c2.createHmac('sha256', Ks).update(JSON.stringify(['u1', 'md100-final-2026', lab, i])).digest();
    const spec = (lab) => { for (let i = 0; ; i++) { const b = H(lab, i); for (let o = 0; o < 32; o += 4) { const v = b.readUInt32BE(o); if (v < 4294967290) return v % 10; } } };
    let want = ''; for (let i = 0; i < 48; i++) want += String(spec('bl-rp#0#' + i));
    const got = D.hiddenDigits(Ks, 'u1', 'md100-final-2026', 'bl-rp#0', 48);
    t.check(got === want && /^\d{48}$/.test(got) && new Set(got).size > 5, 'hiddenDigits = per-digit spec picks');
}

t.check(Object.isFrozen(D.PLACEHOLDERS), 'placeholder list frozen');
/* the vendored RNG draws exactly what netfinal's does (it is a copy, not a re-implementation) */
{
    const NF = require(require('path').join(kit.MD, '..', 'netfinal', 'netfinal-core.js'));
    let same = true;
    for (const seed of ['a', 'seed-1', 'x'.repeat(80), '']) {
        const p = D.makeRng(seed), q = NF.makeRng(seed);
        for (let i = 0; i < 200; i++) { if (p.int(0, 1e6) !== q.int(0, 1e6)) same = false; }
        if (JSON.stringify(p.shuffle([1, 2, 3, 4, 5, 6])) !== JSON.stringify(q.shuffle([1, 2, 3, 4, 5, 6]))) same = false;
    }
    t.check(same, 'vendored makeRng matches netfinal makeRng draw for draw');
}
/* every hidden label the generator uses is distinct and in the spec's list (static) */
{
    const src = require('fs').readFileSync(require('path').join(kit.MD, 'mdfinal-core.js'), 'utf8');
    const labels = [...src.matchAll(/DERIVE\.hidden(?:Hex)?\(K, uid, examId, '([^']+)'/g)].map((m) => m[1]);
    /* R1 labels: five single picks plus the two BitLocker families (bl-rp#<n>#<block>, bl-guid#<n>) */
    const SPEC_LABELS = ['profile', 'fault', 'fault-kb', 'fault-driver', 'fault-decoy-ip', 'bl-rp#', 'bl-guid#', 'archive-hash#'];
    t.check(labels.length === 8 && new Set(labels).size === 8 && labels.every((l) => SPEC_LABELS.includes(l)), 'generator hidden labels distinct and in the spec list: ' + labels.join(','));
    t.check(!/makeRng\(/.test(src.replace(/makeRng: DERIVE\.makeRng/, '')), 'generator never builds its own stream (uses visibleStream)');
}

/* ── 2. input separation and determinism ── */
const K = D.deriveKey(kit.TEST_SECRET);
const K2 = D.deriveKey(kit.ALT_SECRET);
t.check(D.visibleSeed(K, 'a|b', 'c') !== D.visibleSeed(K, 'a', 'b|c'), 'separator in uid cannot forge another input');
t.check(D.visibleSeed(K, 'u1', 'md100-final-2026') !== D.visibleSeed(K, 'u1', 'md100-final-rehearsal'), 'rehearsal derives a different lab');
t.check(D.visibleSeed(K, 'u1', 'x') === D.visibleSeed(K, 'u1', 'x'), 'deterministic');
let bad = false; try { D.hidden(Buffer.alloc(16), 'u', 'e', 'l', 4); } catch (e) { bad = true; }
t.check(bad, 'short key rejected');

/* ── 3. pickIndex rejection sampling ── */
const w = (v) => { const b = Buffer.alloc(4); b.writeUInt32BE(v >>> 0); return b; };
t.check(D.pickIndex(w(4294967295), 3) === -1, 'top word rejected for n=3 (limit 4294967295)');
t.check(D.pickIndex(w(4294967294), 3) === 4294967294 % 3, 'word below limit accepted');
t.check(D.pickIndex(Buffer.concat([w(4294967295), w(7)]), 3) === 1, 'falls through to the next word');

/* ── 4. independence: the v1 attacker vs every hidden pick ── */
const N = 10000;
const ids = kit.uids(N);
const z = 3.2905; /* two-sided 99.9% */
function within(hits, n) { const p = 1 / n, m = N * p, sd = Math.sqrt(N * p * (1 - p)); return Math.abs(hits - m) <= z * sd; }
const labels = [['profile', 3], ['fault', 4]];
const counts = { profile: [0, 0, 0], fault: [0, 0, 0, 0] };
for (const [label, n] of labels) {
    let hits = 0, control = 0;
    for (const uid of ids) {
        const actual = D.hidden(K, uid, 'md100-final-2026', label, n);
        counts[label][actual]++;
        const rng = CORE.makeRng(D.visibleSeed(K, uid, 'md100-final-2026'));
        if (Math.floor(rng.float() * n) === actual) { hits++; }
        /* control: a "pick" that DOES come from the visible stream must be caught */
        const rng2 = CORE.makeRng(D.visibleSeed(K, uid, 'md100-final-2026'));
        const leaked = Math.floor(rng2.float() * n);
        const rng3 = CORE.makeRng(D.visibleSeed(K, uid, 'md100-final-2026'));
        if (Math.floor(rng3.float() * n) === leaked) { control++; }
    }
    t.check(within(hits, n), label + ': attacker hit rate ' + hits + '/' + N + ' inside 99.9% chance interval');
    t.check(!within(control, n), label + ': control (pick from the visible stream) is detected, ' + control + '/' + N);
}
/* chi-square of the variant and profile distributions (99.9% critical values df=3: 16.27, df=2: 13.82) */
function chi(arr) { const e = N / arr.length; return arr.reduce((s, o) => s + (o - e) * (o - e) / e, 0); }
t.check(chi(counts.fault) < 16.27, 'variant chi-square ' + chi(counts.fault).toFixed(2) + ' < 16.27');
t.check(chi(counts.profile) < 13.82, 'profile chi-square ' + chi(counts.profile).toFixed(2) + ' < 13.82');

/* ── 5. changing the secret changes the hidden picks, keyed to it ── */
let sameFault = 0, sameProfile = 0, sameVisible = 0;
for (const uid of ids.slice(0, 2000)) {
    if (D.hidden(K, uid, 'e', 'fault', 4) === D.hidden(K2, uid, 'e', 'fault', 4)) { sameFault++; }
    if (D.hidden(K, uid, 'e', 'profile', 3) === D.hidden(K2, uid, 'e', 'profile', 3)) { sameProfile++; }
    if (D.visibleSeed(K, uid, 'e') === D.visibleSeed(K2, uid, 'e')) { sameVisible++; }
}
t.check(Math.abs(sameFault - 500) < 3.29 * Math.sqrt(2000 * 0.25 * 0.75), 'secret change re-draws faults (' + sameFault + '/2000 coincide, chance 500)');
t.check(Math.abs(sameProfile - 667) < 3.29 * Math.sqrt(2000 / 3 * 2 / 3), 'secret change re-draws profiles (' + sameProfile + '/2000)');
t.check(sameVisible === 0, 'secret change re-keys the visible stream');

t.done();
