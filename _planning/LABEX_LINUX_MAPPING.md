# LabEx Linux Content Mapping Plan

**Created:** January 25, 2026
**Status:** IN PROGRESS
**Source:** github.com/FM-256/linux-free-tutorials (forked from labex-labs)

---

## Source Content

### Repository Details
| Field | Value |
|-------|-------|
| Repository | `FM-256/linux-free-tutorials` |
| Original | `labex-labs/linux-free-tutorials` |
| Total Lessons | **270** |
| Format | Curriculum outline in README.md |
| Access | Available (GitHub fork - no 403 block) |

### LabEx Curriculum Structure (270 Lessons)

| Category | Lesson Range | Count | Topics |
|----------|--------------|-------|--------|
| Core Fundamentals | 1-50 | ~50 | User mgmt, file ops, commands, text processing |
| Intermediate Ops | 51-100 | ~50 | Monitoring, networking, shell scripting |
| Data Processing | 101-130 | ~30 | awk, jq, ripgrep, text tools |
| Security & Crypto | 131-180 | ~50 | OpenSSL, Hashcat, Hydra, Nmap, Metasploit |
| Troubleshooting | 181-210 | ~30 | Permissions, errors, system info |
| Infrastructure | 211-260 | ~50 | MySQL, Terraform, system tools |
| Challenges | 261-270 | ~10 | Real-world scenarios, Day 1-5 modules |

---

## Target Implementation

### Primary Target: `linux-command-simulator.html`

**Location:** `_app/houses/script/applets/linux/linux-command-simulator.html`

**Current State:**
- Full terminal simulator with virtual filesystem
- Command history, tab completion, learning panel
- **Only 8 challenges implemented** (of 270 potential)

**Challenge System Architecture:**
```javascript
const challenges = [
    {
        id: 1,
        title: 'Challenge Title',
        description: 'What the user needs to do',
        hint: 'Help text shown on request',
        check: (history) => history.some(cmd => cmd.includes('expected_command')),
        completed: false
    }
];
```

### Current 8 Challenges (Already Built)

| # | Title | LabEx Equivalent | Status |
|---|-------|------------------|--------|
| 1 | List Files | Lesson ~5 (ls basics) | Done |
| 2 | Navigate to Documents | Lesson ~10 (cd basics) | Done |
| 3 | Read a File | Lesson ~15 (cat) | Done |
| 4 | Find Your Way Home | Lesson ~12 (cd ~) | Done |
| 5 | Create a Directory | Lesson ~20 (mkdir) | Done |
| 6 | View Hidden Files | Lesson ~8 (ls -a) | Done |
| 7 | Check System Info | Lesson ~45 (uname) | Done |
| 8 | Search Files | Lesson ~35 (grep) | Done |

**Progress: 8/270 = ~3%**

---

## Mapping Strategy

### Phase 1: Core Fundamentals (Lessons 1-50)
Map to beginner challenges in simulator.

| LabEx Topic | Challenge Title | Commands to Check |
|-------------|-----------------|-------------------|
| User/group info | Who Am I? | `whoami`, `id` |
| Display user info | User Identity | `id`, `groups` |
| File deletion | Clean Up Files | `rm` |
| File moving | Organize Files | `mv` |
| Wildcards | Pattern Matching | `ls *.txt`, `rm *.log` |
| Compression | Archive Files | `tar`, `gzip`, `zip` |
| Text sorting | Sort Data | `sort` |
| Word counting | Count Words | `wc` |
| File permissions | Check Permissions | `ls -l`, `stat` |

### Phase 2: Intermediate (Lessons 51-100)
Map to intermediate challenges.

| LabEx Topic | Challenge Title | Commands to Check |
|-------------|-----------------|-------------------|
| System monitoring | Monitor Resources | `top`, `free`, `df` |
| Process management | Process Hunter | `ps`, `kill` |
| Network testing | Network Check | `ping`, `ifconfig` |
| Shell variables | Variable Magic | `echo $VAR`, `export` |
| Shell scripting | Script Basics | `bash`, `./script.sh` |
| I/O redirection | Redirect Output | `>`, `>>`, `|` |

### Phase 3: Data Processing (Lessons 101-130)
Map to text processing challenges.

| LabEx Topic | Challenge Title | Commands to Check |
|-------------|-----------------|-------------------|
| awk processing | AWK Power | `awk` |
| Line numbering | Number Lines | `nl`, `cat -n` |
| Duplicate filtering | Remove Duplicates | `uniq`, `sort -u` |
| Stream editing | Stream Edit | `sed` |

### Phase 4: Security (Lessons 131-180)
**Note:** Security tools (Hashcat, Hydra, Nmap, Metasploit) should go to **Dark Arts** house, not Script.

For Script house, keep to:
- Basic encryption concepts
- File permissions security
- SSH basics

### Phase 5: Troubleshooting (Lessons 181-210)
Map to problem-solving challenges.

| LabEx Topic | Challenge Title | Commands to Check |
|-------------|-----------------|-------------------|
| Permission errors | Fix Permissions | `chmod`, `chown` |
| File not found | Find Missing File | `find`, `locate` |
| Symlink issues | Follow the Link | `ln -s`, `readlink` |

### Phase 6: Challenges (Lessons 261-270)
These are ready-made scenarios - can adapt directly:
- The Manuscript Mystery
- Rapid Threat Detection
- Disk Usage Detective
- Needle in the Haystack
- Finding the Pirate's Treasure

---

## Related Content (Already Built)

### CLH Series (Command Line Hacker)
**Location:** Same folder - 30 modules exist

| Module | Status | Size |
|--------|--------|------|
| clh-001 to clh-017 | Complete | 22-28KB |
| clh-018 to clh-030 | Skeleton | 11-13KB |

**Note:** CLH is a SEPARATE curriculum focused on security/hacking mindset. LabEx mapping goes into the simulator, not CLH.

### Linux Lab Series
| File | Status |
|------|--------|
| linux-lab-001-user-identity.html | Built |
| linux-lab-002-file-navigation.html | Built |

**Note:** These are standalone labs, separate from the simulator challenges.

---

## Implementation Plan

### Step 1: Expand Challenge Array
Add challenges to `linux-command-simulator.html` in phases:
- Phase 1: Add 40 more challenges (Core Fundamentals)
- Phase 2: Add 40 more challenges (Intermediate)
- Phase 3: Add 25 more challenges (Data Processing)
- Phase 4: Add 25 more challenges (Troubleshooting + Scenarios)

### Step 2: Enhance Virtual Filesystem
Current filesystem is basic. Need to add:
- More directories for challenges
- Sample log files for grep/awk challenges
- Config files for editing challenges
- Hidden files for discovery challenges

### Step 3: Add Command Support
Current commands: ls, cd, pwd, cat, mkdir, touch, rm, cp, mv, grep, find, chmod, chown, ps, whoami, hostname, date, uname, head, tail

Need to add for full LabEx coverage:
- `sort`, `uniq`, `wc` (text processing)
- `tar`, `gzip`, `zip`, `unzip` (compression)
- `awk`, `sed` (stream processing)
- `df`, `du`, `free` (disk/memory)
- `export`, `env` (environment)
- `ln` (links)

### Step 4: Category Tabs
Add challenge categories to the Challenges tab:
- Beginner (Lessons 1-50)
- Intermediate (Lessons 51-100)
- Text Processing (Lessons 101-130)
- Troubleshooting (Lessons 181-210)
- Scenarios (Lessons 261-270)

---

## Content Routing

| LabEx Category | Hexworth Destination |
|----------------|---------------------|
| Core Linux (1-130) | Script House - linux-command-simulator |
| Security Tools (131-180) | Dark Arts Vault |
| Troubleshooting (181-210) | Script House - linux-command-simulator |
| Infrastructure (211-260) | Cloud House (Terraform) / Script House |
| Challenges (261-270) | Script House - linux-command-simulator |

---

## Next Actions

1. [ ] Clone FM-256/linux-free-tutorials locally for reference
2. [ ] Create challenge mapping spreadsheet (LabEx lesson → Challenge)
3. [ ] Expand virtual filesystem in simulator
4. [ ] Add missing command implementations
5. [ ] Batch add Phase 1 challenges (40 challenges)
6. [ ] Test and iterate

---

---

## Integration with CompTIA Linux+ Path

### Current CompTIA Linux+ Structure (LearningPaths.js)

**Path ID:** `comptia-linux`
**Certification:** CompTIA Linux+ XK0-005
**Current Modules:** 11 (in 6 sections)

| Section | Module | Type | Target |
|---------|--------|------|--------|
| 1 | Linux System Overview | presentation | ubuntu-components.html |
| 1 | Section 1 Quiz | quiz | linux-section1-quiz.html |
| 2 | Command Line Essentials | **applet** | **linux-command-simulator.html** |
| 2 | Section 2 Quiz | quiz | linux-basics-quiz.html |
| 3 | File System Navigation | applet | linux-filesystem-navigator.html |
| 3 | Section 3 Lab | lab | linux-lab-002-file-navigation.html |
| 4 | Linux Permissions | applet | linux-permissions-calculator.html |
| 4 | Section 4 Lab | lab | linux-lab-001-user-identity.html |
| 5 | Bash Scripting | applet | bash-scripting-playground.html |
| 5 | Section 5 Quiz | quiz | linux-bash-quiz.html |
| 6 | macOS & Linux | lab | lab-macos-linux.html |

### Integration Strategy: Shared Simulator

**Key Insight:** The `linux-command-simulator.html` is already the centerpiece of Section 2 (Command Line Essentials). By expanding its challenges with LabEx content, BOTH paths benefit:

```
┌─────────────────────────────────────────────────────────────────┐
│                 linux-command-simulator.html                     │
│                    (270 LabEx Challenges)                        │
├─────────────────────────────────────────────────────────────────┤
│                           ↑                                      │
│              ┌────────────┴────────────┐                        │
│              │                         │                        │
│    CompTIA Linux+ Path          LabEx Learning Path             │
│    (Certification Prep)         (Skills Practice)               │
│                                                                  │
│    - Structured 6 sections      - 270 challenges                │
│    - Quizzes + Labs             - Progressive difficulty        │
│    - XK0-005 objectives         - Hands-on practice             │
└─────────────────────────────────────────────────────────────────┘
```

### Unified Approach

1. **LabEx challenges** become the practice layer in the simulator
2. **CompTIA path** provides structure and certification alignment
3. **Progress syncs** - challenges completed help both tracks
4. **Challenge categories** align with CompTIA sections:

| CompTIA Section | LabEx Lesson Range | Challenge Count |
|-----------------|-------------------|-----------------|
| Section 1: Fundamentals | 1-20 | ~20 |
| Section 2: CLI Essentials | 21-60 | ~40 |
| Section 3: Filesystem | 61-90 | ~30 |
| Section 4: Permissions | 91-120 | ~30 |
| Section 5: Scripting | 121-160 | ~40 |
| Section 6: Cross-Platform | 161-180 | ~20 |
| Advanced/Security | 181-270 | ~90 (optional) |

### Benefits of Unified Approach

1. **No duplicate content** - one simulator serves both paths
2. **Progress persists** - LocalStorage tracks all challenges
3. **Flexible entry** - Start from CompTIA path OR challenge mode
4. **Certification prep** - Challenges map to XK0-005 objectives
5. **Depth when needed** - LabEx provides extra practice beyond cert requirements

---

## References

- **Simulator:** `_app/houses/script/applets/linux/linux-command-simulator.html`
- **CompTIA Path:** `_app/components/LearningPaths.js` → `comptia-linux`
- **Path Viewer:** `_app/path-view.html?house=script&path=comptia-linux`
- **GitHub Source:** `github.com/FM-256/linux-free-tutorials`
- **Related Spell:** SPELL-016-LINUX-INITIATIVE-L1.md
- **CLH Curriculum:** clh-001 through clh-030 (separate project)

---

*Document created January 25, 2026*
*Status: Planning - Integration strategy defined*
