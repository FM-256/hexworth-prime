# CLH-028: System Monitoring - Solution Sheet

**Module:** CLH-028
**Title:** System Monitoring
**Tier:** CLI Ghost
**Theme:** Real-time system analysis and threat detection

---

## Scenario Overview

You are `monitor@OPS-CENTER`, a security analyst responding to alerts. The system has been compromised with a cryptominer and C2 (Command & Control) backdoor. Your mission is to analyze system resources, identify malicious processes, and determine the C2 server address.

---

## Objectives & Solutions

### Objective 1: RECON - Assess System Health
**Task:** Check system load and uptime
**Hint:** `uptime`

**Solution:**
```bash
uptime
```

**Expected Output:**
```
 12:30:00 up 7 days,  3:45,  2 users,  load average: 4.52, 4.38, 4.21
```

**Analysis:** Load average of 4+ on a system is extremely high - indicates resource-intensive processes (cryptominer).

---

### Objective 2: TRIAGE - Sort Processes by CPU
**Task:** Find the highest CPU-consuming processes
**Hint:** `ps aux --sort=-%cpu`

**Solution:**
```bash
ps aux --sort=-%cpu | head -10
```

**Expected Output:**
```
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
nobody    6666 95.2  2.1 284532 86432 ?        Ssl  Jan10 1024:33 /tmp/.hidden/xmrig
root      7777  0.8  0.1  12344  2048 ?        S    Jan10   12:45 nc 10.0.0.88 4444
root      8888  0.2  0.1   8192  1024 ?        S    Jan10    3:21 /tmp/.hidden/backdoor
```

**Analysis:**
- PID 6666: xmrig cryptominer at 95% CPU
- PID 7777: netcat connection to 10.0.0.88:4444 (C2)
- PID 8888: backdoor process

---

### Objective 3: MEMORY - Check Resource Impact
**Task:** View memory usage
**Hint:** `free -h`

**Solution:**
```bash
free -h
```

**Expected Output:**
```
              total        used        free      shared  buff/cache   available
Mem:          7.8Gi       6.2Gi       512Mi       256Mi       1.1Gi       1.1Gi
Swap:         2.0Gi       1.5Gi       512Mi
```

**Analysis:** 6.2GB of 7.8GB used (80%) with swap being consumed - system under heavy load.

---

### Objective 4: NETWORK - Check Active Connections
**Task:** View network connections
**Hint:** `netstat -tunapl` (or `ss -tunapl`)

**Solution:**
```bash
netstat -tunapl
```
or
```bash
ss -tunapl
```

**Expected Output:**
```
Proto  Local Address      Foreign Address        State       PID/Program
tcp    0.0.0.0:22         0.0.0.0:*              LISTEN      1234/sshd
tcp    10.0.0.42:45678    10.0.0.88:4444         ESTABLISHED 7777/nc
tcp    10.0.0.42:34567    mining.pool.xxx:3333   ESTABLISHED 6666/xmrig
```

**Analysis:** Two suspicious outbound connections - one to C2 (10.0.0.88:4444), one to mining pool.

---

### Objective 5: TIMELINE - Find Compromise Start
**Task:** Determine when the compromise began
**Hint:** `cat dashboards/cpu_history.log`

**Solution:**
```bash
cat dashboards/cpu_history.log
```

**Expected Output:**
```
CPU HISTORY LOG - OPS-CENTER
=============================
2026-01-17 08:00  NORMAL    12% avg
2026-01-17 09:00  NORMAL    15% avg
2026-01-17 10:00  NORMAL    18% avg
2026-01-17 11:00  WARNING   45% avg (spike detected)
2026-01-17 12:00  CRITICAL  95% avg (ALERT TRIGGERED)
2026-01-17 13:00  CRITICAL  97% avg (cryptominer active)
```

**Analysis:** Compromise began at 11:00 - CPU spiked from 18% to 45%, then to 95%.

---

### Objective 6: INTEL - Identify C2 Server IP
**Task:** Find the Command & Control server address
**Hint:** `cat dashboards/network_io.log` (look for PID 7777)

**Solution:**
```bash
cat dashboards/network_io.log
```

**Expected Output:**
```
NETWORK I/O LOG - OPS-CENTER
=============================
2026-01-17 10:00  INBOUND: 192.168.1.1:443 - 2MB/hr (normal HTTPS)
2026-01-17 10:30  OUTBOUND: 8.8.8.8:53 - 0.1MB/hr (DNS, normal)
2026-01-17 11:00  OUTBOUND: mining.pool.xxx:3333 - 2MB/hr (PID 6666)
2026-01-17 11:45  OUTBOUND: 10.0.0.88:4444 - 15MB/hr (PID 7777)
2026-01-17 12:00  OUTBOUND: 10.0.0.88:4444 - 45MB/hr (PID 7777)
2026-01-17 12:30  OUTBOUND: 10.0.0.88:4444 - 62MB/hr (PID 7777)
```

**Analysis:** PID 7777 is connecting to 10.0.0.88:4444 - this is the C2 server.

---

### Objective 7: CORRELATE - Review Incident Timeline
**Task:** Understand the full attack timeline
**Hint:** `cat reports/incident_report.txt`

**Solution:**
```bash
cat reports/incident_report.txt
```

**Expected Output:**
```
INCIDENT REPORT - IR-2026-0117-001
===================================
TIMELINE:
11:00 - Initial compromise (unknown vector)
11:05 - xmrig deployed, CPU spike
11:10 - C2 channel established
11:15 - Backdoor installed in cron
```

---

### Objective 8: PERSIST - Check Backdoor Mechanism
**Task:** Identify persistence mechanisms
**Hint:** `cat alerts/suspicious_proc.txt`

**Solution:**
```bash
cat alerts/suspicious_proc.txt
```

**Expected Output:**
```
SUSPICIOUS PROCESSES DETECTED
==============================
PID 8888 - /tmp/.hidden/backdoor
  └── Persistence: cron @reboot
  └── Function: Reverse shell
```

**Analysis:** Backdoor uses `@reboot` cron entry for persistence.

---

## Insight Phase

**Question:** The alerts mention PID 7777 has a persistent connection. What is the C2 server's IP:PORT that this process is connecting to?

**Answer:** `10.0.0.88:4444`

**Accepted variations:** "10.0.0.88:4444", "10.0.0.88 4444", "10.0.0.88 port 4444"

**How to find:** Check `dashboards/network_io.log` and look for entries with PID 7777.

---

## Key Findings Summary

| PID | Process | Activity | Status |
|-----|---------|----------|--------|
| 6666 | xmrig | Cryptomining at 95% CPU | **MALICIOUS** |
| 7777 | nc (netcat) | C2 connection to 10.0.0.88:4444 | **MALICIOUS** |
| 8888 | backdoor | Reverse shell with cron persistence | **MALICIOUS** |

---

## Attack Timeline

```
11:00 - Initial compromise
11:05 - xmrig deployed (PID 6666)
11:10 - C2 channel established (PID 7777 → 10.0.0.88:4444)
11:15 - Backdoor installed (PID 8888, cron @reboot)
11:45 - First alert triggered
12:00 - CPU critical (95%)
```

---

## Monitoring Commands Reference

```bash
# Real-time process monitoring
top
htop

# Network connections
netstat -tunapl
ss -tunapl
lsof -i

# CPU/Memory at a glance
uptime
free -h
vmstat 1

# Disk I/O
iostat
iotop

# Process tree
pstree -p
```

---

## IOCs (Indicators of Compromise)

| IOC Type | Value |
|----------|-------|
| C2 Server | 10.0.0.88:4444 |
| Mining Pool | mining.pool.xxx:3333 |
| Malicious PID | 6666 (xmrig) |
| Malicious PID | 7777 (nc) |
| Malicious PID | 8888 (backdoor) |
| File Path | /tmp/.hidden/xmrig |
| File Path | /tmp/.hidden/backdoor |
| File Path | /tmp/.hidden/config.json |
| Persistence | cron @reboot |
| Data Exfil | 62MB/hr to C2 |

---

*Last Updated: February 2, 2026*
