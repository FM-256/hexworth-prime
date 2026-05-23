#!/usr/bin/env node
/**
 * One-shot backfill: add a resetState() method to each box config flagged
 * by BOX-006 (box-state-reset-audit). Mirrors the PIS-FINAL pattern:
 *
 *   resetState: function() {
 *       this._state = { <original initial values> };
 *       this._flag1Awarded = false;   // if present
 *       ...
 *   }
 *
 * Plus an auto-call after the closing `};` of the config object:
 *
 *   if (typeof <Name>Config !== 'undefined') <Name>Config.resetState();
 *
 * Usage:
 *   node _tools/eduscan/box-state-reset-backfill.js [--dry-run] [--only boxName]
 *
 * Writes a .bak alongside each modified file. Re-running is safe — boxes
 * that already have a resetState() method are skipped.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const REPORT = path.join(ROOT, '_tools/reports/BOX_STATE_RESET_AUDIT.json');

const DRY_RUN = process.argv.includes('--dry-run');
const ONLY_IDX = process.argv.indexOf('--only');
const ONLY = ONLY_IDX !== -1 ? process.argv[ONLY_IDX + 1] : null;

function findMatchingBrace(src, openIdx, openCh, closeCh) {
    let depth = 0;
    let inStr = null;
    let escape = false;
    for (let i = openIdx; i < src.length; i++) {
        const c = src[i];
        if (escape) { escape = false; continue; }
        if (c === '\\') { escape = true; continue; }
        if (inStr) { if (c === inStr) inStr = null; continue; }
        if (c === "'" || c === '"' || c === '`') { inStr = c; continue; }
        if (c === openCh) depth++;
        else if (c === closeCh) { depth--; if (depth === 0) return i; }
    }
    return -1;
}

function extractStateBlock(src) {
    const re = /^\s*_state\s*:\s*\{/m;
    const m = src.match(re);
    if (!m) return null;
    const openIdx = m.index + m[0].length - 1;
    const closeIdx = findMatchingBrace(src, openIdx, '{', '}');
    if (closeIdx < 0) return null;
    return { literal: src.slice(openIdx, closeIdx + 1) };
}

function extractFlagFields(src) {
    const fields = [];
    const re = /^\s*(_flag\d+Awarded)\s*:\s*(true|false)/gm;
    let m;
    while ((m = re.exec(src)) !== null) {
        fields.push({ name: m[1], init: m[2] });
    }
    return fields;
}

function extractConfigName(src) {
    const m = src.match(/^(?:var|const|let)\s+([A-Za-z_][A-Za-z0-9_]*Config)\s*=\s*\{/m);
    return m ? m[1] : null;
}

function findConfigClosingBrace(src, configName) {
    // Robust strategy: every config file ends with `};` for the top-level
    // object. We find the LAST `};` (optionally with trailing whitespace)
    // and return the index of that closing `}`. Brace-walking the source
    // is brittle because configs contain string literals with unbalanced
    // quotes/braces (regex sources, narrative text, etc.) and JS-comment
    // edge cases.
    const matches = [];
    const re = /\}\s*;\s*$/gm;
    let m;
    while ((m = re.exec(src)) !== null) {
        matches.push(m.index);
    }
    if (matches.length === 0) return -1;
    return matches[matches.length - 1];   // index of `}` in last `};`
}

function findConfigPath(boxName) {
    try {
        const result = execSync(
            `find _app -name config.js -path "*${boxName}*" -not -path "*_archive*" 2>/dev/null | head -1`,
            { cwd: ROOT, encoding: 'utf8' }
        ).trim();
        return result ? path.join(ROOT, result) : null;
    } catch (e) { return null; }
}

function buildResetMethod(stateLiteral, flagFields) {
    const lines = ['', '    resetState: function() {'];
    lines.push('        this._state = ' + stateLiteral + ';');
    for (const f of flagFields) {
        lines.push('        this.' + f.name + ' = ' + f.init + ';');
    }
    lines.push('    }');
    return lines.join('\n');
}

function processBox(boxName) {
    const cfgFile = findConfigPath(boxName);
    if (!cfgFile) return { boxName, status: 'no-config-found' };
    let src;
    try { src = fs.readFileSync(cfgFile, 'utf8'); }
    catch (e) { return { boxName, status: 'unreadable', error: e.message }; }

    if (/^\s*resetState\s*:\s*function/m.test(src)) {
        return { boxName, status: 'already-has-resetState' };
    }

    const stateBlock = extractStateBlock(src);
    if (!stateBlock) return { boxName, status: 'no-state-field-found' };

    const flagFields = extractFlagFields(src);
    const configName = extractConfigName(src);
    if (!configName) return { boxName, status: 'no-config-name' };

    const closingIdx = findConfigClosingBrace(src, configName);
    if (closingIdx < 0) return { boxName, status: 'no-closing-brace' };

    // Insert the resetState method just before the closing brace.
    // Walk backward to skip any trailing whitespace/newlines before `}`.
    let insertIdx = closingIdx;
    while (insertIdx > 0 && /\s/.test(src[insertIdx - 1])) insertIdx--;
    const needsLeadingComma = src[insertIdx - 1] !== ',';

    const method = buildResetMethod(stateBlock.literal, flagFields);
    const insertion = (needsLeadingComma ? ',' : '') + '\n' + method + '\n';

    const before = src.slice(0, insertIdx);
    const after  = src.slice(insertIdx);

    // Also append the auto-call after the file. Find the very end of file.
    const trailer = '\n\n// Auto-reset state on script load (BOX-006 backfill 2026-05-23)\n' +
                    'if (typeof ' + configName + ' !== \'undefined\') ' + configName + '.resetState();\n';

    // Need to know where the config object's closing `};` is. closingIdx
    // points at `}` — the `;` follows somewhere after. We append the trailer
    // at end-of-file (which is safe because configs end with `};` then EOL).
    const newSrc = before + insertion + after + (after.endsWith('\n') ? '' : '\n') + trailer;

    if (DRY_RUN) {
        return {
            boxName, status: 'would-modify',
            configName,
            stateFields: stateBlock.literal.length + ' chars',
            flagFieldCount: flagFields.length,
            cfgFile: path.relative(ROOT, cfgFile),
            preview: insertion.slice(0, 400)
        };
    }

    // Backup + write
    const ts = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
    fs.writeFileSync(cfgFile + '.box130-backup-' + ts, src);
    fs.writeFileSync(cfgFile, newSrc);
    return {
        boxName, status: 'modified',
        configName,
        flagFieldCount: flagFields.length,
        cfgFile: path.relative(ROOT, cfgFile)
    };
}

function main() {
    if (!fs.existsSync(REPORT)) {
        console.error('FATAL: BOX-006 report missing. Run validator first: node _tools/eduscan/box-state-reset-audit.js');
        process.exit(99);
    }
    const report = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
    const findings = (report.verdicts || [])
        .filter(v => v.class === 'no-reset' || v.class === 'missing-reset')
        .map(v => v.boxName || v.dirname)
        .filter(Boolean);

    const targets = ONLY ? findings.filter(b => b === ONLY) : findings;
    if (targets.length === 0) {
        console.error('No targets to process. ' + (ONLY ? '(--only ' + ONLY + ' did not match)' : ''));
        process.exit(1);
    }

    console.log('box-state-reset-backfill — ' + (DRY_RUN ? 'DRY RUN' : 'WRITE') +
                ' on ' + targets.length + ' boxes');
    console.log('========================================');

    const results = targets.map(processBox);
    const tally = {};
    results.forEach(r => { tally[r.status] = (tally[r.status] || 0) + 1; });

    results.forEach(r => {
        const tag = ({
            'modified':              '✓',
            'would-modify':          '~',
            'already-has-resetState':'-',
            'no-config-found':       '?',
            'no-state-field-found':  '?',
            'no-config-name':        '?',
            'no-closing-brace':      '?',
            'unreadable':            '!'
        })[r.status] || '?';
        console.log('  ' + tag + ' ' + r.boxName.padEnd(40) + r.status +
                    (r.flagFieldCount != null ? ' (+' + r.flagFieldCount + ' flag fields)' : ''));
    });
    console.log('---');
    Object.entries(tally).sort().forEach(([k, v]) => console.log('  ' + k.padEnd(28) + v));
}

main();
