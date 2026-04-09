/* ============================================================
   DISPATCH LAB — Box EM005: Email Security Incident
   CompTIA Security+ SY0-701 — Email Security Investigation
   Config: phishing report, compromised forwarding, SPF/DKIM/DMARC,
   quarantine review, executive impersonation
   5 distinct scenarios
   ============================================================ */

var EM005Config = {

    title: 'Email Security Incident',
    subtitle: 'Trust No Sender — Email Security Investigation',
    difficulty: 'Intermediate',
    accent: '#22c55e',
    storageKey: 'hexworth_lab_em005',
    registryId: 'em005-email-security',
    trackerKey: 'lab_em005',
    tutorialMode: true,

    tutorial: {
        steps: [
            { title: 'Open the Security Alert', tip: 'Read the email security incident details.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check Email Security Console', tip: 'Review email headers, authentication results, and forwarding rules.', trigger: { event: 'window_open', match: { type: 'email_sec_console' } } },
            { title: 'Investigate', tip: 'Use email-forensics, fwd-audit, dmarc-check, quarantine-list to find the issue.', trigger: { event: 'command', match: { cmd: 'contains:email-forensics' }, alt: [{ event: 'command', match: { cmd: 'contains:fwd-audit' } }, { event: 'command', match: { cmd: 'contains:dmarc-check' } }] } },
            { title: 'Remediate', tip: 'Remove forwarding rules, fix DNS records, release quarantine, or block impersonation.', trigger: { event: 'command', match: { cmd: 'contains:email-fix' } } },
            { title: 'Capture the flag', tip: 'After resolving the incident, the flag appears.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: {
        certPath: 'Security+ SY0-701',
        mappings: [
            { flagId: 'fixed', objective: '2.4', description: 'Analyze indicators of malicious activity', skill: 'Email Threat Analysis' },
            { flagId: 'fixed', objective: '4.5', description: 'Modify enterprise capabilities for security', skill: 'Email Authentication (SPF/DKIM/DMARC)' }
        ]
    },

    _scenarioFlags: { phishing_report: null, compromised_fwd: null, dmarc_failure: null, quarantine_review: null, exec_impersonation: null },

    _scenarios: [
        {
            id: 'phishing_report',
            name: 'Phishing Email Reported to IT',
            ticketSubject: 'User reported suspicious email — claims to be from IT asking for password verification',
            ticketDetail: 'User Kevin Park forwarded a suspicious email to the security team. The email claims to be from "IT Support" and asks Kevin to "verify his password" by clicking a link. The email looks professional with the company logo. Kevin did NOT click the link. He wants to know if it\'s legitimate and if other users received it.',
            ticketExtra: 'SOC Note: The email was sent from itsupport@hexworth-it.com (note: our domain is corp.hexworth.local). The link points to hexworth-password-verify.com (registered 12 hours ago). Need to: (1) confirm it\'s phishing, (2) check if other users received it, (3) quarantine all copies, (4) block the sender domain.',
            affectedUser: 'kpark',
            fixDescription: 'Confirm phishing, quarantine all copies, block sender domain',
            stateOverrides: { _phishReported: true }
        },
        {
            id: 'compromised_fwd',
            name: 'Compromised Account with Forwarding Rule',
            ticketSubject: 'User account compromised — hidden forwarding rule sending copies of all email to external address',
            ticketDetail: 'During a routine security audit, the SOC discovered that user Amy Chen\'s (achen) Exchange account has a hidden inbox rule that forwards ALL incoming emails to external address "achen.backup@protonmail.com." Amy says she did not create this rule. Her account was compromised last month via a phishing link (she reset her password but the forwarding rule persisted). Sensitive HR data may have been exfiltrated via this forwarding for 3 weeks.',
            ticketExtra: 'SOC Note: Hidden forwarding rules survive password resets. The rule was created on 2026-03-08 from IP 185.220.101.34 (known threat actor). The attacker set the rule to forward only AFTER the email lands in the inbox, so the user never noticed missing emails. Check for similar rules on other recently compromised accounts.',
            affectedUser: 'achen',
            fixDescription: 'Remove hidden forwarding rule, audit other accounts, assess data loss',
            stateOverrides: { _hiddenForward: true, _forwardTarget: 'achen.backup@protonmail.com' }
        },
        {
            id: 'dmarc_failure',
            name: 'SPF/DKIM/DMARC Failure Analysis',
            ticketSubject: 'Partner company reports our emails are failing DMARC — landing in their spam',
            ticketDetail: 'Our business partner TechVault Corp reports that emails from hexworth.local are failing DMARC checks and landing in their spam folder. They sent us the DMARC aggregate report showing 34% of our emails fail authentication. This started after we added a new cloud email marketing service (MailChimp) that sends on our behalf but wasn\'t added to our SPF record.',
            ticketExtra: 'SOC Note: Current SPF record: "v=spf1 ip4:198.51.100.10 -all". This only authorizes our main mail server. MailChimp sends from their own IPs and needs "include:servers.mcsv.net" added to SPF. Also need to set up DKIM signing for MailChimp and update DMARC from p=none to p=quarantine.',
            affectedUser: 'Organization-wide',
            fixDescription: 'Update SPF to include MailChimp, configure DKIM, enforce DMARC',
            stateOverrides: { _dmarcFailing: true, _spfIncomplete: true }
        },
        {
            id: 'quarantine_review',
            name: 'Quarantine Review and Release',
            ticketSubject: 'Multiple users reporting missing emails — all stuck in admin quarantine',
            ticketDetail: 'Five users from different departments report missing emails from various external senders. All emails appear to be legitimate business communications. The spam filter upgrade last weekend introduced a new "Aggressive" scanning mode that is quarantining emails with certain characteristics: embedded images, tracking pixels, or HTML formatting from unknown senders.',
            ticketExtra: 'SOC Note: The quarantine has 47 emails from the last 3 days. Most appear to be legitimate. The new scanning rule "HTML-External-Image-Block" is too aggressive. Need to: (1) review and release legitimate emails, (2) adjust the scanning rule, (3) add sender exceptions for known business partners.',
            affectedUser: 'Multiple users',
            fixDescription: 'Review quarantine, release legitimate emails, adjust filter sensitivity',
            stateOverrides: { _quarantineBacklog: true, _quarantineCount: 47 }
        },
        {
            id: 'exec_impersonation',
            name: 'Executive Impersonation (BEC)',
            ticketSubject: 'Someone is sending emails as our CEO to vendors — external impersonation attack',
            ticketDetail: 'Three of our vendors received emails that appear to be from CEO James Whitfield (jwhitfield@corp.hexworth.local) requesting urgent bank account changes. The emails passed basic visual inspection but failed SPF/DKIM. The attacker registered "corp-hexworth.local" (hyphen instead of dot) and is sending emails with the display name "James Whitfield" from that domain. Two vendors almost processed the bank changes.',
            ticketExtra: 'SOC Note: This is an executive impersonation / BEC attack using a lookalike domain. Our DMARC policy is currently "p=none" which means receiving servers report failures but don\'t block them. Need to: (1) block the lookalike domain, (2) notify all vendors, (3) upgrade DMARC to p=reject, (4) implement anti-impersonation policy in the email gateway.',
            affectedUser: 'jwhitfield (impersonated)',
            fixDescription: 'Block lookalike domain, upgrade DMARC, notify vendors',
            stateOverrides: { _impersonation: true, _lookalikeDomain: 'corp-hexworth.local' }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Open the Email Security Console for authentication results and forwarding rules.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use email-forensics, fwd-audit, dmarc-check, quarantine-list to investigate.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each incident type requires a different response.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Use email-fix to remediate.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        phishing_report: [
            { id: 'hint1', text: 'Use "email-forensics --reported kpark" to analyze the phishing email.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The sender domain is a lookalike. Check how many users received it.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Quarantine and block: "email-fix --quarantine-phish --block-domain hexworth-it.com"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: email-fix --quarantine-phish --block-domain hexworth-it.com', cost: 150, penalty: -150 }
        ],
        compromised_fwd: [
            { id: 'hint1', text: 'Use "fwd-audit achen" to see all forwarding rules on the account.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'A hidden rule forwards all email to an external Protonmail address.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Remove it: "email-fix --remove-forward achen --audit-all"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: email-fix --remove-forward achen --audit-all', cost: 150, penalty: -150 }
        ],
        dmarc_failure: [
            { id: 'hint1', text: 'Use "dmarc-check hexworth.local" to see current email authentication config.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'SPF is missing MailChimp\'s include. DKIM not configured for them. DMARC is p=none.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Fix all three: "email-fix --update-auth --add-mailchimp"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: email-fix --update-auth --add-mailchimp', cost: 150, penalty: -150 }
        ],
        quarantine_review: [
            { id: 'hint1', text: 'Use "quarantine-list" to see all quarantined emails.', cost: 0, penalty: 0 },
            { id: 'hint2', text: '47 emails quarantined by the new aggressive HTML scanning rule.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Release and adjust: "email-fix --release-quarantine --adjust-filter"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: email-fix --release-quarantine --adjust-filter', cost: 150, penalty: -150 }
        ],
        exec_impersonation: [
            { id: 'hint1', text: 'Use "email-forensics --impersonation jwhitfield" to see the attack details.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The attacker uses corp-hexworth.local (hyphen). DMARC is p=none so nothing gets blocked.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Block and enforce: "email-fix --block-impersonation --dmarc-reject"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: email-fix --block-impersonation --dmarc-reject --notify-vendors', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !EM005Config._flagRestored) { EM005Config._flagRestored = true; var s = EM005Config._scenarios[engine.state._scenarioId]; if (s) EM005Config.hints = EM005Config._scenarioHints[s.id] || EM005Config._defaultHints; } return true; },
    _applyScenario(engine, idx) { engine.state._scenarioId = idx; engine.state._scenarioSelected = true; engine.state._phishReported = false; engine.state._hiddenForward = false; engine.state._dmarcFailing = false; engine.state._quarantineBacklog = false; engine.state._impersonation = false; engine.state._labComplete = false; engine.state._flagRevealed = false; var o = EM005Config._scenarios[idx].stateOverrides || {}; for (var k in o) engine.state[k] = o[k]; EM005Config._flagRestored = true; EM005Config.hints = EM005Config._scenarioHints[EM005Config._scenarios[idx].id] || EM005Config._defaultHints; engine.save(); },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : EM005Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active incident.\nOpen the Security Alert first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['Dell UEFI BIOS A22', 'Memory: 32768 MB OK', 'Secure Boot: Enabled', 'Loading Windows...'], grubEntries: ['Windows 10 Enterprise'], loginUser: 'SOC-Analyst' },
    desktop: { icons: [{ id: 'cmd', label: 'Command\nPrompt', icon: '>_', app: 'terminal' }, { id: 'emsec', label: 'Email\nSecurity', icon: 'EMS', app: 'email_sec_console' }, { id: 'ticket', label: 'Security\nAlert', icon: 'SEC', app: 'ticket' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }] },
    terminal: { user: 'SOC-Analyst', hostname: 'SOC-WS01', startDir: 'C:\\Users\\SOC-Analyst', promptStyle: 'windows', welcome: 'Microsoft Windows [Version 10.0.19045.4412]\n\nSOC Workstation — Email Security Tools Active\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [{ id: 'hint1', text: 'Check Email Security Console.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'Use forensic tools.', cost: 10, penalty: -10 }, { id: 'hint3', text: 'Each incident has a different cause.', cost: 25, penalty: -25 }, { id: 'hint4', text: 'Use email-fix.', cost: 50, penalty: -50 }],
    lore: { intro: 'Email security incidents are stacking up. From phishing reports to compromised accounts and authentication failures, investigate and remediate each threat.', scenario: 'Each scenario involves a different email security threat.', outro: 'Email security incidents resolved. Authentication hardened and threats neutralized.' },
    phases: [{ id: 'investigate', name: 'Investigation', description: 'Analyze the email security incident.', requiredFlags: [], unlocks: ['analyze'], locked: false }, { id: 'analyze', name: 'Analysis', description: 'Determine scope and impact.', requiredFlags: [], unlocks: ['remediate'], locked: true }, { id: 'remediate', name: 'Remediation', description: 'Fix the vulnerability.', requiredFlags: [], unlocks: ['verify'], locked: true }, { id: 'verify', name: 'Verification', description: 'Confirm resolution.', requiredFlags: ['fixed'], unlocks: [], locked: true }],

    commands: {
        'email-forensics': function(args, term, engine) {
            var gate = EM005Config._requireScenario(engine); if (gate) return gate;
            var scenario = EM005Config._getScenario(engine); var joined = args.join(' ').toLowerCase();

            if (scenario && scenario.id === 'phishing_report' && joined.includes('kpark')) {
                return '\nEmail Forensics — Reported Phishing\n=====================================\n  From: "IT Support" <itsupport@hexworth-it.com>\n  To: kpark@corp.hexworth.local\n  Subject: Urgent: Password Verification Required\n  Date: 2026-03-29 08:15:33\n\n  SPF: PASS (hexworth-it.com — attacker\'s own domain)\n  DKIM: PASS (hexworth-it.com)\n  DMARC: PASS (hexworth-it.com)\n\n  [!] Auth all passes because it\'s the ATTACKER\'S domain, not ours\n  [!] hexworth-it.com registered 12 hours ago (NameCheap, privacy-protected)\n  [!] Link: hexworth-password-verify.com/reset (credential harvesting page)\n\n  Recipient Search: 23 users received this email\n  Clicked Link: 0 users (per proxy logs)\n\n  VERDICT: CONFIRMED PHISHING — credential harvesting via lookalike domain';
            }
            if (scenario && scenario.id === 'exec_impersonation' && joined.includes('jwhitfield')) {
                return '\nEmail Forensics — Executive Impersonation\n==========================================\n  Impersonated: James Whitfield (CEO)\n  Attacker Domain: corp-hexworth.local (lookalike — hyphen vs dot)\n  Registered: 2026-03-26 (3 days ago)\n\n  Emails sent to vendors:\n    1. Apex Office Supplies — "Please update banking info" (2026-03-27)\n    2. TechVault Corp — "Urgent wire transfer needed" (2026-03-28)\n    3. GlobalShip Logistics — "New payment account" (2026-03-29)\n\n  SPF on impersonation emails: FAIL (from corp-hexworth.local)\n  Our DMARC policy: p=none (report only, DO NOT block)\n  [!] With p=none, receiving servers show the email even though SPF fails\n  [!] Two vendors almost processed fraudulent bank changes\n\n  Recommendation: Upgrade DMARC to p=reject immediately';
            }
            return '\nUsage: email-forensics --reported <user> | --impersonation <user>';
        },

        'fwd-audit': function(args, term, engine) {
            var gate = EM005Config._requireScenario(engine); if (gate) return gate;
            var scenario = EM005Config._getScenario(engine); var target = args[0] || '';
            if (scenario && scenario.id === 'compromised_fwd' && target === 'achen') {
                return '\nForwarding Rule Audit — achen@corp.hexworth.local\n===================================================\n  Inbox Rules:\n    1. "Move newsletters to Reading folder"  — Visible, Created by user\n    2. "Auto-reply when OOO" — Visible, Created by user\n    3. [HIDDEN] "backup-sync" — HIDDEN RULE\n       Condition: Apply to all incoming messages\n       Action: Forward to achen.backup@protonmail.com\n       Created: 2026-03-08 from IP 185.220.101.34\n       Created by: External session (compromised credentials)\n\n  [!] HIDDEN FORWARDING RULE DETECTED\n  [!] ALL incoming email forwarded to external Protonmail for 3 WEEKS\n  [!] Rule survived the password reset on 2026-03-10\n  [!] Estimated emails forwarded: ~450 (including HR sensitive data)\n\n  Other accounts with hidden forward rules:\n    Scanning... 1 additional found:\n    bsmith — forward to bsmith.backup@tutanota.com (created 2026-03-09)';
            }
            return '\nUsage: fwd-audit <username>';
        },

        'dmarc-check': function(args, term, engine) {
            var gate = EM005Config._requireScenario(engine); if (gate) return gate;
            var scenario = EM005Config._getScenario(engine); var target = args.join(' ').toLowerCase();
            if (target.includes('hexworth')) {
                var output = '\nEmail Authentication Check — hexworth.local\n=============================================\n';
                if (scenario && scenario.id === 'dmarc_failure') {
                    output += '  SPF: "v=spf1 ip4:198.51.100.10 -all"\n    [!] MISSING: include:servers.mcsv.net (MailChimp)\n    [!] MailChimp emails from our domain fail SPF\n\n  DKIM:\n    Selector "default": CONFIGURED (main mail server)\n    Selector "mc": NOT CONFIGURED [!] (MailChimp needs DKIM key)\n\n  DMARC: "v=DMARC1; p=none; rua=mailto:dmarc@hexworth.local"\n    Policy: NONE (report only — no enforcement)\n    [!] p=none means failures are reported but not blocked\n    [!] 34% of outbound emails failing authentication\n\n  Issues:\n    1. SPF missing MailChimp include\n    2. DKIM not configured for MailChimp\n    3. DMARC policy too permissive (p=none)';
                } else if (scenario && scenario.id === 'exec_impersonation') {
                    output += '  SPF: "v=spf1 ip4:198.51.100.10 -all" (OK)\n  DKIM: Configured (OK)\n  DMARC: "v=DMARC1; p=none; rua=mailto:dmarc@hexworth.local"\n    [!] Policy: NONE — impersonation emails are delivered even when SPF/DKIM fail\n    [!] Upgrade to p=reject to block unauthorized senders';
                } else {
                    output += '  SPF: CONFIGURED\n  DKIM: CONFIGURED\n  DMARC: CONFIGURED';
                }
                return output;
            }
            return '\nUsage: dmarc-check <domain>';
        },

        'quarantine-list': function(args, term, engine) {
            var gate = EM005Config._requireScenario(engine); if (gate) return gate;
            var scenario = EM005Config._getScenario(engine);
            if (scenario && scenario.id === 'quarantine_review') {
                return '\nAdmin Quarantine — Last 3 Days\n================================\n  Total quarantined: 47 emails\n  Rule triggered: "HTML-External-Image-Block" (deployed 2026-03-27)\n\n  Sample quarantined emails (showing 5 of 47):\n    Q-301  vendor@techvault.com     -> jlee       "Q2 Partnership Proposal"     Legit\n    Q-302  hr@recruitfirm.com       -> psimmons   "Candidate Resume - M.Chen"   Legit\n    Q-303  billing@aws.amazon.com   -> devops     "March AWS Invoice"           Legit\n    Q-304  news@reuters.com         -> cjohnson   "Daily Market Briefing"       Legit\n    Q-305  support@salesforce.com   -> tharris    "Case #4892 Update"           Legit\n\n  [!] All 47 contain HTML formatting with external images (tracking pixels)\n  [!] The new rule is too aggressive — quarantining normal business email\n  [!] Rule should be adjusted to only flag UNKNOWN senders, not all external';
            }
            return '\nAdmin Quarantine\n  No messages in quarantine.';
        },

        'email-fix': function(args, term, engine) {
            var gate = EM005Config._requireScenario(engine); if (gate) return gate;
            var scenario = EM005Config._getScenario(engine); var joined = args.join(' ').toLowerCase();

            if (scenario && scenario.id === 'phishing_report' && joined.includes('--quarantine-phish')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Phishing emails quarantined and sender domain blocked.', 'success'); }, 400);
                return '\nPhishing Response\n==================\n  Quarantining phishing email from all 23 mailboxes... OK\n' + (joined.includes('--block-domain') ? '  Blocking sender domain: hexworth-it.com... OK\n  Blocking phishing URL: hexworth-password-verify.com... OK\n' : '') +
                '  Adding to email gateway blocklist... OK\n  Sending awareness notification to 23 affected users... OK\n  Reporting domains to registrar... SUBMITTED\n\n  0 users clicked the link. All 23 copies quarantined.\n\n=== FLAG: EM005{phishing_report_quarantined_blocked} ===';
            }
            if (scenario && scenario.id === 'compromised_fwd' && joined.includes('--remove-forward') && joined.includes('achen')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Hidden forwarding rules removed. Accounts secured.', 'success'); }, 400);
                return '\nForwarding Rule Removal\n========================\n  Removing hidden rule "backup-sync" from achen... OK\n  Removing hidden rule from bsmith... OK\n' + (joined.includes('--audit-all') ? '  Scanning all 450 mailboxes for hidden forward rules... OK\n  Results: 2 found (achen, bsmith) — both removed\n' : '') +
                '  Blocking external forwarding for compromised accounts... OK\n  Forcing password reset for bsmith... OK\n  Estimated data exposure: ~450 emails (achen), ~380 emails (bsmith)\n  Escalating to Legal for data breach assessment... OK\n\n=== FLAG: EM005{compromised_fwd_rules_purged} ===';
            }
            if (scenario && scenario.id === 'dmarc_failure' && joined.includes('--update-auth')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Email authentication updated. SPF, DKIM, DMARC all configured.', 'success'); }, 400);
                return '\nEmail Authentication Update\n============================\n  Updating SPF record...\n    Old: "v=spf1 ip4:198.51.100.10 -all"\n    New: "v=spf1 ip4:198.51.100.10 include:servers.mcsv.net -all"\n    Status: PUBLISHED\n\n' + (joined.includes('--add-mailchimp') ? '  Configuring DKIM for MailChimp...\n    Adding CNAME: mc._domainkey.hexworth.local -> dkim.mcsv.net\n    Status: PUBLISHED\n\n' : '') +
                '  Updating DMARC policy...\n    Old: "v=DMARC1; p=none; rua=mailto:dmarc@hexworth.local"\n    New: "v=DMARC1; p=quarantine; rua=mailto:dmarc@hexworth.local; pct=100"\n    Status: PUBLISHED\n\n  MailChimp emails will now pass SPF and DKIM.\n  DMARC upgraded from p=none to p=quarantine.\n\n=== FLAG: EM005{dmarc_failure_auth_hardened} ===';
            }
            if (scenario && scenario.id === 'quarantine_review' && joined.includes('--release-quarantine')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Quarantine cleared and filter adjusted. Legitimate email flowing.', 'success'); }, 400);
                return '\nQuarantine Management\n======================\n  Releasing 47 quarantined emails... OK (all delivered to recipients)\n' + (joined.includes('--adjust-filter') ? '  Adjusting rule "HTML-External-Image-Block":\n    Old: Block ALL external emails with HTML images\n    New: Block external emails with HTML images from UNKNOWN senders only\n    Known senders (auto-whitelist from last 90 days): 234 domains added\n    Status: UPDATED\n' : '') +
                '\n  47 legitimate business emails delivered.\n  Filter adjusted to reduce false positives while maintaining security.\n\n=== FLAG: EM005{quarantine_review_filter_tuned} ===';
            }
            if (scenario && scenario.id === 'exec_impersonation' && joined.includes('--block-impersonation')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Impersonation blocked. DMARC enforced. Vendors notified.', 'success'); }, 400);
                return '\nExecutive Impersonation Response\n=================================\n  Blocking lookalike domain: corp-hexworth.local... OK\n  Adding to email gateway impersonation protection... OK\n' + (joined.includes('--dmarc-reject') ? '  Upgrading DMARC: p=none -> p=reject... OK\n  All unauthorized emails claiming to be from hexworth.local will now be REJECTED.\n' : '') +
                (joined.includes('--notify-vendors') ? '  Sending vendor security notification to all 47 active vendors... OK\n  Notification: "Verify any banking change requests by phone."\n' : '') +
                '  Reporting lookalike domain to registrar... SUBMITTED\n  Adding anti-impersonation rule for CEO display name... OK\n\n  BEC attack neutralized. No fraudulent payments were made.\n\n=== FLAG: EM005{exec_impersonation_dmarc_enforced} ===';
            }

            return '\nUsage: email-fix [action]\n  --quarantine-phish              Quarantine phishing from all mailboxes\n  --block-domain <domain>         Block sender domain\n  --remove-forward <user>         Remove hidden forwarding rules\n  --audit-all                     Audit all mailboxes for hidden rules\n  --update-auth                   Update SPF/DKIM/DMARC\n  --add-mailchimp                 Add MailChimp to email auth\n  --release-quarantine            Release quarantined emails\n  --adjust-filter                 Tune spam filter sensitivity\n  --block-impersonation           Block executive impersonation\n  --dmarc-reject                  Upgrade DMARC to p=reject\n  --notify-vendors                Send security notification to vendors';
        },

        whoami: function() { return 'SOC-WS01\\SOC-Analyst'; },
        hostname: function() { return 'SOC-WS01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        ifconfig: function() { return '\'ifconfig\' is not recognized.'; },
        grep: function() { return '\'grep\' is not recognized.'; },
        sudo: function() { return '\'sudo\' is not recognized.'; }
    },

    onAppLaunch(iconDef, engine) {
        if (iconDef.app === 'email_sec_console' && !engine.state._scenarioSelected) { engine.notify('Open the Security Alert first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': EM005Config._openTicket(iconDef, engine); break;
            case 'email_sec_console': EM005Config._openEmailSec(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset?')) engine.resetLab(); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Security Alert', 'SEC', c);
        EM005Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) { EM005Config._renderTicket(engine, c); } else { EM005Config._renderPicker(engine, c); }
    },

    _renderPicker(engine, container) {
        var p = ['Kevin Park — "Got suspicious email claiming to be from IT Support"', 'SOC Audit — "Hidden forwarding rule found on compromised account"', 'Partner Report — "Our emails failing DMARC at TechVault Corp"', 'Multiple Users — "Missing emails stuck in admin quarantine"', 'Vendor Alert — "Someone impersonating our CEO to vendors"'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#22c55e; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">EMAIL SECURITY INCIDENTS</div></div><div style="margin-bottom:16px;">';
        EM005Config._scenarios.forEach(function(s, i) { html += '<button class="em-scenario-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><div style="display:flex; justify-content:space-between;"><span style="color:#22c55e; font-weight:bold;">EMS-' + (1000 + i) + '</span><span style="background:#dc2626; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">HIGH</span></div><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + p[i] + '</div></button>'; });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="emRandomBtn" style="padding:10px 28px; background:#22c55e; color:#000; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.em-scenario-btn').forEach(function(btn) { btn.addEventListener('click', function() { EM005Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); EM005Config._renderTicket(engine, container); }); });
        document.getElementById('emRandomBtn').addEventListener('click', function() { EM005Config._applyScenario(engine, Math.floor(Math.random() * EM005Config._scenarios.length)); EM005Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var s = EM005Config._getScenario(engine);
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><span style="color:#22c55e; font-weight:bold; font-size:1rem;">INCIDENT #EMS-' + (1000 + engine.state._scenarioId) + '</span></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">AFFECTED</div><div style="font-weight:bold; color:#22c55e;">' + s.affectedUser + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + EM005Config._escHtml(s.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + EM005Config._escHtml(s.ticketDetail) + '</div></div>'
            + (s.ticketExtra ? '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SOC NOTES</div><div style="background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#86efac;">' + EM005Config._escHtml(s.ticketExtra) + '</div></div>' : '')
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#2ecc71; font-weight:bold;">Assigned to: YOU — SOC Analyst</div></div>';
    },

    _openEmailSec(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'emsecContainer';
        c.style.cssText = 'padding:16px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Email Security Console', 'EMS', c);
        var sc = engine.state._labComplete ? '#22c55e' : '#dc2626';
        c.innerHTML = '<div style="color:#22c55e; font-weight:bold; font-size:1rem; margin-bottom:12px;">Email Security Console</div><div style="padding:12px; background:rgba(' + (engine.state._labComplete ? '34,197,94' : '220,38,38') + ',0.08); border:1px solid rgba(' + (engine.state._labComplete ? '34,197,94' : '220,38,38') + ',0.2); border-radius:4px; text-align:center;"><div style="color:' + sc + '; font-weight:bold;">' + (engine.state._labComplete ? 'RESOLVED' : 'ACTIVE INCIDENT') + '</div></div><div style="margin-top:16px; color:#888; font-size:0.75rem;">Use: email-forensics, fwd-audit, dmarc-check, quarantine-list, email-fix</div>';
    }
};
