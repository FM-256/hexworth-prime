/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-derive.js — keyed derivation of every per-student pick for the MD-100 final.
 *
 * Design spec: _docs/operations/md100-final-exam-spec-v2-2026-11-03.md, R1, 13.2 item 3, 13.5 item 3.
 *
 * WHY HMAC AND NOT netfinal's makeRng. netfinal seeds one mulberry32 stream from
 * xmur3(secret|uid|examId). Its state is 32 bits, and every visible WO value is drawn from it, so a
 * student who reads a handful of on-screen values can brute-force seed32 in about a minute and run
 * the stream forward to the hidden picks (Mallory, v1 review). Here the hidden picks never touch
 * that stream: each one is its own HMAC-SHA256 under a key derived from the bound secret, with the
 * inputs JSON-encoded so no separator in a uid can forge another label. Recovering the visible
 * stream's seed reveals only values that are already on screen.
 *
 *   K           = HMAC-SHA256(S, "hexworth/mdfinal/v1")
 *   H(label, i) = HMAC-SHA256(K, JSON.stringify([uid, examId, label, i]))
 *   hidden      = rejection-sampled uint32s from H(label,0), H(label,1), ...
 *   visibleSeed = hex(H("visible", 0)), fed to makeRng for on-screen values only
 *
 * THE VISIBLE STREAM IS VENDORED HERE, NOT IMPORTED (Nancy D1). xmur3 + mulberry32 are copied from
 * netfinal-core.js byte for byte, so a netfinal fix can never re-draw an MD lab between a rehearsal
 * and the sitting. Each generator section draws from its OWN named sub-stream (visibleStream(...,
 * 'wo'), later 'd2', 'd3', ...), so adding a field in a later day cannot shift an earlier value.
 * The golden test in mdfinal-core.test.js pins the output; a change to it needs a version bump.
 *
 * FAILS CLOSED. deriveKey() refuses a missing, short, low-variety or placeholder secret with one
 * generic message. There is no fallback to a dev seed and no read of process.env: the secret
 * arrives as an argument from the callable that has it bound, or the exam does not start. K is
 * never logged and never returned to a caller outside the engine.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var crypto = require('crypto');

    var DOMAIN = 'hexworth/mdfinal/v1';
    var MIN_SECRET_LENGTH = 32;
    var MIN_DISTINCT_CHARS = 8;

    /* Known non-secrets. The netfinal dev placeholder is the one most likely to be bound by mistake;
     * anything containing DEV_SEED is refused as a family. */
    var PLACEHOLDERS = Object.freeze(['netfinal-dev-seed-not-for-exams']);

    /* Builds the error the callable passes through as failed-precondition. Generic on purpose: the
     * message never says WHICH strength check failed, so it cannot be used to probe the secret. */
    function secretError() {
        var e = new Error('Exam seed secret is not configured.');
        e.code = 'failed-precondition';
        return e;
    }

    /* Trims the bound secret the same way every time (a trailing newline from `secrets:set` is the
     * usual difference) and returns null when it fails any strength check. */
    function normaliseSecret(secret) {
        if (typeof secret !== 'string') { return null; }
        var s = secret.trim();
        if (s.length < MIN_SECRET_LENGTH) { return null; }
        if (PLACEHOLDERS.indexOf(s) >= 0 || s.toUpperCase().indexOf('DEV_SEED') >= 0) { return null; }
        var distinct = {};
        var n = 0;
        for (var i = 0; i < s.length && n < MIN_DISTINCT_CHARS; i++) {
            if (!distinct[s[i]]) { distinct[s[i]] = true; n++; }
        }
        return n >= MIN_DISTINCT_CHARS ? s : null;
    }

    /* K = HMAC-SHA256(S, DOMAIN). Throws failed-precondition for a secret that fails the checks. */
    function deriveKey(secret) {
        var s = normaliseSecret(secret);
        if (s === null) { throw secretError(); }
        return crypto.createHmac('sha256', s).update(DOMAIN).digest();
    }

    /* One 32-byte block for (uid, examId, label, i). JSON encoding keeps the four fields apart. */
    function block(K, uid, examId, label, i) {
        if (!Buffer.isBuffer(K) || K.length !== 32) { throw new Error('mdfinal-derive: bad key'); }
        return crypto.createHmac('sha256', K)
            .update(JSON.stringify([String(uid), String(examId), String(label), i]))
            .digest();
    }

    /* Unbiased index in [0, n) from a buffer of uint32s, or -1 if every word was rejected. A word
     * v >= floor(2^32 / n) * n is rejected so no residue is favoured. */
    function pickIndex(bytes, n) {
        if (!(n >= 1 && n <= 4294967296 && Math.floor(n) === n)) { throw new Error('mdfinal-derive: bad n'); }
        var limit = Math.floor(4294967296 / n) * n;
        for (var off = 0; off + 4 <= bytes.length; off += 4) {
            var v = bytes.readUInt32BE(off);
            if (v < limit) { return v % n; }
        }
        return -1;
    }

    /* The hidden pick for `label` among n options. Walks H(label,0), H(label,1), ... until a word is
     * accepted; with n <= 2^16 a block of 8 words is rejected with probability below 2^-100, so the
     * cap of 16 blocks is a guard against a bug, never a real limit. */
    function hidden(K, uid, examId, label, n) {
        for (var i = 0; i < 16; i++) {
            var r = pickIndex(block(K, uid, examId, label, i), n);
            if (r >= 0) { return r; }
        }
        throw new Error('mdfinal-derive: no pick for ' + label);
    }

    /* `count` lowercase hex characters for `label` (BitLocker GUIDs, archive manifest hashes). */
    function hiddenHex(K, uid, examId, label, count) {
        var out = '';
        for (var i = 0; out.length < count; i++) { out += block(K, uid, examId, label, i).toString('hex'); }
        return out.slice(0, count);
    }

    /* `count` decimal digits for `label` (the BitLocker recovery password uses 48). */
    function hiddenDigits(K, uid, examId, label, count) {
        var out = '';
        for (var i = 0; i < count; i++) { out += String(hidden(K, uid, examId, label + '#' + i, 10)); }
        return out;
    }

    /* Seed string for the VISIBLE stream only (makeRng). Derived under K, so it is per student and
     * per exam, and recovering it reveals nothing hidden. */
    function visibleSeed(K, uid, examId) {
        return block(K, uid, examId, 'visible', 0).toString('hex');
    }

    /* ═══ VISIBLE STREAM (vendored from netfinal-core.js, see header) ═══ */

    /* String hash to a 32-bit seed. */
    function xmur3(str) {
        var h = 1779033703 ^ str.length;
        for (var i = 0; i < str.length; i++) {
            h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
            h = (h << 13) | (h >>> 19);
        }
        return function () {
            h = Math.imul(h ^ (h >>> 16), 2246822507);
            h = Math.imul(h ^ (h >>> 13), 3266489909);
            h ^= h >>> 16;
            return h >>> 0;
        };
    }

    /* 32-bit state generator returning floats in [0, 1). */
    function mulberry32(a) {
        return function () {
            a = (a + 1831565813) | 0;
            var t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    /* A reproducible stream with float/int/pick/shuffle (shuffle works on a copy). */
    function makeRng(seedStr) {
        var next = mulberry32(xmur3(String(seedStr))());
        var api = {
            float: next,
            int: function (lo, hi) { return lo + Math.floor(next() * (hi - lo + 1)); },
            pick: function (arr) { return arr[api.int(0, arr.length - 1)]; },
            shuffle: function (arr) {
                var a = arr.slice();
                for (var i = a.length - 1; i > 0; i--) {
                    var j = api.int(0, i);
                    var t = a[i]; a[i] = a[j]; a[j] = t;
                }
                return a;
            }
        };
        return api;
    }

    /* The named visible sub-stream for one sitting section ('wo', 'd2', ...). */
    function visibleStream(K, uid, examId, section) {
        return makeRng(visibleSeed(K, uid, examId) + '/' + String(section));
    }

    module.exports = {
        DOMAIN: DOMAIN, MIN_SECRET_LENGTH: MIN_SECRET_LENGTH, MIN_DISTINCT_CHARS: MIN_DISTINCT_CHARS,
        PLACEHOLDERS: PLACEHOLDERS,
        deriveKey: deriveKey, hidden: hidden, hiddenDigits: hiddenDigits, pickIndex: pickIndex,
        hiddenHex: hiddenHex, visibleSeed: visibleSeed, visibleStream: visibleStream, makeRng: makeRng
    };
})();
