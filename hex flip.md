# Hex Flip - Hexworth Prime Restoration Plan

**Created:** January 10, 2026
**Purpose:** Merge full backup with current work without losing recent changes

---

## IMPORTANT: ASK PERMISSION BEFORE EACH PHASE

**Do NOT proceed to the next phase without explicit user approval.**
After completing each phase, report findings and wait for "proceed" or similar confirmation.

---

## Critical Warnings

1. **BACKUP'S EYE HOUSE IS OLDER** - Ignore/skip eye house in backup. Our safeguarded version is the only correct one.

2. **SOC SIMULATOR VERIFICATION** - Correct file is 233KB. If smaller, it's the wrong version.

3. **CYBEROPS NEVER IN GIT** - The cyberops content was never committed to git. Our safeguard + Firebase deployment are the only sources of truth.

4. **PATH HAS SPACES** - Use quotes: `"Test imports/"` in all commands.

5. **SPELL-060 UPDATED** - `_spellbook/spells/SPELL-060-SOC-TRIAGE-SIMULATOR.md` has Phase 2 documentation. Verify it's preserved.

---

## Current Situation

### Local Disk State
- `_app/houses/eye/` - **CURRENT/COMPLETE** (104 files including SOC simulator with Phase 2 edits)
- `_app/houses/cloud/` - MISSING
- `_app/houses/code/` - MISSING
- `_app/houses/forge/` - MISSING
- `_app/houses/shield/` - MISSING
- `_app/houses/web/` - MISSING
- `_app/houses/script/` - MISSING
- `_app/houses/key/` - MISSING
- `_app/dark-arts/` - MISSING
- `_app/dashboard.html` - MISSING
- `_app/connect.html` - MISSING
- `_app/terminal.html` - MISSING
- `_app/sorting.html` - MISSING
- Most `_app/components/` - MISSING

### Safeguarded Content
Location: `/home/eq/Ai content creation/Hexworth Prime/safeguard/`

1. `eye-complete-backup/` - Full eye house (104 files)
   - All cyberops weeks 1-5
   - SOC triage simulator (233KB) with Phase 2 interactive edits
   - All applets, labs, presentations, quizzes, tools

2. `soc-triage-simulator.html` - Redundant copy (also in eye backup)

### Backup File
- **Name:** `Hexworth-Prime-Full-Backup-20260109.zip`
- **Location:** `/home/eq/Ai content creation/Hexworth Prime/Test imports/`
- **Date:** Zipped January 9, 2026 (last night)
- **Contains:** Full Hexworth Prime from other device
- **WARNING:** Eye house in backup is OLDER than our safeguarded version - DO NOT USE IT

---

## The Plan

### Phase 1: Extract Backup (DO NOT OVERWRITE)
**ASK PERMISSION BEFORE STARTING**

```bash
# Extract to temporary comparison folder - note the quotes for spaces
unzip "/home/eq/Ai content creation/Hexworth Prime/Test imports/Hexworth-Prime-Full-Backup-20260109.zip" -d "/home/eq/Ai content creation/Hexworth Prime/Test imports/backup-extracted/"
```

Report: What was extracted, folder structure, file counts.
**STOP AND WAIT FOR PERMISSION TO PROCEED**

---

### Phase 2: Compare and Identify Conflicts
**ASK PERMISSION BEFORE STARTING**

1. List what's in the extracted backup
2. Count files per house in backup
3. Compare backup's eye house vs our safeguarded eye house (confirm ours is newer/more complete)
4. Check if backup has SPELL-060 and compare dates
5. Identify any files in backup that might be newer than local

Report: Comparison findings, any conflicts, recommendation.
**STOP AND WAIT FOR PERMISSION TO PROCEED**

---

### Phase 3: Execute Merge
**ASK PERMISSION BEFORE STARTING**

**Keep from LOCAL (safeguard):**
- `_app/houses/eye/` - Our version is definitive (has SOC simulator edits + full cyberops)

**Take from BACKUP:**
- `_app/houses/cloud/`
- `_app/houses/code/`
- `_app/houses/forge/`
- `_app/houses/shield/`
- `_app/houses/web/`
- `_app/houses/script/`
- `_app/houses/key/`
- `_app/dark-arts/`
- `_app/dashboard.html`
- `_app/connect.html`
- `_app/terminal.html`
- `_app/sorting.html`
- `_app/components/`
- `_app/admin/`
- `_app/docs/`
- `_app/tools/`
- Any other missing content

**Execution steps:**
1. Copy all houses EXCEPT eye from backup to `_app/houses/`
2. Copy dark-arts, components, admin, docs, tools from backup
3. Copy standalone HTML files (dashboard, connect, etc.)
4. Confirm eye house is still our version (104 files, SOC sim = 233KB)

Report: What was copied, file counts.
**STOP AND WAIT FOR PERMISSION TO PROCEED**

---

### Phase 4: Verify
**ASK PERMISSION BEFORE STARTING**

1. Count files in each house
2. Confirm SOC simulator has our edits (must be 233KB with Phase 2 features)
3. Confirm SPELL-060 has Phase 2 documentation
4. List total files in `_app/`
5. Compare against what git expects

Report: Verification results, any issues found.
**STOP AND WAIT FOR PERMISSION TO PROCEED**

---

### Phase 5: Cleanup and Deploy
**ASK PERMISSION BEFORE STARTING**

1. Delete `safeguard/` folder (only after verification approved)
2. Delete extracted backup folder
3. Optional: git commit of restored state
4. Deploy to Firebase: `firebase deploy`
5. Verify live site

---

## Critical Files - DO NOT OVERWRITE

| File | Reason | Verification |
|------|--------|--------------|
| `_app/houses/eye/*` | Contains Phase 2 SOC simulator + full cyberops | 104 files |
| `_app/houses/eye/applets/cyberops/week5/labs/soc-triage-simulator.html` | Phase 2 interactive features | 233KB |
| `safeguard/eye-complete-backup/` | Backup of above | 104 files |
| `_spellbook/spells/SPELL-060-SOC-TRIAGE-SIMULATOR.md` | Updated with Phase 2 docs | Check for "Phase 2 Implementation - COMPLETE" |

---

## Rollback Plan

If something goes wrong:
1. Eye house is in `safeguard/eye-complete-backup/`
2. Full backup zip is untouched in `Test imports/`
3. Git history has pre-cyberops content (but NOT cyberops itself)

---

## Notes

- Eye house has 104 files including cyberops weeks 1-5
- SOC simulator is 233KB with all Phase 2 interactive features (logs, network, EDR, asset tabs with click-to-flag)
- Backup is from Jan 9 (last night) - eye house in backup is older/incomplete
- Cyberops content was NEVER committed to git - only exists in safeguard and Firebase
- Firebase deployment: `firebase deploy` pushes `_app/` folder to live site
