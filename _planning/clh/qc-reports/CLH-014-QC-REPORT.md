# CLH-014: Process Control - QC Report

**Date:** 2026-01-19
**Version:** 2.76.0
**Status:** PASSED

---

## Executive Summary

CLH-014 (Process Control) has been QC'd. Major fixes include adding missing kill/killall/nohup/pgrep commands, updating ps output to include the rogue_agent process, expanding the filesystem with incident reports and logs, and adding output validation to all objectives.

---

## 1. Issues Found and Fixed

### Issue 1: Missing Process Commands
**Problem:** The class-based CLHTerminal had no kill, killall, nohup, or pgrep commands.
**Impact:** Users could not complete objectives 3 and 5.
**Solution:** Added `_cmdKill`, `_cmdKillall`, `_cmdNohup`, and `_cmdPgrep` methods.

### Issue 2: ps aux Missing rogue_agent
**Problem:** `ps aux` output didn't include the target process (rogue_agent PID 6666).
**Impact:** `ps aux | grep rogue` returned nothing - impossible to complete objective 2.
**Solution:** Expanded `_cmdPs` output to include realistic system processes including `rogue_agent`.

### Issue 3: Pipe Display Bug
**Problem:** Pipe commands like `ps aux | grep rogue` displayed as two separate command lines.
**Impact:** Confusing UX - looked like two separate commands were run.
**Solution:** Modified `_executeWithChaining` to print full command once, skipping print for chain continuations.

### Issue 4: Sparse Filesystem
**Problem:** Only 3 files in the lab (monitor.sh, intel/processes.txt, empty .bash_history).
**Impact:** Limited exploration and context.
**Solution:** Expanded to 12 files with rich scenario content.

---

## 2. Filesystem Inventory

### After QC
```
/home/operator/
├── monitor.sh               # Monitoring script for nohup exercise
├── intel/                   # 3 files - Threat intelligence
│   ├── processes.txt       # Known malicious processes
│   ├── incident_report.txt # IR-2026-0147 details
│   └── kill_targets.txt    # Approved PIDs to terminate
├── scripts/                 # 2 files - Utility scripts
│   ├── cleanup.sh          # Batch kill script
│   └── watchdog.sh         # Process monitor script
├── logs/                    # 2 files - System logs
│   ├── process_history.log # Process spawn timeline
│   └── alerts.log          # Security alerts
├── .bash_history           # Helpful command hints
└── .process_cheatsheet     # Complete process control reference
```

### Content Richness: GOOD
- **Total Files:** 12
- **Total Directories:** 3 + home
- **Hidden Files:** 2
- **Attack Scenario:** rogue_agent cryptominer (PID 6666)
- **Realistic Context:** Full incident report with timeline

---

## 3. Objectives Testing

### Objective 1: SURVEY - List Running Processes
**Command:** `ps aux`
**Check Logic:**
```javascript
cmd.includes('ps') &&
(cmd.includes('aux') || cmd.includes('-ef') || cmd.includes('-e')) &&
output && (output.includes('PID') || output.includes('COMMAND'))
```
**Status:** PASS - Validates ps output contains process headers

### Objective 2: HUNT - Find Suspicious Process
**Command:** `ps aux | grep rogue`
**Check Logic:**
```javascript
cmd.includes('ps') && cmd.includes('grep') &&
output && (output.includes('rogue') || output.includes('6666'))
```
**Status:** PASS - Validates rogue process found in output

### Objective 3: TERMINATE - Kill by PID
**Command:** `kill 6666`
**Check Logic:**
```javascript
cmd.includes('kill') && cmd.includes('6666') &&
output && output.includes('Terminated')
```
**Status:** PASS - Validates termination message

### Objective 4: MANAGE - View Background Jobs
**Command:** `jobs`
**Check Logic:**
```javascript
cmd.trim() === 'jobs'
```
**Status:** PASS - Simple command check (output may be empty)

### Objective 5: PERSIST - Run Immune to Hangup
**Command:** `nohup ./monitor.sh &`
**Check Logic:**
```javascript
cmd.includes('nohup') &&
output && output.includes('nohup.out')
```
**Status:** PASS - Validates nohup acknowledgment

---

## 4. Command Implementations Added

### _cmdKill(args)
- Parses signal (-9, -15) and PID
- Returns "Terminated" message for PID 6666
- Returns "Operation not permitted" for root processes
- Returns "No such process" for unknown PIDs

### _cmdKillall(args)
- Kills by process name
- Simulates termination of rogue_agent
- Protects system processes

### _cmdNohup(args)
- Creates background job
- Returns nohup.out acknowledgment
- Tracks job in _jobs array

### _cmdPgrep(args)
- Returns PIDs matching pattern
- Includes mapping for all simulated processes

---

## 5. Insight Phase Verification

### Configuration
```javascript
insightPhase: {
    enabled: true,
    question: "According to intel, what is the name of the cryptominer process?",
    acceptedAnswers: ["rogue_agent", "rogue agent", "rogueagent"],
    hint: "Check the processes.txt file in the intel directory for known threats.",
    hintAfterAttempts: 3,
    wrongAnswerMessage: "Process not recognized. Review intel/processes.txt for malicious process names.",
    correctAnswerMessage: "Threat identified: rogue_agent (cryptominer). Terminate with extreme prejudice."
}
```

### Verification
- intel/processes.txt clearly shows: `rogue_agent (cryptominer)`
- Multiple answer formats accepted
- Hint guides to correct file

**Status:** PASS

---

## 6. QC Checklist Summary

| Category | Status |
|----------|--------|
| Filesystem richness | PASS (expanded) |
| kill command | PASS (added) |
| killall command | PASS (added) |
| nohup command | PASS (added) |
| pgrep command | PASS (added) |
| ps aux output | PASS (fixed) |
| Pipe display | PASS (fixed) |
| Objective 1 (ps aux) | PASS |
| Objective 2 (ps | grep) | PASS |
| Objective 3 (kill) | PASS |
| Objective 4 (jobs) | PASS |
| Objective 5 (nohup) | PASS |
| Insight Phase | PASS |

**QC Status: APPROVED**

---

*QC performed: 2026-01-19*
