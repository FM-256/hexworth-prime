# IDP: Arena Box Series B-H Design

**Status:** Draft
**Author:** Hexworth Prime Architecture
**Date:** 2026-03-16
**Scope:** 70 new CTF boxes across 7 series (B through H)
**Prerequisite:** Series A complete (20 boxes, a1-a20)

---

## Overview

Series A established the CTF Arena's foundation: Linux fundamentals, SQL injection, privilege escalation, and basic exploitation. Series B through H expand into specialized domains, each with 10 boxes forming a coherent skill track. Students completing all 90 boxes (A-H) will have breadth across the full offensive security landscape.

### Difficulty Scale

| Level | Label | Audience |
|-------|-------|----------|
| 1 | Novice | First-time CTF players, guided walkthrough |
| 2 | Beginner | Basic tool usage, single-step exploits |
| 3 | Intermediate | Multi-step chains, research required |
| 4 | Advanced | Complex exploitation, custom tooling |
| 5 | Expert | Multi-stage, minimal hints, real-world sim |

---

## Series B: Web Application Security

**House alignment:** Dark Arts, Web
**Theme:** "The Fractured Frontend" -- a fictional e-commerce empire with security holes at every layer.
**Lore:** The Nexarite Corporation's web infrastructure has been compromised. Each box targets a different web vulnerability class.

| Box | Name | Diff | Attack Vector | Flags | Learning Objectives |
|-----|------|------|---------------|-------|---------------------|
| B1 | Injection Well | 2 | SQL Injection (Union-based, Blind) | 4 | Understand parameterized queries vs string concatenation; extract data via UNION SELECT; exploit blind SQLi with boolean/time-based techniques |
| B2 | Script Kiddie's Playground | 2 | Cross-Site Scripting (Reflected, Stored, DOM) | 4 | Identify XSS sinks and sources; craft payloads that bypass basic filters; understand CSP headers and their role in mitigation |
| B3 | The Forged Request | 3 | Cross-Site Request Forgery | 3 | Understand same-origin policy; craft CSRF payloads; identify missing anti-CSRF tokens; exploit state-changing GET requests |
| B4 | Internal Affairs | 3 | Server-Side Request Forgery | 4 | Exploit SSRF to access internal services; bypass URL validation; reach cloud metadata endpoints; chain SSRF with other vulns |
| B5 | The Upload Gate | 3 | Unrestricted File Upload | 4 | Bypass extension whitelists; exploit MIME type confusion; achieve RCE via webshell upload; understand content-type validation |
| B6 | Object Resurrection | 4 | Insecure Deserialization | 3 | Understand serialization formats (JSON, PHP, Java); craft malicious serialized objects; achieve RCE through deserialization gadgets |
| B7 | Somebody Else's Problem | 2 | Insecure Direct Object Reference | 4 | Enumerate object IDs; access other users' data via IDOR; understand horizontal vs vertical privilege escalation; implement access controls |
| B8 | Token Heist | 3 | JWT Abuse (none alg, key confusion, claim tampering) | 4 | Decode JWT structure; exploit algorithm confusion attacks; forge tokens with weak secrets; understand proper JWT validation |
| B9 | OAuth Labyrinth | 4 | OAuth 2.0 Flaws (redirect_uri manipulation, state bypass) | 3 | Understand OAuth 2.0 flows; exploit open redirectors in OAuth; bypass state parameter validation; steal authorization codes |
| B10 | Template Inferno | 4 | Remote Code Execution via Template Injection (SSTI) | 4 | Identify template engines; detect SSTI via payloads; escalate from template injection to RCE; test Jinja2, Twig, Freemarker contexts |

**Series B totals:** 10 boxes, 37 flags, avg difficulty 3.0

---

## Series C: Network & Infrastructure

**House alignment:** Web, Forge
**Theme:** "The Iron Backbone" -- a city's critical network infrastructure under siege.
**Lore:** Ironport City's municipal network is riddled with misconfigurations. Students must exploit and then secure each layer.

| Box | Name | Diff | Attack Vector | Flags | Learning Objectives |
|-----|------|------|---------------|-------|---------------------|
| C1 | Poison Well | 3 | DNS Cache Poisoning | 3 | Understand DNS resolution process; craft spoofed DNS responses; exploit lack of DNSSEC; redirect traffic via DNS manipulation |
| C2 | Layer Two Lies | 3 | ARP Spoofing / ARP Cache Poisoning | 3 | Understand ARP protocol mechanics; perform MITM via ARP spoofing; capture credentials on local network; detect and prevent ARP attacks |
| C3 | Trunk Escape | 4 | VLAN Hopping (switch spoofing, double tagging) | 3 | Understand 802.1Q VLAN tagging; exploit DTP negotiation; perform double-tag attacks; understand VLAN segmentation best practices |
| C4 | Community Strings | 2 | SNMP Exploitation (default communities, info leak) | 4 | Enumerate SNMP services; exploit default community strings; extract device configurations; understand SNMPv3 security improvements |
| C5 | Route Hijack | 5 | BGP Hijacking Simulation | 3 | Understand BGP peering and route announcement; simulate prefix hijacking; analyze routing table anomalies; understand RPKI and ROV |
| C6 | Firewall Fracture | 3 | Firewall Rule Bypass (fragmentation, tunneling) | 4 | Identify firewall rules via probing; bypass stateless filters with fragmentation; tunnel traffic through allowed protocols; test egress filtering |
| C7 | Tunnel Vision | 4 | VPN Tunnel Escape / VPN Misconfiguration | 3 | Exploit split-tunnel configurations; escape VPN isolation; understand IPSec vs SSL VPN attack surfaces; exploit weak VPN authentication |
| C8 | The Middle Man | 3 | Man-in-the-Middle Attacks | 4 | Perform MITM with various tools; intercept HTTPS via certificate manipulation; exploit SSL stripping; understand HSTS and certificate pinning |
| C9 | Knock Knock | 2 | Port Knocking Discovery and Bypass | 3 | Discover port knocking sequences; analyze pcap for knock patterns; understand security through obscurity limitations; bypass with replay |
| C10 | Pivot Point | 4 | Network Pivoting (multi-hop exploitation) | 4 | Establish pivot through compromised host; use SSH tunneling and proxychains; enumerate internal networks; chain exploits across segments |

**Series C totals:** 10 boxes, 34 flags, avg difficulty 3.3

---

## Series D: Cryptography

**House alignment:** Key
**Theme:** "The Cipher Vault" -- an ancient cryptographic archive where every lock has a mathematical flaw.
**Lore:** The Order of the Broken Key left behind a vault of encrypted secrets. Each box exposes a different cryptographic weakness.

| Box | Name | Diff | Attack Vector | Flags | Learning Objectives |
|-----|------|------|---------------|-------|---------------------|
| D1 | Cracked Foundation | 2 | Weak Hashing (MD5, SHA1, unsalted) | 3 | Understand hash functions and their properties; crack weak hashes with rainbow tables; exploit unsalted password storage; compare hashing algorithms |
| D2 | Padding Prophet | 4 | Padding Oracle Attack | 3 | Understand CBC mode and PKCS#7 padding; exploit padding validation oracles; decrypt ciphertext byte-by-byte; understand timing side channels |
| D3 | Small Exponent | 3 | RSA Small Public Exponent (e=3) | 3 | Understand RSA key generation; exploit small public exponent with cube root attack; understand proper RSA parameter selection; Hastad's broadcast attack |
| D4 | Deja Vu | 3 | Cryptographic Key Reuse / Nonce Reuse | 4 | Understand nonce importance in stream ciphers; exploit AES-CTR nonce reuse; crack two-time pad; understand WEP's key reuse vulnerability |
| D5 | Fake Credentials | 4 | X.509 Certificate Forgery | 3 | Understand PKI and certificate chains; exploit weak CA validation; forge certificates with known private keys; understand certificate transparency |
| D6 | Clock Watcher | 4 | Timing Side-Channel Attacks | 3 | Understand timing-based information leakage; exploit string comparison timing; perform remote timing attacks on authentication; implement constant-time comparison |
| D7 | Bit Flipper | 3 | CBC Bit-Flipping Attack | 4 | Understand CBC mode encryption/decryption; exploit malleability of CBC ciphertext; modify encrypted data without key; understand authenticated encryption |
| D8 | Downgrade Protocol | 3 | Diffie-Hellman Downgrade / Logjam | 3 | Understand DH key exchange; exploit weak DH parameters; perform downgrade attacks on TLS; understand forward secrecy and parameter selection |
| D9 | Hidden in Plain Sight | 2 | Steganography Detection and Extraction | 4 | Detect hidden data in images and audio; use steganography tools (steghide, zsteg); understand LSB encoding; analyze file metadata for hidden channels |
| D10 | Ransom's End | 4 | Ransomware Decryption Challenge | 3 | Analyze ransomware encryption scheme; find cryptographic implementation flaws; recover encryption keys from memory/artifacts; decrypt files without paying ransom |

**Series D totals:** 10 boxes, 33 flags, avg difficulty 3.2

---

## Series E: Cloud Security

**House alignment:** Cloud
**Theme:** "SkyFall Operations" -- a cloud-native startup that grew too fast for its own security.
**Lore:** SkyFall Corp deployed everything to the cloud but forgot to lock the doors. Each box targets a cloud-specific misconfiguration.

| Box | Name | Diff | Attack Vector | Flags | Learning Objectives |
|-----|------|------|---------------|-------|---------------------|
| E1 | Open Bucket | 2 | S3 Bucket Misconfiguration | 4 | Enumerate public S3 buckets; exploit overly permissive ACLs; access sensitive data in misconfigured storage; understand bucket policies and IAM |
| E2 | Privilege Creep | 3 | IAM Privilege Escalation | 4 | Enumerate IAM policies and roles; chain permissive policies for escalation; exploit sts:AssumeRole misconfigurations; understand least-privilege principle |
| E3 | Lambda Trap | 3 | Lambda Function Injection | 3 | Exploit injection in serverless function inputs; access Lambda environment variables; pivot from Lambda to other AWS services; understand Lambda security boundaries |
| E4 | Metadata Goldmine | 2 | Cloud Metadata Service Exploit (IMDS) | 4 | Access instance metadata endpoints; extract IAM credentials from IMDS; understand IMDSv1 vs v2; chain metadata access with SSRF |
| E5 | Container Break | 4 | Container Escape (Docker breakout) | 3 | Exploit privileged container configurations; escape to host via volume mounts; exploit Docker socket exposure; understand container isolation boundaries |
| E6 | RBAC Roulette | 4 | Kubernetes RBAC Misconfiguration | 3 | Enumerate K8s permissions; exploit overly permissive service accounts; access secrets across namespaces; understand K8s security best practices |
| E7 | Event Hijack | 3 | Serverless Event Injection (trigger manipulation) | 3 | Exploit event-driven architectures; inject malicious events into queues; exploit deserialization in event handlers; understand event source validation |
| E8 | Leaked Keys | 2 | Cloud API Key Exposure (git history, env vars) | 4 | Find exposed keys in repositories; exploit leaked credentials; understand secret rotation; implement proper secrets management |
| E9 | State Secrets | 3 | Terraform State File Exposure | 4 | Access unprotected terraform state; extract secrets from state files; understand state file security; implement remote state with encryption |
| E10 | Cloud Hopper | 5 | Multi-Cloud Lateral Movement | 3 | Pivot between AWS and Azure environments; exploit cross-cloud trust relationships; chain cloud misconfigurations; understand multi-cloud security posture |

**Series E totals:** 10 boxes, 35 flags, avg difficulty 3.1

---

## Series F: Mobile & IoT

**House alignment:** Forge, Dark Arts
**Theme:** "The Connected Compound" -- a smart building with every device exploitable.
**Lore:** HexTech Industries built the world's smartest building. Every sensor, lock, and device is connected. Every one of them is vulnerable.

| Box | Name | Diff | Attack Vector | Flags | Learning Objectives |
|-----|------|------|---------------|-------|---------------------|
| F1 | App Autopsy | 2 | APK Reverse Engineering | 4 | Decompile Android APKs; analyze smali code; extract hardcoded secrets; understand Android app structure and signing |
| F2 | Pinned Down | 3 | Certificate Pinning Bypass | 3 | Understand certificate pinning mechanisms; use Frida to bypass pinning; intercept HTTPS traffic from mobile apps; analyze pinning implementations |
| F3 | Bluetooth Bleed | 3 | BLE (Bluetooth Low Energy) Exploitation | 3 | Enumerate BLE services and characteristics; exploit unauthenticated BLE writes; sniff BLE communications; understand BLE security modes |
| F4 | Firmware Fossil | 3 | Firmware Extraction and Analysis | 4 | Extract firmware from IoT devices; analyze firmware with binwalk; find hardcoded credentials in firmware; understand firmware update mechanisms |
| F5 | Broker Breach | 3 | MQTT Protocol Hijacking | 4 | Discover MQTT brokers; subscribe to sensitive topics; publish malicious commands; exploit lack of authentication and ACLs in MQTT |
| F6 | Key in the APK | 2 | API Key Extraction from Mobile App | 3 | Decompile mobile applications; extract API keys from code and resources; understand API key scoping; implement proper key management |
| F7 | Root Check | 3 | Jailbreak/Root Detection Bypass | 3 | Understand root/jailbreak detection methods; bypass detection with hooking frameworks; analyze detection code; understand defense-in-depth for mobile |
| F8 | Lock Picker | 4 | Smart Lock Protocol Exploitation | 3 | Analyze smart lock communication protocols; replay authentication sequences; exploit weak pairing mechanisms; understand physical security implications |
| F9 | Update Hijack | 4 | OTA (Over-the-Air) Update Tampering | 3 | Intercept OTA update channels; inject malicious firmware updates; exploit unsigned update packages; understand secure boot and code signing |
| F10 | Botnet Builder | 4 | IoT Botnet Simulation (Mirai-style) | 4 | Understand IoT botnet recruitment; exploit default credentials at scale; analyze botnet C2 communication; understand DDoS amplification from IoT |

**Series F totals:** 10 boxes, 34 flags, avg difficulty 3.1

---

## Series G: Forensics & Incident Response

**House alignment:** Eye
**Theme:** "Cold Case Division" -- each box is an unsolved cyber incident that needs investigation.
**Lore:** The Hexworth Forensics Bureau has a backlog of unsolved cases. Students work as digital investigators, analyzing evidence to determine what happened, how, and who did it.

| Box | Name | Diff | Attack Vector | Flags | Learning Objectives |
|-----|------|------|---------------|-------|---------------------|
| G1 | Memory Ghost | 3 | Memory Dump Analysis (Volatility) | 4 | Analyze RAM dumps with Volatility; extract running processes and network connections; find injected code in memory; recover encryption keys from RAM |
| G2 | Disk Witness | 3 | Disk Image Forensics | 4 | Mount and analyze disk images; recover deleted files; analyze filesystem timestamps; use Autopsy/Sleuth Kit for investigation |
| G3 | Log Hunter | 2 | Log File Analysis (syslog, auth, web) | 4 | Parse and correlate log entries; identify attack patterns in logs; use log analysis tools; understand log retention and integrity |
| G4 | Malware Triage | 3 | Static and Dynamic Malware Analysis | 4 | Perform static analysis (strings, hashes, imports); run dynamic analysis in sandbox; identify malware capabilities; write YARA rules |
| G5 | Packet Detective | 3 | PCAP Investigation | 4 | Analyze network captures with Wireshark; reconstruct TCP streams; extract files from pcap; identify C2 communication patterns |
| G6 | Timeline Architect | 4 | Super Timeline Reconstruction | 3 | Build comprehensive event timelines; correlate filesystem, registry, and log timestamps; use plaso/log2timeline; identify anti-forensic timestamp manipulation |
| G7 | Header Analysis | 2 | Email Header Forensics (phishing investigation) | 4 | Parse email headers; trace message routing; identify spoofed sender fields; analyze SPF/DKIM/DMARC results; extract indicators of compromise |
| G8 | Registry Secrets | 3 | Windows Registry Forensics | 4 | Analyze registry hives offline; extract user activity artifacts; find persistence mechanisms in registry; understand MRU lists and shellbags |
| G9 | Mobile Evidence | 4 | Mobile Device Forensics | 3 | Acquire mobile device images; analyze SQLite databases; extract app data and communications; understand mobile forensic tool chains |
| G10 | Incident Report | 3 | Incident Report Writing (capstone assessment) | 3 | Compile forensic findings into professional report; document chain of custody; write executive summary and technical details; recommend remediation actions |

**Series G totals:** 10 boxes, 37 flags, avg difficulty 3.0

---

## Series H: Advanced / Prestige

**House alignment:** Matrix (cross-domain mastery required)
**Theme:** "Operation Endgame" -- the ultimate test. Multi-stage, multi-domain, no hand-holding.
**Lore:** The Architect has constructed the final challenge. Each box combines techniques from previous series into real-world attack scenarios. Only those who have mastered the fundamentals will survive.

**Prerequisite:** Completion of at least 3 prior series recommended.

| Box | Name | Diff | Attack Vector | Flags | Learning Objectives |
|-----|------|------|---------------|-------|---------------------|
| H1 | Supply Chain Phantom | 5 | Supply Chain Attack Simulation | 4 | Identify compromised dependencies; analyze malicious package behavior; trace supply chain infection vectors; understand SCA tools and SBOM |
| H2 | Day Zero | 5 | Zero-Day Simulation (vuln discovery + exploit dev) | 4 | Discover unknown vulnerabilities through fuzzing; develop working exploits; write proof-of-concept code; understand responsible disclosure |
| H3 | Full Chain | 5 | Red Team Kill Chain (recon to exfil) | 5 | Execute complete attack lifecycle; chain multiple vulnerabilities; maintain operational security; document full engagement |
| H4 | Golden Ticket | 4 | Active Directory Kerberoasting | 4 | Understand Kerberos authentication; request and crack service tickets; exploit weak service account passwords; understand AS-REP roasting |
| H5 | Lateral Drift | 4 | Lateral Movement (pass-the-hash, token impersonation) | 4 | Move between systems using harvested credentials; exploit trust relationships; use WMI/PSExec/WinRM for lateral movement; understand segmentation defenses |
| H6 | Data Runner | 4 | Data Exfiltration (covert channels) | 4 | Exfiltrate data via DNS, ICMP, and steganography; evade DLP systems; use encrypted channels; understand egress monitoring and detection |
| H7 | The Persistence | 4 | Persistence Mechanisms (rootkits, scheduled tasks, registry) | 4 | Implant multiple persistence mechanisms; survive reboots and user logoffs; hide persistence from basic forensics; understand detection techniques |
| H8 | Ghost Protocol | 5 | Evasion Techniques (AV bypass, log clearing, living off the land) | 4 | Bypass antivirus and EDR; use LOLBins for stealth; clear forensic artifacts; understand behavioral detection and its limitations |
| H9 | Purple Dawn | 4 | Purple Team Exercise (attack + detect simultaneously) | 5 | Execute attacks while monitoring detection; tune detection rules in real time; understand attacker-defender feedback loops; write detection signatures |
| H10 | The Architect | 5 | Final Boss -- Multi-Stage Full Scenario | 6 | Chain all domains: web, network, crypto, cloud, mobile, forensics; solve multi-stage attack/defense scenario; demonstrate mastery across all series |

**Series H totals:** 10 boxes, 44 flags, avg difficulty 4.5

---

## Implementation Notes

### Naming Convention
Box IDs follow existing pattern: `{series}{number}-{slug}` (e.g., `b1-injection-well`, `h10-the-architect`).
Config files live at `_app/arena/boxes/{id}/config.js`.

### Difficulty Progression
- Series B-D: Avg 3.0-3.3 (specialist domains, intermediate baseline)
- Series E-F: Avg 3.1 (modern attack surfaces)
- Series G: Avg 3.0 (investigation-focused, less exploit-heavy)
- Series H: Avg 4.5 (prestige tier, multi-domain)

### Flag Architecture
Each box uses the existing flag system from Series A. Flags are stored in Firestore via Cloud Functions (`functions/seed-flags.js`). Total new flags across B-H: 254.

### Build Priority
1. **Series B** -- highest student demand, web is the most accessible domain
2. **Series G** -- forensics fills the Eye house content gap
3. **Series E** -- cloud security aligns with Cloud house and industry demand
4. **Series C** -- network fundamentals support Web house
5. **Series D** -- cryptography for Key house
6. **Series F** -- mobile/IoT is niche but growing
7. **Series H** -- prestige tier, requires all other series to exist first

### BoxEngine Compatibility
All new boxes must use the existing `BoxEngine.js` config-driven architecture. No new engine features required for B-G. Series H may need a "multi-phase" extension for H3 and H10 (linking multiple box configs into a single engagement).

### Estimated Effort
- Per box: 8-16 hours (config, filesystem, hints, lore, testing)
- Per series: 80-160 hours
- Total B-H: 560-1120 hours
- Recommended pace: 1 series per sprint cycle (2-3 weeks)
