# SYM-14 — Authenticated Probe Mode for Runtime Monitor

> **Status: design only. NO code written. Awaiting user decisions on the open questions.**
> Companion to `safety-net-architecture.md` Stage 3 and `sym-3-tiered-alerts-design.md`.

## The gap

Today's runtime monitor (`_tools/runtime-monitor/run.js`, deployed as Cloud Run job `runtime-monitor`) probes hexworth.com **as an anonymous visitor** with localStorage seeded for `hexworth_house`. This catches:
- Public hosting failures (CDN, deploy regression)
- Render-killing JS errors on public pages
- Public CSP / asset-load failures

It does **not** catch:
- **Auth-gated content failures** — student dashboard, instructor dashboard, assignment grading, achievement panels
- **Role-restricted bugs** — operator console, tenant-specific surfaces
- **Firestore-rule failures** — write permission breaks that only surface after auth
- **Cloud Function auth failures** — quiz grading, cross-device sync, anything calling a callable function

Recent precedent: 2026-04 PROG-003 work, 2026-04 instructor-dashboard work, 2026-05 quiz-bridge work — all areas where a public probe wouldn't have caught a regression.

## Goals

1. Probe at least one auth-gated URL on every cycle
2. Detect Firestore-rule rejections (write fails, read denials)
3. Detect Cloud Function call failures (callable returning error)
4. No new student-visible behavior (test account cannot affect real student data)
5. Cost stays near current ~$5-15/month
6. Failures route through the same alert pipeline (SYM-3 alert MVP) as anonymous probe failures

## Architecture options

### Option α — Extra targets in same Cloud Run job

Add new entries to the `TARGETS` array in `run.js` with an `authMode: true` flag. Single job, sequential execution, single deploy.

**Pros:**
- Minimal infrastructure (no new job, no new schedule)
- Same alert pipeline, same logs, same dashboard
- Single point of credential injection

**Cons:**
- Anonymous + auth probes share the same wall-clock budget — auth probe latency (login + nav) extends total cycle time
- A failed auth probe blocks remaining anonymous probes if not isolated
- Credential exposure: ALL probes have access to test-account creds even if they don't need them (least-privilege violation)

### Option β — Separate Cloud Run job

New `runtime-monitor-auth` job, separate Dockerfile (or shared image with mode flag), separate scheduled trigger.

**Pros:**
- Isolation: anonymous probe failures don't affect auth probe and vice versa
- Different cycle frequency possible (e.g., anonymous every 15 min, auth every 30-60 min)
- Least privilege: only auth job has access to test credentials
- Scales independently if probes diverge in scope

**Cons:**
- Two deploys, two scheduled triggers, two log streams to alert on
- Slightly more cost (~$0.30/month additional Cloud Run invocations)
- More moving parts to maintain

### Option γ — Hybrid: same image, mode-flag deployment

Single Docker image, deployed twice with different env vars (`PROBE_MODE=anonymous` vs. `PROBE_MODE=auth`). Two Cloud Run jobs, shared codebase.

**Pros:**
- Best of both — isolation of β, code-share of α
- Test account creds only attached to the auth-mode job
- Schedule independence

**Cons:**
- Image must support both modes (small extra complexity)
- Still two scheduled triggers

## Recommendation

**Option γ (hybrid).** Single Docker image keeps the codebase unified, separate Cloud Run jobs give isolation + least-privilege credentials, scheduling can diverge if cycle frequency needs change.

## Credential storage

Three candidates ranked by security:

| Approach | Pros | Cons |
|---|---|---|
| **GCP Secret Manager** (recommended) | Encrypted at rest, IAM-gated, rotatable, audit-logged | Adds Secret Manager dependency to the Cloud Run job (~free for small payloads) |
| **Cloud Run env var (encrypted)** | Built-in, no extra service | Less convenient for rotation; visible in console to anyone with project read |
| **Local credentials file in image** | Trivially simple | NEVER do this — bakes secrets into image layers; image-pull = secret-leak |

**Recommendation:** Secret Manager. Cloud Run job mounts the secret as an env var or file at runtime. Test account email + password stored as a single JSON secret named `runtime-monitor-test-account`.

## Test account setup

### Creation
1. Manually create a Firebase Auth account (e.g., `runtime-monitor@hexworth.com`) via Firebase Console
2. Pre-seed in Firestore with: `users/{uid}` doc containing `roles: ['student']`, `displayName: 'Runtime Monitor'`, `tenantId: null`
3. Pre-create class enrollment so the dashboard renders content (else dashboard is empty, can't validate)

### MFA handling
**Recommended:** disable MFA for this account specifically. The account has no privileges beyond a normal student, lives only for probing, and rotating credentials regularly is the security posture (not MFA on an automated account that can't enter codes anyway).

### Rotation
Quarterly password rotation triggered manually. Document in runbook. Secret Manager makes this 2 commands.

### Account scope
- ROLE: student (lowest privilege) — can read public content, write own progress
- TENANT: none (probes generic content, not tenant-specific surfaces)
- ENROLLMENT: one canary class containing one canary module

## Probe targets (auth-mode)

| # | URL | What it validates |
|---|---|---|
| A1 | `/dashboard.html` | Authenticated student dashboard renders + progress reads from Firestore |
| A2 | `/handler-dashboard.html` | (later, requires instructor account) |
| A3 | A canary module page | ModuleProgress.complete() write succeeds (callable function) |
| A4 | `/operator/index.html` | (later, requires operator account) |

Start with A1 and A3 (both go via student account). A2/A4 can be added if/when we have additional test accounts.

## Failure modes of the auth probe itself

| Failure | Consequence | Mitigation |
|---|---|---|
| Test account password expired | All auth probes fail | Alert WARN; manual rotation |
| Firebase Auth API outage | All auth probes fail | Alert clearly distinguishes Firebase outage from real platform failure (HTTP 503 from Auth API vs. 200 from probe) |
| Test account locked (too many failed logins) | Auth probes fail | Rate-limit our retry inside probe; max 1 login per cycle |
| Token refresh fails mid-probe | Probe cycle partial-fail | Treat partial as full fail; alert |
| Firestore write quota exceeded | A3 write fails | Probe writes are tiny; quota is unlikely |

## Cost estimate

| Component | Monthly |
|---|---|
| Cloud Run job execution (auth mode, every 30 min) | ~$0.15 |
| Secret Manager (1 secret, ~10 reads/day) | ~$0.01 |
| Firestore reads (1 dashboard load + 1 module read per cycle) | ~$0.05 |
| Firestore writes (1 progress write per cycle) | ~$0.05 |
| **Total additional** | **~$0.30/month** |

Existing runtime monitor: ~$5-15/month. Total budget impact: negligible.

## Implementation sketch (after design approval)

1. Create test Firebase Auth account + Firestore seed
2. Store credentials in Secret Manager
3. Extend `_tools/runtime-monitor/run.js`:
   - Add `--mode=auth` flag (default `anonymous`)
   - In auth mode: read creds from env, sign in via Firebase Auth REST API, get ID token
   - Inject ID token into Puppeteer page context for subsequent requests
   - Add A1 + A3 targets to a separate AUTH_TARGETS array
4. Build new Docker image (same Dockerfile, runtime decides mode)
5. Deploy second Cloud Run job (`runtime-monitor-auth`) with Secret Manager binding + `--mode=auth`
6. Schedule auth job every 30 min (offset from anonymous job to spread load)
7. Verify alert routing — same email channel (already configured for SYM-3)
8. Add A2/A4 targets later if needed

## Open decisions for user

1. **Credential storage:** Secret Manager (recommended) or env var?
2. **Cycle frequency:** every 30 min (recommended for cost) or every 15 min (matches anonymous)?
3. **MFA:** confirm OK to disable on the test account
4. **Initial probe scope:** A1 + A3 (recommended starter), or wider?
5. **Test account email:** `runtime-monitor@hexworth.com` proposed. OK or different?
6. **Rotation cadence:** quarterly (recommended) or different?

## What this design does NOT include

- Multi-account testing (instructor, operator) — A2/A4 deferred until A1/A3 proven
- Tenant-specific probe (different data per tenant) — out of scope; tenants are too varied
- Performance benchmarking via auth — still a separate workstream
- Test account behavior assertions (e.g., did the right XP get awarded) — would require Firestore read-back assertions, design extension
