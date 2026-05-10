# HEUR-024 False-Positive Exclusion + 3 Real Bugs (2026-05-09)

**Validator:** HEUR-024 (`_tools/eduscan/validators/syntax/heuristics.js:2407`) — "Page loads ModuleProgress.js but has no <a href="...index.html"> — completion overlay 'Course Home' button will be missing."

**Pre-fix state:** 75 findings, 72 of them in `_app/operator/missions/*.mission.html`.
**Fix:** Validator scope adjustment — added FP guard for OperatorEngine-loading files (since the engine renders the home anchor at runtime). Smoke-tested local + Nancy-cleared.
**Post-fix state (expected after next nexus pass):** 3 findings, all real bugs.

## Why operator missions were false positives

Mission HTML files are minimal shells like `_app/operator/missions/recon-01.mission.html`:
```html
<script src="../engine/OperatorEngine.js"></script>
...
<div id="operator-root"></div>
<script>OperatorEngine.init(RECON_01_CONFIG);</script>
```

The engine renders the back link at runtime (`_app/operator/engine/OperatorEngine.js:1015`):
```js
backLink.href = '../index.html';
```

Plus `_app/operator/engine/OperatorEngine.js:1131` renders an additional in-page anchor:
```js
'<a href="../index.html" class="mc-btn">RETURN TO OPERATOR</a>'
```

ModuleProgress's `detectNavLinks()` (`_app/components/ModuleProgress.js:876-908`) queries `document.querySelectorAll('a[href]')` AT COMPLETION TIME — well after engine init has injected anchors. So the overlay's "Course Home" button DOES render correctly.

The validator only sees static HTML, can't see runtime DOM, hence the 72 FPs.

**Coverage signal strength:** 127 mission HTML files load `OperatorEngine.js`; ZERO non-mission files do. The `<script src="OperatorEngine.js">` matcher is a clean exclusion.

## The 3 remaining findings ARE real bugs

These three pages call `ModuleProgress.complete()` but their static HTML lacks `<a href>` anchors that resolve to `index.html`. They use either `returnUrl` option (NOT consumed by `detectNavLinks`) or `window.location.href` JS redirects (invisible to the overlay).

### Bug 1 — `_app/houses/code/python-for-it/labs/pfi-w4-gui-inclass.lab.html:316`

```js
ModuleProgress.complete('code', 'pfi-w4-gui-inclass', { returnUrl: '../index.html' });
```

**Why it's a bug:** `returnUrl` only triggers Arctic-path navigation (verified at `ModuleProgress.js:601-635`). It does NOT feed `detectNavLinks()`. The completion overlay's "Course Home" button is absent.

**Recommended fix:** Add a static `<a href="../index.html">Course Home</a>` link in the lab page footer (e.g., a `.nav-footer a.nav-btn`).

### Bug 2 — `_app/dark-arts/vault/owasp-top10-lab.html:3088`

```js
window.location.href = '../index.html';
```

Plus `ModuleProgress.complete('dark-arts', 'owasp-top10-lab')` at line 3068.

**Why it's a bug:** `window.location.href` is a JS redirect, not a static anchor. `detectNavLinks` queries DOM anchors only.

**Recommended fix:** Add a static breadcrumb or footer link with `href="../index.html"`.

### Bug 3 — `_app/dark-arts/vault/privilege-escalation-lab.html:2250`

```js
ModuleProgress.complete('dark-arts', 'dark-arts-privilege-escalation-lab', {
    returnUrl: '../index.html'
});
```

Same `returnUrl` pattern as Bug 1.

**Recommended fix:** Same — add static anchor.

## Why not just feed `returnUrl` into `detectNavLinks`?

That would be a deeper architectural change to ModuleProgress.js (adding option-driven completion-overlay nav). Out of scope for this session — flagged as design-discussion candidate.

## Validator fix details

```diff
+ // 3. Operator missions render the home anchor at runtime via
+ //    OperatorEngine (`backLink.href = '../index.html'` at
+ //    `_app/operator/engine/OperatorEngine.js:1015`). The static HTML
+ //    has no anchor, but the runtime DOM does — and detectNavLinks()
+ //    in ModuleProgress runs after engine init, so the overlay's
+ //    Course Home button DOES appear. 127 mission files load
+ //    OperatorEngine.js; zero non-mission files do, so this is a
+ //    clean signal.
+ if (/<script\s+[^>]*src="[^"]*OperatorEngine\.js"/i.test(content)) return issues;
```

## Smoke test (run before commit)

```bash
node -e "
const heuristics = require('./_tools/eduscan/validators/syntax/heuristics.js');
const validator = new heuristics();
const fs = require('fs');
const cases = [
    { path: '_app/operator/missions/recon-01.mission.html',                                  expect: 'CLEAN' },
    { path: '_app/operator/missions/python-38.mission.html',                                expect: 'CLEAN' },
    { path: '_app/operator/missions/crypto-02.mission.html',                                expect: 'CLEAN' },
    { path: '_app/houses/code/python-for-it/labs/pfi-w4-gui-inclass.lab.html',              expect: 'FIRE'  },
    { path: '_app/dark-arts/vault/owasp-top10-lab.html',                                    expect: 'FIRE'  },
    { path: '_app/dark-arts/vault/privilege-escalation-lab.html',                           expect: 'FIRE'  },
];
cases.forEach(c => {
    const issues = validator.checkMissingCourseHomeLink({ path: c.path, content: fs.readFileSync(c.path, 'utf8') });
    const got = issues.length ? 'FIRE' : 'CLEAN';
    console.log((got === c.expect ? 'PASS  ' : 'FAIL  ') + got.padEnd(6) + c.path);
});
"
```

Expected: 6 PASS, 0 FAIL. Verified locally.

## Other engines surveyed (Nancy concern)

- `_app/arena/engine/BoxEngine.js`: no `index.html` rendering. Safe.
- `_app/arena/engine/BriefingPage.js`: no `index.html` rendering. Safe.
- `_app/components/HouseRenderer.js`: renders ABSOLUTE `/arena/index.html` and similar paths. These DO match `detectNavLinks` (which uses `endsWith('/index.html')`), so house-rendered pages pass HEUR-024 anyway. No change needed.

Only OperatorEngine renders relative `../index.html` for completion-overlay-relevant flows. Single-engine exclusion is correct.

## Outcome

- Validator scope adjustment: silences 72 FPs without weakening the rule's purpose.
- Three real bugs surface clean: pfi-w4-gui-inclass, owasp-top10-lab, privilege-escalation-lab. Operator can address each as a small per-file edit.
- Validator regression prevention: smoke test added to this doc; can be promoted to a unit test if HEUR-024's exclusion logic ever evolves.
