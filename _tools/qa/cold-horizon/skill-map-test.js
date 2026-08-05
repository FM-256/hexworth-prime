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
  'verdict_direct':   'You should trust TH-2. TH-1 and TH-3 share a bus and a clock.',
  'verdict_option':   'The answer is TH-2, corroborated by your own infrared reading.',
  'verdict_trap':     'Do not pick it because it is the odd one out.',
  'teaching_general': 'Majority voting assumes the channels fail independently. When two share infrastructure a single fault can carry both.',
  'teaching_oob':     'Out-of-band verification means a reading that does not travel the same path as the ones you distrust.',
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

ck('blocks the verdict, stated directly',      r.blocked.verdict_direct === true);
ck('blocks the verdict in the option wording', r.blocked.verdict_option === true);
ck('blocks pre-empting the odd-one-out trap',  r.blocked.verdict_trap === true);

ck('does NOT block general teaching about majority voting', r.blocked.teaching_general === false);
ck('does NOT block general teaching about out-of-band checks', r.blocked.teaching_oob === false);

// The A/B: prove the map is what closes it, not something else.
const leaksWithout = ['verdict_direct','verdict_option','verdict_trap'].every(k => r.blocked_without_map[k] === false);
ck('WITHOUT the map every verdict leak is allowed (the gap was real)', leaksWithout,
   JSON.stringify(r.blocked_without_map));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
