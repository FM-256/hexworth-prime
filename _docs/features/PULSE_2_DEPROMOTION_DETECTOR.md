# PULSE-2 — Auto-Healing Pipeline De-Promotion Detector

**Status**: Design spec (sprint PULSE-2). Not yet implemented.
**Depends on**: PULSE-1 visibility layer (commit `3c496002`, awaiting deploy auth).
**Author/Last review**: 2026-05-08 marathon session (Nancy review pending).

## Problem statement

The self-healing pipeline currently has a one-way promotion path:

1. Operator authors a fix-template + validator pair under `_tools/nexus/fix-templates/<RULE>.{js,validator.js}`
2. Operator confirms full `autofix-dryrun` PASS against current findings
3. Operator manually edits `_tools/nexus/publish.js` to add the rule to `AUTO_FIX_ELIGIBLE_RULES`
4. The rule is now eligible to be claimed by agents from `_auto_fix_queue`

There is **no automated path off this list**. If a promoted rule's apply step starts failing (template bug, code drift, validator regression), the agent CLI continues claiming items, applying fixes, and seeing `validated: false` results. Items get released back to `open` via the dead-claim reaper or rollback path. The healer thrashes silently — no human is notified unless an operator inspects `_auto_fix_queue` history manually.

Nancy adversarial review (2026-04-29) flagged this as a blocker concern: **"You cannot add promotion without de-promotion."** PULSE-1 surfaces healer state to Pulse, but only as observation; PULSE-2 is the corrective control.

## Goals

1. **Auto-detect a promoted rule that has gone bad.** Specifically: ≥3 consecutive `apply-validate-failed` history entries on items of the same `rule` field within a 30-minute window.
2. **Auto-disable the bad rule** by writing to `_system_config/self_healing.enabledTemplates` (per-template gate). Master toggle stays on; only the offending template is paused.
3. **Surface the auto-disable to humans** by writing a critical-severity item to `_triage_queue` with rule code, recent failures, and rationale.
4. **Preserve recovery path** — operator who fixes the template and reverifies via `autofix-dryrun` can re-add the rule to `enabledTemplates` via Pulse toggle (existing UI). No change to the promotion gate itself.

## Non-goals

- Auto-promotion of new rules (deferred per Nancy review until ≥3 promoted rules with months of clean operating history).
- Removal from `AUTO_FIX_ELIGIBLE_RULES` source code. Only the runtime per-template flag is flipped. Code-level removal stays manual.
- Fix-template `apply()` hardening (separate scope — Nancy concern #4 about regex-based string edits in CAT-002.js — tracked separately).

## Detection signals

A rule is considered "going bad" when ALL of the following hold:

- Rule code is in `AUTO_FIX_ELIGIBLE_RULES` (currently only CAT-002).
- Rule has at least 3 history entries with `action: 'apply-validate-failed'` from `actor.startsWith('agent:')` within the last 30 minutes.
- Each failure is on a different `itemId` (so a single bad item retried doesn't trigger).
- The rule's per-template flag in `_system_config/self_healing.enabledTemplates` is currently ON (no point auto-disabling something already off).

The 3-failure threshold matches the existing PULSE-1 banner's `APPLY-ERROR-SPIKE` state, deliberately — they're observations of the same condition. PULSE-2 adds the corrective action.

## Architecture

### Trigger source

A scheduled Cloud Function: `detectAutoHealingFailureSpike`, runs every 5 minutes (same cadence as the dead-claim reaper).

Location: `functions/index.js` alongside other scheduled CFs.

### Detection logic

```js
exports.detectAutoHealingFailureSpike = onSchedule({ schedule: 'every 5 minutes' }, async () => {
    const cfg = await db.doc('_system_config/self_healing').get();
    const enabledTemplates = (cfg.data() || {}).enabledTemplates || [];
    if (enabledTemplates.length === 0) return;

    const thirtyMinAgo = Date.now() - 30 * 60 * 1000;
    const queueSnap = await db.collection('_auto_fix_queue').get();

    // Group recent failures by rule
    const failuresByRule = new Map();
    queueSnap.forEach(doc => {
        const d = doc.data() || {};
        const hist = Array.isArray(d.history) ? d.history : [];
        hist.forEach(h => {
            if (!String(h.actor || '').startsWith('agent:')) return;
            if (h.action !== 'apply-validate-failed') return;
            const ts = Date.parse(h.ts || '');
            if (!ts || ts < thirtyMinAgo) return;
            const rule = d.rule;
            if (!rule || !enabledTemplates.includes(rule)) return;
            if (!failuresByRule.has(rule)) failuresByRule.set(rule, new Set());
            failuresByRule.get(rule).add(doc.id);
        });
    });

    // Auto-disable any rule with ≥3 distinct failed items
    for (const [rule, items] of failuresByRule) {
        if (items.size < 3) continue;
        await disableTemplateAndAlert(rule, [...items]);
    }
});
```

### Disable + alert

```js
async function disableTemplateAndAlert(rule, itemIds) {
    // Idempotent: txn re-reads enabledTemplates and only disables if still on
    await db.runTransaction(async txn => {
        const ref = db.doc('_system_config/self_healing');
        const snap = await txn.get(ref);
        const cur = (snap.data() || {}).enabledTemplates || [];
        if (!cur.includes(rule)) return; // already disabled, skip
        const next = cur.filter(r => r !== rule);
        txn.set(ref, {
            enabledTemplates: next,
            lastAutoDisable: { rule, at: FieldValue.serverTimestamp(), itemIds },
        }, { merge: true });
    });

    // Write triage item — CRITICAL severity, deduplicated by fingerprint
    const fingerprint = sha256('AUTO-DEPROMOTE:' + rule);
    await db.doc(`_triage_queue/auto-depromote-${fingerprint}`).set({
        title: `Auto-healing rule ${rule} disabled — apply-validate-failed spike`,
        severity: 'critical',
        priority: 100,
        category: 'self-healing',
        source: 'auto-depromote',
        rule,
        message: `Rule ${rule} had ≥3 distinct items fail validate() in the last 30 min. Per-template flag automatically flipped OFF. Master toggle remains ON. Operator action: investigate template + validator, re-run autofix-dryrun, re-enable in Pulse if fixed.`,
        recentItems: itemIds,
        status: 'open',
        createdAt: FieldValue.serverTimestamp(),
        history: [{ ts: new Date().toISOString(), actor: 'cf:detectAutoHealingFailureSpike', action: 'auto-depromote' }],
    }, { merge: true });
}
```

### Pulse integration (extends PULSE-1)

The existing `renderHealerActivity` state machine includes `APPLY-ERROR-SPIKE`. PULSE-2 doesn't add new states but adds context to the row when a rule has been auto-disabled:

- Banner detects: `_system_config/self_healing.lastAutoDisable.at` within last 6 hours
- Renders red sub-line: `Rule X auto-disabled Yh ago — see triage item`

This is a one-line addition to the existing `getHealerActivity()` helper plus a render branch.

## Failure modes considered

| Failure | Mitigation |
|---|---|
| CF runs while operator is mid-edit of `enabledTemplates` | Transaction re-reads on commit; idempotent re-runs at 5-min cadence |
| 3 failures within 30 min cross multiple operator-driven retries (false positive) | Tracking distinct `itemIds`, not raw history count |
| Triage item duplication on consecutive CF fires | Fingerprint-keyed doc id; merge:true on subsequent writes |
| Triage queue 50-cap saturation | The auto-depromote item is severity:critical priority:100 — gets ranked first, won't be displaced |
| CF itself fails (timeout, billing) | The 5-min cadence retries; PULSE-1 banner separately surfaces stale-CF signal via heartbeat |
| All template fails, master toggle stays on, no-op disable cascades | Loop: every 5 min, scan finds same 3-failure window if it persists, but disableTemplateAndAlert is idempotent |

## Testing strategy

1. **Unit-level**: hand-craft `_auto_fix_queue` documents with synthetic agent failures and run the detector against an emulator.
2. **Integration**: run the existing `autofix-cli.js` against a deliberately-broken fix template (apply throws on every item) for ≥3 items; verify auto-disable + triage item.
3. **Idempotency**: simulate the CF firing 5 times consecutively while the failure window holds; confirm only 1 triage item created.
4. **Recovery**: re-enable template via Pulse toggle, confirm new fixes apply normally, confirm `lastAutoDisable.at` timestamp ages out of the 6-hour banner.

## Open questions for Nancy

1. **30-minute window**: too long? too short? CAT-002 typical apply rate is unknown; if it processes 100/day that's ~4/hr, so 3 in 30 min is 6× normal failure rate — feels right. But if rate is higher, this is too tight.
2. **`itemIds` distinct check**: prevents single-item retry from triggering, but what if 3 items all touch the same broken `apply()` code path? That's actually exactly what we want to catch. OK as is?
3. **Auto-disable scope**: PULSE-2 only flips the per-template flag. Should it also append the rule to a `disabledByDetector` allowlist that requires explicit operator clear before re-enabling, to prevent accidental re-enable? Current proposal doesn't.
4. **CF cost**: 5-min cadence scanning up to 100 queue docs each = ~28k Firestore reads/day. At current scale (queue ~0), this is rounding error. At saturation (queue=50), still under $0.10/month. Acceptable.

## Effort estimate

~150 lines of new CF code in `functions/index.js`, ~20 lines extension to PULSE-1's `renderHealerActivity`, ~10 lines test fixtures. Sprint-PULSE-2-half-day if no surprises.

## Implementation order

1. Nancy review on this design doc → resolve open questions
2. Implement `detectAutoHealingFailureSpike` CF + `disableTemplateAndAlert` helper
3. Extend `getHealerActivity()` to read `lastAutoDisable` + render
4. Synthetic queue test
5. Live deploy + monitor

## References

- PULSE-1 visibility layer: `_app/pulse.html` line ~608 + `_app/components/SystemConfigClient.js` `getHealerActivity`
- Self-healing architecture: `_docs/features/SELF_HEALING_PIPELINE.md`
- Fix template contract: `_tools/nexus/fix-templates/CONTRACT.md`
- Sprint backlog: PULSE-2 in `_tools/sprint-master/sprints.json`
