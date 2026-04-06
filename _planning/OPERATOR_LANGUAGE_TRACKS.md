# Operator Hub — Language Track Re-categorization

**Created:** 2026-04-06
**Status:** DRAFT (pending adversarial review)

---

## Current State

The hub has 2 tracks (TERMINAL + PYTHON) and 70 missions. The 20 terminal missions
span 8 different skill domains but are all labeled `mode: 'TERMINAL'`. This hides
the language diversity.

## Proposed Re-categorization

### Track: LINUX (8 missions)
Bash, Linux filesystem, CLI tools, log analysis, forensics toolchain.

| Mission | Current ID | Current Domain | Reassigned Mode |
|---------|-----------|---------------|----------------|
| Root Access | linux-fs-01 | linux-filesystem | LINUX |
| Root Hunt | linux-fs-02 | linux-filesystem | LINUX |
| Privilege Escalation | linux-fs-03 | linux-filesystem | LINUX |
| Signal Hunt | log-analysis-01 | log-analysis | LINUX |
| APT Tracker | log-analysis-02 | log-analysis | LINUX |
| Cold Case | forensics-01 | forensics | LINUX |
| Cloud Artifact | forensics-02 | forensics | LINUX |
| Insider Threat | forensics-03 | forensics | LINUX |

**Rationale:** All use Linux CLI tools (ls, cat, grep, find, strings, timeline).
Forensics tools (Autopsy, Volatility, strings) run on Linux. Log analysis is
grep/awk/sed territory. These are all Bash/Linux operations.

### Track: WINDOWS (2 missions)
Windows CMD and PowerShell, Windows admin tools.

| Mission | Current ID | Current Domain | Reassigned Mode |
|---------|-----------|---------------|----------------|
| Workstation Triage | windows-cmd-01 | windows-admin | WINDOWS |
| Blue Screen Protocol | windows-cmd-02 | windows-admin | WINDOWS |

**Future growth:** PowerShell missions (Get-Process, Get-NetTCPConnection,
Invoke-Command, Get-ADUser, etc.). This track should grow to 20+ missions
to match depth of other tracks.

### Track: NETWORKING (7 missions)
Network reconnaissance, firewall ops, incident response on network devices.

| Mission | Current ID | Current Domain | Reassigned Mode |
|---------|-----------|---------------|----------------|
| First Contact | recon-01 | network-recon | NETWORKING |
| Deep Sweep | recon-02 | network-recon | NETWORKING |
| Phantom Network | recon-03 | network-recon | NETWORKING |
| Perimeter Check | firewall-01 | firewall | NETWORKING |
| Zero Day Response | firewall-02 | firewall | NETWORKING |
| Breach Protocol | incident-response-01 | incident-response | NETWORKING |
| Ransomware Dawn | incident-response-02 | incident-response | NETWORKING |

**Note:** IR missions use network tools (isolate hosts, contain segments,
firewall rules). They're networking operations, not Linux or Windows specific.

### Track: CRYPTO (2 missions)
Cryptography and cipher operations.

| Mission | Current ID | Current Domain | Reassigned Mode |
|---------|-----------|---------------|----------------|
| Dead Drop | crypto-01 | crypto | CRYPTO |
| Key Escrow | crypto-02 | crypto | CRYPTO |

**Future growth:** Could merge into another track or expand with cipher
challenges, PKI operations, certificate management.

### Remaining: Supply Chain
| Mission | Current ID | Notes |
|---------|-----------|-------|
| Supply Chain | incident-response-03 | Cross-domain. Could go NETWORKING or LINUX. |

**Recommendation:** Keep in NETWORKING — supply chain tracing involves
network forensics and device logs.

---

## New Tab Bar

```
ALL | LINUX | WINDOWS | NETWORKING | PYTHON | JAVASCRIPT | CRYPTO
```

**Alternative (fewer tabs):**
```
ALL | LINUX | WINDOWS | NETWORKING | PYTHON | JAVASCRIPT
```
(Merge CRYPTO into LINUX — crypto tools run on Linux)

---

## New Tier Structures

### LINUX_TIERS
```javascript
var LINUX_TIERS = [
    {
        name: 'LINUX TIER 1 — FILESYSTEM',
        subtitle: 'Navigate & Read',
        missions: ['LINUX-FS-01', 'LINUX-FS-02', 'LINUX-FS-03']
    },
    {
        name: 'LINUX TIER 2 — LOG ANALYSIS',
        subtitle: 'Hunt & Correlate',
        missions: ['LOG-01', 'LOG-02']
    },
    {
        name: 'LINUX TIER 3 — FORENSICS',
        subtitle: 'Evidence & Artifacts',
        missions: ['FORENSICS-01', 'FORENSICS-02', 'FORENSICS-03']
    }
];
```

### WINDOWS_TIERS
```javascript
var WINDOWS_TIERS = [
    {
        name: 'WINDOWS TIER 1 — CMD',
        subtitle: 'Command Prompt',
        missions: ['WINDOWS-CMD-01', 'WINDOWS-CMD-02']
    }
];
```

### NETWORKING_TIERS
```javascript
var NETWORKING_TIERS = [
    {
        name: 'NET TIER 1 — RECON',
        subtitle: 'Discover & Map',
        missions: ['RECON-01', 'RECON-02', 'RECON-03']
    },
    {
        name: 'NET TIER 2 — DEFENSE',
        subtitle: 'Firewall & Hardening',
        missions: ['FIREWALL-01', 'FIREWALL-02']
    },
    {
        name: 'NET TIER 3 — INCIDENT RESPONSE',
        subtitle: 'Contain & Recover',
        missions: ['IR-01', 'IR-02', 'IR-03']
    }
];
```

---

## Implementation

### Hub changes (index.html)
1. Add new DOMAINS: `'NETWORKING'`, update icons
2. Update `mode` field on all 20 terminal missions
3. Add `LINUX_TIERS`, `WINDOWS_TIERS`, `NETWORKING_TIERS`, `CRYPTO_TIERS`
4. Add tab buttons for each language
5. Update `renderTiers(filter)` to handle new filters

### Config file changes
None needed — configs don't use the `mode` field. Only the hub references it.

### Mission file changes
None needed — mission loaders are language-agnostic.

---

## Migration Risk: Zero

The `mode` field is ONLY used by the hub's `renderTiers()` function for tab filtering.
Changing it has zero impact on how missions load, run, or save progress. This is a
pure presentation change.

---

*Draft pending adversarial review.*
