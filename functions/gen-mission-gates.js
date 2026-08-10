#!/usr/bin/env node
/*
 * @catalog what    Derives the SERVER-side revealGate spec for le-01-cold-horizon from the
 * @catalog what    mission data, and reports every mission it cannot derive rather than guessing.
 * @catalog run     node functions/gen-mission-gates.js [--write]
 * @catalog status  TOOL
 *
 * #306. The server has to evaluate revealGate against its OWN copy of the evidence, because a
 * client that can be edited to skip the work can be edited to claim it. That copy must be
 * GENERATED, never hand-maintained: a hand-written second copy of 15 missions' provenance
 * would drift from the missions on the first content edit, and a gate that drifts open is
 * worse than no gate. Same reasoning as CATALOG.md being generated.
 *
 * WHAT IS DERIVED, and it is most of it:
 *   sources      every sensor and corroborator with its provenance axes, read from the data
 *   family       'platform' if the source carries the SENSORS' shared value on the mission's
 *                trap axis, otherwise 'physical'. That is exactly what the missions mean by
 *                the word: a source that shares the dependency is not a second witness.
 *   shared-axis  the axis on which ALL sensors agree. That agreement IS each mission's trap,
 *                so it is discoverable rather than authored.
 *
 * WHAT IS NOT, and is reported instead of invented: a mission's SECOND necessary is not always
 * an independence claim. Mission 3's is "impossible-round-trip-found", a physical bound from
 * two-way ranging, which no axis comparison can express. Those missions are listed as NEEDS
 * AUTHORING and are emitted with no gate, which fails OPEN for them. That is deliberate and
 * must stay visible: silently emitting a wrong spec would gate a mission on the wrong thing
 * and reject correct answers, which is worse than the status quo it replaces.
 */
'use strict';
const fs = require('fs'), path = require('path');
const vm = require('vm');

const BOX = path.resolve(__dirname, '../_app/arena/boxes/le-01-cold-horizon');

/* The mission data is browser JS declaring `const ColdHorizonMissions` / `ColdHorizonConfig`,
   lexical bindings that are NOT on the global object. Evaluating in a vm context and reading
   the context's own scope is how a node script gets at them without editing the browser files
   to add a module export they do not otherwise need. */
function loadBrowserConst(file, name) {
    const src = fs.readFileSync(path.join(BOX, file), 'utf8');
    const ctx = { window: {}, document: { getElementById: () => null }, localStorage: undefined };
    vm.createContext(ctx);
    vm.runInContext(src + `\n;globalThis.__X = typeof ${name} !== 'undefined' ? ${name} : null;`, ctx);
    return ctx.__X || null;
}

const MISSIONS = loadBrowserConst('missions-held.js', 'ColdHorizonMissions');
const CONFIG = loadBrowserConst('config-shared.js', 'ColdHorizonConfig');
if (!MISSIONS || !CONFIG) {
    console.error('Could not load the mission data. Nothing written.');
    process.exit(1);
}

const missionList = CONFIG.missions || [];
const out = { boxId: 'le-01-cold-horizon', generatedFrom: 'missions-held.js + config-shared.js', gates: {} };
const needsAuthoring = [];
let derived = 0;

for (const m of missionList) {
    const data = MISSIONS[m.id];
    const gate = m.revealGate;
    if (!data || !gate) continue;

    const axes = data.axes || [];
    const sensors = data.sensors || [];
    const corrs = data.corroborators || [];
    if (!sensors.length || axes.length === 0) continue;

    /* The trap axis: the one where every sensor carries the same value. If several qualify,
       prefer the first declared, which is the mission's own ordering of what matters. */
    const trapAxis = axes.find(a => {
        const v = sensors[0][a];
        return v !== undefined && sensors.every(s => s[a] === v);
    });
    if (!trapAxis) { needsAuthoring.push(`m${m.id}: no axis is shared by all sensors`); continue; }
    const trapValue = sensors[0][trapAxis];

    const sources = {};
    const addSource = (s) => {
        const a = {};
        axes.forEach(ax => { if (s[ax] !== undefined) a[ax] = s[ax]; });
        sources[s.id] = {
            axes: a,
            // Shares the trap dependency => it is the platform speaking again, not a witness.
            family: (s[trapAxis] === trapValue) ? 'platform' : 'physical'
        };
    };
    sensors.forEach(addSource);
    corrs.forEach(addSource);

    const necessaries = Array.isArray(gate.necessaries) ? gate.necessaries : [];
    const findings = {};

    // First necessary: the shared dependency among the sensors. Derivable for every mission.
    if (necessaries[0]) {
        findings[necessaries[0]] = {
            type: 'shared-axis', axis: trapAxis, value: trapValue,
            minSources: Math.min(sensors.length, 3)
        };
    }

    /* Second necessary: only expressible when it really is an independence claim, i.e. some
       corroborator sits off the trap axis. Where the mission means something else (a physical
       bound, a replay result), say so and emit no gate rather than guess. */
    const independent = corrs.filter(c => c[trapAxis] !== undefined && c[trapAxis] !== trapValue);
    if (necessaries[1]) {
        if (independent.length) {
            findings[necessaries[1]] = { type: 'distinct-axis', axis: trapAxis };
        } else {
            needsAuthoring.push(
                `m${m.id} ${m.flagId}: "${necessaries[1]}" is not an axis comparison, needs an authored spec`);
            continue;   // emit NO gate for this flag: fail open, visibly
        }
    }

    out.gates[m.flagId] = {
        missionId: m.id,
        necessaries,
        corroboratorsRequired: gate.corroboratorsRequired || 0,
        corroboratorFamily: gate.corroboratorFamily || null,
        trapAxis, trapValue,
        findings,
        sources
    };
    derived++;
}

console.log(`\nDerived a server-side gate for ${derived} of ${missionList.length} missions.`);
if (needsAuthoring.length) {
    console.log(`\n${needsAuthoring.length} NEED AUTHORING and are emitted with NO gate (fails open, on purpose):`);
    needsAuthoring.forEach(x => console.log('  - ' + x));
    console.log('\n  A mission with no gate behaves exactly as it does today. That is the honest');
    console.log('  fallback: gating on a wrongly-guessed spec would reject correct answers.');
}

const dest = path.join(__dirname, 'mission-gates.generated.json');
if (process.argv.includes('--write')) {
    fs.writeFileSync(dest, JSON.stringify(out, null, 2));
    console.log(`\nWrote ${dest}`);
    console.log('Seed it to Firestore with seed-mission-gates.js (production write, needs authorisation).');
} else {
    console.log(`\nDry run. Pass --write to emit ${path.basename(dest)}.`);
    const first = Object.keys(out.gates)[0];
    if (first) console.log('\nSample:\n' + JSON.stringify({ [first]: out.gates[first] }, null, 2).slice(0, 900) + '\n...');
}
