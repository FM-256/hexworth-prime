# QC-57 Inventory — Platform-Wide Client-Grading Quizzes

Generated 2026-05-08. Total: 95 quizzes.

**Live-state addendum 2026-06-06 (marathon branch):** current EduScan QUIZ-002b (now catching both Pattern A1 quoted `"ans":N` and A2 unquoted `ans:N` after marathon commit `c49d4ee41`) reports **79 findings**. Delta vs. 2026-05-08 audit:

- ~16 inventory entries migrated since the original audit — notable: openstack quizzes via SEC-4/5 batches. These no longer fire QUIZ-002b.
- Additional findings beyond the original list are folded into the 79 — some weekly-quiz tracks (code/python-for-it, shield/infosec, matrix/adv-linux) were not explicitly enumerated below but match Pattern A2 and surface now.

For the live up-to-date list of currently-flagged files:
```bash
node _tools/eduscan/cli.js --json | \
  jq -r '[.. | objects | select(.code=="QUIZ-002b") | .file] | unique[]'
```

Pre-staged answer arrays for operator-authorized Firestore reseed:
```
_docs/operations/qc-57-answer-keys-extracted-2026-06-06.json
```
(79 quizzes, ans values in document order; quizId derived from filename — operator must reconcile against HTML moduleId before reseed per QC-54 lesson).

## divergent/cybersecurity-policy — 16 quizzes

| File | Pattern | Q# | Title | Answer pattern |
|------|---------|----|-------|----------------|
| `houses/divergent/cybersecurity-policy/quizzes/csp-w3-roles.quiz.html` | q.ans | 15 | Week 3 Quiz: Cybersecurity Roles \| Cybersecurity Policy | `[0,3,2,3,0,2,0,0,1,2]...` |
| `houses/divergent/cybersecurity-policy/quizzes/csp-w2-human-factor.quiz.html` | q.ans | 15 | Week 2 Quiz: The Human Factor \| The Domino Effect | `[2,0,0,0,0,2,3,3,2,2]...` |
| `houses/divergent/cybersecurity-policy/quizzes/csp-w1-security-by-design.quiz.html` | q.ans | 15 | Week 1 Quiz: Security by Design \| The Domino Effect | `[0,0,2,2,3,0,2,3,0,3]...` |
| `houses/divergent/cybersecurity-policy/quizzes/csp-w4-nist-800-53.quiz.html` | q.ans | 15 | Week 4 Quiz: NIST 800-53 \| Cybersecurity Policy | `[1,2,1,0,0,2,1,3,3,0]...` |
| `houses/divergent/cybersecurity-policy/quizzes/csp-w2-threats.quiz.html` | q.ans | 15 | Week 2 Quiz: Threat Landscape \| The Domino Effect | `[0,0,2,0,0,2,2,3,3,3]...` |
| `houses/divergent/cybersecurity-policy/quizzes/csp-w4-risk-management.quiz.html` | q.ans | 15 | Week 4 Quiz: Risk Management \| Cybersecurity Policy | `[1,2,0,2,1,3,0,2,2,1]...` |
| `houses/divergent/cybersecurity-policy/quizzes/csp-w1-workforce.quiz.html` | q.ans | 15 | Week 1 Quiz: Cybersecurity Workforce \| The Domino Effect | `[0,0,0,2,0,2,2,2,3,3]...` |
| `houses/divergent/cybersecurity-policy/quizzes/csp-w3-laws.quiz.html` | q.ans | 15 | Week 3 Quiz: Cybersecurity Laws \| Cybersecurity Policy | `[2,3,1,3,0,0,1,1,2,1]...` |
| `houses/divergent/cybersecurity-policy/quizzes/csp-w2-programs.quiz.html` | q.ans | 15 | Week 2 Quiz: Security Programs \| The Domino Effect | `[2,0,0,2,2,2,3,0,0,3]...` |
| `houses/divergent/cybersecurity-policy/quizzes/csp-w4-sovereignty.quiz.html` | q.ans | 15 | Week 4 Quiz: Digital Sovereignty \| Cybersecurity Policy | `[0,1,1,3,3,0,1,3,0,1]...` |
| `houses/divergent/cybersecurity-policy/quizzes/csp-w2-bcp-drp.quiz.html` | q.ans | 15 | Week 2 Quiz: BCP & DRP \| The Domino Effect | `[0,0,0,3,0,3,2,3,1,1]...` |
| `houses/divergent/cybersecurity-policy/quizzes/csp-w3-governance.quiz.html` | q.ans | 15 | Week 3 Quiz: Governance Frameworks \| Cybersecurity Policy | `[2,0,0,1,2,3,3,1,1,3]...` |
| `houses/divergent/cybersecurity-policy/quizzes/csp-w1-concepts.quiz.html` | q.ans | 15 | Week 1 Quiz: Core Concepts \| The Domino Effect | `[0,2,0,0,2,3,0,2,3,3]...` |
| `houses/divergent/cybersecurity-policy/quizzes/csp-w4-nist-csf.quiz.html` | q.ans | 15 | Week 4 Quiz: NIST CSF \| Cybersecurity Policy | `[2,0,2,1,3,0,1,2,1,2]...` |
| `houses/divergent/cybersecurity-policy/quizzes/csp-w1-origins.quiz.html` | q.ans | 15 | Week 1 Quiz: Origins of Cybersecurity \| The Domino Effect | `[0,3,3,3,1,0,2,2,0,1]...` |
| `houses/divergent/cybersecurity-policy/quizzes/csp-w3-compliance.quiz.html` | q.ans | 15 | Week 3 Quiz: Compliance Frameworks \| Cybersecurity Policy | `[2,1,0,1,0,1,2,3,1,2]...` |

## web/net-essentials — 8 quizzes

| File | Pattern | Q# | Title | Answer pattern |
|------|---------|----|-------|----------------|
| `houses/web/net-essentials/quizzes/cr-w1-access.quiz.html` | q.ans | 15 | Quiz: Media &amp; Access Layer \| Cable Run | `[0,0,2,0,3,2,1,2,1,2]...` |
| `houses/web/net-essentials/quizzes/cr-w1-osi.quiz.html` | q.ans | 15 | Quiz: OSI Model &amp; Encapsulation \| Cable Run | `[0,3,2,2,0,0,3,1,2,1]...` |
| `houses/web/net-essentials/quizzes/cr-w3-app.quiz.html` | q.ans | 15 | Quiz: Application Protocols \| Cable Run | `[0,0,2,0,2,2,3,1,1,1]...` |
| `houses/web/net-essentials/quizzes/cr-w2-network.quiz.html` | q.ans | 15 | Quiz: Network Layer &amp; Routing \| Cable Run | `[2,0,3,0,3,2,1,0,1,1]...` |
| `houses/web/net-essentials/quizzes/cr-w3-transport.quiz.html` | q.ans | 15 | Quiz: Transport Layer \| Cable Run | `[2,2,0,3,0,3,0,3,1,1]...` |
| `houses/web/net-essentials/quizzes/cr-w4-design.quiz.html` | q.ans | 15 | Quiz: Network Design &amp; Security \| Cable Run | `[0,3,2,0,3,0,2,2,3,1]...` |
| `houses/web/net-essentials/quizzes/cr-w2-addressing.quiz.html` | q.ans | 15 | Quiz: IP Addressing &amp; Subnetting \| Cable Run | `[3,0,2,3,2,2,1,3,0,1]...` |
| `houses/web/net-essentials/quizzes/cr-w4-troubleshoot.quiz.html` | q.ans | 15 | Quiz: Network Troubleshooting \| Cable Run | `[3,0,2,3,2,2,0,3,0,1]...` |

## web/intro-networks — 8 quizzes

| File | Pattern | Q# | Title | Answer pattern |
|------|---------|----|-------|----------------|
| `houses/web/intro-networks/quizzes/fl-w1-ports.quiz.html` | q.ans | 15 | Quiz: Ports &amp; Protocols \| First Link | `[0,1,2,3,0,1,2,3,0,1]...` |
| `houses/web/intro-networks/quizzes/fl-w2-wireless.quiz.html` | q.ans | 15 | Quiz: Wireless Networking \| First Link | `[0,1,2,0,2,3,1,2,0,2]...` |
| `houses/web/intro-networks/quizzes/fl-w1-hardware.quiz.html` | q.ans | 15 | Quiz: Network Hardware \| First Link | `[1,2,0,3,0,1,2,3,0,1]...` |
| `houses/web/intro-networks/quizzes/fl-w4-tools.quiz.html` | q.ans | 15 | Quiz: Network Troubleshooting Tools \| First Link | `[0,1,2,1,0,1,2,0,0,1]...` |
| `houses/web/intro-networks/quizzes/fl-w4-connections.quiz.html` | q.ans | 15 | Quiz: Network Connections \| First Link | `[0,1,2,1,0,2,2,1,0,1]...` |
| `houses/web/intro-networks/quizzes/fl-w3-services.quiz.html` | q.ans | 15 | Quiz: Network Services \| First Link | `[0,1,2,3,0,1,2,1,0,1]...` |
| `houses/web/intro-networks/quizzes/fl-w2-soho.quiz.html` | q.ans | 15 | Quiz: SOHO Networking \| First Link | `[0,1,1,3,0,1,2,1,0,1]...` |
| `houses/web/intro-networks/quizzes/fl-w3-config.quiz.html` | q.ans | 15 | Quiz: IP Addressing &amp; Configuration \| First Link | `[0,1,2,0,1,2,0,1,0,1]...` |

## cloud/cloud-essentials — 8 quizzes

| File | Pattern | Q# | Title | Answer pattern |
|------|---------|----|-------|----------------|
| `houses/cloud/cloud-essentials/quizzes/cb-w2-security.quiz.html` | q.ans | 15 | Quiz 3: Cloud Security \| Cloud Base | `[2,1,1,1,2,2,1,1,2,1]...` |
| `houses/cloud/cloud-essentials/quizzes/cb-w4-monitoring.quiz.html` | q.ans | 15 | Quiz 7: Cloud Monitoring & Metrics \| Cloud Base | `[1,1,1,1,1,1,1,1,2,0]...` |
| `houses/cloud/cloud-essentials/quizzes/cb-w4-troubleshoot.quiz.html` | q.ans | 15 | Quiz 8: Troubleshooting Cloud Deployments \| Cloud Base | `[1,1,1,1,1,1,1,1,1,2]...` |
| `houses/cloud/cloud-essentials/quizzes/cb-w3-backup.quiz.html` | q.ans | 15 | Quiz 5: Backup & Restore \| Cloud Base | `[2,0,1,2,1,1,2,0,2,1]...` |
| `houses/cloud/cloud-essentials/quizzes/cb-w3-dr.quiz.html` | q.ans | 15 | Quiz 6: Disaster Recovery \| Cloud Base | `[3,1,2,1,0,1,1,1,0,1]...` |
| `houses/cloud/cloud-essentials/quizzes/cb-w1-concepts.quiz.html` | q.ans | 15 | Quiz 1: Cloud Concepts & Models \| Cloud Base | `[0,2,3,1,2,2,1,0,1,2]...` |
| `houses/cloud/cloud-essentials/quizzes/cb-w1-deployment.quiz.html` | q.ans | 15 | Quiz 2: System Requirements & Deployment \| Cloud Base | `[1,2,2,2,3,1,1,1,0,1]...` |
| `houses/cloud/cloud-essentials/quizzes/cb-w2-automation.quiz.html` | q.ans | 15 | Quiz 4: Automation & Orchestration \| Cloud Base | `[1,1,2,1,1,1,1,1,2,1]...` |

## forge/server-management — 8 quizzes

| File | Pattern | Q# | Title | Answer pattern |
|------|---------|----|-------|----------------|
| `houses/forge/server-management/quizzes/sr-w3-monitor.quiz.html` | q.ans | 15 | Quiz: Monitoring and Backup \| The Server Room | `[1,1,1,1,2,1,1,2,1,2]...` |
| `houses/forge/server-management/quizzes/sr-w1-roles.quiz.html` | q.ans | 15 | Quiz: Server Roles and Features \| The Server Room | `[2,1,1,1,2,1,2,1,1,1]...` |
| `houses/forge/server-management/quizzes/sr-w4-troubleshoot.quiz.html` | q.ans | 15 | Quiz: Troubleshooting and Documentation \| The Server Room | `[1,1,1,1,1,1,1,1,1,1]...` |
| `houses/forge/server-management/quizzes/sr-w2-storage.quiz.html` | q.ans | 15 | Quiz: Storage Management \| The Server Room | `[3,1,2,1,2,1,1,1,1,3]...` |
| `houses/forge/server-management/quizzes/sr-w4-containers.quiz.html` | q.ans | 15 | Quiz: Containers and Nano Server \| The Server Room | `[1,1,1,1,2,1,1,1,2,1]...` |
| `houses/forge/server-management/quizzes/sr-w3-ha.quiz.html` | q.ans | 15 | Quiz: High Availability \| The Server Room | `[1,1,1,1,1,1,0,1,1,0]...` |
| `houses/forge/server-management/quizzes/sr-w1-install.quiz.html` | q.ans | 15 | Quiz: Server Installation \| The Server Room | `[2,1,1,2,1,1,1,1,1,1]...` |
| `houses/forge/server-management/quizzes/sr-w2-virtual.quiz.html` | q.ans | 15 | Quiz: Virtualization (Hyper-V) \| The Server Room | `[1,1,2,1,2,1,1,1,1,2]...` |

## forge/hardware-support — 8 quizzes

| File | Pattern | Q# | Title | Answer pattern |
|------|---------|----|-------|----------------|
| `houses/forge/hardware-support/quizzes/bm-w2-storage.quiz.html` | q.ans | 15 | Quiz: Storage Devices \| Bare Metal | `[3,2,2,1,2,2,1,1,1,0]...` |
| `houses/forge/hardware-support/quizzes/bm-w1-mobo.quiz.html` | q.ans | 15 | Quiz: Motherboards and CPUs \| Bare Metal | `[3,2,2,1,2,2,1,1,1,0]...` |
| `houses/forge/hardware-support/quizzes/bm-w4-troubleshoot.quiz.html` | q.ans | 15 | Quiz: Hardware Troubleshooting \| Bare Metal | `[3,2,2,1,2,2,1,1,1,0]...` |
| `houses/forge/hardware-support/quizzes/bm-w3-custom.quiz.html` | q.ans | 15 | Quiz: Custom PC Builds \| Bare Metal | `[3,2,2,1,2,2,1,1,1,0]...` |
| `houses/forge/hardware-support/quizzes/bm-w4-printers.quiz.html` | q.ans | 15 | Quiz: Printers and Multifunction Devices \| Bare Metal | `[3,2,2,1,2,2,1,1,1,0]...` |
| `houses/forge/hardware-support/quizzes/bm-w3-power.quiz.html` | q.ans | 15 | Quiz: Power Supplies \| Bare Metal | `[3,2,2,1,2,2,1,1,1,0]...` |
| `houses/forge/hardware-support/quizzes/bm-w2-ram.quiz.html` | q.ans | 15 | Quiz: RAM and Expansion Cards \| Bare Metal | `[3,2,2,1,2,2,1,1,1,0]...` |
| `houses/forge/hardware-support/quizzes/bm-w1-cables.quiz.html` | q.ans | 15 | Quiz: Cables and Connectors \| Bare Metal | `[3,2,2,1,2,2,1,1,1,0]...` |

## code/python-programming — 8 quizzes

| File | Pattern | Q# | Title | Answer pattern |
|------|---------|----|-------|----------------|
| `houses/code/python-programming/quizzes/sp-w4-analysis.quiz.html` | q.ans | 15 | Quiz 8: Data Analysis \| Snake Pit | `[2,1,2,2,2,1,2,1,3,1]...` |
| `houses/code/python-programming/quizzes/sp-w3-collections.quiz.html` | q.ans | 15 | Quiz 5: Lists & Dictionaries \| Snake Pit | `[2,1,1,2,0,3,1,1,1,1]...` |
| `houses/code/python-programming/quizzes/sp-w1-intro.quiz.html` | q.ans | 15 | Quiz 1: Introduction to Python \| Snake Pit | `[1,1,0,2,2,1,2,1,2,3]...` |
| `houses/code/python-programming/quizzes/sp-w2-strings.quiz.html` | q.ans | 15 | Quiz 4: Strings & Text Files \| Snake Pit | `[1,1,1,1,1,2,1,1,0,0]...` |
| `houses/code/python-programming/quizzes/sp-w1-datatypes.quiz.html` | q.ans | 15 | Quiz 2: Data Types & Expressions \| Snake Pit | `[1,2,2,3,1,2,1,3,1,0]...` |
| `houses/code/python-programming/quizzes/sp-w4-classes.quiz.html` | q.ans | 15 | Quiz 7: Classes & OOP \| Snake Pit | `[0,1,1,1,1,1,0,1,1,1]...` |
| `houses/code/python-programming/quizzes/sp-w3-functions.quiz.html` | q.ans | 15 | Quiz 6: Functions & Recursion \| Snake Pit | `[2,2,2,1,2,1,1,1,1,0]...` |
| `houses/code/python-programming/quizzes/sp-w2-loops.quiz.html` | q.ans | 15 | Quiz 3: Loops & Selection \| Snake Pit | `[2,0,0,1,0,3,0,1,0,2]...` |

## script/linux-essentials — 8 quizzes

| File | Pattern | Q# | Title | Answer pattern |
|------|---------|----|-------|----------------|
| `houses/script/linux-essentials/quizzes/ra-w3-security.quiz.html` | q.ans | 15 | Quiz: Security Best Practices \| Root Access | `[1,2,1,1,3,1,1,1,1,1]...` |
| `houses/script/linux-essentials/quizzes/ra-w2-servers.quiz.html` | q.ans | 15 | Quiz: Server Roles &amp; Scheduling \| Root Access | `[1,1,1,0,1,1,2,1,1,1]...` |
| `houses/script/linux-essentials/quizzes/ra-w4-logging.quiz.html` | q.ans | 15 | Quiz: Logging, Firewalls &amp; Backup \| Root Access | `[1,1,1,1,1,0,2,2,1,2]...` |
| `houses/script/linux-essentials/quizzes/ra-w4-troubleshoot.quiz.html` | q.ans | 15 | Quiz: System Troubleshooting \| Root Access | `[1,2,1,1,2,1,1,1,2,3]...` |
| `houses/script/linux-essentials/quizzes/ra-w1-storage.quiz.html` | q.ans | 15 | Quiz: Storage &amp; Package Management \| Root Access | `[1,1,2,2,1,1,1,2,1,2]...` |
| `houses/script/linux-essentials/quizzes/ra-w1-kernel.quiz.html` | q.ans | 15 | Quiz: Kernel Modules &amp; Networking \| Root Access | `[1,2,1,1,2,1,1,2,1,0]...` |
| `houses/script/linux-essentials/quizzes/ra-w3-users.quiz.html` | q.ans | 15 | Quiz: Users, Groups &amp; Permissions \| Root Access | `[1,1,1,1,1,0,1,1,2,1]...` |
| `houses/script/linux-essentials/quizzes/ra-w2-files.quiz.html` | q.ans | 15 | Quiz: File Management &amp; Services \| Root Access | `[1,1,2,1,1,0,1,1,2,1]...` |

## cloud/openstack — 4 quizzes

| File | Pattern | Q# | Title | Answer pattern |
|------|---------|----|-------|----------------|
| `houses/cloud/openstack/quizzes/cloud-openstack-intro-quiz.quiz.html` | correct:N | 15 | OpenStack Introduction Quiz - Hexworth Prime | `[1,2,2,1,2,1,1,2,2,2]...` |
| `houses/cloud/openstack/quizzes/cloud-openstack-projects-quiz.quiz.html` | correct:N | 15 | OpenStack Projects Quiz - Hexworth Prime | `[1,1,2,1,1,1,1,1,2,1]...` |
| `houses/cloud/openstack/quizzes/cloud-openstack-operation-quiz.quiz.html` | correct:N | 15 | OpenStack Operations Quiz - Hexworth Prime | `[1,1,1,1,1,1,1,0,1,1]...` |
| `houses/cloud/openstack/quizzes/cloud-openstack-install-quiz.quiz.html` | correct:N | 15 | OpenStack Installation Quiz - Hexworth Prime | `[1,1,1,2,2,1,1,1,1,1]...` |

## forge/applets — 4 quizzes

| File | Pattern | Q# | Title | Answer pattern |
|------|---------|----|-------|----------------|
| `houses/forge/applets/comptia-aplus/core-1/quizzes/forge-aplus-core1-prep-round-3.quiz.html` | correct:N | 4 | A+ Core 1 Prep — Round 3 - Forge House | `[0,1,1,1]` |
| `houses/forge/applets/comptia-aplus/core-1/quizzes/forge-aplus-core1-prep-round-1.quiz.html` | correct:N | 4 | A+ Core 1 Prep — Round 1 - Forge House | `[3,2,3,2]` |
| `houses/forge/applets/comptia-aplus/core-1/quizzes/forge-aplus-core1-prep-round-4.quiz.html` | correct:N | 4 | A+ Core 1 Prep — Round 4 - Forge House | `[0,1,2,1]` |
| `houses/forge/applets/comptia-aplus/core-1/quizzes/forge-aplus-core1-prep-round-2.quiz.html` | correct:N | 4 | A+ Core 1 Prep — Round 2 - Forge House | `[0,2,0,1]` |

## shield/infosec — 4 quizzes

| File | Pattern | Q# | Title | Answer pattern |
|------|---------|----|-------|----------------|
| `houses/shield/infosec/quizzes/pis-w4.quiz.html` | q.ans | 15 | Week 4: Auth + Governance + IR \| Principles of Information  | `[0,0,2,3,2,3,1,0,3,2]...` |
| `houses/shield/infosec/quizzes/pis-w2.quiz.html` | q.ans | 15 | Week 2: Attacks + Cryptography \| Principles of Information  | `[0,0,2,3,2,3,1,0,3,2]...` |
| `houses/shield/infosec/quizzes/pis-w1.quiz.html` | q.ans | 15 | Week 1: Security Fundamentals + Threats \| Principles of Inf | `[0,0,2,3,2,3,1,0,3,2]...` |
| `houses/shield/infosec/quizzes/pis-w3.quiz.html` | q.ans | 15 | Week 3: Network Defense + PKI \| Principles of Information S | `[0,0,2,3,2,3,1,0,3,2]...` |

## divergent/cybersecurity-ethics — 4 quizzes

| File | Pattern | Q# | Title | Answer pattern |
|------|---------|----|-------|----------------|
| `houses/divergent/cybersecurity-ethics/quizzes/cse-w2.quiz.html` | q.ans | 10 | Week 2 Quiz: CIS2253 | `[1,1,0,1,2,0,1,3,1,2]` |
| `houses/divergent/cybersecurity-ethics/quizzes/cse-w1.quiz.html` | q.ans | 10 | Week 1 Quiz: Cyberethics &amp; Security Professional Foundat | `[3,2,1,1,3,1,2,1,1,2]` |
| `houses/divergent/cybersecurity-ethics/quizzes/cse-w4.quiz.html` | q.ans | 10 | Week 4 Quiz: CIS2253 | `[1,1,1,0,1,1,1,1,1,1]` |
| `houses/divergent/cybersecurity-ethics/quizzes/cse-w3.quiz.html` | q.ans | 10 | Week 3 Quiz: CIS2253 | `[2,1,3,2,1,1,2,1,1,1]` |

## divergent/ethics-it — 3 quizzes

| File | Pattern | Q# | Title | Answer pattern |
|------|---------|----|-------|----------------|
| `houses/divergent/ethics-it/quizzes/eth-w2.quiz.html` | q.ans | 15 | Week 2 Quiz: Privacy, Expression, and IP \| Ethics in IT | `[2,3,0,3,2,0,3,0,3,1]...` |
| `houses/divergent/ethics-it/quizzes/eth-w1.quiz.html` | q.ans | 15 | Week 1 Quiz: Ethics Fundamentals \| Ethics in IT | `[3,2,0,2,1,0,0,1,0,1]...` |
| `houses/divergent/ethics-it/quizzes/eth-w3.quiz.html` | q.ans | 10 | Week 3 Quiz: Software Ethics and IT Impact \| Ethics in IT | `[1,1,0,3,1,2,0,3,2,3]` |

## code/python-for-it — 3 quizzes

| File | Pattern | Q# | Title | Answer pattern |
|------|---------|----|-------|----------------|
| `houses/code/python-for-it/quizzes/pfi-w1-quiz.quiz.html` | q.ans | 15 | Quiz 1: Data Types, Operators &amp; Control Flow \| Python f | `[1,2,2,0,3,0,3,3,0,1]...` |
| `houses/code/python-for-it/quizzes/pfi-w2-quiz.quiz.html` | q.ans | 15 | Quiz 2: Strings, Files &amp; Data Structures \| Python for I | `[0,1,2,3,3,0,0,3,0,1]...` |
| `houses/code/python-for-it/quizzes/pfi-w3-quiz.quiz.html` | q.ans | 15 | Quiz 3: Functions, Graphics &amp; OOP \| Python for IT | `[1,0,1,0,1,1,0,2,3,3]...` |

## web/network-plus — 1 quizzes

| File | Pattern | Q# | Title | Answer pattern |
|------|---------|----|-------|----------------|
| `houses/web/network-plus/quizzes/ch7-20.quiz.html` | correct:N | 0 | Network+ Interactive Workbook Ch.7-20 \| N10-009 | `[]` |


---

## FRESH SCOPE — 2026-06-27 (re-scanned, supersedes the 2026-06-06 count)

Ran a fresh classification of all 549 `.quiz/.exam/.review.html` files (server-graded = `serverGrading:true`/`gradeQuiz`; client-graded = answer key embedded in HTML + no server call). **Don't trust the stale 79** — the canonical EduScan QUIZ-002b rule UNDER-reports.

**Current reality:**
| Bucket | Count | Notes |
|--------|-------|-------|
| Server-graded (compliant) | 415 | OK |
| **CLIENT-graded (QC-57 violations)** | **114** | 94 quizzes + **13 exams** + 7 reviews |
| Non-graded interactives | 18 | flashcards / jeopardy / wheel — NO scoring, NOT violations, exclude |
| Needs individual review | 2 | `web-networking-ch7-10/20.quiz.html` |

**⚠️ RULE BLIND SPOT (important):** EduScan `QUIZ-002b` reports **79** — it only scans `.quiz.html` for `ans:N`. It MISSES the **13 client-graded EXAMS** (`.exam.html` midterms/finals) and `correct:`-pattern quizzes. The exams are the HIGHEST-stakes assessments and students can View-Source the answers. **Tooling fix needed: extend QUIZ-002b to cover `.exam.html` + `correct:`/`correctAnswer` patterns**, else the finding will keep under-counting.

**The 13 client-graded exams (highest priority):**
net-essentials cr-midterm/final · cloud-essentials cb-midterm/final · server-management sr-midterm/final ·
hardware-support bm-midterm/final · python-programming sp-w2-midterm/sp-w4-final · python-for-it pfi-w4-final ·
linux-essentials ra-midterm/final.

**By track (14 tracks, mostly per-course weekly batches):** divergent/cybersecurity-policy 16 · web/net-essentials 10 ·
cloud/cloud-essentials 10 · forge/server-management 10 · forge/hardware-support 10 · code/python-programming 10 ·
script/linux-essentials 10 · web/intro-networks 8 · shield/infosec 8 · divergent/ethics-it 6 · cloud/openstack 4 ·
forge/applets 4 · divergent/cybersecurity-ethics 4 · code/python-for-it 4.

**Fix pattern (per assessment):** refactor HTML → `QuizEngine({serverGrading:true, moduleId})` (strip embedded answers
+ client grade fn) → extract answer key → seed `quiz_keys/{moduleId}` to Firestore (**PRODUCTION write — rule #10 gated,
needs operator auth**) + `functions/quiz_keys.json` mirror → `node functions/verify-quiz-keys.js <id>` = PASSED → deploy.
Reuse this session's `_tools/secplus-quiz-gen.js` (bakes moduleId=key, no leakage) + the `bridget` agent for HTML↔Firestore↔Confluence sync. Watch the QC-54 lesson: filename-derived quizId MUST match the HTML moduleId.

**Effort:** ~109 graded assessments. Realistically a multi-session marathon, batched per-course (~12 waves of ~10).
The Firestore seeding is the throughput bottleneck (gated production write) + the accuracy risk (key↔moduleId reconciliation).

**Operator decisions needed before execution:**
1. Confirm the **13 exams** are IN scope (recommend yes — highest stakes).
2. Confirm the **18 non-graded games** are OUT (flashcards/jeopardy/wheel have no scoring).
3. **Firestore production-seed authorization** — batch-authorize per wave, or one standing authorization for the marathon?
4. Want the **QUIZ-002b rule extended** to catch exams (so the metric stops under-counting)?

---

## EXAM WAVE COMPLETE — 2026-06-27 (13 of 13)

All 13 client-graded EXAMS converted to server-side grading and LIVE. Operator decision: keep instant
feedback (no deferring). Pattern: strip the embedded answer key; each answer validated per-question via the
`gradeQuiz` Cloud Function (instant Correct/Incorrect + explanation preserved); answer key lives only in
`quiz_keys/{moduleId}` (Firestore, seeded + `verify-quiz-keys.js PASSED`). Uses existing infra — no new
Cloud Function.

- **cr-midterm** (proof, deployed first).
- **Family A** (multi-line skeleton, exact-match converter): cr-final, bm-midterm, bm-final.
- **Family B** (minified, brace-matching converter): cb-midterm/final, sr-midterm-exam/sr-final-exam,
  sp-w2-midterm/sp-w4-final, pfi-w4-final-exam, ra-midterm-exam/ra-final-exam. ra exams used a no-TOPICS
  block (no topic breakdown).

**Verified:** all 13 headless-tested end-to-end at 100% (instant feedback via server, completion fires,
0 console errors); **all 13 QUIZ_ID↔seeded-key reconciled** (incl. the `-exam` suffixes — closes the QC-54
0/N trap); answer keys confirmed gone from live source.

**Remaining QC-57:** ~94 client-graded QUIZZES + 7 reviews (the non-exam violations). The 18 non-graded
interactives (flashcards/jeopardy/wheel) stay excluded. Next waves: the quizzes, grouped by course/structure,
same convert→seed→verify→deploy flow.

---

## QUIZ WAVES — SCOPE 2026-06-27 (after exams done; ~94 quizzes remain)

Fresh structure-profiled scan of all client-graded `.quiz.html` (server-graded + non-graded excluded).
**94 client-graded quizzes across 14 tracks.** They cluster into 4 structural families:

| Family | Count | Structure | Converter |
|--------|-------|-----------|-----------|
| 1 | 48 | selectAnswer · multi-line · no TOPICS · `ans:` | **PROVEN ra-style no-TOPICS brace-matcher** |
| 2 | 22 | selectAnswer · multi-line · no TOPICS · `"ans":` | same (quote-agnostic strip) |
| 3 | 16 | selectAnswer · MINIFIED · no TOPICS · `"ans":` | same (brace-matcher is format-agnostic) |
| 4 | 8 | NO selectAnswer · `correct:` field · different grade fn | **NEW converter needed** |

**KEY: 86 of 94 (Families 1–3) reuse the EXACT converter already proven on the ra exams** — selectAnswer +
no topic breakdown, and the brace-matching replacer + `,\s*"?ans"?\s*:\s*\d+` strip handle minified/multi-line
and `ans:`/`"ans":` automatically. Only **8** are structurally new.

**By track (per-wave batches):** cybersecurity-policy 16 · net-essentials 8 · intro-networks 8 ·
cloud-essentials 8 · server-management 8 (minified) · python-programming 8 · linux-essentials 8 (minified) ·
hardware-support 8 · shield/infosec 4 · cybersecurity-ethics 4 · ethics-it 3 · python-for-it 3.

**Family 4 (8, separate wave):** cloud/openstack (4: intro/projects/operation/install quizzes, moduleId
`openstack-*-quiz`) + forge/applets/comptia-aplus/core-1 prep-round 1–4. Use a `questions=[{...correct:N}]`
format with a non-selectAnswer grader — read one before converting.

**Per-wave flow (same as exams):** convert (no-TOPICS block) → extract keys → check no existing quiz_keys
(Nancy) → seed (per-wave operator auth) → `verify-quiz-keys.js` → reconcile each page's QUIZ_ID == seeded key
(QC-54 trap) → headless drive-test → one deploy per wave. Each quiz still individually headless-tested (ra
proved subtle structural variants exist — fail-loud + test catches them).

**Effort:** ~94 quizzes; 86 fast (proven converter), 8 need a new converter. ~12 track-waves + 1 Family-4 wave.
Bottleneck: Firestore seeding (gated, per-wave auth) + per-quiz QUIZ_ID reconciliation. Plus 7 reviews (TBD).

---

## CONTINUATION — NEXT MARATHON (handoff 2026-06-28)

**Where we are:** Exams **13/13 DONE + live**. Quizzes **8/94 DONE** (cloud-essentials, quiz Wave 1).
Remaining: **86 quizzes** (Families 1–3, proven converter) + **8 Family-4** (new converter) + **7 reviews** (TBD).
The 18 non-graded interactives (flashcards/jeopardy/wheel) stay excluded.

**Remaining quiz tracks (per-wave batches, ~all uniform within a track):**
cybersecurity-policy 16 · net-essentials 8 · intro-networks 8 · server-management 8 (minified) ·
python-programming 8 · linux-essentials 8 (minified) · hardware-support 8 · shield/infosec 4 ·
divergent/cybersecurity-ethics 4 · divergent/ethics-it 3 · code/python-for-it 3.
Family-4 (separate): cloud/openstack 4 + forge/applets comptia-aplus core-1 prep-rounds 4 (`correct:` field, NO selectAnswer).

**PROVEN RECIPE (per track-wave) — repeat exactly:**
1. **Read ONE quiz's structure first** (don't blind-apply): `function selectAnswer` body — TOPICS or not? a live
   `scoreLabel` update? submit text ('See Results' vs 'Submit Exam' vs other)? minified or multi-line? Build a
   **track-tailored block** that preserves those per-track UI bits. (cloud-essentials had no-TOPICS + scoreLabel +
   'See Results'; ra exams had no-TOPICS + 'Submit Exam'; cb/sr/sp exams had TOPICS.)
2. Convert all quizzes in the track with the brace-matching replacer (handles minified/multi-line + `ans:`/`"ans":`):
   extract `QUIZ_ID` from EACH page's own `ModuleProgress.complete/completeQuiz('<house>','<moduleId>')` call (QC-54
   safety — some have `-exam`/`-quiz` suffixes); extract the answer array; strip `,\s*"?ans"?\s*:\s*\d+`; prepend the
   `gradeOne` helper + `QUIZ_ID` + replace `selectAnswer`. Assert each step matched once (fail-loud).
3. **Headless-test EACH quiz** (stub `gradeQuiz` against the extracted key, drive correct answers → expect 100% +
   completion + 0 console errors). ra proved subtle variants exist (no-TOPICS) — the test catches them.
4. Add keys to `functions/quiz_keys.json` (assert each `quizId` NOT already present — no overwrite, Nancy).
5. **Seed** `node push-quiz-keys.js --filter <quizId>` per key — **Rule #10 gated production write; needs per-wave
   operator authorization + branch == master**. Then `node verify-quiz-keys.js <ids...>` → "Verification PASSED".
6. **Reconcile** every page: `var QUIZ_ID == seeded quiz_keys id` AND page sends `quizId: QUIZ_ID` (closes the
   QC-54 0/N trap — the headless test does NOT catch a QUIZ_ID mismatch because it stubs gradeQuiz).
7. Commit + ONE `./deploy.sh --skip-chris --skip-chris-reason "..."` per wave. Verify live: 0 `ans` in source.

**Reusable assets (this session):** the brace-matching converter + headless drive-test harness are in the
git history (commits for cr-midterm / Family A / Family B / cloud-essentials). The `gradeOne` helper + async
`selectAnswer` block are copy-paste-ready (see any converted exam, e.g. `houses/web/net-essentials/exams/cr-midterm.exam.html`).

**Family-4 (openstack/applets) — NOT yet patterned:** uses `questions=[{...correct:N}]` + a non-`selectAnswer`
grader. Read one (`houses/cloud/openstack/quizzes/cloud-openstack-intro-quiz.quiz.html`) to design its converter
before seeding. moduleIds e.g. `openstack-intro-quiz`.

**WAVE 2 (python-for-it, 2026-07-02) — recipe amendments for waves 3-N (Nancy review findings):**
- **(f) "Checking…" interim state is INVISIBLE with the stock block** — base `.feedback` CSS is `display:none`; only `.correct`/`.incorrect` show it. Fix shipped in Wave 2: add a `.feedback.checking { display:block; ... }` rule and set `fb.className = 'feedback checking'` for the interim state. Waves 3-N MUST include this (and Wave-1's 8 cb-w* files need the retrofit — backlogged). Verify via puppeteer computed-style with a slowed (setTimeout) gradeQuiz stub, not just textContent.
- **(g) `quiz_attempts` flooding — FIXED IN CODE 2026-07-02 (commits dbec80aee + c3b175e07, functions deploy pending):** gradeQuiz now honors an EXPLICIT `partial: true` flag (skips attempt log + reviewAfterFails + scopes reveal to the submitted question). All 24 per-question pages (13 exams, 8 cb, 3 pfi) send it. **Waves 3-N MUST include `partial: true` in gradeOne** (`{ quizId: QUIZ_ID, answers: a, partial: true }`). NO length inference server-side — timed exams (ala-final/midterm) legitimately auto-submit few answers and must keep normal logging (Nancy catch).
- **(h) deploy-order failure is SILENT:** pages-before-keys ⇒ every question shows "Could not verify answer.", quiz unpassable, NO console error or monitorable signal. Keys MUST be seeded + verify-quiz-keys PASSED in the same operator turn as the deploy authorization.

**FAMILY-5 DISCOVERED (2026-07-02, do NOT blind-convert): review-screen tracks.** `divergent/cybersecurity-ethics`
(cse-w1..w4, 10 Q) has a full post-quiz REVIEW screen that renders `q.ans` client-side (correct-answer highlighting
per question, cse-w1 line ~303). Stripping `ans:` breaks the review. Also non-uniform inside the track: w1 uses
own-line `ans: N,`; w2-w4 use a different format (unverified). PROPOSED pattern (needs Nancy + operator sign-off,
and REQUIRES the gradeQuiz partial deploy + keys seeded with `revealToAll: true`): gradeOne already receives
`r.results[qIndex].correctAnswer` on partial calls when the key is revealToAll — accumulate those into a client map
during the quiz and drive the review screen from the map instead of `q.ans`. Checked 2026-07-02: **51 of the remaining quizzes have review screens** (csp, fl, bm, pis, cse at minimum) — Family-5 is the DOMINANT remaining pattern, so the revealToAll-accumulate design decision gates most of waves 3-N, not just cse.

**Gotchas:** (a) per-track UI bits (scoreLabel/submit text/TOPICS) — read first. (b) moduleId suffixes vary
(`-exam`, `-quiz`, none). (c) Firestore seed is gated — per-wave auth, master only. (d) headless test ≠ QUIZ_ID
reconcile — do BOTH. (e) if a convert breaks a file, `git checkout HEAD -- <file>` to restore the original + redo
(back up the broken copy to /tmp first).
