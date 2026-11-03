#!/usr/bin/env node
/**
 * mdfinal-isolation.test.js — R8 skeleton: one sitting cannot affect another.
 *
 * @catalog what    Student B generated after student A is byte-identical to B from a fresh child
 * @catalog what    process; module constants and built-in prototypes are unchanged by use.
 * @catalog run     node _tools/mdfinal/mdfinal-isolation.test.js
 * @catalog status  TOOL
 *
 * D1 SKELETON. R8 step 1 drives A through the canonical run, every action and every shell form;
 * at D1 only generation exists, so A is generated and its results are mutated hard. Later days add
 * the drives to step 1 without changing steps 2-4.
 */
const path = require('path');
const { execFileSync } = require('child_process');
const kit = require('./mdfinal-test-kit.js');
const CORE = kit.req('mdfinal-core.js');
const GRADE = kit.req('mdfinal-grade.js');
const X = kit.req('mdfinal-exams.js');
const LIM = kit.req('mdfinal-limits.js');
const t = kit.harness('mdfinal-isolation');
const opts = { secret: kit.TEST_SECRET };
const EX = 'md100-final-2026';

/* step 3 baseline: every exported constant */
const snapConsts = () => JSON.stringify([CORE.PROFILES, CORE.VARIANTS, CORE.GVLK, CORE.SETS, CORE.KB_RANGE_A,
    CORE.KB_RANGE_B, CORE.SIM_DEFAULTS, X.EXAM_IDS, X.WINDOWS, X.CATALOG_IDS, X.DURATION_MINUTES, LIM.LIMITS]);
const protoKeys = () => JSON.stringify([Object.getOwnPropertyNames(Object.prototype), Object.getOwnPropertyNames(Array.prototype)]);
const before = snapConsts(), protoBefore = protoKeys();

/* step 1: student A, results mutated hard */
const A = CORE.generate('student-A', EX, opts);
A.wo.requirements.push('x'); A.wo.network.dns.reverse(); A.host.isoLibrary.splice(0); A.wo.performance.startupCandidates.length = 0;
for (const c of CORE.variantSpace()) {
    const f = CORE.generateForced('student-A', EX, opts, c.profileIndex, c.variantIndex);
    f.state.wo.requirements.length = 0;
    try { f.key.wo.requirements.push('y'); } catch (e) { /* frozen */ }
}
let frozenConst = true;
try { (function () { 'use strict'; CORE.SETS.ramMB.push(4096); })(); frozenConst = false; } catch (e) { /* frozen */ }
try { (function () { 'use strict'; CORE.PROFILES[0].edition = 'Home'; })(); frozenConst = false; } catch (e) { /* frozen */ }
try { (function () { 'use strict'; LIM.LIMITS.storage.documentBytes = 1e9; })(); frozenConst = false; } catch (e) { /* frozen */ }
t.check(frozenConst, 'catalogue constants are frozen');

/* step 2: B in this process vs B in a fresh child */
const B = JSON.stringify({ s: CORE.generate('student-B', EX, opts), k: GRADE.buildAnswerKey('student-B', EX, opts) });
const child = execFileSync(process.execPath, ['-e',
    'const p=require("path");const m=' + JSON.stringify(kit.MD) + ';const C=require(p.join(m,"mdfinal-core.js"));const G=require(p.join(m,"mdfinal-grade.js"));' +
    'process.stdout.write(JSON.stringify({s:C.generate("student-B",' + JSON.stringify(EX) + ',{secret:' + JSON.stringify(kit.TEST_SECRET) + '}),k:G.buildAnswerKey("student-B",' + JSON.stringify(EX) + ',{secret:' + JSON.stringify(kit.TEST_SECRET) + '})}))'
]).toString();
t.check(B === child, 'B after A in-process is byte-identical to B in a fresh process');

/* step 3 and the prototype check */
t.check(snapConsts() === before, 'exported constants unchanged after use');
t.check(protoKeys() === protoBefore, 'Object.prototype and Array.prototype unchanged');

/* step 4: results are clones */
const s1 = CORE.generate('student-B', EX, opts); s1.wo.vm.vcpu = 99;
t.check(CORE.generate('student-B', EX, opts).wo.vm.vcpu !== 99, 'generate() returns a fresh clone');
t.check(GRADE.buildAnswerKey('student-B', EX, opts) !== GRADE.buildAnswerKey('student-B', EX, opts), 'buildAnswerKey() returns a fresh object');

/* no non-literal RegExp on input anywhere in functions/mdfinal (R4 lint, D1 slice) */
const fs = require('fs');
const offenders = fs.readdirSync(kit.MD).filter((f) => f.endsWith('.js')).filter((f) => /\bRegExp\s*\(/.test(fs.readFileSync(path.join(kit.MD, f), 'utf8')));
t.check(offenders.length === 0, 'no RegExp( in functions/mdfinal' + (offenders.length ? ': ' + offenders.join(', ') : ''));

t.done();
