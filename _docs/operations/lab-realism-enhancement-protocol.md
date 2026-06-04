# Lab Realism Enhancement Protocol (LREP)

**Status:** Established 2026-06-04 · Canonical example: PIS-Final Patient Zero (Eclipse)
**Owner:** Hexworth Prime · operations · `_docs/operations/`
**Related rules:** `_docs/operations/dr-hex-production-stability.md`, `_tools/eduscan/smoke/`, `CLAUDE.md` Rule 10 (production write gate)

---

## TLDR

When a lab's browser surfaces look generic ("standard CTF page"), students do not recognize the security tooling they will encounter in industry. The Lab Realism Enhancement Protocol (LREP) systematically maps each simulated tool to its real-world counterpart (VirusTotal, Mandiant, Rapid7, SCCM, NVD, Splunk, etc.) and re-skins the page chrome to mirror that product so recognition transfers from lab to job. The protocol preserves all pedagogy, all smoke contracts, all handler state mutation, and all flag chains while replacing only the visual layer.

This document is the runbook for executing LREP on any lab. It captures the engineering patterns, pitfalls, and verification gates discovered during the canonical Eclipse application (38 routes, 13 tool surfaces, 0 regressions, 73/73 smoke checkpoints pass).

---

## 1. When to invoke LREP

Run this protocol when **all four** conditions hold:

| Condition | Check |
|---|---|
| Lab is functionally complete and smoke-passing | `node _tools/eduscan/smoke/run.js` returns PASS for the lab's targeted check |
| Lab content is stable (no open Karl/Nancy/Bridget blockers) | Confluence solution page audited and current |
| Tool surfaces are visually generic | Page chrome reads as "CTF placeholder" rather than "real product" |
| Operator has authorized realism work | Explicit chat authorization (per CLAUDE.md Rule 10) |

Do **not** invoke LREP on a lab that is still iterating on flag values, content, or handler logic — the realism layer is the **last** polish step before student-facing publication, not a substitute for fixing functional bugs.

---

## 2. Pre-flight inventory

Before touching any code, build a complete map. Commit nothing in this phase.

### 2.1 Enumerate page routes

```
grep -n "^            '/" _app/houses/<house>/<course>/labs/<lab-id>/config.js
```

Output is the full route list. For the Eclipse lab this was 38 routes spanning:

- Mail surface (`/inbox` + 13 `/msg/N`)
- Tools at `*.crimson-intel.net` and `*.crimson-dawn.net` subdomains
- Game-over landings (intentional own aesthetic — see §6 exceptions)
- Legit decoy landings (Slack, Zoom, etc. — own brand)
- Download viewers
- CVE database pages

### 2.2 Locate smoke-gate string contracts

```
grep -n "<lab-id>\|<flag-token>" _tools/eduscan/smoke/test-*-functional.js
```

Every string the smoke test asserts against (`EMBERWOLF`, `RU`, `CVE-2022-30190`, `REMED-OK-S7K9P2`, scan IDs, etc.) **must survive the polish unchanged**. Build a list. Read the list before each Edit.

### 2.3 Locate handler state mutations

```
grep -n "db\._\|_phaseState\|state\.\|engine\.addScore\|engine\.awardFlag" _app/.../config.js | head -30
```

State mutations (`db.patch_state.applied.push(...)`, `db.rapid7_scan_state.scan_id = 'S7K9P2'`, etc.) are **functional contracts**. The smoke test depends on them. The composite-flag gate depends on them. **They survive the polish unchanged.**

### 2.4 Read the walkthrough

Walkthroughs live at `~/hexworth-shared/Solutions/<course>/<lab>-SOLUTION.md`. Find it:

```
find ~/hexworth-shared/Solutions -ipath "*<lab-id>*"
grep -rln "<flag-value>" ~/hexworth-shared/Solutions/
```

The walkthrough is the operator-facing source of truth. Every visual cue the polish adds (button colors, status pills, brand names) will need a corresponding mention in the walkthrough so reviewers know what students see (per `feedback_document_as_you_move.md`).

---

## 3. Brand mapping — choose the real product per tool

For each tool surface, identify the real-world product students will encounter in industry. The mapping is opinionated but defensible:

| Tool kind | Real product | Brand color | Distinctive chrome |
|---|---|---|---|
| Vulnerability database | NIST NVD + CISA KEV | Navy `#003366` | CVSS scoring circle, MITRE ATT&CK chips, Known-Exploited pill, NVD nav (Search/Browse/KEV/Statistics) |
| Hash analysis / sandbox | VirusTotal | White + slate accents | Detection-ratio donut (e.g. "47/68"), engine vendor grid, tab strip (Detection/Behavior/Network IOCs/Family) |
| Threat intel portal | Mandiant Advantage / CrowdStrike Falcon Intel / Recorded Future | Dark navy + red brand accent | Per-actor cards, TTP-match badge, nation flag pill, MITRE chips, disambiguator note |
| IP geolocation | MaxMind GeoIP / IPinfo | Purple `#7c3aed` | Big IP banner with verdict pill, 2-card grid (Geo/ASN), attribution-detail block with confidence pill |
| WHOIS / domain | DomainTools / ICANN whois | Cyan | 2-col raw + parsed sidebar, age badge, verdict pill |
| SIEM | Splunk dark | Slate-900 + accent red | Coverage strip (data freshness), tab pills with count badges, quick-filter chips, anomaly row highlighting, crit/high/info severity pills |
| Patch / endpoint mgmt | Microsoft Endpoint Configuration Manager (SCCM) + WSUS | Microsoft blue `#0078d4` | Host-info strip, compliance-status tiles, CVSS scoring circles, status pills (Required/Deployed), KB-number badges |
| Vulnerability scanner | Rapid7 InsightVM | Rapid7 red `#ff1f1f` | Top nav (Assets/Vulns/Templates/Reports/Policy), asset card with pulsing "Agent Connected" pill, scan-template launcher, risk-score circle |
| Mail filter admin | Proofpoint Email Security / Mimecast | Dark navy | KPI strip (Inbound 24h/Quarantined/Active rules/Mailbox), IOC reference card, match-expression box, REJECTED/ACCEPTED result cards |
| Webmail | Microsoft Outlook on the web (OWA) | Microsoft blue `#0078d4` | Brand bar with user info, left folder sidebar, sender avatars, reply toolbar, monospace "show original" headers panel, EXTERNAL/INTERNAL pill |
| Password reset / IDM | Microsoft Identity Manager / Azure AD self-service | Blue gradient | Password rules checklist, status sidebar (last rotation/expiry), post-rotation success card |
| Compliance / GRC | ServiceNow GRC / OneTrust | Purple `#581c87` | Metadata strip (Form ID/Workflow), regulatory reference chips on each item, GRC trust bar at bottom |
| Download viewer | Microsoft Edge Downloads | Edge styling + Office product colors | Office product glyph (DOC navy / XLS green), file-metadata table, color-coded next-step callout |
| Game-over landing | (intentional own aesthetic — keep) | Glitch red `#ff003c` | Glitched neon, restart button — DO NOT polish |

**Rules for choosing:**

1. Choose the product students will actually encounter at FAANG / NSA / CIA / mid-market enterprise. Skip niche products.
2. Choose the product with the most distinctive chrome — the goal is recognition, not generality.
3. If the lab's narrative names a product explicitly (e.g. "Crimson Dawn uses Rapid7"), match the explicit name.
4. When two products are visually similar (Mandiant + CrowdStrike + Recorded Future), pick the one whose layout differs most from the others in the lab (variety beats consistency for a 13-tool lab).

---

## 4. The wave structure

Break the polish work into **waves** so each wave produces a clean, smoke-passing, deployable increment. The Eclipse lab ran 6 waves over one marathon session:

| Wave | Scope | Commits |
|---|---|---|
| 1 | High-traffic Phase 3–4 tools (`/whois` + `/ipgeo`) | 2 |
| 2 | Phase 4 attribution (`/intel`) | 1 |
| 3 | Phase 6 remediation toolset (`/patch` + `/insightvm` + `/mailadmin` + `/attest`) | 5 (includes one handler-rebuild follow-up) |
| 4 | Mail surface (`/inbox` + all 13 `/msg/N`) — shared `_renderInbox` + `_renderMessage` helpers | 1 large |
| 5 | CVE / NVD pages + download viewers — shared `_renderCveDetail` helper | 2 |
| 6 | Walkthrough sync + Confluence republish | 0 commits to repo (walkthrough lives in `~/hexworth-shared/`) |

**Wave gate:** every wave must pass `node --check` + smoke gate before commit + deploy.

**Wave size:** target one wave per commit. The mail-surface wave was an exception because of the shared-helper architecture (introducing `_renderMessage` and rewiring 13 callers in a separate commit each would have been thrash without the helper in place).

---

## 5. Engineering patterns

### 5.1 Shared CSS class prefix per tool

Every polished tool gets a unique 2–4 character class prefix. The prefix scopes all CSS to that tool's `<style>` block, preventing bleed across tools rendered into the same browser iframe.

| Prefix | Tool |
|---|---|
| `.wh-shell` | WHOIS |
| `.ig-shell` | IP geo |
| `.ti-shell` | Threat intel |
| `.pm-shell` | Patch mgmt |
| `.r7-shell` | Rapid7 InsightVM |
| `.ma-shell` | Mail admin (Proofpoint) |
| `.at-shell` | Attestation (GRC) |
| `.mc-shell` | Mail client (OWA) |
| `.nvd-shell` | NVD / CVE |
| `.dl-shell` | Download viewer |
| `.siem-shell` | SIEM (Splunk) |
| `.vt-shell` | VirusTotal mirror |
| `.pwreset-shell` | AD password reset |

Inside each shell, sub-classes follow the pattern `.<prefix>-<noun>` (e.g. `.r7-asset-card`, `.r7-cvss-circle`, `.r7-result-clean`).

### 5.2 Shared helpers for repeated surfaces

When a tool has many similar pages (13 mail messages, 3 CVE details, multiple result cards), introduce a single `_renderXxx(struct)` helper and convert each page entry to **function-form** `html:`:

```js
// BEFORE — inline html per page entry (480 lines for 13 messages)
'/msg/1': {
    title: 'Message 1',
    html: `<div style="...">...long literal HTML...</div>`
},

// AFTER — function-form delegating to a shared renderer
'/msg/1': {
    title: 'Message 1',
    html: function() { return PISFinalConfig._renderMessage({
        subject: '...',
        fromName: '...',
        // typed struct describing this message
    }); }
},
```

The shared renderer (`_renderMessage`, `_renderCveDetail`, `_renderInbox`) lives near the other `_render*` helpers in config.js and takes a struct describing the page-specific data.

### 5.3 Why function-form `html:` is mandatory for shared helpers

Object-literal evaluation runs **top to bottom before the surrounding object is assigned**. This means:

```js
const PISFinalConfig = {
    webApp: {
        pages: {
            '/cve': {
                // FAILS at parse time — PISFinalConfig is undefined here.
                html: `${PISFinalConfig._nvdShellStyle()}<div>...</div>`
            }
        }
    },
    _nvdShellStyle: function() { return '<style>...</style>'; }
};
```

The template-literal interpolation calls `PISFinalConfig._nvdShellStyle()` while the object is being constructed — but `PISFinalConfig` is `undefined` until the literal finishes evaluating. You get a `ReferenceError` or `TypeError` at module load.

**Fix:** wrap in a function so the lookup is deferred until the page is rendered (after module load completes):

```js
'/cve': {
    html: function() { return PISFinalConfig._nvdShellStyle() +
        '<div class="nvd-shell">...</div>'; }
}
```

This is the same pattern `/patch`, `/insightvm`, `/mailadmin` already use (they reference `PISFinalConfig._renderPatchDashboard()` etc.). The browser engine in `_app/arena/engine/Browser.js` already calls `p.html` when it's a function. No engine changes needed.

### 5.4 Smoke contract preservation

The smoke test (`_tools/eduscan/smoke/test-<lab-id>-functional.js`) asserts on rendered string content. Every assertion is a contract.

Example contracts from the Eclipse smoke:

```js
check('Phase 4: threat intel returns EMBERWOLF profile', /EMBERWOLF/.test(r));
check('Phase 4: IP geo flags VPS-edge != actor-origin (CAUTION note)',
    /CAUTION|edge|jurisdiction|reconcile/i.test(r));
check('Phase 6: composite gate is fully satisfied',
    /REMED-OK-S7K9P2/.test(r));
```

**Before polishing a tool, grep the smoke for the tool's required strings. Preserve them verbatim or with synonyms the regex still accepts.** The Eclipse polish was tight enough that the SIEM rewrite had to specifically preserve the literal phrase `UNEXPLAINED ANOMALY` because the smoke test asserted on it.

If a polish breaks a smoke contract, the fix is to put the literal back into the rendered output — not to relax the smoke check.

### 5.5 Handler state mutation preservation

Form handlers (`_handlePatchAction`, `_handleInsightVMScan`, `_handleMailFilter`, etc.) mutate `db.<phase>_state.*` properties. Those mutations are read by other handlers (the InsightVM scan reads `db.patch_state.applied` to decide CLEAN vs VULNERABLE; the composite flag gate reads all three).

**The polish replaces the HTML the handler returns. It does not touch the state mutations.** When rewriting a handler, keep the mutation logic byte-identical; only change the return-string templating.

Pattern:

```js
// Identify the state mutations FIRST
if (correctOnly) {
    db.rapid7_scan_state.ran = true;          // <-- preserve
    db.rapid7_scan_state.result = 'clean';     // <-- preserve
    db.rapid7_scan_state.scan_id = 'S7K9P2';   // <-- preserve
    return /* new polished HTML using new shell classes */;
}
```

### 5.6 Pedagogy preservation rules

The polish is permitted to **reorganize** teaching content but never to **remove** it. Specifically:

- All "Analysis" / "Note" / "Caveat" blocks must survive in some form. Often they get sharpened by moving from a plain `<div>` to a structured banner with explicit kind (`.mc-analysis-ok` / `.mc-analysis-warn`).
- Multi-step reasoning (e.g. msg/4's six red flags) survives but may move from a `<br>`-separated paragraph to an ordered `<ol>` with bold labels.
- Cross-references between tools survive (the "next step: check /insightvm" hint in /patch) and ideally get upgraded to clickable pivot anchors that `_wireLinks` routes via `navigate()`.
- "Decoy" framing for non-relevant CVEs / messages survives as an explicit incident-relevance note with appropriate visual tone (amber for "real but not exploited", neutral slate for "not applicable").

**The Eclipse polish actually sharpened pedagogy** by adding things like:

- Auto-detection of Reply-To and Message-ID host mismatches (red row + inline note) on every message read pane — students no longer need to compare strings by eye
- An IOC reference card in `/mailadmin` listing the three attacker patterns explicitly, eliminating the "what should I type?" friction Karl had flagged
- MITRE ATT&CK chips on every TTP row in `/intel` so students get the real technique IDs to look up

### 5.7 Apostrophe escaping discipline

JavaScript single-quoted strings cannot contain a literal `'`. Escaping with `\'` works inside the JS source but if you use a JS source file as input to `Edit` or `sed`, you have to consider how many layers of escaping the tooling adds.

Specifically: when an Edit block writes `'doesn\\\\'t'` to the file, sed/regex round-trips can land that on disk as `'doesn\\'t'` — which is four chars `\`, `\`, `'`, `t` — and the parser reads it as end-of-string + `t` identifier → `SyntaxError: Unexpected identifier 't'`.

**Fix command:**

```bash
sed -i "s/\\\\\\\\'s/\\\\'s/g" path/to/config.js          # for \'s patterns
sed -i "s/\\\\\\\\'\\([^s]\\)/\\\\'\\1/g" path/to/config.js   # for \'t / \'r / etc.
node --check path/to/config.js && echo "OK"
```

The Eclipse marathon hit this three times. After every batch Edit that includes apostrophes, run both sed lines + `node --check` before running the smoke gate.

### 5.8 Cross-tool clickable pivots

The browser engine's `_wireLinks` in `_app/arena/engine/Browser.js` intercepts `<a href>` clicks and routes via `navigate()`. Bare hostnames are routed via smart-normalize (subdomain → `/subdomain` lookup).

Use anchor pivots liberally in polished tools:

```js
'<a href="https://patch.crimson-dawn.net">Patch Management</a>'
'<a href="https://insightvm.crimson-dawn.net">Rapid7 InsightVM</a>'
'<a href="https://vt-mirror.crimson-intel.net">vt-mirror.crimson-intel.net</a>'
```

These produce clickable pivots between tools. Students can flow WHOIS → IP geo → Intel → VT → Patch → InsightVM → Mail Admin without re-typing URLs. This is what real analysts do; the lab now teaches it.

---

## 6. Exceptions — pages that do NOT get polished

Some pages have intentional aesthetics that polish would degrade. Leave them alone.

### 6.1 Game-over landings

Phishing-decoy landings (`/verify`, `/exception/4470029`, `/verify-signin`, `/wires/review/*`, `/billing/dispute`) intentionally use glitched neon red + "YOU GOT PHISHED" framing. The deliberate over-styling is the lesson: clicking phish links is a game-ending event with permanent (until restart) consequences. **Polishing these would weaken the gamification signal.**

Detection: these pages already include their own `<style>` with red glitch styling + `data-action="restart-lab"` button. Do not rewrite.

### 6.2 Branded decoy landings

Pages that already mirror a recognizable third-party brand (Zoom join page, Slack channel archive) have their own brand chrome by design — the Zoom page uses Zoom blue + spinner; the Slack page uses purple-on-white channel layout. **These are already polished**, just by a different team / earlier author. Do not re-polish unless the existing brand is wrong or stale.

### 6.3 Empty / no-op confirmation pages

A pure "request accepted, no further action" page (e.g. an unimportant form submit) does not need polish. Use this judgment sparingly — the download viewer pages **did** benefit from polish because they sit on the Phase 2 path students see for sure.

---

## 7. Verification gates

After each wave, run all four:

```bash
# Gate 1 — JS syntax
node --check _app/houses/<house>/<course>/labs/<lab-id>/config.js

# Gate 2 — Smoke (full project smoke + lab-specific functional smoke)
node _tools/eduscan/smoke/run.js
node _tools/eduscan/smoke/test-<lab-id>-functional.js

# Gate 3 — Per-route render audit (every page renders without error)
node -e '
const fs = require("fs");
const raw = fs.readFileSync("_app/houses/.../config.js", "utf8");
fs.writeFileSync("/tmp/audit-stub.js", raw + "\nmodule.exports = PISFinalConfig;");
delete require.cache["/tmp/audit-stub.js"];
const cfg = require("/tmp/audit-stub.js");
const pages = cfg.webApp.pages;
Object.keys(pages).forEach(r => {
    try {
        const p = pages[r];
        const html = typeof p.html === "function" ? p.html({}, { engine: { config: cfg } }) : p.html;
        if (!html || html.length < 100) console.log("THIN [" + html.length + "] " + r);
    } catch (e) { console.log("ERR " + r + " — " + e.message.substring(0, 80)); }
});
'

# Gate 4 — Deploy via ./deploy.sh + production-vs-local byte match
./deploy.sh
diff <(curl -s "https://hexworth.com/houses/.../config.js") _app/houses/.../config.js
```

**Gate failures block the wave.** Do not commit, do not deploy, do not move to the next wave until all four pass.

---

## 8. Walkthrough sync

The walkthrough lives at `~/hexworth-shared/Solutions/<course>/<lab>-SOLUTION.md`. After all code waves ship, sync the walkthrough in three places:

### 8.1 New "Tool Aesthetics" section (one-time)

Insert a new section between "Starting State" and "Phase Reference Card" titled `## 2a. Tool Aesthetics — What Each Console Looks Like`. Include a table mapping every lab URL → real product → brand cues. The Eclipse version is the canonical example.

### 8.2 Per-phase visual cue notes (every phase)

Before each phase's first tool interaction, insert a short paragraph describing what the student sees on the screen. Use the formula:

> The page is **[Product Name]**-styled. Students see [3–5 distinctive chrome cues].

This serves two readers: (a) operators / instructors reviewing the walkthrough know what the rendered output looks like without launching the lab; (b) Karl / Nancy / Bridget agents auditing the walkthrough can flag mismatch between described UI and actual config.js output.

### 8.3 Section 11 "Polish history" footer

Append to Section 11 (Build Notes):

```markdown
### Polish history (YYYY-MM-DD)

Every browser tool was visually upgraded to mirror its real-world counterpart...

Polish commits: `<sha1>` (whois) · `<sha2>` (ipgeo) · ... · `<shaN>` (final wave).
```

Include every commit SHA from the marathon. Operators rolling back or bisecting a regression will find this section first.

### 8.4 Confluence republish

```bash
python3 _tools/confluence/publish-solution.py update <page-id> "<walkthrough-path>"
```

Find the page ID via `find <lab-id>`:

```bash
python3 _tools/confluence/publish-solution.py find "<lab-shortname>"
```

The walkthrough is the operator-facing source of truth. **If you ship polish without updating the walkthrough, Bridget will fire a drift alert.**

---

## 9. Memory + cross-reference

After completing LREP on a lab, save a memory entry so future sessions can find the lab's polish state:

```markdown
---
name: project_<lab>_polish_<YYYY-MM-DD>
description: LREP applied to <lab-id> — N tools polished, all real-world branded
metadata:
  type: project
---

LREP completed <DATE>. <N> page routes, <M> tool surfaces polished:
- /whois → DomainTools cyan
- /ipgeo → MaxMind/IPinfo purple
- (etc.)

HEAD: <sha>. Smoke: PASS. 0 regressions.
Walkthrough updated: section 2a + per-phase notes + section 11 commit log.
Confluence page <id> updated to v<n>.

Related: [[lab-realism-enhancement-protocol]] [[feedback_document_as_you_move]]
```

Cross-references:
- Mention LREP completion in the relevant project memory (`project_<lab>.md`)
- Link from any quality-log entries that surfaced the original visual deficit

---

## 10. Common pitfalls (and how to recognize them)

| Symptom | Cause | Fix |
|---|---|---|
| `SyntaxError: Unexpected identifier 't'` after batch Edit | Apostrophe over-escaping (`\\\\'t`) | §5.7 sed commands |
| `TypeError: Cannot read properties of undefined (reading '_renderXxx')` at module load | Template literal calling `PISFinalConfig._xxx()` inside object-literal evaluation | §5.3 function-form `html:` |
| Smoke test FAIL on rebuilt tool | Polish stripped a literal the regex asserts on | §5.4 — preserve literal verbatim |
| Composite gate stops firing after polish | Handler return-HTML rewrite accidentally moved a state mutation | §5.5 — never touch `db.<>.<>` lines |
| Page renders blank or with `[object Object]` | Function-form `html:` returns `undefined` (forgot `return`) | Add explicit `return` in the function body |
| CSS bleed between tools (one tool's styles affect another) | Forgot the per-tool shell prefix | §5.1 — every selector starts with `.<prefix>-shell ` |
| Bridget RED alert post-polish | Walkthrough not updated to match polished UI | §8 — sync walkthrough + republish Confluence |
| Production diff shows mismatch with local | Deploy ran but didn't finish the IndexNow / Confluence step | Re-run `./deploy.sh` (idempotent) |

---

## 11. The Eclipse lab — canonical execution

For reference / regression-recovery, the full Eclipse application of this protocol:

**Lab:** `_app/houses/shield/infosec/labs/pis-final-patient-zero/`
**Date:** 2026-06-04
**Marathon span:** Single session, ~10 deploys
**Routes polished:** 38 / 38 (zero unpolished, zero render errors)
**Tool surfaces:** 13 distinct real-product mappings
**Smoke checkpoints:** 73 PASS, 0 FAIL
**Walkthrough:** `~/hexworth-shared/Solutions/Principles of Iformation Security/PIS-FINAL-Patient-Zero-SOLUTION.md` → 1190 lines
**Confluence:** page `18153474` v2
**Final HEAD:** `a2af235fa`

Commit chain:

| SHA | Wave | Surface |
|---|---|---|
| `ab5be1f2a` | 1 | `/whois` DomainTools cyan |
| `a219d7766` | 1 | `/ipgeo` MaxMind/IPinfo purple |
| `82dac61e8` | 2 | `/intel` Mandiant/CrowdStrike dark portal |
| `7face2d34` | 3 | `/patch` Microsoft SCCM blue |
| `ab9f8b47a` | 3 | `/insightvm` Rapid7 red (shell) |
| `f02428af2` | 3 | `/insightvm` Rapid7 red (handler result HTML) |
| `09187f807` | 3 | `/mailadmin` Proofpoint navy |
| `cc5915fa6` | 3 | `/attest/Q2-2026` ServiceNow GRC purple |
| `d7c3c0c8f` | 4 | `/inbox` + 13 `/msg/N` Outlook on the web |
| `d2b5a2fc7` | 5 | `/cve` + `/search` + 3 CVE detail pages NIST NVD |
| `a2af235fa` | 5 | `/downloads/*` Edge Downloads chrome |

Each commit message follows the format `feat(<lab-id>): <surface> <product> polish — <bullets>` and includes a "Smoke contract preserved" section listing the required literal strings it preserves.

---

## 12. Why this matters

Hexworth Prime serves real students who will work at real companies. A student who has spent 80 minutes inside a Mandiant-styled threat intel console, a Splunk-styled SIEM, and a Rapid7-styled scanner will **recognize** those products on day one of their job. A student who spent the same 80 minutes inside generic CTF placeholders has to learn the chrome and the workflow simultaneously.

The protocol is opinionated for a reason: realism is a teaching tool, not decoration. Every brand cue this protocol adds (Microsoft blue on patch management, Rapid7 red on InsightVM, the "Insight Agent Connected" pulsing green pill) is a recognition primer for the workplace. Strip it, and the lab teaches the IR craft but not the tool literacy that goes with it.

---

*Last updated: 2026-06-04. Canonical example: PIS-Final Patient Zero (commits `ab5be1f2a` → `a2af235fa`).*
