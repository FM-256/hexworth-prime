# Dr. Hex — Real-Student Readiness Checklist

> Operator decision document. Gap #3 from the AI module readiness pass:
> "No real-student traffic yet — everything tested in dev."
> This isn't a code fix; it's a deployment-decision artifact.

## What this document is

A checklist of the conditions an operator should validate **before**
exposing Dr. Hex to a class of real students. Tracks the platform's
maturity against the threat profile of cyber-curious adversarial
trained students.

## Pre-launch gates

Each item must be either ✅ verified or ⏭️ explicitly accepted as a
known-and-tolerated risk for this launch cohort.

### Architecture

- [x] Production chain operational (browser → CF → tunnel → orchestrator → ollama)
- [x] All 6 Cloud Functions deployed and ACTIVE
- [x] Cloudflare Access service-token gate working (no unauthorized direct hits)
- [x] Firestore security rules enforce admin-only on operator collections
- [x] Conversation memory bounded (30-min TTL, 5-turn cap)
- [x] Tool dispatch ctx.uid server-set (no client-uid spoofing surface)

### Defense layers (15)

- [x] Pydantic schema validation on every request
- [x] Message length cap (2000 chars, both CF + orchestrator)
- [x] Per-uid lockout (5 filter hits / 60 min, auto-expires)
- [x] Per-conversation lockout (3 hits / 60 min, auto-expires)
- [x] Per-uid rate limit (sliding 1h, tier-adjusted)
- [x] Unicode NFKD normalization (Turkish-İ etc.)
- [x] Encoding-bypass regex with imperative anchors
- [x] Generic jailbreak regex with quote-skip false-positive defense
- [x] System Constitution rules (ignore-instructions, role-claim shielding)
- [x] Ollama 60s timeout (DoS protection)
- [x] Output flag scrub (braced + bare-string patterns)
- [x] Streaming output chunk-scan (500-char rolling window)
- [x] Tool-call budget per conversation (10 calls)
- [x] Honeypot tools (3 tripwires for tool-call injection)
- [x] Behavioral score tiering (7-day rolling, /2 or /4 cap escalation)

### Forensics

- [x] tool_invocations Firestore collection (every tool call)
- [x] dr_hex_security_events Firestore collection (every filter hit)
- [x] dr_hex_quality_observations Firestore collection (operator-flagged)
- [x] Admin dashboard at /admin/dr-hex-quality.html
- [x] Quality observation CLI for fast intake

### Adversarial verification

- [x] Adversarial probe suite (51 attacks across 14 categories)
- [x] 51/51 hard assertions pass on latest run
- [x] Semantic spot-check of every category response
- [x] Multi-turn drift test included
- [x] Multilingual + leetspeak + homoglyph attacks tested
- [x] Tool-injection attacks tested

### Operational readiness

- [ ] **Load testing baseline established** (in progress 2026-05-25 — subagent)
- [ ] **Per-class onboarding alpha** (1-2 students, all logged, observed for 1 week)
- [ ] **Defined incident-response runbook** (what does an operator do when
      observation pipeline catches a real attack landing)
- [ ] **Operator can demo the dashboard end-to-end** to a non-developer
- [ ] **Documented rollback procedure** for AI-disable in case of catastrophic
      issue (set HEX_API_KEYS=disabled is the kill switch today)

### Documentation

- [x] Orchestrator architecture in Confluence
- [x] Threat model + adversarial suite in `_docs/operations/`
- [x] Quality taxonomy + observation flywheel documented
- [x] Tool layer architecture documented
- [x] CF Access service-token gotcha documented in KBA
- [ ] **Student-facing AI usage policy** (what AI can/can't do, what's logged)
- [ ] **Instructor playbook** for using the dashboard

### Accepted risks (this launch only)

Document explicit acceptances here. Examples:

- ✅ **No SLA / uptime guarantee** for v1.0. Acceptable for alpha cohort.
- ✅ **Single ollama instance on hexclass** — failure = total AI outage.
  Acceptable for v1; multi-instance failover deferred.
- ✅ **No multi-region** — hexclass is single physical location. Acceptable.

## Launch decision matrix

| Cohort size | Gates required |
|---|---|
| 1-2 students (closed alpha) | Architecture + Forensics + Adversarial verification |
| 5-20 students (one class) | + Load testing + Per-class onboarding + Incident runbook |
| 50+ students (multiple classes) | + Documented rollback + Student/instructor docs + SLO defined + multi-instance ollama or queueing |

## ⚠️ Load-test finding (2026-05-25, file gap #9 closed)

**Single-GPU capacity is 1-2 concurrent students.** Tested 5
concurrent users for 60s on the Arc Pro B60 / qwen2.5:7b setup:
- 2/7 requests succeeded
- 5/7 hit the 60s ollama timeout (HTTP 502)
- p95 wall latency 50.2s (essentially at the timeout)
- 28.6% success rate

Each inference holds the GPU for 28-50s. The orchestrator
serializes onto ollama correctly — the bottleneck is single-model-
single-GPU, not orchestrator overhead.

**Concrete capacity:**
- Sequential 1-1: works as designed (~28-50s response)
- 2 concurrent: marginal, p95 brushes the 60s ceiling
- 3+ concurrent: most requests will 502

**Mitigations before scaling past 2 concurrent:**
1. Multi-instance ollama (additional GPU(s), load balancer)
2. Request queueing with student-visible "X students ahead of you"
3. Smaller / faster model variant for low-help-level responses
4. Async chat (student submits, gets notification when ready)

**Implication for cohort sizing:** a 20-student class will see
constant timeouts during active-help windows (e.g., right before a
deadline). For now Dr. Hex is ready for **1-2 concurrent students**
which means **closed alpha cohort or asynchronous use** — not full
class concurrent.

Load test harness: `_tools/hexclass/orchestrator/tests/load_test.py`
with 3 modes (concurrent / burst / ramp). Report files written to
`/tmp/loadtest_*.{json,md}`.

## Today's state

Architecture, Defenses, Forensics, and Adversarial verification all green.
Operational readiness has open items (load test in progress, no runbook
yet, no alpha cohort).

**Verdict for closed-alpha (1-2 students):** ready.
**Verdict for full class (5-20):** load test must complete + runbook
must be written + alpha cohort must run 1 week without security incident.

## How to track this

Update this file as gates flip. Each ❌→✅ transition should be
accompanied by a commit + observation log entry if behavior changed.

## Related

- `_docs/architecture/dr-hex-orchestrator.md`
- `_docs/operations/dr-hex-adversarial-probe.md`
- `_docs/operations/dr-hex-quality-log.md`
- `_docs/operations/dr-hex-security-events.md` (TBD)
