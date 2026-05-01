# Placement Recommendations — Phase 3 + 4

**Generated:** 2026-05-01T15:04:23.234Z

## Summary

| Metric | Count |
|---|---:|
| Total cluster recommendations | 52 |
| → To existing hub | 38 clusters / **701 modules** |
| → To proposed new hub | 10 / **293** |
| → To incubation hub | 1 / **3** |
| → CLEANUP (dedupe / roll-up) | 3 / **57** |
| Unmatched (need manual review) | 0 |
| **Total modules covered** | **1054** |

## Recommendation Types

- **EXISTING HUB** — hub already exists; just needs the orphan ids registered (data-module attr OR inline JS array OR LearningPath modules array).
- **PROPOSED NEW HUB** — sufficient module mass + clear curriculum scope to justify a new dedicated hub. Build it as part of Stragglers follow-up sprint.
- **INCUBATION HUB** — orphans without strong curriculum identity yet. Park them in a per-house incubator for visibility; promote to dedicated hub when ≥10 modules cluster around a clear topic.
- **CLEANUP** — these aren't really orphans-needing-placement; they're catalog artifacts (autogen dup ids, sub-content of in-hub parents). Need dedupe or roll-up, not hub assignment.

## Per-House Placement Plan


### `ai` (2 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ✓ `text-*` | 1 | 1/0 | — | `houses/ai/index.html` | data-module | AI house landing — only 2 orphans |
| ✓ `agent-*` | 1 | 1/0 | — | `houses/ai/index.html` | data-module | AI house landing — only 2 orphans |

### `cloud` (88 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ✓ `cse-*` | 19 | 19/0 | EC-Council Cloud Security Engineer (CSE) | `houses/cloud/cse/index.html` | data-module | Existing CSE cert hub (cloud house) |
| 🧹 `guilab-*` | 19 | 19/0 | — | `CLEANUP: WSA sub-content` | cleanup | cloud-guilab/pslab/quizquiz are WSA child files with auto-derived dup ids. Cleanup: dedupe catalog OR roll up under m01-m19 |
| 🧹 `pslab-*` | 19 | 19/0 | — | `CLEANUP: WSA sub-content` | cleanup | See guilab note |
| 🧹 `quizquiz-*` | 19 | 19/0 | — | `CLEANUP: WSA sub-content` | cleanup | See guilab note |
| ✓ `wsa-*` | 6 | 6/0 | — | `houses/cloud/modules/wsa/index.html` | data-module | Existing WSA hub |
| ✓ `openstack-*` | 4 | 4/0 | — | `houses/cloud/openstack/index.html` | data-module | Existing OpenStack hub |
| ✓ `aws-*` | 2 | 2/0 | AWS | `houses/aws-ccp/index.html` | learning-path | AWS topics — assign to AWS CCP hub (most general) |

### `code` (223 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| 🆕 `arm-*` | 160 | 160/0 | — | `NEW: houses/code/arm-assembly/index.html` | inline-id | NEW — ARM Assembly course hub. 160 modules across asm/bash/c/cpp/go/rust/etc. variants. Needs grouping by language and level. |
| 🆕 `do-*` | 31 | 31/0 | — | `NEW: houses/code/devops-foundations/index.html` | inline-id | NEW — DevOps Foundations course (do-7 .. do-N). Existing forge/devops/ may be related; verify. |
| ✓ `pfi-*` | 31 | 31/0 | Python Programming | `houses/code/python-for-it/index.html` | data-module | Existing PFI course hub — likely just needs data-module attrs added |
| ✓ `sp-*` | 1 | 1/0 | Snake Pit (Python Programming) | `houses/code/python-programming/index.html` | inline-id | Snake Pit / COP2891 |

### `dark-arts` (43 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ✓ `feh-*` | 21 | 21/0 | Dark Arts Feh | `houses/dark-arts/feh/index.html` | inline-id | Existing Feh course hub |
| 🆕 `da-*` | 14 | 14/0 | — | `NEW: houses/dark-arts/vault-labs/index.html` | inline-id | NEW — Vault Labs hub. da-* prefix lab series. |
| 🆕 `dark-*` | 8 | 8/0 | OSINT | `NEW: houses/dark-arts/vault-labs/index.html` | inline-id | NEW — Vault Labs hub. dark-* prefix lab series. |

### `divergent` (15 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ✓ `eth-*` | 15 | 15/0 | CIS4253 Ethics in IT | `houses/divergent/ethics-it/index.html` | inline-id | CIS4253 Ethics in IT |

### `eye` (102 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ✓ `cyberops-*` | 85 | 85/0 | Incident Response | `houses/eye/modules/cyberops/index.html` | data-module | Existing CyberOps course |
| ✓ `cysa-*` | 16 | 16/0 | CompTIA CySA+ (CS0-003) | `houses/cysa-plus/index.html` | learning-path | Existing CySA+ cert hub |
| ✓ `wireshark-*` | 1 | 1/0 | Wireshark (Eye) | `houses/eye/index.html` | data-module | Wireshark — eye house, no dedicated hub yet |

### `forensics` (1 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ✓ `df-*` | 1 | 1/0 | Digital Forensics | `houses/eye/forensics/index.html` | data-module | Forensics — single orphan, route to forensics hub |

### `forge` (124 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ✓ `core2-*` | 47 | 47/0 | — | `houses/aplus-core2/index.html` | learning-path | A+ Core 2 (220-1102) |
| ✓ `core1-*` | 40 | 40/0 | — | `houses/aplus-core1/index.html` | learning-path | A+ Core 1 (220-1101) |
| ✓ `md100-*` | 14 | 14/0 | — | `houses/forge/md-100/index.html` | data-module | Existing MD-100 hub |
| ✓ `aplus-*` | 11 | 11/0 | CompTIA A+ Core 1 | `houses/aplus-core1/index.html` | learning-path | Existing A+ Core 1 cert hub |
| ✓ `md101-*` | 9 | 9/0 | — | `houses/forge/md-101/index.html` | data-module | Existing MD-101 hub |
| ✓ `sr-*` | 2 | 2/0 | Server Room | `houses/forge/server-management/index.html` | inline-id | Server Room / CTS1328C |
| ✓ `bm-*` | 1 | 1/0 | Bare Metal (Hardware Support) | `houses/forge/hardware-support/index.html` | inline-id | Bare Metal / CTS1150C |

### `key` (12 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ✓ `crypto-*` | 3 | 3/0 | Cryptography | `houses/cryptography-track/index.html` | data-module | Cryptography track hub |
| ✓ `cipher-*` | 2 | 2/0 | Cryptography | `houses/cryptography-track/index.html` | data-module | Cryptography track hub |
| ✓ `encryption-*` | 2 | 2/0 | Cryptography | `houses/cryptography-track/index.html` | data-module | Cryptography track hub |
| ✓ `tls-*` | 1 | 1/0 | — | `houses/key/index.html` | data-module | Key house landing — only 12 orphans, can absorb |
| ✓ `dont-*` | 1 | 1/0 | Cryptography | `houses/cryptography-track/index.html` | data-module | Cryptography track hub |
| ✓ `hash-*` | 1 | 1/0 | Cryptography | `houses/cryptography-track/index.html` | data-module | Cryptography track hub |
| ✓ `firewall-*` | 1 | 1/0 | Networking | `houses/key/index.html` | data-module | Key house landing — only 12 orphans, can absorb |
| ✓ `gpg-*` | 1 | 1/0 | Cryptography | `houses/cryptography-track/index.html` | data-module | Cryptography track hub |

### `matrix` (39 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ✓ `op-*` | 24 | 24/0 | Python Programming | `houses/matrix/protocore/index.html` | inline-id | Op-* Python modules — Protocore (matrix) |
| ✓ `ala-*` | 15 | 15/0 | The Matrix | `houses/matrix/adv-linux/index.html` | inline-id | Adv Linux Administration |

### `script` (208 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ✓ `clh-*` | 127 | 97/30 | CLH Terminal | `houses/script/courses/clh/index.html` | inline-id | Existing CLH course hub |
| 🆕 `db-*` | 35 | 35/0 | SQL / Databases | `NEW: houses/script/databases/index.html` | inline-id | NEW — Script Databases hub (db-01 .. db-NN). 35 modules. Could be SQL fundamentals course. |
| ✓ `ra-*` | 24 | 24/0 | Linux Ascent (Linux Essentials) | `houses/script/linux/index.html` | inline-id | Existing Linux Administration course (la-) |
| 🆕 `bash-*` | 14 | 14/0 | — | `NEW: houses/script/bash-mastery/index.html` | inline-id | NEW — Bash Mastery hub. 14 modules. |
| 🆕 `mission-*` | 4 | 4/0 | — | `NEW: houses/script/missions/index.html` | inline-id | NEW — Script Missions incubator. 4 modules. |
| 🆕 `pwsh-*` | 4 | 4/0 | — | `NEW: houses/script/powershell/index.html` | inline-id | NEW — PowerShell hub. 4 modules so far — incubator. |

### `shield` (35 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| 🆕 `cmmc-*` | 15 | 15/0 | Shield (Security) | `NEW: houses/shield/cmmc/index.html` | data-module | NEW hub WRAPPER over existing applets. The 15 cmmc-* catalog ids point to applet files at houses/shield/applets/compliance/cmmc_* (17 applet dirs already exist). Build = a cards-grid index.html that registers the 15 catalog ids; applet files unchanged. |
| ✓ `cf-*` | 8 | 8/0 | Shield (Security) | `houses/shield/cyber-framework/index.html` | data-module | Existing Cyber Framework hub |
| 🆕 `sec101-*` | 8 | 8/0 | Shield (Security) | `NEW: houses/shield/sec-101/index.html` | inline-id | NEW — Sec-101 module series (8 modules). Could roll up into First Watch or stand alone. |
| 🥚 `cse-*` | 3 | 3/0 | EC-Council Cloud Security Engineer (CSE) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | PARK pending operator decision (STR-26): titled "CSE:" = EC-Council Cloud Security Engineer cert content; parallel files exist at cloud-cse-* in cloud house. Decide: re-house to cloud (delete parallels), or keep as shield-side cert prep companion (cross-link to cloud/cse/). |
| ✓ `fw-*` | 1 | 1/0 | First Watch (Intro Security) | `houses/shield/intro-security/index.html` | inline-id | First Watch / CTS1120C |

### `web` (162 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ✓ `np-*` | 108 | 108/0 | Networking | `houses/web/network-plus/index.html` | data-module | Existing Network+ study hub (web) |
| ✓ `ccna-*` | 40 | 40/0 | Cisco CCNA | `houses/ccna/index.html` | learning-path | Existing CCNA cert hub (top-level) |
| ✓ `ip-*` | 14 | 14/0 | — | `houses/web/network-plus/index.html` | data-module | IP addressing → Network+ hub |

## Tag Legend

- ✓ existing hub (just register ids)
- 🆕 proposed new hub (build then register)
- 🥚 incubation hub (park here, promote later)
- 🧹 cleanup (dedupe/roll-up, not hub assignment)
- ⚠️ unmatched (manual review needed)
