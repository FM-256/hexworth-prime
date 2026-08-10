#!/usr/bin/env node
/*
 * @catalog what    Unit tests for the server-side revealGate evaluator (#306).
 * @catalog run     node functions/test-mission-gates.js
 * @catalog status  GATE
 *
 * Pure logic, no emulator, no network, runs in milliseconds. This decides whether a student
 * gets credit, so the adversarial cases matter more than the happy path: a gate that can be
 * satisfied by naming any two sources, or by claiming a finding without the evidence, is
 * worse than no gate because it looks like a control.
 */
'use strict';
const { verifyFinding, evaluateGate, refusalMessage } = require('./mission-gates');

let pass = 0, fail = 0;
function t(name, cond, detail) {
    if (cond) { pass++; console.log(`  PASS  ${name}`); }
    else { fail++; console.log(`  FAIL  ${name}${detail ? '  -> ' + detail : ''}`); }
}

/* Mission 6, Dead Air. Three named channels that all terminate on one Ka front end, plus an
   emergency beacon on a genuinely separate chain. Taken from the shipped mission data. */
const SOURCES = {
    'ch-primary':     { family: 'platform', axes: { rfChain: 'ka-transponder-1', powerDomain: 'main bus' } },
    'ch-backup':      { family: 'platform', axes: { rfChain: 'ka-transponder-1', powerDomain: 'main bus' } },
    'ch-relay':       { family: 'platform', axes: { rfChain: 'ka-transponder-1', powerDomain: 'main bus' } },
    'ch-emergency':   { family: 'physical', axes: { rfChain: 's-band-omni',      powerDomain: 'survival bus' } },
    'ch-rf-topology': { family: 'physical', axes: { rfChain: 'ops-walkdown',     powerDomain: 'ground document' } },
    'ch-status':      { family: 'platform', axes: { rfChain: 'ka-transponder-1', powerDomain: 'main bus' } }
};

const SHARED = { type: 'shared-axis', axis: 'rfChain', value: 'ka-transponder-1', minSources: 3 };
const DISTINCT = { type: 'distinct-axis', axis: 'rfChain' };

console.log('\n--- verifyFinding ---');

t('the true grouping is accepted',
  verifyFinding(SHARED, { sources: ['ch-primary', 'ch-backup', 'ch-relay'] }, SOURCES).ok);

t('a LARGER true grouping is accepted, not punished for finding more',
  verifyFinding(SHARED, { sources: ['ch-primary', 'ch-backup', 'ch-relay', 'ch-status'] }, SOURCES).ok);

// The core cheat: name too few and claim the dependency anyway.
t('two sources cannot satisfy a three-source grouping',
  !verifyFinding(SHARED, { sources: ['ch-primary', 'ch-backup'] }, SOURCES).ok);

// The other core cheat: name three sources that do NOT actually share the axis.
t('a FALSE grouping is rejected',
  !verifyFinding(SHARED, { sources: ['ch-primary', 'ch-backup', 'ch-emergency'] }, SOURCES).ok);

/* An incidental match on a DIFFERENT value must not satisfy a gate about this dependency.
   Without the value check, any coincidentally-equal axis would open the gate. */
t('a real grouping on the WRONG value is rejected',
  !verifyFinding({ type: 'shared-axis', axis: 'powerDomain', value: 'main bus', minSources: 2 },
                 { sources: ['ch-emergency', 'ch-rf-topology'] }, SOURCES).ok);

t('an unknown source id is rejected rather than ignored',
  !verifyFinding(SHARED, { sources: ['ch-primary', 'ch-backup', 'ch-nope'] }, SOURCES).ok);

t('an empty claim is rejected',
  !verifyFinding(SHARED, { sources: [] }, SOURCES).ok);

t('a missing claim object does not throw',
  !verifyFinding(SHARED, null, SOURCES).ok);

t('an unknown finding spec is rejected',
  !verifyFinding(null, { sources: ['ch-primary'] }, SOURCES).ok);

t('an unsupported finding type is rejected',
  !verifyFinding({ type: 'vibes', axis: 'rfChain' }, { sources: ['ch-primary'] }, SOURCES).ok);

console.log('\n--- distinct-axis (independence) ---');

t('genuinely different chains are accepted',
  verifyFinding(DISTINCT, { sources: ['ch-emergency', 'ch-primary'] }, SOURCES).ok);

t('two sources on the SAME chain are not independent',
  !verifyFinding(DISTINCT, { sources: ['ch-primary', 'ch-backup'] }, SOURCES).ok);

t('independence is a claim about a PAIR, not a crowd',
  !verifyFinding(DISTINCT, { sources: ['ch-emergency', 'ch-primary', 'ch-backup'] }, SOURCES).ok);

console.log('\n--- evaluateGate ---');

const GATE = { necessaries: ['three-channels-one-front-end', 'emergency-beacon-separate-chain'],
               corroboratorsRequired: 1, corroboratorFamily: 'physical' };

t('an empty ledger does not satisfy the gate',
  !evaluateGate(GATE, { findings: {}, corroborators: {} }, SOURCES).satisfied);

t('THE #306 CASE: a flag submitted on frame one is refused',
  !evaluateGate(GATE, {}, SOURCES).satisfied);

t('necessaries alone are not enough without a corroborator',
  !evaluateGate(GATE, { findings: { 'three-channels-one-front-end': true,
                                    'emergency-beacon-separate-chain': true },
                        corroborators: {} }, SOURCES).satisfied);

/* The family requirement is the mission's whole point: a second source that could have failed
   with the first is not a second source. A platform corroborator must not satisfy a gate that
   demands a physical one. */
t('a corroborator from the WRONG family does not count',
  !evaluateGate(GATE, { findings: { 'three-channels-one-front-end': true,
                                    'emergency-beacon-separate-chain': true },
                        corroborators: { 'ch-status': true } }, SOURCES).satisfied);

t('the complete ledger satisfies the gate',
  evaluateGate(GATE, { findings: { 'three-channels-one-front-end': true,
                                   'emergency-beacon-separate-chain': true },
                       corroborators: { 'ch-rf-topology': true } }, SOURCES).satisfied);

t('a flag with NO gate declared is not blocked',
  evaluateGate(null, {}, SOURCES).satisfied);

console.log('\n--- refusal message ---');

const refused = evaluateGate(GATE, {}, SOURCES);
const msg = refusalMessage(refused);
/* The missing necessaries ARE the answers. Naming them in the refusal would hand the player
   the finding the mission exists to make them discover. */
t('the refusal does NOT name the missing findings',
  msg.indexOf('three-channels') === -1 && msg.indexOf('beacon') === -1, msg);
t('the refusal still tells an honest player they have work left',
  /outstanding/.test(msg) && /\d/.test(msg), msg);

console.log(`\n${pass}/${pass + fail} checks passed`);
process.exit(fail ? 1 : 0);
