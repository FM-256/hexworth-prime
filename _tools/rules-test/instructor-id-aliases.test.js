#!/usr/bin/env node
'use strict';
/**
 * @catalog what    Proves the instructor dashboard counts a Network+ completion under EITHER the
 *                  legacy web-<name> id or the migrated web-np-<name>-<type> id, and never twice
 * @catalog run     node _tools/rules-test/instructor-id-aliases.test.js
 * @catalog status  TOOL
 *
 * WHY THIS EXISTS. NP-24 repointed 28 hub data-module ids to what ModuleProgress.complete()
 * actually writes. Nancy caught that _app/tenant/network-plus-map.js still listed all 28 under
 * their OLD ids, so every completion recorded from that point on would have been invisible on the
 * instructor's Course Progress view. Migrating the map alone would have produced the MIRROR of
 * that bug: new completions visible, every historical one gone, because a student's stored record
 * is never rewritten (copyLegacyKey runs only when someone reopens the page, and never writes
 * back from new to old).
 *
 * So the map carries an idAliases table and the dashboard expands it once on load. This test
 * pins the behaviour that makes that safe: BOTH populations count, and neither counts twice.
 *
 * It RUNS THE SHIPPED FUNCTION, extracted from instructor.html, rather than a copy of it. A
 * reimplementation here would pass while production drifted.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');

function extractShipped(file, fnName) {
    const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const start = src.indexOf(`function ${fnName}(`);
    if (start === -1) throw new Error(`${fnName} not found in ${file} — did it get renamed?`);
    let depth = 0, i = src.indexOf('{', start);
    const open = i;
    for (; i < src.length; i++) {
        if (src[i] === '{') depth++;
        else if (src[i] === '}') { depth--; if (depth === 0) break; }
    }
    return src.slice(start, i + 1);
}

// The real map, evaluated as the browser would.
const mapSrc = fs.readFileSync(path.join(ROOT, '_app/tenant/network-plus-map.js'), 'utf8');
const NETWORK_PLUS_MAP = new Function(mapSrc + '; return NETWORK_PLUS_MAP;')();

// The real function, with getActiveCourseMap injected.
const fnSrc = extractShipped('_app/tenant/instructor.html', 'applyCourseIdAliases');
function build(map) {
    return new Function('getActiveCourseMap', fnSrc + '; return applyCourseIdAliases;')(() => map);
}
const apply = build(NETWORK_PLUS_MAP);

// The real completion test, copied in shape from instructor.html:2707 — one `if` per item.
function countComplete(student, map) {
    const mods = student.modulesCompleted || [];
    const quizzes = student.quizScores || {};
    const labs = student.labsCompleted || [];
    let n = 0;
    map.chapters.forEach(ch => ch.items.forEach(item => {
        if (mods.indexOf(item.id) !== -1 || quizzes[item.id] != null || labs.indexOf(item.id) !== -1) n++;
    }));
    return n;
}

const A = NETWORK_PLUS_MAP.idAliases;
const OLD = 'web-osi', NEW = A[OLD];
const OLD_LAB = 'web-ne01-osi-scenario', NEW_LAB = A[OLD_LAB];
const OLD_QUIZ = 'web-networking-ch7-20', NEW_QUIZ = A[OLD_QUIZ];

const cases = [];
function check(name, got, want) { cases.push([name, got === want, `${got} (expected ${want})`]); }

// 1. the migration target really is what the map now lists
check('map lists the NEW id, not the old one',
    JSON.stringify(NETWORK_PLUS_MAP.chapters.flatMap(c => c.items.map(i => i.id)).includes(NEW)), 'true');
check('map no longer lists the OLD id as an item',
    JSON.stringify(NETWORK_PLUS_MAP.chapters.flatMap(c => c.items.map(i => i.id)).includes(OLD)), 'false');

// 2. HISTORICAL student: only the OLD ids. Without the alias expansion this is 0.
const hist = { modulesCompleted: [OLD], labsCompleted: [OLD_LAB], quizScores: { [OLD_QUIZ]: 88 } };
check('historical record counts 0 BEFORE expansion', countComplete(hist, NETWORK_PLUS_MAP), 0);
const addedHist = apply([hist]);
check('expansion reported 3 additions', addedHist, 3);
check('historical record counts 3 AFTER expansion', countComplete(hist, NETWORK_PLUS_MAP), 3);
check('the legacy id is PRESERVED, not replaced', hist.modulesCompleted.indexOf(OLD) !== -1, true);
check('the quiz SCORE carried across, not just the key', hist.quizScores[NEW_QUIZ], 88);

// 3. CURRENT student: only the NEW ids. Counts with or without expansion.
const cur = { modulesCompleted: [NEW], labsCompleted: [NEW_LAB], quizScores: { [NEW_QUIZ]: 91 } };
check('current record counts 3 before expansion', countComplete(cur, NETWORK_PLUS_MAP), 3);
check('expansion is a no-op for a current record', apply([cur]), 0);
check('current record still counts 3', countComplete(cur, NETWORK_PLUS_MAP), 3);

// 4. NO DOUBLE COUNT for a student holding both ids.
const both = { modulesCompleted: [OLD, NEW], labsCompleted: [], quizScores: {} };
check('holding both ids counts ONCE', countComplete(both, NETWORK_PLUS_MAP), 1);
check('expansion adds nothing when both are present', apply([both]), 0);

// 5. NO FALSE POSITIVE.
const none = { modulesCompleted: ['web-totally-unrelated'], labsCompleted: [], quizScores: {} };
apply([none]);
check('unrelated id counts 0', countComplete(none, NETWORK_PLUS_MAP), 0);

// 6. IDEMPOTENT — reloading must not keep growing the arrays.
const rep = { modulesCompleted: [OLD], labsCompleted: [], quizScores: {} };
apply([rep]); const len1 = rep.modulesCompleted.length;
apply([rep]); apply([rep]);
check('repeated expansion is idempotent', rep.modulesCompleted.length, len1);

// 7. A COURSE WITHOUT ALIASES IS UNTOUCHED.
const plainMap = { chapters: [{ items: [{ id: 'x-1' }] }] };
const plainStudent = { modulesCompleted: ['legacy-thing'], labsCompleted: [], quizScores: {} };
check('map with no idAliases: expansion is a no-op', build(plainMap)([plainStudent]), 0);
check('map with no idAliases: record untouched', plainStudent.modulesCompleted.length, 1);

// 8. every alias target must be a real item id, or the table silently does nothing
const itemIds = new Set(NETWORK_PLUS_MAP.chapters.flatMap(c => c.items.map(i => i.id)));
check('every alias TARGET is a live item id', Object.values(A).filter(v => !itemIds.has(v)).length, 0);
check('no alias SOURCE is still an item id (would double-count)',
    Object.keys(A).filter(k => itemIds.has(k)).length, 0);

let pass = 0, fail = 0;
for (const [name, ok, detail] of cases) {
    console.log(`  ${ok ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m'}  ${name}${ok ? '' : '  -> ' + detail}`);
    ok ? pass++ : fail++;
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
