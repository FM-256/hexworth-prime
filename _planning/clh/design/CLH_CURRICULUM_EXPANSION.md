# CLH Course Expansion - Full Curriculum

**Status:** COMPLETE
**Total:** 30 complete modules (Slides + Quiz + Lab each)
**Theme:** Spy/Intelligence/Conspiracy/Hacking

---

## CONTENT STRUCTURE PER MODULE

Each CLH module consists of THREE components:

```
CLH-XXX Module
├── clh-XXX-intro.html       (Slides - concepts/theory)
├── clh-XXX-quiz.html        (Quiz - knowledge check)
└── clh-XXX-[topic].html     (Lab - hands-on practice)
```

**Total Content Pieces:** 90 (30 modules × 3 components)

### Current Status - ALL COMPLETE

| Component | Complete | Total |
|-----------|----------|-------|
| Labs | 30 | 30 |
| Slides | 30 | 30 |
| Quizzes | 30 | 30 |
| **TOTAL** | **90** | **90**

---

## TIER 1: FOUNDATIONS (001-005) - COMPLETE
Core identity and navigation skills. **Rank: RECRUIT**

| Lab | Title | Commands | Status |
|-----|-------|----------|--------|
| 001 | Intro to Hacker CLI | whoami, pwd, hostname, ls, cd, cat | COMPLETE |
| 002 | Navigation Recon | cd, ls, pwd, tree | COMPLETE |
| 003 | Pattern Hunting | grep basics | COMPLETE |
| 004 | Process Investigation | ps, top basics | COMPLETE |
| 005 | Log Analysis | head, tail, less, more | COMPLETE |

---

## TIER 2: FILE OPERATIONS (006-010) - COMPLETE
Manipulating files and data streams. **Rank: FIELD AGENT**

| Lab | Title | Commands | Status |
|-----|-------|----------|--------|
| 006 | File Operations | cp, mv, rm, mkdir, touch, rmdir | COMPLETE |
| 007 | Permissions | chmod, chown, chgrp, umask | COMPLETE |
| 008 | Shell Scripting | bash basics, variables, loops | COMPLETE |
| 009 | Text Processing | cut, sort, uniq, awk, sed | COMPLETE |
| 010 | I/O Redirection | >, >>, <, 2>, pipes, tee | COMPLETE |

---

## TIER 3: ADVANCED ANALYSIS (011-015) - COMPLETE
Pattern matching, networking, and environment. **Rank: ANALYST**

| Lab | Title | Commands | Status |
|-----|-------|----------|--------|
| 011 | Advanced Grep | regex, grep -E, grep -P | COMPLETE |
| 012 | Network Basics | ping, netstat, ss, ip addr/route | COMPLETE |
| 013 | Environment Variables | env, export, PATH, .bashrc | COMPLETE |
| 014 | Process Control | kill, killall, jobs, bg, fg, nohup | COMPLETE |
| 015 | Capstone Mission | All skills combined | COMPLETE |

---

## TIER 4: SYSTEM RECONNAISSANCE (016-020) - COMPLETE
System profiling and user tracking. **Rank: SPECIALIST**

| Lab | Title | Commands | Status |
|-----|-------|----------|--------|
| 016 | System Intel | uname, lscpu, free, uptime, df, du | COMPLETE |
| 017 | Find & Locate | find, locate, which, whereis, type | COMPLETE |
| 018 | Archive Operations | tar, gzip, gunzip, zip, unzip | COMPLETE |
| 019 | Disk Forensics | df, du, mount, lsblk, fdisk -l | COMPLETE |
| 020 | User Reconnaissance | whoami, id, groups, w, who, last, lastlog | COMPLETE |

**Tier 4 Themed Content Ideas:**
- 016: Analyze captured enemy workstation specs, identify hardware for exploit targeting
- 017: Hunt for hidden .classified directories, locate planted trojans
- 018: Extract encrypted archives from dead drop, prepare intel package for handler
- 019: Analyze seized laptop from double agent, find hidden encrypted partition
- 020: Audit black site access logs, identify mole who accessed MAJESTIC files

---

## TIER 5: REMOTE OPERATIONS (021-025) - COMPLETE
Remote access and persistence. **Rank: OPERATOR**

| Lab | Title | Commands | Status |
|-----|-------|----------|--------|
| 021 | SSH Operations | ssh, scp, ssh-keygen, ssh-copy-id | COMPLETE |
| 022 | Network Recon | curl, wget, nc (netcat), host, dig, nslookup | COMPLETE |
| 023 | Service Management | systemctl, service, journalctl | COMPLETE |
| 024 | Scheduled Tasks | cron, crontab, at | COMPLETE |
| 025 | Package Management | apt, dpkg (or yum/dnf) | COMPLETE |

**Tier 5 Themed Content Ideas:**
- 021: Establish encrypted SSH tunnel to CIA handler through Tor relay
- 022: Probe DPRK nuclear facility infrastructure, download leaked documents
- 023: Install persistent implant that survives reboots, runs as systemd service
- 024: Configure cron job to beacon location every 6 hours, dead man switch if captured
- 025: Install forensic tools on seized system without alerting target

---

## TIER 6: SECURITY OPERATIONS (026-030) - COMPLETE
Full spectrum operations. **Rank: SHADOW AGENT**

| Lab | Title | Commands | Status |
|-----|-------|----------|--------|
| 026 | Access Control | sudo, su, visudo, passwd | COMPLETE |
| 027 | User Management | useradd, usermod, userdel, groupadd | COMPLETE |
| 028 | System Monitoring | top, htop, iotop, vmstat, watch | COMPLETE |
| 029 | Vim Essentials | vim basics (i, :wq, :q!, dd, yy, p) | COMPLETE |
| 030 | Final Operation | All skills | COMPLETE |

**Tier 6 Themed Content Ideas:**
- 026: Escalate privileges on compromised embassy server to access ambassador's files
- 027: Create hidden admin account for persistent access, add to sudoers
- 028: Monitor target system for counter-intelligence detection, watch for anomalies
- 029: Edit /etc/hosts to redirect enemy C2, modify configs with vim only
- 030: Complete operation - infiltrate SPECTRE network, extract Project CHIMERA files, establish persistence, wipe logs, exfil via satellite uplink

---

## SKILL PROGRESSION MATRIX

```
TIER 1 (001-005): RECRUIT
├── Basic navigation
├── File reading
└── Process awareness

TIER 2 (006-010): FIELD AGENT
├── File manipulation
├── Permissions
├── Scripting basics
└── Data streams

TIER 3 (011-015): ANALYST
├── Pattern matching
├── Network awareness
├── Environment control
└── Process management

TIER 4 (016-020): SPECIALIST
├── System profiling
├── File hunting
├── Archive handling
├── Disk analysis
└── User tracking

TIER 5 (021-025): OPERATOR
├── Remote access
├── Network tools
├── Persistence
├── Scheduling
└── Package management

TIER 6 (026-030): SHADOW AGENT
├── Privilege escalation
├── Account management
├── Live monitoring
├── Field editing
└── Full operations
```

---

## CERTIFICATION STRUCTURE

| Labs Completed | Rank | Badge |
|----------------|------|-------|
| 001-005 | RECRUIT | Basic Training |
| 006-010 | FIELD AGENT | Operator Certified |
| 011-015 | ANALYST | CLI Engineer |
| 016-020 | SPECIALIST | System Recon |
| 021-025 | OPERATOR | Remote Operations |
| 026-030 | SHADOW AGENT | Full Clearance |

---

## IMPLEMENTATION PRIORITY

**Phase 1 (High Priority):**
- 016: System Intel (easy, foundational)
- 017: Find & Locate (critical skill)
- 021: SSH Operations (essential for remote work)

**Phase 2 (Medium Priority):**
- 018: Archive Operations
- 019: Disk Forensics
- 020: User Reconnaissance
- 022: Network Recon

**Phase 3 (Lower Priority):**
- 023: Service Management
- 024: Scheduled Tasks
- 025: Package Management

**Phase 4 (Advanced):**
- 026: Access Control
- 027: User Management
- 028: System Monitoring
- 029: Vim Essentials
- 030: Final Operation

---

## NOTES

- Each lab follows established template (two-panel design, LinuxTerminal.js)
- All filesystems use FLAT structure with children arrays
- Content must be spy/conspiracy/UFO/hacker themed - NO lorem ipsum
- Labs build on previous skills progressively
- Capstone labs at 015 and 030 test cumulative knowledge

---

---

## DETAILED MODULE BREAKDOWN

### MODULE 001: Intro to Hacker CLI
**Slides:** What is CLI, why hackers prefer it, GUI vs terminal, anatomy of a command, basic commands overview
**Quiz:** 5-7 questions on CLI concepts, command syntax, when to use CLI
**Lab:** OPERATION SILENT ECHO - First commands (whoami, pwd, hostname, ls, cd, cat)

### MODULE 002: Navigation Recon
**Slides:** Filesystem hierarchy, absolute vs relative paths, directory structure, navigation strategies
**Quiz:** Path questions, filesystem hierarchy, navigation concepts
**Lab:** Navigate through classified directories, find hidden intel

### MODULE 003: Pattern Hunting
**Slides:** Why pattern matching matters, grep basics, search strategies, case sensitivity
**Quiz:** grep syntax, pattern matching concepts, output interpretation
**Lab:** Hunt for patterns in intercepted communications

### MODULE 004: Process Investigation
**Slides:** What are processes, PIDs, process states, viewing processes, process hierarchy
**Quiz:** Process concepts, ps command options, interpreting output
**Lab:** Investigate suspicious processes on compromised system

### MODULE 005: Log Analysis
**Slides:** Log file locations, log formats, reading strategies, head/tail/less
**Quiz:** Log concepts, command usage, analysis strategies
**Lab:** Analyze signal monitoring station logs

### MODULE 006: File Operations
**Slides:** CRUD operations, copying, moving, deleting, creating, safety practices
**Quiz:** Command syntax, dangerous operations, best practices
**Lab:** OPERATION SHADOWSTRIKE - manage dead drop files

### MODULE 007: Permissions
**Slides:** Unix permission model, rwx, octal notation, ownership, security implications
**Quiz:** Permission calculations, chmod syntax, security scenarios
**Lab:** Secure classified files at DARPA black site

### MODULE 008: Shell Scripting
**Slides:** Why scripting, shebang, variables, conditionals, loops, script structure
**Quiz:** Bash syntax, variable usage, script reading
**Lab:** Write infiltration and exfil scripts

### MODULE 009: Text Processing
**Slides:** Data pipelines, cut, sort, uniq, awk basics, sed basics, combining tools
**Quiz:** Tool selection, syntax, pipeline construction
**Lab:** Process intercepted intelligence data

### MODULE 010: I/O Redirection
**Slides:** stdin/stdout/stderr, redirection operators, pipes, tee, combining streams
**Quiz:** Operator meanings, stream concepts, pipeline design
**Lab:** Redirect SIGINT data streams

### MODULE 011: Advanced Grep
**Slides:** Regular expressions, grep options, extended regex, practical patterns
**Quiz:** Regex syntax, grep flags, pattern construction
**Lab:** Hunt for APT signatures in system logs

### MODULE 012: Network Basics
**Slides:** Network fundamentals, IP/ports, TCP/UDP, diagnostic commands
**Quiz:** Network concepts, command usage, output interpretation
**Lab:** Reconnaissance on black site network

### MODULE 013: Environment Variables
**Slides:** What are env vars, common variables, PATH, setting/exporting, persistence
**Quiz:** Variable concepts, PATH manipulation, security implications
**Lab:** Configure covert ops workstation environment

### MODULE 014: Process Control
**Slides:** Signals, kill command, job control, background processes, nohup
**Quiz:** Signal types, command syntax, job control concepts
**Lab:** Hunt and terminate nation-state malware

### MODULE 015: Capstone Mission
**Slides:** Mission briefing only (minimal teaching, review of all skills)
**Quiz:** Comprehensive review (optional pre-mission test)
**Lab:** S4 facility breach investigation

### MODULE 016: System Intel
**Slides:** System information commands, hardware detection, resource monitoring
**Quiz:** Command purposes, output interpretation, forensic value
**Lab:** Profile captured enemy workstation

### MODULE 017: Find & Locate
**Slides:** find command deep dive, locate database, which/whereis/type
**Quiz:** find syntax, search strategies, performance considerations
**Lab:** Hunt for hidden backdoors and planted evidence

### MODULE 018: Archive Operations
**Slides:** Compression concepts, tar, gzip, zip, extraction, archive inspection
**Quiz:** Format differences, command syntax, common operations
**Lab:** Extract encrypted dead drop packages

### MODULE 019: Disk Forensics
**Slides:** Storage concepts, partitions, mount points, disk analysis commands
**Quiz:** Filesystem concepts, command usage, forensic procedures
**Lab:** Analyze seized double agent laptop

### MODULE 020: User Reconnaissance
**Slides:** User databases, login tracking, session information, audit trails
**Quiz:** User concepts, command purposes, security implications
**Lab:** Track infiltrator who accessed MAJESTIC files

### MODULE 021: SSH Operations
**Slides:** SSH protocol, key-based auth, ssh config, tunneling, scp/sftp
**Quiz:** SSH concepts, key management, security best practices
**Lab:** Establish covert tunnel to handler through Tor

### MODULE 022: Network Recon
**Slides:** curl/wget, netcat, DNS tools, HTTP basics, data retrieval
**Quiz:** Tool selection, syntax, use cases
**Lab:** Probe hostile infrastructure, download leaked documents

### MODULE 023: Service Management
**Slides:** systemd architecture, units, service lifecycle, journald logging
**Quiz:** systemctl commands, unit concepts, troubleshooting
**Lab:** Install persistent implant as systemd service

### MODULE 024: Scheduled Tasks
**Slides:** Cron syntax, crontab management, at command, scheduling strategies
**Quiz:** Cron time syntax, command usage, security considerations
**Lab:** Configure beacon schedule and dead man switch

### MODULE 025: Package Management
**Slides:** Package concepts, apt/dpkg, repositories, dependency management
**Quiz:** Command syntax, package operations, security updates
**Lab:** Install forensic tools on seized system

### MODULE 026: Access Control
**Slides:** sudo mechanism, su command, sudoers file, privilege escalation
**Quiz:** sudo concepts, security implications, configuration
**Lab:** Escalate privileges on compromised embassy server

### MODULE 027: User Management
**Slides:** User creation, modification, groups, home directories, account security
**Quiz:** Command syntax, user concepts, security practices
**Lab:** Create hidden backdoor account for persistence

### MODULE 028: System Monitoring
**Slides:** Real-time monitoring, top/htop, resource tracking, anomaly detection
**Quiz:** Tool usage, metric interpretation, threshold concepts
**Lab:** Monitor for counter-intelligence detection

### MODULE 029: Vim Essentials
**Slides:** Why vim, modes, basic navigation, editing commands, saving/quitting
**Quiz:** Mode concepts, key commands, common tasks
**Lab:** Edit configs in the field (no GUI available)

### MODULE 030: Final Operation
**Slides:** Mission briefing - OPERATION CHIMERA (comprehensive review)
**Quiz:** Final certification exam (all topics)
**Lab:** Full infiltration: access, recon, persist, exfil, cover tracks

---

## IMPLEMENTATION TRACKING

### Phase 1: Existing Labs (001-015)
- [x] Create slides for 001-015
- [x] Create quizzes for 001-015
- [x] Labs complete

### Phase 2: New Modules (016-030)
- [x] Create slides for 016-030
- [x] Create quizzes for 016-030
- [x] Create labs for 016-030

---

## COMPLETE FILE LISTING

All files located in `_app/houses/script/`

### Slides (clh/ directory)
```
clh-001-intro.html    clh-011-intro.html    clh-021-intro.html
clh-002-intro.html    clh-012-intro.html    clh-022-intro.html
clh-003-intro.html    clh-013-intro.html    clh-023-intro.html
clh-004-intro.html    clh-014-intro.html    clh-024-intro.html
clh-005-intro.html    clh-015-intro.html    clh-025-intro.html
clh-006-intro.html    clh-016-intro.html    clh-026-intro.html
clh-007-intro.html    clh-017-intro.html    clh-027-intro.html
clh-008-intro.html    clh-018-intro.html    clh-028-intro.html
clh-009-intro.html    clh-019-intro.html    clh-029-intro.html
clh-010-intro.html    clh-020-intro.html    clh-030-intro.html
```

### Quizzes (clh/ directory)
```
clh-001-quiz.html     clh-011-quiz.html     clh-021-quiz.html
clh-002-quiz.html     clh-012-quiz.html     clh-022-quiz.html
clh-003-quiz.html     clh-013-quiz.html     clh-023-quiz.html
clh-004-quiz.html     clh-014-quiz.html     clh-024-quiz.html
clh-005-quiz.html     clh-015-quiz.html     clh-025-quiz.html
clh-006-quiz.html     clh-016-quiz.html     clh-026-quiz.html
clh-007-quiz.html     clh-017-quiz.html     clh-027-quiz.html
clh-008-quiz.html     clh-018-quiz.html     clh-028-quiz.html
clh-009-quiz.html     clh-019-quiz.html     clh-029-quiz.html
clh-010-quiz.html     clh-020-quiz.html     clh-030-quiz.html
```

### Labs (applets/linux/ directory)
```
clh-001-hacker-cli.html       clh-016-system-intel.html
clh-002-navigation-recon.html clh-017-file-hunting.html
clh-003-pattern-hunting.html  clh-018-archives.html
clh-004-process-investigation.html  clh-019-disk-forensics.html
clh-005-log-analysis.html     clh-020-user-recon.html
clh-006-file-operations.html  clh-021-ssh-ops.html
clh-007-permissions.html      clh-022-network-recon.html
clh-008-shell-scripting.html  clh-023-services.html
clh-009-text-processing.html  clh-024-cron.html
clh-010-io-redirection.html   clh-025-packages.html
clh-011-advanced-grep.html    clh-026-access.html
clh-012-network-basics.html   clh-027-users.html
clh-013-environment.html      clh-028-monitoring.html
clh-014-process-control.html  clh-029-vim.html
clh-015-capstone.html         clh-030-chimera.html
```

---

*Created: 2026-01-17*
*Completed: 2026-01-17*
*Total: 30 complete modules (90 content pieces) for comprehensive Linux CLI mastery*
