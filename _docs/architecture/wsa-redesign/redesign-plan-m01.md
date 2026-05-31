# WSA m01-fundamentals — Redesign Plan

**Module:** Windows Server Fundamentals
**Course syllabus anchor:** **CTS1328C** — *Managing and Maintaining Server Operating Systems* (Keiser MS) · `~/hexworth-shared/Raw sources/Faculty docs/CTS1328C MS Managing and Maintaining Server Operating Systems.docx`
**Lego role:** FOUNDATION BLOCK (the base layer; supports every block above it)
**Current state:** 27 slides, static-HTML pattern, mixed slide-markup vintage (uses `<h2 class="slide-title">` consistently)
**Date:** 2026-05-30
**Status:** Inventory + monomial assessment; pre-fan-out decision artifact

**⚠ Syllabus validation pending:** This plan was drafted from the current m01 content and the platform's existing module structure, before reading CTS1328C end-to-end. Before fan-out, the syllabus must be read and each m01 sub-topic mapped to the specific outcome(s) it serves. Coverage gaps detected at that point (if any) revise this plan.

**Pacing model (confirmed 2026-05-30):** No per-week module separation. Hexworth treats m01-m19 as a continuous 19-module sequence; the 4-week course window in CTS1328C is the catalog duration, not a Hexworth scheduling constraint. The syllabus's "Week 1 = CO #1 + #2 / Week 2 = CO #3 + #4 / ..." mapping is informational about WHICH COs the weeks emphasize — not a per-week module bucket. Do not engineer per-week boundary markers into the deck. m01 is the FIRST in the continuous sequence, not "Day 1 of Week 1."

## Module role in the Lego build (and spiral curriculum)

m01 is the foundation block at the bottom of the WSA Lego kit. Per operator's course structure model (`README.md` → "Course structure — the Lego build model" + the spiral-curriculum principle #10): the first few modules carry the weight, with more grounding and less assumption of prior knowledge than later modules.

**m01 = the spiral floor.** Concepts touched here are introduced at gist depth. Later modules deepen them. m01 specifically establishes:

- What Windows Server IS (editions, install options, the management surface) — full coverage at this slot, this concept lives here
- The PowerShell pillar at its starting layer (verb-noun pattern, pipeline, filtering, essential commands) — spirals into every later module
- The initial-configuration competencies a junior engineer must execute on day one — many of these spiral into dedicated later modules
- Remote management options — spirals into m12 (Remote Desktop) and m18 (PS Automation) depth
- Server Core as the production-grade deployment variant — spirals into later modules' Server-Core-specific patterns

**Concrete spiral examples from m01 (per operator's own framing):**
- "Configure DNS" slide (current slide 19) = gist only. Points the server's resolver at a DNS server. **NOT covered here:** recursive resolution, zones, record types, DNSSEC — those are m08's spiral turn for DNS.
- "Initial Configuration: Firewall" slide (new) = open the bring-up ports. **NOT covered here:** advanced firewall policy, IPsec — those are m17.
- "Initial Configuration: Backup config" pointer (if added) = the basics. **NOT covered here:** backup architecture, recovery testing — those are m16.

End-state target for the WSA course as a whole: a **decently functional jr. Windows Server engineer**. m01's role in that target: lay the foundation so every spiral turn above clicks onto something solid.

This shapes m01's redesign decisions in three concrete ways:
1. **Higher slide count is justified.** Foundation modules carry more grounding work than specialization modules. The locked 35-slide floor reflects this.
2. **No prerequisites are assumed beyond basic IT literacy.** Hence the WHAT IS PowerShell slide — students may genuinely not know.
3. **Every concept landed here is owed downstream.** m02-m19 will reference these foundations via labs and practice, not via deck recap — so m01's coverage has to be solid first-pass.

## TLDR

m01 is currently 27 slides covering 12 sub-topics in 6 broad areas: Windows Server identity, installation options, GUI management, PowerShell from the ground up, initial server configuration, remote management, and Server Core. Each existing slide is mostly well-targeted at ONE primary monomial (good baseline). The redesign work is **mostly visual upgrade + a small number of content reflows + a few identifiable monomial gaps to consider**. Projected slide count post-redesign: **27 → 32-35** depending on which gaps you choose to fill. Risk of overflow at 1280×720 is concentrated on 3 specific slides.

## Sub-topic inventory

Slides grouped by sub-topic, with the primary monomial each addresses:

| # | Sub-topic | Slides | Primary monomial(s) | Slide titles |
|---|---|---|---|---|
| 1 | Module intro / "what you'll learn" | 1 | TOC-style — N/A | Windows Server Fundamentals |
| 2 | Windows Server editions | 1 | WHAT (+ light WHY/WHERE) | Windows Server Editions |
| 3 | Installation modes | 1 | WHAT + WHY | Installation Options |
| 4 | Server Manager (GUI) | 1 | WHAT + HOW | Server Manager |
| 5 | Roles & Features concept | 1 | WHAT | Roles and Features |
| 6 | PowerShell — naming pattern | 1 | WHAT | PowerShell: Verb-Noun Pattern |
| 7 | PowerShell — version check | 1 | HOW | Checking PowerShell Version |
| 8 | PowerShell — discovery + help | 1 | HOW | Discovering Cmdlets & Help |
| 9 | PowerShell — the pipeline | 1 | WHAT + HOW | The PowerShell Pipeline |
| 10 | Where-Object basics | 1 | HOW | Filtering with Where-Object |
| 11 | Where-Object operators reference | 1 | WHAT (reference) | Where-Object: Anatomy + Operators |
| 12 | Chaining pipes | 1 | HOW | Chaining Multiple Pipes |
| 13 | Essential commands — system info | 1 | HOW | Essential Commands: System Info |
| 14 | Essential commands — services | 1 | HOW | Essential Commands: Services |
| 15 | Essential commands — processes | 1 | HOW | Essential Commands: Processes |
| 16 | Essential commands — event logs | 1 | HOW | Essential Commands: Event Logs |
| 17 | Initial configuration overview | 1 | WHAT (checklist) | Initial Configuration: Checklist |
| 18 | Rename + static IP | 1 | HOW | Rename Server & Assign Static IP |
| 19 | Configure DNS | 1 | HOW | Configure DNS |
| 20 | Remote management options | 1 | WHAT | Remote Management Options |
| 21 | PSRemoting | 1 | HOW | Enable PSRemoting & Connect |
| 22 | Fan-out with Invoke-Command | 1 | HOW | Fan-Out with Invoke-Command |
| 23 | Windows Admin Center | 1 | WHAT + WHY | Windows Admin Center |
| 24 | Server Core — sconfig | 1 | WHAT + HOW | Server Core: sconfig |
| 25 | PowerShell on Server Core | 1 | HOW | PowerShell on Server Core |
| 26 | sconfig menu reference | 1 | WHAT (reference) | sconfig Menu Reference |
| 27 | Module summary | 1 | Recap | Module Summary |

## Content-density risks (overflow candidates at 1280×720)

**OVERFLOW-001 validator RESULT (2026-05-30):** scanned m01 at 1280×720 — **0 overflows detected**. All 27 current slides fit within the viewport. My structural inference below was wrong; the nested overflow:hidden cascade is restraining the content correctly.

Updated assessment per slide:

| Slide | Title | Elements | Original risk inference | Actual at 1280×720 |
|---|---|---|---|---|
| 3 | Installation Options | 10 `<li>` items + h3 + parallel Desktop/Server Core content + highlight box | "High" | Fits cleanly |
| 5 | Roles and Features | 2 tables + h3 + highlight box + ~540 chars | "Medium" | Fits cleanly |
| 11 | Where-Object: Anatomy + Operators | 4 tables + ~382 chars | "High" | Fits cleanly |

**Implication:** the 3 content splits planned for these slides are not NEEDED for overflow reasons. They may still be appropriate for cleaner monomial coverage and the open-book pattern (e.g., splitting Desktop Experience vs Server Core gives each its own dedicated WHY + visual treatment), but they are no longer overflow-driven.

## Monomial coverage gaps to consider

Across m01 as a module, the following gaps are visible. Each is a decision, not an automatic fix — some are intentionally left in labs or assumed prerequisites:

1. **No "What IS PowerShell?" slide.** The deck jumps to verb-noun pattern (slide 6) assuming PowerShell is known. **DECIDED 2026-05-30: this slide IS being added.** PowerShell is a WSA pillar that spirals through all 19 modules; m01 establishes the gist-level foundation. The slide covers WHAT (the framework, the shell + scripting language, automation surface) + WHY (every GUI action has a PS equivalent, scales to fleet management via remoting, operator's primary tool in production) + a brief WHERE note (built into Windows, also Linux/macOS via PS Core 7+). **At m01's spiral depth only** — automation patterns, DSC, advanced scripting all live in m18 PowerShell Automation's spiral turn.

2. **No WHERE context for Windows Server in a network.** The module starts with editions/install without first showing where a Windows Server fits in a typical environment (workstations → Windows Server as DC / DNS / file server / etc.). This is a foundational WHERE that's currently missing. Could be one new slide with a topology illustration.

3. **Initial Configuration: Checklist has 7 items, only 3 get follow-up slides.** Items addressed: rename, static IP, DNS. Items NOT addressed in slides: Windows Update, Time Zone, Firewall, Remote Management settings. These may be intentionally deferred to labs (where students do the steps hands-on) — but if the deck is meant to STAND ON ITS OWN as a reference, those 4 items each warrant a HOW slide.

4. **No WHY for Server Core deployment.** The Server Core sub-topic (slides 24-26) is all WHAT and HOW. The motivation ("why would you deploy Server Core instead of Desktop Experience?") is briefly mentioned in slide 3's Installation Options bullets but never gets its own clear case-for slide. A 1-slide WHY could land "Server Core: smaller footprint, smaller attack surface, no patch reboots for GUI components" in a way the Installation Options comparison flattens.

5. **No WHO slide.** This is almost certainly fine — m01 doesn't have a "who designed Windows Server" angle that matters pedagogically. Flagged for completeness only.

## Sub-topic balance — PowerShell weight is DELIBERATE

| Area | Slides | % of module |
|---|---|---|
| Server identity (editions, install) | 4 | 15% |
| GUI tools (Server Manager, Roles, WAC) | 3 | 11% |
| PowerShell language + pipeline | 7 | 26% |
| PowerShell essential commands | 4 | 15% |
| Initial server configuration | 3 | 11% |
| Remote management (non-WAC) | 3 | 11% |
| Server Core | 3 | 11% |
| Intro/Summary | 2 | 7% |

**Locked 2026-05-30:** PowerShell language + commands together at 11 of 27 slides (40%) is INTENTIONAL.
Per operator: PowerShell is one of WSA's main pillars. The 4-week course is structured to deepen PowerShell knowledge progressively across all 19 modules — m01 establishes foundations + first-skills layer; subsequent modules layer module-specific PowerShell skills (AD cmdlets in m02, DNS cmdlets in m08, clustering cmdlets in m06, etc.). The 40% weight in the fundamentals module is the foundation for that progression.

**Implication:** the "WHAT IS PowerShell" gap (gap #1 below) IS a real gap to fill, BECAUSE PowerShell is a pillar — students who will spend 4 weeks deepening this tool need a proper grounding slide, not the assumption that they already know what PowerShell is.

## Specific per-slide recommendations

### Slides to redesign visually only (most slides)

Each gets the open-book treatment: left = current text content (tightened where overflow risk), right = animated SVG matched to the slide's monomial. Format guidance per slide-shape:

- **WHAT slides** (2, 5, 6, 9 first half, 11, 20, 26): right-side = labeled topology, hierarchy diagram, or annotated reference card. Light animation (subtle pulse on a key element). Examples:
  - Slide 2 (Editions): the right side could be a labeled "VM-count-per-license" visualization showing Standard's 2 VMs included vs Datacenter's unlimited, with example workloads in each
  - Slide 5 (Roles): right side could be a tree showing major Role categories + example Roles under each
  - Slide 20 (Remote management options): right side could be a labeled 4-quadrant visual showing each tool's place (graphical/command, local/remote)

- **HOW slides** (4, 7, 8, 9 second half, 10, 12, 13-16, 18, 19, 21, 22, 24, 25): right-side = sequential step animation in the siem.gif lineage (matches the canonical `dns-HOW.sample.html` pattern). Examples:
  - Slide 9 (Pipeline): right side already has animation (existing `pipeline-obj` keyframes) — UPGRADE to the per-step color palette + numbered badges
  - Slide 18 (Rename + static IP): right side = animated sequence showing computer-name change → reboot → IP assignment → adapter showing new IP
  - Slide 21 (PSRemoting): right side = animated handshake — local PS prompt → WinRM port opening → remote session established

- **WHY slides** (3 partial, 23 partial): right-side = before/after visualization. For Installation Options: side-by-side animated comparison of resource footprint, attack surface, patch frequency.

### Slides that need a content split

| Slide | Current | Proposed split |
|---|---|---|
| 3. Installation Options | 1 slide with 10 li covering both modes | **2 slides:** (3a) Desktop Experience — WHAT + WHY (when to use it) + visual of GUI dashboard. (3b) Server Core — WHAT + WHY (when to use it) + visual showing the bare prompt vs GUI footprint. |
| 5. Roles and Features | 1 slide, 2 tables | If currently fits, leave as-is. If overflows, split into (5a) WHAT = Roles vs Features distinction (1 table or list) and (5b) common-roles reference table. |
| 11. Where-Object: Anatomy + Operators | 1 slide, 4 tables | **2 slides:** (11a) Anatomy of the command (with the labeled-syntax-diagram visual that already exists). (11b) Operator reference table (the comparison/logical/contains operators in one consolidated table or 2-column grid). |

### Slides considered for net-new (gaps to fill)

These are decisions, not automatic adds:

| New slide | Justification | Risk if added | Risk if skipped |
|---|---|---|---|
| New: WHAT IS PowerShell (between slides 5 and 6) | Module currently assumes PowerShell knowledge | Pads the deck if students enter with PS knowledge | Confused students at slide 6 |
| New: WHERE Windows Server sits (topology context, near slide 1 or 2) | No infrastructure-context slide | Adds 1 slide for fundamentals-grounding | Students see editions/install before knowing where the thing lives |
| New: 4 follow-ups for the unaddressed Initial Configuration checklist items (after slide 19) | Deck claims to teach initial config; currently covers 3 of 7 items | +4 slides, module becomes 31-32 | Deck doesn't deliver on the checklist promise; lab dependence |
| New: WHY Server Core (before slide 24) | Server Core sub-topic has no motivation slide | +1 slide | Students learn HOW without WHY |

## Projected slide count delta

| Scenario | Slide count | Status |
|---|---|---|
| Current state | 27 | baseline |
| Visual upgrade only (no splits, no gap-fills) | 27 | rejected — known overflow risks |
| Visual upgrade + 3 content splits (slides 3, 5, 11) | 30 | locked baseline |
| + fill gap "WHAT IS PowerShell" | 31 | **LOCKED 2026-05-30** (PowerShell is a WSA pillar) |
| + fill all 4 initial-config follow-ups | 35 | **LOCKED 2026-05-30** (deck must be complete standalone reference) |
| + fill gap "WHY Server Core" | 36 | pending operator decision |
| + fill gap "WHERE Windows Server sits" (new slide) | 37 | pending operator decision (Q3 chose module-map for slide 1, so WHERE-topology would be a separate added slide if wanted) |

Confirmed floor: m01 lands at **at least 35 slides**. Two pending optional adds (WHY Server Core, WHERE-topology as separate slide) bring it to 36-37 if both selected.

The 4 added initial-config slides (after slide 19, before slide 20) each get the open-book + HOW treatment with siem-style right-side visuals. **Each at m01's GIST DEPTH per the spiral curriculum** — these slides cover the initial-bring-up depth a junior admin needs to get a new server online. Deeper concepts on each topic live in their own dedicated modules:
- Apply Windows Update — animated visual showing the update workflow (check → download → install → reboot). Scope: how to trigger an update check and apply pending patches. **Out of scope at m01:** WSUS, Windows Update for Business policy, Configuration Manager integration.
- Set Time Zone — visual of GUI date/time + parallel `Set-TimeZone` PowerShell command. Scope: how to set the right timezone. **Out of scope at m01:** time-sync infrastructure, w32time configuration depth.
- Configure Firewall — visual showing inbound port rules (block-by-default + allow specific ports) with `Get-NetFirewallRule` / `New-NetFirewallRule`. Scope: open the bring-up ports a fresh server needs (RDP, WinRM). **Out of scope at m01:** advanced firewall policy depth, IPsec, connection security rules — those are m17 territory.
- Configure Remote Management settings — visual showing the WinRM service activation flow. Scope: enable the remote-management surface so the server is reachable. **Out of scope at m01:** advanced WinRM configuration, double-hop / CredSSP, JEA — those layer at later spiral turns.

## Animations / visuals — reuse opportunities

The current deck has authored animation keyframes already (lines 380-427 of m01's CSS), which is the foundation for the redesign:

- `flow-right`, `pipe-glow`, `filter-pulse`, `object-pop` — pipeline animation primitives, reuse for slide 9
- `typing-cursor`, `char-appear` — terminal-typing illusions for HOW slides showing commands
- `server-pulse`, `radial-pulse` — node-active indicators
- `gear-rotate`, `drop-in`, `check-mark` — process completion animations
- `bounce-up`, `loading-bar`, `arrow-shoot`, `broadcast-wave` — flow indicators
- `path-draw`, `connect-line`, `fade-cycle`, `data-tick`, `log-scroll`, `click-blink` — supporting motion

These align with the canonical `dns-HOW.sample.html` patterns. Many of m01's slides can reuse these directly. The work is composition (which animation per slide), not new keyframe authoring.

**Caveat — and this is important:** I have not rendered any of the current m01 slides at 1280×720 to confirm which actually overflow today. The 3 high-risk slides above are inferred from structural element counts (10 li + h3 + extra content; 4 tables; 2 tables + highlight). To know for certain, the OVERFLOW-001 validator should run against m01 before the redesign starts — and the validator's per-slide measurements should anchor the split decisions instead of my counts. That's a 1-command run when you're ready.

## Open questions for operator (pre-fan-out)

1. ~~**PowerShell sub-topic weighting**~~ — **ANSWERED 2026-05-30.** Keep PowerShell as one of WSA's main pillars. Maintain 40% weight in m01. Fill the WHAT IS PowerShell gap. Course-wide implication: PowerShell coverage continues to deepen across all 19 modules (each module's module-specific cmdlets layer on top of the foundations laid in m01).

2. ~~**Initial Configuration checklist gap**~~ — **ANSWERED 2026-05-30: ADD the 4 slides.** One HOW slide each for Windows Update, Time Zone, Firewall, Remote Management settings. Operator's reasoning: completeness > slide-count. The deck stands alone as a complete reference; if the checklist says "do these 7 things," the deck teaches all 7.

3. ~~**Module intro (slide 1)**~~ — **ANSWERED 2026-05-30: option (b).** Slide 1 keeps its open-book layout. Left page = the "What You'll Learn" content (current). Right page = a **labeled module-map** visual showing the journey through m01's content as ~9 stops (Editions → Install modes → Server Manager → Roles → PowerShell foundations → Essential commands → Initial config → Remote management → Server Core → Summary). Animated: a traveling indicator advances through the stops, each lighting up as it's passed. Visual aesthetic: same siem.gif lineage as `dns-HOW.sample.html`, but the shape is a journey-snake (3-row S-curve) rather than a topology. This pattern becomes the standard module-1 visual treatment that all 19 modules can reuse.

(Note: this answer also rules out the alternative "WHERE-Windows-Server-sits topology slide" idea. If a network-context grounding is still wanted, it would need to be a separate added slide, not the replacement for slide 1.)

4. ~~**Standalone reference vs lab-paired**~~ — **ANSWERED IMPLICITLY 2026-05-30** by Q2's answer: **the deck is a complete standalone reference.** Labs reinforce; the deck is complete on its own. This applies to all 19 modules' redesigns.

5. **Validator run BEFORE the redesign** — run OVERFLOW-001 against m01 first to get truth-on-the-ground for which slides actually overflow today? Recommended.

Once the remaining 2 answers (Q3 and Q5) are in, the redesign target shape for m01 is fully specified. Then the work is:
1. Run OVERFLOW-001 to lock the split list
2. Compose right-side animated SVGs per slide using the per-step color palette + open-book layout
3. Author the 3 content splits + agreed gap-fills
4. Apply to `_app/houses/cloud/modules/wsa/m01-fundamentals/cloud-presentation.module.html`
5. EduScan + smoke + preview-channel deploy + visual review before merge to master

## What this plan does NOT touch

- Labs (`cloud-guilab.module.html`, `cloud-pslab.module.html`)
- Quiz (`cloud-quizquiz.module.html`)
- Module hub (`index.html`)
- Course-wide navigation, ModuleProgress wiring, accessibility, AccessGuard, etc.

## Related

- `_docs/architecture/wsa-redesign/MONOMIAL-MODEL.md` — the coverage framework
- `_docs/architecture/wsa-redesign/samples/dns-HOW.sample.html` — canonical visual sample
- `_docs/architecture/wsa-redesign/README.md` — workspace overview
- `_tools/eduscan/validators/functional/slide-overflow.js` — overflow detector (run against m01 before fan-out)
- `_app/houses/cloud/modules/wsa/m01-fundamentals/cloud-presentation.module.html` — the deck this plan targets
