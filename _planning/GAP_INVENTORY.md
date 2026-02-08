# Hexworth Prime - Content Gap Inventory

**Created:** December 19, 2025
**Purpose:** Track missing content discovered during migration audit
**Status:** Active - Do NOT create new content until migration complete

---

> **AUDIT RULE:** Port existing content first. Only add to this inventory when content genuinely doesn't exist in the Academy catalog.

---

## How to Use This Document

1. **During Migration:** When porting a house, search Academy for each content type
2. **If Missing:** Add an entry to the appropriate house section below
3. **After Migration Complete:** Review this inventory, prioritize gaps, then create
4. **Mark Resolved:** When gap is filled, move entry to Resolved section at bottom

---

## Web House (Networking)

| Topic | Gap Type | Priority | Notes |
|-------|----------|----------|-------|
| OSI Model Quiz | Needs audit | Medium | Created new quiz - verify against Academy catalog for existing quiz |

---

## Shield House (Security)

| Topic | Gap Type | Priority | Notes |
|-------|----------|----------|-------|
| *(none identified yet)* | | | |

---

## Cloud House (Infrastructure)

| Topic | Gap Type | Priority | Notes |
|-------|----------|----------|-------|
| *(none identified yet)* | | | |

---

## Forge House (Hardware)

| Topic | Gap Type | Priority | Notes |
|-------|----------|----------|-------|
| *(none identified yet)* | | | |

---

## Script House (Automation)

| Topic | Gap Type | Priority | Notes |
|-------|----------|----------|-------|
| *(none identified yet)* | | | |

---

## Code House (Development)

| Topic | Gap Type | Priority | Notes |
|-------|----------|----------|-------|
| ~~Docker/Kubernetes~~ | ~~Full module~~ | ~~High~~ | ✅ Docker module created (Dec 20) |
| ~~Kubernetes~~ | ~~Full module~~ | ~~High~~ | ✅ Kubernetes module created (Dec 20) |
| ~~CI/CD Pipelines~~ | ~~Full module~~ | ~~High~~ | ✅ CI/CD module created (Dec 20) |
| ~~Terraform~~ | ~~Presentation + Lab~~ | ~~Medium~~ | ✅ Full module created (Dec 20) |
| ~~CloudFormation~~ | ~~Presentation + Lab~~ | ~~Medium~~ | ✅ Full module created (Dec 20) |
| ~~Agile/SDLC~~ | ~~Presentation~~ | ~~Medium~~ | ✅ Full module created (Dec 20) |
| ~~GitHub Actions~~ | ~~Tutorial + Lab~~ | ~~Medium~~ | ✅ Covered in CI/CD module (Dec 20) |
| Unit Testing | Presentation + Lab | Low | Test-driven development |

**Migrated (6 items):** VERSION_CONTROL_GUIDE.md, automation-presentation.html, automation-speaker-notes.md, automation-visualizer.html, cisco-devnet-guide.md, ConfigMgmt applet

---

## Key House (Cryptography)

**NOTE:** All cryptography content in Academy is branded "House of Shield". Key house is designed as a SPECIALTY EXPANSION for advanced cryptography beyond Security+ fundamentals. No Academy content to migrate - all content must be created new.

| Topic | Gap Type | Priority | Notes |
|-------|----------|----------|-------|
| ~~Advanced Symmetric Encryption~~ | ~~Full module~~ | ~~High~~ | ✅ Full module created (Dec 20) |
| ~~Elliptic Curve Cryptography~~ | ~~Full module~~ | ~~High~~ | ✅ Full module created (Dec 20) |
| ~~Key Derivation Functions~~ | ~~Full module~~ | ~~High~~ | ✅ Full module created (Dec 20) |
| ~~HMAC & Message Auth Codes~~ | ~~Full module~~ | ~~Medium~~ | ✅ Full module created (Dec 20) |
| ~~Cryptanalysis~~ | ~~Full module~~ | ~~Medium~~ | ✅ Full module created (Dec 20) |
| ~~Post-Quantum Cryptography~~ | ~~Full module~~ | ~~Medium~~ | ✅ Full module created (Dec 20) |
| ~~HSM & Key Management~~ | ~~Full module~~ | ~~Medium~~ | ✅ Full module created (Dec 20) |
| ~~Certificate Deep Dive~~ | ~~Full module~~ | ~~Low~~ | ✅ Full module created (Dec 20) |

**🎉 KEY HOUSE COMPLETE** - 8 modules, 32 files, ~40,000 lines of advanced cryptography content

**Foundation from Shield (can reference):** RSA.html, diffie_hellman.html, pki.html, gpg-encryption-lab.html, FactorPrime.html

---

## Eye House (Monitoring)

**NOTE:** All monitoring-related content in Academy was already categorized under its primary domain:
- IDS/IPS, Incident Response → Shield (security detection)
- Event Viewer, Performance Monitor → Forge (A+ Core 2)
- Log Management Visualizer → Script (sysadmin automation)

Eye house is designed as a SPECIALTY EXPANSION for CySA+ and SOC Analyst training. Existing Academy content referenced monitoring as supporting material; Eye house needs dedicated analysis-focused modules.

| Topic | Gap Type | Priority | Notes |
|-------|----------|----------|-------|
| SIEM Fundamentals | Full module | High | Splunk, ELK Stack, architecture, log aggregation |
| Log Correlation | Full module | High | Multi-source analysis, timeline reconstruction |
| Threat Hunting | Full module | High | Proactive threat detection, hypothesis-driven |
| Network Traffic Analysis | Full module | High | Wireshark deep dives, packet analysis, NetFlow |
| SOC Operations | Full module | High | Tier 1/2/3 workflows, escalation procedures |
| Alert Triage | Presentation + Lab | Medium | Priority matrices, false positive reduction |
| Timeline Analysis | Presentation + Lab | Medium | Incident investigation, chronological reconstruction |
| Forensics Basics | Presentation + Lab | Medium | Evidence collection, chain of custody, imaging |
| Dashboard & Reporting | Presentation + Lab | Medium | KPIs, metrics, executive reporting |
| Threat Intelligence | Full module | Medium | IOC feeds, MITRE ATT&CK, threat actor profiles |
| Detection Engineering | Presentation + Lab | Low | Writing detection rules, YARA, Sigma |

**Existing content (1 item):** log-basics.html (presentation - created during infrastructure setup)

**Foundation from other houses (can cross-reference):**
- Shield: IDS_IPS.html, incident-response-simulator.html
- Forge: admin-tools.html (Event Viewer, Performance Monitor)
- Script: log-management-visualizer.html

---

## Dark Arts (Offensive Security)

| Topic | Gap Type | Priority | Notes |
|-------|----------|----------|-------|
| *(built natively - audit separately)* | | | |

---

## Resolved Gaps

| Topic | House | Resolution | Date |
|-------|-------|------------|------|
| Docker Fundamentals | Code | Full module: presentation, playground applet, lab, quiz | Dec 20, 2025 |
| Kubernetes Fundamentals | Code | Full module: presentation, cluster-sim applet, lab, quiz | Dec 20, 2025 |
| CI/CD Pipelines | Code | Full module: presentation, pipeline-builder applet, lab, quiz | Dec 20, 2025 |
| Terraform IaC | Code | Full module: presentation, visualizer applet, lab, quiz | Dec 20, 2025 |
| CloudFormation IaC | Code | Full module: presentation, designer applet, lab, quiz | Dec 20, 2025 |
| Agile/SDLC | Code | Module: presentation, sprint-simulator applet, quiz | Dec 20, 2025 |
| Advanced Symmetric Encryption | Key | Full module: presentation, AES explorer, lab, quiz | Dec 20, 2025 |
| Elliptic Curve Cryptography | Key | Full module: presentation, ECC visualizer, lab, quiz | Dec 20, 2025 |
| Key Derivation Functions | Key | Full module: presentation, KDF analyzer, lab, quiz | Dec 20, 2025 |
| HMAC & Message Auth Codes | Key | Full module: presentation, HMAC calculator, lab, quiz | Dec 20, 2025 |
| Cryptanalysis | Key | Full module: presentation, attack tools, lab, quiz | Dec 20, 2025 |
| Post-Quantum Cryptography | Key | Full module: presentation, PQC explorer, lab, quiz | Dec 20, 2025 |
| HSM & Key Management | Key | Full module: presentation, lifecycle tool, lab, quiz | Dec 20, 2025 |
| Certificate Deep Dive | Key | Full module: presentation, cert inspector, lab, quiz | Dec 20, 2025 |

---

## Gap Type Definitions

- **Quiz** - Assessment/quiz missing for topic
- **Applet** - Interactive tool/visualizer missing
- **Presentation** - Slide deck/teaching material missing
- **Lab** - Hands-on exercise missing
- **Tutorial** - Step-by-step guide missing
- **Needs audit** - Content exists but needs review against catalog

## Priority Definitions

- **High** - Core certification content, blocks learning path
- **Medium** - Important but not blocking
- **Low** - Nice to have, enhance experience

---

*This document is part of the migration audit. Update as gaps are discovered.*
