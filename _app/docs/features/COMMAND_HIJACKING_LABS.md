# Command Hijacking Labs -- Scoping Document

**Source:** `/home/eq/hexworth-shared/linux command hijacking.docx`
**Date:** 2026-03-07
**Platform:** Hexworth Prime (Dark Arts / Parrot Division)

---

## Phase 1: Browser-Only Labs (Build Now) -- 10 Labs

All use LinuxTerminal.js with filesystem overlays and `onCommand` callbacks. No server needed.

| # | Lab | Source Section | Complexity |
|---|-----|---------------|------------|
| 1-1 | Command Shadowing (Alias) | Malicious Alias, Tier 1 #1 | Simple |
| 1-2 | PATH Hijacking | PATH Hijacking, Tier 1 #2 | Medium |
| 1-3 | Hidden Files & Ghost Artifacts | Ghost File Lab, Tier 1 #3 | Simple |
| 1-4 | Invisible Process (ps Manipulation) | Invisible Process Lab, Tier 2 #5 | Medium |
| 1-5 | .bashrc Poisoning Analysis | Credential Harvesting, Tier 5 #15 | Medium |
| 1-6 | Credential Harvester Detection | Fake Login Prompt, Tier 2 #7 | Simple |
| 1-7 | Log Analysis for Hijacking Evidence | Detecting Command Hijacking | Medium |
| 1-8 | File Permission & Ownership Analysis | SUID Priv Esc, Tier 4 #11 | Simple |
| 1-9 | Shell Resolution Order | Teaching tip: type cd/ls/echo | Simple |
| 1-10 | Full Investigation -- Compromised Server (Mini-CTF) | Lab: Compromised Linux Server | Complex |

### How it works (no LinuxTerminal.js changes needed):

```javascript
LinuxTerminal.init('SEC-01', '#terminal', {
    onCommand: function(cmdLine, output, cmd, args) {
        if (labState.aliasActive && cmd === 'ls') {
            LinuxTerminal.print('HACKED', 'lt-error');
            return true; // suppress default output
        }
        if (labState.aliasActive && cmd === 'type' && args[0] === 'ls') {
            LinuxTerminal.print("ls is aliased to `echo HACKED`");
            return true;
        }
        return false; // default behavior
    }
});
```

---

## Phase 2: Single Sandbox Labs (bc1) -- 10 Labs

Real Linux via Docker containers on bc1. ttyd browser terminal.

| # | Lab | Why Not Browser | Complexity |
|---|-----|----------------|------------|
| 2-1 | Live Alias Hijacking | Real alias persistence, `source` | Simple |
| 2-2 | Live PATH Attack with Evidence | Real PATH resolution, script execution | Simple |
| 2-3 | Stealth Backdoor Simulation | Background processes, real cron | Medium |
| 2-4 | Zombie Process Lab | `gcc`, `fork()`, real process states | Medium |
| 2-5 | Fork Bomb (Controlled) | Real process spawning, ulimit | Medium |
| 2-6 | Fake Login Credential Harvester | `read -s`, real script execution | Simple |
| 2-7 | Process Hiding (Function Override) | Shell functions not in LinuxTerminal.js | Simple |
| 2-8 | Cron Persistence and Detection | Real cron daemon, systemd, `crontab -e` | Medium |
| 2-9 | File Forensics (Timeline/Metadata) | Real timestamps, `strings`, `sha256sum` | Medium |
| 2-10 | LD_PRELOAD Investigation | Real shared library loading, `ldd` | Complex |

---

## Phase 3: Multi-Machine Labs (bc2) -- 5 Labs

Multiple networked containers via Docker Compose.

| # | Lab | Infrastructure | Complexity |
|---|-----|---------------|------------|
| 3-1 | Hidden Network Connection | 2 containers (attacker + victim) | Medium |
| 3-2 | Reverse Shell Detection | 2 containers | Complex |
| 3-3 | Multi-Host Incident Investigation | 3+ containers | Complex |
| 3-4 | ARP Spoofing / MITM | 3 containers, NET_ADMIN | Complex |
| 3-5 | Packet Capture and Analysis | 2+ containers | Medium |

---

## Phase 4: Advanced / CTF (Future) -- 10 Labs

Special tooling, VMs, or safety considerations.

| # | Lab | Blocker | Complexity |
|---|-----|---------|------------|
| 4-1 | Kernel Rootkit Analysis | Needs VM with kernel module loading | Complex |
| 4-2 | Live LD_PRELOAD Rootkit Build | C ABI, careful sandboxing | Complex |
| 4-3 | Container Escape | Intentionally vulnerable Docker | Complex |
| 4-4 | DNS Poisoning | Custom DNS, network segments | Complex |
| 4-5 | Crypto Miner Scenario (Full) | Multi-machine + simulated mining | Complex |
| 4-6 | Password Cracking | `john`/`hashcat`, possibly GPU (bc3) | Medium |
| 4-7 | Memory Forensics (Volatility) | Pre-built memory images, heavy tooling | Complex |
| 4-8 | Deleted File Recovery | Real ext4, `debugfs` | Medium |
| 4-9 | Full CTF (50 Challenges) | Full cyber range, 4-6 VMs | Complex |
| 4-10 | Systemd Persistence | systemd-enabled container or VM | Medium |

---

## Summary

| Phase | Labs | Infrastructure | Build Effort |
|-------|------|---------------|-------------|
| Phase 1 | 10 | LinuxTerminal.js only | Low-Medium |
| Phase 2 | 10 | bc1 Docker containers | Medium |
| Phase 3 | 5 | bc2 Docker Compose | High |
| Phase 4 | 10 | VMs, GPUs, full range | High |

## MITRE ATT&CK Coverage

| Technique | ID | Phase 1 | Phase 2 | Phase 3 |
|-----------|-----|---------|---------|---------|
| PATH Interception | T1574.007 | 1-2, 1-10 | 2-2 | -- |
| Command Shadowing | T1574 | 1-1, 1-4, 1-5 | 2-1, 2-7 | -- |
| Startup Script Persistence | T1547 | 1-5, 1-10 | 2-3, 2-8 | -- |
| Scheduled Task (Cron) | T1053 | 1-7, 1-10 | 2-3, 2-8 | 3-2, 3-3 |
| Input Capture | T1056 | 1-6 | 2-6 | -- |
| Hijack Execution Flow | T1574 | 1-1, 1-2 | 2-1, 2-2, 2-7 | -- |
| Resource Exhaustion | T1499 | -- | 2-5 | -- |
