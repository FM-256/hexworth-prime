# Orphan Cluster Matrix — Phase 2

**Generated:** 2026-05-01T15:01:28.238Z

## Summary

| Metric | Count |
|---|---:|
| Catalog total | 2996 |
| In-hub (curated) | 1942 |
| All orphans (strict) | 1054 |
| **True curriculum orphans** | **901** |
| Sub-content orphans (parent in-hub) | 153 |
| Existing hub indices detected | 85 |

> "True curriculum orphan" = catalog module not in any curated hub AND not the child of an in-hub parent module.
> "Sub-content orphan" = parent module IS in a hub, but child cards (quizzes, labs, intros) aren't separately curated. Not necessarily wrong — depends on whether the platform should expose them as separate cards or roll them up.

## Per-House True Orphan Distribution

| House | True orphans | Sub-content | Top cluster | Top id-prefix |
|---|---:|---:|---|---|
| code | 223 | 0 | unclassified (174) | `arm` (160) |
| web | 161 | 1 | Networking (112) | `np` (108) |
| script | 123 | 85 | unclassified (52) | `clh` (42) |
| eye | 102 | 0 | unclassified (40) | `cyberops` (85) |
| forge | 102 | 22 | unclassified (66) | `core2` (47) |
| cloud | 66 | 22 | unclassified (55) | `guilab` (19) |
| matrix | 39 | 0 | The Matrix (15) | `op` (24) |
| shield | 32 | 3 | Shield (Security) (31) | `cmmc` (15) |
| dark-arts | 23 | 20 | unclassified (11) | `da` (14) |
| divergent | 15 | 0 | CIS4253 Ethics in IT (15) | `eth` (15) |
| key | 12 | 0 | Cryptography (9) | `crypto` (3) |
| ai | 2 | 0 | unclassified (2) | `text` (1) |
| forensics | 1 | 0 | Digital Forensics (1) | `df` (1) |

## Per-House Detail

### `code` — 223 true orphans, 0 sub-content

**Top id-prefix sub-clusters:**

- `arm-*` (160): arm-asm=10, arm-bash=10, arm-c=10, arm-cpp=10
  - sample: `code-arm-asm-01-intro.module`, `code-arm-asm-02-registers.module`, `code-arm-asm-03-arithmetic.module`
- `do-*` (31): do-7=1, do-8=1, do-9=1, do-10=1
  - sample: `do-7-git-fundamentals`, `do-8-branches`, `do-9-remote-repos`
- `pfi-*` (31): pfi-w3=9, pfi-w2=8, pfi-w1=7, pfi-w4=5
  - sample: `code-pfi-sandbox-tour-lab`, `code-pfi-w1-checkpoint-lab`, `code-pfi-w1-project-lab`
- `sp-*` (1): sp-w1=1
  - sample: `code-sp-w1-datatypes`

**Top curriculum-signal clusters:**

- unclassified (174)
- topic:Python Programming (33)
- topic:SQL / Databases (10)
- topic:Docker / Containers (1)
- topic:Cloud (1)
- topic:JavaScript (1)
- topic:Incident Response (1)
- topic:Networking (1)

### `web` — 161 true orphans, 1 sub-content

**Top id-prefix sub-clusters:**

- `np-*` (108): np-n10009=6, np-osi=6, np-network=5, np-wireless=5
  - sample: `web-np-dns-troubleshooting-lab`, `web-np-firewall-rules-lab`, `web-np-midterm-gui-lab`
- `ccna-*` (40): ccna-ccna=40
  - sample: `web-ccna-ccna-acl-lab-lab`, `web-ccna-ccna-ios-cli-lab`, `web-ccna-ccna-nat-config-lab`
- `ip-*` (13): ip-ipv6=2, ip-subnet=2, ip-cidr=1, ip-ipv4=1
  - sample: `web-ip-cidr-notation`, `web-ip-ipv4-classes`, `web-ip-ipv6-addressing`

**Top curriculum-signal clusters:**

- topic:Networking (112)
- cert:Cisco CCNA (40)
- unclassified (8)
- topic:Linux (1)

### `script` — 123 true orphans, 85 sub-content

**Top id-prefix sub-clusters:**

- `clh-*` (42): clh-031=4, clh-012=2, clh-013=2, clh-014=2
  - sample: `script-clh-012-network-basics`, `script-clh-013-environment`, `script-clh-014-process-control`
- `db-*` (35): db-01=1, db-02=1, db-03=1, db-04=1
  - sample: `script-db-01`, `script-db-02`, `script-db-03`
- `ra-*` (24): ra-w1=6, ra-w2=6, ra-w3=6, ra-w4=6
  - sample: `script-ra-w1-kernel-lab`, `script-ra-w1-storage-lab`, `script-ra-w2-files-lab`
- `bash-*` (14): bash-cron=2, bash-loops=2, bash-arrays=1, bash-basics=1
  - sample: `script-bash-arrays`, `script-bash-basics`, `script-bash-conditionals`
- `mission-*` (4): mission-file=2, mission-permissions=1, mission-text=1
  - sample: `script-mission-file-operations`, `script-mission-file-search`, `script-mission-permissions`
- `pwsh-*` (4): pwsh-fundamentals=1, pwsh-pipeline=1, pwsh-scripting=1, pwsh-admin=1
  - sample: `script-pwsh-fundamentals`, `script-pwsh-pipeline`, `script-pwsh-scripting`

**Top curriculum-signal clusters:**

- unclassified (52)
- course:CLH Terminal (42)
- course:Linux Ascent (Linux Essentials) (24)
- topic:SQL / Databases (4)
- topic:Incident Response (1)

### `eye` — 102 true orphans, 0 sub-content

**Top id-prefix sub-clusters:**

- `cyberops-*` (85): cyberops-w6=9, cyberops-w7=9, cyberops-w3=7, cyberops-w5=7
  - sample: `eye-cyberops-review`, `eye-cyberops-certificate`, `cyberops-app-visibility-control`
- `cysa-*` (16): cysa-ch01=1, cysa-ch02=1, cysa-ch03=1, cysa-ch04=1
  - sample: `eye-cysa-ch01-quiz`, `eye-cysa-ch02-quiz`, `eye-cysa-ch03-quiz`
- `wireshark-*` (1): wireshark-ta=1
  - sample: `eye-wireshark-ta`

**Top curriculum-signal clusters:**

- unclassified (40)
- topic:Networking (19)
- cert:CompTIA CySA+ (CS0-003) (16)
- topic:Digital Forensics (9)
- topic:Cryptography (7)
- topic:Incident Response (3)
- topic:Malware Analysis (3)
- topic:Firewalls (2)

### `forge` — 102 true orphans, 22 sub-content

**Top id-prefix sub-clusters:**

- `core2-*` (47): core2-windows=5, core2-quiz=2, core2-roleplay=2, core2-admin=2
  - sample: `forge-core2-quiz-ch19-22`, `forge-core2-roleplay-lab`, `forge-core2-admin-tools-lab`
- `core1-*` (40): core1-mobile=3, core1-network=3, core1-pc=2, core1-soho=2
  - sample: `forge-core1-bluetooth-pairing`, `forge-core1-cable-matching`, `forge-core1-cloud-scenarios`
- `aplus-*` (11): aplus-core1=6, aplus-core2=3, aplus-quiz=1, aplus-jeopardy=1
  - sample: `forge-aplus-core1-full`, `forge-aplus-quiz`, `forge-aplus-core2-quiz`
- `sr-*` (2): sr-w2=1, sr-w3=1
  - sample: `forge-sr-w2-virtualization-pres`, `forge-sr-w3-monitoring-pres`
- `md100-*` (1): md100-google=1
  - sample: `forge-md100-google-dorking`
- `bm-*` (1): bm-w1=1
  - sample: `forge-bm-w1-motherboards-pres`

**Top curriculum-signal clusters:**

- unclassified (66)
- topic:Networking (7)
- cert:CompTIA A+ Core 1 (6)
- topic:Linux (4)
- topic:Malware Analysis (4)
- cert:CompTIA A+ Core 2 (3)
- topic:Incident Response (3)
- topic:Cryptography (3)

### `cloud` — 66 true orphans, 22 sub-content

**Top id-prefix sub-clusters:**

- `guilab-*` (19): guilab=1, guilab-module=1, guilab-2=1, guilab-3=1
  - sample: `cloud-guilab`, `cloud-guilab-module`, `cloud-guilab-2`
- `pslab-*` (19): pslab=1, pslab-module=1, pslab-2=1, pslab-3=1
  - sample: `cloud-pslab`, `cloud-pslab-module`, `cloud-pslab-2`
- `quizquiz-*` (19): quizquiz=1, quizquiz-module=1, quizquiz-2=1, quizquiz-3=1
  - sample: `cloud-quizquiz`, `cloud-quizquiz-module`, `cloud-quizquiz-2`
- `wsa-*` (6): wsa-gauntlet=2, wsa-course=1, wsa-review=1, wsa-midterm=1
  - sample: `wsa-course`, `cloud-wsa-review`, `wsa-midterm-outpost`
- `cse-*` (2): cse-06=1, cse-07=1
  - sample: `cloud-cse-06-quiz`, `cloud-cse-07-quiz`
- `aws-*` (1): aws-sts=1
  - sample: `cloud-aws-sts`

**Top curriculum-signal clusters:**

- unclassified (55)
- topic:Networking (4)
- topic:Firewalls (3)
- cert:EC-Council Cloud Security Engineer (CSE) (2)
- topic:Cloud (1)
- topic:Docker / Containers (1)

### `matrix` — 39 true orphans, 0 sub-content

**Top id-prefix sub-clusters:**

- `op-*` (24): op-python=4, op-recon=3, op-linux=3, op-incident=3
  - sample: `op-python-01`, `op-python-02`, `op-python-03`
- `ala-*` (15): ala-w1=4, ala-w2=4, ala-w3=4, ala-w4=3
  - sample: `matrix-ala-w1-cli-operations-pres`, `matrix-ala-w1-network-config-pres`, `matrix-ala-w1-network-diag-pres`

**Top curriculum-signal clusters:**

- course:The Matrix (15)
- topic:Networking (5)
- topic:Python Programming (4)
- unclassified (4)
- topic:Linux (3)
- topic:Digital Forensics (3)
- topic:Incident Response (2)
- topic:Cryptography (2)

### `shield` — 32 true orphans, 3 sub-content

**Top id-prefix sub-clusters:**

- `cmmc-*` (15): cmmc-quiz=2, cmmc-au=1, cmmc-at=1, cmmc-cm=1
  - sample: `shield-cmmc-au`, `shield-cmmc-at`, `shield-cmmc-cm`
- `cf-*` (8): cf-mm01=1, cf-mm02=1, cf-mm03=1, cf-mm04=1
  - sample: `shield-cf-mm01-quiz`, `shield-cf-mm02-quiz`, `shield-cf-mm03-quiz`
- `sec101-*` (8): sec101-m01=1, sec101-m02=1, sec101-m03=1, sec101-m04=1
  - sample: `shield-sec101-m01`, `shield-sec101-m02`, `shield-sec101-m03`
- `fw-*` (1): fw-w3=1
  - sample: `shield-fw-w3-social-engineering-pres`

**Top curriculum-signal clusters:**

- course:Shield (Security) (31)
- course:First Watch (Intro Security) (1)

### `dark-arts` — 23 true orphans, 20 sub-content

**Top id-prefix sub-clusters:**

- `da-*` (14): da-linux=13, da-ad=1
  - sample: `da-linux-nmap-drill`, `da-linux-nmap-advanced`, `da-linux-hash-drill`
- `dark-*` (8): dark-osint=1, dark-phishing=1, dark-network=1, dark-m365=1
  - sample: `dark-osint-recon-lab`, `dark-phishing-campaign-lab`, `dark-network-forensics-lab`
- `feh-*` (1): feh-comprehensive=1
  - sample: `dark-arts-feh-comprehensive-review`

**Top curriculum-signal clusters:**

- unclassified (11)
- topic:OSINT (2)
- topic:Networking (2)
- topic:Linux (2)
- course:Dark Arts Feh (1)
- topic:Python Programming (1)
- topic:Cloud (1)
- topic:Malware Analysis (1)

### `divergent` — 15 true orphans, 0 sub-content

**Top id-prefix sub-clusters:**

- `eth-*` (15): eth-01=1, eth-02=1, eth-03=1, eth-04=1
  - sample: `divergent-eth-01-overview-pres`, `divergent-eth-02-it-professionals-pres`, `divergent-eth-03-cybersecurity-ethics-pres`

**Top curriculum-signal clusters:**

- course:CIS4253 Ethics in IT (15)

### `key` — 12 true orphans, 0 sub-content

**Top id-prefix sub-clusters:**

- `crypto-*` (3): crypto-stego=1, crypto-flap=1, crypto-pong=1
  - sample: `key-crypto-stego-lab`, `key-crypto-flap`, `key-crypto-pong`
- `cipher-*` (2): cipher-cracker=1, cipher-bubbles=1
  - sample: `key-cipher-cracker`, `key-cipher-bubbles`
- `encryption-*` (2): encryption-ascii=1, encryption-dh=1
  - sample: `key-encryption-ascii-binary`, `key-encryption-dh-rsa`
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

- topic:Cryptography (9)
- unclassified (2)
- topic:Networking (1)

### `ai` — 2 true orphans, 0 sub-content

**Top id-prefix sub-clusters:**

- `text-*` (1): text-adventure=1
  - sample: `ai-text-adventure-singularity`
- `agent-*` (1): agent-builder=1
  - sample: `ai-agent-builder`

**Top curriculum-signal clusters:**

- unclassified (2)

### `forensics` — 1 true orphans, 0 sub-content

**Top id-prefix sub-clusters:**

- `df-*` (1): df-hub=1
  - sample: `df-hub-index`

**Top curriculum-signal clusters:**

- course:Digital Forensics (1)

## Existing Hub Inventory (85)

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

### `script` (4 hubs)

- `houses/script/courses/clh/index.html` — Command Line Hacker - House of Script
- `houses/script/incubator/index.html` — Script Incubator — Hexworth Prime
- `houses/script/index.html` — House of the Script - Hexworth Prime
- `houses/script/linux/index.html` — Linux Administration - House of the Script

### `shield` (10 hubs)

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
| `clh-001-quiz` | `clh-001` |
| `clh-002-quiz` | `clh-002` |
| `clh-003-quiz` | `clh-003` |
| `clh-004-quiz` | `clh-004` |
| `clh-005-quiz` | `clh-005` |
| `clh-006-quiz` | `clh-006` |
| `clh-007-quiz` | `clh-007` |
| `clh-008-quiz` | `clh-008` |
| `clh-009-quiz` | `clh-009` |
| `clh-010-quiz` | `clh-010` |
| `clh-011-quiz` | `clh-011` |
| `clh-012-quiz` | `clh-012` |
| `clh-013-quiz` | `clh-013` |
| `clh-014-quiz` | `clh-014` |
| `clh-015-quiz` | `clh-015` |
| `clh-016-quiz` | `clh-016` |
| `clh-017-quiz` | `clh-017` |
| `clh-018-quiz` | `clh-018` |
| `clh-019-quiz` | `clh-019` |
| `clh-020-quiz` | `clh-020` |
| `clh-021-quiz` | `clh-021` |
| `clh-022-quiz` | `clh-022` |
| `clh-023-quiz` | `clh-023` |
| `clh-024-quiz` | `clh-024` |
| `clh-025-quiz` | `clh-025` |
| `clh-026-quiz` | `clh-026` |
| `clh-027-quiz` | `clh-027` |
| `clh-028-quiz` | `clh-028` |
| `clh-029-quiz` | `clh-029` |
| `clh-030-quiz` | `clh-030` |
