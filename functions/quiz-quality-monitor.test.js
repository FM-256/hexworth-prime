/**
 * Smoke test for quizQualityMonitor stable-anchor logic.
 *
 * The CF picks a docId per cluster using the alphabetically-first quizId.
 * This test verifies the anchor is STABLE regardless of input order — the
 * bug it locks in (discovered 2026-05-07 post-deploy verification): if
 * the anchor was based on Firestore iteration order, the same cluster
 * would get different docIds across runs, causing auto-resolve+recreate
 * churn every weekly invocation.
 *
 * Run: node functions/quiz-quality-monitor.test.js
 */

let passed = 0, failed = 0;
function assert(cond, label) {
    if (cond) { passed++; console.log(`  ✓ ${label}`); }
    else      { failed++; console.error(`  ✗ ${label}`); }
}

// Replicate just the anchor-selection logic from quiz-quality-monitor.js
function clusterAnchor(qids) {
    return [...qids].sort()[0];
}

function clusterDocId(qids) {
    return 'quiz_dup_' + clusterAnchor(qids).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
}

console.log('Stable-anchor logic');
{
    const a = clusterDocId(['shield-pis-w1-quiz', 'fw-w4-soho', 'fw-w4-mobile', 'fw-w2-wireless']);
    const b = clusterDocId(['fw-w4-soho', 'shield-pis-w1-quiz', 'fw-w2-wireless', 'fw-w4-mobile']);
    const c = clusterDocId(['fw-w2-wireless', 'fw-w4-mobile', 'fw-w4-soho', 'shield-pis-w1-quiz']);
    assert(a === b && b === c, 'Same cluster, different input order → same docId');
    assert(a === 'quiz_dup_fw-w2-wireless', 'Anchor is alphabetically first');
}

console.log('Anchor sanitization');
{
    const id = clusterDocId(['feh-08', 'feh-09', 'feh-10']);
    assert(id === 'quiz_dup_feh-08', 'Standard quizIds untouched');
}
{
    const id = clusterDocId(['weird/quizId', 'normal-id']);
    assert(id === 'quiz_dup_normal-id', 'Anchor picked alphabetically (slash sorts after letters)');
}
{
    // Long anchor — should truncate to 40 chars max in the docId-suffix portion
    const id = clusterDocId(['a-very-long-quiz-identifier-that-goes-past-forty-chars-easily']);
    const suffix = id.slice('quiz_dup_'.length);
    assert(suffix.length <= 40, 'Anchor truncated to 40 chars in docId');
}

console.log('2-quiz cluster anchoring');
{
    const a = clusterDocId(['cert', 'clh-015']);
    const b = clusterDocId(['clh-015', 'cert']);
    assert(a === b, '2-quiz cluster anchor stable across input order');
    assert(a === 'quiz_dup_cert', 'Picks alphabetically first');
}

console.log('Identical-array clusters get distinct docIds when their members are different');
{
    const c1 = clusterDocId(['a-quiz', 'b-quiz']);
    const c2 = clusterDocId(['c-quiz', 'd-quiz']);
    assert(c1 !== c2, 'Different cluster member sets produce different docIds');
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
