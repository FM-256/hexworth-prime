#!/usr/bin/env node
/**
 * EduScan — Box Decoy Provenance Surface Lint (BOX-009)
 *
 * Heuristic detector for the "decoy context only in briefing text"
 * defect class. When a box's narrative content (incident-brief, notes,
 * lore) describes a DECOY scenario with specific identifiers (HR
 * ticket numbers, calendar date ranges, prior-session counts, etc.)
 * that the student must use 30-60 minutes later to disambiguate from
 * the real attack, those identifiers MUST also appear in the
 * student-facing UI surface (terminal output, webApp page text)
 * at the point of disambiguation. Otherwise the student is forced
 * to remember briefing text from minute 1 to use at minute 60 — an
 * unfair memory test, not a security skill test.
 *
 * Why this rule matters:
 *   PIS-FINAL Nancy round 2 (2026-05-21) MEDIUM finding:
 *
 *     "s.patel decoy requires cross-phase memory of a text artifact,
 *      not a visible surface. The only surface that documents s.patel's
 *      London trip is incident-brief.md — 170+ lines read at the start
 *      of the lab. By Phase 5, a student who did not take notes may
 *      not remember the London detail. The SIEM auth log shows
 *      'flagged but EXPECTED' next to s.patel's entries. That label
 *      is doing heavy lifting — a student could read 'flagged but
 *      EXPECTED' as a scenario artifact telling them the engine is
 *      suppressing a real anomaly. This is ambiguous UX."
 *
 *   The fix moved the calendar reference + HR ticket number (#TR-2026-
 *   0418) + prior-session count (4 London sessions) directly into the
 *   SIEM auth log entries as inline provenance lines.
 *
 * Detection heuristic (intentionally narrow to limit false positives):
 *
 *   1. Scan config filesystem entries for narrative files (filenames
 *      ending in .md, .txt, or containing 'brief'/'notes'/'lore').
 *   2. Within narrative content, find DECOY-MARKER patterns:
 *        - "expected anomaly", "business trip", "approved travel"
 *        - "HR ticket", "calendar", "offsite"
 *        - "prior sessions", "[EXPLAINED]"
 *   3. Near each decoy marker, extract SPECIFIC IDENTIFIERS:
 *        - HR ticket numbers: #[A-Z]{2,4}-\d{4}-\d{4}
 *        - Date ranges: \d{4}-\d{2}-\d{2}\s+to\s+\d{4}-\d{2}-\d{2}
 *        - Employee handles with apostrophes: \w+\.\w+'s
 *        - "N prior sessions" patterns
 *   4. Check if those identifiers also appear in the config's UI
 *      surface text — webApp.pages content + custom-command return
 *      values + engine.notify messages.
 *   5. If identifier exists in briefing but NOT in UI surface → finding.
 *
 * This is a HEURISTIC. Some false positives expected (identifier
 * that's purely flavor, no student-action dependency). Some false
 * negatives expected (decoy context expressed without our markers).
 * Treat findings as REVIEW-REQUIRED, not auto-block.
 *
 * Issue codes:
 *   BOX-009-DECOY-CONTEXT-ONLY-IN-BRIEFING   Decoy-context identifier
 *                                            found in narrative file
 *                                            but not in any UI surface.
 *                                            Student must rely on memory
 *                                            of briefing text. Severity:
 *                                            MEDIUM (review required).
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const APP_DIR = path.join(ROOT, '_app');
const REPORTS_DIR = path.join(ROOT, '_tools/reports');
const OUT_FILE = path.join(REPORTS_DIR, 'BOX_DECOY_PROVENANCE_LINT.json');

const REPORT_ONLY = process.argv.includes('--report-only');

// Decoy-marker terms that suggest a "this is expected, don't chase it" framing
const DECOY_MARKERS = [
    /expected\s+anomal/i,
    /\bbusiness\s+trip\b/i,
    /approved\s+travel/i,
    /HR\s+ticket/i,
    /\bcalendar\b/i,
    /\boffsite\b/i,
    /prior\s+(?:session|login)s?/i,
    /\[EXPLAINED\]/,
    /EXPLAINED\s+ANOMAL/i
];

// Identifier patterns — specific tokens worth checking for cross-surface presence
const IDENTIFIER_PATTERNS = [
    { name: 'hr-ticket', re: /#[A-Z]{2,4}-\d{4}-\d{3,5}/g },
    { name: 'date-range', re: /\d{4}-\d{2}-\d{2}\s+to\s+\d{4}-\d{2}-\d{2}/g },
    { name: 'employee-handle', re: /\b[a-z]\.[a-z]+(?:'s|\b)/g },
    { name: 'count-pattern', re: /\b\d+\s+prior\s+(?:session|login|day)s?\b/gi }
];

const SELF_VALIDATION = {
    // PIS-FINAL: incident-brief.md has #TR-2026-0418 + dates. After Nancy r2 fix,
    // SIEM auth log entries ALSO have these. Should be CLEAN (no findings).
    'pis-final-patient-zero': { expectFindings: false, reason: 'SIEM auth log carries TR-2026-0418 inline post-fix' }
};

function findBoxConfigs(root) {
    const out = [];
    const stack = [root];
    while (stack.length > 0) {
        const d = stack.pop();
        let entries;
        try { entries = fs.readdirSync(d, { withFileTypes: true }); }
        catch (e) { continue; }
        for (const e of entries) {
            if (e.name.startsWith('.') || e.name === 'node_modules') continue;
            if (e.name === '_archive' || e.name === '_source') continue;
            if (e.isDirectory()) stack.push(path.join(d, e.name));
        }
        const files = entries.filter(e => e.isFile()).map(e => e.name);
        if (files.includes('index.html') && files.includes('config.js')) {
            try {
                const idx = fs.readFileSync(path.join(d, 'index.html'), 'utf8');
                if (/BoxEngine\.init/.test(idx)) {
                    out.push({
                        boxName: path.basename(d),
                        configFile: path.join(d, 'config.js'),
                        relDir: path.relative(ROOT, d) + path.sep
                    });
                }
            } catch (e) { /* skip */ }
        }
    }
    return out;
}

/**
 * Extract narrative-file content strings from a config. Looks for entries
 * in config.filesystem with names matching narrative patterns and pulls
 * out their content fields.
 */
function extractNarrativeContent(configContent) {
    // Heuristic: capture content of files with names ending in .md / .txt
    // OR containing 'brief'/'notes'/'README'/'history'
    const narrativeRe = /['"][^'"]*(?:brief|notes|README|history|\.md|\.txt|\.bash_)[^'"]*['"]\s*:\s*\{[^}]*content\s*:\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`)/g;
    const chunks = [];
    let m;
    while ((m = narrativeRe.exec(configContent)) !== null) {
        const text = m[1] || m[2] || m[3] || '';
        // Unescape common escapes
        const decoded = text.replace(/\\n/g, '\n').replace(/\\'/g, "'").replace(/\\"/g, '"');
        chunks.push(decoded);
    }
    return chunks.join('\n\n');
}

/**
 * Extract UI-surface text from a config — meaning anything that students
 * can see during gameplay. This includes:
 *   1. webApp.pages html strings (browser surface)
 *   2. command return strings (terminal output)
 *   3. engine.notify messages (toasts)
 *   4. _db.* data fields whose contents get rendered into UI by form
 *      handlers (e.g., _db.siem_auth_log[N].note rendered as inline
 *      SIEM log entries by _handleSiem)
 *
 * Implementation: take the WHOLE config content and exclude only the
 * narrative-file content portion (incident-brief, notes.txt). Whatever
 * remains is potentially-surfaceable to students. This trades precision
 * for recall — any identifier present anywhere in config code/data is
 * considered surfaceable.
 */
function extractUISurfaceContent(configContent) {
    // Strip narrative-file content blocks to isolate "everything else"
    const narrativeFileRe = /['"][^'"]*(?:brief|notes|README|history|\.md|\.txt|\.bash_)[^'"]*['"]\s*:\s*\{[^}]*content\s*:\s*(?:'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/g;
    return configContent.replace(narrativeFileRe, '/*narrative-stripped*/');
}

function hasAnyDecoyMarker(text) {
    return DECOY_MARKERS.some(re => re.test(text));
}

function extractIdentifiers(text) {
    const ids = [];
    for (const pat of IDENTIFIER_PATTERNS) {
        const matches = text.match(new RegExp(pat.re.source, pat.re.flags)) || [];
        for (const id of matches) {
            ids.push({ pattern: pat.name, value: id });
        }
    }
    return ids;
}

function main() {
    const startMs = Date.now();
    const boxes = findBoxConfigs(APP_DIR);
    if (boxes.length === 0) {
        console.error('FATAL: no BoxEngine configs found.');
        process.exit(99);
    }

    const verdicts = [];
    for (const box of boxes) {
        let content;
        try { content = fs.readFileSync(box.configFile, 'utf8'); }
        catch (e) {
            verdicts.push({ boxName: box.boxName, class: 'unreadable', severity: 'medium' });
            continue;
        }

        const narrative = extractNarrativeContent(content);
        if (!narrative || !hasAnyDecoyMarker(narrative)) {
            verdicts.push({ boxName: box.boxName, class: 'no-decoy-marker', severity: null });
            continue;
        }

        // Extract identifiers from narrative
        const narrativeIds = extractIdentifiers(narrative);
        if (narrativeIds.length === 0) {
            verdicts.push({
                boxName: box.boxName,
                class: 'decoy-marker-no-id',
                severity: null,
                note: 'Has decoy-marker text but no specific identifier patterns found. Rule N/A.'
            });
            continue;
        }

        // Extract UI surface text + check each identifier
        const uiSurface = extractUISurfaceContent(content);
        const missingFromUI = [];
        for (const id of narrativeIds) {
            // Deduplicate by value
            if (missingFromUI.find(m => m.value === id.value)) continue;
            if (!uiSurface.includes(id.value)) {
                missingFromUI.push(id);
            }
        }

        if (missingFromUI.length === 0) {
            verdicts.push({
                boxName: box.boxName,
                class: 'provenance-surfaced',
                severity: null,
                narrativeIdCount: narrativeIds.length,
                allFoundInUI: true
            });
        } else {
            verdicts.push({
                boxName: box.boxName,
                relDir: box.relDir,
                class: 'decoy-context-only-in-briefing',
                severity: 'medium',
                code: 'BOX-009-DECOY-CONTEXT-ONLY-IN-BRIEFING',
                missingFromUI,
                message: `${missingFromUI.length} decoy-context identifier(s) appear in narrative files but NOT in any UI surface (webApp pages, command return strings, engine.notify). Student must rely on briefing-text memory.`,
                fix: `Add the decoy-context identifiers (HR tickets, calendar refs, prior-session counts) directly to the UI surface at the point of disambiguation (SIEM logs, dashboard panels, etc.) so students have inline provenance.`
            });
        }
    }

    // Self-validation
    const selfFailures = [];
    for (const [box, exp] of Object.entries(SELF_VALIDATION)) {
        const v = verdicts.find(x => x.boxName === box);
        if (!v) {
            selfFailures.push({ box, reason: 'not discovered' });
            continue;
        }
        const hasFindings = v.class === 'decoy-context-only-in-briefing';
        if (hasFindings !== exp.expectFindings) {
            selfFailures.push({
                box,
                reason: 'mismatch',
                expectFindings: exp.expectFindings,
                got: v.class,
                note: exp.reason,
                detail: v
            });
        }
    }
    if (selfFailures.length > 0) {
        console.error('SELF-VALIDATION FAILURE:');
        for (const f of selfFailures) console.error('  ' + JSON.stringify(f));
        console.error('Refusing to write report.');
        process.exit(2);
    }

    const findings = verdicts.filter(v => v.class === 'decoy-context-only-in-briefing');
    const surfaced = verdicts.filter(v => v.class === 'provenance-surfaced');
    const noMarker = verdicts.filter(v => v.class === 'no-decoy-marker' || v.class === 'decoy-marker-no-id');

    const report = {
        generatedAt: new Date().toISOString(),
        tool: 'box-decoy-provenance-lint',
        validatorCode: 'BOX-009',
        scope: { input: '_app/**/config.js with BoxEngine.init' },
        heuristic: true,
        totals: {
            boxesScanned: boxes.length,
            noDecoyMarker: noMarker.length,
            provenanceSurfaced: surfaced.length,
            decoyContextOnlyInBriefing: findings.length,
            durationMs: Date.now() - startMs
        },
        selfValidation: { cases: Object.keys(SELF_VALIDATION).length, failures: 0, verdict: 'PASS' },
        findings,
        verdicts
    };
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    console.log('box-decoy-provenance-lint (BOX-009, heuristic)');
    console.log('===============================================');
    console.log('  Boxes scanned:           ' + boxes.length);
    console.log('  No decoy marker (N/A):   ' + noMarker.length);
    console.log('  Provenance surfaced:     ' + surfaced.length);
    console.log('  Context only in briefing:' + findings.length);
    console.log('  Self-validation:         PASS (' + Object.keys(SELF_VALIDATION).length + ' test cases)');
    console.log('  Duration:                ' + (Date.now() - startMs) + 'ms');
    console.log('  Output:                  ' + path.relative(ROOT, OUT_FILE));

    if (findings.length > 0) {
        console.log('---');
        console.log('Decoy-context only in briefing (' + findings.length + ' boxes, review required):');
        findings.slice(0, 10).forEach(v => {
            console.log('  ' + v.boxName + ' (' + v.missingFromUI.length + ' missing identifiers)');
            v.missingFromUI.slice(0, 3).forEach(id => {
                console.log(`    [${id.pattern}] "${id.value}"`);
            });
        });
        if (findings.length > 10) console.log('  ... and ' + (findings.length - 10) + ' more');
    }

    if (REPORT_ONLY || findings.length === 0) process.exit(0);
    process.exit(1);
}

main();
