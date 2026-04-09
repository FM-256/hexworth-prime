/* ============================================================
   DISPATCH LAB — Box EM004: Mobile Mail Setup
   CompTIA A+ Core 2 — Mobile Email Configuration
   Config: wrong server, untrusted cert, modern auth, app password,
   conditional access
   5 distinct scenarios
   ============================================================ */

var EM004Config = {

    title: 'Mobile Mail Setup',
    subtitle: 'Phone Won\'t Sync — Mobile Email Troubleshooting',
    difficulty: 'Beginner',
    accent: '#22c55e',
    storageKey: 'hexworth_lab_em004',
    registryId: 'em004-mobile-mail',
    trackerKey: 'lab_em004',
    tutorialMode: true,

    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the mobile email complaint.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check Mobile Device Console', tip: 'Review ActiveSync devices, connection logs, and policy compliance.', trigger: { event: 'window_open', match: { type: 'mdm_console' } } },
            { title: 'Investigate', tip: 'Use mobile-diag, cert-check, auth-test, and policy-check to find the issue.', trigger: { event: 'command', match: { cmd: 'contains:mobile-diag' }, alt: [{ event: 'command', match: { cmd: 'contains:cert-check' } }, { event: 'command', match: { cmd: 'contains:auth-test' } }] } },
            { title: 'Apply the fix', tip: 'Correct the server name, certificate, auth method, or compliance setting.', trigger: { event: 'command', match: { cmd: 'contains:mobile-fix' } } },
            { title: 'Capture the flag', tip: 'After fixing the mobile mail, the flag appears.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: {
        certPath: 'A+ Core 2',
        mappings: [
            { flagId: 'fixed', objective: '1.6', description: 'Configure email client settings', skill: 'ActiveSync and Mobile Mail Setup' },
            { flagId: 'fixed', objective: '3.4', description: 'Troubleshoot common mobile OS problems', skill: 'Mobile Device Email Configuration' }
        ]
    },

    _scenarioFlags: { wrong_server: null, bad_cert: null, modern_auth: null, app_password: null, conditional_access: null },

    _scenarios: [
        {
            id: 'wrong_server',
            name: 'ActiveSync Wrong Server',
            ticketSubject: 'New employee can\'t set up email on phone — "Cannot verify server identity"',
            ticketDetail: 'New hire Marcus Lee is trying to set up his corporate email on his iPhone. He went to Settings > Mail > Add Account > Exchange and entered his credentials. The phone says "Cannot verify server identity" and then "Unable to verify account information." He typed the server name as "mail.hexworth.local" which is the internal DNS name — not the external one.',
            ticketExtra: 'IT Note: Internal DNS name "mail.hexworth.local" is not resolvable from outside the corporate network. Mobile devices need the external hostname: "outlook.hexworth.com". The SSL certificate is issued for "outlook.hexworth.com" so using the internal name also causes a certificate mismatch.',
            affectedUser: 'mlee',
            fixDescription: 'Correct ActiveSync server name to external hostname',
            stateOverrides: { _wrongServer: true, _configuredServer: 'mail.hexworth.local', _correctServer: 'outlook.hexworth.com' }
        },
        {
            id: 'bad_cert',
            name: 'Certificate Not Trusted',
            ticketSubject: 'User gets SSL certificate warning on phone when checking email',
            ticketDetail: 'Sales rep Jennifer Park reports her Android phone started showing "Certificate is not trusted" warnings when syncing email. She\'s been using the phone for 6 months without issues. The warning appeared yesterday. She can tap "Trust" to continue but it comes back every time she opens the mail app. She\'s worried about security.',
            ticketExtra: 'IT Note: The SSL certificate for outlook.hexworth.com was renewed last week. The new certificate was issued by a different CA (Let\'s Encrypt instead of DigiCert). The Android device may not have the Let\'s Encrypt root CA in its trust store, OR the certificate chain is incomplete (missing intermediate certificate). Check cert-check for chain validation.',
            affectedUser: 'jpark',
            fixDescription: 'Fix certificate chain by installing intermediate certificate on server',
            stateOverrides: { _badCert: true, _missingIntermediate: true }
        },
        {
            id: 'modern_auth',
            name: 'Modern Auth Required',
            ticketSubject: 'User\'s old Android phone stopped syncing — "Authentication failed"',
            ticketDetail: 'Warehouse manager Bill Thompson\'s Android 8.0 phone stopped syncing email last night. He gets "Authentication failed" errors even though his password is correct. His desktop Outlook works fine with the same credentials. The phone was working yesterday. Bill\'s phone uses the built-in Android Email app (not Outlook for Android).',
            ticketExtra: 'IT Note: IT Security pushed a policy change last night disabling Basic Authentication for ActiveSync. The built-in Email app on Android 8.0 only supports Basic Auth — it cannot do OAuth/Modern Auth. Options: (1) Install the Outlook mobile app which supports Modern Auth, (2) Use a different app that supports OAuth. The built-in email app on old Android versions cannot be fixed.',
            affectedUser: 'bthompson',
            fixDescription: 'Install Outlook mobile app that supports Modern Authentication',
            stateOverrides: { _basicAuthDisabled: true, _oldAndroid: true }
        },
        {
            id: 'app_password',
            name: 'App Password Needed',
            ticketSubject: 'Thunderbird on old laptop can\'t authenticate — MFA blocks it',
            ticketDetail: 'Research scientist Dr. Chen uses Thunderbird mail client on her Linux laptop (lab equipment control machine that can\'t run Outlook). After MFA was enabled on her account, Thunderbird stopped authenticating. It keeps prompting for her password but even the correct password fails. Thunderbird doesn\'t support the MFA prompt/OAuth flow.',
            ticketExtra: 'IT Note: Legacy mail clients that don\'t support OAuth/Modern Auth need an App Password when MFA is enabled. An App Password is a one-time generated password that bypasses MFA for that specific app. Generate one from the user\'s security settings and configure it in Thunderbird instead of the regular password.',
            affectedUser: 'dchen',
            fixDescription: 'Generate an App Password for Thunderbird',
            stateOverrides: { _needsAppPassword: true }
        },
        {
            id: 'conditional_access',
            name: 'Conditional Access Blocking',
            ticketSubject: 'VP\'s new personal iPad can\'t access email — "Your device doesn\'t meet compliance"',
            ticketDetail: 'VP of Marketing Susan Walsh got a new personal iPad and wants to access her corporate email. When she tries to sign in to the Outlook app, she gets: "Your sign-in was successful but your device doesn\'t meet your organization\'s compliance policy." Her iPhone (which is enrolled in MDM) works fine. The iPad is brand new and not enrolled in MDM.',
            ticketExtra: 'IT Note: Conditional Access policy requires devices accessing corporate email to be MDM-enrolled (Intune) and compliant. The iPad is not enrolled in Intune. Options: (1) Enroll the iPad in Intune and ensure compliance (passcode, encryption, OS version), (2) Use Outlook web access (OWA) which has different CA policies. Personal devices must meet minimum security requirements.',
            affectedUser: 'swalsh',
            fixDescription: 'Enroll iPad in Intune MDM to meet compliance requirements',
            stateOverrides: { _notCompliant: true, _notEnrolled: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Check the MDM Console for device sync status and compliance.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use mobile-diag, cert-check, auth-test, policy-check to investigate.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each mobile issue has a different cause: config, cert, auth, or policy.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Use mobile-fix to apply the correction.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        wrong_server: [
            { id: 'hint1', text: 'Use "mobile-diag mlee" to see his ActiveSync configuration.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Server is set to mail.hexworth.local (internal). Needs to be outlook.hexworth.com (external).', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Fix: "mobile-fix --server mlee outlook.hexworth.com"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: mobile-fix --server mlee outlook.hexworth.com', cost: 150, penalty: -150 }
        ],
        bad_cert: [
            { id: 'hint1', text: 'Use "cert-check outlook.hexworth.com" to validate the SSL certificate chain.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The intermediate certificate is missing from the chain. Some devices can\'t build the trust path.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Fix: "mobile-fix --install-intermediate" to add the missing cert to the server.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: mobile-fix --install-intermediate', cost: 150, penalty: -150 }
        ],
        modern_auth: [
            { id: 'hint1', text: 'Use "auth-test bthompson" to check authentication method compatibility.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Basic Auth is disabled. The built-in Email app can\'t do OAuth. Need Outlook mobile app.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Fix: "mobile-fix --install-outlook bthompson"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: mobile-fix --install-outlook bthompson', cost: 150, penalty: -150 }
        ],
        app_password: [
            { id: 'hint1', text: 'Use "auth-test dchen" to check why authentication is failing.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'MFA is enabled but Thunderbird doesn\'t support OAuth. Need an App Password.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Generate one: "mobile-fix --app-password dchen thunderbird"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: mobile-fix --app-password dchen thunderbird', cost: 150, penalty: -150 }
        ],
        conditional_access: [
            { id: 'hint1', text: 'Use "policy-check swalsh" to see device compliance status.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The iPad is not enrolled in Intune MDM. CA policy requires enrollment.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Enroll: "mobile-fix --enroll-mdm swalsh ipad"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: mobile-fix --enroll-mdm swalsh ipad', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !EM004Config._flagRestored) { EM004Config._flagRestored = true; var s = EM004Config._scenarios[engine.state._scenarioId]; if (s) EM004Config.hints = EM004Config._scenarioHints[s.id] || EM004Config._defaultHints; } return true; },
    _applyScenario(engine, idx) { engine.state._scenarioId = idx; engine.state._scenarioSelected = true; engine.state._wrongServer = false; engine.state._badCert = false; engine.state._basicAuthDisabled = false; engine.state._needsAppPassword = false; engine.state._notCompliant = false; engine.state._labComplete = false; engine.state._flagRevealed = false; var o = EM004Config._scenarios[idx].stateOverrides || {}; for (var k in o) engine.state[k] = o[k]; EM004Config._flagRestored = true; EM004Config.hints = EM004Config._scenarioHints[EM004Config._scenarios[idx].id] || EM004Config._defaultHints; engine.save(); },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : EM004Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Help Desk Ticket first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['UEFI BIOS v2.20', 'Memory: 16384 MB OK', 'Loading Windows...'], grubEntries: ['Windows 10 Pro'], loginUser: 'Technician' },
    desktop: { icons: [{ id: 'cmd', label: 'Command\nPrompt', icon: '>_', app: 'terminal' }, { id: 'mdm', label: 'MDM\nConsole', icon: 'MDM', app: 'mdm_console' }, { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }] },
    terminal: { user: 'Technician', hostname: 'HELPDESK01', startDir: 'C:\\Users\\Technician', promptStyle: 'windows', welcome: 'Microsoft Windows [Version 10.0.19045.3803]\n(c) Microsoft Corporation.\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [{ id: 'hint1', text: 'Check MDM Console.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'Use diagnostic tools.', cost: 10, penalty: -10 }, { id: 'hint3', text: 'Each issue has a different cause.', cost: 25, penalty: -25 }, { id: 'hint4', text: 'Use mobile-fix.', cost: 50, penalty: -50 }],
    lore: { intro: 'Phones won\'t sync. Mobile email setup failures are piling up. From wrong server names to certificate warnings and authentication blocks, fix them all.', scenario: 'Each scenario covers a different mobile email configuration challenge.', outro: 'Mobile mail flowing. All devices are syncing properly.' },
    phases: [{ id: 'investigate', name: 'Investigation', description: 'Read the ticket.', requiredFlags: [], unlocks: ['diagnose'], locked: false }, { id: 'diagnose', name: 'Diagnosis', description: 'Find root cause.', requiredFlags: [], unlocks: ['fix'], locked: true }, { id: 'fix', name: 'Fix', description: 'Apply fix.', requiredFlags: [], unlocks: ['verify'], locked: true }, { id: 'verify', name: 'Verification', description: 'Confirm sync.', requiredFlags: ['fixed'], unlocks: [], locked: true }],

    commands: {
        'mobile-diag': function(args, term, engine) {
            var gate = EM004Config._requireScenario(engine); if (gate) return gate;
            var scenario = EM004Config._getScenario(engine); var target = args[0] || '';
            if (scenario && scenario.id === 'wrong_server' && target === 'mlee') {
                return '\nMobile Device Diagnostics — mlee\n==================================\n  Device: iPhone 15 (iOS 17.4)\n  Mail App: Built-in Mail (Exchange)\n  Configured Server: mail.hexworth.local [!] INTERNAL NAME\n  Connection Status: FAILED\n  Error: DNS resolution failed (mail.hexworth.local not resolvable externally)\n  SSL Status: Certificate mismatch (cert is for outlook.hexworth.com)\n\n  [!] Server should be: outlook.hexworth.com (external hostname)\n  [!] Internal DNS names are only resolvable on the corporate network';
            }
            return '\nUsage: mobile-diag <username>';
        },

        'cert-check': function(args, term, engine) {
            var gate = EM004Config._requireScenario(engine); if (gate) return gate;
            var scenario = EM004Config._getScenario(engine); var target = args.join(' ').toLowerCase();
            if (scenario && scenario.id === 'bad_cert' && target.includes('outlook.hexworth.com')) {
                return '\nSSL Certificate Check — outlook.hexworth.com\n=============================================\n  Subject: CN=outlook.hexworth.com\n  Issuer: Let\'s Encrypt Authority X3\n  Valid: 2026-03-22 to 2026-06-20\n  Key: RSA 2048-bit\n\n  Certificate Chain:\n    [1] outlook.hexworth.com (leaf)     OK\n    [2] Let\'s Encrypt Authority X3      MISSING [!]\n    [3] ISRG Root X1 (root)             OK (in most trust stores)\n\n  [!] INTERMEDIATE CERTIFICATE MISSING FROM SERVER\n  [!] Some devices cannot build trust chain without it\n  [!] Desktop browsers auto-fetch intermediates; mobile devices often cannot\n  [!] Fix: Install the intermediate cert on the mail server';
            }
            return '\nUsage: cert-check <hostname>';
        },

        'auth-test': function(args, term, engine) {
            var gate = EM004Config._requireScenario(engine); if (gate) return gate;
            var scenario = EM004Config._getScenario(engine); var target = args[0] || '';
            if (scenario && scenario.id === 'modern_auth' && target === 'bthompson') {
                return '\nAuthentication Test — bthompson\n================================\n  Password: CORRECT\n  MFA Status: Enabled\n  OAuth/Modern Auth: NOT SUPPORTED by client\n  Basic Auth: DISABLED (policy change 2026-03-28 23:00)\n\n  Device: Android 8.0 — Built-in Email App\n  App OAuth Support: NO\n\n  [!] Basic Auth was disabled last night\n  [!] Built-in Email on Android 8.0 only supports Basic Auth\n  [!] User needs Outlook for Android (supports Modern Auth/OAuth)';
            }
            if (scenario && scenario.id === 'app_password' && target === 'dchen') {
                return '\nAuthentication Test — dchen\n============================\n  Password: CORRECT\n  MFA Status: Enabled (TOTP authenticator)\n  Client: Thunderbird 115.x on Linux\n  OAuth Support: PARTIAL (not configured)\n  Basic Auth: BLOCKED by MFA requirement\n\n  [!] Thunderbird cannot complete MFA challenge\n  [!] Solution: Generate an App Password for this client\n  [!] App Passwords bypass MFA for specific applications';
            }
            return '\nUsage: auth-test <username>';
        },

        'policy-check': function(args, term, engine) {
            var gate = EM004Config._requireScenario(engine); if (gate) return gate;
            var scenario = EM004Config._getScenario(engine); var target = args[0] || '';
            if (scenario && scenario.id === 'conditional_access' && target === 'swalsh') {
                return '\nConditional Access Policy Check — swalsh\n==========================================\n  Registered Devices:\n    iPhone 14 Pro — Enrolled in Intune, COMPLIANT\n    iPad Air (new) — NOT ENROLLED in Intune\n\n  Policy: "Require Compliant Device for Email Access"\n    Applies to: Exchange Online, SharePoint Online\n    Requirement: Device must be MDM-enrolled and compliant\n    iPad Status: BLOCKED (not enrolled)\n\n  Compliance Requirements:\n    - MDM enrollment (Intune)\n    - Passcode: 6+ digits\n    - Encryption: Enabled\n    - OS Version: iOS 16+ or iPadOS 16+\n    - Jailbreak: Not allowed\n\n  [!] iPad needs Intune enrollment to access corporate email';
            }
            return '\nUsage: policy-check <username>';
        },

        'mobile-fix': function(args, term, engine) {
            var gate = EM004Config._requireScenario(engine); if (gate) return gate;
            var scenario = EM004Config._getScenario(engine); var joined = args.join(' ').toLowerCase();

            if (scenario && scenario.id === 'wrong_server' && joined.includes('--server') && joined.includes('mlee') && joined.includes('outlook.hexworth.com')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('ActiveSync server corrected. Email syncing on iPhone.', 'success'); }, 400);
                return '\nMobile Config Fix — mlee\n=========================\n  Updating ActiveSync server: mail.hexworth.local -> outlook.hexworth.com\n  Testing connection... OK\n  SSL Certificate: VALID (matches outlook.hexworth.com)\n  Authentication: SUCCESS\n  Initial Sync: Started (14 days of email)\n\n  Marcus\'s iPhone is now syncing email, calendar, and contacts.\n\n=== FLAG: EM004{wrong_server_external_hostname} ===';
            }
            if (scenario && scenario.id === 'bad_cert' && joined.includes('--install-intermediate')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Intermediate certificate installed. SSL warnings resolved.', 'success'); }, 400);
                return '\nSSL Certificate Fix\n====================\n  Downloading Let\'s Encrypt Authority X3 intermediate cert... OK\n  Installing on mail server... OK\n  Restarting HTTPS service... OK\n  Verifying chain: Root -> Intermediate -> Leaf... COMPLETE\n\n  All mobile devices will now see a valid certificate chain.\n  Jennifer\'s Android should stop showing trust warnings.\n\n=== FLAG: EM004{bad_cert_intermediate_installed} ===';
            }
            if (scenario && scenario.id === 'modern_auth' && joined.includes('--install-outlook') && joined.includes('bthompson')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Outlook mobile installed. Modern Auth working.', 'success'); }, 400);
                return '\nMobile App Fix — bthompson\n===========================\n  Sending Outlook for Android install link via SMS... OK\n  Removing old email account from built-in app... OK\n\n  Instructions sent to Bill:\n  1. Install "Microsoft Outlook" from Play Store\n  2. Sign in with bthompson@corp.hexworth.local\n  3. Complete MFA challenge on first sign-in\n  4. Outlook will auto-configure ActiveSync with Modern Auth\n\n  The built-in Email app on Android 8.0 cannot support OAuth.\n  Outlook for Android handles Modern Auth natively.\n\n=== FLAG: EM004{modern_auth_outlook_installed} ===';
            }
            if (scenario && scenario.id === 'app_password' && joined.includes('--app-password') && joined.includes('dchen')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('App Password generated. Thunderbird can now authenticate.', 'success'); }, 400);
                return '\nApp Password Generation — dchen\n================================\n  Generating App Password for "Thunderbird" on dchen\'s account... OK\n  App Password: axbf-qwer-jklm-nopz\n\n  Instructions for Dr. Chen:\n  1. Open Thunderbird > Account Settings > Server Settings\n  2. Replace current password with: axbf-qwer-jklm-nopz\n  3. This password bypasses MFA for Thunderbird only\n  4. Regular password + MFA still required for all other logins\n\n  Note: App Passwords are device/app-specific and can be revoked individually.\n\n=== FLAG: EM004{app_password_legacy_client} ===';
            }
            if (scenario && scenario.id === 'conditional_access' && joined.includes('--enroll-mdm') && joined.includes('swalsh')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('iPad enrolled in Intune. Compliance met, email access granted.', 'success'); }, 400);
                return '\nMDM Enrollment — swalsh (iPad Air)\n====================================\n  Sending Intune enrollment invitation to swalsh... OK\n  Enrollment profile: "Corporate BYOD"\n  Requirements check:\n    Passcode (6+ digits): SET\n    Encryption: ENABLED\n    iPadOS version: 17.4 (meets 16+ requirement)\n    Jailbreak: NOT detected\n\n  Compliance Status: COMPLIANT\n  Conditional Access: ACCESS GRANTED\n\n  Susan\'s iPad can now access corporate email via Outlook.\n\n=== FLAG: EM004{conditional_access_mdm_enrolled} ===';
            }

            return '\nUsage: mobile-fix [action]\n  --server <user> <hostname>       Fix ActiveSync server\n  --install-intermediate           Install missing SSL cert\n  --install-outlook <user>         Deploy Outlook mobile\n  --app-password <user> <app>      Generate App Password\n  --enroll-mdm <user> <device>     Enroll device in MDM';
        },

        whoami: function() { return 'HELPDESK01\\Technician'; },
        hostname: function() { return 'HELPDESK01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        ifconfig: function() { return '\'ifconfig\' is not recognized.'; },
        grep: function() { return '\'grep\' is not recognized.'; },
        sudo: function() { return '\'sudo\' is not recognized.'; }
    },

    onAppLaunch(iconDef, engine) {
        if (iconDef.app === 'mdm_console' && !engine.state._scenarioSelected) { engine.notify('Open the ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': EM004Config._openTicket(iconDef, engine); break;
            case 'mdm_console': EM004Config._openMDM(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset?')) engine.resetLab(); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        EM004Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) { EM004Config._renderTicket(engine, c); } else { EM004Config._renderPicker(engine, c); }
    },

    _renderPicker(engine, container) {
        var p = ['Marcus Lee — "Can\'t set up email on new iPhone — server identity error"', 'Jennifer Park — "SSL certificate warning on Android phone"', 'Bill Thompson — "Phone stopped syncing after auth policy change"', 'Dr. Chen — "Thunderbird can\'t authenticate after MFA was enabled"', 'Susan Walsh — "New iPad blocked by compliance policy"'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#22c55e; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">MOBILE EMAIL HELP DESK</div></div><div style="margin-bottom:16px;">';
        EM004Config._scenarios.forEach(function(s, i) { html += '<button class="em-scenario-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><div style="display:flex; justify-content:space-between;"><span style="color:#22c55e; font-weight:bold;">MOB-' + (1000 + i) + '</span><span style="background:#f59e0b; color:#000; padding:1px 8px; border-radius:3px; font-size:0.65rem;">URGENT</span></div><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + p[i] + '</div></button>'; });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="emRandomBtn" style="padding:10px 28px; background:#22c55e; color:#000; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.em-scenario-btn').forEach(function(btn) { btn.addEventListener('click', function() { EM004Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); EM004Config._renderTicket(engine, container); }); });
        document.getElementById('emRandomBtn').addEventListener('click', function() { EM004Config._applyScenario(engine, Math.floor(Math.random() * EM004Config._scenarios.length)); EM004Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var s = EM004Config._getScenario(engine);
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><span style="color:#22c55e; font-weight:bold; font-size:1rem;">TICKET #MOB-' + (1000 + engine.state._scenarioId) + '</span></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">REPORTED BY</div><div style="font-weight:bold; color:#22c55e;">' + s.affectedUser + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + EM004Config._escHtml(s.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + EM004Config._escHtml(s.ticketDetail) + '</div></div>'
            + (s.ticketExtra ? '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#86efac;">' + EM004Config._escHtml(s.ticketExtra) + '</div></div>' : '')
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#2ecc71; font-weight:bold;">Assigned to: YOU</div></div>';
    },

    _openMDM(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'mdmContainer';
        c.style.cssText = 'padding:16px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'MDM Console', 'MDM', c);
        var sc = engine.state._labComplete ? '#22c55e' : '#f59e0b';
        c.innerHTML = '<div style="color:#22c55e; font-weight:bold; font-size:1rem; margin-bottom:12px;">Mobile Device Management Console</div><div style="padding:12px; background:rgba(' + (engine.state._labComplete ? '34,197,94' : '245,158,11') + ',0.08); border:1px solid rgba(' + (engine.state._labComplete ? '34,197,94' : '245,158,11') + ',0.2); border-radius:4px; text-align:center;"><div style="color:' + sc + '; font-weight:bold;">' + (engine.state._labComplete ? 'ALL SYNCING' : 'SYNC ISSUES') + '</div></div><div style="margin-top:16px; color:#888; font-size:0.75rem;">Use: mobile-diag, cert-check, auth-test, policy-check, mobile-fix</div>';
    }
};
