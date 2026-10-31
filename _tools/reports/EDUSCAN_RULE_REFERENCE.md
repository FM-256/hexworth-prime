# EduScan Rule Reference

> **Generated, do not edit.** Written by `_tools/eduscan/gen-rule-reference.js` from the validator
> source after each Nexus scan, and re-published here on each deploy. Edit the validator, not this page.

## TLDR

- **326 rule codes** defined in 216 EduScan source files, in 50 families.
- **Latest scan:** 2026-10-31, 5308 files, 14607 findings, profile `ci`.
- **Latest run:** 56 fired, 58 ran clean, 165 reported nothing, 5 last ran on an earlier day, 42 did not run.
- **Severity** is what the code sets. "computed" means the code decides per finding. A note says when the rule's own comment states a different severity.
- Live findings: the admin console Quality panel. To run: `node _tools/nexus/nexus.js scan`.

## What the run column means

| Run | Meaning |
|---|---|
| N in M files | The rule reported N findings in the latest run. |
| ran clean | Its audit wrote a report within 24 hours of this scan and found none of this kind. |
| no findings | The default scan loads this check and reported nothing. Some checks run only under another profile (for example `--profile strict`), so this does not prove it ran. |
| last ran DATE | The only evidence is an audit report from that day. Its findings are not counted here. |
| not run | Nothing runs it by default (functional, coverage, impact and some audits need a flag or their own command) and no report shows it ran. |

## Families

| Family | Rules | Findings in latest run (most specific code) |
|---|---|---|
| ASGN | 6 | 0 |
| BLOB | 4 | 1582 |
| BOX | 61 | 58 |
| CAT | 7 | 971 |
| CFG | 4 | 0 |
| CONFIG | 1 | 0 |
| CONTRACT | 3 | 0 |
| COV | 3 | 0 |
| CSP | 1 | 0 |
| DATA | 1 | 0 |
| DEP | 5 | 0 |
| EMOJI | 6 | 8 |
| ENG | 3 | 0 |
| FIRM | 5 | 0 |
| FLEX | 1 | 0 |
| FLOW | 1 | 1268 |
| FS | 2 | 0 |
| FUNC | 17 | 0 |
| GATE | 2 | 0 |
| GUARD | 1 | 0 |
| HEUR | 50 | 3777 |
| HTML | 11 | 1 |
| HUB | 1 | 1 |
| ID | 1 | 0 |
| JS | 6 | 0 |
| LP | 11 | 3726 |
| LT | 5 | 0 |
| MATH | 1 | 8 |
| META | 8 | 19 |
| NAME | 4 | 730 |
| NAV | 4 | 8 |
| OVERFLOW | 2 | 0 |
| PALETTE | 3 | 0 |
| PARSE | 1 | 0 |
| PATH | 10 | 51 |
| PROG | 4 | 13 |
| QUIZ | 13 | 421 |
| REG | 3 | 936 |
| SANDBOX | 13 | 11 |
| SCOPE | 1 | 0 |
| SEC | 7 | 0 |
| SEM | 5 | 830 |
| SKILL | 5 | 0 |
| SYNC | 4 | 0 |
| TAG | 2 | 1 |
| TRACK | 4 | 254 |
| TURTLE | 2 | 0 |
| UX | 1 | 10 |
| XP | 4 | 0 |
| XREF | 6 | 0 |

## ASGN

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **ASGN-001** | critical | Item-type assignment resolves to nonexistent file |  | no findings | `_tools/eduscan/validators/syntax/assignment-links.js:205` |
| **ASGN-002** | critical, medium, info | Path-type assignment can't derive index.html (contentId not in first module href) | Add an href to the first module of this path, or add a courseHref to the path definition | no findings | `_tools/eduscan/validators/syntax/assignment-links.js:267`, `_tools/eduscan/validators/syntax/assignment-links.js:293` |
| **ASGN-003** | high | Path-type assignment index.html doesn't exist on disk | Create …, or fix the courseHref value in LearningPaths.js | no findings | `_tools/eduscan/validators/syntax/assignment-links.js:248`, `_tools/eduscan/validators/syntax/assignment-links.js:318` |
| **ASGN-004** | high | PATH_HOUSE_MAP entry points to nonexistent house directory | Fix PATH_HOUSE_MAP in handler-dashboard.html — '…' is not a valid house directory | no findings | `_tools/eduscan/validators/syntax/assignment-links.js:348` |
| **ASGN-005** | high | Certification path in LearningPaths has no PATH_HOUSE_MAP entry | Add '…': '<parent-house>' to PATH_HOUSE_MAP in handler-dashboard.html | no findings | `_tools/eduscan/validators/syntax/assignment-links.js:404` |
| **ASGN-006** | medium | PATH_HOUSE_MAP has entry for path not in LearningPaths (stale mapping) | Remove stale '…' entry from PATH_HOUSE_MAP in handler-dashboard.html, or add the path to LearningPaths.js | no findings | `_tools/eduscan/validators/syntax/assignment-links.js:362` |

## BLOB

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **BLOB-001** | low | Inline <style> block exceeds threshold Note: The source comment says medium; the code sets low. | Extract <style> block to a shared CSS file | 645 in 645 files | `_tools/eduscan/validators/syntax/content-blob.js:82` |
| **BLOB-002** | low | Template literal HTML blob exceeds threshold | Extract large innerHTML template to a named function | 346 in 197 files | `_tools/eduscan/validators/syntax/content-blob.js:113` |
| **BLOB-003** | low | Base64 data URI detected | Extract base64 content to an external asset file | no findings | `_tools/eduscan/validators/syntax/content-blob.js:146` |
| **BLOB-004** | low | Oversized inline script block | Extract inline script to an external JS file | 591 in 591 files | `_tools/eduscan/validators/syntax/content-blob.js:181` |

## BOX

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **BOX-000** | info | CTF box/registry cross-check SKIPPED — no Firestore credentials. BOX-001..003 did not run; this is not a pass. | Run with application-default credentials to enable this check. | not run | `_tools/eduscan/validators/functional/ctf-boxes.js:216` |
| **BOX-001** | critical | Submit-validate box missing from box_flags.json | Add an entry to functions/box_flags.json for '…' with the 7 (or N) flag values from config.flags[]. Then run `node functions/seed-box-flags.js` to seed Firestore flag_registry/… (production write — requires master branch + operator authorization). | ran clean | `_tools/eduscan/box-flag-registry-audit.js:236`, `_tools/eduscan/box-flag-registry-audit.js:304`, +1 more |
| **BOX-001-A** | high | Submit-validate box has no registryId field. Submit Flag modal cannot route to validateFlag CF. | Add `registryId: '<box-id>'` to the config. The ID must match the directory name and the box_flags.json key. | ran clean | `_tools/eduscan/box-flag-registry-audit.js:222` |
| **BOX-002** | high | Box "…" has a flag_registry entry with zero flags — nothing in it can be solved. | Populate flag_registry/….flags. | not run | `_tools/eduscan/validators/functional/ctf-boxes.js:269` |
| **BOX-002a** | medium | Box has no walkthrough at ~/hexworth-shared/Solutions/. |  | ran clean | `_tools/eduscan/box-walkthrough-audit.js:325` |
| **BOX-002a-ID-EXTRACT-FAILED** | medium | Box name '…' does not match the house's ID pattern (…). Validator cannot derive a walkthrough search prefix. | Either rename the box directory to match the house convention, or extend HOUSE_MAP idPattern to accept this naming style. | ran clean | `_tools/eduscan/box-walkthrough-audit.js:261` |
| **BOX-002a-MISSING-WALKTHROUGH** | critical | No walkthrough .md or .docx found in the expected Solutions directory for the box's house. | Author a walkthrough at Solutions/…/…-<KebabTitle>_WALKTHROUGH.md (or -SOLUTION.md depending on house convention). The walkthrough documents the scenario(s), the fix path, and the canonical flag value per scenario for the seed. | ran clean | `_tools/eduscan/box-walkthrough-audit.js:276` |
| **BOX-002a-UNKNOWN-HOUSE** | medium | Box config exists at a path the validator cannot map to a Solutions directory. Path mapping table needs to be extended. | Add an entry to HOUSE_MAP in box-walkthrough-audit.js mapping this config path prefix to its Solutions/{house}/ directory. | 1 in 1 file | `_tools/eduscan/box-walkthrough-audit.js:236` |
| **BOX-002b** | medium | Walkthrough exists but is missing flag-value entries. |  | ran clean | `_tools/eduscan/box-walkthrough-flag-audit.js:298` |
| **BOX-002c** | high | Walkthrough flag values disagree with box_flags.json. |  | ran clean | `_tools/eduscan/box-walkthrough-flag-drift.js:363` |
| **BOX-002c-DRIFT-BOTH** | critical | Walkthrough and box_flags.json disagree on … item(s) for this box. |  | ran clean | `_tools/eduscan/box-walkthrough-flag-drift.js:320` |
| **BOX-002c-DRIFT-SCENARIO** | critical | Walkthrough names a scenarioId that box_flags.json does not seed (or vice versa). |  | ran clean | `_tools/eduscan/box-walkthrough-flag-drift.js:320` |
| **BOX-002c-DRIFT-VALUE** | critical | Both sources have the scenarioId but the flag values disagree (after case-insensitive normalization per validateFlag CF). |  | ran clean | `_tools/eduscan/box-walkthrough-flag-drift.js:320` |
| **BOX-002c-NO-MANIFEST** | low | Walkthrough exists but has no parseable Flag Manifest table — drift detection cannot run. (informational). |  | ran clean | `_tools/eduscan/box-walkthrough-flag-drift.js:248`, `_tools/eduscan/box-walkthrough-flag-drift.js:260` |
| **BOX-003** | medium | the box's declared flag ids and the registry's CANONICAL ids do not line up. Submissions still SUCCEED: validateFlag mode 2 matches on flag VALUE, not id, and records the capture under the registry's resolved id. What breaks is completion. _recomputeCtfStats counts distinct canonical ids as the threshold, so a box whose registry declares five canonical flags while the box really has one can never… | Add an aliases map on flag_registry/… collapsing its keys onto the canonical id(s) the box declares, as ad001-lockout-storm does — or align the box config's flag ids with the registry. | 6 in 6 files | `_tools/eduscan/box-engine-api-lint.js:318`, `_tools/eduscan/validators/functional/ctf-boxes.js:305` |
| **BOX-003-NONEXISTENT-API** | high | Config calls engine.<name> where <name> is in the known-invalid list. |  | ran clean | `_tools/eduscan/box-engine-api-lint.js:225` |
| **BOX-003-SUSPICIOUS-API** | medium | Config calls engine.<name> where <name> is uncommon — possible typo. |  | ran clean | `_tools/eduscan/box-engine-api-lint.js:245` |
| **BOX-003-UNKNOWN-API** | high | Config calls engine.<name> where <name> is not a member of BoxEngine at all, and the box does not assign it itself. |  | 8 in 6 files | `_tools/eduscan/box-engine-api-lint.js:235` |
| **BOX-004** | info | Multi-action gate logic where two scenarios can be satisfied simultaneously (ambiguous flag award). | Extend _reachableFlagIds if these should be covered, or confirm their flags are registered by another route. | ran clean | `_tools/eduscan/box-gate-exclusivity-lint.js:271`, `_tools/eduscan/validators/functional/ctf-boxes.js:324` |
| **BOX-004-GATE-NO-EXCLUSIVITY** | high | Completion gate uses .includes() but no exclusivity check on the same array. May allow gate bypass when student has both correct + wrong values. |  | ran clean | `_tools/eduscan/box-gate-exclusivity-lint.js:230` |
| **BOX-005** | high | Config missing scoring.minScore floor — score can go negative. |  | ran clean | `_tools/eduscan/box-scoring-floor-audit.js:269` |
| **BOX-005-MISSING-MINSCORE** | medium | Config has a scoring block but no minScore field. (operator-set; defaults to engine's fallback behavior, which is unspecified). | Add 'minScore: 0' to the scoring block (or non-zero floor if scenario allows negative scores). | ran clean | `_tools/eduscan/box-scoring-floor-audit.js:193` |
| **BOX-005-NEGATIVE-MINSCORE** | high | minScore is set but negative. (explicit declaration that score may go negative — likely an error). | Set minScore to 0 unless negative scoring is required. | ran clean | `_tools/eduscan/box-scoring-floor-audit.js:217` |
| **BOX-005-NO-SCORING-BLOCK** | high | Config has no scoring block at all. (engine cannot compute scores). | Add a scoring block with base, maxScore, hintPenalty, wrongFlagPenalty, and minScore. | ran clean | `_tools/eduscan/box-scoring-floor-audit.js:179` |
| **BOX-005-NON-NUMERIC-MINSCORE** | medium | minScore field is present but non-numeric: '…'. Expected an integer. | Set minScore to an integer (typically 0). | ran clean | `_tools/eduscan/box-scoring-floor-audit.js:205` |
| **BOX-006** | high | Config has mutable _state but no resetState() — session bleed across student visits. |  | ran clean | `_tools/eduscan/box-state-reset-audit.js:272` |
| **BOX-006-MISSING-RESET-STATE** | high | Config has mutable _db / _state / _phaseState block with non-trivial initial values, but no resetState() method AND no _applyScenario fallback. | Add a resetState() method that re-initializes the state fields to their default values. BoxEngine should call this on lab-init. | ran clean | `_tools/eduscan/box-state-reset-audit.js:230` |
| **BOX-007** | high | Config levies a penalty (engine.addScore(-N, ...)) but has no undo/reset path — soft-lock risk. |  | ran clean | `_tools/eduscan/box-recoverable-action-audit.js:196` |
| **BOX-007-NO-RECOVERY** | high | Config has penalty actions but no detectable undo/reset/revert handler. Soft-lock risk. | Add an undo path: action handler key like 'undo_<state>', or _db.<state>.undone tracker, or resetState() / _applyScenario() that clears the penalized state on student request. | ran clean | `_tools/eduscan/box-recoverable-action-audit.js:154` |
| **BOX-008** | medium | Flag value contains shell metacharacters that break copy-paste into a terminal. |  | ran clean | `_tools/eduscan/box-flag-shell-safety.js:166` |
| **BOX-008-FLAG-SHELL-UNSAFE** | medium | Flag value contains one or more shell metacharacters. Walkthrough should document the quoting requirement. |  | 1 in 0 files | `_tools/eduscan/box-flag-shell-safety.js:117` |
| **BOX-009** | medium | Decoy artifacts not surfaced/labeled — students can't tell decoy from real evidence. |  | ran clean | `_tools/eduscan/box-decoy-provenance-lint.js:293` |
| **BOX-009-DECOY-CONTEXT-ONLY-IN-BRIEFING** | medium | Decoy-context identifier found in narrative file but not in any UI surface. Student must rely on memory of briefing text. (review required). | Add the decoy-context identifiers (HR tickets, calendar refs, prior-session counts) directly to the UI surface at the point of disambiguation (SIEM logs, dashboard panels, etc.) so students have inline provenance. | ran clean | `_tools/eduscan/box-decoy-provenance-lint.js:251` |
| **BOX-010** | medium | Help-Level in hint metadata doesn't match the hint's actual cost/disclosure. |  | ran clean | `_tools/eduscan/box-hint-help-level-lint.js:306` |
| **BOX-010-HINT-UNDER-DISCLOSED** | medium | Declared Help Level is materially lower than measured specificity. |  | ran clean | `_tools/eduscan/box-hint-help-level-lint.js:264` |
| **BOX-010-NO-HELP-LEVEL** | low | Hints have no helpLevel field declared. Rule N/A — informational. |  | ran clean | `_tools/eduscan/box-hint-help-level-lint.js:228` |
| **BOX-011** | high, info | Flag value appears as literal in client-shipped config.js. |  | 6 in 6 files | `_tools/eduscan/box-flag-leak-audit.js:235` |
| **BOX-011-FLAG-LEAK-CTF** | high | Formal CTF-pattern flag literal found in config.js. |  | 32 in 4 files | `_tools/eduscan/box-flag-leak-audit.js:176` |
| **BOX-011-FLAG-LEAK-NARRATIVE** | info | Flag value appears as literal in client-shipped config.js. |  | 11 in 2 files | `_tools/eduscan/box-flag-leak-audit.js:176` |
| **BOX-013** | critical | config.registryId does not equal directory basename — Firestore lookup silently fails. |  | ran clean | `_tools/eduscan/box-registry-id-dirname.js:165` |
| **BOX-013-MISMATCH** | critical | registryId does not equal directory basename. | Change registryId to '…' OR rename the directory to '…'. Whichever matches the existing flag_registry entry should win. | ran clean | `_tools/eduscan/box-registry-id-dirname.js:131` |
| **BOX-013-MISSING** | high | Config has no registryId field. (flag bridge cannot be wired without it). | Add registryId: '…' near the top of the config object. | ran clean | `_tools/eduscan/box-registry-id-dirname.js:115` |
| **BOX-014** | high | Box exists on disk but isn't referenced from ContentCatalog or any hub HTML — student can't navigate to it. |  | ran clean | `_tools/eduscan/box-content-catalog-orphan.js:222` |
| **BOX-014-DISCOVERY-ORPHAN** | high | Box dirname not referenced in any platform-level discovery surface. Students cannot find it via navigation. | Add a ContentCatalog entry OR a lab card to the appropriate hub index (arena/index.html, houses/<house>/index.html, etc.). | ran clean | `_tools/eduscan/box-content-catalog-orphan.js:192` |
| **BOX-016** | critical, high | index.html missing config.js, BoxEngine.js, or FirebaseAuth.js script imports. |  | ran clean | `_tools/eduscan/box-html-bootstrap-audit.js:212` |
| **BOX-016-MISSING-CONFIG-JS** | critical | No `<script src="...config.js">`. Engine will throw `<Config> is not defined` on init. |  | ran clean | `_tools/eduscan/box-html-bootstrap-audit.js:72` |
| **BOX-016-MISSING-ENGINE** | critical | No `<script src="...BoxEngine.js">`. BoxEngine.init throws ReferenceError. |  | ran clean | `_tools/eduscan/box-html-bootstrap-audit.js:78` |
| **BOX-016-MISSING-FIREBASE-AUTH** | high | index.html does not include <script src="...FirebaseAuth.js">. Flag validation silently falls back to client-side comparison — server bridge unusable, flag leak resistance compromised. |  | ran clean | `_tools/eduscan/box-html-bootstrap-audit.js:84` |
| **BOX-020** | high | config.flags[] declared IDs disagree with box_flags.json registered IDs (mechanism-aware — handles request/auto-only/dispatch/config-embedded). |  | ran clean | `_tools/eduscan/box-flag-count-consistency.js:359` |
| **BOX-020-DISPATCH-EMPTY** | high | Dispatch box has no scenarios registered in box_flags.json. Student cannot earn any flag. |  | ran clean | `_tools/eduscan/box-flag-count-consistency.js:237` |
| **BOX-020-MISSING-IN-REGISTRY** | high | config.flags declares flag X, mechanism needs a registry entry, but box_flags.json[box].flags has no key X. Bridge cannot validate submissions. |  | ran clean | `_tools/eduscan/box-flag-count-consistency.js:289` |
| **BOX-020-ORPHAN-IN-REGISTRY** | medium | box_flags.json[box].flags has key X but config.flags does not declare it. Phantom flag — student can never earn. (stale registry). |  | ran clean | `_tools/eduscan/box-flag-count-consistency.js:252`, `_tools/eduscan/box-flag-count-consistency.js:297` |
| **BOX-024** | high | Two flags in same box share the same normalized value — Mode-2 validateFlag awards the wrong scenario. |  | ran clean | `_tools/eduscan/box-flag-value-duplicates.js:137` |
| **BOX-024-DUPLICATE-VALUE** | high | Two or more flags in the same box share the same normalized value. validateFlag Mode-2 will award credit ambiguously. | Make each flag value unique. If two scenarios truly produce the same answer, merge them or give one a discriminating suffix. | ran clean | `_tools/eduscan/box-flag-value-duplicates.js:103` |
| **BOX-035** | high | Box references /assets/... or relative image/audio paths that don't exist on disk. |  | ran clean | `_tools/eduscan/box-asset-existence-audit.js:205` |
| **BOX-035-ASSET-MISSING** | high | config.js references a path that does not resolve to an existing file. | Either restore the missing files at the expected path or update the config references. | 5 in 5 files | `_tools/eduscan/box-asset-existence-audit.js:171` |
| **BOX-037** | high | Config writes flag-capture state to localStorage directly, bypassing the server-side validateFlag bridge. |  | ran clean | `_tools/eduscan/box-localstorage-flag-bypass.js:179` |
| **BOX-037-LOCALSTORAGE-FLAG-BYPASS** | high | config.js writes flag-capture-shaped state to localStorage outside the engine award path. Bypasses the server-side validateFlag bridge. | Replace direct localStorage writes with engine.awardFlag(flagId) or remove if defensive client-side persistence was intended (then use a non-flag key name). | ran clean | `_tools/eduscan/box-localstorage-flag-bypass.js:147` |
| **BOX-042** | critical, high | Two boxes share storageKey — progress cross-pollutes between labs. |  | ran clean | `_tools/eduscan/box-storage-key-uniqueness.js:190` |
| **BOX-042-COLLISION** | critical | Two or more boxes declare the same storageKey. Progress data cross-pollutes. | Rename to a unique value like 'hexworth_lab_…'. | ran clean | `_tools/eduscan/box-storage-key-uniqueness.js:147` |
| **BOX-042-MISSING** | high | config.js has no `storageKey` field. Engine falls back to the platform default. Progress collides with every other default-fallback box. | Add storageKey: 'hexworth_lab_<short-id>' to the config. | ran clean | `_tools/eduscan/box-storage-key-uniqueness.js:134` |

## CAT

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **CAT-001** | critical | Module status 'available' but href file doesn't exist on disk | Create the file or fix the href for module '…' | no findings | `_tools/eduscan/validators/syntax/content-catalog.js:289`, `_tools/eduscan/validators/syntax/content-catalog.js:76` |
| **CAT-002** | medium | HTML file in house directory not declared in any catalog module | Add this file as a module in ContentCatalog.js under house '…' | 29 in 29 files | `_tools/eduscan/validators/syntax/content-catalog.js:357` |
| **CAT-003** | high | Module status 'available' with empty/missing href | Add a valid href path to this module | no findings | `_tools/eduscan/validators/syntax/content-catalog.js:254` |
| **CAT-004** | warning | Module status not 'available' but href doesn't exist on disk | Create the file before setting status to 'available', or remove the dead href | 42 in 1 file | `_tools/eduscan/validators/syntax/content-catalog.js:303` |
| **CAT-005** | high | Duplicate module IDs in ContentCatalog | Give module '…' a unique ID in one of its occurrences | no findings | `_tools/eduscan/validators/syntax/content-catalog.js:225` |
| **CAT-006** | medium | Suffix-polluted module ID (CAT-002 deriveModuleId artifact). Catalog id ends with .module/.tool/.lab/.quiz/.applet — these are file-extension fragments leaked into ID generation. Hub inline arrays use the clean form (no suffix). Mismatch causes scanner Mech 4 to miss matches without suffix-stripping workaround. Added 2026-04-30 (Stragglers branch). MEDIUM. | Rename catalog ids to drop trailing '…'. Verify no runtime consumers reference the suffix-form id (typical: only the scanner does — STR-28). | no findings | `_tools/eduscan/validators/syntax/content-catalog.js:161` |
| **CAT-007** | medium | Duplicate (house, href) — multiple catalog entries point to the same content file. Examples found in Stragglers audit: clh-001 + script-clh-001 (CLH parent dual-naming), web-ip-* triples for subnetting practice. Either dual-naming was intentional (legacy id + new id during migration) or one of the entries is dead code. Operator decision needed — validator flags but doesn't auto-resolve. Added 202… | Decide which id to keep (typically the more recent / more descriptive). Remove duplicate(s) from MODULES array. | 900 in 1 file | `_tools/eduscan/validators/syntax/content-catalog.js:122` |

## CFG

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **CFG-001** | high | Missing moduleId | Add moduleId: '…' to QuizEngine configuration | no findings | `_tools/eduscan/parsers/quiz.js:316` |
| **CFG-002** | low | Missing houseId (lower severity - auto-detection works) |  | no findings | `_tools/eduscan/parsers/quiz.js:336` |
| **CFG-003** | warning | Lab missing moduleId | Add moduleId to LabEngine configuration | no findings | `_tools/eduscan/parsers/lab.js:98` |
| **CFG-004** | info | Applet using deprecated library | Consider migrating to vanilla JavaScript | no findings | `_tools/eduscan/parsers/applet.js:133` |

## CONFIG

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **CONFIG-001** | high | Firebase config field missing or inconsistent | Align … value across … | no findings | `_tools/eduscan/validators/security/firebase-config.js:101`, `_tools/eduscan/validators/security/firebase-config.js:63`, +1 more |

## CONTRACT

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **CONTRACT-001** | high, medium | Method missing from component (critical if component is critical) | Restore or rename ….…() — downstream files depend on it | not run | `_tools/eduscan/validators/impact/contract-validator.js:98` |
| **CONTRACT-002** | high, medium | Method signature changed (parameter count mismatch) | Verify ….…() still accepts the expected parameters | not run | `_tools/eduscan/validators/impact/contract-validator.js:115` |
| **CONTRACT-003** | critical, high | Component file missing entirely | Restore … component file | not run | `_tools/eduscan/validators/impact/contract-validator.js:60` |

## COV

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **COV-001** | medium | Module '…' has no assessments (no quiz or lab) | Add a quiz or lab to assess student understanding | not run | `_tools/eduscan/validators/coverage.js:556` |
| **COV-002** | high | House '…' has critical assessment gap: …% coverage (…/… modules) | Add assessments to … modules | not run | `_tools/eduscan/validators/coverage.js:572` |
| **COV-003** | high, medium | Learning path '…' needs more assessments: …% coverage | Add assessments to … modules in this path | not run | `_tools/eduscan/validators/coverage.js:588` |

## CSP

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **CSP-001** | medium | External domain in code not covered by CSP policy | Add … to … in firebase.json CSP header | no findings | `_tools/eduscan/validators/syntax/csp.js:247` |

## DATA

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **DATA-001** | suspect | localStorage.getItem() in arithmetic without Number() coercion. | Wrap with Number(): += Number(localStorage.getItem(...)) | no findings | `_tools/eduscan/validators/syntax/heuristics.js:550`, `_tools/eduscan/validators/syntax/heuristics.js:575` |

## DEP

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **DEP-001** | high | trackProgress: true (QuizEngine config) → ProgressSystem.js |  | no findings | `_tools/eduscan/validators/syntax/dependency-check.js:39` |
| **DEP-002** | high | ProgressManager.completeModule/.complete → ProgressSystem.js OR ProgressManager.js |  | no findings | `_tools/eduscan/validators/syntax/dependency-check.js:48` |
| **DEP-003** | medium | GameTracker.record → GameTracker.js |  | no findings | `_tools/eduscan/validators/syntax/dependency-check.js:57` |
| **DEP-004** | high | ModuleProgress.complete → ModuleProgress.js |  | no findings | `_tools/eduscan/validators/syntax/dependency-check.js:66` |
| **DEP-005** | medium | AchievementSystem.unlock / AchievementManager.unlock → AchievementSystem.js OR AchievementManager.js |  | no findings | `_tools/eduscan/validators/syntax/dependency-check.js:75` |

## EMOJI

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **EMOJI-001** | low | Emoji in icon: JS property |  | no findings | `_tools/eduscan/validators/syntax/emoji.js:293`, `_tools/eduscan/validators/syntax/emoji.js:450` |
| **EMOJI-002** | low | Emoji in HTML badge/header icon elements |  | no findings | `_tools/eduscan/validators/syntax/emoji.js:325`, `_tools/eduscan/validators/syntax/emoji.js:473` |
| **EMOJI-003** | warning | Emoji in inline HTML near known UI patterns |  | no findings | `_tools/eduscan/validators/syntax/emoji.js:359` |
| **EMOJI-004** | medium | Emoji in hero/emblem container (should be <img>) |  | 1 in 1 file | `_tools/eduscan/validators/syntax/emoji.js:399` |
| **EMOJI-005** | low | Raw emoji in JS string literal or HTML content |  | 7 in 4 files | `_tools/eduscan/validators/syntax/emoji.js:520` |
| **EMOJI-006** | medium | Escaped Unicode emoji in HTML <script> block icon: property |  | no findings | `_tools/eduscan/validators/syntax/emoji.js:281` |

## ENG

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **ENG-001** | computed | Engine "…" is used but not included | Add <script src="…"></script> before usage | no findings | `_tools/eduscan/validators/syntax/engine.js:224` |
| **ENG-002** | computed | Global "…" used but … not included | Add … script before usage | no findings | `_tools/eduscan/validators/syntax/engine.js:551` |
| **ENG-003** | high | jQuery plugin "…" loaded before jQuery | Move jQuery script before plugin scripts | no findings | `_tools/eduscan/validators/syntax/engine.js:601` |

## FIRM

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **FIRM-001** | not stated | C2-device firmware manifest schema check |  | not run | `_tools/eduscan/firmware-manifest-audit.js:3` |
| **FIRM-001.A** | critical | MISSING_FLASHER_MODE (critical — refuses to flash) |  | not run | `_tools/eduscan/firmware-manifest-audit.js:148`, `_tools/eduscan/firmware-manifest-audit.js:82` |
| **FIRM-001.B** | critical | UNKNOWN_FLASHER_MODE (critical — no renderer matches) |  | not run | `_tools/eduscan/firmware-manifest-audit.js:155`, `_tools/eduscan/firmware-manifest-audit.js:93` |
| **FIRM-001.C** | critical, high | MISSING_REQUIRED_FIELD (high — mode-specific field absent) |  | not run | `_tools/eduscan/firmware-manifest-audit.js:106`, `_tools/eduscan/firmware-manifest-audit.js:137`, +3 more |
| **FIRM-001.D** | medium | NAME_COLLISION (medium — flashMode/flasherMode confusion) |  | not run | `_tools/eduscan/firmware-manifest-audit.js:121` |

## FLEX

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **FLEX-001** | medium | Flex column container with flex:1 missing min-height:0 | Add min-height: 0 to … to allow flex children to scroll properly | no findings | `_tools/eduscan/validators/syntax/flex-overflow.js:159` |

## FLOW

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **FLOW-001** | low | Unchained content — not part of any learning progression | Add to a LearningPaths.js path, reference from a registry entry with paths[], or place in a course directory | 1268 in 1268 files | `_tools/eduscan/validators/flow-validator.js:127` |

## FS

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **FS-DEADPATH-001** | computed | Unreferenced directory: … (… files) |  | no findings | `_tools/eduscan/validators/orphans.js:927` |
| **FS-ORPHAN-001** | computed | Unreachable content […]: … |  | no findings | `_tools/eduscan/validators/orphans.js:577` |

## FUNC

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **FUNC-001** | high | JavaScript runtime errors (ReferenceError, TypeError, etc.) |  | not run | `_tools/eduscan/validators/functional/runtime.js:134` |
| **FUNC-003** | medium | console.error() calls (excluding benign patterns) | Review console.error() output — may indicate initialization failure | not run | `_tools/eduscan/validators/functional/runtime.js:158` |
| **FUNC-004** | high | Resource load failures (script/CSS 404 over file://) | Check that the referenced file exists: … | not run | `_tools/eduscan/validators/functional/runtime.js:173`, `_tools/eduscan/validators/functional/runtime.js:183` |
| **FUNC-005** | high | Blank screen (no visible text content after load) | Check script initialization, may have fatal error preventing render | not run | `_tools/eduscan/validators/functional/runtime.js:122` |
| **FUNC-006** | high | Dead anchor links (rendered <a href> points to missing file) | Create the target file or fix the href | not run | `_tools/eduscan/validators/functional/runtime.js:265` |
| **FUNC-010** | critical | ProgressManager XP award |  | not run | `_tools/eduscan/validators/functional/smoke.js:157` |
| **FUNC-011** | critical | AchievementRegistry persistence |  | not run | `_tools/eduscan/validators/functional/smoke.js:187` |
| **FUNC-012** | critical | GameTracker record |  | not run | `_tools/eduscan/validators/functional/smoke.js:220` |
| **FUNC-013** | high | AccessGuard blocks unauthorized |  | not run | `_tools/eduscan/validators/functional/smoke.js:249` |
| **FUNC-014** | high | QuizEngine instantiation |  | not run | `_tools/eduscan/validators/functional/smoke.js:288` |
| **FUNC-015** | high | Achievement v1/v2 bridge |  | not run | `_tools/eduscan/validators/functional/smoke.js:315` |
| **FUNC-016** | medium | ProgressManager level calculation |  | not run | `_tools/eduscan/validators/functional/smoke.js:345` |
| **FUNC-017** | medium | GameTracker top scores |  | not run | `_tools/eduscan/validators/functional/smoke.js:369` |
| **FUNC-020** | critical | SyncUtils scalar merge (local wins) |  | not run | `_tools/eduscan/validators/functional/smoke.js:410` |
| **FUNC-021** | critical | SyncUtils nested object recursion |  | not run | `_tools/eduscan/validators/functional/smoke.js:433` |
| **FUNC-022** | high | SyncUtils array union dedup |  | not run | `_tools/eduscan/validators/functional/smoke.js:473` |
| **FUNC-023** | critical | SyncUtils restoreSyncBlob full simulation |  | not run | `_tools/eduscan/validators/functional/smoke.js:510` |

## GATE

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **GATE-CHAIN-001** | high | Gate chain broken in …: missing gate(s) … | Create or restore missing gate files: … | no findings | `_tools/eduscan/validators/orphans.js:994` |
| **GATE-ROOT-001** | critical, medium | Gated subtree … declares entry '…' but file not found | Create or restore the gate entry file: … | no findings | `_tools/eduscan/validators/orphans.js:1019`, `_tools/eduscan/validators/orphans.js:1045` |

## GUARD

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **GUARD-001** | not stated | Critical Guard Registry Audit |  | not run | `_tools/eduscan/guard-registry-audit.js:3` |

## HEUR

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **HEUR-001** | suspect | Excessive inline scripts (>8 <script> blocks without src) | Consider extracting inline scripts to external .js files | 3 in 3 files | `_tools/eduscan/validators/syntax/heuristics.js:266` |
| **HEUR-002** | suspect | Commented-out code references (<!-- containing <script or <link) | Remove commented-out code or restore it if needed | 9 in 6 files | `_tools/eduscan/validators/syntax/heuristics.js:295` |
| **HEUR-003** | suspect | TODO/FIXME/HACK markers inside <script> blocks | Resolve or remove … comment | 1 in 1 file | `_tools/eduscan/validators/syntax/heuristics.js:332` |
| **HEUR-004** | suspect | console.log in inline scripts (production hygiene) | Remove console.log or replace with proper logging | 7 in 7 files | `_tools/eduscan/validators/syntax/heuristics.js:379` |
| **HEUR-005** | suspect | Duplicate script includes (same src on multiple <script> tags) | Remove duplicate <script src="…"> tag | no findings | `_tools/eduscan/validators/syntax/heuristics.js:418` |
| **HEUR-006** | suspect | Hardcoded relative href in shared JS renderer (fragile back links) | Use absolute path from site root (e.g., /houses/shield/index.html) instead of relative path | no findings | `_tools/eduscan/validators/syntax/heuristics.js:768` |
| **HEUR-007** | medium | Code block CSS missing white-space: pre/pre-wrap (commands render as paragraph) | Add 'white-space: pre-wrap;' to the .… CSS rule | no findings | `_tools/eduscan/validators/syntax/heuristics.js:826` |
| **HEUR-008** | suspect | position:fixed in dynamically created overlay (breaks when body has filter/transform) | Use position:absolute with JS-calculated top/height from window.scrollY/innerHeight, or use a pre-existing static DOM element from the HTML | 9 in 6 files | `_tools/eduscan/validators/syntax/heuristics.js:901` |
| **HEUR-009** | critical | Empty template literal ${} in inline scripts (SyntaxError kills entire script block) | Restore the missing expression inside ${}, e.g., ${current.task} or ${obj.task} | no findings | `_tools/eduscan/validators/syntax/heuristics.js:654` |
| **HEUR-010** | high | querySelector targets heading tag not present in HTML (e.g., h3 in selector but h2 in markup — null crash) | Change selector to '.… h…' to match the actual HTML heading level | no findings | `_tools/eduscan/validators/syntax/heuristics.js:708` |
| **HEUR-011** | high | Literal </script> inside JS string or comment (HTML parser terminates script block early, killing all JS below it) | Escape as <\/script> — the backslash is invisible to JS but prevents HTML parser termination | no findings | `_tools/eduscan/validators/syntax/heuristics.js:978` |
| **HEUR-012** | high | JS syntax error via new Function() parse check (catches unclosed strings, missing quotes, etc.) | Fix the syntax error — this kills the entire script block | no findings | `_tools/eduscan/validators/syntax/heuristics.js:1065` |
| **HEUR-013** | high | innerHTML assignment with unsanitized template literal (XSS risk — user/dynamic data injected without escaping) | Use textContent for user data, or wrap variables with escapeHtml() before inserting into innerHTML | no findings | `_tools/eduscan/validators/syntax/heuristics.js:1126` |
| **HEUR-014** | medium | onclick with hardcoded window.location redirect (bypasses routing, breaks tenant encapsulation) | Use <a href> tags (interceptable by TenantShell) or call TenantRouter.getUrl() for navigation | 19 in 2 files | `_tools/eduscan/validators/syntax/heuristics.js:1175` |
| **HEUR-015** | suspect | eval() usage in non-sandbox code (code injection risk — should use Function() or safer alternatives) | Replace eval() with new Function() for controlled execution or JSON.parse() for data | no findings | `_tools/eduscan/validators/syntax/heuristics.js:1249` |
| **HEUR-016** | medium | document.write() usage (DOM clobbering, breaks page if called after load) | Use createElement + appendChild, or set innerHTML on a container element | no findings | `_tools/eduscan/validators/syntax/heuristics.js:1289` |
| **HEUR-017** | high | Dynamic lazy-loading of platform component via createElement('script') (should be static <script src>; lazy loads bypass dependency checks and cause race conditions) | Replace createElement/src pattern with <script src=".../….js"></script> and trigger completion via a deliberate user action (button click, not auto-scroll) | no findings | `_tools/eduscan/validators/syntax/heuristics.js:2283` |
| **HEUR-018** | medium, info | Scroll-triggered auto-completion — fires ModuleProgress.complete() inside a scroll listener (student has no deliberate action; should use a "Mark Complete" button instead) |  | 203 in 203 files | `_tools/eduscan/validators/syntax/heuristics.js:2425` |
| **HEUR-019** | computed | Tenant config missing required fields — dashboard file lacks slug, branding, licensing, or adminUids references | Add the missing tenant config fields (…) to the dashboard configuration object | no findings | `_tools/eduscan/validators/syntax/heuristics.js:2486` |
| **HEUR-020** | medium | Tenant dashboard broken asset references — absolute image/icon/CSS paths that don't resolve within _app | Verify the asset path resolves within _app/ or use a relative path. Missing asset: … | no findings | `_tools/eduscan/validators/syntax/heuristics.js:2539` |
| **HEUR-021** | computed | Missing house content in tenant license — tenant config licenses houses that have no content in the registry | Either add content to houses/…/ or remove "…" from the tenant license configuration | no findings | `_tools/eduscan/validators/syntax/heuristics.js:2598`, `_tools/eduscan/validators/syntax/heuristics.js:2621` |
| **HEUR-022** | warning | Over-deep relative index.html link — href climbs more parent dirs than the file's depth inside its house (e.g., ../../../index.html from a 1-deep subfolder) | Reduce "../" depth to match file location (expected max … levels for house root) | 1 in 1 file | `_tools/eduscan/validators/syntax/heuristics.js:2676` |
| **HEUR-023** | computed | Broken Course Home link — href to index.html resolves to a path that doesn't exist on disk (archived or never created) | Update href to point to a valid index.html (e.g., ../index.html or ../network-plus/index.html) | no findings | `_tools/eduscan/validators/syntax/heuristics.js:2725` |
| **HEUR-024** | warning | Missing Course Home link — page loads ModuleProgress.js but has no <a> with href ending in index.html (completion overlay "Course Home" button will be absent) | Add a navigation link (visible or in breadcrumbs) with href pointing to the parent index.html | 7 in 7 files | `_tools/eduscan/validators/syntax/heuristics.js:2782` |
| **HEUR-025** | high | Module completion ID mismatch — ModuleProgress.complete() uses a different moduleId than the hub/index page expects, causing completions to silently fail (student sees no progress) | Align IDs: change ModuleProgress.complete() in module files to use "…" or update the hub MODULES array id to match | no findings | `_tools/eduscan/validators/syntax/heuristics.js:2871`, `_tools/eduscan/validators/syntax/heuristics.js:2919` |
| **HEUR-026** | high | Course module links to house root instead of course hub — file inside a course directory (courses/xxx/) has a back/home link that escapes to the house root instead of the course's own index.html | Change to "…" to link to the course hub instead of the house root | no findings | `_tools/eduscan/validators/syntax/heuristics.js:2989` |
| **HEUR-027** | high | Content link escapes to platform root — any file inside houses/ has an href that resolves above the house directory to the main platform dashboard (tenant isolation breach — students escape course context) | Remove or replace this link. Course content should link to its own hub index, not the platform root. | no findings | `_tools/eduscan/validators/syntax/heuristics.js:3062` |
| **HEUR-028** | high | ModuleProgress.complete() signature mismatch — call does not follow the (houseId, moduleId, options) pattern; first arg is not a recognized house ID, or second arg appears to be a score/number instead of a module ID string | Use ModuleProgress.complete(houseId, moduleId, { returnUrl: '../index.html' }) | no findings | `_tools/eduscan/validators/syntax/heuristics.js:3134`, `_tools/eduscan/validators/syntax/heuristics.js:3162`, +1 more |
| **HEUR-029** | suspect | Looks-clickable but isn't — non-anchor element styled as clickable (role="link"/"button", cursor:pointer + tabindex, onkeydown navigation, or href on non-anchor) with no onclick attribute AND no class/id wired up via JS addEventListener('click') or .onclick assignment; mouse clicks silently fail | Add onclick="..." matching intent, or convert <…> to <a href="..."> for navigation | no findings | `_tools/eduscan/validators/syntax/heuristics.js:3449` |
| **HEUR-030** | high | Course-hub tenant-leak — _app/houses/<h>/<c>/index.html has <a id="dashboardBtn"> but is missing the canonical TenantRouter rewrite IIFE. Tenant students clicking Dashboard leak to the house index (main hex) instead of their tenant dashboard. Detection requires BOTH `getElementById('dashboardBtn')` AND `TenantRouter.getUrl` present; if either is absent the rewriter isn't wired. HIGH (tenant-isola… | Add the canonical IIFE before </body>. See _app/houses/code/python-for-it/index.html (search "Tenant-aware Dashboard button") for the pattern. | no findings | `_tools/eduscan/validators/syntax/heuristics.js:3515` |
| **HEUR-030b** | high | Programmatic navigation to platform page without TenantRouter. Detects (window.)?location.href= / .assign() / .replace() pointing at an absolute /dashboard.html ¦ /sorting.html ¦ /index.html ¦ /unauthorized.html on tenant-context HTML, when the surrounding inline script has no TenantRouter check. Absolute path required (relative 'index.html' is course-hub-local navigation, not a leak — Nancy roun… | Wrap the redirect: var url = (typeof TenantRouter !== 'undefined' && TenantRouter.isActive()) ? TenantRouter.getUrl('…') : '…'; window.location.href = url; | no findings | `_tools/eduscan/validators/syntax/heuristics.js:3568` |
| **HEUR-030c** | high | PageTransition.navigateTo to platform page without TenantRouter. PageTransition.js has zero TenantRouter integration (verified 2026-06-05). Any tenant-context call like PageTransition.navigateTo('dashboard.html') leaks the student to main hex. Scope: HTML under _app/houses/ and _app/tenant/, excluding _app/tenant/dashboard-X.html files which are platform pages themselves. HIGH. Pure regression pr… | Compute url via TenantRouter first: var url = (typeof TenantRouter !== 'undefined' && TenantRouter.isActive()) ? TenantRouter.getUrl('…') : '…'; PageTransition.navigateTo(url); | no findings | `_tools/eduscan/validators/syntax/heuristics.js:3621` |
| **HEUR-030d** | high | form action or iframe src to platform page on tenant-context. TenantShell's runtime overrideLinks() ONLY rewrites anchor href elements (verified at TenantShell.js:390); form actions and iframe srcs are not in its scope. Targets: /dashboard.html, /sorting.html, /index.html, /unauthorized.html. HIGH. Pure regression protection (0 current findings). | Compute target via TenantRouter.getUrl('…') and set the attribute at runtime, OR convert to an <a href> so TenantShell's overrideLinks() rewrites it | no findings | `_tools/eduscan/validators/syntax/heuristics.js:3672` |
| **HEUR-030e** | high | Tenant-accessible HTML missing the TenantShell auto-loader chain AND has a leaking static href. Without AccessGuard.js / ModuleProgress.js / FirebaseAuth.js / TenantShell.js the runtime link rewriter is never injected, so every static href to a platform page leaks. Detection: file in scope + has leaking href + loads none of the 4 protectors. HIGH. Pure regression protection (0 current findings). | Add <script src="/components/AccessGuard.js"></script> (or another component in the auto-loader chain) to <head>. The chain auto-injects TenantShell which rewrites platform-page hrefs at runtime via overrideLinks(). | no findings | `_tools/eduscan/validators/syntax/heuristics.js:3719` |
| **HEUR-030f** | high | Hard-coded https://hexworth.com/ URL as a nav target on tenant-context page. Patterns: <a href>, <form action>, location.href/assign/replace inside un-guarded inline scripts, PageTransition.navigateTo inside un-guarded inline scripts. SEO meta (canonical/og:url/ld+json) and resource URLs (img/script/link src) NOT flagged — structurally excluded by tag anchors and content types. Variable-assignmen… |  | no findings | `_tools/eduscan/validators/syntax/heuristics.js:1462`, `_tools/eduscan/validators/syntax/heuristics.js:1504` |
| **HEUR-031** | critical | Empty slide-text wrapper. Slide page has `<div class="slide-text">` with <20 chars of non-whitespace content. Class of bug: depth-tracking regex during a slide rebuild missed the matching `</div>` boundary when slide-content had no nested divs, leaving the text wrapper empty. Caught on WSA m01 slides 6, 17, 20 (2026-05-29). CRITICAL: literal lost content. Detection: scan for `<div class="slide-te… | Restore the original text content inside the <div class="slide-text"> wrapper. Compare to a known-good slide pattern or to a prior commit. | no findings | `_tools/eduscan/validators/syntax/heuristics.js:4282` |
| **HEUR-032** | high | Broken webp icon reference. HTML references `/assets/images/icons/icon-NAME.webp` where the file does not exist on disk. Common typo source: plurality (`icon-gears` vs `icon-gear`) or synonyms (`icon-checklist` vs `icon-checkbox`). Caught on WSA m01 (2026-05-29). HIGH: visible broken-image fallback in the UI. Detection: extract every `icon-*.webp` ref from HTML, resolve against `_app/assets/image… | Check the icons directory for the closest match (singular vs plural, synonyms). Common fixes: icon-checklist → icon-checkbox; icon-gears → icon-gear. | no findings | `_tools/eduscan/validators/syntax/heuristics.js:4318` |
| **HEUR-033** | medium | SVG width-% keyframe overflow. CSS `@keyframes` definition contains `width: 100%` or similar percentage, and the animation class is applied to a `<rect>` or `<line>` inside an inline `<svg>`. SVG percentage widths resolve to the viewBox root, not the parent container, so the animated element overflows the intended bounds. Caught on WSA m01 slide 23 progress bars (2026-05-29). MEDIUM (visual overf… | Change the @keyframes to use transform: scaleX(0) → scaleX(1) instead of width 0 → 100%. Add transform-origin: left and transform-box: fill-box to the class. | no findings | `_tools/eduscan/validators/syntax/heuristics.js:4370` |
| **HEUR-034** | medium | Infinite opacity 0→1 keyframe causes flicker. `@keyframes` definition starts at `opacity: 0` and ends at `opacity: 1`, AND the applying class declares `animation: ... infinite`. Creates a fade-in / fade-out flicker loop because each cycle resets opacity to 0. Caught on WSA m01 slides 17 and 26 drop-in animations (2026-05-29). MEDIUM (UX issue). Detection: parse `@keyframes` for `0%.*opacity:\s*0`… | Change animation timing to 'forwards' instead of 'infinite' so the animation runs once and stays in its end state. Add 'opacity: 0' to the class as initial state. | 13 in 8 files | `_tools/eduscan/validators/syntax/heuristics.js:4422` |
| **HEUR-035** | high | Em-dash or double-hyphen in content. Per user style preference (memory `feedback_no_em_dashes`), neither the em-dash nor its ` -- ` substitute should appear in HTML content. Detection covers ALL FOUR encodings (literal U+2014, `&mdash;`, `&#8212;`, `&#x2014;`) plus ` -- ` with a space on both sides, counted outside `<style>`, `<script>`, `code-block` and `pre`. HIGH as of 2026-08-06 (was LOW, whi… | Replace " — " (or " -- ") with ", " for clause separation, or ": " when introducing an explanation. Do NOT swap one dash form for another: &mdash;, &#8212; and " -- " are all flagged. | 3222 in 3222 files | `_tools/eduscan/validators/syntax/heuristics.js:4484` |
| **HEUR-036** | medium | has-visual class without visual element. Slide has `class="slide has-visual"` but its `<div class="slide-visual">` is empty or contains neither an `<svg>` nor an `<img>` element. Indicates a partially-built slide where the visual half is missing — companion bug to HEUR-031 (empty text wrapper). Detection: find each `<div class="slide(?:\s+active)?\s+has-visual"...data-slide="N"...>` block (note:… | Add either an inline <svg> visualization or an <img src=".../*.webp"> reference inside the .slide-visual wrapper, or remove the has-visual class if the slide is intentionally text-only. | no findings | `_tools/eduscan/validators/syntax/heuristics.js:4602` |
| **HEUR-037** | low | <a target="_blank"> missing rel="noopener" (or rel="noreferrer" — per HTML spec noreferrer implies noopener). Tabnabbing risk via window.opener: new tab can redirect parent. Modern browsers (Chrome 88+, FF 79+, Safari 12.1+) default to implicit noopener but explicit attribute is HTML spec best practice. LOW severity — does NOT publish to Nexus triage queue per TRIAGE_SEVERITY_GATE=['critical','hi… | Add rel="noopener noreferrer" to the anchor tag. | no findings | `_tools/eduscan/validators/syntax/heuristics.js:1552` |
| **HEUR-038** | high | WSA presentation slide-layout contract violation. WSA cloud-presentation.module.html files must match m01/m02's flex-chain layout contract. Five fingerprints (verified against m01 + m02 source 2026-06-06): (a) `.slide-container` rule contains `flex: 1`, `min-height: 0`, `display: flex`, `flex-direction: column`; (b) `.slide` rule contains `flex: 1`, `min-height: 0` AND lacks `border-radius`, `bor… | Match m02 contract: .slide-container { flex:1; min-height:0; display:flex; flex-direction:column; position:relative; overflow:hidden; }, .slide { display:none; flex:1; min-height:0; padding:14px 36px; box-sizing:border-box; overflow:hidden; }, .slide-content { width:100%; max-width:1400px; flex:1;… | no findings | `_tools/eduscan/validators/syntax/heuristics.js:4723` |
| **HEUR-039** | high | WSA cat-contract `.has-visual .slide-text` content budget exceeded. Static companion to OVERFLOW-001b. For each `.slide.has-visual` div in a WSA cloud-presentation.module.html file, extracts the inner `.slide-text` body, strips HTML/entities/whitespace, and counts chars. Budget = 600 chars (empirical: m01/m02 reference deck's safe ceiling is 558c; boundary cases at 634-968c clip 14-53px at 1280×7… | Reduce … .slide-text content to ≤… chars, or split slide into two slides at a topic boundary. Cat-contract two-column grid gives ~217px tall text column at 1280×720; text above the budget clips silently (overflow:hidden on .slide). Companion rule OVERFLOW-001b confirms at render time. | no findings | `_tools/eduscan/validators/syntax/heuristics.js:4850` |
| **HEUR-040** | low | Duplicate attribute on the document root <html> tag. A duplicate attribute (e.g. `<html lang="en" lang="en">`) is an HTML parse error; browsers silently keep the first and discard the rest, so it renders fine but is invalid and signals a buggy generator or fix-script that added an attribute without guarding an existing one (BUG-019 was a one-off lang-adder doing exactly this across 10 pages). | Remove the duplicate … attribute so the <html> tag declares each attribute once. | no findings | `_tools/eduscan/validators/syntax/heuristics.js:4559` |
| **HEUR-041** | high | `window.<Component>` guard on a component declared as a top-level `const`/`let` in a classic script. Such a binding lives in the global LEXICAL environment and is NEVER a window property, so the guard is permanently false and the branch silently never runs. Resolves each component's real export form from its source (window./globalThis./self./root./global. all count as bridges) and only fires when… | Guard on the bare identifier: if (typeof … !== 'undefined' && …) { ... } | no findings | `_tools/eduscan/validators/syntax/heuristics.js:3328` |
| **HEUR-042** | high | Quiz answer LENGTH bias — the correct option is systematically the longest, so a student can score above chance by picking the wordiest answer without knowing the material. `assessment-testing-standard.md` section 1 names length as the first tell, and exists because an A+ midterm draft had correct-is-longest in 49 of 60 questions. Measured 2026-08-07 across 407 quizzes / 5,261 questions: 61.2% ag… | Rebalance option lengths, per assessment-testing-standard.md section 1: pad distractors with equally specific but WRONG justifications, and trim the verbose correct answer. Do not just shorten the correct option until it is shortest — that inverts the tell. Target is near chance (~…%), not zero. Me… | 237 in 237 files | `_tools/eduscan/validators/syntax/heuristics.js:4929` |
| **HEUR-COMPLETE-QUIZ-PCT** | high | ModuleProgress.completeQuiz() called with raw `score` count instead of `pct` percentage. The function internally evaluates `score >= passingScore` so a 12/15 score (80%) is checked as `12 >= 70 = false` and completion never persists. Fires when (a) file computes `var pct = Math.round(...)`, AND (b) 3rd arg of completeQuiz is a bare identifier that is NOT pct/percent/percentage/integer-literal/Mat… | Change the 3rd arg to "pct" (the percentage you already computed). Example: ModuleProgress.completeQuiz('<house>', '<id>', pct, { returnToDashboard: false }) | no findings | `_tools/eduscan/validators/syntax/heuristics.js:4146` |
| **HEUR-CTF-CFG-MISACCESS** | high | CTF lab config-state misaccess. | Change engine._… to engine.config._… in this command body. See _docs/operations/ctf-config-misaccess-bug-2026-05-09.md. | no findings | `_tools/eduscan/validators/syntax/heuristics.js:3849` |
| **HEUR-RESULT-BUTTON-STANDARD** | medium | Quiz results-card uses pre-standard buttons — `<button onclick="restartQuiz()">Try Again</button>` or `<a class="btn-hub">Back to <Course> Hub</a>`. New standard is `[Review Answers]` (calls showReviewAnswers()) + `[Return to Hub]`. Mixed state (Review Answers present alongside old buttons) also flags. MEDIUM (UX drift, no grading bug). | Replace with: <button class="btn-retry" onclick="showReviewAnswers()">Review Answers</button> and <a href="../index.html" class="btn-hub">Return to Hub</a>. Add a sibling #reviewCard div + showReviewAnswers()/backToScore() functions. Exemplar: _app/houses/divergent/ethics-it/quizzes/eth-w1.quiz.htm… | 46 in 46 files | `_tools/eduscan/validators/syntax/heuristics.js:4242` |

## HTML

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **HTML-001** | critical | Unclosed <…> tag - this will break page functionality | Add closing </…> tag | no findings | `_tools/eduscan/validators/syntax/html.js:257` |
| **HTML-003** | computed | Closing tag </…> without matching opening tag |  | no findings | `_tools/eduscan/validators/syntax/html.js:351` |
| **HTML-004** | low | Tag nesting error: closing </…> but <…> not closed | Close <…> before </…> | no findings | `_tools/eduscan/validators/syntax/html.js:371` |
| **HTML-005** | computed | Unclosed <…> tag |  | no findings | `_tools/eduscan/validators/syntax/html.js:405` |
| **HTML-006** | high | Unclosed quote in … attribute | Add closing quote to attribute value | no findings | `_tools/eduscan/validators/syntax/html.js:454` |
| **HTML-007** | medium | Duplicate id="…" (first at line …) | Rename one of the duplicate "…" IDs | no findings | `_tools/eduscan/validators/syntax/html.js:489` |
| **HTML-008** | low | Attribute "…" has = but no value | Add value for …= or remove the = | no findings | `_tools/eduscan/validators/syntax/html.js:529` |
| **HTML-009** | low | Missing <!DOCTYPE html> declaration | Add <!DOCTYPE html> at the start of the file | no findings | `_tools/eduscan/validators/syntax/html.js:552` |
| **HTML-010** | low | Missing <title> element in <head> | Add <title>Page Title</title> in <head> | no findings | `_tools/eduscan/validators/syntax/html.js:566` |
| **HTML-011** | computed | Closing tag </…> without matching opening tag |  | no findings | `_tools/eduscan/validators/syntax/html.js:183` |
| **HTML-012** | computed | Unclosed <…> tag |  | 1 in 1 file | `_tools/eduscan/validators/syntax/html.js:184` |

## HUB

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **HUB-001** | high, medium | Hub index references a moduleId via data-module that has no matching ContentCatalog entry (after house-prefix tolerance). Effect: hub renderer creates a card slot for a nonexistent module — students see broken/empty/silent-skip card. MEDIUM (visible to students). Stragglers branch found 503 such references across 30+ hubs (e.g., WSA hub uses 'm01'..'m19' short ids while catalog has 'wsa-module01'… | Either (a) update the data-module values to match catalog ids, OR (b) add aliases/short-id catalog entries pointing to the same content, OR (c) remove the dead card slots. Most common pattern: hub uses short navigation ids (m01, ch01, ccna-01) while catalog uses descriptive ids (wsa-module01, etc.)… | 1 in 1 file | `_tools/eduscan/validators/syntax/hub-refs.js:123` |

## ID

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **ID-001** | critical | Cross-house moduleId prefix (genuinely broken — wrong house) | Change moduleId to '…' | no findings | `_tools/eduscan/parsers/quiz.js:246` |

## JS

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **JS-001** | high, medium | Severely unbalanced … (off by …) | Remove … extra '…' | no findings | `_tools/eduscan/validators/syntax/js.js:117`, `_tools/eduscan/validators/syntax/js.js:182` |
| **JS-002** | high, medium | Unclosed function body | Add closing } for function | no findings | `_tools/eduscan/validators/syntax/js.js:132`, `_tools/eduscan/validators/syntax/js.js:172` |
| **JS-003** | low | Possible unterminated string literal | Check string termination with … | no findings | `_tools/eduscan/validators/syntax/js.js:261` |
| **JS-004** | low | Possible assignment in condition (= instead of ==) | Use == or === for comparison | no findings | `_tools/eduscan/validators/syntax/js.js:299` |
| **JS-005** | high | Detect forEach-style }); closing a for/for...of/for...in loop. | Replace }); with } — this for-loop is not a .forEach() callback | no findings | `_tools/eduscan/validators/syntax/js.js:367` |
| **JS-006** | high | Detect `await` inside non-async forEach/map/filter/reduce callback. | Add async to the .…() callback, or convert to a for...of loop | no findings | `_tools/eduscan/validators/syntax/js.js:470` |

## LP

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **LP-000** | critical | LearningPaths.js not found at … | Ensure LearningPaths.js exists in components/ | no findings | `_tools/eduscan/validators/syntax/learning-paths.js:217`, `_tools/eduscan/validators/syntax/learning-paths.js:232` |
| **LP-001** | high | Module href points to non-existent file |  | no findings | `_tools/eduscan/validators/syntax/learning-paths.js:320` |
| **LP-002** | warning | Path has no houseFolder and uses relative hrefs (design issue) |  | no findings | `_tools/eduscan/validators/syntax/learning-paths.js:268`, `_tools/eduscan/validators/syntax/learning-paths.js:301` |
| **LP-003** | info | Duplicate module IDs across paths |  | 101 in 1 file | `_tools/eduscan/validators/syntax/learning-paths.js:285` |
| **LP-004** | high | Broken prerequisite reference (prereq ID not found in any path) | Fix the prerequisite ID '…' in module '…' or add the missing module | no findings | `_tools/eduscan/validators/syntax/learning-paths.js:387` |
| **LP-005** | high | Circular prerequisite chain (DFS cycle detected) | Break the circular dependency in the chain: … | no findings | `_tools/eduscan/validators/syntax/learning-paths.js:406` |
| **LP-006** | low | LearningPaths module not found in ContentCatalog | Add module '…' to ContentCatalog.js or remove it from LearningPaths | 38 in 1 file | `_tools/eduscan/validators/syntax/learning-paths.js:443` |
| **LP-007** | low | ContentCatalog course module not in any LearningPath | Add module '…' to the appropriate learning path or mark it as standalone | 3587 in 1 file | `_tools/eduscan/validators/syntax/learning-paths.js:472` |
| **LP-008** | medium | Module type/href mismatch (e.g., type: 'quiz' but href in presentations/) | Change type to '…' or move the file to the correct directory | no findings | `_tools/eduscan/validators/syntax/learning-paths.js:341` |
| **LP-009** | high | courseHref points to non-existent file | Create the file at '…' or fix the courseHref path | no findings | `_tools/eduscan/validators/syntax/learning-paths.js:367` |
| **LP-010** | medium | Prerequisite module has non-available catalog status (blocks progression) | Set module '…' status to 'available' in ContentCatalog or remove it from the prerequisite chain | no findings | `_tools/eduscan/validators/syntax/learning-paths.js:497` |

## LT

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **LT-001** | critical | new LinuxTerminal() — crashes (not a constructor, it's an IIFE) | Replace "new LinuxTerminal(id, opts)" with "LinuxTerminal.init(moduleId, selector, opts)" | no findings | `_tools/eduscan/validators/syntax/linux-terminal.js:162` |
| **LT-002** | critical | .addCommand() — method doesn't exist in the API | Use LinuxTerminal.addFilesystem() for custom files and onCommand callback for detection | no findings | `_tools/eduscan/validators/syntax/linux-terminal.js:191` |
| **LT-003** | medium | File includes LinuxTerminal.js but never calls ModuleProgress.complete() | Add ModuleProgress.complete(houseId, moduleId, { returnUrl }) when all tasks are done | no findings | `_tools/eduscan/validators/syntax/linux-terminal.js:216` |
| **LT-004** | medium | Progress saves to nested .linuxMastery[] key (should be flat) | Change progress.script.linuxMastery["lm-XX"] to progress.script["script-lm-XX-name"] | no findings | `_tools/eduscan/validators/syntax/linux-terminal.js:238` |
| **LT-005** | medium | Phantom child in a root session's /root filesystem overlay. | Seed a node for … in addFilesystem(), or remove "…" from the … children array. | no findings | `_tools/eduscan/validators/syntax/linux-terminal.js:134` |

## MATH

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **MATH-001** | suspect | Unguarded parseInt() — missing fallback for NaN. | Add fallback: (parseInt(value, 10) ¦¦ 0) | 8 in 8 files | `_tools/eduscan/validators/syntax/heuristics.js:498` |

## META

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **META-001** | not stated | Self-check: every validator file declares a code that's in this doc |  | ran clean | `_tools/eduscan/meta-rule-registry-audit.js:203` |
| **META-001-NO-CODE** | medium | Validator file does not declare a rule code in its JSDoc header. Add a code (e.g., "BOX-XXX") to the header or add to OPT_OUT_FILES in meta-rule-registry-audit.js. |  | 19 in 19 files | `_tools/eduscan/meta-rule-registry-audit.js:168` |
| **META-001-UNREGISTERED** | high | Validator file exists with a rule code but no registry entry. | Add a one-line entry to _docs/operations/safety-net-architecture.md describing what … does, what it catches, and which stage it runs at. | ran clean | `_tools/eduscan/meta-rule-registry-audit.js:187` |
| **META-002** | not stated | Self-check: every code in this doc has a validator file that implements it (inverse of META-001) |  | ran clean | `_tools/eduscan/meta-orphan-registry-audit.js:158` |
| **META-002-ORPHAN-DOC-ENTRY** | high (per comment) | Code documented but no implementation. |  | ran clean | `_tools/eduscan/meta-orphan-registry-audit.js:146` |
| **META-003** | not stated | Self-check: every Stage-3 validator file (BOX-*, META-*) is wired into the smoke gate's BOX_VALIDATORS array |  | ran clean | `_tools/eduscan/meta-smoke-wiring-audit.js:152` |
| **META-003-NO-CODE-DECLARED** | not stated | Self-check: every Stage-3 validator file (BOX-*, META-*) is wired into the smoke gate's BOX_VALIDATORS array |  | ran clean | `_tools/eduscan/meta-smoke-wiring-audit.js:120` |
| **META-003-NOT-WIRED** | high (per comment) | Validator exists + documented but not in the smoke gate's BOX_VALIDATORS array. |  | ran clean | `_tools/eduscan/meta-smoke-wiring-audit.js:138` |

## NAME

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **NAME-001** | high | File doesn't follow naming convention | Rename to: … | no findings | `_tools/eduscan/validators/syntax/naming.js:443`, `_tools/eduscan/validators/syntax/naming.js:562` |
| **NAME-002** | medium | File has wrong type suffix | Rename to: … | 57 in 57 files | `_tools/eduscan/validators/syntax/naming.js:372`, `_tools/eduscan/validators/syntax/naming.js:393`, +1 more |
| **NAME-003** | low | File missing house prefix Note: The source comment says medium; the code sets low. | Rename to: … | 673 in 673 files | `_tools/eduscan/validators/syntax/naming.js:285`, `_tools/eduscan/validators/syntax/naming.js:562` |
| **NAME-004** | low | File uses wrong case (camelCase/PascalCase instead of kebab-case) | Rename to: … | no findings | `_tools/eduscan/validators/syntax/naming.js:229`, `_tools/eduscan/validators/syntax/naming.js:562` |

## NAV

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **NAV-001** | medium | Content page has no back/return navigation | Add a back button linking to the parent house index (e.g., href="../index.html") | 6 in 6 files | `_tools/eduscan/validators/syntax/navigation.js:144` |
| **NAV-002** | medium | House/course index page has no dashboard link | Add a link back to the dashboard (e.g., href="../../dashboard.html") | 2 in 2 files | `_tools/eduscan/validators/syntax/navigation.js:189` |
| **NAV-003** | high | Content page inside a course subdirectory has returnUrl that skips course home | Change returnUrl from '../../index.html' to '../index.html' to return to the course home | no findings | `_tools/eduscan/validators/syntax/navigation.js:242`, `_tools/eduscan/validators/syntax/navigation.js:257` |
| **NAV-004** | high | Path card in house index has no href but a hub directory exists for it | Add href: 'modules/…/index.html' to the path entry | no findings | `_tools/eduscan/validators/syntax/navigation.js:317` |

## OVERFLOW

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **OVERFLOW-001** | medium | Slide … content overflows container by …px (rendered …px in …px container at …×…). Bottom of slide content is silently clipped. | Split slide … into multiple smaller slides, OR reduce content density (text/font/spacing) so rendered content fits within …px at 1280×720. | not run | `_tools/eduscan/validators/functional/slide-overflow.js:121` |
| **OVERFLOW-001b** | high | … inner content overflows .slide-content by …px (rendered …px in …px container at …×…). Cat-contract sets overflow:hidden on .slide — clipped content is invisible to students. | Split … into 2+ smaller slides keyed by topic boundary (one concept per slide per slide_design_pattern.md), or reduce content density. The cat-contract clips silently; students lose the bottom …px of every render. | not run | `_tools/eduscan/validators/functional/slide-overflow-b.js:144` |

## PALETTE

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **PALETTE-001** | high | CSS variable value doesn't match official palette | Change …: … → … | no findings | `_tools/eduscan/validators/syntax/palette.js:166` |
| **PALETTE-002** | medium | Missing required CSS variable in house page | Add …: …; | no findings | `_tools/eduscan/validators/syntax/palette.js:150` |
| **PALETTE-003** | high | House page missing :root color block entirely | Add :root { --house-primary: …; ... } to <style> | no findings | `_tools/eduscan/validators/syntax/palette.js:132` |

## PARSE

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **PARSE-ERR** | warning | Parser '…' failed: … |  | no findings | `_tools/eduscan/parsers/index.js:89` |

## PATH

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **PATH-001** | high | Script not found: … |  | no findings | `_tools/eduscan/validators/syntax/paths.js:591` |
| **PATH-002** | medium | Stylesheet not found: … |  | no findings | `_tools/eduscan/validators/syntax/paths.js:655` |
| **PATH-003** | low | Image not found: … |  | 8 in 8 files | `_tools/eduscan/validators/syntax/paths.js:709` |
| **PATH-004** | low | Linked page not found: … |  | 41 in 4 files | `_tools/eduscan/validators/syntax/paths.js:769` |
| **PATH-005** | medium | Dynamic import target not found: … |  | no findings | `_tools/eduscan/validators/syntax/paths.js:835` |
| **PATH-ANCHOR-001** | high | Path targets wrong directory: expected '…/', resolves to '…/…' | Change path to: … | no findings | `_tools/eduscan/validators/syntax/paths.js:434` |
| **PATH-DEPTH-001** | high | Insufficient path depth for …: … (needs … levels, has …) | Change path to: … | no findings | `_tools/eduscan/validators/syntax/paths.js:369` |
| **PATH-DEPTH-002** | high | Excessive path depth (overshoot): … levels, expected … for … | Change path to: … | no findings | `_tools/eduscan/validators/syntax/paths.js:400` |
| **PATH-DUP-001** | high | Doubled path segment '…' — resolves to wrong location (404) | Change path to: … | no findings | `_tools/eduscan/validators/syntax/paths.js:502`, `_tools/eduscan/validators/syntax/paths.js:540` |
| **PATH-IDX-001** | medium | Check for content directories missing index.html | Create …/index.html or add a redirect | 2 in 2 files | `_tools/eduscan/validators/syntax/index.js:597` |

## PROG

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **PROG-001** | critical | localStorage.getItem('hexworth_progress_' + ...) — individual key reads. Nothing writes these keys; ModuleProgress.complete() and ProgressManager.completeModule() both write to the nested hexworth_progress[houseId][moduleId] blob. Progress bar stuck at 0%. | Read from the nested blob: JSON.parse(localStorage.getItem('hexworth_progress') ¦¦ '{}')[houseId][moduleId] | no findings | `_tools/eduscan/validators/syntax/progress-keys.js:89` |
| **PROG-002** | critical | ModuleProgress.complete('moduleId', 'url') — 2-arg call missing houseId. The API is complete(houseId, moduleId, options). With 2 args, moduleId lands in houseId position and the URL in moduleId, writing to a nonsense key like hexworth_progress['cloud-openstack-intro']['../index.html']. | ModuleProgress.complete('HOUSE_ID', '…', { returnUrl: '…' }) | no findings | `_tools/eduscan/validators/syntax/progress-keys.js:139` |
| **PROG-003** | critical, medium | Cross-file shared (houseId, moduleId) keys. Multiple distinct content files call ModuleProgress.complete('HOUSE', 'KEY', ...) with the same KEY. Harm: ModuleProgress.isFirstCompletion uses bare moduleId (without house), so only the first file's completion pushes XP/badges to Firestore — subsequent completions are silently suppressed. Confirmed bugs: WSA cloud-guilab (17 files), cloud-pslab (17 fi… | Use module-scoped keys per file. Pattern: '…-COURSE-PARENT-MODULE' where each parent module has a unique slug. E.g., 'cloud-wsa-m04-guilab' instead of shared 'cloud-guilab'. | 13 in 13 files | `_tools/eduscan/validators/syntax/progress-keys.js:258` |
| **PROG-003-DRIFT** | medium | Allowlisted progress-key pair has drifted. The (…, …) collision was previously approved as intentional, but the file set no longer matches the allowlist entry. … If the new file set is intentional, update _tools/eduscan/config/prog003-allowlist.json (and document why). If unintentional, fix the new… |  | no findings | `_tools/eduscan/validators/syntax/progress-keys.js:243` |

## QUIZ

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **QUIZ-001** | high | Quiz uses QuizEngine with serverGrading but still has client-side correct: fields (answer leak — redundant answers exposed) | Remove all correct: fields from questions — server-side gradeQuiz CF has the answers in Firestore | no findings | `_tools/eduscan/validators/syntax/heuristics.js:1368` |
| **QUIZ-002** | high, medium | Quiz uses QuizEngine WITHOUT serverGrading and has client-side correct: fields (answers fully exposed via View Source) |  | no findings | `_tools/eduscan/validators/syntax/heuristics.js:1381` |
| **QUIZ-002b** | high, medium | inline-graded quiz with ans:N pattern (QC-57 Pattern A — sub-variants A1 quoted "ans":N and A2 unquoted ans:N as a line-start object property). Files (.quiz.html OR .exam.html) that don't use QuizEngine but have inline `selectAnswer(idx) { if (idx === q.ans) ... }` grading. QUIZ-002 misses these because it requires QuizEngine. Severity HIGH (MEDIUM via practice-mode marker, same demotion as QUIZ-… | Refactor to QuizEngine + serverGrading: true. Seed answers to Firestore quiz_keys/. See _docs/operations/qc-57-client-grading-inventory.md for the QC-57 sprint plan. | no findings | `_tools/eduscan/validators/syntax/heuristics.js:1619` |
| **QUIZ-003** | critical | Quiz uses QuizEngine WITHOUT serverGrading and has NO correct: fields (quiz grades 0% — broken, no answers anywhere) | Add serverGrading: true and houseId, then seed answers to Firestore quiz_keys/ | no findings | `_tools/eduscan/validators/syntax/heuristics.js:1396` |
| **QUIZ-004** | critical | Quiz REGRESSION — file was server-graded in baseline but serverGrading is now missing (an edit reverted the fix) | Restore serverGrading: true and houseId to the QuizEngine config. Check git log for what changed. | no findings | `_tools/eduscan/validators/syntax/heuristics.js:1671`, `_tools/eduscan/validators/syntax/heuristics.js:1685` |
| **QUIZ-005** | critical, high | Quiz KEY MISMATCH — answer key count doesn't match question count, or answer index is out of range for a question's options | Add answer key to functions/quiz_keys.json for "…" | no findings | `_tools/eduscan/validators/syntax/heuristics.js:1745`, `_tools/eduscan/validators/syntax/heuristics.js:1764`, +1 more |
| **QUIZ-006** | high | Custom inline quiz calls gradeQuiz Cloud Function but has no matching key in quiz_keys.json — server grading will return "Quiz key not found" | Add answer key to functions/quiz_keys.json for "…" and push to Firestore with push-quiz-keys.js | no findings | `_tools/eduscan/validators/syntax/heuristics.js:1891` |
| **QUIZ-007** | high | quiz_keys.json questionCount field disagrees with actual question count in HTML — keys are stale or drifted after question add/remove | Update quiz_keys.json: set questionCount to … for "…" and verify answers array length matches. Then push to Firestore. | no findings | `_tools/eduscan/validators/syntax/heuristics.js:1969` |
| **QUIZ-008** | medium | Answer key has skewed distribution — one index exceeds 35% in 10+ question quiz or >2 of same index in 5-question quiz. Students can pattern-exploit without reading questions. | Reorder options in quiz HTML so correct answers are evenly distributed across indices 0-3, then update quiz_keys.json to match | 421 in 421 files | `_tools/eduscan/validators/syntax/heuristics.js:2055` |
| **QUIZ-009** | high | Broken quiz grading — q.correct referenced but field missing | Add correct: N (0-indexed) to each question object, or migrate to QuizEngine with serverGrading | no findings | `_tools/eduscan/validators/syntax/heuristics.js:2176` |
| **QUIZ-010** | high | Quiz HTML has unparseable JavaScript in the questions block | Inspect the questions array for over-escaped apostrophes (`\\'` → `\'`) or other JS syntax errors. Verify with: `new Function(questionsBlock)` in node REPL. | no findings | `_tools/eduscan/validators/syntax/heuristics.js:2222` |
| **QUIZ-011** | high | Answer key matches CLASSIC-CYCLING placeholder pattern (i%4 cycle [0,1,2,3,0,1,2,3,...]). Bypasses QUIZ-008's skew threshold because distribution is perfectly even (~25% per index). Complements QUIZ-008 with zero double-fire — fires only on CLASSIC-CYCLING; ALL-ZEROS/ALL-SAME/PERIOD-CYCLING are caught by QUIZ-008 already. | Replace placeholder answers in functions/quiz_keys.json with real answers from the quiz HTML or solutions doc. Karl Mode-2 verify before reseeding to Firestore. | no findings | `_tools/eduscan/validators/syntax/heuristics.js:2142` |
| **QUIZ-011B** | high | Answer key for "…" was Karl-PASS allowlisted at … but the static array has changed since (hash drift). Re-audit required. | Re-run Karl Mode-2 on "…" against … (Confluence …). On PASS, update _tools/eduscan/config/quiz-011-allowlist.json with the new answerHash. | no findings | `_tools/eduscan/validators/syntax/heuristics.js:2130` |

## REG

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **REG-001** | warning | Content file is not registered in content-registry.js | Add entry to content-registry.js | 936 in 936 files | `_tools/eduscan/validators/index.js:193` |
| **REG-002** | warning | Registry entry '…' has no matching file | Remove entry from content-registry.js or create the file | no findings | `_tools/eduscan/validators/index.js:226` |
| **REG-ORPHAN-001** | critical | Registry declares '…' but file is missing: … | Remove entry '…' from content-registry.js OR restore the missing file | no findings | `_tools/eduscan/validators/orphans.js:346` |

## SANDBOX

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **SANDBOX-001** | low, info | SandboxLauncher.js loaded but renderButton never called (dead script) | Either add SandboxLauncher.renderButton() call or remove the script tag | 3 in 3 files | `_tools/eduscan/validators/syntax/sandbox.js:120`, `_tools/eduscan/validators/syntax/sandbox.js:303` |
| **SANDBOX-002** | critical | SandboxLauncher.renderButton called but SandboxLauncher.js not loaded | Add <script src="...SandboxLauncher.js"></script> before the renderButton call | no findings | `_tools/eduscan/validators/syntax/sandbox.js:132` |
| **SANDBOX-003** | high | Unknown lab ID in renderButton call (not in LAB_INFO) | Add "…" to LAB_INFO in SandboxLauncher.js and LABS in lab-manager/server.js | no findings | `_tools/eduscan/validators/syntax/sandbox.js:145`, `_tools/eduscan/validators/syntax/sandbox.js:288` |
| **SANDBOX-004** | high | FirebaseAuth.js not loaded before SandboxLauncher.js (missing dependency) | Add <script src="...FirebaseAuth.js"></script> before SandboxLauncher.js | no findings | `_tools/eduscan/validators/syntax/sandbox.js:158` |
| **SANDBOX-005** | high | SandboxLauncher.js loaded after page renderer (ArcticEngine, etc.) — may be wiped | Move SandboxLauncher.js script tag before … | no findings | `_tools/eduscan/validators/syntax/sandbox.js:174` |
| **SANDBOX-006** | medium | sandbox-mount div exists but renderButton never targets it | Add SandboxLauncher.renderButton(mount, labId) or remove the mount div | no findings | `_tools/eduscan/validators/syntax/sandbox.js:188` |
| **SANDBOX-007** | medium | renderButton called but no sandbox-mount container found in static HTML | Add <div id="sandbox-mount"></div> to the page | 8 in 8 files | `_tools/eduscan/validators/syntax/sandbox.js:201` |
| **SANDBOX-008** | critical, high | iframe sandbox attribute missing permissions required for ttyd terminal interaction | Add … to the iframe sandbox attribute, or remove the sandbox attribute entirely for trusted sandbox content | no findings | `_tools/eduscan/validators/syntax/sandbox.js:328`, `_tools/eduscan/validators/syntax/sandbox.js:340` |
| **SANDBOX-009** | critical, high | ttyd entrypoint uses --max-clients (causes WebSocket rejection via reverse proxy) | Remove --max-clients from ttyd launch flags | no findings | `_tools/eduscan/validators/syntax/sandbox.js:356`, `_tools/eduscan/validators/syntax/sandbox.js:393` |
| **SANDBOX-010** | critical | ttyd entrypoint uses --title-fixed (invalid flag in ttyd 1.7.x, breaks command parsing) | Replace --title-fixed "Title" with -t titleFixed=Title | no findings | `_tools/eduscan/validators/syntax/sandbox.js:407` |
| **SANDBOX-011** | high | ttyd --ping-interval missing or too high (Cloudflare drops idle WS at 100s) | Add --ping-interval 10 to ttyd launch command | no findings | `_tools/eduscan/validators/syntax/sandbox.js:423`, `_tools/eduscan/validators/syntax/sandbox.js:434` |
| **SANDBOX-012** | medium | ttyd -t titleFixed in entrypoint (incompatible across Alpine/Ubuntu ttyd builds) | Remove -t titleFixed flag — it is not needed and causes cross-platform issues | no findings | `_tools/eduscan/validators/syntax/sandbox.js:448` |
| **SANDBOX-013** | high | Traefik docker-compose missing readTimeout=0s (kills long-lived WebSocket connections) | Add --entrypoints.web.transport.respondingTimeouts.readTimeout=0s to Traefik command | no findings | `_tools/eduscan/validators/syntax/sandbox.js:465` |

## SCOPE

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **SCOPE-001** | high | Detect const/let IIFE at script top-level with window.Name access. | Change "… = ..." to "var … = ..." for window-level access | no findings | `_tools/eduscan/validators/syntax/js.js:536` |

## SEC

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **SEC-001** | high | flag{...} patterns — arena box flags exposed client-side | Move flag validation to server-side (Cloud Functions) or hash the flag value | no findings | `_tools/eduscan/validators/security/client-secrets.js:231` |
| **SEC-002** | high | Hardcoded password assignments (const password = '...') | Move password validation to server-side or use a hash comparison | no findings | `_tools/eduscan/validators/security/client-secrets.js:336` |
| **SEC-003** | medium | successCheck/defenseCheck function definitions in HTML | Move challenge validation to a Cloud Function or use hashed answer comparison | no findings | `_tools/eduscan/validators/security/client-secrets.js:399` |
| **SEC-004** | medium | acceptedAnswers arrays with plaintext strings | Hash accepted answers and compare against hashed student input | no findings | `_tools/eduscan/validators/security/client-secrets.js:459` |
| **SEC-010** | high | firestore.rules permits a client … on "…", and a Cloud Function writes the same path. Any validation that function performs is bypassable — the client can write the document directly. | Remove the client write (Firestore denies by default) and route all writes through the Cloud Function, as tenants/{id}/classes/{classId} now does. | not run | `_tools/eduscan/validators/security/rules-bypass.js:143` |
| **SEC-011** | medium | VERB ASYMMETRY on "…": create is scoped to request.auth.uid but update is not. Whoever wrote this understood ownership mattered and applied it to one verb only — the edt_submissions defect exactly, where any user could forge a grade on another student's submission. | Scope update the same way create is scoped, or close it to Cloud Functions. | not run | `_tools/eduscan/validators/security/rules-bypass.js:169` |
| **SEC-012** | medium | DUAL WRITER on users.…: it is in the client update allowlist AND written by a Cloud Function. Last write wins, so the stored value depends on which writer ran most recently — and routine drift makes a forged value indistinguishable from an honest one. | Decide which writer owns …. If the server derives it, remove it from the allowlist AND remove the client write in the SAME change — a hasOnly() check evaluates the whole write, so a leftover client write would reject its entire patch, breaking whatever else it carries. | not run | `_tools/eduscan/validators/security/rules-bypass.js:230` |

## SEM

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **SEM-001** | low | Heading hierarchy skip (e.g., h1 → h3 without h2) [LOW] (Downgraded from HIGH — heading skips affect accessibility but don't cause rendering failures. 1,625 findings across the content library; fixing all would be a large refactor for minimal educational impact.) | Add an h… heading before this h…, or change this to h… | 818 in 537 files | `_tools/eduscan/validators/syntax/semantic.js:174` |
| **SEM-002** | medium | Multiple h1 elements on a single page [MEDIUM] | Change this h1 to h2 or another appropriate heading level | 5 in 3 files | `_tools/eduscan/validators/syntax/semantic.js:259` |
| **SEM-003** | medium | Missing h1 element on page [MEDIUM] | Add an h1 element for the page's main title | 7 in 7 files | `_tools/eduscan/validators/syntax/semantic.js:299` |
| **SEM-004** | low | Missing main landmark [LOW] | Wrap the primary content in a <main> element | no findings | `_tools/eduscan/validators/syntax/semantic.js:326` |
| **SEM-005** | low | Navigation list not using semantic list elements [LOW] | Wrap navigation links in <ul> with <li> elements | no findings | `_tools/eduscan/validators/syntax/semantic.js:359` |

## SKILL

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **SKILL-MAP-001a** | high | Skill Map file has malformed YAML or missing required fields | Fix YAML syntax errors. See spec at _docs/operations/dr-hex-lab-skill-map.md | not run | `_tools/eduscan/validators/syntax/skill-map.js:122`, `_tools/eduscan/validators/syntax/skill-map.js:134`, +10 more |
| **SKILL-MAP-001b** | computed | Lab in ContentCatalog has no matching Skill Map (MEDIUM during rollout, HIGH after) | Author a Skill Map per _docs/operations/dr-hex-lab-skill-map.md §3 | not run | `_tools/eduscan/validators/syntax/skill-map.js:88` |
| **SKILL-MAP-001c** | high | Skill Map file exists but its lab_id does not match the filename | Rename the file to ….yaml or change lab_id to … | not run | `_tools/eduscan/validators/syntax/skill-map.js:161` |
| **SKILL-MAP-001d** | high | Skill Map declares allowed_help_levels missing Level 0 |  | not run | `_tools/eduscan/validators/syntax/skill-map.js:246` |
| **SKILL-MAP-001e** | medium | transfer_prompt does not end with '?' |  | not run | `_tools/eduscan/validators/syntax/skill-map.js:290` |

## SYNC

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **SYNC-003** | critical | houseId should be valid | Change houseId to '…' | no findings | `_tools/eduscan/parsers/quiz.js:269` |
| **SYNC-004** | high | houseId should match path house | Change houseId to '…' | no findings | `_tools/eduscan/parsers/quiz.js:290` |
| **SYNC-005** | warning | saveProgress house mismatch | Change saveProgress first argument to '…' | no findings | `_tools/eduscan/parsers/presentation.js:160` |
| **SYNC-006** | warning | houseId mismatch for lab | Change houseId to '…' | no findings | `_tools/eduscan/parsers/lab.js:109` |

## TAG

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **TAG-001** | medium | Case-variant tags. The same tag exists in 2+ casings (e.g., 'siem' AND 'SIEM'). Breaks tag-based filtering — searching for 'siem' misses 'SIEM'-tagged modules. Fix: lowercase canonicalization (already applied to current catalog as of Stragglers 2026-04-30). MEDIUM. Auto-fixable. | Canonicalize to lowercase. Already auto-fixed on Stragglers branch via tag-array regex pass. | no findings | `_tools/eduscan/validators/syntax/tags.js:53` |
| **TAG-002** | info | Modules with no tags. Discoverability hole — module won't surface in tag-based search or topic filtering. Currently 2564 of 3020 (~85%) lack tags entirely. Large-scope content cleanup; flagged as INFO not blocker. | Add tags to high-traffic modules first (per house: top 10 by completion). Bulk back-fill not necessary if existing search/filter UX surfaces ids and titles. | 1 in 1 file | `_tools/eduscan/validators/syntax/tags.js:68` |

## TRACK

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **TRACK-001** | medium | trackProgress disabled | Set trackProgress: true if completion should be tracked | no findings | `_tools/eduscan/parsers/quiz.js:356` |
| **TRACK-002** | warning | Presentation without progress tracking | Add saveProgress() call or ProgressManager.completeModule() to track completion | 25 in 25 files | `_tools/eduscan/parsers/presentation.js:149` |
| **TRACK-003** | warning | Lab without progress tracking | Add ProgressManager.completeModule() call to track lab completion | no findings | `_tools/eduscan/parsers/lab.js:87` |
| **TRACK-004** | info | Applet without progress tracking | Add ProgressManager.completeModule() if completion should be tracked | 229 in 229 files | `_tools/eduscan/parsers/applet.js:122` |

## TURTLE

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **TURTLE-001** | high | Opaque background on Skulpt canvas children | Remove background from .turtle-canvas-container canvas, or use background: transparent. The container div provides the dark background. | no findings | `_tools/eduscan/validators/syntax/turtle.js:111` |
| **TURTLE-002** | medium | Textarea default code with leading whitespace | Dedent the textarea content so code starts at column 0, or use white-space: pre with properly left-aligned code. | no findings | `_tools/eduscan/validators/syntax/turtle.js:168` |

## UX

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **UX-001** | suspect | Dynamic visual element insertion without viewport scroll | Add element.scrollIntoView({ behavior: "smooth", block: "center" }) after insertion | 10 in 10 files | `_tools/eduscan/validators/syntax/ux.js:122` |

## XP

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **XP-001** | high, low | Duplicate XP rate constant — file defines own rate table instead of referencing XPCalculator.XP_RATES |  | no findings | `_tools/eduscan/validators/syntax/xp-audit.js:78` |
| **XP-002** | high | Hardcoded XP in FieldValue.increment() — bypasses central rate config | Replace hardcoded … with reference to XP_RATES | no findings | `_tools/eduscan/validators/syntax/xp-audit.js:97` |
| **XP-003** | high | Quiz perfect threshold === 100 (should be >= 90) | Change === 100 to >= 90 for perfect score threshold | no findings | `_tools/eduscan/validators/syntax/xp-audit.js:117` |
| **XP-004** | critical | setUserProfile writing xp: without Math.max guard — can overwrite higher values | Wrap xp value with Math.max(currentXP, newXP) before writing | no findings | `_tools/eduscan/validators/syntax/xp-audit.js:139` |

## XREF

| Code | Severity | What it checks | How to fix | Latest run | Source |
|---|---|---|---|---|---|
| **XREF-001** | high | ID mismatch between progress.js MODULES and hub data-module attrs | Either remove '…' from MODULES in …, or add a card with data-module="…" to … | not run | `_tools/eduscan/validators/syntax/xref.js:81`, `_tools/eduscan/validators/syntax/xref.js:96` |
| **XREF-002** | medium | quiz_keys.json entry has zero HTML callsites in _app/ | Investigate: was the quiz removed/never-built? If yes, schedule deletion (Firestore doc + static entry) under Nancy + operator review. If no, locate missing HTML grading callsite. | last ran 2026-08-19 | `_tools/eduscan/quiz-key-callsite-audit.js:144`, `_tools/eduscan/quiz-key-callsite-audit.js:175` |
| **XREF-003** | not stated | Signal Guides Coverage Audit |  | last ran 2026-05-17 | `_tools/eduscan/signal-guides-coverage-audit.js:319` |
| **XREF-003.A** | high | MISSING_GUIDE (high — student-visible) |  | last ran 2026-05-17 | `_tools/eduscan/signal-guides-coverage-audit.js:265` |
| **XREF-003.B** | medium | DEAD_GUIDE (medium — dead code, not student-visible) |  | last ran 2026-05-17 | `_tools/eduscan/signal-guides-coverage-audit.js:275` |
| **XREF-003.C** | low | THIN_GUIDE (low — informational) |  | last ran 2026-05-17 | `_tools/eduscan/signal-guides-coverage-audit.js:285` |
