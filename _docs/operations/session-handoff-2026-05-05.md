# Session Handoff — 2026-05-05

> Comprehensive state capture so any future session (whether resumed in 5 minutes or 5 weeks) opens with full context.
> **Current state verification:** `git log --oneline -10` and look for the most recent commits with subjects starting `docs(handoff)`, `fix(karl)`, or `docs(nancy-roundtrip)`. The first handoff commit was `389dac44`; subsequent fix-pass commits added Nancy-found gap fixes (HEAD hash unpinning, pre-staging removal, /tmp ephemerality flag, etc.).
> Session theme: SYM follow-up sprint (validator accuracy → safety net closeout → PROG-003 reductions → SYM-14 design + skeleton → Karl agent created → PD-1 sample begun → Nancy roundtrip on Karl + handoff)

---

## What shipped today (36 commits, 3 production deploys)

### Validator accuracy round (false-positive elimination, ~10 commits earlier in day)

Multiple EduScan validators tightened to suppress false positives without losing real-bug detection:
- `45ebb838` — SEC-001/SEC-002 false-positive guards + educational-content path exclusions
- `7da6e175` — QUIZ-001 counter-object false positive (CMMC dashboard had real questions + counter trackers in same file)
- `fde8a2ca` — Documented HEUR-018 + HUB-001 + QUIZ-* + bulk-LOW as deferred decisions
- `0e198310` — HEUR-024 false-positive (was demanding Course Home link from utility / lobby pages and from index.html files themselves)
- `1e9196bc` — NAME-002 scope tightening (no longer flags admin/components/signal/tenant infrastructure)
- `155a3f76` — SEM-001/002/003 slide-deck recognition (28 false positives suppressed)
- `20dd008e` + `49c61857` — Firebase deploy hosting.ignore extended (.bak, .pyc, __pycache__, .backup) — saves ~290 MB per deploy
- `b90e79d3` — HEUR-020 template-literal interpolated path skip
- `73a2d69f` — Nexus full --publish capturing the validator improvements

### Stragglers fusion follow-up (PROG-003 closures + content fixes, ~12 commits)

- `b14e41b6` — **HEUR-018 threshold bump 80% → 99.9% across 396 modules**. Fixes the user-facing "page marks complete before student finishes reading" bug. Real shipped student-facing fix.
- `4bc5a070` — G1 PROG-003: 4 'other' bucket renames with cross-credit shims (vault, ctf-leaderboard, clh-031 lab, grep-pipe-mastery, web simulators)
- `627e761e` — G Block B PROG-003: 3 title-mismatch pair resolutions (forge-core2-roleplay, script-python-chapter1 allowlist, shield-security)
- `80729671` — SYM-17 doc + sprint queue: CLH 3-layer investigation (curriculum-blocked)

### Safety-net infrastructure (Confluence inventory hook + alerts + cost monitor, ~6 commits)

- `aab465fe` — Confluence inventory dedup fix. Was warning every deploy ("PUT did not confirm v4 — got: 3"); root cause was Confluence silent dedup of semantically-identical content. Script now treats unchanged version as normal, not warning.
- D — GCP Cloud Billing budget at $30/mo with 50%/100%/110% thresholds (operator-executed, no commit needed)
- C — Cloud Monitoring log-based metric `runtime_monitor_failure` + email alert policy `runtime-monitor WARN — failures detected in last 30 min` (operator-executed via Cloud Console, no commit needed)
- `e7566682` — INTRO.md refresh (5-step deploy chain documented, alert MVP marked LIVE, cost monitor section added)
- `3e791d17` — _docs/INDEX.md: 16 ops docs from safety-net + SYM sprint registered

### HEUR-018 round 2 (validator demotion + allowlist + fixture, 4 commits)

- `4c04d5d1` — HEUR-018 severity demotion for thresholds ≥ 0.99 (Nancy-reviewed approach: keep detection, demote severity, no new false positives)
- `70aad91d` + `49deb754` — HEUR-018 false-positive allowlist for ai-guardrails + ai-prompt-engineering (quiz-score-gated, not scroll-gated)
- `3988a5e2` — HEUR-018 test fixture (test suite 58/58 → 59/59)
- STR-40 scope revised: CSP exams correctly identified as DominoEngine-graded, NOT MCQ — out of scope

### SYM-14 (auth probe design + skeleton, 2 commits)

- `0a3e4825` — SYM-14 auth-probe design doc with 6 open user decisions
- `07feba1a` — SYM-14 implementation skeleton: anonymous mode unchanged, auth mode fails cleanly with structured error pointing at first unmet decision. TODO markers in `auth-client.js` map 1:1 to design decisions.

### Final scan + handoff prep

- `e53c9491` — Nexus full --publish post-R-block

---

## State snapshot (as of initial handoff write at HEAD `07feba1a` — fix-pass commits since)

| Metric | Value |
|---|---|
| Master HEAD at initial handoff | `07feba1a` (fix-pass commits since — current HEAD via `git log --oneline -1`) |
| Production deploys today | 3 (HEUR-018 fix, G1 renames, Block B renames) — all smoke-green |
| HEUR-018 medium count | **0** (was 398 at session start) |
| HEUR-018 info count | 333 (acceptable interim debt — high-threshold scroll completion) |
| PROG-003 collisions | **13** (was 20 at session start; 7 closed: 4 G1 + 3 Block B) |
| Total Nexus findings | 12,644 (was 12,833) |
| EduScan tests | 59/59 |
| Sprint additions | +1 (SYM-17 — CLH three-layer investigation) |
| Memory entries created | +5 (no-stopping rule, Confluence dedup, severity demotion pattern, CLH 3-layer, Karl citation auditor) |
| Docs index updates | +16 ops docs registered |

### Production safety net — verified live end-to-end

- ✅ Runtime monitor (Cloud Run job): every 15 min, all 5 cycles passing
- ✅ Alert policy `runtime-monitor WARN`: enabled, will email <operator-email — see hexworth-infra-private> on failure
- ✅ GCP cost budget ($30/mo, 50/100/110% thresholds): active on Firebase Payment account `0123C4-A62FA8-F61316`
- ✅ Smoke gate in `./deploy.sh`: 3 deploys today, all green
- ✅ Confluence inventory post-deploy hook: bug fixed; future deploys log cleanly

---

## What's awaiting user input (gated work)

### PD-1 — STR-40 quiz keys (operator review)

- 14 quizzes / 280 questions total (CSP exams removed from scope — DominoEngine-graded)
- 237 of 280 questions flagged require_review (85%)
- DRAFT JSON exists at `functions/fw-quiz-keys-DRAFT.json` (102 KB, generated 2026-05-04)
- **NEW BAR established this session:** PD-1 is NOT just "review the JSON" — per architecture doc `~/hexworth-shared/KBA/quiz-solutions-manual-architecture.md`, every answer needs a sourced/evidenced solution in BOTH the markdown shared folder AND Confluence Quiz Solutions Manual. Sample for fw-w1-logical was begun this session (see "In progress" section below).

### SYM-14 — auth-probe implementation

Six design decisions in `_docs/operations/sym-14-auth-probe-design.md`:
1. Credential storage approach (Secret Manager recommended)
2. Cycle frequency (every 30 min recommended)
3. MFA on test account (disable recommended)
4. Initial probe scope (A1 + A3 recommended)
5. Test account email (`runtime-monitor@hexworth.com` proposed)
6. Rotation cadence (quarterly recommended)

After answers: implementation is ~30 min — fill TODO markers in `_tools/runtime-monitor/auth-client.js`, deploy second Cloud Run job, update existing alert filter to `job_name=~"runtime-monitor.*"`.

### SYM-17 — CLH course three-layer cleanup

Curriculum-owner direction needed before any rename. Full investigation in `_docs/operations/sym-17-clh-three-layer-investigation.md`. Key finding: hub MODULES array is canonical and matches OLD applets, NOT course modules. The "module wins" naive read is BACKWARDS.

---

## In progress: fw-w1-logical citation sample

This is the active work-in-progress at handoff. Started after user revealed the architecture-doc bar (sourced solutions with citations, not just answer keys).

### Files

| File | State |
|---|---|
| `~/hexworth-shared/Solutions/Shield-FW/Quiz-W1-Logical_ANSWERS.md` | Markdown sample, 15 questions, NIST/Microsoft Learn/RFC/Wikipedia citations, [DRAFT] header |
| Confluence page id `8486914` | "[DRAFT] Shield — FW-W1: Logical Security Quiz" at v3 (rich format with rationale + distractor analysis + citation per question). URL: https://hexworth.atlassian.net/wiki/spaces/KBA/pages/8486914 |
| `/tmp/build-fw-w1-logical-confluence.js` | **EPHEMERAL — not committed, not in shared folder, will not survive reboot.** Was used to build the Confluence v3 body. Karl can audit the published Confluence page directly without this script; if needed for batch-generating the other 13 quizzes, regenerate from scratch by reading the quiz HTML + writing a similar QUESTIONS array. Treat the existing /tmp file as gone the moment the machine reboots. |
| `functions/fw-quiz-keys-DRAFT.json` | The seed-from JSON. Q4 of fw-w1-logical was corrected 2026-05-05 (auto-derived 0 → verified 1) with `_q4_correction_note` field added inline. After Karl audits the citations and any apply, the answers_DRAFT array becomes the seed source for `quiz_keys/fw-w1-logical`. |

### What's needed next

1. **Karl audits the citations on Confluence page id 8486914.** Invocation pattern: see Karl section below — minimal point-at-artifact prompt only. Do NOT pre-stage URLs, quotes, classifications, or "areas of concern" — that bias is exactly what Karl exists to prevent. Let him discover what he discovers.
2. Apply Karl's verdicts (fix any DENY/REJECT, optionally upgrade WEAK)
3. Push final Confluence page version + update markdown to match
4. Operator final approval
5. Derive Firestore key from `functions/fw-quiz-keys-DRAFT.json` `answers_DRAFT` field for `fw-w1-logical` (now corrected for Q4) and seed via the standard quiz-keys deployment
6. **THEN** scale the same approach to the other 13 STR-40 quizzes (multi-session work)

> **Why no "citation issues already surfaced" table here:** an earlier draft of this handoff included one with Q4/Q5/Q9/Q14 pre-staged findings. Nancy adversarial review caught that pre-staging defeats Karl's design (he should discover issues independently, not confirm a list someone else made). Removed.

---

## Karl — Citation Auditor agent

**Created this session.** Definition file: `~/.claude/agents/karl.md`. Memory entry: `reference_karl_citation_auditor.md`. Listed in MEMORY.md.

**Why Karl exists:** The fw-w1-logical citation rebuild surfaced multiple lazy-citation failure modes — NIST PDF landing pages cited as "the source", citing NIST 800-63-3 for an authorization question when that doc says authz is out of scope, paraphrased "verifying quotes" not actually present on the page. Karl prevents these by gating every citation through actual content fetch + content-matches-claim verification.

**When MANDATORY to invoke:**
- Before any commit to `~/hexworth-shared/Solutions/` answer-key markdown
- Before any push to Quiz Solutions Manual in Confluence
- Before any documentation citing an external authoritative source

**Same shape as Nancy:** sub-agent, has veto power. Verdicts: PASS / WEAK / DENY / REJECT / CANNOT_AUTO_VERIFY (for 403-blocked sources).

### How to invoke Karl

Karl is an SME. Point him at the artifact and let him work. Do NOT pre-stage URLs / quotes / classifications / "areas of concern" — that biases him toward confirming your work instead of independently auditing.

```
Agent({
  description: "Karl audit [artifact name]",
  subagent_type: "karl",
  prompt: "Audit the citations in [artifact location]. [Access path if needed.]"
})
```

Examples of correct minimal prompts:
- `"Audit the citations in Confluence page id 8486914 (KBA space, hexworth.atlassian.net). Credentials at ~/.config/confluence/credentials.json."`
- `"Audit the citations in ~/hexworth-shared/Solutions/Shield-FW/Quiz-W1-Logical_ANSWERS.md."`
- `"Audit the citations in _docs/operations/<doc>.md."`

Karl reads the artifact himself, identifies each citation, audits independently against his criteria (live + HTML-direct + opens-on-the-answer + content-matches-claim + quote-verbatim + source-type-appropriate), and returns per-citation verdicts. The submitter then fixes any DENY/REJECT and resubmits.

---

## Memory entries created today (auto-loaded into all future sessions)

All in `~/.claude/projects/-home-eq-ai-content-hexworth-prime/memory/`:

1. `feedback_no_stopping_in_marathon.md` — CRITICAL: never offer "stop"/"pause" in marathon mode
2. `reference_confluence_dedup_behavior.md` — Confluence silent-dedup on PUT; trust independent GET
3. `feedback_severity_demotion_pattern.md` — when fix mitigates bug but pattern still detectable, demote severity (don't broaden detection)
4. `reference_clh_three_layer_architecture.md` — CLH course has 3 file layers per slot + hub migration shim
5. `reference_karl_citation_auditor.md` — Karl exists, when to invoke

All five referenced from MEMORY.md index.

### Sub-directory of note: `_docs/operations/karl-prompts/`

This directory contains a single file `fw-w1-logical-citations.md` whose entire content is a DEPRECATION NOTICE. Background: an earlier draft of the Karl invocation pattern saved a 118-line "paste-this-prompt" file with all 15 citations pre-staged. User correctly identified that as constraining Karl to confirming the primary agent's framing. The file was overwritten with a deprecation notice explaining the right pattern (point at the artifact, no pre-staging). Per "we do not destroy," the file remains as a historical record of the wrong pattern. **Do not interpret the directory's existence as suggesting future Karl audits should have per-artifact pre-staged prompts. They should not.**

---

## Insights from this session — lessons future-me should not re-learn

These are the substantive lessons from today's work. Most are also captured in the memory entries (auto-loaded), but listing them here in handoff context too because they were earned the hard way and the trap patterns recur.

### 1. Read the existing standard FIRST. Don't reinvent.

PD-1 has a 200-line architecture doc at `~/hexworth-shared/KBA/quiz-solutions-manual-architecture.md` that defined exactly what a "verified quiz solution" requires (rationale + distractor analysis + citation URL + verification level + the citation source-type table). I proposed three different "formats" for fw-w1-logical before the user pointed at the architecture doc. **Cost: multiple iterations of back-and-forth that should have been one search-the-shared-folder-first action.** Future-me: when the user says "this is how X works" — search `~/hexworth-shared/KBA/` and `_docs/` for an existing standard before proposing your own.

### 2. Citation laziness is a real failure mode

I generated NIST URLs from training-data memory and never fetched them. The user called it laziness. The Q4 trap was the worst case: I cited NIST 800-63-3 for a question about the difference between authn and authz — but that document explicitly says "authorization is out of scope of these guidelines." I had cited a source that said "we don't address this" for a question literally about that thing.

**Lessons:**
- Always WebFetch a citation URL before claiming it
- Read what the page actually says about the specific claim, not what you assume it says about the topic
- A "verifying quote" must be VERBATIM from the page; if you paraphrase, the audit fails
- HTML-direct content is the bar; PDF download landing pages (csrc.nist.gov/publications/detail/...) FAIL even though they sound authoritative
- Wikipedia is SECONDARY only per architecture doc — primary sources preferred where HTML-available

### 3. Karl exists because of failure mode #2

Karl isn't a nice-to-have. He's a specifically-shaped gate against the lazy-citation pattern that produced 5 bad citations in the v1 fw-w1-logical sample. When working on quiz solutions or any evidence-bearing artifact, **INVOKE KARL via the Agent tool**. Don't simulate him. Don't "do his job manually." See `feedback_no_stopping_in_marathon.md` for the exact failure mode of "I'll just do it myself" — that defeats the agent's design purpose.

### 4. The "stop / pause / clean session close" reflex is laziness

I offered "stop" or "pause" as a SELECTABLE OPTION 3-4 times today. User explicitly called it out: "you want to be idle?" Memory entry `feedback_no_stopping_in_marathon.md` captures the rule. Meta-pattern: when I'm tempted to suggest "pause," there's almost always something else I should be doing. Marathon mode = every option presented must be ACTION.

### 5. "A or B" framing without genuine equivalence is deflection

Twice today I asked the user to choose between options where one was clearly correct. Specifically: "A: restart for Karl / B: I'll run manually" — option B was obviously wrong because it defeats the entire purpose of creating Karl. The user said: "that was a very stupid and unnecessary question." Lesson: if one option is materially better, recommend it explicitly with reasoning. If options are genuinely equivalent, present them. Don't outsource decisions you should make.

### 6. Don't pretend to be a sub-agent

When I created Karl and then "ran his protocol manually in my context," I defeated the whole point of agent isolation. The user caught it: "not you pretending to be karl." Sub-agents exist so a fresh-context, narrow-mandate reviewer can audit your work independently. Substituting yourself is exactly the bias the sub-agent was created to prevent.

### 7. Confluence has semantic deduplication on PUT

Byte-different ≠ semantically different. Em-dash (`—`) gets normalized to `&mdash;` HTML entity. Macro elements get `ac:macro-id="auto-info-1"` attributes auto-injected. Client-side normalization to predict Confluence's normalization is a moving target — Atlassian can change rules anytime. **The right pattern:** PUT unconditionally, then GET to read authoritative state, treat "version-stayed-same" as a normal "no semantic change" outcome (not a warning). Reference implementation in `_tools/confluence/push_hub_inventory.sh`.

### 8. The shared folder lives OUTSIDE the repo

`~/hexworth-shared/` is a Samba mount of shared infrastructure. Solutions, KBA architecture docs, scraper outputs, training materials — all live there, NOT in `/home/eq/ai-content/hexworth-prime/`. PD-1 work touches BOTH (markdown answer keys in shared folder, code in repo). Don't try to `git add` shared-folder files; they're not repo content. Don't forget about them when checking "what did I produce" — `git status` won't show them.

### 9. HEUR-018 severity demotion as a generalizable validator pattern

When a validator catches a bug that's been MITIGATED but the pattern is still technically detectable, the right fix is **severity demotion** (keep detection, demote `medium` → `info`), NOT broadening the regex (which creates new false positives in unrelated code). Nancy adversarial review caught my instinct to broaden the regex; severity demotion sidestepped 3 distinct concerns. Memory entry: `feedback_severity_demotion_pattern.md`. Generalize this to other validators when the same situation arises.

### 10. CLH course is structurally larger than the symptom

PROG-003 flagged 13 CLH-NNN slots as "key collisions." The naive read was "rename one of the two files." Reality: there are THREE file layers per slot (old applet + course module + linux applet) AND a hardcoded hub migration shim that assumes the `script-clh-NNN-intro` key shape. Renaming applets BREAKS the hub progress card silently. Memory entry: `reference_clh_three_layer_architecture.md`. Generalize: **before proposing key renames anywhere, grep for migration shims that assume the old key shape**. Don't just edit the call site.

### 11. The DRAFT JSON's auto-derived answer for Q4 was wrong

`functions/fw-quiz-keys-DRAFT.json` had Q4 of fw-w1-logical at option A (incorrect — definitions reversed). The inline quiz explanation clearly establishes option B. The auto-derive script's text-similarity scoring failed on this question. **Generalize: auto-derived answer keys are starting points, not ground truth. Every answer needs operator-or-Karl verification before shipping.** This is exactly the kind of error that makes the architecture doc's "every answer requires a verifiable URL" rule load-bearing.

### 12. The hex-rule pattern (precision over speed) compounds

Several times today I caught myself wanting to "just ship it." Each time the user (or Nancy, or the verification step) caught a real flaw I would have shipped:
- HEUR-018 plan would have shipped without severity-demotion thinking → would have created new false positives
- CLH rename plan would have shipped without reading the hub shim → would have broken hub progress for completing students
- fw-w1-logical citations would have shipped with NIST PDF landing pages → would have failed the architecture-doc bar
- Q4 citation would have shipped with NIST 800-63-3 → cited a source that says "out of scope" for an authz question

**Generalize: every "shortcut" temptation has a real cost that's larger than the shortcut's perceived savings.** The hex rule isn't a slogan; it's the pattern that prevents these specific failure modes.

---

## Things to NOT redo (already shipped, don't revisit)

- Q4 NIST→Microsoft Learn citation fix in fw-w1-logical Confluence v3 — shipped, don't roll back
- Confluence inventory dedup behavior investigated and fixed in `aab465fe` — bug is solved, don't re-investigate
- HEUR-018 severity demotion approach (was Nancy-approved, broader regex was rejected) — don't try to broaden detection
- HUB-001 cleanup (verified non-defect, deferred to SYM-8) — don't try to "fix" the 27 hubs / 503 broken module references (it's NOT 27 individual broken links; it's 27 hubs each with multiple broken `data-module` attrs totaling 503)
- Validator-accuracy round (false-positive guards already shipped across SEC/QUIZ/HEUR/SEM/NAME) — let any new false positives surface organically before further tightening

---

## Recommended next-session opening sequence

1. Open MEMORY.md (auto-loaded by system)
2. Read THIS handoff doc (`_docs/operations/session-handoff-2026-05-05.md`)
3. Verify state: `git log --oneline -10` — you should see commits with subjects like `docs(handoff)`, `fix(karl)`, and `docs(nancy-roundtrip)` (or similar). The first handoff commit was `389dac44`; if HEAD is at or after that, you're on the right tree. Specific HEAD will differ from the original `07feba1a` snapshot due to fix-pass commits.
4. **Invoke Karl on the fw-w1-logical Confluence page.** Use this exact minimal prompt (do NOT add to it; do NOT pre-stage citation findings):

   ```
   Audit the citations on Confluence page id 8486914 (KBA space, hexworth.atlassian.net).
   Credentials at ~/.config/confluence/credentials.json.
   ```

   ```
   Agent({
     description: "Karl audit fw-w1-logical citations",
     subagent_type: "karl",
     prompt: "[the 2-line prompt above, verbatim]"
   })
   ```

5. Apply Karl's verdicts: fix any DENY/REJECT, optionally upgrade WEAK. For any CANNOT_VERIFY_BY_DESIGN, write an entry in `~/hexworth-shared/Solutions/_audit/citation-overrides.log.md` per the architecture-doc format.
6. Push updated Confluence page version + update markdown to match
7. Ask user: ready to seed `quiz_keys/fw-w1-logical` to Firestore from `functions/fw-quiz-keys-DRAFT.json` `answers_DRAFT` field? Or audit one more sample (e.g., fw-w1-physical) to lock the format before bulk?
8. After fw-w1-logical is fully shipped: STR-40 batch process for the other 13 quizzes is the natural sequel.

---

## Loose ends in repo at handoff

To be cleared by the commit that ships this handoff doc:
- `_tools/sprint-master/sprints.json` — auto-triaged ES-1104 entry, non-destructive
- `_docs/operations/board-clearing-options-2026-05-05.md` — triage doc from session, useful operational record

---

## Scope discipline note

The architecture standard `~/hexworth-shared/KBA/quiz-solutions-manual-architecture.md` is the source of truth for what a "verified quiz solution" requires:
- Per-question rationale + **distractor analysis** (why each WRONG option is wrong) + **citation URL** (HTML-direct, content-verified) + **verification level**
- Citation URLs MUST take you to the content (PDF landing pages FAIL)
- Verifying quote MUST be verbatim or near-verbatim on the page (paraphrases FAIL)
- Wikipedia is SECONDARY ONLY; primary sources preferred where available

**Karl exists to enforce this standard.** Don't ship citations that haven't gone through him.
