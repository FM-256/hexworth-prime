/* ============================================================
   DISPATCH LAB — Box VPN003: Client Auth Failure
   CompTIA Security+ SY0-701 / CySA+ — VPN Authentication
   Config: Expired cert, RADIUS timeout, MFA desync, client
   version mismatch, CRL unreachable
   5 distinct scenarios
   ============================================================ */

var VPN003Config = {

    // ==========================================================
    // BOX METADATA
    // ==========================================================

    title: 'Client Auth Failure',
    subtitle: 'SSL VPN Users Cannot Authenticate — Fix Access',
    difficulty: 'Advanced',
    accent: '#7c3aed',
    storageKey: 'hexworth_lab_vpn003',
    registryId: 'vpn003-client-auth-fail',
    trackerKey: 'lab_vpn003',

    // ==========================================================
    // TUTORIAL MODE
    // ==========================================================

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Open the Auth Alert',
                tip: 'Double-click the VPN Alert to read the authentication failure report.',
                trigger: { event: 'window_open', match: { type: 'ticket' } }
            },
            {
                title: 'Check the Auth Dashboard',
                tip: 'Open the Auth Dashboard to review failed login attempts and backend service status.',
                trigger: { event: 'window_open', match: { type: 'auth_dashboard' } }
            },
            {
                title: 'Investigate with CLI tools',
                tip: 'Use the terminal to check certificates, RADIUS, MFA tokens, and client versions.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:show' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:radius' } },
                        { event: 'command', match: { cmd: 'contains:cert' } },
                        { event: 'command', match: { cmd: 'contains:mfa' } }
                    ]
                }
            },
            {
                title: 'Apply the fix',
                tip: 'Resolve the authentication issue — renew certs, restart RADIUS, resync MFA, or fix CRL.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:fix' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:renew' } },
                        { event: 'command', match: { cmd: 'contains:restart' } },
                        { event: 'command', match: { cmd: 'contains:resync' } }
                    ]
                }
            },
            {
                title: 'Capture the flag',
                tip: 'After restoring authentication, the flag will appear.',
                trigger: { event: 'flag_correct', match: { flagId: 'fixed' } }
            }
        ]
    },

    // ==========================================================
    // CERT OBJECTIVES
    // ==========================================================

    certObjectives: {
        certPath: 'Security+ SY0-701 / CySA+',
        mappings: [
            { flagId: 'fixed', objective: '2.4', description: 'Analyze indicators of malicious activity', skill: 'Authentication Infrastructure Troubleshooting' },
            { flagId: 'fixed', objective: '3.8', description: 'Implement identity and account management controls', skill: 'MFA / RADIUS / Certificate Management' }
        ]
    },

    // ==========================================================
    // ALERT DATA
    // ==========================================================

    _alerts: [
        { id: 'AUTH-2026-0301', severity: 'CRITICAL', engine: 'FortiGate SSL VPN v7.4', host: 'VPN-GW-01', user: 'multiple (40+ users)', detected: '2026-04-01 08:00:15' }
    ],

    // ==========================================================
    // SCENARIO FLAGS
    // ==========================================================

    _scenarioFlags: {
        cert_invalid:      null,
        radius_down:       null,
        mfa_desync:        null,
        client_version:    null,
        crl_unreachable:   null
    },

    // ==========================================================
    // SCENARIOS
    // ==========================================================

    _scenarios: [
        {
            // Scenario 0: Expired Client Certificate
            // After a CA migration, 40 users have certs signed by the old
            // intermediate CA (V1) which was decommissioned yesterday.
            // New intermediate CA (V2) certs work fine.
            id: 'cert_invalid',
            name: 'Expired Client Certificate',
            ticketSubject: 'SSL VPN users getting "Certificate Validation Failed" — 40 users locked out',
            ticketDetail: 'Starting at 08:00, SSL VPN users began receiving "Certificate Validation Failed" errors when connecting. The client certificate was reissued last week after a CA migration, but 40 of 200 users received certificates signed by the old intermediate CA (V1) that was decommissioned yesterday. Users with V2 certificates can connect fine.',
            ticketExtra: 'VPN Admin Note: The old intermediate CA (CN=Hexworth-Intermediate-V1) was removed from the trust store yesterday at 17:00. Users with V1-signed certs need reissuance from V2 (CN=Hexworth-Intermediate-V2). Use cert management commands to batch-reissue.',
            affectedHost: 0,
            fixDescription: 'Reissue client certificates from the new intermediate CA',
            stateOverrides: { _certInvalid: true, _oldCAUsed: true }
        },
        {
            // Scenario 1: RADIUS Server Timeout
            // RADIUS server was patched last night. Service did not restart
            // cleanly due to a config syntax error from the update.
            // All VPN auth attempts timeout after 10 seconds.
            id: 'radius_down',
            name: 'RADIUS Server Timeout',
            ticketSubject: 'All SSL VPN authentications failing — RADIUS timeout errors in logs',
            ticketDetail: 'No users can authenticate to the SSL VPN since 07:45. The VPN gateway logs show "RADIUS server timeout" for all authentication attempts. The RADIUS server (10.0.2.15) was patched and rebooted last night during maintenance. The server appears to be online (pings respond) but the RADIUS service itself may not have started correctly.',
            ticketExtra: 'VPN Admin Note: RADIUS runs FreeRADIUS on Ubuntu 22.04. After the OS patch, the service may have failed to start due to a config syntax error introduced by the update. Check service status, config validation, and shared secret. Backup RADIUS (10.0.2.16) was decommissioned last month.',
            affectedHost: 0,
            fixDescription: 'Restore RADIUS service and fix configuration after patch',
            stateOverrides: { _radiusDown: true, _configError: true }
        },
        {
            // Scenario 2: MFA Token Desync
            // 15 users with new hardware TOTP tokens have clock drift > 30s.
            // TOTP validation fails because the token time does not match
            // the server time. Users with old tokens still work.
            id: 'mfa_desync',
            name: 'MFA Token Desync',
            ticketSubject: 'MFA codes rejected for VPN login — "Invalid OTP" errors for 15 users',
            ticketDetail: 'Fifteen users report that their MFA tokens (hardware TOTP tokens) generate codes that the VPN gateway rejects with "Invalid OTP" errors. These users all received new hardware tokens last week as part of a token refresh. Users with old tokens authenticate fine. The VPN server TOTP drift tolerance is 30 seconds.',
            ticketExtra: 'VPN Admin Note: TOTP depends on time synchronization between token and server. The new batch of tokens may have been initialized with incorrect time. Server time source is NTP (time.hexworth.local). Use the MFA admin tools to check drift and resync the affected tokens.',
            affectedHost: 0,
            fixDescription: 'Resynchronize MFA token clocks with the authentication server',
            stateOverrides: { _mfaDesync: true, _tokenClockDrift: true }
        },
        {
            // Scenario 3: Client Version Mismatch
            // VPN client v7.2.1 was pushed via SCCM. It defaults to TLS 1.3.
            // Gateway firmware 7.0.x only supports TLS 1.2. 60% of users
            // updated and now get "SSL handshake failed."
            id: 'client_version',
            name: 'Client Version Mismatch',
            ticketSubject: 'VPN client update broke authentication — "Protocol Mismatch" after upgrade',
            ticketDetail: 'After pushing VPN client version 7.2.1 via SCCM last night, approximately 60% of users cannot connect. The error is "SSL handshake failed — protocol version mismatch." The VPN gateway runs firmware 7.0.x which supports up to TLS 1.2. The new client defaults to TLS 1.3 only. Users who have not updated yet can still connect.',
            ticketExtra: 'VPN Admin Note: Client v7.2.1 defaults to TLS 1.3. Gateway 7.0.x only supports TLS 1.2. Options: (1) Configure client to allow TLS 1.2 as immediate fix, (2) Upgrade gateway firmware long-term. The client has a tls-min-version setting.',
            affectedHost: 0,
            fixDescription: 'Resolve TLS version mismatch between client and gateway',
            stateOverrides: { _clientMismatch: true, _tlsConflict: true }
        },
        {
            // Scenario 4: CRL Distribution Point Unreachable
            // The CRL web server (IIS on 10.0.2.20) is returning HTTP 503.
            // VPN gateway performs CRL checking on every auth attempt.
            // 30% of attempts fail when CRL check times out.
            id: 'crl_unreachable',
            name: 'CRL Unreachable',
            ticketSubject: 'VPN authentication intermittently failing — CRL distribution point unreachable',
            ticketDetail: 'VPN authentication is failing intermittently — about 30% of connection attempts fail with "Certificate revocation check failed." The VPN gateway checks the CRL on every connection. The CRL distribution point (http://crl.hexworth.local/ca.crl) is returning HTTP 503. When the CRL check times out after 10 seconds, auth fails.',
            ticketExtra: 'VPN Admin Note: CRL hosted on IIS (10.0.2.20) with high CPU from unrelated process. Options: (1) Restart the CRL web server application pool, (2) Configure OCSP as fallback, (3) Increase CRL cache time. Do NOT disable revocation checking entirely.',
            affectedHost: 0,
            fixDescription: 'Restore CRL distribution point availability',
            stateOverrides: { _crlDown: true, _webServerOverloaded: true }
        }
    ],

    // ==========================================================
    // PER-SCENARIO HINTS
    // ==========================================================

    _defaultHints: [
        { id: 'hint1', text: 'Open the Auth Dashboard to review failed login patterns and backend status.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal: show auth-log, show cert status, radius-test, mfa-check.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a different auth backend failure.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after restoring authentication.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        cert_invalid: [
            { id: 'hint1', text: '40 users have certs from the old intermediate CA (V1) that was decommissioned.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "show cert status" to see which CA signed the failing certificates.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The old V1 intermediate CA was removed from trust. Users need V2 certificates.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: cert reissue --ca v2 --batch affected — reissues all V1 certs from V2 CA.', cost: 150, penalty: -150 }
        ],
        radius_down: [
            { id: 'hint1', text: 'RADIUS server pings fine but service is not responding to auth requests.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "radius-test" to check service status. Run "show radius-log" for error details.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'FreeRADIUS failed to start after patching. Config syntax error in the updated module.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: radius-fix --validate-config --restart — fixes config and restarts the service.', cost: 150, penalty: -150 }
        ],
        mfa_desync: [
            { id: 'hint1', text: 'New hardware tokens generate codes rejected by server. Old tokens work fine.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "mfa-check" to see the clock drift between new tokens and the server.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'New tokens have 127-second clock drift. Server tolerance is 30 seconds. Need resync.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: mfa-resync --batch new-tokens — resynchronizes all new tokens with server time.', cost: 150, penalty: -150 }
        ],
        client_version: [
            { id: 'hint1', text: 'Client v7.2.1 uses TLS 1.3 only. Gateway only supports TLS 1.2. Handshake fails.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "show client-compat" to see the TLS version mismatch between client and gateway.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Quick fix: set the client minimum TLS version to 1.2 so it negotiates with the gateway.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: vpn-client set tls-min-version 1.2 — allows TLS 1.2 negotiation with gateway.', cost: 150, penalty: -150 }
        ],
        crl_unreachable: [
            { id: 'hint1', text: 'CRL web server returns HTTP 503 intermittently. CRL check timeout causes auth failure.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "crl-check" to test CRL distribution point availability and HTTP status.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'IIS app pool crashed under load. Restart it and enable OCSP as fallback.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: crl-fix --restart-iis --enable-ocsp — restarts CRL server and adds OCSP fallback.', cost: 150, penalty: -150 }
        ]
    },

    // ==========================================================
    // HELPERS
    // ==========================================================

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !VPN003Config._flagRestored) {
            VPN003Config._flagRestored = true;
            var scenario = VPN003Config._scenarios[engine.state._scenarioId];
            if (scenario) {
                VPN003Config.hints = VPN003Config._scenarioHints[scenario.id] || VPN003Config._defaultHints;
            }
        }
        return true;
    },

    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._scenarioSelected = true;

        engine.state._certInvalid = false;
        engine.state._oldCAUsed = false;
        engine.state._radiusDown = false;
        engine.state._configError = false;
        engine.state._mfaDesync = false;
        engine.state._tokenClockDrift = false;
        engine.state._clientMismatch = false;
        engine.state._tlsConflict = false;
        engine.state._crlDown = false;
        engine.state._webServerOverloaded = false;
        engine.state._labComplete = false;
        engine.state._flagRevealed = false;

        var overrides = VPN003Config._scenarios[idx].stateOverrides || {};
        for (var key in overrides) { engine.state[key] = overrides[key]; }

        var scenario = VPN003Config._scenarios[idx];
        VPN003Config._flagRestored = true;
        VPN003Config.hints = VPN003Config._scenarioHints[scenario.id] || VPN003Config._defaultHints;
        engine.save();
    },

    _getScenario(engine) {
        if (engine.state._scenarioId == null) return null;
        return VPN003Config._scenarios[engine.state._scenarioId];
    },

    _requireScenario(engine) {
        if (!engine.state._scenarioSelected) {
            return '\nERROR: No active auth incident assigned.\nOpen the VPN Alert first to receive your assignment.';
        }
        return null;
    },

    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    // ==========================================================
    // BOOT SEQUENCE
    // ==========================================================

    boot: {
        biosLines: [
            'Fortinet FortiGate 400F — POST...',
            'CPU: FortiASIC NP7 + CP9',
            'Memory: 16384 MB DDR4 OK',
            'SSL VPN Gateway — 200 concurrent sessions licensed',
            'RADIUS: 10.0.2.15 (primary) / 10.0.2.16 (decommissioned)',
            'MFA Provider: FortiToken TOTP',
            'Loading FortiOS v7.0.14...'
        ],
        grubEntries: ['FortiOS v7.0.14 (Primary)', 'FortiOS v7.0.12 (Backup)'],
        loginUser: 'VPN-Admin'
    },

    // ==========================================================
    // DESKTOP ICONS
    // ==========================================================

    desktop: {
        icons: [
            { id: 'cmd',            label: 'Auth\nTerminal',      icon: '>_',  app: 'terminal' },
            { id: 'auth_dashboard', label: 'Auth\nDashboard',     icon: 'AUTH', app: 'auth_dashboard' },
            { id: 'radius_mgr',    label: 'RADIUS\nManager',     icon: 'RAD', app: 'radius_mgr' },
            { id: 'cert_mgr',      label: 'Certificate\nManager', icon: 'CRT', app: 'cert_mgr' },
            { id: 'ticket',        label: 'VPN\nAlert',          icon: 'TKT', app: 'ticket' },
            { id: 'hints',         label: 'Hints',               icon: '?',   app: 'hints' },
            { id: 'reset',         label: 'Reset\nLab',          icon: 'RST', app: 'reset_lab' }
        ]
    },

    terminal: {
        user: 'VPN-Admin',
        hostname: 'VPN-GW-01',
        startDir: '/',
        promptStyle: 'cisco',
        welcome: 'FortiGate VPN-GW-01 v7.0.14 — SSL VPN Authentication Console\nType "help" for available commands.\n'
    },

    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [ { id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 } ],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },

    hints: [
        { id: 'hint1', text: 'Open the Auth Dashboard to review login failures.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use CLI: show auth-log, radius-test, mfa-check, crl-check.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a different auth backend issue.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after fixing the auth problem.', cost: 50, penalty: -50 }
    ],

    lore: {
        intro: 'The help desk is flooded with VPN authentication failures. Users cannot connect to the corporate SSL VPN. As the VPN administrator, diagnose the authentication backend and restore access.',
        scenario: 'Each scenario targets a different authentication component — certificates, RADIUS, MFA tokens, client compatibility, or certificate revocation checking.',
        outro: 'Authentication restored. Your troubleshooting identified the backend failure and restored secure VPN access for all affected users.'
    },

    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Review the auth alert and check login failure patterns.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify which auth component is failing using diagnostics.', requiredFlags: [], unlocks: ['remediate'], locked: true },
        { id: 'remediate', name: 'Remediation', description: 'Fix the auth backend — certs, RADIUS, MFA, TLS, or CRL.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm users can authenticate and capture the flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    // ==========================================================
    // COMMANDS
    // ==========================================================

    commands: {

        // show — displays auth logs, cert status, client compatibility
        'show': function(args, term, engine) {
            var gate = VPN003Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = VPN003Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            // show auth-log — recent authentication attempts
            if (joined.includes('auth')) {
                var failures = [];
                if (scenario && scenario.id === 'cert_invalid' && engine.state._certInvalid) {
                    failures = [
                        '08:00:15  kthompson   FAIL  Certificate Validation Failed (issuer not trusted)',
                        '08:00:22  jmorales    OK    Authenticated (cert: V2)',
                        '08:00:31  dpark       FAIL  Certificate Validation Failed (issuer not trusted)',
                        '08:00:45  mchen       FAIL  Certificate Validation Failed (issuer not trusted)',
                        '08:01:02  agarcia     OK    Authenticated (cert: V2)',
                        '--- 38 more FAIL entries with "issuer not trusted" ---'
                    ];
                } else if (scenario && scenario.id === 'radius_down' && engine.state._radiusDown) {
                    failures = [
                        '07:45:01  kthompson   FAIL  RADIUS timeout (10.0.2.15 — no response in 10s)',
                        '07:45:12  jmorales    FAIL  RADIUS timeout (10.0.2.15 — no response in 10s)',
                        '07:45:23  dpark       FAIL  RADIUS timeout (10.0.2.15 — no response in 10s)',
                        '07:45:34  mchen       FAIL  RADIUS timeout (10.0.2.15 — no response in 10s)',
                        '--- ALL users failing with RADIUS timeout ---'
                    ];
                } else if (scenario && scenario.id === 'mfa_desync' && engine.state._mfaDesync) {
                    failures = [
                        '08:02:01  bwilson     FAIL  Invalid OTP (token: TK-NEW-0042)',
                        '08:02:15  tlee        OK    Authenticated (token: TK-OLD-0189)',
                        '08:02:30  rjohnson    FAIL  Invalid OTP (token: TK-NEW-0055)',
                        '08:03:01  smarquez    FAIL  Invalid OTP (token: TK-NEW-0061)',
                        '--- 12 more FAIL entries, all TK-NEW tokens ---'
                    ];
                } else if (scenario && scenario.id === 'client_version' && engine.state._clientMismatch) {
                    failures = [
                        '08:05:01  kthompson   FAIL  SSL handshake failed (protocol version mismatch)',
                        '08:05:10  jmorales    OK    Authenticated (client v7.1.4)',
                        '08:05:22  dpark       FAIL  SSL handshake failed (protocol version mismatch)',
                        '08:05:35  mchen       FAIL  SSL handshake failed (protocol version mismatch)',
                        '--- ~120 users failing (client v7.2.1), ~80 OK (client v7.1.x) ---'
                    ];
                } else if (scenario && scenario.id === 'crl_unreachable' && engine.state._crlDown) {
                    failures = [
                        '08:10:01  kthompson   OK    Authenticated (CRL cache hit)',
                        '08:10:15  jmorales    FAIL  Certificate revocation check failed (HTTP 503)',
                        '08:10:30  dpark       OK    Authenticated (CRL cache hit)',
                        '08:10:42  mchen       FAIL  Certificate revocation check failed (timeout)',
                        '--- ~30% of attempts failing intermittently ---'
                    ];
                }

                if (!engine.state._labComplete && failures.length > 0) {
                    return '\nSSL VPN Authentication Log:\n=============================================================\n  ' + failures.join('\n  ');
                }
                return '\nSSL VPN Authentication Log:\n=============================================================\n  All recent authentications: SUCCESS\n  No failures detected.';
            }

            // show cert status — certificate chain and validity
            if (joined.includes('cert')) {
                if (scenario && scenario.id === 'cert_invalid' && engine.state._certInvalid && !engine.state._labComplete) {
                    return '\nCertificate Trust Chain:\n=============================================================\n  Root CA:         CN=Hexworth-Root-CA          [VALID]\n  Intermediate V1: CN=Hexworth-Intermediate-V1  [REMOVED from trust 2026-03-31 17:00]\n  Intermediate V2: CN=Hexworth-Intermediate-V2  [VALID]\n\n  Affected Users: 40 (certificates signed by V1)\n  Working Users:  160 (certificates signed by V2)\n\n  V1-signed certs will fail validation until reissued from V2.\n  Fix: cert reissue --ca v2 --batch affected';
                }
                return '\nCertificate Trust Chain:\n=============================================================\n  Root CA:         CN=Hexworth-Root-CA          [VALID]\n  Intermediate V2: CN=Hexworth-Intermediate-V2  [VALID]\n  All client certificates: VALID';
            }

            // show client-compat — TLS version compatibility
            if (joined.includes('client')) {
                if (scenario && scenario.id === 'client_version' && engine.state._clientMismatch && !engine.state._labComplete) {
                    return '\nClient Compatibility Report:\n=============================================================\n  VPN Gateway:    FortiOS v7.0.14\n  Supported TLS:  TLS 1.0, TLS 1.1, TLS 1.2\n  Max TLS:        1.2\n\n  Client v7.1.x:  TLS 1.2 (compatible)       ~80 users  OK\n  Client v7.2.1:  TLS 1.3 only (default)     ~120 users FAILING\n\n  [MISMATCH] Client v7.2.1 only offers TLS 1.3.\n  Gateway does not support TLS 1.3.\n  SSL handshake fails during protocol negotiation.\n\n  Quick fix: vpn-client set tls-min-version 1.2\n  Long-term: upgrade gateway firmware to support TLS 1.3.';
                }
                return '\nClient Compatibility Report:\n=============================================================\n  All clients compatible with gateway TLS configuration.';
            }

            // show radius-log — RADIUS server logs
            if (joined.includes('radius')) {
                if (scenario && scenario.id === 'radius_down' && engine.state._radiusDown && !engine.state._labComplete) {
                    return '\nRADIUS Server Log (10.0.2.15):\n=============================================================\n  [03:00:01] System: OS patch applied (Ubuntu 22.04 LTS)\n  [03:00:45] System: Reboot initiated\n  [03:01:30] System: Boot complete\n  [03:01:31] FreeRADIUS: Starting service...\n  [03:01:32] FreeRADIUS: ERROR — /etc/freeradius/mods-enabled/eap\n    Line 47: syntax error — unexpected token "tls_min_version"\n    (Introduced by package update 3.0.26-2ubuntu1)\n  [03:01:32] FreeRADIUS: FATAL — configuration validation failed\n  [03:01:32] FreeRADIUS: Service NOT started\n\n  Service Status: STOPPED (config error)\n  Fix: radius-fix --validate-config --restart';
                }
                return '\nRADIUS Server Log (10.0.2.15):\n=============================================================\n  FreeRADIUS: Running (PID 2847)\n  Uptime: 0d 2h 15m\n  Auth requests handled: 847\n  Status: HEALTHY';
            }

            return '\nAvailable show commands:\n  show auth-log         Recent authentication attempts\n  show cert status      Certificate chain and validity\n  show client-compat    Client/gateway TLS compatibility\n  show radius-log       RADIUS server logs';
        },

        // radius-test — tests RADIUS connectivity and authentication
        'radius-test': function(args, term, engine) {
            var gate = VPN003Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = VPN003Config._getScenario(engine);

            if (scenario && scenario.id === 'radius_down' && engine.state._radiusDown && !engine.state._labComplete) {
                return '\nRADIUS Connectivity Test:\n=============================================================\n  Server:     10.0.2.15:1812\n  ICMP Ping:  OK (1ms) — host is up\n  UDP 1812:   NO RESPONSE (timeout after 10s)\n  Service:    STOPPED\n\n  [FAILURE] RADIUS service is not running.\n  The host is up but FreeRADIUS did not start after last reboot.\n  Check "show radius-log" for startup errors.';
            }
            return '\nRADIUS Connectivity Test:\n=============================================================\n  Server:     10.0.2.15:1812\n  ICMP Ping:  OK (1ms)\n  UDP 1812:   RESPONDING (3ms)\n  Auth Test:  PASSED (test user authenticated)\n  Status:     HEALTHY';
        },

        // mfa-check — checks MFA token synchronization
        'mfa-check': function(args, term, engine) {
            var gate = VPN003Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = VPN003Config._getScenario(engine);

            if (scenario && scenario.id === 'mfa_desync' && engine.state._mfaDesync && !engine.state._labComplete) {
                return '\nMFA Token Synchronization Report:\n=============================================================\n  Server Time:   2026-04-01 08:15:33 UTC (NTP synced)\n  Tolerance:     30 seconds\n\n  Token Batch: TK-OLD (pre-2026)     185 tokens    SYNCED (avg drift: 2s)\n  Token Batch: TK-NEW (2026-03-25)   15 tokens     DESYNC (avg drift: 127s)\n\n  Affected Tokens:\n    TK-NEW-0042  drift: +131s  FAIL\n    TK-NEW-0055  drift: +124s  FAIL\n    TK-NEW-0061  drift: +129s  FAIL\n    ...(12 more with 120-135s drift)...\n\n  [DESYNC] New tokens initialized with wrong time.\n  Drift exceeds 30s tolerance — OTP codes are invalid.\n  Fix: mfa-resync --batch new-tokens';
            }
            return '\nMFA Token Synchronization Report:\n=============================================================\n  All tokens synchronized. Average drift: 2 seconds.\n  Status: HEALTHY';
        },

        // crl-check — tests CRL distribution point
        'crl-check': function(args, term, engine) {
            var gate = VPN003Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = VPN003Config._getScenario(engine);

            if (scenario && scenario.id === 'crl_unreachable' && engine.state._crlDown && !engine.state._labComplete) {
                return '\nCRL Distribution Point Check:\n=============================================================\n  URL:       http://crl.hexworth.local/ca.crl\n  Server:    10.0.2.20 (IIS 10.0)\n  HTTP GET:  503 Service Unavailable\n\n  Server Status:\n    ICMP:          OK (1ms)\n    CPU Usage:     98% (runaway w3wp.exe process)\n    IIS App Pool:  STOPPED (crashed due to memory pressure)\n    Last CRL:      Expired (stale for 6 hours)\n\n  OCSP Responder: NOT CONFIGURED\n\n  [FAILURE] CRL is unreachable. 30% of auth attempts fail.\n  Fix: crl-fix --restart-iis --enable-ocsp';
            }
            return '\nCRL Distribution Point Check:\n=============================================================\n  URL:    http://crl.hexworth.local/ca.crl\n  HTTP:   200 OK\n  CRL:    Valid (updated 2 hours ago)\n  OCSP:   Configured and responding\n  Status: HEALTHY';
        },

        // cert reissue — batch reissue certificates from new CA
        'cert': function(args, term, engine) {
            var gate = VPN003Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = VPN003Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (joined.includes('reissue') && joined.includes('v2')) {
                if (scenario && scenario.id === 'cert_invalid' && engine.state._certInvalid) {
                    engine.state._certInvalid = false;
                    engine.state._oldCAUsed = false;
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                    engine.save();
                    setTimeout(function() { engine.notify('Certificates reissued. All 40 users can now authenticate.', 'success'); }, 400);
                    return '\nBatch Certificate Reissuance:\n================================\n  Identifying V1-signed certificates... 40 found\n  Generating new CSRs... OK\n  Submitting to Hexworth-Intermediate-V2... OK\n  Signing 40 certificates... OK\n  Distributing via SCEP... OK\n\n  Results:\n    40/40 certificates reissued from V2 CA\n    All clients notified to reload certificates\n\n  Testing authentication...\n    kthompson: OK (V2 cert accepted)\n    dpark:     OK (V2 cert accepted)\n    mchen:     OK (V2 cert accepted)\n\n  All 40 users restored.\n\n=== FLAG: VPN003{cert_reissued_v2_40_users_restored} ===';
                }
            }
            return '\nUsage:\n  cert reissue --ca v2 --batch affected   Reissue V1 certs from V2\n  cert verify <user>                      Verify user certificate';
        },

        // radius-fix — fix RADIUS config and restart service
        'radius-fix': function(args, term, engine) {
            var gate = VPN003Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = VPN003Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (joined.includes('validate') && joined.includes('restart')) {
                if (scenario && scenario.id === 'radius_down' && engine.state._radiusDown) {
                    engine.state._radiusDown = false;
                    engine.state._configError = false;
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                    engine.save();
                    setTimeout(function() { engine.notify('RADIUS service restored. All users can authenticate.', 'success'); }, 400);
                    return '\nRADIUS Service Recovery:\n================================\n  Validating configuration...\n    /etc/freeradius/mods-enabled/eap line 47: syntax error\n    "tls_min_version" -> "tls_min_version = 1.2" (missing value)\n  Applying fix... OK\n  Validating config... PASSED\n\n  Restarting FreeRADIUS...\n    Service started (PID 3421)\n    Listening on 0.0.0.0:1812 (auth)\n    Listening on 0.0.0.0:1813 (acct)\n\n  Testing authentication...\n    radtest testuser: Access-Accept (OK)\n    VPN auth test:   PASSED\n\n  RADIUS service restored. Users can now authenticate.\n\n=== FLAG: VPN003{radius_config_fixed_service_restored} ===';
                }
            }
            return '\nUsage: radius-fix --validate-config --restart\nValidates FreeRADIUS config and restarts the service.';
        },

        // mfa-resync — resynchronize MFA tokens
        'mfa-resync': function(args, term, engine) {
            var gate = VPN003Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = VPN003Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (joined.includes('batch') && joined.includes('new')) {
                if (scenario && scenario.id === 'mfa_desync' && engine.state._mfaDesync) {
                    engine.state._mfaDesync = false;
                    engine.state._tokenClockDrift = false;
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                    engine.save();
                    setTimeout(function() { engine.notify('MFA tokens resynchronized. All 15 users restored.', 'success'); }, 400);
                    return '\nMFA Token Resynchronization:\n================================\n  Server Time:    2026-04-01 08:20:45 UTC (NTP)\n  Target Tokens:  15 (batch TK-NEW)\n\n  Resynchronizing...\n    TK-NEW-0042: drift +131s -> 0s  [SYNCED]\n    TK-NEW-0055: drift +124s -> 0s  [SYNCED]\n    TK-NEW-0061: drift +129s -> 0s  [SYNCED]\n    ...(12 more tokens resynchronized)...\n\n  Results: 15/15 tokens synchronized\n  Average drift after resync: 0.3 seconds\n\n  Testing authentication...\n    bwilson (TK-NEW-0042): OTP accepted\n    rjohnson (TK-NEW-0055): OTP accepted\n\n  All 15 users restored.\n\n=== FLAG: VPN003{mfa_tokens_resynced_15_users} ===';
                }
            }
            return '\nUsage: mfa-resync --batch new-tokens\nResynchronizes all desynchronized MFA tokens.';
        },

        // vpn-client set — configure VPN client TLS settings
        'vpn-client': function(args, term, engine) {
            var gate = VPN003Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = VPN003Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (joined.includes('set') && joined.includes('tls') && joined.includes('1.2')) {
                if (scenario && scenario.id === 'client_version' && engine.state._clientMismatch) {
                    engine.state._clientMismatch = false;
                    engine.state._tlsConflict = false;
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                    engine.save();
                    setTimeout(function() { engine.notify('TLS compatibility restored. All clients can connect.', 'success'); }, 400);
                    return '\nVPN Client TLS Policy Update:\n================================\n  Pushing GPO update to all v7.2.1 clients...\n    tls-min-version: 1.3 -> 1.2\n    Affected clients: ~120\n\n  Policy applied via SCCM...\n    Clients notified: 120\n    Clients updated:  120\n\n  Testing SSL handshake...\n    Client v7.2.1 -> Gateway v7.0.14:\n    Offered: TLS 1.2, TLS 1.3\n    Negotiated: TLS 1.2 (AES-256-GCM)\n    Handshake: SUCCESS\n\n  All 120 affected users can now connect.\n\n=== FLAG: VPN003{tls_compat_restored_v12_fallback} ===';
                }
            }
            return '\nUsage: vpn-client set tls-min-version 1.2\nConfigures VPN client minimum TLS version via GPO.';
        },

        // crl-fix — restart CRL web server and enable OCSP
        'crl-fix': function(args, term, engine) {
            var gate = VPN003Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = VPN003Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (joined.includes('restart') && joined.includes('ocsp')) {
                if (scenario && scenario.id === 'crl_unreachable' && engine.state._crlDown) {
                    engine.state._crlDown = false;
                    engine.state._webServerOverloaded = false;
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                    engine.save();
                    setTimeout(function() { engine.notify('CRL restored and OCSP enabled. Auth failures resolved.', 'success'); }, 400);
                    return '\nCRL Recovery:\n================================\n  Killing runaway process (w3wp.exe PID 4892, 98% CPU)... OK\n  Recycling IIS Application Pool "CRL-Pool"... OK\n  Waiting for IIS startup...\n  IIS App Pool: STARTED\n\n  Testing CRL endpoint...\n    GET http://crl.hexworth.local/ca.crl: 200 OK\n    CRL size: 12,847 bytes\n    CRL valid until: 2026-04-08 00:00:00 UTC\n\n  Enabling OCSP responder as fallback...\n    OCSP URL: http://ocsp.hexworth.local\n    OCSP signing cert: Loaded\n    OCSP status: RESPONDING\n\n  VPN gateway updated: CRL primary + OCSP fallback\n  Auth test: PASSED (revocation check: 2ms via OCSP)\n\n=== FLAG: VPN003{crl_restored_ocsp_fallback_enabled} ===';
                }
            }
            return '\nUsage: crl-fix --restart-iis --enable-ocsp\nRestarts CRL web server and enables OCSP as fallback.';
        },

        help: function() {
            return '\nAvailable Commands:\n=============================================================\n  show auth-log           Authentication log\n  show cert status        Certificate chain status\n  show client-compat      Client/gateway compatibility\n  show radius-log         RADIUS server logs\n  radius-test             Test RADIUS connectivity\n  mfa-check               Check MFA token sync status\n  crl-check               Test CRL distribution point\n  cert reissue ...        Batch reissue certificates\n  radius-fix ...          Fix and restart RADIUS\n  mfa-resync ...          Resynchronize MFA tokens\n  vpn-client set ...      Configure client TLS policy\n  crl-fix ...             Restore CRL and enable OCSP\n  ping <target>           ICMP ping\n  cls                     Clear screen';
        },

        ping: function(args, term, engine) {
            var gate = VPN003Config._requireScenario(engine);
            if (gate) return gate;
            if (!args.length) return '\nUsage: ping <target>';
            var target = args[0];
            if (target === '10.0.2.15') {
                return '\nPING 10.0.2.15 (RADIUS): 56 data bytes\n64 bytes from 10.0.2.15: icmp_seq=1 ttl=64 time=1ms\nHost is UP (but RADIUS service may not be running).';
            }
            return '\nPING ' + target + ': 56 data bytes\n64 bytes from ' + target + ': icmp_seq=1 ttl=64 time=1ms';
        },

        whoami: function() { return 'VPN-Admin@VPN-GW-01'; },
        hostname: function() { return 'VPN-GW-01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; }
    },

    // ==========================================================
    // CUSTOM WINDOW HANDLERS
    // ==========================================================

    onAppLaunch(iconDef, engine) {
        var requireTicket = ['auth_dashboard', 'radius_mgr', 'cert_mgr'];
        if (requireTicket.includes(iconDef.app) && !engine.state._scenarioSelected) {
            engine.notify('Open the VPN Alert first to receive your assignment.', 'error');
            return;
        }
        switch (iconDef.app) {
            case 'ticket':         VPN003Config._openTicket(iconDef, engine); break;
            case 'auth_dashboard': VPN003Config._openAuthDashboard(iconDef, engine); break;
            case 'radius_mgr':    VPN003Config._openInfoWindow(iconDef, engine, 'RADIUS Manager', 'RAD'); break;
            case 'cert_mgr':      VPN003Config._openInfoWindow(iconDef, engine, 'Certificate Manager', 'CRT'); break;
            case 'reset_lab':     VPN003Config._confirmReset(engine); break;
        }
    },

    // ==========================================================
    // TICKET WINDOW
    // ==========================================================

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'VPN Auth Alert', 'TKT', c);
        VPN003Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) { VPN003Config._renderTicket(engine, c); }
        else { VPN003Config._renderPicker(engine, c); }
    },

    _renderPicker(engine, container) {
        var previews = [
            'VPN Admin — "40 users: Certificate Validation Failed after CA migration"',
            'VPN Admin — "All users: RADIUS timeout — service failed after OS patch"',
            'VPN Admin — "15 users: Invalid OTP codes with new hardware TOTP tokens"',
            'VPN Admin — "60% users: SSL handshake failed after client update to v7.2.1"',
            'VPN Admin — "30% intermittent: CRL distribution point returning HTTP 503"'
        ];
        var html = '<div style="text-align:center; margin-bottom:20px;">'
            + '<div style="color:#7c3aed; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">AUTH FAILURE QUEUE</div>'
            + '<div style="color:#888; font-size:0.75rem;">Select an auth incident to investigate, or let the system assign one randomly.</div></div><div style="margin-bottom:16px;">';

        VPN003Config._scenarios.forEach(function(s, i) {
            html += '<button class="vpn-scenario-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer; transition:border-color 0.2s;">'
                + '<div style="display:flex; justify-content:space-between; align-items:center;">'
                + '<span style="color:#7c3aed; font-weight:bold;">AUTH-' + (3000 + i) + '</span>'
                + '<span style="background:#dc2626; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">CRITICAL</span></div>'
                + '<div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div></button>';
        });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;">'
            + '<button id="vpnRandomBtn" style="padding:10px 28px; background:#7c3aed; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.85rem; font-family:Consolas,monospace;">Random Assignment</button></div>';

        container.innerHTML = html;
        container.querySelectorAll('.vpn-scenario-btn').forEach(function(btn) {
            btn.addEventListener('mouseenter', function() { this.style.borderColor = '#7c3aed'; });
            btn.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.12)'; });
            btn.addEventListener('click', function() {
                VPN003Config._applyScenario(engine, parseInt(this.getAttribute('data-idx')));
                VPN003Config._renderTicket(engine, container);
            });
        });
        document.getElementById('vpnRandomBtn').addEventListener('click', function() {
            VPN003Config._applyScenario(engine, Math.floor(Math.random() * VPN003Config._scenarios.length));
            VPN003Config._renderTicket(engine, container);
        });
    },

    _renderTicket(engine, container) {
        var scenario = VPN003Config._getScenario(engine);
        var alert = VPN003Config._alerts[0];
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;">'
            + '<div style="display:flex; justify-content:space-between; align-items:center;">'
            + '<span style="color:#7c3aed; font-weight:bold; font-size:1rem;">INCIDENT #AUTH-' + (3000 + engine.state._scenarioId) + '</span>'
            + '<span style="background:#dc2626; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">CRITICAL</span></div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">GATEWAY</div>'
            + '<div style="font-weight:bold; color:#7c3aed;">' + alert.host + ' (' + alert.engine + ')</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBJECT</div>'
            + '<div style="font-weight:bold;">' + VPN003Config._escHtml(scenario.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DESCRIPTION</div>'
            + '<div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">'
            + VPN003Config._escHtml(scenario.ticketDetail) + '</div></div>'
            + (scenario.ticketExtra ? '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">ADMIN NOTES</div>'
            + '<div style="background:rgba(124,58,237,0.08); border:1px solid rgba(124,58,237,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#c4b5fd;">'
            + VPN003Config._escHtml(scenario.ticketExtra) + '</div></div>' : '')
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;">'
            + '<div style="color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU — VPN Administrator</div></div>';
    },

    // ==========================================================
    // AUTH DASHBOARD
    // ==========================================================

    _openAuthDashboard(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.id = 'authDashContainer';
        container.style.cssText = 'padding:16px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Auth Dashboard', 'AUTH', container);

        var scenario = VPN003Config._getScenario(engine);
        var html = '<div style="color:#7c3aed; font-weight:bold; font-size:1rem; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">SSL VPN Auth Dashboard</div>';

        // Backend service status
        var services = [
            { name: 'RADIUS (10.0.2.15)', status: (scenario && scenario.id === 'radius_down' && engine.state._radiusDown && !engine.state._labComplete) ? 'DOWN' : 'UP' },
            { name: 'MFA (FortiToken TOTP)', status: (scenario && scenario.id === 'mfa_desync' && engine.state._mfaDesync && !engine.state._labComplete) ? 'DEGRADED' : 'UP' },
            { name: 'CRL (crl.hexworth.local)', status: (scenario && scenario.id === 'crl_unreachable' && engine.state._crlDown && !engine.state._labComplete) ? 'DOWN' : 'UP' },
            { name: 'Certificate Chain', status: (scenario && scenario.id === 'cert_invalid' && engine.state._certInvalid && !engine.state._labComplete) ? 'ISSUE' : 'VALID' }
        ];

        html += '<div style="margin-bottom:16px;"><div style="color:#7c3aed; font-weight:bold; font-size:0.85rem; margin-bottom:8px;">Backend Services</div>';
        services.forEach(function(svc) {
            var color = svc.status === 'UP' || svc.status === 'VALID' ? '#22c55e' : '#dc2626';
            html += '<div style="display:flex; justify-content:space-between; padding:8px 12px; margin-bottom:4px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px;">'
                + '<span>' + svc.name + '</span><span style="color:' + color + '; font-weight:bold;">' + svc.status + '</span></div>';
        });
        html += '</div>';

        // Auth stats
        var failRate = engine.state._labComplete ? '0%' : (scenario && scenario.id === 'radius_down' ? '100%' : (scenario && scenario.id === 'crl_unreachable' ? '30%' : '20-60%'));
        html += '<div style="padding:12px; margin-bottom:16px; background:rgba(' + (engine.state._labComplete ? '34,197,94' : '220,38,38') + ',0.08); border:1px solid rgba(' + (engine.state._labComplete ? '34,197,94' : '220,38,38') + ',0.2); border-radius:4px; text-align:center;">'
            + '<div style="color:#888; font-size:0.75rem;">Auth Failure Rate</div>'
            + '<div style="color:' + (engine.state._labComplete ? '#22c55e' : '#dc2626') + '; font-weight:bold; font-size:1.2rem;">' + failRate + '</div></div>';

        if (engine.state._flagRevealed) {
            html += '<div style="padding:12px; background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.2); border-radius:4px; text-align:center;">'
                + '<div style="color:#22c55e; font-weight:bold;">AUTHENTICATION RESTORED</div></div>';
        }

        html += '<div style="margin-top:12px; color:#888; font-size:0.75rem;">Use "show auth-log" in the terminal for detailed logs.</div>';
        container.innerHTML = html;
    },

    // ==========================================================
    // GENERIC INFO WINDOW (RADIUS/Cert managers)
    // ==========================================================

    _openInfoWindow(iconDef, engine, title, iconLabel) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.style.cssText = 'padding:16px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, title, iconLabel, c);
        c.innerHTML = '<div style="color:#7c3aed; font-weight:bold; font-size:1rem; margin-bottom:12px;">' + title + '</div>'
            + '<div style="color:#888;">Use terminal commands for detailed diagnostics and remediation.</div>';
    },

    _confirmReset(engine) {
        if (confirm('Reset this lab? All progress will be lost.')) { engine.resetLab(); }
    }
};
