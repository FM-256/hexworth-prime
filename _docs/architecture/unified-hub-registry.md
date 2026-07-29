# Unified Hub Registry — North Star

*Captured 2026-07-27 from a working session with Frank. This is the architectural
direction that explains and supersedes the day's fragmentation firefighting (FEH
naming, AI-house phantom cards, duplicate hubs, accountability gaps). Read this
before doing more hub/house/catalog work — those symptoms all trace back here.*

## TL;DR

**The platform ended up with MANY separate hub registries, each with its own copy
of hub data and its own naming. There should be ONE registry — one database of hubs
— and every view (house tabs, catalog, dashboards, learning paths, instructor
tracking) is a FILTERED PROJECTION of it via organization labels / tags / filters.
No hub is ever *listed* twice; it is *filtered* into wherever it belongs.**

## The disease: multiple registries that each drift on their own

Hub/course data is independently defined and named in all of these:

- `_app/components/HubRegistry.js` — the 142-hub catalog registry (closest thing to
  a source of truth today; drives `catalog.html` + the Hub Health HUD).
- Each house page's hardcoded `config.paths` array (`_app/houses/<house>/index.html`)
  — house-local hub cards, with their own ids/names (this is where the AI house's
  `ai-foundations` / `ai-builder` / `ai-security` phantom ids live — they match NO
  real hub and NO registry id).
- `_app/components/LearningPaths.js` — a separate PATHS registry.
- `_app/components/ContentCatalog.js` — the house-module content data (~5,172 files).
- The 10 tenant dashboards' hardcoded hub lists + `_app/js/handler-dashboard.js`
  `PATH_HOUSE_MAP`.
- Per-course `*Data.js` files: `feh-map.js`, `ForensicsData.js`, `SignalData.js`,
  `ProjectsData.js`, etc.
- `_app/assets/data/house-cards.json` (generated), `_app/data/accountability-map.json`
  (different granularity).

Because each independently names hubs, they drift. Concrete symptoms hit this session:
- **FEH** had THREE names (page title "Foundations of Ethical Hacking", registry
  sublabel "Forensics & Ethical Hacking", house card "FEH") and 6 dashboard cards
  even linked to the wrong course (the Forensics Hub). One course, three identities.
- **AI house**: 7 real live hubs (cortex, ai-900, agents, automation, advanced,
  azure-openai, cli-tools) exist, but the house page lists 3 phantom cards
  (`ai-foundations`/`ai-builder`/`ai-security`) that match none of them. Three
  incompatible naming schemes: page title vs registry id vs house-card id.
- **Duplicate hubs** (az-900↔azure-fundamentals, etc.) and **orphan pages** — same
  root cause: no single identity per hub.

## The standard house/dashboard skeleton (verified in HouseRenderer.js)

Every house and dashboard has the SAME 5 tabs:
1. **Learning Paths** — hubs tied to a **cert** (cert-prep tracks)
2. **House Content** — hubs that are this **house's own domain** content
3. **Explore All** — the **whole catalog** (same in every house; every hub findable + registered)
4. **Profile**
5. **Instructor** (tracking)

Tabs 1–3 are the three places hubs are held — but they are THREE FILTERS on ONE hub
set, not three separate collections. A hub isn't a different *kind* of thing per tab;
it's the same hub surfaced under whichever filter fits: cert-linked → Learning Paths;
house-domain → House Content; everything → Explore All.

## The cure: one registry + organization metadata + filtered views

- **One database of hubs** (HubRegistry is the natural home — already the catalog
  source). Each hub is ONE record.
- Each record carries **organizing metadata** so every view is a query, not a copy:
  - `house` — derivable today from `hubHref` (`/houses/ai/...`); make it explicit.
  - `category` — already exists (`cert-prep` | `course` | `platform-hub` | `tool`);
    this IS the Learning-Paths-vs-House-Content filter.
  - `tags` / `labels` / `filters` — for finer organization.
- Every consumer becomes a **filtered view**:
  - house tab = `hubs where house=X and type=content`
  - Learning Paths = `hubs where house=X and cert-linked`
  - Explore All = `everything` (the catalog)
  - dashboards / instructor views = other filters on the same set

## Decisions — LOCKED with Frank 2026-07-27 (late session)

1. **HubRegistry.js IS the database.** Minimal metadata additions only: an explicit
   `house` field on every entry (seeded from `hubHref`, hand-verified) and an optional
   `tags` array for later. `category` already carries the cert-vs-content split.
   Nothing else added until a view needs it.
2. **Migration is house-by-house; the AI house goes first** (it is broken today:
   3 phantom cards vs 7 real hubs). Each consumer migration gets the full
   Nancy/test/Chris/deploy treatment individually.
3. **First build step:** seed `house` across all 143 entries + audit-gate enforcement
   (a hub cannot enter the registry without a valid house) + rebuild the AI house as
   the first pure projection consumer (a registry QUERY by house, not a hand-list).
4. **AI house shows ALL 7 real hubs as cartridges** (Frank: "all cartridge") — full
   uncurated `house='ai'` projection replacing the 3 phantom cards. No featured
   subset.
5. **Every hub gets a house — no orphans.** The 9 previously houseless hubs, ruled
   one by one (Frank approved all 9):
   | hub | house | rationale |
   |---|---|---|
   | wireshark | eye | packet ANALYSIS/observation is the Eye's identity; Web builds networks, Eye watches them |
   | arctic-cli | matrix | Linux practice sandbox; matrix is the Linux house |
   | signal | forge | "The Signal — Hardware Projects"; forge is the hardware house |
   | toolkit | forge | Signal's essential-software companion course |
   | projects | observatory | guided cross-discipline builds; Observatory already carries it |
   | vault | dark-arts | lives at /dark-arts/vault/ |
   | bug-hunting | dark-arts | Vault cluster |
   | ehe | dark-arts | Vault cluster |
   | wifi-arsenal | dark-arts | Vault cluster |
6. **LearningPaths scope:** its hub NAMES and LINKS must resolve through the registry
   (kills FEH-style drift); its path STRUCTURE (ordered steps/milestones) stays its
   own data for now. Full path unification is a later chapter.
7. **Batch-2 house rulings (Frank approved all 8, 2026-07-28)** — the cert-prep stubs
   living at `/houses/<cert-slug>/` where the slug is not a real house:
   | hub | house | rationale |
   |---|---|---|
   | aws-ccp | cloud | vendor cloud cert |
   | aws-developer | cloud | vendor cloud cert |
   | azure-fundamentals | cloud | vendor cloud cert |
   | devops-fundamentals | cloud | CI/CD, containers, IaC — infrastructure-side |
   | comptia-linux | matrix | Linux cert, Linux house |
   | casp-plus | shield | advanced defensive cert; Security+ family home |
   | security-operations | eye | SOC = watching and responding; CyberOps precedent |
   | cryptography-track | key | the Key house IS the cryptography house |
   (security-plus-crypto resolved separately: workshopped with `house: 'key'` as its
   return address.) With batch 1 and the 124 URL-derivable hubs, the 142-hub house
   map is COMPLETE — no orphans.

## Container grouping (decided 2026-07-28)

Frank's Cloud Master plan ("in this hub I plan to add multiple hubs that focus on
cloud"), ruled as: **pure registry grouping — no physical path moves** — and
"it all needs to be cartridge-fied."

- A hub becomes a container's member by carrying `parent: '<container-id>'` in the
  registry. This extends the pre-existing convention (~50 entries across 8 container
  families: cortex, code-armory, algorithm-chamber, proving-grounds, backbone, api,
  vault, signal). `parent` is ORTHOGONAL to `house` — members keep their own house
  and their own real URLs.
- The dynamic hub renderer (`/houses/hub/<id>`) shows a container's members as a
  cover-cartridge grid (static registry children only; workshop-status children
  excluded; covers resolve by URL-guess + onerror icon fallback — the platform's
  single cover-resolution mechanism, same as catalog.html).
- Nesting is capped at DEPTH 1: a hub that is someone's parent may not itself carry
  a parent. Enforced by hub-registry-audit (FAIL), along with self/malformed/dangling
  parent checks; dynamic-container parents are verified against Firestore in the
  credentialed pass and WARN-deferred offline.
- Dynamic hubs cannot carry `parent` yet (the admin creator has no such input) —
  containers' children are static-registry entries for now.
- First container-of-hubs: `cloud-master` (dynamic, Observatory) containing aws-ccp,
  aws-developer, azure-fundamentals, az-104, cloud-essentials, openstack.

## Lifecycle status (decided 2026-07-28)

Frank: "some hubs will end up rotated in the workshop and we need the workshop to be
part of the change management process." Workshopping is a LIFECYCLE STATE, not a
deletion — the registry never loses sight of a hub.

- `status: 'workshop'` on a registry entry = quarantined: broken/unfinished content
  pulled from every student surface but kept registered, admin-testable, and tracked.
  **Absence of `status` = live** (the default for all other entries).
- The workshopping PROCEDURE sets BOTH fields: `tenantAssignable: false` (the proven
  hiding flag — catalog + licensing selectors honor it today) AND `status: 'workshop'`
  (the lifecycle label). The entry keeps its `house` — that is where it returns when
  fixed (shown in the HUD).
- Consumers: catalog + handler Course Browser filter it out; the hub page and
  path-view gate it to admins; the Workshop shelf (`/workshop/`, barricade entry) and
  the Hub Health HUD "Workshop" section surface it for change management.
- Validators: assignability rules (e.g. EduScan ASGN-005) EXEMPT workshop-status hubs
  — quarantined content being unmappable/unassignable is the intent, not a defect.
  When status is removed (hub returns to live), those rules automatically apply again.
- First use: `security-plus-crypto` (2026-07-28, commit d11dc8e2f).

## Step 1 BUILT (2026-07-28)

The first-build-step ruling (decision 3) is implemented:

- **`house` seeded on all 142 static entries.** Verified partition against the live
  file: 1 already-set (security-plus-crypto) + 124 URL-derivable + 13 pure-ruled +
  4 overlap (vault/bug-hunting/ehe/wifi-arsenal, where the /dark-arts/ URL and the
  ruling agree) = 142; 0 unresolved, 0 conflicts. (Decision 3's "143" was a
  miscount -- the registry holds 142 static entries.) Placement: `house` sits
  immediately before `sortOrder` on every entry.
- **Audit gate live** (hub-registry-audit "house assignment integrity"): FAIL on a
  missing or non-whitelist house (the 13 real houses); WARN when an entry's hubHref
  lives under a DIFFERENT real house's directory than its assigned house (legal
  override, visible drift). Drift-tested in both directions with reverted fixtures.
- **`HubRegistry.byHouse(houseId)` query** -- a house page's projection of its owned
  hubs. Contract: TOP-LEVEL entries only (`!parent` -- container members render
  inside their container per "Container grouping", not as sibling cartridges),
  `status !== 'workshop'`, sortOrder-sorted. NAMED DECISION (composition of the
  container-grouping + all-cartridge rulings, flagged for Frank's veto at deploy):
  the AI projection shows 8 top-level hubs, with Cortex's 13 sub-tracks reachable
  inside Cortex rather than flattened beside it. Known pre-existing tension:
  catalog.html still renders parented children flat -- logged as follow-up, NOT
  changed here.
- **AI house = first pure projection consumer.** `cardStyle: 'cartridge'` +
  `paths: HubRegistry.byHouse('ai').map(h => h.id).concat([...3 learning-path
  cards...])`. CORRECTION to decisions 2/4: the 3 replaced cards were NOT phantoms --
  ai-foundations/ai-builder/ai-security are real 6-9-module LearningPaths entries
  (quizzes, PATH_HOUSE_MAP wiring, Dr. Hex knowledge base). They are PRESERVED as
  house-local object cartridges with explicit `/path-view.html?house=ai&path=<id>`
  hrefs -- byte-identical destinations to the old JS-bound cards (Nancy-verified
  against path-view.html's param parsing). Nothing orphaned.
- **BUG-037 found and fixed en route:** the 8 cartridge-fied house pages never
  included HubRegistry.js, so their Courses grids rendered EMPTY in production
  (silent skip in hrResolveCartridge's guard). One include per page added before
  HouseRenderer.js; all 9 cartridge pages render-verified locally, 9/9 PASS. See
  BUG_TRACKER BUG-037.
- **gen-house-cards understands projections:** it resolves the byHouse() half
  against the real registry module and parses the .concat([...]) half as a normal
  paths block, so house-cards.json and the HUD reconciliation reflect what a
  projection page actually renders (cards carry `projected: true`). The HUD's
  "surfaced on no house page" list dropped 105 -> 97 (the 8 AI hubs); the rest
  clears as houses convert house-by-house.

## Projection rollout COMPLETE (2026-07-28, Frank: "do the rest of the houses")

All 12 non-Observatory houses are now pure byHouse() projections (Observatory stays a
curated cross-house lens by ruling):

- ai (b92534ad7, +3 preserved path cards), eye (03eb5318f), then the batch: cloud, code
  (+1 preserved python-engineering house-local card), dark-arts, forge, key, script,
  shield converted from hand-lists; matrix, web, divergent cartridge-fied for the first
  time (HubRegistry include + cardStyle + projection; their paths were EMPTY before --
  students saw the no-paths placeholder).
- Net effect (executed audit numbers): unsurfaced 96 -> 70; cross-house carding WARN
  6 -> 0 (all cross-listed cards dropped by projection design; each hub remains on its
  home house's page; the pending cyberops ruling was answered by Frank's rollout
  instruction = pull). Container children (cloud-master's 6, vault's wifi-arsenal,
  cortex's 13, armory/api families) surface inside their containers; the unsurfaced
  metric does not model that yet (taskboard #234).
- PATH_HOUSE_MAP (handler-dashboard.js) reconciled to registry houses: comptia-linux
  script->matrix, devops-fundamentals code->cloud, python-hub script->code (full 33-entry
  sweep vs registry: 0 mismatches).
- Hero-card coexistence -- RULED by Frank 2026-07-28: **keep both.** 4 houses render
  rich hand-authored featured-course cards in afterStatsHTML whose destinations also
  appear as projection cartridges (same destination, different section/detail -- NOT
  the BUG-038 different-destination defect). Executed inventory: divergent 3 of 3
  projected ids also hero-carded (100%), matrix 3 of 5 (60%), ai 2 of 8 (25%), web
  2 of 5 via onclick sections. The featured card is the spotlight, the cartridge is
  the shelf entry; the pattern is intentional and no filtering or removal is wanted.
  Hero cards remain hand-authored page content (they are NOT registry-driven).

## Explore All is registry-driven too (2026-07-28)

Frank: "the explore all hubs is still not shown as cartridge-fied" -- correct, and the tab
was carrying THREE overlapping lists of the same hubs: HouseRenderer's 16 hand-written
"Special Features" cards (8 of which were registry hubs), a separate 15-card PLATFORM_HUBS
grid that ContentDiscovery injected into the SAME panel, and the house's own projection.
Both hand-lists had drifted: their Cortex card pointed at a legacy /houses/code/cortex/ and
Algorithm Chamber at /houses/code/algorithms/, neither of which is where those hubs live.

- Special Features now holds ONLY the 8 platform destinations that are not hubs (Arena,
  Hive, Arctic, Colosseum, Dispatch, Operator, Career, Funding) -- they carry editorial
  descriptions the registry has no field for.
- A "Hubs" cartridge shelf renders 9 hub ids from the registry (forensics, bug-hunting,
  signal, cortex, code-armory, algorithm-chamber, backbone, projects, devops). The CURATION
  is the id list; names, links and covers come from HubRegistry, so the drift cannot recur.
  Workshop-status hubs are filtered at that call site -- note this is NOT inherited from
  hrResolveCartridge, which resolves through HubRegistry.all() and does no status filtering
  (only byHouse does).
- PLATFORM_HUBS, renderPlatformHubs, its call site and its CSS are retired. A March 2026
  comment in both files declared the two grids complementary and warned against removing
  either; both comment blocks were rewritten rather than deleted, so the record explains why
  that guidance was overridden instead of silently contradicting the code.
- Verified on ALL 13 house pages: 8 feature cards + 9 hub cartridges with registry-correct
  hrefs, no duplicate grid, discovery anchor intact, zero JS errors.
  CORRECTION (Chris, blocking review): I first recorded here that Observatory "has no
  Explore panel, curated lens, not a HouseRenderer tabbed page". That was wrong and is
  retracted. observatory/index.html:1693 calls the same HouseRenderer.init() as every other
  house, and renderPage builds the tab set unconditionally -- Observatory IS the 13th tabbed
  page, just behind ObservatoryConsent.ensureConsent(), which a scripted run cannot satisfy
  without Firebase auth. My harness reported "no panel" and I turned that into an
  architectural claim instead of reading the page. Re-verified by driving the same init the
  page uses: 8 features + the identical 9 registry cartridges, no duplicate grid, no errors.
  (Observatory IS still a curated cross-house lens for its own COURSE shelf -- that ruling
  stands and is separate from the shared Explore All tab.)

## Cloud Master: distribution hubs and dynamic-hub placement (decided 2026-07-29)

Frank found Cloud Master rendering at the TOP of the Observatory page, above the hero,
instead of with the featured courses. Root cause was mine: the `<div data-hub-discovery>`
mount point was placed as the last line of the static HTML, which is the bottom of a
normal page -- but house pages are built at RUNTIME (HouseRenderer appends header at
:1164, main at :1299, footer at :1305), so a static div already in the DOM precedes
everything the renderer creates and lands at the top of the flow. Latent on all 12 files
carrying the mount; visible only on Observatory because it is the only house with a
dynamic hub today.

RULINGS
- **Cloud Master is a DISTRIBUTION hub.** Frank: "cloudmaster course will consist of
  multi-cloud instruction. aws/azure/openstack as of now perhaps i will add another".
  It appears in the Observatory and NOWHERE ELSE. Verified live that this already holds:
  absent from the cloud house and the catalog, present on Observatory, with its six
  children rendering inside its own hub page rather than beside it.
- **Its content is SILOED, and the resulting duplication is accepted.** Frank: "i would
  prefer to have the cloudmaster content siloed, even if the content appear to be dupped
  at the cloud house". The Cloud house separately promotes AWS Cloud Practitioner and
  Azure Fundamentals through hand-authored course cards, a cert badge, a start-here entry
  and House Content module rows. That is a DECISION, not a defect -- do not "fix" it.
- **Destination is the Courses shelf**, merged with the other cartridges rather than a
  separate strip. Frank: "we want it in the featured area ... actually i want it in the
  courses area that is live in the observatory". The tabs are the mechanism if a future
  hub ever needs its own place.
- **Observatory's curated shelf may carry a house-scoped DYNAMIC hub.** This does not
  contradict the curated-lens ruling: curation still governs the hand-authored static
  list, and a dynamic hub only ever surfaces in the house its `house` field names.

MECHANISM (Option A, approved). The renderer sources the Courses shelf through
`HubRegistry.allWithDynamic()` -- the existing tested merge (HubRegistry.js:509+, 14
assertions in _tools/rules-test/hub-registry-e2e.test.js) -- scoped to the page's house,
excluding workshop status and container children. HubDiscovery.js and its 12 mount points
retire. Catalog gains dynamic hubs too, since a distribution hub invisible to catalog
browsers defeats its purpose.

WHY NOT the alternatives, recorded so they are not re-proposed:
- Patching HubDiscovery's append target keeps a DUPLICATE Firestore query beside the
  tested merge, keeps the markup duplication problem, and leaves the mount divs -- the
  actual cause -- in place on 12 pages.
- Adding `'cloud-master'` to Observatory's `paths` array LOOKS like a one-line fix and
  silently does nothing: that list resolves through the STATIC registry
  (`hrResolveCartridge` skips unknown ids), and Cloud Master is a Firestore hub. A change
  that appears correct and renders nothing is worse than no change.

KNOWN GAP AT TIME OF DECISION: no house merged dynamic hubs into its shelf at all -- the
absence was systemic, not an Observatory wrinkle, so this fix makes every house able to
surface admin-created hubs correctly.

## Immediate context / where we are

- The 8-house **cartridge-fy** SHIPPED (houses read hub cards from HubRegistry as
  cover cartridges — a first real step toward "houses are filtered registry views").
  (2026-07-28: it shipped with a missing-include bug that blanked those grids in
  production -- BUG-037, fixed in step 1 above.)
- The **ai house** is now the first pure projection consumer (see Step 1 BUILT).
- Related prior doc: `_docs/architecture/hub-registry-design.md` (Option B staging —
  houses reading from the registry). This unified-registry vision is the full form of
  that Option B, extended from houses to EVERY consumer.
- The "houses read names from the registry" migration was logged this session as the
  durability fix (option C) behind the FEH drift — this doc is its general statement.
