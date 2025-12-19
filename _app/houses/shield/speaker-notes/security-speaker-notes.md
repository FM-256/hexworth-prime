# Network Security - Speaker Notes

**Presentation:** security-presentation.html
**Slides:** 20
**Duration:** 75-90 minutes
**Certification Coverage:** Network+ N10-008 (4.1-4.5), Security+ SY0-701 (various), CCNA 200-301 (5.1-5.10)

---

## Slide 1: Title Slide - Network Security

### Key Points
- Security is ~20% of the Network+ exam - critical topic
- Security is everyone's responsibility, not just the security team
- Understanding threats helps design better defenses

### Instructor Notes
- **Opening Hook:** "Raise your hand if your organization has experienced a security incident in the past year. Keep it raised if you KNOW about it."
- Point: Most breaches go undetected for months - the average dwell time is 197 days
- Emphasize that network security is foundational to all IT roles

### Exam Relevance
- Network+ Domain 4: Security (19% of exam)
- Objectives 4.1-4.5 covered in this presentation
- Expect 15-20 questions directly on security topics

---

## Slide 2: CIA Triad

### Key Points
- Confidentiality: Only authorized access
- Integrity: Data hasn't been altered
- Availability: Systems accessible when needed

### Teaching Focus
Walk through real-world examples for each:

**Confidentiality:** "Your medical records should only be seen by you and your doctor. Encryption, access controls, and authentication maintain confidentiality."

**Integrity:** "When you receive a bank statement, you trust the numbers are correct. Hashing and digital signatures verify integrity."

**Availability:** "A hospital's systems MUST be available 24/7. Redundancy, backups, and DDoS protection maintain availability."

### Discussion Question
"Which is most important - confidentiality, integrity, or availability?"
Answer: It depends on the context!
- Hospital: Availability (systems must work to save lives)
- Bank: Integrity (transactions must be accurate)
- Military: Confidentiality (secrets must stay secret)

### Common Exam Question
"An attacker modifies data in transit. Which element of the CIA triad is compromised?"
Answer: Integrity

---

## Slide 3: Authentication Methods

### Key Points
- Something you know (passwords)
- Something you have (token, smart card)
- Something you are (biometrics)

### Teaching Focus: Defense in Depth

"Single-factor authentication is like having one lock on your door. Multi-factor is like having a lock, a deadbolt, AND an alarm system."

**Password Weaknesses:**
- Users choose weak passwords
- Users reuse passwords
- Passwords can be phished
- Brute force attacks

**Why MFA Matters:**
"Even if I steal your password, I still need your phone for the code. The attacker must compromise TWO factors."

### Biometrics Considerations
- **FAR (False Acceptance Rate):** Letting wrong person in
- **FRR (False Rejection Rate):** Locking right person out
- **CER (Crossover Error Rate):** Where FAR = FRR (optimal setting)

"If your fingerprint scanner is too sensitive, employees can't get in (high FRR). Too lenient, and imposters get in (high FAR)."

### Real-World Example
"The 2020 Twitter hack bypassed technical controls through social engineering. Attackers called support, pretended to be IT, and reset MFA. Technical controls are only as strong as people."

---

## Slide 4: AAA Framework

### Key Points
- Authentication: Who are you?
- Authorization: What can you do?
- Accounting: What did you do?

### Teaching Focus: AAA in Action

Walk through a network login scenario:

1. **Authentication:** User enters username/password, system verifies identity
2. **Authorization:** System checks what resources this user can access (VLAN, ACLs)
3. **Accounting:** Every action is logged - login time, commands executed, data accessed

### Why Accounting Matters
"Accounting is often overlooked but critical for:
- Compliance requirements (HIPAA, PCI-DSS, SOX)
- Forensics after an incident
- Billing (ISPs, cloud providers)
- Detecting anomalies"

### AAA Servers
- **RADIUS:** Most common, used for network access
- **TACACS+:** Cisco-developed, command-level authorization
- **Diameter:** Enhanced RADIUS for newer applications

### Exam Tip
"If a question mentions 'tracking user activity' or 'audit trail,' think ACCOUNTING. If it mentions 'verifying identity,' think AUTHENTICATION."

---

## Slide 5: RADIUS vs TACACS+

### Key Points
- RADIUS: UDP 1812/1813, combines authn/authz, encrypts password only
- TACACS+: TCP 49, separates AAA, encrypts entire packet

### Teaching Focus: When to Use Which

**Use RADIUS for:**
- VPN authentication
- Wireless (802.1X)
- Network device access (basic)
- Integration with many vendors

**Use TACACS+ for:**
- Cisco network device administration
- Granular command authorization
- When you need full encryption
- When you need reliable transport

### Key Differences Table

| Feature | RADIUS | TACACS+ |
|---------|--------|---------|
| Transport | UDP 1812, 1813 | TCP 49 |
| Encryption | Password only | Entire packet |
| AAA Separation | Combined | Separate |
| Vendor | Open standard | Cisco proprietary |
| Best for | Network access | Device admin |

### Real-World Scenario
"Your organization has 500 Cisco switches. You need to control who can run 'show' commands vs. who can run 'configure terminal.' Which protocol?"
Answer: TACACS+ - it provides command-level authorization

### Demo Idea
Show Cisco ISE or FreeRADIUS configuration for both protocols. Walk through the authentication flow.

---

## Slide 6: Kerberos

### Key Points
- Ticket-based authentication
- Uses KDC (Key Distribution Center)
- No passwords sent over network after initial auth

### Teaching Focus: The Kerberos Dance

Use an analogy: "Kerberos is like getting a wristband at an amusement park"

1. **Go to ticket booth (AS):** Show your ID (password), get a day pass (TGT)
2. **Day pass lets you get ride tickets (TGS):** Show TGT, get ticket for specific ride (service ticket)
3. **Use ride ticket:** Present service ticket to ride operator (server)

### Step-by-Step Flow
1. User sends username to KDC
2. KDC sends TGT encrypted with user's password hash
3. User decrypts TGT (proves they know password)
4. User presents TGT to get Service Ticket
5. User presents Service Ticket to access service
6. Service verifies ticket with KDC

### Why Kerberos is Secure
- Password never transmitted after initial auth
- Tickets expire (typically 10 hours)
- Mutual authentication (server proves identity too)
- Single Sign-On capability

### Common Attacks
- **Pass-the-Ticket:** Stealing valid tickets
- **Golden Ticket:** Forging TGTs with krbtgt hash
- **Kerberoasting:** Extracting service account hashes

### Exam Tip
"If a question mentions 'single sign-on,' 'tickets,' or 'Active Directory authentication,' think Kerberos."

---

## Slide 7: LDAP

### Key Points
- Directory access protocol
- Hierarchical database (tree structure)
- Used by Active Directory, OpenLDAP

### Teaching Focus: LDAP Structure

Draw the hierarchy:
```
dc=company,dc=com (Domain)
    └── ou=Users (Organizational Unit)
        ├── cn=John Smith
        ├── cn=Jane Doe
    └── ou=Computers
        ├── cn=Workstation1
    └── ou=Groups
        ├── cn=Admins
```

"Think of LDAP like a phone book - organized hierarchically, searchable, contains attributes about each entry."

### Distinguished Names (DNs)
"Every LDAP object has a unique path called a Distinguished Name"
Example: `cn=John Smith,ou=Users,dc=company,dc=com`

### LDAP vs LDAPS
- LDAP: Port 389, unencrypted
- LDAPS: Port 636, SSL/TLS encrypted
- Always use LDAPS in production!

### Integration Example
"Your HR system, email server, and VPN all query the same LDAP directory. Change a password once, it works everywhere. This is directory services."

### Security Concerns
- LDAP injection attacks
- Anonymous binds (disable them!)
- Credential exposure without TLS

---

## Slide 8: 802.1X Port-Based Access Control

### Key Points
- Supplicant (client) → Authenticator (switch/AP) → Authentication Server (RADIUS)
- Ports stay "unauthorized" until authentication succeeds
- EAP methods carry authentication data

### Teaching Focus: The 802.1X Process

Draw on board:
```
[Laptop]    ←EAPoL→    [Switch]    ←RADIUS→    [Auth Server]
Supplicant           Authenticator              (RADIUS)
```

Walk through the flow:
1. Device connects to port (no access)
2. Switch sends EAP-Request/Identity
3. Client responds with identity
4. Switch forwards to RADIUS
5. RADIUS challenges (depends on EAP method)
6. Client responds to challenge
7. RADIUS accepts or rejects
8. Switch opens port or blocks

### EAP Methods Comparison

**EAP-TLS:**
- Certificates on BOTH sides
- Strongest security
- Complex to deploy (PKI required)

**PEAP (Protected EAP):**
- Server certificate only
- Username/password for client
- Most common in enterprise

**EAP-FAST:**
- Uses PACs (Protected Access Credentials)
- Cisco developed
- Faster than PEAP

### Lab Suggestion
Configure a switch port for 802.1X, set up FreeRADIUS, test authentication with a laptop.

### Troubleshooting Tips
- Check supplicant software on client
- Verify RADIUS shared secret
- Check server certificate trust
- Review RADIUS logs

---

## Slide 9: Firewall Types

### Key Points
- Packet filtering: Stateless, header inspection
- Stateful: Tracks connections
- NGFW: Application awareness, IPS integration
- UTM: All-in-one security appliance

### Teaching Focus: Evolution of Firewalls

**Generation 1 - Packet Filtering:**
"Like a bouncer checking IDs. Only looks at source/destination IP and port. Doesn't know if you're actually going to behave inside."

**Generation 2 - Stateful:**
"Smarter bouncer. Remembers who came in, tracks their conversation. If someone claims to be replying to a conversation that never happened - blocked!"

**Generation 3 - Application Layer:**
"This bouncer reads the mail. Knows that what claims to be 'HTTP on port 80' is actually BitTorrent. Inspects the payload, not just the envelope."

**Generation 4 - NGFW:**
"Security team in a box. Firewall + IPS + Application control + User awareness + Threat intelligence. Can say 'Allow Facebook for marketing team only, block games.'"

### Deployment Scenarios

| Type | Use Case |
|------|----------|
| Packet Filter | High-speed, simple rules |
| Stateful | Standard enterprise edge |
| NGFW | Corporate HQ, sensitive data |
| UTM | Small/medium business |

### Real-World Configuration
"Enterprise NGFW policy: Allow HTTPS to the internet, but inspect it (SSL decryption), block known malware sites, allow Office 365 without inspection (for performance), alert on outbound connections to countries we don't do business with."

---

## Slide 10: Firewall Rules and Zones

### Key Points
- Rules processed top-to-bottom, first match wins
- Implicit deny at the end
- Zones: Trust (inside), Untrust (outside), DMZ

### Teaching Focus: Rule Order Matters!

Show this example:
```
Rule 1: Permit TCP from 10.0.0.0/8 to any port 443
Rule 2: Deny TCP from 10.0.0.50 to any port 443
Rule 3: (Implicit Deny All)
```

"What happens when 10.0.0.50 tries to access HTTPS?"
Answer: PERMITTED! Rule 1 matches first. Order matters!

Correct order:
```
Rule 1: Deny TCP from 10.0.0.50 to any port 443 (specific first!)
Rule 2: Permit TCP from 10.0.0.0/8 to any port 443
Rule 3: (Implicit Deny All)
```

### Zone Concepts

**Trust Zone (Inside):**
- Internal network
- Generally higher trust level
- Can initiate outbound connections

**Untrust Zone (Outside):**
- Internet
- Untrusted traffic
- Inbound blocked by default

**DMZ (Demilitarized Zone):**
- Publicly accessible servers
- Separate from internal network
- Limited access to inside

### Zone-Based Policy Example
"Inside → Outside: Allow web browsing
Outside → DMZ: Allow HTTPS to web server
DMZ → Inside: Allow database queries to specific server
Outside → Inside: DENY ALL"

### Common Mistakes
1. Overly permissive rules ("any any permit")
2. Wrong rule order
3. Not logging denied traffic
4. Not reviewing rules regularly

---

## Slide 11: VPN Overview

### Key Points
- Creates encrypted tunnel over public network
- Site-to-site connects offices
- Remote access for mobile workers

### Teaching Focus: Why VPN?

"Imagine you need to send a confidential letter through a public mail system where anyone can read it. VPN is like putting your letter in a locked box that only you and the recipient have keys for."

### Site-to-Site VPN

Draw the diagram:
```
[Office A] ← Encrypted Tunnel → [Office B]
   |              Internet           |
 [Users]                          [Servers]
```

"Users don't know they're using VPN - it's transparent. Traffic between offices is automatically encrypted."

### Remote Access VPN

```
[Home User] → [VPN Client] → Internet → [VPN Gateway] → [Corporate Network]
```

"User must connect VPN client before accessing work resources. All traffic goes through the encrypted tunnel."

### Split Tunneling

**Full Tunnel:** ALL traffic goes through VPN
- More secure (all traffic inspected)
- Higher latency for non-work traffic
- More bandwidth on corporate link

**Split Tunnel:** Only work traffic through VPN
- Better performance for personal use
- Less bandwidth on corporate link
- Risk: Internet traffic bypasses security

### VPN Technologies
- IPSec: Network layer, site-to-site
- SSL/TLS: Application layer, client-to-gateway
- WireGuard: Modern, fast, simple

---

## Slide 12: IPSec

### Key Points
- AH: Authentication only (no encryption)
- ESP: Encryption + Authentication
- IKE: Key exchange protocol

### Teaching Focus: IPSec Modes

**Transport Mode:**
- Encrypts only the payload
- Original IP header remains
- Used for host-to-host communication

**Tunnel Mode:**
- Encrypts entire original packet
- New IP header added
- Used for site-to-site VPNs

Draw it:
```
Transport: [IP Hdr][ESP][Payload][ESP Trailer]
Tunnel:    [New IP][ESP][Orig IP][Payload][ESP Trailer]
```

### IKE Phases

**Phase 1 (ISAKMP SA):**
- Negotiate encryption algorithm
- Exchange keys (Diffie-Hellman)
- Authenticate peers
- Creates secure channel for Phase 2

**Phase 2 (IPSec SA):**
- Negotiate IPSec parameters
- Create actual data tunnel
- Traffic can now flow

### Configuration Example (Conceptual)
```
crypto isakmp policy 10
  encryption aes 256
  hash sha256
  authentication pre-share
  group 14
  lifetime 86400

crypto ipsec transform-set MYSET esp-aes 256 esp-sha-hmac
```

### Troubleshooting IPSec
1. Verify Phase 1 completes (check IKE SA)
2. If Phase 1 fails: check pre-shared key, crypto settings
3. If Phase 2 fails: check transform set, interesting traffic

---

## Slide 13: SSL/TLS VPN

### Key Points
- Uses standard HTTPS (port 443)
- No special client needed for basic access
- Good for remote access, not site-to-site

### Teaching Focus: SSL VPN vs IPSec VPN

| Aspect | SSL/TLS VPN | IPSec VPN |
|--------|-------------|-----------|
| Layer | Application (7) | Network (3) |
| Port | 443 | ESP/AH + UDP 500/4500 |
| Firewall friendly | Yes | Often blocked |
| Client needed | Optional | Usually required |
| Best for | Remote access | Site-to-site |

### SSL VPN Types

**Clientless (Portal):**
- User opens browser, goes to portal URL
- Logs in, accesses web applications
- No client install needed
- Limited to web-based apps

**Client-Based (Tunnel):**
- Installs lightweight client
- Creates full tunnel
- Access any application
- More flexible

### Real-World Scenario
"During COVID-19 lockdowns, companies needed to quickly enable remote work. SSL VPN was often chosen because:
- Works through home firewalls
- No complex client installation
- Users just open browser and connect
- IT could enable it within days"

### Security Considerations
- Server certificate validation is critical
- Beware of phishing portal sites
- Enable MFA for VPN access
- Consider endpoint compliance checks

---

## Slide 14: IDS vs IPS

### Key Points
- IDS: Detection only (passive)
- IPS: Prevention (active/inline)
- Both use signatures and anomaly detection

### Teaching Focus: The Alarm vs Guard Analogy

**IDS = Security Camera + Alarm:**
"Watches everything, alerts when it sees something suspicious. But by the time security responds, the thief might be gone."

**IPS = Armed Guard:**
"Stands at the door, inspects everyone entering. If something looks wrong, blocks it immediately. No waiting for backup."

### Detection Methods

**Signature-Based:**
- Pattern matching (known attacks)
- Fast and accurate for known threats
- Useless against zero-days
- Needs constant updates

**Anomaly-Based:**
- Learns "normal" behavior
- Alerts on deviations
- Can catch new attacks
- Higher false positive rate

**Heuristic/Behavioral:**
- Looks for suspicious behavior patterns
- "This file is encrypting everything - ransomware!"
- Between signature and anomaly

### Deployment Locations

**Network-Based (NIDS/NIPS):**
- Monitor network traffic
- Placed at key chokepoints
- See everything on the wire

**Host-Based (HIDS/HIPS):**
- Monitor individual system
- See file changes, process activity
- Deeper visibility into host

### Common Exam Question
"Your manager wants to prevent attacks in real-time. Should you implement IDS or IPS?"
Answer: IPS - it can actively block attacks. IDS only detects.

---

## Slide 15: Common Network Attacks

### Key Points
- DoS/DDoS: Overwhelm resources
- MITM: Intercept communications
- Spoofing: Impersonate legitimate entities

### Teaching Focus: Attack Overview

**DoS vs DDoS:**
"DoS is one attacker, like one person blocking a doorway. DDoS is a flash mob of attackers - thousands of sources, much harder to stop."

**MITM Attack Flow:**
1. Attacker positions between victim and server
2. Intercepts all communication
3. Can read, modify, or inject data
4. Both parties think they're talking directly

Draw:
```
Normal:  [Alice] ←→ [Bob]
MITM:    [Alice] ←→ [Eve] ←→ [Bob]
```

**ARP Spoofing:**
"Attacker says 'I'm the gateway!' Victim sends traffic to attacker instead. Attacker forwards it on (to avoid detection). Perfect MITM setup."

### Spoofing Types
- **IP Spoofing:** Fake source IP
- **MAC Spoofing:** Fake MAC address
- **ARP Spoofing:** Fake ARP responses
- **DNS Spoofing:** Fake DNS responses

### Defense Mechanisms
- Rate limiting (against DoS)
- DAI - Dynamic ARP Inspection
- DNSSEC
- TLS/SSL for encryption
- Network segmentation

---

## Slide 16: DDoS Attack Types

### Key Points
- Volumetric: Flood with traffic
- Protocol: Exploit protocol weaknesses
- Application: Target layer 7

### Teaching Focus: Attack Categories

**Volumetric Attacks:**
"Imagine 10 million people calling your phone at once. The sheer volume prevents any real calls from getting through."
- Examples: UDP flood, ICMP flood, amplification attacks
- Defense: DDoS mitigation services, rate limiting

**Protocol Attacks:**
"Exploit weaknesses in how protocols work. SYN flood sends millions of connection requests but never completes them. Server runs out of resources waiting."
- Examples: SYN flood, Ping of Death, fragmentation attacks
- Defense: SYN cookies, proper timeouts

**Application Layer:**
"More sophisticated - looks like legitimate traffic. Slowloris opens connections and holds them open with tiny trickles of data. Server reaches max connections with few resources used."
- Examples: HTTP flood, Slowloris, DNS query flood
- Defense: WAF, rate limiting per IP, behavioral analysis

### Amplification Attacks Explained
"Attacker sends small request with spoofed source IP (victim's IP). Server sends large response to victim. Amplification factor can be 50x or more!"

Common amplification vectors:
- DNS: 50x amplification
- NTP: 556x amplification
- Memcached: 50,000x amplification!

### Real-World Example
"In 2016, the Mirai botnet used IoT devices to launch 1.2 Tbps DDoS against Dyn DNS. Major sites like Twitter, Netflix, Reddit went down. The botnet exploited default passwords on cameras and routers."

---

## Slide 17: Wireless Security

### Key Points
- WEP: Broken, never use
- WPA2: Current standard
- WPA3: Enhanced security

### Teaching Focus: Evolution of Wireless Security

**WEP (Wired Equivalent Privacy):**
"Marketing name was a lie - it's NOT equivalent to wired security. Uses RC4 with weak IVs. Can be cracked in minutes with freely available tools."

**WPA (Wi-Fi Protected Access):**
"Emergency fix while WPA2 was being developed. Still uses RC4 but with TKIP (changing keys). Better than WEP but deprecated."

**WPA2:**
"Uses AES encryption (strong). Personal uses pre-shared key (PSK), Enterprise uses 802.1X. Still secure if using strong passwords."

**WPA3:**
"Fixes WPA2 weaknesses:
- SAE (Simultaneous Authentication of Equals) prevents offline attacks
- Forward secrecy - past sessions stay secure even if key is compromised
- Protected Management Frames - prevents deauth attacks"

### Additional Wireless Security Measures

**MAC Filtering:**
"Only allow specific MAC addresses. Easily bypassed (MAC spoofing) but adds small layer of security."

**SSID Hiding:**
"Don't broadcast network name. Provides obscurity, not security. SSIDs are easily discovered."

**Rogue AP Detection:**
"Monitor for unauthorized access points. Could be employee bringing in personal router (policy violation) or attacker (evil twin)."

### Exam Tip
"If question asks about STRONGEST wireless security, answer is WPA3. For current standard in most deployments, answer is WPA2."

---

## Slide 18: Network Hardening

### Key Points
- Disable unnecessary services
- Change default credentials
- Implement access controls
- Keep systems patched

### Teaching Focus: Defense in Depth

"Network hardening is about reducing attack surface. Every unnecessary service, every default password, every open port is a potential entry point."

### Hardening Checklist

**Physical Security:**
- Lock network closets
- Secure console ports
- Disable unused ports

**Operating System:**
- Remove unnecessary services
- Apply security patches
- Configure host firewall

**Network Services:**
- Disable Telnet, use SSH
- Disable HTTP, use HTTPS
- SNMPv3 instead of v1/v2c

**Authentication:**
- Change default passwords (CRITICAL!)
- Implement MFA
- Use RADIUS/TACACS+

**Encryption:**
- VPN for remote access
- TLS for management
- WPA2/WPA3 for wireless

### Common Default Credentials
"You'd be shocked how many devices are still running default passwords:"
- admin/admin
- cisco/cisco
- root/root

"Shodan (search engine for devices) finds millions of devices with default creds. Don't be one of them!"

### Patch Management
"Patches fix known vulnerabilities. Every month you wait is another month attackers have to exploit published CVEs. Patch management must be:
- Regular (schedule patches)
- Tested (verify in lab first)
- Tracked (what's patched, what's not)"

---

## Slide 19: Security Best Practices

### Key Points
- Least privilege principle
- Separation of duties
- Defense in depth
- Security awareness training

### Teaching Focus: Security Principles

**Least Privilege:**
"Users get minimum access needed for their job. Accountant doesn't need admin rights. Developer doesn't need production access."

Real example: "The 2020 SolarWinds attack exploited excessive privileges. Compromised account had access to everything."

**Separation of Duties:**
"No single person can complete a critical task alone. Person who writes check can't sign it. Admin who creates account can't approve it."

**Defense in Depth:**
"Multiple layers of security. If one fails, others catch the threat."
Draw the layers:
```
[Physical] → [Network] → [Host] → [Application] → [Data]
  Locks       Firewall    AV        WAF           Encryption
  Cameras     IDS/IPS     HIPS      Auth          Access Control
```

**Security Awareness:**
"Humans are the weakest link. Phishing bypasses technical controls. Training helps users:
- Recognize phishing emails
- Report suspicious activity
- Follow security policies
- Use strong passwords"

### Security Frameworks
- **NIST Cybersecurity Framework:** Identify, Protect, Detect, Respond, Recover
- **CIS Controls:** Top 18 security controls prioritized by effectiveness
- **ISO 27001:** International security management standard

### Change Management
"All changes must go through a process:
1. Request the change
2. Assess risk and impact
3. Approve or deny
4. Implement with rollback plan
5. Document and review"

---

## Slide 20: Summary

### Critical Review

**Authentication Protocols:**
- RADIUS: UDP, network access, password encrypted
- TACACS+: TCP, device admin, fully encrypted
- Kerberos: Tickets, SSO, Windows/AD
- LDAP: Directory services, port 389/636

**Security Devices:**
- Firewall: Traffic filtering
- IDS: Detection only
- IPS: Prevention (inline)

**VPN Technologies:**
- IPSec: Network layer, site-to-site
- SSL/TLS: Application layer, remote access

**Wireless Security Hierarchy:**
WEP (broken) < WPA (deprecated) < WPA2 (good) < WPA3 (best)

### Practice Questions

1. "Which AAA protocol provides command-level authorization?"
   Answer: TACACS+

2. "What is the difference between IDS and IPS?"
   Answer: IDS detects and alerts; IPS actively blocks threats

3. "Which port does LDAPS use?"
   Answer: 636

4. "What type of attack sends millions of TCP SYN packets?"
   Answer: SYN flood (protocol-based DDoS)

5. "Which wireless security protocol uses SAE?"
   Answer: WPA3

6. "What is the purpose of the CIA triad?"
   Answer: Framework for information security - Confidentiality, Integrity, Availability

### Final Exam Tips
- Know the port numbers (RADIUS 1812/1813, TACACS+ 49, LDAP 389, LDAPS 636)
- Understand IDS vs IPS (detection vs prevention)
- Know firewall types and when to use each
- Memorize wireless security evolution (WEP → WPA → WPA2 → WPA3)

---

## Appendix: Lab Ideas

### Lab 1: Firewall Rule Configuration
- Configure ACLs on a router
- Test with ping and specific ports
- Demonstrate rule order importance

### Lab 2: VPN Setup
- Configure site-to-site IPSec VPN between two routers
- Verify tunnel establishment
- Test encrypted traffic flow

### Lab 3: 802.1X Configuration
- Set up RADIUS server (FreeRADIUS or Windows NPS)
- Configure switch for 802.1X
- Test authentication with laptop

### Lab 4: Packet Analysis
- Capture traffic with Wireshark
- Identify different protocols
- Compare encrypted vs unencrypted traffic

### Lab 5: Security Assessment
- Scan network with Nmap
- Identify open ports and services
- Document findings and recommendations

---

## Appendix: Additional Resources

### Certification Study
- CompTIA Network+ N10-008 Study Guide
- CompTIA Security+ SY0-701 (for deeper security coverage)
- Cisco CCNA 200-301 Security sections

### Tools to Explore
- Wireshark (packet analysis)
- Nmap (network scanning)
- Metasploit (penetration testing - lab only)
- OWASP ZAP (web application testing)

### Recommended Reading
- NIST Cybersecurity Framework
- CIS Controls v8
- OWASP Top 10

---

**Document Version:** 1.0
**Created:** 2025-12-09 by CCode-Delta
**For Use With:** Network Essentials v5.5.0+
