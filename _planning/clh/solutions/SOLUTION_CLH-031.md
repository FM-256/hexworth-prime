# CLH-031: OPERATION BLACKOUT - Solution Sheet

**Module:** CLH-031
**Title:** OPERATION BLACKOUT
**Tier:** CLI Ghost (Final Exam)
**Theme:** Adversarial head-to-head vs hostile operator SPECTER

---

## Scenario Overview

You are `operator@RELAY`, racing against hostile operator SPECTER to extract classified intel from the PROMETHEUS server. SPECTER is actively sabotaging your operation - destroying infrastructure, blocking your access, and exfiltrating data. Complete 9 puzzle-based phases plus a terminal finale to neutralize the threat.

---

## Difficulty Levels

| Difficulty | Time Limit | SPECTER Speed | Description |
|------------|------------|---------------|-------------|
| RECRUIT | 6:00 | Slow | Training mode |
| OPERATOR | 4:00 | Normal | Standard ops |
| GHOST | 2:30 | Fast | Elite challenge |

---

## Level 1: LIFELINE - Patch Panel

**Objective:** Restore backup connection after SPECTER destroys the main tower

**Puzzle:** Connect BACKUP node to PROMETHEUS via patch panel

**Solution:**
- Select Source: **A4-BACKUP**
- Select Destination: **B3-PROMETHEUS**
- Click CONNECT

**Handler Intel:** "Operator, SPECTER just took down the main tower. Your backup node is still online - route A4 connects to B3 which leads to PROMETHEUS. Get that connection up!"

---

## Level 2: FORTRESS - Firewall Configuration

**Objective:** Lock down the perimeter - DENY hostile, ALLOW relay

**Puzzle:** Configure firewall rules

**Solution:**
- Rule 1: **DENY** → **10.13.37.66** (SPECTER's IP)
- Rule 2: **ALLOW** → **10.13.37.100** (Your relay IP)
- Click APPLY

**Handler Intel:** "Firewall's been compromised. We've traced SPECTER's relay to 10.13.37.66 - that's your hostile. Your relay address is 10.13.37.100. DENY the hostile, ALLOW yourself."

---

## Level 3: BREADCRUMB - Log Analysis

**Objective:** Analyze auth logs - identify SPECTER's IP

**Puzzle:** Read the authentication logs and identify the hostile IP

**Log Contents:**
```
10:15:02 sshd: Accepted key admin from 10.13.37.50
10:15:45 sshd: Accepted key operator from 10.13.37.100
10:16:12 sshd: Failed password root from 10.13.37.66  ← SUSPICIOUS
10:16:15 sshd: Accepted pwd specter from 10.13.37.66  ← BREACH
```

**Solution:** Enter **10.13.37.66** (or just **66**)

**Handler Intel:** "SPECTER's been sloppy. Check the authentication logs - look for failed attempts followed by a successful breach. That's your hostile IP signature."

---

## Level 4: CIPHER - Hash Crack

**Objective:** Crack the intercepted MD5 hash

**Puzzle:** Identify which common password produces the hash

**Hash:** `5f4dcc3b5aa765d61d8327deb882cf99`

**Options:**
- admin
- **password** ← CORRECT
- 123456
- root

**Solution:** Click **password**

**Verification:** `echo -n "password" | md5sum` = `5f4dcc3b5aa765d61d8327deb882cf99`

**Handler Intel:** "We intercepted an access key hash. Intel suggests it's MD5 - probably a weak password. SPECTER got lazy. Crack it and we're in."

---

## Level 5: NEEDLEPOINT - Regex Filter

**Objective:** Use regex to extract all IP addresses from data dump

**Data Dump:**
```
user=admin@10.13.37.50
ERROR: connection from 192.168.1.1
SPECTER relay: 10.13.37.66
backup node: 10.13.37.100
```

**Solution:** Enter a valid IP regex pattern:
- `\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}`
- `\d+\.\d+\.\d+\.\d+`
- `[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+`

**Handler Intel:** "We've got a data dump but it's full of noise. You need to extract all IP addresses from the mess. Pattern matching is your friend here - think regex."

---

## Level 6: KEYMASTER - File Permissions

**Objective:** Fix file permissions on classified intel

**Puzzle:** The intel.classified file needs owner read/write only

**Solution:** Enter **600** or **chmod 600** or **rw-------**

**Explanation:**
- 6 = read (4) + write (2) for owner
- 0 = no permissions for group
- 0 = no permissions for others

**Handler Intel:** "The classified intel file got its permissions scrambled. It needs owner read/write only - that's 600 in octal. Lock it down properly."

---

## Level 7: ROSETTA - Binary Decode

**Objective:** Decode the binary transmission

**Binary:** `01000111 01001111`

**Solution:** **GO**

**Decoding:**
- `01000111` = 71 = 'G'
- `01001111` = 79 = 'O'

**Handler Intel:** "Intercepted a binary transmission from SPECTER's handler. Convert it to ASCII - it's a short command word. This could be critical."

---

## Level 8: GHOSTHUNT - Process Termination

**Objective:** Identify and terminate SPECTER's rogue processes

**Process Tree:**
```
PID 1 - init (root)           ← DO NOT KILL
├── PID 100 - sshd (root)     ← DO NOT KILL
├── PID 1337 - backdoor (specter)  ← KILL THIS
├── PID 200 - cron (root)     ← DO NOT KILL
│   └── PID 6666 - keylogger (specter)  ← KILL THIS
├── PID 300 - nginx (www)     ← DO NOT KILL
    └── PID 9999 - exfil (specter)  ← KILL THIS
```

**Solution:** Click to kill PIDs **1337**, **6666**, and **9999** (all processes owned by specter)

**Handler Intel:** "SPECTER spawned rogue processes to maintain persistence. Check the process tree - anything running under 'specter' or with suspicious parent chains needs to go."

---

## Level 9: IGNITION - Service Restart

**Objective:** Restart critical services in correct dependency order

**Solution:** Click services in order:
1. **networking** (first - base layer)
2. **firewall** (second - depends on networking)
3. **ssh** (third - depends on firewall)

**Handler Intel:** "Critical services are down. Restart sequence matters: networking first, then firewall, then ssh. Wrong order will cascade fail."

---

## Terminal Finale

After completing all 9 puzzle levels, the terminal finale begins.

### Phase 1: EXTRACTION

**Objective:** Extract classified intel

**Command:**
```bash
cat /data/ops/mission_intel.classified
```

**Handler Message:** "All systems green. Extract the intel - it's in /data/ops/mission_intel.classified"

---

### Phase 2: NEUTRALIZATION

**Objective:** Exfiltrate data and neutralize SPECTER

**Commands:**
```bash
scp /data/ops/mission_intel.classified operator@10.13.37.100:/exfil/
pkill -u specter
```

**Handler Message:** "Intel secured. Now exfiltrate and take SPECTER offline permanently. scp the file out and pkill their processes."

---

## Victory Conditions

- Complete all 9 puzzle phases
- Extract intel (Phase 1)
- Exfiltrate and neutralize SPECTER (Phase 2)
- Finish before timer expires

---

## Defeat Conditions

- Timer reaches 00:00
- SPECTER progress reaches 100%
- Too many mistakes in ONE LIFE modifier mode

---

## Hat Rating System

Each level awards up to 3 hats based on performance:

| Criteria | Hats |
|----------|------|
| Complete under par time | +1 |
| No hints used | +1 |
| No mistakes | +1 |

**Par Times (by difficulty):**

| Level | Recruit | Operator | Ghost |
|-------|---------|----------|-------|
| LIFELINE | 3:00 | 2:00 | 1:00 |
| FORTRESS | 4:00 | 2:30 | 1:30 |
| BREADCRUMB | 5:00 | 3:00 | 2:00 |
| CIPHER | 4:00 | 2:30 | 1:30 |
| NEEDLEPOINT | 5:00 | 3:00 | 2:00 |
| KEYMASTER | 4:00 | 2:30 | 1:30 |
| ROSETTA | 3:00 | 2:00 | 1:00 |
| GHOSTHUNT | 5:00 | 3:00 | 2:00 |
| IGNITION | 4:00 | 2:30 | 1:30 |

---

## Powerups

Earned through perfect performance:

| Powerup | Effect |
|---------|--------|
| SNIFFER | Reveals SPECTER's next move |
| ROOTKIT | Slows SPECTER progress |
| EXPLOIT | Auto-solves current puzzle |

---

## SPECTER Taunts

SPECTER will periodically taunt you:
- "I see you, operator. You're too slow."
- "Did you really think this would be easy?"
- "Your firewall was cute. Emphasis on 'was'."
- "I AM root."
- "Checkmate in 3... 2..."

Don't let SPECTER get in your head. Focus on the objective.

---

## Key Network IPs

| IP | Identity | Status |
|----|----------|--------|
| 10.13.37.50 | PROMETHEUS | Target server |
| 10.13.37.66 | SPECTER | Hostile operator |
| 10.13.37.100 | RELAY | Your position |
| 10.13.37.51 | ATLAS | Secondary target |

---

## Quick Reference - All Solutions

| Level | Puzzle | Quick Answer |
|-------|--------|--------------|
| 1 | Patch Panel | A4 → B3 |
| 2 | Firewall | DENY .66, ALLOW .100 |
| 3 | Log Analysis | 10.13.37.66 |
| 4 | Hash Crack | password |
| 5 | Regex | \d+\.\d+\.\d+\.\d+ |
| 6 | Permissions | 600 |
| 7 | Binary | GO |
| 8 | Processes | Kill 1337, 6666, 9999 |
| 9 | Services | networking → firewall → ssh |
| F1 | Extract | cat /data/ops/mission_intel.classified |
| F2 | Neutralize | scp + pkill -u specter |

---

## Achievements

- **Silent Operator** - Complete with 0 mistakes
- **Speed Demon** - Complete under par time on all levels
- **Ghost Protocol** - Complete on GHOST difficulty
- **Untouchable** - Never let SPECTER reach 50%
- **Perfect Run** - 27/27 hats (3 per level × 9 levels)

---

*Last Updated: February 3, 2026*
