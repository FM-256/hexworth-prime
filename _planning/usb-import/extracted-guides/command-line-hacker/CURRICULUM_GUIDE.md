# Command Line Hacker - Curriculum Guide

**Source:** Command Line Hacker Bundle
**Target House:** Script House (Primary) + Dark Arts (Crossover)
**Priority:** HIGH - Unique differentiating content
**Status:** Extracted and ready for conversion

---

## Overview

A complete 16-chapter Linux command line curriculum with a **hacker focus**. Unlike generic Linux tutorials, this content approaches CLI skills from a security/hacking perspective, teaching students to think like investigators and ethical hackers.

**What Sets This Apart:**
- Real practice files (pcaps, logs, databases)
- Security-focused exercises (find the anomaly, decode the secret)
- Hacker mindset throughout the curriculum
- Kali Linux integration

---

## Core Materials

### Main Ebook
| File | Size | Description |
|------|------|-------------|
| `Comand Line Hacker - ORIGINAL eBook (3).pdf` | 3.75MB | Complete textbook covering all 16 chapters |

### Chapter Exercise PDFs
| Chapter | Focus Area | PDF Size |
|---------|------------|----------|
| Chapter 1 | Introduction & Setup | 731KB |
| Chapter 2 | Basic Navigation & Files | 452KB |
| Chapter 3 | File Operations | 620KB |
| Chapter 4 | Network Analysis | 493KB |
| Chapter 5 | Text Search & Grep | 287KB |
| Chapter 6 | Process Management | 275KB |
| Chapter 7 | Permissions | 83KB |
| Chapter 8 | Shell Scripting Basics | 508KB |
| Chapter 9 | Advanced Scripting | 108KB |
| Chapter 10 | System Administration | 67KB |
| Chapter 11 | Log Analysis | 86KB |
| Chapter 12 | Database Interaction | 57KB |
| Chapter 13 | Automation | 44KB |
| Chapter 14 | Security Tools | 62KB |
| Chapter 15 | Advanced Topics | 246KB |
| Chapter 16 | Capstone Project | 274KB |

### Bonus Materials
| File | Size | Content |
|------|------|---------|
| `10 Command Line Tips.pdf` | 207KB | Quick reference |
| `Kali Linux Command Line Cheat Sheet.pdf` | 757KB | Kali-specific commands |
| `Shell Script Creation Checklist.pdf` | 189KB | Script development guide |
| `Shell Script Creation Template.pdf` | 49KB | Reusable template |

---

## Practice Files - THE DIFFERENTIATOR

These real-world files make this curriculum unique:

### Chapter 2: File Manipulation Practice
| File | Purpose |
|------|---------|
| `LongScript.sh.txt` | Script editing practice |
| `MeetingNotes.txt` | Text file manipulation |
| `MyFavoriteRecipe.txt` | Content modification |
| `ProjectReport.txt.txt` | Document handling |
| `system.log.txt` | Introduction to logs |

### Chapter 4: Network Forensics
| File | Size | Purpose |
|------|------|---------|
| `breach.pcap` | 5.2MB | **REAL packet capture** for network analysis |

**Lab Potential:** Analyze network traffic to find:
- Suspicious connections
- Data exfiltration patterns
- Protocol anomalies
- Source of breach

### Chapter 5: Text Analysis & Secrets
| File | Content |
|------|---------|
| `mystery.txt` | Contains hidden "Secret Code: 42XDFL" among lorem ipsum |

**Lab Potential:** Use grep/regex to:
- Find the hidden code
- Extract specific patterns
- Create search scripts

### Chapter 6: Process Forensics
| File | Content |
|------|---------|
| `CPU_Process_Analysis.txt` | Simulated process list with suspicious `unknown_process` |
| `process_simulation.sh` | Script for generating process data |

**Lab Potential:** Identify anomalies:
- Spot the malicious process (8.2% CPU, unknown origin)
- Investigate process hierarchy
- Create monitoring scripts

### Chapter 9: Scripting Practice
| File | Purpose |
|------|---------|
| `large_text_file.txt` (510KB) | Text processing at scale |
| `script1.sh`, `script2.sh`, `script3.sh` | Script analysis/modification |
| `text_file1.txt`, `text_file2.txt` | Input/output practice |

### Chapter 11: Log Analysis
| File | Size | Content |
|------|------|---------|
| `Linux.log` | 2.3MB | Real Linux system logs |
| `Zookeeper.log` | 10.4MB | Real application logs |
| `Chapter 11.zip` | 740KB | Additional log samples |

**Lab Potential:** Investigate logs for:
- Security events
- Service failures
- Timeline reconstruction
- Pattern recognition

### Chapter 12: Database Interaction
| File | Size | Purpose |
|------|------|---------|
| `mysqlsampledatabase.sql` | 196KB | Real MySQL database for querying |

**Lab Potential:**
- Import into MySQL
- Run forensic queries
- Extract evidence
- Database reconnaissance

---

## Hexworth Prime Integration Plan

### Proposed Module Structure

```
Script House: Command Line Hacker Path
├── CLH-001: Introduction to the Hacker CLI
│   ├── Presentation (from ebook Ch 1)
│   ├── Lab: Environment Setup
│   └── Quiz: CLI Basics
│
├── CLH-002: Navigation & Reconnaissance
│   ├── Presentation (from ebook Ch 2-3)
│   ├── Lab: File System Exploration (with practice files)
│   └── Quiz: Navigation Commands
│
├── CLH-003: Network Analysis Fundamentals
│   ├── Presentation (from ebook Ch 4)
│   ├── Lab: Analyze breach.pcap
│   └── Quiz: Network Commands
│
├── CLH-004: Text Analysis & Pattern Hunting
│   ├── Presentation (from ebook Ch 5)
│   ├── Lab: Find the Secret Code (mystery.txt)
│   └── Quiz: Grep & Regex
│
├── CLH-005: Process Investigation
│   ├── Presentation (from ebook Ch 6)
│   ├── Lab: Find the Anomaly (CPU_Process_Analysis.txt)
│   └── Quiz: Process Management
│
├── CLH-006: Permissions & Access Control
│   ├── Presentation (from ebook Ch 7)
│   ├── Lab: Permission Scenarios
│   └── Quiz: chmod, chown, umask
│
├── CLH-007: Shell Scripting - Basics
│   ├── Presentation (from ebook Ch 8)
│   ├── Lab: Create Your First Script
│   └── Quiz: Script Fundamentals
│
├── CLH-008: Shell Scripting - Advanced
│   ├── Presentation (from ebook Ch 9)
│   ├── Lab: Process the Large File (script practice)
│   └── Quiz: Advanced Scripting
│
├── CLH-009: System Administration
│   ├── Presentation (from ebook Ch 10)
│   ├── Lab: System Management Tasks
│   └── Quiz: Admin Commands
│
├── CLH-010: Log Analysis & Forensics
│   ├── Presentation (from ebook Ch 11)
│   ├── Lab: Investigate Linux.log & Zookeeper.log
│   └── Quiz: Log Analysis
│
├── CLH-011: Database Reconnaissance
│   ├── Presentation (from ebook Ch 12)
│   ├── Lab: Query the MySQL Database
│   └── Quiz: Database Commands
│
├── CLH-012: Automation & Scheduling
│   ├── Presentation (from ebook Ch 13)
│   ├── Lab: Automated Monitoring
│   └── Quiz: Cron & Automation
│
├── CLH-013: Security Tools
│   ├── Presentation (from ebook Ch 14)
│   ├── Lab: Security Assessment
│   └── Quiz: Security Commands
│
├── CLH-014: Advanced Techniques
│   ├── Presentation (from ebook Ch 15)
│   ├── Lab: Complex Scenarios
│   └── Quiz: Advanced Topics
│
└── CLH-015: Capstone - Full Investigation
    ├── Presentation (from ebook Ch 16)
    ├── Lab: Multi-file Investigation (all practice files)
    └── Final Assessment
```

### Cross-House Integration (Hybrid Model)

**Philosophy:** Script House teaches the *skills*, Dark Arts applies them to *investigations*.

| Module | Primary House | Content Focus |
|--------|---------------|---------------|
| CLH-001: Intro to CLI | Script | Foundational |
| CLH-002: Navigation & Recon | Script | Foundational |
| CLH-003: Network Analysis | Script | Foundational |
| **CLH-004: Pattern Hunting** | **Dark Arts** | Investigation (mystery.txt) |
| **CLH-005: Process Investigation** | **Dark Arts** | Investigation (find anomaly) |
| CLH-006: Permissions | Script | Foundational |
| CLH-007: Scripting Basics | Script | Foundational |
| CLH-008: Scripting Advanced | Script | Foundational |
| CLH-009: System Admin | Script | Foundational |
| **CLH-010: Log Forensics** | **Dark Arts** | Investigation (Linux.log) |
| **CLH-011: DB Reconnaissance** | **Dark Arts** | Investigation (MySQL) |
| CLH-012: Automation | Script | Foundational |
| **CLH-013: Security Tools** | **Dark Arts** | Investigation |
| CLH-014: Advanced Topics | Script | Foundational |
| **CLH-015: Capstone** | **Dark Arts** | Full Investigation |

**Student Path:**
1. Complete Script House modules (CLH-001-003, 006-009, 012, 014) → Earn "CLI Specialist"
2. Dark Arts investigation modules unlock as crossover content
3. Complete Dark Arts modules (CLH-004-005, 010-011, 013, 015) → Earn "Command Line Hacker"
4. Full path completion → Earn **"Command Line Hacker"** title

### Title Progression (Hacker Theme)

| Chapters Complete | Title Earned |
|-------------------|--------------|
| CLH-001 to 003 | CLI Recruit |
| CLH-004 to 006 | CLI Analyst |
| CLH-007 to 009 | CLI Specialist |
| CLH-010 to 012 | CLI Engineer |
| CLH-013 to 015 | CLI Architect |
| + All Labs with Practice Files | **Command Line Hacker** |

---

## Conversion Notes

### PDF → Hexworth Presentation
1. Extract key concepts from ebook chapters
2. Create visual slides with Hexworth styling
3. Add interactive elements where possible
4. Include code snippets with syntax highlighting

### Practice Files → Interactive Labs
1. Package files with lab instructions
2. Create downloadable lab kits
3. Design verification scripts to check answers
4. Build browser-based simulators where possible

### Exercises → Hexworth Quizzes
1. Extract questions from exercise PDFs
2. Convert to interactive quiz format
3. Add explanations for wrong answers
4. Track progress through ProgressManager

---

## Why This Content Is Unique

| Feature | Generic Linux Course | Command Line Hacker |
|---------|---------------------|---------------------|
| Focus | IT Administration | Security/Hacking |
| Practice Files | Sample text files | Real pcaps, logs, databases |
| Exercises | "Create a file" | "Find the hidden code" |
| Mindset | Follow procedures | Investigate anomalies |
| Kali Integration | None | Full cheat sheet |
| Capstone | Generic project | Full investigation |

---

## Files Location

```
extracted-guides/command-line-hacker/
├── Comand Line Hacker - ORIGINAL eBook (3).pdf
└── Free Bonuses/
    ├── 10 Command Line Tips.pdf
    ├── Kali Linux Command Line Cheat Sheet.pdf
    ├── Shell Script Creation Checklist.pdf
    ├── Shell Script Creation Template.pdf
    └── Exercises/
        ├── Exercises for Linux Chapter #1.pdf
        ├── ... (16 chapter PDFs)
        └── Practice Files For Exercises.../
            ├── Chapter 2/  (text files)
            ├── chapter 4/  (breach.pcap)
            ├── Chapter 5/  (mystery.txt)
            ├── Chapter 6/  (process files)
            ├── Chapter 9/  (scripts)
            ├── Chapter 11/ (logs)
            └── Chapter 12/ (mysql database)
```

---

*Created: December 24, 2025*
*This content will set Hexworth Prime apart from generic LMS platforms.*
