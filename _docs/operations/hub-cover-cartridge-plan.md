# Hub Cover-Cartridge System, Plan & Open Requirements

**TLDR:** Hubs are shown as cartridges (arcade look) with fal-generated neon-noir covers. The
generator + gallery + catalog page are built and committed (not deployed). Before moving forward,
Frank requires a hub-health monitor + verify scripts + a by-name enumeration + a three-way audit so
every new hub reliably gets a cover and there are no drift or duplicate problems. Captured 2026-07-25.

## Built + committed (NOT deployed)

- **Generator process** `_tools/covers/`: `gen_cover.py`, `gen_batch.py` (per-hub original neon-noir
  prompts, house-colored, text/logo-free), `composite_cert_mark.py` + `cert_marks.py` (cert short-name
  text chip in our own styling, not a vendor logo). Offline; `FAL_KEY` from the shell, never the browser.
- **Cover gallery** `_app/assets/images/covers/`: 22 covers + `manifest.json`
  (`{hubId: {file, source, type, mark}}`).
- **Catalog page** `_app/catalog.html`: real entries from `HubRegistry.sorted()` (real titles + real
  `hubHref` links), covers with icon fallback, house-color frames + filters, XSS-safe.
- Commits: `e20711e52`, `5d921344d`, `7c35e3056`. Last deploy is `5de185f35` (hub scaffolder, task #225).

## Open requirements (Frank) — do these before moving forward

Goal: any newly created hub reliably gets a cover; no drift between what exists and what is shown; no
bad or unwanted duplicates.

1. **Hub Health area (monitor).** A surface (likely an admin-console panel, sibling of the Hubs panel)
   that shows total hubs in existence and how many are in the gallery (have a cover).
2. **Verify scripts.** Compare gallery count vs. existence count: which hubs exist, which have covers.
3. **By-name enumeration.** A process/registry that tracks hubs by name (a canonical name list).
4. **Three-way audit.** Reconcile the three sets, hubs-in-existence, hubs-in-gallery, hubs-by-name,
   to catch drift and prevent bad/unwanted duplicates.

## Design notes (to build against)

- **In existence** = static `HubRegistry.all()` (22 today) + dynamic Firestore `hubRegistry` (0 today).
- **In gallery** = `covers/manifest.json` keys whose cover file exists on disk.
- **By name** = a canonical enumeration. Options: derive from `HubRegistry` labels, or add a names index
  to the manifest, or a dedicated list. Must be the source that catches duplicate names/ids.
- **Reuse the existing auditor.** `_tools/eduscan/hub-registry-audit.js` already checks reserved-id
  parity + renderer/rewrite presence + per-doc validity, and is wired into `deploy.sh` Gate 2.5. Extend
  it (or add a sibling) to also assert: every hub has a cover; every cover maps to a real hub (no orphan
  covers); no duplicate ids/names; report gaps. This makes the three-way audit a permanent deploy gate,
  not a one-shot script (avoids the one-shot-audit trap this project has been burned by).
- **Hub Health panel** consumes the audit output: counts + the three-way reconciliation + a flag list
  (missing covers, orphan covers, duplicates).

## Sequencing

1. Build hub-health monitor + verify/enumerate/three-way-audit scripts; wire the audit into the gate.
2. Then the catalog entry-point (a nav link, location TBD with Frank).
3. Nancy + Chris; deploy on Frank's authorization (likely hosting-only, no rules change here).
4. Separately pending: cert-logo rights verification before swapping the text placeholders for real
   partner logos (see the cert-logo note in `visual-asset-taxonomy.md`).

## Related
- Memory: `project_hub_cover_cartridge_system.md`, `reference_visual_asset_taxonomy.md`
- Hub scaffolder (shipped): task #225 (`_app/houses/hub/`, `HubRegistry.js`, `HubDiscovery.js`,
  `_tools/eduscan/hub-registry-audit.js`)
- Arcade cartridge pattern: `_app/games.html`
