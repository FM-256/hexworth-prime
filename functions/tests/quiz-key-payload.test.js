/**
 * quiz-key-payload.js — the shared registry-to-Firestore payload (taskboard #298).
 *
 * The defect being locked out: seed-quiz-key.js and push-quiz-keys.js wrote DIFFERENT
 * field sets from the SAME registry, and seed used a non-merge .set() that replaced the
 * whole document. So the tests that matter are:
 *
 *   1. both writers produce the identical field set (they now share this module, but that
 *      is exactly the kind of thing that gets "temporarily" forked again)
 *   2. poolSize is authoritative in BOTH directions -- a value, or an explicit delete
 *   3. the payload never contains a key that would clobber a field the registry does not
 *      own, because both writers merge
 *
 * Run: node functions/tests/quiz-key-payload.test.js
 */

'use strict';

const assert = require('assert');
const admin = require('firebase-admin');
const { buildPayload, findDrift, REGISTRY_OWNED } = require('../quiz-key-payload');

let pass = 0;
const results = [];

function check(name, fn) {
    try {
        fn();
        results.push(`  PASS  ${name}`);
        pass++;
    } catch (e) {
        results.push(`  FAIL  ${name}\n        ${e.message}`);
    }
}

const DELETE_SENTINEL = admin.firestore.FieldValue.delete();
const isDelete = (v) => v && v.constructor
    && v.constructor.name === DELETE_SENTINEL.constructor.name;

const FULL = {
    answers: [1, 2, 3], passingScore: 80, questionCount: 3, note: 'n',
    explanations: ['a', 'b', 'c'], revealToAll: true, reviewAfterFails: 2, poolSize: 3,
};
const MINIMAL = { answers: [0, 1] };

// ─── the two writers must agree ───
check('push and seed produce the SAME field names', () => {
    const a = Object.keys(buildPayload(FULL, { serverTimestamp: true })).sort();
    const b = Object.keys(buildPayload(FULL, { serverTimestamp: false })).sort();
    assert.deepStrictEqual(a, b,
        'the two writers diverged again -- this is the #298 defect');
});

check('the only difference between them is updatedAt TYPE', () => {
    const p = buildPayload(FULL, { serverTimestamp: true });
    const s = buildPayload(FULL, { serverTimestamp: false });
    assert.notStrictEqual(typeof p.updatedAt, typeof s.updatedAt);
    assert.strictEqual(typeof s.updatedAt, 'string', 'seed should keep its ISO string');
    for (const k of Object.keys(p)) {
        if (k === 'updatedAt') continue;
        assert.deepStrictEqual(p[k], s[k], `field ${k} differs between writers`);
    }
});

// ─── the three fields seed used to destroy ───
check('explanations survives (seed used to strip it)', () => {
    assert.deepStrictEqual(buildPayload(FULL).explanations, ['a', 'b', 'c']);
});

check('revealToAll survives (seed used to strip it)', () => {
    assert.strictEqual(buildPayload(FULL).revealToAll, true);
});

check('reviewAfterFails survives (seed used to strip it)', () => {
    assert.strictEqual(buildPayload(FULL).reviewAfterFails, 2);
});

// ─── authoritative in both directions ───
check('poolSize is written when declared', () => {
    assert.strictEqual(buildPayload(FULL).poolSize, 3);
});

check('poolSize is an explicit DELETE when absent, not omitted', () => {
    const p = buildPayload(MINIMAL);
    assert.ok('poolSize' in p, 'poolSize was omitted; a stale live value would survive');
    assert.ok(isDelete(p.poolSize), `expected a delete sentinel, got ${p.poolSize}`);
});

check('revealToAll is written FALSE when absent, not omitted', () => {
    const p = buildPayload(MINIMAL);
    assert.strictEqual(p.revealToAll, false,
        'a stray revealToAll:true on the live doc would leak answers forever');
});

check('a poolSize of 0 or a negative is treated as absent', () => {
    assert.ok(isDelete(buildPayload({ answers: [0], poolSize: 0 }).poolSize));
    assert.ok(isDelete(buildPayload({ answers: [0], poolSize: -5 }).poolSize));
});

// ─── conditional fields: documented inconsistency, asserted so it stays deliberate ───
check('explanations is OMITTED when absent (not deleted) -- the 4-quiz exception', () => {
    assert.ok(!('explanations' in buildPayload(MINIMAL)));
});

check('reviewAfterFails is OMITTED when absent (not deleted)', () => {
    assert.ok(!('reviewAfterFails' in buildPayload(MINIMAL)));
});

// ─── the payload must not touch fields the registry does not own ───
check('the payload never names a non-registry field', () => {
    const allowed = new Set([...REGISTRY_OWNED, 'updatedAt']);
    for (const k of Object.keys(buildPayload(FULL))) {
        assert.ok(allowed.has(k), `payload writes "${k}", which the registry does not own`);
    }
});

check('provenance fields are absent from the payload, so merge preserves them', () => {
    const p = buildPayload(FULL);
    for (const k of ['source', 'createdAt', 'karlAuditArtifact', 'fixNote', 'lastFixedBy',
        'rebalancedAt', 'shuffled', 'seedSource']) {
        assert.ok(!(k in p), `payload names "${k}" and would overwrite it`);
    }
});

// ─── defaults ───
check('passingScore defaults to 70 and questionCount to answers.length', () => {
    const p = buildPayload(MINIMAL);
    assert.strictEqual(p.passingScore, 70);
    assert.strictEqual(p.questionCount, 2);
});

check('an explicit passingScore of 0 is not overwritten by the default', () => {
    assert.strictEqual(buildPayload({ answers: [0], passingScore: 0 }).passingScore, 0,
        '0 was treated as missing -- != null is required, not a truthiness check');
});

// ─── drift detection ───
check('drift is found when live has explanations and the registry does not', () => {
    const d = findDrift('q1', { explanations: ['x'] }, { answers: [0] });
    assert.deepStrictEqual(d, [{ quizId: 'q1', field: 'explanations' }]);
});

check('no drift when both have it', () => {
    assert.deepStrictEqual(
        findDrift('q1', { explanations: ['x'] }, { explanations: ['x'] }), []);
});

check('no drift when neither has it', () => {
    assert.deepStrictEqual(findDrift('q1', {}, { answers: [0] }), []);
});

check('drift is found for reviewAfterFails too', () => {
    const d = findDrift('q1', { reviewAfterFails: 3 }, { answers: [0] });
    assert.deepStrictEqual(d, [{ quizId: 'q1', field: 'reviewAfterFails' }]);
});

check('a new document (no live data) reports no drift', () => {
    assert.deepStrictEqual(findDrift('q1', null, { answers: [0] }), []);
});

console.log('\nquiz-key-payload.js (#298)\n');
console.log(results.join('\n'));
const failed = results.length - pass;
console.log(`\n${pass}/${results.length} passed`);
if (failed) {
    console.error(`${failed} FAILED`);
    process.exit(1);
}
console.log('QUIZ KEY PAYLOAD PASSED\n');
