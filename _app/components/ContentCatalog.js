/**
 * ContentCatalog.js - Global Content Index for Hexworth Prime
 *
 * Provides a unified searchable index of ALL content across ALL houses.
 * Used by ContentDiscovery.js for global search functionality.
 *
 * Usage:
 *   ContentCatalog.search('linux')  // Returns modules from all houses
 *   ContentCatalog.getHouseModules('script')  // Get modules for specific house
 *   ContentCatalog.getAllModules()  // Get everything
 */

const ContentCatalog = (function() {
    'use strict';

    // House metadata
    const HOUSES = {
        eye: {
            id: 'eye',
            name: 'House of the Eye',
            icon: '👁️',
            color: '#c084fc',
            description: 'Monitoring, Analysis & Security Operations',
            basePath: 'houses/eye/'
        },
        code: {
            id: 'code',
            name: 'House of Code',
            icon: '💻',
            color: '#4ade80',
            description: 'Development, DevOps & Infrastructure',
            basePath: 'houses/code/'
        },
        key: {
            id: 'key',
            name: 'House of the Key',
            icon: '🔑',
            color: '#f472b6',
            description: 'Cryptography & Secrets',
            basePath: 'houses/key/'
        },
        shield: {
            id: 'shield',
            name: 'House of the Shield',
            icon: '🛡️',
            color: '#f87171',
            description: 'Security & Defense',
            basePath: 'houses/shield/'
        },
        script: {
            id: 'script',
            name: 'House of Script',
            icon: '📜',
            color: '#a78bfa',
            description: 'Scripting, Automation & Linux',
            basePath: 'houses/script/'
        },
        cloud: {
            id: 'cloud',
            name: 'House of the Cloud',
            icon: '☁️',
            color: '#38bdf8',
            description: 'Cloud Infrastructure & Services',
            basePath: 'houses/cloud/'
        },
        forge: {
            id: 'forge',
            name: 'House of the Forge',
            icon: '⚒️',
            color: '#fbbf24',
            description: 'Hardware & Operating Systems',
            basePath: 'houses/forge/'
        },
        web: {
            id: 'web',
            name: 'House of the Web',
            icon: '🕸️',
            color: '#60a5fa',
            description: 'Networking & Connections',
            basePath: 'houses/web/'
        },
        'dark-arts': {
            id: 'dark-arts',
            name: 'House of the Dark Arts',
            icon: '🌑',
            color: '#9333ea',
            description: 'Offensive Security & Ethical Hacking',
            basePath: 'houses/dark-arts/'
        }
    };

    // Global module index - all modules from all houses
    // Each module has a 'house' property indicating its source
    const MODULES = [
        // ═══════════════════════════════════════════════════════════════════
        // HOUSE OF THE EYE - Monitoring & Analysis
        // ═══════════════════════════════════════════════════════════════════
        // ═══════════════════════════════════════════════════════════════════
        // HOUSE OF THE DARK ARTS - Offensive Security & Ethical Hacking
        // ═══════════════════════════════════════════════════════════════════
        // Foundations of Ethical Hacking (FEH) Course
        { house: 'dark-arts', id: 'dark-arts-feh-01', title: 'The Hacker Mindset', description: 'Ethics, legality, hacker types, kill chain', icon: '🧠', status: 'available', components: ['presentation'], href: 'presentations/dark-arts-feh-01.presentation.html', tags: ['feh', 'ethics', 'hacking', 'kill chain'] },
        { house: 'dark-arts', id: 'dark-arts-feh-02', title: 'Reconnaissance & OSINT', description: 'Google dorking, whois, Shodan, footprinting', icon: '🔍', status: 'available', components: ['presentation'], href: 'presentations/dark-arts-feh-02.presentation.html', tags: ['feh', 'osint', 'recon', 'shodan', 'dorking'] },
        { house: 'dark-arts', id: 'dark-arts-feh-03', title: 'Scanning & Enumeration', description: 'Nmap, port scanning, service fingerprinting', icon: '📡', status: 'available', components: ['presentation'], href: 'presentations/dark-arts-feh-03.presentation.html', tags: ['feh', 'nmap', 'scanning', 'enumeration', 'ports'] },
        { house: 'dark-arts', id: 'dark-arts-feh-04', title: 'Vulnerability Assessment', description: 'CVEs, CVSS, vulnerability databases', icon: '🎯', status: 'available', components: ['presentation'], href: 'presentations/dark-arts-feh-04.presentation.html', tags: ['feh', 'cve', 'cvss', 'vulnerabilities'] },
        { house: 'dark-arts', id: 'dark-arts-feh-05', title: 'System Exploitation', description: 'Password attacks, privilege escalation', icon: '💀', status: 'available', components: ['presentation'], href: 'presentations/dark-arts-feh-05.presentation.html', tags: ['feh', 'exploitation', 'passwords', 'privilege escalation'] },
        { house: 'dark-arts', id: 'dark-arts-feh-06', title: 'Web Application Security', description: 'OWASP Top 10, injection, XSS, CSRF', icon: '🕸️', status: 'available', components: ['presentation'], href: 'presentations/dark-arts-feh-06.presentation.html', tags: ['feh', 'owasp', 'web', 'xss', 'csrf', 'injection'] },
        { house: 'dark-arts', id: 'dark-arts-feh-07', title: 'Network Attacks & Defense', description: 'Sniffing, MITM, ARP poisoning', icon: '🌐', status: 'available', components: ['presentation'], href: 'presentations/dark-arts-feh-07.presentation.html', tags: ['feh', 'mitm', 'arp', 'sniffing', 'network attacks'] },
        { house: 'dark-arts', id: 'dark-arts-feh-08', title: 'Social Engineering', description: 'Phishing, pretexting, physical security', icon: '🎭', status: 'available', components: ['presentation'], href: 'presentations/dark-arts-feh-08.presentation.html', tags: ['feh', 'social engineering', 'phishing', 'pretexting'] },
        { house: 'dark-arts', id: 'dark-arts-feh-09', title: 'Cryptography & Steganography', description: 'Encryption, hashing, data hiding', icon: '🔐', status: 'available', components: ['presentation'], href: 'presentations/dark-arts-feh-09.presentation.html', tags: ['feh', 'crypto', 'steganography', 'encryption', 'hashing'] },
        { house: 'dark-arts', id: 'dark-arts-feh-10', title: 'Malware Analysis Basics', description: 'Types, behavior, static/dynamic analysis', icon: '🦠', status: 'available', components: ['presentation'], href: 'presentations/dark-arts-feh-10.presentation.html', tags: ['feh', 'malware', 'analysis', 'static', 'dynamic'] },
        // CyberOps Certification
        { house: 'dark-arts', id: 'dark-arts-cyberops-200201', title: 'CyberOps Associate 200-201', description: 'Cisco CyberOps certification prep: SOC fundamentals, threat analysis, incident response', icon: '🎯', status: 'available', components: ['presentation', 'applet', 'lab', 'quiz'], href: '../eye/modules/cyberops/index.html', tags: ['cyberops', 'cisco', 'certification', 'soc'] },
        // Vault Tier 1 — Apprentice
        { house: 'dark-arts', id: 'dark-arts-sandbox-setup', title: 'Sandbox Lab Setup', description: 'Build safe analysis environments. REMnux, FlareVM, network isolation, and VM hardening.', icon: '🧪', status: 'available', components: ['lab'], href: '../../dark-arts/vault/modules/sandbox-setup.module.html', tags: ['vault', 'sandbox', 'remnux', 'flarevm', 'malware'] },
        { house: 'dark-arts', id: 'dark-arts-static-analysis', title: 'Static Analysis 101', description: 'Examine malware without execution. PE headers, imports, strings, and entropy analysis.', icon: '🔬', status: 'available', components: ['lab'], href: '../../dark-arts/vault/modules/static-analysis.module.html', tags: ['vault', 'static analysis', 'pe headers', 'malware', 'entropy'] },
        // Vault Tier 2 — Journeyman
        { house: 'dark-arts', id: 'dark-arts-malware-families', title: 'Malware Families', description: 'Historical case studies. WannaCry, EMOTET, Stuxnet, Slowloris, NotPetya with kill chains and IOCs.', icon: '📚', status: 'available', components: ['lab'], href: '../../dark-arts/vault/modules/malware-families.module.html', tags: ['vault', 'malware', 'wannacry', 'emotet', 'stuxnet', 'notpetya'] },
        { house: 'dark-arts', id: 'dark-arts-behavioral-analysis', title: 'Behavioral Analysis', description: 'Understand what malware does. Kill chains, persistence, C2 communication patterns.', icon: '🎭', status: 'available', components: ['lab'], href: '../../dark-arts/vault/modules/behavioral-analysis.module.html', tags: ['vault', 'behavioral', 'malware', 'c2', 'persistence'] },
        { house: 'dark-arts', id: 'dark-arts-dynamic-analysis', title: 'Dynamic Analysis', description: 'Execute and observe. Process monitoring, API tracing, network capture, and sandbox automation.', icon: '▶️', status: 'available', components: ['lab'], href: '../../dark-arts/vault/modules/dynamic-analysis.module.html', tags: ['vault', 'dynamic analysis', 'malware', 'sandbox', 'api tracing'] },
        { house: 'dark-arts', id: 'dark-arts-reverse-engineering', title: 'Reverse Engineering', description: 'Assembly fundamentals, disassemblers, control flow analysis, and anti-analysis techniques.', icon: '🔧', status: 'available', components: ['lab'], href: '../../dark-arts/vault/modules/reverse-engineering.module.html', tags: ['vault', 'reverse engineering', 'assembly', 'disassembly', 'ida', 'ghidra'] },
        // Vault Tier 3 — Adept
        { house: 'dark-arts', id: 'dark-arts-incident-response', title: 'Incident Response', description: 'NIST IR framework, containment strategies, SIEM analysis, and full tabletop exercise.', icon: '🚨', status: 'available', components: ['lab'], href: '../../dark-arts/vault/modules/incident-response.module.html', tags: ['vault', 'incident response', 'nist', 'siem', 'containment'] },
        // Vault Tools & Resources
        { house: 'dark-arts', id: 'dark-arts-analysis-toolkit', title: 'Analysis Toolkit', description: 'Hex decoder, Base64 tools, XOR brute force, entropy calculator, IOC extractor, and more.', icon: '🧰', status: 'available', components: ['tool'], href: '../../dark-arts/vault/tools/analysis-toolkit.html', tags: ['vault', 'tool', 'hex', 'base64', 'xor', 'entropy', 'ioc'] },
        { house: 'dark-arts', id: 'dark-arts-john-training', title: 'John the Ripper Training', description: 'Interactive password cracking simulator. Dictionary, brute-force, and rule-based attacks.', icon: '🔓', status: 'available', components: ['tool', 'lab'], href: '../../dark-arts/vault/tools/john-training.html', tags: ['vault', 'john', 'password cracking', 'dictionary', 'brute force'] },
        { house: 'dark-arts', id: 'dark-arts-hashcat-training', title: 'Hashcat Training', description: 'GPU-accelerated cracking simulator. Mask attacks, hybrid modes, and hash identification.', icon: '⚡', status: 'available', components: ['tool', 'lab'], href: '../../dark-arts/vault/tools/hashcat-training.html', tags: ['vault', 'hashcat', 'gpu', 'password cracking', 'hash'] },
        { house: 'dark-arts', id: 'dark-arts-nmap-training', title: 'Nmap Training Lab', description: 'Network scanning simulator. SYN scans, service detection, OS fingerprinting, and NSE scripts.', icon: '🔍', status: 'available', components: ['tool', 'lab'], href: '../../dark-arts/vault/tools/nmap-training.html', tags: ['vault', 'nmap', 'scanning', 'network', 'nse'] },
        { house: 'dark-arts', id: 'dark-arts-metasploit-training', title: 'Metasploit Basics', description: 'Interactive msfconsole simulator. Exploits, payloads, and penetration testing workflow.', icon: '💀', status: 'available', components: ['tool', 'lab'], href: '../../dark-arts/vault/tools/metasploit-training.html', tags: ['vault', 'metasploit', 'msfconsole', 'exploits', 'payloads'] },
        { house: 'dark-arts', id: 'dark-arts-hydra-training', title: 'Hydra Training Lab', description: 'Password brute-forcing simulator. 50+ protocols including SSH, FTP, HTTP, SMB, RDP, and databases.', icon: '🔑', status: 'available', components: ['tool', 'lab'], href: '../../dark-arts/vault/tools/hydra-training.html', tags: ['vault', 'hydra', 'brute force', 'ssh', 'ftp', 'password'] },
        { house: 'dark-arts', id: 'dark-arts-mastery-quiz', title: 'Dark Arts Mastery Quiz', description: '25 questions covering static analysis, behavioral analysis, malware families, and threat intelligence.', icon: '📝', status: 'available', components: ['quiz'], href: '../../dark-arts/vault/quizzes/dark-arts-quiz.html', tags: ['vault', 'quiz', 'malware', 'assessment'] },
        { house: 'dark-arts', id: 'dark-arts-cyber-kill-chain', title: 'Cyber Kill Chain', description: 'The 7-phase attack framework. Attacker methodology, MITRE ATT&CK mapping, and defense strategies.', icon: '⚔️', status: 'available', components: ['presentation'], href: '../../dark-arts/vault/cyber-kill-chain.html', tags: ['vault', 'kill chain', 'mitre', 'attack framework'] },
        { house: 'dark-arts', id: 'dark-arts-sql-injection-lab', title: 'SQL Injection Lab', description: 'Master SQLi attacks: error-based, blind, and UNION injection with interactive simulator and payload library.', icon: '💉', status: 'available', components: ['lab'], href: '../../dark-arts/vault/sql-injection-lab.html', tags: ['vault', 'sql injection', 'sqli', 'owasp', 'web'] },
        { house: 'dark-arts', id: 'dark-arts-xss-lab', title: 'XSS Attacks Lab', description: 'Cross-Site Scripting mastery: reflected, stored, and DOM-based XSS with sandbox, payload builder, and filter bypass.', icon: '🎯', status: 'available', components: ['lab'], href: '../../dark-arts/vault/xss-attacks-lab.html', tags: ['vault', 'xss', 'cross-site scripting', 'owasp', 'web'] },
        { house: 'dark-arts', id: 'dark-arts-ctf-leaderboard', title: 'CTF Leaderboard', description: 'Track CTF competition scores. Podium display, team management, and live score updates.', icon: '🏆', status: 'available', components: ['applet'], href: '../../dark-arts/ctf-leaderboard.applet.html', tags: ['vault', 'ctf', 'leaderboard', 'competition'] },
        { house: 'dark-arts', id: 'dark-arts-nmap-scanning-lab', title: 'Nmap Scanning Lab', description: 'Network reconnaissance mastery. Host discovery, port scanning, OS fingerprinting, and IDS evasion.', icon: '🔍', status: 'available', components: ['lab'], href: '../../dark-arts/vault/nmap-scanning-lab.html', tags: ['vault', 'nmap', 'reconnaissance', 'ids evasion'] },
        { house: 'dark-arts', id: 'dark-arts-password-attacks-lab', title: 'Password Attacks Lab', description: 'Cracking techniques: dictionary, brute force, rainbow tables. John, Hashcat, and Mimikatz mastery.', icon: '🔓', status: 'available', components: ['lab'], href: '../../dark-arts/vault/password-attacks-lab.html', tags: ['vault', 'password', 'cracking', 'rainbow tables', 'mimikatz'] },
        { house: 'dark-arts', id: 'dark-arts-wireless-attacks-lab', title: 'Wireless Attacks Lab', description: 'WiFi hacking: WPA handshake capture, deauth attacks, evil twin, aircrack-ng suite mastery.', icon: '📡', status: 'available', components: ['lab'], href: '../../dark-arts/vault/wireless-attacks-lab.html', tags: ['vault', 'wireless', 'wifi', 'wpa', 'aircrack', 'deauth'] },
        { house: 'dark-arts', id: 'dark-arts-malware-analysis-lab', title: 'Malware Analysis Lab', description: 'Comprehensive malware analysis: Trojans, viruses, APT, fileless malware. Static & dynamic analysis with sandbox simulator.', icon: '🦠', status: 'available', components: ['lab'], href: '../../dark-arts/vault/malware-analysis-lab.html', tags: ['vault', 'malware', 'trojan', 'apt', 'fileless'] },
        { house: 'dark-arts', id: 'dark-arts-dos-ddos-lab', title: 'DoS/DDoS Attacks Lab', description: 'Denial of service mastery: volumetric, protocol, application layer attacks. Botnet architecture and defense mechanisms.', icon: '💥', status: 'available', components: ['lab'], href: '../../dark-arts/vault/dos-ddos-lab.html', tags: ['vault', 'dos', 'ddos', 'botnet', 'denial of service'] },
        { house: 'dark-arts', id: 'dark-arts-session-hijacking-lab', title: 'Session Hijacking Lab', description: 'Session takeover techniques: cookie theft, TCP hijacking, MitM attacks. Interactive flow visualizer and defense strategies.', icon: '🎭', status: 'available', components: ['lab'], href: '../../dark-arts/vault/session-hijacking-lab.html', tags: ['vault', 'session hijacking', 'cookies', 'mitm', 'tcp'] },
        { house: 'dark-arts', id: 'dark-arts-iot-security-lab', title: 'IoT Security Lab', description: 'IoT attack vectors: firmware exploitation, default credentials, protocol vulnerabilities. Network topology builder and scanner simulator.', icon: '📱', status: 'available', components: ['lab'], href: '../../dark-arts/vault/iot-security-lab.html', tags: ['vault', 'iot', 'firmware', 'embedded', 'protocols'] },
        { house: 'dark-arts', id: 'dark-arts-botnet-architecture', title: 'Botnet Architecture & C2', description: 'Command & control infrastructure: centralized, P2P, hybrid. Famous botnets, infection spread visualization, and takedown methods.', icon: '🕸️', status: 'available', components: ['presentation'], href: '../../dark-arts/vault/botnet-architecture.presentation.html', tags: ['vault', 'botnet', 'c2', 'command and control', 'p2p'] },
        { house: 'dark-arts', id: 'dark-arts-owasp-top10-lab', title: 'OWASP Top 10 Lab', description: 'All 10 web attack categories: injection, broken auth, XSS, SSRF. Vulnerable app simulator and security checklist.', icon: '🌐', status: 'available', components: ['lab'], href: '../../dark-arts/vault/owasp-top10-lab.html', tags: ['vault', 'owasp', 'top 10', 'web security', 'injection'] },
        { house: 'dark-arts', id: 'dark-arts-ids-evasion-lab', title: 'IDS/IPS Evasion Lab', description: 'Snort rules, firewall bypass, fragmentation, TTL attacks. IDS rule builder and evasion technique simulator.', icon: '🛡️', status: 'available', components: ['lab'], href: '../../dark-arts/vault/ids-evasion-lab.html', tags: ['vault', 'ids', 'ips', 'snort', 'firewall bypass', 'evasion'] },
        { house: 'dark-arts', id: 'dark-arts-cloud-hacking-lab', title: 'Cloud Hacking Lab', description: 'AWS S3 enumeration, IAM privilege escalation, SSRF to metadata service, Kubernetes attacks. PACU and CloudGOAT tools.', icon: '☁️', status: 'available', components: ['lab'], href: '../../dark-arts/vault/cloud-hacking-lab.html', tags: ['vault', 'cloud', 'aws', 'iam', 'ssrf', 'kubernetes'] },
        { house: 'dark-arts', id: 'dark-arts-mobile-security-lab', title: 'Mobile Security Lab', description: 'Android rooting, iOS jailbreaking, ADB commands, mobile attack vectors. Permission analyzer and MDM policy configurator.', icon: '📱', status: 'available', components: ['lab'], href: '../../dark-arts/vault/mobile-security-lab.html', tags: ['vault', 'mobile', 'android', 'ios', 'adb', 'jailbreak'] },
        { house: 'dark-arts', id: 'dark-arts-steganography-lab', title: 'Steganography Lab', description: 'LSB image encoding, text steganography, steganalysis challenges. Hide and reveal secret messages with visual comparison.', icon: '🖼️', status: 'available', components: ['lab'], href: '../../dark-arts/vault/steganography-lab.html', tags: ['vault', 'steganography', 'lsb', 'image', 'hidden data'] },
        { house: 'dark-arts', id: 'dark-arts-network-sniffing-lab', title: 'Network Sniffing Lab', description: 'CAM flooding, VLAN hopping, ARP spoofing, Wireshark filters. Interactive topology and packet flow animations.', icon: '📡', status: 'available', components: ['lab'], href: '../../dark-arts/vault/network-sniffing-lab.html', tags: ['vault', 'sniffing', 'wireshark', 'arp spoofing', 'vlan hopping'] },
        { house: 'dark-arts', id: 'dark-arts-buffer-overflow-lab', title: 'Buffer Overflow Lab', description: 'Stack-based overflows, shellcode injection, return address manipulation. Memory visualization and exploit development.', icon: '💾', status: 'available', components: ['lab'], href: '../../dark-arts/vault/buffer-overflow-lab.html', tags: ['vault', 'buffer overflow', 'shellcode', 'stack', 'exploit'] },
        { house: 'dark-arts', id: 'dark-arts-enumeration-lab', title: 'Enumeration Lab', description: 'Service enumeration, user discovery, share mapping. SMB, LDAP, SNMP, and DNS zone transfers.', icon: '📋', status: 'available', components: ['lab'], href: '../../dark-arts/vault/enumeration-lab.html', tags: ['vault', 'enumeration', 'smb', 'ldap', 'snmp', 'dns'] },
        { house: 'dark-arts', id: 'dark-arts-footprinting-lab', title: 'Footprinting Lab', description: 'Passive and active reconnaissance. OSINT, WHOIS, DNS recon, and network mapping techniques.', icon: '👣', status: 'available', components: ['lab'], href: '../../dark-arts/vault/footprinting-lab.html', tags: ['vault', 'footprinting', 'recon', 'osint', 'whois', 'dns'] },
        { house: 'dark-arts', id: 'dark-arts-network-scanning-lab', title: 'Network Scanning Lab', description: 'Host discovery, port scanning strategies, service detection. TCP/UDP scans, stealth techniques, and timing options.', icon: '🔎', status: 'available', components: ['lab'], href: '../../dark-arts/vault/network-scanning-lab.html', tags: ['vault', 'scanning', 'network', 'tcp', 'udp', 'stealth'] },
        { house: 'dark-arts', id: 'dark-arts-privilege-escalation-lab', title: 'Privilege Escalation Lab', description: 'Linux and Windows privesc techniques. SUID binaries, kernel exploits, misconfigurations, and credential harvesting.', icon: '⬆️', status: 'available', components: ['lab'], href: '../../dark-arts/vault/privilege-escalation-lab.html', tags: ['vault', 'privilege escalation', 'suid', 'kernel', 'privesc'] },
        { house: 'dark-arts', id: 'dark-arts-social-engineering-advanced', title: 'Social Engineering Advanced', description: 'Advanced pretexting, vishing, physical access attacks. Campaign planning and human psychology exploitation.', icon: '🎭', status: 'available', components: ['lab'], href: '../../dark-arts/vault/social-engineering-advanced.html', tags: ['vault', 'social engineering', 'vishing', 'pretexting', 'physical'] },
        { house: 'dark-arts', id: 'dark-arts-ceh-attack-reference', title: 'CEH v12 Attack Reference', description: 'EC-Council Certified Ethical Hacker reference: Cyber Kill Chain, MITRE ATT&CK, reconnaissance, exploitation, and post-exploitation tools.', icon: '⚔️', status: 'available', components: ['presentation'], href: '../../dark-arts/vault/ceh-attack-reference.html', tags: ['vault', 'ceh', 'certification', 'mitre', 'attack'] },
        { house: 'dark-arts', id: 'dark-arts-csrf-lab', title: 'CSRF Attack Lab', description: 'Cross-Site Request Forgery mastery. Forged requests, session riding, defense mechanisms with SameSite and tokens.', icon: '🔀', status: 'available', components: ['lab'], href: '../../dark-arts/vault/csrf-attack-lab.html', tags: ['vault', 'csrf', 'cross-site request forgery', 'owasp', 'tokens'] },
        { house: 'dark-arts', id: 'dark-arts-ssrf-lab', title: 'SSRF Attack Lab', description: 'Server-Side Request Forgery. Internal network access, cloud metadata theft, bypass techniques, and DNS rebinding.', icon: '🌐', status: 'available', components: ['lab'], href: '../../dark-arts/vault/ssrf-attack-lab.html', tags: ['vault', 'ssrf', 'server-side request forgery', 'metadata', 'dns rebinding'] },
        { house: 'dark-arts', id: 'dark-arts-idor-lab', title: 'IDOR Attack Lab', description: 'Insecure Direct Object Reference. ID enumeration, horizontal/vertical privesc, authorization bypass techniques.', icon: '🔢', status: 'available', components: ['lab'], href: '../../dark-arts/vault/idor-attack-lab.html', tags: ['vault', 'idor', 'authorization bypass', 'access control'] },
        { house: 'dark-arts', id: 'dark-arts-jwt-lab', title: 'JWT Attack Lab', description: 'JSON Web Token exploitation. Algorithm confusion, signature bypass, claim manipulation, and token forging.', icon: '🎫', status: 'available', components: ['lab'], href: '../../dark-arts/vault/jwt-attack-lab.html', tags: ['vault', 'jwt', 'json web token', 'algorithm confusion', 'signature bypass'] },
        { house: 'eye', id: 'eye-wireshark-training', title: 'Wireshark Training Lab', description: 'Master network protocol analysis with interactive filter practice and challenges', icon: '🦈', status: 'available', components: ['presentation', 'applet', 'lab', 'quiz'], href: 'tools/wireshark-training.html' },
        { house: 'eye', id: 'eye-packet-analyzer', title: 'Packet Analyzer', description: 'Interactive Wireshark-style packet analysis tool', icon: '📡', status: 'available', components: ['applet'], href: 'tools/packet-analyzer.html' },
        { house: 'eye', id: 'eye-traffic-lab', title: 'Traffic Analysis Lab', description: 'Hands-on exercises analyzing real network traffic patterns', icon: '🔬', status: 'available', components: ['lab'], href: 'labs/traffic-lab.html' },
        { house: 'eye', id: 'eye-log-analysis', title: 'Log Analysis Basics', description: 'Reading and interpreting system logs for security insights', icon: '📋', status: 'available', components: ['presentation', 'applet', 'lab'], href: 'presentations/log-basics.html' },
        { house: 'eye', id: 'eye-siem-intro', title: 'SIEM Introduction', description: 'Understanding Security Information and Event Management systems', icon: '🎯', status: 'available', components: ['presentation', 'applet'], href: 'presentations/siem-fundamentals.html' },
        { house: 'eye', id: 'eye-splunk-basics', title: 'Splunk Fundamentals', description: 'Search Processing Language (SPL) and basic queries', icon: '🔍', status: 'available', components: ['presentation', 'applet', 'lab'], href: 'tools/siem-simulator.html' },
        { house: 'eye', id: 'eye-threat-hunting', title: 'Threat Hunting', description: 'Proactive search for threats in your environment', icon: '🎯', status: 'available', components: ['presentation', 'applet', 'quiz'], href: 'presentations/threat-hunting.html' },
        { house: 'eye', id: 'eye-incident-timeline', title: 'Incident Timeline', description: 'Constructing chronological event sequences for investigations', icon: '⏱️', status: 'available', components: ['presentation', 'applet'], href: 'labs/correlation-lab.html' },
        { house: 'eye', id: 'eye-soc-lab', title: 'SOC Operations Lab', description: 'Security Operations Center workflow simulation', icon: '🛡️', status: 'available', components: ['lab'], href: 'labs/soc-lab.html' },
        { house: 'eye', id: 'eye-google-dorking-reference', title: 'Google Dorking Reference', description: 'Advanced Google search operators for OSINT', icon: '🔍', status: 'available', components: ['applet'], href: 'tools/google-dorking-reference.html' },
        { house: 'eye', id: 'eye-log-centipede', title: 'Log Centipede', description: 'Centipede style game as SIEM analyst hunting log entries', icon: '🐛', status: 'available', components: ['game'], href: 'games/log-centipede.html', tags: ['game', 'arcade', 'centipede', 'siem', 'logs'] },
        { house: 'eye', id: 'eye-log-detective', title: 'Log Detective', description: 'Investigate system logs to identify security incidents and anomalies', icon: '🔍', status: 'available', components: ['lab'], href: 'labs/log-detective.html', tags: ['lab', 'logs', 'siem', 'investigation', 'forensics'] },
        { house: 'eye', id: 'eye-incident-timeline-lab', title: 'Incident Timeline', description: 'Reconstruct incident timelines from event data and log correlations', icon: '⏱️', status: 'available', components: ['lab'], href: 'labs/incident-timeline.html', tags: ['lab', 'incident', 'timeline', 'forensics', 'investigation'] },

        // ═══════════════════════════════════════════════════════════════════
        // HOUSE OF SCRIPT - Scripting, Automation & Linux
        // ═══════════════════════════════════════════════════════════════════
        // Linux Fundamentals
        { house: 'script', id: 'script-linux-basics', title: 'Linux Command Line Basics', description: 'Essential Linux commands and navigation', icon: '🐧', status: 'available', components: ['presentation', 'applet', 'lab'], href: 'applets/linux/linux-command-simulator.html', tags: ['linux', 'cli', 'terminal', 'bash'] },
        { house: 'script', id: 'script-linux-filesystem', title: 'Linux File System', description: 'Understanding Linux directory structure', icon: '📁', status: 'available', components: ['applet'], href: 'applets/linux/linux-filesystem-navigator.html', tags: ['linux', 'filesystem', 'directories'] },
        { house: 'script', id: 'script-linux-permissions', title: 'Linux Permissions', description: 'File ownership and access control', icon: '🔐', status: 'available', components: ['applet'], href: 'applets/linux/linux-permissions-calculator.html', tags: ['linux', 'permissions', 'chmod', 'security'] },
        { house: 'script', id: 'script-bash-scripting', title: 'Bash Scripting', description: 'Write shell scripts for automation', icon: '🐚', status: 'available', components: ['applet'], href: 'applets/linux/bash-scripting-playground.html', tags: ['bash', 'scripting', 'automation', 'shell'] },
        { house: 'script', id: 'script-linux-lab-001', title: 'L-001: User Identity', description: 'Learn whoami, id, and groups commands', icon: '🐧', status: 'available', components: ['lab'], href: 'applets/linux/linux-lab-001-user-identity.html', tags: ['linux', 'lab', 'identity'] },
        { house: 'script', id: 'script-linux-lab-002', title: 'L-002: File Navigation', description: 'Navigate with pwd, ls, and cd commands', icon: '🐧', status: 'available', components: ['lab'], href: 'applets/linux/linux-lab-002-file-navigation.html', tags: ['linux', 'lab', 'navigation'] },
        { house: 'script', id: 'script-command-translator', title: 'Command Translator', description: 'Translate commands between Linux, Windows, and macOS', icon: '🔄', status: 'available', components: ['applet'], href: 'applets/linux/command-translator.html', tags: ['linux', 'windows', 'macos', 'commands'] },
        { house: 'script', id: 'script-macos-linux-lab', title: 'macOS & Linux Lab', description: 'Hands-on practice with macOS and Linux systems', icon: '🍎', status: 'available', components: ['lab'], href: 'applets/linux/lab-macos-linux.html', tags: ['linux', 'macos', 'lab'] },
        { house: 'script', id: 'script-macos-linux-basics', title: 'macOS & Linux Basics', description: 'Introduction to macOS and Linux operating systems', icon: '🖥️', status: 'available', components: ['presentation'], href: 'presentations/macos-linux-basics.html', tags: ['linux', 'macos', 'basics'] },
        { house: 'script', id: 'script-linux-quiz', title: 'Linux Basics Quiz', description: 'Test your Linux knowledge', icon: '📝', status: 'available', components: ['quiz'], href: 'quizzes/linux-basics-quiz.html', tags: ['linux', 'quiz'] },

        // Zero to Python
        { house: 'script', id: 'zero-to-python', title: 'Zero to Python', description: 'Complete 8-chapter immersive Python course with Learn→Do→Repeat pattern', icon: '🐍', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'modules/python/index.html', tags: ['python', 'programming', 'course'], featured: true },
        { house: 'script', id: 'script-python-basics', title: 'Python Basics', description: 'Introduction to Python programming', icon: '🐍', status: 'available', components: ['applet'], href: 'applets/python/python-chapter1-applet.html', tags: ['python'] },
        { house: 'script', id: 'script-python-strings', title: 'Python Strings', description: 'String manipulation and operations', icon: '📝', status: 'available', components: ['applet'], href: 'applets/python/python-chapter2-strings.html', tags: ['python', 'strings'] },
        { house: 'script', id: 'script-python-flow-control', title: 'Python Flow Control', description: 'Conditionals, loops, and program flow', icon: '🔄', status: 'available', components: ['applet'], href: 'applets/python/python-chapter3-flow-control.html', tags: ['python', 'loops', 'conditionals'] },
        { house: 'script', id: 'script-python-functions', title: 'Python Functions', description: 'Creating reusable code with functions', icon: '⚙️', status: 'available', components: ['applet'], href: 'applets/python/python-chapter4-functions.html', tags: ['python', 'functions'] },
        { house: 'script', id: 'script-python-collections', title: 'Python Collections', description: 'Lists, tuples, and collection operations', icon: '📦', status: 'available', components: ['applet'], href: 'applets/python/python-chapter5-collections.html', tags: ['python', 'lists', 'tuples'] },
        { house: 'script', id: 'script-python-dictionaries', title: 'Python Dictionaries', description: 'Key-value pairs and dictionary operations', icon: '📖', status: 'available', components: ['applet'], href: 'applets/python/python-chapter6-dictionaries.html', tags: ['python', 'dictionaries'] },
        { house: 'script', id: 'script-python-file-handling', title: 'Python File Handling', description: 'Reading, writing, and manipulating files', icon: '📄', status: 'available', components: ['applet'], href: 'applets/python/python-chapter7-file-handling.html', tags: ['python', 'files', 'io'] },
        { house: 'script', id: 'script-python-oop', title: 'Python OOP', description: 'Object-oriented programming in Python', icon: '🏗️', status: 'available', components: ['applet'], href: 'applets/python/python-chapter8-oop.html', tags: ['python', 'oop', 'classes'] },

        // PowerShell & Windows
        { house: 'script', id: 'script-powershell-basics', title: 'PowerShell Basics', description: 'Introduction to PowerShell scripting', icon: '⚡', status: 'available', components: ['applet'], href: 'applets/powershell/script-powershell-playground.applet.html', tags: ['powershell', 'windows', 'scripting'] },
        { house: 'script', id: 'script-windows-cli', title: 'Windows CLI Tools', description: 'Command-line utilities for Windows', icon: '💻', status: 'available', components: ['applet'], href: 'applets/powershell/windows-cli-tools.html', tags: ['windows', 'cli', 'cmd'] },
        { house: 'script', id: 'script-windows-registry', title: 'Windows Registry', description: 'Navigate and understand the registry', icon: '📋', status: 'available', components: ['applet'], href: 'applets/powershell/windows-registry-explorer.html', tags: ['windows', 'registry'] },
        { house: 'script', id: 'script-windows-troubleshooting', title: 'Windows Troubleshooting', description: 'Diagnose and fix common Windows issues', icon: '🔧', status: 'available', components: ['applet'], href: 'applets/powershell/windows-troubleshooting.html', tags: ['windows', 'troubleshooting'] },

        // System Administration
        { house: 'script', id: 'script-process-management', title: 'Process Management', description: 'Managing system processes and services', icon: '📊', status: 'available', components: ['applet'], href: 'applets/sysadmin/process-management-visualizer.html', tags: ['sysadmin', 'processes'] },
        { house: 'script', id: 'script-log-management', title: 'Log Management', description: 'System logging and log analysis', icon: '📜', status: 'available', components: ['applet'], href: 'applets/sysadmin/log-management-visualizer.html', tags: ['sysadmin', 'logs'] },
        { house: 'script', id: 'script-automation-concepts', title: 'Automation Concepts', description: 'Infrastructure automation and APIs', icon: '🤖', status: 'available', components: ['presentation', 'applet'], href: 'applets/sysadmin/automation-visualizer.html', tags: ['automation', 'devops'] },
        { house: 'script', id: 'script-package-manager', title: 'Package Manager', description: 'Managing software with apt, yum, and pip', icon: '📦', status: 'available', components: ['applet'], href: 'applets/sysadmin/package-manager-simulator.html', tags: ['linux', 'packages', 'apt', 'yum'] },

        // Command Line Hacker (CLH) Series — 31 modules
        // Tags include 'command line hacker' + 'terminal' so search("CLH"), search("command line hacker"), search("terminal") all hit
        // Foundation (001-005)
        { house: 'script', id: 'clh-001', title: 'CLH-001: Introduction to Hacker CLI', description: 'Begin your journey as a command line operator. Reconnaissance basics.', icon: '💀', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'courses/clh/modules/clh-001/script-intro.module.html', tags: ['clh', 'command line hacker', 'linux', 'hacking', 'terminal', 'cli', 'reconnaissance'] },
        { house: 'script', id: 'clh-002', title: 'CLH-002: Navigation & Reconnaissance', description: 'Navigate filesystems and extract intel from target directories.', icon: '🧭', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'courses/clh/modules/clh-002/script-lab.lab.html', tags: ['clh', 'command line hacker', 'linux', 'recon', 'terminal', 'cli', 'navigation'] },
        { house: 'script', id: 'clh-003', title: 'CLH-003: Pattern Hunting', description: 'Hunt for hidden codes using grep and pattern matching.', icon: '🎯', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'courses/clh/modules/clh-003/script-lab.lab.html', tags: ['clh', 'command line hacker', 'linux', 'grep', 'terminal', 'cli', 'regex'] },
        { house: 'script', id: 'clh-004', title: 'CLH-004: Process Investigation', description: 'Hunt suspicious processes. Find the malware hiding in the process list.', icon: '🔍', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'courses/clh/modules/clh-004/script-lab.lab.html', tags: ['clh', 'command line hacker', 'linux', 'processes', 'terminal', 'cli', 'malware'] },
        { house: 'script', id: 'clh-005', title: 'CLH-005: Log Analysis', description: 'Analyze system logs. Find error patterns and document anomalies.', icon: '📋', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'courses/clh/modules/clh-005/script-lab.lab.html', tags: ['clh', 'command line hacker', 'linux', 'logs', 'terminal', 'cli', 'forensics'] },
        // Operations (006-008)
        { house: 'script', id: 'clh-006', title: 'CLH-006: File Operations', description: 'Create, copy, move, and delete files during field operations.', icon: '📁', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'courses/clh/modules/clh-006/script-lab.lab.html', tags: ['clh', 'command line hacker', 'linux', 'files', 'terminal', 'cli', 'mkdir', 'cp', 'mv', 'rm'] },
        { house: 'script', id: 'clh-007', title: 'CLH-007: Permissions & Access Control', description: 'Decode permission matrices and secure sensitive files.', icon: '🔐', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'courses/clh/modules/clh-007/script-lab.lab.html', tags: ['clh', 'command line hacker', 'linux', 'permissions', 'terminal', 'cli', 'chmod', 'security'] },
        { house: 'script', id: 'clh-008', title: 'CLH-008: Shell Scripting Basics', description: 'Write and execute shell scripts for automated operations.', icon: '📜', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'courses/clh/modules/clh-008/script-lab.lab.html', tags: ['clh', 'command line hacker', 'linux', 'scripting', 'bash', 'terminal', 'cli', 'automation'] },
        // Analysis (009-011)
        { house: 'script', id: 'clh-009', title: 'CLH-009: Text Processing', description: 'Extract and transform data using cut, sort, uniq, awk, and sed.', icon: '🔤', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'courses/clh/modules/clh-009/script-lab.lab.html', tags: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'text-processing', 'awk', 'sed', 'cut', 'sort'] },
        { house: 'script', id: 'clh-010', title: 'CLH-010: I/O Redirection', description: 'Control data streams with redirects, pipes, and tee.', icon: '🔀', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'courses/clh/modules/clh-010/script-lab.lab.html', tags: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'redirection', 'pipes', 'tee'] },
        { house: 'script', id: 'clh-011', title: 'CLH-011: Advanced Grep & Regex', description: 'Hunt patterns with grep flags and regular expressions.', icon: '🧬', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'courses/clh/modules/clh-011/script-lab.lab.html', tags: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'grep', 'regex', 'pattern-matching'] },
        // Advanced (012-015)
        { house: 'script', id: 'clh-012', title: 'CLH-012: Network Basics', description: 'Probe network connectivity with ping, netstat, ss, and ip.', icon: '🌐', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'courses/clh/modules/clh-012/script-lab.lab.html', tags: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'networking', 'ping', 'netstat'] },
        { house: 'script', id: 'clh-013', title: 'CLH-013: Environment Variables', description: 'Master shell environment with env, export, and PATH manipulation.', icon: '🔧', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'courses/clh/modules/clh-013/script-lab.lab.html', tags: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'environment', 'env', 'export', 'PATH'] },
        { house: 'script', id: 'clh-014', title: 'CLH-014: Process Control', description: 'Manage processes with ps, kill, jobs, bg, fg, and nohup.', icon: '🎛️', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'courses/clh/modules/clh-014/script-lab.lab.html', tags: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'processes', 'ps', 'kill', 'jobs'] },
        { house: 'script', id: 'clh-015', title: 'CLH-015: Capstone Mission', description: 'Final investigation. Apply all skills. Earn CLI Engineer certification.', icon: '🏆', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'courses/clh/modules/clh-015/script-lab.lab.html', tags: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'capstone', 'certification'] },
        // Tactical (016-022)
        { house: 'script', id: 'clh-016', title: 'CLH-016: System Intel', description: 'Intelligence gathering and tactical reconnaissance operations.', icon: '🛰️', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'courses/clh/modules/clh-016/script-lab.lab.html', tags: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'reconnaissance', 'system-info', 'uname'] },
        { house: 'script', id: 'clh-017', title: 'CLH-017: Find & Locate', description: 'Search and file location discovery techniques.', icon: '🗺️', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'courses/clh/modules/clh-017/script-lab.lab.html', tags: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'find', 'locate', 'search'] },
        { house: 'script', id: 'clh-018', title: 'CLH-018: Archive Operations', description: 'Dead Drop Protocol — handling and extracting intel packages.', icon: '📦', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'courses/clh/modules/clh-018/script-lab.lab.html', tags: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'tar', 'gzip', 'archives'] },
        { house: 'script', id: 'clh-019', title: 'CLH-019: Disk Forensics', description: 'Evidence Lab — digital forensics and disk image analysis.', icon: '🔬', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'courses/clh/modules/clh-019/script-lab.lab.html', tags: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'forensics', 'disk', 'df', 'du'] },
        { house: 'script', id: 'clh-020', title: 'CLH-020: User Reconnaissance', description: 'User account profiling and privilege enumeration.', icon: '👤', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'courses/clh/modules/clh-020/script-lab.lab.html', tags: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'users', 'enumeration', 'whoami'] },
        { house: 'script', id: 'clh-021', title: 'CLH-021: SSH Operations', description: 'Operation Silent Relay — secure encrypted tunnel establishment.', icon: '🔒', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'courses/clh/modules/clh-021/script-lab.lab.html', tags: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'ssh', 'tunnels', 'encryption'] },
        { house: 'script', id: 'clh-022', title: 'CLH-022: Network Reconnaissance', description: 'Infrastructure mapping and lateral movement planning.', icon: '🕸️', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'courses/clh/modules/clh-022/script-lab.lab.html', tags: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'networking', 'recon', 'lateral-movement'] },
        // Black Ops (023-027)
        { house: 'script', id: 'clh-023', title: 'CLH-023: Service Management', description: 'Compromised server audit — identifying malicious services.', icon: '⚙️', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'courses/clh/modules/clh-023/script-lab.lab.html', tags: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'services', 'systemctl', 'audit'] },
        { house: 'script', id: 'clh-024', title: 'CLH-024: Scheduled Tasks', description: 'Persistence Hunt — cron jobs and system timers.', icon: '⏰', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'courses/clh/modules/clh-024/script-lab.lab.html', tags: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'cron', 'crontab', 'persistence'] },
        { house: 'script', id: 'clh-025', title: 'CLH-025: Package Management', description: 'Supply chain audit — package verification and integrity.', icon: '📥', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'courses/clh/modules/clh-025/script-lab.lab.html', tags: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'apt', 'dpkg', 'packages'] },
        { house: 'script', id: 'clh-026', title: 'CLH-026: Access Control', description: 'Vault Security Review — hunting privilege escalation vectors.', icon: '🛡️', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'courses/clh/modules/clh-026/script-lab.lab.html', tags: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'sudo', 'privilege-escalation', 'access-control'] },
        { house: 'script', id: 'clh-027', title: 'CLH-027: User Management', description: 'Identity Management — user account administration.', icon: '👥', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'courses/clh/modules/clh-027/script-lab.lab.html', tags: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'useradd', 'usermod', 'groups'] },
        // Ghost Tier (028-031)
        { house: 'script', id: 'clh-028', title: 'CLH-028: System Monitoring', description: 'Threat Hunt — active incident response with real-time monitoring.', icon: '📡', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'courses/clh/modules/clh-028/script-lab.lab.html', tags: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'monitoring', 'top', 'incident-response'] },
        { house: 'script', id: 'clh-029', title: 'CLH-029: Vim Essentials', description: 'Master the modal editor of legends.', icon: '📝', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'courses/clh/modules/clh-029/script-lab.lab.html', tags: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'vim', 'editor'] },
        { house: 'script', id: 'clh-030', title: 'CLH-030: OPERATION CHIMERA', description: 'High-stakes mission at maximum classification level.', icon: '🔥', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'courses/clh/modules/clh-030/script-lab.lab.html', tags: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'capstone', 'operation'] },
        { house: 'script', id: 'clh-031', title: 'CLH-031: Operation BLACKOUT', description: 'Final operation — the ultimate test of everything you have learned.', icon: '🖤', status: 'available', components: ['lab'], href: 'courses/clh/modules/clh-031/script-lab.lab.html', tags: ['clh', 'command line hacker', 'linux', 'terminal', 'cli', 'final', 'operation'] },
        { house: 'script', id: 'script-pipe-snake', title: 'Pipe Snake', description: 'Snake style game chaining piped Linux commands', icon: '🐍', status: 'available', components: ['game'], href: 'games/pipe-snake.html', tags: ['game', 'arcade', 'snake', 'linux', 'pipes', 'commands'] },
        { house: 'script', id: 'script-terminal-velocity', title: 'Terminal Velocity', description: 'Speed-typing Linux commands under pressure to build muscle memory', icon: '⚡', status: 'available', components: ['review'], href: 'reviews/terminal-velocity.html', tags: ['review', 'linux', 'terminal', 'commands', 'typing'] },
        { house: 'script', id: 'script-permission-puzzle', title: 'Permission Puzzle', description: 'Solve Linux file permission challenges using chmod and chown', icon: '🔐', status: 'available', components: ['review'], href: 'reviews/permission-puzzle.html', tags: ['review', 'linux', 'permissions', 'chmod', 'security'] },
        { house: 'script', id: 'script-regex-runner', title: 'Regex Runner', description: 'Match patterns and master regular expressions through timed challenges', icon: '🏃', status: 'available', components: ['review'], href: 'reviews/regex-runner.html', tags: ['review', 'regex', 'pattern-matching', 'grep', 'linux'] },
        { house: 'script', id: 'script-cron-builder', title: 'Cron Job Builder', description: 'Build and test cron job schedules for Linux task automation', icon: '⏰', status: 'available', components: ['lab'], href: 'labs/cron-builder.html', tags: ['lab', 'linux', 'cron', 'automation', 'scheduling'] },
        { house: 'script', id: 'script-patch-tuesday', title: 'Patch Tuesday', description: 'Triage and prioritize vulnerability patches under time pressure', icon: '🩹', status: 'available', components: ['lab'], href: 'labs/patch-tuesday.html', tags: ['lab', 'patching', 'vulnerabilities', 'triage', 'security'] },

        // ═══════════════════════════════════════════════════════════════════
        // HOUSE OF THE FORGE - Hardware & Operating Systems
        // ═══════════════════════════════════════════════════════════════════
        // A+ Core 1 Curriculum
        { house: 'forge', id: 'forge-aplus-core1-full', title: 'A+ Core 1 Complete Course', description: 'Full CompTIA A+ Core 1 (220-1101) curriculum - 12 chapters with labs', icon: '🎓', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'applets/comptia-aplus/core-1/index.html', tags: ['comptia', 'aplus', 'certification'] },
        { house: 'forge', id: 'forge-aplus-core1-ch01', title: '1. Motherboards, Processors, and Memory', description: 'Form factors, CPUs, RAM, BIOS/UEFI, cooling systems', icon: '🔲', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'applets/comptia-aplus/core-1/chapters/ch01-motherboards/index.html', tags: ['hardware', 'cpu', 'ram', 'motherboard'] },
        { house: 'forge', id: 'forge-aplus-core1-ch02', title: '2. Expansion Cards, Storage, and PSU', description: 'GPUs, SSDs, HDDs, RAID, power supply units', icon: '💾', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'applets/comptia-aplus/core-1/chapters/ch02-expansion-storage/index.html', tags: ['hardware', 'storage', 'raid', 'gpu', 'psu'] },
        { house: 'forge', id: 'forge-aplus-core1-ch03', title: '3. Peripherals, Cables and Connectors', description: 'USB, HDMI, DisplayPort, input devices', icon: '🔌', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'applets/comptia-aplus/core-1/chapters/ch03-peripherals/index.html', tags: ['hardware', 'cables', 'usb', 'hdmi'] },
        { house: 'forge', id: 'forge-aplus-core1-ch04', title: '4. Printers and Multifunction Devices', description: 'Laser, inkjet, thermal, maintenance', icon: '🖨️', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'applets/comptia-aplus/core-1/chapters/ch04-printers/index.html', tags: ['hardware', 'printers'] },
        { house: 'forge', id: 'forge-aplus-core1-ch05', title: '5. Networking Fundamentals', description: 'Topologies, OSI model, Ethernet, network devices', icon: '🌐', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'applets/comptia-aplus/core-1/chapters/ch05-networking/index.html', tags: ['networking', 'osi', 'ethernet'] },
        { house: 'forge', id: 'forge-aplus-core1-ch06', title: '6. Introduction to TCP/IP', description: 'IPv4, IPv6, subnetting, ports, protocols', icon: '📡', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'applets/comptia-aplus/core-1/chapters/ch06-tcpip/index.html', tags: ['networking', 'tcpip', 'subnetting', 'ipv4', 'ipv6'] },
        { house: 'forge', id: 'forge-aplus-core1-ch07', title: '7. Wireless and SOHO Networks', description: '802.11 standards, WPA3, router configuration', icon: '📶', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'applets/comptia-aplus/core-1/chapters/ch07-wireless/index.html', tags: ['wireless', 'wifi', 'networking'] },
        { house: 'forge', id: 'forge-aplus-core1-ch08', title: '8. Network Services, Virtualization and Cloud', description: 'DHCP, DNS, VMs, IaaS/PaaS/SaaS', icon: '☁️', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'applets/comptia-aplus/core-1/chapters/ch08-cloud/index.html', tags: ['cloud', 'virtualization', 'dhcp', 'dns'] },
        { house: 'forge', id: 'forge-aplus-core1-ch09', title: '9. Laptop and Mobile Device Hardware', description: 'Displays, batteries, upgrades, components', icon: '💻', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'applets/comptia-aplus/core-1/chapters/ch09-laptops/index.html', tags: ['hardware', 'laptop', 'mobile'] },
        { house: 'forge', id: 'forge-aplus-core1-ch10', title: '10. Mobile Connectivity and Apps', description: 'Cellular, Bluetooth, sync, MDM', icon: '📱', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'applets/comptia-aplus/core-1/chapters/ch10-mobile/index.html', tags: ['mobile', 'bluetooth', 'cellular'] },
        { house: 'forge', id: 'forge-aplus-core1-ch11', title: '11. Troubleshooting Methodology', description: '6-step process, POST, power, display issues', icon: '🔧', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'applets/comptia-aplus/core-1/chapters/ch11-troubleshooting/index.html', tags: ['troubleshooting', 'methodology'] },
        { house: 'forge', id: 'forge-aplus-core1-ch12', title: '12. Hardware and Network Troubleshooting', description: 'Diagnostics, symptoms, tools', icon: '🛠️', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'applets/comptia-aplus/core-1/chapters/ch12-hw-network-troubleshooting/index.html', tags: ['troubleshooting', 'diagnostics'] },

        // A+ Core 2 Curriculum
        { house: 'forge', id: 'forge-aplus-core2-full', title: 'A+ Core 2 Complete Course', description: 'Full CompTIA A+ Core 2 (220-1102) curriculum - 12 chapters with labs', icon: '🎓', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'applets/comptia-aplus/core-2/index.html', tags: ['comptia', 'aplus', 'certification', 'core2'] },
        { house: 'forge', id: 'forge-aplus-core2-ch13', title: '13. Windows Editions and Upgrades', description: 'Home, Pro, Enterprise editions and upgrade paths', icon: '🪟', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'applets/comptia-aplus/core-2/chapters/ch13-windows-editions/index.html', tags: ['windows', 'editions', 'operating-system'] },
        { house: 'forge', id: 'forge-aplus-core2-ch14', title: '14. Windows Settings and Control Panel', description: 'Settings app, Control Panel, and system configuration', icon: '⚙️', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'applets/comptia-aplus/core-2/chapters/ch14-windows-settings/index.html', tags: ['windows', 'settings', 'control-panel'] },
        { house: 'forge', id: 'forge-aplus-core2-ch15', title: '15. Administrative Tools', description: 'MMC consoles, Event Viewer, Task Scheduler, and management utilities', icon: '🛠️', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'applets/comptia-aplus/core-2/chapters/ch15-admin-tools/index.html', tags: ['windows', 'admin', 'mmc', 'event-viewer'] },
        { house: 'forge', id: 'forge-aplus-core2-ch16', title: '16. System Tools and Utilities', description: 'Task Manager, Resource Monitor, System Information, diagnostics', icon: '📊', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'applets/comptia-aplus/core-2/chapters/ch16-system-tools/index.html', tags: ['system-tools', 'task-manager', 'diagnostics'] },
        { house: 'forge', id: 'forge-aplus-core2-ch17', title: '17. macOS and Linux Basics', description: 'Operating system fundamentals for macOS and Linux', icon: '🐧', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'applets/comptia-aplus/core-2/chapters/ch17-macos-linux/index.html', tags: ['linux', 'macos', 'operating-system'] },
        { house: 'forge', id: 'forge-aplus-core2-ch18', title: '18. Users, Groups, and Permissions', description: 'User accounts, groups, NTFS permissions, and access control', icon: '👥', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'applets/comptia-aplus/core-2/chapters/ch18-users-groups/index.html', tags: ['users', 'groups', 'permissions', 'ntfs'] },
        { house: 'forge', id: 'forge-aplus-core2-ch19', title: '19. Security Fundamentals', description: 'Authentication, encryption, and security best practices', icon: '🔒', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'applets/comptia-aplus/core-2/chapters/ch19-security/index.html', tags: ['security', 'authentication', 'encryption'] },
        { house: 'forge', id: 'forge-aplus-core2-ch20', title: '20. Malware Protection', description: 'Malware types, detection, removal, and prevention', icon: '🦠', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'applets/comptia-aplus/core-2/chapters/ch20-malware/index.html', tags: ['malware', 'antivirus', 'security'] },
        { house: 'forge', id: 'forge-aplus-core2-ch21', title: '21. Physical Security', description: 'Physical access controls, surveillance, and environmental controls', icon: '🏢', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'applets/comptia-aplus/core-2/chapters/ch21-physical-security/index.html', tags: ['physical-security', 'access-control'] },
        { house: 'forge', id: 'forge-aplus-core2-ch22', title: '22. Incident Response', description: 'Incident handling, documentation, and recovery procedures', icon: '🚨', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'applets/comptia-aplus/core-2/chapters/ch22-incident-response/index.html', tags: ['incident-response', 'security'] },
        { house: 'forge', id: 'forge-aplus-core2-ch23', title: '23. Change Management', description: 'Change management processes and best practices', icon: '📋', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'applets/comptia-aplus/core-2/chapters/ch23-change-management/index.html', tags: ['change-management', 'itil'] },
        { house: 'forge', id: 'forge-aplus-core2-ch24', title: '24. Documentation and Professionalism', description: 'Documentation, communication, and professional conduct', icon: '📝', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'applets/comptia-aplus/core-2/chapters/ch24-documentation/index.html', tags: ['documentation', 'professionalism'] },

        // Windows OS
        { house: 'forge', id: 'forge-windows-editions', title: 'Windows Editions', description: 'Understanding Home, Pro, Enterprise, and Education editions', icon: '🪟', status: 'available', components: ['presentation', 'applet', 'lab'], href: 'presentations/windows-editions.html', tags: ['windows', 'operating system'] },
        { house: 'forge', id: 'forge-windows-settings', title: 'Windows Settings App', description: 'Navigating and configuring the modern Settings interface', icon: '⚙️', status: 'available', components: ['presentation', 'applet', 'lab'], href: 'presentations/windows-settings.html', tags: ['windows', 'settings'] },
        { house: 'forge', id: 'forge-control-panel', title: 'Control Panel', description: 'Legacy configuration interface and advanced settings', icon: '🎛️', status: 'available', components: ['presentation', 'applet', 'lab'], href: 'presentations/control-panel.html', tags: ['windows', 'control panel'] },
        { house: 'forge', id: 'forge-admin-tools', title: 'Administrative Tools', description: 'MMC consoles and system management utilities', icon: '🛠️', status: 'available', components: ['presentation', 'applet', 'lab'], href: 'presentations/admin-tools.html', tags: ['windows', 'admin', 'mmc'] },
        { house: 'forge', id: 'forge-macos-linux-basics', title: 'macOS & Linux Basics', description: 'Operating system fundamentals for macOS and Linux', icon: '🐧', status: 'available', components: ['presentation', 'applet', 'lab'], href: 'presentations/macos-linux-basics.html', tags: ['linux', 'macos'] },

        // Hardware Applets
        { house: 'forge', id: 'forge-hardware-fundamentals', title: 'Hardware Fundamentals', description: 'CPUs, RAM, storage, and core PC components', icon: '🔩', status: 'available', components: ['applet'], href: 'applets/hardware/hardware-trainer.html', tags: ['hardware', 'cpu', 'ram'] },
        { house: 'forge', id: 'forge-storage-raid', title: 'Storage & RAID', description: 'Storage devices, RAID levels, and data redundancy', icon: '💾', status: 'available', components: ['applet'], href: 'applets/hardware/raid-level-visualizer.html', tags: ['storage', 'raid', 'hardware'] },
        { house: 'forge', id: 'forge-cpu-architecture', title: 'CPU Architecture', description: 'Interactive CPU components and architecture', icon: '🔲', status: 'available', components: ['applet'], href: 'applets/hardware/cpu_architecture/cpu_architecture.html', tags: ['cpu', 'architecture', 'hardware'] },
        { house: 'forge', id: 'forge-motherboards', title: 'Motherboards', description: 'Motherboard components and form factors', icon: '🔌', status: 'available', components: ['applet'], href: 'applets/hardware/motherboards/motherboards.html', tags: ['motherboard', 'hardware'] },
        { house: 'forge', id: 'forge-multimeter', title: 'Multimeter Training', description: 'Learn to use a multimeter for hardware testing', icon: '⚡', status: 'available', components: ['applet'], href: 'applets/hardware/multimeter/multimeter_jedit_v1.html', tags: ['multimeter', 'hardware', 'troubleshooting'] },
        { house: 'forge', id: 'forge-rack-stack', title: 'Rack Stack', description: 'Tetris style game stacking hardware into server racks', icon: '🏗️', status: 'available', components: ['game'], href: 'games/rack-stack.html', tags: ['game', 'arcade', 'tetris', 'hardware', 'server', 'rack'] },
        { house: 'forge', id: 'forge-binary-blitz', title: 'Binary Blitz', description: 'Convert between binary, decimal, and hex under time pressure', icon: '🔢', status: 'available', components: ['review'], href: 'reviews/binary-blitz.html', tags: ['review', 'binary', 'hex', 'decimal', 'conversion', 'hardware'] },
        { house: 'forge', id: 'forge-backup-or-bust', title: 'Backup or Bust', description: 'Design and test backup strategies before disaster strikes', icon: '💾', status: 'available', components: ['review'], href: 'reviews/backup-or-bust.html', tags: ['review', 'backup', 'disaster-recovery', 'storage', 'hardware'] },
        { house: 'forge', id: 'forge-aplus-jeopardy', title: 'CompTIA A+ Jeopardy', description: 'Jeopardy-style review game covering CompTIA A+ exam topics', icon: '🎯', status: 'available', components: ['review'], href: 'reviews/forge-aplus-jeopardy.applet.html', tags: ['review', 'comptia', 'aplus', 'certification', 'jeopardy'] },

        // ═══════════════════════════════════════════════════════════════════
        // HOUSE OF THE WEB - Networking
        // ═══════════════════════════════════════════════════════════════════
        // Security Tools
        { house: 'web', id: 'web-burp-training', title: 'Burp Suite Training Lab', description: 'Interactive web app security testing. Intercept, modify, and analyze HTTP requests.', icon: '🔥', status: 'available', components: ['presentation', 'applet', 'lab', 'quiz'], href: 'tools/burp-training.html', tags: ['security', 'burp', 'web'] },
        { house: 'web', id: 'web-sqlmap-training', title: 'SQLMap Training Lab', description: 'SQL injection automation simulator', icon: '💉', status: 'available', components: ['presentation', 'applet', 'lab', 'quiz'], href: 'tools/sqlmap-training.html', tags: ['security', 'sql', 'injection'] },
        { house: 'web', id: 'web-gobuster-training', title: 'Gobuster Training Lab', description: 'Directory and DNS enumeration simulator', icon: '🔍', status: 'available', components: ['presentation', 'applet', 'lab', 'quiz'], href: 'tools/gobuster-training.html', tags: ['security', 'enumeration', 'recon'] },
        { house: 'web', id: 'web-nikto-training', title: 'Nikto Training Lab', description: 'Web server vulnerability scanner simulator', icon: '🕵️', status: 'available', components: ['presentation', 'applet', 'lab', 'quiz'], href: 'tools/nikto-training.html', tags: ['security', 'scanner', 'web'] },

        // Networking Fundamentals
        { house: 'web', id: 'web-osi-model', title: 'OSI Model', description: 'The seven layers of network communication', icon: '📊', status: 'available', components: ['presentation', 'applet'], href: 'presentations/osi-presentation.html', tags: ['networking', 'osi', 'fundamentals'] },
        { house: 'web', id: 'web-tcpip', title: 'TCP/IP Model', description: 'The practical networking model and protocols', icon: '🔗', status: 'available', components: ['presentation', 'applet'], href: 'presentations/tcp-presentation.html', tags: ['networking', 'tcpip'] },
        { house: 'web', id: 'web-ip-addressing', title: 'IP Addressing & Subnetting', description: 'IPv4 classes, binary conversion, and subnet calculations', icon: '🧮', status: 'available', components: ['presentation', 'applet'], href: 'applets/ip-addressing/subnetting/subnetting.html', tags: ['networking', 'ip', 'subnetting'] },
        { house: 'web', id: 'web-vlsm', title: 'VLSM & Advanced Subnetting', description: 'Variable Length Subnet Masking for efficient IP allocation', icon: '📐', status: 'available', components: ['applet'], href: 'applets/ip-addressing/VLSM/VLSM.html', tags: ['networking', 'vlsm', 'subnetting'] },
        { house: 'web', id: 'web-ipv6', title: 'IPv6 Fundamentals', description: 'Next-generation IP addressing and configuration', icon: '6️⃣', status: 'available', components: ['presentation', 'applet'], href: 'applets/ip-addressing/IPv6/IPv6.html', tags: ['networking', 'ipv6'] },
        { house: 'web', id: 'web-switching', title: 'Switching & VLANs', description: 'Layer 2 switching, VLANs, and trunking', icon: '🔀', status: 'available', components: ['presentation', 'applet'], href: 'presentations/vlan-presentation.html', tags: ['networking', 'switching', 'vlan'] },
        { house: 'web', id: 'web-stp', title: 'Spanning Tree Protocol', description: 'Loop prevention and redundancy in switched networks', icon: '🌳', status: 'available', components: ['presentation', 'applet'], href: 'presentations/stp-presentation.html', tags: ['networking', 'stp', 'switching'] },
        { house: 'web', id: 'web-routing', title: 'Routing Fundamentals', description: 'Static and dynamic routing with OSPF and EIGRP', icon: '🛤️', status: 'available', components: ['presentation', 'applet'], href: 'presentations/ospf-presentation.html', tags: ['networking', 'routing', 'ospf', 'eigrp'] },
        { house: 'web', id: 'web-wireless', title: 'Wireless Networking', description: 'WiFi standards, security, and architecture', icon: '📡', status: 'available', components: ['presentation', 'applet'], href: 'presentations/wireless-presentation.html', tags: ['networking', 'wireless', 'wifi'] },
        { house: 'web', id: 'web-network-simulator', title: 'Network Simulator Lab', description: 'Interactive packet tracer-style network simulator', icon: '🖥️', status: 'available', components: ['lab'], href: 'simulators/packet-tracer-lite-v3.html', tags: ['networking', 'simulator', 'lab'] },
        { house: 'web', id: 'web-subnet-calc', title: 'Subnet Calculator', description: 'Calculate subnets, CIDR, and IP ranges', icon: '🧮', status: 'available', components: ['tool'], href: 'tools/subnet-calculator.html', tags: ['networking', 'subnetting', 'calculator'] },
        { house: 'web', id: 'web-packet-invaders', title: 'Packet Invaders', description: 'Space Invaders style game defending firewall against hostile packets', icon: '👾', status: 'available', components: ['game'], href: 'games/packet-invaders.html', tags: ['game', 'arcade', 'space invaders', 'firewall', 'packets', 'networking'] },
        { house: 'web', id: 'web-subnet-siege', title: 'Subnet Siege', description: 'Defend your network by correctly subnetting under attack conditions', icon: '🧮', status: 'available', components: ['review'], href: 'reviews/subnet-siege.html', tags: ['review', 'subnetting', 'networking', 'ip', 'cidr'] },
        { house: 'web', id: 'web-protocol-stack', title: 'Protocol Stack', description: 'Stack OSI and TCP/IP layers in the correct order against the clock', icon: '📊', status: 'available', components: ['review'], href: 'reviews/protocol-stack.html', tags: ['review', 'osi', 'tcpip', 'protocols', 'networking'] },
        { house: 'web', id: 'web-dns-resolver-race', title: 'DNS Resolver Race', description: 'Race to resolve DNS queries through the hierarchy before time runs out', icon: '🌐', status: 'available', components: ['review'], href: 'reviews/dns-resolver-race.html', tags: ['review', 'dns', 'resolution', 'networking'] },
        { house: 'web', id: 'web-api-interceptor', title: 'API Interceptor', description: 'Intercept and analyze API calls to identify vulnerabilities and data leaks', icon: '🔌', status: 'available', components: ['review'], href: 'reviews/api-interceptor.html', tags: ['review', 'api', 'rest', 'security', 'networking'] },

        // ═══════════════════════════════════════════════════════════════════
        // HOUSE OF THE SHIELD - Security
        // ═══════════════════════════════════════════════════════════════════
        { house: 'shield', id: 'shield-yara-training', title: 'YARA Rules Training Lab', description: 'Create and test YARA rules for malware detection', icon: '🎯', status: 'available', components: ['presentation', 'applet', 'lab', 'quiz'], href: 'applets/yara/yara-training.html', tags: ['security', 'yara', 'malware'] },
        { house: 'shield', id: 'shield-security-fundamentals', title: 'Security Fundamentals', description: 'Core security concepts and principles', icon: '🛡️', status: 'available', components: ['presentation'], href: 'presentations/security-fundamentals.html', tags: ['security', 'fundamentals'] },
        { house: 'shield', id: 'shield-zero-trust', title: 'Zero Trust Architecture', description: 'Modern security architecture principles', icon: '🔒', status: 'available', components: ['presentation', 'applet'], href: 'applets/zero-trust-lab.html', tags: ['security', 'zero trust', 'architecture'] },
        { house: 'shield', id: 'shield-linux-firewall', title: 'Linux Firewall Builder', description: 'Build and configure Linux firewalls with iptables', icon: '🔥', status: 'available', components: ['applet'], href: 'applets/network/linux-firewall-builder.html', tags: ['linux', 'firewall', 'iptables', 'security'] },
        { house: 'shield', id: 'shield-threat-swarm', title: 'Threat Swarm', description: 'Galaga style game as SOC interceptor vs cyber threats', icon: '🛸', status: 'available', components: ['game'], href: 'games/threat-swarm.html', tags: ['game', 'arcade', 'galaga', 'soc', 'threats', 'security'] },

        // ═══════════════════════════════════════════════════════════════════
        // HOUSE OF THE KEY - Cryptography
        // ═══════════════════════════════════════════════════════════════════
        { house: 'key', id: 'key-encryption-basics', title: 'Encryption Fundamentals', description: 'Core encryption concepts and algorithms', icon: '🔐', status: 'available', components: ['presentation', 'applet'], href: 'presentations/encryption-basics.html', tags: ['crypto', 'encryption'] },
        { house: 'key', id: 'key-aes-lab', title: 'AES Encryption Lab', description: 'Hands-on AES encryption and decryption', icon: '🔒', status: 'available', components: ['lab'], href: 'labs/aes-lab.html', tags: ['crypto', 'aes', 'encryption'] },
        { house: 'key', id: 'key-pki-deep-dive', title: 'PKI Deep Dive', description: 'Public Key Infrastructure explained', icon: '📜', status: 'available', components: ['presentation', 'applet'], href: 'presentations/pki-deep-dive.html', tags: ['crypto', 'pki', 'certificates'] },
        { house: 'key', id: 'key-hashing', title: 'Hashing Algorithms', description: 'MD5, SHA, and cryptographic hashes', icon: '#️⃣', status: 'available', components: ['applet'], href: 'applets/hashing-lab.html', tags: ['crypto', 'hashing', 'sha', 'md5'] },
        { house: 'key', id: 'key-crypto-pong', title: 'Crypto Pong', description: 'Pong style game with encryption vs decryption', icon: '🏓', status: 'available', components: ['game'], href: 'games/crypto-pong.html', tags: ['game', 'arcade', 'pong', 'encryption', 'decryption', 'crypto'] },
        { house: 'key', id: 'key-hash-cracker', title: 'Hash Cracker', description: 'Crack hashed passwords using dictionary and brute-force techniques', icon: '🔓', status: 'available', components: ['review'], href: 'reviews/hash-cracker.html', tags: ['review', 'hashing', 'passwords', 'cracking', 'crypto'] },
        { house: 'key', id: 'key-firewall-builder', title: 'Firewall Builder', description: 'Design and configure firewall rulesets to protect network segments', icon: '🔥', status: 'available', components: ['lab'], href: 'labs/firewall-builder.html', tags: ['lab', 'firewall', 'rules', 'network', 'security'] },

        // ═══════════════════════════════════════════════════════════════════
        // HOUSE OF THE CLOUD - Cloud & Infrastructure
        // ═══════════════════════════════════════════════════════════════════
        { house: 'cloud', id: 'cloud-concepts', title: 'Cloud Computing Concepts', description: 'IaaS, PaaS, SaaS and cloud fundamentals', icon: '☁️', status: 'available', components: ['presentation'], href: 'presentations/cloud-concepts.html', tags: ['cloud', 'iaas', 'paas', 'saas'] },
        { house: 'cloud', id: 'cloud-aws-security', title: 'AWS IAM & Security', description: 'AWS Identity and Access Management', icon: '🔐', status: 'available', components: ['presentation', 'lab'], href: 'modules/aws/iam-security.html', tags: ['aws', 'iam', 'security', 'cloud'] },
        { house: 'cloud', id: 'cloud-aws-networking', title: 'AWS VPC Networking', description: 'Virtual Private Cloud configuration', icon: '🌐', status: 'available', components: ['presentation', 'lab'], href: 'modules/aws/vpc-networking.html', tags: ['aws', 'vpc', 'networking', 'cloud'] },
        { house: 'cloud', id: 'wsa-course', title: 'Windows Server Administration', description: 'AZ-800 Windows Server Administration course', icon: '🖥️', status: 'available', components: ['presentation', 'lab', 'quiz'], href: 'modules/wsa/index.html', tags: ['windows', 'server', 'azure', 'administration'] },
        { house: 'cloud', id: 'cloud-destroyer', title: 'Cloud Destroyer', description: 'Asteroids style game destroying rogue cloud instances', icon: '☄️', status: 'available', components: ['game'], href: 'games/cloud-destroyer.html', tags: ['game', 'arcade', 'asteroids', 'cloud', 'instances'] },

        // ═══════════════════════════════════════════════════════════════════
        // HOUSE OF CODE - Development & DevOps
        // ═══════════════════════════════════════════════════════════════════
        { house: 'code', id: 'code-git-basics', title: 'Git Version Control', description: 'Git fundamentals and workflows', icon: '📦', status: 'available', components: ['presentation', 'lab'], href: 'presentations/code-git-basics.presentation.html', tags: ['git', 'version control', 'devops'] },
        { house: 'code', id: 'code-docker-basics', title: 'Docker Basics', description: 'Container fundamentals and Docker usage', icon: '🐳', status: 'available', components: ['presentation', 'lab'], href: 'presentations/code-docker-fundamentals.presentation.html', tags: ['docker', 'containers', 'devops'] },
        { house: 'code', id: 'code-kubernetes-sim', title: 'Kubernetes Cluster Simulator', description: 'Interactive K8s cluster management', icon: '☸️', status: 'available', components: ['applet'], href: 'applets/code-kubernetes-cluster-sim.applet.html', tags: ['kubernetes', 'k8s', 'containers', 'devops'] },
        { house: 'code', id: 'code-api-visualizer', title: 'API & Automation Visualizer', description: 'REST APIs and automation concepts', icon: '🔌', status: 'available', components: ['applet'], href: 'applets/api-visualizer.html', tags: ['api', 'rest', 'automation'] },
        { house: 'code', id: 'code-build-breaker', title: 'Build Breaker', description: 'Breakout style game breaking CI/CD pipeline blocks', icon: '🧱', status: 'available', components: ['game'], href: 'games/build-breaker.html', tags: ['game', 'arcade', 'breakout', 'cicd', 'pipeline', 'devops'] }
    ];

    // Search index cache
    let searchIndex = null;

    /**
     * Build search index for faster lookups
     */
    function buildSearchIndex() {
        if (searchIndex) return searchIndex;

        searchIndex = MODULES.map(module => ({
            ...module,
            searchText: [
                module.title,
                module.description,
                module.id,
                ...(module.tags || [])
            ].join(' ').toLowerCase()
        }));

        return searchIndex;
    }

    /**
     * Search all modules across all houses
     * @param {string} query - Search query
     * @param {Object} options - Search options
     * @returns {Array} Matching modules with house info
     */
    function search(query, options = {}) {
        const {
            house = null,           // Filter to specific house
            status = 'available',   // Filter by status (null for all)
            type = null,            // Filter by component type
            limit = 50              // Max results
        } = options;

        const index = buildSearchIndex();
        const queryLower = query.toLowerCase().trim();

        if (!queryLower) {
            return [];
        }

        // Split query into terms for multi-word search
        const terms = queryLower.split(/\s+/).filter(t => t.length > 0);

        let results = index.filter(module => {
            // All search terms must match
            const matchesQuery = terms.every(term =>
                module.searchText.includes(term)
            );

            if (!matchesQuery) return false;

            // Apply filters
            if (house && module.house !== house) return false;
            if (status && module.status !== status) return false;
            if (type && module.components && !module.components.includes(type)) return false;

            return true;
        });

        // Sort by relevance (title match > description match > tag match)
        results.sort((a, b) => {
            const aTitle = a.title.toLowerCase().includes(queryLower) ? 1 : 0;
            const bTitle = b.title.toLowerCase().includes(queryLower) ? 1 : 0;
            return bTitle - aTitle;
        });

        // Group by house for display
        return results.slice(0, limit).map(module => ({
            ...module,
            houseName: HOUSES[module.house]?.name || module.house,
            houseIcon: HOUSES[module.house]?.icon || '📁',
            houseColor: HOUSES[module.house]?.color || '#666',
            fullHref: HOUSES[module.house]?.basePath + module.href
        }));
    }

    /**
     * Get all modules for a specific house
     */
    function getHouseModules(houseId) {
        return MODULES.filter(m => m.house === houseId);
    }

    /**
     * Get all modules
     */
    function getAllModules() {
        return [...MODULES];
    }

    /**
     * Get house metadata
     */
    function getHouse(houseId) {
        return HOUSES[houseId] || null;
    }

    /**
     * Get all houses
     */
    function getAllHouses() {
        return { ...HOUSES };
    }

    /**
     * Get module count by house
     */
    function getStats() {
        const stats = {
            total: MODULES.length,
            byHouse: {}
        };

        Object.keys(HOUSES).forEach(houseId => {
            stats.byHouse[houseId] = MODULES.filter(m => m.house === houseId).length;
        });

        return stats;
    }

    // Public API
    return {
        search,
        getHouseModules,
        getAllModules,
        getHouse,
        getAllHouses,
        getStats,
        HOUSES,
        MODULES
    };
})();

// Make globally available
window.ContentCatalog = ContentCatalog;
