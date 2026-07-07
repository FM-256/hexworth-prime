# Observatory Phase-2 Behavioral Data — Consent v2 Restore

**Status:** APPROVED — all three PI/IRB decisions cleared 2026-07-06 (re-consent, v2 wording, cohort scope). Code staged on `master` (commit `3d919e3b3`); deploying.
**Confluence:** https://hexworth.atlassian.net/wiki/spaces/KBA/pages/40894465 (KBA › Operations and Procedures)
**Owner:** Frank Mora (PI). Engineering executes once the PI approves.
**Raised:** 2026-07-06, while onboarding two new research cohorts (A+ Core 1 / CET1171C, Linux / CTS2106C).

---

## TLDR

The Observatory consent form is running the **v1** wording and version, but the Cloud Function requires **v2** to admit behavioral ("Phase-2") events. Result: `page_view`, `session_end`, `device`, and `client_error` are **silently dropped for every participant, platform-wide** — including the two new cohorts starting this week. Only Phase-1 events (house enter/dwell, course clicks, sandbox launches) are collected today.

This is *correct fail-safe behavior* — the platform will not collect behavioral data that the v1 consent text never disclosed. To turn Phase-2 collection on, restore the v2 consent form (which discloses the tracking) and bump the version. That **forces re-consent** and must **match the IRB-approved wording** — both PI decisions.

---

## The gap (verified)

| Layer | Expects / stamps | Location |
|-------|------------------|----------|
| Consent form (client) | `FORM_VERSION = 'cerbi-v1-2026-06-21'` | `_app/components/ObservatoryConsent.js:30` |
| Consent text (client) | v1 sections, **no "Data Collected" disclosure** | `_app/components/ObservatoryConsent.js` CONSENT_SECTIONS |
| Cloud Function (server) | `OBSERVATORY_FORM_VERSION = 'cerbi-v2-2026-07-05'` | `functions/index.js:3574` |
| Phase-2 gated types | `['page_view','session_end','client_error','device']` | `functions/index.js:3573` |

The CF gate: a Phase-2 event is admitted only if the participant's consent record is on the current form version. A v1 record fails that check, so the event is dropped (HTTP 204). Verified live: `https://hexworth.com/components/ObservatoryConsent.js` stamps `cerbi-v1-2026-06-21`.

Phase-1 events skip this gate, so basic engagement still collects — this is why the roster shows activity but no page/session/device data.

## Root cause

- `18562e5f3` "Phase 2 behavioral capture + consent v2 + dashboard" — added the v2 consent form (text + `cerbi-v2-2026-07-05`) and the server-side Phase-2 gate.
- `18a90f60e` "participant class switcher + admin class editor" — **rolled the consent form back to v1** (text and version). The server gate was left on v2. This appears to be an unintended side effect of an unrelated (class-editor) commit, not a deliberate consent rollback.

## Impact for the new cohorts

The A+ Core 1 and Linux cohorts consenting this week will consent at v1 and therefore generate **only** Phase-1 data. The behavioral signals most relevant to a gamification / CERBI study — pages and lessons viewed, time-on-task, inactivity, scroll depth, session length, device/browser, errors — will not be recorded for them. Data not captured in the moment cannot be recovered later.

---

## What "done" looks like

1. A consenting student's `observatory_consent/{uid}.formVersion === 'cerbi-v2-2026-07-05'`.
2. The consent form visibly discloses the behavioral tracking (the "Data Collected" section) before the student signs.
3. `logObservatoryEvent` admits Phase-2 events for a v2-consented student (a `page_view` produces a row in `observatory_activity`).
4. Existing v1-consented students are re-prompted to consent to the v2 wording on their next visit (the version check already does this).

---

## The exact change to restore (precise, minimal)

The v1→v2 delta is small — three edits in `_app/components/ObservatoryConsent.js`, recoverable verbatim from commit `18562e5f3`:

1. **Bump the version** (`:30`):
   - from `const FORM_VERSION = 'cerbi-v1-2026-06-21';`
   - to `const FORM_VERSION = 'cerbi-v2-2026-07-05';`

2. **Update the Procedures section** wording:
   - v1: `...Interaction and performance data will be collected. Duration: up to 6 months.`
   - v2: `...Interaction, performance, and learning-behavior data will be collected (see Data Collected). Duration: up to 6 months.`

3. **Insert the "Data Collected" section** (after Benefits, before Confidentiality). This is the IRB-critical disclosure — verbatim from v2:

   > **Data Collected** — To study how gamified training affects learning and behavior, the platform records, tied to a research identifier: (a) learning progress and performance, which content you complete and your quiz scores; (b) engagement, the pages and lessons you view, time spent and periods of inactivity, how far you scroll, and session length; (c) technical context, your device and browser type and any errors encountered while using the platform. The platform does not record the text you type into free-form fields, and no data is shared in a form that identifies you.

Everything else (Purpose, Voluntary Participation, Risks, Benefits, Confidentiality, Data Usage, Consent) is identical between v1 and v2 — no change.

> Note: the current form ALSO carries the new "I decline to participate" option (2026-07-06, [[project_observatory_consent_decline]]) and the `agreements: { understoodStudy, agreedToParticipate }` fields. Those are independent of the version and must be preserved through the restore — do not revert to the raw `18562e5f3` file; apply the three edits above onto the current file.

---

## Decisions required (PI / IRB) — the blocking gate

Engineering will not change consent wording or force re-consent without explicit PI sign-off on:

1. **Re-consent is acceptable.** — **APPROVED by PI 2026-07-06.** Bumping to v2 re-prompts all existing consented participants. Actual blast radius, re-counted at staging time (`functions/_count_consent_versions.js`, 2026-07-06): **17** existing consent records, all on `cerbi-v1-2026-06-21`; every one is re-prompted on next visit. New cohorts consent fresh at v2. (Re-pull this immediately before deploy — it will keep growing as students consent at v1 until deploy.)
2. **The v2 "Data Collected" wording matches the IRB-approved consent.** — **APPROVED by PI 2026-07-06** (PI directed "restore v2 with the quoted wording"; text is byte-identical to the previously-shipped v2 in commit `18562e5f3`). If a formal IRB amendment number / approval date exists, cite it here for the compliance record.
3. **Study scope covers the new cohorts.** — **CONFIRMED by PI 2026-07-06** ("IRB covers both cohorts"). The study title is "Gamification in Cybersecurity Training and CERBI Score Analysis"; the PI confirmed the IRB approval covers enrolling the A+ Core 1 and Linux cohorts as research subjects.

### Data-hygiene finding (2026-07-06, separate from this change)

The re-count surfaced a discrepancy: **17** `observatory_consent` records vs **4** `observatory_enrollment` records. The admin dashboard roster reads only enrollment, so ~13 consented participants are not visible there and are excluded from roster-based counts. Likely legacy consents from before the atomic consent+enrollment batch existed. Not caused by this change and not fixed here — flagged for separate investigation (backfill enrollment docs, or confirm those 17 include test/dev records).

---

## Execution (once decisions are approved)

1. Apply the three edits above to `_app/components/ObservatoryConsent.js` (preserving the decline option + agreements fields).
2. Update the reconsent regression harness expectation if needed (`_tools/observatory/reconsent-check.js` asserts `source is on a v2 form version` — it will start passing once the version is v2).
3. Run the consent regression tests:
   - `node _tools/observatory/consent-decline-check.js` (decline/agree/legacy, must stay green)
   - `node _tools/observatory/reconsent-check.js` (v1-record → re-prompt → v2 write)
4. Adversarial review (Nancy) + quality gate (Chris PASS) — consent wording is IRB-sensitive.
5. Deploy hosting: `./deploy.sh`.
6. No CF change is required — `functions/index.js` already expects v2.

## Verification (post-deploy)

1. `curl https://hexworth.com/components/ObservatoryConsent.js | grep FORM_VERSION` → `cerbi-v2-2026-07-05`.
2. Consent as a test user; confirm the "Data Collected" section renders before signing, and `observatory_consent/{uid}.formVersion === 'cerbi-v2-2026-07-05'`.
3. Trigger a `page_view` as that user; confirm a matching row appears in `observatory_activity` (Phase-2 now admitted).
4. Confirm an existing v1 test record is re-prompted on next visit (not silently admitted).

## Rollback

Revert the three edits (version back to `cerbi-v1-2026-06-21` + remove the Data Collected disclosure) and redeploy hosting. Phase-2 collection returns to OFF (fail-safe). No data migration involved.

---

## Related

- [[project_observatory_telemetry_expansion]] — this is the exact item that project is blocked on.
- [[project_observatory_consent_decline]] — the decline option now on the same form; must be preserved through the restore.
- [[reference_observatory_classes]] — the class dropdown seeded for these cohorts (2026-07-06).
- `_docs/operations/observatory-activity-codebook.md` — event-type reference.
