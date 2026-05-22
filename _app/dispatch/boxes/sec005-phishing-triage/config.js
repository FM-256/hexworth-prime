/* ============================================================
   DISPATCH LAB — Box SEC005: Phishing Triage
   CompTIA Security+ SY0-701 — Phishing Analysis & Response
   Config: credential harvesting, macro doc, reply-to mismatch,
   URL redirection, BEC
   5 distinct scenarios
   ============================================================ */

var SEC005Config = {

    title: 'Phishing Triage',
    subtitle: 'Don\'t Click That — Phishing Investigation',
    difficulty: 'Beginner',
    accent: '#dc2626',
    storageKey: 'hexworth_lab_sec005',
    registryId: 'sec005-phishing-triage',
    trackerKey: 'lab_sec005',

    tutorialMode: true,

    tutorial: {
        steps: [
            { title: 'Open the Phishing Report', tip: 'Double-click the Security Alert to review the reported phishing email.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Analyze the email', tip: 'Open the Email Analyzer to inspect headers, URLs, and attachments.', trigger: { event: 'window_open', match: { type: 'email_analyzer' } } },
            { title: 'Investigate indicators', tip: 'Use terminal tools to check URL reputation, analyze headers, and check for IOCs.', trigger: { event: 'command', match: { cmd: 'contains:url-check' }, alt: [{ event: 'command', match: { cmd: 'contains:header-analyze' } }, { event: 'command', match: { cmd: 'contains:whois' } }] } },
            { title: 'Take action', tip: 'Classify the email, block the sender, and remediate based on the phishing type.', trigger: { event: 'command', match: { cmd: 'contains:phish-action' } } },
            { title: 'Capture the flag', tip: 'After completing the triage, the flag will appear.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: {
        certPath: 'Security+ SY0-701',
        mappings: [
            { flagId: 'fixed', objective: '2.4', description: 'Analyze indicators of malicious activity', skill: 'Phishing Identification and Analysis' },
            { flagId: 'fixed', objective: '5.6', description: 'Implement security awareness practices', skill: 'Social Engineering Response' }
        ]
    },

    _scenarioFlags: { cred_harvest: null, macro_doc: null, reply_mismatch: null, url_redirect: null, bec: null },

    _scenarios: [
        {
            id: 'cred_harvest',
            name: 'Credential Harvesting Link Clicked',
            ticketSubject: 'Employee clicked a fake Microsoft 365 login page — entered credentials',
            ticketDetail: 'User Amy Chen (achen@corp.hexworth.local) reported that she received an email claiming her Microsoft 365 password was expiring. She clicked the link and entered her current password on what she thought was the Microsoft login page. The page then showed an error and redirected to the real Microsoft login. Amy now suspects it was a phishing page and reported it to IT. She entered her credentials approximately 45 minutes ago.',
            ticketExtra: 'SOC Note: The phishing URL is hxxps://microsoft365-login.secureauth-verify.com/signin. The domain was registered yesterday. The page is a pixel-perfect clone of the Microsoft login page. Time-critical: credentials are likely already in attacker\'s hands. Need immediate password reset and session revocation.',
            affectedUser: 'achen',
            phishEmail: { from: 'no-reply@microsoft365-alerts.com', replyTo: 'no-reply@microsoft365-alerts.com', to: 'achen@corp.hexworth.local', subject: 'Action Required: Your Password Expires in 24 Hours', date: '2026-03-29 08:42:17 UTC', spf: 'PASS (domain microsoft365-alerts.com)', dkim: 'PASS', dmarc: 'PASS (own domain)', url: 'hxxps://microsoft365-login.secureauth-verify.com/signin', attachment: null },
            fixDescription: 'Reset password, revoke sessions, block phishing domain',
            stateOverrides: { _credStolen: true, _linkClicked: true }
        },
        {
            id: 'macro_doc',
            name: 'Macro-Enabled Doc Opened',
            ticketSubject: 'User opened a .xlsm attachment from unknown sender — macros may have executed',
            ticketDetail: 'User Dave Park (dpark@corp.hexworth.local) in Accounting received an email with a "Q1 Invoice" Excel file (.xlsm). He opened the file and clicked "Enable Content" when prompted. His computer then showed a brief PowerShell window that flashed and closed. The AV has not flagged anything yet but the behavior is suspicious. Dave reported it 20 minutes after opening the file.',
            ticketExtra: 'SOC Note: The .xlsm file is named "Q1_Invoice_2026_FINAL.xlsm" (287 KB). Macro-enabled Excel files from unknown senders are a primary malware delivery vector. The brief PowerShell window suggests the macro executed a download cradle. Check if a payload was downloaded and if the system is compromised.',
            affectedUser: 'dpark',
            phishEmail: { from: 'accounting@globalpay-services.com', replyTo: 'invoices@globalpay-services.com', to: 'dpark@corp.hexworth.local', subject: 'Q1 Invoice #INV-2026-4891 — Payment Due', date: '2026-03-29 09:15:33 UTC', spf: 'FAIL', dkim: 'FAIL', dmarc: 'FAIL', url: null, attachment: 'Q1_Invoice_2026_FINAL.xlsm (287 KB)' },
            fixDescription: 'Isolate host, check for payload, scan for malware',
            stateOverrides: { _macroExecuted: true, _payloadDropped: true }
        },
        {
            id: 'reply_mismatch',
            name: 'Reply-To Mismatch',
            ticketSubject: 'Suspicious email from "CEO" asking to process urgent wire transfer — reply-to is external',
            ticketDetail: 'Controller Maria Gonzalez (mgonzalez@corp.hexworth.local) received an email that appears to be from CEO James Whitfield (jwhitfield@corp.hexworth.local) requesting an urgent wire transfer of $47,500 to a new vendor account. The email says "Please process this today and keep it confidential — I am in meetings all day." Maria noticed the email felt unusual and checked the headers — the Reply-To address is jwhitfield@corp-hexworth.com (note the hyphen instead of dot).',
            ticketExtra: 'SOC Note: Classic BEC (Business Email Compromise) with reply-to substitution. The From header shows the legitimate CEO address (display name spoofing or compromised mailbox). The Reply-To redirects responses to an attacker-controlled lookalike domain. Check: is the From header actually spoofed, or is the CEO\'s account compromised?',
            affectedUser: 'mgonzalez',
            phishEmail: { from: '"James Whitfield" <jwhitfield@corp.hexworth.local>', replyTo: 'jwhitfield@corp-hexworth.com', to: 'mgonzalez@corp.hexworth.local', subject: 'Urgent: Wire Transfer — Confidential', date: '2026-03-29 10:02:44 UTC', spf: 'FAIL (sender IP not in corp.hexworth.local SPF)', dkim: 'FAIL', dmarc: 'FAIL', url: null, attachment: null },
            fixDescription: 'Identify spoofing method, block lookalike domain, alert finance team',
            stateOverrides: { _replyMismatch: true, _becAttempt: true }
        },
        {
            id: 'url_redirect',
            name: 'URL Redirection Chain',
            ticketSubject: 'Phishing email uses legitimate URL shortener that redirects through 3 domains',
            ticketDetail: 'User Tom Bailey (tbailey@corp.hexworth.local) reported a suspicious email claiming to be from FedEx about a package delivery. The email contains a "Track Package" link that uses a bit.ly shortener. When expanded, it redirects through 3 domains before landing on a fake FedEx tracking page that asks for credit card payment for "customs fees." Tom did not enter any data but wants it investigated.',
            ticketExtra: 'SOC Note: The redirect chain is: bit.ly/3xK9mPq -> tracking-redirect.com -> fedex-delivery-status.com -> fedex-customs-payment.xyz. Each domain is less than 7 days old. The final page mimics the FedEx site and harvests credit card numbers. Need to unwind the full redirect chain and block all domains.',
            affectedUser: 'tbailey',
            phishEmail: { from: 'delivery-notification@fedex-shipping.com', replyTo: 'noreply@fedex-shipping.com', to: 'tbailey@corp.hexworth.local', subject: 'FedEx: Your package requires customs payment', date: '2026-03-29 11:30:17 UTC', spf: 'PASS (fedex-shipping.com)', dkim: 'PASS', dmarc: 'PASS (own domain)', url: 'hxxps://bit.ly/3xK9mPq', attachment: null },
            fixDescription: 'Unwind redirect chain, block all domains, check for other recipients',
            stateOverrides: { _redirectChain: true }
        },
        {
            id: 'bec',
            name: 'Business Email Compromise',
            ticketSubject: 'Vendor email requesting bank account change — may be BEC',
            ticketDetail: 'Accounts Payable clerk Lisa Wang (lwang@corp.hexworth.local) received an email from what appears to be their regular vendor contact at Apex Office Supplies (orders@apexoffice.com). The email requests that all future payments be sent to a new bank account at "National Trust Bank" (routing: 071923456, account: 8834521099). The email cites "a recent banking transition." The previous bank was Chase. Lisa was about to update the vendor record but decided to verify first.',
            ticketExtra: 'SOC Note: This is a classic vendor email compromise (VEC) attack. Either the vendor\'s email was compromised, or this is a lookalike domain. Check: (1) Is the sending domain legitimate apexoffice.com or a lookalike? (2) Compare email headers with previous legitimate emails from this vendor. (3) Verify the bank change through out-of-band communication (phone call to known vendor number).',
            affectedUser: 'lwang',
            phishEmail: { from: 'orders@apexoffice.com', replyTo: 'orders@apexoffice.com', to: 'lwang@corp.hexworth.local', subject: 'Updated Banking Information — Apex Office Supplies', date: '2026-03-29 13:15:22 UTC', spf: 'PASS', dkim: 'PASS', dmarc: 'PASS', url: null, attachment: 'Apex_Banking_Update_2026.pdf (42 KB)' },
            fixDescription: 'Determine if vendor account is compromised, verify through alternate channel',
            stateOverrides: { _becVendor: true, _vendorCompromised: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Open the Email Analyzer to inspect headers, sender info, and embedded URLs.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use url-check, header-analyze, and whois to investigate phishing indicators.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each phishing type has a different attack goal and response.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Use phish-action to classify and remediate.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        cred_harvest: [
            { id: 'hint1', text: 'Amy already entered her password. The clock is ticking — check "auth-log --user achen" for unauthorized access.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Use "url-check microsoft365-login.secureauth-verify.com" — the domain was registered yesterday.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Reset Amy\'s password and revoke sessions: "phish-action --cred-harvest --user achen"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: phish-action --cred-harvest --user achen --block-domain secureauth-verify.com', cost: 150, penalty: -150 }
        ],
        macro_doc: [
            { id: 'hint1', text: 'The PowerShell flash suggests a download cradle. Use "header-analyze" to check the email authentication.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'SPF, DKIM, and DMARC all FAIL. This is not from a legitimate sender.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Isolate the host and scan: "phish-action --macro-doc --user dpark --isolate"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: phish-action --macro-doc --user dpark --isolate --scan', cost: 150, penalty: -150 }
        ],
        reply_mismatch: [
            { id: 'hint1', text: 'Compare the From and Reply-To addresses carefully. Use "header-analyze" to see the full headers.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'From shows corp.hexworth.local but SPF FAILS — the email was sent from outside. Reply-To goes to corp-hexworth.com (hyphen vs dot).', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Block the lookalike domain: "phish-action --bec-spoof --block-domain corp-hexworth.com"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: phish-action --bec-spoof --block-domain corp-hexworth.com --alert-finance', cost: 150, penalty: -150 }
        ],
        url_redirect: [
            { id: 'hint1', text: 'Use "url-check bit.ly/3xK9mPq" to unwind the redirect chain.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The chain goes through 3 domains, all registered in the last week. Final domain harvests credit cards.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Block all domains in the chain: "phish-action --url-chain --block-all"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: phish-action --url-chain --block-all --check-recipients', cost: 150, penalty: -150 }
        ],
        bec: [
            { id: 'hint1', text: 'SPF/DKIM/DMARC all PASS — this email actually came from apexoffice.com. The vendor account may be compromised.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Use "header-analyze" and compare with previous vendor emails. Check for header anomalies.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Verify via phone: "phish-action --vendor-bec --verify-oob"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: phish-action --vendor-bec --verify-oob --hold-payment', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !SEC005Config._flagRestored) {
            SEC005Config._flagRestored = true;
            var scenario = SEC005Config._scenarios[engine.state._scenarioId];
            if (scenario) SEC005Config.hints = SEC005Config._scenarioHints[scenario.id] || SEC005Config._defaultHints;
        }
        return true;
    },

    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._scenarioSelected = true;
        engine.state._credStolen = false; engine.state._linkClicked = false;
        engine.state._macroExecuted = false; engine.state._payloadDropped = false;
        engine.state._replyMismatch = false; engine.state._becAttempt = false;
        engine.state._redirectChain = false;
        engine.state._becVendor = false; engine.state._vendorCompromised = false;
        engine.state._labComplete = false; engine.state._flagRevealed = false;

        var overrides = SEC005Config._scenarios[idx].stateOverrides || {};
        for (var key in overrides) { engine.state[key] = overrides[key]; }
        SEC005Config._flagRestored = true;
        SEC005Config.hints = SEC005Config._scenarioHints[SEC005Config._scenarios[idx].id] || SEC005Config._defaultHints;
        engine.save();
    },

    _getScenario(engine) { return engine.state._scenarioId == null ? null : SEC005Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active incident.\nOpen the Security Alert first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: {
        biosLines: ['Dell UEFI BIOS A22', 'SOC workstation initializing...', 'Memory: 32768 MB OK', 'Secure Boot: Enabled', 'Loading Windows...'],
        grubEntries: ['Windows 10 Enterprise'], loginUser: 'SOC-Analyst'
    },

    desktop: {
        icons: [
            { id: 'cmd',      label: 'Command\nPrompt',    icon: '>_',  app: 'terminal' },
            { id: 'email',    label: 'Email\nAnalyzer',    icon: 'EML', app: 'email_analyzer' },
            { id: 'ticket',   label: 'Security\nAlert',    icon: 'SEC', app: 'ticket' },
            { id: 'hints',    label: 'Hints',              icon: '?',   app: 'hints' },
            { id: 'reset',    label: 'Reset\nLab',         icon: 'RST', app: 'reset_lab' }
        ]
    },

    terminal: { user: 'SOC-Analyst', hostname: 'SOC-WS01', startDir: 'C:\\Users\\SOC-Analyst', promptStyle: 'windows', welcome: 'Microsoft Windows [Version 10.0.19045.4412]\n\nSOC Workstation — Phishing Triage Tools Active\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Open the Email Analyzer to inspect the phishing email.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use url-check and header-analyze for investigation.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each phishing type requires a different response.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Use phish-action to classify and remediate.', cost: 50, penalty: -50 }
    ],
    lore: {
        intro: 'The phishing report inbox is filling up. Users are reporting suspicious emails and some have already clicked. Triage each report, analyze the email, and take appropriate action.',
        scenario: 'Each scenario represents a different phishing technique. Analyze headers, URLs, and attachments to determine the threat level and respond.',
        outro: 'Phishing triage complete. Your analysis correctly identified the attack type and your response protected the organization.'
    },
    phases: [
        { id: 'investigate', name: 'Analysis', description: 'Analyze the reported phishing email.', requiredFlags: [], unlocks: ['classify'], locked: false },
        { id: 'classify', name: 'Classification', description: 'Determine the phishing type and threat level.', requiredFlags: [], unlocks: ['respond'], locked: true },
        { id: 'respond', name: 'Response', description: 'Block the threat and remediate any damage.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm containment and capture the flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {

        'url-check': function(args, term, engine) {
            var gate = SEC005Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = SEC005Config._getScenario(engine);
            var target = args.join(' ').toLowerCase();

            if (target.includes('secureauth-verify') || target.includes('microsoft365-login')) {
                return '\nURL Analysis: microsoft365-login.secureauth-verify.com\n======================================================\n  Domain: secureauth-verify.com\n  Registered: 2026-03-28 (YESTERDAY)\n  Registrar: NameCheap (privacy-protected)\n  Hosting: Cloudflare (US)\n  SSL: Let\'s Encrypt (free cert, valid)\n  Content: Microsoft 365 login clone (pixel-perfect)\n  Reputation: 3/100 (MALICIOUS — known phishing)\n  VirusTotal: 14/87 engines detect as phishing\n\n  [!] CONFIRMED CREDENTIAL HARVESTING PAGE\n  [!] Domain registered yesterday — classic indicator\n  [!] Free SSL cert makes it look legitimate to users';
            }

            if (target.includes('bit.ly') || target.includes('3xk9mpq')) {
                return '\nURL Redirect Chain Analysis: bit.ly/3xK9mPq\n=============================================\n  Hop 1: bit.ly/3xK9mPq\n    -> 302 Redirect to: tracking-redirect.com/r/7f3a2b (registered 5 days ago)\n  Hop 2: tracking-redirect.com/r/7f3a2b\n    -> 302 Redirect to: fedex-delivery-status.com/track/1Z999 (registered 3 days ago)\n  Hop 3: fedex-delivery-status.com/track/1Z999\n    -> 302 Redirect to: fedex-customs-payment.xyz/pay (registered 2 days ago)\n  Hop 4: fedex-customs-payment.xyz/pay [FINAL DESTINATION]\n    Content: Fake FedEx customs payment page\n    Harvests: Credit card number, CVV, expiration, billing address\n    SSL: Let\'s Encrypt (free)\n\n  [!] 4-hop redirect chain using legitimate URL shortener\n  [!] All intermediate domains registered within 7 days\n  [!] Final page is a credit card harvesting form';
            }

            if (target.includes('globalpay') || target.includes('fedex-shipping')) {
                return '\nDomain Analysis: ' + target + '\n  Registered: 2-7 days ago\n  Reputation: LOW (newly registered, no history)\n  [!] Likely phishing infrastructure';
            }

            return '\nUsage: url-check <url or domain>\nAnalyzes URL reputation, redirect chains, and hosting info.';
        },

        'header-analyze': function(args, term, engine) {
            var gate = SEC005Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = SEC005Config._getScenario(engine);
            if (!scenario) return '\nNo email loaded. Select a scenario first.';

            var email = scenario.phishEmail;
            var output = '\nEmail Header Analysis\n=====================\n';
            output += '  From:      ' + email.from + '\n';
            output += '  Reply-To:  ' + email.replyTo + '\n';
            output += '  To:        ' + email.to + '\n';
            output += '  Subject:   ' + email.subject + '\n';
            output += '  Date:      ' + email.date + '\n';
            output += '  SPF:       ' + email.spf + '\n';
            output += '  DKIM:      ' + email.dkim + '\n';
            output += '  DMARC:     ' + email.dmarc + '\n';
            if (email.url) output += '  URL:       ' + email.url + '\n';
            if (email.attachment) output += '  Attach:    ' + email.attachment + '\n';

            output += '\n  Analysis:\n';
            if (email.spf.includes('FAIL')) output += '  [!] SPF FAIL — sender IP not authorized for this domain\n';
            if (email.dkim.includes('FAIL')) output += '  [!] DKIM FAIL — email integrity not verified\n';
            if (email.dmarc.includes('FAIL')) output += '  [!] DMARC FAIL — domain authentication failed\n';
            if (email.from !== email.replyTo && !email.from.includes(email.replyTo.split('@')[1])) output += '  [!] REPLY-TO MISMATCH — replies go to a different domain\n';
            if (email.attachment && email.attachment.includes('.xlsm')) output += '  [!] MACRO-ENABLED ATTACHMENT — high risk of malware\n';
            if (email.spf.includes('PASS') && email.dkim.includes('PASS') && scenario.id === 'bec') output += '  [!] ALL AUTH PASSES — vendor account may be genuinely compromised\n';

            return output;
        },

        'phish-action': function(args, term, engine) {
            var gate = SEC005Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = SEC005Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (scenario && scenario.id === 'cred_harvest' && joined.includes('--cred-harvest') && joined.includes('achen')) {
                engine.state._labComplete = true;
                engine.state._flagRevealed = true;
                engine.save();
                setTimeout(function() { engine.notify('Credential harvesting contained. Password reset and sessions revoked.', 'success'); }, 400);
                return '\nPhishing Response: Credential Harvesting\n==========================================\n  Resetting password for achen... OK\n  Revoking all active sessions... OK\n  Enabling MFA re-enrollment... OK\n' + (joined.includes('--block-domain') ? '  Blocking domain secureauth-verify.com... OK\n  Adding to email gateway blocklist... OK\n  Adding to web proxy blocklist... OK\n' : '') +
                '  Searching for other recipients... 3 other users received this email\n  Quarantining phishing email from all mailboxes... OK (4 copies removed)\n  Sending awareness notification to affected users... OK\n\nCredentials were entered ~45 min ago. Password reset prevents further abuse.\n\n=== FLAG: SEC005{cred_harvest_password_reset} ===';
            }

            if (scenario && scenario.id === 'macro_doc' && joined.includes('--macro-doc') && joined.includes('dpark')) {
                engine.state._labComplete = true;
                engine.state._flagRevealed = true;
                engine.save();
                setTimeout(function() { engine.notify('Macro document contained. Host isolated and scanned.', 'success'); }, 400);
                return '\nPhishing Response: Macro-Enabled Document\n==========================================\n' + (joined.includes('--isolate') ? '  Isolating WS-ACCT-PC04 from network... OK\n' : '') +
                (joined.includes('--scan') ? '  Running EDR scan...\n    [FOUND] C:\\Users\\dpark\\AppData\\Local\\Temp\\svchost32.exe (Trojan.Qakbot)\n    [FOUND] Scheduled task: \\Microsoft\\Windows\\WinUpdate (persistence)\n    Quarantining threats... OK\n    Removing persistence... OK\n' : '') +
                '  Blocking sender domain: globalpay-services.com... OK\n  Quarantining email from all mailboxes... OK (1 copy removed)\n  Blocking .xlsm attachments from external senders... POLICY UPDATED\n\nMacro executed a download cradle that dropped Qakbot. Threat neutralized.\n\n=== FLAG: SEC005{macro_doc_payload_contained} ===';
            }

            if (scenario && scenario.id === 'reply_mismatch' && joined.includes('--bec-spoof')) {
                engine.state._labComplete = true;
                engine.state._flagRevealed = true;
                engine.save();
                setTimeout(function() { engine.notify('BEC attempt blocked. Lookalike domain added to blocklist.', 'success'); }, 400);
                return '\nPhishing Response: BEC / Reply-To Spoofing\n============================================\n' + (joined.includes('--block-domain') ? '  Blocking lookalike domain: corp-hexworth.com... OK\n  Adding to email gateway blocklist... OK\n' : '') +
                (joined.includes('--alert-finance') ? '  Alerting Finance team about wire transfer fraud attempt... OK\n  Adding wire transfer verification policy reminder... OK\n' : '') +
                '  Quarantining BEC email... OK\n  Adding DMARC reject policy for corp.hexworth.local... RECOMMENDED\n  Reporting lookalike domain to registrar... SUBMITTED\n\nFrom header was spoofed (SPF failed). Reply-To redirected to attacker domain.\nNo money was transferred. Finance team alerted to verify wire requests by phone.\n\n=== FLAG: SEC005{reply_mismatch_bec_blocked} ===';
            }

            if (scenario && scenario.id === 'url_redirect' && joined.includes('--url-chain')) {
                engine.state._labComplete = true;
                engine.state._flagRevealed = true;
                engine.save();
                setTimeout(function() { engine.notify('URL redirect chain blocked. All domains added to blocklist.', 'success'); }, 400);
                return '\nPhishing Response: URL Redirect Chain\n=======================================\n' + (joined.includes('--block-all') ? '  Blocking: tracking-redirect.com... OK\n  Blocking: fedex-delivery-status.com... OK\n  Blocking: fedex-customs-payment.xyz... OK\n  Blocking: fedex-shipping.com (sender domain)... OK\n  Adding all to web proxy blocklist... OK\n' : '') +
                (joined.includes('--check-recipients') ? '  Searching for other recipients... 12 users received this email\n  Quarantining from all mailboxes... OK (12 copies removed)\n  No users entered credit card data (all redirects blocked by proxy now)\n' : '') +
                '  Reporting domains to Google Safe Browsing... SUBMITTED\n  Reporting bit.ly link as malicious... SUBMITTED\n\n4-hop redirect chain dismantled. No data was entered by the reporter.\n\n=== FLAG: SEC005{url_redirect_chain_blocked} ===';
            }

            if (scenario && scenario.id === 'bec' && joined.includes('--vendor-bec')) {
                engine.state._labComplete = true;
                engine.state._flagRevealed = true;
                engine.save();
                setTimeout(function() { engine.notify('Vendor BEC confirmed. Payment held and vendor notified.', 'success'); }, 400);
                return '\nPhishing Response: Vendor Email Compromise\n============================================\n' + (joined.includes('--verify-oob') ? '  Out-of-band verification (phone call to known vendor number):\n    Apex Office Supplies confirms: "We did NOT send a banking change request."\n    Apex confirms: "Our email system was compromised last week. We are investigating."\n    VERDICT: Vendor email account was compromised by attacker.\n' : '') +
                (joined.includes('--hold-payment') ? '  Placing hold on all pending payments to Apex... OK\n  Flagging bank account 8834521099 as fraudulent... OK\n' : '') +
                '  Notifying Apex IT about their email compromise... OK\n  Adding "banking change" keyword filter to email gateway... OK\n  Updating AP procedures: Require phone verification for bank changes... OK\n\nVendor\'s email was legitimately compromised. No fraudulent payment was made.\n\n=== FLAG: SEC005{bec_vendor_compromise_detected} ===';
            }

            return '\nUsage: phish-action [type] [options]\n  --cred-harvest --user <user>        Credential harvesting response\n  --macro-doc --user <user>           Macro document response\n  --bec-spoof                         BEC/spoofing response\n  --url-chain                         URL redirect response\n  --vendor-bec                        Vendor BEC response\n\nOptions: --block-domain <dom>, --isolate, --scan, --alert-finance,\n         --block-all, --check-recipients, --verify-oob, --hold-payment';
        },

        whois: function(args, term, engine) {
            var gate = SEC005Config._requireScenario(engine);
            if (gate) return gate;
            var target = args[0] || '';
            if (target.includes('secureauth-verify') || target.includes('fedex-customs') || target.includes('tracking-redirect') || target.includes('fedex-delivery') || target.includes('fedex-shipping') || target.includes('globalpay')) {
                return '\nWHOIS: ' + target + '\n  Registrar: NameCheap Inc.\n  Created: 2026-03-' + (22 + Math.floor(Math.random() * 6)) + '\n  Registrant: REDACTED (privacy protection)\n  Name Servers: ns1.cloudflare.com, ns2.cloudflare.com\n\n  [!] Recently registered domain with privacy protection\n  [!] Commonly associated with phishing infrastructure';
            }
            if (target.includes('corp-hexworth.com')) {
                return '\nWHOIS: corp-hexworth.com\n  Registrar: GoDaddy\n  Created: 2026-03-27 (2 days ago)\n  Registrant: REDACTED\n\n  [!] LOOKALIKE DOMAIN — mimics corp.hexworth.local\n  [!] Registered 2 days ago — created for this BEC campaign';
            }
            return '\nUsage: whois <domain>';
        },

        'auth-log': function(args, term, engine) {
            var gate = SEC005Config._requireScenario(engine);
            if (gate) return gate;
            var joined = args.join(' ').toLowerCase();
            if (joined.includes('achen')) {
                return '\nAuth Log — achen@corp.hexworth.local\n  2026-03-29 09:27:33  SUCCESS  IP: 185.220.101.34  Location: Tor Exit Node  [!] SUSPICIOUS\n  2026-03-29 09:28:01  ACCESS   Outlook — Downloaded 12 emails\n  2026-03-29 09:30:15  ACCESS   SharePoint — Browsed /HR/Documents\n\n  [!] Unauthorized access detected from stolen credentials\n  [!] Credentials were entered on phishing page at ~08:45';
            }
            return '\nUsage: auth-log --user <username>';
        },

        whoami: function() { return 'SOC-WS01\\SOC-Analyst'; },
        hostname: function() { return 'SOC-WS01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        ifconfig: function() { return '\'ifconfig\' is not recognized.'; },
        grep: function() { return '\'grep\' is not recognized.'; },
        sudo: function() { return '\'sudo\' is not recognized.'; }
    },

    onAppLaunch(iconDef, engine) {
        if (iconDef.app === 'email_analyzer' && !engine.state._scenarioSelected) { engine.notify('Open the Security Alert first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket':         SEC005Config._openTicket(iconDef, engine); break;
            case 'email_analyzer': SEC005Config._openEmailAnalyzer(iconDef, engine); break;
            case 'reset_lab':      SEC005Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.id = 'ticketContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Security Alert', 'SEC', container);
        SEC005Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) { SEC005Config._renderTicket(engine, container); }
        else { SEC005Config._renderScenarioPicker(engine, container); }
    },

    _renderScenarioPicker(engine, container) {
        var previews = [
            'User Report — "Clicked fake Microsoft login and entered my password"',
            'User Report — "Opened Excel file from unknown sender, saw PowerShell flash"',
            'User Report — "CEO wire transfer request but Reply-To goes to wrong domain"',
            'User Report — "FedEx tracking link bounces through 3 domains to payment page"',
            'User Report — "Vendor asking to change bank account — feels suspicious"'
        ];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#dc2626; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">PHISHING REPORT QUEUE</div><div style="color:#888; font-size:0.75rem;">Select a reported phishing email to triage.</div></div><div style="margin-bottom:16px;">';
        SEC005Config._scenarios.forEach(function(s, i) {
            html += '<button class="sec-scenario-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer; transition:border-color 0.2s;"><div style="display:flex; justify-content:space-between; align-items:center;"><span style="color:#dc2626; font-weight:bold;">PHISH-' + (1000 + i) + '</span><span style="background:#f59e0b; color:#000; padding:1px 8px; border-radius:3px; font-size:0.65rem;">TRIAGE</span></div><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div></button>';
        });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="secRandomBtn" style="padding:10px 28px; background:#dc2626; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.85rem; font-family:Consolas,monospace;">Random Assignment</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.sec-scenario-btn').forEach(function(btn) {
            btn.addEventListener('mouseenter', function() { this.style.borderColor = '#dc2626'; });
            btn.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.12)'; });
            btn.addEventListener('click', function() { SEC005Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); SEC005Config._renderTicket(engine, container); });
        });
        document.getElementById('secRandomBtn').addEventListener('click', function() { SEC005Config._applyScenario(engine, Math.floor(Math.random() * SEC005Config._scenarios.length)); SEC005Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var scenario = SEC005Config._getScenario(engine);
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><div style="display:flex; justify-content:space-between; align-items:center;"><span style="color:#dc2626; font-weight:bold; font-size:1rem;">PHISHING REPORT #PHISH-' + (1000 + engine.state._scenarioId) + '</span><span style="background:#f59e0b; color:#000; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">TRIAGE REQUIRED</span></div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">REPORTED BY</div><div style="font-weight:bold; color:#dc2626;">' + scenario.affectedUser + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBJECT</div><div style="font-weight:bold;">' + SEC005Config._escHtml(scenario.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + SEC005Config._escHtml(scenario.ticketDetail) + '</div></div>'
            + (scenario.ticketExtra ? '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SOC NOTES</div><div style="background:rgba(220,38,38,0.08); border:1px solid rgba(220,38,38,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#fca5a5;">' + SEC005Config._escHtml(scenario.ticketExtra) + '</div></div>' : '')
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">ASSIGNED TO</div><div style="color:#2ecc71; font-weight:bold;">YOU — SOC Analyst (Phishing Triage)</div></div>';
    },

    _openEmailAnalyzer(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var container = document.createElement('div');
        container.id = 'emailContainer';
        container.style.cssText = 'padding:16px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Email Analyzer', 'EML', container);

        var scenario = SEC005Config._getScenario(engine);
        var email = scenario.phishEmail;
        var html = '<div style="color:#dc2626; font-weight:bold; font-size:1rem; margin-bottom:12px;">Email Analyzer — Phishing Inspection</div>';

        // Email preview
        html += '<div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; margin-bottom:16px;">';
        html += '<div style="margin-bottom:8px;"><span style="color:#888; width:60px; display:inline-block;">From:</span> ' + SEC005Config._escHtml(email.from) + '</div>';
        html += '<div style="margin-bottom:8px;"><span style="color:#888; width:60px; display:inline-block;">Reply:</span> <span style="color:' + (email.from.includes(email.replyTo.split('@')[1]) || email.from === email.replyTo ? '#aaa' : '#dc2626; font-weight:bold') + ';">' + SEC005Config._escHtml(email.replyTo) + '</span></div>';
        html += '<div style="margin-bottom:8px;"><span style="color:#888; width:60px; display:inline-block;">To:</span> ' + email.to + '</div>';
        html += '<div style="margin-bottom:8px;"><span style="color:#888; width:60px; display:inline-block;">Date:</span> ' + email.date + '</div>';
        html += '<div style="margin-bottom:8px;"><span style="color:#888; width:60px; display:inline-block;">Subj:</span> <span style="font-weight:bold;">' + SEC005Config._escHtml(email.subject) + '</span></div>';
        html += '</div>';

        // Auth results
        html += '<div style="margin-bottom:16px;"><div style="color:#dc2626; font-weight:bold; font-size:0.85rem; margin-bottom:8px;">Authentication Results</div>';
        var authItems = [
            { label: 'SPF', value: email.spf, pass: email.spf.includes('PASS') },
            { label: 'DKIM', value: email.dkim, pass: email.dkim.includes('PASS') },
            { label: 'DMARC', value: email.dmarc, pass: email.dmarc.includes('PASS') }
        ];
        authItems.forEach(function(a) {
            html += '<div style="display:flex; align-items:center; padding:6px 8px; margin-bottom:4px; background:rgba(' + (a.pass ? '34,197,94' : '220,38,38') + ',0.06); border:1px solid rgba(' + (a.pass ? '34,197,94' : '220,38,38') + ',0.15); border-radius:3px;">'
                + '<span style="width:60px; font-weight:bold; color:' + (a.pass ? '#22c55e' : '#dc2626') + ';">' + a.label + '</span>'
                + '<span style="color:' + (a.pass ? '#22c55e' : '#dc2626') + ';">' + (a.pass ? 'PASS' : 'FAIL') + '</span>'
                + '<span style="margin-left:12px; color:#888; font-size:0.75rem;">' + SEC005Config._escHtml(a.value) + '</span></div>';
        });
        html += '</div>';

        // Indicators
        if (email.url) {
            html += '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">Embedded URL</div><div style="color:#dc2626; word-break:break-all;">' + SEC005Config._escHtml(email.url) + '</div></div>';
        }
        if (email.attachment) {
            html += '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">Attachment</div><div style="color:#f59e0b;">' + email.attachment + '</div></div>';
        }

        html += '<div style="margin-top:16px; color:#888; font-size:0.75rem;">Use "header-analyze", "url-check", and "phish-action" in the terminal.</div>';

        var statusColor = engine.state._labComplete ? '#22c55e' : '#f59e0b';
        var statusText = engine.state._labComplete ? 'RESOLVED' : 'PENDING TRIAGE';
        html += '<div style="margin-top:16px; padding:12px; background:rgba(' + (engine.state._labComplete ? '34,197,94' : '245,158,11') + ',0.08); border:1px solid rgba(' + (engine.state._labComplete ? '34,197,94' : '245,158,11') + ',0.2); border-radius:4px; text-align:center;"><div style="font-size:0.75rem; color:#888;">Triage Status</div><div style="color:' + statusColor + '; font-weight:bold; font-size:1.1rem;">' + statusText + '</div></div>';

        container.innerHTML = html;
    },

    _confirmReset(engine) { if (confirm('Reset this lab? All progress will be lost.')) { engine.resetLab(); } }
};
