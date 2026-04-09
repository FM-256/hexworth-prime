/* ============================================================
   DISPATCH LAB — Box SEC003: Suspicious Login
   CompTIA Security+ SY0-701 / CySA+ — Identity Threat Detection
   Config: impossible travel, after-hours, MFA failure,
   Tor exit node, credential stuffing
   5 distinct scenarios
   ============================================================ */

var SEC003Config = {

    title: 'Suspicious Login',
    subtitle: 'Who Goes There — Identity Threat Investigation',
    difficulty: 'Intermediate',
    accent: '#dc2626',
    storageKey: 'hexworth_lab_sec003',
    registryId: 'sec003-suspicious-login',
    trackerKey: 'lab_sec003',

    tutorialMode: true,

    tutorial: {
        steps: [
            { title: 'Open the Security Alert', tip: 'Double-click the Security Alert to review the suspicious login details.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check the SIEM Dashboard', tip: 'Open the SIEM Console to review authentication logs, geo-location data, and risk scores.', trigger: { event: 'window_open', match: { type: 'siem_console' } } },
            { title: 'Investigate the login', tip: 'Use terminal tools to query auth logs, check IP reputation, and analyze login patterns.', trigger: { event: 'command', match: { cmd: 'contains:auth-log' }, alt: [{ event: 'command', match: { cmd: 'contains:ip-lookup' } }, { event: 'command', match: { cmd: 'contains:geo-check' } }] } },
            { title: 'Take action', tip: 'Disable the account, force password reset, block the IP, or escalate based on findings.', trigger: { event: 'command', match: { cmd: 'contains:account-action' }, alt: [{ event: 'command', match: { cmd: 'contains:block-ip' } }] } },
            { title: 'Capture the flag', tip: 'After resolving the login threat, the flag will appear.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: {
        certPath: 'Security+ SY0-701 / CySA+',
        mappings: [
            { flagId: 'fixed', objective: '2.4', description: 'Analyze indicators of malicious activity', skill: 'Authentication Anomaly Detection' },
            { flagId: 'fixed', objective: '4.6', description: 'Explain identity and access management concepts', skill: 'Account Compromise Investigation' }
        ]
    },

    _scenarioFlags: { impossible_travel: null, after_hours: null, mfa_failure: null, tor_login: null, credential_stuffing: null },

    _scenarios: [
        {
            id: 'impossible_travel',
            name: 'Impossible Travel Alert',
            ticketSubject: 'User logged in from New York and Moscow within 15 minutes — impossible travel detected',
            ticketDetail: 'The SIEM triggered an impossible travel alert for user rparker. At 14:22 UTC, a successful login originated from New York (IP: 72.89.142.31). At 14:37 UTC, another successful login came from Moscow, Russia (IP: 5.188.86.172). The 15-minute gap makes physical travel impossible. The user is based in the New York office and is currently at work.',
            ticketExtra: 'SOC Note: The Moscow IP (5.188.86.172) has a reputation score of 2/100 (malicious) on threat intel feeds. It has been associated with credential theft campaigns targeting corporate VPNs. The user rparker has MFA enabled but the Moscow login bypassed it with a valid session token.',
            affectedUser: 'rparker',
            fixDescription: 'Confirm legitimate vs compromised session, revoke stolen token, force re-auth',
            stateOverrides: { _impossibleTravel: true, _stolenToken: true }
        },
        {
            id: 'after_hours',
            name: 'After-Hours Login',
            ticketSubject: 'Executive account login at 3:17 AM from office IP — user claims they were asleep',
            ticketDetail: 'CFO account (tmurphy) showed a successful login at 03:17 AM local time from the office IP range (10.0.1.0/24). The CFO was contacted and confirmed they were at home sleeping. The login accessed the Finance SharePoint site, downloaded 3 board meeting documents, and then logged out at 03:42 AM. No VPN was used — the login came directly from the internal network.',
            ticketExtra: 'SOC Note: Physical access logs show no badge-in at the office between midnight and 6 AM. The login used tmurphy\'s credentials with a valid MFA push that was approved at 03:17. This could be MFA fatigue (push bombing) or a physical security breach. Check the MFA push log.',
            affectedUser: 'tmurphy',
            fixDescription: 'Investigate MFA push history, check for push bombing, secure the account',
            stateOverrides: { _afterHours: true, _mfaFatigue: true }
        },
        {
            id: 'mfa_failure',
            name: 'Failed MFA Challenge',
            ticketSubject: 'Account locked after 47 failed MFA attempts in 10 minutes — no user activity',
            ticketDetail: 'User lchen\'s account was automatically locked after 47 failed MFA challenges within a 10-minute window. The password authentication succeeded each time, but the MFA token was wrong. The user lchen has not been at work today (on PTO) and confirms they did not attempt to log in. Their password may be compromised.',
            ticketExtra: 'SOC Note: All 47 attempts came from IP 103.152.220.44 (VPN endpoint in Singapore). The password was correct on every attempt, confirming password compromise. The attacker is trying to brute-force the TOTP code. Account is currently locked but password needs to be rotated.',
            affectedUser: 'lchen',
            fixDescription: 'Confirm password compromise, force reset, block attacking IP, check for credential dumps',
            stateOverrides: { _mfaBruteforce: true, _passwordCompromised: true }
        },
        {
            id: 'tor_login',
            name: 'Sign-in from Tor Exit Node',
            ticketSubject: 'Successful login from known Tor exit node — user never uses Tor',
            ticketDetail: 'User jnguyen successfully authenticated from IP 185.220.101.1, which is a known Tor exit node. The user jnguyen is a Marketing department employee who has no reason to use Tor. The login accessed their email, Teams, and OneDrive. Session is currently active. The Tor exit node IP is on our threat intel blocklist but was not blocked because the conditional access policy only applies to "High Risk" logins and this was classified as "Medium Risk".',
            ticketExtra: 'SOC Note: IP 185.220.101.1 is a well-known Tor exit node listed in multiple threat feeds. The authentication used valid credentials + valid MFA token, suggesting the attacker has access to both the password and the authenticator device (or a session token was stolen). Check if the MFA method was push notification (potentially compromised phone) or TOTP.',
            affectedUser: 'jnguyen',
            fixDescription: 'Revoke active session, force password reset, check MFA device integrity',
            stateOverrides: { _torLogin: true, _activeSession: true }
        },
        {
            id: 'credential_stuffing',
            name: 'Credential Stuffing Pattern',
            ticketSubject: 'SIEM detected credential stuffing attack — 2,400 login attempts across 300 accounts',
            ticketDetail: 'Over the past 30 minutes, the SIEM detected 2,400 login attempts against 300 different user accounts. The attempts are coming from a botnet of 150+ IP addresses. Each IP tries 8-16 accounts with different passwords. So far, 4 accounts have had successful password authentication (but all were blocked by MFA). This is a credential stuffing attack using a leaked password database.',
            ticketExtra: 'SOC Note: Cross-referencing with HaveIBeenPwned indicates a data breach from "ShopQuick.com" (leaked March 2026, 12M records). Many employees likely reuse their ShopQuick password for their corporate account. The 4 accounts with correct passwords need immediate password resets. The botnet IPs need to be blocked.',
            affectedUser: 'Multiple (300 targeted)',
            fixDescription: 'Block botnet IPs, force password reset on compromised accounts, enable account lockout',
            stateOverrides: { _stuffingActive: true, _compromisedAccounts: 4 }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Open the SIEM Console to review authentication events and risk scores.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use auth-log, ip-lookup, and geo-check commands to investigate.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Different login anomalies require different responses.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Use account-action to take corrective action on the compromised account.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        impossible_travel: [
            { id: 'hint1', text: 'Use "ip-lookup 5.188.86.172" to check the Moscow IP reputation.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The Moscow login used a stolen session token. Use "auth-log --user rparker" to see both sessions.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Revoke the stolen session with "account-action rparker --revoke-sessions".', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: account-action rparker --revoke-sessions --force-reauth to revoke all sessions and force re-authentication.', cost: 150, penalty: -150 }
        ],
        after_hours: [
            { id: 'hint1', text: 'Check the MFA push log: "auth-log --user tmurphy --mfa-detail" to see if push bombing occurred.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Multiple MFA pushes were sent between 03:10 and 03:17. The user accidentally approved one while half-asleep. Classic MFA fatigue.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Reset the account and switch MFA to number-matching: "account-action tmurphy --reset-password --mfa-upgrade"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: account-action tmurphy --reset-password --mfa-upgrade --revoke-sessions', cost: 150, penalty: -150 }
        ],
        mfa_failure: [
            { id: 'hint1', text: 'The password was correct 47 times but MFA failed. The password is definitely compromised.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Use "ip-lookup 103.152.220.44" and "credential-check lchen" to assess the situation.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Force a password reset and block the attacker IP: "account-action lchen --reset-password" and "block-ip 103.152.220.44"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: account-action lchen --reset-password, then block-ip 103.152.220.44. Both are required.', cost: 150, penalty: -150 }
        ],
        tor_login: [
            { id: 'hint1', text: 'The session from Tor is still active. Check "auth-log --user jnguyen --active" for details.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The attacker has the password AND can pass MFA. The phone or authenticator may be compromised.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Revoke sessions, reset password, and reset MFA device: "account-action jnguyen --full-reset"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: account-action jnguyen --full-reset to revoke sessions, reset password, and re-enroll MFA.', cost: 150, penalty: -150 }
        ],
        credential_stuffing: [
            { id: 'hint1', text: 'Use "stuffing-report" to see the current attack status and compromised accounts.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Four accounts had correct passwords. Use "account-action --bulk-reset" to reset all four.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Block the botnet: "block-ip --botnet-list" and reset compromised accounts: "account-action --bulk-reset"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: block-ip --botnet-list, then account-action --bulk-reset. Both are required to resolve.', cost: 150, penalty: -150 }
        ]
    },

    // ==========================================================
    // HELPERS
    // ==========================================================

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !SEC003Config._flagRestored) {
            SEC003Config._flagRestored = true;
            var scenario = SEC003Config._scenarios[engine.state._scenarioId];
            if (scenario) SEC003Config.hints = SEC003Config._scenarioHints[scenario.id] || SEC003Config._defaultHints;
        }
        return true;
    },

    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._scenarioSelected = true;
        engine.state._impossibleTravel = false;
        engine.state._stolenToken = false;
        engine.state._afterHours = false;
        engine.state._mfaFatigue = false;
        engine.state._mfaBruteforce = false;
        engine.state._passwordCompromised = false;
        engine.state._torLogin = false;
        engine.state._activeSession = false;
        engine.state._stuffingActive = false;
        engine.state._compromisedAccounts = 0;
        engine.state._sessionsRevoked = false;
        engine.state._passwordReset = false;
        engine.state._ipBlocked = false;
        engine.state._bulkReset = false;
        engine.state._botnetBlocked = false;
        engine.state._labComplete = false;
        engine.state._flagRevealed = false;

        var overrides = SEC003Config._scenarios[idx].stateOverrides || {};
        for (var key in overrides) { engine.state[key] = overrides[key]; }
        SEC003Config._flagRestored = true;
        SEC003Config.hints = SEC003Config._scenarioHints[SEC003Config._scenarios[idx].id] || SEC003Config._defaultHints;
        engine.save();
    },

    _getScenario(engine) { return engine.state._scenarioId == null ? null : SEC003Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active incident assigned.\nOpen the Security Alert first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: {
        biosLines: ['Dell UEFI BIOS A22', 'Initializing SOC workstation...', 'Memory Test: 32768 MB OK', 'NVMe: Samsung 970 EVO Plus (1TB)', 'Secure Boot: Enabled', 'Loading Windows Boot Manager...'],
        grubEntries: ['Windows 10 Enterprise', 'Windows Recovery Environment'],
        loginUser: 'SOC-Analyst'
    },

    desktop: {
        icons: [
            { id: 'cmd',    label: 'Command\nPrompt',  icon: '>_',  app: 'terminal' },
            { id: 'siem',   label: 'SIEM\nConsole',    icon: 'SIEM', app: 'siem_console' },
            { id: 'ticket', label: 'Security\nAlert',  icon: 'SEC', app: 'ticket' },
            { id: 'hints',  label: 'Hints',            icon: '?',   app: 'hints' },
            { id: 'reset',  label: 'Reset\nLab',       icon: 'RST', app: 'reset_lab' }
        ]
    },

    terminal: { user: 'SOC-Analyst', hostname: 'SOC-WS01', startDir: 'C:\\Users\\SOC-Analyst', promptStyle: 'windows', welcome: 'Microsoft Windows [Version 10.0.19045.4412]\n(c) Microsoft Corporation.\n\nSOC Analyst Workstation — SIEM Integration Active\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Check the SIEM Console for authentication anomalies.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use auth-log and ip-lookup to investigate.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each login anomaly has a different root cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Use account-action to remediate the threat.', cost: 50, penalty: -50 }
    ],

    lore: {
        intro: 'The SIEM is firing authentication anomaly alerts. Someone — or something — is accessing accounts they shouldn\'t be. As the SOC analyst on shift, investigate each suspicious login and take appropriate action.',
        scenario: 'Each scenario represents a different type of authentication threat — from impossible travel to credential stuffing. Analyze the evidence and respond appropriately.',
        outro: 'Identity threats neutralized. Your investigation identified compromised credentials, revoked unauthorized sessions, and strengthened authentication controls.'
    },

    phases: [
        { id: 'investigate', name: 'Detection', description: 'Review the SIEM alert and gather authentication evidence.', requiredFlags: [], unlocks: ['analyze'], locked: false },
        { id: 'analyze', name: 'Analysis', description: 'Determine if the login is legitimate or malicious.', requiredFlags: [], unlocks: ['respond'], locked: true },
        { id: 'respond', name: 'Response', description: 'Take action to secure the compromised account.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm the threat is neutralized.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    // ==========================================================
    // COMMANDS
    // ==========================================================

    commands: {

        'auth-log': function(args, term, engine) {
            var gate = SEC003Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = SEC003Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (scenario && scenario.id === 'impossible_travel' && joined.includes('rparker')) {
                return '\nAuthentication Log — rparker@corp.hexworth.local\n=================================================\n  2026-03-29 14:22:03 UTC  SUCCESS  IP: 72.89.142.31    Location: New York, US     Method: Password + MFA Push   Device: CORP-WS-042\n  2026-03-29 14:37:18 UTC  SUCCESS  IP: 5.188.86.172    Location: Moscow, RU        Method: Session Token Replay  Device: Unknown\n  2026-03-29 14:38:01 UTC  ACCESS   IP: 5.188.86.172    Resource: SharePoint (Finance)  Action: Downloaded 5 files\n  2026-03-29 14:41:22 UTC  ACCESS   IP: 5.188.86.172    Resource: OneDrive              Action: Browsing /Documents\n\n  [!] IMPOSSIBLE TRAVEL: 7,509 km in 15 minutes (requires 8+ hours by plane)\n  [!] Moscow session used STOLEN SESSION TOKEN (not fresh authentication)\n  [!] IP 5.188.86.172 reputation: MALICIOUS (2/100)';
            }

            if (scenario && scenario.id === 'after_hours' && joined.includes('tmurphy')) {
                var mfaDetail = joined.includes('--mfa');
                var output = '\nAuthentication Log — tmurphy@corp.hexworth.local\n=================================================\n  2026-03-29 03:17:44 UTC  SUCCESS  IP: 10.0.1.47     Location: Office (Internal)  Method: Password + MFA Push   Device: Unknown\n  2026-03-29 03:18:02 UTC  ACCESS   IP: 10.0.1.47     Resource: SharePoint (Board Docs)  Action: Downloaded 3 files\n  2026-03-29 03:42:18 UTC  LOGOUT   IP: 10.0.1.47     Session duration: 24 minutes';

                if (mfaDetail) {
                    output += '\n\nMFA Push History — tmurphy:\n  2026-03-29 03:10:22  PUSH SENT  Result: DENIED (timed out)\n  2026-03-29 03:11:45  PUSH SENT  Result: DENIED (timed out)\n  2026-03-29 03:12:58  PUSH SENT  Result: DENIED (user declined)\n  2026-03-29 03:14:10  PUSH SENT  Result: DENIED (user declined)\n  2026-03-29 03:15:33  PUSH SENT  Result: DENIED (timed out)\n  2026-03-29 03:16:47  PUSH SENT  Result: DENIED (timed out)\n  2026-03-29 03:17:44  PUSH SENT  Result: APPROVED\n\n  [!] MFA FATIGUE ATTACK DETECTED: 7 push attempts in 7 minutes\n  [!] User likely approved accidentally while half-asleep\n  [!] Recommendation: Upgrade MFA to number-matching challenge';
                }
                return output;
            }

            if (scenario && scenario.id === 'mfa_failure' && joined.includes('lchen')) {
                return '\nAuthentication Log — lchen@corp.hexworth.local\n===============================================\n  2026-03-29 11:02:15 - 11:12:43 UTC  47 ATTEMPTS\n    IP: 103.152.220.44   Location: Singapore\n    Password: CORRECT (all 47 attempts)\n    MFA: FAILED (all 47 attempts — wrong TOTP code)\n    Account Status: LOCKED (after attempt #47)\n\n  [!] PASSWORD IS COMPROMISED — correct on every attempt\n  [!] Attacker is brute-forcing TOTP codes (trying sequential values)\n  [!] User is on PTO — confirms this is unauthorized\n  [!] IP 103.152.220.44: VPN endpoint, reputation 15/100';
            }

            if (scenario && scenario.id === 'tor_login' && joined.includes('jnguyen')) {
                return '\nAuthentication Log — jnguyen@corp.hexworth.local\n=================================================\n  2026-03-29 09:15:33 UTC  SUCCESS  IP: 185.220.101.1   Location: Tor Exit Node     Method: Password + TOTP       Device: Unknown\n  2026-03-29 09:16:01 UTC  ACCESS   IP: 185.220.101.1   Resource: Outlook (Email)    Action: Read 42 emails\n  2026-03-29 09:22:17 UTC  ACCESS   IP: 185.220.101.1   Resource: Teams              Action: Downloaded channel files\n  2026-03-29 09:28:44 UTC  ACCESS   IP: 185.220.101.1   Resource: OneDrive           Action: Browsing /Marketing\n  SESSION STILL ACTIVE\n\n  [!] Tor exit node — known anonymization network\n  [!] Attacker has BOTH password and TOTP authenticator access\n  [!] Possible scenarios: phone compromised, SIM swap, or authenticator app backup stolen';
            }

            return '\nUsage: auth-log --user <username> [--mfa-detail] [--active]\nQueries authentication logs for the specified user.';
        },

        'ip-lookup': function(args, term, engine) {
            var gate = SEC003Config._requireScenario(engine);
            if (gate) return gate;
            var target = args[0] || '';

            var ipData = {
                '5.188.86.172':    { geo: 'Moscow, Russia', asn: 'AS49505 (OOO Network)', rep: '2/100 (MALICIOUS)', tags: 'Credential Theft, VPN Brute Force, Known APT Infrastructure' },
                '72.89.142.31':    { geo: 'New York, US', asn: 'AS22252 (Verizon Business)', rep: '95/100 (Clean)', tags: 'Corporate ISP' },
                '103.152.220.44':  { geo: 'Singapore', asn: 'AS138915 (Kaopu Cloud)', rep: '15/100 (Suspicious)', tags: 'VPN/Proxy Service, Credential Attacks' },
                '185.220.101.1':   { geo: 'Tor Exit Node (Germany)', asn: 'AS205100 (F3 Netze)', rep: '5/100 (MALICIOUS)', tags: 'Tor Exit Node, Anonymization' }
            };

            if (ipData[target]) {
                var d = ipData[target];
                return '\nIP Reputation Lookup: ' + target + '\n' + '='.repeat(40) + '\n  Geolocation:  ' + d.geo + '\n  ASN:          ' + d.asn + '\n  Reputation:   ' + d.rep + '\n  Tags:         ' + d.tags;
            }
            return '\nUsage: ip-lookup <ip-address>\nChecks threat intelligence feeds for IP reputation.';
        },

        'account-action': function(args, term, engine) {
            var gate = SEC003Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = SEC003Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            // Impossible travel
            if (scenario && scenario.id === 'impossible_travel' && joined.includes('rparker')) {
                if (joined.includes('--revoke-sessions') || joined.includes('--force-reauth')) {
                    engine.state._sessionsRevoked = true;
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                    engine.save();
                    setTimeout(function() { engine.notify('Sessions revoked. Stolen token invalidated. Account secured.', 'success'); }, 400);
                    return '\nAccount Action: rparker\n=======================\n  Revoking all active sessions... OK (2 sessions terminated)\n  Invalidating session tokens... OK\n  Forcing re-authentication... OK\n  Blocking IP 5.188.86.172... OK\n  Sending password reset link... OK\n\nMoscow session terminated. Stolen token invalidated.\nUser will need to re-authenticate from their legitimate device.\n\n=== FLAG: SEC003{impossible_travel_token_revoked} ===';
                }
            }

            // After hours
            if (scenario && scenario.id === 'after_hours' && joined.includes('tmurphy')) {
                if (joined.includes('--reset-password') && (joined.includes('--mfa-upgrade') || joined.includes('--revoke'))) {
                    engine.state._passwordReset = true;
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                    engine.save();
                    setTimeout(function() { engine.notify('Account secured. MFA upgraded to number-matching.', 'success'); }, 400);
                    return '\nAccount Action: tmurphy\n=======================\n  Revoking all sessions... OK\n  Resetting password... OK (temporary password sent to personal email)\n  Upgrading MFA to number-matching... OK\n  Adding conditional access: Block after-hours from unknown devices... OK\n\nMFA fatigue attack mitigated. Number-matching prevents blind approval.\n\n=== FLAG: SEC003{after_hours_mfa_fatigue_mitigated} ===';
                }
            }

            // MFA failure
            if (scenario && scenario.id === 'mfa_failure' && joined.includes('lchen')) {
                if (joined.includes('--reset-password')) {
                    engine.state._passwordReset = true;
                    engine.save();
                    if (engine.state._ipBlocked) {
                        engine.state._labComplete = true;
                        engine.state._flagRevealed = true;
                        engine.save();
                        setTimeout(function() { engine.notify('Password reset and attacker IP blocked. Account secured.', 'success'); }, 400);
                        return '\nAccount Action: lchen\n=====================\n  Resetting password... OK\n  Unlocking account... OK\n  Notifying user via personal email... OK\n\n=== BOTH ACTIONS COMPLETE ===\n=== FLAG: SEC003{mfa_failure_password_rotated} ===';
                    }
                    return '\nAccount Action: lchen\n=====================\n  Resetting password... OK\n  Unlocking account... OK\n\nPassword reset. Still need to block the attacker IP: block-ip 103.152.220.44';
                }
            }

            // Tor login
            if (scenario && scenario.id === 'tor_login' && joined.includes('jnguyen')) {
                if (joined.includes('--full-reset')) {
                    engine.state._sessionsRevoked = true;
                    engine.state._passwordReset = true;
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                    engine.save();
                    setTimeout(function() { engine.notify('Full account reset complete. Tor session terminated.', 'success'); }, 400);
                    return '\nAccount Action: jnguyen — FULL RESET\n=====================================\n  Revoking all active sessions... OK (Tor session terminated)\n  Resetting password... OK\n  Revoking MFA enrollment... OK\n  Requiring MFA re-enrollment on next login... OK\n  Blocking Tor exit node 185.220.101.1... OK\n  Adding conditional access: Block anonymous networks... OK\n\nAll access revoked. User must re-enroll MFA with physical verification.\n\n=== FLAG: SEC003{tor_login_full_reset_complete} ===';
                }
            }

            // Bulk reset for credential stuffing
            if (scenario && scenario.id === 'credential_stuffing' && joined.includes('--bulk-reset')) {
                engine.state._bulkReset = true;
                engine.save();
                if (engine.state._botnetBlocked) {
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                    engine.save();
                    setTimeout(function() { engine.notify('Compromised accounts reset and botnet blocked.', 'success'); }, 400);
                    return '\nBulk Account Action: 4 compromised accounts\n=============================================\n  Resetting: amorris... OK\n  Resetting: kpatel... OK\n  Resetting: dwright... OK\n  Resetting: mjohnson... OK\n  Sending breach notifications... OK\n\n=== CREDENTIAL STUFFING MITIGATED ===\n=== FLAG: SEC003{credential_stuffing_contained} ===';
                }
                return '\nBulk Account Action: 4 compromised accounts\n=============================================\n  Resetting passwords for 4 accounts... OK\n\nPasswords reset. Still need to block the botnet IPs: block-ip --botnet-list';
            }

            return '\nUsage: account-action <username> [options]\n  --revoke-sessions     Revoke all active sessions\n  --force-reauth        Force re-authentication\n  --reset-password      Force password reset\n  --mfa-upgrade         Upgrade MFA method\n  --full-reset          Revoke + reset password + re-enroll MFA\n  --bulk-reset          Reset all compromised accounts';
        },

        'block-ip': function(args, term, engine) {
            var gate = SEC003Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = SEC003Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (scenario && scenario.id === 'mfa_failure' && joined.includes('103.152.220.44')) {
                engine.state._ipBlocked = true;
                engine.save();
                if (engine.state._passwordReset) {
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                    engine.save();
                    setTimeout(function() { engine.notify('IP blocked and password reset. Account secured.', 'success'); }, 400);
                    return '\nFirewall Rule Added:\n  BLOCK 103.152.220.44 -> * (all ports, all protocols)\n  Applied to: Edge firewall, WAF, Conditional Access\n\n=== BOTH ACTIONS COMPLETE ===\n=== FLAG: SEC003{mfa_failure_password_rotated} ===';
                }
                return '\nFirewall Rule Added:\n  BLOCK 103.152.220.44 -> * (all ports)\n\nIP blocked. Still need to reset the compromised password: account-action lchen --reset-password';
            }

            if (scenario && scenario.id === 'credential_stuffing' && joined.includes('--botnet-list')) {
                engine.state._botnetBlocked = true;
                engine.save();
                if (engine.state._bulkReset) {
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                    engine.save();
                    setTimeout(function() { engine.notify('Botnet blocked and compromised accounts reset.', 'success'); }, 400);
                    return '\nBotnet IP Block:\n  Importing 153 IPs from attack correlation...\n  Applying to edge firewall... OK (153 rules added)\n  Applying to WAF... OK\n  Applying to Conditional Access... OK\n  Enabling enhanced rate limiting... OK\n\n=== CREDENTIAL STUFFING MITIGATED ===\n=== FLAG: SEC003{credential_stuffing_contained} ===';
                }
                return '\nBotnet IP Block:\n  153 IPs blocked.\n\nBotnet blocked. Still need to reset compromised accounts: account-action --bulk-reset';
            }

            return '\nUsage: block-ip <ip-address>\n       block-ip --botnet-list    Block all IPs from current attack';
        },

        'stuffing-report': function(args, term, engine) {
            var gate = SEC003Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = SEC003Config._getScenario(engine);

            if (scenario && scenario.id === 'credential_stuffing') {
                return '\nCredential Stuffing Attack Report\n==================================\n  Duration: 30 minutes (ongoing)\n  Total Attempts: 2,417\n  Unique Accounts Targeted: 304\n  Unique Source IPs: 153 (botnet)\n  Successful Password Auth: 4\n  MFA Blocked: 4/4 (all blocked by MFA)\n\n  Compromised Accounts (correct password, MFA blocked):\n    1. amorris@corp.hexworth.local    (Marketing)\n    2. kpatel@corp.hexworth.local     (Engineering)\n    3. dwright@corp.hexworth.local    (Sales)\n    4. mjohnson@corp.hexworth.local   (HR)\n\n  Source: Likely ShopQuick.com breach (March 2026, 12M records)\n  Pattern: 8-16 attempts per IP, rotating through credential list\n\n  Actions Required:\n    1. block-ip --botnet-list (block 153 botnet IPs)\n    2. account-action --bulk-reset (reset 4 compromised passwords)';
            }
            return '\nNo active credential stuffing attacks detected.';
        },

        'credential-check': function(args, term, engine) {
            var gate = SEC003Config._requireScenario(engine);
            if (gate) return gate;
            var target = args[0] || '';
            if (target === 'lchen') {
                return '\nCredential Breach Check: lchen@corp.hexworth.local\n===================================================\n  HaveIBeenPwned: FOUND in 2 breaches\n    1. ShopQuick.com (March 2026) — email + password\n    2. FitTracker (Jan 2025) — email only\n\n  Password reuse risk: HIGH\n  Recommendation: Immediate password reset + user education';
            }
            return '\nUsage: credential-check <username>';
        },

        'geo-check': function(args, term, engine) {
            var gate = SEC003Config._requireScenario(engine);
            if (gate) return gate;
            return '\nGeo-Anomaly Check\n  Use "auth-log --user <username>" to see login locations and detect impossible travel.';
        },

        whoami: function() { return 'SOC-WS01\\SOC-Analyst'; },
        hostname: function() { return 'SOC-WS01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        ipconfig: function() { return '\nIPv4 Address: 10.0.2.50\nSubnet Mask: 255.255.255.0\nDefault Gateway: 10.0.2.1'; },

        ifconfig: function() { return '\'ifconfig\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        grep: function() { return '\'grep\' is not recognized as an internal or external command,\noperable program or batch file.'; },
        sudo: function() { return '\'sudo\' is not recognized as an internal or external command,\noperable program or batch file.'; }
    },

    // ==========================================================
    // WINDOW HANDLERS
    // ==========================================================

    onAppLaunch(iconDef, engine) {
        if (iconDef.app === 'siem_console' && !engine.state._scenarioSelected) {
            engine.notify('Open the Security Alert first.', 'error'); return;
        }
        switch (iconDef.app) {
            case 'ticket':       SEC003Config._openTicket(iconDef, engine); break;
            case 'siem_console': SEC003Config._openSIEM(iconDef, engine); break;
            case 'reset_lab':    SEC003Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.id = 'ticketContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Security Alert', 'SEC', container);
        SEC003Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) { SEC003Config._renderTicket(engine, container); }
        else { SEC003Config._renderScenarioPicker(engine, container); }
    },

    _renderScenarioPicker(engine, container) {
        var previews = [
            'SIEM — "Impossible travel: New York and Moscow logins 15 minutes apart"',
            'SIEM — "CFO account login at 3 AM from office — user was at home"',
            'SIEM — "47 failed MFA attempts in 10 minutes — password is compromised"',
            'SIEM — "Successful login from known Tor exit node — active session"',
            'SIEM — "Credential stuffing: 2,400 attempts across 300 accounts from botnet"'
        ];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#dc2626; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">AUTHENTICATION ALERT QUEUE</div><div style="color:#888; font-size:0.75rem;">Select an alert to investigate.</div></div><div style="margin-bottom:16px;">';
        SEC003Config._scenarios.forEach(function(s, i) {
            html += '<button class="sec-scenario-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer; transition:border-color 0.2s;"><div style="display:flex; justify-content:space-between; align-items:center;"><span style="color:#dc2626; font-weight:bold;">AUTH-' + (1000 + i) + '</span><span style="background:#dc2626; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">HIGH</span></div><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div></button>';
        });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="secRandomBtn" style="padding:10px 28px; background:#dc2626; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.85rem; font-family:Consolas,monospace;">Random Assignment</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.sec-scenario-btn').forEach(function(btn) {
            btn.addEventListener('mouseenter', function() { this.style.borderColor = '#dc2626'; });
            btn.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.12)'; });
            btn.addEventListener('click', function() { SEC003Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); SEC003Config._renderTicket(engine, container); });
        });
        document.getElementById('secRandomBtn').addEventListener('click', function() { SEC003Config._applyScenario(engine, Math.floor(Math.random() * SEC003Config._scenarios.length)); SEC003Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var scenario = SEC003Config._getScenario(engine);
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><div style="display:flex; justify-content:space-between; align-items:center;"><span style="color:#dc2626; font-weight:bold; font-size:1rem;">ALERT #AUTH-' + (1000 + engine.state._scenarioId) + '</span><span style="background:#dc2626; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">PRIORITY: HIGH</span></div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">AFFECTED USER</div><div style="font-weight:bold; color:#dc2626;">' + scenario.affectedUser + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBJECT</div><div style="font-weight:bold;">' + SEC003Config._escHtml(scenario.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + SEC003Config._escHtml(scenario.ticketDetail) + '</div></div>'
            + (scenario.ticketExtra ? '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SOC NOTES</div><div style="background:rgba(220,38,38,0.08); border:1px solid rgba(220,38,38,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#fca5a5;">' + SEC003Config._escHtml(scenario.ticketExtra) + '</div></div>' : '')
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">ASSIGNED TO</div><div style="color:#2ecc71; font-weight:bold;">YOU — SOC Analyst</div></div>';
    },

    _openSIEM(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.id = 'siemContainer';
        container.style.cssText = 'padding:16px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'SIEM Console', 'SIEM', container);

        var scenario = SEC003Config._getScenario(engine);
        var html = '<div style="color:#dc2626; font-weight:bold; font-size:1rem; margin-bottom:12px;">SIEM — Authentication Monitoring</div>';
        html += '<div style="color:#888; font-size:0.75rem; margin-bottom:12px;">Real-time authentication event analysis</div>';
        html += '<div style="margin-bottom:16px;"><div style="color:#dc2626; font-weight:bold; font-size:0.85rem; margin-bottom:8px;">Active Alert: ' + scenario.name + '</div>';
        html += '<div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px;">' + SEC003Config._escHtml(scenario.ticketSubject) + '</div></div>';

        var statusColor = engine.state._labComplete ? '#22c55e' : '#dc2626';
        var statusText = engine.state._labComplete ? 'RESOLVED' : 'ACTIVE THREAT';
        html += '<div style="padding:12px; background:rgba(' + (engine.state._labComplete ? '34,197,94' : '220,38,38') + ',0.08); border:1px solid rgba(' + (engine.state._labComplete ? '34,197,94' : '220,38,38') + ',0.2); border-radius:4px; text-align:center;"><div style="font-size:0.75rem; color:#888;">Alert Status</div><div style="color:' + statusColor + '; font-weight:bold; font-size:1.1rem;">' + statusText + '</div></div>';
        html += '<div style="margin-top:16px; color:#888; font-size:0.75rem;">Use "auth-log", "ip-lookup", and "account-action" in the terminal for investigation.</div>';
        container.innerHTML = html;
    },

    _confirmReset(engine) { if (confirm('Reset this lab? All progress will be lost.')) { engine.resetLab(); } }
};
