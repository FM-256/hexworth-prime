#!/usr/bin/env node
'use strict';
// Standalone runner for PROG-003 cross-file shared ModuleProgress key detection.
// Bypasses full SyntaxValidator wiring so the new check can be evaluated in
// isolation before being added to the main scan pipeline.
//
// Output:
//   _tools/reports/PROG_003_REPORT.json
//   stdout: severity-grouped collision summary

const fs = require('fs');
const path = require('path');
const ProgressKeysValidator = require('./validators/syntax/progress-keys.js');

const ROOT_APP = path.resolve(__dirname, '../../_app');
const OUT = path.resolve(__dirname, '../reports/PROG_003_REPORT.json');

const v = new ProgressKeysValidator({ rootPath: ROOT_APP, verbose: true });
const { issues } = v.validateAll();

const report = {
    generated: new Date().toISOString(),
    rootPath: ROOT_APP,
    totalCollisions: issues.length,
    critical: issues.filter(i => i.severity === 'critical').length,
    medium: issues.filter(i => i.severity === 'medium').length,
    issues: issues.sort((a, b) => {
        const sevOrder = { critical: 0, medium: 1 };
        if (sevOrder[a.severity] !== sevOrder[b.severity]) return sevOrder[a.severity] - sevOrder[b.severity];
        return a.message.localeCompare(b.message);
    }),
};
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(report, null, 2));

console.log('');
console.log('  PROG-003 — Cross-file shared ModuleProgress key detection');
console.log('');
console.log('    Total collisions: ' + report.totalCollisions);
console.log('    CRITICAL (5+ files): ' + report.critical);
console.log('    MEDIUM   (2-4 files): ' + report.medium);
console.log('');
if (report.critical > 0) {
    console.log('  CRITICAL collisions:');
    for (const i of report.issues.filter(x => x.severity === 'critical')) {
        const head = i.message.split('\n')[0];
        console.log('    • ' + head);
    }
    console.log('');
}
if (report.medium > 0 && report.medium <= 20) {
    console.log('  MEDIUM collisions (sample):');
    for (const i of report.issues.filter(x => x.severity === 'medium').slice(0, 20)) {
        const head = i.message.split('\n')[0];
        console.log('    • ' + head);
    }
    console.log('');
}
console.log('  Full report: ' + path.relative(process.cwd(), OUT));
