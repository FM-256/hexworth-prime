/* ============================================================
   CTF ARENA — Box A1: The Ancient Ledger
   SQL Injection | Crimson Dawn Confederacy
   Config: database, web app, filesystem, flags, hints, lore
   ============================================================ */

const A1Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Ancient Ledger',
    subtitle: 'SQL Injection — Crimson Dawn Confederacy',
    difficulty: 'Beginner-Intermediate',
    accent: '#dc2626',
    storageKey: 'hexworth_ctf_a1',
    registryId: 'a1-ancient-ledger',
    trackerKey: 'ctf_a1',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Discover the target\'s attack surface. Identify open ports and running services.',
            requiredFlags: [],
            mitre: ['T1046', 'T1595.002'],
            unlocks: ['enumeration'],
            locked: false
        },
        {
            id: 'enumeration',
            name: 'Web Enumeration',
            icon: '\uD83C\uDF10',
            description: 'Explore the web application. Identify input fields and test for vulnerabilities.',
            requiredFlags: [],
            mitre: ['T1190', 'T1592.004'],
            unlocks: ['exploitation'],
            locked: true
        },
        {
            id: 'exploitation',
            name: 'SQL Injection',
            icon: '\uD83D\uDC89',
            description: 'Exploit the SQL injection vulnerability to extract data from the database.',
            requiredFlags: ['user'],
            mitre: ['T1190', 'T1059.004'],
            unlocks: ['exfiltration'],
            locked: true
        },
        {
            id: 'exfiltration',
            name: 'Data Exfiltration',
            icon: '\uD83D\uDCC2',
            description: 'Extract classified data from the database. Access the Stellar Forge codes.',
            requiredFlags: ['root'],
            mitre: ['T1567', 'T1530'],
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
                title: 'Scan the target with nmap',
                tip: 'Open the Terminal and run: nmap 10.10.14.5',
                trigger: { event: 'command', match: { cmd: 'contains:nmap' } }
            },
            {
                title: 'Open the web application',
                tip: 'Open Firefox and browse to the target IP address.',
                trigger: { event: 'navigate' }
            },
            {
                title: 'Test the login form for vulnerabilities',
                tip: 'Try SQL injection in the search form, or use sqlmap from the terminal.',
                trigger: {
                    event: 'command',
                    match: { phase: 'EXPLOIT' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:sql' } },
                        { event: 'command', match: { cmd: "contains:' OR" } },
                        { event: 'command', match: { cmd: 'contains:union' } }
                    ]
                }
            },
            {
                title: 'Extract sensitive data',
                tip: 'Use SQL injection to dump the database tables. Look for flag values.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Escalate to root-level access',
                tip: 'Find the admin password hash and use it to access privileged data.',
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
            { flagId: 'user', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Injection attacks', skill: 'SQL Injection Discovery' },
            { flagId: 'user', objective: '2.4', description: 'Given a scenario, analyze indicators associated with application attacks', skill: 'Input Validation Testing' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks', skill: 'SQL Injection Data Extraction' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — Database security', skill: 'Database Exfiltration' }
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.10.14.5\n'
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED DATABASE
    // ═══════════════════════════════════════════════════════

    _db: {
        allocations: [
            { id: 1, resource: 'Titanium Alloy', quantity: '4,200 units', habitat: 'Orbital-7' },
            { id: 2, resource: 'Fuel Cells', quantity: '890 units', habitat: 'Orbital-3' },
            { id: 3, resource: 'Polymer Sheets', quantity: '12,600 units', habitat: 'Orbital-12' },
            { id: 4, resource: 'Copper Wiring', quantity: '7,340 units', habitat: 'Orbital-7' },
            { id: 5, resource: 'Water Purifiers', quantity: '156 units', habitat: 'Orbital-1' },
            { id: 6, resource: 'Solar Panels', quantity: '2,100 units', habitat: 'Orbital-9' },
            { id: 7, resource: 'Hydroponic Kits', quantity: '430 units', habitat: 'Orbital-3' },
            { id: 8, resource: 'Oxygen Generators', quantity: '88 units', habitat: 'Orbital-1' },
            { id: 9, resource: 'Carbon Filters', quantity: '1,560 units', habitat: 'Orbital-5' },
            { id: 10, resource: 'Navigation Arrays', quantity: '24 units', habitat: 'Orbital-12' }
        ],
        users: [
            { id: 1, username: 'admin', password_hash: '$2b$12$LJ3m4ys5Rn...Cr1ms0nD4wn', role: 'administrator', email: 'admin@crimson-dawn.net' },
            { id: 2, username: 'data_scribe', password_hash: '$2b$12$Xk9p2rT...b4ckd00r_4cc3ss', role: 'scribe', email: 'scribe@crimson-dawn.net' },
            { id: 3, username: 'viewer', password_hash: '$2b$12$Aq8w1nP...r34d0nly2024', role: 'readonly', email: 'viewer@crimson-dawn.net' },
            { id: 4, username: 'logistics_bot', password_hash: '$2b$12$Mn3k7jR...l0g1st1cs_s3rv', role: 'service', email: 'bot@crimson-dawn.net' },
            { id: 5, username: 'arch_overseer', password_hash: '$2b$12$Hy4t6wQ...0v3rs33r_k3y', role: 'administrator', email: 'overseer@crimson-dawn.net' }
        ],
        stellar_forge_codes: [
            { code_id: 1, project: 'Stellar Forge Alpha', value: 'flag{st3ll4r_f0rg3_4ll0c4t10n_c0d3s}', classification: 'TOP SECRET' },
            { code_id: 2, project: 'Project Eclipse', value: 'CLASSIFIED-REDACTED', classification: 'SECRET' },
            { code_id: 3, project: 'Omega Protocol', value: 'CLASSIFIED-REDACTED', classification: 'TOP SECRET' }
        ],
        schema: {
            tables: ['allocations', 'users', 'stellar_forge_codes'],
            columns: {
                allocations: ['id', 'resource', 'quantity', 'habitat'],
                users: ['id', 'username', 'password_hash', 'role', 'email'],
                stellar_forge_codes: ['code_id', 'project', 'value', 'classification']
            }
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
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 900000, points: 100 },  // 15 minutes
        timeBonusThreshold: 1800  // 30 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: "The search form doesn't sanitize input. Try entering a single quote (') — SQL errors often reveal the query structure.",
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: "Use ORDER BY to find the column count. Try: ' ORDER BY 5-- (error means <5 columns). Then use UNION SELECT to inject your own query.",
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: "Query information_schema.tables to discover all database tables: ' UNION SELECT 1,table_name,3,4 FROM information_schema.tables--",
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: "The stellar_forge_codes table has the root flag. For user.txt, use LOAD_FILE('/home/www-data/user.txt') in a UNION SELECT.",
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Crimson Dawn Confederacy maintains a resource allocation database known as "The Ancient Ledger." Intelligence suggests a web-based search interface with poor input validation. A disgruntled data scribe may have left a backdoor. Your mission: compromise the database and extract the Stellar Forge allocation codes.',
        scenario: 'A junior developer at the Crimson Dawn Confederacy deployed a PHP web application without parameterized queries. The CTO approved the deployment despite security review flagging SQL injection risks. "We need to ship fast," they said. "Nobody will find the search page."',
        outro: 'The Ancient Ledger has been breached. The Stellar Forge allocation codes are exposed, and the Crimson Dawn Confederacy\'s most guarded secrets are now in your hands. The data-scribe\'s backdoor served its purpose well.',
        ecer: {
            executive: 'CTO prioritized speed over security, approved unreviewed code deployment',
            culture: 'No secure development lifecycle (SDLC), no code review enforcement',
            employee: 'Developer used string concatenation instead of parameterized queries',
            regulatory: 'No compliance framework required input validation testing'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — The Ancient Ledger
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.10.14.5/ledger/',

        pages: {
            '/ledger/': {
                title: 'The Ancient Ledger',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#8B6914; font-size:1.6rem; font-family:Georgia,serif; margin-bottom:4px;"><img src="/assets/images/icons/icon-scales.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> The Ancient Ledger</h1>
                        <div style="color:#888; font-size:0.8rem;">Crimson Dawn Confederacy &mdash; Resource Allocation System v2.1.4</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 20px;">
                        <label style="display:block; color:#555; font-size:0.8rem; margin-bottom:6px;">Search Allocation Records by Resource Name:</label>
                        <div style="display:flex; gap:8px;">
                            <input type="text" data-field="search" placeholder="e.g. Titanium, Fuel Cells..."
                                   style="flex:1; padding:8px 14px; border:1px solid #ccc; border-radius:4px; font-family:inherit; font-size:0.85rem;">
                            <button data-action="search"
                                    style="padding:8px 20px; background:#8B6914; color:#fff; border:none; border-radius:4px; font-family:inherit; font-weight:700; cursor:pointer;">Search</button>
                        </div>
                    </div>

                    <div data-results style="max-width:700px; margin:0 auto;">
                        <div style="color:#888; font-size:0.7rem; letter-spacing:0.1em; margin-bottom:8px;">QUERY RESULTS</div>
                        <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                            <thead>
                                <tr style="background:#f5f0e0;">
                                    <th style="padding:6px 10px; text-align:left; color:#8B6914; border-bottom:2px solid #ddd;">ID</th>
                                    <th style="padding:6px 10px; text-align:left; color:#8B6914; border-bottom:2px solid #ddd;">Resource</th>
                                    <th style="padding:6px 10px; text-align:left; color:#8B6914; border-bottom:2px solid #ddd;">Quantity</th>
                                    <th style="padding:6px 10px; text-align:left; color:#8B6914; border-bottom:2px solid #ddd;">Habitat</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td style="padding:5px 10px; border-bottom:1px solid #eee;">1</td><td style="padding:5px 10px; border-bottom:1px solid #eee;">Titanium Alloy</td><td style="padding:5px 10px; border-bottom:1px solid #eee;">4,200 units</td><td style="padding:5px 10px; border-bottom:1px solid #eee;">Orbital-7</td></tr>
                                <tr><td style="padding:5px 10px; border-bottom:1px solid #eee;">2</td><td style="padding:5px 10px; border-bottom:1px solid #eee;">Fuel Cells</td><td style="padding:5px 10px; border-bottom:1px solid #eee;">890 units</td><td style="padding:5px 10px; border-bottom:1px solid #eee;">Orbital-3</td></tr>
                                <tr><td style="padding:5px 10px; border-bottom:1px solid #eee;">3</td><td style="padding:5px 10px; border-bottom:1px solid #eee;">Polymer Sheets</td><td style="padding:5px 10px; border-bottom:1px solid #eee;">12,600 units</td><td style="padding:5px 10px; border-bottom:1px solid #eee;">Orbital-12</td></tr>
                                <tr><td style="padding:5px 10px; border-bottom:1px solid #eee;">4</td><td style="padding:5px 10px; border-bottom:1px solid #eee;">Copper Wiring</td><td style="padding:5px 10px; border-bottom:1px solid #eee;">7,340 units</td><td style="padding:5px 10px; border-bottom:1px solid #eee;">Orbital-7</td></tr>
                                <tr><td style="padding:5px 10px; border-bottom:1px solid #eee;">5</td><td style="padding:5px 10px; border-bottom:1px solid #eee;">Water Purifiers</td><td style="padding:5px 10px; border-bottom:1px solid #eee;">156 units</td><td style="padding:5px 10px; border-bottom:1px solid #eee;">Orbital-1</td></tr>
                            </tbody>
                        </table>
                    </div>
                `,
                formHandler: function(data, engine) {
                    return A1Config._handleSearch(data.q || data.search || '', engine);
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // SQL INJECTION ENGINE
    // ═══════════════════════════════════════════════════════

    _handleSearch(input, engine) {
        if (!input.trim()) return A1Config._allAllocationsHtml();

        const lower = input.toLowerCase().trim();

        // ── 1. ORDER BY — column count enumeration (check before tautology to avoid 'or' in 'ORDER') ──
        const orderByMatch = input.match(/order\s+by\s+(\d+)/i);
        if (orderByMatch) {
            const col = parseInt(orderByMatch[1]);
            if (col <= 4) {
                return A1Config._allAllocationsHtml() +
                    `<div style="color:#3498db; background:rgba(52,152,219,0.08); border:1px solid rgba(52,152,219,0.2); border-radius:4px; padding:10px; margin-top:10px; font-size:0.8rem;">Results sorted by column ${col}.</div>`;
            } else {
                return `<div style="color:#e74c3c; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; padding:10px; font-size:0.8rem;">
                    <strong>MySQL Error:</strong> Unknown column '${col}' in 'order clause'
                </div>`;
            }
        }

        // ── 2. UNION SELECT ──
        const unionMatch = input.match(/union\s+(all\s+)?select\s+(.+)/i);
        if (unionMatch) {
            return A1Config._handleUnion(unionMatch[2].trim(), input);
        }

        // ── 3. LOAD_FILE (standalone) ──
        if (/load_file/i.test(input)) {
            return A1Config._handleLoadFile(input);
        }

        // ── 4. Tautology bypass: ' OR 1=1-- (after ORDER BY and UNION to avoid false matches) ──
        if (/\bor\s+['"]?\d['"]?\s*=\s*['"]?\d/i.test(input) ||
            /\bor\s+true\b/i.test(input) ||
            /\bor\s+['"]?[a-z]+['"]?\s*=\s*['"]?[a-z]+['"]?\s*(--)?\s*$/i.test(input)) {
            return A1Config._allAllocationsHtml() +
                '<div style="color:#3498db; background:rgba(52,152,219,0.08); border:1px solid rgba(52,152,219,0.2); border-radius:4px; padding:10px; margin-top:10px; font-size:0.8rem;">10 rows returned. The query seems broader than expected...</div>';
        }

        // ── 6. Single quote — trigger error ──
        if (input.includes("'") && !/\bor\b/i.test(input) && !/\bunion\b/i.test(input) && !/\border\b/i.test(input) && !/load_file/i.test(input)) {
            const safe = A1Config._escHtml(input.substring(0, 40));
            return `<div style="color:#e74c3c; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; padding:10px; font-size:0.8rem;">
                <strong>MySQL Error:</strong> You have an error in your SQL syntax near '${safe}' at line 1
                <br><small style="color:#999;">Query: SELECT id, resource, quantity, habitat FROM allocations WHERE resource LIKE '%${safe}%'</small>
            </div>`;
        }

        // ── 6. Normal search ──
        const matches = A1Config._db.allocations.filter(a =>
            a.resource.toLowerCase().includes(lower)
        );

        if (matches.length > 0) {
            return A1Config._tableHtml(['ID', 'Resource', 'Quantity', 'Habitat'],
                matches.map(a => [a.id, a.resource, a.quantity, a.habitat]));
        }

        return '<div style="color:#888; padding:10px; text-align:center;">No records found.</div>';
    },

    _handleLoadFile(input) {
        if (input.includes('user.txt') || input.includes('/home/www-data')) {
            return `<table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                <tr><td colspan="4" style="color:#2ecc71; padding:10px; font-weight:bold;">flag{4nc13nt_l3dg3r_sql1_d1sc0v3r3d}</td></tr>
            </table>
            <div style="color:#2ecc71; background:rgba(46,204,113,0.08); border:1px solid rgba(46,204,113,0.2); border-radius:4px; padding:10px; margin-top:10px; font-size:0.8rem;">
                File contents retrieved from the server filesystem.
            </div>`;
        }
        if (input.includes('/etc/passwd')) {
            return `<table style="width:100%; border-collapse:collapse; font-size:0.75rem;">
                <tr><td colspan="4" style="padding:6px; color:#666; font-family:monospace; white-space:pre;">root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
mysql:x:27:27:MySQL Server:/var/lib/mysql:/bin/false
ledger_app:x:1001:1001::/home/ledger_app:/bin/bash</td></tr>
            </table>`;
        }
        if (input.includes('root.txt') || input.includes('/root/')) {
            return `<div style="color:#e74c3c; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; padding:10px; font-size:0.8rem;">
                <strong>MySQL Error:</strong> Can't read file '/root/root.txt' (errno: 13 - Permission denied)
            </div>`;
        }
        return `<div style="color:#e74c3c; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; padding:10px; font-size:0.8rem;">
            <strong>MySQL Error:</strong> File not found or permission denied.
        </div>`;
    },

    _handleUnion(selectPart, fullInput) {
        // Strip trailing SQL comment markers
        selectPart = selectPart.replace(/--.*$/, '').trim();

        const cols = selectPart.split(',').map(c => c.trim().toLowerCase());

        // Must have exactly 4 columns
        if (cols.length !== 4) {
            return `<div style="color:#e74c3c; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; padding:10px; font-size:0.8rem;">
                <strong>MySQL Error:</strong> The used SELECT statements have a different number of columns
                <br><small style="color:#999;">Expected 4 columns, got ${cols.length}</small>
            </div>`;
        }

        const joined = cols.join(' ');

        // LOAD_FILE inside UNION SELECT — delegate to shared handler
        if (/load_file/i.test(joined) || /load_file/i.test(fullInput)) {
            return A1Config._handleLoadFile(fullInput);
        }

        // Combined version, user, database (check BEFORE individual — otherwise version() catches first)
        if (/version/.test(joined) && /user/.test(joined) && /database/.test(joined)) {
            return A1Config._tableHtml(['version()', 'user()', 'database()', 'col4'],
                [['MySQL 8.0.35', 'ledger_app@localhost', 'ancient_ledger_db', '—']]);
        }

        // version() / @@version
        if (/version|@@version/.test(joined)) {
            return A1Config._tableHtml(['col1', 'col2', 'col3', 'col4'],
                [['—', 'MySQL 8.0.35', '—', '—']]) +
                '<div style="color:#3498db; background:rgba(52,152,219,0.08); border:1px solid rgba(52,152,219,0.2); border-radius:4px; padding:10px; margin-top:10px; font-size:0.8rem;">Database version disclosed.</div>';
        }

        // database()
        if (/database\(\)|current_database/.test(joined)) {
            return A1Config._tableHtml(['col1', 'col2', 'col3', 'col4'],
                [['—', 'ancient_ledger_db', '—', '—']]) +
                '<div style="color:#3498db; background:rgba(52,152,219,0.08); border:1px solid rgba(52,152,219,0.2); border-radius:4px; padding:10px; margin-top:10px; font-size:0.8rem;">Current database name disclosed.</div>';
        }

        // user()
        if (/user\(\)|current_user/.test(joined)) {
            return A1Config._tableHtml(['col1', 'col2', 'col3', 'col4'],
                [['—', 'ledger_app@localhost', '—', '—']]);
        }

        // information_schema.columns (check BEFORE tables — both can have table_name in the query)
        if (/information_schema\.columns/.test(joined) || /information_schema\.columns/.test(fullInput.toLowerCase()) ||
            (/column_name/.test(joined) && /information_schema/.test(fullInput.toLowerCase()))) {
            const db = A1Config._db;
            // Check if a specific table is targeted
            const tableMatch = fullInput.match(/table_name\s*=\s*['"](\w+)['"]/i);
            if (tableMatch && db.schema.columns[tableMatch[1]]) {
                const tbl = tableMatch[1];
                return A1Config._tableHtml(['#', 'column_name', 'table_name', 'data_type'],
                    db.schema.columns[tbl].map((c, i) => [i + 1, c, tbl, 'varchar(255)'])) +
                    `<div style="color:#3498db; background:rgba(52,152,219,0.08); border:1px solid rgba(52,152,219,0.2); border-radius:4px; padding:10px; margin-top:10px; font-size:0.8rem;">Columns for '${tbl}' enumerated.</div>`;
            }
            // Show all columns
            const rows = [];
            for (const [tbl, colList] of Object.entries(db.schema.columns)) {
                colList.forEach((c, i) => rows.push([i + 1, c, tbl, 'varchar(255)']));
            }
            return A1Config._tableHtml(['#', 'column_name', 'table_name', 'data_type'], rows) +
                '<div style="color:#3498db; background:rgba(52,152,219,0.08); border:1px solid rgba(52,152,219,0.2); border-radius:4px; padding:10px; margin-top:10px; font-size:0.8rem;">All columns enumerated.</div>';
        }

        // information_schema.tables (after columns check)
        if (/information_schema\.tables/.test(joined) || /information_schema\.tables/.test(fullInput.toLowerCase()) ||
            (/table_name/.test(joined) && !(/column_name/.test(joined)))) {
            const db = A1Config._db;
            return A1Config._tableHtml(['#', 'table_name', 'table_schema', 'table_type'],
                db.schema.tables.map((t, i) => [i + 1, t, 'ancient_ledger_db', 'BASE TABLE'])) +
                '<div style="color:#3498db; background:rgba(52,152,219,0.08); border:1px solid rgba(52,152,219,0.2); border-radius:4px; padding:10px; margin-top:10px; font-size:0.8rem;">3 tables discovered in ancient_ledger_db.</div>';
        }

        // SELECT from users
        if (/from\s+users/i.test(selectPart) || (/username/.test(joined) && /password/.test(joined))) {
            const db = A1Config._db;
            return A1Config._tableHtml(['id', 'username', 'password_hash', 'role'],
                db.users.map(u => [u.id, u.username, u.password_hash, u.role])) +
                '<div style="color:#2ecc71; background:rgba(46,204,113,0.08); border:1px solid rgba(46,204,113,0.2); border-radius:4px; padding:10px; margin-top:10px; font-size:0.8rem;">Credentials extracted from users table! The data_scribe account looks interesting...</div>';
        }

        // SELECT from stellar_forge_codes
        if (/stellar_forge|from\s+stellar_forge_codes/i.test(fullInput)) {
            const db = A1Config._db;
            return A1Config._tableHtml(['code_id', 'project', 'value', 'classification'],
                db.stellar_forge_codes.map(s => [
                    s.code_id,
                    s.project,
                    `<span style="color:${s.value.startsWith('flag{') ? '#2ecc71; font-weight:bold' : '#888'}">${s.value}</span>`,
                    s.classification
                ])) +
                '<div style="color:#2ecc71; background:rgba(46,204,113,0.08); border:1px solid rgba(46,204,113,0.2); border-radius:4px; padding:10px; margin-top:10px; font-size:0.8rem;">Classified data extracted! The Stellar Forge allocation codes are revealed.</div>';
        }

        // NULL/number columns test
        if (cols.every(c => c === 'null' || c.match(/^\d+$/) || c === "''")) {
            return A1Config._tableHtml(['col1', 'col2', 'col3', 'col4'],
                [cols.map(c => c === 'null' ? 'NULL' : c.replace(/'/g, ''))]) +
                '<div style="color:#3498db; background:rgba(52,152,219,0.08); border:1px solid rgba(52,152,219,0.2); border-radius:4px; padding:10px; margin-top:10px; font-size:0.8rem;">UNION injection confirmed. 4 columns in the query. Now enumerate the schema...</div>';
        }

        // Generic fallback
        return A1Config._tableHtml(['col1', 'col2', 'col3', 'col4'],
            [cols.map(c => A1Config._escHtml(c).substring(0, 30))]);
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
                                    content: '=== MISSION BRIEFING ===\nTarget: 10.10.14.5 (The Ancient Ledger)\nObjective: SQL Injection exploitation\n\nRecon steps:\n1. nmap scan to identify services\n2. Browse the web application\n3. Test for SQL injection in search forms\n4. Enumerate database and extract data\n5. Find both flags (user.txt + root.txt)\n\nGood luck, operator.'
                                },
                                'wordlists': {
                                    type: 'dir',
                                    children: {
                                        'sqli-payloads.txt': {
                                            type: 'file',
                                            content: "' OR 1=1--\n' OR 'a'='a\n' UNION SELECT 1,2,3,4--\n' ORDER BY 1--\nadmin'--\n\" OR \"\"=\"\n1' AND 1=1--\n' UNION SELECT null,null,null,null--"
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap 10.10.14.5\ncurl http://10.10.14.5/ledger/\nfirefox http://10.10.14.5/ledger/'
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
                        'mysql_backup.sql.bak': {
                            type: 'file',
                            content: '-- MySQL dump 10.13\n-- Host: localhost\n-- Database: ancient_ledger_db\n--\n-- [CORRUPTED: file truncated at byte 1024]\n-- This backup is from 2019 and predates the current schema.\n-- Table structure has changed significantly since then.'
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
                                            content: '10.10.14.2 - - [15/Mar/2024:09:14:02] "GET /ledger/ HTTP/1.1" 200 1842\n10.10.14.2 - - [15/Mar/2024:09:14:08] "GET /ledger/search.php?q=Titanium HTTP/1.1" 200 4096\n10.10.14.3 - - [15/Mar/2024:11:22:45] "GET /ledger/admin/ HTTP/1.1" 403 276\n10.10.14.3 - - [15/Mar/2024:11:22:51] "GET /phpmyadmin/ HTTP/1.1" 404 196\n10.10.14.3 - - [15/Mar/2024:11:23:02] "POST /ledger/login.php HTTP/1.1" 404 196\n10.10.14.7 - - [16/Mar/2024:03:41:19] "GET /ledger/config/db.php HTTP/1.1" 403 276'
                                        },
                                        'error.log': {
                                            type: 'file',
                                            content: '[Wed Mar 15 09:14:02.123] [notice] Apache/2.4.57 configured -- resuming normal operations\n[Wed Mar 15 11:22:45.891] [error] [client 10.10.14.3] AH01630: client denied by server configuration: /var/www/html/ledger/admin/\n[Wed Mar 15 11:23:02.445] [error] [client 10.10.14.3] File does not exist: /var/www/html/ledger/login.php\n[Thu Mar 16 03:41:19.012] [error] [client 10.10.14.7] AH01630: client denied by server configuration: /var/www/html/ledger/config/'
                                        }
                                    }
                                },
                                'mysql': {
                                    type: 'dir',
                                    children: {
                                        'error.log': {
                                            type: 'file',
                                            content: '2024-03-15T09:14:00.123456Z 0 [Note] /usr/sbin/mysqld: ready for connections.\nVersion: \'8.0.35\'  socket: \'/var/run/mysqld/mysqld.sock\'  port: 3306\n2024-03-15T09:14:00.234567Z 0 [Warning] Insecure configuration for --pid-file\n2024-03-16T03:40:55.789012Z 2 [Warning] IP address \'10.10.14.7\' could not be resolved'
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
                                            content: 'User-agent: *\nDisallow: /ledger/admin/\nDisallow: /ledger/config/\nDisallow: /ledger/uploads/\nDisallow: /backup/'
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
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.10.14.5';
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target || target === '10.10.14.5') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.10.14.5
Host is up (0.032s latency).
Not shown: 998 closed tcp ports

PORT     STATE    SERVICE    VERSION
80/tcp   open     http       Apache httpd 2.4.57
3306/tcp filtered mysql

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 8.42 seconds`;
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

            // Check for the target web app
            if (url.includes('10.10.14.5') && url.includes('/ledger')) {
                // Extract query parameter if present
                const qMatch = url.match(/[?&]q=([^&]*)/);
                if (qMatch) {
                    const query = decodeURIComponent(qMatch[1]);
                    // Run through SQL engine
                    const result = A1Config._handleSearch(query, engine);
                    // Strip HTML for terminal output
                    return A1Config._stripHtml(result);
                }
                // No query — return the landing page
                return `<!DOCTYPE html>
<html>
<head><title>The Ancient Ledger</title></head>
<body>
<h1>The Ancient Ledger</h1>
<p>Crimson Dawn Confederacy - Resource Allocation System v2.1.4</p>
<form action="/ledger/search.php" method="GET">
  <input name="q" placeholder="Search resources...">
  <button type="submit">Search</button>
</form>
</body>
</html>`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        'sqlmap': function(args, term, engine) {
            const url = args.find(a => a.startsWith('http') || a.startsWith('"http'));
            if (!url) return 'Usage: sqlmap -u "URL" [options]\n\n  -u URL     Target URL\n  --dbs      Enumerate databases\n  --tables   Enumerate tables\n  --dump     Dump table data';

            // Simulate sqlmap output
            const hasDbs = args.includes('--dbs');
            const hasTables = args.includes('--tables');
            const hasDump = args.includes('--dump');

            let output = `[*] starting sqlmap v1.7.12
[*] testing connection to the target URL
[*] testing if the target URL content is stable
[*] testing if GET parameter 'q' is dynamic
[*] GET parameter 'q' appears to be dynamic
[*] testing for SQL injection on GET parameter 'q'
[*] testing 'AND boolean-based blind - WHERE or HAVING clause'
[*] GET parameter 'q' is vulnerable
[*] testing 'MySQL >= 5.0.12 AND time-based blind'
[*] GET parameter 'q' is 'MySQL >= 5.0.12 AND time-based blind' injectable
[+] back-end DBMS: MySQL >= 8.0
`;

            if (hasDbs) {
                output += `\n[*] fetching database names
available databases [2]:
[*] ancient_ledger_db
[*] information_schema
`;
            }

            if (hasTables) {
                output += `\n[*] fetching tables for database: 'ancient_ledger_db'
Database: ancient_ledger_db
[3 tables]
+----------------------+
| allocations          |
| stellar_forge_codes  |
| users                |
+----------------------+
`;
            }

            if (hasDump) {
                output += `\n[*] fetching columns for table 'users' in database 'ancient_ledger_db'
[*] fetching entries for table 'users' in database 'ancient_ledger_db'
Database: ancient_ledger_db
Table: users
[5 entries]
+----+----------------+----------------------------+---------------+
| id | username       | password_hash              | role          |
+----+----------------+----------------------------+---------------+
| 1  | admin          | $2b$12$LJ3m4ys5Rn...      | administrator |
| 2  | data_scribe    | $2b$12$Xk9p2rT...         | scribe        |
| 3  | viewer         | $2b$12$Aq8w1nP...         | readonly      |
| 4  | logistics_bot  | $2b$12$Mn3k7jR...         | service       |
| 5  | arch_overseer  | $2b$12$Hy4t6wQ...         | administrator |
+----+----------------+----------------------------+---------------+
`;
            }

            if (!hasDbs && !hasTables && !hasDump) {
                output += `\n[+] Parameter 'q' is injectable. Use --dbs, --tables, or --dump for enumeration.`;
            }

            return output;
        },

        'dirb': function(args, term, engine) {
            const target = args[0] || '';
            if (!target) return 'Usage: dirb <url_base> [<wordlist_file>]';

            return `---- Scanning URL: ${target} ----
+ ${target}/index.html (CODE:200|SIZE:1842)
+ ${target}/search.php (CODE:200|SIZE:4096)
+ ${target}/admin/ (CODE:403|SIZE:276)
+ ${target}/config/ (CODE:403|SIZE:276)
+ ${target}/uploads/ (CODE:403|SIZE:276)

---- Results ----
5 results found.`;
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.10.14.5') {
                return `PING 10.10.14.5 (10.10.14.5) 56(84) bytes of data.
64 bytes from 10.10.14.5: icmp_seq=1 ttl=64 time=32.1 ms
64 bytes from 10.10.14.5: icmp_seq=2 ttl=64 time=31.8 ms
64 bytes from 10.10.14.5: icmp_seq=3 ttl=64 time=32.4 ms

--- 10.10.14.5 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 31.8/32.1/32.4/0.245 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            const target = args.find(a => !a.startsWith('-')) || args.find(a => a.startsWith('-h'))?.replace('-h', '').trim() || '';
            return `- Nikto v2.5.0
+ Target IP:       10.10.14.5
+ Target Hostname:  ancient-ledger.ctf.local
+ Target Port:      80
+ Server: Apache/2.4.57 (Debian)
+ /ledger/search.php: SQL injection possible via 'q' parameter
+ /ledger/admin/: Directory listing denied (403)
+ Apache/2.4.57 appears to be outdated
+ OSVDB-3092: /ledger/config/: Configuration directory found
+ 7 items checked: 3 findings`;
        },

        'gobuster': function(args) {
            if (args.length === 0) return 'Usage: gobuster dir -u <url> -w <wordlist>';
            return `Gobuster v3.6
[+] Url:            http://10.10.14.5/ledger/
[+] Wordlist:       /usr/share/wordlists/dirb/common.txt
[+] Status codes:   200,204,301,302,307,401,403
===============================================================
/admin/              (Status: 403) [Size: 276]
/config/             (Status: 403) [Size: 276]
/index.html          (Status: 200) [Size: 1842]
/search.php          (Status: 200) [Size: 4096]
/uploads/            (Status: 403) [Size: 276]
===============================================================
Finished`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _allAllocationsHtml() {
        return A1Config._tableHtml(
            ['ID', 'Resource', 'Quantity', 'Habitat'],
            A1Config._db.allocations.map(a => [a.id, a.resource, a.quantity, a.habitat])
        );
    },

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#8B6914; border-bottom:2px solid #ddd; background:#f5f0e0;">${h}</th>`;
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
