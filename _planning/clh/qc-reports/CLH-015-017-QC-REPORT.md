# CLH-015 to CLH-017 QC Report

**Date:** 2026-01-19
**Version:** 2.77.0
**Status:** ALL PASSED

---

## Summary

Three labs (CLH-015 Capstone Mission, CLH-016 System Intel, CLH-017 Find & Locate) have been QC'd. All received expanded filesystems, helpful .bash_history content, hidden cheatsheets, and output validation on objectives.

---

## CLH-015: Capstone Mission

### Additions
- `mission_brief.txt` - Operation Shadowstrike briefing
- `.bash_history` - Helpful command hints
- `.investigation_cheatsheet` - Complete incident response reference

### Objective Validation
All 5 objectives now validate output:
1. Initial Recon: Checks for `access.log` in output
2. Log Analysis: Checks for `POST` in output
3. Extract IPs: Checks for `10.0.0.88` in output
4. Exfiltration: Checks for `TRANSFER` or `bytes` in output
5. Generate Report: Checks for `Redirected` message

**Status: PASS**

---

## CLH-016: System Intel

### Additions
- `.bash_history` - System profiling command hints
- `.sysinfo_cheatsheet` - Architecture, CPU, memory, disk reference
- `intel/targets.list` - High value target locations
- `tools/recon.sh` - Automated profiling script

### Objective Validation
All 5 objectives now validate output:
1. uname -a: Checks for `Linux` in output
2. lscpu: Checks for `CPU` in output
3. free -h: Checks for `Mem` in output
4. df -h: Checks for `Filesystem` in output
5. du -sh /home: Checks for numeric output

**Status: PASS**

---

## CLH-017: Find & Locate

### Additions
- `.bash_history` - Find command hints
- `.find_cheatsheet` - Complete find/locate reference
- `toolkit/scanner.sh` - Automated threat hunting script
- `reports/README.txt` - Output save instructions

### Objective Validation
All 5 objectives now validate output:
1. Hidden dot-files: Checks for `.` or `No matches`
2. SUID backdoors: Checks for `rws` or `/`
3. Temp directory: Checks for `/tmp` or `beacon`
4. Recent modifications: Command check only
5. Binary locations: Checks for `/` in output

**Status: PASS**

---

## QC Checklist Summary

| Lab | Filesystem | Cheatsheet | .bash_history | Output Validation | Insight Phase |
|-----|------------|------------|---------------|-------------------|---------------|
| CLH-015 | EXPANDED | ADDED | ADDED | ALL 5 | PASS |
| CLH-016 | EXPANDED | ADDED | ADDED | ALL 5 | PASS |
| CLH-017 | EXPANDED | ADDED | ADDED | ALL 5 | PASS |

---

*QC performed: 2026-01-19*
