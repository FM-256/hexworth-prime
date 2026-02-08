# LabEx Integration - Sprint Plan

**Project:** Linux Command Simulator Challenge Expansion
**Approach:** CI/CD + Waterfall + Agile Hybrid
**Target:** 270 challenges across 6 sprints

---

## Sprint Overview

| Sprint | Section | Challenges | Status |
|--------|---------|------------|--------|
| L-01 | Section 1: Fundamentals | 20 | IN PROGRESS |
| L-02 | Section 2: CLI Essentials | 40 | PENDING |
| L-03 | Section 3: Filesystem | 30 | PENDING |
| L-04 | Section 4: Permissions | 30 | PENDING |
| L-05 | Section 5: Scripting | 40 | PENDING |
| L-06 | Section 6 + Advanced | 110 | PENDING |

---

## Sprint L-01: Fundamentals (20 challenges)

### Scope
Basic Linux commands for absolute beginners.

### Challenge List
| # | Title | Command(s) | Check |
|---|-------|------------|-------|
| 1 | Who Am I? | `whoami` | cmd includes 'whoami' |
| 2 | What's My ID? | `id` | cmd includes 'id' |
| 3 | List Files | `ls` | cmd === 'ls' |
| 4 | List All Files | `ls -a` | cmd includes 'ls -a' |
| 5 | List Detailed | `ls -l` | cmd includes 'ls -l' |
| 6 | List All Detailed | `ls -la` | cmd includes '-la' or '-al' |
| 7 | Where Am I? | `pwd` | cmd === 'pwd' |
| 8 | Go Home | `cd ~` or `cd` | cmd === 'cd' or 'cd ~' |
| 9 | Go Up | `cd ..` | cmd includes 'cd ..' |
| 10 | Read a File | `cat` | cmd includes 'cat' |
| 11 | Create Empty File | `touch` | cmd includes 'touch' |
| 12 | Create Directory | `mkdir` | cmd includes 'mkdir' |
| 13 | Remove File | `rm` | cmd includes 'rm' |
| 14 | Copy File | `cp` | cmd includes 'cp' |
| 15 | Move File | `mv` | cmd includes 'mv' |
| 16 | Show First Lines | `head` | cmd includes 'head' |
| 17 | Show Last Lines | `tail` | cmd includes 'tail' |
| 18 | Clear Screen | `clear` | cmd === 'clear' |
| 19 | Show Date | `date` | cmd === 'date' |
| 20 | Show Hostname | `hostname` | cmd === 'hostname' |

### Deliverables
- [ ] Add 20 challenges to simulator
- [ ] Add category filter to Challenges tab
- [ ] Test all challenges complete correctly
- [ ] Verify progress saves to LocalStorage

### Acceptance Criteria
- All 20 challenges appear in Challenges tab
- Category "Section 1: Fundamentals" filter works
- Completing challenges shows success message
- Progress persists on page reload

---

## Sprint L-02: CLI Essentials (40 challenges)

### Scope
Core command-line operations, pipes, and filters.

### Challenge Topics
- Text viewing (more, less)
- Text searching (grep basics)
- Text counting (wc)
- Sorting (sort)
- Unique filtering (uniq)
- Head/tail with options
- Pipes (|)
- Basic redirection (>, >>)
- Command history
- Tab completion
- Man pages

### Status: PENDING (after L-01)

---

## Sprint L-03: Filesystem (30 challenges)

### Scope
Filesystem navigation, structure, and management.

### Challenge Topics
- Filesystem hierarchy (/etc, /var, /home, etc.)
- Finding files (find, locate)
- File types
- Links (ln, symlinks)
- Disk usage (df, du)
- Mount points
- File metadata (stat)

### Status: PENDING (after L-02)

---

## Sprint L-04: Permissions (30 challenges)

### Scope
Linux permissions, ownership, and access control.

### Challenge Topics
- Permission reading (ls -l)
- chmod (numeric and symbolic)
- chown
- chgrp
- umask
- Special permissions (SUID, SGID, sticky)
- sudo basics

### Status: PENDING (after L-03)

---

## Sprint L-05: Scripting (40 challenges)

### Scope
Bash scripting fundamentals.

### Challenge Topics
- Variables
- Echo and printf
- Conditionals (if, case)
- Loops (for, while)
- Functions
- Arguments ($1, $2, $@)
- Exit codes
- Input handling

### Status: PENDING (after L-04)

---

## Sprint L-06: Advanced (110 challenges)

### Scope
Advanced topics, cross-platform, security basics.

### Challenge Topics
- Process management (ps, top, kill)
- Network basics (ping, ifconfig, netstat)
- Package management concepts
- System monitoring
- Log analysis basics
- Environment variables
- Cross-platform (macOS similarities)

### Status: PENDING (after L-05)

---

## CI/CD Approach

Each sprint follows:
1. **Plan** - Define challenges
2. **Build** - Add to simulator
3. **Test** - Verify all work
4. **Deploy** - Commit changes
5. **Review** - Check in path-view works

---

## Notes

- Challenges build on each other (prerequisite-style learning)
- Each sprint is deployable independently
- Progress syncs with CompTIA Linux+ path
- Category filters allow focused practice

---

*Sprint Plan Created: January 25, 2026*
