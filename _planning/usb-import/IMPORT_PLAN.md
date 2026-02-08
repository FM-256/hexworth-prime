# USB Content Import Plan for Hexworth Prime
## Source: Movespped USB (D:)
## Date: December 23, 2025 (Updated: December 24, 2025)

---

## Current Hexworth Prime Content Summary

| House | Files | Presentations | Status |
|-------|-------|---------------|--------|
| Shield | 102 | 2 | Needs more presentations |
| Web | 74 | 20+ | Well developed |
| Forge | 42 | 6 | Growing |
| Script | 27 | 3 | Needs content |
| Cloud | 30 | 4 | Moderate |
| Code | 28 | 8 | Good |
| Key | 34 | 9 | Good |
| Eye | 23 | 6 | Needs content |

---

## PRIORITY 1: Ready-to-Use HTML Applets

### Immediate Import (Already HTML, minimal conversion needed)

| USB File | Target House | Content Type | Action |
|----------|--------------|--------------|--------|
| `Aplets/Core 2 Quiz.html` | Forge | Quiz | Restyle to Hexworth theme |
| `Aplets/Networking Chapters 7-8-9-10.html` | Web | Quiz | Restyle to Hexworth theme |
| `Aplets/Networking Final Review.html` | Web | Quiz | Restyle to Hexworth theme |
| `Aplets/Networking chapter7-20.html` | Web | Quiz | Restyle to Hexworth theme |
| `core2_roleplay_lab.html` | Forge | Lab | Convert to interactive applet |
| `os_core.html` | Forge | Reference | Convert to presentation |
| `Dorking.html` | Shield | Training | Convert to lab |
| `Windows Shortcut.html` | Forge | Reference | Convert to quick-reference tool |
| `Updated CTF/ctf-leaderboard/` | Dark Arts | Leaderboard | Integrate with progression system |

---

## PRIORITY 2: CySA+ Content (Eye House)

**Source:** `D:\Training\Comptia\CySA\Slides\`

| Chapter | Topic | Target Module |
|---------|-------|---------------|
| Chapter 1 | Today's CyberSecurity Analyst | eye-cysa-intro |
| Chapter 2 | Using Threat Intelligence | eye-threat-intel |
| Chapter 3 | Recon and Intel Gathering | eye-osint |
| Chapter 4 | Vulnerability Management Program | eye-vuln-management |
| Chapter 5 | Vulnerability Scans | eye-vuln-scanning |
| Chapter 6 | Cloud Security | eye-cloud-security |
| Chapter 7-16 | Various SOC topics | Multiple modules |

**Action:** Create presentations + quizzes for each chapter

---

## PRIORITY 2.5: OpenStack Curriculum (Cloud House) ⭐ NEW

**Source:** `D:\cloud security\Open Metal\OpenStack based hands-on experimentation infrastructure\`

**Status:** Complete curriculum with slides, labs, homework + solutions

### Presentations (PPTX → Convert to Hexworth)
| Slide | Topic | Target Module |
|-------|-------|---------------|
| Slide3-1 | Introduction and Environment | cloud-openstack-intro |
| Slide3-2 | Understand OpenStack Projects | cloud-openstack-projects |
| Slide3-3 | OpenStack Installation | cloud-openstack-install |
| Slide3-4 | OpenStack Operation | cloud-openstack-ops |

### Labs (DOCX → Convert to Interactive Labs)
| Lab | Topic | Has Solutions |
|-----|-------|---------------|
| Lab-1 | Install OpenStack | ✅ Yes |
| Lab-2 | Launch Virtual Machine Instance | ✅ Yes |
| Lab-3 | Advanced OpenStack Operations | ✅ Yes |

### Homework/Quizzes (DOCX → Convert to Hexworth Quiz)
| Homework | Topic | Has Solutions |
|----------|-------|---------------|
| HW 3-1 | Introduction and Environment | ✅ Yes |
| HW 3-2 | Understand OpenStack Projects | ✅ Yes |
| HW 3-3 | OpenStack Installation | ✅ Yes |
| HW 3-4 | OpenStack Operation | ✅ Yes |

### Supporting Files
- `Module-3 OpenStack-description.docx` - Module overview
- `Module-3 OpenStack-Assessment library.docx` - Question bank
- `README.pdf` - Setup instructions

### Also Found (Reference Material)
- `D:\cloud security\Cloud Security Essentials (CSE) v1 - EC-Council.epub` (113MB)
  - Use for Cloud House security modules

**Action:** Convert full curriculum to Hexworth format (4 presentations, 3 labs, 4 quizzes)

**Why Priority 2.5:** Complete curriculum ready for conversion - higher value than raw reference material.

---

## PRIORITY 1.5: EC-Council CSE v1 Cloud Security (Cloud + Shield) ⭐⭐ NEW

**Source:** `D:\Keiser Idrive\random\CSE ppt slides.zip`
**Size:** 296MB (9 professional instructor slide decks)
**Status:** DISCOVERED - Needs extraction

### Complete EC-Council Cloud Security Essentials Curriculum

| Module | Topic | Size |
|--------|-------|------|
| Module 00 | Student Introduction | 10MB |
| Module 01 | Cloud Computing & Security Fundamentals | 34MB |
| Module 02 | Identity & Access Management in Cloud | 21MB |
| Module 03 | Data Protection & Encryption in Cloud | 27MB |
| Module 04 | Network Security in Cloud | 61MB |
| Module 05 | Application Security in Cloud | 26MB |
| Module 06 | Security Monitoring & Incident Response | 38MB |
| Module 07 | Risk Assessment & Management | 26MB |
| Module 08 | Compliance & Governance | 51MB |

**Cross-House Integration:**
- Cloud House: Modules 01-05 (infrastructure focus)
- Shield House: Modules 06-08 (security operations focus)
- Key House: Module 03 (encryption deep-dive)

**Why Priority 1.5:** Professional certification-level content (typically $500+). Combined with CSE epub (113MB), this is a complete cloud security certification path.

---

## PRIORITY 1.5: Complete Python Course (Code House) ⭐⭐ NEW

**Source:** `D:\Keiser Idrive\programming class\`
**Status:** DISCOVERED - Ready to catalog

### Course Structure

| Chapter | Topic | Content | Status |
|---------|-------|---------|--------|
| Chapter 1 | ? | ? | ⚠️ USER HAS - NEEDS LOCATING |
| Chapter 2 | Strings | Presentation | ✅ Found |
| Chapter 3 | Flow Control | Presentation (2.8MB) | ✅ Found |
| Chapter 4 | Functions | Presentation + Labs + Solutions | ✅ Found |
| Chapter 5 | GUI | Presentations + Labs + Solutions | ✅ Found |
| Chapter 6 | Dictionaries | Presentation + Labs + Solutions | ✅ Found |
| Chapter 7 | ? | ? | ⚠️ USER HAS - NEEDS LOCATING |
| Chapter 8 | OOP | Presentation | ✅ Found |

**NOTE:** User has Chapters 1 and 7 in another location - retrieve before starting Python Course conversion.

### Advanced Content (`Crack/` subfolder)
- "Cracking the Code" complete lab package (2MB PPTX + labs)
- 5 Powerful Python Functions
- itertools permutations/combinations
- exec() and partial() function breakdowns
- File dialogs (askopenfilename)

### Projects Included
- Code_Decode (encoding/decoding)
- Smart Vending Machine
- Number Guessing Game
- Bank Account GUI
- Pet Registry

### HTML Applets Found (`APP/` subfolder)
- `career explorator.html` - Career exploration tool
- `subnet.html` - Subnetting calculator
- `dns.html` - DNS tool
- `cve.html` - CVE viewer

**Why Priority 1.5:** Complete programming curriculum with projects, labs, and solutions.

---

## PRIORITY 2: MD-100 Windows 10 (Forge House) ⭐ NEW

**Source:** `D:\Keiser Idrive\pp\`
**Status:** DISCOVERED - 11 complete modules

Microsoft MD-100 certification curriculum:
- MD-100T00-ENU-PowerPoint_M01 through M11
- Complete Windows 10 installation, configuration, and management

**Why Priority 2:** Professional Microsoft certification content for Forge House.

---

## PRIORITY 1.5: Command Line Hacker Curriculum (Script House) ⭐⭐ FLAGSHIP

**Source:** `D:\Command Line Hacker Bundle.zip`
**Extracted To:** `extracted-guides/command-line-hacker/`
**Status:** EXTRACTED - Full curriculum with real practice files

### Why This Is Special

Unlike generic Linux tutorials, this is a **security-focused command line curriculum** with real investigation materials. This content will differentiate Hexworth Prime from other platforms.

| Feature | Generic Course | Command Line Hacker |
|---------|----------------|---------------------|
| Focus | IT Admin tasks | Security/Hacking mindset |
| Practice Files | Sample text | Real pcaps, logs, databases |
| Exercises | "Create a file" | "Find the hidden code" |
| Approach | Follow procedures | Investigate anomalies |

### Main Materials

| File | Size | Description |
|------|------|-------------|
| `Comand Line Hacker - ORIGINAL eBook (3).pdf` | 3.75MB | Complete 16-chapter textbook |
| 16 Chapter Exercise PDFs | ~4MB total | Structured exercises |
| `Kali Linux Command Line Cheat Sheet.pdf` | 757KB | Kali-specific reference |
| `Shell Script Creation Checklist.pdf` | 189KB | Script development guide |
| `Shell Script Creation Template.pdf` | 49KB | Reusable template |
| `10 Command Line Tips.pdf` | 207KB | Quick reference |

### UNIQUE Practice Files (The Differentiator)

| File | Size | Lab Potential |
|------|------|---------------|
| `breach.pcap` | 5.2MB | Real packet capture - network forensics |
| `mystery.txt` | 545B | Hidden "Secret Code: 42XDFL" - grep/regex hunting |
| `CPU_Process_Analysis.txt` | 813B | Suspicious process (8.2% CPU) - anomaly detection |
| `Linux.log` | 2.3MB | Real system logs - log forensics |
| `Zookeeper.log` | 10.4MB | Real application logs - investigation |
| `mysqlsampledatabase.sql` | 196KB | Real MySQL DB - database reconnaissance |
| Shell scripts, text files | Various | Hands-on practice |

### Proposed 15-Module Structure

```
Command Line Hacker Path (Script House)
├── CLH-001: Introduction to Hacker CLI
├── CLH-002: Navigation & Reconnaissance
├── CLH-003: Network Analysis (breach.pcap)
├── CLH-004: Pattern Hunting (mystery.txt - find the code!)
├── CLH-005: Process Investigation (find the anomaly!)
├── CLH-006: Permissions & Access Control
├── CLH-007: Shell Scripting - Basics
├── CLH-008: Shell Scripting - Advanced
├── CLH-009: System Administration
├── CLH-010: Log Forensics (Linux.log, Zookeeper.log)
├── CLH-011: Database Reconnaissance (MySQL)
├── CLH-012: Automation & Scheduling
├── CLH-013: Security Tools
├── CLH-014: Advanced Techniques
└── CLH-015: Capstone - Full Investigation
```

### Title Progression

| Progress | Title |
|----------|-------|
| CLH-001 to 003 | CLI Recruit |
| CLH-004 to 006 | CLI Analyst |
| CLH-007 to 009 | CLI Specialist |
| CLH-010 to 012 | CLI Engineer |
| CLH-013 to 015 | CLI Architect |
| All + Practice Files | **Command Line Hacker** |

### Cross-House Integration (Hybrid Model)

**Philosophy:** Script House teaches the *skills*, Dark Arts applies them to *investigations*.

| Module | House | Content |
|--------|-------|---------|
| CLH-001, 002, 003 | Script | Foundational CLI |
| **CLH-004, 005** | **Dark Arts** | Pattern Hunting + Anomaly Detection |
| CLH-006, 007, 008, 009 | Script | Permissions + Scripting |
| **CLH-010, 011** | **Dark Arts** | Log Forensics + DB Recon |
| CLH-012, 014 | Script | Automation + Advanced |
| **CLH-013, 015** | **Dark Arts** | Security Tools + Capstone |

**Unlock Flow:**
1. Script House modules (9 total) → "CLI Specialist"
2. Dark Arts modules unlock (6 total) → "Command Line Hacker"

**See:** `extracted-guides/command-line-hacker/CURRICULUM_GUIDE.md` for full details.

**Why Priority 1.5:** Complete curriculum + unique practice files = differentiating content that no other platform offers.

---

## PRIORITY 3: Linux Training (Script House)

**Sources:**
- `D:\Linux\` (Primary - 16-chapter curriculum)
- `D:\Training\Linux\` (Labs)
- `D:\Command line\` (CLI Intro)

---

### Entry Point Module
**Source:** `D:\Command line\IntrotoCommandLine.zip`

| File | Content | Target Module |
|------|---------|---------------|
| `LESSON_PLAN_Intro_to_command_line.docx` | Full lesson plan (434KB) | script-cli-intro |
| `README.pdf` | Overview | Reference |

**Purpose:** Intro module that unlocks the 16-chapter curriculum.

---

### Primary Curriculum: 16-Chapter Linux Exercises ⭐
**Source:** `D:\Linux\`

| Chapter | File | Target Module |
|---------|------|---------------|
| Ch 1 | `Exercises for Linux Chapter #1.pdf` | script-linux-ch01 |
| Ch 2 | `Exercises for LInux Chapter 2.pdf` | script-linux-ch02 |
| Ch 3 | `Exercises for LInux Chapter 3.pdf` | script-linux-ch03 |
| Ch 4 | `Exercises for LInux Chapter 4.pdf` | script-linux-ch04 |
| Ch 5 | `Exercises for LInux Chapter 5.pdf` | script-linux-ch05 |
| Ch 6 | `Exercises for LInux Chapter 6.pdf` | script-linux-ch06 |
| Ch 7 | `Exercises for LInux Chapter 7.pdf` | script-linux-ch07 |
| Ch 8 | `Exercises for Linux Chapter 8.pdf` | script-linux-ch08 |
| Ch 9 | `Exercises for Linux Chapter 9.pdf` | script-linux-ch09 |
| Ch 10 | `Exercises for Linux Chapter 10.pdf` | script-linux-ch10 |
| Ch 11 | `Exercises for Linux Chapter 11.pdf` | script-linux-ch11 |
| Ch 12 | `Exercises for Linux Chapter 12.pdf` | script-linux-ch12 |
| Ch 13 | `Exercises for Linux Chapter 13.pdf` | script-linux-ch13 |
| Ch 14 | `Exercises for Linux Chapter 14.pdf` | script-linux-ch14 |
| Ch 15 | `Exercises for Linux Chapter 15.pdf` | script-linux-ch15 |
| Ch 16 | `Exercises for Linux Chapter 16.pdf` | script-linux-ch16 |

**Action:** Convert each chapter to Hexworth quiz/lab format

---

### Reference Materials (Quick Reference Tools)
**Source:** `D:\Linux\` + `D:\unstructured PDF\`

| File | Source | Target |
|------|--------|--------|
| `Classic SysAdmin_ The Linux Filesystem Explained - Linux Foundation.pdf` | D:\Linux\ | script-linux-filesystem (presentation) |
| `Kali Linux Command Line Cheat Sheet.pdf` | D:\Linux\ | script-kali-reference (tool) |
| `Linux Commands cheat sheet.pdf` | D:\Linux\ | script-linux-reference (tool) |
| `10 Command Line Tips.pdf` | D:\unstructured PDF\ | script-cli-tips (tool) |

### Ebooks & Guides ⭐ NEW
**Source:** `D:\unstructured PDF\`

| File | Size | Target | Notes |
|------|------|--------|-------|
| `Comand Line Hacker - ORIGINAL eBook.pdf` | 3.7MB | script-cli-hacker OR dark-arts-cli | Full ebook on CLI hacking - crossover content |
| `Full Guide for Documenting...GitHub & LinkedIn.pdf` | 341KB | code-portfolio-guide | Professional skills - portfolio building |

---

### SSH Labs
**Source:** `D:\Linux\`

| File | Target Module |
|------|---------------|
| `Ssh Lab (Linux).pdf` | script-ssh-lab |
| `Ssh Lab LINUX (Bonus).pdf` | script-ssh-advanced |

---

### Additional Labs
**Source:** `D:\Training\Linux\`

| Lab | Topic | Type |
|-----|-------|------|
| Anonymity Lab (Parts 1-3) | Privacy/Tor | Lab series |
| GPG Encryption Lab | Encryption | Lab |
| Checksum Lab | File integrity | Lab |
| Compression Lab | Archives | Lab |
| TimeShift Worksheet | System backup | Lab |
| htop Worksheet | Process management | Lab |

---

### Slides (Need conversion to Hexworth style)
**Source:** `D:\Training\Linux\`
- `02.SeS_Unit0_AllAboutLinux_Presentation.pptx`

---

### Suggested Learning Path
```
script-cli-intro (Entry Point)
    ↓
script-linux-ch01 through ch08 (Fundamentals)
    ↓
script-linux-ch09 through ch12 (Administration)
    ↓
script-linux-ch13 through ch16 (Advanced)
    ↓
SSH Labs → Anonymity Labs → GPG Lab
    ↓
TimeShift → htop → Checksum → Compression
```

**Title Progression (Hacker Theme):**
- Ch 1-4 complete: "Linux Recruit"
- Ch 5-8 complete: "Linux Coder"
- Ch 9-12 complete: "Linux Specialist"
- Ch 13-16 complete: "Linux Engineer"
- All labs complete: "Linux Architect"

---

## PRIORITY 4: Ethical Hacking (Dark Arts)

**Source:** `D:\Training\Ethical Hacking\`

| Content | Type | Action |
|---------|------|--------|
| EHEv1 ppt slides (full course) | Presentations | Gate behind CTF completion |
| Firewall Browser and Ethical Hacking | Labs | Convert to hands-on modules |
| Hacking Zipped Files with Python | Lab | Script house crossover |
| Test Bank (Blackboard format) | Quizzes | Convert to Hexworth quiz format |

---

## PRIORITY 5: CCNA/Networking (Web House)

**Source:** `D:\Training\CCNA\`

| Content | Topic | Status in Hexworth |
|---------|-------|-------------------|
| 0.0.0.0 address explained.pdf | IP Addressing | NOT COVERED - Add |
| L2 & L3 Ether Channel config.pdf | EtherChannel | COVERED - Skip |
| cisco_wireless_*.pdf | Wireless | COVERED - Skip |
| IPv6 basics PDFs | IPv6 | COVERED - Skip |
| cider.pdf | CIDR | Partially covered |

**Action:** Focus on gaps only

---

## PRIORITY 6: Cyber Framework/Policy (Shield House)

**Source:** `D:\Cyber Framework\`

| Micromodule | Topic | New for Hexworth? |
|-------------|-------|-------------------|
| MM1 | Intro to Legal/Regulatory/Policy | YES - Create |
| MM2 | Government Agency Roles | YES - Create |
| MM3 | CFAA & Data Breach Notification | YES - Create |
| MM4 | Regulatory Frameworks (HIPAA, PCI-DSS) | YES - Create |
| MM5 | NIST Cybersecurity Framework | YES - Create |
| MM6 | Encryption Law & Policy | YES - Create |
| MM7 | Data Breach Litigation | YES - Create |
| MM8 | Law of War / Cyber Conflict | YES - Create |

**Action:** Create full "Compliance & Policy" module series for Shield house

---

## PRIORITY 7: A+ Core Content (Forge House)

**Source:** `D:\Training\Comptia\A+\`

| Content | Notes |
|---------|-------|
| CompTIA A+ Complete Study Guide PDF | Reference material |
| Professor Messer 220-1102 notes | Core 2 deep content |
| Comptia A+ 1 & 2 directories | Additional labs/content |

**Current Forge gaps to fill:**
- Hardware troubleshooting labs
- Mobile device content
- Printer troubleshooting
- Virtualization basics

---

## EXTRACTED CONTENT (Dec 24, 2025)

**398 MD files extracted from Packt `_Code.zip` files**

Location: `_planning/usb-import/extracted-guides/`

| Folder | Files | House Target |
|--------|-------|--------------|
| `shield-security-fundamentals/` | 21 | Shield |
| `shield-compliance-governance/` | 157 | Shield (CISSP-level) |
| `shield-risk-management/` | 66 | Shield (CRISC-level) |
| `shield-security-architecture/` | 72 | Shield (CASP+-level) |
| `dark-arts-web-pentesting/` | 32 | Dark Arts |
| `code-devops-automation/` | 50 | Code (DevASC) |

**See:** `extracted-guides/CONTENT_INDEX.md` for full catalog

---

## NOT IMPORTING (Already Covered or Low Value)

| Content | Reason |
|---------|--------|
| `zipped courses/*.zip` (video files) | Too large, video format not suitable |
| `Lesson Plans/` | Course admin, not student content |
| `Syllabi/` | Course admin |
| `OneDrive_*.zip` backups | Duplicate content |
| Most CCNA PDFs | Already covered in Web house |

---

## Implementation Phases

### Phase 1: Quick Wins (Today)
- [ ] Import and restyle `Aplets/*.html` quizzes
- [ ] Convert `Dorking.html` to Shield lab
- [ ] Import CTF leaderboard system

### Phase 2: CySA+ Series (Next Session)
- [ ] Create Eye house CySA+ presentation series
- [ ] Build quizzes for each chapter
- [ ] Add to Eye house learning path

### Phase 2.5: OpenStack Curriculum (Cloud House)
- [ ] Convert 4 PPTX slides to Hexworth presentations
- [ ] Convert 3 labs (with solutions) to interactive format
- [ ] Convert 4 homework sets to Hexworth quizzes
- [ ] Add to Cloud house learning path

### Phase 3: Linux/CLI Training (Following Session)
- [ ] Convert CLI intro lesson plan to entry module
- [ ] Convert Linux labs to Hexworth format
- [ ] Add to Script house
- [ ] Create progression path (CLI intro → basics → admin → advanced)

### Phase 4: Compliance Series (Shield)
- [ ] Create 8-module Cyber Framework series
- [ ] Add regulatory content to Shield
- [ ] Build compliance quiz bank

### Phase 5: Dark Arts Content
- [ ] Gate EHE content behind CTF
- [ ] Convert ethical hacking labs
- [ ] Add to Dark Arts vault

---

## Notes

- All content must be restyled to match Hexworth Prime aesthetic
- Maintain our presentation/applet/lab/quiz format
- Integrate with ProgressManager for XP tracking
- Add to LearningPaths.js after creation
- Update content-registry.js for each new module

### Cross-House Content (From D:\unstructured PDF\)

| Content | Primary House | Secondary House | Notes |
|---------|---------------|-----------------|-------|
| Command Line Hacker ebook | Script | Dark Arts | CLI hacking techniques |
| GitHub & LinkedIn Portfolio Guide | Code | All Houses | Professional skills - universal value |

### Skipped (Verified Duplicates - Same Hash)

| File | Location | Duplicate Of |
|------|----------|--------------|
| `Classic SysAdmin...pdf` | D:\unstructured PDF\ | D:\Linux\ (exact match) |
| `Anonymity Lab Optimized.pdf` | D:\unstructured PDF\ | D:\Training\Linux\Labs\Anonymity Lab.pdf (exact match) |
| `Anonymity Lab Part 2.pdf` | D:\unstructured PDF\ | D:\Training\Linux\Labs\ (exact match) |
| `Anonymity Lab Part 3 - Capstone (1).pdf` | D:\unstructured PDF\ | D:\Training\Linux\Labs\ (exact match) |

### Unique Variants (Different Versions - Keep Both)

| File | Location | Notes |
|------|----------|-------|
| `Anonymity Lab Part 3 - Capstone.pdf` | D:\unstructured PDF\ | 78622 bytes (vs 77612 in Training) - different version |
| `GPG_Encryption_Exercise.pdf` | D:\unstructured PDF\ | 39KB (vs 29KB in Training) - expanded version |

---

*Created: December 23, 2025*
