/* ============================================================
   DISPATCH LAB — Box VPN005: Always-On VPN Bypass
   Network Security — Corporate Always-On VPN Enforcement
   Config: GPO enforcement, captive portal detection, exclusion
   routes, user certificate revocation, compliance checks
   5 distinct scenarios
   ============================================================ */

var VPN005Config = {

    title: 'Always-On VPN Bypass',
    subtitle: 'Employees Bypassing Corporate Always-On VPN — Enforce Compliance',
    difficulty: 'Advanced',
    accent: '#7c3aed',
    storageKey: 'hexworth_lab_vpn005',
    registryId: 'vpn005-always-on-bypass',
    trackerKey: 'lab_vpn005',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Compliance Alert', tip: 'Read the always-on VPN bypass report.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check Compliance Dashboard', tip: 'Review which devices are non-compliant.', trigger: { event: 'window_open', match: { type: 'compliance_dash' } } },
            { title: 'Investigate', tip: 'Use compliance-check, gpo-status, vpn-policy to investigate.', trigger: { event: 'command', match: { cmd: 'contains:compliance' }, alt: [{ event: 'command', match: { cmd: 'contains:gpo' } }, { event: 'command', match: { cmd: 'contains:vpn-policy' } }] } },
            { title: 'Apply the fix', tip: 'Enforce the always-on VPN and close bypass methods.', trigger: { event: 'command', match: { cmd: 'contains:enforce' }, alt: [{ event: 'command', match: { cmd: 'contains:apply' } }] } },
            { title: 'Capture the flag', tip: 'After enforcing compliance, the flag appears.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: {
        certPath: 'Security+ SY0-701 / CySA+',
        mappings: [
            { flagId: 'fixed', objective: '2.5', description: 'Explain the purpose of mitigation techniques', skill: 'VPN Policy Enforcement' },
            { flagId: 'fixed', objective: '4.1', description: 'Given a scenario, apply common security techniques', skill: 'Always-On VPN Compliance' }
        ]
    },

    _alerts: [{ id: 'COMP-2026-0501', severity: 'HIGH', engine: 'Intune MDM', host: 'Multiple', user: 'various', detected: '2026-04-01 10:15:00' }],
    _scenarioFlags: { gpo_not_applied: null, captive_portal: null, exclusion_abuse: null, cert_revoked_bypass: null, compliance_gap: null },

    _scenarios: [
        {
            id: 'gpo_not_applied',
            name: 'GPO Not Applied',
            ticketSubject: 'Always-on VPN GPO not applying to 30% of remote laptops',
            ticketDetail: 'Compliance scan shows 75 of 250 remote laptops are NOT running the always-on VPN. These devices have direct internet access without corporate security controls. Investigation shows the GPO "Corp-AlwaysOn-VPN" is linked to the correct OU but many devices show "Not Applied" status. These devices were recently re-imaged and may not have received the latest GPO.',
            ticketExtra: 'IT Note: After the Windows 11 migration, 75 laptops were re-imaged but the VPN client was deployed via SCCM after the GPO was processed. The VPN client CSP (Configuration Service Provider) needs to be pushed via Intune MDM as a fallback for devices that missed the GPO. Force a GPO sync and deploy the Intune profile.',
            affectedHost: 0,
            fixDescription: 'Force GPO application and deploy Intune MDM fallback profile',
            stateOverrides: { _gpoMissing: true, _intuneNeeded: true }
        },
        {
            id: 'captive_portal',
            name: 'Captive Portal Bypass',
            ticketSubject: 'Always-on VPN disables at hotels/airports — captive portal detection too aggressive',
            ticketDetail: 'Traveling employees report that the always-on VPN drops when connecting to hotel/airport WiFi and does NOT reconnect after completing captive portal login. The captive portal detection temporarily disables VPN to allow portal authentication, but the VPN never re-establishes. Users then work for hours without VPN protection.',
            ticketExtra: 'IT Note: The captive portal detection timeout is set to 300 seconds (5 min) but there is no automatic reconnection trigger after portal completion. The VPN client needs: (1) A connectivity probe after portal window closes, (2) Automatic reconnection when internet access is detected, (3) A fallback timer to force reconnection after max portal timeout.',
            affectedHost: 0,
            fixDescription: 'Fix captive portal detection to auto-reconnect VPN after portal login',
            stateOverrides: { _portalBypass: true, _noReconnect: true }
        },
        {
            id: 'exclusion_abuse',
            name: 'Exclusion Route Abuse',
            ticketSubject: 'Users adding custom routes to bypass always-on VPN for personal traffic',
            ticketDetail: 'Security monitoring detected 12 users who have added custom static routes on their laptops to bypass the always-on VPN for specific destinations (streaming services, gaming, personal cloud storage). They are using "route add" commands to direct certain IP ranges through their local gateway instead of the VPN tunnel. The VPN client does not prevent users from modifying the routing table.',
            ticketExtra: 'IT Note: The VPN client runs as user-mode and does not protect the routing table from admin-level modifications. Users with local admin rights can add routes that override VPN routing. Solutions: (1) Remove local admin rights, (2) Enable VPN client routing protection, (3) Deploy route monitoring agent, (4) Enable tamper protection on VPN client.',
            affectedHost: 0,
            fixDescription: 'Enable VPN route protection and prevent user route modifications',
            stateOverrides: { _routesAbused: true, _noRouteProtection: true }
        },
        {
            id: 'cert_revoked_bypass',
            name: 'Revoked Certificate Still Working',
            ticketSubject: 'Terminated employee still connected to VPN — certificate should have been revoked',
            ticketDetail: 'A terminated employee (David Chen, terminated 3 days ago) is still showing as connected to the always-on VPN. HR confirmed the termination was processed and IT revoked his VPN certificate on the CA. However, the VPN gateway CRL cache has not been updated, and the OCSP check is failing silently. The revoked certificate is still being accepted.',
            ticketExtra: 'Security Note: CRITICAL — terminated employee has active VPN access to corporate network. The CRL on the VPN gateway was last refreshed 5 days ago (before the revocation). OCSP is configured but the responder is returning stale data. Force CRL refresh and verify OCSP, then disconnect and block the terminated user.',
            affectedHost: 0,
            fixDescription: 'Force CRL refresh, fix OCSP, and disconnect terminated employee',
            stateOverrides: { _staleCRL: true, _ocspStale: true }
        },
        {
            id: 'compliance_gap',
            name: 'Compliance Check Gap',
            ticketSubject: 'Devices passing compliance check but VPN not actually enforced — policy gap',
            ticketDetail: 'Quarterly audit found that 45 devices show "Compliant" in Intune but are NOT running the always-on VPN. The compliance policy checks for the VPN client installation but does NOT verify the VPN is actually connected and enforced. Devices have the client installed but the always-on feature is disabled in the local config. Users discovered they can disable the service without triggering non-compliance.',
            ticketExtra: 'IT Note: The current compliance rule only checks: (1) VPN client installed = true. It needs to also check: (2) VPN service running = true, (3) VPN tunnel status = connected, (4) Always-on config = enabled. Update the compliance policy and add a remediation action that re-enables the service if stopped.',
            affectedHost: 0,
            fixDescription: 'Update compliance policy to verify VPN enforcement, not just installation',
            stateOverrides: { _complianceWeak: true, _serviceCheckMissing: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Check the Compliance Dashboard for non-compliant devices.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use compliance-check, gpo-status, vpn-policy, crl-status for investigation.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario exploits a different bypass method.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Fix the bypass and verify enforcement.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        gpo_not_applied: [
            { id: 'hint1', text: 'Run "gpo-status" to check GPO application on remote devices.', cost: 0, penalty: 0 },
            { id: 'hint2', text: '75 devices missed GPO due to re-imaging timing. Need Intune fallback.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Deploy Intune MDM profile as fallback and force GPO refresh.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "vpn-policy deploy-intune --force-gpo-sync" then "vpn-policy enforce".', cost: 150, penalty: -150 }
        ],
        captive_portal: [
            { id: 'hint1', text: 'Run "vpn-policy show-portal-config" to see captive portal detection settings.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Portal detection disables VPN but never triggers reconnection after portal completes.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Enable auto-reconnect probe and set max portal timeout with forced reconnect.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "vpn-policy set-portal --auto-reconnect --probe-interval 10 --max-timeout 120" then "vpn-policy enforce".', cost: 150, penalty: -150 }
        ],
        exclusion_abuse: [
            { id: 'hint1', text: 'Run "compliance-check --routes" to see which users added custom routes.', cost: 0, penalty: 0 },
            { id: 'hint2', text: '12 users added routes to bypass VPN for streaming/gaming. No route protection.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Enable VPN route protection and tamper detection on the client.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "vpn-policy enable-route-protection --tamper-detect" then "vpn-policy enforce".', cost: 150, penalty: -150 }
        ],
        cert_revoked_bypass: [
            { id: 'hint1', text: 'Run "crl-status" to check when the CRL was last refreshed.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'CRL is 5 days old (pre-revocation). OCSP returning stale data.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Force CRL refresh, fix OCSP, then disconnect the terminated user.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "crl-refresh --force" then "ocsp-fix --restart" then "vpn-policy disconnect-user dchen" then "vpn-policy enforce".', cost: 150, penalty: -150 }
        ],
        compliance_gap: [
            { id: 'hint1', text: 'Run "compliance-check --detailed" to see what the policy actually validates.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Policy only checks client installed, not running/connected/enforced.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Update compliance to check service status, tunnel status, and always-on config.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "compliance-update --add-service-check --add-tunnel-check --add-config-check" then "vpn-policy enforce".', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !VPN005Config._flagRestored) {
            VPN005Config._flagRestored = true;
            var s = VPN005Config._scenarios[engine.state._scenarioId];
            if (s) VPN005Config.hints = VPN005Config._scenarioHints[s.id] || VPN005Config._defaultHints;
        }
        return true;
    },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        var keys = ['_gpoMissing','_intuneNeeded','_portalBypass','_noReconnect','_routesAbused','_noRouteProtection','_staleCRL','_ocspStale','_complianceWeak','_serviceCheckMissing','_gpoFixed','_portalFixed','_routeProtected','_crlRefreshed','_ocspFixed','_userDisconnected','_complianceUpdated','_labComplete','_flagRevealed'];
        keys.forEach(function(k) { engine.state[k] = false; });
        var overrides = VPN005Config._scenarios[idx].stateOverrides || {};
        for (var k in overrides) engine.state[k] = overrides[k];
        VPN005Config._flagRestored = true;
        VPN005Config.hints = VPN005Config._scenarioHints[VPN005Config._scenarios[idx].id] || VPN005Config._defaultHints;
        engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : VPN005Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Compliance Alert first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['Microsoft Intune Management Console', 'Loading Compliance Engine...', 'Devices Enrolled: 250', 'Policy Engine Active'], grubEntries: ['Windows 11 Enterprise', 'Recovery'], loginUser: 'IT-Admin' },
    desktop: {
        icons: [
            { id: 'cmd', label: 'Terminal', icon: '>_', app: 'terminal' },
            { id: 'compliance_dash', label: 'Compliance\nDashboard', icon: 'CMP', app: 'compliance_dash' },
            { id: 'intune', label: 'Intune\nPortal', icon: 'MDM', app: 'intune' },
            { id: 'ticket', label: 'Compliance\nAlert', icon: 'TKT', app: 'ticket' },
            { id: 'hints', label: 'Hints', icon: '?', app: 'hints' },
            { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }
        ]
    },
    terminal: { user: 'it-admin', hostname: 'MGMT-WS01', startDir: 'C:\\Users\\it-admin', promptStyle: 'windows', welcome: 'Intune Management Console\nVPN Policy Enforcement Toolkit\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Check the Compliance Dashboard.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use compliance-check, gpo-status, vpn-policy.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario exploits a different bypass.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Close the bypass and enforce.', cost: 50, penalty: -50 }
    ],
    lore: {
        intro: 'Corporate always-on VPN policy is being bypassed. Remote workers are accessing the internet without going through corporate security controls. Identify the bypass vector and enforce compliance.',
        scenario: 'Each scenario reveals a different way the always-on VPN can be circumvented — from GPO failures to captive portal bugs and route manipulation.',
        outro: 'Always-on VPN enforced across all devices. The bypass vector has been sealed and compliance verified.'
    },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Identify which devices are non-compliant and why.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Determine the bypass method being used.', requiredFlags: [], unlocks: ['remediate'], locked: true },
        { id: 'remediate', name: 'Remediation', description: 'Close the bypass and enforce always-on VPN.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm all devices are compliant.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        'compliance-check': function(args, term, engine) {
            var gate = VPN005Config._requireScenario(engine); if (gate) return gate;
            var s = VPN005Config._getScenario(engine); var joined = args.join(' ').toLowerCase();
            if (engine.state._labComplete) return '\nCompliance Check: 250/250 devices COMPLIANT. Always-on VPN enforced.';
            if (s && s.id === 'gpo_not_applied') return '\nCompliance Check\n================\n  Total Devices: 250\n  VPN Active: 175 (70%)\n  VPN Missing: 75 (30%)\n  Missing Devices: Recently re-imaged Windows 11 laptops\n  GPO "Corp-AlwaysOn-VPN": Not Applied on 75 devices\n  Reason: VPN client deployed AFTER GPO processing window';
            if (s && s.id === 'captive_portal') return '\nCompliance Check\n================\n  Devices with VPN drops (last 7 days): 38\n  Location: Hotels (22), Airports (11), Coffee shops (5)\n  Pattern: VPN drops for captive portal, never reconnects\n  Average time without VPN: 4.2 hours per incident';
            if (s && s.id === 'exclusion_abuse' && joined.includes('route')) return '\nRoute Abuse Detection\n=====================\n  Users with custom routes bypassing VPN:\n    bsmith — route add 185.0.0.0/8 via local (Netflix)\n    jpark — route add 104.0.0.0/8 via local (Steam)\n    mwilson — route add 142.0.0.0/8 via local (iCloud)\n    ... and 9 more users\n  Total: 12 users with unauthorized routes\n  VPN route protection: DISABLED';
            if (s && s.id === 'exclusion_abuse') return '\nCompliance Check\n================\n  Devices Non-Compliant: 12\n  Reason: Custom static routes bypassing VPN tunnel\n  Users have local admin and are adding "route add" entries\n  VPN client route protection: DISABLED';
            if (s && s.id === 'cert_revoked_bypass') return '\nCompliance Check\n================\n  Active VPN Sessions: 201\n  [!] User dchen (David Chen) — TERMINATED 3 days ago\n  Certificate Status on CA: REVOKED\n  VPN Gateway CRL: STALE (last refresh 5 days ago)\n  OCSP Status: STALE responses\n  User still has active network access.';
            if (s && s.id === 'compliance_gap' && joined.includes('detailed')) return '\nCompliance Policy Analysis\n==========================\n  Current Rules:\n    Rule 1: VPN Client Installed = true    CHECK\n  Missing Rules:\n    [!] VPN Service Running = not checked\n    [!] VPN Tunnel Connected = not checked\n    [!] Always-On Config = not checked\n\n  Result: 45 devices PASS compliance but VPN NOT enforced\n  Users disabled VPN service without triggering non-compliance.';
            if (s && s.id === 'compliance_gap') return '\nCompliance Check\n================\n  Compliant (per policy): 250/250 (100%)\n  Actually enforcing VPN: 205/250 (82%)\n  GAP: 45 devices pass compliance but VPN not running\n  Run "compliance-check --detailed" for policy analysis.';
            return '\nCompliance Check — All devices compliant.';
        },

        'gpo-status': function(args, term, engine) {
            var gate = VPN005Config._requireScenario(engine); if (gate) return gate;
            var s = VPN005Config._getScenario(engine);
            if (s && s.id === 'gpo_not_applied') return '\nGPO Status: Corp-AlwaysOn-VPN\n=============================\n  Linked OU: Remote-Workers\n  Applied: 175 devices\n  Not Applied: 75 devices\n  Reason: Client CSP not present at GPO processing time\n  Re-imaged devices need Intune MDM fallback profile.';
            return '\nGPO Status: Corp-AlwaysOn-VPN applied to all 250 devices.';
        },

        'vpn-policy': function(args, term, engine) {
            var gate = VPN005Config._requireScenario(engine); if (gate) return gate;
            var s = VPN005Config._getScenario(engine); var joined = args.join(' ').toLowerCase();

            if (joined.includes('deploy-intune') && joined.includes('force-gpo')) {
                if (s && s.id === 'gpo_not_applied') { engine.state._gpoFixed = true; engine.save(); return '\nDeploying Intune MDM Profile...\n  Profile: Corp-AlwaysOn-VPN-MDM\n  Target: 75 non-compliant devices\n  Forcing GPO sync on all 250 devices...\n  Devices responding: 248/250\n\nReady to enforce. Run "vpn-policy enforce".'; }
            }
            if (joined.includes('set-portal') && joined.includes('auto-reconnect')) {
                if (s && s.id === 'captive_portal') { engine.state._portalFixed = true; engine.save(); return '\nCaptive Portal Config Updated:\n  Auto-reconnect: ENABLED\n  Probe interval: 10 seconds\n  Max portal timeout: 120 seconds\n  Force reconnect after timeout: YES\n\nReady to enforce. Run "vpn-policy enforce".'; }
            }
            if (joined.includes('enable-route-protection')) {
                if (s && s.id === 'exclusion_abuse') { engine.state._routeProtected = true; engine.save(); return '\nRoute Protection Enabled:\n  Custom route additions: BLOCKED\n  Route table monitoring: ACTIVE\n  Tamper detection: ENABLED\n  Existing rogue routes: Will be cleared on enforce\n\nReady to enforce. Run "vpn-policy enforce".'; }
            }
            if (joined.includes('disconnect-user') && joined.includes('dchen')) {
                if (s && s.id === 'cert_revoked_bypass') { engine.state._userDisconnected = true; engine.save(); return '\nUser dchen (David Chen) disconnected from VPN.\n  Session terminated.\n  Certificate blocked in gateway local store.\n  IP address 10.8.0.112 released.'; }
            }
            if (joined.includes('enforce')) {
                if (s && s.id === 'gpo_not_applied' && engine.state._gpoFixed) {
                    engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                    setTimeout(function() { engine.notify('GPO + Intune enforced. 250/250 devices compliant.', 'success'); }, 400);
                    return '\nEnforcing Always-On VPN Policy...\n  GPO applied: 175 devices (existing)\n  Intune MDM: 75 devices (newly enrolled)\n  Total compliant: 250/250\n  VPN tunnels active: 250\n\n=== FLAG: VPN005{gpo_intune_always_on_enforced} ===';
                }
                if (s && s.id === 'captive_portal' && engine.state._portalFixed) {
                    engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                    setTimeout(function() { engine.notify('Captive portal auto-reconnect working. VPN enforced.', 'success'); }, 400);
                    return '\nEnforcing Portal Fix...\n  Auto-reconnect deployed to all 250 clients\n  Simulating captive portal scenario...\n  VPN dropped -> Portal detected -> Portal completed\n  Auto-reconnect probe: Internet detected at 8s\n  VPN reconnected: 12s total downtime (was 4+ hours)\n\n=== FLAG: VPN005{captive_portal_auto_reconnect} ===';
                }
                if (s && s.id === 'exclusion_abuse' && engine.state._routeProtected) {
                    engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                    setTimeout(function() { engine.notify('Route protection enabled. Bypass routes cleared.', 'success'); }, 400);
                    return '\nEnforcing Route Protection...\n  Clearing 12 unauthorized routes...\n  Route table protection: ACTIVE on all 250 devices\n  Tamper detection: Monitoring\n  Compliance: 250/250 devices VPN-enforced\n\n=== FLAG: VPN005{route_protection_tamper_detect} ===';
                }
                if (s && s.id === 'cert_revoked_bypass' && engine.state._crlRefreshed && engine.state._ocspFixed && engine.state._userDisconnected) {
                    engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                    setTimeout(function() { engine.notify('CRL refreshed, OCSP fixed, terminated user blocked.', 'success'); }, 400);
                    return '\nEnforcing Revocation Policy...\n  CRL: Refreshed (includes dchen revocation)\n  OCSP: Responding with current data\n  User dchen: Disconnected and blocked\n  Auto-refresh interval: Set to 1 hour\n  All active sessions: Validated against current CRL\n\n=== FLAG: VPN005{crl_ocsp_revocation_enforced} ===';
                }
                if (s && s.id === 'compliance_gap' && engine.state._complianceUpdated) {
                    engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                    setTimeout(function() { engine.notify('Compliance policy updated. 45 devices now non-compliant and remediated.', 'success'); }, 400);
                    return '\nEnforcing Updated Compliance...\n  New compliance rules applied\n  Re-scanning all 250 devices...\n  Previously "compliant" but not enforced: 45 devices\n  Auto-remediation: Re-enabling VPN service on 45 devices\n  New compliance: 250/250 truly compliant\n\n=== FLAG: VPN005{compliance_policy_strengthened} ===';
                }
                return '\nERROR: Prerequisites not met. Fix the bypass issue first.';
            }

            return '\nUsage: vpn-policy <command>\n  deploy-intune --force-gpo-sync\n  set-portal --auto-reconnect --probe-interval N --max-timeout N\n  enable-route-protection --tamper-detect\n  disconnect-user <username>\n  enforce';
        },

        'crl-refresh': function(args, term, engine) {
            var gate = VPN005Config._requireScenario(engine); if (gate) return gate;
            var s = VPN005Config._getScenario(engine);
            if (s && s.id === 'cert_revoked_bypass' && args.join(' ').toLowerCase().includes('force')) {
                engine.state._crlRefreshed = true; engine.save();
                return '\nCRL Force Refresh\n=================\n  Downloading from: http://crl.hexworth.local/ca.crl\n  Previous CRL age: 5 days (STALE)\n  New CRL entries: 3 revocations (including dchen)\n  CRL loaded into VPN gateway trust store.\n\n  Also fix OCSP: "ocsp-fix --restart"';
            }
            return '\nUsage: crl-refresh --force';
        },

        'ocsp-fix': function(args, term, engine) {
            var gate = VPN005Config._requireScenario(engine); if (gate) return gate;
            var s = VPN005Config._getScenario(engine);
            if (s && s.id === 'cert_revoked_bypass' && args.join(' ').toLowerCase().includes('restart')) {
                engine.state._ocspFixed = true; engine.save();
                return '\nOCSP Responder Fix\n==================\n  Restarting OCSP responder service...\n  Flushing stale response cache...\n  Testing: cert for dchen -> REVOKED (correct)\n  OCSP responder: OPERATIONAL with current data.';
            }
            return '\nUsage: ocsp-fix --restart';
        },

        'compliance-update': function(args, term, engine) {
            var gate = VPN005Config._requireScenario(engine); if (gate) return gate;
            var s = VPN005Config._getScenario(engine); var joined = args.join(' ').toLowerCase();
            if (s && s.id === 'compliance_gap' && joined.includes('service-check') && joined.includes('tunnel-check')) {
                engine.state._complianceUpdated = true; engine.save();
                return '\nCompliance Policy Updated\n=========================\n  Rule 1: VPN Client Installed = true (existing)\n  Rule 2: VPN Service Running = true (NEW)\n  Rule 3: VPN Tunnel Connected = true (NEW)\n  Rule 4: Always-On Config = enabled (NEW)\n  Remediation: Auto-restart VPN service if stopped\n\nPolicy ready. Run "vpn-policy enforce" to apply.';
            }
            return '\nUsage: compliance-update --add-service-check --add-tunnel-check --add-config-check';
        },

        'crl-status': function(args, term, engine) {
            var gate = VPN005Config._requireScenario(engine); if (gate) return gate;
            var s = VPN005Config._getScenario(engine);
            if (s && s.id === 'cert_revoked_bypass' && !engine.state._crlRefreshed) return '\nCRL Status\n==========\n  Last Refresh: 5 days ago (2026-03-27)\n  CRL Entries: 2 revocations (pre-dchen)\n  [!] STALE — revocation for dchen NOT in cached CRL\n  OCSP: Returning stale responses\n  Auto-refresh: Disabled (should be hourly)';
            return '\nCRL Status: Current (refreshed within last hour).';
        },

        whoami: function() { return 'MGMT-WS01\\it-admin'; },
        hostname: function() { return 'MGMT-WS01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        dir: function() { return ' Directory of C:\\Users\\it-admin\n  Desktop  Documents  Policies  Scripts'; }
    },

    onAppLaunch(iconDef, engine) {
        var requireTicket = ['compliance_dash', 'intune'];
        if (requireTicket.includes(iconDef.app) && !engine.state._scenarioSelected) { engine.notify('Open the Compliance Alert first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': VPN005Config._openTicket(iconDef, engine); break;
            case 'compliance_dash': case 'intune': VPN005Config._openInfoWin(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset this lab?')) engine.resetLab(); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px;overflow-y:auto;height:100%;background:#1a1a2e;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Compliance Alert', 'TKT', c);
        VPN005Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) VPN005Config._renderTicket(engine, c); else VPN005Config._renderPicker(engine, c);
    },

    _renderPicker(engine, container) {
        var previews = ['IT — "75 laptops missing always-on VPN after re-image"','IT — "VPN drops at hotels/airports, never reconnects"','Security — "12 users adding routes to bypass VPN for personal traffic"','Security — "CRITICAL: Terminated employee still connected via VPN"','Audit — "45 devices pass compliance but VPN not actually running"'];
        var html = '<div style="text-align:center;margin-bottom:20px;"><div style="color:#7c3aed;font-weight:bold;font-size:1.1rem;">COMPLIANCE INCIDENT QUEUE</div></div><div>';
        VPN005Config._scenarios.forEach(function(s,i) {
            html += '<button class="s-btn" data-idx="'+i+'" style="display:block;width:100%;text-align:left;padding:12px 16px;margin-bottom:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:4px;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;cursor:pointer;"><div style="color:#7c3aed;font-weight:bold;">COMP-'+(5000+i)+'</div><div style="color:#aaa;font-size:0.7rem;margin-top:4px;">'+previews[i]+'</div></button>';
        });
        html += '</div><div style="text-align:center;border-top:1px solid rgba(255,255,255,0.1);padding-top:16px;"><button id="rndBtn" style="padding:10px 28px;background:#7c3aed;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;font-family:Consolas,monospace;">Random Assignment</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.s-btn').forEach(function(b) { b.addEventListener('click', function() { VPN005Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); VPN005Config._renderTicket(engine, container); }); });
        document.getElementById('rndBtn').addEventListener('click', function() { VPN005Config._applyScenario(engine, Math.floor(Math.random()*VPN005Config._scenarios.length)); VPN005Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var s = VPN005Config._getScenario(engine);
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px;margin-bottom:16px;"><span style="color:#7c3aed;font-weight:bold;font-size:1rem;">INCIDENT #COMP-'+(5000+engine.state._scenarioId)+'</span></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">'+VPN005Config._escHtml(s.ticketSubject)+'</div></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:12px;line-height:1.6;">'+VPN005Config._escHtml(s.ticketDetail)+'</div></div>'
            +(s.ticketExtra?'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">NOTES</div><div style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.2);border-radius:4px;padding:12px;line-height:1.6;color:#c4b5fd;">'+VPN005Config._escHtml(s.ticketExtra)+'</div></div>':'')
            +'<div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:12px;color:#2ecc71;font-weight:bold;">ASSIGNED TO: YOU — IT Security Admin</div>';
    },

    _openInfoWin(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.style.cssText = 'padding:16px;overflow-y:auto;height:100%;background:#1a1a2e;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;';
        engine.openWindow(iconDef.id, iconDef.label.replace('\n',' '), iconDef.icon, c);
        c.innerHTML = '<div style="color:#7c3aed;font-weight:bold;font-size:1rem;margin-bottom:12px;">'+iconDef.label.replace('\n',' ')+'</div><div style="color:#888;">Use terminal commands for diagnostics.</div>';
    }
};
