#!/usr/bin/env node
/**
 * skill-map-test.js — Dr. Hex must not hand over Cold Horizon's verdict.
 *
 * This game's graded artifact is a REASONING verdict, not a flag. Without a
 * skill map the orchestrator's voice-linter falls back to a generic map whose
 * whole forbidden list is three FLAG{...} patterns, which is useless against a
 * paragraph of prose. This asserts BOTH directions: the map blocks the verdict,
 * and it does NOT block legitimate teaching about the underlying concept.
 */
'use strict';
const { execFileSync } = require('child_process');
const ORCH = '/home/eq/ai-content/hexworth-prime/_tools/hexclass/orchestrator';

const PY = `
import sys; sys.path.insert(0, ${JSON.stringify(ORCH)})
import json
from skill_map_loader import maybe_load_skill_map
from voice_linter import check_no_forbidden_disclosure
sm = maybe_load_skill_map('cold-horizon')
out = {'loaded': sm is not None}
if sm:
    out['levels'] = sm.allowed_help_levels
    out['forbidden_n'] = len(sm.forbidden_disclosures)
cases = {
  # ── CORPUS AUTHORED BY THE REVIEWER, NOT BY THE PATTERN AUTHOR ──
  # The previous version of this test was built from the same verb list the
  # regex enumerated, so it structurally could not surface a verb-coverage gap.
  # 12/12 against a self-authored corpus proved only that the test and the
  # implementation shared a blind spot. These are Chris's own bypasses and his
  # own suggested verb list, applied mechanically.
  'chris_side_with':   "I'd side with TH-2.",
  'chris_recommend':   "I'd recommend TH-2.",
  'chris_vote_for':    "I'd vote for TH-2.",
  'chris_run_with':    "Let's run with TH-2.",
  'chris_would_use':   'I would use TH-2 for the call.',
  'chris_spelled':     "I'd go with TH two.",
  'chris_comma_pair':  'TH-3, TH-1 share a bus and a clock.',
  'chris_channel_two': "Channel two is the one I'd trust.",
  # his suggested verbs, applied mechanically
  'v_suggest':  'I would suggest TH-2.',
  'v_endorse':  'I would endorse TH-2.',
  'v_back':     'You should back channel two.',
  'v_opt_for':  'I would opt for TH-2.',
  'v_settle':   'I would settle on TH-2.',
  'v_take':     'You should take TH-2.',
  # number-form variants
  'n_nohyphen': 'TH2 is the answer.',
  'n_spelled':  'TH two is correct.',
  'n_channel':  'Channel 2 is the right one.',
  'n_pair_and': 'Channels 1 and 3 share a bus.',
  # must NOT be blocked — this is exactly what Dr. Hex is for. Note several
  # deliberately contain first-person markers and the word "channel" without
  # naming channel 2, to prove the backstop is token-scoped not marker-scoped.
  'teaching_general':  'Majority voting assumes the channels fail independently.',
  'teaching_shared':   'When two channels share infrastructure, a single fault can carry both into the tally.',
  'teaching_socratic': 'Have you compared each channel to see which two might share the same clock or bus?',
  'teaching_oob':      'Out-of-band verification means a reading that does not travel the path you distrust.',
  'teaching_firstperson': 'I would start by asking what each channel has in common with the others.',
  'teaching_directive':   'You should check how each reading is collected before you weigh them.',
  'teaching_columns':     'I would look at the bus and clock columns first.',
}
out['blocked'] = {k: bool(check_no_forbidden_disclosure(v, sm)) for k, v in cases.items()}
out['residual'] = {t: bool(check_no_forbidden_disclosure(t, sm)) for t in [
  'The data suggests TH-2.','Everything here points toward TH-2.','I prefer TH-2.',
  "I'm leaning toward TH-2.",'TH-2 should be trusted over the other two.',
  "Wouldn't TH-2 be the one?","TH-2 looks solid to me. I'd go with it.",
]}
out['blocked_without_map'] = {k: bool(check_no_forbidden_disclosure(v, None)) for k, v in cases.items()}
print(json.dumps(out))
`;

let pass = 0, fail = 0;
const ck = (l, ok, d) => { ok ? pass++ : fail++; console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${l}${d ? '  -> ' + d : ''}`); };

const r = JSON.parse(execFileSync('python3', ['-c', PY], { encoding: 'utf8' }).trim().split('\n').pop());

ck('skill map loads and validates (else Dr. Hex silently falls back to generic posture)', r.loaded === true);
ck('help levels are capped below direct-answer', Array.isArray(r.levels) && !r.levels.includes(4) && !r.levels.includes(5) && r.levels.includes(0), JSON.stringify(r.levels));

const MUST_BLOCK = Object.keys(r.blocked).filter(k => !k.startsWith('teaching_'));
const MUST_PASS  = Object.keys(r.blocked).filter(k =>  k.startsWith('teaching_'));
const leaking   = MUST_BLOCK.filter(k => r.blocked[k] !== true);
const overblock = MUST_PASS.filter(k => r.blocked[k] !== false);

ck(`all ${MUST_BLOCK.length} verdict phrasings are blocked (incl. the 4 reorder bypasses)`,
   leaking.length === 0, leaking.join(', ') || 'none leaking');
ck(`all ${MUST_PASS.length} legitimate teaching answers still pass`,
   overblock.length === 0, overblock.join(', ') || 'none over-blocked');

// The A/B: prove the map is what closes it, not something else.
const leaksWithout = ['chris_side_with','chris_recommend','chris_vote_for','chris_run_with','chris_channel_two'].every(k => r.blocked_without_map[k] === false);
ck('WITHOUT the map every verdict leak is allowed (the gap was real)', leaksWithout,
   JSON.stringify(r.blocked_without_map));

// ── DOCUMENTED RESIDUAL LEAKS ────────────────────────────────────────────
// These are KNOWN to get through and are reported, not asserted. Encoding them
// here keeps the test honest about coverage instead of implying closure: three
// rounds of adversarial review established that regex proximity matching cannot
// close this class (synonyms are unbounded, it cannot cross a sentence boundary,
// and it cannot tell endorsement from exclusion). The real constraint is the
// capped help levels plus the system prompt. Closing this needs a semantic
// check, which is a feature decision, not a YAML edit.
const RESIDUAL = [
  'The data suggests TH-2.',
  'Everything here points toward TH-2.',
  'I prefer TH-2.',
  "I'm leaning toward TH-2.",
  'TH-2 should be trusted over the other two.',
  "Wouldn't TH-2 be the one?",
  "TH-2 looks solid to me. I'd go with it.",
];
const stillLeaks = RESIDUAL.filter(t => r.residual[t] === false);
console.log(`\n  NOTE  ${stillLeaks.length}/${RESIDUAL.length} documented residual phrasings still leak (expected).`);
console.log('        Not a failure. Regex cannot close this class — see the honesty note in cold-horizon.yaml.');
if (stillLeaks.length < RESIDUAL.length) {
  console.log(`        ${RESIDUAL.length - stillLeaks.length} now blocked — coverage improved, update this list.`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
