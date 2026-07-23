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

    // QUIZ-011 Karl-PASS allowlist: quizzes whose answer arrays were verbatim
    // Karl Mode-2 verified. Suppression requires a CURRENT hash match against
    // the audited array (getAnswerHash, single source of truth in
    // placeholder-detector.js). Scope note: if a verified quiz's own array is
    // later edited, its fingerprint changes and it usually just EXITS the
    // cluster (falls to a singleton) — that self-drift is QUIZ-011B's job
    // (heuristics.js), not QUIZ-DUP's. What the hash check here protects is
    // the copycat-contamination case: an unverified quiz copying a verified
    // quiz's current array must keep the cluster firing (see .every() below).
    // Fail-open on any load error: no allowlist => nothing suppressed.
    // Trigger case 2026-07-23: az900-ch03-quiz (verified 05-09) + ceh-01
    // (verified 07-15) share the same balanced cycling array by authoring
    // convention => permanent QUIZ-DUP HIGH false positive on every scan.
    function loadVerifiedHashes() {
        try {
            const allowPath = path.join(projectRoot, '_tools/eduscan/config/quiz-011-allowlist.json');
            const { getAnswerHash } = require(path.join(projectRoot, 'functions/placeholder-detector.js'));
            const entries = JSON.parse(fs.readFileSync(allowPath, 'utf8')).entries || [];
            return { map: new Map(entries.map(e => [e.id, e.answerHash])), getAnswerHash };
        } catch (e) {
            return { map: new Map(), getAnswerHash: null };
        }
    }

    function detectClusters() {
        if (!fs.existsSync(keysPath)) return [];
        const keys = JSON.parse(fs.readFileSync(keysPath, 'utf8'));
        const verified = loadVerifiedHashes();
        const fp = new Map();
        for (const [qid, entry] of Object.entries(keys)) {
            if (!entry || !Array.isArray(entry.answers)) continue;
            // Skip entries documented as orphans (no live UI callsite). Keeps
            // historical Karl-verified fossils (e.g., `security`) out of the
            // cluster detector — their content correctness is moot because
            // gradeQuiz is never called against them. orphanNote field
            // documents the lineage for future audits.
            if (entry.orphan === true) continue;
            // Skip entries verified as one of the "shuffle-at-render" architecture
            // patterns. The quiz author places correct answers at a deterministic
            // position (A=0, B=1) or in a cycling distribution (Cycle-4 = 0,1,2,3
            // per topic-block of 4); renderer shuffles answer positions per
            // session so students don't see the pattern. The resulting Firestore
            // key is correct BY DESIGN. Cross-quiz clustering on identical arrays
            // in this family is a structural false positive. Audit artifacts:
            //   ~/hexworth-shared/Solutions/_audit/karl-qc48-*.md     (Discipline A)
            //   ~/hexworth-shared/Solutions/_audit/qc49-*.md          (Discipline B + Cycle-4)
            if (entry.disciplineA === true) continue;
            if (entry.disciplineB === true) continue;
            if (entry.disciplineCycle4 === true) continue;
            // Skip entries that are explicit aliases of another canonical quiz_keys
            // entry (same underlying content, multiple IDs registered). The
            // canonical entry remains in the cluster detector; alias entries are
            // suppressed because their identical-array status is correct by
            // construction. Tracks the dual-registration backlog (Task #90).
            if (entry.aliasOf) continue;
            if (!entry.answers.every(v => Number.isInteger(v))) continue;
            if (entry.answers.length < MIN_LEN) continue;
            const k = entry.answers.join(',');
            if (!fp.has(k)) fp.set(k, []);
            fp.get(k).push(qid);
        }
        const out = [];
        for (const [key, qids] of fp) {
            if (qids.length < 2) continue;
            // Suppress a cluster ONLY when EVERY member is Karl-verified with
            // a current hash match — independently-verified quizzes sharing a
            // balanced array by authoring convention is a structural false
            // positive (az900-ch03-quiz + ceh-01, 2026-07-23). Clusters with
            // ANY unverified member still fire in full: a hand-copy of a
            // verified key onto a new quiz must not evade detection (removing
            // verified members from clustering instead would shrink such a
            // pair below the 2-member threshold and hide the copycat).
            if (verified.getAnswerHash && qids.every(q =>
                verified.map.get(q) === verified.getAnswerHash(keys[q].answers))) continue;
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
            id: 'QUIZ-DUP_' + [...c.qids].sort()[0].replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40),
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

    function getStatus() {
        if (!fs.existsSync(keysPath)) {
            return { available: false, reason: 'quiz_keys.json not found' };
        }
        const clusters = detectClusters();
        const placeholders = clusters.filter(c => c.isPlaceholder).length;
        const handCopy = clusters.length - placeholders;
        return {
            available: true,
            name: 'Quiz-Sync (C9)',
            issueCount: clusters.length,
            bySeverity: {
                critical: 0,
                high: placeholders,
                medium: handCopy,
                low: 0,
                info: 0,
            },
            placeholders,
            handCopy,
        };
    }

    return {
        name,
        getStatus,
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
