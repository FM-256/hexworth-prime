# Hexworth Credential Authority (HCA) — Foundational Design

**Last Updated:** 2026-07-24
**Status:** DESIGN / pre-build. Decisions captured; open questions unresolved. No code yet.
**Target:** First release for the inaugural Hexworth CTF tournament, October 2026.
**Owner:** Frank (operator). Origin: brainstorm with Codex + design pass this session.

---

## Overview

The Hexworth Credential Authority issues portable, evidence-backed, cryptographically verifiable credentials for demonstrated competency in cybersecurity, IT, AI, and emerging tech. It begins with the inaugural Hexworth CTF tournament and is designed to grow into a permanent credentialing institution.

The badge artwork is not the point. The trust anchor is the **cryptographically signed credential plus a public revocation status list**, verifiable by anyone without logging into Hexworth. A credential answers one question: *"Can this individual demonstrably perform the competency this credential represents?"* If that cannot be objectively supported by evidence, the credential should not exist.

This document captures what we have decided, the doctrine behind those decisions, the scope for the October MVP, and every open question and concern. It is a working design doc, not a finished spec.

---

## Where it fits in Hexworth

The HCA is not a standalone feature. It is:

1. **The Career-OS Evidence layer made portable.** The North Star (`project_career_os_mission`) is Hexworth as a Career Operating System measured by career outcomes. The HCA is the output valve: it turns the honest evidence the platform generates into a claim an employer can rely on off-platform.
2. **The BUG-021 thesis turned outward.** BUG-021 (shipped + live 2026-07-24) ripped scroll-credit out of 150 Armory modules so completion means demonstrated work. Codex independently arrived at the same principle as Article I below: *"Activity shall never substitute for competency."* Honest evidence is therefore a **prerequisite** for credential integrity: you cannot issue a "SOC Analyst" credential off a gameable lab.

---

## The Four Systems (constitutional separation)

A governing principle of the platform. Four independent systems, deliberately not conflated:

| System | Mission | Measures | Metaphor |
|--------|---------|----------|----------|
| **I. Activity** | Reward learning + engagement | XP, levels, streaks, missions, labs, box progression, time invested | "the game" |
| **II. Competition** | Measure competitive excellence | Tournament rankings, seasonal standings, championship history, win/loss | "the sport" |
| **III. Credential Authority (HCA)** | Recognize professional competency | Demonstrated knowledge/skills, verified assessments, practical exams, qualifying tournament achievement | "the institution" |
| **IV. Reputation** | Recognize service | Mentorship, leadership, research, teaching, content creation | "the contribution" |

**Data separation rule (critical):** the HCA receives only what is necessary to substantiate a credential. XP and streaks never enter it. Competition sends a certified result summary, not raw submissions. Identity sends a stable subject reference, not the full account.

| Data | Primary owner | HCA receives |
|------|---------------|--------------|
| XP, streaks, general lab activity | Learning platform | Nothing (or qualified evidence only) |
| Tournament submissions | Competition system | Certified result summary |
| Anti-cheat telemetry | Security system | Clearance / violation status only |
| User identity | Identity system | Stable subject reference (`subject_id`) |
| Credentials | HCA | Full authoritative record |
| Community reputation | Community system | Nothing unless a credential specifically requires it |

---

## Constitutional principles

1. **Activity shall never substitute for competency.**
2. **Competition shall never automatically grant a credential.** Winning may *qualify* someone; the credential is still issued under a defined standard. (The trust boundary: competition establishes performance; the HCA decides whether that performance meets a standard.)
3. **Every credential must have verifiable evidence.** No exceptions.
4. **Credentials may be revoked** (fraud, plagiarism, compromised assessment). An authority that cannot revoke is not an authority.
5. **Every credential remains historically traceable.** Status changes; history never disappears.

---

## Scope doctrine — how we decide what to build

Two failure modes, both real (established this session):

- **Choosing easy when it forfeits value** — taking the low-effort path when it leaves real value on the table.
- **Choosing hard when it buys nothing** — over-building where the extra effort adds no benefit (risk vs reward).

Easy and correct are not interchangeable; neither are hard and correct. The discriminators:

- **Rejected test:** "Does it have a consumer today?" This is the bank-with-no-depositors / business-with-no-customers fallacy. A foundation's job is to exist *before* the load arrives; judging it by the absence of that load is judging it by the one thing it is designed to precede. You do not build a half-bank and demolish it when members show up.
- **Correct test:** **Is this part of what the credential authority fundamentally IS, or is it a separate product built on top of it?** Build the bank (vault, ledger, member accounts, freeze/close, audit) on day one with zero customers. Defer the travel-rewards card that merely rides on the bank.
- **Greenfield rule:** the registry stores nothing yet and is not built. Do not charge a not-yet-built component for migration or accumulated-state costs it cannot have. Compare destinations, not imaginary journeys.

---

## Architecture decisions (DECIDED)

| Decision | Choice | Why |
|----------|--------|-----|
| Authoritative registry | **Managed PostgreSQL (Cloud SQL)** | Structural integrity by construction (a store that cannot hold an invalid credential), native transactional issuance (all-or-nothing across the 7 issuance steps), self-policing (revoke-across-corpus is one query). This is the institution's permanent record; it earns a permanent-grade foundation. |
| HCA runtime | **A real backend service (Cloud Run), not scattered Cloud Functions** | An authority deserves a proper API service. Also resolves the only real serverless-to-SQL con: a Cloud Run service with `min-instances=1` owns a warm pooled connection via the native Cloud SQL connector. |
| Live event data | **Firestore stays** | Best at what it does: the live tournament (already there), real-time, notifications. Firestore records what is happening; Postgres records what has been officially established. |
| Artifacts | **Cloud Storage (GCS)** — badge art, signed credential JSON, certificates, protected evidence files | Immutable, content-hashed object IDs. |
| Signing keys | **Managed KMS** — never in the application DB | Signing, rotation, revocation-signing. |
| Credential format | **Open Badges 3.0 / W3C Verifiable Credentials from day one** | Portable, standards-valid, no proprietary lock-in. Trust anchor is engine-independent. |
| Trust anchor | **Signed credential + public revocation status list** | Verifiable without Hexworth login. If the registry were lost or migrated, every issued credential stays valid. The DB choice is an integrity/governance decision, NOT a trust decision. |

**Hybrid shape:**

```
Firestore (live)                Cloud Run: HCA service              PostgreSQL (Cloud SQL)
- tournament scores      -->    - results validation         -->   - credential registry
- real-time / rooms             - issuance (signed)                 - definitions / assertions
- notifications                 - verification API                  - evidence / status / audit
                                - revocation
                                       |
                                       +--> GCS (signed artifacts, badge art)
                                       +--> KMS (signing key)
                                       +--> Public verification page + LinkedIn deep-link
```

---

## October MVP scope (foundation-modeled-right, feature-scoped)

**Foundation — build it right, now, even empty (this is what the authority IS):**
- Issuers as first-class, scoped authorities (even with a single issuer, Hexworth Academy).
- Family + level taxonomy (the institution's product-line structure).
- Full status lifecycle and real revocation, including the **public status list**. Capability is day-one; only the admin UI is minimal.
- A generic, typed multi-evidence model (assessment / instructor review / tournament placement / practical exam / …), not hardcoded to "tournament."
- Signing, verification, and the standards-valid signed payload (the trust anchor).
- Public verification page + LinkedIn-addable fields + JSON export.
- Append-only audit log.

**Separate products that ride on the authority — deferred (a distinct product presupposing the institution, NOT "no consumer yet"):**
- Career-path / skill-graph recommendation engine (a projection over the registry).
- Partner federation + external-wallet holder handshake (full OIDC4VCI/VP). We *emit* a standards-valid credential from day one; the partner-to-wallet protocol waits for partners.
- Regional chapters + council governance workflows (org structure for an org that does not exist yet).

---

## Core PostgreSQL schema (integrity-bearing entities only)

Model relationally; defer institution-scale governance tables until a second issuer/partner justifies them.

```
issuers                       -- first-class issuing authorities (scoped)
credential_definitions        -- the reusable standard/template
credential_definition_versions
credential_assertions         -- the credential awarded to a person (the permanent record)
credential_status_history     -- append-only status transitions
events                        -- tournament / assessment events
event_results                 -- certified result summary imported from Competition
evidence_records              -- typed evidence, public vs protected
audit_events                  -- append-only; app roles cannot update/delete
```

`credential_assertions` carries: `public_id`, `subject_id`, `credential_definition_version_id`, `issuer_id`, `event_result_id`, `issued_at`, `expires_at?`, `current_status`, `signed_payload_jsonb` (the portable OB3.0/VC), `payload_hash`, `signature_reference`, audit timestamps. Idempotency via a deterministic/content-addressed key so re-issue is a no-op.

---

## Credential lifecycle

`Draft -> Approved -> Published -> Earned -> Verified -> Active -> Archived -> (Expired) -> (Revoked)`

Every transition logged. Public verifier shows current status (e.g. `Revoked`, reason category) without exposing confidential disciplinary detail.

---

## Read / share surfaces

- **Private wallet** (authenticated): all credentials, public/private status, evidence summary, export, sharing controls, history.
- **Public verification page** (`verify.hexworth.com/...` or `credentials.hexworth.com/...`): approved public info only, cryptographic verification result. No email, internal IDs, IP, raw submissions, or anti-cheat data.
- **Machine-readable signed credential** (OB3.0/VC): importable/verifiable by external systems.
- **LinkedIn**: a plain deep-link to "Add to profile → Licenses & Certifications" (name, issuing org, issue date, credential ID, credential URL). No API/OAuth for MVP.

**Privacy/ownership:** the recipient controls *presentation* (public/private, display name/alias, share URL, export, request correction/appeal). The recipient cannot alter the *record* (title, issue date, placement, evidence, status, audit history). Hide is not delete: the issuance record is retained for integrity/legal/fraud purposes.

---

## Tournament position integrity (the source of a credential's placement claim)

Grounding pass on the live tournament (`_app/arena/`, Firestore-backed) that feeds the HCA. The tournament is **team-based**: `tournaments/{id}` (status draft → lobby → active → frozen → ended) with a `teams` subcollection (each team has a `members` uid array, `score`, `lastSolveTime`). The canonical standings surface is `tournament-podium.html`.

Findings and decisions:

1. **Ranking tie-break (BUG-022, fixing now).** Positions were derived from `orderBy('score','desc')` alone; score ties fell back to Firestore document-id order (meaningless), so a tie could put the wrong team on the podium and mint a wrong-place trophy/credential. **Canonical rule (authoritative, mirror everywhere): score DESC, then earliest `lastSolveTime` ASC** (the team that reached a score FIRST outranks a later team at the same score); missing last-solve sorts last; final fallback to team id for stable ordering. The HCA finalization service MUST compute the position-of-record with this same rule, server-side.
2. **Results-lock / certified snapshot (trust boundary).** The credential-of-record position must come from a **frozen, tie-broken snapshot taken at `ended`**, not a live re-sort of the leaderboard. The podium fix corrects DISPLAY; issuance reads the locked snapshot. This is the concrete mechanism behind Principle 2 (competition establishes performance; HCA decides if it meets a standard) and open question 1.
3. **Team → individual attribution.** Credentials go to a person (`subject_id`); positions belong to a team. The `members` uid array (`tournament-board.html:606`) is the bridge: a team's placement attributes to each member uid. **Design decision needed:** do all members receive the same position credential (standard in CTF), and are specialty individual awards (e.g. Team MVP) separate? Solo vs team handling.
4. **"Trophies" are points-tiers, not positions.** `TrophyCabinet.js` currently tiers Bronze/Silver/Gold/Platinum by POINTS (rarity bands), which collides conceptually with the podium's gold/silver/bronze meaning 1st/2nd/3rd. There is no real Champion / 1st / 2nd / 3rd / Top-N *position* trophy concept yet. Reconciling "trophy = finishing position" vs "trophy = points-rarity" is a structural item under "fix the trophies for positions" (tracked separately from the tie-break bug).

## Dependencies & assumptions

- **Tournament platform is LIVE and operating** (confirmed by Frank). The HCA consumes finalized, certified results from it. **OPEN: what does it store results in (Firestore assumed), and is there a results-lock/approval step or must the HCA define one?**
- Existing Hexworth identity (Firebase Auth) provides the stable `subject_id` and authorized display attributes.
- Existing fleet monitoring (neon/bc1, `reference_monitoring_alerting`) is where a new production service would need alerting coverage.
- Platform constraint on record: the site itself is zero-build vanilla HTML/CSS/JS on Firebase Hosting. The HCA backend is the platform's **first stateful non-Firebase production service** — a deliberate, scoped exception justified by the integrity requirement.

---

## OPEN QUESTIONS

1. **Tournament results source + finalization.** What datastore holds certified results? Is there an existing results-lock/approval + dispute/anti-cheat window before issuance, or does the HCA define that trust boundary?
2. **Identity & real-name policy.** Employer trust wants a real person; users may be pseudonymous. Consent capture, legal-name vs alias display, per-credential privacy. Retention policy for hidden-but-not-deleted records (GDPR/data-protection posture).
3. **Issuer cryptographic identity + keys.** What is Hexworth's issuer identity for OB3.0/VC (`did:web:hexworth.com`? X.509?)? Which KMS, and what key-rotation + revocation-signing policy?
4. **Revocation status mechanism.** Which standard status list (e.g. Bitstring/StatusList2021)? Where is it hosted (must be a stable public endpoint that is itself part of the trust anchor)?
5. **Verification domain + hosting.** `verify.` vs `credentials.` subdomain; `.com` DNS is at IONOS. Pages served by the Cloud Run service or static pages calling a verify API? TLS/cert.
6. **Backend stack + relationship to `functions/`.** Language/framework for the Cloud Run service (Node, to match `functions/`?). Does it live alongside Firebase Functions or fully separate? How does the Firebase-Hosting frontend call the Cloud Run API (CORS, auth-token verification)?
7. **Auth model.** Cloud Run verifies Firebase Auth tokens for wallet/admin. Issuer/admin role model for authoring + approving credential definitions and triggering issuance.
8. **Credential definition governance.** Even with one issuer, who authors and approves a definition (the standard) and its criteria? Minimal Draft→Approved→Published workflow + owner.
9. **Inaugural credential product design.** Tournament name; the family set for the first event (Competitor, Top-N tiers, Champion [exactly one, forever], specialty awards); published objective criteria for each. The "first ever / inaugural" credentials can only be minted once — get them right.
10. **Cost + ops ownership.** Cloud SQL + Cloud Run `min-instances=1` = a real monthly floor. Who owns backups, patching, monitoring integration?

---

## CONCERNS / RISKS

- **Scope vs deadline.** The vision is an institution; October is real. Risk of building the institution and missing the tournament. Mitigation: foundation modeled right, features ruthlessly MVP-scoped by the doctrine above.
- **New ops surface.** First stateful non-Firebase production service: real operational burden, monthly cost, and it must be wired into the existing alerting stack or it becomes an unwatched watcher.
- **Crypto correctness is the top technical risk.** Signing / verification / status must be standards-correct or the credentials are worthless. This risk is independent of the DB choice.
- **Legal / privacy.** Issuing real credentials tied to real people creates data-protection obligations; revoke-for-fraud implies a dispute/appeal process that must exist before, not after, the first revocation.
- **Irreversibility of "inaugural."** You get exactly one first tournament. A credential that is wrong or insecure at launch cannot be cleanly re-minted as "the first ever."

---

## Decision log (reasoning corrections this session)

- Initial lean toward Firebase-native was partly the path of least resistance, not purely on merits. Re-examined on a value-vs-effort test: **registry integrity (structural correctness, transactional issuance, self-policing) is the product**, so Postgres earns its cost there. Trust/verifiability is a wash (signatures carry it), so that is not a reason to prefer either engine.
- Retracted two phantom deductions: an "ETL bridge" charged to Postgres and a "future migration" charged to Firestore. Both assume accumulated state on a greenfield store that holds nothing and is not built. The results-to-issuance step is a constant across all designs (the trust boundary), not an engine-specific cost.
- Corrected the scoping discriminator from "has a consumer today" (the bank-with-no-depositors fallacy) to "is it the institution itself, or a product on top of it." This moved multi-issuer modeling, the family/level taxonomy, and full revocation from "defer" to "foundation, build now."

---

## Related

- `project_career_os_mission` — the North Star this feeds.
- BUG-021 (Armory honest-completion, `_docs/operations/BUG_TRACKER.md`) — the evidence-integrity prerequisite.
- `reference_monitoring_alerting` — where a new production service needs alerting.
- `reference_cloudflare_account` — `.com` = IONOS, `.tech` = Cloudflare (relevant to the verify subdomain).
- Open Badges 3.0 · W3C Verifiable Credentials · OIDC4VCI/VP (later interop).
