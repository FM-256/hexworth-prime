# CLH-025: Package Management - Solution Sheet

**Module:** CLH-025
**Title:** Package Management
**Tier:** CLI Wraith
**Theme:** Forensic analysis of installed packages

---

## Scenario Overview

You are `analyst@FORENSIC-WS`, performing forensic analysis on a compromised server. Your mission is to identify unauthorized packages installed by the attacker and determine the exact timeline of the malware installation.

---

## Objectives & Solutions

### Objective 1: LIST - Installed Packages
**Task:** View all installed packages
**Hint:** `$ dpkg -l` (or `apt list --installed`)

**Solution:**
```bash
dpkg -l
```

**Expected Output (partial):**
```
ii  apache2           2.4.54    amd64   Apache HTTP Server
ii  bash              5.1-6     amd64   GNU Bourne Again Shell
...
ii  htop              3.2.1     amd64   Interactive process viewer
ii  ncat              7.93      amd64   Nmap network tool
ii  netminer          0.9.7     amd64   Network utility
ii  socat             1.7.4.1   amd64   Multipurpose relay
...
```

**Analysis:** Several suspicious packages not in baseline: htop (possibly legitimate), ncat, netminer, socat.

---

### Objective 2: SEARCH - Suspicious Package
**Task:** Search for specific suspicious packages
**Hint:** `$ dpkg -l | grep netminer`

**Solution:**
```bash
dpkg -l | grep netminer
```

**Expected Output:**
```
ii  netminer          0.9.7     amd64   Network utility
```

**Analysis:** The `netminer` package is installed but not in any known repository - custom malware.

---

### Objective 3: CHECK - Package Info
**Task:** View detailed package information
**Hint:** `$ dpkg -s netminer`

**Solution:**
```bash
dpkg -s netminer
```

**Expected Output:**
```
Package: netminer
Status: install ok installed
Priority: optional
Section: net
Maintainer: shadow@darknet.local
Architecture: amd64
Version: 0.9.7
Description: Network data extraction utility
 A tool for network data collection and extraction.
```

**Analysis:** The maintainer `shadow@darknet.local` is clearly not a legitimate source. This is custom malware.

---

### Objective 4: FIND - Installation Timeline
**Task:** Find when packages were installed
**Hint:** `$ grep " install " /var/log/dpkg.log`

**Solution:**
```bash
grep " install " /var/log/dpkg.log
```
or
```bash
cat /var/log/dpkg.log
```

**Expected Output:**
```
2026-01-10 08:15:22 startup packages configure
2026-01-12 14:30:01 install htop:amd64 <none> 3.2.1
2026-01-15 02:47:33 install ncat:amd64 <none> 7.93
2026-01-15 02:48:15 install socat:amd64 <none> 1.7.4.1
2026-01-15 02:51:07 install netminer:amd64 <none> 0.9.7
2026-01-17 09:00:01 upgrade openssl:amd64 3.0.2-0 3.0.2-1
```

**Analysis:** Attack timeline clear:
- 02:47:33 - ncat installed (data exfiltration tool)
- 02:48:15 - socat installed (tunnel/relay tool)
- 02:51:07 - netminer installed (primary malware)

---

### Objective 5: VERIFY - Package Files
**Task:** Verify package integrity or list files
**Hint:** `$ dpkg -V netminer` (or `dpkg -L`)

**Solution:**
```bash
dpkg -V netminer
```
or
```bash
dpkg -L netminer
```

**Expected Output (dpkg -V):**
```
??5??????   /usr/bin/netminer
??5??????   /etc/netminer/config.json
```

**Analysis:** The `5` indicates MD5 checksum mismatch - files have been modified since installation (or checksums were never valid).

---

## Insight Phase

**Question:** At what time (HH:MM:SS) was the malicious 'netminer' package installed?

**Answer:** `02:51:07`

**Accepted variations:** "02:51:07", "2:51:07", "02:51"

**How to find:** Run `grep netminer /var/log/dpkg.log` or `cat /var/log/dpkg.log` and find the install timestamp.

---

## Key Findings Summary

| Package | Status | Installation Time | Notes |
|---------|--------|-------------------|-------|
| htop | Possibly OK | 2026-01-12 14:30:01 | Process viewer, could be legitimate |
| ncat | **SUSPICIOUS** | 2026-01-15 02:47:33 | Data exfiltration capability |
| socat | **SUSPICIOUS** | 2026-01-15 02:48:15 | Tunnel/relay capability |
| netminer | **MALICIOUS** | 2026-01-15 02:51:07 | Primary malware, custom package |

---

## Attack Timeline

```
2026-01-15 02:47:33  ncat installed      (preparation)
2026-01-15 02:48:15  socat installed     (preparation)
2026-01-15 02:51:07  netminer installed  (malware deployment)
```

All malicious packages installed within a 4-minute window, indicating automated attack script.

---

## Additional Investigation Commands

```bash
# Check the diff between baseline and current
cat ~/package_audit/diff.txt

# View apt history
cat /var/log/apt/history.log

# Check package evidence
cat ~/evidence/captured_deb.txt

# View the baseline
cat ~/package_audit/baseline.txt
```

---

## IOCs (Indicators of Compromise)

| IOC Type | Value |
|----------|-------|
| Package | netminer 0.9.7 |
| Package | ncat 7.93 |
| Package | socat 1.7.4.1 |
| Maintainer | shadow@darknet.local |
| Timestamp | 2026-01-15 02:51:07 |
| File Path | /usr/bin/netminer |
| File Path | /etc/netminer/config.json |
| MD5 (deb) | a1b2c3d4e5f6... |

---

*Last Updated: February 2, 2026*
