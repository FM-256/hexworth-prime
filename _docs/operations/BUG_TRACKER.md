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

### BUG-016 — bm-* hardware course: one answer-position template across all 8 quizzes, no render shuffle  ·  P2  ·  open
- **Found:** 2026-07-23 · by self (QUIZ-DUP cluster QC, primary-agent derivation after Karl declined) · marathon session
- **Area:** `_app/houses/forge/hardware-support/quizzes/bm-*.quiz.html` (8 files, CTS1150C "Bare Metal"); keys in `functions/quiz_keys.json` + Firestore
- **Symptom:** all 8 quizzes share the exact correct-answer position template `[3,2,2,1,2,2,1,1,1,0,0,0,0,3,3]` AND render options in authored order (hand-rolled pages, zero shuffle — verified `Math.random` count 0 in all 8). A student who notes week-1's letter pattern (D,C,C,B,C,C,B,B,B,A,A,A,A,D,D) can ace the remaining 7 without knowledge. Grading itself is CORRECT (120/120 explanation-derived, audit `~/hexworth-shared/Solutions/_audit/qc-quizdup-cluster6-2026-07-23.md`).
- **Root cause:** authoring template reused per week; page pattern predates QuizEngine QC-8 enforced shuffle.
- **Fix:** pending operator auth — either per-quiz option reorder + matched `quiz_keys` reseed (fl-final precedent, needs Firestore write), or add permutation-shuffle to the page pattern (pis-w* `permShuffleQuiz` precedent, hosting deploy only). Lesser cues, same standard: `cb-w4-troubleshoot-quiz` renders 14/15 correct answers at position B (no shuffle); `md101-m08` correct option is consistently the longest.
- **Related:** feedback_assessment_testing_standard; contrast fw-w*/pis-w* (same template but shuffled at render — no exposure).

### BUG-015 — 7bc9a158b apostrophe-mangling extends beyond CSE: cloud-ch09-database Q5 options corrupted  ·  P1  ·  open
- **Found:** 2026-07-23 · by QC agent (QUIZ-DUP cluster-3 derivation) + corpus signature sweep · marathon session
- **Area:** `_app/houses/cloud/quizzes/cloud-ch09-database.quiz.html:117-124` (Q5, Aurora)
- **Symptom:** Q5 renders 5 mangled options (`'It'`, `','`, `'t support SQL queries'`, ...) — the CORRECT option ("It provides up to 5x better performance through cloud-native architecture") is absent from the page. WORSE than display-only (Nancy): QuizEngine submits via `_originalOptions.indexOf(selectedText)`, and the corrupted array has DUPLICATE `'It'` strings at positions 1 and 4, so clicks on either resolve to index 1 — a silent mis-grader, not just a rendering glitch. 0 recorded attempts on `ch09-database` (independently confirmed by live read-only Firestore count 2026-07-23), so no student harm occurred.
- **Repro:** open the quiz, view Q5 options.
- **Root cause:** same apostrophe-eating restore-era regex as BUG-014's 4 CSE corruptions (one-shot commit family 7bc9a158b — not a recurring pipeline; no tool in `_tools/` re-runs that transform). Original intact at `git show be39cb329`. Note: an UNcorrupted, unserved mirror also exists at `_output/migrated-quizzes/cloud/quizzes/cloud-ch09-database.quiz.html` (`_output/` is not in `firebase.json` public root; do not "fix" it, and no migration script syncs it back).
- **Fix:** Q5's 4 original options restored verbatim in current (server-graded) format — Nancy PROCEED; post-edit whole-file check: brackets balanced, 10 questions × 4 options, 0 fragments. Key value 1 already correct, no reseed needed. **Scope-check RESULT (Tier-5 item from BUG-014):** corpus fragment-detector over all `_app` options arrays => exactly 3 affected files: `cloud-cse-module02.quiz.html` (3 fragments), `cloud-cse-module03.quiz.html` (3), this file (4). No corruption elsewhere; EHE lab hits were ASCII-banner false positives.
- **Related:** BUG-014 (CSE fixes awaiting operator tier approvals).

### BUG-014 — `'cse'` LearningPath (EC-Council Cloud Security Engineer) fully defined but dark — expose-or-remove decision  ·  P3  ·  open
- **Found:** 2026-07-22 · by Nancy · during BUG-013 review (CLF-C02 course-build session); split out of BUG-013 at its resolution 2026-07-23 so the decision doesn't get buried in Resolved
- **Area:** `_app/components/LearningPaths.js:3139` `'cse'` path definition; absent from `_app/houses/cloud/index.html`'s `paths` array
- **Symptom:** the `'cse'` LearningPath is fully defined with its own `courseHref`/`PATH_HOUSE_MAP` entry but is NOT exposed anywhere in live nav — a half-built cert path sitting dark in the same file. Not student-visible today, but it's unmaintained shadow content that drifts: its `cse-01-fundamentals`/`cse-02-iam` ids collided verbatim with the `azure-fundamentals` path until BUG-013's fix removed the duplicates (cross-path completion-state bleed via `path-view.html`'s flat Set).
- **Fix:** pending operator decision — expose (finish the path, add to `cloud/index.html` paths) or remove. Candidate for a Cloud QC pass.
- **Related:** BUG-013 (origin, now Resolved).

### BUG-012 — Dead internal links across _app (59 broken .html hrefs/redirects)  ·  P2  ·  in-progress (9 path-fixes shipping; clusters need decisions)
- **Found:** 2026-07-22 · by self (full-site dead-link scan) · in "continue easy work" session
- **Area:** 24 files link/redirect to local `.html` targets that don't resolve on disk (scan: 5,181 files / 13,854 local .html links → 59 dead instances)
- **Symptom:** students hit 404s on lab-completion redirects and hub navigation.
- **Triage / buckets:**
  - **(A) FIXABLE-NOW path-depth bugs (9, evidence-proven, shipping this session):** 4 forge labs JS redirect `'../../dashboard.html'`→`'../../../dashboard.html'` (root dashboard exists; proven by same-file `<a>` back-btn) — `forge-admin-tools`/`-control-panel`/`-system-tools`/`-windows-settings`.lab.html; and 5 key/script completion redirects `'../../index.html'`→`'../index.html'` (house hub exists; script-clh-031 has same-file proof, 4 key pages match the 31-sibling canonical) — `key-attack.lab`, `key-cryptanalysis/-derivation/-post-quantum.presentation`, `script-clh-031.lab`.
  - **(B+C) RESOLVED via COMING-SOON GATE (operator "get it done" 2026-07-22).** Both are incomplete content builds, NOT navigation bugs: **(B)** `houses/forge/intro-computers/index.html` = Keiser **CGS1000C "First Boot"** (Intro to Computers, 4-week), a course whose index build crashed mid-way (`63179a5bb`); 3 of 26 pieces built, 23 unbuilt (wk1 labs/quizzes + wk2-4). **(C)** `houses/shield/isc2-cc/index.html` = ISC2-CC cert hub, **~81% built (47/58)**, 11 unbuilt `pis-01..20` modules (the served `pis-r1..r5` are a *different* review series, NOT a remap).
    - **THE GATE — what/where/how:** a self-contained `<style>`+`<script>` block appended before `</body>` in EACH of the two hub files. On load it reads a hardcoded `COMING_SOON` array of not-yet-built hrefs, and for each matching `a.content-card[href=…]`: adds class `is-coming-soon` (dims to 0.5 opacity), appends a monospace **"Coming soon"** `.cs-badge`, and intercepts the click (`preventDefault` + `alert('This module is coming soon.')`) so a student never hits a 404. Built cards are untouched and navigate normally. Purely additive — no existing markup changed; forge hub's week-lock still hides wk2-4 independently.
    - **TO UN-GATE (as each module ships):** delete that module's href string from the `COMING_SOON` array in the hub file — nothing else. When a full course/hub is completed, remove the whole gate block.
    - **Verified:** `_tools/eduscan/smoke/coming-soon-gate-verify.js` (headless, stubs auth/Firebase) — isc2-cc 11 gated+badged, intro-computers 23 gated+badged, built sample card still navigates, gated click blocked, 0 page errors; screenshot QC'd (CGS1000C: built presentations live, unbuilt labs/quizzes show COMING SOON).
    - **The actual content-build (23 CGS1000C pieces + 11 PIS modules) remains real work** for the course-build pipeline / [[project_cert_hub_wip]] — the gate is the honest, reversible interim, not a substitute for building.
    - **MAINTENANCE / drift risk (Nancy flag):** `COMING_SOON` is a manual array with NO enforcement — if a module ships and its href is NOT removed, a *built* module gets permanently mislabeled "Coming soon" with a blocking alert (worse than a 404, looks deliberate). This repo has a documented history of exactly this manual-list drift. FOLLOW-UP (not blocking deploy): wire `_tools/eduscan/smoke/coming-soon-gate-verify.js` — or a simpler "every COMING_SOON href must NOT exist on disk, every non-gated content-card href MUST exist" check — into a recurring/CI gate so shipping a module without un-gating it fails loudly. Also: the gate protects only these two hub PAGES' own cards, not bookmarked/shared direct links or other pages linking the same 34 unbuilt hrefs; and isc2-cc carries a coupling note (ContentDiscovery.js would bypass the gate if ContentCatalog.js is ever added there).
  - **(A2) DEPLOYED live 2026-07-22 (`b8c5ff566`):** `matrix/protocore/index.html` linked `sg-103-t-display-s3-setup.html` + `sg-105-wifi-recon-scanner.html` (both 404); Signal files were renamed → corrected to `sg-103-s3-setup.html` + `sg-105-wifi-recon-s3.html` (canonical per `signal/SignalData.js:1868,1870`; href-only, labels untouched). Nancy PROCEED + Chris PASS; live-verified (fixed present, 0 broken). All 9 protocore signal links now resolve.
  - **(D) Scattered singles — RESOLVED 2026-07-22 (operator "gate the bucket-D singles too"):** 8 files fixed so no student hits a 404.
    - **5 SCAN FALSE POSITIVES dismissed** (scanner matched hrefs inside `<code>`/`//`-comments/JS-strings, not clickable links): `admin/console.html`→`...index.html` (doc-table example text); both `page-2.html` hits (`darkarts-web-scraping`/`script-web-crawler` — web-scraping teaching content/log samples); `code-git-basics.presentation`→`git-quiz.html` (inside a `// In production, this would navigate to…` comment); `arena/tournament-board.html`→`'/arena/boxes/'+ch.boxId+'/index.html'` (JS template literal).
    - **3 JS-navigation fixes:** `script-python-exam-chapter8.exam.html` `closeModal()` was navigating to the missing `python-course.html` → now hides the completion modal in place (real fix; modal already has working Return/Review links). `key-encryption-basics.presentation.html` `startQuiz()` → coming-soon `alert()` (encryption-quiz unbuilt). `python-engineering/index.html` course-complete "View Certificate" button set a dead `code-pye-certificate.module.html` href → now `removeAttribute('href')` + coming-soon `onclick` (in-progress branches untouched, still link real modules).
    - **1 REMAP (Nancy caught a misclassification — was NOT unbuilt):** `divergent/ethics-it/eth-r3.html` "ETH-01: Overview of Ethics" nav link pointed at bare `eth-01.html` (404), but the real module is LIVE at `presentations/eth-01-overview.presentation.html` (matching title). Fixed as an href remap, NOT gated — an earlier coming-soon gate on this file was reverted since gating would have hidden live content from students.
    - **4 anchor coming-soon gates** (appended `<script>` IIFE, per-file `COMING_SOON` list, `aria-disabled` + click-intercept notice, generic `a[href=X]`): `code/incubator`→`games/pod-crossing.html`; `pfi-w4-gui-classroom` + `pfi-w4-gui.presentation`→`../quizzes/pfi-w4-gui.quiz.html`; `projects/divergent-field-terminal`→3 `divergent/districts/{embedded,wireless,networking}/index.html`.
    - **Verified:** all gated/redirect targets confirmed non-existent on disk (eth-r3's remap target confirmed to EXIST); headless check on divergent-field-terminal (6 anchors gated, click blocked) PASS; diff 105 ins / 4 del across the 8 files. Nancy PROCEED (caught the eth-r3 remap misclassification + a `continueBtn.onclick=null` cert-button hardening, both applied), Chris PASS. **DEPLOYED live 2026-07-22** (`851999d5d`); all 8 live-verified (eth-r3 remap target HTTP 200, closeModal hides modal, 4 gates + JS notices present). Post-verify flagged a transient smoke FAIL on an unrelated PIS lab — re-ran smoke twice, 10/10 PASS, confirmed transient. **Un-gate:** delete the href from that file's `COMING_SOON` (or restore the JS redirect) once the content ships. **Scan caveat:** future dead-link scans should skip hrefs inside `<code>`/`<pre>`/`//` comments/JS strings.
  - **(E) Nancy-flagged during bucket-A review (log, not fixed):** (1) `houses/script/courses/clh/modules/clh-031/script-lab.lab.html` has `location.href='../../index.html'` at 4-deep → resolves to `houses/script/courses/index.html` (also missing; likely a stale duplicate of script-clh-031 — different depth delta than bucket A, so NOT swept in). (2) `houses/script/clh/script-clh-031.lab.html` lines 1022/1380 have malformed `onclick="location.href="../index.html""` (nested unescaped double-quotes truncate the attribute) — pre-existing, unrelated to the redirect fix, left untouched to avoid scope creep.
- **Fix:** bucket A (9 files) **DEPLOYED live 2026-07-22** (`a7659b336`, Nancy PROCEED + Chris PASS, post-verify 5/5 green); each redirect verified to resolve to a real page (root `dashboard.html` / house `index.html`), live-spot-checked (fixed strings present, 0 broken); the 2 deeper script applets that *correctly* use `../../index.html` were confirmed untouched. Buckets B/C/D/E await operator decisions (build vs coming-soon-gate vs trim vs remap vs dedup).
- **Related:** same class as #157 (dark-arts vault dead CTA, resolved). Scan is reproducible.

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
- **DONE 2026-07-22 (item 22 — dead CSS removed):** removed 18 provably-dead CSS classes + orphan `@keyframes pulse` from cloud-iam-debugger (`.json-key/-string/-number/-boolean/-bracket`, `.problem-highlight`, `.fix-options/-option(+.selected/.correct/.incorrect/:hover)/-label/-code`, `.diff-add/-remove`, `.pulse`, `.timer-bar/-fill` — leftovers from removed features). 5 regions, 131 deletions / 0 insertions (removal-only). Verified: grep sweep 0 remaining refs (no orphan comments), CSS braces balanced (63/63), live `@keyframes iamStatPulse`/`slideIn` untouched, and the game's own harness `_tools/arcade-fixes/iam-debugger-check.js` PASSES (all 10 rounds grade, game completable, XP once, 0 console errors) — which also re-confirms item 24's Round-8 null-check end-to-end. Nancy PROCEED (confirmed zero dynamic class construction anywhere + zero external consumers), Chris PASS (independently reproduced every check). **DEPLOYED live 2026-07-22** (`8315db0ae`); post-verify 5/5 green; live-verified 0 dead refs remain, live `@keyframes iamStatPulse`/`slideIn` intact, HTTP 200. (Nancy noted a SEPARATE out-of-scope smell: duplicate `.back-link` blocks where the 2nd `:hover` color shadows the 1st — not fixed here; could be a future micro-cleanup.)
- **BACKLOG CLOSED 2026-07-22:** the div-tag-mismatch finding (`html-div-mismatch-finding-2026-05-09.md`, orig. 27 files) is now fully resolved — a fresh `<div>`-balance scan of all 5,181 `_app` HTML files run through the real EduScan validator shows **0 real HTML-011/012 remaining** (the 5 raw-count imbalances left are JS-template/string artifacts, validator-CLEAN). The 6 cyberops files above were the last real ones.
- STILL OPEN: forge-troubleshooting-scenarios pill objective numbers vs corrected headers (item 1 — needs official CompTIA A+ objectives as ground truth; header/pill numbers are genuinely wrong, not just inconsistent) · Game Forge `mapJeopardy` drops `accepts` on re-run (item 27 — not in hosting tree, `_tools` concern) · LinuxTerminal root home `/home/root` vs `/root`, no grading impact (item 13) · LinuxTerminal `_cp` partial-copy + `_mv`/`_cp` leading-flag strip, bash-borderline, zero live exposure (items 37,38).

---

## Resolved

### BUG-013 — `azure-fundamentals` LearningPath renders a stale legacy curriculum (twin of the aws-ccp bug)  ·  P3  ·  resolved (deployed 2026-07-23 `d57a4f243`; live-verified)
- **Found:** 2026-07-22 · by Nancy · during CLF-C02 course-build review
- **Area:** `_app/components/LearningPaths.js` `'azure-fundamentals'` path `.modules` array + `_app/houses/cloud/index.html:113` paths-card (no explicit `href`)
- **Symptom:** the `azure-fundamentals` path's `modules` array is still the old scattered `cloud-concepts`/`cloud-models`/`cloud-ch0X-*.tool` list, NOT the real `az900-ch0X-*` chapter modules. Its cloud-hub paths-card has no `href`, so it falls through to `path-view.html?...azure-fundamentals` and renders that stale checklist — a disconnected curriculum under the "Azure Fundamentals" name, parallel to the real AZ-900 course (`az-900/index.html`).
- **Root cause:** same as the aws-ccp bug fixed during the CLF-C02 build (2026-07-22) — the LearningPath `.modules` arrays predate the dedicated `az-900/` course dir and were never repointed. AZ-900 predates the CLF-C02 work so it was left out of scope.
- **Fix (applied 2026-07-23):** mirrored the aws-ccp fix — replaced `azure-fundamentals.modules` (14 stale modules) with the 9 real `az900-ch0{1,2,3}-{pres,lab,quiz}` modules (hrefs into `houses/cloud/az-900/...`), prerequisite-chained, Ch03 title "Management and Governance" matching the hub verbatim. `courseHref` was already correct. ONE file changed (`LearningPaths.js`). No `cloud/index.html` change needed: the paths-card renders correctly through `path-view.html` once the modules array is real (same as aws-ccp), and a separate direct AZ-900 course card already exists (`cloud/index.html:178`). Nancy PROCEED, Chris PASS.
- **Verified:** 2026-07-23 · shipped in the 01:11 `./deploy.sh` run (evidence: Firebase hosting cache + Nexus post-verify `findings.json` both written 01:11; Chris-gate record `_tools/deploy/.chris-pass` = HEAD `f4f2dead5`, verdict PASS). Production `LearningPaths.js` curl-confirmed to contain all 9 `az900-ch0{1,2,3}-{pres,lab,quiz}` module ids; independently re-confirmed by Nancy during the tracker-update review.
- **Side benefit (Nancy):** also resolves a pre-existing cross-path id collision — `cse-01-fundamentals` and `cse-02-iam` existed verbatim in BOTH this path and the separate `'cse'` LearningPath (`LearningPaths.js:3139`); `path-view.html`'s flat completion Set bled state between them. Removing them here ends that bleed.
- **FOLLOW-UP:** the `'cse'` dark-path expose-or-remove decision was split out as **BUG-014** (open) at resolution time. Also: `_app/houses/azure-fundamentals/index.html` (orphaned from live nav, only referenced by an archived router) reads this same array via `CertPathRenderer` and incidentally benefits from the fix.
- **Related:** the aws-ccp equivalent was fixed in the CLF-C02 build (`b7440b426`). BUG-014. Cloud QC campaign [[project]] candidate.

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
