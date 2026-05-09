#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Quiz-Key Callsite (XREF-002) Spoke Adapter
 *
 * Wraps the standalone _tools/eduscan/quiz-key-callsite-audit.js scan
 * for Nexus pipeline integration. Detects orphan entries in
 * functions/quiz_keys.json — IDs that no HTML file under _app/ references.
 *
 * Emits one Nexus finding PER CATEGORY (not per ID). With ~88 orphans
 * across 6 categories at first run, per-ID emission would crowd the
 * triage queue without actionable per-ID resolution. Per-category
 * findings preserve cleanup-track semantics (Track A delete, Track B
 * repoint) that operator decisions hinge on.
 *
 * Severity: medium (phantom data pollutes audit signal but is not
 * student-facing because students cannot reach orphan IDs).
 *
 * Dedup-collision note: hub.js dedupKey() = source::code::file. All 6
 * category findings share these three values, so each cron run treats
 * only the last-pushed finding's index as "canonical" for timestamp
 * refresh. Effect: 6 findings persist correctly in store, 5/6 carry
 * stale timestamps. Same pattern as quiz-sync (14 findings, 1 key —
 * established baseline). Refactor opportunity is in hub.dedupKey, not
 * here. Findings still surface to operator triage.
 *
 * Self-validation: KNOWN_ORPHANS must each be classified as orphan.
 * Mismatch refuses to emit findings rather than report half-truths.
 *
 * Nexus integration:
 *   nexus quiz-key-callsite          Pretty-printed orphan report
 *   nexus quiz-key-callsite --json   Machine-readable
 *   alias: nexus qkc
 */
module.exports = function createQuizKeyCallsiteAdapter({ name, dataPath, projectRoot }) {

    const KEYS_FILE = path.join(projectRoot, 'functions/quiz_keys.json');
    const APP_DIR = path.join(projectRoot, '_app');

    // Self-validation seed — these 15 are the confirmed eth-NN-quiz orphans
    // from commit ec3056f0 (2026-04-28 embedded-quiz removal). Any scan that
    // misses them has a regex/scope bug; do not emit corrupt findings.
    const KNOWN_ORPHANS = [
        'eth-01-quiz', 'eth-02-quiz', 'eth-03-quiz', 'eth-04-quiz', 'eth-05-quiz',
        'eth-06-quiz', 'eth-07-quiz', 'eth-08-quiz', 'eth-09-quiz', 'eth-10-quiz',
        'eth-11-quiz', 'eth-12-quiz', 'eth-13-quiz', 'eth-14-quiz', 'eth-15-quiz',
    ];

    function escapeRegex(s) {
        return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function listHtmlFiles(dir) {
        const out = [];
        const stack = [dir];
        while (stack.length > 0) {
            const d = stack.pop();
            let entries;
            try {
                entries = fs.readdirSync(d, { withFileTypes: true });
            } catch (e) { continue; }
            for (const e of entries) {
                if (e.name.startsWith('.') || e.name === 'node_modules') continue;
                if (e.name === '_archive' || e.name === '_source') continue;
                const full = path.join(d, e.name);
                if (e.isDirectory()) { stack.push(full); }
                else if (e.isFile() && e.name.endsWith('.html')) { out.push(full); }
            }
        }
        return out;
    }

    function categorize(id) {
        if (id.startsWith('eth-') && id.endsWith('-quiz')) return 'eth-NN-quiz';
        if (id.startsWith('shield-pis-w') && id.endsWith('-quiz')) return 'shield-pis-w-quiz';
        if (id.startsWith('pis-')) return 'pis-NN';
        if (id.startsWith('aplus-core1-')) return 'aplus-core1';
        if (id.startsWith('wsa-m')) return 'wsa-mNN';
        if (id.startsWith('ala-')) return 'ala-NN';
        return 'other';
    }

    const CATEGORY_META = {
        'eth-NN-quiz':       { track: 'A-delete',   reason: 'Post-deprecation phantom (commit ec3056f0 removed embedded chapter quizzes 2026-04-28; static + Firestore entries were never cleaned up).' },
        'shield-pis-w-quiz': { track: 'B-delete',   reason: 'STR-40 marathon (2026-05-06) seeded these for a server-grade migration that never landed; HTML calls pis-w[1-4]-quiz via client-graded ModuleProgress.completeQuiz.' },
        'pis-NN':            { track: 'A-delete',   reason: 'Post-deprecation phantom (PIS chapter pages migrated to presentations/labs/exams + pis-r1..r5 review structure; bare pis-NN-* IDs unreachable).' },
        'aplus-core1':       { track: 'A-delete',   reason: 'Post-rename phantom (hub uses forge-aplus-core1-chNN prefix; bare aplus-core1-chNN/lab-* IDs unreachable).' },
        'wsa-mNN':           { track: 'B-pending',  reason: 'Three attempted ID schemes for WSA modules (m01 / wsa-module01 / wsa-mNN). WSA hub currently uses bare data-module="m01". Decision pending: WSA owner must specify intended grading model.' },
        'ala-NN':            { track: 'A-delete',   reason: 'Post-deprecation phantom (ala-NN chapter files only exist in _archive/; current course uses ala-l* lab IDs).' },
        'other':             { track: 'unknown',    reason: 'Uncategorized. Manual investigation needed — grep _app for any callsite, then check git log for rename history.' },
    };

    function runScan() {
        if (!fs.existsSync(KEYS_FILE)) {
            return { available: false, reason: 'quiz_keys.json not found at ' + KEYS_FILE };
        }
        const keys = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
        const ids = Object.keys(keys);
        if (ids.length === 0) {
            return { available: false, reason: 'quiz_keys.json contains zero IDs' };
        }

        const escaped = ids.map(escapeRegex);
        const pattern = new RegExp(
            '(?<![a-zA-Z0-9_-])(' + escaped.join('|') + ')(?![a-zA-Z0-9_-])',
            'g'
        );

        const counts = Object.create(null);
        for (const id of ids) counts[id] = 0;

        const htmlFiles = listHtmlFiles(APP_DIR);
        for (const file of htmlFiles) {
            let content;
            try { content = fs.readFileSync(file, 'utf8'); } catch (e) { continue; }
            for (const m of content.matchAll(pattern)) {
                counts[m[1]]++;
            }
        }

        const orphans = ids.filter(id => counts[id] === 0).sort();

        // Self-validation gate — for each KNOWN_ORPHAN that is STILL in the
        // input registry, it MUST be classified as orphan. Once Track A
        // cleanup removes an ID from quiz_keys.json, that ID drops out of
        // validation entirely (not in input → not checked). This avoids
        // the time-bomb where partial cleanup would silently break the
        // tool by causing self-validation to fail on already-deleted IDs.
        const stillInInput = KNOWN_ORPHANS.filter(id => Object.prototype.hasOwnProperty.call(keys, id));
        const missing = stillInInput.filter(id => !orphans.includes(id));
        if (missing.length > 0) {
            return {
                available: false,
                reason: 'Self-validation failure: ' + missing.length + ' known orphans still present in quiz_keys.json but not classified as orphan (regex/scope bug): ' + missing.join(', '),
            };
        }

        // Group by category
        const byCategory = {};
        for (const id of orphans) {
            const cat = categorize(id);
            if (!byCategory[cat]) byCategory[cat] = [];
            byCategory[cat].push(id);
        }

        return {
            available: true,
            totalKeys: ids.length,
            orphanCount: orphans.length,
            liveCount: ids.length - orphans.length,
            htmlFilesScanned: htmlFiles.length,
            orphans,
            byCategory,
        };
    }

    function getFindings() {
        const r = runScan();
        if (!r.available) return [];

        const findings = [];
        for (const [cat, qids] of Object.entries(r.byCategory)) {
            const meta = CATEGORY_META[cat] || CATEGORY_META.other;
            const sample = qids.slice(0, 5).join(', ') + (qids.length > 5 ? ', ...' : '');
            findings.push({
                id: 'XREF-002_' + cat,
                code: 'XREF-002',
                severity: 'medium',
                category: 'xref',
                source: 'quiz-key-callsite',
                file: 'functions/quiz_keys.json',
                message: '[' + meta.track + '] ' + qids.length + ' orphan quiz_keys (category: ' + cat + '): ' + sample,
                fix: meta.reason + ' Track A: schedule deletion under Nancy + operator review. Track B: WSA-owner / grading-model decision required.',
                metadata: {
                    category: cat,
                    track: meta.track,
                    quizIds: qids,
                    count: qids.length,
                },
            });
        }
        return findings;
    }

    function getStatus() {
        const r = runScan();
        if (!r.available) {
            return { available: false, reason: r.reason };
        }
        return {
            available: true,
            name: 'Quiz-Key Callsite (XREF-002)',
            issueCount: Object.keys(r.byCategory).length,
            bySeverity: { critical: 0, high: 0, medium: Object.keys(r.byCategory).length, low: 0, info: 0 },
            orphanCount: r.orphanCount,
            totalKeys: r.totalKeys,
        };
    }

    return {
        name,
        getStatus,
        commands: {
            '': (args, flags) => {
                const r = runScan();
                const C = { red:'\x1b[31m', yellow:'\x1b[33m', cyan:'\x1b[36m', bold:'\x1b[1m', dim:'\x1b[2m', green:'\x1b[32m', reset:'\x1b[0m' };

                if (flags.json) {
                    console.log(JSON.stringify(r, null, 2));
                    return r;
                }

                console.log('');
                console.log(`${C.bold}QUIZ-KEY CALLSITE XREF-002 — ORPHAN QUIZ_KEYS${C.reset}`);
                console.log(`${C.dim}${'─'.repeat(60)}${C.reset}`);

                if (!r.available) {
                    console.log(`  ${C.red}UNAVAILABLE${C.reset}: ${r.reason}`);
                    console.log(`${C.dim}${'─'.repeat(60)}${C.reset}`);
                    console.log('');
                    return r;
                }

                if (r.orphanCount === 0) {
                    console.log(`  ${C.green}No orphan quiz_keys detected.${C.reset} ${C.dim}Backlog clean.${C.reset}`);
                    console.log(`${C.dim}${'─'.repeat(60)}${C.reset}`);
                    console.log('');
                    return r;
                }

                console.log(`  Total keys:       ${C.bold}${r.totalKeys}${C.reset}`);
                console.log(`  Orphans:          ${C.yellow}${r.orphanCount}${C.reset}`);
                console.log(`  Live:             ${C.green}${r.liveCount}${C.reset}`);
                console.log(`  HTML scanned:     ${r.htmlFilesScanned}`);
                console.log(`  Categories:       ${Object.keys(r.byCategory).length}`);
                console.log('');
                for (const [cat, qids] of Object.entries(r.byCategory)) {
                    const meta = CATEGORY_META[cat] || CATEGORY_META.other;
                    console.log(`  ${C.bold}${cat}${C.reset} (${qids.length}) — ${C.cyan}${meta.track}${C.reset}`);
                    console.log(`    ${C.dim}${meta.reason}${C.reset}`);
                    qids.slice(0, 8).forEach(q => console.log(`      ${q}`));
                    if (qids.length > 8) console.log(`      ${C.dim}... and ${qids.length - 8} more${C.reset}`);
                }
                console.log(`${C.dim}${'─'.repeat(60)}${C.reset}`);
                console.log(`  ${C.dim}Run \`node _tools/eduscan/quiz-key-callsite-audit.js\` for the full per-ID list.${C.reset}`);
                console.log('');
                return r;
            }
        },
        getFindings,
    };
};
