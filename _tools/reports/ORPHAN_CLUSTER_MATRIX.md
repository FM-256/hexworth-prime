# Orphan Cluster Matrix — Phase 2

**Generated:** 2026-07-29T03:30:49.538Z

## Summary

| Metric | Count |
|---|---:|
| Catalog total | 4298 |
| In-hub (curated) | 3734 |
| All orphans (strict) | 564 |
| **True curriculum orphans** | **564** |
| Sub-content orphans (parent in-hub) | 0 |
| Existing hub indices detected | 93 |

> "True curriculum orphan" = catalog module not in any curated hub AND not the child of an in-hub parent module.
> "Sub-content orphan" = parent module IS in a hub, but child cards (quizzes, labs, intros) aren't separately curated. Not necessarily wrong — depends on whether the platform should expose them as separate cards or roll them up.

## Per-House True Orphan Distribution

| House | True orphans | Sub-content | Top cluster | Top id-prefix |
|---|---:|---:|---|---|
| matrix | 367 | 0 | The Matrix (271) | `piverse` (150) |
| shield | 83 | 0 | Shield (Security) (59) | `secplus` (15) |
| dark-arts | 32 | 0 | unclassified (28) | `vault` (30) |
| web | 24 | 0 | unclassified (10) | `labs` (15) |
| signal | 23 | 0 | unclassified (23) | `toolkit` (22) |
| cloud | 14 | 0 | AWS (7) | `aws` (8) |
| script | 10 | 0 | unclassified (8) | `exams` (8) |
| platform | 9 | 0 | unclassified (8) | `career` (4) |
| eye | 1 | 0 | Digital Forensics (1) | `careers` (1) |
| forge | 1 | 0 | unclassified (1) | `careers` (1) |

## Per-House Detail

### `matrix` — 367 true orphans, 0 sub-content

**Top id-prefix sub-clusters:**

- `piverse-*` (150): piverse-micropython=36, piverse-electronics=30, piverse-fundamentals=30, piverse-maker=30
  - sample: `matrix-piverse-electronics-labs-pv-e-01`, `matrix-piverse-electronics-labs-pv-e-02`, `matrix-piverse-electronics-labs-pv-e-03`
- `protocore-*` (102): protocore-arduino=57, protocore-esp32=45
  - sample: `matrix-protocore-arduino-labs-pc-ard-01`, `matrix-protocore-arduino-labs-pc-ard-02`, `matrix-protocore-arduino-labs-pc-ard-03`
- `operator-*` (96): operator-missions=96
  - sample: `operator-missions-js-01`, `operator-missions-js-02`, `operator-missions-js-03`
- `adv-*` (18): adv-linux=18
  - sample: `matrix-adv-linux-presentations-ala-w1-network-config`, `matrix-adv-linux-presentations-ala-w1-network-diag`, `matrix-adv-linux-presentations-ala-w1-systemd`
- `careers-*` (1): careers=1
  - sample: `matrix-careers`

**Top curriculum-signal clusters:**

- course:The Matrix (271)
- course:Operator Missions (96)

### `shield` — 83 true orphans, 0 sub-content

**Top id-prefix sub-clusters:**

- `secplus-*` (15): secplus-d1=4, secplus-d2=4, secplus-d5=4, secplus-d3=2
  - sample: `shield-secplus-d1-change-management-quiz`, `shield-secplus-d1-crypto-solutions-quiz`, `shield-secplus-d1-design-principles-quiz`
- `threat-*` (13): threat-apt=1, threat-ddos=1, threat-mitm=1, threat-rootkits=1
  - sample: `shield-threat-apt`, `shield-threat-ddos`, `shield-threat-mitm`
- `pbq-*` (12): pbq-firewall=1, pbq-control=1, pbq-attack=1, pbq-malware=1
  - sample: `shield-pbq-firewall-config`, `shield-pbq-control-classification`, `shield-pbq-attack-identification`
- `sp-*` (9): sp-blueteam=9
  - sample: `shield-sp-blueteam-log-intrusion-hunt`, `shield-sp-blueteam-siem-triage`, `shield-sp-blueteam-config-audit`
- `pis-*` (6): pis-05=1, pis-07=1, pis-09=1, pis-10=1
  - sample: `pis-05`, `pis-07`, `pis-09`
- `crypto-*` (5): crypto-aes=1, crypto-digital=1, crypto-hashing=1, crypto-pki=1
  - sample: `shield-crypto-aes`, `shield-crypto-digital-signatures`, `shield-crypto-hashing`
- `sy0-*` (4): sy0-701=4
  - sample: `shield-sy0-701-practice-exam-1`, `shield-sy0-701-practice-exam-2`, `shield-sy0-701-acronyms`
- `security-*` (3): security-plus=1, security-best=1, security-governance=1
  - sample: `shield-security-plus-cert-prep`, `shield-security-best-practices`, `shield-security-governance-dashboard`
- `cmmc-*` (1): cmmc-framework=1
  - sample: `shield-cmmc-framework`
- `cryptomatch-*` (1): cryptomatch=1
  - sample: `shield-cryptomatch`
- `hangman-*` (1): hangman=1
  - sample: `shield-hangman`
- `crime-*` (1): crime=1
  - sample: `shield-crime`

**Top curriculum-signal clusters:**

- course:Shield (Security) (59)
- cert:CompTIA Security+ (SY0-701) (16)
- unclassified (3)
- cert:CompTIA CySA+ (CS0-003) (1)
- cert:CompTIA PenTest+ (1)
- topic:Malware Analysis (1)
- topic:Networking (1)
- topic:Cloud (1)

### `dark-arts` — 32 true orphans, 0 sub-content

**Top id-prefix sub-clusters:**

- `vault-*` (30): vault-ehe=20, vault-labs=10
  - sample: `dark-arts-vault-ehe-labs-ehe-lab-cloud-security`, `dark-arts-vault-ehe-labs-ehe-lab-dos-attack`, `dark-arts-vault-ehe-labs-ehe-lab-enumeration`
- `wifi-*` (1): wifi-arsenal=1
  - sample: `dark-arts-wifi-arsenal`
- `careers-*` (1): careers=1
  - sample: `dark-arts-careers`

**Top curriculum-signal clusters:**

- unclassified (28)
- topic:Cloud (1)
- topic:Networking (1)
- cert:CompTIA PenTest+ (1)
- topic:SQL / Databases (1)

### `web` — 24 true orphans, 0 sub-content

**Top id-prefix sub-clusters:**

- `labs-*` (15): labs-web=15
  - sample: `web-labs-web-midterm-gui`, `web-labs-web-ne01-osi-scenario`, `web-labs-web-ne01-wireshark-gui`
- `network-*` (7): network-plus=7
  - sample: `web-network-plus-labs-n10009-ch01-security`, `web-network-plus-labs-n10009-ch02-troubleshooting`, `web-network-plus-presentations-n10009-ch01-security`
- `careers-*` (1): careers=1
  - sample: `web-careers`
- `exams-*` (1): exams-web=1
  - sample: `web-exams-web-network-plus-practice`

**Top curriculum-signal clusters:**

- unclassified (10)
- cert:CompTIA Network+ (8)
- topic:Firewalls (3)
- topic:Networking (2)
- topic:Linux (1)

### `signal` — 23 true orphans, 0 sub-content

**Top id-prefix sub-clusters:**

- `toolkit-*` (22): toolkit-tools=22
  - sample: `signal-toolkit-tools-arduino-ide`, `signal-toolkit-tools-balenaetcher`, `signal-toolkit-tools-clonezilla`
- `careers-*` (1): careers=1
  - sample: `signal-careers`

**Top curriculum-signal clusters:**

- unclassified (23)

### `cloud` — 14 true orphans, 0 sub-content

**Top id-prefix sub-clusters:**

- `aws-*` (8): aws-database=1, aws-networking=1, aws-practitioner=1, aws-tools=1
  - sample: `cloud-aws-database`, `cloud-aws-networking`, `cloud-aws-practitioner`
- `iam-*` (1): iam-quiz=1
  - sample: `cloud-iam-quiz`
- `storage-*` (1): storage-quiz=1
  - sample: `cloud-storage-quiz`
- `database-*` (1): database-quiz=1
  - sample: `cloud-database-quiz`
- `networking-*` (1): networking-quiz=1
  - sample: `cloud-networking-quiz`
- `fundamentals-*` (1): fundamentals-quiz=1
  - sample: `cloud-fundamentals-quiz`
- `careers-*` (1): careers=1
  - sample: `cloud-careers`

**Top curriculum-signal clusters:**

- topic:AWS (7)
- topic:Cloud (4)
- topic:Networking (2)
- unclassified (1)

### `script` — 10 true orphans, 0 sub-content

**Top id-prefix sub-clusters:**

- `exams-*` (8): exams-script=8
  - sample: `script-exams-script-python-exam-chapter1`, `script-exams-script-python-exam-chapter2`, `script-exams-script-python-exam-chapter3`
- `zero-*` (1): zero-to=1
  - sample: `zero-to-python`
- `linux-*` (1): linux-tools=1
  - sample: `script-linux-tools-script-directory`

**Top curriculum-signal clusters:**

- unclassified (8)
- topic:Python Programming (1)
- topic:Linux (1)

### `platform` — 9 true orphans, 0 sub-content

**Top id-prefix sub-clusters:**

- `career-*` (4): career-launchpad=1, career-paths=1, career-quiz=1, career-pathway=1
  - sample: `platform-career-launchpad`, `platform-career-paths`, `platform-career-quiz`
- `interview-*` (1): interview-prep=1
  - sample: `platform-interview-prep`
- `resume-*` (1): resume-builder=1
  - sample: `platform-resume-builder`
- `salary-*` (1): salary-data=1
  - sample: `platform-salary-data`
- `internships-*` (1): internships=1
  - sample: `platform-internships`
- `job-*` (1): job-board=1
  - sample: `platform-job-board`

**Top curriculum-signal clusters:**

- unclassified (8)
- topic:Cloud (1)

### `eye` — 1 true orphans, 0 sub-content

**Top id-prefix sub-clusters:**

- `careers-*` (1): careers=1
  - sample: `eye-careers`

**Top curriculum-signal clusters:**

- topic:Digital Forensics (1)

### `forge` — 1 true orphans, 0 sub-content

**Top id-prefix sub-clusters:**

- `careers-*` (1): careers=1
  - sample: `forge-careers`

**Top curriculum-signal clusters:**

- unclassified (1)

## Existing Hub Inventory (93)

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
- `houses/hub/index.html` — Hub - Hexworth Prime
- `houses/matrix/adv-linux/index.html` — Advanced Linux Administration // CTS4321C
- `houses/matrix/index.html` — House of the Matrix - Hexworth Prime
- `houses/matrix/piverse/index.html` — PiVerse // The Raspberry Pi Learning Ecosystem
- `houses/matrix/protocore/index.html` — ProtoCore // Build the Core. Control the System.
- `houses/security-operations/index.html` — Security Operations (SOC Analyst) - Hexworth Prime
- `houses/security-plus-crypto/index.html` — Security+ Cryptography Domain - Hexworth Prime

### `ai` (7 hubs)

- `houses/ai/agents/index.html` — Agent Architecture Hub -- House of the Machine
- `houses/ai/ai-900/index.html` — Azure AI Fundamentals // AI-900
- `houses/ai/automation/index.html` — N8N and Automation Hub -- House of the Machine
- `houses/ai/cli-tools/index.html` — CLI and Developer Tools Hub -- House of the Machine
- `houses/ai/cortex/nlp/index.html` — Natural Language Processing — The Cortex
- `houses/ai/cortex/rl/index.html` — Reinforcement Learning — The Cortex
- `houses/ai/index.html` — House of the Machine - Hexworth Prime

### `cloud` (13 hubs)

- `houses/cloud/az-104/index.html` — Azure Administrator Associate // AZ-104
- `houses/cloud/az-900/index.html` — Azure Fundamentals // AZ-900
- `houses/cloud/clf-c02/index.html` — AWS Cloud Practitioner // CLF-C02
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

### `dark-arts` (5 hubs)

- `houses/dark-arts/feh/index.html` — Foundations of Ethical Hacking - Dark Arts
- `houses/dark-arts/incubator/index.html` — Dark Arts Incubator — Hexworth Prime
- `houses/dark-arts/index.html` — House of the Dark Arts - Hexworth Prime
- `houses/dark-arts/offensive/ceh/index.html` — CEH v12 Track - The Proving Grounds - Dark Arts
- `houses/dark-arts/offensive/index.html` — The Proving Grounds - Dark Arts

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

### `observatory` (1 hub)

- `houses/observatory/index.html` — Hexworth Observatory - Hexworth Prime

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

### `signal` (1 hub)

- `signal/index.html` — The Signal — Hardware Projects — Hexworth Prime

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
