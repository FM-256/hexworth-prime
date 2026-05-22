/* ============================================================
   DISPATCH LAB — Box VPN005: Always-On VPN Bypass
   CompTIA Security+ SY0-701 / CySA+ — VPN Policy Enforcement
   Config: GPO not applying, captive portal override, exclusion
   routes leaking, cert revoked, compliance check failing
   5 distinct scenarios
   ============================================================ */

var VPN005Config = {

    // ==========================================================
    // BOX METADATA
    // ==========================================================

    title: 'Always-On VPN Bypass',
    subtitle: 'Corporate VPN Policy Being Circumvented — Seal the Gaps',
    difficulty: 'Advanced',
    accent: '#7c3aed',
    storageKey: 'hexworth_lab_vpn005',
    registryId: 'vpn005-always-on-bypass',
    trackerKey: 'lab_vpn005',

    // ==========================================================
    // TUTORIAL MODE
    // ==========================================================

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Open the Policy Alert',
                tip: 'Double-click the VPN Alert to read the compliance violation report.',
                trigger: { event: 'window_open', match: { type: 'ticket' } }
            },
            {
                title: 'Check the Compliance Dashboard',
                tip: 'Open the Compliance Dashboard to review policy status across endpoints.',
                trigger: { event: 'window_open', match: { type: 'compliance_dashboard' } }
            },
            {
                title: 'Investigate with CLI tools',
                tip: 'Use the terminal to check GPO status, routing, certificates, and compliance posture.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:show' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:gpo' } },
                        { event: 'command', match: { cmd: 'contains:compliance' } },
                        { event: 'command', match: { cmd: 'contains:route' } }
                    ]
                }
            },
            {
                title: 'Apply the fix',
                tip: 'Seal the bypass by fixing GPO, captive portal, routes, certs, or compliance.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:fix' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:set' } },
                        { event: 'command', match: { cmd: 'contains:enforce' } },
                        { event: 'command', match: { cmd: 'contains:remove' } }
                    ]
                }
            },
            {
                title: 'Capture the flag',
                tip: 'After sealing the bypass, the flag will appear.',
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
            { flagId: 'fixed', objective: '3.2', description: 'Apply security principles to secure enterprise infrastructure', skill: 'VPN Policy Enforcement' },
            { flagId: 'fixed', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources', skill: 'Always-On VPN Compliance' }
        ]
    },

    // ==========================================================
    // ALERT DATA
    // ==========================================================

    _alerts: [
        { id: 'POL-2026-0501', severity: 'CRITICAL', engine: 'Intune + FortiClient EMS', host: 'Multiple endpoints', user: 'Various', detected: '2026-04-01 11:00:00' }
    ],

    // ==========================================================
    // SCENARIO FLAGS
    // ==========================================================

    _scenarioFlags: {
        gpo_not_applying:    null,
        captive_portal:      null,
        exclusion_leak:      null,
        cert_revoked:        null,
        compliance_failing:  null
    },

    // ==========================================================
    // SCENARIOS
    // ==========================================================

    _scenarios: [
        {
            // Scenario 0: GPO Not Applying
            // The Always-On VPN group policy is not applying to 35 machines.
            // They were moved to a new OU during an AD restructure last week
            // but the GPO link was not updated. These machines can browse
            // without VPN, violating corporate security policy.
            id: 'gpo_not_applying',
            name: 'GPO Not Applying',
            ticketSubject: '35 endpoints bypassing Always-On VPN — GPO not applying after OU restructure',
            ticketDetail: 'Compliance monitoring detected that 35 remote laptops are browsing the internet without the Always-On VPN connected. These machines should be enforcing mandatory VPN connectivity per corporate security policy. The issue began after an Active Directory OU restructure last week when the Remote Workers OU was reorganized.',
            ticketExtra: 'Admin Note: The Always-On VPN configuration is deployed via GPO "VPN-Always-On-Enforce" linked to the old OU "OU=Remote-Workers,OU=Workstations,DC=hexworth,DC=local". During the AD restructure, 35 machines were moved to "OU=Remote-Laptops,OU=Endpoints,DC=hexworth,DC=local" which does not have the GPO linked. The GPO link needs to be added to the new OU.',
            affectedHost: 0,
            fixDescription: 'Link the Always-On VPN GPO to the new OU',
            stateOverrides: { _gpoMissing: true, _ouMismatch: true }
        },
        {
            // Scenario 1: Captive Portal Override
            // The Always-On VPN has a captive portal detection feature that
            // temporarily allows unprotected internet access when a captive
            // portal is detected (hotel/airport Wi-Fi). An attacker-controlled
            // AP is spoofing captive portal detection, causing the VPN to
            // permanently disconnect and allow unprotected browsing.
            id: 'captive_portal',
            name: 'Captive Portal Override',
            ticketSubject: 'VPN disconnects at branch office — captive portal spoofing detected',
            ticketDetail: 'Multiple users at the downtown branch report that the Always-On VPN keeps disconnecting and allowing unprotected internet access. Investigation reveals a rogue access point in the building is responding to captive portal detection probes, tricking the VPN client into thinking it needs to pause VPN enforcement for portal login. This is being exploited to bypass the Always-On policy.',
            ticketExtra: 'Admin Note: The VPN client checks for captive portals by making HTTP requests to a detection URL. If the response is redirected, it assumes a captive portal and temporarily pauses enforcement. The rogue AP always returns a redirect response, keeping the VPN permanently paused. Fix: set the captive portal timeout to a short duration and enable HTTPS-only detection with certificate pinning.',
            affectedHost: 0,
            fixDescription: 'Harden captive portal detection to prevent spoofing abuse',
            stateOverrides: { _portalSpoofed: true, _vpnPaused: true }
        },
        {
            // Scenario 2: Exclusion Routes Leaking
            // The Always-On VPN has exclusion routes for Microsoft 365 and
            // Zoom (to reduce VPN bandwidth). However, the exclusion list
            // is too broad — it includes entire /8 blocks that encompass
            // non-corporate destinations. Users can access anything in those
            // IP ranges without VPN protection.
            id: 'exclusion_leak',
            name: 'Exclusion Routes Leaking',
            ticketSubject: 'VPN exclusion routes too broad — users accessing non-corporate sites without VPN',
            ticketDetail: 'DLP monitoring flagged that users are accessing non-corporate websites without VPN protection despite the Always-On policy. Investigation shows the split tunnel exclusion list includes overly broad IP ranges added for Microsoft 365 optimization. The exclusion "13.0.0.0/8" was meant for Microsoft Azure endpoints but it includes millions of non-Microsoft IPs that now bypass the VPN.',
            ticketExtra: 'Admin Note: The exclusion list was configured with broad CIDR blocks for simplicity: 13.0.0.0/8, 52.0.0.0/8, 104.0.0.0/8. These were intended for M365/Azure but include vast ranges of non-Microsoft IPs. Replace with Microsoft\'s published specific /16 and /24 ranges from their endpoint list. Use "show exclusion-routes" to see the current list and "vpn-policy set exclusions precise" to apply Microsoft\'s official IP list.',
            affectedHost: 0,
            fixDescription: 'Replace broad exclusion routes with precise Microsoft-published ranges',
            stateOverrides: { _broadExclusions: true, _leakingRoutes: true }
        },
        {
            // Scenario 3: Machine Certificate Revoked
            // The Always-On VPN uses machine certificate authentication.
            // A batch of 20 machine certs were accidentally revoked by a
            // junior admin who ran the wrong revocation script. These machines
            // cannot establish the VPN tunnel, so they fall back to
            // unprotected internet access.
            id: 'cert_revoked',
            name: 'Certificate Revoked',
            ticketSubject: '20 machines cannot connect to Always-On VPN — certificates accidentally revoked',
            ticketDetail: 'Twenty remote machines suddenly lost VPN connectivity this morning. The Always-On VPN uses machine certificate authentication and these machines are getting "Certificate revoked" errors. Investigation reveals that a junior admin accidentally ran a revocation script against the wrong certificate batch at 07:00. These machines are now browsing without VPN protection because the Always-On client falls back to unprotected mode when it cannot authenticate.',
            ticketExtra: 'Admin Note: The revocation was accidental — these certificates should be valid. The CRL has been updated with the revoked serials. Options: (1) Un-revoke the certificates by removing them from the CRL and regenerating it, (2) Reissue new certificates to affected machines. Option 1 is faster. Use "cert unrevoke --batch accidental" to remove the serials from the CRL.',
            affectedHost: 0,
            fixDescription: 'Un-revoke the accidentally revoked machine certificates',
            stateOverrides: { _certsRevoked: true, _accidentalRevoke: true }
        },
        {
            // Scenario 4: Compliance Check Failing
            // The Always-On VPN performs a Network Access Protection (NAP)
            // compliance check before allowing tunnel establishment. The
            // compliance server is checking for antivirus definitions that
            // were updated to a new format, causing 60% of machines to fail
            // the compliance check and be denied VPN access.
            id: 'compliance_failing',
            name: 'Compliance Check Failing',
            ticketSubject: '60% of machines failing VPN compliance check — AV definition format change',
            ticketDetail: 'The Always-On VPN requires endpoints to pass a compliance health check before the tunnel is established. Since the antivirus vendor pushed a definition format update at 06:00, 60% of machines are failing the compliance check with "AV definitions outdated" even though their definitions are current. The compliance server is not recognizing the new definition format.',
            ticketExtra: 'Admin Note: The AV vendor changed their definition file format from v3 to v4. The compliance server (FortiClient EMS) is checking for v3 format signatures and reporting v4 definitions as "outdated." The EMS server needs a compliance rule update to recognize v4 format. Use "compliance update-rule av-format v4" to update the rule. Alternatively, temporarily lower the compliance strictness while the rule is updated.',
            affectedHost: 0,
            fixDescription: 'Update compliance rule to recognize new AV definition format',
            stateOverrides: { _complianceFailing: true, _avFormatMismatch: true }
        }
    ],

    // ==========================================================
    // PER-SCENARIO HINTS
    // ==========================================================

    _defaultHints: [
        { id: 'hint1', text: 'Open the Compliance Dashboard to see which endpoints are non-compliant.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal: show gpo-status, show exclusion-routes, show compliance-report.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a different bypass mechanism: GPO, captive portal, routes, certs, or compliance.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after sealing the bypass.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        gpo_not_applying: [
            { id: 'hint1', text: '35 machines moved to a new OU during AD restructure. The GPO link was not updated.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "show gpo-status" to see which OUs have the Always-On VPN GPO linked.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The new OU "Remote-Laptops" does not have the GPO linked. Link it there.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: gpo link "VPN-Always-On-Enforce" --ou "Remote-Laptops"', cost: 150, penalty: -150 }
        ],
        captive_portal: [
            { id: 'hint1', text: 'A rogue AP is spoofing captive portal detection to keep the VPN paused.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "show captive-portal-status" to see the detection state and timeout.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The portal timeout is infinite and detection uses HTTP. Harden with short timeout + HTTPS pinning.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: vpn-policy set captive-portal hardened — sets 30s timeout + HTTPS detection with cert pinning.', cost: 150, penalty: -150 }
        ],
        exclusion_leak: [
            { id: 'hint1', text: 'Exclusion routes are too broad — entire /8 blocks bypass the VPN.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "show exclusion-routes" to see the current list. Note the broad CIDR blocks.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Replace 13.0.0.0/8, 52.0.0.0/8, 104.0.0.0/8 with Microsoft official /16 and /24 ranges.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: vpn-policy set exclusions precise — replaces broad ranges with published Microsoft endpoints.', cost: 150, penalty: -150 }
        ],
        cert_revoked: [
            { id: 'hint1', text: '20 machine certs were accidentally revoked. They need to be un-revoked.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "show cert-revocation" to see the accidentally revoked certificate serials.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Remove the accidental revocations from the CRL and regenerate it.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: cert unrevoke --batch accidental — removes the serials from CRL and regenerates.', cost: 150, penalty: -150 }
        ],
        compliance_failing: [
            { id: 'hint1', text: 'AV vendor changed definition format from v3 to v4. Compliance server rejects v4.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run "show compliance-report" to see the failure reason and affected machines.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The EMS compliance rule checks for v3 format. Update it to accept v4.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: compliance update-rule av-format v4 — updates the rule to recognize new format.', cost: 150, penalty: -150 }
        ]
    },

    // ==========================================================
    // HELPERS
    // ==========================================================

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !VPN005Config._flagRestored) {
            VPN005Config._flagRestored = true;
            var scenario = VPN005Config._scenarios[engine.state._scenarioId];
            if (scenario) { VPN005Config.hints = VPN005Config._scenarioHints[scenario.id] || VPN005Config._defaultHints; }
        }
        return true;
    },

    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._scenarioSelected = true;
        engine.state._gpoMissing = false;
        engine.state._ouMismatch = false;
        engine.state._portalSpoofed = false;
        engine.state._vpnPaused = false;
        engine.state._broadExclusions = false;
        engine.state._leakingRoutes = false;
        engine.state._certsRevoked = false;
        engine.state._accidentalRevoke = false;
        engine.state._complianceFailing = false;
        engine.state._avFormatMismatch = false;
        engine.state._labComplete = false;
        engine.state._flagRevealed = false;

        var overrides = VPN005Config._scenarios[idx].stateOverrides || {};
        for (var key in overrides) { engine.state[key] = overrides[key]; }
        VPN005Config._flagRestored = true;
        VPN005Config.hints = VPN005Config._scenarioHints[VPN005Config._scenarios[idx].id] || VPN005Config._defaultHints;
        engine.save();
    },

    _getScenario(engine) { return engine.state._scenarioId == null ? null : VPN005Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active policy incident assigned.\nOpen the VPN Alert first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    // ==========================================================
    // BOOT / DESKTOP / TERMINAL / FLAGS / SCORING
    // ==========================================================

    boot: {
        biosLines: ['Microsoft Intune + FortiClient EMS — Policy Engine', 'Active Directory: hexworth.local', 'GPO Processing Engine: Online', 'Compliance Server: FortiClient EMS v7.2', 'Certificate Authority: Hexworth-Internal-CA', 'Loading management console...'],
        grubEntries: ['Windows Server 2022 (Management)', 'Recovery Mode'],
        loginUser: 'VPN-Policy-Admin'
    },

    desktop: {
        icons: [
            { id: 'cmd',           label: 'Policy\nTerminal',      icon: '>_',  app: 'terminal' },
            { id: 'compliance',    label: 'Compliance\nDashboard',  icon: 'CMP', app: 'compliance_dashboard' },
            { id: 'policy_mgr',   label: 'Policy\nManager',        icon: 'POL', app: 'policy_mgr' },
            { id: 'ticket',       label: 'VPN\nAlert',             icon: 'TKT', app: 'ticket' },
            { id: 'hints',        label: 'Hints',                  icon: '?',   app: 'hints' },
            { id: 'reset',        label: 'Reset\nLab',             icon: 'RST', app: 'reset_lab' }
        ]
    },

    terminal: { user: 'VPN-Policy-Admin', hostname: 'MGMT-SRV01', startDir: 'C:\\Admin', promptStyle: 'windows', welcome: 'Hexworth Policy Management Server\nIntune + FortiClient EMS + AD GPO Console\nType "help" for available commands.\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [ { id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 } ],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [ { id: 'hint1', text: 'Check the Compliance Dashboard for policy violations.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'Use: show gpo-status, show exclusion-routes, show compliance-report.', cost: 10, penalty: -10 }, { id: 'hint3', text: 'Each scenario has a different bypass mechanism.', cost: 25, penalty: -25 }, { id: 'hint4', text: 'The flag appears after sealing the bypass.', cost: 50, penalty: -50 } ],

    lore: {
        intro: 'The security team detected endpoints bypassing the corporate Always-On VPN policy. Users are browsing unprotected. As the VPN policy administrator, identify the bypass mechanism and seal it.',
        scenario: 'Each scenario targets a different Always-On VPN enforcement gap — GPO deployment, captive portal exploitation, exclusion route abuse, certificate revocation, or compliance check failures.',
        outro: 'Bypass sealed. Your investigation identified the enforcement gap and restored mandatory VPN coverage across all affected endpoints.'
    },

    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Review the policy alert and check endpoint compliance.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify the specific bypass mechanism.', requiredFlags: [], unlocks: ['remediate'], locked: true },
        { id: 'remediate', name: 'Remediation', description: 'Seal the bypass and restore policy enforcement.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm all endpoints are compliant and capture the flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    // ==========================================================
    // COMMANDS
    // ==========================================================

    commands: {

        // show — GPO status, exclusion routes, captive portal, certs, compliance
        'show': function(args, term, engine) {
            var gate = VPN005Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = VPN005Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            // show gpo-status — Active Directory GPO linkage
            if (joined.includes('gpo')) {
                if (scenario && scenario.id === 'gpo_not_applying' && engine.state._gpoMissing && !engine.state._labComplete) {
                    return '\nGPO Link Status — "VPN-Always-On-Enforce":\n=============================================================\n  OU: Remote-Workers (OU=Remote-Workers,OU=Workstations)    LINKED  [165 machines]\n  OU: Remote-Laptops (OU=Remote-Laptops,OU=Endpoints)       NOT LINKED  [35 machines]\n  OU: Executives     (OU=Executives,OU=Workstations)         LINKED  [12 machines]\n\n  [!] 35 machines in "Remote-Laptops" OU are NOT receiving the GPO.\n  These machines were moved during AD restructure on 2026-03-25.\n  The GPO link was not added to the new OU.\n\n  Fix: gpo link "VPN-Always-On-Enforce" --ou "Remote-Laptops"';
                }
                return '\nGPO Link Status — "VPN-Always-On-Enforce":\n=============================================================\n  All OUs with remote endpoints: LINKED\n  Total machines receiving GPO: 212\n  Status: ENFORCED';
            }

            // show exclusion-routes — split tunnel exclusion list
            if (joined.includes('exclusion') || joined.includes('routes')) {
                if (scenario && scenario.id === 'exclusion_leak' && engine.state._broadExclusions && !engine.state._labComplete) {
                    return '\nVPN Exclusion Routes (Bypass VPN):\n=============================================================\n  13.0.0.0/8      (Intended: Azure)    16.7M IPs  [TOO BROAD]\n  52.0.0.0/8      (Intended: AWS/Azure) 16.7M IPs  [TOO BROAD]\n  104.0.0.0/8     (Intended: Azure CDN) 16.7M IPs  [TOO BROAD]\n\n  Total excluded IPs: ~50 million\n  Microsoft official endpoints: ~12,000 IPs\n  Non-Microsoft IPs bypassing VPN: ~49,988,000\n\n  [!] Exclusion list is 4000x broader than needed.\n  Users can access nearly any site without VPN protection.\n  Fix: vpn-policy set exclusions precise';
                }
                return '\nVPN Exclusion Routes (Bypass VPN):\n=============================================================\n  Microsoft 365 optimized endpoints: 847 specific /24 and /32 entries\n  Total excluded IPs: ~12,000 (precise)\n  Status: PROPERLY SCOPED';
            }

            // show captive-portal-status — portal detection config
            if (joined.includes('captive') || joined.includes('portal')) {
                if (scenario && scenario.id === 'captive_portal' && engine.state._portalSpoofed && !engine.state._labComplete) {
                    return '\nCaptive Portal Detection Status:\n=============================================================\n  Detection:       Enabled\n  Method:          HTTP probe to http://detect.hexworth.local/connect\n  Protocol:        HTTP (unencrypted)  <-- SPOOFABLE\n  Timeout:         Unlimited (VPN stays paused until portal detected as clear)\n  Cert Pinning:    DISABLED\n  Current State:   PORTAL DETECTED (VPN PAUSED)\n\n  [!] A rogue AP is returning redirect responses to the HTTP probe.\n  The VPN client thinks a captive portal is active and stays paused.\n  Without HTTPS + cert pinning, any device can spoof the detection.\n\n  Fix: vpn-policy set captive-portal hardened';
                }
                return '\nCaptive Portal Detection Status:\n=============================================================\n  Detection:     Enabled\n  Method:        HTTPS probe with certificate pinning\n  Timeout:       30 seconds\n  Status:        No portal detected — VPN ENFORCED';
            }

            // show cert-revocation — CRL and revoked certificates
            if (joined.includes('cert') || joined.includes('revoc')) {
                if (scenario && scenario.id === 'cert_revoked' && engine.state._certsRevoked && !engine.state._labComplete) {
                    return '\nCertificate Revocation Status:\n=============================================================\n  CRL Last Updated:  2026-04-01 07:00:15 UTC\n  CRL Next Update:   2026-04-02 07:00:00 UTC\n  Total Revoked:     23 certificates\n\n  Accidental Revocations (batch at 07:00):\n    Serial 7A:2B:3C:4D:5E  LAPTOP-RW-012  Revoked (ACCIDENTAL)\n    Serial 8B:3C:4D:5E:6F  LAPTOP-RW-018  Revoked (ACCIDENTAL)\n    Serial 9C:4D:5E:6F:7A  LAPTOP-RW-025  Revoked (ACCIDENTAL)\n    ...(17 more accidental revocations)...\n\n  [!] 20 machine certs revoked by mistake at 07:00.\n  Junior admin ran wrong revocation script.\n  These machines cannot authenticate to VPN.\n  Fix: cert unrevoke --batch accidental';
                }
                return '\nCertificate Revocation Status:\n=============================================================\n  CRL: Current, 3 legitimately revoked certificates.\n  No accidental revocations.';
            }

            // show compliance-report — endpoint health check status
            if (joined.includes('compliance') || joined.includes('health')) {
                if (scenario && scenario.id === 'compliance_failing' && engine.state._complianceFailing && !engine.state._labComplete) {
                    return '\nEndpoint Compliance Report:\n=============================================================\n  Total Endpoints:      212\n  Compliant:            85  (40%)\n  Non-Compliant:        127 (60%)\n\n  Failure Breakdown:\n    "AV definitions outdated"       127 machines\n\n  Root Cause:\n    AV definition format:  v4 (new, pushed at 06:00)\n    Compliance rule expects: v3 format\n    EMS cannot parse v4 definitions -> reports "outdated"\n\n  Actual AV status: Definitions are CURRENT (v4 format)\n  The compliance rule needs to be updated to recognize v4.\n\n  Fix: compliance update-rule av-format v4';
                }
                return '\nEndpoint Compliance Report:\n=============================================================\n  Total: 212    Compliant: 212 (100%)\n  All endpoints passing health checks.';
            }

            return '\nAvailable show commands:\n  show gpo-status          GPO link status across OUs\n  show exclusion-routes    VPN split tunnel exclusion list\n  show captive-portal      Captive portal detection status\n  show cert-revocation     Certificate revocation (CRL) status\n  show compliance-report   Endpoint health compliance';
        },

        // gpo — link GPO to OU
        'gpo': function(args, term, engine) {
            var gate = VPN005Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = VPN005Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (joined.includes('link') && joined.includes('remote-laptops')) {
                if (scenario && scenario.id === 'gpo_not_applying' && engine.state._gpoMissing) {
                    engine.state._gpoMissing = false;
                    engine.state._ouMismatch = false;
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                    engine.save();
                    setTimeout(function() { engine.notify('GPO linked to new OU. 35 machines now enforcing VPN.', 'success'); }, 400);
                    return '\nGPO Link Operation:\n================================\n  GPO:    "VPN-Always-On-Enforce"\n  Target: OU=Remote-Laptops,OU=Endpoints,DC=hexworth,DC=local\n  Action: LINK\n\n  Linking GPO... OK\n  Forcing group policy update on 35 machines...\n    gpupdate /force (remote batch)...\n    35/35 machines updated.\n\n  Verification:\n    LAPTOP-RW-012: GPO applied, VPN connecting... CONNECTED\n    LAPTOP-RW-018: GPO applied, VPN connecting... CONNECTED\n    LAPTOP-RW-025: GPO applied, VPN connecting... CONNECTED\n    ...(32 more machines connected)...\n\n  All 35 machines now enforcing Always-On VPN.\n\n=== FLAG: VPN005{gpo_linked_remote_laptops_35_enforced} ===';
                }
            }
            return '\nUsage: gpo link "<gpo-name>" --ou "<ou-name>"';
        },

        // vpn-policy — captive portal and exclusion route management
        'vpn-policy': function(args, term, engine) {
            var gate = VPN005Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = VPN005Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            // Harden captive portal detection
            if (joined.includes('captive') && joined.includes('hardened')) {
                if (scenario && scenario.id === 'captive_portal' && engine.state._portalSpoofed) {
                    engine.state._portalSpoofed = false;
                    engine.state._vpnPaused = false;
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                    engine.save();
                    setTimeout(function() { engine.notify('Captive portal hardened. Rogue AP can no longer spoof detection.', 'success'); }, 400);
                    return '\nCaptive Portal Hardening:\n================================\n  Detection URL:   http -> https://detect.hexworth.local/connect\n  Cert Pinning:    DISABLED -> ENABLED (pin: SHA-256 of CA cert)\n  Timeout:         Unlimited -> 30 seconds\n  Retry:           After timeout, VPN enforces regardless\n\n  Pushing policy to all endpoints...\n    212/212 endpoints updated.\n\n  Testing against rogue AP...\n    Rogue AP redirect: REJECTED (HTTPS cert mismatch)\n    VPN status: ENFORCED (timeout expired, tunnel established)\n\n  Rogue AP can no longer spoof captive portal detection.\n\n=== FLAG: VPN005{captive_portal_hardened_https_pinned} ===';
                }
            }

            // Replace broad exclusions with precise Microsoft ranges
            if (joined.includes('exclusions') && joined.includes('precise')) {
                if (scenario && scenario.id === 'exclusion_leak' && engine.state._broadExclusions) {
                    engine.state._broadExclusions = false;
                    engine.state._leakingRoutes = false;
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                    engine.save();
                    setTimeout(function() { engine.notify('Exclusion routes replaced with precise Microsoft endpoints.', 'success'); }, 400);
                    return '\nExclusion Route Update:\n================================\n  Removing broad ranges:\n    13.0.0.0/8   (16.7M IPs) REMOVED\n    52.0.0.0/8   (16.7M IPs) REMOVED\n    104.0.0.0/8  (16.7M IPs) REMOVED\n\n  Adding Microsoft official endpoints (O365 Optimize category):\n    13.107.6.152/31, 13.107.18.10/31, 13.107.128.0/22...\n    52.104.0.0/14, 52.112.0.0/14...\n    104.146.128.0/17...\n    (847 specific entries total)\n\n  Results:\n    Previous excluded IPs:  ~50,000,000\n    New excluded IPs:       ~12,000 (99.97% reduction)\n    M365 traffic:           Still optimized (bypasses VPN)\n    Non-Microsoft traffic:  Now tunneled through VPN\n\n=== FLAG: VPN005{exclusions_precise_50M_to_12K} ===';
                }
            }

            return '\nUsage:\n  vpn-policy set captive-portal hardened     Harden portal detection\n  vpn-policy set exclusions precise          Use Microsoft official IP list';
        },

        // cert — un-revoke accidentally revoked certificates
        'cert': function(args, term, engine) {
            var gate = VPN005Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = VPN005Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (joined.includes('unrevoke') && joined.includes('accidental')) {
                if (scenario && scenario.id === 'cert_revoked' && engine.state._certsRevoked) {
                    engine.state._certsRevoked = false;
                    engine.state._accidentalRevoke = false;
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                    engine.save();
                    setTimeout(function() { engine.notify('Certificates un-revoked. 20 machines reconnected.', 'success'); }, 400);
                    return '\nCertificate Un-Revocation:\n================================\n  Identifying accidental revocations... 20 found\n  Removing serials from CRL:\n    7A:2B:3C:4D:5E  LAPTOP-RW-012  UNREVOKED\n    8B:3C:4D:5E:6F  LAPTOP-RW-018  UNREVOKED\n    9C:4D:5E:6F:7A  LAPTOP-RW-025  UNREVOKED\n    ...(17 more un-revoked)...\n\n  Regenerating CRL... OK\n  Publishing to CDP... OK\n  Flushing CRL cache on VPN gateway... OK\n\n  Testing authentication:\n    LAPTOP-RW-012: Certificate accepted, VPN CONNECTED\n    LAPTOP-RW-018: Certificate accepted, VPN CONNECTED\n    LAPTOP-RW-025: Certificate accepted, VPN CONNECTED\n\n  20/20 machines restored to Always-On VPN.\n\n=== FLAG: VPN005{certs_unrevoked_20_machines_restored} ===';
                }
            }
            return '\nUsage: cert unrevoke --batch accidental\nRemoves accidental revocations from CRL and regenerates it.';
        },

        // compliance — update compliance rules
        'compliance': function(args, term, engine) {
            var gate = VPN005Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = VPN005Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (joined.includes('update-rule') && joined.includes('av-format') && joined.includes('v4')) {
                if (scenario && scenario.id === 'compliance_failing' && engine.state._complianceFailing) {
                    engine.state._complianceFailing = false;
                    engine.state._avFormatMismatch = false;
                    engine.state._labComplete = true;
                    engine.state._flagRevealed = true;
                    engine.save();
                    setTimeout(function() { engine.notify('Compliance rule updated. 127 machines now compliant.', 'success'); }, 400);
                    return '\nCompliance Rule Update:\n================================\n  Rule: "AV Definition Freshness Check"\n  Previous: Accepts v3 format only\n  Updated:  Accepts v3 AND v4 formats\n\n  Pushing rule update to FortiClient EMS...\n    Rule published... OK\n    Triggering re-evaluation on 127 non-compliant endpoints...\n\n  Results:\n    Previously non-compliant:  127\n    Now compliant:             127 (all passed with v4 definitions)\n    VPN connections restored:  127\n\n  Compliance Summary:\n    Total: 212  Compliant: 212 (100%)\n\n=== FLAG: VPN005{compliance_v4_format_127_restored} ===';
                }
            }
            return '\nUsage: compliance update-rule av-format v4\nUpdates compliance rule to accept v4 AV definition format.';
        },

        help: function() {
            return '\nAvailable Commands:\n=============================================================\n  show gpo-status          GPO link status\n  show exclusion-routes    Split tunnel exclusions\n  show captive-portal      Portal detection status\n  show cert-revocation     CRL and revoked certificates\n  show compliance-report   Endpoint health compliance\n  gpo link ...             Link GPO to OU\n  vpn-policy set ...       Configure VPN policy\n  cert unrevoke ...        Un-revoke certificates\n  compliance update-rule   Update compliance rules\n  ping <target>            ICMP ping\n  cls                      Clear screen';
        },

        ping: function(args, term, engine) {
            var gate = VPN005Config._requireScenario(engine);
            if (gate) return gate;
            if (!args.length) return '\nUsage: ping <target>';
            return '\nPING ' + args[0] + ': 56 data bytes\n64 bytes from ' + args[0] + ': icmp_seq=1 ttl=64 time=1ms';
        },

        whoami: function() { return 'MGMT-SRV01\\VPN-Policy-Admin'; },
        hostname: function() { return 'MGMT-SRV01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; }
    },

    // ==========================================================
    // CUSTOM WINDOW HANDLERS
    // ==========================================================

    onAppLaunch(iconDef, engine) {
        var requireTicket = ['compliance_dashboard', 'policy_mgr'];
        if (requireTicket.includes(iconDef.app) && !engine.state._scenarioSelected) {
            engine.notify('Open the VPN Alert first to receive your assignment.', 'error');
            return;
        }
        switch (iconDef.app) {
            case 'ticket':              VPN005Config._openTicket(iconDef, engine); break;
            case 'compliance_dashboard': VPN005Config._openComplianceDashboard(iconDef, engine); break;
            case 'policy_mgr':          VPN005Config._openPolicyMgr(iconDef, engine); break;
            case 'reset_lab':           VPN005Config._confirmReset(engine); break;
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
        engine.openWindow(iconDef.id, 'VPN Policy Alert', 'TKT', c);
        VPN005Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) { VPN005Config._renderTicket(engine, c); }
        else { VPN005Config._renderPicker(engine, c); }
    },

    _renderPicker(engine, container) {
        var previews = [
            'IT Security — "35 endpoints browsing without VPN after AD OU restructure"',
            'IT Security — "VPN disconnects at branch — rogue AP spoofing captive portal"',
            'DLP — "Users accessing non-corporate sites without VPN via broad exclusion routes"',
            'IT Security — "20 machines lost VPN — machine certificates accidentally revoked"',
            'IT Security — "60% failing compliance check after AV definition format change"'
        ];
        var html = '<div style="text-align:center; margin-bottom:20px;">'
            + '<div style="color:#7c3aed; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">POLICY VIOLATION QUEUE</div>'
            + '<div style="color:#888; font-size:0.75rem;">Select a policy bypass to investigate, or get a random assignment.</div></div><div style="margin-bottom:16px;">';

        VPN005Config._scenarios.forEach(function(s, i) {
            html += '<button class="vpn-scenario-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer; transition:border-color 0.2s;">'
                + '<div style="display:flex; justify-content:space-between;"><span style="color:#7c3aed; font-weight:bold;">POL-' + (5000 + i) + '</span>'
                + '<span style="background:#dc2626; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">CRITICAL</span></div>'
                + '<div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div></button>';
        });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;">'
            + '<button id="vpnRandomBtn" style="padding:10px 28px; background:#7c3aed; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.85rem; font-family:Consolas,monospace;">Random Assignment</button></div>';

        container.innerHTML = html;
        container.querySelectorAll('.vpn-scenario-btn').forEach(function(btn) {
            btn.addEventListener('mouseenter', function() { this.style.borderColor = '#7c3aed'; });
            btn.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.12)'; });
            btn.addEventListener('click', function() { VPN005Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); VPN005Config._renderTicket(engine, container); });
        });
        document.getElementById('vpnRandomBtn').addEventListener('click', function() {
            VPN005Config._applyScenario(engine, Math.floor(Math.random() * VPN005Config._scenarios.length));
            VPN005Config._renderTicket(engine, container);
        });
    },

    _renderTicket(engine, container) {
        var scenario = VPN005Config._getScenario(engine);
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;">'
            + '<div style="display:flex; justify-content:space-between;"><span style="color:#7c3aed; font-weight:bold; font-size:1rem;">INCIDENT #POL-' + (5000 + engine.state._scenarioId) + '</span>'
            + '<span style="background:#dc2626; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">CRITICAL</span></div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBJECT</div>'
            + '<div style="font-weight:bold;">' + VPN005Config._escHtml(scenario.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DESCRIPTION</div>'
            + '<div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">'
            + VPN005Config._escHtml(scenario.ticketDetail) + '</div></div>'
            + (scenario.ticketExtra ? '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem; margin-bottom:4px;">ADMIN NOTES</div>'
            + '<div style="background:rgba(124,58,237,0.08); border:1px solid rgba(124,58,237,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#c4b5fd;">'
            + VPN005Config._escHtml(scenario.ticketExtra) + '</div></div>' : '')
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px; color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU — VPN Policy Administrator</div>';
    },

    // ==========================================================
    // COMPLIANCE DASHBOARD
    // ==========================================================

    _openComplianceDashboard(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.id = 'compDashContainer';
        c.style.cssText = 'padding:16px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Compliance Dashboard', 'CMP', c);

        var scenario = VPN005Config._getScenario(engine);
        var html = '<div style="color:#7c3aed; font-weight:bold; font-size:1rem; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Always-On VPN Compliance Dashboard</div>';

        // Calculate non-compliant count based on scenario
        var nonCompliant = 0;
        var reason = 'N/A';
        if (!engine.state._labComplete) {
            if (engine.state._gpoMissing) { nonCompliant = 35; reason = 'GPO not linked to new OU'; }
            else if (engine.state._portalSpoofed) { nonCompliant = 12; reason = 'Captive portal spoofing'; }
            else if (engine.state._broadExclusions) { nonCompliant = 212; reason = 'Broad exclusion routes (policy issue)'; }
            else if (engine.state._certsRevoked) { nonCompliant = 20; reason = 'Certificates accidentally revoked'; }
            else if (engine.state._complianceFailing) { nonCompliant = 127; reason = 'AV format mismatch in compliance check'; }
        }

        var compliant = 212 - nonCompliant;
        var pct = Math.round((compliant / 212) * 100);
        var statusColor = pct === 100 ? '#22c55e' : pct > 70 ? '#f59e0b' : '#dc2626';

        html += '<div style="padding:16px; margin-bottom:16px; background:rgba(' + (pct === 100 ? '34,197,94' : '220,38,38') + ',0.08); border:1px solid rgba(' + (pct === 100 ? '34,197,94' : '220,38,38') + ',0.2); border-radius:4px; text-align:center;">'
            + '<div style="color:#888; font-size:0.75rem;">Endpoint Compliance Rate</div>'
            + '<div style="color:' + statusColor + '; font-weight:bold; font-size:1.5rem;">' + pct + '%</div>'
            + '<div style="color:#888; font-size:0.7rem;">' + compliant + ' / 212 endpoints compliant</div></div>';

        if (nonCompliant > 0) {
            html += '<div style="padding:10px; margin-bottom:16px; background:rgba(220,38,38,0.08); border:1px solid rgba(220,38,38,0.2); border-radius:4px;">'
                + '<div style="color:#dc2626; font-weight:bold;">' + nonCompliant + ' Endpoints Non-Compliant</div>'
                + '<div style="color:#fca5a5; font-size:0.75rem; margin-top:4px;">Reason: ' + reason + '</div></div>';
        }

        if (engine.state._flagRevealed) {
            html += '<div style="padding:12px; background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.2); border-radius:4px; text-align:center;">'
                + '<div style="color:#22c55e; font-weight:bold;">BYPASS SEALED — ALL ENDPOINTS COMPLIANT</div></div>';
        }

        html += '<div style="margin-top:12px; color:#888; font-size:0.75rem;">Use terminal "show" commands for detailed diagnostics.</div>';
        c.innerHTML = html;
    },

    _openPolicyMgr(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.style.cssText = 'padding:16px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Policy Manager', 'POL', c);
        c.innerHTML = '<div style="color:#7c3aed; font-weight:bold; font-size:1rem; margin-bottom:12px;">VPN Policy Manager</div>'
            + '<div style="color:#888;">Use terminal commands for policy configuration:</div>'
            + '<div style="color:#888; margin-top:8px;">- gpo link ... (Active Directory GPO management)</div>'
            + '<div style="color:#888;">- vpn-policy set ... (VPN client policy settings)</div>'
            + '<div style="color:#888;">- cert unrevoke ... (Certificate revocation management)</div>'
            + '<div style="color:#888;">- compliance update-rule ... (Compliance rule updates)</div>';
    },

    _confirmReset(engine) { if (confirm('Reset this lab? All progress will be lost.')) { engine.resetLab(); } }
};
