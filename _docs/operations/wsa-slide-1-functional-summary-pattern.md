# WSA Slide-1 Functional Summary Pattern

**Status:** Specification — drafted 2026-06-07 for execution against m03, m04, m05, m06, m07, m09, m10, m11, m12, m13, m14, m15, m16, m17, m18, m19 (16 modules; m01 + m02 are the reference fixtures).

**Reference fixtures:**
- `_app/houses/cloud/modules/wsa/m01-fundamentals/cloud-presentation.module.html` (lines 509-589)
- `_app/houses/cloud/modules/wsa/m02-active-directory/cloud-presentation.module.html` (lines 486-560)

**Related docs:**
- `_docs/operations/wsa-content-density-cookbook.md` (HEUR-039 + OVERFLOW-001b ceilings — must be respected)
- `_docs/architecture/wsa-redesign/redesign-plan-m01.md` (Pattern A origin — m01 redesign 2026-05-30)
- `_docs/operations/wsa-presentation-redesign-2026-05-30.md` (sprint context)

**Related memory:** `[[reference_wsa_slide_pattern_cookbook]]`, `[[feedback_wsa_overflow_pattern]]`

---

## TLDR

Slide 1 of every WSA module deck should be a **functional summary**: a left-panel verbal scaffold + a right-panel module-map SVG showing the journey through that module's topics. Two of 19 modules (m01, m02) have this pattern; the other 17 have the verbal scaffold but a single-concept SVG (not a journey map) and no `highlight-box` callout. This doc specifies the pattern so the remaining 16 modules can be upgraded uniformly (m03 is borderline — has syllabus anchor in deck but no highlight-box + no journey map).

---

## Audit (current state, 2026-06-07)

| Element | Present in | Notes |
|---------|-----------|-------|
| Intro `<p>` paragraph | 19 / 19 | Scaffold present everywhere |
| `<h3>What you'll learn</h3>` + `<ul>` | 19 / 19 | Scaffold present everywhere |
| `<div class="highlight-box">` "Where this fits" + syllabus anchor + Lego framing | **2 / 19** | Only m01, m02 |
| Syllabus anchor (CTS1328C / AZ-800) mentioned in slide 1 | 4 / 19 | m01, m02, m03, m04 (m03/m04 in other slot, not highlight-box) |
| **Module-map SVG** (numbered journey stops on snake path) | **2 / 19** | Only m01, m02. Other 17 have single-concept SVGs. |

**Upgrade target:** 17 of 19 modules.

---

## The pattern — five required elements

### Element 1: Intro paragraph

One sentence. Sets the module's purpose for a junior engineer. m01 example:

```html
<p style="font-size: 1.1rem; color: var(--accent-light); margin-bottom: 16px; line-height: 1.5;">
    Your journey into Windows Server administration starts here. Nine stops, one foundation block, the bottom of the WSA Lego kit.
</p>
```

m02 example uses the same wrapper styling. **Keep the inline styling identical** — it's part of the visual contract.

### Element 2: "What you'll learn" list

`<h3>What you'll learn</h3>` + `<ul>` with 4-6 bullets. Each `<li>` follows the format:

```
<li><strong>Topic name</strong> — short clarification</li>
```

Mark the **keystone topic** (the pillar) with a ★ suffix:

```
<li><strong>PowerShell ★</strong> — verb-noun, pipeline, Where-Object</li>
```

### Element 3: `highlight-box` callout (the "Where this fits" box)

Template:

```html
<div class="highlight-box">
    <strong>Where this fits:</strong> [Lego role]. Maps to <strong>CTS1328C</strong> [optional: Objective #N]. [Optional: AZ-800 weight or relevance]. [Optional: keystone framing — "X is the pillar later modules build on" or similar].
</div>
```

m01 example (longer form):

> **Where this fits:** Foundation block of the WSA Lego kit. Maps to **CTS1328C** Objective #1 and the **AZ-800** exam. PowerShell (★) is the pillar every later module builds on.

m02 example (compact form):

> **Where this fits:** Foundation #2 of WSA. AD = 25-30% of **AZ-800**. **AD PowerShell (★)** is the automation pillar of AD itself.

**Rule of thumb:** keep it under 200 characters to leave HEUR-039 budget room. Cite CTS1328C as the course anchor. AZ-800 weight is optional — include if the module hits a high-weight exam domain.

### Element 4: Module-map SVG (the journey snake)

> **Note (added 2026-06-09):** This element is an EXCEPTION to [`slide-right-panel-visual-standard.md`](./slide-right-panel-visual-standard.md). The module-map is **structural navigation** (9 stops on a snake path with traveling indicator) — not a topical illustration — so authored SVG is the correct format here. The visual-standard's "use illustrated animated GIF" rule applies to topical right-panel visuals on SLIDES 2-N, not to this slide-1 navigation map.

The right-panel SVG that makes this a "functional" summary. Specification:

- **viewBox:** `0 0 480 340`
- **Background:** `<rect>` filled with a grid pattern (40×40 cells, low-opacity blue)
- **Snake path:** 3 rows of 3 stops each = 9 stops total. S-curves at the ends. Dashed stroke `5 5`, color `rgba(96,165,250,0.25)`.
- **Stop coordinates** (identical across all modules):
  - Row 1 (L→R): (60,70), (240,70), (420,70)
  - Row 2 (R→L): (420,160), (240,160), (60,160)
  - Row 3 (L→R): (60,250), (240,250), (420,250)
- **Stop styling:**
  - Regular stops: `<circle r="14">` with `<text>` for stop number + `<text>` for label below
  - Pillar stop: `<circle r="16">` (larger), label text in `#67e8f9` cyan with `font-weight="600"`, ★ suffix in label
- **Traveling indicator:** Glow `<circle>` + white core `<circle>`, both with `<animateMotion dur="14s" repeatCount="indefinite">` walking the snake path
- **Bottom forward-pull hint:** `<text>` in `#86efac` (green), italic — *"→ next: M\<NN\> — \<Module Title\>"*
- **Header:** `<text>` at top — *"Module \<NN\> — your journey"*

**Per-module fill points** (the only things that change between modules):
1. `aria-label="m<NN> module map — nine stops on the <topic> journey"`
2. Pattern ID `m<NN>grid`, gradient ID `m<NN>-indicator-glow`, path ID `m<NN>snakepath`
3. Stop labels (text inside each `<g class="m<NN>-stop">`)
4. Which stop is the pillar (extra class `pillar`, larger radius, cyan text)
5. Footer "→ next" text
6. Header "Module \<NN\> — your journey" text

### Element 5: Slide-title icon

The `<h2 class="slide-title">` wraps an `<img>` icon. m01 uses `icon-desktop.webp`. m02 uses `icon-users.webp`. Pick a thematic icon from `/assets/images/icons/` per module — see existing slide titles for hints.

---

## SVG template (copy-paste boilerplate)

```html
<div class="slide-visual">
    <!-- Module-map: 9-stop journey-snake with traveling indicator -->
    <svg viewBox="0 0 480 340" xmlns="http://www.w3.org/2000/svg" aria-label="m<NN> module map — nine stops on the <topic> journey">
        <defs>
            <pattern id="m<NN>grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(96,165,250,0.05)" stroke-width="1"/>
            </pattern>
            <radialGradient id="m<NN>-indicator-glow" cx="50%" cy="50%">
                <stop offset="0%" stop-color="#93c5fd" stop-opacity="0.9"/>
                <stop offset="60%" stop-color="#60a5fa" stop-opacity="0.4"/>
                <stop offset="100%" stop-color="#60a5fa" stop-opacity="0"/>
            </radialGradient>
        </defs>
        <rect width="480" height="340" fill="url(#m<NN>grid)"/>

        <text x="240" y="22" fill="#60a5fa" font-size="13" font-family="Segoe UI" text-anchor="middle" font-weight="600">Module <NN> — your journey</text>

        <path id="m<NN>snakepath" d="M 60 70 L 240 70 L 420 70 C 460 70, 460 160, 420 160 L 240 160 L 60 160 C 20 160, 20 250, 60 250 L 240 250 L 420 250" stroke="rgba(96,165,250,0.25)" stroke-width="2.5" fill="none" stroke-dasharray="5 5"/>

        <!-- Row 1 -->
        <g class="m<NN>-stop" data-stop="1"><circle cx="60" cy="70" r="14"/><text x="60" y="74" fill="#e0e0e0" font-size="10" font-family="Segoe UI" text-anchor="middle" font-weight="600">1</text><text x="60" y="100" fill="#93c5fd" font-size="10" font-family="Segoe UI" text-anchor="middle"><LABEL_1></text></g>
        <g class="m<NN>-stop" data-stop="2"><circle cx="240" cy="70" r="14"/><text x="240" y="74" fill="#e0e0e0" font-size="10" font-family="Segoe UI" text-anchor="middle" font-weight="600">2</text><text x="240" y="100" fill="#93c5fd" font-size="10" font-family="Segoe UI" text-anchor="middle"><LABEL_2></text></g>
        <g class="m<NN>-stop" data-stop="3"><circle cx="420" cy="70" r="14"/><text x="420" y="74" fill="#e0e0e0" font-size="10" font-family="Segoe UI" text-anchor="middle" font-weight="600">3</text><text x="420" y="100" fill="#93c5fd" font-size="10" font-family="Segoe UI" text-anchor="middle"><LABEL_3></text></g>

        <!-- Row 2 (R→L) -->
        <g class="m<NN>-stop" data-stop="4"><circle cx="420" cy="160" r="14"/><text x="420" y="164" fill="#e0e0e0" font-size="10" font-family="Segoe UI" text-anchor="middle" font-weight="600">4</text><text x="420" y="190" fill="#93c5fd" font-size="10" font-family="Segoe UI" text-anchor="middle"><LABEL_4></text></g>
        <g class="m<NN>-stop" data-stop="5"><circle cx="240" cy="160" r="14"/><text x="240" y="164" fill="#e0e0e0" font-size="10" font-family="Segoe UI" text-anchor="middle" font-weight="600">5</text><text x="240" y="190" fill="#93c5fd" font-size="10" font-family="Segoe UI" text-anchor="middle"><LABEL_5></text></g>
        <g class="m<NN>-stop" data-stop="6"><circle cx="60" cy="160" r="14"/><text x="60" y="164" fill="#e0e0e0" font-size="10" font-family="Segoe UI" text-anchor="middle" font-weight="600">6</text><text x="60" y="190" fill="#93c5fd" font-size="10" font-family="Segoe UI" text-anchor="middle"><LABEL_6></text></g>

        <!-- Row 3 -->
        <g class="m<NN>-stop" data-stop="7"><circle cx="60" cy="250" r="14"/><text x="60" y="254" fill="#e0e0e0" font-size="10" font-family="Segoe UI" text-anchor="middle" font-weight="600">7</text><text x="60" y="280" fill="#93c5fd" font-size="10" font-family="Segoe UI" text-anchor="middle"><LABEL_7></text></g>
        <g class="m<NN>-stop" data-stop="8"><circle cx="240" cy="250" r="14"/><text x="240" y="254" fill="#e0e0e0" font-size="10" font-family="Segoe UI" text-anchor="middle" font-weight="600">8</text><text x="240" y="280" fill="#93c5fd" font-size="10" font-family="Segoe UI" text-anchor="middle"><LABEL_8></text></g>
        <g class="m<NN>-stop pillar" data-stop="9"><circle cx="420" cy="250" r="16"/><text x="420" y="254" fill="#e0e0e0" font-size="10" font-family="Segoe UI" text-anchor="middle" font-weight="700">9</text><text x="420" y="280" fill="#67e8f9" font-size="10" font-family="Segoe UI" text-anchor="middle" font-weight="600"><PILLAR_LABEL> ★</text></g>

        <!-- Traveling indicator -->
        <circle r="14" fill="url(#m<NN>-indicator-glow)"><animateMotion dur="14s" repeatCount="indefinite"><mpath href="#m<NN>snakepath"/></animateMotion></circle>
        <circle r="5" fill="#fff" opacity="0.95"><animateMotion dur="14s" repeatCount="indefinite"><mpath href="#m<NN>snakepath"/></animateMotion></circle>

        <text x="240" y="325" fill="#86efac" font-size="11" font-family="Segoe UI" text-anchor="middle" font-style="italic">→ next: M<NEXT_NN> — <NEXT_MODULE_TITLE></text>
    </svg>
</div>
```

**Note:** the pillar position is flexible — m01's pillar is stop 5, m02's is stop 9. Pick whichever stop best represents the keystone topic (usually placed last as the apex skill, or middle as the structural pivot).

---

## Layout variants — when 9 stops doesn't fit cleanly

Two rare cases:

- **Module has only 5-7 distinct topics.** Collapse the snake to 2 rows × 3 cols = 6 stops, removing Row 3 of the path. Adjust path `d=` to end at the row 2 final coordinate. Forward-pull "→ next" goes at y=205 instead of y=325.
- **Module has 10+ distinct topics that resist grouping.** Default behavior: **group**. Forced curation to 9 stops is part of the design — students remember 9 things, not 12. If two related sub-topics can share a stop ("Switches" covering External/Internal/Private; "PowerShell" covering 3-4 cmdlet slides), group them.

**Default:** 9 stops. Don't deviate without a strong reason.

---

## Per-module spec (proposed stops + pillar)

Drafted from current slide structure. Marathon executor should validate per-module against the actual deck before applying — if a slide's title materially changed since this doc was drafted, update the stop label.

| Module | Stops (proposed, in journey order) | Pillar (★) | Lego role | "→ next" |
|--------|------------------------------------|-----------|-----------|----------|
| m03-storage | Disk Types · Partition Styles · Disk Mgmt GUI · Disk Cmdlets · Storage Spaces · Resiliency · SMB Shares · Permissions · PowerShell ACL | **Storage Spaces ★** | Foundation #3 — physical storage layer | M04 — Hyper-V |
| m04-hyperv | Hypervisor Types · VM Generations · Virtual Switches · Switch Types · Checkpoints · Restore · New-VM · Set-VM · PS VM Mgmt | **PS VM Mgmt ★** | Foundation #4 — virtualization | M05 — Containers |
| m05-containers | VM vs Container · Isolation Modes · Base Images · `docker run` · `docker build` · `docker ps` · Nano Server · Dockerfile · Image Registry | **Dockerfile ★** | Foundation #5 — lightweight compute | M06 — Clustering |
| m06-clustering | Cluster Concept · Quorum · Witness · CSV · Clustered Roles · CAU · `New-Cluster` · `Add-ClusterNode` · `Get-Cluster*` | **Quorum ★** | Foundation #6 — HA | M07 — Monitoring |
| m07-monitoring | Event Viewer · Perf Monitor · WAC · WSUS Roles · WSUS Workflow · Azure Arc · `Get-WinEvent` · `Get-Counter` · `Get-EventLog` | **WAC ★** | Foundation #7 — visibility | M08 — DNS |
| m08-dns | Name Resolution · Hierarchy · Zone Types · AD-Integrated · Forward/Reverse · Record Types · Forwarding · Dynamic Updates · Scavenging | **AD-Integrated ★** | Block #8 — name resolution | M09 — DHCP |
| m09-dhcp | DHCP Concept · DORA · Scopes · Reservations · Options · Policies · Failover · DDNS Integration · Troubleshooting | **DORA ★** | Block #9 — IP assignment | M10 — Group Policy |
| m10-group-policy | GPO Architecture · LSDOU · Computer vs User · Create + Link · Security Filtering · WMI Filters · Common Settings · Preferences · Troubleshooting | **LSDOU ★** | Block #10 — policy delivery | M11 — IIS |
| m11-iis | IIS Architecture · Pipeline · Sites + Bindings · App Pools · Virtual Dirs · SSL/TLS · Authentication · URL Authz · `WebAdministration` | **App Pools ★** | Block #11 — web hosting | M12 — RDS |
| m12-remote-desktop | RDS Architecture · Role Services · Deployment · Collections · Gateway · RDP Security · RemoteApp · Licensing · HA | **RemoteApp ★** | Block #12 — desktop delivery | M13 — Cert Services |
| m13-certificate-services | PKI Fundamentals · How Certs Work · CA Hierarchy · Enterprise vs Standalone · Templates · Enrollment · Autoenrollment · Revocation · Backup | **Autoenrollment ★** | Block #13 — identity trust | M14 — Adv Networking |
| m14-advanced-networking | NIC Teaming · DHCP Failover · DNS Policies · Split-Brain · DNSSEC · IPAM · NPS/RADIUS · VPN · IPsec | **IPAM ★** | Block #14 — networking depth | M15 — AD Sites |
| m15-ad-sites | AD Sites · Subnets · Site Links · Intra vs Intersite · KCC · Bridgeheads · `repadmin` · SYSVOL Replication · RODC | **KCC ★** | Block #15 — replication topology | M16 — Backup/Recovery |
| m16-backup-recovery | Backup Types · WSB Install · System State · BMR · Schedule · AD Recycle Bin · VSS · Network Targets · Recovery Testing | **System State ★** | Block #16 — DR | M17 — Firewall/Security |
| m17-firewall-security | Profiles · Rule Types · Create Rules · Advanced Props · Existing Rules · IPsec · Logging · GPO Deploy · Diagnostics | **GPO Deploy ★** | Block #17 — host firewall | M18 — PS Automation |
| m18-powershell-automation | Script Fundamentals · Error Handling · Task Scheduler · DSC · DSC Implementation · Remoting · Workflow Patterns · Modules · Repositories | **DSC ★** | Capstone #18 — automation | M19 — Troubleshooting |
| m19-troubleshooting-migration | Methodology · Built-in Tools · Network Tests · Network Issues · Replication · Authentication · Boot · Backup · Migration | **Methodology ★** | Capstone #19 — operate at scale | (end of WSA) |

**Notes on the spec:**
- Pillar assignments are **proposals**, not final. The marathon executor can adjust per module if a different topic clearly carries more weight.
- Stop count = 9 for all 17 modules. Where the module has more raw topics, group; where it has fewer, be specific (split related sub-topics into distinct stops).
- "→ next" for m19 = end-of-WSA marker. Use *"→ next: WSA Capstone (m20)"* or *"→ M03-house career path"* depending on what fits the course flow. Operator preference: TBD; default to *"→ M20 — Failsafe Capstone"* since m20 exists in the directory.

---

## Validation gates (must pass for each upgraded module)

After each module's slide 1 is updated, validator state must hold:

1. **HEUR-039 = 0** for the file (no slide-text over 600 chars on cat-contract slides)
2. **OVERFLOW-001b max ≤ 85px** for the file (residuals stay under cookbook tolerance)
3. **Div balance preserved** (`<div` count == `</div>` count, scripts stripped)
4. **HTTP 200 + visible render** on local server (puppeteer screenshot or `node _tools/eduscan/qc-snapshot-slide.js <module> 1`)

If any gate fails: trim the highlight-box wording first, then the WYL list, before considering SVG changes.

---

## Risk + caveats

- **The journey only works if slide order matches map order.** If a module's slides zig-zag back across topics, the map will mislead. Marathon executor: spot-check slide order before authoring stops; if order doesn't match, either reorder slides OR adjust stops to match actual slide flow.
- **Pillar selection is content-design judgment.** This spec proposes one pillar per module; operator can override at review time. Some modules (m07, m17) have weak natural pillars — pick the one most useful operationally for a junior engineer, not the most theoretically central.
- **The highlight-box adds ~150-200 chars to slide-text.** Currently most modules' slide 1 text is ~300-450 chars. Adding the highlight-box brings totals to ~500-650 — close to the HEUR-039 ceiling. If a module's existing slide 1 is already verbose, trim the intro paragraph first.

---

## Sprint task list (executed via marathon)

See sprint sub-tasks created in `_tools/sprint-master/sprints.json` (or current task tracker). Sequence:

1. Read CTS1328C syllabus + AZ-800 exam guide for Lego-role mapping per module (one-pass research; output: notes file with per-module 1-line role descriptor)
2. Draft proof on **m08-dns** (one module, full upgrade, render-verified) — establishes pattern fidelity before fan-out
3. **Operator review** of m08 proof — gate before applying to remaining 16
4. Apply pattern to remaining 16 modules (one task per module: m03, m04, m05, m06, m07, m09, m10, m11, m12, m13, m14, m15, m16, m17, m18, m19)
5. Final cross-module audit: render-verify all 17 upgraded slide 1s, confirm validators still green, confirm "→ next:" pointers chain correctly across the deck sequence
6. Commit per-module + final summary commit
7. **Ready for deploy** (operator-authorized via `./deploy.sh`)

**Gate:** the m08 proof (step 2) must be operator-approved before step 4 fan-out. This is the "show me one before you do all 16" check from the conversation.

---

*Last updated: 2026-06-07*
