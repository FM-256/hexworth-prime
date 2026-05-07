/**
 * Quiz Quality Monitor — Scheduled Self-Improve Cloud Function.
 *
 * Runs weekly. Reads /quiz_keys/{quizId} collection from Firestore directly,
 * fingerprints integer-only answer arrays, and writes _triage_queue/quiz_dup_*
 * items for any cross-quiz duplicates (length >= 8 to avoid coincidence).
 *
 * Mirrors the C9 logic in _tools/quiz-sync/sync-helper.js but runs in the
 * cloud — no manual invocation needed. The static helper remains the
 * primary tool for ad-hoc operator checks; this CF is the safety net.
 *
 * Auto-resolves prior open quiz_dup_* items if the duplicate cluster
 * is no longer detected (cluster fixed by operator).
 *
 * Cost: one weekly invocation. ~500 reads on quiz_keys collection.
 * Negligible.
 */

const { onSchedule } = require('firebase-functions/v2/scheduler');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const MIN_LENGTH_FOR_DUP_CHECK = 8;

const quizQualityMonitor = onSchedule(
    { schedule: 'every monday 04:00', region: 'us-central1', timeZone: 'America/New_York' },
    async () => {
        const db = getFirestore();
        const snap = await db.collection('quiz_keys').get();

        const fingerprints = new Map();  // arrayKey → [quizIds]

        snap.forEach(doc => {
            const data = doc.data();
            const ans = data && data.answers;
            if (!Array.isArray(ans)) return;
            if (!ans.every(v => Number.isInteger(v))) return;
            if (ans.length < MIN_LENGTH_FOR_DUP_CHECK) return;
            const key = ans.join(',');
            if (!fingerprints.has(key)) fingerprints.set(key, []);
            fingerprints.get(key).push(doc.id);
        });

        const dups = [];
        for (const [key, qids] of fingerprints) {
            if (qids.length >= 2) {
                const arr = key.split(',').map(s => parseInt(s, 10));
                const allSame = arr.every(v => v === arr[0]);
                const isCycle = (() => {
                    if (arr.length < 8) return false;
                    for (let p = 2; p <= 4; p++) {
                        let cyc = true;
                        for (let i = p; i < arr.length; i++) {
                            if (arr[i] !== arr[i % p]) { cyc = false; break; }
                        }
                        if (cyc) return true;
                    }
                    return false;
                })();
                dups.push({
                    key,
                    qids,
                    arrayLength: arr.length,
                    isPlaceholder: allSame || isCycle,
                });
            }
        }

        const triageCol = db.collection('_triage_queue');
        const detectedIds = new Set();

        // Write/refresh triage items for each cluster.
        // docId uses alphabetically-first quizId as a STABLE anchor so the
        // same cluster keeps the same triage doc across runs regardless of
        // Firestore iteration order. Without this, anchor churn causes
        // unnecessary auto-resolve + recreate cycles.
        for (const c of dups) {
            const anchor = [...c.qids].sort()[0];
            const docId = 'quiz_dup_' + anchor.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
            detectedIds.add(docId);
            const sev = c.isPlaceholder ? 'high' : 'medium';
            const msg = (c.isPlaceholder ? '[PLACEHOLDER] ' : '[HAND-COPY DRIFT] ') +
                c.qids.length + ' quizzes share identical ' + c.arrayLength + '-element answer array: ' +
                c.qids.slice(0, 5).join(', ') + (c.qids.length > 5 ? ', ...' : '');
            await triageCol.doc(docId).set({
                code: 'QUIZ-DUP',
                severity: sev,
                source: 'quizQualityMonitor',
                message: msg,
                file: 'Firestore quiz_keys/',
                status: 'open',
                detectedAt: FieldValue.serverTimestamp(),
                lastSeenAt: FieldValue.serverTimestamp(),
                occurrences: FieldValue.increment(1),
                quizIds: c.qids,
                arrayLength: c.arrayLength,
                isPlaceholder: c.isPlaceholder,
            }, { merge: true });
        }

        // Auto-resolve prior open quiz_dup_* items that are no longer detected
        const priorSnap = await triageCol
            .where('code', '==', 'QUIZ-DUP')
            .where('status', '==', 'open')
            .get();
        let resolved = 0;
        const batch = db.batch();
        priorSnap.forEach(doc => {
            if (!detectedIds.has(doc.id)) {
                batch.update(doc.ref, {
                    status: 'resolved',
                    resolvedAt: FieldValue.serverTimestamp(),
                    resolution: 'auto-resolved by quizQualityMonitor — cluster no longer present in Firestore quiz_keys',
                });
                resolved++;
            }
        });
        if (resolved > 0) await batch.commit();

        return {
            scanned: snap.size,
            duplicates: dups.length,
            placeholders: dups.filter(d => d.isPlaceholder).length,
            handCopyDrift: dups.filter(d => !d.isPlaceholder).length,
            autoResolved: resolved,
        };
    }
);

module.exports = { quizQualityMonitor };
