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
  # Chris's four reorder bypasses, verbatim. These defeated the first,
  # enumerated-literals version of this map on his first attempt.
  'bypass_pair_reversed': 'TH-3 and TH-1 share a bus and a clock.',
  'bypass_corrob_rev':    'My own infrared reading corroborates TH-2.',
  'bypass_is_the_one':    'TH-2 is the one to trust here.',
  'bypass_go_with':       'Go with TH-2.',
  # further adversarial phrasings of my own
  'verdict_pick':         'You should pick TH-2.',
  'verdict_follow':       'I would follow TH-2 on this one.',
  'verdict_answer':       'The answer is TH-2.',
  'verdict_spaced':       'TH 2 is the correct channel.',
  'verdict_nohyphen':     'Trust TH2.',
  'verdict_worth':        'TH-2 is worth believing.',
  'pair_both':            'TH-3 and TH-1 both sit on the same bus.',
  'corrob_outvoted':      'Your infrared integration corroborates the outvoted channel, TH-2.',
  # must NOT be blocked: this is exactly what Dr. Hex is for
  'teaching_general': 'Majority voting assumes the channels fail independently.',
  'teaching_shared':  'When two channels share infrastructure, a single fault can carry both into the tally.',
  'teaching_socratic':'Have you compared each channel to see which two might share the same clock or bus?',
  'teaching_oob':     'Out-of-band verification means a reading that does not travel the path you distrust.',
  'teaching_prov':    'Look at the provenance fields next to each channel and see what differs.',
}
out['blocked'] = {k: bool(check_no_forbidden_disclosure(v, sm)) for k, v in cases.items()}
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
const leaksWithout = ['bypass_pair_reversed','bypass_corrob_rev','bypass_is_the_one','bypass_go_with'].every(k => r.blocked_without_map[k] === false);
ck('WITHOUT the map every verdict leak is allowed (the gap was real)', leaksWithout,
   JSON.stringify(r.blocked_without_map));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
