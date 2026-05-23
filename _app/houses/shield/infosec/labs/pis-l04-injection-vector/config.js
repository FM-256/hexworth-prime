/* ============================================================
   PIS-L04: Injection Vector
   Principles of Information Security -- CTF Lab
   SQL injection analysis, exfiltration tracing, remediation
   SY0-701: 2.3, 2.4
   ============================================================ */

const PISL04Config = {

    // =========================================================
    // BOX METADATA
    // =========================================================

    title: 'Injection Vector',
    subtitle: 'Hexworth Containment -- Containment Database Incident',
    description: 'The containment database has been compromised. Attack logs are queued for analysis. Identify the injection technique, trace the exfiltration path through session IDs, and apply the correct remediation patch.',
    difficulty: 'Intermediate',
    estimatedTime: 40,
    accent: '#ef4444',
    storageKey: 'hexworth_lab_pis_l04',
    registryId: 'pis-l04-injection-vector',
    trackerKey: 'lab_pis_l04',

    // =========================================================
    // BOOT SEQUENCE
    // =========================================================

    boot: {
        biosLines: [
            'HEXWORTH CONTAINMENT WORKSTATION v4.2.1',
            'Database Forensics Terminal -- BSL-2 Clearance',
            'Mounting attack log archive... OK',
            'Database schema loaded: containment.db',
            'Session trace engine: READY',
            '*** WARNING: containment.db READ-ONLY mode (forensic) ***'
        ],
        grubEntries: [
            'Containment Analyst OS 22.04 LTS',
            'Containment Analyst OS (recovery mode)'
        ],
        loginUser: 'analyst'
    },

    // =========================================================
    // LORE
    // =========================================================

    lore: {
        intro: 'The containment database -- which tracks specimen locations, clearance levels, and transfer authorizations -- was accessed by an unauthorized party at 03:17 this morning. The attacker exfiltrated specimen catalog data and clearance codes. The web interface logs everything. You have the raw access logs. Your job: identify the attack type, trace the exfiltration session, and patch the vulnerability so it cannot happen again.',
        scenario: 'Hexworth runs a Python/Flask web interface that queries the containment database. The interface accepts user input for specimen search. The developer did not use parameterized queries. The attacker found the injection point and used it to dump the entire specimen catalog and clearance access table. Three session IDs are in the log. Only one belongs to the attacker. Find it, trace it, patch it.',
        outro: 'Attack type confirmed: SQL injection via unparameterized query. Exfiltration session traced. Vulnerable endpoint patched with parameterized queries. The containment database is back to read-write mode. Incident logged.',

        goals: [
            "Read web-server access logs and isolate the attack signature among legitimate traffic",
            "Identify SQL injection from the URL/query patterns the attacker used (UNION, OR 1=1, comment-truncation)",
            "Trace a single session-ID through the log to reconstruct the full exfiltration timeline and data scope",
            "Apply the canonical SQLi remediation: replace string concatenation with parameterized queries",
            "Verify the patch -- a fix that compiles is not a fix that holds"
        ],

        toolkit: [
            { name: "logs", purpose: "View the raw web access log spanning the incident window", sample: "logs" },
            { name: "analyze", purpose: "Run pattern analysis on log entries to surface anomalies", sample: "analyze 03:17" },
            { name: "trace", purpose: "Follow a session ID across the log to reconstruct an attacker workflow", sample: "trace x9y8z7" },
            { name: "identify", purpose: "File the attack-type identification (SQL injection, XSS, path traversal, etc.)", sample: "identify sql-injection" },
            { name: "patch", purpose: "Apply a code patch to the vulnerable endpoint", sample: "patch parameterized" },
            { name: "verify", purpose: "Re-test the patched endpoint with the original attacker payload", sample: "verify" },
            { name: "help", purpose: "Command reference", sample: "help" }
        ]
    },

    // =========================================================
    // TERMINAL CONFIG
    // =========================================================

    terminal: {
        user: 'analyst',
        hostname: 'db-forensics-01',
        startDir: '/home/analyst',
        welcome: 'Hexworth Containment -- Database Forensics Terminal\nBSL-2 Clearance Active\n\n*** INCIDENT: Containment database unauthorized access ***\n*** Time: 2026-04-09 03:17 UTC ***\n*** Affected system: containment.db (specimen catalog + clearance) ***\n\nStart with: logs\nType "help" for command reference.\n'
    },

    // =========================================================
    // DESKTOP ICONS
    // =========================================================

    desktop: {
        icons: [
            { id: 'briefing', label: 'Briefing',    icon: '\uD83D\uDCCB',    app: 'briefing' },
            { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'notes',    label: 'Notes',       icon: '\uD83D\uDCDD',    app: 'notes'    },
            { id: 'hints',    label: 'Hints',       icon: '\uD83D\uDCA1',    app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9',    app: 'flags'    }
        ]
    },

    // Custom desktop-icon dispatch \u2014 invoked by BoxEngine's `default:` extension
    // hook (BoxEngine.js:1110-1115) for any icon whose `app` is not built-in.
    onAppLaunch: function(iconDef, engine) {
        if (iconDef && iconDef.app === 'briefing') {
            // Re-summon \u2014 bypass skip-next-time storage; lab is already running
            // so the launch callback is a no-op.
            BriefingPage.show(this, function() {}, { force: true });
        }
    },

    // =========================================================
    // SIMULATED FILESYSTEM
    // =========================================================

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'analyst': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: 'INJECTION VECTOR INVESTIGATION NOTES\n=====================================\nIncident ID: INC-2026-0409-001\nReporting Time: 2026-04-09 06:00\nAffected System: Hexworth Containment DB (containment.db)\n\nWorkflow:\n  1. logs             -- View the attack log entries\n  2. analyze <entry>  -- Deep-dive on a specific log entry\n  3. trace <session>  -- Follow an exfiltration session ID\n  4. identify <type>  -- Submit the attack type identification\n  5. patch <vuln>     -- Apply the remediation fix\n  6. verify           -- Confirm patch effectiveness\n\nKnown attack types for identification:\n  sql-injection, xss, buffer-overflow, csrf, directory-traversal\n\nKnown patch options:\n  parameterized-queries, input-sanitization, waf-rule, rate-limiting\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'logs\nanalyze LOG-003\n'
                                }
                            }
                        }
                    }
                },
                'var': {
                    type: 'dir',
                    children: {
                        'log': {
                            type: 'dir',
                            children: {
                                'containment-web': {
                                    type: 'dir',
                                    children: {
                                        'access.log': {
                                            type: 'file',
                                            content: '2026-04-09T03:14:02Z 10.0.4.22 SESSION:a1b2c3 GET /search?q=SPX-001 HTTP/1.1 200 -- "Mozilla/5.0 Chrome/121"\n2026-04-09T03:14:15Z 10.0.4.22 SESSION:a1b2c3 GET /search?q=SPX-002 HTTP/1.1 200 -- "Mozilla/5.0 Chrome/121"\n2026-04-09T03:14:31Z 10.0.4.22 SESSION:a1b2c3 GET /search?q=SPX-003 HTTP/1.1 200 -- "Mozilla/5.0 Chrome/121"\n2026-04-09T03:17:04Z 185.220.101.47 SESSION:x9y8z7 GET /search?q=\' HTTP/1.1 500 -- "python-requests/2.31.0"\n2026-04-09T03:17:11Z 185.220.101.47 SESSION:x9y8z7 GET /search?q=\'%20OR%20\'1\'%3D\'1 HTTP/1.1 200 4821 -- "python-requests/2.31.0"\n2026-04-09T03:17:19Z 185.220.101.47 SESSION:x9y8z7 GET /search?q=\'%20UNION%20SELECT%20specimen_id%2Clocation%2Cclearance_level%20FROM%20specimens-- HTTP/1.1 200 84291 -- "python-requests/2.31.0"\n2026-04-09T03:17:28Z 185.220.101.47 SESSION:x9y8z7 GET /search?q=\'%20UNION%20SELECT%20username%2Cpassword_hash%2Cclearance_code%20FROM%20access_table-- HTTP/1.1 200 12048 -- "python-requests/2.31.0"\n2026-04-09T03:21:00Z 10.0.5.11 SESSION:p4q5r6 GET /search?q=SPX-044 HTTP/1.1 200 -- "Mozilla/5.0 Firefox/122"\n2026-04-09T03:21:45Z 10.0.5.11 SESSION:p4q5r6 GET /search?q=SPX-045 HTTP/1.1 200 -- "Mozilla/5.0 Firefox/122"\n'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'opt': {
                    type: 'dir',
                    children: {
                        'containment-web': {
                            type: 'dir',
                            children: {
                                'app.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# Hexworth Containment Web Interface\n# WARNING: VULNERABLE -- search_specimens() concatenates user input\n\nimport sqlite3\nfrom flask import Flask, request, jsonify\n\napp = Flask(__name__)\nDB_PATH = \'/var/lib/containment/containment.db\'\n\n@app.route(\'/search\')\ndef search_specimens():\n    query = request.args.get(\'q\', \'\')\n    conn = sqlite3.connect(DB_PATH)\n    cursor = conn.cursor()\n    sql = "SELECT specimen_id, status FROM specimens WHERE specimen_id = \'" + query + "\'"\n    cursor.execute(sql)\n    results = cursor.fetchall()\n    conn.close()\n    return jsonify(results)\n\nif __name__ == \'__main__\':\n    app.run(host=\'0.0.0.0\', port=5000)\n'
                                },
                                'app_patched.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# Hexworth Containment Web Interface -- PATCHED\n# Fix: parameterized query, user input never embedded in SQL string\n\nimport sqlite3\nfrom flask import Flask, request, jsonify\n\napp = Flask(__name__)\nDB_PATH = \'/var/lib/containment/containment.db\'\n\n@app.route(\'/search\')\ndef search_specimens():\n    query = request.args.get(\'q\', \'\')\n    conn = sqlite3.connect(DB_PATH)\n    cursor = conn.cursor()\n    sql = "SELECT specimen_id, status FROM specimens WHERE specimen_id = ?"\n    cursor.execute(sql, (query,))\n    results = cursor.fetchall()\n    conn.close()\n    return jsonify(results)\n\nif __name__ == \'__main__\':\n    app.run(host=\'0.0.0.0\', port=5000)\n'
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    // =========================================================
    // INTERNAL STATE
    // =========================================================

    _state: {
        attackTypeIdentified: false,
        sessionTraced: false,
        patched: false
    },

    _flag1Awarded: false,
    _flag2Awarded: false,
    _flag3Awarded: false,

    // =========================================================
    // TERMINAL COMMANDS
    // =========================================================

    commands: {

        // logs -- display the access log
        'logs': function(args, term, engine) {
            const logContent = term.fs['/'].children.var.children.log.children['containment-web'].children['access.log'].content;
            return 'CONTAINMENT-WEB ACCESS LOG -- 2026-04-09\n' + '='.repeat(60) + '\n' + logContent + '\nEntries: 9 total | Sessions: a1b2c3, x9y8z7, p4q5r6\nUse: analyze <log-number> for decoded entry analysis\nUse: trace <session-id> to follow a session\n\nLog entries numbered LOG-001 through LOG-009 (left to right order)';
        },

        // analyze <log-entry> -- parse and explain a specific log entry
        'analyze': function(args, term, engine) {
            const entry = (args[0] || '').toUpperCase();
            if (!entry) return 'Usage: analyze <log-entry-number>\nExample: analyze LOG-004\nEntries: LOG-001 through LOG-009';

            const entries = {
                'LOG-001': 'Entry: LOG-001\n2026-04-09T03:14:02Z 10.0.4.22 SESSION:a1b2c3\nMethod: GET /search?q=SPX-001\nResponse: 200 (normal)\nSource IP: 10.0.4.22 (internal -- Analyst workstation block)\nSession: a1b2c3\n\nAnalysis:\n  Normal lookup. Internal IP. User-agent is Chrome browser.\n  Querying SPX-001 by ID. No injection pattern.',
                'LOG-002': 'Entry: LOG-002\n2026-04-09T03:14:15Z 10.0.4.22 SESSION:a1b2c3\nMethod: GET /search?q=SPX-002\nResponse: 200 (normal)\n\nAnalysis:\n  Normal lookup. Same internal session a1b2c3. Sequential specimen browsing.',
                'LOG-003': 'Entry: LOG-003\n2026-04-09T03:14:31Z 10.0.4.22 SESSION:a1b2c3\nMethod: GET /search?q=SPX-003\nResponse: 200 (normal)\n\nAnalysis:\n  Normal lookup. Same internal session continuing normal browsing.',
                'LOG-004': 'Entry: LOG-004\n2026-04-09T03:17:04Z 185.220.101.47 SESSION:x9y8z7\nMethod: GET /search?q=\'\nResponse: 500 (Internal Server Error)\nSource IP: 185.220.101.47 (EXTERNAL -- TOR exit node)\nUser-agent: python-requests/2.31.0 (automated tool)\n\nDecoded query: \'\n\nAnalysis:\n  CRITICAL INDICATOR. Single quote test -- classic SQL injection probe.\n  The 500 error means the single quote broke the SQL query syntax.\n  Attacker confirmed: the endpoint concatenates input directly into SQL.\n  External IP. Automated tool (not a browser). This is the attacker.',
                'LOG-005': 'Entry: LOG-005\n2026-04-09T03:17:11Z 185.220.101.47 SESSION:x9y8z7\nMethod: GET /search?q=\' OR \'1\'=\'1\nResponse: 200 (response size: 4821 bytes)\n\nDecoded query: \' OR \'1\'=\'1\n\nAnalysis:\n  Classic SQL injection authentication bypass / full-table dump.\n  The injected payload changes the WHERE clause to:\n  WHERE specimen_id = \'\' OR \'1\'=\'1\'\n  Since 1=1 is always true, this returns ALL rows in the specimens table.\n  Response size 4821 bytes vs. ~200 bytes for a normal single result.\n  The attacker has confirmed full read access to the specimens table.',
                'LOG-006': 'Entry: LOG-006\n2026-04-09T03:17:19Z 185.220.101.47 SESSION:x9y8z7\nMethod: GET /search?q=\' UNION SELECT specimen_id,location,clearance_level FROM specimens--\nResponse: 200 (response size: 84291 bytes -- LARGE)\n\nDecoded query: \' UNION SELECT specimen_id,location,clearance_level FROM specimens--\n\nAnalysis:\n  UNION-based SQL injection. Attacker appended a second SELECT statement.\n  The -- at the end comments out the rest of the original query.\n  Full specimens table dump: IDs, locations, and clearance_level for all specimens.\n  84,291 bytes = entire specimen catalog exfiltrated.',
                'LOG-007': 'Entry: LOG-007\n2026-04-09T03:17:28Z 185.220.101.47 SESSION:x9y8z7\nMethod: GET /search?q=\' UNION SELECT username,password_hash,clearance_code FROM access_table--\nResponse: 200 (response size: 12048 bytes)\n\nDecoded query: \' UNION SELECT username,password_hash,clearance_code FROM access_table--\n\nAnalysis:\n  CRITICAL: Second UNION injection targeting the access control table.\n  Attacker now knows the database schema (from prior responses or trial/error).\n  Exfiltrated: all usernames, password hashes, and clearance codes.\n  This is the primary damage -- credential and clearance data is now in attacker hands.',
                'LOG-008': 'Entry: LOG-008\n2026-04-09T03:21:00Z 10.0.5.11 SESSION:p4q5r6\nMethod: GET /search?q=SPX-044\nResponse: 200 (normal)\nSource IP: 10.0.5.11 (internal)\n\nAnalysis:\n  Normal internal session. After the attack. Unrelated user.',
                'LOG-009': 'Entry: LOG-009\n2026-04-09T03:21:45Z 10.0.5.11 SESSION:p4q5r6\nMethod: GET /search?q=SPX-045\nResponse: 200 (normal)\n\nAnalysis:\n  Normal internal session. Clean traffic.'
            };

            const result = entries[entry];
            if (!result) {
                return `Log entry ${entry} not found.\nValid entries: LOG-001 through LOG-009`;
            }

            return result;
        },

        // trace <session-id> -- follow an exfiltration session
        'trace': function(args, term, engine) {
            const sessionId = (args[0] || '').toLowerCase();
            if (!sessionId) return 'Usage: trace <session-id>\nSession IDs in log: a1b2c3, x9y8z7, p4q5r6';

            // Gate: must identify the attack type before tracing sessions
            if (!engine.config._state.attackTypeIdentified && sessionId === 'x9y8z7') {
                return 'ANALYSIS ERROR: Identify the attack type first using the "identify" command.\nYou need to understand WHAT happened before you trace HOW it happened.';
            }

            if (sessionId === 'a1b2c3') {
                return 'SESSION TRACE: a1b2c3\n' + '='.repeat(40) + '\nSource: 10.0.4.22 (internal analyst workstation)\nAgent: Chrome browser\nRequests: 3\n  03:14:02 GET /search?q=SPX-001  200 OK\n  03:14:15 GET /search?q=SPX-002  200 OK\n  03:14:31 GET /search?q=SPX-003  200 OK\n\nVerdict: LEGITIMATE SESSION\n  Normal specimen lookup pattern. Internal IP. Browser user-agent.\n  No injection payloads. Data access is within normal analyst scope.';
            }

            if (sessionId === 'x9y8z7') {
                engine.config._state.sessionTraced = true;

                let output = 'SESSION TRACE: x9y8z7\n' + '='.repeat(40) + '\nSource: 185.220.101.47 (EXTERNAL -- TOR exit node)\nAgent: python-requests/2.31.0 (automated tool)\nRequests: 4\n  03:17:04 GET /search?q=\'             500 ERROR  -- probe\n  03:17:11 GET /search?q=\' OR \'1\'=\'1  200 4821b  -- full table read\n  03:17:19 GET /search?q=UNION specimens 200 84291b -- catalog dump\n  03:17:28 GET /search?q=UNION access  200 12048b -- credential dump\n\nEXFIL SUMMARY:\n  Data exfiltrated in this session:\n  1. Full specimen catalog (specimen IDs, locations, clearance levels)\n  2. Complete access_table (usernames, password hashes, clearance codes)\n  Total exfiltrated: ~100KB\n  Method: UNION-based SQL injection\n  Duration: 24 seconds\n\nVerdict: ATTACKER SESSION -- CONFIRMED EXFILTRATION\n  External IP. Automated tool. Injection payloads. Anomalous response sizes.\n';

                if (!engine.config._flag2Awarded) {
                    engine.config._flag2Awarded = true;
                    engine.awardFlag('flag2');
                    output += '\n[MILESTONE] Exfiltration session traced. Flag unlocked.';
                }

                return output;
            }

            if (sessionId === 'p4q5r6') {
                return 'SESSION TRACE: p4q5r6\n' + '='.repeat(40) + '\nSource: 10.0.5.11 (internal analyst workstation)\nAgent: Firefox browser\nRequests: 2\n  03:21:00 GET /search?q=SPX-044  200 OK\n  03:21:45 GET /search?q=SPX-045  200 OK\n\nVerdict: LEGITIMATE SESSION\n  Normal lookup pattern. Internal IP. Browser user-agent.\n  Activity is 4 minutes after the attack. Unrelated user.';
            }

            return `Session ID "${sessionId}" not found in logs.\nValid session IDs: a1b2c3, x9y8z7, p4q5r6`;
        },

        // identify <type> -- submit the attack type identification
        'identify': function(args, term, engine) {
            const attackType = (args[0] || '').toLowerCase();
            if (!attackType) return 'Usage: identify <attack-type>\nOptions: sql-injection, xss, buffer-overflow, csrf, directory-traversal';

            if (attackType !== 'sql-injection') {
                return `Attack type "${attackType}" does not match the log evidence.\n\nLook at LOG-004 through LOG-007:\n  - Single quote caused a 500 error (broke SQL syntax)\n  - OR \'1\'=\'1 returned the full table\n  - UNION SELECT statements exfiltrated data from other tables\nThese are all indicators of one specific attack type.\nReview: analyze LOG-005 for the decoded payloads.`;
            }

            engine.config._state.attackTypeIdentified = true;

            let output = 'ATTACK TYPE CONFIRMED: SQL INJECTION\n' + '='.repeat(45) + '\nClassification: SQL Injection -- UNION-based, classic string concatenation vulnerability\n\nEvidence summary:\n  LOG-004: Single-quote probe caused HTTP 500 (SQL syntax error)\n  LOG-005: OR 1=1 payload returned all rows (authentication bypass pattern)\n  LOG-006: UNION SELECT dumped entire specimens table (84KB response)\n  LOG-007: UNION SELECT dumped access_table (credentials + clearance codes)\n\nRoot cause: app.py concatenates user input directly into SQL string\n  Vulnerable: sql = "SELECT ... WHERE specimen_id = \'" + query + "\'"\n  Fix: parameterized queries (the "?" placeholder pattern)\n\n';

            if (!engine.config._flag1Awarded) {
                engine.config._flag1Awarded = true;
                engine.awardFlag('flag1');
                output += '[MILESTONE] Attack type identified. Flag unlocked.\n';
            }

            output += '\nNext step: trace x9y8z7 to follow the exfil session\nThen: patch parameterized-queries to remediate the vulnerability';
            return output;
        },

        // patch <vulnerability> -- apply the remediation
        'patch': function(args, term, engine) {
            const patchType = (args[0] || '').toLowerCase();
            if (!patchType) return 'Usage: patch <patch-type>\nOptions: parameterized-queries, input-sanitization, waf-rule, rate-limiting';

            if (!engine.config._state.attackTypeIdentified) {
                return 'Patch blocked: attack type not yet confirmed.\nRun: identify sql-injection first.';
            }

            if (!engine.config._state.sessionTraced) {
                return 'Patch blocked: exfiltration session not yet traced.\nRun: trace x9y8z7 to document the exfil path before patching.';
            }

            if (patchType === 'parameterized-queries') {
                engine.config._state.patched = true;

                let output = 'PATCH APPLIED: PARAMETERIZED QUERIES\n' + '='.repeat(45) + '\nDeploying app_patched.py to production...\n\nChange made:\n  Before (VULNERABLE):\n    sql = "SELECT ... WHERE specimen_id = \'" + query + "\'"\n    cursor.execute(sql)\n\n  After (PATCHED):\n    sql = "SELECT ... WHERE specimen_id = ?"\n    cursor.execute(sql, (query,))\n\nWhy this works:\n  The sqlite3 driver handles the "?" placeholder internally.\n  User input is NEVER embedded in the SQL string.\n  Even if the attacker sends \' OR \'1\'=\'1, the driver treats\n  the entire input as a literal string value, not SQL syntax.\n  Injection is structurally impossible with parameterized queries.\n\nService restarted. containment.db back to read-write mode.\n\n';

                if (!engine.config._flag3Awarded) {
                    engine.config._flag3Awarded = true;
                    engine.awardFlag('flag3');
                    output += '[MILESTONE] Vulnerability patched. Flag unlocked.\n';
                }

                output += '\nRun: verify to confirm patch effectiveness.';
                return output;
            }

            // Partial credit / guidance for wrong patch
            if (patchType === 'input-sanitization') {
                return 'Patch: input-sanitization\n\nThis is a partial mitigation but NOT the correct primary fix for SQL injection.\n\nInput sanitization (stripping quotes, encoding characters) can be bypassed.\nThe correct fix for SQL injection is parameterized queries -- user input\nis never embedded in the SQL string at all, so no sanitization is needed.\n\nTry: patch parameterized-queries';
            }

            if (patchType === 'waf-rule') {
                return 'Patch: waf-rule\n\nA WAF rule can filter known injection patterns but is not a root-cause fix.\nAttackers can bypass WAFs with obfuscated payloads, alternate encodings, etc.\nThe correct fix is parameterized queries at the application layer.\n\nTry: patch parameterized-queries';
            }

            if (patchType === 'rate-limiting') {
                return 'Patch: rate-limiting\n\nRate limiting slows an attacker but does not prevent injection once they have\naccess to the endpoint. The attack in the logs took only 24 seconds --\nwell within most rate limits. Not the correct primary fix.\n\nTry: patch parameterized-queries';
            }

            return `Unknown patch type: "${patchType}"\nValid options: parameterized-queries, input-sanitization, waf-rule, rate-limiting`;
        },

        // verify -- confirm patch is effective
        'verify': function(args, term, engine) {
            if (!engine.config._state.patched) {
                return 'Nothing to verify. No patch has been applied yet.\nRun: patch parameterized-queries';
            }

            return 'PATCH VERIFICATION\n' + '='.repeat(40) + '\nTesting injection payloads against patched endpoint...\n\nTest 1: q=\'\n  Result: 200 OK -- literal search for specimen named "\'\"\n  SQL generated: SELECT ... WHERE specimen_id = \'?\'\n  Injection attempt: NEUTRALIZED\n\nTest 2: q=\' OR \'1\'=\'1\n  Result: 200 OK -- 0 results (no specimen with that literal ID)\n  Injection attempt: NEUTRALIZED\n\nTest 3: q=\' UNION SELECT username,password_hash FROM access_table--\n  Result: 200 OK -- 0 results\n  Injection attempt: NEUTRALIZED\n\nAll three attack payloads returned no data and caused no errors.\nParameterized queries prevent SQL injection at the structural level.\n\nContainment database: SECURED\nIncident status: RESOLVED';
        },

        // help -- command reference
        'help': function(args, term, engine) {
            return 'DATABASE FORENSICS TERMINAL -- COMMAND REFERENCE\n\n  logs               Display access log\n  analyze <entry>    Decode a specific log entry (LOG-001 to LOG-009)\n  trace <session>    Follow a session through the logs\n  identify <type>    Submit attack type identification\n  patch <fix>        Apply remediation\n  verify             Test patch effectiveness\n  cat <file>         Read a file\n\nSession IDs: a1b2c3, x9y8z7, p4q5r6\nAttack types: sql-injection, xss, buffer-overflow, csrf, directory-traversal\nPatch options: parameterized-queries, input-sanitization, waf-rule, rate-limiting';
        }
    },

    // =========================================================
    // FLAGS
    // =========================================================

    flags: [
        {
            id: 'flag1',
            value: 'FLAG{pis-l04-injection-vector_flag1_attack_type_identifi}',
            label: 'Attack Type Identified',
            description: 'Correctly identified the attack as SQL injection from the access log evidence.',
            points: 250,
            autoCheck: true
        },
        {
            id: 'flag2',
            value: 'FLAG{pis-l04-injection-vector_flag2_exfiltration_session}',
            label: 'Exfiltration Session Traced',
            description: 'Traced session x9y8z7 and documented the full exfiltration path and data stolen.',
            points: 250,
            autoCheck: true
        },
        {
            id: 'flag3',
            value: 'FLAG{pis-l04-injection-vector_flag3_vulnerability_patche}',
            label: 'Vulnerability Patched',
            description: 'Applied the correct remediation: parameterized queries replace string concatenation.',
            points: 250,
            autoCheck: true
        }
    ],

    // =========================================================
    // SCORING
    // =========================================================

    scoring: {
        base: 1000,
        minScore: 0,
        maxScore: 750,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 900000, points: 100 },
        timeBonusThreshold: 2400
    },

    // =========================================================
    // HINTS
    // =========================================================

    hints: [
        {
            id: 'hint1',
            text: 'Start with: logs, then analyze LOG-004. A single quote causing a 500 error is the universal first sign of SQL injection vulnerability testing. The attacker is probing to see if the server breaks when it receives unexpected SQL characters.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint2',
            text: 'Three sessions are in the log. Two are from internal IPs using a browser. One is from an external IP using python-requests (an automated tool). The external + automated tool combination, plus the 500 error response, points directly to the attacker session.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'The correct patch for SQL injection is always parameterized queries (also called prepared statements). Input sanitization and WAF rules are supplemental controls -- they can be bypassed. Parameterized queries make injection structurally impossible because user input is never part of the SQL string.',
            cost: 50,
            penalty: -50
        }
    ],

    // =========================================================
    // CERT OBJECTIVES
    // =========================================================

    certObjectives: {
        certPath: 'CompTIA Security+ SY0-701',
        mappings: [
            { flagId: 'flag1', objective: '2.4', description: 'Analyze indicators of malicious activity', skill: 'Identifying SQL injection from HTTP access logs: single-quote probe, OR 1=1 pattern, UNION SELECT exfiltration' },
            { flagId: 'flag2', objective: '2.3', description: 'Explain different types of vulnerabilities', skill: 'Tracing data exfiltration through session analysis and response size anomalies' },
            { flagId: 'flag3', objective: '2.4', description: 'Analyze indicators of malicious activity', skill: 'Applying correct SQL injection remediation: parameterized queries vs. inadequate alternatives' }
        ]
    },

    resetState: function() {
        this._state = {
        attackTypeIdentified: false,
        sessionTraced: false,
        patched: false
    };
        this._flag1Awarded = false;
        this._flag2Awarded = false;
        this._flag3Awarded = false;
    }


};


// Auto-reset state on script load (BOX-006 backfill 2026-05-23)
if (typeof PISL04Config !== 'undefined') PISL04Config.resetState();
