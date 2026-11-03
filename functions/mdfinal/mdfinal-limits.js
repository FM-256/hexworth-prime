/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-limits.js — every cap the MD-100 final engine enforces, as data.
 *
 * Design spec: _docs/operations/md100-final-exam-spec-v2-2026-11-03.md, R3 (caps and storage),
 * R4 (shell limits), 13.2 item 5 (submit is exempt from the size guard).
 *
 * One file so the engine and the adversarial tests read the same numbers: a test that hard-codes
 * its own copy of a cap passes against a cap that has since moved. Frozen, so no caller can raise
 * a limit at run time.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    /* Recursively freezes a plain data tree and returns it. */
    function deepFreeze(o) {
        Object.keys(o).forEach(function (k) {
            if (o[k] && typeof o[k] === 'object') { deepFreeze(o[k]); }
        });
        return Object.freeze(o);
    }

    var LIMITS = deepFreeze({
        /* R4: one console line */
        command: { maxChars: 500, maxTokens: 64, maxPipelineStages: 4,
                   maxMatcherSteps: 50000, maxOutputLines: 400, historyKept: 200 },
        /* R3: action params, checked before any handler runs */
        params: { maxBytes: 4096, maxDepth: 4, maxString: 500, maxArray: 32, maxKeys: 32,
                  keyPattern: '^[A-Za-z][A-Za-z0-9]{0,31}$' },
        /* R3: objects a student can create */
        objects: {
            localUsers: 20, localGroups: 20, membersPerGroup: 20,
            firewallRules: 40, shares: 10, acesPerShare: 16,
            aclPaths: 50, acesPerPath: 16,
            files: 200, fileBytes: 8192,
            partitionsPerDisk: 8, volumes: 12,
            defenderExclusions: 20, hostsLines: 50,
            regScratchValues: 100, regScratchBytes: 1024
        },
        /* R3: logs. The graded ledger is never evicted; at the cap, state-changing calls are refused. */
        events: { ringSize: 500, detailChars: 300 },
        ledger: { maxEntries: 2000, refBytes: 64 },
        /* R3 and 13.2 item 5: P8 answer values */
        answers: { optionIdChars: 32, typedChars: 64 },
        /* R3 and 13.2 item 5: whole session document, measured with Buffer.byteLength. Submit,
         * auto-submit, sweep and expiry are exempt from documentBytes and from the ledger cap, and
         * reportHeadroomBytes is kept free for reportJson. The archive must fit in one Firestore
         * document (1 MiB). */
        storage: { documentBytes: 700000, reportHeadroomBytes: 65536, archiveMaxBytes: 1048576 }
    });

    var STORAGE_MESSAGE = "This change would exceed the lab's storage limit.";

    module.exports = { LIMITS: LIMITS, STORAGE_MESSAGE: STORAGE_MESSAGE, deepFreeze: deepFreeze };
})();
