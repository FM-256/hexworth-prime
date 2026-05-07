#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Quiz Sync (C9) Spoke Adapter
 *
 * Surfaces cross-quiz duplicate answer arrays detected by sync-helper.js
 * into the Nexus pipeline. Findings show up in `nexus full` output and
 * the deploy gate.
 *
 * Reads functions/quiz_keys.json directly (fast — no Confluence calls).
 * Fingerprints integer-only answer arrays of length >= 8 and emits one
 * Nexus finding per duplicate-array cluster.
 *
 * Severity:
 *   - HIGH if cluster is a placeholder cycle (all-same or repeating)
 *   - MEDIUM if cluster appears to be hand-copy drift (varied content
 *     but identical between two or more quizzes)
 *
 * Nexus integration:
 *   nexus quiz-sync          Pretty-printed cluster report
 *   nexus quiz-sync --json   Machine-readable
 */
module.exports = function createQuizSyncAdapter({ name, dataPath, projectRoot }) {

    const keysPath = path.join(projectRoot, 'functions/quiz_keys.json');
    const MIN_LEN = 8;

    function detectClusters() {
        if (!fs.existsSync(keysPath)) return [];
        const keys = JSON.parse(fs.readFileSync(keysPath, 'utf8'));
        const fp = new Map();
        for (const [qid, entry] of Object.entries(keys)) {
            if (!entry || !Array.isArray(entry.answers)) continue;
            if (!entry.answers.every(v => Number.isInteger(v))) continue;
            if (entry.answers.length < MIN_LEN) continue;
            const k = entry.answers.join(',');
            if (!fp.has(k)) fp.set(k, []);
            fp.get(k).push(qid);
        }
        const out = [];
        for (const [key, qids] of fp) {
            if (qids.length < 2) continue;
            const arr = key.split(',').map(s => parseInt(s, 10));
            const allSame = arr.every(v => v === arr[0]);
            const isCycle = (() => {
                for (let p = 2; p <= 4; p++) {
                    let ok = true;
                    for (let i = p; i < arr.length; i++) {
                        if (arr[i] !== arr[i % p]) { ok = false; break; }
                    }
                    if (ok) return true;
                }
                return false;
            })();
            out.push({
                key,
                qids,
                arrayLength: arr.length,
                isPlaceholder: allSame || isCycle,
            });
        }
        return out;
    }

    function getFindings() {
        const clusters = detectClusters();
        return clusters.map(c => ({
            id: 'QUIZ-DUP_' + c.qids[0].replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40),
            code: 'QUIZ-DUP',
            severity: c.isPlaceholder ? 'high' : 'medium',
            category: 'quiz',
            source: 'quiz-sync',
            file: 'functions/quiz_keys.json',
            message: (c.isPlaceholder ? '[PLACEHOLDER] ' : '[HAND-COPY DRIFT] ') +
                c.qids.length + ' quizzes share identical ' + c.arrayLength +
                '-element answer array: ' + c.qids.slice(0, 5).join(', ') +
                (c.qids.length > 5 ? ', ...' : ''),
            fix: 'Run `node _tools/quiz-sync/sync-helper.js --quiz <id> --with-confluence` to verify against Confluence Verified Answer Index. Re-seed each quiz_keys/{quizId} with its specific answer key.',
            metadata: {
                quizIds: c.qids,
                arrayLength: c.arrayLength,
                isPlaceholder: c.isPlaceholder,
            }
        }));
    }

    return {
        name,
        commands: {
            '': (args, flags) => {
                const clusters = detectClusters();
                const C = { red:'\x1b[31m', yellow:'\x1b[33m', cyan:'\x1b[36m', bold:'\x1b[1m', dim:'\x1b[2m', reset:'\x1b[0m' };

                if (flags.json) {
                    console.log(JSON.stringify({ count: clusters.length, clusters }, null, 2));
                    return clusters;
                }

                console.log('');
                console.log(`${C.bold}QUIZ-SYNC C9 — CROSS-QUIZ DUPLICATE ANSWER ARRAYS${C.reset}`);
                console.log(`${C.dim}${'─'.repeat(60)}${C.reset}`);

                if (clusters.length === 0) {
                    console.log(`  No cross-quiz duplicates detected. ${C.cyan}Backlog clean.${C.reset}`);
                    console.log(`${C.dim}${'─'.repeat(60)}${C.reset}`);
                    console.log('');
                    return clusters;
                }

                console.log(`  Total clusters: ${C.bold}${clusters.length}${C.reset}`);
                const placeholders = clusters.filter(c => c.isPlaceholder).length;
                const drifts = clusters.length - placeholders;
                console.log(`    Placeholders: ${C.red}${placeholders}${C.reset}`);
                console.log(`    Hand-copy:    ${C.yellow}${drifts}${C.reset}`);
                console.log('');
                clusters.forEach(c => {
                    const tag = c.isPlaceholder ? `${C.red}[PLACEHOLDER]${C.reset}` : `${C.yellow}[DRIFT]${C.reset}`;
                    const preview = c.key.split(',').slice(0, 8).join(',');
                    console.log(`  ${tag} length=${c.arrayLength} [${preview}${c.arrayLength > 8 ? '...' : ''}]`);
                    c.qids.forEach(q => console.log(`    - ${q}`));
                });
                console.log(`${C.dim}${'─'.repeat(60)}${C.reset}`);
                console.log(`  ${C.dim}Run \`node _tools/quiz-sync/sync-helper.js --with-confluence\` for 3-source verification.${C.reset}`);
                console.log('');
                return clusters;
            }
        },
        getFindings,
    };
};
