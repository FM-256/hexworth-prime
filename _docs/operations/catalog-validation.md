# ContentCatalog Validation Report

**Date:** 2026-07-21
**Wave:** CA-REGEN (auto-regenerated)
**Catalog:** `_app/components/ContentCatalog.js`
**Generator:** `_tools/reports/gen-content-audit.js`

---

## Summary

| Metric | Count |
|--------|-------|
| Total catalog modules | 4,282 |
| Modules marked `available` | 4,237 |
| Modules whose href resolves to an existing file | 4,240 |
| Modules whose href is missing on disk | 42 |
| Total HTML content files on disk (excl. `_`-dirs) | 5,172 |
| HTML files NOT referenced by the catalog | 2,260 |

Href resolution: `_app/` + `HOUSES[module.house].basePath` + `module.href`.

---

## Entries Pointing to Missing Files

All 42 entries below are catalog modules whose resolved href does
not exist on disk. Every one is currently marked `coming-soon` — placeholder catalog
rows for content not yet built (not broken links to shipped content).

| House | Resolved Path | Status |
|-------|---------------|--------|
| key | `houses/key/applets/hashing-lab.html` | coming-soon |
| code | `houses/code/games/pod-crossing.html` | coming-soon |
| shield | `houses/shield/infosec/pis-01.html` | coming-soon |
| shield | `houses/shield/infosec/pis-02.html` | coming-soon |
| shield | `houses/shield/infosec/pis-03.html` | coming-soon |
| shield | `houses/shield/infosec/pis-04.html` | coming-soon |
| shield | `houses/shield/infosec/pis-05.html` | coming-soon |
| shield | `houses/shield/infosec/pis-07.html` | coming-soon |
| shield | `houses/shield/infosec/pis-08.html` | coming-soon |
| shield | `houses/shield/infosec/pis-09.html` | coming-soon |
| shield | `houses/shield/infosec/pis-10.html` | coming-soon |
| shield | `houses/shield/infosec/pis-12.html` | coming-soon |
| shield | `houses/shield/infosec/pis-13.html` | coming-soon |
| shield | `houses/shield/infosec/pis-14.html` | coming-soon |
| shield | `houses/shield/infosec/pis-15.html` | coming-soon |
| shield | `houses/shield/infosec/pis-17.html` | coming-soon |
| shield | `houses/shield/infosec/pis-18.html` | coming-soon |
| shield | `houses/shield/infosec/pis-19.html` | coming-soon |
| shield | `houses/shield/infosec/pis-20.html` | coming-soon |
| forge | `houses/forge/intro-computers/labs/fb-w1-fundamentals.lab.html` | coming-soon |
| forge | `houses/forge/intro-computers/labs/fb-w1-word.lab.html` | coming-soon |
| forge | `houses/forge/intro-computers/quizzes/fb-w1-fundamentals.quiz.html` | coming-soon |
| forge | `houses/forge/intro-computers/quizzes/fb-w1-word.quiz.html` | coming-soon |
| forge | `houses/forge/intro-computers/presentations/fb-w2-excel-basics.presentation.html` | coming-soon |
| forge | `houses/forge/intro-computers/labs/fb-w2-word-adv.lab.html` | coming-soon |
| forge | `houses/forge/intro-computers/labs/fb-w2-excel.lab.html` | coming-soon |
| forge | `houses/forge/intro-computers/quizzes/fb-w2-word-adv.quiz.html` | coming-soon |
| forge | `houses/forge/intro-computers/quizzes/fb-w2-excel.quiz.html` | coming-soon |
| forge | `houses/forge/intro-computers/exams/fb-midterm.exam.html` | coming-soon |
| forge | `houses/forge/intro-computers/presentations/fb-w3-excel-advanced.presentation.html` | coming-soon |
| forge | `houses/forge/intro-computers/presentations/fb-w3-access.presentation.html` | coming-soon |
| forge | `houses/forge/intro-computers/labs/fb-w3-excel-adv.lab.html` | coming-soon |
| forge | `houses/forge/intro-computers/labs/fb-w3-access.lab.html` | coming-soon |
| forge | `houses/forge/intro-computers/quizzes/fb-w3-excel-adv.quiz.html` | coming-soon |
| forge | `houses/forge/intro-computers/quizzes/fb-w3-access.quiz.html` | coming-soon |
| forge | `houses/forge/intro-computers/presentations/fb-w4-powerpoint.presentation.html` | coming-soon |
| forge | `houses/forge/intro-computers/presentations/fb-w4-integration.presentation.html` | coming-soon |
| forge | `houses/forge/intro-computers/labs/fb-w4-ppt.lab.html` | coming-soon |
| forge | `houses/forge/intro-computers/labs/fb-w4-integration.lab.html` | coming-soon |
| forge | `houses/forge/intro-computers/quizzes/fb-w4-ppt.quiz.html` | coming-soon |
| forge | `houses/forge/intro-computers/quizzes/fb-w4-integration.quiz.html` | coming-soon |
| forge | `houses/forge/intro-computers/exams/fb-final.exam.html` | coming-soon |

**Recommendation:** These are expected placeholders. Create the file before flipping a
row to `available`, or remove the row if the content is abandoned. EduScan rule CAT-004
tracks these continuously.

---

## HTML On Disk But Not In The Catalog

2,260 HTML files exist under `_app/` that no catalog href points to.
This is largely intentional: chapter sub-pages, per-unit view fragments, generated
box/mission pages, and support surfaces are reachable through their parent module or hub
index rather than being catalog entries themselves. Largest uncataloged areas:

| Area | Uncataloged Files |
|------|-------------------|
| `houses/web/backbone/` | 166 |
| `houses/matrix/piverse/` | 156 |
| `houses/ai/cortex/` | 155 |
| `projects/` | 127 |
| `houses/code/algorithm-chamber/` | 122 |
| `houses/matrix/protocore/` | 103 |
| `houses/code/devops/` | 98 |
| `houses/cloud/api/` | 89 |
| `dark-arts/vault/bug-hunting/` | 70 |
| `houses/matrix/adv-linux/` | 52 |
| `dark-arts/vault/ehe/` | 46 |
| `/` | 45 |
| `houses/code/armory/` | 32 |
| `houses/cloud/modules/` | 31 |
| `dark-arts/vault/` | 30 |
| `dark-arts/vault/wifi-arsenal/` | 28 |
| `houses/code/modules/` | 25 |
| `dark-arts/vault/labs/` | 24 |
| `dark-arts/vault/gates/` | 21 |
| `signal/sections/red-team-hw/` | 19 |
| `houses/forge/applets/` | 13 |
| `dark-arts/vault/modules/` | 12 |
| `tenant/` | 12 |
| `admin/` | 11 |
| `houses/ai/certifications/` | 11 |
| `houses/code/python-for-it/` | 11 |
| `signal/sections/drone-security/` | 11 |
| `signal/sections/esp32-s3-arsenal/` | 11 |
| `signal/sections/home-lab-builds/` | 11 |
| `signal/sections/iot-hacking/` | 11 |

**Recommendation:** Not every page needs a catalog entry. Review the largest areas only
if a track is meant to be independently discoverable via search/landing pages.

---

*Regenerated 2026-07-21 from `ContentCatalog.js` (4,282 modules) cross-referenced against a live `_app/` filesystem walk (5,172 HTML files). Reproduce with `node _tools/reports/gen-content-audit.js`.*
