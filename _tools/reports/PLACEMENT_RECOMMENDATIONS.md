# Placement Recommendations — Phase 3 + 4

**Generated:** 2026-05-02T01:41:31.816Z

## Summary

| Metric | Count |
|---|---:|
| Total cluster recommendations | 21 |
| → To existing hub | 15 clusters / **83 modules** |
| → To proposed new hub | 3 / **39** |
| → To incubation hub | 0 / **0** |
| → CLEANUP (dedupe / roll-up) | 3 / **57** |
| Unmatched (need manual review) | 0 |
| **Total modules covered** | **179** |

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

### `cloud` (57 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| 🧹 `guilab-*` | 19 | 19/0 | — | `CLEANUP: WSA sub-content` | cleanup | cloud-guilab/pslab/quizquiz are WSA child files with auto-derived dup ids. Cleanup: dedupe catalog OR roll up under m01-m19 |
| 🧹 `pslab-*` | 19 | 19/0 | — | `CLEANUP: WSA sub-content` | cleanup | See guilab note |
| 🧹 `quizquiz-*` | 19 | 19/0 | — | `CLEANUP: WSA sub-content` | cleanup | See guilab note |

### `code` (32 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| 🆕 `do-*` | 31 | 31/0 | — | `NEW: houses/code/devops-foundations/index.html` | inline-id | NEW — DevOps Foundations course (do-7 .. do-N). Existing forge/devops/ may be related; verify. |
| ✓ `sp-*` | 1 | 1/0 | Snake Pit (Python Programming) | `houses/code/python-programming/index.html` | inline-id | Snake Pit / COP2891 |

### `eye` (1 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ✓ `wireshark-*` | 1 | 1/0 | Wireshark (Eye) | `houses/eye/index.html` | data-module | Wireshark — eye house, no dedicated hub yet |

### `forensics` (1 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ✓ `df-*` | 1 | 1/0 | Digital Forensics | `houses/eye/forensics/index.html` | data-module | Forensics — single orphan, route to forensics hub |

### `forge` (3 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ✓ `sr-*` | 2 | 2/0 | Server Room | `houses/forge/server-management/index.html` | inline-id | Server Room / CTS1328C |
| ✓ `bm-*` | 1 | 1/0 | Bare Metal (Hardware Support) | `houses/forge/hardware-support/index.html` | inline-id | Bare Metal / CTS1150C |

### `key` (5 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ✓ `tls-*` | 1 | 1/0 | — | `houses/key/index.html` | data-module | Key house landing — only 12 orphans, can absorb |
| ✓ `dont-*` | 1 | 1/0 | Cryptography | `houses/cryptography-track/index.html` | data-module | Cryptography track hub |
| ✓ `hash-*` | 1 | 1/0 | Cryptography | `houses/cryptography-track/index.html` | data-module | Cryptography track hub |
| ✓ `firewall-*` | 1 | 1/0 | Networking | `houses/key/index.html` | data-module | Key house landing — only 12 orphans, can absorb |
| ✓ `gpg-*` | 1 | 1/0 | Cryptography | `houses/cryptography-track/index.html` | data-module | Cryptography track hub |

### `script` (73 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ✓ `clh-*` | 65 | 35/30 | CLH Terminal | `houses/script/courses/clh/index.html` | inline-id | Existing CLH course hub |
| 🆕 `mission-*` | 4 | 4/0 | — | `NEW: houses/script/missions/index.html` | inline-id | NEW — Script Missions incubator. 4 modules. |
| 🆕 `pwsh-*` | 4 | 4/0 | — | `NEW: houses/script/powershell/index.html` | inline-id | NEW — PowerShell hub. 4 modules so far — incubator. |

### `shield` (1 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ✓ `fw-*` | 1 | 1/0 | First Watch (Intro Security) | `houses/shield/intro-security/index.html` | inline-id | First Watch / CTS1120C |

### `web` (4 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ✓ `ccna-*` | 4 | 4/0 | Cisco CCNA | `houses/ccna/index.html` | learning-path | Existing CCNA cert hub (top-level) |

## Tag Legend

- ✓ existing hub (just register ids)
- 🆕 proposed new hub (build then register)
- 🥚 incubation hub (park here, promote later)
- 🧹 cleanup (dedupe/roll-up, not hub assignment)
- ⚠️ unmatched (manual review needed)
