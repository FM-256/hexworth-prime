#!/usr/bin/env node
/**
 * gen-rule-reference.test.js — pins the parsing rules of gen-rule-reference.js.
 *
 * @catalog what    Unit and real-tree checks for the EduScan rule reference generator: description
 * @catalog what    layouts, sub-code parents, paired code/severity ternaries, option-passed codes.
 * @catalog run     node _tools/eduscan/gen-rule-reference.test.js
 * @catalog status  TOOL
 *
 * Each block is a case that was wrong in an earlier draft: a wrapped doc comment cut mid-sentence,
 * `isCtf ? 'high' : 'info'` giving BOTH severities to both codes, HTML-011/012 (passed in as options)
 * with no description, XREF-003.A rejected for its dot; then, from review (Nancy, Chris), "clean"
 * claimed for checks that never ran, sub-codes of an audit that ran shown "not run", a five-month-old
 * report counted as this run, and a Confluence page whose cells printed "<br>" and split on pipes.
 * GEN=<path> runs the same checks against another copy of the generator, which is how a mutation is
 * scored.
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const gen = require(process.env.GEN || path.join(__dirname, 'gen-rule-reference.js'));

let pass = 0, fail = 0;
/* Records one assertion and prints it. */
function chk(name, cond, detail) {
    if (cond) { pass++; console.log('  ok   ' + name); }
    else { fail++; console.log('  FAIL ' + name + (detail !== undefined ? '  <- ' + JSON.stringify(detail) : '')); }
}

/* The comments acorn reports for a snippet of source. */
function commentsOf(src) { const c = []; gen.parse(src, c); return c; }

console.log('\n1. what counts as a rule code');
chk('placeholders are not codes', !['CODE', 'X', 'XXX'].some((c) => gen.CODE_RE.test(c)));
chk('dotted and named sub-codes are', ['XREF-003.A', 'HEUR-RESULT-BUTTON-STANDARD', 'BOX-002c', 'META-001-NO-CODE'].every((c) => gen.CODE_RE.test(c)));

console.log('\n2. doc comment layouts');
const d = gen.docDescriptions(commentsOf([
    '/**',
    ' * EduScan — Example Audit (EX-009)',
    ' *',
    ' * - EX-001: Separator form',
    ' * - EX-002: A definition that wraps',
    ' *   onto a second line and a third.',
    ' * - EX-003: The next bullet stops the wrap',
    ' *   EX-004  Column form, two spaces',
    ' */',
].join('\n')));
chk('separator form', d.lines['EX-001'] === 'Separator form', d.lines['EX-001']);
chk('a wrapped definition is joined, not cut mid-sentence', d.lines['EX-002'] === 'A definition that wraps onto a second line and a third.', d.lines['EX-002']);
chk('a new bullet ends the wrap', d.lines['EX-003'] === 'The next bullet stops the wrap', d.lines['EX-003']);
chk('column form', d.lines['EX-004'] === 'Column form, two spaces', d.lines['EX-004']);
chk('a title is kept apart from definitions, with its line', d.titles['EX-009'] && d.titles['EX-009'].text === 'Example Audit' && d.titles['EX-009'].line === 2 && !d.lines['EX-009'], d);

console.log('\n3. messages and parents');
const tl = gen.parse('x = { message: `Unclosed <${t}> tag in ${f}` }', []).body[0].expression.right.properties[0].value;
chk('a template shows each interpolation as …', gen.textOf(tl) === 'Unclosed <…> tag in …', gen.textOf(tl));
const has = (set) => (c) => set.includes(c);
chk('a sub-code finds its parent', gen.parentOf('BOX-011-FLAG-LEAK-CTF', has(['BOX-011'])) === 'BOX-011');
chk('a dotted sub-code finds its parent', gen.parentOf('XREF-003.A', has(['XREF-003'])) === 'XREF-003');
chk('a code is never its own parent', gen.parentOf('BOX-011', has(['BOX-011'])) === null);

console.log('\n4. severity written into a description');
const sn = gen.splitSeverityNote('Inline <style> block exceeds threshold (MEDIUM)');
chk('a "(MEDIUM)" label is taken out of the sentence', sn.text === 'Inline <style> block exceeds threshold' && sn.stated[0] === 'medium', sn);
chk('so is a leading "(high)" and "Severity: HIGH."', gen.splitSeverityNote('(high) Thing. Severity: HIGH.').text === 'Thing.', gen.splitSeverityNote('(high) Thing. Severity: HIGH.'));

console.log('\n5. run status, from a fixture run');
/* A scan, a fresh BOX-016 report with nothing in it, a fresh BOX-011 report whose finding nests two
   leaks, and an XREF-003 report sixty days older than the scan. The rules come from the real tree. */
const fx = fs.mkdtempSync(path.join(os.tmpdir(), 'rule-ref-fx-'));
const scanAt = '2026-10-31T12:00:00.000Z';
const write = (n, o) => fs.writeFileSync(path.join(fx, n), JSON.stringify(o));
write('TREASURE_MAP.json', { meta: { scannedAt: scanAt }, summary: { totalFilesScanned: 1 },
    issues: [{ code: 'HEUR-035', severity: 'high', file: 'a.html', message: 'dash' }] });
write('BOX_HTML_BOOTSTRAP.json', { validatorCode: 'BOX-016', generatedAt: '2026-10-31T11:00:00.000Z', findings: [] });
write('BOX_FLAG_LEAK_AUDIT.json', { validatorCode: 'BOX-011', generatedAt: '2026-10-31T11:30:00.000Z', findings: [
    { dirname: 'box-a', severity: 'high', leaks: [{ code: 'BOX-011-FLAG-LEAK-CTF', severity: 'high' }, { code: 'BOX-011-FLAG-LEAK-CTF', severity: 'high' }] }] });
write('SIGNAL_GUIDES_COVERAGE.json', { validatorCode: 'XREF-003', generatedAt: '2026-09-01T00:00:00.000Z', findings: [{ code: 'XREF-003.A', severity: 'high' }] });
const fref = gen.build({ reportsDir: fx });
const F = (c) => (fref.rules.find((r) => r.code === c) || {}).run || {};
chk('a rule with findings is fired', F('HEUR-035').status === 'fired' && F('HEUR-035').count === 1, F('HEUR-035'));
chk('an audit that ran with this scan and found nothing is clean', F('BOX-016').status === 'clean', F('BOX-016'));
chk('its sub-codes are clean too, not "not run"', F('BOX-016-MISSING-ENGINE').status === 'clean', F('BOX-016-MISSING-ENGINE'));
chk('codes nested inside a finding are counted under their own code', F('BOX-011-FLAG-LEAK-CTF').status === 'fired' && F('BOX-011-FLAG-LEAK-CTF').count === 2, F('BOX-011-FLAG-LEAK-CTF'));
chk('a report from an earlier day is "stale" with its date', F('XREF-003').status === 'stale' && /^2026-09-01/.test(F('XREF-003').lastRanAt || ''), F('XREF-003'));
chk('and its findings are not counted as this run', F('XREF-003.A').status === 'stale' && F('XREF-003.A').count === 0, F('XREF-003.A'));
chk('a profile-gated check the scan loads is "no-findings", never "clean"', F('HTML-005').status === 'no-findings', F('HTML-005'));
chk('a flag-gated check is not-run', F('FUNC-001').status === 'not-run', F('FUNC-001'));
fs.rmSync(fx, { recursive: true, force: true });

console.log('\n6. the real tree');
const ref = gen.build();
const R = (c) => ref.rules.find((r) => r.code === c) || {};
chk('every rule traces to source', ref.totals.noSource === 0, ref.rules.filter((r) => !r.sources.length).map((r) => r.code));
chk('every rule has a description', ref.rules.every((r) => r.description), ref.rules.filter((r) => !r.description).map((r) => r.code));
chk('paired ternary: the CTF leak is high only', JSON.stringify(R('BOX-011-FLAG-LEAK-CTF').severity) === '["high"]', R('BOX-011-FLAG-LEAK-CTF').severity);
chk('paired ternary: the narrative leak is info only', JSON.stringify(R('BOX-011-FLAG-LEAK-NARRATIVE').severity) === '["info"]', R('BOX-011-FLAG-LEAK-NARRATIVE').severity);
chk('an option-passed code takes its template message', R('HTML-012').message === 'Unclosed <…> tag', R('HTML-012').message);
chk('and is marked computed, not given a guessed severity', R('HTML-012').severityComputed === true && R('HTML-012').severity.length === 0, R('HTML-012'));
chk('a dotted sub-code is listed', !!R('XREF-003.A').code);
chk('a literal severity is read', JSON.stringify(R('HEUR-035').severity) === '["high"]', R('HEUR-035').severity);
chk('a severity held in a variable is read, not "computed"', JSON.stringify(R('XP-001').severity) === '["high","low"]' && !R('XP-001').severityComputed, R('XP-001'));
chk('a comment that disagrees with the code is noted', /comment says medium; the code sets low/.test(R('BLOB-001').note || ''), R('BLOB-001').note);
chk('a code named only in a validator title is a rule (GUARD-001)', (R('GUARD-001').sources || []).length === 1, R('GUARD-001').sources);

const md = gen.toMarkdown(ref);
chk('the page prints the scan day, not the time', !/T\d\d:\d\d/.test(md.split('## Families')[0]));

console.log('\n7. the Confluence page, through the real converter');
/* publish-solution.py's md_to_storage, the converter sync-published-docs.sh uses: every table row
   must have its header's cell count, no "<br>" may print as text, and the XHTML must parse. */
const mdFile = path.join(os.tmpdir(), 'rule-ref-' + process.pid + '.md');
fs.writeFileSync(mdFile, md);
let conv;
try {
    conv = JSON.parse(execFileSync('python3', ['-c', `
import sys, re, json, importlib.util, xml.dom.minidom
spec = importlib.util.spec_from_file_location('ps', sys.argv[1]); ps = importlib.util.module_from_spec(spec); spec.loader.exec_module(ps)
html = ps.md_to_storage(open(sys.argv[2], encoding='utf-8').read())
bad = 0
for t in re.findall(r'<table>.*?</table>', html, re.S):
    rows = re.findall(r'<tr>(.*?)</tr>', t, re.S); hn = rows[0].count('<th>')
    bad += sum(1 for r in rows[1:] if r.count('<td>') != hn)
try:
    xml.dom.minidom.parseString('<r>' + html + '</r>'); wf = True
except Exception: wf = False
print(json.dumps({'br': html.count('&lt;br'), 'badRows': bad, 'wellFormed': wf}))
`, path.join(__dirname, '../confluence/publish-solution.py'), mdFile], { encoding: 'utf8' }));
} finally { fs.rmSync(mdFile, { force: true }); }
chk('no cell prints "<br>" as text', conv.br === 0, conv);
chk('every row has as many cells as its header', conv.badRows === 0, conv);
chk('the page body is well-formed XHTML', conv.wellFormed === true, conv);

console.log('\n  ' + pass + '/' + (pass + fail) + ' assertions passed');
process.exit(fail ? 1 : 0);
