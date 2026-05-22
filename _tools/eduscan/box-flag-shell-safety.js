#!/usr/bin/env node
/**
 * EduScan — Box Flag Shell-Safety Lint (BOX-008)
 *
 * Detect flag values seeded in `functions/box_flags.json` that contain
 * shell metacharacters (`<`, `>`, `|`, `;`, `&`, `` ` ``, `$`) which
 * break unquoted echo / hash / chain commands students may run to verify
 * or compute synthesis flags.
 *
 * Why this rule matters:
 *   PIS-FINAL Nancy round 2 (2026-05-21) MEDIUM finding:
 *
 *     "Step 7.1 echo command shell-expansion hazard. Flag 1's value
 *      includes `<` and `>` characters (canonical Message-ID format per
 *      RFC 5322). In a real bash shell, unquoted `<` and `>` are I/O
 *      redirect operators — the command would silently misparse and
 *      produce a wrong (or empty) hash with no error message.
 *      The PDF copy-paste warning at the document header covers the
 *      `-flag` whitespace artifact only. It does not call out the
 *      angle-bracket shell-expansion risk."
 *
 *   Any flag value containing shell metas has this risk when copied
 *   into terminal commands. The walkthrough must either:
 *     (a) call out the quoting requirement explicitly, OR
 *     (b) use a flag value that avoids shell metas entirely.
 *
 * This rule emits an informational finding per shell-unsafe flag so the
 * operator can audit walkthrough warning coverage. It does NOT auto-fix.
 *
 * Issue codes:
 *   BOX-008-FLAG-SHELL-UNSAFE     Flag value contains one or more shell
 *                                 metacharacters. Walkthrough should
 *                                 document the quoting requirement.
 *                                 Severity: MEDIUM.
 *
 * Read-only. No edits.
 *
 * Usage:
 *   node _tools/eduscan/box-flag-shell-safety.js [--report-only]
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const BOX_FLAGS = path.join(ROOT, 'functions/box_flags.json');
const REPORTS_DIR = path.join(ROOT, '_tools/reports');
const OUT_FILE = path.join(REPORTS_DIR, 'BOX_FLAG_SHELL_SAFETY.json');

const REPORT_ONLY = process.argv.includes('--report-only');

// Shell metacharacters that break unquoted commands:
//   <   I/O redirect (input)
//   >   I/O redirect (output)
//   |   pipe
//   ;   command separator
//   &   background / async
//   `   command substitution (backtick)
//   $   variable expansion
//   (   subshell open
//   )   subshell close
//   '   quote (closes the current quoted string in echo "..." constructs)
//   "   quote (same hazard, especially in nested expressions)
//   \   escape character (problematic when not intentional)
const META_RE = /[<>|;&`$()'"\\]/;

const SELF_VALIDATION = {
    // PIS-FINAL Flag 1 contains angle brackets — must surface as unsafe
    'pis-final-patient-zero': {
        expectSomeUnsafe: true,
        reason: 'Flag 1 Message-ID has < and >'
    },
    // A1 flags are pure alphanumeric/underscore — should be all-safe
    'a1-ancient-ledger': {
        expectSomeUnsafe: false,
        reason: 'flag{}/FLAG{} format, no metacharacters'
    }
};

function readJSON(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

function classify(flagValue) {
    const matches = flagValue.match(new RegExp(META_RE.source, 'g'));
    return {
        unsafe: !!matches,
        metas: matches ? Array.from(new Set(matches)) : []
    };
}

function main() {
    const startMs = Date.now();
    if (!fs.existsSync(BOX_FLAGS)) {
        console.error('FATAL: functions/box_flags.json not found.');
        process.exit(99);
    }
    const registry = readJSON(BOX_FLAGS);

    const verdicts = [];
    for (const [box, entry] of Object.entries(registry)) {
        const flags = entry.flags || {};
        const unsafeFlags = [];
        for (const [sid, val] of Object.entries(flags)) {
            const c = classify(val);
            if (c.unsafe) {
                unsafeFlags.push({ scenarioId: sid, value: val, metas: c.metas });
            }
        }
        if (unsafeFlags.length === 0) {
            verdicts.push({ boxName: box, class: 'safe', severity: null, flagCount: Object.keys(flags).length });
        } else {
            verdicts.push({
                boxName: box,
                class: 'has-unsafe',
                severity: 'medium',
                code: 'BOX-008-FLAG-SHELL-UNSAFE',
                unsafeFlagCount: unsafeFlags.length,
                totalFlagCount: Object.keys(flags).length,
                unsafe: unsafeFlags,
                message: `${unsafeFlags.length} of ${Object.keys(flags).length} flag values contain shell metacharacters. Walkthrough must document quoting requirement.`
            });
        }
    }

    // Self-validation
    const selfFailures = [];
    for (const [box, exp] of Object.entries(SELF_VALIDATION)) {
        const v = verdicts.find(x => x.boxName === box);
        if (!v) {
            selfFailures.push({ box, reason: 'not in box_flags.json' });
            continue;
        }
        const actualSomeUnsafe = v.class === 'has-unsafe';
        if (actualSomeUnsafe !== exp.expectSomeUnsafe) {
            selfFailures.push({
                box,
                reason: 'mismatch',
                expected: exp.expectSomeUnsafe ? 'has-unsafe' : 'safe',
                got: v.class,
                note: exp.reason
            });
        }
    }
    if (selfFailures.length > 0) {
        console.error('SELF-VALIDATION FAILURE:');
        for (const f of selfFailures) console.error('  ' + JSON.stringify(f));
        console.error('Refusing to write report.');
        process.exit(2);
    }

    const unsafe = verdicts.filter(v => v.class === 'has-unsafe');
    const safe = verdicts.filter(v => v.class === 'safe');

    // Aggregate metacharacter frequency
    const metaFreq = {};
    for (const v of unsafe) {
        for (const f of v.unsafe) {
            for (const m of f.metas) metaFreq[m] = (metaFreq[m] || 0) + 1;
        }
    }

    const report = {
        generatedAt: new Date().toISOString(),
        tool: 'box-flag-shell-safety',
        validatorCode: 'BOX-008',
        scope: { input: 'functions/box_flags.json all entries' },
        metaCharsChecked: ['<', '>', '|', ';', '&', '`', '$', '(', ')', "'", '"', '\\'],
        totals: {
            boxesScanned: Object.keys(registry).length,
            safe: safe.length,
            hasUnsafe: unsafe.length,
            metacharFrequency: metaFreq,
            durationMs: Date.now() - startMs
        },
        selfValidation: { cases: Object.keys(SELF_VALIDATION).length, failures: 0, verdict: 'PASS' },
        findings: unsafe,
        verdicts
    };
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    console.log('box-flag-shell-safety (BOX-008)');
    console.log('================================');
    console.log('  Boxes scanned:           ' + Object.keys(registry).length);
    console.log('  Shell-safe:              ' + safe.length);
    console.log('  Has unsafe flag values:  ' + unsafe.length);
    if (Object.keys(metaFreq).length > 0) {
        console.log('  Metachar frequency:');
        Object.entries(metaFreq).sort(([,a],[,b]) => b-a).forEach(([m,c]) => console.log('    ' + JSON.stringify(m) + ': ' + c));
    }
    console.log('  Self-validation:         PASS (' + Object.keys(SELF_VALIDATION).length + ' test cases)');
    console.log('  Duration:                ' + (Date.now() - startMs) + 'ms');
    console.log('  Output:                  ' + path.relative(ROOT, OUT_FILE));

    if (unsafe.length > 0) {
        console.log('---');
        console.log('UNSAFE flag values (' + unsafe.length + ' boxes — sample):');
        unsafe.slice(0, 10).forEach(v => {
            console.log('  ' + v.boxName + ' (' + v.unsafeFlagCount + '/' + v.totalFlagCount + ' unsafe)');
            v.unsafe.slice(0, 2).forEach(f => {
                console.log(`    ${f.scenarioId} metas=${f.metas.map(s=>JSON.stringify(s)).join(',')} value="${f.value.length > 60 ? f.value.slice(0,57)+'...' : f.value}"`);
            });
        });
        if (unsafe.length > 10) console.log('  ... and ' + (unsafe.length - 10) + ' more');
    }

    if (REPORT_ONLY) process.exit(0);
    process.exit(unsafe.length > 0 ? 1 : 0);
}

main();
