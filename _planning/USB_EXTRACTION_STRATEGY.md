# USB Content Extraction Strategy

**Created:** December 26, 2025
**Updated:** December 26, 2025
**Goal:** Extract ALL USB content into Hexworth Prime
**Approach:** Ordered by difficulty (easiest → hardest)

---

## 📊 CONTENT AUDIT (Dec 26, 2025)

After deploying CLH Sprint 4, conducted full platform audit:

| House | Existing Modules | USB Overlap | Action |
|-------|------------------|-------------|--------|
| Script | CLH 001-015 ✅ + Python/Linux | High | **COMPLETE** |
| Shield | 100+ modules | Very High | Skip 1B - already covered |
| Dark Arts | 20+ attack labs | Medium | Some gaps to fill |
| Code | 25+ DevOps items | High | Only gaps: API, Ansible |

### Key Findings:
- ✅ Phase 1A: CLH-001 to CLH-015 **COMPLETE** (v2.17.0 → v2.20.0)
- ✅ Phase 1B: Shield Security Fundamentals **ALREADY COVERED**
- 🔄 Phase 2A: Most DevOps covered - gaps: Data Format Converter, API Explorer, Ansible
- 🔄 Phase 2B: Dark Arts has XSS/SQLi - missing: CSRF, SSRF, IDOR, JWT

---

## Phase Overview

| Phase | Difficulty | Content | Est. Sprints | Dependencies | Status |
|-------|------------|---------|--------------|--------------|--------|
| 1 | 🟢 Easy | CLH completion + Shield basics | 3-4 | LinuxTerminal.js ✓ | ✅ DONE |
| 2 | 🟡 Medium | Code DevOps + Dark Arts theory | 3-4 | Quiz system ✓ | 🔄 Partial |
| 3 | 🟠 Moderate | Shield GRC + Risk Management | 4-5 | New visualizers | ⏳ Pending |
| 4 | 🔴 Complex | Forensics + Attack simulations | 5-6 | New engines | ⏳ Pending |

---

## Phase 1: Low-Hanging Fruit 🟢 ✅ COMPLETE

### 1A: Complete CLH Series (CLH-009 to CLH-015) ✅ DEPLOYED
**Status:** Complete - v2.17.0 "Hunter" → v2.18.0 "Operator" → v2.19.0 "Analyst" → v2.20.0 "Engineer"

| Lab | Topic | Status | Version |
|-----|-------|--------|---------|
| CLH-009 | Text Processing | ✅ | v2.19.0 |
| CLH-010 | I/O Redirection | ✅ | v2.19.0 |
| CLH-011 | Advanced Grep/Regex | ✅ | v2.19.0 |
| CLH-012 | Network Basics | ✅ | v2.20.0 |
| CLH-013 | Environment Variables | ✅ | v2.20.0 |
| CLH-014 | Process Control | ✅ | v2.20.0 |
| CLH-015 | Capstone Mission | ✅ | v2.20.0 |

**Rank progression:** CLI Recruit → CLI Analyst → CLI Specialist → CLI Engineer

---

### 1B: Shield Security Fundamentals (21 files) ✅ SKIPPED - ALREADY COVERED
**Status:** Content audit revealed Shield House has 100+ modules covering all USB fundamentals topics

**Already exists in Shield House:**
- CIA Triad: `presentations/cia-triad.html`
- Encryption/Cryptography: 14+ crypto modules
- Network Security: Firewalls, VPN, IDS/IPS, wireless
- Access Control: Kerberos, biometrics, authentication
- Threats: XSS, SQLi, social engineering, malware
- Risk Management: CMMC compliance modules

**Original plan (21 files) - NO LONGER NEEDED:**

| Section | Files | Status |
|---------|-------|--------|
| Security Concepts | 7 | ✅ Already covered |
| Access Control & Crypto | 7 | ✅ Already covered |
| Network Security | 4 | Visualizer + Quiz |
| Protection | 3 | Checklist applet |

**Deliverables:**
- 4 presentations (reuse existing slide engine)
- 4 quizzes (reuse quiz system)
- 2-3 interactive applets (threat classifier, encryption demo)

**Est. effort:** 1-2 sprints

---

### 1C: CLH Bonus Materials
**Why easy:** Supporting content, no new engines needed

| Material | Output |
|----------|--------|
| Kali Linux Cheat Sheet.pdf | Reference page in Script House |
| Shell Script Creation Checklist.pdf | Interactive checklist applet |
| 10 Command Line Tips.pdf | Tips carousel/slideshow |

**Est. effort:** 0.5 sprint

---

## Phase 2: Structured Content 🟡

### 2A: Code DevOps Automation (50 files)
**Why medium:** Need some new visualizers but concepts are teachable

| Module | Topics | Output Type |
|--------|--------|-------------|
| Software Dev | JSON/XML/YAML, Git | Data format converter applet |
| APIs | HTTP, webhooks | API explorer/tester |
| Infrastructure | CI/CD, Docker | Pipeline builder (exists!) |
| IaC | Ansible, automation | Playbook visualizer |
| Networking | IPv4, subnetting | Subnet calculator (exists!) |

**New applets needed:**
1. Data Format Converter (JSON ↔ XML ↔ YAML)
2. API Request Builder
3. Ansible Playbook Visualizer

**Est. effort:** 2-3 sprints

---

### 2B: Dark Arts - Web Fundamentals (12 files)
**Why medium:** Theory before attacks, builds foundation

| Section | Files | Output |
|---------|-------|--------|
| URLs & HTTP | 3 | HTTP method visualizer |
| Web Infrastructure | 3 | Architecture diagram applet |
| APIs & CMS | 3 | CMS vulnerability scanner concept |
| Databases | 3 | SQL structure visualizer |

**Est. effort:** 1-2 sprints

---

### 2C: Dark Arts - Tools Introduction (10 files)
**Why medium:** Tool overviews, not hands-on exploitation yet

| Tool | Content Type |
|------|--------------|
| Burp Suite | Feature tour + interface mockup |
| OWASP ZAP | Feature comparison with Burp |
| nikto | Command reference + output parser |
| feroxbuster | Directory fuzzing concept |
| sqlmap | Parameter explanation |
| wpscan | WordPress audit checklist |

**Deliverable:** "Hacker's Toolkit" reference section in Dark Arts

**Est. effort:** 1-2 sprints

---

## Phase 3: Advanced Concepts 🟠

### 3A: Shield Compliance & Governance (157 files)
**Why moderate:** Large volume, needs careful organization

| CISSP Domain | Files | Priority | Output |
|--------------|-------|----------|--------|
| Domain 2: Governance & Risk | ~25 | HIGH | Framework selector applet |
| Domain 3: Asset Security | ~15 | HIGH | Data classification tool |
| Domain 4: Security Architecture | ~30 | MEDIUM | Security models visualizer |
| Domain 5: Network Security | ~20 | LOW | (Covered in Web House) |
| Domain 6: IAM | ~25 | HIGH | Auth flow visualizer |
| Domain 7: Security Assessment | ~15 | MEDIUM | Vuln assessment checklist |
| Domain 8: Security Operations | ~15 | MEDIUM | IR flowchart |
| Domain 9: Software Security | ~12 | MEDIUM | SDLC security mapper |

**New applets needed:**
1. Framework Selector (NIST, ISO, COBIT comparison)
2. Security Models Visualizer (Bell-LaPadula, Biba, Clark-Wilson)
3. Authentication Flow Builder (OAuth, SAML, Kerberos)
4. Risk Register Tool

**Est. effort:** 3-4 sprints

---

### 3B: Shield Risk Management (66 files)
**Why moderate:** Specialized CRISC content, needs calculators

| Domain | Topics | Output |
|--------|--------|--------|
| Risk Identification | Context, roles, culture | Org risk profile builder |
| Risk Assessment | Threat modeling, BIA | Risk calculator applet |
| Risk Response | Mitigation strategies | Control mapper |
| Risk Monitoring | KPIs, KRIs, KCIs | Dashboard mockup |

**New applets needed:**
1. Risk Calculator (ALE, SLE, ARO)
2. Three Lines of Defense Visualizer
3. KRI Dashboard Builder

**Est. effort:** 2 sprints

---

### 3C: Shield Security Architecture (72 files)
**Why moderate:** CASP+ level, advanced concepts

| Domain | Key Topics | Output |
|--------|------------|--------|
| Security Architecture | Zero trust, SDN | Zero Trust Maturity Model |
| Security Operations | IoC, threat intel | IoC Classifier |
| Security Engineering | Hardening, ICS/SCADA | Hardening checklist generator |
| GRC | Policies, vendor assessment | Policy template builder |

**Est. effort:** 2-3 sprints

---

## Phase 4: Complex Integrations 🔴

### 4A: Large Log Forensics
**Why complex:** Need efficient handling of large files

| File | Size | Challenge |
|------|------|-----------|
| Linux.log | 2.3 MB | Parse 25,000+ lines |
| Zookeeper.log | 10.4 MB | Enterprise-scale analysis |

**Technical approach:**
- Pre-process logs into searchable chunks
- Create "evidence highlights" for guided discovery
- Build log timeline visualizer
- Add grep/awk challenges with specific targets

**New features needed:**
1. Log chunking system in LinuxTerminal.js
2. Timeline visualization component
3. Evidence tagging system

**Est. effort:** 2 sprints

---

### 4B: Network Forensics (breach.pcap)
**Why complex:** Need pcap parsing or simulation

| Approach | Pros | Cons |
|----------|------|------|
| Pre-analyzed summary | Easy to implement | Less interactive |
| Simulated tcpdump output | Interactive | Limited realism |
| Client-side pcap parser | Full realism | Complex, large file |

**Recommended:** Hybrid approach
1. Create pre-extracted "evidence files" from pcap
2. Build tcpdump/tshark simulator with canned responses
3. Guide students through packet analysis workflow

**New features needed:**
1. Network packet visualizer
2. tcpdump command simulator
3. Timeline correlation tool

**Est. effort:** 2-3 sprints

---

### 4C: Dark Arts - Attack Labs (20 files)
**Why complex:** Need sandboxed environments

| Attack Type | Simulation Approach |
|-------------|---------------------|
| XSS (Reflected/Stored/DOM) | Vulnerable page simulator |
| SQL Injection | Mock database with query visualizer |
| CSRF | Form submission visualizer |
| Command Injection | Sandboxed shell with filter bypass |
| SSRF/IDOR | API endpoint simulator |

**New engines needed:**
1. Vulnerable Web App Simulator
2. SQL Query Visualizer with injection detection
3. Request/Response interceptor mockup

**Est. effort:** 3-4 sprints

---

### 4D: SQL Practice Lab
**Why complex:** Need SQL engine

| File | Content |
|------|---------|
| mysqlsampledatabase.sql | Full relational database schema |

**Approach options:**
1. Client-side SQL.js (WebAssembly SQLite)
2. Pre-computed query results
3. SQL query visualizer (show what query does)

**Recommended:** SQL.js integration for real query execution

**Est. effort:** 2 sprints

---

## Sprint Roadmap

### Immediate (Next 2 weeks)
| Sprint | Content | Deliverables |
|--------|---------|--------------|
| CLH-S3 | CLH-009 to CLH-011 | 3 labs (text processing, I/O, regex) |
| CLH-S4 | CLH-012 to CLH-015 | 4 labs (network, env, process, capstone) |

### Short-term (1 month)
| Sprint | Content | Deliverables |
|--------|---------|--------------|
| SHIELD-F1 | Security Fundamentals | 4 presentations, 4 quizzes |
| CODE-D1 | DevOps basics | Data converter, API explorer |
| DA-T1 | Dark Arts theory | Web fundamentals section |

### Medium-term (2 months)
| Sprint | Content | Deliverables |
|--------|---------|--------------|
| SHIELD-C1 | Compliance pt 1 | Domains 2-3 content |
| SHIELD-C2 | Compliance pt 2 | Domains 6-7 content |
| SHIELD-R1 | Risk Management | Risk calculator, KRI dashboard |

### Long-term (3+ months)
| Sprint | Content | Deliverables |
|--------|---------|--------------|
| FORENSIC-1 | Log analysis | Large log handling |
| FORENSIC-2 | Network forensics | breach.pcap lab |
| DA-A1 | Attack labs pt 1 | XSS, SQLi simulators |
| DA-A2 | Attack labs pt 2 | CSRF, command injection |
| SQL-1 | SQL practice | SQL.js integration |

---

## Success Metrics

| Phase | Completion Indicator |
|-------|---------------------|
| Phase 1 | CLH-001 to CLH-015 complete, Shield basics live |
| Phase 2 | Code House DevOps section, Dark Arts theory |
| Phase 3 | Full CISSP/CRISC content paths |
| Phase 4 | Interactive attack labs, forensics challenges |

---

## Dependencies Map

```
LinuxTerminal.js (DONE)
    └── CLH-009 to CLH-015
        └── Large log forensics
            └── breach.pcap analysis

Quiz System (DONE)
    └── Shield Fundamentals
        └── Shield Compliance
            └── Shield Architecture

Presentation System (DONE)
    └── All theory content

NEW: SQL.js Engine
    └── SQL practice lab
    └── SQLi attack simulation

NEW: Vulnerable App Simulator
    └── XSS labs
    └── CSRF labs
    └── Command injection labs
```

---

## Next Action

**Recommended start:** Phase 1A - Complete CLH Series (CLH-009 to CLH-011)
- Uses existing LinuxTerminal.js
- Practice files ready to embed
- Continues momentum from Sprint 2

---

*Strategy created: December 26, 2025*
