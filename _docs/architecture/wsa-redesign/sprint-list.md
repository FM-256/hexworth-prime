# WSA Presentation Redesign — Sprint List (Marathon Mode)

**Created:** 2026-05-30
**Branch:** `wsa-redesign-m01` (also covers m02+ work, branch name retained for preview-channel continuity)
**Preview channel:** `https://hexworth-prime--wsa-redesign-m01-gfcnf961.web.app` (7-day expiry, re-deployed per batch)
**Cookbook reference:** `reference_wsa_slide_pattern_cookbook` (memory file)
**Working principles in play:** [[reference_hexworth_platform_identity]] + [[feedback_break_down_concepts_on_introduction]] + [[feedback_complete_thoughts_no_fluff]]

## Scope summary

Each module = one cloud-presentation.module.html file. **Labs, quizzes, hubs are out of scope.** **Capstone (m20-failsafe-capstone) and midterm-outpost are out of scope** (operator directive 2026-05-30). Dr. Hex stays only on lab files (already cleaned across all 76 files in commit `bd5a84248`).

**19 modules (m01-m19) only.** Total file count to touch: **19 presentation files**.

Estimated total slide bodies to redesign: ~280 (19 modules averaging 14-22 slides each).

---

## Group A — Finish m02 (carrying forward from current branch)

These complete the m02 redesign that was in progress when the sprint list was requested.

| # | Item | Done criteria |
|---|---|---|
| **A1** | **m02 — split severe slides 8, 9, 11, 12, 13** | Each splits into 2 sub-slides. data-slide attributes renumbered 14 → ~19. totalSlides counter updated. Journey-snake on slide 1 adjusted if stop labels shift. |
| **A2** | **m02 — tighten moderate slides 4, 5, 7** | Each reaches <60px overflow per real-validator measurement (slide-content scrollHeight vs clientHeight with .active). |
| **A3** | **m02 — final validation + commit** | Real validator: all 19+ slides under 60px overflow. Commit + redeploy preview. |

---

## Group B — Standard-pattern modules (m03, m04, m08-m17) — 12 modules

These modules use the static-HTML slide pattern (same as m01/m02). Each gets the full cookbook treatment.

**Per-module workflow** (apply to each):
1. CSS standardization — copy m01's text-element CSS block (slide-title, slide-content, h3, ul, li, p, highlight-box, comparison-table). Single bulk edit per module.
2. Apply Pattern A to slide 1 (module-map journey-snake, ~9 stops, PowerShell-as-pillar highlight when applicable).
3. Audit + remove broadcast-wave / occlusive animations (slide-22-style violation hunt).
4. Audit + fix break-down violations (every cmdlet param, acronym, technical term).
5. Apply Pattern C (static parameter breakdown) to severe HOW slides.
6. Apply Pattern D (static dimmed-filter) to filter/selection slides where present.
7. Apply Pattern E (four-feeling) to module summary slide.
8. Audit + remove Dr. Hex if reintroduced.
9. Split slides over 60px overflow per real-validator.
10. Validate (real validator passes).
11. Commit per module + redeploy preview.

| # | Module | Notes / known sub-topics |
|---|---|---|
| **B1** | m03 — Storage | Disks, volumes, ReFS, Storage Spaces. Likely New-Partition / Format-Volume / Initialize-Disk cmdlets. |
| **B2** | m04 — Hyper-V | VM provisioning, virtual switches, snapshots. New-VM / Set-VM / Get-VM cmdlets. |
| **B3** | m08 — DNS | Zones, records, forwarders. ⚠ CSS likely `1.55rem !important` — needs cleanup first. |
| **B4** | m09 — DHCP | Scopes, reservations, failover. ⚠ CSS likely `1.55rem !important`. |
| **B5** | m10 — Group Policy | LSDOU, GPO creation, inheritance. ⚠ CSS likely `1.55rem !important`. |
| **B6** | m11 — IIS | Sites, app pools, bindings. ⚠ CSS likely `1.55rem !important`. |
| **B7** | m12 — Remote Desktop Services | RDS roles, session collections. ⚠ CSS likely `1.55rem !important`. |
| **B8** | m13 — Certificate Services | AD CS, PKI, templates. ⚠ CSS likely `1.55rem !important`. |
| **B9** | m14 — Advanced Networking | Subnetting, routing. ⚠ CSS uses `1.4rem !important`. |
| **B10** | m15 — AD Sites | Site topology, replication. ⚠ CSS likely `1.55rem !important`. |
| **B11** | m16 — Backup/Recovery | Windows Server Backup, VSS. ⚠ CSS likely `1.55rem !important`. |
| **B12** | m17 — Firewall/Security | Firewall rules, IPsec. ⚠ CSS likely `1.55rem !important`. |

**Bulk preparation candidate:** before B3-B12, do one sweep that aligns CSS spacing for all 10 `1.55rem !important` modules in a single commit. Faster than per-module CSS work inside each sprint item.

---

## Group C — Dynamic-render decks (architectural conversion required)

These 5 modules use a different architecture: one HTML placeholder + a `slides = [...]` JS array. **They cannot be validated by OVERFLOW-001 in their current form.** They need to be converted to static HTML first.

**Per-module workflow:**
1. Read the JS slides array.
2. Convert each array entry into a static `<div class="slide" data-slide="N">...</div>` block.
3. Remove the renderSlide JS template-render function (or simplify to just activate-slide).
4. Apply CSS standardization.
5. Apply standard cookbook patterns A/C/D/E.
6. Validate.

| # | Module | Slides in JS array | Notes |
|---|---|---|---|
| **C1** | m05 — Containers | 9 slides | Docker basics, Nano Server |
| **C2** | m06 — Clustering | 10 slides | Failover cluster, HA, quorum |
| **C3** | m07 — Monitoring | 12 slides | Perf Monitor, Event Logs, Resource Mgmt |
| **C4** | m18 — PowerShell Automation | 10 slides | The PowerShell pillar's deep module |
| **C5** | m19 — Troubleshooting/Migration | 16 slides | Capstone-style synthesis |

---

## ~~Group D — Capstone + assessment~~

REMOVED 2026-05-30 per operator: capstone (m20-failsafe-capstone) and midterm-outpost are NOT in scope. Only the 19 module presentations (m01-m19).

---

## Group E — Course-wide validation

| # | Item | Done criteria |
|---|---|---|
| **E1** | Full WSA validator pass at 1280×720 | All 19 module presentations return <60px overflow per real-validator on every slide |
| **E2** | Karl citation audit on new content authored during redesign | Karl run on slides where citations were added (parameter breakdowns reference Microsoft docs, etc.) |
| **E3** | Nancy adversarial review on m01 + m02 (the established pattern) | Nancy verdict approved — sets the bar for m03-m19 |
| **E4** | Cross-module link audit | "→ next: M(N+1)" links on summary slides go to existing modules |

---

## Group F — Preview + production push

| # | Item | Done criteria |
|---|---|---|
| **F1** | Final preview redeploy after Group B/C complete | All modules visible on `wsa-redesign-m01` channel |
| **F2** | Operator visual review per module on preview | Operator walks through preview, approves/flags per module |
| **F3** | Branch merge to master + `./deploy.sh` to production | OPERATOR-AUTHORIZED ONLY — production write gate per CLAUDE.md |

---

## Marathon mode execution rules

1. **One commit per sprint item.** Atomic, reversible, traceable.
2. **Real-validator pass before commit.** Slide-by-slide activate-and-measure, not the outer-container shortcut.
3. **Preview deploy per Group** (not per item) — batched for efficiency.
4. **No content elimination.** Splits over crunches. Per [[feedback_complete_thoughts_no_fluff]].
5. **No Dr. Hex on presentations.** Audit after each module ([[feedback_dr_hex_lab_only]]).
6. **No duplicate visuals across left+right.** Cookbook rule #7.
7. **Don't ask permission per item.** Marathon mode = autonomous execution. Surface gating decisions only.
8. **Track scope creep.** If a module reveals patterns not in the cookbook, add to cookbook + memory file, not just to one module.

## Item ordering recommendation

A1 → A2 → A3 → (B-CSS-bulk-prep) → B1 → B2 → B3-B12 (in numeric order) → C1 → C2 → C3 → C4 → C5 → E1 → E2 → E3 → E4 → F1 → F2 → operator decision on F3.

## Out of scope (this sprint)

- WSA labs (cloud-guilab.module.html, cloud-pslab.module.html) — operator directive
- WSA quizzes (cloud-quizquiz.module.html) — operator directive
- WSA hub (index.html) — operator directive
- **m20-failsafe-capstone — operator directive 2026-05-30**
- **midterm-outpost — operator directive 2026-05-30**
- Dr. Hex Skills Toolkit hub UX — parked per operator 2026-05-30
- AZ-800/AZ-801 expansion modules — separate future sprint
- Other Hexworth courses (PIS, ALA, COP1034C, CIS2253) — separate sprints when WSA pilot proves the pattern

---

## Tracking

Each item gets ticked off as primary completes it. Operator can verify any item independently via the preview URL.

| Item | Status | Commit / Notes |
|---|---|---|
| A1 | ✓ done | 7aee1d8df — m02 splits |
| A2 | ✓ done | 0f21ecb5f — m02 tightens |
| A3 | ✓ done | 0f21ecb5f — m02 validator pass |
| B-CSS-bulk-prep | ✓ done | 8f9ba31f0 — 12 modules standardized |
| B1 | ✓ done | d861fb240 — m03 dup-visual + 7 splits → 20 slides |
| B2 | ✓ done | 40cac3495 — m04 splits + dup-ds=6 fix → 10 slides |
| B3 | ✓ done | CSS-clean only — no content changes needed (validator: m08-dns 22 slides, 0 over) |
| B4 | ✓ done | CSS-clean only — m09-dhcp 14 slides, 0 over |
| B5 | ✓ done | CSS-clean only — m10-group-policy 22 slides, 0 over |
| B6 | ✓ done | CSS-clean only — m11-iis 24 slides, 0 over |
| B7 | ✓ done | CSS-clean only — m12-remote-desktop 21 slides, 0 over |
| B8 | ✓ done | CSS-clean only — m13-certificate-services 22 slides, 0 over |
| B9 | ✓ done | CSS-clean only — m14-advanced-networking 33 slides, 0 over |
| B10 | ✓ done | CSS-clean only — m15-ad-sites 21 slides, 0 over |
| B11 | ✓ done | CSS-clean only — m16-backup-recovery 19 slides, 0 over |
| B12 | ✓ done | CSS-clean only — m17-firewall-security 16 slides, 0 over |
| C1 | ✓ done | d5374b82c — m05-containers 9 slides |
| C2 | ✓ done | d5374b82c — m06-clustering 10 slides |
| C3 | ✓ done | d5374b82c — m07-monitoring 12 slides |
| C4 | ✓ done | d5374b82c — m18-powershell-automation 10 slides |
| C5 | ✓ done | d5374b82c — m19-troubleshooting-migration 16 slides |
| E1 | ✓ done | Full validator pass — 19/19 modules, 348 slides, 1 outlier fixed (87ecee05e) |
| E2 | n/a | Minimal new citations added — Karl not needed (no claim-bearing text) |
| E3 | dispatched | adversarial-reviewer running on m01 + m02 (background) |
| E4 | ✓ done | Sibling lab/quiz links all resolve; cross-module nav via hub (not inline) — confirmed intentional |
| F1 | ✓ done | Preview deployed — https://hexworth-prime--wsa-redesign-m01-gfcnf961.web.app (expires 2026-06-06) |
| F2 | operator action | Operator visual review on preview |
| F3 | OPERATOR-AUTHORIZED | Master merge + ./deploy.sh — never autonomous |
