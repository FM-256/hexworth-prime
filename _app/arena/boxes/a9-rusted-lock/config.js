/* ============================================================
   CTF ARENA — Box A9: The Rusted Lock
   Insecure Deserialization | Forge Remnants
   Config: web app, deserialization engine, filesystem, flags, hints, lore
   ============================================================ */

const A9Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Rusted Lock',
    subtitle: 'Insecure Deserialization — Forge Remnants',

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
    accent: '#e67e22',
    storageKey: 'hexworth_ctf_a9',
    registryId: 'a9-rusted-lock',
    trackerKey: 'ctf_a9',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Discover the target\'s attack surface. Identify open ports, services, and the web application technology stack.',
            requiredFlags: [],
            mitre: ['T1046', 'T1595.002'],
            unlocks: ['app_analysis'],
            locked: false
        },
        {
            id: 'app_analysis',
            name: 'Application Analysis',
            icon: '\uD83D\uDCD6',
            description: 'Identify serialized data in session tokens. Fingerprint the PHP serialization format and locate deserialization endpoints.',
            requiredFlags: [],
            mitre: ['T1190', 'T1592.004'],
            unlocks: ['deser_exploit'],
            locked: true
        },
        {
            id: 'deser_exploit',
            name: 'Deserialization Exploit',
            icon: '\uD83E\uDDEC',
            description: 'Craft a malicious PHP serialized payload. Manipulate the session token to escalate role from member to admin.',
            requiredFlags: ['user'],
            mitre: ['T1059.004', 'T1134'],
            unlocks: ['rce_privesc'],
            locked: true
        },
        {
            id: 'rce_privesc',
            name: 'Remote Code Execution / Privesc',
            icon: '\uD83D\uDC80',
            description: 'Abuse the unauthenticated debug endpoint to inject a gadget chain RCE object. Execute commands as root and retrieve the root flag.',
            requiredFlags: ['root'],
            mitre: ['T1068', 'T1059', 'T1548'],
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
            { flagId: 'user', objective: '2.3', description: 'Given a scenario, analyze potential indicators associated with application attacks — Insecure deserialization', skill: 'PHP Serialization Format Analysis' },
            { flagId: 'user', objective: '2.4', description: 'Given a scenario, analyze indicators associated with authentication attacks — Session token manipulation', skill: 'Insecure Deserialization Discovery' },
            { flagId: 'user', objective: '3.2', description: 'Given a scenario, implement host or application security solutions — Input validation and secure deserialization', skill: 'Session Token Forgery via Serialization' },
            { flagId: 'root', objective: '2.4', description: 'Given a scenario, analyze indicators associated with application attacks — RCE via magic method gadget chain', skill: 'PHP Unserialize RCE Exploitation' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques — Principle of least privilege and debug endpoint hardening', skill: 'Privilege Escalation via Unauthenticated Debug Console' },
            { flagId: 'root', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Command execution via deserialization gadget chain', skill: 'Gadget Chain Identification' }
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
            { id: 'browser',  label: 'Firefox',     icon: '\uD83C\uDF10',       app: 'browser' },
            { id: 'notes',    label: 'Notes',        icon: '\uD83D\uDCDD',       app: 'notes' },
            { id: 'hints',    label: 'Hints',        icon: '\uD83D\uDCA1',       app: 'hints' },
            { id: 'flags',    label: 'Submit Flag',  icon: '\uD83D\uDEA9',       app: 'flags' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.10.14.28\n'
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
        hintPenalty: -50,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 900000, points: 100 }  // 15 minutes
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'After logging in, notice the session token displayed below the form. It is Base64-encoded. Try decoding it to see the serialized PHP object inside.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The serialized object contains a \'role\' field set to \'member\'. Change it to \'admin\' and update the string length: s:5:"admin" not s:6:"member". The length prefix must match the string length exactly.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'After modifying the serialized object, re-encode it to Base64 and paste the result into the Session Token field on the dashboard page. The server will deserialize it and grant you the corresponding role.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'The debug console accepts serialized PHP objects. Create an RCE object: O:3:"RCE":1:{s:3:"cmd";s:22:"cat /root/root.txt";} — the string length (s:22) must match the cmd string length exactly.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Forge Remnants guild maintains a legacy member portal built on PHP — a relic from an era before secure session management. Intelligence indicates the portal serializes user objects directly into Base64-encoded session tokens passed in plaintext. No signature. No integrity check. A debug console left open for "engineers." Your mission: exploit the insecure deserialization chain, escalate from guild member to root.',
        scenario: 'A decade-old PHP application written by a guild engineer who "didn\'t trust databases" stores session state entirely in client-side tokens. A junior apprentice discovered the Base64 string in their browser\'s developer tools, decoded it, and posted on an internal forum: "lol it\'s just a PHP object." The security team archived the ticket as low severity. The debug console has been "temporarily" exposed since a firmware migration in 2019.',
        outro: 'The Rusted Lock has been shattered. The Forge Remnants\' trusted session tokens were nothing but rust — a serialized object any apprentice could reshape. With the debug console wide open to arbitrary deserialization, their entire server yielded to you. The guild\'s master keys are yours.',
        ecer: {
            executive: 'CTO deferred security refactor of legacy PHP portal for three consecutive annual cycles, citing "no active exploits in production"',
            culture: 'No secure development lifecycle for legacy code; new features shipped on top of unreviewed PHP 5-era session handler without regression testing',
            employee: 'Developer trusted client-supplied Base64 tokens without signing or encrypting them; debug console deployed with root-level PHP-FPM context and no authentication gate',
            regulatory: 'No application security scanning in CI/CD pipeline; deserialization risk was never flagged in annual pen-test scope because the debug endpoint was undocumented'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — The Forge Portal
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.10.14.28/forge/',

        pages: {

            // ── PAGE 1: Member Login ──────────────────────────────
            '/forge/': {
                title: 'Forge Remnants — Member Portal',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:2px solid #e67e22;">
                        <div style="font-size:2rem; margin-bottom:6px;">&#9874;</div>
                        <h1 style="color:#e67e22; font-size:1.5rem; font-family:Georgia,serif; margin-bottom:4px; letter-spacing:0.05em;">Forge Remnants Guild</h1>
                        <div style="color:#888; font-size:0.78rem; letter-spacing:0.12em; text-transform:uppercase;">Member Authentication Portal — v3.0.1</div>
                    </div>

                    <div style="max-width:440px; margin:0 auto;">
                        <div style="background:#fdf6ec; border:1px solid #f0d0a0; border-radius:6px; padding:24px;">
                            <h3 style="color:#c0722a; font-size:0.9rem; margin:0 0 18px; text-transform:uppercase; letter-spacing:0.08em;">Member Login</h3>

                            <div style="margin-bottom:14px;">
                                <label style="display:block; color:#8a8a8a; font-size:0.78rem; margin-bottom:5px; font-weight:600;">Username</label>
                                <input type="text" data-field="username" value=""
                                       style="width:100%; box-sizing:border-box; padding:8px 12px; border:1px solid #ddd; border-radius:4px; font-family:monospace; font-size:0.85rem; background:#fff;">
                            </div>

                            <div style="margin-bottom:18px;">
                                <label style="display:block; color:#8a8a8a; font-size:0.78rem; margin-bottom:5px; font-weight:600;">Password</label>
                                <input type="password" data-field="password" value=""
                                       style="width:100%; box-sizing:border-box; padding:8px 12px; border:1px solid #ddd; border-radius:4px; font-family:monospace; font-size:0.85rem; background:#fff;">
                            </div>

                            <button data-action="login"
                                    style="width:100%; padding:10px; background:#e67e22; color:#fff; border:none; border-radius:4px; font-family:inherit; font-size:0.85rem; font-weight:700; cursor:pointer; letter-spacing:0.05em;">
                                AUTHENTICATE
                            </button>

                            <div data-results style="margin-top:16px;"></div>
                        </div>

                        <div style="margin-top:14px; color:#aaa; font-size:0.72rem; text-align:center;">
                            Authorized guild members only. Unauthorized access is logged and reported.
                        </div>
                    </div>
                `,
                formHandler: function(data, engine) {
                    return A9Config._handleLogin(data, engine);
                }
            },

            // ── PAGE 2: Dashboard (token-based session) ───────────
            '/forge/dashboard/': {
                title: 'Forge Remnants — Dashboard',
                html: `
                    <div style="text-align:center; margin-bottom:24px; padding-bottom:18px; border-bottom:2px solid #e67e22;">
                        <div style="font-size:1.8rem; margin-bottom:4px;">&#9874;</div>
                        <h1 style="color:#e67e22; font-size:1.4rem; font-family:Georgia,serif; margin-bottom:4px;">Forge Dashboard</h1>
                        <div style="color:#888; font-size:0.78rem; letter-spacing:0.1em; text-transform:uppercase;">Session-Based Access Panel</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto;">
                        <div style="background:#fdf6ec; border:1px solid #f0d0a0; border-radius:6px; padding:20px; margin-bottom:20px;">
                            <h3 style="color:#c0722a; font-size:0.82rem; text-transform:uppercase; letter-spacing:0.08em; margin:0 0 12px;">Load Session</h3>
                            <p style="color:#8a8a8a; font-size:0.78rem; margin:0 0 12px; line-height:1.5;">Paste your session token below. The server will deserialize the token to restore your session and display the corresponding dashboard.</p>

                            <textarea data-field="token" rows="3"
                                      placeholder="Paste Base64 session token here..."
                                      style="width:100%; box-sizing:border-box; padding:8px 12px; border:1px solid #ddd; border-radius:4px; font-family:monospace; font-size:0.75rem; background:#fff; resize:vertical;"></textarea>

                            <button data-action="load_session"
                                    style="margin-top:10px; padding:8px 20px; background:#e67e22; color:#fff; border:none; border-radius:4px; font-family:inherit; font-size:0.82rem; font-weight:700; cursor:pointer;">
                                LOAD SESSION
                            </button>

                            <div data-results style="margin-top:16px;"></div>
                        </div>

                        <div style="color:#aaa; font-size:0.72rem; text-align:center;">
                            Session tokens are PHP serialized objects encoded in Base64. &nbsp;|&nbsp; <a href="/forge/" style="color:#e67e22;">Back to Login</a>
                        </div>
                    </div>
                `,
                formHandler: function(data, engine) {
                    return A9Config._handleDashboard(data, engine);
                }
            },

            // ── PAGE 3: Debug Console (admin only) ────────────────
            '/forge/debug/': {
                title: 'Forge Remnants — Debug Console',
                html: `
                    <div style="text-align:center; margin-bottom:24px; padding-bottom:18px; border-bottom:2px solid #e67e22;">
                        <div style="font-size:1.8rem; margin-bottom:4px;"><img src="/assets/images/icons/icon-gear.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"></div>
                        <h1 style="color:#e67e22; font-size:1.4rem; font-family:Georgia,serif; margin-bottom:4px;">Debug Console</h1>
                        <div style="background:#c0392b; color:#fff; display:inline-block; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:700; letter-spacing:0.1em; margin-top:4px;">ADMIN ONLY</div>
                    </div>

                    <div style="max-width:640px; margin:0 auto;">
                        <div style="background:#1a1a1a; border:1px solid #333; border-radius:6px; padding:20px; margin-bottom:20px;">
                            <h3 style="color:#e67e22; font-size:0.82rem; text-transform:uppercase; letter-spacing:0.08em; margin:0 0 10px;">Serialization Tester</h3>
                            <p style="color:#888; font-size:0.75rem; margin:0 0 14px; line-height:1.5;">
                                Paste any serialized PHP object below for diagnostic testing. The object will be deserialized and its properties inspected. Used by forge engineers to verify object integrity.
                            </p>

                            <textarea data-field="obj" rows="4"
                                      placeholder='O:4:"User":3:{s:8:"username";s:5:"guest";s:4:"role";s:5:"guest";s:6:"active";b:0;}'
                                      style="width:100%; box-sizing:border-box; padding:10px 12px; border:1px solid #444; border-radius:4px; font-family:monospace; font-size:0.78rem; background:#0d0d0d; color:#00ff88; resize:vertical;"></textarea>

                            <button data-action="debug_exec"
                                    style="margin-top:12px; padding:8px 20px; background:#c0392b; color:#fff; border:none; border-radius:4px; font-family:inherit; font-size:0.82rem; font-weight:700; cursor:pointer;">
                                DESERIALIZE &amp; INSPECT
                            </button>

                            <div data-results style="margin-top:16px;"></div>
                        </div>

                        <div style="background:#fdf6ec; border:1px solid #f0d0a0; border-radius:4px; padding:12px; font-size:0.72rem; color:#888; line-height:1.6;">
                            <strong style="color:#c0722a;">Warning:</strong> This endpoint bypasses authentication for diagnostic purposes.
                            This console runs as <code style="background:#eee; padding:1px 4px; border-radius:2px;">root</code> and accepts any valid PHP serialized object.
                            Do not expose to untrusted networks.
                        </div>
                    </div>
                `,
                formHandler: function(data, engine) {
                    return A9Config._handleDebug(data, engine);
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // DESERIALIZATION ENGINE — Login Handler
    // Validates credentials; on success, returns Base64 session token
    // ═══════════════════════════════════════════════════════

    _handleLogin(data, engine) {
        const user = (data.username || '').trim();
        const pass = (data.password || '').trim();

        if (!user || !pass) {
            return A9Config._alertHtml('warning', 'Please enter both username and password.');
        }

        // Valid credential check
        if (user === 'apprentice' && pass === 'h4mm3r_t1m3') {
            const rawToken = 'Tzo0OiJVc2VyIjozOntzOjg6InVzZXJuYW1lIjtzOjEwOiJhcHByZW50aWNlIjtzOjQ6InJvbGUiO3M6NjoibWVtYmVyIjtzOjY6ImFjdGl2ZSI7YjoxO30=';
            const decoded  = 'O:4:"User":3:{s:8:"username";s:10:"apprentice";s:4:"role";s:6:"member";s:6:"active";b:1;}';
            return `
                <div style="background:#eafaf1; border:1px solid #a9dfbf; border-radius:5px; padding:16px;">
                    <div style="color:#1e8449; font-weight:700; font-size:0.9rem; margin-bottom:8px;">&#10003; Authentication Successful</div>
                    <div style="color:#808080; font-size:0.8rem; margin-bottom:14px;">Welcome, <strong>apprentice</strong> <span style="background:#d4efdf; color:#196f3d; padding:1px 7px; border-radius:10px; font-size:0.72rem; font-weight:700;">member</span></div>
                    <div style="color:#888; font-size:0.72rem; margin-bottom:6px; font-weight:600; text-transform:uppercase; letter-spacing:0.08em;">Your Session Token</div>
                    <div style="background:#1a1a1a; border:1px solid #333; border-radius:4px; padding:10px; font-family:monospace; font-size:0.72rem; color:#e67e22; word-break:break-all; margin-bottom:10px;">${rawToken}</div>
                    <div style="color:#888; font-size:0.72rem; margin-bottom:6px; font-weight:600; text-transform:uppercase; letter-spacing:0.08em;">Decoded (PHP Serialized Object)</div>
                    <div style="background:#f7f7f7; border:1px solid #e0e0e0; border-radius:4px; padding:10px; font-family:monospace; font-size:0.72rem; color:#333; word-break:break-all; margin-bottom:14px;">${A9Config._escHtml(decoded)}</div>
                    <div style="color:#8a8a8a; font-size:0.75rem;">Member access granted. Limited forge data available.</div>
                    <div style="margin-top:12px; font-size:0.75rem; color:#e67e22;">
                        <a href="/forge/dashboard/" style="color:#e67e22; font-weight:700;">&#8594; Go to Dashboard</a> — paste your token to load your session
                    </div>
                </div>
            `;
        }

        // Wrong password — hint about account existence
        if (user === 'apprentice') {
            return A9Config._alertHtml('error', 'Invalid credentials. Check your password.');
        }

        // Unknown user
        return A9Config._alertHtml('error', 'Authentication failed: user not found.');
    },

    // ═══════════════════════════════════════════════════════
    // DESERIALIZATION ENGINE — Dashboard Session Loader
    // Decodes Base64 token, parses PHP serialized role field,
    // renders member or admin panel based on role value
    // ═══════════════════════════════════════════════════════

    _handleDashboard(data, engine) {
        const token = (data.token || '').trim();

        if (!token) {
            return A9Config._alertHtml('warning', 'No session token provided. Log in first to receive your token.');
        }

        // Attempt Base64 decode
        let decoded;
        try {
            decoded = atob(token);
        } catch(e) {
            return A9Config._alertHtml('error', 'Deserialization failed: invalid Base64 encoding. Ensure the token is properly encoded.');
        }

        // Validate that it looks like a PHP serialized object
        if (!decoded.startsWith('O:')) {
            return A9Config._alertHtml('error', 'Deserialization failed: expected PHP object (must start with O:). Got unexpected data format.');
        }

        // ── Parse username ───────────────────────────────────
        const usernameMatch = decoded.match(/s:8:"username";s:(\d+):"([^"]+)"/);
        const username = usernameMatch ? usernameMatch[2] : 'unknown';

        // ── Parse role — key vulnerability point ────────────
        // Pattern: s:4:"role";s:LENGTH:"VALUE"
        const roleMatch = decoded.match(/s:4:"role";s:(\d+):"([^"]+)"/);
        if (!roleMatch) {
            return A9Config._alertHtml('error', 'Deserialization failed: malformed object — missing role property.');
        }

        const declaredLen = parseInt(roleMatch[1]);
        const roleValue   = roleMatch[2];

        // Length mismatch detection — teaches students about PHP serialization precision
        if (declaredLen !== roleValue.length) {
            return `
                <div style="background:#fdf2f8; border:1px solid #d98fcc; border-radius:5px; padding:14px;">
                    <div style="color:#7d3c98; font-weight:700; font-size:0.85rem; margin-bottom:6px;">PHP Warning: Deserialization Error</div>
                    <div style="font-family:monospace; font-size:0.78rem; color:#808080; background:#f5eef8; padding:8px; border-radius:3px;">
                        Warning: unserialize(): Error at offset ${decoded.indexOf(roleMatch[0])} of ${decoded.length} bytes<br>
                        Expected string of length ${declaredLen}, got ${roleValue.length} bytes for property 'role'
                    </div>
                    <div style="color:#888; font-size:0.72rem; margin-top:8px;">Hint: the length prefix (s:<em>N</em>) must match the exact byte length of the string that follows.</div>
                </div>
            `;
        }

        // ── Parse active flag ────────────────────────────────
        const activeMatch = decoded.match(/s:6:"active";b:(\d)/);
        const isActive = activeMatch ? activeMatch[1] === '1' : false;

        // ── Role-based rendering ─────────────────────────────
        const role = roleValue.toLowerCase();

        if (role === 'admin') {
            return A9Config._adminDashboardHtml(username);
        }

        if (role === 'forge_master') {
            return A9Config._forgeMasterDashboardHtml(username);
        }

        // Default: member dashboard (limited access)
        return A9Config._memberDashboardHtml(username, isActive);
    },

    // ── Member dashboard (limited access) ───────────────────
    _memberDashboardHtml(username, isActive) {
        return `
            <div style="background:#eafaf1; border:1px solid #a9dfbf; border-radius:5px; padding:14px; margin-bottom:16px;">
                <div style="color:#1e8449; font-weight:700; font-size:0.88rem; margin-bottom:4px;">&#10003; Session Restored</div>
                <div style="font-size:0.78rem; color:#808080;">
                    User: <strong>${A9Config._escHtml(username)}</strong> &nbsp;|&nbsp;
                    Role: <span style="background:#d4efdf; color:#196f3d; padding:1px 7px; border-radius:10px; font-size:0.7rem; font-weight:700;">member</span> &nbsp;|&nbsp;
                    Status: ${isActive ? '<span style="color:#1e8449;">Active</span>' : '<span style="color:#c0392b;">Inactive</span>'}
                </div>
            </div>

            <div style="background:#fdf6ec; border:1px solid #f0d0a0; border-radius:5px; padding:16px; margin-bottom:14px;">
                <h3 style="color:#c0722a; font-size:0.82rem; text-transform:uppercase; letter-spacing:0.08em; margin:0 0 12px;">Member Panel</h3>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px;">
                    <div style="background:#fff; border:1px solid #eee; border-radius:4px; padding:12px; text-align:center;">
                        <div style="font-size:1.4rem; margin-bottom:4px;">&#9874;</div>
                        <div style="color:#8a8a8a; font-size:0.72rem; font-weight:600;">Forge Hours</div>
                        <div style="color:#e67e22; font-size:1.1rem; font-weight:700;">24h</div>
                    </div>
                    <div style="background:#fff; border:1px solid #eee; border-radius:4px; padding:12px; text-align:center;">
                        <div style="font-size:1.4rem; margin-bottom:4px;">&#128296;</div>
                        <div style="color:#8a8a8a; font-size:0.72rem; font-weight:600;">Projects</div>
                        <div style="color:#e67e22; font-size:1.1rem; font-weight:700;">3</div>
                    </div>
                </div>

                <div style="color:#888; font-size:0.75rem; padding:10px; background:#f9f3eb; border-radius:3px; border-left:3px solid #e67e22;">
                    <strong>Access Level: Member.</strong> You can view your own projects and submit work orders.
                    Admin and debug features are restricted. Contact a guild master to request elevated access.
                </div>
            </div>

            <div style="color:#aaa; font-size:0.72rem; text-align:center;">
                <a href="/forge/" style="color:#e67e22;">Back to Login</a>
            </div>
        `;
    },

    // ── Admin dashboard (shows user flag) ───────────────────
    _adminDashboardHtml(username) {
        return `
            <div style="background:#fef9e7; border:1px solid #f9d35e; border-radius:5px; padding:14px; margin-bottom:16px;">
                <div style="color:#b7950b; font-weight:700; font-size:0.88rem; margin-bottom:4px;"><img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> ADMIN SESSION ACTIVE</div>
                <div style="font-size:0.78rem; color:#808080;">
                    User: <strong>${A9Config._escHtml(username)}</strong> &nbsp;|&nbsp;
                    Role: <span style="background:#fdebd0; color:#c0722a; padding:1px 7px; border-radius:10px; font-size:0.7rem; font-weight:700; border:1px solid #e59866;">admin</span> &nbsp;|&nbsp;
                    Access: <span style="color:#c0392b; font-weight:700;">ELEVATED</span>
                </div>
            </div>

            <div style="background:#fdf6ec; border:1px solid #f0d0a0; border-radius:5px; padding:16px; margin-bottom:14px;">
                <h3 style="color:#c0722a; font-size:0.82rem; text-transform:uppercase; letter-spacing:0.08em; margin:0 0 14px;">Guild Member Registry</h3>

                <table style="width:100%; border-collapse:collapse; font-size:0.78rem; margin-bottom:14px;">
                    <thead>
                        <tr style="background:#f5e0c0;">
                            <th style="padding:6px 10px; text-align:left; color:#c0722a; border-bottom:2px solid #e0c090;">ID</th>
                            <th style="padding:6px 10px; text-align:left; color:#c0722a; border-bottom:2px solid #e0c090;">Username</th>
                            <th style="padding:6px 10px; text-align:left; color:#c0722a; border-bottom:2px solid #e0c090;">Role</th>
                            <th style="padding:6px 10px; text-align:left; color:#c0722a; border-bottom:2px solid #e0c090;">Status</th>
                            <th style="padding:6px 10px; text-align:left; color:#c0722a; border-bottom:2px solid #e0c090;">Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom:1px solid #f0d0a0;"><td style="padding:5px 10px;">1</td><td style="padding:5px 10px; font-family:monospace;">forge_master</td><td style="padding:5px 10px;"><span style="background:#f9d35e; padding:1px 6px; border-radius:3px; font-size:0.7rem;">forge_master</span></td><td style="padding:5px 10px; color:#1e8449;">Active</td><td style="padding:5px 10px; font-family:monospace; color:#888;">master@forge-remnants.net</td></tr>
                        <tr style="border-bottom:1px solid #f0d0a0;"><td style="padding:5px 10px;">2</td><td style="padding:5px 10px; font-family:monospace;">journeyman</td><td style="padding:5px 10px;"><span style="background:#eee; padding:1px 6px; border-radius:3px; font-size:0.7rem;">admin</span></td><td style="padding:5px 10px; color:#1e8449;">Active</td><td style="padding:5px 10px; font-family:monospace; color:#888;">jman@forge-remnants.net</td></tr>
                        <tr style="border-bottom:1px solid #f0d0a0;"><td style="padding:5px 10px;">3</td><td style="padding:5px 10px; font-family:monospace;">apprentice</td><td style="padding:5px 10px;"><span style="background:#eee; padding:1px 6px; border-radius:3px; font-size:0.7rem;">member</span></td><td style="padding:5px 10px; color:#1e8449;">Active</td><td style="padding:5px 10px; font-family:monospace; color:#888;">apprentice@forge-remnants.net</td></tr>
                        <tr style="border-bottom:1px solid #f0d0a0;"><td style="padding:5px 10px;">4</td><td style="padding:5px 10px; font-family:monospace;">smelter_bot</td><td style="padding:5px 10px;"><span style="background:#eee; padding:1px 6px; border-radius:3px; font-size:0.7rem;">service</span></td><td style="padding:5px 10px; color:#e74c3c;">Inactive</td><td style="padding:5px 10px; font-family:monospace; color:#888;">bot@forge-remnants.net</td></tr>
                    </tbody>
                </table>
            </div>

            <div style="background:#fdf6ec; border:1px solid #f0d0a0; border-radius:5px; padding:16px; margin-bottom:14px;">
                <h3 style="color:#c0722a; font-size:0.82rem; text-transform:uppercase; letter-spacing:0.08em; margin:0 0 12px;">Forge Configurations</h3>

                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:12px;">
                    <div style="background:#fff; border:1px solid #eee; border-radius:4px; padding:10px; text-align:center;">
                        <div style="color:#8a8a8a; font-size:0.7rem; font-weight:600;">Furnace Temp</div>
                        <div style="color:#e67e22; font-size:1rem; font-weight:700;">1,450°C</div>
                    </div>
                    <div style="background:#fff; border:1px solid #eee; border-radius:4px; padding:10px; text-align:center;">
                        <div style="color:#8a8a8a; font-size:0.7rem; font-weight:600;">Active Molds</div>
                        <div style="color:#e67e22; font-size:1rem; font-weight:700;">17</div>
                    </div>
                    <div style="background:#fff; border:1px solid #eee; border-radius:4px; padding:10px; text-align:center;">
                        <div style="color:#8a8a8a; font-size:0.7rem; font-weight:600;">Queue Depth</div>
                        <div style="color:#e67e22; font-size:1rem; font-weight:700;">84</div>
                    </div>
                </div>
            </div>

            <div style="background:#1a1a1a; border:1px solid #c0392b; border-radius:5px; padding:14px; margin-bottom:14px;">
                <div style="color:#e74c3c; font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px;"><img src="/assets/images/icons/icon-padlock.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> Restricted — Admin Eyes Only</div>
                <div style="font-family:monospace; font-size:0.8rem; color:#00ff88; background:#0d0d0d; padding:10px; border-radius:3px;">
                    <div style="color:#888; margin-bottom:4px;"># /home/www-data/user.txt</div>
                    <div style="color:#2ecc71; font-weight:700;">{{FLAG:user}}</div>
                </div>
                <div style="color:#888; font-size:0.7rem; margin-top:8px;">
                    Debug Console: <a href="/forge/debug/" style="color:#e67e22; font-weight:700;">/forge/debug/</a> — admin diagnostic endpoint (runs as root)
                </div>
            </div>

            <div style="color:#aaa; font-size:0.72rem; text-align:center;">
                <a href="/forge/" style="color:#e67e22;">Back to Login</a>
            </div>
        `;
    },

    // ── Forge Master easter egg dashboard ────────────────────
    _forgeMasterDashboardHtml(username) {
        return `
            <div style="background:#1a0a00; border:2px solid #e67e22; border-radius:5px; padding:14px; margin-bottom:16px;">
                <div style="color:#e67e22; font-weight:700; font-size:0.88rem; margin-bottom:4px;">&#9830; FORGE MASTER — GRANDMASTER ACCESS</div>
                <div style="font-size:0.78rem; color:#aaa;">
                    User: <strong style="color:#e67e22;">${A9Config._escHtml(username)}</strong> &nbsp;|&nbsp;
                    Role: <span style="background:#7d2a00; color:#e67e22; padding:1px 7px; border-radius:10px; font-size:0.7rem; font-weight:700; border:1px solid #e67e22;">forge_master</span>
                </div>
            </div>

            <div style="background:#1a0a00; border:1px solid #7d2a00; border-radius:5px; padding:16px; margin-bottom:14px;">
                <h3 style="color:#e67e22; font-size:0.82rem; text-transform:uppercase; letter-spacing:0.08em; margin:0 0 12px;">Grandmaster Vault</h3>
                <div style="color:#888; font-size:0.78rem; padding:12px; background:#0d0d0d; border-radius:3px; font-family:monospace;">
                    <div style="color:#e67e22; margin-bottom:6px;">[FORGE MASTER CHRONICLES — RESTRICTED]</div>
                    <div style="color:#8a8a8a; margin-bottom:4px;"># The original founders of the Forge Remnants encoded all</div>
                    <div style="color:#8a8a8a; margin-bottom:4px;"># secrets in serialized session tokens. The irony is not lost</div>
                    <div style="color:#8a8a8a; margin-bottom:8px;"># on those who know how to read a PHP object.</div>
                    <div style="color:#e67e22;">Easter egg discovered. Well played, operator.</div>
                </div>
                <div style="margin-top:12px; color:#888; font-size:0.72rem;">
                    Hint: There is still a root flag to find. The <a href="/forge/debug/" style="color:#e67e22;">debug console</a> awaits.
                </div>
            </div>

            <div style="color:#8a8a8a; font-size:0.72rem; text-align:center;">
                <a href="/forge/" style="color:#e67e22;">Back to Login</a>
            </div>
        `;
    },

    // ═══════════════════════════════════════════════════════
    // DESERIALIZATION ENGINE — Debug Console Handler
    // Simulates PHP deserialization RCE via magic methods.
    // Accepts raw PHP serialized objects; detects RCE class
    // and simulates command execution as root.
    // ═══════════════════════════════════════════════════════

    _handleDebug(data, engine) {
        const obj = (data.obj || '').trim();

        if (!obj) {
            return A9Config._alertHtml('warning', 'No object provided. Paste a PHP serialized object in the textarea.');
        }

        // Must look like a PHP serialized structure
        if (!obj.startsWith('O:') && !obj.startsWith('a:') && !obj.startsWith('s:') && !obj.startsWith('i:')) {
            return A9Config._alertHtml('error', 'Deserialization failed: input does not appear to be a PHP serialized string.');
        }

        // ── Detect RCE gadget chain ───────────────────────────
        // Pattern: O:3:"RCE":1:{s:3:"cmd";s:N:"COMMAND";}
        if (/O:\d+:"RCE"/.test(obj)) {
            return A9Config._handleRCE(obj);
        }

        // ── Detect User class (for inspection) ───────────────
        if (/O:\d+:"User"/.test(obj)) {
            const roleMatch  = obj.match(/s:4:"role";s:(\d+):"([^"]+)"/);
            const userMatch  = obj.match(/s:8:"username";s:\d+:"([^"]+)"/);
            const activeMatch = obj.match(/s:6:"active";b:(\d)/);

            const role   = roleMatch  ? roleMatch[2]   : 'unknown';
            const uname  = userMatch  ? userMatch[1]   : 'unknown';
            const active = activeMatch ? activeMatch[1] : '0';

            // Length mismatch guard
            if (roleMatch && parseInt(roleMatch[1]) !== roleMatch[2].length) {
                return `
                    <div style="background:#1a1a1a; border:1px solid #c0392b; border-radius:5px; padding:14px;">
                        <div style="color:#e74c3c; font-weight:700; font-size:0.82rem; margin-bottom:8px;">PHP Warning: unserialize() Error</div>
                        <div style="font-family:monospace; font-size:0.75rem; color:#e74c3c; background:#0d0d0d; padding:8px; border-radius:3px;">
                            Error at offset: malformed 'role' property — declared length ${roleMatch[1]} does not match actual length ${roleMatch[2].length}
                        </div>
                    </div>
                `;
            }

            return `
                <div style="background:#1a1a1a; border:1px solid #e67e22; border-radius:5px; padding:14px;">
                    <div style="color:#e67e22; font-weight:700; font-size:0.82rem; margin-bottom:10px; text-transform:uppercase; letter-spacing:0.08em;">Object Deserialized: User</div>
                    <table style="width:100%; border-collapse:collapse; font-size:0.78rem;">
                        <thead>
                            <tr style="background:#2a1a00;">
                                <th style="padding:6px 10px; text-align:left; color:#e67e22; border-bottom:1px solid #333;">Property</th>
                                <th style="padding:6px 10px; text-align:left; color:#e67e22; border-bottom:1px solid #333;">Type</th>
                                <th style="padding:6px 10px; text-align:left; color:#e67e22; border-bottom:1px solid #333;">Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td style="padding:5px 10px; color:#aaa; border-bottom:1px solid #222; font-family:monospace;">username</td><td style="padding:5px 10px; color:#888; border-bottom:1px solid #222;">string</td><td style="padding:5px 10px; color:#00ff88; border-bottom:1px solid #222; font-family:monospace;">${A9Config._escHtml(uname)}</td></tr>
                            <tr><td style="padding:5px 10px; color:#aaa; border-bottom:1px solid #222; font-family:monospace;">role</td><td style="padding:5px 10px; color:#888; border-bottom:1px solid #222;">string</td><td style="padding:5px 10px; color:#00ff88; border-bottom:1px solid #222; font-family:monospace;">${A9Config._escHtml(role)}</td></tr>
                            <tr><td style="padding:5px 10px; color:#aaa; font-family:monospace;">active</td><td style="padding:5px 10px; color:#888;">bool</td><td style="padding:5px 10px; color:#00ff88; font-family:monospace;">${active === '1' ? 'true' : 'false'}</td></tr>
                        </tbody>
                    </table>
                </div>
            `;
        }

        // ── Catch unknown class names ─────────────────────────
        const classMatch = obj.match(/^O:\d+:"([^"]+)"/);
        if (classMatch && classMatch[1] !== 'RCE' && classMatch[1] !== 'User') {
            return `
                <div style="background:#1a1a1a; border:1px solid #e74c3c; border-radius:5px; padding:14px;">
                    <div style="color:#e74c3c; font-weight:700; font-size:0.82rem; margin-bottom:6px;">PHP Fatal Error</div>
                    <div style="font-family:monospace; font-size:0.75rem; color:#e74c3c; background:#0d0d0d; padding:8px; border-radius:3px;">
                        PHP Fatal error: Uncaught Error: Class &quot;${A9Config._escHtml(classMatch[1])}&quot; not found
                    </div>
                </div>
            `;
        }

        // Generic fallback — inspect as raw
        return `
            <div style="background:#1a1a1a; border:1px solid #555; border-radius:5px; padding:14px;">
                <div style="color:#aaa; font-weight:700; font-size:0.82rem; margin-bottom:8px;">Raw Deserialization Result</div>
                <div style="font-family:monospace; font-size:0.75rem; color:#00ff88; background:#0d0d0d; padding:8px; border-radius:3px; word-break:break-all;">${A9Config._escHtml(obj)}</div>
            </div>
        `;
    },

    // ── RCE simulation — PHP unserialize magic method exploit ─
    // Simulates __wakeup() / __destruct() RCE gadget chain
    _handleRCE(obj) {
        // Extract the cmd property value — pattern: s:3:"cmd";s:N:"COMMAND"
        const cmdMatch = obj.match(/s:3:"cmd";s:(\d+):"(.*?)"\s*;?\s*\}/s);
        if (!cmdMatch) {
            return `
                <div style="background:#1a1a1a; border:1px solid #c0392b; border-radius:5px; padding:14px;">
                    <div style="color:#e74c3c; font-weight:700; font-size:0.82rem; margin-bottom:6px;">RCE Gadget — Malformed Object</div>
                    <div style="font-family:monospace; font-size:0.75rem; color:#e74c3c; background:#0d0d0d; padding:8px; border-radius:3px;">
                        Warning: RCE::__wakeup() — could not extract cmd property. Check serialization format.
                    </div>
                </div>
            `;
        }

        const declaredLen = parseInt(cmdMatch[1]);
        const cmdValue    = cmdMatch[2];

        // Length mismatch — common student mistake
        if (declaredLen !== cmdValue.length) {
            return `
                <div style="background:#1a1a1a; border:1px solid #c0392b; border-radius:5px; padding:14px;">
                    <div style="color:#e74c3c; font-weight:700; font-size:0.82rem; margin-bottom:6px;">PHP Warning: Deserialization Length Mismatch</div>
                    <div style="font-family:monospace; font-size:0.75rem; color:#e74c3c; background:#0d0d0d; padding:8px; border-radius:3px;">
                        unserialize(): Error at cmd property — declared length ${declaredLen}, actual length ${cmdValue.length}.<br>
                        Remember: s:N:"VALUE" — N must equal the exact byte count of VALUE.
                    </div>
                </div>
            `;
        }

        // Execute the simulated command
        const output = A9Config._simulateCommand(cmdValue);

        return `
            <div style="background:#1a1a1a; border:1px solid #2ecc71; border-radius:5px; padding:14px;">
                <div style="color:#2ecc71; font-weight:700; font-size:0.82rem; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.08em;"><img src="/assets/images/icons/icon-lightning.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> RCE — Command Executed via __wakeup()</div>
                <div style="color:#888; font-size:0.7rem; margin-bottom:10px;">Class: RCE &nbsp;|&nbsp; Context: root &nbsp;|&nbsp; Magic method: __wakeup()</div>
                <div style="background:#0d0d0d; border-radius:3px; padding:10px; margin-bottom:10px;">
                    <div style="color:#e67e22; font-size:0.72rem; font-family:monospace; margin-bottom:4px;">root@forge-portal:~# ${A9Config._escHtml(cmdValue)}</div>
                    <div style="color:#00ff88; font-family:monospace; font-size:0.8rem; white-space:pre;">${A9Config._escHtml(output)}</div>
                </div>
                ${cmdValue.includes('root.txt') ? '<div style="background:#0d2a0d; border:1px solid #2ecc71; border-radius:3px; padding:8px; color:#2ecc71; font-size:0.75rem; font-weight:700;">Root flag captured!</div>' : ''}
            </div>
        `;
    },

    // ── Simulated command execution responses ────────────────
    _simulateCommand(cmd) {
        const c = cmd.trim().toLowerCase();

        if (c === 'whoami' || c === 'id' && false) return 'root';
        if (c === 'id') return 'uid=0(root) gid=0(root) groups=0(root)';
        if (c === 'whoami') return 'root';
        if (c === 'hostname') return 'forge-portal';
        if (c === 'uname -a') return 'Linux forge-portal 5.15.0-forge-amd64 #1 SMP Debian 5.15.79 x86_64 GNU/Linux';
        if (c === 'pwd') return '/root';
        if (c === 'ls' || c === 'ls /root' || c === 'ls /root/') return 'root.txt  .bashrc  .bash_history  .ssh/';
        if (c.includes('cat /root/root.txt') || c.includes('cat root.txt')) {
            return '{{FLAG:root}}';
        }
        if (c.includes('cat /etc/passwd')) {
            return 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nforge_app:x:1001:1001:Forge Portal:/home/forge_app:/bin/bash\nmysql:x:27:27:MySQL Server:/var/lib/mysql:/bin/false';
        }
        if (c.includes('cat /etc/shadow')) {
            return 'Permission denied';
        }
        if (c === 'ps aux' || c === 'ps') {
            return 'USER       PID %CPU %MEM    VSZ   RSS COMMAND\nroot         1  0.0  0.1  12345  1234 /sbin/init\nwww-data   101  0.0  0.5  98765  4321 php-fpm\nroot       200  0.0  0.2  45678  2345 sshd\nmysql      301  0.1  2.4 512000 32000 mysqld';
        }
        if (c === 'env' || c === 'printenv') {
            return 'SHELL=/bin/bash\nHOME=/root\nUSER=root\nPATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nPHP_VERSION=8.1.12\nDEBUG_MODE=1\nSECRET_KEY=f0rg3-s3cr3t-k3y-d3v-0nly';
        }
        if (c === 'ls /home') return 'forge_app';
        if (c === 'ls /') return 'bin  boot  dev  etc  home  lib  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var';
        if (c === 'ls /var/www' || c === 'ls /var/www/html') return 'forge  index.html';
        if (c === 'ls /var/www/html/forge' || c === 'ls /var/www/forge') {
            return 'config.php  dashboard  debug  index.php  login.php  session_handler.php  static/';
        }
        if (c.includes('cat') && c.includes('config.php')) {
            return "<?php\n$db_host = 'localhost';\n$db_user = 'forge_app';\n$db_pass = 'h4mm3rF0rg3_db!';\n$db_name = 'forge_remnants';\n$session_secret = 'f0rg3-s3r14l1z3-k3y';\n// TODO: Fix insecure deserialization before prod deploy!\n?>";
        }
        if (c.includes('cat') && c.includes('session_handler.php')) {
            return "<?php\nfunction loadSession($token) {\n    $data = base64_decode($token);\n    // VULNERABLE: unserialize called on untrusted user input\n    $obj = unserialize($data);\n    return $obj;\n}\n?>";
        }
        if (c === 'ip a' || c === 'ifconfig') {
            return 'lo: 127.0.0.1/8\neth0: 10.10.14.28/24';
        }
        if (c.includes('find') && c.includes('suid')) {
            return '/usr/bin/sudo\n/usr/bin/passwd\n/usr/bin/su\n/bin/mount\n/bin/umount';
        }
        if (c === 'crontab -l') {
            return '# m h  dom mon dow   command\n*/5 * * * * /usr/local/bin/forge-backup.sh > /dev/null 2>&1\n0 3 * * 0 /usr/local/bin/purge-logs.sh';
        }

        // Generic fallback for unrecognized commands
        if (c.startsWith('ls ')) {
            return 'ls: cannot access \'' + cmd.replace(/^ls\s+/, '') + '\': No such file or directory';
        }
        if (c.startsWith('cat ')) {
            return 'cat: ' + cmd.replace(/^cat\s+/, '') + ': No such file or directory';
        }

        // Handle multi-word commands that weren't caught above
        const firstWord = cmd.trim().split(/\s+/)[0];
        return `bash: ${A9Config._escHtml(firstWord)}: command not found`;
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (attacker machine — Kali)
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
                                    content: '=== MISSION BRIEFING ===\nTarget: 10.10.14.28 (The Rusted Lock)\nObjective: Insecure Deserialization exploitation\n\nRecon steps:\n1. nmap scan to identify open services\n2. Browse the web application at http://10.10.14.28/forge/\n3. Log in with any valid credentials and inspect the session token\n4. Decode the Base64 token to reveal the PHP serialized object\n5. Modify the object to escalate privileges (member -> admin)\n6. Re-encode and submit the modified token to the dashboard\n7. Find the admin debug console for RCE\n8. Use the debug console to execute commands and read /root/root.txt\n\nKey file: /home/kali/tools/serialize.py\nGood luck, operator.'
                                },
                                'tools': {
                                    type: 'dir',
                                    children: {
                                        'serialize.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nPHP Serialization Helper\nUsage: python3 serialize.py\n"""\nimport base64\n\ndef build_user(username, role, active=True):\n    """Build a PHP serialized User object"""\n    u_len = len(username)\n    r_len = len(role)\n    active_val = 1 if active else 0\n    serialized = (\n        f\'O:4:"User":3:{{"\'\n        f\'s:8:"username";s:{u_len}:"{username}";"\'\n        f\'s:4:"role";s:{r_len}:"{role}";"\'\n        f\'s:6:"active";b:{active_val};}}\'\n    )\n    return serialized\n\ndef build_rce(cmd):\n    """Build a PHP RCE gadget chain object"""\n    c_len = len(cmd)\n    return f\'O:3:"RCE":1:{{s:3:"cmd";s:{c_len}:"{cmd}";}}\'\n\nif __name__ == "__main__":\n    # Example: escalate role\n    obj = build_user("apprentice", "admin")\n    token = base64.b64encode(obj.encode()).decode()\n    print("[*] Admin token:")\n    print(token)\n    print()\n\n    # Example: RCE\n    rce = build_rce("whoami")\n    print("[*] RCE object (raw):")\n    print(rce)\n'
                                        },
                                        'b64.sh': {
                                            type: 'file',
                                            content: '#!/bin/bash\n# Base64 encode/decode helper\n# Usage: ./b64.sh encode "string"\n#        ./b64.sh decode "base64string"\n\nif [ "$1" = "encode" ]; then\n    echo -n "$2" | base64\nelif [ "$1" = "decode" ]; then\n    echo "$2" | base64 -d\nelse\n    echo "Usage: $0 encode|decode <string>"\nfi'
                                        }
                                    }
                                },
                                'payloads': {
                                    type: 'dir',
                                    children: {
                                        'php_rce.txt': {
                                            type: 'file',
                                            content: '=== PHP Deserialization RCE Payloads ===\n\n# User object — member role (original)\nO:4:"User":3:{s:8:"username";s:10:"apprentice";s:4:"role";s:6:"member";s:6:"active";b:1;}\n\n# User object — admin role escalation\nO:4:"User":3:{s:8:"username";s:10:"apprentice";s:4:"role";s:5:"admin";s:6:"active";b:1;}\n\n# User object — easter egg\nO:4:"User":3:{s:8:"username";s:10:"apprentice";s:4:"role";s:12:"forge_master";s:6:"active";b:1;}\n\n# RCE gadget — whoami\nO:3:"RCE":1:{s:3:"cmd";s:6:"whoami";}\n\n# RCE gadget — id\nO:3:"RCE":1:{s:3:"cmd";s:2:"id";}\n\n# RCE gadget — read root flag\nO:3:"RCE":1:{s:3:"cmd";s:22:"cat /root/root.txt";}\n\n# RCE gadget — read config\nO:3:"RCE":1:{s:3:"cmd";s:32:"cat /var/www/html/forge/config.php";}\n\n=== Base64 encoded tokens ===\n# admin role:\nTzo0OiJVc2VyIjozOntzOjg6InVzZXJuYW1lIjtzOjEwOiJhcHByZW50aWNlIjtzOjQ6InJvbGUiO3M6NToiYWRtaW4iO3M6NjoiYWN0aXZlIjtiOjE7fQ==\n\n# original member token:\nTzo0OiJVc2VyIjozOntzOjg6InVzZXJuYW1lIjtzOjEwOiJhcHByZW50aWNlIjtzOjQ6InJvbGUiO3M6NjoibWVtYmVyIjtzOjY6ImFjdGl2ZSI7YjoxO30='
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap 10.10.14.28\ncurl http://10.10.14.28/forge/\nfirefox http://10.10.14.28/forge/\npython3 tools/serialize.py\necho -n "test" | base64\nbase64 -d <<< "Tzo0OiJVc2VyIg=="'
                                },
                                'decoys': {
                                    type: 'dir',
                                    children: {
                                        'java_serial.bin': {
                                            type: 'file',
                                            content: '[BINARY] Java serialized object — 0xACED 0x0005 magic bytes detected\nClass: com.forge.legacy.SessionManager\nFields: userId (int), sessionId (String), expiresAt (long)\n\nNOTE: This is a Java serialization artifact from a legacy migration.\nThe current portal runs PHP — this binary is a red herring from an\nabandoned Java servlet container (Tomcat 7) decommissioned in 2021.\nydnwqZ3K+fake+java+serial+data/notrelevant==\n\nIf you are seeing this file, you are likely over-thinking the recon.\nFocus on the PHP application at http://10.10.14.28/forge/'
                                        },
                                        'forge_config_backup.xml': {
                                            type: 'file',
                                            content: '<?xml version="1.0" encoding="UTF-8"?>\n<!-- Forge Remnants Legacy Config Backup — DO NOT USE IN PRODUCTION -->\n<forge-config version="1.4.2">\n    <database>\n        <!-- OLD CREDENTIALS — ROTATED 2022-03-14 -->\n        <host>192.168.1.100</host>\n        <port>3307</port>\n        <name>forge_legacy</name>\n        <user>forge_ro</user>\n        <pass>F0rg3_L3g4cy_R0_2019!</pass>\n    </database>\n    <session>\n        <!-- Java HMAC config — NOT used by PHP portal -->\n        <engine>javax.xml.bind.DatatypeConverter</engine>\n        <algo>HS256</algo>\n        <secret>THIS_KEY_IS_EXPIRED_AND_UNUSED</secret>\n    </session>\n    <debug>\n        <!-- Port 9090 debug interface — firewall rule blocks external access -->\n        <enabled>true</enabled>\n        <bindAddress>127.0.0.1</bindAddress>\n        <port>9090</port>\n    </debug>\n</forge-config>\n<!-- This XML config is NOT the PHP config. The PHP session handler does\n     NOT use HMAC signing. It uses raw unserialize(base64_decode($token)). -->'
                                        },
                                        'error_log_2024-11.txt': {
                                            type: 'file',
                                            content: '[2024-11-03 02:14:55] ERROR: forge_backup.sh — rsync: connection refused to 192.168.1.100:22\n[2024-11-03 02:14:55] ERROR: Backup target unreachable. Skipping.\n[2024-11-10 14:32:11] WARNING: PHP session token decode failed for user agent: sqlmap/1.7.8\n[2024-11-10 14:32:11] INFO: Request blocked by WAF rule SER-001 (serialized payload detected)\n[2024-11-10 14:32:14] WARNING: Repeated invalid session tokens from 172.16.0.45 — possible token replay\n[2024-11-17 09:45:02] ERROR: MySQL connection timeout — retry in 30s\n[2024-11-17 09:45:33] INFO: MySQL reconnected\n[2024-11-28 23:59:59] INFO: cron — purge-logs.sh completed (14 MB freed)\n\nNOTE: WAF was DISABLED on 2024-12-01 ("causes false positives with legitimate admin serialization").\nSee ticket FRG-4412 for justification. This means the session endpoint\nat /forge/dashboard/ is currently unprotected by WAF rule SER-001.'
                                        },
                                        'README.decoys': {
                                            type: 'file',
                                            content: '=== OPERATOR NOTES (INTERNAL — DO NOT LEAVE ON TARGET) ===\nThese files are intentional red herrings placed by the box author.\n\njava_serial.bin     — Java object, irrelevant to PHP exploit path\nforge_config_backup.xml — Old credentials (rotated), Java HMAC (not used by PHP)\nerror_log_2024-11.txt  — WAF disabled note is REAL lore; Java references are noise\n\nThe actual attack path:\n  1. Login → get Base64 token\n  2. Decode → PHP serialized User object\n  3. Modify role field: s:6:"member" → s:5:"admin"\n  4. Re-encode → load on /forge/dashboard/ → user flag\n  5. Navigate to /forge/debug/ → inject RCE gadget → root flag\n\nDo not be distracted by port 9090 (firewalled), Java artifacts, or the\nold XML config. The PHP unserialize() path is the only live vector.'
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
            if (args.length === 0) return 'Usage: nmap [Scan Type(s)] [Options] {target specification}\nExample: nmap -sV 10.10.14.28';
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target || target === '10.10.14.28') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.10.14.28
Host is up (0.028s latency).
Not shown: 997 closed tcp ports

PORT     STATE    SERVICE    VERSION
22/tcp   filtered ssh
80/tcp   open     http       Apache httpd 2.4.57 ((Debian))
9090/tcp filtered debug-http

Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 10.71 seconds`;
            }
            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00011s latency).
All 1000 scanned ports on localhost are closed.
Nmap done: 1 IP address (1 host up) scanned in 0.07 seconds`;
            }
            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.02 seconds`;
        },

        'curl': function(args, term, engine) {
            const url = args.find(a => !a.startsWith('-') && (a.startsWith('http') || a.includes('10.10.14.28'))) || '';
            const isPost   = args.includes('-X') && args[args.indexOf('-X') + 1] === 'POST' || args.includes('-d') || args.includes('--data');
            const dataIdx  = args.indexOf('-d') !== -1 ? args.indexOf('-d') : args.indexOf('--data');
            const postData = dataIdx !== -1 ? args[dataIdx + 1] || '' : '';

            if (!url) return 'curl: try \'curl --help\' for more information';

            if (!url.includes('10.10.14.28')) {
                return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0]}: Connection refused`;
            }

            // Forge login page
            if (url.includes('/forge/') && !url.includes('/dashboard') && !url.includes('/debug')) {
                if (isPost && postData) {
                    // Simulate login attempt
                    const userMatch = postData.match(/username=([^&]+)/);
                    const passMatch = postData.match(/password=([^&]+)/);
                    const u = userMatch ? decodeURIComponent(userMatch[1]) : '';
                    const p = passMatch ? decodeURIComponent(passMatch[1]) : '';
                    if (u === 'apprentice' && p === 'h4mm3r_t1m3') {
                        return `HTTP/1.1 200 OK\nContent-Type: text/html\nSet-Cookie: PHPSESSID=abc123xyz; path=/\n\n<!DOCTYPE html>\n<html><body>\n<p>Welcome, apprentice (member)</p>\n<p>Session Token: Tzo0OiJVc2VyIjozOntzOjg6InVzZXJuYW1lIjtzOjEwOiJhcHByZW50aWNlIjtzOjQ6InJvbGUiO3M6NjoibWVtYmVyIjtzOjY6ImFjdGl2ZSI7YjoxO30=</p>\n</body></html>`;
                    }
                    return `HTTP/1.1 401 Unauthorized\n\nInvalid credentials.`;
                }
                return `<!DOCTYPE html>\n<html>\n<head><title>Forge Remnants — Member Portal</title></head>\n<body>\n<h1>Forge Remnants Guild</h1>\n<p>Member Authentication Portal v3.0.1</p>\n<form method="POST" action="/forge/">\n  <input name="username" placeholder="Username">\n  <input name="password" type="password" placeholder="Password">\n  <button type="submit">Authenticate</button>\n</form>\n</body>\n</html>`;
            }

            // Dashboard
            if (url.includes('/forge/dashboard')) {
                if (isPost && postData) {
                    const tokenMatch = postData.match(/token=([^&]+)/);
                    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : '';
                    if (token) {
                        try {
                            const decoded = atob(token);
                            const roleM   = decoded.match(/s:4:"role";s:\d+:"([^"]+)"/);
                            const role    = roleM ? roleM[1] : 'unknown';
                            if (role === 'admin') {
                                return `HTTP/1.1 200 OK\n\nAdmin dashboard loaded.\nUser flag: {{FLAG:user}}\nDebug console: /forge/debug/`;
                            }
                            return `HTTP/1.1 200 OK\n\nMember dashboard loaded. Role: ${role}. Access limited.`;
                        } catch(e) {
                            return `HTTP/1.1 400 Bad Request\n\nDeserialization failed: invalid Base64.`;
                        }
                    }
                }
                return `HTTP/1.1 200 OK\n\nForge Dashboard — paste your session token to load.`;
            }

            // Debug console
            if (url.includes('/forge/debug')) {
                if (isPost && postData) {
                    const objMatch = postData.match(/obj=([^&]+)/);
                    const rawObj   = objMatch ? decodeURIComponent(objMatch[1]) : '';
                    if (/O:\d+:"RCE"/.test(rawObj)) {
                        const cmdM  = rawObj.match(/s:3:"cmd";s:\d+:"([^"]+)"/);
                        const cmd   = cmdM ? cmdM[1] : '';
                        const out   = cmd ? A9Config._simulateCommand(cmd) : 'no command';
                        return `HTTP/1.1 200 OK\n\nRCE via __wakeup()\n$ ${cmd}\n${out}`;
                    }
                    return `HTTP/1.1 200 OK\n\nObject deserialized. No RCE class detected.`;
                }
                return `HTTP/1.1 200 OK\n\nForge Debug Console — submit a serialized PHP object.`;
            }

            return `HTTP/1.1 404 Not Found\n\nPage not found on 10.10.14.28.`;
        },

        'base64': function(args, term, engine) {
            // Supports: base64 -d (decode), base64 (encode with piped/heredoc-like input from arg)
            const isDecodeFlag = args.includes('-d') || args.includes('--decode');
            const input = args.find(a => !a.startsWith('-')) || '';

            if (!input) {
                return 'Usage: base64 [-d] <string>\nExamples:\n  base64 -d "Tzo0OiJVc2VyIg=="   (decode)\n  base64 "hello"                    (encode)';
            }

            if (isDecodeFlag) {
                try {
                    return atob(input);
                } catch(e) {
                    return 'base64: invalid input — ensure the string is valid Base64 (no extra spaces/newlines)';
                }
            } else {
                // Encode
                try {
                    return btoa(input);
                } catch(e) {
                    return 'base64: encoding failed — check input for special characters';
                }
            }
        },

        'python3': function(args, term, engine) {
            const script = args.find(a => a.endsWith('.py')) || '';
            const inline  = args.indexOf('-c') !== -1 ? args[args.indexOf('-c') + 1] || '' : '';

            if (script === 'tools/serialize.py' || script === '/home/kali/tools/serialize.py') {
                return `[*] Admin token:
Tzo0OiJVc2VyIjozOntzOjg6InVzZXJuYW1lIjtzOjEwOiJhcHByZW50aWNlIjtzOjQ6InJvbGUiO3M6NToiYWRtaW4iO3M6NjoiYWN0aXZlIjtiOjE7fQ==

[*] RCE object (raw):
O:3:"RCE":1:{s:3:"cmd";s:6:"whoami";}`;
            }

            if (inline) {
                // Detect base64 operations in inline code
                if (/base64/i.test(inline) && /b64decode/i.test(inline)) {
                    if (inline.includes('Tzo0OiJVc2VyIjozOntzOjg6InVzZXJuYW1lIjtzOjEwOiJhcHByZW50aWNlIjtzOjQ6InJvbGUiO3M6NToiYWRtaW4iO3M6NjoiYWN0aXZlIjtiOjE7fQ==')) {
                        return 'O:4:"User":3:{s:8:"username";s:10:"apprentice";s:4:"role";s:5:"admin";s:6:"active";b:1;}';
                    }
                    return 'O:4:"User":3:{s:8:"username";s:10:"apprentice";s:4:"role";s:6:"member";s:6:"active";b:1;}';
                }
                if (/base64/i.test(inline) && /b64encode/i.test(inline)) {
                    // Simulate encode of the admin object
                    if (inline.includes('admin')) {
                        return "b'Tzo0OiJVc2VyIjozOntzOjg6InVzZXJuYW1lIjtzOjEwOiJhcHByZW50aWNlIjtzOjQ6InJvbGUiO3M6NToiYWRtaW4iO3M6NjoiYWN0aXZlIjtiOjE7fQ=='";
                    }
                }
                return `>>> ${inline.trim()}\n(Python3 inline execution — use serialize.py for PHP object helpers)`;
            }

            if (!script && !inline) {
                return `Python 3.11.6 (default, Oct  8 2023, 05:06:43) [GCC 13.2.0] on linux\nType "help", "copyright", "credits" or "license" for more information.\n>>> `;
            }

            return `python3: can't open file '${script || ''}'${script ? '' : ': no script specified'}`;
        },

        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.10.14.28') {
                return `PING 10.10.14.28 (10.10.14.28) 56(84) bytes of data.
64 bytes from 10.10.14.28: icmp_seq=1 ttl=64 time=28.4 ms
64 bytes from 10.10.14.28: icmp_seq=2 ttl=64 time=27.9 ms
64 bytes from 10.10.14.28: icmp_seq=3 ttl=64 time=28.1 ms

--- 10.10.14.28 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 27.9/28.1/28.4/0.208 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target> [options]\nExample: nikto -h 10.10.14.28';
            return `- Nikto v2.5.0
+ Target IP:       10.10.14.28
+ Target Hostname:  forge-remnants.ctf.local
+ Target Port:      80
+ Server: Apache/2.4.57 (Debian)
+ PHP/8.1.12 appears to be installed
+ /forge/: PHP application detected — login portal
+ /forge/dashboard/: Session token parameter present — potential deserialization
+ Cookie PHPSESSID set without HttpOnly flag
+ /forge/debug/: Sensitive endpoint detected — accepts POST data
+ Header: X-Powered-By: PHP/8.1.12 — version disclosure
+ OSVDB-40478: /forge/session_handler.php: PHP session handler exposed
+ PHP deserialization vulnerability suspected on session token input
+ 8 items checked: 7 findings`;
        },

        'gobuster': function(args) {
            if (args.length === 0) return 'Usage: gobuster dir -u <url> -w <wordlist>\nExample: gobuster dir -u http://10.10.14.28/ -w /usr/share/wordlists/dirb/common.txt';
            const target = args.find(a => a.startsWith('http')) || 'http://10.10.14.28/';
            return `Gobuster v3.6
[+] Url:            ${target}
[+] Wordlist:       /usr/share/wordlists/dirb/common.txt
[+] Status codes:   200,204,301,302,307,401,403
===============================================================
/forge/               (Status: 200) [Size: 2841]
/forge/dashboard/     (Status: 200) [Size: 3210]
/forge/debug/         (Status: 200) [Size: 2600]
/forge/static/        (Status: 301) [Size: 320]
/server-status        (Status: 403) [Size: 276]
===============================================================
Finished`;
        },

        'dirb': function(args) {
            if (args.length === 0) return 'Usage: dirb <url_base> [<wordlist_file>]\nExample: dirb http://10.10.14.28/';
            const target = args[0] || 'http://10.10.14.28/';
            return `---- Scanning URL: ${target} ----
+ ${target}forge/ (CODE:200|SIZE:2841)
+ ${target}forge/dashboard/ (CODE:200|SIZE:3210)
+ ${target}forge/debug/ (CODE:200|SIZE:2600)

---- Results ----
3 results found.`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    // Render a styled alert/notification box
    _alertHtml(type, message) {
        const styles = {
            error:   { bg: 'rgba(231,76,60,0.08)',    border: 'rgba(231,76,60,0.2)',    color: '#c0392b', icon: '&#10007;', label: 'Error' },
            warning: { bg: 'rgba(230,126,34,0.08)',   border: 'rgba(230,126,34,0.3)',   color: '#e67e22', icon: '<img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">',  label: 'Warning' },
            success: { bg: 'rgba(46,204,113,0.08)',   border: 'rgba(46,204,113,0.2)',   color: '#1e8449', icon: '&#10003;', label: 'Success' },
            info:    { bg: 'rgba(52,152,219,0.08)',   border: 'rgba(52,152,219,0.2)',   color: '#2980b9', icon: '<img src="/assets/images/icons/icon-document.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">',  label: 'Info' }
        };
        const s = styles[type] || styles.info;
        return `<div style="background:${s.bg}; border:1px solid ${s.border}; border-radius:4px; padding:10px 14px; font-size:0.8rem; color:${s.color};">
            <strong>${s.icon} ${s.label}:</strong> ${A9Config._escHtml(message)}
        </div>`;
    },

    // Render a generic data table with orange-accent theming
    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#c0722a; border-bottom:2px solid #e0c090; background:#f5e0c0;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #f0d8b0;">${cell}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    },

    // Safe HTML entity encoding — prevents XSS in rendered content
    _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
    },

    // Strip HTML tags and convert tables to readable plain text
    // Used by curl command to render browser output in terminal
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
        return tmp.textContent.trim();
    }

};
