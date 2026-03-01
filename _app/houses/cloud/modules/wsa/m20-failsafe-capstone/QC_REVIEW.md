# WSA Capstone QC Review: FAILSAFE

**Module:** WSA M20 — FAILSAFE Capstone
**Location:** `houses/cloud/modules/wsa/m20-failsafe-capstone/`
**Type:** Interactive disaster recovery simulation
**Prerequisite:** WSA M19 (Troubleshooting)

---

## File Inventory

| File | Lines | Purpose |
|------|-------|---------|
| `index.html` | 620 | Briefing page — scenario overview, grading rubric, mission objectives |
| `cloud-simulation.module.html` | 1,944 | Main simulation — terminal, GUI, 44 objectives across 8 phases |
| `../progress.js` | 275 | WSAProgress tracking API (shared across all WSA modules) |

---

## Incident Scenario

- **Event:** DC02 catastrophic RAID controller failure at 02:47 AM
- **Incident ID:** INC-2026-0131-001 (Priority P1)
- **Environment:** Two-DC Active Directory domain (DC01 + DC02)
- **Impact:** AD replication failed, DNS/DHCP services degraded, FSMO roles orphaned
- **Mission:** Full disaster recovery — assess, recover, verify, document

---

## Objective Structure (44 Total)

### Phase 1: Assessment (6 objectives: a1-a6)

| ID | Objective | Validation |
|----|-----------|------------|
| a1 | Run DC diagnostics on DC01 | Button click triggers `dcdiag` output |
| a2 | Check AD replication status | Button click triggers `repadmin` output |
| a3 | Identify FSMO role holders | Button click shows FSMO distribution |
| a4 | Review Event Viewer logs | Button click populates event log tab |
| a5 | Assess DNS service health | Button click checks DNS status |
| a6 | Assess DHCP service health | Button click checks DHCP status |

### Phase 2: Backup & Deployment (5 objectives: b1-b5)

| ID | Objective | Validation |
|----|-----------|------------|
| b1 | Review available backups | Button click shows backup inventory |
| b2 | Select backup with rationale | **Answer key below** |
| b3 | Verify backup integrity | Button click runs verification |
| b4 | Configure replacement server | **Answer key below** |
| b5 | Deploy DC02-NEW | Button click deploys server |

### Phase 3: AD Recovery (6 objectives: r1-r6)

| ID | Objective | Validation |
|----|-----------|------------|
| r1 | Seize orphaned FSMO roles | Button click |
| r2 | Perform AD metadata cleanup | Button click |
| r3 | Promote DC02-NEW to domain controller | Button click |
| r4 | Verify AD database replication | Button click |
| r5 | Transfer FSMO roles to DC02-NEW | Button click |
| r6 | Verify NTDS service health | Button click |

### Phase 4: DNS Recovery (6 objectives: n1-n6)

| ID | Objective | Validation |
|----|-----------|------------|
| n1 | Remove stale DNS records | Button click |
| n2 | Verify SRV records in _msdcs | Button click |
| n3 | Create reverse lookup entry | Button click |
| n4 | Configure DNS forwarders | Button click |
| n5 | Test internal name resolution | Button click |
| n6 | Verify DNS zone replication | Button click |

### Phase 5: DHCP Recovery (5 objectives: h1-h5)

| ID | Objective | Validation |
|----|-----------|------------|
| h1 | Review DHCP scope configuration | Button click |
| h2 | Configure DHCP failover | Button click |
| h3 | Verify lease allocation | Button click |
| h4 | Update DHCP scope options | Button click |
| h5 | Test DHCP functionality | Button click |

### Phase 6: Sites & Group Policy (6 objectives: s1-s6)

| ID | Objective | Validation |
|----|-----------|------------|
| s1 | Review AD Sites topology | Button click |
| s2 | Update site membership | Button click |
| s3 | Verify site link configuration | Button click |
| s4 | Check GPO replication status | Button click |
| s5 | Verify SYSVOL replication | Button click |
| s6 | Test Group Policy application | Button click |

### Phase 7: Verification (5 objectives: v1-v5)

| ID | Objective | Validation |
|----|-----------|------------|
| v1 | Run final DC diagnostics | Button click |
| v2 | Test user authentication | Button click |
| v3 | Verify all FSMO roles assigned | Button click |
| v4 | Confirm service health | Button click |
| v5 | Generate verification report | Button click |

### Phase 8: Documentation (5 objectives: d1-d5)

| ID | Objective | Validation |
|----|-----------|------------|
| d1 | Document incident timeline | Min 150 characters |
| d2 | Record recovery actions | Min 150 characters |
| d3 | Identify root cause | Min 100 characters |
| d4 | Propose preventive measures | Min 100 characters |
| d5 | Submit incident report | All 4 sections saved + submit click |

---

## Answer Keys & Validation Rules

### b2 — Backup Selection Rationale

| Backup Type | Correct Rationale | Rationale ID |
|-------------|-------------------|--------------|
| System State | "System State contains AD database, SYSVOL, and registry needed for DC recovery" | `correct-ss` |
| Full Backup | "Full backup contains all server data for complete restoration" | `correct-full` |

**Wrong answers:**
- `wrong-recent` — "Recency alone does not determine backup suitability"
- `wrong-size` — "Size is not a valid technical rationale"

Validation logic:
```javascript
(backup === 'systemstate' && rationale === 'correct-ss') ||
(backup === 'full' && rationale === 'correct-full')
```

### b4 — Server Configuration

| Field | Required Value |
|-------|---------------|
| IP Address | `192.168.1.12` |
| Subnet Mask | `255.255.255.0` |
| Default Gateway | `192.168.1.1` |
| Primary DNS | `192.168.1.10` (DC01) |

Validation: Direct string comparison (not regex).

### d1-d4 — Documentation Sections

| Section | Min Length | Notes |
|---------|-----------|-------|
| Incident Timeline (d1) | 150 chars | No keyword validation |
| Recovery Actions (d2) | 150 chars | No keyword validation |
| Root Cause (d3) | 100 chars | Briefing says "must mention failure type" but **no keyword detection in code** |
| Prevention (d4) | 100 chars | No keyword validation |

---

## Grading Rubric (Briefing Page)

| Component | Weight | Requirements |
|-----------|--------|--------------|
| Assessment Accuracy | 15% | Correctly identify all affected systems and available backups |
| Recovery Execution | 35% | Successfully restore DC and AD functionality |
| Verification Completeness | 20% | All services tested and confirmed operational |
| Cleanup & Prevention | 15% | Orphaned objects removed, preventive measures implemented |
| Documentation Quality | 15% | Complete, accurate, and professional incident report |

**Note:** The rubric is displayed for context but **actual scoring is binary pass/fail** — 44/44 objectives completed = pass. No weighted scoring is implemented in code.

---

## Scoring & Completion

- **Pass condition:** All 44 objectives completed
- **Score display:** Elapsed time in minutes (e.g., "25m")
- **No partial credit** — binary pass/fail
- **No time limit** (elapsed time displayed but not enforced)

Completion triggers:
```javascript
WSAProgress.markComplete('capstone', 'guiLab', {
    completed: true,
    objectives: 44,
    elapsed: elapsedSeconds,
    timestamp: Date.now()
});
```

---

## State Persistence

| Key | Purpose |
|-----|---------|
| `wsa-failsafe-capstone` | localStorage session state |
| `wsa-failsafe-capstone-sync` | Firestore cloud sync (StateFederation) |

**Saved state includes:** recoveryState (18 flags), completedObjectives array, terminalLines (last 500), commandHistory (last 200), docSections (4 textareas), startedAt timestamp.

**Resume:** On load, shows modal with `N/44 objectives completed` and option to resume or start fresh.

---

## Terminal Simulator

Supports ~20 simulated PowerShell commands:

| Command | Purpose |
|---------|---------|
| `dcdiag` | DC diagnostics |
| `repadmin /replsum` | Replication summary |
| `netdom query fsmo` | FSMO role query |
| `nslookup` | DNS lookup |
| `Get-DhcpServerv4Scope` | DHCP scope info |
| `Get-DhcpServerv4Failover` | DHCP failover status |
| `Get-GPO -All` | Group Policy objects |
| `Get-ADReplicationSite` | AD Sites topology |
| `help` | List available commands |

Commands return simulated output (not live PowerShell).

---

## Platform Integration

**ContentCatalog.js:**
- ID: `wsa-m20-capstone`
- House: `cloud`
- Category: `wsa`

**LearningPaths.js:**
- Prerequisites: `wsa-m19-troubleshooting`
- Path: WSA certification track (final module)

**Progress:**
- `WSAProgress.markComplete('capstone', 'guiLab', metadata)`
- Special module: completes with ANY component done (not 4/4 like regular modules)

**Access Control:**
- `AccessGuard.require('sorted')` — requires authenticated + sorted status

---

## Event Log Data (Embedded in Simulation)

### System Events

| Time | Source | Level | Message |
|------|--------|-------|---------|
| 02:47:12 | Disk | Critical | Disk controller error on \\Device\\Harddisk1\\DR1 |
| 02:47:15 | NTDS | Error | Replication with DC02 failed |
| 02:48:00 | DNS | Error | DNS record registration for DC02 failed |
| 02:50:30 | DFSR | Warning | SYSVOL replication incomplete |
| 02:51:00 | DNS | Warning | Zone transfer to DC02 failed |
| 02:52:00 | DHCP | Error | DHCP failover partner DC02 unreachable |
| 03:00:00 | System | Info | System uptime: 47 days, 3 hours |

### Directory Events (7 entries)

- NTDS KCC replication link failed
- Partition replication from DC02 failed (RPC error)
- FSMO role holder DC02 cannot be contacted
- Database recovery for DC02 failed

### Application Events (3 entries)

- DNS unable to contact DC02
- DHCP failover state: PARTNER DOWN
- Windows Backup completed successfully

---

## QC Issues Found

### 1. Documentation Validation Gap (Medium)

**Issue:** Root Cause section (d3) briefing says "must mention the failure type" but no keyword detection exists in code. Students can submit any 100+ character string.

**Impact:** Students could pass without demonstrating root cause understanding.

**Recommendation:** Add keyword validation — require at least one of: `RAID`, `disk`, `controller`, `hardware`, `failure`.

### 2. Rubric vs. Implementation Mismatch (Low)

**Issue:** Briefing displays a 5-component weighted rubric (15%/35%/20%/15%/15%) but actual scoring is binary pass/fail on 44/44 objectives. No weighted scoring exists.

**Impact:** Misleading for students who may expect partial credit.

**Recommendation:** Either implement weighted scoring or remove/clarify the rubric on the briefing page.

### 3. Most Objectives Are Button-Click Only (Low)

**Issue:** 36 of 44 objectives complete on button click with no input validation. Only b2 (backup rationale), b4 (server config), and d1-d4 (documentation) require student input.

**Impact:** Students can click through phases without demonstrating understanding.

**Recommendation:** Acceptable for v1 — the simulation teaches process flow. Consider adding command-based validation in future iterations.

---

## QC Testing Checklist

- [ ] All 44 objectives can be completed in sequence
- [ ] Backup rationale validates correct/incorrect answers (b2)
- [ ] Server config validates all 4 fields correctly (b4)
- [ ] Documentation minimum lengths enforced (d1-d4)
- [ ] Completion overlay shows elapsed time correctly
- [ ] Resume modal appears with saved progress
- [ ] Terminal responds to all documented commands
- [ ] `help` command lists available commands
- [ ] Prerequisite blocking works (requires M19)
- [ ] AccessGuard blocks unauthenticated users
- [ ] StateFederation syncs to Firestore
- [ ] Progress recorded to WSAProgress.capstone.guiLab
- [ ] Cross-device resume works via sync key
- [ ] Phase indicators update as objectives complete
- [ ] Progress bar reflects N/44 completion
