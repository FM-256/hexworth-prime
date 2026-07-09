#!/usr/bin/env node
/**
 * fieldguide-drift-check.js — drift tripwire between the Command Mastery mission
 * manifests and the Observatory field guides.
 *
 * The guides live in the web app (_app/components/MissionFieldGuide.js); the
 * missions live in bc1-baked manifests (_tools/sandbox-missions/<id>/mission.json).
 * MissionFieldGuide.attach() silently no-ops for unknown ids so a gap can never
 * crash a card — but silence is exactly how the "no teaching layer" defect shipped
 * the first time (operator escalation 2026-07-09). This script is the loud alarm:
 *
 *   - a mission WITHOUT a guide  -> FAIL (a beginner lands on riddle-briefs alone)
 *   - a guide WITHOUT a mission  -> FAIL (dead content; probable id rename)
 *
 * Run it in QC whenever a mission or MissionFieldGuide.js changes:
 *   node _tools/sandbox-missions/fieldguide-drift-check.js
 * Exits 0 on full coverage, 1 on any drift.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const MISSIONS_DIR = __dirname;
const COMPONENT = path.join(ROOT, '_app', 'components', 'MissionFieldGuide.js');

// Mission ids: ground truth from every mission.json in this directory.
const missionIds = fs.readdirSync(MISSIONS_DIR)
    .filter(d => fs.existsSync(path.join(MISSIONS_DIR, d, 'mission.json')))
    .map(d => JSON.parse(fs.readFileSync(path.join(MISSIONS_DIR, d, 'mission.json'), 'utf8')).id);

// Guide ids: load the real browser component with a window shim and read the
// _ids it exposes (no regex-parsing of source; we test what actually ships).
global.window = {};
// eslint-disable-next-line no-eval
eval(fs.readFileSync(COMPONENT, 'utf8'));
const guideIds = global.window.MissionFieldGuide._ids;

const missions = new Set(missionIds);
const guides = new Set(guideIds);
const missingGuides = missionIds.filter(id => !guides.has(id));
const orphanGuides = guideIds.filter(id => !missions.has(id));

console.log(`missions: ${missions.size}   guides: ${guides.size}`);
if (missingGuides.length) console.log('MISSING GUIDES (mission has no teaching layer):', missingGuides);
if (orphanGuides.length) console.log('ORPHANED GUIDES (no such mission; id renamed?):', orphanGuides);

if (missingGuides.length || orphanGuides.length) {
    console.log('DRIFT CHECK: FAIL');
    process.exit(1);
}
console.log('DRIFT CHECK: PASS (full 1:1 coverage)');
