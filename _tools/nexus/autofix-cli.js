'use strict';
// Self-Healing Pipeline — Agent-side CLI helpers
// Slice 3f / Phase D. Used by marathon Claude (or a future agent harness)
// to interact with _auto_fix_queue items.
//
// All operations are gated by _system_config/self_healing.enabled.
// If the master switch is OFF, every command refuses with exit 2.
//
// Design doc: _docs/features/SELF_HEALING_PIPELINE.md

const path = require('path');
const FUNCTIONS_DIR = path.resolve(__dirname, '../../functions');

let _admin = null;
let _db = null;

function getAdmin() {
    if (_admin) return _admin;
    process.env.GOOGLE_CLOUD_PROJECT = 'hexworth-prime';
    _admin = require(path.join(FUNCTIONS_DIR, 'node_modules/firebase-admin'));
    if (!_admin.apps.length) _admin.initializeApp({ projectId: 'hexworth-prime' });
    _db = _admin.firestore();
    return _admin;
}

function getDb() {
    if (!_db) getAdmin();
    return _db;
}

function nowIso() { return new Date().toISOString(); }

/**
 * Resolve agent identity. Marathon Claude can override via NEXUS_AGENT_ID
 * env (e.g. agent:marathon-2026-04-29-night). Default produces a session-scoped id.
 */
function getAgentId() {
    const fromEnv = process.env.NEXUS_AGENT_ID;
    if (fromEnv && /^(agent|human):[a-z0-9_-]+$/.test(fromEnv)) return fromEnv;
    // Fall back to a process-scoped agent id
    const sessionTag = `${Date.now().toString(36)}-${process.pid}`;
    return `agent:cli-${sessionTag}`;
}

/**
 * Read the master kill switch. Returns { enabled: bool, enabledTemplates: [] }.
 * If the doc doesn't exist, defaults to disabled.
 */
async function getSystemConfig() {
    const db = getDb();
    const snap = await db.doc('_system_config/self_healing').get();
    if (!snap.exists) return { enabled: false, enabledTemplates: [] };
    const d = snap.data() || {};
    return {
        enabled: !!d.enabled,
        enabledTemplates: Array.isArray(d.enabledTemplates) ? d.enabledTemplates : [],
    };
}

/**
 * Throw a labeled error if the master toggle is off OR the rule is not in
 * the per-template allowlist. Caller catches and exits with code 2.
 */
async function requireEnabledForRule(ruleCode) {
    const cfg = await getSystemConfig();
    if (!cfg.enabled) {
        throw new Error('GATE: master toggle is OFF — enable in Pulse before running agent commands');
    }
    if (ruleCode && !cfg.enabledTemplates.includes(ruleCode)) {
        throw new Error(`GATE: template ${ruleCode} is not in the enabled allowlist (run setTemplateEnabled in Pulse)`);
    }
}

/**
 * Append a history entry to a queue item via transaction. Caller passes
 * an updates object (status / owner / etc.) and the action label.
 * The transaction re-checks status to avoid races.
 */
async function _mutate(collection, itemId, updates, action, note, expectedStatuses) {
    const admin = getAdmin();
    const db = getDb();
    const { FieldValue } = admin.firestore;
    const ref = db.doc(`${collection}/${itemId}`);
    const actor = getAgentId();
    return db.runTransaction(async (txn) => {
        const snap = await txn.get(ref);
        if (!snap.exists) throw new Error(`item not found: ${collection}/${itemId}`);
        const f = snap.data();
        if (Array.isArray(expectedStatuses) && !expectedStatuses.includes(f.status)) {
            throw new Error(`status mismatch: expected ${expectedStatuses.join('|')} got ${f.status}`);
        }
        const historyEntry = {
            ts: nowIso(),
            actor: actor,
            action: action,
            note: note || null,
        };
        const newHistory = (Array.isArray(f.history) ? f.history : [])
            .concat([historyEntry])
            .slice(-20);
        const finalUpdate = Object.assign({}, updates, {
            updatedAt: FieldValue.serverTimestamp(),
            history: newHistory,
        });
        txn.update(ref, finalUpdate);
        return { actor, action, ...finalUpdate };
    });
}

/**
 * autofix-status — print system state. Always allowed even when disabled.
 */
async function cmdStatus() {
    const cfg = await getSystemConfig();
    const db = getDb();
    const tQ = await db.collection('_auto_fix_queue').where('status', '==', 'open').count().get();
    const tC = await db.collection('_auto_fix_queue').where('status', 'in', ['claimed', 'in-progress']).count().get();
    const tT = await db.collection('_triage_queue').where('status', '==', 'open').count().get();
    console.log('');
    console.log('  Self-Healing System Status');
    console.log('');
    console.log(`    master toggle        : ${cfg.enabled ? 'ENABLED' : 'DISABLED'}`);
    console.log(`    enabled templates    : ${cfg.enabledTemplates.length ? cfg.enabledTemplates.join(', ') : '(none)'}`);
    console.log(`    agent id             : ${getAgentId()}`);
    console.log(`    _triage_queue open   : ${tT.data().count || 0}`);
    console.log(`    _auto_fix_queue open : ${tQ.data().count || 0}`);
    console.log(`    _auto_fix_queue busy : ${tC.data().count || 0}`);
    console.log('');
    return 0;
}

/**
 * autofix-claim [--rule <code>] — claim the highest-priority open item.
 * Prints JSON of the claimed item or 'no claimable items'.
 */
async function cmdClaim(args, flags) {
    await requireEnabledForRule(flags.rule || null);
    const admin = getAdmin();
    const db = getDb();
    const { FieldValue } = admin.firestore;
    let queryRef = db.collection('_auto_fix_queue').where('status', '==', 'open');
    if (flags.rule) queryRef = queryRef.where('rule', '==', flags.rule);
    queryRef = queryRef.orderBy('priority', 'desc').limit(1);
    const snap = await queryRef.get();
    if (snap.empty) {
        console.log(JSON.stringify({ claimed: false, reason: 'no claimable items' }));
        return 0;
    }
    const doc = snap.docs[0];
    try {
        await _mutate('_auto_fix_queue', doc.id, {
            status: 'claimed',
            owner: getAgentId(),
            claimedAt: FieldValue.serverTimestamp(),
            heartbeatAt: FieldValue.serverTimestamp(),
        }, 'claim', null, ['open']);
    } catch (err) {
        console.log(JSON.stringify({ claimed: false, reason: err.message }));
        return 1;
    }
    const data = doc.data();
    console.log(JSON.stringify({
        claimed: true,
        itemId: doc.id,
        rule: data.rule,
        title: data.title,
        groupKey: data.groupKey,
        childPaths: data.childPaths,
        defectFingerprint: data.defectFingerprint,
        owner: getAgentId(),
    }, null, 2));
    return 0;
}

/**
 * autofix-heartbeat <itemId> — extend heartbeat on a claimed item.
 * Refuses if the item is not currently claimed by THIS agent.
 */
async function cmdHeartbeat(args) {
    const itemId = args[0];
    if (!itemId) { console.error('usage: autofix-heartbeat <itemId>'); return 1; }
    await requireEnabledForRule(null);
    const admin = getAdmin();
    const { FieldValue } = admin.firestore;
    const myActor = getAgentId();
    try {
        await _mutate('_auto_fix_queue', itemId, {
            heartbeatAt: FieldValue.serverTimestamp(),
            status: 'in-progress',
        }, 'heartbeat', null, ['claimed', 'in-progress']);
    } catch (err) {
        console.error(`heartbeat failed: ${err.message}`);
        return 1;
    }
    // OWNERSHIP CHECK IS ADVISORY (Nancy round 6 documented gap):
    // The transaction validates status but NOT owner — any admin-CLI session
    // that knows itemId can heartbeat any claimed item. Acceptable while
    // there's only one human admin; before adding a second concurrent
    // marathon agent, add `owner === getAgentId()` to the txn re-check.
    const snap = await getDb().doc(`_auto_fix_queue/${itemId}`).get();
    const owner = snap.data() && snap.data().owner;
    if (owner !== myActor) {
        console.warn(`warning: item owner is ${owner}, not ${myActor} — heartbeat still recorded`);
    }
    console.log(JSON.stringify({ itemId, heartbeatAt: nowIso() }));
    return 0;
}

/**
 * autofix-resolve <itemId> [--commit <sha>] [--note <text>] — mark resolved.
 */
async function cmdResolve(args, flags) {
    const itemId = args[0];
    if (!itemId) { console.error('usage: autofix-resolve <itemId> [--commit <sha>] [--note <text>]'); return 1; }
    await requireEnabledForRule(null);
    const admin = getAdmin();
    const { FieldValue } = admin.firestore;
    try {
        await _mutate('_auto_fix_queue', itemId, {
            status: 'resolved',
            resolvedAt: FieldValue.serverTimestamp(),
            resolvedBy: getAgentId(),
            resolveCommitSha: flags.commit || null,
        }, 'resolve', flags.note || null, ['claimed', 'in-progress']);
    } catch (err) {
        console.error(`resolve failed: ${err.message}`);
        return 1;
    }
    console.log(JSON.stringify({ itemId, resolved: true, commit: flags.commit || null }));
    return 0;
}

/**
 * autofix-release <itemId> [--reason <text>] — voluntarily release a claim.
 * Use when the agent decides the item is too complex to auto-fix.
 */
async function cmdRelease(args, flags) {
    const itemId = args[0];
    if (!itemId) { console.error('usage: autofix-release <itemId> [--reason <text>]'); return 1; }
    // Release is allowed even if disabled — we want stuck claims to clear
    try {
        await _mutate('_auto_fix_queue', itemId, {
            status: 'open',
            owner: null,
            claimedAt: null,
            heartbeatAt: null,
        }, 'release-voluntary', flags.reason || 'agent voluntarily released', ['claimed', 'in-progress']);
    } catch (err) {
        console.error(`release failed: ${err.message}`);
        return 1;
    }
    console.log(JSON.stringify({ itemId, released: true }));
    return 0;
}

/**
 * autofix-apply <itemId> — full orchestrator for one queue item.
 *
 * Sequence:
 *   1. Load item from _auto_fix_queue
 *   2. Look up template + validator from registry
 *   3. Gate: master toggle ON + rule in enabledTemplates
 *   4. Claim the item (transactional)
 *   5. Heartbeat
 *   6. template.apply(item)
 *   7. Heartbeat
 *   8. validator.validate(item, applyResult)
 *   9a. If validated: mark resolved with evidence note
 *   9b. If NOT validated: call template.rollback(applyResult) if available,
 *       then release item with reason from validator
 *
 * Side-effect warning: apply() may modify files on disk. The orchestrator
 * does NOT git-commit those changes — the operator commits manually after
 * reviewing the diff. This is intentional per CONTRACT.md safety boundary.
 */
async function cmdApply(args, flags) {
    const itemId = args[0];
    if (!itemId) { console.error('usage: autofix-apply <itemId>'); return 1; }
    const dryFlag = !!flags['dry-run'];

    const db = getDb();
    const admin = getAdmin();
    const { FieldValue } = admin.firestore;

    // 1. Load item
    const ref = db.doc(`_auto_fix_queue/${itemId}`);
    const snap = await ref.get();
    if (!snap.exists) {
        console.error(`item not found: _auto_fix_queue/${itemId}`);
        return 1;
    }
    const item = Object.assign({ id: itemId }, snap.data());

    // 2. Look up template
    const registry = require('./fix-templates/registry');
    const template = registry.getTemplate(item.rule);
    const validator = registry.getValidator(item.rule);
    if (!template || !validator) {
        console.error(`no template/validator registered for rule ${item.rule}`);
        return 1;
    }

    // 3. Gate
    try {
        await requireEnabledForRule(item.rule);
    } catch (err) {
        console.error(err.message);
        return 2;
    }

    // 4. Claim (skip if --dry-run)
    if (!dryFlag) {
        try {
            await _mutate('_auto_fix_queue', itemId, {
                status: 'claimed',
                owner: getAgentId(),
                claimedAt: FieldValue.serverTimestamp(),
                heartbeatAt: FieldValue.serverTimestamp(),
            }, 'apply-claim', null, ['open']);
        } catch (err) {
            console.error(`claim failed: ${err.message}`);
            return 1;
        }
    }

    // 5. Heartbeat (no-op if --dry-run)
    if (!dryFlag) {
        try {
            await _mutate('_auto_fix_queue', itemId, {
                heartbeatAt: FieldValue.serverTimestamp(),
                status: 'in-progress',
            }, 'apply-heartbeat', null, ['claimed', 'in-progress']);
        } catch (err) {
            console.warn(`heartbeat failed: ${err.message}`);
        }
    }

    // 6. Apply
    let applyResult;
    try {
        applyResult = await template.apply(item);
    } catch (err) {
        console.error(`apply threw: ${err.message}`);
        if (!dryFlag) {
            try {
                await _mutate('_auto_fix_queue', itemId, {
                    status: 'open', owner: null, claimedAt: null, heartbeatAt: null,
                }, 'apply-failed-exception', err.message, ['claimed', 'in-progress']);
            } catch (e) { /* noop */ }
        }
        return 1;
    }
    if (!applyResult || !applyResult.success) {
        const msg = applyResult && applyResult.error ? applyResult.error : 'apply returned non-success';
        console.error(`apply rejected: ${msg}`);
        if (!dryFlag) {
            try {
                await _mutate('_auto_fix_queue', itemId, {
                    status: 'open', owner: null, claimedAt: null, heartbeatAt: null,
                }, 'apply-rejected', msg, ['claimed', 'in-progress']);
            } catch (e) { /* noop */ }
        }
        return 1;
    }

    // 7. Heartbeat after apply
    if (!dryFlag) {
        try {
            await _mutate('_auto_fix_queue', itemId, {
                heartbeatAt: FieldValue.serverTimestamp(),
            }, 'apply-heartbeat-2', null, ['claimed', 'in-progress']);
        } catch (err) { /* tolerated */ }
    }

    // 8. Validate
    let validateResult;
    try {
        validateResult = await validator.validate(item, applyResult);
    } catch (err) {
        validateResult = { validated: false, evidence: 'validator threw: ' + err.message, secondaryIssues: [] };
    }

    // 9. Resolve or rollback+release
    if (validateResult.validated) {
        if (!dryFlag) {
            try {
                await _mutate('_auto_fix_queue', itemId, {
                    status: 'resolved',
                    resolvedAt: FieldValue.serverTimestamp(),
                    resolvedBy: getAgentId(),
                    resolveCommitSha: null,  // operator commits manually
                }, 'apply-resolved', validateResult.evidence, ['claimed', 'in-progress']);
            } catch (err) {
                console.error(`resolve write failed: ${err.message}`);
            }
        }
        console.log(JSON.stringify({
            itemId, success: true, validated: true,
            applySummary: applyResult.summary,
            evidence: validateResult.evidence,
            filesChanged: applyResult.filesChanged || [],
            commitReminder: (applyResult.filesChanged || []).length > 0
                ? `IMPORTANT: ${(applyResult.filesChanged || []).length} file(s) modified — review and git commit manually`
                : null,
        }, null, 2));
        return 0;
    }

    // Validation failed — try to rollback
    let rollbackResult = { restored: false, summary: 'no rollback() implemented on template' };
    if (typeof template.rollback === 'function') {
        try {
            rollbackResult = await template.rollback(applyResult);
        } catch (err) {
            rollbackResult = { restored: false, summary: 'rollback threw: ' + err.message };
        }
    }
    if (!dryFlag) {
        try {
            await _mutate('_auto_fix_queue', itemId, {
                status: 'open', owner: null, claimedAt: null, heartbeatAt: null,
            }, 'apply-validate-failed', `validate: ${validateResult.evidence} | rollback: ${rollbackResult.summary}`, ['claimed', 'in-progress']);
        } catch (err) { /* noop */ }
    }
    console.log(JSON.stringify({
        itemId, success: false, validated: false,
        applySummary: applyResult.summary,
        validatorEvidence: validateResult.evidence,
        secondaryIssues: validateResult.secondaryIssues,
        rollback: rollbackResult,
        manualReviewRequired: !rollbackResult.restored,
    }, null, 2));
    return 1;
}

module.exports = {
    cmdStatus,
    cmdClaim,
    cmdHeartbeat,
    cmdResolve,
    cmdRelease,
    cmdApply,
    getSystemConfig,
    getAgentId,
};
