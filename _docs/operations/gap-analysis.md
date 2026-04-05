# Gap Analysis

> Cross-reference of Hexworth Prime content (3,231 files) against major certification frameworks and workforce standards.
> Source data: CONTENT_AUDIT.json, CONTENT_ORPHANS.json (1,255 orphans), CONTENT_GHOSTS.json (467 ghosts).
> Generated: 2026-03-18 | Wave: CA-5 / CA-6

---

## Table of Contents

1. [CompTIA Security+ (SY0-701)](#comptia-security-sy0-701)
2. [CompTIA CySA+ (CS0-003)](#comptia-cysa-cs0-003)
3. [CompTIA Network+ (N10-009)](#comptia-network-n10-009)
4. [NICE Cybersecurity Workforce Framework](#nice-cybersecurity-workforce-framework)
5. [NIST CSF 2.0](#nist-csf-20)
6. [Thin Hubs and Underdeveloped Tracks](#thin-hubs-and-underdeveloped-tracks)
7. [Recommendations Summary](#recommendations-summary)
8. [Orphan Reconciliation Plan](#orphan-reconciliation-plan)

---

## CompTIA Security+ (SY0-701)

Primary coverage: **Shield House** (263 files), **Key House** (51 files), **Dark Arts Hub** (228 files)

### Domain 1: General Security Concepts (12%)

| Objective | Coverage | Source |
|-----------|----------|--------|
| 1.1 Security controls categories | Strong | Shield applets/fundamentals (14), Security 101 (9 modules) |
| 1.2 Fundamental security concepts (CIA, AAA, zero trust) | Strong | Shield presentations (CIA triad, fundamentals), tools (zero-trust) |
| 1.3 Change management processes | Partial | Code DevOps touches CI/CD change controls; no dedicated security change-management module |
| 1.4 Cryptographic solutions | Strong | Key House (51 files -- AES, ECC, hashing, PKI, PQC), Shield crypto applets (40) |

**Gap:** 1.3 -- Security-focused change management (RFC process, impact analysis, rollback procedures) needs a dedicated module in Shield.

### Domain 2: Threats, Vulnerabilities, and Mitigations (22%)

| Objective | Coverage | Source |
|-----------|----------|--------|
| 2.1 Threat actors and motivations | Strong | Shield applets/threats (30), Dark Arts EHE track (45 files) |
| 2.2 Threat vectors and attack surfaces | Strong | Dark Arts Vault attack labs (20+), Bug Hunting Academy (55), WiFi Arsenal (27) |
| 2.3 Vulnerability types | Strong | Dark Arts standalone labs (SQLi, XSS, CSRF, SSRF, IDOR, buffer overflow) |
| 2.4 Indicators of malicious activity | Strong | Eye CyberOps applets (99), SOC labs (7), malware analysis modules (12) |
| 2.5 Mitigation techniques | Partial | Shield labs (34), network applets (11); no unified mitigation-strategy module mapping controls to threats |

**Gap:** 2.5 -- Needs a dedicated mitigation-mapping module connecting specific threats to specific controls/hardening steps.

### Domain 3: Security Architecture (18%)

| Objective | Coverage | Source |
|-----------|----------|--------|
| 3.1 Security architecture models | Partial | Shield Cyber Framework (26), cloud security in Cloud House; no explicit architecture-models module |
| 3.2 Security principles in enterprise infrastructure | Partial | Web Backbone netsec track (11 modules), Cloud WSA (107); infrastructure hardening spread thin |
| 3.3 Data protection concepts | Weak | Shield compliance applets (21) touch data classification; no dedicated DLP/data-at-rest/data-in-transit module |
| 3.4 Resilience and recovery | Weak | Forge has backup review (backup-or-bust); no dedicated BCP/DR/resilience module |

**Gaps:**
- 3.1 -- Security architecture models (defense-in-depth, zero trust architecture deep-dive) need a Shield module series
- 3.3 -- Data protection (DLP, classification, states of data) needs 3-5 modules in Shield
- 3.4 -- Business continuity, disaster recovery, RPO/RTO concepts need a dedicated module set

### Domain 4: Security Operations (28%)

| Objective | Coverage | Source |
|-----------|----------|--------|
| 4.1 Security techniques to computing resources | Partial | Shield labs (access control, hardening), Script Linux labs; application security scattered |
| 4.2 Security alerting and monitoring | Strong | Eye House (190 files -- SIEM, SOC, log analysis, threat hunting, CySA+ track) |
| 4.3 Vulnerability management | Partial | Dark Arts Bug Hunting (55), Shield tools (CVE lookup); no structured vuln-management lifecycle module |
| 4.4 Security incident response | Partial | Shield tools (IR), Operator IR missions (3); no formal IR lifecycle module (preparation, detection, containment, eradication, recovery, lessons learned) |
| 4.5 Data sources for investigation | Strong | Eye labs (correlation, log detective, traffic analysis, SIEM), Forensics Hub (27) |
| 4.6 Automation and orchestration | Partial | AI SOC automation module, Code DevOps automation; no SOAR-specific module |

**Gaps:**
- 4.3 -- Vulnerability management lifecycle (scanning, prioritization, remediation tracking) needs 2-3 modules
- 4.4 -- Formal IR lifecycle module series needed (NIST 800-61 aligned)
- 4.6 -- SOAR concepts, playbook automation, and security orchestration need dedicated coverage

### Domain 5: Security Program Management and Oversight (20%)

| Objective | Coverage | Source |
|-----------|----------|--------|
| 5.1 Governance elements | Partial | Shield compliance applets (21), CMMC applets; no standalone governance module |
| 5.2 Risk management processes | Partial | Shield applets/risk (7); no risk register, risk assessment methodology module |
| 5.3 Third-party risk assessment | Not Covered | No vendor risk management, supply chain risk, or third-party audit content |
| 5.4 Compliance and privacy | Partial | Shield compliance (21 CMMC applets), but missing GDPR, HIPAA, PCI-DSS, SOX modules |

**Gaps (Critical):**
- 5.1 -- Security governance (policies, standards, procedures, guidelines) needs a module series
- 5.2 -- Risk management (qualitative/quantitative analysis, risk register, risk appetite) needs 3-4 modules
- 5.3 -- Third-party/vendor risk management is completely absent
- 5.4 -- Privacy regulations and compliance frameworks beyond CMMC need coverage

### Security+ Coverage Summary

| Rating | Domains |
|--------|---------|
| **Strong** | Domain 2 (Threats), Domain 4.2/4.5 (Monitoring/Investigation) |
| **Partial** | Domain 1 (General Concepts), Domain 4.1/4.3/4.4 (Operations) |
| **Weak** | Domain 3 (Architecture), Domain 5 (Governance/Risk/Compliance) |
| **Not Covered** | 5.3 (Third-party risk) |

**Estimated objective coverage: ~65% strong, ~25% partial, ~10% weak/absent**

---

## CompTIA CySA+ (CS0-003)

Primary coverage: **Eye House** (190 files), **Shield House** (263 files), **Dark Arts Hub** (228 files)

### Domain 1: Security Operations (33%)

| Objective | Coverage | Source |
|-----------|----------|--------|
| 1.1 System and network architecture | Partial | Web Backbone (166), Cloud WSA (107); security-focused architecture view missing |
| 1.2 Analyze indicators of potentially malicious activity | Strong | Eye CyberOps applets (99), SOC labs (7), games (alert-triage, detection-engineering) |
| 1.3 Tools and techniques for malicious activity | Strong | Eye tools (SIEM, SOC, Wireshark, correlation, packet, hunt), Dark Arts tools (Nmap, Metasploit) |
| 1.4 Threat intelligence and threat hunting | Strong | Eye CySA+ track (50 files -- 16 labs, 16 presentations, 16 quizzes), threat hunting labs |

### Domain 2: Vulnerability Management (26%)

| Objective | Coverage | Source |
|-----------|----------|--------|
| 2.1 Vulnerability discovery and analysis | Partial | Dark Arts Bug Hunting (55), Shield CVE lookup tool; no dedicated vulnerability scanning methodology |
| 2.2 Vulnerability assessment tools | Partial | Dark Arts tools (Nmap), Web tools (SQLmap); missing dedicated Nessus/Qualys/OpenVAS workflow modules |
| 2.3 Vulnerability response, handling, and management | Weak | No structured vulnerability remediation lifecycle, SLA tracking, or patch management module |
| 2.4 Reporting and communication | Not Covered | No vulnerability reporting templates, executive summary writing, or risk communication modules |

**Gaps:**
- 2.2 -- Vulnerability scanner workflow modules (Nessus, OpenVAS, Qualys) needed
- 2.3 -- Vulnerability remediation lifecycle and patch management modules needed
- 2.4 -- Vulnerability reporting and risk communication is entirely absent

### Domain 3: Incident Response and Management (20%)

| Objective | Coverage | Source |
|-----------|----------|--------|
| 3.1 Attack methodology frameworks | Partial | Dark Arts EHE (MITRE ATT&CK referenced), Shield Cyber Framework (26); no dedicated kill-chain/diamond-model module |
| 3.2 Incident response activities | Partial | Operator IR missions (3), Shield IR tool, Forensics Hub (27); scattered across hubs |
| 3.3 Incident response communication | Weak | No stakeholder communication, legal notification, or IR reporting modules |

**Gaps:**
- 3.1 -- Dedicated MITRE ATT&CK navigator module, Cyber Kill Chain, Diamond Model modules needed
- 3.3 -- IR communication (chain of custody documentation, legal/regulatory notification) absent

### Domain 4: Reporting and Communication (21%)

| Objective | Coverage | Source |
|-----------|----------|--------|
| 4.1 Reporting vulnerabilities | Not Covered | No reporting module |
| 4.2 Reporting incidents | Not Covered | No IR report writing module |
| 4.3 Communication of findings | Not Covered | No executive briefing / technical writing for security module |

**Gap (Critical):** Domain 4 is entirely uncovered. This is a documentation and communication skills domain that needs 4-6 modules covering report writing, executive summaries, metrics dashboards, and stakeholder communication.

### CySA+ Coverage Summary

| Rating | Domains |
|--------|---------|
| **Strong** | Domain 1 (Security Operations) |
| **Partial** | Domain 2 (Vulnerability Management), Domain 3 (Incident Response) |
| **Not Covered** | Domain 4 (Reporting and Communication) |

**Estimated objective coverage: ~50% strong, ~30% partial, ~20% absent**

---

## CompTIA Network+ (N10-009)

Primary coverage: **Web House** (300 files), **Script House** (505 files -- networking modules)

### Domain 1: Networking Concepts (23%)

| Objective | Coverage | Source |
|-----------|----------|--------|
| 1.1 OSI and TCP/IP models | Strong | Web presentations (OSI, TCP), Network Essentials (11 modules), applets |
| 1.2 Network topologies and types | Strong | Web Backbone datacenter track, presentations, simulators |
| 1.3 Cabling and connectors | Partial | Forge hardware applets (20) have some cabling; no dedicated cabling/connector module in Web |
| 1.4 IP addressing (IPv4, IPv6) | Strong | Web applets/ip-addressing (16), IPv6 Backbone track (11 modules) |
| 1.5 Network protocols and ports | Strong | Web tools (port lookup, 27 total), presentations (DNS, DHCP, OSPF) |
| 1.6 Cloud and virtualization concepts | Strong | Cloud House (306 files), OpenStack (13) |
| 1.7 Network services | Strong | Web applets/services (4), presentations (DNS, DHCP), labs |

**Gap:** 1.3 -- Physical layer cabling/connectors (Cat5e/6/6a, fiber types, pinout standards, TIA-568A/B) needs a dedicated module.

### Domain 2: Network Implementation (19%)

| Objective | Coverage | Source |
|-----------|----------|--------|
| 2.1 Routing technologies | Strong | Web Backbone routing track (11), BGP track (11), OSPF presentations |
| 2.2 Switching technologies | Strong | Web presentations (VLANs), Backbone SDN track (11) |
| 2.3 Wireless standards and technologies | Strong | Web Backbone wireless track (11), presentations (wireless) |
| 2.4 Network device deployment | Partial | Web simulators (Packet Tracer Lite), but no dedicated device config labs (router/switch/AP initial setup) |

**Gap:** 2.4 -- Hands-on network device deployment and initial configuration lab series needed.

### Domain 3: Network Operations (16%)

| Objective | Coverage | Source |
|-----------|----------|--------|
| 3.1 Performance monitoring | Partial | Web Backbone QoS track (11), tools; no dedicated SNMP/NetFlow/sFlow monitoring module |
| 3.2 Network documentation | Not Covered | No network documentation (diagrams, rack documentation, cable management, change logs) module |
| 3.3 High availability and disaster recovery | Partial | Cloud HA concepts exist; no network-specific HA (FHRP, link aggregation, redundancy design) module |

**Gaps:**
- 3.1 -- SNMP, NetFlow, sFlow, network baseline monitoring modules needed
- 3.2 -- Network documentation practices entirely absent
- 3.3 -- Network HA/redundancy (HSRP/VRRP/GLBP, LACP, spanning tree) needs dedicated modules

### Domain 4: Network Security (19%)

| Objective | Coverage | Source |
|-----------|----------|--------|
| 4.1 Security concepts | Strong | Shield House (263 files), Web Backbone netsec track (11) |
| 4.2 Network hardening | Partial | Shield labs, Web labs (firewalls); no unified network hardening checklist module |
| 4.3 Remote access methods | Partial | Script SSH labs; no comprehensive VPN (IPSec, SSL/TLS VPN, site-to-site) module |
| 4.4 Physical security | Weak | No physical security for network infrastructure module |

**Gaps:**
- 4.3 -- VPN deep-dive (IPSec phases, SSL VPN, split tunneling, site-to-site) needs modules
- 4.4 -- Physical security for network infrastructure absent

### Domain 5: Network Troubleshooting (23%)

| Objective | Coverage | Source |
|-----------|----------|--------|
| 5.1 Network troubleshooting methodology | Partial | Web troubleshooting (2 files), Dispatch NT1 box; no structured CompTIA troubleshooting model module |
| 5.2 Wired connectivity issues | Partial | Web labs (subnetting, VLANs); no dedicated wired troubleshooting scenarios |
| 5.3 Wireless connectivity issues | Weak | Backbone wireless track is conceptual; no wireless troubleshooting lab |
| 5.4 Network service issues | Partial | Web labs (DNS, firewall); coverage spread thin |
| 5.5 Network tools | Strong | Web tools (27), Eye tools (Wireshark, packet analysis) |

**Gaps:**
- 5.1 -- CompTIA troubleshooting methodology (identify, theory, test, plan, implement, verify, document) needs a module
- 5.3 -- Wireless troubleshooting scenarios needed

### Network+ Coverage Summary

| Rating | Domains |
|--------|---------|
| **Strong** | Domain 1 (Concepts), Domain 2 (Implementation) |
| **Partial** | Domain 4 (Security), Domain 5 (Troubleshooting) |
| **Weak** | Domain 3 (Operations) |

**Estimated objective coverage: ~60% strong, ~30% partial, ~10% weak/absent**

---

## NICE Cybersecurity Workforce Framework

The NICE Framework defines 52 work roles across 7 categories. Coverage mapped against Hexworth Prime content.

### Securely Provision (SP)

| Work Role | Coverage | Source |
|-----------|----------|--------|
| SP-RSK-001 Authorizing Official | Not Covered | No risk authorization/ATO content |
| SP-RSK-002 Security Control Assessor | Partial | Shield compliance applets (21 CMMC), Cyber Framework (26) |
| SP-DEV-001 Software Developer | Strong | Code House (550 files), 17 languages, Algorithm Chamber, DevOps |
| SP-DEV-002 Secure Software Assessor | Partial | Dark Arts Bug Hunting (55), API security (94 Cloud); no secure SDLC module |
| SP-ARC-001 Enterprise Architect | Partial | Cloud WSA (107); no dedicated security architecture role module |
| SP-ARC-002 Security Architect | Weak | Shield Cyber Framework (26); no security architecture design module |
| SP-SRP-001 Research & Development Specialist | Not Covered | No R&D methodology content |
| SP-TST-001 System Testing/Evaluation | Partial | Code testing (unit testing labs/quizzes); no security testing methodology module |

### Operate and Maintain (OM)

| Work Role | Coverage | Source |
|-----------|----------|--------|
| OM-DTA-001 Database Administrator | Partial | Script databases module (35), Code SQL track (11) |
| OM-DTA-002 Data Analyst | Weak | Matrix (1 index), 10 data projects; no modules |
| OM-NET-001 Network Operations Specialist | Strong | Web House (300 files), Backbone (166), tools (27) |
| OM-STS-001 System Administrator | Strong | Script House (505 -- Linux admin), Forge (281 -- Windows admin), Operator missions (24) |
| OM-ADM-001 System Security Analysis | Partial | Shield, Eye content; no dedicated system security analysis workflow |

### Oversee and Govern (OV)

| Work Role | Coverage | Source |
|-----------|----------|--------|
| OV-LGA-001 Cybersecurity Legal Advisor | Not Covered | No legal/regulatory content |
| OV-PMA-001 Program Manager | Not Covered | No security program management content |
| OV-SPP-001 Cyber Policy and Strategy Planner | Not Covered | No policy development content |
| OV-EXL-001 Executive Cyber Leadership | Not Covered | No CISO/executive leadership content |
| OV-TEA-001 Cyber Instructional Curriculum Developer | Not Covered | Meta -- HP is a curriculum but no train-the-trainer content |

### Protect and Defend (PR)

| Work Role | Coverage | Source |
|-----------|----------|--------|
| PR-CDA-001 Cyber Defense Analyst | Strong | Eye House (190), CySA+ track (50), CyberOps applets (99) |
| PR-CIR-001 Cyber Defense Incident Responder | Partial | Operator IR missions (3), Shield IR tools, Forensics Hub (27) |
| PR-INF-001 Cyber Defense Infrastructure Support | Partial | Shield labs, Web networking, Cloud security |
| PR-VAM-001 Vulnerability Assessment Analyst | Partial | Dark Arts Bug Hunting (55), Shield CVE tool; no structured assessment workflow |

### Analyze (AN)

| Work Role | Coverage | Source |
|-----------|----------|--------|
| AN-ASA-001 All-Source Analyst | Not Covered | No intelligence analysis methodology |
| AN-EXP-001 Exploitation Analyst | Partial | Dark Arts Vault (228) covers exploitation techniques |
| AN-TGT-001 Target Developer | Not Covered | No targeting/reconnaissance methodology |
| AN-TWA-001 Threat/Warning Analyst | Partial | Eye threat hunting, CySA+ threat intelligence modules |
| AN-LNG-001 Multi-Disciplined Language Analyst | Not Covered | Not applicable to technical curriculum |

### Collect and Operate (CO)

| Work Role | Coverage | Source |
|-----------|----------|--------|
| CO-CLO-001 Collection Operations | Not Covered | Intelligence collection outside scope |
| CO-OPL-001 Cyber Operations Planner | Not Covered | No operational planning content |
| CO-OPS-001 Cyber Operations | Partial | Dark Arts offensive operations, CTF Arena (23 boxes) |

### Investigate (IN)

| Work Role | Coverage | Source |
|-----------|----------|--------|
| IN-FOR-001 Digital Forensics | Partial | Forensics Hub (27 files -- evidence, disk, memory); missing log-timeline and network forensics |
| IN-FOR-002 Cyber Crime Investigator | Not Covered | No law enforcement investigation methodology |
| IN-INV-001 Cyber Defense Forensics Analyst | Partial | Forensics Hub + Eye correlation/investigation labs |

### NICE Framework Coverage Summary

| Category | Roles Covered | Roles Partial | Roles Absent |
|----------|--------------|---------------|-------------|
| Securely Provision (8) | 1 | 4 | 3 |
| Operate and Maintain (5) | 2 | 3 | 0 |
| Oversee and Govern (5) | 0 | 0 | 5 |
| Protect and Defend (4) | 1 | 3 | 0 |
| Analyze (5) | 0 | 2 | 3 |
| Collect and Operate (3) | 0 | 1 | 2 |
| Investigate (3) | 0 | 2 | 1 |
| **Total (33 evaluated)** | **4** | **15** | **14** |

**Key Gaps:** The entire Oversee and Govern (OV) category is absent. This is a strategic gap -- governance, policy, risk management, and executive leadership content would significantly broaden the platform's workforce alignment.

---

## NIST CSF 2.0

The NIST Cybersecurity Framework 2.0 organizes around 6 functions. Coverage mapped below.

### Govern (GV) -- NEW in CSF 2.0

| Category | Coverage | Source |
|----------|----------|--------|
| GV.OC Organizational Context | Not Covered | No organizational risk context, mission alignment content |
| GV.RM Risk Management Strategy | Weak | Shield risk applets (7); no risk strategy, appetite, tolerance module |
| GV.RR Roles, Responsibilities, and Authorities | Not Covered | No security roles/responsibilities module |
| GV.PO Policy | Not Covered | No security policy development module |
| GV.OV Oversight | Not Covered | No governance oversight/board reporting module |
| GV.SC Supply Chain Risk Management | Not Covered | No supply chain / third-party risk content |

**Gap (Critical):** The entire Govern function is effectively uncovered. This is the newest CSF 2.0 function and represents the same governance gap identified in Security+ Domain 5 and NICE OV category.

### Identify (ID)

| Category | Coverage | Source |
|----------|----------|--------|
| ID.AM Asset Management | Weak | No dedicated asset inventory, CMDB, or asset lifecycle module |
| ID.RA Risk Assessment | Weak | Shield risk applets (7); no risk assessment methodology module |
| ID.IM Improvement | Not Covered | No continuous improvement / maturity model content |

**Gaps:** Asset management and risk assessment methodology modules needed.

### Protect (PR)

| Category | Coverage | Source |
|----------|----------|--------|
| PR.AA Identity Management, Authentication, and Access Control | Partial | Shield access applets (4), Cloud IAM tools (15), API auth track |
| PR.AT Awareness and Training | Partial | Shield Security 101 (9), presentations; no security awareness program design module |
| PR.DS Data Security | Weak | Key House covers crypto; no data classification, DLP, or data governance module |
| PR.PS Platform Security | Strong | Forge (281 -- OS hardening), Script (505 -- Linux admin), Shield (hardening labs) |
| PR.IR Technology Infrastructure Resilience | Partial | Cloud HA, Web redundancy concepts; no dedicated resilience engineering module |

### Detect (DE)

| Category | Coverage | Source |
|----------|----------|--------|
| DE.CM Continuous Monitoring | Strong | Eye House (190 -- SIEM, SOC, log analysis, CyberOps), Shield tools |
| DE.AE Adverse Event Analysis | Strong | Eye CySA+ track (50), correlation labs, alert triage game |

**Status:** Detect function is the platform's strongest CSF alignment.

### Respond (RS)

| Category | Coverage | Source |
|----------|----------|--------|
| RS.MA Incident Management | Partial | Operator IR missions (3), Shield IR tools; needs structured lifecycle |
| RS.AN Incident Analysis | Strong | Eye labs (incident timeline, log detective, correlation), Forensics Hub |
| RS.CO Incident Response Reporting and Communication | Not Covered | No IR reporting or stakeholder communication module |
| RS.MI Incident Mitigation | Partial | Shield labs, Dark Arts containment concepts; scattered |

### Recover (RC)

| Category | Coverage | Source |
|----------|----------|--------|
| RC.RP Incident Recovery Plan Execution | Not Covered | No recovery planning or execution module |
| RC.CO Recovery Communication | Not Covered | No recovery communication module |

**Gap (Critical):** The Recover function is entirely absent. BCP/DR content, recovery planning, and post-incident recovery need dedicated modules.

### CSF 2.0 Coverage Summary

| Function | Coverage Rating |
|----------|----------------|
| **Govern** | Not Covered (0/6 categories) |
| **Identify** | Weak (0/3 strong) |
| **Protect** | Partial (1/5 strong) |
| **Detect** | Strong (2/2 strong) |
| **Respond** | Partial (1/4 strong) |
| **Recover** | Not Covered (0/2 categories) |

---

## Thin Hubs and Underdeveloped Tracks

### Critically Thin (fewer than 10 files)

| Hub | Files | Status | Recommendation |
|-----|-------|--------|----------------|
| Matrix House | 1 | Index only | Needs 30+ modules: data wrangling, SQL analytics, visualization, Python pandas/numpy, statistical analysis. Currently relies entirely on 10 Projects hub entries. |
| Oasis | 2 | Minimal | Clarify purpose or fold into existing hub |
| Hive | 5 | Prototype | 4 multiplayer components orphaned. Either build out or archive to Workshop. |
| Workshop | 7 | Archive shelf | Functioning as intended (recalled content) |
| Dispatch | 6 | Early | Needs 15-20 more troubleshooting boxes to cover common helpdesk scenarios (email, VPN, permissions, Group Policy, drive mapping, mobile device) |

### Thin (10-30 files)

| Hub | Files | Status | Recommendation |
|-----|-------|--------|----------------|
| Arctic | 17 | Index-only curated paths | Functioning as navigation layer; no content gap but could add 4-6 more districts |
| Components | 18 | Infrastructure | Not content -- no action needed |
| Root pages | 20 | Platform pages | No gap |
| Cert track indexes | 15 | Aggregation pages | Need per-objective drill-down pages, not just index landing pages |
| Operator | 25 | Growing | Needs 10-15 more missions: cloud (AWS CLI), Windows Server, Active Directory, SIEM queries, container security |
| Arena CTF | 23 | Growing | Solid foundation. Scale to 30-40 boxes. Add B-series (blue team defense boxes). |
| Forensics | 27 | Foundation | Missing 2 planned sections (log-timeline, network-forensics confirmed by ghost links). Needs ~20 more modules. |

### Underdeveloped Tracks (exist but need depth)

| Track | Current | Gap |
|-------|---------|-----|
| Key House | 51 files | Small but complete. Could add PKI/CA administration labs (3-5 modules). |
| Dark Arts House (house-level) | 47 files | FEH intro track is complete. No gap relative to scope. |
| Signal Hub | 61 files | 32 guide pages are orphaned (no nav links). Fix navigation before adding content. |
| Forensics Hub | 27 files | Ghost links confirm planned log-timeline (df-41+) and disk-forensics capstone (df-20) sections were started but files are missing. |

---

## Recommendations Summary

### Priority 1 -- Critical Framework Gaps (new module series needed)

| Gap | Framework Source | Recommended Action | Estimated Modules |
|-----|-----------------|-------------------|-------------------|
| Governance, Risk, Compliance (GRC) | Sec+ D5, CSF GV, NICE OV | New Shield module series: policies, risk management, compliance frameworks, vendor risk, privacy | 12-15 |
| Incident Response Lifecycle | Sec+ D4.4, CySA+ D3, CSF RS | Structured IR lifecycle in Shield: NIST 800-61, communication, reporting | 6-8 |
| Business Continuity / Disaster Recovery | Sec+ D3.4, CSF RC | New Shield BCP/DR module series | 4-6 |
| Reporting and Communication | CySA+ D4 | New Eye module series: vuln reports, IR reports, executive communication | 4-6 |
| Vulnerability Management Lifecycle | Sec+ D4.3, CySA+ D2 | New Eye/Shield module series: scanning, prioritization, remediation, patch management | 4-6 |
| Security Architecture Models | Sec+ D3.1, CSF PR | Shield deep-dive modules: zero trust architecture, defense-in-depth, secure design principles | 4-5 |

### Priority 2 -- Structural Gaps

| Gap | Recommended Action |
|-----|-------------------|
| Matrix House is empty | Build 30+ data science/analytics modules or officially retire as a house |
| Forensics missing sections | Build log-timeline and network-forensics sections (ghost links confirm intent) |
| Signal navigation broken | 32 of 61 Signal pages are orphaned -- fix section index pages |
| Dispatch needs expansion | Add 15-20 helpdesk scenario boxes |
| Operator needs cloud/Windows missions | Add AWS CLI, Windows Server, AD, SIEM mission categories |

### Priority 3 -- Enhancement Opportunities

| Gap | Recommended Action |
|-----|-------------------|
| MITRE ATT&CK Navigator module | Add to Eye or Shield -- interactive framework mapping |
| Network documentation practices | Add to Web House -- diagrams, rack docs, cable management |
| Secure SDLC | Add to Code DevOps -- security in CI/CD pipelines |
| Physical layer networking | Add cabling/connector module to Web House |
| VPN deep-dive | Add IPSec/SSL VPN modules to Web or Shield |

### Total New Content Estimate

| Priority | Modules Needed | Target Hub |
|----------|---------------|------------|
| P1 Critical | 34-46 modules | Shield (20-30), Eye (8-12), Code (2-4) |
| P2 Structural | 50-70 modules | Matrix (30+), Forensics (20), Dispatch (15-20 boxes), Operator (10-15 missions) |
| P3 Enhancement | 10-15 modules | Web (4-5), Eye (2-3), Code (2-3), Shield (2-3) |

---

## Orphan Reconciliation Plan

> 1,255 files (38.8% of all 3,231 files) exist on disk but have no inbound link from any other HTML file.

### Orphan Distribution by House

| House/Hub | Orphans | Total Files | Orphan Rate | Priority |
|-----------|---------|-------------|-------------|----------|
| Script | 225 | 505 | 44.6% | HIGH |
| Dark Arts Hub | 200 | 228 | 87.7% | HIGH |
| Code | 180 | 550 | 32.7% | HIGH |
| Shield | 140 | 263 | 53.2% | HIGH |
| Web | 90 | 300 | 30.0% | MEDIUM |
| Projects | 88 | 89 | 98.9% | HIGH |
| Forge | 60 | 281 | 21.4% | MEDIUM |
| Cloud | 45 | 306 | 14.7% | LOW |
| Dark Arts (house) | 40 | 47 | 85.1% | MEDIUM |
| Key | 39 | 51 | 76.5% | HIGH |
| AI | 33 | 190 | 17.4% | LOW |
| Signal Hub | 32 | 61 | 52.5% | HIGH |
| Eye | 31 | 190 | 16.3% | LOW |
| Operator | 24 | 25 | 96.0% | HIGH |
| Components | 12 | 18 | 66.7% | LOW |
| Root | 9 | 20 | 45.0% | LOW |
| Workshop | 5 | 7 | 71.4% | LOW |
| Templates | 1 | 1 | 100% | LOW |
| Tools | 1 | 1 | 100% | LOW |

### House-by-House Analysis

---

#### Script House -- 225 orphans (HIGH)

**Breakdown:**
- 67 applets (CLH applets in `applets/linux/` -- full CLH companion applet set)
- 74 labs (49 in `labs/linux/`, 25 in `courses/clh/`)
- 30 modules (CLH companion modules in `courses/clh/`)
- 43 pages (games, tools, reviews, misc)
- 7 tools, 4 presentations

**Pattern:** The CLH (Command Line Hero) track has a parallel applet set (`script-clh-001` through `script-clh-031`) in `applets/linux/` that mirrors the CLH course but is not linked from the CLH index or unit pages. The `labs/linux/` directory contains 49 standalone Linux labs with no parent navigation. The `courses/clh/` companion modules (49 files) are not linked from the main CLH track.

**Recommended Hub Assignment:**
- CLH applets (67) --> Link from corresponding CLH unit pages in `clh/`
- Labs in `labs/linux/` (49) --> Link from Linux Mastery section index or create a Linux Labs landing page
- CLH companion modules (49) --> Link from CLH unit pages as supplementary material
- Games/tools/reviews (14) --> Link from Script House index page activity sections

**Fix Approach:** Index page updates only. All content is current and well-structured. The orphan status is a navigation gap, not a content quality issue.

---

#### Dark Arts Hub -- 200 orphans (HIGH)

**Breakdown:**
- 139 pages (gates, vault standalone labs, bug hunting labs/modules, EHE modules/labs)
- 43 labs (offensive labs in `vault/labs/linux/`, EHE labs, bug hunting labs)
- 17 modules (malware analysis, EHE, bug hunting)
- 1 presentation

**Pattern:** The Vault's gate system intentionally hides content behind progression gates, but the gate pages themselves (gate-2 through gate-13) are not linked from any discoverable navigation. The Bug Hunting Academy (55 files), EHE track (45 files), and WiFi Arsenal (27 files) have internal navigation but no external entry point beyond the Vault index. Standalone attack labs (SQLi, XSS, CSRF, etc.) in the vault root are not linked from any index.

**Recommended Hub Assignment:**
- Gate pages (8 in `vault/gates/`) --> Link from gate progression chain (gate-1 links gate-2, etc.)
- Bug Hunting (53 orphans) --> Link from Dark Arts Hub index under "Academy" section
- EHE (43 orphans) --> Link from Dark Arts Hub index under "Tracks" section
- WiFi Arsenal (26 orphans) --> Link from Dark Arts Hub index under "Arsenal" section
- Vault standalone labs (20+) --> Create a "Lab Directory" page in vault
- Linux offensive labs (23) --> Link from vault lab directory
- Malware modules (8) --> Link from vault modules index
- Offensive tools (6) --> Link from vault tools index

**Fix Approach:** The Dark Arts Hub index page needs a comprehensive navigation overhaul. Most content is high-quality offensive security material that students cannot reach.

---

#### Code House -- 180 orphans (HIGH)

**Breakdown:**
- 118 pages (99 DevOps section modules, Python Hub/Engineering pages)
- 34 modules (Python Hub, Python Engineering)
- 17 presentations (DevOps, general)
- 4 applets, 4 labs, 3 tools

**Pattern:** The DevOps track (`devops/sections/`) has 99 orphaned pages across its section directories (ansible, ci-cd, containers, iac, monitoring, platform-engineering, security, site-reliability). The DevOps index exists but does not link to individual section modules. Python Hub (47 files) and Python Engineering (13 files) modules in `modules/` are not linked from the Code House index.

**Recommended Hub Assignment:**
- DevOps section modules (99) --> DevOps section index pages need module listings
- Python Hub (47) --> Link from Code House index under "Python" track
- Python Engineering (13) --> Link from Code House index under "Python Engineering" track
- Games (9) --> Link from Code House index activity section
- Presentations (7) --> Link from relevant section pages
- Tools (3) --> Link from Code House tools section

**Fix Approach:** DevOps section index pages need to be populated with links to their child modules. Python Hub/Engineering needs a navigation entry point from Code House index.

---

#### Shield House -- 140 orphans (HIGH)

**Breakdown:**
- 94 applets (CMMC domain applets in `applets/compliance/cmmc_*`, threat applets, crypto applets, fundamentals, network, risk, operations, access)
- 24 labs (Linux security labs, general labs)
- 9 pages (games, misc)
- 8 tools, 5 presentations

**Pattern:** The CMMC compliance applets are organized in subdirectories (`cmmc_audit_accountability/`, `cmmc_awareness_training/`, etc.) but are not linked from any Shield index or compliance section page. Many threat/crypto/fundamentals applets are orphaned because the Shield applet directory pages only link to a subset. Games (16 total, all orphaned) have no navigation entry point.

**Recommended Hub Assignment:**
- CMMC applets (14+ domains) --> Link from Shield compliance section or create CMMC landing page
- Remaining orphaned applets (80) --> Audit Shield applet index pages to ensure all applets are listed
- Linux security labs (15) --> Link from Shield labs section
- General labs (9) --> Link from Shield labs section
- Games (16 orphans) --> Link from Shield House index activity section
- Tools (8) --> Link from Shield tools section

**Fix Approach:** Shield House index and section pages need comprehensive link audits. The applet catalog is the biggest gap.

---

#### Projects Hub -- 88 orphans (HIGH)

**Breakdown:**
- 88 project pages (every single project except the index)

**Pattern:** The Projects Hub index page exists but does not link to any of its 88 project pages. This is a complete navigation failure -- the entire Projects hub is unreachable.

**Recommended Hub Assignment:**
- All 88 projects --> Link from Projects Hub index page, organized by domain tag (AI, Cloud, Code, etc.)

**Fix Approach:** Rebuild the Projects index page with a categorized listing of all 88 projects. Single fix, high impact.

---

#### Web House -- 90 orphans (MEDIUM)

**Breakdown:**
- 30 presentations (all orphaned -- DNS, DHCP, OSPF, VLANs, wireless, subnetting, etc.)
- 25 applets (IP addressing applets, services applets)
- 15 pages (games, exams, misc)
- 12 tools, 8 labs

**Pattern:** Web House presentations are not linked from any index or module page. IP addressing applets in subdirectories are not linked. Games are orphaned. Tools are partially orphaned.

**Recommended Hub Assignment:**
- Presentations (30) --> Link from Web House index or topic-specific section pages
- IP addressing applets (18) --> Link from Web House applets section or Network Essentials modules
- Games (10) --> Link from Web House index activity section
- Tools (12) --> Link from Web House tools section
- Labs (8) --> Link from Web House labs section

**Fix Approach:** Web House index page needs sections for presentations, applets, and activities. Moderate effort.

---

#### Key House -- 39 orphans (HIGH by rate: 76.5%)

**Breakdown:**
- 12 labs, 11 presentations, 9 pages, 4 tools, 2 applets, 1 module

**Pattern:** Key House has 51 total files but 39 are orphaned. Only the index and a handful of linked items are reachable. Labs, presentations, games, and tools have no navigation links.

**Recommended Hub Assignment:**
- All content --> Link from Key House index page (labs, presentations, games, tools sections)

**Fix Approach:** Key House index needs a complete navigation rebuild. Small house, straightforward fix.

---

#### Signal Hub -- 32 orphans (HIGH by rate: 52.5%)

**Breakdown:**
- 32 pages (5 per section across all 6 sections + 2 field-prep)

**Pattern:** Signal section pages (sg-01 through sg-32) exist but section index pages only link to the section landing, not to individual guide pages within each section. All 6 sections have the same problem.

**Recommended Hub Assignment:**
- All section pages --> Link from their respective section index pages (foundations, firmware-ops, network-recon, security-tools, privacy-builds, arcade-ops, field-prep)

**Fix Approach:** Update 7 section index pages to include links to their child pages. Small, systematic fix.

---

#### Operator Hub -- 24 orphans (HIGH by rate: 96.0%)

**Breakdown:**
- 24 missions (every mission is orphaned)

**Pattern:** The Operator index page exists but does not link to any of its 24 missions. Same pattern as Projects -- complete navigation failure.

**Recommended Hub Assignment:**
- All 24 missions --> Link from Operator index page, organized by category (Python, Forensics, IR, Linux, Recon, Crypto, Firewall, Log Analysis, Windows CMD)

**Fix Approach:** Rebuild Operator index with categorized mission listings. Single fix, high impact.

---

#### Forge House -- 60 orphans (MEDIUM)

**Breakdown:**
- 25 applets (A+ Core 1/2 applets in subdirectories)
- 14 pages (quizzes, misc)
- 13 labs (A+ Core 1 labs, general labs)
- 5 presentations, 3 tools

**Pattern:** A+ applet subdirectories contain labs and quizzes that are not linked from applet index pages. Some Forge labs and presentations lack navigation links.

**Recommended Hub Assignment:**
- A+ labs/quizzes (25) --> Link from A+ applet section indexes
- General labs (13) --> Link from Forge labs section
- Presentations (5) --> Link from Forge section pages

**Fix Approach:** A+ applet index pages need lab/quiz links. Moderate effort.

---

#### Remaining Houses (LOW priority)

| House | Orphans | Pattern | Action |
|-------|---------|---------|--------|
| Cloud (45) | API presentations, games, tools | Link from Cloud index sections | Low -- 14.7% rate |
| Dark Arts house (40) | Games, presentations, labs, FEH content | Link from DA house index | Medium -- house index rebuild |
| AI (33) | Games, labs, tools, presentations | Link from AI index activity sections | Low -- 17.4% rate |
| Eye (31) | Games, labs, applets, tools | Link from Eye index sections | Low -- 16.3% rate |
| Components (12) | Analytics, Hive, mascot, tourist flow | Infrastructure pages; link from admin console or deprecate | Low |
| Root (9) | bot-knowledge, funding, career, wall-of-shame | Misc platform pages; link from appropriate nav or footer | Low |
| Workshop (5) | Recalled content | Intentionally orphaned (archive shelf) | None |

### Orphan Reconciliation Priority Matrix

| Priority | Houses | Total Orphans | Fix Type |
|----------|--------|---------------|----------|
| **P0 -- Critical** | Projects (88), Operator (24) | 112 | Index pages link to zero content. Rebuild indexes. |
| **P1 -- High** | Dark Arts Hub (200), Code (180), Script (225) | 605 | Major navigation gaps. Section indexes need population. |
| **P2 -- High** | Shield (140), Key (39), Signal (32) | 211 | Applet catalogs and section pages need link audits. |
| **P3 -- Medium** | Web (90), Forge (60), Dark Arts house (40) | 190 | Index page enhancements. |
| **P4 -- Low** | Cloud (45), AI (33), Eye (31), Components (12), Root (9), Workshop (5), Templates (1), Tools (1) | 137 | Minor link additions. |
| **Total** | | **1,255** | |

### Common Patterns Across All Houses

1. **Index pages that do not link to their children** -- Projects (88/88 orphaned), Operator (24/24 orphaned), DevOps sections (99 orphaned). This is the single largest category of orphans.

2. **Applets in subdirectories not linked from parent index** -- Shield CMMC applets, Web IP addressing applets, Forge A+ applets. Subdirectory organization creates navigation blind spots.

3. **Games universally orphaned** -- Nearly every house has orphaned games. No house index includes a "Games" or "Activities" section with links.

4. **Parallel content tracks not cross-linked** -- Script CLH applets mirror CLH units but are not linked. Code Python Hub/Engineering modules exist but are not linked from Code index.

5. **Gated content with no entry chain** -- Dark Arts gate-2 through gate-13 are orphaned because gate-1 does not link forward (or gate links are dynamic/JS-rendered and not detected by static HTML audit).

---

*Gap Analysis version: 1.0 | Source: CONTENT_AUDIT.json (3,231 files), CONTENT_ORPHANS.json (1,255 orphans), CONTENT_GHOSTS.json (467 ghosts), HUB_REGISTRY.md, CONTENT_MAP.md*
