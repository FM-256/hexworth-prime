# Projects & Signal Hub — Revamp Strategy

*Filed: 2026-06-13 · Owner: operator (f.mora80) · Status: plan converged, execution pending*

## TLDR

The Projects hub's content is good; its **presentation and discoverability** are the problem (a 3rd-party critique and an internal QC sweep agree). The Signal hub is the more mature sibling — it already has progress tracking, prerequisite chains, mission-chain "Curated Views", skill tags, and a guided "start here" — while Projects is a flat static catalog with no progress tracking at all.

**Decision — merger:** do **NOT** merge the two catalogs (their taxonomies are orthogonal: Projects = discipline/House, Signal = hardware platform). **DO** unify the *infrastructure/shell* beneath them — one entry experience, one progress model, one career bridge, one tier language — with Projects and Signal as two views into it. (Option C below.)

**Decision — tiers:** adopt a **new unified difficulty/XP ladder** across both hubs (replacing Projects' 4-tier and Signal's 5-tier schemes). Highest blast radius; staged last; the specific ladder is designed at Phase 6.

This plan was adversarially reviewed twice (see [Adversarial review](#adversarial-review)); the sequence below reflects its corrections.

## Situation — both hubs, ground-truth

| Dimension | Projects Hub | Signal Hub |
|---|---|---|
| Catalog | 120 pages; 108 registered + **12 complete-but-unregistered orphans** | 112 builds, 16 tracks, 7 hardware platforms |
| Organized by | **House** (discipline) — `ProjectsData.js` houses map | **Platform × Track** (hardware + domain) — `SignalData.js` |
| Data schema | Minimal: `{id, house, title, description, difficulty, minutes, xp}` | Rich: `+ skills[], prerequisites[], parts[], outcomes[], platform, cost, status` |
| Difficulty tiers | 4 — beginner/journeyman/advanced/pro, 250–2000 XP (`ProjectsData.js:20-25`) | 5 — recruit/operative/operator/specialist/field_agent, 300–2500 XP (`SignalData.js:155-191`) |
| Rendering | Data-driven (`getByHouse` + `createElement`, `index.html:484-594`); only `hasPage` Set is hardcoded (`index.html:511`) | Full JS engine (`SignalEngine.js`, ~2814 lines) |
| Progress tracking | **None** | localStorage `hexworth_signal_progress` + Firestore `signal_progress/{uid}` (`firestore.rules:780`), `SignalProgressSync.js` |
| Mission chains | None | Prerequisites + "Curated Views" (predicate-filtered cross-section paths) |
| "Where do I start" | None — flat filterable catalog | Recruit Track + "Build Your Kit" onboarding |
| Earned XP source | Card XP is **display-only**; earned student XP = `MasteryXP` (module-based); `XPCalculator.js:209` sums 7 sources, **neither projects nor signal among them** | Same — Signal completion is binary; per-project XP not wired to earned total |
| Careers | 12 per-house pages + `career/career-paths.html` + `tools/career-pathway-planner.html` + `components/CareerExplorerEngine.js` — all rich, **all isolated** (no project/Signal ID contract) | 1 hub careers page (9 IoT roles) — isolated |
| Discoverability | Surfaced on dashboard as a destination card (`dashboard.html:5989`) | Surfaced on dashboard as a destination card (`dashboard.html:5999`) |
| Visual language | Case-file "cf-" blueprint | "se-" orange-Tesla |

## Three findings that drive the plan

1. **Signal is mature; Projects is a flat catalog.** Everything the critique wants Projects to grow into — progress, chains, mission chains, "start here", skill tags — Signal already has and Projects lacks (Projects doesn't even track completion).
2. **Infrastructure is duplicated and divergent, but the catalogs are genuinely orthogonal.** Two data models, two tier systems, two careers systems, one engine vs none — yet a hardware build and a software project don't belong in one list.
3. **Everything good is hidden.** 12 finished projects unregistered; a full `CareerExplorerEngine` embedded in a single applet; both hubs reachable only via the dashboard.

## Merger options — pro/con

### Option A — Keep fully separate (status quo)
- **Pro:** zero work, no risk; each hub keeps its identity.
- **Con:** duplicated infra rots in parallel; Projects stays progress-less and flat; discoverability stays broken.

### Option B — Full merger into one catalog
- **Pro:** one place for everything; single data model.
- **Con:** orthogonal taxonomies don't collapse (hardware vs software forced onto one axis); highest blast radius (220 pages, 3 visual systems, both engines); discards Signal's platform/kit model that genuinely needs hardware specifics.

### Option C — Unify the platform, keep the catalogs (SELECTED)
- **Pro:** reuses Signal's proven patterns; fixes Projects' real gaps (progress, chains, entry); delivers the career-pathway vision using data the platform already models; one entry fixes discoverability; two catalogs remain because they *are* different things.
- **Con:** requires building Projects up to Signal's pattern (medium work); tier unification has real blast radius (staged last).

## Converged, de-risked plan

| Phase | Action | Notes / risk |
|---|---|---|
| **P0** | Wire the 5 AI-series projects into `hasPage` + register | **Done & deployed** — they were registered in `ProjectsData.js` but missing from `index.html:511` `hasPage` Set, so live-but-unclickable. Fixed; hasPage = 108 = registry parity. |
| **P1** | Register the 12 verified-complete orphans | **Two-part**: add to `ProjectsData.js` AND `hasPage` (hasPage alone leaves them carded-but-invisible / invisible-but-clickable). Spot-check a sample via the Chris gate. Low risk. |
| **P2** | Extend `ProjectsData` schema: optional `skills[] / prerequisites[] / technologies[] / careerRoles[] / unlocks[]` | Additive, no breakage; Signal proves the shape; backfill incrementally. Powers scorecards, mission chains, and the career bridge. |
| **P3** | Career → catalog bridge | **Greenfield**: define a role↔project/Signal-ID cross-reference schema + a bridge component. The career infra exists but has zero ID contract — this is a build, not "wiring". Highest value-per-effort. |
| **P4** | `hasPage` → declarative field in `ProjectsData` + add `projects_progress` sync (parallel to `SignalProgressSync`, zero migration) | **Lightweight** — Projects is already data-driven, so this is "catch up to Signal's pattern", **not** a unified engine. Leave Signal's engine untouched. |
| **P5** | "Where do I start" / Mission Control on the **dashboard** | Not the public `index.html` (that's a separate unauthenticated-exposure decision). Reuse Signal's Recruit-Track + Curated-Views UI. |
| **P6** | Design + apply a **new unified tier/XP ladder** across both hubs | Operator decision made (new ladder, not adopt-one-side). Card XP is student-visible today, so the ladder design is student-facing. Highest blast radius — staged last. |

## Decisions resolved / open

- **Resolved — merger:** Option C (unify infra, keep two catalogs).
- **Resolved — tiers:** new unified ladder (design at P6).
- **Open — ladder design:** the specific tiers/XP curve (e.g. a 6-tier Recruit→Master, 250→8000) — decided at P6.
- **Open — unified progress collection:** keep `signal_progress` + add `projects_progress` (zero migration) vs. a single `hub_progress` (one-time Signal migration). Lean: parallel collections.
- **Open — Mission Control surface:** dashboard redesign vs. projects-index redesign vs. both.

## Adversarial review

Two rounds (`adversarial-reviewer`), both [PAUSE] → resolved:

- **Round 1** caught a live defect (the 5 AI projects missing from `hasPage` → unclickable; now fixed/deployed) and 5 open questions. Corrected three of my factual claims: orphan count, "port Signal's engine" (it's hardware-coupled, not a port), and "neither hub in nav" (both are on the dashboard).
- **Round 2** confirmed the grounded answers and made two structural corrections now folded in: **(1)** P4 was overbuilt — Projects is already data-driven, so the real work is a declarative `hasPage` field + a `projects_progress` sync, not a unified engine; **(2)** tier unification is **not** "safe now" as I had claimed — card XP badges are student-visible today, so renaming tiers is a student-facing change requiring an explicit decision before P6.

## Related follow-on

- **QC of existing projects** (the original task that surfaced this): structural/standards layer is clean — 0 broken links, 0 stubs, 0 missing titles, no real emoji/AI-attribution across 120 pages. Content quality is high (the critique agreed). The real defects were *visibility* (orphans, hasPage gap), now being addressed here.
- **Projects-hub structure reassessment**: the `ProjectsData.js:4` "each house has one capstone" comment is stale; the tiered-capstone model (see the AI series) needs a platform-wide pass — folds into P2/P6.

## Key file references

- `_app/projects/ProjectsData.js` — registry, schema, tiers (`:20-25`), houses (`:31-116`)
- `_app/projects/index.html` — data-driven render (`:484-594`), `hasPage` Set (`:511`), `linked` gate (`:573-591`)
- `_app/signal/SignalData.js` — rich schema, tiers (`:155-191`); `SignalEngine.js`; `SignalProgressSync.js`
- `_app/components/XPCalculator.js:209` — earned-XP sources (projects/signal absent); `MasteryXP.js:281`
- `_app/dashboard.html` — XP display (`:4026-4037`), hub destination cards (`:5989`, `:5999`)
- `firestore.rules:780` — `signal_progress/{userId}`
- Career infra: `_app/career/career-paths.html`, `_app/tools/career-pathway-planner.html`, `_app/components/CareerExplorerEngine.js`, `_app/houses/<house>/careers.html`
