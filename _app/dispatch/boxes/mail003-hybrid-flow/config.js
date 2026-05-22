/* ============================================================
   DISPATCH LAB — Box MAIL003: Exchange Hybrid Mail Flow
   CompTIA Network+ — Exchange Hybrid Troubleshooting (N10-009)
   5 scenarios: send connector wrong, TLS cert mismatch, mail flow
   rule redirect, hybrid wizard OAuth broken, routing loop
   ============================================================ */

var MAIL003Config = {

    title: 'Exchange Hybrid Mail Flow',
    subtitle: 'Hybrid Is Broken — Exchange On-Prem/Cloud Mail Flow',
    difficulty: 'Advanced',
    accent: '#10b981',
    storageKey: 'hexworth_lab_mail003',
    registryId: 'mail003-hybrid-flow',
    trackerKey: 'lab_mail003',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the mail flow complaint to understand the hybrid issue.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check mail flow', tip: 'Open the Mail Flow Dashboard or use Get-TransportService to see connector status.', trigger: { event: 'window_open', match: { type: 'mail_flow' } } },
            { title: 'Investigate connectors', tip: 'Use PowerShell commands like Get-SendConnector, Get-ReceiveConnector, or Get-TransportRule to find the misconfiguration.', trigger: { event: 'command', match: { cmd: 'contains:get-' }, alt: [{ event: 'command', match: { cmd: 'contains:Get-' } }] } },
            { title: 'Apply the fix', tip: 'Use Set-SendConnector, Set-ReceiveConnector, or other Exchange cmdlets to fix the mail flow.', trigger: { event: 'command', match: { cmd: 'contains:set-' }, alt: [{ event: 'command', match: { cmd: 'contains:Set-' } }] } },
            { title: 'Capture the flag', tip: 'After fixing mail flow, check the Mail Flow Dashboard for the recovery token.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: {
        certPath: 'Network+',
        mappings: [
            { flagId: 'fixed', objective: '1.6', description: 'Explain the use and purpose of network services — SMTP/mail flow', skill: 'Exchange Hybrid Connector Management' },
            { flagId: 'fixed', objective: '5.3', description: 'Troubleshoot common network service issues', skill: 'Hybrid Mail Flow Troubleshooting' }
        ]
    },

    _scenarios: [
        {
            id: 'send_connector_wrong',
            name: 'Send Connector Misconfigured',
            ticketSubject: 'On-prem users cannot send to external recipients — smart host wrong',
            ticketDetail: 'All on-premises users are getting NDRs when sending to external addresses. The error says "550 5.4.1 Recipient address rejected: Access denied." Internal mail between on-prem and cloud works. The send connector was modified last night during maintenance. External delivery is completely broken.',
            ticketExtra: 'IT Note: The send connector "Outbound to Internet" had its smart host changed from smtp-relay.ourcompany.com to an incorrect address during maintenance. The original smart host is smtp-relay.ourcompany.com (198.51.100.10).',
            fixDescription: 'Fix the send connector smart host address back to smtp-relay.ourcompany.com',
            stateOverrides: { _sendConnectorWrong: true, _wrongSmartHost: '10.0.1.99' }
        },
        {
            id: 'receive_connector_tls',
            name: 'Receive Connector TLS Mismatch',
            ticketSubject: 'Cloud-to-on-prem mail failing — TLS certificate mismatch',
            ticketDetail: 'Emails from Microsoft 365 to on-premises mailboxes are bouncing. The NDR mentions "454 4.7.5 Certificate validation failure." This started after we renewed our wildcard certificate yesterday. The new cert has a different thumbprint but the receive connector was not updated.',
            ticketExtra: 'IT Note: Wildcard cert for *.ourcompany.com was renewed yesterday. New thumbprint: AB12CD34EF56. The receive connector "Inbound from O365" still references the old cert thumbprint: 99AA88BB77CC.',
            fixDescription: 'Update the receive connector TLS certificate to the new thumbprint',
            stateOverrides: { _tlsCertMismatch: true, _newThumbprint: 'AB12CD34EF56', _oldThumbprint: '99AA88BB77CC' }
        },
        {
            id: 'transport_rule_redirect',
            name: 'Transport Rule Redirecting Wrong',
            ticketSubject: 'Mail flow rule sending all external mail to compliance — not just legal',
            ticketDetail: 'Every single external email is being copied to compliance@ourcompany.com. This should only happen for the Legal department. The compliance team is drowning in 3,000+ emails per hour that they should not be seeing. This started after someone modified the "Legal Hold Copy" transport rule.',
            ticketExtra: 'IT Note: Transport rule "Legal Hold Copy" was modified Monday. The scope was changed from "Legal Department" members to "All Users" by accident. The rule should only apply when the sender is a member of the Legal distribution group.',
            fixDescription: 'Fix the transport rule scope to only apply to Legal department senders',
            stateOverrides: { _ruleWrongScope: true }
        },
        {
            id: 'hybrid_wizard_oauth',
            name: 'Hybrid Wizard OAuth Broken',
            ticketSubject: 'Free/busy lookup between on-prem and cloud failing — OAuth expired',
            ticketDetail: 'Users cannot see calendar availability between on-premises and cloud mailboxes. When an on-prem user tries to check a cloud user\'s calendar, they get "Unable to retrieve free/busy information." The hybrid configuration wizard was last run 6 months ago and the OAuth certificate has expired.',
            ticketExtra: 'IT Note: The IntraOrganizationConnector uses OAuth for authentication. The OAuth certificate expires every 12 months and was last renewed 18 months ago. Re-running the Hybrid Configuration Wizard or manually updating the auth certificate should fix this.',
            fixDescription: 'Renew the OAuth certificate or re-run the Hybrid Configuration Wizard',
            stateOverrides: { _oauthExpired: true }
        },
        {
            id: 'routing_loop',
            name: 'On-Prem to Cloud Routing Loop',
            ticketSubject: 'On-prem mailbox to cloud mailbox — NDR "hop count exceeded"',
            ticketDetail: 'When on-premises users send to cloud mailboxes, the messages bounce with "554 5.4.6 Hop count exceeded — possible mail loop." The message headers show the email bouncing between our on-prem server and Microsoft 365 multiple times before dying. This started after a connector change.',
            ticketExtra: 'IT Note: The send connector "Outbound to O365" routes mail to Microsoft 365 via a smart host. Microsoft 365 then sees the recipient domain matches ourcompany.com and routes it back to on-prem (thinking it is the authoritative server). The accepted domain type may be wrong — should be "InternalRelay" for hybrid but is set to "Authoritative" in the cloud.',
            fixDescription: 'Change the accepted domain type in Exchange Online from Authoritative to InternalRelay',
            stateOverrides: { _routingLoop: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Open the Mail Flow Dashboard to see connector status and message flow direction.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use Get-SendConnector and Get-ReceiveConnector to check connector configurations.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario involves a different Exchange component — connectors, rules, OAuth, or domain settings.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Apply the fix using Set- cmdlets and verify with the Mail Flow Dashboard.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        send_connector_wrong: [
            { id: 'hint1', text: 'External mail is failing. The send connector routes outbound mail — check its smart host.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run Get-SendConnector to see all send connectors and their smart host settings.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The "Outbound to Internet" connector points to 10.0.1.99 instead of smtp-relay.ourcompany.com.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: Set-SendConnector fix-smarthost — this updates the smart host to the correct relay address.', cost: 150, penalty: -150 }
        ],
        receive_connector_tls: [
            { id: 'hint1', text: 'Cloud-to-on-prem mail failing with TLS certificate validation error.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run Get-ReceiveConnector to check the TLS certificate configured on the inbound connector.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The receive connector references old thumbprint 99AA88BB77CC. New cert is AB12CD34EF56.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: Set-ReceiveConnector fix-tls — updates the TLS certificate to the new thumbprint.', cost: 150, penalty: -150 }
        ],
        transport_rule_redirect: [
            { id: 'hint1', text: 'All external mail is being copied to compliance. This should only be Legal department senders.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run Get-TransportRule to see the "Legal Hold Copy" rule and check its scope conditions.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The rule applies to "All Users" instead of "Legal Department" group.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: Set-TransportRule fix-scope — restricts the rule back to Legal department senders only.', cost: 150, penalty: -150 }
        ],
        hybrid_wizard_oauth: [
            { id: 'hint1', text: 'Free/busy lookups failing between on-prem and cloud. This uses OAuth.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run Get-IntraOrganizationConnector to check OAuth status and certificate dates.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'The OAuth certificate expired 6 months ago. It needs to be renewed.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: Set-HybridOAuth renew — regenerates the OAuth certificate for hybrid authentication.', cost: 150, penalty: -150 }
        ],
        routing_loop: [
            { id: 'hint1', text: 'Messages looping between on-prem and cloud. Check the accepted domain type.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run Get-AcceptedDomain to see how ourcompany.com is configured in Exchange Online.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Domain type is "Authoritative" — Exchange Online thinks it owns all recipients and bounces unknowns back. Should be "InternalRelay".', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: Set-AcceptedDomain fix-type — changes ourcompany.com to InternalRelay in Exchange Online.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !MAIL003Config._flagRestored) {
            MAIL003Config._flagRestored = true;
            var scenario = MAIL003Config._scenarios[engine.state._scenarioId];
            if (scenario) MAIL003Config.hints = MAIL003Config._scenarioHints[scenario.id] || MAIL003Config._defaultHints;
        }
        return true;
    },

    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._scenarioSelected = true;
        engine.state._sendConnectorWrong = false;
        engine.state._tlsCertMismatch = false;
        engine.state._ruleWrongScope = false;
        engine.state._oauthExpired = false;
        engine.state._routingLoop = false;
        engine.state._labComplete = false;
        engine.state._flagRevealed = false;
        engine.state._fixApplied = false;
        var overrides = MAIL003Config._scenarios[idx].stateOverrides || {};
        for (var key in overrides) { engine.state[key] = overrides[key]; }
        MAIL003Config._flagRestored = true;
        MAIL003Config.hints = MAIL003Config._scenarioHints[MAIL003Config._scenarios[idx].id] || MAIL003Config._defaultHints;
        engine.save();
    },

    _getScenario(engine) { return engine.state._scenarioId == null ? null : MAIL003Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket assigned.\nOpen the Help Desk Ticket first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: {
        biosLines: ['Dell PowerEdge R740 UEFI BIOS v2.12.2', 'Memory Test: 131072 MB OK', 'RAID: PERC H740P (4.8TB)', 'Network: Intel X710 (4x10GbE)', 'Loading Windows Server...'],
        grubEntries: ['Windows Server 2019 Datacenter', 'Windows Recovery'],
        loginUser: 'ExAdmin'
    },

    desktop: {
        icons: [
            { id: 'terminal',    label: 'Exchange\nManagement Shell', icon: 'PS',  app: 'terminal' },
            { id: 'mail_flow',   label: 'Mail Flow\nDashboard',       icon: 'MF',  app: 'mail_flow' },
            { id: 'connectors',  label: 'Connector\nConfig',          icon: 'CON', app: 'connectors' },
            { id: 'msg_trace',   label: 'Message\nTrace',             icon: 'TRC', app: 'msg_trace' },
            { id: 'server_info', label: 'Server\nInfo',               icon: 'SRV', app: 'server_info' },
            { id: 'ticket',      label: 'Help Desk\nTicket',          icon: 'HD',  app: 'ticket' },
            { id: 'hints',       label: 'Hints',                      icon: '?',   app: 'hints' },
            { id: 'reset',       label: 'Reset\nLab',                 icon: 'RST', app: 'reset_lab' }
        ]
    },

    terminal: { user: 'ExAdmin', hostname: 'EXCH-HYB01', startDir: 'C:\\Users\\ExAdmin', promptStyle: 'windows', welcome: 'Microsoft Exchange Management Shell\nExchange Server 2019 CU12\nConnected to EXCH-HYB01.ourcompany.com\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Check the Mail Flow Dashboard for connector and rule status.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use Get- cmdlets to inspect connectors, rules, and domain settings.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario targets a different hybrid component.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Use Set- cmdlets to apply the fix.', cost: 50, penalty: -50 }
    ],
    lore: {
        intro: 'Mail flow in the Exchange hybrid environment is broken. On-premises and cloud mailboxes cannot communicate properly. Diagnose the hybrid configuration issue and restore mail flow.',
        scenario: 'Each scenario simulates a different hybrid mail flow failure. Use Exchange Management Shell commands and the Mail Flow Dashboard to diagnose and fix.',
        outro: 'Hybrid mail flow restored. On-premises and cloud mailboxes can communicate. Your Exchange hybrid expertise resolved the configuration issue.'
    },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read the ticket and examine the mail flow dashboard.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify the hybrid component that is misconfigured.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Apply the fix using Exchange cmdlets.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm mail flow and capture the flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {

        'get-sendconnector': function(args, term, engine) {
            var gate = MAIL003Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = MAIL003Config._getScenario(engine);
            var smartHost = engine.state._sendConnectorWrong ? '10.0.1.99' : 'smtp-relay.ourcompany.com';
            return '\nIdentity                   AddressSpaces              SmartHosts                    Enabled\n--------                   -------------              ----------                    -------\nOutbound to Internet       {SMTP:*;1}                 {' + smartHost + '}             True\nOutbound to O365           {SMTP:ourcompany.mail...}  {ourcompany.mail.protection.outlook.com}  True\nPartner TLS                {SMTP:partnercorp.com;1}   {mx.partnercorp.com}          True\n';
        },

        'get-receiveconnector': function(args, term, engine) {
            var gate = MAIL003Config._requireScenario(engine);
            if (gate) return gate;
            var thumbprint = engine.state._tlsCertMismatch ? '99AA88BB77CC' : 'AB12CD34EF56';
            return '\nIdentity                       Bindings              RemoteIPRanges              TlsCertificateName    Enabled\n--------                       --------              ---------------             ------------------    -------\nDefault Frontend EXCH-HYB01    {0.0.0.0:25}          {0.0.0.0-255.255.255.255}   CN=*.ourcompany.com   True\nInbound from O365              {0.0.0.0:25}          {Microsoft 365 IPs}         Thumbprint:' + thumbprint + '  True\nClient Frontend EXCH-HYB01     {0.0.0.0:587}         {0.0.0.0-255.255.255.255}   CN=*.ourcompany.com   True\n';
        },

        'get-transportrule': function(args, term, engine) {
            var gate = MAIL003Config._requireScenario(engine);
            if (gate) return gate;
            var scope = engine.state._ruleWrongScope ? 'All Users' : 'Legal Department DL';
            return '\nName                  State     Priority   Conditions                                        Actions\n----                  -----     --------   ----------                                        -------\nLegal Hold Copy       Enabled   1          SentBy: ' + scope + '               BlindCopyTo: compliance@ourcompany.com\n                                            SentToScope: NotInOrganization\nDisclaimer Append     Enabled   2          SentToScope: NotInOrganization                    ApplyHtmlDisclaimer\nBlock .exe Attach     Enabled   3          AttachmentExtension: exe,bat,cmd                  RejectMessageReasonText\n';
        },

        'get-intraorganizationconnector': function(args, term, engine) {
            var gate = MAIL003Config._requireScenario(engine);
            if (gate) return gate;
            var expired = engine.state._oauthExpired;
            return '\nIdentity             : HybridIOC\nTargetAddressDomains : {ourcompany.mail.onmicrosoft.com}\nDiscoveryEndpoint    : https://autodiscover-s.outlook.com/autodiscover/autodiscover.svc\nEnabled              : True\nOAuthCertificate     : ' + (expired ? 'EXPIRED (Valid: 2024-09-15 to 2025-09-15)' : 'Valid (2026-01-15 to 2027-01-15)') + '\nOAuthStatus          : ' + (expired ? 'FAILED — certificate expired' : 'OK') + '\n';
        },

        'get-accepteddomain': function(args, term, engine) {
            var gate = MAIL003Config._requireScenario(engine);
            if (gate) return gate;
            var domainType = engine.state._routingLoop ? 'Authoritative' : 'InternalRelay';
            return '\nName                  DomainName              DomainType        Default\n----                  ----------              ----------        -------\nourcompany.com        ourcompany.com          ' + domainType + '    True\nourcompany.onmicrosoft.com  ourcompany.onmicrosoft.com  Authoritative  False\n' + (engine.state._routingLoop ? '\nWARNING: ourcompany.com is set to Authoritative. In a hybrid deployment, this should be InternalRelay\nto allow mail routing to on-premises mailboxes that are not yet migrated.\n' : '');
        },

        'get-transportservice': function(args, term, engine) {
            var gate = MAIL003Config._requireScenario(engine);
            if (gate) return gate;
            return '\nName                 : EXCH-HYB01\nExternalDNSServers   : {8.8.8.8, 8.8.4.4}\nInternalDNSServers   : {10.0.1.2}\nOutboundConnectionFailureRetryInterval : 00:10:00\nMessageExpirationTimeout               : 2.00:00:00\nMaxOutboundConnections                 : 1000\n';
        },

        'set-sendconnector': function(args, term, engine) {
            var gate = MAIL003Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = MAIL003Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (scenario.id === 'send_connector_wrong' && (joined.includes('fix') || joined.includes('smtp-relay') || joined.includes('smarthost'))) {
                engine.state._sendConnectorWrong = false;
                engine.state._fixApplied = true;
                engine.state._flagRevealed = true;
                engine.state._labComplete = true;
                engine.save();
                setTimeout(function() { engine.notify('Send connector updated. Smart host restored to smtp-relay.ourcompany.com. Check Mail Flow Dashboard for the recovery token.', 'success'); }, 400);
                return '\nWARNING: The command completed successfully.\nSend connector "Outbound to Internet" updated:\n  SmartHosts: {smtp-relay.ourcompany.com}\n';
            }
            return '\nUsage: Set-SendConnector fix-smarthost\n       Set-SendConnector -Identity "name" -SmartHosts "host"\n';
        },

        'set-receiveconnector': function(args, term, engine) {
            var gate = MAIL003Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = MAIL003Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (scenario.id === 'receive_connector_tls' && (joined.includes('fix') || joined.includes('ab12cd34ef56') || joined.includes('tls'))) {
                engine.state._tlsCertMismatch = false;
                engine.state._fixApplied = true;
                engine.state._flagRevealed = true;
                engine.state._labComplete = true;
                engine.save();
                setTimeout(function() { engine.notify('Receive connector TLS certificate updated. Cloud-to-on-prem mail flow restored. Check Mail Flow Dashboard.', 'success'); }, 400);
                return '\nReceive connector "Inbound from O365" updated:\n  TlsCertificateName: Thumbprint:AB12CD34EF56\n';
            }
            return '\nUsage: Set-ReceiveConnector fix-tls\n       Set-ReceiveConnector -Identity "name" -TlsCertificateName "thumbprint"\n';
        },

        'set-transportrule': function(args, term, engine) {
            var gate = MAIL003Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = MAIL003Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (scenario.id === 'transport_rule_redirect' && (joined.includes('fix') || joined.includes('legal') || joined.includes('scope'))) {
                engine.state._ruleWrongScope = false;
                engine.state._fixApplied = true;
                engine.state._flagRevealed = true;
                engine.state._labComplete = true;
                engine.save();
                setTimeout(function() { engine.notify('Transport rule scope fixed. Only Legal department senders will trigger the rule. Check Mail Flow Dashboard.', 'success'); }, 400);
                return '\nTransport rule "Legal Hold Copy" updated:\n  SentBy: Legal Department DL\n  (Previously: All Users)\n';
            }
            return '\nUsage: Set-TransportRule fix-scope\n       Set-TransportRule -Identity "name" -From "group"\n';
        },

        'set-hybridoauth': function(args, term, engine) {
            var gate = MAIL003Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = MAIL003Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (scenario.id === 'hybrid_wizard_oauth' && (joined.includes('renew') || joined.includes('fix') || joined.includes('oauth'))) {
                engine.state._oauthExpired = false;
                engine.state._fixApplied = true;
                engine.state._flagRevealed = true;
                engine.state._labComplete = true;
                engine.save();
                setTimeout(function() { engine.notify('OAuth certificate renewed. Free/busy lookups restored. Check Mail Flow Dashboard.', 'success'); }, 400);
                return '\nOAuth certificate renewed successfully.\n  New validity: 2026-03-30 to 2027-03-30\n  IntraOrganizationConnector status: OK\n  Free/busy lookups: Operational\n';
            }
            return '\nUsage: Set-HybridOAuth renew\n';
        },

        'set-accepteddomain': function(args, term, engine) {
            var gate = MAIL003Config._requireScenario(engine);
            if (gate) return gate;
            var scenario = MAIL003Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (scenario.id === 'routing_loop' && (joined.includes('fix') || joined.includes('internalrelay') || joined.includes('relay'))) {
                engine.state._routingLoop = false;
                engine.state._fixApplied = true;
                engine.state._flagRevealed = true;
                engine.state._labComplete = true;
                engine.save();
                setTimeout(function() { engine.notify('Accepted domain changed to InternalRelay. Routing loop resolved. Check Mail Flow Dashboard.', 'success'); }, 400);
                return '\nAccepted domain "ourcompany.com" updated:\n  DomainType: InternalRelay\n  (Previously: Authoritative)\n  Mail will now route to on-premises for unmatched recipients.\n';
            }
            return '\nUsage: Set-AcceptedDomain fix-type\n       Set-AcceptedDomain -Identity "domain" -DomainType InternalRelay\n';
        },

        'test-mailflow': function(args, term, engine) {
            var gate = MAIL003Config._requireScenario(engine);
            if (gate) return gate;
            if (engine.state._fixApplied) {
                return '\nTest-Mailflow Results:\n  Source: EXCH-HYB01\n  Result: Success\n  MessageLatencyTime: 00:00:02.341\n  IsRemoteTest: True\n';
            }
            var scenario = MAIL003Config._getScenario(engine);
            var errors = {
                send_connector_wrong: 'Result: FAILURE\nError: 550 5.4.1 Smart host 10.0.1.99 rejected the connection.',
                receive_connector_tls: 'Result: FAILURE\nError: 454 4.7.5 Certificate validation failure on inbound connector.',
                transport_rule_redirect: 'Result: Success (but transport rule "Legal Hold Copy" is copying ALL external mail to compliance)',
                hybrid_wizard_oauth: 'Result: Partial — mail flow OK but free/busy lookup FAILED (OAuth expired)',
                routing_loop: 'Result: FAILURE\nError: 554 5.4.6 Hop count exceeded — routing loop detected.'
            };
            return '\nTest-Mailflow Results:\n  Source: EXCH-HYB01\n  ' + (errors[scenario.id] || 'Result: Unknown error') + '\n';
        },

        ping: function(args, term, engine) {
            var gate = MAIL003Config._requireScenario(engine);
            if (gate) return gate;
            if (!args.length) return '\nUsage: ping target\n';
            var target = args[args.length - 1];
            return '\nPinging ' + target + ' with 32 bytes of data:\nReply from ' + target + ': bytes=32 time=2ms TTL=128\nReply from ' + target + ': bytes=32 time=1ms TTL=128\n\nPing statistics for ' + target + ':\n    Packets: Sent = 2, Received = 2, Lost = 0\n';
        },

        whoami: function() { return 'OURCOMPANY\\ExAdmin'; },
        hostname: function() { return 'EXCH-HYB01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        dir: function() { return ' Directory of C:\\Users\\ExAdmin\n\n03/30/2026  07:00 AM    <DIR>          Desktop\n03/30/2026  07:00 AM    <DIR>          Documents\n'; },
        ifconfig: function() { return '\'ifconfig\' is not recognized as an internal or external command.'; },
        sudo: function() { return '\'sudo\' is not recognized as an internal or external command.'; }
    },

    onAppLaunch(iconDef, engine) {
        var requireTicket = ['mail_flow', 'connectors', 'msg_trace', 'server_info'];
        if (requireTicket.includes(iconDef.app) && !engine.state._scenarioSelected) { engine.notify('Open the Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket':      MAIL003Config._openTicket(iconDef, engine); break;
            case 'mail_flow':   MAIL003Config._openMailFlow(iconDef, engine); break;
            case 'connectors':  MAIL003Config._openConnectors(iconDef, engine); break;
            case 'msg_trace':   MAIL003Config._openMsgTrace(iconDef, engine); break;
            case 'server_info': MAIL003Config._openServerInfo(iconDef, engine); break;
            case 'reset_lab':   MAIL003Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        MAIL003Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) { MAIL003Config._renderTicket(engine, c); } else { MAIL003Config._renderPicker(engine, c); }
    },

    _renderPicker(engine, container) {
        var previews = ['Dave Morton — "On-prem external mail failing — smart host wrong"', 'Lisa Chung — "Cloud-to-on-prem bouncing — TLS cert mismatch"', 'Nancy Barker — "All external mail being copied to compliance"', 'Chris Patel — "Calendar free/busy broken between on-prem and cloud"', 'Wei Zhang — "On-prem to cloud emails looping — hop count exceeded"'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#10b981; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">HYBRID MAIL QUEUE</div><div style="color:#888; font-size:0.75rem;">Select a ticket or get a random assignment.</div></div><div style="margin-bottom:16px;">';
        MAIL003Config._scenarios.forEach(function(s, i) {
            html += '<button class="mail003-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><div style="display:flex; justify-content:space-between;"><span style="color:#10b981; font-weight:bold;">HYB-' + (1000 + i) + '</span><span style="background:#e74c3c; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">URGENT</span></div><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div></button>';
        });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="mail003RandBtn" style="padding:10px 28px; background:#10b981; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random Assignment</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.mail003-btn').forEach(function(b) {
            b.addEventListener('mouseenter', function() { this.style.borderColor = '#10b981'; });
            b.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.12)'; });
            b.addEventListener('click', function() { MAIL003Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); MAIL003Config._renderTicket(engine, container); });
        });
        document.getElementById('mail003RandBtn').addEventListener('click', function() { MAIL003Config._applyScenario(engine, Math.floor(Math.random() * MAIL003Config._scenarios.length)); MAIL003Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var s = MAIL003Config._getScenario(engine);
        var subs = ['Dave Morton — Exchange Admin', 'Lisa Chung — Help Desk Tier 2', 'Nancy Barker — Compliance Officer', 'Chris Patel — HR Manager', 'Wei Zhang — Network Engineer'];
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><div style="display:flex; justify-content:space-between;"><span style="color:#10b981; font-weight:bold;">HYBRID TICKET #HYB-' + (1000 + engine.state._scenarioId) + '</span><span style="background:#e74c3c; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">URGENT</span></div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBMITTED BY</div><div>' + subs[engine.state._scenarioId] + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + MAIL003Config._escHtml(s.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + MAIL003Config._escHtml(s.ticketDetail) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#a7f3d0;">' + MAIL003Config._escHtml(s.ticketExtra) + '</div></div>'
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#888; font-size:0.7rem;">ASSIGNED TO</div><div style="color:#10b981; font-weight:bold;">YOU — Exchange Hybrid Administrator</div></div>';
    },

    _openMailFlow(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); MAIL003Config._renderMailFlow(engine); return; }
        var c = document.createElement('div'); c.id = 'mfContainer';
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Mail Flow Dashboard', 'MF', c);
        MAIL003Config._renderMailFlow(engine);
    },

    _renderMailFlow(engine) {
        var c = document.getElementById('mfContainer'); if (!c) return;
        var s = MAIL003Config._getScenario(engine);
        var html = '<div style="font-size:1rem; font-weight:bold; color:#10b981; margin-bottom:16px;">Mail Flow Dashboard &mdash; Hybrid Environment</div>';
        if (engine.state._fixApplied) {
            html += '<div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); border-radius:4px; padding:16px; text-align:center; margin-bottom:16px;"><div style="color:#10b981; font-weight:bold; font-size:1.1rem;">Mail Flow: Healthy</div><div style="color:#a7f3d0;">All connectors operational. Hybrid mail flow restored.</div></div>';
            if (engine.state._flagRevealed) {
                html += '<div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); border-radius:4px; padding:12px;"><div style="color:#10b981; font-weight:bold;">Fix Confirmed:</div><div id="mail003-flag" style="color:#c8e6c9;">Recovery token: loading...</div></div>';
            }
        } else {
            var statusMap = {
                send_connector_wrong: { status: 'DEGRADED', detail: 'Send connector "Outbound to Internet" — smart host 10.0.1.99 UNREACHABLE' },
                receive_connector_tls: { status: 'DEGRADED', detail: 'Receive connector "Inbound from O365" — TLS certificate validation FAILED' },
                transport_rule_redirect: { status: 'WARNING', detail: 'Transport rule "Legal Hold Copy" — applying to ALL USERS instead of Legal only' },
                hybrid_wizard_oauth: { status: 'PARTIAL', detail: 'OAuth certificate EXPIRED — free/busy lookups failing cross-premises' },
                routing_loop: { status: 'CRITICAL', detail: 'Routing loop detected — ourcompany.com accepted domain type: Authoritative (should be InternalRelay)' }
            };
            var st = statusMap[s.id];
            html += '<div style="background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; padding:16px; margin-bottom:16px;"><div style="color:#e74c3c; font-weight:bold; font-size:1.1rem;">Status: ' + st.status + '</div><div style="color:#ffcc80; margin-top:4px;">' + st.detail + '</div></div>';
        }
        c.innerHTML = html;
        if (engine.state._flagRevealed && engine.state._fixApplied) {
            BoxEngine.requestFlagText(s.id).then(function(ft) { var el = document.getElementById('mail003-flag'); if (el) el.textContent = 'Recovery token: ' + (ft || 'Flag unavailable'); });
        }
    },

    _openConnectors(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Connector Config', 'CON', c);
        c.innerHTML = '<div style="font-size:1rem; font-weight:bold; color:#10b981; margin-bottom:16px;">Connector Configuration</div><div style="font-size:0.75rem; color:#888;">Use Get-SendConnector, Get-ReceiveConnector, Get-TransportRule, Get-IntraOrganizationConnector, and Get-AcceptedDomain in the Exchange Management Shell for live data.</div>';
    },

    _openMsgTrace(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Message Trace', 'TRC', c);
        var s = MAIL003Config._getScenario(engine);
        var traceMap = {
            send_connector_wrong: 'user@ourcompany.com -> client@external.com\nStatus: FAILED\nError: 550 5.4.1 Smart host 10.0.1.99 rejected — connection refused.\nConnector: Outbound to Internet',
            receive_connector_tls: 'cloud.user@ourcompany.com -> onprem.user@ourcompany.com\nStatus: FAILED\nError: 454 4.7.5 Certificate validation failure on Inbound from O365 connector.\nThumbprint mismatch: expected AB12CD34EF56, got 99AA88BB77CC',
            transport_rule_redirect: 'anyone@ourcompany.com -> client@external.com\nStatus: Delivered (with redirect)\nAction: BlindCopyTo compliance@ourcompany.com (applied by "Legal Hold Copy" rule)\nNote: Rule scope is ALL USERS — should be Legal Department only',
            hybrid_wizard_oauth: 'onprem.user -> cloud.user (Free/Busy request)\nStatus: FAILED\nError: OAuth token expired. IntraOrganizationConnector authentication failed.',
            routing_loop: 'onprem.user@ourcompany.com -> cloud.user@ourcompany.com\nHop 1: EXCH-HYB01 -> ourcompany.mail.protection.outlook.com\nHop 2: EOP -> EXCH-HYB01 (Authoritative domain — route back)\nHop 3: EXCH-HYB01 -> EOP (loop)\n...\nStatus: FAILED — 554 5.4.6 Hop count exceeded'
        };
        c.innerHTML = '<div style="font-size:1rem; font-weight:bold; color:#10b981; margin-bottom:16px;">Message Trace</div><div style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; font-size:0.75rem; white-space:pre-wrap;">' + MAIL003Config._escHtml(traceMap[s.id] || 'No trace data') + '</div>';
    },

    _openServerInfo(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Server Info', 'SRV', c);
        c.innerHTML = '<div style="font-size:1rem; font-weight:bold; color:#10b981; margin-bottom:16px;">Hybrid Infrastructure</div><div style="font-size:0.75rem; color:#aaa; line-height:1.8;"><div>On-Prem: EXCH-HYB01 (10.0.1.20) — Exchange 2019 CU12</div><div>Cloud: Microsoft 365 E3 — Exchange Online</div><div>Relay: smtp-relay.ourcompany.com (198.51.100.10)</div><div>Wildcard Cert: *.ourcompany.com (Thumbprint: AB12CD34EF56)</div><div>OAuth: IntraOrganizationConnector — HybridIOC</div><div>Accepted Domain: ourcompany.com</div></div>';
    },

    _confirmReset(engine) {
        var o = document.createElement('div');
        o.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        o.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px 32px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9; max-width:360px;"><div style="font-size:1rem; font-weight:bold; margin-bottom:12px; color:#e74c3c;">Reset Lab?</div><div style="font-size:0.8rem; color:#aaa; margin-bottom:20px;">Clear all progress and restart.</div><div style="display:flex; gap:12px; justify-content:center;"><button id="m3rc" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="m3cc" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(o);
        document.getElementById('m3rc').addEventListener('click', function() { MAIL003Config._flagRestored = false; MAIL003Config.hints = MAIL003Config._defaultHints; engine.reset(); });
        document.getElementById('m3cc').addEventListener('click', function() { o.remove(); });
        o.addEventListener('click', function(e) { if (e.target === o) o.remove(); });
    }
};
