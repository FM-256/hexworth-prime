# Tenant-Leak + EduScan Exemption Findings (2026-07-07)

**TLDR:** An audit of every finding-*suppressing* exemption across the 44 EduScan validators found that
the dangerous kind (a regex/heuristic that decides NOT to flag, so a misfire hides a real problem) is
concentrated in exactly the two high-harm validators — `security/client-secrets.js` (already remediated
this session) and `syntax/heuristics.js` HEUR-030 tenant-leak family (STILL LIVE). **The operator has
confirmed real tenant leaks exist.** Fixing them is a deliberate, focused build (operator-scoped as a
weekend task — risk of breaking tenant routing if rushed), DEFERRED. This doc is the reference for that
build plus the smaller hardening items and the full record of this session's work.

Related: [[project_eduscan_exemption_hardening_and_tenant_leaks]] (pending-pile entry),
`_docs/operations/nexus-2026-07-07-criticals-scope.md` (validator-accuracy pass + SEC-002 saga),
[[feedback_no_regex_html_parsing_in_security_validator]], [[reference_heur_030_tenant_leak]].

---

## 1. The reframe (the core insight)

In a validator suite, **detection is safe; suppression is dangerous.** Code that only match-and-flags
can at worst produce a false *positive* (annoying, harmless). A finding-*suppressing exemption*
(`continue` / `return` / a guard that skips pushing an issue) is the false-*negative* surface: if its
condition misfires, a real problem is hidden with no signal. The harm scales with the rule — cosmetic
(wrong color) vs security/tenant-leak/answer-key (real exposure).

Consequence: an HTML parser is **not** the answer to the SEC-002 class of bug. A parser improves
*detection* accuracy; it does nothing for suppression logic (allowlists, token-presence guards). The
things worth fixing here are logic/policy, not parsing.

## 2. Exemption map (full audit)

Fragile suppression is **concentrated in the two high-harm validators**, nowhere else. The ~40 cosmetic
validators use structure only to FIND, never to SUPPRESS (a miss = a style slip, not an exposure).

| Validator | Rules | Suppression style | Harm if hidden |
|-----------|-------|-------------------|----------------|
| `security/client-secrets.js` | SEC-001/002/003/004 | file allowlist (`isExcluded`) + value heuristics; SEC-002 HTML-structure exemption REMOVED this session | secret / flag / answer-key leak (HIGH) |
| `syntax/heuristics.js` | HEUR-030a–f, HEUR-014, HEUR-025, QUIZ-00x | per-`<script>`-block token-presence guards + blanket `quarantine-allowlist.json` | **tenant leak (HIGH)**, answer leak, completion integrity |
| `security/firebase-config.js` | CONFIG-001 | control-flow only (`inventory` profile, missing-file) | config drift; suppressions over-report (safe direction) |
| `syntax/csp.js` | CSP-001 | wildcard/`https:` "covered" check; unknown `rel` skip | unauthorized external resource (MEDIUM) |
| ~40 others (emoji, palette, ux, naming, overflow, …) | cosmetic | value/whitespace/comment skips | style only |

## 3. Live risk #1 — HEUR-030 tenant-leak family (the SEC-002 twin, STILL LIVE)

The HEUR-030 rules are supposed to catch a page routing a student to a shared `/dashboard.html` instead
of their tenant's dashboard (a tenant leak = one school's students landing on another's dashboard). They
suppress the finding using the **same fragile pattern SEC-002 had**: "a `TenantRouter` token is present
in the block/file ⇒ assume the button is wired ⇒ don't flag." Presence of a token is not proof it is
actually wired to *this* leak.

Concrete guards (all in `_tools/eduscan/validators/syntax/heuristics.js`):

| Rule | Fn / line | Suppression | False-negative |
|------|-----------|-------------|----------------|
| HEUR-030  | `checkDashboardBtnTenantRewrite` L3364, guard **L3387** | `hasGetById && hasRouterCall` anywhere in file → `return` | tokens exist but wired to a different element / dead code → leak hidden |
| HEUR-030b | `checkLocationHrefTenantLeak` L3425, guard **L3438** | `TenantRouter.*` in the SAME `<script>` block → `continue` | a leaking `location.href` sharing a block with an unrelated TenantRouter call → hidden |
| HEUR-030c | `checkPageTransitionTenantLeak` L3478, guard **L3498** | same block-level TenantRouter guard | same |
| HEUR-030e | `checkMissingTenantAutoLoader` L3579, guard **L3592** | any loader script present (`AccessGuard`/`ModuleProgress`/`FirebaseAuth`/`TenantShell`) → `return` | loader present but rewriter not effective → hidden |
| HEUR-030f | `checkAbsoluteHexworthUrlLeak` L1416, guard **L1464** | per-block TenantRouter guard | same |
| HEUR-014  | `checkHardcodedRedirects` L1133, guards **L1146/L1149** | match text includes `TenantRouter`, or path under `tenant/` → `continue` | leak co-located with a TenantRouter mention → hidden |
| HEUR-030d | `checkFormIframeTenantLeak` L3525 | structural target-list only, no token guard | SAFE |

**Operator confirmed real tenant leaks exist.** The validator's block-guard suppression is very likely
part of why they don't all surface. The remediation is a deliberate build (re-derive each guard so it
proves the leak site is *actually* rewritten, not merely co-located with a token) — DEFERRED per operator
(risk of breaking live tenant routing; needs dedicated time + focus).

## 4. Latent risk #2 — blanket allowlist has no severity floor

`heuristics.js:239` passes EVERY heuristic finding — including HIGH tenant-leaks — through
`quarantine-allowlist.json` via a loose substring path match (`normalized.includes(entry.file) &&
entry.code === code`), with **no severity gate**. So a future entry could silence a HIGH tenant-leak with
no signal.

**Not currently exploited:** as of 2026-07-07 the allowlist holds only low/medium cosmetic entries
(HEUR-015 eval-in-docs, HEUR-004 console.log-in-sample, HEUR-003 TODO-in-game-dialogue). No
security/tenant/secret/answer code is allowlisted today. So the mechanism is a foot-gun with an empty
chamber. Cheap hardening: refuse to suppress security/tenant/data-integrity codes, or require an explicit
per-entry `override: true`. Also tighten the `.includes()` substring match (an entry can match more paths
than intended).

Minor: `profile === 'inventory' → return []` in both security validators disables ALL detection under that
profile. Fine as long as CI never runs the `inventory` profile — worth a one-line confirm.

## 5. Recommended actions (deferred, priority order)

1. **[weekend build, operator-owned] Adversarially rebuild the HEUR-030 guards** so each proves the leak
   site is actually tenant-rewritten, not just token-adjacent. Pair with fixing the real tenant leaks the
   operator has confirmed. High risk to live tenant routing — do with time + focus, not in a quick pass.
2. **[small, low-risk] Add a severity floor to `quarantine-allowlist.json`** (~10 lines in `heuristics.js`
   `isAllowlisted`): reject HIGH/security/tenant/data-integrity codes unless `override: true`.
3. **[policy, zero-infra] Exemption-review rule:** any new finding-suppressor added to a
   security/tenant/data-integrity validator requires Nancy (adversarial-reviewer) sign-off + a written
   "why this cannot hide a real finding." Optionally enforce with a small META validator.

Not doing: an HTML parser dependency. Confirmed over-engineering — it addresses neither real item and
would be the first dependency in a zero-dep tool.

---

## Appendix — full session record (2026-07-07)

What shipped / changed this session, in order:

1. **Quick wins (LIVE on hexworth.com).** Fixed a broken Security+ exam (`sy0-701-practice-exam-2.exam.html`
   — a literal `</script>` in a question payload terminated the inline quiz script; entity-escaped it) and
   linux-mastery sandbox auth (added `FirebaseAuth.js` at top of `script-lm-12`/`script-lm-27` so
   SandboxLauncher can authenticate; Nancy caught a double-load race in the first placement). Commit
   `fed441b04` + deploy.
2. **Validator-accuracy pass "Option A"** (`d604fd2ec` and predecessors). Cleared 150 false-positive eduscan
   HIGHs by fixing the *rules*, not content: PATH-DEPTH-001 ×143 (exempt absolute `/components/` paths —
   they resolve from web root, verified HTTP 200), SEC-002 ×2, SANDBOX-003/004. See criticals-scope doc.
3. **Clean Nexus baseline published** (`nexus full`, gate PASS). Pulse's eduscan severity → 0 HIGH / 0
   CRITICAL. IMPORTANT correction discovered: Pulse's health numbers are **eduscan-only** (buildSummary,
   `publish.js:114-126`); the raw `findings.json` (all 8 sources) is NOT what Pulse displays. Earlier "Pulse
   shows 10 critical" was a misread of the raw file.
4. **Sprint-rollup fix** (`c38742e43`). The sprint adapter leaked finished items (30 `completed` + 1
   `superseded`, incl. QC-59 critical) into the raw findings store because `getFindings` filtered literal
   `'done'` and ignored `isClosed()`. Unified all three call sites on one canonical `isClosed()` (added
   `superseded`). Affects the raw audit store only, not Pulse.
5. **SEC-002 display-exemption saga → resolved by abandoning it** (`d4a69cbe7`, `f95770dc2`). Five regex
   attempts to exempt displayed code samples each hid a real secret (Nancy broke every one). Reverted all
   masking (SEC-002 scans literally, can't hide a secret) + excluded the one teaching file via
   `isExcluded()`. Lesson saved: [[feedback_no_regex_html_parsing_in_security_validator]].
6. **This exemption audit** (sections 1–5 above).
