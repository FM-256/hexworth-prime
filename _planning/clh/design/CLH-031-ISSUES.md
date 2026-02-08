# CLH-031 Operation BLACKOUT - Known Issues

## Firewall Puzzle UX Problem

**Issue:** The firewall puzzle expects users to enter specific IP addresses (DENY 10.13.37.66, ALLOW 10.13.37.100) but:
1. Terminal is blocked during the puzzle - can't run recon commands
2. User has no way to discover what IPs to use
3. Hints show the IPs but user wouldn't know WHY those are correct

**Possible Solutions:**
1. Show network traffic log BEFORE puzzle triggers (user sees "attack from 10.13.37.66")
2. Have puzzle UI display "Suspicious traffic detected from: X.X.X.X" and "Your relay address: Y.Y.Y.Y"
3. Allow limited terminal access during puzzle for reconnaissance (`netstat`, `who`, etc.)
4. Add a "HANDLER INTEL" panel that feeds relevant info during puzzles

**Priority:** High - puzzle is currently unsolvable without prior knowledge

---

## Terminal Implementation Issues (Feb 2026)

### Root Problem
CLH-031 uses its own inline terminal implementation (~3000+ lines) instead of the tested CLHTerminal.js component that all other CLH modules use.

### Issues Found

1. **Case Sensitivity Bug**
   - `processCmd(cmd.toLowerCase())` lowercased entire command including paths
   - Tab complete showed `Documents`, but Enter executed `documents`
   - `ls Documents` → `ls documents` → "No such file"
   - **Fixed:** Removed `.toLowerCase()` from line 3027

2. **Tab Completion Bugs**
   - `data` appeared as option in home directory (shouldn't exist there)
   - Empty partial (`ls ` + Tab) triggered "add slash" logic, changing input to `ls /`
   - Root path `/` created `completionBase = '//'` causing `//data/` paths
   - Multiple patch attempts made

3. **Fake cd Command**
   - `cd` command was a stub - just printed empty output
   - No actual directory tracking (`const CWD = '/home/operator'` was constant)
   - `pwd` always showed `/home/operator` regardless of cd commands

4. **Inconsistent Filesystem**
   - `COMPLETION_PATHS` defined for tab completion
   - `validDirs` defined separately for ls command
   - No unified filesystem structure
   - File contents hardcoded in cat command handlers

### Solution: Refactor to Use CLHTerminal.js

**Phase 1: Define Filesystem in CLHConfig.js** ✅ COMPLETE
- Added full filesystem structure to CLH-031 config
- Includes: /home/operator, /data/ops, /var/log, /etc, etc.
- All files have proper content, permissions, ownership
- Remote hosts defined for SSH to prometheus

**Phase 2: Refactor CLH-031 to Use CLHTerminal.js** 🔄 IN PROGRESS
- Replace inline terminal with CLHTerminal instantiation
- Add script includes for CLHConfig.js and CLHTerminal.js
- Hook game logic (SPECTER AI, puzzles) into CLHTerminal callbacks:
  - `onCommand` → Feed to SPECTER AI, check objectives
  - `onObjectiveComplete` → Update mission UI, trigger events
  - `onModuleComplete` → Victory sequence
- Keep visual elements (network map, patch panel, firewall UI)

**Phase 3: Testing**
- Verify all terminal commands work correctly
- Test cd, ls, pwd, cat with proper case sensitivity
- Test tab completion
- Test SPECTER AI integration
- Test puzzle triggers

### Files Modified

| File | Change |
|------|--------|
| `CLHConfig.js` | Added filesystem for CLH-031 (~300 lines) |
| `clh-031-blackout.html` | Pending refactor to use CLHTerminal.js |

### Filesystem Structure Added

```
/
├── home/
│   ├── operator/          # Player home (startDir)
│   │   ├── Documents/     # Empty
│   │   ├── Downloads/     # Empty
│   │   ├── .ssh/          # SSH keys
│   │   ├── intel.classified
│   │   └── mission_notes.txt
│   ├── specter/           # Hostile user
│   │   ├── .hidden/       # Backdoor scripts
│   │   └── plans.txt
│   └── admin/
├── data/
│   ├── ops/               # Mission critical
│   │   ├── mission_intel.classified  # Main objective
│   │   ├── targets.list
│   │   └── creds.enc
│   ├── logs/
│   └── backups/
├── var/
│   └── log/
│       ├── auth.log       # SSH attempts, SPECTER activity
│       ├── syslog
│       └── ...
├── etc/
│   ├── passwd
│   ├── shadow
│   ├── hosts
│   └── ssh/
└── tmp/, opt/, usr/
```

---

*Updated: 2026-02-01*
