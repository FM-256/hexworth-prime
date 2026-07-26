# Visual Asset Taxonomy

**TLDR:** One word per asset type so we stop mixing up "icon vs image vs label." Use these
exact terms in conversation, code, and when organizing the asset gallery. Agreed 2026-07-25.

## The terms

| Term | Definition | Where it lives |
|---|---|---|
| **Icon** | Small, reusable UI symbol. Concept-level, not brand-specific. | `/assets/images/icons/` (168 webp) |
| **Logo** | Identity mark for a specific entity or certification (Hexworth mark; a cert's mark). Brand-bearing, often trademarked. | `/assets/images/` logos (per brand/cert) |
| **Image** | A full picture: screenshot, photo, hero illustration. The broad raster bucket. | `/assets/images/...` |
| **Sprite** | A game graphic (character/object/animation frame, spritesheets). Engine-level. | with the game |
| **Cover** | The image ingredient of a cartridge (the picture in its main area). A role, filled by a logo, generated art, or a styled title. | cartridge art set |
| **Title** | The text ingredient (the name, e.g. "A+ Core 1"). | data (the label's name) |
| **Label** | **Cover + Title bundled = the identifying "face."** Like an album's cover-plus-name or a game's box-art-plus-title. Not just text, not just the image, the two as one identity unit. | composed at render |
| **Cartridge** | The arcade-style card format that presents the label (frame + cover + title). | `_app/games.html` pattern |

Rule of thumb: **Cartridge** is the container, **Label** is the identity it carries,
**Cover** and **Title** are the label's two ingredients.

## Why this exists

1. Communication: a real misread ("icon" vs "label") stalled a planning conversation.
   Precise words prevent that.
2. Organization: these terms are the natural buckets for the asset gallery, sorted by
   section and usage: `icons/`, `logos/`, `sprites/`, `covers/` (cartridge art),
   `images/` (screenshots/photos). Labels are composed, not standalone files.

## Cartridge / cover sourcing (the active hub work)

The plan: every hub's card renders as a **cartridge** (the arcade look, see the
`GAMES` registry in `_app/games.html` and the `assets/images/arcade/<gameId>.webp`
naming convention). A hub's **cover** comes from:

- **Cert-tied hub** -> the certification's own logo (A+ Core 1 shows the CompTIA A+ mark).
- **Anthology / non-cert hub** -> generated art.
- **Safe default while rights are verified** -> a styled plain-text cert name ("A+")
  in our own cartridge style. This is descriptive (nominative) use of the name, not a
  copy of the vendor's stylized mark.

## Cert-logo usage note (verify before shipping real logos)

Not legal advice. Referential/nominative use of a cert name and mark by a prep provider
is generally defensible ("this is prep for X"). The traps are (a) implying official
endorsement/authorization you do not have, and (b) copying the vendor's specific mark
against their brand guidelines. Before shipping real vendor logos:

- Confirm partner status per vendor and what logo rights it grants (partners often get a
  specific partner badge plus guidelines rather than the raw product logo).
- Check each vendor's trademark/brand-usage guidelines (CompTIA, AWS, Microsoft, Cisco).
- Add a short non-affiliation line unless a partnership grants otherwise.

The cartridge system is asset-agnostic: it takes "a cover per hub," so swapping a text
placeholder for an official logo/badge later is an asset change, not an architecture change.

## Related

- Memory: `reference_visual_asset_taxonomy.md`
- Arcade cartridge pattern: `_app/games.html` (`GAMES` registry + derived cover art)
- Hub scaffolder (shipped): task #225 (`_app/houses/hub/`, `HubRegistry.js`, `HubDiscovery.js`)
