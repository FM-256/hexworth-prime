# 24 Free Cybersecurity HomeLab Ideas

> Source reference for future lab expansions in Hexworth Prime

---

## Offensive Security Tools

### 1. Kali Linux
**Purpose:** Offensive toolkit for scanning, exploitation, and red teaming
**Use Case:** Run in a VM to scan/exploit other lab systems
**Link:** https://kali.org/get-kali

### 2. Metasploitable 2
**Purpose:** Vulnerable Linux VM for safe exploit practice
**Use Case:** Pair with Kali to test exploits & document findings
**Link:** https://sourceforge.net/projects/metasploitable/

### 3. Vulnserver
**Purpose:** Windows buffer overflow practice server
**Use Case:** Run in Win7 VM & exploit with Immunity Debugger
**Link:** https://github.com/stephenbradshaw/vulnserver

---

## Vulnerable Practice Environments

### 4. Vulnerable-AD
**Purpose:** Insecure Active Directory lab
**Use Case:** Use with Windows Server to simulate AD attacks
**Link:** https://github.com/WazeHell/vulnerable-AD

### 5. WebGoat
**Purpose:** OWASP vulnerable web application
**Use Case:** Run locally/Docker & complete built-in lessons
**Link:** https://owasp.org/www-project-webgoat/

### 6. OWASP Juice Shop
**Purpose:** Modern OWASP vulnerable application
**Use Case:** Host locally & attempt SQLi, XSS, and more
**Link:** https://owasp.org/www-project-juice-shop/

### 7. Vulnerable WordPress
**Purpose:** Exploitable WordPress site
**Use Case:** Install locally & test WP-specific exploits
**Link:** https://github.com/vavkamil/dvwp

---

## Web Security Training

### 8. PortSwigger Web Security Academy
**Purpose:** Free web security labs
**Use Case:** Work through online exploit challenges
**Link:** https://portswigger.net/web-security

### 9. CTFlearn
**Purpose:** CTF challenges for all levels
**Use Case:** Solve puzzles to improve across domains
**Link:** https://ctflearn.com

---

## Social Engineering

### 10. GoPhish
**Purpose:** Phishing simulation platform
**Use Case:** Send test phishing emails to lab inboxes
**Link:** https://getgophish.com

---

## Network Security

### 11. pfSense
**Purpose:** Firewall/router for network segmentation
**Use Case:** Place between VMs to control & inspect traffic
**Link:** https://pfsense.org/download

### 12. Suricata
**Purpose:** IDS/IPS (Intrusion Detection/Prevention System)
**Use Case:** Deploy inline with pfSense to detect/block threats
**Link:** https://docs.suricata.io

### 13. WireGuard
**Purpose:** Modern VPN solution
**Use Case:** Securely connect to lab network remotely
**Link:** https://wireguard.com/install

### 14. Wireshark
**Purpose:** Packet capture and analysis
**Use Case:** Inspect traffic between lab hosts
**Link:** https://wireshark.org/download.html

### 15. Zeek
**Purpose:** Network monitoring and logging
**Use Case:** Run with Security Onion for deep traffic analysis
**Link:** https://zeek.org/get-zeek

---

## SIEM / Threat Detection

### 16. Wazuh
**Purpose:** SIEM/XDR platform
**Use Case:** Collect & analyze logs from lab machines
**Link:** https://wazuh.com/install

### 17. OpenSearch
**Purpose:** Search and visualization stack
**Use Case:** Integrate with Wazuh for event dashboards
**Link:** https://opensearch.org

### 18. Security Onion
**Purpose:** Comprehensive threat detection suite
**Use Case:** Ingest lab traffic for threat hunting
**Link:** https://securityonionsolutions.com

### 19. Sigma
**Purpose:** Detection rule format
**Use Case:** Write rules & test in Wazuh/Graylog
**Link:** https://sigmahq.io

---

## Endpoint Security

### 20. Sysmon
**Purpose:** Windows advanced logging
**Use Case:** Install to track detailed security events
**Link:** https://docs.microsoft.com/sysinternals/downloads/sysmon

---

## Honeypots

### 21. Cowrie
**Purpose:** SSH/Telnet honeypot
**Use Case:** Deploy isolated to monitor login attempts
**Link:** https://github.com/cowrie/cowrie

---

## Adversary Emulation

### 22. MITRE Caldera
**Purpose:** Adversary emulation platform
**Use Case:** Simulate attacker behavior in test networks
**Link:** https://caldera.mitre.org

---

## Malware Analysis

### 23. REMnux
**Purpose:** Malware analysis Linux distribution
**Use Case:** Reverse-engineer samples safely in VM
**Link:** https://remnux.org

---

## Automation

### 24. Ansible
**Purpose:** Infrastructure automation tool
**Use Case:** Push configs to multiple lab VMs
**Link:** https://docs.ansible.com/ansible/latest/installation_guide/

---

## Certification Study Resources (Google Drive)

| Cert | Direct Google Drive Link |
|------|--------------------------|
| AWS | https://drive.google.com/drive/folders/1xu0wB2f7Xc6d1NuQ6yP9vxBFVXo1WoIj |
| CISSP | https://drive.google.com/drive/folders/1OTCyiNN7Km-ZFN_ciDAHGmEeKhyaXrnC |
| CISA | https://drive.google.com/drive/folders/1vf5E7Yd09km31ZzcJ2_F0VH0hWRMEi8O |
| CISM | https://drive.google.com/drive/folders/1-Vhz0RPtSnLXfpMcLyirSBPCE3BfcfIm |
| CRISC | https://drive.google.com/drive/folders/1ThyyDGQUhd1gZD92synPGLwK4v0sugcv |
| CCDA | https://drive.google.com/drive/folders/17ChJX5uTL-MXO--haZNzYDubELvcJppV |

> **Note:** These are publicly shared Google Drive folders. Content must be reviewed manually - Claude cannot access Drive file listings.

---

## Lab Integration Ideas for Hexworth Prime

### Shield House (Security/Defense)
- Suricata IDS lab
- Wazuh SIEM setup
- pfSense firewall configuration
- Sigma rule writing
- Cowrie honeypot deployment

### Script House (CLI/Automation)
- Ansible playbook labs
- Sysmon configuration
- Log analysis with grep/awk

### Web House (Web Development/Security)
- WebGoat challenges
- Juice Shop exploitation
- PortSwigger academy integration

### Dark Arts (Advanced Security)
- Kali Linux exploitation labs
- Metasploitable attack chains
- Vulnserver buffer overflow
- MITRE Caldera adversary simulation
- REMnux malware analysis

### Key House (Cryptography)
- WireGuard VPN setup
- Certificate management

### Eye House (Forensics/Analysis)
- Wireshark packet analysis
- Zeek network monitoring
- Security Onion threat hunting

---

*Last Updated: 2026-02-06*
