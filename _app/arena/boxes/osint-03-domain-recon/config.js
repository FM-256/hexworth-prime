/* ============================================================
   CTF ARENA — Box OSINT-03: The Corporate Footprint
   OSINT | Domain & Infrastructure Reconnaissance
   Config: DNS records, subdomains, filesystem, flags, hints, lore
   ============================================================ */

const Osint03Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Corporate Footprint',
    subtitle: 'OSINT — Domain & Infrastructure Reconnaissance',
    difficulty: 'Intermediate',
    accent: '#8b5cf6',
    storageKey: 'hexworth_ctf_osint03',
    registryId: 'osint-03-domain-recon',
    trackerKey: 'ctf_osint03',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Domain Discovery',
            icon: '\uD83C\uDF10',
            description: 'Identify the target organization\'s primary domains and registration details.',
            requiredFlags: [],
            mitre: ['T1596.002', 'T1593.002'],
            unlocks: ['enumeration'],
            locked: false
        },
        {
            id: 'enumeration',
            name: 'Subdomain Enumeration',
            icon: '\uD83D\uDD0D',
            description: 'Discover subdomains and map the organization\'s external infrastructure.',
            requiredFlags: [],
            mitre: ['T1595.002', 'T1590.002'],
            unlocks: ['analysis'],
            locked: true
        },
        {
            id: 'analysis',
            name: 'Infrastructure Analysis',
            icon: '\uD83D\uDCE1',
            description: 'Analyze DNS records, IP ranges, and technology stack of discovered assets.',
            requiredFlags: ['user'],
            mitre: ['T1590', 'T1592'],
            unlocks: ['exposure'],
            locked: true
        },
        {
            id: 'exposure',
            name: 'Exposure Assessment',
            icon: '\u26A0\uFE0F',
            description: 'Identify sensitive exposed services and data leakage points.',
            requiredFlags: ['root'],
            mitre: ['T1595', 'T1591.004'],
            unlocks: [],
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // TUTORIAL MODE
    // ═══════════════════════════════════════════════════════

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Query WHOIS for the target domain',
                tip: 'Run: whois nexagen-corp.com',
                trigger: { event: 'command', match: { cmd: 'contains:whois' } }
            },
            {
                title: 'Enumerate subdomains',
                tip: 'Run: subfinder -d nexagen-corp.com or amass enum -d nexagen-corp.com',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:subfinder' },
                    alt: [{ event: 'command', match: { cmd: 'contains:amass' } }]
                }
            },
            {
                title: 'Query DNS records',
                tip: 'Try: dig nexagen-corp.com ANY or nslookup -type=any nexagen-corp.com',
                trigger: { event: 'command', match: { cmd: 'contains:dig' } }
            },
            {
                title: 'Scan discovered hosts',
                tip: 'Run nmap on discovered subdomains to identify exposed services.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Find the exposed admin panel',
                tip: 'One of the subdomains runs an exposed admin service. Check port scan results carefully.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks', skill: 'DNS Reconnaissance' },
            { flagId: 'user', objective: '2.3', description: 'Given a scenario, analyze indicators of malicious activity — Infrastructure mapping', skill: 'Subdomain Enumeration' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques — Attack surface management', skill: 'Service Exposure Analysis' },
            { flagId: 'root', objective: '4.5', description: 'Given a scenario, modify enterprise capabilities to enhance security', skill: 'Infrastructure Hardening Assessment' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Kali Linux BIOS v4.2.1',
            'Initializing hardware...',
            'Memory Test: 8192 MB OK',
            'Detecting drives... /dev/sda1 (256GB SSD)',
            'PXE-E61: Media test failure, check cable',
            'PXE-M0F: Exiting PXE ROM.',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Kali GNU/Linux',
            'Kali GNU/Linux (recovery mode)',
            'Advanced options for Kali GNU/Linux'
        ],
        loginUser: 'kali'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal', icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',  icon: '\uD83C\uDF10', app: 'browser' },
            { id: 'notes',    label: 'Notes',    icon: '\uD83D\uDCDD', app: 'notes' },
            { id: 'hints',    label: 'Hints',    icon: '\uD83D\uDCA1', app: 'hints' },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9', app: 'flags' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget domain: nexagen-corp.com\n'
    },

    // ═══════════════════════════════════════════════════════
    // DOMAIN DATA
    // ═══════════════════════════════════════════════════════

    _domain: {
        primary: 'nexagen-corp.com',
        registrant: 'NexaGen Corporation',
        registrantEmail: 'admin@nexagen-corp.com',
        nameservers: ['ns1.cloudflare.com', 'ns2.cloudflare.com'],
        ip: '104.26.12.78',
        subdomains: [
            { name: 'www.nexagen-corp.com', ip: '104.26.12.78', service: 'HTTP/HTTPS (Cloudflare CDN)' },
            { name: 'mail.nexagen-corp.com', ip: '172.67.180.45', service: 'SMTP (Exchange Online)' },
            { name: 'vpn.nexagen-corp.com', ip: '203.45.67.12', service: 'OpenVPN (1194/udp)' },
            { name: 'dev.nexagen-corp.com', ip: '203.45.67.15', service: 'HTTP 8080 (Jenkins CI)' },
            { name: 'staging.nexagen-corp.com', ip: '203.45.67.16', service: 'HTTP (Staging Environment)' },
            { name: 'admin.nexagen-corp.com', ip: '203.45.67.17', service: 'HTTP 8443 (Admin Panel — {{FLAG:root}})' },
            { name: 'api.nexagen-corp.com', ip: '104.26.12.80', service: 'HTTPS (REST API v2)' },
            { name: 'cdn.nexagen-corp.com', ip: '104.26.12.81', service: 'HTTPS (Static Assets)' }
        ],
        dnsRecords: {
            A: [{ name: 'nexagen-corp.com', value: '104.26.12.78' }],
            MX: [{ name: 'nexagen-corp.com', value: '10 mail.nexagen-corp.com.' }],
            TXT: [
                { name: 'nexagen-corp.com', value: 'v=spf1 include:_spf.google.com include:spf.protection.outlook.com ~all' },
                { name: 'nexagen-corp.com', value: 'google-site-verification=a1b2c3d4e5f6' },
                { name: '_dmarc.nexagen-corp.com', value: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@nexagen-corp.com' }
            ],
            NS: [{ name: 'nexagen-corp.com', value: 'ns1.cloudflare.com.' }, { name: 'nexagen-corp.com', value: 'ns2.cloudflare.com.' }],
            CNAME: [{ name: 'www.nexagen-corp.com', value: 'nexagen-corp.com.' }]
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', points: 100 },
        { id: 'root', points: 200 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1000,
        minScore: 0,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 900000, points: 100 },
        timeBonusThreshold: 1800
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start with whois nexagen-corp.com and dig nexagen-corp.com ANY to gather basic domain intelligence.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Use subfinder or amass to enumerate subdomains. Several internal services are exposed to the internet.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The dev.nexagen-corp.com subdomain runs Jenkins CI on port 8080. The user flag is hidden in the Jenkins console output.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Run nmap on admin.nexagen-corp.com. Port 8443 exposes an admin panel. The root flag is in the service banner.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'NexaGen Corporation is a defense contractor suspected of poor security practices. Your mission: map their entire external digital footprint, enumerate subdomains, identify exposed services, and assess their attack surface without active exploitation.',
        scenario: 'NexaGen Corporation recently won a government contract. An anonymous tip to the security review board suggested their external infrastructure is poorly secured. Before the formal audit, your team is tasked with passive reconnaissance to determine the scope of exposure.',
        outro: 'NexaGen Corporation\'s digital footprint is extensive and poorly defended. Dev environments, admin panels, and staging servers are all exposed to the internet. The Corporate Footprint reveals an organization with zero attack surface management.',
        ecer: {
            executive: 'No security review of internet-facing infrastructure before contractor certification',
            culture: 'Development teams deploy services directly to public IPs without security approval',
            employee: 'DevOps engineers exposed Jenkins CI and admin panels without authentication requirements',
            regulatory: 'No compliance requirement for external attack surface assessment prior to contract award'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://nexagen-corp.com/',

        pages: {
            '/': {
                title: 'NexaGen Corporation',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#8b5cf6; font-size:1.6rem; margin-bottom:4px;">NexaGen Corporation</h1>
                        <div style="color:#888; font-size:0.8rem;">Defense Technology Solutions | Est. 2015</div>
                    </div>
                    <div style="max-width:600px; margin:0 auto; padding:20px;">
                        <p style="color:#666; font-size:0.85rem; line-height:1.6;">NexaGen Corporation delivers cutting-edge technology solutions for defense and intelligence agencies. Our platform integrates AI-driven analytics with secure cloud infrastructure.</p>
                        <div style="margin-top:20px; padding:15px; background:#f5f3ff; border:1px solid #c4b5fd; border-radius:6px;">
                            <strong style="color:#8b5cf6;">Contact:</strong><br>
                            <span style="color:#666; font-size:0.8rem;">info@nexagen-corp.com | (555) 234-5678</span>
                        </div>
                    </div>
                `
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'kali': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: nexagen-corp.com (NexaGen Corporation)\nObjective: Domain & infrastructure reconnaissance\n\nSteps:\n1. WHOIS lookup on primary domain\n2. DNS record enumeration\n3. Subdomain discovery (subfinder/amass)\n4. Port scanning of discovered hosts\n5. Service identification & exposure assessment\n\nRules of engagement: Passive recon only. No exploitation.\nGood luck, operator.'
                                },
                                'recon_results': {
                                    type: 'dir',
                                    children: {}
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'whois nexagen-corp.com\ndig nexagen-corp.com ANY\nsubfinder -d nexagen-corp.com'
                                }
                            }
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'share': {
                            type: 'dir',
                            children: {
                                'wordlists': {
                                    type: 'dir',
                                    children: {
                                        'subdomains-top1million.txt': {
                                            type: 'file',
                                            content: 'www\nmail\nftp\nlocalhost\nwebmail\nsmtp\npop\nns1\nns2\nwebdisk\ncpanel\nwhm\nautodiscover\nautoconfig\napi\ndev\nstaging\nadmin\nvpn\ncdn'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'kali' },
                        'passwd': { type: 'file', content: 'root:x:0:0:root:/root:/bin/bash\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash' }
                    }
                },
                'tmp': { type: 'dir', children: {} }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS
    // ═══════════════════════════════════════════════════════

    commands: {
        'whois': function(args) {
            if (args.length === 0) return 'Usage: whois <domain>';
            const domain = args[0];
            if (domain.includes('nexagen')) {
                const d = Osint03Config._domain;
                return `Domain Name: NEXAGEN-CORP.COM
Registry Domain ID: 2098765432_DOMAIN_COM-VRSN
Registrar: GoDaddy.com, LLC
Updated Date: 2024-01-15T00:00:00Z
Creation Date: 2015-06-30T00:00:00Z
Registrant Name: ${d.registrant}
Registrant Organization: NexaGen Corporation
Registrant Street: 4200 Wilson Blvd, Suite 800
Registrant City: Arlington
Registrant State/Province: VA
Registrant Postal Code: 22203
Registrant Country: US
Registrant Email: ${d.registrantEmail}
Tech Email: devops@nexagen-corp.com
Name Server: ${d.nameservers[0]}
Name Server: ${d.nameservers[1]}`;
            }
            return `No match for "${domain}".`;
        },

        'dig': function(args) {
            if (args.length === 0) return 'Usage: dig [@server] name [type]';
            const domain = args.find(a => !a.startsWith('@') && !a.startsWith('+') && a !== 'ANY' && a !== 'A' && a !== 'MX' && a !== 'TXT' && a !== 'NS' && a !== 'CNAME') || '';
            if (!domain.includes('nexagen')) return ';; connection timed out; no servers could be reached';

            const d = Osint03Config._domain;
            const type = args.find(a => ['ANY', 'A', 'MX', 'TXT', 'NS', 'CNAME'].includes(a.toUpperCase()));

            let output = `;; QUESTION SECTION:\n;${domain}.\t\t\tIN\t${type || 'A'}\n\n;; ANSWER SECTION:\n`;

            if (!type || type.toUpperCase() === 'ANY' || type.toUpperCase() === 'A') {
                d.dnsRecords.A.forEach(r => { output += `${r.name}.\t3600\tIN\tA\t${r.value}\n`; });
            }
            if (!type || type.toUpperCase() === 'ANY' || type.toUpperCase() === 'MX') {
                d.dnsRecords.MX.forEach(r => { output += `${r.name}.\t3600\tIN\tMX\t${r.value}\n`; });
            }
            if (!type || type.toUpperCase() === 'ANY' || type.toUpperCase() === 'TXT') {
                d.dnsRecords.TXT.forEach(r => { output += `${r.name}.\t3600\tIN\tTXT\t"${r.value}"\n`; });
            }
            if (!type || type.toUpperCase() === 'ANY' || type.toUpperCase() === 'NS') {
                d.dnsRecords.NS.forEach(r => { output += `${r.name}.\t3600\tIN\tNS\t${r.value}\n`; });
            }

            output += '\n;; Query time: 18 msec';
            return output;
        },

        'nslookup': function(args) {
            if (args.length === 0) return 'Usage: nslookup [-type=TYPE] name [server]';
            const domain = args.find(a => !a.startsWith('-')) || '';
            if (domain.includes('nexagen')) {
                return `Server:\t\t8.8.8.8\nAddress:\t8.8.8.8#53\n\nNon-authoritative answer:\nName:\t${domain}\nAddress: ${Osint03Config._domain.ip}`;
            }
            return `** server can\'t find ${domain}: NXDOMAIN`;
        },

        'host': function(args) {
            if (args.length === 0) return 'Usage: host [-t type] name [server]';
            const domain = args.find(a => !a.startsWith('-')) || '';
            if (domain.includes('nexagen')) {
                return `${domain} has address ${Osint03Config._domain.ip}\n${domain} mail is handled by 10 mail.nexagen-corp.com.`;
            }
            return `Host ${domain} not found: 3(NXDOMAIN)`;
        },

        'amass': function(args) {
            if (args.length === 0) return 'Usage: amass enum -d <domain>';
            const d = Osint03Config._domain;
            return `OWASP Amass v4.2.0\n\n${d.subdomains.map(s => s.name).join('\n')}\n\nThe enumeration has finished.\n${d.subdomains.length} subdomains found.`;
        },

        'subfinder': function(args) {
            if (args.length === 0) return 'Usage: subfinder -d <domain>';
            const d = Osint03Config._domain;
            return `               __    _____           __         \n  _______  __/ /_  / __(_)___  ____/ /__  _____\n / ___/ / / / __ \\/ /_/ / __ \\/ __  / _ \\/ ___/\n(__  ) /_/ / /_/ / __/ / / / / /_/ /  __/ /    \n/____/\\__,_/_.___/_/ /_/_/ /_/\\__,_/\\___/_/\n\n${d.subdomains.map(s => s.name).join('\n')}\n\n[INF] Found ${d.subdomains.length} subdomains for nexagen-corp.com in 4.2s`;
        },

        'nmap': function(args) {
            if (args.length === 0) return 'Usage: nmap [options] <target>';
            const target = args.find(a => !a.startsWith('-')) || '';
            const d = Osint03Config._domain;

            // Check for specific subdomains
            const sub = d.subdomains.find(s => target.includes(s.name) || target === s.ip);
            if (sub) {
                let ports = '';
                if (sub.name.includes('dev')) {
                    ports = `PORT     STATE SERVICE        VERSION
80/tcp   open  http           nginx 1.24.0
8080/tcp open  http-proxy     Jenkins CI 2.426.1
                               Console: {{FLAG:user}}`;
                } else if (sub.name.includes('admin')) {
                    ports = `PORT     STATE SERVICE        VERSION
8443/tcp open  https-alt      NexaGen Admin Panel v3.1
                               {{FLAG:root}}`;
                } else if (sub.name.includes('vpn')) {
                    ports = `PORT      STATE SERVICE    VERSION
1194/udp  open  openvpn    OpenVPN 2.5.9`;
                } else if (sub.name.includes('mail')) {
                    ports = `PORT    STATE SERVICE  VERSION
25/tcp  open  smtp     Microsoft Exchange
443/tcp open  https    Microsoft Exchange OWA`;
                } else {
                    ports = `PORT    STATE SERVICE  VERSION
80/tcp  open  http     nginx 1.24.0
443/tcp open  https    nginx 1.24.0`;
                }

                return `Starting Nmap 7.94\nNmap scan report for ${sub.name} (${sub.ip})\nHost is up (0.024s latency).\n\n${ports}\n\nNmap done: 1 IP address (1 host up) scanned in 6.31 seconds`;
            }

            if (target.includes('nexagen') || target === d.ip) {
                return `Starting Nmap 7.94\nNmap scan report for ${d.primary} (${d.ip})\nHost is up (0.018s latency).\n\nPORT    STATE SERVICE  VERSION\n80/tcp  open  http     cloudflare\n443/tcp open  https    cloudflare\n\nNmap done: 1 IP address (1 host up) scanned in 4.87 seconds`;
            }

            return `Starting Nmap 7.94\nNote: Host seems down.\nNmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'curl': function(args) {
            const url = args.find(a => /^https?:\/\//.test(a)) || args.filter(a => !a.startsWith('-')).pop() || '';
            if (!url) return 'curl: try \'curl --help\' for more information';
            if (url.includes('dev.nexagen') || url.includes('203.45.67.15')) {
                return `<html><head><title>Jenkins CI</title></head><body>\n<h1>Jenkins CI — NexaGen DevOps</h1>\n<p>Build Status: Last build #247 — SUCCESS</p>\n<pre>Console Output:\n[INFO] Building nexagen-platform v2.4.1\n[INFO] Running tests...\n[INFO] Flag verification: {{FLAG:user}}\n[INFO] Build complete.</pre>\n</body></html>`;
            }
            if (url.includes('admin.nexagen') || url.includes('203.45.67.17')) {
                return `<html><head><title>NexaGen Admin</title></head><body>\n<h1>NexaGen Admin Panel</h1>\n<p>Access Level: RESTRICTED</p>\n<p>Service Key: {{FLAG:root}}</p>\n</body></html>`;
            }
            if (url.includes('nexagen')) {
                return `<html><head><title>NexaGen Corporation</title></head><body>\n<h1>NexaGen Corporation</h1>\n<p>Defense Technology Solutions</p>\n</body></html>`;
            }
            return `curl: (7) Failed to connect: Connection refused`;
        },

        'wappalyzer': function(args) {
            if (args.length === 0) return 'Usage: wappalyzer <url>';
            const url = args[0] || '';
            if (url.includes('nexagen')) {
                return `Technology Stack for nexagen-corp.com:\n\nCDN:        Cloudflare\nWeb Server: nginx 1.24.0\nCMS:        WordPress 6.4\nJS:         jQuery 3.7, React 18.2\nAnalytics:  Google Analytics, Hotjar\nCI/CD:      Jenkins 2.426.1 (dev.nexagen-corp.com)\nVPN:        OpenVPN 2.5.9 (vpn.nexagen-corp.com)\nEmail:      Microsoft Exchange Online`;
            }
            return `No technology data found for ${url}`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent.trim();
    }
};
