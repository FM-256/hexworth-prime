#!/usr/bin/env node
/**
 * mdfinal-core.test.js — D1 generator for the MD-100 final.
 *
 * @catalog what    Determinism, the "WO never equals a simulator default" invariant, disk-size
 * @catalog what    feasibility, address sanity, and no hidden value in state, over 3,000 uids plus
 * @catalog what    the 12 forced profile x variant classes.
 * @catalog run     node _tools/mdfinal/mdfinal-core.test.js
 * @catalog status  TOOL
 *
 * RE-DERIVED, NOT DELEGATED. The invariants below are computed from the generated WO against
 * SIM_DEFAULTS and the spec's sets; nothing asks the generator whether it is valid. Section 6 runs
 * each invariant against a hand-broken WO, so every check here is shown to be able to fail.
 *
 * SECTION 7 IS THE SPEC'S FORMULA, WRITTEN A SECOND TIME. Every hidden pick in the key is recomputed
 * here from R1 with node crypto and spec-literal ranges, and compared. A wrong label, a dropped
 * domain string, a constant pick or a pick taken from the visible stream all disagree with it
 * (Mallory D1: 23 such mutants survived the first version of these suites).
 * Section 8 pins the generator's output (golden hash). Section 9 pins the state's shape, so an added
 * field is a deliberate test edit, and scans the state for the key's own hidden values.
 */
const kit = require('./mdfinal-test-kit.js');
const CORE = kit.req('mdfinal-core.js');
const GRADE = kit.req('mdfinal-grade.js');
const DEF = CORE.SIM_DEFAULTS;
const t = kit.harness('mdfinal-core');
const opts = { secret: kit.TEST_SECRET };
const EX = 'md100-final-2026';

/* ── the invariants, as functions over (wo, key) so section 6 can feed them broken input ── */
const re = new RegExp(DEF.hostnamePattern);
const ipInt = CORE.ip.toInt;
function problems(wo, key) {
    const p = [];
    if (DEF.vm.startupMemoryMB.includes(wo.vm.startupMemoryMB)) p.push('ram=default');
    if (wo.vm.dynamicMemory !== false) p.push('dynamic memory');
    if (wo.vm.vcpu === DEF.vm.vcpu) p.push('vcpu=default');
    if (wo.vm.vhdxGB === DEF.vm.vhdxGB) p.push('vhdx=default');
    if (re.test(wo.hostname)) p.push('hostname=default pattern');
    if (wo.timeZone === DEF.timeZone) p.push('tz=default');
    if (wo.join.type === 'workgroup' && wo.join.workgroup.toUpperCase() === DEF.workgroup) p.push('workgroup=default');
    if (wo.join.type === 'workgroup' && wo.join.workgroup.toUpperCase() === 'MERIDIAN') p.push('workgroup=decoy');
    if (DEF.power.acDisplayMin.includes(wo.power.acDisplayMin)) p.push('acDisplay=default');
    if (DEF.power.acSleepMin.includes(wo.power.acSleepMin)) p.push('acSleep=default');
    if (DEF.power.dcDisplayMin.includes(wo.power.dcDisplayMin)) p.push('dcDisplay=default');
    if (DEF.power.dcSleepMin.includes(wo.power.dcSleepMin)) p.push('dcSleep=default');
    if (wo.power.planName === DEF.power.activePlan) p.push('plan=default');
    const ah = wo.updates.activeHours, dah = DEF.updates.activeHours;
    if (ah.start === dah.start && ah.end === dah.end) p.push('active hours=default');
    if (ah.end - ah.start > 18 || ah.end > 23) p.push('active hours invalid');
    if (wo.updates.featureDeferralDays === DEF.updates.featureDeferralDays) p.push('feature deferral=default');
    if (wo.updates.qualityDeferralDays === DEF.updates.qualityDeferralDays) p.push('quality deferral=default');
    if (wo.updates.qualityDeferralDays > 30 || wo.updates.featureDeferralDays > 365) p.push('deferral out of range');
    if (!wo.defenderExclusion) p.push('no exclusion');
    for (const k of Object.keys(DEF.privacy)) { if (wo.privacy[k] === DEF.privacy[k]) p.push('privacy ' + k + '=default'); }
    if (!/^mertech\d{2}$/.test(wo.technician)) p.push('technician format');
    if (!/^MERWS-\d{3}$/.test(wo.hostname)) p.push('hostname format');
    if ([3389, 445, 135, 139, 80, 443, 53, 88, 389, 636, 1688, 5985, 5986].includes(wo.lob.port)) p.push('LOB port reserved');
    if (wo.disks.archiveManifest.some((f) => !/^[0-9a-f]{64}$/.test(f.sha256))) p.push('manifest hash');
    if (wo.vm.vhdxGB - 1 - wo.disks.cGB < 10) p.push('no room for D:');  /* spec 13.2 item 2 literals */
    /* addresses */
    const n = wo.network, net = CORE.ip.parseCidr(n.ip + '/' + n.prefix);
    const inside = (a) => CORE.ip.inNet(ipInt(a), net);
    if (CORE.ip.prefixToMask(CORE.ip.maskToPrefix(n.mask)) !== n.mask || CORE.ip.maskToPrefix(n.mask) !== n.prefix) p.push('mask round-trip');
    const used = [n.ip, n.gateway].concat(n.dns, n.kms ? [n.kms.ip] : []);
    if (new Set(used).size !== used.length) p.push('address collision');
    if (!used.every(inside)) p.push('address outside subnet');
    const host = ipInt(n.ip) - net.net, last = Math.pow(2, 32 - n.prefix) - 1;
    if (host <= 0 || host >= last) p.push('host is network/broadcast');
    if (CORE.ip.inNet(ipInt(n.ip), CORE.ip.parseCidr(DEF.network.dhcpSubnet))) p.push('ip in DHCP subnet');
    if (CORE.ip.inNet(ipInt(n.ip), CORE.ip.parseCidr(n.lobRemoteSubnet))) p.push('LOB remote subnet contains the PC');
    /* accounts */
    const names = [wo.user.name, wo.secondMember.name, wo.technician].map((s) => s.toLowerCase());
    if (new Set(names).size !== 3) p.push('account names collide');
    if (names.includes('administrator') || names.includes('guest')) p.push('built-in name');
    /* performance */
    if (new Set(wo.performance.startupCandidates).size !== 4) p.push('startup candidates');
    if (!wo.performance.highImpact.every((x) => wo.performance.startupCandidates.includes(x)) || new Set(wo.performance.highImpact).size !== 2) p.push('high impact set');
    /* keys */
    const kb = Number(wo.updates.cumulativeKb.slice(2));
    if (kb < CORE.KB_RANGE_A[0] || kb > CORE.KB_RANGE_A[1]) p.push('KB-A out of range');
    if (key) {
        const kbB = Number(key.fault.kb.slice(2));
        if (kbB < CORE.KB_RANGE_B[0] || kbB > CORE.KB_RANGE_B[1]) p.push('KB-B out of range');
        if (key.channel === 'KMS' && key.productKey !== CORE.GVLK[key.edition]) p.push('KMS key mismatch');
        if (key.channel === 'MAK' && key.productKey !== wo.mak) p.push('MAK key mismatch');
        if (key.productKey === wo.retailCoa) p.push('decoy equals key');
        if (key.technician !== wo.technician) p.push('technician mismatch');
        if ((key.channel === 'KMS') !== !!wo.network.kms) p.push('KMS host presence');
    }
    return p;
}

/* ── 1. ranges are disjoint ── */
t.check(CORE.KB_RANGE_A[1] < CORE.KB_RANGE_B[0], 'KB range A and B disjoint');

/* ── 1b. identity guard: no coercion collisions (Mallory D1) ── */
for (const [u, e, why] of [[1, EX, 'number uid'], [undefined, EX, 'undefined uid'], ['', EX, 'empty uid'], [{}, EX, 'object uid'],
    ['x'.repeat(129), EX, 'overlong uid'], ['u', null, 'null examId'], ['u', ['md100-final-2026'], 'array examId'], ['u', 'attempt2', 'unknown examId'], ['u', undefined, 'undefined examId']]) {
    let threw = false; try { CORE.generate(u, e, opts); } catch (err) { threw = true; }
    let threw2 = false; try { GRADE.buildAnswerKey(u, e, opts); } catch (err) { threw2 = true; }
    t.check(threw && threw2, 'identity refused: ' + why);
}

/* ── 2. determinism and secret binding ── */
const a1 = CORE.generate('u-1', EX, opts), a2 = CORE.generate('u-1', EX, opts);
t.check(JSON.stringify(a1) === JSON.stringify(a2), 'same inputs, byte-identical state');
t.check(JSON.stringify(GRADE.buildAnswerKey('u-1', EX, opts)) === JSON.stringify(GRADE.buildAnswerKey('u-1', EX, opts)), 'same inputs, byte-identical key');
t.check(JSON.stringify(a1) !== JSON.stringify(CORE.generate('u-2', EX, opts)), 'different uid, different lab');
t.check(JSON.stringify(a1) !== JSON.stringify(CORE.generate('u-1', 'md100-final-rehearsal', opts)), 'rehearsal, different lab');
t.check(JSON.stringify(a1) !== JSON.stringify(CORE.generate('u-1', EX, { secret: kit.ALT_SECRET })), 'different secret, different lab');
t.check(JSON.stringify(GRADE.buildAnswerKey('u-1', EX, opts).wo) === JSON.stringify(a1.wo), 'key.wo equals state.wo');

/* ── 3. invariants over 3,000 uids and the 12 forced classes ── */
const seen = { profile: {}, variant: {}, prefix: {}, vhdx: {}, c: {}, res: {} };
let probs = [];
const N = 3000;
for (const uid of kit.uids(N)) {
    const s = CORE.generate(uid, EX, opts), k = GRADE.buildAnswerKey(uid, EX, opts);
    const p = problems(s.wo, k);
    if (p.length) probs.push(uid + ': ' + p.join(', '));
    seen.profile[k.profile] = 1; seen.variant[k.variant] = 1; seen.prefix[s.wo.network.prefix] = 1;
    seen.vhdx[s.wo.vm.vhdxGB] = 1; seen.c[s.wo.disks.cGB] = 1; seen.res[k.resiliency] = 1;
}
for (const c of CORE.variantSpace()) {
    const f = CORE.generateForced('forced-' + c.profileIndex + '-' + c.variantIndex, EX, opts, c.profileIndex, c.variantIndex);
    const p = problems(f.state.wo, f.key);
    if (p.length) probs.push(c.profile + '/' + c.variant + ': ' + p.join(', '));
    if (f.key.variant !== c.variant || f.key.profile !== CORE.PROFILES[c.profileIndex].id) probs.push('forcing ignored ' + c.profile + '/' + c.variant);
}
t.check(probs.length === 0, 'invariants hold on 3,000 uids + 12 classes' + (probs.length ? ': ' + probs.slice(0, 5).join(' | ') : ''));
t.check(CORE.variantSpace().length === 12, 'variant space is 3 x 4');
t.check(Object.keys(seen.profile).length === 3 && Object.keys(seen.variant).length === 4, 'all profiles and variants occur');
t.check(Object.keys(seen.prefix).length === 3 && Object.keys(seen.vhdx).length === 3 && Object.keys(seen.c).length === 3 && Object.keys(seen.res).length === 2, 'every visible set is reachable');

/* ── 4. no hidden value reaches the state (R5 canary, D1 slice) ── */
let leaks = [];
for (const uid of kit.uids(500)) {
    const s = JSON.stringify(CORE.generate(uid, EX, opts)), k = GRADE.buildAnswerKey(uid, EX, opts);
    for (const v of [k.profile, k.fault.kb, k.fault.driverInf, k.fault.decoyIp, k.fault.kb.slice(2)]) {
        if (s.includes(v)) leaks.push(uid + ' ' + v);
    }
    if (/"(variant|profile|fault|answerKey|key)"\s*:/.test(s)) leaks.push(uid + ' key-shaped field');
    if (/mdp-[abc]/.test(s)) leaks.push(uid + ' profile id');
}
t.check(leaks.length === 0, 'no hidden value in 500 states' + (leaks.length ? ': ' + leaks.slice(0, 3).join(', ') : ''));

/* ── 4b. the GENERATOR's hidden picks resist the v1 attacker (not only derive.hidden) ──
 * The attacker holds the visible stream's seed and tries every one of its first 64 positions as a
 * predictor of key.profile and key.variant. Bonferroni over 128 tests at family 99.9% (z = 4.47). */
{
    const D = kit.req('mdfinal-derive.js');
    const K = D.deriveKey(kit.TEST_SECRET);
    const N2 = 10000, POS = 64, zB = 4.47;
    const hits = { profile: new Array(POS).fill(0), variant: new Array(POS).fill(0) };
    const PIDS = CORE.PROFILES.map((x) => x.id);
    for (const uid of kit.uids(N2)) {
        const k = GRADE.buildAnswerKey(uid, EX, opts);
        const pi = PIDS.indexOf(k.profile), vi = CORE.VARIANTS.indexOf(k.variant);
        const rng = CORE.makeRng(D.visibleSeed(K, uid, EX));
        for (let j = 0; j < POS; j++) {
            const f = rng.float();
            if (Math.floor(f * 3) === pi) hits.profile[j]++;
            if (Math.floor(f * 4) === vi) hits.variant[j]++;
        }
    }
    const out = (h, n) => { const p = 1 / n, m = N2 * p, sd = Math.sqrt(N2 * p * (1 - p)); return h.map((x, j) => [j, x]).filter(([, x]) => Math.abs(x - m) > zB * sd); };
    const bp = out(hits.profile, 3), bv = out(hits.variant, 4);
    t.check(bp.length === 0, 'generator profile unpredictable from visible positions 0-63' + (bp.length ? ' (biased at ' + JSON.stringify(bp.slice(0, 3)) + ')' : ''));
    t.check(bv.length === 0, 'generator variant unpredictable from visible positions 0-63' + (bv.length ? ' (biased at ' + JSON.stringify(bv.slice(0, 3)) + ')' : ''));
}

/* ── 5. key is frozen; generate returns clones ── */
const k1 = GRADE.buildAnswerKey('u-1', EX, opts);
t.check(Object.isFrozen(k1) && Object.isFrozen(k1.wo) && Object.isFrozen(k1.wo.network.dns), 'answer key deep-frozen');
let threw = false; try { (function () { 'use strict'; k1.variant = 'V9'; })(); } catch (e) { threw = true; }
t.check(threw && k1.variant !== 'V9', 'writing the key throws in strict mode');
const g = CORE.generate('u-1', EX, opts); g.wo.network.dns.push('1.1.1.1'); g.host.isoLibrary.length = 0;
t.check(JSON.stringify(CORE.generate('u-1', EX, opts)) === JSON.stringify(a1), 'mutating a result does not reach the next one');

/* ── 6. each invariant can fail (mutate a real WO, expect the named problem) ── */
const base = JSON.parse(JSON.stringify(a1.wo));
const mutations = [
    ['ram=default', (w) => { w.vm.startupMemoryMB = 4096; }],
    ['vcpu=default', (w) => { w.vm.vcpu = 1; }],
    ['vhdx=default', (w) => { w.vm.vhdxGB = 127; }],
    ['hostname=default pattern', (w) => { w.hostname = 'DESKTOP-AB12CD3'; }],
    ['tz=default', (w) => { w.timeZone = 'Pacific Standard Time'; }],
    ['acSleep=default', (w) => { w.power.acSleepMin = 30; }],
    ['dcSleep=default', (w) => { w.power.dcSleepMin = 15; }],
    ['active hours=default', (w) => { w.updates.activeHours = { start: 8, end: 17 }; }],
    ['feature deferral=default', (w) => { w.updates.featureDeferralDays = 0; }],
    ['no room for D:', (w) => { w.vm.vhdxGB = 96; w.disks.cGB = 96; }],
    ['address collision', (w) => { w.network.gateway = w.network.ip; }],
    ['address outside subnet', (w) => { w.network.dns = ['192.0.2.1', w.network.dns[1]]; }],
    ['ip in DHCP subnet', (w) => { w.network.ip = '172.25.50.9'; }],
    ['account names collide', (w) => { w.secondMember.name = w.user.name; }],
    ['KB-A out of range', (w) => { w.updates.cumulativeKb = 'KB5091200'; }],
    ['ram=default', (w) => { w.vm.startupMemoryMB = 1024; }],
    ['dynamic memory', (w) => { w.vm.dynamicMemory = true; }],
    ['workgroup=default', (w) => { w.join = { type: 'workgroup', workgroup: 'Workgroup' }; }],
    ['workgroup=decoy', (w) => { w.join = { type: 'workgroup', workgroup: 'MERIDIAN' }; }],
    ['host is network/broadcast', (w) => { const n = CORE.ip.parseCidr(w.network.ip + '/' + w.network.prefix); w.network.ip = CORE.ip.toStr(n.net); }],
    ['mask round-trip', (w) => { w.network.mask = '255.255.254.0'; w.network.prefix = 24; }],
    ['LOB remote subnet contains the PC', (w) => { w.network.lobRemoteSubnet = w.network.ip.split('.').slice(0, 3).join('.') + '.0/24'; }],
    ['startup candidates', (w) => { w.performance.startupCandidates = ['a', 'a', 'b', 'c']; }],
    ['high impact set', (w) => { w.performance.highImpact = ['not-a-candidate', w.performance.startupCandidates[0]]; }],
    ['privacy location=default', (w) => { w.privacy.location = true; }],
    ['technician format', (w) => { w.technician = 'MERTECH'; }],
    ['hostname format', (w) => { w.hostname = 'MERWS-FIN01'; }],
    ['LOB port reserved', (w) => { w.lob.port = 3389; }],
    ['acDisplay=default', (w) => { w.power.acDisplayMin = 15; }],
    ['manifest hash', (w) => { w.disks.archiveManifest[0].sha256 = 'abc'; }]
];
for (const [want, mut] of mutations) {
    const w = JSON.parse(JSON.stringify(base)); mut(w);
    t.check(problems(w, null).includes(want), 'detector fires: ' + want);
}
t.check(problems(base, null).length === 0, 'unmutated WO is clean');
/* key-side detectors */
{
    const k = JSON.parse(JSON.stringify(GRADE.buildAnswerKey('u-1', EX, opts)));
    const wk = JSON.parse(JSON.stringify(k.wo));
    const kmut = [
        ['KMS key mismatch', (x) => { x.channel = 'KMS'; x.productKey = 'XXXXX'; }],
        ['decoy equals key', (x) => { x.productKey = wk.retailCoa; x.channel = 'MAK'; wk.mak = wk.retailCoa; }],
        ['technician mismatch', (x) => { x.technician = 'mertech00'; }]
    ];
    for (const [want, mut] of kmut) { const x = JSON.parse(JSON.stringify(k)); mut(x); t.check(problems(wk, x).includes(want), 'key detector fires: ' + want); }
}

/* ── 7. every hidden pick, recomputed from the spec formula (R1, 13.2 item 3) ── */
const crypto = require('crypto');
const SPEC = {
    K: (S) => crypto.createHmac('sha256', S.trim()).update('hexworth/mdfinal/v1').digest(),
    H: (K, uid, ex, label, i) => crypto.createHmac('sha256', K).update(JSON.stringify([uid, ex, label, i])).digest(),
    hidden(K, uid, ex, label, n) {
        const lim = Math.floor(4294967296 / n) * n;
        for (let i = 0; ; i++) { const b = SPEC.H(K, uid, ex, label, i); for (let o = 0; o < 32; o += 4) { const v = b.readUInt32BE(o); if (v < lim) return v % n; } }
    }
};
const SPEC_PROFILES = { 'mdp-a': ['domain', 'Pro', 'KMS'], 'mdp-b': ['domain', 'Enterprise', 'KMS'], 'mdp-c': ['workgroup', 'Pro', 'MAK'] };
const SPEC_GVLK = { Pro: 'W269N-WFGWX-YVC9B-4J6C9-T83GX', Enterprise: 'NPPR9-FWDCX-D2C8J-H872K-2YT43' };
{
    const Ks = SPEC.K(kit.TEST_SECRET);
    let bad = [];
    const cnt = {}, kbs = new Set(), oems = new Set(), decoys = new Set();
    const N7 = 6000;
    for (const ex of ['md100-final-2026', 'md100-final-rehearsal']) {
        for (const uid of kit.uids(ex === EX ? N7 : 300)) {
            const k = GRADE.buildAnswerKey(uid, ex, opts), s = CORE.generate(uid, ex, opts);
            const want = {
                profile: ['mdp-a', 'mdp-b', 'mdp-c'][SPEC.hidden(Ks, uid, ex, 'profile', 3)],
                variant: ['V1', 'V2', 'V3', 'V4'][SPEC.hidden(Ks, uid, ex, 'fault', 4)],
                kb: 'KB' + (5091100 + SPEC.hidden(Ks, uid, ex, 'fault-kb', 800)),
                driverInf: 'oem' + (3 + SPEC.hidden(Ks, uid, ex, 'fault-driver', 38)) + '.inf',
                decoyIp: '198.51.100.' + (10 + SPEC.hidden(Ks, uid, ex, 'fault-decoy-ip', 241))
            };
            const got = { profile: k.profile, variant: k.variant, kb: k.fault.kb, driverInf: k.fault.driverInf, decoyIp: k.fault.decoyIp };
            if (JSON.stringify(want) !== JSON.stringify(got)) bad.push(uid + '/' + ex + ' ' + JSON.stringify(got) + ' != ' + JSON.stringify(want));
            const sp = SPEC_PROFILES[k.profile];
            if (!sp || s.wo.join.type !== sp[0] || k.edition !== sp[1] || k.channel !== sp[2]) bad.push(uid + ' profile table ' + k.profile + '/' + k.edition + '/' + k.channel);
            if (k.productKey !== (sp && sp[2] === 'KMS' ? SPEC_GVLK[sp[1]] : s.wo.mak)) bad.push(uid + ' product key');
            if (ex === EX) { const c = k.profile + k.variant; cnt[c] = (cnt[c] || 0) + 1; kbs.add(k.fault.kb); oems.add(k.fault.driverInf); decoys.add(k.fault.decoyIp); }
        }
    }
    /* BitLocker material: GUIDs from hiddenHex(bl-guid#n), passwords 8 blocks of 11 x hidden(bl-rp#n#b, 65536) */
    {
        const Hx = (uid, ex, label) => { let o = ''; for (let i = 0; o.length < 32; i++) o += SPEC.H(Ks, uid, ex, label, i).toString('hex'); return o.slice(0, 32).toUpperCase(); };
        for (const uid of kit.uids(200)) {
            const k = GRADE.buildAnswerKey(uid, EX, opts);
            for (let n = 0; n < 8; n++) {
                const h = Hx(uid, EX, 'bl-guid#' + n);
                const vr = '89AB'[parseInt(h[16], 16) % 4];
                const wantId = h.slice(0, 8) + '-' + h.slice(8, 12) + '-4' + h.slice(13, 16) + '-' + vr + h.slice(17, 20) + '-' + h.slice(20, 32);
                const wantPw = Array.from({ length: 8 }, (_, b) => ('000000' + 11 * SPEC.hidden(Ks, uid, EX, 'bl-rp#' + n + '#' + b, 65536)).slice(-6)).join('-');
                if (k.bitlocker.ids[n] !== wantId || k.bitlocker.passwords[n] !== wantPw) bad.push(uid + ' bitlocker slot ' + n);
            }
            if (k.bitlocker.passwords.some((p) => !/^(\d{6}-){7}\d{6}$/.test(p) || p.split('-').some((x) => Number(x) % 11 !== 0 || Number(x) >= 720896))) bad.push(uid + ' recovery password format');
            if (k.bitlocker.ids.length !== 8 || new Set(k.bitlocker.ids).size !== 8 || new Set(k.bitlocker.passwords).size !== 8) bad.push(uid + ' bitlocker slots not 8 distinct');
            if (!k.bitlocker.ids.every((g) => /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/.test(g))) bad.push(uid + ' GUID not v4 layout');
        }
    }
    t.check(bad.length === 0, 'every hidden pick equals the spec formula (6,300 sittings)' + (bad.length ? ': ' + bad.slice(0, 2).join(' | ') : ''));
    /* 12-cell joint profile x variant (99.9% critical, df=11: 31.26) */
    const e = N7 / 12; let chi = 0; for (const p of ['mdp-a', 'mdp-b', 'mdp-c']) for (const v of ['V1', 'V2', 'V3', 'V4']) { const o = cnt[p + v] || 0; chi += (o - e) * (o - e) / e; }
    t.check(chi < 31.26, 'profile x variant joint chi-square ' + chi.toFixed(2) + ' < 31.26');
    t.check(kbs.size > 780 && oems.size === 38 && decoys.size === 241, 'fault values spread over their ranges (KB ' + kbs.size + '/800, oem ' + oems.size + '/38, decoy ' + decoys.size + '/241)');
    /* profile requirement prose: non-empty, distinct per profile, never names an edition or the internal id */
    const reqs = CORE.PROFILES.map((p) => p.requirements.join(' '));
    t.check(new Set(reqs).size === 3 && reqs.every((r) => r.length > 40), 'requirements distinct per profile');
    t.check(reqs.every((r) => !/\b(Pro|Enterprise|Education|Home)\b|mdp-/.test(r)), 'requirements never name the edition');
    t.check(/N \(media-feature-less\) editions are not licensed/.test(CORE.EDITION_RULE) && /academic editions/.test(CORE.EDITION_RULE), 'edition rule excludes academic and N editions');
    t.check(/every build task on this work order applies/.test(CORE.EDITION_RULE), 'edition rule says build tasks apply to every PC');
    /* hostname reveals nothing about the profile: digit distribution per profile */
    const hp = { 'mdp-a': new Array(10).fill(0), 'mdp-b': new Array(10).fill(0), 'mdp-c': new Array(10).fill(0) };
    for (const uid of kit.uids(3000)) { const k = GRADE.buildAnswerKey(uid, EX, opts); hp[k.profile][Number(k.wo.hostname.slice(-1))]++; }
    let hchi = 0; const tot = new Array(10).fill(0); for (const p in hp) hp[p].forEach((x, i) => { tot[i] += x; });
    for (const p in hp) { const rowN = hp[p].reduce((a, b) => a + b, 0); hp[p].forEach((o, i) => { const ex = rowN * tot[i] / 3000; hchi += (o - ex) * (o - ex) / ex; }); }
    t.check(hchi < 42.31, 'hostname independent of profile (chi-square ' + hchi.toFixed(2) + ' < 42.31, df=18)');
}

/* ── 8. golden: the generator's output is pinned (Nancy D1). A change here re-draws every student's
 * lab; it needs GENERATOR_VERSION bumped AND these hashes updated in the same commit. ── */
{
    const GOLDEN_VERSION = '1.1.0';
    const GOLDEN = '8cf633d87aa19dae39e0e2ef7da380a79667367dc287c32c92f82eb536dd70c2';
    const h = crypto.createHash('sha256');
    for (const ex of ['md100-final-2026', 'md100-final-rehearsal']) {
        for (const uid of ['golden-a', 'golden-b', 'golden-c', 'golden-d', 'golden-e']) {
            h.update(JSON.stringify(CORE.generate(uid, ex, opts))); h.update(JSON.stringify(GRADE.buildAnswerKey(uid, ex, opts)));
        }
    }
    const got = h.digest('hex');
    if (process.env.MDFINAL_PRINT_GOLDEN) { console.log('GOLDEN ' + got); }
    t.check(CORE.GENERATOR_VERSION === GOLDEN_VERSION && got === GOLDEN, 'golden output for 10 fixed sittings (version ' + CORE.GENERATOR_VERSION + ')');
}

/* ── 9. state shape is pinned, and the key's hidden values never appear in it ── */
{
    const shape = (o, pre) => {
        if (Array.isArray(o)) return o.length && o[0] && typeof o[0] === 'object' ? shape(o[0], pre + '[]') : [pre + '[]'];
        if (o && typeof o === 'object') { const ks = Object.keys(o).sort(); return ks.length ? [].concat(...ks.map((k) => shape(o[k], pre + '.' + k))) : [pre + '{}']; }
        return [pre];
    };
    const ALLOWED = new Set([
        '.answers{}',
        '.apps',
        '.disks',
        '.eventlog[]',
        '.events[]',
        '.host.fabricDisks[].file',
        '.host.fabricDisks[].gb',
        '.host.fabricDisks[].label',
        '.host.fabricDisks[].letter',
        '.host.fabricDisks[].partitioned',
        '.host.isoLibrary[]',
        '.host.labFiles[]',
        '.host.switches[].name',
        '.host.switches[].type',
        '.host.usb.F.files[]',
        '.host.usb.F.label',
        '.identity',
        '.ledger[]',
        '.meta.examId',
        '.meta.generatorVersion',
        '.meta.studentId',
        '.network',
        '.os',
        '.regScratch{}',
        '.security',
        '.setup',
        '.vm',
        '.wo.build.build',
        '.wo.build.version',
        '.wo.confidentialPath',
        '.wo.consumerApp',
        '.wo.defenderExclusion',
        '.wo.disks.archiveAtLocation0',
        '.wo.disks.archiveGB',
        '.wo.disks.archiveManifest[].bytes',
        '.wo.disks.archiveManifest[].name',
        '.wo.disks.archiveManifest[].sha256',
        '.wo.disks.cGB',
        '.wo.disks.dLabel',
        '.wo.disks.poolGB',
        '.wo.disks.resiliencyProse',
        '.wo.disks.spacesLabel',
        '.wo.disks.spacesLetter',
        '.wo.editionRule',
        '.wo.group',
        '.wo.hostname',
        '.wo.join.domain',
        '.wo.join.joinAccount',
        '.wo.join.type',
        '.wo.join.workgroup',
        '.wo.lob.fqdn',
        '.wo.lob.host',
        '.wo.lob.name',
        '.wo.lob.port',
        '.wo.mak',
        '.wo.network.dnsNames',
        '.wo.network.dnsNames[]',
        '.wo.network.dns[]',
        '.wo.network.gateway',
        '.wo.network.ip',
        '.wo.network.kms.fqdn',
        '.wo.network.kms.ip',
        '.wo.network.lobRemoteSubnet',
        '.wo.network.mask',
        '.wo.network.prefix',
        '.wo.performance.highImpact[]',
        '.wo.performance.pagefileMB',
        '.wo.performance.startupCandidates[]',
        '.wo.power.acDisplayMin',
        '.wo.power.acSleepMin',
        '.wo.power.dcDisplayMin',
        '.wo.power.dcSleepMin',
        '.wo.power.planName',
        '.wo.privacy.advertisingId',
        '.wo.privacy.diagnosticData',
        '.wo.privacy.findMyDevice',
        '.wo.privacy.inking',
        '.wo.privacy.location',
        '.wo.privacy.tailored',
        '.wo.requirements[]',
        '.wo.retailCoa',
        '.wo.secondMember.fullName',
        '.wo.secondMember.name',
        '.wo.share.name',
        '.wo.share.path',
        '.wo.technician',
        '.wo.ticket',
        '.wo.timeZone',
        '.wo.updates.activeHours.end',
        '.wo.updates.activeHours.start',
        '.wo.updates.cumulativeKb',
        '.wo.updates.featureDeferralDays',
        '.wo.updates.qualityDeferralDays',
        '.wo.user.fullName',
        '.wo.user.name',
        '.wo.vm.dynamicMemory',
        '.wo.vm.startupMemoryMB',
        '.wo.vm.vcpu',
        '.wo.vm.vhdxGB'
    ]);
    let extra = new Set();
    for (const c of CORE.variantSpace()) {
        const f = CORE.generateForced('shape-' + c.profileIndex + c.variantIndex, EX, opts, c.profileIndex, c.variantIndex);
        for (const p of shape(f.state, '')) if (!ALLOWED.has(p)) extra.add(p);
    }
    if (process.env.MDFINAL_PRINT_SHAPE) {
        const all = new Set(); for (const c of CORE.variantSpace()) for (const p of shape(CORE.generateForced('shape-' + c.profileIndex + c.variantIndex, EX, opts, c.profileIndex, c.variantIndex).state, '')) all.add(p);
        console.log('SHAPE ' + [...all].sort().join(','));
    }
    t.check(extra.size === 0, 'state carries only the pinned fields' + (extra.size ? ': unexpected ' + [...extra].slice(0, 5).join(', ') : ''));
    let leaks = [];
    for (const uid of kit.uids(1000)) {
        const s = CORE.generate(uid, EX, opts), js = JSON.stringify(s), k = GRADE.buildAnswerKey(uid, EX, opts);
        const label = CORE.PROFILES.find((p) => p.id === k.profile).label;
        const needles = [k.profile, label, '"' + k.variant + '"', k.fault.kb, k.fault.kb.slice(2), k.fault.driverInf, k.fault.driverInf.replace('.inf', ''), k.fault.decoyIp]
            .concat(k.bitlocker.ids, k.bitlocker.passwords, k.bitlocker.ids.map((x) => x.slice(0, 8)));
        for (const nd of needles) if (js.includes(nd)) leaks.push(uid + ' ' + nd);
    }
    t.check(leaks.length === 0, 'no hidden value of the key appears in its state (1,000 sittings)' + (leaks.length ? ': ' + leaks.slice(0, 3).join(', ') : ''));
}

t.done();
