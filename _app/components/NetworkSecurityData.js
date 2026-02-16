/**
 * NetworkSecurityData.js — Network security topic data
 *
 * 8 topics covering network defense concepts
 * Used by NetworkSecurityRenderer.js
 */
const NetworkSecurityData = {

    // ═══════════════════════════════════════════════════════════════════
    // FIREWALLS
    // ═══════════════════════════════════════════════════════════════════
    firewalls: {
        id: 'firewalls',
        name: 'Firewalls',
        icon: '\ud83e\uddf1',
        color: '#a855f7',
        subtitle: 'Packet Filtering, Stateful Inspection, Application-Layer & NGFW',
        description: 'Firewalls are network security devices that monitor and filter incoming and outgoing traffic based on defined security rules. They form the first line of defense in network security architecture.',
        keyConcepts: ['Packet Filtering', 'Stateful Inspection', 'Application Proxy', 'NGFW', 'ACL Rules', 'Default Deny', 'DMZ'],
        sections: [
            {
                title: 'Packet Filtering Firewalls',
                icon: '\ud83d\udce6',
                content: 'The simplest type of firewall. Examines each packet\'s header information (source/destination IP, port, protocol) and makes allow/deny decisions based on ACL rules. Operates at OSI Layer 3-4.',
                details: ['Inspects IP addresses, ports, and protocols', 'Does NOT track connection state', 'Fast but limited security (no session awareness)', 'Vulnerable to IP spoofing and fragmentation attacks', 'Example: Linux iptables with simple rules'],
                realWorld: 'A small office router uses packet filtering to block all inbound traffic except ports 80 and 443. However, it cannot detect that a seemingly valid HTTP packet is actually part of a SQL injection attack because it only reads headers.'
            },
            {
                title: 'Stateful Inspection Firewalls',
                icon: '\ud83d\udcca',
                content: 'Tracks the state of active connections and makes decisions based on the context of the traffic flow, not just individual packets. Maintains a state table of all connections.',
                details: ['Maintains a state table of active connections', 'Tracks TCP handshake completion', 'Allows return traffic for established connections', 'Drops packets that do not match a known connection', 'More secure than packet filtering, moderate performance cost', 'Example: Cisco ASA, pfSense'],
                realWorld: 'When an internal user browses a website, the stateful firewall records the outbound connection. Return packets from the web server are automatically allowed because they match an existing state entry. Unsolicited inbound packets are dropped.'
            },
            {
                title: 'Application-Layer (Proxy) Firewalls',
                icon: '\ud83d\udd0d',
                content: 'Inspects traffic at OSI Layer 7 (Application layer). Acts as an intermediary between the client and server, fully examining the content of each request.',
                details: ['Full application protocol inspection (HTTP, FTP, SMTP, DNS)', 'Can detect and block application-layer attacks', 'Terminates and re-initiates connections (breaks direct path)', 'Can perform content filtering and DLP', 'Higher latency due to deep inspection', 'Example: WAF (Web Application Firewall), Squid proxy'],
                realWorld: 'A WAF inspects every HTTP request to a web application. It detects a SQL injection attempt in a form field (SELECT * FROM users WHERE 1=1) and blocks the request, even though the TCP connection and IP header were perfectly valid.'
            },
            {
                title: 'Next-Generation Firewalls (NGFW)',
                icon: '\ud83d\ude80',
                content: 'Combines traditional firewall capabilities with additional features like IPS, application awareness, threat intelligence, and SSL/TLS inspection in a single platform.',
                details: ['Deep packet inspection (DPI)', 'Integrated IPS (Intrusion Prevention)', 'Application awareness and control (identify apps regardless of port)', 'SSL/TLS decryption and inspection', 'User identity integration (Active Directory)', 'Threat intelligence feeds and sandboxing', 'Examples: Palo Alto, Fortinet FortiGate, Check Point'],
                realWorld: 'A Palo Alto NGFW identifies that port 443 traffic is actually BitTorrent disguised as HTTPS. It blocks the session based on application identification, even though traditional firewalls would see valid port 443 traffic.'
            }
        ],
        interactive: {
            type: 'scenario_matcher',
            title: 'Choose the Right Firewall',
            instructions: 'Select the firewall type best suited for each scenario.',
            items: [
                { scenario: 'A small home network needs basic port filtering with minimal latency.', answer: 'Packet Filtering', explanation: 'Simple port-based filtering is sufficient for home networks where deep inspection is not needed.' },
                { scenario: 'An enterprise needs to track all active TCP connections and drop unsolicited inbound traffic.', answer: 'Stateful Inspection', explanation: 'Stateful firewalls maintain connection tables and can distinguish legitimate return traffic from unsolicited packets.' },
                { scenario: 'A web application needs protection against SQL injection and XSS attacks.', answer: 'Application-Layer (Proxy/WAF)', explanation: 'WAFs inspect HTTP request content at the application layer, detecting injection attacks in form fields and URLs.' },
                { scenario: 'An enterprise needs to identify applications regardless of port, decrypt TLS traffic, and integrate with Active Directory.', answer: 'Next-Generation Firewall (NGFW)', explanation: 'NGFWs combine application identification, TLS inspection, and user-identity awareness in a single platform.' },
                { scenario: 'A company needs to detect BitTorrent traffic disguised as HTTPS on port 443.', answer: 'Next-Generation Firewall (NGFW)', explanation: 'NGFWs use deep packet inspection and application identification to detect traffic regardless of the port used.' },
                { scenario: 'A DMZ web server needs a reverse proxy that terminates SSL and filters HTTP requests.', answer: 'Application-Layer (Proxy/WAF)', explanation: 'Reverse proxy firewalls terminate connections and re-initiate them, inspecting all HTTP content.' }
            ]
        },
        quiz: [
            { question: 'Which firewall type operates at OSI Layer 3-4 and does NOT track connection state?', options: ['Stateful Inspection', 'Application Proxy', 'Packet Filtering', 'NGFW'], correct: 2, explanation: 'Packet filtering firewalls examine only header information (IP, port, protocol) at Layers 3-4 without maintaining connection state.' },
            { question: 'What is the primary advantage of stateful inspection over packet filtering?', options: ['Faster processing speed', 'Ability to track active connections and their state', 'Application-layer content inspection', 'Built-in VPN capability'], correct: 1, explanation: 'Stateful firewalls maintain a state table tracking all active connections, allowing smarter decisions based on connection context.' },
            { question: 'A WAF blocks a SQL injection attempt in an HTTP POST body. At which OSI layer does this inspection occur?', options: ['Layer 2 - Data Link', 'Layer 3 - Network', 'Layer 4 - Transport', 'Layer 7 - Application'], correct: 3, explanation: 'WAFs operate at Layer 7 (Application), inspecting the actual content of HTTP requests including POST bodies.' },
            { question: 'Which firewall technology can identify applications regardless of the port they use?', options: ['Packet Filtering', 'Stateful Inspection', 'NGFW', 'Circuit-Level Gateway'], correct: 2, explanation: 'NGFWs use deep packet inspection and application signatures to identify applications even when they use non-standard ports.' },
            { question: 'What is the security principle of "default deny"?', options: ['Deny access to the firewall management interface', 'Block all traffic by default and only allow explicitly permitted traffic', 'Deny all outbound traffic', 'Block all traffic from the internet'], correct: 1, explanation: 'Default deny (implicit deny) blocks all traffic that is not explicitly allowed by a firewall rule, following the principle of least privilege.' },
            { question: 'A firewall decrypts TLS traffic, inspects it, then re-encrypts it before forwarding. What is this called?', options: ['Packet filtering', 'Port forwarding', 'SSL/TLS inspection (SSL bridging)', 'Network Address Translation'], correct: 2, explanation: 'SSL/TLS inspection (also called SSL bridging or break-and-inspect) decrypts traffic for inspection, then re-encrypts it. This is a key NGFW feature.' },
            { question: 'What is the purpose of a DMZ in firewall architecture?', options: ['A network zone for storing backups', 'A buffer zone between the internet and internal network for public-facing services', 'A zone where all security controls are disabled', 'A dedicated zone for management traffic'], correct: 1, explanation: 'A DMZ (Demilitarized Zone) is a network segment between the internet and the internal network, hosting public-facing services like web servers while protecting the internal network.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // IDS/IPS
    // ═══════════════════════════════════════════════════════════════════
    ids_ips: {
        id: 'ids_ips',
        name: 'IDS & IPS',
        icon: '\ud83d\udea8',
        color: '#a855f7',
        subtitle: 'Intrusion Detection & Prevention Systems',
        description: 'IDS monitors network traffic for suspicious activity and generates alerts. IPS goes further by actively blocking detected threats. Both use signature-based and anomaly-based detection methods.',
        keyConcepts: ['NIDS', 'HIDS', 'Signature-Based', 'Anomaly-Based', 'Inline vs Passive', 'False Positives', 'Snort/Suricata'],
        sections: [
            {
                title: 'IDS vs IPS',
                icon: '\ud83d\udd0d',
                content: 'An IDS is a passive monitoring system that detects and alerts on suspicious activity. An IPS is an active system placed inline that can block threats in real-time.',
                details: ['IDS: Passive, monitors a copy of traffic (SPAN/TAP)', 'IDS: Generates alerts but does NOT block traffic', 'IPS: Inline, sits in the traffic path', 'IPS: Can drop, reset, or quarantine malicious packets', 'IPS adds latency but provides active protection', 'Many modern systems are combined IDS/IPS'],
                realWorld: 'A hospital deploys Suricata as an IPS inline at the network perimeter. When it detects a known exploit targeting their medical imaging system, it drops the packet and alerts the SOC, preventing the attack from reaching the vulnerable device.'
            },
            {
                title: 'Network-Based (NIDS/NIPS)',
                icon: '\ud83c\udf10',
                content: 'Monitors network traffic at strategic points. NIDS/NIPS sensors are placed at network boundaries or critical segments to inspect all passing traffic.',
                details: ['Monitors traffic at the network level', 'Placed at perimeter, DMZ, or internal segment boundaries', 'Uses SPAN ports or network TAPs for traffic capture', 'Can inspect all traffic on a segment simultaneously', 'Cannot inspect encrypted traffic without decryption', 'Examples: Snort, Suricata, Zeek (Bro)'],
                realWorld: 'A bank places Snort sensors at three points: between the internet and firewall (external threats), between the firewall and DMZ (web app attacks), and between the DMZ and internal network (lateral movement detection).'
            },
            {
                title: 'Host-Based (HIDS/HIPS)',
                icon: '\ud83d\udcbb',
                content: 'Installed on individual hosts to monitor system activity. HIDS examines log files, system calls, file integrity, and registry changes on the specific host.',
                details: ['Monitors individual system activity', 'Can detect file changes (integrity monitoring)', 'Watches log files, system calls, and registry', 'Can inspect encrypted traffic (at the endpoint after decryption)', 'Higher resource consumption on the host', 'Examples: OSSEC, Wazuh, Tripwire, CrowdStrike Falcon'],
                realWorld: 'A defense contractor runs OSSEC on all servers. When an attacker compromises a web server and modifies the /etc/passwd file, OSSEC detects the unauthorized change, alerts the SOC, and captures forensic data about the modification.'
            },
            {
                title: 'Detection Methods',
                icon: '\ud83e\udde0',
                content: 'IDS/IPS systems use two primary methods to identify threats: signature-based detection (known threats) and anomaly-based detection (deviations from normal behavior).',
                details: ['Signature-Based: Matches traffic against known attack patterns', 'Signature-Based: Fast, low false positives, but cannot detect unknown (zero-day) attacks', 'Anomaly-Based: Establishes a baseline of "normal" and alerts on deviations', 'Anomaly-Based: Can detect zero-day attacks but higher false positive rate', 'Heuristic/Behavioral: Combines rules with behavioral analysis', 'Machine learning approaches reduce false positives while catching novel attacks'],
                realWorld: 'A Suricata rule (signature) detects the EternalBlue exploit by matching specific SMB packet patterns. Meanwhile, its anomaly engine notices unusual internal scanning activity that does not match any signature but deviates from the baseline, catching a new variant.'
            }
        ],
        interactive: {
            type: 'scenario_matcher',
            title: 'IDS/IPS Decision Engine',
            instructions: 'Choose the correct IDS/IPS type and detection method for each scenario.',
            items: [
                { scenario: 'You need to monitor all traffic entering the DMZ without adding latency.', answer: 'NIDS (passive, on SPAN port)', explanation: 'NIDS in passive mode copies traffic via SPAN/TAP without sitting inline, adding no latency.' },
                { scenario: 'You want to detect AND block a known exploit targeting your web servers in real-time.', answer: 'NIPS (inline, signature-based)', explanation: 'NIPS sits inline and can actively block traffic matching known exploit signatures.' },
                { scenario: 'You need to detect unauthorized file modifications on a critical server.', answer: 'HIDS (file integrity monitoring)', explanation: 'HIDS monitors individual hosts and can detect unauthorized changes to files and configurations.' },
                { scenario: 'You want to detect a zero-day attack that has no known signature.', answer: 'Anomaly-based detection', explanation: 'Anomaly detection can identify novel attacks by detecting behavior that deviates from the established baseline.' },
                { scenario: 'You need to quickly identify the WannaCry ransomware on your network.', answer: 'Signature-based detection', explanation: 'WannaCry has well-known signatures that enable fast, accurate detection with low false positives.' },
                { scenario: 'You need to inspect encrypted HTTPS traffic for threats on individual endpoints.', answer: 'HIDS/HIPS (endpoint-level)', explanation: 'HIDS/HIPS on the endpoint can inspect traffic after it is decrypted by the application.' }
            ]
        },
        quiz: [
            { question: 'What is the primary difference between IDS and IPS?', options: ['IDS is faster than IPS', 'IDS monitors and alerts; IPS can actively block threats', 'IPS is always host-based; IDS is always network-based', 'IDS uses signatures; IPS uses anomaly detection'], correct: 1, explanation: 'IDS is passive (detect and alert only). IPS is active (inline, can block/drop malicious traffic in real-time).' },
            { question: 'A NIDS sensor is placed on a SPAN port. What does this mean?', options: ['It is inline and can block traffic', 'It receives a copy of network traffic for passive monitoring', 'It is installed on each host', 'It only monitors wireless traffic'], correct: 1, explanation: 'SPAN (port mirroring) sends a copy of traffic to the NIDS sensor for passive analysis without affecting the traffic flow.' },
            { question: 'Which detection method can identify zero-day attacks?', options: ['Signature-based only', 'Anomaly-based detection', 'Neither can detect zero-day attacks', 'Both are equally effective'], correct: 1, explanation: 'Anomaly-based detection establishes a normal baseline and flags deviations, enabling detection of previously unknown (zero-day) attacks.' },
            { question: 'What is a major disadvantage of anomaly-based detection?', options: ['Cannot detect any attacks', 'High false positive rate', 'Requires known attack signatures', 'Only works on encrypted traffic'], correct: 1, explanation: 'Anomaly detection can flag legitimate but unusual activity as suspicious, leading to a higher false positive rate than signature-based detection.' },
            { question: 'Which tool would detect unauthorized changes to /etc/shadow on a Linux server?', options: ['NIDS', 'Firewall', 'HIDS with file integrity monitoring', 'Load balancer'], correct: 2, explanation: 'HIDS with file integrity monitoring (like OSSEC/Tripwire) monitors critical system files and alerts on unauthorized modifications.' },
            { question: 'In an IPS deployment, why is the sensor placed "inline"?', options: ['To save network bandwidth', 'To actively block malicious traffic before it reaches its target', 'To reduce the number of alerts', 'Because passive mode is not supported'], correct: 1, explanation: 'Inline placement means all traffic passes through the IPS, allowing it to drop or block malicious packets in real-time before they reach the target.' },
            { question: 'Which open-source tools are commonly used for network intrusion detection?', options: ['Nessus and OpenVAS', 'Snort and Suricata', 'Wireshark and tcpdump', 'Metasploit and Burp Suite'], correct: 1, explanation: 'Snort and Suricata are the leading open-source NIDS/NIPS engines, with extensive rule sets for detecting known attack patterns.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // VPN
    // ═══════════════════════════════════════════════════════════════════
    vpn: {
        id: 'vpn',
        name: 'Virtual Private Networks (VPN)',
        icon: '\ud83d\udd10',
        color: '#a855f7',
        subtitle: 'IPsec, SSL/TLS VPN, Site-to-Site & Remote Access',
        description: 'VPNs create encrypted tunnels over public networks, providing confidentiality, integrity, and authentication for remote connections. Understanding VPN types and protocols is essential for securing remote access.',
        keyConcepts: ['IPsec', 'SSL/TLS VPN', 'Site-to-Site', 'Remote Access', 'Tunneling', 'Split Tunneling', 'IKE'],
        sections: [
            {
                title: 'VPN Fundamentals',
                icon: '\ud83d\udd12',
                content: 'A VPN extends a private network across a public network, enabling secure communication. VPN tunnels encrypt data in transit, protecting it from eavesdropping.',
                details: ['Tunneling: encapsulating packets inside encrypted packets', 'Authentication: verifying the identity of VPN endpoints', 'Encryption: AES-256 commonly used for data confidentiality', 'Integrity: HMAC ensures data is not tampered with in transit', 'Two main types: Site-to-Site and Remote Access'],
                realWorld: 'A company with offices in New York and London uses a site-to-site VPN to connect their LANs over the internet. All traffic between offices is encrypted, appearing as if both offices are on the same private network.'
            },
            {
                title: 'IPsec VPN',
                icon: '\ud83d\udee1\ufe0f',
                content: 'IPsec operates at OSI Layer 3 (Network layer) and provides encryption and authentication for IP packets. It uses two modes: Transport and Tunnel.',
                details: ['Transport Mode: encrypts only the payload (host-to-host)', 'Tunnel Mode: encrypts the entire original packet (gateway-to-gateway)', 'IKE (Internet Key Exchange): negotiates security associations', 'AH (Authentication Header): integrity and authentication only (no encryption)', 'ESP (Encapsulating Security Payload): encryption + integrity + authentication', 'IKEv2 preferred over IKEv1 (faster, more secure, supports MOBIKE)'],
                realWorld: 'Two corporate firewalls establish an IPsec VPN in tunnel mode using IKEv2. Phase 1 negotiates the secure channel (ISAKMP SA), Phase 2 negotiates the encryption parameters for actual data traffic (IPsec SA). AES-256 encrypts all inter-office traffic.'
            },
            {
                title: 'SSL/TLS VPN',
                icon: '\ud83c\udf10',
                content: 'SSL/TLS VPNs operate at the application layer and use standard HTTPS (port 443). They are easier to deploy for remote access since they work through web browsers.',
                details: ['Uses TLS encryption (same as HTTPS)', 'Works through port 443 (usually not blocked by firewalls)', 'No special client software needed (browser-based portal)', 'Can provide full tunnel or clientless (web portal) access', 'Easier NAT traversal than IPsec', 'Examples: OpenVPN, Cisco AnyConnect, GlobalProtect'],
                realWorld: 'A remote employee connects to the company VPN through a web browser portal on port 443. They can access internal web apps, email, and file shares without installing any VPN client software. The hotel\'s restrictive firewall does not block the connection since it uses standard HTTPS.'
            },
            {
                title: 'Split Tunneling & Always-On VPN',
                icon: '\u2699\ufe0f',
                content: 'Split tunneling sends only corporate traffic through the VPN while allowing internet traffic to go directly. Always-On VPN ensures all traffic is always encrypted.',
                details: ['Split Tunneling: corporate traffic via VPN, internet traffic direct', 'Advantage: reduces VPN bandwidth, faster internet for users', 'Risk: user\'s direct internet traffic is not protected by corporate security', 'Full Tunnel: ALL traffic goes through VPN (more secure, higher latency)', 'Always-On VPN: automatically connects whenever the device is online', 'Zero Trust approach: verify at every hop, regardless of VPN status'],
                realWorld: 'A government agency mandates full-tunnel, always-on VPN for all devices. When an employee opens their laptop at a coffee shop, the VPN automatically connects before any traffic leaves the device. All traffic, even YouTube, goes through the agency\'s network where DLP and content filters apply.'
            }
        ],
        interactive: {
            type: 'scenario_matcher',
            title: 'VPN Architecture Decisions',
            instructions: 'Choose the best VPN solution for each scenario.',
            items: [
                { scenario: 'Two office locations need a permanent encrypted connection between their LANs.', answer: 'IPsec Site-to-Site VPN (Tunnel Mode)', explanation: 'Site-to-site VPN with IPsec tunnel mode connects two networks permanently over the internet.' },
                { scenario: 'A remote employee needs VPN access from a hotel that blocks non-HTTPS traffic.', answer: 'SSL/TLS VPN (port 443)', explanation: 'SSL VPNs use port 443 which is rarely blocked, making them ideal for restrictive network environments.' },
                { scenario: 'A contractor needs temporary access to a single internal web application.', answer: 'Clientless SSL VPN (web portal)', explanation: 'A browser-based SSL VPN portal provides access to specific applications without installing client software.' },
                { scenario: 'A defense agency requires all employee device traffic to pass through corporate security.', answer: 'Full-Tunnel Always-On VPN', explanation: 'Full tunnel ensures all traffic passes through corporate security controls, with always-on preventing any unprotected connections.' },
                { scenario: 'Remote employees complain the VPN slows their video conferencing.', answer: 'Split Tunneling (corporate traffic only via VPN)', explanation: 'Split tunneling routes only corporate traffic through the VPN, allowing personal/streaming traffic to go direct.' },
                { scenario: 'Two hosts need end-to-end encryption without involving gateways.', answer: 'IPsec Transport Mode', explanation: 'Transport mode encrypts only the payload between two hosts, suitable for direct host-to-host encrypted communication.' }
            ]
        },
        quiz: [
            { question: 'Which IPsec mode encrypts the ENTIRE original IP packet, including the header?', options: ['Transport Mode', 'Tunnel Mode', 'Aggressive Mode', 'Main Mode'], correct: 1, explanation: 'Tunnel Mode encapsulates and encrypts the entire original packet, adding a new IP header. Transport Mode only encrypts the payload.' },
            { question: 'What protocol does IKE use to negotiate security associations?', options: ['HTTP', 'ISAKMP', 'SNMP', 'OSPF'], correct: 1, explanation: 'IKE uses ISAKMP (Internet Security Association and Key Management Protocol) to negotiate the parameters for IPsec security associations.' },
            { question: 'An SSL/TLS VPN typically operates on which port?', options: ['Port 22', 'Port 443', 'Port 500', 'Port 1194'], correct: 1, explanation: 'SSL/TLS VPNs use port 443 (HTTPS), which is almost never blocked by firewalls, making it ideal for remote access.' },
            { question: 'What is the security risk of split tunneling?', options: ['It uses too much bandwidth', 'It is too slow for users', 'Direct internet traffic bypasses corporate security controls', 'It requires expensive hardware'], correct: 2, explanation: 'With split tunneling, non-corporate traffic goes directly to the internet, bypassing the organization\'s security controls (firewall, IDS, DLP).' },
            { question: 'IPsec ESP provides which security services?', options: ['Authentication only', 'Encryption only', 'Encryption, integrity, and authentication', 'Routing and switching'], correct: 2, explanation: 'ESP (Encapsulating Security Payload) provides data encryption (confidentiality), integrity checking, and origin authentication.' },
            { question: 'A company wants VPN that works without installing client software. What should they deploy?', options: ['IPsec with IKEv2', 'Full-tunnel VPN', 'Clientless SSL VPN (web portal)', 'WireGuard'], correct: 2, explanation: 'Clientless SSL VPNs provide access through a web browser portal without requiring any software installation on the user\'s device.' },
            { question: 'What does "Always-On VPN" ensure?', options: ['The VPN server never goes offline', 'The user\'s device automatically connects to VPN whenever it is online', 'The VPN supports unlimited concurrent users', 'The connection speed never drops'], correct: 1, explanation: 'Always-On VPN automatically establishes the VPN connection whenever the device connects to any network, ensuring all traffic is always protected.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // NAT/PAT
    // ═══════════════════════════════════════════════════════════════════
    nat_pat: {
        id: 'nat_pat',
        name: 'NAT & PAT',
        icon: '\ud83d\udd00',
        color: '#a855f7',
        subtitle: 'Network Address Translation & Port Address Translation',
        description: 'NAT translates private IP addresses to public IP addresses, enabling multiple devices to share a single public IP. PAT extends this by also translating port numbers, allowing many devices to share one public IP simultaneously.',
        keyConcepts: ['Static NAT', 'Dynamic NAT', 'PAT (Overload)', 'Private IP Ranges', 'NAT Table', 'Port Forwarding', 'RFC 1918'],
        sections: [
            {
                title: 'Why NAT Exists',
                icon: '\ud83c\udf10',
                content: 'IPv4 has only ~4.3 billion addresses, far fewer than the devices connected to the internet. NAT allows organizations to use private (non-routable) IP addresses internally while sharing a limited number of public IPs for internet access.',
                details: ['RFC 1918 private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16', 'Private IPs are not routable on the internet', 'NAT translates private to public at the network boundary', 'Also provides a layer of obscurity (internal IPs hidden)', 'IPv6 was designed to eliminate the need for NAT (but NAT66 exists)'],
                realWorld: 'Your home has dozens of devices (phones, laptops, IoT) each with a 192.168.1.x address. Your router uses NAT to translate all of them to your single public IP (e.g., 73.45.12.88) when they access the internet.'
            },
            {
                title: 'Types of NAT',
                icon: '\ud83d\udccb',
                content: 'NAT comes in several forms depending on how addresses are mapped: one-to-one (static), pool-based (dynamic), or many-to-one (PAT/overload).',
                details: ['Static NAT: One private IP maps to one public IP (permanent, 1:1)', 'Dynamic NAT: Private IPs drawn from a pool of public IPs (temporary, 1:1)', 'PAT (Port Address Translation): Many private IPs share one public IP (many:1)', 'PAT uses unique source port numbers to track connections', 'PAT is the most common form (used in virtually all home routers)'],
                realWorld: 'A company with 500 employees uses PAT: all 500 devices share 5 public IPs. The router assigns unique source ports (e.g., 192.168.1.50:54321 becomes 73.45.12.88:54321) to track which internal device each response should go to.'
            },
            {
                title: 'NAT Translation Table',
                icon: '\ud83d\udcca',
                content: 'The NAT device maintains a translation table mapping internal addresses/ports to external addresses/ports. This table is crucial for routing return traffic back to the correct internal device.',
                details: ['Records: Inside Local -> Inside Global -> Outside Global', 'PAT entries include port numbers', 'Entries have timeouts (idle connections are cleared)', 'Table lookup occurs for every inbound packet', 'Port forwarding: manual table entries for inbound access'],
                realWorld: 'When 192.168.1.10 browses Google, the NAT table records: 192.168.1.10:49152 maps to 73.45.12.88:49152 going to 142.250.80.14:443. When Google responds, the router looks up port 49152 and forwards the packet to 192.168.1.10.'
            },
            {
                title: 'Port Forwarding & Security Implications',
                icon: '\ud83d\udd12',
                content: 'Port forwarding creates static NAT entries that allow inbound connections to reach specific internal services. NAT provides some security but is NOT a firewall.',
                details: ['Port forwarding: maps external port to internal host:port', 'Allows hosting servers behind NAT (web server, game server)', 'NAT hides internal topology but is not a security control', 'NAT breaks end-to-end connectivity (complicates IPsec, VoIP, P2P)', 'Hairpin NAT: allows internal devices to access port-forwarded services via the public IP', 'Double NAT: two NAT devices in path (common in ISP+router setups)'],
                realWorld: 'A small business forwards port 443 to their internal web server (192.168.1.100:443). Anyone on the internet can reach the web server, but the server\'s real IP remains hidden. However, if the web server is compromised, the attacker is already inside the network.'
            }
        ],
        interactive: {
            type: 'scenario_matcher',
            title: 'NAT Configuration Challenge',
            instructions: 'Select the correct NAT type for each scenario.',
            items: [
                { scenario: 'A web server needs a permanent, dedicated public IP address.', answer: 'Static NAT (1:1)', explanation: 'Static NAT provides a permanent one-to-one mapping between a private and public IP, ideal for servers.' },
                { scenario: 'A home router allows 20 devices to share one public IP.', answer: 'PAT (Port Address Translation)', explanation: 'PAT allows many devices to share a single public IP by using unique port numbers to distinguish connections.' },
                { scenario: 'A company has 10 public IPs and 50 users who need internet access (but not all simultaneously).', answer: 'Dynamic NAT (pool)', explanation: 'Dynamic NAT assigns public IPs from a pool as needed. If only 10 users are active simultaneously, the pool suffices.' },
                { scenario: 'An employee needs to access their home security camera from work.', answer: 'Port Forwarding (Static NAT entry)', explanation: 'Port forwarding maps an external port to the camera\'s internal IP:port, enabling remote access.' },
                { scenario: 'A VoIP phone behind NAT has trouble maintaining calls.', answer: 'NAT traversal issue (STUN/TURN needed)', explanation: 'NAT breaks end-to-end connectivity which VoIP needs. STUN/TURN servers help NAT traversal for real-time protocols.' },
                { scenario: 'All outbound traffic from 192.168.1.0/24 should appear to come from 73.45.12.88.', answer: 'PAT (Overload)', explanation: 'PAT (also called NAT overload) maps all internal hosts to a single public IP using port numbers.' }
            ]
        },
        quiz: [
            { question: 'Which RFC defines the private IP address ranges used with NAT?', options: ['RFC 791', 'RFC 1918', 'RFC 2460', 'RFC 5321'], correct: 1, explanation: 'RFC 1918 defines three private address ranges: 10.0.0.0/8, 172.16.0.0/12, and 192.168.0.0/16.' },
            { question: 'How does PAT distinguish between multiple internal devices sharing one public IP?', options: ['By MAC address', 'By unique source port numbers', 'By device hostname', 'By VLAN tag'], correct: 1, explanation: 'PAT assigns unique source port numbers to each connection, using the port number to identify which internal device should receive return traffic.' },
            { question: 'Which NAT type provides a permanent one-to-one IP address mapping?', options: ['Dynamic NAT', 'PAT', 'Static NAT', 'Hairpin NAT'], correct: 2, explanation: 'Static NAT creates a permanent, fixed mapping between one private IP and one public IP, commonly used for servers.' },
            { question: 'Why is NAT NOT considered a security control?', options: ['It does not encrypt traffic', 'It only hides internal IPs but does not filter or inspect traffic', 'It slows down network performance', 'It is only used in home networks'], correct: 1, explanation: 'NAT obscures internal IP addresses but does not inspect, filter, or block malicious traffic. It is a connectivity solution, not a security solution.' },
            { question: 'What happens when a PAT translation table is full?', options: ['New connections are allowed without translation', 'New outbound connections are dropped until entries expire', 'The router automatically adds more public IPs', 'Traffic is routed without NAT'], correct: 1, explanation: 'When the PAT table is full (65,535 entries per public IP), new connection attempts are dropped until existing entries expire or are cleared.' },
            { question: 'Port forwarding creates which type of NAT entry?', options: ['A dynamic, temporary entry', 'A static, permanent entry mapping an external port to an internal host:port', 'A PAT entry', 'A NAT pool entry'], correct: 1, explanation: 'Port forwarding is a static NAT configuration that permanently maps a specific external port to a specific internal IP address and port.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // EAP (Extensible Authentication Protocol)
    // ═══════════════════════════════════════════════════════════════════
    eap: {
        id: 'eap',
        name: 'EAP Authentication',
        icon: '\ud83d\udd11',
        color: '#a855f7',
        subtitle: 'Extensible Authentication Protocol & 802.1X',
        description: 'EAP is an authentication framework used in wireless networks and point-to-point connections. Combined with 802.1X, it provides port-based network access control. Understanding EAP types is critical for enterprise wireless security.',
        keyConcepts: ['802.1X', 'RADIUS', 'EAP-TLS', 'PEAP', 'EAP-TTLS', 'Supplicant', 'Authenticator', 'Authentication Server'],
        sections: [
            {
                title: '802.1X Framework',
                icon: '\ud83c\udfdb\ufe0f',
                content: 'IEEE 802.1X is a port-based network access control standard. It involves three roles: the supplicant (client), authenticator (switch/AP), and authentication server (RADIUS).',
                details: ['Supplicant: the device requesting network access', 'Authenticator: network device controlling the port (switch or AP)', 'Authentication Server: RADIUS server that validates credentials', 'Port starts in unauthorized state (only EAP traffic allowed)', 'After successful authentication, port is authorized for all traffic', 'Used for both wired (switch ports) and wireless (Wi-Fi) access'],
                realWorld: 'A corporate laptop connects to Wi-Fi. The access point (authenticator) blocks all traffic except EAP. The laptop (supplicant) sends credentials via EAP to the RADIUS server. After successful authentication, the AP opens the port for full network access.'
            },
            {
                title: 'EAP-TLS (Most Secure)',
                icon: '\ud83d\udd12',
                content: 'EAP-TLS requires BOTH the client AND server to have digital certificates. This mutual certificate authentication is the most secure EAP method.',
                details: ['Both client and server authenticate with X.509 certificates', 'No passwords transmitted (certificate-based)', 'Mutual authentication prevents rogue AP attacks', 'Requires PKI infrastructure to issue/manage certificates', 'Most complex to deploy but highest security', 'Used in high-security environments (government, defense)'],
                realWorld: 'A defense agency issues digital certificates to every employee device (laptops, phones) and every access point. When connecting to Wi-Fi, both the device and AP exchange certificates. No passwords are used, eliminating phishing and credential theft.'
            },
            {
                title: 'PEAP (Protected EAP)',
                icon: '\ud83d\udee1\ufe0f',
                content: 'PEAP uses a server certificate to create an encrypted TLS tunnel, then sends user credentials (username/password) inside this protected tunnel.',
                details: ['Server authenticates to client with a certificate (one-way TLS)', 'Client authenticates with username/password inside the TLS tunnel', 'Developed by Microsoft, Cisco, and RSA', 'Inner method typically MS-CHAPv2', 'Easier to deploy than EAP-TLS (no client certs needed)', 'Most commonly used EAP type in enterprise Wi-Fi'],
                realWorld: 'An enterprise deploys WPA2-Enterprise with PEAP. Employees connect using their Active Directory username and password. The RADIUS server presents its certificate; the employee\'s credentials travel inside the encrypted tunnel to the RADIUS server for validation.'
            },
            {
                title: 'EAP-TTLS & Other Types',
                icon: '\ud83d\udccb',
                content: 'EAP-TTLS is similar to PEAP but supports more inner authentication methods. Other EAP types serve specific use cases.',
                details: ['EAP-TTLS: like PEAP but supports PAP, CHAP, MS-CHAPv2 inner methods', 'EAP-FAST: Cisco proprietary, uses Protected Access Credential (PAC)', 'EAP-SIM/EAP-AKA: uses SIM card for authentication (mobile networks)', 'EAP-GTC: Generic Token Card (one-time passwords)', 'LEAP: Legacy Cisco protocol, deprecated (vulnerable to dictionary attacks)'],
                realWorld: 'A university deploys EAP-TTLS because their diverse BYOD environment includes Linux devices that support EAP-TTLS better than PEAP. Inside the TLS tunnel, they use PAP with the RADIUS server, which checks against LDAP.'
            }
        ],
        interactive: {
            type: 'scenario_matcher',
            title: 'EAP Selection Challenge',
            instructions: 'Choose the most appropriate EAP type for each scenario.',
            items: [
                { scenario: 'A government agency requires the highest wireless security with mutual authentication and no passwords.', answer: 'EAP-TLS', explanation: 'EAP-TLS provides mutual certificate authentication, the strongest EAP type with no password transmission.' },
                { scenario: 'A company wants enterprise Wi-Fi with Active Directory username/password authentication.', answer: 'PEAP', explanation: 'PEAP is the most common choice for AD-integrated enterprise Wi-Fi, using username/password inside a TLS tunnel.' },
                { scenario: 'A university needs to support diverse BYOD devices including Linux with various authentication backends.', answer: 'EAP-TTLS', explanation: 'EAP-TTLS supports more inner authentication methods and has broader cross-platform compatibility.' },
                { scenario: 'A mobile carrier needs to authenticate subscribers using their SIM cards.', answer: 'EAP-SIM/EAP-AKA', explanation: 'EAP-SIM and EAP-AKA use the SIM card for authentication, designed for mobile networks.' },
                { scenario: 'The network uses the legacy Cisco protocol but users report credential theft. What should you do?', answer: 'Migrate from LEAP to PEAP or EAP-TLS', explanation: 'LEAP is deprecated and vulnerable to dictionary attacks. Migrate to PEAP or EAP-TLS immediately.' },
                { scenario: 'A company wants 802.1X on wired switch ports to prevent unauthorized device connections.', answer: '802.1X with PEAP or EAP-TLS', explanation: '802.1X works on wired ports too. The switch keeps the port unauthorized until the device authenticates via EAP.' }
            ]
        },
        quiz: [
            { question: 'In 802.1X, what are the three roles?', options: ['Client, Server, Database', 'Supplicant, Authenticator, Authentication Server', 'User, Switch, Firewall', 'Host, Router, DNS'], correct: 1, explanation: 'The three 802.1X roles are: Supplicant (client device), Authenticator (switch/AP), and Authentication Server (RADIUS).' },
            { question: 'Which EAP type requires BOTH client and server certificates?', options: ['PEAP', 'EAP-TTLS', 'EAP-TLS', 'EAP-FAST'], correct: 2, explanation: 'EAP-TLS requires mutual certificate authentication: both the client and server must present X.509 certificates.' },
            { question: 'What is PEAP\'s primary advantage over EAP-TLS?', options: ['It is more secure', 'No client certificates required (easier deployment)', 'It supports more authentication methods', 'It is faster'], correct: 1, explanation: 'PEAP only requires a server certificate, not client certificates. Users authenticate with username/password inside a TLS tunnel, making deployment much easier.' },
            { question: 'Why is LEAP considered deprecated?', options: ['It is too slow', 'It does not support Wi-Fi', 'It is vulnerable to offline dictionary attacks', 'It was never widely adopted'], correct: 2, explanation: 'LEAP uses a weak challenge-response that can be captured and cracked offline with dictionary attacks. It should be replaced with PEAP or EAP-TLS.' },
            { question: 'In 802.1X, what happens before the supplicant authenticates?', options: ['All traffic is allowed', 'The port is in an unauthorized state (only EAP traffic allowed)', 'The device gets a temporary IP address', 'The switch reboots'], correct: 1, explanation: 'Before authentication, the 802.1X port only allows EAP traffic. All other traffic is blocked until the supplicant successfully authenticates.' },
            { question: 'Which backend server is typically used with 802.1X EAP authentication?', options: ['DNS server', 'DHCP server', 'RADIUS server', 'Web server'], correct: 2, explanation: 'RADIUS (Remote Authentication Dial-In User Service) is the standard authentication server used with 802.1X and EAP.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // WIRELESS SECURITY
    // ═══════════════════════════════════════════════════════════════════
    wireless_security: {
        id: 'wireless_security',
        name: 'Wireless Security',
        icon: '\ud83d\udce1',
        color: '#a855f7',
        subtitle: 'WEP, WPA, WPA2, WPA3 & wireless threats',
        description: 'Wireless networks transmit data over radio waves, making them inherently more vulnerable to eavesdropping and attack than wired networks. Understanding wireless security protocols and threats is critical for protecting enterprise networks.',
        keyConcepts: ['WEP', 'WPA', 'WPA2', 'WPA3', 'TKIP', 'AES-CCMP', 'SAE', 'Rogue AP', 'Evil Twin'],
        sections: [
            {
                title: 'Wireless Security Evolution',
                icon: '\ud83d\udcc8',
                content: 'Wireless security has evolved through four generations, each addressing vulnerabilities in the previous standard.',
                details: ['WEP (1997): Broken. Uses RC4, static keys, 24-bit IV. Crackable in minutes', 'WPA (2003): Temporary fix. TKIP over RC4, dynamic keys, but still weak', 'WPA2 (2004): Current standard. AES-CCMP encryption, 802.1X support', 'WPA3 (2018): Latest. SAE handshake, 192-bit security mode, Protected Management Frames', 'Personal mode: Pre-shared key (PSK) for home/small office', 'Enterprise mode: 802.1X/RADIUS for organizations'],
                realWorld: 'A security audit finds a corporate network still using WPA with TKIP. The auditor recommends immediate upgrade to WPA2-Enterprise with AES (minimum) or WPA3-Enterprise for maximum security.'
            },
            {
                title: 'WPA2 & WPA3 Details',
                icon: '\ud83d\udd12',
                content: 'WPA2 uses AES-CCMP for encryption and is the current minimum standard. WPA3 introduces SAE (Simultaneous Authentication of Equals) to replace the 4-way handshake, eliminating offline dictionary attacks.',
                details: ['WPA2-Personal: AES + PSK (Pre-Shared Key)', 'WPA2-Enterprise: AES + 802.1X/RADIUS', 'WPA3-Personal: AES + SAE (Dragonfly handshake)', 'WPA3-Enterprise: 192-bit security suite (CNSA-approved)', 'SAE provides forward secrecy (past sessions safe even if key is compromised later)', 'WPA3 requires Protected Management Frames (PMF) to prevent deauth attacks'],
                realWorld: 'After the KRACK attack exposed WPA2 vulnerabilities, WPA3 was developed. SAE replaces the vulnerable 4-way handshake with a zero-knowledge proof that prevents offline dictionary attacks, even if the attacker captures the handshake.'
            },
            {
                title: 'Wireless Attacks',
                icon: '\u26a0\ufe0f',
                content: 'Wireless networks face unique attack vectors due to the broadcast nature of radio transmissions.',
                details: ['Evil Twin: Rogue AP mimics legitimate network name (SSID)', 'Deauthentication Attack: Sends forged deauth frames to disconnect clients', 'WPA2 Handshake Capture: Capture 4-way handshake for offline cracking', 'Karma/MANA Attack: Rogue AP responds to any probe request', 'War Driving: Scanning for wireless networks while mobile', 'Jamming: Radio frequency interference to deny wireless service'],
                realWorld: 'An attacker at a coffee shop sets up an evil twin AP named "FreeWiFi" identical to the legitimate network. When victims connect, all their traffic passes through the attacker\'s device, enabling credential theft and session hijacking.'
            },
            {
                title: 'Wireless Security Best Practices',
                icon: '\u2705',
                content: 'Securing wireless networks requires proper configuration, monitoring, and policy enforcement.',
                details: ['Use WPA3 or WPA2-Enterprise minimum (never WEP or WPA)', 'Enterprise: 802.1X with EAP-TLS or PEAP', 'Enable Protected Management Frames (802.11w)', 'Use a WIDS/WIPS to detect rogue APs', 'Implement network segmentation (separate VLAN for Wi-Fi)', 'Disable WPS (Wi-Fi Protected Setup) — vulnerable to brute force', 'Regular wireless security audits and penetration tests'],
                realWorld: 'A hospital deploys WPA3-Enterprise with EAP-TLS for staff devices, a separate WPA2-Personal VLAN for IoT medical devices (with strict firewall rules), and a captive portal for guest Wi-Fi on an isolated VLAN with no access to internal resources.'
            }
        ],
        interactive: {
            type: 'scenario_matcher',
            title: 'Wireless Security Assessment',
            instructions: 'Identify the correct wireless security concept for each scenario.',
            items: [
                { scenario: 'A network uses WEP encryption for "compatibility with old devices."', answer: 'Critical vulnerability (upgrade immediately)', explanation: 'WEP can be cracked in minutes with tools like aircrack-ng. There is no acceptable reason to use WEP.' },
                { scenario: 'Users report being disconnected from Wi-Fi repeatedly before a data breach.', answer: 'Deauthentication attack (likely preceding evil twin)', explanation: 'Deauth attacks force clients to reconnect, potentially to an evil twin AP. Protected Management Frames prevent this.' },
                { scenario: 'An unknown access point with your company\'s SSID is detected in the parking lot.', answer: 'Evil Twin / Rogue AP', explanation: 'An unauthorized AP mimicking your SSID is an evil twin attack designed to capture credentials.' },
                { scenario: 'Your WPA2-Enterprise network needs protection against offline dictionary attacks on the handshake.', answer: 'Upgrade to WPA3 (SAE)', explanation: 'WPA3\'s SAE handshake provides zero-knowledge proof that prevents offline dictionary attacks.' },
                { scenario: 'Guest Wi-Fi users can access internal file servers.', answer: 'Network segmentation issue (isolate guest VLAN)', explanation: 'Guest networks must be isolated on a separate VLAN with no access to internal resources.' },
                { scenario: 'WPS is enabled on corporate access points for "easy setup."', answer: 'Disable WPS (vulnerable to PIN brute force)', explanation: 'WPS PIN can be brute-forced, bypassing WPA2 security entirely. It should always be disabled.' }
            ]
        },
        quiz: [
            { question: 'Which wireless security protocol should NEVER be used?', options: ['WPA2-Enterprise', 'WPA3-Personal', 'WEP', 'WPA2-Personal'], correct: 2, explanation: 'WEP is fundamentally broken and can be cracked in minutes. It should never be used in any environment.' },
            { question: 'What encryption algorithm does WPA2 use?', options: ['RC4', 'DES', 'AES-CCMP', 'Blowfish'], correct: 2, explanation: 'WPA2 uses AES-CCMP (Counter Mode with CBC-MAC Protocol) for encryption, a significant upgrade from WPA\'s TKIP/RC4.' },
            { question: 'What is the main improvement of WPA3-Personal over WPA2-Personal?', options: ['Faster speeds', 'SAE handshake that prevents offline dictionary attacks', 'Longer passwords', 'Better range'], correct: 1, explanation: 'WPA3 replaces the 4-way handshake with SAE (Simultaneous Authentication of Equals), providing forward secrecy and resistance to offline dictionary attacks.' },
            { question: 'What is an evil twin attack?', options: ['Two firewalls with the same configuration', 'A rogue AP that mimics a legitimate network\'s SSID', 'A dual-band wireless attack', 'A DDoS attack on wireless infrastructure'], correct: 1, explanation: 'An evil twin is a rogue access point configured with the same SSID as a legitimate network, tricking users into connecting to the attacker\'s AP.' },
            { question: 'Which feature prevents deauthentication attacks?', options: ['WPS', 'MAC filtering', 'Protected Management Frames (802.11w)', 'SSID hiding'], correct: 2, explanation: 'Protected Management Frames (PMF/802.11w) cryptographically protects management frames, preventing forged deauthentication attacks. WPA3 requires PMF.' },
            { question: 'For an enterprise wireless deployment, which configuration provides the strongest security?', options: ['WPA2-Personal with a strong password', 'WPA3-Enterprise with 802.1X/EAP-TLS', 'Hidden SSID with MAC filtering', 'WPA with TKIP and complex passphrase'], correct: 1, explanation: 'WPA3-Enterprise with 802.1X/EAP-TLS provides the strongest wireless security: latest protocol, mutual certificate authentication, no passwords.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // PROTOCOL ANALYSIS
    // ═══════════════════════════════════════════════════════════════════
    protocol_analysis: {
        id: 'protocol_analysis',
        name: 'Protocol Analysis',
        icon: '\ud83d\udd2c',
        color: '#a855f7',
        subtitle: 'Packet capture, Wireshark & traffic analysis',
        description: 'Protocol analysis is the process of capturing, decoding, and analyzing network traffic to troubleshoot issues, detect security threats, and understand network behavior. It is a core skill for both network engineers and security analysts.',
        keyConcepts: ['Packet Capture', 'Wireshark', 'tcpdump', 'Deep Packet Inspection', 'Protocol Dissection', 'Traffic Baseline', 'pcap'],
        sections: [
            {
                title: 'Packet Capture Fundamentals',
                icon: '\ud83c\udfaf',
                content: 'Packet capture (pcap) is the process of intercepting and recording network packets for analysis. This is the foundation of all protocol analysis.',
                details: ['Promiscuous mode: NIC captures all packets on the segment, not just its own', 'Monitor mode: captures wireless frames (including management/control)', 'SPAN/mirror ports: switch copies traffic to a capture port', 'Network TAPs: hardware devices that passively copy traffic', 'pcap format: standard packet capture file format', 'Capture filters: reduce capture volume by filtering at capture time'],
                realWorld: 'A SOC analyst captures 15 minutes of traffic from a suspected compromised workstation using a network TAP. The pcap file reveals DNS queries to known C2 domains, confirming the machine is infected with malware beaconing to its command server.'
            },
            {
                title: 'Wireshark & tcpdump',
                icon: '\ud83e\uddf0',
                content: 'Wireshark is the world\'s most popular GUI-based packet analyzer. tcpdump is the command-line equivalent for Linux/Unix systems.',
                details: ['Wireshark: GUI, color-coded protocols, follow stream, export objects', 'tcpdump: CLI, lightweight, scriptable, ideal for servers without GUI', 'Display filters vs capture filters (different syntax)', 'Wireshark display: tcp.port == 443 and ip.addr == 10.0.0.5', 'tcpdump capture: tcpdump -i eth0 host 10.0.0.5 -w output.pcap', 'Follow TCP/UDP/HTTP streams to reconstruct conversations'],
                realWorld: 'An analyst uses Wireshark to investigate slow application performance. By following the TCP stream, they discover excessive TCP retransmissions between the app server and database, pointing to a network congestion issue on the database VLAN.'
            },
            {
                title: 'Common Protocol Indicators',
                icon: '\ud83d\udea9',
                content: 'Knowing what normal traffic looks like helps analysts spot anomalies. Each protocol has characteristic patterns that reveal both normal operations and suspicious activity.',
                details: ['DNS: queries to unusual TLDs, high query volume (tunneling), long subdomain names', 'HTTP: User-Agent strings, unusual methods (PUT/DELETE), encoded payloads', 'TCP: SYN floods (half-open connections), RST storms, unusual flag combinations', 'ICMP: oversized packets (tunneling), high volume (flood), redirects', 'TLS: certificate errors, outdated versions, unknown CAs', 'ARP: gratuitous ARP, duplicate IPs (ARP spoofing/poisoning)'],
                realWorld: 'An analyst notices DNS queries with unusually long, encoded subdomain names: "dGhpcyBpcyBhIHRlc3Q.evil.com". Decoding the base64 reveals data exfiltration via DNS tunneling.'
            },
            {
                title: 'Security Analysis Techniques',
                icon: '\ud83d\udee1\ufe0f',
                content: 'Protocol analysis is a critical skill for incident response, threat hunting, and forensic investigations.',
                details: ['Baseline analysis: compare current traffic against known-good patterns', 'Anomaly detection: unusual ports, protocols, volumes, or destinations', 'IOC matching: search captures for known malicious IPs, domains, hashes', 'Conversation analysis: who is talking to whom, how often, how much data', 'File extraction: carve files from HTTP, FTP, SMB streams', 'Encrypted traffic analysis: JA3/JA3S fingerprinting for TLS'],
                realWorld: 'During an incident response, the team extracts a malicious executable from an HTTP stream in the pcap. The file hash matches a known RAT (Remote Access Trojan). They then pivot to find all other hosts that communicated with the same C2 IP.'
            }
        ],
        interactive: {
            type: 'scenario_matcher',
            title: 'Traffic Analysis Challenge',
            instructions: 'Identify what each traffic pattern indicates.',
            items: [
                { scenario: 'Thousands of SYN packets to port 80 from random source IPs with no SYN-ACK completions.', answer: 'SYN Flood DDoS Attack', explanation: 'Mass SYN packets without completing the handshake is a classic SYN flood denial-of-service attack.' },
                { scenario: 'DNS queries with 200-character encoded subdomains going to a single external domain.', answer: 'DNS Tunneling / Data Exfiltration', explanation: 'Unusually long DNS subdomain names often contain encoded data being exfiltrated via DNS tunneling.' },
                { scenario: 'ARP replies from two different MAC addresses claiming the same IP (the default gateway).', answer: 'ARP Spoofing/Poisoning', explanation: 'Duplicate ARP entries for the gateway indicate an attacker is poisoning the ARP cache to intercept traffic (MITM).' },
                { scenario: 'HTTPS traffic to port 443 with a self-signed certificate from an IP in a known hostile country.', answer: 'Potential C2 (Command and Control) Communication', explanation: 'Self-signed certs to suspicious IPs suggest malware communicating with its command-and-control server.' },
                { scenario: 'A single host generating ICMP echo requests to every IP in the /24 subnet sequentially.', answer: 'Ping Sweep / Host Discovery', explanation: 'Sequential ICMP echo requests across a subnet indicate network reconnaissance (host discovery).' },
                { scenario: 'Large volumes of outbound SMTP traffic from a workstation that should not be sending email.', answer: 'Compromised host sending spam or phishing', explanation: 'Unexpected SMTP traffic from a non-email server suggests the host is compromised and being used to send spam.' }
            ]
        },
        quiz: [
            { question: 'What does "promiscuous mode" mean for a network interface card?', options: ['The NIC sends traffic to all hosts', 'The NIC captures ALL packets on the segment, not just those addressed to it', 'The NIC accepts connections from any source', 'The NIC broadcasts its MAC address'], correct: 1, explanation: 'In promiscuous mode, the NIC captures all packets it sees on the wire, not just those addressed to its own MAC or IP.' },
            { question: 'Which tool is BEST for capturing packets on a headless Linux server?', options: ['Wireshark', 'tcpdump', 'Nmap', 'Netcat'], correct: 1, explanation: 'tcpdump is a command-line packet capture tool ideal for servers without a GUI. Captures can be saved as pcap files for later Wireshark analysis.' },
            { question: 'DNS queries with unusually long, base64-encoded subdomains suggest what type of attack?', options: ['SQL Injection', 'DNS Cache Poisoning', 'DNS Tunneling / Data Exfiltration', 'DDoS'], correct: 2, explanation: 'Long encoded subdomain names are a hallmark of DNS tunneling, where data is exfiltrated by encoding it into DNS queries.' },
            { question: 'What is a SPAN port used for?', options: ['Connecting to the internet', 'Mirroring traffic from one port to another for capture/analysis', 'Spanning tree protocol', 'Providing PoE to devices'], correct: 1, explanation: 'A SPAN (Switched Port Analyzer) port mirrors traffic from specified ports to a capture port where analysis tools can inspect it.' },
            { question: 'What does JA3 fingerprinting analyze?', options: ['HTTP headers', 'TLS Client Hello parameters to identify client applications', 'DNS query patterns', 'MAC addresses'], correct: 1, explanation: 'JA3 creates a fingerprint from the TLS Client Hello message parameters (ciphers, extensions, curves), identifying client applications even in encrypted traffic.' },
            { question: 'An analyst sees many TCP RST packets from an internal server. What might this indicate?', options: ['Normal traffic', 'Port scan (the server is rejecting connection attempts to closed ports)', 'Server is starting up', 'High bandwidth utilization'], correct: 1, explanation: 'A burst of TCP RST (reset) packets from a server often indicates a port scan: the server sends RST for every connection attempt to a closed port.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // TCP THREE-WAY HANDSHAKE
    // ═══════════════════════════════════════════════════════════════════
    three_way_handshake: {
        id: 'three_way_handshake',
        name: 'TCP Three-Way Handshake',
        icon: '\ud83e\udd1d',
        color: '#a855f7',
        subtitle: 'SYN, SYN-ACK, ACK — How TCP connections are established',
        description: 'The TCP three-way handshake is the process used to establish a reliable connection between two hosts. Understanding this fundamental process is essential for network troubleshooting and security analysis.',
        keyConcepts: ['SYN', 'SYN-ACK', 'ACK', 'Sequence Numbers', 'Connection State', 'Half-Open', 'FIN/RST'],
        sections: [
            {
                title: 'The Three Steps',
                icon: '1\ufe0f\u20e3',
                content: 'Every TCP connection begins with three packets exchanged between client and server, establishing synchronization and agreement on communication parameters.',
                details: ['Step 1 (SYN): Client sends SYN with initial sequence number (ISN)', 'Step 2 (SYN-ACK): Server responds with SYN-ACK, its own ISN, and acknowledges client\'s ISN+1', 'Step 3 (ACK): Client sends ACK acknowledging server\'s ISN+1', 'Connection is now ESTABLISHED and data transfer can begin', 'Each side has agreed on sequence numbers for tracking data order', 'Window size negotiated for flow control'],
                realWorld: 'When you type "google.com" in your browser, your computer sends a SYN to Google\'s server on port 443. Google responds with SYN-ACK. Your computer sends the final ACK. All of this happens in milliseconds before the TLS handshake and HTTP request even begin.'
            },
            {
                title: 'Sequence & Acknowledgment Numbers',
                icon: '\ud83d\udd22',
                content: 'Sequence numbers track the order of data bytes. Acknowledgment numbers tell the sender which byte the receiver expects next. Together, they enable reliable, ordered delivery.',
                details: ['ISN (Initial Sequence Number): randomly generated starting number', 'Sequence number increments by the number of data bytes sent', 'ACK number = next expected sequence number from the other side', 'ISN randomization prevents TCP sequence prediction attacks', 'Wireshark shows "relative sequence numbers" (starting from 0) for readability'],
                realWorld: 'In Wireshark, you see: Client SYN (Seq=0), Server SYN-ACK (Seq=0, Ack=1), Client ACK (Seq=1, Ack=1). These are relative numbers. The actual ISNs might be 3847291 and 9182736, but Wireshark normalizes them for easy reading.'
            },
            {
                title: 'Connection Termination',
                icon: '\ud83d\uded1',
                content: 'TCP connections are torn down gracefully with a four-way FIN handshake, or abruptly with a RST (reset) packet.',
                details: ['Graceful: FIN -> ACK -> FIN -> ACK (four-way close)', 'Either side can initiate the close with FIN', 'Half-close: one direction closed, other still sending', 'TIME_WAIT state: socket waits 2xMSL before fully closing', 'RST (Reset): immediate, ungraceful termination', 'RST is used when something is wrong (closed port, timeout, error)'],
                realWorld: 'A web server sends a FIN after delivering the response. The client ACKs the FIN, sends its own FIN, and the server ACKs. The client enters TIME_WAIT for 60 seconds to handle any delayed packets, then the connection fully closes.'
            },
            {
                title: 'Security Implications',
                icon: '\u26a0\ufe0f',
                content: 'The three-way handshake is targeted by several well-known attacks that exploit the connection establishment process.',
                details: ['SYN Flood: attacker sends thousands of SYNs without completing handshake', 'Server wastes resources on half-open connections', 'SYN cookies: server defense that avoids storing state for half-open connections', 'TCP sequence prediction: guessing ISN to hijack connections', 'RST injection: forged RST packets to kill established connections', 'Port scanning: SYN scan sends SYN and analyzes the response (SYN-ACK = open, RST = closed)'],
                realWorld: 'An attacker launches a SYN flood from spoofed IPs against a web server. Each SYN creates a half-open connection consuming server memory. The server enables SYN cookies: instead of storing state, it encodes connection info in the ISN. Legitimate clients complete the handshake; the spoofed packets have no effect.'
            }
        ],
        interactive: {
            type: 'scenario_matcher',
            title: 'Handshake Diagnosis',
            instructions: 'Identify what each TCP packet sequence indicates.',
            items: [
                { scenario: 'Client sends SYN, server responds with SYN-ACK, client sends ACK.', answer: 'Normal three-way handshake (connection established)', explanation: 'This is the standard SYN, SYN-ACK, ACK sequence for establishing a TCP connection.' },
                { scenario: 'Client sends SYN, server responds with RST.', answer: 'Port is closed on the server', explanation: 'A RST in response to SYN means the target port has no listening service (closed port).' },
                { scenario: 'Client sends SYN, no response received.', answer: 'Port is filtered (firewall dropping packets) or host is down', explanation: 'No response to SYN typically means a firewall is silently dropping the packet, or the host is unreachable.' },
                { scenario: 'Thousands of SYNs from random IPs to port 80 with no ACK completions.', answer: 'SYN Flood attack', explanation: 'Mass SYN packets from spoofed IPs without completing the handshake is a classic SYN flood DoS attack.' },
                { scenario: 'Client sends SYN to every port on a server sequentially.', answer: 'TCP SYN port scan (Nmap -sS)', explanation: 'Sending SYN to multiple ports and analyzing responses (SYN-ACK vs RST) is a SYN scan for port discovery.' },
                { scenario: 'An established connection suddenly receives an unsolicited RST from a third party.', answer: 'RST injection attack (connection hijacking attempt)', explanation: 'Forged RST packets from a third party attempt to kill the legitimate connection.' }
            ]
        },
        quiz: [
            { question: 'What are the three packets in the TCP three-way handshake, in order?', options: ['ACK, SYN, FIN', 'SYN, SYN-ACK, ACK', 'SYN, ACK, FIN', 'FIN, ACK, RST'], correct: 1, explanation: 'The three-way handshake: (1) Client sends SYN, (2) Server responds SYN-ACK, (3) Client sends ACK.' },
            { question: 'What does the ACK number in a TCP packet indicate?', options: ['The number of packets sent', 'The next sequence number the sender expects from the other side', 'The packet priority level', 'The number of retransmissions'], correct: 1, explanation: 'The ACK number tells the sender: "I have received all bytes up to this number and expect the next byte to have this sequence number."' },
            { question: 'A server receives a SYN and responds with RST. What does this mean?', options: ['The connection is established', 'The port is closed (no service listening)', 'The server is under attack', 'The packet was corrupted'], correct: 1, explanation: 'RST in response to SYN indicates the destination port has no listening service. This is how closed ports respond.' },
            { question: 'What defense mechanism prevents SYN flood attacks from exhausting server resources?', options: ['RST injection', 'SYN cookies', 'Port forwarding', 'ARP spoofing'], correct: 1, explanation: 'SYN cookies encode connection state information in the ISN itself, so the server does not need to store state for half-open connections.' },
            { question: 'What is TIME_WAIT state in TCP?', options: ['The time a server waits before sending a SYN', 'A state where the socket waits after connection close to handle delayed packets', 'The maximum time a connection can remain open', 'The time between retransmissions'], correct: 1, explanation: 'After a connection closes, the socket enters TIME_WAIT (typically 60-120 seconds) to handle any delayed or retransmitted packets from the closed connection.' },
            { question: 'What TCP flags does Nmap\'s SYN scan (-sS) send?', options: ['ACK only', 'SYN only (and analyzes the response)', 'FIN only', 'All flags set (XMAS scan)'], correct: 1, explanation: 'Nmap SYN scan sends a SYN to each port. SYN-ACK response = open port. RST response = closed port. No response = filtered port.' }
        ]
    }
};
