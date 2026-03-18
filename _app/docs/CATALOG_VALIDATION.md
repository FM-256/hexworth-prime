# ContentCatalog Validation Report

**Date:** 2026-03-18
**Wave:** CA-8
**Catalog:** `_app/components/ContentCatalog.js`

---

## Summary

| Metric | Count |
|--------|-------|
| Total catalog modules | 1,832 |
| Modules pointing to existing files | 1,830 |
| Modules pointing to missing files | 2 |
| Total HTML content files (houses + operator) | 2,724 |
| HTML files NOT in catalog | 994 |
| Non-house content areas missing from catalog | 6 |

---

## Entries Pointing to Missing Files

| House | Catalog href | Resolved Path |
|-------|-------------|---------------|
| key | `applets/hashing-lab.html` | `houses/key/applets/hashing-lab.html` |
| code | `games/pod-crossing.html` | `houses/code/games/pod-crossing.html` |

**Recommendation:** Either create these files or remove/update the catalog entries.

---

## Major Content Areas NOT Represented in Catalog

### 1. Houses with Large Uncataloged Sections

| Area | Uncataloged Files | Notes |
|------|-------------------|-------|
| `houses/code/armory/` | 192 | Python Graphics, Web Dev, and other armory tracks |
| `houses/web/backbone/` | 166 | SD-WAN, datacenter, and additional backbone modules |
| `houses/ai/cortex/` | 155 | Adversarial, CNN, deep-learning, generative, math, MLOps |
| `houses/code/algorithm-chamber/` | 122 | Discrete math, graphs, and other algorithm tracks |
| `houses/code/devops/` | 98 | Git, Ansible, cert prep, and CI/CD sections |
| `houses/cloud/api/` | 88 | API pentest, additional cloud API modules |
| `houses/cloud/modules/` | 23 | Windows Server Administration (WSA) modules |
| `houses/code/modules/` | 24 | Python Hub labs (stdlib, graphics) |
| `houses/web/network-essentials/` | 11 | Network essentials track |
| `houses/shield/ms-security/` | 11 | Microsoft Security modules |
| `houses/script/exams/` | 9 | Python exam chapters |
| `houses/forge/applets/` | 9 | CompTIA A+ domain applets |

### 2. Non-House Content Areas Entirely Missing from Catalog

| Area | Files | Description |
|------|-------|-------------|
| `dark-arts/vault/` | 221 | Bug hunting labs, Linux credential/hidden-file labs, vault content (59 are cataloged via dark-arts house, 162 are not) |
| `signal/sections/` | 39 | Signal field-prep and section content |
| `signal/toolkit/` | 21 | Signal toolkit tool pages (Ventoy, etc.) |
| `forensics/sections/` | 26 | Disk forensics, log-timeline, memory forensics modules (12 cataloged, 14 not) |
| `arena/boxes/` | 22 | CTF Arena box pages (not represented at all) |
| `arctic/districts/` | 16 | Arctic district content |
| `dispatch/boxes/` | 5 | IT Dispatch troubleshooting boxes |

---

## Recommendations

1. **Fix 2 broken entries** -- `key/applets/hashing-lab.html` and `code/games/pod-crossing.html` either need to be created or their catalog entries removed.

2. **Add Cortex content** -- 155 AI Cortex files (adversarial, CNN, deep-learning, generative, math, MLOps) are fully built but missing from the catalog. This is the largest single gap in searchability.

3. **Add Algorithm Chamber** -- 122 files across discrete-math, graphs, and other algorithm tracks are uncataloged.

4. **Add Backbone modules** -- 166 Web Backbone files (SD-WAN, datacenter, QoS expansions, routing) are missing.

5. **Add Code Armory** -- 192 files in Python Graphics, Web Dev, and related armory tracks are not searchable.

6. **Add DevOps section** -- 98 DevOps files (Git, Ansible, cert prep) are uncataloged.

7. **Consider non-house areas** -- Arena (22 boxes), Signal (60 files), Dispatch (5 boxes), and Arctic (16 districts) are product-level features that may warrant catalog entries or a separate index.

8. **Do NOT bulk-add** -- Each area should be reviewed for correct metadata (status, components, category, description) before adding to the catalog. A scripted bulk-add would create low-quality entries.

---

*Validated against ContentCatalog.js (1,832 modules) and CONTENT_AUDIT.json (3,231 files).*
