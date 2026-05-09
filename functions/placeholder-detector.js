/**
 * Placeholder shape detection for quiz_keys answer arrays.
 *
 * Consolidates 5 prior copies (placeholder-drift-audit, quiz-quality-monitor,
 * diff-class-triage-2026-05-08, seed-placeholder-fix-2026-05-08,
 * seed-p0-batch-2026-05-08) into a single canonical module.
 *
 * Coverage (full union of prior detectors + closes documented blind spots):
 *   - all-zeros            (subset of all-same; reported only via classify())
 *   - all-same / period-1  (any value, len >= 1)        ← was missing in 2 callers
 *   - classic-cycling      (i % 4, len >= 4)
 *   - period-cycling       (period 2-6, default len >= 8; configurable)
 *   - near-cycling         (head matches i%4, last 1-2 may drift, len >= 5)
 *   - exact-match          (caller-supplied known-bad pattern list)
 *
 * IMPORTANT — overlap between isNearCycling and isPeriodCycling:
 *   isNearCycling is a drift-tolerant SUPERSET of period-4 (its head condition
 *   matches i%4). It detects cases that period-cycling REJECTS due to drift
 *   in the last 1-2 indices. Callers that want full period-4 coverage MUST
 *   call both, OR use the union helpers (classify / isPlaceholder).
 *
 * IMPORTANT — isExactPlaceholder requires caller-supplied patterns:
 *   The patterns list is domain-specific (only seed-p0-batch has one today).
 *   Callers without a list should not call isExactPlaceholder directly.
 *   isPlaceholder(arr, opts) silently skips exact-match when opts.patterns
 *   is absent — never throws on missing patterns.
 *
 * Default opts.minLength = 8 for period-cycling matches prior production
 * behavior. Audit scripts may lower (e.g. { minLength: 5 }) for stricter
 * offline triage; production CF should keep the default.
 */

'use strict';

function isAllZerosInternal(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return false;
    return arr.every(v => v === 0);
}

function isAllSame(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return false;
    return arr.every(v => v === arr[0]);
}

function isClassicCycling(arr) {
    if (!Array.isArray(arr) || arr.length < 4) return false;
    return arr.every((v, i) => v === (i % 4));
}

function isPeriodCycling(arr, opts) {
    const minLength = (opts && Number.isInteger(opts.minLength)) ? opts.minLength : 8;
    if (!Array.isArray(arr) || arr.length < minLength) return false;
    for (let p = 2; p <= 6; p++) {
        if (arr.length < p * 2) continue;
        const period = arr.slice(0, p);
        if (arr.every((v, i) => v === period[i % p])) return true;
    }
    return false;
}

function isNearCycling(arr) {
    if (!Array.isArray(arr) || arr.length < 5) return false;
    const head = arr.slice(0, arr.length - 2);
    return head.every((v, i) => v === (i % 4));
}

function isExactPlaceholder(arr, patterns) {
    if (!Array.isArray(arr) || !Array.isArray(patterns)) return false;
    return patterns.some(p =>
        Array.isArray(p) && p.length === arr.length && p.every((v, i) => v === arr[i])
    );
}

function classify(arr, opts) {
    if (!Array.isArray(arr) || arr.length === 0) return 'EMPTY';
    if (isAllZerosInternal(arr)) return 'ALL-ZEROS';
    if (isAllSame(arr)) return 'ALL-SAME';
    if (opts && opts.patterns && isExactPlaceholder(arr, opts.patterns)) return 'EXACT-MATCH';
    if (isClassicCycling(arr)) return 'CLASSIC-CYCLING';
    if (isPeriodCycling(arr, opts)) return 'PERIOD-CYCLING';
    if (isNearCycling(arr)) return 'NEAR-CYCLING';
    return 'REAL';
}

function isPlaceholder(arr, opts) {
    const c = classify(arr, opts);
    return c !== 'EMPTY' && c !== 'REAL';
}

module.exports = {
    isAllSame,
    isClassicCycling,
    isPeriodCycling,
    isNearCycling,
    isExactPlaceholder,
    classify,
    isPlaceholder,
};
