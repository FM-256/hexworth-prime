/**
 * Smoke test for the event payload validator.
 * Run: node functions/schemas/events/validator.test.js
 */

const { validateEventPayload } = require('./validator');

let passed = 0, failed = 0;

function assert(cond, label) {
    if (cond) { passed++; console.log(`  ✓ ${label}`); }
    else      { failed++; console.error(`  ✗ ${label}`); }
}

console.log('nav.session_start');
{
    const ok = validateEventPayload('nav.session_start', {
        entryUrl: 'https://hexworth.com/tenant/instructor.html',
        consentVersion: 'v2.0',
    });
    assert(ok.valid, 'valid payload accepted');
}
{
    const bad = validateEventPayload('nav.session_start', {});
    assert(!bad.valid && bad.errors.some(e => e.message.includes('required')),
           'missing required entryUrl rejected');
}
{
    const bad = validateEventPayload('nav.session_start', {
        entryUrl: 'http://x',
        randomField: 'should not be here',
    });
    assert(!bad.valid && bad.errors.some(e => e.message.includes('additionalProperties')),
           'unexpected field rejected');
}

console.log('nav.heartbeat');
{
    const ok = validateEventPayload('nav.heartbeat', {
        isActive: true,
        currentUrl: 'https://hexworth.com/x',
        viewportPercentVisible: 0.85,
    });
    assert(ok.valid, 'valid heartbeat accepted');
}
{
    const bad = validateEventPayload('nav.heartbeat', {
        isActive: 'yes',
    });
    assert(!bad.valid && bad.errors.some(e => e.message.includes('expected type boolean')),
           'wrong type for isActive rejected');
}
{
    const bad = validateEventPayload('nav.heartbeat', {
        isActive: true,
        viewportPercentVisible: 1.5,
    });
    assert(!bad.valid && bad.errors.some(e => e.message.includes('maximum')),
           'viewportPercentVisible > 1 rejected');
}

console.log('item.start');
{
    const ok = validateEventPayload('item.start', {
        itemId: 'fw-w1-logical-quiz',
        itemType: 'quiz',
        isResume: false,
    });
    assert(ok.valid, 'valid item.start accepted');
}
{
    const bad = validateEventPayload('item.start', {
        itemId: 'x',
        itemType: 'banana',
    });
    assert(!bad.valid && bad.errors.some(e => e.message.includes('enum')),
           'invalid itemType rejected (enum)');
}

console.log('item.complete with nullable score');
{
    const ok = validateEventPayload('item.complete', {
        itemId: 'mod-x',
        itemType: 'module',
        totalActiveMs: 60000,
        score: null,
        scoreScale: null,
        passed: null,
    });
    assert(ok.valid, 'item.complete with null score accepted');
}
{
    const ok = validateEventPayload('item.complete', {
        itemId: 'q-x',
        itemType: 'quiz',
        totalActiveMs: 60000,
        score: 87,
        scoreScale: 'percent',
        passed: true,
    });
    assert(ok.valid, 'item.complete with numeric score accepted');
}

console.log('unknown event type');
{
    const bad = validateEventPayload('made.up.event', { x: 1 });
    assert(!bad.valid && bad.errors.some(e => e.message.includes('unknown event type')),
           'unknown event type rejected');
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
