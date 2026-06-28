# Shield Lab Gold Standard

**TLDR** — A Hexworth "lab" must be a **real interactive engine** the student configures/operates and the lab **evaluates** — never a quiz of radio buttons, checkboxes, or a "Mark Complete" button. It must be **full-bleed**, **framework-accurate**, **engaging**, and **score-gated on real logic**. Reference implementation: `_app/houses/shield/labs/shield-access-control.lab.html` ("Access Control Architect"). Verify any lab against this standard with `node _tools/labkit/lab-qc.mjs <config>` and the Chris gate before shipping.

This standard exists because the 11 original `_app/houses/shield/labs/*.lab.html` were quiz-shaped worksheets (MCQ + self-attestation, narrow centered columns) — see [[feedback_labs_must_be_legit_engines]] and [[feedback_never_narrow_centered_layout]]. Access Control was rebuilt as the gold standard; the other 10 are being rebuilt to this bar. Project: [[project_shield_labs_gold_standard]].

---

## 1. Definition of Done (the bar)

A lab is done only when **every** row is true. The QC harness (§4) checks the mechanizable ones; Chris (§5) checks the rest.

| # | Requirement | Checked by |
|---|-------------|-----------|
| 1 | **Real engine, not a quiz** — student configures/operates a system; the lab runs real logic to decide outcomes. No MCQ-scored-against-a-key, no "Mark Complete". | Chris + harness (engine test) |
| 2 | **Discriminating** — only a genuinely-correct solution passes; a lazy/naive attempt scores low; every required element is load-bearing. | harness (engine test) |
| 3 | **Score-gated completion** — `ProgressManager.completeModule(moduleId, house, type)` fires only on a real pass; a wrong attempt never certifies. | harness |
| 4 | **Framework-accurate content** — claims cite real standards, verified (not guessed). | Chris (+ web-verify) |
| 5 | **Full-bleed** — multi-panel/dashboard spanning the viewport; never a narrow centered column. | harness (width ratio) |
| 6 | **Zero console errors**, no horizontal overflow at desktop + reflow widths. | harness |
| 7 | **No emoji** (webp icons only), **no `position:fixed`** (HEUR-008), **no `loading="lazy"`** ([[feedback_no_lazy_load]]). | harness |
| 8 | **Recognizable back navigation** (NAV-001) to the parent hub. | harness |
| 9 | **Integration preserved** — AccessGuard, ModuleProgress/ProgressSystem/AchievementManager loads, Dr. Hex button, real moduleId. | §3 |
| 10 | **Chris PASS** on purpose + bar + evidence. | Chris |

---

## 2. The engine pattern

Pick the shape that fits the topic; all three are "real engine" (the student's input drives real logic that the lab evaluates against ground truth):

- **Configure-and-evaluate** — student builds a policy/config; a real decision engine runs inputs against it. *(Access Control: build RBAC+ABAC, a `decide(request, policy)` PDP scores 17 requests.)*
- **Operate-and-verify** — student performs real operations; the lab verifies the resulting state. *(e.g. cryptography: actually hash/sign/verify with Web Crypto; detect tampering.)*
- **Investigate-and-attribute** — student examines real evidence and classifies/attributes; the lab checks against the truth. *(e.g. threats: IOC/TTP → MITRE ATT&CK attribution.)*

**Design rule — every graded item must discriminate one concept.** Build the test set so the *correct* configuration passes all items and each required element, if wrong/missing, fails at least one item. That is what makes "you can't guess your way through" true and measurable (harness check #2).

The banned anti-pattern: a scenario paragraph → read-only bullets → a radio-button question → a button that marks itself complete. If a student can finish without the system doing anything real, it is a worksheet, not a lab.

---

## 3. Integration contract (preserve when rebuilding in place)

Rebuild at the **same path** so the manifest + `ContentCatalog.js` entries stay valid (no wiring changes). Keep:

```html
<script src="../../../components/AccessGuard.js"></script>
<script>AccessGuard.require('sorted');</script>
<script src="../../../components/AchievementManager.js"></script>
<script src="../../../components/ModuleProgress.js"></script>
...
<script src="../../../components/ProgressSystem.js"></script>   <!-- loads ProgressManager -->
<hex-ai-button mission-id="<mission-id>" house="shield"></hex-ai-button>
<script type="module" src="/_lib/HexAIButton.js"></script>
```

- **Completion call:** `ProgressManager.completeModule('<moduleId>', 'shield', 'lab')` — **moduleId is the first arg** (`_app/components/ProgressManager.js:476` → `completeModule(moduleId, houseId, moduleType)`). The `<moduleId>` is the lab's **manifest `id`** (e.g. `shield-access-lab`), *not* the topic slug. Wrap in `try/catch` + `typeof ProgressManager !== 'undefined'`.
- **Icons:** real webp from `_app/assets/images/icons/` (166 available). No emoji, no inline SVG-as-icon.
- **Back link:** use `class="back-link"` (hyphenated) so EduScan NAV-001 recognizes it.

---

## 4. QC parameters — the harness

`_tools/labkit/lab-qc.mjs` mechanizes the definition of done for self-contained single-file labs (scope: inline-logic labs, **not** BoxEngine `config.js` arena boxes).

```bash
node _tools/labkit/lab-qc.mjs _tools/labkit/configs/<lab>.qc.mjs   # one lab
node _tools/labkit/lab-qc.mjs --all                                # every config
# exit 0 = PASS, 1 = FAIL
```

It stubs the platform chrome (AccessGuard/Firebase/Dr.Hex), serves `_app` over request interception, and runs:

| Check | What it proves |
|-------|----------------|
| NAV-001 / HEUR-008 / No-emoji | EduScan-clean (mirrors the real `emoji.js` codepoint set + `navigation.js` patterns) |
| Engine correctness + discrimination | the lab-specific `engineTest()`: key solution scores 100%, lazy scores low, every element load-bearing |
| Zero console errors | nothing throws on load |
| No horizontal overflow @ 1440 + 1100 | layout holds at desktop + reflow |
| Full-bleed (content spans viewport) | widest top-level block ≥ 70% of viewport (catches narrow centered columns; ignores inner readability widths) |
| Correct solution certifies + completion fires | the real pass path works, with the right moduleId |
| Wrong solution rejected | no false pass (the QC-54 / discrimination trap) |

**Writing a per-lab config** (`_tools/labkit/configs/<lab>.qc.mjs`) — copy `shield-access-control.qc.mjs` and fill:

```js
export default {
  lab:           'houses/shield/labs/<file>.lab.html',  // path under _app/
  moduleId:      'shield-...-lab',                       // expected completeModule id
  engineTest:    () => ({ ok, detail }),  // node-side: extract the engine, prove key=100% / lazy low / each element load-bearing
  solve:         () => { /* page-context: drive the lab to a PASS state */ },
  wrong:         () => { /* page-context: drive to a NON-passing state */ },
  certifiedWhen: () => /* page-context: boolean — lab shows certification */,
  solveWaitMs?:  11000,   // if the pass path animates/awaits
};
```

`_tools/` is gitignored — `git add -f _tools/labkit/...` to track.

---

## 5. Gate flow (before shipping)

1. **Harness green** — `node _tools/labkit/lab-qc.mjs <config>` exits 0.
2. **Chris gate** (mandatory, [[reference_chris_qc_gate]]) — dispatch the `chris` agent with the file, screenshots, purpose, bar, and evidence. He defaults to BLOCK; he catches content/framework/pedagogy errors the harness can't (e.g. mislabeled static-vs-dynamic SoD, a fabricated citation). **Web-verify every standard/citation** — do not assert a designation from memory.
3. *(Marathon only)* consult Nancy + document, per [[feedback_never_decide_solo]].
4. **Commit first**, then `_tools/deploy/record-chris-pass.sh "<scope>"` (keyed to HEAD), then `./deploy.sh`.
5. Post-verify `FLAGGED divergence (deploy SHIPPED)` is the known pre-existing 94-HIGH backlog (QC-57 client-graded quizzes), not your lab — confirm HIGH count is unchanged and the smoke gate passed 10/10. `BLOB-004` (inline script > 200 lines) is LOW + acceptable for single-file labs.

---

## 6. Worked example

`_app/houses/shield/labs/shield-access-control.lab.html` — "Access Control Architect": build a least-privilege RBAC matrix (7 roles × 9 perms) → add a dynamic-SoD constraint + 5 ABAC rules and reject 1 trap rule → a real `decide(request, policy)` PDP stress-tests 17 crafted requests, score-gated to certify only at 17/17. Frameworks: ANSI/INCITS 359 (RBAC), NIST SP 800-162 (ABAC), Bell-LaPadula (MAC), least privilege, static-vs-dynamic SoD, HIPAA minimum-necessary. SY0-701 4.6. Config: `_tools/labkit/configs/shield-access-control.qc.mjs`.

**Remaining shield worksheets to rebuild to this bar:** threats, cryptography, hash, hashing, network-security, ir-forensics, compliance, security-fundamentals, gpg-encryption, osint-google-dorking.
