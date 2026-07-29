# Morning Report — 2026-07-29

Marathon run on two mandates: **hexify the Cloud Master content**, and **scope the OpenStack
sandbox**. Both moved. Nothing is deployed. Blockers are annotated at the bottom.

---

## 1. Your complaint was right, and it was bigger than Cloud Master

You said: *"it looks bad! it looks basic, bad and silly images and emojis, the content is smooshed
into a thin 33% middle strip. all the old errors all over again."*

I measured it rather than guessing. At a 1920px screen the content sat in a **900px column — 47% of
the display** — with **9 emoji rendered per page**. But the defect was not in Cloud Master's content.
It was in `_app/components/CertPathRenderer.js`, a **shared component behind 14 cert hub pages**:
aws-ccp, aws-developer, azure-fundamentals, ccna, casp-plus, comptia-linux, comptia-network,
cryptography-track, cysa-plus, devops-fundamentals, aplus-core1, aplus-core2, security-operations,
security-plus-crypto.

You found it on Cloud Master because that is where you happened to look.

### Why the emoji survived a platform with a no-emoji rule

They were written as **unicode escapes** — `'\u{1F4D6}'` instead of `📖`. EduScan's emoji rule scans
for real glyph characters, and an escape sequence is ASCII text, not a glyph. Its other two emoji
rules only inspect properties literally named `icon:`, and these sat under keys named
`presentation:`, `lab:`, `quiz:`. **All three rules were structurally incapable of firing.** That is
logged as BUG-048; until a rule exists that decodes escapes first, "EduScan passed" is not evidence
for this class of defect in either direction.

### What changed

| File | Before | After |
|---|---|---|
| `components/CertPathRenderer.js:184` | `.wrap{max-width:900px}` = 47% | `1600px` + 32px padding |
| `components/CertPathRenderer.js:16-19` | 7 emoji as `\u{...}` escapes | 7 **visually distinct** webp icons (slides / gear / flask / quiz / books / tools / package) |
| `components/CertPathRenderer.js` `.mlist` | single-column flex list | `repeat(auto-fill,minmax(360px,1fr))` — 4 cols at 1920, 3 at 1366, 2 at 1024 |
| `houses/cloud/az-104/index.html` | `.container` 1100px = 57% | 1600px; subsections now side by side |
| `houses/cloud/cloud-essentials/index.html` | `.container` 1100px = 57% | same |

Verified with a real browser at 1920 / 1366 / 1024: content now fills **88–95%** of the screen,
**0 emoji**, type icons rendering with none broken and none showing literal ".webp" text, and card
heights uniform within a row.

### I got it wrong once first, and the QC caught it

My first fix applied the same multi-column grid to az-104 and cloud-essentials. That was wrong:
**all 18 of az-104's content blocks hold exactly one card.** An auto-fill grid allocates four columns
regardless, so a single card sat at the far left with **~970px of dead space** beside it — I had
recreated your complaint in a different shape. Chris caught it by counting the cards, which I had
not done.

The real fix went one level up: the three subsections (Presentation / Lab / Assessment) now sit
**side by side** across the width instead of stacked. Dead space went **970px → 22px**.

**My own error worth recording:** the screenshots I first offered as proof showed the accordions
**collapsed**, so the cards were never visible in them. I measured the container width and assumed
the cards were fine. That is the sixth time I have verified a proxy instead of the actual claim, and
it is written into the bug tracker in those words.

---

## 2. OpenStack — yes, it fits, and bc2 is better suited than expected

You said: *"the openstack element yes I am down if it is possible to place in a server and it would
not hurt us too much."* It is possible. Full scoping is in
`_docs/operations/openstack-sandbox-scoping.md`.

I verified bc2 directly rather than relying on the last inventory:

| Checked | Result | Why it matters |
|---|---|---|
| NICs | **4 physical** (eno1–eno4); only two have addresses → **eno3/eno4 free** | Was an open blocker. Now both DevStack and Kolla-Ansible are viable |
| Nested virtualization | **already enabled** (`nested=Y`) | The recommended VM-wrapped design needs **no risky host change** |
| Occupancy | 0 containers, load 0.03, no VMs, up 8 days | bc2 is genuinely idle; the VM can be sized generously |
| Roles to preserve | tailscaled, node_exporter (:9100), docker, sshd | hexclass jump-host route + Prometheus scrape |

**Recommendation: DevStack 2026.1 "Gazpacho" inside a KVM VM on bc2 — never on bc2's host OS.**
DevStack's own README says it "runs rampant over the system it runs on" and "we strongly recommend
that you run `stack.sh` in a clean and disposable vm." The concrete risk on bc2 is netfilter and
interface contention: bare-metal DevStack installs Open vSwitch and rewrites iptables, and bc2
already runs Docker, Tailscale and fail2ban. A mistake there takes out the hexclass fallback SSH
route and the monitoring scrape at the same time, silently. Inside a VM, none of that touches the
host, and a VM snapshot becomes the reset primitive — which the DevStack docs explicitly endorse.

**RAM is the only real constraint.** 20GB to the VM leaves ~10-12GB for student instances. That is
35–55 concurrent CirrOS `m1.nano` instances, or about **five** if students boot Ubuntu at `m1.small`.
The course already teaches `m1.nano`. That is a decision for you (item 3 below).

### The finding you will care about more than the infrastructure

**Every "lab" in House of the Cloud is a quiz in disguise.** `grep -c SandboxLauncher` returns **0**
for all three OpenStack labs, all six AZ-104 labs, and every file in `_app/houses/cloud/labs/`.
Their own task tags say it: "Command Builder / Dropdown Selection", "Fill-in-the-Blank",
"Scenario-Based / Multiple Choice."

Shield got arena boxes. Script got the Linux Mastery box. Matrix got Cell-Sigma. **Cloud is the last
major house with zero real-engine labs.** The scoping doc ranks eight high-transfer labs to build,
with the Cinder volume-persistence lab and the three troubleshooting scenarios as the strongest
cases — and names what NOT to build (manual installation cannot be taught in a sandbox where the
cloud is already installed; say so plainly rather than implying otherwise).

---

## 3. Blockers and decisions for you

**Annotated and skipped, per your instruction — none of these stopped other work.**

| # | Decision | Why it is yours |
|---|---|---|
| 1 | **Deploy approval for the hexify fix.** Committed but NOT deployed. | Rule 10: no deploy without explicit authorization for that operation |
| 2 | **Escaped-emoji cleanup scope (BUG-048).** 455 occurrences / 221 files. ~15 files are true pictographic emoji; the rest are ✓ ✗ ⚠ ★ ♥ used as UI typography | Touching 221 files is a bigger risk than the defect, and whether ✓/✗ count as "emoji" is a style call, not a bug call |
| 3 | **OpenStack flavor policy.** CirrOS `m1.nano` (35–55 concurrent) vs Ubuntu `m1.small` (~5) | Entirely different capacity story |
| 4 | **OpenStack maintenance model.** DevStack installs from git with **no supported in-place upgrade**; upstream ships every 6 months. Operating model is "rebuild the VM each term from a snapshot" | A standing cost, and the item most likely to bite later |
| 5 | **OpenStack egress policy.** Recommend an isolated fake-external network (students learn routers / floating IPs / SSH with zero internet exposure) | The alternative compounds an already-open unmitigated egress backlog item on the Linux sandbox |
| 6 | **Identity bridge shape.** Fixed pre-provisioned project pool (recommended) vs on-demand creation | |
| 7 | **HouseRenderer dynamic-hub merge** (+117 lines, uncommitted). Descoped from this commit — it cannot be verified locally because it only acts when Firestore returns a dynamic hub | Needs a live-verified pass, not a claim |

### The openstack hub had the *opposite* defect

Worth knowing because it changes what "hexified" means. Once I measured the openstack hub properly
(my first reading of "100% wide, fine" came from `.flux-overlay`, a decorative background layer,
not from content) its four module cards were each **1880px wide, one per row** — a stack of
full-width bars carrying a one-line title. That reads as "basic" for the same reason a narrow column
does: the layout is not doing anything with the space. Fixed to 458px cards, 4 per row, zero dead
space. While there I found a latent bug: the CSS styled `.module-info h3` but the markup uses `h2`,
so the rule matched nothing and every module title fell back to the browser default — oversized,
mis-coloured, wrapping to three lines.

**Decision for you, not taken:** the openstack hub is **light-themed** (white background) while
az-104, aws-ccp and the other cert hubs are **dark**. That is a visible identity split inside Cloud
Master. Re-theming a whole page is not a layout fix and it is your call, so I left it and am flagging
it.

### Housekeeping

- Chris left eight scratch files in the repo root during his review (`check_grid_tmp.js`,
  `check_grid_tmp2.js`, `check_repro.js`, `check_repro2.js`, `repro.png`, `repro2.png`,
  `test_repro.html`, `test_repro2.html`). **I did not remove them** — your standing rule this session
  is that `rm`/`mv` are not approved and we do not destroy. They are untracked and were not staged.
- Cosmetic, unfixed, logged: the cert-hub tab bar renders "COURSE MODULES" as a filled box and
  "EXPLORE ALL" as bare text — asymmetric on all 14 pages. Pre-existing, out of scope for this pass.

### Still open from before this run

Six earlier rulings remain parked on you: BUG-046 content calls (card python-graphics? is Backbone's
cross-link to Eye deliberate?), forged-gate-progress remediation, #237 gates 6-8 server validation,
gate sign-in requirement, BUG-045 operator module-id decision, #240 incubator regen.

---

## Files touched

**Committed (not deployed):** `_app/components/CertPathRenderer.js`,
`_app/houses/cloud/az-104/index.html`, `_app/houses/cloud/cloud-essentials/index.html`,
`_docs/operations/BUG_TRACKER.md` (BUG-047, BUG-048),
`_docs/operations/openstack-sandbox-scoping.md`, `_docs/operations/morning-report-2026-07-29.md`.

**Deliberately left uncommitted:** `_app/components/HouseRenderer.js` (see blocker 7).
