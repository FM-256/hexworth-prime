# Command Line Hacker (CLH) Consolidation Plan

**Course:** Command Line Hacker
**House:** Script
**Status:** CONSOLIDATION REQUIRED - Content scattered across multiple directories
**Total Modules:** 31 (CLH-001 through CLH-031)
**Tags:** Linux, CLI, Command Line, Bash, Terminal, Hacking

---

## Current State Assessment

### Problem
CLH content exists but is **scattered across multiple directories**. Each module has pieces in different locations:
- Intros/quizzes in one folder
- Interactive labs in another folder
- Components separate

### Current Content Locations

| Content Type | Location | Count |
|--------------|----------|-------|
| Intros & Quizzes | `houses/script/clh/` | 60 files |
| Interactive Labs | `houses/script/applets/linux/` | 31+ files |
| Core Components | `components/` | 3 files |
| Config (filesystems, objectives) | `components/CLHConfig.js` | 1 file |
| Terminal Engine | `components/CLHTerminal.js` | 1 file |

### Content Inventory by Module

| Module | Intro | Quiz | Lab | Status |
|--------|-------|------|-----|--------|
| CLH-001 | ✅ `clh/clh-001-intro.html` | ✅ `clh/clh-001-quiz.html` | ✅ `applets/linux/clh-001-intro-to-hacker-cli.html` | Complete |
| CLH-002 | ✅ | ✅ | ✅ `clh-002-navigation-recon.html` | Complete |
| CLH-003 | ✅ | ✅ | ✅ `clh-003-pattern-hunting.html` | Complete |
| CLH-004 | ✅ | ✅ | ✅ `clh-004-process-investigation.html` | Complete |
| CLH-005 | ✅ | ✅ | ✅ `clh-005-log-analysis.html` | Complete |
| CLH-006 | ✅ | ✅ | ✅ `clh-006-file-operations.html` | Complete |
| CLH-007 | ✅ | ✅ | ✅ `clh-007-permissions.html` | Complete |
| CLH-008 | ✅ | ✅ | ✅ `clh-008-shell-scripting.html` | Complete |
| CLH-009 | ✅ | ✅ | ✅ `clh-009-text-processing.html` | Complete |
| CLH-010 | ✅ | ✅ | ✅ `clh-010-io-redirection.html` | Complete |
| CLH-011 | ✅ | ✅ | ✅ `clh-011-advanced-grep.html` | Complete |
| CLH-012 | ✅ | ✅ | ✅ `clh-012-network-basics.html` | Complete |
| CLH-013 | ✅ | ✅ | ✅ `clh-013-environment.html` | Complete |
| CLH-014 | ✅ | ✅ | ✅ `clh-014-process-control.html` | Complete |
| CLH-015 | ✅ | ✅ | ✅ `clh-015-capstone.html` | Complete |
| CLH-016 | ✅ | ✅ | ✅ `clh-016-system-intel.html` | Complete |
| CLH-017 | ✅ | ✅ | ✅ `clh-017-find-locate.html` | Complete |
| CLH-018 | ✅ | ✅ | ✅ `clh-018-archive-ops.html` | Complete |
| CLH-019 | ✅ | ✅ | ✅ `clh-019-disk-forensics.html` | Complete |
| CLH-020 | ✅ | ✅ | ✅ `clh-020-user-recon.html` | Complete |
| CLH-021 | ✅ | ✅ | ✅ `clh-021-ssh-ops.html` | Complete |
| CLH-022 | ✅ | ✅ | ✅ `clh-022-network-recon.html` | Complete |
| CLH-023 | ✅ | ✅ | ✅ `clh-023-services.html` | Complete |
| CLH-024 | ✅ | ✅ | ✅ `clh-024-cron.html` | Complete |
| CLH-025 | ✅ | ✅ | ✅ `clh-025-packages.html` | Complete |
| CLH-026 | ✅ | ✅ | ✅ `clh-026-access.html` | Complete |
| CLH-027 | ✅ | ✅ | ✅ `clh-027-users.html` | Complete |
| CLH-028 | ✅ | ✅ | ✅ `clh-028-monitoring.html` | Complete |
| CLH-029 | ✅ | ✅ | ✅ `clh-029-vim.html` | Complete |
| CLH-030 | ✅ | ✅ | ✅ `clh-030-chimera.html` | Complete |
| CLH-031 | ⬜ | ⬜ | ✅ `clh-031-blackout.html` | Lab only |

### Other Linux Content in `applets/linux/`

| File | Purpose | Keep in Linux? |
|------|---------|----------------|
| `bash-scripting-playground.html` | General bash playground | YES |
| `command-translator.html` | Command help tool | YES |
| `lab-macos-linux.html` | macOS/Linux comparison | MOVE to Forge? |
| `linux-command-simulator.html` | General simulator | YES |
| `linux-filesystem-navigator.html` | Filesystem explorer | YES |
| `linux-lab-001-user-identity.html` | Standalone lab | Keep or merge |
| `linux-lab-002-file-navigation.html` | Standalone lab | Keep or merge |
| `linux-permissions-calculator.html` | Permissions tool | YES |
| `ubuntu-components.html` | Ubuntu reference | YES |

---

## Target Scaffolding Structure

```
_app/houses/script/courses/clh/
├── index.html                          ← CLH course landing page
├── modules/
│   ├── clh-001/
│   │   ├── intro.html                  ← MOVE from clh/clh-001-intro.html
│   │   ├── lab.html                    ← MOVE from applets/linux/clh-001-*.html
│   │   └── quiz.html                   ← MOVE from clh/clh-001-quiz.html
│   ├── clh-002/
│   │   ├── intro.html
│   │   ├── lab.html
│   │   └── quiz.html
│   ├── ... (through clh-031)
│   └── clh-031/
│       ├── intro.html                  ← NEW (doesn't exist)
│       ├── lab.html                    ← MOVE from applets/linux/clh-031-blackout.html
│       └── quiz.html                   ← NEW (doesn't exist)
├── tiers/
│   ├── cli-recruit.html                ← CLH 001-003
│   ├── cli-analyst.html                ← CLH 004-006
│   ├── cli-operative.html              ← CLH 007-009
│   ├── cli-shadow.html                 ← CLH 010-012
│   ├── cli-phantom.html                ← CLH 013-015
│   ├── cli-specter.html                ← CLH 016-022
│   ├── cli-wraith.html                 ← CLH 023-027
│   ├── cli-ghost.html                  ← CLH 028-030
│   └── cli-master.html                 ← CLH-031 + all complete
├── reference/
│   ├── command-cheatsheet.html         ← Quick reference
│   ├── bash-scripting-guide.html       ← From playground
│   └── troubleshooting.html            ← Common issues
└── assets/
    └── (any module-specific assets)
```

### Component Organization (No Change Needed)

Components stay in `_app/components/`:
- `CLHTerminal.js` - Terminal engine
- `CLHConfig.js` - Module configurations
- `CLHCompletionModal.js` - Completion flow

These are shared components used by all CLH modules - consolidating content doesn't require moving these.

---

## Module Curriculum

### Tier 1: CLI Recruit (CLH-001 to CLH-003)
| Module | Title | Focus |
|--------|-------|-------|
| CLH-001 | Introduction to Hacker CLI | Terminal basics, first commands |
| CLH-002 | Navigation Recon | Directory navigation, pwd, cd, ls |
| CLH-003 | Pattern Hunting | grep basics, file searching |

### Tier 2: CLI Analyst (CLH-004 to CLH-006)
| Module | Title | Focus |
|--------|-------|-------|
| CLH-004 | Process Investigation | ps, top, process management |
| CLH-005 | Log Analysis | Log files, parsing, timestamps |
| CLH-006 | File Operations | cp, mv, rm, touch, file manipulation |

### Tier 3: CLI Operative (CLH-007 to CLH-009)
| Module | Title | Focus |
|--------|-------|-------|
| CLH-007 | Permissions | chmod, chown, permission model |
| CLH-008 | Shell Scripting | Bash scripts, variables, conditionals |
| CLH-009 | Text Processing | sed, awk, cut, sort |

### Tier 4: CLI Shadow (CLH-010 to CLH-012)
| Module | Title | Focus |
|--------|-------|-------|
| CLH-010 | I/O Redirection | Pipes, redirects, stdin/stdout |
| CLH-011 | Advanced Grep | Regex, grep options |
| CLH-012 | Network Basics | netstat, ss, ip commands |

### Tier 5: CLI Phantom (CLH-013 to CLH-015)
| Module | Title | Focus |
|--------|-------|-------|
| CLH-013 | Environment | Variables, PATH, .bashrc |
| CLH-014 | Process Control | jobs, fg, bg, signals |
| CLH-015 | Capstone I | Combined challenge |

### Tier 6: CLI Specter (CLH-016 to CLH-022)
| Module | Title | Focus |
|--------|-------|-------|
| CLH-016 | System Intel | System info gathering |
| CLH-017 | Find & Locate | find, locate, whereis |
| CLH-018 | Archive Ops | tar, gzip, compression |
| CLH-019 | Disk Forensics | df, du, disk analysis |
| CLH-020 | User Recon | User enumeration |
| CLH-021 | SSH Ops | SSH, keys, remote ops |
| CLH-022 | Network Recon | Network enumeration |

### Tier 7: CLI Wraith (CLH-023 to CLH-027)
| Module | Title | Focus |
|--------|-------|-------|
| CLH-023 | Services | systemctl, services |
| CLH-024 | Cron | Scheduled tasks |
| CLH-025 | Packages | Package management |
| CLH-026 | Access Control | ACLs, advanced permissions |
| CLH-027 | Users & Groups | User management |

### Tier 8: CLI Ghost (CLH-028 to CLH-030)
| Module | Title | Focus |
|--------|-------|-------|
| CLH-028 | Monitoring | System monitoring |
| CLH-029 | Vim Essentials | Vim editor |
| CLH-030 | Chimera | Multi-phase challenge |

### Tier 9: CLI Master (CLH-031)
| Module | Title | Focus |
|--------|-------|-------|
| CLH-031 | OPERATION BLACKOUT | Final exam (9 puzzles + finale) |

---

## Migration Checklist

### Phase 1: Create Scaffolding
- [ ] Create `courses/clh/` directory structure
- [ ] Create `courses/clh/index.html` landing page
- [ ] Create `modules/` directory with clh-001 through clh-031 subdirectories
- [ ] Create `tiers/` directory
- [ ] Create `reference/` directory

### Phase 2: Move Intros & Quizzes
- [ ] Move all `clh/clh-XXX-intro.html` → `courses/clh/modules/clh-XXX/intro.html`
- [ ] Move all `clh/clh-XXX-quiz.html` → `courses/clh/modules/clh-XXX/quiz.html`
- [ ] Total: 60 files

### Phase 3: Move Labs
- [ ] Move all `applets/linux/clh-XXX-*.html` → `courses/clh/modules/clh-XXX/lab.html`
- [ ] Rename to consistent `lab.html` naming
- [ ] Total: 31 files

### Phase 4: Create Missing Content
- [ ] Create CLH-031 intro.html
- [ ] Create CLH-031 quiz.html

### Phase 5: Create Tier Pages
- [ ] Create landing pages for each tier
- [ ] Link modules appropriately

### Phase 6: Update All References
- [ ] Update CLHConfig.js paths (if needed)
- [ ] Update ContentRegistry.js
- [ ] Update Script house index.html
- [ ] Update any cross-links between modules
- [ ] Update navigation within each module

### Phase 7: Handle Remaining Linux Content
- [ ] Keep general Linux tools in `applets/linux/`
- [ ] Move `lab-macos-linux.html` to Forge if A+ related
- [ ] Update house index to point to consolidated CLH

### Phase 8: QA/QC
- [ ] Test all module flows (intro → lab → quiz → next)
- [ ] Verify CLHTerminal loads correctly
- [ ] Verify objectives check off correctly
- [ ] Test completion flow
- [ ] Mobile responsive check

---

## Link Update Impact

### Files That Reference CLH Content

These files will need path updates after migration:

1. **Script House Index** (`houses/script/index.html`)
   - SAMPLE_MODULES array

2. **ContentRegistry.js**
   - CLH module registrations

3. **CLHConfig.js**
   - May have path references

4. **Each CLH Module**
   - Navigation links (next/prev)
   - Back to house links

5. **Achievement System**
   - CLH progress tracking references

---

## Alternative: Symlinks Approach

Instead of moving files, could use symlinks to maintain backwards compatibility:

```bash
# Example: Keep old paths working
ln -s courses/clh/modules/clh-001/intro.html clh/clh-001-intro.html
```

**Pros:** Old links still work
**Cons:** More complexity, confusing structure

**Recommendation:** Full migration with proper redirects if needed.

---

## Timeline Estimate

| Phase | Effort |
|-------|--------|
| Phase 1: Scaffolding | Quick |
| Phase 2: Move Intros/Quizzes | Medium (60 files) |
| Phase 3: Move Labs | Medium (31 files) |
| Phase 4: Missing Content | Quick |
| Phase 5: Tier Pages | Medium |
| Phase 6: Update References | Careful work |
| Phase 7: Cleanup | Quick |
| Phase 8: QA/QC | Thorough |

---

## Notes

- CLHTerminal.js and CLHConfig.js are already well-organized in `components/`
- The terminal engine is shared - no need to duplicate per module
- Achievement system (`AchievementManager.js`) tracks CLH progress - verify compatibility
- Solution documents exist in `_planning/SOLUTION_CLH-*.md` for reference

---

*Created: February 3, 2026*
*Last Updated: February 3, 2026*
