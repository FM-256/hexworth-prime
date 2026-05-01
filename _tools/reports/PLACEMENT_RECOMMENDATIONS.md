# Placement Recommendations — Phase 3 + 4

**Generated:** 2026-05-01T04:10:20.035Z

## Summary

| Metric | Count |
|---|---:|
| Total cluster recommendations | 319 |
| → To existing hub | 39 clusters / **704 modules** |
| → To proposed new hub | 10 / **293** |
| → To incubation hub | 267 / **489** |
| → CLEANUP (dedupe / roll-up) | 3 / **57** |
| Unmatched (need manual review) | 0 |
| **Total modules covered** | **1543** |

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

### `cloud` (115 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ✓ `cse-*` | 19 | 19/0 | CIS2253 Cybersecurity Ethics | `houses/divergent/cybersecurity-ethics/index.html` | inline-id | CIS2253 Cybersecurity Ethics (currently divergent) |
| 🧹 `guilab-*` | 19 | 19/0 | — | `CLEANUP: WSA sub-content` | cleanup | cloud-guilab/pslab/quizquiz are WSA child files with auto-derived dup ids. Cleanup: dedupe catalog OR roll up under m01-m19 |
| 🧹 `pslab-*` | 19 | 19/0 | — | `CLEANUP: WSA sub-content` | cleanup | See guilab note |
| 🧹 `quizquiz-*` | 19 | 19/0 | — | `CLEANUP: WSA sub-content` | cleanup | See guilab note |
| ✓ `wsa-*` | 6 | 6/0 | — | `houses/cloud/modules/wsa/index.html` | data-module | Existing WSA hub |
| 🥚 `dont-*` | 4 | 4/0 | — | `NEW (incubation): houses/cloud/incubator/index.html` | inline-id | Catch-all incubation hub for cloud orphans |
| 🥚 `cloud-*` | 4 | 4/0 | Cloud | `NEW (incubation): houses/cloud/incubator/index.html` | inline-id | Catch-all incubation hub for cloud orphans |
| ✓ `openstack-*` | 4 | 4/0 | — | `houses/cloud/openstack/index.html` | data-module | Existing OpenStack hub |
| 🥚 `architecture-*` | 2 | 2/0 | Cloud | `NEW (incubation): houses/cloud/incubator/index.html` | inline-id | Catch-all incubation hub for cloud orphans |
| ✓ `aws-*` | 2 | 2/0 | AWS | `houses/aws-ccp/index.html` | learning-path | AWS topics — assign to AWS CCP hub (most general) |
| 🥚 `support-*` | 1 | 1/0 | AWS | `NEW (incubation): houses/cloud/incubator/index.html` | inline-id | Catch-all incubation hub for cloud orphans |
| 🥚 `regions-*` | 1 | 1/0 | AWS | `NEW (incubation): houses/cloud/incubator/index.html` | inline-id | Catch-all incubation hub for cloud orphans |
| 🥚 `ec2-*` | 1 | 1/0 | — | `NEW (incubation): houses/cloud/incubator/index.html` | inline-id | Catch-all incubation hub for cloud orphans |
| 🥚 `use-*` | 1 | 1/0 | AWS | `NEW (incubation): houses/cloud/incubator/index.html` | inline-id | Catch-all incubation hub for cloud orphans |
| 🥚 `visualizer-*` | 1 | 1/0 | Cloud | `NEW (incubation): houses/cloud/incubator/index.html` | inline-id | Catch-all incubation hub for cloud orphans |
| 🥚 `lab-*` | 1 | 1/0 | Cloud | `NEW (incubation): houses/cloud/incubator/index.html` | inline-id | Catch-all incubation hub for cloud orphans |
| 🥚 `presentation-*` | 1 | 1/0 | Cloud | `NEW (incubation): houses/cloud/incubator/index.html` | inline-id | Catch-all incubation hub for cloud orphans |
| 🥚 `comparison-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/cloud/incubator/index.html` | inline-id | Catch-all incubation hub for cloud orphans |
| 🥚 `security-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/cloud/incubator/index.html` | inline-id | Catch-all incubation hub for cloud orphans |
| 🥚 `iam-*` | 1 | 1/0 | AWS | `NEW (incubation): houses/cloud/incubator/index.html` | inline-id | Catch-all incubation hub for cloud orphans |
| 🥚 `ad-*` | 1 | 1/0 | — | `NEW (incubation): houses/cloud/incubator/index.html` | inline-id | Catch-all incubation hub for cloud orphans |
| 🥚 `whoami-*` | 1 | 1/0 | Cloud | `NEW (incubation): houses/cloud/incubator/index.html` | inline-id | Catch-all incubation hub for cloud orphans |
| 🥚 `destroyer-*` | 1 | 1/0 | Cloud | `NEW (incubation): houses/cloud/incubator/index.html` | inline-id | Catch-all incubation hub for cloud orphans |
| 🥚 `save-*` | 1 | 1/0 | Docker / Containers | `NEW (incubation): houses/cloud/incubator/index.html` | inline-id | Catch-all incubation hub for cloud orphans |
| 🥚 `gui-*` | 1 | 1/0 | — | `NEW (incubation): houses/cloud/incubator/index.html` | inline-id | Catch-all incubation hub for cloud orphans |
| 🥚 `ps-*` | 1 | 1/0 | — | `NEW (incubation): houses/cloud/incubator/index.html` | inline-id | Catch-all incubation hub for cloud orphans |
| 🥚 `quiz-*` | 1 | 1/0 | — | `NEW (incubation): houses/cloud/incubator/index.html` | inline-id | Catch-all incubation hub for cloud orphans |

### `code` (249 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| 🆕 `arm-*` | 160 | 160/0 | — | `NEW: houses/code/arm-assembly/index.html` | inline-id | NEW — ARM Assembly course hub. 160 modules across asm/bash/c/cpp/go/rust/etc. variants. Needs grouping by language and level. |
| 🆕 `do-*` | 31 | 31/0 | — | `NEW: houses/code/devops-foundations/index.html` | inline-id | NEW — DevOps Foundations course (do-7 .. do-N). Existing forge/devops/ may be related; verify. |
| ✓ `pfi-*` | 31 | 31/0 | Python Programming | `houses/code/python-for-it/index.html` | data-module | Existing PFI course hub — likely just needs data-module attrs added |
| 🥚 `kubernetes-*` | 3 | 3/0 | Kubernetes | `NEW (incubation): houses/code/incubator/index.html` | inline-id | Catch-all incubation hub for code orphans |
| 🥚 `cloudformation-*` | 2 | 2/0 | Cloud | `NEW (incubation): houses/code/incubator/index.html` | inline-id | Catch-all incubation hub for code orphans |
| 🥚 `docker-*` | 2 | 2/0 | Docker / Containers | `NEW (incubation): houses/code/incubator/index.html` | inline-id | Catch-all incubation hub for code orphans |
| 🥚 `git-*` | 2 | 2/0 | — | `NEW (incubation): houses/code/incubator/index.html` | inline-id | Catch-all incubation hub for code orphans |
| 🥚 `api-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/code/incubator/index.html` | inline-id | Catch-all incubation hub for code orphans |
| 🥚 `devnet-*` | 1 | 1/0 | Python Programming | `NEW (incubation): houses/code/incubator/index.html` | inline-id | Catch-all incubation hub for code orphans |
| 🥚 `sprint-*` | 1 | 1/0 | — | `NEW (incubation): houses/code/incubator/index.html` | inline-id | Catch-all incubation hub for code orphans |
| 🥚 `cicd-*` | 1 | 1/0 | — | `NEW (incubation): houses/code/incubator/index.html` | inline-id | Catch-all incubation hub for code orphans |
| 🥚 `terraform-*` | 1 | 1/0 | — | `NEW (incubation): houses/code/incubator/index.html` | inline-id | Catch-all incubation hub for code orphans |
| 🥚 `data-*` | 1 | 1/0 | — | `NEW (incubation): houses/code/incubator/index.html` | inline-id | Catch-all incubation hub for code orphans |
| 🥚 `ansible-*` | 1 | 1/0 | — | `NEW (incubation): houses/code/incubator/index.html` | inline-id | Catch-all incubation hub for code orphans |
| 🥚 `dont-*` | 1 | 1/0 | Docker / Containers | `NEW (incubation): houses/code/incubator/index.html` | inline-id | Catch-all incubation hub for code orphans |
| 🥚 `pipeline-*` | 1 | 1/0 | — | `NEW (incubation): houses/code/incubator/index.html` | inline-id | Catch-all incubation hub for code orphans |
| 🥚 `kill-*` | 1 | 1/0 | — | `NEW (incubation): houses/code/incubator/index.html` | inline-id | Catch-all incubation hub for code orphans |
| 🥚 `rmrf-*` | 1 | 1/0 | — | `NEW (incubation): houses/code/incubator/index.html` | inline-id | Catch-all incubation hub for code orphans |
| 🥚 `build-*` | 1 | 1/0 | — | `NEW (incubation): houses/code/incubator/index.html` | inline-id | Catch-all incubation hub for code orphans |
| 🥚 `pod-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/code/incubator/index.html` | inline-id | Catch-all incubation hub for code orphans |
| 🥚 `unit-*` | 1 | 1/0 | — | `NEW (incubation): houses/code/incubator/index.html` | inline-id | Catch-all incubation hub for code orphans |
| 🥚 `devops-*` | 1 | 1/0 | Kubernetes | `NEW (incubation): houses/code/incubator/index.html` | inline-id | Catch-all incubation hub for code orphans |
| 🥚 `pye-*` | 1 | 1/0 | Python Programming | `NEW (incubation): houses/code/incubator/index.html` | inline-id | Catch-all incubation hub for code orphans |
| 🥚 `pyh-*` | 1 | 1/0 | Python Programming | `NEW (incubation): houses/code/incubator/index.html` | inline-id | Catch-all incubation hub for code orphans |
| ✓ `sp-*` | 1 | 1/0 | Snake Pit (Python Programming) | `houses/code/python-programming/index.html` | inline-id | Snake Pit / COP2891 |

### `dark-arts` (88 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ✓ `feh-*` | 21 | 21/0 | Dark Arts Feh | `houses/dark-arts/feh/index.html` | inline-id | Existing Feh course hub |
| 🆕 `da-*` | 14 | 14/0 | — | `NEW: houses/dark-arts/vault-labs/index.html` | inline-id | NEW — Vault Labs hub. da-* prefix lab series. |
| 🆕 `dark-*` | 8 | 8/0 | OSINT | `NEW: houses/dark-arts/vault-labs/index.html` | inline-id | NEW — Vault Labs hub. dark-* prefix lab series. |
| 🥚 `malware-*` | 2 | 2/0 | Malware Analysis | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `nmap-*` | 2 | 2/0 | Networking | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `network-*` | 2 | 2/0 | Networking | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `cyberops-*` | 1 | 1/0 | Incident Response | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `five-*` | 1 | 1/0 | — | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `the-*` | 1 | 1/0 | Malware Analysis | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `sandbox-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `static-*` | 1 | 1/0 | Malware Analysis | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `dynamic-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `reverse-*` | 1 | 1/0 | — | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `analysis-*` | 1 | 1/0 | — | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `john-*` | 1 | 1/0 | — | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `hashcat-*` | 1 | 1/0 | — | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `metasploit-*` | 1 | 1/0 | — | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `hydra-*` | 1 | 1/0 | — | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `mastery-*` | 1 | 1/0 | Malware Analysis | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `cyber-*` | 1 | 1/0 | — | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `sql-*` | 1 | 1/0 | SQL / Databases | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `xss-*` | 1 | 1/0 | — | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `ctf-*` | 1 | 1/0 | — | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `password-*` | 1 | 1/0 | — | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `wireless-*` | 1 | 1/0 | — | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `dos-*` | 1 | 1/0 | — | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `session-*` | 1 | 1/0 | — | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `iot-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `botnet-*` | 1 | 1/0 | — | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `owasp-*` | 1 | 1/0 | — | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `ids-*` | 1 | 1/0 | Firewalls | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `cloud-*` | 1 | 1/0 | Cloud | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `mobile-*` | 1 | 1/0 | — | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `steganography-*` | 1 | 1/0 | — | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `buffer-*` | 1 | 1/0 | — | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `enumeration-*` | 1 | 1/0 | — | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `footprinting-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `privilege-*` | 1 | 1/0 | Linux | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `social-*` | 1 | 1/0 | — | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `ceh-*` | 1 | 1/0 | EC-Council CEH | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `csrf-*` | 1 | 1/0 | — | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `ssrf-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `idor-*` | 1 | 1/0 | — | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `jwt-*` | 1 | 1/0 | — | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |
| 🥚 `sample-*` | 1 | 1/0 | — | `NEW (incubation): houses/dark-arts/incubator/index.html` | inline-id | Catch-all incubation hub for dark-arts orphans |

### `divergent` (15 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ✓ `eth-*` | 15 | 15/0 | CIS4253 Ethics in IT | `houses/divergent/ethics-it/index.html` | inline-id | CIS4253 Ethics in IT |

### `eye` (111 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ✓ `cyberops-*` | 85 | 85/0 | Incident Response | `houses/eye/modules/cyberops/index.html` | data-module | Existing CyberOps course |
| ✓ `cysa-*` | 16 | 16/0 | CompTIA CySA+ (CS0-003) | `houses/cysa-plus/index.html` | learning-path | Existing CySA+ cert hub |
| 🥚 `log-*` | 2 | 2/0 | Digital Forensics | `NEW (incubation): houses/eye/incubator/index.html` | inline-id | Catch-all incubation hub for eye orphans |
| 🥚 `google-*` | 1 | 1/0 | OSINT | `NEW (incubation): houses/eye/incubator/index.html` | inline-id | Catch-all incubation hub for eye orphans |
| 🥚 `dont-*` | 1 | 1/0 | OSINT | `NEW (incubation): houses/eye/incubator/index.html` | inline-id | Catch-all incubation hub for eye orphans |
| 🥚 `alert-*` | 1 | 1/0 | — | `NEW (incubation): houses/eye/incubator/index.html` | inline-id | Catch-all incubation hub for eye orphans |
| 🥚 `incident-*` | 1 | 0/1 | Incident Response | `NEW (incubation): houses/eye/incubator/index.html` | inline-id | Catch-all incubation hub for eye orphans |
| 🥚 `threat-*` | 1 | 1/0 | Cloud | `NEW (incubation): houses/eye/incubator/index.html` | inline-id | Catch-all incubation hub for eye orphans |
| 🥚 `grep-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/eye/incubator/index.html` | inline-id | Catch-all incubation hub for eye orphans |
| ✓ `wireshark-*` | 1 | 1/0 | Wireshark (Eye) | `houses/eye/index.html` | data-module | Wireshark — eye house, no dedicated hub yet |
| 🥚 `kill-*` | 1 | 1/0 | — | `NEW (incubation): houses/eye/incubator/index.html` | inline-id | Catch-all incubation hub for eye orphans |

### `forensics` (1 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ✓ `df-*` | 1 | 1/0 | Digital Forensics | `houses/eye/forensics/index.html` | data-module | Forensics — single orphan, route to forensics hub |

### `forge` (181 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ✓ `core2-*` | 47 | 47/0 | — | `houses/aplus-core2/index.html` | learning-path | A+ Core 2 (220-1102) |
| ✓ `core1-*` | 40 | 40/0 | — | `houses/aplus-core1/index.html` | learning-path | A+ Core 1 (220-1101) |
| ✓ `md100-*` | 14 | 14/0 | — | `houses/forge/md-100/index.html` | data-module | Existing MD-100 hub |
| ✓ `aplus-*` | 11 | 11/0 | CompTIA A+ Core 1 | `houses/aplus-core1/index.html` | learning-path | Existing A+ Core 1 cert hub |
| ✓ `md101-*` | 9 | 9/0 | — | `houses/forge/md-101/index.html` | data-module | Existing MD-101 hub |
| 🥚 `windows-*` | 6 | 6/0 | — | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `admin-*` | 3 | 3/0 | — | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `control-*` | 3 | 3/0 | — | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `system-*` | 3 | 3/0 | — | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `storage-*` | 2 | 2/0 | — | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `settings-*` | 2 | 2/0 | — | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `backup-*` | 2 | 2/0 | — | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `cpu-*` | 2 | 2/0 | — | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `mobile-*` | 2 | 2/0 | — | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `network-*` | 2 | 2/0 | Networking | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `raid-*` | 2 | 2/0 | — | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `dont-*` | 2 | 2/0 | Networking | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `hardware-*` | 2 | 2/0 | — | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `os-*` | 2 | 2/0 | — | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `windows10-*` | 2 | 2/0 | — | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `fb-*` | 2 | 2/0 | — | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| ✓ `sr-*` | 2 | 2/0 | Server Room | `houses/forge/server-management/index.html` | inline-id | Server Room / CTS1328C |
| 🥚 `peripherals-*` | 1 | 1/0 | — | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `command-*` | 1 | 1/0 | Linux | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `display-*` | 1 | 1/0 | — | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `hard-*` | 1 | 1/0 | — | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `laptop-*` | 1 | 1/0 | — | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `motherboards-*` | 1 | 1/0 | — | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `multimeter-*` | 1 | 1/0 | — | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `power-*` | 1 | 1/0 | — | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `ram-*` | 1 | 1/0 | — | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `virtualization-*` | 1 | 1/0 | — | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `macos-*` | 1 | 1/0 | Linux | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `binary-*` | 1 | 1/0 | — | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `fsck-*` | 1 | 1/0 | — | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `bit-*` | 1 | 1/0 | — | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `root-*` | 1 | 1/0 | Malware Analysis | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `rack-*` | 1 | 1/0 | — | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `chip-*` | 1 | 1/0 | — | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
| 🥚 `troubleshoot-*` | 1 | 1/0 | — | `NEW (incubation): houses/forge/incubator/index.html` | inline-id | Catch-all incubation hub for forge orphans |
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

### `script` (356 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ✓ `clh-*` | 127 | 98/29 | CLH Terminal | `houses/script/courses/clh/index.html` | inline-id | Existing CLH course hub |
| 🥚 `linux-*` | 35 | 35/0 | Linux | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🆕 `db-*` | 35 | 35/0 | SQL / Databases | `NEW: houses/script/databases/index.html` | inline-id | NEW — Script Databases hub (db-01 .. db-NN). 35 modules. Could be SQL fundamentals course. |
| 🥚 `intro-*` | 30 | 30/0 | — | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `quiz-*` | 30 | 30/0 | — | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| ✓ `ra-*` | 24 | 24/0 | Linux Ascent (Linux Essentials) | `houses/script/linux/index.html` | inline-id | Existing Linux Administration course (la-) |
| 🆕 `bash-*` | 14 | 14/0 | — | `NEW: houses/script/bash-mastery/index.html` | inline-id | NEW — Bash Mastery hub. 14 modules. |
| 🥚 `python-*` | 9 | 9/0 | Python Programming | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🆕 `mission-*` | 4 | 4/0 | — | `NEW: houses/script/missions/index.html` | inline-id | NEW — Script Missions incubator. 4 modules. |
| 🆕 `pwsh-*` | 4 | 4/0 | — | `NEW: houses/script/powershell/index.html` | inline-id | NEW — PowerShell hub. 4 modules so far — incubator. |
| 🥚 `windows-*` | 3 | 3/0 | — | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `process-*` | 3 | 3/0 | — | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `anonymity-*` | 3 | 3/0 | Networking | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `package-*` | 2 | 2/0 | — | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `automation-*` | 2 | 2/0 | — | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `powershell-*` | 2 | 2/0 | — | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `sysadmin-*` | 2 | 2/0 | — | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `permission-*` | 2 | 2/0 | Linux | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `sudo-*` | 2 | 2/0 | Linux | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `ssh-*` | 2 | 2/0 | — | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `log-*` | 1 | 1/0 | — | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `command-*` | 1 | 1/0 | Linux | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `macos-*` | 1 | 1/0 | Linux | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `dont-*` | 1 | 1/0 | Linux | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `terminal-*` | 1 | 1/0 | Linux | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `regex-*` | 1 | 1/0 | — | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `cron-*` | 1 | 1/0 | — | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `patch-*` | 1 | 1/0 | — | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `chmod-*` | 1 | 1/0 | — | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `shell-*` | 1 | 1/0 | Linux | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `pipe-*` | 1 | 1/0 | Linux | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `blacksite-*` | 1 | 1/0 | — | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `lab-*` | 1 | 1/0 | — | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `template-*` | 1 | 1/0 | — | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `warmup-*` | 1 | 1/0 | — | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `directory-*` | 1 | 1/0 | Linux | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `service-*` | 1 | 1/0 | Linux | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `gpg-*` | 1 | 1/0 | Cryptography | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `checksum-*` | 1 | 1/0 | — | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `backup-*` | 1 | 1/0 | — | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |
| 🥚 `reporting-*` | 1 | 1/0 | — | `NEW (incubation): houses/script/incubator/index.html` | inline-id | Catch-all incubation hub for script orphans without strong cluster signal |

### `shield` (143 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| 🥚 `threat-*` | 17 | 17/0 | Shield (Security) | `NEW (incubation): houses/shield/threat-detection-lab/index.html` | inline-id | INCUBATION — Threat Detection Lab. 17 mods: runner, swarm, botnets — game-style. Park here until topic resolves to Sec+/CySA+ alignment. |
| 🆕 `cmmc-*` | 15 | 15/0 | Shield (Security) | `NEW: houses/shield/cmmc/index.html` | data-module | NEW — CMMC Domain hub. CMMC modules currently scattered. |
| 🥚 `linux-*` | 15 | 15/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `crypto-*` | 15 | 15/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| ✓ `cf-*` | 8 | 8/0 | Shield (Security) | `houses/shield/cyber-framework/index.html` | data-module | Existing Cyber Framework hub |
| 🆕 `sec101-*` | 8 | 8/0 | Shield (Security) | `NEW: houses/shield/sec-101/index.html` | inline-id | NEW — Sec-101 module series (8 modules). Could roll up into First Watch or stand alone. |
| 🥚 `hash-*` | 3 | 3/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| ✓ `cse-*` | 3 | 3/0 | CIS2253 Cybersecurity Ethics | `houses/divergent/cybersecurity-ethics/index.html` | inline-id | CIS2253 Cybersecurity Ethics (currently divergent) |
| 🥚 `social-*` | 2 | 2/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `osint-*` | 2 | 2/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `stego-*` | 2 | 2/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `hashing-*` | 2 | 2/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `data-*` | 2 | 2/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `malware-*` | 2 | 2/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `security-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `aaa-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `access-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `block-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `checksum-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `diffie-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `digital-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `factor-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `gpg-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `encryption2-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `encrypt-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `xor-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `career-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `ethics-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `physical-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `privacy-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `cube-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `cookie-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `hat-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `scramble-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `eh-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `browser-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `eap-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `nat-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `protocol-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `handshake-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `wireless-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `change-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `scenario-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `pspg-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `crisc-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `buffer-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `ransomware-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `google-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `attack-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `compliance-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `cfr310-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `cyber-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `dont-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `sql-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `incident-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `tor-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `hydra-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `exploit-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `dr-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| 🥚 `life-*` | 1 | 1/0 | Shield (Security) | `NEW (incubation): houses/shield/incubator/index.html` | inline-id | Catch-all incubation hub for shield orphans |
| ✓ `fw-*` | 1 | 1/0 | First Watch (Intro Security) | `houses/shield/intro-security/index.html` | inline-id | First Watch / CTS1120C |

### `web` (231 orphan modules)

| Cluster prefix | Count | True / Sub | Cluster signal | → Target | Mechanism | Notes |
|---|---:|---|---|---|---|---|
| ✓ `np-*` | 108 | 108/0 | Networking | `houses/web/network-plus/index.html` | data-module | Existing Network+ study hub (web) |
| ✓ `ccna-*` | 40 | 40/0 | Cisco CCNA | `houses/ccna/index.html` | learning-path | Existing CCNA cert hub (top-level) |
| ✓ `ip-*` | 14 | 14/0 | — | `houses/web/network-plus/index.html` | data-module | IP addressing → Network+ hub |
| 🥚 `network-*` | 5 | 5/0 | Networking | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `packet-*` | 5 | 5/0 | — | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `wireless-*` | 3 | 3/0 | Networking | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `dns-*` | 3 | 3/0 | — | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `networking-*` | 2 | 2/0 | Networking | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `binary-*` | 2 | 2/0 | — | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `class-*` | 2 | 2/0 | Networking | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `osi-*` | 2 | 2/0 | — | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `subnet-*` | 2 | 2/0 | — | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `cr-*` | 2 | 2/0 | Cyber Range | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `burp-*` | 1 | 1/0 | — | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `sqlmap-*` | 1 | 1/0 | SQL / Databases | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `gobuster-*` | 1 | 1/0 | — | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `nikto-*` | 1 | 1/0 | — | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `cumulative-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `exam-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `intro-*` | 1 | 1/0 | — | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `cable-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `devices-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `etherchannel-*` | 1 | 1/0 | — | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `fhrp-*` | 1 | 1/0 | — | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `ipv6-*` | 1 | 1/0 | — | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `ospf-*` | 1 | 1/0 | — | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `port-*` | 1 | 1/0 | — | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `stp-*` | 1 | 1/0 | — | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `subnetting-*` | 1 | 1/0 | — | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `switch-*` | 1 | 1/0 | — | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `topology-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `troubleshoot-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `vlan-*` | 1 | 1/0 | — | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `http-*` | 1 | 1/0 | — | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `smb-*` | 1 | 1/0 | — | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `server-*` | 1 | 1/0 | — | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `flashcards-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `textbook-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `firewall-*` | 1 | 1/0 | Firewalls | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `week3-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `dont-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `protocol-*` | 1 | 1/0 | — | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `api-*` | 1 | 1/0 | — | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `nmap-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `midterm-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `ne01-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `ne02-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `ne04-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `ne05-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `ne06-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `ne07-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `ne08-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `ne09-*` | 1 | 1/0 | Linux | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |
| 🥚 `ne10-*` | 1 | 1/0 | Networking | `NEW (incubation): houses/web/incubator/index.html` | inline-id | Catch-all incubation hub for web orphans |

## Tag Legend

- ✓ existing hub (just register ids)
- 🆕 proposed new hub (build then register)
- 🥚 incubation hub (park here, promote later)
- 🧹 cleanup (dedupe/roll-up, not hub assignment)
- ⚠️ unmatched (manual review needed)
