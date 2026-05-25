#!/usr/bin/env node
/**
 * test-hex-ai-state-classifier.js — unit tests for the pure ambient-
 * state classifier. Run from the functions/ directory:
 *
 *     node test-hex-ai-state-classifier.js
 *
 * No Firebase context required.
 */
const { classifyAmbientState } = require('./hex-ai-state-classifier');

const NOW = 1_700_000_000_000;  // fixed epoch for deterministic tests

const t = {
    pass: 0, fail: 0, fails: [],
    assertEq(actual, expected, label) {
        if (actual === expected) {
            this.pass++;
            console.log(`  PASS  ${label}`);
        } else {
            this.fail++;
            this.fails.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
            console.log(`  FAIL  ${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
        }
    },
};

function attempt(secondsAgo, flagId) {
    return { ts: NOW - secondsAgo * 1000, flagId };
}
function capture(secondsAgo, flagId) {
    return { ts: NOW - secondsAgo * 1000, flagId };
}

// ─── Test cases ───────────────────────────────────────────────

// calm: no attempts
{
    const r = classifyAmbientState({
        attempts: [], captures: [], capturedFlagIds: new Set(), nowMs: NOW,
    });
    t.assertEq(r.state, 'calm', 'no attempts → calm');
}

// calm: most-recent attempt was correct (captured), but capture > 60s ago
// (so celebrating window doesn't fire)
{
    const r = classifyAmbientState({
        attempts: [attempt(120, 'flag-a')],   // 2 min ago
        captures: [capture(120, 'flag-a')],   // 2 min ago — outside 60s celebrate window
        capturedFlagIds: new Set(['flag-a']),
        nowMs: NOW,
    });
    t.assertEq(r.state, 'calm', 'most-recent correct (outside celebrate window) → calm');
}

// celebrating: capture in last 60s
{
    const r = classifyAmbientState({
        attempts: [attempt(45, 'flag-a')],
        captures: [capture(45, 'flag-a')],
        capturedFlagIds: new Set(['flag-a']),
        nowMs: NOW,
    });
    t.assertEq(r.state, 'celebrating', 'capture <60s → celebrating');
}

// celebrating beats calm priority
{
    const r = classifyAmbientState({
        attempts: [attempt(45, 'flag-a')],
        captures: [capture(45, 'flag-a')],
        capturedFlagIds: new Set(['flag-a']),
        nowMs: NOW,
    });
    t.assertEq(r.state, 'celebrating', 'celebrating priority over calm');
}

// noticing: 2 incorrect in 5min
{
    const r = classifyAmbientState({
        attempts: [
            attempt(30, 'flag-wrong-2'),
            attempt(60, 'flag-wrong-1'),
        ],
        captures: [],
        capturedFlagIds: new Set(),
        nowMs: NOW,
    });
    t.assertEq(r.state, 'noticing', '2 incorrect in 5min → noticing');
}

// active: 4 incorrect in 10min
{
    const r = classifyAmbientState({
        attempts: [
            attempt(60,  'f1'),
            attempt(120, 'f2'),
            attempt(180, 'f3'),
            attempt(240, 'f4'),
        ],
        captures: [],
        capturedFlagIds: new Set(),
        nowMs: NOW,
    });
    t.assertEq(r.state, 'active', '4 incorrect in 10min → active');
}

// insistent: 6 incorrect in 20min
{
    const r = classifyAmbientState({
        attempts: [
            attempt(60, 'f1'),
            attempt(180, 'f2'),
            attempt(300, 'f3'),
            attempt(420, 'f4'),
            attempt(540, 'f5'),
            attempt(720, 'f6'),
        ],
        captures: [],
        capturedFlagIds: new Set(),
        nowMs: NOW,
    });
    t.assertEq(r.state, 'insistent', '6 incorrect in 20min → insistent');
}

// active downgrades to calm on a CORRECT most-recent
{
    const r = classifyAmbientState({
        attempts: [
            attempt(10, 'f-correct'),    // most recent, in captured set
            attempt(120, 'f1'),
            attempt(180, 'f2'),
            attempt(240, 'f3'),
            attempt(300, 'f4'),
        ],
        captures: [capture(10, 'f-correct')],
        capturedFlagIds: new Set(['f-correct']),
        nowMs: NOW,
    });
    // capture was at 10s ago — within 60s window → celebrating wins
    t.assertEq(r.state, 'celebrating', 'recent capture beats accumulated wrongs');
}

// active downgrades to calm if most-recent correct AND no capture in 60s
{
    const r = classifyAmbientState({
        attempts: [
            attempt(120, 'f-correct'),   // older but most-recent in attempts
            attempt(180, 'f1'),
            attempt(240, 'f2'),
        ],
        captures: [capture(120, 'f-correct')],
        capturedFlagIds: new Set(['f-correct']),
        nowMs: NOW,
    });
    t.assertEq(r.state, 'calm', 'most-recent correct but capture >60s → calm');
}

// scan attempts (flagId='__scan__') count as incorrect
{
    const r = classifyAmbientState({
        attempts: [
            { ts: NOW - 30000, flagId: '__scan__' },
            { ts: NOW - 60000, flagId: '__scan__' },
        ],
        captures: [],
        capturedFlagIds: new Set(),
        nowMs: NOW,
    });
    t.assertEq(r.state, 'noticing', '__scan__ attempts count as incorrect');
}

// null flagId counts as incorrect
{
    const r = classifyAmbientState({
        attempts: [
            { ts: NOW - 30000, flagId: null },
            { ts: NOW - 60000, flagId: null },
        ],
        captures: [],
        capturedFlagIds: new Set(),
        nowMs: NOW,
    });
    t.assertEq(r.state, 'noticing', 'null flagId attempts count as incorrect');
}

// attempts older than 5min don't count toward noticing
{
    const r = classifyAmbientState({
        attempts: [
            attempt(600, 'f1'),   // 10 min ago
            attempt(700, 'f2'),   // ~12 min ago
        ],
        captures: [],
        capturedFlagIds: new Set(),
        nowMs: NOW,
    });
    // ≥2 incorrect in 10min → active threshold not met (need 4)
    // Falls through to noticing check: 2 in 5min? No. → calm
    t.assertEq(r.state, 'calm', 'old attempts (>5min) don\'t trip noticing');
}

// thresholds: 5 incorrect in 10min (not enough for insistent, enough for active)
{
    const r = classifyAmbientState({
        attempts: [
            attempt(60, 'f1'),
            attempt(180, 'f2'),
            attempt(300, 'f3'),
            attempt(420, 'f4'),
            attempt(540, 'f5'),
        ],
        captures: [],
        capturedFlagIds: new Set(),
        nowMs: NOW,
    });
    t.assertEq(r.state, 'active', '5 incorrect in 10min → active (not insistent)');
}

// captures > 0 disqualifies insistent + active states
{
    const r = classifyAmbientState({
        attempts: [
            attempt(60,  'f1'),
            attempt(180, 'f2'),
            attempt(300, 'f3'),
            attempt(420, 'f4'),
            attempt(540, 'f5'),
            attempt(720, 'f6'),
        ],
        captures: [capture(900, 'f-old')],   // capture 15 min ago — within 20min window
        capturedFlagIds: new Set(['f-old']),
        nowMs: NOW,
    });
    // 6 incorrect in 20min — but captures.length > 0 disqualifies insistent
    // 4+ incorrect in 10min — but captures.length > 0 disqualifies active
    // 2+ incorrect in 5min — noticing applies
    t.assertEq(r.state, 'noticing', 'any capture in window disqualifies insistent/active');
}

// classifier returns full window_summary
{
    const r = classifyAmbientState({
        attempts: [
            attempt(60, 'f1'),
            attempt(180, 'f2'),
            attempt(700, 'f3'),    // older — only counts toward 20min
        ],
        captures: [],
        capturedFlagIds: new Set(),
        nowMs: NOW,
    });
    t.assertEq(r.window_summary.incorrect_5min, 2, 'incorrect_5min count');
    t.assertEq(r.window_summary.incorrect_10min, 2, 'incorrect_10min count');
    t.assertEq(r.window_summary.incorrect_20min, 3, 'incorrect_20min count');
}

// color + prompt + pulse correctness for each state
{
    const states = ['calm', 'noticing', 'active', 'insistent', 'celebrating'];
    const expectedColors = ['#67e8f9', '#fbbf24', '#fb923c', '#ef4444', '#a78bfa'];
    states.forEach((state, i) => {
        const { STATE_CONFIG } = require('./hex-ai-state-classifier');
        t.assertEq(STATE_CONFIG[state].color, expectedColors[i], `${state} color`);
    });
}

// ─── Summary ──────────────────────────────────────────────────
console.log();
const total = t.pass + t.fail;
console.log(`=== ${t.pass}/${total} pass, ${t.fail} fail ===`);
process.exit(t.fail > 0 ? 1 : 0);
