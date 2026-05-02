#!/usr/bin/env node
'use strict';
// Standalone runner for CAT-006 suffix-polluted catalog id detection.
const fs = require('fs');
const path = require('path');
const ContentCatalogValidator = require('./validators/syntax/content-catalog.js');

const ROOT_APP = path.resolve(__dirname, '../../_app');
const v = new ContentCatalogValidator({ rootPath: ROOT_APP });
const { issues, summary } = v.validate();
const cat006 = issues.filter(i => i.code === 'CAT-006');

console.log('');
console.log('  CAT-006 — Suffix-polluted catalog ids');
console.log('');
console.log('    Suffix-polluted ids: ' + (summary.suffixPolluted || 0));
console.log('    Issue groups: ' + cat006.length);
console.log('');
for (const i of cat006) {
    console.log('  ' + i.message.split('\n')[0]);
}
fs.writeFileSync(
    path.resolve(__dirname, '../reports/CAT_006_REPORT.json'),
    JSON.stringify({ generated: new Date().toISOString(), issues: cat006, summary: { suffixPolluted: summary.suffixPolluted || 0 } }, null, 2)
);
console.log('\n  Full report: _tools/reports/CAT_006_REPORT.json');
