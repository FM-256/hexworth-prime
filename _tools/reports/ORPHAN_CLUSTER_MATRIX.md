# Orphan Cluster Matrix — Phase 2

**Generated:** 2026-05-01T04:07:22.910Z

## Summary

| Metric | Count |
|---|---:|
| Catalog total | 2996 |
| In-hub (curated) | 1453 |
| All orphans (strict) | 1543 |
| **True curriculum orphans** | **1347** |
| Sub-content orphans (parent in-hub) | 196 |
| Existing hub indices detected | 77 |

> "True curriculum orphan" = catalog module not in any curated hub AND not the child of an in-hub parent module.
> "Sub-content orphan" = parent module IS in a hub, but child cards (quizzes, labs, intros) aren't separately curated. Not necessarily wrong — depends on whether the platform should expose them as separate cards or roll them up.

## Per-House True Orphan Distribution

| House | True orphans | Sub-content | Top cluster | Top id-prefix |
|---|---:|---:|---|---|
| script | 269 | 87 | unclassified (123) | `clh` (42) |
| code | 239 | 10 | unclassified (182) | `arm` (160) |
| web | 221 | 10 | Networking (142) | `np` (108) |
| forge | 148 | 33 | unclassified (106) | `core2` (47) |
| shield | 132 | 11 | Shield (Security) (131) | `threat` (17) |
| eye | 110 | 1 | unclassified (43) | `cyberops` (85) |
| cloud | 91 | 24 | unclassified (62) | `guilab` (19) |
| dark-arts | 68 | 20 | unclassified (36) | `da` (14) |
| matrix | 39 | 0 | The Matrix (15) | `op` (24) |
| divergent | 15 | 0 | CIS4253 Ethics in IT (15) | `eth` (15) |
| key | 12 | 0 | Cryptography (9) | `crypto` (3) |
| ai | 2 | 0 | unclassified (2) | `text` (1) |
| forensics | 1 | 0 | Digital Forensics (1) | `df` (1) |

## Per-House Detail

### `script` — 269 true orphans, 87 sub-content

**Top id-prefix sub-clusters:**

- `clh-*` (42): clh-031=4, clh-012=2, clh-013=2, clh-014=2
  - sample: `script-clh-012-network-basics`, `script-clh-013-environment`, `script-clh-014-process-control`
- `db-*` (35): db-01=1, db-02=1, db-03=1, db-04=1
  - sample: `script-db-01`, `script-db-02`, `script-db-03`
- `linux-*` (33): linux-log=4, linux-disk=3, linux-file=3, linux-process=3
  - sample: `script-linux-lab`, `script-linux-cli-review`, `script-linux-compression`
- `intro-*` (30): intro=1, intro-module=1, intro-2=1, intro-3=1
  - sample: `script-intro`, `script-intro-module`, `script-intro-2`
- `quiz-*` (30): quiz=1, quiz-quiz=1, quiz-2=1, quiz-3=1
  - sample: `script-quiz`, `script-quiz-quiz`, `script-quiz-2`
- `ra-*` (24): ra-w1=6, ra-w2=6, ra-w3=6, ra-w4=6
  - sample: `script-ra-w1-kernel-lab`, `script-ra-w1-storage-lab`, `script-ra-w2-files-lab`
- `bash-*` (14): bash-cron=2, bash-loops=2, bash-arrays=1, bash-basics=1
  - sample: `script-bash-arrays`, `script-bash-basics`, `script-bash-conditionals`
- `python-*` (9): python-certificate=1, python-functions=1, python-oop=1, python-collections=1
  - sample: `script-python-certificate`, `script-python-functions`, `script-python-oop`
- `mission-*` (4): mission-file=2, mission-permissions=1, mission-text=1
  - sample: `script-mission-file-operations`, `script-mission-file-search`, `script-mission-permissions`
- `pwsh-*` (4): pwsh-fundamentals=1, pwsh-pipeline=1, pwsh-scripting=1, pwsh-admin=1
  - sample: `script-pwsh-fundamentals`, `script-pwsh-pipeline`, `script-pwsh-scripting`
- `windows-*` (3): windows-cli=1, windows-registry=1, windows-troubleshooting=1
  - sample: `script-windows-cli`, `script-windows-registry`, `script-windows-troubleshooting`
- `process-*` (3): process-management=1, process=1, process-monitor=1
  - sample: `script-process-management`, `script-process`, `script-process-monitor`

**Top curriculum-signal clusters:**

- unclassified (123)
- topic:Linux (47)
- course:CLH Terminal (42)
- course:Linux Ascent (Linux Essentials) (24)
- topic:Python Programming (9)
- topic:Networking (7)
- topic:Digital Forensics (4)
- topic:SQL / Databases (4)

### `code` — 239 true orphans, 10 sub-content

**Top id-prefix sub-clusters:**

- `arm-*` (160): arm-asm=10, arm-bash=10, arm-c=10, arm-cpp=10
  - sample: `code-arm-asm-01-intro.module`, `code-arm-asm-02-registers.module`, `code-arm-asm-03-arithmetic.module`
- `do-*` (31): do-7=1, do-8=1, do-9=1, do-10=1
  - sample: `do-7-git-fundamentals`, `do-8-branches`, `do-9-remote-repos`
- `pfi-*` (31): pfi-w3=9, pfi-w2=8, pfi-w1=7, pfi-w4=5
  - sample: `code-pfi-sandbox-tour-lab`, `code-pfi-w1-checkpoint-lab`, `code-pfi-w1-project-lab`
- `git-*` (2): git-bisect=1, git-blame=1
  - sample: `code-git-bisect`, `code-git-blame`
- `api-*` (1): api-visualizer=1
  - sample: `code-api-visualizer`
- `devnet-*` (1): devnet-guide=1
  - sample: `code-devnet-guide`
- `sprint-*` (1): sprint-simulator=1
  - sample: `code-sprint-simulator`
- `data-*` (1): data-format=1
  - sample: `code-data-format-converter`
- `ansible-*` (1): ansible-visualizer=1
  - sample: `code-ansible-visualizer`
- `dont-*` (1): dont-deploy=1
  - sample: `code-dont-deploy-on-friday`
- `pipeline-*` (1): pipeline-panic=1
  - sample: `code-pipeline-panic`
- `kill-*` (1): kill-nine=1
  - sample: `code-kill-nine`

**Top curriculum-signal clusters:**

- unclassified (182)
- topic:Python Programming (36)
- topic:SQL / Databases (10)
- topic:Networking (3)
- topic:Docker / Containers (3)
- topic:Kubernetes (1)
- topic:Cloud (1)
- topic:JavaScript (1)

### `web` — 221 true orphans, 10 sub-content

**Top id-prefix sub-clusters:**

- `np-*` (108): np-n10009=6, np-osi=6, np-network=5, np-wireless=5
  - sample: `web-np-dns-troubleshooting-lab`, `web-np-firewall-rules-lab`, `web-np-midterm-gui-lab`
- `ccna-*` (40): ccna-ccna=40
  - sample: `web-ccna-ccna-acl-lab-lab`, `web-ccna-ccna-ios-cli-lab`, `web-ccna-ccna-nat-config-lab`
- `ip-*` (13): ip-ipv6=2, ip-subnet=2, ip-cidr=1, ip-ipv4=1
  - sample: `web-ip-cidr-notation`, `web-ip-ipv4-classes`, `web-ip-ipv6-addressing`
- `network-*` (5): network-services=1, network-classes=1, network-addressing=1, network-essentials=1
  - sample: `web-network-services`, `web-network-classes`, `web-network-addressing`
- `packet-*` (5): packet-analysis=1, packet-sniffer=1, packet-run=1, packet-flap=1
  - sample: `web-packet-analysis-lab`, `web-packet-sniffer`, `web-packet-run`
- `networking-*` (2): networking-guide=1, networking-fundamentals=1
  - sample: `web-networking-guide`, `web-networking-fundamentals-lab`
- `binary-*` (2): binary-converter=1, binary-ip=1
  - sample: `web-binary-converter`, `web-binary-ip`
- `class-*` (2): class-a=1, class-b=1
  - sample: `web-class-a`, `web-class-b`
- `osi-*` (2): osi-deep=1, osi-viz=1
  - sample: `web-osi-deep-viz`, `web-osi-viz`
- `dns-*` (2): dns-reference=1, dns-troubleshooting=1
  - sample: `web-dns-reference`, `web-dns-troubleshooting-lab`
- `cr-*` (2): cr-w2=1, cr-w3=1
  - sample: `web-cr-w2-network-layer-pres`, `web-cr-w3-application-pres`
- `burp-*` (1): burp-training=1
  - sample: `web-burp-training`

**Top curriculum-signal clusters:**

- topic:Networking (142)
- cert:Cisco CCNA (40)
- unclassified (32)
- topic:Firewalls (2)
- topic:Linux (2)
- course:Cyber Range (2)
- topic:SQL / Databases (1)

### `forge` — 148 true orphans, 33 sub-content

**Top id-prefix sub-clusters:**

- `core2-*` (47): core2-windows=5, core2-quiz=2, core2-roleplay=2, core2-admin=2
  - sample: `forge-core2-quiz-ch19-22`, `forge-core2-roleplay-lab`, `forge-core2-admin-tools-lab`
- `core1-*` (40): core1-mobile=3, core1-network=3, core1-pc=2, core1-soho=2
  - sample: `forge-core1-bluetooth-pairing`, `forge-core1-cable-matching`, `forge-core1-cloud-scenarios`
- `aplus-*` (11): aplus-core1=6, aplus-core2=3, aplus-quiz=1, aplus-jeopardy=1
  - sample: `forge-aplus-core1-full`, `forge-aplus-quiz`, `forge-aplus-core2-quiz`
- `windows-*` (4): windows-edition=2, windows-shortcuts=1, windows-keyboard=1
  - sample: `forge-windows-edition-selector`, `forge-windows-shortcuts`, `forge-windows-keyboard-shortcuts`
- `storage-*` (2): storage-raid=1, storage-devices=1
  - sample: `forge-storage-raid`, `forge-storage-devices`
- `settings-*` (2): settings-explorer=1, settings-tool=1
  - sample: `forge-settings-explorer`, `forge-settings-tool`
- `backup-*` (2): backup-planner=1, backup-or=1
  - sample: `forge-backup-planner`, `forge-backup-or-bust`
- `cpu-*` (2): cpu-architecture=1, cpu-arch=1
  - sample: `forge-cpu-architecture`, `forge-cpu-arch-ref`
- `mobile-*` (2): mobile-accessories=1, mobile-troubleshoot=1
  - sample: `forge-mobile-accessories`, `forge-mobile-troubleshoot`
- `network-*` (2): network-cables=1, network-ports=1
  - sample: `forge-network-cables`, `forge-network-ports`
- `raid-*` (2): raid-storage=1, raid-calculator=1
  - sample: `forge-raid-storage`, `forge-raid-calculator`
- `dont-*` (2): dont-brick=1, dont-anger=1
  - sample: `forge-dont-brick-the-pc`, `forge-dont-anger-the-printer`

**Top curriculum-signal clusters:**

- unclassified (106)
- topic:Networking (10)
- cert:CompTIA A+ Core 1 (6)
- topic:Linux (6)
- topic:Malware Analysis (5)
- cert:CompTIA A+ Core 2 (3)
- topic:Incident Response (3)
- topic:Cryptography (3)

### `shield` — 132 true orphans, 11 sub-content

**Top id-prefix sub-clusters:**

- `threat-*` (17): threat-runner=1, threat-swarm=1, threat-botnets=1, threat-code=1
  - sample: `shield-threat-runner`, `shield-threat-swarm`, `shield-threat-botnets`
- `cmmc-*` (15): cmmc-quiz=2, cmmc-au=1, cmmc-at=1, cmmc-cm=1
  - sample: `shield-cmmc-au`, `shield-cmmc-at`, `shield-cmmc-cm`
- `linux-*` (13): linux-ssh=3, linux-audit=2, linux-sudo=2, linux-fw=1
  - sample: `shield-linux-fw`, `shield-linux-audit-drill`, `shield-linux-audit`
- `crypto-*` (13): crypto-caesar=2, crypto-key=2, crypto-stream=2, crypto-symmetric=2
  - sample: `shield-crypto-quiz`, `shield-crypto-caesar`, `shield-crypto-crypto-protocols`
- `cf-*` (8): cf-mm01=1, cf-mm02=1, cf-mm03=1, cf-mm04=1
  - sample: `shield-cf-mm01-quiz`, `shield-cf-mm02-quiz`, `shield-cf-mm03-quiz`
- `sec101-*` (8): sec101-m01=1, sec101-m02=1, sec101-m03=1, sec101-m04=1
  - sample: `shield-sec101-m01`, `shield-sec101-m02`, `shield-sec101-m03`
- `hash-*` (3): hash-lab=1, hash-steg=1, hash-v3=1
  - sample: `shield-hash-lab`, `shield-hash-steg-pres`, `shield-hash-v3`
- `osint-*` (2): osint-dorking=1, osint-challenge=1
  - sample: `shield-osint-dorking`, `shield-osint-challenge`
- `stego-*` (2): stego=1, stego-applet=1
  - sample: `shield-stego`, `shield-stego-applet`
- `data-*` (2): data-roles=1, data-lifecycle=1
  - sample: `shield-data-roles`, `shield-data-lifecycle`
- `malware-*` (2): malware-ref=1, malware-zoo=1
  - sample: `shield-malware-ref`, `shield-malware-zoo`
- `aaa-*` (1): aaa-simulator=1
  - sample: `shield-aaa-simulator`

**Top curriculum-signal clusters:**

- course:Shield (Security) (131)
- course:First Watch (Intro Security) (1)

### `eye` — 110 true orphans, 1 sub-content

**Top id-prefix sub-clusters:**

- `cyberops-*` (85): cyberops-w6=9, cyberops-w7=9, cyberops-w3=7, cyberops-w5=7
  - sample: `eye-cyberops-review`, `eye-cyberops-certificate`, `cyberops-app-visibility-control`
- `cysa-*` (16): cysa-ch01=1, cysa-ch02=1, cysa-ch03=1, cysa-ch04=1
  - sample: `eye-cysa-ch01-quiz`, `eye-cysa-ch02-quiz`, `eye-cysa-ch03-quiz`
- `log-*` (2): log-detective=1, log-centipede=1
  - sample: `eye-log-detective`, `eye-log-centipede`
- `google-*` (1): google-dorking=1
  - sample: `eye-google-dorking-reference`
- `dont-*` (1): dont-feed=1
  - sample: `eye-dont-feed-the-troll`
- `alert-*` (1): alert-triage=1
  - sample: `eye-alert-triage`
- `threat-*` (1): threat-modeler=1
  - sample: `eye-threat-modeler`
- `grep-*` (1): grep-noir=1
  - sample: `eye-grep-noir`
- `wireshark-*` (1): wireshark-ta=1
  - sample: `eye-wireshark-ta`
- `kill-*` (1): kill-chain=1
  - sample: `eye-kill-chain-diamond`

**Top curriculum-signal clusters:**

- unclassified (43)
- topic:Networking (20)
- cert:CompTIA CySA+ (CS0-003) (16)
- topic:Digital Forensics (10)
- topic:Cryptography (7)
- topic:Incident Response (3)
- topic:Malware Analysis (3)
- topic:OSINT (2)

### `cloud` — 91 true orphans, 24 sub-content

**Top id-prefix sub-clusters:**

- `guilab-*` (19): guilab=1, guilab-module=1, guilab-2=1, guilab-3=1
  - sample: `cloud-guilab`, `cloud-guilab-module`, `cloud-guilab-2`
- `pslab-*` (19): pslab=1, pslab-module=1, pslab-2=1, pslab-3=1
  - sample: `cloud-pslab`, `cloud-pslab-module`, `cloud-pslab-2`
- `quizquiz-*` (19): quizquiz=1, quizquiz-module=1, quizquiz-2=1, quizquiz-3=1
  - sample: `cloud-quizquiz`, `cloud-quizquiz-module`, `cloud-quizquiz-2`
- `wsa-*` (6): wsa-gauntlet=2, wsa-course=1, wsa-review=1, wsa-midterm=1
  - sample: `wsa-course`, `cloud-wsa-review`, `wsa-midterm-outpost`
- `dont-*` (4): dont-lose=2, dont-check=2
  - sample: `dont-lose-your-domain`, `dont-check-the-bill`, `cloud-dont-lose-your-domain`
- `cloud-*` (4): cloud-hop=2, cloud-architect=1, cloud-flap=1
  - sample: `cloud-cloud-architect`, `cloud-cloud-hop`, `cloud-cloud-hop-vertical`
- `cse-*` (2): cse-06=1, cse-07=1
  - sample: `cloud-cse-06-quiz`, `cloud-cse-07-quiz`
- `support-*` (1): support-plans=1
  - sample: `cloud-support-plans`
- `regions-*` (1): regions=1
  - sample: `cloud-regions`
- `ec2-*` (1): ec2-visualizer=1
  - sample: `cloud-ec2-visualizer`
- `use-*` (1): use-cases=1
  - sample: `cloud-use-cases`
- `visualizer-*` (1): visualizer=1
  - sample: `cloud-visualizer`

**Top curriculum-signal clusters:**

- unclassified (62)
- topic:Cloud (10)
- topic:AWS (6)
- topic:Networking (6)
- topic:Firewalls (3)
- course:CIS2253 Cybersecurity Ethics (2)
- topic:Docker / Containers (2)

### `dark-arts` — 68 true orphans, 20 sub-content

**Top id-prefix sub-clusters:**

- `da-*` (14): da-linux=13, da-ad=1
  - sample: `da-linux-nmap-drill`, `da-linux-nmap-advanced`, `da-linux-hash-drill`
- `dark-*` (8): dark-osint=1, dark-phishing=1, dark-network=1, dark-m365=1
  - sample: `dark-osint-recon-lab`, `dark-phishing-campaign-lab`, `dark-network-forensics-lab`
- `malware-*` (2): malware-families=1, malware-analysis=1
  - sample: `dark-arts-malware-families`, `dark-arts-malware-analysis-lab`
- `nmap-*` (2): nmap-training=1, nmap-scanning=1
  - sample: `dark-arts-nmap-training`, `dark-arts-nmap-scanning-lab`
- `network-*` (2): network-sniffing=1, network-scanning=1
  - sample: `dark-arts-network-sniffing-lab`, `dark-arts-network-scanning-lab`
- `feh-*` (1): feh-comprehensive=1
  - sample: `dark-arts-feh-comprehensive-review`
- `cyberops-*` (1): cyberops-200201=1
  - sample: `dark-arts-cyberops-200201`
- `five-*` (1): five-gates=1
  - sample: `dark-arts-five-gates`
- `the-*` (1): the-vault=1
  - sample: `dark-arts-the-vault`
- `sandbox-*` (1): sandbox-setup=1
  - sample: `dark-arts-sandbox-setup`
- `static-*` (1): static-analysis=1
  - sample: `dark-arts-static-analysis`
- `dynamic-*` (1): dynamic-analysis=1
  - sample: `dark-arts-dynamic-analysis`

**Top curriculum-signal clusters:**

- unclassified (36)
- topic:Networking (11)
- topic:Malware Analysis (6)
- topic:Linux (3)
- topic:Cloud (2)
- topic:OSINT (2)
- course:Dark Arts Feh (1)
- topic:Incident Response (1)

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

## Existing Hub Inventory (77)

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

### `cloud` (11 hubs)

- `houses/cloud/az-104/index.html` — Azure Administrator Associate // AZ-104
- `houses/cloud/az-900/index.html` — Azure Fundamentals // AZ-900
- `houses/cloud/cloud-essentials/index.html` — Cloud Base &mdash; CTS2145C
- `houses/cloud/cse/index.html` — EC-Council Cloud Security Engineer (CSE v1) - House of the Cloud
- `houses/cloud/index.html` — House of the Cloud - Hexworth Prime
- `houses/cloud/modules/wsa/index.html` — Windows Server Administration - House of Cloud
- `houses/cloud/ms-102/index.html` — Microsoft 365 Administrator // MS-102
- `houses/cloud/ms-900/index.html` — Microsoft 365 Fundamentals // MS-900
- `houses/cloud/openstack/index.html` — OpenStack Cloud Platform - House of the Cloud
- `houses/cloud/pl-300/index.html` — Power BI Data Analyst // PL-300
- `houses/cloud/server-plus/index.html` — CompTIA Server+ SK0-005 // Hexworth Prime

### `code` (6 hubs)

- `houses/code/algorithms/index.html` — The Algorithm Chamber - House of the Code | Hexworth Prime
- `houses/code/armory/sql/index.html` — SQL Track - The Code Armory
- `houses/code/devops/index.html` — The Forge - DevOps Hub - Hexworth Prime
- `houses/code/index.html` — House of the Code - Hexworth Prime
- `houses/code/python-for-it/index.html` — Python for IT &mdash; COP1034C
- `houses/code/python-programming/index.html` — Snake Pit // COP2891 &mdash; Python Programming

### `dark-arts` (2 hubs)

- `houses/dark-arts/feh/index.html` — Foundations of Ethical Hacking - Dark Arts
- `houses/dark-arts/index.html` — House of the Dark Arts - Hexworth Prime

### `divergent` (4 hubs)

- `houses/divergent/cybersecurity-ethics/index.html` — Cybersecurity Ethics // CIS2253
- `houses/divergent/cybersecurity-policy/index.html` — The Domino Effect - CIS2208 - Hexworth Prime
- `houses/divergent/ethics-it/index.html` — Ethics in Information Technology // CIS4253
- `houses/divergent/index.html` — The Warehouse // Divergent - Hexworth Prime

### `eye` (4 hubs)

- `houses/eye/cysa/index.html` — CompTIA CySA+ (CS0-003) - House of the Eye
- `houses/eye/forensics/index.html` — Digital Forensics Hub — Hexworth Prime
- `houses/eye/index.html` — House of the Eye - Hexworth Prime
- `houses/eye/modules/cyberops/index.html` — CyberOps Associate 200-201 - Eye House | Hexworth Prime

### `forge` (6 hubs)

- `houses/forge/hardware-support/index.html` — Bare Metal // CTS1150C &mdash; Hardware Support
- `houses/forge/index.html` — House of the Forge - Hexworth Prime
- `houses/forge/intro-computers/index.html` — First Boot &mdash; CGS1000C
- `houses/forge/md-100/index.html` — MD-100: Windows Client - House of Forge
- `houses/forge/md-101/index.html` — MD-101: Managing Modern Desktops - House of Forge
- `houses/forge/server-management/index.html` — The Server Room // CTS1328C &mdash; Managing and Maintaining Server Operating Systems

### `key` (1 hub)

- `houses/key/index.html` — House of the Key - Hexworth Prime

### `script` (3 hubs)

- `houses/script/courses/clh/index.html` — Command Line Hacker - House of Script
- `houses/script/index.html` — House of the Script - Hexworth Prime
- `houses/script/linux/index.html` — Linux Administration - House of the Script

### `shield` (9 hubs)

- `houses/shield/cyber-framework/index.html` — Cyber Law & Policy Framework - House of the Shield
- `houses/shield/index.html` — House of the Shield - Hexworth Prime
- `houses/shield/infosec/index.html` — Principles of Information Security // CIS2350C
- `houses/shield/intro-security/index.html` — First Watch // CTS1120C
- `houses/shield/isc2-cc/index.html` — ISC2 Certified in Cybersecurity (CC) // Hexworth Prime
- `houses/shield/ms-security/index.html` — Microsoft Security-101 - House of the Shield
- `houses/shield/sc-200/index.html` — Microsoft Security Operations Analyst // SC-200
- `houses/shield/sc-900/index.html` — SC-900 // Microsoft Security, Compliance, and Identity Fundamentals
- `houses/shield/security-plus/index.html` — CompTIA Security+ SY0-701 // Hexworth Prime

### `web` (5 hubs)

- `houses/web/ccna/index.html` — Cisco CCNA 200-301 - House of Web
- `houses/web/index.html` — House of the Web - Hexworth Prime
- `houses/web/intro-networks/index.html` — First Link // CTS1090C &mdash; Introduction to Networks
- `houses/web/net-essentials/index.html` — Cable Run // CTS1305C &mdash; Essentials of Networking
- `houses/web/network-plus/index.html` — CompTIA Network+ N10-009 — Study Hub

## Sub-Content Samples (first 30)

These orphans have a parent module already in-hub. Decision needed: roll up into parent, or expose as separate hub cards.

| Orphan id | Parent (in-hub) |
|---|---|
| `eye-incident-timeline-lab` | `eye-incident-timeline` |
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
