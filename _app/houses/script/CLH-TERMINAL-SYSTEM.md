# CLH Centralized Terminal System

**Version:** 1.0.0
**Created:** January 17, 2026
**Branch:** `feature/clh-terminal`
**Status:** CLH-001 to CLH-015 converted, CLH-016 to CLH-030 pending

---

## Overview

The CLH (Command Line Hacker) course uses a centralized terminal simulation system consisting of two main components:

| File | Lines | Purpose |
|------|-------|---------|
| `CLHTerminal.js` | ~2,980 | Full terminal engine with realistic Linux commands |
| `CLHConfig.js` | ~2,452 | Central registry with filesystems/objectives for all modules |

This replaces the previous approach where each lab file (clh-001.html, clh-002.html, etc.) contained its own embedded terminal JavaScript (~400-600 lines each).

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Lab HTML File                          │
│  (clh-001-intro-to-hacker-cli.html)                        │
│                                                             │
│  - Minimal HTML structure                                   │
│  - Intel panel content (educational material)               │
│  - Single init call: CLHTerminal.init('CLH-001')           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    CLHTerminal.js                           │
│  Location: _app/components/CLHTerminal.js                   │
│                                                             │
│  Features:                                                  │
│  - Realistic Linux command simulation                       │
│  - Filesystem navigation (ls, cd, pwd, cat, etc.)          │
│  - Process simulation (ps, top, kill, jobs, bg, fg)        │
│  - Permission enforcement (chmod, chown, sudo)             │
│  - Network commands (ping, netstat, ss, curl, wget)        │
│  - Text processing (grep, head, tail, wc, sort, uniq)      │
│  - SSH simulation (connects to "remote" filesystems)       │
│  - Objective tracking with visual indicators               │
│  - Command history (up/down arrows)                        │
│  - Tab completion                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     CLHConfig.js                            │
│  Location: _app/components/CLHConfig.js                     │
│                                                             │
│  Contains per-module:                                       │
│  - Filesystem overlay (files, dirs, permissions, content)  │
│  - Objectives (tasks the student must complete)            │
│  - Metadata (title, description, tier, prerequisites)      │
│  - User/hostname configuration                             │
│  - Allowed commands (optional restriction)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## File Locations

```
_app/
├── components/
│   ├── CLHTerminal.js          ← Terminal engine
│   └── CLHConfig.js            ← Module configurations
│
└── houses/script/
    ├── clh/
    │   ├── clh-001-intro.html  ← Intro slides
    │   ├── clh-001-quiz.html   ← Quiz
    │   └── ...
    │
    └── applets/linux/
        ├── clh-001-intro-to-hacker-cli.html  ← Lab file
        ├── clh-002-navigation-recon.html
        └── ...
```

---

## How to Initialize a Lab

Each lab HTML file needs minimal code:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>CLH-001: Introduction to Hacker CLI</title>
    <link rel="stylesheet" href="../../../../components/CLHTerminal.css">
</head>
<body>
    <!-- Terminal container -->
    <div id="clh-terminal"></div>

    <!-- Intel panel with educational content -->
    <div class="intel-panel">
        <h2>MISSION BRIEFING</h2>
        <!-- Educational content here -->
    </div>

    <!-- Load the centralized system -->
    <script src="../../../../components/CLHConfig.js"></script>
    <script src="../../../../components/CLHTerminal.js"></script>
    <script>
        // Single line initialization!
        CLHTerminal.init('CLH-001', '#clh-terminal');
    </script>
</body>
</html>
```

---

## CLHConfig.js Module Structure

Each module in CLHConfig.js follows this structure:

```javascript
'CLH-001': {
    // Metadata
    title: 'Introduction to Hacker CLI',
    description: 'Learn basic reconnaissance commands.',
    prerequisites: [],           // Array of required module IDs
    tier: 'CLI Recruit',         // Tier for badge system

    // Terminal configuration
    user: 'operator',            // Username in prompt
    hostname: 'shadow',          // Hostname in prompt
    startDir: '/home/operator',  // Starting directory
    allowedCommands: null,       // null = all, or array of allowed commands

    // Filesystem overlay (merged with base filesystem)
    filesystem: {
        '/home/operator': {
            type: 'dir',
            perms: 'drwxr-xr-x',
            owner: 'operator',
            group: 'operator',
            children: ['Documents', 'missions', '.bashrc']
        },
        '/home/operator/missions/briefing.txt': {
            type: 'file',
            perms: '-rw-r--r--',
            owner: 'operator',
            group: 'operator',
            size: 412,
            content: `Your mission content here...`
        }
    },

    // Objectives (tasks to complete)
    objectives: [
        {
            id: 1,
            title: 'Verify Identity',
            description: 'Use whoami to confirm your username.',
            hint: '$ whoami',
            check: (cmd, output, state) => cmd.trim() === 'whoami'
        },
        {
            id: 2,
            title: 'Survey Environment',
            description: 'List the contents of your home directory.',
            hint: '$ ls',
            check: (cmd, output, state) => cmd.startsWith('ls')
        }
    ]
}
```

---

## Tier System

Modules are organized into 5 tiers (3 modules each for CLH-001 to CLH-015):

| Tier | Modules | Badge | Focus |
|------|---------|-------|-------|
| CLI Recruit | CLH-001, 002, 003 | `cli-recruit` | Basic navigation |
| CLI Analyst | CLH-004, 005, 006 | `cli-analyst` | Process & log analysis |
| CLI Operative | CLH-007, 008, 009 | `cli-operative` | Permissions & scripting |
| CLI Shadow | CLH-010, 011, 012 | `cli-shadow` | Network operations |
| CLI Phantom | CLH-013, 014, 015 | `cli-phantom` | Advanced operations |

---

## Supported Commands

CLHTerminal.js supports these Linux commands:

### Navigation & Files
- `pwd`, `cd`, `ls` (with flags: -l, -a, -la, -h, -R)
- `cat`, `head`, `tail`, `less`, `more`
- `touch`, `mkdir`, `rm`, `rmdir`, `cp`, `mv`
- `find`, `locate`, `which`, `whereis`

### Text Processing
- `grep` (with -i, -r, -n, -v, -c, -l)
- `wc`, `sort`, `uniq`, `cut`, `tr`
- `sed`, `awk` (basic patterns)
- `diff`, `comm`

### System Information
- `whoami`, `id`, `hostname`, `uname`
- `date`, `cal`, `uptime`
- `df`, `du`, `free`
- `lscpu`, `lsmem`, `lsblk`

### Process Management
- `ps` (with aux, -ef flags)
- `top`, `htop`
- `kill`, `killall`, `pkill`
- `jobs`, `bg`, `fg`, `&`
- `nohup`, `nice`, `renice`

### Permissions
- `chmod`, `chown`, `chgrp`
- `sudo` (simulated with password prompt)
- `su`

### Network
- `ping`, `traceroute`
- `netstat`, `ss`
- `curl`, `wget`
- `ssh` (simulated remote connection)
- `scp`, `sftp`
- `ip`, `ifconfig`
- `dig`, `nslookup`, `host`

### Archives
- `tar`, `gzip`, `gunzip`, `zip`, `unzip`

### Other
- `echo`, `printf`, `clear`, `history`
- `export`, `env`, `alias`, `unalias`
- `man`, `help`, `info`

---

## Conversion Status

### Completed (on feature/clh-terminal branch)
- [x] CLH-001: Introduction to Hacker CLI
- [x] CLH-002: Navigation Recon
- [x] CLH-003: Pattern Hunting
- [x] CLH-004: Process Investigation
- [x] CLH-005: Log Analysis
- [x] CLH-006: File Operations
- [x] CLH-007: Permissions
- [x] CLH-008: Shell Scripting
- [x] CLH-009: Text Processing
- [x] CLH-010: I/O Redirection
- [x] CLH-011: Advanced Grep
- [x] CLH-012: Network Basics
- [x] CLH-013: Environment Variables
- [x] CLH-014: Process Control
- [x] CLH-015: Capstone

### Pending (need conversion from embedded to centralized)
- [ ] CLH-016: System Intel
- [ ] CLH-017: Find & Locate
- [ ] CLH-018: Archive Operations
- [ ] CLH-019: Disk Forensics
- [ ] CLH-020: User Recon
- [ ] CLH-021: SSH Operations
- [ ] CLH-022: Network Recon
- [ ] CLH-023: Services
- [ ] CLH-024: Cron Jobs
- [ ] CLH-025: Package Management
- [ ] CLH-026: Access Control
- [ ] CLH-027: User Management
- [ ] CLH-028: System Monitoring
- [ ] CLH-029: Vim Editor
- [ ] CLH-030: Chimera (Final Capstone)

---

## Migration Guide: Converting CLH-016 to CLH-030

Each of the pending labs (CLH-016 to CLH-030) currently has embedded terminal code. To convert:

### Step 1: Extract Configuration

From the existing lab file, extract:
1. **Filesystem structure** - Look for `fs: { ... }` or similar
2. **Tasks/Objectives** - Look for `tasks = [ ... ]`
3. **System responses** - Look for command output mappings
4. **Theme elements** - User, hostname, mission narrative

### Step 2: Add to CLHConfig.js

Add a new entry to the MODULES object:

```javascript
'CLH-016': {
    title: 'System Intel',
    description: 'Profile system specs before deploying tools.',
    prerequisites: ['CLH-015'],
    tier: 'CLI Shadow',  // Or appropriate tier
    user: 'operator',
    hostname: 'EMBASSY-WS-07',
    startDir: '/home/operator',

    filesystem: {
        // Extracted filesystem here
    },

    objectives: [
        // Converted tasks here
    ]
}
```

### Step 3: Simplify HTML

Replace the embedded JavaScript with:

```html
<script src="../../../../components/CLHConfig.js"></script>
<script src="../../../../components/CLHTerminal.js"></script>
<script>
    CLHTerminal.init('CLH-016', '#clh-terminal');
</script>
```

### Step 4: Keep Intel Panel

Preserve the educational content (intel panel) from the original file.

---

## Example: CLH-016 Objectives (from embedded code)

The current CLH-016 has these tasks that need to be converted:

```javascript
// Current format (embedded)
const tasks = [
    { id: 1, title: 'IDENTIFY: System Architecture',
      hint: '$ uname -a',
      check: cmd => cmd.includes('uname') },
    { id: 2, title: 'PROFILE: CPU Capabilities',
      hint: '$ lscpu',
      check: cmd => cmd.includes('lscpu') },
    // ...
];

// Target format (CLHConfig.js)
objectives: [
    {
        id: 1,
        title: 'IDENTIFY: System Architecture',
        description: 'Determine the kernel version and CPU architecture.',
        hint: '$ uname -a',
        check: (cmd, output, state) => cmd.includes('uname')
    },
    // ...
]
```

---

## Raw Content Resources

Additional content for labs is available at:

```
/home/eq/Ai content creation/Linux/Linux/
├── clh/Command Line Hacker Bundle/
│   ├── Command Line Hacker - ORIGINAL eBook.pdf
│   └── Free Bonuses/
│       ├── Exercises/ (Chapters 1-16)
│       └── Practice Files/
│
├── CustomLinuxLabs/Custom Linux Labs/
│   ├── Lab 01-21 (docx and pdf)
│   └── linux_labs.nlx (NetLab pod)
│
├── Exercises for Linux Chapter 1-16.pdf
├── Kali Linux Command Line Cheat Sheet.pdf
└── Labs/ (Anonymity, GPG, Compression, etc.)
```

---

## Testing

After conversion, verify:
1. Terminal initializes without errors
2. All objectives can be completed
3. Filesystem matches intended structure
4. Navigation between modules works (Next/Previous links)
5. Completion modal appears after all objectives done

---

## Notes

- The centralized system reduces total code by ~70% (from ~400-600 lines per lab to ~50 lines)
- Makes theming consistent across all labs
- Easier to add new commands (single location)
- Filesystem overlays are merged with a base filesystem, so common directories exist automatically
- Objectives support complex checks via the `(cmd, output, state)` function signature

---

*Last Updated: January 18, 2026*
