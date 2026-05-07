/**
 * Smoke test for analytics-v2 token signing/verification.
 * These tests exercise the helper functions WITHOUT requiring Firebase.
 * Run: node functions/analytics-v2.test.js
 */

// We test the helpers directly without booting the Firebase Admin SDK.
// To do that, extract the helpers into a small replication of the module's
// signing logic. (The same crypto code runs in analytics-v2.js).

const crypto = require('crypto');

const SESSION_TOKEN_SECRET = 'test-secret-deterministic-for-tests-only';
const TOKEN_TTL_SEC = 15 * 60;
const TOKEN_GRACE_SEC = 2 * 60;

function _b64urlEncode(buf) {
    return Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function _b64urlDecode(str) {
    let s = str.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    return Buffer.from(s, 'base64');
}

function signToken(payload, secret = SESSION_TOKEN_SECRET) {
    const h = _b64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'HX-SESSION' }));
    const p = _b64urlEncode(JSON.stringify(payload));
    const data = `${h}.${p}`;
    const sig = crypto.createHmac('sha256', secret).update(data).digest();
    return `${data}.${_b64urlEncode(sig)}`;
}

function verifyToken(token, secret = SESSION_TOKEN_SECRET) {
    if (typeof token !== 'string' || token.split('.').length !== 3) return { ok: false, reason: 'malformed' };
    const [h, p, s] = token.split('.');
    const data = `${h}.${p}`;
    const expected = crypto.createHmac('sha256', secret).update(data).digest();
    const provided = _b64urlDecode(s);
    if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) {
        return { ok: false, reason: 'bad_signature' };
    }
    let payload;
    try { payload = JSON.parse(_b64urlDecode(p).toString('utf8')); } catch (e) { return { ok: false, reason: 'bad_payload' }; }
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== 'number') return { ok: false, reason: 'no_exp' };
    const expiredHard = (now > payload.exp + TOKEN_GRACE_SEC);
    const expired = (now > payload.exp);
    if (expiredHard) return { ok: false, reason: 'expired_hard', payload, expired: true };
    return { ok: true, payload, expired };
}

let passed = 0, failed = 0;
function assert(cond, label) {
    if (cond) { passed++; console.log(`  ✓ ${label}`); }
    else      { failed++; console.error(`  ✗ ${label}`); }
}

console.log('Token sign + verify round-trip');
{
    const now = Math.floor(Date.now() / 1000);
    const payload = { uid: 'u1', tenantId: 't1', classId: 'c1', sessionId: 's1', iat: now, exp: now + TOKEN_TTL_SEC };
    const t = signToken(payload);
    const v = verifyToken(t);
    assert(v.ok, 'fresh token verifies');
    assert(v.payload.uid === 'u1', 'uid round-trips');
    assert(v.payload.sessionId === 's1', 'sessionId round-trips');
    assert(!v.expired, 'fresh token is not expired');
}

console.log('Tampered signature detection');
{
    const now = Math.floor(Date.now() / 1000);
    const t = signToken({ uid: 'u1', tenantId: 't', classId: 'c', sessionId: 's', iat: now, exp: now + 60 });
    const tampered = t.slice(0, -4) + 'XXXX';
    const v = verifyToken(tampered);
    assert(!v.ok && v.reason === 'bad_signature', 'tampered signature rejected');
}

console.log('Wrong secret detection');
{
    const now = Math.floor(Date.now() / 1000);
    const t = signToken({ uid: 'u1', tenantId: 't', classId: 'c', sessionId: 's', iat: now, exp: now + 60 }, 'attacker-secret');
    const v = verifyToken(t);
    assert(!v.ok && v.reason === 'bad_signature', 'token signed with wrong secret rejected');
}

console.log('Expired in grace window');
{
    const now = Math.floor(Date.now() / 1000);
    // Expired 30 seconds ago — within 2-min grace window
    const t = signToken({ uid: 'u', tenantId: 't', classId: 'c', sessionId: 's', iat: now - 100, exp: now - 30 });
    const v = verifyToken(t);
    assert(v.ok && v.expired === true, 'in-grace expired token returns ok=true with expired=true');
}

console.log('Hard expired (past grace)');
{
    const now = Math.floor(Date.now() / 1000);
    // Expired 4 minutes ago — past grace
    const t = signToken({ uid: 'u', tenantId: 't', classId: 'c', sessionId: 's', iat: now - 400, exp: now - 240 });
    const v = verifyToken(t);
    assert(!v.ok && v.reason === 'expired_hard', 'hard-expired token rejected');
}

console.log('Malformed token rejected');
{
    assert(verifyToken('').ok === false, 'empty string rejected');
    assert(verifyToken('not.a.token.format.with.too.many.dots').ok === false, 'too many segments rejected');
    assert(verifyToken('only-two.segments').ok === false, 'two segments rejected');
}

console.log('Validator import + getGovernance round-trip');
{
    const { getGovernance, listLoadedTypes } = require('./schemas/events');
    const types = listLoadedTypes();
    assert(types.includes('nav.heartbeat'), 'nav.heartbeat is loaded');
    assert(types.includes('item.complete'), 'item.complete is loaded');
    const gov = getGovernance('nav.heartbeat');
    assert(gov && gov.dimension === 1, 'nav.heartbeat governance.dimension == 1');
    assert(gov && gov.status === 'instructor-facing', 'nav.heartbeat is instructor-facing');
    assert(getGovernance('made.up.event') === null, 'unknown type returns null governance');
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
