# Linux Mastery - Course Plan

**Created:** January 26, 2026
**Status:** SCAFFOLDING
**Codename:** LM (Linux Mastery)
**Source Content:** LabEx linux-free-tutorials (270 lessons)

---

## Course Overview

| Field | Value |
|-------|-------|
| Course Name | Linux Mastery |
| Course Code | LM |
| House | Script |
| Location | `_app/houses/script/modules/linux-mastery/` |
| Focus | Pure skills development, no cert pressure |
| Source | github.com/FM-256/linux-free-tutorials |
| Total Lessons | ~50-60 modules (curated from 270) |

---

## Course Positioning

```
┌─────────────────────────────────────────────────────────────────┐
│                    SCRIPT HOUSE - LINUX TRACKS                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Linux       │  │  CompTIA     │  │  Command     │          │
│  │  Mastery     │  │  Linux+      │  │  Line        │          │
│  │  (LM)        │  │  (XK0-005)   │  │  Hacker      │          │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤          │
│  │ Skills-first │  │ Cert-prep    │  │ Security     │          │
│  │ No pressure  │  │ Exam-aligned │  │ Narrative    │          │
│  │ Foundational │  │ Structured   │  │ Mission-based│          │
│  │ ~50 modules  │  │ 11 modules   │  │ 30 modules   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         ↓                  ↓                  ↓                 │
│    "I want to          "I need          "I want to             │
│     learn Linux"        the cert"        think like             │
│                                          a hacker"              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Module Structure (8 Sections)

### Section 1: Getting Started (LM-01 to LM-05)
**Objective:** First contact with Linux

| Module | Title | Topics |
|--------|-------|--------|
| LM-01 | Welcome to Linux | What is Linux, distros, terminal basics |
| LM-02 | Your First Commands | whoami, id, pwd, clear, date |
| LM-03 | Getting Help | man, --help, info |
| LM-04 | The Terminal Environment | Prompt, shell, history |
| LM-05 | Section 1 Practice | Hands-on exercises |

### Section 2: Navigation & Files (LM-06 to LM-12)
**Objective:** Move around and manage files

| Module | Title | Topics |
|--------|-------|--------|
| LM-06 | Directory Navigation | cd, pwd, absolute vs relative paths |
| LM-07 | Listing Files | ls, ls -la, hidden files |
| LM-08 | File Operations | touch, mkdir, rm, rmdir |
| LM-09 | Copy and Move | cp, mv, renaming |
| LM-10 | Viewing Files | cat, head, tail, less, more |
| LM-11 | Finding Files | find, locate, which, whereis |
| LM-12 | Section 2 Practice | Hands-on exercises |

### Section 3: Text Processing (LM-13 to LM-20)
**Objective:** Work with text like a pro

| Module | Title | Topics |
|--------|-------|--------|
| LM-13 | Text Searching | grep basics |
| LM-14 | Advanced grep | grep -i, -r, -n, -v, regex intro |
| LM-15 | Sorting & Filtering | sort, uniq, cut |
| LM-16 | Counting & Stats | wc, nl |
| LM-17 | Text Transformation | tr, sed basics |
| LM-18 | Pipes & Chains | Using \| to combine commands |
| LM-19 | Output Redirection | >, >>, 2>, &> |
| LM-20 | Section 3 Practice | Hands-on exercises |

### Section 4: Permissions & Users (LM-21 to LM-28)
**Objective:** Understand Linux security model

| Module | Title | Topics |
|--------|-------|--------|
| LM-21 | Users and Groups | whoami, id, groups |
| LM-22 | Understanding Permissions | rwx, owner/group/other |
| LM-23 | Changing Permissions | chmod numeric |
| LM-24 | Changing Permissions II | chmod symbolic |
| LM-25 | Ownership | chown, chgrp |
| LM-26 | Default Permissions | umask |
| LM-27 | Sudo and Root | sudo, su, /etc/sudoers |
| LM-28 | Section 4 Practice | Hands-on exercises |

### Section 5: System Operations (LM-29 to LM-36)
**Objective:** Manage the system

| Module | Title | Topics |
|--------|-------|--------|
| LM-29 | Process Basics | ps, top, htop concepts |
| LM-30 | Process Management | kill, killall, jobs, bg, fg |
| LM-31 | Disk Usage | df, du, lsblk |
| LM-32 | Memory & Resources | free, uptime |
| LM-33 | System Information | uname, hostname, hostnamectl |
| LM-34 | Environment Variables | env, export, PATH |
| LM-35 | Archive & Compress | tar, gzip, zip, unzip |
| LM-36 | Section 5 Practice | Hands-on exercises |

### Section 6: Networking Basics (LM-37 to LM-42)
**Objective:** Network fundamentals from CLI

| Module | Title | Topics |
|--------|-------|--------|
| LM-37 | Network Information | ip, ifconfig, hostname -I |
| LM-38 | Testing Connectivity | ping, traceroute |
| LM-39 | DNS Tools | nslookup, dig, host |
| LM-40 | Downloading Files | wget, curl |
| LM-41 | Remote Connections | ssh basics |
| LM-42 | Section 6 Practice | Hands-on exercises |

### Section 7: Shell Scripting Intro (LM-43 to LM-50)
**Objective:** Automate with bash

| Module | Title | Topics |
|--------|-------|--------|
| LM-43 | Your First Script | shebang, echo, running scripts |
| LM-44 | Variables | Declaring, using, quoting |
| LM-45 | User Input | read, arguments ($1, $2) |
| LM-46 | Conditionals | if, else, elif, test |
| LM-47 | Loops | for, while |
| LM-48 | Functions | Defining and calling |
| LM-49 | Practical Scripts | Backup script, log parser |
| LM-50 | Section 7 Practice | Hands-on exercises |

### Section 8: Beyond Basics (LM-51 to LM-55)
**Objective:** Level up your skills

| Module | Title | Topics |
|--------|-------|--------|
| LM-51 | Links | ln, symlinks vs hardlinks |
| LM-52 | File Editors | nano, vim basics |
| LM-53 | Scheduled Tasks | cron basics |
| LM-54 | Package Concepts | apt/yum concepts (no actual install) |
| LM-55 | Where to Go Next | Resources, next steps, paths |

---

## Module Format

Each module will follow this structure:

```
┌─────────────────────────────────────────┐
│  Module Header                          │
│  - Title, Section, Estimated Time       │
├─────────────────────────────────────────┤
│  Learning Objectives                    │
│  - 3-5 bullet points                    │
├─────────────────────────────────────────┤
│  Concept Explanation                    │
│  - Clear, concise teaching              │
│  - Visual aids where helpful            │
├─────────────────────────────────────────┤
│  Interactive Terminal                   │
│  - Pre-configured for the lesson        │
│  - Guided prompts                       │
├─────────────────────────────────────────┤
│  Exercises                              │
│  - 3-5 try-it-yourself tasks            │
│  - Validation feedback                  │
├─────────────────────────────────────────┤
│  Key Takeaways                          │
│  - Summary box                          │
├─────────────────────────────────────────┤
│  Navigation                             │
│  - Previous / Next Module               │
└─────────────────────────────────────────┘
```

---

## Technical Components

### Shared Components (Already Exist)
- `LinuxTerminal.js` - Terminal simulator
- `LearningPaths.js` - Path definitions
- `path-view.html` - Path viewer

### New Components Needed
- Module template HTML
- LM-specific terminal configurations
- Progress tracking for LM path

### File Structure
```
_app/houses/script/modules/linux-mastery/
├── index.html              # Course landing page
├── lm-01-welcome.html
├── lm-02-first-commands.html
├── lm-03-getting-help.html
├── ...
├── lm-55-next-steps.html
└── assets/
    └── (any LM-specific assets)
```

---

## Differentiation from Other Tracks

| Aspect | Linux Mastery | CompTIA Linux+ | CLH |
|--------|---------------|----------------|-----|
| Goal | Learn skills | Pass exam | Think like hacker |
| Pacing | Self-directed | Structured sections | Mission-driven |
| Content | Comprehensive | XK0-005 aligned | Security focus |
| Tone | Educational | Professional | Narrative |
| Modules | 55 | 11 | 30 |

---

## Implementation Sprints

| Sprint | Modules | Description |
|--------|---------|-------------|
| LM-S1 | LM-01 to LM-05 | Getting Started |
| LM-S2 | LM-06 to LM-12 | Navigation & Files |
| LM-S3 | LM-13 to LM-20 | Text Processing |
| LM-S4 | LM-21 to LM-28 | Permissions & Users |
| LM-S5 | LM-29 to LM-36 | System Operations |
| LM-S6 | LM-37 to LM-42 | Networking Basics |
| LM-S7 | LM-43 to LM-50 | Shell Scripting |
| LM-S8 | LM-51 to LM-55 | Beyond Basics |

---

## Content Source Mapping

LabEx lessons will be used as **reference/inspiration** for original Hexworth content:

| LM Section | LabEx Lesson Range | Notes |
|------------|-------------------|-------|
| Section 1 | Lessons 1-15 | Basics |
| Section 2 | Lessons 16-50 | Files/Navigation |
| Section 3 | Lessons 101-130 | Text processing |
| Section 4 | Lessons 51-70 | Permissions |
| Section 5 | Lessons 71-100 | System ops |
| Section 6 | Lessons 197-210 | Network |
| Section 7 | Lessons 36-42 | Scripting |
| Section 8 | Mixed | Advanced topics |

---

## Current Status (January 26, 2026)

### COMPLETED
- [x] Course plan document (this file)
- [x] Folder structure: `_app/houses/script/modules/linux-mastery/`
- [x] Landing page: `linux-mastery/index.html`
- [x] LearningPaths.js entry (Sections 1-3, 20 modules)

### NOT YET DONE
- [ ] Sections 4-8 in LearningPaths.js (35 more modules)
- [ ] Actual module HTML files (0 of 55 exist)
- [ ] Module template creation
- [ ] Link from Script House index (`_app/houses/script/index.html`)

### WHAT EXISTS vs WHAT'S MISSING

```
_app/houses/script/modules/linux-mastery/
├── index.html              ← EXISTS (landing page)
├── assets/                 ← EXISTS (empty folder)
├── lm-01-welcome.html      ← MISSING (needs creation)
├── lm-02-first-commands.html ← MISSING
├── lm-03-getting-help.html   ← MISSING
├── ...                       ← All 55 modules MISSING
└── lm-55-next-steps.html     ← MISSING
```

### ACCESS POINTS
- Landing: `_app/houses/script/modules/linux-mastery/index.html`
- Path View: `path-view.html?house=script&path=linux-mastery`
- Direct from Script House index

---

## Next Session: Continue Here

### Priority 1: Create Module Template
Create a reusable HTML template for LM modules with:
- Header with module title and navigation
- Learning objectives section
- Concept explanation area
- Embedded terminal (use LinuxTerminal.js or similar)
- Exercise/practice section
- Key takeaways summary
- Previous/Next navigation

### Priority 2: Build LM-01 as Proof of Concept
Using the template, create `lm-01-welcome.html` with:
- Introduction to Linux
- What is Linux, brief history
- Why learn Linux
- What you'll learn in this course
- Simple "try the terminal" exercise

### Priority 3: Build Remaining Section 1 Modules
- LM-02: First commands (whoami, id, pwd, date, clear)
- LM-03: Getting help (man, --help)
- LM-04: Terminal environment (prompt, shell, history)
- LM-05: Section 1 practice exercises

### Priority 4: Add Sections 4-8 to LearningPaths.js
Currently only Sections 1-3 are in LearningPaths.js

---

## Deployment & Access

### Local Development
```
Project Root: /home/eq/Ai content creation/Hexworth Prime/
Course Folder: _app/houses/script/modules/linux-mastery/
```

### Access URLs (after deployment)

| Access Point | URL |
|--------------|-----|
| Landing Page | `hexworth-prime.web.app/houses/script/modules/linux-mastery/index.html` |
| Path View | `hexworth-prime.web.app/path-view.html?house=script&path=linux-mastery` |
| From Script House | Link from `_app/houses/script/index.html` |

### Integration Points

1. **LearningPaths.js** (`_app/components/LearningPaths.js`)
   - Add path definition under key `'linux-mastery'`
   - Currently: Sections 1-3 added, Sections 4-8 pending

2. **Script House Index** (`_app/houses/script/index.html`)
   - Add link to Linux Mastery landing page
   - Should appear alongside CLH and CompTIA Linux+

3. **Path Viewer** (`_app/path-view.html`)
   - Works automatically once LearningPaths.js is updated
   - Access via `?house=script&path=linux-mastery`

### Firebase Deployment

Project uses Firebase Hosting:
```bash
# From project root
firebase deploy --only hosting
```

Firebase config: `firebase.json`
Deployed URL: `https://hexworth-prime.web.app/`

### Module File Naming Convention
```
lm-XX-topic-name.html

Examples:
- lm-01-welcome.html
- lm-02-first-commands.html
- lm-12-section2-practice.html
```

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| `LINUX_MASTERY_PLAN.md` | This file - master plan |
| `LABEX_LINUX_MAPPING.md` | Source content reference |
| `LABEX_SPRINT_PLAN.md` | Original sprint plan (superseded) |
| `LearningPaths.js` | Path definitions (partial) |

---

*Document created January 26, 2026*
*Last Updated: January 26, 2026*
*Status: SCAFFOLDING COMPLETE - Ready to build modules*
