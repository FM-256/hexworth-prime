/* ============================================================
   CTF ARENA — Box C2: The Insider's Veil
   Active Directory — Initial Access & Lateral Movement
   Config: network, AD, filesystem, flags, hints, lore
   ============================================================ */

const C2Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Insider\'s Veil',
    subtitle: 'Active Directory — Initial Access & Lateral Movement',
    difficulty: 'Advanced',
    accent: '#9b59b6',
    storageKey: 'hexworth_ctf_c2',
    registryId: 'c2-insiders-veil',
    trackerKey: 'ctf_c2',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Scan WEB-EXT-01 to discover the public-facing web application and identify open ports.',
            requiredFlags: [],
            mitre: ['T1046', 'T1595.002'],
            unlocks: ['ssrf'],
            locked: false
        },
        {
            id: 'ssrf',
            name: 'SSRF Exploitation',
            icon: '\uD83C\uDF10',
            description: 'Exploit the SSRF vulnerability to discover internal network hosts, the ironclad.local domain, and the Domain Controller IP.',
            requiredFlags: [],
            mitre: ['T1190', 'T1018'],
            unlocks: ['credentials'],
            locked: true
        },
        {
            id: 'credentials',
            name: 'Credential Acquisition',
            icon: '\uD83D\uDD11',
            description: 'AS-REP Roast a misconfigured account or password spray to obtain valid domain credentials.',
            requiredFlags: ['user'],
            mitre: ['T1558.004', 'T1110.003'],
            unlocks: ['lateral'],
            locked: true
        },
        {
            id: 'lateral',
            name: 'Lateral Movement',
            icon: '\uD83D\uDD00',
            description: 'Use acquired credentials with WinRM/evil-winrm to pivot onto EMP-LAPTOP-03.',
            requiredFlags: ['internal'],
            mitre: ['T1021.006', 'T1078.002'],
            unlocks: ['exfiltration'],
            locked: true
        },
        {
            id: 'exfiltration',
            name: 'Data Exfiltration',
            icon: '\uD83D\uDCC2',
            description: 'Enumerate EMP-LAPTOP-03 and read the insider\'s identity file to complete the mission.',
            requiredFlags: ['root'],
            mitre: ['T1005', 'T1083'],
            unlocks: [],
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // TUTORIAL MODE (Sprint AR-12)
    // ═══════════════════════════════════════════════════════

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Scan the external web server',
                tip: 'Open the Terminal and run: nmap 192.168.1.100',
                trigger: { event: 'command', match: { cmd: 'contains:nmap' } }
            },
            {
                title: 'Explore the web application for SSRF',
                tip: 'Use curl to test the /lookup endpoint with internal URLs or file:// URIs.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:curl' },
                    alt: [
                        { event: 'navigate' }
                    ]
                }
            },
            {
                title: 'Discover internal network and domain',
                tip: 'Use the SSRF to read /etc/hosts or probe internal IPs. Find ironclad.local and the DC.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Acquire domain credentials',
                tip: 'Use impacket-GetNPUsers.py for AS-REP Roasting, then crack the hash with hashcat or john.',
                trigger: { event: 'flag_correct', match: { flagId: 'internal' } }
            },
            {
                title: 'Pivot and retrieve the insider\'s identity',
                tip: 'Use evil-winrm to connect to EMP-LAPTOP-03, then read insider_identity.txt.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks — SSRF, internal network discovery', skill: 'SSRF Exploitation & Network Recon' },
            { flagId: 'user', objective: '2.3', description: 'Explain the purpose of mitigation techniques used to secure enterprise environments — Network segmentation', skill: 'Internal Network Enumeration' },
            { flagId: 'internal', objective: '2.4', description: 'Given a scenario, analyze indicators associated with application attacks — Kerberos exploitation', skill: 'AS-REP Roasting & Password Cracking' },
            { flagId: 'internal', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Credential harvesting', skill: 'Credential Acquisition' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks — Lateral movement', skill: 'WinRM Lateral Movement' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — Active Directory hardening', skill: 'AD Exploitation & Insider Threat Investigation' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Kali Linux BIOS v4.2.1',
            'Initializing hardware...',
            'Memory Test: 16384 MB OK',
            'Detecting drives... /dev/sda1 (512GB SSD)',
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
    // TERMINAL CONFIG (multi-context)
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 192.168.1.100 (WEB-EXT-01)\n'
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONTEXT STATE
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',  // 'attacker' or 'emp-laptop'

    _switchContext(ctx, term) {
        C2Config._context = ctx;
        if (ctx === 'emp-laptop') {
            term.user = 'jdoe';
            term.hostname = 'EMP-LAPTOP-03';
            term.cwd = 'C:\\Users\\jdoe';
            return '*Evil-WinRM* PS C:\\Users\\jdoe> ';
        } else {
            term.user = 'kali';
            term.hostname = 'kali';
            term.cwd = '/home/kali';
            return '';
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', points: 100 },
        { id: 'internal', points: 150 },
        { id: 'root', points: 250 }
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
        speedBonus: { threshold: 1200000, points: 150 },  // 20 minutes
        timeBonusThreshold: 2400  // 40 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'The web application on WEB-EXT-01 has a /lookup endpoint that fetches URLs server-side. Try using file:// or http:// schemes to probe internal resources.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Use the SSRF to read /etc/hosts on WEB-EXT-01. It reveals internal hostnames and IPs including dc-ironclad-01.ironclad.local at 10.10.1.10.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The user jdoe has Kerberos pre-authentication disabled. Run: impacket-GetNPUsers.py ironclad.local/jdoe -no-pass -dc-ip 10.10.1.10 to get an AS-REP hash, then crack it.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'After cracking jdoe\'s password (Welcome2023!), use evil-winrm to connect to EMP-LAPTOP-03 at 10.10.1.15. The insider\'s identity file is on the Desktop.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Ironclad Corporation, a major supplier of advanced alloys, relies on a sprawling Active Directory domain (ironclad.local) for its operations. An internal audit flagged suspicious activity from employee workstation EMP-LAPTOP-03. Your mission: infiltrate from the outside, pivot through the domain, and uncover the insider\'s identity.',
        scenario: 'Ironclad\'s IT department deployed a public-facing web server (WEB-EXT-01) with an internal lookup service for vendor integrations. The SSRF vulnerability was flagged in a penetration test six months ago but deprioritized. Meanwhile, a junior sysadmin disabled Kerberos pre-authentication on several service accounts "to fix login issues." The combination of these oversights creates a chain from external access to full domain compromise.',
        outro: 'The insider\'s veil has been lifted. Through SSRF exploitation, AS-REP roasting, and lateral movement via WinRM, you traced the breach to its source. The Ironclad Corporation\'s Active Directory failings are now fully documented.',
        ecer: {
            executive: 'CTO deprioritized pentest findings, delayed remediation of SSRF vulnerability',
            culture: 'No change management process for AD configuration changes, no network segmentation between DMZ and internal',
            employee: 'Junior sysadmin disabled Kerberos pre-auth without security review; insider exfiltrated data via local workstation',
            regulatory: 'No compliance requirement for AD security hardening or regular privilege audits'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Ironclad Vendor Portal
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://192.168.1.100/',

        pages: {
            '/': {
                title: 'Ironclad Corporation — Vendor Portal',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#9b59b6; font-size:1.6rem; font-family:Georgia,serif; margin-bottom:4px;"><img src="/assets/images/icons/icon-scales.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> Ironclad Corporation</h1>
                        <div style="color:#888; font-size:0.8rem;">Vendor Integration Portal v3.2.1</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 20px;">
                        <label style="display:block; color:#808080; font-size:0.8rem; margin-bottom:6px;">Vendor URL Lookup Service:</label>
                        <div style="display:flex; gap:8px;">
                            <input type="text" data-field="url" placeholder="e.g. https://vendor-api.example.com/status"
                                   style="flex:1; padding:8px 14px; border:1px solid #ccc; border-radius:4px; font-family:inherit; font-size:0.85rem;">
                            <button data-action="search"
                                    style="padding:8px 20px; background:#9b59b6; color:#fff; border:none; border-radius:4px; font-family:inherit; font-weight:700; cursor:pointer;">Lookup</button>
                        </div>
                        <div style="color:#aaa; font-size:0.7rem; margin-top:6px;">Enter a vendor API URL to verify connectivity and fetch status.</div>
                    </div>

                    <div data-results style="max-width:700px; margin:0 auto;">
                        <div style="color:#888; font-size:0.7rem; letter-spacing:0.1em; margin-bottom:8px;">LOOKUP RESULTS</div>
                        <div style="padding:20px; background:#f9f9f9; border:1px solid #eee; border-radius:4px; color:#999; font-size:0.8rem; text-align:center;">
                            Enter a URL above and click Lookup to test vendor connectivity.
                        </div>
                    </div>
                `,
                formHandler: function(data, engine) {
                    return C2Config._handleLookup(data.url || data.search || '', engine);
                }
            },
            '/lookup': {
                title: 'Ironclad Corporation — Lookup Service',
                html: '<div style="padding:20px; color:#888;">Lookup endpoint. Use the query parameter: /lookup?url=&lt;target&gt;</div>',
                formHandler: function(data, engine) {
                    return C2Config._handleLookup(data.url || data.search || '', engine);
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // SSRF ENGINE
    // ═══════════════════════════════════════════════════════

    _handleLookup(input, engine) {
        if (!input.trim()) {
            return '<div style="color:#888; padding:10px; text-align:center;">No URL provided.</div>';
        }

        const lower = input.toLowerCase().trim();

        // ── file:///etc/hosts — reveals internal network ──
        if (lower.includes('file:///etc/hosts') || lower.includes('file:///etc/resolv.conf')) {
            if (engine) engine.unlockPhase && engine.unlockPhase('ssrf');
            const isHosts = lower.includes('hosts');
            const content = isHosts
                ? '127.0.0.1       localhost\n10.10.1.5       web-ext-01.ironclad.local  web-ext-01\n10.10.1.10      dc-ironclad-01.ironclad.local  dc-ironclad-01\n10.10.1.15      emp-laptop-03.ironclad.local  emp-laptop-03\n10.10.1.20      file-srv-01.ironclad.local  file-srv-01'
                : 'nameserver 10.10.1.10\nsearch ironclad.local';
            return `<div style="background:#1a1a2e; color:#0f0; font-family:monospace; padding:15px; border-radius:4px; font-size:0.8rem; white-space:pre; line-height:1.6;">${content}</div>
            <div style="color:#2ecc71; background:rgba(46,204,113,0.08); border:1px solid rgba(46,204,113,0.2); border-radius:4px; padding:10px; margin-top:10px; font-size:0.8rem;">
                SSRF successful! Internal hosts file retrieved from WEB-EXT-01. Domain: ironclad.local discovered.
            </div>`;
        }

        // ── file:///etc/passwd ──
        if (lower.includes('file:///etc/passwd')) {
            return `<div style="background:#1a1a2e; color:#0f0; font-family:monospace; padding:15px; border-radius:4px; font-size:0.8rem; white-space:pre; line-height:1.6;">root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
sshd:x:106:65534::/run/sshd:/usr/sbin/nologin
webapp:x:1001:1001:Vendor Portal App:/opt/webapp:/bin/false</div>`;
        }

        // ── file:///opt/webapp/config.js or config.php ──
        if (lower.includes('file:///opt/webapp/config') || lower.includes('file:///var/www')) {
            return `<div style="background:#1a1a2e; color:#0f0; font-family:monospace; padding:15px; border-radius:4px; font-size:0.8rem; white-space:pre; line-height:1.6;">// Vendor Portal Configuration
module.exports = {
    port: 80,
    lookupEndpoint: '/lookup',
    allowedSchemes: ['http', 'https', 'file'],  // TODO: remove file:// before production
    internalProxy: '10.10.1.5:8080',
    adDomain: 'ironclad.local',
    adServer: '10.10.1.10',
    debug: true
};</div>
            <div style="color:#e67e22; background:rgba(230,126,34,0.08); border:1px solid rgba(230,126,34,0.2); border-radius:4px; padding:10px; margin-top:10px; font-size:0.8rem;">
                Application configuration leaked! Note the file:// scheme is enabled and AD connection details are exposed.
            </div>`;
        }

        // ── SSRF to internal LDAP (DC) ──
        if (lower.includes('10.10.1.10:389') || lower.includes('10.10.1.10/ldap') || (lower.includes('10.10.1.10') && lower.includes('ldap'))) {
            return `<div style="background:#1a1a2e; color:#0f0; font-family:monospace; padding:15px; border-radius:4px; font-size:0.8rem; white-space:pre; line-height:1.6;">LDAP Response from dc-ironclad-01.ironclad.local (10.10.1.10:389)
========================================================
namingContexts: DC=ironclad,DC=local
defaultNamingContext: DC=ironclad,DC=local
dnsHostName: dc-ironclad-01.ironclad.local
ldapServiceName: ironclad.local:dc-ironclad-01$@IRONCLAD.LOCAL
serverName: CN=DC-IRONCLAD-01,CN=Servers,CN=Default-First-Site-Name,CN=Sites,CN=Configuration,DC=ironclad,DC=local
supportedLDAPVersion: 3

Domain Users:
  CN=Administrator,CN=Users,DC=ironclad,DC=local
  CN=jdoe,CN=Users,DC=ironclad,DC=local  [UF_DONT_REQUIRE_PREAUTH]
  CN=it_helpdesk,CN=Users,DC=ironclad,DC=local
  CN=svc_backup,CN=Users,DC=ironclad,DC=local
  CN=m.chen,CN=Users,DC=ironclad,DC=local</div>
            <div style="color:#2ecc71; background:rgba(46,204,113,0.08); border:1px solid rgba(46,204,113,0.2); border-radius:4px; padding:10px; margin-top:10px; font-size:0.8rem;">
                LDAP enumeration via SSRF successful! Note: jdoe has UF_DONT_REQUIRE_PREAUTH set — vulnerable to AS-REP Roasting.
            </div>`;
        }

        // ── SSRF to internal hosts (generic) ──
        if (lower.includes('10.10.1.10') && !lower.includes('ldap') && !lower.includes('389')) {
            return `<div style="background:#1a1a2e; color:#0f0; font-family:monospace; padding:15px; border-radius:4px; font-size:0.8rem; white-space:pre; line-height:1.6;">HTTP/1.1 200 OK
Server: Microsoft-IIS/10.0
X-Powered-By: ASP.NET
Content-Type: text/html

&lt;title&gt;IIS Windows Server&lt;/title&gt;
&lt;h1&gt;Internet Information Services&lt;/h1&gt;
&lt;p&gt;DC-IRONCLAD-01.ironclad.local&lt;/p&gt;</div>`;
        }

        if (lower.includes('10.10.1.15')) {
            return `<div style="background:#1a1a2e; color:#e74c3c; font-family:monospace; padding:15px; border-radius:4px; font-size:0.8rem; white-space:pre; line-height:1.6;">HTTP/1.1 403 Forbidden
Server: Microsoft-HTTPAPI/2.0

Access denied. WinRM requires authentication.</div>
            <div style="color:#e67e22; background:rgba(230,126,34,0.08); border:1px solid rgba(230,126,34,0.2); border-radius:4px; padding:10px; margin-top:10px; font-size:0.8rem;">
                EMP-LAPTOP-03 is reachable but requires valid domain credentials for WinRM access.
            </div>`;
        }

        // ── External URLs (vendor simulation) ──
        if (lower.startsWith('http://') || lower.startsWith('https://')) {
            if (lower.includes('192.168.1.100')) {
                return '<div style="color:#888; padding:10px;">Self-referencing request blocked. Try an internal or external URL.</div>';
            }
            return `<div style="background:#f9f9f9; border:1px solid #eee; border-radius:4px; padding:15px; font-size:0.8rem;">
                <div style="color:#2ecc71; font-weight:bold; margin-bottom:8px;">Connection Successful</div>
                <div style="color:#666;">Response from ${C2Config._escHtml(input)}:</div>
                <div style="color:#888; margin-top:8px; font-family:monospace; font-size:0.75rem;">HTTP/1.1 200 OK<br>Content-Type: text/html<br>Server: nginx/1.18.0</div>
            </div>`;
        }

        return '<div style="color:#e74c3c; padding:10px; font-size:0.8rem;">Invalid URL scheme. Supported: http://, https://, file://</div>';
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (attacker machine — kali context)
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
                                    content: '=== MISSION BRIEFING ===\nTarget: 192.168.1.100 (WEB-EXT-01)\nObjective: Infiltrate Ironclad Corporation via AD exploitation\n\nAttack chain:\n1. Scan WEB-EXT-01 — identify web app and SSRF\n2. Exploit SSRF to discover internal network (ironclad.local)\n3. AS-REP Roast or password spray for domain credentials\n4. Lateral movement via WinRM to EMP-LAPTOP-03\n5. Read insider_identity.txt for final flag\n\nThree flags: user (100pts), internal (150pts), root (250pts)\n\nGood luck, operator.'
                                },
                                'loot': {
                                    type: 'dir',
                                    children: {}
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap 192.168.1.100\ncurl http://192.168.1.100/\nfirefox http://192.168.1.100/'
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
                                        'rockyou.txt': {
                                            type: 'file',
                                            content: '[rockyou.txt — 14,341,564 passwords — file too large to display]'
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
                        'hostname': {
                            type: 'file',
                            content: 'kali'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash'
                        },
                        'proxychains4.conf': {
                            type: 'file',
                            content: '# proxychains.conf\n[ProxyList]\n# SOCKS5 proxy through WEB-EXT-01\nsocks5 192.168.1.100 1080'
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {
                        'jdoe_hash.txt': {
                            type: 'file',
                            content: '$krb5asrep$23$jdoe@IRONCLAD.LOCAL:a8f2e9c1d4b7563e8a0f1c2d3e4b5a6c$7f8e9d0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8'
                        }
                    }
                },
                'opt': {
                    type: 'dir',
                    children: {
                        'impacket': {
                            type: 'dir',
                            children: {
                                'examples': {
                                    type: 'dir',
                                    children: {}
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // WINDOWS FILESYSTEM (EMP-LAPTOP-03 context)
    // ═══════════════════════════════════════════════════════

    _winFs: {
        'C:\\': {
            type: 'dir',
            children: {
                'Users': {
                    type: 'dir',
                    children: {
                        'jdoe': {
                            type: 'dir',
                            children: {
                                'Desktop': {
                                    type: 'dir',
                                    children: {
                                        'insider_identity.txt': {
                                            type: 'file',
                                            content: '{{FLAG:root}}'
                                        },
                                        'quarterly_report.xlsx': {
                                            type: 'file',
                                            content: '[Binary file — Microsoft Excel Spreadsheet]'
                                        }
                                    }
                                },
                                'Documents': {
                                    type: 'dir',
                                    children: {
                                        'secret_communications.txt': {
                                            type: 'file',
                                            content: '--- ENCRYPTED COMMUNICATIONS LOG ---\nFrom: [REDACTED]\nTo: jdoe@ironclad.local\nSubject: Data Package Ready\n\nThe extraction is scheduled for next quarter.\nUse the dead drop at \\\\file-srv-01\\shared\\reports\\.\nEncryption key rotates weekly — current: AES-256-GCM.\nDo NOT use your corporate email for this.\n\n--- END LOG ---'
                                        },
                                        'work_notes.txt': {
                                            type: 'file',
                                            content: 'Meeting notes - Q3 Review\n- Server migration on track\n- Need to update firewall rules for new vendor portal\n- IT helpdesk password policy review scheduled'
                                        }
                                    }
                                },
                                'Downloads': {
                                    type: 'dir',
                                    children: {
                                        'vpn_config.ovpn': {
                                            type: 'file',
                                            content: '# OpenVPN Config - Ironclad Corp\nclient\ndev tun\nproto udp\nremote vpn.ironclad.local 1194\nresolv-retry infinite\nnobind\nca ca.crt\ncert jdoe.crt\nkey jdoe.key'
                                        }
                                    }
                                },
                                'AppData': {
                                    type: 'dir',
                                    children: {
                                        'Local': {
                                            type: 'dir',
                                            children: {
                                                'Temp': {
                                                    type: 'dir',
                                                    children: {}
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        'Public': {
                            type: 'dir',
                            children: {}
                        },
                        'Administrator': {
                            type: 'dir',
                            children: {}
                        }
                    }
                },
                'Windows': {
                    type: 'dir',
                    children: {
                        'System32': {
                            type: 'dir',
                            children: {
                                'config': {
                                    type: 'dir',
                                    children: {
                                        'SAM': {
                                            type: 'file',
                                            content: '[Access Denied — file locked by system process]'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'Program Files': {
                    type: 'dir',
                    children: {}
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (box-specific tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        // ── nmap ──
        'nmap': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 192.168.1.100';
            const target = args.find(a => !a.startsWith('-')) || '';

            // External target — WEB-EXT-01
            if (target === '192.168.1.100') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 192.168.1.100
Host is up (0.028s latency).
Not shown: 997 closed tcp ports

PORT    STATE SERVICE    VERSION
22/tcp  open  ssh        OpenSSH 8.4p1 Debian
80/tcp  open  http       Node.js (Express)
443/tcp open  ssl/http   Node.js (Express)

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 12.34 seconds`;
            }

            // Internal subnet scan (via proxychains or post-SSRF)
            if (target === '10.10.1.0/24' || target.includes('10.10.1.0')) {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.10.1.5 (web-ext-01.ironclad.local)
Host is up (0.001s latency).
PORT    STATE SERVICE
22/tcp  open  ssh
80/tcp  open  http
443/tcp open  https

Nmap scan report for 10.10.1.10 (dc-ironclad-01.ironclad.local)
Host is up (0.003s latency).
PORT     STATE SERVICE
53/tcp   open  domain
88/tcp   open  kerberos-sec
135/tcp  open  msrpc
389/tcp  open  ldap
445/tcp  open  microsoft-ds
636/tcp  open  ldapssl
3268/tcp open  globalcatLDAP
5985/tcp open  wsman

Nmap scan report for 10.10.1.15 (emp-laptop-03.ironclad.local)
Host is up (0.005s latency).
PORT     STATE SERVICE
135/tcp  open  msrpc
445/tcp  open  microsoft-ds
5985/tcp open  wsman

Nmap scan report for 10.10.1.20 (file-srv-01.ironclad.local)
Host is up (0.004s latency).
PORT    STATE SERVICE
445/tcp open  microsoft-ds

Nmap done: 256 IP addresses (4 hosts up) scanned in 28.91 seconds`;
            }

            // Individual internal hosts
            if (target === '10.10.1.10') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for dc-ironclad-01.ironclad.local (10.10.1.10)
Host is up (0.003s latency).

PORT     STATE SERVICE       VERSION
53/tcp   open  domain        Microsoft DNS
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos
135/tcp  open  msrpc         Microsoft Windows RPC
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP
445/tcp  open  microsoft-ds  Windows Server 2019 Standard
636/tcp  open  ldapssl
3268/tcp open  globalcatLDAP
5985/tcp open  wsman

Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows_server_2019

Nmap done: 1 IP address (1 host up) scanned in 9.87 seconds`;
            }

            if (target === '10.10.1.15') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for emp-laptop-03.ironclad.local (10.10.1.15)
Host is up (0.005s latency).

PORT     STATE SERVICE       VERSION
135/tcp  open  msrpc         Microsoft Windows RPC
445/tcp  open  microsoft-ds  Windows 10 Pro
5985/tcp open  wsman         Microsoft HTTPAPI httpd 2.0

Service Info: OS: Windows 10; CPE: cpe:/o:microsoft:windows_10

Nmap done: 1 IP address (1 host up) scanned in 7.23 seconds`;
            }

            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00012s latency).
All 1000 scanned ports on localhost are closed.

Nmap done: 1 IP address (1 host up) scanned in 0.08 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        // ── curl (with SSRF support) ──
        'curl': function(args, term, engine) {
            const url = args.find(a => /^https?:\/\//.test(a)) || args.filter(a => !a.startsWith('-')).pop() || '';
            if (!url) return 'curl: try \'curl --help\' for more information';

            // SSRF via the lookup endpoint
            if (url.includes('192.168.1.100') && url.includes('/lookup')) {
                const urlMatch = url.match(/[?&]url=([^\s&"']*)/);
                if (urlMatch) {
                    const targetUrl = decodeURIComponent(urlMatch[1]);
                    // Delegate to SSRF engine and strip HTML for terminal
                    const result = C2Config._handleLookup(targetUrl, engine);
                    return C2Config._stripHtml(result);
                }
                return 'Ironclad Vendor Portal — Lookup Service\nUsage: /lookup?url=<target_url>\nSupported schemes: http, https, file';
            }

            // Direct web server
            if (url.includes('192.168.1.100') && !url.includes('/lookup')) {
                return `<!DOCTYPE html>
<html>
<head><title>Ironclad Corporation - Vendor Portal</title></head>
<body>
<h1>Ironclad Corporation</h1>
<p>Vendor Integration Portal v3.2.1</p>
<form action="/lookup" method="GET">
  <label>URL Lookup Service:</label>
  <input name="url" placeholder="Enter vendor API URL...">
  <button type="submit">Lookup</button>
</form>
<p><small>For vendor integration support, contact vendor-support@ironclad.local</small></p>
</body>
</html>`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        // ── impacket-GetNPUsers.py (AS-REP Roasting) ──
        'impacket-GetNPUsers.py': function(args, term, engine) {
            if (args.length === 0) return 'Impacket v0.11.0 - GetNPUsers\nUsage: impacket-GetNPUsers.py <domain>/<user> [-no-pass] [-dc-ip <ip>]';

            const argsStr = args.join(' ');

            if (argsStr.includes('jdoe') && (argsStr.includes('-no-pass') || argsStr.includes('-no-preauth'))) {
                return `Impacket v0.11.0 - Copyright 2023 Fortra

[*] Getting TGT for jdoe
$krb5asrep$23$jdoe@IRONCLAD.LOCAL:a8f2e9c1d4b7563e8a0f1c2d3e4b5a6c$7f8e9d0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8

[*] Saved hash to /tmp/jdoe_hash.txt`;
            }

            if (argsStr.includes('ironclad.local') && !argsStr.includes('jdoe')) {
                return `Impacket v0.11.0 - Copyright 2023 Fortra

[*] Getting TGT for users with UF_DONT_REQUIRE_PREAUTH set
$krb5asrep$23$jdoe@IRONCLAD.LOCAL:a8f2e9c1d4b7563e8a0f1c2d3e4b5a6c$7f8e9d0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8

[*] 1 user(s) found with UF_DONT_REQUIRE_PREAUTH`;
            }

            return 'Impacket v0.11.0 - Copyright 2023 Fortra\n\n[-] No entries found.';
        },

        // ── hashcat ──
        'hashcat': function(args, term, engine) {
            if (args.length === 0) return 'Usage: hashcat [options] <hash|hashfile> [dictionary]\n  -m 18200  Kerberos 5 AS-REP etype 23';

            const argsStr = args.join(' ');
            if (argsStr.includes('18200') || argsStr.includes('jdoe') || argsStr.includes('krb5')) {
                return `hashcat (v6.2.6) starting

Host memory required for this attack: 256 MB

Dictionary cache built:
* Filename..: /usr/share/wordlists/rockyou.txt
* Passwords.: 14341564
* Bytes.....: 139921507

$krb5asrep$23$jdoe@IRONCLAD.LOCAL:a8f2e9c1d4b7563e8a0f1c2d3e4b5a6c$7f8e9d0a...:Welcome2023!

Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 18200 (Kerberos 5, etype 23, AS-REP)
Hash.Target......: $krb5asrep$23$jdoe@IRONCLAD.LOCAL
Time.Started.....: Thu Mar 19 14:22:01 2026
Time.Estimated...: Thu Mar 19 14:22:08 2026 (7 secs)
Recovered........: 1/1 (100.00%)
Speed.#1.........:  2048.0 kH/s

Started: Thu Mar 19 14:22:00 2026
Stopped: Thu Mar 19 14:22:09 2026

{{FLAG:internal}}`;
            }

            return 'hashcat (v6.2.6) starting\n\nNo hashes loaded.';
        },

        // ── john ──
        'john': function(args, term, engine) {
            if (args.length === 0) return 'Usage: john [options] <password-files>';

            const argsStr = args.join(' ');
            if (argsStr.includes('jdoe') || argsStr.includes('hash') || argsStr.includes('krb5')) {
                return `Using default input encoding: UTF-8
Loaded 1 password hash (krb5asrep, Kerberos 5 AS-REP etype 17/18/23 [MD4 HMAC-MD5 RC4 / PBKDF2 HMAC-SHA1 AES 256/256 AVX2])
Proceeding with wordlist: /usr/share/wordlists/rockyou.txt
Welcome2023!     (jdoe@IRONCLAD.LOCAL)
1g 0:00:00:04 DONE (2026-03-19 14:23) 0.2380g/s 1048576p/s

Use the "--show" option to display cracked passwords reliably

{{FLAG:internal}}`;
            }

            return 'No password hashes loaded (see FAQ)';
        },

        // ── crackmapexec ──
        'crackmapexec': function(args, term, engine) {
            if (args.length === 0) return 'Usage: crackmapexec <protocol> <target> [options]\nProtocols: smb, winrm, ldap, ssh, mssql';

            const argsStr = args.join(' ');

            // WinRM with correct creds to EMP-LAPTOP-03
            if (argsStr.includes('winrm') && argsStr.includes('10.10.1.15') && argsStr.includes('jdoe') && argsStr.includes('Welcome2023!')) {
                return `SMB         10.10.1.15      5985   EMP-LAPTOP-03    [*] Windows 10.0 Build 19041 (name:EMP-LAPTOP-03) (domain:ironclad.local)
WINRM       10.10.1.15      5985   EMP-LAPTOP-03    [+] ironclad.local\\jdoe:Welcome2023! (Pwn3d!)`;
            }

            // WinRM with it_helpdesk creds
            if (argsStr.includes('winrm') && argsStr.includes('it_helpdesk') && argsStr.includes('Summer2023!')) {
                if (argsStr.includes('10.10.1.15')) {
                    return `SMB         10.10.1.15      5985   EMP-LAPTOP-03    [*] Windows 10.0 Build 19041 (name:EMP-LAPTOP-03) (domain:ironclad.local)
WINRM       10.10.1.15      5985   EMP-LAPTOP-03    [+] ironclad.local\\it_helpdesk:Summer2023! (Pwn3d!)`;
                }
                if (argsStr.includes('10.10.1.10')) {
                    return `SMB         10.10.1.10      5985   DC-IRONCLAD-01   [*] Windows Server 2019 Build 17763 (name:DC-IRONCLAD-01) (domain:ironclad.local)
WINRM       10.10.1.10      5985   DC-IRONCLAD-01   [-] ironclad.local\\it_helpdesk:Summer2023! (Access Denied)`;
                }
            }

            // Password spray
            if (argsStr.includes('smb') && argsStr.includes('10.10.1.10')) {
                if (argsStr.includes('it_helpdesk') && argsStr.includes('Summer2023!')) {
                    return `SMB         10.10.1.10      445    DC-IRONCLAD-01   [*] Windows Server 2019 Build 17763 (name:DC-IRONCLAD-01) (domain:ironclad.local)
SMB         10.10.1.10      445    DC-IRONCLAD-01   [+] ironclad.local\\it_helpdesk:Summer2023!`;
                }
                return `SMB         10.10.1.10      445    DC-IRONCLAD-01   [*] Windows Server 2019 Build 17763 (name:DC-IRONCLAD-01) (domain:ironclad.local)
SMB         10.10.1.10      445    DC-IRONCLAD-01   [-] Authentication failed`;
            }

            return 'Error: invalid target or protocol specified.';
        },

        // ── evil-winrm (context switch to Windows) ──
        'evil-winrm': function(args, term, engine) {
            if (args.length === 0) return 'Usage: evil-winrm -i <target> -u <user> -p <password>';

            const argsStr = args.join(' ');
            const hasTarget = argsStr.includes('10.10.1.15');
            const hasJdoe = argsStr.includes('jdoe');
            const hasHelpdesk = argsStr.includes('it_helpdesk');
            const hasCorrectPass = argsStr.includes('Welcome2023!') || argsStr.includes('Summer2023!');

            if (hasTarget && (hasJdoe || hasHelpdesk) && hasCorrectPass) {
                const user = hasJdoe ? 'jdoe' : 'it_helpdesk';
                C2Config._context = 'emp-laptop';
                if (term) {
                    term.user = user;
                    term.hostname = 'EMP-LAPTOP-03';
                    term.cwd = 'C:\\Users\\' + user;
                }
                return `Evil-WinRM shell v3.5
Info: Establishing connection to remote endpoint

*Evil-WinRM* PS C:\\Users\\${user}>

[+] Connected to EMP-LAPTOP-03.ironclad.local as ironclad\\${user}
[+] Use 'dir', 'type', 'cd' to navigate the Windows filesystem.`;
            }

            if (hasTarget && !hasCorrectPass) {
                return `Evil-WinRM shell v3.5
Info: Establishing connection to remote endpoint

Error: An error of type WinRM::WinRMAuthorizationError happened
Error: Bad credentials or access denied.`;
            }

            return `Evil-WinRM shell v3.5
Error: Could not connect to target. Verify the IP and port.`;
        },

        // ── Windows: dir ──
        'dir': function(args, term, engine) {
            if (C2Config._context !== 'emp-laptop') {
                return 'dir: command not found (Linux context — use ls instead)';
            }

            const target = args[0] || term.cwd || 'C:\\Users\\jdoe';
            const normalized = target.replace(/\//g, '\\');

            const dirMap = {
                'C:\\Users\\jdoe': {
                    header: 'C:\\Users\\jdoe',
                    entries: [
                        '<DIR>          Desktop',
                        '<DIR>          Documents',
                        '<DIR>          Downloads',
                        '<DIR>          AppData'
                    ]
                },
                'C:\\Users\\jdoe\\Desktop': {
                    header: 'C:\\Users\\jdoe\\Desktop',
                    entries: [
                        '             342 insider_identity.txt',
                        '          12,544 quarterly_report.xlsx'
                    ]
                },
                'C:\\Users\\jdoe\\Documents': {
                    header: 'C:\\Users\\jdoe\\Documents',
                    entries: [
                        '             891 secret_communications.txt',
                        '             256 work_notes.txt'
                    ]
                },
                'C:\\Users\\jdoe\\Downloads': {
                    header: 'C:\\Users\\jdoe\\Downloads',
                    entries: [
                        '             512 vpn_config.ovpn'
                    ]
                },
                'C:\\': {
                    header: 'C:\\',
                    entries: [
                        '<DIR>          Users',
                        '<DIR>          Windows',
                        '<DIR>          Program Files'
                    ]
                },
                'C:\\Users': {
                    header: 'C:\\Users',
                    entries: [
                        '<DIR>          jdoe',
                        '<DIR>          Public',
                        '<DIR>          Administrator'
                    ]
                }
            };

            const match = dirMap[normalized];
            if (match) {
                let output = ` Volume in drive C has no label.\n Volume Serial Number is 4A3B-7C1D\n\n Directory of ${match.header}\n\n`;
                output += '03/19/2026  02:14 PM    <DIR>          .\n';
                output += '03/19/2026  02:14 PM    <DIR>          ..\n';
                match.entries.forEach(e => {
                    output += `03/19/2026  02:14 PM    ${e}\n`;
                });
                output += `               ${match.entries.length} File(s)\n`;
                return output;
            }

            return `File Not Found: ${normalized}`;
        },

        // ── Windows: type (cat equivalent) ──
        'type': function(args, term, engine) {
            if (C2Config._context !== 'emp-laptop') {
                return 'type: command not found (Linux context — use cat instead)';
            }

            const filePath = args.join(' ').replace(/"/g, '');
            const normalized = filePath.replace(/\//g, '\\');

            const fileMap = {
                'C:\\Users\\jdoe\\Desktop\\insider_identity.txt': '{{FLAG:root}}',
                'insider_identity.txt': '{{FLAG:root}}',
                'C:\\Users\\jdoe\\Documents\\secret_communications.txt': '--- ENCRYPTED COMMUNICATIONS LOG ---\nFrom: [REDACTED]\nTo: jdoe@ironclad.local\nSubject: Data Package Ready\n\nThe extraction is scheduled for next quarter.\nUse the dead drop at \\\\file-srv-01\\shared\\reports\\.\nEncryption key rotates weekly — current: AES-256-GCM.\nDo NOT use your corporate email for this.\n\n--- END LOG ---',
                'secret_communications.txt': '--- ENCRYPTED COMMUNICATIONS LOG ---\nFrom: [REDACTED]\nTo: jdoe@ironclad.local\nSubject: Data Package Ready\n\nThe extraction is scheduled for next quarter.\nUse the dead drop at \\\\file-srv-01\\shared\\reports\\.\nEncryption key rotates weekly — current: AES-256-GCM.\nDo NOT use your corporate email for this.\n\n--- END LOG ---',
                'C:\\Users\\jdoe\\Documents\\work_notes.txt': 'Meeting notes - Q3 Review\n- Server migration on track\n- Need to update firewall rules for new vendor portal\n- IT helpdesk password policy review scheduled',
                'work_notes.txt': 'Meeting notes - Q3 Review\n- Server migration on track\n- Need to update firewall rules for new vendor portal\n- IT helpdesk password policy review scheduled',
                'C:\\Users\\jdoe\\Downloads\\vpn_config.ovpn': '# OpenVPN Config - Ironclad Corp\nclient\ndev tun\nproto udp\nremote vpn.ironclad.local 1194\nresolv-retry infinite\nnobind\nca ca.crt\ncert jdoe.crt\nkey jdoe.key',
                'vpn_config.ovpn': '# OpenVPN Config - Ironclad Corp\nclient\ndev tun\nproto udp\nremote vpn.ironclad.local 1194\nresolv-retry infinite\nnobind\nca ca.crt\ncert jdoe.crt\nkey jdoe.key'
            };

            const content = fileMap[normalized] || fileMap[filePath];
            if (content) return content;

            return `The system cannot find the file specified: ${filePath}`;
        },

        // ── Windows: cd ──
        'cd': function(args, term, engine) {
            if (C2Config._context !== 'emp-laptop') {
                // Linux cd handled by engine, but provide fallback
                return null;
            }

            const target = args.join(' ').replace(/"/g, '').replace(/\//g, '\\');
            if (!target) {
                return term.cwd || 'C:\\Users\\jdoe';
            }

            const validDirs = [
                'C:\\', 'C:\\Users', 'C:\\Users\\jdoe',
                'C:\\Users\\jdoe\\Desktop', 'C:\\Users\\jdoe\\Documents',
                'C:\\Users\\jdoe\\Downloads', 'C:\\Users\\jdoe\\AppData',
                'C:\\Users\\jdoe\\AppData\\Local', 'C:\\Users\\jdoe\\AppData\\Local\\Temp',
                'C:\\Windows', 'C:\\Windows\\System32',
                'C:\\Users\\Public', 'C:\\Users\\Administrator',
                'Desktop', 'Documents', 'Downloads'
            ];

            // Handle relative paths
            let resolved = target;
            if (target === '..') {
                const parts = (term.cwd || 'C:\\Users\\jdoe').split('\\');
                parts.pop();
                resolved = parts.join('\\') || 'C:\\';
            } else if (!target.includes(':')) {
                resolved = (term.cwd || 'C:\\Users\\jdoe') + '\\' + target;
            }

            if (validDirs.includes(resolved) || validDirs.includes(target)) {
                if (term) term.cwd = resolved;
                return '';
            }

            return `The system cannot find the path specified: ${target}`;
        },

        // ── enum4linux ──
        'enum4linux': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: enum4linux [options] <target>';

            if (target === '10.10.1.10') {
                return `Starting enum4linux v0.9.1 on Thu Mar 19 14:30:00 2026

 ==============================
|    Target Information         |
 ==============================
Target ............ 10.10.1.10
RID Range ......... 500-550,1000-1050
Username .......... ''
Password .......... ''

 ==============================
|    Enumerating Domain Info    |
 ==============================
[+] Domain: IRONCLAD
[+] Domain SID: S-1-5-21-3842734982-1547283921-4029381756
[+] Server: DC-IRONCLAD-01

 ==============================
|    Users via RID cycling      |
 ==============================
[+] ironclad\\Administrator (RID: 500)
[+] ironclad\\jdoe (RID: 1103)
[+] ironclad\\it_helpdesk (RID: 1104)
[+] ironclad\\svc_backup (RID: 1105)
[+] ironclad\\m.chen (RID: 1106)

enum4linux complete.`;
            }

            return `enum4linux: Could not connect to ${target}`;
        },

        // ── proxychains ──
        'proxychains': function(args, term, engine) {
            if (args.length === 0) return 'Usage: proxychains <command> [args]';
            // Pass through to the actual command
            const cmd = args[0];
            const cmdArgs = args.slice(1);
            if (C2Config.commands[cmd]) {
                return '[proxychains] config file found: /etc/proxychains4.conf\n[proxychains] preloading /usr/lib/libproxychains4.so\n[proxychains] DLL init: proxychains-ng 4.16\n' +
                    C2Config.commands[cmd](cmdArgs, term, engine);
            }
            return '[proxychains] config file found: /etc/proxychains4.conf\n[proxychains] Command not found: ' + cmd;
        },

        // ── ping ──
        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '192.168.1.100') {
                return `PING 192.168.1.100 (192.168.1.100) 56(84) bytes of data.
64 bytes from 192.168.1.100: icmp_seq=1 ttl=64 time=28.1 ms
64 bytes from 192.168.1.100: icmp_seq=2 ttl=64 time=27.8 ms
64 bytes from 192.168.1.100: icmp_seq=3 ttl=64 time=28.4 ms

--- 192.168.1.100 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 27.8/28.1/28.4/0.245 ms`;
            }
            if (target.startsWith('10.10.1.')) {
                return `PING ${target} (${target}) 56(84) bytes of data.
64 bytes from ${target}: icmp_seq=1 ttl=128 time=3.2 ms
64 bytes from ${target}: icmp_seq=2 ttl=128 time=2.9 ms

--- ${target} ping statistics ---
2 packets transmitted, 2 received, 0% packet loss
rtt min/avg/max/mdev = 2.9/3.0/3.2/0.150 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        // ── whoami (context-aware) ──
        'whoami': function(args, term, engine) {
            if (C2Config._context === 'emp-laptop') {
                return 'ironclad\\jdoe';
            }
            return 'kali';
        },

        // ── hostname (context-aware) ──
        'hostname': function(args, term, engine) {
            if (C2Config._context === 'emp-laptop') {
                return 'EMP-LAPTOP-03';
            }
            return 'kali';
        },

        // ── ipconfig (Windows context) ──
        'ipconfig': function(args, term, engine) {
            if (C2Config._context !== 'emp-laptop') {
                return 'ipconfig: command not found (use ifconfig or ip addr on Linux)';
            }
            return `Windows IP Configuration

Ethernet adapter Ethernet0:

   Connection-specific DNS Suffix  . : ironclad.local
   IPv4 Address. . . . . . . . . . . : 10.10.1.15
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 10.10.1.1
   DNS Servers . . . . . . . . . . . : 10.10.1.10`;
        },

        // ── net user (Windows context) ──
        'net': function(args, term, engine) {
            if (C2Config._context !== 'emp-laptop') {
                return 'net: command not found (Windows command — connect to a Windows host first)';
            }

            const argsStr = args.join(' ').toLowerCase();

            if (argsStr.startsWith('user jdoe')) {
                return `User name                    jdoe
Full Name                    John Doe
Comment                      Alloys Division - Senior Engineer
User's comment
Country/region code          000 (System Default)
Account active               Yes
Account expires              Never

Password last set            01/15/2026 9:32:14 AM
Password expires             Never
Password changeable          01/15/2026 9:32:14 AM
Password required            Yes
User may change password     Yes

Workstations allowed         All
Logon script
User profile
Home directory
Last logon                   03/19/2026 2:14:22 PM

Logon hours allowed          All

Local Group Memberships      *Remote Management Use*Users
Global Group Memberships     *Domain Users         *Engineering
The command completed successfully.`;
            }

            if (argsStr === 'user') {
                return `User accounts for \\\\EMP-LAPTOP-03

-------------------------------------------------------------------------------
Administrator            DefaultAccount           Guest
jdoe                     WDAGUtilityAccount
The command completed successfully.`;
            }

            return 'The syntax of this command is:\nNET [ USER | LOCALGROUP | GROUP ]';
        },

        // ── exit (return to attacker context) ──
        'exit': function(args, term, engine) {
            if (C2Config._context === 'emp-laptop') {
                C2Config._context = 'attacker';
                if (term) {
                    term.user = 'kali';
                    term.hostname = 'kali';
                    term.cwd = '/home/kali';
                }
                return '[+] Disconnected from EMP-LAPTOP-03\n[+] Returned to attacker machine.';
            }
            return '';
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
        // Convert tables to text
        const tables = tmp.querySelectorAll('table');
        tables.forEach(table => {
            const rows = table.querySelectorAll('tr');
            let text = '';
            rows.forEach(row => {
                const cells = row.querySelectorAll('td, th');
                const cellTexts = Array.from(cells).map(c => c.textContent.trim().padEnd(20));
                text += cellTexts.join('  ') + '\n';
            });
            table.replaceWith(document.createTextNode(text));
        });
        return tmp.textContent.trim();
    }
};
