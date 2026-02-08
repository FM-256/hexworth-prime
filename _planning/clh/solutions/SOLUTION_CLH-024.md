# CLH-024: Scheduled Tasks - Solution Sheet

**Module:** CLH-024
**Title:** Scheduled Tasks
**Tier:** CLI Wraith
**Theme:** Hunt for malicious cron jobs and persistence mechanisms

---

## Scenario Overview

You are `operator@BEACON-NODE`, investigating a compromised system. Attackers commonly use cron jobs for persistence - scheduled tasks that run malware at regular intervals, ensuring they maintain access even after reboots.

---

## Objectives & Solutions

### Objective 1: LIST - User Crontab
**Task:** View the current user's scheduled tasks
**Hint:** `$ crontab -l`

**Solution:**
```bash
crontab -l
```

**Expected Output:**
```
# Crontab for operator
# m h  dom mon dow   command
0 * * * * /usr/bin/backup.sh
*/5 * * * * /tmp/.hidden/update.sh
```

**Analysis:** The user crontab shows two entries - one legitimate backup and one suspicious entry running from `/tmp/.hidden/` every 5 minutes.

---

### Objective 2: CHECK - System Crontab
**Task:** Examine the system-wide crontab
**Hint:** `$ cat /etc/crontab`

**Solution:**
```bash
cat /etc/crontab
```

**Expected Output:**
```
SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

# Standard system crontab entries
17 * * * * root cd / && run-parts --report /etc/cron.hourly
25 6 * * * root test -x /usr/sbin/anacron || run-parts --report /etc/cron.daily
47 6 * * 7 root test -x /usr/sbin/anacron || run-parts --report /etc/cron.weekly
```

**Analysis:** The system crontab appears clean - these are standard Linux system maintenance jobs.

---

### Objective 3: SEARCH - Cron Directories
**Task:** List the cron.d drop-in directory
**Hint:** `$ ls -la /etc/cron.d/`

**Solution:**
```bash
ls -la /etc/cron.d/
```

**Expected Output:**
```
total 12
drwxr-xr-x  2 root root 4096 Jan 10 08:00 .
drwxr-xr-x 85 root root 4096 Jan 15 12:00 ..
-rw-r--r--  1 root root  178 Jan  1 00:00 e2scrub_all
-rw-r--r--  1 root root  156 Jan  1 00:00 popularity-contest
-rw-r--r--  1 root root  178 Jan 10 08:00 backdoor
```

**Analysis:** Three files in cron.d - two legitimate system files and one suspicious file named `backdoor` created on Jan 10.

---

### Objective 4: FIND - All Cron Jobs
**Task:** Search for all cron-related files
**Hint:** `$ find /etc/cron.d -type f`

**Solution:**
```bash
find /etc/cron.d -type f
```

**Expected Output:**
```
/etc/cron.d/e2scrub_all
/etc/cron.d/popularity-contest
/etc/cron.d/backdoor
```

**Alternative Commands:**
```bash
find /etc -name "*cron*" -type f
ls -la /etc/cron.d/
```

**Analysis:** This lists all cron job files in the drop-in directory, confirming the presence of the backdoor file.

---

### Objective 5: ANALYZE - Suspicious Entry
**Task:** Examine the malicious cron job
**Hint:** `$ cat /etc/cron.d/backdoor`

**Solution:**
```bash
cat /etc/cron.d/backdoor
```

**Expected Output:**
```
# MALICIOUS - Persistence mechanism
# Added by attacker on 2024-01-10
*/10 * * * * root /opt/.malware/persist.sh
```

**Analysis:**
- Runs every 10 minutes (`*/10`)
- Runs as root
- Executes a script from a hidden directory (`/opt/.malware/`)
- Clear persistence mechanism

---

## Insight Phase

**Question:** How often (in minutes) does the backdoor cron job run?

**Answer:** `10`

**Accepted variations:** "10", "10 minutes", "every 10 minutes", "*/10"

---

## Key Findings Summary

| Location | Status | Notes |
|----------|--------|-------|
| User crontab | SUSPICIOUS | `/tmp/.hidden/update.sh` runs every 5 min |
| /etc/crontab | CLEAN | Standard system maintenance |
| /etc/cron.d/e2scrub_all | LEGITIMATE | System maintenance |
| /etc/cron.d/popularity-contest | LEGITIMATE | Ubuntu package stats |
| /etc/cron.d/backdoor | **MALICIOUS** | Persistence - runs every 10 min as root |

---

## Additional Investigation Commands

These commands weren't objectives but are useful for investigation:

```bash
# View root's crontab (would need sudo in real scenario)
cat /var/spool/cron/crontabs/root

# Search for suspicious patterns in cron files
grep -r "curl\|wget\|bash" /etc/cron.d/

# View the cheatsheet
cat ~/.cron_cheatsheet

# Check analysis notes
cat ~/analysis/suspicious_jobs.txt
```

---

## Cron Syntax Reference

```
* * * * * command
│ │ │ │ │
│ │ │ │ └── Day of week (0-7, 0=Sunday)
│ │ │ └──── Month (1-12)
│ │ └────── Day of month (1-31)
│ └──────── Hour (0-23)
└────────── Minute (0-59)

Common patterns:
*/5 * * * *     Every 5 minutes
*/10 * * * *    Every 10 minutes
0 * * * *       Every hour
0 0 * * *       Daily at midnight
```

---

## Red Flags in Cron Jobs

1. **Unusual locations:** `/tmp`, hidden directories, `/opt/.malware`
2. **High frequency:** `*/1`, `*/5` minute intervals
3. **Network activity:** `curl`, `wget` piped to `bash`
4. **Base64 encoding:** Attempts to hide command content
5. **Running as root:** Unnecessary privilege escalation
6. **Recent creation date:** Files added after initial deployment

---

## IOCs (Indicators of Compromise)

| IOC Type | Value |
|----------|-------|
| File Path | `/etc/cron.d/backdoor` |
| File Path | `/opt/.malware/persist.sh` |
| File Path | `/tmp/.hidden/update.sh` |
| File Path | `/tmp/.hidden/beacon.sh` |
| IP Address | 10.0.0.88 (C2 server) |
| Schedule | */10 * * * * (every 10 min) |
| Schedule | */5 * * * * (every 5 min) |

---

*Last Updated: January 28, 2026*
