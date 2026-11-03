#!/usr/bin/env node
/**
 * mdfinal-limits.test.js — every R3/R4 cap pinned to the spec's literal value.
 *
 * @catalog what    Pins mdfinal-limits.js to spec R3/R4/13.2 item 5 and checks the storage headroom
 * @catalog what    arithmetic (document + report headroom fits one Firestore document).
 * @catalog run     node _tools/mdfinal/mdfinal-limits.test.js
 * @catalog status  TOOL
 *
 * The literals here are copied from the spec, not from the module, so moving a cap is a visible edit
 * in two places.
 */
const kit = require('./mdfinal-test-kit.js');
const { LIMITS: L, STORAGE_MESSAGE } = kit.req('mdfinal-limits.js');
const t = kit.harness('mdfinal-limits');
const SPEC = {
    command: { maxChars: 500, maxTokens: 64, maxPipelineStages: 4, maxMatcherSteps: 50000, maxOutputLines: 400, historyKept: 200 },
    params: { maxBytes: 4096, maxDepth: 4, maxString: 500, maxArray: 32, maxKeys: 32, keyPattern: '^[A-Za-z][A-Za-z0-9]{0,31}$' },
    objects: { localUsers: 20, localGroups: 20, membersPerGroup: 20, firewallRules: 40, shares: 10, acesPerShare: 16,
               aclPaths: 50, acesPerPath: 16, files: 200, fileBytes: 8192, partitionsPerDisk: 8, volumes: 12,
               defenderExclusions: 20, hostsLines: 50, regScratchValues: 100, regScratchBytes: 1024 },
    events: { ringSize: 500, detailChars: 300 },
    ledger: { maxEntries: 2000, refBytes: 64 },
    answers: { optionIdChars: 32, typedChars: 64 },
    storage: { documentBytes: 700000, reportHeadroomBytes: 65536, archiveMaxBytes: 1048576 }
};
t.check(JSON.stringify(L) === JSON.stringify(SPEC), 'limits equal the spec literals');
t.check(L.storage.documentBytes + L.storage.reportHeadroomBytes < L.storage.archiveMaxBytes, 'document + report headroom fits one Firestore document');
t.check(L.ledger.maxEntries * 80 < L.storage.documentBytes / 2, 'a full ledger (about 80 B per entry) uses under half the document');
t.check(STORAGE_MESSAGE === "This change would exceed the lab's storage limit.", 'storage refusal text');
t.check(Object.isFrozen(L) && Object.isFrozen(L.storage) && Object.isFrozen(L.objects), 'limits frozen');
t.done();
