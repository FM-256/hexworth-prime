# A+ Core 2 (220-1102) Content Mapping & Consolidation Plan

**Certification:** CompTIA A+ Core 2
**Exam Code:** 220-1102
**House:** Forge (Certification Foundry)
**Status:** SCAFFOLDING COMPLETE - Ch 13-17 done, Ch 18-24 need content creation
**Searchable Tags:** A+, CompTIA, Core 2, 1102, Certification, OS, Security

---

## Current State Assessment

### Status: SCAFFOLDING COMPLETE ✅
Core 2 now has proper scaffolding matching Core 1's structure. Existing content for chapters 13-17 has been moved and organized.

### Remaining Gap
**Chapters 18-24 are EMPTY** - these are not migration tasks, they require **content creation**:
- Ch 18-21: Security domain content (25% of exam)
- Ch 22-24: Operational procedures content (22% of exam)

### Existing Core 2 Content (Scattered)

| File | Current Location | Content |
|------|------------------|---------|
| `core2-quiz-ch19-22.html` | `applets/comptia-aplus/` | Quiz for chapters 19-22 |
| `core2_roleplay_lab.html` | `applets/comptia-aplus/` | IT support roleplay lab |
| `os_core.html` | `applets/comptia-aplus/` | OS fundamentals |
| `windows-shortcuts.html` | `applets/comptia-aplus/` | Keyboard shortcuts reference |
| `aplus-core2-quiz.html` | `quizzes/` | General Core 2 quiz |
| `aplus-core2-ch19-22.html` | `quizzes/` | Duplicate of above? |

### Related Content (Should be consolidated into Core 2)

| File | Current Location | Relevant To |
|------|------------------|-------------|
| `windows-editions.html` | `presentations/` | Ch 13 - Windows Editions |
| `windows-editions-lab.html` | `labs/` | Ch 13 Lab |
| `windows-settings.html` | `presentations/` | Ch 14 - Windows Settings |
| `windows-settings-lab.html` | `labs/` | Ch 14 Lab |
| `control-panel.html` | `presentations/` | Ch 14 - Control Panel |
| `control-panel-lab.html` | `labs/` | Ch 14 Lab |
| `admin-tools.html` | `presentations/` | Ch 15 - Admin Tools |
| `admin-tools-lab.html` | `labs/` | Ch 15 Lab |
| `system-tools.html` | `presentations/` | Ch 16 - System Tools |
| `system-tools-lab.html` | `labs/` | Ch 16 Lab |
| `macos-linux-basics.html` | `presentations/` | Ch 17 - macOS/Linux |
| `lab-macos-linux.html` | `labs/` | Ch 17 Lab |
| `control-panel-explorer.html` | `applets/` | Ch 14 Tool |
| `settings-explorer.html` | `applets/` | Ch 14 Tool |
| `admin-tools-explorer.html` | `applets/` | Ch 15 Tool |
| `system-tools-sim.html` | `applets/` | Ch 16 Tool |
| `windows-edition-selector.html` | `applets/` | Ch 13 Tool |
| `windows10-components.html` | `applets/` | Ch 14 Reference |

---

## Exam Overview

| Metric | Value |
|--------|-------|
| Questions | Maximum 90 |
| Time | 90 minutes |
| Passing Score | 700 (scale 100-900) |
| Experience | 12 months hands-on |

### Domain Weights

| Domain | Weight | Priority |
|--------|--------|----------|
| 1.0 Operating Systems | 31% | **HIGH** |
| 2.0 Security | 25% | **HIGH** |
| 3.0 Software Troubleshooting | 22% | **HIGH** |
| 4.0 Operational Procedures | 22% | MEDIUM |

---

## Target Scaffolding Structure

```
_app/houses/forge/applets/comptia-aplus/core-2/
├── index.html                          ← Core 2 landing page
├── chapters/
│   ├── ch13-windows-editions/
│   │   └── index.html                  ← Presentation + Lab links
│   ├── ch14-windows-settings/
│   │   └── index.html
│   ├── ch15-admin-tools/
│   │   └── index.html
│   ├── ch16-system-tools/
│   │   └── index.html
│   ├── ch17-macos-linux/
│   │   └── index.html
│   ├── ch18-users-groups/
│   │   └── index.html
│   ├── ch19-security/
│   │   └── index.html
│   ├── ch20-malware/
│   │   └── index.html
│   ├── ch21-physical-security/
│   │   └── index.html
│   ├── ch22-incident-response/
│   │   └── index.html
│   ├── ch23-change-management/
│   │   └── index.html
│   └── ch24-documentation/
│       └── index.html
├── domains/
│   ├── operating-systems/
│   │   └── index.html
│   ├── security/
│   │   └── index.html
│   ├── software-troubleshooting/
│   │   └── index.html
│   └── operational-procedures/
│       └── index.html
├── labs/
│   ├── windows-editions-lab.html       ← MOVE from forge/labs/
│   ├── windows-settings-lab.html       ← MOVE from forge/labs/
│   ├── control-panel-lab.html          ← MOVE from forge/labs/
│   ├── admin-tools-lab.html            ← MOVE from forge/labs/
│   ├── system-tools-lab.html           ← MOVE from forge/labs/
│   ├── macos-linux-lab.html            ← MOVE from forge/labs/
│   ├── user-management-lab.html        ← NEW
│   ├── security-settings-lab.html      ← NEW
│   ├── malware-removal-lab.html        ← NEW
│   ├── incident-response-lab.html      ← NEW
│   └── troubleshooting-lab.html        ← NEW
├── tools/
│   ├── control-panel-explorer.html     ← MOVE from forge/applets/
│   ├── settings-explorer.html          ← MOVE from forge/applets/
│   ├── admin-tools-explorer.html       ← MOVE from forge/applets/
│   ├── system-tools-sim.html           ← MOVE from forge/applets/
│   └── windows-edition-selector.html   ← MOVE from forge/applets/
├── quizzes/
│   ├── core2-full-quiz.html            ← MOVE from forge/quizzes/
│   ├── ch13-quiz.html                  ← NEW
│   ├── ch14-quiz.html                  ← NEW
│   └── ...
└── reference/
    ├── windows-shortcuts.html          ← MOVE from applets/comptia-aplus/
    ├── command-reference.html          ← NEW
    └── troubleshooting-flowcharts.html ← NEW
```

---

## Chapter Breakdown (Following Mike Meyers Structure)

### Chapter 13: Windows Versions & Requirements
**Domain:** 1.0 Operating Systems
**Objectives:** 1.1 - Identify basic features of Microsoft Windows editions

**Content:**
- Windows 10 editions (Home, Pro, Pro for Workstations, Enterprise)
- Windows 11 editions and requirements
- Feature comparison (BitLocker, RDP, domain join, Hyper-V)
- Upgrade paths
- 32-bit vs 64-bit requirements

**Existing Content to Move:**
- `presentations/windows-editions.html` → `chapters/ch13/`
- `labs/windows-editions-lab.html` → `labs/`
- `applets/windows-edition-selector.html` → `tools/`

**New Content Needed:**
- [ ] Windows 11 requirements content
- [ ] Chapter quiz

---

### Chapter 14: Windows Settings & Control Panel
**Domain:** 1.0 Operating Systems
**Objectives:** 1.2 - Given a scenario, use the appropriate Microsoft command-line tool

**Content:**
- Settings app navigation
- Control Panel categories
- Display, sound, power settings
- Network settings
- Windows Update
- Accounts management

**Existing Content to Move:**
- `presentations/windows-settings.html` → `chapters/ch14/`
- `presentations/control-panel.html` → `chapters/ch14/`
- `labs/windows-settings-lab.html` → `labs/`
- `labs/control-panel-lab.html` → `labs/`
- `applets/settings-explorer.html` → `tools/`
- `applets/control-panel-explorer.html` → `tools/`
- `applets/windows10-components.html` → `tools/`

**New Content Needed:**
- [ ] Combined presentation
- [ ] Chapter quiz

---

### Chapter 15: Administrative Tools
**Domain:** 1.0 Operating Systems
**Objectives:** 1.3 - Given a scenario, use features and tools of the Microsoft Windows OS

**Content:**
- Computer Management
- Device Manager
- Disk Management
- Task Scheduler
- Event Viewer
- Local Users and Groups
- Performance Monitor
- Services console
- Certificate Manager
- Group Policy Editor

**Existing Content to Move:**
- `presentations/admin-tools.html` → `chapters/ch15/`
- `labs/admin-tools-lab.html` → `labs/`
- `applets/admin-tools-explorer.html` → `tools/`

**New Content Needed:**
- [ ] Chapter quiz
- [ ] Group Policy lab

---

### Chapter 16: System Tools & Utilities
**Domain:** 1.0 Operating Systems
**Objectives:** 1.3 - Windows tools and utilities

**Content:**
- Task Manager
- Resource Monitor
- System Information (msinfo32)
- System Configuration (msconfig)
- Disk Cleanup
- Disk Defragmenter
- Registry Editor
- DirectX Diagnostic Tool

**Existing Content to Move:**
- `presentations/system-tools.html` → `chapters/ch16/`
- `labs/system-tools-lab.html` → `labs/`
- `applets/system-tools-sim.html` → `tools/`

**New Content Needed:**
- [ ] Chapter quiz

---

### Chapter 17: macOS & Linux
**Domain:** 1.0 Operating Systems
**Objectives:** 1.10 - Identify common features and tools of the macOS/Linux OS

**Content:**
- macOS features (Finder, Dock, Spotlight, Time Machine)
- macOS system preferences
- Terminal basics
- Linux distributions
- Linux file system
- Linux commands (ls, cd, grep, chmod, etc.)
- Package managers (apt, yum)
- Linux GUI (GNOME, KDE)

**Existing Content to Move:**
- `presentations/macos-linux-basics.html` → `chapters/ch17/`
- `labs/lab-macos-linux.html` → `labs/`

**New Content Needed:**
- [ ] Linux terminal simulator
- [ ] Chapter quiz

---

### Chapter 18: Users & Groups
**Domain:** 1.0 Operating Systems / 2.0 Security
**Objectives:** 1.5 - Account types, 2.2 - Logical security concepts

**Content:**
- Administrator vs Standard user
- Guest and Power User
- Local vs Domain accounts
- User Account Control (UAC)
- Login options (username/password, PIN, fingerprint)
- NTFS permissions
- Share permissions
- Inheritance and propagation

**Existing Content:**
- None exists

**New Content Needed:**
- [ ] Full chapter presentation
- [ ] User management lab
- [ ] Permissions lab
- [ ] Chapter quiz

---

### Chapter 19: Security Fundamentals
**Domain:** 2.0 Security
**Objectives:** 2.1 - Physical security, 2.2 - Logical security

**Content:**
- Physical security (locks, biometrics, guards)
- Logical security (authentication, authorization)
- Active Directory basics
- Group policies
- Password policies
- Account lockout
- Data classification

**Existing Content:**
- `core2-quiz-ch19-22.html` (partial)

**New Content Needed:**
- [ ] Full chapter presentation
- [ ] Security settings lab
- [ ] Chapter quiz

---

### Chapter 20: Malware
**Domain:** 2.0 Security
**Objectives:** 2.3 - Malware, 2.4 - Social engineering, 2.7 - Anti-malware

**Content:**
- Malware types (virus, worm, trojan, ransomware, spyware, rootkit)
- Attack vectors
- Social engineering (phishing, vishing, shoulder surfing)
- Anti-malware tools
- Windows Security/Defender
- Malware removal process
- Browser security

**Existing Content:**
- `core2_roleplay_lab.html` (IT support scenarios)

**New Content Needed:**
- [ ] Full chapter presentation
- [ ] Malware identification lab
- [ ] Malware removal walkthrough
- [ ] Chapter quiz

---

### Chapter 21: Physical Security & Environmental Controls
**Domain:** 2.0 Security / 4.0 Operational Procedures
**Objectives:** 2.1 - Physical security methods

**Content:**
- Access control vestibules
- Badge readers
- Video surveillance
- Door locks (biometric, smart cards, key fobs)
- Equipment locks (cable locks, server locks)
- Environmental controls (HVAC, fire suppression)
- UPS and surge protection

**New Content Needed:**
- [ ] Full chapter presentation
- [ ] Physical security assessment lab
- [ ] Chapter quiz

---

### Chapter 22: Incident Response
**Domain:** 4.0 Operational Procedures
**Objectives:** 4.6 - Incident response

**Content:**
- Incident identification
- First responder actions
- Documentation and reporting
- Chain of custody
- Evidence preservation
- Data/device preservation

**New Content Needed:**
- [ ] Full chapter presentation
- [ ] IR scenario lab
- [ ] Chapter quiz

---

### Chapter 23: Change Management
**Domain:** 4.0 Operational Procedures
**Objectives:** 4.1 - Best practices documentation, 4.2 - Change management

**Content:**
- Change management process
- Documented business processes
- Rollback plans
- Sandbox testing
- Request approval process
- End-user acceptance

**New Content Needed:**
- [ ] Full chapter presentation
- [ ] Change request lab
- [ ] Chapter quiz

---

### Chapter 24: Documentation & Professionalism
**Domain:** 4.0 Operational Procedures
**Objectives:** 4.7 - Communication and professionalism

**Content:**
- Network documentation (diagrams, asset inventory)
- Ticketing systems
- Knowledge bases
- Communication skills
- Professional appearance
- Time management
- Dealing with difficult situations

**New Content Needed:**
- [ ] Full chapter presentation
- [ ] Documentation templates
- [ ] Chapter quiz

---

## Migration Checklist

### Phase 1: Create Scaffolding ✅ COMPLETE (Feb 3, 2026)
- [x] Create `core-2/` directory structure
- [x] Create `core-2/index.html` landing page
- [x] Create chapter index pages (ch13-ch17)
- [x] Create chapter folder placeholders (ch18-ch24) - EMPTY
- [x] Create domain folder placeholders (4)

### Phase 2: Move Existing Content ✅ COMPLETE (Feb 3, 2026)
- [x] Move presentations → `core-2/presentations/` (6 files)
- [x] Move labs → `core-2/labs/` (7 files)
- [x] Move tools → `core-2/tools/` (7 files)
- [x] Move quizzes → `core-2/quizzes/` (3 files)
- [x] Move reference → `core-2/reference/` (1 file)
- [x] Create chapter index pages with links (ch13-ch17)
- [x] Fix navigation link in Forge house index

### Phase 3: Create Missing Content ⬜ NOT STARTED
- [ ] Ch 18: Users & Groups (full chapter - presentation, lab, quiz)
- [ ] Ch 19: Security Fundamentals (full chapter)
- [ ] Ch 20: Malware (full chapter)
- [ ] Ch 21: Physical Security (full chapter)
- [ ] Ch 22: Incident Response (full chapter)
- [ ] Ch 23: Change Management (full chapter)
- [ ] Ch 24: Documentation (full chapter)
- [ ] Chapter quizzes for existing chapters (ch13-17)
- [ ] Linux terminal simulator lab for ch17

### Phase 4: Update Registries
- [ ] Update ContentRegistry.js with Core 2 entries
- [ ] Update Forge house index.html SAMPLE_MODULES
- [ ] Update any learning paths

### Phase 5: QA/QC
- [x] Test Core 2 navigation link ✅
- [ ] Verify all internal links work
- [ ] Test all quizzes
- [ ] Mobile responsive check

---

## Content Gap Analysis

| Chapter | Presentation | Lab | Quiz | Status |
|---------|--------------|-----|------|--------|
| Ch 13 - Windows Editions | ✅ EXISTS | ✅ EXISTS | ⬜ MISSING | Partial |
| Ch 14 - Settings/Control Panel | ✅ EXISTS | ✅ EXISTS | ⬜ MISSING | Partial |
| Ch 15 - Admin Tools | ✅ EXISTS | ✅ EXISTS | ⬜ MISSING | Partial |
| Ch 16 - System Tools | ✅ EXISTS | ✅ EXISTS | ⬜ MISSING | Partial |
| Ch 17 - macOS/Linux | ✅ EXISTS | ✅ EXISTS | ⬜ MISSING | Partial |
| Ch 18 - Users/Groups | ⬜ MISSING | ⬜ MISSING | ⬜ MISSING | **EMPTY** |
| Ch 19 - Security | ⬜ MISSING | ⬜ MISSING | 🟡 PARTIAL | **EMPTY** |
| Ch 20 - Malware | ⬜ MISSING | 🟡 PARTIAL | 🟡 PARTIAL | Partial |
| Ch 21 - Physical Security | ⬜ MISSING | ⬜ MISSING | ⬜ MISSING | **EMPTY** |
| Ch 22 - Incident Response | ⬜ MISSING | ⬜ MISSING | ⬜ MISSING | **EMPTY** |
| Ch 23 - Change Management | ⬜ MISSING | ⬜ MISSING | ⬜ MISSING | **EMPTY** |
| Ch 24 - Documentation | ⬜ MISSING | ⬜ MISSING | ⬜ MISSING | **EMPTY** |

**Summary (Updated Feb 3, 2026):**
- ✅ Scaffolded with content: 5 chapters (13-17) - Domain 1: Operating Systems
- 🟡 Partial: 1 chapter (20 - has roleplay lab)
- ⬜ Empty - Need full content: 6 chapters (18-19, 21-24) - Domains 2-4

**What EXISTS in core-2/:**
- 6 presentations, 7 labs, 7 tools, 3 quizzes, 1 reference
- Chapter index pages for ch13-17 with links to content
- Landing page with progress tracking

**What DOESN'T EXIST:**
- Any content for chapters 18-24 (just empty folders)
- Chapter quizzes for existing chapters

---

## Priority Actions

1. **FIRST:** Create scaffolding structure
2. **SECOND:** Move existing content (Ch 13-17)
3. **THIRD:** Add missing quizzes to existing chapters
4. **FOURTH:** Build empty chapters (prioritize by domain weight)
   - Security (Ch 19-21) - 25% of exam
   - Operational (Ch 22-24) - 22% of exam

---

## Source Materials

**Slides Location:** (need to confirm with user)
**Exam Objectives:** CompTIA A+ 220-1102 Exam Objectives

---

*Created: February 3, 2026*
*Last Updated: February 3, 2026 - Scaffolding complete, content moved*
