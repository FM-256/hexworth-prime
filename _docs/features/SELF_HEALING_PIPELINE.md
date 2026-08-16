# Self-Healing Pipeline — Bidirectional Control Plane

**Status:** APPROVED FOR BUILD — Option A locked 2026-04-29
**Components (existing):** Nexus, EduScan, Sprint Master, NexusReader, Pulse, Marathon Agents
**Components (new):** `_triage_queue` Firestore collection, Sprint Master HTTP bridge, marathon priority-poll loop
**Decision deadline:** Before any further Pulse triage UI work
**Last reviewed:** 2026-04-29
**Author:** discussion-driven design between user + Claude

---

## Why this doc exists

The Pulse triage panel currently displays five hardcoded items. The action buttons (`Fix`, `Plan`, `Register`, `Audit`, `Blocked`) have no click handlers — they are literally `<button>` tags with `:hover` styling and nothing else. During a user session on 2026-04-29 the user observed apparent "reordering" when clicking and remarked it would be a great feature. It is — but only if it is wired into the autonomous loop, not as visual theater.

This document proposes the architecture for making Pulse the actual human-in-the-loop control surface for the self-healing platform, instead of a read-only dashboard.

The decision being asked: do we build the bidirectional control plane described below, or do we strip the action buttons until we are ready to back them with real mutations?

---

## The pipeline today (one-way, read-only)

```
EduScan + spokes  ──►  Nexus pipeline  ──►  _quality_reports/latest  ──►  NexusReader  ──►  Pulse (read-only)
                                                                                              │
                                                                                              ▼
                                                                                   Hardcoded TRIAGE_ITEMS
                                                                                   array displays.
                                                                                   No write path. No mutations.
                                                                                   Buttons are decoration.
```

Source-of-truth proliferation today (four stores, no canonical):
1. `pulse.html:1417` — `TRIAGE_ITEMS` hardcoded JS array
2. `_tools/sprint-master/sprints.json` — sprint backlog
3. `_quality_reports/latest` (Firestore) — Nexus findings
4. Marathon-mode memory files — what agents are working on

A click in any one of these does not propagate to the others. There is no closed loop.

---

## The pipeline we want (bidirectional, closed-loop)

```
                        ┌──────────────────────────┐
                        │   _triage_queue          │ ◄─── canonical store
                        │   (Firestore collection) │      (one source of truth)
                        └────────┬─────────────────┘
                                 │
        ┌────────────────────────┼──────────────────────────┐
        │                        │                           │
        ▼                        ▼                           ▼
   Nexus writes              Pulse reads               Marathon agents
   findings as               (snapshot listener)       poll top-priority
   triage items              + writes mutations        item at task-start
   (auto-classified          when human clicks         (NOT session-start)
   severity/source)          buttons                   Write status back
                                                       on completion
                                 ▲
                                 │
                        Sprint Master also writes
                        backlog items here (instead
                        of sprints.json) so backlog
                        + auto-found defects share
                        a queue
```

The loop closes when:
1. Nexus re-scans after an agent fix
2. The finding is no longer present
3. The triage item is auto-removed (status: `resolved`)
4. Pulse re-renders without it

That is the "self" in self-healing — items disappear because the underlying defect is gone, not because someone clicked Done.

---

## The four control surfaces

### 1. Nexus (writer + verifier)

Already exists. Today writes to `_quality_reports/latest`. Change: also write each finding (or batched grouping) into `_triage_queue/{itemId}` with these fields:

```js
{
  // Identity & dedup
  defectFingerprint: 'sha256(rule + normalized-path + line-context)',
                                            // CRITICAL: stable across renames, line-shifts,
                                            // rule version bumps. Two findings with the same
                                            // fingerprint are the same logical defect.
                                            // Nexus computes this; collisions overwrite/merge.
  source: 'nexus' | 'sprint-master' | 'manual',
  severity: 'critical' | 'high' | 'medium' | 'low',
  rule: 'HEUR-008' | 'CAT-002' | ...,       // Nexus rule code, if applicable
  ruleVersion: '1.2.0',                     // bump invalidates old fingerprints
  title: 'short human-readable',
  description: 'detail',
  filePath: 'houses/.../foo.html',          // for Nexus findings
  lineNumber: 42,

  // Aggregation (see Aggregation Layer section)
  groupKey: 'HEUR-008::houses/divergent/'   // null for ungrouped items
  childCount: 12,                           // how many raw findings rolled up here
  childPaths: [...],                        // expanded on demand

  // Lifecycle
  status: 'open' | 'claimed' | 'in-progress' | 'resolved' | 'deferred' | 'dismissed',
  priority: 0..100,                         // sortable, mutable
  owner: null | 'human:eq' | 'agent:marathon-3',
  claimedAt: Timestamp | null,              // for heartbeat-timeout release
  heartbeatAt: Timestamp | null,            // agents must update during work

  // Eligibility
  autoFixEligible: boolean,                 // see classification below
  fixTemplate: 'heur-008-v1' | null,        // identifier of validated fix template

  // Audit
  createdAt: Timestamp,
  updatedAt: Timestamp,
  resolvedAt: Timestamp | null,
  resolvedBy: 'agent:...' | 'human:...' | 'auto-rescan',
  resolveCommitSha: 'abc123...' | null,     // for traceability
  history: [{ ts, actor, action, note }]    // audit trail (snapshotted on resolve)
}
```

**On the fingerprint:** the line context (e.g., a hash of the ±3 lines around the finding) matters more than `lineNumber` because line numbers shift when files are edited above the defect. The normalization step strips `_app/` prefix, removes house aliases, and lowercases — so `houses/divergent/foo.html:42` and `_app/houses/divergent/foo.html:45` (after a 3-line insert above) produce the same fingerprint as long as the surrounding code is unchanged.

**On `groupKey`:** see Aggregation Layer below. A roll-up item has `source: 'nexus'`, `groupKey: 'HEUR-008::houses/divergent/'`, and child fingerprints stored separately (or computed on demand by querying for items matching the group).

Nexus `publish.js` would gain a `publishTriage(findings)` step alongside the existing `publishSummary()`.

### 2. Sprint Master (writer)

Today owns `sprints.json`. Move the queue-of-work into Firestore `_triage_queue` (with `source: 'sprint-master'`) so Pulse and Marathon read the same store. Keep `sprints.json` as a local snapshot/export for offline work.

CLI commands like `node sprint.js add` would write to Firestore; existing `sprints.json` becomes a cache regenerated from Firestore on `sprint.js sync`.

### 3. Pulse (reader + writer)

Pulse currently reads via NexusReader from `_quality_reports/latest`. Add a second adapter, `TriageQueueClient.js`, that:

- subscribes to `_triage_queue` via Firestore `onSnapshot` **with a query filter** — never unfiltered. The default filter is:
  ```js
  query(triageCol,
        where('status', 'in', ['open', 'claimed', 'in-progress']),
        where('severity', 'in', ['critical', 'high']),
        orderBy('priority', 'desc'),
        limit(50))
  ```
  This caps Pulse subscriptions at 50 documents max, costs at most ~50 reads per change event, and matches what a human can actually triage. Medium/low severity items are reachable via an explicit "Browse all" view that uses paginated `getDocs`, not a live listener.
- exposes mutations: `claim(itemId)`, `defer(itemId, reason)`, `dismiss(itemId, reason)`, `bumpPriority(itemId, delta)`, `reassign(itemId, owner)`
- enforces admin-only via existing `_quality_reports` rule pattern
- enforces transactional `claim` (Firestore `runTransaction`) so human + agent races are resolved first-writer-wins

The triage panel buttons become real mutations:

| Button label | Mutation                                            |
|--------------|-----------------------------------------------------|
| `Fix`        | `claim(item)` — sets owner: human:<currentUser>     |
| `Plan`       | `bumpPriority(item, +20)` + flag for next sprint    |
| `Register`   | `claim(item)` for catalog gaps; auto-routes to bulk |
| `Audit`      | adds note + tags `needs-investigation`              |
| `Blocked`    | `defer(item, reason)`                               |
| `Dismiss`    | `dismiss(item, reason)` — false positive            |

### 4. Marathon agents (reader + writer)

Today: marathon agents read their work plan from memory files at session-start, run for hours, write progress logs.

Change: at the start of *each task* (not each session), the agent calls `_triage_queue` and pulls the highest-priority `open` item where `autoFixEligible === true`. It writes `claim` with `owner: agent:marathon-<id>`, executes, then writes `resolved` (with the fix commit SHA) on success.

This closes the loop: human bumps priority in Pulse → Sprint Master records it → next marathon task picks it up → fix lands → Nexus re-scans → triage item auto-removes → Pulse drops it from the panel.

---

## Aggregation layer (the missing piece — added after Nancy review 2026-04-29)

The original sketch wired raw findings 1:1 into `_triage_queue`. Real Nexus output makes that a non-starter.

**Real numbers from the 2026-04-29 `nexus full --publish` run** (5,047 files scanned, 32.5s, gate PASS):

| Severity | Count   |
|----------|---------|
| Critical | 0       |
| High     | 117     |
| Medium   | 1,217   |
| Low      | 7,566   |
| Suspect  | 61      |
| Warning  | 2,463   |
| **Total**| **~11,400** |

A queue with 117 high-severity items already exceeds what a human can manage. Wiring all 11,400 raw findings would make Pulse unusable on the day Phase 1 ships.

**Three-rule aggregation (MUST exist before Phase 1):**

1. **Roll-up by `rule + directory prefix`.** Nexus `publish.js` groups findings whose `(ruleCode, normalizedDir)` match. The 117 highs probably collapse to 8–15 logical groups (e.g., "12 missing-icon refs under `houses/divergent/`"). The roll-up item is what enters `_triage_queue`; child findings are addressable on demand via the `childPaths` field or a sibling `_triage_findings` collection.

2. **Severity gate into the live queue.** Only `critical + high` enter the live `_triage_queue` and Pulse's snapshot listener. `medium + low + warning + suspect` are still scanned, still recorded in `_quality_reports/latest`, but reachable only via an explicit "Browse all findings" view (paginated, not subscribed). Auto-fix-eligible items at any severity bypass the human queue entirely.

3. **Auto-fix items go to a separate queue.** `_auto_fix_queue` is a sibling collection. Only marathon agents read/write it; it does not appear in Pulse triage at all (it can have a small "auto-fix activity" widget showing recent resolutions, but not as triage). The human queue is for items that require judgment. The auto-fix queue is for items that don't.

After aggregation, the human Pulse triage at the 2026-04-29 baseline would show roughly 8–15 grouped high-severity items. That is triagable. Without aggregation, the system fails on day one.

---

## Write rate vs fix rate (the defining constraint)

This is the analysis Nancy demanded before option-A commitment. With the real numbers:

- **Write rate per Nexus full-scan:** ~117 high findings → ~10 grouped items after roll-up.
- **Fix rate per marathon session:** unknown today. CIS2253 marathon (2026-04-28) closed roughly 24 items (10 modules + 8 labs + 4 quizzes + 2 exams) over a long session, but that was content authoring, not defect remediation. **Defect-remediation throughput is unmeasured.** A reasonable baseline assumption: 5–10 mechanical-class fixes per marathon agent per hour.
- **Scan cadence:** Nexus full runs are operator-triggered today. If we run after every commit batch, write rate could exceed fix rate during heavy build days.

**Required before Phase 1 commits:** one measured marathon session focused on draining the auto-fix queue. Count items closed. Compare to Nexus write rate. If the fix:write ratio is worse than 1:3 even on mechanical classes, the loop is theater — humans won't keep up and agents won't keep up. In that case, Phase 0 = improve agent fix throughput before building the queue at all.

**Failure mode if this analysis is skipped:** the queue becomes a stress dashboard. Every admin session begins with growing red, ends with marginally less red. The human concludes the platform is degrading. Trust collapses. (This is the failure mode Nancy named explicitly and the doc must defend against.)

---

## What auto-fix-eligible means (critical safety boundary)

Self-healing on **quality** is safe. Self-healing on **content** is not. The `autoFixEligible` flag separates them.

| Defect class                            | Auto-fix eligible? | Reason                                            |
|-----------------------------------------|---------------------|---------------------------------------------------|
| HEUR-008 `position:fixed` with body filter | **NO** (revised) | NOT mechanical — fix is `position:absolute` PLUS scroll-offset JS. CSS-only swap is a regression: element stops being viewport-anchored. Promote to YES only after a verified two-part template exists AND a FUNC validator confirms post-scroll visibility. |
| CAT-002 undeclared file in catalog      | YES                 | Mechanical registration                            |
| MISSING-ICON refs                        | YES                 | Mechanical icon insertion                          |
| Quiz key drift (static ↔ Firestore)     | YES                 | Mechanical seed                                    |
| Visual ratio violation (text-only slide)| **NO**             | Requires SVG design judgment + Nancy review        |
| Missing peer-reviewed citation          | **NO**              | Requires research + verification                   |
| Pedagogical sequencing issue            | **NO**              | Requires curriculum judgment                       |
| Any new content authoring               | **NO**              | Nancy gate is mandatory                            |
| Dependency upgrade                       | **NO**              | Side-effect risk                                   |
| Firestore rule change                    | **NO**              | Security boundary                                  |

Only items flagged `autoFixEligible: true` are pulled by marathon agents without human approval. Everything else goes to the human triage panel.

This is the same line we already enforce socially (Nancy gate before content commits, human approval before deploys). The flag makes it explicit and machine-checkable.

**Promotion rule:** before any class moves from NO to YES, two artifacts must exist: (a) a fix-template document showing exact before/after for a representative case; (b) a FUNC validator that confirms the fix worked end-to-end (not just that a string changed). HEUR-008 is the canonical example of why the rule exists — the textual change passes EduScan but the page is still broken.

---

## Conflict resolution

When a human and an agent both want to claim the same item:

**Recommended:** Firestore transaction on the `claim` mutation. First writer wins. Loser refreshes and sees the new owner. Cheap, correct, well-understood.

**Alternative:** Last-writer-wins with no transaction. Simpler but creates "ghost work" where two parties think they own the same task. Don't.

Race window in practice is small (humans and agents both poll on the order of seconds), but transactions are the right call for a control plane.

---

## Build phases

### Phase 1 — Foundations (1 week)

1. Firestore rules for `_triage_queue` (admin-only read, admin-only write, transactional `claim`)
2. `_tools/nexus/publish.js` — write each finding into `_triage_queue` (one-way for now)
3. `_app/components/TriageQueueClient.js` — modeled on NexusReader, with `onSnapshot` subscription + mutation API
4. Pulse triage panel — replace hardcoded `TRIAGE_ITEMS` with live snapshot
5. Wire the existing buttons (`Fix` / `Plan` / etc.) to real mutations
6. Manual smoke test: Nexus run → finding appears in Pulse → click `Fix` → Firestore shows owner

### Phase 2 — Loop closure (1 week)

7. Marathon agent priority-poll: read top-priority `autoFixEligible` open item before each task
8. Marathon writes `claim` → `in-progress` → `resolved` to triage item
9. Nexus re-scan after marathon batch — if finding gone, auto-set item `status: resolved`, `resolvedBy: auto-rescan`
10. Pulse "agent activity" feed — last 10 mutations written by `agent:*` owners (visibility into what the loop is doing)
11. Saturation alarm — if `_triage_queue` open count grows by >20% over 24h, post warning banner

### Phase 3 — Sprint Master migration (deferred)

12. Sprint Master writes new items to `_triage_queue` instead of `sprints.json`
13. `sprints.json` becomes a generated cache, not the source of truth
14. CLI commands stay; storage moves

This is intentionally last because Sprint Master is in active use and migrating its store mid-marathon would be disruptive.

---

## Decisions resolved (post-Nancy review 2026-04-29)

The following were "open questions" in the first draft. Nancy demanded resolution before A/B/C decision; here are the chosen answers.

**1. Re-scan trigger:** Nexus re-scan runs at the end of each marathon agent batch (typically every N items resolved, where N is configurable, default 5). Manual `nexus full --publish` remains supported. No cron — explicit triggers only, so runs are observable.

**2. Item batching:** RESOLVED via the Aggregation Layer above. Roll up by `rule + directory prefix` before items enter `_triage_queue`. Child findings stored in a sibling `_triage_findings` collection, fetched on click-to-expand.

**3. Severity → priority mapping:** Seed with `Critical = 90, High = 70, Medium = 40, Low = 20`. Humans freely re-rank. Agents read priority field, not severity, so a re-ranked item is honored. Severity remains as a separate field for filtering.

**4. Agent identity (Nancy made this Phase 1 not Phase 2):** **Decision — single shared service account with self-reported `agentId`.** All marathon agents authenticate via the same Firebase service account that already publishes Nexus reports (admin claim). Each agent self-reports its identity in an `agentId` field on every write (e.g., `agent:marathon-${sessionId}-${taskId}`). Self-reported identity is weak — an agent could lie — but the service account is shared with code we control, not third parties, so the threat model is "honest but possibly buggy" not "adversarial." Firestore rules verify the `agentId` matches the regex `agent:[a-z0-9-]+`; non-conforming writes rejected. Audit trail is therefore "trust-but-trace" — if an agent claims another agent's work, the `history[]` shows it. Future hardening (custom claims per agent process) can replace this without changing the data model.

**5. Audit trail retention:** On `status: resolved`, snapshot the current `history[]` into a separate `_triage_history/{itemId}` doc and clear the in-item array (keep last 5 entries for context). Resolved items remain in `_triage_queue` with `status: resolved` for 7 days, then archive to `_triage_archive` collection. Pulse never reads from archive.

**6. Heartbeat / dead-claim release:** RESOLVED. `claimedAt` + `heartbeatAt` fields. A scheduled Cloud Function (every 5 min) finds items where `status === 'in-progress' AND heartbeatAt < now - 10min` and resets them to `status: open, owner: null` with a history entry. Marathon agents must update `heartbeatAt` every 2 minutes during work; if they don't, the item returns to the queue.

**7. Sprint items vs Nexus items:** Sprint Master items (new content, refactors, features) live in the SAME `_triage_queue` collection, distinguished by `source: 'sprint-master'`. The aggregation layer applies only to `source: 'nexus'`. Pulse panel shows both with a small source badge. Bulk filters allow "only defects" or "only backlog" views. Mixing is acceptable because the unifying question — "what's the highest-priority thing we should be doing?" — should not depend on whether the work originated from a scan or a human plan.

---

## Open questions remaining

These do NOT block A/B/C and can resolve in Phase 1 implementation:

**A. Saturation alarm threshold (revised after Nancy):**
- Trigger: `count(open AND severity in [critical,high]) > 50 AND growth_24h_pct > 20%`. The absolute floor matters — without it, 10→12 items fires false alarms.
- Channel: Slack webhook to operator + email fallback. **Not a Pulse banner** — if the queue is already saturated, the operator is staring at the evidence. The alarm needs to reach them when they're NOT in Pulse.

**B. Re-scan-finds-defect-under-different-rule (Nancy's signal-chain concern):**
The `defectFingerprint` includes `rule` in the hash. If a rule version bumps and the same logical defect now matches under a new rule code, the fingerprint changes and a new item opens. Two options:
  - (a) Accept this. The new rule is a new check and deserves a new item.
  - (b) Maintain a `ruleAlias` table that maps old rule codes to new ones; fingerprint normalizes via the alias.
  Defer this decision until rule versioning becomes an actual problem. For now, (a).

**C. Sprint Master ↔ Nexus deduplication.** A sprint item that says "fix HEUR-008 in Forge house" and a Nexus finding that fires HEUR-008 in Forge house are the same logical work. Phase 1 ships with both visible (annoying but not broken). Phase 1.5 adds a `parent`/`linked` relation so they merge in the UI. Punted intentionally — fixing this before observing the actual collision rate is premature.

**D. `NexusReader.onSnapshot` load test.** The current adapter has never seen >50 documents because it reads `_quality_reports/latest` (one doc). The query-filtered listener proposed for `_triage_queue` is new territory. Phase 1 implementation includes a synthetic load test: seed 200 items, measure Pulse cold-load + delta-update times. If it exceeds 2s on cold-load, switch from `onSnapshot` to paginated `getDocs` + manual refresh button.

---

## Risks and concerns

### Cosmetic-vs-real risk (the original sin)
Building UI without backing mutations creates *false confidence*. User clicks → feels like steered the platform → nothing happened. **Mitigation:** never ship Phase 1 UI without Phase 1 mutations. Either both or neither.

### Saturation risk
If Nexus produces faster than humans + agents resolve, the queue piles up. The panel becomes a stress display, not a control surface. **Mitigation:** Aggregation Layer (severity gate + roll-up) keeps the human queue ≤50 items by construction. Saturation alarm (open question A) fires only on `count > 50 AND growth_24h_pct > 20%` and pages out-of-band (Slack/email), not in Pulse. Bulk-dismiss-by-rule for false-positive cascades. Auto-fix-eligible classes drain via marathon agents on a separate queue that never appears in Pulse triage.

### Auto-fix scope creep
"It's mechanical" is the gateway drug. Today: missing icon. Tomorrow: "minor wording fix." Next month: "rewrite this outdated paragraph." **Mitigation:** the `autoFixEligible` table is in this doc and in code as an allowlist. Adding a new class requires a PR and architectural conversation. Default deny.

### Observability gap
A loop that runs autonomously needs visibility. If you cannot see what the agents are doing in the last hour, you cannot trust them overnight. **Mitigation:** Pulse "agent activity" feed (item 10). Without this, do not enable Phase 2.

### Source-of-truth migration risk
Moving Sprint Master from `sprints.json` to Firestore mid-flight could lose backlog items. **Mitigation:** Phase 3 is deferred. Phase 1+2 ship with Sprint Master untouched; `_triage_queue` only holds Nexus-sourced items initially.

### Race condition: human + agent
Both claim same item. **Mitigation:** Firestore transaction on `claim`.

### Race condition: agent dies mid-claim
**Mitigation:** heartbeat + auto-release after timeout.

### Trust collapse
A self-healing system that produces a regression once destroys all credibility built up. **Mitigation:** Nancy gate stays mandatory for any agent-authored *content*. Auto-fix path is for mechanical defects only. The CIS2253 visual-ratio violation incident from 2026-04-28 is the warning shot — do not repeat.

---

## What we are NOT building (explicit non-goals)

- AI authoring courses without Nancy gate
- Auto-deploy without verification
- Agents bypassing the deploy approval rule
- Public (non-admin) triage visibility
- Replacing the human approval requirement for any deploy
- Real-time collaborative triage (multi-human cursor presence) — overengineered for current team size

---

## Decision log

**2026-04-29 — Option A approved.** User: *"we want it to be functional."*

Rejected:
- B (strip buttons / stay read-only): rejected as exploratory-only.
- C (localStorage cosmetic reorder): rejected by both Nancy and primary agent — false-confidence theater.

**2026-04-29 — Phase 0 sequencing: Option 2 chosen.** Phase 1 plumbing built before throughput measurement; throughput observed as side-effect of operation rather than as separate exercise. Reasoning: Phase 1 is independently valuable (honest data backend + manual human triage) regardless of agent-fix throughput; Phase 0 risk concentrates in Phase 2 when agents pull from queue.

---

## Execution plan (locked 2026-04-29)

Build is sliced into independently shippable, independently reviewable units. Each slice is committed + deployed + verified before the next begins.

### Slice 1 — Data backend (target: 1–2 hours)

**Goal:** `_triage_queue` populated with real Nexus findings, aggregated, with stable fingerprints. Pulse stays read-only this slice — backend only.

1. Extend `firestore.rules` with `_triage_queue` rules (admin-only read; admin write with `agentId` regex validation; transactional `claim` enforced via field constraints)
2. Extend `_tools/nexus/publish.js` with `publishTriage(findings)` step:
   - Compute `defectFingerprint` per finding (sha256 of rule + normalized path + line context)
   - Roll up by `(rule, directory prefix)` → group items
   - Severity gate: only `critical + high` enter the live queue; others skipped (still in `_quality_reports/latest`)
   - Auto-fix-eligible items go to `_auto_fix_queue` instead of `_triage_queue`
3. Run `nexus full --publish` to populate
4. **Sanity check:** confirm 117 raw highs collapsed to roughly 8–15 grouped items
5. Commit + verify Firestore state (no Pulse changes yet)

**Definition of done:** `_triage_queue` collection exists, contains aggregated grouped items, every item has a valid `defectFingerprint`, severity filter working.

**Rollback:** delete the collection, revert `publish.js` and `firestore.rules`. No user-visible regression.

### Slice 2 — Pulse wiring (target: 1–2 hours)

**Goal:** Pulse triage panel reads live from `_triage_queue`, buttons execute real mutations.

6. Build `_app/components/TriageQueueClient.js` modeled on NexusReader:
   - Query-filtered `onSnapshot` (status + severity + priority + limit 50)
   - Mutation API: `claim`, `defer`, `dismiss`, `bumpPriority`, `reassign`
   - Transactional `claim` (Firestore `runTransaction`)
7. Replace `pulse.html:1417` hardcoded `TRIAGE_ITEMS` with live snapshot rendering
8. Re-wire the (now stripped) action labels into real mutation buttons
9. Restore `badge-live` on triage badge (no longer "read-only")
10. Smoke test in browser: trigger Nexus run → see new item appear → click `Fix` → verify Firestore claim record

**Definition of done:** human can claim/defer/dismiss items in Pulse; mutations land in Firestore; UI updates reflect mutations within 1s via snapshot listener.

**Rollback:** revert pulse.html to read-only tags. `_triage_queue` continues to populate but is unconsumed by UI.

### Slice 3 — Marathon agent integration (target: half-day; HIGHEST risk slice)

**Goal:** Marathon agents pull top-priority `autoFixEligible` items, fix, write results back, Nexus rescan auto-resolves the loop.

11. Marathon agent harness reads top item from `_auto_fix_queue` at task-start
12. Agent claims via transaction → updates `heartbeatAt` every 2 min during work
13. On fix completion: agent writes `resolved` + commit SHA to item history
14. Cloud Function (scheduled, every 5min): release dead claims (in-progress + heartbeat > 10min stale)
15. Cloud Function (triggered by marathon batch completion): trigger `nexus full --publish`; auto-resolve queue items whose fingerprint no longer appears in fresh findings
16. Add Pulse "Agent activity" feed (last 10 mutations by `agent:*` owners) — observability
17. Configure saturation alarm: Slack webhook + email (out-of-band, not Pulse banner)

**Definition of done:** agent can claim → fix → resolve → rescan closes the loop without human intervention for an `autoFixEligible: true` item; observability in Pulse shows activity; saturation alarm tested by seeding dummy items.

**Rollback (per-step):** disable agent harness pull (read-only mode); items stay in queue for human review. Cloud Functions can be disabled without data loss.

### Slice 4 — Sprint Master migration (deferred, target: TBD)

18–22 — Move sprint backlog from `sprints.json` to `_triage_queue` with `source: 'sprint-master'`. Defer until Slice 3 is observed stable (1–2 weeks of operation). `sprints.json` becomes a generated cache.

### Phase 0 — Throughput measurement (parallel to Slice 3)

Runs alongside Slice 3 implementation. First marathon run that drains `_auto_fix_queue` gives us the fix-rate number. If fix:write < 1:3 even on mechanical classes:
- Stop. Do not enable agent-pull in production.
- Diagnose: which fix templates are failing? Are agents not running enough mechanical-class items?
- Iterate on fix templates before re-enabling.

---

## Approval gates between slices

After each slice ships:
- Operator (user) verifies the slice in production before the next slice begins
- Nancy adversarial review on each slice's actual code (not just design)
- No autonomous progression — every slice gets explicit "go" before the next starts

---

## References

- `_app/components/NexusReader.js` — pattern for the read-side adapter
- `_app/pulse.html:1417` — current hardcoded `TRIAGE_ITEMS`
- `_app/pulse.html:1376` — current decorative cert-domain action button
- `_app/pulse.html:1435` — current decorative triage action button (no onclick)
- `_tools/nexus/publish.js` — where the triage-write hook lands in Phase 1
- `_tools/sprint-master/sprints.json` — current backlog store (Phase 3 migrates this)
- `firestore.rules` — extend with `_triage_queue` rules
- Memory: `feedback_marathon_protocol.md` — agent loop discipline
- Memory: `feedback_no_deploy_without_approval.md` — boundary on auto-deploy
- Memory: `feedback_pptx_visual_qc.md` — visual gate before "looks good"

---

## Changelog

- 2026-04-29 — **MARATHON SHIP — Phases A through G complete. Working product.**
    - **Phase A — Master kill switch infrastructure.** `_system_config/{configId}` Firestore collection added. Schema: `enabled` bool + `enabledBy` + `enabledAt` + `lastDisabledBy` + `lastDisabledAt` + `enabledTemplates[]` + `updatedAt`. Admin-only read/write, schema-enforced. Defaults to disabled.
    - **Phase B — Pulse Self-Healing System panel.** New panel above Agent Activity with master ON/OFF toggle (red/green slider), live status line (enabled by, when, template count), per-template enable/disable list. Toggle uses confirm dialog before enable AND disable. Live snapshot subscription so multi-admin changes reflect immediately. Defaults to "DISABLED".
    - **Phase C — Coverage panel live.** Replaced 11 hardcoded `HOUSE_COVERAGE` entries with live computation from `window.ContentCatalog.getAllModules()`. Now reflects real `status: 'available'` counts per house. ContentCatalog.js added to Pulse script tags.
    - **Phase D — Agent CLI plumbing.** `_tools/nexus/autofix-cli.js` with 5 commands wired into `nexus.js`: `autofix-status`, `autofix-claim [--rule X]`, `autofix-heartbeat <id>`, `autofix-resolve <id> [--commit X]`, `autofix-release <id>`. All commands except `status` and `release` gated by `_system_config/self_healing.enabled` — exit code 2 with "GATE: master toggle is OFF" when disabled. Gate works also against per-template allowlist.
    - **Phase E — Button audit.** Every clickable element in Pulse verified to have a real handler: 5 `<button>` tags (refresh activity, claim/defer/dismiss x triage row, template toggle), 1 master toggle, 1 cert dropdown, 11 nav links. **Zero decorative buttons.**
    - **Phase F — First fix template (CAT-002).** Real `_tools/nexus/fix-templates/CAT-002.js` + `.validator.js` registered in `registry.js`. Tested against 5 real CAT-002 findings — 5/5 feasible, sensible IDs/titles derived. Apply uses single-file-per-call + .bak backup + DRAFT/TODO/WIP rejection + ID collision check + house-prefix scoping. Validator does positive assertions (module present in MODULES, href resolves to disk) + regression check (no new CAT-001/003 introduced). **CAT-002 NOT promoted to `AUTO_FIX_ELIGIBLE_RULES`** — operator decision per Nancy promotion rule.
    - **Phase G — Final Nancy review caught one blocker + fixed:**
        - `currentActorId()` in `SystemConfigClient.js` AND `TriageQueueClient.js` was using `window.firebaseAuth.getCurrentUser()` — that method doesn't exist on the Firebase Auth SDK module object. Both fixed to use `FirebaseAuth.getUser()` (the real public API exposed by `_app/components/FirebaseAuth.js`). Fix prevents every audit-trail entry from defaulting to `human:unknown`.
    - Phase G also documented two non-blocking gaps (heartbeat-ownership advisory check; CAT-002 .bak single-generation backup orchestrator contract) inline as code comments per Nancy round 6.

## How to actually use the platform (operator workflow)

Right now (default state):
1. Pulse shows the Self-Healing System panel with toggle in **DISABLED**.
2. CAT-002 template is registered but not in the allowlist.
3. `_auto_fix_queue` is empty (no rules promoted to `AUTO_FIX_ELIGIBLE_RULES`).
4. All Phases A-G live; nothing autonomous can happen until you act.

To turn it on with one rule (CAT-002):
1. Add `'CAT-002'` to `AUTO_FIX_ELIGIBLE_RULES` in `_tools/nexus/publish.js`.
2. Run `cd _tools/nexus && node nexus.js full --publish`. ~280 medium-severity CAT-002 items will roll up to ~10 grouped items in `_auto_fix_queue`.
3. Open https://hexworth.com/pulse.html, scroll to Self-Healing System panel.
4. Click the master toggle to **ENABLED** (confirm).
5. Click `enable` next to `CAT-002` in the template list.
6. From a terminal: `node nexus.js autofix-status` confirms gate is open.
7. `node nexus.js autofix-claim --rule CAT-002` returns the highest-priority item as JSON.
8. Run dry-run + planning: `node nexus.js autofix-dryrun CAT-002`.
9. The next iteration adds an `autofix-apply` orchestrator that calls template.apply() → validator.validate() → resolve() in a single command. Today, manual operator runs are the only path.

To turn it off in an emergency:
- Click the master toggle to **DISABLED** in Pulse. Cloud Functions and CLI commands immediately refuse new work. In-flight transactions complete; the dead-claim reaper releases anything stuck.

- 2026-04-29 — **SLICE 3e SHIPPED.** Fix-template contract + dry-run harness:
    - `_tools/nexus/fix-templates/CONTRACT.md` — full template + validator interface, promotion rule, operator workflow, safety boundaries
    - `_tools/nexus/fix-templates/registry.js` — empty registry by design (Nancy promotion rule: no rule enters `AUTO_FIX_ELIGIBLE_RULES` until template + validator exist for it)
    - `_tools/nexus/fix-templates/_example.js` + `_example.validator.js` — reference contract, deliberately throws on apply
    - `_tools/nexus/nexus.js` — new `autofix-dryrun [ruleCode]` command. Reads `_auto_fix_queue` items, dispatches to registered templates' `dryRun()`, reports feasibility/risks/blockers without writing. Read-only.
    - **No autonomous mutation in Slice 3e.** This slice ships the PATTERN. Each individual rule template is its own micro-slice (3e.1, 3e.2…) that requires explicit operator review of dry-run output before promotion.
    - Why ship the contract before any real templates: the contract bakes in Nancy's safety boundaries (no git commits from templates, no Firestore writes from templates, idempotency required, single-rule scope) so future templates can't violate them by oversight.
- 2026-04-29 — **SLICE 3d SHIPPED.** Saturation alarm with out-of-band channel + in-band fallback:
    - `functions/index.js` — new `checkSaturationAlarm` scheduled CF (every 60min). Counts `status==open` in both queues via `count()` aggregation. If `count > 50 AND growth_24h_pct > 20%`, posts to Discord webhook (`SATURATION_WEBHOOK_URL` or `DISCORD_WEBHOOK_URL` fallback). 6-hour cooldown between posts.
    - `_saturation_history/latest` — rolling 7-day snapshot array + `currentlySaturated` sentinel + `saturationBlockedReason` + `lastAlarmAt` for state queries.
    - `firestore.rules` — `_saturation_history` collection admin-read, CF-write.
    - `_app/components/TriageQueueClient.js` — `getSaturationState()` reads the sentinel.
    - `_app/pulse.html` — saturation banner above EduScan panel. Renders only when `currentlySaturated`. Surfaces blocked reasons (cooldown, webhook misconfigured) so the operator notices even when the out-of-band channel fails.
    - **Nancy round 5 caught two real defects before deploy:**
        - **Push-before-search bug:** snapshot was pushed BEFORE the lookback search, making the current run its own prior in sparse-history conditions (first ~23h after deploy, or any post-outage gap), structurally suppressing alarms during the window operators most need them. Fix: search first, push after.
        - **Silent webhook fallback failure:** `console.warn` to Cloud Logging is invisible to operators. Fix: write `currentlySaturated: true, saturationBlockedReason: 'webhook-failed-or-unset'` to sentinel doc; Pulse banner surfaces it.
    - **Hexworth no-emoji rule:** webhook payload uses `[ALARM]` text marker, not the U+26A0 emoji.
- 2026-04-29 — **SLICE 3c SHIPPED.** Agent activity feed live:
    - `_app/components/TriageQueueClient.js` — `getRecentAgentActivity(20)` scans both queues' `history[]` for `actor: agent:*` events, sorts by ts desc, returns top N.
    - `_app/pulse.html` — new "Agent Activity" panel between Triage Queue and Student Signals. Manual refresh button + 60s auto-refresh. Renders relative time, actor short, action, queue, item title, note.
    - Why now (pre-marathon-agent): reaper + reconciler already write `agent:*` history. This gives visibility into autonomous activity from minute one. Without it, agents act invisibly until something breaks.
    - Scaling note (in code comment): scans every doc in both queues. Cheap at current scale (~13 items). At 1000+, swap for dedicated `_agent_activity` collection.
- 2026-04-29 — **SLICE 3b SHIPPED.** Loop closure for human-fixed items is live:
    - `_tools/nexus/publish.js` — new `reconcileTriageWithScan(allFingerprints)` runs after every `publishTriage`. Two transitions:
        - **Auto-resolve:** items in `[open, claimed, in-progress]` whose `defectFingerprint` is no longer in the fresh scan transition to `status: resolved, resolvedBy: 'auto-rescan'`. This means a human who manually fixes a defect sees it disappear from Pulse on the next Nexus run — no manual "Done" required.
        - **Auto-reopen:** items in `resolved` whose fingerprint reappears in a fresh scan transition back to `open` (treats recurrence as regression).
    - Each transition uses Firestore transaction with re-check inside (race-safe vs concurrent Pulse mutations).
    - `dismissed` and `deferred` items are NEVER touched (deliberate human decisions stay).
    - `firestore.indexes.json` — composite indexes `(source ASC, status ASC)` on both queues. Deployed first, polled, then function shipped (per Slice 3a sequencing rule).
    - **Nancy round 4 caught two real bugs before deploy:**
        - **Empty-scan mass-resolve:** if TREASURE_MAP.json had zero issues (truncated, partial, or pre-init), every active item would auto-resolve. Fixed: explicit guard `if (allFingerprints.size === 0) skip reconciliation`.
        - **Severity-reclassification silent drop:** `buildTriageItems` previously built fingerprints only from severity-gated groups. A rule reclassified high → medium would cause its existing items to falsely auto-resolve as "disappeared." Fixed: `buildTriageItems` now returns `allFingerprints` covering every (rule, dir) group regardless of gate. Reconciliation uses this complete set; the gate only controls queue routing, not reconciliation visibility. Today: 13 items in queue, 238 fingerprints in scan.
    - Reconcile query also narrowed to `status in [open, claimed, in-progress, resolved]` — excludes dismissed/deferred at query layer to prevent ever-growing read cost.
- 2026-04-29 — **SLICE 3a SHIPPED.** Dead-claim safety net is live:
    - `functions/index.js` — new `releaseDeadClaims` scheduled Cloud Function (every 5 min, us-central1). Reaper scans both `_triage_queue` and `_auto_fix_queue` for items where `status in [claimed, in-progress]` AND `claimedAt < now - 10min`. Pre-filters fresh-heartbeat items in code; transactional release with re-check inside txn. Released items revert to `status: open, owner: null, heartbeatAt: null` and get a `release-stale` history entry attributed to `agent:dead-claim-reaper`.
    - `firestore.indexes.json` — composite indexes `(status, claimedAt)` on both queues. Deployed FIRST, build verified before function deploy (Nancy round 3 caught this sequencing risk).
    - Why this matters even pre-agent: Pulse human claims ARE protected from forgotten-claim deadlock starting now. A human who clicks Claim and walks away gets the item released after 10min, available to the next admin.
    - Documented assumptions (Nancy round 3): heartbeat enforcement is the agent harness's responsibility, not the reaper's. Long-running legitimate work without heartbeat WILL be released. `in-progress` is treated identically to `claimed`. Malformed `heartbeatAt` (non-Timestamp) is treated as untracked = released.
- 2026-04-29 — **SLICE 2 SHIPPED.** Pulse is now functional:
    - `_app/components/TriageQueueClient.js` (NEW) — query-filtered `onSnapshot` subscriber + transactional mutations (claim/defer/dismiss/bumpPriority/reassign). Mirrors NexusReader's lazy-load pattern.
    - `firestore.indexes.json` — composite index on `_triage_queue (status, priority desc)` and `_auto_fix_queue (status, priority desc)`. Severity filter dropped from query (already gated at write-time in publishTriage).
    - `_app/pulse.html` — hardcoded `TRIAGE_ITEMS` array deleted, replaced with live `subscribeTriage()` reading from Firestore. Three real action buttons per row: **Claim** (transactional, throws on contention), **Defer** (with reason), **Dismiss** (confirm + non-empty trimmed reason for audit trail). Event delegation bound once on container. Triage badge transitions from `read-only` → `connecting…` → `N items · live`.
    - Nancy round 2 caught + fixed before deploy: whitespace-bypass on dismiss reason (`!dismissReason` → `!dismissReason.trim()`); double `currentActorId()` call inside claim transaction (now cached once per call); dead `canClaim` variable removed; Reclaim now requires confirm dialog before stealing another actor's claim (symmetry with Dismiss).
    - Pulse remains admin-gated. Mutations honored only for <operator-email — see hexworth-infra-private> / jorden@hexworth.com / users with admin custom claim.
- 2026-04-29 — **SLICE 1 SHIPPED.** Backend live in production:
    - `firestore.rules` extended with `_triage_queue`, `_auto_fix_queue`, `_triage_history` rules — admin-only read/write, schema enforced via `hasOnly` (extra-field injection blocked), immutable fields preserved on update
    - `_tools/nexus/publish.js` extended with `publishTriage()` — aggregates by `(rule, directoryPrefix)`, computes `defectFingerprint` (sha256 of rule+normalizedDir), severity-gates to critical+high, routes auto-fix-eligible items separately
    - First production run: 117 raw highs collapsed to **13 grouped triage items** (target was 8–15 — bullseye). PATH-001 in houses/shield/ alone collapsed 84 findings into one item.
    - Auto-fix allowlist EMPTY in Slice 1 per Nancy promotion-rule: classes added in Slice 3 when fix templates + FUNC validators exist.
    - `_auto_fix_queue` correctly contains 0 items.
    - Verified: 13/13 schema-valid, 13 unique fingerprints (no collisions), all severities high, all priorities 70.
    - Pulse remains read-only this slice — Slice 2 wires the consumer.
- 2026-04-29 — Nancy review on Slice 1 plan caught 3 blockers, all applied before code:
    - `priority is int` → `is number` + `Math.round()` in publisher (avoids float-arithmetic write failures)
    - `hasAll` → `hasAll + hasOnly` for schema enforcement (blocks extra-field injection on agent-read queue)
    - `severity` and `rule` added to `preservesImmutableFields()` (closes silent hide-by-demotion attack)
- 2026-04-29 — Doc created. Status: PROPOSED. Awaiting decision A/B/C.
- 2026-04-29 (later) — Nancy adversarial review revisions:
    - HEUR-008 demoted to `autoFixEligible: NO` (CSS-only swap is a regression; needs two-part template + FUNC validator)
    - Added `defectFingerprint` field to data model (deduplication across renames/line-shifts/rule-version-bumps)
    - Added Aggregation Layer section (rule + directory roll-up; severity gate; separate `_auto_fix_queue`) — required because real Nexus output is 117 highs / 11,400 total findings, raw 1:1 wiring is a non-starter
    - Added Write Rate vs Fix Rate analysis with real 2026-04-29 numbers; required measurement before A/B/C commitment
    - Specified `onSnapshot` query filter (status + severity + priority + limit 50) instead of unfiltered subscription
    - Pulse strip executed in same session: triage + cert-domain decorative buttons replaced with read-only italic tags pending real wiring
    - Resolved 5 of 7 original open questions (re-scan trigger, batching, severity-priority, agent identity, audit retention, heartbeat, sprint-vs-nexus); 4 new open questions added (saturation threshold, rule-version-fingerprint, dedup, load-test)
