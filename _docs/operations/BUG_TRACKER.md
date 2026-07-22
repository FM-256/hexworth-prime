# Bug Tracker

> The running ledger of **real bugs found during work** — QC catches (Nancy/Chris/Karl), user
> reports, and live incidents. Newest first. Move an entry to **Resolved** only when the fix is
> deployed AND verified.

**What goes where (so we don't scatter):**
| Surface | For | Where |
|---------|-----|-------|
| **This tracker** | Human-found bugs during work / QC / user reports / live incidents | `_docs/operations/BUG_TRACKER.md` |
| Nexus / EduScan → Pulse | Automated scanner findings (13k+) | `_triage_queue` / `_auto_fix_queue`, `pulse.html` |
| Sprint Master | Planned/scheduled work items | `_tools/sprint-master/sprints.json` |
| Marathon backlog | Side-discoveries to work during marathon time | memory `project_marathon_backlog.md` |

**Entry schema** (copy this):
```
### BUG-NNN — <one-line title>  ·  [severity P0-P3]  ·  [status]
- **Found:** YYYY-MM-DD · by <Nancy|Chris|Karl|user|scan|self> · in <session/task>
- **Area:** <file:line or feature>
- **Symptom:** <what goes wrong, for whom>
- **Repro:** <steps / inputs>
- **Root cause:** <why>
- **Fix:** <commit(s)> — <what changed>
- **Verified:** <who / how>
- **Related:** <links / other BUG-NNN>
```
Severity: **P0** live student-facing harm / data loss · **P1** broken feature or integrity · **P2** wrong-but-contained · **P3** cosmetic/hygiene.
Status: `open` · `in-progress` · `fixed-not-deployed` · `resolved`.

---

## Open

_From the 2026-07-21 verify-first triage of the marathon backlog (38 items → 14 real). P2s logged individually; the P3 tail is one cluster entry. Resolved/not-a-bug items were cleaned from the marathon backlog, not re-filed here._

### BUG-011 — 4 adv-linux module ids absent from BOTH content registries (HUB-001)  ·  P2  ·  open (two-registry sync)
- **Found:** 2026-07-21 · by triage (scan); scope corrected by Nancy 2026-07-22
- **Area:** `_app/components/ContentCatalog.js` AND `_app/components/LearningPaths.js` — the adv-linux hub tracks 4 `data-module` ids (`ala-hunt1-website-down`, `ala-hunt2-perimeter-open`, `ala-hunt3-lost-authority`, `ala-final-practical`, all real content) that are in NEITHER registry.
- **Symptom:** ContentCatalog gap → completion state untracked. LearningPaths `'adv-linux'.modules[]` gap → the 3 hunts + final practical are absent from `path-view.html`'s roadmap, path duration is short, and `getNextModule` walks past them.
- **Nancy finding (why the first attempt was reverted):** a ContentCatalog-only patch (drafted 2026-07-22, then REVERTED off master before deploy) is HALF a fix — it repeats the "one registry updated, one forgotten" mistake this codebase has been burned by (`7d39393a1`). The two registries also have DIFFERENT membership (LearningPaths omits the lecture modules the hub uses as sequence anchors), so the hunts must be placed against LearningPaths' actual prerequisite chain, not the hub's order.
- **Fix (pending, do together):** add the 4 to ContentCatalog **and** to LearningPaths `'adv-linux'.modules[]` at the correct sequence position with rewired `prerequisites` (insert + repoint the following module), then verify `path-view.html` renders them. Hub canonical order: hunt1 after `ala-w1` block, hunt2 before `ala-midterm`, hunt3 before `ala-w4`, final-practical after `ala-final`.

### BUG-010 — `validateFlag` rejects trailing-dot FQDN answers  ·  P2  ·  open
- **Found:** 2026-07-21 · by triage · in backlog item 8
- **Area:** `functions/index.js` `validateFlag` (~:223/231/251) — only `.trim().toLowerCase()`, no trailing-dot normalize
- **Symptom:** DNS/recon boxes: a student who pastes `ns1.example.` (dig prints the trailing dot) mismatches the stored `ns1.example` → wrong-flag penalty for a correct answer.
- **Fix:** pending — strip a single trailing `.` on FQDN-shaped answers before compare.

### BUG-009 — Honor-click Jeopardy: self-judged, no answer check (shared engine + siblings)  ·  P2  ·  open (operator scope decision)
- **Found:** 2026-07-21 · by triage · in backlog item 26
- **Area:** shared `_app/_games-lab/jeopardy.html` (`judgeAnswer(true)` on "I Got It Right", ~:581,1004) + 5 sibling forge review files (e.g. `eth-jeopardy.review.html:979`). The `accepts:[]` auto-grading upgrade only reached `forge-aplus-jeopardy.applet.html`.
- **Symptom:** solo player reveals a clue and self-marks correct with zero answer validation. Low-stakes (review game, not a graded exam), but an integrity gap.
- **Decision:** scope — fix the shared engine + ~5 siblings, or accept honor-mode for review games. Operator call. (Related: `forge.mjs mapJeopardy` drops `accepts` on re-run — BUG-cluster P3 below.)

### BUG-008 — Grading honesty: Armory + da-linux labs grant credit on command TEXT, no success check  ·  P2  ·  open (sweep-scale)
- **Found:** 2026-07-21 · by triage · in backlog item 12 (= marathon Lane-A item 4)
- **Area:** `_app/houses/code/armory/**` (~20: arm-bash/sql/c-*) + `_app/houses/dark-arts/**` (23 `da-linux-*`). Example `arm-bash-01-intro.module.html:511-515,555` — `completeTask` fires on `cmdLine.includes(...)` alone (grep `lt-error` across armory = 0 files), then `ModuleProgress.complete('code','arm-bash-01-intro')` grants real credit.
- **Symptom:** `chmod +x nonexistent.sh` completes the task though nothing was chmod'd. Same honesty class as the LM-1 sweep.
- **Nuance:** intro modules MAY intend command-shape pedagogy (per LM-1) — needs per-module practice-intent judgment, not a blanket wire-in of `ok`. Sweep-scale.
- **Fix — arm-bash phase: DEPLOYED + LIVE 2026-07-22 (`8a505c12a`):** honesty `ok`-gate (`!(output||'').includes('lt-error')`) applied to the verified-clean tasks across arm-bash-01/02/03/07/08/09. Real-engine keeper harnesses `_tools/armbash-honesty-test.js` (24 cases, literal TASK_INSTRUCTIONS strings; `chmod +x` missing-file + `sedd` command-not-found stay BLOCKED) + `_tools/armbash-honesty-seq-test.js` (full sequential student flow). Nancy PASS (2 rounds — caught + fixed: piped/redirected instructed commands were unreachable via `cmd===X`, fixed with a command-position regex; `stderr` un-gated as an error-teaching task; dead `let` branch removed). Chris PASS. Deployed via `deploy.sh` (10/10 smoke, post-verify PASSED); live-verified gate present in production.
- **Fix — arm-sql phase: HELD ON BRANCH `armsql-honesty-wip` (commit `a6c03695e`), NOT deployed (2026-07-22).** The honesty-gate mechanism + `SQLEngine.js` engine bug fixes are sound and verified (Nancy confirmed the mechanism twice), but arm-sql CONTENT is systemically broken and needs a dedicated REBUILD before this can ship. **Engine bugs found+fixed (real, on the branch):** (a) `_parseValueList` mis-parsed quoted INSERT values (`'a','b',1`→5 values) → EVERY quoted-string INSERT failed; (b) 0-row `UPDATE`/`DELETE` rendered unconditional success → no-op earned credit; (c) `GRANT`/`REVOKE` weren't in `SQL_LEAD_WORDS`/had no handler → never reached the engine; (d) `MIN`/`MAX` numeric-only → returned 0 on TEXT (timestamps); (e) missing seed: `network_logs` table + `users.password_hash`. **BLOCKER (why held):** the runnable worked-example CANNED OUTPUTS are FABRICATED in **11/12 boxes** — they print an imaginary larger dataset (2026 dates, `COUNT=847`, `142` fails) vs the real 12-row/2024 seed, so a student clicking Run sees the real result contradicting the printed one. That's a content-authoring rebuild (all modules), not a gate patch. Full position: `_docs/operations/armsql-honesty-wip-status.md`. See [[project_marathon_backlog]].
- **Fix — remaining:** arm-bash-04/05/06/10 (conditionals/loops/functions/advanced) PINNED — the LinuxTerminal engine can't execute bash *language constructs*; needs a C1(engine-build)-vs-C2(module-rewrite) decision. **arm-sql-10 PINNED** (gate reverted, matches HEAD) — needs a CONTENT REBUILD not a gate: its schema-reference box is fabricated for all 4 tables and its incident IP `192.168.1.99` exists in no seed table (Nancy 2026-07-22). Plus 23 da-linux (most already outcome-gated).
- **RESIDUAL GAPS (Nancy, accepted tradeoffs — tracked not fixed):** (1) engine `grep`/read-commands don't emit `lt-error` on a missing FILE, so `grep /nope` still passes — same class as the 2026-07-08 cp engine fix; gate catches command-not-found + reported errors only. (2) the command-position regex matches RAW typed text, so `echo "... | sed ..."` (sed inside quoted text) would credit sed — forced because the engine flattens a piped `cmd` to `'pipe'` and exposes no per-segment tokens. (3) `stderr` un-gated is maximally permissive (`xyz 2>/dev/null` completes it) — engine can't distinguish an expected redirect-error from a typo. (4) engine `2>` is split on bare `>` (not parsed as one token) so stderr isn't actually suppressed. 1+4 are engine fixes (own Nancy/verify); 2+3 resolve if 1/the-flattening is fixed.

### BUG-CLUSTER-P3 — 2026-07-21 triage P3 tail (cosmetic / latent / low-value)  ·  P3  ·  open (batch when convenient)
- **DONE 2026-07-22 (batched hosting fixes, DEPLOYED live via `./deploy.sh`, Nancy PROCEED + Chris PASS, post-verify 5/5 green):** item 9 Dark-Arts Five-Gates→Vault CTA — now shows a "coming soon" notice instead of navigating to the unbuilt `vault/index.html` (`dark-arts/index.html` `updateVaultStatus`, matches the interceptor UX). · item 23 cloud-iam-debugger case-sensitive action match — `globToRegex` gained a `flags` param; `actionMatches` now passes `'i'` (AWS actions are case-insensitive); `resourceMatches` deliberately unchanged (ARNs case-sensitive). Verified in node.
- **DONE 2026-07-22 (item 7 — actually 6 files, not 24; the "×24" was the raw HTML-011 emission count):** the 6 cyberops applets that opened tab panels with `<section id="X" class="co-tab-content...">` but closed each with `</div>` (4 unclosed `<section>` + 4 orphan `</div>` per file) — converted the 4 panel opens per file `<section ...>`→`<div ...>` to match the 37 working sibling applets (which use `<div class="co-tab-content">`; JS/CSS target the class + `getElementById`, never the tag, so behavior-preserving). Files: `eye-5-tuple-approach`, `eye-attack-surface`, `eye-data-loss-traffic`, `eye-data-types-output`, `eye-data-visibility`, `eye-detection-methods` (`.applet.html`). Verified: real EduScan HTML validator now 0 HTML-011/012 on all 6 (pre-fix fired 4× each); browser render harness `_tools/eduscan/smoke/cyberops-tab-render.js` 6/6 PASS (4 sibling DIV panels, tabs switch, 0 errors) + visual spot-check. Nancy PROCEED, Chris PASS (both independently re-verified). **DEPLOYED live 2026-07-22** (`9a7b989f8` via `./deploy.sh`); all 6 verified live (0 `<section id=`, 4 co-tab-content div panels each). Post-verify flagged a transient `ERR_HTTP2_PROTOCOL_ERROR` on the unrelated `pis-l09` lab (my change touched only eye/cyberops) — re-ran the smoke twice, 10/10 PASS both times, confirmed transient; Confluence inventory regen skipped that cycle (cosmetic).
- **VERIFIED-RESOLVED-IN-CODE 2026-07-22 (item 24 — no change needed, tracker was stale):** cloud-iam-debugger Round-8 encryption null-check is already correctly implemented AND documented — `conditionSatisfied()` handles a MISSING context key per operator (StringNotEquals → satisfied; StringEquals/Bool/IpAddress → not satisfied), with a full explanatory comment block, and Round 8's `explanation` already states "a missing encryption header is treated as 'not AES256'". Simulated the engine against Round 8's intended-fix policy + all 3 testCases: PutObject+AES256→Allow, PutObject+{}→Deny, GetObject+{}→Deny — all correct.
- **DONE 2026-07-22 (item 22 — dead CSS removed):** removed 18 provably-dead CSS classes + orphan `@keyframes pulse` from cloud-iam-debugger (`.json-key/-string/-number/-boolean/-bracket`, `.problem-highlight`, `.fix-options/-option(+.selected/.correct/.incorrect/:hover)/-label/-code`, `.diff-add/-remove`, `.pulse`, `.timer-bar/-fill` — leftovers from removed features). 5 regions, 131 deletions / 0 insertions (removal-only). Verified: grep sweep 0 remaining refs (no orphan comments), CSS braces balanced (63/63), live `@keyframes iamStatPulse`/`slideIn` untouched, and the game's own harness `_tools/arcade-fixes/iam-debugger-check.js` PASSES (all 10 rounds grade, game completable, XP once, 0 console errors) — which also re-confirms item 24's Round-8 null-check end-to-end. Nancy PROCEED (confirmed zero dynamic class construction anywhere + zero external consumers). Chris gate + deploy pending. (Nancy noted a SEPARATE out-of-scope smell: duplicate `.back-link` blocks where the 2nd `:hover` color shadows the 1st — not fixed here.)
- **BACKLOG CLOSED 2026-07-22:** the div-tag-mismatch finding (`html-div-mismatch-finding-2026-05-09.md`, orig. 27 files) is now fully resolved — a fresh `<div>`-balance scan of all 5,181 `_app` HTML files run through the real EduScan validator shows **0 real HTML-011/012 remaining** (the 5 raw-count imbalances left are JS-template/string artifacts, validator-CLEAN). The 6 cyberops files above were the last real ones.
- STILL OPEN: forge-troubleshooting-scenarios pill objective numbers vs corrected headers (item 1 — needs official CompTIA A+ objectives as ground truth; header/pill numbers are genuinely wrong, not just inconsistent) · Game Forge `mapJeopardy` drops `accepts` on re-run (item 27 — not in hosting tree, `_tools` concern) · LinuxTerminal root home `/home/root` vs `/root`, no grading impact (item 13) · LinuxTerminal `_cp` partial-copy + `_mv`/`_cp` leading-flag strip, bash-borderline, zero live exposure (items 37,38).

---

## Resolved

### BUG-007 — Double-XP: `trackProgress:true` + `onComplete→completeQuiz` double-award  ·  P2  ·  resolved (deployed 2026-07-21, `227dfcf7d`; Chris live-verified single write; residuals operator-accepted: silent banner + no backfill)
- **Fix:** `aa09e7106` — `trackProgress:false` on `dark-arts-ceh-01.quiz.html`. Nancy CONFIRMED the XP-amount double-award is fully closed (all 3 completion gates `QuizEngine.js:419,548,582` check trackProgress; 0/390 other quizzes share the pattern; no `ceh-01`-keyed reader). **Deploy held on operator decisions below.**
- **RESIDUAL 1 (operator decision) — silent XP banner:** with trackProgress:false, `progressResult` is null so the results-screen "+N XP earned" banner no longer renders on this quiz (XP still awarded + shown on dashboard). Restoring it needs a shared-QuizEngine change (feed banner from completeQuiz's award) — disproportionate for 1 quiz. REC: accept silent on this one quiz. Operator call.
- **RESIDUAL 2 (operator decision) — historical inflation:** students who passed pre-fix have `modulesCompleted` with 2 entries for 1 completion (feeds milestone triggers `ProgressManager.js:786` + counts `:952`), permanent unless backfilled. Scope: only this 1 quiz's passers, +1 module count each. REC: document (here), no backfill migration for one quiz's +1. Operator call.
- **Found:** 2026-07-15 (surfaced), verified-down 2026-07-21 · by self · in marathon Lane-A item 3
- **Area:** `_app/components/QuizEngine.js:419` (trackQuizCompletion awards via ProgressManager) + page `onComplete` that calls `completeQuiz()`
- **Symptom:** a quiz can award XP twice — once via the engine's `trackProgress` path, once via a page `onComplete` that calls `completeQuiz`. Inflates the XP/evidence layer.
- **Repro:** load a quiz whose config has `trackProgress:true` AND an `onComplete` that calls `completeQuiz`, pass it → XP awarded on both paths.
- **Root cause:** two independent completion→XP paths not de-duplicated.
- **Verify-first result (2026-07-21):** NOT platform-wide. Only **1 file** literally co-occurs `trackProgress:true` + `completeQuiz()`; the other 392 `trackProgress:true` quizzes use the single-award path. Down-scoped from "platform-wide" to a 1-file fix + an engine-level guard question (should the engine de-dupe if both fire?).
- **Related:** marathon backlog [2026-07-15].


### BUG-006 — Stray QC temp file `chris_qc_tile_grid_tmp.html` deployed live to prod  ·  P3  ·  resolved
- **Found:** 2026-07-21 · by self · in Sextant marathon (hosting deploy)
- **Area:** `_app/chris_qc_tile_grid_tmp.html` (was live at hexworth.com/chris_qc_tile_grid_tmp.html, HTTP 200)
- **Symptom:** an earlier QC agent left a scratch HTML inside `_app/`; a hosting deploy pushed it live. Firebase Hosting deploys the whole `_app` dir, tracked or not.
- **Root cause:** QC agents write scratch files into the served dir instead of scratchpad.
- **Fix:** removed from `_app` (archived to scratchpad); drops from prod on next hosting deploy. **Verified:** self (curl was 200, file removed). **Related:** hygiene — QC agents should write to scratchpad, never `_app/` or repo root.

### BUG-005 — Sextant consent gate read only one collection (weaker than telemetry CF)  ·  P1  ·  resolved
- **Found:** 2026-07-21 · by Nancy · in Sextant Stage 1
- **Area:** `functions/sextant.js` `loadConsentedLearners`
- **Symptom:** snapshot decline-gate checked `participates` on `observatory_enrollment` only; the telemetry CF checks BOTH enrollment AND consent (OR). A future one-doc desync would silently archive a declined learner weekly.
- **Fix:** `539cc0334`-lineage — gate now excludes iff `participates===false` on EITHER doc. **Verified:** Chris (mock-Firestore, declined-via-consent-only excluded). **Related:** BUG-001.

### BUG-004 — Stored XSS via user-writable `classId` in the cohort reader  ·  P1  ·  resolved
- **Found:** 2026-07-21 · by Nancy · in Sextant Stage 2
- **Area:** `_app/admin/sextant-cohorts.html` (cohort toggle build)
- **Symptom:** `classId` (a field any learner writes on their own `observatory_enrollment`, no server validation) was injected into an admin page via `innerHTML` → stored XSS in an admin session.
- **Repro:** learner sets `classId` = `"><img src=x onerror=...>`; admin opens cohort reader (needs ≥5 such learners to pass k-anon).
- **Root cause:** `innerHTML` template-literal build of user-controlled data.
- **Fix:** `539cc0334` — toggles built via DOM `createElement`/`createTextNode`; classId never HTML-parsed. **Verified:** Chris (live payload → `window.__XSS__` undefined, literal text, no injected `<img>`).

### BUG-003 — `purgeLearner` silent no-op on missing pepper broke right-to-withdraw  ·  P1  ·  resolved
- **Found:** 2026-07-21 · by Nancy · in Sextant Stage 1
- **Area:** `functions/sextant.js` `purgeLearner`
- **Symptom:** if the pepper was unavailable at withdrawal time, purge returned 0 silently while real Plane-B data existed → learner told "deleted" but wasn't.
- **Fix:** `90ea32071` — purge fails loud on missing pepper; withdrawal records `sextantPurged:false`; `reconcileWithdrawals` drains the queue on the next snapshot. **Verified:** Chris + self (throws on null pepper; reconcile drains + isolates per-learner failure). **Related:** BUG-001.

### BUG-002 — `getMyTrajectory` unordered `.limit()` silently corrupted trajectories  ·  P1  ·  resolved
- **Found:** 2026-07-21 · by Nancy · in Sextant Stage 1
- **Area:** `functions/index.js` `getMyTrajectory`
- **Symptom:** `.where('uid'==).limit(20000)` with no `orderBy` returns an arbitrary subset for a >20k-event learner → wrong weekly buckets/velocity, no indication.
- **Fix:** `90ea32071` — added `.orderBy('at','desc')` (truncates oldest, not arbitrary) + composite index + `truncated` flag. **Verified:** Chris.

### BUG-001 — Withdrawal didn't purge Sextant data (right-to-withdraw hole)  ·  P1  ·  resolved
- **Found:** 2026-07-21 · by Nancy · in Sextant Stage 1
- **Area:** `functions/index.js` `withdrawFromObservatory`
- **Symptom:** the new Sextant stores (Plane A/B) weren't known to the withdrawal path → a withdrawn learner's tokenized cohort data survived forever, admin-reversible with the pepper.
- **Fix:** `8283e22d9` → design-D pivot removed Plane A entirely (self-view derived live from activity, which withdrawal already deletes) + `purgeLearner` deletes Plane B by token. **Verified:** Chris + self. **Related:** BUG-003, BUG-005.

---

*Started 2026-07-21, seeded from the Sextant marathon QC catches. Log every human-found bug here as it's found.*
