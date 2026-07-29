# Placement Recommendations — Phase 3 + 4

**Generated:** 2026-07-29T03:30:49.376Z

## Summary

| Metric | Count |
|---|---:|
| Total cluster recommendations | 56 |
| → To existing hub | 11 clusters / **402 modules** |
| → To proposed new hub | 1 / **1** |
| → To incubation hub | 36 / **129** |
| → CLEANUP (dedupe / roll-up) | 0 / **0** |
| Unmatched (need manual review) | 8 |
| **Total modules covered** | **564** |

## Recommendation Types

- **EXISTING HUB** — hub already exists; just needs the orphan ids registered (data-module attr OR inline JS array OR LearningPath modules array).
- **PROPOSED NEW HUB** — sufficient module mass + clear curriculum scope to justify a new dedicated hub. Build it as part of Stragglers follow-up sprint.
- **INCUBATION HUB** — orphans without strong curriculum identity yet. Park them in a per-house incubator for visibility; promote to dedicated hub when ≥10 modules cluster around a clear topic.
- **CLEANUP** — these aren't really orphans-needing-placement; they're catalog artifacts (autogen dup ids, sub-content of in-hub parents). Need dedupe or roll-up, not hub assignment.

## Per-House Placement Plan


### `cloud` (14 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ✓ `aws-*` | 8 | 8/0 | AWS | `houses/aws-ccp/index.html` | learning-path | AWS topics — assign to AWS CCP hub (most general) |
| 🥚 `iam-*` | 1 | 1/0 | AWS | `NEW (incubation): houses/cloud/incubator/index.html` | inline-id | Catch-all incubation hub for cloud orphans |
| 🥚 `storage-*` | 1 | 1/0 | AWS | `NEW (incubation): houses/cloud/incubator/index.html` | inline-id | Catch-all incubation hub for cloud orphans |
| 🥚 `database-*` | 1 | 1/0 | AWS | `NEW (incubation): houses/cloud/incubator/index.html` | inline-id | Catch-all incubation hub for cloud orphans |
| 🥚 `networking-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/cloud/incubator/index.html` | inline-id | Catch-all incubation hub for cloud orphans |
| 🥚 `fundamentals-*` | 1 | 1/0 | Cloud | `NEW (incubation): houses/cloud/incubator/index.html` | inline-id | Catch-all incubation hub for cloud orphans |
| 🥚 `careers-*` | 1 | 1/0 | Cloud | `NEW (incubation): houses/cloud/incubator/index.html` | inline-id | Catch-all incubation hub for cloud orphans |

### `dark-arts` (32 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| 🥚 `vault-*` | 30 | 30/0 | Cloud | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `wifi-*` | 1 | 1/0 | — | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `careers-*` | 1 | 1/0 | — | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |

### `eye` (1 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| 🥚 `careers-*` | 1 | 1/0 | Digital Forensics | `NEW (incubation): houses/eye/incubator/index.html` | inline-id | Catch-all incubation hub for eye orphans |

### `forge` (1 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| 🥚 `careers-*` | 1 | 1/0 | — | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |

### `matrix` (367 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ✓ `piverse-*` | 150 | 150/0 | The Matrix | `houses/matrix/index.html` | data-module | Matrix house landing — small orphan count, can absorb directly |
| ✓ `protocore-*` | 102 | 102/0 | The Matrix | `houses/matrix/index.html` | data-module | Matrix house landing — small orphan count, can absorb directly |
| ✓ `operator-*` | 96 | 96/0 | Operator Missions | `houses/matrix/index.html` | data-module | Operator Missions — matrix landing |
| ✓ `adv-*` | 18 | 18/0 | The Matrix | `houses/matrix/index.html` | data-module | Matrix house landing — small orphan count, can absorb directly |
| ✓ `careers-*` | 1 | 1/0 | The Matrix | `houses/matrix/index.html` | data-module | Matrix house landing — small orphan count, can absorb directly |

### `platform` (9 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ⚠️ `career-*` | 4 | 4/0 | — | `*UNMATCHED*` | ? | No rule matched — manual review |
| ⚠️ `interview-*` | 1 | 1/0 | — | `*UNMATCHED*` | ? | No rule matched — manual review |
| ⚠️ `resume-*` | 1 | 1/0 | — | `*UNMATCHED*` | ? | No rule matched — manual review |
| ⚠️ `salary-*` | 1 | 1/0 | — | `*UNMATCHED*` | ? | No rule matched — manual review |
| ⚠️ `internships-*` | 1 | 1/0 | — | `*UNMATCHED*` | ? | No rule matched — manual review |
| ⚠️ `job-*` | 1 | 1/0 | — | `*UNMATCHED*` | ? | No rule matched — manual review |

### `script` (10 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| 🥚 `exams-*` | 8 | 8/0 | — | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `zero-*` | 1 | 1/0 | Python Programming | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `linux-*` | 1 | 1/0 | Linux | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |

### `shield` (83 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ✓ `secplus-*` | 15 | 15/0 | CompTIA Security+ (SY0-701) | `houses/security-plus/index.html` | learning-path | Existing Sec+ cert hub |
| 🥚 `threat-*` | 13 | 13/0 | Shield (Security) | `NEW (incubation): houses/shield/threat-detection-lab/index.html` | inline-id | INCUBATION — Threat Detection Lab. 17 mods: runner, swarm, botnets — game-style. Park here until topic resolves to Sec+/CySA+ alignment. |
| 🥚 `pbq-*` | 12 | 12/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `sp-*` | 9 | 9/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `pis-*` | 6 | 6/0 | — | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `crypto-*` | 5 | 5/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `sy0-*` | 4 | 4/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| ✓ `security-*` | 3 | 3/0 | CompTIA Security+ (SY0-701) | `houses/security-plus/index.html` | learning-path | Existing Sec+ cert hub |
| 🆕 `cmmc-*` | 1 | 1/0 | Shield (Security) | `NEW: houses/shield/cmmc/index.html` | data-module | NEW hub WRAPPER over existing applets. The 15 cmmc-* catalog ids point to applet files at houses/shield/applets/compliance/cmmc_* (17 applet dirs already exist). Build = a cards-grid index.html that registers the 15 catalog ids; applet files unchanged. |
| 🥚 `cryptomatch-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `hangman-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `crime-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `secure-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `cve-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| ✓ `cysa-*` | 1 | 1/0 | CompTIA CySA+ (CS0-003) | `houses/cysa-plus/index.html` | learning-path | Existing CySA+ cert hub |
| 🥚 `pentest-*` | 1 | 1/0 | CompTIA PenTest+ | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `malware-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `cookies-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `cyberscramble-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `ethical-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `hatmatch-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `laws-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `careers-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `presentations-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |

### `signal` (23 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ⚠️ `toolkit-*` | 22 | 22/0 | — | `*UNMATCHED*` | ? | No rule matched — manual review |
| ⚠️ `careers-*` | 1 | 1/0 | — | `*UNMATCHED*` | ? | No rule matched — manual review |

### `web` (24 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| 🥚 `labs-*` | 15 | 15/0 | Networking | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| ✓ `network-*` | 7 | 7/0 | CompTIA Network+ | `houses/comptia-network/index.html` | learning-path | Existing Net+ cert hub |
| 🥚 `careers-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| ✓ `exams-*` | 1 | 1/0 | CompTIA Network+ | `houses/comptia-network/index.html` | learning-path | Existing Net+ cert hub |

## Tag Legend

- ✓ existing hub (just register ids)
- 🆕 proposed new hub (build then register)
- 🥚 incubation hub (park here, promote later)
- 🧹 cleanup (dedupe/roll-up, not hub assignment)
- ⚠️ unmatched (manual review needed)
