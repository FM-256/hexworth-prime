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

## Immediate context / where we are

- The 8-house **cartridge-fy** SHIPPED (houses read hub cards from HubRegistry as
  cover cartridges — a first real step toward "houses are filtered registry views").
- The **ai house was NOT cartridge-fied** — its 3 cards are the phantom ids above;
  this is the wedge that surfaced the whole unified-registry need. Do NOT patch the
  ai house's 3 cards in isolation; it's the first candidate for the real fix.
- Related prior doc: `_docs/architecture/hub-registry-design.md` (Option B staging —
  houses reading from the registry). This unified-registry vision is the full form of
  that Option B, extended from houses to EVERY consumer.
- The "houses read names from the registry" migration was logged this session as the
  durability fix (option C) behind the FEH drift — this doc is its general statement.
