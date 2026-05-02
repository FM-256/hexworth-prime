# Orphan Cluster Matrix — Phase 2

**Generated:** 2026-05-02T01:41:31.782Z

## Summary

| Metric | Count |
|---|---:|
| Catalog total | 2996 |
| In-hub (curated) | 2817 |
| All orphans (strict) | 179 |
| **True curriculum orphans** | **135** |
| Sub-content orphans (parent in-hub) | 44 |
| Existing hub indices detected | 88 |

> "True curriculum orphan" = catalog module not in any curated hub AND not the child of an in-hub parent module.
> "Sub-content orphan" = parent module IS in a hub, but child cards (quizzes, labs, intros) aren't separately curated. Not necessarily wrong — depends on whether the platform should expose them as separate cards or roll them up.

## Per-House True Orphan Distribution

| House | True orphans | Sub-content | Top cluster | Top id-prefix |
|---|---:|---:|---|---|
| cloud | 57 | 0 | unclassified (49) | `guilab` (19) |
| code | 32 | 0 | unclassified (29) | `do` (31) |
| script | 29 | 44 | CLH Terminal (21) | `clh` (21) |
| key | 5 | 0 | Cryptography (3) | `tls` (1) |
| web | 4 | 0 | Cisco CCNA (4) | `ccna` (4) |
| forge | 3 | 0 | Server Room (2) | `sr` (2) |
| ai | 2 | 0 | unclassified (2) | `text` (1) |
| eye | 1 | 0 | Wireshark (Eye) (1) | `wireshark` (1) |
| forensics | 1 | 0 | Digital Forensics (1) | `df` (1) |
| shield | 1 | 0 | First Watch (Intro Security) (1) | `fw` (1) |

## Per-House Detail

### `cloud` — 57 true orphans, 0 sub-content

**Top id-prefix sub-clusters:**

- `guilab-*` (19): guilab=1, guilab-module=1, guilab-2=1, guilab-3=1
  - sample: `cloud-guilab`, `cloud-guilab-module`, `cloud-guilab-2`
- `pslab-*` (19): pslab=1, pslab-module=1, pslab-2=1, pslab-3=1
  - sample: `cloud-pslab`, `cloud-pslab-module`, `cloud-pslab-2`
- `quizquiz-*` (19): quizquiz=1, quizquiz-module=1, quizquiz-2=1, quizquiz-3=1
  - sample: `cloud-quizquiz`, `cloud-quizquiz-module`, `cloud-quizquiz-2`

**Top curriculum-signal clusters:**

- unclassified (49)
- topic:Networking (4)
- topic:Firewalls (3)
- topic:Docker / Containers (1)

### `code` — 32 true orphans, 0 sub-content

**Top id-prefix sub-clusters:**

- `do-*` (31): do-7=1, do-8=1, do-9=1, do-10=1
  - sample: `do-7-git-fundamentals`, `do-8-branches`, `do-9-remote-repos`
- `sp-*` (1): sp-w1=1
  - sample: `code-sp-w1-datatypes`

**Top curriculum-signal clusters:**

- unclassified (29)
- topic:Docker / Containers (1)
- topic:Python Programming (1)
- course:Snake Pit (Python Programming) (1)

### `script` — 29 true orphans, 44 sub-content

**Top id-prefix sub-clusters:**

- `clh-*` (21): clh-031=2, clh-012=1, clh-013=1, clh-014=1
  - sample: `script-clh-012-network-basics`, `script-clh-013-environment`, `script-clh-014-process-control`
- `mission-*` (4): mission-file=2, mission-permissions=1, mission-text=1
  - sample: `script-mission-file-operations`, `script-mission-file-search`, `script-mission-permissions`
- `pwsh-*` (4): pwsh-fundamentals=1, pwsh-pipeline=1, pwsh-scripting=1, pwsh-admin=1
  - sample: `script-pwsh-fundamentals`, `script-pwsh-pipeline`, `script-pwsh-scripting`

**Top curriculum-signal clusters:**

- course:CLH Terminal (21)
- unclassified (7)
- topic:Incident Response (1)

### `key` — 5 true orphans, 0 sub-content

**Top id-prefix sub-clusters:**

- `tls-*` (1): tls-ssl=1
  - sample: `key-tls-ssl`
- `dont-*` (1): dont-leak=1
  - sample: `key-dont-leak-the-key`
- `hash-*` (1): hash-cracker=1
  - sample: `key-hash-cracker`
- `firewall-*` (1): firewall-builder=1
  - sample: `key-firewall-builder`
- `gpg-*` (1): gpg-decrypt=1
  - sample: `key-gpg-decrypt`

**Top curriculum-signal clusters:**

- topic:Cryptography (3)
- unclassified (1)
- topic:Networking (1)

### `web` — 4 true orphans, 0 sub-content

**Top id-prefix sub-clusters:**

- `ccna-*` (4): ccna-ccna=4
  - sample: `web-ccna-ccna-acl-builder.tool`, `web-ccna-ccna-ios-reference.tool`, `web-ccna-ccna-ospf-visualizer.tool`

**Top curriculum-signal clusters:**

- cert:Cisco CCNA (4)

### `forge` — 3 true orphans, 0 sub-content

**Top id-prefix sub-clusters:**

- `sr-*` (2): sr-w2=1, sr-w3=1
  - sample: `forge-sr-w2-virtualization-pres`, `forge-sr-w3-monitoring-pres`
- `bm-*` (1): bm-w1=1
  - sample: `forge-bm-w1-motherboards-pres`

**Top curriculum-signal clusters:**

- course:Server Room (2)
- course:Bare Metal (Hardware Support) (1)

### `ai` — 2 true orphans, 0 sub-content

**Top id-prefix sub-clusters:**

- `text-*` (1): text-adventure=1
  - sample: `ai-text-adventure-singularity`
- `agent-*` (1): agent-builder=1
  - sample: `ai-agent-builder`

**Top curriculum-signal clusters:**

- unclassified (2)

### `eye` — 1 true orphans, 0 sub-content

**Top id-prefix sub-clusters:**

- `wireshark-*` (1): wireshark-ta=1
  - sample: `eye-wireshark-ta`

**Top curriculum-signal clusters:**

- course:Wireshark (Eye) (1)

### `forensics` — 1 true orphans, 0 sub-content

**Top id-prefix sub-clusters:**

- `df-*` (1): df-hub=1
  - sample: `df-hub-index`

**Top curriculum-signal clusters:**

- course:Digital Forensics (1)

### `shield` — 1 true orphans, 0 sub-content

**Top id-prefix sub-clusters:**

- `fw-*` (1): fw-w3=1
  - sample: `shield-fw-w3-social-engineering-pres`

**Top curriculum-signal clusters:**

- course:First Watch (Intro Security) (1)

## Existing Hub Inventory (88)

Hubs indexed by mechanism 1/3/4 detection (data-module attrs or renderer-call signature).

### `?` (19 hubs)

- `houses/aplus-core1/index.html` — CompTIA A+ Core 1 (220-1101) - Hexworth Prime
- `houses/aplus-core2/index.html` — CompTIA A+ Core 2 (220-1102) - Hexworth Prime
- `houses/aws-ccp/index.html` — AWS Cloud Practitioner (CLF-C02) - Hexworth Prime
- `houses/aws-developer/index.html` — AWS Developer Associate (DVA-C02) - Hexworth Prime
- `houses/azure-fundamentals/index.html` — Azure Fundamentals (AZ-900) - Hexworth Prime
- `houses/casp-plus/index.html` — CompTIA CASP+ (CAS-004) - Hexworth Prime
- `houses/ccna/index.html` — Cisco CCNA (200-301) - Hexworth Prime
- `houses/comptia-linux/index.html` — CompTIA Linux+ (XK0-005) - Hexworth Prime
- `houses/comptia-network/index.html` — CompTIA Network+ (N10-009) - Hexworth Prime
- `houses/cryptography-track/index.html` — Cryptography Track - Hexworth Prime
- `houses/cysa-plus/index.html` — CompTIA CySA+ (CS0-003) - Hexworth Prime
- `houses/devops-fundamentals/index.html` — DevOps Fundamentals - Hexworth Prime
- `houses/matrix/adv-linux/index.html` — Advanced Linux Administration // CTS4321C
- `houses/matrix/index.html` — House of the Matrix - Hexworth Prime
- `houses/matrix/piverse/index.html` — PiVerse // The Raspberry Pi Learning Ecosystem
- `houses/matrix/protocore/index.html` — ProtoCore // Build the Core. Control the System.
- `houses/security-operations/index.html` — Security Operations (SOC Analyst) - Hexworth Prime
- `houses/security-plus-crypto/index.html` — Security+ Cryptography Domain - Hexworth Prime
- `houses/security-plus/index.html` — CompTIA Security+ (SY0-701) - Hexworth Prime

### `ai` (7 hubs)

- `houses/ai/agents/index.html` — Agent Architecture Hub -- House of the Machine
- `houses/ai/ai-900/index.html` — Azure AI Fundamentals // AI-900
- `houses/ai/automation/index.html` — N8N and Automation Hub -- House of the Machine
- `houses/ai/cli-tools/index.html` — CLI and Developer Tools Hub -- House of the Machine
- `houses/ai/cortex/nlp/index.html` — Natural Language Processing — The Cortex
- `houses/ai/cortex/rl/index.html` — Reinforcement Learning — The Cortex
- `houses/ai/index.html` — House of the Machine - Hexworth Prime

### `cloud` (12 hubs)

- `houses/cloud/az-104/index.html` — Azure Administrator Associate // AZ-104
- `houses/cloud/az-900/index.html` — Azure Fundamentals // AZ-900
- `houses/cloud/cloud-essentials/index.html` — Cloud Base &mdash; CTS2145C
- `houses/cloud/cse/index.html` — EC-Council Cloud Security Engineer (CSE v1) - House of the Cloud
- `houses/cloud/incubator/index.html` — Cloud Incubator — Hexworth Prime
- `houses/cloud/index.html` — House of the Cloud - Hexworth Prime
- `houses/cloud/modules/wsa/index.html` — Windows Server Administration - House of Cloud
- `houses/cloud/ms-102/index.html` — Microsoft 365 Administrator // MS-102
- `houses/cloud/ms-900/index.html` — Microsoft 365 Fundamentals // MS-900
- `houses/cloud/openstack/index.html` — OpenStack Cloud Platform - House of the Cloud
- `houses/cloud/pl-300/index.html` — Power BI Data Analyst // PL-300
- `houses/cloud/server-plus/index.html` — CompTIA Server+ SK0-005 // Hexworth Prime

### `code` (7 hubs)

- `houses/code/algorithms/index.html` — The Algorithm Chamber - House of the Code | Hexworth Prime
- `houses/code/armory/sql/index.html` — SQL Track - The Code Armory
- `houses/code/devops/index.html` — The Forge - DevOps Hub - Hexworth Prime
- `houses/code/incubator/index.html` — Code Incubator — Hexworth Prime
- `houses/code/index.html` — House of the Code - Hexworth Prime
- `houses/code/python-for-it/index.html` — Python for IT &mdash; COP1034C
- `houses/code/python-programming/index.html` — Snake Pit // COP2891 &mdash; Python Programming

### `dark-arts` (3 hubs)

- `houses/dark-arts/feh/index.html` — Foundations of Ethical Hacking - Dark Arts
- `houses/dark-arts/incubator/index.html` — Dark Arts Incubator — Hexworth Prime
- `houses/dark-arts/index.html` — House of the Dark Arts - Hexworth Prime

### `divergent` (4 hubs)

- `houses/divergent/cybersecurity-ethics/index.html` — Cybersecurity Ethics // CIS2253
- `houses/divergent/cybersecurity-policy/index.html` — The Domino Effect - CIS2208 - Hexworth Prime
- `houses/divergent/ethics-it/index.html` — Ethics in Information Technology // CIS4253
- `houses/divergent/index.html` — The Warehouse // Divergent - Hexworth Prime

### `eye` (5 hubs)

- `houses/eye/cysa/index.html` — CompTIA CySA+ (CS0-003) - House of the Eye
- `houses/eye/forensics/index.html` — Digital Forensics Hub — Hexworth Prime
- `houses/eye/incubator/index.html` — Eye Incubator — Hexworth Prime
- `houses/eye/index.html` — House of the Eye - Hexworth Prime
- `houses/eye/modules/cyberops/index.html` — CyberOps Associate 200-201 - Eye House | Hexworth Prime

### `forge` (7 hubs)

- `houses/forge/hardware-support/index.html` — Bare Metal // CTS1150C &mdash; Hardware Support
- `houses/forge/incubator/index.html` — Forge Incubator — Hexworth Prime
- `houses/forge/index.html` — House of the Forge - Hexworth Prime
- `houses/forge/intro-computers/index.html` — First Boot &mdash; CGS1000C
- `houses/forge/md-100/index.html` — MD-100: Windows Client - House of Forge
- `houses/forge/md-101/index.html` — MD-101: Managing Modern Desktops - House of Forge
- `houses/forge/server-management/index.html` — The Server Room // CTS1328C &mdash; Managing and Maintaining Server Operating Systems

### `key` (1 hub)

- `houses/key/index.html` — House of the Key - Hexworth Prime

### `script` (6 hubs)

- `houses/script/courses/clh/index.html` — Command Line Hacker - House of Script
- `houses/script/incubator/index.html` — Script Incubator — Hexworth Prime
- `houses/script/index.html` — House of the Script - Hexworth Prime
- `houses/script/labs/linux/bash/index.html` — Bash Mastery | House of the Script | Hexworth Prime
- `houses/script/linux/index.html` — Linux Administration - House of the Script
- `houses/script/modules/databases/index.html` — Database Track | House of the Script | Hexworth Prime

### `shield` (11 hubs)

- `houses/shield/compliance/cmmc/index.html` — CMMC | Compliance | House of the Shield | Hexworth Prime
- `houses/shield/cyber-framework/index.html` — Cyber Law & Policy Framework - House of the Shield
- `houses/shield/incubator/index.html` — Shield Incubator — Hexworth Prime
- `houses/shield/index.html` — House of the Shield - Hexworth Prime
- `houses/shield/infosec/index.html` — Principles of Information Security // CIS2350C
- `houses/shield/intro-security/index.html` — First Watch // CTS1120C
- `houses/shield/isc2-cc/index.html` — ISC2 Certified in Cybersecurity (CC) // Hexworth Prime
- `houses/shield/ms-security/index.html` — Microsoft Security-101 - House of the Shield
- `houses/shield/sc-200/index.html` — Microsoft Security Operations Analyst // SC-200
- `houses/shield/sc-900/index.html` — SC-900 // Microsoft Security, Compliance, and Identity Fundamentals
- `houses/shield/security-plus/index.html` — CompTIA Security+ SY0-701 // Hexworth Prime

### `web` (6 hubs)

- `houses/web/ccna/index.html` — Cisco CCNA 200-301 - House of Web
- `houses/web/incubator/index.html` — Web Incubator — Hexworth Prime
- `houses/web/index.html` — House of the Web - Hexworth Prime
- `houses/web/intro-networks/index.html` — First Link // CTS1090C &mdash; Introduction to Networks
- `houses/web/net-essentials/index.html` — Cable Run // CTS1305C &mdash; Essentials of Networking
- `houses/web/network-plus/index.html` — CompTIA Network+ N10-009 — Study Hub

## Sub-Content Samples (first 30)

These orphans have a parent module already in-hub. Decision needed: roll up into parent, or expose as separate hub cards.

| Orphan id | Parent (in-hub) |
|---|---|
| `clh-001-presentation` | `clh-001` |
| `clh-002-presentation` | `clh-002` |
| `clh-003-presentation` | `clh-003` |
| `clh-004-presentation` | `clh-004` |
| `clh-005-presentation` | `clh-005` |
| `clh-006-presentation` | `clh-006` |
| `clh-007-presentation` | `clh-007` |
| `clh-008-presentation` | `clh-008` |
| `clh-009-presentation` | `clh-009` |
| `clh-010-presentation` | `clh-010` |
| `clh-011-presentation` | `clh-011` |
| `clh-012-presentation` | `clh-012` |
| `clh-013-presentation` | `clh-013` |
| `clh-014-presentation` | `clh-014` |
| `clh-015-presentation` | `clh-015` |
| `clh-016-presentation` | `clh-016` |
| `clh-017-presentation` | `clh-017` |
| `clh-018-presentation` | `clh-018` |
| `clh-019-presentation` | `clh-019` |
| `clh-020-presentation` | `clh-020` |
| `clh-021-presentation` | `clh-021` |
| `clh-022-presentation` | `clh-022` |
| `clh-023-presentation` | `clh-023` |
| `clh-024-presentation` | `clh-024` |
| `clh-025-presentation` | `clh-025` |
| `clh-026-presentation` | `clh-026` |
| `clh-027-presentation` | `clh-027` |
| `clh-028-presentation` | `clh-028` |
| `clh-029-presentation` | `clh-029` |
| `clh-030-presentation` | `clh-030` |
